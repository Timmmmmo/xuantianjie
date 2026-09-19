/* 平衡曲线探针：不加 gameplay，只做数值推演
 * 用法： node tools/balance-sim.js
 * 目的：回答「后期是不是打不动 / 升级是不是跟不上」这类问题
 * v7.0：同步密度改造（每波怪量 4+1.35w、涓流提速、每 7 波尸潮、连锁击杀额外击杀）
 */
const fs = require("fs");
const path = require("path");

// ---- 与 game.js 保持一致的手抄公式（改动 game.js 时请同步这里） ----
const enemyHP  = (base, w) => base * (1 + 0.18 * w) * (1 + 0.02 * Math.pow(w, 1.25));
// v6.1：经验随波次上涨（spawnEnemy 里 xp = round(base * (1 + w*0.07))）
const xpScale  = (w) => 1 + 0.07 * w;
const enemyATK = (base, w) => base * (1 + 0.12 * w);
const xpNeedOf = (lv) => Math.floor(20 * Math.pow(1.18, lv - 1));

const WAVE_INTERVAL = 25;      // G.waveInterval
const TYPES = {
  fox:   { hp: 28,  atk: 8,  xp: 5,  spd: 95 },
  wolf:  { hp: 40,  atk: 11, xp: 7,  spd: 120 },
  golem: { hp: 95,  atk: 14, xp: 12, spd: 55 },
  ghost: { hp: 22,  atk: 9,  xp: 6,  spd: 105 },
  bat:   { hp: 18,  atk: 7,  xp: 4,  spd: 145 },
  eliteFox:   { hp: 160,  atk: 18, xp: 30, spd: 85 },
  eliteGolem: { hp: 280,  atk: 22, xp: 40, spd: 50 },
  bossFox:    { hp: 900,  atk: 28, xp: 120, spd: 70 },
  bossGolem:  { hp: 1400, atk: 32, xp: 150, spd: 45 },
};

// buildWave 的构成（wave>=5 的稳定池，取平均 xp）
// v7.0 密度：4 + 1.35w（原 3 + 0.85w）
const WAVE_COUNT = (w) => 4 + Math.floor(w * 1.35);
// v7.0 尸潮：每 7 波（避开 5 的倍数妖王波）灌入 46+1.4w 只低血尸傀
const HORDE_SIZE = (w) => 46 + Math.floor(w * 1.4);
// v7.0 连锁击杀：每只死亡平均带走 0.25 只额外目标（实测概率 ~0.3，链有衰减）
const CHAIN_MUL = 1.25;

function waveSpawn(w) {
  const xs = xpScale(w);
  const out = [];
  const count = WAVE_COUNT(w);
  const pool = w >= 5 ? ["fox","fox","wolf","bat","bat","golem","ghost","wolf","ghost","golem"]
                      : w >= 3 ? ["fox","fox","wolf","bat","bat","golem","ghost"]
                               : w >= 2 ? ["fox","fox","wolf","bat","bat"] : ["fox","fox","wolf"];
  const avg = pool.reduce((s, k) => s + TYPES[k].xp, 0) / pool.length;
  const avgHP = pool.reduce((s, k) => s + TYPES[k].hp, 0) / pool.length;
  for (let i = 0; i < count; i++) out.push({ xp: avg, hp: avgHP, kind: "mob" });
  if (w >= 3 && w % 3 === 0) {
    const n = 1 + Math.floor(w / 12);
    const t = w % 6 === 0 ? "eliteGolem" : "eliteFox";
    for (let i = 0; i < n; i++) out.push({ xp: TYPES[t].xp * xs, hp: TYPES[t].hp, kind: "elite" });
  }
  if (w % 5 === 0) {
    const t = w % 10 === 0 ? "bossGolem" : "bossFox";
    out.push({ xp: TYPES[t].xp * xs, hp: TYPES[t].hp, kind: "boss" });
  }
  // 涓流补怪：v7.0 提速到 max(0.45, 1.7-0.035w) 秒 1 只 fox/bat
  const iv = Math.max(0.45, 1.7 - w * 0.035);
  const trickle = Math.floor(WAVE_INTERVAL / iv);
  for (let i = 0; i < trickle; i++) out.push({ xp: (TYPES.fox.xp + TYPES.bat.xp) / 2 * xs, hp: (TYPES.fox.hp + TYPES.bat.hp) / 2, kind: "mob" });
  // v7.0 B 尸潮涌：整批低血尸傀（hp 14 / xp 2），靠数量给经验与割草感
  if (w >= 7 && w % 7 === 0 && w % 5 !== 0) {
    for (let i = 0; i < HORDE_SIZE(w); i++) out.push({ xp: 2 * xs, hp: 14, kind: "horde" });
  }
  // 连锁击杀折算：按概率额外带走一批杂兵（只加经验/击杀，不加血量负担）
  const extra = Math.round(out.length * (CHAIN_MUL - 1));
  for (let i = 0; i < extra; i++) out.push({ xp: TYPES.fox.xp * xs, hp: TYPES.fox.hp, kind: "chain" });
  return out;
}

