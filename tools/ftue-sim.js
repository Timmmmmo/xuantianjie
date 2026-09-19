/* 开局体验（FTUE）探针：真实跑 game.js 的前 90 秒，量化「前 15 秒到底发生了什么」
 *
 * 用法： node tools/ftue-sim.js
 *
 * 目的：回答「玩家为什么在 15 秒内就走」——是没东西打、没反馈、还是被教程挡住。
 *      用时间线数据说话，不靠感觉。
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const SITE = path.join(__dirname, "..");
const SRC = path.join(SITE, "game.js");
const OUT = process.env.XTJ_FTUE_OUT || path.join(__dirname, "ftue-report.txt");
const noop = () => {};
const log = [];
const say = (s) => { log.push(String(s)); console.log(s); };

// ---------- Canvas 2D stub ----------
function makeCtx() {
  const grad = { addColorStop: noop };
  const c = { createRadialGradient: () => grad, createLinearGradient: () => grad, createPattern: () => null, measureText: () => ({ width: 10 }) };
  for (const m of ["clearRect","save","restore","translate","rotate","scale","setTransform","beginPath","closePath","moveTo","lineTo","arc","arcTo","ellipse","rect","roundRect","fill","stroke","fillRect","strokeRect","clip","fillText","strokeText","setLineDash","drawImage","quadraticCurveTo","bezierCurveTo"]) c[m] = noop;
  return c;
}
// ---------- DOM stub ----------
function makeEl(id) {
  const el = {
    id, textContent: "", value: "", _cls: new Set(), _lis: {},
    style: { _p: {}, setProperty(k, v) { this._p[k] = v; }, removeProperty(k) { delete this._p[k]; }, getPropertyValue(k) { return this._p[k] || ""; } },
    addEventListener(t, fn) { (this._lis[t] = this._lis[t] || []).push(fn); },
    removeEventListener: noop,
    dispatch(t, ev) { (this._lis[t] || []).forEach((fn) => fn(ev || { preventDefault: noop, target: this })); },
    appendChild(c) { this.children.push(c); return c; },
    removeChild: noop, insertBefore: noop, remove: noop, setAttribute: noop, getAttribute: () => null,
    querySelector: () => makeEl("q"), querySelectorAll: () => [],
    getBoundingClientRect: () => ({ width: 390, height: 844, left: 0, top: 0, right: 390, bottom: 844 }),
    focus: noop, blur: noop, click: noop, closest: () => null, setPointerCapture: noop, releasePointerCapture: noop,
    offsetWidth: 120, offsetHeight: 120, dataset: {}, children: [],
  };
  let _html = "";
  Object.defineProperty(el, "innerHTML", { get() { return _html; }, set(v) { _html = String(v); el.children.length = 0; }, configurable: true });
  el.classList = {
    add: (...c) => c.forEach((x) => el._cls.add(x)),
    remove: (...c) => c.forEach((x) => el._cls.delete(x)),
    toggle: (c, f) => { const on = f === undefined ? !el._cls.has(c) : !!f; if (on) el._cls.add(c); else el._cls.delete(c); return on; },
    contains: (c) => el._cls.has(c),
  };
  return el;
}
const els = {};
const getEl = (id) => (els[id] = els[id] || makeEl(id));
const doc = {
  _lis: {}, hidden: false, visibilityState: "visible", body: makeEl("body"), documentElement: makeEl("html"),
  getElementById: getEl, querySelector: (s) => getEl("sel:" + s), querySelectorAll: () => [],
  createElement: (t) => makeEl("new:" + t), createDocumentFragment: () => makeEl("frag"), createTextNode: () => ({}),
  addEventListener(t, fn) { (this._lis[t] = this._lis[t] || []).push(fn); }, removeEventListener: noop,
};
const store = {};
const localStorageStub = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; }, clear: () => {} };
let T = 0;
const rafQueue = [];
const win = { _lis: {}, innerWidth: 390, innerHeight: 844, devicePixelRatio: 2, screen: { width: 390, height: 844 },
  addEventListener(t, fn) { (this._lis[t] = this._lis[t] || []).push(fn); }, removeEventListener: noop };
const nav = { userAgent: "node-ftue", platform: "Win32", maxTouchPoints: 0, deviceMemory: 8, hardwareConcurrency: 8, vibrate: noop };
const sandbox = {
  console, Math, JSON, Date, Object, Array, Set, Map, Number, String, Boolean, Error, RegExp,
  isNaN, isFinite, parseInt, parseFloat, setTimeout, clearTimeout, setInterval, clearInterval,
  document: doc, navigator: nav, localStorage: localStorageStub,
  location: { protocol: "file:", href: "file:///game.js" }, performance: { now: () => T },
  requestAnimationFrame: (fn) => { rafQueue.push(fn); return rafQueue.length; }, cancelAnimationFrame: noop,
};
sandbox.window = win; sandbox.globalThis = sandbox;
win.document = doc; win.navigator = nav; win.localStorage = localStorageStub;
win.location = sandbox.location; win.performance = sandbox.performance;
win.requestAnimationFrame = sandbox.requestAnimationFrame; win.AudioContext = undefined;
const canvasEl = getEl("game");
canvasEl.getContext = () => makeCtx();
canvasEl.width = 0; canvasEl.height = 0;

const code = fs.readFileSync(SRC, "utf8");
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: "game.js" });
const G = win.G || sandbox.G;
const X = win.__XTJ__;

function frames(n, ms = 16) {
  for (let i = 0; i < n; i++) {
    const cbs = rafQueue.splice(0, rafQueue.length);
    T += ms;
    for (const cb of cbs) cb(T);
  }
}

// ---------- 事件采样 ----------
let lastToast = "", lastBanner = "";
const events = [];
function sampleEvents(t) {
  const toast = (els["toast"] && els["toast"].textContent) || "";
  if (toast && toast !== lastToast) { events.push({ t, kind: "toast", text: toast }); lastToast = toast; }
  const bb = els["bigBanner"];
  const bannerOn = bb && !bb._cls.has("hidden");
  const bTxt = bannerOn ? `${(els["bigBannerText"] || {}).textContent || ""}` : "";
  if (bannerOn && bTxt && bTxt !== lastBanner) { events.push({ t, kind: "banner", text: bTxt }); lastBanner = bTxt; }
  if (!bannerOn) lastBanner = "";
}

// ---------- 模拟一局开局 ----------
// mode: "idle" 站桩（新手最常见） / "chase" 主动追最近的怪
function simulate(mode, seconds) {
  // 重置到干净的一局
  store["xtj_meta_v1"] = undefined;
  els["btnStart"].dispatch("click");
  frames(2);
  G.state = "play";
  G.hitStop = 0;
  const rows = [];
  let kills0 = G.kills, lvl0 = G.level;
  let firstKill = null, firstLevel = null, firstPickup = null, firstHit = null;
  let pickups0 = 0, hurtCount = 0, lastHp = G.hp;
  let tutShownSeconds = 0, peakEnemies = 0;
  const pickupCount = () => G.pickups.length;
  let pickedTotal = 0, prevPickupLen = 0;

  const dt = 1 / 60;
  for (let f = 0; f < seconds * 60; f++) {
    const t = f * dt;
    if (mode === "chase" && G.enemies.length) {
      let best = null, bd = 1e9;
      for (const e of G.enemies) {
        if (e.dead) continue;
        const d = Math.hypot(e.x - G.px, e.y - G.py);
        if (d < bd) { bd = d; best = e; }
      }
      if (best && bd > 60) {
        const a = Math.atan2(best.y - G.py, best.x - G.px);
        G.px += Math.cos(a) * G.moveSpeed * dt;
        G.py += Math.sin(a) * G.moveSpeed * dt;
      }
    }
    X.update(dt);
    G.hitStop = 0;
    // v7.1：升级弹窗会暂停世界，模拟玩家「看一眼就点第一张」（真实玩家会犹豫 1~2 秒）
    if (G.state === "level") {
      const btns = (els["levelChoices"] || {}).children || [];
      if (btns.length) btns[Math.floor(Math.random() * btns.length)].dispatch("click");
      else { G.pendingLevel = 0; G.state = "play"; }
    }
    if (G.hp < lastHp - 0.01) { hurtCount++; if (firstHit === null) firstHit = t; }
    lastHp = G.hp;
    const curPk = pickupCount();
    if (curPk > prevPickupLen) pickedTotal += curPk - prevPickupLen;
    prevPickupLen = curPk;
    if (firstKill === null && G.kills > kills0) firstKill = t;
    if (firstLevel === null && G.level > lvl0) firstLevel = t;
    if (firstPickup === null && pickedTotal > 0) firstPickup = t;
    const alive = G.enemies.filter((e) => !e.dead).length;
    if (alive > peakEnemies) peakEnemies = alive;
    const tut = els["tutOverlay"];
    if (tut && !tut._cls.has("hidden")) tutShownSeconds += dt;
    sampleEvents(t);
    if (f % 60 === 59) {
      rows.push({
        t: Math.round(t + dt), wave: G.wave, alive, kills: G.kills - kills0, lvl: G.level,
        atk: +G.atk.toFixed(1), hp: Math.round(G.hp), picked: pickedTotal, hurt: hurtCount,
      });
    }
    if (G.state !== "play") { rows.push({ t: Math.round(t), dead: true }); break; }
  }
  return { rows, firstKill, firstLevel, firstPickup, firstHit, hurtCount, tutShownSeconds, peakEnemies, pickedTotal, kills: G.kills - kills0, lvl: G.level - lvl0 };
}

say("玄天劫 · 开局体验（FTUE）探针 —— 真实跑 game.js 帧循环，非人工估算");
say("生成时间 " + new Date().toISOString());
say("");
for (const mode of ["idle", "chase"]) {
  const r = simulate(mode, 90);
  say(`===== 模拟：${mode === "idle" ? "站桩新手（不动，等怪来）" : "主动追击（朝最近怪走）"} =====`);
  say(`首次击杀 ${r.firstKill === null ? "从未" : r.firstKill.toFixed(1) + "s"} · 首次升级 ${r.firstLevel === null ? "从未" : r.firstLevel.toFixed(1) + "s"} · 首次掉落 ${r.firstPickup === null ? "从未" : r.firstPickup.toFixed(1) + "s"} · 首次挨打 ${r.firstHit === null ? "从未" : r.firstHit.toFixed(1) + "s"}`);
  say(`90s 累计：击杀 ${r.kills} · 升级 ${r.lvl} 次 · 拾取 ${r.pickedTotal} · 挨打 ${r.hurtCount} 次 · 同屏峰值 ${r.peakEnemies} · 教程遮挡 ${r.tutShownSeconds.toFixed(1)}s`);
  say("");
  say(" 秒  波次 同屏怪 累计击杀 等级 攻击 血量 拾取 挨打");
  for (const row of r.rows) {
    if (row.dead) { say(`  ${String(row.t).padStart(3)}  —— 玩家阵亡`); break; }
    if (row.t > 60 && row.t % 10 !== 0) continue;
    say(`${String(row.t).padStart(4)} ${String(row.wave).padStart(5)} ${String(row.alive).padStart(6)} ${String(row.kills).padStart(8)} ${String(row.lvl).padStart(4)} ${String(row.atk).padStart(6)} ${String(row.hp).padStart(5)} ${String(row.picked).padStart(5)} ${String(row.hurt).padStart(4)}`);
  }
  say("");
  const early = events.filter((e) => e.t <= 15);
  say(`前 15 秒反馈事件 ${early.length} 条：`);
  for (const e of early) say(`   [${e.t.toFixed(1)}s] ${e.kind}: ${e.text}`);
  say("");
  events.length = 0;
}

fs.writeFileSync(OUT, log.join("\n"), "utf8");
say("[written] " + OUT);
