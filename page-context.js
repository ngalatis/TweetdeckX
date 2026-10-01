// TweetDeckX Page Context Script
// Runs in the MAIN world (page JS context) at document_start.
// Registered with world: "MAIN" in manifest.json to bypass CSP.
//
// Rate limiting strategy (see README "Rate limits"):
// X's web client decides whether it is "active" or "background" purely from
// document.visibilityState. In the background it stops its 30s badge/DM
// poller, suspends its live_pipeline event stream, flushes telemetry and
// sends x-twitter-active-user: no. So a paused column is made to look
// hidden, and X's own code does the rest. The setInterval wrapper is kept
// as a second line of defence, and an XMLHttpRequest wrapper drops any
// request X itself labels as a poll (x-twitter-polling: true) while paused.

(function () {
  // Only apply in iframe context
  if (window === window.top) return;

  // --- Frame-busting defeat ---
  try {
    Object.defineProperty(window, 'top', {
      get: function () { return window.self; },
      configurable: false,
    });
    Object.defineProperty(window, 'parent', {
      get: function () { return window.self; },
      configurable: false,
    });
    Object.defineProperty(window, 'frameElement', {
      get: function () { return null; },
      configurable: false,
    });
  } catch (e) {}

  var _paused = false;
  var _origPushState = history.pushState;
  var _origReplaceState = history.replaceState;

  function emit(msg) {
    try { window.postMessage(msg, '*'); } catch (e) {}
  }

  // --- Visibility override ---
  // While paused, document.visibilityState reads "hidden" and document.hidden
  // reads true, and a visibilitychange event is dispatched on each transition.
  // The real state still wins when the deck tab itself is hidden.
  var _docProto = Document.prototype;
  var _visDesc = Object.getOwnPropertyDescriptor(_docProto, 'visibilityState');
  var _hiddenDesc = Object.getOwnPropertyDescriptor(_docProto, 'hidden');
  try {
    if (_visDesc && _visDesc.get) {
      Object.defineProperty(_docProto, 'visibilityState', {
        get: function () { return _paused ? 'hidden' : _visDesc.get.call(this); },
        configurable: true,
      });
    }
    if (_hiddenDesc && _hiddenDesc.get) {
      Object.defineProperty(_docProto, 'hidden', {
        get: function () { return _paused ? true : _hiddenDesc.get.call(this); },
        configurable: true,
      });
    }
  } catch (e) {}

  function emitVisibilityChange() {
    try { document.dispatchEvent(new Event('visibilitychange', { bubbles: true })); } catch (e) {}
  }

  function emitWindowEvent(name) {
    try { window.dispatchEvent(new Event(name)); } catch (e) {}
  }

  // --- Interval pause/resume (second line of defence) ---
  var _intervals = {};
  var _nextId = 1;
  var _origSetInterval = window.setInterval;
  var _origClearInterval = window.clearInterval;

  window.setInterval = function (fn, delay) {
    var id = _nextId++;
    var args = Array.prototype.slice.call(arguments, 2);
    if (!_paused) {
      var realId = _origSetInterval.apply(window, [fn, delay].concat(args));
      _intervals[id] = { fn: fn, delay: delay, args: args, realId: realId };
    } else {
      _intervals[id] = { fn: fn, delay: delay, args: args, realId: null };
    }
    return id;
  };

  window.clearInterval = function (id) {
    var entry = _intervals[id];
    if (entry && entry.realId !== null) {
      _origClearInterval(entry.realId);
    }
    delete _intervals[id];
  };

  function stopIntervals() {
    for (var id in _intervals) {
      if (_intervals[id].realId !== null) {
        _origClearInterval(_intervals[id].realId);
        _intervals[id].realId = null;
      }
    }
  }

  function startIntervals() {
    for (var id in _intervals) {
      var entry = _intervals[id];
      if (entry.realId === null) {
        entry.realId = _origSetInterval.apply(window, [entry.fn, entry.delay].concat(entry.args));
      }
    }
  }

  // --- XMLHttpRequest wrapper ---
  // X's API client sends everything through XMLHttpRequest (fetch is only
  // used for keepalive beacons). Requests X itself marks as polls carry an
  // x-twitter-polling: true header; while the column is paused they are
  // failed locally with status 0, which X treats as a network error. API
  // requests are also timestamped so the deck can tell whether an in-place
  // refresh actually produced a timeline fetch.
  var _lastTimelineRequestAt = 0;

  function isApiUrl(url) {
    return /^https:\/\/(api\.x\.com|x\.com\/i\/api|api\.twitter\.com|twitter\.com\/i\/api)\//.test(url)
      || /^\/i\/api\//.test(url);
  }

  function isTimelineUrl(url) {
    return /\/graphql\/[^/]+\/([A-Za-z]*Timeline|SearchTimeline|UserTweets|UserTweetsAndReplies|UserMedia|Likes|Bookmarks|TweetDetail|ExplorePage)(\?|$)/.test(url);
  }

  try {
    var XHR = XMLHttpRequest.prototype;
    var _open = XHR.open;
    var _send = XHR.send;
    var _setRequestHeader = XHR.setRequestHeader;

    XHR.open = function (method, url) {
      this.__tweetdeckx = { url: String(url), polling: false };
      return _open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (name, value) {
      if (this.__tweetdeckx && String(name).toLowerCase() === 'x-twitter-polling' && String(value) === 'true') {
        this.__tweetdeckx.polling = true;
      }
      return _setRequestHeader.apply(this, arguments);
    };

    XHR.send = function () {
      var info = this.__tweetdeckx;
      if (info && isApiUrl(info.url)) {
        if (_paused && info.polling) {
          failLocally(this);
          return;
        }
        if (isTimelineUrl(info.url)) _lastTimelineRequestAt = Date.now();
      }
      return _send.apply(this, arguments);
    };
  } catch (e) {}

  // Completes an XHR as a network failure without sending it. X's transport
  // waits for readyState 4 and rejects on status 0.
  function failLocally(xhr) {
    setTimeout(function () {
      try {
        Object.defineProperty(xhr, 'readyState', { value: 4, configurable: true });
        Object.defineProperty(xhr, 'status', { value: 0, configurable: true });
        Object.defineProperty(xhr, 'responseText', { value: '', configurable: true });
        Object.defineProperty(xhr, 'response', { value: '', configurable: true });
        xhr.dispatchEvent(new Event('readystatechange'));
        xhr.dispatchEvent(new ProgressEvent('error'));
        xhr.dispatchEvent(new ProgressEvent('loadend'));
      } catch (e) {}
    }, 0);
  }

  // --- Pause / resume ---
  function pause() {
    if (_paused) return;
    _paused = true;
    stopIntervals();
    // Home records the blur time and only refetches on focus if it was
    // blurred for long enough, so blur first, then go hidden.
    emitWindowEvent('blur');
    emitVisibilityChange();
    // Pause all videos so they stop cleanly instead of stalling mid-buffer.
    // Skip the video currently in Picture-in-Picture so it keeps playing
    // outside the browser window even when the column is out of focus.
    var pipVideo = document.pictureInPictureElement;
    var videos = document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
      if (videos[i] === pipVideo) continue;
      try { videos[i].pause(); } catch (e) {}
    }
  }

  function resume() {
    if (!_paused) return;
    _paused = false;
    startIntervals();
    emitVisibilityChange();
    emitWindowEvent('focus');
  }

  function dispatchKey(target, type, keyCode, charCode) {
    try {
      var ev = new KeyboardEvent(type, {
        key: '.', code: 'Period', keyCode: keyCode, charCode: charCode, which: keyCode || charCode,
        bubbles: true, cancelable: true,
      });
      // Chrome ignores the legacy fields in the init dictionary for some
      // event types, so pin them on the instance as well.
      ['keyCode', 'which', 'charCode'].forEach(function (prop) {
        var value = prop === 'charCode' ? charCode : (keyCode || charCode);
        try { Object.defineProperty(ev, prop, { get: function () { return value; } }); } catch (e) {}
      });
      target.dispatchEvent(ev);
    } catch (e) {}
  }

  // --- In-place refresh ---
  // Asks X to fetch the top of the current timeline without reloading the
  // page. X's own "." shortcut does exactly that (scroll to top, then load
  // new posts), and Home additionally refetches on window focus. These are
  // user-initiated fetches rather than polls, so they go out even while the
  // column is paused and the badge poller stays off. Whether a timeline
  // request actually went out is reported back so the deck can fall back to
  // a full reload when it did not.
  function refreshInPlace() {
    var before = _lastTimelineRequestAt;
    try { window.scrollTo(0, 0); } catch (e) {}
    try { if (document.scrollingElement) document.scrollingElement.scrollTop = 0; } catch (e) {}
    emitWindowEvent('focus');
    // X binds "." with a Mousetrap-style handler, which listens for the
    // keypress of single character keys, so send the full keydown /
    // keypress / keyup sequence with the legacy code fields filled in.
    var target = document.body || document.documentElement;
    dispatchKey(target, 'keydown', 190, 0);
    dispatchKey(target, 'keypress', 46, 46);
    dispatchKey(target, 'keyup', 190, 0);
    setTimeout(function () {
      emit({ type: 'tweetdeckx-refresh-result', ok: _lastTimelineRequestAt > before });
    }, 2500);
  }

  // --- In-place navigation ---
  // Pushes a new URL into X's router without reloading the page. X's history
  // listens for popstate, so a pushState followed by a synthetic popstate is
  // enough for it to render the new route (for example a changed search
  // query). Whether a timeline request followed is reported back so the
  // deck can fall back to a reload when the route did not take.
  function navigateInPlace(url) {
    var before = _lastTimelineRequestAt;
    try {
      _origPushState.call(history, {}, '', url);
      window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      checkLightbox();
      emitUrlChange();
    } catch (e) {}
    setTimeout(function () {
      emit({ type: 'tweetdeckx-navigate-result', ok: _lastTimelineRequestAt > before, url: url });
    }, 1500);
  }

  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.type === 'tweetdeckx-pause') {
      pause();
    } else if (e.data.type === 'tweetdeckx-resume') {
      resume();
    } else if (e.data.type === 'tweetdeckx-refresh') {
      refreshInPlace();
    } else if (e.data.type === 'tweetdeckx-navigate' && typeof e.data.url === 'string') {
      navigateInPlace(e.data.url);
    }
  });

  // --- Lightbox detection ---
  // Detect when X.com opens its image/media lightbox by monitoring URL changes
  // for /photo/ patterns. Notify parent so the iframe can expand to full viewport.
  var _lightboxOpen = false;

  function checkLightbox() {
    var isPhoto = /\/photo\/\d+/.test(window.location.pathname);
    if (isPhoto && !_lightboxOpen) {
      _lightboxOpen = true;
      // Delay to let X.com's React render the lightbox content,
      // then check if it contains a video element.
      setTimeout(function () {
        var hasVideo = !!document.querySelector(
          'video, [data-testid="videoPlayer"], [data-testid="videoComponent"]'
        );
        emit({ type: 'tweetdeckx-lightbox-opened', hasVideo: hasVideo });
      }, 300);
    } else if (!isPhoto && _lightboxOpen) {
      _lightboxOpen = false;
      emit({ type: 'tweetdeckx-lightbox-closed' });
    }
  }

  // --- URL change emitter ---
  // Notifies the parent deck when the iframe navigates (SPA or popstate) so it
  // can toggle the column's conditional back button and support "Save current
  // view". Debounced to coalesce rapid pushState bursts during hydration.
  var _urlEmitTimer = null;
  function emitUrlChange() {
    if (_urlEmitTimer) return;
    _urlEmitTimer = setTimeout(function () {
      _urlEmitTimer = null;
      emit({ type: 'tweetdeckx-url-changed', url: window.location.href });
    }, 50);
  }

  history.pushState = function () {
    var result = _origPushState.apply(this, arguments);
    checkLightbox();
    emitUrlChange();
    return result;
  };

  history.replaceState = function () {
    var result = _origReplaceState.apply(this, arguments);
    checkLightbox();
    emitUrlChange();
    return result;
  };

  window.addEventListener('popstate', function () {
    checkLightbox();
    emitUrlChange();
  });

  // Fire an initial URL so the parent deck has a baseline for this column
  // even if the page never navigates.
  emitUrlChange();

  // --- User activity detection ---
  // Scroll/click events inside iframes don't propagate to the parent deck page.
  // Notify parent of user activity so the column stays active during interaction.
  var _lastActivityNotify = 0;
  function notifyActivity(e) {
    if (e && !e.isTrusted) return; // synthetic events from refreshInPlace don't count
    var now = Date.now();
    if (now - _lastActivityNotify > 5000) {
      _lastActivityNotify = now;
      emit({ type: 'tweetdeckx-user-activity' });
    }
  }
  document.addEventListener('scroll', notifyActivity, { passive: true, capture: true });
  document.addEventListener('click', notifyActivity, { capture: true });
  document.addEventListener('keydown', notifyActivity, { capture: true });
})();
