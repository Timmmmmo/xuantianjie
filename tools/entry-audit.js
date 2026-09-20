/**
 * tools/entry-audit.js · v7.8.5 入口可达性审计（CDP 直连真机 Edge，零依赖）
 *
 * 为什么要有它：
 *   v7.8 在开始页塞进了日课 / 签到 / 周常三大回访盒，页面又是 body{position:fixed;overflow:hidden}，
 *   一旦内容高度超过视口，flex 居中会让内容「上下同时溢出」——靠下的「踏入战场」被裁到屏幕外，
 *   玩家看到的就是「主界面变成签到模块，点不到开始」。
 *   这个台子真开浏览器、按手机竖屏量每个元素的实际矩形，判定：
 *     ① 关键入口（btnStart）是否完整落在视口内
 *     ② 是否被更高层元素遮挡（elementFromPoint 命中判定）
 *     ③ 内容总高 vs 视口高（溢出多少像素）
 *     ④ 真的点下去，state 是否从 m? 进入 "play"，主循环是否活
 *     ⑤ 顺带走一遍 开始→暂停→继续→返回山门 的闭环
 *
 * 用法：node tools/entry-audit.js
 *       node tools/entry-audit.js --url https://timmmmmo.github.io/xuantianjie   # 直接审线上（发布后终验）
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
const os = require("os");

const ROOT = path.resolve(__dirname, "..");
let PORT = 0;
let server = null;
let CDP_PORT = 9300 + Math.floor(Math.random() * 600);
const VIEW = { width: 414, height: 896 };
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const SAFE_PORTS = [8791, 8811, 8877, 8901, 8973, 8123, 8361];

// v7.8.6：支持直接审线上地址 —— 本地绿不等于线上绿（SW 缓存 / CDN 未更新都可能让线上还是旧壳）
const _argv = process.argv.slice(2);
const _ui = _argv.indexOf("--url");
const REMOTE = _ui >= 0 && _argv[_ui + 1] ? _argv[_ui + 1].replace(/\/+$/, "") : null;
const BASE = REMOTE || null;

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
      r.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream", "Cache-Control": "no-store" });
      fs.createReadStream(f).pipe(r);
    });
    s.on("error", rej);
    s.listen(port, "127.0.0.1", () => res(s));
  });
}

function launch() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xtj-entry-"));
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
    try { const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`); if (r.ok) return await r.json(); } catch (_) {}
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
    const r = await this.send("Runtime.evaluate", { expression: expr, awaitPromise, returnByValue: true, allowUnsafeEvalBlockedByCSP: true }, timeoutMs);
    if (r.exceptionDetails) return { __err: r.exceptionDetails.exception?.description || r.exceptionDetails.text };
    return r.result?.value;
  }
  drain() { const e = this.events; this.events = []; return e; }
}

const INSTRUMENT = `
window.__CRASH__ = { errs: [], console: [] };
window.addEventListener("error", (e) => window.__CRASH__.errs.push(String(e.message) + " @" + (e.filename||"") + ":" + (e.lineno||0)));
window.addEventListener("unhandledrejection", (e) => window.__CRASH__.errs.push("unhandledrejection: " + String(e.reason)));
const _ce = console.error.bind(console); console.error = (...a) => { window.__CRASH__.console.push("error: " + a.map(String).join(" ")); _ce(...a); };
`;

const AUDIT = `
(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const X = window.__XTJ__ || {};
  const out = { viewport: { w: innerWidth, h: innerHeight }, elements: [], problems: [] };
  const sel = {
    startScreen:"#startScreen", signinBox:"#signinBox", dailyBox:".daily-box", weeklyBox:"#weeklyBox",
    charRow:"#charRow", btnStart:"#btnStart", btnShop:"#btnShop", btnCodex:"#btnCodex",
    btnSignin:"#btnSignin", btnAdDaily:"#btnAdDaily", btnWeeklyClaim:"#btnWeeklyClaim",
    btnFullscreen:"#btnFullscreen", btnSound:"#btnSound", verHint:".ver-hint",
  };
  const label = {
    startScreen:"开始页", signinBox:"签到盒", dailyBox:"日课盒", weeklyBox:"周常盒",
    charRow:"角色行", btnStart:"踏入战场(主入口)", btnShop:"灵石商店", btnCodex:"万宝图鉴",
    btnSignin:"领取签到", btnAdDaily:"日课补全", btnWeeklyClaim:"周常领取",
    btnFullscreen:"全屏", btnSound:"音效", verHint:"版本标签",
  };
  const ids = Object.keys(sel);
  const inView = (r) => r && r.top >= -0.5 && r.bottom <= innerHeight + 0.5 && r.left >= -0.5 && r.right <= innerWidth + 0.5;
  const overlaps = (a, b) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

  for (const id of ids) {
    const el = document.querySelector(sel[id]);
    if (!el) { out.problems.push("找不到元素 " + sel[id] + "（" + (label[id] || id) + "）"); continue; }
    const r = el.getBoundingClientRect();
    const st = getComputedStyle(el);
    const rec = {
      id, label: label[id] || id,
      rect: { top: +r.top.toFixed(1), bottom: +r.bottom.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      display: st.display, visibility: st.visibility, pointerEvents: st.pointerEvents,
      inViewport: inView(r),
      clippedTop: r.top < -0.5, clippedBottom: r.bottom > innerHeight + 0.5,
    };
    if (id === "btnStart") {
      // 命中判定：按钮中心点上最顶层的元素是谁（被遮挡就点不到）
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const hit = (cx > 0 && cy > 0 && cx < innerWidth && cy < innerHeight) ? document.elementFromPoint(cx, cy) : null;
      rec.hitTag = hit ? (hit.tagName + (hit.id ? "#" + hit.id : "") + (hit.className && typeof hit.className === "string" ? "." + hit.className.split(" ")[0] : "")) : "(视口外取不到)";
      rec.hitIsSelfOrChild = !!(hit && (hit === el || el.contains(hit)));
      if (!rec.inViewport) out.problems.push("P1 主入口「踏入战场」不在视口内：" + (rec.clippedBottom ? "被裁在屏幕下沿之外" : rec.clippedTop ? "被裁在屏幕上沿之外" : "越界"));
      if (rec.inViewport && !rec.hitIsSelfOrChild) out.problems.push("P1 主入口被遮挡，点到的是 " + rec.hitTag);
    }
    out.elements.push(rec);
  }

  // 内容总高 vs 视口
  const inner = document.querySelector("#startScreen .start-inner");
  if (inner) {
    const ir = inner.getBoundingClientRect();
    const sc = getComputedStyle(inner);
    out.startInner = {
      h: +ir.height.toFixed(1), top: +ir.top.toFixed(1), bottom: +ir.bottom.toFixed(1),
      overflowY: sc.overflowY, scrollHeight: inner.scrollHeight, clientHeight: inner.clientHeight,
      scrollable: inner.scrollHeight > inner.clientHeight + 1 && sc.overflowY !== "visible",
    };
    out.overflowPx = Math.round(inner.scrollHeight - inner.clientHeight);
    if (out.overflowPx > 1 && !out.startInner.scrollable) out.problems.push("P1 开始页内容超出视口 " + out.overflowPx + "px 且不可滚动（内容被永久裁掉）");
  }

  // 真的点一次主入口，看能不能进游戏
  const before = window.G ? window.G.state : "(no G)";
  document.getElementById("btnStart").click();
  await wait(1500);
  const after = window.G ? window.G.state : "(no G)";

  // 主循环存活判定：数 RAF 回调 + 世界时间是否推进。
  //   注意阈值只判「活 / 死」，不判流畅 —— 无头 Edge 关了 GPU 走软件光栅，
  //   实测 dpr=1 约 45/32fps、dpr=3 约 14/10fps（连不跑循环的菜单页也只有 14fps），
  //   帧率低是这台台子的固有开销，不是游戏掉帧。真正的死法是「回调彻底不来了」。
  const raf = await new Promise((res) => {
    let n = 0; const t0 = performance.now(); const t = window.G ? G.time : -1;
    const tick = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(tick); else res({ n, dt: +((window.G ? G.time : 0) - t).toFixed(2), ms: Math.round(performance.now() - t0) }); };
    requestAnimationFrame(tick);
  });
  out.startFlow = {
    stateBefore: before, stateAfter: after,
    rafFrames: raf.n, rafWindowMs: raf.ms, rafFps: +(raf.n / (raf.ms / 1000)).toFixed(1),
    gameTimeAdvanced: raf.dt,
    enteredPlay: after === "play",
    loopAlive: raf.n >= 6,
    gameTimeMoving: raf.dt > 0.05,
  };
  if (!out.startFlow.enteredPlay) out.problems.push("P1 点击「踏入战场」后 state=" + after + "，没能进入战斗");
  if (!out.startFlow.loopAlive) out.problems.push("P1 进入战斗后主循环停了（2 秒内只有 " + raf.n + " 帧 RAF，已判定静死）");
  if (!out.startFlow.gameTimeMoving) out.problems.push("P1 进入战斗后世界时间没有推进（2 秒内只走了 " + raf.dt + "s）");

  // 暂停 → 继续 → 返回山门 闭环（暂停没有按钮，靠 Esc/P 键位，与真实玩家一致）
  const click = (id) => { const e = document.getElementById(id); if (e) e.click(); return !!e; };
  const pressEsc = () => window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  pressEsc();
  await wait(600);
  const stPause = window.G ? window.G.state : "?";
  click("btnResume");
  await wait(600);
  const stResume = window.G ? window.G.state : "?";
  pressEsc(); await wait(400);
  click("btnPauseHome"); await wait(800);
  const stHome = window.G ? window.G.state : "?";
  out.pauseFlow = { afterPause: stPause, afterResume: stResume, afterHome: stHome };
  if (stPause !== "pause") out.problems.push("P2 Esc 暂停没生效（state=" + stPause + "）");
  if (stResume !== "play") out.problems.push("P2 暂停后「继续战斗」没能回到 play（state=" + stResume + "）");
  if (stHome !== "menu") out.problems.push("P2「返回山门」没能回到菜单（state=" + stHome + "）");

  // 回访盒按钮是否真的可点（签到 / 日课补全）
  const coins0 = window.G ? (G.meta && G.meta.coins) || 0 : -1;
  const canSignin = !!document.getElementById("btnSignin");
  click("btnSignin"); await wait(400);
  const coins1 = window.G ? (G.meta && G.meta.coins) || 0 : -1;
  out.revisitFlow = { signinButtonPresent: canSignin, coinsBefore: coins0, coinsAfterSignin: coins1 };

  // 折叠面板：默认收起（不占高度）→ 展开后三盒有真实高度 → 再收起复原
  const panel = document.getElementById("revisitPanel");
  const boxH = () => ["#signinBox", ".daily-box", "#weeklyBox"].reduce((a, s) => a + (document.querySelector(s) || { getBoundingClientRect: () => ({ height: 0 }) }).getBoundingClientRect().height, 0);
  const collapsedH = boxH();
  click("btnRevisitToggle"); await wait(500);
  const expandedH = boxH();
  const expandedOpen = panel && panel.classList.contains("open");
  click("btnRevisitToggle"); await wait(500);
  const collapsedAgainH = boxH();
  out.revisitPanel = { collapsedHeight: Math.round(collapsedH), expandedHeight: Math.round(expandedH), collapsedAgainHeight: Math.round(collapsedAgainH), expandedOpen };
  if (collapsedH > 1) out.problems.push("P2 修行录默认没收起（回访盒高度 " + Math.round(collapsedH) + "px）");
  if (expandedH < 100) out.problems.push("P2 修行录展开后回访盒没有出现（高度 " + Math.round(expandedH) + "px）");
  if (collapsedAgainH > 1) out.problems.push("P2 修行录收起失败（回访盒高度 " + Math.round(collapsedAgainH) + "px）");

  // 全流程闭环：商店 / 图鉴 / 开战 → 阵亡 → 再战 → 回山门，且回菜单后入口依然够得到
  const st = () => (window.G ? G.state : "?");
  const innerEl = document.querySelector("#startScreen .start-inner");
  const entryReachable = () => {
    const b = document.getElementById("btnStart").getBoundingClientRect();
    const i = innerEl.getBoundingClientRect();
    return b.top >= i.top - 0.5 && b.bottom <= i.bottom + 0.5;
  };
  out.loops = {};
  click("btnShop"); await wait(600); out.loops.shop = st();
  click("btnShopBack"); await wait(700); out.loops.shopBack = st();
  click("btnCodex"); await wait(600); out.loops.codex = st();
  click("btnCodexBack"); await wait(700); out.loops.codexBack = st();
  out.loops.entryReachableAfterMenus = entryReachable();

  click("btnStart"); await wait(1300);
  const kill = () => { G.invuln = 0; G.shield = 0; X.damagePlayer(1e9); };
  kill(); await wait(1600); out.loops.afterDeath = st();
  click("btnRetry"); await wait(1300); out.loops.afterRetry = st();
  kill(); await wait(1600); out.loops.afterDeath2 = st();
  click("btnHome"); await wait(900); out.loops.afterHomeFromOver = st();
  out.loops.entryReachableAfterRun = entryReachable();

  if (out.loops.shop !== "shop") out.problems.push("P2「灵石商店」没打开（state=" + out.loops.shop + "）");
  if (out.loops.shopBack !== "menu") out.problems.push("P2 商店「返回山门」异常（state=" + out.loops.shopBack + "）");
  if (out.loops.codex !== "codex") out.problems.push("P2「万宝图鉴」没打开（state=" + out.loops.codex + "）");
  if (out.loops.codexBack !== "menu") out.problems.push("P2 图鉴「返回山门」异常（state=" + out.loops.codexBack + "）");
  if (out.loops.afterDeath !== "over") out.problems.push("P1 血量归零后没有进入结算（state=" + out.loops.afterDeath + "）");
  if (out.loops.afterRetry !== "play") out.problems.push("P1 结算页「再战一局」没能重开（state=" + out.loops.afterRetry + "）");
  if (out.loops.afterHomeFromOver !== "menu") out.problems.push("P1 结算页「返回山门」没能回菜单（state=" + out.loops.afterHomeFromOver + "）");
  if (!out.loops.entryReachableAfterMenus) out.problems.push("P1 逛完商店/图鉴回菜单后，主入口又不在视口内了");
  if (!out.loops.entryReachableAfterRun) out.problems.push("P1 打完一局回菜单后，主入口又不在视口内了");

  out.appVersion = (window.__XTJ__ && window.__XTJ__.APP_VERSION) || "(取不到)";
  out.errs = window.__CRASH__.errs.slice(0, 20);
  out.console = window.__CRASH__.console.slice(0, 20);
  return out;
})()
`;

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
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: VIEW.width, height: VIEW.height, deviceScaleFactor: 3, mobile: true });

    let has = false;
    if (BASE) {
      // 审线上：不启本地静态服，直连已发布地址
      console.log(`=== 审线上地址：${BASE} ===`);
      await cdp.send("Page.navigate", { url: BASE + "/index.html" });
      for (let i = 0; i < 40; i++) {
        await sleep(500);
        has = await cdp.eval("!!(window.__XTJ__ && window.G)");
        if (has) break;
      }
    } else {
      for (const port of SAFE_PORTS) {
        try { if (server) server.close(); } catch (_) {}
        server = await serve(port);
        PORT = port;
        await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/index.html` });
        await sleep(1200);
        const fails = cdp.drain().filter((e) => e.method === "Network.loadingFailed");
        if (fails.length) { console.log(`端口 ${PORT} 被拒（${fails[0].params.errorText}），换下一个`); continue; }
        for (let i = 0; i < 24; i++) {
          await sleep(500);
          has = await cdp.eval("!!(window.__XTJ__ && window.G)");
          if (has) break;
        }
        if (has) break;
        console.log(`端口 ${PORT} 未加载出游戏，换下一个`);
      }
    }
    if (!has) throw new Error("游戏未启动：__XTJ__ 不存在");

    const res = await cdp.eval(AUDIT, true, 120000);
    if (res && res.__err) { console.log("页面内脚本异常:", res.__err); process.exitCode = 1; return; }

    console.log("=== 视口 ===");
    console.log(`  ${res.viewport.w} x ${res.viewport.h}`);
    console.log(`  构建版本 = ${res.appVersion}`);
    console.log("=== 开始页元素 ===");
    for (const e of res.elements) {
      const flag = e.inViewport ? " 视口内 " : (e.clippedBottom ? " 裁下沿 " : e.clippedTop ? " 裁上沿 " : " 越界  ");
      console.log(`  [${flag}] ${e.label.padEnd(16, "　")} top=${String(e.rect.top).padStart(7)} bottom=${String(e.rect.bottom).padStart(7)} h=${String(e.rect.h).padStart(6)}${e.hitTag ? "  hit=" + e.hitTag + (e.hitIsSelfOrChild ? " ✓" : " ✗") : ""}`);
    }
    if (res.startInner) {
      console.log("=== 开始页容器 ===");
      console.log(`  内容高=${res.startInner.scrollHeight} 可视高=${res.startInner.clientHeight} 溢出=${res.overflowPx}px overflowY=${res.startInner.overflowY} 可滚动=${res.startInner.scrollable}`);
    }
    console.log("=== 开始流程 ===");
    console.log("  " + JSON.stringify(res.startFlow));
    console.log("=== 暂停闭环 ===");
    console.log("  " + JSON.stringify(res.pauseFlow));
    console.log("=== 回访盒 ===");
    console.log("  " + JSON.stringify(res.revisitFlow));
    if (res.revisitPanel) {
      console.log("=== 修行录折叠 ===");
      console.log(`  默认收起高度=${res.revisitPanel.collapsedHeight}px  展开后=${res.revisitPanel.expandedHeight}px  再收起=${res.revisitPanel.collapsedAgainHeight}px`);
    }
    if (res.loops) {
      console.log("=== 全流程闭环 ===");
      console.log("  " + JSON.stringify(res.loops));
    }
    console.log("=== 页面异常 ===");
    console.log("  " + JSON.stringify(res.errs));

    // ---------- 多机型扫描：入口必须在各种屏幕上都能点到 ----------
    //   只在一种尺寸上验等于没验 —— 玩家报的「进不去游戏」正是发生在特定机型上。
    const SWEEP = [
      { w: 375, h: 667, name: "iPhone SE / 8", portrait: true },
      { w: 360, h: 640, name: "Android 小屏", portrait: true },
      { w: 390, h: 844, name: "iPhone 14", portrait: true },
      { w: 414, h: 896, name: "iPhone 11 / XR", portrait: true },
      { w: 320, h: 568, name: "iPhone 5 · 极窄", portrait: true },
      { w: 412, h: 915, name: "Pixel 7", portrait: true },
      { w: 896, h: 414, name: "横屏", portrait: false },
    ];
    const CHECK = `(() => {
      const el = document.getElementById('btnStart');
      const b = el.getBoundingClientRect();
      const inner = document.querySelector('#startScreen .start-inner');
      const ir = inner.getBoundingClientRect();
      const st = getComputedStyle(inner);
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2;
      const hit = (cx > 0 && cy > 0 && cx < innerWidth && cy < innerHeight) ? document.elementFromPoint(cx, cy) : null;
      return {
        w: innerWidth, h: innerHeight,
        btnTop: +b.top.toFixed(1), btnBottom: +b.bottom.toFixed(1),
        inView: b.top >= -0.5 && b.bottom <= innerHeight + 0.5,
        hitIsSelf: !!(hit && (hit === el || el.contains(hit))),
        hitTag: hit ? (hit.tagName + (hit.id ? '#' + hit.id : '')) : '(取不到)',
        overflow: Math.round(inner.scrollHeight - inner.clientHeight),
        scrollable: st.overflowY !== 'visible' && inner.scrollHeight > inner.clientHeight + 1,
        entryReachable: b.top >= ir.top - 0.5 && b.bottom <= ir.bottom + 0.5,
      };
    })()`;
    console.log("=== 多机型扫描 ===");
    res.sweep = [];
    for (const v of SWEEP) {
      await cdp.send("Emulation.setDeviceMetricsOverride", { width: v.w, height: v.h, deviceScaleFactor: 3, mobile: true });
      await cdp.send("Page.reload", { ignoreCache: true });
      for (let i = 0; i < 30; i++) { await sleep(400); if (await cdp.eval("!!(window.__XTJ__ && window.G)")) break; }
      await sleep(900);
      const r = await cdp.eval(CHECK);
      if (r && r.__err) { res.sweep.push({ device: v.name, err: r.__err }); continue; }
      const row = { device: v.name, vp: r.w + "x" + r.h, btn: r.btnTop + "–" + r.btnBottom, overflow: r.overflow, scrollable: r.scrollable, inView: r.inView, clickable: r.hitIsSelf, reachable: r.entryReachable };
      res.sweep.push(row);
      const ok = r.inView && r.hitIsSelf;
      console.log(`  ${ok ? "✅" : "❌"} ${v.name.padEnd(18, " ")} ${row.vp.padStart(9)} 入口 top=${String(r.btnTop).padStart(7)} bottom=${String(r.btnBottom).padStart(7)} 溢出=${String(r.overflow).padStart(4)}px 可滚=${r.scrollable}`);
      if (!ok) {
        const p = `P1 ${v.name}（${row.vp}）主入口不可直接点击：inView=${r.inView} hit=${r.hitTag}`;
        res.problems.push(p);
      } else if (!r.entryReachable) {
        res.problems.push(`P2 ${v.name}（${row.vp}）主入口需滚动一下才完全露出（内容溢出 ${r.overflow}px，容器可滚=${r.scrollable}）`);
      }
    }

    console.log("\n===== 问题清单 =====");
    if (!res.problems.length) console.log("  （无）");
    res.problems.forEach((p) => console.log("  · " + p));
    process.exitCode = res.problems.length ? 1 : 0;
  } catch (e) {
    console.error("审计台异常:", e);
    process.exitCode = 1;
  } finally {
    try { cdp && cdp.ws.close(); } catch (_) {}
    try { proc.kill(); } catch (_) {}
    try { server && server.close(); } catch (_) {}
    setTimeout(() => process.exit(process.exitCode || 0), 300);
  }
})();
