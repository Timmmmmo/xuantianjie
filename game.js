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
  waveText: $("waveText"), waveElem: $("waveElem"), killText: $("killText"), timeText: $("timeText"),
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
  beastHud: $("beastHud"), beastHudIco: $("beastHudIco"), beastHudName: $("beastHudName"),
  relicRow: $("relicRow"),
  codexScreen: $("codexScreen"), codexProgress: $("codexProgress"),
  codexArtifacts: $("codexArtifacts"), codexBeasts: $("codexBeasts"),
  btnCodex: $("btnCodex"), btnCodexBack: $("btnCodexBack"),
  // 炼宝台
  stoneRow: $("stoneRow"), forgeBtn: $("forgeBtn"), forgeBtnCount: $("forgeBtnCount"),
  forgeModal: $("forgeModal"), forgeStones: $("forgeStones"),
  forgeGemCount: $("forgeGemCount"),
  forgeGems: $("forgeGems"),
  forgeEquip: $("forgeEquip"), forgeEquipCount: $("forgeEquipCount"),
  forgeMelt: $("forgeMelt"), forgeMeltWrap: $("forgeMeltWrap"),
  btnForgeClose: $("btnForgeClose"),
  forgeResonance: $("forgeResonance"),
  forgeCores: $("forgeCores"),
  resHud: $("resHud"), resHudList: $("resHudList"),
  coreHud: $("coreHud"), coreHudList: $("coreHudList"),
  // 背包 v3.0
  invBtn: $("invBtn"), invBtnCount: $("invBtnCount"),
  invModal: $("invModal"), invGrid: $("invGrid"), invDetail: $("invDetail"),
  invSlotWeapon: $("invSlotWeapon"), invSlotArmor: $("invSlotArmor"), invSlotAccessory: $("invSlotAccessory"),
  invSlotStone: $("invSlotStone"),   // v5.0 灵石槽位
  btnInvClose: $("btnInvClose"),
  // v5.0 PM 视角：目标进度条 / 大字报 / 教程
  goalBar: $("goalBar"), goalIco: $("goalIco"), goalText: $("goalText"), goalFill: $("goalFill"), goalDetail: $("goalDetail"),
  bigBanner: $("bigBanner"), bigBannerSub: $("bigBannerSub"), bigBannerText: $("bigBannerText"),
  tutOverlay: $("tutOverlay"), tutCard: $("tutCard"), tutStepNum: $("tutStepNum"), tutStepTotal: $("tutStepTotal"),
  tutTitle: $("tutTitle"), tutBody: $("tutBody"), tutTip: $("tutTip"), tutNext: $("tutNext"),
  // v6.0 B 词条联动 HUD / C 祭坛赌注
  synHud: $("synHud"), synHudList: $("synHudList"), synHudCount: $("synHudCount"),
  altarModal: $("altarModal"), altarChoices: $("altarChoices"), btnAltarSkip: $("btnAltarSkip"),
  // v7.0 A 合击 / B 尸潮 / C 狂血
  fusionHud: $("fusionHud"),
  hordeBar: $("hordeBar"), hordeFill: $("hordeFill"), hordeText: $("hordeText"),
  frenzyHud: $("frenzyHud"),
  // v7.4 玄铁试炼桩（伤害测试者）
  trialHud: $("trialHud"), trialName: $("trialName"), trialTimer: $("trialTimer"),
  trialFill: $("trialFill"), trialDealt: $("trialDealt"), trialDps: $("trialDps"), trialPct: $("trialPct"),
  trialTicks: $("trialTicks"),   // v7.6 里程碑刻度
  autoNote: $("autoNote"),       // v7.6 悟道便签容器
  // v7.5 攻击能力评定卡
  trialCard: $("trialCard"), tcSub: $("tcSub"), tcRank: $("tcRank"), tcRankName: $("tcRankName"),
  tcDps: $("tcDps"), tcDealt: $("tcDealt"), tcTime: $("tcTime"), tcPct: $("tcPct"),
  tcComment: $("tcComment"), tcTip: $("tcTip"),
  // 方环试炼
  btnModeSquare: $("btnModeSquare"), btnModeEndless: $("btnModeEndless"),
  squareHud: $("squareHud"), pressureBar: $("pressureBar"), pressureText: $("pressureText"),
  stanceWind: $("stanceWind"), stanceRain: $("stanceRain"),
  stanceThunder: $("stanceThunder"), stanceBolt: $("stanceBolt"),
  btnSquareUlt: $("btnSquareUlt"), squareUltName: $("squareUltName"), squareUltPct: $("squareUltPct"),
};

// ---------- 局内精灵图（位图，失败回退几何） ----------
const ArtSprites = {
  ready: false,
  img: {},
  load() {
    const map = {
      "player-sword": "assets/sprites/player-sword.png",
      "player-mage": "assets/sprites/player-mage.png",
      "player-body": "assets/sprites/player-body.png",
      fox: "assets/sprites/enemy-fox.png",
      wolf: "assets/sprites/enemy-wolf.png",
      golem: "assets/sprites/enemy-golem.png",
      ghost: "assets/sprites/enemy-ghost.png",
      bat: "assets/sprites/enemy-bat.png",
      moth: "assets/sprites/enemy-moth.png",
      dust: "assets/sprites/enemy-dust.png",
      spring: "assets/sprites/prop-spring.png",
      swordtomb: "assets/sprites/prop-swordtomb.png",
    };
    for (const k in map) {
      try {
        const im = new Image();
        im.src = map[k];
        this.img[k] = im;
      } catch (_) {}
    }
    try {
      const bg = new Image();
      bg.src = "assets/bg-arena.png";
      this.img.arena = bg;
    } catch (_) {}
    this.ready = true;
  },
  ok(id) {
    const im = this.img[id];
    return !!(im && im.complete && im.naturalWidth > 0);
  },
  draw(id, x, y, size, flipX, scaleX, scaleY) {
    const im = this.img[id];
    if (!im || !im.complete || im.naturalWidth <= 0) return false;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size) || size <= 0) return false;
    const sx = Number.isFinite(scaleX) && scaleX > 0 ? scaleX : 1;
    const sy = Number.isFinite(scaleY) && scaleY > 0 ? scaleY : 1;
    try {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flipX ? -sx : sx, sy);
      ctx.drawImage(im, -size / 2, -size / 2, size, size);
      ctx.restore();
      return true;
    } catch (_) {
      try { ctx.restore(); } catch (_) {}
      return false;
    }
  },
};
try { ArtSprites.load(); } catch (_) {}

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
const randInt = (a, b) => Math.floor(rand(a, b));
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
const META_KEY = "xuantianjie_meta_v3";
const META_KEY_LEGACY = "xuantianjie_meta_v2";
const SHOP_DEFS = [
  { id: "atk", name: "锋锐灵纹", desc: "开局攻击 +6%/级", max: 10, base: 40, ico: "锐", tier: "cyan", apply: (s) => { s.atkMul += 0.06; } },
  { id: "hp", name: "厚土诀", desc: "开局生命 +8/级", max: 10, base: 35, ico: "体", tier: "green", apply: (s) => { s.hpBonus += 8; } },
  { id: "spd", name: "清风步", desc: "开局移速 +3%/级", max: 8, base: 45, ico: "疾", tier: "cyan", apply: (s) => { s.spdMul += 0.03; } },
  { id: "xp", name: "悟性", desc: "经验 +5%/级", max: 8, base: 50, ico: "悟", tier: "violet", apply: (s) => { s.xpMul += 0.05; } },
  { id: "coin", name: "聚灵玉", desc: "灵石获取 +8%/级", max: 5, base: 80, ico: "玉", tier: "gold", apply: (s) => { s.coinMul += 0.08; } },
  { id: "sword", name: "剑胚", desc: "开局飞剑更利", max: 5, base: 60, ico: "剑", tier: "cyan", apply: (s) => { s.swordBonus += 1; } },
  { id: "luck", name: "机缘", desc: "升级更易出稀有项", max: 5, base: 70, ico: "缘", tier: "gold", apply: (s) => { s.luck += 1; } },
];

function emptyDailyMeta() {
  return {
    date: "",
    progress: { wave5: 0, combo: 0, arms: 0 },
    granted: { wave5: false, combo: false, arms: false, all: false },
  };
}
function emptySigninMeta() {
  return { nextDay: 1, lastClaimDate: "", claims: 0 };
}
function normalizeMetaDraft(d) {
  const src = d || {};
  const daily = { ...emptyDailyMeta(), ...(src.daily || {}) };
  daily.progress = { ...emptyDailyMeta().progress, ...((src.daily && src.daily.progress) || {}) };
  daily.granted = { ...emptyDailyMeta().granted, ...((src.daily && src.daily.granted) || {}) };
  const signin = { ...emptySigninMeta(), ...(src.signin || {}) };
  let nd = Number(signin.nextDay) || 1;
  if (nd < 1 || nd > 7) nd = 1;
  signin.nextDay = nd;
  const codex = src.codex && typeof src.codex === "object"
    ? {
        artifacts: { ...(src.codex.artifacts || {}) },
        beasts: { ...(src.codex.beasts || {}) },
      }
    : { artifacts: {}, beasts: {} };
  return {
    coins: src.coins || 0,
    bestWave: src.bestWave || 0,
    bestKills: src.bestKills || 0,
    bestTime: src.bestTime || 0,
    bestCombo: src.bestCombo || 0,
    shop: src.shop || {},
    selectedChar: src.selectedChar || "sword",
    codex,
    contract: src.contract || null,
    daily,
    signin,
    tutorialDone: !!src.tutorialDone,
    modeStats: src.modeStats || { quickWins: 0, endlessBestWave: 0 },
    lastMode: src.lastMode || "endless",
    squareLoop: {
      bestClearSec: (src.squareLoop && Number(src.squareLoop.bestClearSec)) || 0,
      pressurePeak: (src.squareLoop && Number(src.squareLoop.pressurePeak)) || 0,
      bestClears: (src.squareLoop && Number(src.squareLoop.bestClears)) || 0,
    },
    premium: {
      noAds: !!(src.premium && src.premium.noAds),
      skins: (src.premium && src.premium.skins) || [],
    },
    adUsage: src.adUsage && typeof src.adUsage === "object"
      ? { ...src.adUsage }
      : { date: "", settle_double: 0, daily_refresh: 0 },
    weekly: src.weekly && typeof src.weekly === "object"
      ? { ...src.weekly, history: (src.weekly.history || []).slice(0, 4) }
      : null,
    treasures: Array.isArray(src.treasures) ? src.treasures.slice(0, 40) : [],
    version: 3,
  };
}
function readMetaRaw() {
  try {
    const parse = (k) => {
      const raw = localStorage.getItem(k);
      if (!raw) return null;
      return JSON.parse(raw) || null;
    };
    const v3 = parse(META_KEY);
    const v2 = parse(META_KEY_LEGACY);
    if (v3 && v2) {
      // 双键深合并：v2 的图鉴/契约不得因 Sprint B 写过 v3 而丢失
      return {
        ...v2,
        ...v3,
        shop: { ...(v2.shop || {}), ...(v3.shop || {}) },
        coins: (v3.coins != null ? v3.coins : v2.coins) || 0,
        bestWave: Math.max(v2.bestWave || 0, v3.bestWave || 0),
        bestKills: Math.max(v2.bestKills || 0, v3.bestKills || 0),
        bestTime: Math.max(v2.bestTime || 0, v3.bestTime || 0),
        bestCombo: Math.max(v2.bestCombo || 0, v3.bestCombo || 0),
        selectedChar: v3.selectedChar || v2.selectedChar || "sword",
        codex: {
          artifacts: { ...((v2.codex && v2.codex.artifacts) || {}), ...((v3.codex && v3.codex.artifacts) || {}) },
          beasts: { ...((v2.codex && v2.codex.beasts) || {}), ...((v3.codex && v3.codex.beasts) || {}) },
        },
        contract: v3.contract != null ? v3.contract : (v2.contract || null),
        daily: v3.daily || v2.daily,
        signin: v3.signin || v2.signin,
        weekly: v3.weekly || v2.weekly || null,
        premium: v3.premium || v2.premium,
        adUsage: v3.adUsage || v2.adUsage,
        tutorialDone: !!(v3.tutorialDone || v2.tutorialDone),
      };
    }
    return v3 || v2 || {};
  } catch (_) {}
  return {};
}

const Meta = {
  key: META_KEY,
  load() {
    try {
      const merged = normalizeMetaDraft(readMetaRaw());
      // 双键合并后回写 v3，避免每次 load 重复合并
      try {
        const hasV2 = !!localStorage.getItem(META_KEY_LEGACY);
        const hasV3 = !!localStorage.getItem(META_KEY);
        if (hasV2 || !hasV3) this.save(merged);
      } catch (_) {}
      return merged;
    } catch (_) {
      return normalizeMetaDraft({});
    }
  },
  save(d) {
    try {
      const payload = normalizeMetaDraft(d);
      localStorage.setItem(META_KEY, JSON.stringify(payload));
    } catch (_) {}
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
    d.modeStats = d.modeStats || { quickWins: 0, endlessBestWave: 0 };
    d.modeStats.endlessBestWave = Math.max(d.modeStats.endlessBestWave || 0, wave);
    this.save(d);
    return d;
  },
  setTutorialDone() {
    const d = this.load();
    d.tutorialDone = true;
    this.save(d);
    return d;
  },
  // ---- 图鉴 ----
  recordArtifact(id) {
    const d = this.load();
    d.codex.artifacts[id] = (d.codex.artifacts[id] || 0) + 1;
    this.save(d);
    return d;
  },
  recordBeast(id) {
    const d = this.load();
    d.codex.beasts[id] = (d.codex.beasts[id] || 0) + 1;
    this.save(d);
    return d;
  },
  codexStats() {
    const d = this.load();
    return {
      art: Object.keys(d.codex.artifacts).length,
      beast: Object.keys(d.codex.beasts).length,
      artTotal: ARTIFACTS.length,
      beastTotal: BEASTS.length,
    };
  },
  beastUnlocked(id) {
    const def = BEAST_BY_ID[id];
    if (!def) return false;
    const d = this.load();
    if (d.codex.beasts[id]) return true;
    const u = def.unlock;
    if (u.type === "wave") return d.bestWave >= u.need;
    if (u.type === "kills") return d.bestKills >= u.need;
    if (u.type === "relic") return Object.keys(d.codex.artifacts).length >= u.need;
    return false;
  },
  toggleContract(id) {
    const d = this.load();
    d.contract = d.contract === id ? null : id;
    if (d.contract) d.codex.beasts[id] = (d.codex.beasts[id] || 0) + 1;
    this.save(d);
    return d.contract;
  },
};

// ---------- Characters ----------
const CHARS = {
  sword: { id: "sword", name: "剑修", icon: "剑", desc: "飞剑+1 攻+25% 体稍弱", portrait: "assets/char-sword.png" },
  mage: { id: "mage", name: "法修", icon: "法", desc: "灵力充沛 技能冷却-20%", portrait: "assets/char-mage.png" },
  body: { id: "body", name: "体修", icon: "体", desc: "气血厚 受击反伤 移速稍慢", portrait: "assets/char-body.png" },
};

// ---------- 法宝 & 灵兽（图鉴收藏） ----------
const TIER_KEY = { 凡: "fan", 灵: "ling", 宝: "bao", 仙: "xian" };

// 法宝：局内由「法宝匣」开出，拾取即永久收录进图鉴
const ARTIFACTS = [
  { id: "qingfeng", name: "青锋剑匣", ico: "锋", tier: "凡", color: "#7dd3fc",
    desc: "飞剑 +1 · 攻击 +12%",
    apply: () => { G.swordCount += 1; G.atk *= 1.12; } },
  { id: "xuanjia", name: "玄武宝甲", ico: "甲", tier: "凡", color: "#86efac",
    desc: "护盾上限 +25 · 立即获得 40 护盾",
    apply: () => { G.shieldMax += 25; G.shield += 40; } },
  { id: "huoling", name: "火灵珠", ico: "焰", tier: "灵", color: "#fb923c",
    desc: "攻击 +18% · 灼烧伤害翻倍",
    apply: () => { G.atk *= 1.18; G.burnMul = (G.burnMul || 1) * 2; } },
  { id: "leiyin", name: "雷音铃", ico: "雷", tier: "灵", color: "#c084fc",
    desc: "飞剑攻速 +20% · 击杀有 12% 概率落雷",
    apply: () => { G.atkSpeed *= 1.2; G.thunderProc = (G.thunderProc || 0) + 0.12; } },
  { id: "hanshui", name: "寒水镜", ico: "镜", tier: "灵", color: "#93c5fd",
    desc: "暴击率 +12% · 暴击伤害 +40%",
    apply: () => { G.crit = Math.min(0.7, G.crit + 0.12); G.critMul += 0.4; } },
  { id: "juling", name: "聚灵幡", ico: "幡", tier: "宝", color: "#5ce1e6",
    desc: "经验 +30% · 灵力回复 +2/s",
    apply: () => { G.xpMul *= 1.3; G.mpRegen += 2; } },
  { id: "xueyu", name: "血玉葫芦", ico: "玉", tier: "宝", color: "#f87171",
    desc: "击杀吸血 +3 · 气血上限 +50 并回复",
    apply: () => { G.lifesteal += 3; G.hpMax += 50; G.hp = Math.min(G.hpMax, G.hp + 50); } },
  { id: "tianji", name: "天机盘", ico: "机", tier: "仙", color: "#f0c14b",
    desc: "攻击 / 攻速 / 移速 +10% · 暴击率 +6%",
    apply: () => { G.atk *= 1.1; G.atkSpeed *= 1.1; G.moveSpeed *= 1.1; G.crit = Math.min(0.7, G.crit + 0.06); } },
];
const ARTIFACT_BY_ID = Object.fromEntries(ARTIFACTS.map((a) => [a.id, a]));
const MAX_RELICS = 5;          // 单局法宝携带上限，满则化为护盾气血

// 灵兽：图鉴条件达成后可「契约」，每局带 1 只，跟随作战
const BEASTS = [
  { id: "qingluan", name: "青鸾", ico: "鸾", tier: "凡", color: "#7dd3fc", kind: "bolt",
    desc: "周期射出穿云风刃，命中最近敌及其后方",
    unlock: { type: "wave", need: 5, text: "单局撑过第 5 波" },
    cd: 1.15, mul: 0.85, pierce: 2 },
  { id: "xuangui", name: "玄龟", ico: "龟", tier: "凡", color: "#86efac", kind: "ward",
    desc: "每 6s 为你生出一层护盾",
    unlock: { type: "kills", need: 300, text: "累计斩妖 300" },
    cd: 6, shield: 22 },
  { id: "huoqilin", name: "火麒麟", ico: "麟", tier: "灵", color: "#fb923c", kind: "aura",
    desc: "身周烈焰环绕，持续灼烧靠近的妖物",
    unlock: { type: "wave", need: 10, text: "单局撑过第 10 波" },
    cd: 0.5, radius: 86, mul: 0.5, burn: true },
  { id: "leipeng", name: "雷鹏", ico: "鹏", tier: "灵", color: "#c084fc", kind: "nova",
    desc: "周期引落天雷，重创身周群妖",
    unlock: { type: "wave", need: 15, text: "单局撑过第 15 波" },
    cd: 2.6, radius: 150, mul: 1.6 },
  { id: "baize", name: "白泽", ico: "泽", tier: "宝", color: "#5ce1e6", kind: "ward",
    desc: "周期回复气血灵力，并让经验 +15%",
    unlock: { type: "relic", need: 6, text: "图鉴收录 6 件法宝" },
    cd: 5, heal: 0.06, mp: 8, xpMul: 0.15 },
  { id: "zhulong", name: "烛龙", ico: "烛", tier: "仙", color: "#f0c14b", kind: "nova",
    desc: "真龙吐息，横扫大范围妖潮",
    unlock: { type: "wave", need: 25, text: "单局撑过第 25 波" },
    cd: 3.4, radius: 230, mul: 2.6 },
];
const BEAST_BY_ID = Object.fromEntries(BEASTS.map((b) => [b.id, b]));

// ---------- 角色专属灵石 & 流派宝石 ----------
// 灵感取自「人族无敌RPG」的装备合成：灵石是**角色绑定的有限资源**，
// 每个角色三系，各由一种专属灵石主导。攒够同一系的主石，按配方凝出
// 「流派宝石」——属性与技能大增，甚至长出特殊攻击效果；
// 若图快，也可花两颗任意灵石换「通用装备」，那就只有普通攻击效果。
// 槽位只有两个 ⇒ 三条路只能取其二，这是本系统的核心取舍。
const ELEMENTS = [
  { key: "jin", name: "金", ico: "锐", color: "#f1e9d2", attrs: "锋锐" },
  { key: "mu", name: "木", ico: "生", color: "#86efac", attrs: "生发" },
  { key: "shui", name: "水", ico: "寒", color: "#93c5fd", attrs: "寒凝" },
  { key: "huo", name: "火", ico: "焚", color: "#fb923c", attrs: "焚灼" },
  { key: "tu", name: "土", ico: "坚", color: "#d6a86a", attrs: "坚壁" },
];
const ELEM_BY_KEY = Object.fromEntries(ELEMENTS.map((e) => [e.key, e]));
const ELEM_KEYS = ELEMENTS.map((e) => e.key);

// 每派系 3 颗灵石 ——「着力收集所属派系」的资源池
// school 字段表示派系归属；randStone() 按"本角色三派系权重 ×3"加权采样
const CHAR_STONES = {
  sword: [
    { key: "chifeng",    name: "赤锋石", ico: "锋", elem: "huo",  color: "#fb923c", attrs: "剑罡", school: "赤锋" },
    { key: "fengren",    name: "锋刃石", ico: "刃", elem: "huo",  color: "#f97316", attrs: "锋锐", school: "赤锋" },
    { key: "lieyan",     name: "烈焰石", ico: "焰", elem: "huo",  color: "#ef4444", attrs: "炽焰", school: "赤锋" },
    { key: "jifeng",     name: "疾风石", ico: "疾", elem: "mu",   color: "#86efac", attrs: "御风", school: "疾风" },
    { key: "chuanyun",   name: "穿云石", ico: "穿", elem: "mu",   color: "#a7f3d0", attrs: "穿云", school: "疾风" },
    { key: "cuiye",      name: "翠叶石", ico: "翠", elem: "mu",   color: "#4ade80", attrs: "青木", school: "疾风" },
    { key: "xuesha",     name: "血煞石", ico: "煞", elem: "jin",  color: "#e2c9a0", attrs: "血煞", school: "血煞" },
    { key: "baigu",      name: "白骨石", ico: "骨", elem: "jin",  color: "#d6d3d1", attrs: "白骨", school: "血煞" },
    { key: "suijin",     name: "碎金石", ico: "碎", elem: "jin",  color: "#facc15", attrs: "碎金", school: "血煞" },
  ],
  mage: [
    { key: "leiling",    name: "雷灵石", ico: "雷", elem: "jin",  color: "#e2c9a0", attrs: "雷霆", school: "雷灵" },
    { key: "tianlei",    name: "天雷石", ico: "天", elem: "jin",  color: "#fef08a", attrs: "天威", school: "雷灵" },
    { key: "jinlei",     name: "金雷石", ico: "金", elem: "jin",  color: "#fde68a", attrs: "金雷", school: "雷灵" },
    { key: "shuangjing", name: "霜晶石", ico: "霜", elem: "shui", color: "#93c5fd", attrs: "玄冰", school: "霜晶" },
    { key: "bingpo",     name: "冰魄石", ico: "魄", elem: "shui", color: "#bae6fd", attrs: "冰魄", school: "霜晶" },
    { key: "xuanshui",   name: "玄水石", ico: "玄", elem: "shui", color: "#7dd3fc", attrs: "玄水", school: "霜晶" },
    { key: "fentianshi", name: "焚天石", ico: "焚", elem: "huo",  color: "#fb923c", attrs: "焚天", school: "焚天" },
    { key: "zhuque",     name: "朱雀石", ico: "雀", elem: "huo",  color: "#f87171", attrs: "朱雀", school: "焚天" },
    { key: "lihuo",      name: "离火石", ico: "离", elem: "huo",  color: "#fbbf24", attrs: "离火", school: "焚天" },
  ],
  body: [
    { key: "xuantie",    name: "玄铁石", ico: "铁", elem: "jin",  color: "#e2c9a0", attrs: "铁骨", school: "玄铁" },
    { key: "gengjin",    name: "庚金石", ico: "庚", elem: "jin",  color: "#e5e7eb", attrs: "庚金", school: "玄铁" },
    { key: "yuntie",     name: "陨铁石", ico: "陨", elem: "jin",  color: "#94a3b8", attrs: "陨铁", school: "玄铁" },
    { key: "longxue",    name: "龙血石", ico: "龙", elem: "huo",  color: "#f87171", attrs: "龙血", school: "龙血" },
    { key: "zhulong",    name: "朱龙石", ico: "朱", elem: "huo",  color: "#ef4444", attrs: "朱龙", school: "龙血" },
    { key: "yanxue",     name: "炎血石", ico: "炎", elem: "huo",  color: "#fbbf24", attrs: "炎血", school: "龙血" },
    { key: "panshishi",  name: "磐石石", ico: "磐", elem: "tu",   color: "#d6a86a", attrs: "磐石", school: "磐石" },
    { key: "houtu",      name: "厚土石", ico: "厚", elem: "tu",   color: "#a3a380", attrs: "厚土", school: "磐石" },
    { key: "kunyuan",    name: "坤元石", ico: "坤", elem: "tu",   color: "#b08968", attrs: "坤元", school: "磐石" },
  ],
};
const STONE_BY_KEY = {};
const STONES_ALL = [];   // 全部 27 颗
for (const cid in CHAR_STONES) {
  for (const st of CHAR_STONES[cid]) {
    STONE_BY_KEY[st.key] = st;
    STONES_ALL.push(st);
  }
}
const STONE_BY_SCHOOL = {};   // school → [stone...]
for (const st of STONES_ALL) {
  (STONE_BY_SCHOOL[st.school] = STONE_BY_SCHOOL[st.school] || []).push(st);
}
const SCHOOLS_ALL = Object.keys(STONE_BY_SCHOOL);   // 9 个派系

const ORDINARY_COST = 2;    // 保留常量（兼容测试引用，无副作用）
const MAX_ORDINARY = 3;     // 保留常量（兼容测试引用）
const MAX_GEMS = 2;         // 流派宝石的槽位 —— 三系只能取其二
const INVENTORY_MAX = 30;   // 背包容量
const EQUIP_SLOTS_MAX = 3;  // 装备槽位上限（武器/防具/饰品）
const MAX_SCHOOL_CORES = 2; // 派系核心的装备槽位 —— 9 个核心只能同时装 2 个
const CORE_NEED_STONES = 5; // 解锁一个派系核心所需的同派系灵石数
// v5.0 PM 视角常量
const PURITY_BONUS = 0.30;        // 3 件同派系纯度 100% 时,所有数值词条 ×1.30
const PURITY_PARTIAL = 0.10;      // 2 件同派系纯度 ~66% 时 ×1.10
const STONE_SLOT_BONUS = 0.30;    // 灵石槽装该派系灵石 → 该派系词条效果 ×1.30
const BOSS_PURPLE_DROP = 1;       // 妖王必掉 1 件本派系紫装

// —— 合成逻辑：三阶配方，越往上越贵，也越强 ——
// 主石决定是哪一系宝石，配料（任意本角色灵石）决定能否升阶。
const GEM_TIERS = [
  { rank: 1, label: "初凝", main: 2, any: 0, desc: "属性大增" },
  { rank: 2, label: "化形", main: 2, any: 1, desc: "属性 + 技能增益" },
  { rank: 3, label: "圆满", main: 3, any: 2, desc: "再长出特殊攻击效果" },
];

// —— 经济调参（手感校准集中在这里）——
// 10 分钟目标：1 个派系核心（约 5 颗同派系）+ 1 颗流派宝石 + 余量做通用/淬体
const DROP_MOB = 0.008;     // 小妖掉灵石概率（v2.0 提高）
const DROP_ELITE = 0.3;     // 精英 30% 额外掉 1 颗
const DROP_BOSS = 3;        // 妖王必掉 3 颗（v2.0 提高：凑派系核心）
const ESSENCE_GAIN = 3;     // 灵石精魄择一所得颗数（v2.0 提高到 3）
const MELT_COST = 2;        // 灵石淬体：宝石与通用皆满后，2 颗任意灵石的去处
const SCH_PACK_DROP = 0.05; // 5% 概率掉「派系包」= 5 颗同派系（v2.0 新增，直接凑满核心）
// v3.0 装备掉落
const DROP_EQ_MOB    = 0.05;  // 小妖 5% 掉白装
const DROP_EQ_ELITE_W = 0.3;  // 精英 30% 掉白
const DROP_EQ_ELITE_G = 0.1;  // 精英 10% 掉绿
const DROP_EQ_BOSS_W_MIN = 3;
const DROP_EQ_BOSS_W_MAX = 5;
const DROP_EQ_BOSS_G = 0.5;   // 妖王 50% 掉绿 1-2 件
const DROP_EQ_BOSS_B = 0.05;  // 妖王 5% 掉蓝
const DROP_EQ_BOSS_O = 0.01;  // 妖王 1% 极小概率掉橙（欧皇专用）

// 流派宝石：每角色三颗，各由一种专属灵石（主石）主导
// apply(rank) 只施加「该阶新增」的那一份，逐阶调用即自然叠加
const GEMS = [
  // ---- 剑修 ----
  { id: "gem_jiangang", char: "sword", stone: "chifeng", elem: "huo", name: "裂天剑罡", ico: "罡",
    color: "#fb923c", school: "剑罡流",
    tierText: ["飞剑穿透 +1 · 攻击 +10%", "剑气范围 +25% · 剑气冷却 -15%", "飞剑 +1 · 命中溅射剑气（40% 伤害）"],
    apply: (r) => {
      if (r === 1) { G.swordPierce += 1; G.atk *= 1.1; }
      else if (r === 2) { G.aoeRange *= 1.25; G.aoeCD *= 0.85; }
      else { G.swordCount += 1; G.gemFx.cleave = 0.4; }
    } },
  { id: "gem_yufeng", char: "sword", stone: "jifeng", elem: "mu", name: "流云御风", ico: "云",
    color: "#86efac", school: "御风流",
    tierText: ["攻速 +12% · 移速 +8%", "御风冷却 -30%", "御风后 3s 攻速 +30%"],
    apply: (r) => {
      if (r === 1) { G.atkSpeed *= 1.12; G.moveSpeed *= 1.08; }
      else if (r === 2) { G.dashCD *= 0.7; }
      else { G.gemFx.dashHaste = 0.3; }
    } },
  { id: "gem_xuejian", char: "sword", stone: "xuesha", elem: "jin", name: "噬血剑心", ico: "血",
    color: "#f87171", school: "血剑流",
    tierText: ["暴击率 +8% · 暴击伤害 +25%", "击杀吸血 +3", "暴击时溅血爆裂（50% 伤害）"],
    apply: (r) => {
      if (r === 1) { G.crit = Math.min(0.7, G.crit + 0.08); G.critMul += 0.25; }
      else if (r === 2) { G.lifesteal += 3; }
      else { G.gemFx.critBurst = 0.5; }
    } },
  // ---- 法修 ----
  { id: "gem_leiting", char: "mage", stone: "leiling", elem: "jin", name: "九霄雷印", ico: "雷",
    color: "#c084fc", school: "雷霆流",
    tierText: ["灵力上限 +25 · 回灵 +1/s", "技能冷却 -15%", "击杀 20% 概率落雷"],
    apply: (r) => {
      if (r === 1) { G.mpMax += 25; G.mp = G.mpMax; G.mpRegen += 1; }
      else if (r === 2) { G.aoeCD *= 0.85; G.dashCD *= 0.85; }
      else { G.thunderProc = (G.thunderProc || 0) + 0.2; }
    } },
  { id: "gem_xuanbing", char: "mage", stone: "shuangjing", elem: "shui", name: "太阴冰魄", ico: "魄",
    color: "#93c5fd", school: "玄冰流",
    tierText: ["命中必附寒毒减速 · 寒毒加深", "对精英有 15% 概率冰封", "受寒毒影响者额外受 25% 伤害"],
    apply: (r) => {
      if (r === 1) { G.gemFx.chill = true; }
      else if (r === 2) { G.gemFx.freezeChance = 0.15; }
      else { G.gemFx.deepFreeze = true; }
    } },
  { id: "gem_fentian", char: "mage", stone: "fentianshi", elem: "huo", name: "焚天赤篆", ico: "篆",
    color: "#fb923c", school: "焚天流",
    tierText: ["灼烧伤害 ×1.8", "命中 25% 概率附带灼烧", "命中必附灼烧 · 灼烧伤害再 ×1.6"],
    apply: (r) => {
      if (r === 1) { G.burnMul *= 1.8; }
      else if (r === 2) { G.gemFx.burnChance = 0.25; }
      else { G.gemFx.burn = true; G.burnMul *= 1.6; }
    } },
  // ---- 体修 ----
  { id: "gem_tiegu", char: "body", stone: "xuantie", elem: "jin", name: "玄铁不坏", ico: "铁",
    color: "#cbd5e1", school: "铁骨流",
    tierText: ["护盾上限 +30 · 护盾再生", "受击减伤 10%", "护盾破碎时爆发冲击波"],
    apply: (r) => {
      if (r === 1) { G.shieldMax += 30; G.shield += 30; G.gemFx.shieldRegen = (G.gemFx.shieldRegen || 0) + 2.5; }
      else if (r === 2) { G.dmgTakenMul *= 0.9; }
      else { G.gemFx.shieldBreak = true; }
    } },
  { id: "gem_longxue", char: "body", stone: "longxue", elem: "huo", name: "龙血战体", ico: "龙",
    color: "#f87171", school: "龙血流",
    tierText: ["气血上限 +60 · 击杀回血 +2", "气血低于 45% 时攻击 +25%", "每 8s 回复 8% 气血"],
    apply: (r) => {
      if (r === 1) { G.hpMax += 60; G.hp = Math.min(G.hpMax, G.hp + 60); G.lifesteal += 2; }
      else if (r === 2) { G.gemFx.rage = true; }
      else { G.gemFx.regenPct = 0.08; }
    } },
  { id: "gem_panshi", char: "body", stone: "panshishi", elem: "tu", name: "磐石镇岳", ico: "磐",
    color: "#d6a86a", school: "磐石流",
    tierText: ["受击反伤 +15%", "护盾上限 +20", "受击 25% 概率震波（范围伤害）"],
    apply: (r) => {
      if (r === 1) { G.thorns += 0.15; }
      else if (r === 2) { G.shieldMax += 20; }
      else { G.gemFx.quake = 0.25; }
    } },
];
const GEM_BY_ID = Object.fromEntries(GEMS.map((g) => [g.id, g]));

// ---------- 装备系统（v3.0） — 怪物掉落 · 背包自动合成 · 3 高级槽位 ----------
// 装备品阶：5 阶，2→1 自动合成链
const TIERS = {
  white:  { name: "白", color: "#e5e7eb", mult: 1.0, affMin: 1, affMax: 2 },
  green:  { name: "绿", color: "#86efac", mult: 1.4, affMin: 2, affMax: 2 },
  blue:   { name: "蓝", color: "#93c5fd", mult: 1.8, affMin: 2, affMax: 3 },
  purple: { name: "紫", color: "#d8b4fe", mult: 2.4, affMin: 3, affMax: 3, equipable: true },
  orange: { name: "橙", color: "#fb923c", mult: 3.2, affMin: 4, affMax: 4, equipable: true },
};
const TIER_ORDER = ["white", "green", "blue", "purple", "orange"];
// 装备槽位（3 席）
const SLOT_DEFS = {
  weapon:    { name: "武器", ico: "⚔", color: "#fbbf24", pool: ["jian", "zhang", "zhua"], mainStat: "atk", mainLabel: "攻击" },
  armor:     { name: "防具", ico: "🛡", color: "#94a3b8", pool: ["jia", "pao", "yi"],     mainStat: "hp",  mainLabel: "生命" },
  accessory: { name: "饰品", ico: "◆",  color: "#86efac", pool: ["jie", "lian", "fu"],     mainStat: "spd", mainLabel: "移速" },
};
// 底材池（9 种）
const ITEM_TYPES = {
  jian:  { name: "青锋剑", ico: "剑" },
  zhang: { name: "玄铁杖", ico: "杖" },
  zhua:  { name: "龙骨爪", ico: "爪" },
  jia:   { name: "玄铁甲", ico: "甲" },
  pao:   { name: "流云袍", ico: "袍" },
  yi:    { name: "龙鳞衣", ico: "衣" },
  jie:   { name: "碧玉戒", ico: "戒" },
  lian:  { name: "紫金链", ico: "链" },
  fu:    { name: "驱邪符", ico: "符" },
};
// 词条库：v4.0 纯打装流 —— 每件装备 2-3 词条里至少 1 个是「技能词条」
// 数值词条（已有）+ 技能词条（新增 SKILL_AFFIXES）
const AFFIX_POOL = {
  // —— 派系数值词条（保留）——
  huo_dmg:     { name: "赤锋·炎",  type: "派系", school: "赤锋", desc: "火伤 +12%" },
  mu_speed:    { name: "疾风·逸",  type: "派系", school: "疾风", desc: "移速 +8%" },
  shui_slow:   { name: "霜晶·凝",  type: "派系", school: "霜晶", desc: "命中减速 +10%" },
  jin_crit:    { name: "血煞·噬",  type: "派系", school: "血煞", desc: "击杀回血 +5" },
  tu_shield:   { name: "磐石·固",  type: "派系", school: "磐石", desc: "护盾 +10" },
  huo_burn:    { name: "焚天·灼",  type: "派系", school: "焚天", desc: "灼烧伤害 +25%" },
  jin_thunder: { name: "雷灵·震",  type: "派系", school: "雷灵", desc: "雷伤 +25%" },
  huo_fire:    { name: "龙血·炎",  type: "派系", school: "龙血", desc: "受击火反伤 +15" },
  jin_iron:    { name: "玄铁·坚",  type: "派系", school: "玄铁", desc: "减伤 +8%" },
  // —— 稀有数值词条（保留）——
  crit_pct:   { name: "锐利",  type: "稀有", desc: "暴击率 +5%" },
  haste_pct:  { name: "急速",  type: "稀有", desc: "急速 +8%" },
  lifesteal:  { name: "吸血",  type: "稀有", desc: "击杀回血 +2" },
  xp_bonus:   { name: "悟性",  type: "稀有", desc: "经验 +15%" },
  shield_max: { name: "护体",  type: "稀有", desc: "护盾上限 +15" },
  // —— v4.0 新增：技能词条（每件装备 2-3 词条里至少带 1 个）——
  // skill 字段定义技能形态；cd/cdMax 是主动技能 CD（秒）；passive=true 表示被动
  sk_fire_jet:    { name: "炽焰喷射",  type: "技能", kind: "active",   cd: 4.0, ico: "喷", desc: "主动 J/K · 喷 6 道穿透火焰（攻击 ×180%）" },
  sk_wind_step:   { name: "御风行步",  type: "技能", kind: "passive",  ico: "逸", desc: "被动 · 闪避后 1.5s 移速 +80%" },
  sk_ice_prison:  { name: "玄冰囚笼",  type: "技能", kind: "passive",  ico: "囚", desc: "被动 · 击杀 30% 在死处 1.5s 冰冻圈" },
  sk_stone_wall:  { name: "磐石壁垒",  type: "技能", kind: "passive",  ico: "壁", desc: "被动 · 每 8s 受击生 3s 石墙挡伤" },
  sk_thunder:     { name: "落雷引线",  type: "技能", kind: "passive",  ico: "雷", desc: "被动 · 暴击时 30% 周围 3 敌人引雷" },
  sk_sword_array: { name: "剑气护体",  type: "技能", kind: "active",   cd: 8.0,  ico: "阵", desc: "主动 J/K · 200 范围剑阵护体 6s" },
  sk_blood_suck:  { name: "血煞噬魂",  type: "技能", kind: "passive",  ico: "噬", desc: "被动 · 击杀回 HP +15" },
  sk_crit_burst:  { name: "暴击溅血",  type: "技能", kind: "passive",  ico: "暴", desc: "被动 · 暴击溅射 4 个目标 50% 伤害" },
  sk_wind_shadow: { name: "疾风残影",  type: "技能", kind: "active",   cd: 6.0,  ico: "影", desc: "主动 J/K · 留 3s 残影吸引火力" },
  sk_fire_burn:   { name: "朱雀灼烧",  type: "技能", kind: "passive",  ico: "灼", desc: "被动 · 命中 25% 灼烧目标 ×3" },
  sk_iron_skin:   { name: "金刚铁皮",  type: "技能", kind: "passive",  ico: "铁", desc: "被动 · 受击 30% 概率完全免伤" },
  sk_hp_regen:    { name: "生生不息",  type: "技能", kind: "passive",  ico: "生", desc: "被动 · 每 5s 回 HP +12" },
};
const AFFIX_BY_KEY = AFFIX_POOL;        // 别名（兼容旧引用）
const AFFIX_KEYS = Object.keys(AFFIX_POOL);
const RARE_AFFIX_KEYS = AFFIX_KEYS.filter((k) => AFFIX_POOL[k].type === "稀有");
const SKILL_AFFIX_KEYS = AFFIX_KEYS.filter((k) => AFFIX_POOL[k].type === "技能");
const ACTIVE_SKILL_KEYS = SKILL_AFFIX_KEYS.filter((k) => AFFIX_POOL[k].kind === "active");
const PASSIVE_SKILL_KEYS = SKILL_AFFIX_KEYS.filter((k) => AFFIX_POOL[k].kind === "passive");
const MAX_ACTIVE_SLOTS = 2;              // 玩家主动技能槽 2 个（J/K）

// ============ v6.1 · 武器觉醒（修复 v4.0 断链） ============
// 病根：v4.0 砍掉「升级三选一」后，weapons.fire/frost/lightning/array 再无任何升级入口，
//       resetRun 初始化为 0 就永远是 0，updateWeapons 的 if (lv > 0) 永远进不去。
// 修法：把武器点亮挂到「装备派系」上 —— 契合 v4.0「配装决定一切」的设计哲学。
//       身上（3 个已装备槽位）每有 1 件带该派系词条的装备 ⇒ 对应武器 +1 级
//       该武器对应派系凑满 3 件 ⇒ 觉醒（evo），形态与数值全面升级
const SCHOOL_WEAPON = {
  赤锋: "fire", 焚天: "fire", 龙血: "fire",          // 火 → 业火
  霜晶: "frost", 疾风: "frost",                       // 水木 → 寒冰
  雷灵: "lightning", 血煞: "lightning",               // 雷金 → 紫电
  玄铁: "array", 磐石: "array",                       // 土金 → 剑阵
};
const SCHOOL_WEAPON_MAP = SCHOOL_WEAPON;
const WEAPON_NAME = { fire: "业火", frost: "寒冰", lightning: "紫电", array: "剑阵" };
const WEAPON_EVO_NAME = { fire: "业火觉醒", frost: "冰封觉醒", lightning: "雷法觉醒", array: "万剑归宗" };
const WEAPON_MAX_LV = 5;      // 3 槽位 + 同件多词条，上限 5 级
const WEAPON_EVO_NEED = 3;    // 该武器对应派系凑满 3 件 ⇒ 觉醒

// 按已装备装备的派系词条，点亮 / 升级 / 觉醒 4 件武器
function syncWeaponsFromSet() {
  const w = G.weapons;
  if (!w) return;
  const cnt = { fire: 0, frost: 0, lightning: 0, array: 0 };
  for (const slot in G.equipped) {
    const eq = G.equipped[slot];
    if (!eq) continue;
    const seen = new Set();                      // 同一件装备对同一武器最多贡献 1 级
    for (const ax of (eq.affixes || [])) {
      const def = AFFIX_POOL[ax];
      if (!def || !def.school) continue;
      const wk = SCHOOL_WEAPON[def.school];
      // v7.0 A：一件装备可以同时投资多个派系（混搭流派才能凑出「双兵合击」）
      if (!wk || seen.has(wk)) continue;
      seen.add(wk);
      cnt[wk] += 1;
    }
  }
  // v7.3：本命灵石也计入该派系投资。
  // 探针实测「3 件同派系觉醒」在真实一局里只是概率性可达（掉落槽位随机 + 自动合成会吃掉紫装），
  // 整条 build 线时有时无。让灵石槽顶 1 件装备，2 件同派系 + 本命灵石即可觉醒——
  // 既保住「纯度」的设计意图，又让目标稳定可达，同时给刚修好的灵石槽一个真实价值。
  if (G._stoneSlot && G._stoneSlot.school) {
    const wk = SCHOOL_WEAPON[G._stoneSlot.school];
    if (wk) cnt[wk] += 1;
  }
  for (const k in cnt) {
    const ww = w[k];
    if (!ww) continue;
    // v7.6「道途感悟」保底成长：每 4 波给当前最弱的一把兵器 +1 级。
    //   探针实测双兵合击解锁 0 次 —— 解锁条件是「两把武器各 Lv≥2」，
    //   但武器等级只由装备派系投资决定，专精流永远只有一把在涨，副武器永远是 Lv1：
    //   等于「双修流」这条路只有欧皇走得通。这条保底让每个玩家在中期都能摸到一次合击形态，
    //   而不是把它锁在运气后面。
    const lv = Math.min(WEAPON_MAX_LV,
      cnt[k] + ((G._jobWpLv && G._jobWpLv[k]) || 0) + ((G._insightWp && G._insightWp[k]) || 0));
    const evo = cnt[k] >= WEAPON_EVO_NEED;
    const grew = lv > (ww.lv || 0);
    const justEvo = evo && !ww.evo;
    ww.lv = lv; ww.evo = evo;
    if (justEvo) {
      showBigBanner("兵器通灵", `${WEAPON_EVO_NAME[k]} · ${WEAPON_NAME[k]} Lv.${lv}`, "purple");
      toast(`兵器通灵 · ${WEAPON_EVO_NAME[k]}`, "violet");
      burst(G.px, G.py, "#c084fc", 26, 240, 5);
      AudioSys.level();
    } else if (grew && lv > 0) {
      toast(`${WEAPON_NAME[k]} · Lv.${lv}`, "cyan");
    }
  }
  refreshWeaponHint();
  syncFusions();
  buildHudSync();
}

// v7.6 本命灵石自动入槽：探针实测「灵石槽入槽」整局只发生 1 次（有的局干脆 0 次），
//   ×1.30 派系加成与法门 Lv3 全都挂着这条链上 —— 玩家不知道要点，内容就永远够不着。
//   攒够 3 颗同派系灵石就自动入槽（同分优先当前主派系），玩家仍可随时手动换，
//   但「默认不生效」这种够不着，不该由玩家的无知来承担。
const AUTO_SLOT_NEED = 3;
function autoStoneSlot() {
  if (G._stoneSlot || !G.stones) return;
  const bySchool = {};
  for (const k in G.stones) {
    const n = G.stones[k] || 0;
    if (n <= 0) continue;
    const s = schoolOf(k);
    if (!s) continue;
    bySchool[s] = (bySchool[s] || 0) + n;
  }
  let best = null, bestScore = 0;
  for (const s in bySchool) {
    // 同分优先当前主派系：本命灵石是给 build 服务的，不是「谁多谁上」
    const score = bySchool[s] + (s === G._setSchool ? 0.5 : 0);
    if (score > bestScore) { bestScore = score; best = s; }
  }
  if (!best || bySchool[best] < AUTO_SLOT_NEED || !STONE_BY_KEY) return;
  const st = stonesOf().find((s) => s.school === best && stoneAt(s.key) > 0);
  if (!st) return;
  setStoneSlot(st.key);
  toast(`本命灵石 · ${st.name} 入槽 · ${best}派 ×1.30`, "gold");
  AudioSys.level();
}

// v7.6 道途感悟：把「兵器成长」从纯运气里解出来一点。
//   武器等级原本 100% 由装备派系投资决定 —— 掉落是随机的，玩家再会玩也可能一路只有一把兵器。
//   每 4 波固定给最弱的那把 +1 级，保证中期人人都有两把 Lv2（双兵合击的门槛），
//   而「觉醒」仍然只看派系投资 —— 形态质变还得靠 build，保底只保下限，不保上限。
const INSIGHT_EVERY = 4;
function grantWeaponInsight() {
  if (!G.weapons) return;
  let best = null, bestLv = Infinity;
  for (const k of ["fire", "frost", "lightning", "array"]) {
    const w = G.weapons[k];
    if (!w) continue;
    if ((w.lv || 0) >= WEAPON_MAX_LV) continue;
    if ((w.lv || 0) < bestLv) { bestLv = w.lv || 0; best = k; }
  }
  if (!best) return;
  G._insightWp = G._insightWp || {};
  G._insightWp[best] = (G._insightWp[best] || 0) + 1;
  syncWeaponsFromSet();
  if (G.weapons[best] && G.weapons[best].lv >= FUSION_NEED_LV && !G._insightHinted) {
    G._insightHinted = true;
    toast("道途感悟 · 双兵已备，合击将启", "gold");
  }
}

// ================= v7.0 · 延时爆点队列 =================
// 合击、连锁击杀、尸潮奖励共用一套「先出预警圈 → 再炸」的原语，
// 好处：视觉有预读（玩家能看出要炸哪），且伤害结算统一走 applyHit（元素/暴击/护盾全生效）
function addBlast(x, y, r, dmg, delay, color, opts) {
  G.blasts = G.blasts || [];
  if (G.blasts.length > 60) return;            // 硬上限：手机端防炸帧
  G.blasts.push({ x, y, r, dmg, t: Math.max(0, delay || 0), max: Math.max(0.001, delay || 0.001), color: color || "#fbbf24", opts: opts || null, kind: (opts && opts.kind) || "" });
}
function blastNow(b) {
  burst(b.x, b.y, b.color, b.kind === "chain" ? 10 : 18, 250, 4);
  G.particles.push({ x: b.x, y: b.y, vx: 0, vy: 0, life: 0.3, max: 0.3, color: b.color, size: 4, ring: { r0: 8, r1: b.r } });
  G.shake = Math.max(G.shake, b.kind === "chain" ? 3 : 7);
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (b.kind === "eliteSlam") continue; // 敌方砸地：只伤玩家
    if (dist(e.x, e.y, b.x, b.y) > b.r + e.r) continue;
    applyHit(e, b.dmg, b.opts || {});
  }
  // P1-A 精英砸地：范围内玩家受伤
  if (b.kind === "eliteSlam" && dist(G.px, G.py, b.x, b.y) < b.r) {
    G._pendingCause = "shock";
    damagePlayer(b.dmg);
  }
  if (b.kind !== "chain") AudioSys.skill();
}
function updateBlasts(dt) {
  if (!G.blasts || !G.blasts.length) return;
  for (const b of G.blasts) {
    b.t -= dt;
    if (b.t <= 0 && !b.done) { b.done = true; blastNow(b); }
  }
  G.blasts = G.blasts.filter((b) => !b.done);
}

// ================= v7.0 A · 双兵合击 =================
// 产品定位：给「配装」一个爆点回报 —— 两件武器同时觉醒即解锁合击技，
// 自动蓄能释放（不占操作位），玩家感知是「我凑出来的东西产生了化学反应」
const FUSION_DEFS = [
  {
    id: "fl", pair: ["fire", "lightning"], name: "雷火劫", ico: "劫", color: "#fb923c", cd: 7,
    desc: "天雷引燃业火 · 三柱爆燃并附灼烧",
    cast() {
      const t = nearestEnemy(G.px, G.py, 520);
      const cx = t ? t.x : G.px + rand(-180, 180), cy = t ? t.y : G.py + rand(-180, 180);
      for (let i = 0; i < 3; i++) {
        addBlast(cx + rand(-100, 100), cy + rand(-100, 100), 112,
          fusDmg(2.0), 0.14 * i, "#fbbf24",
          { burn: 3.5, burnDmg: fusDmg(0.3) });
      }
    },
  },
  {
    id: "fa", pair: ["fire", "array"], name: "焚天剑轮", ico: "轮", color: "#f59e0b", cd: 6.5,
    desc: "八向火轮横扫 · 穿透灼烧",
    cast() {
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8 + G.time * 0.7;
        for (let k = 1; k <= 3; k++) {
          const d = 70 * k;
          addBlast(G.px + Math.cos(a) * d, G.py + Math.sin(a) * d, 62,
            fusDmg(1.15), 0.06 * k, "#f59e0b",
            { burn: 2.5, burnDmg: fusDmg(0.22) });
        }
      }
    },
  },
  {
    id: "fc", pair: ["fire", "frost"], name: "冰火两仪", ico: "仪", color: "#f472b6", cd: 6,
    desc: "以己身为心的蒸汽爆 · 灼烧并冰缓",
    cast() {
      addBlast(G.px, G.py, 190, fusDmg(2.4), 0.18, "#f472b6",
        { burn: 2.5, burnDmg: fusDmg(0.25), slow: 2, slowMul: 0.45 });
      G.zones.push({ x: G.px, y: G.py, r: 190, life: 5, max: 5, kind: "prison", mul: 0.45, color: "#f472b6", dps: G.atk * 0.12 });
    },
  },
  {
    id: "lc", pair: ["frost", "lightning"], name: "玄冰雷引", ico: "引", color: "#a78bfa", cd: 5.5,
    desc: "雷链锁六敌 · 冰缓并引雷",
    cast() {
      let n = 0;
      for (const e of G.enemies) {
        if (e.dead || n >= 6) continue;
        if (dist(e.x, e.y, G.px, G.py) > 460) continue;
        n++;
        G.particles.push({ x: G.px, y: G.py, vx: 0, vy: 0, life: 0.22, max: 0.22, color: "#a78bfa", size: 3, line: { x2: e.x, y2: e.y } });
        addBlast(e.x, e.y, 74, fusDmg(1.8), 0.05 * n, "#a78bfa", { slow: 2.2, slowMul: 0.35 });
      }
      if (n === 0) addBlast(G.px, G.py, 90, 0, 0.05, "#a78bfa", null);
    },
  },
  {
    id: "la", pair: ["lightning", "array"], name: "千锋雷剑", ico: "锋", color: "#c084fc", cd: 6.5,
    desc: "十二雷剑自天而降 · 单体高频",
    cast() {
      const list = G.enemies.filter((e) => !e.dead && dist(e.x, e.y, G.px, G.py) < 520);
      for (let i = 0; i < 12; i++) {
        const e = list.length ? pick(list) : null;
        const x = e ? e.x + rand(-24, 24) : G.px + rand(-240, 240);
        const y = e ? e.y + rand(-24, 24) : G.py + rand(-240, 240);
        addBlast(x, y, 58, fusDmg(1.05), 0.05 * i, "#c084fc", { slow: 1, slowMul: 0.6 });
      }
    },
  },
  {
    id: "ca", pair: ["frost", "array"], name: "冰封剑狱", ico: "狱", color: "#7dd3fc", cd: 8,
    desc: "周身凝成剑狱 · 定身并绞杀",
    cast() {
      addBlast(G.px, G.py, 210, fusDmg(1.7), 0.2, "#7dd3fc", { slow: 3, slowMul: 0.2 });
      G.zones.push({ x: G.px, y: G.py, r: 210, life: 6, max: 6, kind: "prison", mul: 0.2, color: "#67e8f9", dps: G.atk * 0.18 });
    },
  },
];
const FUSION_MAX_ACTIVE = 2;      // 同时最多挂 2 个合击（再多玩家记不住，屏幕也乱）
const FUSION_NEED_LV = 2;         // 两件武器各 Lv≥2 ⇒ 解锁合击
// 产品取舍：3 个装备槽最多凑 3 件派系计数，
//   · 全押一派 ⇒ 单武器觉醒 + 法门 Lv3（专精流：数值天花板高）
//   · 双派混搭 ⇒ 两把武器到 Lv2、解锁合击（双修流：形态天花板高）
// 两条路都成立，玩家自己选，这才是 build 的意义
function fusDmg(k) { return G.atk * k * playerDamageMult() * (G._fusionPower || 1); }

function syncFusions() {
  if (!G.weapons) return;
  G.fusions = G.fusions || [];
  const owned = [];
  for (const def of FUSION_DEFS) {
    const a = G.weapons[def.pair[0]], b = G.weapons[def.pair[1]];
    if (!a || !b) continue;
    const ok = a.lv >= FUSION_NEED_LV && b.lv >= FUSION_NEED_LV;
    if (ok) owned.push({ id: def.id, perfect: !!(a.evo && b.evo) });
  }
  // 移除已失效的
  G.fusions = G.fusions.filter((f) => owned.some((o) => o.id === f.id));
  // 双修圆满（两件皆觉醒）实时刷新
  for (const f of G.fusions) {
    const o = owned.find((x) => x.id === f.id);
    if (o) f.perfect = o.perfect;
  }
  // 新增（取 FUSION_DEFS 顺序，最多 FUSION_MAX_ACTIVE）
  for (const o of owned) {
    if (G.fusions.length >= FUSION_MAX_ACTIVE) break;
    if (G.fusions.some((f) => f.id === o.id)) continue;
    const def = FUSION_DEFS.find((d) => d.id === o.id);
    G.fusions.push({ id: o.id, perfect: o.perfect, cdLeft: def.cd * 0.5, cd: def.cd });
    showBigBanner("双兵合璧", `${def.name}${o.perfect ? " · 圆满" : ""} · ${def.desc}`, "gold");
    toast(`合击解锁 · ${def.name}`, "gold");
    burst(G.px, G.py, def.color, 30, 260, 5);
    AudioSys.level();
  }
  fusionHudSync();
}

function updateFusions(dt) {
  if (!G.fusions || !G.fusions.length) return;
  const hasTarget = G.enemies.some((e) => !e.dead);
  for (const f of G.fusions) {
    const def = FUSION_DEFS.find((d) => d.id === f.id);
    if (!def) continue;
    f.cdLeft = Math.max(0, (f.cdLeft || 0) - dt);
    if (f.cdLeft <= 0 && hasTarget) {
      f.cdLeft = f.cd;
      G._fusionPower = f.perfect ? 1.5 : 1;      // 双器皆觉醒 ⇒ 合击威力 ×1.5
      def.cast();
      G._fusionPower = 1;
      spawnFloater(G.px, G.py - G.pr - 26, def.name + (f.perfect ? "·圆满" : ""), def.color, 15);
    }
  }
}

function fusionHudSync() {
  const box = ui.fusionHud;
  if (!box) return;
  if (!G.fusions || !G.fusions.length) { box.classList.add("hidden"); return; }
  box.classList.remove("hidden");
  box.innerHTML = "";
  for (const f of G.fusions) {
    const def = FUSION_DEFS.find((d) => d.id === f.id);
    if (!def) continue;
    const el = document.createElement("span");
    el.className = "fus-chip";
    el.style.setProperty("--fc", def.color);
    el.innerHTML = `<b>${def.ico}</b><i>${def.name}</i><u></u>`;
    box.appendChild(el);
  }
}

function updateFusionHud() {
  const box = ui.fusionHud;
  if (!box || box.classList.contains("hidden")) return;
  const chips = box.querySelectorAll(".fus-chip");
  G.fusions.forEach((f, i) => {
    const chip = chips[i];
    if (!chip) return;
    const u = chip.querySelector("u");
    if (u) u.style.width = `${(1 - (f.cdLeft || 0) / f.cd) * 100}%`;
    chip.classList.toggle("ready", (f.cdLeft || 0) <= 0);
  });
}

// ================= v7.0 B · 尸潮涌 =================
// 产品定位：割草的本体是「密度差」。每 7 波从一侧灌入一大群低血小妖，
// 清完给一次集中奖励 —— 让玩家的强度曲线有明确的「我变强了」时刻
const HORDE_EVERY = 7;
const HORDE_BASE = 46;            // 首次 46 只，随波次递增
function hordeSize(wave) { return HORDE_BASE + Math.floor(wave * 1.4); }

function startHorde(wave) {
  const total = hordeSize(wave);
  G._horde = { active: true, total, spawned: 0, killed: 0, spawnT: 0, t: 26, ang: rand(0, TAU), wave };
  G._hordeWave = wave;
  showBigBanner("尸潮涌", `${total} 只尸傀自${dirName(G._horde.ang)}袭来`, "red");
  toast(`尸潮涌 · ${total} 只`, "red");
  G.shake = Math.max(G.shake, 10);
  AudioSys.boss();
}
function dirName(a) {
  const deg = ((a * 180) / Math.PI + 360) % 360;
  if (deg < 45 || deg >= 315) return "东";
  if (deg < 135) return "南";
  if (deg < 225) return "西";
  return "北";
}
function updateHorde(dt) {
  const H = G._horde;
  if (!H || !H.active) return;
  H.t -= dt;
  H.spawnT -= dt;
  const alive = G.enemies.filter((e) => e.horde && !e.dead).length;
  if (H.spawnT <= 0 && H.spawned < H.total) {
    H.spawnT = 0.085;
    const n = Math.min(5, H.total - H.spawned);
    for (let i = 0; i < n; i++) {
      const a = H.ang + rand(-0.55, 0.55);
      const r = Math.max(view.w, view.h) * 0.6 + rand(0, 150);
      spawnEnemy("hordeling", G.px + Math.cos(a) * r, G.py + Math.sin(a) * r, H.wave, { horde: true });
      H.spawned += 1;
    }
  }
  if (H.spawned >= H.total && alive === 0) {
    H.active = false;
    rewardHorde();
  } else if (H.t <= 0) {
    // 超时：残余尸傀自溃（避免玩家躲着不打，尸潮无限拖）
    for (const e of G.enemies) if (e.horde && !e.dead) killEnemy(e, false);
    H.active = false;
    rewardHorde(true);
  }
  if (ui.hordeBar) {
    ui.hordeBar.classList.remove("hidden");
    const left = H.total - H.spawned + alive;
    ui.hordeFill.style.width = `${clamp((1 - left / H.total) * 100, 0, 100)}%`;
    ui.hordeText.textContent = `尸潮 ${Math.max(0, left)}`;
  }
}
function rewardHorde(timeout) {
  if (ui.hordeBar) ui.hordeBar.classList.add("hidden");
  if (timeout) { toast("尸潮自溃 · 无赏", "violet"); return; }
  const n = 6 + Math.floor((G._hordeWave || 7) / 7);
  for (let i = 0; i < n; i++) {
    dropPickup(G.px + rand(-70, 70), G.py + rand(-70, 70), "stone", { stone: randStone() });
  }
  dropPickup(G.px + rand(-40, 40), G.py + rand(-40, 40), "equip", { equip: makeEquip(pick(["weapon", "armor", "accessory"]), "blue") });
  dropPickup(G.px + rand(-40, 40), G.py + rand(-40, 40), "relic");
  G.coinsRun += 120;
  showBigBanner("尸潮尽屠", `灵石 ×${n} · 蓝装 · 遗物 · 灵玉 +120`, "gold");
  toast("尸潮尽屠 · 赐福降临", "gold");
  burst(G.px, G.py, "#fbbf24", 40, 300, 6);
  AudioSys.level();
}

// ================= v7.4 · 玄铁试炼桩（伤害测试者） =================
// 产品判断：割草玩到 15 波，玩家心里的真问题是「我这套 build 到底有多能打」。
//   场上数字一直在跳，但没有任何一个瞬间能回答这个问题。
//   解法：第 15 / 30 波丢下一根不会动、不会还手的玄铁桩，给 60 秒，
//   打碎 = 这套 build 的输出达标；打不碎也把「累计伤害 / DPS / 打掉几成」摊开给玩家看 ——
//   失败同样有信息量：你知道差多少，也知道该补攻击还是补攻速。
// 血量按「60 秒打掉多少」实测标定（tools/playability-sim.js 第 15/30 波试炼成绩）：
//   桩是不动的血包，会把群伤/溅射/灼烧全吃掉 —— 实测对桩持续输出 1k~35k DPS，
//   build 好坏能差 15 倍。取中位数（15 波 ≈6k、30 波 ≈20k）× 40 秒，
//   即「打得好的 25~35 秒打碎，打得一般的差一口气」—— 过与不过都给得出信息。
const TRIAL_WAVES = [3, 15, 30];
const TRIAL_TIME = 45;                 // 试炼时长（秒）P1-C
// v7.6 重标定：原第 3 波 5000 血是按「后期 build」拍的，实测第 3 波对桩只有 ~47 DPS，
//   60 秒只能啃掉 56% —— 玩家第一次接触这个卖点就吃到「D·凡品」，第一印象直接砸掉。
//   血量按「实测 DPS × 目标用时」重标定，让「打碎」成为大概率事件：过了是应该，过了多久才是评级。
const TRIAL_HP = { 3: 22000, 15: 1800000, 30: 9500000 }; // ×10 伤害测试者
// v7.6「玄铁崩解」：最后 15 秒桩体自行崩解，每秒流失最大生命 4%（15 秒共 60%）。
//   设计取舍：纯测输出的话，build 差的玩家会干打 60 秒看着血条纹丝不动 —— 那不是考验，是折磨。
//   前 45 秒是纯净的输出对账（崩解不参与、不计入 dealt，DPS 数字依然可信），
//   最后 15 秒给一条兜底线：你打掉四成就一定看得到它碎。击碎的高光人人有，快慢才是评级。
const TRIAL_COLLAPSE_AT = 15;        // 剩余时间 ≤ 15s 起崩
const TRIAL_COLLAPSE_RATE = 0.04;    // 每秒流失最大生命的比例
// v7.6 里程碑：长打桩最大的敌人是无聊。每啃掉 25% 给一次裂痕反馈，让 60 秒有节奏
const TRIAL_CRACKS = [0.25, 0.5, 0.75];
// v7.5 第 3 波的「伤害测试者」是活的：一直追着玩家跑（不还手），
//   15/30 波的玄铁桩仍是钉死不动的血包 —— 前期要的是「被追着也要打」的紧张感，
//   后期要的是「纯输出对账」，两种手感不能混。
const TRIAL_CHASE = { 3: true };
const TRIAL_CHASE_SPEED = 118;         // 略慢于玩家：跑得掉，但甩不干净
function trialHPFor(wave) { return TRIAL_HP[wave] || Math.round(28000 * Math.pow(1.5, (wave - 15) / 5)); }
function trialIsWave(wave) { return TRIAL_WAVES.indexOf(wave) >= 0; }
function trialTitle(wave) { return TRIAL_CHASE[wave] ? "伤害测试者" : "玄铁试炼桩"; }

// v7.6 裂痕里程碑：啃掉 25% / 50% / 75% 各裂一次。
//   60 秒对一个不动的血包，前 30 秒新鲜、后 30 秒枯燥 —— 中间插三个「有东西发生」的点，
//   顺便掉一颗灵石：让玩家知道「我在推进」，而不是「我在磨」。
function trialCrack(e, idx) {
  const pct = Math.round(TRIAL_CRACKS[idx - 1] * 100);
  spawnFloater(e.x, e.y - e.r - 30, `玄铁裂 ${pct}%`, "#fbbf24", 15, true);
  burst(e.x, e.y, "#fbbf24", 22, 240, 4);
  G.shake = Math.max(G.shake, 7);
  hitStop(40);
  G._trialCrackT = 0.9;                 // 给绘制层读：裂纹高亮 0.9 秒
  dropPickup(e.x + rand(-40, 40), e.y + rand(-40, 40), "stone", { stone: randStone() });
  toast(`玄铁裂 ${pct}% · 灵石一枚`, "gold");
  AudioSys.crit();
}

function spawnTrial(wave) {
  if (G._trialWave === wave) return;
  // 保险：上一场试炼还没收场就撞上新的试炼波，先结掉旧的，别让两个计时器打架
  if (G.trial && G.trial.active) endTrial(false, "试炼更替");
  G._trialWave = wave;
  const ang = rand(0, TAU);
  const e = spawnEnemy("dummy", G.px + Math.cos(ang) * 200, G.py + Math.sin(ang) * 200, wave);
  const hp = trialHPFor(wave);
  e.hp = e.hpMax = hp;
  e.isDummy = true;
  e.atk = 0; e.speed = 0; e.xp = 0; e.mods = [];
  e.boss = false; e.elite = false;
  const chase = !!TRIAL_CHASE[wave];
  if (chase) { e.isChaser = true; e.speed = TRIAL_CHASE_SPEED; e.color = "#f0c14b"; }
  G.trial = { active: true, wave, t: TRIAL_TIME, dealt: 0, hpMax: hp, id: e.id, killed: false, chase };
  // v7.5 清场：把还在场上的怪全部「退散」（不给奖励、不计击杀）。
  //   测试者的意义是「这一分钟只测输出」，混进小怪就测不准了；
  //   而且玩家反馈的正是「没看到测试者」——一堆怪里冒出一个金色目标，一眼就淹了。
  let cleared = 0;
  for (const o of G.enemies) {
    if (o === e || o.dead || o.isDummy) continue;
    o.dead = true;
    burst(o.x, o.y, "#94a3b8", 10, 170, 3);
    cleared++;
  }
  G.spawnQueue.length = 0;
  G._trickle = 0;
  if (cleared) toast(`群妖退散 · 场上只留测试者（清 ${cleared} 只）`, "gold");
  const title = trialTitle(wave);
  showBigBanner(chase ? "伤害测试者" : "玄铁试炼",
    chase ? `${TRIAL_TIME} 秒内击碎 · 它只追不打` : `${TRIAL_TIME} 秒内击碎 · 桩血 ${hp}`, "orange");
  toast(`${title} · ${TRIAL_TIME} 秒 · 血 ${hp}${chase ? " · 只追不打" : ""}`, "gold");
  // v7.5：这一分钟不推进波次 —— 打完测试者才继续下一波（波次计时冻结在试炼里）
  toast("妖潮暂歇 · 打完测试者才继续下一波", "cyan");
  // v7.6：把兜底规则写在明面上 —— 玩家知道最后 15 秒桩会自解，才敢放手打而不是焦虑
  toast(`玄铁崩解 · 最后 ${TRIAL_COLLAPSE_AT} 秒桩体自解，打掉四成就看得见它碎`, "gold");
  G.shake = Math.max(G.shake, 8);
  AudioSys.boss();
  burst(e.x, e.y, "#f0c14b", 26, 260, 5);
}

function updateTrial(dt) {
  const T = G.trial;
  if (!T || !T.active) return;
  const e = G.enemies.find((x) => x.id === T.id && !x.dead);
  if (!e) { if (!T.killed) endTrial(false, "试炼桩已遁走"); return; }
  T.hpLeft = e.hp;
  if (T.chase) {
    // 追猎型不需要「遁地重现」——它自己会贴上来，玩家甩不掉。
    //   这里只做一件事：万一被地形/力场推飞到天边，拉回玩家附近，别让计时空转。
    if (dist(e.x, e.y, G.px, G.py) > 1600) {
      const a1 = rand(0, TAU);
      e.x = G.px + Math.cos(a1) * 160;
      e.y = G.py + Math.sin(a1) * 160;
    }
  } else if (dist(e.x, e.y, G.px, G.py) > 560) {
    const a2 = rand(0, TAU);
    burst(e.x, e.y, "#94a3b8", 14, 160, 3);
    e.x = G.px + Math.cos(a2) * 190;
    e.y = G.py + Math.sin(a2) * 190;
    burst(e.x, e.y, "#f0c14b", 18, 200, 4);
    toast("试炼桩遁地重现 · 就在你身侧", "gold");
  }
  // v7.6 里程碑：每啃掉 25% 裂一次 —— 给 60 秒打桩塞进节奏点，也顺手掉点灵石做正反馈
  const prog = clamp(1 - e.hp / e.hpMax, 0, 1);
  T.cracks = T.cracks || 0;
  while (T.cracks < TRIAL_CRACKS.length && prog >= TRIAL_CRACKS[T.cracks]) {
    T.cracks += 1;
    trialCrack(e, T.cracks);
  }
  // v7.6 玄铁崩解：最后 15 秒桩体自行崩解（不计入玩家输出，DPS 数字仍然可信）
  if (T.t <= TRIAL_COLLAPSE_AT && e.hp > 0) {
    T.collapsing = true;
    e.hp -= e.hpMax * TRIAL_COLLAPSE_RATE * dt;
    if (e.hp <= 0) {
      e.hp = 0;
      killEnemy(e, true);              // 走标准击杀流程 ⇒ endTrial(true, "击碎")
      return;
    }
  }
  T.t -= dt;
  if (T.t <= 0) {
    e.dead = true;                       // 不进 killEnemy：不计数、不掉装
    burst(e.x, e.y, "#94a3b8", 30, 240, 5);
    endTrial(false, "时限已尽");
    return;
  }
  trialHudSync(e);
}

// ---------- v7.5 攻击能力评分 ----------
// 光有数字不够 —— 玩家看完「DPS 412」并不知道这算好还是算烂。
//   评分把「我这套 build 有多能打」翻译成一句人话 + 一个等级，
//   并且每个等级都带一条可执行的下一步（补攻速 / 换武器 / 提纯度），而不是只报个冷冰冰的数字。
// 门槛按实测标定（tools/playability-sim.js 逐波真实对局采样），不是拍脑袋。
// v7.6 随血量重标定同步下调门槛（血量降了，还用旧门槛会人人天品，评级就没有区分度了）
const TRIAL_GRADE_TIME = {      // 击碎用时门槛（秒）：[天品, 上品, 中品, 下品]，超出即凡品
  // ×10 硬度 + 45s 上限：上四档压进 45s 内，避免「下品」永不可达
  3: [18, 28, 36, 43],
  15: [20, 30, 38, 44],
  30: [22, 32, 40, 44],
};
const TRIAL_GRADE_RATIO = [0.85, 0.62, 0.38, 0.18];   // 没打碎时按「打掉几成」评：中品 / 下品 / 凡品 / 劣品
const TRIAL_GRADES = [
  { rank: "S", name: "天品", color: "#fbbf24", word: "此锋可斩天人", tip: "输出已达此波上限 —— 尽情割草，别改 build" },
  { rank: "A", name: "上品", color: "#a3e635", word: "锋芒已成，可当一面", tip: "再补一件攻装或一次攻速，即可登天品" },
  { rank: "B", name: "中品", color: "#7dd3fc", word: "火候尚可，仍欠三分", tip: "建议：攻类悟道卡优先，别急着堆防御" },
  { rank: "C", name: "下品", color: "#c084fc", word: "根基未稳，宜补攻伐", tip: "建议：先换高阶武器，再补攻速与暴击" },
  { rank: "D", name: "凡品", color: "#94a3b8", word: "锋未开刃", tip: "建议：升武器等级 + 提派系纯度，差距主要在这两项" },
];
function trialGrade(wave, res) {
  if (res.success) {
    const th = TRIAL_GRADE_TIME[wave] || TRIAL_GRADE_TIME[15];
    const t = res.t || 0;
    if (t <= th[0]) return TRIAL_GRADES[0];
    if (t <= th[1]) return TRIAL_GRADES[1];
    if (t <= th[2]) return TRIAL_GRADES[2];
    if (t <= th[3]) return TRIAL_GRADES[3];
    return TRIAL_GRADES[4];
  }
  const r = res.ratio || 0;
  // 没打碎：差一口气和差一半不是一回事，所以按完成度分档，最高只到中品
  if (r >= TRIAL_GRADE_RATIO[0]) return TRIAL_GRADES[2];
  if (r >= TRIAL_GRADE_RATIO[1]) return TRIAL_GRADES[3];
  if (r >= TRIAL_GRADE_RATIO[2]) return TRIAL_GRADES[4];
  return { rank: "E", name: "劣品", color: "#6b7280", word: "力有未逮", tip: "建议：先活下来 —— 把武器觉醒和法门境界推上去再谈输出" };
}

// v7.5 评定卡：不拦截操作（pointer-events:none）、7 秒自动收起
function showTrialResult(res) {
  const g = trialGrade(res.wave, res);
  res.grade = g.rank; res.gradeName = g.name;
  if (!ui.trialCard) return;
  ui.trialCard.classList.remove("hidden");
  ui.tcSub.textContent = `第 ${res.wave} 波 · ${trialTitle(res.wave)}`;
  ui.tcRank.textContent = g.rank;
  ui.tcRank.style.color = g.color;
  ui.tcRank.style.textShadow = `0 0 14px ${g.color}`;
  ui.tcRankName.textContent = g.name;
  ui.tcRankName.style.color = g.color;
  ui.tcDps.textContent = res.dps.toLocaleString("en-US");
  ui.tcDealt.textContent = res.dealt.toLocaleString("en-US");
  ui.tcTime.textContent = `${(res.t || 0).toFixed(1)}s`;
  ui.tcPct.textContent = `${Math.round((res.ratio || 0) * 100)}%`;
  ui.tcComment.textContent = res.success ? `${g.word} · ${Math.round(res.t)}s 击碎` : `${g.word} · 打掉 ${Math.round((res.ratio || 0) * 100)}%`;
  ui.tcTip.textContent = g.tip;
  ui.trialCard.classList.remove("tc-pop");
  void ui.trialCard.offsetWidth;
  ui.trialCard.classList.add("tc-pop");
  G._trialCardT = 7;
}
function hideTrialCard() {
  if (ui.trialCard) ui.trialCard.classList.add("hidden");
  G._trialCardT = 0;
}

function trialHudSync(e) {
  const T = G.trial;
  T.hpLeft = e.hp;
  if (!ui.trialHud) return;
  ui.trialHud.classList.remove("hidden");
  const elapsed = Math.max(0.1, TRIAL_TIME - T.t);
  const dps = T.dealt / elapsed;
  ui.trialName.textContent = `${trialTitle(T.wave)} · 第 ${T.wave} 波${T.collapsing ? " · 玄铁崩解中" : ""}`;
  ui.trialName.classList.toggle("urgent", !!T.collapsing);
  const pct = clamp(e.hp / e.hpMax, 0, 1);
  ui.trialPct.textContent = `${Math.ceil(pct * 100)}%`;
  ui.trialFill.style.width = `${pct * 100}%`;
  // v7.6 里程碑刻度：三条刻度线随进度点亮，玩家一眼看到「我啃到哪儿了」
  if (ui.trialTicks) {
    ui.trialTicks.classList.remove("hidden");
    for (let i = 0; i < ui.trialTicks.children.length; i++) {
      ui.trialTicks.children[i].classList.toggle("on", (T.cracks || 0) > i);
    }
  }
}

function endTrial(success, why) {
  const T = G.trial;
  if (!T || !T.active) return;
  T.active = false;
  if (ui.trialHud) ui.trialHud.classList.add("hidden");
  const dealt = Math.round(T.dealt);
  const elapsed = Math.max(0.1, TRIAL_TIME - T.t);
  const dps = Math.round(dealt / elapsed);
  // 注意：灼烧/力场/溅射这些不走 applyHit 的伤害扣的是血、没记进 dealt，
  //   所以「打掉几成」以桩的实际剩血为准，成功即 100%（不能用 dealt/hpMax，会显示成 89%）
  const ratio = success ? 1
    : clamp(T.hpLeft != null ? 1 - T.hpLeft / T.hpMax : T.dealt / T.hpMax, 0, 1);
  G.trialResult = { wave: T.wave, success, dealt, dps, ratio, t: elapsed, chase: !!T.chase };
  // v7.5：试炼期间波次是冻结的，这里放开 —— 3 秒后继续下一波，别让玩家打完干等
  G.waveTimer = Math.min(G.waveTimer, 3);
  const title = trialTitle(T.wave);
  const grade = trialGrade(T.wave, G.trialResult);
  // v7.5：评定卡是这场试炼的「结论」——先给等级，再给数字，最后给下一步
  showTrialResult(G.trialResult);
  if (success) {
    showBigBanner("试炼达成", `${grade.rank}·${grade.name} · ${Math.round(elapsed)}s · DPS ${dps}`, "gold");
    toast(`${title}通过 · ${grade.rank}·${grade.name} · ${Math.round(elapsed)}s · DPS ${dps}`, "gold");
    // 通过奖励：15/30 波给橙装，第 3 波（早期）给紫装 —— 第 3 波直接发橙装会把后面的成长线压平
    const slot = pick(["weapon", "armor", "accessory"]);
    const rq = makeEquip(slot, T.wave <= 3 ? "purple" : "orange");
    dropPickup(G.px + rand(-40, 40), G.py + rand(-40, 40), "equip", { equip: rq });
    toast(`试炼赐 · ${T.wave <= 3 ? "紫" : "橙"}·${ITEM_TYPES[rq.typeKey].name}`, T.wave <= 3 ? "violet" : "orange");
    for (let i = 0; i < 6; i++) dropPickup(G.px + rand(-70, 70), G.py + rand(-70, 70), "stone", { stone: randStone() });
    G.coinsRun += T.wave <= 3 ? 90 : 260;
    G.goldFlash = Math.max(G.goldFlash || 0, 0.3);
    burst(G.px, G.py, "#fbbf24", 44, 320, 6);
  } else {
    const pctTxt = `${Math.round(ratio * 100)}%`;
    showBigBanner("试炼未成", `${grade.rank}·${grade.name} · 打掉 ${pctTxt} · DPS ${dps}`, "violet");
    toast(`${title} · ${why} · ${grade.rank}·${grade.name} · 累计 ${dealt.toLocaleString("en-US")} · DPS ${dps} · 打掉 ${pctTxt}`, "violet");
    // 未通过也按完成度给台阶：70% 给紫装，40% 给蓝装，否则只给灵石
    if (ratio >= 0.7) {
      dropPickup(G.px + rand(-40, 40), G.py + rand(-40, 40), "equip",
        { equip: makeEquip(pick(["weapon", "armor", "accessory"]), "purple") });
      toast("差一口气 · 赐紫装一件", "violet");
    } else if (ratio >= 0.4) {
      dropPickup(G.px + rand(-40, 40), G.py + rand(-40, 40), "equip",
        { equip: makeEquip(pick(["weapon", "armor", "accessory"]), "blue") });
      toast("输出尚可 · 赐蓝装一件", "violet");
    }
    for (let i = 0; i < 3; i++) dropPickup(G.px + rand(-60, 60), G.py + rand(-60, 60), "stone", { stone: randStone() });
  }
  AudioSys.level();
}

// ================= v7.0 B2 · 连锁击杀 =================
// 击杀有概率引爆尸体，向最近敌人传导，连击越高链越长 —— 尸潮里的核心爽点
const CHAIN_MAX_DEPTH = 6;
function tryChainKill(e) {
  if (G._noChain) return;                       // 测试钩子：隔离连锁，做纯净的掉落统计
  if ((G._chainDepth || 0) >= CHAIN_MAX_DEPTH) return;
  const p = Math.min(0.45, 0.10 + (G.combo || 0) * 0.005 + (G._horde && G._horde.active ? 0.12 : 0));
  if (Math.random() > p) return;
  const tgt = nearestEnemy(e.x, e.y, 300);
  if (!tgt || tgt === e) return;
  G._chainDepth = (G._chainDepth || 0) + 1;
  G.particles.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: 0.2, max: 0.2, color: "#fbbf24", size: 3, line: { x2: tgt.x, y2: tgt.y } });
  addBlast(tgt.x, tgt.y, 82, G.atk * 0.85 * playerDamageMult(), 0.05, "#fbbf24", { kind: "chain" });
  G._chainKills = (G._chainKills || 0) + 1;
  // v7.2 悬赏令 · 连爆令计数
  if (G.bounty && G.bounty.id === "chain" && G.bounty.state === "active") bountyAdd(1);
  G._chainDepth -= 1;
}

// ================= v7.0 C · 瞬步残影 / 濒死狂血 =================
// 瞬步：冲刺期间沿途留下带伤害判定的剑影，把「位移」变成「一次攻击」
function spawnAfterimage() {
  G.afterimages = G.afterimages || [];
  if (G.afterimages.length > (14 + (G._afterExtra || 0))) return;
  const life = 0.55 + (G._afterLifeAdd || 0);
  G.afterimages.push({
    x: G.px, y: G.py, r: 36 + G.pr,
    dmg: G.atk * 0.75 * playerDamageMult() * (G._afterDmgMul || 1),
    life, max: life, hit: new Set(),
  });
}
function updateAfterimages(dt) {
  if (!G.afterimages || !G.afterimages.length) return;
  for (const a of G.afterimages) {
    a.life -= dt;
    for (const e of G.enemies) {
      if (e.dead || a.hit.has(e.id)) continue;
      if (dist(e.x, e.y, a.x, a.y) > a.r + e.r) continue;
      a.hit.add(e.id);
      applyHit(e, a.dmg, {});
    }
  }
  G.afterimages = G.afterimages.filter((a) => a.life > 0);
}

// 濒死狂血：血量跌破 25% 触发 5s 狂血（攻速 ×2 + 伤害 +50%），带 22s 内置 CD
// v7.6：探针实测 600 秒一整局，濒死狂血触发 0 次 —— 门槛 25% 太苛刻：
//   波间回血 12% + 玩家会走位，血量几乎掉不到四分之一。这个「反杀时刻」是设计好的爽点，
//   没人见得到就等于没有。抬到 32%（仍属濒死区间，不会变成常驻 buff）。
const FRENZY_HP = 0.32, FRENZY_TIME = 5, FRENZY_CD = 22;
function updateFrenzy(dt) {
  G._frenzyCD = Math.max(0, (G._frenzyCD || 0) - dt);
  const ratio = G.hpMax > 0 ? G.hp / G.hpMax : 1;
  const need = FRENZY_HP + (G._frenzyHpAdd || 0);          // v7.1 狂血诀可抬高阈值
  const dur = FRENZY_TIME + (G._frenzyTimeAdd || 0);
  if (ratio <= need && ratio > 0 && (G._frenzyT || 0) <= 0 && (G._frenzyCD || 0) <= 0) {
    G._frenzyT = dur;
    G._frenzyCD = FRENZY_CD;
    showBigBanner("濒死狂血", "攻速 ×2 · 伤害 +50% · 五息之内", "red");
    toast("濒死狂血 · 反杀时刻", "red");
    burst(G.px, G.py, "#f43f5e", 34, 280, 5);
    AudioSys.level();
  }
  if (ui.frenzyHud) ui.frenzyHud.classList.toggle("hidden", (G._frenzyT || 0) <= 0);
}

// ================= v6.0 A · 怪物词缀 =================
// 精英 / 大妖随机带 1-2 个词缀，让"每一只怪不一样"，逼玩家换打法
const ENEMY_MODS = {
  thorns: { name: "荆棘", ico: "棘", color: "#f87171", desc: "受击反弹 18% 伤害给玩家" },
  swift:  { name: "迅捷", ico: "迅", color: "#7dd3fc", desc: "移速 +60%" },
  split:  { name: "分裂", ico: "裂", color: "#a3e635", desc: "死亡裂成 2 只小妖" },
  ward:   { name: "护盾", ico: "盾", color: "#94a3b8", desc: "带护盾，需先打碎" },
  drain:  { name: "噬魂", ico: "噬", color: "#c084fc", desc: "靠近玩家持续回血" },
  bomb:   { name: "自爆", ico: "爆", color: "#fb923c", desc: "死亡爆炸，范围伤害" },
  mirror: { name: "镜像", ico: "镜", color: "#f472b6", desc: "攻击力复制玩家 25%" },
  frost:  { name: "冰霜", ico: "霜", color: "#67e8f9", desc: "死亡留下减速力场" },
};
const ENEMY_MOD_KEYS = Object.keys(ENEMY_MODS);
// 按波次决定挂几个词缀：精英 1（8 波起 2）；大妖 1（10 波起 2）
function modCountFor(e, wave) {
  if (e.boss) return wave >= 10 ? 2 : 1;
  if (e.elite) return wave >= 8 ? 2 : 1;
  return 0;
}
function rollEnemyMods(e, wave) {
  const n = modCountFor(e, wave);
  if (n <= 0) return [];
  const pool = ENEMY_MOD_KEYS.slice();
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    out.push(k);
  }
  return out;
}

// ================= v6.0 B · 词条联动 Synergy =================
// 两个特定词条同时在身 ⇒ 触发质变（不是加法，是机制）
const SYNERGIES = [
  { id: "syn_forge",    name: "熔炉",     ico: "熔", color: "#fb923c", need: ["huo_dmg", "shui_slow"],    desc: "被减速的敌人受火伤 ×3" },
  { id: "syn_bloodrage",name: "血怒",     ico: "怒", color: "#f87171", need: ["crit_pct", "lifesteal"],   desc: "暴击溅射周围 4 敌 50% 伤害" },
  { id: "syn_thornwall",name: "荆棘壁垒", ico: "棘", color: "#a3e635", need: ["tu_shield", "huo_fire"],   desc: "护盾存在时反伤 ×3" },
  { id: "syn_frenzy",   name: "狂血",     ico: "狂", color: "#facc15", need: ["haste_pct", "jin_crit"],   desc: "击杀后 2s 攻速 ×2" },
  { id: "syn_storm",    name: "雷暴",     ico: "雷", color: "#818cf8", need: ["jin_thunder", "crit_pct"], desc: "暴击时引雷 3 个目标" },
  { id: "syn_burnwheel",name: "焚轮",     ico: "焚", color: "#fb7185", need: ["huo_burn", "haste_pct"],   desc: "灼烧跳伤速度 ×2" },
  { id: "syn_ironwall", name: "玄铁壁",   ico: "壁", color: "#94a3b8", need: ["jin_iron", "tu_shield"],   desc: "护盾存在时减伤再 −20%" },
  { id: "syn_enlight",  name: "悟道",     ico: "悟", color: "#5ce1e6", need: ["xp_bonus", "sk_hp_regen"], desc: "击杀经验 +50%" },
];
const SYNERGY_BY_ID = {};
for (const s of SYNERGIES) SYNERGY_BY_ID[s.id] = s;
// 当前是否激活某联动（读 G._synergies）
function synOn(id) { return !!(G._synergies && G._synergies.includes(id)); }


// 生成装备：slot × tier × type × 词条（v4.0：紫+橙 至少 1 个技能词条）
function makeEquip(slot, tier, opts = {}) {
  const slotDef = SLOT_DEFS[slot];
  const tierDef = TIERS[tier];
  const typeKey = opts.typeKey || slotDef.pool[Math.floor(Math.random() * slotDef.pool.length)];
  const typeDef = ITEM_TYPES[typeKey];
  const n = randInt(tierDef.affMin, tierDef.affMax);
  // 词条池：v4.0 紫+橙 至少 1 个技能词条（被动 + 主动 随机）
  const used = new Set(opts.fixedAffixes || []);
  const affixes = [...(opts.fixedAffixes || [])];
  // v4.0：紫+橙 起步带 1 技能词条（没有的话补）
  if (tierDef.equipable && affixes.filter((a) => AFFIX_POOL[a].type === "技能").length === 0 && SKILL_AFFIX_KEYS.some((k) => !used.has(k))) {
    const avail = SKILL_AFFIX_KEYS.filter((k) => !used.has(k));
    const k = avail[Math.floor(Math.random() * avail.length)];
    affixes.push(k); used.add(k);
  }
  // 紫+橙 起步补 1 稀有（数值）
  if (tierDef.equipable && affixes.filter((a) => AFFIX_POOL[a].type === "稀有").length === 0 && RARE_AFFIX_KEYS.some((k) => !used.has(k))) {
    const avail = RARE_AFFIX_KEYS.filter((k) => !used.has(k));
    const k = avail[Math.floor(Math.random() * avail.length)];
    affixes.push(k); used.add(k);
  }
  while (affixes.length < n) {
    const k = AFFIX_KEYS[Math.floor(Math.random() * AFFIX_KEYS.length)];
    if (used.has(k)) continue;
    affixes.push(k); used.add(k);
  }
  // 主属性按 slot × 阶倍率
  const baseMain = slot === "weapon" ? 8 : slot === "armor" ? 20 : 5;
  const main = Math.round(baseMain * tierDef.mult);
  return {
    uid: "eq_" + Date.now().toString(36) + "_" + Math.floor(Math.random() * 1e6).toString(36),
    slot, typeKey, tier, affixes,
    name: `${tierDef.name}·${typeDef.name}`,
    ico: typeDef.ico,
    color: tierDef.color,
    atk: slot === "weapon"    ? main : 0,
    hp:  slot === "armor"     ? main : 0,
    spd: slot === "accessory" ? main : 0,
  };
}

// 合成判断：同 slot 同 tier 至少 1 词条重叠；顶级橙不能再合
function canMerge(a, b) {
  if (!a || !b) return false;
  if (a.slot !== b.slot || a.tier !== b.tier) return false;
  if (a.tier === "orange") return false;
  return a.affixes.some((x) => b.affixes.includes(x));
}
// 合并：高一阶，词条并集（截断到新阶上限），随机丢多余
function mergeEquip(a, b) {
  const idx = TIER_ORDER.indexOf(a.tier);
  const newTier = TIER_ORDER[idx + 1];
  const tierDef = TIERS[newTier];
  const merged = Array.from(new Set([...a.affixes, ...b.affixes]));
  while (merged.length > tierDef.affMax) merged.splice(Math.floor(Math.random() * merged.length), 1);
  return makeEquip(a.slot, newTier, { typeKey: a.typeKey, fixedAffixes: merged });
}
// 自动合成（递归：合完一次继续找可合的）
function autoMergeEquip() {
  let any = true;
  let count = 0;
  while (any) {
    any = false;
    for (let i = 0; i < G.inventory.length; i++) {
      for (let j = i + 1; j < G.inventory.length; j++) {
        const a = G.inventory[i], b = G.inventory[j];
        if (canMerge(a, b)) {
          const eq = mergeEquip(a, b);
          G.inventory.splice(j, 1);
          G.inventory.splice(i, 1);
          G.inventory.push(eq);
          count++;
          burst(G.px, G.py, eq.color, 14, 160, 3);
          spawnFloater(G.px, G.py - G.pr - 26, `合成 · ${eq.name}`, eq.color, 12, true);
          any = true;
          break;
        }
      }
      if (any) break;
    }
  }
  return count;
}
// 拾取装备入背包（满则卖金币）
// ---------------------------------------------------------------------------
// v7.3 P0+ · 成长被装备重算抹掉
// 病根：_baseAtk 等只在 resetRun 快照一次（开局值），而升级（G.atk *= LV_ATK_MUL）
//      与悟道卡只改 G.atk，从不回写 _baseAtk。于是任何一次 equipRec（穿脱装备、
//      灵石槽、法门变更）都会把 G.atk 打回「开局值 + 当前装备」——玩家此前所有
//      升级与选卡的攻击成长全部作废。
//      探针实测：等级 30 攻击仅 35（正确应为 ≈98），穿装备那一刻就被回滚了。
//      后果是后期打不动妖王 ⇒ 拿不到妖王必掉的本派紫装 ⇒ 觉醒/法门/合击/联动
//      整条 build 线在真实一局里从未发生。
// 修法：不再使用固定快照，改为每次重算前先从当前实际值「剥离」上一次的装备增量，
//      反推出不含装备的基础值——这样无论成长来自升级、卡片、法门、祭坛还是商店，
//      都会被完整保留。
// ---------------------------------------------------------------------------
function stripEquipFromCurrent() {
  const old = G._eqCache || { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, burnMul: 1, dmgTaken: 0 };
  // 注意：剥离必须用「上一次真正应用过的乘区」，不能用当前的 altarBuffs / _jobDmgTakenMul。
  // 否则会出现：祭坛刚改了 hpMul=0.7 但 G.hpMax 还没被重算 ⇒ 剥离时把它当成已生效除掉
  // ⇒ 再乘一次 ⇒ 净效果为 0（祭坛和法门整条失效）。
  const ap = G._appliedMul || { atk: 1, hp: 1, xp: 1, critAdd: 0, jobDmg: 1, jobShield: 0 };
  G._baseAtk = (G.atk / ap.atk) - (old.atk || 0);
  G._baseHpMax = (G.hpMax / ap.hp) - (old.hp || 0);
  G._baseCrit = G.crit - (old.crit || 0) - ap.critAdd;
  G._baseLS = G.lifesteal - (old.lifesteal || 0);
  G._baseXpMul = (G.xpMul / ap.xp) - (old.xp || 0);
  G._baseShieldMax = G.shieldMax - (old.shield || 0) - ap.jobShield;
  G._baseBurnMul = G.burnMul / (old.burnMul || 1);
  G._baseDmgTaken = (G.dmgTakenMul / ap.jobDmg) - (old.dmgTaken || 0);
  G._baseMoveSpeed = G.moveSpeed / (1 + (old.spd || 0) / 100);
}
// 装备变更后重建缓存
function equipRec() {
  stripEquipFromCurrent();          // v7.3 P0+：先剥离旧装备增量，保住升级/卡片成长
  G._eqCache = equipBonuses();
  // v3.0：装备带来的增量叠加到玩家基础值（v6.0 C 祭坛赌注：atk/crit/xp 再乘修正）
  G.atk = (G._baseAtk + (G._eqCache.atk || 0)) * (G.altarBuffs.atkMul || 1);
  G.hpMax = (G._baseHpMax + (G._eqCache.hp || 0)) * (G.altarBuffs.hpMul || 1);
  G.hp = Math.min(G.hp, G.hpMax);
  G.moveSpeed = G._baseMoveSpeed * (1 + (G._eqCache.spd || 0) / 100);
  G.crit = G._baseCrit + (G._eqCache.crit || 0) + (G.altarBuffs.critAdd || 0);
  G.lifesteal = G._baseLS + (G._eqCache.lifesteal || 0);
  G.xpMul = (G._baseXpMul + (G._eqCache.xp || 0)) * (G.altarBuffs.xpMul || 1);
  G.shieldMax = G._baseShieldMax + (G._eqCache.shield || 0) + (G._jobShieldBonus || 0);
  G.burnMul = G._baseBurnMul * (G._eqCache.burnMul || 1);
  G.dmgTakenMul = Math.max(0.1, (G._baseDmgTaken + (G._eqCache.dmgTaken || 0)) * (G._jobDmgTakenMul || 1));
  // 记下本次真正应用过的乘区，供下一次剥离使用（见 stripEquipFromCurrent 注释）
  G._appliedMul = {
    atk: G.altarBuffs.atkMul || 1, hp: G.altarBuffs.hpMul || 1, xp: G.altarBuffs.xpMul || 1,
    critAdd: G.altarBuffs.critAdd || 0,
    jobDmg: G._jobDmgTakenMul || 1, jobShield: G._jobShieldBonus || 0,
  };
  // v4.0: 主动技能槽位同步
  G.activeSkills = G._eqCache.activeSkillIds.slice();
  G.passiveSkills = G._eqCache.passiveSkillIds.slice();
  // 确保 cd 数组长度对齐
  while (G.skillCD.length < G.activeSkills.length) G.skillCD.push(0);
  while (G.skillCD.length > G.activeSkills.length) G.skillCD.pop();
  // v4.0: 套装自动转职 —— 3 件同派系装备在槽位 ⇒ 自动设 G.jobPath = 同源道途 id
  autoJobFromSet();
  // v6.1: 法门自动择定 —— 转职后按套装主派系精修对应法门，可叠层至 Lv.3
  // v6.1: 武器觉醒 —— 按已装备的派系词条点亮 / 升级 / 觉醒 4 件武器
  //       必须排在法门之前：法门的境界判定要看「该派系武器是否已觉醒」
  syncWeaponsFromSet();
  // v6.1: 法门自动择定 —— 转职后按套装主派系精修对应法门，可叠层至 Lv.3
  syncJobBranchesFromSet();
  // v6.0 B: 词条联动 HUD 同步 + 新激活大字报
  synHudSync();
}

// v6.0 B 词条联动 HUD：显示已激活联动，新凑齐时弹大字报（"啊哈时刻"）
function synHudSync() {
  const ids = G._synergies || [];
  if (ui.synHudCount) ui.synHudCount.textContent = `${ids.length}/${SYNERGIES.length}`;
  if (ui.synHudList) {
    ui.synHudList.innerHTML = ids.map((id) => {
      const s = SYNERGY_BY_ID[id];
      return `<span class="syn-chip" style="--sc:${s.color}">${s.ico} ${s.name}</span>`;
    }).join("");
  }
  if (ui.synHud) ui.synHud.classList.toggle("hidden", ids.length === 0);
  const prev = G._synPrev || [];
  for (const id of ids) {
    if (prev.indexOf(id) < 0) {
      const s = SYNERGY_BY_ID[id];
      showBigBanner("词条联动", `${s.name} · ${s.desc}`, "purple");
      burst(G.px, G.py, s.color, 24, 220, 4);
      AudioSys.level();
    }
  }
  G._synPrev = ids.slice();
}

// v4.0 套装自动转职：本角色所有 9 套派系武器 3 件同派系 ⇒ 对应道途
function autoJobFromSet() {
  const schools = {};
  for (const slot in G.equipped) {
    const eq = G.equipped[slot];
    if (!eq) continue;
    const aff = (eq.affixes || []).find((a) => AFFIX_POOL[a] && AFFIX_POOL[a].school);
    if (!aff) continue;
    const sch = AFFIX_POOL[aff].school;
    schools[sch] = (schools[sch] || 0) + 1;
  }
  // 找套数最多的派系
  let bestSchool = null, bestN = 0;
  for (const s in schools) if (schools[s] > bestN) { bestN = schools[s]; bestSchool = s; }
  // v6.1：记下当前套装主派系（法门择定要用）
  // v7.6：这里原本也要求 3 件同派系才交出主派系 —— 这才是「法门境界整局 0 次」的真因：
  //   不是境界算法算错，是压根没人把主派系递过去，syncJobBranchesFromSet 开局就 return 了。
  //   入门改成 2 件（先让玩家看见法门），转职（下面那个分支）仍按 3 件 —— 分层，不是放水。
  G._setSchool = bestN >= 2 ? bestSchool : null;
  G._setCount = bestN;
  // v7.6：道途本就由角色决定，2 件同派系就先择定 —— 法门境界必须拿到 jobPath 才可能计算，
  //   原来 jobPath 只在 3 件时才给，等于把「法门」和「转职」绑成了同一道门槛。
  //   「套装转职」的大字报与仪式感仍留给 3 件 —— 里程碑还是里程碑，只是不再是唯一入口。
  const path0 = CHAR_TO_PATH[G.charId];
  if (bestN >= 2 && path0 && !G.jobPath) {
    G.jobPath = path0;
    G.jobStage = Math.max(G.jobStage || 0, 1);
    jobSyncHud(true);
  }
  // 任意派系集齐 3 件 ⇒ 转职
  if (bestN >= 3) {
    const path = CHAR_TO_PATH[G.charId];
    if (path && !G._jobAnnounced) {
      G._jobAnnounced = true;
      G.jobPath = path;
      G.jobStage = 1;
      jobSyncHud(true);
      toast(`套装转职 · ${(JOB_PATHS.find((p) => p.id === path) || {}).name || "道途"}`, "gold");
      burst(G.px, G.py, "#fde68a", 26, 240, 5);
      AudioSys.level();
      // v5.0 大字报：套装转职
      showBigBanner("套装转职", `${(JOB_PATHS.find((p) => p.id === path) || {}).name || "道途"} · ${bestSchool}派`, "job");
    }
    G._setBonus = (G._setBonus || 0) + 0;   // 占位扩展
  }
}
const CHAR_TO_PATH = { sword: "sword", mage: "mage", body: "body" };   // 角色→对应道途

// ============ v6.1 · 法门自动择定（修复 v4.0 断链） ============
// 病根：v4.0 砍掉「转职 3 选 1」弹窗后，JOB_PATHS 里 9 个法门的 apply() 再无人调用，
//      G.jobBranches 永远是 {}，HUD 常驻"未择法门"，9 个法门全是死内容。
// 修法：同样挂到「装备派系」上 —— 套装主派系决定精修哪一门，投入越深境界越高：
//      3 件同派系（转职）      ⇒ Lv.1
//      ＋该派系武器已觉醒      ⇒ Lv.2
//      ＋灵石槽也放同派系      ⇒ Lv.3
const SCHOOL_BRANCH_IDX = {
  赤锋: 0, 焚天: 1, 龙血: 2,
  霜晶: 0, 疾风: 1,
  雷灵: 2, 血煞: 0,
  玄铁: 1, 磐石: 2,
};
const JOB_BRANCH_MAX_LV = 3;

function jobWpLvAdd(key, n) {
  if (!G._jobWpLv) G._jobWpLv = { fire: 0, frost: 0, lightning: 0, array: 0 };
  G._jobWpLv[key] = (G._jobWpLv[key] || 0) + (n || 1);
}

function syncJobBranchesFromSet() {
  const school = G._setSchool;
  const path = jobPathOf(G.jobPath);
  if (!school || !path || !path.branches || !path.branches.length) return;
  const idx = SCHOOL_BRANCH_IDX[school] || 0;
  const b = path.branches[Math.min(idx, path.branches.length - 1)];
  if (!b) return;
  // 目标境界：转职 1 + 武器觉醒 1 + 灵石槽同派系 1
  const wk = SCHOOL_WEAPON[school];
  const evo = !!(wk && G.weapons && G.weapons[wk] && G.weapons[wk].evo);
  const stoneSame = !!(G._stoneSlot && G._stoneSlot.school === school);
  // v7.3：Lv3 保留为「集齐一整套同派系」的终局目标（觉醒门槛已因灵石槽下调，
  //       若 Lv3 只要求灵石槽 + 觉醒，则满级来得太快，「凑齐一套」这件事就没有意义了）
  let invest = 0;
  for (const slot in G.equipped) {
    const eq = G.equipped[slot];
    if (!eq) continue;
    if ((eq.affixes || []).some((a) => AFFIX_POOL[a] && AFFIX_POOL[a].school === school)) invest += 1;
  }
  const fullSet = invest >= 3;
  // v7.6 触达率修复：探针实测一整局（600 秒 / 42 级 / 3320 杀）法门境界 Lv1/2/3 触发次数全是 0。
  //   9 个法门是这一作最厚的一块内容，玩家一次都没见过，等于整块白做。
  //   根因：Lv1 就要「3 件同派系」—— 自动合成会吃掉紫装、掉落槽位随机，
  //   真实一局里凑齐 3 件同派系纯属概率事件。把入门降到 2 件：先让玩家看见「法门」这个概念，
  //   再让 Lv2（满套 / 觉醒）、Lv3（满套 + 本命灵石）去奖励深耕 —— 门槛是分层了，不是取消了。
  let target = 0;
  if (invest >= 2) target = 1;
  if (invest >= 3) target = 2;
  if (evo) target = Math.max(target, 2);
  if (target >= 2 && fullSet && stoneSame) target = 3;
  target = Math.min(JOB_BRANCH_MAX_LV, target);
  const cur = G.jobBranches[b.id] || 0;
  if (target <= cur) return;
  for (let i = cur; i < target; i++) {
    try { b.apply(); } catch (err) { /* 法门效果异常不阻断游戏 */ }
  }
  G.jobBranches[b.id] = target;
  // 武器等级受法门加成影响，重算一次（业火焚天等会 +1 级）
  syncWeaponsFromSet();
  jobSyncHud(true);
  showBigBanner("法门精修", `${b.name} · Lv.${target}`, "job");
  toast(`法门精修 · ${b.name} Lv.${target}`, "gold");
  AudioSys.level();
}

// v4.0 装备主动技能触发 —— v5.0 技能轮盘：J/K 优先按 CD 最小自动选
// 轮盘算法：固定 CD 最短优先（≤0 的可用技能里 CD 最小的那个先放）
// 仍然接受 idx 参数：>0 直接用 idx（手动锁）；-1 / undefined 走轮盘
function triggerEquipSkill(idx = -1) {
  let useIdx = idx;
  if (useIdx < 0) {
    // 轮盘：找 CD ≤ 0 的可用主动技能里"CD 上限"最小的（短 CD 优先放）
    let best = -1, bestDef = null;
    for (let i = 0; i < (G.activeSkills || []).length; i++) {
      const id = G.activeSkills[i];
      const def = AFFIX_POOL[id];
      if (!def || def.kind !== "active") continue;
      if ((G.skillCD[i] || 0) > 0) continue;
      if (best < 0 || (def.cd || 99) < (bestDef.cd || 99)) {
        best = i; bestDef = def;
      }
    }
    if (best < 0) {
      // 都在冷却中 → 提示
      const anyCd = (G.skillCD || []).findIndex((c) => c > 0);
      if (anyCd >= 0 && G._lastSklCDWarn !== "wheel") {
        toast(`技能轮转中 · ${G.skillCD[anyCd].toFixed(1)}s`, "warn");
        G._lastSklCDWarn = "wheel";
      }
      return false;
    }
    useIdx = best;
  }
  if (useIdx < 0 || useIdx >= G.activeSkills.length) return false;
  const id = G.activeSkills[useIdx];
  const def = AFFIX_POOL[id];
  if (!def || def.kind !== "active") return false;
  if ((G.skillCD[useIdx] || 0) > 0) {
    if (G._lastSklCDWarn !== id) { toast(`${def.name} · 冷却中（${G.skillCD[useIdx].toFixed(1)}s）`, "warn"); G._lastSklCDWarn = id; }
    return false;
  }
  // 各技能的 effect
  switch (id) {
    case "sk_fire_jet": {    // 炽焰喷射：喷 6 道火焰穿透
      const dmg = G.atk * 1.8 * playerDamageMult();
      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * TAU + (Math.random() - 0.5) * 0.2;
        G.projectiles.push({ x: G.px, y: G.py, vx: Math.cos(ang) * 380, vy: Math.sin(ang) * 380,
          life: 1.2, max: 1.2, pierce: 6, dmg, r: 8, color: "#fb923c", hitIds: new Set(), source: "sk_fire_jet" });
      }
      burst(G.px, G.py, "#fb923c", 18, 200, 4);
      spawnFloater(G.px, G.py - G.pr - 16, def.name, "#fb923c", 13);
      break;
    }
    case "sk_sword_array": { // 剑气护体：200 范围剑阵
      G.shieldMax = Math.max(G.shieldMax, 60);
      G.shield = Math.min(G.shieldMax, G.shield + 60);
      burst(G.px, G.py, "#7dd3fc", 22, 240, 4);
      spawnFloater(G.px, G.py - G.pr - 16, def.name + " · 护体", "#7dd3fc", 13);
      // 6s 内增伤
      G._swordArrayT = 6;
      break;
    }
    case "sk_wind_shadow": { // 疾风残影：留 3s 残影
      G._shadowT = 3;
      burst(G.px, G.py, "#86efac", 16, 180, 3);
      spawnFloater(G.px, G.py - G.pr - 16, def.name, "#86efac", 13);
      break;
    }
  }
  G.skillCD[useIdx] = def.cd || 5;
  AudioSys.hit();
  return true;
}

function pickUpEquip(eq) {
  if (G.inventory.length >= INVENTORY_MAX) {
    // 白绿自动卖，紫橙提示
    const tier = TIERS[eq.tier];
    if (!tier.equipable) {
      const gold = Math.round(8 * tier.mult);
      G.gold = (G.gold || 0) + gold;
      spawnFloater(G.px, G.py - G.pr - 18, `+${gold} 金 · ${eq.name}`, "#fbbf24", 10);
      return false;
    }
    // v7.3 P0：背包满时紫/橙不该被丢掉。
    // 探针实测：一局下来紫装 0 件 —— 背包被白绿装塞满后，妖王必掉的本派紫装直接蒸发，
    // 于是「3 件同派系觉醒」在真实一局里永远凑不出来，整条 build 线是空的。
    // 修法：自动卖掉背包里阶数最低的一件腾位（玩家不用手动清包）。
    let worstIdx = -1, worstRank = 99;
    for (let i = 0; i < G.inventory.length; i++) {
      const r = TIER_ORDER.indexOf(G.inventory[i].tier);
      if (r >= 0 && r < worstRank) { worstRank = r; worstIdx = i; }
    }
    if (worstIdx >= 0 && worstRank < TIER_ORDER.indexOf(eq.tier)) {
      const drop = G.inventory.splice(worstIdx, 1)[0];
      const gold = Math.round(8 * (TIERS[drop.tier] ? TIERS[drop.tier].mult : 1));
      G.gold = (G.gold || 0) + gold;
      toast(`背包腾位 · ${drop.name} 化作 ${gold} 金`, "warn");
    } else {
      toast(`背包满！${eq.name} 已丢弃`, "warn");
      return false;
    }
  }
  G.inventory.push(eq);
  const merged = autoMergeEquip();
  if (merged === 0) {
    spawnFloater(G.px, G.py - G.pr - 10, `${eq.name} +1`, eq.color, 10);
    burst(G.px, G.py, eq.color, 6, 110, 2);
  }
  invHudSync();
  // v5.0 PM 视角：紫装入手里程碑
  if (eq.tier === "purple" && !G._milestone.purple) {
    G._milestone.purple = true;
    showBigBanner("紫装入手", `第一件紫装 · ${eq.name}`, "purple");
    toast(`紫装入手 · ${eq.name} · 点背包换上`, "gold");
  }
  // v5.0 橙装觉醒：慢镜 + 屏幕震动 + 金色光柱 + 大字报
  if (eq.tier === "orange") {
    G._orangeT = 0.6;
    G._orangeName = eq.name;
    G.shake = Math.max(G.shake || 0, 12);
    hitStop(140);
    showBigBanner("橙装觉醒", `${eq.name} · 妖王赐福`, "orange");
    AudioSys.level();
    if (!G._milestone.orange) {
      G._milestone.orange = true;
      toast(`橙装觉醒 · ${eq.name}`, "gold");
    }
  }
  // v5.0 教程推进：第 2 步"捡起装备"
  if (G.tutStep === 2) advanceTutorial();
  return true;
}
// 装备 / 卸下槽位
function equipTo(uid) {
  const idx = G.inventory.findIndex((e) => e.uid === uid);
  if (idx < 0) return false;
  const eq = G.inventory[idx];
  if (!TIERS[eq.tier].equipable) { toast("白/绿/蓝只能在背包里", "warn"); return false; }
  const cur = G.equipped[eq.slot];
  if (cur) G.inventory.push(cur);                  // 卸下旧装备回背包
  G.equipped[eq.slot] = eq;
  G.inventory.splice(idx, 1);
  invHudSync();
  equipRec();
  return true;
}
function unequipTo(slot) {
  const cur = G.equipped[slot];
  if (!cur) return false;
  if (slot === "stone") {                          // v5.0 灵石槽卸下
    G._stoneSlot = null;
    equipRec();
    invHudSync();
    return true;
  }
  if (G.inventory.length >= INVENTORY_MAX) { toast("背包满，无法卸下", "warn"); return false; }
  G.equipped[slot] = null;
  G.inventory.push(cur);
  invHudSync();
  equipRec();
  return true;
}
// v5.0 装备/卸下灵石槽（独立函数：放任意派系灵石×1 → 该派系词条 ×1.30）
function setStoneSlot(stoneKey) {
  if (!stoneKey) {
    G._stoneSlot = null;
  } else {
    const def = STONE_BY_KEY[stoneKey];
    if (!def) return false;
    G._stoneSlot = { stoneKey, school: def.school, name: def.name, color: def.color };
  }
  equipRec();
  invHudSync();
  return true;
}
// ---------------------------------------------------------------------------
// v7.3 P0 · 灵石槽入口
// 审计发现：setStoneSlot() 全项目零调用 ⇒ 灵石槽 ×1.30 加成与法门境界 Lv3
// 玩家永远够不着（这是本项目第四次「系统写了但够不到」事故）。
// 修法：灵石槽不消耗灵石（只做派系抉择），入口开在两处——
//   ① HUD 常驻灵石条：点一颗已拥有的灵石即入槽（再点卸下）
//   ② 背包灵石槽位：显示当前本命灵石，点击卸下
// 校验：灵石被炼宝台消耗到 0 时自动卸下，避免出现「持有 0 颗却生效」的不一致
// ---------------------------------------------------------------------------
function toggleStoneSlot(stoneKey) {
  const def = STONE_BY_KEY[stoneKey];
  if (!def) return false;
  if (G._stoneSlot && G._stoneSlot.stoneKey === stoneKey) {
    setStoneSlot(null);
    toast(`取出灵石 · ${def.name}`, "warn");
    return true;
  }
  if (stoneAt(stoneKey) <= 0) { toast(`尚未获得「${def.name}」`, "warn"); return false; }
  setStoneSlot(stoneKey);
  toast(`本命灵石 · ${def.name}｜${def.school}系词条 ×1.30`, "gold");
  AudioSys.level();
  return true;
}
// 灵石被炼宝台耗尽后，槽位必须跟着失效
function validateStoneSlot() {
  if (!G._stoneSlot) return;
  if (stoneAt(G._stoneSlot.stoneKey) > 0) return;
  const nm = G._stoneSlot.name;
  G._stoneSlot = null;
  equipRec();
  toast(`「${nm}」已耗尽 · 灵石槽空置`, "warn");
}

// 装备属性汇总（v4.0：同时收集 主动/被动 技能）
function equipBonuses() {
  const b = { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, dmgTaken: 0,
              huoMul: 1, burnMul: 1,
              activeSkillIds: [], passiveSkillIds: [] };
  // v5.0 派系纯度：3 件同派系装备（武器/防具/饰品）⇒ 全派系词条 ×1.30
  // 计算各装备的"派系主词条"（取第一个带 school 的）
  const slotSchools = [];
  for (const slot in G.equipped) {
    if (slot === "stone") continue;
    const eq = G.equipped[slot];
    if (!eq) continue;
    const ax = (eq.affixes || []).find((a) => AFFIX_POOL[a] && AFFIX_POOL[a].school);
    slotSchools.push(ax ? AFFIX_POOL[ax].school : null);
  }
  let purity = 0;
  const valid = slotSchools.filter(Boolean);
  if (valid.length === slotSchools.length && slotSchools.length >= 3) {
    // 全有派系 ⇒ 取众数
    const counts = {};
    for (const s of valid) counts[s] = (counts[s] || 0) + 1;
    let top = 0, topSch = null;
    for (const s in counts) if (counts[s] > top) { top = counts[s]; topSch = s; }
    purity = top / 3;
  } else if (valid.length >= 2) {
    const counts = {};
    for (const s of valid) counts[s] = (counts[s] || 0) + 1;
    let top = 0;
    for (const s in counts) if (counts[s] > top) top = counts[s];
    purity = (top - 1) / 3;     // 2/3 → 0.33; 3/3 → 0.67
  }
  // 派系纯度系数：3 件全同 ⇒ ×1.30；2 件同 ⇒ ×1.10
  const purityMul = purity >= 0.95 ? (1 + PURITY_BONUS)
                  : purity >= 0.55 ? (1 + PURITY_PARTIAL)
                  : 1;
  G._purity = purityMul;
  // v5.0 灵石槽位加成：装了某派系灵石 ⇒ 该派系词条 ×1.30
  const stoneSchool = G._stoneSlot && G._stoneSlot.school;
  for (const slot in G.equipped) {
    const eq = G.equipped[slot];
    if (!eq) continue;
    b.atk += eq.atk || 0;
    b.hp += eq.hp || 0;
    b.spd += eq.spd || 0;
    for (const ax of eq.affixes) {
      const def = AFFIX_POOL[ax];
      if (def && def.type === "技能") {
        if (def.kind === "active") {
          if (!b.activeSkillIds.includes(ax)) b.activeSkillIds.push(ax);
        } else {
          if (!b.passiveSkillIds.includes(ax)) b.passiveSkillIds.push(ax);
        }
        continue;
      }
      // v5.0 派系词条按纯度 + 灵石槽加成
      const isSchool = def && def.school;
      const stoneBoost = (isSchool && stoneSchool && def.school === stoneSchool)
        ? STONE_SLOT_BONUS + (G._stoneBoostAdd || 0) : 0;   // v7.3 变类卡「灵石亲和」
      const mult = purityMul * (1 + stoneBoost);
      switch (ax) {
        case "huo_dmg":     b.huoMul += 0.12 * mult; break;
        case "mu_speed":    b.spd += 8 * mult; break;
        case "shui_slow":   /* 命中减速 +10%（在 applyHit 里实现） */ break;
        case "jin_crit":    /* 击杀回血 +5（在 killEnemy 里实现） */ break;
        case "tu_shield":   b.shield += 10 * mult; break;
        case "huo_burn":    b.burnMul += 0.25 * mult; break;
        case "jin_thunder": /* 雷伤 +25% */ break;
        case "huo_fire":    /* 受击火反伤 +15 */ break;
        case "jin_iron":    b.dmgTaken -= 0.08 * mult; break;
        case "crit_pct":    b.crit += 0.05 * mult; break;
        case "haste_pct":   /* 急速 +8%（atkSpeedNow 已支持 G._eqCache.haste）*/ break;
        case "lifesteal":   b.lifesteal += 2 * mult; break;
        case "xp_bonus":    b.xp += 0.15 * mult; break;
        case "shield_max":  b.shield += 15 * mult; break;
      }
    }
  }
  // 主动槽只保留 MAX_ACTIVE_SLOTS 个（按装备装槽顺序 = weapon → armor → accessory）
  if (b.activeSkillIds.length > MAX_ACTIVE_SLOTS) {
    b.activeSkillIds = b.activeSkillIds.slice(0, MAX_ACTIVE_SLOTS);
  }
  // v6.0 B · 词条联动：收集身上所有词条，need 全中即激活（机制质变，非数值叠加）
  const allAx = new Set();
  for (const sl in G.equipped) {
    if (sl === "stone") continue;
    const eq = G.equipped[sl];
    if (!eq) continue;
    for (const ax of (eq.affixes || [])) allAx.add(ax);
  }
  b.synergies = SYNERGIES.filter((s) => s.need.every((n) => allAx.has(n))).map((s) => s.id);
  G._synergies = b.synergies;
  return b;
}

// ---------- 派系核心（v2.0） ----------
// 攒齐 5 颗同派系灵石即可解锁；最多同时装备 2 个；效果是"永久被动 + 终极技能"
const SCH_CORES = [
  // 赤锋派（火）—— 焚天剑阵
  { id: "sc_chifeng", school: "赤锋", elem: "huo", char: "sword",
    name: "焚天剑阵", ico: "焚", color: "#fb923c",
    desc: "每 8 秒释放 8 道剑气，攻击 ×200% 范围伤害（最远 240）",
    onEquip() { G.schoolFx.fentian = true; },
    onUnequip() { G.schoolFx.fentian = false; },
    tick(dt) {
      G._coreFireT = (G._coreFireT || 0) - dt;
      if (G._coreFireT <= 0) {
        G._coreFireT = 8;
        AudioSys.skill();
        const mv = readMove();
        const baseAng = (Math.hypot(mv.x, mv.y) > 0.1) ? Math.atan2(mv.y, mv.x) : rand(0, TAU);
        for (let i = 0; i < 8; i++) {
          const ang = baseAng + (i / 8) * TAU;
          G.projectiles.push({
            kind: "sword", x: G.px, y: G.py,
            vx: Math.cos(ang) * 520, vy: Math.sin(ang) * 520,
            r: 10, dmg: G.atk * 2 * playerDamageMult(),
            pierce: 999, life: 0.6, hitIds: new Set(),
            color: "#fb923c", big: true,
          });
        }
        burst(G.px, G.py, "#fb923c", 28, 220, 5);
        G.shake = Math.max(G.shake, 5);
        spawnFloater(G.px, G.py - G.pr - 18, "焚天剑阵", "#fb923c", 14, true);
      }
    } },
  // 疾风派（木）—— 御风化神
  { id: "sc_jifeng", school: "疾风", elem: "mu", char: "sword",
    name: "御风化神", ico: "风", color: "#86efac",
    desc: "永久移速 +20%、御风 CD -50%、受击免伤 5%",
    onEquip() { G.schoolFx.yufeng = true; G.moveSpeed *= 1.20; G.dashCD *= 0.5; G.dmgTakenMul *= 0.95; },
    onUnequip() { G.schoolFx.yufeng = false; G.moveSpeed /= 1.20; G.dashCD /= 0.5; G.dmgTakenMul /= 0.95; } },
  // 血煞派（金）—— 血月当空
  { id: "sc_xuesha", school: "血煞", elem: "jin", char: "sword",
    name: "血月当空", ico: "血", color: "#f87171",
    desc: "HP <30% 时全伤 ×2.0；击杀回血 +10",
    onEquip() { G.schoolFx.xuesha = true; G.lifesteal += 10; },
    onUnequip() { G.schoolFx.xuesha = false; G.lifesteal -= 10; },
    damageMult(m) {
      if (G.schoolFx.xuesha && G.hp < G.hpMax * 0.3) m *= 2.0;
      return m;
    } },
  // 雷灵派（金）—— 九霄雷域
  { id: "sc_leiling", school: "雷灵", elem: "jin", char: "mage",
    name: "九霄雷域", ico: "雷", color: "#c084fc",
    desc: "每秒对周围 200 范围造成攻击 ×30% 雷电伤害",
    onEquip() { G.schoolFx.leiling = true; },
    onUnequip() { G.schoolFx.leiling = false; },
    tick(dt) {
      G._coreLeiYuT = (G._coreLeiYuT || 0) + dt;
      if (G._coreLeiYuT >= 1) {
        G._coreLeiYuT -= 1;
        const dmg = G.atk * 0.3 * playerDamageMult();
        let hit = 0;
        for (const e of G.enemies) {
          if (e.dead) continue;
          if (dist(e.x, e.y, G.px, G.py) < 200) {
            applyHit(e, dmg);
            hit++;
            if (hit >= 8) break;
          }
        }
        burst(G.px, G.py, "#c084fc", 6, 110, 2);
      }
    } },
  // 霜晶派（水）—— 绝对零度
  { id: "sc_shuangjing", school: "霜晶", elem: "shui", char: "mage",
    name: "绝对零度", ico: "冻", color: "#93c5fd",
    desc: "命中 50% 概率冰封 1.5 秒；受冰封目标受伤害 +30%",
    onEquip() { G.schoolFx.shuangjing = true; },
    onUnequip() { G.schoolFx.shuangjing = false; },
    onHit(e) {
      if (G.schoolFx.shuangjing && Math.random() < 0.5) {
        e.slow = 1.5; e.slowMul = 0.0;
        e.frozen = Math.max(e.frozen || 0, 1.5);
        spawnFloater(e.x, e.y - e.r, "冻结", "#93c5fd", 12);
        burst(e.x, e.y, "#bae6fd", 6, 80, 2);
      }
    } },
  // 焚天派（火）—— 朱雀降世
  { id: "sc_fentianshi", school: "焚天", elem: "huo", char: "mage",
    name: "朱雀降世", ico: "雀", color: "#fb923c",
    desc: "灼烧伤害 ×3；灼烧扩散到周围敌人（200 范围）",
    onEquip() { G.schoolFx.fentianshi = true; G.burnMul *= 3; },
    onUnequip() { G.schoolFx.fentianshi = false; G.burnMul /= 3; },
    onHit(e, d) {
      if (G.schoolFx.fentianshi && e.burn) {
        for (const e2 of G.enemies) {
          if (e2.dead || e2.id === e.id) continue;
          if (dist(e2.x, e2.y, e.x, e.y) < 200) {
            e2.burn = Math.max(e2.burn || 0, 1.5);
            e2.burnDmg = Math.max(e2.burnDmg || 0, d * 0.2);
          }
        }
      }
    } },
  // 玄铁派（金）—— 金刚不坏
  { id: "sc_xuantie", school: "玄铁", elem: "jin", char: "body",
    name: "金刚不坏", ico: "铁", color: "#cbd5e1",
    desc: "护盾上限 ×2，再生 +5/s；受击 30% 完全免伤",
    onEquip() {
      G.schoolFx.xuantie = true;
      G.shieldMax *= 2; G.shield = Math.min(G.shieldMax, G.shield * 2);
      G.gemFx.shieldRegen = (G.gemFx.shieldRegen || 0) + 5;
    },
    onUnequip() {
      G.schoolFx.xuantie = false;
      G.shieldMax = Math.ceil(G.shieldMax / 2);
      G.shield = Math.min(G.shieldMax, G.shield);
      G.gemFx.shieldRegen = Math.max(0, (G.gemFx.shieldRegen || 0) - 5);
    },
    tick(dt) {
      // 装备时：每帧给玩家 +5/s 护盾回复（叠加在 gemFx.shieldRegen 之外，这里靠 shieldRegen 已经包含）
    },
    damageTaken(a) {
      if (G.schoolFx.xuantie && Math.random() < 0.3) return 0;
      return a;
    } },
  // 龙血派（火）—— 浴火重生
  { id: "sc_longxue", school: "龙血", elem: "huo", char: "body",
    name: "浴火重生", ico: "龙", color: "#f87171",
    desc: "HP 归零时满血复活一次（每局限一次）",
    onEquip() { G.schoolFx.longxue = true; G._coreDiedOnce = false; },
    onUnequip() { G.schoolFx.longxue = false; },
    onDeathCheck() {
      if (G.schoolFx.longxue && !G._coreDiedOnce) {
        G._coreDiedOnce = true;
        G.hp = G.hpMax; G.shield = G.shieldMax; G.invuln = 2;
        burst(G.px, G.py, "#f87171", 36, 260, 6);
        G.shake = Math.max(G.shake, 10);
        AudioSys.level();
        spawnFloater(G.px, G.py - G.pr - 18, "浴火重生", "#f87171", 16, true);
        toast("浴火重生 · 复活一次", "violet");
        return true;   // 取消死亡
      }
      return false;
    } },
  // 磐石派（土）—— 镇岳之势
  { id: "sc_panshishi", school: "磐石", elem: "tu", char: "body",
    name: "镇岳之势", ico: "磐", color: "#d6a86a",
    desc: "受击反伤 50%；每次受击护盾 +5（上限 100）",
    onEquip() {
      G.schoolFx.panshishi = true;
      G.thorns = (G.thorns || 0) + 0.5;
    },
    onUnequip() {
      G.schoolFx.panshishi = false;
      G.thorns = Math.max(0, (G.thorns || 0) - 0.5);
    },
    tick(dt) {
      G._coreFenshiT = (G._coreFenshiT || 0);
    } },
];
const SCH_CORE_BY_ID = Object.fromEntries(SCH_CORES.map((c) => [c.id, c]));
const SCH_CORE_BY_SCHOOL = Object.fromEntries(SCH_CORES.map((c) => [c.school, c]));

// 当前角色的所有派系核心
function coresOfChar() { return SCH_CORES.filter((c) => c.char === G.charId); }
function coresEquipped() { return (G.cores || []).map((id) => SCH_CORE_BY_ID[id]).filter(Boolean); }
function coresHasSlot() { return (G.cores || []).length < MAX_SCHOOL_CORES; }
function canUnlockCore(school) {
  const def = SCH_CORE_BY_SCHOOL[school];
  if (!def || def.char !== G.charId) return false;
  if (G.schoolUnlocked && G.schoolUnlocked[school]) return false;
  return countSchool(school) >= CORE_NEED_STONES;
}
// v4.0 自动解锁：每次灵石数变化时检查所有派系，凑齐 5 颗就 unlock
function autoUnlockCoreCheck(school) {
  const checkList = school ? [school] : Object.keys(STONE_BY_SCHOOL);
  for (const s of checkList) if (canUnlockCore(s)) unlockCore(s);
}
function unlockCore(school) {
  if (!canUnlockCore(school)) return false;
  const def = SCH_CORE_BY_SCHOOL[school];
  if (!spendSchool(school, CORE_NEED_STONES)) return false;   // 真正花掉 5 颗同派系灵石
  G.schoolUnlocked[school] = true;
  // 自动装上（如果槽位有空）；满了就放进"未装备"池，玩家可手动换上
  if (coresHasSlot()) {
    equipCore(def.id);
  }
  burst(G.px, G.py, def.color, 32, 240, 5);
  G.shake = Math.max(G.shake, 8);
  AudioSys.level();
  G.goldFlash = Math.max(G.goldFlash || 0, 0.4);
  spawnFloater(G.px, G.py - G.pr - 22, `觉醒 · ${def.name}`, def.color, 18, true);
  toast(`派系核心觉醒 · ${def.name}`, "violet");
  // v5.0 大字报：派系核心觉醒
  showBigBanner("派系核心觉醒", `${def.name} · ${school}派`, "purple");
  return true;
}
function equipCore(id) {
  const def = SCH_CORE_BY_ID[id];
  if (!def || def.char !== G.charId) return false;
  if (!G.schoolUnlocked[def.school]) return false;
  if ((G.cores || []).includes(id)) return true;   // 已装备
  if ((G.cores || []).length >= MAX_SCHOOL_CORES) return false;
  G.cores.push(id);
  if (def.onEquip) def.onEquip();
  return true;
}
function unequipCore(id) {
  const def = SCH_CORE_BY_ID[id];
  if (!def) return false;
  const i = (G.cores || []).indexOf(id);
  if (i < 0) return false;
  G.cores.splice(i, 1);
  if (def.onUnequip) def.onUnequip();
  return true;
}
function spendSchool(school, n) {
  // 从同派系多颗灵石中花掉 n 颗（解锁/淬体用），优先花「非主石」即不破坏你在攒的宝石主石
  const arr = (STONE_BY_SCHOOL[school] || []).slice();
  arr.sort((a, b) => stoneAt(a.key) - stoneAt(b.key));
  let left = n;
  for (const st of arr) {
    if (left <= 0) break;
    const take = Math.min(stoneAt(st.key), left);
    if (take > 0) { G.stones[st.key] -= take; left -= take; }
  }
  return left === 0;
}

// 当前角色的三系专属灵石
function stonesOf(charId) { return CHAR_STONES[charId || G.charId] || CHAR_STONES.sword; }
function stoneKeys() { return stonesOf().map((s) => s.key); }
function stoneTotal() {
  const st = G.stones || {};
  return stoneKeys().reduce((s, k) => s + (st[k] || 0), 0);
}
function stoneAt(key) { return (G.stones && G.stones[key]) || 0; }
function schoolOf(key) { const s = STONE_BY_KEY[key]; return s ? s.school : null; }
function schoolElem(school) { const arr = STONE_BY_SCHOOL[school]; return arr && arr[0] ? arr[0].elem : null; }
function countSchool(school) {
  const arr = STONE_BY_SCHOOL[school] || [];
  let n = 0;
  for (const st of arr) n += stoneAt(st.key);
  return n;
}
function gemsOf(charId) { return GEMS.filter((g) => g.char === (charId || G.charId)); }
function gemSlotsUsed() { return Object.keys(G.gems || {}).length; }
function waveElemKey() {
  return ELEMENTS[(Math.max(1, G.wave) - 1) % ELEMENTS.length].key;
}
// 加权掉落：本角色 3 派系 9 颗权重 ×3，其他 6 派系 18 颗权重 ×1
// ⇒ 本派系实际占比 ≈ 9×3 / (9×3 + 18×1) = 60%
function randStone() {
  const pool = [];
  const my = new Set(stoneKeys());
  for (const st of STONES_ALL) {
    const w = my.has(st.key) ? 3 : 1;
    for (let i = 0; i < w; i++) pool.push(st.key);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ---------- 五行相生相克 ----------
// 相克：金克木 · 木克土 · 土克水 · 水克火 · 火克金
// 相生：金生水 · 水生木 · 木生火 · 火生土 · 土生金
// 每波妖物统一带当前波属性；你已铸的专属按「最优那一行」参与判定。
const ELEM_OVERCOME = { jin: "mu", mu: "tu", tu: "shui", shui: "huo", huo: "jin" };
const ELEM_GENERATE = { jin: "shui", shui: "mu", mu: "huo", huo: "tu", tu: "jin" };
// 三道侣伴五行：剑道火/木/金；玄法金/水/火；体道金/火/土。道途与这些元素共鸣时视为「同属」
const PATH_ELEMS = {
  sword: new Set(["huo", "mu", "jin"]),
  mage:  new Set(["jin", "shui", "huo"]),
  body:  new Set(["jin", "huo", "tu"]),
};
const REL_SAME = { key: "same", mul: 1, tag: "", color: null };
const REL_BEAT = { key: "beat", mul: 1.35, tag: "克", color: "#fbbf24" };    // 我克它
const REL_LOSE = { key: "lose", mul: 0.8, tag: "被克", color: "#93c5fd" };   // 它克我
const REL_FED = { key: "fed", mul: 1.15, tag: "得生", color: "#86efac" };    // 它生我
const REL_DRAIN = { key: "drain", mul: 0.9, tag: "泄力", color: "#94a3b8" }; // 我生它

function elemRelation(atkElem, defElem) {
  if (!atkElem || !defElem || atkElem === defElem) return REL_SAME;
  if (ELEM_OVERCOME[atkElem] === defElem) return REL_BEAT;
  if (ELEM_OVERCOME[defElem] === atkElem) return REL_LOSE;
  if (ELEM_GENERATE[defElem] === atkElem) return REL_FED;
  if (ELEM_GENERATE[atkElem] === defElem) return REL_DRAIN;
  return REL_SAME;
}
// 多颗宝石时取「最优那一行」；若全是被克，就老实吃下减益
// 五行由「流派宝石」的灵石属性决定，通用装备不参与
function bestElemRelation(defElem) {
  if (!defElem) return REL_SAME;
  const ids = Object.keys(G.gems || {});
  if (!ids.length) return REL_SAME;
  let best = null;
  for (const id of ids) {
    const d = GEM_BY_ID[id];
    if (!d) continue;
    const r = elemRelation(d.elem, defElem);
    if (!best || r.mul > best.mul) best = r;
  }
  return best || REL_SAME;
}
function elemMulVs(defElem) { return bestElemRelation(defElem).mul; }
// 专属装备的克制/被克文案，用于铸器台与灵髓弹窗
function elemMatchText(elem) {
  const beats = ELEM_KEYS.filter((k) => ELEM_OVERCOME[elem] === k)[0];
  const loses = ELEM_KEYS.filter((k) => ELEM_OVERCOME[k] === elem)[0];
  return `克${ELEM_BY_KEY[beats].name} · 被${ELEM_BY_KEY[loses].name}克`;
}

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
    // v7.7 阴影是 Canvas2D 上最贵的一笔开销：一旦掉帧就永久关掉，
    //   宁可少一层光晕，也不让真机在尸潮/试炼高潮时把填充率打穿。
    if (this.fps < 45) { this._slow = (this._slow || 0) + 1; } else { this._slow = 0; }
    if (this._slow >= 2) { shadowOff(); this._slow = 0; }
    // v7.7 内存护栏：堆逼近上限时提前降档（爆堆在手机上直接表现为「页面崩溃」）
    const pm = (typeof performance !== "undefined") && performance.memory;
    if (pm && pm.usedJSHeapSize > 260 * 1048576 && this.level !== "low") {
      this.level = "low"; this._bad = 0; this._cool = 4; this.apply();
      try { resize(); } catch (_) {}
    }
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
// v7.7 · 最大画布像素预算。
//   真机上「页面崩溃」最常见的形态不是 JS 报错，而是 canvas backing store 把显存顶穿：
//   dpr 只按倍率封顶是不够的 —— 一台 2K/3K 宽的高分屏手机，即使 dpr 只给 2，
//   实际像素也能到 800 万以上（800 万 × 4 字节 ≈ 32MB 起步，加上合成层就爆了）。
//   所以这里按「总像素」封顶：超过预算就把 dpr 往回压，画面略糊，但绝不能崩。
const MAX_CANVAS_PX = 2600000;
function resize() {
  const rect = ui.app ? ui.app.getBoundingClientRect() : null;
  let w = rect && rect.width ? Math.round(rect.width) : window.innerWidth;
  let h = rect && rect.height ? Math.round(rect.height) : window.innerHeight;
  if (w < 1 || h < 1) { w = window.innerWidth; h = window.innerHeight; }
  view.w = w; view.h = h;
  view.dpr = Math.min(window.devicePixelRatio || 1, Quality.dprCap());
  if (view.w * view.h * view.dpr * view.dpr > MAX_CANVAS_PX) {
    view.dpr = Math.max(0.75, view.dpr * Math.sqrt(MAX_CANVAS_PX / (view.w * view.h * view.dpr * view.dpr)));
  }
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
    // v7.0 C 瞬步：双击摇杆区即冲刺（手机单手可达，不用去够技能键）
    const nowT = (typeof performance !== "undefined" ? performance.now() : Date.now());
    if (nowT - (input._lastTap || 0) < 280) { input._lastTap = 0; vibe(12); castSkill(1); }
    else input._lastTap = nowT;
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
  // v4.0 装备主动技能槽：J 触发槽 0，K 触发槽 1
  if (k === "j" || k === "3") triggerEquipSkill(0);
  if (k === "k" || k === "4") triggerEquipSkill(1);
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
  // v7.4 玄铁试炼桩（伤害测试者）状态
  trial: null, trialResult: null, _trialWave: 0, _trialCardT: 0,
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
  // 方环试炼（square_loop）：独立状态，不与 endless 共用 enemies
  modeId: "endless",
  square: null,
  // 剑阵
  nodes: [], nodeInside: null, nodeActive: false, nodeHoldT: 0, nodeBonus: 0,
  nodeAtkMul: 1, nodeXpMul: 1, nodeDmgTakenMul: 1, nodeMoveMul: 1,
  nodeHoldBonus: 0, dmgTakenMul: 1,
  // 转职（3 系 × 3 分支）
  jobStage: 0, jobPath: null, jobBranches: {},
  // 法宝 & 灵兽
  relics: [], pendingRelic: 0, beast: null,
  burnMul: 1, thunderProc: 0,
  // 角色专属灵石 & 流派宝石（三系择二的岔路）
  stones: { chifeng: 0, jifeng: 0, xuesha: 0 },
  gems: {}, ordinary: [], gemFx: {}, pendingEssence: 0,
  meltCount: 0, hasteT: 0, regenT: 0,
  // v3.0 装备系统（背包 + 3 槽位）
  inventory: [], equipped: { weapon: null, armor: null, accessory: null },
  _eqCache: { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, dmgTaken: 0,
              huoMul: 1, burnMul: 1,
              activeSkillIds: [], passiveSkillIds: [] },
  // v4.0 装备主动技能槽（J/K = 3/4）：存当前 CD + 装备附带的技能 id
  activeSkills: [], passiveSkills: [], skillCD: [],
  // v4.0 装备主动技能状态
  _swordArrayT: 0, _shadowT: 0,
  // v5.0 PM 视角
  tutStep: 0,                       // 0=关闭 / 1=教学1 / 2=教学2 / 3=教学3 / 4=完成
  _bigBannerT: 0, _bigBannerMode: "",
  _stoneSlot: null,                 // v5.0 灵石槽位：{ stoneKey, school } | null
  _purity: 0,                       // v5.0 派系纯度 0~1
  _milestone: { purple: false, job: false, school: false, orange: false },
  _orangeT: 0, _orangeName: "",
  // v6.0 A 怪物词缀 / B 词条联动 / C 祭坛赌注
  _synergies: [],                   // B：当前激活的联动 id 列表
  zones: [],                        // A：冰霜力场等地面区域
  altars: [],                       // C：场上祭坛
  _frenzyT: 0,                      // B：狂血剩余秒数
  altarBuffs: { atkMul: 1, hpMul: 1, moveMul: 1, xpMul: 1, dropUp: 0, curseSpeed: 1, critAdd: 0 },
  _altarWave: 0,                    // C：上次刷祭坛的波次
  // v7.0 A 合击 / B 尸潮 / C 瞬步·狂血
  blasts: [],                       // A：延时爆点队列
  afterimages: [],                  // C：瞬步剑影（带伤害判定）
  fusions: [],                      // A：已解锁合击 [{ id, cdLeft, cd }]
  _horde: null,                     // B：尸潮状态
  _hordeWave: 0,
  _frenzyCD: 0,                     // C：狂血内置 CD
  _blinkT: 0,                       // C：瞬步残影生成计时
  _chainDepth: 0, _chainKills: 0,   // B2：连锁击杀
  act: 0, ultCharge: 0, ultStock: 2, ultCasting: 0,
  kbX: 0, kbY: 0,
};

function resetRun(charId) {
  const shop = Meta.statsFromShop();
  G.charId = charId || Meta.load().selectedChar || "sword";
  G.hitStop = 0;
  G.time = 0; G.wave = 0; G.kills = 0; G.waveTimer = 0.8;
  G.act = 0; // tickActs 在 wave>=1 时进入第一幕（避免 wave=0 误判幕三）
  G.ultCharge = 0;
  G.ultStock = ULT.stockInit;
  G.ultCasting = 0;
  G.spawnQueue = []; G._trickle = 0;
  // v7.4 玄铁试炼桩状态复位（否则上一局的试炼进度会带进新一局）
  G.trial = null; G.trialResult = null; G._trialWave = 0; G._trialCardT = 0;
  G._trialCrackT = 0; G._insightWp = {}; G._insightHinted = false; G._jobAnnounced = false;   // v7.6
  // v7.6 悟道便签：上一局残留的便签必须清干净，否则新一局开局就糊着旧卡
  if (G._autoNotes && G._autoNotes.length) {
    for (const n of G._autoNotes) { try { n.el.remove(); } catch (_) { /* noop */ } }
  }
  G._autoNotes = [];
  if (ui.autoNote) ui.autoNote.innerHTML = "";
  if (ui.trialHud) ui.trialHud.classList.add("hidden");
  hideTrialCard();
  G.px = 0; G.py = 0;
  G.hpMax = 100 + shop.hpBonus;
  G.hp = G.hpMax;
  G.mpMax = 50; G.mp = 50; G.mpRegen = 2.5;
  G.level = 1; G.xp = 0; G.xpNeed = 20;
  G.atk = 12 * (1 + shop.atkMul);
  G.atkSpeed = 1.1;
  G.moveSpeed = 170 * (1 + shop.spdMul);
  G.crit = 0.08; G.critMul = 1.8; G.lifesteal = 0;
  // v7.1：开局给 2 把环绕飞剑（原来 1 把，割不动也看不出「割草」）
  G.swordCount = 2 + Math.floor(shop.swordBonus / 2);
  G.swordOrbit = 52; G.swordSize = 10; G.swordPierce = 0;
  G.aoeAngle = 1.1; G.aoeDamageMul = 1.4; G.aoeRange = 110;
  G.dashSpeedMul = 2.1; G.dashTime = 0.35; G.dashCD = 5;
  G.dashCDLeft = 0; G.dashIFrame = 0;
  G.shield = 0; G.shieldMax = 0;
  G.xpMul = 1 + shop.xpMul;
  G.lowHpBonus = 0; G.chain = 0; G.thorns = 0;
  G.aoeCD = 4; G.aoeCDLeft = 0;
  G.swordTimer = 0; G.swordPhase = 0; G.invuln = 0; G.flash = 0; G.shake = 0; G.goldFlash = 0;
  G.anim = { movePhase: 0, atkT: 0, dashT: 0 };
  G.kbX = 0; G.kbY = 0;
  G.deathCause = "";
  G._lastDmgCause = "";
  G._pendingCause = "";
  G._waveMod = null;
  G.ultReady = 0;
  G.enemies = []; G.projectiles = []; G.particles = []; G.floaters = []; G.pickups = [];
  G.bossBanner = 0; G.arenaR = 1400; G.slash = null; G.pendingLevel = 0;
  G.waveBanner = 0; G.waveBannerText = "";
  G.trail = [];
  G.playerHurt = 0;
  G.shieldHit = 0;
  G.combo = 0; G.comboTimer = 0; G.comboPeak = 0; G.comboMul = 1;
  G.coinsRun = 0;
  // 方环试炼状态复位（modeId 由选模式入口写入，这里只清局内）
  G.square = null;
  G._sqAtkT = 0;
  G._sqPeak = 0;
  G._sqSettled = false;
  G._adDoubleUsed = false;
  G.nodeBonus = 0;
  G.nodeHoldBonus = 0;
  G.dmgTakenMul = 1;
  G.jobStage = 0; G.jobPath = null; G.jobBranches = {};
  G.relics = []; G.pendingRelic = 0; G.beast = null;
  G.burnMul = 1; G.thunderProc = 0;
  // v7.3 P2 变类卡字段统一归位（否则重开一局会带着上局的强化）
  G._burstCut = 0; G._afterLifeAdd = 0; G._afterDmgMul = 1; G._afterExtra = 0;
  G._execLv = 0; G._zoneLv = 0; G._elemBeatAdd = 0; G._stoneBoostAdd = 0;
  G.stones = {};
  for (const st of STONES_ALL) G.stones[st.key] = 0;   // 全部 27 颗都可拾取
  G.gems = {}; G.gemFx = {}; G.pendingEssence = 0;
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };   // v3.0 装备系统
  G._eqCache = { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, dmgTaken: 0,
                 huoMul: 1, burnMul: 1,
                 activeSkillIds: [], passiveSkillIds: [] };
  // v4.0 主动技能状态
  G.activeSkills = []; G.passiveSkills = []; G.skillCD = [];
  G._swordArrayT = 0; G._shadowT = 0;
  // v3.0 装备系统基础值（reset 后装备带来的增量叠加用）
  G._baseAtk = G.atk; G._baseHpMax = G.hpMax; G._baseMoveSpeed = G.moveSpeed;
  G._baseCrit = G.crit; G._baseLS = G.lifesteal; G._baseXpMul = G.xpMul;
  G._baseShieldMax = G.shieldMax; G._baseBurnMul = G.burnMul;
  G._baseDmgTaken = G.dmgTakenMul;
  G.cores = []; G.schoolUnlocked = {}; G.schoolFx = {};
  G._coreFireT = 0; G._coreZhenboT = 0; G._coreLeiYuT = 0; G._coreFenshiT = 0; G._coreBingfengT = 0; G._coreDiedOnce = false;
  G.meltCount = 0; G.hasteT = 0; G.regenT = 0;
  G._schoolHinted = null;
  G._forgeHinted = false;
  G.resonance = recomputeResonance();
  equipRec();   // v3.0 装备缓存初始化（先空）
  invHudSync();
  initNodes();
  // v5.0 灵石槽 + 派系纯度 + 里程碑 + 教程
  G._stoneSlot = null;
  G._stoneHinted = false;   // v7.3：首次拾到灵石时的入槽引导，只提示一次
  G._purity = 0;
  G._milestone = { purple: false, job: false, school: false, orange: false };
  G.tutStep = 1;
  // v6.0 A/B/C
  G._synergies = [];
  G.zones = [];
  G.altars = [];
  G._frenzyT = 0;
  G.altarBuffs = { atkMul: 1, hpMul: 1, moveMul: 1, xpMul: 1, dropUp: 0, curseSpeed: 1, critAdd: 0 };
  G._altarWave = 0;
  G._altarPickup = 0;
  G._synPrev = [];
  // v7.0 A/B/C
  G.blasts = [];
  G.afterimages = [];
  G.fusions = [];
  G._horde = null;
  G._hordeWave = 0;
  G._frenzyCD = 0;
  G._blinkT = 0;
  G._chainDepth = 0;
  // v7.2 打击感节流状态
  G._comboBurstT = 0;
  G._dmgNumT = -9;
  G.bounty = null;            // v7.2 悬赏令
  G._chainKills = 0;
  G._hurtCD = 0;
  G._openingRush = true;      // v7.1：开局试炼潮
  G._upgradeTaken = {};       // v7.1：悟道突破已选卡计数
  G.pendingLevel = 0;
  if (ui.levelModal) ui.levelModal.classList.add("hidden");
  if (ui.hordeBar) ui.hordeBar.classList.add("hidden");
  if (ui.frenzyHud) ui.frenzyHud.classList.add("hidden");
  fusionHudSync();
  synHudSync();
  G._orangeT = 0; G._orangeName = "";
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
  spawnBeast();   // 契约的灵兽入场
  // v6.1：G.weapons 在 equipRec 之后才重建，这里补一次武器同步（开局全 0）
  syncWeaponsFromSet();
}

// ---------- Upgrades ----------
// v4.0 砍掉「升级 3 选 1」面板：所有被动成长都在 gainXP 完成
// 升级弹窗 / buildUpgradePool / rollUpgrades / pendingChoices 已全部删除
// ================= v7.1 · 悟道突破（升级三选一） =================
// 病根（v4.0 留下的）：砍掉升级弹窗后，玩家从开局到死亡没有任何需要动脑的时刻，
//   只剩「走位 + 穿装备」。这是「玩 15 秒就不想玩」的真正原因 —— 不是内容少，是没有决策。
// 修法：每次境界突破给三张卡，分 攻 / 守 / 变 三类，
//   其中「变」是能改变战斗形态的选项（飞剑 +1、剑气范围、瞬步 CD、连锁概率…），
//   抉择与配装/合击/尸潮系统互相咬合，而不是单纯加数字。
const UPGRADE_CLS = { atk: { name: "攻伐", tag: "t-out" }, def: { name: "守御", tag: "t-hp" }, form: { name: "变化", tag: "t-burst" } };
const UPGRADE_POOL = [
  // —— 攻伐 ——
  { id: "u_atk", cls: "atk", ico: "攻", t: "t-out", name: "罡气充盈", desc: "攻击 +18%", max: 99,
    apply() { G.atk *= 1.18; } },
  { id: "u_aspd", cls: "atk", ico: "疾", t: "t-out", name: "疾风剑意", desc: "攻速 +12%", max: 6,
    apply() { G.atkSpeed *= 1.12; } },
  { id: "u_crit", cls: "atk", ico: "煞", t: "t-out", name: "破煞之眼", desc: "暴击 +6% · 暴伤 +12%", max: 5,
    apply() { G.crit += 0.06; G.critMul += 0.12; } },
  { id: "u_pierce", cls: "atk", ico: "穿", t: "t-out", name: "剑芒透骨", desc: "飞剑穿透 +1", max: 3,
    apply() { G.swordPierce += 1; } },
  // —— 守御 ——
  { id: "u_hp", cls: "def", ico: "息", t: "t-hp", name: "玄龟之息", desc: "生命上限 +20% 并回满该部分", max: 99,
    apply() { const d = G.hpMax * 0.2; G.hpMax += d; G.hp = Math.min(G.hpMax, G.hp + d); } },
  { id: "u_shield", cls: "def", ico: "钟", t: "t-hp", name: "金钟护体", desc: "护盾上限 +30 并充满", max: 5,
    apply() { G.shieldMax += 30; G.shield = G.shieldMax; } },
  { id: "u_ls", cls: "def", ico: "噬", t: "t-hp", name: "噬血诀", desc: "击杀回血 +2", max: 4,
    apply() { G.lifesteal += 2; } },
  { id: "u_move", cls: "def", ico: "风", t: "t-hp", name: "御风诀", desc: "移速 +9%", max: 5,
    apply() { G.moveSpeed *= 1.09; } },
  // —— 变化（改变战斗形态，v7.1 的重点） ——
  { id: "u_sword", cls: "form", ico: "剑", t: "t-burst", name: "分化剑影", desc: "环绕飞剑 +1", max: 4, rare: true,
    apply() { G.swordCount += 1; } },
  { id: "u_orbit", cls: "form", ico: "域", t: "t-burst", name: "剑域扩张", desc: "剑域半径 +16 · 飞剑变大", max: 4,
    apply() { G.swordOrbit += 16; G.swordSize += 1.5; } },
  { id: "u_aoe", cls: "form", ico: "斩", t: "t-burst", name: "剑气纵横", desc: "剑气范围 +20% · 伤害 +15%", max: 4,
    apply() { G.aoeRange *= 1.2; G.aoeDamageMul *= 1.15; } },
  { id: "u_blink", cls: "form", ico: "瞬", t: "t-burst", name: "瞬步诀", desc: "瞬步 CD −1.2s · 无敌 +0.1s", max: 3,
    apply() { G.dashCD = Math.max(1.6, G.dashCD - 1.2); G._blinkIFrameAdd = (G._blinkIFrameAdd || 0) + 0.1; } },
  { id: "u_chain", cls: "form", ico: "连", t: "t-burst", name: "连环引", desc: "连锁击杀概率 +8%", max: 4,
    apply() { G._chainBonus = (G._chainBonus || 0) + 0.08; } },
  { id: "u_fusion", cls: "form", ico: "合", t: "t-burst", name: "双剑合璧", desc: "合击蓄能 −18%（无合击则攻击 +10%）", max: 3,
    apply() {
      if (G.fusions && G.fusions.length) { for (const f of G.fusions) f.cd *= 0.82; }
      else G.atk *= 1.10;
    } },
  // —— 方环四姿态专精 ——
  { id: "e_stance_wind", cls: "atk", ico: "风", t: "t-out", name: "听风专精", desc: "风姿态伤害 +15% · 弹射 +1", max: 3,
    apply() { G._stanceMul = G._stanceMul || {}; G._stanceMul.wind = (G._stanceMul.wind || 1) * 1.15; } },
  { id: "e_stance_rain", cls: "atk", ico: "雨", t: "t-out", name: "润物专精", desc: "雨姿态缓速加强 · DOT +20%", max: 3,
    apply() { G._stanceMul = G._stanceMul || {}; G._stanceMul.rain = (G._stanceMul.rain || 1) * 1.2; } },
  { id: "e_stance_thunder", cls: "atk", ico: "雷", t: "t-out", name: "惊蛰专精", desc: "雷姿态连锁 +1 · 麻痹 +5%", max: 3,
    apply() { G._stanceMul = G._stanceMul || {}; G._stanceMul.thunder = (G._stanceMul.thunder || 1) * 1.15; } },
  { id: "e_stance_bolt", cls: "atk", ico: "电", t: "t-out", name: "裂空专精", desc: "电姿态破壳 ×1.25 · 破甲 +5%", max: 3,
    apply() { G._stanceMul = G._stanceMul || {}; G._stanceMul.bolt = (G._stanceMul.bolt || 1) * 1.25; } },
  { id: "u_pick", cls: "form", ico: "摄", t: "t-burst", name: "摄物诀", desc: "拾取范围 +40 · 经验 +10%", max: 3,
    apply() { G._altarPickup = (G._altarPickup || 0) + 40; G.xpMul *= 1.1; } },
  { id: "u_frenzy", cls: "form", ico: "狂", t: "t-burst", name: "狂血诀", desc: "狂血阈值 +8% · 持续 +1s", max: 3, rare: true,
    apply() { G._frenzyHpAdd = (G._frenzyHpAdd || 0) + 0.08; G._frenzyTimeAdd = (G._frenzyTimeAdd || 0) + 1; } },
  { id: "u_thunder", cls: "form", ico: "雷", t: "t-burst", name: "引雷诀", desc: "击杀 6% 概率引雷", max: 4,
    apply() { G.thunderProc += 0.06; } },
  // —— v7.3 P2 · 变类扩容 ——
  // 审计发现：变类总供给只有 32 次，而一局能升到 35~40 级 ⇒ 约 30 级后牌面退化成纯数值三选一，
  // 正好退回到 v7.1 拼命想解决的「抉择很轻」状态。以下 6 张各 3 次，供给 32 → 50。
  { id: "u_burst", cls: "form", ico: "意", t: "t-burst", name: "剑意频出", desc: "剑意爆发所需连杀 −4（下限 8）", max: 3, rare: true,
    apply() { G._burstCut = (G._burstCut || 0) + 4; } },
  { id: "u_after", cls: "form", ico: "影", t: "t-burst", name: "剑影重重", desc: "瞬步残影存续 +0.25s · 伤害 ×1.4", max: 3,
    apply() { G._afterLifeAdd = (G._afterLifeAdd || 0) + 0.25; G._afterDmgMul = (G._afterDmgMul || 1) * 1.4; } },
  { id: "u_exec", cls: "form", ico: "军", t: "t-burst", name: "破军令", desc: "斩精英/妖王时原地爆一圈剑罡", max: 3, rare: true,
    apply() { G._execLv = (G._execLv || 0) + 1; } },
  { id: "u_zone", cls: "form", ico: "霜", t: "t-burst", name: "霜痕遍地", desc: "击杀 10% 概率在尸体处留减速霜痕", max: 3,
    apply() { G._zoneLv = (G._zoneLv || 0) + 1; } },
  { id: "u_elem", cls: "form", ico: "玄", t: "t-burst", name: "五行通玄", desc: "克制关系伤害再 +15%", max: 3,
    apply() { G._elemBeatAdd = (G._elemBeatAdd || 0) + 0.15; } },
  { id: "u_stone", cls: "form", ico: "契", t: "t-burst", name: "灵石亲和", desc: "本命灵石加成 +15%（0.30 → 0.45…）", max: 3,
    apply() { G._stoneBoostAdd = (G._stoneBoostAdd || 0) + 0.15; } },
];
const UPGRADE_BY_ID = {};
for (const u of UPGRADE_POOL) UPGRADE_BY_ID[u.id] = u;

function upgradeTakenCount(id) { return (G._upgradeTaken && G._upgradeTaken[id]) || 0; }
function buildUpgradePool(n = 3) {
  const out = [];
  const bag = { atk: [], def: [], form: [] };
  for (const u of UPGRADE_POOL) {
    if (upgradeTakenCount(u.id) >= (u.max || 99)) continue;
    bag[u.cls].push(u);
  }
  const order = ["form", "atk", "def"];          // 优先保证「变」类出现在牌面
  for (const cls of order) {
    if (out.length >= n) break;
    const list = bag[cls];
    if (!list.length) continue;
    // 稀有卡小概率顶替（给惊喜，不是必给）
    let pickd = pick(list);
    if (Math.random() < 0.18) {
      const rare = list.filter((u) => u.rare);
      if (rare.length) pickd = pick(rare);
    }
    out.push(pickd);
    list.splice(list.indexOf(pickd), 1);
  }
  // 不足 3 张时用剩余类补齐
  for (const cls of order) {
    while (out.length < n && bag[cls].length) out.push(bag[cls].shift());
  }
  return out.slice(0, n);
}
function rollUpgrades() { return buildUpgradePool(3); }

function openLevelUp() {
  if (G.state !== "play" || !ui.levelModal) return;
  const choices = buildUpgradePool(3);
  if (!choices.length) { G.pendingLevel = 0; return; }
  G.state = "level";
  if (typeof releaseJoystick === "function") releaseJoystick();
  ui.levelChoices.innerHTML = "";
  for (const c of choices) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice-btn" + (c.rare ? " rare" : "");
    const cls = UPGRADE_CLS[c.cls] || { name: "", tag: "" };
    btn.innerHTML =
      `<span class="choice-ico ${c.t || ""}">${c.ico}</span>` +
      `<span class="choice-body">` +
      `<span class="c-name">${c.name}</span>` +
      `<span class="c-desc">${c.desc}</span>` +
      `<span class="c-tag ${cls.tag}">${cls.name}</span>` +
      `</span>`;
    btn.addEventListener("click", () => takeUpgrade(c.id));
    ui.levelChoices.appendChild(btn);
  }
  ui.levelModal.classList.remove("hidden");
  AudioSys.level();
}
function takeUpgrade(id) {
  const def = UPGRADE_BY_ID[id];
  if (def) {
    G._upgradeTaken = G._upgradeTaken || {};
    G._upgradeTaken[id] = upgradeTakenCount(id) + 1;
    def.apply();
    spawnFloater(G.px, G.py - G.pr - 18, `悟道 · ${def.name}`, "#fde68a", 14);
    toast(`悟道 · ${def.name} · ${def.desc}`, "gold");
    burst(G.px, G.py, "#fde68a", 20, 200, 4);
    AudioSys.level();
  }
  closeLevelUp();
}
function closeLevelUp() {
  if (ui.levelModal) ui.levelModal.classList.add("hidden");
  // v7.5.1：关窗必须把选项清掉。
  //   残留的按钮仍然是「活」的（监听器还在、还能被派发 click），健壮性探针里被连点 382 次 ——
  //   同一张悟道卡被反复 apply，攻速被连乘到 Infinity，飞剑相位跟着爆掉，
  //   最后 ctx.arc 收到 Infinity 角度 ⇒ 花屏 / 图形截断。真实环境里虽然被 display:none 挡住，
  //   但只要样式层出一点意外就是「白拿几百张卡」的恶性 bug —— 关窗即销毁，成本为零。
  if (ui.levelChoices) ui.levelChoices.innerHTML = "";
  G.pendingLevel = Math.max(0, (G.pendingLevel || 0) - 1);
  if (G.state === "level") G.state = "play";
  try { last = performance.now(); } catch (_) {}
}

// ================= v7.5 · 前 10 波自动悟道（不再打断） =================
// 玩家反馈：前 15 级每升一级就弹一次三选一，开局节奏被切成碎片 ——
//   「刚割爽就被按停」是这一段最大的体感损失，而且前期玩家还没 build 概念，
//   三选一给的也不是抉择，是打扰。
// v7.5 把门槛从「15 级」改成「前 10 波」：按波次算才是玩家真实的体感刻度 ——
//   前 10 波（约 4 分钟）自动随机领悟，不弹窗、不停帧；
//   第 11 波起恢复手动三选一，此时玩家已经摸清流派，把 build 的决策权完整交回。
const AUTO_UPGRADE_MAX_WAVE = 10;
function autoUpgradePhase() { return (G.wave || 0) <= AUTO_UPGRADE_MAX_WAVE; }
function autoUpgradePick() {
  const choices = buildUpgradePool(3);
  if (!choices.length) return null;
  // 加权随机：攻 50% / 变 32% / 守 18%。
  //   纯随机会出现「前期连拿两张防御」这种让人提不起劲的结果 —— 新手最缺的是输出。
  const weight = { atk: 0.5, form: 0.32, def: 0.18 };
  let total = 0;
  for (const c of choices) total += weight[c.cls] || 0.1;
  let r = Math.random() * total;
  for (const c of choices) { r -= (weight[c.cls] || 0.1); if (r <= 0) return c; }
  return choices[choices.length - 1];
}
function grantUpgrade(def) {
  if (!def) return;
  G._upgradeTaken = G._upgradeTaken || {};
  G._upgradeTaken[def.id] = upgradeTakenCount(def.id) + 1;
  def.apply();
  G.pendingLevel = Math.max(0, (G.pendingLevel || 0) - 1);
  spawnFloater(G.px, G.py - G.pr - 18, `悟道 · ${def.name}`, "#fde68a", 14);
  toast(`自动悟道 · ${def.name} · ${def.desc}`, "gold");
  // v7.6 悟道便签：前 10 波自动发卡解决了「打断」，代价是玩家不知道自己拿到了什么 ——
  //   成长变成隐形的，爽感也就没了。这里补一条右侧滑入的非模态便签（不挡摇杆、不拦操作），
  //   把「我变强了」这件事重新变得看得见。
  showAutoNote(def);
  burst(G.px, G.py, "#fde68a", 14, 160, 3);
  AudioSys.level();
}

// v7.6 悟道便签：右侧堆叠，最多 3 条，1.6 秒滑出滑走
function showAutoNote(def) {
  const box = ui.autoNote;
  if (!box || !def) return;
  const cls = def.cls === "atk" ? "n-atk" : def.cls === "def" ? "n-def" : "n-form";
  const tag = def.cls === "atk" ? "攻" : def.cls === "def" ? "守" : "变";
  const el = document.createElement("div");
  el.className = `auto-note ${cls}`;
  el.innerHTML = `<i>${tag}</i><b>${def.name}</b><u>${def.desc || ""}</u>`;
  box.appendChild(el);
  G._autoNotes = G._autoNotes || [];
  G._autoNotes.push({ el, t: 1.6, out: false });
  // 只留最近 3 条：连升 3 级也不会糊满半屏
  while (G._autoNotes.length > 3) {
    const old = G._autoNotes.shift();
    try { old.el.remove(); } catch (_) { /* DOM 桩无 remove 也无所谓 */ }
  }
}
function updateAutoNotes(dt) {
  const arr = G._autoNotes;
  if (!arr || !arr.length) return;
  for (let i = arr.length - 1; i >= 0; i--) {
    const n = arr[i];
    n.t -= dt;
    if (!n.out && n.t <= 0.32) { n.out = true; n.el.classList.add("out"); }
    if (n.t <= 0) {
      try { n.el.remove(); } catch (_) { /* 同上 */ }
      arr.splice(i, 1);
    }
  }
}
function flushAutoUpgrades() {
  let guard = 0;
  while ((G.pendingLevel || 0) > 0 && guard++ < 40) {
    const c = autoUpgradePick();
    if (!c) { G.pendingLevel = 0; break; }
    grantUpgrade(c);
  }
}
function shouldOfferJob() { return false; }
function openJobModal() { /* 转职不弹窗，由套装触发 */ }

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
      { id: "mage_fire", name: "业火焚天", ico: "火", desc: "业火 +1 级 · 攻击 +15%",
        apply: () => { jobWpLvAdd("fire"); G._jobAtkMul = (G._jobAtkMul || 1) * 1.15; } },
      { id: "mage_thunder", name: "九霄雷法", ico: "电", desc: "紫电 +1 级 · 攻速 +15%",
        apply: () => { jobWpLvAdd("lightning"); G._jobAtkSpeedMul = (G._jobAtkSpeedMul || 1) * 1.15; } },
      { id: "mage_frost", name: "玄冰封天", ico: "冰", desc: "寒冰 +1 级 · 受击伤害 -12%",
        apply: () => { jobWpLvAdd("frost"); G._jobDmgTakenMul = (G._jobDmgTakenMul || 1) * 0.88; } },
    ],
  },
  {
    id: "body", name: "体道", ico: "体", tagCls: "t-hp", color: "#86efac",
    desc: "以身为炉 · 守阵不破",
    branches: [
      { id: "body_blood", name: "血战不灭", ico: "血", desc: "气血上限 +80 并回复 · 残血伤害 +25%",
        apply: () => { G._jobHpBonus = (G._jobHpBonus || 0) + 80; G.hp = Math.min(G.hpMax + 80, G.hp + 80); G.lowHpBonus += 0.25; } },
      { id: "body_thorn", name: "荆棘铁壁", ico: "棘", desc: "立即获得 60 护盾（上限 +40）· 反伤 +10%",
        apply: () => { G._jobShieldBonus = (G._jobShieldBonus || 0) + 40; G.shield += 60; G.thorns += 0.10; } },
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


// ---------- 法宝 & 灵兽 ----------
function hexRgb(hex) {
  const h = String(hex || "#ffffff").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16) || 0;
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

// 契约的灵兽入场
function spawnBeast() {
  G.beast = null;
  let id = null;
  try { id = Meta.load().contract; } catch (_) {}
  const def = BEAST_BY_ID[id];
  if (!def) return;
  G.beast = {
    def, ang: -Math.PI / 2,
    x: G.px + Math.cos(-Math.PI / 2) * 48,
    y: G.py + Math.sin(-Math.PI / 2) * 48,
    cd: def.cd * 0.6, hitFlash: 0,
  };
  if (def.xpMul) G.xpMul *= (1 + def.xpMul);
}

function updateBeasts(dt) {
  const b = G.beast;
  if (!b) return;
  const def = b.def;
  b.ang += dt * 0.9;
  const tx = G.px + Math.cos(b.ang) * 48;
  const ty = G.py + Math.sin(b.ang) * 48;
  const k = Math.min(1, dt * 7);
  b.x = lerp(b.x, tx, k);
  b.y = lerp(b.y, ty, k);
  if (b.hitFlash > 0) b.hitFlash = Math.max(0, b.hitFlash - dt * 3);

  b.cd -= dt;
  if (b.cd > 0) return;
  const dmg = G.atk * def.mul * playerDamageMult();

  if (def.kind === "bolt") {
    const list = G.enemies
      .filter((e) => !e.dead && dist(e.x, e.y, b.x, b.y) < 330)
      .sort((p, q) => dist(p.x, p.y, b.x, b.y) - dist(q.x, q.y, b.x, b.y))
      .slice(0, 1 + (def.pierce || 0));
    if (!list.length) { b.cd = 0.25; return; }
    b.hitFlash = 1;
    for (const e of list) {
      G.particles.push({
        x: e.x, y: e.y, vx: 0, vy: 0, life: 0.2, max: 0.2,
        color: def.color, size: 4, ring: { r0: 4, r1: 26 },
      });
      applyHit(e, dmg);
    }
    AudioSys.hit();
  } else if (def.kind === "nova") {
    const list = G.enemies.filter((e) => !e.dead && dist(e.x, e.y, b.x, b.y) < def.radius);
    if (!list.length) { b.cd = 0.5; return; }
    b.hitFlash = 1;
    G.particles.push({
      x: b.x, y: b.y, vx: 0, vy: 0, life: 0.36, max: 0.36,
      color: def.color, size: 5, ring: { r0: 12, r1: def.radius },
    });
    burst(b.x, b.y, def.color, 14, 210, 4);
    for (const e of list) applyHit(e, dmg);
    G.shake = Math.max(G.shake, 4);
    AudioSys.crit();
  } else if (def.kind === "aura") {
    const list = G.enemies.filter((e) => !e.dead && dist(e.x, e.y, b.x, b.y) < def.radius);
    for (const e of list) {
      applyHit(e, dmg);
      if (def.burn && !e.dead) {
        e.burn = Math.max(e.burn || 0, 1.0);
        e.burnDmg = Math.max(e.burnDmg || 0, 3 + G.wave * 0.8);
      }
    }
  } else if (def.kind === "ward") {
    if (def.shield) { G.shieldMax = Math.max(G.shieldMax, 40); G.shield = Math.min(G.shieldMax, G.shield + def.shield); G.shieldHit = 0.3; }
    if (def.heal && G.hp < G.hpMax) G.hp = Math.min(G.hpMax, G.hp + G.hpMax * def.heal);
    if (def.mp) G.mp = Math.min(G.mpMax, G.mp + def.mp);
    G.particles.push({
      x: G.px, y: G.py, vx: 0, vy: 0, life: 0.4, max: 0.4,
      color: def.color, size: 4, ring: { r0: G.pr + 8, r1: G.pr + 44 },
    });
    AudioSys.level();
  }
}

function drawBeasts(camX, camY) {
  const b = G.beast;
  if (!b) return;
  const sx = b.x - camX + view.w / 2;
  const sy = b.y - camY + view.h / 2;
  if (sx < -140 || sy < -140 || sx > view.w + 140 || sy > view.h + 140) return;
  const def = b.def;
  const t = G.time || 0;
  ctx.save();
  ctx.translate(sx, sy);

  if (def.kind === "aura") {
    const g = ctx.createRadialGradient(0, 0, 6, 0, 0, def.radius);
    g.addColorStop(0, `rgba(${hexRgb(def.color)},0.22)`);
    g.addColorStop(0.7, `rgba(${hexRgb(def.color)},0.07)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0, 0, def.radius, 0, TAU); ctx.fill();
  }

  const r = 13 + Math.sin(t * 3) * 1.2 + b.hitFlash * 2;
  if (!_shadowOff) { ctx.shadowColor = def.color; ctx.shadowBlur = 14; }
  ctx.strokeStyle = `rgba(${hexRgb(def.color)},0.85)`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r + 5, 0, TAU); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "rgba(4,16,24,0.92)";
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
  ctx.strokeStyle = def.color;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();

  ctx.fillStyle = def.color;
  ctx.font = 'bold 15px "STKaiti","KaiTi",serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(def.ico, 0, 1);

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#cbd5e1";
  ctx.font = 'bold 10px system-ui,"Microsoft YaHei",sans-serif';
  ctx.fillText(def.name, 0, -r - 12);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function relicHudSync() {
  if (!ui.relicRow) return;
  ui.relicRow.innerHTML = "";
  if (!G.relics.length) { ui.relicRow.classList.add("hidden"); return; }
  ui.relicRow.classList.remove("hidden");
  for (const r of G.relics) {
    const el = document.createElement("span");
    el.className = "relic-chip";
    el.style.setProperty("--rc", r.color);
    el.textContent = r.ico;
    ui.relicRow.appendChild(el);
  }
}

function beastHudSync() {
  if (!ui.beastHud) return;
  if (!G.beast) { ui.beastHud.classList.add("hidden"); return; }
  ui.beastHud.classList.remove("hidden");
  ui.beastHudIco.textContent = G.beast.def.ico;
  ui.beastHudIco.style.setProperty("--bc", G.beast.def.color);
  ui.beastHudName.textContent = G.beast.def.name;
}

// v4.0 砍掉「法宝匣 3 选 1」面板：直接在 collectPickup 随机获得
function openRelicModal() { /* 法宝匣不再弹窗，由 collectPickup 处理 */ }
// v4.0 砍掉弹窗收尾器（升级 / 遗物 / 精魄 都不再排队弹）
function resolvePendingModal() { /* v4.0 不再弹窗 */ }

// ---------- 炼宝台：专属灵石 → 流派宝石 / 通用装备 ----------
// v7.3 P0：chip 可点击入槽（这是灵石槽唯一的常驻入口）
function stoneHudSync() {
  if (!ui.stoneRow) return;
  ui.stoneRow.classList.remove("hidden");
  ui.stoneRow.innerHTML = "";
  const hot = nextGemStoneKey();
  const slotted = G._stoneSlot && G._stoneSlot.stoneKey;
  for (const st of stonesOf()) {
    const n = stoneAt(st.key);
    const chip = document.createElement("span");
    chip.className = "stone-chip" + (n > 0 ? " has" : " empty") + (st.key === hot ? " hot" : "")
                   + (st.key === slotted ? " slotted" : "");
    chip.style.setProperty("--cc", st.color);
    chip.innerHTML = `<b>${st.ico}</b><i>${n}</i>`;
    chip.title = `${st.name}（${st.school}）×${n} · 点击${st.key === slotted ? "取出" : "设为本命灵石"}`;
    if (n > 0 || st.key === slotted) {
      chip.onclick = () => { toggleStoneSlot(st.key); stoneHudSync(); renderInventory(); };
    }
    ui.stoneRow.appendChild(chip);
  }
}

// 派系凑齐 5 颗自动弹醒
function schoolHintCheck(school) {
  if (!school) return;
  if (G._schoolHinted === school) return;
  if (canUnlockCore(school)) {
    G._schoolHinted = school;
    toast(`${school}派系灵石已足 · 可开炼宝台启核心`, "gold");
  }
}

// 一颗宝石的当前进度（下一阶配方 / 主石存量 / 能否凝成）
function gemProgress(def) {
  const r = G.gems[def.id] || 0;
  const tier = r >= 3 ? null : GEM_TIERS[r];
  const main = stoneAt(def.stone);
  return { r, tier, main, ratio: tier ? Math.min(1, main / tier.main) : 1 };
}
// 最接近凝成的那一系 —— 给 HUD 灵石芯片点个灯，省得玩家自己数
function nextGemStoneKey() {
  let best = null, bestRatio = -1;
  for (const def of gemsOf()) {
    const p = gemProgress(def);
    if (p.r >= 3) continue;
    if (p.r === 0 && gemSlotsUsed() >= MAX_GEMS) continue;
    if (p.ratio > bestRatio) { bestRatio = p.ratio; best = def.stone; }
  }
  return best;
}
function canCraft(def) {
  const r = G.gems[def.id] || 0;
  if (r >= 3) return false;
  if (r === 0 && gemSlotsUsed() >= MAX_GEMS) return false;
  const t = GEM_TIERS[r];
  return stoneAt(def.stone) >= t.main && stoneTotal() >= t.main + t.any;
}
function gemsMaxed() {
  const ids = Object.keys(G.gems || {});
  return ids.length >= MAX_GEMS && ids.every((id) => (G.gems[id] || 0) >= 3);
}
function canMelt() {
  return gemsMaxed() && stoneTotal() >= MELT_COST;   // v3.0 装备替换通用后，淬体只看宝石满
}
function forgeableAny() {
  if (gemsOf().some(canCraft)) return true;
  return canMelt();
}

function forgeBtnSync() {
  if (!ui.forgeBtn) return;
  ui.forgeBtnCount.textContent = stoneTotal();
  ui.forgeBtn.classList.toggle("ready", forgeableAny());
}

// ---------- 背包 v3.0 渲染 ----------
function invHudSync() {
  if (!ui.invBtnCount) return;
  validateStoneSlot();   // v7.3：灵石被炼宝台耗尽后，槽位同步失效
  ui.invBtnCount.textContent = `${G.inventory.length}/${INVENTORY_MAX}`;
  const hasPurple = G.inventory.some((e) => e.tier === "purple" || e.tier === "orange");
  ui.invBtn.classList.toggle("has-purple", hasPurple);
}
// 渲染装备槽位（3 席）+ 背包网格（30 格）
let _invSelectedUid = null;
function renderInventory() {
  if (!ui.invGrid) return;
  // 槽位
  for (const slot of ["weapon", "armor", "accessory"]) {
    const node = ui["invSlot" + slot[0].toUpperCase() + slot.slice(1)];
    if (!node) continue;
    const eq = G.equipped[slot];
    const labelEl = node.querySelector(".inv-slot-label");
    const eqEl = node.querySelector(".inv-slot-eq");
    if (eq) {
      node.classList.add("filled");
      eqEl.innerHTML = `<b style="color:${TIERS[eq.tier].color}">${TIERS[eq.tier].name}·${ITEM_TYPES[eq.typeKey].name}</b><br><span style="font-size:9px;color:#a78bfa">点击卸下</span>`;
    } else {
      node.classList.remove("filled");
      eqEl.innerHTML = `<span class="empty-hint">空 · 点击紫/橙装备</span>`;
    }
    node.onclick = () => { if (G.equipped[slot]) { unequipTo(slot); renderInventory(); } };
  }
  // v7.3 P0：灵石槽（此前 UI 是摆设，setStoneSlot 零调用）
  if (ui.invSlotStone) {
    const node = ui.invSlotStone;
    const st = G._stoneSlot;
    const labelEl = node.querySelector(".inv-slot-label");
    const eqEl = node.querySelector(".inv-slot-eq");
    if (st) {
      node.classList.add("filled");
      eqEl.innerHTML = `<b style="color:${st.color}">${st.name}</b><br><span style="font-size:9px;color:#a78bfa">${st.school}系 ×1.30 · 点击取出</span>`;
      node.onclick = () => { setStoneSlot(null); stoneHudSync(); renderInventory(); invHudSync(); };
    } else {
      node.classList.remove("filled");
      eqEl.innerHTML = `<span class="empty-hint">空 · 在 HUD 灵石条点选</span>`;
      node.onclick = null;
    }
  }
  // 网格
  ui.invGrid.innerHTML = "";
  for (let i = 0; i < INVENTORY_MAX; i++) {
    const cell = document.createElement("div");
    const eq = G.inventory[i];
    if (!eq) {
      cell.className = "inv-cell empty";
    } else {
      cell.className = `inv-cell tier-${eq.tier}`;
      cell.innerHTML = `<div>${eq.ico}</div><div class="inv-cell-name">${TIERS[eq.tier].name}${eq.ico}</div>` +
                       (TIERS[eq.tier].equipable ? `<div class="inv-cell-affix">装</div>` : "");
      cell.onclick = () => {
        _invSelectedUid = eq.uid;
        renderInventory();
      };
      if (_invSelectedUid === eq.uid) cell.style.outline = "2px solid #d8b4fe";
    }
    ui.invGrid.appendChild(cell);
  }
  // 详情
  renderInvDetail();
}
function renderInvDetail() {
  if (!ui.invDetail) return;
  if (!_invSelectedUid) {
    ui.invDetail.className = "inv-detail empty";
    ui.invDetail.innerHTML = "点选装备查看词条，点击槽位可装备紫/橙";
    return;
  }
  const eq = G.inventory.find((e) => e.uid === _invSelectedUid);
  if (!eq) {
    ui.invDetail.className = "inv-detail empty";
    ui.invDetail.innerHTML = "（已被卸下/合成）";
    return;
  }
  const tier = TIERS[eq.tier];
  const slotDef = SLOT_DEFS[eq.slot];
  const mainLabel = eq.atk ? `攻击 +${eq.atk}` : eq.hp ? `生命 +${eq.hp}` : `移速 +${eq.spd}`;
  ui.invDetail.className = "inv-detail";
  ui.invDetail.innerHTML = `
    <div class="det-name" style="color:${tier.color}">${eq.name} · ${slotDef.name}</div>
    <div><span class="det-stat">${mainLabel}</span> · <span style="color:#fbbf24">${TIER_ORDER.indexOf(eq.tier)+1}/5阶</span></div>
    ${eq.affixes.map((a) => {
      const af = AFFIX_POOL[a];
      return `<div class="det-affix${af.type === "稀有" ? " rare" : ""}">· ${af.name}：${af.desc}${af.type === "稀有" ? " ✦" : ""}</div>`;
    }).join("")}
    <div class="det-actions">
      ${tier.equipable ? `<button class="btn-equip" id="btnEquipNow">装备到${slotDef.name}槽</button>` : `<button class="btn-equip" disabled style="opacity:0.4">白/绿/蓝不可装</button>`}
    </div>`;
  const btn = ui.invDetail.querySelector("#btnEquipNow");
  if (btn) btn.onclick = () => {
    if (equipTo(eq.uid)) { _invSelectedUid = null; renderInventory(); invHudSync(); }
  };
}
function openInventory() {
  G.state = "pause";
  _invSelectedUid = null;
  renderInventory();
  ui.invModal.classList.remove("hidden");
}
function closeInventory() {
  ui.invModal.classList.add("hidden");
  G.state = "play";
}
// 炼宝台里装备快览（3 槽位 + 总览）
function renderEquipQuick() {
  if (!ui.forgeEquip) return;
  if (ui.forgeEquipCount) {
    const n = Object.values(G.equipped).filter(Boolean).length;
    ui.forgeEquipCount.textContent = `${n}/${EQUIP_SLOTS_MAX}`;
  }
  ui.forgeEquip.innerHTML = "";
  for (const slot of ["weapon", "armor", "accessory"]) {
    const eq = G.equipped[slot];
    const card = document.createElement("div");
    if (eq) {
      const tier = TIERS[eq.tier];
      card.className = `eq-quick-card tier-${eq.tier}`;
      card.innerHTML = `<div class="eq-qc-tier" style="color:${tier.color}">${tier.name}·${SLOT_DEFS[slot].name}</div>
                        <div class="eq-qc-name">${ITEM_TYPES[eq.typeKey].name}</div>
                        <div style="font-size:10px;color:#a78bfa">${eq.affixes.length}词条</div>`;
    } else {
      card.className = "eq-quick-card empty";
      card.innerHTML = `<div class="eq-qc-tier">${SLOT_DEFS[slot].name}</div>
                        <div class="eq-qc-name">未装备</div>
                        <div style="font-size:10px;color:#6c7589">紫/橙可装</div>`;
    }
    ui.forgeEquip.appendChild(card);
  }
}

function forgeHintCheck() {
  if (G._forgeHinted || !forgeableAny()) return;
  G._forgeHinted = true;
  if (G.state === "play") toast("灵石已足 · 可开炼宝台", "gold");
}

// 花灵石：先掏散料者，主石留到最后 —— 尽量不拆散你正在攒的那一系
function spendStones(n, exceptKey) {
  const order = stoneKeys().slice().sort((a, b) => {
    const ea = a === exceptKey ? 1 : 0, eb = b === exceptKey ? 1 : 0;
    if (ea !== eb) return ea - eb;
    return stoneAt(a) - stoneAt(b);
  });
  let left = n;
  for (const k of order) {
    if (left <= 0) break;
    const take = Math.min(stoneAt(k), left);
    G.stones[k] -= take;
    left -= take;
  }
  return left === 0;
}

function renderForge() {
  // 灵石库存（本角色三系）
  if (ui.forgeStones) {
    ui.forgeStones.innerHTML = "";
    for (const st of stonesOf()) {
      const n = stoneAt(st.key);
      const chip = document.createElement("span");
      chip.className = "forge-crystal" + (n > 0 ? " has" : "");
      chip.style.setProperty("--cc", st.color);
      chip.innerHTML = `<b>${st.ico} ${st.name}</b><i>${n}</i>`;
      ui.forgeStones.appendChild(chip);
    }
  }
  if (ui.forgeGemCount) ui.forgeGemCount.textContent = `${gemSlotsUsed()}/${MAX_GEMS}`;
  if (ui.forgeOrdCount) ui.forgeOrdCount.textContent = `${G.ordinary.length}/${MAX_ORDINARY}`;

  // 流派宝石：三系各一颗，可逐阶凝练；槽位只有两个
  if (ui.forgeGems) {
    ui.forgeGems.innerHTML = "";
    const slotsFull = gemSlotsUsed() >= MAX_GEMS;
    for (const def of gemsOf()) {
      const p = gemProgress(def);
      const maxed = p.r >= 3;
      const blocked = !maxed && p.r === 0 && slotsFull;
      const ready = canCraft(def);
      const disabled = maxed || blocked || !ready;
      const st = STONE_BY_KEY[def.stone];
      const nextLabel = p.r === 0 ? "初凝" : p.r === 1 ? "化形" : "圆满";
      const pips = [1, 2, 3].map((i) => `<i class="gp${p.r >= i ? " on" : ""}"></i>`).join("");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "forge-item f-excl tier-xian" + (maxed ? " owned" : disabled ? " disabled" : " can");
      btn.style.setProperty("--fc", def.color);
      btn.innerHTML = `
        <span class="fi-ico">${def.ico}</span>
        <span class="fi-body">
          <span class="fi-name">${def.name}<em>${def.school}</em><em class="el" style="color:${def.color}">${ELEM_BY_KEY[def.elem].name}行</em></span>
          <span class="fi-pips">${pips}<b>${maxed ? "圆满" : p.r > 0 ? nextLabel : "未凝"}</b></span>
          <span class="fi-desc">${maxed ? "已达圆满 · 效果恒定" : def.tierText[p.r]}</span>
          <span class="fi-desc rel">${elemMatchText(def.elem)}</span>
        </span>
        <span class="fi-cost">${maxed ? "圆满"
          : blocked ? `需空出流派位`
          : `主石 ${st.name} ${p.main}/${GEM_TIERS[p.r].main}${GEM_TIERS[p.r].any ? ` · 配 ${GEM_TIERS[p.r].any}` : ""}`}</span>`;
      if (!disabled) btn.addEventListener("click", () => craftGem(def.id));
      ui.forgeGems.appendChild(btn);
    }
  }

  // 通用装备已由 v3.0 装备系统取代（背包自动合成 + 怪物掉落）
  renderEquipQuick();

  // 灵石淬体：宝石与通用皆满才出现
  if (ui.forgeMelt) {
    const open = gemsMaxed();
    if (ui.forgeMeltWrap) ui.forgeMeltWrap.classList.toggle("hidden", !open);
    ui.forgeMelt.innerHTML = "";
    if (open) {
      const can = stoneTotal() >= MELT_COST;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "forge-item f-melt tier-ling" + (can ? " can" : " disabled");
      btn.style.setProperty("--fc", "#5ce1e6");
      btn.innerHTML = `
        <span class="fi-ico">淬</span>
        <span class="fi-body">
          <span class="fi-name">灵石淬体<em class="ord">循环</em></span>
          <span class="fi-desc">攻击 +2% · 护盾上限 +8 并回复（可重复）</span>
        </span>
        <span class="fi-cost">灵石 ${MELT_COST}${G.meltCount ? ` · 已淬 ${G.meltCount}` : ""}</span>`;
      if (can) btn.addEventListener("click", meltStones);
      ui.forgeMelt.appendChild(btn);
    }
  }

  renderResonance();
  renderCores();
}

// 共鸣面板：四条共鸣实时展示（locked/active），位于熔晶淬体下方
function renderResonance() {
  if (!ui.forgeResonance) return;
  G.resonance = G.resonance || recomputeResonance();
  const r = G.resonance;
  const stones = stonesOf();
  const gems = gemsOfId();
  ui.forgeResonance.innerHTML = "";
  for (const def of RESONANCE_DEFS) {
    const on = !!r[def.id];
    const detail = describeResonance(def.id, r, stones, gems);
    const btn = document.createElement("div");
    btn.className = "res-card" + (on ? " on" : "");
    btn.innerHTML = `
      <span class="res-ico">${def.ico}</span>
      <span class="res-body">
        <span class="res-name">${def.label}${on ? "·已觉醒" : "·未启"}</span>
        <span class="res-desc">${detail}</span>
      </span>
      <span class="res-state">${on ? "已" : "未"}</span>`;
    ui.forgeResonance.appendChild(btn);
  }
  resHudSync();
}

function describeResonance(id, r, stones, gems) {
  switch (id) {
    case "benming":
      return gems.length ? `已凝宝石 ${gems.length} 颗 · 全伤 +${(r.benPlayerMul * 100) | 0}%`
        : "尚无已凝宝石";
    case "daotu": {
      const p = JOB_PATHS[G.jobPath];
      if (!p) return "未择道途";
      if (!r.daoTuElems.length) return `${p.name}五行未与宝石重合`;
      return `${p.name}·[${r.daoTuElems.map((k) => ELEM_BY_KEY[k].name).join("·")}] 所克目标再 +25%`;
    }
    case "kuaJie":
      return r.kuaJieStones.length
        ? `${r.kuaJieStones.map((k) => STONE_BY_KEY[k].name).join("·")}圆满 · 整段 ×1.5`
        : "至少一颗灵石需凝至圆满";
    case "pobi":
      return r.poBiElems.length
        ? `${r.poBiElems.map((k) => ELEM_BY_KEY[k].name).join("⇿")}相克 · 余敌 +15%`
        : "需 2 颗宝石五行相克";
    default:
      return id;
  }
}

// 共鸣 HUD 缩略：右上灵兽/灵石芯片的下方
function resHudSync() {
  if (!ui.resHud || !ui.resHudList) return;
  const r = G.resonance;
  if (!r) { ui.resHud.classList.add("hidden"); return; }
  const onNames = RESONANCE_DEFS.filter((d) => r[d.id]).map((d) => d.label);
  if (onNames.length === 0) { ui.resHud.classList.add("hidden"); return; }
  ui.resHud.classList.remove("hidden");
  ui.resHudList.innerHTML = onNames.map((n) => `<span class="res-chip">${n.replace(/^[··]*/, "")}</span>`).join("");
}

// 派系核心面板：9 派系格子 + 2 装备槽位（v2.0 新增）
function renderCores() {
  if (!ui.forgeCores) return;
  ui.forgeCores.innerHTML = "";
  const cores = coresOfChar();
  const equipped = new Set(G.cores || []);
  const unlocked = G.schoolUnlocked || {};
  for (const def of cores) {
    const on = equipped.has(def.id);
    const isOn = !!unlocked[def.school];
    const have = countSchool(def.school);
    const can = canUnlockCore(def.school);
    const slotsLeft = MAX_SCHOOL_CORES - equipped.size;
    const btn = document.createElement("div");
    btn.className = "res-card core-card" + (on ? " on" : isOn ? " off" : can ? " ready" : "");
    btn.style.setProperty("--cc", def.color);
    btn.innerHTML = `
      <span class="res-ico">${def.ico}</span>
      <span class="res-body">
        <span class="res-name">${def.name}<em class="el" style="color:${def.color}">${def.school}派系 · ${ELEM_BY_KEY[def.elem].name}行</em></span>
        <span class="res-desc">${on ? "已装备 · " + def.desc : isOn ? "已觉醒 · 未装备" + (slotsLeft > 0 ? "" : "（槽位满）") : `需 ${def.school}派系灵石 ${have}/${CORE_NEED_STONES}`}</span>
      </span>
      <span class="res-state">${on ? "装" : isOn ? "备" : can ? "启" : "集"}</span>`;
    btn.addEventListener("click", () => {
      if (on) { unequipCore(def.id); toast(`卸下 · ${def.name}`, "cyan"); }
      else if (isOn) {
        if (slotsLeft <= 0) { toast("核心槽位已满（" + MAX_SCHOOL_CORES + " 席）"); return; }
        if (equipCore(def.id)) toast(`装备 · ${def.name}`, "violet");
      }
      else if (can) {
        if (unlockCore(def.school)) {
          stoneHudSync(); forgeBtnSync(); renderForge();
          return;
        }
      } else {
        toast(`${def.school}派系灵石尚差 ${CORE_NEED_STONES - have} 颗`);
      }
      stoneHudSync(); forgeBtnSync(); renderForge();
    });
    ui.forgeCores.appendChild(btn);
  }
  coreHudSync();
}

// 派系核心 HUD chip：装备的派系核心名
function coreHudSync() {
  if (!ui.coreHud || !ui.coreHudList) return;
  const cores = coresEquipped();
  if (!cores.length) { ui.coreHud.classList.add("hidden"); return; }
  ui.coreHud.classList.remove("hidden");
  ui.coreHudList.innerHTML = cores.map((c) => `<span class="core-chip" style="--cc:${c.color}">${c.ico} ${c.name}</span>`).join("");
}

// 凝练：主石决定是哪一系，配料决定能到哪一阶
// ---------- 共鸣 · 多颗已凝宝石之间的协同奖励 ----------
// 四条共鸣，由「已凝宝石 + 角色 + 转职道」实时推出
//   本命归一：≥ 1 颗已凝宝石          ⇒ 玩家全伤 +12%
//   道途共鸣：宝石元素 ∈ 转职五行集    ⇒ 该宝石对「其所克」目标再 +25%
//   跨阶归一：任一灵石同时三阶         ⇒ 圆满特效的整段伤害 ×1.5
//   破壁者  ：任意 2 颗宝石存在相克    ⇒ 对未直接被克的目标 +15%
const RESONANCE_DEFS = [
  { id: "benming", label: "本命归一", ico: "命",
    desc: "你已凝出第一颗流派宝石 · 全局伤害 +12%" },
  { id: "daotu",   label: "道途共鸣", ico: "道",
    desc: "宝石与转职同属 · 该系对所克目标再 +25%" },
  { id: "kuaJie",  label: "跨阶归一", ico: "阶",
    desc: "一颗灵石推至圆满 · 圆满特效整段 ×1.5" },
  { id: "pobi",    label: "破壁者", ico: "破",
    desc: "两颗宝石五行相克 · 对未被克目标 +15%" },
];

function gemsOfId() {
  return Object.entries(G.gems || {})
    .map(([id, t]) => ({ id, t, def: GEM_BY_ID[id] }))
    .filter((x) => x.def);
}

function recomputeResonance() {
  const gems = gemsOfId();
  const res = {
    benming: false, daotu: false, kuaJie: false, poBi: false,
    benPlayerMul: 0, daoTuElems: [], kuaJieStones: [], poBiElems: [],
  };

  // 1. 本命归一：≥ 1 颗已凝宝石 ⇒ 玩家伤害系数 +12%（由 playerDamageMult 读取）
  if (gems.length >= 1) {
    res.benming = true;
    res.benPlayerMul = 0.12;
  }

  // 2. 道途共鸣：任一已凝宝石的元素 ∈ 当前转职五行集
  const path = JOB_PATHS[G.jobPath];
  const set = path && PATH_ELEMS[path.id];
  if (set) {
    const seen = new Set();
    for (const g of gems) if (set.has(g.def.elem)) seen.add(g.def.elem);
    if (seen.size) {
      res.daotu = true;
      res.daoTuElems = [...seen];
    }
  }

  // 3. 跨阶归一：任意一颗宝石到达 tier=3（圆满）
  const maxTier = Math.max(0, ...gems.map((g) => g.t || 0));
  if (maxTier >= 3) {
    res.kuaJie = true;
    res.kuaJieStones = gems.filter((g) => g.t >= 3).map((g) => g.def.stone);
  }

  // 4. 破壁者：两颗宝石之间存在「相克」(i.g.j 或 j.g.i)
  for (let i = 0; i < gems.length; i++) {
    for (let j = i + 1; j < gems.length; j++) {
      const ei = gems[i].def.elem, ej = gems[j].def.elem;
      if (ELEM_OVERCOME[ei] === ej || ELEM_OVERCOME[ej] === ei) {
        res.pobi = true;
        res.poBiElems = [...new Set([ei, ej])];
        i = gems.length; break;
      }
    }
  }

  return res;
}

// 返回「刚刚首次觉醒」的共鸣列表，供 craftGem toast
function resonanceJust(prev, now) {
  const out = [];
  if (!prev) return out;
  const names = { benming: "本命归一", daotu: "道途共鸣", kuaJie: "跨阶归一", pobi: "破壁者" };
  for (const k of ["benming", "daotu", "kuaJie", "pobi"]) {
    if (!prev[k] && now[k]) out.push(names[k]);
  }
  return out;
}

function craftGem(id) {
  const def = GEM_BY_ID[id];
  if (!def || def.char !== G.charId) return;
  const cur = G.gems[id] || 0;
  const st = STONE_BY_KEY[def.stone];
  if (cur >= 3) { toast("此宝已至圆满"); return; }
  if (cur === 0 && gemSlotsUsed() >= MAX_GEMS) { toast(`流派之位数已满（${MAX_GEMS} 席）`); return; }
  const t = GEM_TIERS[cur];
  if (stoneAt(def.stone) < t.main) { toast(`${st.name}不足`); return; }
  if (stoneTotal() < t.main + t.any) { toast("灵石不足"); return; }
  G.stones[def.stone] -= t.main;
  if (t.any > 0) spendStones(t.any, def.stone);
  const nr = cur + 1;
  G.gems[id] = nr;
  def.apply(nr);
  burst(G.px, G.py, def.color, 22 + nr * 8, 190 + nr * 30, 4 + nr);
  G.goldFlash = Math.max(G.goldFlash || 0, 0.35 + nr * 0.12);
  G.shake = Math.max(G.shake, 6 + nr * 2);
  spawnFloater(G.px, G.py - G.pr - 22, `${def.name} · ${GEM_TIERS[nr - 1].label}`, def.color, nr >= 3 ? 20 : 16, true);
  AudioSys.level();
  toast(`凝成 · ${def.name}（${GEM_TIERS[nr - 1].label}）`, "gold");
  // 重新计算共鸣 —— 任何新觉醒的都会单独再 toast 一次
  const prevR = G.resonance || {};
  const r = recomputeResonance();
  G.resonance = r;
  const just = resonanceJust(prevR, r);
  stoneHudSync(); forgeBtnSync(); renderForge(); refreshWeaponHint();
  if (just.length) {
    setTimeout(() => toast("共鸣觉醒 · " + just.join(" · "), "violet"), 240);
  }
}

function forgeOrdinary(id) {
  // v3.0 装备替换了通用装备 —— 通用合成入口已废弃
  toast("通用装备已下线 · 用怪物掉落的装备吧", "warn");
}

// 宝石满后的去处：把富余灵石淬进肉身（收益明显低于宝石）
function meltStones() {
  if (!gemsMaxed()) { toast("先凝满流派宝石"); return; }
  if (!spendStones(MELT_COST)) { toast("灵石不足"); return; }
  G.atk *= 1.02;
  G.shieldMax += 8;
  G.shield = Math.min(G.shieldMax, G.shield + 8);
  G.meltCount = (G.meltCount || 0) + 1;
  burst(G.px, G.py, "#5ce1e6", 12, 150, 3);
  AudioSys.buy();
  toast("灵石淬体 · 攻击 +2% · 护盾 +8", "cyan");
  stoneHudSync(); forgeBtnSync(); renderForge(); refreshWeaponHint();
}

function openForge() {
  if (G.state !== "play") return;
  G.state = "forge";
  releaseJoystick();
  renderForge();
  ui.forgeModal.classList.remove("hidden");
  AudioSys.buy();
}

function closeForge() {
  ui.forgeModal.classList.add("hidden");
  if (G.state === "forge") G.state = "play";
  last = performance.now();
  resolvePendingModal();
}

// v4.0 砍掉灵魄 3 选 1 弹窗：collectPickup 直接自动选最大派系
function openEssenceModal() { /* v4.0 灵魄不再弹窗 */ }

// ---------- Enemies ----------
const ENEMY_TYPES = {
  fox: { name: "野狐妖", r: 12, hp: 28, atk: 8, speed: 95, xp: 5, color: "#fb923c", shape: "fox",
    vis: { rim: "#7c2d12", hi: "#fdba74", burst: "#fb923c", eyes: "#fef3c7" } },
  wolf: { name: "妖狼", r: 13, hp: 40, atk: 11, speed: 120, xp: 7, color: "#a3e635", shape: "wolf",
    vis: { rim: "#365314", hi: "#d9f99d", burst: "#a3e635", eyes: "#ecfccb" } },
  golem: { name: "石傀儡", r: 18, hp: 95, atk: 14, speed: 55, xp: 12, color: "#94a3b8", shape: "golem",
    vis: { rim: "#334155", hi: "#e2e8f0", burst: "#94a3b8", eyes: "#fbbf24" } },
  ghost: { name: "幽魂", r: 11, hp: 22, atk: 9, speed: 105, xp: 6, color: "#a78bfa", shape: "ghost", splits: true,
    vis: { rim: "#4c1d95", hi: "#e9d5ff", burst: "#c4b5fd", eyes: "#f5f3ff" } },
  bat: { name: "血蝠", r: 10, hp: 18, atk: 7, speed: 145, xp: 4, color: "#f87171", shape: "bat",
    vis: { rim: "#7f1d1d", hi: "#fecaca", burst: "#f87171", eyes: "#fee2e2" } },
  eliteFox: { name: "赤焰狐将", r: 20, hp: 160, atk: 18, speed: 85, xp: 30, color: "#f472b6", shape: "fox", elite: true,
    vis: { rim: "#831843", hi: "#fbcfe8", burst: "#f472b6", eyes: "#fff1f2" } },
  eliteGolem: { name: "玄铁傀儡", r: 24, hp: 280, atk: 22, speed: 50, xp: 40, color: "#c084fc", shape: "golem", elite: true,
    vis: { rim: "#5b21b6", hi: "#e9d5ff", burst: "#c084fc", eyes: "#fde68a" } },
  bossFox: { name: "九尾妖王", r: 32, hp: 900, atk: 28, speed: 70, xp: 120, color: "#fbbf24", shape: "fox", boss: true, summon: true,
    vis: { rim: "#78350f", hi: "#fef3c7", burst: "#fbbf24", eyes: "#fffbeb" } },
  bossGolem: { name: "山神傀儡", r: 36, hp: 1400, atk: 32, speed: 45, xp: 150, color: "#f59e0b", shape: "golem", boss: true, slam: true,
    vis: { rim: "#7c2d12", hi: "#fde68a", burst: "#f59e0b", eyes: "#fff7ed" } },
  hordeling: { name: "尸傀", r: 9, hp: 14, atk: 6, speed: 150, xp: 2, color: "#78716c", shape: "ghost",
    vis: { rim: "#292524", hi: "#d6d3d1", burst: "#a8a29e", eyes: "#e7e5e4" } },
  dummy: { name: "玄铁试炼桩", r: 34, hp: 100, atk: 0, speed: 0, xp: 0, color: "#94a3b8", shape: "dummy",
    vis: { rim: "#44403c", hi: "#fbbf24", burst: "#fbbf24", eyes: "#fef3c7" } },
  moth: { name: "冥蝶", r: 11, hp: 26, atk: 8, speed: 128, xp: 5, color: "#c084fc", shape: "moth",
    vis: { rim: "#4c1d95", hi: "#e9d5ff", burst: "#d8b4fe", eyes: "#f5f3ff" } },
  dustling: { name: "冥粉", r: 7, hp: 10, atk: 5, speed: 155, xp: 2, color: "#a78bfa", shape: "dust",
    vis: { rim: "#5b21b6", hi: "#ddd6fe", burst: "#c4b5fd", eyes: "#ede9fe" } },
};

// 角色克制（割草 Build 差异）：type 或 shape 命中则乘区
const CHAR_MATCH = {
  sword: { strong: ["fox", "bat", "ghost", "hordeling"], weak: ["golem", "eliteGolem", "bossGolem"], mult: 1.12, weakMult: 0.92 },
  mage: { strong: ["ghost", "hordeling", "wolf", "moth", "dustling"], weak: ["golem", "eliteGolem", "bossGolem"], mult: 1.15, weakMult: 0.90 },
  body: { strong: ["golem", "eliteGolem", "bossGolem"], weak: ["bat"], mult: 1.18, weakMult: 0.88 },
};
function charVsEnemy(e) {
  const m = CHAR_MATCH[G.charId];
  if (!m || !e) return 1;
  const keys = [];
  if (e.type) keys.push(e.type);
  if (e.shape) keys.push(e.shape);
  for (const k of keys) {
    if (m.strong.indexOf(k) >= 0) return m.mult;
  }
  for (const k of keys) {
    if (m.weak.indexOf(k) >= 0) return m.weakMult;
  }
  return 1;
}
const EARLY_MERCY_WAVES = 3;
function earlyEnemyAtkMul(wave) {
  return (wave || 0) <= EARLY_MERCY_WAVES ? 0.92 : 1;
}
// v6.1 平衡：原指数 1.35 让 40 波血量 ×32 而攻击只 ×4.4，35~40 波必然撞墙
//      指数降到 1.25（40 波 ×24.7）；经验随波次上涨见 spawnEnemy
// v7.3 P1 · 终局压力
// 审计发现（balance-report）：正常配装 20 波能挨 11.5 下，40 波反而能挨 16.7 下，
// 砍妖王 49 刀 → 35 刀 —— 后期越打越安全。这是 v6.1 把指数 1.35→1.25 修撞墙时矫枉过正。
// 无尽模式没有终局压力 ⇒ 长局变机械重复，玩家不是被打死而是自己腻了退出。
// 修法：26 波起另加一段超线性压力（HP 与 ATK 同时抬头），把「越活越轻松」掰回来，
//      且不恢复 v6.1 之前那种 35~40 波硬撞墙（那段由指数 1.25 负责克制）。
// 配比说明：压力主要来自 ATK（制造"会被打死"的威胁），HP 只温和上涨。
// 试过 HP 系数 0.028 —— 40 波妖王要砍 119 刀，等于把 v6.1 修掉的撞墙又请回来了。
const ENDGAME_FROM = 26;          // 从第几波开始施加终局压力
const ENEMY_STRENGTH_MUL = 3;     // v7.8.16 敌方整体强度（HP/ATK）
const HORDE_STRENGTH_MUL = 2.5;   // 尸潮稍降，避免纯堵门
function endgameHpMul(wave) {
  if (wave <= ENDGAME_FROM) return 1;
  return 1 + 0.012 * Math.pow(wave - ENDGAME_FROM, 1.35);
}
function endgameAtkMul(wave) {
  if (wave <= ENDGAME_FROM) return 1;
  return 1 + 0.022 * (wave - ENDGAME_FROM);
}
function enemyHP(base, wave) {
  return base * (1 + 0.18 * wave) * (1 + 0.02 * Math.pow(wave, 1.25)) * endgameHpMul(wave) * ENEMY_STRENGTH_MUL;
}
function enemyATK(base, wave) {
  return base * (1 + 0.12 * wave) * endgameAtkMul(wave) * earlyEnemyAtkMul(wave) * ENEMY_STRENGTH_MUL;
}

function spawnEnemy(typeId, x, y, wave, opts) {
  const t = ENEMY_TYPES[typeId];
  const o = opts || {};
  const wm = G._waveMod || null;
  const isTrash = !t.boss && !t.elite && typeId !== "dummy";
  const hpMulMod = (isTrash && wm) ? (wm.hpMul || 1) : 1;
  const spdMod = wm ? (wm.spdMul || 1) : 1;
  const str = o.horde ? (HORDE_STRENGTH_MUL / ENEMY_STRENGTH_MUL) : 1;
  const hp = enemyHP(t.hp, wave) * (o.hpMul || 1) * hpMulMod * str;
  const e = {
    id: Math.random().toString(36).slice(2),
    type: typeId, name: t.name, x, y, r: t.r,
    hp, hpMax: hp, atk: enemyATK(t.atk, wave) * str,
    // v6.1 平衡：经验随波次小幅上涨（原固定值 ⇒ 后期三波才升一级）
    speed: t.speed * rand(0.9, 1.1) * spdMod, xp: Math.round(t.xp * (1 + (wave || 0) * 0.07)), color: t.color, shape: t.shape,
    elite: !!t.elite, boss: !!t.boss, splits: !!t.splits, summon: !!t.summon, slam: !!t.slam,
    flash: 0, hitCD: 0, specialCD: rand(2, 4), phase: rand(0, TAU),
    burn: 0, burnDmg: 0, slow: 0, slowMul: 1, dead: false,
    elem: t.elem || waveElemKey(),   // 五行属性：随波轮转
    horde: !!o.horde,                // v7.0 B 尸潮怪标记（用于统计与清场）
  };
  // v7.0 B：尸潮怪不参与词缀与精英 toast，避免刷屏
  e.mods = (e.elite || e.boss) ? rollEnemyMods(e, wave) : [];
  for (const m of e.mods) {
    if (m === "swift")  e.speed *= 1.6;
    if (m === "mirror") e.atk += G.atk * 0.25;
    if (m === "ward")  { e.ward = hp * 0.45; e.wardMax = e.ward; }
    if (m === "drain") { e.drainT = 0; }
  }
  if (e.mods.length) {
    const names = e.mods.map((m) => ENEMY_MODS[m].name).join("·");
    toast(`${e.boss ? "大妖" : "精英"}词缀 · ${names}`, "violet");
  }
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
  // v7.0：割草的底座是密度。原 3 + wave*0.85（20 波才 20 只）撑不起"割"的体感，
  //       提到 4 + wave*1.35；v7.1：前 3 波仍要温和，别一上来就淹没新手
  const count = (wave <= 3 ? 2 + wave : 4 + Math.floor(wave * 0.95)) * ((G._waveMod && G._waveMod.spawnMul) || 1);
  const pool = ["fox", "fox", "wolf"];
  if (wave >= 2) pool.push("bat", "bat");
  if (wave >= 3) pool.push("golem", "ghost");
  if (wave >= 4) pool.push("moth", "moth");
  if (wave >= 5) pool.push("wolf", "ghost", "golem");
  if (wave >= 7) pool.push("moth", "ghost", "bat");
  for (let i = 0; i < count; i++) q.push({ type: pick(pool), delay: i * 0.12 + rand(0, 0.3) });
  if (wave >= 3 && wave % 3 === 0) {
    const n = 1 + Math.floor(wave / 12);
    for (let i = 0; i < n; i++) q.push({ type: wave % 6 === 0 ? "eliteGolem" : "eliteFox", delay: 1.2 + i * 0.5 });
  }
  if (wave % 5 === 0) q.push({ type: wave % 10 === 0 ? "bossGolem" : "bossFox", delay: 2.5 });
  return q;
}

function updateWaves(dt) {
  // v7.5 试炼独占场：伤害测试期间「清场 + 停波」。
  //   这是玩家反馈直接点名要的：测试者必须被看见，而且必须是场上唯一的目标 ——
  //   一边被小怪追一边打桩，测出来的是走位和运气，不是输出。
  //   所以试炼期间不刷怪、不推进波次、不触发尸潮/悬赏，整个场子只留一个测试者。
  if (G.trial && G.trial.active) {
    G.spawnQueue.length = 0;
    G._trickle = 0;
    // 极端情况兜底：万一还有别的怪溜进来（祭坛召唤 / 分裂 / 召唤术），静默清掉
    for (const e of G.enemies) {
      if (e.dead || e.isDummy) continue;
      e.dead = true;
      burst(e.x, e.y, "#94a3b8", 8, 140, 2);
    }
    return;
  }
  // v7.1 开局试炼潮：0.6s 立刻丢 8 只残血小妖。
  // 黄金 15 秒的唯一任务就是「3 秒内割出第一次升级」——先给爽点，再讲系统。
  if (G._openingRush && G.time > 0.6) {
    G._openingRush = false;
    for (let i = 0; i < 8; i++) {
      const a = rand(0, TAU);
      const r = Math.max(view.w, view.h) * 0.42 + rand(0, 70);
      spawnEnemy(pick(["fox", "bat", "fox", "ghost"]), G.px + Math.cos(a) * r, G.py + Math.sin(a) * r, 1, { hpMul: 0.5 });
    }
    toast("开局八妖 · 先割一波", "gold");
    G.shake = Math.max(G.shake, 6);
    // 开局直接送 2 颗本命灵石：让「拾灵石 → 攒 5 颗解锁核心」这条主线在第一波就被看见
    for (let i = 0; i < 2; i++) {
      dropPickup(G.px + rand(-46, 46), G.py + rand(-46, 46), "stone", { stone: randStone() });
    }
  }
  // v7.1 节奏控制器：目标同屏数 —— 场上太空就加速灌（原第 1 波 8 秒清完、空场 18 秒），
  //   太挤就放缓给玩家喘息。割草要的是「一直有东西割」，不是「要么淹死要么发呆」
  const aliveN = G.enemies.reduce((s, e) => s + (e.dead ? 0 : 1), 0);
  const targetAlive = (G.wave <= 3 ? 7 : Math.min(48, 6 + G.wave * 0.9)) * ((G._waveMod && G._waveMod.id === "tide") ? 1.35 : 1);
  let trickleInterval = G.wave <= 3 ? 1.6 : Math.max(0.55, 1.7 - G.wave * 0.035);
  if (aliveN < targetAlive * 0.55) trickleInterval *= 0.35;
  else if (aliveN > targetAlive * 1.35) trickleInterval *= 2.0;
  // v7.1：前期涓流不能把玩家淹没 —— 前 3 波同屏封顶 10 只，之后才放开到 110
  const trickleCap = G.wave <= 3 ? 10 : 110;
  G._trickle = (G._trickle || 0) + dt;
  if (G._trickle >= trickleInterval) {
    G._trickle = 0;
    if (G.enemies.length < trickleCap) {
      const pool = ["fox", "bat"];
      if (G.wave >= 3) pool.push("wolf", "ghost");
      // v7.1：按缺口批量补怪（原来一次 1 只，玩家一强就清出空场，割草感消失）
      const deficit = Math.max(0, targetAlive - aliveN);
      const n = Math.min(4, Math.max(1, Math.round(deficit * 0.5)));
      for (let i = 0; i < n; i++) spawnAtEdge(pick(pool), G.wave);
    }
  }
  G.waveTimer -= dt;
  if (G.waveTimer <= 0) {
    G.wave += 1;
    enterWaveMod(G.wave);
    // v7.1：前 3 波 16 秒一波（25 秒太长，第 1 波 8 秒就清完了，剩下 17 秒在发呆）
    G.waveTimer = G.wave <= 3 ? 16 : G.waveInterval;
    // v7.1：波间喘息 —— 每波结束回 12% 最大气血。
    //   没有回血手段 + 持续磨血 = 必定在 30 秒左右被耗死（探针实测 31s 阵亡），
    //   这不是难度，是数学上的必死局。
    if (G.wave > 1) {
      const heal = G.hpMax * 0.12;
      G.hp = Math.min(G.hpMax, G.hp + heal);
      spawnFloater(G.px, G.py - G.pr - 16, `妖潮暂歇 +${Math.round(heal)}`, "#86efac", 13);
    }
    G.spawnQueue = buildWave(G.wave);
    // v7.6 道途感悟：每 4 波一次兵器保底成长（让双兵合击从「运气」变成「节奏」）
    if (G.wave >= INSIGHT_EVERY && G.wave % INSIGHT_EVERY === 0) grantWeaponInsight();
    // v7.6 本命灵石自动入槽（攒够 3 颗同派系就上，玩家仍可手动换）
    autoStoneSlot();
    // v7.2 悬赏令：波次推进时发牌（内部按 6 的倍数且避开妖王/尸潮波）
    startBounty(G.wave);
    const we = ELEM_BY_KEY[waveElemKey()];
    const rel = bestElemRelation(we.key);
    const relTxt = rel.tag ? ` · ${rel.tag}` : "";
    toast(`第 ${G.wave} 波 · ${we.name}行妖潮${relTxt}`, rel.mul < 1 ? "cyan" : G.wave % 5 === 0 ? "red" : "gold");
    G.waveBanner = 1.4;
    G.waveBannerText = (G.wave % 5 === 0 ? `第 ${G.wave} 波 · ${we.name}行大妖` : `第 ${G.wave} 波 · ${we.name}行妖潮`) + relTxt;
    if (G.wave % 5 === 0) AudioSys.boss();
    // v7.0 B 尸潮涌：每 7 波灌入一大群低血尸傀（不与妖王波重叠，避免难度尖刺）
    if (G.wave >= HORDE_EVERY && G.wave % HORDE_EVERY === 0 && G.wave % 5 !== 0) {
      startHorde(G.wave);
    }
    // v7.4 玄铁试炼桩：第 15 / 30 波丢下伤害测试者，给 60 秒打桩
    if (trialIsWave(G.wave)) spawnTrial(G.wave);
  }
  if (G.spawnQueue.length) {
    for (const item of G.spawnQueue) item.delay -= dt;
    const ready = G.spawnQueue.filter((i) => i.delay <= 0);
    G.spawnQueue = G.spawnQueue.filter((i) => i.delay > 0);
    for (const item of ready) {
      if (G.enemies.length < 140) spawnAtEdge(item.type, G.wave);
    }
  }
}

// ================= v6.0 C · 祭坛赌注 =================
// 每 5 波显化一座祭坛 —— 是"你主动走过去"的空间交互，不是打断节奏的强制弹窗，可以拒绝
const ALTAR_DEALS = [
  { id: "blood", ico: "血", name: "血祭", give: "攻击 +50%",             cost: "献祭 30% 生命上限",
    apply() { G.altarBuffs.hpMul *= 0.7; G.altarBuffs.atkMul *= 1.5; } },
  { id: "void",  ico: "空", name: "空槽", give: "装备掉落品阶 +1 阶",     cost: "随机卸下 1 件已穿装备",
    apply() { const sl = ["weapon", "armor", "accessory"].filter((s) => G.equipped[s]); if (sl.length) unequipTo(sl[Math.floor(Math.random() * sl.length)]); G.altarBuffs.dropUp += 1; } },
  { id: "curse", ico: "咒", name: "妖咒", give: "经验 ×1.5",             cost: "全场妖物移速 +25%",
    apply() { G.altarBuffs.xpMul *= 1.5; G.altarBuffs.curseSpeed *= 1.25; } },
  { id: "frail", ico: "脆", name: "脆骨", give: "暴击率 +18%",           cost: "生命上限 −25%",
    apply() { G.altarBuffs.hpMul *= 0.75; G.altarBuffs.critAdd += 0.18; } },
  { id: "lame",  ico: "缚", name: "缚足", give: "拾取范围 +140",         cost: "移速 −15%",
    apply() { G.altarBuffs.moveMul *= 0.85; G._altarPickup = (G._altarPickup || 0) + 140; } },
  { id: "greed", ico: "贪", name: "贪饕", give: "攻击 +30% · 经验 +30%", cost: "受到伤害 +20%",
    apply() { G.altarBuffs.atkMul *= 1.3; G.altarBuffs.xpMul *= 1.3; G._baseDmgTaken = (G._baseDmgTaken || 1) + 0.2; } },
];
const ALTAR_BY_ID = {};
for (const d of ALTAR_DEALS) ALTAR_BY_ID[d.id] = d;

// 品阶提升（祭坛「空槽」用）
function tierUp(tier, n) {
  const i = TIER_ORDER.indexOf(tier);
  return TIER_ORDER[Math.min(TIER_ORDER.length - 1, i + n)];
}

function spawnAltar() {
  const ang = rand(0, TAU);
  G.altars.push({ x: G.px + Math.cos(ang) * 330, y: G.py + Math.sin(ang) * 330, r: 48, life: 50, used: false, bob: 0 });
  toast("祭坛显现 · 走近立血契（可直接走开拒绝）", "violet");
}

function updateAltars(dt) {
  if (G.wave > 0 && G.wave % 5 === 0 && G._altarWave !== G.wave) { G._altarWave = G.wave; spawnAltar(); }
  for (const a of G.altars) { a.life -= dt; a.bob += dt * 2.2; }
  G.altars = G.altars.filter((a) => a.life > 0 && !a.used);
  if (G.state !== "play") return;
  for (const a of G.altars) {
    if (dist(a.x, a.y, G.px, G.py) < a.r + G.pr) { openAltar(a); break; }
  }
}

function openAltar(a) {
  a.used = true;
  G.state = "altar";
  const pool = ALTAR_DEALS.slice();
  const picks = [];
  for (let i = 0; i < 3 && pool.length; i++) picks.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  G._altarPicks = picks;
  if (ui.altarChoices) {
    ui.altarChoices.innerHTML = "";
    for (const d of picks) {
      const btn = document.createElement("button");
      btn.className = "choice-card altar-card";
      btn.dataset.deal = d.id;
      btn.innerHTML = `<span class="choice-ico">${d.ico}</span><b>${d.name}</b>`
        + `<span class="choice-desc">${d.give}</span><span class="altar-cost">代价 · ${d.cost}</span>`;
      btn.addEventListener("click", () => takeAltarDeal(d.id));
      ui.altarChoices.appendChild(btn);
    }
  }
  if (ui.altarModal) ui.altarModal.classList.remove("hidden");
  AudioSys.level();
}

function takeAltarDeal(id) {
  const d = ALTAR_BY_ID[id];
  if (!d) return closeAltar();
  d.apply();
  equipRec();
  G.hp = Math.min(G.hp, G.hpMax);
  burst(G.px, G.py, "#c084fc", 26, 220, 4);
  G.shake = Math.max(G.shake, 6);
  showBigBanner("血契成立", `${d.name} · ${d.give}`, "purple");
  toast(`血契 · ${d.name} · ${d.give}`, "violet");
  closeAltar();
}

function closeAltar() {
  if (ui.altarModal) ui.altarModal.classList.add("hidden");
  // 立契或拒绝后祭坛都消散，避免重复触发
  G.altars = G.altars.filter((a) => !a.used);
  G.state = "play";
}

// ================= v7.8.12 自动必杀 + 三幕天劫 =================
const ACTS = [
  { id: 1, from: 1, to: 8, name: "潮起", sub: "蓄势寻机 · 稳扎稳打" },
  { id: 2, from: 9, to: 17, name: "狂澜", sub: "大妖伺伏 · 火力全开" },
  { id: 3, from: 18, to: 9999, name: "傀神·无尽", sub: "劫火焚天 · 生死自负" },
];
const ULT = {
  name: "天劫灭世",
  chargeMax: 100,
  stockMax: 3,
  stockInit: 2,
  windup: 0.8,
  dmgMul: 8,
  gain: { mob: 2, horde: 4, elite: 15, boss: 40 },
};
function actForWave(w) {
  const n = w || 0;
  if (n < 1) return ACTS[0];
  for (const a of ACTS) if (n >= a.from && n <= a.to) return a;
  return ACTS[ACTS.length - 1];
}
function ultHudSync() {
  try {
    const el = document.getElementById("ultHud");
    if (!el) return;
    el.classList.toggle("hidden", G.state !== "play");
    const fill = document.getElementById("ultFill");
    const stock = document.getElementById("ultStock");
    if (fill) fill.style.width = `${clamp(((G.ultCharge || 0) / ULT.chargeMax) * 100, 0, 100)}%`;
    if (stock) stock.textContent = `×${G.ultStock || 0}`;
    el.classList.toggle("ready", (G.ultCharge || 0) >= ULT.chargeMax && (G.ultStock || 0) > 0);
    el.classList.toggle("armed", (G.ultReady || 0) > 0);
  } catch (_) {}
}
function enterAct(act) {
  G.act = act.id;
  const cn = ["一", "二", "三"][act.id - 1] || String(act.id);
  showBigBanner(`第${cn}幕 · ${act.name}`, act.sub + " · 回血 15%" + (act.id === 2 ? " · 十五波将有试炼" : act.id === 3 ? " · 三十波试炼候教" : ""), "gold");
  toast(`天劫第${cn}幕 · ${act.name}`, "gold");
  G.hp = Math.min(G.hpMax, G.hp + G.hpMax * 0.15);
  G.ultStock = Math.min(ULT.stockMax, (G.ultStock || 0) + 1);
  if (window.Analytics) Analytics.track("act_enter", { act: act.id, wave: G.wave });
  ultHudSync();
}
function tickActs() {
  if (G.wave < 1) return; // 开局空场不算入幕
  const a = actForWave(G.wave);
  if (G.act !== a.id) enterAct(a);
}
function addUltCharge(kind) {
  const g = ULT.gain[kind] || 0;
  if (g <= 0) return;
  G.ultCharge = Math.min(ULT.chargeMax, (G.ultCharge || 0) + g);
  if (G.ultCharge >= ULT.chargeMax && (G.ultStock || 0) > 0 && !G.ultCasting) {
    toast(`${ULT.name} · 蓄满待发`, "gold");
  }
  ultHudSync();
}
function castUlt() {
  if (G.state !== "play" || G.ultCasting > 0) return false;
  if (G.trial && G.trial.active) return false;
  if ((G.ultCharge || 0) < ULT.chargeMax || (G.ultStock || 0) <= 0) return false;
  G.ultCasting = ULT.windup;
  G.ultCharge = 0;
  G.ultReady = 0;
  toast(`${ULT.name} · 天劫蓄势`, "gold");
  showBigBanner("天劫蓄势", ULT.name + " 0.8s 后湮灭全场", "orange");
  ultHudSync();
  return true;
}
function fireUlt() {
  G.ultCasting = 0;
  // 试炼中/试炼桩：不结算全屏伤害，避免作弊打桩
  if (G.trial && G.trial.active) {
    toast("试炼中 · 天劫暂缓", "cyan");
    G.ultCharge = 0;
    ultHudSync();
    return;
  }
  G.ultStock = Math.max(0, (G.ultStock || 1) - 1);
  const dmg = G.atk * ULT.dmgMul * playerDamageMult();
  const dmgSafe = Number.isFinite(dmg) ? dmg : 0;
  let killed = 0;
  G.goldFlash = 0.55;
  G.shake = 14;
  G.particles.push({
    x: G.px, y: G.py, vx: 0, vy: 0, life: 0.55, max: 0.55,
    color: "#fde68a", size: 6, ring: { r0: 40, r1: Math.max(view.w, view.h) },
  });
  burst(G.px, G.py, "#fbbf24", 36, 320, 6);
  for (const e of G.enemies) {
    if (e.dead || e.isDummy) continue;
    applyHit(e, dmgSafe);
    if (e.dead) killed++;
  }
  if (window.Analytics) Analytics.track("ult_cast", { wave: G.wave, stock: G.ultStock });
  if (window.Analytics) Analytics.track("ult_wipe_kills", { kills: killed, dmg: Math.round(dmgSafe) });
  toast(`${ULT.name} · 湮灭 ${killed} 妖`, "gold");
  AudioSys.boss();
  ultHudSync();
}
function tickUlt(dt) {
  if (G.ultCasting > 0) {
    G.ultCasting -= dt;
    if (G.ultCasting <= 0) {
      G.ultCasting = 0;
      fireUlt();
    }
    return;
  }
  // P0-C 存弹：蓄满先等 3s，可点 HUD 立即释放
  if ((G.ultCharge || 0) >= ULT.chargeMax && (G.ultStock || 0) > 0) {
    if (!G.ultReady) {
      G.ultReady = 3;
      toast(`${ULT.name} · 可释放（点劫印）`, "gold");
    }
    G.ultReady -= dt;
    if (G.ultReady <= 0) castUlt();
    ultHudSync();
  }
}

// ---------- Combat ----------
/** 软碰撞分离：圆体重叠推开，不穿模（无伤害） */
function softCollide() {
  const list = [];
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) { e.dead = true; continue; }
    if (e._colT > 0) e._colT = Math.max(0, e._colT - 0.016);
    list.push(e);
  }
  const n = list.length;
  if (!n) return;
  const near = n > 60
    ? list.slice().sort((a, b) => dist(a.x, a.y, G.px, G.py) - dist(b.x, b.y, G.px, G.py)).slice(0, 24)
    : list;
  let fixes = 0;
  const MAX_FIX = 40;
  const norm = (dx, dy, seed) => {
    let d = Math.hypot(dx, dy);
    if (!(d > 0.5) || !Number.isFinite(d)) {
      const a = (seed || 0) * 12.9898;
      d = 1;
      return { nx: Math.cos(a), ny: Math.sin(a), d: 0 };
    }
    return { nx: dx / d, ny: dy / d, d };
  };
  // 玩家 vs 敌（玩家 35% / 对方 65%；试炼桩不推玩家）
  for (const e of near) {
    if (fixes >= MAX_FIX) break;
    const { nx, ny, d } = norm(G.px - e.x, G.py - e.y, e.r + (e.phase || 0));
    const min = e.r + G.pr + 2;
    if (d < min) {
      const pen = min - d;
      let eK = 0.65, pK = 0.35;
      if (e.boss) { eK = 0.65 * 0.85; pK = 1 - eK; }
      if (e.isDummy) {
        if (e.isChaser) { eK = 0.5 * 0.65; pK = 1 - eK; }
        else { eK = 0; pK = 0; } // 静止试炼桩：不推玩家
      }
      G.px += nx * pen * pK;
      G.py += ny * pen * pK;
      if (eK > 0) {
        e.x -= nx * pen * eK;
        e.y -= ny * pen * eK;
      }
      fixes++;
    }
  }
  // 敌 vs 敌
  for (let i = 0; i < near.length; i++) {
    for (let j = i + 1; j < near.length; j++) {
      if (fixes >= MAX_FIX) return;
      const a = near[i], b = near[j];
      const { nx, ny, d } = norm(b.x - a.x, b.y - a.y, a.r + b.r);
      const min = a.r + b.r + 2;
      if (d < min) {
        const pen = (min - d) * 0.5;
        const wa = a.boss ? 0.3 : 0.5, wb = 1 - wa;
        a.x -= nx * pen * wa; a.y -= ny * pen * wa;
        b.x += nx * pen * wb; b.y += ny * pen * wb;
        fixes++;
      }
    }
  }
}

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
  // v7.2 连杀爆点：每 20 连斩自动放一次「剑意爆发」（低频、有 CD，不会刷屏）
  if (G.combo > 0 && G.combo % burstStep() === 0 && (G._comboBurstT || 0) <= 0) comboBurst();
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

// ================= v7.2 · 打击感（刀刀到肉）================
// 诊断（ftue-sim 复测 + 静态审查）：
//   v7.1 之后玩家活得下来、升得了级、有抉择，但「打出去没有回应」——
//   · 普通命中：连伤害数字都没有（只有暴击 / 联动才跳字），玩家不知道自己打出了多少
//   · 普通击杀：只有 +xp 一个飘字，无粒子、无冲击环、无屏震
//     而一局割草里 90% 的击杀是小怪 ⇒ 最核心的那一秒是空的
//
// 设计原则（避免把割草做成「粘」）：
//   · 普通命中 **不顿帧**：高频命中一旦顿帧就会一顿一顿，手感变粘、操作不跟手。
//     改用「伤害数字 + 敌人闪白」表达"打到了"。
//   · 顿帧只留给低频爆点：暴击、精英 / 妖王击杀、剑意爆发。
//   · 击杀用「冲击环 + 血雾 + 微屏震」表达力度——不打断帧，不影响跟手。
//   · 数字 / 粒子全部走节流与硬上限，同屏 110 只时不糊屏、不掉帧。
const FEEL = {
  numGate: 0.07,       // 全局伤害数字节流：0.07s 最多 1 个（≈14 个/秒）
  numMerge: 0.14,      // 同一目标 0.14s 内的多段伤害合并成一个数字，读得出总数
  partCap: 420,        // 粒子硬上限，超出丢弃（尸潮同屏 110 只时保帧）
  comboBurstStep: 20,  // 每 20 连杀触发一次「剑意爆发」
  executeMark: 0.3,    // 血量低于 30% 亮处决标记
};

function feelPart(o) {
  if (G.particles.length < FEEL.partCap) G.particles.push(o);
}

// 命中反馈：合并伤害数字 + 敌人闪白；暴击额外给顿帧与屏震
function feelHit(e, dmg, isCrit) {
  if (!e) return;
  e.flash = Math.max(e.flash || 0, isCrit ? 0.16 : 0.09);
  const now = G.time;
  e._numBuf = (e._numBuf || 0) + dmg;
  if (isCrit) e._numCrit = true;
  // 注意：G.time 从 0 开始，0 是 falsy —— 必须显式判 undefined，不能写 `G._dmgNumT || -9`，
  // 否则开局那 0.07 秒里节流哨兵恒为 -9，伤害数字会一次性糊屏（真实 bug，测试 58 抓到）
  const gLast = G._dmgNumT === undefined ? -9 : G._dmgNumT;
  const eLast = e._numT === undefined ? -9 : e._numT;
  if (now - gLast < FEEL.numGate) return;                   // 全局节流
  if (eLast >= 0 && now - eLast < FEEL.numMerge) return;    // 等合并窗口
  const total = Math.round(e._numBuf);
  if (!Number.isFinite(total) || total <= 0) { e._numBuf = 0; return; }
  G._dmgNumT = now; e._numT = now; e._numBuf = 0;
  const crit = !!e._numCrit; e._numCrit = false;
  spawnFloater(e.x + rand(-5, 5), e.y - e.r - 8,
    crit ? `${total}!` : String(total),
    crit ? "#fde047" : "#e2e8f0", crit ? 17 : 12, crit);
  if (crit) {
    G.shake = Math.max(G.shake, 3.5);
    // 暴击星芒
    const cx = e.x, cy = e.y;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + (G.time || 0) * 2;
      feelPart({
        x: cx, y: cy, vx: Math.cos(a) * 90, vy: Math.sin(a) * 90,
        life: 0.22, max: 0.22, color: "#fde047", size: 2.2,
        line: { x: cx + Math.cos(a) * 18, y: cy + Math.sin(a) * 18 },
      });
    }
  } else if (Math.random() < 0.35) {
    feelPart({
      x: e.x, y: e.y, vx: rand(-40, 40), vy: rand(-50, 10),
      life: 0.18, max: 0.18, color: "#fff7ed", size: 1.6,
    });
  }
}

// 击杀爆破：冲击环 + 血雾 + 屏震。小怪也要有——这是割草的本体
function feelKill(e) {
  const boss = !!e.boss, elite = !!e.elite;
  const blood = boss ? "#f59e0b" : (e.color || "#b91c1c");
  if (!boss && !elite) {
    // 精英 / 妖王的环在 killEnemy 里已有，这里只补小怪
    feelPart({ x: e.x, y: e.y, vx: 0, vy: 0, life: 0.22, max: 0.22,
      color: blood, size: 3, ring: { r0: e.r * 0.6, r1: e.r + 22 } });
  }
  const n = boss ? 26 : elite ? 14 : 6;
  for (let i = 0; i < n; i++) {
    const a = rand(0, TAU), s = rand(60, boss ? 300 : elite ? 200 : 130);
    feelPart({
      x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s,
      life: rand(0.18, 0.42), max: 0.42,
      color: i % 3 === 0 ? "#fca5a5" : blood,
      size: rand(1.6, boss ? 5 : 3.2),
    });
  }
  // 小怪只给极小的震（1.6px），靠「量」堆出割草的力度感而不至于晃晕
  G.shake = Math.max(G.shake, boss ? 10 : elite ? 6 : 1.6);
}

// ================= v7.2 · 悬赏令（局内限时挑战）================
// 产品判断：v7.1 解决了「前 15 秒」，但波次之间仍然只有「活下去」这一个目标。
//   割草类的留存靠的是「下一个可期待的事件」。悬赏令每 6 波发一张，限时完成给即时
//   奖励 —— 把平淡推进切成一段段有始有终的小挑战，也给了玩家一个「要不要为了它
//   改变打法」的抉择（例如避煞令会逼你放弃贴脸换血）。
// 刻意避开妖王波（5 的倍数）和尸潮波（7 的倍数），不在难度尖刺上再叠要求。
const BOUNTY_DEFS = [
  {
    id: "kill", name: "斩妖令", verb: "限时斩妖", unit: "只",
    need: (w) => 12 + Math.floor(w * 1.0), time: 26,
    pay: (w) => 60 + w * 6,
  },
  {
    id: "nohurt", name: "避煞令", verb: "全身而退", unit: "秒",
    need: () => 16, time: 16,
    pay: (w) => 80 + w * 8,
  },
  {
    id: "chain", name: "连爆令", verb: "引爆连锁", unit: "次",
    need: (w) => 3 + Math.floor(w * 0.22), time: 24,
    pay: (w) => 70 + w * 7,
  },
];
const BOUNTY_BY_ID = {};
for (const b of BOUNTY_DEFS) BOUNTY_BY_ID[b.id] = b;

function startBounty(wave) {
  if (G._noBounty) return;                                 // 测试钩子：隔离击杀副作用
  if (wave < 6 || wave % 6 !== 0) return;
  if (wave % 5 === 0 || wave % 7 === 0) return;          // 妖王波 / 尸潮波不发
  if (G.bounty && G.bounty.state === "active") return;
  const def = pick(BOUNTY_DEFS);
  G.bounty = { id: def.id, need: def.need(wave), got: 0, left: def.time, total: def.time, state: "active" };
  showBigBanner("悬赏令", `${def.name} · ${def.verb} ${G.bounty.need}${def.unit} · ${def.time}秒`, "gold");
  toast(`悬赏 · ${def.name}：${def.verb} ${G.bounty.need}${def.unit}`, "gold");
}

function bountyAdd(n) {
  const b = G.bounty;
  if (!b || b.state !== "active") return;
  b.got += (n || 1);
  if (b.got >= b.need) completeBounty();
}

function completeBounty() {
  const b = G.bounty;
  if (!b || b.state !== "active") return;
  const def = BOUNTY_BY_ID[b.id];
  b.state = "done";
  const pay = def.pay(G.wave || 1);
  G.coinsRun += pay;
  // 奖励落在脚下，不用玩家满地图找
  for (let i = 0; i < 4; i++) {
    dropPickup(G.px + rand(-40, 40), G.py + rand(-40, 40), "stone", { stone: randStone() });
  }
  if (b.id === "nohurt") dropPickup(G.px + rand(-30, 30), G.py + rand(-30, 30), "relic");
  else dropPickup(G.px + rand(-30, 30), G.py + rand(-30, 30), "equip", { equip: makeEquip(pick(["weapon", "armor", "accessory"]), "blue") });
  burst(G.px, G.py, "#fde047", 26, 240, 4);
  G.goldFlash = Math.max(G.goldFlash || 0, 0.3);
  G.shake = Math.max(G.shake, 8);
  showBigBanner("悬赏达成", `${def.name} · 灵玉 +${pay}`, "gold");
  spawnFloater(G.px, G.py - 44, `+${pay} 灵玉`, "#fde047", 16, true);
  AudioSys.level();
  b.hold = 2.6;                       // 结果展示 2.6s 后由 tickBounty 清掉（不用 setTimeout：切后台会错乱）
}

function failBounty(reason) {
  const b = G.bounty;
  if (!b || b.state !== "active") return;
  b.state = "fail";
  b.hold = 1.6;                       // 同上，帧计时清场（不用 setTimeout）
  const def = BOUNTY_BY_ID[b.id];
  toast(`悬赏失败 · ${def.name}`, "red");
}

function tickBounty(dt) {
  const b = G.bounty;
  if (!b) return;
  // v7.5：试炼期间场上没怪，击杀类悬赏不可能完成 —— 冻结计时，别让玩家白亏一张悬赏令
  if (G.trial && G.trial.active) return;
  // 已完成/失败：展示一小会儿再清场（帧计时，切后台不会错乱）
  if (b.state !== "active") {
    b.hold -= dt;
    if (b.hold <= 0) G.bounty = null;
    return;
  }
  b.left -= dt;
  // 避煞令是「坚持 N 秒不受伤」，靠 got 计时；其余看 left
  if (b.id === "nohurt") {
    b.got += dt;
    if (b.got >= b.need) completeBounty();
    return;
  }
  if (b.left <= 0) failBounty("timeout");
}

// v7.3 变类卡「剑意频出」：所需连杀可被削减（下限 8，避免刷屏）
function burstStep() { return Math.max(8, FEEL.comboBurstStep - (G._burstCut || 0)); }
// 连杀爆点：把「连杀数字变大」变成一件可期待的事
function comboBurst() {
  if (G._noBurst) return;                 // 测试钩子：隔离击杀副作用（掉率统计要纯净）
  const tier = Math.min(6, Math.floor(G.combo / burstStep()));
  const radius = 150 + tier * 24;
  const dmg = G.atk * (3 + tier * 0.9) * playerDamageMult();
  let hits = 0;
  for (const e of G.enemies) {
    if (e.dead || hits >= 40) continue;
    if (dist(e.x, e.y, G.px, G.py) < radius) { hits += 1; applyHit(e, dmg); }
  }
  feelPart({ x: G.px, y: G.py, vx: 0, vy: 0, life: 0.34, max: 0.34,
    color: "#fde68a", size: 5, ring: { r0: G.pr, r1: radius } });
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + rand(-0.1, 0.1);
    feelPart({ x: G.px, y: G.py, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420,
      life: 0.2, max: 0.2, color: "#fef3c7", size: 3 });
  }
  G.shake = Math.max(G.shake, 12);
  hitStop(90);
  G.goldFlash = Math.max(G.goldFlash || 0, 0.18);
  G._comboBurstT = 1.2;                    // 内置 CD，防止高连杀时每帧刷屏
  spawnFloater(G.px, G.py - 40, `剑意 ×${tier}`, "#fde047", 18, true);
  showBigBanner("剑意爆发", `${G.combo} 连斩 · 剑气纵横 ${Math.round(radius)}`, "gold");
  AudioSys.crit();
}

// 震波：把周围妖物推开一点（磐石/铁骨的圆满效果用）
function knockEnemies(cx, cy, radius, force) {
  for (const e of G.enemies) {
    if (e.dead || e.boss || e.isDummy) continue;   // v7.4 试炼桩钉死不动
    const d = dist(cx, cy, e.x, e.y);
    if (d < radius && d > 0.01) {
      const f = force * (1 - d / radius);
      e.x += ((e.x - cx) / d) * f;
      e.y += ((e.y - cy) / d) * f;
    }
  }
}

function damagePlayer(amount) {
  if (G.dashIFrame > 0 || G.invuln > 0) return;
  if (G._hurtCD > 0) return;
  G._lastDmgCause = G._pendingCause || G._lastDmgCause;
  // v7.1 黄金 15 秒 · P0-1：没有受击间隔 ⇒ 被 3~5 只围住时 N 份伤害同帧叠加，
  //   实测开局 9 秒暴毙（探针 ftue-sim），玩家还没搞懂就死了。
  //   加 0.5s 受击间隔：围攻变成「一下一下挨打」，玩家有时间走位脱身。
  if ((G._hurtCD || 0) > 0) return;
  G._hurtCD = 0.5;
  // 派系核心：装备中核心的 damageTaken 钩子（如玄铁 30% 完全免伤）
  for (const c of coresEquipped()) {
    if (c.damageTaken) amount = c.damageTaken(amount);
    if (amount <= 0) return;
  }
  amount *= (G.nodeDmgTakenMul || 1) * (G.dmgTakenMul || 1);   // 玄冰剑阵 / 转职：减伤
  // v6.0 B 联动 · 玄铁壁：护盾还在时，减伤再 −20%
  if (synOn("syn_ironwall") && G.shield > 0) amount *= 0.8;
  const hadShield = G.shield > 0;
  // v6.0 B 联动 · 荆棘壁垒：护盾还在时，受击反弹 ×3 给周围 3 敌
  if (synOn("syn_thornwall") && hadShield && amount > 0) {
    const back = amount * 0.25 * 3;
    let n = 0;
    for (const e of G.enemies) {
      if (e.dead || n >= 3) continue;
      if (dist(e.x, e.y, G.px, G.py) < 180) {
        e.hp -= back;
        spawnFloater(e.x, e.y - e.r, String(Math.round(back)), "#a3e635", 11);
        if (e.hp <= 0) killEnemy(e);
        n++;
      }
    }
    if (n > 0) burst(G.px, G.py, "#a3e635", 10, 150, 3);
  }
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
  // 铁骨圆满：护盾被击碎时爆发冲击波
  if (hadShield && G.shield <= 0 && G.gemFx.shieldBreak) {
    burst(G.px, G.py, "#cbd5e1", 26, 240, 5);
    G.shake = Math.max(G.shake, 7);
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (dist(e.x, e.y, G.px, G.py) < 150) applyHit(e, G.atk * 1.4 * playerDamageMult());
    }
    knockEnemies(G.px, G.py, 150, 90);
    toast("护盾碎裂 · 冲击波外放", "cyan");
  }
  if (amount <= 0) return;
  G.hp -= amount;
  G.deathCause = G._lastDmgCause || G.deathCause || "swarm";
  // v7.2 悬赏令 · 避煞令：受伤即失败（逼玩家为了悬赏改变打法）
  if (G.bounty && G.bounty.id === "nohurt" && G.bounty.state === "active") failBounty("hurt");
  G.playerHurt = 0.18;
  G.flash = 0.15;
  G.shake = Math.min(10, G.shake + amount * 0.08);
  AudioSys.hurt();
  // 磐石圆满：受击有概率爆出震波
  if (G.gemFx.quake && Math.random() < G.gemFx.quake) {
    burst(G.px, G.py, "#d6a86a", 20, 200, 4);
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (dist(e.x, e.y, G.px, G.py) < 130) applyHit(e, G.atk * playerDamageMult());
    }
    knockEnemies(G.px, G.py, 130, 70);
  }
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
  if (G.hp <= 0) {
    // 派系核心 onDeathCheck：龙血核心「浴火重生」满血复活一次
    let revived = false;
    for (const c of coresEquipped()) {
      if (c.onDeathCheck && c.onDeathCheck()) { revived = true; break; }
    }
    if (revived) return;
    G.hp = 0; endRun();
  }
}

// 御风圆满：御风之后短时间攻速大涨
function atkSpeedNow() {
  const h = (G.gemFx && G.gemFx.dashHaste && G.hasteT > 0) ? 1 + G.gemFx.dashHaste : 1;
  // v6.0 B 联动 · 狂血：击杀后 2s 攻速 ×2
  const f = (G._frenzyT || 0) > 0 ? 2 : 1;
  const v = G.atkSpeed * h * f * (G._jobAtkSpeedMul || 1);
  // v7.5.1 兜底：攻速一旦变成 Infinity / NaN，飞剑相位会跟着爆掉，
  //   ctx.arc 收到 Infinity 角度 ⇒ 浏览器静默丢弃该段路径 ⇒ 花屏 / 图形截断（不报错，最难查）。
  //   这里把它按回 1，宁可这一帧转得慢，也不能把画面画烂。
  return Number.isFinite(v) ? v : 1;
}

function playerDamageMult() {
  let m = 1;
  const eq = G._eqCache || equipBonuses();
  if (G.hp < G.hpMax * 0.4) m += G.lowHpBonus;
  // 龙血流：气血低于 45% 时狂化
  if (G.gemFx && G.gemFx.rage && G.hp < G.hpMax * 0.45) m += 0.25;
  // 本命归一（共鸣）—— 凝出第一颗宝石即永久获得
  if (G.resonance && G.resonance.benPlayerMul) m += G.resonance.benPlayerMul;
  // v3.0 装备·火元素加伤（其他元素词条预留接口）
  m *= eq.huoMul;
  // v7.0 C 濒死狂血：五息之内伤害 +50%（攻速 ×2 见 atkSpeedNow）
  if ((G._frenzyT || 0) > 0) m *= 1.5;
  // 派系核心：每个核心可叠加一个 damageMult 钩子（血月当空等）
  for (const c of coresEquipped()) {
    if (c.damageMult) m = c.damageMult(m);
  }
  // 剑阵：站在阵上吃阵法增益，升级「阵心通明」再叠一层
  m *= (G.nodeAtkMul || 1);
  if (G.nodeActive) m *= (1 + (G.nodeBonus || 0));
  // 宝物：按词缀与品质提供攻击加成
  try {
    if (window.Treasure) {
      const tb = Treasure.combatBonus((Meta.load().treasures) || []);
      m *= 1 + (tb.atk || 0);
    }
  } catch (_) {}
  return m;
}

function spawnFloater(x, y, text, color, size, crit = false) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;      // v7.4：非法坐标不入队（会画成整屏乱线）
  // v7.4：飘字硬上限 —— 尸潮波实测同屏 260+ 条，屏幕糊成一片还掉帧
  if (G.floaters.length >= RENDER_CAP.floaters) G.floaters.shift();
  G.floaters.push({ x, y, text, color, size, life: 0.85, vy: -40, crit });
}

function burst(x, y, color, n = 8, speed = 120, size = 3) {
  // v7.7：粒子数按画质档位缩放（高档位仍是原值，手感不变；低档位削峰保命）
  const k = (Quality && Quality.particleMul) ? Quality.particleMul() : 1;
  const total = Math.max(1, Math.round(n * k));
  for (let i = 0; i < total; i++) {
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
  // v7.4 玄铁试炼桩：打碎即通过 —— 不发普通战利品，奖励统一在 endTrial 里按成绩给
  if (e.isDummy) {
    if (G.trial && G.trial.active) { G.trial.killed = true; endTrial(true, "击碎"); }
    burst(e.x, e.y, "#f0c14b", 36, 320, 6);
    G.shake = Math.max(G.shake, 10);
    G.goldFlash = Math.max(G.goldFlash || 0, 0.26);
    if (window.Treasure && G.trial && G.trial.killed) {
      const meta = Meta.load();
      const t = Treasure.trialReward(meta.treasures);
      const add = Treasure.addTreasure(meta.treasures, t);
      meta.treasures = add.list;
      Meta.save(meta);
      if (add.ok) {
        const ri = add.item || t;
        const ti = Treasure.TIER[ri.tier] || Treasure.TIER[0];
        const label = `${ti.name}·${Treasure.SLOT_NAME[ri.slot]}`;
        if (add.merged) toast(`试炼合宝 · ${label}`, "gold");
        else toast(`试炼赐宝 · ${label}`, "gold");
        showBigBanner(add.merged ? "试炼合宝" : "试炼赐宝", label, "gold");
        if (ri.tier >= 3) G.goldFlash = Math.max(G.goldFlash || 0, 0.35);
        if (window.Analytics) Analytics.track("treasure_drop", { tier: ri.tier, slot: ri.slot, source: "trial", merged: !!add.merged });
      } else {
        toast("宝囊已满 · 请化去或合成", "red");
      }
    }
    feelKill(e);
    AudioSys.kill();
    return;
  }
  // v7.2 悬赏令 · 斩妖令计数
  if (G.bounty && G.bounty.id === "kill" && G.bounty.state === "active") bountyAdd(1);
  onKillCombo();
  if (byPlayer && window.Treasure && !e.isDummy) {
    const rate = e.boss ? 1 : e.elite ? 0.03 : Treasure.DROP_MOB;
    if (Math.random() < rate) {
      const t = e.boss
        ? Treasure.makeTreasure(Treasure.rollSlot(), Math.min(3, Treasure.rollTier(G.wave) + 1))
        : Treasure.rollMobDrop(G.wave);
      if (t) {
        const meta = Meta.load();
        const add = Treasure.addTreasure(meta.treasures, t);
        meta.treasures = add.list;
        Meta.save(meta);
        if (add.ok) {
          const ri = add.item || t;
          const ti = Treasure.TIER[ri.tier] || Treasure.TIER[0];
          const label = `${ti.name}·${Treasure.SLOT_NAME[ri.slot]}`;
          if (add.merged) toast(`宝物合成 · ${label}`, "gold");
          else toast(`拾得${ti.name}宝物 · ${Treasure.SLOT_NAME[ri.slot]}`, "cyan");
          if (ri.tier >= 3) G.goldFlash = Math.max(G.goldFlash || 0, 0.3);
          if (window.Analytics) Analytics.track("treasure_drop", { tier: ri.tier, slot: ri.slot, wave: G.wave, merged: !!add.merged });
        } else {
          toast("宝囊已满 · 请化去或合成", "red");
        }
      }
    }
  }
  if (byPlayer) {
    addUltCharge(e.boss ? "boss" : e.elite ? "elite" : e.horde ? "horde" : "mob");
  }
  // v7.0 B2 连锁击杀：尸体引爆，向最近敌人传导（尸潮/高连杀时概率更高）
  tryChainKill(e);
  // v7.3 变类卡「破军令」：斩精英/妖王原地爆一圈剑罡（层级越高圈越大越痛）
  if ((G._execLv || 0) > 0 && (e.elite || e.boss) && byPlayer) {
    const lv = G._execLv;
    addBlast(e.x, e.y, 90 + lv * 22, G.atk * (1.6 + lv * 0.7) * playerDamageMult(), 0.18, "#fca5a5", { kind: "chain" });
  }
  // v7.3 变类卡「霜痕遍地」：击杀有概率在尸体处留一片减速霜痕
  if ((G._zoneLv || 0) > 0 && byPlayer && Math.random() < 0.1 * G._zoneLv) {
    G.zones.push({ x: e.x, y: e.y, r: 78 + G._zoneLv * 8, life: 4, max: 4, kind: "slow", mul: 0.55 });
    burst(e.x, e.y, "#67e8f9", 8, 90, 2);
  }
  // v6.0 B 联动 · 悟道：击杀经验 +50%
  const synXpMul = synOn("syn_enlight") ? 1.5 : 1;
  const xp = Math.round(e.xp * G.xpMul * comboMul() * (G.nodeXpMul || 1) * synXpMul);
  // v6.0 B 联动 · 狂血：击杀后 2s 攻速 ×2
  if (synOn("syn_frenzy")) G._frenzyT = 2;
  gainXP(xp);
  if (G.lifesteal > 0) G.hp = Math.min(G.hpMax, G.hp + G.lifesteal);
  if (e.boss) {
    dropPickup(e.x, e.y, "boss");
    dropPickup(e.x + rand(-26, 26), e.y + rand(-26, 26), "relic");
    // 妖王陨落凝出「灵石精魄」——拾取后本命三系自选一系，是全流程最重的决策
    dropPickup(e.x + rand(-34, 34), e.y + rand(-34, 34), "essence");
    for (let i = 0; i < DROP_BOSS; i++) {
      dropPickup(e.x + rand(-46, 46), e.y + rand(-46, 46), "stone", { stone: randStone() });
    }
    // 妖王必出「派系包」—— 5 颗同派系，凑派系核心的关键一跳
    {
      const mySchools = [...new Set(stonesOf().map((s) => s.school))];
      const s = pick(mySchools);
      const arr = STONE_BY_SCHOOL[s];
      for (let i = 0; i < 5; i++) {
        dropPickup(e.x + rand(-50, 50), e.y + rand(-50, 50), "stone", { stone: pick(arr).key });
      }
      toast(`妖王赐福 · ${s}派系灵石 ×5`, "gold");
    }
  } else if (e.elite) {
    dropPickup(e.x, e.y, "elite");
    if (Math.random() < 0.12) dropPickup(e.x + rand(-20, 20), e.y + rand(-20, 20), "relic");
    if (Math.random() < DROP_ELITE) {
      dropPickup(e.x + rand(-26, 26), e.y + rand(-26, 26), "stone", { stone: randStone() });
    }
    // 派系包（5% 概率）：5 颗同派系
    if (Math.random() < SCH_PACK_DROP) {
      const mySchools = [...new Set(stonesOf().map((s) => s.school))];
      const s = pick(mySchools);
      const arr = STONE_BY_SCHOOL[s];
      for (let i = 0; i < 5; i++) {
        dropPickup(e.x + rand(-34, 34), e.y + rand(-34, 34), "stone", { stone: pick(arr).key });
      }
      toast(`派系包 · ${s}灵石 ×5`, "gold");
    }
    // v3.0 装备掉落
    if (Math.random() < DROP_EQ_ELITE_W) {
      const slots = ["weapon", "armor", "accessory"];
      const eq = makeEquip(pick(slots), tierUp("white", (G.altarBuffs || {}).dropUp || 0));
      dropPickup(e.x + rand(-30, 30), e.y + rand(-30, 30), "equip", { equip: eq });
    }
    if (Math.random() < DROP_EQ_ELITE_G) {
      const slots = ["weapon", "armor", "accessory"];
      const eq = makeEquip(pick(slots), tierUp("green", (G.altarBuffs || {}).dropUp || 0));
      dropPickup(e.x + rand(-30, 30), e.y + rand(-30, 30), "equip", { equip: eq });
    }
  } else {
    // v7.1：回血珠掉率 4% → 10%（新手需要「打一只有回报」，也缓解只掉不回的必死局）
    const dropMul = (G._waveMod && G._waveMod.dropMul) ? G._waveMod.dropMul : 1;
    if (Math.random() < 0.10 * Math.min(1.5, dropMul)) dropPickup(e.x, e.y, "orb");
    if (Math.random() < DROP_MOB * dropMul) dropPickup(e.x, e.y, "stone", { stone: randStone() });
    // v3.0 小妖掉装备
    if (Math.random() < DROP_EQ_MOB) {
      const slots = ["weapon", "armor", "accessory"];
      const eq = makeEquip(pick(slots), tierUp("white", (G.altarBuffs || {}).dropUp || 0));
      dropPickup(e.x + rand(-20, 20), e.y + rand(-20, 20), "equip", { equip: eq });
    }
  }
  // 妖王装备（独立分支确保必出）
  if (e.boss) {
    const wN = randInt(DROP_EQ_BOSS_W_MIN, DROP_EQ_BOSS_W_MAX);
    for (let i = 0; i < wN; i++) {
      const slots = ["weapon", "armor", "accessory"];
      const eq = makeEquip(pick(slots), tierUp("white", (G.altarBuffs || {}).dropUp || 0));
      dropPickup(e.x + rand(-60, 60), e.y + rand(-60, 60), "equip", { equip: eq });
    }
    if (Math.random() < DROP_EQ_BOSS_G) {
      const n = randInt(1, 2);
      for (let i = 0; i < n; i++) {
        const slots = ["weapon", "armor", "accessory"];
        const eq = makeEquip(pick(slots), tierUp("green", (G.altarBuffs || {}).dropUp || 0));
        dropPickup(e.x + rand(-60, 60), e.y + rand(-60, 60), "equip", { equip: eq });
      }
    }
    if (Math.random() < DROP_EQ_BOSS_B) {
      const slots = ["weapon", "armor", "accessory"];
      const eq = makeEquip(pick(slots), tierUp("blue", (G.altarBuffs || {}).dropUp || 0));
      dropPickup(e.x + rand(-60, 60), e.y + rand(-60, 60), "equip", { equip: eq });
    }
    if (Math.random() < DROP_EQ_BOSS_O) {
      const slots = ["weapon", "armor", "accessory"];
      const eq = makeEquip(pick(slots), tierUp("orange", (G.altarBuffs || {}).dropUp || 0));
      dropPickup(e.x + rand(-60, 60), e.y + rand(-60, 60), "equip", { equip: eq });
      toast(`妖王赐 · 橙·${ITEM_TYPES[eq.typeKey].name}`, "orange");
    }
    // v5.0 PM 视角：妖王必掉 1 件本派系紫装（按玩家最大持派系绑定词条）
    const mySchools = [...new Set(stonesOf().map((s) => s.school))];
    const sortedSchools = mySchools.slice().sort((a, b) => countSchool(b) - countSchool(a));
    const targetSchool = sortedSchools[0] || mySchools[0];
    if (targetSchool) {
      const affixKey = (AFFIX_KEYS.find((k) => AFFIX_POOL[k].school === targetSchool && AFFIX_POOL[k].type === "派系")) || null;
      const lockedAff = affixKey ? [affixKey] : [];
      // v7.3：优先补该派系还空着的槽位。
      // 「3 件同派系觉醒」此前在真实一局里几乎凑不出来——紫装槽位纯随机，4 个妖王也未必凑齐三席，
      // 于是觉醒 / 法门 / 合击整条 build 线是空的。让妖王掉装去补缺口，集齐一套才成为可达目标。
      const hasSchool = (eq) => (eq && (eq.affixes || []).some((a) => AFFIX_POOL[a] && AFFIX_POOL[a].school === targetSchool));
      const ownedSlots = new Set(Object.values(G.equipped).filter((eq) => hasSchool(eq)).map((eq) => eq.slot));
      const missing = ["weapon", "armor", "accessory"].filter((s) => !ownedSlots.has(s));
      const slot = missing.length ? pick(missing) : pick(["weapon", "armor", "accessory"]);
      const purpleEq = makeEquip(slot, "purple", { fixedAffixes: lockedAff });
      dropPickup(e.x + rand(-66, 66), e.y + rand(-66, 66), "equip", { equip: purpleEq });
      toast(ownedSlots.size >= 2 && missing.length
        ? `妖王赐·本派紫装 · ${targetSchool}派（补齐${SLOT_DEFS[slot].name}席）`
        : `妖王赐·本派紫装 · ${targetSchool}派`, "violet");
      // 第二件给「次强派系」：一局只有 4 个妖王，单靠 1 件/次根本凑不出双修流的两把 Lv2 武器，
      // 双兵合击因此从未在真实一局里出现过。补一件次派紫装，让「专精 vs 双修」成为真选择。
      const secondary = sortedSchools[1];
      if (secondary && secondary !== targetSchool) {
        const aff2 = (AFFIX_KEYS.find((k) => AFFIX_POOL[k].school === secondary && AFFIX_POOL[k].type === "派系")) || null;
        const hasS2 = (eq) => (eq && (eq.affixes || []).some((a) => AFFIX_POOL[a] && AFFIX_POOL[a].school === secondary));
        const owned2 = new Set(Object.values(G.equipped).filter((eq) => hasS2(eq)).map((eq) => eq.slot));
        const missing2 = ["weapon", "armor", "accessory"].filter((s) => !owned2.has(s));
        const slot2 = missing2.length ? pick(missing2) : pick(["weapon", "armor", "accessory"]);
        const eq2 = makeEquip(slot2, "purple", { fixedAffixes: aff2 ? [aff2] : [] });
        dropPickup(e.x + rand(-70, 70), e.y + rand(-70, 70), "equip", { equip: eq2 });
        toast(`妖王赐·副修紫装 · ${secondary}派（${SLOT_DEFS[slot2].name}）`, "violet");
      }
    }
  }
  // 雷音铃：击杀概率落雷（限深度，避免连锁递归）
  if (G.thunderProc > 0 && (G._thunderChain || 0) < 3 && Math.random() < G.thunderProc) {
    const tgt = nearestEnemy(e.x, e.y, 260);
    if (tgt) {
      G.particles.push({
        x: tgt.x, y: tgt.y, vx: 0, vy: 0, life: 0.24, max: 0.24,
        color: "#c084fc", size: 5, ring: { r0: 4, r1: 40 },
      });
      burst(tgt.x, tgt.y, "#c084fc", 8, 180, 3);
      G._thunderChain = (G._thunderChain || 0) + 1;
      applyHit(tgt, G.atk * 1.6 * playerDamageMult());
      G._thunderChain = (G._thunderChain || 0) - 1;
    }
  }
  const visBurst = (ENEMY_TYPES[e.type] && ENEMY_TYPES[e.type].vis && ENEMY_TYPES[e.type].vis.burst) || e.color;
  burst(e.x, e.y, visBurst, e.boss ? 28 : e.elite ? 16 : 8, e.boss ? 220 : 130, e.boss ? 5 : 3);
  if (e.elite || e.boss) {
    G.particles.push({
      x: e.x, y: e.y, vx: 0, vy: 0,
      life: e.boss ? 0.45 : 0.3, max: e.boss ? 0.45 : 0.3,
      color: e.boss ? "#fbbf24" : "#c084fc",
      size: 4, ring: { r0: e.r, r1: e.r + (e.boss ? 70 : 40) },
    });
    if (e.elite) {
      // 金边碎光
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        feelPart({
          x: e.x, y: e.y, vx: Math.cos(a) * 65, vy: Math.sin(a) * 65,
          life: 0.25, max: 0.25, color: "#fde68a", size: 1.6,
        });
      }
    }
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
  // v7.2 打击感：小怪击杀也必须有爆破（冲击环 + 血雾 + 微屏震）
  feelKill(e);
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
  // v7.8.7 冥蝶裂变（仅一处）：死亡 35% 甩出 2 只冥粉
  if (e.type === "moth" && !e.horde && Math.random() < 0.35 && G.enemies.filter((x) => !x.dead).length < 80) {
    for (let i = 0; i < 2; i++) {
      const ang = rand(0, TAU);
      spawnEnemy("dustling", e.x + Math.cos(ang) * 8, e.y + Math.sin(ang) * 8, G.wave);
    }
    spawnFloater(e.x, e.y - 16, "冥粉飞散", "#d8b4fe", 11);
  }
  // v6.0 A 词缀 · 分裂：裂成 2 只小妖（与幽魂自带分裂叠加，但各自只裂一次）
  if (e.mods && e.mods.indexOf("split") >= 0 && G.enemies.filter((x) => !x.dead).length < 85) {
    for (let i = 0; i < 2; i++) {
      const ang = rand(0, TAU);
      const child = spawnEnemy("fox", e.x + Math.cos(ang) * 14, e.y + Math.sin(ang) * 14, Math.max(0, G.wave - 1));
      child.r = e.r * 0.6;
      child.hp = child.hpMax = e.hpMax * 0.3;
      child.xp = Math.round(e.xp * 0.25);
      child.mods = [];
    }
    burst(e.x, e.y, "#a3e635", 14, 170, 3);
  }
  // v6.0 A 词缀 · 自爆：死亡炸一圈，玩家在范围内要吃伤害
  if (e.mods && e.mods.indexOf("bomb") >= 0) {
    const R = 90 + e.r;
    G.particles.push({
      x: e.x, y: e.y, vx: 0, vy: 0, life: 0.4, max: 0.4,
      color: "#fb923c", size: 5, ring: { r0: e.r, r1: R },
    });
    burst(e.x, e.y, "#fb923c", 20, 220, 4);
    if (dist(e.x, e.y, G.px, G.py) < R) {
      damagePlayer(e.atk * 2.2);
      G.shake = Math.max(G.shake, 8);
    }
    for (const o of G.enemies) {
      if (o === e || o.dead) continue;
      if (dist(o.x, o.y, e.x, e.y) < R) { o.hp -= e.atk * 1.2; if (o.hp <= 0) killEnemy(o); }
    }
  }
  // v6.0 A 词缀 · 冰霜：死亡留下减速力场（8s）
  if (e.mods && e.mods.indexOf("frost") >= 0) {
    G.zones.push({ x: e.x, y: e.y, r: 100, life: 8, max: 8, kind: "slow", mul: 0.45 });
    burst(e.x, e.y, "#67e8f9", 16, 140, 3);
  }
}

// v4.0 纯打装流：升级不再弹窗，纯被动数值成长 —— 技能全部由装备决定
// v7.1 再平衡：v7.0 把怪量抬到 1.35w 却没同步抬玩家成长，实测站桩 50s 必死。
//   玩家每级 ×1.075（原 1.05），怪量系数 1.35 → 0.95（峰值交给尸潮，不靠常规波堆量）
const LV_HP_MUL = 1.09;       // 每升 1 级 HP ×1.09
const LV_ATK_MUL = 1.075;     // 每升 1 级 ATK ×1.075
const LV_SHIELD_MUL = 1.10;   // 每升 1 级 护盾上限 ×1.10
function gainXP(amount) {
  G.xp += amount;
  while (G.xp >= G.xpNeed) {
    G.xp -= G.xpNeed;
    G.level += 1;
    G.xpNeed = Math.floor(20 * Math.pow(1.18, G.level - 1));
    // v7.1：升级不再只是数字变大 —— 每次升级弹一次「悟道突破」三选一（见 openLevelUp）
    G.pendingLevel = (G.pendingLevel || 0) + 1;
    // 被动成长：直接在已叠加的 atk/hpMax/shieldMax 上乘倍率
    G.hpMax *= LV_HP_MUL;
    G.atk *= LV_ATK_MUL;
    G.shieldMax *= LV_SHIELD_MUL;
    const hpDelta = G.hpMax * (1 - 1 / LV_HP_MUL);
    const atkDelta = G.atk * (1 - 1 / LV_ATK_MUL);
    G.hp = Math.min(G.hpMax, G.hp + hpDelta);
    G.shield = Math.min(G.shieldMax, G.shield + G.shieldMax * (1 - 1 / LV_SHIELD_MUL));
    if ((G.level % 3) === 0) {
      burst(G.px, G.py, "#fde68a", 14, 150, 3);
      spawnFloater(G.px, G.py - 28, `Lv.${G.level} · 气血攻道皆涨`, "#fde68a", 13);
      AudioSys.level();
    } else if (G.level >= 2) {
      spawnFloater(G.px, G.py - 24, `Lv.${G.level} · +${Math.round(hpDelta)}HP +${Math.round(atkDelta)}攻`, "#fde68a", 10);
    }
  }
}

function dropPickup(x, y, kind, data) {
  const big = kind === "boss" || kind === "relic" || kind === "essence";
  const p = {
    x, y, kind,
    r: big ? 14 : kind === "stone" ? 9 : 10,
    life: kind === "stone" ? 26 : 20,
    bob: rand(0, TAU),
  };
  if (data) Object.assign(p, data);
  G.pickups.push(p);
}

function collectPickup(p) {
  if (p.kind === "orb") {
    G.hp = Math.min(G.hpMax, G.hp + 12);
    G.mp = Math.min(G.mpMax, G.mp + 12);
    spawnFloater(p.x, p.y, "灵息", "#5ce1e6", 12);
    AudioSys.hit();
  } else if (p.kind === "stone") {
    const st = STONE_BY_KEY[p.stone] || stonesOf()[0];
    G.stones[st.key] = stoneAt(st.key) + 1;
    spawnFloater(p.x, p.y - 6, `${st.name} +1`, st.color, 11);
    burst(p.x, p.y, st.color, 5, 90, 2);
    stoneHudSync();
    forgeHintCheck();
    // v7.3 P0：首次拿到灵石时教一次「点灵石条可设本命」——否则槽位等于不存在
    if (!G._stoneHinted) {
      G._stoneHinted = true;
      toast("点顶部灵石条 · 设为本命灵石（该系词条 ×1.30）", "gold");
    }
    // v4.0 派系核心自动解锁：5 颗同派系 ⇒ 自动 unlock
    autoUnlockCoreCheck(st.school);
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
  } else if (p.kind === "relic") {
    // v4.0 砍弹窗：法宝匣直接随机挑 1 件并入列（不再 3 选 1）
    if (G.relics.length >= MAX_RELICS) {
      G.hp = Math.min(G.hpMax, G.hp + G.hpMax * 0.15);
      G.shield += 30;
      toast("法宝已满 · 匣中灵力化为护盾与气血", "cyan");
    } else {
      const owned = new Set(G.relics.map((r) => r.id));
      const pool = ARTIFACTS.filter((a) => !owned.has(a.id));
      const a = pool[Math.floor(Math.random() * pool.length)] || ARTIFACTS[0];
      if (a) {
        G.relics.push(a);
        a.apply();
        try { Meta.recordArtifact(a.id); } catch (_) {}
        relicHudSync();
        toast(`法宝匣赐 · ${a.name}`, "gold");
        burst(p.x, p.y, a.color, 26, 220, 5);
        AudioSys.level();
      }
    }
  } else if (p.kind === "essence") {
    // v4.0 砍弹窗：灵魄自动选玩家持有最多的派系，整派系 +3 颗
    const mySchools = [...new Set(stonesOf().map((s) => s.school))];
    if (mySchools.length === 0) {
      toast("灵石精魄散尽 · 无派系可取", "cyan");
      burst(p.x, p.y, "#5ce1e6", 16, 180, 3);
    } else {
      // 找持有最多的派系
      const counts = mySchools.map((s) => ({ s, n: countSchool(s) }));
      counts.sort((a, b) => b.n - a.n);
      const sch = counts[0].s;
      const arr = STONE_BY_SCHOOL[sch] || [];
      for (const st of arr) G.stones[st.key] = stoneAt(st.key) + ESSENCE_GAIN;
      toast(`灵魄入体 · ${sch}派 +${ESSENCE_GAIN}`, "gold");
      burst(p.x, p.y, arr[0] && arr[0].color, 26, 210, 4);
      stoneHudSync(); forgeBtnSync(); forgeHintCheck();
      schoolHintCheck(sch);
      AudioSys.level();
    }
  } else if (p.kind === "equip") {
    pickUpEquip(p.equip);
    AudioSys.hit();
  } else if (p.kind === "boss") {
    // v4.0 砍弹窗：妖王不再触发升级弹窗，纯恢复+奖励
    G.hp = G.hpMax; G.mp = G.mpMax; G.shield += 30; G.atk *= 1.1;
    G.xpMul *= 1.05;
    toast("斩灭大妖 · 气血回满，攻击大涨，经验+5%");
    burst(p.x, p.y, "#fbbf24", 30, 220, 5);
    AudioSys.level();
  }
}

// 流派宝石的「特殊攻击效果」——通用装备永远给不了这些
function gemOnHit(e, d) {
  const fx = G.gemFx;
  if (!fx || e.dead) return;
  // 焚天流：必附灼烧 / 概率灼烧
  if (fx.burn || (fx.burnChance && Math.random() < fx.burnChance)) {
    e.burn = Math.max(e.burn || 0, 2.2);
    e.burnDmg = Math.max(e.burnDmg || 0, d * 0.35);
  }
  // 玄冰流：必附寒毒减速；精英另有几率冰封
  if (fx.chill) {
    e.slow = Math.max(e.slow || 0, 1.5);
    e.slowMul = Math.min(e.slowMul || 1, 0.55);
    if ((e.elite || e.boss) && fx.freezeChance && Math.random() < fx.freezeChance) {
      e.slow = 1.6; e.slowMul = 0.12;
      spawnFloater(e.x, e.y - e.r, "冰封", "#93c5fd", 12);
    }
  }
  // 剑罡流：命中溅射剑气（限深度，避免递归）
  if (fx.cleave > 0 && (G._cleaveDepth || 0) < 1) {
    G._cleaveDepth = (G._cleaveDepth || 0) + 1;
    let n = 0;
    for (const e2 of G.enemies) {
      if (e2.dead || e2.id === e.id || n >= 2) continue;
      if (dist(e.x, e.y, e2.x, e2.y) < 96) {
        G.particles.push({
          x: e.x, y: e.y, vx: 0, vy: 0, life: 0.12, max: 0.12,
          color: "#fde68a", size: 2, line: { x: e2.x, y: e2.y },
        });
        applyHit(e2, d * fx.cleave);
        n++;
      }
    }
    G._cleaveDepth -= 1;
  }
}

// 血剑流：暴击时溅血爆裂（同样限深度）
function gemOnCrit(e, d) {
  const fx = G.gemFx;
  if (!fx || !fx.critBurst || (G._critBurstDepth || 0) > 0 || e.dead) return;
  G._critBurstDepth = 1;
  let n = 0;
  for (const e2 of G.enemies) {
    if (e2.dead || e2.id === e.id || n >= 3) continue;
    if (dist(e.x, e.y, e2.x, e2.y) < 74) {
      burst(e2.x, e2.y, "#f87171", 5, 110, 2);
      applyHit(e2, d * fx.critBurst);
      n++;
    }
  }
  G._critBurstDepth = 0;
}

function applyHit(e, dmg, opts = {}) {
  if (e.dead) return;
  let d = dmg * charVsEnemy(e);
  e.hitT = 0.08;
  // 五行相生相克：由已凝宝石的五行决定，通用装备不参与
  const rel = bestElemRelation(e.elem);
  if (rel.mul !== 1) d *= rel.mul;
  // v7.3 变类卡「五行通玄」：把克制关系这条线做得更值得投入
  if (rel.key === "beat" && (G._elemBeatAdd || 0) > 0) d *= (1 + G._elemBeatAdd);
  // 共鸣 · 道途共鸣：若宝石元素当前属于转职五行集，对该系所克的目标再叠 +25%
  if (G.resonance && G.resonance.daoTuElems && G.resonance.daoTuElems.length) {
    for (const ee of G.resonance.daoTuElems) {
      if (ELEM_OVERCOME[ee] === e.elem) { d *= 1.25; break; }
    }
  }
  // 共鸣 · 破壁者：敌人五行不在任何已凝宝石的「直接克制对」中时，稳步补 +15%
  if (G.resonance && G.resonance.pobi) {
    let beaten = false;
    if (G.resonance.poBiElems) for (const ee of G.resonance.poBiElems) {
      if (ELEM_OVERCOME[ee] === e.elem) { beaten = true; break; }
    }
    if (!beaten) d *= 1.15;
  }
  // 玄冰圆满：已受寒毒影响者额外受伤
  if (G.gemFx.deepFreeze && (e.slow || 0) > 0) d *= 1.25;
  // 霜晶核心：受冰封目标额外受 30% 伤害
  if (G.schoolFx.shuangjing && (e.frozen || 0) > 0) d *= 1.30;
  // 共鸣 · 跨阶归一：圆满特效（含溅射/暴击溅血/落雷引线等）整段再 ×1.5
  const kuaJieOn = !!(G.resonance && G.resonance.kuaJie);
  if (kuaJieOn) d *= 1.5;
  // v6.0 B 联动 · 熔炉：被减速的敌人受火伤 ×3（机制质变，不是加法）
  if (synOn("syn_forge") && (e.slow || 0) > 0) {
    d *= 3;
    spawnFloater(e.x, e.y - e.r - 26, "熔炉 ×3", "#fb923c", 12);
  }
  const isCrit = Math.random() < G.crit;
  if (isCrit) {
    d *= G.critMul;
    hitStop(45);
    AudioSys.crit();
  }
  // v6.0 A 词缀 · 护盾：伤害先打护盾，碎前不掉血
  if (e.ward > 0) {
    const abs = Math.min(e.ward, d);
    e.ward -= abs; d -= abs;
    if (e.ward <= 0) {
      e.ward = 0;
      burst(e.x, e.y, "#94a3b8", 16, 170, 3);
      spawnFloater(e.x, e.y - e.r - 22, "护盾碎", "#cbd5e1", 12);
    }
  }
  // v7.4 玄铁试炼桩：只统计打在桩身上的伤害（含灼烧 / 爆点 / 传导，口径统一）
  if (e.isDummy && G.trial && G.trial.active) G.trial.dealt += Math.max(0, d);
  e.hp -= d;
  // v7.2 打击感：命中就有数字（节流 + 同目标合并），普通命中不顿帧以免手感发粘
  feelHit(e, d, isCrit);
  // v6.0 A 词缀 · 荆棘：玩家打它会被反弹
  if (e.mods && e.mods.indexOf("thorns") >= 0 && d > 0) damagePlayer(d * 0.18);
  e.flash = Math.max(e.flash || 0, 0.1);
  if (opts.burn) { e.burn = opts.burn; e.burnDmg = opts.burnDmg; }
  if (opts.slow) { e.slow = opts.slow; e.slowMul = opts.slowMul || 0.55; }
  gemOnHit(e, d);                    // 流派宝石的特殊攻击效果
  // 派系核心 onHit：朱雀灼烧扩散、绝对零度冻结等
  for (const c of coresEquipped()) {
    if (c.onHit) c.onHit(e, d);
  }
  if (isCrit) gemOnCrit(e, d);       // 血剑流：暴击溅血爆裂
  // v6.0 B 联动 · 血怒：暴击溅射周围 4 敌 50% 伤害
  if (isCrit && synOn("syn_bloodrage")) {
    let n = 0;
    for (const o of G.enemies) {
      if (o === e || o.dead || n >= 4) continue;
      if (dist(o.x, o.y, e.x, e.y) < 150) {
        o.hp -= d * 0.5;
        spawnFloater(o.x, o.y - o.r, String(Math.round(d * 0.5)), "#f87171", 10);
        if (o.hp <= 0) killEnemy(o);
        n++;
      }
    }
    if (n > 0) burst(e.x, e.y, "#f87171", 12, 180, 3);
  }
  // v6.0 B 联动 · 雷暴：暴击引雷 3 个目标
  if (isCrit && synOn("syn_storm")) {
    let n = 0;
    for (const o of G.enemies) {
      if (o === e || o.dead || n >= 3) continue;
      if (dist(o.x, o.y, e.x, e.y) < 230) {
        o.hp -= d * 0.8;
        G.particles.push({
          x: e.x, y: e.y, vx: 0, vy: 0, life: 0.22, max: 0.22, color: "#818cf8", size: 3,
          line: { x2: o.x, y2: o.y },
        });
        spawnFloater(o.x, o.y - o.r - 12, "雷", "#818cf8", 12);
        if (o.hp <= 0) killEnemy(o);
        n++;
      }
    }
    if (n > 0) AudioSys.skill();
  }
  if (kuaJieOn) spawnFloater(e.x, e.y - e.r - 12, "跨阶 ×1.5", "#a78bfa", 12);
  // size by damage magnitude
  const mag = Math.min(1, Math.log10(1 + d) / 3.2);
  const size = isCrit ? 14 + mag * 8 : 11 + mag * 5;
  const showTag = !!rel.tag && (rel.mul > 1 || Math.random() < 0.3);
  let col = isCrit ? "#fbbf24" : "#e8e6d9";
  if (showTag && rel.color) col = rel.color;
  spawnFloater(e.x, e.y - e.r, `${showTag ? rel.tag + " " : ""}${Math.round(d)}`, col, size, isCrit);
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
  G.anim = G.anim || { movePhase: 0, atkT: 0, dashT: 0 };
  G.anim.atkT = Math.max(G.anim.atkT || 0, 0.12);
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
    G.anim = G.anim || { movePhase: 0, atkT: 0, dashT: 0 };
    G.anim.atkT = 0.12;
    G.slash = { x: G.px, y: G.py, ang: face, range, half, life: 0.32, max: 0.32, color: "#c4f1ff" };
    // 起手风压环
    G.particles.push({
      x: G.px, y: G.py, vx: 0, vy: 0, life: 0.2, max: 0.2,
      color: "#a5f3fc", size: 4, ring: { r0: 20, r1: 70 },
    });
    for (let i = 0; i < 8; i++) {
      const a = face - half + (half * 2 * (i + 0.5)) / 8;
      const x0 = G.px + Math.cos(a) * 28, y0 = G.py + Math.sin(a) * 28;
      feelPart({
        x: x0, y: y0, vx: Math.cos(a) * 50, vy: Math.sin(a) * 50,
        life: 0.16, max: 0.16, color: "#bae6fd", size: 2,
        line: { x: x0 + Math.cos(a) * 24, y: y0 + Math.sin(a) * 24 },
      });
    }
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
    G.anim = G.anim || { movePhase: 0, atkT: 0, dashT: 0 };
    G.anim.dashT = 0.25;
    // v7.0 C 瞬步：无敌帧从 0.4s 拉到 0.6s，让「冲进去」成为可用战术而不是送死
    G.dashIFrame = G.dashTime + 0.25 + (G._blinkIFrameAdd || 0);   // v7.1 瞬步诀可再延长
    G._blinkT = 0;
    spawnAfterimage();
    spawnFloater(G.px, G.py - G.pr - 14, "瞬步", "#5ce1e6", 12);
    G.particles.push({
      x: G.px, y: G.py, vx: 0, vy: 0, life: 0.18, max: 0.18,
      color: "#5ce1e6", size: 3, ring: { r0: 10, r1: 46 },
    });
    if (G.gemFx.dashHaste) { G.hasteT = 3; spawnFloater(G.px, G.py - G.pr - 12, "御风 · 攻速涨", "#86efac", 12); }
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
    w.fire.timer -= dt * (1 + w.fire.lv * 0.15) * atkSpeedNow() * 0.5;
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
    w.frost.timer -= dt * (0.7 + w.frost.lv * 0.1) * atkSpeedNow() * 0.4;
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
    w.lightning.timer -= dt * (0.55 + w.lightning.lv * 0.1) * atkSpeedNow() * 0.35;
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

function buildHudSync() {
  try {
    const el = document.getElementById("buildHud");
    if (!el) return;
    const cnt = {};
    for (const slot in G.equipped) {
      const eq = G.equipped[slot];
      if (!eq) continue;
      const seen = new Set();
      for (const ax of (eq.affixes || [])) {
        const def = AFFIX_POOL[ax];
        if (!def || !def.school) continue;
        const wk = SCHOOL_WEAPON_MAP[def.school];
        if (!wk || seen.has(wk)) continue;
        seen.add(wk);
        cnt[wk] = (cnt[wk] || 0) + 1;
      }
    }
    const names = { fire: "赤锋·业火", frost: "霜晶·寒冰", lightning: "雷灵·紫电", array: "玄铁·剑阵" };
    for (const k in cnt) {
      if (cnt[k] > bestN) { bestN = cnt[k]; bestName = names[k] || k; }
    }
    if (G._stoneSlot && G._stoneSlot.school) {
      const wk = SCHOOL_WEAPON_MAP[G._stoneSlot.school];
      if (wk) {
        cnt[wk] = (cnt[wk] || 0) + 1;
        if (cnt[wk] > bestN) { bestN = cnt[wk]; bestName = names[wk] || wk; }
      }
    }
    const el2 = document.getElementById("buildHudText");
    if (el2) el2.textContent = `${bestName} ${Math.min(bestN, 5)}/5`;
    el.classList.toggle("hidden", G.state !== "play");
  } catch (_) {}
}

// ================= P0-B 波次变体 =================
const WAVE_MODS = [
  { id: "tide", name: "妖潮涌", desc: "妖潮密度提升", hpMul: 1, spdMul: 1, dropMul: 1, spawnMul: 1.35 },
  { id: "iron", name: "妖甲", desc: "小妖身披铁甲 · 更肉", hpMul: 1.25, spdMul: 1, dropMul: 1, spawnMul: 1 },
  { id: "swift", name: "疾风", desc: "妖物疾行", hpMul: 1, spdMul: 1.2, dropMul: 1, spawnMul: 1 },
  { id: "hoard", name: "宝箱雨", desc: "灵物掉率提升", hpMul: 1, spdMul: 1, dropMul: 1.5, spawnMul: 1 },
];
function waveModFor(wave) {
  if (!wave || wave < 5 || wave % 5 !== 0) return G._waveMod || null;
  return WAVE_MODS[Math.floor(wave / 5 - 1) % WAVE_MODS.length];
}
function enterWaveMod(wave) {
  if (!wave || wave < 5 || wave % 5 !== 0) return;
  const m = WAVE_MODS[Math.floor(wave / 5 - 1) % WAVE_MODS.length];
  if (!m || (G._waveMod && G._waveMod.id === m.id && G._waveModWave === wave)) return;
  G._waveMod = m;
  G._waveModWave = wave;
  showBigBanner("天时有变", `${m.name} · ${m.desc}`, "violet");
  toast(`波次变体 · ${m.name}`, "violet");
  if (window.Analytics) Analytics.track("wave_mod", { id: m.id, wave });
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
// ---- 方环试炼（square_loop）接线：纯逻辑在 window.SquareLoop，这里只做 UI/步进/结算 ----
let _modePick = null;
function selectedModeId() {
  if (_modePick) return _modePick;
  try {
    const lm = Meta.load().lastMode;
    return lm === "square_loop" ? "square_loop" : "endless";
  } catch (_) {
    return "endless";
  }
}
function syncModeCards() {
  const id = selectedModeId();
  const cards = document.querySelectorAll(".mode-card");
  for (const c of cards) c.classList.toggle("on", c.dataset.mode === id);
}
function setModePick(id) {
  _modePick = id === "square_loop" ? "square_loop" : "endless";
  try {
    const m = Meta.load();
    m.lastMode = _modePick;
    Meta.save(m);
  } catch (_) {}
  syncModeCards();
}

// 方环美术：位图失败回退几何
const SquareArt = {
  img: {},
  load() {
    const map = {
      eternaut: "assets/eternaut_idle.png",
      eternaut_crack: "assets/eternaut_crack1.png",
      eternaut_shatter: "assets/eternaut_shatter.png",
      stance_wind: "assets/stance_wind.png",
      stance_rain: "assets/stance_rain.png",
      stance_thunder: "assets/stance_thunder.png",
      stance_bolt: "assets/stance_bolt.png",
      enemy_fox: "assets/enemy_fox.png",
      enemy_wolf: "assets/enemy_wolf.png",
      enemy_golem: "assets/enemy_golem.png",
      boss_yaowang: "assets/boss_yaowang.png",
      challenge_yaojiang: "assets/challenge_yaojiang.png",
      toad: "assets/neutral_toad.png",
      wood: "assets/neutral_wood.png",
      box: "assets/neutral_box.png",
    };
    for (const k in map) {
      try {
        const im = new Image();
        im.src = map[k];
        this.img[k] = im;
      } catch (_) {}
    }
  },
  ok(id) {
    const im = this.img[id];
    return !!(im && im.complete && im.naturalWidth > 0);
  },
  draw(id, x, y, size) {
    const im = this.img[id];
    if (!im || !im.complete || im.naturalWidth <= 0) return false;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(size) || size <= 0) return false;
    try {
      ctx.save();
      ctx.drawImage(im, x - size / 2, y - size / 2, size, size);
      ctx.restore();
      return true;
    } catch (_) {
      try { ctx.restore(); } catch (_) {}
      return false;
    }
  },
};
try { SquareArt.load(); } catch (_) {}

const SQ_STANCE_UI = [
  { id: "wind", el: () => ui.stanceWind },
  { id: "rain", el: () => ui.stanceRain },
  { id: "thunder", el: () => ui.stanceThunder },
  { id: "bolt", el: () => ui.stanceBolt },
];

function squarePillars(st) {
  // 攻击区域四角站桩（风西北/雨东北/雷东南/电西南）
  return window.SquareLoop.pillarSpots(st);
}

function startSquareLoopRun(charId) {
  const SL = window.SquareLoop;
  if (!SL) {
    G.modeId = "endless";
    toast("方环模块未加载 · 已回退无尽", "red");
    return;
  }
  G.modeId = "square_loop";
  G.moveSpeed = 0;
  G.px = 0; G.py = 0;
  G.kbX = 0; G.kbY = 0;
  const fitSide = Math.max(240, Math.min(420, Math.floor(Math.min(view.w, view.h) * 0.72)));
  G.square = SL.makeState({ cx: 0, cy: 0, side: fitSide, atk: G.atk });
  G.square.spawnQueue = SL.buildQueue(Math.max(1, G.wave || 1));
  G.square.queueTotal = G.square.spawnQueue.length;
  G.square.atk = G.atk;
  G._sqAtkT = 0;
  G._sqPeak = 0;
  G._sqSettled = false;
  G._sqHitT = 0;
  if (ui.joyZone) ui.joyZone.classList.add("hidden");
  if (ui.joystick) ui.joystick.classList.add("hidden");
  if (ui.squareHud) ui.squareHud.classList.remove("hidden");
  if (ui.goalBar) ui.goalBar.classList.add("hidden");
  syncSquareStanceHud();
  updateSquareHud();
  toast(`${CHARS[charId]?.name || "修士"} · 方环试炼 · 点柱切换风雨雷电`);
  try {
    if (window.Analytics) Analytics.track("run_start", { mode: "square_loop", char_id: charId });
    if (window.Analytics) Analytics.track("square_loop", { phase: "start", char_id: charId });
  } catch (_) {}
}

function syncSquareStanceHud() {
  const st = G.square;
  if (!st) return;
  for (const s of SQ_STANCE_UI) {
    const el = s.el();
    if (el) el.classList.toggle("active", st.stance === s.id);
  }
  const sp = window.SquareLoop.stanceById(st.stance);
  if (ui.squareUltName && sp) ui.squareUltName.textContent = sp.ultName;
}

function setSquareStance(id) {
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL || st.over) return false;
  if (!SL.setStance(st, id)) return false;
  syncSquareStanceHud();
  const sp = SL.stanceById(id);
  try {
    const el = document.querySelector(`.stance-btn[data-stance="${id}"]`);
    if (el) { el.classList.remove("pillar-hit"); void el.offsetWidth; el.classList.add("pillar-hit"); }
  } catch (_) {}
  if (window.Analytics) Analytics.track("square_loop", { phase: "stance", stance: id });
  if (sp) toast(sp.name, "cyan");
  return true;
}

function updateSquareHud() {
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL) return;
  const p = SL.pressureCount(st);
  G._sqPeak = Math.max(G._sqPeak || 0, p);
  const max = SL.PRESSURE_FAIL;
  if (ui.pressureBar) ui.pressureBar.style.width = `${clamp((p / max) * 100, 0, 100)}%`;
  if (ui.pressureText) ui.pressureText.textContent = `妖压 ${p}/${max}`;
  const wrap = ui.pressureBar && ui.pressureBar.parentElement;
  if (wrap) {
    wrap.classList.toggle("warn1", p >= SL.PRESSURE_WARN1 && p < SL.PRESSURE_WARN2);
    wrap.classList.toggle("warn2", p >= SL.PRESSURE_WARN2);
  }
  const charge = Math.floor(st.ultCharge || 0);
  if (ui.squareUltPct) ui.squareUltPct.textContent = `${charge}%`;
  if (ui.btnSquareUlt) {
    ui.btnSquareUlt.disabled = charge < 60;
    ui.btnSquareUlt.classList.toggle("ready", charge >= 100);
  }
  syncSquareStanceHud();
}

function updateSquareLoop(dt) {
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL) return;
  if (G._sqHitT > 0) G._sqHitT = Math.max(0, G._sqHitT - dt);

  // 自动普攻节拍（踩风柱加速）
  st.stanceMul = G._stanceMul || st.stanceMul;
  const aspd = (SL.atkSpeedMul && SL.atkSpeedMul(st)) || 1;
  const atkEvery = 0.55 / aspd;
  G._sqAtkT = (G._sqAtkT || 0) + dt;
  while (G._sqAtkT >= atkEvery && !st.over) {
    G._sqAtkT -= atkEvery;
    const killsBefore = st.kills;
    try { SL.autoAttack(st); } catch (_) {}
    if (st.kills > killsBefore) {
      for (let i = 0; i < st.kills - killsBefore; i++) SL.addUltCharge(st, "kill");
    }
  }

  const events = SL.tick(st, dt, { onKillCharge: false }) || [];
  try { SL.tryAutoUlt(st, dt); } catch (_) {}
  if (st.pendingPick) { openSquarePick(); return; }
  if (st.pendingChallenge) { openSquareChallenge(); return; }

  if (events.indexOf("win") >= 0 || st.win || st.fail || st.over) {
    endSquareLoop();
    return;
  }
  updateSquareHud();
}

function grantSquareNeutralReward(reward) {
  if (!reward) return;
  if (reward.type === "xp") {
    try { gainXP(30 + Math.floor((G.square && G.square.time) || 0)); } catch (_) {}
    toast("木精化悟性 · 破壳得道", "cyan");
  } else if (reward.type === "treasure") {
    try {
      if (window.Treasure) {
        const meta = Meta.load();
        const t = Treasure.trialReward(meta.treasures);
        const add = Treasure.addTreasure(meta.treasures, t);
        meta.treasures = add.list;
        Meta.save(meta);
        if (add.ok) {
          const ri = add.item || t;
          const ti = Treasure.TIER[ri.tier] || Treasure.TIER[0];
          const label = `${ti.name}·${Treasure.SLOT_NAME[ri.slot]}`;
          toast(`玄匣开启 · ${label}`, "gold");
          showBigBanner("玄匣开启", label, "gold");
          if (window.Analytics) Analytics.track("treasure_drop", { tier: ri.tier, slot: ri.slot, source: "square_box", merged: !!add.merged });
        } else {
          toast("宝囊已满 · 请化去或合成", "red");
        }
      }
    } catch (_) {}
  } else if (reward.type === "coins" && reward.coins) {
    toast(`金蟾吐灵 +${reward.coins}`, "gold");
  }
}

function handleSquarePointer(e) {
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL || st.over || G.state !== "play") return;
  const rect = canvas.getBoundingClientRect();
  const sx = (e.clientX - rect.left);
  const sy = (e.clientY - rect.top);
  const wx = sx + G.px - view.w / 2;
  const wy = sy + G.py - view.h / 2;

  // 中立优先
  for (const n of st.neutrals) {
    if (!n || !n.alive) continue;
    if (dist(wx, wy, n.x, n.y) <= 36) {
      const res = SL.tapNeutral(st, n.id);
      G._sqHitT = 0.2;
      try { burst(n.x, n.y, "#f0c14b", 8, 120, 3); } catch (_) {}
      if (res && res.broke) {
        try { burst(n.x, n.y, "#fde68a", 18, 220, 5); } catch (_) {}
        grantSquareNeutralReward(res.reward);
        if (window.Analytics) Analytics.track("square_loop", { phase: "neutral_break", type: n.type });
      }
      updateSquareHud();
      return;
    }
  }

  // 四元素柱（热区 ≥56px，攻击区域四角）
  const pillars = squarePillars(st);
  for (const p of pillars) {
    if (dist(wx, wy, p.x, p.y) <= 36) {
      setSquareStance(p.id);
      return;
    }
  }
}

function drawSquareLoop() {
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL) return;
  const w = view.w, h = view.h;
  try {
    // 方形妖流路径
    const pts = st.way.map((p) => w2s(p.x, p.y));
    ctx.save();
    ctx.strokeStyle = "rgba(92,225,230,0.28)";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = -G.time * 30;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < 4; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 玩家站在所选站桩上 · 当前姿态角色立绘
    const pxy = w2s(st.px != null ? st.px : st.cx, st.py != null ? st.py : st.cy);
    const ultReady = (st.ultCharge || 0) >= 100;
    const pCount = SL.pressureCount(st);
    const etKey = pCount >= 170 ? "eternaut_shatter" : pCount >= 120 ? "eternaut_crack" : "eternaut";
    const stanceKey = "stance_" + (st.stance || "wind");
    const c = pxy;
    try {
      const bob = Math.sin(G.time * 2.2) * 3;
      const drewStance = SquareArt.draw(stanceKey, c.x, c.y + bob, 72);
      if (!drewStance && !SquareArt.draw(etKey, c.x, c.y + bob, 64)) {
        ctx.save();
        ctx.fillStyle = "rgba(92,225,230,0.18)";
        ctx.strokeStyle = ultReady ? "#f0c14b" : "rgba(92,225,230,0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 28, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#a5f3fc";
        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("法坛", c.x, c.y + 4);
        ctx.restore();
      }
    } catch (_) {}
    if (ultReady) {
      ctx.save();
      ctx.strokeStyle = "rgba(240,193,75,0.7)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#f0c14b";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 38 + Math.sin(G.time * 8) * 3, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    // 四元素柱（攻击区域四角 · 角色立绘）
    const pillars = squarePillars(st);
    for (const p of pillars) {
      const s = w2s(p.x, p.y);
      const on = st.stance === p.id;
      const lift = ultReady ? -6 : 0;
      ctx.save();
      ctx.translate(s.x, s.y + lift);
      ctx.strokeStyle = p.color;
      ctx.fillStyle = on ? p.color : "rgba(10,14,22,0.75)";
      ctx.globalAlpha = on ? 1 : 0.85;
      ctx.lineWidth = on ? 3 : 2;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = on ? 18 : 8;
      const pw = 36, ph = 56;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 8);
      else ctx.rect(-pw / 2, -ph / 2, pw, ph);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = on ? 1 : 0.88;
      const artOk = SquareArt.draw("stance_" + p.id, 0, -4, on ? 44 : 36);
      if (!artOk) {
        ctx.fillStyle = on ? "#070b12" : p.color;
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.id === "wind" ? "风" : p.id === "rain" ? "雨" : p.id === "thunder" ? "雷" : "电", 0, 0);
      }
      ctx.restore();
    }

    // 敌对（方环独有 · 立绘优先）
    for (const e of st.enemies) {
      if (!e || !e.alive || e.neutral) continue;
      const s = w2s(e.x, e.y);
      const r = e.kind === "elite" ? 16 : e.kind === "fast" ? 10 : 12;
      ctx.save();
      const col = e.kind === "elite" ? "#c084fc" : e.kind === "fast" ? "#fb923c" : e.kind === "horde" ? "#86efac" : "#f87171";
      ctx.globalAlpha = e.stunT > 0 ? 0.55 : 1;
      const eKey = e.kind === "challenger" ? "challenge_yaojiang" : e.kind === "boss" ? "boss_yaowang" : e.kind === "elite" ? "boss_yaowang" : e.kind === "fast" ? "enemy_wolf" : e.kind === "horde" ? "enemy_golem" : "enemy_fox";
      const artE = SquareArt.draw(eKey, s.x, s.y, r * (e.kind === "elite" ? 3.2 : 2.4));
      if (!artE) {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, TAU);
        ctx.fill();
      }
      if (e.slowT > 0) {
        ctx.strokeStyle = "#67e8f9";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, r + 3, 0, TAU);
        ctx.stroke();
      }
      // 血条
      if (e.hp < e.hpMax) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(s.x - r, s.y - r - 8, r * 2, 3);
        ctx.fillStyle = "#86efac";
        ctx.fillRect(s.x - r, s.y - r - 8, r * 2 * clamp(e.hp / e.hpMax, 0, 1), 3);
      }
      ctx.restore();
    }

    // 中立壳
    for (const n of st.neutrals) {
      if (!n || !n.alive) continue;
      const s = w2s(n.x, n.y);
      const frac = n.shellMax > 0 ? n.shell / n.shellMax : 1;
      let key = n.type;
      if (n.type === "box" || frac < 0.25) key = n.type; // 壳型仍用中立图
      let drew = false;
      try {
        if (n.type === "toad") drew = SquareArt.draw("toad", s.x, s.y, 44);
        else if (n.type === "wood") drew = SquareArt.draw("wood", s.x, s.y, 44);
        else drew = SquareArt.draw("box", s.x, s.y, 44);
      } catch (_) { drew = false; }
      if (!drew) {
        ctx.save();
        ctx.fillStyle = n.type === "toad" ? "#fbbf24" : n.type === "wood" ? "#86efac" : "#c084fc";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 18, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      // 中立壳用色环裂纹示意，不占用玄铁傀儡贴图
      if (frac < 0.75) {
        ctx.save();
        ctx.strokeStyle = frac <= 0.25 ? "rgba(244,63,94,0.85)" : "rgba(240,193,75,0.75)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 22, 0, TAU * clamp(1 - frac, 0.1, 1));
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(s.x - 20, s.y + 24, 40, 4);
      ctx.fillStyle = frac > 0.5 ? "#86efac" : frac > 0.25 ? "#fbbf24" : "#f43f5e";
      ctx.fillRect(s.x - 20, s.y + 24, 40 * clamp(frac, 0, 1), 4);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(n.type === "toad" ? "金蟾" : n.type === "wood" ? "木精" : "玄匣", s.x, s.y + 42);
      ctx.restore();
    }
  } catch (_) {
    try {
      ctx.setTransform(view.dpr || 1, 0, 0, view.dpr || 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    } catch (_) {}
    // 禁止 clearRect：保留上一帧
  }
}

function betterRank(a, b) {
  const o = { S: 4, A: 3, B: 2, C: 1 };
  return (o[b] || 0) > (o[a] || 0) ? b : (a || b || "C");
}

function openSquarePick() {
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL || !st.pendingPick || G._sqPickOpen) return;
  G._sqPickOpen = true;
  const picks = SL.rollPicks();
  const box = document.getElementById("squarePick");
  const list = document.getElementById("squarePickList");
  if (!box || !list) {
    if (picks[0]) SL.applyPick(st, picks[0].id);
    G._sqPickOpen = false;
    return;
  }
  list.innerHTML = "";
  picks.forEach((p) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pick-card";
    b.innerHTML = "<b>" + p.name + "</b><span>" + p.desc + "</span>";
    b.addEventListener("click", () => {
      SL.applyPick(st, p.id);
      G._sqPickOpen = false;
      box.classList.add("hidden");
      toast("习得 · " + p.name, "gold");
    });
    list.appendChild(b);
  });
  box.classList.remove("hidden");
}

function openSquareChallenge() {
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL || !st.pendingChallenge || G._sqChalOpen) return;
  G._sqChalOpen = true;
  const box = document.getElementById("squareChallenge");
  const tEl = document.getElementById("challengeT");
  const go = document.getElementById("btnChallengeGo");
  const skip = document.getElementById("btnChallengeSkip");
  if (!box || !go) {
    SL.acceptChallenge(st);
    G._sqChalOpen = false;
    return;
  }
  if (tEl) tEl.textContent = String(Math.max(0, Math.ceil(st.challengeT || 10)));
  const close = () => {
    G._sqChalOpen = false;
    box.classList.add("hidden");
    go.onclick = null;
    if (skip) skip.onclick = null;
  };
  go.onclick = () => {
    SL.acceptChallenge(st);
    close();
    toast("挑战妖将现身 · 战！", "gold");
  };
  if (skip) {
    skip.onclick = () => {
      SL.declineChallenge(st);
      close();
      toast("挑战未竟 · 可再战", "cyan");
    };
  }
  box.classList.remove("hidden");
}

function endSquareLoop() {
  if (G._sqSettled) return;
  G._sqSettled = true;
  const st = G.square;
  const SL = window.SquareLoop;
  if (!st || !SL) return;
  st.over = true;
  const result = SL.settle(st);
  result.pressurePeak = Math.max(result.pressurePeak || 0, G._sqPeak || 0);
  const coins = Math.max(0, Math.floor(result.coins || 0));
  G.coinsRun = coins;

  // 结算：只加不减；胜利赐宝，失败可 rollMobDrop 不倒扣
  try {
    const meta = Meta.load();
    meta.coins = (meta.coins || 0) + coins;
    meta.squareLoop = meta.squareLoop || { bestClearSec: 0, pressurePeak: 0, bestClears: 0 };
    meta.squareLoop.pressurePeak = Math.max(meta.squareLoop.pressurePeak || 0, result.pressurePeak || 0);
    if (result.win) {
      meta.squareLoop.bestClears = (meta.squareLoop.bestClears || 0) + 1;
      const cs = result.clearSec || st.time || 0;
      const prev = meta.squareLoop.bestClearSec || 0;
      meta.squareLoop.bestClearSec = prev > 0 ? Math.min(prev, cs) : cs;
      meta.squareLoop.bestRank = betterRank(meta.squareLoop.bestRank, result.rank);
      setTimeout(() => showBigBanner("测定 " + result.rank, "方环清场", "gold"), 280);
    }
    if (result.win && window.Treasure) {
      const t = Treasure.trialReward(meta.treasures);
      const add = Treasure.addTreasure(meta.treasures, t);
      meta.treasures = add.list;
      if (add.ok) {
        const ri = add.item || t;
        const ti = Treasure.TIER[ri.tier] || Treasure.TIER[0];
        setTimeout(() => {
          toast(`试炼赐宝 · ${ti.name}·${Treasure.SLOT_NAME[ri.slot]}`, "gold");
          showBigBanner("方环通关", `${ti.name}·${Treasure.SLOT_NAME[ri.slot]}`, "gold");
        }, 200);
        if (window.Analytics) Analytics.track("treasure_drop", { tier: ri.tier, slot: ri.slot, source: "square_win", merged: !!add.merged });
      }
    } else if (!result.win && window.Treasure) {
      const t = Treasure.rollMobDrop(Math.max(1, G.wave || 1));
      if (t) {
        const add = Treasure.addTreasure(meta.treasures, t);
        meta.treasures = add.list;
        if (add.ok) {
          const ri = add.item || t;
          const ti = Treasure.TIER[ri.tier] || Treasure.TIER[0];
          setTimeout(() => toast(`战利 · ${ti.name}·${Treasure.SLOT_NAME[ri.slot]}`, "cyan"), 200);
        }
      }
    }
    Meta.save(meta);
    G._metaCoinsCached = meta.coins;
  } catch (_) {}

  // 日课：square_loop 胜利计入（wave≥5 语义；不改 daily.js）
  try {
    if (window.Daily && Daily.applyRunResult) {
      const dailyRes = Daily.applyRunResult(Meta.load(), {
        win: !!result.win,
        mode: "square_loop",
        wave: result.win ? 5 : 0,
        comboPeak: 0,
        weaponKinds: 1,
      });
      Meta.save(dailyRes.meta);
      if (dailyRes.grants && dailyRes.grants.length) {
        for (const g of dailyRes.grants) {
          toast(g.msg, "gold");
          if (window.Analytics) Analytics.track("daily_complete", { id: g.id, coins: g.coins });
        }
        G._metaCoinsCached = dailyRes.meta.coins;
      }
    }
  } catch (_) {}

  try {
    if (window.Weekly) {
      const wr = Weekly.applyRun(Meta.load(), { wave: result.win ? 5 : 0, kills: result.kills, comboPeak: 0 });
      Meta.save(wr.meta);
      if (wr.newly) {
        const wch = (Weekly.CHALLENGES || []).find((c) => c.id === wr.challengeId);
        toast(`本周挑战达成 · ${wch ? wch.name : wr.challengeId}`, "gold");
      }
    }
  } catch (_) {}

  try {
    if (window.Analytics) {
      Analytics.track("square_loop", {
        phase: "settle",
        win: !!result.win,
        fail: !!result.fail,
        kills: result.kills,
        seconds: Math.round(result.time || 0),
        coins,
        pressure_peak: result.pressurePeak || 0,
        stance: st.stance,
      });
    }
  } catch (_) {}

  G.state = "over";
  releaseJoystick();
  releaseWakeLock();
  if (ui.joyZone) ui.joyZone.classList.add("hidden");
  if (ui.squareHud) ui.squareHud.classList.add("hidden");
  ui.hud.classList.add("hidden");
  ui.levelModal.classList.add("hidden");
  ui.comboBadge.classList.add("hidden");

  ui.overWave.textContent = result.win ? "通关" : "未竟";
  ui.overKills.textContent = result.kills;
  ui.overTime.textContent = formatTime(result.time || 0);
  ui.overCombo.textContent = G._sqPeak || 0;
  ui.overLevel.textContent = G.level;
  ui.overCoins.textContent = "+" + coins;
  ui.overTitle.textContent = result.win ? "方环试炼 · 清净" : "方环试炼 · 妖压崩盘";
  ui.overMsg.textContent = result.win
    ? `妖流全灭 · 用时 ${formatTime(result.time || 0)} · 妖压峰值 ${result.pressurePeak || 0}。灵石+${coins}，已入帐。`
    : `敌对持续 ≥188 超 2 秒判负 · 妖压峰值 ${result.pressurePeak || 0} · 斩 ${result.kills}。不扣灵石，可再战。`;
  ui.overScreen.classList.remove("hidden");
  setMenuBg(true);
  refreshShellUI();
}

function startRun(charId) {
  AudioSys.init();
  const id = charId || Meta.load().selectedChar || "sword";
  const m = Meta.load();
  m.selectedChar = id;
  G.modeId = selectedModeId() === "square_loop" ? "square_loop" : "endless";
  m.lastMode = G.modeId;
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
  relicHudSync();
  beastHudSync();
  stoneHudSync();
  forgeBtnSync();
  resHudSync();
  if (G.modeId === "square_loop") {
    startSquareLoopRun(id);
    return;
  }
  // 回到无尽：恢复摇杆层
  if (ui.joyZone) ui.joyZone.classList.remove("hidden");
  if (ui.joystick) ui.joystick.classList.remove("hidden");
  if (ui.squareHud) ui.squareHud.classList.add("hidden");
  toast(`${CHARS[id]?.name || "修士"} · 御剑清妖`);
  try {
    if (window.Analytics) Analytics.track("run_start", { mode: "endless", char_id: id });
  } catch (_) {}
  clearTimeout(startRun._hint);
  startRun._hint = setTimeout(() => {
    if (G.state === "play") toast("站上剑阵 · 充能阵成 · 离阵余威尚存", "cyan");
  }, 2200);
  clearTimeout(startRun._hint2);
  startRun._hint2 = setTimeout(() => {
    if (G.state === "play") toast("斩妖落灵石 · 攒本命一系可凝宝石", "gold");
  }, 5200);
  // v5.0 教程：保持 v7.7 行为 —— 每局都会引导；tutorialDone 只写档供分析
  G.tutStep = 1;
  if (ui.tutOverlay) ui.tutOverlay.classList.remove("showed");
  // v5.0 目标进度条
  if (ui.goalBar) ui.goalBar.classList.remove("hidden");
}

// v5.0 PM 视角：教程"知道了"按钮
if (ui.tutNext) {
  ui.tutNext.addEventListener("click", () => advanceTutorial());
}
// v7.1：点教程卡任意处即可关掉（新手第一反应是点屏幕，不是找按钮）
if (ui.tutOverlay) {
  ui.tutOverlay.addEventListener("click", (e) => {
    if (e && e.target && e.target === ui.tutNext) return;
    G.tutStep = 0; hideTutorial();
  });
}

function endRun() {
  if (G.state === "over") return;
  // v7.5：死在试炼里也要收场 —— 否则试炼计时器会挂到下一局，进新局第一帧就弹评定卡
  if (G.trial && G.trial.active) endTrial(false, "力竭");
  hideTrialCard();
  G.state = "over";
  releaseJoystick();
  releaseWakeLock();
  const base = G.wave * 3 + G.kills * 0.4 + G.comboPeak * 1.5;
  const coins = Math.max(0, Math.floor(base * (1 + (G._shopCoin || 0))));
  const prevBest = best.bestWave;
  const best = Meta.endRun(G.wave, G.kills, G.time, G.comboPeak, coins);
  G.coinsRun = coins;
  G._metaCoinsCached = best.coins;

  // Sprint B 壳：日课结算 + 埋点
  try {
    if (window.Daily && Daily.applyRunResult) {
      let weaponKinds = 0;
      try { weaponKinds = Daily.countWeaponKinds(G.weapons); } catch (_) { weaponKinds = 0; }
      const dailyRes = Daily.applyRunResult(Meta.load(), {
        win: false,
        mode: "endless",
        wave: G.wave,
        comboPeak: G.comboPeak,
        weaponKinds,
      });
      Meta.save(dailyRes.meta);
      if (dailyRes.grants && dailyRes.grants.length) {
        for (const g of dailyRes.grants) {
          toast(g.msg, "gold");
          if (window.Analytics) Analytics.track("daily_complete", { id: g.id, coins: g.coins });
        }
        G._metaCoinsCached = dailyRes.meta.coins;
      }
    }
  } catch (_) {}
  try {
    if (window.Analytics) {
      Analytics.track("run_end", {
        mode: "endless",
        wave: G.wave,
        kills: G.kills,
        seconds: Math.round(G.time),
        combo_peak: G.comboPeak,
        coins,
        death_cause: "over",
      });
    }
  } catch (_) {}

  // M-R 本周挑战
  try {
    if (window.Weekly) {
      const wr = Weekly.applyRun(Meta.load(), { wave: G.wave, kills: G.kills, comboPeak: G.comboPeak });
      Meta.save(wr.meta);
      if (wr.newly) {
        const wch = (window.Weekly && Weekly.CHALLENGES || []).find((c) => c.id === wr.challengeId);
        toast(`本周挑战达成 · ${wch ? wch.name : wr.challengeId} · 可领取`, "gold");
        if (window.Analytics) Analytics.track("weekly_progress", { id: wr.challengeId, progress: wr.progress });
      }
    }
  } catch (_) {}

  // M-Biz：结算激励位状态（翻倍按钮）
  try {
    const adDouble = document.getElementById("btnAdDouble");
    if (adDouble && window.Ads) {
      const meta = Meta.load();
      const premium = Ads.isPremium(meta);
      const left = Ads.remainingToday("settle_double", meta);
      const usedThisRun = !!G._adDoubleUsed;
      adDouble.disabled = premium || usedThisRun || left <= 0 || coins <= 0;
      adDouble.dataset.runCoins = String(coins);
      const span = adDouble.querySelector("span") || adDouble;
      if (premium) span.textContent = "已去广告";
      else if (usedThisRun) span.textContent = "本局已翻倍";
      else if (left <= 0) span.textContent = "今日翻倍已用完";
      else if (coins <= 0) span.textContent = "无灵石可翻倍";
      else span.textContent = `灵石×2 · 演示广告（今日${left}次）`;
    }
  } catch (_) {}

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
  ui.overMsg.textContent = (() => {
    const causeMap = { swarm: "妖潮围杀", slam: "大妖砸击", shock: "精英震地", unknown: "力竭" };
    const cause = causeMap[G.deathCause] || causeMap.unknown;
    const oldBest = Number.isFinite(prevBest) ? prevBest : best.bestWave;
    const vs = G.wave >= oldBest
      ? `刷新波次纪录${oldBest > 0 ? `（原 ${oldBest}）` : ""}`
      : `距纪录 ${Math.max(0, oldBest - G.wave)} 波`;
    return `第 ${G.wave} 波 · 死于${cause}。${vs}，灵石可强化后再战。`;
  })();
  ui.overScreen.classList.remove("hidden");
  setMenuBg(true);
  refreshShellUI();
}

function formatTime(s) {
  s = Math.floor(s);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
}

// v5.0 PM 视角：大字报系统（屏幕中央上半 · 持续 2.4s）
function showBigBanner(sub, text, mode) {
  if (!ui.bigBanner) return;
  ui.bigBannerSub.textContent = sub;
  ui.bigBannerText.textContent = text;
  ui.bigBanner.classList.remove("hidden", "s-purple", "s-orange", "s-job");
  if (mode === "purple") ui.bigBanner.classList.add("s-purple");
  else if (mode === "orange") ui.bigBanner.classList.add("s-orange");
  else if (mode === "job") ui.bigBanner.classList.add("s-job");
  // 强制重启动画
  ui.bigBanner.style.animation = "none"; void ui.bigBanner.offsetWidth; ui.bigBanner.style.animation = "";
  G._bigBannerT = 2.4;
  G._bigBannerMode = mode;
}

// v5.0 PM 视角：新手教程
const TUT_STEPS = [
  // 0=关闭；1..3 可见
  null,
  {
    title: "第一步 · 斩妖取灵石",
    body: "拖动屏幕移动角色，飞剑会自己砍最近的妖怪。\n妖怪死亡后会掉落「灵石」，碰到自动拾取。\n攒 5 颗同派系灵石 = 解锁派系核心。",
    tip: "走到灵石边上即可拾取",
    advance: () => G.stones && stoneTotal() >= 1,
  },
  {
    title: "第二步 · 背包与合成",
    body: "妖怪还会掉落「装备」——白/绿/蓝/紫/橙 5 阶。\n背包里 2 件同槽位同阶且至少 1 词条重叠 ⇒ 自动合成高一阶。\n紫装才能装备，橙装是终极追求。",
    tip: "打开背包看看现在有什么",
    advance: () => G.inventory && G.inventory.length >= 1,
  },
  {
    title: "第三步 · 穿上紫装变强",
    body: "回到背包，点紫色装备，再点武器/防具/饰品槽即可装备。\n3 件同派系紫装自动转职为对应道途，并解锁终极技能。",
    tip: "第 5 波会有妖王，赐你一件本派系紫装",
    advance: () => {
      for (const slot in G.equipped) {
        if (slot === "stone") continue;
        if (G.equipped[slot]) return true;
      }
      return false;
    },
  },
];
function showTutorial(step) {
  if (!ui.tutOverlay || step < 1 || step > TUT_STEPS.length - 1) return;
  const s = TUT_STEPS[step];
  ui.tutStepNum.textContent = step;
  ui.tutStepTotal.textContent = TUT_STEPS.length - 1;
  ui.tutTitle.textContent = s.title;
  ui.tutBody.innerHTML = s.body.replace(/\n/g, "<br>");
  ui.tutTip.textContent = s.tip;
  ui.tutOverlay.classList.remove("hidden");
}
function hideTutorial() {
  if (!ui.tutOverlay) return;
  ui.tutOverlay.classList.add("hidden");
  // tutorialDone 仅作分析/未来开关，不抑制 v7.7 每局教程
  try { if (Meta && Meta.setTutorialDone) Meta.setTutorialDone(); } catch (_) {}
  try { if (window.Analytics) Analytics.track("tutorial_done", { step: G.tutStep || 0, kind: "v7" }); } catch (_) {}
}
function advanceTutorial() {
  if (!G.tutStep) return;
  try { if (window.Analytics) Analytics.track("tutorial_step", { step: G.tutStep }); } catch (_) {}
  if (G.tutStep >= TUT_STEPS.length - 1) { G.tutStep = 0; hideTutorial(); return; }
  G.tutStep += 1;
  showTutorial(G.tutStep);
}
// 每帧 tick：教程自动完成 + 大字报淡出 + 橙装慢镜
function tickTutorial(dt) {
  // 大字报
  if (G._bigBannerT > 0) {
    G._bigBannerT -= dt;
    if (G._bigBannerT <= 0 && ui.bigBanner) ui.bigBanner.classList.add("hidden");
  }
  // v7.5 攻击能力评定卡：7 秒自动收起（不拦截操作，玩家不用点）
  if (G._trialCardT > 0) {
    G._trialCardT -= dt;
    if (G._trialCardT <= 0) hideTrialCard();
  }
  // v7.6 裂痕高亮衰减（绘制层读它决定裂纹亮度）
  if (G._trialCrackT > 0) G._trialCrackT = Math.max(0, G._trialCrackT - dt);
  updateAutoNotes(dt);                 // v7.6 悟道便签生命周期
  // 橙装慢镜
  if (G._orangeT > 0) {
    G._orangeT -= dt;
    if (G._orangeT > 0) {
      if (!document.body.classList.contains("orange-pause")) document.body.classList.add("orange-pause");
    } else {
      document.body.classList.remove("orange-pause");
    }
  }
  // 教程自动完成检测（玩家已达成 step 条件 ⇒ 自动跳下一步）
  if (G.tutStep > 0 && G.tutStep < TUT_STEPS.length) {
    const s = TUT_STEPS[G.tutStep];
    if (s && s.advance && s.advance()) advanceTutorial();
  }
  // 教程 step1 启动（v7.1：18s 后再弹 —— 开局先让玩家割爽，别一上来先读说明书。
  //   实测 v7.0 开局教程遮挡 8.9s，而玩家 9s 就阵亡：整局都在看字，没在玩）
  if (G.tutStep === 1 && G.time > 18 && !ui.tutOverlay.classList.contains("showed")) {
    showTutorial(1);
    ui.tutOverlay.classList.add("showed");
    G._tutT = 0;
  }
  // 教程最长 9 秒自动收起：读不完也不打断战斗（advance 条件没达成时不许一直挡着）
  if (G.tutStep > 0 && ui.tutOverlay && !ui.tutOverlay.classList.contains("hidden")) {
    G._tutT = (G._tutT || 0) + dt;
    if (G._tutT > 9) { G.tutStep = 0; hideTutorial(); }
  }
}

// v5.0 PM 视角：HUD 顶部目标进度条
function updateGoalBar() {
  if (!ui.goalBar) return;
  ui.goalBar.classList.remove("hidden");
  // v7.2 悬赏令优先：有限时挑战时，目标条让位给短期目标（玩家此刻真正在追的东西）
  const bt = G.bounty;
  if (bt && bt.state) {
    const bd = BOUNTY_BY_ID[bt.id] || BOUNTY_DEFS[0];
    const gotV = bt.id === "nohurt" ? Math.min(bt.need, bt.got) : bt.got;
    const pct = bt.need > 0 ? (gotV / bt.need) * 100 : 0;
    const lbl = bt.state === "done" ? `悬赏达成 · ${bd.name}`
      : bt.state === "fail" ? `悬赏失败 · ${bd.name}`
      : `悬赏 · ${bd.name} · ${bd.verb}`;
    const det = bt.state === "active"
      ? `${bt.id === "nohurt" ? gotV.toFixed(1) : Math.round(gotV)}/${bt.need}${bd.unit} · 剩 ${Math.max(0, bt.left).toFixed(1)}s`
      : `${bt.id === "nohurt" ? gotV.toFixed(1) : Math.round(gotV)}/${bt.need}${bd.unit}`;
    ui.goalIco.textContent = "赏";
    ui.goalText.textContent = lbl;
    ui.goalDetail.textContent = det;
    ui.goalFill.style.width = Math.min(100, Math.max(0, pct)) + "%";
    ui.goalFill.classList.toggle("complete", bt.state === "done");
    ui.goalBar.classList.toggle("bounty", bt.state === "active");
    return;
  }
  ui.goalBar.classList.remove("bounty");
  const w = G.wave || 0;
  // 优先级目标：当前阶段缺什么
  // 1) 紫装 < 3 件 ⇒ 凑齐紫装
  // 2) Boss 未击 ⇒ 等本波 Boss（wave%5==0 ⇒ 下波前）
  // 3) 派系核心 < 2 个 ⇒ 凑核心
  // 4) 装备搭配派系纯度 < 95% ⇒ 凑同派系
  const purpleCount = G.inventory.filter((e) => e.tier === "purple").length + Object.values(G.equipped).filter(Boolean).filter((e) => e.tier === "purple").length;
  const nextBossWave = Math.floor(w / 5) * 5 + (w % 5 === 0 ? 5 : 5);
  const hasBossSoon = (w % 5 >= 3);
  let label, detail, fill;
  if (purpleCount < 1) {
    label = "目标 · 获得首件紫装";
    detail = `${purpleCount}/1 紫装`;
    fill = (purpleCount / 1) * 100;
  } else if (purpleCount < 3 && hasBossSoon) {
    label = `目标 · 第 ${nextBossWave} 波妖王赐紫`;
    detail = `${purpleCount}/3 紫装`;
    fill = (purpleCount / 3) * 100;
  } else if (purpleCount < 3) {
    label = "目标 · 凑齐 3 件紫装转职";
    detail = `${purpleCount}/3 紫装`;
    fill = (purpleCount / 3) * 100;
  } else if ((G.cores || []).length < 2 && Object.keys(G.schoolUnlocked || {}).length < 2) {
    label = "目标 · 觉醒派系核心";
    const nCores = Object.keys(G.schoolUnlocked || {}).length;
    detail = `${nCores}/2 核心`;
    fill = (nCores / 2) * 100;
  } else {
    label = "目标 · 派系纯度 100%";
    detail = `纯度 ${Math.round(G._purity * 100)}%`;
    fill = (G._purity * 100);
  }
  ui.goalIco.textContent = "目";
  ui.goalText.textContent = label;
  ui.goalDetail.textContent = detail;
  ui.goalFill.style.width = Math.min(100, Math.max(0, fill)) + "%";
  ui.goalFill.classList.toggle("complete", fill >= 100);
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
  if (G.state === "menu" || G.state === "over" || G.state === "shop" || G.state === "pause" || G.state === "codex") return;
  if (G.state === "level" || G.state === "job" || G.state === "forge") return;
  if (G.state === "altar") { updateHUD(); return; }
  // 方环试炼：独立步进，不进无尽波次/摇杆/飞剑
  if (G.modeId === "square_loop" && G.square) {
    updateSquareLoop(dt);
    return;
  }
  tickActs();
  tickUlt(dt);
  if (G.anim) {
    if (G.anim.atkT > 0) G.anim.atkT = Math.max(0, G.anim.atkT - dt);
    if (G.anim.dashT > 0) G.anim.dashT = Math.max(0, G.anim.dashT - dt);
  }
  // v7.5：前 10 波自动悟道（不弹卡、不停帧），第 11 波起才弹三选一交给玩家决策
  if ((G.pendingLevel || 0) > 0 && G.state === "play") {
    if (autoUpgradePhase()) flushAutoUpgrades();
    else {
      openLevelUp();
      if (G.state === "level") return;         // 弹窗拉起来了：世界暂停，等玩家点
      // v7.5.1 防挂起：弹窗没拉起来（卡池被抽空 / DOM 缺失）时，update 会每帧在这里 return，
      //   世界永久静止 —— 玩家除了杀进程没有任何出路。这里兜底改成自动放发，宁可少一次抉择。
      flushAutoUpgrades();
      if ((G.pendingLevel || 0) > 0) G.pendingLevel = 0;
    }
  }

  // hit-stop
  if (G.hitStop > 0) {
    G.hitStop -= dt;
    updateHUD();
    return;
  }

  G.time += dt;
  // v7.4 兜底：坐标一旦变成 NaN，整屏都会画不出来（玩家看到的就是黑屏 / 花屏 / 截断）。
  //   没人能说清它会在哪一帧发生，所以这里钉一道保险：发现就拉回原点。
  if (!Number.isFinite(G.px) || !Number.isFinite(G.py)) { G.px = 0; G.py = 0; }
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
  // v5.0 PM 视角：教程 + 大字报 + 橙装慢镜 + 目标进度条
  tickTutorial(dt);
  tickBounty(dt);        // v7.2 悬赏令倒计时
  updateGoalBar();
  // v4.0 装备主动技能 CD tick
  for (let i = 0; i < (G.skillCD || []).length; i++) {
    if (G.skillCD[i] > 0) G.skillCD[i] = Math.max(0, G.skillCD[i] - dt);
  }
  // v4.0 装备主动技能持续时长 tick（如剑气护体 +6s）
  // v6.0 B 联动 · 狂血：CD tick
  G._frenzyT = Math.max(0, (G._frenzyT || 0) - dt);
  G._comboBurstT = Math.max(0, (G._comboBurstT || 0) - dt);   // v7.2 剑意爆发 CD
  G._hurtCD = Math.max(0, (G._hurtCD || 0) - dt);   // v7.1 受击间隔
  G._swordArrayT = Math.max(0, (G._swordArrayT || 0) - dt);
  G._shadowT = Math.max(0, (G._shadowT || 0) - dt);
  // v7.0 三大系统 tick：合击 / 爆点 / 尸潮 / 瞬步残影 / 濒死狂血
  updateFusions(dt);
  updateBlasts(dt);
  updateHorde(dt);
  updateAfterimages(dt);
  updateFrenzy(dt);
  if (G.dashTimer > 0) {                       // 瞬步沿途留剑影
    G._blinkT = (G._blinkT || 0) - dt;
    if (G._blinkT <= 0) { G._blinkT = 0.07; spawnAfterimage(); }
  }
  // v4.0 装备被动技能 tick（按 G.passiveSkills 列表）
  for (const id of (G.passiveSkills || [])) {
    if (id === "sk_hp_regen") {
      G._hpRegenT = (G._hpRegenT || 0) + dt;
      if (G._hpRegenT >= 5) {
        G._hpRegenT -= 5;
        if (G.hp < G.hpMax) { G.hp = Math.min(G.hpMax, G.hp + 12); spawnFloater(G.px, G.py - G.pr - 14, "+12", "#86efac", 10); }
      }
    }
  }
  G.mp = Math.min(G.mpMax, G.mp + G.mpRegen * dt);
  // 流派宝石：气血滋长 / 护盾再生 / 御风提速 / 龙血定期回复
  G.hasteT = Math.max(0, G.hasteT - dt);
  if (G.gemFx.regen) G.hp = Math.min(G.hpMax, G.hp + G.gemFx.regen * dt);
  if (G.gemFx.shieldRegen && G.shieldMax > 0) {
    G.shield = Math.min(G.shieldMax, G.shield + G.gemFx.shieldRegen * dt);
  }
  if (G.gemFx.regenPct) {
    G.regenT += dt;
    if (G.regenT >= 8) {
      G.regenT -= 8;
      const heal = G.hpMax * G.gemFx.regenPct;
      G.hp = Math.min(G.hpMax, G.hp + heal);
      spawnFloater(G.px, G.py - G.pr - 10, `+${Math.round(heal)}`, "#86efac", 12);
      burst(G.px, G.py, "#86efac", 10, 120, 3);
    }
  }

  // 派系核心 tick（每帧调用所有装备的核心）
  for (const c of coresEquipped()) {
    if (c.tick) c.tick(dt);
  }

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
  let speed = G.moveSpeed * (G.nodeMoveMul || 1) * (G.dashTimer > 0 ? G.dashSpeedMul : 1) * (G.altarBuffs.moveMul || 1);
  // v6.0 A 词缀 · 冰霜：站在减速力场里移速大减，逼你绕开
  for (const z of G.zones) {
    if (z.kind === "slow" && dist(z.x, z.y, G.px, G.py) < z.r) { speed *= z.mul; break; }
  }
  G.px += mv.x * speed * dt + (G.kbX || 0) * dt;
  G.py += mv.y * speed * dt + (G.kbY || 0) * dt;
  if (!Number.isFinite(G.px) || !Number.isFinite(G.py)) { G.px = 0; G.py = 0; G.kbX = 0; G.kbY = 0; }
  if (!Number.isFinite(G.kbX)) G.kbX = 0;
  if (!Number.isFinite(G.kbY)) G.kbY = 0;
  if (G.kbX) G.kbX *= Math.pow(0.001, dt);
  if (G.kbY) G.kbY *= Math.pow(0.001, dt);
  const dFromOrigin = Math.hypot(G.px, G.py);
  if (Number.isFinite(dFromOrigin) && dFromOrigin > G.arenaR) {
    const s = G.arenaR / dFromOrigin;
    G.px *= s; G.py *= s;
  }

  updateNodes(dt);
  updateBeasts(dt);

  G.swordPhase += dt * (1.8 + atkSpeedNow() * 0.5);
  // v7.5.1：相位兜底 —— 非法就归零，过大就取模。
  //   飞剑相位是唯一会「越跑越大」的角度量，它一旦变成 Infinity，
  //   剑轨 arc 的起止角就是 Infinity ⇒ 那段路径被浏览器丢弃 ⇒ 玩家看到的就是花屏 + 截断。
  if (!Number.isFinite(G.swordPhase)) G.swordPhase = 0;
  else if (G.swordPhase > TAU * 1024) G.swordPhase -= TAU * 1024;
  const orbitCount = G.swordCount;
  const orbitDmg = G.atk * 0.62 * playerDamageMult() * (G.weapons.orbit.evo ? 1.5 : 1) * (1 + G.weapons.orbit.lv * 0.05);
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

  G.swordTimer -= dt * atkSpeedNow();
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
      e.burnDmgAcc = (e.burnDmgAcc || 0) + e.burnDmg * dt * (G.burnMul || 1);
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

    // v7.4 玄铁试炼桩：钉死在场上
    if (e.isDummy) {
      // flash/hitT/atkT 已在上文统一递减，这里只处理追猎
      if (e.isChaser) {
        const ca = angleTo(e.x, e.y, G.px, G.py);
        const cs = (e.speed || TRIAL_CHASE_SPEED) * (e.slowMul || 1);
        e.vx = Math.cos(ca) * cs;
        e.vy = Math.sin(ca) * cs;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
      }
      continue;
    }

    const ang = angleTo(e.x, e.y, G.px, G.py);
    let mx = Math.cos(ang), my = Math.sin(ang);
    if (e.hitT > 0) e.hitT = Math.max(0, e.hitT - dt);
    if (e.atkT > 0) e.atkT = Math.max(0, e.atkT - dt);
    // 接敌攻击预备：抬手拉伸
    if (dist(e.x, e.y, G.px, G.py) < e.r + G.pr + 10 && (e.atkT || 0) <= 0) {
      e.atkT = 0.2;
    }
    if (e.shape === "bat") {
      const swirl = Math.sin(G.time * 3 + e.phase) * 0.55;
      const px = -Math.sin(ang), py = Math.cos(ang);
      mx += px * swirl; my += py * swirl;
      const n = Math.hypot(mx, my) || 1; mx /= n; my /= n;
    }
    // v6.0 A 词缀 · 噬魂：贴近玩家就持续回血，得优先点掉
    if (e.mods && e.mods.indexOf("drain") >= 0) {
      e.drainT = (e.drainT || 0) + dt;
      if (e.drainT >= 0.6) {
        e.drainT = 0;
        if (dist(e.x, e.y, G.px, G.py) < 210 && e.hp < e.hpMax) {
          e.hp = Math.min(e.hpMax, e.hp + e.hpMax * 0.035);
          spawnFloater(e.x, e.y - e.r - 10, "噬", "#c084fc", 10);
        }
      }
    }
    const spd = e.speed * (e.slowMul || 1) * (G.altarBuffs.curseSpeed || 1);
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
          G._pendingCause = "slam";
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
    // P1-A 精英砸地前摇
    if (e.elite && !e.isDummy && (e.slamCD == null || e.slamCD <= 0) && dist(e.x, e.y, G.px, G.py) < 160) {
      e.slamCD = rand(5, 8);
      G.blasts = G.blasts || [];
      G.blasts.push({
        x: e.x, y: e.y, r: 70, dmg: e.atk * 1.2, t: 0.7, max: 0.7,
        color: "#f9a8d4", opts: { kind: "eliteSlam", src: e.id }, kind: "eliteSlam",
      });
    }
    if (e.elite && e.slamCD > 0) e.slamCD = Math.max(0, e.slamCD - dt);

    if (dist(e.x, e.y, G.px, G.py) < e.r + G.pr) {
      // 接触伤害 + 碰撞反馈（_colT 内只结算一次冲击）
      damagePlayer(e.atk * 0.28);
      G._pendingCause = "swarm";
      const firstHit = (e._colT || 0) <= 0;
      e._colT = 0.2;
      if (firstHit) {
        const ca = angleTo(e.x, e.y, G.px, G.py);
        const heavy = e.boss ? 1.6 : 1;
        if (!Number.isFinite(G.kbX)) G.kbX = 0;
        if (!Number.isFinite(G.kbY)) G.kbY = 0;
        G.kbX += Math.cos(ca) * 160 * heavy;
        G.kbY += Math.sin(ca) * 160 * heavy;
        e.x -= Math.cos(ca) * 18 * heavy;
        e.y -= Math.sin(ca) * 18 * heavy;
        G.particles.push({
          x: (e.x + G.px) / 2, y: (e.y + G.py) / 2,
          vx: 0, vy: 0, life: 0.18, max: 0.18,
          color: "#fff7ed", size: 3, ring: { r0: 4, r1: 22 },
        });
        hitStop(25);
        G.shake = Math.max(G.shake, 2);
      }
    }
  }
  G.enemies = G.enemies.filter((e) => !e.dead);
  softCollide();

  // v6.0 A 冰霜力场衰减 / v7.0 A 合击力场（冰封剑狱 · 冰火两仪）
  for (const z of G.zones) {
    z.life -= dt;
    if (z.kind !== "prison") continue;
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (dist(e.x, e.y, z.x, z.y) > z.r + e.r) continue;
      if ((e.slow || 0) < 0.7) { e.slow = 0.7; e.slowMul = z.mul || 0.35; }
      if (z.dps) {
        e.hp -= z.dps * dt;
        e.flash = Math.max(e.flash || 0, 0.06);
        if (e.hp <= 0) killEnemy(e);
      }
    }
  }
  G.zones = G.zones.filter((z) => z.life > 0);
  // v6.0 C 祭坛：走近自动触发
  updateAltars(dt);

  for (const p of G.pickups) {
    p.life -= dt;
    p.bob += dt * 3;
    const d = dist(p.x, p.y, G.px, G.py);
    const pullR = 100 + (G._altarPickup || 0);   // v6.0 C 祭坛「缚足」：拾取范围
    if (d < pullR) {
      const a = angleTo(p.x, p.y, G.px, G.py);
      const pull = lerp(120, 320, 1 - d / pullR);
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
  trimRenderBudget();     // v7.4：尸潮波把粒子顶到 1900+ 会掉帧糊屏，这里封顶

  for (const f of G.floaters) {
    f.life -= dt;
    f.y += f.vy * dt;
    f.vy *= 0.95;
  }
  G.floaters = G.floaters.filter((f) => f.life > 0);

  // v7.4 玄铁试炼桩：60 秒伤害测试倒计时（HUD 里实时显示已伤 / DPS / 剩余血量）
  updateTrial(dt);
  updateWaves(dt);
  updateHUD();
}

function updateHUD() {
  ui.hpFill.style.width = `${(G.hp / G.hpMax) * 100}%`;
  ui.hpText.textContent = `${Math.ceil(G.hp)}/${Math.ceil(G.hpMax)}`;
  ui.mpFill.style.width = `${(G.mp / G.mpMax) * 100}%`;
  ui.mpText.textContent = `${Math.floor(G.mp)}/${Math.ceil(G.mpMax)}`;
  ui.waveText.textContent = G.wave;
  if (ui.waveElem) {
    const we = ELEM_BY_KEY[waveElemKey()];
    const rel = bestElemRelation(we.key);
    ui.waveElem.textContent = we.name + (rel.mul > 1 ? "↑" : rel.mul < 1 ? "↓" : "");
    ui.waveElem.style.setProperty("--wc", we.color);
    ui.waveElem.classList.toggle("hot", rel.mul > 1);
    ui.waveElem.classList.toggle("cold", rel.mul < 1);
  }
  ui.killText.textContent = G.kills;
  const inTrial = !!(G.trial && G.trial.active);
  ui.timeText.textContent = formatTime(G.time) + (inTrial ? " · 试炼中" : (G.waveTimer > 0 ? ` · ${Math.ceil(G.waveTimer)}s` : ""));
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
  updateFusionHud();   // v7.0 A 合击蓄能条
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

// v7.4 渲染预算：粒子 / 飘字硬上限。
//   尸潮波实测同屏粒子冲到 1900+（tools/render-audit.js），每个还可能带一份径向渐变，
//   手机上就是掉帧 + 画面糊。视觉层必须自己封顶，不能把「怪多一点」变成「屏炸了」。
const RENDER_CAP = { particles: 420, floaters: 90 };
function trimRenderBudget() {
  // v7.7：上限按画质档位浮动 —— 低档机在试炼高潮/尸潮时最容易一次性堆出上千个粒子，
  //   那一瞬间的填充率尖峰就是真机「页面崩溃」的导火索。
  const cap = renderCapNow();
  const p = G.particles || [];
  if (p.length > cap.particles) p.splice(0, p.length - cap.particles);
  const f = G.floaters || [];
  if (f.length > cap.floaters) f.splice(0, f.length - cap.floaters);
}
function renderCapNow() {
  const l = Quality.level;
  if (l === "low") return { particles: 150, floaters: 40 };
  if (l === "mid") return { particles: 300, floaters: 65 };
  return RENDER_CAP;
}

function draw() {
  // 绘制异常只复位画笔状态，保留上一帧，避免「角色敌人突然消失」
  try {
    drawInner();
  } catch (err) {
    if (!draw._reported) {
      draw._reported = true;
      try { console.warn("[玄天劫] 绘制异常已兜住（保留画面）：", err); } catch (_) {}
    }
    try {
      ctx.setTransform(view.dpr || 1, 0, 0, view.dpr || 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
    } catch (_) {}
  }
}
function drawInner() {
  if (G._ctxLost) return;
  const w = view.w, h = view.h;
  trimRenderBudget();
  ctx.clearRect(0, 0, w, h);
  let ox = 0, oy = 0;
  if (G.shake > 0) { ox = rand(-G.shake, G.shake); oy = rand(-G.shake, G.shake); }
  ctx.save();
  ctx.translate(ox, oy);
  const camX = G.px, camY = G.py;
  try { drawBackground(camX, camY); } catch (_) { try { ctx.restore(); } catch (_) {} ctx.save(); ctx.translate(ox, oy); }
  if (G.state === "menu" || G.state === "shop" || G.state === "codex") {
    drawMenuAmbient();
  } else if (G.modeId === "square_loop" && G.square) {
    drawSquareLoop();
  } else {
    drawNodes(camX, camY);
    drawZones();
    drawAfterimages();
    drawBlasts();
    drawAltars();
    for (const p of G.pickups) drawPickup(p);
    // magnet tether when close
    for (const p of G.pickups) {
      const d = dist(p.x, p.y, G.px, G.py);
      if (d < 90 && d > 8) {
        const a = w2s(p.x, p.y);
        const b = w2s(G.px, G.py);
        let col = (p.kind === "boss" || p.kind === "relic" || p.kind === "essence") ? "251,191,36"
          : p.kind === "elite" ? "192,132,252" : "92,225,230";
        if (p.kind === "stone") col = hexRgb((STONE_BY_KEY[p.stone] || stonesOf()[0]).color);
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
    // 单只怪绘制失败不影响整帧（试炼血条等）
    for (const e of G.enemies) {
      try { drawEnemy(e); } catch (_) { try { ctx.restore(); } catch (_) {} ctx.save(); ctx.translate(ox, oy); }
    }
    drawOffscreenIndicators();
    for (const p of G.projectiles) {
      try { drawProjectile(p); } catch (_) {}
    }
    drawBeasts(camX, camY);
    try { drawPlayer(); } catch (_) {}
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
  if (G.state === "play" || G.state === "level" || G.state === "job" || G.state === "forge") {
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
  // 精美战场底图优先；失败必须落入程序化地面
  const arena = ArtSprites.img && ArtSprites.img.arena;
  if (arena && arena.complete && arena.naturalWidth > 0 && arena.naturalHeight > 0) {
    try {
      const scale = Math.max(view.w / arena.naturalWidth, view.h / arena.naturalHeight) * 1.35;
      const dw = arena.naturalWidth * scale;
      const dh = arena.naturalHeight * scale;
      if (Number.isFinite(dw) && Number.isFinite(dh) && dw > 0 && dh > 0) {
        ctx.save();
        ctx.fillStyle = "#070b12";
        ctx.fillRect(0, 0, view.w, view.h);
        const px = (-camX * 0.03) % dw;
        const py = (-camY * 0.03) % dh;
        ctx.globalAlpha = 0.92;
        for (let ix = -1; ix <= 1; ix++) {
          for (let iy = -1; iy <= 1; iy++) {
            ctx.drawImage(arena, px - dw / 2 + view.w / 2 + ix * dw, py - dh / 2 + view.h / 2 + iy * dh, dw, dh);
          }
        }
        ctx.globalAlpha = 1;
        const vg = ctx.createRadialGradient(view.w / 2, view.h / 2, view.w * 0.2, view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.7);
        vg.addColorStop(0, "rgba(7,11,18,0)");
        vg.addColorStop(1, "rgba(7,11,18,0.55)");
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, view.w, view.h);
        ctx.restore();
        return;
      }
    } catch (_) {
      try { ctx.restore(); } catch (_) {}
    }
  }
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
  const kinds = ["rune", "stone", "stele", "lantern"];
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
    } else if (p.kind === "stone") {
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

function walkBob(phase, amp) {
  return Math.sin(phase) * (amp || 2.2);
}
function attackPunch(t, max) {
  if (!t || t <= 0) return 0;
  const m = max || 0.12;
  const k = 1 - Math.max(0, t) / m;
  return Math.sin(k * Math.PI);
}

function drawPlayer() {
  const s = { x: view.w / 2, y: view.h / 2 };
  const body = G.charId === "mage" ? "#a78bfa" : G.charId === "body" ? "#fbbf24" : "#5ce1e6";
  const rim = G.charId === "mage" ? "#e9d5ff" : G.charId === "body" ? "#ffe9a8" : "#c4f1ff";
  const mv0 = readMove();
  const flipP = (mv0.x || 0) < -0.05;
  const spriteId = "player-" + (G.charId || "sword");
  const moving = Math.hypot(mv0.x || 0, mv0.y || 0) > 0.15;
  G.anim = G.anim || { movePhase: 0, atkT: 0, dashT: 0 };
  if (moving) G.anim.movePhase += 0.35;
  const bob = moving ? walkBob(G.anim.movePhase, 2.6) : Math.sin((G.time || 0) * 2.2) * 0.8;
  const punch = attackPunch(G.anim.atkT, 0.12);
  const breath = 1 + (moving ? 0 : Math.sin((G.time || 0) * 2.2) * 0.02);
  const dashY = G.anim.dashT > 0 ? 0.88 : 1;
  const tilt = moving ? (mv0.x || 0) * 0.14 : 0;
  const swing = punch * (flipP ? -0.12 : 0.12);

  // ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(s.x, s.y + G.pr * 0.85, G.pr * 1.05, G.pr * 0.38, 0, 0, TAU);
  ctx.fill();
  if (moving) {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#c4b5fd";
    ctx.beginPath();
    ctx.arc(s.x - (mv0.x || 0) * 12, s.y + 10 + Math.random() * 4, 1.5, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  const sprSize = G.pr * 2.55 * breath * (1 + punch * 0.08);
  let drewSpr = false;
  try {
    ctx.save();
    ctx.translate(s.x, s.y - G.pr * 0.15 + bob);
    ctx.rotate(tilt + swing);
    drewSpr = ArtSprites.draw(spriteId, 0, 0, sprSize, flipP, 1, dashY);
    ctx.restore();
  } catch (_) {
    try { ctx.restore(); } catch (_) {}
    drewSpr = false;
  }
  if (punch > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35 * punch;
    ctx.strokeStyle = rim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.pr * (1.4 + punch * 0.5), 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  if (drewSpr) {
    if (G.playerHurt > 0) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(s.x, s.y, G.pr * 1.1, 0, TAU);
      ctx.fill();
      ctx.restore();
      G.playerHurt = Math.max(0, G.playerHurt - 0.016);
    }
    if (G.shield > 0) {
      const pulse = G.shieldHit > 0 ? 1 : 0;
      if (G.shieldHit > 0) G.shieldHit = Math.max(0, G.shieldHit - 0.016);
      ctx.strokeStyle = pulse ? "rgba(236,252,203,0.95)" : "rgba(163,230,53,0.65)";
      ctx.lineWidth = pulse ? 3.5 : 2.5;
      ctx.shadowColor = "#a3e635";
      ctx.shadowBlur = pulse ? 20 : 12;
      ctx.beginPath();
      ctx.arc(s.x, s.y, G.pr + 10 + Math.sin(G.time * 4) * 1.5, 0, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    // 环绕飞剑保留
    const n = G.swordCount;
    for (let i = 0; i < n; i++) {
      const a = G.swordPhase + (i / n) * TAU;
      const sx = s.x + Math.cos(a) * G.swordOrbit;
      const sy = s.y + Math.sin(a) * G.swordOrbit;
      ctx.strokeStyle = "rgba(125,211,252,0.18)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, G.swordOrbit, a - 0.35, a);
      ctx.stroke();
      drawSwordShape(sx, sy, a + Math.PI / 2, G.swordSize, "#7dd3fc");
    }
    return;
  }

  // aura (class-tinted) — 双层灵晕
  const grd = ctx.createRadialGradient(s.x, s.y, 6, s.x, s.y, 58);
  grd.addColorStop(0, G.charId === "mage" ? "rgba(167,139,250,0.34)" : G.charId === "body" ? "rgba(251,191,36,0.3)" : "rgba(92,225,230,0.34)");
  grd.addColorStop(0.55, G.charId === "mage" ? "rgba(167,139,250,0.12)" : G.charId === "body" ? "rgba(251,191,36,0.1)" : "rgba(92,225,230,0.12)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(s.x, s.y, 58, 0, TAU);
  ctx.fill();
  // 外环脉冲
  const auraPulse = 0.5 + 0.5 * Math.sin((G.time || 0) * 2.4);
  ctx.save();
  ctx.globalAlpha = 0.12 + auraPulse * 0.1;
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(s.x, s.y, G.pr + 14 + auraPulse * 3, 0, TAU);
  ctx.stroke();
  ctx.restore();

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
  const mv2 = readMove();
  const moving2 = Math.hypot(mv2.x, mv2.y) > 0.15;
  if (G.dashTimer > 0 || moving2) {
    G.trail = G.trail || [];
    G.trail.push({ x: G.px, y: G.py, life: 0.28, r: G.pr * (G.dashTimer > 0 ? 0.85 : 0.55), color: body });
    if (G.trail.length > 12) G.trail.shift();
  }
  if (G.trail) {
    for (const t of G.trail) t.life -= 1 / 60;
    G.trail = G.trail.filter((t) => t.life > 0);
    // 拖尾连线
    if (G.trail.length > 1) {
      ctx.save();
      ctx.lineCap = "round";
      for (let i = 1; i < G.trail.length; i++) {
        const a = G.trail[i].life / 0.28;
        ctx.globalAlpha = a * 0.22;
        ctx.strokeStyle = body;
        ctx.lineWidth = 2 + a * 3;
        ctx.beginPath();
        ctx.moveTo(G.trail[i - 1].x - G.px + s.x, G.trail[i - 1].y - G.py + s.y);
        ctx.lineTo(G.trail[i].x - G.px + s.x, G.trail[i].y - G.py + s.y);
        ctx.stroke();
      }
      ctx.restore();
    }
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
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, -G.pr * 0.72);
    ctx.lineTo(G.pr * 0.22, 0);
    ctx.lineTo(0, G.pr * 0.55);
    ctx.lineTo(-G.pr * 0.22, 0);
    ctx.closePath();
    ctx.fill();
    // 刃光
    ctx.strokeStyle = "rgba(196,241,255,0.75)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -G.pr * 0.78);
    ctx.lineTo(0, G.pr * 0.58);
    ctx.stroke();
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
    ctx.rotate(-G.time * 2.4);
    ctx.strokeStyle = "rgba(196,181,253,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, G.pr * 0.42, 0, TAU);
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
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(253,230,138,0.55)";
    ctx.beginPath();
    ctx.arc(s.x, s.y, G.pr * 0.95, Math.PI * 1.1, Math.PI * 1.9);
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
    // 尾焰分层实线（避免热路径 createLinearGradient）
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(251,146,60,0.28)";
    ctx.lineWidth = p.r * 1.3;
    ctx.beginPath();
    ctx.moveTo(s.x - Math.cos(ang) * 26, s.y - Math.sin(ang) * 26);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(251,191,36,0.55)";
    ctx.lineWidth = p.r * 0.85;
    ctx.beginPath();
    ctx.moveTo(s.x - Math.cos(ang) * 16, s.y - Math.sin(ang) * 16);
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
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(186,230,253,0.35)";
    ctx.lineWidth = p.r * 1.05;
    ctx.beginPath();
    ctx.moveTo(s.x - Math.cos(ang) * 20, s.y - Math.sin(ang) * 20);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(125,211,252,0.55)";
    ctx.lineWidth = p.r * 0.55;
    ctx.beginPath();
    ctx.moveTo(s.x - Math.cos(ang) * 12, s.y - Math.sin(ang) * 12);
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

/** Canvas 2.5D 妖物本体：剪影 + 顶光 + rim（调用前 ctx 已 translate 到怪心） */
function drawEnemyBody(e, r, col) {
  const shape = e.shape || "fox";
  const vis = (ENEMY_TYPES[e.type] && ENEMY_TYPES[e.type].vis) || { rim: "#111", hi: "#fff", eyes: "#fff" };
  const rim = e.boss ? "#78350f" : e.elite ? "#4c1d95" : (vis.rim || "rgba(0,0,0,0.55)");
  const hi = e.flash > 0 ? "#ffffff" : (vis.hi || "#fff");
  const eyes = vis.eyes || "#fff";
  const wob = Math.sin((G.time || 0) * 3 + (e.phase || 0));

  // 位图精灵优先
  let sid = shape;
  if (shape === "dust" || e.type === "dustling") sid = "dust";
  else if (shape === "dummy") sid = null;
  else if (shape === "moth" || e.type === "moth") sid = "moth";
  else sid = shape;
  if (sid) {
    // 精英/Boss 若有专用贴图则优先，否则用基础形 + 外层光环
    const pref = e.boss ? ("boss-" + sid) : e.elite ? ("elite-" + sid) : null;
    if (pref && ArtSprites.ok(pref)) sid = pref;
    const windup = (e.atkT || 0) > 0 ? attackPunch(e.atkT, 0.2) : 0;
    const hitK = (e.hitT || 0) > 0 ? 1 + Math.sin((e.hitT || 0) * 50) * 0.08 : 1;
    const bob = walkBob((G.time || 0) * 5 + (e.phase || 0), e.boss ? 3.2 : 2);
    const flap = (e.shape === "bat" || e.shape === "moth") ? (1 + 0.12 * Math.sin((G.time || 0) * 8 + (e.phase || 0))) : 1;
    const breathB = e.boss ? 1 + Math.sin((G.time || 0) * 1.5) * 0.03 : 1;
    const sprSize = r * (e.boss ? 3.2 : e.elite ? 2.7 : 2.5) * (1 + windup * 0.06) * breathB;
    const flipX = (e.vx || 0) < -1;
    let okSpr = false;
    try {
      okSpr = ArtSprites.draw(sid, 0, -r * 0.1 + bob + windup * 2, sprSize, flipX, flap * hitK, hitK);
    } catch (_) { okSpr = false; }
    if (okSpr) {
      if (windup > 0) {
        ctx.save();
        ctx.globalAlpha = 0.25 * windup;
        ctx.strokeStyle = "#fecaca";
        ctx.beginPath();
        ctx.arc(0, 0, r * (1.3 + windup * 0.3), 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      if (e.flash > 0) {
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      return;
    }
  }

  const fillBody = () => {
    ctx.fillStyle = col;
    ctx.strokeStyle = rim;
    ctx.lineWidth = e.boss || e.elite ? 2.6 : 1.6;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = e.boss ? 18 : e.elite ? 12 : 6;
  };
  const topShade = () => {
    ctx.save();
    ctx.shadowBlur = 0;
    // 顶光：白→透明条，避免每帧建渐变
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.35, r * 0.75, r * 0.35, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.ellipse(0, r * 0.45, r * 0.8, r * 0.3, 0, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  };
  const flashOutline = () => {
    if (!(e.flash > 0)) return;
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 1, 0, TAU);
    ctx.stroke();
    ctx.restore();
  };
  const eyesDot = (lx, ly, rr) => {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = eyes;
    ctx.beginPath();
    ctx.arc(lx, ly, rr, 0, TAU);
    ctx.fill();
    ctx.restore();
  };

  if (shape === "golem") {
    fillBody();
    // 躯干
    ctx.beginPath();
    const rr = r * 0.92;
    ctx.moveTo(-rr * 0.95, -rr * 0.55);
    ctx.lineTo(rr * 0.95, -rr * 0.72);
    ctx.lineTo(rr * 0.88, rr * 0.72);
    ctx.lineTo(-rr * 0.92, rr * 0.78);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    // 肩甲
    ctx.fillStyle = hi;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(-rr * 1.05, -rr * 0.55, rr * 0.42, rr * 0.38);
    ctx.fillRect(rr * 0.62, -rr * 0.62, rr * 0.42, rr * 0.38);
    ctx.globalAlpha = 1;
    // 腿
    ctx.fillStyle = col;
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1.4;
    ctx.fillRect(-rr * 0.72, rr * 0.55, rr * 0.38, rr * 0.42);
    ctx.fillRect(rr * 0.28, rr * 0.55, rr * 0.38, rr * 0.42);
    ctx.strokeRect(-rr * 0.72, rr * 0.55, rr * 0.38, rr * 0.42);
    ctx.strokeRect(rr * 0.28, rr * 0.55, rr * 0.38, rr * 0.42);
    // 眼
    eyesDot(-r * 0.28, -r * 0.12, Math.max(1.6, r * 0.1));
    eyesDot(r * 0.28, -r * 0.14, Math.max(1.6, r * 0.1));
    topShade();
  } else if (shape === "ghost") {
    ctx.save();
    ctx.globalAlpha = e.flash > 0 ? 1 : 0.86;
    fillBody();
    ctx.beginPath();
    ctx.arc(0, -r * 0.12, r * 0.82, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, r * 0.25);
    ctx.quadraticCurveTo(-r * 0.35, r * (1.05 + 0.08 * wob), 0, r * 0.55);
    ctx.quadraticCurveTo(r * 0.35, r * (1.05 - 0.08 * wob), r * 0.7, r * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    // 眼洞
    ctx.fillStyle = "rgba(10,12,20,0.75)";
    ctx.beginPath();
    ctx.ellipse(-r * 0.28, -r * 0.12, r * 0.14, r * 0.18, 0, 0, TAU);
    ctx.ellipse(r * 0.28, -r * 0.12, r * 0.14, r * 0.18, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  } else if (shape === "bat") {
    fillBody();
    const flap = 0.12 * Math.sin((G.time || 0) * 8 + (e.phase || 0));
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.25);
    ctx.lineTo(-r * (1.35 + flap), -r * 0.05);
    ctx.lineTo(-r * 0.45, r * 0.45);
    ctx.lineTo(0, r * 0.28);
    ctx.lineTo(r * 0.45, r * 0.45);
    ctx.lineTo(r * (1.35 + flap), -r * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.48, r * 0.55, 0, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 翼膜脉
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.2, 0); ctx.lineTo(-r * 1.1, -r * 0.05);
    ctx.moveTo(r * 0.2, 0); ctx.lineTo(r * 1.1, -r * 0.05);
    ctx.stroke();
    eyesDot(-r * 0.16, -r * 0.08, Math.max(1.4, r * 0.09));
    eyesDot(r * 0.16, -r * 0.08, Math.max(1.4, r * 0.09));
    topShade();
  } else if (shape === "moth") {
    fillBody();
    const flap = 1 + 0.18 * Math.sin((G.time || 0) * 7 + (e.phase || 0));
    ctx.beginPath();
    ctx.ellipse(-r * 0.55 * flap, -r * 0.05, r * 0.72, r * 0.48, -0.35, 0, TAU);
    ctx.ellipse(r * 0.55 * flap, -r * 0.05, r * 0.72, r * 0.48, 0.35, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, r * 0.05, r * 0.28, r * 0.42, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    eyesDot(-r * 0.1, -r * 0.08, Math.max(1.2, r * 0.08));
    eyesDot(r * 0.1, -r * 0.08, Math.max(1.2, r * 0.08));
    topShade();
  } else if (shape === "dust") {
    fillBody();
    const pulse = 1 + 0.2 * Math.sin((G.time || 0) * 9 + (e.phase || 0));
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85 * pulse, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.28, 0, TAU);
    ctx.fill();
    topShade();
  } else if (shape === "wolf") {
    fillBody();
    ctx.beginPath();
    ctx.ellipse(0, r * 0.05, r * 0.95, r * 0.72, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    // 吻部
    ctx.beginPath();
    ctx.moveTo(-r * 0.35, -r * 0.15);
    ctx.lineTo(-r * 1.05, -r * 0.05 + wob * 0.5);
    ctx.lineTo(-r * 0.3, r * 0.25);
    ctx.closePath();
    ctx.fill();
    // 背脊
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const bx = (i - 1.5) * r * 0.28;
      ctx.moveTo(bx, -r * 0.55);
      ctx.lineTo(bx + r * 0.12, -r * 0.95 - (i % 2) * 2);
      ctx.lineTo(bx + r * 0.24, -r * 0.55);
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    eyesDot(-r * 0.45, -r * 0.08, Math.max(1.5, r * 0.1));
    eyesDot(-r * 0.18, -r * 0.05, Math.max(1.5, r * 0.1));
    topShade();
  } else {
    // fox / default
    fillBody();
    ctx.beginPath();
    ctx.ellipse(0, r * 0.08, r * 0.92, r * 0.78, 0, 0, TAU);
    ctx.fill(); ctx.stroke();
    // 耳
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, -r * 0.45);
    ctx.lineTo(-r * 0.42, -r * 1.25);
    ctx.lineTo(-r * 0.12, -r * 0.5);
    ctx.closePath();
    ctx.moveTo(r * 0.55, -r * 0.45);
    ctx.lineTo(r * 0.42, -r * 1.25);
    ctx.lineTo(r * 0.12, -r * 0.5);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // 尾
    ctx.beginPath();
    ctx.moveTo(r * 0.55, r * 0.25);
    ctx.quadraticCurveTo(r * (1.2 + 0.1 * wob), r * 0.1, r * (1.05 + 0.12 * wob), -r * 0.35);
    ctx.quadraticCurveTo(r * 0.85, r * 0.05, r * 0.55, r * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    eyesDot(-r * 0.28, -r * 0.05, Math.max(1.5, r * 0.09));
    eyesDot(r * 0.22, -r * 0.02, Math.max(1.5, r * 0.09));
    topShade();
  }
  flashOutline();
  ctx.shadowBlur = 0;
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
  // v7.2 处决标记
  if (!e.dead && e.hpMax > 0 && e.hp / e.hpMax < (typeof FEEL !== "undefined" && FEEL.executeMark != null ? FEEL.executeMark : 0.25)) {
    const pulse = 0.5 + 0.5 * Math.sin(G.time * 9 + (e.r || 8));
    ctx.save();
    ctx.strokeStyle = `rgba(248,113,113,${0.32 + pulse * 0.45})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r + 6 + pulse * 2.5, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }
  const ed = (typeof ELEM_BY_KEY !== "undefined") ? ELEM_BY_KEY[e.elem] : null;
  if (ed) {
    ctx.globalAlpha = e.boss || e.elite ? 0.9 : 0.5;
    ctx.strokeStyle = ed.color;
    ctx.lineWidth = e.boss || e.elite ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.arc(0, r * 0.72, r * 0.98, Math.PI * 0.16, Math.PI * 0.84);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  const col = e.flash > 0 ? "#ffffff" : e.color;
  if (e.boss) {
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
  if (e.mods && e.mods.length && typeof ENEMY_MODS !== "undefined") {
    ctx.save();
    const n = e.mods.length;
    const bw = 24, bh = 17;
    for (let i = 0; i < n; i++) {
      const m = ENEMY_MODS[e.mods[i]];
      if (!m) continue;
      const ox = (i - (n - 1) / 2) * (bw + 4);
      const oy = -r - 22 - Math.sin(G.time * 2.2 + i * 1.3) * 2;
      ctx.fillStyle = "rgba(6,10,18,0.82)";
      ctx.strokeStyle = m.color;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.rect(ox - bw / 2, oy - bh / 2, bw, bh);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = m.color;
      ctx.font = "600 11px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(m.name, ox, oy + 0.5);
    }
    ctx.restore();
  }
  if (e.wardMax > 0 && e.ward > 0) {
    const ww = r * 2;
    ctx.save();
    ctx.fillStyle = "rgba(148,163,184,0.35)";
    ctx.fillRect(-ww / 2, -r - 12, ww, 4);
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(-ww / 2, -r - 12, ww * (e.ward / e.wardMax), 4);
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

  if (e.shape === "dummy") {
    ctx.fillStyle = col;
    ctx.strokeStyle = e.boss ? "#78350f" : e.elite ? "#4c1d95" : "rgba(0,0,0,0.55)";
    ctx.lineWidth = e.boss || e.elite ? 2.5 : 1.5;
    ctx.shadowColor = e.color;
    ctx.shadowBlur = 10;
    if (G.trial && G.trial.active) {
      const pulse = 0.55 + 0.45 * Math.sin(G.time * 4);
      ctx.save();
      ctx.globalAlpha = 0.18 + 0.16 * pulse;
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(-r * 0.62, 0);
      ctx.lineTo(r * 0.62, 0);
      ctx.lineTo(r * 0.34, -r * 9);
      ctx.lineTo(-r * 0.34, -r * 9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.35 + 0.4 * pulse;
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, r * (1.5 + 0.18 * pulse), 0, TAU); ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.95); ctx.lineTo(-r * 0.5, -r * 0.55);
    ctx.lineTo(r * 0.5, -r * 0.55); ctx.lineTo(r * 0.55, r * 0.95);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 0;
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = 0.75 - i * 0.16;
      ctx.beginPath(); ctx.arc(0, 0, r * (0.32 + i * 0.2), 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(-r * 0.42, 0); ctx.lineTo(r * 0.42, 0);
    ctx.moveTo(0, -r * 0.42); ctx.lineTo(0, r * 0.42);
    ctx.stroke();
  } else {
    drawEnemyBody(e, r, col);
  }

  // 血条 + 名牌（2.5D 信息层）
  if (e.hp < e.hpMax) {
    const bw = Math.max(r * 2, 28), bh = e.boss || e.elite ? 6 : 4;
    const bx = -bw / 2, by = -r - 12;
    const fillW = e.hpMax > 0 ? bw * clamp(e.hp / e.hpMax, 0, 1) : 0;
    if (Number.isFinite(fillW) && fillW > 0) {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.beginPath();
      ctx.roundRect(bx - 1, by - 1, bw + 2, bh + 2, 3);
      ctx.fill();
      const hpCol = e.boss ? "#fbbf24" : e.elite ? "#c084fc" : "#f43f5e";
      ctx.fillStyle = hpCol;
      ctx.shadowColor = hpCol;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.roundRect(bx, by, fillW, bh, 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      if (e.boss || e.elite) {
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        ctx.fillRect(bx + 1, by + 1, Math.max(0, fillW - 2), Math.max(1, bh * 0.35));
      }
    }
  }
  if (e.boss) {
    drawNameplate(0, -r - 30, e.name, "gold");
  } else if (e.elite) {
    drawNameplate(0, -r - 26, e.name, "violet");
  }
  ctx.restore();
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

// v6.0 A 冰霜力场：地面减速区，站进去移速大减
function drawZones() {
  for (const z of G.zones) {
    const s = w2s(z.x, z.y);
    if (s.x < -220 || s.y < -220 || s.x > view.w + 220 || s.y > view.h + 220) continue;
    const a = Math.min(1, z.life / 2);
    const col = z.color || "#67e8f9";     // v7.0 A：合击力场用自己的颜色
    ctx.save();
    ctx.globalAlpha = a;
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, z.r);
    g.addColorStop(0, col + "66");
    g.addColorStop(1, col + "00");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, z.r, 0, TAU); ctx.fill();
    ctx.strokeStyle = col + "88";
    ctx.lineWidth = 1.6;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(s.x, s.y, z.r, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
}

// v7.0 A/B：爆点预警圈（合击 / 连锁共用）—— 给玩家 0.05~0.4s 的预读时间
function drawBlasts() {
  if (!G.blasts || !G.blasts.length) return;
  for (const b of G.blasts) {
    if (b.t <= 0) continue;
    const s = w2s(b.x, b.y);
    if (s.x < -260 || s.y < -260 || s.x > view.w + 260 || s.y > view.h + 260) continue;
    const k = 1 - Math.max(0, b.t) / b.max;      // 0→1 收缩
    ctx.save();
    ctx.globalAlpha = 0.35 + k * 0.5;
    ctx.strokeStyle = b.color;
    ctx.lineWidth = 2 + k * 2;
    ctx.beginPath(); ctx.arc(s.x, s.y, b.r * (1 - k * 0.35), 0, TAU); ctx.stroke();
    ctx.globalAlpha = 0.14 + k * 0.22;
    ctx.fillStyle = b.color;
    ctx.beginPath(); ctx.arc(s.x, s.y, b.r * (1 - k * 0.35), 0, TAU); ctx.fill();
    ctx.restore();
  }
}

// v7.0 C：瞬步剑影
function drawAfterimages() {
  if (!G.afterimages || !G.afterimages.length) return;
  for (const a of G.afterimages) {
    const s = w2s(a.x, a.y);
    const k = a.life / a.max;
    ctx.save();
    ctx.globalAlpha = k * 0.5;
    ctx.strokeStyle = "#5ce1e6";
    ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(s.x, s.y, a.r * (0.55 + (1 - k) * 0.45), 0, TAU); ctx.stroke();
    ctx.globalAlpha = k * 0.18;
    ctx.fillStyle = "#5ce1e6";
    ctx.beginPath(); ctx.arc(s.x, s.y, a.r * (0.55 + (1 - k) * 0.45), 0, TAU); ctx.fill();
    ctx.restore();
  }
}

// v6.0 C 祭坛：走近触发血契选择
function drawAltars() {
  for (const a of G.altars) {
    const s = w2s(a.x, a.y);
    if (s.x < -180 || s.y < -180 || s.x > view.w + 180 || s.y > view.h + 180) continue;
    const pulse = 1 + Math.sin(a.bob) * 0.08;
    ctx.save();
    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, a.r * 2.2 * pulse);
    g.addColorStop(0, "rgba(192,132,252,0.34)");
    g.addColorStop(1, "rgba(192,132,252,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, a.r * 2.2 * pulse, 0, TAU); ctx.fill();
    ctx.translate(s.x, s.y);
    ctx.rotate(G.time * 0.6);
    ctx.strokeStyle = "rgba(216,180,254,0.75)";
    ctx.lineWidth = 2;
    ctx.setLineDash([9, 7]);
    ctx.beginPath(); ctx.arc(0, 0, a.r * pulse, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    ctx.rotate(-G.time * 1.1);
    ctx.strokeStyle = "rgba(251,191,36,0.5)";
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, a.r * 0.62, 0, TAU); ctx.stroke();
    ctx.rotate(G.time * 1.1);
    ctx.fillStyle = "rgba(15,10,28,0.88)";
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.rect(-13, -20, 26, 34); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#f5d0fe";
    ctx.font = "700 16px system-ui, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("祭", 0, -3);
    ctx.restore();
    if (dist(a.x, a.y, G.px, G.py) < 280) {
      ctx.save();
      ctx.fillStyle = "rgba(233,213,255,0.92)";
      ctx.font = "600 12px system-ui, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("走近立血契 · 可直接走开拒绝", s.x, s.y + a.r + 28);
      ctx.restore();
    }
  }
}

function drawPickup(p) {
  const s = w2s(p.x, p.y);
  const bobY = Math.sin(p.bob) * 4;
  let col = "#5ce1e6";
  if (p.kind === "elite") col = "#c084fc";
  if (p.kind === "boss") col = "#fbbf24";
  if (p.kind === "relic") col = "#f0c14b";
  if (p.kind === "stone") col = (STONE_BY_KEY[p.stone] || stonesOf()[0]).color;
  if (p.kind === "essence") col = "#fde68a";
  const gold = p.kind === "boss" || p.kind === "relic" || p.kind === "essence";

  ctx.save();
  // quality light pillar for elite/boss/relic
  if (p.kind !== "orb" && p.kind !== "stone") {
    const h = gold ? 72 : 48;
    const w = gold ? 18 : 12;
    const g = ctx.createLinearGradient(s.x, s.y + bobY - h, s.x, s.y + bobY);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.35, gold ? "rgba(251,191,36,0.22)" : "rgba(192,132,252,0.2)");
    g.addColorStop(1, gold ? "rgba(251,191,36,0.05)" : "rgba(192,132,252,0.05)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(s.x - w / 2, s.y + bobY);
    ctx.lineTo(s.x + w / 2, s.y + bobY);
    ctx.lineTo(s.x + w * 0.15, s.y + bobY - h);
    ctx.lineTo(s.x - w * 0.15, s.y + bobY - h);
    ctx.closePath();
    ctx.fill();
    // ground ring
    ctx.strokeStyle = gold ? "rgba(251,191,36,0.45)" : "rgba(192,132,252,0.4)";
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

  if (p.kind === "relic") {
    // 法宝匣：金框宝箱 + 锁扣宝珠
    const r = p.r * 1.3;
    ctx.fillStyle = "rgba(30,21,8,0.96)";
    ctx.strokeStyle = "#f0c14b";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#f0c14b";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.rect(-r, -r * 0.7, r * 2, r * 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-r, -r * 0.7);
    ctx.quadraticCurveTo(0, -r * 1.6, r, -r * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fde68a";
    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.24, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(253,230,138,0.8)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.1 - r * 0.52); ctx.lineTo(0, -r * 0.1 + r * 0.52);
    ctx.moveTo(-r * 0.52, -r * 0.1); ctx.lineTo(r * 0.52, -r * 0.1);
    ctx.stroke();
    ctx.restore();
    return;
  }

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

  if (p.kind === "stone") {
    // 五行灵晶：小颗菱形结晶
    const r = p.r * 1.05;
    ctx.rotate(Math.sin(p.bob * 0.6) * 0.25);
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.62, -r * 0.1);
    ctx.lineTo(0, r);
    ctx.lineTo(-r * 0.62, -r * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(r * 0.26, -r * 0.16);
    ctx.lineTo(-r * 0.26, -r * 0.16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    return;
  }

  if (p.kind === "essence") {
    // 五行灵髓：五色流转的灵珠
    const r = p.r * 1.15;
    for (let i = 0; i < 5; i++) {
      const a = p.bob * 0.8 + (i / 5) * TAU;
      ctx.fillStyle = ELEMENTS[i].color;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.42, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#fffbe8";
    ctx.shadowColor = "#fde68a";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.42, 0, TAU);
    ctx.fill();
    ctx.shadowBlur = 0;
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
  // 扇形余晖
  ctx.fillStyle = slash.color;
  ctx.globalAlpha = 0.12 * (1 - t);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, slash.range * expand * 1.05, -slash.half, slash.half);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 0.9 * (1 - t);
  // outer cyan arc
  ctx.strokeStyle = slash.color;
  ctx.lineWidth = 18 * (1 - t * 0.55);
  ctx.shadowColor = slash.color;
  ctx.shadowBlur = 26;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand, -slash.half, slash.half);
  ctx.stroke();
  // mid blade
  ctx.strokeStyle = "rgba(125,211,252,0.75)";
  ctx.lineWidth = 8 * (1 - t * 0.5);
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand * 0.96, -slash.half * 0.95, slash.half * 0.95);
  ctx.stroke();
  // inner gold blade edge
  ctx.strokeStyle = "rgba(253,230,138,0.9)";
  ctx.lineWidth = 3.5 * (1 - t * 0.5);
  ctx.shadowColor = "#fbbf24";
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand * 0.9, -slash.half * 0.85, slash.half * 0.85);
  ctx.stroke();
  // 冲击环 + 外圈白光
  ctx.globalAlpha = 0.4 * (1 - t);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2.2;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand * 1.18, 0, TAU);
  ctx.stroke();
  ctx.globalAlpha = 0.2 * (1 - t);
  ctx.beginPath();
  ctx.arc(0, 0, slash.range * expand * 1.32, 0, TAU);
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
    // v7.4 P0：字段口径不统一 —— 有的粒子写 {x,y}，有的写 {x2,y2}，读的却是 .x/.y，
    //   于是 lineTo(NaN, NaN)。浏览器对非有限参数直接 return（不加点、不报错），
    //   表现就是「线画不出来 + 上一段路径被留在那儿」= 玩家看到的花屏 / 图形被截断。
    //   探针实测一局 2 万次（tools/render-audit.js）。这里兜底读两种写法并丢弃非法值。
    const lx = p.line.x !== undefined ? p.line.x : p.line.x2;
    const ly = p.line.y !== undefined ? p.line.y : p.line.y2;
    if (!Number.isFinite(lx) || !Number.isFinite(ly)) return;
    const e = w2s(lx, ly);
    if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) return;
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
        <span class="c-stones">本命 · ${(CHAR_STONES[c.id] || []).map((s) => s.name).join(" / ")}</span>
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

// ---------- 万宝图鉴 ----------
function renderCodex() {
  const m = Meta.load();
  const st = Meta.codexStats();
  if (ui.codexProgress) {
    ui.codexProgress.textContent = `法宝 ${st.art}/${st.artTotal} · 灵兽 ${st.beast}/${st.beastTotal}`;
  }

  if (ui.codexArtifacts) {
    ui.codexArtifacts.innerHTML = "";
    for (const a of ARTIFACTS) {
      const found = !!m.codex.artifacts[a.id];
      const cell = document.createElement("div");
      cell.className = "cx-cell tier-" + TIER_KEY[a.tier] + (found ? " found" : " locked");
      cell.innerHTML = `
        <div class="cx-ico">${found ? a.ico : "？"}</div>
        <div class="cx-body">
          <div class="cx-top"><b>${found ? a.name : "未收录"}</b><span class="cx-tier">${a.tier}品</span></div>
          <div class="cx-desc">${found ? a.desc : "局内开启法宝匣即可收录"}</div>
        </div>`;
      ui.codexArtifacts.appendChild(cell);
    }
  }

  if (ui.codexBeasts) {
    ui.codexBeasts.innerHTML = "";
    for (const b of BEASTS) {
      const unlocked = Meta.beastUnlocked(b.id);
      const contracted = m.contract === b.id;
      const cell = document.createElement("div");
      cell.className = "cx-cell beast tier-" + TIER_KEY[b.tier] +
        (unlocked ? " found" : " locked") + (contracted ? " contracted" : "");
      cell.innerHTML = `
        <div class="cx-ico">${unlocked ? b.ico : "？"}</div>
        <div class="cx-body">
          <div class="cx-top"><b>${unlocked ? b.name : "未解锁"}</b><span class="cx-tier">${b.tier}品</span></div>
          <div class="cx-desc">${unlocked ? b.desc : "解锁条件：" + b.unlock.text}</div>
        </div>`;
      if (unlocked) {
        const btn = document.createElement("button");
        btn.className = "cx-contract" + (contracted ? " on" : "");
        btn.textContent = contracted ? "契约中" : "契约";
        btn.addEventListener("click", (ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          const now = Meta.toggleContract(b.id);
          AudioSys.buy();
          toast(now ? `已契约 · ${b.name}` : `解除契约 · ${b.name}`, now ? "gold" : "cyan");
          renderCodex();
          refreshMetaUI();
        });
        cell.appendChild(btn);
      }
      ui.codexBeasts.appendChild(cell);
    }
  }
}

function showCodex() {
  G.state = "codex";
  releaseJoystick();
  releaseWakeLock();
  ui.startScreen.classList.add("hidden");
  ui.shopScreen.classList.add("hidden");
  ui.overScreen.classList.add("hidden");
  ui.hud.classList.add("hidden");
  ui.comboBadge.classList.add("hidden");
  ui.codexScreen.classList.remove("hidden");
  setMenuBg(false);
  renderCodex();
}

function hideCodex() {
  ui.codexScreen.classList.add("hidden");
  showMenu();
}

function renderTreasures() {
  const screen = document.getElementById("treasureScreen");
  if (!screen || !window.Treasure) return;
  const meta = Meta.load();
  const list = meta.treasures || [];
  const coins = document.getElementById("treasureCoins");
  const cnt = document.getElementById("treasureCount");
  const box = document.getElementById("treasureList");
  if (coins) coins.textContent = meta.coins;
  if (cnt) cnt.textContent = `${list.length}/${Treasure.MAX}`;
  if (!box) return;
  box.innerHTML = "";
  if (!list.length) {
    box.innerHTML = `<div class="shop-item"><div class="s-desc">囊中空空 · 小妖 1% 掉落，试炼击碎必赐</div></div>`;
    return;
  }
  list.forEach((t) => {
    const ti = Treasure.TIER[t.tier] || Treasure.TIER[0];
    const row = document.createElement("div");
    row.className = "shop-item";
    row.innerHTML = `
      <div class="shop-ico">${ti.name[0]}</div>
      <div><span class="s-name" style="color:${ti.color}">${ti.name}·${Treasure.SLOT_NAME[t.slot]}</span>
        <span class="s-lv">威 ${t.power}</span>
        <div class="s-desc">${(t.affixes || []).map((a) => (Treasure.AFFIX[a] ? Treasure.AFFIX[a].name : a)).join(" · ") || "无词缀"} · ${Treasure.canUpgrade(t) ? `淬炼 ◆${Treasure.upgradeCost(t.tier)}` : "已至史诗"}</div>
      </div>
      <button class="shop-buy" data-up="${t.uid}" ${Treasure.canUpgrade(t) ? "" : "disabled"}>淬炼</button>
      <button class="shop-buy" data-scrap="${t.uid}">化去 ◆${Treasure.scrapValue(t)}</button>`;
    box.appendChild(row);
  });
  box.querySelectorAll("[data-up]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const uid = btn.getAttribute("data-up");
      const meta2 = Meta.load();
      const item = (meta2.treasures || []).find((x) => x.uid === uid);
      if (!item || !Treasure.canUpgrade(item)) return;
      const cost = Treasure.upgradeCost(item.tier);
      if (meta2.coins < cost) { toast("灵石不足"); return; }
      const up = Treasure.upgrade(item);
      if (!up) return;
      meta2.coins -= cost;
      meta2.treasures = Treasure.removeByUid(meta2.treasures, uid);
      const add = Treasure.addTreasure(meta2.treasures, up);
      meta2.treasures = add.list;
      Meta.save(meta2);
      toast(`淬炼成功 · ${Treasure.TIER[up.tier].name}`, "gold");
      if (window.Analytics) Analytics.track("treasure_up", { tier: up.tier });
      renderTreasures();
      refreshMetaUI();
    });
  });
  box.querySelectorAll("[data-scrap]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const uid = btn.getAttribute("data-scrap");
      const meta2 = Meta.load();
      const item = (meta2.treasures || []).find((x) => x.uid === uid);
      if (!item) return;
      const val = Treasure.scrapValue(item);
      meta2.treasures = Treasure.removeByUid(meta2.treasures, uid);
      meta2.coins += val;
      Meta.save(meta2);
      toast(`化去宝物 · +${val} 灵石`);
      if (window.Analytics) Analytics.track("treasure_scrap", { tier: item.tier, coins: val });
      renderTreasures();
      refreshMetaUI();
    });
  });
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

function refreshShellUI() {
  try {
    const panel = document.getElementById("shellPanel");
    const dots = {
      signin: document.getElementById("shellDotSignin"),
      daily: document.getElementById("shellDotDaily"),
      weekly: document.getElementById("shellDotWeekly"),
    };
    const setDot = (el, on) => { if (el) el.classList.toggle("on", !!on); };
    const dailyList = document.getElementById("dailyList");
    const dailyCount = document.getElementById("dailyCount");
    if (window.Daily && dailyList) {
      const snap = Daily.snapshot(Meta.load());
      if (dailyCount) dailyCount.textContent = `${snap.doneCount}/${snap.total}`;
      dailyList.innerHTML = "";
      for (const item of snap.items) {
        const row = document.createElement("div");
        row.className = "daily-item" + (item.done ? " done" : "");
        row.innerHTML = `
          <span class="daily-check">${item.done ? "✓" : "○"}</span>
          <span class="daily-body"><b>${item.name}</b><i>${item.desc}</i></span>
          <span class="daily-reward">+${item.reward}</span>`;
        dailyList.appendChild(row);
      }
      setDot(dots.daily, snap.doneCount < snap.total);
    }
  } catch (_) {}
  try {
    const btnSignin = document.getElementById("btnSignin");
    const signinCycle = document.getElementById("signinCycle");
    const signinStatus = document.getElementById("signinStatus");
    const dotsSignin = document.getElementById("shellDotSignin");
    if (window.Signin && btnSignin) {
      const st = Signin.status(Meta.load());
      if (signinStatus) signinStatus.textContent = st.canClaim ? `可领 +${st.reward}` : `今日已领 · 明日 ${st.nextDay}`;
      if (signinCycle) {
        signinCycle.innerHTML = st.cycle.map((c) => {
          const cls = c.state === "today" ? "today" : c.state === "done" ? "done" : "";
          return `<span class="signin-day ${cls}" data-day="${c.day}"><b>${c.day}</b><i>${c.reward}</i></span>`;
        }).join("");
      }
      btnSignin.disabled = !st.canClaim;
      const span = btnSignin.querySelector("span") || btnSignin;
      span.textContent = st.canClaim ? `领取签到 +${st.reward}` : `今日已领 · 明日 ${st.nextDay}`;
      if (dotsSignin) dotsSignin.classList.toggle("on", !!st.canClaim);
    }
  } catch (_) {}
  try {
    const wName = document.getElementById("weeklyName");
    const wProg = document.getElementById("weeklyProgress");
    const wBtn = document.getElementById("btnWeeklyClaim");
    const dotsWeekly = document.getElementById("shellDotWeekly");
    if (window.Weekly && wName) {
      const st = Weekly.status(Meta.load());
      wName.textContent = st.challenge.name;
      if (wProg) wProg.textContent = `${st.progress}/${st.target} · ${st.challenge.desc}`;
      if (wBtn) {
        wBtn.disabled = !st.canClaim;
        wBtn.textContent = st.claimed ? "本周已领取" : st.completed ? `领取 +${st.challenge.reward}` : "未完成";
      }
      if (dotsWeekly) dotsWeekly.classList.toggle("on", !!st.canClaim);
    }
  } catch (_) {}
  try {
    const btnAdDaily = document.getElementById("btnAdDaily");
    if (btnAdDaily && window.Ads) {
      const meta = Meta.load();
      const premium = Ads.isPremium(meta);
      const left = Ads.remainingToday("daily_refresh", meta);
      btnAdDaily.disabled = premium || left <= 0;
      btnAdDaily.textContent = premium ? "已去广告" : (left <= 0 ? "今日补签已用完" : "补全一条日课 · 演示广告");
    }
  } catch (_) {}
  try {
    const btnAdDouble = document.getElementById("btnAdDouble");
    if (btnAdDouble && window.Ads) {
      const meta = Meta.load();
      const premium = Ads.isPremium(meta);
      const left = Ads.remainingToday("settle_double", meta);
      const used = !!G._adDoubleUsed;
      const runCoins = Number(btnAdDouble.dataset.runCoins || 0);
      btnAdDouble.disabled = premium || used || left <= 0 || runCoins <= 0;
      const span = btnAdDouble.querySelector("span") || btnAdDouble;
      if (premium) span.textContent = "已去广告";
      else if (used) span.textContent = "本局已翻倍";
      else if (left <= 0) span.textContent = "今日翻倍已用完";
      else if (runCoins <= 0) span.textContent = "无灵石可翻倍";
      else span.textContent = `灵石×2 · 演示广告（今日${left}次）`;
    }
  } catch (_) {}
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
  ui.codexScreen.classList.add("hidden");
  if (ui.forgeModal) ui.forgeModal.classList.add("hidden");
  ui.comboBadge.classList.add("hidden");
  if (ui.squareHud) ui.squareHud.classList.add("hidden");
  if (ui.joyZone) ui.joyZone.classList.remove("hidden");
  if (ui.joystick) ui.joystick.classList.remove("hidden");
  ui.startScreen.classList.remove("hidden");
  setMenuBg(true);
  refreshMetaUI();
  renderChars();
  refreshShellUI();
  syncModeCards();
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
// v7.7 自愈主循环。
//   旧写法：update() 抛一次异常 ⇒ requestAnimationFrame(frame) 那一行永远执行不到 ⇒
//   整个游戏静死 —— 画面停在最后一帧，玩家看到的就是「崩了」，而且没有任何自救手段。
//   现在：① 异常被兜住；② 立刻复位画布 + 清掉最容易污染的瞬时态；③ RAF 链在 finally 里必定续上。
//   连续异常还会逐级降级（关阴影 → 降画质 → 收掉试炼/弹窗这类持续制造状态的东西）。
let _frameErrN = 0;
let _lastFrameAt = 0;
function frame(now) {
  _lastFrameAt = now;
  try {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    Quality.sample(dt);
    update(dt);
    draw();
    if (_frameErrN) _frameErrN = 0;
  } catch (err) {
    _frameErrN += 1;
    salvageFrame(err);
  } finally {
    requestAnimationFrame(frame);
  }
}

function salvageFrame(err) {
  if (_frameErrN === 1 || _frameErrN % 120 === 0) {
    try { console.warn("[玄天劫] 帧异常已自愈（游戏继续运行）：", err); } catch (_) {}
  }
  try {
    ctx.setTransform(view.dpr || 1, 0, 0, view.dpr || 1, 0, 0);
    ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.setLineDash([]);
    // 不 clearRect：避免角色/敌人瞬间消失
  } catch (_) {}
  try {
    G.particles.length = 0; G.floaters.length = 0;
    G.shake = 0; G.hitStop = 0; G.goldFlash = 0;
  } catch (_) {}
  if (_frameErrN === 3) {
    Quality.level = "low"; Quality.apply();
    try { resize(); } catch (_) {}
    try { toast("画面异常已自动修复 · 已切到流畅模式", "cyan"); } catch (_) {}
  }
  if (_frameErrN >= 60) {
    try { if (G.trial && G.trial.active) endTrial(false, "异常保护"); } catch (_) {}
    try { if (G.state === "level") closeLevelUp(); } catch (_) {}
    _frameErrN = 0;
  }
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

// ---- 方环试炼：模式卡 / 站桩键 / 大招 / 场上点击 ----
(function bindSquareLoop() {
  const bindMode = (el, id) => {
    if (!el) return;
    el.addEventListener("click", () => {
      AudioSys.init();
      setModePick(id);
    });
  };
  bindMode(ui.btnModeEndless, "endless");
  bindMode(ui.btnModeSquare, "square_loop");
  syncModeCards();

  for (const s of SQ_STANCE_UI) {
    const el = s.el();
    if (el) el.addEventListener("click", (e) => {
      e.stopPropagation();
      setSquareStance(s.id);
    });
  }
  if (ui.btnSquareUlt) {
    ui.btnSquareUlt.addEventListener("click", (e) => {
      e.stopPropagation();
      const st = G.square;
      const SL = window.SquareLoop;
      if (!st || !SL || st.over) return;
      if ((st.ultCharge || 0) < 60) return;
      const res = SL.castUlt(st, st.ultCharge / 100);
      if (res && window.Analytics) {
        Analytics.track("square_loop", { phase: "ult_manual", name: res.name, scale: res.scale, dealt: Math.round(res.dealt || 0) });
      }
      updateSquareHud();
    });
  }
  // joyZone 隐藏后由 canvas 收点击（柱 / 中立）
  if (canvas) {
    const onDown = (e) => {
      if (G.modeId !== "square_loop" || G.state !== "play") return;
      e.preventDefault();
      handleSquarePointer(e);
    };
    if (window.PointerEvent) canvas.addEventListener("pointerdown", onDown);
    else canvas.addEventListener("touchstart", (ev) => {
      const t = ev.changedTouches && ev.changedTouches[0];
      if (t) onDown({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => ev.preventDefault() });
    }, { passive: false });
  }
})();

// Sprint B 壳：签到 / 分享
(function bindShell() {
  const ultHud = document.getElementById("ultHud");
  if (ultHud) {
    ultHud.style.pointerEvents = "auto";
    ultHud.style.cursor = "pointer";
    ultHud.addEventListener("click", () => {
      if ((G.ultReady || 0) > 0 || ((G.ultCharge || 0) >= ULT.chargeMax && (G.ultStock || 0) > 0)) castUlt();
    });
  }
  const btnTreasure = document.getElementById("btnTreasure");
  const treasureScreen = document.getElementById("treasureScreen");
  if (btnTreasure && treasureScreen) {
    btnTreasure.addEventListener("click", () => {
      ui.startScreen.classList.add("hidden");
      treasureScreen.classList.remove("hidden");
      renderTreasures();
    });
    const back = document.getElementById("btnTreasureBack");
    if (back) back.addEventListener("click", () => {
      treasureScreen.classList.add("hidden");
      showMenu();
    });
    const scrapLow = document.getElementById("btnScrapLow");
    if (scrapLow) scrapLow.addEventListener("click", () => {
      const meta = Meta.load();
      let gain = 0;
      const keep = [];
      for (const t of meta.treasures || []) {
        if (t && t.tier <= 1) { gain += Treasure.scrapValue(t); continue; }
        keep.push(t);
      }
      if (!gain) { toast("没有生锈/普通可化去"); return; }
      meta.treasures = keep;
      meta.coins += gain;
      Meta.save(meta);
      toast(`批量化去 · +${gain} 灵石`);
      if (window.Analytics) Analytics.track("treasure_scrap", { bulk: true, coins: gain });
      renderTreasures();
      refreshMetaUI();
    });
  }
  const shellPanel = document.getElementById("shellPanel");
  if (shellPanel) {
    document.querySelectorAll(".shell-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const open = shellPanel.classList.contains("collapsed");
        shellPanel.classList.toggle("collapsed", !open);
        if (window.Analytics) Analytics.track("shell_toggle", { open });
      });
    });
  }
  const btnWeekly = document.getElementById("btnWeeklyClaim");
  if (btnWeekly) {
    btnWeekly.addEventListener("click", () => {
      if (!window.Weekly) return;
      const res = Weekly.claim(Meta.load());
      if (res.ok) {
        Meta.save(res.meta);
        AudioSys.buy();
        toast(res.msg, "gold");
        if (window.Analytics) Analytics.track("weekly_claim", { id: res.meta.weekly && res.meta.weekly.challengeId, coins: res.coins });
      } else toast(res.msg);
      refreshMetaUI();
      refreshShellUI();
    });
  }
  const btnSignin = document.getElementById("btnSignin");
  if (btnSignin) {
    btnSignin.addEventListener("click", () => {
      if (!window.Signin) return;
      const res = Signin.claim(Meta.load());
      if (res.ok) {
        Meta.save(res.meta);
        AudioSys.buy();
        toast(res.msg, "gold");
        if (window.Analytics) Analytics.track("signin_claim", { day: res.day, coins: res.coins });
      } else {
        toast(res.msg);
      }
      refreshMetaUI();
      refreshShellUI();
    });
  }
  const btnShare = document.getElementById("btnShare");
  if (btnShare) {
    btnShare.addEventListener("click", async () => {
      if (!window.ShareCard) return;
      const data = {
        modeName: "天劫无尽",
        wave: G.wave,
        kills: G.kills,
        timeText: formatTime(G.time),
        combo: G.comboPeak,
        level: G.level,
        coins: G.coinsRun || 0,
        charName: CHARS[G.charId]?.name || "修士",
        realm: RealmTitle(G.level),
        win: false,
      };
      if (window.Analytics) Analytics.track("share_click", { mode: "endless", wave: G.wave });
      const r = await ShareCard.share(data);
      if (r.shared) toast("已唤起系统分享", "cyan");
      else if (r.downloaded) toast("战绩卡已生成", "cyan");
      else if (r.cancelled) toast("已取消分享");
      else toast("分享未完成，可稍后再试");
    });
  }
  try { if (window.Analytics) Analytics.track("app_open", { build: "v7.8.24-mobile-port" }); } catch (_) {}

  const btnAdDouble = document.getElementById("btnAdDouble");
  if (btnAdDouble) {
    btnAdDouble.addEventListener("click", async () => {
      if (!window.Ads || btnAdDouble.disabled || Ads.busy()) return;
      btnAdDouble.disabled = true;
      const runCoins = Number(btnAdDouble.dataset.runCoins || G.coinsRun || 0);
      toast("演示广告播放中…");
      const r = await Ads.offer("settle_double");
      if (r.ok) {
        const g = Ads.grantSettleDouble(runCoins, { usedThisRun: !!G._adDoubleUsed });
        if (g.ok) {
          toast(g.msg, "gold");
          const overCoins = document.getElementById("overCoins");
          if (overCoins) overCoins.textContent = "+" + (runCoins + g.add);
          G._adDoubleUsed = true;
          G.coinsRun = runCoins + g.add;
          btnAdDouble.dataset.runCoins = "0";
          refreshMetaUI();
        } else {
          toast(g.msg);
        }
      } else {
        toast(r.error === "premium" ? "已去广告" : r.error === "busy" ? "广告播放中" : r.error === "daily_limit" ? "今日翻倍已用完" : "广告未完成");
      }
      refreshShellUI();
      const span = btnAdDouble.querySelector("span") || btnAdDouble;
      if (Ads.isPremium(Meta.load())) span.textContent = "已去广告";
      else if (G._adDoubleUsed) span.textContent = "本局已翻倍";
      else if (Ads.remainingToday("settle_double", Meta.load()) <= 0) span.textContent = "今日翻倍已用完";
      else span.textContent = `灵石×2 · 演示广告（今日${Ads.remainingToday("settle_double", Meta.load())}次）`;
      btnAdDouble.disabled = Ads.isPremium(Meta.load()) || !!G._adDoubleUsed || Ads.remainingToday("settle_double", Meta.load()) <= 0 || Ads.busy();
    });
  }

  const btnAdDaily = document.getElementById("btnAdDaily");
  if (btnAdDaily) {
    btnAdDaily.addEventListener("click", async () => {
      if (!window.Ads || btnAdDaily.disabled || Ads.busy()) return;
      btnAdDaily.disabled = true;
      toast("演示广告播放中…");
      const r = await Ads.offer("daily_refresh");
      if (r.ok) {
        const g = Ads.grantDailyRefresh(undefined, { refundOnFail: true });
        if (g.ok) {
          toast(g.msg, "gold");
          for (const gr of g.grants || []) {
            if (window.Analytics) Analytics.track("daily_complete", { id: gr.id, coins: gr.coins, via: "ad" });
          }
        } else toast(g.msg);
      } else {
        toast(r.error === "premium" ? "已去广告" : r.error === "busy" ? "广告播放中" : r.error === "daily_limit" ? "今日补签已用完" : "广告未完成");
      }
      refreshMetaUI();
      refreshShellUI();
      btnAdDaily.disabled = Ads.isPremium(Meta.load()) || Ads.remainingToday("daily_refresh", Meta.load()) <= 0 || Ads.busy();
    });
  }

  const btnPremium = document.getElementById("btnPremiumMock");
  if (btnPremium) {
    btnPremium.addEventListener("click", () => {
      const meta = Meta.load();
      const next = !(meta.premium && meta.premium.noAds);
      meta.premium = meta.premium || { noAds: false, skins: [] };
      meta.premium.noAds = next;
      Meta.save(meta);
      if (window.Analytics) Analytics.track("premium_toggle", { noAds: next, mock: true });
      toast(next ? "预研：已开启去广告" : "预研：已关闭去广告", "cyan");
      refreshShellUI();
      // 结算页翻倍按钮同步 premium 态
      try {
        const adD = document.getElementById("btnAdDouble");
        if (adD && window.Ads) {
          const left = Ads.remainingToday("settle_double", meta);
          adD.disabled = next || !!G._adDoubleUsed || left <= 0;
          const span = adD.querySelector("span") || adD;
          if (next) span.textContent = "已去广告";
        }
      } catch (_) {}
    });
  }
})();
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
ui.btnCodex.addEventListener("click", showCodex);
ui.btnCodexBack.addEventListener("click", hideCodex);
if (ui.forgeBtn) ui.forgeBtn.addEventListener("click", () => { AudioSys.init(); openForge(); });
if (ui.btnForgeClose) ui.btnForgeClose.addEventListener("click", closeForge);
if (ui.invBtn) ui.invBtn.addEventListener("click", () => { AudioSys.init(); openInventory(); });
if (ui.btnInvClose) ui.btnInvClose.addEventListener("click", closeInventory);
// v6.0 C 祭坛：拒绝按钮（不立契，转身走开，不惩罚）
if (ui.btnAltarSkip) ui.btnAltarSkip.addEventListener("click", () => {
  toast("未立血契 · 祭坛消散", "cyan");
  closeAltar();
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
    // v7.7 回前台补点火：后台期间浏览器会掐掉 RAF，万一回来时链没接上，这里补一帧。
    //  （正常情况 _lastFrameAt 是最新的、frame 自己已经续上了，这一帧会被自然吞掉）
    try {
      if (G.state === "play" && performance.now() - _lastFrameAt > 1500) {
        _lastFrameAt = performance.now();
        requestAnimationFrame(frame);
      }
    } catch (_) {}
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
try {
  if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const rr = Math.min(Math.abs(r) || 0, Math.abs(w) / 2, Math.abs(h) / 2);
      this.moveTo(x + rr, y);
      this.arcTo(x + w, y, x + w, y + h, rr);
      this.arcTo(x + w, y + h, x, y + h, rr);
      this.arcTo(x, y + h, x, y, rr);
      this.arcTo(x, y, x + w, y, rr);
      this.closePath();
    };
  }
} catch (_) {}
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

// v7.7 Canvas 上下文丢失自愈。
//   移动端在显存吃紧时浏览器会直接丢弃 2D 上下文（画面瞬间变白/黑，玩家看到的就是「崩了」）。
//   不监听就永远不会恢复；这里拦下丢失事件并在恢复时重建依赖尺寸的缓存（背景渐变等）。
try {
  canvas.addEventListener("contextlost", (ev) => {
    try { ev.preventDefault(); } catch (_) {}
    G._ctxLost = true;
  });
  canvas.addEventListener("contextrestored", () => {
    G._ctxLost = false;
    bgGrad = null;
    try { ctx.setTransform(view.dpr || 1, 0, 0, view.dpr || 1, 0, 0); resize(); } catch (_) {}
    try { toast("画面已恢复", "cyan"); } catch (_) {}
  });
} catch (_) {}

window.G = G;
window.Meta = Meta;
window.Quality = Quality;
window.ArtSprites = ArtSprites;
// 调试/无头测试钩子（无副作用）
window.__XTJ__ = {
  openLevelUp, openJobModal, jobSyncHud, shouldOfferJob, buildUpgradePool, rollUpgrades, gainXP,
  JOB_PATHS, JOB_LEVELS, JOB_STAGES, NODE_HOLD,
  openRelicModal, updateBeasts, spawnBeast, relicHudSync, beastHudSync, renderCodex, showCodex, hideCodex,
  ARTIFACTS, ARTIFACT_BY_ID, BEASTS, BEAST_BY_ID, MAX_RELICS,
  ELEMENTS, ELEM_BY_KEY, ORDINARY_COST, MAX_ORDINARY,
  // v3.0 装备系统
  TIERS, TIER_ORDER, SLOT_DEFS, ITEM_TYPES, AFFIX_POOL, AFFIX_KEYS, RARE_AFFIX_KEYS,
  SKILL_AFFIX_KEYS, ACTIVE_SKILL_KEYS, PASSIVE_SKILL_KEYS, MAX_ACTIVE_SLOTS,
  INVENTORY_MAX, EQUIP_SLOTS_MAX,
  makeEquip, canMerge, mergeEquip, autoMergeEquip, pickUpEquip,
  equipTo, unequipTo, equipBonuses, equipRec,
  // v4.0 主动技能触发 + 派系核心自动解锁
  triggerEquipSkill, autoUnlockCoreCheck, autoJobFromSet, CHAR_TO_PATH,
  CHAR_STONES, STONE_BY_KEY, STONES_ALL, STONE_BY_SCHOOL, SCHOOLS_ALL,
  GEMS, GEM_BY_ID, GEM_TIERS, MAX_GEMS,
  SCH_CORES, SCH_CORE_BY_ID, SCH_CORE_BY_SCHOOL, MAX_SCHOOL_CORES, CORE_NEED_STONES,
  stonesOf, stoneKeys, stoneTotal, stoneAt, schoolOf, countSchool, gemsOf, gemSlotsUsed, randStone,
  canUnlockCore, unlockCore, equipCore, unequipCore, spendSchool,
  coresEquipped, coresHasSlot, coresOfChar,
  stoneHudSync, invHudSync, renderInventory, openInventory, closeInventory, renderEquipQuick, schoolHintCheck, forgeBtnSync, forgeableAny, canCraft, spendStones, gemProgress, nextGemStoneKey,
  renderForge, renderCores, coreHudSync, openForge, closeForge, craftGem, openEssenceModal,
  gemsMaxed, canMelt, meltStones, MELT_COST, SCH_PACK_DROP,
  DROP_EQ_MOB, DROP_EQ_ELITE_W, DROP_EQ_ELITE_G, DROP_EQ_BOSS_W_MIN, DROP_EQ_BOSS_W_MAX, DROP_EQ_BOSS_G, DROP_EQ_BOSS_B, DROP_EQ_BOSS_O,
  gemOnHit, gemOnCrit, atkSpeedNow, knockEnemies, playerDamageMult,
  ELEM_OVERCOME, ELEM_GENERATE, PATH_ELEMS, elemRelation, bestElemRelation, elemMulVs, elemMatchText, waveElemKey,
  REL_BEAT, REL_LOSE, REL_FED, REL_DRAIN,
  DROP_MOB, DROP_ELITE, DROP_BOSS, ESSENCE_GAIN, buildWave, updateWaves,
  applyHit, update, updateGoalBar,
  // v7.4 渲染探针（无副作用，仅供无头体检 tools/render-audit.js 调用）
  ctx,
  spawnFloater, burst,
  draw, drawInner, drawEnemy, drawFloater, drawParticle, drawZones, drawBlasts, drawOffscreenIndicators, view, w2s,
  collectPickup, dropPickup, killEnemy, spawnEnemy, damagePlayer, updateHUD, ENEMY_TYPES,
  charVsEnemy, CHAR_MATCH, enemyHP, enemyATK, earlyEnemyAtkMul, endgameHpMul, endgameAtkMul,
  recomputeResonance, resonanceJust, renderResonance, resHudSync, gemsOfId,
  ATK_BASE: 12,   // 测试用：玩家初始攻击（用于计算升级成长比值）
  // v5.0 PM 视角
  showBigBanner, showTutorial, hideTutorial, advanceTutorial, tickTutorial, updateGoalBar, setStoneSlot,
  toggleStoneSlot, validateStoneSlot,   // v7.3 P0 灵石槽入口
  PURITY_BONUS, PURITY_PARTIAL, STONE_SLOT_BONUS, BOSS_PURPLE_DROP,
  // v6.0 A 怪物词缀 / B 词条联动 / C 祭坛赌注
  ENEMY_MODS, ENEMY_MOD_KEYS, modCountFor, rollEnemyMods,
  SYNERGIES, SYNERGY_BY_ID, synOn, synHudSync,
  ALTAR_DEALS, ALTAR_BY_ID, tierUp, spawnAltar, updateAltars, openAltar, takeAltarDeal, closeAltar,
  // v6.1 武器觉醒 + 法门自动择定
  SCHOOL_WEAPON, WEAPON_NAME, WEAPON_EVO_NAME, WEAPON_MAX_LV, WEAPON_EVO_NEED,
  syncWeaponsFromSet, SCHOOL_BRANCH_IDX, JOB_BRANCH_MAX_LV, syncJobBranchesFromSet, jobWpLvAdd,
  // v7.0 A 双兵合击 / B 尸潮·连锁 / C 瞬步·狂血
  FUSION_DEFS, FUSION_MAX_ACTIVE, FUSION_NEED_LV, syncFusions, updateFusions, fusionHudSync, updateFusionHud,
  addBlast, blastNow, updateBlasts,
  HORDE_EVERY, hordeSize, startHorde, updateHorde, rewardHorde, dirName,
  CHAIN_MAX_DEPTH, tryChainKill,
  spawnAfterimage, updateAfterimages, updateFrenzy,
  FRENZY_HP, FRENZY_TIME, FRENZY_CD, castSkill,
  // v7.1 黄金 15 秒：悟道突破 + 生存改造
  UPGRADE_POOL, UPGRADE_BY_ID, UPGRADE_CLS, buildUpgradePool, takeUpgrade, closeLevelUp,
  LV_ATK_MUL, LV_HP_MUL, damagePlayer, updateWaves, tickTutorial, hideTutorial,
  // v7.2 打击感 + 悬赏令
  FEEL, feelHit, feelKill, feelPart, comboBurst,
  // v7.5 前 10 波自动悟道 / 渲染预算 / 伤害测试者
  AUTO_UPGRADE_MAX_WAVE, autoUpgradePhase, autoUpgradePick, grantUpgrade, flushAutoUpgrades,
  RENDER_CAP, trimRenderBudget, renderCapNow,
  // v7.7 稳定性加固（真机崩溃防线）
  MAX_CANVAS_PX, salvageFrame, renderCapNow, frame,
  TRIAL_WAVES, TRIAL_TIME, TRIAL_HP, TRIAL_CHASE, trialHPFor, trialIsWave, trialTitle,
  spawnTrial, updateTrial, endTrial, trialHudSync,
  // v7.5 健壮性探针（无副作用，仅供无头体检 tools/robustness-suite.js 调用）
  resetRun, resize, spawnAtEdge, equipRec, ULT, ACTS, actForWave, castUlt, fireUlt, addUltCharge, softCollide,
  // 方环试炼（square_loop）
  selectedModeId, setModePick, syncModeCards, startSquareLoopRun, updateSquareLoop, endSquareLoop,
  setSquareStance, updateSquareHud, handleSquarePointer, drawSquareLoop, squarePillars, SquareArt,
  ENEMY_STRENGTH_MUL, HORDE_STRENGTH_MUL, enemyHP, enemyATK, trialHPFor,
  TRIAL_GRADES, TRIAL_GRADE_TIME, TRIAL_GRADE_RATIO, trialGrade, showTrialResult, hideTrialCard,
  // v7.6 好玩性改造：试炼 2.0 / 深度系统触达 / 悟道便签
  TRIAL_COLLAPSE_AT, TRIAL_COLLAPSE_RATE, TRIAL_CRACKS, trialCrack,
  INSIGHT_EVERY, grantWeaponInsight, AUTO_SLOT_NEED, autoStoneSlot, showAutoNote, updateAutoNotes, JOB_BRANCH_MAX_LV,
  BOUNTY_DEFS, BOUNTY_BY_ID, startBounty, bountyAdd, completeBounty, failBounty, tickBounty,
};
})();
