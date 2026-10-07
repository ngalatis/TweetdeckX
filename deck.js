// =========================================
// TweetDeckX - Multi-Column X Client
// =========================================

(function () {
  'use strict';

  // -----------------------------------------
  // Column type definitions
  // -----------------------------------------

  const COLUMN_TYPES = {
    home:          { label: 'Home',          url: 'https://x.com/home',            icon: 'home',    needsInput: false },
    explore:       { label: 'Explore',       url: 'https://x.com/explore',         icon: 'explore', needsInput: false },
    notifications: { label: 'Notifications', url: 'https://x.com/notifications',   icon: 'bell',    needsInput: false },
    messages:      { label: 'Messages',      url: 'https://x.com/messages',        icon: 'message', needsInput: false },
    bookmarks:     { label: 'Bookmarks',     url: 'https://x.com/i/bookmarks',     icon: 'bookmark',needsInput: false },
    search:        { label: 'Search',        url: null,                             icon: 'search',  needsInput: true,  inputLabel: 'Search query',    placeholder: 'e.g. #javascript' },
    user:          { label: 'User',          url: null,                             icon: 'user',    needsInput: true,  inputLabel: 'Username',         placeholder: 'e.g. elonmusk' },
    list:          { label: 'List',          url: null,                             icon: 'list',    needsInput: true,  inputLabel: 'List URL or ID',   placeholder: 'e.g. https://x.com/i/lists/123 or 123' },
    likes:         { label: 'Likes',         url: null,                             icon: 'heart',   needsInput: true,  inputLabel: 'Username',         placeholder: 'e.g. elonmusk' },
    url:           { label: 'Custom URL',    url: null,                             icon: 'link',    needsInput: true,  inputLabel: 'X.com URL',        placeholder: 'https://x.com/...' },
  };

  // -----------------------------------------
  // Icon SVG snippets
  // -----------------------------------------

  const ICONS = {
    home:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    explore:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polygon points="3,11 22,2 13,21 11,13" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    bell:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    message:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search:   '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    user:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>',
    list:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>',
    bookmark: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    heart:    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    link:     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    refresh:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="23 4 23 10 17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    move:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    back:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    menu:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
  };

  // -----------------------------------------
  // Emoji data (see vendor/emojibase/SOURCE.txt)
  // -----------------------------------------

  // Bumping this invalidates the cached derived index on next deck open.
  // Bump whenever vendor/emojibase/compact.json is refreshed.
  const EMOJI_DATA_VERSION = 'v1';
  const EMOJI_CACHE_KEY = `tweetdeckx_emoji_cache_${EMOJI_DATA_VERSION}`;

  // Tiny fallback pool used only when:
  //   (a) the real data hasn't finished loading yet during deck boot, or
  //   (b) the fetch of compact.json failed for some reason.
  // Must stay small and self-contained.
  const FALLBACK_EMOJI_POOL = [
    '🏠','⭐','🔥','💡','📌','📝','🎯','🚀',
    '💬','❤️','👍','🎉','🌟','📊','🔔','☕',
    '🎨','🧠','💼','📚',
  ];

  // Loaded asynchronously by loadEmojiData() in init().
  // Shape when loaded: { categories: [...], searchIndex: [...] }
  let emojiData = null;
  let emojiDataPromise = null;

  // Title-case a string for display. messages.json in emojibase v17 uses
  // lowercase group labels ("smileys & emotion"); the old picker used
  // title case, so match the existing aesthetic.
  function titleCaseLabel(s) {
    return String(s || '').replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.slice(1));
  }

  // Build the derived { categories, searchIndex } structures from the
  // raw compact.json + messages.json payloads.
  //
  // compact.json entry shape in emojibase v17:
  //   { hexcode, label, unicode, group?, order?, tags?, skins?, emoticon? }
  // Note: `group`/`order`/`tags` are absent on ~26 regional-indicator
  // entries (standalone A-Z letters used to compose country flags) -
  // we filter those out by requiring a numeric `group`.
  //
  // messages.json groups shape in emojibase v17:
  //   { key: 'smileys-emotion', message: 'smileys & emotion', order: 0 }
  // The `order` field is the group number that compact.json entries reference.
  function buildEmojiIndex(compact, messages) {
    // Map group number -> human label using messages.json.
    const groupLabels = {};
    for (const g of messages.groups) {
      groupLabels[g.order] = titleCaseLabel(g.message);
    }

    // Bucket emojis by group, excluding group 2 ('components' - skin tones
    // and hair components, not pickable on their own).
    const EXCLUDED_GROUP = 2;
    const buckets = {}; // group number -> array of entries
    const searchIndex = [];

    for (const entry of compact) {
      if (typeof entry.group !== 'number') continue; // skips regional indicators
      if (entry.group === EXCLUDED_GROUP) continue;

      (buckets[entry.group] = buckets[entry.group] || []).push(entry);

      // Build the search index entry. Lowercase everything once so
      // search doesn't re-lowercase on every keystroke.
      const tags = Array.isArray(entry.tags) ? entry.tags.map(t => String(t).toLowerCase()) : [];
      searchIndex.push({
        unicode: entry.unicode,
        label: String(entry.label || '').toLowerCase(),
        tags,
      });
    }

    // Sort each bucket by `order` so the picker displays emojis in the
    // official CLDR sort order.
    const categories = [];
    const sortedGroupIds = Object.keys(buckets).map(Number).sort((a, b) => a - b);
    for (const gid of sortedGroupIds) {
      const entries = buckets[gid].slice().sort((a, b) => (a.order || 0) - (b.order || 0));
      categories.push({
        id: gid,
        label: groupLabels[gid] || `Group ${gid}`,
        emojis: entries.map(e => e.unicode),
      });
    }

    return { categories, searchIndex };
  }

  // Read the derived index from chrome.storage.local if present and
  // version-matching, otherwise return null.
  function readEmojiCache() {
    return new Promise((resolve) => {
      chrome.storage.local.get([EMOJI_CACHE_KEY], (data) => {
        const cached = data[EMOJI_CACHE_KEY];
        if (cached && cached.version === EMOJI_DATA_VERSION
            && Array.isArray(cached.categories) && Array.isArray(cached.searchIndex)) {
          resolve(cached);
        } else {
          resolve(null);
        }
      });
    });
  }

  function writeEmojiCache(data) {
    chrome.storage.local.set({
      [EMOJI_CACHE_KEY]: {
        version: EMOJI_DATA_VERSION,
        categories: data.categories,
        searchIndex: data.searchIndex,
      },
    });
  }

  // Load the emoji dataset. Runs at most once per deck session.
  // Returns a promise that resolves once `emojiData` is populated
  // (either from cache or from the vendored JSON files). If the
  // fetch fails, `emojiData` stays null and the picker falls back
  // to FALLBACK_EMOJI_POOL.
  function loadEmojiData() {
    if (emojiData) return Promise.resolve(emojiData);
    if (emojiDataPromise) return emojiDataPromise;

    emojiDataPromise = (async () => {
      // 1. Try cache first.
      try {
        const cached = await readEmojiCache();
        if (cached) {
          emojiData = { categories: cached.categories, searchIndex: cached.searchIndex };
          return emojiData;
        }
      } catch (err) {
        console.warn('[TweetDeckX] emoji cache read failed:', err);
      }

      // 2. Cache miss - fetch the vendored files.
      try {
        const [compactResp, messagesResp] = await Promise.all([
          fetch('vendor/emojibase/compact.json'),
          fetch('vendor/emojibase/messages.json'),
        ]);
        if (!compactResp.ok || !messagesResp.ok) {
          throw new Error(`fetch failed: compact=${compactResp.status} messages=${messagesResp.status}`);
        }
        const [compact, messages] = await Promise.all([
          compactResp.json(),
          messagesResp.json(),
        ]);
        const built = buildEmojiIndex(compact, messages);
        emojiData = built;
        writeEmojiCache(built);
        return emojiData;
      } catch (err) {
        console.warn('[TweetDeckX] emoji data load failed, using fallback pool:', err);
        emojiData = null; // explicit: picker will fall back
        return null;
      }
    })();

    return emojiDataPromise;
  }

  // -----------------------------------------
  // Utility functions
  // -----------------------------------------

  function randomEmoji() {
    if (emojiData && emojiData.searchIndex && emojiData.searchIndex.length) {
      const idx = Math.floor(Math.random() * emojiData.searchIndex.length);
      return emojiData.searchIndex[idx].unicode;
    }
    if (FALLBACK_EMOJI_POOL.length) {
      return FALLBACK_EMOJI_POOL[Math.floor(Math.random() * FALLBACK_EMOJI_POOL.length)];
    }
    return '🏠';
  }

  function generateId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Parses an SVG source string into a detached Element. Used when we want to
  // inject a trusted static icon into a DOM tree built with createElement,
  // without touching the element's inner markup via string APIs.
  function svgFromString(svgSource) {
    const range = document.createRange();
    const fragment = range.createContextualFragment(svgSource);
    return fragment.firstElementChild;
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
  }

  // -----------------------------------------
  // State
  // -----------------------------------------

  let state = {
    pages: [],
    activePageId: null,
    settings: { columnWidth: 420, theme: 'dark', hideAds: false, hideColumnHeader: false, keyboardShortcuts: false, notificationsPanel: false },
  };

  // -----------------------------------------
  // LRU page cache (display:none approach)
  // -----------------------------------------

  const pageCache = new Map(); // Map<pageId, { wrapper: HTMLElement, lastAccessed: number }>
  const PAGE_CACHE_MAX = 1000; // effectively unlimited — lower this if RAM becomes an issue

  function getActiveWrapper() {
    return columnsContainer.querySelector('.page-wrapper:not(.hidden)') || null;
  }

  function evictLruPages() {
    while (pageCache.size > PAGE_CACHE_MAX) {
      let oldestKey = null;
      let oldestTime = Infinity;
      for (const [key, entry] of pageCache) {
        if (key === state.activePageId) continue; // never evict the active page
        if (entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = key;
        }
      }
      if (oldestKey) {
        const entry = pageCache.get(oldestKey);
        if (entry.wrapper.parentNode) {
          entry.wrapper.remove();
        }
        pageCache.delete(oldestKey);
      } else {
        break; // safety: all remaining entries are the active page
      }
    }
  }

  function invalidateCache(pageId) {
    const entry = pageCache.get(pageId);
    if (!entry) return;
    if (entry.wrapper.parentNode) {
      entry.wrapper.remove();
    }
    pageCache.delete(pageId);
  }

  function clearAllCache() {
    for (const [, entry] of pageCache) {
      if (entry.wrapper.parentNode) {
        entry.wrapper.remove();
      }
    }
    pageCache.clear();
  }

  // -----------------------------------------
  // Stagger & rate-limit state
  // -----------------------------------------

  let pendingStaggerTimers = [];

  // Rate-limit budget, reported by background.js from X's own
  // x-rate-limit-* and backoff-policy response headers. Limits are per
  // user and per endpoint, in 15 minute windows, so every column that hits
  // the same endpoint shares one budget.
  const rateLimits = {};        // op -> { limit, remaining, reset (unix s), at (ms) }
  const columnOps = new Map();  // Map<columnId, Set<op>> endpoints a column has actually fetched its posts from
  let rateLimitedUntil = 0;     // ms; from a 429 with no identifiable endpoint
  let backoffUntil = 0;         // ms; from a backoff-policy header
  let lastRateLimitToastKey = null; // "op:reset" of the last 429 shown, so one 429 makes one toast
  let deferredLoadTimer = null;  // retry for columns waiting on a budget
  let budgetIndicatorTimer = null;
  const BUDGET_RESERVE = 3;     // calls per endpoint kept back for the user's own clicks

  function isThrottled() {
    return Date.now() < Math.max(rateLimitedUntil, backoffUntil);
  }

  // Top-level paths that are X features rather than user profiles
  const RESERVED_PATHS = new Set([
    'home', 'explore', 'search', 'notifications', 'messages', 'compose', 'settings',
    'i', 'premium', 'premium_sign_up', 'login', 'logout', 'jobs', 'communities',
    'lists', 'grok', 'account', 'intent', 'hashtag', 'places', 'who_to_follow',
    'tos', 'privacy', 'about', 'download', 'verified', 'business', 'help',
  ]);

  // GraphQL operations a column spends when it loads or refreshes, derived
  // from the URL it shows so saved views and custom URLs are covered too.
  function operationsForUrl(url) {
    let u;
    try { u = new URL(url); } catch (e) { return []; }
    const p = u.pathname.replace(/\/$/, '');
    if (p === '/home') return ['HomeTimeline', 'HomeLatestTimeline'];
    if (p === '/search') return ['SearchTimeline'];
    if (p === '/explore' || p.startsWith('/explore/')) return ['ExplorePage'];
    if (p === '/notifications' || p.startsWith('/notifications/')) return ['NotificationsTimeline'];
    if (p === '/i/bookmarks' || p.startsWith('/i/bookmarks/')) return ['Bookmarks'];
    if (/^\/i\/lists\/\d+/.test(p)) return ['ListLatestTweetsTimeline'];
    if (/^\/[A-Za-z0-9_]+\/likes$/.test(p)) return ['Likes'];
    if (/^\/[A-Za-z0-9_]+\/media$/.test(p)) return ['UserMedia'];
    if (/^\/[A-Za-z0-9_]+\/with_replies$/.test(p)) return ['UserTweetsAndReplies'];
    if (/^\/[A-Za-z0-9_]+\/status\/\d+/.test(p)) return ['TweetDetail'];
    const first = p.split('/')[1] || '';
    if (/^[A-Za-z0-9_]+$/.test(first) && !RESERVED_PATHS.has(first.toLowerCase())) {
      if (/^\/[A-Za-z0-9_]+$/.test(p)) return ['UserTweets'];
    }
    return [];
  }

  // Endpoints a column spends on: the ones its frame has been seen fetching
  // posts from, plus the guess from its URL until that happens.
  function opsForColumn(col) {
    const ops = new Set(columnOps.get(col.id) || []);
    operationsForUrl(getCanonicalUrl(col)).forEach((op) => ops.add(op));
    return ops;
  }

  // The tightest known budget among a column's endpoints, or null when X
  // hasn't reported on them yet or the window has already reset.
  function budgetFor(col) {
    let worst = null;
    for (const op of opsForColumn(col)) {
      const b = rateLimits[op];
      if (!b || b.reset * 1000 <= Date.now()) continue;
      if (!worst || b.remaining < worst.remaining) worst = { op, ...b };
    }
    return worst;
  }

  function canSpend(col) {
    if (isThrottled()) return false;
    const b = budgetFor(col);
    return !b || b.remaining > BUDGET_RESERVE;
  }

  // Milliseconds until the column may spend again, or 0 if it can now.
  function waitFor(col) {
    let until = Math.max(rateLimitedUntil, backoffUntil);
    const b = budgetFor(col);
    if (b && b.remaining <= BUDGET_RESERVE) until = Math.max(until, b.reset * 1000 + 1000);
    return Math.max(0, until - Date.now());
  }

  function formatWait(ms) {
    const sec = Math.ceil(ms / 1000);
    if (sec < 60) return `${sec}s`;
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  }

  function cancelPendingLoads() {
    pendingStaggerTimers.forEach(id => clearTimeout(id));
    pendingStaggerTimers = [];
  }

  function randomStagger() {
    return 1000 + Math.random() * 1000;
  }

  let activeColumnId = null;       // which column is currently Active (resumed)
  let idleTimer = null;            // timer to pause the active column after inactivity
  let refreshTimers = new Map();   // Map<columnId, timeoutId> for the background refresh cycle
  const lastRefreshAt = new Map(); // Map<columnId, ms> when the column last loaded or refreshed
  const pendingRefreshes = new Map();   // Map<columnId, (ok) => void> awaiting tweetdeckx-refresh-result
  const pendingNavigations = new Map(); // Map<columnId, (ok) => void> awaiting tweetdeckx-navigate-result
  const refreshFailures = new Map();    // Map<columnId, consecutive in-place refreshes that fetched nothing>
  let dockAwake = false;           // the notifications panel is resumed (see wakeDock)
  let dockIdleTimer = null;        // pauses the notifications panel after inactivity

  // Per-column runtime state that is NOT persisted. Populated as iframes
  // report their current URL via the 'tweetdeckx-url-changed' message and
  // cleared in removeColumn AND moveColumn (both destroy the iframe, so the
  // cached URL would be stale for the next iframe). Survives page switches
  // because hidden pages keep their iframes in the DOM via display: none.
  const colRuntimeState = new Map(); // Map<colId, { currentUrl: string }>

  function updateBackButtonVisibility(colId) {
    const colEl = columnsContainer.querySelector(`.page-wrapper .deck-column[data-id="${colId}"]`);
    if (!colEl) return;
    const backBtn = colEl.querySelector('.col-back');
    if (!backBtn) return; // header hasn't been rewritten yet (Task 3 adds this element)

    const page = state.pages.find(p => p.columns.some(c => c.id === colId));
    if (!page) return;
    const col = page.columns.find(c => c.id === colId);
    if (!col) return;

    const rs = colRuntimeState.get(colId);
    const currentUrl = rs && rs.currentUrl;
    const show = currentUrl && !urlsEquivalent(currentUrl, getCanonicalUrl(col));
    backBtn.style.display = show ? '' : 'none';
  }

  const IDLE_TIMEOUT = 45000;      // 45 seconds of no mouse activity → pause
  const REFRESH_INTERVAL = 300000; // 5 minutes between background refreshes (±20% jitter)
  const RESUME_BURST_MS = 3000;    // how long a column stays visible after loading
  const HOVER_ACTIVATE_MS = 400;   // pointer must rest on a column this long to activate it
  // A page switch catches up columns the background cycle would have
  // refreshed by now. Anything shorter spends extra on every switch, which
  // adds up fast against search's 50 calls per window.
  const STALE_AFTER_MS = REFRESH_INTERVAL;

  function pauseAllIframes() {
    columnsContainer.querySelectorAll('iframe').forEach(function (iframe) {
      try {
        iframe.contentWindow.postMessage({ type: 'tweetdeckx-pause' }, '*');
      } catch (e) {}
    });
  }

  function pauseColumn(colId) {
    const col = columnsContainer.querySelector(`.deck-column[data-id="${colId}"]`);
    if (!col) return;
    const iframe = col.querySelector('iframe');
    if (iframe) {
      try { iframe.contentWindow.postMessage({ type: 'tweetdeckx-pause' }, '*'); } catch (e) {}
    }
  }

  function resumeColumn(colId) {
    const col = columnsContainer.querySelector(`.deck-column[data-id="${colId}"]`);
    if (!col) return;
    const iframe = col.querySelector('iframe');
    if (iframe) {
      try { iframe.contentWindow.postMessage({ type: 'tweetdeckx-resume' }, '*'); } catch (e) {}
    }
  }

  function activateColumn(colId) {
    sleepDock();
    if (activeColumnId && activeColumnId !== colId) {
      pauseColumn(activeColumnId);
    }
    activeColumnId = colId;
    resumeColumn(colId);
    resetIdleTimer();
    const colEl = columnsContainer.querySelector(`.deck-column[data-id="${colId}"]`);
    if (colEl && colEl.querySelector('iframe')) resetRefreshTimer(colId);
  }

  function deactivateActiveColumn() {
    if (activeColumnId) {
      pauseColumn(activeColumnId);
      activeColumnId = null;
    }
    clearIdleTimer();
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      deactivateActiveColumn();
    }, IDLE_TIMEOUT);
  }

  function clearIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = null;
  }

  // Background refresh for columns the user isn't interacting with. Each
  // cycle asks the frame for an in-place refresh (one timeline request)
  // while it stays paused, so X's badge and DM pollers never wake up.
  // Mirrors X Pro's own off-screen column policy: columns on screen always
  // refresh, columns within two widths of the viewport refresh half the
  // time, anything further a tenth of the time.
  function skipProbabilityFor(colEl) {
    const vp = columnsContainer.getBoundingClientRect();
    const r = colEl.getBoundingClientRect();
    if (r.width === 0) return 1;
    if (r.right > vp.left && r.left < vp.right) return 0;
    const dist = r.left >= vp.right ? r.left - vp.right : vp.left - r.right;
    return dist < 2 * r.width ? 0.5 : 0.9;
  }

  function backgroundRefresh(colId) {
    if (colId === activeColumnId) return;
    const col = findColumn(colId);
    const colEl = columnsContainer.querySelector(`.page-wrapper:not(.hidden) .deck-column[data-id="${colId}"]`);
    if (!col || !colEl || !colEl.querySelector('iframe')) return;
    if (Math.random() < skipProbabilityFor(colEl)) return;
    // A route where X's "." shortcut fetches nothing would otherwise never
    // refresh, so after three empty attempts a reload is allowed once
    const stuck = (refreshFailures.get(colId) || 0) >= 3;
    refreshColumn(col, { allowReload: stuck });
  }

  function jitteredInterval() {
    return REFRESH_INTERVAL * (0.8 + Math.random() * 0.4);
  }

  function startRefreshTimers() {
    clearAllRefreshTimers();
    const wrapper = getActiveWrapper();
    if (!wrapper) return;
    const page = getActivePage();
    if (!page) return;

    page.columns.forEach((col) => {
      const colEl = wrapper.querySelector(`.deck-column[data-id="${col.id}"]`);
      if (!colEl || !colEl.querySelector('iframe')) return;
      resetRefreshTimer(col.id);
    });
  }

  function resetRefreshTimer(colId) {
    clearRefreshTimer(colId);
    const tick = () => {
      backgroundRefresh(colId);
      refreshTimers.set(colId, setTimeout(tick, jitteredInterval()));
    };
    refreshTimers.set(colId, setTimeout(tick, jitteredInterval()));
  }

  function clearRefreshTimer(colId) {
    const existing = refreshTimers.get(colId);
    if (existing) clearTimeout(existing);
    refreshTimers.delete(colId);
  }

  function clearAllRefreshTimers() {
    refreshTimers.forEach((timerId) => clearTimeout(timerId));
    refreshTimers.clear();
  }

  // Refreshes a loaded column. Asks the frame to load new posts in place
  // (X's own timeline component, one timeline request); only if the frame
  // reports that nothing was fetched, and reloading is allowed, is the page
  // reloaded. Respects the endpoint budget either way.
  function refreshColumn(col, { allowReload = true } = {}) {
    const colEl = columnsContainer.querySelector(`.deck-column[data-id="${col.id}"]`);
    const iframe = colEl && colEl.querySelector('iframe');
    if (!iframe) return Promise.resolve(false);
    if (!canSpend(col)) {
      updateBudgetIndicators();
      return Promise.resolve(false);
    }
    supersedePending(pendingRefreshes, col.id);
    const refreshBtn = colEl.querySelector('[data-action="refresh"]');
    if (refreshBtn) refreshBtn.classList.add('refreshing');
    return new Promise((resolve) => {
      let timer = null;
      const finish = (ok, superseded) => {
        clearTimeout(timer);
        if (pendingRefreshes.get(col.id) === finish) pendingRefreshes.delete(col.id);
        resolve(superseded ? null : ok);
      };
      // The frame answers within 1.5s; the margin covers message delivery
      timer = setTimeout(() => finish(false), 3000);
      pendingRefreshes.set(col.id, finish);
      try {
        iframe.contentWindow.postMessage({ type: 'tweetdeckx-refresh' }, '*');
      } catch (e) {
        finish(false);
      }
    }).then((ok) => {
      if (refreshBtn && ok !== null) refreshBtn.classList.remove('refreshing');
      if (ok === null) return false; // a newer request for this column took over
      if (ok) {
        lastRefreshAt.set(col.id, Date.now());
        refreshFailures.delete(col.id);
        return true;
      }
      refreshFailures.set(col.id, (refreshFailures.get(col.id) || 0) + 1);
      if (!allowReload || !iframe.isConnected) return false;
      lastRefreshAt.set(col.id, Date.now());
      refreshFailures.delete(col.id);
      iframe.src = getCanonicalUrl(col);
      return true;
    });
  }

  // Cancels an earlier refresh or navigation still waiting on the same
  // column so its timeout can't trigger a stale fallback reload.
  function supersedePending(map, colId) {
    const prev = map.get(colId);
    if (prev) prev(false, true);
  }

  // Points a loaded column at a new URL through X's router rather than a
  // page reload. Falls back to a reload if the frame reports no fetch.
  function navigateColumn(col, url) {
    const colEl = columnsContainer.querySelector(`.deck-column[data-id="${col.id}"]`);
    const iframe = colEl && colEl.querySelector('iframe');
    if (!iframe) return;
    supersedePending(pendingNavigations, col.id);
    let timer = null;
    const finish = (ok, superseded) => {
      clearTimeout(timer);
      if (pendingNavigations.get(col.id) === finish) pendingNavigations.delete(col.id);
      if (superseded) return;
      lastRefreshAt.set(col.id, Date.now());
      if (!ok && iframe.isConnected) iframe.src = url;
    };
    // The frame answers within 1.2s; the margin covers message delivery
    timer = setTimeout(() => finish(false), 2500);
    pendingNavigations.set(col.id, finish);
    try {
      iframe.contentWindow.postMessage({ type: 'tweetdeckx-navigate', url }, '*');
    } catch (e) {
      finish(false);
    }
  }

  window.addEventListener('message', (e) => {
    if (!e.data) return;
    const isRefresh = e.data.type === 'tweetdeckx-refresh-result';
    const isNav = e.data.type === 'tweetdeckx-navigate-result';
    if (!isRefresh && !isNav) return;
    const colEl = findColumnElForSource(e.source);
    if (!colEl) return;
    const finish = (isRefresh ? pendingRefreshes : pendingNavigations).get(colEl.dataset.id);
    if (finish) finish(!!e.data.ok);
  });

  // Each column's frame reports the x-rate-limit-* headers of its API
  // responses. That is what ties a column to the endpoints it spends on
  // (rather than guessing from its URL), keeps the table current without a
  // round trip through the background, and catches a 429 the moment it
  // lands. Only responses from the column's own view count towards its
  // endpoints, so a tweet opened inside it doesn't make it a TweetDetail column.
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'tweetdeckx-api-response') return;
    const colEl = findColumnElForSource(e.source);
    if (!colEl) return;
    const col = findColumn(colEl.dataset.id);
    if (!col) return;
    const d = e.data;
    if (typeof d.op !== 'string' || !d.op) return;
    if (d.timeline && typeof d.url === 'string' && urlsEquivalent(d.url, getCanonicalUrl(col))) {
      if (!columnOps.has(col.id)) columnOps.set(col.id, new Set());
      columnOps.get(col.id).add(d.op);
    }
    const at = typeof d.at === 'number' ? d.at : Date.now();
    if (typeof d.limit === 'number' && typeof d.remaining === 'number' && typeof d.reset === 'number') {
      const prev = rateLimits[d.op];
      if (!prev || !(prev.at > at)) {
        rateLimits[d.op] = { limit: d.limit, remaining: d.remaining, reset: d.reset, at };
      }
    }
    if (d.status === 429) {
      onRateLimited({ op: d.op, reset: typeof d.reset === 'number' ? d.reset : null });
    }
    scheduleBudgetIndicatorUpdate();
  });

  function attachColumnInteractionListeners(colEl) {
    const colId = colEl.dataset.id;

    colEl.addEventListener('click', () => {
      if (activeColumnId !== colId) {
        activateColumn(colId);
      }
    });

    // Hovering activates the column, but only once the pointer has rested
    // on it: sweeping across ten columns should not wake ten frames.
    let hoverTimer = null;
    colEl.addEventListener('mouseenter', () => {
      if (activeColumnId === colId) {
        resetIdleTimer();
        return;
      }
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        hoverTimer = null;
        if (activeColumnId !== colId) activateColumn(colId);
      }, HOVER_ACTIVATE_MS);
    });

    colEl.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      hoverTimer = null;
      if (activeColumnId === colId) {
        resetIdleTimer();
      }
    });

    // Scroll over column → activate it (natural interaction)
    colEl.addEventListener('wheel', () => {
      if (activeColumnId !== colId) {
        activateColumn(colId);
      } else {
        resetIdleTimer();
      }
    }, { passive: true });
  }

  // -----------------------------------------
  // DOM refs
  // -----------------------------------------

  const pageNav = document.getElementById('page-nav');
  const columnsContainer = document.getElementById('columns-container');
  const emptyState = document.getElementById('empty-state');
  const emptyStateEmoji = document.getElementById('empty-state-emoji');
  const emptyStateTitle = document.getElementById('empty-state-title');
  const emptyStateDesc = document.getElementById('empty-state-desc');

  const modalOverlay = document.getElementById('modal-overlay');
  const typeInputArea = document.getElementById('type-input-area');
  const typeInputLabel = document.getElementById('type-input-label');
  const typeInput = document.getElementById('type-input');
  const btnConfirmAdd = document.getElementById('btn-confirm-add');
  const hideRepliesOption = document.getElementById('hide-replies-option');
  const hideRepliesCheckbox = document.getElementById('hide-replies-checkbox');

  const pageModalOverlay = document.getElementById('page-modal-overlay');
  const pageModalTitle = document.getElementById('page-modal-title');
  const pageEmojiBtn = document.getElementById('page-emoji-btn');
  const emojiPicker = document.getElementById('emoji-picker');
  const pageNameInput = document.getElementById('page-name-input');
  const btnPageSave = document.getElementById('btn-page-save');
  const btnPageDelete = document.getElementById('btn-page-delete');

  const rateLimitToast = document.getElementById('rate-limit-toast');
  const updateToast = document.getElementById('update-toast');
  const updateVersion = document.getElementById('update-version');
  const updateLink = document.getElementById('update-link');

  const settingsOverlay = document.getElementById('settings-overlay');
  const colWidthSlider = document.getElementById('col-width-slider');
  const colWidthValue = document.getElementById('col-width-value');
  const themeSelect = document.getElementById('theme-select');
  const hideAdsToggle = document.getElementById('hide-ads-toggle');
  const hideColHeaderToggle = document.getElementById('hide-col-header-toggle');
  const keyboardShortcutsToggle = document.getElementById('keyboard-shortcuts-toggle');

  // Column activation is now handled per-column by attachColumnInteractionListeners()

  // -----------------------------------------
  // Iframe interaction detection
  // -----------------------------------------
  // Iframes capture all mouse/keyboard events, making the deck blind to user
  // activity within columns. These listeners supplement mouseenter (which only
  // fires on the column boundary, not inside the iframe).

  // Detect when user clicks inside an iframe (iframe receives focus)
  window.addEventListener('blur', () => {
    setTimeout(() => {
      const el = document.activeElement;
      if (el && el.tagName === 'IFRAME') {
        const colEl = el.closest('.deck-column');
        if (colEl) {
          const colId = colEl.dataset.id;
          if (activeColumnId !== colId) {
            activateColumn(colId);
          } else {
            resetIdleTimer();
          }
        }
      }
    }, 0);
  });

  // Periodic fallback: if an iframe still has focus, keep the column active
  setInterval(() => {
    const el = document.activeElement;
    if (el && el.tagName === 'IFRAME') {
      const colEl = el.closest('.deck-column');
      if (colEl) {
        const colId = colEl.dataset.id;
        if (activeColumnId !== colId) {
          activateColumn(colId);
        } else {
          resetIdleTimer();
        }
      }
    }
  }, 10000);

  // Handle user activity relayed from inside iframes (scroll/click/keydown)
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'tweetdeckx-user-activity') return;
    const iframes = columnsContainer.querySelectorAll('iframe');
    for (const iframe of iframes) {
      if (iframe.contentWindow === e.source) {
        const colEl = iframe.closest('.deck-column');
        if (!colEl) break;
        const colId = colEl.dataset.id;
        if (activeColumnId !== colId) {
          activateColumn(colId);
        } else {
          resetIdleTimer();
        }
        break;
      }
    }
  });

  // Receive iframe URL change reports. Find the column by matching the
  // message source against live iframes, update runtime state, and refresh
  // the back-button visibility for that column.
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'tweetdeckx-url-changed') return;
    const iframes = columnsContainer.querySelectorAll('iframe');
    for (const iframe of iframes) {
      if (iframe.contentWindow === e.source) {
        const colEl = iframe.closest('.deck-column');
        if (!colEl) break;
        const colId = colEl.dataset.id;
        colRuntimeState.set(colId, { currentUrl: e.data.url });
        updateBackButtonVisibility(colId);
        break;
      }
    }
  });

  // -----------------------------------------
  // Lightbox: expand iframe to full viewport
  // -----------------------------------------

  let lightboxIframe = null;
  let lightboxBackdrop = null;

  function expandIframeForLightbox(iframe) {
    if (lightboxIframe) return; // already expanded
    lightboxIframe = iframe;

    // Create backdrop
    lightboxBackdrop = document.createElement('div');
    lightboxBackdrop.className = 'lightbox-backdrop';
    document.body.appendChild(lightboxBackdrop);

    // Expand the column (or the notifications panel)
    const colEl = iframe.closest('.deck-column, .dock-panel');
    if (colEl) colEl.classList.add('lightbox-active');
  }

  function collapseIframeFromLightbox() {
    if (!lightboxIframe) return;

    const colEl = lightboxIframe.closest('.deck-column, .dock-panel');
    if (colEl) colEl.classList.remove('lightbox-active');

    if (lightboxBackdrop) {
      lightboxBackdrop.remove();
      lightboxBackdrop = null;
    }

    lightboxIframe = null;
  }

  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'tweetdeckx-lightbox-opened') {
      // For videos, don't expand — let X.com's native fullscreen button work
      if (e.data.hasVideo) return;
      if (isDockSource(e.source)) {
        expandIframeForLightbox(dockIframe);
        return;
      }
      const iframes = columnsContainer.querySelectorAll('iframe');
      for (const iframe of iframes) {
        if (iframe.contentWindow === e.source) {
          expandIframeForLightbox(iframe);
          break;
        }
      }
    } else if (e.data.type === 'tweetdeckx-lightbox-closed') {
      collapseIframeFromLightbox();
    }
  });

  // Also collapse on Escape key (fallback in case X.com closes lightbox without URL change)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxIframe) {
      collapseIframeFromLightbox();
    }
  });

  // -----------------------------------------
  // Persistence (chrome.storage.local)
  // -----------------------------------------

  async function loadState() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tweetdeckx_state'], (data) => {
        if (data.tweetdeckx_state) {
          const saved = data.tweetdeckx_state;
          state.pages = saved.pages || [];
          state.activePageId = saved.activePageId || null;
          if (saved.settings) {
            state.settings = { ...state.settings, ...saved.settings };
          }
        }
        resolve();
      });
    });
  }

  function saveState() {
    chrome.storage.local.set({ tweetdeckx_state: state });
  }

  // -----------------------------------------
  // Helpers
  // -----------------------------------------

  function getActivePage() {
    return state.pages.find(p => p.id === state.activePageId) || state.pages[0] || null;
  }

  function getColumnUrl(type, param) {
    const def = COLUMN_TYPES[type];
    if (def.url) return def.url;

    switch (type) {
      case 'search':
        return `https://x.com/search?q=${encodeURIComponent(param)}&src=typed_query&f=live`;
      case 'user':
        return `https://x.com/${param.replace(/^@/, '')}`;
      case 'list': {
        if (param.startsWith('http')) return param;
        return `https://x.com/i/lists/${param}`;
      }
      case 'likes':
        return `https://x.com/${param.replace(/^@/, '')}/likes`;
      case 'url':
        return param.startsWith('http') ? param : `https://x.com/${param}`;
      default:
        return 'https://x.com/home';
    }
  }

  // Returns the URL a column "should" currently show. If the user has used
  // "Save current view" to persist a specific URL on this column, that wins;
  // otherwise we derive it from the column type and param. Search filters
  // are applied on top of either.
  function getCanonicalUrl(col) {
    return applySearchFilters(col.url || getColumnUrl(col.type, col.param), col);
  }

  // Search column filters are X search operators appended to the query, so
  // X does the filtering server side and the timeline never has to page
  // through posts we would otherwise hide.
  function getSearchFilterTerms(col) {
    const terms = [];
    if (col.hideReplies) terms.push('-filter:replies');
    if (col.clearedAt) terms.push(`since_time:${col.clearedAt}`);
    return terms;
  }

  // Returns the parsed URL if it is an X search page, otherwise null.
  function parseSearchUrl(url) {
    try {
      const u = new URL(url);
      return u.pathname === '/search' ? u : null;
    } catch (e) {
      return null;
    }
  }

  function isSearchView(col) {
    return col.type === 'search' && !!parseSearchUrl(col.url || getColumnUrl(col.type, col.param));
  }

  function applySearchFilters(url, col) {
    if (col.type !== 'search') return url;
    const terms = getSearchFilterTerms(col);
    const u = terms.length ? parseSearchUrl(url) : null;
    if (!u) return url;
    u.searchParams.set('q', [u.searchParams.get('q') || '', ...terms].join(' ').trim());
    return u.toString();
  }

  // Inverse of applySearchFilters, used by "Save current view" so the saved
  // URL doesn't bake in operators the column adds on its own. Otherwise
  // turning a filter off later would leave it stuck in the saved query.
  function stripSearchFilters(url, col) {
    if (col.type !== 'search') return url;
    const terms = getSearchFilterTerms(col);
    const u = terms.length ? parseSearchUrl(url) : null;
    if (!u) return url;
    const words = (u.searchParams.get('q') || '').split(/\s+/).filter(Boolean);
    const kept = words.filter(w => !terms.includes(w));
    if (kept.length === words.length) return url;
    u.searchParams.set('q', kept.join(' '));
    return u.toString();
  }

  // Returns true if two URLs are semantically equivalent for the purpose of
  // deciding whether the column has navigated away from its canonical URL.
  // Ignores hash and trailing-slash differences; compares sorted search params.
  function urlsEquivalent(a, b) {
    if (!a || !b) return false;
    try {
      const ua = new URL(a);
      const ub = new URL(b);
      if (ua.origin !== ub.origin) return false;
      if (ua.pathname.replace(/\/$/, '') !== ub.pathname.replace(/\/$/, '')) return false;
      const sa = [...ua.searchParams].sort().map(p => p.join('=')).join('&');
      const sb = [...ub.searchParams].sort().map(p => p.join('=')).join('&');
      return sa === sb;
    } catch (e) {
      return a === b;
    }
  }

  function getColumnTitle(type, param) {
    const def = COLUMN_TYPES[type];
    if (!def.needsInput) return def.label;
    switch (type) {
      case 'search':   return `Search: ${param}`;
      case 'user':     return `@${param.replace(/^@/, '')}`;
      case 'list':     return `List: ${param.includes('/') ? 'Custom' : param}`;
      case 'likes':    return `Likes: @${param.replace(/^@/, '')}`;
      case 'url':      return 'Custom';
      default:         return def.label;
    }
  }

  function getColumnSubtitle(col) {
    const parts = [col.type];
    // Filters only apply while the column shows a search (see
    // applySearchFilters), so only mention them then
    if (isSearchView(col)) {
      if (col.hideReplies) parts.push('no replies');
      if (col.clearedAt) parts.push('cleared');
    }
    return parts.join(' · ');
  }

  function updateColumnSubtitle(col) {
    const colEl = columnsContainer.querySelector(`.deck-column[data-id="${col.id}"]`);
    const subEl = colEl && colEl.querySelector('.column-subtitle');
    if (subEl) subEl.textContent = getColumnSubtitle(col);
  }

  // -----------------------------------------
  // Sidebar rendering
  // -----------------------------------------

  let draggedPageId = null;

  function renderSidebar() {
    pageNav.innerHTML = '';

    state.pages.forEach((page) => {
      const btn = document.createElement('button');
      btn.className = 'nav-item' + (page.id === state.activePageId ? ' active' : '');
      btn.textContent = page.emoji;
      btn.title = page.name;
      btn.draggable = true;
      btn.dataset.pageId = page.id;

      btn.addEventListener('click', () => {
        switchPage(page.id);
      });

      btn.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openPageModal('edit', page);
      });

      // Page drag-and-drop
      btn.addEventListener('dragstart', (e) => {
        draggedPageId = page.id;
        btn.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', page.id);
      });

      btn.addEventListener('dragend', () => {
        draggedPageId = null;
        btn.classList.remove('dragging');
        document.querySelectorAll('#page-nav .drag-over').forEach(el => el.classList.remove('drag-over'));
      });

      btn.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedPageId && draggedPageId !== page.id) {
          btn.classList.add('drag-over');
        }
      });

      btn.addEventListener('dragleave', () => {
        btn.classList.remove('drag-over');
      });

      btn.addEventListener('drop', (e) => {
        e.preventDefault();
        btn.classList.remove('drag-over');
        if (draggedPageId && draggedPageId !== page.id) {
          reorderPages(draggedPageId, page.id);
        }
      });

      pageNav.appendChild(btn);
    });
  }

  // -----------------------------------------
  // Page switching
  // -----------------------------------------

  function switchPage(pageId) {
    if (pageId === state.activePageId) return;

    // Deactivate current column and clear timers before switching
    deactivateActiveColumn();
    clearAllRefreshTimers();

    // Hide current page wrapper
    const currentWrapper = getActiveWrapper();
    if (currentWrapper) {
      currentWrapper.classList.add('hidden');
    }

    // Update last accessed for current page in cache
    if (state.activePageId && pageCache.has(state.activePageId)) {
      pageCache.get(state.activePageId).lastAccessed = Date.now();
    }

    state.activePageId = pageId;
    saveState();
    renderSidebar();

    // Check if target page has a cached wrapper in the DOM
    const cachedEntry = pageCache.get(pageId);
    if (cachedEntry && cachedEntry.wrapper.parentNode === columnsContainer) {
      // Cache hit — show cached DOM, no refresh, no active column
      cachedEntry.wrapper.classList.remove('hidden');
      cachedEntry.lastAccessed = Date.now();
      emptyState.classList.add('hidden');
      // Restart refresh timers for this page's columns, catch up the ones
      // that went stale while the page was hidden, and load any that were
      // waiting on a budget
      startRefreshTimers();
      refreshStaleColumns(cachedEntry.wrapper);
      loadDeferredColumns();
      return;
    }

    // Cache miss — cold load (renderColumns handles burst-resume)
    renderColumns();
  }

  // Columns on a page the user comes back to are refreshed in place, one
  // at a time, if they are older than a refresh interval. Hidden pages get
  // no refreshes at all, so this is what keeps them from feeling frozen.
  function refreshStaleColumns(wrapper) {
    let delay = 0;
    wrapper.querySelectorAll('.deck-column').forEach((colEl) => {
      if (!colEl.querySelector('iframe')) return;
      const col = findColumn(colEl.dataset.id);
      if (!col) return;
      if (Date.now() - (lastRefreshAt.get(col.id) || 0) < STALE_AFTER_MS) return;
      delay += randomStagger();
      const timerId = setTimeout(() => {
        pendingStaggerTimers = pendingStaggerTimers.filter(t => t !== timerId);
        refreshColumn(col, { allowReload: false });
      }, delay);
      pendingStaggerTimers.push(timerId);
    });
  }

  function reorderPages(fromId, toId) {
    const fromIdx = state.pages.findIndex(p => p.id === fromId);
    const toIdx = state.pages.findIndex(p => p.id === toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

    const [moved] = state.pages.splice(fromIdx, 1);
    state.pages.splice(toIdx, 0, moved);
    saveState();
    renderSidebar();
  }

  // -----------------------------------------
  // Column rendering
  // -----------------------------------------

  function createColumnElement(col) {
    const colEl = document.createElement('div');
    colEl.className = 'deck-column';
    colEl.dataset.id = col.id;
    colEl.style.setProperty('--column-width', state.settings.columnWidth + 'px');
    colEl.style.flex = `0 0 ${state.settings.columnWidth}px`;
    colEl.style.width = state.settings.columnWidth + 'px';

    const typeDef = COLUMN_TYPES[col.type] || COLUMN_TYPES.home;

    // ----- Header -----
    const header = document.createElement('div');
    header.className = 'column-header';
    header.draggable = true;
    header.dataset.colId = col.id;

    // Back button (far left, hidden by default; shown by updateBackButtonVisibility)
    const backBtn = document.createElement('button');
    backBtn.className = 'col-btn col-back';
    backBtn.dataset.action = 'back';
    backBtn.title = 'Back';
    backBtn.style.display = 'none';
    backBtn.appendChild(svgFromString(ICONS.back));
    header.appendChild(backBtn);

    // Left cluster: icon + title (+ optional subtitle)
    const left = document.createElement('div');
    left.className = 'column-header-left';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'column-icon';
    iconSpan.appendChild(svgFromString(ICONS[typeDef.icon] || ICONS.home));
    left.appendChild(iconSpan);

    const titleWrap = document.createElement('div');
    const titleDiv = document.createElement('div');
    titleDiv.className = 'column-title';
    titleDiv.textContent = col.title || getColumnTitle(col.type, col.param);
    titleWrap.appendChild(titleDiv);
    if (col.param) {
      const subDiv = document.createElement('div');
      subDiv.className = 'column-subtitle';
      subDiv.textContent = getColumnSubtitle(col);
      titleWrap.appendChild(subDiv);
    }
    left.appendChild(titleWrap);
    header.appendChild(left);

    // Right cluster: refresh + 3-dot menu
    const right = document.createElement('div');
    right.className = 'column-header-right';

    const budgetSpan = document.createElement('span');
    budgetSpan.className = 'column-budget hidden';
    right.appendChild(budgetSpan);

    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'col-btn';
    refreshBtn.dataset.action = 'refresh';
    refreshBtn.title = 'Refresh';
    refreshBtn.appendChild(svgFromString(ICONS.refresh));
    right.appendChild(refreshBtn);

    const menuBtn = document.createElement('button');
    menuBtn.className = 'col-btn';
    menuBtn.dataset.action = 'menu';
    menuBtn.title = 'More options';
    menuBtn.appendChild(svgFromString(ICONS.menu));
    right.appendChild(menuBtn);

    header.appendChild(right);
    colEl.appendChild(header);

    // Loading placeholder (replaced by iframe in loadIframeForColumn)
    const loading = document.createElement('div');
    loading.className = 'column-loading';
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    loading.appendChild(spinner);
    const note = document.createElement('div');
    note.className = 'loading-note';
    loading.appendChild(note);
    colEl.appendChild(loading);

    // Column header button handlers (event delegation on the column root)
    colEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      if (action === 'back') {
        // The frame steps back through its own views (see goBack in
        // page-context.js) and falls back to the column's start page
        const iframe = colEl.querySelector('iframe');
        if (iframe) {
          try {
            iframe.contentWindow.postMessage({ type: 'tweetdeckx-back', home: getCanonicalUrl(col) }, '*');
          } catch (err) {}
        }
      } else if (action === 'refresh') {
        if (!canSpend(col)) {
          showBudgetToast(col);
        } else if (colEl.querySelector('iframe')) {
          refreshColumn(col);
        } else {
          loadIframeForColumn(colEl, col);
        }
        activateColumn(col.id);
      } else if (action === 'menu') {
        toggleColMenu(colEl, col.id);
      }
    });

    // Column drag-and-drop
    setupColumnDragDrop(header, colEl, col.id);

    // Rate limit: interaction-driven activation
    attachColumnInteractionListeners(colEl);

    return colEl;
  }

  function loadIframeForColumn(colEl, col) {
    const loadingEl = colEl.querySelector('.column-loading');
    if (!loadingEl) return;

    // Loading a column boots the whole X client (15 to 25 API calls), so
    // never do it into an exhausted budget: leave the placeholder up with a
    // note and let loadDeferredColumns pick it up when the window resets.
    if (!canSpend(col)) {
      colEl.dataset.needsLoad = 'true';
      colEl.dataset.budgetWait = 'true';
      const note = loadingEl.querySelector('.loading-note');
      const b = budgetFor(col);
      if (note) {
        note.textContent = b
          ? `Waiting for X's ${b.op} rate limit to reset (${formatWait(waitFor(col))})`
          : `Waiting for X's rate limit to reset (${formatWait(waitFor(col))})`;
      }
      scheduleDeferredLoads();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'column-frame';
    iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox';
    iframe.allow = 'autoplay; encrypted-media; fullscreen';
    iframe.src = getCanonicalUrl(col);
    iframe.loading = 'lazy';

    iframe.addEventListener('load', () => {
      try {
        iframe.contentWindow.postMessage({
          type: 'tweetdeckx-init',
          hideAds: state.settings.hideAds,
          hideColumnHeader: state.settings.hideColumnHeader && col.type !== 'search',
          keyboardShortcuts: state.settings.keyboardShortcuts,
        }, '*');
        iframe.contentWindow.postMessage({
          type: 'tweetdeckx-set-column-width',
          width: state.settings.columnWidth
        }, '*');
      } catch (e) {
        // Cross-origin, content script handles it
      }
      // Let the client boot visible for a moment so its initial fetches are
      // made as a foreground load, then pause unless the user is on it
      const colEl = iframe.closest('.deck-column');
      const colId = colEl ? colEl.dataset.id : null;
      if (colId) {
        setTimeout(() => {
          if (activeColumnId !== colId) pauseColumn(colId);
        }, RESUME_BURST_MS);
      }
    });

    loadingEl.replaceWith(iframe);
    delete colEl.dataset.needsLoad;
    delete colEl.dataset.budgetWait;
    lastRefreshAt.set(col.id, Date.now());
    resetRefreshTimer(col.id);
    updateBudgetIndicators();
  }

  function broadcastHideAds() {
    document.querySelectorAll('.column-frame').forEach(iframe => {
      try {
        iframe.contentWindow.postMessage({
          type: 'tweetdeckx-set-hide-ads',
          enabled: state.settings.hideAds,
        }, '*');
      } catch (e) { /* Cross-origin — content script handles it */ }
    });
  }

  function broadcastHideColumnHeader() {
    document.querySelectorAll('.deck-column').forEach(colEl => {
      const colId = colEl.dataset.id;
      // Resolve the column's type from any page (not just active — cached
      // pages have live iframes too via display:none).
      let colType = null;
      for (const p of state.pages) {
        const found = p.columns.find(c => c.id === colId);
        if (found) { colType = found.type; break; }
      }
      const effective = state.settings.hideColumnHeader && colType !== 'search';
      const iframe = colEl.querySelector('iframe');
      if (!iframe) return;
      try {
        iframe.contentWindow.postMessage({
          type: 'tweetdeckx-set-hide-column-header',
          enabled: effective,
        }, '*');
      } catch (e) { /* Cross-origin — content script handles it */ }
    });
    postToDock({ type: 'tweetdeckx-set-hide-column-header', enabled: state.settings.hideColumnHeader });
  }

  function broadcastKeyboardShortcuts() {
    document.querySelectorAll('.column-frame').forEach(iframe => {
      try {
        iframe.contentWindow.postMessage({
          type: 'tweetdeckx-set-keyboard-shortcuts',
          enabled: state.settings.keyboardShortcuts,
        }, '*');
      } catch (e) { /* Cross-origin, content script handles it */ }
    });
  }

  function createTrailingAddButton() {
    const trailing = document.createElement('div');
    trailing.className = 'add-column-trailing';
    trailing.innerHTML = '<button class="add-column-circle" title="Add column">+</button>';
    trailing.querySelector('.add-column-circle').addEventListener('click', () => {
      openAddColumnModal();
    });
    return trailing;
  }

  function renderColumns() {
    closeAllDropdowns();
    cancelPendingLoads();

    const page = getActivePage();

    // Handle empty state
    if (!page || !page.columns || page.columns.length === 0) {
      // Hide any active wrapper
      const activeWrapper = getActiveWrapper();
      if (activeWrapper) activeWrapper.classList.add('hidden');

      emptyState.classList.remove('hidden');
      if (page) {
        emptyStateEmoji.textContent = page.emoji;
        emptyStateTitle.textContent = page.name;
        emptyStateDesc.textContent = `Add columns to this page to start tracking your ${page.name}.`;
      } else {
        emptyStateEmoji.textContent = '📭';
        emptyStateTitle.textContent = 'No pages';
        emptyStateDesc.textContent = 'Create a page to get started.';
      }
      return;
    }

    emptyState.classList.add('hidden');

    // Remove old wrapper for this page if it exists (cold load means we rebuild)
    const oldWrapper = columnsContainer.querySelector(`.page-wrapper[data-page-id="${page.id}"]`);
    if (oldWrapper) {
      oldWrapper.remove();
      pageCache.delete(page.id);
    }

    // Create new wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'page-wrapper';
    wrapper.dataset.pageId = page.id;
    columnsContainer.appendChild(wrapper);

    // Register in cache
    pageCache.set(page.id, { wrapper, lastAccessed: Date.now() });
    evictLruPages();

    // Create columns with stagger
    page.columns.forEach((col, index) => {
      const colEl = createColumnElement(col);
      if (index === 0 && canSpend(col)) {
        loadIframeForColumn(colEl, col);
      } else {
        colEl.dataset.needsLoad = 'true';
      }
      wrapper.appendChild(colEl);
    });

    // Lazy-load remaining columns as they scroll into view
    const lazyColumns = wrapper.querySelectorAll('[data-needs-load="true"]');
    if (lazyColumns.length > 0) {
      let staggerDelay = 0;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          observer.unobserve(el);
          staggerDelay += randomStagger();
          const colData = page.columns.find(c => c.id === el.dataset.id);
          if (colData) {
            const timerId = setTimeout(() => {
              pendingStaggerTimers = pendingStaggerTimers.filter(t => t !== timerId);
              loadIframeForColumn(el, colData);
            }, staggerDelay);
            pendingStaggerTimers.push(timerId);
          }
        });
      }, { root: columnsContainer, threshold: 0.1 });

      lazyColumns.forEach(el => observer.observe(el));
    }

    wrapper.appendChild(createTrailingAddButton());
    // Columns pause themselves shortly after loading (see
    // loadIframeForColumn); only the hovered column stays awake
    pauseAllIframes();
    startRefreshTimers();
  }

  // -----------------------------------------
  // Column CRUD
  // -----------------------------------------

  function addColumn(type, param, options) {
    const page = getActivePage();
    if (!page) return;

    const id = generateId('col');
    const title = getColumnTitle(type, param);
    const col = { id, type, param: param || null, title };
    if (options && options.hideReplies) col.hideReplies = true;
    page.columns.push(col);
    saveState();

    // If this is the first column, transition from empty state
    if (page.columns.length === 1) {
      renderColumns();
      return;
    }

    // Append single column to live DOM without destroying existing iframes
    const colEl = createColumnElement(col);

    const wrapper = getActiveWrapper();
    if (!wrapper) {
      renderColumns();
      return;
    }

    const trailing = wrapper.querySelector('.add-column-trailing');
    if (trailing) {
      wrapper.insertBefore(colEl, trailing);
    } else {
      wrapper.appendChild(colEl);
    }
    // Load after insertion so a budget deferral can find it in the wrapper
    loadIframeForColumn(colEl, col);

    requestAnimationFrame(() => {
      colEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    });
  }

  function removeColumn(colId) {
    const page = getActivePage();
    if (!page) return;
    page.columns = page.columns.filter(c => c.id !== colId);
    colRuntimeState.delete(colId);
    saveState();

    // Clean up timers for this column
    if (activeColumnId === colId) {
      deactivateActiveColumn();
    }
    clearRefreshTimer(colId);
    lastRefreshAt.delete(colId);
    refreshFailures.delete(colId);
    columnOps.delete(colId);
    supersedePending(pendingRefreshes, colId);
    supersedePending(pendingNavigations, colId);

    // Remove single column from live DOM without destroying other iframes
    const wrapper = getActiveWrapper();
    if (wrapper) {
      const colEl = wrapper.querySelector(`[data-id="${colId}"]`);
      if (colEl) {
        const iframe = colEl.querySelector('iframe');
        if (iframe) iframe.remove();
        colEl.remove();
      }
    }

    // If no columns remain, show empty state
    if (page.columns.length === 0) {
      renderColumns();
    }
  }

  function reorderColumns(fromId, toId) {
    const page = getActivePage();
    if (!page) return;

    const fromIdx = page.columns.findIndex(c => c.id === fromId);
    const toIdx = page.columns.findIndex(c => c.id === toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

    const [moved] = page.columns.splice(fromIdx, 1);
    page.columns.splice(toIdx, 0, moved);
    saveState();

    // Reorder DOM nodes within the wrapper without destroying iframes
    const wrapper = getActiveWrapper();
    if (!wrapper) return;

    const fromEl = wrapper.querySelector(`[data-id="${fromId}"]`);
    const toEl = wrapper.querySelector(`[data-id="${toId}"]`);
    if (!fromEl || !toEl) return;

    // If the dragged element was before the target, insert after; otherwise insert before
    if (fromIdx < toIdx) {
      wrapper.insertBefore(fromEl, toEl.nextSibling);
    } else {
      wrapper.insertBefore(fromEl, toEl);
    }
  }

  // -----------------------------------------
  // Column drag-and-drop
  // -----------------------------------------

  let draggedColId = null;

  function setupColumnDragDrop(handle, colEl, colId) {
    handle.addEventListener('dragstart', (e) => {
      draggedColId = colId;
      colEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', colId);
    });

    handle.addEventListener('dragend', () => {
      draggedColId = null;
      colEl.classList.remove('dragging');
      document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    });

    colEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedColId && draggedColId !== colId) {
        colEl.classList.add('drag-over');
      }
    });

    colEl.addEventListener('dragleave', () => {
      colEl.classList.remove('drag-over');
    });

    colEl.addEventListener('drop', (e) => {
      e.preventDefault();
      colEl.classList.remove('drag-over');
      if (draggedColId && draggedColId !== colId) {
        reorderColumns(draggedColId, colId);
      }
    });
  }

  // -----------------------------------------
  // Column 3-dot menu (with drill-downs)
  // -----------------------------------------

  // Small helper: build a menu row with an emoji/icon on the left, a label in
  // the middle, and an optional chevron on the right.
  function makeMenuItem({ icon, label, chevron, danger }) {
    const item = document.createElement('button');
    item.className = 'col-menu-item' + (danger ? ' col-menu-item-danger' : '');

    const iconSpan = document.createElement('span');
    iconSpan.className = 'col-menu-icon';
    iconSpan.textContent = icon || '';
    item.appendChild(iconSpan);

    const labelSpan = document.createElement('span');
    labelSpan.className = 'col-menu-label-text';
    labelSpan.textContent = label;
    item.appendChild(labelSpan);

    if (chevron) {
      const chev = document.createElement('span');
      chev.className = 'col-menu-chev';
      chev.textContent = chevron;
      item.appendChild(chev);
    }
    return item;
  }

  function makeMenuDivider() {
    const d = document.createElement('div');
    d.className = 'col-menu-divider';
    return d;
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.col-menu').forEach(el => el.remove());
  }

  function toggleColMenu(colEl, colId) {
    const existing = colEl.querySelector('.col-menu');
    if (existing) {
      existing.remove();
      return;
    }

    closeAllDropdowns();

    let menuView = 'root';

    const menu = document.createElement('div');
    menu.className = 'col-menu';

    function render() {
      menu.replaceChildren();
      if (menuView === 'root') {
        renderRoot();
      } else if (menuView === 'move') {
        renderMove();
      } else if (menuView === 'rename') {
        renderRename();
      }
    }

    function renderRoot() {
      const page = getActivePage();
      if (!page) return;
      const col = page.columns.find(c => c.id === colId);
      if (!col) return;

      // Save current view
      const rs = colRuntimeState.get(colId);
      const currentUrl = rs && rs.currentUrl;
      const canSave = !!(currentUrl && !urlsEquivalent(currentUrl, getCanonicalUrl(col)));

      const saveItem = makeMenuItem({ icon: '💾', label: 'Save current view' });
      saveItem.disabled = !canSave;
      saveItem.title = canSave ? 'Save this URL as the column default' : 'Already on saved view';
      saveItem.addEventListener('click', () => {
        if (!canSave) return;
        menu.remove();
        saveCurrentView(colId);
      });
      menu.appendChild(saveItem);

      menu.appendChild(makeMenuDivider());

      // Search filters (search columns only)
      if (isSearchView(col)) {
        const repliesItem = makeMenuItem({
          icon: '💬',
          label: col.hideReplies ? 'Show replies' : 'Hide replies',
        });
        repliesItem.addEventListener('click', () => {
          menu.remove();
          setHideReplies(colId, !col.hideReplies);
        });
        menu.appendChild(repliesItem);

        const clearItem = makeMenuItem({ icon: '🧹', label: 'Clear column' });
        clearItem.title = 'Hide the posts loaded so far and only show newer ones';
        clearItem.addEventListener('click', () => {
          menu.remove();
          clearColumn(colId);
        });
        menu.appendChild(clearItem);

        if (col.clearedAt) {
          const undoItem = makeMenuItem({ icon: '↩️', label: 'Undo clear' });
          undoItem.addEventListener('click', () => {
            menu.remove();
            undoClearColumn(colId);
          });
          menu.appendChild(undoItem);
        }

        menu.appendChild(makeMenuDivider());
      }

      // Rename
      const renameItem = makeMenuItem({ icon: '✏️', label: 'Rename column' });
      renameItem.addEventListener('click', () => {
        menuView = 'rename';
        render();
      });
      menu.appendChild(renameItem);

      menu.appendChild(makeMenuDivider());

      // Move to page… (only when there are multiple pages)
      if (state.pages.length > 1) {
        const moveItem = makeMenuItem({ icon: '📂', label: 'Move to page…', chevron: '›' });
        moveItem.addEventListener('click', () => {
          menuView = 'move';
          render();
        });
        menu.appendChild(moveItem);
        menu.appendChild(makeMenuDivider());
      }

      // Remove column
      const removeItem = makeMenuItem({ icon: '🗑', label: 'Remove column', danger: true });
      removeItem.addEventListener('click', () => {
        menu.remove();
        removeColumn(colId);
      });
      menu.appendChild(removeItem);
    }

    function renderMove() {
      const backRow = makeMenuItem({ icon: '‹', label: 'Back' });
      backRow.classList.add('col-menu-back');
      backRow.addEventListener('click', () => {
        menuView = 'root';
        render();
      });
      menu.appendChild(backRow);
      menu.appendChild(makeMenuDivider());

      state.pages.forEach((page) => {
        if (page.id === state.activePageId) return;
        const item = makeMenuItem({ icon: page.emoji, label: page.name });
        item.addEventListener('click', () => {
          menu.remove();
          moveColumn(colId, page.id);
        });
        menu.appendChild(item);
      });
    }

    function renderRename() {
      const page = getActivePage();
      if (!page) return;
      const col = page.columns.find(c => c.id === colId);
      if (!col) return;

      const backRow = makeMenuItem({ icon: '‹', label: 'Back' });
      backRow.classList.add('col-menu-back');
      backRow.addEventListener('click', () => {
        menuView = 'root';
        render();
      });
      menu.appendChild(backRow);
      menu.appendChild(makeMenuDivider());

      const label = document.createElement('div');
      label.className = 'col-menu-section-label';
      label.textContent = 'Column title';
      menu.appendChild(label);

      const input = document.createElement('input');
      input.className = 'col-menu-input';
      input.type = 'text';
      input.value = col.title || getColumnTitle(col.type, col.param);
      input.placeholder = 'Column title';
      menu.appendChild(input);

      const actions = document.createElement('div');
      actions.className = 'col-menu-actions';

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'col-menu-action';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => {
        menu.remove();
      });
      actions.appendChild(cancelBtn);

      const saveBtn = document.createElement('button');
      saveBtn.className = 'col-menu-action col-menu-action-primary';
      saveBtn.textContent = 'Save';
      saveBtn.addEventListener('click', () => {
        renameColumn(colId, input.value);
        menu.remove();
      });
      actions.appendChild(saveBtn);

      menu.appendChild(actions);

      // Focus + commit on Enter / cancel on Escape
      setTimeout(() => input.focus(), 0);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          renameColumn(colId, input.value);
          menu.remove();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          menu.remove();
        }
      });
    }

    render();
    colEl.appendChild(menu);

    // Dismiss on outside click. The isConnected guard self-cleans the handler
    // if the menu was removed by some other path (toggle-off via re-click,
    // closeAllDropdowns, removeColumn from a menu item, etc.).
    const dismissHandler = (e) => {
      if (!menu.isConnected) {
        document.removeEventListener('click', dismissHandler, true);
        return;
      }
      if (!menu.contains(e.target) && !e.target.closest('[data-action="menu"]')) {
        menu.remove();
        document.removeEventListener('click', dismissHandler, true);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', dismissHandler, true);
    }, 0);
  }

  function moveColumn(colId, targetPageId) {
    const sourcePage = getActivePage();
    if (!sourcePage) return;

    const targetPage = state.pages.find(p => p.id === targetPageId);
    if (!targetPage) return;

    const colIdx = sourcePage.columns.findIndex(c => c.id === colId);
    if (colIdx === -1) return;

    const [col] = sourcePage.columns.splice(colIdx, 1);
    targetPage.columns.push(col);

    // Clean up timers for this column
    if (activeColumnId === colId) {
      deactivateActiveColumn();
    }
    clearRefreshTimer(colId);
    lastRefreshAt.delete(colId);
    refreshFailures.delete(colId);
    columnOps.delete(colId);
    supersedePending(pendingRefreshes, colId);
    supersedePending(pendingNavigations, colId);
    colRuntimeState.delete(colId);

    // Remove the column element from the active wrapper's DOM
    const wrapper = getActiveWrapper();
    if (wrapper) {
      const colEl = wrapper.querySelector(`[data-id="${colId}"]`);
      if (colEl) {
        const iframe = colEl.querySelector('iframe');
        if (iframe) iframe.remove();
        colEl.remove();
      }
    }

    // Invalidate the target page's cache so it rebuilds with the new column
    invalidateCache(targetPageId);
    saveState();

    // If no columns remain on the source page, show empty state
    if (sourcePage.columns.length === 0) {
      renderColumns();
    }
  }

  function saveCurrentView(colId) {
    const page = state.pages.find(p => p.columns.some(c => c.id === colId));
    if (!page) return;
    const col = page.columns.find(c => c.id === colId);
    if (!col) return;

    const rs = colRuntimeState.get(colId);
    const currentUrl = rs && rs.currentUrl;
    if (!currentUrl) return;
    if (urlsEquivalent(currentUrl, getCanonicalUrl(col))) return;

    col.url = stripSearchFilters(currentUrl, col);
    columnOps.delete(col.id); // the new view may fetch from a different endpoint
    saveState();
    updateBackButtonVisibility(colId);
  }

  function findColumn(colId) {
    for (const page of state.pages) {
      const col = page.columns.find(c => c.id === colId);
      if (col) return col;
    }
    return null;
  }

  // Points an already loaded column at its (possibly changed) canonical URL.
  // Columns that haven't loaded yet pick the new URL up when they do.
  function reloadColumn(col) {
    navigateColumn(col, getCanonicalUrl(col));
  }

  function setHideReplies(colId, enabled) {
    const col = findColumn(colId);
    if (!col) return;

    if (enabled) {
      col.hideReplies = true;
    } else {
      delete col.hideReplies;
    }
    saveState();
    updateColumnSubtitle(col);
    reloadColumn(col);
  }

  // Asks a column's iframe when the newest post it is showing was created.
  // Resolves to null if the frame can't tell or doesn't answer in time.
  function requestNewestPostTime(iframe) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => finish(null), 1000);
      function onMessage(e) {
        if (e.source !== iframe.contentWindow) return;
        if (!e.data || e.data.type !== 'tweetdeckx-newest-post-time') return;
        finish(e.data.time);
      }
      function finish(time) {
        clearTimeout(timer);
        window.removeEventListener('message', onMessage);
        resolve(typeof time === 'number' ? time : null);
      }
      window.addEventListener('message', onMessage);
      try {
        iframe.contentWindow.postMessage({ type: 'tweetdeckx-get-newest-post-time' }, '*');
      } catch (e) {
        finish(null);
      }
    });
  }

  // Clears a search column by only showing posts created after the newest
  // one it has loaded. Taking the cutoff from the loaded posts rather than
  // the clock means posts that arrived while the column was paused aren't
  // skipped. With nothing loaded to go by, an earlier cutoff is kept (the
  // user hasn't been shown anything newer), otherwise the current time.
  async function clearColumn(colId) {
    const colEl = columnsContainer.querySelector(`.deck-column[data-id="${colId}"]`);
    const iframe = colEl && colEl.querySelector('iframe');
    const newest = iframe ? await requestNewestPostTime(iframe) : null;

    const col = findColumn(colId);
    if (!col) return;
    col.clearedAt = newest !== null
      ? Math.floor(newest / 1000)
      : col.clearedAt || Math.floor(Date.now() / 1000);
    saveState();
    updateColumnSubtitle(col);
    reloadColumn(col);
  }

  function undoClearColumn(colId) {
    const col = findColumn(colId);
    if (!col) return;

    delete col.clearedAt;
    saveState();
    updateColumnSubtitle(col);
    reloadColumn(col);
  }

  function renameColumn(colId, newTitle) {
    const page = state.pages.find(p => p.columns.some(c => c.id === colId));
    if (!page) return;
    const col = page.columns.find(c => c.id === colId);
    if (!col) return;

    const trimmed = (newTitle || '').trim();
    col.title = trimmed || null;
    saveState();

    // Update the column title DOM in place (no full re-render, no iframe reload)
    const colEl = columnsContainer.querySelector(`.deck-column[data-id="${colId}"]`);
    if (colEl) {
      const titleEl = colEl.querySelector('.column-title');
      if (titleEl) {
        titleEl.textContent = col.title || getColumnTitle(col.type, col.param);
      }
    }
  }

  // -----------------------------------------
  // Page modal + emoji picker
  // -----------------------------------------

  let pageModalMode = null;
  let editingPageId = null;
  let selectedEmoji = null;

  function openPageModal(mode, page) {
    pageModalMode = mode;

    if (mode === 'edit' && page) {
      editingPageId = page.id;
      selectedEmoji = page.emoji;
      pageModalTitle.textContent = 'Edit Page';
      pageNameInput.value = page.name;
      btnPageSave.textContent = 'Save';
      if (state.pages.length > 1) {
        btnPageDelete.classList.remove('hidden');
      } else {
        btnPageDelete.classList.add('hidden');
      }
    } else {
      editingPageId = null;
      selectedEmoji = randomEmoji();
      pageModalTitle.textContent = 'New Page';
      pageNameInput.value = '';
      btnPageSave.textContent = 'Create Page';
      btnPageDelete.classList.add('hidden');
    }

    pageEmojiBtn.textContent = selectedEmoji;
    buildEmojiPicker();
    emojiPicker.classList.add('hidden');
    pageModalOverlay.classList.remove('hidden');
    pageNameInput.focus();
  }

  function closePageModal() {
    pageModalOverlay.classList.add('hidden');
    emojiPicker.classList.add('hidden');
    pageModalMode = null;
    editingPageId = null;
    selectedEmoji = null;
  }

  function buildEmojiPicker() {
    emojiPicker.replaceChildren();

    const searchInput = document.createElement('input');
    searchInput.className = 'emoji-picker-search';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search emojis...';
    emojiPicker.appendChild(searchInput);

    const contentWrapper = document.createElement('div');
    emojiPicker.appendChild(contentWrapper);

    function makeEmojiButton(emoji) {
      const btn = document.createElement('button');
      btn.className = 'emoji-pick' + (emoji === selectedEmoji ? ' selected' : '');
      btn.textContent = emoji;
      btn.addEventListener('click', () => {
        selectedEmoji = emoji;
        pageEmojiBtn.textContent = emoji;
        emojiPicker.querySelectorAll('.emoji-pick').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        emojiPicker.classList.add('hidden');
        pageEmojiBtn.classList.remove('active');
      });
      return btn;
    }

    function renderCategorized() {
      contentWrapper.replaceChildren();

      // If the full data isn't available (load failed), render the
      // fallback pool as a single flat grid so the picker stays usable.
      if (!emojiData) {
        const grid = document.createElement('div');
        grid.className = 'emoji-picker-grid';
        FALLBACK_EMOJI_POOL.forEach(e => grid.appendChild(makeEmojiButton(e)));
        contentWrapper.appendChild(grid);
        return;
      }

      emojiData.categories.forEach((cat) => {
        if (!cat.emojis.length) return;

        const label = document.createElement('div');
        label.className = 'emoji-picker-category';
        label.textContent = cat.label;
        contentWrapper.appendChild(label);

        const grid = document.createElement('div');
        grid.className = 'emoji-picker-grid';
        cat.emojis.forEach(e => grid.appendChild(makeEmojiButton(e)));
        contentWrapper.appendChild(grid);
      });
    }

    function renderSearchResults(q) {
      contentWrapper.replaceChildren();

      // Without a loaded searchIndex we can't meaningfully filter.
      // Fall back to showing the fallback pool unchanged.
      if (!emojiData) {
        renderCategorized();
        return;
      }

      const matches = [];
      for (const entry of emojiData.searchIndex) {
        if (entry.label.includes(q) || entry.tags.some(t => t.includes(q))) {
          matches.push(entry.unicode);
        }
      }

      const label = document.createElement('div');
      label.className = 'emoji-picker-category';
      label.textContent = 'Results';
      contentWrapper.appendChild(label);

      if (matches.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'emoji-picker-empty';
        empty.textContent = `No emojis match "${q}"`;
        contentWrapper.appendChild(empty);
        return;
      }

      const grid = document.createElement('div');
      grid.className = 'emoji-picker-grid';
      matches.forEach(e => grid.appendChild(makeEmojiButton(e)));
      contentWrapper.appendChild(grid);
    }

    function render(filter) {
      // While the data is still loading, keep the Loading placeholder in
      // place regardless of what's in the search box. The .then() handler
      // at the bottom of buildEmojiPicker will call render() again once
      // the promise resolves, at which point emojiData will be set and
      // the user's current search text (if any) will be applied.
      if (!emojiData && emojiDataPromise) return;
      const q = (filter || '').trim().toLowerCase();
      if (q) {
        renderSearchResults(q);
      } else {
        renderCategorized();
      }
    }

    // If data is still loading, show a placeholder and re-render once
    // it resolves. The re-render is guarded by checking that this
    // contentWrapper is still attached to the picker, so it's safe even
    // if the user closed and reopened the picker in the meantime.
    if (!emojiData && emojiDataPromise) {
      const loading = document.createElement('div');
      loading.className = 'emoji-picker-empty';
      loading.textContent = 'Loading emojis…';
      contentWrapper.appendChild(loading);

      emojiDataPromise.then(() => {
        if (contentWrapper.parentNode === emojiPicker) {
          render(searchInput.value);
        }
      });
    } else {
      render('');
    }

    searchInput.addEventListener('input', () => render(searchInput.value));
  }

  // Emoji button toggle
  pageEmojiBtn.addEventListener('click', () => {
    const isOpen = !emojiPicker.classList.contains('hidden');
    if (isOpen) {
      emojiPicker.classList.add('hidden');
      pageEmojiBtn.classList.remove('active');
    } else {
      const rect = pageEmojiBtn.getBoundingClientRect();
      emojiPicker.style.top = (rect.bottom + 6) + 'px';
      emojiPicker.style.left = rect.left + 'px';
      emojiPicker.classList.remove('hidden');
      pageEmojiBtn.classList.add('active');
      const searchInput = emojiPicker.querySelector('.emoji-picker-search');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        setTimeout(() => searchInput.focus(), 0);
      }
    }
  });

  // Close emoji picker on outside click
  document.addEventListener('click', (e) => {
    if (!emojiPicker.classList.contains('hidden') &&
        !emojiPicker.contains(e.target) &&
        e.target !== pageEmojiBtn) {
      emojiPicker.classList.add('hidden');
      pageEmojiBtn.classList.remove('active');
    }
  });

  // Page modal close handlers
  document.getElementById('page-modal-close').addEventListener('click', closePageModal);
  pageModalOverlay.addEventListener('click', (e) => {
    if (e.target === pageModalOverlay) closePageModal();
  });

  // Save button
  btnPageSave.addEventListener('click', () => {
    const name = pageNameInput.value.trim();
    if (!name) {
      pageNameInput.focus();
      return;
    }

    if (pageModalMode === 'create') {
      createPage(name, selectedEmoji);
    } else if (pageModalMode === 'edit' && editingPageId) {
      updatePage(editingPageId, name, selectedEmoji);
    }

    closePageModal();
  });

  // Enter in name input
  pageNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btnPageSave.click();
    }
  });

  // Delete button
  btnPageDelete.addEventListener('click', () => {
    if (!editingPageId) return;
    const page = state.pages.find(p => p.id === editingPageId);
    if (!page) return;

    const hasColumns = page.columns && page.columns.length > 0;
    if (hasColumns) {
      const msg = `Delete "${page.name}"? This page has ${page.columns.length} column(s) that will be removed.`;
      if (!confirm(msg)) return;
    }
    deletePage(editingPageId);
    closePageModal();
  });

  // -----------------------------------------
  // Page CRUD
  // -----------------------------------------

  function createPage(name, emoji) {
    // Hide current wrapper before switching
    const currentWrapper = getActiveWrapper();
    if (currentWrapper) {
      currentWrapper.classList.add('hidden');
    }
    if (state.activePageId && pageCache.has(state.activePageId)) {
      pageCache.get(state.activePageId).lastAccessed = Date.now();
    }

    const page = {
      id: generateId('page'),
      name: name,
      emoji: emoji,
      columns: [],
    };
    state.pages.push(page);
    state.activePageId = page.id;
    saveState();
    renderSidebar();
    renderColumns();
  }

  function updatePage(pageId, name, emoji) {
    const page = state.pages.find(p => p.id === pageId);
    if (!page) return;
    page.name = name;
    page.emoji = emoji;
    saveState();
    renderSidebar();
    // Update empty state text directly instead of re-rendering columns (which destroys live iframes)
    if (pageId === state.activePageId && (!page.columns || page.columns.length === 0)) {
      emptyStateEmoji.textContent = page.emoji;
      emptyStateTitle.textContent = page.name;
      emptyStateDesc.textContent = `Add columns to this page to start tracking your ${page.name}.`;
    }
  }

  function deletePage(pageId) {
    // Clean up runtime state for all columns on the deleted page
    const pageToDelete = state.pages.find(p => p.id === pageId);
    if (pageToDelete) {
      for (const col of pageToDelete.columns) {
        colRuntimeState.delete(col.id);
        clearRefreshTimer(col.id);
        lastRefreshAt.delete(col.id);
        columnOps.delete(col.id);
      }
    }

    // Remove the page's wrapper from DOM
    invalidateCache(pageId);
    state.pages = state.pages.filter(p => p.id !== pageId);
    if (state.activePageId === pageId) {
      state.activePageId = state.pages.length > 0 ? state.pages[0].id : null;
    }
    saveState();
    renderSidebar();
    renderColumns();
  }

  // Add page button
  document.getElementById('btn-add-page').addEventListener('click', () => {
    openPageModal('create');
  });

  // -----------------------------------------
  // Add Column Modal
  // -----------------------------------------

  let selectedType = null;

  function openAddColumnModal() {
    selectedType = null;
    typeInputArea.classList.add('hidden');
    typeInput.value = '';
    hideRepliesCheckbox.checked = false;
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    modalOverlay.classList.remove('hidden');
  }

  function closeModal() {
    modalOverlay.classList.add('hidden');
    selectedType = null;
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Type card selection
  document.querySelectorAll('.type-card').forEach((card) => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      const def = COLUMN_TYPES[type];

      document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      if (def.needsInput) {
        selectedType = type;
        typeInputLabel.textContent = def.inputLabel;
        typeInput.placeholder = def.placeholder;
        hideRepliesOption.classList.toggle('hidden', type !== 'search');
        typeInputArea.classList.remove('hidden');
        typeInput.focus();
      } else {
        addColumn(type);
        closeModal();
      }
    });
  });

  // Confirm add with input
  btnConfirmAdd.addEventListener('click', confirmAddWithInput);
  typeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmAddWithInput();
  });

  function confirmAddWithInput() {
    if (!selectedType) return;
    const value = typeInput.value.trim();
    if (!value) { typeInput.focus(); return; }
    addColumn(selectedType, value, {
      hideReplies: selectedType === 'search' && hideRepliesCheckbox.checked,
    });
    closeModal();
  }

  // Empty state add-column button
  document.getElementById('btn-add-column-empty').addEventListener('click', () => {
    openAddColumnModal();
  });

  // -----------------------------------------
  // Settings Modal
  // -----------------------------------------

  document.getElementById('btn-settings').addEventListener('click', () => {
    colWidthSlider.value = state.settings.columnWidth;
    colWidthValue.textContent = state.settings.columnWidth + 'px';
    themeSelect.value = state.settings.theme;
    hideAdsToggle.checked = state.settings.hideAds;
    hideColHeaderToggle.checked = state.settings.hideColumnHeader;
    keyboardShortcutsToggle.checked = state.settings.keyboardShortcuts;
    settingsOverlay.classList.remove('hidden');
  });

  document.getElementById('settings-close').addEventListener('click', closeSettingsModal);
  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) closeSettingsModal();
  });

  function closeSettingsModal() {
    settingsOverlay.classList.add('hidden');
  }

  colWidthSlider.addEventListener('input', () => {
    const val = parseInt(colWidthSlider.value);
    colWidthValue.textContent = val + 'px';
    state.settings.columnWidth = val;
    saveState();
    document.querySelectorAll('.deck-column').forEach(col => {
      col.style.flex = `0 0 ${val}px`;
      col.style.width = val + 'px';
    });
    setDockWidth();
  });

  themeSelect.addEventListener('change', () => {
    state.settings.theme = themeSelect.value;
    applyTheme();
    saveState();
  });

  hideAdsToggle.addEventListener('change', () => {
    state.settings.hideAds = hideAdsToggle.checked;
    saveState();
    broadcastHideAds();
  });

  hideColHeaderToggle.addEventListener('change', () => {
    state.settings.hideColumnHeader = hideColHeaderToggle.checked;
    saveState();
    broadcastHideColumnHeader();
  });

  keyboardShortcutsToggle.addEventListener('change', () => {
    state.settings.keyboardShortcuts = keyboardShortcutsToggle.checked;
    saveState();
    broadcastKeyboardShortcuts();
    if (!state.settings.keyboardShortcuts) markKeyboardFocus(null);
  });

  document.getElementById('btn-reset-pages').addEventListener('click', () => {
    if (confirm('Reset all pages? This will remove all pages and columns and cannot be undone.')) {
      deactivateActiveColumn();
      clearAllRefreshTimers();
      cancelPendingLoads();
      clearTimeout(deferredLoadTimer);
      clearAllCache();
      colRuntimeState.clear();
      lastRefreshAt.clear();
      refreshFailures.clear();
      columnOps.clear();
      pendingRefreshes.forEach((finish) => finish(false, true));
      pendingNavigations.forEach((finish) => finish(false, true));
      const defaultPage = {
        id: generateId('page'),
        name: 'Home',
        emoji: '🏠',
        columns: [],
      };
      state.pages = [defaultPage];
      state.activePageId = defaultPage.id;
      saveState();
      renderSidebar();
      renderColumns();
      closeSettingsModal();
    }
  });

  // -----------------------------------------
  // Keyboard shortcuts
  // -----------------------------------------

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!modalOverlay.classList.contains('hidden')) closeModal();
      if (!settingsOverlay.classList.contains('hidden')) closeSettingsModal();
      if (!pageModalOverlay.classList.contains('hidden')) closePageModal();
      closeCompose();
      closeAllDropdowns();
    }
  });

  // Navigation shortcuts (opt-in via settings). The keymap lives in
  // shortcuts.js. Keys pressed while a column's iframe has focus never reach
  // this document, so the content script forwards those as
  // 'tweetdeckx-shortcut' messages instead.

  function getActiveColumnEls() {
    const wrapper = getActiveWrapper();
    return wrapper ? [...wrapper.querySelectorAll('.deck-column')] : [];
  }

  // The column shortcuts pressed on the deck itself act on: the one with
  // keyboard focus, falling back to the active (hovered) column.
  function getCurrentColumnEl() {
    const wrapper = getActiveWrapper();
    if (!wrapper) return null;
    return wrapper.querySelector('.deck-column.keyboard-focus')
      || (activeColumnId && wrapper.querySelector(`.deck-column[data-id="${activeColumnId}"]`))
      || null;
  }

  function findColumnElForSource(source) {
    for (const iframe of columnsContainer.querySelectorAll('iframe')) {
      if (iframe.contentWindow === source) return iframe.closest('.deck-column');
    }
    return null;
  }

  function markKeyboardFocus(colEl) {
    columnsContainer.querySelectorAll('.deck-column.keyboard-focus').forEach((el) => {
      if (el !== colEl) el.classList.remove('keyboard-focus');
    });
    if (colEl) colEl.classList.add('keyboard-focus');
  }

  function focusColumn(colEl) {
    if (!colEl) return;
    markKeyboardFocus(colEl);
    colEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    // Moving focus into the iframe lets X.com's own shortcuts (j/k, l, ...)
    // work in this column straight away.
    const iframe = colEl.querySelector('iframe');
    if (iframe) iframe.focus();
    activateColumn(colEl.dataset.id);
  }

  // Modals take keyboard input on the deck page, so hand focus back from
  // whichever iframe has it before opening one.
  function releaseIframeFocus() {
    const el = document.activeElement;
    if (el && el.tagName === 'IFRAME') el.blur();
  }

  function isShortcutBlocked() {
    return !!lightboxIframe || !!document.querySelector('.modal-overlay:not(.hidden)');
  }

  function runShortcut(action, colEl) {
    closeAllDropdowns();
    const columns = getActiveColumnEls();
    switch (action.type) {
      case 'focus-column':
        focusColumn(columns[action.index]);
        break;
      case 'focus-prev-column':
      case 'focus-next-column': {
        const step = action.type === 'focus-next-column' ? 1 : -1;
        const current = columns.indexOf(colEl);
        // Without a current column, start from the first or last one
        const target = current === -1 ? (step > 0 ? 0 : columns.length - 1) : current + step;
        focusColumn(columns[target]);
        break;
      }
      case 'switch-page': {
        const page = state.pages[action.index];
        if (page) switchPage(page.id);
        break;
      }
      case 'back': {
        // Same condition as the header's back button, so we never step back
        // past the column's own start page
        const backBtn = colEl && colEl.querySelector('.col-back');
        if (backBtn && backBtn.style.display !== 'none') backBtn.click();
        break;
      }
      case 'add-column':
        releaseIframeFocus();
        openAddColumnModal();
        modalOverlay.querySelector('.type-card').focus();
        break;
      case 'add-page':
        releaseIframeFocus();
        openPageModal('create');
        break;
    }
  }

  document.addEventListener('keydown', (e) => {
    if (!state.settings.keyboardShortcuts || isShortcutBlocked()) return;
    const action = window.TweetDeckXShortcuts.match(e);
    if (!action) return;
    e.preventDefault();
    runShortcut(action, getCurrentColumnEl());
  });

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'tweetdeckx-shortcut') return;
    if (!state.settings.keyboardShortcuts || isShortcutBlocked()) return;
    const action = e.data.action;
    if (!action || typeof action.type !== 'string') return;
    if ('index' in action && !Number.isInteger(action.index)) return;
    const colEl = findColumnElForSource(e.source);
    if (colEl) {
      runShortcut(action, colEl);
    } else if (isDockSource(e.source)) {
      if (action.type === 'back') dockBack();
      else runShortcut(action, null);
    }
  });

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'tweetdeckx-frame-focus') return;
    if (!state.settings.keyboardShortcuts) return;
    if (isDockSource(e.source)) {
      // Keys now go to the panel, so no column is highlighted as taking them
      if (e.data.focused) markKeyboardFocus(null);
      return;
    }
    const colEl = findColumnElForSource(e.source);
    if (!colEl) return;
    if (e.data.focused) {
      markKeyboardFocus(colEl);
    } else {
      colEl.classList.remove('keyboard-focus');
    }
  });

  // -----------------------------------------
  // Rate-limit toast handling
  // -----------------------------------------

  let rateLimitToastTimer = null;
  const rateLimitText = rateLimitToast.querySelector('.toast-text');

  // A 429 exhausts one endpoint's window, so only columns on that endpoint
  // wait for it; everything else keeps its own budget. Only a 429 with no
  // identifiable endpoint pauses the whole deck. The same 429 can arrive
  // from the frame and from the background, so the toast is keyed on it.
  function onRateLimited(msg) {
    const resetSec = msg.reset || Math.ceil(Date.now() / 1000) + 60;
    const op = msg.op || null;
    const key = `${op || '*'}:${resetSec}`;
    if (op) {
      const prev = rateLimits[op] || {};
      rateLimits[op] = { limit: prev.limit || 0, remaining: 0, reset: resetSec, at: Date.now() };
    } else {
      rateLimitedUntil = Math.max(rateLimitedUntil, resetSec * 1000 + 2000);
    }
    cancelPendingLoads();
    // Columns that were about to load now have to check their budget again
    const page = getActivePage();
    const wrapper = getActiveWrapper();
    if (page && wrapper) {
      wrapper.querySelectorAll('.deck-column[data-needs-load]').forEach((colEl) => {
        const col = page.columns.find(c => c.id === colEl.dataset.id);
        if (col && !canSpend(col)) loadIframeForColumn(colEl, col);
      });
    }
    if (key !== lastRateLimitToastKey) {
      lastRateLimitToastKey = key;
      showRateLimitToast(op, Math.max(0, resetSec * 1000 - Date.now()));
    }
    scheduleDeferredLoads();
    updateBudgetIndicators();
  }

  // Shown once per 429, briefly. The column headers and loading notes
  // carry the wait from then on.
  function showRateLimitToast(op, waitMs) {
    rateLimitText.textContent = op
      ? `X is rate limiting ${op}. Columns on it resume in ${formatWait(waitMs)}.`
      : `X is rate limiting requests. Columns resume in ${formatWait(waitMs)}.`;
    rateLimitToast.classList.remove('hidden');
    clearTimeout(rateLimitToastTimer);
    rateLimitToastTimer = setTimeout(dismissRateLimitToast, 8000);
  }

  function dismissRateLimitToast() {
    rateLimitToast.classList.add('hidden');
    clearTimeout(rateLimitToastTimer);
  }

  function showBudgetToast(col) {
    const b = budgetFor(col);
    const wait = formatWait(waitFor(col));
    rateLimitText.textContent = b
      ? `${b.op} has ${b.remaining} of ${b.limit} calls left in this window. Resets in ${wait}.`
      : `X is rate limiting requests. Resets in ${wait}.`;
    rateLimitToast.classList.remove('hidden');
    clearTimeout(rateLimitToastTimer);
    rateLimitToastTimer = setTimeout(dismissRateLimitToast, 6000);
  }

  // Columns left unloaded because of a budget (marked data-budget-wait,
  // as opposed to columns merely waiting to scroll into view) are retried
  // once the earliest relevant window resets.
  function scheduleDeferredLoads() {
    const page = getActivePage();
    const wrapper = getActiveWrapper();
    if (!page || !wrapper) return;
    let soonest = Infinity;
    wrapper.querySelectorAll('.deck-column[data-budget-wait]').forEach((colEl) => {
      const col = page.columns.find(c => c.id === colEl.dataset.id);
      if (col) soonest = Math.min(soonest, waitFor(col));
    });
    if (soonest === Infinity) return;
    clearTimeout(deferredLoadTimer);
    deferredLoadTimer = setTimeout(loadDeferredColumns, Math.max(1000, soonest));
  }

  function loadDeferredColumns() {
    const page = getActivePage();
    if (!page) return;
    const wrapper = getActiveWrapper();
    if (!wrapper) return;
    const deferred = wrapper.querySelectorAll('.deck-column[data-budget-wait]');
    let delay = 0;
    deferred.forEach((colEl) => {
      if (!colEl.querySelector('.column-loading')) return;
      const colData = page.columns.find(c => c.id === colEl.dataset.id);
      if (!colData) return;
      delay += randomStagger();
      const timerId = setTimeout(() => {
        loadIframeForColumn(colEl, colData);
        pendingStaggerTimers = pendingStaggerTimers.filter(t => t !== timerId);
      }, delay);
      pendingStaggerTimers.push(timerId);
    });
  }

  // Merges the background's table (which also sees other x.com tabs) with
  // what the frames reported directly, newest entry per endpoint wins.
  function applyRateLimits(limits) {
    if (!limits || typeof limits !== 'object') return;
    Object.keys(limits).forEach((op) => {
      const b = limits[op];
      if (!b || typeof b !== 'object') return;
      const prev = rateLimits[op];
      if (!prev || !(prev.at > (b.at || 0))) rateLimits[op] = b;
    });
    updateBudgetIndicators();
    scheduleDeferredLoads();
  }

  // Shows the tightest known budget on each column header, like "12/50",
  // with the reset time in the tooltip. Only columns whose endpoint X has
  // reported on get one.
  function updateBudgetIndicators() {
    columnsContainer.querySelectorAll('.deck-column').forEach((colEl) => {
      const span = colEl.querySelector('.column-budget');
      if (!span) return;
      renderBudgetIndicator(span, findColumn(colEl.dataset.id));
    });
    renderBudgetIndicator(dockBudget, dockIframe ? DOCK_COL : null);
  }

  function renderBudgetIndicator(span, col) {
    const b = col && budgetFor(col);
    if (!b) {
      span.classList.add('hidden');
      return;
    }
    const wait = formatWait(Math.max(0, b.reset * 1000 - Date.now()));
    span.textContent = `${b.remaining}/${b.limit}`;
    span.title = `${b.op}: ${b.remaining} of ${b.limit} calls left, resets in ${wait}`;
    span.classList.toggle('low', b.remaining <= BUDGET_RESERVE);
    span.classList.remove('hidden');
  }

  function scheduleBudgetIndicatorUpdate() {
    if (budgetIndicatorTimer) return;
    budgetIndicatorTimer = setTimeout(() => {
      budgetIndicatorTimer = null;
      updateBudgetIndicators();
    }, 200);
  }

  setInterval(updateBudgetIndicators, 30000);

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'tweetdeckx-rate-limited') onRateLimited(msg);
    if (msg.type === 'tweetdeckx-rate-limits') applyRateLimits(msg.limits);
    if (msg.type === 'tweetdeckx-backoff' && msg.ms > 0) {
      backoffUntil = Math.max(backoffUntil, Date.now() + msg.ms);
      scheduleDeferredLoads();
    }
    if (msg.type === 'tweetdeckx-update-available') showUpdateToast(msg.version, msg.url);
  });

  document.getElementById('toast-close').addEventListener('click', dismissRateLimitToast);

  // -----------------------------------------
  // Update notification toast
  // -----------------------------------------

  function showUpdateToast(version, url) {
    if (!updateToast.classList.contains('hidden')) return;
    updateVersion.textContent = 'v' + version;
    updateLink.href = url;
    updateToast.classList.remove('hidden');
  }

  function dismissUpdateToast() {
    updateToast.classList.add('hidden');
  }

  document.getElementById('update-toast-close').addEventListener('click', dismissUpdateToast);

  // Settings a panel or compose frame starts with. Columns send theirs in
  // loadIframeForColumn.
  function sendFrameInit(iframe, { hideColumnHeader, keyboardShortcuts }) {
    try {
      iframe.contentWindow.postMessage({
        type: 'tweetdeckx-init',
        hideAds: state.settings.hideAds,
        hideColumnHeader,
        keyboardShortcuts,
      }, '*');
      iframe.contentWindow.postMessage({
        type: 'tweetdeckx-set-column-width',
        width: state.settings.columnWidth,
      }, '*');
    } catch (e) {
      // Cross-origin, content script handles it
    }
  }

  const FRAME_SANDBOX = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox';
  const FRAME_ALLOW = 'autoplay; encrypted-media; fullscreen';

  // -----------------------------------------
  // Notifications panel
  // -----------------------------------------
  // X's notifications page in a panel docked next to the sidebar, so it can
  // be read from any page. It sits outside #columns-container and isn't a
  // .deck-column, so the column code (pausing, message routing, drag and
  // drop, page switching, reset) never sees it. It follows the column
  // rules on its own: loaded only when opened and its endpoint has budget,
  // awake only while the pointer rests on it, refreshed in place in the
  // background while open, and paused and left alone while closed.

  const DOCK_COL = { id: 'dock-notifications', type: 'notifications', param: null };
  const dockPanel = document.getElementById('dock-panel');
  const dockToggleBtn = document.getElementById('btn-notifications');
  const dockBackBtn = dockPanel.querySelector('[data-dock-action="back"]');
  const dockRefreshBtn = dockPanel.querySelector('[data-dock-action="refresh"]');
  const dockBudget = dockPanel.querySelector('.column-budget');
  let dockIframe = null;
  let dockLoadTimer = null;      // pending load: the start-up stagger or a budget wait
  let dockRefreshTimer = null;   // background refresh cycle while open
  let dockRefreshPending = null; // (ok, superseded) => void awaiting tweetdeckx-refresh-result
  let dockRefreshFailures = 0;
  let dockLastRefreshAt = 0;
  let dockHoverTimer = null;

  function isDockSource(source) {
    return !!dockIframe && dockIframe.contentWindow === source;
  }

  function postToDock(msg) {
    if (!dockIframe) return;
    try { dockIframe.contentWindow.postMessage(msg, '*'); } catch (e) {}
  }

  function setDockWidth() {
    document.documentElement.style.setProperty('--dock-width',
      state.settings.notificationsPanel ? state.settings.columnWidth + 'px' : '0px');
  }

  function openDock({ delayLoad = false } = {}) {
    state.settings.notificationsPanel = true;
    saveState();
    setDockWidth();
    dockPanel.classList.remove('hidden');
    dockToggleBtn.classList.add('active');
    if (!dockIframe) {
      if (delayLoad) scheduleDockLoad(randomStagger());
      else loadDock();
      return;
    }
    // Catch up if it went stale while closed, like a page switched back to
    if (Date.now() - dockLastRefreshAt >= STALE_AFTER_MS) refreshDock({ allowReload: false });
    resetDockRefreshTimer();
  }

  // The frame is kept, paused, so opening the panel again is instant
  function closeDock() {
    state.settings.notificationsPanel = false;
    saveState();
    setDockWidth();
    dockPanel.classList.add('hidden');
    dockToggleBtn.classList.remove('active');
    clearTimeout(dockHoverTimer);
    clearTimeout(dockLoadTimer);
    clearTimeout(dockRefreshTimer);
    sleepDock();
  }

  function scheduleDockLoad(ms) {
    clearTimeout(dockLoadTimer);
    dockLoadTimer = setTimeout(loadDock, ms);
  }

  function loadDock() {
    clearTimeout(dockLoadTimer);
    if (dockIframe || !state.settings.notificationsPanel) return;
    const loadingEl = dockPanel.querySelector('.column-loading');
    if (!loadingEl) return;

    // Same rule as loadIframeForColumn: booting X into an exhausted budget
    // only spends what is left, so wait for the window to reset
    if (!canSpend(DOCK_COL)) {
      const note = loadingEl.querySelector('.loading-note');
      const b = budgetFor(DOCK_COL);
      const wait = formatWait(waitFor(DOCK_COL));
      note.textContent = b
        ? `Waiting for X's ${b.op} rate limit to reset (${wait})`
        : `Waiting for X's rate limit to reset (${wait})`;
      scheduleDockLoad(Math.max(1000, waitFor(DOCK_COL)));
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'column-frame';
    iframe.sandbox = FRAME_SANDBOX;
    iframe.allow = FRAME_ALLOW;
    iframe.src = getCanonicalUrl(DOCK_COL);
    iframe.addEventListener('load', () => {
      sendFrameInit(iframe, {
        hideColumnHeader: state.settings.hideColumnHeader,
        keyboardShortcuts: state.settings.keyboardShortcuts,
      });
      // Boot visible for a moment, then pause unless the user is on it
      setTimeout(() => {
        if (!dockAwake) postToDock({ type: 'tweetdeckx-pause' });
      }, RESUME_BURST_MS);
    });
    loadingEl.replaceWith(iframe);
    dockIframe = iframe;
    dockLastRefreshAt = Date.now();
    resetDockRefreshTimer();
    updateBudgetIndicators();
  }

  // Same shape as refreshColumn: an in-place refresh, and a reload only
  // when that fetched nothing and reloading is allowed.
  function refreshDock({ allowReload = true } = {}) {
    if (!dockIframe) return;
    if (!canSpend(DOCK_COL)) {
      updateBudgetIndicators();
      return;
    }
    if (dockRefreshPending) dockRefreshPending(false, true);
    const iframe = dockIframe;
    dockRefreshBtn.classList.add('refreshing');
    let timer = null;
    const finish = (ok, superseded) => {
      clearTimeout(timer);
      if (dockRefreshPending === finish) dockRefreshPending = null;
      if (superseded) return; // a newer refresh took over
      dockRefreshBtn.classList.remove('refreshing');
      if (ok) {
        dockLastRefreshAt = Date.now();
        dockRefreshFailures = 0;
        return;
      }
      dockRefreshFailures++;
      if (!allowReload || !iframe.isConnected) return;
      dockLastRefreshAt = Date.now();
      dockRefreshFailures = 0;
      iframe.src = getCanonicalUrl(DOCK_COL);
    };
    // The frame answers within 1.5s; the margin covers message delivery
    timer = setTimeout(() => finish(false), 3000);
    dockRefreshPending = finish;
    postToDock({ type: 'tweetdeckx-refresh' });
  }

  // Background refresh while open, on the same cycle as an on-screen
  // column. Skipped while the user is on it, and after three refreshes that
  // fetched nothing a reload is allowed once.
  function resetDockRefreshTimer() {
    clearTimeout(dockRefreshTimer);
    const tick = () => {
      if (state.settings.notificationsPanel && dockIframe && !dockAwake) {
        refreshDock({ allowReload: dockRefreshFailures >= 3 });
      }
      dockRefreshTimer = setTimeout(tick, jitteredInterval());
    };
    dockRefreshTimer = setTimeout(tick, jitteredInterval());
  }

  function dockBack() {
    if (dockBackBtn.style.display === 'none') return;
    postToDock({ type: 'tweetdeckx-back', home: getCanonicalUrl(DOCK_COL) });
  }

  // Only one frame is awake at a time: waking the panel pauses the active
  // column, and activateColumn puts the panel back to sleep.
  function wakeDock() {
    if (!dockIframe || !state.settings.notificationsPanel) return;
    if (!dockAwake) {
      deactivateActiveColumn();
      dockAwake = true;
      postToDock({ type: 'tweetdeckx-resume' });
      resetDockRefreshTimer();
    }
    clearTimeout(dockIdleTimer);
    dockIdleTimer = setTimeout(sleepDock, IDLE_TIMEOUT);
  }

  function sleepDock() {
    clearTimeout(dockIdleTimer);
    dockIdleTimer = null;
    if (!dockAwake) return;
    dockAwake = false;
    postToDock({ type: 'tweetdeckx-pause' });
  }

  dockToggleBtn.addEventListener('click', () => {
    if (state.settings.notificationsPanel) closeDock();
    else openDock();
  });

  dockPanel.querySelector('.dock-header').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-dock-action]');
    if (!btn) return;
    const action = btn.dataset.dockAction;
    if (action === 'back') {
      dockBack();
    } else if (action === 'refresh') {
      if (!canSpend(DOCK_COL)) showBudgetToast(DOCK_COL);
      else if (dockIframe) refreshDock();
      else loadDock();
      wakeDock();
    } else if (action === 'close') {
      closeDock();
    }
  });

  // Same activation as a column: the pointer has to rest on the panel
  dockPanel.addEventListener('mouseenter', () => {
    if (dockAwake) {
      wakeDock();
      return;
    }
    clearTimeout(dockHoverTimer);
    dockHoverTimer = setTimeout(() => {
      dockHoverTimer = null;
      wakeDock();
    }, HOVER_ACTIVATE_MS);
  });

  dockPanel.addEventListener('mouseleave', () => {
    clearTimeout(dockHoverTimer);
    dockHoverTimer = null;
    if (dockAwake) wakeDock(); // restart the idle countdown
  });

  dockPanel.addEventListener('wheel', wakeDock, { passive: true });

  // Focus moving into the panel's frame, and keeping it there
  window.addEventListener('blur', () => {
    setTimeout(() => {
      if (dockIframe && document.activeElement === dockIframe) wakeDock();
    }, 0);
  });

  setInterval(() => {
    if (dockIframe && document.activeElement === dockIframe) wakeDock();
  }, 10000);

  window.addEventListener('message', (e) => {
    if (!e.data || !isDockSource(e.source)) return;
    if (e.data.type === 'tweetdeckx-refresh-result') {
      if (dockRefreshPending) dockRefreshPending(!!e.data.ok);
    } else if (e.data.type === 'tweetdeckx-url-changed' && typeof e.data.url === 'string') {
      const away = !urlsEquivalent(e.data.url, getCanonicalUrl(DOCK_COL));
      dockBackBtn.style.display = away ? '' : 'none';
    } else if (e.data.type === 'tweetdeckx-user-activity') {
      wakeDock();
    }
  });

  // -----------------------------------------
  // Compose
  // -----------------------------------------
  // X's own composer (/compose/post) in an overlay, so a post can be
  // written from any page. The frame is as wide as a column, the width the
  // reply composer inside a column already works at. It is loaded on first
  // use and kept, so composing again is a router push in an already booted
  // client rather than another boot. X leaves /compose/ once the post is
  // sent or its composer is closed, and that closes the overlay. Hiding the
  // overlay with Escape or a click outside it keeps an unfinished draft.

  const COMPOSE_URL = 'https://x.com/compose/post';
  // How long the frame stays awake after the overlay closes, so a post
  // still uploading media isn't paused mid-send
  const COMPOSE_SLEEP_MS = 5 * 60 * 1000;
  // URL changes this soon after opening are the composer starting up, not
  // the user leaving it
  const COMPOSE_SETTLE_MS = 1500;
  const composeOverlay = document.getElementById('compose-overlay');
  const composeBox = document.getElementById('compose-box');
  let composeIframe = null;
  let composeUrl = null;          // the URL the frame last reported
  let composeSeen = false;        // the composer has shown since the overlay opened
  let composeOpenedAt = 0;
  let composeSleepTimer = null;
  let composeNavPending = null;   // (ok, superseded) => void awaiting tweetdeckx-navigate-result

  // X also expresses the composer as a modal over another view, as in
  // /home?@modal=/compose/post (seen in its login redirect), so both forms
  // count as still composing.
  function isComposeUrl(url) {
    try {
      const u = new URL(url);
      return u.pathname.startsWith('/compose/') || (u.searchParams.get('@modal') || '').startsWith('/compose/');
    } catch (e) {
      return false;
    }
  }

  function postToCompose(msg) {
    if (!composeIframe) return;
    try { composeIframe.contentWindow.postMessage(msg, '*'); } catch (e) {}
  }

  function openCompose() {
    if (!composeOverlay.classList.contains('hidden')) return;
    closeAllDropdowns();
    releaseIframeFocus();
    composeBox.style.width = state.settings.columnWidth + 'px';
    composeOverlay.classList.remove('hidden');
    composeOpenedAt = Date.now();
    clearTimeout(composeSleepTimer);
    if (!composeIframe) {
      composeSeen = false;
      loadCompose();
    } else {
      postToCompose({ type: 'tweetdeckx-resume' });
      composeSeen = !!composeUrl && isComposeUrl(composeUrl);
      if (!composeSeen) navigateCompose();
    }
    composeIframe.focus();
  }

  function closeCompose() {
    if (composeOverlay.classList.contains('hidden')) return;
    composeOverlay.classList.add('hidden');
    if (composeIframe && document.activeElement === composeIframe) composeIframe.blur();
    clearTimeout(composeSleepTimer);
    composeSleepTimer = setTimeout(() => postToCompose({ type: 'tweetdeckx-pause' }), COMPOSE_SLEEP_MS);
  }

  function loadCompose() {
    const iframe = document.createElement('iframe');
    iframe.className = 'compose-frame';
    iframe.sandbox = FRAME_SANDBOX;
    iframe.allow = FRAME_ALLOW;
    iframe.src = COMPOSE_URL;
    iframe.addEventListener('load', () => {
      sendFrameInit(iframe, { hideColumnHeader: false, keyboardShortcuts: false });
    });
    const loadingEl = composeBox.querySelector('.column-loading');
    if (loadingEl) loadingEl.replaceWith(iframe);
    else composeBox.appendChild(iframe);
    composeIframe = iframe;
  }

  // Opens the composer in the booted client through X's router, the same
  // thing X's own Post button does, and reloads into it if that fails.
  function navigateCompose() {
    const iframe = composeIframe;
    if (composeNavPending) composeNavPending(false, true);
    let timer = null;
    const finish = (ok, superseded) => {
      clearTimeout(timer);
      if (composeNavPending === finish) composeNavPending = null;
      if (superseded) return;
      if (!ok && iframe.isConnected) iframe.src = COMPOSE_URL;
    };
    // The frame answers within 1.2s; the margin covers message delivery
    timer = setTimeout(() => finish(false), 2500);
    composeNavPending = finish;
    postToCompose({ type: 'tweetdeckx-navigate', url: COMPOSE_URL });
  }

  document.getElementById('btn-compose').addEventListener('click', openCompose);

  composeOverlay.addEventListener('click', (e) => {
    if (e.target === composeOverlay) closeCompose();
  });

  // -----------------------------------------
  // Notification badge
  // -----------------------------------------
  // The unread count on the bell is whatever X's own badge poll last
  // returned in any of the deck's frames (see reportBadgeCount in
  // page-context.js), so it costs no calls. X only polls in an awake frame,
  // so the count catches up whenever a column or the panel is woken and
  // holds its last value while the deck is idle. Several frames can report,
  // so the newest response wins.

  const notificationsBadge = dockToggleBtn.querySelector('.sidebar-badge');
  let badgeCountAt = 0;

  function isDeckFrame(source) {
    return !!findColumnElForSource(source) || isDockSource(source)
      || (!!composeIframe && composeIframe.contentWindow === source);
  }

  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'tweetdeckx-badge-count') return;
    const n = e.data.notifications;
    const at = e.data.at;
    if (!Number.isInteger(n) || n < 0 || typeof at !== 'number') return;
    if (!isDeckFrame(e.source) || at < badgeCountAt) return;
    badgeCountAt = at;
    notificationsBadge.textContent = n > 99 ? '99+' : String(n);
    notificationsBadge.classList.toggle('hidden', n === 0);
    dockToggleBtn.title = n ? `Notifications (${n} unread)` : 'Notifications';
  });

  window.addEventListener('message', (e) => {
    if (!e.data || !composeIframe || e.source !== composeIframe.contentWindow) return;
    if (e.data.type === 'tweetdeckx-navigate-result') {
      if (composeNavPending) composeNavPending(!!e.data.ok);
      return;
    }
    if (e.data.type !== 'tweetdeckx-url-changed' || typeof e.data.url !== 'string') return;
    composeUrl = e.data.url;
    if (composeOverlay.classList.contains('hidden')) return;
    if (isComposeUrl(composeUrl)) {
      composeSeen = true;
    } else if (composeSeen && Date.now() - composeOpenedAt > COMPOSE_SETTLE_MS) {
      closeCompose();
    }
  });

  // -----------------------------------------
  // Init
  // -----------------------------------------

  async function init() {
    await loadState();

    // Kick off emoji data load in the background. Do NOT await - this
    // must not block first paint. The picker will show a Loading
    // placeholder if the user opens it before this completes.
    loadEmojiData();

    // Remove old storage keys from pre-pages era
    chrome.storage.local.remove(['tweetdeckx_columns', 'tweetdeckx_settings']);

    // Create default page if none exist
    if (state.pages.length === 0) {
      state.pages.push({
        id: generateId('page'),
        name: 'Home',
        emoji: '🏠',
        columns: [],
      });
    }

    // Ensure activePageId is valid
    if (!state.pages.find(p => p.id === state.activePageId)) {
      state.activePageId = state.pages[0].id;
    }

    saveState();
    applyTheme();
    renderSidebar();

    // Pick up the rate-limit headers the background has seen so far, so the
    // first columns are loaded against a known budget
    try {
      applyRateLimits(await Promise.race([
        chrome.runtime.sendMessage({ type: 'tweetdeckx-get-rate-limits' }),
        new Promise((resolve) => setTimeout(() => resolve(null), 1500)),
      ]));
    } catch (e) {
      // Background not reachable — load without a budget
    }

    // Restore the notifications panel before the columns lay out. Its frame
    // loads a moment after the first column so the two don't boot at once.
    if (state.settings.notificationsPanel) openDock({ delayLoad: true });

    renderColumns();

    // Request an update check from the background script
    chrome.runtime.sendMessage({ type: 'tweetdeckx-check-update' }).catch(() => {});
  }

  init();
})();
