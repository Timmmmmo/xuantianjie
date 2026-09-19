/* 无 git 环境下的部署：走 GitHub REST API（Git Data API）推送变更并等待 Pages 构建
 *
 * 用法：  node tools/deploy.js [文件...]        # 默认推 game.js/index.html/style.css/sw.js
 *        GH_TOKEN=ghp_xxx node tools/deploy.js # 也可用 GH_TOKEN_FILE 指定令牌文件
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const TOKEN = (process.env.GH_TOKEN || fs.readFileSync(process.env.GH_TOKEN_FILE || (process.env.USERPROFILE || process.env.HOME) + "/.workbuddy/.github_token_timmmmmo", "utf8")).trim();
const OWNER = "Timmmmmo";
const REPO = "xuantianjie";
const BRANCH = "main";
const DIR = path.join(__dirname, "..");

// 需要推送的文件（相对仓库根目录）；可用命令行参数覆盖
const FILES = process.argv.slice(2).length ? process.argv.slice(2) : ["game.js", "index.html", "style.css", "sw.js", "README.md"];

const REPORT = process.env.XTJ_DEPLOY_OUT || path.join(__dirname, "last-deploy.txt");
const OUT = [];
const log = (s) => { OUT.push(String(s)); console.log(s); };
const flush = () => fs.writeFileSync(REPORT, OUT.join("\n"), "utf8");

function api(method, p, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
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
    }, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        let parsed = d;
        try { parsed = JSON.parse(d); } catch (e) {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  try {
    // 0) 前置校验
    const repo = await api("GET", `/repos/${OWNER}/${REPO}`);
    if (repo.status !== 200) throw new Error("repo 访问失败 " + repo.status + " " + JSON.stringify(repo.body));
    log(`仓库 ok: ${repo.body.full_name} 默认分支=${repo.body.default_branch} private=${repo.body.private}`);

    // 1) 取当前 head
    const ref = await api("GET", `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    if (ref.status !== 200) throw new Error("取 ref 失败 " + ref.status + " " + JSON.stringify(ref.body));
    const headSha = ref.body.object.sha;
    log(`当前 head(${BRANCH}) = ${headSha}`);

    const headCommit = await api("GET", `/repos/${OWNER}/${REPO}/git/commits/${headSha}`);
    const baseTree = headCommit.body.tree.sha;
    log(`base tree = ${baseTree}`);

    // 2) 上传 blob
    const treeItems = [];
    for (const f of FILES) {
      const abs = path.join(DIR, f);
      const buf = fs.readFileSync(abs);
      const blob = await api("POST", `/repos/${OWNER}/${REPO}/git/blobs`, {
        content: buf.toString("base64"),
        encoding: "base64",
      });
      if (blob.status !== 201) throw new Error(`blob ${f} 失败 ${blob.status} ${JSON.stringify(blob.body)}`);
      treeItems.push({ path: f, mode: "100644", type: "blob", sha: blob.body.sha });
      log(`blob ${f}: ${buf.length} bytes -> ${blob.body.sha.slice(0, 10)}`);
    }

    // 3) 建 tree
    const tree = await api("POST", `/repos/${OWNER}/${REPO}/git/trees`, { base_tree: baseTree, tree: treeItems });
    if (tree.status !== 201) throw new Error("建 tree 失败 " + tree.status + " " + JSON.stringify(tree.body));
    log(`新 tree = ${tree.body.sha}`);

    // 4) 建 commit
    const msg = [
      "feat: v7.1 黄金 15 秒 —— 修开局必死局、把升级抉择还给玩家",
      "",
      "主人反馈：「试玩了一下，前 15 秒就没有继续玩的冲动」",
      "团队处置：先做 FTUE 探针（tools/ftue-sim.js 真实跑帧循环）量化，再动手。",
      "结论：不是美术问题，是开局体验的硬伤（数据是灾难级的）。",
      "",
      "== 诊断（v7.0 实测，站桩新手）==",
      "- 9.0s 阵亡 · 90s 累计击杀 1 · 从未升级 · 从未拾取 · 教程遮挡 8.9s",
      "- 前 15 秒正反馈事件 4 条，且全是系统提示，没有一条「你变强了」",
      "- 玩家不是「不想玩」，是「还没搞懂就死了」",
      "",
      "== P0-1 活得下来 ==",
      "- 接触伤害 e.atk*dt*3.2（持续 DPS，单只贴身 ≈29）→ e.atk*0.28 一次接触一次伤害",
      "- damagePlayer 新增 0.5s 受击间隔：被 3~5 只围住不再同帧叠加秒杀",
      "- 每波结束回 12% 最大气血（原本只掉不回 = 数学上的必死局）",
      "- 回血珠掉率 4% → 10%",
      "",
      "== P0-2 立刻开打 ==",
      "- 开局空场 3s → 0.8s；并加「开局试炼潮」：0.6s 丢 8 只残血小妖 + 2 颗本命灵石",
      "- 涓流按「目标同屏数」自适应批量补怪：第 1 波 8 秒清完、空场 18 秒的问题消失",
      "- 前 3 波怪量温和化，波间 25s → 16s",
      "",
      "== P0-3 再平衡（v7.0 抬密度却没抬成长，50s 必死）==",
      "- 玩家每级 ATK ×1.05→1.075 / HP ×1.08→1.09",
      "- 常规波怪量系数 1.35w → 0.95w（峰值交给尸潮，不靠常规波堆量）",
      "- 开局环绕飞剑 1 → 2 把，剑域伤害 0.55 → 0.62（开局就能割得动）",
      "",
      "== P0-4 把决策还回来：悟道突破三选一 ==",
      "- v4.0 砍掉升级弹窗后，玩家全程没有任何需要动脑的时刻 —— 这才是「不好玩」的根因",
      "- 17 张卡分 攻/守/变 三类，每次境界突破发 3 张（保证「变」类在场）",
      "- 「变」类直接改战斗形态：飞剑+1、剑域扩张、剑气纵横、瞬步CD、连锁概率、合击CD、摄物、狂血、引雷",
      "- 卡有叠加上限，稀有卡 18% 概率顶替（惊喜感）",
      "",
      "== P1 教程不再霸屏 ==",
      "- 教程 1.5s 全屏遮挡 → 18s 后才允许弹，且 9s 超时自动收起，点任意处即关",
      "",
      "== 复测（FTUE 探针，站桩新手）==",
      "- 首次击杀 5.5s → 1.5s · 首次升级 从未 → 4.0s · 首次掉落 从未 → 0.6s",
      "- 90s：9s 阵亡 → 存活，击杀 1 → 145，升级 0 → 16 次，拾取 0 → 8",
      "",
      "== 质量 ==",
      "- 新增测试 54（悟道突破）/ 55（受击间隔+波间回血）/ 56（黄金15秒）/ 57（教程时序）",
      "- 134 PASS / 0 FAIL，9 次连跑全绿；静态接线 25 项",
      "- 新增 tools/ftue-sim.js：开局体验探针，可重复运行，用数据盯住前 15 秒",
      "",
      "sw 缓存：v7.0.0 → v7.1.0",
    ].join("\n");
    const commit = await api("POST", `/repos/${OWNER}/${REPO}/git/commits`, {
      message: msg,
      tree: tree.body.sha,
      parents: [headSha],
    });
    if (commit.status !== 201) throw new Error("建 commit 失败 " + commit.status + " " + JSON.stringify(commit.body));
    log(`新 commit = ${commit.body.sha}`);

    // 5) 更新 ref
    const upd = await api("PATCH", `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
      sha: commit.body.sha,
      force: false,
    });
    if (upd.status !== 200) throw new Error("更新 ref 失败 " + upd.status + " " + JSON.stringify(upd.body));
    log(`已推送到 ${BRANCH} -> ${upd.body.object.sha}`);
    log(`提交页: https://github.com/${OWNER}/${REPO}/commit/${commit.body.sha}`);

    // 6) 等 Pages 构建
    log("");
    log("等待 GitHub Pages 构建…");
    let built = false;
    for (let i = 0; i < 30; i++) {
      await sleep(6000);
      const b = await api("GET", `/repos/${OWNER}/${REPO}/pages/builds/latest`);
      if (b.status === 200) {
        log(`  [${i + 1}] status=${b.body.status} commit=${(b.body.commit || "").slice(0, 10)} duration=${b.body.duration}s`);
        if (b.body.status === "built" && b.body.commit === commit.body.sha) { built = true; break; }
        if (b.body.status === "errored") { log("  Pages 构建报错: " + b.body.error.message); break; }
      } else {
        log(`  [${i + 1}] builds/latest -> ${b.status}`);
      }
    }
    log(built ? "PASS Pages 已构建完成（本次 commit）" : "注意：未在等待窗口内确认构建完成，可稍后刷新线上地址");

    // 7) 线上探测
    await sleep(3000);
    const live = await new Promise((resolve) => {
      const req = https.request({
        hostname: "timmmmmo.github.io",
        path: "/xuantianjie/game.js",
        method: "GET",
        headers: { "User-Agent": "workbuddy-deploy", "Cache-Control": "no-cache" },
      }, (res) => {
        let d = ""; res.on("data", (c) => (d += c));
        res.on("end", () => resolve({
          status: res.statusCode,
          len: d.length,
          // v7.0 新增：合击 / 尸潮·连锁 / 瞬步·狂血 / 密度
          v7_fusion: /const FUSION_DEFS = \[/.test(d),
          v7_fusSync: /function syncFusions/.test(d),
          v7_fusDmg: /function fusDmg/.test(d),
          v7_blast: /function updateBlasts/.test(d),
          v7_horde: /function startHorde/.test(d),
          v7_hordeType: /hordeling: \{ name: "尸傀"/.test(d),
          v7_chain: /tryChainKill\(e\);/.test(d),
          v7_blink: /function spawnAfterimage/.test(d),
          v7_blinkIFrame: /G\.dashIFrame = G\.dashTime \+ 0\.25/.test(d),
          v7_frenzy: /function updateFrenzy/.test(d),
          v7_frenzyDmg: /m \*= 1\.5;/.test(d),
          v7_density: /wave <= 3 \? 2 \+ wave/.test(d) && /wave \* 0\.95/.test(d),
          // v7.1 黄金 15 秒
          v71_upgrade: /const UPGRADE_POOL = \[/.test(d),
          v71_take: /function takeUpgrade/.test(d),
          v71_pending: /G\.pendingLevel = \(G\.pendingLevel \|\| 0\) \+ 1;/.test(d),
          v71_hurtCD: /G\._hurtCD = 0\.5;/.test(d),
          v71_touch: /damagePlayer\(e\.atk \* 0\.28\)/.test(d),
          v71_rush: /G\._openingRush && G\.time > 0\.6/.test(d),
          v71_heal: /妖潮暂歇/.test(d),
          v71_lv: /LV_ATK_MUL = 1\.075/.test(d),
          v71_tut: /G\.time > 18/.test(d),
          v61_weapon: /function syncWeaponsFromSet/.test(d),
          v61_schoolWp: /const SCHOOL_WEAPON = \{/.test(d),
          v61_branch: /function syncJobBranchesFromSet/.test(d),
          v61_branchIdx: /const SCHOOL_BRANCH_IDX = \{/.test(d),
          v61_jobMul: /\(G\._jobAtkMul \|\| 1\)/.test(d),
          v61_xp: /xp: Math\.round\(t\.xp \* \(1 \+ \(wave \|\| 0\) \* 0\.07\)\)/.test(d),
          v61_hp: /Math\.pow\(wave, 1\.25\)/.test(d),
          // v6.0 新增
          v6_mods: /const ENEMY_MODS = \{/.test(d),
          v6_mount: /e\.mods = \(e\.elite \|\| e\.boss\)/.test(d),
          v6_syn: /const SYNERGIES = \[/.test(d),
          v6_synOn: /function synOn/.test(d),
          v6_altar: /const ALTAR_DEALS = \[/.test(d),
          v6_tierUp: /function tierUp/.test(d),
          v6_draw: /function drawAltars/.test(d) && /function drawZones/.test(d),
          // v5.0 新增
          v5_tut: /function tickTutorial/.test(d),
          v5_banner: /function showBigBanner/.test(d),
          v5_goal: /function updateGoalBar/.test(d),
          v5_stone: /function setStoneSlot/.test(d),
          v5_purity: /const PURITY_BONUS/.test(d),
          v5_wheel: /let best = -1, bestDef = null/.test(d),
          v5_orange: /orange-pause/.test(d),
          v5_milestone: /紫装入手里程碑/.test(d),
          // v4 保留
          v4_skill: /function triggerEquipSkill/.test(d),
          v4_job: /function autoJobFromSet/.test(d),
          v4_core: /function autoUnlockCoreCheck/.test(d),
          sk_aff: /sk_fire_jet/.test(d),
          sk_list: /SKILL_AFFIX_KEYS/.test(d),
          // v3 装备
          equip: /const TIERS = \{/.test(d) && /const AFFIX_POOL/.test(d),
          inv: /function pickUpEquip/.test(d),
          // v2 派系
          gems: /const CHAR_STONES/.test(d),
          school9: /STONE_BY_SCHOOL\[st\.school\] = STONE_BY_SCHOOL\[st\.school\] \|\| \[\]/.test(d),
          res: /function recomputeResonance/.test(d),
          elem: /const ELEM_OVERCOME/.test(d),
          core: /const SCH_CORES/.test(d),
        }));
      });
      req.on("error", (e) => resolve({ status: 0, err: e.message }));
      req.end();
    });
    log("");
    log(`线上探测 https://timmmmmo.github.io/xuantianjie/game.js -> HTTP ${live.status} bytes=${live.len}`);
    log(`  v6.0: 词缀表=${live.v6_mods} 挂载=${live.v6_mount} 联动表=${live.v6_syn} 联动判定=${live.v6_synOn} 祭坛=${live.v6_altar} 品阶=${live.v6_tierUp} 绘制=${live.v6_draw}`);
    log(`  v7.0: 合击表=${live.v7_fusion} 合击同步=${live.v7_fusSync} 合击伤害=${live.v7_fusDmg} 爆点队列=${live.v7_blast} 尸潮=${live.v7_horde} 尸傀=${live.v7_hordeType} 连锁=${live.v7_chain} 瞬步=${live.v7_blink} 无敌延长=${live.v7_blinkIFrame} 狂血=${live.v7_frenzy} 狂血加伤=${live.v7_frenzyDmg} 密度=${live.v7_density}`);

    log(`  v7.1 黄金15秒: 悟道池=${live.v71_upgrade} 选卡=${live.v71_take} 升级挂起=${live.v71_pending} 受击间隔=${live.v71_hurtCD} 接触伤害=${live.v71_touch} 开局潮=${live.v71_rush} 波间回血=${live.v71_heal} 成长=${live.v71_lv} 教程延后=${live.v71_tut}`);

    // v7.0 HUD DOM 在 index.html 里，单独探测一次
    const htmlLive = await new Promise((resolve) => {
      const req = https.request({
        hostname: "timmmmmo.github.io",
        path: "/xuantianjie/index.html",
        method: "GET",
        headers: { "User-Agent": "workbuddy-deploy", "Cache-Control": "no-cache" },
      }, (res) => {
        let d = ""; res.on("data", (c) => (d += c));
        res.on("end", () => resolve({
          status: res.statusCode,
          fusion: /id="fusionHud"/.test(d),
          horde: /id="hordeBar"/.test(d),
          frenzy: /id="frenzyHud"/.test(d),
        }));
      });
      req.on("error", (e) => resolve({ status: 0, err: e.message }));
      req.end();
    });
    log(`  v7.0 HUD(index.html HTTP ${htmlLive.status}): 合击条=${htmlLive.fusion} 尸潮条=${htmlLive.horde} 狂血徽标=${htmlLive.frenzy}`);
    log(`  v6.1: 武器同步=${live.v61_weapon} 派系→武器=${live.v61_schoolWp} 法门同步=${live.v61_branch} 派系→法门=${live.v61_branchIdx} 法门系数=${live.v61_jobMul} 经���曲线=${live.v61_xp} 血量曲线=${live.v61_hp}`);
    log(`  v5.0: 教程=${live.v5_tut} 大字报=${live.v5_banner} 目标条=${live.v5_goal} 灵石槽=${live.v5_stone} 纯度=${live.v5_purity} 技能轮盘=${live.v5_wheel} 橙装慢镜=${live.v5_orange} 里程碑=${live.v5_milestone}`);
    log(`  v4.0: 技能=${live.v4_skill} 套装=${live.v4_job} 核心自动=${live.v4_core}`);
    log(`  v3.0: 装备=${live.equip} 背包=${live.inv} 词条=${live.sk_aff} 技能列表=${live.sk_list}`);
    log(`  v2.0: 灵石=${live.gems} 九派系=${live.school9} 共鸣=${live.res} 五行=${live.elem} 派系核心=${live.core}`);
    log("");
    log("完成。");
  } catch (e) {
    log("DEPLOY ERROR: " + (e && e.stack ? e.stack : e));
  } finally {
    flush();
  }
})();
