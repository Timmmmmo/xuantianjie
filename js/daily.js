/* 玄天劫 · 日课状态机（按本地日重置）— 合并版：无速局，以无尽第5波替代 */
(function () {
  "use strict";
  const DEFS = [
    { id: "wave5", name: "撑过五波", desc: "无尽单局波次 ≥ 5", target: 1, reward: 30 },
    { id: "combo", name: "连杀入道", desc: "单局峰值连杀 ≥ 12", target: 1, reward: 50 },
    { id: "arms", name: "百兵齐鸣", desc: "单局武器种类 ≥ 3", target: 1, reward: 100 },
  ];
  const ALL_BONUS = 100;

  function todayKey(d) {
    const dt = d || new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function ensureToday(meta, now) {
    const key = todayKey(now);
    if (!meta.daily || meta.daily.date !== key) {
      meta.daily = {
        date: key,
        progress: { wave5: 0, combo: 0, arms: 0 },
        granted: { wave5: false, combo: false, arms: false, all: false },
      };
    }
    if (!meta.daily.progress.wave5 && meta.daily.progress.quick) meta.daily.progress.wave5 = meta.daily.progress.quick;
    return meta;
  }

  function applyRunResult(meta, result) {
    ensureToday(meta);
    const grants = [];
    const d = meta.daily;
    const r = result || {};

    if (typeof r.comboPeak === "number") {
      d.progress.combo = Math.max(d.progress.combo || 0, r.comboPeak >= 12 ? 1 : 0);
    }
    if (typeof r.weaponKinds === "number") {
      d.progress.arms = Math.max(d.progress.arms || 0, r.weaponKinds >= 3 ? 1 : 0);
    }
    if (typeof r.wave === "number") {
      d.progress.wave5 = Math.max(d.progress.wave5 || 0, r.wave >= 5 ? 1 : 0);
    } else if (r.win && r.mode === "quick") {
      d.progress.wave5 = Math.max(d.progress.wave5 || 0, 1);
    }

    for (const def of DEFS) {
      if (d.progress[def.id] >= def.target && !d.granted[def.id]) {
        d.granted[def.id] = true;
        meta.coins = (meta.coins || 0) + def.reward;
        grants.push({ id: def.id, coins: def.reward, msg: `日课·${def.name} +${def.reward}` });
      }
    }

    const allDone = DEFS.every((def) => d.progress[def.id] >= def.target);
    if (allDone && !d.granted.all) {
      d.granted.all = true;
      meta.coins = (meta.coins || 0) + ALL_BONUS;
      grants.push({ id: "all", coins: ALL_BONUS, msg: `日课全清 +${ALL_BONUS}` });
    }
    return { meta, grants, allDone };
  }

  function snapshot(meta, now) {
    const copy = {
      ...meta,
      daily: meta.daily
        ? { ...meta.daily, progress: { ...meta.daily.progress }, granted: { ...meta.daily.granted } }
        : null,
    };
    const m = ensureToday(copy, now);
    const items = DEFS.map((def) => {
      const p = m.daily.progress[def.id] || 0;
      return {
        id: def.id,
        name: def.name,
        desc: def.desc,
        progress: Math.min(p, def.target),
        target: def.target,
        reward: def.reward,
        done: p >= def.target,
        granted: !!m.daily.granted[def.id],
      };
    });
    const doneCount = items.filter((i) => i.done).length;
    return { date: m.daily.date, items, doneCount, total: DEFS.length, allDone: doneCount === DEFS.length };
  }

  function countWeaponKinds(weapons) {
    if (!weapons) return 0;
    let n = 0;
    for (const k of Object.keys(weapons)) {
      if (weapons[k] && weapons[k].lv > 0) n += 1;
    }
    // v7.7：装备/法宝槽位也算“兵器”
    return n;
  }

  window.Daily = {
    DEFS,
    ALL_BONUS,
    todayKey,
    ensureToday,
    applyRunResult,
    snapshot,
    countWeaponKinds,
  };
})();
