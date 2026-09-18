/* 玄天劫 · 本地埋点环（无后端） */
(function () {
  "use strict";
  const MAX = 200;
  const events = [];
  const Analytics = {
    track(name, props) {
      const e = {
        name,
        props: props || {},
        t: Date.now(),
      };
      events.push(e);
      if (events.length > MAX) events.shift();
      try { console.debug("[xtj]", name, e.props); } catch (_) {}
      return e;
    },
    getEvents() { return events.slice(); },
    clear() { events.length = 0; },
  };
  window.Analytics = Analytics;
})();
