# 玄天劫 · v7.8.5 功能与质量交付测试报告

- 被测对象：线上 `https://timmmmmo.github.io/xuantianjie/`（GitHub `Timmmmmo/xuantianjie@main`）
- 线上版本标记：`v7.8.5 · 本周挑战 · v7.7玩法 + 回访壳`
- 本地基线：`C:/Users/hjzha/WorkBuddy/Claw/xuantianjie-7.8.5/`（全量 44 文件 / 6 目录，2026-09-20 拉取）
- 测试执行：2026-09-20
- 一句话结论：**核心可玩、真机稳定、资源与语法全绿；但有 2 项 P1 阻断，建议修复后再正式交付。**

---

## 1. 结论速览

| 维度 | 结果 | 判定 |
|------|------|------|
| 语法（17 个 js） | 17/17 PASS | ✅ |
| 自带逻辑冒烟 | 140 PASS / **1 FAIL** | ⚠ |
| 真机运行时（无头 Edge） | 未复现崩溃 · 未捕获异常 0 · 堆 2–3MB | ✅ |
| 线上资源可达 | 19/19 HTTP 200 | ✅ |
| manifest / PWA | 合法（fullscreen · 3 图标） | ✅ |
| 静态审计 | 7 零调用函数 · 8 零引用常量 · 0 不可达系统 | ⚠ |
| 可玩性探针 | 跨流派仍有 1 项系统不可达 | ⚠ |
| 版本号一致性 | 3 处不一致 | ❌ |

**门禁判定：不通过。** 依 `docs/PM_OPERATING.md` §2.5「回归：每次发布 smoke + verify 全绿才允许部署」，当前 smoke 非全绿（1 FAIL）；且版本号不一致会污染埋点归因。修复 2 项 P1 后可转「有条件通过」。

---

## 2. 测试方法与环境

| 层级 | 手段 | 说明 |
|------|------|------|
| 自动化冒烟 | `node tests/logic-smoke.js` | 桩化 DOM/Canvas2D，真跑 game.js 帧循环，写 `tests/last-run.txt` |
| 数值/体验探针 | `tools/audit-sim.js` `balance-sim.js` `ftue-sim.js` `playability-sim.js` | 项目自带，各自输出报告 |
| 真机运行时 | `tools/crash-repro.js` | CDP 直连本机 Edge headless（`--headless=new`），手机竖屏 414×896，真跑完整流程 |
| 静态一致性 | node 脚本 | 语法、资源可达、manifest、sw 预缓存、孤儿文件、版本号 |
| 对照实验 | 改写测试 54 波次 | 用于证伪/证实 FAIL 根因 |

环境：本机无 Git CLI、无 GUI 浏览器；PATH 缺 coreutils（`ls/mkdir/dirname`），故文件与网络操作走 `node` / `curl.exe` / `tar.exe`。

---

## 3. 功能测试结果

