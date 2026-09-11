/* 玄天劫 · 刷不完的怪 v1.2 — 对齐 2026 TOP10 幸存者玩法 */
(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const canvas = $("game");
const ctx = canvas.getContext("2d");

const ui = {
  app: $("app"),
  hud: $("hud"),
  hpFill: $("hpFill"), hpText: $("hpText"),
  mpFill: $("mpFill"), mpText: $("mpText"),
  waveText: $("waveText"), killText: $("killText"), timeText: $("timeText"),
  coinText: $("coinText"), weaponHint: $("weaponHint"), waveFill: $("waveFill"),
  xpFill: $("xpFill"), levelText: $("levelText"), titleText: $("titleText"),
  comboBadge: $("comboBadge"), comboNum: $("comboNum"),
  bossBar: $("bossBar"), bossBarName: $("bossBarName"), bossBarFill: $("bossBarFill"),
  levelModal: $("levelModal"), levelChoices: $("levelChoices"),
  jobModal: $("jobModal"), jobChoices: $("jobChoices"),
  jobTitle: $("jobTitle"), jobSub: $("jobSub"),
  jobHud: $("jobHud"), jobHudIco: $("jobHudIco"),
  jobHudPath: $("jobHudPath"), jobHudBranch: $("jobHudBranch"),
  startScreen: $("startScreen"), overScreen: $("overScreen"),
  shopScreen: $("shopScreen"), shopList: $("shopList"), shopCoins: $("shopCoins"),
  pauseScreen: $("pauseScreen"), btnResume: $("btnResume"), btnPauseHome: $("btnPauseHome"),
  btnStart: $("btnStart"), btnRetry: $("btnRetry"), btnHome: $("btnHome"),
  btnShop: $("btnShop"), btnShopBack: $("btnShopBack"),
  btnFullscreen: $("btnFullscreen"), btnSound: $("btnSound"),
  charRow: $("charRow"),
  metaCoins: $("metaCoins"), bestWave: $("bestWave"), bestCombo: $("bestCombo"),
  overWave: $("overWave"), overKills: $("overKills"), overTime: $("overTime"),
  overCombo: $("overCombo"), overLevel: $("overLevel"), overCoins: $("overCoins"),
  overTitle: $("overTitle"), overMsg: $("overMsg"),
  toast: $("toast"),
  joystick: $("joystick"), joyKnob: $("joyKnob"), joyZone: $("joyZone"),
  btnSkill1: $("btnSkill1"), btnSkill2: $("btnSkill2"),
  cd1: $("cd1"), cd2: $("cd2"),
  levelBadge: document.querySelector(".level-badge"),
  nodeHud: $("nodeHud"), nodeHudIco: $("nodeHudIco"), nodeHudName: $("nodeHudName"),
  nodeHudBuff: $("nodeHudBuff"), nodeHudFill: $("nodeHudFill"),
};

// ---------- Audio ----------
const AudioSys = {
  ctx: null,
  muted: false,
  init() {
    if (this.ctx) { this.resume(); return; }
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    this.resume();
  },
  resume() {
    try { if (this.ctx && this.ctx.state === "suspended") this.ctx.resume(); } catch (_) {}
  },
  beep(freq, dur = 0.06, type = "sine", vol = 0.04) {
    if (!this.ctx || this.muted) return;
    if (this.ctx.state === "suspended") this.ctx.resume();
    const t0 = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    o.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.5), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(this.ctx.destination);
    o.start(t0); o.stop(t0 + dur + 0.02);
  },
  hit() { this.beep(880, 0.04, "triangle", 0.028); },
  kill() { this.beep(520, 0.05, "square", 0.022); this.beep(320, 0.09, "triangle", 0.028); },
  crit() { this.beep(1200, 0.06, "square", 0.035); this.beep(600, 0.1, "triangle", 0.03); },
  hurt() { this.beep(140, 0.12, "sawtooth", 0.05); },
  level() {
    this.beep(440, 0.1, "sine", 0.04);
    setTimeout(() => this.beep(660, 0.12, "sine", 0.04), 80);
    setTimeout(() => this.beep(880, 0.16, "sine", 0.045), 160);
  },
  skill() { this.beep(300, 0.15, "sawtooth", 0.04); },
  boss() { this.beep(100, 0.4, "sawtooth", 0.06); setTimeout(() => this.beep(80, 0.5, "square", 0.05), 100); },
  buy() { this.beep(700, 0.08, "sine", 0.04); this.beep(980, 0.1, "sine", 0.03); },
};

// ---------- Utils ----------
const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const angleTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const RealmTitle = (lv) => lv >= 40 ? "化神" : lv >= 30 ? "元婴" : lv >= 20 ? "金丹" : lv >= 12 ? "筑基" : "炼气";

// ---------- Meta save ----------
const META_KEY = "xuantianjie_meta_v2";
const SHOP_DEFS = [
  { id: "atk", name: "锋锐灵纹", desc: "开局攻击 +6%/级", max: 10, base: 40, ico: "锐", tier: "cyan", apply: (s) => { s.atkMul += 0.06; } },
  { id: "hp", name: "厚土诀", desc: "开局生命 +8/级", max: 10, base: 35, ico: "体", tier: "green", apply: (s) => { s.hpBonus += 8; } },
  { id: "spd", name: "清风步", desc: "开局移速 +3%/级", max: 8, base: 45, ico: "疾", tier: "cyan", apply: (s) => { s.spdMul += 0.03; } },
  { id: "xp", name: "悟性", desc: "经验 +5%/级", max: 8, base: 50, ico: "悟", tier: "violet", apply: (s) => { s.xpMul += 0.05; } },
  { id: "coin", name: "聚灵玉", desc: "灵石获取 +8%/级", max: 5, base: 80, ico: "玉", tier: "gold", apply: (s) => { s.coinMul += 0.08; } },
  { id: "sword", name: "剑胚", desc: "开局飞剑更利", max: 5, base: 60, ico: "剑", tier: "cyan", apply: (s) => { s.swordBonus += 1; } },
  { id: "luck", name: "机缘", desc: "升级更易出稀有项", max: 5, base: 70, ico: "缘", tier: "gold", apply: (s) => { s.luck += 1; } },
];

const Meta = {
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(META_KEY)) || {};
      return {
        coins: d.coins || 0,
        bestWave: d.bestWave || 0,
        bestKills: d.bestKills || 0,
        bestTime: d.bestTime || 0,
        bestCombo: d.bestCombo || 0,
        shop: d.shop || {},
        selectedChar: d.selectedChar || "sword",
      };
    } catch (_) {
      return { coins: 0, bestWave: 0, bestKills: 0, bestTime: 0, bestCombo: 0, shop: {}, selectedChar: "sword" };
    }
  },
  save(d) {
    try { localStorage.setItem(META_KEY, JSON.stringify(d)); } catch (_) {}
  },
  shopLevel(id) { return this.load().shop[id] || 0; },
  shopCost(def) {
    const lv = this.shopLevel(def.id);
    return Math.floor(def.base * Math.pow(1.55, lv));
  },
  buy(id) {
    const def = SHOP_DEFS.find((s) => s.id === id);
    if (!def) return { ok: false, msg: "无效" };
    const d = this.load();
    const lv = d.shop[id] || 0;
    if (lv >= def.max) return { ok: false, msg: "已满级" };
    const cost = Math.floor(def.base * Math.pow(1.55, lv));
    if (d.coins < cost) return { ok: false, msg: "灵石不足" };
    d.coins -= cost;
    d.shop[id] = lv + 1;
    this.save(d);
    return { ok: true, msg: `${def.name} Lv${lv + 1}` };
  },
  statsFromShop() {
    const d = this.load();
    const s = { atkMul: 0, hpBonus: 0, spdMul: 0, xpMul: 0, coinMul: 0, swordBonus: 0, luck: 0 };
    for (const def of SHOP_DEFS) {
      const lv = d.shop[def.id] || 0;
      for (let i = 0; i < lv; i++) def.apply(s);
    }
    return s;
  },
  endRun(wave, kills, time, comboPeak, coinsEarned) {
    const d = this.load();
    d.bestWave = Math.max(d.bestWave, wave);
    d.bestKills = Math.max(d.bestKills, kills);
    d.bestTime = Math.max(d.bestTime, Math.floor(time));
    d.bestCombo = Math.max(d.bestCombo, comboPeak);
    d.coins += coinsEarned;
    this.save(d);
    return d;
  },
};

// ---------- Characters ----------
const CHARS = {
  sword: { id: "sword", name: "剑修", icon: "剑", desc: "飞剑+1 攻+25% 体稍弱", portrait: "assets/char-sword.png" },
  mage: { id: "mage", name: "法修", icon: "法", desc: "灵力充沛 技能冷却-20%", portrait: "assets/char-mage.png" },
  body: { id: "body", name: "体修", icon: "体", desc: "气血厚 受击反伤 移速稍慢", portrait: "assets/char-body.png" },
};

// ---------- 设备识别 & 画质自适应 ----------
const isTouch = ("ontouchstart" in window) || (navigator.maxTouchPoints || 0) > 0;
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1);

const Quality = {
  level: "high",           // high | mid | low
  fps: 60,
  _acc: 0, _n: 0, _cool: 0, _good: 0, _bad: 0,
  dprCap() { return this.level === "high" ? 2 : this.level === "mid" ? 1.5 : 1.1; },
  fogCount() { return this.level === "high" ? 6 : this.level === "mid" ? 4 : 2; },
  particleMul() { return this.level === "high" ? 1 : this.level === "mid" ? 0.68 : 0.45; },
  detect() {
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    // 低端机开局即降档，避免第一波就掉帧
    if (mem <= 2 || cores <= 2) this.level = "low";
    else if (mem <= 4 || cores <= 4) this.level = "mid";
    else if (isTouch && Math.min(window.screen.width, window.screen.height) * (window.devicePixelRatio || 1) > 1400) this.level = "mid";
    this.apply();
  },
  apply() {
    if (ui.app) ui.app.classList.toggle("perf-low", this.level === "low");
    if (this.level === "low") shadowOff();
  },
  sample(dt) {
    if (dt <= 0 || dt > 0.2) return;
    this._acc += dt; this._n++;
    if (this._acc < 1.5) return;
    this.fps = this._n / this._acc;
    this._acc = 0; this._n = 0;
    if (this._cool > 0) { this._cool -= 1; return; }
    if (this.fps < 42) {
      this._bad += 1; this._good = 0;
    } else if (this.fps > 57) {
      this._good += 1; this._bad = 0;
    } else { this._bad = 0; this._good = 0; }
    if (this._bad >= 2 && this.level === "high") { this.level = "mid"; this._bad = 0; this._cool = 3; this.apply(); resize(); }
    else if (this._bad >= 2 && this.level === "mid") { this.level = "low"; this._bad = 0; this._cool = 4; this.apply(); resize(); }
    else if (this._good >= 4 && this.level === "mid") { this.level = "high"; this._good = 0; this._cool = 4; this.apply(); resize(); }
  },
};

// 低端机彻底关掉 shadowBlur（Canvas2D 上最耗的性能杀手）
let _shadowOff = false;
function shadowOff() {
  if (_shadowOff) return;
  _shadowOff = true;
  try {
    Object.defineProperty(ctx, "shadowBlur", { get: () => 0, set: () => {}, configurable: true });
  } catch (_) {}
}

// ---------- Viewport ----------
const view = { w: 0, h: 0, dpr: 1 };
let _resizeT = 0;
function resize() {
  const rect = ui.app ? ui.app.getBoundingClientRect() : null;
  let w = rect && rect.width ? Math.round(rect.width) : window.innerWidth;
  let h = rect && rect.height ? Math.round(rect.height) : window.innerHeight;
  if (w < 1 || h < 1) { w = window.innerWidth; h = window.innerHeight; }
  view.w = w; view.h = h;
  view.dpr = Math.min(window.devicePixelRatio || 1, Quality.dprCap());
  canvas.width = Math.max(1, Math.floor(view.w * view.dpr));
  canvas.height = Math.max(1, Math.floor(view.h * view.dpr));
  canvas.style.width = view.w + "px";
  canvas.style.height = view.h + "px";
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  bgGrad = null;          // 背景渐变按屏幕尺寸缓存，尺寸变化时失效
  dockJoystick();
}
function scheduleResize() {
  clearTimeout(_resizeT);
  _resizeT = setTimeout(resize, 120);
}
window.addEventListener("resize", scheduleResize);
window.addEventListener("orientationchange", () => setTimeout(resize, 300));
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", scheduleResize);
  window.visualViewport.addEventListener("scroll", scheduleResize);
}

// ---------- Input ----------
const input = {
  mx: 0, my: 0,
  joyActive: false, joyId: null,
  cx: 0, cy: 0, max: 48, dead: 12,
  keys: Object.create(null),
};

function joyRadius() {
  const r = ui.joystick ? ui.joystick.offsetWidth / 2 : 62;
  return r > 20 ? r : 62;
}

// 把摇杆中心放到 (cx, cy)，并夹在屏幕内
function setJoyCenter(cx, cy) {
  const r = joyRadius();
  const margin = r + 6;
  const x = clamp(cx, margin, Math.max(margin, view.w - margin));
  const y = clamp(cy, margin, Math.max(margin, view.h - margin));
  ui.joystick.style.transform = `translate(${Math.round(x - r)}px, ${Math.round(y - r)}px)`;
  input.cx = x; input.cy = y;
  input.max = r * 0.78;
  input.dead = Math.max(6, r * 0.13);
}

// 默认停靠左下角（带安全区）
function dockJoystick() {
  if (input.joyActive) return;
  const r = joyRadius();
  const m = r + 6;
  setJoyCenter(m + 12, view.h - m - 12);
  ui.joystick.classList.add("idle");
  ui.joystick.classList.remove("active");
  ui.joyKnob.style.transform = "translate(0px, 0px)";
  input.mx = 0; input.my = 0;
}

function releaseJoystick() {
  input.joyActive = false;
  input.joyId = null;
  input.mx = 0; input.my = 0;
  ui.joyKnob.style.transform = "translate(0px, 0px)";
  dockJoystick();
}

function bindJoystick() {
  const zone = ui.joyZone || ui.joystick;
  if (!zone) return;

  const down = (e) => {
    if (G.state !== "play") return;
    if (input.joyActive) return;                 // 已有手指在控制移动，忽略后续手指
    if (e.isPrimary === false) return;
    e.preventDefault();
    AudioSys.init();                             // iOS 需要用户手势解锁音频
    input.joyActive = true;
    input.joyId = e.pointerId;
    ui.joystick.classList.remove("idle");
    ui.joystick.classList.add("active");
    setJoyCenter(e.clientX, e.clientY);
    updateJoy(e.clientX, e.clientY);
    try { zone.setPointerCapture(e.pointerId); } catch (_) {}
  };
  const move = (e) => {
    if (!input.joyActive || input.joyId !== e.pointerId) return;
    e.preventDefault();
    updateJoy(e.clientX, e.clientY);
  };
  const up = (e) => {
    if (!input.joyId || input.joyId !== e.pointerId) return;
    releaseJoystick();
  };

  if (window.PointerEvent) {
    zone.addEventListener("pointerdown", down);
    zone.addEventListener("pointermove", move);
    zone.addEventListener("pointerup", up);
    zone.addEventListener("pointercancel", up);
    zone.addEventListener("lostpointercapture", up);
  } else {
    // 兜底：老式 touch 事件
    zone.addEventListener("touchstart", (e) => {
      const t = e.changedTouches[0];
      down({ clientX: t.clientX, clientY: t.clientY, pointerId: t.identifier, preventDefault: () => e.preventDefault() });
    }, { passive: false });
    zone.addEventListener("touchmove", (e) => {
      const t = [...e.changedTouches].find((x) => x.identifier === input.joyId);
      if (t) move({ clientX: t.clientX, clientY: t.clientY, pointerId: t.identifier, preventDefault: () => e.preventDefault() });
    }, { passive: false });
    zone.addEventListener("touchend", up, { passive: false });
    zone.addEventListener("touchcancel", up, { passive: false });
  }

  // 指针从摇杆区域滑出/被系统打断时兜底释放
  window.addEventListener("blur", releaseJoystick);
}
function updateJoy(x, y) {
  const dx = x - input.cx, dy = y - input.cy;
  const max = input.max || 48;
  const d = Math.hypot(dx, dy) || 1;
  const nx = (dx / d) * Math.min(d, max);
  const ny = (dy / d) * Math.min(d, max);
  ui.joyKnob.style.transform = `translate(${nx.toFixed(1)}px, ${ny.toFixed(1)}px)`;
  const dead = input.dead || 12;
  if (d < dead) { input.mx = 0; input.my = 0; }
  else {
    const mag = clamp((d - dead) / (max - dead), 0, 1);
    input.mx = (dx / d) * mag;
    input.my = (dy / d) * mag;
  }
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  input.keys[k] = true;
  if (k === "1" || k === "q") castSkill(0);
  if (k === "2" || k === "w") castSkill(1);
  if (k === "escape" || k === "p") togglePause();
  if (k === "f") toggleFullscreen();
  if (k === " " || k.startsWith("arrow")) e.preventDefault();
});
window.addEventListener("keyup", (e) => { input.keys[e.key.toLowerCase()] = false; });
function readMove() {
  let x = input.mx, y = input.my;
  if (input.keys["a"] || input.keys["arrowleft"]) x -= 1;
  if (input.keys["d"] || input.keys["arrowright"]) x += 1;
  if (input.keys["w"] || input.keys["arrowup"]) y -= 1;
  if (input.keys["s"] || input.keys["arrowdown"]) y += 1;
  const d = Math.hypot(x, y);
  if (d > 1) { x /= d; y /= d; }
  return { x, y };
}

