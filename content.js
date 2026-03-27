// TweetDeckX Content Script
// Runs at document_start in the ISOLATED world.
// Frame-busting defeat and interval pause/resume are handled by
// page-context.js (MAIN world, registered separately in manifest.json).

(function () {
  // Only apply in iframe context (not when user visits x.com normally)
  if (window === window.top) return;

  // -------------------------------------------------------
  // PHASE 1b: Inject first-party cookies into this iframe
  // -------------------------------------------------------
  // Cookie partitioning means this iframe has a separate cookie jar.
  // We bridge cookies from the first-party context so X.com's JS
  // reads the correct ct0 (CSRF token) and other session values.

  chrome.runtime.sendMessage({ type: 'tweetdeckx-get-cookies' }, (cookies) => {
    if (chrome.runtime.lastError || !cookies) return;
    for (const c of cookies) {
      try {
        document.cookie = `${c.name}=${c.value}; path=${c.path || '/'}; domain=${c.domain}; ${c.secure ? 'Secure;' : ''} SameSite=None`;
      } catch (e) {
        // Ignore cookie-setting errors
      }
    }
  });

  // -------------------------------------------------------
  // PHASE 2: Detect TweetDeckX context and apply compact styles
  // -------------------------------------------------------

  let isTweetDeckX = false;

  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'tweetdeckx-init') {
      isTweetDeckX = true;
      applyCompactStyles();
      applyHideAds(e.data.hideAds);
    }
    if (e.data && e.data.type === 'tweetdeckx-set-column-width') {
      document.documentElement.style.setProperty('--tweetdeckx-col-width', e.data.width + 'px');
    }
    if (e.data && e.data.type === 'tweetdeckx-back') {
      window.history.back();
    }
    if (e.data && e.data.type === 'tweetdeckx-set-hide-ads') {
      applyHideAds(e.data.enabled);
    }
  });

  // Cross-origin detection fallback
  try {
    if (window.top.location.href) {
      // Same origin check passed, but we already returned if window === top
    }
  } catch (err) {
    isTweetDeckX = true;
    applyCompactStyles();
  }

  // Fallback timer
  setTimeout(() => {
    if (!isTweetDeckX) {
      isTweetDeckX = true;
      applyCompactStyles();
    }
  }, 500);

  function applyCompactStyles() {
    if (document.getElementById('tweetdeckx-compact-styles')) return;

    const style = document.createElement('style');
    style.id = 'tweetdeckx-compact-styles';
    style.textContent = `
      /* Hide left navigation sidebar */
      header[role="banner"],
      [data-testid="sidebarColumn"],
      [aria-label="Primary navigation"] {
        display: none !important;
      }

      main {
        margin-left: 0 !important;
      }

      [data-testid="sidebarColumn"] {
        display: none !important;
      }

      [data-testid="primaryColumn"] {
        max-width: 100% !important;
        width: 100% !important;
        border-right: none !important;
      }

      main > div > div > div {
        max-width: 100% !important;
      }

      body > div#react-root > div > div {
        max-width: 100% !important;
      }

      [data-testid="BottomBar"] {
        display: none !important;
      }

      [data-testid="SideNav_NewTweet_Button"] {
        display: none !important;
      }

      [data-testid="primaryColumn"] > div > div {
        padding-left: 0 !important;
        padding-right: 0 !important;
      }

      [data-testid="primaryColumn"] > div:first-child {
        position: sticky;
        top: 0;
        z-index: 10;
      }

      /* Prevent horizontal overflow without creating a new scroll container.
         overflow-x:hidden on html/body breaks X.com's virtual list by changing
         the scroll container from the viewport to the element itself. Instead,
         constrain widths so content never overflows horizontally. */
      #react-root,
      #react-root > div,
      #react-root > div > div {
        max-width: 100vw !important;
        min-width: 0 !important;
      }

      [data-testid="sheetDialog"],
      [data-testid="BottomBar"] {
        display: none !important;
      }

      [data-testid="DMDrawer"] {
        display: none !important;
      }

      ::-webkit-scrollbar {
        width: 4px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(128, 128, 128, 0.3);
        border-radius: 2px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(128, 128, 128, 0.6);
      }
    `;

    const inject = () => {
      if (document.head) {
        document.head.appendChild(style);
      } else if (document.documentElement) {
        document.documentElement.appendChild(style);
      }
    };

    inject();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    }

    // Re-inject if React overwrites the DOM
    const observer = new MutationObserver(() => {
      if (!document.getElementById('tweetdeckx-compact-styles')) {
        inject();
      }
    });

    const observe = () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    if (document.body) {
      observe();
    } else {
      document.addEventListener('DOMContentLoaded', observe);
    }

    try {
      window.parent.postMessage({ type: 'tweetdeckx-compact-ready' }, '*');
    } catch (e) {}
  }

  function applyHideAds(enabled) {
    const id = 'tweetdeckx-hide-ads';
    const existing = document.getElementById(id);
    if (enabled && !existing) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = `
        /* Hide promoted tweets */
        [data-testid="cellInnerDiv"]:has([data-testid="placementTracking"]) {
          display: none !important;
        }

        /* Hide premium upsell banners */
        [data-testid="cellInnerDiv"]:has(a[href="/i/premium_sign_up"]),
        [data-testid="cellInnerDiv"]:has(a[href="/settings/monetization"]) {
          display: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    } else if (!enabled && existing) {
      existing.remove();
    }
  }

  // -------------------------------------------------------
  // PHASE 3: Intercept navigation to keep it in the iframe
  // -------------------------------------------------------

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href) {
      try {
        const url = new URL(link.href);
        if (url.hostname === 'x.com' || url.hostname === 'twitter.com') {
          return;
        }
        if (url.hostname !== window.location.hostname) {
          e.preventDefault();
          window.open(link.href, '_blank');
        }
      } catch (err) {}
    }
  }, true);
})();
