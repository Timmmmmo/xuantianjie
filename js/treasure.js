/* 玄天劫 · 宝物系统（生锈/普通/精英/史诗） */
(function () {
  "use strict";
  const MAX = 12;
  const DROP_MOB = 0.01;
  const TIER = [
    { id: 0, name: "生锈", color: "#94a3b8", mult: 1.0 },
    { id: 1, name: "普通", color: "#e5e7eb", mult: 1.35 },
    { id: 2, name: "精英", color: "#c084fc", mult: 1.9 },
    { id: 3, name: "史诗", color: "#fbbf24", mult: 2.8 },
  ];
  const SLOTS = ["weapon", "armor", "accessory"];
  const SLOT_NAME = { weapon: "武器", armor: "防具", accessory: "饰品" };

  // 品质权重按波次：w<5 / <10 / <15 / >=15
  const WAVE_WEIGHTS = [
    [80, 18, 2, 0],
    [60, 32, 7, 1],
    [45, 38, 14, 3],
    [30, 40, 22, 8],
  ];

  function waveBucket(wave) {
    if (wave < 5) return 0;
    if (wave < 10) return 1;
    if (wave < 15) return 2;
    return 3;
  }

  function rollTier(wave, rnd) {
    const r = (rnd == null ? Math.random() : rnd) * 100;
    const w = WAVE_WEIGHTS[waveBucket(wave || 1)];
    let acc = 0;
    for (let i = 0; i < 4; i++) {
      acc += w[i];
      if (r < acc) return i;
    }
    return 0;
  }

  function rollSlot(rnd) {
    const r = rnd == null ? Math.random() : rnd;
    return SLOTS[Math.min(2, Math.floor(r * 3))];
  }

  const AFFIX = {
    atk: { name: "锐意", desc: "攻击 +8%" },
    hp: { name: "磐体", desc: "气血 +10%" },
    crit: { name: "破绽", desc: "暴击 +5%" },
    speed: { name: "轻身", desc: "移速 +5%" },
  };
  const AFFIX_KEYS = ["atk", "hp", "crit", "speed"];

  function rollAffix(rnd) {
    const r = rnd == null ? Math.random() : rnd;
    return AFFIX_KEYS[Math.min(3, Math.floor(r * 4))];
  }

  let _uidN = 0;
  function makeTreasure(slot, tier) {
    const t0 = clampTier(tier);
    _uidN = (_uidN + 1) % 1e6;
    return {
      uid: "t" + Date.now().toString(36) + "_" + _uidN + "_" + Math.floor(Math.random() * 9999).toString(36),
      slot,
      tier: t0,
      power: Math.round(10 * TIER[t0].mult),
      affixes: [rollAffix()],
    };
  }

  function clampTier(t) {
    const n = Number(t) || 0;
    return Math.max(0, Math.min(3, n));
  }

  function bestTier(list) {
    let b = -1;
    for (const t of list || []) if (t && t.tier > b) b = t.tier;
    return b;
  }

  /** 小怪掉落 */
  function rollMobDrop(wave, rnd) {
    const r = rnd == null ? Math.random() : rnd;
    if (r >= DROP_MOB) return null;
    return makeTreasure(rollSlot(), rollTier(wave));
  }

  /** 试炼限时击碎：至少精英，已有最高阶+1，史诗封顶 */
  function trialReward(list) {
    const best = bestTier(list);
    const next = best < 0 ? 2 : best + 1;
    return makeTreasure(rollSlot(), clampTier(Math.max(2, next)));
  }

  function canMerge(a, b) {
    return !!(a && b && a.uid !== b.uid && a.slot === b.slot && a.tier === b.tier && a.tier < 3);
  }

  function merge(a, b) {
    if (!canMerge(a, b)) return null;
    const parent = a.power >= b.power ? a : b;
    const t = makeTreasure(a.slot, a.tier + 1);
    t.power = Math.round(t.power * 0.7 + parent.power * 0.3);
    // 词缀：取父代 1 条 + 新 1 条
    const inherited = (parent.affixes && parent.affixes[0]) || rollAffix();
    const fresh = rollAffix();
    t.affixes = [inherited, fresh === inherited ? rollAffix() : fresh].slice(0, 2);
    return t;
  }

  function upgradeCost(tier) {
    return 80 * (clampTier(tier) + 1);
  }

  function canUpgrade(t) {
    return !!(t && t.tier < 3);
  }

  function upgrade(t) {
    if (!canUpgrade(t)) return null;
    const n = makeTreasure(t.slot, t.tier + 1);
    n.power = Math.round(t.power * TIER[n.tier].mult / TIER[t.tier].mult);
    n.affixes = (t.affixes || []).slice(0, 2);
    return n;
  }

  /** 战斗加成：威→攻，词缀按品质放大 */
  function combatBonus(list) {
    let atk = 0, hp = 0, crit = 0, speed = 0;
    for (const t of list || []) {
      const base = 0.01 + (t.tier || 0) * 0.02;
      atk += (t.power || 0) * 0.0008;
      for (const a of (t.affixes || [])) {
        if (a === "atk") atk += base;
        else if (a === "hp") hp += base;
        else if (a === "crit") crit += base * 0.5;
        else if (a === "speed") speed += base * 0.5;
      }
    }
    return { atk, hp, crit, speed };
  }

  function scrapValue(t) {
    return 15 * (clampTier(t && t.tier) + 1);
  }

  function addTreasure(list, item) {
    if (!item || !list) return { list: list || [], ok: false, merged: false };
    const next = list.slice();
    // 先尝试自动合成同槽同阶
    for (let i = 0; i < next.length; i++) {
      if (canMerge(next[i], item)) {
        const m = merge(next[i], item);
        next[i] = m;
        return { list: autoMergeAll(next), ok: true, merged: true, item: m };
      }
    }
    if (next.length >= MAX) return { list: next, ok: false, full: true, merged: false };
    next.push(item);
    return { list: next, ok: true, merged: false, item };
  }

  function autoMergeAll(list) {
    let arr = list.slice();
    let again = true;
    while (again) {
      again = false;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (canMerge(arr[i], arr[j])) {
            const m = merge(arr[i], arr[j]);
            arr.splice(j, 1);
            arr[i] = m;
            again = true;
            break;
          }
        }
        if (again) break;
      }
    }
    return arr;
  }

  function removeByUid(list, uid) {
    return (list || []).filter((t) => t && t.uid !== uid);
  }

  window.Treasure = {
    MAX, DROP_MOB, TIER, SLOTS, SLOT_NAME, WAVE_WEIGHTS, AFFIX,
    waveBucket, rollTier, rollSlot, makeTreasure, clampTier, bestTier,
    rollMobDrop, trialReward, combatBonus,
    canMerge, merge, upgradeCost, canUpgrade, upgrade,
    scrapValue, addTreasure, autoMergeAll, removeByUid,
  };
})();
