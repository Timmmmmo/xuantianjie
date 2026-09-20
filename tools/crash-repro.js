/**
 * tools/crash-repro.js · v7.7 真机浏览器复现台（CDP 直连，零第三方依赖）
 *
 * 为什么要有这个东西：
 *   之前所有体检（logic-smoke / robustness / render-audit / playability）都在 Node 里跑桩，
 *   桩替掉了真 DOM、真 Canvas2D、真 AudioContext、真 requestAnimationFrame ——
 *   凡「只在真浏览器里才炸」的问题，桩一律测不出来（玩家报的 crash 就是这一类）。
 *   这里用 CDP 直连本机 Edge/Chromium headless，把游戏真跑起来，抓：
 *     ① window.onerror / unhandledrejection（一次未捕获异常 = RAF 链断 = 画面死掉）
 *     ② 主循环心跳（G.time 是否还在走 —— 死了就是「卡死」）
 *     ③ JS 堆增长（内存泄漏 / 爆堆）
 *     ④ console.error / console.warn
 *
 * 用法：node tools/crash-repro.js
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");

const ROOT = path.resolve(__dirname, "..");
let PORT = 0;
let CDP_PORT = 9300 + Math.floor(Math.random() * 600);
const VIEW = { width: 414, height: 896 };      // 手机竖屏，复现玩家真机环境
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json", ".ico": "image/x-icon",
};

function serve(port) {
  return new Promise((res, rej) => {
    const s = http.createServer((req, r) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p === "/") p = "/index.html";
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        r.writeHead(404); r.end("not found"); return;
      }
      if (process.env.XTJ_SRV_LOG) console.log("[srv]", p);
      r.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
      fs.createReadStream(f).pipe(r);
    });
    s.on("error", rej);
    // Chromium 会拒绝访问一批「不安全端口」（ERR_UNSAFE_PORT），所以这里用一组白名单端口逐个试
    s.listen(port, "127.0.0.1", () => res(s));
  });
}

function launch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xtj-edge-"));
  const args = [
    "--headless=new", "--disable-gpu", "--mute-audio",
    "--autoplay-policy=no-user-gesture-required",
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${dir}`,
    `--window-size=${VIEW.width},${VIEW.height}`,
    "--no-first-run", "--no-default-browser-check",
    "--disable-features=Translate,BackForwardCache",
    "about:blank",
  ];
  const proc = cp.spawn(EDGE, args, { stdio: "ignore", detached: false });
  return { proc, dir };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitPort() {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
      if (r.ok) return await r.json();
    } catch (_) {}
    await sleep(250);
  }
  throw new Error("CDP 端口未就绪");
}

async function pageTarget() {
  for (let i = 0; i < 120; i++) {
    const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
    const list = await r.json();
    const t = list.find((x) => x.type === "page" && x.webSocketDebuggerUrl);
    if (t) return t;
    await sleep(250);
  }
  throw new Error("找不到 page target");
}

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.waiting = new Map(); this.events = []; }
  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    const c = new CDP(ws);
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && c.waiting.has(m.id)) {
        const { res, rej } = c.waiting.get(m.id); c.waiting.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      } else if (m.method) c.events.push(m);
    };
    return c;
  }
  send(method, params = {}, timeoutMs = 60000) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => {
      this.waiting.set(id, { res, rej });
      setTimeout(() => { if (this.waiting.has(id)) { this.waiting.delete(id); rej(new Error("timeout " + method)); } }, timeoutMs);
    });
  }
  async eval(expr, awaitPromise = false, timeoutMs = 60000) {
    const r = await this.send("Runtime.evaluate", {
      expression: expr, awaitPromise, returnByValue: true, allowUnsafeEvalBlockedByCSP: true,
    }, timeoutMs);
    if (r.exceptionDetails) {
      return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    }
    return r.result?.value;
  }
  drain() { const e = this.events; this.events = []; return e; }
}

const INSTRUMENT = `
window.__CRASH__ = { errs: [], warns: [], console: [] };
window.addEventListener("error", (e) => window.__CRASH__.errs.push(String(e.message) + " @" + (e.filename||"") + ":" + (e.lineno||0)));
window.addEventListener("unhandledrejection", (e) => window.__CRASH__.errs.push("unhandledrejection: " + String(e.reason)));
const _ce = console.error.bind(console); console.error = (...a) => { window.__CRASH__.console.push("error: " + a.map(String).join(" ")); _ce(...a); };
const _cw = console.warn.bind(console);  console.warn  = (...a) => { window.__CRASH__.console.push("warn: "  + a.map(String).join(" ")); _cw(...a); };
`;

// 页面内脚本 A：真跑一局，直奔第 3 波试炼，一刀一刀把它砍碎，然后继续打 12 秒
const SCENARIO_FORCED = `
(async () => {
  const X = window.__XTJ__, G = window.G;
  const out = { steps: [], cracks: 0 };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const snap = (tag) => ({
    tag,
    t: +(G.time || 0).toFixed(2),
    heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1,
    enemies: (G.enemies || []).filter((e) => !e.dead).length,
    pickups: (G.pickups || []).length,
    particles: (G.particles || []).length,
    floaters: (G.floaters || []).length,
    state: G.state, wave: G.wave,
    trial: G.trial ? { active: G.trial.active, t: +(G.trial.t || 0).toFixed(1), cracks: G.trial.cracks || 0, hp: Math.round(G.trial.hpLeft || 0) } : null,
    errs: window.__CRASH__.errs.length,
  });
  out.steps.push(snap("boot"));
  document.getElementById("btnStart").click();
  await wait(1200);
  out.steps.push(snap("started"));

  // 直奔第 3 波伤害测试者
  X.spawnTrial(3);
  await wait(400);
  out.steps.push(snap("trial-spawned"));

  // 一刀一刀砍：每 120ms 砍 55，模拟真实输出节奏（会依次踩到 25/50/75% 里程碑）
  let hits = 0;
  for (let i = 0; i < 400; i++) {
    const d = (G.enemies || []).find((e) => e.isDummy && !e.dead);
    if (!d) break;
    X.applyHit(d, 55);
    hits++;
    if (i % 10 === 0) out.steps.push(snap("hit-" + i));
    if (G.trial && !G.trial.active) break;
    await wait(120);
  }
  out.hits = hits;
  out.cracks = G.trial ? (G.trial.cracks || 0) : -1;
  await wait(1500);
  out.steps.push(snap("trial-done"));
  out.trialResult = G.trialResult ? { wave: G.trialResult.wave, success: G.trialResult.success, grade: G.trialResult.grade, dps: G.trialResult.dps, ratio: +(G.trialResult.ratio||0).toFixed(2) } : null;

  // 打完之后继续正常推进 12 秒，看主循环还活不活
  const t0 = G.time;
  await wait(12000);
  const t1 = G.time;
  out.steps.push(snap("after-12s"));
  out.heartbeat = { from: +t0.toFixed(2), to: +t1.toFixed(2), advanced: +(t1 - t0).toFixed(2) };
  out.errs = window.__CRASH__.errs.slice(0, 20);
  out.console = window.__CRASH__.console.slice(0, 20);
  out.rafAlive = (t1 - t0) > 6;   // 12 秒实时里世界应推进 6 秒以上
  return out;
})()
`;

// 页面内脚本 B（默认）：完全交给游戏自己跑 —— 不注入、不加速、不手动打。
//   等第 3 波伤害测试者自然登场，站着不动让飞剑自己砍满 60 秒（或提前打碎），
//   全程采样堆内存 / 对象数 / DOM 节点 / 异常，再测一段帧间隔分布看有没有性能悬崖。
const SCENARIO_NATURAL = `
(async () => {
  const G = window.G;
  const out = { steps: [], samples: [] };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const snap = (tag) => ({
    tag, t: +(G.time || 0).toFixed(1), wave: G.wave, state: G.state,
    heap: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1,
    dom: document.getElementsByTagName("*").length,
    enemies: (G.enemies || []).filter((e) => !e.dead).length,
    pickups: (G.pickups || []).length,
    floaters: (G.floaters || []).length,
    trial: G.trial ? { active: G.trial.active, t: +(G.trial.t || 0).toFixed(1), cracks: G.trial.cracks || 0, hpLeft: Math.round(G.trial.hpLeft || 0), collapsing: !!G.trial.collapsing } : null,
    errs: window.__CRASH__.errs.length,
  });

  document.getElementById("btnStart").click();
  await wait(800);
  out.steps.push(snap("started"));

  let waited = 0, found = false;
  while (waited < 120000) {
    if (G.trial && G.trial.active) { found = true; break; }
    await wait(500); waited += 500;
  }
  out.trialFound = found; out.waitedMs = waited;
  if (!found) { out.errs = window.__CRASH__.errs.slice(0, 20); return out; }
  out.steps.push(snap("trial-start"));

  let n = 0;
  while (G.trial && G.trial.active && n < 80) { await wait(2000); out.samples.push(snap("T" + (++n))); }

  out.steps.push(snap("trial-end"));
  out.trialResult = G.trialResult ? { wave: G.trialResult.wave, success: G.trialResult.success, grade: G.trialResult.grade, dps: G.trialResult.dps, ratio: +(G.trialResult.ratio || 0).toFixed(2), t: +(G.trialResult.t || 0).toFixed(1) } : null;

  const dts = [];
  await new Promise((res) => {
    let lastT = performance.now(), t0 = lastT;
    const tick = (now) => { dts.push(now - lastT); lastT = now; if (now - t0 < 5000) requestAnimationFrame(tick); else res(); };
    requestAnimationFrame(tick);
  });
  dts.sort((a, b) => a - b);
  const q = (p) => dts.length ? +dts[Math.min(dts.length - 1, Math.floor(dts.length * p))].toFixed(1) : -1;
  out.frame = { n: dts.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), max: dts.length ? +dts[dts.length - 1].toFixed(1) : -1 };

  const t0 = G.time;
  await wait(15000);
  out.steps.push(snap("after-15s"));

  // 真机自愈验证：故意让主循环连炸 5 帧，看游戏会不会就此静死（这是「崩溃」最常见的形态）
  const Q = window.Quality, realSample = Q.sample;
  Q.sample = () => { throw new Error("注入的崩溃"); };
  await wait(300);
  Q.sample = realSample;
  const tb = G.time;
  await wait(3000);
  out.selfHeal = { advancedAfterInjection: +(G.time - tb).toFixed(2), level: Q.level, errs: window.__CRASH__.errs.length };
  out.heartbeat = { advanced: +(G.time - t0).toFixed(2) };
  out.errs = window.__CRASH__.errs.slice(0, 20);
  out.console = window.__CRASH__.console.slice(0, 20);
  out.rafAlive = (G.time - t0) > 8;
  return out;
})()
`;

const SCENARIO = process.argv.includes("--forced") ? SCENARIO_FORCED : SCENARIO_NATURAL;

// 入口
const SAFE_PORTS = [8791, 8811, 8877, 8901, 8973, 8123, 8361];

(async () => {
  const { proc } = launch();
  let cdp;
  try {
    await waitPort();
    const t = await pageTarget();
    cdp = await CDP.connect(t.webSocketDebuggerUrl);
    await cdp.send("Runtime.enable");
    await cdp.send("Log.enable");
    await cdp.send("Page.enable");
    await cdp.send("Network.enable");
    await cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: INSTRUMENT });
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: VIEW.width, height: VIEW.height, deviceScaleFactor: 3, mobile: true,
    });
    let has = false;
    for (const port of SAFE_PORTS) {
      try { if (server) server.close(); } catch (_) {}
      server = await serve(port);
      PORT = port;
      await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
      await sleep(1200);
      const fails = cdp.drain().filter((e) => e.method === "Network.loadingFailed");
      if (fails.length) {
        console.log(`端口 ${PORT} 被浏览器拒绝（${fails[0].params.errorText}），换下一个`);
        continue;
      }
      for (let i = 0; i < 24; i++) {
        await sleep(500);
        has = await cdp.eval("!!(window.__XTJ__ && window.G)");
        if (has) break;
      }
      if (has) break;
      console.log(`端口 ${PORT} 未加载出游戏，换下一个`);
    }
    if (!has) {
      const url = await cdp.eval("location.href");
      const ready = await cdp.eval("document.readyState");
      const boot = await cdp.eval("(window.__CRASH__ ? window.__CRASH__.errs : ['no instrument'])");
      console.log("诊断: url=", url, "readyState=", ready, "页面异常=", JSON.stringify(boot));
      throw new Error("游戏未启动：__XTJ__ 不存在");
    }
    const ver = await cdp.eval("document.querySelector('.ver-hint') ? document.querySelector('.ver-hint').textContent : 'n/a'");
    console.log("版本标记:", ver);

    const res = await cdp.eval(SCENARIO, true, 400000);
    console.log(JSON.stringify(res, null, 2));

    // 关键判定
    const ok = !res.__err && res.rafAlive && (res.errs || []).length === 0;
    console.log("\n===== 结论 =====");
    console.log("主循环存活:", res.rafAlive, "| 未捕获异常:", (res.errs || []).length);
    console.log(ok ? "✅ 未复现崩溃" : "❌ 复现到崩溃");
  } catch (e) {
    console.error("复现台异常:", e);
    process.exitCode = 1;
  } finally {
    try { cdp && cdp.ws.close(); } catch (_) {}
    try { proc.kill(); } catch (_) {}
    try { server.close(); } catch (_) {}
    setTimeout(() => process.exit(process.exitCode || 0), 300);
  }
})();
