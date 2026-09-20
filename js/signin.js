/* 玄天劫 · 七日签到（漏签不断档） */
(function () {
  "use strict";
  const REWARDS = [20, 30, 40, 50, 60, 80, 150];

  function todayKey(d) {
    const dt = d || new Date();
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function normalize(meta) {
    if (!meta.signin) meta.signin = { nextDay: 1, lastClaimDate: "", claims: 0 };
    let nd = Number(meta.signin.nextDay) || 1;
    if (nd < 1 || nd > 7) nd = 1;
    meta.signin.nextDay = nd;
    return meta;
  }

  function status(meta, now) {
    const src = meta || {};
    const sig = src.signin || { nextDay: 1, lastClaimDate: "", claims: 0 };
    let nextDay = Number(sig.nextDay) || 1;
    if (nextDay < 1 || nextDay > 7) nextDay = 1;
    const today = todayKey(now);
    const already = sig.lastClaimDate === today;
    const cycle = REWARDS.map((reward, i) => {
      const day = i + 1;
      let state = "future";
      if (day < nextDay) state = "done";
      if (day === nextDay && !already) state = "today";
      return { day, reward, state };
    });
    return {
      canClaim: !already,
      already,
      today,
      nextDay,
      reward: REWARDS[nextDay - 1],
      claims: sig.claims || 0,
      rewards: REWARDS.slice(),
      cycle,
    };
  }

  function claim(meta, now) {
    normalize(meta);
    const today = todayKey(now);
    if (meta.signin.lastClaimDate === today) {
      return { ok: false, msg: "今日已领取，明日再来", meta };
    }
    const day = meta.signin.nextDay;
    const coins = REWARDS[day - 1];
    meta.coins = (meta.coins || 0) + coins;
    meta.signin.lastClaimDate = today;
    meta.signin.claims = (meta.signin.claims || 0) + 1;
    meta.signin.nextDay = day >= 7 ? 1 : day + 1;
    return { ok: true, day, coins, msg: `签到第${day}日 +${coins}灵石`, meta };
  }

  function canClaim(lastClaimDate, now) {
    return lastClaimDate !== todayKey(now);
  }

  function formatSummary(modeName, wave, kills, combo, coins) {
    return `玄天劫·${modeName} 第${wave}波 斩${kills} 连杀${combo} +${coins}灵石`;
  }

  window.Signin = {
    REWARDS,
    todayKey,
    status,
    claim,
    canClaim,
    formatSummary,
  };
})();