// ---------- 剑阵守卫（Sword Formation Nodes） ----------
// 站入剑阵 → 充能 → 阵成；站在阵中获得增益 + 阵法自动袭敌；
// 离开后阵法「余威」维持数秒，逼迫玩家在「走位安全」与「守阵收益」之间取舍。
const NODE_R = 78;
const NODE_CHARGE_TIME = 1.1;   // 站入后充满所需秒数
const NODE_HOLD = 5.0;          // 离阵后余威维持秒数
const NODE_LAYOUT = [
  { x: 260, y: -260 },
  { x: 260, y: 260 },
  { x: -260, y: 260 },
  { x: -260, y: -260 },
];
const NODE_DEFS = [
  { id: "fire",    name: "烈焰剑阵", ico: "焰", color: "#fb923c", rgb: "251,146,60",  buff: "攻击 +25%", effect: "阵内妖物持续燃烧" },
  { id: "frost",   name: "玄冰剑阵", ico: "冰", color: "#7dd3fc", rgb: "125,211,252", buff: "受击 -20%",  effect: "阵内妖物大幅减速" },
  { id: "thunder", name: "天雷剑阵", ico: "雷", color: "#c084fc", rgb: "192,132,252", buff: "移速 +18%",   effect: "阵内周期落雷" },
  { id: "spirit",  name: "聚灵剑阵", ico: "灵", color: "#86efac", rgb: "134,239,172", buff: "经验 +35%",   effect: "阵内持续回血回灵" },
];

function initNodes() {
  G.nodes = NODE_DEFS.map((def, i) => ({
    id: def.id, def,
    x: NODE_LAYOUT[i].x, y: NODE_LAYOUT[i].y,
    r: NODE_R, charge: 0, active: false, holdT: 0,
    strikeCD: 0, burnCD: 0, glow: 0,
  }));
  G.nodeInside = null; G.nodeActive = false; G.nodeHoldT = 0;
  G.nodeAtkMul = 1; G.nodeXpMul = 1; G.nodeDmgTakenMul = 1; G.nodeMoveMul = 1;
}

function applyNodeAura(n, dt, standing) {
  if (n.id === "fire") {
    n.burnCD -= dt;
    if (n.burnCD > 0) return;
    n.burnCD = 0.5;
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (dist(e.x, e.y, n.x, n.y) > n.r) continue;
      e.burn = Math.max(e.burn || 0, 1.4);
      e.burnDmg = Math.max(e.burnDmg || 0, 4 + G.wave * 1.0);
    }
  } else if (n.id === "frost") {
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (dist(e.x, e.y, n.x, n.y) > n.r) continue;
      e.slow = Math.max(e.slow || 0, 0.45);
      e.slowMul = 0.45;
    }
  } else if (n.id === "thunder") {
    n.strikeCD -= dt;
    if (n.strikeCD > 0) return;
    n.strikeCD = 1.0;
    let target = null, best = 1e9;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(e.x, e.y, n.x, n.y);
      if (d < n.r + 50 && d < best) { best = d; target = e; }
    }
    if (!target) return;
    G.particles.push({
      x: target.x, y: target.y, vx: 0, vy: 0, life: 0.22, max: 0.22,
      color: "#c084fc", size: 5, ring: { r0: 4, r1: 36 },
    });
    burst(target.x, target.y, "#c084fc", 8, 170, 3);
    applyHit(target, G.atk * 1.7 * playerDamageMult());
    AudioSys.hit();
  } else if (n.id === "spirit") {
    if (standing) {
      G.hp = Math.min(G.hpMax, G.hp + 3.5 * dt);
      G.mp = Math.min(G.mpMax, G.mp + 5 * dt);
    }
  }
}

function updateNodes(dt) {
  let insideId = null;
  for (const n of G.nodes) {
    const inside = dist(G.px, G.py, n.x, n.y) < n.r + G.pr * 0.3;
    if (inside) {
      n.charge = Math.min(1, n.charge + dt / NODE_CHARGE_TIME);
      if (n.charge >= 1) {
        if (!n.active) {
          n.active = true; n.glow = 1;
          toast(`${n.def.name} · 阵成`, "cyan");
          AudioSys.level();
          burst(n.x, n.y, n.def.color, 20, 200, 4);
          G.particles.push({
            x: n.x, y: n.y, vx: 0, vy: 0, life: 0.5, max: 0.5,
            color: n.def.color, size: 4, ring: { r0: 8, r1: n.r + 24 },
          });
        }
        n.holdT = NODE_HOLD + (G.nodeHoldBonus || 0);
        insideId = n.id;
      }
    } else if (n.active) {
      n.holdT -= dt;
      if (n.holdT <= 0) { n.active = false; n.charge = 0; n.holdT = 0; }
    } else if (n.charge > 0) {
      n.charge = Math.max(0, n.charge - dt * 0.6);
    }

    if (n.glow > 0) n.glow = Math.max(0, n.glow - dt * 1.8);
    if (n.active) applyNodeAura(n, dt, insideId === n.id);
  }

  // 玩家增益只在自己站在「已激活」的阵上时才生效
  let atkMul = 1, xpMul = 1, dmgMul = 1, moveMul = 1;
  if (insideId) {
    const n = G.nodes.find((x) => x.id === insideId);
    if (n && n.active) {
      if (n.id === "fire") atkMul = 1.25;
      else if (n.id === "frost") dmgMul = 0.8;
      else if (n.id === "thunder") moveMul = 1.18;
      else if (n.id === "spirit") xpMul = 1.35;
      G.nodeHoldT = n.holdT;
    }
  }
  G.nodeInside = insideId;
  G.nodeActive = !!insideId;
  G.nodeAtkMul = atkMul;
  G.nodeXpMul = xpMul;
  G.nodeDmgTakenMul = dmgMul;
  G.nodeMoveMul = moveMul;
}

