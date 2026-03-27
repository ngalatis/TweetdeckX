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
})();