function run(scenario) {
  const { name, comboMul, xpMul, equipAtkAt } = scenario;
  const rows = [];
  let level = 1, xp = 0, need = xpNeedOf(1), totalKills = 0;
  for (let w = 1; w <= 40; w++) {
    const sp = waveSpawn(w);
    for (const s of sp) {
      totalKills++;
      xp += s.xp * xpMul * comboMul;
      while (xp >= need) { xp -= need; level++; need = xpNeedOf(level); }
    }
    const baseAtk = 12 * Math.pow(1.05, level - 1);
    const equipAtk = equipAtkAt(w);            // 装备攻击加成（场景假设）
    const atk = baseAtk + equipAtk;
    const dmgMult = scenario.dmgMultAt(w);      // 元素/纯度/联动/核心综合倍率
    const hit = atk * dmgMult;
    const hpMax = 100 * Math.pow(1.08, level - 1) + scenario.equipHpAt(w);
    const foxHP = enemyHP(28, w);
    const bossHP = enemyHP(1400, w);
    const bossATK = enemyATK(32, w);
    const eliteHP = enemyHP(280, w);
    rows.push({
      w, level, kills: totalKills,
      atk: +atk.toFixed(1), hit: +hit.toFixed(0), hpMax: Math.round(hpMax),
      foxHP: Math.round(foxHP), eliteHP: Math.round(eliteHP), bossHP: Math.round(bossHP),
      hitsFox: +(foxHP / hit).toFixed(1),
      hitsBoss: +(bossHP / hit).toFixed(1),
      bossATK: Math.round(bossATK),
      hitsToDie: +(hpMax / bossATK).toFixed(1),
      need: need,
    });
  }
  return { name, rows };
}

// 三档装备成长假设
const S = [
  { name: "保守（只有紫装，纯度不满）", comboMul: 1.15, xpMul: 1.0,
    equipAtkAt: (w) => (w < 5 ? 0 : w < 15 ? 18 : w < 30 ? 40 : 70),
    equipHpAt:  (w) => (w < 5 ? 0 : w < 15 ? 40 : w < 30 ? 90 : 150),
    dmgMultAt:  (w) => (w < 15 ? 1.15 : 1.35) },
  { name: "正常（3 紫 + 纯度 100% + 1 联动）", comboMul: 1.3, xpMul: 1.15,
    equipAtkAt: (w) => (w < 5 ? 0 : w < 12 ? 25 : w < 25 ? 60 : w < 35 ? 95 : 130),
    equipHpAt:  (w) => (w < 5 ? 0 : w < 12 ? 60 : w < 25 ? 130 : w < 35 ? 200 : 280),
    dmgMultAt:  (w) => (w < 12 ? 1.2 : w < 25 ? 1.6 : 1.9) },
  { name: "毕业（橙装 + 2 核心 + 多联动）", comboMul: 1.45, xpMul: 1.3,
    equipAtkAt: (w) => (w < 5 ? 0 : w < 12 ? 35 : w < 25 ? 90 : w < 35 ? 150 : 210),
    equipHpAt:  (w) => (w < 5 ? 0 : w < 12 ? 90 : w < 25 ? 200 : w < 35 ? 320 : 450),
    dmgMultAt:  (w) => (w < 12 ? 1.3 : w < 25 ? 1.9 : 2.5) },
];

const out = [];
const P = (s) => out.push(s);
P("玄天劫 v7.0 · 平衡曲线探针（含密度/尸潮/连锁）（纯数值推演，非实测）");
P("生成时间 " + new Date().toISOString());
P("");
P("== 1) 怪物血量/攻击随波次放大（公式：HP=base*(1+0.18w)*(1+0.02*w^1.25)） ==");
P("波次  小妖HP  精英HP   妖王HP   妖王ATK  HP倍数");
for (const w of [1, 5, 10, 15, 20, 25, 30, 35, 40]) {
  const m = enemyHP(1, w);
  P(`${String(w).padStart(3)}  ${String(Math.round(enemyHP(28, w))).padStart(6)}  ${String(Math.round(enemyHP(280, w))).padStart(6)}  ${String(Math.round(enemyHP(1400, w))).padStart(7)}  ${String(Math.round(enemyATK(32, w))).padStart(6)}  ${m.toFixed(2)}x`);
}
P("");
P("== 2) 升级所需累计击杀（每只怪经验固定不随波次涨） ==");
P("等级  本级需求  累计经验  按 8xp/只折算击杀");
let cum = 0;
for (const lv of [5, 10, 15, 20, 25, 30, 35, 40]) {
  let c = 0;
  for (let i = 1; i < lv; i++) c += xpNeedOf(i);
  P(`${String(lv).padStart(3)}  ${String(xpNeedOf(lv)).padStart(8)}  ${String(Math.round(c)).padStart(8)}  ${String(Math.round(c / 8)).padStart(10)}`);
}
P("");

for (const sc of S) {
  const r = run(sc);
  P(`== 3) 场景：${sc.name} ==`);
  P("波次 等级 累计击杀 玩家攻击 单击伤害 玩家HP  小妖HP  妖王HP  砍小妖刀数 砍妖王刀数 妖王ATK 能挨几下");
  for (const row of r.rows) {
    if (![1, 5, 10, 15, 20, 25, 30, 35, 40].includes(row.w)) continue;
    P(`${String(row.w).padStart(3)} ${String(row.level).padStart(4)} ${String(row.kills).padStart(8)} ${String(row.atk).padStart(8)} ${String(row.hit).padStart(8)} ${String(row.hpMax).padStart(7)} ${String(row.foxHP).padStart(7)} ${String(row.bossHP).padStart(8)} ${String(row.hitsFox).padStart(10)} ${String(row.hitsBoss).padStart(10)} ${String(row.bossATK).padStart(7)} ${String(row.hitsToDie).padStart(8)}`);
  }
  P("");
}

const outPath = path.join(__dirname, "balance-report.txt");
fs.writeFileSync(outPath, out.join("\n"), "utf8");
console.log(out.join("\n"));
console.log("\n[written] " + outPath);
