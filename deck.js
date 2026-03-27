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

  // Icon SVG snippets (small, 16x16)
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
  };

  // -----------------------------------------
  // State
  // -----------------------------------------

  let columns = [];    // Array of { id, type, param, title }
  let settings = {
    columnWidth: 420,
    theme: 'dark',
  };

  // DOM refs
  const columnsScroll = document.getElementById('columns-scroll');
  const columnNav = document.getElementById('column-nav');
  const emptyState = document.getElementById('empty-state');

  const modalOverlay = document.getElementById('modal-overlay');
  const settingsOverlay = document.getElementById('settings-overlay');
  const typeInputArea = document.getElementById('type-input-area');
  const typeInputLabel = document.getElementById('type-input-label');
  const typeInput = document.getElementById('type-input');
  const btnConfirmAdd = document.getElementById('btn-confirm-add');

  const colWidthSlider = document.getElementById('col-width-slider');
  const colWidthValue = document.getElementById('col-width-value');
  const themeSelect = document.getElementById('theme-select');

  // -----------------------------------------
  // Persistence (chrome.storage.local)
  // -----------------------------------------

  async function loadState() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['tweetdeckx_columns', 'tweetdeckx_settings'], (data) => {
        if (data.tweetdeckx_columns) {
          columns = data.tweetdeckx_columns;
        }
        if (data.tweetdeckx_settings) {
          settings = { ...settings, ...data.tweetdeckx_settings };
        }
        resolve();
      });
    });
  }

  function saveState() {
    chrome.storage.local.set({
      tweetdeckx_columns: columns,
      tweetdeckx_settings: settings,
    });
  }

  // -----------------------------------------
  // URL generation for column types
  // -----------------------------------------

  function getColumnUrl(type, param) {
    const def = COLUMN_TYPES[type];
    if (def.url) return def.url;

    switch (type) {
      case 'search':
        return `https://x.com/search?q=${encodeURIComponent(param)}&src=typed_query&f=live`;
      case 'user':
        return `https://x.com/${param.replace(/^@/, '')}`;
      case 'list': {
        // Accept full URL or just numeric ID
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
  // Column rendering
  // -----------------------------------------

  function renderColumns() {
    columnsScroll.innerHTML = '';
    columnNav.innerHTML = '';

    if (columns.length === 0) {
      emptyState.classList.remove('hidden');
      return;
    }

    emptyState.classList.add('hidden');

    columns.forEach((col, index) => {
      // Create column element
      const colEl = document.createElement('div');
      colEl.className = 'deck-column';
      colEl.dataset.id = col.id;
      colEl.style.setProperty('--column-width', settings.columnWidth + 'px');
      colEl.style.flex = `0 0 ${settings.columnWidth}px`;
      colEl.style.width = settings.columnWidth + 'px';

      const typeDef = COLUMN_TYPES[col.type] || COLUMN_TYPES.home;
      const iconSvg = ICONS[typeDef.icon] || ICONS.home;

      colEl.innerHTML = `
        <div class="column-header" draggable="true" data-col-id="${col.id}">
          <div class="column-header-left">
            <span class="column-icon">${iconSvg}</span>
            <div>
              <div class="column-title">${escapeHtml(col.title || getColumnTitle(col.type, col.param))}</div>
              ${col.param ? `<div class="column-subtitle">${escapeHtml(col.type)}</div>` : ''}
            </div>
          </div>
          <div class="column-header-right">
            <button class="col-btn" data-action="refresh" title="Refresh">
              ${ICONS.refresh}
            </button>
            <button class="col-btn danger" data-action="close" title="Remove column">
              ${ICONS.close}
            </button>
          </div>
        </div>
        <div class="column-loading"><div class="spinner"></div></div>
      `;

      // Create iframe after a short delay to stagger loading
      setTimeout(() => {
        const loadingEl = colEl.querySelector('.column-loading');
        if (loadingEl) {
          const iframe = document.createElement('iframe');
          iframe.className = 'column-frame';
          iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox';
          iframe.src = getColumnUrl(col.type, col.param);
          iframe.loading = 'lazy';

          iframe.addEventListener('load', () => {
            // Send init message to content script
            try {
              iframe.contentWindow.postMessage({ type: 'tweetdeckx-init' }, '*');
              iframe.contentWindow.postMessage({ 
                type: 'tweetdeckx-set-column-width', 
                width: settings.columnWidth 
              }, '*');
            } catch (e) {
              // Cross-origin, content script handles it
            }
          });

          loadingEl.replaceWith(iframe);
        }
      }, index * 200); // Stagger iframe loads

      // Column header button handlers
      colEl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;

        const action = btn.dataset.action;
        if (action === 'close') {
          removeColumn(col.id);
        } else if (action === 'refresh') {
          const iframe = colEl.querySelector('iframe');
          if (iframe) {
            iframe.src = iframe.src; // Force reload
          }
        }
      });

      // Drag-and-drop for reordering
      const header = colEl.querySelector('.column-header');
      setupDragDrop(header, colEl, col.id);

      columnsScroll.appendChild(colEl);

      // Add sidebar nav item
      const navBtn = document.createElement('button');
      navBtn.className = 'nav-item';
      navBtn.dataset.colId = col.id;
      navBtn.innerHTML = iconSvg;
      navBtn.title = col.title || getColumnTitle(col.type, col.param);
      navBtn.addEventListener('click', () => scrollToColumn(col.id));
      columnNav.appendChild(navBtn);
    });

    // Highlight first visible column in sidebar
    updateActiveNav();
  }

  // -----------------------------------------
  // Scroll tracking for sidebar highlight
  // -----------------------------------------

  const container = document.getElementById('columns-container');
  container.addEventListener('scroll', () => updateActiveNav());

  function updateActiveNav() {
    const scrollLeft = container.scrollLeft;
    const colWidth = settings.columnWidth + 2; // include gap
    const activeIndex = Math.round(scrollLeft / colWidth);

    document.querySelectorAll('.nav-item').forEach((btn, i) => {
      btn.classList.toggle('active', i === activeIndex);
    });
  }

  function scrollToColumn(colId) {
    const colEl = columnsScroll.querySelector(`[data-id="${colId}"]`);
    if (colEl) {
      colEl.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }

  // -----------------------------------------
  // Column CRUD
  // -----------------------------------------

  function addColumn(type, param) {
    const id = 'col_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const title = getColumnTitle(type, param);
    const col = { id, type, param: param || null, title };
    columns.push(col);
    saveState();
    renderColumns();

    // Scroll to the new column after render
    requestAnimationFrame(() => {
      setTimeout(() => scrollToColumn(id), 300);
    });
  }

  function removeColumn(colId) {
    columns = columns.filter(c => c.id !== colId);
    saveState();
    renderColumns();
  }

  function reorderColumns(fromId, toId) {
    const fromIdx = columns.findIndex(c => c.id === fromId);
    const toIdx = columns.findIndex(c => c.id === toId);
    if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return;

    const [moved] = columns.splice(fromIdx, 1);
    columns.splice(toIdx, 0, moved);
    saveState();
    renderColumns();
  }

  // -----------------------------------------
  // Drag and Drop
  // -----------------------------------------

  let draggedColId = null;

  function setupDragDrop(handle, colEl, colId) {
    handle.addEventListener('dragstart', (e) => {
      draggedColId = colId;
      colEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      // Needed for Firefox
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
  // Add Column Modal
  // -----------------------------------------

  let selectedType = null;

  document.getElementById('btn-add-column').addEventListener('click', () => {
    selectedType = null;
    typeInputArea.classList.add('hidden');
    typeInput.value = '';
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    modalOverlay.classList.remove('hidden');
  });

  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  function closeModal() {
    modalOverlay.classList.add('hidden');
    selectedType = null;
  }

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
        // Add column immediately
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

  // Keyboard shortcut to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!modalOverlay.classList.contains('hidden')) closeModal();
      if (!settingsOverlay.classList.contains('hidden')) closeSettingsModal();
    }
  });

  // -----------------------------------------
  // Settings Modal
  // -----------------------------------------

  document.getElementById('btn-settings').addEventListener('click', () => {
    colWidthSlider.value = settings.columnWidth;
    colWidthValue.textContent = settings.columnWidth + 'px';
    themeSelect.value = settings.theme;
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
    settings.columnWidth = val;
    saveState();
    // Update existing column widths
    document.querySelectorAll('.deck-column').forEach(col => {
      col.style.flex = `0 0 ${val}px`;
      col.style.width = val + 'px';
    });
  });

  themeSelect.addEventListener('change', () => {
    settings.theme = themeSelect.value;
    applyTheme();
    saveState();
  });

  document.getElementById('btn-reset-columns').addEventListener('click', () => {
    if (confirm('Remove all columns? This cannot be undone.')) {
      columns = [];
      saveState();
      renderColumns();
      closeSettingsModal();
    }
  });

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }

  // -----------------------------------------
  // Utilities
  // -----------------------------------------

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // -----------------------------------------
  // Init
  // -----------------------------------------

  async function init() {
    await loadState();
    applyTheme();
    renderColumns();

    // If no columns, show some defaults for first-time users
    if (columns.length === 0) {
      // Empty state is already visible
    }
  }

  init();
})();
