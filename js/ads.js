/* 玄天劫 · 激励视频适配层（预研 Mock，可替换为真实 SDK） */
(function () {
  "use strict";
  const DAILY_LIMIT = { settle_double: 2, daily_refresh: 1 };
  const MOCK_MS = 3000;
  let failNext = false;
  let inflightPlacement = null;

  function todayKey(d) {
    const dt = d || new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function ensureUsage(meta, now) {
    const key = todayKey(now);
    if (!meta.adUsage || meta.adUsage.date !== key) {
      meta.adUsage = { date: key, settle_double: 0, daily_refresh: 0 };
    }
    return meta.adUsage;
  }

  function isPremium(meta) {
    return !!(meta && meta.premium && meta.premium.noAds);
  }

  function remainingToday(placement, meta, now) {
    const max = DAILY_LIMIT[placement];
    if (!max) return 0;
    if (isPremium(meta)) return 0;
    const u = ensureUsage(meta || {}, now);
    return Math.max(0, max - (u[placement] || 0));
  }

  function canOffer(placement, meta, now) {
    return remainingToday(placement, meta, now) > 0;
  }

  function markShown(placement, now) {
    if (!DAILY_LIMIT[placement]) return false;
    if (typeof Meta === "undefined" || !Meta.load) return false;
    const meta = Meta.load();
    if (isPremium(meta)) return false;
    const u = ensureUsage(meta, now);
    if ((u[placement] || 0) >= DAILY_LIMIT[placement]) return false;
    u[placement] = (u[placement] || 0) + 1;
    meta.adUsage = u;
    Meta.save(meta);
    return true;
  }

  function refundShown(placement, now) {
    if (!DAILY_LIMIT[placement]) return;
    if (typeof Meta === "undefined" || !Meta.load) return;
    const meta = Meta.load();
    const u = ensureUsage(meta, now);
    u[placement] = Math.max(0, (u[placement] || 0) - 1);
    meta.adUsage = u;
    Meta.save(meta);
  }

  function busy() {
    return !!inflightPlacement;
  }

  /** Mock 激励视频：串行互斥，约 3s 后 completed；发奖前由 grant* 再校验 */
  function offer(placement) {
    const payload = { placement, mock: true, completed: false, ok: false };
    if (!DAILY_LIMIT[placement]) {
      return Promise.resolve({ ...payload, error: "unknown_placement" });
    }
    if (inflightPlacement) {
      return Promise.resolve({ ...payload, error: "busy" });
    }
    if (typeof Meta !== "undefined" && Meta.load) {
      const meta = Meta.load();
      if (isPremium(meta)) {
        return Promise.resolve({ ...payload, error: "premium" });
      }
      if (!canOffer(placement, meta)) {
        return Promise.resolve({ ...payload, error: "daily_limit" });
      }
    }
    if (typeof Analytics !== "undefined" && Analytics.track) {
      Analytics.track("ad_offer", { placement, mock: true });
    }
    const willFail = failNext;
    failNext = false;
    const ms = willFail ? 400 : MOCK_MS;
    inflightPlacement = placement;
    return new Promise((resolve) => {
      setTimeout(() => {
        inflightPlacement = null;
        const ok = !willFail;
        if (ok) markShown(placement);
        if (typeof Analytics !== "undefined" && Analytics.track) {
          Analytics.track("ad_result", { placement, completed: ok, mock: true });
        }
        resolve({ placement, mock: true, ok, completed: ok, ms });
      }, ms);
    });
  }

  function failCurrent() {
    failNext = true;
  }

  /** 结算灵石×2：仅翻倍本局 run 灵石；发奖层再校验 premium/日限/已用 */
  function grantSettleDouble(runCoins, opts) {
    const add = Math.max(0, Math.floor(runCoins || 0));
    const skipUsage = !!(opts && opts.skipUsage);
    if (add <= 0) return { ok: false, add: 0, msg: "本局无灵石可翻倍" };
    if (typeof Meta === "undefined" || !Meta.load) return { ok: false, add: 0, msg: "存档不可用" };
    const meta = Meta.load();
    if (isPremium(meta)) return { ok: false, add: 0, msg: "已去广告", error: "premium" };
    if (opts && opts.usedThisRun) return { ok: false, add: 0, msg: "本局已翻倍", error: "run_used" };
    if (!skipUsage && !canOffer("settle_double", meta)) {
      return { ok: false, add: 0, msg: "今日翻倍已用完", error: "daily_limit" };
    }
    meta.coins = (meta.coins || 0) + add;
    Meta.save(meta);
    return { ok: true, add, msg: `广告翻倍 +${add} 灵石` };
  }

  /** 日课补签：发奖层校验 premium/日限；成功后 mark 由 offer 已计，失败则 refund */
  function grantDailyRefresh(now, opts) {
    const skipUsage = !!(opts && opts.skipUsage);
    if (typeof Meta === "undefined" || !Meta.load || typeof Daily === "undefined") {
      return { ok: false, msg: "日课不可用" };
    }
    const meta = Meta.load();
    if (isPremium(meta)) {
      if (opts && opts.refundOnFail) refundShown("daily_refresh", now);
      return { ok: false, msg: "已去广告", error: "premium" };
    }
    if (!skipUsage && !canOffer("daily_refresh", meta)) {
      if (opts && opts.refundOnFail) refundShown("daily_refresh", now);
      return { ok: false, msg: "今日补签已用完", error: "daily_limit" };
    }
    if (typeof Daily.ensureToday === "function") Daily.ensureToday(meta, now);
    const d = meta.daily;
    if (!d) {
      if (opts && opts.refundOnFail) refundShown("daily_refresh", now);
      return { ok: false, msg: "日课不可用" };
    }
    const defs = (Daily.DEFS || []).slice();
    let target = null;
    for (const def of defs) {
      if (!d.granted[def.id] && (d.progress[def.id] || 0) < def.target) {
        target = def;
        break;
      }
    }
    if (!target) {
      if (opts && opts.refundOnFail) refundShown("daily_refresh", now);
      return { ok: false, msg: "日课已全部完成", error: "all_done" };
    }
    d.progress[target.id] = target.target;
    Meta.save(meta);
    const res = Daily.applyRunResult(Meta.load(), {});
    Meta.save(res.meta);
    const hit = (res.grants || []).find((g) => g.id === target.id) || (res.grants || [])[0];
    return {
      ok: true,
      id: target.id,
      coins: hit ? hit.coins : 0,
      msg: hit ? hit.msg : `日课·${target.name} 已补全`,
      grants: res.grants || [],
    };
  }

  window.Ads = {
    DAILY_LIMIT,
    MOCK_MS,
    todayKey,
    isPremium,
    canOffer,
    remainingToday,
    markShown,
    refundShown,
    busy,
    offer,
    failCurrent,
    grantSettleDouble,
    grantDailyRefresh,
  };
})();
