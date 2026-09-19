/* 玄天劫 · 离线缓存 Service Worker */
const CACHE = "xuantianjie-v7.6";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./manifest.webmanifest",
  "./assets/bg-start.png",
  "./assets/char-sword.png",
  "./assets/char-mage.png",
  "./assets/char-body.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ASSETS.map((u) => c.add(new Request(u, { cache: "reload" })))))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  // 导航请求：网络优先，离线回退缓存
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }
  // v7.5.1 关键修复：代码类资源「网络优先，离线回退缓存」。
  //   原来是缓存优先 —— 玩家本地一旦存住旧版 game.js，新版发上去他根本拿不到，
  //   表现就是「你说明明做了，我这边就是没有」。离线能力不能靠牺牲更新到达率来换。
  //   图片/图标不会变，继续走缓存优先（省流量、秒开）。
  const url = new URL(req.url);
  const isCode = /\.(html|js|css|json|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
  if (isCode) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("./index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
