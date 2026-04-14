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
    settings: { columnWidth: 420, theme: 'dark', hideAds: false, hideColumnHeader: false },
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
  let isRateLimited = false;

  function cancelPendingLoads() {
    pendingStaggerTimers.forEach(id => clearTimeout(id));
    pendingStaggerTimers = [];
  }

  function randomStagger() {
    return 1000 + Math.random() * 1000;
  }

  let activeColumnId = null;       // which column is currently Active (resumed)
  let idleTimer = null;            // timer to pause the active column after inactivity
  let refreshTimers = new Map();   // Map<columnId, timerId> for 5-min lazy refresh

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
  const REFRESH_INTERVAL = 300000; // 5 minutes between lazy refreshes
  const RESUME_BURST_MS = 3000;    // how long a brief resume-then-pause lasts

  function pauseAllIframes() {
    columnsContainer.querySelectorAll('iframe').forEach(function (iframe) {
      try {
        iframe.contentWindow.postMessage({ type: 'tweetdeckx-pause' }, '*');
      } catch (e) {}
    });
  }

  function pauseColumn(colId) {
    const wrapper = getActiveWrapper();
    if (!wrapper) return;
    const col = wrapper.querySelector(`.deck-column[data-id="${colId}"]`);
    if (!col) return;
    const iframe = col.querySelector('iframe');
    if (iframe) {
      try { iframe.contentWindow.postMessage({ type: 'tweetdeckx-pause' }, '*'); } catch (e) {}
    }
  }

  function resumeColumn(colId) {
    const wrapper = getActiveWrapper();
    if (!wrapper) return;
    const col = wrapper.querySelector(`.deck-column[data-id="${colId}"]`);
    if (!col) return;
    const iframe = col.querySelector('iframe');
    if (iframe) {
      try { iframe.contentWindow.postMessage({ type: 'tweetdeckx-resume' }, '*'); } catch (e) {}
    }
  }

  function activateColumn(colId) {
    if (activeColumnId && activeColumnId !== colId) {
      pauseColumn(activeColumnId);
    }
    activeColumnId = colId;
    resumeColumn(colId);
    resetIdleTimer();
    resetRefreshTimer(colId);
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

  function burstResumeColumn(colId) {
    resumeColumn(colId);
    setTimeout(() => {
      if (activeColumnId !== colId) {
        pauseColumn(colId);
      }
    }, RESUME_BURST_MS);
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

      const timerId = setInterval(() => {
        if (col.id !== activeColumnId) {
          burstResumeColumn(col.id);
        }
      }, REFRESH_INTERVAL);
      refreshTimers.set(col.id, timerId);
    });
  }

  function resetRefreshTimer(colId) {
    const existing = refreshTimers.get(colId);
    if (existing) {
      clearInterval(existing);
    }
    const timerId = setInterval(() => {
      if (colId !== activeColumnId) {
        burstResumeColumn(colId);
      }
    }, REFRESH_INTERVAL);
    refreshTimers.set(colId, timerId);
  }

  function clearAllRefreshTimers() {
    refreshTimers.forEach((timerId) => clearInterval(timerId));
    refreshTimers.clear();
  }

  function attachColumnInteractionListeners(colEl) {
    const colId = colEl.dataset.id;

    colEl.addEventListener('click', () => {
      if (activeColumnId !== colId) {
        activateColumn(colId);
      }
    });

    colEl.addEventListener('mouseenter', () => {
      if (activeColumnId !== colId) {
        activateColumn(colId);
      } else {
        resetIdleTimer();
      }
    });

    colEl.addEventListener('mouseleave', () => {
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

    // Expand the column
    const colEl = iframe.closest('.deck-column');
    if (colEl) colEl.classList.add('lightbox-active');
  }

  function collapseIframeFromLightbox() {
    if (!lightboxIframe) return;

    const colEl = lightboxIframe.closest('.deck-column');
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
  // otherwise we derive it from the column type and param.
  function getCanonicalUrl(col) {
    return col.url || getColumnUrl(col.type, col.param);
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
      // Restart refresh timers for this page's columns
      startRefreshTimers();
      return;
    }

    // Cache miss — cold load (renderColumns handles burst-resume)
    renderColumns();
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
      subDiv.textContent = col.type;
      titleWrap.appendChild(subDiv);
    }
    left.appendChild(titleWrap);
    header.appendChild(left);

    // Right cluster: refresh + 3-dot menu
    const right = document.createElement('div');
    right.className = 'column-header-right';

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
    colEl.appendChild(loading);

    // Column header button handlers (event delegation on the column root)
    colEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      if (action === 'back') {
        const iframe = colEl.querySelector('iframe');
        if (iframe) {
          try { iframe.contentWindow.postMessage({ type: 'tweetdeckx-back' }, '*'); } catch (err) {}
        }
      } else if (action === 'refresh') {
        const iframe = colEl.querySelector('iframe');
        if (iframe) {
          iframe.src = getCanonicalUrl(col);
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
        }, '*');
        iframe.contentWindow.postMessage({
          type: 'tweetdeckx-set-column-width',
          width: state.settings.columnWidth
        }, '*');
      } catch (e) {
        // Cross-origin, content script handles it
      }
      // Pause immediately, then give a brief burst for initial data fetch
      const colEl = iframe.closest('.deck-column');
      const colId = colEl ? colEl.dataset.id : null;
      if (colId) {
        pauseColumn(colId);
        burstResumeColumn(colId);
      }
    });

    loadingEl.replaceWith(iframe);
    delete colEl.dataset.needsLoad;
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
      if (index === 0 && !isRateLimited) {
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
              if (!isRateLimited) {
                loadIframeForColumn(el, colData);
              }
            }, staggerDelay);
            pendingStaggerTimers.push(timerId);
          }
        });
      }, { root: columnsContainer, threshold: 0.1 });

      lazyColumns.forEach(el => observer.observe(el));
    }

    wrapper.appendChild(createTrailingAddButton());
    // All columns start paused — initial data fetch is handled by
    // burstResumeColumn in loadIframeForColumn's load handler
    pauseAllIframes();
    startRefreshTimers();
  }

  // -----------------------------------------
  // Column CRUD
  // -----------------------------------------

  function addColumn(type, param) {
    const page = getActivePage();
    if (!page) return;

    const id = generateId('col');
    const title = getColumnTitle(type, param);
    const col = { id, type, param: param || null, title };
    page.columns.push(col);
    saveState();

    // If this is the first column, transition from empty state
    if (page.columns.length === 1) {
      renderColumns();
      return;
    }

    // Append single column to live DOM without destroying existing iframes
    const colEl = createColumnElement(col);
    loadIframeForColumn(colEl, col);
    resetRefreshTimer(col.id);

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
    const timer = refreshTimers.get(colId);
    if (timer) {
      clearInterval(timer);
      refreshTimers.delete(colId);
    }

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
    const timer = refreshTimers.get(colId);
    if (timer) {
      clearInterval(timer);
      refreshTimers.delete(colId);
    }
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

    col.url = currentUrl;
    saveState();
    updateBackButtonVisibility(colId);
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
        const t = refreshTimers.get(col.id);
        if (t) {
          clearInterval(t);
          refreshTimers.delete(col.id);
        }
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
    addColumn(selectedType, value);
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

  document.getElementById('btn-reset-pages').addEventListener('click', () => {
    if (confirm('Reset all pages? This will remove all pages and columns and cannot be undone.')) {
      deactivateActiveColumn();
      clearAllCache();
      colRuntimeState.clear();
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
      closeAllDropdowns();
    }
  });

  // -----------------------------------------
  // Rate-limit toast handling
  // -----------------------------------------

  let rateLimitToastTimer = null;

  function showRateLimitToast() {
    if (!rateLimitToast.classList.contains('hidden')) return;
    isRateLimited = true;
    cancelPendingLoads();
    rateLimitToast.classList.remove('hidden');
    clearTimeout(rateLimitToastTimer);
    rateLimitToastTimer = setTimeout(() => dismissRateLimitToast(), 30000);
  }

  function dismissRateLimitToast() {
    rateLimitToast.classList.add('hidden');
    clearTimeout(rateLimitToastTimer);
    setTimeout(() => {
      isRateLimited = false;
      resumePausedLoads();
    }, 20000);
  }

  function resumePausedLoads() {
    const page = getActivePage();
    if (!page) return;
    const wrapper = getActiveWrapper();
    if (!wrapper) return;
    const unloaded = wrapper.querySelectorAll('.column-loading');
    let delay = 0;
    unloaded.forEach((loadingEl) => {
      const colEl = loadingEl.closest('.deck-column');
      if (!colEl) return;
      const colData = page.columns.find(c => c.id === colEl.dataset.id);
      if (!colData) return;
      delay += randomStagger();
      const timerId = setTimeout(() => {
        if (!isRateLimited) {
          loadIframeForColumn(colEl, colData);
        }
        pendingStaggerTimers = pendingStaggerTimers.filter(t => t !== timerId);
      }, delay);
      pendingStaggerTimers.push(timerId);
    });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'tweetdeckx-rate-limited') showRateLimitToast();
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
    renderColumns();

    // Request an update check from the background script
    chrome.runtime.sendMessage({ type: 'tweetdeckx-check-update' }).catch(() => {});
  }

  init();
})();
