(function (global) {
  "use strict";

  var DEFAULTS = {
    apiBaseUrl: "http://localhost:4000",
    endpointPath: "/api/session-events",
    projectId: "",
    pagePath: function () {
      return global.location ? global.location.pathname : "/";
    },
    batchSize: 200,
    flushIntervalMs: 4000,
    mouseMoveThrottleMs: 80,
    scrollThrottleMs: 150,
    debug: false,
    sessionStorageKey: "trackaura.sessionId",
  };

  function now() {
    return Date.now();
  }

  function getDeviceType() {
    var width = global.innerWidth || 0;
    if (width < 768) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  }

  function ensureSessionId(key) {
    try {
      var existing = global.localStorage.getItem(key);
      if (existing) return existing;
      var created = "s_" + (global.crypto && global.crypto.randomUUID ? global.crypto.randomUUID() : String(Date.now()));
      global.localStorage.setItem(key, created);
      return created;
    } catch (_error) {
      return "s_" + String(Date.now());
    }
  }

  function createTracker(options) {
    var config = Object.assign({}, DEFAULTS, options || {});
    var sessionId = ensureSessionId(config.sessionStorageKey);
    var queue = [];
    var stopped = false;
    var flushTimer = null;
    var listeners = [];
    var lastMoveAt = 0;
    var lastScrollAt = 0;

    function log() {
      if (!config.debug) return;
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[TrackAuraReplay]");
      global.console.log.apply(global.console, args);
    }

    function endpoint() {
      return config.apiBaseUrl.replace(/\/$/, "") + config.endpointPath;
    }

    function pagePath() {
      if (typeof config.pagePath === "function") {
        return config.pagePath();
      }
      return config.pagePath || "/";
    }

    function pushEvent(event) {
      if (stopped) return;
      queue.push(event);
      if (queue.length >= config.batchSize) {
        flush();
      }
    }

    function track(eventType, payload) {
      payload = payload || {};
      pushEvent({
        type: eventType,
        x: typeof payload.x === "number" ? Math.round(payload.x) : undefined,
        y: typeof payload.y === "number" ? Math.round(payload.y) : undefined,
        scrollY: typeof payload.scrollY === "number" ? Math.round(payload.scrollY) : undefined,
        viewportW: Math.max(1, Math.round(global.innerWidth || 1)),
        viewportH: Math.max(1, Math.round(global.innerHeight || 1)),
        value: typeof payload.value === "string" ? payload.value.slice(0, 300) : undefined,
        timestamp: now(),
      });
    }

    function sendBatch(events) {
      if (!events.length) return Promise.resolve(false);

      var payload = {
        sessionId: sessionId,
        page: pagePath(),
        projectId: config.projectId,
        deviceType: getDeviceType(),
        events: events,
      };

      return global
        .fetch(endpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          log("sent", events.length, "events");
          return true;
        })
        .catch(function (error) {
          log("send failed", error && error.message ? error.message : error);
          return false;
        });
    }

    function flush() {
      if (stopped || queue.length === 0) return Promise.resolve(false);
      var batch = queue.splice(0, config.batchSize);
      return sendBatch(batch).then(function (ok) {
        if (!ok) {
          queue = batch.concat(queue);
        }
        return ok;
      });
    }

    function onMouseMove(event) {
      var ts = now();
      if (ts - lastMoveAt < config.mouseMoveThrottleMs) return;
      lastMoveAt = ts;
      track("mousemove", { x: event.clientX, y: event.clientY });
    }

    function onClick(event) {
      track("click", { x: event.clientX, y: event.clientY });
    }

    function onScroll() {
      var ts = now();
      if (ts - lastScrollAt < config.scrollThrottleMs) return;
      lastScrollAt = ts;
      track("scroll", { scrollY: global.scrollY || global.pageYOffset || 0 });
    }

    function onInput(event) {
      var target = event.target;
      if (!target || typeof target.value !== "string") return;
      track("input", { value: target.value });
    }

    function onNavigation() {
      track("navigation", { value: pagePath() });
    }

    function addListener(target, type, handler, optionsArg) {
      target.addEventListener(type, handler, optionsArg);
      listeners.push(function () {
        target.removeEventListener(type, handler, optionsArg);
      });
    }

    function start() {
      if (stopped === false && flushTimer) return { started: true };
      stopped = false;

      addListener(global, "mousemove", onMouseMove, { passive: true });
      addListener(global, "click", onClick, { passive: true });
      addListener(global, "scroll", onScroll, { passive: true });
      addListener(global, "input", onInput, { passive: true });
      addListener(global, "beforeunload", function () {
        void flush();
      });
      addListener(global, "popstate", onNavigation, { passive: true });
      addListener(global, "hashchange", onNavigation, { passive: true });

      track("navigation", { value: pagePath() });

      flushTimer = global.setInterval(flush, config.flushIntervalMs);
      return { started: true };
    }

    function stop() {
      stopped = true;
      if (flushTimer) global.clearInterval(flushTimer);
      flushTimer = null;

      while (listeners.length > 0) {
        var remove = listeners.pop();
        if (remove) remove();
      }

      return flush();
    }

    return {
      start: start,
      stop: stop,
      flush: flush,
      track: track,
      getSessionId: function () {
        return sessionId;
      },
    };
  }

  global.TrackAuraTracker = {
    init: function (options) {
      var tracker = createTracker(options || {});
      tracker.start();
      return tracker;
    },
    create: createTracker,
  };
})(window);
