/* 玄天劫 · 发布门禁（一条命令跑完 PM_OPERATING.md 要求的全部门禁）
 *
 * 用法：  node tools/gate.js
 *         node tools/gate.js --quick     # 跳过较慢的 playability 整局仿真
 *
 * 门禁项（对齐 docs/PM_OPERATING.md「smoke + verify 全绿才允许部署」）：
 *   1) 语法      node --check 全部 js（game.js / sw.js 及 js、tests、tools 三个目录下的 .js）
 *   2) 版本一致性 game.js APP_VERSION ＝ sw.js 缓存名 ＝ index.html 版本标签 ＝ docs/README
 *   3) 冒烟      tests/logic-smoke.js —— 断言 FAIL 必须为 0
 *   4) 探针      audit / balance / ftue / playability —— 退出码必须为 0
 *   5) 入口可达性 tools/entry-audit.js —— 真机量「踏入战场」是否真在首屏、能不能点（v7.8.6 新增）
 *
 * 报告写到 tools/gate-report.txt；全绿退出码 0，任一红退出码 1。
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const DIR = path.join(__dirname, "..");
const QUICK = process.argv.includes("--quick");
const OUT = path.join(__dirname, "gate-report.txt");
const log_lines = [];
const say = (s) => { log_lines.push(String(s)); console.log(String(s)); };
const flush = () => fs.writeFileSync(OUT, log_lines.join("\n"), "utf8");

const results = [];   // { name, ok, detail }
const record = (name, ok, detail) => { results.push({ name, ok, detail }); return ok; };

const runNode = (args, opts = {}) =>
  spawnSync(process.execPath, args, { cwd: DIR, encoding: "utf8", ...opts });

const read = (rel) => fs.readFileSync(path.join(DIR, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(DIR, rel));

say("========================================");
say(" 玄天劫 · 发布门禁 gate.js");
say(" 时间：" + new Date().toISOString());
say(" 模式：" + (QUICK ? "quick（跳过 playability 整局仿真）" : "full"));
say("========================================");
say("");

// ---------- 门禁 1 · 语法 ----------
say("【门禁 1】语法 node --check");
const targets = [];
for (const f of ["game.js", "sw.js"]) if (exists(f)) targets.push(f);
for (const d of ["js", "tests", "tools"]) {
  if (!exists(d)) continue;
  for (const f of fs.readdirSync(path.join(DIR, d))) {
    if (f.endsWith(".js")) targets.push(d + "/" + f);
  }
}
let syntaxBad = [];
for (const f of targets) {
  const r = runNode(["--check", f]);
  if (r.status !== 0) syntaxBad.push(f + " -> " + (r.stderr || "").split("\n")[0]);
}
for (const f of targets) say("  " + (syntaxBad.some((b) => b.startsWith(f + " ")) ? "FAIL" : "ok  ") + "  " + f);
record("语法（" + targets.length + " 个 js）", syntaxBad.length === 0,
  syntaxBad.length ? syntaxBad.join(" | ") : "全部通过");
say("");

// ---------- 门禁 2 · 版本一致性 ----------
say("【门禁 2】版本一致性");
const coreOf = (v) => String(v).replace(/^v/, "").split("-")[0];
let canonical = null, swTag = null, indexVer = null, docsVer = null;
try { canonical = (read("game.js").match(/const APP_VERSION\s*=\s*"([^"]+)"/) || [])[1] || null; } catch (_) {}
try { const c = (read("sw.js").match(/const CACHE\s*=\s*"xuantianjie-([^"]+)"/) || [])[1]; swTag = c ? (/^v/.test(c) ? c : "v" + c) : null; } catch (_) {}
try { indexVer = (read("index.html").match(/class="ver-hint"[^>]*>\s*(v[0-9][0-9.]*)/) || [])[1] || null; } catch (_) {}
try { docsVer = (read("docs/README.md").match(/\*\*(v[0-9][0-9.]*)\s*（已上线）/) || [])[1] || null; } catch (_) {}

say("  game.js  APP_VERSION : " + canonical);
say("  sw.js    缓存名版本  : " + swTag);
say("  index.html 版本标签  : " + indexVer);
say("  docs/README 版本     : " + docsVer);
const cores = [coreOf(canonical), coreOf(swTag), coreOf(indexVer), coreOf(docsVer)].filter(Boolean);
const coreOk = canonical && cores.length === 4 && cores.every((c) => c === coreOf(canonical));
const tagOk = canonical && swTag === canonical;
say("  版本核心一致（4 处） : " + (coreOk ? "PASS" : "FAIL"));
say("  sw 缓存名 ＝ APP_VERSION : " + (tagOk ? "PASS" : "FAIL"));
record("版本一致性", coreOk && tagOk,
  coreOk && tagOk ? "4 处核心版本一致，缓存名含完整构建号 " + canonical
                  : "core=" + JSON.stringify(cores) + " canonical=" + canonical + " swTag=" + swTag);
say("");

// ---------- 门禁 3 · 冒烟 ----------
say("【门禁 3】冒烟 tests/logic-smoke.js");
const smoke = runNode(["tests/logic-smoke.js"]);
const smokeLog = exists("tests/last-run.txt") ? read("tests/last-run.txt") : "";
const smLines = smokeLog.split(/\r?\n/);
const smPass = smLines.filter((l) => /^PASS\b/.test(l)).length;
const smFail = smLines.filter((l) => /^FAIL\b/.test(l)).length;
say("  冒烟退出码=" + smoke.status + " · PASS=" + smPass + " · FAIL=" + smFail);
smLines.forEach((l) => { if (/^FAIL\b/.test(l)) say("    ✗ " + l); });
record("冒烟 logic-smoke", smoke.status === 0 && smFail === 0 && smPass > 0,
  smPass + " PASS / " + smFail + " FAIL");
say("");

// ---------- 门禁 4 · 四套探针 ----------
say("【门禁 4】探针仿真");
const probes = [
  ["audit-sim", "tools/audit-sim.js", false],
  ["balance-sim", "tools/balance-sim.js", false],
  ["ftue-sim", "tools/ftue-sim.js", false],
  ["playability-sim", "tools/playability-sim.js", QUICK],
];
for (const [name, file, skip] of probes) {
  if (!exists(file)) { record("探针 " + name, false, "文件缺失"); say("  MISSING  " + name); continue; }
  if (skip) { record("探针 " + name, true, "quick 模式跳过"); say("  skip     " + name + "（--quick）"); continue; }
  const r = runNode([file]);
  const rep = file.replace(/\.js$/, "-report.txt");
  say("  " + (r.status === 0 ? "ok  " : "FAIL") + "  " + name + "（退出码 " + r.status + "）" + (exists(rep) ? " · 报告 " + rep : ""));
  record("探针 " + name, r.status === 0, "exit=" + r.status);
}
say("");

// ---------- 门禁 5 · 入口可达性（真机） ----------
// 事故驱动新增：v7.8 回访壳把「踏入战场」顶出视口且页面不可滚动，
// 线上玩家「主界面只剩签到、进不去游戏」，而当时 4 项门禁（含探针）全绿 ——
// 因为那 4 项都只在 Node 桩里验逻辑，没有一项去量「按钮到底在不在屏幕上」。
say("【门禁 5】入口可达性 tools/entry-audit.js（真机 Edge）");
const BROWSERS = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];
const browserOk = BROWSERS.some((p) => fs.existsSync(p));
if (!exists("tools/entry-audit.js")) {
  record("入口可达性", false, "tools/entry-audit.js 缺失");
  say("  MISSING  entry-audit.js");
} else if (!browserOk) {
  record("入口可达性", true, "跳过：本机无 Edge/Chrome，无法做真机量测");
  say("  skip     entry-audit（本机无浏览器）");
} else {
  const r = runNode(["tools/entry-audit.js"]);
  const lines = String(r.stdout || "").split(/\r?\n/);
  lines.forEach((l) => {
    if (/主入口|开始页内容超出|主循环|没能进入战斗|世界时间|返回山门|继续战斗|Esc 暂停|找不到元素/.test(l)) say("  " + l.trim());
  });
  const probs = lines.filter((l) => /^\s+· /.test(l));
  say("  入口审计退出码=" + r.status + " · 问题 " + probs.length + " 条");
  record("入口可达性", r.status === 0,
    r.status === 0 ? "主入口完整在首屏、可点，开始/暂停/回菜单闭环通" : "见 tools/entry-audit.js 输出");
}
say("");

// ---------- 汇总 ----------
say("========================================");
say(" 门禁汇总");
say("========================================");
for (const r of results) say("  " + (r.ok ? "[绿] " : "[红] ") + r.name.padEnd(22, " ") + " · " + r.detail);
const reds = results.filter((r) => !r.ok);
say("");
say(reds.length === 0 ? " 结论：门禁全绿 —— 允许部署 ✅" : " 结论：门禁未通过（" + reds.length + " 项红）—— 禁止部署 ❌");
say("========================================");
flush();
process.exit(reds.length === 0 ? 0 : 1);