function drawNodes(camX, camY) {
  if (!G.nodes || !G.nodes.length) return;
  const t = G.time || 0;
  for (const n of G.nodes) {
    const sx = n.x - camX + view.w / 2;
    const sy = n.y - camY + view.h / 2;
    const R = n.r;
    if (sx < -R - 90 || sy < -R - 90 || sx > view.w + R + 90 || sy > view.h + R + 90) continue;
    const on = n.active;
    ctx.save();
    ctx.translate(sx, sy);

    const glowR = R + 16 + (on ? 10 + Math.sin(t * 3 + n.x) * 6 : 0) + n.glow * 30;
    const g = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, glowR);
    g.addColorStop(0, `rgba(${n.def.rgb},${on ? 0.26 : 0.07 + n.charge * 0.1})`);
    g.addColorStop(0.72, `rgba(${n.def.rgb},${on ? 0.12 : 0.03})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, glowR, 0, TAU); ctx.fill();

    ctx.strokeStyle = `rgba(${n.def.rgb},${on ? 0.95 : 0.4})`;
    ctx.lineWidth = on ? 3 : 2;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();

    if (on) {
      ctx.save();
      ctx.rotate(t * 0.55);
      ctx.setLineDash([10, 14]);
      ctx.strokeStyle = `rgba(${n.def.rgb},0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, R - 11, 0, TAU); ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
      const pr = R * (0.5 + 0.09 * Math.sin(t * 3.2));
      ctx.strokeStyle = `rgba(${n.def.rgb},0.3)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, pr, 0, TAU); ctx.stroke();
    }

    if (!on && n.charge > 0.01) {
      ctx.strokeStyle = `rgba(${n.def.rgb},0.95)`;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, R + 7, -Math.PI / 2, -Math.PI / 2 + TAU * n.charge);
      ctx.stroke();
      ctx.lineCap = "butt";
    }

    ctx.globalAlpha = on ? 1 : 0.45 + n.charge * 0.35;
    ctx.fillStyle = n.def.color;
    ctx.font = `bold ${Math.round(R * 0.4)}px "STKaiti","KaiTi",serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(n.def.ico, 0, 3);

    if (on) {
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = "#e8e6d9";
      ctx.font = 'bold 12px system-ui,"Microsoft YaHei",sans-serif';
      ctx.fillText(n.def.name, 0, -R - 15);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

// ---------- Game state ----------
const G = {
  state: "menu",
  hitStop: 0,
  time: 0, wave: 0, kills: 0, waveTimer: 0, waveInterval: 25,
  spawnQueue: [], _trickle: 0,
  px: 0, py: 0, pr: 16,
  hp: 100, hpMax: 100, mp: 50, mpMax: 50, mpRegen: 2.5,
  level: 1, xp: 0, xpNeed: 20,
  atk: 12, atkSpeed: 1.1, moveSpeed: 170,
  crit: 0.08, critMul: 1.8, lifesteal: 0,
  swordCount: 1, swordOrbit: 52, swordSize: 10, swordPierce: 0,
  aoeAngle: 1.1, aoeDamageMul: 1.4, aoeRange: 110,
  dashSpeedMul: 2.1, dashTime: 0.35, dashCD: 5, dashCDLeft: 0, dashIFrame: 0,
  shield: 0, shieldMax: 0, xpMul: 1, lowHpBonus: 0, chain: 0,
  thorns: 0, aoeCD: 4, aoeCDLeft: 0,
  swordTimer: 0, swordPhase: 0, invuln: 0, flash: 0, shake: 0,
  enemies: [], projectiles: [], particles: [], floaters: [], pickups: [],
  bossBanner: 0, arenaR: 1400, slash: null, pendingLevel: 0,
  // combo
  combo: 0, comboTimer: 0, comboPeak: 0, comboMul: 1,
  // weapons
  weapons: {
    sword: { lv: 1, evo: false },
    orbit: { lv: 1, evo: false },
    fire: { lv: 0, evo: false, timer: 0 },
    lightning: { lv: 0, evo: false, timer: 0 },
    frost: { lv: 0, evo: false, timer: 0 },
    array: { lv: 0, evo: false, timer: 0 },
  },
  charId: "sword",
  coinsRun: 0,
  // 剑阵
  nodes: [], nodeInside: null, nodeActive: false, nodeHoldT: 0, nodeBonus: 0,
  nodeAtkMul: 1, nodeXpMul: 1, nodeDmgTakenMul: 1, nodeMoveMul: 1,
  nodeHoldBonus: 0, dmgTakenMul: 1,
  // 转职（3 系 × 3 分支）
  jobStage: 0, jobPath: null, jobBranches: {},
};

function resetRun(charId) {
  const shop = Meta.statsFromShop();
  G.charId = charId || Meta.load().selectedChar || "sword";
  G.hitStop = 0;
  G.time = 0; G.wave = 0; G.kills = 0; G.waveTimer = 3;
  G.spawnQueue = []; G._trickle = 0;
  G.px = 0; G.py = 0;
  G.hpMax = 100 + shop.hpBonus;
  G.hp = G.hpMax;
  G.mpMax = 50; G.mp = 50; G.mpRegen = 2.5;
  G.level = 1; G.xp = 0; G.xpNeed = 20;
  G.atk = 12 * (1 + shop.atkMul);
  G.atkSpeed = 1.1;
  G.moveSpeed = 170 * (1 + shop.spdMul);
  G.crit = 0.08; G.critMul = 1.8; G.lifesteal = 0;
  G.swordCount = 1 + Math.floor(shop.swordBonus / 2);
  G.swordOrbit = 52; G.swordSize = 10; G.swordPierce = 0;
  G.aoeAngle = 1.1; G.aoeDamageMul = 1.4; G.aoeRange = 110;
  G.dashSpeedMul = 2.1; G.dashTime = 0.35; G.dashCD = 5;
  G.dashCDLeft = 0; G.dashIFrame = 0;
  G.shield = 0; G.shieldMax = 0;
  G.xpMul = 1 + shop.xpMul;
  G.lowHpBonus = 0; G.chain = 0; G.thorns = 0;
  G.aoeCD = 4; G.aoeCDLeft = 0;
  G.swordTimer = 0; G.swordPhase = 0; G.invuln = 0; G.flash = 0; G.shake = 0; G.goldFlash = 0;
  G.enemies = []; G.projectiles = []; G.particles = []; G.floaters = []; G.pickups = [];
  G.bossBanner = 0; G.arenaR = 1400; G.slash = null; G.pendingLevel = 0;
  G.waveBanner = 0; G.waveBannerText = "";
  G.trail = [];
  G.playerHurt = 0;
  G.shieldHit = 0;
  G.combo = 0; G.comboTimer = 0; G.comboPeak = 0; G.comboMul = 1;
  G.coinsRun = 0;
  G.nodeBonus = 0;
  G.nodeHoldBonus = 0;
  G.dmgTakenMul = 1;
  G.jobStage = 0; G.jobPath = null; G.jobBranches = {};
  initNodes();
  G.weapons = {
    sword: { lv: 1, evo: false },
    orbit: { lv: 1, evo: false },
    fire: { lv: 0, evo: false, timer: 0 },
    lightning: { lv: 0, evo: false, timer: 0 },
    frost: { lv: 0, evo: false, timer: 0 },
    array: { lv: 0, evo: false, timer: 0 },
  };
  // character kits
  if (G.charId === "sword") {
    G.atk *= 1.25;
    G.swordCount += 1;
    G.hpMax = Math.floor(G.hpMax * 0.9);
    G.hp = G.hpMax;
  } else if (G.charId === "mage") {
    G.mpMax += 30; G.mp = G.mpMax; G.mpRegen = 3.5;
    G.aoeCD *= 0.8; G.dashCD *= 0.8;
    G.atk *= 0.9;
  } else if (G.charId === "body") {
    G.hpMax = Math.floor(G.hpMax * 1.4); G.hp = G.hpMax;
    G.thorns = 0.08;
    G.moveSpeed *= 0.95;
  }
  G._shopLuck = shop.luck;
  G._shopCoin = shop.coinMul;
}

// ---------- Upgrades ----------
const UPGRADE_ICO = {
  atk: "攻", atk2: "剑", spd: "疾", as: "速", hp: "体", mp: "灵",
  swords: "分", orbit: "域", pierce: "破", crit: "暴", critd: "诛",
  ls: "噬", aoe: "气", aoe2: "扇", cd: "风", shield: "甲", xp: "丹",
  low: "血", chain: "雷", size: "巨", thorn: "棘",
  fire: "火", lightning: "电", frost: "冰", array: "阵", sword: "飞", orbitw: "环",
  e_fire: "燎", e_lightning: "霆", e_frost: "封", e_array: "归",
  e_sword: "光", e_orbit: "罡",
  nodeR: "阵", nodeP: "心",
};

function buildUpgradePool() {
  const w = G.weapons;
  const withIco = (o) => ({ ...o, ico: UPGRADE_ICO[o.id] || "道" });
  const pool = [
    { id: "atk", name: "灵力灌注", desc: "攻击 +20%", tag: "输出", rare: false, apply: () => { G.atk *= 1.2; } },
    { id: "atk2", name: "剑意淬炼", desc: "攻击 +15%", tag: "输出", rare: false, apply: () => { G.atk *= 1.15; } },
    { id: "spd", name: "疾风步", desc: "移速 +12%", tag: "身法", rare: false, apply: () => { G.moveSpeed *= 1.12; } },
    { id: "as", name: "剑心如电", desc: "飞剑攻速 +18%", tag: "输出", rare: false, apply: () => { G.atkSpeed *= 1.18; } },
    { id: "hp", name: "炼体", desc: "气血上限 +30，并回满", tag: "生存", rare: false, apply: () => { G.hpMax += 30; G.hp = G.hpMax; } },
    { id: "mp", name: "聚灵", desc: "灵力上限 +20，回复 +1", tag: "续航", rare: false, apply: () => { G.mpMax += 20; G.mp = G.mpMax; G.mpRegen += 1; } },
    { id: "swords", name: "御剑分光", desc: "环绕飞剑 +1", tag: "飞剑", rare: true, apply: () => { G.swordCount += 1; G.arenaR += 40; } },
    { id: "orbit", name: "剑域扩张", desc: "环绕半径 +18", tag: "飞剑", rare: false, apply: () => { G.swordOrbit += 18; } },
    { id: "pierce", name: "破甲剑意", desc: "飞剑穿透 +1", tag: "飞剑", rare: true, apply: () => { G.swordPierce += 1; } },
    { id: "crit", name: "血煞", desc: "暴击率 +10%", tag: "爆发", rare: false, apply: () => { G.crit = Math.min(0.7, G.crit + 0.1); } },
    { id: "critd", name: "诛心", desc: "暴击伤害 +30%", tag: "爆发", rare: true, apply: () => { G.critMul += 0.3; } },
    { id: "ls", name: "噬灵", desc: "击杀吸血 +2", tag: "续航", rare: false, apply: () => { G.lifesteal += 2; } },
    { id: "aoe", name: "剑气纵横·极", desc: "剑气伤害 +30%，范围 +20%", tag: "剑气", rare: false, apply: () => { G.aoeDamageMul *= 1.3; G.aoeRange *= 1.2; } },
    { id: "aoe2", name: "扇形天罗", desc: "剑气扇形角 +25%", tag: "剑气", rare: false, apply: () => { G.aoeAngle *= 1.25; } },
    { id: "cd", name: "御风诀", desc: "主动技能冷却 -15%", tag: "身法", rare: false, apply: () => { G.aoeCD *= 0.85; G.dashCD *= 0.85; } },
    { id: "shield", name: "玄武甲", desc: "获得 40 点护盾，上限 +20", tag: "生存", rare: true, apply: () => { G.shieldMax += 20; G.shield += 40; } },
    { id: "xp", name: "妖丹纳灵", desc: "经验获取 +25%", tag: "成长", rare: false, apply: () => { G.xpMul *= 1.25; } },
    { id: "low", name: "血祭", desc: "气血低于40%时伤害 +35%", tag: "爆发", rare: true, apply: () => { G.lowHpBonus += 0.35; } },
    { id: "chain", name: "紫电青霜", desc: "飞剑命中有 15% 弹射", tag: "飞剑", rare: true, apply: () => { G.chain += 0.15; } },
    { id: "size", name: "巨剑真形", desc: "飞剑体积 +20%，伤害 +10%", tag: "飞剑", rare: false, apply: () => { G.swordSize *= 1.2; G.atk *= 1.1; } },
    { id: "thorn", name: "荆棘罡气", desc: "反伤 +10%", tag: "生存", rare: true, apply: () => { G.thorns += 0.1; } },
    { id: "nodeR", name: "阵纹扩张", desc: "剑阵范围 +15%", tag: "剑阵", rare: false, apply: () => { for (const n of G.nodes) n.r *= 1.15; } },
    { id: "nodeP", name: "阵心通明", desc: "站在剑阵中伤害 +18%", tag: "剑阵", rare: true, apply: () => { G.nodeBonus = (G.nodeBonus || 0) + 0.18; } },
  ].map(withIco);

  // weapon level ups
  const wepUp = (key, name, tag, desc) => ({
    id: "w_" + key, name, tag, desc, rare: false,
    ico: UPGRADE_ICO["w_" + key] || UPGRADE_ICO[key] || "升",
    apply: () => { G.weapons[key].lv = Math.min(5, G.weapons[key].lv + 1); },
    can: () => G.weapons[key].lv > 0 && G.weapons[key].lv < 5,
  });
  const wepUnlock = (key, name, tag, desc) => ({
    id: "u_" + key, name, tag, desc, rare: true,
    ico: UPGRADE_ICO["u_" + key] || UPGRADE_ICO[key] || "解",
    apply: () => { G.weapons[key].lv = 1; },
    can: () => G.weapons[key].lv === 0,
  });
  const wepEvo = (key, name, tag, desc) => ({
    id: "e_" + key, name: name + "·觉醒", tag: tag, desc, rare: true,
    ico: UPGRADE_ICO["e_" + key] || UPGRADE_ICO[key] || "觉",
    apply: () => { G.weapons[key].evo = true; },
    can: () => G.weapons[key].lv >= 5 && !G.weapons[key].evo,
  });

  pool.push(wepUnlock("fire", "业火球", "法术", "解锁业火球：命中燃烧"));
  pool.push(wepUp("fire", "业火精炼", "法术", "业火球伤害/射速提升"));
  pool.push(wepEvo("fire", "业火燎原", "法术", "业火球范围扩大，燃烧更烈"));

  pool.push(wepUnlock("lightning", "紫电", "法术", "解锁紫电：命中弹射3目标"));
  pool.push(wepUp("lightning", "紫电强化", "法术", "紫电伤害与弹射提升"));
  pool.push(wepEvo("lightning", "九天雷法", "法术", "紫电弹射至5，伤害大增"));

  pool.push(wepUnlock("frost", "寒冰锥", "法术", "解锁冰锥：命中减速"));
  pool.push(wepUp("frost", "玄冰淬炼", "法术", "冰锥伤害与减速提升"));
  pool.push(wepEvo("frost", "千里冰封", "法术", "冰锥穿透并冻结精英"));

  pool.push(wepUnlock("array", "周天剑阵", "剑阵", "解锁剑阵：周期自身AOE"));
  pool.push(wepUp("array", "剑阵扩域", "剑阵", "剑阵半径与伤害提升"));
  pool.push(wepEvo("array", "万剑归宗", "剑阵", "剑阵连续脉冲三次"));

  // default weapons can level & evolve
  pool.push(wepUp("sword", "飞剑精炼", "飞剑", "飞剑伤害与速度提升"));
  pool.push(wepEvo("sword", "玄天剑光", "飞剑", "飞剑伤害大增并多穿透1"));
  pool.push(wepUp("orbit", "环剑精修", "飞剑", "环绕剑伤害提升"));
  pool.push(wepEvo("orbit", "剑罡环绕", "飞剑", "环绕剑伤害大幅提升"));

  // filter by can()
  return pool.filter((u) => !u.can || u.can());
}

function rollUpgrades() {
  let pool = buildUpgradePool();
  const luck = G._shopLuck || 0;
  if (luck > 0) {
    // bias rare: duplicate rare entries
    const weighted = [];
    for (const u of pool) {
      weighted.push(u);
      if (u.rare) for (let i = 0; i < luck; i++) weighted.push(u);
    }
    pool = weighted;
  }
  const picked = [];
  const ids = new Set();
  const shuffled = shuffle(pool);
  for (const u of shuffled) {
    if (ids.has(u.id)) continue;
    ids.add(u.id);
    picked.push(u);
    if (picked.length >= 3) break;
  }
  return picked;
}

// ---------- 转职（3 系 × 3 分支） ----------
// 设计意图：把「塔防的站位/流派决策」搬进幸存者。
// 境界到 5 / 10 / 15 时，本应出的升级三选一，改为一次转职抉择：
//   5 级「择道」→ 从 3 系里选一条道途
//   10 级「择法」→ 在本道 3 个法门里择一精修
//   15 级「精进」→ 再次择法（同法门可叠层至 Lv.2，也可改修他法）
const JOB_LEVELS = [5, 10, 15];

const JOB_PATHS = [
  {
    id: "sword", name: "剑道", ico: "剑", tagCls: "t-sword", color: "#7dd3fc",
    desc: "以飞剑为锋 · 走位即杀伐",
    branches: [
      { id: "sword_multi", name: "万剑归流", ico: "分", desc: "环绕飞剑 +2 · 剑域半径 +16",
        apply: () => { G.swordCount += 2; G.swordOrbit += 16; } },
      { id: "sword_pierce", name: "破锋无相", ico: "破", desc: "飞剑穿透 +2 · 暴击率 +12%",
        apply: () => { G.swordPierce += 2; G.crit = Math.min(0.7, G.crit + 0.12); } },
      { id: "sword_qi", name: "剑气冲霄", ico: "气", desc: "剑气伤害 +50% · 范围 +25% · 扇形角 +35%",
        apply: () => { G.aoeDamageMul *= 1.5; G.aoeRange *= 1.25; G.aoeAngle *= 1.35; } },
    ],
  },
  {
    id: "mage", name: "玄法", ico: "法", tagCls: "t-mp", color: "#c084fc",
    desc: "引术法之力 · 焚天封地",
    branches: [
      { id: "mage_fire", name: "业火焚天", ico: "火", desc: "业火球 +1 级 · 攻击 +15%",
        apply: () => { const w = G.weapons.fire; w.lv = w.lv === 0 ? 1 : Math.min(5, w.lv + 1); G.atk *= 1.15; } },
      { id: "mage_thunder", name: "九霄雷法", ico: "电", desc: "紫电 +1 级 · 飞剑攻速 +15%",
        apply: () => { const w = G.weapons.lightning; w.lv = w.lv === 0 ? 1 : Math.min(5, w.lv + 1); G.atkSpeed *= 1.15; } },
      { id: "mage_frost", name: "玄冰封天", ico: "冰", desc: "寒冰锥 +1 级 · 受击伤害 -12%",
        apply: () => { const w = G.weapons.frost; w.lv = w.lv === 0 ? 1 : Math.min(5, w.lv + 1); G.dmgTakenMul *= 0.88; } },
    ],
  },
  {
    id: "body", name: "体道", ico: "体", tagCls: "t-hp", color: "#86efac",
    desc: "以身为炉 · 守阵不破",
    branches: [
      { id: "body_blood", name: "血战不灭", ico: "血", desc: "气血上限 +80 并回复 · 残血伤害 +25%",
        apply: () => { G.hpMax += 80; G.hp = Math.min(G.hpMax, G.hp + 80); G.lowHpBonus += 0.25; } },
      { id: "body_thorn", name: "荆棘铁壁", ico: "棘", desc: "立即获得 60 护盾（上限 +40）· 反伤 +10%",
        apply: () => { G.shieldMax += 40; G.shield += 60; G.thorns += 0.10; } },
      { id: "body_formation", name: "守阵天君", ico: "阵", desc: "剑阵范围 +25% · 站阵伤害 +20% · 余威 +2s",
        apply: () => { for (const n of G.nodes) n.r *= 1.25; G.nodeBonus += 0.20; G.nodeHoldBonus += 2; } },
    ],
  },
];

const JOB_STAGES = [
  { title: "择道", sub: "三途择一 · 道途自此分野" },
  { title: "择法", sub: "于本道之内，择一法门精修" },
  { title: "精进", sub: "再进一步 · 已修法门可叠层" },
];

function jobStage() { return G.jobStage || 0; }

function jobPathOf(id) { return JOB_PATHS.find((p) => p.id === id) || null; }

// 到了转职节点吗？（境界 ≥ 该阶段门槛）
function shouldOfferJob() {
  const s = jobStage();
  return s < JOB_LEVELS.length && G.level >= JOB_LEVELS[s];
}

function jobSyncHud(flash) {
  if (!ui.jobHud) return;
  const p = jobPathOf(G.jobPath);
  if (!p || !G.jobStage) { ui.jobHud.classList.add("hidden"); return; }
  const parts = [];
  for (const b of p.branches) {
    const lv = G.jobBranches[b.id] || 0;
    if (lv > 0) parts.push(b.name + (lv > 1 ? "·Lv." + lv : ""));
  }
  ui.jobHudIco.textContent = p.ico;
  ui.jobHudIco.style.setProperty("--jc", p.color);
  ui.jobHudPath.textContent = p.name;
  ui.jobHudBranch.textContent = parts.join(" ＋ ") || "未择法门";
  ui.jobHud.classList.remove("hidden");
  if (flash) {
    ui.jobHud.classList.remove("flash");
    void ui.jobHud.offsetWidth;
    ui.jobHud.classList.add("flash");
  }
}

function openJobModal() {
  const stage = Math.min(jobStage(), JOB_LEVELS.length - 1);
  const info = JOB_STAGES[stage];
  G.state = "job";
  ui.jobTitle.textContent = info.title;
  ui.jobSub.textContent = info.sub;
  ui.jobChoices.innerHTML = "";

  const opts = [];
  if (stage === 0) {
    for (const p of JOB_PATHS) {
      const innate = p.id === G.charId;   // 与本命同源的道途，给个标识
      opts.push({
        ico: p.ico, cls: p.tagCls, rare: innate,
        tag: innate ? "本命 · 道途" : "道途",
        name: p.name, desc: p.desc,
        pick: () => { G.jobPath = p.id; return p.name; },
      });
    }
  } else {
    const p = jobPathOf(G.jobPath) || JOB_PATHS[0];
    if (!G.jobPath) G.jobPath = p.id;
    for (const b of p.branches) {
      const cur = G.jobBranches[b.id] || 0;
      opts.push({
        ico: b.ico, cls: p.tagCls, rare: cur > 0,
        tag: cur > 0 ? `已修 Lv.${cur}` : "法门",
        name: b.name,
        desc: cur > 0 ? b.desc + "（再次择取叠层）" : b.desc,
        pick: () => { G.jobBranches[b.id] = cur + 1; b.apply(); return p.name + " · " + b.name; },
      });
    }
  }

  burst(G.px, G.py, "#f0c14b", 24, 200, 4);
  G.particles.push({
    x: G.px, y: G.py, vx: 0, vy: 0,
    life: 0.55, max: 0.55, color: "#fde68a", size: 4,
    ring: { r0: 12, r1: 130 },
  });

  for (const o of opts) {
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (o.rare ? " rare" : "");
    btn.innerHTML = `
      <div class="choice-ico ${o.cls}">${o.ico}</div>
      <div class="choice-body">
        <span class="c-tag ${o.cls}">${o.tag}</span>
        <span class="c-name">${o.name}</span>
        <span class="c-desc">${o.desc}</span>
      </div>`;
    btn.addEventListener("click", () => {
      const label = o.pick();
      G.jobStage = stage + 1;
      jobSyncHud(true);
      AudioSys.level();
      toast(`转职 · ${label}`, "gold");
      G.goldFlash = 0.6;
      G.shake = Math.max(G.shake, 12);
      burst(G.px, G.py, "#fde68a", 34, 250, 5);
      ui.jobModal.classList.add("hidden");
      G.state = "play";
      refreshWeaponHint();
      if (G.pendingLevel && G.pendingLevel > 0) {
        G.pendingLevel -= 1;
        setTimeout(() => openLevelUp(), 50);
      }
    });
    ui.jobChoices.appendChild(btn);
  }
  ui.jobModal.classList.remove("hidden");
}

// ---------- Enemies ----------
const ENEMY_TYPES = {
  fox: { name: "野狐妖", r: 12, hp: 28, atk: 8, speed: 95, xp: 5, color: "#fb923c", shape: "fox" },
  wolf: { name: "妖狼", r: 13, hp: 40, atk: 11, speed: 120, xp: 7, color: "#a3e635", shape: "wolf" },
  golem: { name: "石傀儡", r: 18, hp: 95, atk: 14, speed: 55, xp: 12, color: "#94a3b8", shape: "golem" },
  ghost: { name: "幽魂", r: 11, hp: 22, atk: 9, speed: 105, xp: 6, color: "#a78bfa", shape: "ghost", splits: true },
  bat: { name: "血蝠", r: 10, hp: 18, atk: 7, speed: 145, xp: 4, color: "#f87171", shape: "bat" },
  eliteFox: { name: "赤焰狐将", r: 20, hp: 160, atk: 18, speed: 85, xp: 30, color: "#f472b6", shape: "fox", elite: true },
  eliteGolem: { name: "玄铁傀儡", r: 24, hp: 280, atk: 22, speed: 50, xp: 40, color: "#c084fc", shape: "golem", elite: true },
  bossFox: { name: "九尾妖王", r: 32, hp: 900, atk: 28, speed: 70, xp: 120, color: "#fbbf24", shape: "fox", boss: true, summon: true },
  bossGolem: { name: "山神傀儡", r: 36, hp: 1400, atk: 32, speed: 45, xp: 150, color: "#f59e0b", shape: "golem", boss: true, slam: true },
};
function enemyHP(base, wave) {
  return base * (1 + 0.18 * wave) * (1 + 0.02 * Math.pow(wave, 1.35));
}
function enemyATK(base, wave) { return base * (1 + 0.12 * wave); }

function spawnEnemy(typeId, x, y, wave) {
  const t = ENEMY_TYPES[typeId];
  const hp = enemyHP(t.hp, wave);
  const e = {
    id: Math.random().toString(36).slice(2),
    type: typeId, name: t.name, x, y, r: t.r,
    hp, hpMax: hp, atk: enemyATK(t.atk, wave),
    speed: t.speed * rand(0.9, 1.1), xp: t.xp, color: t.color, shape: t.shape,
    elite: !!t.elite, boss: !!t.boss, splits: !!t.splits, summon: !!t.summon, slam: !!t.slam,
    flash: 0, hitCD: 0, specialCD: rand(2, 4), phase: rand(0, TAU),
    burn: 0, burnDmg: 0, slow: 0, slowMul: 1, dead: false,
  };
  G.enemies.push(e);
  if (t.boss) {
    G.bossBanner = 2.2;
    AudioSys.boss();
    toast(`大妖降临 · ${t.name}`);
  }
  return e;
}
function spawnAtEdge(typeId, wave, minR = 0) {
  const ang = rand(0, TAU);
  const r = Math.max(view.w, view.h) * 0.62 + minR + rand(0, 80);
  return spawnEnemy(typeId, G.px + Math.cos(ang) * r, G.py + Math.sin(ang) * r, wave);
}

function buildWave(wave) {
  const q = [];
  const count = 3 + Math.floor(wave * 0.85);
  const pool = ["fox", "fox", "wolf"];
  if (wave >= 2) pool.push("bat", "bat");
  if (wave >= 3) pool.push("golem", "ghost");
  if (wave >= 5) pool.push("wolf", "ghost", "golem");
  for (let i = 0; i < count; i++) q.push({ type: pick(pool), delay: i * 0.12 + rand(0, 0.3) });
  if (wave >= 3 && wave % 3 === 0) {
    const n = 1 + Math.floor(wave / 12);
    for (let i = 0; i < n; i++) q.push({ type: wave % 6 === 0 ? "eliteGolem" : "eliteFox", delay: 1.2 + i * 0.5 });
  }
  if (wave % 5 === 0) q.push({ type: wave % 10 === 0 ? "bossGolem" : "bossFox", delay: 2.5 });
  return q;
}

function updateWaves(dt) {
  const trickleInterval = Math.max(0.8, 2.2 - G.wave * 0.04);
  G._trickle = (G._trickle || 0) + dt;
  if (G._trickle >= trickleInterval) {
    G._trickle = 0;
    if (G.enemies.length < 80) {
      const pool = ["fox", "bat"];
      if (G.wave >= 3) pool.push("wolf", "ghost");
      spawnAtEdge(pick(pool), G.wave);
    }
  }
  G.waveTimer -= dt;
  if (G.waveTimer <= 0) {
    G.wave += 1;
    G.waveTimer = G.waveInterval;
    G.spawnQueue = buildWave(G.wave);
    toast(`第 ${G.wave} 波 · 妖潮来袭`, G.wave % 5 === 0 ? "red" : "cyan");
    G.waveBanner = 1.4;
    G.waveBannerText = G.wave % 5 === 0 ? `第 ${G.wave} 波 · 大妖将至` : `第 ${G.wave} 波 · 妖潮`;
    if (G.wave % 5 === 0) AudioSys.boss();
  }
  if (G.spawnQueue.length) {
    for (const item of G.spawnQueue) item.delay -= dt;
    const ready = G.spawnQueue.filter((i) => i.delay <= 0);
    G.spawnQueue = G.spawnQueue.filter((i) => i.delay > 0);
    for (const item of ready) {
      if (G.enemies.length < 90) spawnAtEdge(item.type, G.wave);
    }
  }
}

// ---------- Combat ----------
function comboMul() {
  return 1 + Math.min(G.combo, 40) * 0.03;
}
function onKillCombo() {
  G.combo += 1;
  G.comboTimer = 2.2;
  G.comboPeak = Math.max(G.comboPeak, G.combo);
  if (G.combo === 10) toast("连杀 ×10", "gold");
  if (G.combo === 25) toast("连杀 ×25 · 妖胆俱裂", "gold");
  if (G.combo === 50) toast("连杀 ×50 · 剑心通明", "gold");
  if (G.combo % 10 === 0 && G.combo > 50) toast(`连杀 ×${G.combo}`, "gold");
  // floating combo tick near player when stacking
  if (G.combo >= 3 && G.combo % 2 === 0) {
    spawnFloater(G.px, G.py - 28, `连杀×${G.combo}`, G.combo >= 50 ? "#d9f99d" : G.combo >= 25 ? "#fde68a" : "#fda4af", 12);
  }
  ui.comboBadge.classList.remove("hidden", "hot", "legend");
  if (G.combo >= 50) ui.comboBadge.classList.add("legend");
  else if (G.combo >= 25) ui.comboBadge.classList.add("hot");
  ui.comboBadge.classList.remove("pulse");
  void ui.comboBadge.offsetWidth;
  ui.comboBadge.classList.add("pulse");
}
function hitStop(ms) {
  G.hitStop = Math.max(G.hitStop, ms / 1000);
}

function damagePlayer(amount) {
  if (G.dashIFrame > 0 || G.invuln > 0) return;
  amount *= (G.nodeDmgTakenMul || 1) * (G.dmgTakenMul || 1);   // 玄冰剑阵 / 转职：减伤
  if (G.shield > 0) {
    const abs = Math.min(G.shield, amount);
    G.shield -= abs;
    amount -= abs;
    G.shieldHit = 0.35;
    if (abs > 0) {
      G.particles.push({
        x: G.px, y: G.py, vx: 0, vy: 0, life: 0.3, max: 0.3,
        color: "#a3e635", size: 3, ring: { r0: G.pr + 8, r1: G.pr + 28 },
      });
    }
  }
  if (amount <= 0) return;
  G.hp -= amount;
  G.playerHurt = 0.18;
  G.flash = 0.15;
  G.shake = Math.min(10, G.shake + amount * 0.08);
  AudioSys.hurt();
  spawnFloater(G.px, G.py - G.pr - 8, `-${Math.round(amount)}`, "#f87171", 14);
  // thorns
  if (G.thorns > 0) {
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (dist(e.x, e.y, G.px, G.py) < e.r + G.pr + 8) {
        const t = amount * G.thorns;
        e.hp -= t;
        e.flash = 0.08;
        if (e.hp <= 0) killEnemy(e);
      }
    }
  }
  if (G.hp <= 0) { G.hp = 0; endRun(); }
}

function playerDamageMult() {
  let m = 1;
  if (G.hp < G.hpMax * 0.4) m += G.lowHpBonus;
  // 剑阵：站在阵上吃阵法增益，升级「阵心通明」再叠一层
  m *= (G.nodeAtkMul || 1);
  if (G.nodeActive) m *= (1 + (G.nodeBonus || 0));
  return m;
}

function spawnFloater(x, y, text, color, size, crit = false) {
  G.floaters.push({ x, y, text, color, size, life: 0.85, vy: -40, crit });
}

function burst(x, y, color, n = 8, speed = 120, size = 3) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU);
    const s = rand(speed * 0.4, speed);
    G.particles.push({
      x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: rand(0.25, 0.55), max: 0.55, color, size: rand(size * 0.6, size * 1.4),
    });
  }
}