### 3.1 语法 & 构建
- `node --check` × 17（game.js、sw.js、js/*.js、tests、tools）：**全部 PASS**。

### 3.2 自带逻辑冒烟：140 PASS / 1 FAIL
覆盖：加载无异常、进入战斗、剑阵增益、减伤/经验、受击间隔、割草密度、悟道突破、悬赏令、灵石槽、装备重算等 63 个用例段。

- **唯一 FAIL：`== 54) v7.1 · 悟道突破` → `FAIL 悟道突破异常`**
  - 断言：升级后 `update()` 一次，`state` 应为 `"level"`、卡面应为 3 张。
  - 实际：`pendingLevel=1`（正确），但 `state="play"`、卡面 0 张，且已自动选中一张卡（`{"u_elem":1}`）。
  - 根因（已定位到代码）：`game.js` 升级分支 ——
    ```js
    if ((G.pendingLevel||0) > 0 && G.state === "play") {
      if (autoUpgradePhase()) flushAutoUpgrades();   // G.wave<=10：自动发卡，不弹窗
      else { openLevelUp(); ... }                    // 第 11 波起才弹三选一
    }
    ```
    `autoUpgradePhase() = G.wave <= 10`（v7.5「前 10 波自动悟道」设计）。用例运行时波次处在 ≤10 区间，走的是自动发卡分支，故永远不弹窗。
  - **性质：测试用例过时，非游戏运行时缺陷。**
  - 对照实验：把该用例波次强制为 `G.wave = 11` 后重跑 → **141 PASS / 0 FAIL**，日志变为 `state=level · 卡面 3 张`。
  - 修复建议：用例内先 `G.wave = 11`（或 `AUTO_UPGRADE_MAX_WAVE + 1`）再验证弹窗。

### 3.3 真机运行时（直奔第 3 波「伤害测试者」砍碎 + 继续跑）
- 未捕获异常：**0**；`console.error`：**0**；`unhandledrejection`：**0**
- 主循环存活：**true**（12 秒实时内世界推进 6.12 秒）
- 试炼结果：`success=true · grade=**S** · dps=945 · ratio=1.0`（39 次命中 · 3 段裂痕里程碑）
- 堆内存：全程 2–3 MB，无增长趋势
- 结论：**未复现「打完伤害测试者崩溃」，v7.7 的六道崩溃防线在 v7.8.5 中依然生效。**

### 3.4 线上资源可达性
- 19 项资源（含 `/`、html、css、game.js、sw.js、manifest、6 个 js/*、assets、icons）：**全部 HTTP 200**。

### 3.5 PWA / 缓存
- `manifest.webmanifest`：JSON 合法（`name=玄天劫 · 刷不完的怪`，`start_url=./index.html`，`display=fullscreen`，3 图标）。
- `sw.js` 预缓存 20 项：**缺失 0**。
- 缓存名 `xuantianjie-v7.8.5-mr`。

---

## 4. 质量测试结果

### 4.1 静态审计（`tools/audit-sim.js`）
- 顶层函数 255 个 → **7 个零调用**：`shuffle`、`schoolElem`、`elemMulVs`、`openJobModal`、`openRelicModal`、`forgeOrdinary`、`openEssenceModal`
- 顶层常量 130 个 → **8 个零引用**：`ARTIFACT_BY_ID`、`SCHOOLS_ALL`、`ORDINARY_COST`、`BOSS_PURPLE_DROP`、`AFFIX_BY_KEY`、`ACTIVE_SKILL_KEYS`、`PASSIVE_SKILL_KEYS`、`JOB_STAGES`
- 关键系统可达性：**0 个不可达**（16 项系统公式层可达）
- 内容量：悟道卡池 23 张（变类 15）、合击 6 组、悬赏 3、祭坛 6、联动 8、词缀 13、敌种 17

### 4.2 数值平衡（`tools/balance-sim.js`）
- 妖王 HP 随波次指数放大（w^1.25）；40 波妖王 HP ≈ 49206（35×）
- **风险：后期容错不降反升**（20 波能挨 11.5 下 → 40 波 12.7 下），长局缺少终局压力。

### 4.3 开局体验（`tools/ftue-sim.js`）
- 首次击杀 1.4s · 首次升级 4.1s · 首次掉落 0.6s · 首次挨打 3.6s
- 前 15 秒 10 条反馈事件（开局八妖 → 自动悟道 → 连杀里程碑 → banner）
- 结论：开局反馈密度良好，符合「黄金 15 秒」目标。

### 4.4 可玩性探针（`tools/playability-sim.js`）
- 专精流：20 个系统中 **6 个整局 0 触发**（含法门 Lv1/Lv3、武器觉醒）
- 双修流：1/20 未触发（法门 Lv3）
- 跨流派汇总：**⚠ 法门 Lv3 在两条路线均不可达** —— 探针自评「灵石槽与法门的联动仍不通」，属未修完的 P0。

---

## 5. 缺陷清单

| # | 级别 | 问题 | 证据 | 建议 |
|---|------|------|------|------|
| 1 | **P1** | 冒烟门禁非全绿（140P/1F），违反 PM 手册「smoke 全绿才部署」 | 测试 54 FAIL；对照实验证实用例过时 | 用例补 `G.wave=11`；或按新设计重写断言 |
| 2 | **P1** | 版本号三处不一致 | `sw.js=v7.8.5-mr` / `game.js=v7.8.2-mbiz` / `index.html=v7.8.5` | 统一到单一版本常量 / build 变量 |
| 3 | **P2** | 法门 Lv3 跨流派不可达（灵石槽↔法门联动不通） | playability 探针两条路线均 0 次 | 修联动条件（同派系灵石入槽应计入门槛） |
| 4 | **P2** | 死代码：7 零调用函数 + 8 零引用常量 | audit-sim（注意 `openJobModal` 为设计性空实现） | 清理或标注保留原因 |
| 5 | **P3** | 孤儿文件：`js/meta.js`、`js/modes.js`、`js/tutorial.js` 无人引用 | 全仓库引用扫描 | `meta.js` 为手册明令禁止的遗留，应删；确认 modes/tutorial 去留 |
| 6 | **P3** | 长局平衡：后期容错反升，缺终局压力 | balance-sim（11.5→12.7） | 调高后期怪物攻击/血量斜率 |
| 7 | **P3** | 文档与结构漂移 | README 描述 `game/`、`.deploy/verify.js`，实际为扁平结构、无 `.deploy/` | 对齐 README 与真实目录 |

---

## 6. 交付判定与建议

**判定：暂缓交付 → 修复 P1 后可交付。**

- 优势：核心玩法完整可玩、真机零崩溃零异常、资源与语法全绿、开局体验与内容广度达标。
- 阻断项：①冒烟门禁红；②版本号不一致（影响埋点归因与热更判断）。
- 次优项：法门 Lv3 联动（P2，建议本周期内闭环）、死代码与孤儿文件清理。

**建议交付顺序**：
1. 修 P1-1（用例波次）→ smoke 全绿
2. 修 P1-2（版本号统一）→ 重跑语法/冒烟
3. 修 P2-3（法门 Lv3 联动）→ 重跑 playability
4. bump `sw.js` CACHE → 部署 → 线上真机抽样

---

## 附录 · 复现命令

```bash
cd xuantianjie-7.8.5
node tests/logic-smoke.js                    # 冒烟（结果见 tests/last-run.txt）
node tools/audit-sim.js                      # 静态审计
node tools/balance-sim.js                    # 数值平衡
node tools/ftue-sim.js                       # 开局体验
node tools/playability-sim.js                # 可玩性
node tools/crash-repro.js --forced           # 真机运行时（需本机 Edge）
```
