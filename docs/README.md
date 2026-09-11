# 玄天劫 · 刷不完的怪

单人玄幻风格手游（H5），灵感来自魔兽争霸 RPG 地图「刷不完的怪」。  
**v1.2** 对齐 2026 主流 TOP10 幸存者类小游戏：Combo、灵石养成、多武器进化、三角色。

## 立即游玩
打开：

```
game/index.html
```

竖屏优先，触控 + 键盘（WASD，技能 1/2 或 Q/W）。

## v1.2 玩法
- 左摇杆移动；飞剑/环绕剑自动索敌
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
| 角色 | v1.2 关注点 |
|------|------------|
| 产品 | 再战成瘾：Combo + 局外灵石 + 武器进化 |
| 美术/UI | 角色卡、商店、连杀角标、结算灵石 |
| 开发 | Canvas2D 零依赖，低端机友好（不做3D） |
| 测试 | QA 清单 + 逻辑冒烟 |
| 质量 | 见 QUALITY_REPORT |

## 逻辑自测
```powershell
node game/tests/logic-smoke.js
```

## 目录
```
PROJECT.md
docs/PRD.md
docs/ART_UI.md
docs/QA_CHECKLIST.md
docs/QUALITY_REPORT.md
docs/compose/spec/playability-v1-2.md
game/index.html
game/style.css
game/game.js
game/tests/logic-smoke.js
```

## 环境说明
本机无 git / 无 grok CLI；Compose Next 的 worktree 阶段按覆盖处理，直接在会话工作区开发。