function killEnemy(e, byPlayer = true) {
  if (e.dead) return;
  e.dead = true;
  G.kills += 1;
  onKillCombo();
  const xp = Math.round(e.xp * G.xpMul * comboMul() * (G.nodeXpMul || 1));
  gainXP(xp);
  if (G.lifesteal > 0) G.hp = Math.min(G.hpMax, G.hp + G.lifesteal);
  if (e.elite || e.boss) dropPickup(e.x, e.y, e.boss ? "boss" : "elite");
  else if (Math.random() < 0.04) dropPickup(e.x, e.y, "orb");
  burst(e.x, e.y, e.color, e.boss ? 28 : e.elite ? 16 : 8, e.boss ? 220 : 130, e.boss ? 5 : 3);
  if (e.elite || e.boss) {
    G.particles.push({
      x: e.x, y: e.y, vx: 0, vy: 0,
      life: e.boss ? 0.45 : 0.3, max: e.boss ? 0.45 : 0.3,
      color: e.boss ? "#fbbf24" : "#c084fc",
      size: 4, ring: { r0: e.r, r1: e.r + (e.boss ? 70 : 40) },
    });
    if (e.boss) {
      G.particles.push({
        x: e.x, y: e.y, vx: 0, vy: 0,
        life: 0.55, max: 0.55, color: "#fde68a",
        size: 5, ring: { r0: e.r * 0.5, r1: e.r + 110 },
      });
      G.goldFlash = Math.max(G.goldFlash || 0, 0.28);
      G.shake = Math.max(G.shake, 8);
    }
  }
  spawnFloater(e.x, e.y, `+${xp}`, "#a3e635", 12);
  AudioSys.kill();
  if (e.elite || e.boss) hitStop(e.boss ? 80 : 50);
  if (e.splits && e.r > 8 && G.enemies.filter((x) => !x.dead).length < 85) {
    for (let i = 0; i < 2; i++) {
      const ang = rand(0, TAU);
      const child = spawnEnemy("ghost", e.x + Math.cos(ang) * 10, e.y + Math.sin(ang) * 10, Math.max(0, G.wave - 2));
      child.r = e.r * 0.65;
      child.hp = child.hpMax = e.hpMax * 0.35;
      child.xp = Math.round(e.xp * 0.3);
      child.splits = false;
    }
  }
}

function gainXP(amount) {
  G.xp += amount;
  let shouldOpen = false;
  while (G.xp >= G.xpNeed) {
    G.xp -= G.xpNeed;
    G.level += 1;
    G.xpNeed = Math.floor(20 * Math.pow(1.18, G.level - 1));
    if (G.state === "play" && !shouldOpen) {
      shouldOpen = true;
    } else {
      G.pendingLevel = (G.pendingLevel || 0) + 1;
    }
  }
  if (shouldOpen) openLevelUp();
}

function dropPickup(x, y, kind) {
  G.pickups.push({ x, y, kind, r: kind === "boss" ? 14 : 10, life: 20, bob: rand(0, TAU) });
}

function collectPickup(p) {
  if (p.kind === "orb") {
    G.hp = Math.min(G.hpMax, G.hp + 12);
    G.mp = Math.min(G.mpMax, G.mp + 12);
    spawnFloater(p.x, p.y, "灵息", "#5ce1e6", 12);
    AudioSys.hit();
  } else if (p.kind === "elite") {
    pick([
      () => { G.atk *= 1.08; },
      () => { G.hpMax += 10; G.hp = Math.min(G.hpMax, G.hp + 10); },
      () => { G.shield += 15; },
      () => { G.moveSpeed *= 1.05; },
    ])();
    toast("精英精魄入体 · 道行微进");
    burst(p.x, p.y, "#c084fc", 14, 160, 4);
    AudioSys.level();
  } else if (p.kind === "boss") {
    G.hp = G.hpMax; G.mp = G.mpMax; G.shield += 30; G.atk *= 1.1;
    toast("斩灭大妖 · 气血回满，攻击大涨");
    burst(p.x, p.y, "#fbbf24", 30, 220, 5);
    AudioSys.level();
    if (G.state === "play") openLevelUp();
  }
}

function applyHit(e, dmg, opts = {}) {
  if (e.dead) return;
  let d = dmg;
  const isCrit = Math.random() < G.crit;
  if (isCrit) {
    d *= G.critMul;
    hitStop(45);
    AudioSys.crit();
  }
  e.hp -= d;
  e.flash = 0.1;
  if (opts.burn) { e.burn = opts.burn; e.burnDmg = opts.burnDmg; }
  if (opts.slow) { e.slow = opts.slow; e.slowMul = opts.slowMul || 0.55; }
  // size by damage magnitude
  const mag = Math.min(1, Math.log10(1 + d) / 3.2);
  const size = isCrit ? 14 + mag * 8 : 11 + mag * 5;
  spawnFloater(e.x, e.y - e.r, `${Math.round(d)}`, isCrit ? "#fbbf24" : "#e8e6d9", size, isCrit);
  if (!isCrit) AudioSys.hit();
  if (e.hp <= 0) killEnemy(e);
}

function fireSwordBolt() {
  let target = null, best = 1e9;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const d = dist(G.px, G.py, e.x, e.y);
    if (d < best) { best = d; target = e; }
  }
  const lv = G.weapons.sword.lv;
  const evo = G.weapons.sword.evo;
  const dmg = G.atk * playerDamageMult() * (evo ? 1.6 : 1) * (0.85 + lv * 0.08);
  const spd = 420 + lv * 10;
  if (!target) {
    const mv = readMove();
    const ang = Math.hypot(mv.x, mv.y) > 0.1 ? Math.atan2(mv.y, mv.x) : rand(0, TAU);
    G.projectiles.push({
      kind: "sword", x: G.px, y: G.py,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      r: G.swordSize * 0.55, dmg, pierce: G.swordPierce + (evo ? 1 : 0),
      life: 0.7, hitIds: new Set(), color: "#7dd3fc",
    });
    return;
  }
  const ang = angleTo(G.px, G.py, target.x, target.y);
  G.projectiles.push({
    kind: "sword", x: G.px, y: G.py,
    vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
    r: G.swordSize * 0.55, dmg, pierce: G.swordPierce + (evo ? 1 : 0),
    life: 1.4, hitIds: new Set(), color: "#7dd3fc",
  });
}

function castSkill(idx) {
  if (G.state !== "play") return;
  if (idx === 0) {
    if (G.aoeCDLeft > 0) return;
    if (G.mp < 20) { toast("灵力不足"); return; }
    G.mp -= 20;
    G.aoeCDLeft = G.aoeCD;
    AudioSys.skill();
    G.shake = 6;
    let target = null, best = 1e9;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(G.px, G.py, e.x, e.y);
      if (d < best) { best = d; target = e; }
    }
    const mv = readMove();
    const face = target ? angleTo(G.px, G.py, target.x, target.y)
      : (Math.hypot(mv.x, mv.y) > 0.1 ? Math.atan2(mv.y, mv.x) : 0);
    const dmg = G.atk * G.aoeDamageMul * playerDamageMult() * 1.5;
    const range = G.aoeRange;
    const half = G.aoeAngle / 2;
    G.slash = { x: G.px, y: G.py, ang: face, range, half, life: 0.28, max: 0.28, color: "#c4f1ff" };
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = dist(G.px, G.py, e.x, e.y);
      if (d > range + e.r) continue;
      const ea = angleTo(G.px, G.py, e.x, e.y);
      let diff = Math.abs(ea - face);
      if (diff > Math.PI) diff = TAU - diff;
      if (diff <= half) applyHit(e, dmg);
    }
  } else if (idx === 1) {
    if (G.dashCDLeft > 0) return;
    if (G.mp < 15) { toast("灵力不足"); return; }
    G.mp -= 15;
    G.dashCDLeft = G.dashCD;
    G.dashTimer = G.dashTime;
    G.dashIFrame = G.dashTime + 0.05;
    AudioSys.skill();
    burst(G.px, G.py, "#5ce1e6", 12, 100, 3);
  }
}

// ---------- Weapons auto ----------
function nearestEnemy(x, y, maxR = 1e9) {
  let t = null, best = maxR;
  for (const e of G.enemies) {
    if (e.dead) continue;
    const d = dist(x, y, e.x, e.y);
    if (d < best) { best = d; t = e; }
  }
  return t;
}

function updateWeapons(dt) {
  const w = G.weapons;
  // fire orb
  if (w.fire.lv > 0) {
    w.fire.timer -= dt * (1 + w.fire.lv * 0.15) * G.atkSpeed * 0.5;
    if (w.fire.timer <= 0) {
      w.fire.timer = 1;
      const t = nearestEnemy(G.px, G.py);
      if (t) {
        const ang = angleTo(G.px, G.py, t.x, t.y);
        const evo = w.fire.evo;
        const spd = evo ? 280 : 220;
        G.projectiles.push({
          kind: "fire", x: G.px, y: G.py,
          vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
          r: evo ? 12 : 9,
          dmg: G.atk * (0.9 + w.fire.lv * 0.25) * (evo ? 1.6 : 1) * playerDamageMult(),
          life: 2.2, hitIds: new Set(), color: "#fb923c",
          burn: evo ? 3.5 : 2.5, burnDmg: G.atk * 0.25 * w.fire.lv * (evo ? 2 : 1),
          aoe: evo ? 48 : 0,
        });
      }
    }
  }
  // frost bolt
  if (w.frost.lv > 0) {
    w.frost.timer -= dt * (0.7 + w.frost.lv * 0.1) * G.atkSpeed * 0.4;
    if (w.frost.timer <= 0) {
      w.frost.timer = 1;
      const t = nearestEnemy(G.px, G.py);
      if (t) {
        const ang = angleTo(G.px, G.py, t.x, t.y);
        const evo = w.frost.evo;
        G.projectiles.push({
          kind: "frost", x: G.px, y: G.py,
          vx: Math.cos(ang) * 340, vy: Math.sin(ang) * 340,
          r: 7,
          dmg: G.atk * (0.7 + w.frost.lv * 0.2) * (evo ? 1.6 : 1) * playerDamageMult(),
          life: 1.6, hitIds: new Set(), color: "#7dd3fc",
          slow: evo ? 2.2 : 1.5, slowMul: evo ? 0.25 : 0.55,
          pierce: evo ? 2 : 0, freezeElite: evo,
        });
      }
    }
  }
  // lightning bolt (紫电)
  if (w.lightning.lv > 0) {
    w.lightning.timer -= dt * (0.55 + w.lightning.lv * 0.1) * G.atkSpeed * 0.35;
    if (w.lightning.timer <= 0) {
      w.lightning.timer = 1;
      const t = nearestEnemy(G.px, G.py, 320);
      if (t) {
        const ang = angleTo(G.px, G.py, t.x, t.y);
        const evo = w.lightning.evo;
        G.projectiles.push({
          kind: "lightning", x: G.px, y: G.py,
          vx: Math.cos(ang) * 480, vy: Math.sin(ang) * 480,
          r: 6,
          dmg: G.atk * (0.85 + w.lightning.lv * 0.22) * (evo ? 1.6 : 1) * playerDamageMult(),
          life: 1.1, hitIds: new Set(), color: "#a78bfa",
          pierce: 0,
        });
      }
    }
  }
  // sword array pulse
  if (w.array.lv > 0) {
    w.array.timer -= dt;
    const interval = Math.max(2.2, 4.2 - w.array.lv * 0.35);
    if (w.array.timer <= 0) {
      w.array.timer = interval;
      const evo = w.array.evo;
      const pulses = evo ? 3 : 1;
      const radius = (70 + w.array.lv * 12) * (evo ? 1.4 : 1);
      const dmg = G.atk * (0.8 + w.array.lv * 0.2) * (evo ? 1.6 : 1) * playerDamageMult();
      for (let p = 0; p < pulses; p++) {
        setTimeout(() => {
          if (G.state !== "play") return;
          G.particles.push({
            x: G.px, y: G.py, vx: 0, vy: 0, life: 0.35, max: 0.35,
            color: "#5ce1e6", size: 4, ring: { r0: 10, r1: radius },
          });
          for (const e of G.enemies) {
            if (e.dead) continue;
            if (dist(G.px, G.py, e.x, e.y) <= radius + e.r) applyHit(e, dmg);
          }
          AudioSys.skill();
        }, p * 120);
      }
    }
  }
}

