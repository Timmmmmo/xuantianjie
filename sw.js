/* 玄天劫 · 离线缓存 Service Worker — v7.8 合并版
   代码类网络优先（保证热更到达），图片缓存优先（省流量秒开） */
const CACHE = "xuantianjie-v7.8.28-tower";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./manifest.webmanifest",
  "./js/analytics.js",
  "./js/ads.js",
  "./js/weekly.js",
  "./js/treasure.js",
  "./js/squareloop.js",
  "./js/signin.js",
  "./js/daily.js",
  "./js/sharecard.js",
  "./assets/bg-arena.png",
  "./assets/sprites/player-sword.png",
  "./assets/sprites/player-mage.png",
  "./assets/sprites/player-body.png",
  "./assets/sprites/enemy-fox.png",
  "./assets/sprites/enemy-wolf.png",
  "./assets/sprites/enemy-golem.png",
  "./assets/sprites/enemy-ghost.png",
  "./assets/sprites/enemy-bat.png",
  "./assets/sprites/enemy-moth.png",
  "./assets/sprites/enemy-dust.png",
  "./assets/sprites/prop-spring.png",
  "./assets/sprites/prop-swordtomb.png",
  "./assets/bg-start.png",
  "./assets/char-sword.png",
  "./assets/char-mage.png",
  "./assets/char-body.png",
  "./assets/eternaut_idle.png",
  "./assets/eternaut_crack1.png",
  "./assets/eternaut_shatter.png",
  "./assets/stance_wind.png",
  "./assets/stance_rain.png",
  "./assets/stance_thunder.png",
  "./assets/stance_bolt.png",
  "./assets/enemy_fox.png",
  "./assets/enemy_wolf.png",
  "./assets/enemy_golem.png",
  "./assets/boss_yaowang.png",
  "./assets/challenge_yaojiang.png",
  "./assets/neutral_toad.png",
  "./assets/neutral_wood.png",
  "./assets/neutral_box.png",
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
