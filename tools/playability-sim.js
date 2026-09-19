/* 玩法可玩性探针：真实跑 game.js 的完整一局，统计「玩家到底碰到了几次每个系统」
 *
 * 用法： node tools/playability-sim.js
 *
 * 与 audit-sim（静态：这段代码有没有被调用）的区别：
 *   静态只能证明「线接上了」，证明不了「一局里玩家真的会遇到」。
 *   本探针是真的开一局、让一个 AI 玩家打完整场，逐帧采样每个系统的触发边沿。
 *
 * AI 玩家行为（刻意做成「中等水平玩家」，不作弊）：
 *   · 走位：离最近的怪太近就退，否则朝最近的掉落物走
 *   · 升级：弹卡就选（优先形态类，模拟懂行的玩家）
 *   · 装备：捡到紫/橙就穿
 *   · 灵石：拿到灵石就设本命（验证 v7.3 P0 修复）
 *   · 祭坛：遇到就赌第一契
 *   · 瞬步：被围就放
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const SITE = path.join(__dirname, "..");
const SRC = path.join(SITE, "game.js");
const OUT = process.env.XTJ_PLAY_OUT || path.join(__dirname, "playability-report.txt");
let AI_MIX = process.env.XTJ_AI === "mix";
const MAX_SECONDS = Number(process.env.XTJ_PLAY_SEC || 480);   // 最长模拟 8 分钟
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
const nav = { userAgent: "node-playability", platform: "Win32", maxTouchPoints: 0, deviceMemory: 8, hardwareConcurrency: 8, vibrate: noop };
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

// ---------- 触发计数器 ----------
const C = {};
const bump = (k, t) => { const o = (C[k] = C[k] || { n: 0, first: null }); o.n += 1; if (o.first === null) o.first = t; };
const prev = {};
const edge = (k, cur, t, cond) => {
  const p = prev[k];
  prev[k] = cur;
  if (p !== undefined && cond(p, cur)) bump(k, t);
};

// ---------- 模拟一局 ----------
function run() {
  store["xtj_meta_v1"] = undefined;
  els["btnStart"].dispatch("click");
  for (let i = 0; i < 2; i++) { const cbs = rafQueue.splice(0, rafQueue.length); T += 16; for (const cb of cbs) cb(T); }
  G.state = "play";
  G.hitStop = 0;

  const dt = 1 / 40;                 // 25ms 步长：够准，也能把 8 分钟压到可接受的耗时
  const frames = MAX_SECONDS * 40;
  let t = 0;
  let dead = false, deathT = null;
  let fusionCd = {}, lastFrenzy = 0, lastBurst = 0, lastChain = 0;
  let lastStoneSlot = null, lastBountyId = null, lastAltarN = 0;
  let evoSeed = {}, branchMax = {}, lastBranchLv = {};
  let upgrades = 0, formOffered = 0, formTaken = 0, lastLevel = G.level;
  let firstFormStarve = null;        // 牌面第一次没有「变」类的时刻
  let peakEnemies = 0, peakParts = 0;
  let hordeSeen = 0, bossSeen = 0, eliteSeen = 0;
  let stonesGot = 0, stoneSlotSetAt = null;
  let equippedCount = 0;
  let lastHurtHp = G.hp, hurts = 0;

  for (let f = 0; f < frames; f++) {
    t = f * dt;

    // ---- AI 走位：太近就退，否则朝最近掉落物走 ----
    let near = null, nd = 1e9;
    for (const e of G.enemies) {
      if (e.dead) continue;
      const d = Math.hypot(e.x - G.px, e.y - G.py);
      if (d < nd) { nd = d; near = e; }
    }
    let tx = G.px, ty = G.py;
    if (near && nd < 150) {
      const a = Math.atan2(G.py - near.y, G.px - near.x);
      tx = G.px + Math.cos(a) * 200; ty = G.py + Math.sin(a) * 200;
    } else if ((G.altars || []).length) {
      // 祭坛优先：玩家看到就会想过去赌一把
      let al = G.altars[0];
      tx = al.x; ty = al.y;
    } else if (G.pickups.length) {
      let pk = null, pd = 1e9;
      for (const p of G.pickups) {
        const d = Math.hypot(p.x - G.px, p.y - G.py);
        if (d < pd) { pd = d; pk = p; }
      }
      if (pk) { tx = pk.x; ty = pk.y; }
    }
    const ang = Math.atan2(ty - G.py, tx - G.px);
    const sp = G.moveSpeed * dt;
    G.px += Math.cos(ang) * sp; G.py += Math.sin(ang) * sp;

    // ---- AI 用瞬步：被 3 只以上围住就冲 ----
    let crowd = 0;
    for (const e of G.enemies) { if (!e.dead && Math.hypot(e.x - G.px, e.y - G.py) < 90) crowd++; }
    if (crowd >= 3 && (G.dashCDLeft || 0) <= 0) { X.castSkill(1); bump("dash", t); }

    X.update(dt);
    G.hitStop = 0;

    // ---- 弹窗：升级 / 祭坛 ----
    if (G.state === "level") {
      const kids = (els["levelChoices"] || {}).children || [];
      if (kids.length) {
        upgrades++;
        // 优先「变」类（模拟懂行玩家）：卡片 innerHTML 里含 form 标记
        let idx = 0;
        const htmls = kids.map((k) => String(k.innerHTML || ""));
        const formIdx = htmls.findIndex((h) => /t-burst|form/.test(h));
        if (formIdx >= 0) { idx = formIdx; formOffered++; formTaken++; }
        kids[idx].dispatch("click");
      } else {
        if (firstFormStarve === null) firstFormStarve = t;
        G.pendingLevel = 0; G.state = "play";
      }
    }
    if (G.state === "altar") {
      const kids = (els["altarChoices"] || {}).children || [];
      if (kids.length) { kids[Math.floor(Math.random() * kids.length)].dispatch("click"); bump("altar", t); }
      else { G.state = "play"; }
    }
    if (G.state === "pause") G.state = "play";

    // ---- AI 整理背包：模拟「懂行玩家」——优先凑同派系（纯度/觉醒/法门 Lv3 的前提）----
    if (f % 80 === 0) {
      const schoolOfEq = (eq) => {
        for (const ax of (eq.affixes || [])) {
          const d = X.AFFIX_POOL && X.AFFIX_POOL[ax];
          if (d && d.school) return d.school;
        }
        return null;
      };
      const hi = [...G.inventory, ...Object.values(G.equipped).filter(Boolean)]
        .filter((e) => e.tier === "purple" || e.tier === "orange");
      const cnt2 = {};
      for (const eq of hi) { const s = schoolOfEq(eq); if (s) cnt2[s] = (cnt2[s] || 0) + 1; }
      const ranked = Object.keys(cnt2).sort((a, b) => cnt2[b] - cnt2[a]);
      // 专精流：全押一派（觉醒 + 法门 Lv3）；双修流：两派各投（双兵合击）
      const target = AI_MIX ? null : (ranked[0] || null);
      const want = {};
      if (AI_MIX && ranked.length >= 2) {
        want.weapon = ranked[0]; want.armor = ranked[0]; want.accessory = ranked[1];
      }
      for (const slot of ["weapon", "armor", "accessory"]) {
        const wantSch = AI_MIX ? (want[slot] || null) : target;
        const cur = G.equipped[slot];
        if (cur && (!wantSch || schoolOfEq(cur) === wantSch)) continue;
        const cand = G.inventory.find((e) => (e.tier === "purple" || e.tier === "orange")
          && e.slot === slot && (!wantSch || schoolOfEq(e) === wantSch));
        if (cand) {
          if (cur) X.unequipTo(slot);
          if (X.equipTo(cand.uid)) { equippedCount++; bump("equip", t); }
        }
      }
      // 灵石槽：专精流补同一派；双修流补第二派（把第二把武器顶到 Lv2 以解锁合击）
      const stoneSch = AI_MIX ? (ranked[1] || null) : target;
      // v7.3 P0：把灵石槽真的用起来（此前 setStoneSlot 零调用），且选同派系那颗
      const wantStone = !G._stoneSlot || (stoneSch && G._stoneSlot.school !== stoneSch);
      if (wantStone && stoneSch) {
        const owned = X.stonesOf().filter((s) => X.stoneAt(s.key) > 0 && s.school === stoneSch);
        if (owned.length) {
          if (G._stoneSlot) X.setStoneSlot(null);
          if (X.toggleStoneSlot(owned[0].key)) { bump("stoneSlot", t); if (stoneSlotSetAt === null) stoneSlotSetAt = t; }
        }
      } else if (!G._stoneSlot) {
        const owned = X.stonesOf().filter((s) => X.stoneAt(s.key) > 0);
        if (owned.length && X.toggleStoneSlot(owned[0].key)) { bump("stoneSlot", t); if (stoneSlotSetAt === null) stoneSlotSetAt = t; }
      }
    }

    // ---- 采样各系统触发边沿 ----
    // 武器觉醒
    for (const wk in (G.weapons || {})) {
      const w = G.weapons[wk];
      if (w.evo && !evoSeed[wk]) { evoSeed[wk] = true; bump("weaponEvo", t); }
      if ((w.lv || 0) > 0 && !prev["wp_" + wk]) bump("weaponLv", t);
      prev["wp_" + wk] = (w.lv || 0) > 0;
    }
    // 法门境界
    for (const bk in (G.jobBranches || {})) {
      const lv = G.jobBranches[bk] || 0;
      branchMax[bk] = Math.max(branchMax[bk] || 0, lv);
      if (lv > (lastBranchLv[bk] || 0)) {
        for (let i = (lastBranchLv[bk] || 0); i < lv; i++) bump("jobLv" + (i + 1), t);
        lastBranchLv[bk] = lv;
      }
    }
    // 合击：cdLeft 被重置回 cd 即释放了一次
    for (const fu of (G.fusions || [])) {
      const p = fusionCd[fu.id];
      if (p !== undefined && fu.cdLeft > p + 0.01) bump("fusion", t);
      fusionCd[fu.id] = fu.cdLeft;
    }
    if ((G.fusions || []).length && !prev.hadFusion) { bump("fusionUnlock", t); }
    prev.hadFusion = (G.fusions || []).length > 0;
    // 尸潮
    if ((G._hordeWave || 0) !== (prev.hordeWave || 0)) { prev.hordeWave = G._hordeWave; if (G._hordeWave) { hordeSeen++; bump("horde", t); } }
    // 连锁
    const ck = G._chainKills || 0;
    if (ck > lastChain) bump("chain", t);
    lastChain = ck;
    // 剑意爆发
    if ((G._comboBurstT || 0) > lastBurst + 0.01) bump("comboBurst", t);
    lastBurst = G._comboBurstT || 0;
    // 狂血
    if ((G._frenzyT || 0) > lastFrenzy + 0.01) bump("frenzy", t);
    lastFrenzy = G._frenzyT || 0;
    // 悬赏
    const b = G.bounty;
    if (b && b.id !== lastBountyId) {
      if (b.state === "active") { lastBountyId = b.id; bump("bounty", t); }
    }
    if (b && b.state === "done" && lastBountyId === b.id) { bump("bountyDone", t); lastBountyId = "done:" + b.id; }
    if (!b) lastBountyId = null;
    // 祭坛出现
    const an = (G.altars || []).length;
    if (an > lastAltarN) bump("altarSpawn", t);
    lastAltarN = an;
    // 拾取（灵石计数变化）
    let tot = 0; for (const s of X.stonesOf()) tot += X.stoneAt(s.key);
    if (tot > stonesGot) stonesGot = tot;
    // 敌人类型
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (e.boss && !(prev["bs" + e.id])) { prev["bs" + e.id] = 1; bossSeen++; }
      if (e.elite && !(prev["el" + e.id])) { prev["el" + e.id] = 1; eliteSeen++; }
    }
    // 派系核心 / 联动
    const cores = Object.keys(G.schoolFx || {}).filter((k) => G.schoolFx[k]).length;
    if (cores > (prev.cores || 0)) bump("core", t);
    prev.cores = cores;
    const synN = (X.SYNERGIES || []).filter((s) => X.synOn(s.id)).length;
    if (synN > (prev.syn || 0)) bump("synergy", t);
    prev.syn = synN;
    // 峰值
    const alive = G.enemies.filter((e) => !e.dead).length;
    if (alive > peakEnemies) peakEnemies = alive;
    if ((G.particles || []).length > peakParts) peakParts = G.particles.length;
    // 挨打
    if (G.hp < lastHurtHp - 0.01) hurts++;
    lastHurtHp = G.hp;

    if (G.state === "over" || G.hp <= 0) { dead = true; deathT = t; break; }
  }

  // 结算
  const formSupply = (X.UPGRADE_POOL || []).filter((u) => u.cls === "form")
    .reduce((a, u) => a + (u.max || 99), 0);
  const formTakenTotal = Object.keys(G._upgradeTaken || {}).reduce((a, k) => {
    const u = X.UPGRADE_BY_ID[k];
    return a + (u && u.cls === "form" ? G._upgradeTaken[k] : 0);
  }, 0);

  // 诊断：身上三件的派系词条，以及四把武器的等级（觉醒到底差在哪）
  const schOf = (eq) => (eq.affixes || []).map((a) => (X.AFFIX_POOL[a] || {}).school).filter(Boolean).join("/") || "无派系";
  const worn = Object.entries(G.equipped || {}).filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v.tier}(${schOf(v)})`).join(" · ") || "空";
  const wpLv = Object.entries(G.weapons || {}).map(([k, w]) => `${k} Lv${w.lv || 0}${w.evo ? "★" : ""}`).join(" · ");
  const eqAll = [...(G.inventory || []), ...Object.values(G.equipped || {}).filter(Boolean)];
  const purple = eqAll.filter((e) => e.tier === "purple").length;
  const orange = eqAll.filter((e) => e.tier === "orange").length;

  return {
    t, dead, deathT, wave: G.wave, level: G.level, kills: G.kills,
    upgrades, formOffered, formTaken, formTakenTotal, formSupply, firstFormStarve,
    peakEnemies, peakParts, hurts, hordeSeen, bossSeen, eliteSeen, equippedCount,
    stoneSlotSetAt, stonesGot, branchMax, evoSeed, worn, wpLv,
    purple, orange, atk: G.atk, hpMax: G.hpMax,
  };
}

say("玄天劫 · 玩法可玩性探针 —— 真实跑完整一局，统计每个系统玩家碰到了几次");
say("生成时间 " + new Date().toISOString());
say(`模拟时长上限 ${MAX_SECONDS}s · AI 流派：${AI_MIX ? "双修流（两派各投 · 验证双兵合击可达）" : "专精流（全押一派 · 验证觉醒与法门 Lv3）"} · 行为：走位躲怪 / 捡东西 / 升级选卡（优先形态）/ 穿紫橙 / 设本命灵石 / 被围瞬步`);
say("");

function report(styleLabel) {
const r = run();

say("===== " + styleLabel + " · 一局结果 =====");
say(`结局：${r.dead ? `第 ${r.deathT.toFixed(0)}s 阵亡` : "活到模拟结束（未死）"} · 撑到第 ${r.wave} 波 · 等级 ${r.level} · 击杀 ${r.kills}`);
say(`终局属性：攻击 ${r.atk.toFixed(0)} · 生命上限 ${r.hpMax.toFixed(0)} · 挨打 ${r.hurts} 次 · 同屏峰值 ${r.peakEnemies} 只 · 粒子峰值 ${r.peakParts}`);
say(`妖王出场 ${r.bossSeen} 只 · 精英出场 ${r.eliteSeen} 只 · 灵石累计 ${r.stonesGot} 颗`);
say(`装备：紫装 ${r.purple} 件 / 橙装 ${r.orange} 件 · 穿上身 ${r.equippedCount} 次`);
say(`法门境界最高：${Object.keys(r.branchMax).length ? Object.entries(r.branchMax).map(([k, v]) => `${k} Lv${v}`).join(" · ") : "未入任何门"}`);
say(`武器觉醒：${Object.keys(r.evoSeed).length ? Object.keys(r.evoSeed).join(" · ") : "无"}`);
say(`[诊断] 终局身上：${r.worn}`);
say(`[诊断] 武器等级：${r.wpLv}`);
say("");

say("===== 各系统实际触发次数（0 = 玩家一局都没碰到）=====");
const rows = [
  ["武器升级（任意武器 Lv≥1）", "weaponLv", "配装派系 → 武器点亮"],
  ["武器觉醒（3 件同派系）", "weaponEvo", "形态质变 + 法门 Lv2 前置"],
  ["法门境界 Lv1", "jobLv1", "3 件同派系自动择定"],
  ["法门境界 Lv2", "jobLv2", "该派系武器已觉醒"],
  ["法门境界 Lv3", "jobLv3", "v7.3 P0：需灵石槽同派系"],
  ["双兵合击解锁", "fusionUnlock", "两把武器各 Lv≥2"],
  ["双兵合击释放", "fusion", "自动蓄能放技"],
  ["尸潮涌", "horde", "每 7 波"],
  ["连锁击杀", "chain", "尸体引爆传导"],
  ["剑意爆发", "comboBurst", "每 20 连杀（可减）"],
  ["濒死狂血", "frenzy", "血量 ≤25%"],
  ["瞬步（AI 主动放）", "dash", "被围时冲刺"],
  ["悬赏令发布", "bounty", "每 6 波"],
  ["悬赏令达成", "bountyDone", "发奖励"],
  ["祭坛出现", "altarSpawn", "波间随机刷新"],
  ["祭坛抉择", "altar", "走近赌博"],
  ["派系核心解锁", "core", "同派系灵石 5 颗"],
  ["词条联动生效", "synergy", "8 组组合"],
  ["灵石槽入槽", "stoneSlot", "v7.3 P0 修复项"],
  ["穿装备", "equip", "紫/橙上身"],
];
let zero = 0;
for (const [label, key, note] of rows) {
  const o = C[key];
  const n = o ? o.n : 0;
  if (n === 0) zero++;
  const mark = n === 0 ? "❌" : "✅";
  say(`${mark} ${label.padEnd(22, "　")} ${String(n).padStart(5)} 次` +
      (o ? `　首次 ${o.first.toFixed(1)}s` : "") + `　（${note}）`);
}
say("");
say(`未触发系统数：${zero} / ${rows.length}`);

say("");
say("===== 成长抉择质量（v7.1 的核心修复）=====");
say(`升级选卡 ${r.upgrades} 次 · 其中拿到「变」类 ${r.formTaken} 次 · 本局累计变类投入 ${r.formTakenTotal} / 总供给 ${r.formSupply}`);
say(r.firstFormStarve === null
  ? "✅ 整局牌面始终有「变」类可选（未出现枯竭）"
  : `❌ 第 ${r.firstFormStarve.toFixed(0)}s 起牌面无「变」类（卡池枯竭）`);

say("");
say("===== 关键结论 =====");
const issues = [];
if (!C.stoneSlot) issues.push("灵石槽仍未入槽 —— P0 修复可能没生效，或 AI 没拿到灵石");
if (!C.jobLv3) issues.push("法门 Lv3 未达成 —— 灵石槽与法门的联动仍不通");
if (!C.fusion) issues.push("合击一次都没放 —— 双修流仍不可达");
if (!C.horde) issues.push("尸潮未出现 —— 需活到第 7 波");
if (zero > 0) issues.push(`有 ${zero} 个系统整局 0 触发`);
say(issues.length ? issues.map((s) => "⚠ " + s).join("\n") : "✅ 全部系统在一局内均被玩家真实触发，玩法骨架可达且完整");

say("");
say("（注：本探针只回答「能不能碰到」，不回答「好不好玩」。好玩与否需真人试玩 + 留存数据。）");

}

// 两条流派各跑一局：法门属于专精流、合击属于双修流，分开验证才能证明「两条路都通」
const STYLES = [
  ["pure", "专精流 · 全押一派（验证武器觉醒 + 法门 Lv3）"],
  ["mix",  "双修流 · 两派各投（验证双兵合击可达）"],
];
const snap = {};
for (const [st, label] of STYLES) {
  AI_MIX = st === "mix";
  for (const k in C) delete C[k];
  for (const k in prev) delete prev[k];
  say("");
  say("########################################################");
  report(label);
  snap[st] = Object.assign({}, C);
}

say("");
say("########################################################");
say("===== 跨流派汇总（任一流派触发过即视为可达）=====");
const anyN = (k) => (snap.pure[k] ? snap.pure[k].n : 0) + (snap.mix[k] ? snap.mix[k].n : 0);
const must = [["武器觉醒", "weaponEvo"], ["法门 Lv1", "jobLv1"], ["法门 Lv3", "jobLv3"],
              ["双兵合击解锁", "fusionUnlock"], ["双兵合击释放", "fusion"], ["灵石槽入槽", "stoneSlot"],
              ["尸潮涌", "horde"], ["连锁击杀", "chain"], ["悬赏令达成", "bountyDone"], ["祭坛抉择", "altar"]];
let bad = 0;
for (const [label2, key] of must) {
  const n = anyN(key);
  if (n === 0) bad++;
  say((n === 0 ? "❌ " : "✅ ") + label2.padEnd(14, "　") + " 专精 "
      + String(snap.pure[key] ? snap.pure[key].n : 0).padStart(4) + " 次 / 双修 "
      + String(snap.mix[key] ? snap.mix[key].n : 0).padStart(4) + " 次");
}
say("");
say(bad === 0
  ? "✅ 核心玩法骨架在真实一局内全部可达（专精与双修两条路线都走得通）"
  : `⚠ 仍有 ${bad} 项核心系统在一局内不可达，需继续修`);

fs.writeFileSync(OUT, log.join("\n") + "\n", "utf8");