function onProjectileHitEnemy(p, e) {
  if (p.kind === "lightning") {
    applyHit(e, p.dmg);
    // chain
    let chained = 0;
    const maxChain = G.weapons.lightning.evo ? 5 : 3 + Math.floor(G.weapons.lightning.lv * 0.3);
    const chainDmg = p.dmg * (G.weapons.lightning.evo ? 0.75 : 0.5);
    let from = e;
    const used = new Set([e.id]);
    while (chained < maxChain) {
      let next = null, best = 100;
      for (const e2 of G.enemies) {
        if (e2.dead || used.has(e2.id)) continue;
        const d = dist(from.x, from.y, e2.x, e2.y);
        if (d < best) { best = d; next = e2; }
      }
      if (!next) break;
      used.add(next.id);
      G.particles.push({
        x: from.x, y: from.y, vx: 0, vy: 0, life: 0.12, max: 0.12,
        color: "#a78bfa", size: 2, line: { x: next.x, y: next.y },
      });
      applyHit(next, chainDmg);
      from = next;
      chained++;
    }
    return true;
  }
  if (p.kind === "fire") {
    applyHit(e, p.dmg, { burn: p.burn, burnDmg: p.burnDmg });
    if (p.aoe > 0) {
      for (const e2 of G.enemies) {
        if (e2.dead || e2.id === e.id) continue;
        if (dist(e.x, e.y, e2.x, e2.y) < p.aoe) applyHit(e2, p.dmg * 0.5);
      }
      burst(e.x, e.y, "#fb923c", 10, 140, 4);
    }
    return true;
  }
  if (p.kind === "frost") {
    applyHit(e, p.dmg, { slow: p.slow, slowMul: p.slowMul });
    if (p.freezeElite && (e.elite || e.boss)) {
      e.slow = 1.2; e.slowMul = 0.15;
      spawnFloater(e.x, e.y - e.r, "冻结", "#7dd3fc", 12);
    }
    return true;
  }
  // sword default
  applyHit(e, p.dmg);
  if (G.chain > 0 && Math.random() < G.chain) {
    for (const e2 of G.enemies) {
      if (e2.dead || e2.id === e.id) continue;
      if (dist(e.x, e.y, e2.x, e2.y) < 90) {
        applyHit(e2, p.dmg * 0.5);
        G.particles.push({
          x: e.x, y: e.y, vx: 0, vy: 0, life: 0.12, max: 0.12,
          color: "#a78bfa", size: 2, line: { x: e2.x, y: e2.y },
        });
        break;
      }
    }
  }
  return true;
}

// ---------- Level modal ----------
let pendingChoices = [];
const TAG_CLASS = {
  "输出": "t-out",
  "爆发": "t-burst",
  "生存": "t-hp",
  "飞剑": "t-sword",
  "剑气": "t-aoe",
  "身法": "t-move",
  "续航": "t-mp",
  "成长": "t-xp",
};

function openLevelUp() {
  // 到转职境界：本次不给普通升级卡，改出转职抉择
  if (shouldOfferJob()) { openJobModal(); return; }
  G.state = "level";
  pendingChoices = rollUpgrades();
  // gold burst on level
  burst(G.px, G.py, "#f0c14b", 18, 160, 4);
  G.particles.push({
    x: G.px, y: G.py, vx: 0, vy: 0,
    life: 0.4, max: 0.4, color: "#f0c14b", size: 4,
    ring: { r0: 10, r1: 90 },
  });
  ui.levelChoices.innerHTML = "";
  for (const u of pendingChoices) {
    const btn = document.createElement("button");
    const tagCls = TAG_CLASS[u.tag] || "t-sword";
    btn.className = "choice-btn" + (u.rare ? " rare" : "");
    btn.innerHTML = `
      <div class="choice-ico ${tagCls}">${u.ico || "道"}</div>
      <div class="choice-body">
        <span class="c-tag ${tagCls}">${u.tag}${u.rare ? "·稀有" : ""}</span>
        <span class="c-name">${u.name}</span>
        <span class="c-desc">${u.desc}</span>
      </div>`;
    btn.addEventListener("click", () => {
      u.apply();
      AudioSys.level();
      toast(`领悟 · ${u.name}`, u.rare ? "gold" : "cyan");
      if (String(u.id).startsWith("e_")) {
        G.goldFlash = 0.55;
        G.shake = Math.max(G.shake, 10);
        burst(G.px, G.py, "#fde68a", 28, 220, 5);
      }
      ui.levelModal.classList.add("hidden");
      G.state = "play";
      refreshWeaponHint();
      if (G.pendingLevel && G.pendingLevel > 0) {
        G.pendingLevel -= 1;
        setTimeout(() => openLevelUp(), 50);
      }
    });
    ui.levelChoices.appendChild(btn);
  }
  ui.levelModal.classList.remove("hidden");
}

function refreshWeaponHint() {
  const w = G.weapons;
  const names = [];
  if (w.sword.lv) names.push("飞剑");
  if (w.orbit.lv) names.push("环剑");
  if (w.fire.lv) names.push(w.fire.evo ? "业火觉醒" : "业火");
  if (w.lightning.lv) names.push(w.lightning.evo ? "雷法觉醒" : "紫电");
  if (w.frost.lv) names.push(w.frost.evo ? "冰封觉醒" : "寒冰");
  if (w.array.lv) names.push(w.array.evo ? "万剑归宗" : "剑阵");
  ui.weaponHint.textContent = names.slice(0, 4).join("·") || "飞剑";
}

// ---------- Flow ----------
function startRun(charId) {
  AudioSys.init();
  const id = charId || Meta.load().selectedChar || "sword";
  const m = Meta.load();
  m.selectedChar = id;
  Meta.save(m);
  resetRun(id);
  G.state = "play";
  setMenuBg(false);
  ui.startScreen.classList.add("hidden");
  ui.shopScreen.classList.add("hidden");
  ui.overScreen.classList.add("hidden");
  ui.hud.classList.remove("hidden", "low-hp", "char-sword", "char-mage", "char-body");
  ui.hud.classList.add("char-" + id);
  ui.comboBadge.classList.add("hidden");
  refreshWeaponHint();
  jobSyncHud(false);
  toast(`${CHARS[id]?.name || "修士"} · 御剑清妖`);
  clearTimeout(startRun._hint);
  startRun._hint = setTimeout(() => {
    if (G.state === "play") toast("站上剑阵 · 充能阵成 · 离阵余威尚存", "cyan");
  }, 2200);
}

function endRun() {
  if (G.state === "over") return;
  G.state = "over";
  releaseJoystick();
  releaseWakeLock();
  const base = G.wave * 3 + G.kills * 0.4 + G.comboPeak * 1.5;
  const coins = Math.max(0, Math.floor(base * (1 + (G._shopCoin || 0))));
  const best = Meta.endRun(G.wave, G.kills, G.time, G.comboPeak, coins);
  G.coinsRun = coins;
  G._metaCoinsCached = best.coins;
  ui.hud.classList.add("hidden");
  ui.levelModal.classList.add("hidden");
  ui.comboBadge.classList.add("hidden");
  ui.overWave.textContent = G.wave;
  ui.overKills.textContent = G.kills;
  ui.overTime.textContent = formatTime(G.time);
  ui.overCombo.textContent = G.comboPeak;
  ui.overLevel.textContent = G.level;
  ui.overCoins.textContent = "+" + coins;
  ui.overTitle.textContent = `${RealmTitle(G.level)}境 · ${CHARS[G.charId]?.name || ""}`;
  ui.overMsg.textContent = G.wave >= best.bestWave
    ? "刷新波次纪录，灵石已入库。"
    : `最高波次 ${best.bestWave}，灵石可强化后再战。`;
  ui.overScreen.classList.remove("hidden");
  setMenuBg(true);
}

function formatTime(s) {
  s = Math.floor(s);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

function toast(msg, kind) {
  ui.toast.textContent = msg;
  ui.toast.classList.remove("hidden", "t-gold", "t-cyan", "t-red");
  if (kind === "gold") ui.toast.classList.add("t-gold");
  else if (kind === "cyan") ui.toast.classList.add("t-cyan");
  else if (kind === "red") ui.toast.classList.add("t-red");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => ui.toast.classList.add("hidden"), 1600);
}

// ---------- Update ----------
function update(dt) {
  if (G.state === "menu" || G.state === "over" || G.state === "shop" || G.state === "pause") return;
  if (G.state === "level" || G.state === "job") return;

  // hit-stop
  if (G.hitStop > 0) {
    G.hitStop -= dt;
    updateHUD();
    return;
  }

  G.time += dt;
  G.flash = Math.max(0, G.flash - dt);
  G.goldFlash = Math.max(0, (G.goldFlash || 0) - dt);
  G.shake = Math.max(0, G.shake - dt * 30);
  G.bossBanner = Math.max(0, G.bossBanner - dt);
  G.waveBanner = Math.max(0, (G.waveBanner || 0) - dt);
  G.invuln = Math.max(0, G.invuln - dt);
  G.dashIFrame = Math.max(0, G.dashIFrame - dt);
  G.dashTimer = Math.max(0, G.dashTimer - dt);
  G.aoeCDLeft = Math.max(0, G.aoeCDLeft - dt);
  G.dashCDLeft = Math.max(0, G.dashCDLeft - dt);
  G.mp = Math.min(G.mpMax, G.mp + G.mpRegen * dt);

  // combo decay
  if (G.comboTimer > 0) {
    G.comboTimer -= dt;
    if (G.comboTimer <= 0) {
      G.combo = 0;
      ui.comboBadge.classList.add("hidden");
    }
  }

  if (G.slash) {
    G.slash.life -= dt;
    if (G.slash.life <= 0) G.slash = null;
  }

  const mv = readMove();
  const speed = G.moveSpeed * (G.nodeMoveMul || 1) * (G.dashTimer > 0 ? G.dashSpeedMul : 1);
  G.px += mv.x * speed * dt;
  G.py += mv.y * speed * dt;
  const dFromOrigin = Math.hypot(G.px, G.py);
  if (dFromOrigin > G.arenaR) {
    const s = G.arenaR / dFromOrigin;
    G.px *= s; G.py *= s;
  }

  updateNodes(dt);

  G.swordPhase += dt * (1.8 + G.atkSpeed * 0.5);
  const orbitCount = G.swordCount;
  const orbitDmg = G.atk * 0.55 * playerDamageMult() * (G.weapons.orbit.evo ? 1.5 : 1) * (1 + G.weapons.orbit.lv * 0.05);
  for (let i = 0; i < orbitCount; i++) {
    const a = G.swordPhase + (i / orbitCount) * TAU;
    const sx = G.px + Math.cos(a) * G.swordOrbit;
    const sy = G.py + Math.sin(a) * G.swordOrbit;
    for (const e of G.enemies) {
      if (e.dead || e.hitCD > 0) continue;
      if (dist(sx, sy, e.x, e.y) < e.r + G.swordSize * 0.5) {
        e.hitCD = 0.15;
        applyHit(e, orbitDmg);
      }
    }
  }

  G.swordTimer -= dt * G.atkSpeed;
  if (G.swordTimer <= 0) {
    G.swordTimer = 1;
    fireSwordBolt();
  }

  updateWeapons(dt);

  for (const p of G.projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    for (const e of G.enemies) {
      if (e.dead || p.hitIds.has(e.id)) continue;
      if (dist(p.x, p.y, e.x, e.y) < e.r + p.r) {
        p.hitIds.add(e.id);
        onProjectileHitEnemy(p, e);
        if (p.pierce <= 0) { p.life = 0; break; }
        p.pierce -= 1;
      }
    }
  }
  G.projectiles = G.projectiles.filter((p) => p.life > 0);

  for (const e of G.enemies) {
    if (e.dead) continue;
    e.flash = Math.max(0, e.flash - dt);
    e.hitCD = Math.max(0, e.hitCD - dt);
    e.specialCD -= dt;
    // burn
    if (e.burn > 0) {
      e.burn -= dt;
      e.burnDmgAcc = (e.burnDmgAcc || 0) + e.burnDmg * dt;
      if (e.burnDmgAcc >= 1) {
        const tick = Math.floor(e.burnDmgAcc);
        e.burnDmgAcc -= tick;
        e.hp -= tick;
        if (Math.random() < 0.3) spawnFloater(e.x, e.y - e.r, `${tick}`, "#fb923c", 10);
        if (e.hp <= 0) killEnemy(e);
      }
    }
    if (e.slow > 0) {
      e.slow -= dt;
      if (e.slow <= 0) e.slowMul = 1;
    }

    const ang = angleTo(e.x, e.y, G.px, G.py);
    let mx = Math.cos(ang), my = Math.sin(ang);
    if (e.shape === "bat") {
      const swirl = Math.sin(G.time * 3 + e.phase) * 0.55;
      const px = -Math.sin(ang), py = Math.cos(ang);
      mx += px * swirl; my += py * swirl;
      const n = Math.hypot(mx, my) || 1; mx /= n; my /= n;
    }
    const spd = e.speed * (e.slowMul || 1);
    e.x += mx * spd * dt;
    e.y += my * spd * dt;

    if (e.boss && e.specialCD <= 0) {
      e.specialCD = rand(3.5, 5.5);
      if (e.summon) {
        for (let i = 0; i < 3; i++) spawnEnemy("fox", e.x + rand(-30, 30), e.y + rand(-30, 30), G.wave);
        toast(`${e.name} 召唤狐群`);
      }
      if (e.slam) {
        if (dist(e.x, e.y, G.px, G.py) < 120) {
          damagePlayer(e.atk * 1.4);
          G.shake = 12;
          burst(G.px, G.py, "#f59e0b", 20, 180, 5);
        }
        G.particles.push({
          x: e.x, y: e.y, vx: 0, vy: 0, life: 0.4, max: 0.4, color: "#f59e0b", size: 4,
          ring: { r0: e.r, r1: 130 },
        });
      }
    }

    if (dist(e.x, e.y, G.px, G.py) < e.r + G.pr) {
      damagePlayer(e.atk * dt * 3.2);
      const push = angleTo(G.px, G.py, e.x, e.y);
      e.x += Math.cos(push) * 40 * dt;
      e.y += Math.sin(push) * 40 * dt;
    }
  }
  G.enemies = G.enemies.filter((e) => !e.dead);

  for (const p of G.pickups) {
    p.life -= dt;
    p.bob += dt * 3;
    const d = dist(p.x, p.y, G.px, G.py);
    if (d < 100) {
      const a = angleTo(p.x, p.y, G.px, G.py);
      const pull = lerp(120, 320, 1 - d / 100);
      p.x += Math.cos(a) * pull * dt;
      p.y += Math.sin(a) * pull * dt;
      // vacuum sparks
      if (Math.random() < 0.35) {
        G.particles.push({
          x: p.x, y: p.y,
          vx: Math.cos(a) * 40, vy: Math.sin(a) * 40,
          life: 0.2, max: 0.2,
          color: p.kind === "boss" ? "#fbbf24" : p.kind === "elite" ? "#c084fc" : "#5ce1e6",
          size: 2,
        });
      }
    }
    if (d < G.pr + p.r + 4) { collectPickup(p); p.life = 0; }
  }
  G.pickups = G.pickups.filter((p) => p.life > 0);

  for (const p of G.particles) {
    p.life -= dt;
    p.x += (p.vx || 0) * dt;
    p.y += (p.vy || 0) * dt;
    if (p.vx) { p.vx *= 0.96; p.vy *= 0.96; }
  }
  G.particles = G.particles.filter((p) => p.life > 0);

  for (const f of G.floaters) {
    f.life -= dt;
    f.y += f.vy * dt;
    f.vy *= 0.95;
  }
  G.floaters = G.floaters.filter((f) => f.life > 0);

  updateWaves(dt);
  updateHUD();
}

