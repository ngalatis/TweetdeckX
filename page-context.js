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
// The same wrapper reads the x-rate-limit-* headers off every API response
// so the deck knows exactly which endpoints this column spends.

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
  var _suppressActivityUntil = 0;
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
  // failed locally with status 0, which X treats as a network error.
  // Timeline requests are timestamped so the deck can tell whether an
  // in-place refresh actually produced a fetch, and every API response's
  // x-rate-limit-* headers (readable here because the API is same-origin)
  // are reported to the deck together with the endpoint they belong to.
  var _lastTimelineRequestAt = 0;
  var _timelineInFlight = 0;

  function isApiUrl(url) {
    return /^https:\/\/(api\.x\.com|x\.com\/i\/api|api\.twitter\.com|twitter\.com\/i\/api)\//.test(url)
      || /^\/i\/api\//.test(url);
  }

  // Endpoints that fetch what a column shows. GraphQL for timelines, REST
  // for notifications and the DM inbox.
  function isTimelineUrl(url) {
    return /\/graphql\/[^/]+\/([A-Za-z]*Timeline|SearchTimeline|UserTweets|UserTweetsAndReplies|UserMedia|Likes|Bookmarks|TweetDetail|ExplorePage)(\?|$)/.test(url)
      || /\/i\/api\/2\/notifications\/[a-z_]+\.json/.test(url)
      || /\/i\/api\/1\.1\/dm\/inbox_initial_state\.json/.test(url);
  }

  // Same naming as background.js: the GraphQL operation, or the REST path.
  function operationForUrl(url) {
    var m = /\/graphql\/[^/]+\/([A-Za-z0-9_]+)/.exec(url);
    if (m) return m[1];
    try {
      var path = new URL(url, location.href).pathname;
      return path.replace(/^\/i\/api\//, '/').replace(/\.json$/, '');
    } catch (e) {
      return null;
    }
  }

  function reportResponse(xhr, url, timeline) {
    var status = 0, limit = null, remaining = null, reset = null;
    try {
      status = xhr.status;
      limit = xhr.getResponseHeader('x-rate-limit-limit');
      remaining = xhr.getResponseHeader('x-rate-limit-remaining');
      reset = xhr.getResponseHeader('x-rate-limit-reset');
    } catch (e) {}
    if (limit === null && status !== 429) return;
    var op = operationForUrl(url);
    if (!op) return;
    emit({
      type: 'tweetdeckx-api-response',
      op: op,
      url: location.href,
      timeline: timeline,
      status: status,
      limit: limit === null ? null : Number(limit),
      remaining: remaining === null ? null : Number(remaining),
      reset: reset === null ? null : Number(reset),
      at: Date.now(),
    });
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
        var timeline = isTimelineUrl(info.url);
        if (timeline) {
          _lastTimelineRequestAt = Date.now();
          _timelineInFlight++;
        }
        var xhr = this;
        this.addEventListener('loadend', function () {
          if (timeline) _timelineInFlight = Math.max(0, _timelineInFlight - 1);
          reportResponse(xhr, info.url, timeline);
        });
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
  // Only the visibility state is toggled. Synthetic focus/blur events are
  // deliberately not sent: X refetches Home on every focus after a 30s
  // blur, which would spend a request each time the pointer came back.
  function pause() {
    if (_paused) return;
    _paused = true;
    stopIntervals();
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
  }

  // --- React internals ---
  // X's timeline and router are reached through the React fiber tree
  // hanging off the DOM. The members used (refreshOrGoTop, scrollToTop,
  // props.onRefresh, props.history) are class members and props, which
  // X's build does not minify. Everything here degrades to null when the
  // shape changes, and the callers then fall back to keyboard shortcuts
  // and finally to a page reload.
  function fiberOf(el) {
    if (!el) return null;
    for (var key in el) {
      if (key.indexOf('__reactFiber$') === 0) return el[key];
    }
    return null;
  }

  function findUp(el, test) {
    var f = fiberOf(el);
    var n = 0;
    while (f && n++ < 1000) {
      var r = null;
      try { r = test(f); } catch (e) {}
      if (r) return r;
      f = f.return;
    }
    return null;
  }

  function findDown(el, test) {
    var root = fiberOf(el);
    if (!root) return null;
    var stack = [root];
    var n = 0;
    while (stack.length && n++ < 20000) {
      var f = stack.pop();
      var r = null;
      try { r = test(f); } catch (e) {}
      if (r) return r;
      if (f !== root && f.sibling) stack.push(f.sibling);
      if (f.child) stack.push(f.child);
    }
    return null;
  }

  function timelineStart() {
    return document.querySelector('[data-testid="primaryColumn"] [data-testid="cellInnerDiv"]')
      || document.querySelector('[data-testid="cellInnerDiv"]')
      || document.querySelector('[data-testid="primaryColumn"]')
      || document.querySelector('main');
  }

  function asTimelineRenderer(f) {
    var sn = f.stateNode;
    if (sn && typeof sn.refreshOrGoTop === 'function' && typeof sn.scrollToTop === 'function'
      && sn.props && typeof sn.props.onRefresh === 'function') return sn;
    return null;
  }

  function findTimelineRenderer() {
    return findUp(timelineStart(), asTimelineRenderer)
      || findDown(document.querySelector('[data-testid="primaryColumn"]') || document.querySelector('main'), asTimelineRenderer);
  }

  function asRouterHistory(f) {
    var p = f.memoizedProps;
    var h = p && p.history;
    if (h && typeof h.push === 'function' && h.location && typeof h.location === 'object') return h;
    return null;
  }

  function findHistory() {
    return findUp(timelineStart() || document.body, asRouterHistory);
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

  // Resolves as soon as a timeline request goes out, or with the in-flight
  // state at the deadline. A request that was already running when the
  // refresh was asked for will deliver fresh posts just the same.
  function waitForTimelineRequest(before, inFlight, maxMs, cb) {
    var started = Date.now();
    (function check() {
      if (_lastTimelineRequestAt > before) return cb(true);
      if (Date.now() - started >= maxMs) return cb(inFlight);
      setTimeout(check, 50);
    })();
  }

  // --- In-place refresh ---
  // Asks X's timeline to fetch the top of the current timeline without
  // reloading the page, as a user-initiated fetch rather than a poll, so it
  // goes out even while the column is paused and the badge poller stays
  // off. The timeline component is called directly; X's "." shortcut only
  // fetches when its list already reads as scrolled to the top and is
  // throttled to once a second, so it is kept as the fallback. Whether a
  // timeline request actually went out is reported back so the deck can
  // fall back to a full reload when it did not.
  function refreshInPlace() {
    var before = _lastTimelineRequestAt;
    var inFlight = _timelineInFlight > 0;
    _suppressActivityUntil = Date.now() + 3000;
    var direct = false;
    try {
      var tl = findTimelineRenderer();
      if (tl) {
        tl.scrollToTop(false);
        tl.props.onRefresh();
        direct = true;
      }
    } catch (e) {}
    if (!direct) {
      try { window.scrollTo(0, 0); } catch (e) {}
      try { if (document.scrollingElement) document.scrollingElement.scrollTop = 0; } catch (e) {}
      // X binds "." with Mousetrap, which listens for the keypress of single
      // character keys, so send the full keydown / keypress / keyup sequence
      // with the legacy code fields filled in.
      var target = document.body || document.documentElement;
      dispatchKey(target, 'keydown', 190, 0);
      dispatchKey(target, 'keypress', 46, 46);
      dispatchKey(target, 'keyup', 190, 0);
    }
    waitForTimelineRequest(before, inFlight, direct ? 1000 : 1500, function (ok) {
      emit({ type: 'tweetdeckx-refresh-result', ok: ok, direct: direct });
    });
  }

  // --- In-place navigation ---
  // Points X's own router at a new URL, the same thing a link click does,
  // so a changed search query renders without a page reload. The router
  // pushes through history.pushState, which the wrapper below sees, and
  // that is the confirmation. Without a router a synthetic popstate is
  // tried and confirmed by the DOM changing. Either way the outcome is
  // reported so the deck can fall back to a reload.
  var _lastRouteChangeAt = 0;

  function navigateInPlace(url) {
    var target;
    try { target = new URL(url, location.href); } catch (e) {
      emit({ type: 'tweetdeckx-navigate-result', ok: false, url: url });
      return;
    }
    var to = target.pathname + target.search + target.hash;
    var before = _lastRouteChangeAt;
    _suppressActivityUntil = Date.now() + 3000;
    var mutations = 0;
    var observer = null;
    try {
      observer = new MutationObserver(function (list) {
        for (var i = 0; i < list.length; i++) {
          mutations += list[i].addedNodes.length + list[i].removedNodes.length;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
    var pushed = false;
    try {
      var h = findHistory();
      if (h) {
        h.push(to);
        pushed = true;
      }
    } catch (e) {}
    if (!pushed) {
      try {
        _origPushState.call(history, {}, '', to);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
        checkLightbox();
        emitUrlChange();
      } catch (e) {}
    }
    var started = Date.now();
    (function check() {
      var atTarget = false;
      try {
        atTarget = decodeURIComponent(location.pathname + location.search)
          === decodeURIComponent(target.pathname + target.search);
      } catch (e) {}
      var ok = (pushed && _lastRouteChangeAt > before) || (atTarget && mutations >= 10);
      if (ok || Date.now() - started >= 1200) {
        if (observer) observer.disconnect();
        emit({ type: 'tweetdeckx-navigate-result', ok: ok, url: url });
        return;
      }
      setTimeout(check, 50);
    })();
  }

  // --- Back ---
  // Every column is a frame in the same tab, so they all share one session
  // history and history.back() steps back whichever column navigated last.
  // The frames are sandboxed, and a sandboxed frame may not navigate its
  // siblings, so when that was another column the browser drops the
  // traversal without an error and the button does nothing. Back is
  // resolved against this frame's own entries instead. The previous view is
  // traversed to when nothing else has navigated since, which keeps X's
  // scroll position; when the browser refuses, X's router replaces the
  // current view with it in place. Replacing rather than pushing keeps this
  // frame's entries in step with the views the user went through, so the
  // next back still finds the one before. With no earlier view the column
  // returns to its own start page.
  function sameView(a, b) {
    try {
      var ua = new URL(a, location.href);
      var ub = new URL(b, location.href);
      var params = function (u) {
        return Array.from(u.searchParams).map(function (p) { return p.join('='); }).sort().join('&');
      };
      return ua.origin === ub.origin
        && ua.pathname.replace(/\/$/, '') === ub.pathname.replace(/\/$/, '')
        && params(ua) === params(ub);
    } catch (e) {
      return a === b;
    }
  }

  function goBack(homeUrl) {
    var nav = window.navigation;
    if (!nav || !nav.currentEntry) {
      history.back();
      return;
    }
    var entries = nav.entries();
    var target = null;
    for (var i = nav.currentEntry.index - 1; i >= 0; i--) {
      if (entries[i].url && !sameView(entries[i].url, location.href)) {
        target = entries[i];
        break;
      }
    }
    if (!target) {
      if (homeUrl && !sameView(homeUrl, location.href)) replaceInPlace(homeUrl);
      return;
    }
    var from = location.href;
    var fallback = function () {
      if (location.href === from) replaceInPlace(target.url);
    };
    try {
      var result = nav.traverseTo(target.key);
      result.finished.catch(function () {});
      result.committed.catch(fallback);
    } catch (e) {
      fallback();
    }
  }

  // Shows another view of this site in place of the current one, through
  // X's router when it can be reached and with a page load otherwise.
  function replaceInPlace(url) {
    var target;
    try { target = new URL(url, location.href); } catch (e) { return; }
    if (target.origin !== location.origin) return;
    var from = location.href;
    try {
      var h = findHistory();
      if (h && typeof h.replace === 'function') h.replace(target.pathname + target.search + target.hash);
    } catch (e) {}
    var started = Date.now();
    (function check() {
      if (location.href !== from) return;
      if (Date.now() - started >= 1200) {
        location.replace(target.href);
        return;
      }
      setTimeout(check, 50);
    })();
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
    } else if (e.data.type === 'tweetdeckx-back') {
      goBack(typeof e.data.home === 'string' ? e.data.home : null);
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
    _lastRouteChangeAt = Date.now();
    checkLightbox();
    emitUrlChange();
    return result;
  };

  history.replaceState = function () {
    var result = _origReplaceState.apply(this, arguments);
    _lastRouteChangeAt = Date.now();
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
    // A script scroll fires a trusted scroll event, so scrolls right after
    // an in-place refresh or navigation don't count either
    if (e && e.type === 'scroll' && Date.now() < _suppressActivityUntil) return;
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
