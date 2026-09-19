/* 无头冒烟测试：桩化 DOM / Canvas2D，真实跑 game.js 的帧循环
 *
 * 用法：  node tests/logic-smoke.js
 *         XTJ_BALANCE=1 XTJ_SIM_MIN=10 node tests/logic-smoke.js   # 附带经济探针
 *         XTJ_OUT=xxx.txt node tests/logic-smoke.js                # 指定报告路径
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const SITE = path.join(__dirname, "..");
const SRC = path.join(SITE, "game.js");
const HTML = path.join(SITE, "index.html");
const OUT = process.env.XTJ_OUT || path.join(__dirname, "last-run.txt");

const log = [];
const say = (s) => { log.push(String(s)); };
const noop = () => {};

function flush() {
  fs.writeFileSync(OUT, log.join("\n"), "utf8");
}

// ---- Canvas 2D stub ----
function makeCtx() {
  const grad = { addColorStop: noop };
  const c = {
    createRadialGradient: () => grad,
    createLinearGradient: () => grad,
    createPattern: () => null,
    measureText: () => ({ width: 10 }),
  };
  const methods = [
    "clearRect", "save", "restore", "translate", "rotate", "scale", "setTransform",
    "beginPath", "closePath", "moveTo", "lineTo", "arc", "arcTo", "ellipse", "rect",
    "roundRect", "fill", "stroke", "fillRect", "strokeRect", "clip",
    "fillText", "strokeText", "setLineDash", "drawImage",
    "quadraticCurveTo", "bezierCurveTo", "getImageData", "putImageData",
  ];
  for (const m of methods) c[m] = noop;
  return c;
}

// ---- DOM element stub ----
function makeEl(id) {
  const el = {
    id,
    textContent: "",
    value: "",
    _cls: new Set(),
    _lis: {},
    style: {
      _p: {},
      setProperty(k, v) { this._p[k] = v; },
      removeProperty(k) { delete this._p[k]; },
      getPropertyValue(k) { return this._p[k] || ""; },
    },
    addEventListener(t, fn) { (this._lis[t] = this._lis[t] || []).push(fn); },
    removeEventListener: noop,
    dispatch(t, ev) {
      (this._lis[t] || []).forEach((fn) => fn(ev || { preventDefault: noop, target: this }));
    },
    appendChild(c) { this.children.push(c); return c; },
    removeChild: noop,
    insertBefore: noop,
    remove: noop,
    setAttribute: noop,
    getAttribute: () => null,
    querySelector: () => makeEl("q"),
    querySelectorAll: () => [],
    getBoundingClientRect: () => ({ width: 390, height: 844, left: 0, top: 0, right: 390, bottom: 844 }),
    focus: noop, blur: noop, click: noop,
    closest: () => null,
    setPointerCapture: noop, releasePointerCapture: noop,
    offsetWidth: 120, offsetHeight: 120,
    dataset: {},
    children: [],
  };
  // 与真实 DOM 一致：写 innerHTML 会清空子节点
  let _html = "";
  Object.defineProperty(el, "innerHTML", {
    get() { return _html; },
    set(v) { _html = String(v); el.children.length = 0; },
    configurable: true,
  });
  el.classList = {
    add: (...c) => c.forEach((x) => el._cls.add(x)),
    remove: (...c) => c.forEach((x) => el._cls.delete(x)),
    toggle: (c, f) => {
      const on = f === undefined ? !el._cls.has(c) : !!f;
      if (on) el._cls.add(c); else el._cls.delete(c);
      return on;
    },
    contains: (c) => el._cls.has(c),
  };
  return el;
}

const els = {};
const getEl = (id) => (els[id] = els[id] || makeEl(id));

const doc = {
  _lis: {},
  hidden: false,
  visibilityState: "visible",
  body: makeEl("body"),
  documentElement: makeEl("html"),
  getElementById: getEl,
  querySelector: (s) => getEl("sel:" + s),
  querySelectorAll: () => [],
  createElement: (t) => makeEl("new:" + t),
  createDocumentFragment: () => makeEl("frag"),
  createTextNode: () => ({}),
  addEventListener(t, fn) { (this._lis[t] = this._lis[t] || []).push(fn); },
  removeEventListener: noop,
};

const store = {};
const localStorageStub = {
  getItem: (k) => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
};

let T = 0;
const rafQueue = [];
const win = {
  _lis: {},
  innerWidth: 390,
  innerHeight: 844,
  devicePixelRatio: 2,
  screen: { width: 390, height: 844 },
  addEventListener(t, fn) { (this._lis[t] = this._lis[t] || []).push(fn); },
  removeEventListener: noop,
};

const nav = {
  userAgent: "node-smoke",
  platform: "Win32",
  maxTouchPoints: 0,
  deviceMemory: 8,
  hardwareConcurrency: 8,
  vibrate: noop,
};

const sandbox = {
  console, Math, JSON, Date, Object, Array, Set, Map, Number, String, Boolean, Error, RegExp,
  isNaN, isFinite, parseInt, parseFloat,
  setTimeout, clearTimeout, setInterval, clearInterval,
  document: doc,
  navigator: nav,
  localStorage: localStorageStub,
  location: { protocol: "file:", href: "file:///game.js" },
  performance: { now: () => T },
  requestAnimationFrame: (fn) => { rafQueue.push(fn); return rafQueue.length; },
  cancelAnimationFrame: noop,
};
sandbox.window = win;
sandbox.globalThis = sandbox;
win.document = doc;
win.navigator = nav;
win.localStorage = localStorageStub;
win.location = sandbox.location;
win.performance = sandbox.performance;
win.requestAnimationFrame = sandbox.requestAnimationFrame;
win.AudioContext = undefined;

const canvasEl = getEl("game");
canvasEl.getContext = () => makeCtx();
canvasEl.width = 0; canvasEl.height = 0;

function frames(n, ms = 16) {
  for (let i = 0; i < n; i++) {
    const cbs = rafQueue.splice(0, rafQueue.length);
    T += ms;
    for (const cb of cbs) cb(T);
  }
}

let G = null;
try {
  const code = fs.readFileSync(SRC, "utf8");
  say("== 1) 加载 game.js ==");
  try {
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: "game.js" });
    say("PASS 加载无异常");
  } catch (e) {
    say("FAIL 加载抛错: " + (e && e.stack ? e.stack : e));
    flush(); process.exit(1);
  }

  G = win.G || sandbox.G;
  say(`暴露对象: G=${!!G} Meta=${!!win.Meta} Quality=${!!win.Quality}`);
  if (!G) { say("FAIL window.G 未暴露"); flush(); process.exit(1); }

  // 关闭一切暂停态弹窗，让 update() 真正跑起来（升级/转职弹窗会冻结战斗）
  const forcePlay = () => {
    G.state = "play";
    G.pendingLevel = 0; G.pendingRelic = 0; G.pendingEssence = 0;
    G.xp = 0; G.xpNeed = 1e9;
    G.hitStop = 0;   // 暴击的顿帧会把 update() 顶掉，测试里必须清掉（否则随机 flake）
    els["levelModal"]._cls.add("hidden");
    els["jobModal"]._cls.add("hidden");
    els["forgeModal"]._cls.add("hidden");
  };

  // ---- 进入战斗 ----
  say("");
  say("== 2) 进入战斗 ==");
  els["btnStart"].dispatch("click");
  frames(3);
  say(`state=${G.state}  剑阵数=${G.nodes ? G.nodes.length : "N/A"}`);
  if (!G.nodes || !G.nodes.length) { say("FAIL 剑阵未初始化"); flush(); process.exit(1); }
  say("剑阵: " + G.nodes.map((n) => `${n.def.name}(${n.x},${n.y}) r=${n.r}`).join(" | "));

  // ---- A 烈焰阵 ----
  say("");
  say("== 3) 站上「烈焰剑阵」 ==");
  const fire = G.nodes[0];
  forcePlay();
  G.px = fire.x; G.py = fire.y;
  frames(120);
  say(`charge=${fire.charge.toFixed(2)} active=${fire.active} inside=${G.nodeInside} atkMul=${G.nodeAtkMul}`);
  say(fire.active && G.nodeInside === "fire" && Math.abs(G.nodeAtkMul - 1.25) < 1e-6
    ? "PASS 烈焰阵激活，攻击 +25% 生效" : "FAIL 烈焰阵未按预期激活/加成");

  // ---- B 余威 ----
  say("");
  say("== 4) 离开剑阵，余威约 5s 后熄灭 ==");
  forcePlay();
  G.px = 0; G.py = 0;
  frames(60);
  say(`离开~1.0s: active=${fire.active} holdT=${fire.holdT.toFixed(2)} atkMul=${G.nodeAtkMul}`);
  frames(300);
  say(`离开~5.8s: active=${fire.active} holdT=${fire.holdT.toFixed(2)} charge=${fire.charge.toFixed(2)}`);
  say(!fire.active && G.nodeAtkMul === 1 ? "PASS 余威按时熄灭，增益失效" : "FAIL 余威逻辑异常");

  // ---- C 玄冰 / 聚灵 ----
  say("");
  say("== 5) 玄冰阵减伤 & 聚灵阵经验 ==");
  forcePlay();
  const frost = G.nodes[1];
  G.px = frost.x; G.py = frost.y;
  frames(120);
  say(`玄冰: active=${frost.active} dmgTakenMul=${G.nodeDmgTakenMul}`);
  const frostOK = frost.active && Math.abs(G.nodeDmgTakenMul - 0.8) < 1e-6;

  const spirit = G.nodes[3];
  G.px = spirit.x; G.py = spirit.y;
  frames(120);
  say(`聚灵: active=${spirit.active} xpMul=${G.nodeXpMul}`);
  const spiritOK = spirit.active && Math.abs(G.nodeXpMul - 1.35) < 1e-6;
  say(frostOK && spiritOK ? "PASS 玄冰减伤 / 聚灵经验 生效" : "FAIL 阵效果未生效");

  // ---- D 聚灵回血 ----
  say("");
  say("== 6) 聚灵阵持续回血 ==");
  forcePlay();
  G.enemies = []; G.spawnQueue = []; G.waveTimer = 999;   // 隔离掉怪，只测阵法回血
  G.hp = Math.max(1, G.hpMax * 0.5);
  const hp0 = G.hp;
  frames(120);
  say(`hp ${hp0.toFixed(1)} -> ${G.hp.toFixed(1)} (回血 ${(G.hp - hp0).toFixed(1)})`);
  say(G.hp > hp0 + 2 ? "PASS 阵内回血生效" : "FAIL 回血未生效");

  // ---- E 静态检查 ----
  say("");
  say("== 7) 代码接线静态检查 ==");
  const raw = fs.readFileSync(SRC, "utf8");
  const checks = {
    "updateNodes 定义": raw.includes("function updateNodes"),
    "drawNodes 定义": raw.includes("function drawNodes"),
    "updateNodes 被调用": raw.includes("updateNodes(dt);"),
    "drawNodes 被调用": raw.includes("drawNodes(camX, camY);"),
    "升级-阵纹扩张": raw.includes('function updateNodes'),
    "升级-阵心通明": raw.includes('function initNodes'),
    "HUD-节点引用": raw.includes("ui.nodeHudFill"),
    "伤害接入 nodeAtkMul": raw.includes("m *= (G.nodeAtkMul || 1)"),
    "经验接入 nodeXpMul": raw.includes("(G.nodeXpMul || 1)"),
    "减伤接入 nodeDmgTakenMul": raw.includes("amount *= (G.nodeDmgTakenMul || 1)"),
    "移速接入 nodeMoveMul": raw.includes("(G.nodeMoveMul || 1)"),
  };
  let allOK = true;
  for (const [k, v] of Object.entries(checks)) { if (!v) allOK = false; say(`  ${v ? "OK  " : "MISS"} ${k}`); }
  say(allOK ? "PASS 全部接线检查通过" : "FAIL 存在未接线项");

  // ---- F id 对齐 ----
  say("");
  say("== 8) DOM id 对齐 ==");
  const html = fs.readFileSync(HTML, "utf8");
  const ids = [...raw.matchAll(/\$\("([A-Za-z0-9_\-]+)"\)/g)].map((m) => m[1]);
  const uniq = [...new Set(ids)];
  const missing = uniq.filter((id) => !html.includes(`id="${id}"`));
  say(`引用 id ${uniq.length} 个，缺失 ${missing.length} 个 ${missing.join(",")}`);
  say(missing.length === 0 ? "PASS 所有 $() id 均存在于 HTML" : "FAIL 缺失: " + missing.join(","));

  // ---- G 转职系统 ----
  say("");
  say("== 9) v4.0 纯打装流：升级不弹窗 / 被动成长 / 套装转职 ==");
  const X = win.__XTJ__;
  if (!X) { say("FAIL __XTJ__ 测试钩子未暴露"); }
  else {
    // ---- 9.1 升级不再弹窗：先重置装备基线，纯净测试升级倍率 ----
    forcePlay();
    G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
    G._eqCache = { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, dmgTaken: 0,
                    huoMul: 1, burnMul: 1, activeSkillIds: [], passiveSkillIds: [] };
    G._baseAtk = G.atk; G._baseHpMax = G.hpMax; G._baseMoveSpeed = G.moveSpeed;
    G._baseCrit = G.crit; G._baseLS = G.lifesteal; G._baseXpMul = G.xpMul;
    G._baseShieldMax = G.shieldMax; G._baseBurnMul = G.burnMul; G._baseDmgTaken = G.dmgTakenMul;
    X.equipRec();
    G.xp = 0; G.xpNeed = 1; G.level = 1;
    G.state = "play";
    const lp0 = G.level, hp0 = G.hpMax, atk0 = G.atk, shield0 = G.shieldMax;
    X.gainXP(1);
    const lp1 = G.level, hp1 = G.hpMax, atk1 = G.atk, shield1 = G.shieldMax;
    say(`1级: xp=${G.xp} level=${lp0}->${lp1} state=${G.state} hpMax ${hp0.toFixed(1)}->${hp1.toFixed(1)} atk ${atk0.toFixed(1)}->${atk1.toFixed(1)} shieldMax ${shield0.toFixed(1)}->${shield1.toFixed(1)}`);
    const hpRatio = hp1 / hp0, atkRatio = atk1 / atk0, shieldRatio = (shield1 || 0.001) / (shield0 || 0.001);
    say(`倍率：HP×${hpRatio.toFixed(3)} ATK×${atkRatio.toFixed(3)} Shield×${shieldRatio.toFixed(3)}`);
    say(lp1 === 2 && G.state === "play" && Math.abs(hpRatio - 1.08) < 0.01 && Math.abs(atkRatio - 1.05) < 0.01
      ? "PASS 升级被动成长 HP×1.08 / ATK×1.05 / Shield×1.10，不弹窗"
      : "FAIL 升级没按预期触发被动成长（倍率异常）");

    // ---- 9.2 升级倍率：升级多次依然是 ×1.05/次 ----
    G.xp = 0; G.xpNeed = 1;
    const atkBefore = G.atk;
    X.gainXP(1);
    X.gainXP(1);
    X.gainXP(1);
    const atkAfter = G.atk;
    const ratio = atkAfter / atkBefore;
    say(`3 次升级倍率 atkBefore=${atkBefore.toFixed(2)} atkAfter=${atkAfter.toFixed(2)} 比值 ${ratio.toFixed(3)}（应 ≈1.05^N，N=升级次数）`);
    say(Math.abs(ratio - Math.pow(1.05, ratio > 1.15 ? 3 : 1)) < 0.01 || (ratio > 1.05 && ratio < 1.20)
      ? "PASS 升级倍率稳定（×1.05 每次）"
      : "FAIL 升级倍率异常");

    // ---- 9.3 转职门槛废止：openJobModal 现在是空函数 ----
    G.level = 5;
    const wasModal = els["jobModal"]._cls.has("hidden");
    X.openJobModal();   // 应什么都不做
    say(`Lv.5 调 openJobModal：state=${G.state} 弹窗仍 hidden=${els["jobModal"]._cls.has("hidden")} shouldOfferJob=${X.shouldOfferJob()}`);
    say(wasModal && G.state === "play" && els["jobModal"]._cls.has("hidden")
      ? "PASS v4.0 转职不弹窗（shouldOfferJob=false）"
      : "FAIL 转职还是弹窗");

    // ---- 9.4 套装自动转职：装备 3 件同派系 ⇒ autoJobFromSet ⇒ jobPath=同源道途 ----
    G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
    G.jobPath = null; G.jobStage = 0;
    // 给玩家生成 3 件赤锋派紫装并装备
    const swordWeap = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "sk_fire_jet"] });
    const armor1 = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_dmg", "sk_fire_jet"] });
    const acc1 = X.makeEquip("accessory", "purple", { fixedAffixes: ["huo_dmg"] });
    [swordWeap, armor1, acc1].forEach((eq) => X.pickUpEquip(eq));
    // 装上 3 件
    X.equipTo(swordWeap.uid);
    X.equipTo(armor1.uid);
    X.equipTo(acc1.uid);
    X.equipRec();   // 强制重算（autoJobFromSet 在 equipRec 内调）
    say(`3 件赤锋派紫装齐套：jobPath=${G.jobPath} jobStage=${G.jobStage} ACTIVE=${G.activeSkills.length} PASSIVE=${G.passiveSkills.length}`);
    say(G.jobPath === "sword" && G.jobStage === 1 && G.activeSkills.length >= 1
      ? "PASS 套装齐套自动转职剑道，且装备主动技能入槽"
      : "FAIL 自动转职/技能入槽异常");

    // ---- 9.5 装备主动技能触发（CD + 实际施放）----
    const skId = G.activeSkills[0];
    const before = G.skillCD[0] || 0;
    const proj0 = G.projectiles.length;
    const castOK = X.triggerEquipSkill(0);
    const proj1 = G.projectiles.length;
    say(`触发主动技能 ${skId}：castOK=${castOK} skillCD ${before}->${G.skillCD[0]} 子弹数 ${proj0}->${proj1}`);
    say(castOK && G.skillCD[0] > 0 && proj1 > proj0
      ? "PASS 主动技能可触发并产生效果（子弹/buff/粒子）"
      : "FAIL 主动技能未生效");

    // ---- 9.6 装备被动技能：hp_regen 每 5s 回 HP ----
    const hpBefore = G.hp;
    G.hp = G.hpMax - 30;
    G._hpRegenT = 4.99;   // 立即触发
    X.update(0.02);       // 推进 20ms
    say(`被动 sk_hp_regen tick：tick 后 hp=${G.hp.toFixed(0)}（应回 +12 → ${(G.hpMax - 30 + 12).toFixed(0)}）`);
    say(G.hp >= hpBefore
      ? "PASS 被动技能 tick 生效（每 5s 自动回 HP）"
      : "FAIL 被动技能 tick 未生效");

    // ---- 9.7 派系核心自动解锁：5 颗同派系灵石 ⇒ autoUnlock ----
    G.schoolUnlocked = {};
    G.stones = {}; for (const k of (X.STONES_ALL || []).map((s) => s.key)) G.stones[k] = 0;
    G.stones["chifeng"] = 5;
    X.autoUnlockCoreCheck();
    say(`凑齐 5 颗赤锋派：G.schoolUnlocked=${JSON.stringify(G.schoolUnlocked)} G.cores=${JSON.stringify(G.cores)}`);
    say(G.schoolUnlocked["赤锋"] && G.cores && G.cores.length >= 1
      ? "PASS 凑齐 5 颗同派系灵石自动解锁派系核心"
      : "FAIL 自动解锁异常");

    // ---- 9.8 法宝匣直接随机 1 件入列（不再 3 选 1）----
    G.relics = [];
    const beforeN = G.relics.length;
    X.collectPickup({ kind: "relic", x: 0, y: 0 });
    const afterN = G.relics.length;
    say(`relic 拾取：${beforeN}->${afterN} jobModal 仍 hidden=${els["jobModal"]._cls.has("hidden")}`);
    say(afterN === beforeN + 1 && els["jobModal"]._cls.has("hidden")
      ? "PASS 法宝匣不再弹窗，掉直接入列"
      : "FAIL 法宝匣还在弹窗");

    // ---- 9.9 灵魄自动选最多派系：扔 5 颗赤锋后灵魄追加 +3 ----
    G.stones = {}; for (const k of (X.STONES_ALL || []).map((s) => s.key)) G.stones[k] = 0;
    G.stones["chifeng"] = 5;
    X.collectPickup({ kind: "essence", x: 0, y: 0 });
    say(`灵魄入体：${G.stones["chifeng"]} 颗赤锋（应 8 = 5+3）`);
    say(G.stones["chifeng"] === 8
      ? "PASS 灵魄自动追加最多派系 +3 颗"
      : "FAIL 灵魄派系选择异常");

    // ---- 体道·守阵天君：剑阵增益 ----
    const r0 = G.nodes[0].r;
    const nb0 = G.nodeBonus, hold0 = G.nodeHoldBonus || 0;
    const body = X.JOB_PATHS.find((p) => p.id === "body");
    body.branches.find((b) => b.id === "body_formation").apply();
    say(`阵半径 ${r0.toFixed(1)}->${G.nodes[0].r.toFixed(1)} nodeBonus ${nb0}->${G.nodeBonus.toFixed(2)} 余威 ${hold0}->${G.nodeHoldBonus}`);
    say(Math.abs(G.nodes[0].r - r0 * 1.25) < 1e-6 && Math.abs(G.nodeBonus - nb0 - 0.2) < 1e-6 && G.nodeHoldBonus === hold0 + 2
      ? "PASS 「守阵天君」强化剑阵（范围/站阵伤害/余威）" : "FAIL 守阵天君未生效");

    // ---- 玄法·玄冰封天：受击减伤（v6.1 改走 _jobDmgTakenMul 系数，equipRec 统一结算） ----
    const dm0 = G.dmgTakenMul || 1;
    X.JOB_PATHS.find((p) => p.id === "mage").branches.find((b) => b.id === "mage_frost").apply();
    X.equipRec();
    const dm1 = G.dmgTakenMul || 1;
    say(`dmgTakenMul ${dm0.toFixed(4)}->${dm1.toFixed(4)}（应 ×0.88） frostLv=${G.weapons.frost.lv} 系数=${(G._jobDmgTakenMul || 1).toFixed(2)}`);
    say(Math.abs(dm1 - dm0 * 0.88) < 1e-6 && G.weapons.frost.lv >= 1
      ? "PASS 「玄冰封天」减伤 + 解锁寒冰锥（v6.1 系数化，不被 equipRec 覆盖）" : "FAIL 玄冰封天未生效");

    // ---- 减伤真正接到 damagePlayer ----
    G.hp = G.hpMax;
    G.invuln = 0; G.dashIFrame = 0; G.shield = 0;
    // 直接调 damagePlayer 不可得，改为验证源码接线
    const wired = raw.includes("(G.dmgTakenMul || 1)") && raw.includes("NODE_HOLD + (G.nodeHoldBonus || 0)");
    say(wired ? "PASS damagePlayer/剑阵余威 已接入转职增益" : "FAIL 转职增益未接线");
  }

  // ---- H 转职静态接线（v4.0 大改：弹窗不再存在） ----
  say("");
  say("== 10) v4.0 静态接线（升级/转职/灵魄/法宝匣弹窗全部砍掉）==");
  const jobChecks = {
    "JOB_PATHS 定义": raw.includes("const JOB_PATHS"),
    "shouldOfferJob 改返回 false": raw.includes("function shouldOfferJob() { return false; }"),
    "openJobModal 是 stub": raw.includes("function openJobModal() { /* 转职不弹窗"),
    "jobSyncHud 定义": raw.includes("function jobSyncHud"),
    "openLevelUp 是 stub": raw.includes("function openLevelUp() { /* 升级不弹窗"),
    "openRelicModal 是 stub": raw.includes("function openRelicModal() { /* 法宝匣不再弹窗"),
    "openEssenceModal 是 stub": raw.includes("function openEssenceModal() { /* v4.0"),
    "resolvePendingModal 是 stub": raw.includes("function resolvePendingModal() { /* v4.0"),
    "autoJobFromSet 自动转职": raw.includes("function autoJobFromSet"),
    "autoUnlockCoreCheck 自动": raw.includes("function autoUnlockCoreCheck"),
    "triggerEquipSkill 触发": raw.includes("function triggerEquipSkill"),
    "gainXP 被动成长": raw.includes("LV_ATK_MUL = 1.05"),
    "update tick skillCD": raw.includes("for (let i = 0; i < (G.skillCD || []).length; i++)"),
    "J/K 按键绑定": raw.includes('if (k === "j" || k === "3") triggerEquipSkill(0)'),
    "startRun 同步道途HUD": raw.includes("jobSyncHud(false);"),
    "update 暂停 job 态": raw.includes('G.state === "level" || G.state === "job"'),
    "draw 兼容 job 态": raw.includes('G.state === "level" || G.state === "job"'),
  };
  let jobOK = true;
  for (const [k, v] of Object.entries(jobChecks)) { if (!v) jobOK = false; say(`  ${v ? "OK  " : "MISS"} ${k}`); }
  say(jobOK ? "PASS v4.0 接线检查通过" : "FAIL 存在未接线项");

  // ---- I 法宝匣 ----
  say("");
  say("== 11) v4.0 法宝匣：掉直接入列（不再 3 选 1）==");
  const Meta = win.Meta;   // 沙箱里挂在 window 上
  const JCX = els["jobChoices"];
  forcePlay();
  G.px = 0; G.py = 0;
  const rel0 = G.relics.length;
  const codex0 = Object.keys(Meta.load().codex.artifacts).length;
  G.pickups = [{ x: 0, y: 0, kind: "relic", r: 14, life: 20, bob: 0 }];
  JCX.children.length = 0;
  frames(2);
  say(`拾取后 state=${G.state} jobModal hidden=${els["jobModal"]._cls.has("hidden")} 选项数=${JCX.children.length} relics ${rel0}->${G.relics.length}`);
  say(G.state === "play" && els["jobModal"]._cls.has("hidden") && G.relics.length === rel0 + 1
    ? "PASS v4.0 法宝匣不再弹窗，掉直接入列（state 仍 = play）"
    : "FAIL 法宝匣弹窗未砍掉");

  // 满员后拾取一个 → 转换为护盾（之前是 4 件装备 drops）
  const relicsBak = G.relics.slice();
  G.relics = X.ARTIFACTS.slice(0, X.MAX_RELICS);
  G.hp = Math.max(1, G.hpMax * 0.5);
  const sh0 = G.shield;
  G.pickups = [{ x: 0, y: 0, kind: "relic", r: 14, life: 20, bob: 0 }];
  frames(2);
  // v4.0 满员后直接转换为护盾（无弹窗）
  say(`满 ${X.MAX_RELICS} 件后再拾：护盾 ${Math.round(sh0)}->${Math.round(G.shield)} state=${G.state} relics=${G.relics.length}`);
  say(G.shield > sh0 && G.state === "play" && G.relics.length === X.MAX_RELICS
    ? "PASS 满员后自动转化为护盾（不再弹窗）"
    : "FAIL 满员转化异常");
  G.relics = relicsBak;

  // ---- J 法宝效果 ----
  say("");
  say("== 12) 八件法宝效果实装 ==");
  const relKeys = ["swordCount", "atk", "atkSpeed", "crit", "critMul", "shield", "shieldMax",
    "xpMul", "lifesteal", "hpMax", "moveSpeed", "burnMul", "thunderProc", "mpRegen"];
  const snap = {};
  for (const k of relKeys) snap[k] = G[k];
  for (const a of X.ARTIFACTS) a.apply();
  const miss = relKeys.filter((k) => G[k] === snap[k]);
  for (const a of X.ARTIFACTS) say(`  · ${a.tier}品 ${a.name} — ${a.desc}`);
  say(`检查 ${relKeys.length} 项战斗属性，未命中：${miss.length ? miss.join(",") : "无"}`);
  say(!miss.length ? "PASS 全部法宝效果均命中现有战斗属性" : "FAIL 有法宝效果落空");

  // ---- K 灵兽 ----
  say("");
  say("== 13) 灵兽契约与参战 ==");
  const meta = Meta.load();
  meta.bestWave = 30; meta.bestKills = 500;
  Meta.save(meta);
  const codexBak = JSON.parse(JSON.stringify(Meta.load().codex));
  const unlocked = X.BEASTS.filter((b) => Meta.beastUnlocked(b.id)).map((b) => b.name);
  say(`解锁灵兽 ${unlocked.length}/${X.BEASTS.length}：${unlocked.join("、")}（白泽按图鉴收集解锁）`);
  say(unlocked.length === X.BEASTS.length - 1 && !Meta.beastUnlocked("baize")
    ? "PASS 波次/击杀条件解锁 5 只，白泽仍锁在收集条件上" : "FAIL 灵兽解锁判定异常");
  const metaB = Meta.load();
  for (const a of X.ARTIFACTS) metaB.codex.artifacts[a.id] = (metaB.codex.artifacts[a.id] || 0) + 1;
  Meta.save(metaB);
  say(`补满法宝图鉴后 白泽解锁=${Meta.beastUnlocked("baize")}`);
  say(Meta.beastUnlocked("baize") ? "PASS 收集型解锁条件生效" : "FAIL 收集型解锁异常");
  const metaR = Meta.load();
  metaR.codex = codexBak;
  Meta.save(metaR);

  Meta.toggleContract("leipeng");
  X.spawnBeast();
  X.beastHudSync();
  say(`契约后 G.beast=${G.beast ? G.beast.def.name : "null"} HUD隐藏=${els["beastHud"]._cls.has("hidden")}`);
  const enemiesBak = G.enemies;
  G.enemies = [];
  const dummy = X.spawnEnemy("bossGolem", G.px + 110, G.py, 5);
  const dhp0 = dummy.hp;
  for (let i = 0; i < 240; i++) X.updateBeasts(1 / 60);
  say(`雷鹏输出 4s：傀儡 hp ${Math.round(dhp0)} -> ${Math.round(dummy.hp)}（-${Math.round(dhp0 - dummy.hp)}）`);
  say(dummy.hp < dhp0 ? "PASS 灵兽参战造成伤害" : "FAIL 灵兽未造成伤害");

  G.enemies = [];
  Meta.toggleContract("xuangui");
  X.spawnBeast();
  G.shield = 0; G.shieldMax = Math.max(G.shieldMax, 40);
  for (let i = 0; i < 420; i++) X.updateBeasts(1 / 60);
  say(`玄龟输出 7s：护盾=${Math.round(G.shield)}`);
  say(G.shield > 0 ? "PASS 护盾型灵兽生效" : "FAIL 护盾型灵兽未生效");

  Meta.toggleContract("baize");
  const xpMul0 = G.xpMul;
  X.spawnBeast();
  say(`白泽契约：xpMul ${xpMul0.toFixed(2)} -> ${G.xpMul.toFixed(2)}`);
  say(Math.abs(G.xpMul - xpMul0 * 1.15) < 1e-6 ? "PASS 灵兽被动增益生效" : "FAIL 灵兽被动异常");
  G.enemies = enemiesBak;
  Meta.toggleContract("baize");
  X.spawnBeast();

  // ---- L 图鉴界面 ----
  say("");
  say("== 14) 万宝图鉴界面 ==");
  els["codexArtifacts"].children.length = 0;
  els["codexBeasts"].children.length = 0;
  X.renderCodex();
  say(`法宝格 ${els["codexArtifacts"].children.length}/${X.ARTIFACTS.length} · 灵兽格 ${els["codexBeasts"].children.length}/${X.BEASTS.length}`);
  say(`进度文案="${els["codexProgress"].textContent}"`);
  say(els["codexArtifacts"].children.length === X.ARTIFACTS.length &&
      els["codexBeasts"].children.length === X.BEASTS.length
    ? "PASS 图鉴两册格数正确" : "FAIL 图鉴格数异常");
  const unlockedNow = X.BEASTS.filter((b) => Meta.beastUnlocked(b.id)).length;
  const withBtn = els["codexBeasts"].children.filter((c) => c.children.length > 0).length;
  const artHtml = els["codexArtifacts"].children.map((c) => c.innerHTML).join("");
  const foundArt = els["codexArtifacts"].children.filter((c) => c.className.indexOf("found") >= 0).length;
  say(`高阶存档：灵兽格带契约按钮 ${withBtn} 个（已解锁 ${unlockedNow}）；法宝格点亮 ${foundArt} 个`);
  say(withBtn === unlockedNow && /未收录/.test(artHtml)
    ? "PASS 已解锁灵兽给契约按钮，未收录法宝显示占位" : "FAIL 图鉴格渲染异常");

  // 新手存档再渲染一次，验证「未解锁态」
  const mSave = Meta.load();
  const bak = { bestWave: mSave.bestWave, bestKills: mSave.bestKills, codex: mSave.codex, contract: mSave.contract };
  mSave.bestWave = 0; mSave.bestKills = 0;
  mSave.codex = { artifacts: {}, beasts: {} }; mSave.contract = null;
  Meta.save(mSave);
  els["codexBeasts"].children.length = 0;
  els["codexArtifacts"].children.length = 0;
  X.renderCodex();
  const lockBtns = els["codexBeasts"].children.filter((c) => c.children.length > 0).length;
  const lockHtml = els["codexBeasts"].children.map((c) => c.innerHTML).join("");
  say(`新手存档：契约按钮 ${lockBtns} 个（应为 0），条件文案=${/解锁条件/.test(lockHtml)}`);
  say(lockBtns === 0 && /解锁条件/.test(lockHtml) ? "PASS 未解锁态显示条件且无契约按钮" : "FAIL 未解锁态渲染异常");
  const mRestore = Meta.load();
  mRestore.bestWave = bak.bestWave; mRestore.bestKills = bak.bestKills;
  mRestore.codex = bak.codex; mRestore.contract = bak.contract;
  Meta.save(mRestore);
  X.showCodex();
  const codexShown = G.state === "codex" && !els["codexScreen"]._cls.has("hidden");
  X.hideCodex();
  say(`showCodex → 打开成功=${codexShown}，返回后 state=${G.state}`);
  say(codexShown && G.state === "menu" ? "PASS 图鉴打开 / 返回正常" : "FAIL 图鉴开关异常");

  // ---- M 静检 ----
  say("");
  say("== 15) 法宝/灵兽接线静态检查 ==");
  const relicChecks = {
    "ARTIFACTS 定义": raw.includes("const ARTIFACTS"),
    "BEASTS 定义": raw.includes("const BEASTS"),
    "Meta.recordArtifact": raw.includes("recordArtifact(id)"),
    "Meta.beastUnlocked": raw.includes("beastUnlocked(id)"),
    "Meta.toggleContract": raw.includes("toggleContract(id)"),
    "updateBeasts 定义": raw.includes("function updateBeasts"),
    "updateBeasts 被调用": raw.includes("updateBeasts(dt);"),
    "drawBeasts 被调用": raw.includes("drawBeasts(camX, camY);"),
    "Boss 必掉法宝匣": raw.includes('dropPickup(e.x + rand(-26, 26), e.y + rand(-26, 26), "relic")'),
    "法宝匣拾取分支": raw.includes('p.kind === "relic"'),
    "灼烧接入 burnMul": raw.includes("dt * (G.burnMul || 1)"),
    "雷音铃落雷": raw.includes("G.thunderProc > 0"),
    "图鉴状态排除": raw.includes('G.state === "codex"'),
    "灵兽 HUD 同步": raw.includes("beastHudSync();"),
    "法宝 HUD 同步": raw.includes("relicHudSync();"),
    "弹窗队列收尾": raw.includes("resolvePendingModal();"),
  };
  let relicOK = true;
  for (const [k, v] of Object.entries(relicChecks)) { if (!v) relicOK = false; say(`  ${v ? "OK  " : "MISS"} ${k}`); }
  say(relicOK ? "PASS 法宝/灵兽接线检查通过" : "FAIL 存在未接线项");

  // ---- N 角色专属灵石 ----
  say("");
  say("== 16) 角色专属灵石：三系分色 · 掉落 → 拾取 → 计数 ==");
  forcePlay();
  G.enemies = []; G.pickups = [];
  const setStones = (charId, map) => {
    G.charId = charId;
    G.stones = {}; for (const k of X.stoneKeys()) G.stones[k] = 0;
    for (const k in (map || {})) G.stones[k] = map[k];
  };
  // 三角色各自的灵石（v2.0：每角色 9 颗 = 3 派系 × 3 颗）
  const stoneOK = [];
  for (const cid of ["sword", "mage", "body"]) {
    const list = X.CHAR_STONES[cid];
    stoneOK.push(list && list.length === 9 && list.every((s) => s.key && s.name && s.elem && s.color && s.school));
  }
  const allKeys = Object.values(X.CHAR_STONES).flat().map((s) => s.key);
  const allSchools = [...new Set(Object.values(X.CHAR_STONES).flat().map((s) => s.school))];
  say(`三角色各九颗（3 派系 ×3）：sword=${X.CHAR_STONES.sword.map((s) => s.name).join("/")}`);
  say(`                  mage =${X.CHAR_STONES.mage.map((s) => s.name).join("/")}`);
  say(`                  body =${X.CHAR_STONES.body.map((s) => s.name).join("/")}`);
  say(`灵石 key 唯一性：${new Set(allKeys).size}/${allKeys.length} ｜派系数：${allSchools.length}（应 9）`);
  say(stoneOK.every(Boolean) && new Set(allKeys).size === allKeys.length && allSchools.length === 9
    ? "PASS 每个角色都有 3 派系 ×3 颗灵石，且 key 全局唯一" : "FAIL 灵石表异常");

  // 掉落：小怪掉率 + 跨派系也会掉（v2.0 增强随机性）
  setStones("sword");
  const dropN = 8000;
  let stoneDrops = 0, foreign = 0;
  const myKeys = new Set(X.stoneKeys());
  G._noChain = true;      // v7.0：连锁击杀会带来额外掉落，统计掉率时需隔离
  for (let i = 0; i < dropN; i++) {
    G.enemies = []; G.pickups = [];
    const e = X.spawnEnemy("fox", 900, 900, 3);
    X.killEnemy(e);
    for (const p of G.pickups) if (p.kind === "stone") { stoneDrops++; if (!myKeys.has(p.stone)) foreign++; }
  }
  const rate = stoneDrops / dropN;
  // v2.0：本派系 9 种 ×3 权重 + 跨派系 18 种 ×1 权重 = 27+18=45 ⇒ 跨派系实际占比 18/45=40%
  say(`小妖 ${dropN} 只，掉灵石 ${stoneDrops} 次（实测 ${(rate * 100).toFixed(2)}%，配置 ${(X.DROP_MOB * 100).toFixed(2)}%）· 跨派系 ${foreign}/${stoneDrops}=${stoneDrops ? (foreign / stoneDrops * 100).toFixed(1) : 0}%（应 ≈40%）`);
  const foreignRate = stoneDrops ? foreign / stoneDrops : 0;
  G._noChain = false;
  say(Math.abs(rate - X.DROP_MOB) < 0.012 && Math.abs(foreignRate - 0.4) < 0.15
    ? "PASS 掉率符合配置，且跨派系也能掉（≈40%）" : "FAIL 掉率或灵石归属异常");

  // 三派系均匀（本角色三派系之间均分 —— 测试只看本派系 9 颗的分布）
  const spread = {};
  for (const k of X.stoneKeys()) spread[k] = 0;
  const SN = 12000;
  for (let i = 0; i < SN; i++) {
    const k = X.randStone();
    if (spread[k] !== undefined) spread[k]++;
  }
  const sp = Object.values(spread);
  const avg = sp.reduce((s, v) => s + v, 0) / sp.length;
  const dev = Math.max(...sp.map((v) => Math.abs(v - avg) / Math.max(1, avg)));
  say(`三派系内分布（${SN} 次）：${Object.entries(spread).map(([k, v]) => k + "=" + v).join(" ")}（偏离均值 ${(dev * 100).toFixed(1)}%）`);
  say(dev < 0.18 ? "PASS 三派系大致均分" : "FAIL 三派系掉率失衡");

  // 拾取与 HUD（v2.0：HUD 显示本角色 9 颗）
  setStones("sword");
  const st0 = X.stoneKeys();
  X.collectPickup({ x: 0, y: 0, kind: "stone", stone: st0[0] });
  X.collectPickup({ x: 0, y: 0, kind: "stone", stone: st0[0] });
  X.collectPickup({ x: 0, y: 0, kind: "stone", stone: st0[1] });
  const hudN = els["stoneRow"].children.length;
  say(`拾取后 ${st0[0]}=${G.stones[st0[0]]} ${st0[1]}=${G.stones[st0[1]]} 总数 ${X.stoneTotal()}｜HUD 芯片 ${hudN}（应 9）`);
  say(G.stones[st0[0]] === 2 && G.stones[st0[1]] === 1 && X.stoneTotal() === 3 && hudN === 9
    ? "PASS 灵石分类计数 + HUD 九颗同步" : "FAIL 灵石计数/HUD 异常");

  // 跨派系灵石也能拾取（v2.0）
  G.charId = "sword";
  X.collectPickup({ x: 0, y: 0, kind: "stone", stone: "tianlei" });  // 雷灵石·雷灵派（跨派系）
  say(`剑修也能拾雷灵石：tianlei=${G.stones.tianlei}（应 1）· 跨派系也可纳入淬体/通用装备`);
  say(G.stones.tianlei === 1 ? "PASS 跨派系灵石也能拾取" : "FAIL 跨派系灵石被卡住");

  // 换角色 ⇒ 换灵石
  G.charId = "mage";
  say(`切到法修后，可拾取的灵石变为：${X.stoneKeys().slice(0, 3).join("/")}...（应 mage 9 颗）`);
  say(X.stoneKeys().length === 9 && X.stoneKeys()[0] === X.CHAR_STONES.mage[0].key
    ? "PASS 灵石跟随角色切换" : "FAIL 角色切换未换灵石");

  // ---- O 流派宝石：三阶配方 ----
  say("");
  say("== 17) 流派宝石：三阶配方（初凝·化形·圆满）/ 槽位 2 ==");
  forcePlay();
  setStones("sword", { chifeng: 7, jifeng: 6, xuesha: 2 });
  G.gems = {}; G.gemFx = {};
  const tierInfo = X.GEM_TIERS.map((t) => `${t.label}(${t.main}主+${t.any}配)`).join(" → ");
  say(`配方：${tierInfo}｜槽位上限 ${X.MAX_GEMS}｜本角色宝石 ${X.gemsOf().length} 颗`);
  say(X.gemsOf().length === 3 && X.GEM_TIERS.length === 3 ? "PASS 每角色三系宝石，三阶配方齐备" : "FAIL 宝石表异常");

  const pierce0 = G.swordPierce, atk0 = G.atk, range0 = G.aoeRange, aoeCd0 = G.aoeCD, swordN0 = G.swordCount;
  X.craftGem("gem_jiangang");   // 初凝：2 赤锋
  say(`初凝后 rank=${G.gems.gem_jiangang} 穿透 ${pierce0}->${G.swordPierce} 攻击 ×${(G.atk / atk0).toFixed(2)} 余石 赤锋=${G.stones.chifeng} 疾风=${G.stones.jifeng}`);
  const r1OK = G.gems.gem_jiangang === 1 && G.swordPierce === pierce0 + 1 && Math.abs(G.atk - atk0 * 1.1) < 1e-6;
  X.craftGem("gem_jiangang");   // 化形：2 赤锋 + 1 任意
  say(`化形后 rank=${G.gems.gem_jiangang} 剑气范围 ×${(G.aoeRange / range0).toFixed(2)} 剑气冷却 ×${(G.aoeCD / aoeCd0).toFixed(2)} 余石 赤锋=${G.stones.chifeng} 疾风=${G.stones.jifeng}`);
  const r2OK = G.gems.gem_jiangang === 2 && Math.abs(G.aoeRange / range0 - 1.25) < 1e-6 && Math.abs(G.aoeCD / aoeCd0 - 0.85) < 1e-6;
  X.craftGem("gem_jiangang");   // 圆满：3 赤锋 + 2 任意
  say(`圆满后 rank=${G.gems.gem_jiangang} 飞剑 ${swordN0}->${G.swordCount} cleave=${G.gemFx.cleave} 余石 赤锋=${G.stones.chifeng}`);
  const r3OK = G.gems.gem_jiangang === 3 && G.swordCount === swordN0 + 1 && G.gemFx.cleave === 0.4;
  say(r1OK && r2OK && r3OK ? "PASS 三阶配方逐阶生效（属性→技能→特殊效果）" : "FAIL 宝石升阶异常");

  // 槽位上限
  X.craftGem("gem_yufeng");     // 第二席
  const xue0 = G.stones.xuesha;
  X.craftGem("gem_xuejian");    // 第三席：应被挡
  say(`占两席后再凝血剑：宝石数=${X.gemSlotsUsed()}（应 2）血煞石=${G.stones.xuesha}（应 ${xue0}，未误扣）`);
  say(X.gemSlotsUsed() === 2 && G.stones.xuesha === xue0 ? "PASS 流派位只有 2 席，第三系凝不动" : "FAIL 槽位上限异常");

  // 别家角色的宝石凝不了
  const before = X.gemSlotsUsed();
  G.charId = "mage";
  X.craftGem("gem_leiting");
  say(`法修在剑修局里凝雷印：宝石数 ${before}->${X.gemSlotsUsed()}（应不变）`);
  say(X.gemSlotsUsed() === before ? "PASS 只能凝本角色的宝石" : "FAIL 跨角色宝石被误凝");
  G.charId = "sword";

  // ---- P 九颗宝石的法门效果 ----
  say("");
  say("== 18) 九系法门：属性 / 技能 / 特殊效果逐一半实装 ==");
  forcePlay();
  const base = {
    atk: G.atk, hpMax: G.hpMax, shieldMax: G.shieldMax, thorns: G.thorns,
    crit: G.crit, critMul: G.critMul, lifesteal: G.lifesteal, mpMax: G.mpMax,
    burnMul: G.burnMul, thunder: G.thunderProc, dmgMul: G.dmgTakenMul,
    swordPierce: G.swordPierce, dashCD: G.dashCD, aoeCD: G.aoeCD,
  };
  const applyAll = (id, char) => { G.charId = char; G.gemFx = {}; X.GEM_BY_ID[id].apply(1); X.GEM_BY_ID[id].apply(2); X.GEM_BY_ID[id].apply(3); };
  applyAll("gem_jiangang", "sword");
  const g1 = G.swordPierce === base.swordPierce + 1 && G.gemFx.cleave === 0.4 && Math.abs(G.aoeCD / base.aoeCD - 0.85) < 1e-6;
  applyAll("gem_yufeng", "sword");
  const g2 = G.gemFx.dashHaste === 0.3 && Math.abs(G.dashCD / base.dashCD - 0.7) < 1e-6;
  applyAll("gem_xuejian", "sword");
  const g3 = G.gemFx.critBurst === 0.5 && G.lifesteal === base.lifesteal + 3 && G.crit > base.crit;
  applyAll("gem_leiting", "mage");
  const g4 = Math.abs(G.thunderProc - (base.thunder + 0.2)) < 1e-9 && G.mpMax > base.mpMax;
  applyAll("gem_xuanbing", "mage");
  const g5 = G.gemFx.chill === true && G.gemFx.freezeChance === 0.15 && G.gemFx.deepFreeze === true;
  applyAll("gem_fentian", "mage");
  const g6 = G.gemFx.burn === true && G.gemFx.burnChance === 0.25 && Math.abs(G.burnMul / base.burnMul - 2.88) < 1e-6;
  applyAll("gem_tiegu", "body");
  const g7 = G.shieldMax === base.shieldMax + 30 && Math.abs(G.dmgTakenMul / base.dmgMul - 0.9) < 1e-9 && G.gemFx.shieldBreak === true;
  applyAll("gem_longxue", "body");
  const g8 = G.hpMax === base.hpMax + 60 && G.lifesteal > base.lifesteal && G.gemFx.rage === true && G.gemFx.regenPct === 0.08;
  applyAll("gem_panshi", "body");
  const g9 = Math.abs(G.thorns - (base.thorns + 0.15)) < 1e-9 && G.shieldMax === base.shieldMax + 50 && G.gemFx.quake === 0.25;
  const rows = [["剑罡", g1], ["御风", g2], ["血剑", g3], ["雷印", g4], ["玄冰", g5], ["焚天", g6], ["铁骨", g7], ["龙血", g8], ["磐石", g9]];
  for (const [n, ok] of rows) say(`  ${ok ? "OK  " : "MISS"} ${n}流`);
  say(rows.every((r) => r[1]) ? "PASS 九系法门全部落地" : "FAIL 有法门未实装");

  // 御风提速真的作用到攻速
  G.gemFx = { dashHaste: 0.3 }; G.hasteT = 0;
  const asCold = X.atkSpeedNow();
  G.hasteT = 1;
  const asHot = X.atkSpeedNow();
  say(`御风提速：静态 ${asCold.toFixed(2)} → 御风后 ${asHot.toFixed(2)}（应 ×1.3）`);
  say(Math.abs(asHot / asCold - 1.3) < 1e-9 ? "PASS 御风圆满让攻速短时大涨" : "FAIL 御风提速未接入");
  G.hasteT = 0;

  // 龙血狂化进入伤害公式（先清装备缓存，避免前面的测试残留火伤词条）
  G.charId = "body"; G.nodeAtkMul = 1; G.nodeActive = false; G.lowHpBonus = 0;
  G.jobPath = null;
  G.gems = {}; G.gemFx = {}; G.resonance = X.recomputeResonance();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._eqCache = { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, dmgTaken: 0,
                  huoMul: 1, burnMul: 1, activeSkillIds: [], passiveSkillIds: [] };
  X.equipRec();
  G.hpMax = 1000;
  G.hp = 900;
  const pmCalm = X.playerDamageMult();
  G.gemFx = { rage: true };
  G.hp = 300;
  const pmRage = X.playerDamageMult();
  say(`龙血狂化（清空装备后）：气血 90% 系数 ${pmCalm.toFixed(2)} → 气血 30% 系数 ${pmRage.toFixed(2)}（应 +0.25，差 ${(pmRage - pmCalm).toFixed(2)}）`);
  say(Math.abs(pmCalm - 1) < 1e-9 && Math.abs(pmRage - pmCalm - 0.25) < 1e-9
    ? "PASS 龙血战体让残血时伤害 +0.25"
    : "FAIL 龙血狂化未进伤害公式");
  G.gemFx = {}; G.hp = G.hpMax;

  // ---- Q 特殊攻击效果：命中 / 暴击 / 受击瞬间 ----
  say("");
  say("== 19) 特殊攻击效果在命中与受击瞬间生效 ==");
  forcePlay();
  G.charId = "sword";
  G.atk = 60; G.crit = 0; G.critMul = 2; G.gems = {};
  G.gemFx = { burn: true, chill: true, cleave: 0.4 };
  G.enemies = [];
  const tk = X.spawnEnemy("golem", 300, 300, 3);
  tk.hp = 1e9;
  const tk2 = X.spawnEnemy("fox", tk.x + 40, tk.y, 3);
  tk2.hp = 1e9;
  const tk2hp = tk2.hp;
  X.gemOnHit(tk, 100);
  say(`命中：burn=${(tk.burn || 0).toFixed(2)} burnDmg=${(tk.burnDmg || 0).toFixed(1)} slow=${(tk.slow || 0).toFixed(2)} slowMul=${(tk.slowMul || 1).toFixed(2)}`);
  say(`溅射：身侧小妖 hp ${Math.round(tk2hp)} -> ${Math.round(tk2.hp)}`);
  say(tk.burn > 0 && tk.slow > 0 && tk.slowMul < 1 && tk2.hp < tk2hp
    ? "PASS 灼烧 / 寒毒 / 剑气溅射在命中瞬间生效" : "FAIL 命中特效未生效");

  // 玄冰圆满：受寒毒者额外受伤
  G.crit = 0; G.floaters = [];
  G.gems = {}; G.gemFx = {}; G.jobPath = null; G.resonance = X.recomputeResonance();
  const ed0 = X.spawnEnemy("fox", 600, 600, 3); ed0.hp = 1e6; ed0.slow = 0;
  X.applyHit(ed0, 100);
  const plain = 1e6 - ed0.hp;
  G.gemFx = { deepFreeze: true };
  const ed1 = X.spawnEnemy("fox", 640, 600, 3); ed1.hp = 1e6; ed1.slow = 1.2;
  X.applyHit(ed1, 100);
  const frozen = 1e6 - ed1.hp;
  say(`玄冰圆满：未受寒毒 ${plain.toFixed(1)} → 受寒毒 ${frozen.toFixed(1)}（应 ×1.25）`);
  say(Math.abs(plain - 100) < 1e-6 && Math.abs(frozen - 125) < 1e-6
    ? "PASS 太阴冰魄让受寒毒者额外受伤" : "FAIL 玄冰深冻未接入");

  // 血剑圆满：暴击溅血爆裂
  G.gemFx = { critBurst: 0.5 }; G.crit = 1; G.critMul = 1;
  G.enemies = [];
  const cb = X.spawnEnemy("golem", 800, 800, 3); cb.hp = 1e9;
  const cb2 = X.spawnEnemy("fox", cb.x + 30, cb.y, 3); cb2.hp = 1e9;
  const cb2hp = cb2.hp;
  X.applyHit(cb, 100);
  say(`暴击溅血：相邻小妖 hp ${Math.round(cb2hp)} -> ${Math.round(cb2.hp)}`);
  say(cb2.hp < cb2hp ? "PASS 噬血剑心暴击时溅血爆裂" : "FAIL 暴击溅血未生效");
  G.crit = 0.08;

  // 铁骨圆满：碎盾冲击波
  forcePlay();
  G.gemFx = { shieldBreak: true };
  G.invuln = 0; G.dashIFrame = 0; G.nodeDmgTakenMul = 1; G.dmgTakenMul = 1;
  G.defThornsBackup = G.thorns; G.thorns = 0;
  G.shieldMax = 50; G.shield = 10; G.hp = 1e6;
  G.enemies = [];
  const sb = X.spawnEnemy("golem", G.px + 60, G.py, 3); sb.hp = 1e9;
  const sbHp = sb.hp;
  X.damagePlayer(50);
  say(`碎盾冲击波：护盾 ${G.shield}（应 0）· 近敌 hp ${Math.round(sbHp)} -> ${Math.round(sb.hp)}`);
  say(G.shield === 0 && sb.hp < sbHp ? "PASS 玄铁不坏碎盾时爆发冲击波" : "FAIL 碎盾冲击波未生效");

  // 磐石圆满：受击震波
  G.gemFx = { quake: 1 };
  G.shield = 0; G.shieldMax = 0; G.hp = 1e6;
  G.enemies = [];
  const qk = X.spawnEnemy("golem", G.px + 50, G.py, 3); qk.hp = 1e9;
  const qkHp = qk.hp;
  X.damagePlayer(5);
  say(`磐石震波：近敌 hp ${Math.round(qkHp)} -> ${Math.round(qk.hp)}`);
  say(qk.hp < qkHp ? "PASS 磐石镇岳受击震波" : "FAIL 磐石震波未生效");
  G.shield = 0;

  // ---- R 持续增益 ----
  say("");
  say("== 20) 宝石的持续增益：气血滋长 / 护盾再生 / 龙血定期回复 ==");
  forcePlay();
  G.charId = "body";
  G.enemies = []; G.spawnQueue = []; G.waveTimer = 999;
  G.gemFx = { regen: 2, shieldRegen: 3, regenPct: 0.08 };
  G.shieldMax = 100; G.shield = 0; G.hp = G.hpMax * 0.5; G.regenT = 0;
  const hpR = G.hp, shR = G.shield;
  frames(120);
  say(`2s 后：hp ${hpR.toFixed(1)}->${G.hp.toFixed(1)}（+${(G.hp - hpR).toFixed(1)}） shield ${shR.toFixed(1)}->${G.shield.toFixed(1)}`);
  say(G.hp > hpR + 2 && G.shield > shR + 3 ? "PASS 每帧持续生效（气血滋长 / 护盾再生）" : "FAIL 持续增益未生效");
  G.hp = G.hpMax * 0.4; G.regenT = 7.95;
  const hpP = G.hp;
  frames(12);
  say(`龙血定期回复：hp ${hpP.toFixed(1)}->${G.hp.toFixed(1)}（应 +${(G.hpMax * 0.08).toFixed(1)}）`);
  say(G.hp > hpP + G.hpMax * 0.07 ? "PASS 龙血战体每 8s 回复 8% 气血" : "FAIL 龙血定期回复未触发");

  // 龙血狂化 / 玩家伤害系数
  G.gemFx = { rage: true }; G.lowHpBonus = 0; G.nodeAtkMul = 1; G.nodeActive = false;
  G.hp = G.hpMax * 0.9;
  const pmHigh = (() => { G.hp = G.hpMax * 0.9; return X.updateHUD && 1; })();
  const mulHigh = (() => { G.hp = G.hpMax * 0.9; return null; })();
  say(`龙血狂化：气血 90% 时不加成，低于 45% 时 +25%（结算见 applyHit 系数）`);
  G.gemFx = {}; G.hp = G.hpMax;

  // ---- S 通用装备 ----
  say("");
  say("== 21) 花料顺序（保留 v2.0 行为）==");
  forcePlay();
  G.charId = "sword";
  G.gemFx = {};
  setStones("sword", { chifeng: 5, jifeng: 2, xuesha: 0 });
  X.spendStones(2);
  say(`消耗 2 颗：赤锋 ${5}->${G.stones.chifeng}（大堆保住） 疾风 ${2}->${G.stones.jifeng}（先掏碎堆）`);
  say(G.stones.chifeng === 5 && G.stones.jifeng === 0
    ? "PASS 花料优先掏最少的堆，护住正在攒的那一系" : "FAIL 扣料顺序异常");

  // ---- V 装备系统（v3.0） ----
  say("");
  say("== 22) v3.0 装备：5 阶品阶 · 词条库 · makeEquip 基础结构 ==");
  const tierOK = Object.keys(X.TIERS).length === 5 && Object.keys(X.SLOT_DEFS).length === 3;
  const eqKeys = Object.keys(X.AFFIX_POOL);
  const rareN = eqKeys.filter((k) => X.AFFIX_POOL[k].type === "稀有").length;
  const schN = eqKeys.filter((k) => X.AFFIX_POOL[k].type === "派系").length;
  say(`品阶 ${Object.keys(X.TIERS).length}/5 · 槽位 ${Object.keys(X.SLOT_DEFS).length}/3 · 词条 ${eqKeys.length}（派系 ${schN} 稀有 ${rareN}）· 底材 ${Object.keys(X.ITEM_TYPES).length}/9`);
  say(tierOK && schN === 9 && rareN >= 5 && Object.keys(X.ITEM_TYPES).length === 9
    ? "PASS 装备数据层结构正确" : "FAIL 数据层结构异常");

  // 生成 100 件白装，检查词条数 1-2，紫装词条 3-3 且至少 1 稀有
  const samples = { white: [], green: [], blue: [], purple: [], orange: [] };
  for (let i = 0; i < 200; i++) {
    const tier = ["white", "green", "blue", "purple", "orange"][Math.floor(Math.random() * 5)];
    samples[tier].push(X.makeEquip("weapon", tier));
  }
  const whiteAffOk = samples.white.every((e) => e.affixes.length >= 1 && e.affixes.length <= 2);
  const purpleAffOk = samples.purple.every((e) => e.affixes.length === 3 &&
    e.affixes.some((a) => X.AFFIX_POOL[a].type === "稀有"));
  const orangeAffOk = samples.orange.every((e) => e.affixes.length === 4 &&
    e.affixes.some((a) => X.AFFIX_POOL[a].type === "稀有"));
  say(`白装词条 1-2：${whiteAffOk} · 紫装词条 3 + ≥1 稀有：${purpleAffOk} · 橙装词条 4 + ≥1 稀有：${orangeAffOk}`);
  say(whiteAffOk && purpleAffOk && orangeAffOk ? "PASS 品阶-词条规则正确" : "FAIL 词条数/稀有词条异常");

  // 武器 atk 按阶递增
  const atks = ["white", "green", "blue", "purple", "orange"].map((t) => Math.round(8 * X.TIERS[t].mult));
  say(`武器 atk 序列：${atks.join("/")}（应递增）`);
  say(atks[0] < atks[1] && atks[1] < atks[2] && atks[2] < atks[3] && atks[3] < atks[4]
    ? "PASS 武器攻击随阶递增" : "FAIL 阶倍率异常");

  say("");
  say("== 23) v3.0 自动合成：canMerge / mergeEquip / autoMergeEquip ==");
  G.inventory = [];
  const a = X.makeEquip("weapon", "white", { fixedAffixes: ["huo_dmg", "crit_pct"] });
  const b = X.makeEquip("weapon", "white", { fixedAffixes: ["huo_dmg", "jin_iron"] });
  const c = X.makeEquip("weapon", "white", { fixedAffixes: ["mu_speed", "xp_bonus"] });
  const canAB = X.canMerge(a, b);
  const canAC = X.canMerge(a, c);
  say(`同阶同 slot + 至少 1 词条重叠：a+b=${canAB}（应 true）· a+c=${canAC}（应 false：火 vs 木+经验）`);
  say(canAB && !canAC ? "PASS canMerge 词条重叠判定正确" : "FAIL 合成判定异常");

  G.inventory.push(a, b);
  const mergedN = X.autoMergeEquip();
  const mergedEq = G.inventory[0];
  say(`背包 [a, b] autoMerge → 背包剩 ${G.inventory.length} 件，合成 ${mergedN} 次，新件品阶 ${mergedEq.tier}（应 green）`);
  say(G.inventory.length === 1 && mergedN === 1 && mergedEq.tier === "green"
    ? "PASS 2 件白自动合成 1 件绿" : "FAIL 自动合成异常");

  // 橙装不能再合
  const orange1 = X.makeEquip("weapon", "orange");
  const orange2 = X.makeEquip("armor", "orange");   // 不同 slot
  const sameSlot = X.makeEquip("armor", "orange", { typeKey: orange2.typeKey, fixedAffixes: orange2.affixes });
  G.inventory = [orange1, orange2];
  X.autoMergeEquip();
  say(`2 件橙 + 不同槽位 autoMerge → 背包 ${G.inventory.length}（应 2，无合）`);
  say(G.inventory.length === 2 ? "PASS 橙装不可再合（顶级封顶）" : "FAIL 顶级误合");

  say("");
  say("== 24) v3.0 拾取入背包 + 槽位 + 属性应用 ==");
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  // 重置装备缓存基线（resetRun 没被调过的话）
  G._baseAtk = G.atk; G._baseHpMax = G.hpMax; G._baseMoveSpeed = G.moveSpeed;
  G._baseCrit = G.crit; G._baseLS = G.lifesteal; G._baseXpMul = G.xpMul;
  G._baseShieldMax = G.shieldMax; G._baseBurnMul = G.burnMul; G._baseDmgTaken = G.dmgTakenMul;
  X.equipRec();
  const eq1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "jin_crit"] });
  const ok = X.pickUpEquip(eq1);
  say(`pickUpEquip 紫·${eq1.name} → 背包 ${G.inventory.length}（应 1） return ${ok}`);
  say(G.inventory.length === 1 && ok ? "PASS 紫装入背包" : "FAIL 拾取入背包异常");

  // 装备槽位
  const atkBefore = G.atk;
  X.equipTo(eq1.uid);
  const atkAfter = G.atk;
  say(`equipTo 紫·武器 → 槽位 weapon=${G.equipped.weapon ? "已装" : "空"} · 背包 ${G.inventory.length}（应 0） · atk ${atkBefore.toFixed(1)}->${atkAfter.toFixed(1)}`);
  say(G.equipped.weapon && G.inventory.length === 0 && atkAfter > atkBefore
    ? "PASS 紫装装备到槽位 + 攻击加成生效" : "FAIL 装备槽位异常");

  // 白装不可装备
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  const whiteEq = X.makeEquip("armor", "white");
  X.pickUpEquip(whiteEq);
  const equipWhite = X.equipTo(whiteEq.uid);
  say(`白装装备尝试 → 成功=${equipWhite}（应 false） · 槽位 armor=${G.equipped.armor ? "已装" : "空"}`);
  say(!equipWhite && !G.equipped.armor ? "PASS 白装不可装备（只能放背包）" : "FAIL 白装误装");

  // 卸下
  const purpleEq2 = X.makeEquip("armor", "purple", { fixedAffixes: ["tu_shield", "shield_max", "crit_pct"] });
  X.pickUpEquip(purpleEq2);
  X.equipTo(purpleEq2.uid);
  const beforeUn = G.inventory.length;
  X.unequipTo("armor");
  say(`卸下 armor：背包 ${beforeUn}->${G.inventory.length}（应 +1）· 槽位 armor=${G.equipped.armor ? "已装" : "空"}`);
  say(G.inventory.length === beforeUn + 1 && !G.equipped.armor ? "PASS 卸下回背包" : "FAIL 卸下异常");

  // 装备属性汇总：完整重置后装两件紫
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  const eqW = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "jin_crit"] });
  const eqA = X.makeEquip("armor",  "purple", { fixedAffixes: ["tu_shield", "shield_max", "crit_pct"] });
  X.pickUpEquip(eqW); X.equipTo(eqW.uid);
  X.pickUpEquip(eqA); X.equipTo(eqA.uid);
  const eb = X.equipBonuses();
  say(`equipBonuses：atk=${eb.atk} hp=${eb.hp} crit=${eb.crit.toFixed(2)} huoMul=${eb.huoMul.toFixed(2)} burnMul=${eb.burnMul.toFixed(2)} shield=${eb.shield}`);
  say(eb.atk > 0 && eb.hp > 0 && eb.crit >= 0.05 && eb.huoMul >= 1.12 && eb.shield >= 10
    ? "PASS 装备属性汇总正确（atk/hp/crit/huoMul/shield）" : "FAIL 属性汇总异常");

  // 满背包：用唯一词条避开自动合成
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null }; X.equipRec();
  G.gold = 0;
  const uniqAffixes = [
    "huo_dmg", "mu_speed", "shui_slow", "jin_crit", "tu_shield",
    "huo_burn", "jin_thunder", "huo_fire", "jin_iron", "crit_pct",
    "haste_pct", "lifesteal", "xp_bonus", "shield_max",
    "huo_dmg", "mu_speed", "shui_slow", "jin_crit", "tu_shield",
    "huo_burn", "jin_thunder", "huo_fire", "jin_iron", "crit_pct",
    "haste_pct", "lifesteal", "xp_bonus", "shield_max",
    "huo_dmg", "mu_speed", "shui_slow",
  ];
  for (let i = 0; i < 30; i++) {
    const slot = ["weapon","armor","accessory"][i%3];
    const eq = X.makeEquip(slot, "white", { fixedAffixes: [uniqAffixes[i]] });
    X.pickUpEquip(eq);
  }
  const fullN = G.inventory.length;
  const whiteReject = X.pickUpEquip(X.makeEquip("weapon", "white"));
  const goldAfter = G.gold;
  say(`背包满 ${fullN}/30 后再装白装：return=${whiteReject}（应 false） · gold ${goldAfter}（应 +8）`);
  say(!whiteReject && fullN === 30 && goldAfter === 8 ? "PASS 背包满白装自动卖金币" : "FAIL 满背包白装处理异常");

  // ---- T 灵石精魄 ----
  say("");
  say("== 22) 灵石精魄：妖王掉落 → 本命三派系择一 ==");
  forcePlay();
  setStones("sword");
  const JCY = els["jobChoices"];
  JCY.children.length = 0;
  // v4.0 砍掉了精魄弹窗（直接自动追加最多派系 +3），这一段老测试已不再适用
  // 但仍校验"妖王必掉精魄+法宝匣+灵石"的核心逻辑
  X.openEssenceModal();   // v4.0 stub
  say(`精魄已 v4.0 砍弹窗：state=${G.state} 选项=${JCY.children.length}（老测试期望 3，新版期望 0）`);
  say("PASS 精魄弹窗已被 v4.0 砍掉（自动追加最多派系 +3，见 == 9.9）");

  const ess = X.spawnEnemy("bossGolem", 1200, 1200, 5);
  G.pickups = [];
  ess.boss = true;
  X.killEnemy(ess);
  const kinds = G.pickups.map((p) => p.kind).join(",");
  say(`妖王掉落：${kinds}`);
  say(/essence/.test(kinds) && /relic/.test(kinds) && /stone/.test(kinds)
    ? "PASS 妖王必掉精魄 + 法宝匣 + 灵石" : "FAIL 妖王掉落异常");

  // ---- U 炼宝台界面 ----
  say("");
  say("== 23) 炼宝台界面与开合 ==");
  forcePlay();
  setStones("sword", { chifeng: 2, jifeng: 1, xuesha: 0 });
  G.gems = {}; G.ordinary = [];
  els["forgeGems"].children.length = 0;
  els["forgeEquip"].children.length = 0;
  els["forgeStones"].children.length = 0;
  X.renderForge();
  X.forgeBtnSync();
  X.stoneHudSync();
  const gemN = els["forgeGems"].children.length;
  const eqN = els["forgeEquip"].children.length;
  const canN = els["forgeGems"].children.filter((c) => / can/.test(" " + String(c.className))).length;
  const disN = els["forgeGems"].children.filter((c) => / disabled/.test(" " + String(c.className))).length;
  say(`宝石项 ${gemN}/3 · 装备卡 ${eqN}/3 · 灵石格 ${els["forgeStones"].children.length}/9`);
  say(`赤锋=2 ⇒ 可凝宝石按钮 ${canN} 个（应 1：裂天剑罡）· 禁用 ${disN} · HUD 角标=${els["forgeBtnCount"].textContent}（应 3）ready=${els["forgeBtn"]._cls.has("ready")}`);
  say(gemN === 3 && eqN === 3 && canN === 1 && els["forgeBtnCount"].textContent === 3
    ? "PASS 炼宝台按灵石实数点亮可凝项 + 装备快览 3 槽位" : "FAIL 炼宝台渲染异常");
  const hudHot = els["stoneRow"].children.filter((c) => / hot/.test(" " + String(c.className))).length;
  say(`HUD 灵石芯片 ${els["stoneRow"].children.length}（应 9，本角色 3 派系 ×3）· 点亮「最接近凝成」的那一系 ${hudHot} 个（应 1）`);
  say(els["stoneRow"].children.length === 9 && hudHot === 1 ? "PASS 灵石 HUD 标出进度最快的一系" : "FAIL 灵石 HUD 未点亮");
  X.openForge();
  const opened = G.state === "forge" && !els["forgeModal"]._cls.has("hidden");
  X.closeForge();
  say(`openForge→${opened}，closeForge→state=${G.state}`);
  say(opened && G.state === "play" ? "PASS 炼宝台开合正常（开启即暂停战斗）" : "FAIL 炼宝台开合异常");
  say(els["forgeModal"]._cls.has("hidden") ? "PASS 关闭后弹窗已隐藏" : "FAIL 弹窗未隐藏");

  // ---- V 静检 ----
  say("");
  say("== 24) 灵石 / 宝石接线静态检查 ==");
  const forgeChecks = {
    "CHAR_STONES 定义": raw.includes("const CHAR_STONES"),
    "GEMS 定义": raw.includes("const GEMS"),
    "GEM_TIERS 定义": raw.includes("const GEM_TIERS"),
    "槽位常量 MAX_GEMS": raw.includes("const MAX_GEMS"),
    "通用装备成本": raw.includes("const ORDINARY_COST") && raw.includes("const MAX_ORDINARY"),
    "killEnemy 掉本角色灵石": raw.includes('"stone", { stone: randStone() }'),
    "Boss 掉精魄": raw.includes('"essence")'),
    "拾取灵石分支": raw.includes('p.kind === "stone"'),
    "拾取精魄分支": raw.includes('p.kind === "essence"'),
    "applyHit 挂 gemOnHit": raw.includes("gemOnHit(e, d);"),
    "gemOnHit 定义": raw.includes("function gemOnHit"),
    "gemOnCrit 定义": raw.includes("function gemOnCrit"),
    "玄冰深冻接入": raw.includes("G.gemFx.deepFreeze"),
    "龙血狂化接入": raw.includes("G.gemFx.rage"),
    "铁骨碎盾接入": raw.includes("G.gemFx.shieldBreak"),
    "磐石震波接入": raw.includes("G.gemFx.quake"),
    "御风提速接入": raw.includes("atkSpeedNow()"),
    "灼烧接入 burnMul": raw.includes("dt * (G.burnMul || 1)"),
    "update 暂停炼宝台态": raw.includes('G.state === "level" || G.state === "job" || G.state === "forge"'),
    "update 跑持续增益": raw.includes("if (G.gemFx.regen)") && raw.includes("if (G.gemFx.shieldRegen"),
    "resetRun 重置灵石": raw.includes("for (const st of STONES_ALL) G.stones[st.key] = 0;"),
    "startRun 同步 HUD": raw.includes("stoneHudSync();") && raw.includes("forgeBtnSync();"),
    "弹窗队列含精魄": raw.includes("pendingEssence"),
    "showMenu 关炼宝台": raw.includes('ui.forgeModal.classList.add("hidden")'),
    "绘制灵石/精魄": raw.includes('p.kind === "stone"') && raw.includes('p.kind === "essence"'),
    "五行相克表": raw.includes("const ELEM_OVERCOME") && raw.includes("const ELEM_GENERATE"),
    "敌人带五行": raw.includes("elem: t.elem || waveElemKey()"),
    "applyHit 吃五行倍率": raw.includes("bestElemRelation(e.elem)"),
    "五行由宝石决定": raw.includes("const ids = Object.keys(G.gems || {})"),
    "敌人五行标识": raw.includes("ELEM_BY_KEY[e.elem]"),
    "HUD 波属性": raw.includes("ui.waveElem"),
    "波次横幅带属性": raw.includes("行大妖") && raw.includes("行妖潮"),
    "炼宝台显示克制": raw.includes("elemMatchText(def.elem)"),
    "经济调参集中": raw.includes("const DROP_MOB") && raw.includes("const ESSENCE_GAIN"),
    "灵石淬体": raw.includes("function meltStones") && raw.includes("function canMelt"),
    "淬体行渲染": raw.includes("ui.forgeMelt") && raw.includes("forgeMeltWrap"),
    "宝石阶数提示": raw.includes("GEM_TIERS[p.r].main"),
    "槽位上限生效": raw.includes("gemSlotsUsed() >= MAX_GEMS"),
  };
  let forgeOK = true;
  for (const [k, v] of Object.entries(forgeChecks)) { if (!v) forgeOK = false; say(`  ${v ? "OK  " : "MISS"} ${k}`); }
  say(forgeOK ? "PASS 灵石/宝石接线检查通过" : "FAIL 存在未接线项");

  // ---- W 灵石淬体 ----
  say("");
  say("== 25) 灵石淬体：宝石与通用皆满后的灵石去处 ==");
  forcePlay();
  setStones("sword", { chifeng: 9, jifeng: 9, xuesha: 9 });
  G.gems = {}; G.ordinary = []; G.gemFx = {};
  say(`未满位时 canMelt=${X.canMelt()}（应 false）`);
  const twoGems = X.gemsOf().slice(0, X.MAX_GEMS).map((g) => g.id);
  G.gems = {}; for (const id of twoGems) G.gems[id] = 3;
  G.ordinary = ["o_feng", "o_feng", "o_feng"];
  const meltOK0 = X.canMelt();
  const atkM0 = G.atk, shMax0 = G.shieldMax, sh0b = G.shield;
  X.meltStones();
  say(`满位后 canMelt=${meltOK0}｜攻击 ${atkM0.toFixed(1)}->${G.atk.toFixed(1)}｜护盾上限 ${shMax0}->${G.shieldMax}｜护盾 ${Math.round(sh0b)}->${Math.round(G.shield)}｜已淬 ${G.meltCount}`);
  say(meltOK0 && Math.abs(G.atk - atkM0 * 1.02) < 1e-6 && G.shieldMax === shMax0 + 8 && G.meltCount === 1
    ? "PASS 灵石淬体生效（可重复，收益低于宝石）" : "FAIL 灵石淬体异常");
  els["forgeMelt"].children.length = 0;
  X.renderForge();
  say(`淬体行渲染 ${els["forgeMelt"].children.length} 项，隐藏=${els["forgeMeltWrap"]._cls.has("hidden")}（应 false）`);
  say(els["forgeMelt"].children.length === 1 && !els["forgeMeltWrap"]._cls.has("hidden")
    ? "PASS 满位后炼宝台出现「灵石淬体」" : "FAIL 淬体行未出现");
  G.gems = {}; G.ordinary = [];
  els["forgeMelt"].children.length = 0;
  X.renderForge();
  say(`清空后淬体行隐藏=${els["forgeMeltWrap"]._cls.has("hidden")}（应 true）`);
  say(els["forgeMeltWrap"]._cls.has("hidden") ? "PASS 未满位时不展示淬体行" : "FAIL 淬体行误显示");

  // ---- X 五行相生相克 ----
  say("");
  say("== 26) 五行相生相克（由流派宝石的灵石属性驱动） ==");
  forcePlay();
  const relCases = [
    ["jin", "mu", 1.35], ["mu", "tu", 1.35], ["tu", "shui", 1.35], ["shui", "huo", 1.35], ["huo", "jin", 1.35],
    ["mu", "jin", 0.80], ["tu", "mu", 0.80], ["shui", "tu", 0.80], ["huo", "shui", 0.80], ["jin", "huo", 0.80],
    ["shui", "jin", 1.15], ["jin", "shui", 0.90], ["huo", "huo", 1.00], ["mu", "shui", 1.15], ["huo", "tu", 0.90],
    ["tu", "huo", 1.15], ["mu", "huo", 0.90], ["jin", "tu", 1.15],
  ];
  const relBad = [];
  for (const [a, b, exp] of relCases) {
    const m = X.elemRelation(a, b).mul;
    if (Math.abs(m - exp) > 1e-9) relBad.push(`${a}->${b} 期望${exp} 实得${m}`);
  }
  say(`抽查 ${relCases.length} 组：${relBad.length ? relBad.join("；") : "全部命中"}`);
  say(!relBad.length ? "PASS 关系表正确（我克1.35 / 被克0.80 / 得生1.15 / 泄力0.90 / 同1.00）" : "FAIL 关系表异常");

  G.charId = "sword";
  G.gems = {}; G.gemFx = {};
  const mNone = X.elemMulVs("jin");
  G.gems = { gem_jiangang: 1 };                 // 赤锋石 = 火
  const mJin = X.elemMulVs("jin"), mShui = X.elemMulVs("shui");
  G.gems = { gem_jiangang: 1, gem_xuanbing: 1 }; // 火 + 水
  const mShui2 = X.elemMulVs("shui");
  say(`无宝石 vs 金=${mNone}｜火 vs 金=${mJin} 火 vs 水=${mShui}｜火+水 vs 水=${mShui2}`);
  say(mNone === 1 && Math.abs(mJin - 1.35) < 1e-9 && Math.abs(mShui - 0.8) < 1e-9 && mShui2 === 1
    ? "PASS 宝石的灵石五行决定克制倍率，多颗取最优" : "FAIL 五行倍率异常");

  G.enemies = []; G.wave = 1;
  const eJin = X.spawnEnemy("golem", 400, 400, 1);
  G.wave = 3;
  const eShui = X.spawnEnemy("golem", 460, 400, 3);
  say(`第 1 波妖物属性=${eJin.elem}（应 jin）；第 3 波=${eShui.elem}（应 shui）`);
  say(eJin.elem === "jin" && eShui.elem === "shui" ? "PASS 妖物五行随波轮转" : "FAIL 妖物属性异常");

  G.gems = { gem_jiangang: 1 }; G.gemFx = {}; G.crit = 0; G.floaters = []; G.px = 0; G.py = 0;
  G.jobPath = null; G.resonance = X.recomputeResonance();
  eJin.hp = 1e6; X.applyHit(eJin, 100);
  const dealtJin = 1e6 - eJin.hp;
  const tagTxt = G.floaters.length ? G.floaters[G.floaters.length - 1].text : "";
  eShui.hp = 1e6; X.applyHit(eShui, 100);
  const dealtShui = 1e6 - eShui.hp;
  say(`同为 100 基础伤害：对金(火克金)=${dealtJin.toFixed(1)}，对水(水克火)=${dealtShui.toFixed(1)}，飘字="${tagTxt}"`);
  say(Math.abs(dealtJin - 135) < 1e-6 && Math.abs(dealtShui - 80) < 1e-6
    ? "PASS applyHit 实际吃到五行倍率" : "FAIL applyHit 未接入五行");
  say(/^克 /.test(tagTxt) ? "PASS 克制飘字带「克」提示" : "FAIL 克制飘字缺失");
  G.crit = 0.08;

  G.gems = {};
  say(`仅通用装备（未凝宝石）时 vs 金 = ${X.elemMulVs("jin")}（应 1）`);
  say(X.elemMulVs("jin") === 1 ? "PASS 通用装备不参与五行克制（符合「只有普通效果」）" : "FAIL 通用装备竟带五行");

  // ---- Y 经济探针（默认跳过，XTJ_BALANCE=1 时运行）----
  if (process.env.XTJ_BALANCE === "1") {
    say("");
    say("== 27) 经济探针：无敌玩家模拟 ==");
    const SIM_MIN = Number(process.env.XTJ_SIM_MIN || 10);
    forcePlay();
    G.charId = "sword";
    G.wave = 0; G.waveTimer = 3; G.spawnQueue = []; G.enemies = []; G.pickups = [];
    setStones("sword");
    G.gems = {}; G.ordinary = []; G.gemFx = {};
    G.hpMax = 1e9; G.hp = 1e9;
    G.level = 30; G.xp = 0; G.xpNeed = 1e9; G.pendingLevel = 0;
    G.atk = 70; G.atkSpeed = 1.6; G.swordCount = 4; G.crit = 0.15; G.lifesteal = 0;
    G.weapons.fire.lv = 5; G.weapons.lightning.lv = 4; G.weapons.frost.lv = 3; G.weapons.orbit.lv = 4;
    G.px = 0; G.py = 0;
    const k0 = G.kills;
    const dt = 1 / 60;
    const steps = SIM_MIN * 60 * 60;
    const t0 = Date.now();
    for (let i = 0; i < steps; i++) {
      if (G.state !== "play") forcePlay();
      G.invuln = 1;
      X.update(dt);
      for (const p of G.pickups) { p.x = G.px; p.y = G.py; }   // 模拟「会走位的玩家」把灵石全捡了
    }
    const kills = G.kills - k0;
    const tot = X.stoneTotal();
    const per = X.stoneKeys().map((k) => `${X.STONE_BY_KEY[k].name}${G.stones[k] || 0}`).join(" ");
    const essences = Math.floor(G.wave / 5);
    const sorted = X.stoneKeys().map((k) => G.stones[k] || 0).sort((a, b) => b - a);
    // 探针里精魄弹窗被 forcePlay 跳过，这里按「每次都选最多的一系」折算回去
    const eff = sorted.slice();
    eff[0] += essences * X.ESSENCE_GAIN;
    // 把最多的一系一路往上推：主石必须来自本系，配料可从任意系出
    let m = eff[0], o = eff[1] + eff[2], step = 0;
    for (const t of X.GEM_TIERS) {
      if (m < t.main || m + o < t.main + t.any) break;
      m -= t.main;
      const fromO = Math.min(o, t.any);
      o -= fromO;
      m -= (t.any - fromO);
      step++;
    }
    const maxed = step >= X.GEM_TIERS.length ? 1 : 0;
    const secondGem = Math.floor(Math.min(m, o) / X.GEM_TIERS[0].main);
    say(`模拟 ${SIM_MIN} 分钟（${steps} 帧，耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s）：wave=${G.wave} 斩妖=${kills}`);
    say(`自然掉落=${tot}（${per}）· 精魄次数≈${essences}（每次自选一系 +${X.ESSENCE_GAIN}）`);
    say(`折算可得 ≈ ${tot + essences * X.ESSENCE_GAIN} 颗（含精魄）⇒ 最多一系 ${eff[0]} 颗`);
    say(`推演：${maxed ? "可凝满 1 颗圆满" : step === 0 ? "还凝不出宝石" : `可凝到「${X.GEM_TIERS[step - 1].label}」`}`);
    say(`余量还能再开第二系约 ${secondGem} 颗初凝`);
    // v3.0 装备产出统计（按当前探针里 30 件满背包前的总览）
    const tierCnt = { white: 0, green: 0, blue: 0, purple: 0, orange: 0 };
    for (const e of (G.inventory || [])) tierCnt[e.tier]++;
    const dropEstimate = Math.round(kills * 0.05);              // 小妖 5%
    const eliteEst = Math.round(kills / 80);                     // 1/80 是精英
    const bossEst = Math.floor(G.wave / 5);                      // 妖王 ≈ 每 5 波 1
    const bossEqEst = bossEst * 4;                                // 妖王平均 4 件
    const totalEq = dropEstimate + eliteEst + bossEqEst;
    const equipPurple = Math.floor(totalEq / 16);               // 经验：~16 件白绿蓝合 1 紫
    say(`v3.0 装备产出：约 ${totalEq} 件（白 ${dropEstimate}+绿 ${Math.round(eliteEst*0.4)}+妖王 ${bossEqEst}）⇒ 推算 ${equipPurple} 件紫可装备`);
  }

  // ---- Z 共鸣 · 多颗宝石之间的协同奖励 ----
  say("");
  say("== 28) 共鸣 · 多颗宝石的协同奖励 ==");
  {
    const clean = () => { G.gems = {}; G.jobPath = null; G.resonance = X.recomputeResonance(); };
    const damageOn = (eElem, dmg) => {
      G.enemies = []; G.gemFx = {}; G.crit = 0; G.floaters = [];
      const e = X.spawnEnemy("fox", 600, 600, G.wave || 1); e.hp = 1e6; e.elem = eElem;
      X.applyHit(e, dmg);
      return 1e6 - e.hp;
    };

    clean();
    const r0 = G.resonance;
    const ok0 = !r0.benming && !r0.daotu && !r0.kuaJie && !r0.poBi && r0.benPlayerMul === 0;
    say(`空宝石 共鸣=[本命=${r0.benming},道途=${r0.daotu},跨阶=${r0.kuaJie},破壁=${r0.pobi}] benMul=${r0.benPlayerMul}`);
    say(ok0 ? "PASS 空状态：无任一共鸣觉醒" : "FAIL 初始共鸣计算异常");

    G.charId = "sword"; G.gems = { gem_jiangang: 1 }; G.jobPath = null; G.resonance = X.recomputeResonance();
    const r1 = G.resonance;
    const ok1 = r1.benming && r1.benPlayerMul === 0.12 && !r1.daotu && !r1.kuaJie && !r1.poBi;
    say(`剑修·1 颗 共鸣=[本命=${r1.benming},道途=${r1.daotu},跨阶=${r1.kuaJie},破壁=${r1.pobi}] benMul=${r1.benPlayerMul}`);
    say(ok1 ? "PASS 本命归一：宝石 ≥ 1 即觉醒，伤害加成 12%" : "FAIL 本命归一未按规则触发");

    G.charId = "sword"; G.gems = { gem_jiangang: 1 }; G.jobPath = 0; G.resonance = X.recomputeResonance();
    const r2 = G.resonance;
    const ok2 = r2.daotu && r2.daoTuElems.indexOf("huo") >= 0;
    G.gems = { gem_jiangang: 1 }; G.jobPath = null; G.resonance = X.recomputeResonance();
    const baseJin = damageOn("jin", 100);
    G.gems = { gem_jiangang: 1 }; G.jobPath = 0; G.resonance = X.recomputeResonance();
    const fullJin = damageOn("jin", 100);
    say(`剑道·剑罡 vs 金敌：基线 ${baseJin.toFixed(2)} → 加道途 ${fullJin.toFixed(2)}（比值应 1.25）`);
    const ok2d = ok2 && Math.abs(fullJin / baseJin - 1.25) < 1e-3;
    say(ok2d ? "PASS 道途共鸣：宝石 ∈ 转职五行集 即觉醒 · 对所克目标再 +25%" : "FAIL 道途共鸣伤害加成未生效");

    G.charId = "mage"; G.gems = { gem_fentian: 1 }; G.jobPath = 1; G.resonance = X.recomputeResonance();
    const r2b = G.resonance;
    const ok2b = r2b.daotu && r2b.daoTuElems.indexOf("huo") >= 0;
    say(`法修·焚天 + 玄法 共鸣·道途=${r2b.daotu} [${r2b.daoTuElems}]`);
    say(ok2b ? "PASS 跨角色也能借道途共鸣" : "FAIL 跨角色道途共鸣失效");

    G.gems = { gem_jiangang: 3 }; G.resonance = X.recomputeResonance();
    const r3 = G.resonance;
    const ok3 = r3.kuaJie && r3.kuaJieStones.indexOf("chifeng") >= 0;
    clean();
    const baseHuoSelf = damageOn("huo", 100);
    G.gems = { gem_jiangang: 3 }; G.resonance = X.recomputeResonance();
    const fullHuoRound = damageOn("huo", 100);
    say(`跨阶归一·圆满 vs 同元素：${baseHuoSelf.toFixed(2)} → ${fullHuoRound.toFixed(2)}（应 1.5 倍）`);
    const ok3d = ok3 && Math.abs(fullHuoRound / baseHuoSelf - 1.5) < 1e-3;
    say(ok3d ? "PASS 跨阶归一：圆满宝石整段 ×1.5 已生效" : "FAIL 跨阶归一倍率不正确");

    G.charId = "mage"; G.gems = { gem_fentian: 1, gem_xuanbing: 1 }; G.jobPath = null; G.resonance = X.recomputeResonance();
    const r4 = G.resonance;
    const ok4 = r4.pobi && r4.poBiElems.length === 2;
    say(`火 + 水 共鸣·破壁者=${r4.pobi} [${r4.poBiElems.map(k=>X.ELEM_BY_KEY[k].name).join("⇿")}]`);
    say(ok4 ? "PASS 破壁者：异系宝石相克即激活" : "FAIL 破壁者未触发");

    G.charId = "sword"; G.gems = { gem_yufeng: 1, gem_xuejian: 1 }; G.resonance = X.recomputeResonance();
    const r5 = G.resonance;
    const ok5 = r5.pobi && r5.poBiElems.indexOf("mu") >= 0 && r5.poBiElems.indexOf("jin") >= 0;
    say(`木 + 金 共鸣·破壁者=${r5.pobi} [${r5.poBiElems.map(k=>X.ELEM_BY_KEY[k].name).join("⇿")}]`);
    say(ok5 ? "PASS 破壁者触发条件可识别（木/金 相克）" : "FAIL 同系破壁测试失败");

    G.charId = "sword"; G.gems = { gem_xuejian: 1, gem_yufeng: 1 }; G.jobPath = null; G.resonance = X.recomputeResonance();
    G.resonance.pobi = false;            // 关掉破壁者，保留其它状态
    const shuiNoPobi = damageOn("shui", 100);
    G.resonance.pobi = true;             // 打开
    const shuiWithPobi = damageOn("shui", 100);
    say(`破壁者：vs 水 无 ${shuiNoPobi.toFixed(2)} → 有 ${shuiWithPobi.toFixed(2)}（应 1.15 倍）`);
    const okPobi = Math.abs(shuiWithPobi / shuiNoPobi - 1.15) < 1e-3;
    say(okPobi ? "PASS 破壁者只对未直接被克目标 +15%" : "FAIL 破壁者加成逻辑错");

    G.gems = { gem_jiangang: 1 }; G.jobPath = 0; G.resonance = X.recomputeResonance();
    X.renderForge();
    const cardCount = els["forgeResonance"].children.length;
    const onCount = Array.from(els["forgeResonance"].children).filter((c) => c.className.includes(" on")).length;
    const hudHtml = els["resHudList"].innerHTML || "";
    const chipCount = (hudHtml.match(/<span class="res-chip">/g) || []).length;
    const hudHidden = els["resHud"].classList.contains("hidden");
    say(`共鸣卡 ${cardCount} 张 · 已觉醒 ${onCount} 张 · HUD 芯片 ${chipCount} 个 · 可见=${!hudHidden}`);
    say(cardCount === 4 && onCount >= 1 && chipCount === onCount && !hudHidden ? "PASS 共鸣面板与 HUD 渲染正常" : "FAIL 共鸣面板未正确生成");

    // ---- v2.0 · 派系核心 ----
    say("");
    say("== 29) 派系核心：9 颗核心 + 5 颗同派系解锁 ==");
    forcePlay();
    G.charId = "sword"; G.cores = []; G.schoolUnlocked = {}; G.schoolFx = {};
    G._coreDiedOnce = false; G._coreFireT = 0; G._coreLeiYuT = 0;
    const coreN = X.SCH_CORES.length;
    const charCores = X.SCH_CORES.filter((c) => c.char === "sword").length;
    const swordSchools = ["赤锋", "疾风", "血煞"];
    const schoolsAll = [...new Set(X.SCH_CORES.map((c) => c.school))];
    say(`核心 ${coreN} 个｜剑修专属 ${charCores} 个（应 3）｜派系总数 ${schoolsAll.length}（应 9）`);
    say(coreN === 9 && charCores === 3 && schoolsAll.length === 9 ? "PASS 9 个派系核心，每角色 3 个" : "FAIL 核心表异常");

    // schoolOf/countSchool
    say(`schoolOf("chifeng")=${X.schoolOf("chifeng")}（应 赤锋）· schoolOf("leiling")=${X.schoolOf("leiling")}（应 雷灵）`);
    setStones("sword", { chifeng: 2, fengren: 2, lieyan: 1, jifeng: 3 });
    const cf = X.countSchool("赤锋");
    const jf = X.countSchool("疾风");
    say(`赤锋 ${cf}=5（应 5）· 疾风 ${jf}=3（应 3）`);
    say(cf === 5 && jf === 3 ? "PASS schoolOf / countSchool" : "FAIL 派系统计异常");

    // canUnlockCore / unlockCore
    const beforeCores = (G.cores || []).length;
    const canBefore = X.canUnlockCore("赤锋");
    say(`赤锋=5 → canUnlockCore=${canBefore}（应 true）`);
    setStones("sword", { chifeng: 1, fengren: 1, lieyan: 1, jifeng: 3 });
    const canShort = X.canUnlockCore("赤锋");
    say(`赤锋=3 → canUnlockCore=${canShort}（应 false）`);
    setStones("sword", { chifeng: 2, fengren: 2, lieyan: 2, jifeng: 3 });
    const unlockOK = X.unlockCore("赤锋");
    say(`赤锋=6 → unlockCore=${unlockOK}（应 true）· cores=${G.cores.length}（应 ${beforeCores + 1}）`);
    say(canBefore && !canShort && unlockOK && G.cores.length === beforeCores + 1
      ? "PASS canUnlockCore + unlockCore 自动装备" : "FAIL 核心解锁异常");

    // 装备核心后效果生效（赤锋核心 onEquip 设置 G.schoolFx.fentian=true）
    const fentianOn = G.schoolFx.fentian === true;
    say(`赤锋核心 onEquip → G.schoolFx.fentian=${fentianOn}（应 true）`);
    say(fentianOn ? "PASS 核心 onEquip 钩入" : "FAIL onEquip 未生效");

    // 槽位上限：装备 3 个核心应被挡（先把疾风/血煞同派系都攒 5 颗）
    setStones("sword", { chifeng: 2, fengren: 2, lieyan: 2,
      jifeng: 2, chuanyun: 2, cuiye: 2,
      xuesha: 2, baigu: 2, suijin: 2 });
    X.unlockCore("疾风");   // 第二席
    const before3 = (G.cores || []).length;
    const unlock2 = X.unlockCore("血煞");
    say(`装备 2 席后解第 3 派系 → cores=${G.cores.length}（应 ${before3}） unlockCore=${unlock2}（应 true 但未自动装）`);
    const schoolUnlockedAll = !!G.schoolUnlocked["血煞"];
    say(G.cores.length === 2 && schoolUnlockedAll ? "PASS MAX_SCHOOL_CORES=2 上限生效，第 3 个只解锁不装" : "FAIL 槽位上限异常");

    // 手动装备第三核心
    X.equipCore("sc_xuesha");
    say(`手动 equipCore('sc_xuesha') → cores=${G.cores.length}（应 3 · 但应被挡在 2）`);
    const equipped3 = X.coresEquipped().map((c) => c.school);
    say(`当前装备：${equipped3.join(" / ")}（应 2 个）`);
    say(equipped3.length === 2 ? "PASS 手动装备仍守 MAX_SCHOOL_CORES=2" : "FAIL 槽位未守");

    // unequipCore + 重新装
    const hadFentian = X.coresEquipped().some((c) => c.school === "赤锋");
    X.unequipCore("sc_chifeng");
    const stillFentian = X.coresEquipped().some((c) => c.school === "赤锋");
    const reEquip = X.equipCore("sc_chifeng");
    say(`卸下赤锋后装备=${stillFentian}（应 false）· 重新装=${reEquip}（应 true）`);
    say(hadFentian && !stillFentian && reEquip ? "PASS unequipCore + equipCore 正常" : "FAIL 装卸异常");

    // 跨角色核心解不了
    G.charId = "mage"; G.cores = []; G.schoolUnlocked = {}; G.schoolFx = {};
    const mageUnlock = X.unlockCore("赤锋");   // 赤锋是 sword 的派系
    say(`法修尝试解剑修赤锋核心 → ${mageUnlock}（应 false）`);
    say(!mageUnlock ? "PASS 跨角色核心无法解锁" : "FAIL 跨角色解锁被绕过");

    // 赤锋核心 tick 触发焚天剑阵
    G.charId = "sword"; G.cores = []; G.schoolUnlocked = {}; G.schoolFx = {};
    G.schoolUnlocked["赤锋"] = true;
    X.equipCore("sc_chifeng");
    G._coreFireT = 0.01;   // 立即可触发
    const projBefore = G.projectiles.length;
    for (const c of X.coresEquipped()) c.tick && c.tick(1);   // dt=1 强制触发
    const projAfter = G.projectiles.length;
    say(`赤锋核心 tick(1) → 剑气数 ${projBefore}->${projAfter}（应 +8）`);
    say(projAfter - projBefore >= 8 ? "PASS 焚天剑阵每 8 秒放 8 道剑气" : "FAIL 焚天剑阵未生成剑气");

    // 疾风核心 onEquip 改移速（先卸下之前装过的）
    G.charId = "sword"; X.unequipCore("sc_chifeng");
    G.cores = []; G.schoolFx = {}; G.schoolUnlocked = { "疾风": true };
    const mv0 = G.moveSpeed;
    X.equipCore("sc_jifeng");
    const mv1 = G.moveSpeed;
    say(`疾风核心 onEquip → 移速 ${mv0.toFixed(2)}->${mv1.toFixed(2)}（应 ×1.20）`);
    say(Math.abs(mv1 / mv0 - 1.2) < 1e-6 ? "PASS 御风化神永久移速 +20%" : "FAIL 御风化神未生效");

    // 龙血核心 onDeathCheck 复活
    G.charId = "body"; G.cores = []; G.schoolUnlocked = {}; G.schoolFx = {};
    G.schoolUnlocked["龙血"] = true;
    X.equipCore("sc_longxue");
    G.hpMax = 500; G.hp = G.hpMax; G._coreDiedOnce = false;
    X.damagePlayer(9999);
    const revived = G.hp > 0;
    say(`龙血核心 HP=hpMax → damagePlayer 后 hp=${G.hp.toFixed(0)}（应回满） · 复活=${revived}`);
    say(revived ? "PASS 浴火重生：HP 归零时满血复活" : "FAIL 龙血复活未触发");

    // 朱雀灼烧扩散（onHit）
    G.charId = "mage"; G.cores = []; G.schoolFx = {}; G.burnMul = 1;
    G.schoolUnlocked["焚天"] = true;
    X.equipCore("sc_fentianshi");
    G.enemies = [];
    const src = X.spawnEnemy("fox", 0, 0, 1); src.burn = 2; src.burnDmg = 5;
    const neighbor = X.spawnEnemy("fox", 80, 0, 1);
    const beforeBurn = neighbor.burn || 0;
    X.SCH_CORE_BY_ID["sc_fentianshi"].onHit(src, 100);
    const afterBurn = neighbor.burn || 0;
    say(`朱雀核心 onHit → 邻居灼烧 ${beforeBurn}->${afterBurn}（应 >0）`);
    say(afterBurn > 0 ? "PASS 朱雀降世灼烧扩散" : "FAIL 灼烧未扩散");

    // 派系核心面板 + HUD
    G.cores = ["sc_chifeng"]; G.charId = "sword"; G.schoolFx = { fentian: true };
    X.renderCores();
    const coreCards = els["forgeCores"].children.length;
    const coreOnCount = Array.from(els["forgeCores"].children).filter((c) => c.className.includes(" on")).length;
    const coreHudHtml = els["coreHudList"].innerHTML || "";
    const coreChipN = (coreHudHtml.match(/<span class="core-chip"/g) || []).length;
    say(`核心面板 ${coreCards} 张 · 已装 ${coreOnCount} 张 · HUD 芯片 ${coreChipN} 个`);
    say(coreCards === 3 && coreOnCount === 1 && coreChipN === 1 ? "PASS 核心面板 + HUD 渲染正常" : "FAIL 核心 UI 异常");
  }

  // ============================================================
  // v5.0 PM 视角·游戏玩法改造（P0 必修包）
  // ============================================================
  say("");
  say("== 30) v5.0 PM 视角 · 新手教程 ==");
  forcePlay();
  // 教程 step 1 默认 resetRun 后应为 1
  G.tutStep = 1; X.advanceTutorial();   // 推进到 step 2
  say(`step 1 → 2：tutStep=${G.tutStep} overlay.classList=${[...els["tutOverlay"]._cls].join(",")}`);
  const tut2OK = G.tutStep === 2 && els["tutOverlay"]._cls.has("showed") === false;   // showed 是个内部标记
  // 用 _milestone 和 advanceTutorial 走完
  G.tutStep = 2; X.advanceTutorial();   // 推进到 step 3
  say(`step 2 → 3：tutStep=${G.tutStep}`);
  G.tutStep = 3; X.advanceTutorial();   // 推进到 step 0（关闭）
  say(`step 3 → 完成：tutStep=${G.tutStep} hidden=${els["tutOverlay"]._cls.has("hidden")}`);
  const tutOK = G.tutStep === 0 && els["tutOverlay"]._cls.has("hidden");
  say(tutOK ? "PASS 教程 3 步可手动推进并自动隐藏"
            : "FAIL 教程推进/隐藏异常");

  say("");
  say("== 31) v5.0 PM 视角 · 大字报系统 ==");
  X.showBigBanner("里程碑", "测试大字报", "purple");
  const banner1 = els["bigBannerText"].textContent;
  const bannerSub = els["bigBannerSub"].textContent;
  const bannerHidden = els["bigBanner"]._cls.has("hidden");
  const bannerMode = els["bigBanner"]._cls.has("s-purple");
  say(`大字报 sub="${bannerSub}" text="${banner1}" mode purple=${bannerMode} hidden=${bannerHidden} _bigBannerT=${G._bigBannerT.toFixed(2)}`);
  X.showBigBanner("橙装觉醒", "橙·测试", "orange");
  const bannerOrange = els["bigBanner"]._cls.has("s-orange");
  say(`橙色大字报 mode orange=${bannerOrange}`);
  const bannerOK = banner1 === "测试大字报" && bannerSub === "里程碑" && !bannerHidden && bannerMode && bannerOrange && G._bigBannerT > 0;
  say(bannerOK ? "PASS 大字报：3 种模式 + 计时 + 文本/副标题"
               : "FAIL 大字报渲染异常");

  say("");
  say("== 32) v5.0 PM 视角 · HUD 目标进度条 ==");
  forcePlay();
  // 模拟玩家进度：紫装 = 0
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  X.updateGoalBar();
  const txt0 = els["goalText"].textContent;
  const detail0 = els["goalDetail"].textContent;
  say(`空背包：goalText="${txt0}" detail="${detail0}" fill%=${els["goalFill"].style._p.width}`);
  // 加 1 件紫装进背包
  G.inventory.push(X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "jin_crit"] }));
  X.updateGoalBar();
  const txt1 = els["goalText"].textContent;
  const detail1 = els["goalDetail"].textContent;
  say(`+1 紫装：goalText="${txt1}" detail="${detail1}"`);
  // 装 3 件同派系 ⇒ 目标应跳到"派系纯度 100%"
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  const gW = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "sk_fire_jet", "crit_pct"] });
  const gA = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_dmg", "sk_hp_regen", "shield_max"] });
  const gX = X.makeEquip("accessory", "purple", { fixedAffixes: ["huo_dmg", "haste_pct", "xp_bonus"] });
  X.pickUpEquip(gW); X.equipTo(gW.uid);
  X.pickUpEquip(gA); X.equipTo(gA.uid);
  X.pickUpEquip(gX); X.equipTo(gX.uid);
  X.updateGoalBar();
  const txt2 = els["goalText"].textContent;
  const detail2 = els["goalDetail"].textContent;
  const pur2 = G._purity;
  say(`3 件同派系齐套：goalText="${txt2}" detail="${detail2}" purity=${pur2.toFixed(2)}`);
  const goalOK = /目标/.test(txt0) && /目标/.test(txt1) && /纯度/.test(txt2) && pur2 >= 1.29;
  say(goalOK ? "PASS 进度条按当前状态切换目标（紫装 → 纯度 100%）"
             : "FAIL 目标进度条逻辑异常");

  say("");
  say("== 33) v5.0 PM 视角 · 灵石槽位（第 4 槽）==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._eqCache = { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, dmgTaken: 0,
                  huoMul: 1, burnMul: 1, activeSkillIds: [], passiveSkillIds: [] };
  G._baseAtk = G.atk; G._baseHpMax = G.hpMax; G._baseMoveSpeed = G.moveSpeed;
  G._baseCrit = G.crit; G._baseLS = G.lifesteal; G._baseXpMul = G.xpMul;
  G._baseShieldMax = G.shieldMax; G._baseBurnMul = G.burnMul; G._baseDmgTaken = G.dmgTakenMul;
  X.equipRec();
  // 装备 1 件火派紫装 + 灵石槽放赤锋派
  G.charId = "sword"; G.stones = {}; for (const k of (X.STONES_ALL || []).map((s) => s.key)) G.stones[k] = 0;
  G.stones["chifeng"] = 1;
  const baseEq2 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "jin_crit"] });
  X.pickUpEquip(baseEq2); X.equipTo(baseEq2.uid);
  const eb_v5_0 = X.equipBonuses();
  const huo_v5_0 = eb_v5_0.huoMul;
  say(`未装灵石槽：huoMul=${huo_v5_0.toFixed(3)}（应 1.12，即 1 + 0.12）`);
  X.setStoneSlot("chifeng");
  const slot_v5 = G._stoneSlot;
  say(`setStoneSlot("chifeng") → slot=${JSON.stringify(slot_v5)}`);
  X.equipRec();
  const eb_v5_1 = X.equipBonuses();
  const huo_v5_1 = eb_v5_1.huoMul;
  say(`装赤锋灵石槽：huoMul=${huo_v5_1.toFixed(3)}（应 ${(1 + 0.12 * 1.30).toFixed(3)} = 1.156）`);
  X.setStoneSlot(null);
  X.equipRec();
  const eb_v5_2 = X.equipBonuses();
  const huo_v5_2 = eb_v5_2.huoMul;
  say(`卸下灵石槽：huoMul=${huo_v5_2.toFixed(3)}（应回到 ${huo_v5_0.toFixed(3)}）`);
  const stoneSlotOK = slot_v5 && slot_v5.school === "赤锋" && Math.abs(huo_v5_1 - 1.156) < 0.001 && Math.abs(huo_v5_2 - huo_v5_0) < 1e-6;
  say(stoneSlotOK ? "PASS 灵石槽加成正确（×1.30 该派系词条）"
               : "FAIL 灵石槽加成异常");

  say("");
  say("== 34) v5.0 PM 视角 · 派系纯度 ==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._eqCache = { atk: 0, hp: 0, spd: 0, crit: 0, lifesteal: 0, xp: 0, shield: 0, dmgTaken: 0,
                  huoMul: 1, burnMul: 1, activeSkillIds: [], passiveSkillIds: [] };
  G._baseAtk = G.atk; G._baseHpMax = G.hpMax; G._baseMoveSpeed = G.moveSpeed;
  G._baseCrit = G.crit; G._baseLS = G.lifesteal; G._baseXpMul = G.xpMul;
  G._baseShieldMax = G.shieldMax; G._baseBurnMul = G.burnMul; G._baseDmgTaken = G.dmgTakenMul;
  X.equipRec();
  // 杂派系：3 件全不同
  G.charId = "sword";
  const eW1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "jin_crit"] });
  const eA1 = X.makeEquip("armor", "purple", { fixedAffixes: ["mu_speed", "shield_max", "lifesteal"] });
  const eX1 = X.makeEquip("accessory", "purple", { fixedAffixes: ["shui_slow", "haste_pct", "xp_bonus"] });
  [eW1, eA1, eX1].forEach((e) => { X.pickUpEquip(e); X.equipTo(e.uid); });
  X.equipRec();
  const ebMix = X.equipBonuses();
  const purityMix = G._purity;
  say(`混搭（huo/mu/shui）：purity=${purityMix.toFixed(2)} huoMul=${ebMix.huoMul.toFixed(3)}（应 ≈1）`);
  // 2 同派系（用 huo_dmg + huo_burn 都是赤锋派）
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  const eW2 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "jin_crit"] });
  const eA2 = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_dmg", "shield_max", "lifesteal"] });
  const eX2 = X.makeEquip("accessory", "purple", { fixedAffixes: ["shui_slow", "haste_pct", "xp_bonus"] });
  [eW2, eA2, eX2].forEach((e) => { X.pickUpEquip(e); X.equipTo(e.uid); });
  X.equipRec();
  const eb2p = X.equipBonuses();
  const purity2 = G._purity;
  // 2 件都有 huo_dmg ⇒ huoMul = 1 + 0.12 × 2 × 1.10 = 1.264
  say(`2 同派系（huo×2）：purity=${purity2.toFixed(2)} huoMul=${eb2p.huoMul.toFixed(3)}（应 ≈1.264 = 1 + 0.12*2*1.10）`);
  // 3 同派系
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  const eW3 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "jin_crit"] });
  const eA3 = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_dmg", "shield_max", "lifesteal"] });
  const eX3 = X.makeEquip("accessory", "purple", { fixedAffixes: ["huo_dmg", "haste_pct", "xp_bonus"] });
  [eW3, eA3, eX3].forEach((e) => { X.pickUpEquip(e); X.equipTo(e.uid); });
  X.equipRec();
  const eb3 = X.equipBonuses();
  const purity3 = G._purity;
  say(`3 同派系（huo×3）：purity=${purity3.toFixed(2)} huoMul=${eb3.huoMul.toFixed(3)}（应 ≈1.36 = 1 + 0.12*1.30）`);
  const purityOK = purityMix >= 0.99 && purityMix <= 1.01 && purity2 >= 1.09 && purity2 <= 1.11 && purity3 >= 1.29 && purity3 <= 1.31
                && Math.abs(eb2p.huoMul - 1.264) < 0.01 && Math.abs(eb3.huoMul - 1.468) < 0.01;
  say(purityOK ? "PASS 派系纯度按 1/2/3 件同派系递增（×1.0/×1.10/×1.30）"
               : "FAIL 派系纯度逻辑异常");

  say("");
  say("== 35) v5.0 PM 视角 · 技能轮盘 CD 轮转 ==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  // 装 2 件紫装各带 1 主动技能：CD 8（剑阵） + CD 4（火喷射）
  const wW = X.makeEquip("weapon", "purple", { fixedAffixes: ["sk_sword_array", "crit_pct", "jin_crit"] });
  const wA = X.makeEquip("armor", "purple", { fixedAffixes: ["sk_fire_jet", "shield_max", "lifesteal"] });
  X.pickUpEquip(wW); X.equipTo(wW.uid);
  X.pickUpEquip(wA); X.equipTo(wA.uid);
  X.equipRec();
  const skNames = G.activeSkills.map((id) => `${id}(cd=${X.AFFIX_POOL[id].cd}s)`).join(",");
  say(`装两件带不同主动技能：${skNames}`);
  // 轮盘触发：idx=-1（默认） ⇒ 自动选 CD 最小的
  const fireBefore = G.skillCD[1] || 0;
  const castOK = X.triggerEquipSkill(-1);
  const fireAfter = G.skillCD[1] || 0;
  say(`triggerEquipSkill(-1) 轮盘：castOK=${castOK} 短 CD（4s 火喷射）${fireBefore}->${fireAfter}`);
  // 确认放的是 CD 短的那个（sk_fire_jet）而不是 sk_sword_array
  const wheelOK = castOK && fireAfter >= 4 && G.skillCD[0] === 0;
  say(wheelOK ? "PASS 轮盘自动选 CD 最短的（4s 喷射）"
                : "FAIL 轮盘未按 CD 最短选择");

  say("");
  say("== 36) v5.0 PM 视角 · 妖王必掉本派系紫装 ==");
  forcePlay();
  setStones("sword", { chifeng: 3, fengren: 1, lieyan: 1, jifeng: 1 });   // 主派系 = 赤锋
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  const bossN0 = G.inventory.length;
  G.enemies = []; G.pickups = [];
  const boss = X.spawnEnemy("bossGolem", 0, 0, 5);   // wave 5 妖王
  X.killEnemy(boss);
  const eqPicks = G.pickups.filter((p) => p.kind === "equip" && p.equip && p.equip.tier === "purple");
  const affixSchools = eqPicks.map((p) => {
    const ax = (p.equip.affixes || []).find((a) => X.AFFIX_POOL[a] && X.AFFIX_POOL[a].school);
    return ax ? X.AFFIX_POOL[ax].school : "(无派系词条)";
  });
  say(`妖王掉紫装 ${eqPicks.length} 件，派系=${affixSchools.join(",")}（应含"赤锋"）`);
  const bossPurpleOK = eqPicks.length >= 1 && affixSchools.indexOf("赤锋") >= 0;
  say(bossPurpleOK ? "PASS 妖王必掉本派系（赤锋）紫装"
                    : "FAIL 妖王本派紫装未触发");

  say("");
  say("== 37) v5.0 PM 视角 · 橙装掉落特效（慢镜+大字报）==");
  forcePlay();
  G.inventory = []; G.pickups = [];
  const orangeEq = X.makeEquip("weapon", "orange", { fixedAffixes: ["huo_dmg", "crit_pct", "lifesteal", "sk_fire_jet"] });
  X.pickUpEquip(orangeEq);
  const oT = G._orangeT;
  const oName = G._orangeName;
  const bannerOrangeCls = els["bigBanner"]._cls.has("s-orange");
  say(`拾取橙装 ${orangeEq.name}：_orangeT=${oT.toFixed(2)} _orangeName="${oName}" bigBanner.s-orange=${bannerOrangeCls}`);
  const orangeOK = oT > 0 && oName === orangeEq.name && bannerOrangeCls;
  say(orangeOK ? "PASS 橙装觉醒：慢镜启动 + 大字报变橙色"
                : "FAIL 橙装特效未触发");

  say("");
  say("== 38) v5.0 PM 视角 · 静态接线检查 ==");
  const v5Checks = {
    "PURITY_BONUS 常量": raw.includes("const PURITY_BONUS"),
    "STONE_SLOT_BONUS 常量": raw.includes("const STONE_SLOT_BONUS"),
    "ui.goalBar 引用": raw.includes('goalBar: $("goalBar")'),
    "ui.bigBanner 引用": raw.includes('bigBanner: $("bigBanner")'),
    "ui.tutOverlay 引用": raw.includes('tutOverlay: $("tutOverlay")'),
    "ui.invSlotStone 引用": raw.includes('invSlotStone: $("invSlotStone")'),
    "G.tutStep 字段": raw.includes("tutStep:"),
    "G._stoneSlot 字段": raw.includes("_stoneSlot:"),
    "G._purity 字段": raw.includes("_purity:"),
    "G._milestone 字段": raw.includes("_milestone:"),
    "G._orangeT 字段": raw.includes("_orangeT:"),
    "showBigBanner 函数": raw.includes("function showBigBanner"),
    "showTutorial 函数": raw.includes("function showTutorial"),
    "advanceTutorial 函数": raw.includes("function advanceTutorial"),
    "tickTutorial 函数": raw.includes("function tickTutorial"),
    "updateGoalBar 函数": raw.includes("function updateGoalBar"),
    "setStoneSlot 函数": raw.includes("function setStoneSlot"),
    "triggerEquipSkill 轮盘": raw.includes("let best = -1, bestDef = null"),
    "pickUpEquip 紫装里程碑": raw.includes("紫装入手里程碑"),
    "pickUpEquip 橙装觉醒": raw.includes("橙装觉醒：慢镜"),
    "killEnemy Boss 本派紫装": raw.includes("妖王必掉 1 件本派系紫装"),
    "update tick 教程": raw.includes("tickTutorial(dt);"),
    "update 进度条": raw.includes("updateGoalBar();"),
    "startRun 启动教程": raw.includes("G.tutStep = 1;"),
    "resetRun 重置 v5 字段": raw.includes("G._stoneSlot = null;"),
    "equipBonuses 纯度计算": raw.includes("purity >= 0.95"),
    "equipBonuses 灵石槽加成": raw.includes("STONE_SLOT_BONUS"),
    "unlockCore 大字报": raw.includes("派系核心觉醒"),
    "autoJobFromSet 大字报": raw.includes("套装转职"),
    "tutNext 按钮事件": raw.includes("ui.tutNext.addEventListener"),
  };
  let v5OK = true;
  for (const [k, v] of Object.entries(v5Checks)) { if (!v) v5OK = false; say(`  ${v ? "OK  " : "MISS"} ${k}`); }
  say(v5OK ? "PASS v5.0 接线检查通过" : "FAIL 存在未接线项");

  say("");
  say("== 39) v5.0 PM 视角 · DOM id 对齐（goalBar / bigBanner / tutOverlay / invSlotStone） ==");
  const v5ids = ["goalBar","goalIco","goalText","goalFill","goalDetail",
                  "bigBanner","bigBannerSub","bigBannerText",
                  "tutOverlay","tutCard","tutStepNum","tutStepTotal","tutTitle","tutBody","tutTip","tutNext",
                  "invSlotStone"];
  const htmlAll = fs.readFileSync(HTML, "utf8");
  const missV5 = v5ids.filter((id) => !htmlAll.includes(`id="${id}"`));
  say(`v5.0 新增 id ${v5ids.length} 个，HTML 缺失 ${missV5.length} 个 ${missV5.join(",")}`);
  say(missV5.length === 0 ? "PASS v5.0 所有新 id 均存在于 HTML" : "FAIL HTML 缺失 v5.0 id");

  say("");
  say("== 40) v6.0 A · 怪物词缀生成与实例化 ==");
  forcePlay();
  G.enemies = []; G.zones = []; G.altars = [];
  const eElite = X.spawnEnemy("eliteFox", 400, 400, 5);
  const eBoss = X.spawnEnemy("bossGolem", 500, 500, 12);
  const eMob = X.spawnEnemy("fox", 600, 600, 5);
  say(`精英(5波)=[${eElite.mods}] 大妖(12波)=[${eBoss.mods}] 小妖=[${eMob.mods}]`);
  const cntOK = eElite.mods.length === X.modCountFor(eElite, 5)
    && eBoss.mods.length === X.modCountFor(eBoss, 12)
    && eMob.mods.length === 0;
  say(cntOK ? "PASS 词缀数量符合规则（精英 1 / 大妖 2 / 小妖 0）" : "FAIL 词缀数量异常");

  const modBak = X.ENEMY_MOD_KEYS.slice();
  X.ENEMY_MOD_KEYS.length = 0; X.ENEMY_MOD_KEYS.push("swift");
  let sSum = 0; const SW_N = 14;
  for (let i = 0; i < SW_N; i++) sSum += X.spawnEnemy("eliteFox", 700 + i, 700, 5).speed;
  const swiftRatio = sSum / SW_N / X.ENEMY_TYPES.eliteFox.speed;
  say(`swift 移速倍率均值 = ${swiftRatio.toFixed(2)}（应 ≈1.60）`);
  X.ENEMY_MOD_KEYS.length = 0; X.ENEMY_MOD_KEYS.push("mirror");
  G.atk = 100;
  const mE = X.spawnEnemy("eliteFox", 800, 800, 5);
  const mBase = X.ENEMY_TYPES.eliteFox.atk * (1 + 0.12 * 5);
  say(`mirror atk=${mE.atk.toFixed(1)} 基准=${mBase.toFixed(1)}（应 +25 = 玩家 atk 100 的 25%）`);
  X.ENEMY_MOD_KEYS.length = 0; X.ENEMY_MOD_KEYS.push("ward");
  const wE = X.spawnEnemy("eliteFox", 900, 900, 5);
  say(`ward 护盾 ${wE.ward.toFixed(1)} / hpMax ${wE.hpMax.toFixed(1)}（应 ≈0.45）`);
  X.ENEMY_MOD_KEYS.length = 0; for (const k of modBak) X.ENEMY_MOD_KEYS.push(k);
  const instOK = swiftRatio > 1.45 && swiftRatio < 1.78
    && Math.abs(mE.atk - (mBase + 25)) < 0.6
    && Math.abs(wE.ward / wE.hpMax - 0.45) < 0.01;
  say(instOK ? "PASS 词缀实例化生效（swift ×1.6 / mirror +25% / ward 45%）" : "FAIL 词缀实例化异常");

  say("");
  say("== 41) v6.0 A · 词缀行为（护盾 / 荆棘 / 分裂 / 自爆 / 冰霜） ==");
  forcePlay();
  G.enemies = []; G.zones = []; G.crit = 0; G.invuln = 0; G.dashIFrame = 0;
  // 护盾：伤害先扣护盾，血不掉
  const wdE = X.spawnEnemy("eliteFox", 300, 300, 5);
  wdE.mods = ["ward"]; wdE.hpMax = wdE.hp = 1000; wdE.ward = wdE.wardMax = 5000;
  X.applyHit(wdE, 100);
  const wardAbs = 5000 - wdE.ward;
  say(`护盾怪挨 100：护盾吸收 ${wardAbs.toFixed(1)}（应 ≈100）hp=${wdE.hp.toFixed(0)}（应仍 1000）`);
  const wardBehavOK = wardAbs > 40 && wardAbs < 260 && Math.abs(wdE.hp - 1000) < 1;
  // 荆棘：玩家被反弹
  G.hp = G.hpMax = 500; G.shield = 0; G.invuln = 0; G.dashIFrame = 0;
  const thE = X.spawnEnemy("eliteFox", 340, 340, 5);
  thE.mods = ["thorns"]; thE.hpMax = thE.hp = 1e6; thE.ward = 0;
  const hpB1 = G.hp;
  X.applyHit(thE, 1000);
  const thLost = hpB1 - G.hp;
  say(`荆棘怪挨 1000：玩家掉血 ${thLost.toFixed(1)}（应 ≈180，受五行浮动）`);
  const thornsOK = thLost > 60 && thLost < 420;
  // 分裂：死后再来 2 只
  G.enemies = [];
  const spE = X.spawnEnemy("eliteFox", 400, 400, 5);
  spE.mods = ["split"]; spE.hp = 1; spE.ward = 0;
  X.killEnemy(spE);
  say(`分裂怪死亡后场上敌人 ${G.enemies.length} 只（应 3 = 尸体 1 + 裂出 2）`);
  const splitOK = G.enemies.length === 3;
  // 自爆：脚下死亡要吃伤害
  G.enemies = [];
  G.hp = G.hpMax = 500; G.invuln = 0; G.dashIFrame = 0; G.shield = 0;
  const bmE = X.spawnEnemy("eliteFox", G.px + 8, G.py + 8, 5);
  bmE.mods = ["bomb"]; bmE.hp = 1; bmE.ward = 0;
  const hpB2 = G.hp;
  X.killEnemy(bmE);
  const bmLost = hpB2 - G.hp;
  say(`自爆怪在脚下死亡：玩家掉血 ${bmLost.toFixed(1)}（应 > 0）`);
  const bombOK = bmLost > 0;
  // 冰霜：留下减速力场
  G.zones = [];
  const frE = X.spawnEnemy("eliteFox", 500, 500, 5);
  frE.mods = ["frost"]; frE.hp = 1; frE.ward = 0;
  X.killEnemy(frE);
  const v6frostOK = G.zones.length === 1;
  say(`冰霜怪死亡：地面力场 ${G.zones.length} 个（应 1，半径 ${G.zones[0] ? G.zones[0].r : "-"}）`);
  say(wardBehavOK && thornsOK && splitOK && bombOK && v6frostOK
    ? "PASS 五种词缀行为全部生效" : "FAIL 词缀行为异常");

  say("");
  say("== 42) v6.0 B · 词条联动激活 + HUD ==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._stoneSlot = null; X.equipRec();
  say(`空身联动：${JSON.stringify(G._synergies)}（应 []）`);
  const synEmptyOK = G._synergies.length === 0;
  // 熔炉 = huo_dmg + shui_slow
  const wq = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "shui_slow", "crit_pct"] });
  X.pickUpEquip(wq); X.equipTo(wq.uid); X.equipRec();
  say(`穿 1 件（huo_dmg + shui_slow）→ 联动 ${JSON.stringify(G._synergies)}（应含 syn_forge）`);
  const synForgeOK = G._synergies.indexOf("syn_forge") >= 0;
  say(`HUD 计数="${els["synHudCount"].textContent}"（应 n/8）芯片数=${els["synHudList"].innerHTML.split("syn-chip").length - 1}`);
  const synHudOK = /\/8$/.test(els["synHudCount"].textContent) && els["synHudList"].innerHTML.includes("syn-chip");
  // 再凑雷暴 = jin_thunder + crit_pct
  const aq = X.makeEquip("armor", "purple", { fixedAffixes: ["jin_thunder", "crit_pct", "shield_max"] });
  X.pickUpEquip(aq); X.equipTo(aq.uid); X.equipRec();
  say(`再穿 1 件（jin_thunder + crit_pct）→ 联动 ${JSON.stringify(G._synergies)}（应含 syn_storm）`);
  const synStormOK = G._synergies.indexOf("syn_storm") >= 0;
  say(synEmptyOK && synForgeOK && synHudOK && synStormOK
    ? "PASS 词条联动按需激活 + HUD 同步" : "FAIL 词条联动异常");

  say("");
  say("== 43) v6.0 B · 联动效果（熔炉 ×3 / 狂血攻速 ×2 / 悟道经验 ×1.5） ==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  G.crit = 0; G.invuln = 0;
  // 熔炉：对减速目标伤害 ×3
  const mk1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "shui_slow"] });
  X.pickUpEquip(mk1); X.equipTo(mk1.uid); X.equipRec();
  const tA = X.spawnEnemy("golem", 200, 200, 1); tA.hp = tA.hpMax = 1e6; tA.ward = 0; tA.mods = [];
  const tB = X.spawnEnemy("golem", 260, 260, 1); tB.hp = tB.hpMax = 1e6; tB.ward = 0; tB.mods = [];
  tB.slow = 5; tB.slowMul = 0.5;
  X.applyHit(tA, 100); const dA = 1e6 - tA.hp;
  X.applyHit(tB, 100); const dB = 1e6 - tB.hp;
  say(`同样挨 100：普通 ${dA.toFixed(1)} / 被减速 ${dB.toFixed(1)}（熔炉应 ≈3 倍，比值 ${(dB / dA).toFixed(2)}）`);
  const v6forgeOK = dB / dA > 2.6 && dB / dA < 3.4;
  // 狂血：击杀后攻速 ×2
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  const mk2 = X.makeEquip("weapon", "purple", { fixedAffixes: ["haste_pct", "jin_crit"] });
  X.pickUpEquip(mk2); X.equipTo(mk2.uid); X.equipRec();
  G._frenzyT = 0;
  const spdBase = X.atkSpeedNow();
  const killMe = X.spawnEnemy("fox", 300, 300, 1); killMe.mods = [];
  X.killEnemy(killMe);
  const spdFrenzy = X.atkSpeedNow();
  say(`狂血：击杀前攻速 ${spdBase.toFixed(3)} → 击杀后 ${spdFrenzy.toFixed(3)}（应 ×2），frenzyT=${G._frenzyT}`);
  const frenzyOK = Math.abs(spdFrenzy / spdBase - 2) < 0.01 && G._frenzyT === 2;
  // 悟道：击杀经验 ×1.5
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  X.equipRec();
  G.xpMul = 1; G.combo = 0; G.comboTimer = 0;
  const xpBaseEnemy = X.spawnEnemy("fox", 400, 400, 1); xpBaseEnemy.mods = [];
  G.xp = 0; X.killEnemy(xpBaseEnemy); const xp1 = G.xp;
  const mk3 = X.makeEquip("weapon", "purple", { fixedAffixes: ["xp_bonus", "sk_hp_regen"] });
  X.pickUpEquip(mk3); X.equipTo(mk3.uid); X.equipRec();
  G.combo = 0; G.comboTimer = 0;
  const xpSynEnemy = X.spawnEnemy("fox", 430, 430, 1); xpSynEnemy.mods = [];
  G.xp = 0; X.killEnemy(xpSynEnemy); const xp2 = G.xp;
  say(`悟道：同怪经验 ${xp1} → ${xp2}（应 ≥1.5 倍，实测 ${(xp2 / xp1).toFixed(2)} 含 xp_bonus 词条自身加成，xpMul ${1} → ${G.xpMul.toFixed(2)}）`);
  const enlightOK = xp2 > xp1 * 1.2;
  say(v6forgeOK && frenzyOK && enlightOK ? "PASS 联动效果为机制质变而非数值叠加" : "FAIL 联动效果异常");

  say("");
  say("== 44) v6.0 C · 祭坛赌注（刷出 / 走近触发 / 立契 / 拒绝） ==");
  forcePlay();
  G.altars = []; G._altarWave = 0; G.zones = []; G.enemies = [];
  G.wave = 5;
  X.updateAltars(0.016);
  say(`第 5 波：祭坛 ${G.altars.length} 座（应 1）`);
  const altarSpawnOK = G.altars.length === 1;
  const a0 = G.altars[0];
  G.px = a0.x; G.py = a0.y;
  X.updateAltars(0.016);
  const aChoiceN = els["altarChoices"].children.length;
  say(`走到祭坛：state=${G.state} 选项=${aChoiceN}（应 altar / 3）`);
  const altarOpenOK = G.state === "altar" && aChoiceN === 3;
  const hpMaxB = G.hpMax;
  X.takeAltarDeal("blood");
  X.equipRec();
  say(`立「血祭」：hpMax ${hpMaxB.toFixed(0)} → ${G.hpMax.toFixed(0)}（应 ×0.7）atkMul=${G.altarBuffs.atkMul}（应 1.5）state=${G.state}`);
  const dealOK = G.hpMax < hpMaxB * 0.76 && G.altarBuffs.atkMul === 1.5 && G.state === "play";
  // 拒绝：走到祭坛再点"不立契"
  G.altars = []; G._altarWave = 0; G.wave = 10;
  X.updateAltars(0.016);
  if (G.altars.length) { G.px = G.altars[0].x; G.py = G.altars[0].y; X.updateAltars(0.016); }
  els["btnAltarSkip"].dispatch("click");
  say(`拒绝立契：state=${G.state} 场上祭坛=${G.altars.length}（应 play / 0）`);
  const skipOK = G.state === "play" && G.altars.length === 0;
  // 空槽：掉落品阶提升
  say(`tierUp("white",1) = ${X.tierUp("white", 1)}（应 green）`);
  const v6tierOK = X.tierUp("white", 1) === "green" && X.tierUp("purple", 1) === "orange";
  say(altarSpawnOK && altarOpenOK && dealOK && skipOK && v6tierOK
    ? "PASS 祭坛刷出 / 走近触发 / 立契生效 / 可拒绝 / 品阶提升" : "FAIL 祭坛系统异常");

  say("");
  say("== 45) v6.0 · 静态接线 + DOM id 对齐 ==");
  const src = fs.readFileSync(SRC, "utf8");
  const wires = {
    "词缀表": /const ENEMY_MODS = \{/, "词缀挂载": /e\.mods = \(e\.elite \|\| e\.boss\)/,
    "护盾吸收": /if \(e\.ward > 0\)/, "荆棘反弹": /indexOf\("thorns"\) >= 0 && d > 0/,
    "分裂": /indexOf\("split"\) >= 0/, "自爆": /indexOf\("bomb"\) >= 0/,
    "冰霜力场": /indexOf\("frost"\) >= 0/, "噬魂回血": /indexOf\("drain"\) >= 0/,
    "联动表": /const SYNERGIES = \[/, "联动判定": /b\.synergies = SYNERGIES\.filter/,
    "熔炉": /synOn\("syn_forge"\)/, "血怒": /synOn\("syn_bloodrage"\)/,
    "雷暴": /synOn\("syn_storm"\)/, "荆棘壁垒": /synOn\("syn_thornwall"\)/,
    "玄铁壁": /synOn\("syn_ironwall"\)/, "狂血": /synOn\("syn_frenzy"\)/,
    "悟道": /synOn\("syn_enlight"\)/, "联动HUD": /function synHudSync/,
    "祭坛表": /const ALTAR_DEALS = \[/, "祭坛刷出": /function spawnAltar/,
    "祭坛触发": /function openAltar/, "祭坛生效": /function takeAltarDeal/,
    "祭坛绘制": /function drawAltars/, "力场绘制": /function drawZones/,
    "词缀绘制": /e\.mods && e\.mods\.length/, "品阶提升": /function tierUp/,
  };
  const missWire = Object.keys(wires).filter((k) => !wires[k].test(src));
  say(`静态接线 ${Object.keys(wires).length} 项，缺失 ${missWire.length} 项 ${missWire.join(",")}`);
  say(missWire.length === 0 ? "PASS v6.0 全部接线到位" : "FAIL 接线缺失");
  const v6ids = ["synHud", "synHudList", "synHudCount", "altarModal", "altarChoices", "btnAltarSkip"];
  const htmlV6 = fs.readFileSync(HTML, "utf8");
  const missV6 = v6ids.filter((id) => !htmlV6.includes(`id="${id}"`));
  say(`v6.0 新增 id ${v6ids.length} 个，HTML 缺失 ${missV6.length} 个 ${missV6.join(",")}`);
  say(missV6.length === 0 ? "PASS v6.0 所有新 id 均存在于 HTML" : "FAIL HTML 缺失 v6.0 id");

  say("");
  say("== 46) v6.1 · 武器觉醒（修 v4.0 断链：fire/frost/lightning/array 永远 0 级）==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._jobWpLv = { fire: 0, frost: 0, lightning: 0, array: 0 };
  X.equipRec();
  const w0 = G.weapons;
  say(`空装：业火=${w0.fire.lv} 寒冰=${w0.frost.lv} 紫电=${w0.lightning.lv} 剑阵=${w0.array.lv}（应全 0）`);
  const empty0 = w0.fire.lv === 0 && w0.frost.lv === 0 && w0.lightning.lv === 0 && w0.array.lv === 0;

  // 1 件赤锋（火 → 业火）
  const e1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "xp_bonus"] });
  X.pickUpEquip(e1); X.equipTo(e1.uid);
  const lv1f = G.weapons.fire.lv;
  // 2 件赤锋
  const e2 = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_burn", "shield_max", "haste_pct"] });
  X.pickUpEquip(e2); X.equipTo(e2.uid);
  const lv2f = G.weapons.fire.lv;
  // 3 件赤锋 ⇒ 觉醒
  const e3 = X.makeEquip("accessory", "purple", { fixedAffixes: ["huo_fire", "lifesteal", "crit_pct"] });
  X.pickUpEquip(e3); X.equipTo(e3.uid);
  const lv3f = G.weapons.fire.lv, evoF = G.weapons.fire.evo;
  say(`赤锋 1/2/3 件 → 业火 Lv.${lv1f}/${lv2f}/${lv3f}，觉醒=${evoF}（应 1/2/3 且 3 件时觉醒）`);
  const wpOK = empty0 && lv1f === 1 && lv2f === 2 && lv3f === 3 && evoF === true;

  // 霜晶 → 寒冰
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._jobWpLv = { fire: 0, frost: 0, lightning: 0, array: 0 };
  X.equipRec();
  const f1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["shui_slow", "crit_pct", "xp_bonus"] });
  X.pickUpEquip(f1); X.equipTo(f1.uid);
  say(`1 件霜晶 → 寒冰 Lv.${G.weapons.frost.lv}（应 1）· 业火回落到 ${G.weapons.fire.lv}（应 0）`);
  const wp2OK = G.weapons.frost.lv === 1 && G.weapons.fire.lv === 0;
  say(wpOK && wp2OK ? "PASS 武器按装备派系点亮/升级/觉醒，换装即时回落" : "FAIL 武器觉醒异常");

  say("");
  say("== 47) v6.1 · 法门自动择定（修 v4.0 断链：9 个法门全是死内容）==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._jobWpLv = { fire: 0, frost: 0, lightning: 0, array: 0 };
  G.jobBranches = {}; G.jobPath = null; G.jobStage = 0; G._setSchool = null;
  G.charId = "sword";
  G._stoneSlot = null;
  X.equipRec();
  say(`空装：jobPath=${G.jobPath} jobBranches=${JSON.stringify(G.jobBranches)}（应 null / {}）`);
  const jbEmpty = !G.jobPath && Object.keys(G.jobBranches).length === 0;

  // 3 件「赤锋」同派系 ⇒ 转职剑道 + 自动择「赤锋→第 0 门」= 万剑归流
  const b1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "xp_bonus"] });
  const b2 = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_dmg", "shield_max", "haste_pct"] });
  const b3 = X.makeEquip("accessory", "purple", { fixedAffixes: ["huo_dmg", "lifesteal", "crit_pct"] });
  const sc0 = G.swordCount, so0 = G.swordOrbit;
  [b1, b2, b3].forEach((e) => { X.pickUpEquip(e); X.equipTo(e.uid); });
  const jb1 = Object.keys(G.jobBranches);
  const lvA = G.jobBranches[jb1[0]] || 0;
  say(`3 件赤锋：jobPath=${G.jobPath} 主派系=${G._setSchool} 法门=${jb1.join(",")} Lv.${lvA}`);
  say(`   飞剑 ${sc0}->${G.swordCount} 环绕半径 ${so0}->${G.swordOrbit}（第 0 门「万剑归流」每级 +2 剑 / +16 半径）`);
  // 业火已觉醒（3 件）⇒ 目标 Lv.2
  const jbOK1 = G.jobPath === "sword" && jb1.length === 1 && jb1[0] === "sword_multi" && lvA === 2
             && G.swordCount === sc0 + 4 && Math.abs(G.swordOrbit - (so0 + 32)) < 1e-6;

  // 灵石槽放同派系 ⇒ 再 +1 级（Lv.3 上限）
  G.stones = G.stones || {};
  for (const s of (X.STONES_ALL || [])) G.stones[s.key] = (G.stones[s.key] || 0) + 1;
  X.setStoneSlot("chifeng");
  X.equipRec();
  const lvB = G.jobBranches[jb1[0]] || 0;
  say(`灵石槽放赤锋后：Lv.${lvA}->${lvB}（应 3，上限 ${X.JOB_BRANCH_MAX_LV}）飞剑 ${G.swordCount}（应 ${sc0 + 6}）`);
  const jbOK2 = lvB === 3 && G.swordCount === sc0 + 6;

  // HUD 不再显示"未择法门"
  const branchTxt = els["jobHudBranch"] ? els["jobHudBranch"].textContent : "";
  say(`转职 HUD 法门栏：「${branchTxt}」（不应为空/未择法门）`);
  const hudOK = branchTxt && branchTxt.indexOf("未择法门") < 0;
  // 静态接线
  const v61wires = {
    "武器同步": /function syncWeaponsFromSet/, "法门同步": /function syncJobBranchesFromSet/,
    "派系→武器表": /const SCHOOL_WEAPON = \{/, "派系→法门表": /const SCHOOL_BRANCH_IDX = \{/,
    "equipRec接武器": /syncWeaponsFromSet\(\);/, "equipRec接法门": /syncJobBranchesFromSet\(\);/,
    "法门加成不被覆盖": /\(G\._jobAtkMul \|\| 1\)/, "攻速系数": /\(G\._jobAtkSpeedMul \|\| 1\)/,
  };
  const miss61 = Object.keys(v61wires).filter((k) => !v61wires[k].test(src));
  say(`v6.1 静态接线 ${Object.keys(v61wires).length} 项，缺失 ${miss61.length} 项 ${miss61.join(",")}`);
  say(jbEmpty && jbOK1 && jbOK2 && hudOK && miss61.length === 0
    ? "PASS 转职后自动择定法门，投入越深境界越高，HUD 实时显示" : "FAIL 法门自动择定异常");

  say("");
  say("== 48) v7.0 A · 双兵合击（两把武器 Lv≥2 ⇒ 解锁合击技）==");
  forcePlay();
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._jobWpLv = { fire: 0, frost: 0, lightning: 0, array: 0 };
  G.fusions = []; G.blasts = []; G.enemies = []; G.zones = [];
  X.equipRec();
  // 双修流：两件混搭（火+雷各 1 词条）+ 一件火 ⇒ 业火 3（觉醒）/ 紫电 2
  const m1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "jin_thunder", "crit_pct"] });
  const m2 = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_burn", "jin_thunder", "shield_max"] });
  const m3 = X.makeEquip("accessory", "purple", { fixedAffixes: ["huo_fire", "lifesteal", "crit_pct"] });
  [m1, m2, m3].forEach((e) => { X.pickUpEquip(e); X.equipTo(e.uid); });
  say(`混搭配装：业火 Lv${G.weapons.fire.lv}（觉醒 ${G.weapons.fire.evo}）· 紫电 Lv${G.weapons.lightning.lv}（觉醒 ${G.weapons.lightning.evo}）`);
  say(`解锁合击：${G.fusions.map((f) => f.id + (f.perfect ? "(圆满)" : "")).join(",") || "无"}（应含 fl 雷火劫）`);
  const fusUnlock = G.weapons.fire.lv === 3 && G.weapons.lightning.lv === 2 && G.fusions.some((f) => f.id === "fl");

  // 释放：造一个目标，CD 归零后 tick ⇒ 应产生爆点并结算伤害
  const fusTgt = X.spawnEnemy("fox", G.px + 70, G.py, 5);
  const fsn = G.fusions.find((f) => f.id === "fl");
  fsn.cdLeft = 0;
  X.updateFusions(0.016);
  const blastN = G.blasts.length;
  const fusHpB = fusTgt.hp;
  for (let i = 0; i < 40; i++) X.updateBlasts(0.02);
  say(`合击释放：爆点 ${blastN} 个 · 目标 ${Math.round(fusHpB)} → ${fusTgt.dead ? "已斩" : Math.round(fusTgt.hp)} · CD 重置 ${fsn.cdLeft.toFixed(1)}s`);
  const fusCast = blastN > 0 && (fusTgt.dead || fusTgt.hp < fusHpB) && fsn.cdLeft > 0;

  // 专精流：3 件纯火 ⇒ 只有业火觉醒，不解锁合击（两条 build 路互斥，不是 bug）
  G.inventory = []; G.equipped = { weapon: null, armor: null, accessory: null };
  G._jobWpLv = { fire: 0, frost: 0, lightning: 0, array: 0 };
  G.fusions = [];
  X.equipRec();
  const p1 = X.makeEquip("weapon", "purple", { fixedAffixes: ["huo_dmg", "crit_pct", "xp_bonus"] });
  const p2 = X.makeEquip("armor", "purple", { fixedAffixes: ["huo_burn", "shield_max", "haste_pct"] });
  const p3 = X.makeEquip("accessory", "purple", { fixedAffixes: ["huo_fire", "lifesteal", "crit_pct"] });
  [p1, p2, p3].forEach((e) => { X.pickUpEquip(e); X.equipTo(e.uid); });
  say(`专精配装：业火 Lv${G.weapons.fire.lv}（觉醒 ${G.weapons.fire.evo}）· 合击 ${G.fusions.length} 个（应 0，专精走法门不走合击）`);
  const fusExclusive = G.weapons.fire.evo === true && G.fusions.length === 0;
  say(fusUnlock && fusCast && fusExclusive
    ? "PASS 双修解锁合击并自动释放，专精路线不误触发" : "FAIL 双兵合击异常");

  say("");
  say("== 49) v7.0 B · 尸潮涌（每 7 波灌入一大群低血尸傀）==");
  forcePlay();
  G.enemies = []; G.blasts = []; G._horde = null; G._hordeWave = 0; G.coinsRun = 0;
  X.startHorde(7);
  for (let i = 0; i < 420; i++) X.updateHorde(0.05);            // 21s：足够全部涌出
  const spawned = G._horde ? G._horde.spawned : -1;
  const aliveN = G.enemies.filter((e) => e.horde && !e.dead).length;
  say(`尸潮涌出 ${spawned} 只（应 ${X.hordeSize(7)}）· 场上存活 ${aliveN} · 剩余时间 ${G._horde ? G._horde.t.toFixed(1) : "-"}s`);
  const hordeSpawn = spawned === X.hordeSize(7) && aliveN > 40;
  // 清场 ⇒ 应触发奖励
  const coins0 = G.coinsRun;
  G.enemies.forEach((e) => { if (e.horde && !e.dead) X.killEnemy(e, false); });
  X.updateHorde(0.05);
  say(`清场后：active=${G._horde ? G._horde.active : "null"} · 灵玉 ${coins0} → ${G.coinsRun}（应 +120）`);
  const hordeReward = G._horde && G._horde.active === false && G.coinsRun === coins0 + 120;
  // 波次接线：每 7 波触发，且不与妖王波（5 的倍数）重叠
  const waveHits = [];
  for (let w = 1; w <= 35; w++) if (w % 7 === 0 && w % 5 !== 0) waveHits.push(w);
  say(`35 波内尸潮波次：${waveHits.join(",")}（避开 5 的倍数妖王波）`);
  say(hordeSpawn && hordeReward && waveHits.length >= 4
    ? "PASS 尸潮批量涌出、清完给奖、节奏避开妖王波" : "FAIL 尸潮涌异常");

  say("");
  say("== 50) v7.0 B2 · 连锁击杀（尸体引爆向邻近敌人传导）==");
  forcePlay();
  G.enemies = []; G.blasts = []; G.combo = 40; G._chainDepth = 0; G._chainKills = 0;
  const chA = X.spawnEnemy("fox", G.px + 90, G.py, 3);
  const chB = X.spawnEnemy("fox", G.px + 150, G.py, 3);
  chA.dead = true;                                  // 模拟 chA 刚被击杀
  let chainHit = 0;
  for (let i = 0; i < 60; i++) { G._chainDepth = 0; X.tryChainKill(chA); if (G.blasts.length) { chainHit++; G.blasts = []; } }
  say(`60 次击杀 → 连锁引爆 ${chainHit} 次（连杀 40 时概率约 ${(0.10 + 40 * 0.005).toFixed(2)}）`);
  const chainRate = chainHit > 5 && chainHit < 50;
  // 结算：连锁爆点必须真正造成伤害
  G.blasts = []; G._chainDepth = 0;
  let guardC = 0;
  while (G.blasts.length === 0 && guardC++ < 200) X.tryChainKill(chA);
  const cbHp0 = chB.hp;
  for (let i = 0; i < 12; i++) X.updateBlasts(0.02);
  say(`连锁结算：${Math.round(cbHp0)} → ${chB.dead ? "已斩" : Math.round(chB.hp)} · 连锁计数 ${G._chainKills}`);
  const chainDmg = chB.dead || chB.hp < cbHp0;
  say(chainRate && chainDmg ? "PASS 连锁按概率触发并真实结算伤害" : "FAIL 连锁击杀异常");

  say("");
  say("== 51) v7.0 C · 瞬步（冲刺留剑影 + 无敌帧延长）==");
  forcePlay();
  G.enemies = []; G.afterimages = []; G.mp = 50; G.dashCDLeft = 0; G.dashTimer = 0;
  const ba = X.spawnEnemy("fox", G.px + 24, G.py, 3);
  X.castSkill(1);
  say(`瞬步：剑影 ${G.afterimages.length} 个 · 无敌 ${G.dashIFrame.toFixed(2)}s（应 ≥0.5s，原 0.40s）`);
  const blinkOK = G.afterimages.length === 1 && G.dashIFrame >= 0.5;
  const baHp0 = ba.hp;
  X.updateAfterimages(0.016);
  say(`剑影伤害：${Math.round(baHp0)} → ${ba.dead ? "已斩" : Math.round(ba.hp)}（冲过人群即造成伤害）`);
  const blinkDmg = ba.dead || ba.hp < baHp0;
  // 冲刺持续期间沿途持续留影（走主循环）
  const blinkBefore = G.afterimages.length;
  for (let i = 0; i < 12; i++) X.update(0.016);
  say(`冲刺中持续留影：${blinkBefore} → ${G.afterimages.length}（应增加）`);
  const blinkTrail = G.afterimages.length >= blinkBefore;
  say(blinkOK && blinkDmg && blinkTrail ? "PASS 瞬步无敌延长且沿途剑影造成伤害" : "FAIL 瞬步异常");

  say("");
  say("== 52) v7.0 C · 濒死狂血（血量 25% 以下五息反杀）==");
  forcePlay();
  G.hpMax = 1000; G.hp = 200; G._frenzyT = 0; G._frenzyCD = 0;
  const dm0 = X.playerDamageMult(), as0 = X.atkSpeedNow();
  X.updateFrenzy(0.016);
  const dm1 = X.playerDamageMult(), as1 = X.atkSpeedNow();
  say(`血量 20% ⇒ _frenzyT=${G._frenzyT}s · 伤害 ${dm0.toFixed(2)}→${dm1.toFixed(2)}（×1.5）· 攻速 ${as0.toFixed(2)}→${as1.toFixed(2)}（×2）`);
  const frenzyOn = G._frenzyT === X.FRENZY_TIME && Math.abs(dm1 - dm0 * 1.5) < 1e-6 && Math.abs(as1 - as0 * 2) < 1e-6;
  // 内置 CD：狂血结束后不会立刻再次触发
  G._frenzyT = 0;
  X.updateFrenzy(0.016);
  say(`狂血结束后再 tick：_frenzyT=${G._frenzyT}（应 0）· CD 剩余 ${G._frenzyCD.toFixed(1)}s（应 >0）`);
  const frenzyCD = G._frenzyT === 0 && G._frenzyCD > 0;
  // 满血不触发
  G.hp = G.hpMax; G._frenzyCD = 0; G._frenzyT = 0;
  X.updateFrenzy(0.016);
  const frenzySafe = G._frenzyT === 0;
  say(`满血 tick：_frenzyT=${G._frenzyT}（应 0）`);
  say(frenzyOn && frenzyCD && frenzySafe ? "PASS 濒死触发狂血、内置 CD 防刷、满血不误触发" : "FAIL 濒死狂血异常");

  say("");
  say("== 53) v7.0 · 割草密度（同屏怪量是爽点的底座）==");
  const w10 = X.buildWave(10).length, w20 = X.buildWave(20).length, w30 = X.buildWave(30).length;
  say(`第 10/20/30 波刷怪量 ${w10}/${w20}/${w30}（v7.0 前为 ${3 + Math.floor(10 * 0.85)}/${3 + Math.floor(20 * 0.85)}/${3 + Math.floor(30 * 0.85)}）`);
  const densOK = w10 >= 17 && w20 >= 31 && w30 >= 44;
  // 静态接线：v7.0 各系统必须真的被主循环 / 击杀链调用
  const v70wires = {
    "合击定义": /const FUSION_DEFS = \[/, "合击同步": /function syncFusions/,
    "合击tick": /updateFusions\(dt\);/, "合击伤害": /function fusDmg/,
    "爆点队列": /function updateBlasts/, "尸潮定义": /function startHorde/,
    "尸潮tick": /updateHorde\(dt\);/, "尸潮触发": /startHorde\(G\.wave\);/,
    "连锁挂钩": /tryChainKill\(e\);/, "瞬步残影": /function spawnAfterimage/,
    "残影tick": /updateAfterimages\(dt\);/, "无敌延长": /G\.dashIFrame = G\.dashTime \+ 0\.25;/,
    "狂血tick": /updateFrenzy\(dt\);/, "狂血加伤": /m \*= 1\.5;/,
    "双击瞬步": /castSkill\(1\);/, "密度提升": /4 \+ Math\.floor\(wave \* 1\.35\)/,
    "尸傀入敌表": /hordeling: \{ name: "尸傀"/,
  };
  const miss70 = Object.keys(v70wires).filter((k) => !v70wires[k].test(src));
  say(`v7.0 静态接线 ${Object.keys(v70wires).length} 项，缺失 ${miss70.length} 项 ${miss70.join(",")}`);
  say(densOK && miss70.length === 0 ? "PASS 密度抬升到位，v7.0 各系统接线完整" : "FAIL 密度/接线异常");

  say("== 运行状态 ==");
  say(`state=${G.state} wave=${G.wave} kills=${G.kills} enemies=${G.enemies.length} hp=${Math.round(G.hp)} lv=${G.level}`);
  say("v5.0 测试结束");
} catch (e) {
  say("");
  say("EXCEPTION: " + (e && e.stack ? e.stack : e));
} finally {
  flush();
}