function updateHUD() {
  ui.hpFill.style.width = `${(G.hp / G.hpMax) * 100}%`;
  ui.hpText.textContent = `${Math.ceil(G.hp)}/${Math.ceil(G.hpMax)}`;
  ui.mpFill.style.width = `${(G.mp / G.mpMax) * 100}%`;
  ui.mpText.textContent = `${Math.floor(G.mp)}/${Math.ceil(G.mpMax)}`;
  ui.waveText.textContent = G.wave;
  ui.killText.textContent = G.kills;
  ui.timeText.textContent = formatTime(G.time) + (G.waveTimer > 0 ? ` · ${Math.ceil(G.waveTimer)}s` : "");
  ui.timeText.classList.toggle("soon", G.waveTimer > 0 && G.waveTimer < 4);
  if (ui.waveFill) {
    const pct = G.waveInterval > 0 ? clamp(1 - G.waveTimer / G.waveInterval, 0, 1) * 100 : 0;
    ui.waveFill.style.width = `${pct}%`;
    ui.waveFill.classList.toggle("soon", G.waveTimer > 0 && G.waveTimer < 4);
  }
  ui.xpFill.style.width = `${(G.xp / G.xpNeed) * 100}%`;
  ui.levelText.textContent = G.level;
  ui.titleText.textContent = RealmTitle(G.level);
  const realm = G.level >= 30 ? "r-hua" : G.level >= 20 ? "r-yuan" : G.level >= 12 ? "r-jin" : G.level >= 6 ? "r-zhu" : "r-lian";
  if (ui.levelBadge && ui._realm !== realm) {
    ui.levelBadge.className = "level-badge " + realm;
    ui._realm = realm;
  }
  ui.coinText.textContent = G._metaCoinsCached != null ? G._metaCoinsCached : Meta.load().coins;
  ui.comboNum.textContent = G.combo;
  // combo timer ring on badge
  const comboPct = G.comboTimer > 0 ? (G.comboTimer / 2.2) * 100 : 0;
  ui.comboBadge.style.setProperty("--combo-timer", `${comboPct}%`);
  const c1 = G.aoeCDLeft > 0 ? (G.aoeCDLeft / G.aoeCD) * 100 : 0;
  const c2 = G.dashCDLeft > 0 ? (G.dashCDLeft / G.dashCD) * 100 : 0;
  ui.cd1.style.setProperty("--cd", `${c1}%`);
  ui.cd2.style.setProperty("--cd", `${c2}%`);
  ui.cd1.textContent = G.aoeCDLeft > 0 ? String(Math.ceil(G.aoeCDLeft)) : "";
  ui.cd2.textContent = G.dashCDLeft > 0 ? String(Math.ceil(G.dashCDLeft)) : "";
  ui.btnSkill1.classList.toggle("cooling", G.aoeCDLeft > 0);
  ui.btnSkill2.classList.toggle("cooling", G.dashCDLeft > 0);
  const ready1 = G.aoeCDLeft <= 0 && G.mp >= 20;
  const ready2 = G.dashCDLeft <= 0 && G.mp >= 15;
  ui.btnSkill1.classList.toggle("ready", ready1);
  ui.btnSkill2.classList.toggle("ready", ready2);
  ui.btnSkill1.style.opacity = G.mp < 20 ? "0.5" : "1";
  ui.btnSkill2.style.opacity = G.mp < 15 ? "0.5" : "1";
  const low = G.hp / G.hpMax < 0.35;
  ui.hud.classList.toggle("low-hp", low);

  // 剑阵状态提示
  if (ui.nodeHud) {
    const nd = G.nodeInside ? G.nodes.find((x) => x.id === G.nodeInside) : null;
    if (nd && nd.active) {
      ui.nodeHud.classList.remove("hidden");
      ui.nodeHudIco.textContent = nd.def.ico;
      ui.nodeHudName.textContent = nd.def.name;
      ui.nodeHudBuff.textContent = nd.def.buff;
      ui.nodeHud.style.setProperty("--nc", nd.def.color);
      ui.nodeHudFill.style.width = `${Math.max(0, Math.min(1, nd.holdT / NODE_HOLD)) * 100}%`;
    } else {
      ui.nodeHud.classList.add("hidden");
    }
  }

  // boss top bar
  const boss = G.enemies.find((e) => e.boss && !e.dead);
  if (boss && ui.bossBar) {
    ui.bossBar.classList.remove("hidden");
    ui.bossBarName.textContent = boss.name;
    ui.bossBarFill.style.width = `${clamp((boss.hp / boss.hpMax) * 100, 0, 100)}%`;
  } else if (ui.bossBar) {
    ui.bossBar.classList.add("hidden");
  }
}

// ---------- Draw ----------
function w2s(wx, wy) {
  return { x: wx - G.px + view.w / 2, y: wy - G.py + view.h / 2 };
}

function draw() {
  const w = view.w, h = view.h;
  ctx.clearRect(0, 0, w, h);
  let ox = 0, oy = 0;
  if (G.shake > 0) { ox = rand(-G.shake, G.shake); oy = rand(-G.shake, G.shake); }
  ctx.save();
  ctx.translate(ox, oy);
  const camX = G.px, camY = G.py;
  drawBackground(camX, camY);
  if (G.state === "menu" || G.state === "shop") {
    drawMenuAmbient();
  } else {
    drawNodes(camX, camY);
    for (const p of G.pickups) drawPickup(p);
    // magnet tether when close
    for (const p of G.pickups) {
      const d = dist(p.x, p.y, G.px, G.py);
      if (d < 90 && d > 8) {
        const a = w2s(p.x, p.y);
        const b = w2s(G.px, G.py);
        const col = p.kind === "boss" ? "251,191,36" : p.kind === "elite" ? "192,132,252" : "92,225,230";
        const alpha = (1 - d / 90) * 0.35;
        ctx.strokeStyle = `rgba(${col},${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -G.time * 40;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    for (const e of G.enemies) drawEnemy(e);
    drawOffscreenIndicators();
    for (const p of G.projectiles) drawProjectile(p);
    drawPlayer();
    // near arena edge: gold warning ring pulse
    const distEdge = Math.hypot(G.px, G.py);
    if (distEdge > G.arenaR * 0.88) {
      const ox = -camX + view.w / 2;
      const oy = -camY + view.h / 2;
      const pulse = 0.35 + 0.25 * Math.sin(G.time * 6);
      ctx.strokeStyle = `rgba(240,193,75,${pulse})`;
      ctx.lineWidth = 6;
      ctx.shadowColor = "#f0c14b";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(ox, oy, G.arenaR, 0, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    if (G.slash) drawSlash(G.slash);
    for (const p of G.particles) drawParticle(p);
    for (const f of G.floaters) drawFloater(f);
    if (G.bossBanner > 0) drawBossBanner();
    else if (G.waveBanner > 0) drawWaveBanner();
  }
  ctx.restore();
  if (G.flash > 0) {
    ctx.fillStyle = `rgba(239,68,68,${G.flash * 0.35})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (G.goldFlash > 0) {
    ctx.fillStyle = `rgba(253,230,138,${G.goldFlash * 0.45})`;
    ctx.fillRect(0, 0, w, h);
  }
  // combat vignette
  if (G.state === "play" || G.state === "level" || G.state === "job") {
    const hasBoss = G.enemies.some((e) => e.boss && !e.dead);
    const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, hasBoss ? "rgba(60,20,4,0.48)" : "rgba(0,0,0,0.42)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
  }
}

let bgGrad = null;
function drawBackground(camX, camY) {
  if (!bgGrad) {
    bgGrad = ctx.createRadialGradient(view.w / 2, view.h * 0.4, 20, view.w / 2, view.h * 0.5, Math.max(view.w, view.h) * 0.7);
    bgGrad.addColorStop(0, "#152033");
    bgGrad.addColorStop(0.55, "#0d1420");
    bgGrad.addColorStop(1, "#070b12");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, view.w, view.h);

  // distant spiritual fog pools (world-anchored, cheap)
  const t = G.time || 0;
  const fogColors = [
    [92, 225, 230],
    [167, 139, 250],
    [240, 193, 75],
  ];
  const fogN = Quality.fogCount();
  for (let i = 0; i < fogN; i++) {
    const wx = Math.sin(i * 1.7) * 620 + Math.cos(i * 0.9) * 280;
    const wy = Math.cos(i * 2.1) * 480 + Math.sin(i * 1.3) * 220;
    const c = fogColors[i % 3];
    const pulse = 0.06 + 0.04 * Math.sin(t * 0.7 + i);
    const rr = 160 + (i % 3) * 40;
    const sx = wx - camX + view.w / 2;
    const sy = wy - camY + view.h / 2;
    if (sx < -rr || sy < -rr || sx > view.w + rr || sy > view.h + rr) continue;
    const fg = ctx.createRadialGradient(sx, sy, 8, sx, sy, rr);
    fg.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${pulse})`);
    fg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(sx, sy, rr, 0, TAU);
    ctx.fill();
  }

  // stone grid
  const step = 48;
  const startX = -camX % step;
  const startY = -camY % step;
  ctx.strokeStyle = "rgba(92,225,230,0.05)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = startX; x < view.w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, view.h); }
  for (let y = startY; y < view.h; y += step) { ctx.moveTo(0, y); ctx.lineTo(view.w, y); }
  ctx.stroke();

  // origin ritual circle
  const ox = -camX + view.w / 2;
  const oy = -camY + view.h / 2;
  const drawRing = (rad, color, lw, alpha) => {
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(ox, oy, rad, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };
  drawRing(G.arenaR, "rgba(212,160,23,0.18)", 2.5, 1);
  drawRing(G.arenaR + 8, "rgba(92,225,230,0.08)", 10, 1);
  drawRing(120, "rgba(92,225,230,0.1)", 1, 0.9);
  drawRing(90, "rgba(240,193,75,0.08)", 1, 0.8);
  // slow rotating dashed inner ring
  ctx.save();
  ctx.translate(ox, oy);
  ctx.rotate((G.time || 0) * 0.12);
  ctx.strokeStyle = "rgba(92,225,230,0.14)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 12]);
  ctx.beginPath();
  ctx.arc(0, 0, 108, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
  // cross ticks on ritual circle
  ctx.strokeStyle = "rgba(240,193,75,0.16)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU;
    const x1 = ox + Math.cos(a) * 100;
    const y1 = oy + Math.sin(a) * 100;
    const x2 = ox + Math.cos(a) * 118;
    const y2 = oy + Math.sin(a) * 118;
    ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  }
  ctx.stroke();
  // cardinal diamonds
  ctx.fillStyle = "rgba(240,193,75,0.22)";
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * TAU - Math.PI / 2;
    const dx = ox + Math.cos(a) * 109;
    const dy = oy + Math.sin(a) * 109;
    ctx.beginPath();
    ctx.moveTo(dx, dy - 4); ctx.lineTo(dx + 3, dy); ctx.lineTo(dx, dy + 4); ctx.lineTo(dx - 3, dy);
    ctx.closePath();
    ctx.fill();
  }

  // static world props (deterministic, no alloc each frame beyond draw)
  drawWorldProps(camX, camY);
}

const WORLD_PROPS = (() => {
  const list = [];
  const kinds = ["rune", "crystal", "stele", "lantern"];
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * TAU + 0.35;
    const rad = 200 + (i % 5) * 70;
    list.push({
      x: Math.cos(ang) * rad + Math.sin(i * 2.3) * 40,
      y: Math.sin(ang) * rad + Math.cos(i * 1.7) * 30,
      kind: kinds[i % 4],
      s: 0.85 + (i % 3) * 0.15,
      ph: i * 0.7,
    });
  }
  return list;
})();

function drawWorldProps(camX, camY) {
  const t = G.time || 0;
  for (const p of WORLD_PROPS) {
    const sx = p.x - camX + view.w / 2;
    const sy = p.y - camY + view.h / 2;
    const s = p.s;
    if (sx < -40 || sy < -50 || sx > view.w + 40 || sy > view.h + 40) continue;
    ctx.save();
    ctx.translate(sx, sy);
    if (p.kind === "rune") {
      ctx.fillStyle = "rgba(18,28,42,0.85)";
      ctx.beginPath();
      ctx.roundRect(-14 * s, -10 * s, 28 * s, 20 * s, 4 * s);
      ctx.fill();
      ctx.strokeStyle = "rgba(92,225,230,0.35)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      const pulse = 0.35 + 0.25 * Math.sin(t * 1.4 + p.ph);
      ctx.strokeStyle = `rgba(92,225,230,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6 * s, -3 * s); ctx.lineTo(0, -7 * s); ctx.lineTo(6 * s, -3 * s);
      ctx.moveTo(0, -7 * s); ctx.lineTo(0, 6 * s);
      ctx.stroke();
    } else if (p.kind === "crystal") {
      const g = ctx.createLinearGradient(0, -18 * s, 0, 8 * s);
      g.addColorStop(0, "rgba(167,139,250,0.55)");
      g.addColorStop(1, "rgba(40,20,60,0.25)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -18 * s);
      ctx.lineTo(9 * s, -2 * s);
      ctx.lineTo(0, 8 * s);
      ctx.lineTo(-9 * s, -2 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(233,213,255,0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.beginPath();
      ctx.moveTo(-2 * s, -14 * s); ctx.lineTo(1 * s, -6 * s); ctx.lineTo(-4 * s, -6 * s);
      ctx.closePath();
      ctx.fill();
    } else if (p.kind === "stele") {
      ctx.fillStyle = "rgba(22,28,36,0.9)";
      ctx.beginPath();
      ctx.roundRect(-8 * s, -22 * s, 16 * s, 28 * s, 3 * s);
      ctx.fill();
      ctx.strokeStyle = "rgba(240,193,75,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(240,193,75,0.35)";
      ctx.fillRect(-3 * s, -16 * s, 6 * s, 2 * s);
      ctx.fillRect(-3 * s, -11 * s, 6 * s, 2 * s);
      ctx.fillRect(-3 * s, -6 * s, 4 * s, 2 * s);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(0, 8 * s, 12 * s, 4 * s, 0, 0, TAU);
      ctx.fill();
    } else {
      // spirit lantern
      const glow = 0.25 + 0.2 * Math.sin(t * 2 + p.ph);
      ctx.fillStyle = "rgba(30,24,12,0.8)";
      ctx.fillRect(-2 * s, -2 * s, 4 * s, 14 * s);
      ctx.beginPath();
      ctx.arc(0, -8 * s, 7 * s, 0, TAU);
      ctx.fillStyle = `rgba(240,193,75,${0.35 + glow * 0.4})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(253,230,138,${0.4 + glow * 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      const gg = ctx.createRadialGradient(0, -8 * s, 2, 0, -8 * s, 18 * s);
      gg.addColorStop(0, `rgba(240,193,75,${glow * 0.55})`);
      gg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(0, -8 * s, 18 * s, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawMenuAmbient() {
  const t = performance.now() / 1000;
  // rising spiritual motes
  for (let i = 0; i < 28; i++) {
    const seed = i * 1.37;
    const x = ((seed * 97) % view.w + Math.sin(t * 0.4 + i) * 18 + view.w) % view.w;
    const y = (view.h + 40 - ((t * (18 + (i % 5) * 6) + i * 47) % (view.h + 80)));
    const a = 0.12 + 0.18 * Math.abs(Math.sin(t * 1.2 + i));
    const r = 1.2 + (i % 3) * 0.8;
    const col = i % 4 === 0 ? "240,193,75" : i % 3 === 0 ? "167,139,250" : "92,225,230";
    ctx.fillStyle = `rgba(${col},${a})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fill();
  }
  // drifting seal-script glyphs
  const glyphs = ["灵", "剑", "劫", "气", "玄", "道"];
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 6; i++) {
    const gx = (view.w * (0.12 + i * 0.15) + Math.sin(t * 0.25 + i) * 22) % (view.w + 40);
    const gy = view.h + 50 - ((t * (10 + i * 3) + i * 130) % (view.h + 120));
    const ga = 0.04 + 0.05 * Math.abs(Math.sin(t * 0.6 + i));
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(Math.sin(t * 0.3 + i) * 0.25);
    ctx.font = `700 ${28 + (i % 3) * 8}px "STKaiti", "KaiTi", serif`;
    ctx.fillStyle = i % 2 === 0 ? `rgba(240,193,75,${ga})` : `rgba(92,225,230,${ga})`;
    ctx.shadowColor = i % 2 === 0 ? "#f0c14b" : "#5ce1e6";
    ctx.shadowBlur = 12;
    ctx.fillText(glyphs[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
  // soft bottom mist
  const mg = ctx.createLinearGradient(0, view.h * 0.55, 0, view.h);
  mg.addColorStop(0, "rgba(92,225,230,0)");
  mg.addColorStop(1, "rgba(92,225,230,0.05)");
  ctx.fillStyle = mg;
  ctx.fillRect(0, view.h * 0.55, view.w, view.h * 0.45);
}

function drawSwordShape(x, y, rot, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.28, size * 0.15);
  ctx.lineTo(size * 0.18, size * 0.45);
  ctx.lineTo(0, size * 0.62);
  ctx.lineTo(-size * 0.18, size * 0.45);
  ctx.lineTo(-size * 0.28, size * 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.85);
  ctx.lineTo(size * 0.08, -size * 0.2);
  ctx.lineTo(-size * 0.08, -size * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPlayer() {
  const s = { x: view.w / 2, y: view.h / 2 };
  const body = G.charId === "mage" ? "#a78bfa" : G.charId === "body" ? "#fbbf24" : "#5ce1e6";
  const rim = G.charId === "mage" ? "#e9d5ff" : G.charId === "body" ? "#ffe9a8" : "#c4f1ff";

  // ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + G.pr * 0.85, G.pr * 1.05, G.pr * 0.38, 0, 0, TAU);
  ctx.fill();

  // aura (class-tinted)
  const grd = ctx.createRadialGradient(s.x, s.y, 6, s.x, s.y, 52);
  grd.addColorStop(0, G.charId === "mage" ? "rgba(167,139,250,0.28)" : G.charId === "body" ? "rgba(251,191,36,0.25)" : "rgba(92,225,230,0.28)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 52, 0, TAU);
  ctx.fill();

  if (G.shield > 0) {
    const pulse = G.shieldHit > 0 ? 1 : 0;
    if (G.shieldHit > 0) G.shieldHit = Math.max(0, G.shieldHit - 0.016);
    ctx.strokeStyle = pulse ? "rgba(236,252,203,0.95)" : "rgba(163,230,53,0.65)";
    ctx.lineWidth = pulse ? 3.5 : 2.5;
    ctx.shadowColor = "#a3e635";
    ctx.shadowBlur = pulse ? 20 : 12;
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.pr + 7 + Math.sin(G.time * 4) * 1.5, 0, TAU);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // dash afterimage / move trail
  const mv = readMove();
  const moving = Math.hypot(mv.x, mv.y) > 0.15;
  if (G.dashTimer > 0 || moving) {
    G.trail = G.trail || [];
    G.trail.push({ x: G.px, y: G.py, life: 0.28, r: G.pr * (G.dashTimer > 0 ? 0.85 : 0.55), color: body });
    if (G.trail.length > 12) G.trail.shift();
  }
  if (G.trail) {
    for (const t of G.trail) t.life -= 1 / 60;
    G.trail = G.trail.filter((t) => t.life > 0);
    for (const t of G.trail) {
      const a = t.life / 0.28;
      ctx.globalAlpha = a * 0.35;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x - G.px + s.x, t.y - G.py + s.y, t.r * a, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // body
  const bodyFill = G.dashIFrame > 0 ? "#ffffff" : (G.playerHurt > 0 ? "#fecaca" : body);
  if (G.playerHurt > 0) {
    G.playerHurt = Math.max(0, G.playerHurt - 0.016);
  }
  ctx.fillStyle = bodyFill;
  ctx.shadowColor = G.playerHurt > 0 ? "#f43f5e" : body;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.arc(s.x, s.y, G.pr, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // outer rim
  ctx.strokeStyle = rim;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(s.x, s.y, G.pr - 1, 0, TAU);
  ctx.stroke();
  // dark core
  const core = ctx.createRadialGradient(s.x, s.y - 2, 1, s.x, s.y, G.pr * 0.55);
  core.addColorStop(0, "rgba(255,255,255,0.35)");
  core.addColorStop(1, "rgba(10,14,20,0.85)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(s.x, s.y, G.pr * 0.42, 0, TAU);
  ctx.fill();

  // class silhouette marks
  if (G.charId === "sword") {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.shadowColor = "#7dd3fc";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, -G.pr * 0.72);
    ctx.lineTo(G.pr * 0.22, 0);
    ctx.lineTo(0, G.pr * 0.55);
    ctx.lineTo(-G.pr * 0.22, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.shadowBlur = 0;
  } else if (G.charId === "mage") {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(G.time * 1.2);
    ctx.strokeStyle = "rgba(233,213,255,0.7)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * TAU;
      const hx = Math.cos(a) * G.pr * 0.62;
      const hy = Math.sin(a) * G.pr * 0.62;
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2.2, 0, TAU);
    ctx.fill();
  } else {
    // body cultivator: shoulder plates
    ctx.strokeStyle = "rgba(255,233,168,0.75)";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.pr * 0.78, Math.PI * 1.15, Math.PI * 1.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.pr * 0.78, Math.PI * 1.45, Math.PI * 1.85);
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.ellipse(s.x, s.y - G.pr * 0.15, G.pr * 0.35, G.pr * 0.22, 0, 0, TAU);
    ctx.fill();
  }

  const n = G.swordCount;
  for (let i = 0; i < n; i++) {
    const a = G.swordPhase + (i / n) * TAU;
    const sx = s.x + Math.cos(a) * G.swordOrbit;
    const sy = s.y + Math.sin(a) * G.swordOrbit;
    // layered comet trail
    ctx.strokeStyle = "rgba(125,211,252,0.08)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.swordOrbit, a - 0.55, a);
    ctx.stroke();
    ctx.strokeStyle = "rgba(125,211,252,0.22)";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.swordOrbit, a - 0.4, a);
    ctx.stroke();
    ctx.strokeStyle = "rgba(230,248,255,0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.swordOrbit, a - 0.18, a);
    ctx.stroke();
    drawSwordShape(sx, sy, a + Math.PI / 2, G.swordSize, "#7dd3fc");
  }
}

function drawProjectile(p) {
  const s = w2s(p.x, p.y);
  const ang = Math.atan2(p.vy, p.vx);
  if (p.kind === "fire") {
    const fl = 1 + 0.12 * Math.sin((G.time || 0) * 22 + p.x * 0.1);
    // trail
    const tg = ctx.createLinearGradient(s.x - Math.cos(ang) * 26, s.y - Math.sin(ang) * 26, s.x, s.y);
    tg.addColorStop(0, "rgba(251,146,60,0)");
    tg.addColorStop(1, "rgba(251,191,36,0.55)");
    ctx.strokeStyle = tg;
    ctx.lineWidth = p.r * 1.35;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.x - Math.cos(ang) * 26, s.y - Math.sin(ang) * 26);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    // outer flame
    ctx.fillStyle = "rgba(251,146,60,0.45)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, p.r * 1.35 * fl, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fb923c";
    ctx.shadowColor = "#fb923c";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(s.x, s.y, p.r * fl, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(s.x, s.y, p.r * 0.42, 0, TAU);
    ctx.fill();
  } else if (p.kind === "frost") {
    const tg = ctx.createLinearGradient(s.x - Math.cos(ang) * 20, s.y - Math.sin(ang) * 20, s.x, s.y);
    tg.addColorStop(0, "rgba(186,230,253,0)");
    tg.addColorStop(1, "rgba(125,211,252,0.5)");
    ctx.strokeStyle = tg;
    ctx.lineWidth = p.r * 1.1;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(s.x - Math.cos(ang) * 20, s.y - Math.sin(ang) * 20);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.fillStyle = "#bae6fd";
    ctx.shadowColor = "#7dd3fc";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - p.r * 1.6);
    ctx.lineTo(s.x + p.r * 0.7, s.y);
    ctx.lineTo(s.x, s.y + p.r * 1.2);
    ctx.lineTo(s.x - p.r * 0.7, s.y);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (p.kind === "lightning") {
    // zigzag bolt with white core
    const len = 26;
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    const steps = 4;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const ox = s.x - Math.cos(ang) * len * t;
      const oy = s.y - Math.sin(ang) * len * t;
      const j = (i === 0 || i === steps) ? 0 : ((i % 2 === 0 ? -1 : 1) * 4);
      pts.push([ox + nx * j, oy + ny * j]);
    }
    ctx.strokeStyle = "rgba(167,139,250,0.25)";
    ctx.shadowColor = "#a78bfa";
    ctx.shadowBlur = 16;
    ctx.lineWidth = 6;
    ctx.lineJoin = "bevel";
    ctx.beginPath();
    pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1])));
    ctx.stroke();
    ctx.strokeStyle = "#c4b5fd";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1])));
    ctx.stroke();
    ctx.strokeStyle = "#f5f3ff";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1])));
    ctx.stroke();
    ctx.fillStyle = "#f5f3ff";
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3.5, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    // sword bolt trail
    const tx = s.x - Math.cos(ang) * 28;
    const ty = s.y - Math.sin(ang) * 28;
    const tg = ctx.createLinearGradient(tx, ty, s.x, s.y);
    tg.addColorStop(0, "rgba(125,211,252,0)");
    tg.addColorStop(1, "rgba(196,241,255,0.55)");
    ctx.strokeStyle = tg;
    ctx.lineWidth = p.r * 1.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    drawSwordShape(s.x, s.y, ang + Math.PI / 2, p.r * 2, p.color);
  }
}

