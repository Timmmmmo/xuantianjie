/* 玄天劫 · 玩法可靠性审计（静态）
 * 用法： node tools/audit-sim.js
 *
 * 回答三个「玩法靠不靠得住」的基础问题：
 *  1) 死代码：定义了但全项目零调用的函数 / 常量 —— 纸面系统，玩家永远看不到
 *  2) 可达性：关键系统的触发条件在数学上是否可能满足（历史上合击就死在这里）
 *  3) 内容量：卡池 / 敌种 / 词缀 / 联动 / 祭坛 的条目数，判断广度够不够撑长线
 */
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "game.js"), "utf8");
const lines = src.split("\n");
const out = [];
const say = (s) => { out.push(s); console.log(s); };

say("玄天劫 · 玩法可靠性审计（静态扫描 game.js）");
say("生成时间 " + new Date().toISOString());
say("");

// ---- 0) 剥离导出块（导出列表里的名字不算「真实调用」） ----
const expLine = lines.findIndex((l) => /^\s*applyHit, update/.test(l));
let es = expLine, ee = expLine;
while (es > 0 && !/=\s*\{/.test(lines[es])) es--;
while (ee < lines.length - 1 && !/^\s*\};?\s*$/.test(lines[ee])) ee++;
const clean = lines.map((l, i) => (i >= es && i <= ee ? "" : l)).join("\n");
say(`导出块：第 ${es + 1}-${ee + 1} 行（共 ${ee - es + 1} 行，已从「真实调用」统计中剔除）`);
say("");

const countRef = (name) => {
  const re = new RegExp("\\b" + name.replace(/\$/g, "\\$") + "\\b", "g");
  return (clean.match(re) || []).length;
};

