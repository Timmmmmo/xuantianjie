# 玄天劫 · 刷不完的怪

单人玄幻风格手游（H5），灵感来自魔兽争霸 RPG 地图「刷不完的怪」。  
**v1.3** 完成手机端深度适配 + PWA 改造，并已部署上线。

## 立即游玩（线上）

```
https://timmmmmo.github.io/xuantianjie/
```

手机浏览器直接打开即可；iPhone 可用 Safari「添加到主屏幕」获得全屏体验，
Android Chrome 会提示安装应用（PWA，支持离线）。

## 本地游玩

```
game/index.html
```

竖屏优先，触控 + 键盘（WASD / 方向键，技能 1/2 或 Q/W，Esc/P 暂停，F 全屏）。

## v1.3 手机端优化清单

| 项 | 说明 |
|----|------|
| 动态摇杆 | 屏幕任意位置按下即在该处生成摇杆，跟手；抬指自动回左下角停靠 |
| 多指操作 | 一指移动 + 一指放技能互不干扰（Pointer Events + 指针捕获） |
| 视口修复 | `100dvh` + `body{position:fixed}`，解决 iOS 地址栏跳动与橡皮筋滚动 |
| 安全区 | 刘海 / 灵动岛 / 手势条全适配 `env(safe-area-inset-*)` |
| 后台暂停 | 切后台或切标签自动暂停，回来手点继续，不再「切出去就被打死」 |
| 性能自适应 | 按 `deviceMemory`/`hardwareConcurrency` 预降档，再按实时 FPS 三档动态调整（DPR、雾团、粒子、毛玻璃、`shadowBlur`） |
| 屏幕常亮 | 战斗中使用 Wake Lock 防止息屏 |
| 触感反馈 | 放技能 / 受击调用 `navigator.vibrate` |
| 可安装 PWA | `manifest.webmanifest` + `sw.js`，全屏启动、离线可玩 |
| 触控细节 | 禁长按菜单、禁双击缩放、禁用文本选择、技能键加大到 82px |
| 新增控件 | 开始页「全屏 / 音效」开关，暂停面板 |

## v1.2 玩法

- 拖动屏幕任意位置移动；飞剑/环绕剑自动索敌
- **剑气** 扇形爆发 / **御风** 加速无敌帧
- **连杀 Combo**：2.2s 窗口叠层，经验奖励放大，10/25/50 有里程碑
- **自动武器进化链**：
  - 业火球（燃烧）→ 业火燎原
  - 紫电（弹射）→ 九天雷法
  - 寒冰锥（减速）→ 千里冰封
  - 周天剑阵（自身AOE）→ 万剑归宗
- **三角色**：剑修 / 法修 / 体修
- **灵石商店**：永久强化（攻击/生命/移速/经验/灵石/剑胚/机缘）
- 暴击与精英死有 **击顿** 手感
- 无尽波次：零星刷新 + 正式波；每 3 波精英、每 5 波 Boss

## 管理角色视角

| 角色 | v1.3 关注点 |
|------|------------|
| 产品 | 再战成瘾：Combo + 局外灵石 + 武器进化 |
| 美术/UI | 图标/PWA 启动图、移动端字号与触控热区 |
| 开发 | Canvas2D 零依赖；画质三档自适应；无 git 环境下的 API 部署脚本 |
| 测试 | 44 项 jsdom 运行时验收（见 `.deploy/verify.js`） |
| 质量 | 见 `docs/QUALITY_REPORT.md` |

## 自测

```powershell
# 逻辑数学冒烟
node game/tests/logic-smoke.js

# 线上产物运行时验收（需 jsdom，44 项）
node .deploy/verify.js
```

## 部署

无需 git：`.deploy/deploy.js` 通过 GitHub REST API 建仓、上传、开 Pages 并轮询上线。

```powershell
$env:GH_TOKEN="<token>"; $env:GH_REPO="xuantianjie"; node .deploy/deploy.js
```

## 目录

```
PROJECT.md
README.md
docs/PRD.md
docs/ART_UI.md
docs/QA_CHECKLIST.md
docs/QUALITY_REPORT.md
docs/compose/spec/playability-v1-2.md
docs/compose/spec/art-top10.md
game/index.html
game/style.css
game/game.js
game/manifest.webmanifest
game/sw.js
game/assets/*.png
game/icons/*.png
game/tools/make_icons.py
game/tests/logic-smoke.js
.deploy/deploy.js
.deploy/verify.js
```

## 环境说明

本机无 git / 无 gh CLI，部署走 GitHub REST API；无可用 GUI 浏览器，运行时验收走 jsdom。