function drawOffscreenIndicators() {
  const pad = 18;
  const L = pad, R = view.w - pad, T = pad, B = view.h - pad;
  const cx = view.w / 2, cy = view.h / 2;
  let n = 0;
  const t = G.time || 0;
  for (const e of G.enemies) {
    if (e.dead || n >= 24) continue;
    const s = w2s(e.x, e.y);
    if (s.x >= L && s.x <= R && s.y >= T && s.y <= B) continue;
    // clamp to edge
    const dx = s.x - cx, dy = s.y - cy;
    const ang = Math.atan2(dy, dx);
    // project to rect
    const tX = dx === 0 ? Infinity : (dx > 0 ? (R - cx) / dx : (L - cx) / dx);
    const tY = dy === 0 ? Infinity : (dy > 0 ? (B - cy) / dy : (T - cy) / dy);
    const tt = Math.min(tX, tY);
    const ex = cx + dx * tt;
    const ey = cy + dy * tt;
    const col = e.boss ? "#fbbf24" : e.elite ? "#c084fc" : "#fb7185";
    let size = e.boss ? 11 : e.elite ? 8 : 6;
    if (e.boss || e.elite) size *= 1 + 0.12 * Math.sin(t * 6);
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(ang);
    // soft halo
    const hg = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 2.2);
    hg.addColorStop(0, col);
    hg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(0, 0, size * 2.2, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = e.boss ? 14 : 10;
    // chevron arrow
    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.55, size * 0.72);
    ctx.lineTo(-size * 0.15, 0);
    ctx.lineTo(-size * 0.55, -size * 0.72);
    ctx.closePath();
    ctx.fill();
    // white tip
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(size * 0.75, 0);
    ctx.lineTo(size * 0.15, size * 0.22);
    ctx.lineTo(size * 0.15, -size * 0.22);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    n++;
  }
}

function drawEnemy(e) {
  const s = w2s(e.x, e.y);
  if (s.x < -80 || s.y < -80 || s.x > view.w + 80 || s.y > view.h + 80) return;
  const r = e.r * (e.flash > 0 ? 1.08 : 1);
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(0, r * 0.7, r * 0.9, r * 0.35, 0, 0, TAU);
  ctx.fill();
  const col = e.flash > 0 ? "#ffffff" : e.color;
  if (e.boss) {
    // rotating tick ring
    ctx.save();
    ctx.rotate(G.time * 0.8);
    ctx.strokeStyle = "rgba(251,191,36,0.55)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 8 + Math.sin(G.time * 3) * 2, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.strokeStyle = "rgba(253,230,138,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, r + 16, 0, TAU);
    ctx.stroke();
  }
  if (e.elite) {
    ctx.save();
    ctx.rotate(-G.time * 1.2);
    ctx.strokeStyle = "rgba(192,132,252,0.55)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r + 5, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  if (e.burn > 0) {
    ctx.fillStyle = "rgba(251,146,60,0.25)";
    ctx.beginPath();
    ctx.arc(0, 0, r + 3, 0, TAU);
    ctx.fill();
  }
  if (e.slowMul < 1) {
    ctx.strokeStyle = "rgba(125,211,252,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 2, 0, TAU);
    ctx.stroke();
  }
  ctx.fillStyle = col;
  ctx.strokeStyle = e.boss ? "#78350f" : e.elite ? "#4c1d95" : "rgba(0,0,0,0.55)";
  ctx.lineWidth = e.boss || e.elite ? 2.5 : 1.5;
  ctx.shadowColor = e.color;
  ctx.shadowBlur = e.boss ? 16 : e.elite ? 10 : 4;
  if (e.shape === "golem") {
    ctx.beginPath();
    const rr = r * 0.9;
    ctx.moveTo(-rr, -rr * 0.6); ctx.lineTo(rr, -rr * 0.8);
    ctx.lineTo(rr * 0.85, rr * 0.7); ctx.lineTo(-rr * 0.9, rr * 0.75);
    ctx.closePath(); ctx.fill(); ctx.stroke();
  } else if (e.shape === "ghost") {
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(0, -2, r * 0.85, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * 0.5, r * 0.4); ctx.quadraticCurveTo(0, r * 1.1, r * 0.5, r * 0.4); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (e.shape === "bat") {
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.3); ctx.lineTo(-r * 1.3, -r * 0.1); ctx.lineTo(-r * 0.4, r * 0.5);
    ctx.lineTo(0, r * 0.3); ctx.lineTo(r * 0.4, r * 0.5); ctx.lineTo(r * 1.3, -r * 0.1);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.7); ctx.lineTo(-r * 0.35, -r * 1.35); ctx.lineTo(-r * 0.1, -r * 0.7);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(r * 0.55, -r * 0.7); ctx.lineTo(r * 0.35, -r * 1.35); ctx.lineTo(r * 0.1, -r * 0.7);
    ctx.closePath(); ctx.fill();
  }
  // top light for 2.5D volume
  if (e.shape === "ghost") {
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, -2, r * 0.85, 0, TAU);
    ctx.clip();
    const gh = ctx.createLinearGradient(0, -r, 0, r * 0.4);
    gh.addColorStop(0, "rgba(255,255,255,0.28)");
    gh.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gh;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  } else if (e.shape !== "ghost") {
    ctx.save();
    if (e.shape === "golem") {
      const rr = r * 0.9;
      ctx.beginPath();
      ctx.moveTo(-rr, -rr * 0.6); ctx.lineTo(rr, -rr * 0.8);
      ctx.lineTo(rr * 0.85, rr * 0.7); ctx.lineTo(-rr * 0.9, rr * 0.75);
      ctx.closePath();
    } else if (e.shape === "bat") {
      ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU);
    } else {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU);
    }
    ctx.clip();
    const hl = ctx.createLinearGradient(0, -r, 0, r * 0.55);
    hl.addColorStop(0, "rgba(255,255,255,0.22)");
    hl.addColorStop(0.55, "rgba(255,255,255,0.04)");
    hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl;
    ctx.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
    ctx.restore();
  }
  ctx.fillStyle = e.boss || e.elite ? "#0a0e14" : "rgba(10,14,20,0.8)";
  ctx.beginPath();
  ctx.arc(-r * 0.3, -r * 0.1, r * 0.12, 0, TAU);
  ctx.arc(r * 0.3, -r * 0.1, r * 0.12, 0, TAU);
  ctx.fill();
  // glowing pupils
  const eyeGlow = e.boss ? "#fbbf24" : e.elite ? "#c084fc" : null;
  if (eyeGlow) {
    ctx.shadowColor = eyeGlow;
    ctx.shadowBlur = 8;
    ctx.fillStyle = eyeGlow;
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.1, r * 0.06, 0, TAU);
    ctx.arc(r * 0.3, -r * 0.1, r * 0.06, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = "rgba(251,146,60,0.55)";
    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.1, r * 0.05, 0, TAU);
    ctx.arc(r * 0.3, -r * 0.1, r * 0.05, 0, TAU);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
  if (e.hp < e.hpMax) {
    const bw = Math.max(r * 2, 28), bh = e.boss || e.elite ? 6 : 4;
    const bx = s.x - bw / 2, by = s.y - r - 12;
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.beginPath();
    ctx.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 3);
    ctx.fill();
    const hpCol = e.boss ? "#fbbf24" : e.elite ? "#c084fc" : "#f43f5e";
    ctx.fillStyle = hpCol;
    ctx.shadowColor = hpCol;
    ctx.shadowBlur = 6;
    const fillW = bw * clamp(e.hp / e.hpMax, 0, 1);
    ctx.beginPath();
    ctx.roundRect(bx, by, fillW, bh, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // shine strip on boss/elite bars
    if (e.boss || e.elite) {
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.fillRect(bx + 1, by + 1, Math.max(0, fillW - 2), Math.max(1, bh * 0.35));
    }
  }
  if (e.boss) {
    drawNameplate(s.x, s.y - r - 30, e.name, "gold");
  } else if (e.elite) {
    drawNameplate(s.x, s.y - r - 26, e.name, "violet");
  }
}

