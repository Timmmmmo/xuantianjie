/* 玄天劫 · 本周挑战（M-R 最小包） */
(function () {
  "use strict";
  const REWARD = 120;
  const CHALLENGES = [
    { id: "combo25", name: "连杀入圣", desc: "单局峰值连杀 ≥ 25", target: 25, field: "comboPeak" },
    { id: "wave10", name: "十波不退", desc: "单局波次 ≥ 10", target: 10, field: "wave" },
    { id: "kill80", name: "妖潮收割", desc: "单局击杀 ≥ 80", target: 80, field: "kills" },
  ];

  function pad2(n) { return String(n).padStart(2, "0"); }

  /** 周一为起点的 ISO 周序号与 weekId */
  function weekId(d) {
    const dt = d ? new Date(d) : new Date();
    const x = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const day = (x.getDay() + 6) % 7; // Mon=0
    x.setDate(x.getDate() - day);
    const epoch = new Date(2020, 0, 6); // a Monday
    const weeks = Math.floor((x - epoch) / (7 * 24 * 3600 * 1000));
    return `${x.getFullYear()}-W${pad2(((weeks % 99) + 99) % 99 + 1)}-${Math.floor(weeks / 99)}`;
  }

  function weekIndex(d) {
    const dt = d ? new Date(d) : new Date();
    const x = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const day = (x.getDay() + 6) % 7;
    x.setDate(x.getDate() - day);
    const epoch = new Date(2020, 0, 6);
    return Math.floor((x - epoch) / (7 * 24 * 3600 * 1000));
  }

  function challengeForWeek(idOrDate) {
    let wi;
    if (typeof idOrDate === "number") wi = idOrDate;
    else if (typeof idOrDate === "string" && idOrDate.indexOf("-W") > 0) {
      // weekId 形如 2026-W54-3：解析末段 epoch 周
      const parts = idOrDate.split("-");
      const wnum = Number(parts[1] && parts[1].replace(/^W/i, "")) || 0;
      const cycle = Number(parts[2]) || 0;
      wi = cycle * 99 + (wnum - 1);
    } else if (idOrDate) wi = weekIndex(idOrDate);
    else wi = weekIndex();
    const c = CHALLENGES[((wi % CHALLENGES.length) + CHALLENGES.length) % CHALLENGES.length];
    return { ...c, reward: REWARD };
  }

  function emptyWeekly(now) {
    const ch = challengeForWeek(now);
    return {
      weekId: weekId(now),
      challengeId: ch.id,
      progress: 0,
      target: ch.target,
      completed: false,
      claimed: false,
      history: [],
    };
  }

  function ensureWeek(meta, now) {
    const id = weekId(now);
    const ch = challengeForWeek(now);
    if (!meta.weekly || typeof meta.weekly !== "object") {
      meta.weekly = emptyWeekly(now);
      return meta.weekly;
    }
    if (meta.weekly.weekId !== id) {
      const hist = Array.isArray(meta.weekly.history) ? meta.weekly.history.slice(0, 3) : [];
      hist.unshift({ weekId: meta.weekly.weekId, challengeId: meta.weekly.challengeId, completed: !!meta.weekly.completed });
      meta.weekly = { ...emptyWeekly(now), history: hist.slice(0, 4) };
    } else if (meta.weekly.challengeId !== ch.id) {
      meta.weekly.challengeId = ch.id;
      meta.weekly.target = ch.target;
      meta.weekly.progress = 0;
      meta.weekly.completed = false;
      meta.weekly.claimed = false;
    }
    return meta.weekly;
  }

  function status(meta, now) {
    const m = { ...(meta || {}) };
    const w = ensureWeek(m, now);
    const ch = CHALLENGES.find((c) => c.id === w.challengeId) || challengeForWeek(now);
    return {
      weekId: w.weekId,
      challenge: { ...ch, reward: REWARD },
      progress: Math.min(w.progress || 0, w.target || ch.target),
      target: w.target || ch.target,
      completed: !!w.completed,
      claimed: !!w.claimed,
      canClaim: !!w.completed && !w.claimed,
    };
  }

  function applyRun(meta, run, now) {
    ensureWeek(meta, now);
    const w = meta.weekly;
    const ch = CHALLENGES.find((c) => c.id === w.challengeId) || challengeForWeek(now);
    const key = ch.field;
    const val = Number(run && run[key]) || 0;
    const prev = w.progress || 0;
    const next = Math.max(prev, Math.min(val, ch.target));
    w.progress = next;
    w.target = ch.target;
    const newly = !w.completed && next >= ch.target;
    if (newly) w.completed = true;
    return { meta, progress: next, completed: !!w.completed, newly, challengeId: ch.id };
  }

  function claim(meta, now) {
    ensureWeek(meta, now);
    const w = meta.weekly;
    if (w.claimed) return { ok: false, msg: "本周挑战已领取", meta };
    if (!w.completed) return { ok: false, msg: "挑战尚未完成", meta };
    w.claimed = true;
    meta.coins = (meta.coins || 0) + REWARD;
    const ch = CHALLENGES.find((c) => c.id === w.challengeId);
    return { ok: true, coins: REWARD, msg: `本周挑战·${ch ? ch.name : w.challengeId} +${REWARD}`, meta };
  }

  window.Weekly = { CHALLENGES, REWARD, weekId, weekIndex, challengeForWeek, emptyWeekly, ensureWeek, status, applyRun, claim };
})();
