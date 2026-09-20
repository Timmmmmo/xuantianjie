/* 无 git 环境下的发布：走 GitHub REST API（Git Data API）推送变更并等待 Pages 构建
 *
 * 用法：
 *   node tools/deploy.js                      # 自动 diff：把「本地 与 远端 main 不一致」的文件全部推送
 *   node tools/deploy.js --dry                # 只打印差异与提交信息，不推送
 *   node tools/deploy.js --verify             # 不推送，只对线上地址跑探针（发布后终验）
 *   node tools/deploy.js --skip tests/last-run.txt
 *   node tools/deploy.js game.js index.html   # 只推指定文件（覆盖自动 diff）
 *   node tools/deploy.js --msg docs/RELEASE_NOTES_v7.8.6.md
 *   node tools/deploy.js --msg-text "chore: 修工具探针"
 *   GH_TOKEN=ghp_xxx node tools/deploy.js     # 令牌也可放在 GH_TOKEN_FILE 指向的文件里
 *
 * v7.8.6 起的三点改动（都是这次踩出来的）：
 *   1) 提交信息不再硬编码 —— 默认取 docs 下最新的 RELEASE_NOTES_ 文件，
 *      避免出现「发的是 v7.8.6、提交信息还写着 v7.1」这种对不上号的情况；
 *   2) 文件清单不再硬编码 —— 改为自动 diff（比对 git blob 哈希），
 *      避免新增的文件（报告 / 新工具）被漏推，导致线上与本地悄悄分叉；
 *   3) 新增 --verify —— 发布后不产生新提交也能对线上复查，且探针就是发布用的那一套。
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

const TOKEN = (
  process.env.GH_TOKEN ||
  fs.readFileSync(
    process.env.GH_TOKEN_FILE || (process.env.USERPROFILE || process.env.HOME) + "/.workbuddy/.github_token_timmmmmo",
    "utf8"
  )
).trim();
const OWNER = "Timmmmmo";
const REPO = "xuantianjie";
const BRANCH = "main";
const DIR = path.join(__dirname, "..");

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry");
const VERIFY = argv.includes("--verify");
const explicit = [];
const skipArg = [];
let msgArg = null;
let msgText = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--msg") {
    msgArg = argv[++i] || null;
  } else if (a === "--msg-text") {
    msgText = argv[++i] || null;
  } else if (a === "--skip") {
    if (argv[i + 1]) skipArg.push(argv[++i]);
  } else if (a.startsWith("--")) {
    // 其它开关（--dry / --verify）已单独解析
  } else {
    explicit.push(a);
  }
}

const REPORT = process.env.XTJ_DEPLOY_OUT || path.join(__dirname, "last-deploy.txt");
// 每次跑工具都会变的「运行日志」默认不推送 —— 否则每次发布都会顺带塞进一个
// 描述上一次发布的日志文件，既没用又制造无意义的 diff。
// （tools/*-report.txt 属于探针证据，仍然照常推送）
const DEFAULT_SKIP = ["tests/last-run.txt", "tools/last-deploy.txt"];
const OUT = [];
const log = (s) => {
  OUT.push(String(s));
  console.log(s);
};
const flush = () => fs.writeFileSync(REPORT, OUT.join("\n"), "utf8");

function api(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: "api.github.com",
        path: p,
        method,
        headers: {
          Authorization: "Bearer " + TOKEN,
          Accept: "application/vnd.github+json",
          "User-Agent": "workbuddy-deploy",
          "X-GitHub-Api-Version": "2022-11-28",
          ...(data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {}),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => {
          let parsed = d;
          try {
            parsed = JSON.parse(d);
          } catch (e) {}
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function getUrl(host, p) {
  return new Promise((resolve) => {
    const req = https.request(
      { hostname: host, path: p, method: "GET", headers: { "User-Agent": "workbuddy-deploy", "Cache-Control": "no-cache" } },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, text: d }));
      }
    );
    req.on("error", (e) => resolve({ status: 0, text: "", err: e.message }));
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function walk(dir, base) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === ".git") continue;
    const rel = (base ? base + "/" : "") + e.name;
    if (e.isDirectory()) out = out.concat(walk(path.join(dir, e.name), rel));
    else out.push(rel);
  }
  return out;
}

function blobSha(buf) {
  const h = crypto.createHash("sha1");
  h.update("blob " + buf.length + "\0");
  h.update(buf);
  return h.digest("hex");
}

// 提交信息：--msg-text 优先，其次 --msg 文件，最后取 docs 下最新的 RELEASE_NOTES_ 文件
function resolveMessage() {
  if (msgText) return { text: msgText, from: "--msg-text" };
  const explicitPath = msgArg || process.env.XTJ_MSG_FILE;
  if (explicitPath) {
    const p = path.isAbsolute(explicitPath) ? explicitPath : path.join(DIR, explicitPath);
    if (!fs.existsSync(p)) throw new Error("找不到提交信息文件：" + explicitPath);
    return { text: fs.readFileSync(p, "utf8").trim(), from: explicitPath };
  }
  const docsDir = path.join(DIR, "docs");
  const cands = fs
    .readdirSync(docsDir)
    .filter((f) => /^RELEASE_NOTES_.*\.md$/.test(f))
    .map((f) => ({ f, m: fs.statSync(path.join(docsDir, f)).mtimeMs }))
    .sort((a, b) => b.m - a.m);
  if (!cands.length) return { text: "chore: 发布更新", from: "(默认)" };
  return { text: fs.readFileSync(path.join(docsDir, cands[0].f), "utf8").trim(), from: "docs/" + cands[0].f };
}

// 线上探针：发布后终验（--verify 也复用这一套）
async function liveProbes() {
  const g = await getUrl("timmmmmo.github.io", "/xuantianjie/game.js");
  const h = await getUrl("timmmmmo.github.io", "/xuantianjie/index.html");
  const s = await getUrl("timmmmmo.github.io", "/xuantianjie/sw.js");
  const c = await getUrl("timmmmmo.github.io", "/xuantianjie/style.css");
  log("");
  log(`线上探测 game.js   -> HTTP ${g.status} bytes=${g.text.length}`);
  log(`线上探测 index.html-> HTTP ${h.status} bytes=${h.text.length}`);
  log(`线上探测 sw.js     -> HTTP ${s.status} bytes=${s.text.length}`);
  log(`线上探测 style.css -> HTTP ${c.status} bytes=${c.text.length}`);

  const smoke = fs.readFileSync(path.join(DIR, "tests/logic-smoke.js"), "utf8");
  const entryIdxOk =
    h.text.indexOf('id="btnStart"') >= 0 && h.text.indexOf('id="btnStart"') < h.text.indexOf('id="revisitPanel"');
  const checks = [
    // v7.8.6 版本单一来源（三处必须都升到 7.8.6）
    ["版本单一源 APP_VERSION", /const APP_VERSION = "v7\.8\.6-mr"/.test(g.text)],
    ["sw 缓存名随版本升级", /const CACHE = "xuantianjie-v7\.8\.6-mr"/.test(s.text)],
    ["index 版本标签", /ver-hint">v7\.8\.6/.test(h.text)],
    // v7.8.6 入口修复
    ["修行录面板", /id="revisitPanel"/.test(h.text)],
    ["修行录开关", /id="btnRevisitToggle"/.test(h.text)],
    ["修行录徽标", /id="revisitBadge"/.test(h.text)],
    ["主入口排在回访壳之前", entryIdxOk],
    ["入口可达性巡检", /function syncStartLayout/.test(g.text)],
    ["折叠状态记档", /const REVISIT_KEY = "xuantianjie_revisit_open"/.test(g.text)],
    ["折叠开合", /function setRevisitOpen/.test(g.text)],
    ["徽标刷新", /function refreshRevisitBadge/.test(g.text)],
    ["面板样式", /\.revisit-panel/.test(c.text)],
    ["开始页可竖向滑动", /touch-action:\s*pan-y/.test(c.text)],
    // 本批 P1：冒烟可复现（固定种子）
    ["冒烟固定种子", /mulberry32/.test(smoke) && /XTJ_SEED/.test(smoke)],
    ["入口架构硬规则", /主入口必须排在/.test(smoke) || /revisitPanel/.test(smoke)],
    // v7.7 六道崩溃防线仍在
    ["自愈主循环", /function salvageFrame/.test(g.text) && /requestAnimationFrame\(frame\)/.test(g.text)],
    ["画布像素预算", /MAX_CANVAS_PX/.test(g.text)],
    ["上下文丢失自愈", /contextrestored/.test(g.text)],
    ["内存护栏", /usedJSHeapSize/.test(g.text)],
    // 试炼桩 / 伤害测试者 / 深度系统
    ["试炼桩血量表", /TRIAL_HP/.test(g.text)],
    ["玄铁崩解", /TRIAL_COLLAPSE/.test(g.text)],
    ["道途感悟保底", /INSIGHT_EVERY/.test(g.text)],
    ["本命灵石自动入槽", /function autoStoneSlot/.test(g.text)],
  ];
  log("");
  log("=== 线上探针（v7.8.6）===");
  let bad = 0;
  checks.forEach(([k, v]) => {
    if (!v) bad++;
    log(`  ${v ? "true  " : "FALSE "}${k}`);
  });
  log("");
  log(bad === 0 ? `PASS 线上探针 ${checks.length}/${checks.length} 全部命中` : `FAIL 线上探针有 ${bad} 项未命中`);
  return bad;
}

(async () => {
  try {
    const repo = await api("GET", `/repos/${OWNER}/${REPO}`);
    if (repo.status !== 200) throw new Error("repo 访问失败 " + repo.status + " " + JSON.stringify(repo.body));
    log(`仓库 ok: ${repo.body.full_name} 默认分支=${repo.body.default_branch} private=${repo.body.private}`);

    const ref = await api("GET", `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    if (ref.status !== 200) throw new Error("取 ref 失败 " + ref.status + " " + JSON.stringify(ref.body));
    const headSha = ref.body.object.sha;
    log(`当前 head(${BRANCH}) = ${headSha}`);

    const headCommit = await api("GET", `/repos/${OWNER}/${REPO}/git/commits/${headSha}`);
    const baseTree = headCommit.body.tree.sha;

    // ---------- 决定要推哪些文件 ----------
    let files;
    if (explicit.length) {
      files = explicit.map((f) => f.replace(/\\/g, "/"));
      log(`文件清单：命令行指定 ${files.length} 个`);
    } else {
      const tree = await api("GET", `/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`);
      if (!tree.body || !tree.body.tree) throw new Error("取远端 tree 失败 " + JSON.stringify(tree.body).slice(0, 300));
      const remote = {};
      tree.body.tree.forEach((t) => {
        if (t.type === "blob") remote[t.path] = t.sha;
      });
      const local = walk(DIR, "");
      const added = [],
        changed = [],
        skipped = [];
      for (const f of local) {
        if (skipArg.includes(f) || DEFAULT_SKIP.includes(f)) {
          skipped.push(f);
          continue;
        }
        const sha = blobSha(fs.readFileSync(path.join(DIR, f)));
        if (!(f in remote)) added.push(f);
        else if (remote[f] !== sha) changed.push(f);
      }
      const deleted = Object.keys(remote).filter((f) => !local.includes(f));
      log(`自动 diff：新增 ${added.length} · 修改 ${changed.length} · 远端有而本地无 ${deleted.length}`);
      added.forEach((f) => log("  + " + f));
      changed.forEach((f) => log("  M " + f));
      deleted.forEach((f) => log("  - " + f + "（保留线上，不删除）"));
      if (skipped.length) log(`  跳过运行日志：${skipped.join("、")}`);
      files = added.concat(changed);
    }

    if (VERIFY) {
      log("");
      log("--verify：跳过推送，直接对线上跑探针。");
      const bad = await liveProbes();
      process.exitCode = bad ? 1 : 0;
      log("完成。");
      return;
    }

    if (!files.length) {
      log("没有差异，无需发布；如需复核线上可加 --verify。");
      return;
    }
    const msg = resolveMessage();
    log("");
    log(`提交信息来源：${msg.from}`);
    log(`提交信息首行：${msg.text.split("\n")[0].slice(0, 90)}`);

    if (DRY) {
      log("");
      log("--dry：仅预览，未推送。");
      return;
    }

    // ---------- 上传 blob ----------
    const treeItems = [];
    for (const f of files) {
      const abs = path.join(DIR, f);
      if (!fs.existsSync(abs)) throw new Error("本地找不到文件：" + f);
      const buf = fs.readFileSync(abs);
      const blob = await api("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
        content: buf.toString("base64"),
        encoding: "base64",
      });
      if (blob.status !== 201) throw new Error(`blob ${f} 失败 ${blob.status} ${JSON.stringify(blob.body)}`);
      treeItems.push({ path: f, mode: "100644", type: "blob", sha: blob.body.sha });
      log(`blob ${f}: ${buf.length} bytes -> ${blob.body.sha.slice(0, 10)}`);
    }

    const tree = await api("POST", `/repos/${OWNER}/${REPO}/git/trees`, { base_tree: baseTree, tree: treeItems });
    if (tree.status !== 201) throw new Error("建 tree 失败 " + tree.status + " " + JSON.stringify(tree.body));
    log(`新 tree = ${tree.body.sha}`);

    const commit = await api("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
      message: msg.text,
      tree: tree.body.sha,
      parents: [headSha],
    });
    if (commit.status !== 201) throw new Error("建 commit 失败 " + commit.status + " " + JSON.stringify(commit.body));
    log(`新 commit = ${commit.body.sha}`);

    const upd = await api("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.body.sha,
      force: false,
    });
    if (upd.status !== 200) throw new Error("更新 ref 失败 " + upd.status + " " + JSON.stringify(upd.body));
    log(`已推送到 ${BRANCH} -> ${upd.body.object.sha}`);
    log(`提交页: https://github.com/${OWNER}/${REPO}/commit/${commit.body.sha}`);

    // ---------- 等 Pages 构建 ----------
    log("");
    log("等待 GitHub Pages 构建…");
    let built = false;
    for (let i = 0; i < 30; i++) {
      await sleep(6000);
      const b = await api("GET", `/repos/${OWNER}/${REPO}/pages/builds/latest`);
      if (b.status === 200) {
        log(`  [${i + 1}] status=${b.body.status} commit=${(b.body.commit || "").slice(0, 10)} duration=${b.body.duration}s`);
        if (b.body.status === "built" && b.body.commit === commit.body.sha) {
          built = true;
          break;
        }
        if (b.body.status === "errored") {
          log("  Pages 构建报错: " + (b.body.error && b.body.error.message));
          break;
        }
      } else {
        log(`  [${i + 1}] builds/latest -> ${b.status}`);
      }
    }
    log(built ? "PASS Pages 已构建完成（本次 commit）" : "注意：未在等待窗口内确认构建完成，可稍后刷新线上地址");

    // ---------- 线上探测 ----------
    await sleep(3000);
    const bad = await liveProbes();
    log("完成。");
    process.exitCode = bad ? 1 : 0;
  } catch (e) {
    log("DEPLOY ERROR: " + (e && e.stack ? e.stack : e));
    process.exitCode = 1;
  } finally {
    flush();
  }
})();