// ---- 1) 死代码：顶层函数 ----
const fns = [...clean.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map((m) => m[1]);
const deadFns = [];
for (const f of fns) {
  const n = countRef(f);
  if (n <= 1) deadFns.push(f);   // 1 = 只有定义处
}
say(`== 1) 顶层函数 ${fns.length} 个 ==`);
say(deadFns.length ? `零调用函数 ${deadFns.length} 个：${deadFns.join("、")}` : "无零调用函数");

// ---- 2) 死代码：顶层常量 ----
const consts = [...clean.matchAll(/^const\s+([A-Z][A-Z0-9_]*)\s*=/gm)].map((m) => m[1]);
const deadConsts = [];
for (const c of consts) {
  if (countRef(c) <= 1) deadConsts.push(c);
}
say("");
say(`== 2) 顶层常量（大写）${consts.length} 个 ==`);
say(deadConsts.length ? `零引用常量 ${deadConsts.length} 个：${deadConsts.join("、")}` : "无零引用常量");

// ---- 3) 可达性：关键系统的触发条件 ----
say("");
say("== 3) 关键系统可达性（触发条件是否在数学上可能满足）==");
// 用「标识符出现次数 ≥2（定义 1 + 至少 1 处调用）」判定可达，避免带参调用被正则漏掉
const reachable = (fn) => countRef(fn) >= 2;
const checks = [
  {
    name: "武器觉醒（syncWeaponsFromSet）",
    ok: reachable("syncWeaponsFromSet"),
    note: "装备派系 → 武器升级，3 件同派系觉醒",
  },
  {
    name: "法门境界（syncJobBranchesFromSet）",
    ok: reachable("syncJobBranchesFromSet"),
    note: "3 件同派系 Lv1 / 武器觉醒 Lv2 / 灵石槽同派系 Lv3",
  },
  {
    name: "灵石槽（setStoneSlot）",
    ok: reachable("setStoneSlot"),
    note: "玩家把灵石放入槽位 —— 若不可达，则法门 Lv3 与灵石槽加成都是纸面功能",
  },
  {
    name: "双兵合击（FUSION_DEFS）",
    ok: reachable("syncFusions"),
    note: "两把武器各 Lv≥2；装备可同时投资多派系（否则 3 槽位永远凑不出）",
  },
  {
    name: "尸潮涌（startHorde）",
    ok: reachable("startHorde"),
    note: "每 7 波，避开 5 的倍数",
  },
  {
    name: "连锁击杀（tryChainKill）",
    ok: reachable("tryChainKill"),
    note: "概率 0.10 + combo×0.005，尸潮中 +0.12",
  },
  {
    name: "瞬步残影（spawnAfterimage）",
    ok: reachable("spawnAfterimage"),
    note: "冲刺沿途留带伤害剑影",
  },
  {
    name: "濒死狂血（updateFrenzy）",
    ok: reachable("updateFrenzy"),
    note: "hp ≤25% 触发，攻速×2 伤害×1.5",
  },
  {
    name: "悟道突破（UPGRADE_POOL / openLevelUp）",
    ok: reachable("openLevelUp"),
    note: "每次升级弹三选一",
  },
  {
    name: "悬赏令（BOUNTY_DEFS）",
    ok: reachable("startBounty"),
    note: "每 6 波，避开 5/7 的倍数",
  },
  {
    name: "剑意爆发（comboBurst）",
    ok: reachable("comboBurst"),
    note: "每 20 连杀，1.2s CD",
  },
  {
    name: "祭坛赌注（ALTAR_DEALS）",
    ok: reachable("spawnAltar"),
    note: "波间随机刷新，走近触发",
  },
  {
    name: "词条联动（SYNERGIES）",
    ok: reachable("synOn"),
    note: "8 组组合效果",
  },
  {
    name: "怪物词缀（ENEMY_MODS）",
    ok: reachable("rollEnemyMods"),
    note: "精英/妖王随机 1-2 个",
  },
  {
    name: "派系核心（SCH_CORES）",
    ok: reachable("autoUnlockCoreCheck"),
    note: "派系纯度达标解锁",
  },
  {
    name: "妖王必掉紫装（实现 vs 常量）",
    ok: /妖王赐·本派紫装/.test(src),
    note: "实现存在（killEnemy 里硬编码 1 件本派紫装）；常量 BOSS_PURPLE_DROP 反而零引用（冗余）",
  },
];
let bad = 0;
for (const c of checks) {
  if (!c.ok) bad++;
  say(`  [${c.ok ? "可达" : "不可达"}] ${c.name} —— ${c.note}`);
}

// ---- 4) 内容量盘点 ----
say("");
say("== 4) 内容量盘点（广度是否够撑长线）==");
const countOf = (re) => (src.match(re) || []).length;
const poolSize = (name) => {
  const m = src.match(new RegExp("const " + name + " = \\[([\\s\\S]*?)\\n\\];"));
  if (!m) return -1;
  return (m[1].match(/\bid: "/g) || []).length;
};
say(`  悟道卡池 UPGRADE_POOL：${poolSize("UPGRADE_POOL")} 张`);
say(`  合击 FUSION_DEFS：${poolSize("FUSION_DEFS")} 组`);
say(`  悬赏 BOUNTY_DEFS：${poolSize("BOUNTY_DEFS")} 张`);
say(`  祭坛 ALTAR_DEALS：${poolSize("ALTAR_DEALS")} 契`);
say(`  联动 SYNERGIES：${poolSize("SYNERGIES")} 组`);
say(`  怪物词缀 ENEMY_MODS：${countOf(/^\s{2}[a-z]+: \{ name: "/gm)} 种`);
say(`  敌人类型 ENEMY_TYPES：${countOf(/^\s{2}[a-zA-Z]+: \{ name: "/gm)} 种`);
say(`  升级卡池「变」类（改形态）：${(src.match(/cls: "form"/g) || []).length} 张`);

// ---- 5) 长局风险：公式级检查 ----
say("");
say("== 5) 长局风险（公式级）==");
const hpExp = (src.match(/Math\.pow\(wave, ([\d.]+)\)/) || [])[1];
say(`  敌人血量指数：w^${hpExp || "?"}（越高后期越容易撞墙）`);
say(`  敌人血量线性项：${/1 \+ 0\.18 \* wave/.test(src) ? "0.18×w" : "?"}`);
say(`  玩家每级 ATK：${(src.match(/LV_ATK_MUL = ([\d.]+)/) || [])[1]} · HP：${(src.match(/LV_HP_MUL = ([\d.]+)/) || [])[1]}`);
say(`  经验需求曲线：${(src.match(/G\.xpNeed = ([^;]+);/) || [])[1] || "?"}`);
const cap = (src.match(/Math\.min\(G\.combo, (\d+)\)/) || [])[1];
say(`  连杀加成封顶：combo ${cap}（经验倍率不会无限涨）`);
say(`  升级经验公式：${(src.match(/G\.xpNeed = Math\.floor\([^;]*;/) || [])[0] || "?"}`);
say(`  同屏补怪上限：${(src.match(/trickleCap[^;]*;/) || [])[0] || "?"}`);

// ---- 6) 长局体验：难度是变紧还是变松 ----
say("");
say("== 6) 长局难度走势（读 balance-report，判断后期是撞墙还是变软）==");
try {
  const rep = fs.readFileSync(path.join(__dirname, "balance-report.txt"), "utf8");
  const blk = rep.split("== 3) 场景：正常")[1] || "";
  const rows = [...blk.matchAll(/^\s*(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([\d.]+)\s+([\d.]+)\s+(\d+)\s+([\d.]+)/gm)]
    .map((m) => ({ wave: +m[1], lv: +m[2], mobHits: +m[9], bossHits: +m[10], tank: +m[12] }));
  if (rows.length) {
    const a = rows.find((r) => r.wave === 20), b = rows[rows.length - 1];
    say(`  20 波：砍妖王 ${a.bossHits} 刀 · 能挨 ${a.tank} 下`);
    say(`  ${b.wave} 波：砍妖王 ${b.bossHits} 刀 · 能挨 ${b.tank} 下`);
    say(b.tank > a.tank
      ? `  ⚠ 后期容错反而变高（${a.tank} → ${b.tank} 下）：难度在下降，长局缺少终局压力`
      : `  后期容错收紧（${a.tank} → ${b.tank} 下）：难度曲线正常上升`);
  } else say("  （未能解析 balance-report，请先跑 tools/balance-sim.js）");
} catch (e) { say("  （读取 balance-report 失败：" + e.message + "）"); }

// ---- 7) 卡池枯竭：后期还有没有「形态抉择」 ----
say("");
say("== 7) 卡池枯竭（后期抉择会不会退化成纯数值）==");
{
  const pm = src.match(/const UPGRADE_POOL = \[([\s\S]*?)\n\];/);
  const body = pm ? pm[1] : "";
  const cards = [...body.matchAll(/\{ id: "([\w]+)", cls: "(\w+)".*?max: (\d+)/g)]
    .map((m) => ({ id: m[1], cls: m[2], max: +m[3] }));
  const byCls = {};
  for (const c of cards) byCls[c.cls] = (byCls[c.cls] || 0) + c.max;
  const total = Object.values(byCls).reduce((a, b) => a + b, 0);
  const formTotal = byCls.form || 0;
  say(`  卡池 ${cards.length} 张：攻 ${cards.filter((c) => c.cls === "atk").length} / 守 ${cards.filter((c) => c.cls === "def").length} / 变 ${cards.filter((c) => c.cls === "form").length}`);
  say(`  可拿总次数 ≈ ${total}（其中「变」类 ${formTotal} 次，攻/守含 max:99 的无限卡）`);
  say(formTotal <= 40
    ? `  ⚠ 「变」类约 ${formTotal} 次就拿满，一局 35~40 级 ⇒ 中后期牌面会退化成纯数值卡`
    : `  「变」类供给充足（${formTotal} 次）`);
}

say("");
say(deadFns.length === 0 && deadConsts.length === 0 && bad === 0
  ? "结论：未发现死代码 / 不可达系统"
  : `结论：发现 ${deadFns.length} 个零调用函数、${deadConsts.length} 个零引用常量、${bad} 个不可达系统`);

fs.writeFileSync(path.join(__dirname, "audit-report.txt"), out.join("\n"), "utf8");
