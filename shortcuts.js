// TweetDeckX Keyboard Shortcuts
// Loaded by both the deck page and the content script so they agree on
// which keys belong to TweetDeckX. Every other key is left to X.com, whose
// own shortcuts (j/k, l, r, t, b, Enter, ...) keep working inside the
// focused column.

(function () {
  'use strict';

  function isEditable(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
  }

  // Returns the TweetDeckX action for a keydown event, or null if the key
  // isn't one of ours. Digits are matched by physical key (e.code) so that
  // keyboard layouts that need Shift for digits behave the same way.
  function match(e) {
    if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return null;
    if (isEditable(e.target)) return null;

    const digit = /^Digit(\d)$/.exec(e.code);
    if (digit) {
      const n = Number(digit[1]);
      if (e.shiftKey) {
        return n === 0 ? null : { type: 'switch-page', index: n - 1 };
      }
      return { type: 'focus-column', index: n === 0 ? 9 : n - 1 };
    }

    if (e.key === 'Backspace' && !e.shiftKey) return { type: 'back' };
    if (!e.shiftKey) return null;

    switch (e.key.toLowerCase()) {
      case 'h': return { type: 'focus-prev-column' };
      case 'l': return { type: 'focus-next-column' };
      case 'n': return { type: 'add-column' };
      case 'p': return { type: 'add-page' };
      default:  return null;
    }
  }

  window.TweetDeckXShortcuts = { match };
})();
