/* 玄天劫 —— 方环试炼纯逻辑（风雨雷电站桩 / 方形妖流 / 中立破壳 / 188 妖压） */
(function () {
  "use strict";

  const STANCES = [
    {
      id: "wind", name: "风·听风", key: "wind", ultName: "罡风裂天",
      color: "#7dd3fc", priority: "horde",
      basic: { targets: 3, mult: 1.0, eliteMul: 0.8, kind: "pierce" },
      ult: { kind: "sweep", executeFrac: 0.4, mult: 1.2 },
    },
    {
      id: "rain", name: "雨·润物", key: "rain", ultName: "天河倒灌",
      color: "#67e8f9", priority: "fast",
      basic: { targets: 1, mult: 1.1, slow: 0.25, slowT: 1.5, kind: "cone" },
      ult: { kind: "dot", t: 3, slow: 0.2, mult: 0.9, tick: 0.5 },
    },
    {
      id: "thunder", name: "雷·惊蛰", key: "thunder", ultName: "紫霄神雷",
      color: "#c084fc", priority: "elite",
      basic: { targets: 3, mult: 1.15, stunChance: 0.1, stunT: 0.6, kind: "chain" },
      ult: { kind: "bolts", hits: 5, eliteMul: 1.5, mult: 1.3 },
    },
    {
      id: "bolt", name: "电·裂空", key: "bolt", ultName: "太乙霹雳",
      color: "#fbbf24", priority: "armor",
      basic: { targets: 1, mult: 1.4, armorShred: 0.15, kind: "beam" },
      ult: { kind: "line", singleMul: 2.0, mult: 1.5, pierce: 4 },
    },
  ];

  const NEUTRAL = {
    toad: { id: "toad", name: "金蟾", shellHp: 300, reward: "coins", coins: [40, 120] },
    wood: { id: "wood", name: "木精", shellHp: 800, reward: "xp" },
    box: { id: "box", name: "玄匣", shellHp: 1500, reward: "treasure" },
  };

  const PRESSURE_FAIL = 188;
  const PRESSURE_HOLD = 2.0;
  const PRESSURE_WARN1 = 150;
  const PRESSURE_WARN2 = 170;
  const NEUTRAL_MAX = 2;
  const NEUTRAL_CD = 20;
  const TAP_BASE = 25;
  const TAP_ATK = 0.3;
  const BOLT_NEUTRAL_MUL = 2.0;
  const BOLT_ENEMY_MUL = 0.7;
  const SIDE = 420;
  const CORNER_OUT = 24;
  const SPEED0 = 28;
  const SPAWN_EVERY = 1.8;
  const SPAWN_MIN = 3;
  const SPAWN_MAX = 5;
  const COIN_MUL = 0.8;
  const WIN_BONUS = 80;
  const HORDE_CHARGE_CD = 8;
  const ULT_WARN = 0.4;
  const NEUTRAL_SPAWN_CD = 6;
  const PILLAR_INSET = 36;
  const STANCE_BUFF = {
    wind: { id: "wind", name: "疾风", atkSpeed: 1.25, desc: "攻速 +25%" },
    rain: { id: "rain", name: "润物", slowBoost: 0.35, desc: "缓速强化" },
    thunder: { id: "thunder", name: "惊蛰", dmg: 1.2, desc: "伤害 +20%" },
    bolt: { id: "bolt", name: "裂空", single: 1.25, desc: "对单/破壳 ×1.25" },
  };
  const STANCE_IDS = STANCES.map((s) => s.id);

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function rnd(n) { return Math.random() * (n || 1); }
  function rndInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /** 正方形四角（顺时针，中心原点），角点外扩防堆积 */
  function squarePath(cx, cy, side, out) {
    const o = out == null ? CORNER_OUT : out;
    const h = side / 2 + o;
    return [
      { x: cx - h, y: cy - h },
      { x: cx + h, y: cy - h },
      { x: cx + h, y: cy + h },
      { x: cx - h, y: cy + h },
    ];
  }

  /** 攻击区域四角站桩（风西北/雨东北/雷东南/电西南），角内收 */
  function pillarSpots(st) {
    const way = st.way && st.way.length === 4 ? st.way : squarePath(st.cx, st.cy, st.side || SIDE);
    const inset = PILLAR_INSET;
    return way.map((c, i) => {
      const dx = st.cx - c.x;
      const dy = st.cy - c.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = STANCES[i];
      return {
        id: sp.id,
        name: sp.name,
        color: sp.color,
        x: c.x + (dx / d) * inset,
        y: c.y + (dy / d) * inset,
      };
    });
  }

  function stanceBuff(stanceId) {
    return STANCE_BUFF[stanceId] || null;
  }

  /** 沿正方形路径取点：t∈[0,4) 边序 + 边内进度 */
  function pathPoint(way, t, side) {
    const n = way.length;
    const u = ((t % n) + n) % n;
    const i = Math.floor(u);
    const f = u - i;
    const a = way[i];
    const b = way[(i + 1) % n];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, edge: i, f };
  }

  function makeState(opts) {
    const o = opts || {};
    const cx = o.cx || 195;
    const cy = o.cy || 360;
    const side = o.side || SIDE;
    const way = squarePath(cx, cy, side, o.cornerOut);
    const st = {
      stance: "wind",
      onPillar: "wind",
      px: 0,
      py: 0,
      ultCharge: 0,
      enemies: [],
      neutrals: [],
      spawnQueue: [],
      spawnT: 0,
      spawnEvery: SPAWN_EVERY,
      pressureT: 0,
      over: false,
      win: false,
      fail: false,
      time: 0,
      kills: 0,
      coinsRun: 0,
      neutralCd: 0,
      neutralSpawnT: NEUTRAL_SPAWN_CD,
      hordeChargeT: 0,
      ultWarnT: 0,
      ultWarning: false,
      pressurePeak: 0,
      spawnEdge: 0,
      side,
      way,
      cx, cy,
      speedMul: 1,
      tapDmgBase: TAP_BASE,
      atk: o.atk || 10,
    };
    const spots0 = pillarSpots(st);
    st.px = spots0[0].x;
    st.py = spots0[0].y;
    st.onPillar = "wind";
    st.stance = "wind";
    return st;
  }

  function stanceById(id) {
    return STANCES.find((s) => s.id === id) || STANCES[0];
  }

  function setStance(st, id) {
    if (STANCE_IDS.indexOf(id) < 0) return false;
    st.stance = id;
    st.onPillar = id;
    const spots = pillarSpots(st);
    const p = spots.find((x) => x.id === id);
    if (p) { st.px = p.x; st.py = p.y; }
    return true;
  }

  /** 有限刷怪队列：约 3–5 分钟 */
  function buildQueue(wave, rndFn) {
    const r = rndFn || Math.random;
    const total = 40 + Math.floor(wave * 4);
    const q = [];
    for (let i = 0; i < total; i++) {
      const roll = r();
      let kind = "mob";
      if (roll > 0.92) kind = "elite";
      else if (roll > 0.78) kind = "fast";
      else if (roll > 0.68) kind = "horde";
      q.push({ kind, tier: 0 });
    }
    return q;
  }

  function pressureCount(st) {
    let n = 0;
    for (const e of st.enemies) if (e && e.alive && e.kind !== "dummy" && !e.neutral) n++;
    return n;
  }

  function hostiles(st) {
    return st.enemies.filter((e) => e && e.alive && e.kind !== "dummy" && !e.neutral);
  }

  function isSquareClear(st) {
    return !st.spawnQueue.length && hostiles(st).length === 0;
  }

  function spawnFromQueue(st) {
    if (!st.spawnQueue.length) return 0;
    const n = Math.min(st.spawnQueue.length, rndInt(SPAWN_MIN, SPAWN_MAX));
    // 四角轮转出生；一队放完后环速 +2%
    const corner = st.spawnEdge % 4;
    st.spawnEdge++;
    for (let i = 0; i < n; i++) {
      const spec = st.spawnQueue.shift();
      const p = pathPoint(st.way, corner, st.side || SIDE);
      const kind = spec.kind;
      const hp = kind === "elite" ? 90 : kind === "fast" ? 35 : kind === "horde" ? 28 : 40;
      st.enemies.push({
        id: "e" + st.time + "_" + i + "_" + Math.floor(rnd(999)),
        pathT: corner + rnd(0.15),
        speed: (kind === "fast" ? 42 : kind === "elite" ? 22 : SPEED0) * st.speedMul,
        hp, hpMax: hp,
        kind,
        alive: true,
        slowT: 0,
        stunT: 0,
        shred: 0,
        rainDotT: 0,
        x: p.x, y: p.y,
        neutral: false,
      });
    }
    if (!st.spawnQueue.length) st.speedMul *= 1.02;
    return n;
  }

  function tickMove(st, dt) {
    const side = st.side || SIDE;
    for (const e of st.enemies) {
      if (!e.alive || e.neutral) continue;
      if (e.stunT > 0) { e.stunT -= dt; continue; }
      const slow = e.slowT > 0 ? 0.75 : 1;
      if (e.slowT > 0) e.slowT -= dt;
      e.pathT += (e.speed * slow * dt) / (side / 4);
      const p = pathPoint(st.way, e.pathT, side);
      e.x = p.x; e.y = p.y;
    }
  }

  /** 姿态优先级选目标 id 列表；电姿态无条件考虑中立壳 */
  function pickTargets(st, stanceId) {
    const sp = stanceById(stanceId);
    const list = hostiles(st);
    const neutrals = st.neutrals.filter((n) => n.alive);
    if (stanceId === "bolt" && neutrals.length) {
      return neutrals.slice(0, 1).concat(list.slice(0, Math.max(0, (sp.basic.targets || 1) - 1)));
    }
    if (!list.length) {
      return neutrals.slice(0, 1);
    }
    const score = (e) => {
      if (sp.priority === "horde") return e.kind === "horde" ? 3 : e.kind === "mob" ? 2 : 1;
      if (sp.priority === "fast") return e.kind === "fast" ? 3 : e.kind === "mob" ? 2 : 1;
      if (sp.priority === "elite") return e.kind === "elite" ? 3 : 2;
      return e.kind === "elite" ? 2 : 3;
    };
    const sorted = list.slice().sort((a, b) => score(b) - score(a));
    return sorted.slice(0, sp.basic.targets || 1);
  }

  function hitMult(stanceId, target, st) {
    const isNeutral = target && (target.neutral || target.shell != null);
    const isElite = target && target.kind === "elite";
    let m = 1;
    if (stanceId === "bolt") m *= isNeutral ? BOLT_NEUTRAL_MUL : BOLT_ENEMY_MUL;
    if (stanceId === "wind" && isElite) m *= 0.8;
    const buf = st && st.onPillar === stanceId ? stanceBuff(stanceId) : null;
    if (buf && buf.single && !isElite) m *= buf.single;
    return m;
  }

  function applyHit(st, target, dmg, stanceId) {
    if (!target) return 0;
    const m = hitMult(stanceId, target, st);
    const shred = 1 + (target.shred || 0);
    const d = dmg * m * shred;
    const sp = stanceById(stanceId);
    const buf = st && st.onPillar === stanceId ? stanceBuff(stanceId) : null;
    const slow = sp.basic.slow ? Math.min(0.7, sp.basic.slow + (buf && buf.slowBoost ? buf.slowBoost * 0.3 : 0)) : 0;
    if (target.shell != null) {
      target.shell = Math.max(0, target.shell - d);
      if (sp.basic.armorShred) target.shred = (target.shred || 0) + sp.basic.armorShred;
      if (target.shell <= 0) target.alive = false;
      return d;
    }
    target.hp = Math.max(0, target.hp - d);
    if (sp.basic.armorShred) target.shred = (target.shred || 0) + sp.basic.armorShred;
    if (target.hp <= 0) {
      target.alive = false;
      st.kills++;
    } else {
      if (slow) { target.slowT = Math.max(target.slowT, sp.basic.slowT || 1.5); }
      if (sp.basic.stunChance && Math.random() < sp.basic.stunChance) {
        target.stunT = Math.max(target.stunT, sp.basic.stunT || 0.6);
      }
    }
    return d;
  }

  function stanceMul(st) {
    let m = st.stanceMul && st.stanceMul[st.stance];
    m = Number.isFinite(m) && m > 0 ? m : 1;
    const buf = st.onPillar === st.stance ? stanceBuff(st.stance) : null;
    if (buf && buf.dmg) m *= buf.dmg;
    return m;
  }

  function atkSpeedMul(st) {
    const buf = st.onPillar === st.stance ? stanceBuff(st.stance) : null;
    return buf && buf.atkSpeed ? buf.atkSpeed : 1;
  }

  /** 一次自动普攻 */
  function autoAttack(st) {
    const sp = stanceById(st.stance);
    const atk = (st.atk || 10) * stanceMul(st);
    const targets = pickTargets(st, st.stance);
    let dealt = 0;
    for (const t of targets) {
      dealt += applyHit(st, t, atk * sp.basic.mult, st.stance);
    }
    // 充能：伤害 60% 轨
    st.ultCharge = clamp(st.ultCharge + dealt * 0.03, 0, 100);
    return dealt;
  }

  function addUltCharge(st, kind) {
    if (kind === "kill") st.ultCharge = clamp(st.ultCharge + 2.5, 0, 100);
    if (kind === "horde") st.ultCharge = clamp(st.ultCharge + 15, 0, 100);
  }

  function tryAutoUlt(st, dt) {
    if (st.ultCharge < 100) {
      st.ultWarnT = 0;
      st.ultWarning = false;
      return null;
    }
    const step = dt == null ? 1 / 60 : dt;
    st.ultWarnT += step;
    st.ultWarning = true;
    if (st.ultWarnT < ULT_WARN) return { warning: true };
    st.ultWarnT = 0;
    st.ultWarning = false;
    return castUlt(st, 1);
  }

  function castUlt(st, powerScale) {
    if (st.ultCharge < 60) return null;
    const scale = powerScale == null ? st.ultCharge / 100 : powerScale;
    const sp = stanceById(st.stance);
    const atk = (st.atk || 10) * stanceMul(st) * sp.ult.mult * scale;
    let dealt = 0;
    const hs = hostiles(st);
    const ns = st.neutrals.filter((n) => n.alive);
    if (sp.ult.kind === "sweep") {
      for (const e of hs) {
        if (e.hp / e.hpMax <= (sp.ult.executeFrac || 0.4)) dealt += applyHit(st, e, atk * 2, st.stance);
        else dealt += applyHit(st, e, atk, st.stance);
      }
    } else if (sp.ult.kind === "dot") {
      const t = sp.ult.t || 3;
      for (const e of hs) {
        e.slowT = Math.max(e.slowT, t);
        e.rainDotT = Math.max(e.rainDotT || 0, t);
        dealt += applyHit(st, e, atk, st.stance);
      }
    } else if (sp.ult.kind === "bolts") {
      const list = hs.slice().sort((a, b) => (b.kind === "elite") - (a.kind === "elite"));
      for (let i = 0; i < (sp.ult.hits || 5) && i < list.length; i++) {
        const m = list[i].kind === "elite" ? (sp.ult.eliteMul || 1.5) : 1;
        dealt += applyHit(st, list[i], atk * m, st.stance);
      }
    } else if (sp.ult.kind === "line") {
      const pierce = sp.ult.pierce || 4;
      const line = pickTargets(st, st.stance).concat(hs, ns).slice(0, pierce);
      for (let i = 0; i < line.length; i++) {
        const m = i === 0 ? (sp.ult.singleMul || 2) : 1;
        dealt += applyHit(st, line[i], atk * m, st.stance);
      }
    }
    st.ultCharge = 0;
    return { name: sp.ultName, dealt, scale };
  }

  function tapNeutral(st, id) {
    const n = st.neutrals.find((x) => x.id === id && x.alive && x.shell != null);
    if (!n) return { ok: false, reason: "none" };
    const dmg = TAP_BASE + (st.atk || 10) * TAP_ATK;
    const d = applyHit(st, n, dmg, st.stance);
    if (!n.alive) {
      st.neutralCd = NEUTRAL_CD;
      const def = NEUTRAL[n.type] || NEUTRAL.toad;
      let reward = { type: def.reward };
      if (def.reward === "coins") {
        const c = Math.round((def.coins[0] + rnd(def.coins[1] - def.coins[0])) * COIN_MUL);
        reward.coins = c;
        st.coinsRun += c;
      }
      return { ok: true, broke: true, dealt: d, reward };
    }
    return { ok: true, broke: false, dealt: d, shellLeft: n.shell };
  }

  function maybeSpawnNeutral(st) {
    if (st.neutralCd > 0) return null;
    st.neutralSpawnT -= 1 / 60;
    if (st.neutralSpawnT > 0) return null;
    st.neutralSpawnT = NEUTRAL_SPAWN_CD;
    const alive = st.neutrals.filter((n) => n.alive).length;
    if (alive >= NEUTRAL_MAX) return null;
    if (Math.random() > 0.55) return null;
    const types = ["toad", "wood", "box"];
    const type = types[rndInt(0, 2)];
    const def = NEUTRAL[type];
    const n = {
      id: "n" + Math.floor(rnd(99999)),
      type,
      shell: def.shellHp,
      shellMax: def.shellHp,
      alive: true,
      x: st.cx + (rnd(2) - 1) * 80,
      y: st.cy + (rnd(2) - 1) * 80,
      neutral: true,
    };
    st.neutrals.push(n);
    return n;
  }

  /** 主步进；返回事件列表 */
  function tick(st, dt, opts) {
    if (st.over) return [];
    const events = [];
    st.time += dt;
    if (st.neutralCd > 0) st.neutralCd -= dt;

    st.spawnT -= dt;
    if (st.spawnT <= 0 && st.spawnQueue.length) {
      spawnFromQueue(st);
      st.spawnT = st.spawnEvery;
      events.push("spawn");
    }

    tickMove(st, dt);

    // 雨大招 DOT
    for (const e of st.enemies) {
      if (!e.alive || e.neutral || !(e.rainDotT > 0)) continue;
      e.rainDotT -= dt;
      e.hp = Math.max(0, e.hp - (st.atk || 10) * 0.35 * dt);
      if (e.hp <= 0) { e.alive = false; st.kills++; }
    }

    const pressure = pressureCount(st);
    if (pressure > st.pressurePeak) st.pressurePeak = pressure;
    if (pressure >= PRESSURE_FAIL) st.pressureT += dt;
    else st.pressureT = 0;

    if (st.pressureT >= PRESSURE_HOLD) {
      st.over = true;
      st.fail = true;
      events.push("fail_pressure");
      return events;
    }

    if (isSquareClear(st)) {
      st.over = true;
      st.win = true;
      st.coinsRun += WIN_BONUS;
      events.push("win");
      return events;
    }

    // 连杀充能轨
    if (opts && opts.onKillCharge) addUltCharge(st, "kill");
    if (st.hordeChargeT > 0) st.hordeChargeT -= dt;
    if (pressure >= 120 && st.hordeChargeT <= 0) {
      addUltCharge(st, "horde");
      st.hordeChargeT = HORDE_CHARGE_CD;
    }

    maybeSpawnNeutral(st);
    return events;
  }

  function settle(st) {
    return {
      win: !!st.win,
      fail: !!st.fail,
      kills: st.kills,
      coins: Math.round(st.coinsRun),
      time: st.time,
      pressurePeak: st.pressurePeak || pressureCount(st),
      clearSec: st.win ? st.time : null,
    };
  }

  window.SquareLoop = {
    STANCES, NEUTRAL, STANCE_BUFF,
    PRESSURE_FAIL, PRESSURE_HOLD, PRESSURE_WARN1, PRESSURE_WARN2,
    NEUTRAL_MAX, NEUTRAL_CD, TAP_BASE, TAP_ATK,
    BOLT_NEUTRAL_MUL, BOLT_ENEMY_MUL, SIDE, SPEED0, COIN_MUL, WIN_BONUS,
    HORDE_CHARGE_CD, ULT_WARN, PILLAR_INSET,
    STANCE_IDS,
    squarePath, pillarSpots, pathPoint, makeState, stanceById, setStance, buildQueue, stanceMul, atkSpeedMul, stanceBuff,
    pressureCount, hostiles, isSquareClear, spawnFromQueue, tickMove,
    pickTargets, hitMult, applyHit, autoAttack, addUltCharge, tryAutoUlt, castUlt,
    tapNeutral, maybeSpawnNeutral, tick, settle,
  };
})();
