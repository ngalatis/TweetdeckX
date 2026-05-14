// TweetDeckX Page Context Script
// Runs in the MAIN world (page JS context) at document_start.
// Registered with world: "MAIN" in manifest.json to bypass CSP.

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

  // --- Interval pause/resume for rate limit mitigation ---
  var _intervals = {};
  var _nextId = 1;
  var _paused = false;
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

  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.type === 'tweetdeckx-pause') {
      _paused = true;
      for (var id in _intervals) {
        if (_intervals[id].realId !== null) {
          _origClearInterval(_intervals[id].realId);
          _intervals[id].realId = null;
        }
      }
      // Pause all videos so they stop cleanly instead of stalling mid-buffer.
      // Skip the video currently in Picture-in-Picture so it keeps playing
      // outside the browser window even when the column is out of focus.
      var pipVideo = document.pictureInPictureElement;
      var videos = document.querySelectorAll('video');
      for (var i = 0; i < videos.length; i++) {
        if (videos[i] === pipVideo) continue;
        try { videos[i].pause(); } catch (e) {}
      }
    } else if (e.data.type === 'tweetdeckx-resume') {
      _paused = false;
      for (var id in _intervals) {
        var entry = _intervals[id];
        if (entry.realId === null) {
          entry.realId = _origSetInterval.apply(window, [entry.fn, entry.delay].concat(entry.args));
        }
      }
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
        window.postMessage({ type: 'tweetdeckx-lightbox-opened', hasVideo: hasVideo }, '*');
      }, 300);
    } else if (!isPhoto && _lightboxOpen) {
      _lightboxOpen = false;
      window.postMessage({ type: 'tweetdeckx-lightbox-closed' }, '*');
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
      window.postMessage({
        type: 'tweetdeckx-url-changed',
        url: window.location.href,
      }, '*');
    }, 50);
  }

  var _origPushState = history.pushState;
  var _origReplaceState = history.replaceState;

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
  function notifyActivity() {
    var now = Date.now();
    if (now - _lastActivityNotify > 5000) {
      _lastActivityNotify = now;
      window.postMessage({ type: 'tweetdeckx-user-activity' }, '*');
    }
  }
  document.addEventListener('scroll', notifyActivity, { passive: true, capture: true });
  document.addEventListener('click', notifyActivity, { capture: true });
  document.addEventListener('keydown', notifyActivity, { capture: true });
})();
