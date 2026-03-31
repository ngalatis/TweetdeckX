# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TweetDeckX is a Chrome extension (Manifest V3) that recreates TweetDeck-style multi-column layout for X (formerly Twitter). It embeds x.com pages in iframes within an extension-hosted deck page, using the user's existing browser session — no API keys or third-party servers.

## Development

This is an unpacked Chrome extension with no build step. To develop:

1. Open `chrome://extensions`, enable Developer mode
2. "Load unpacked" pointing at this project directory
3. Edit files directly; click the extension's reload button (or reload from chrome://extensions) to pick up changes
4. The extension has been publicly released in a github repo. From now on you should create branches following the feature branching techniques, commit and push there. A user-in-the-loop will create and merge pull requests with master.

## Architecture

The extension has four layers that work together to embed x.com inside iframes:

### 1. Background Service Worker (`background.js`)
- Opens `deck.html` in a tab when the extension icon is clicked (singleton — reuses existing tab)
- **CSRF token bridge**: reads the `ct0` cookie via `chrome.cookies` API and injects it as an `x-csrf-token` request header on API calls using dynamic declarativeNetRequest rules (IDs 1000-1001). This is critical because cookie partitioning in iframes causes CSRF mismatches.
- **Cookie bridge**: responds to `tweetdeckx-get-cookies` messages from content scripts with non-httpOnly `.x.com` cookies so iframes can inject them into `document.cookie`

### 2. Declarative Net Request Rules (`rules.json`)
Static rules (IDs 1-10) that:
- Strip `x-frame-options` and `content-security-policy` headers from x.com/twitter.com/twimg.com responses (IDs 1-4) so they can be iframed
- Spoof `Sec-Fetch-*` request headers on x.com sub_frame requests to look like top-level navigation (IDs 5-6) so X.com's server-side frame detection doesn't block the load
- Redirect X.com telemetry endpoints (`error_log.json`, `user_flow.json`, `promoted_content/log.json`, `dm/user_updates.json`) to a local `stub.json` (IDs 7-10) — these are analytics/polling that eat rate limit budget for zero user benefit. We redirect instead of block because hard-blocking causes `ERR_BLOCKED_BY_CLIENT` network errors that X.com's JS doesn't handle gracefully, breaking in-page navigation (e.g., profile tab switches).

