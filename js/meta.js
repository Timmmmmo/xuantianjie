/* 玄天劫 · 局外存档 v3（自 v2 迁移） */
(function () {
  "use strict";
  const META_KEY = "xuantianjie_meta_v3";
  const META_KEY_V2 = "xuantianjie_meta_v2";

  const SHOP_DEFS = [
    { id: "atk", name: "锋锐灵纹", desc: "开局攻击 +6%/级", max: 10, base: 40, ico: "锐", tier: "cyan", apply: (s) => { s.atkMul += 0.06; } },
    { id: "hp", name: "厚土诀", desc: "开局生命 +8/级", max: 10, base: 35, ico: "体", tier: "green", apply: (s) => { s.hpBonus += 8; } },
    { id: "spd", name: "清风步", desc: "开局移速 +3%/级", max: 8, base: 45, ico: "疾", tier: "cyan", apply: (s) => { s.spdMul += 0.03; } },
    { id: "xp", name: "悟性", desc: "经验 +5%/级", max: 8, base: 50, ico: "悟", tier: "violet", apply: (s) => { s.xpMul += 0.05; } },
    { id: "coin", name: "聚灵玉", desc: "灵石获取 +8%/级", max: 5, base: 80, ico: "玉", tier: "gold", apply: (s) => { s.coinMul += 0.08; } },
    { id: "sword", name: "剑胚", desc: "开局飞剑更利", max: 5, base: 60, ico: "剑", tier: "cyan", apply: (s) => { s.swordBonus += 1; } },
    { id: "luck", name: "机缘", desc: "升级更易出稀有项", max: 5, base: 70, ico: "缘", tier: "gold", apply: (s) => { s.luck += 1; } },
  ];

  function emptyDaily() {
    return {
      date: "",
      progress: { quick: 0, combo: 0, arms: 0 },
      granted: { quick: false, combo: false, arms: false, all: false },
    };
  }

  function emptySignin() {
    return { nextDay: 1, lastClaimDate: "", claims: 0 };
  }

  function defaults() {
    return {
      coins: 0,
      bestWave: 0,
      bestKills: 0,
      bestTime: 0,
      bestCombo: 0,
      shop: {},
      selectedChar: "sword",
      daily: emptyDaily(),
      modeStats: { quickWins: 0, endlessBestWave: 0, endlessWins: 0 },
      lastMode: "endless",
      signin: emptySignin(),
      tutorialDone: false,
      treasures: [],
      version: 3,
    };
  }

  function migrateFromV2() {
    try {
      const raw = localStorage.getItem(META_KEY_V2);
      if (!raw) return defaults();
      const d = JSON.parse(raw) || {};
      const base = defaults();
      return {
        coins: d.coins || 0,
        bestWave: d.bestWave || 0,
        bestKills: d.bestKills || 0,
        bestTime: d.bestTime || 0,
        bestCombo: d.bestCombo || 0,
        shop: d.shop || {},
        selectedChar: d.selectedChar || "sword",
        daily: emptyDaily(),
        modeStats: { quickWins: 0, endlessBestWave: base.bestWave, endlessWins: 0 },
        lastMode: "endless",
        signin: emptySignin(),
        tutorialDone: false,
        version: 3,
      };
    } catch (_) {
      return defaults();
    }
  }

  const Meta = {
    key: META_KEY,
    load() {
      try {
        const raw = localStorage.getItem(META_KEY);
        if (raw) {
          const d = JSON.parse(raw) || {};
          const base = defaults();
          const merged = {
            ...base,
            ...d,
            shop: d.shop || {},
            daily: { ...emptyDaily(), ...(d.daily || {}) },
            modeStats: { ...base.modeStats, ...(d.modeStats || {}) },
            signin: { ...emptySignin(), ...(d.signin || {}) },
            treasures: Array.isArray(d.treasures) ? d.treasures.slice(0, 40) : [],
            tutorialDone: !!d.tutorialDone,
            version: 3,
          };
          merged.daily.progress = { ...emptyDaily().progress, ...((d.daily && d.daily.progress) || {}) };
          merged.daily.granted = { ...emptyDaily().granted, ...((d.daily && d.daily.granted) || {}) };
          if (!merged.signin.nextDay || merged.signin.nextDay < 1 || merged.signin.nextDay > 7) {
            merged.signin.nextDay = 1;
          }
          return merged;
        }
        const migrated = migrateFromV2();
        this.save(migrated);
        return migrated;
      } catch (_) {
        return defaults();
      }
    },
    save(d) {
      try {
        const payload = { ...d, version: 3 };
        localStorage.setItem(META_KEY, JSON.stringify(payload));
      } catch (_) {}
    },
    shopLevel(id) { return this.load().shop[id] || 0; },
    shopCost(def) {
      const lv = this.shopLevel(def.id);
      return Math.floor(def.base * Math.pow(1.55, lv));
    },
    buy(id) {
      const def = SHOP_DEFS.find((s) => s.id === id);
      if (!def) return { ok: false, msg: "无效" };
      const d = this.load();
      const lv = d.shop[id] || 0;
      if (lv >= def.max) return { ok: false, msg: "已满级" };
      const cost = Math.floor(def.base * Math.pow(1.55, lv));
      if (d.coins < cost) return { ok: false, msg: "灵石不足" };
      d.coins -= cost;
      d.shop[id] = lv + 1;
      this.save(d);
      return { ok: true, msg: `${def.name} Lv${lv + 1}` };
    },
    statsFromShop() {
      const d = this.load();
      const s = { atkMul: 0, hpBonus: 0, spdMul: 0, xpMul: 0, coinMul: 0, swordBonus: 0, luck: 0 };
      for (const def of SHOP_DEFS) {
        const lv = d.shop[def.id] || 0;
        for (let i = 0; i < lv; i++) def.apply(s);
      }
      return s;
    },
    endRun(wave, kills, time, comboPeak, coinsEarned, mode, win) {
      const d = this.load();
      d.bestWave = Math.max(d.bestWave, wave);
      d.bestKills = Math.max(d.bestKills, kills);
      d.bestTime = Math.max(d.bestTime, Math.floor(time));
      d.bestCombo = Math.max(d.bestCombo, comboPeak);
      d.coins += coinsEarned;
      if (mode === "quick") d.modeStats.quickWins = d.modeStats.quickWins; // wins counted by caller
      if (mode === "endless") {
        d.modeStats.endlessBestWave = Math.max(d.modeStats.endlessBestWave || 0, wave);
        if (win) d.modeStats.endlessWins = (d.modeStats.endlessWins || 0) + 1;
      }
      this.save(d);
      return d;
    },
    addQuickWin() {
      const d = this.load();
      d.modeStats.quickWins = (d.modeStats.quickWins || 0) + 1;
      this.save(d);
      return d.modeStats.quickWins;
    },
    setLastMode(mode) {
      const d = this.load();
      d.lastMode = mode;
      this.save(d);
    },
    setTutorialDone() {
      const d = this.load();
      d.tutorialDone = true;
      this.save(d);
      return d;
    },
  };

  window.SHOP_DEFS = SHOP_DEFS;
  window.Meta = Meta;
  window.META_KEY = META_KEY;
})();