function drawNameplate(cx, cy, label, kind) {
  ctx.font = "700 11px 'Segoe UI', 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const tw = ctx.measureText(label).width;
  const pw = tw + 22;
  const ph = kind === "gold" ? 20 : 18;
  const px = cx - pw / 2;
  const py = cy - ph / 2;
  const gold = kind === "gold";
  ctx.fillStyle = gold ? "rgba(40,28,8,0.88)" : "rgba(30,16,48,0.85)";
  ctx.strokeStyle = gold ? "rgba(240,193,75,0.8)" : "rgba(192,132,252,0.75)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, ph / 2);
  ctx.fill();
  ctx.stroke();
  // top highlight strip
  ctx.fillStyle = gold ? "rgba(253,230,138,0.25)" : "rgba(233,213,255,0.2)";
  ctx.fillRect(px + 8, py + 1, pw - 16, 1);
  // side diamonds
  ctx.fillStyle = gold ? "#f0c14b" : "#c084fc";
  ctx.shadowColor = gold ? "#fbbf24" : "#a78bfa";
  ctx.shadowBlur = 6;
  const dy = py + ph / 2;
  ctx.beginPath();
  ctx.moveTo(px + 6, dy); ctx.lineTo(px + 9, dy - 3); ctx.lineTo(px + 12, dy); ctx.lineTo(px + 9, dy + 3);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(px + pw - 6, dy); ctx.lineTo(px + pw - 9, dy - 3); ctx.lineTo(px + pw - 12, dy); ctx.lineTo(px + pw - 9, dy + 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = gold ? "#fde68a" : "#e9d5ff";
  ctx.shadowColor = gold ? "#fbbf24" : "#a78bfa";
  ctx.shadowBlur = 8;
  ctx.fillText(label, cx, py + ph / 2);
  ctx.shadowBlur = 0;
}

function drawPickup(p) {
  const s = w2s(p.x, p.y);
  const bobY = Math.sin(p.bob) * 4;
  let col = "#5ce1e6";
  if (p.kind === "elite") col = "#c084fc";
  if (p.kind === "boss") col = "#fbbf24";

  ctx.save();
  // quality light pillar for elite/boss
  if (p.kind !== "orb") {
    const h = p.kind === "boss" ? 72 : 48;
    const w = p.kind === "boss" ? 18 : 12;
    const g = ctx.createLinearGradient(s.x, s.y + bobY - h, s.x, s.y + bobY);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.35, p.kind === "boss" ? "rgba(251,191,36,0.22)" : "rgba(192,132,252,0.2)");
    g.addColorStop(1, p.kind === "boss" ? "rgba(251,191,36,0.05)" : "rgba(192,132,252,0.05)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(s.x - w / 2, s.y + bobY);
    ctx.lineTo(s.x + w / 2, s.y + bobY);
    ctx.lineTo(s.x + w * 0.15, s.y + bobY - h);
    ctx.lineTo(s.x - w * 0.15, s.y + bobY - h);
    ctx.closePath();
    ctx.fill();
    // ground ring
    ctx.strokeStyle = p.kind === "boss" ? "rgba(251,191,36,0.45)" : "rgba(192,132,252,0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y + bobY + p.r * 0.6, p.r * 1.4, p.r * 0.45, 0, 0, TAU);
    ctx.stroke();
  }

  ctx.translate(s.x, s.y + bobY);
  // soft glow
  const gg = ctx.createRadialGradient(0, 0, 2, 0, 0, p.r * 2.4);
  gg.addColorStop(0, col);
  gg.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = gg;
  ctx.beginPath();
  ctx.arc(0, 0, p.r * 2.4, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;

  if (p.kind === "orb") {
    // faceted spirit gem
    const r = p.r * 1.15;
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.72, 0);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.72, 0);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.75);
    ctx.lineTo(r * 0.28, -r * 0.1);
    ctx.lineTo(-r * 0.28, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(196,241,255,0.7)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.fillStyle = col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  // inner facet
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.beginPath();
  ctx.arc(-p.r * 0.25, -p.r * 0.25, p.r * 0.28, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "rgba(10,14,20,0.45)";
  ctx.beginPath();
  ctx.arc(0, 0, p.r * 0.35, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawSlash(slash) {
  const s = w2s(slash.x, slash.y);
  const t = 1 - slash.life / slash.max;
  const expand = 0.7 + t * 0.35;
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(slash.ang);
  ctx.globalAlpha = 0.9 * (1 - t);
  // outer cyan arc
  ctx.strokeStyle = slash.color;
  ctx.lineWidth = 16 * (1 - t * 0.55);
  ctx.shadowColor = slash.color;
  ctx.shadowBlur = 22;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand, -slash.half, slash.half);
  ctx.stroke();
  // inner gold blade edge
  ctx.strokeStyle = "rgba(253,230,138,0.85)";
  ctx.lineWidth = 4 * (1 - t * 0.5);
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand * 0.92, -slash.half * 0.9, slash.half * 0.9);
  ctx.stroke();
  // shockwave ring
  ctx.globalAlpha = 0.35 * (1 - t);
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand * 1.15, 0, TAU);
  ctx.stroke();
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawParticle(p) {
  const s = w2s(p.x, p.y);
  const a = clamp(p.life / (p.max || 0.5), 0, 1);
  if (p.ring) {
    const t = 1 - a;
    const r = lerp(p.ring.r0, p.ring.r1, t);
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = a * 0.7;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  if (p.line) {
    const e = w2s(p.line.x, p.line.y);
    ctx.strokeStyle = p.color;
    ctx.globalAlpha = a;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    return;
  }
  ctx.globalAlpha = a;
  if (p.size >= 3) {
    const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, p.size * a * 2.2);
    gr.addColorStop(0, p.color);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.globalAlpha = a * 0.55;
    ctx.beginPath();
    ctx.arc(s.x, s.y, p.size * a * 2.2, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = a;
  }
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(s.x, s.y, p.size * a, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFloater(f) {
  const s = w2s(f.x, f.y);
  const a = clamp(f.life / 0.85, 0, 1);
  const rise = (1 - a) * 18;
  const pop = f.crit ? 1 + (1 - a) * 0.08 : 1;
  ctx.globalAlpha = a;
  ctx.font = `800 ${Math.round(f.size * pop)}px "Segoe UI", "PingFang SC", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(3, f.size * 0.22);
  ctx.strokeStyle = "rgba(5,8,12,0.88)";
  ctx.strokeText(f.text, s.x, s.y - rise);
  ctx.fillStyle = f.color;
  ctx.shadowColor = f.color;
  ctx.shadowBlur = f.crit ? 14 : 8;
  ctx.fillText(f.text, s.x, s.y - rise);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function drawBossBanner() {
  const a = clamp(G.bossBanner / 0.4, 0, 1);
  const t = 1 - clamp(G.bossBanner / 2.2, 0, 1);
  ctx.save();
  ctx.globalAlpha = a;
  // dark strip
  const gy = view.h * 0.28;
  const grad = ctx.createLinearGradient(0, gy, view.w, gy);
  grad.addColorStop(0, "rgba(40,20,8,0)");
  grad.addColorStop(0.5, "rgba(50,28,8,0.75)");
  grad.addColorStop(1, "rgba(40,20,8,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, gy, view.w, 56);
  // gold rules
  ctx.strokeStyle = "rgba(240,193,75,0.65)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(view.w * 0.12, gy + 4); ctx.lineTo(view.w * 0.88, gy + 4);
  ctx.moveTo(view.w * 0.12, gy + 52); ctx.lineTo(view.w * 0.88, gy + 52);
  ctx.stroke();
  // slide-in text
  const slide = t * 20;
  ctx.fillStyle = "#fde68a";
  ctx.font = "800 24px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 18;
  ctx.fillText("大 妖 来 袭", view.w / 2, gy + 28);
  ctx.shadowBlur = 0;
  ctx.restore();
  void slide;
}

function drawWaveBanner() {
  const a = clamp(G.waveBanner / 0.35, 0, 1);
  const slide = (1 - clamp(G.waveBanner / 1.4, 0, 1)) * 12;
  ctx.save();
  ctx.globalAlpha = a;
  const gy = view.h * 0.22 + slide;
  const grad = ctx.createLinearGradient(0, gy, view.w, gy);
  grad.addColorStop(0, "rgba(8,20,28,0)");
  grad.addColorStop(0.5, "rgba(8,28,36,0.62)");
  grad.addColorStop(1, "rgba(8,20,28,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, gy, view.w, 36);
  ctx.strokeStyle = "rgba(92,225,230,0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(view.w * 0.18, gy + 2); ctx.lineTo(view.w * 0.82, gy + 2);
  ctx.moveTo(view.w * 0.18, gy + 34); ctx.lineTo(view.w * 0.82, gy + 34);
  ctx.stroke();
  // side diamonds
  ctx.fillStyle = "rgba(92,225,230,0.7)";
  ctx.shadowColor = "#5ce1e6";
  ctx.shadowBlur = 8;
  const label = G.waveBannerText || `第 ${G.wave} 波`;
  ctx.font = "700 16px 'Segoe UI', 'Microsoft YaHei', sans-serif";
  const tw = ctx.measureText(label).width;
  const cxm = view.w / 2;
  const half = tw / 2 + 14;
  ctx.beginPath();
  ctx.moveTo(cxm - half, gy + 18); ctx.lineTo(cxm - half + 5, gy + 14);
  ctx.lineTo(cxm - half + 10, gy + 18); ctx.lineTo(cxm - half + 5, gy + 22);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cxm + half, gy + 18); ctx.lineTo(cxm + half - 5, gy + 14);
  ctx.lineTo(cxm + half - 10, gy + 18); ctx.lineTo(cxm + half - 5, gy + 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a5f3fc";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "#5ce1e6";
  ctx.shadowBlur = 12;
  ctx.fillText(label, view.w / 2, gy + 18);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ---------- UI: chars / shop ----------
function renderChars() {
  const selected = Meta.load().selectedChar || "sword";
  ui.charRow.innerHTML = "";
  for (const c of Object.values(CHARS)) {
    const btn = document.createElement("button");
    btn.className = "char-card" + (c.id === selected ? " selected" : "");
    btn.dataset.id = c.id;
    btn.innerHTML = `
      <img class="char-portrait" src="${c.portrait}" alt="${c.name}" draggable="false">
      <span class="char-emblem" aria-hidden="true">${c.icon}</span>
      <div class="char-meta">
        <span class="c-name">${c.name}</span>
        <span class="c-desc">${c.desc}</span>
      </div>`;
    btn.addEventListener("click", () => {
      const m = Meta.load();
      m.selectedChar = c.id;
      Meta.save(m);
      renderChars();
    });
    ui.charRow.appendChild(btn);
  }
}

function renderShop() {
  const m = Meta.load();
  ui.shopCoins.textContent = m.coins;
  ui.shopList.innerHTML = "";
  for (let idx = 0; idx < SHOP_DEFS.length; idx++) {
    const def = SHOP_DEFS[idx];
    const lv = m.shop[def.id] || 0;
    const cost = Math.floor(def.base * Math.pow(1.55, lv));
    const maxed = lv >= def.max;
    const row = document.createElement("div");
    row.className = "shop-item" + (maxed ? " maxed" : "");
    row.innerHTML = `
      <div class="shop-ico t-${def.tier || "gold"}">${def.ico}</div>
      <div><span class="s-name">${def.name}</span><span class="s-lv">Lv${lv}/${def.max}</span>
        <div class="s-pips">${Array.from({ length: def.max }, (_, i) => `<i class="${i < lv ? "on" : ""}"></i>`).join("")}</div>
      </div>
      <button class="shop-buy" ${maxed || m.coins < cost ? "disabled" : ""}>${maxed ? "✓ 满级" : "◆ " + cost}</button>
      <div class="s-desc">${def.desc}</div>`;
    row.style.animationDelay = `${idx * 0.05}s`;
    row.querySelector(".shop-buy").addEventListener("click", () => {
      const res = Meta.buy(def.id);
      toast(res.msg);
      if (res.ok) AudioSys.buy();
      renderShop();
      refreshMetaUI();
      if (res.ok) {
        const el = ui.shopList.children[idx];
        if (el) {
          el.classList.add("buy-flash");
          setTimeout(() => el.classList.remove("buy-flash"), 520);
        }
      }
    });
    ui.shopList.appendChild(row);
  }
}

function refreshMetaUI() {
  const m = Meta.load();
  G._metaCoinsCached = m.coins;
  ui.metaCoins.textContent = m.coins;
  ui.bestWave.textContent = m.bestWave;
  ui.bestCombo.textContent = m.bestCombo;
}

function setMenuBg(on) {
  document.getElementById("app").classList.toggle("show-menu-bg", !!on);
}

function showMenu() {
  G.state = "menu";
  releaseWakeLock();
  releaseJoystick();
  ui.hud.classList.add("hidden");
  ui.overScreen.classList.add("hidden");
  ui.shopScreen.classList.add("hidden");
  ui.levelModal.classList.add("hidden");
  ui.jobModal.classList.add("hidden");
  ui.pauseScreen.classList.add("hidden");
  ui.comboBadge.classList.add("hidden");
  ui.startScreen.classList.remove("hidden");
  setMenuBg(true);
  refreshMetaUI();
  renderChars();
}

// ---------- 暂停 / 全屏 / 屏幕常亮 / 触感 ----------
let wakeLock = null;

function vibe(ms) {
  try { if (!AudioSys.muted && navigator.vibrate) navigator.vibrate(ms); } catch (_) {}
}

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => { wakeLock = null; });
    }
  } catch (_) {}
}
function releaseWakeLock() {
  try { if (wakeLock) { wakeLock.release(); wakeLock = null; } } catch (_) {}
}

function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}
function syncFullscreenBtn() {
  if (!ui.btnFullscreen) return;
  const on = isFullscreen();
  ui.btnFullscreen.textContent = on ? "退出全屏" : "全屏";
  ui.btnFullscreen.classList.toggle("on", on);
}
function toggleFullscreen() {
  try {
    if (!isFullscreen()) {
      const el = document.documentElement;
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      if (req) {
        const p = req.call(el, { navigationUI: "hide" });
        if (p && p.catch) p.catch(() => {});
      } else {
        toast(isIOS ? "iPhone 请用「添加到主屏幕」全屏" : "浏览器不支持全屏");
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
    }
  } catch (_) {}
  setTimeout(syncFullscreenBtn, 400);
}

let _soundOn = true;
function syncSoundBtn() {
  if (!ui.btnSound) return;
  ui.btnSound.textContent = _soundOn ? "音效 开" : "音效 关";
  ui.btnSound.classList.toggle("on", _soundOn);
}

function togglePause() {
  if (G.state === "play") {
    G.state = "pause";
    releaseJoystick();
    ui.pauseScreen.classList.remove("hidden");
    ui.comboBadge.classList.add("hidden");
    releaseWakeLock();
  } else if (G.state === "pause") {
    resumeGame();
  }
}
function resumeGame() {
  if (G.state !== "pause") return;
  ui.pauseScreen.classList.add("hidden");
  G.state = "play";
  last = performance.now();
  AudioSys.resume();
  requestWakeLock();
}

// ---------- Loop ----------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  Quality.sample(dt);
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

ui.btnStart.addEventListener("click", () => {
  requestWakeLock();
  startRun(Meta.load().selectedChar);
});
ui.btnRetry.addEventListener("click", () => {
  requestWakeLock();
  startRun(Meta.load().selectedChar);
});
ui.btnHome.addEventListener("click", showMenu);
ui.btnShop.addEventListener("click", () => {
  G.state = "shop";
  setMenuBg(true);
  ui.startScreen.classList.add("hidden");
  ui.shopScreen.classList.remove("hidden");
  renderShop();
});
ui.btnShopBack.addEventListener("click", () => {
  ui.shopScreen.classList.add("hidden");
  showMenu();
});
ui.btnResume.addEventListener("click", resumeGame);
ui.btnPauseHome.addEventListener("click", () => {
  ui.pauseScreen.classList.add("hidden");
  showMenu();
});
ui.btnFullscreen.addEventListener("click", toggleFullscreen);
ui.btnSound.addEventListener("click", () => {
  _soundOn = !_soundOn;
  AudioSys.muted = !_soundOn;
  if (_soundOn) { AudioSys.init(); AudioSys.buy(); }
  syncSoundBtn();
  try { localStorage.setItem("xuantianjie_sound", _soundOn ? "1" : "0"); } catch (_) {}
});

const castOrVibe = (idx) => (e) => {
  e.preventDefault();
  AudioSys.init();
  vibe(10);
  castSkill(idx);
};
ui.btnSkill1.addEventListener("pointerdown", castOrVibe(0));
ui.btnSkill2.addEventListener("pointerdown", castOrVibe(1));

// 移动端：后台自动暂停 + 恢复音频
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (G.state === "play") togglePause();
  } else {
    AudioSys.resume();
    last = performance.now();
    if (G.state === "play") requestWakeLock();
  }
});
window.addEventListener("pagehide", () => { if (G.state === "play") togglePause(); });
window.addEventListener("blur", () => { AudioSys.resume(); });

// 移动端：禁止长按菜单 / 双击缩放（不影响按钮点击）
window.addEventListener("contextmenu", (e) => e.preventDefault());
let _lastTouchEnd = 0;
document.addEventListener("touchend", (e) => {
  const now = Date.now();
  const interactive = e.target && e.target.closest &&
    e.target.closest("button, a, input, .modal, .screen, .shop-list, .choices");
  if (now - _lastTouchEnd < 320 && !interactive) e.preventDefault();
  _lastTouchEnd = now;
}, { passive: false });

// ---------- Boot ----------
Quality.detect();
bindJoystick();
syncFullscreenBtn();
try {
  const s = localStorage.getItem("xuantianjie_sound");
  if (s === "0") { _soundOn = false; AudioSys.muted = true; }
} catch (_) {}
syncSoundBtn();
resize();
showMenu();
document.addEventListener("fullscreenchange", syncFullscreenBtn);
document.addEventListener("webkitfullscreenchange", syncFullscreenBtn);

if ("serviceWorker" in navigator && location.protocol === "https:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

requestAnimationFrame(frame);
window.G = G;
window.Meta = Meta;
window.Quality = Quality;
// 调试/无头测试钩子（无副作用）
window.__XTJ__ = {
  openLevelUp, openJobModal, jobSyncHud, shouldOfferJob, buildUpgradePool, rollUpgrades, gainXP,
  JOB_PATHS, JOB_LEVELS, JOB_STAGES, NODE_HOLD,
};
})();