### 3. Page Context Script (`page-context.js`) + Content Script (`content.js` + `content.css`)
Two content scripts injected into x.com iframes at `document_start`:
- **`page-context.js`** (MAIN world — runs in the page's JS context, bypasses CSP):
  - Redefines `window.top`, `window.parent`, `window.frameElement` to spoof as top-level window (defeats client-side frame-busting)
  - Wraps `setInterval`/`clearInterval` with pause/resume support — listens for `tweetdeckx-pause` and `tweetdeckx-resume` postMessages to freeze/unfreeze all intervals. This is how we stop hidden iframes from polling X.com.
- **`content.js`** (ISOLATED world — has access to `chrome.runtime` APIs):
  - Bridges cookies from the background script
- **Phase 2**: Listens for postMessages: `tweetdeckx-init` (apply compact styles), `tweetdeckx-set-column-width`, `tweetdeckx-back` (calls `history.back()`), `tweetdeckx-pause`/`tweetdeckx-resume` (forwarded to the injected page-context script)
- **Phase 3**: Intercepts clicks on external links to open them in new tabs instead of navigating the iframe

### 4. Deck UI (`deck.html` + `deck.js` + `deck.css`)
The main multi-column interface, served as `chrome-extension://` page:
- **Pages** are the top-level organizational unit. Each page has an id, name, emoji icon, and owns an array of columns. Users create pages to group columns by topic (e.g., "Home", "Investments", "Tech").
- **Sidebar** shows page emoji tabs (click to switch, right-click to edit, drag to reorder). The + button creates a new page via a modal with an emoji picker.
- **Page switching** uses an LRU DOM cache (effectively unlimited, `PAGE_CACHE_MAX = 1000`). Page wrappers stay in the DOM with `display: none` — iframes are NEVER detached/reattached (Chrome reloads iframes when moved in DOM). Cold loads use randomized 1-2s stagger delays and IntersectionObserver lazy loading.
- **Column types** defined in `COLUMN_TYPES` object: home, explore, notifications, messages, bookmarks, search, user, list, likes, custom URL
- **State** persisted in `chrome.storage.local` under a single `tweetdeckx_state` key containing `{ pages[], activePageId, settings }`.
- Columns rendered as iframes pointing to x.com URLs, stagger-loaded (200ms delay per column)
- Drag-and-drop reordering via native HTML5 drag API on both page tabs and column headers
- Move column between pages via dropdown in column header
- Three themes: dark (default), dim, light — controlled via `data-theme` attribute on `<html>` with CSS custom properties
- Settings: column width (320-700px slider), theme selector, reset all pages

## Key Technical Considerations

- **Cookie partitioning** is the main technical challenge. The background script's CSRF rule updates and the content script's cookie injection must stay in sync. If the `ct0` cookie changes (e.g., user logs out/in), `updateCsrfRules()` is triggered by `chrome.cookies.onChanged`.
- **Frame-busting** is defeated at two levels: server-side (header stripping + Sec-Fetch spoofing in rules.json) and client-side (window.top/parent redefinition in content.js). Both are required.
- All state lives in a single `state` object in `deck.js` with `{ pages[], activePageId, settings }`. Each page has `{ id, name, emoji, columns[] }` and each column has `{ id, type, param, title }`. Persisted as one `tweetdeckx_state` key in `chrome.storage.local`. IDs are generated with `Date.now()` + random suffix.
- The content script only activates inside iframes (`window === window.top` early return at top).

## X.com Rate Limiting — Ongoing Challenge

This is the biggest ongoing technical challenge after cookie partitioning. X.com rate limits API requests aggressively (429 responses with `{"errors":[{"message":"Rate limit exceeded","code":88}]}`). Each iframe is a full X.com instance with its own polling loops.

### The problem
Each X.com iframe independently polls multiple endpoints on `setInterval`:
- `badge_count/badge_count.json` — notification badge (every ~10-15s per iframe)
- `dm/user_updates.json` — DM polling (every ~10-15s per iframe)
- `fleets/v1/avatar_content` — Spaces status
- `error_log.json`, `user_flow.json` — telemetry (now redirected to stub via rules.json)
- `NotificationsTimeline` GraphQL — notification refreshes

With N iframes, these multiply: 12 columns = ~72+ badge_count requests per minute, which quickly hits rate limits.

### What we've done so far
1. **LRU page cache with `display: none`** — iframes stay in DOM, no reload on page switch. CRITICAL: never detach/reattach iframe DOM nodes — Chrome reloads them.
2. **setInterval wrapper in `page-context.js`** — registered as a `world: "MAIN"` content script to bypass CSP. Wraps `setInterval`/`clearInterval` to support pause/resume via postMessage. This is how we freeze polling in hidden iframes.
3. **Pause-all-by-default** — all columns are paused by default. A column resumes only when the user clicks into it or scrolls over it (becomes "active"), and auto-pauses after 45 seconds of no mouse activity over the column. Only one column can be active at a time. Managed by `activateColumn()` / `deactivateActiveColumn()` in deck.js.
4. **5-minute lazy refresh** — visible paused columns get a brief resume-then-pause burst (~3 seconds) every 5 minutes so content stays reasonably fresh without constant polling.
5. **Redirected telemetry & waste** — `error_log.json`, `user_flow.json`, `promoted_content/log.json`, and `dm/user_updates.json` are redirected to a local `stub.json` via declarativeNetRequest rules (IDs 7-10). We redirect instead of block because hard-blocking causes `ERR_BLOCKED_BY_CLIENT` errors that break X.com's in-page navigation (e.g., profile tab switches).
6. **Randomized stagger** — cold loads use 1-2s random delays between columns to avoid burst patterns.
7. **429 detection** — `background.js` monitors `webRequest.onCompleted` for 429 status codes and sends `tweetdeckx-rate-limited` message to deck.js, which shows a toast and pauses pending loads.
8. **Debounced CSRF rule updates** — `updateCsrfRules()` is debounced with a 1-second delay to prevent 50+ redundant updates during iframe loading.

### What we tried that didn't work
- **`iframe.allow = "autoplay 'none'"` for video autoplay** — Permissions Policy wasn't enforced in our context.
- **Overriding `HTMLMediaElement.prototype.play()` in content script** — X.com's video player bypassed all JS-level overrides (play() override, autoplay property lock, play/timeupdate event listeners). X.com likely uses a non-standard playback mechanism or saves references before our overrides.
- **Detaching/reattaching iframe DOM nodes for caching** — Chrome reloads the iframe src when nodes are moved in the DOM, defeating the cache entirely. Fixed by using `display: none` toggling instead.

### Key rate limit numbers (approximate, undocumented)
- X.com's internal GraphQL endpoints have undocumented rate limits
- Public API baseline: HomeTimeline ~180 req/15min, UserTweets ~900 req/15min
- Rate limit windows are rolling 15-minute intervals
- Once a 429 hits, X.com's own retry logic inside the iframe cascades more 429s — the `badge_count` endpoint is the worst offender

### Future directions to explore
- Memory-pressure-based eviction using `chrome.system.memory` API (monitor RAM, only evict when low)
- Further reducing background requests from X.com's JS within iframes
- Request-level caching/deduplication in the service worker (complex, fragile — X.com changes internal APIs frequently)
