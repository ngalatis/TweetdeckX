// Open the deck page when the extension icon is clicked
chrome.action.onClicked.addListener(async () => {
  const deckUrl = chrome.runtime.getURL('deck.html');

  // Check if deck is already open in a tab
  const tabs = await chrome.tabs.query({ url: deckUrl });
  if (tabs.length > 0) {
    // Focus existing deck tab
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    // Open new deck tab
    await chrome.tabs.create({ url: deckUrl });
  }
});

// -------------------------------------------------------
// CSRF Token Bridge
// -------------------------------------------------------
// X.com requires the x-csrf-token header to match the ct0 cookie.
// When x.com loads in an iframe from chrome-extension://, cookie
// partitioning can cause a mismatch. We fix this by:
// 1. Reading the real ct0 cookie via chrome.cookies API
// 2. Setting the x-csrf-token header on API requests via dynamic rules
// 3. Providing cookies to content scripts for document.cookie injection

async function updateCsrfRules() {
  const cookie = await chrome.cookies.get({ url: 'https://x.com', name: 'ct0' });
  const ct0 = cookie ? cookie.value : null;

  // Remove old dynamic rules
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(r => r.id);

  if (!ct0) {
    if (removeRuleIds.length > 0) {
      await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds });
    }
    return;
  }

  // Create rules that set the x-csrf-token header on API requests
  // This ensures the header always matches the ct0 cookie the server expects
  const addRules = [
    {
      id: 1000,
      priority: 3,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          {
            header: 'x-csrf-token',
            operation: 'set',
            value: ct0,
          },
        ],
      },
      condition: {
        urlFilter: '||api.x.com',
        resourceTypes: ['xmlhttprequest'],
      },
    },
    {
      id: 1001,
      priority: 3,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [
          {
            header: 'x-csrf-token',
            operation: 'set',
            value: ct0,
          },
        ],
      },
      condition: {
        urlFilter: '||x.com/i/api',
        resourceTypes: ['xmlhttprequest'],
      },
    },
  ];

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
  // console.log('[TweetDeckX] CSRF rules updated, ct0 length:', ct0.length);
}

// Update rules on startup
updateCsrfRules();

// Update rules whenever x.com cookies change (debounced — iframe loads
// cause dozens of cookie writes; the ct0 token changes on the scale of
// hours, not milliseconds)
let csrfDebounceTimer = null;
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (changeInfo.cookie.domain.includes('x.com')) {
    clearTimeout(csrfDebounceTimer);
    csrfDebounceTimer = setTimeout(updateCsrfRules, 1000);
  }
});

// -------------------------------------------------------
// Cookie bridge for content scripts
// -------------------------------------------------------
// Content scripts request cookies to inject into the iframe's
// document.cookie, ensuring X.com's JS reads the correct values.

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'tweetdeckx-get-cookies') {
    chrome.cookies.getAll({ domain: '.x.com' }, (cookies) => {
      // Only send non-httpOnly cookies (httpOnly can't be set via JS)
      const injectable = cookies
        .filter((c) => !c.httpOnly)
        .map((c) => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          secure: c.secure,
        }));
      sendResponse(injectable);
    });
    return true; // Keep channel open for async response
  }
});

// Log when rules are matched (for debugging — uncomment when needed)
// if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
//   chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
//     console.log('Rule matched:', info.request.url, 'Rule ID:', info.rule.ruleId, 'Type:', info.request.type);
//   });
// }

// -------------------------------------------------------
// Rate limit (429) detection
// -------------------------------------------------------
// Monitor responses from X.com for 429 status codes.
// When detected, notify the deck page so it can pause loading
// and warn the user.

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.statusCode === 429) {
      chrome.runtime.sendMessage({ type: 'tweetdeckx-rate-limited' }).catch(() => {
        // Deck page may not be open — ignore
      });
    }
  },
  { urls: ['https://x.com/*', 'https://api.x.com/*'] }
);

// -------------------------------------------------------
// Update notification
// -------------------------------------------------------
// Check GitHub releases for newer versions and notify the
// deck page so it can show an update banner.

const GITHUB_RELEASES_URL = 'https://api.github.com/repos/ngalatis/TweetdeckX/releases/latest';
const UPDATE_CHECK_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

async function checkForUpdate() {
  try {
    const resp = await fetch(GITHUB_RELEASES_URL, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });
    if (!resp.ok) return;
    const release = await resp.json();
    const latestTag = (release.tag_name || '').replace(/^v/, '');
    if (!latestTag) return;
    const currentVersion = chrome.runtime.getManifest().version;
    if (compareVersions(latestTag, currentVersion) > 0) {
      chrome.runtime.sendMessage({
        type: 'tweetdeckx-update-available',
        version: latestTag,
        url: release.html_url,
      }).catch(() => {
        // Deck page may not be open — ignore
      });
    }
  } catch (e) {
    // Network error — silently ignore
  }
}

// Check on startup (with a short delay to not compete with other init work)
setTimeout(checkForUpdate, 10000);

// Check periodically
setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL);

// Allow the deck page to request an update check on demand
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'tweetdeckx-check-update') {
    checkForUpdate();
  }
});
