/* 玄天劫 · 对局模式表 */
(function () {
  "use strict";
  const MODES = {
    endless: {
      id: "endless",
      name: "天劫无尽",
      short: "无尽",
      desc: "妖潮不绝，冲波次纪录",
      waveInterval: 25,
      maxWave: 0,
      trickle: true,
      canRevive: false,
    },
    quick: {
      id: "quick",
      name: "斩妖令",
      short: "速局",
      desc: "五波清场 · 约 4 分钟",
      waveInterval: 18,
      maxWave: 5,
      trickle: false,
      canRevive: true,
      reviveUsed: false,
    },
  };

  function getMode(id) {
    return MODES[id] || MODES.endless;
  }

  function listModes() {
    return [MODES.quick, MODES.endless];
  }

  /** 速局是否满足胜利条件 */
  function isQuickClear(modeId, wave, enemiesLen, queueLen) {
    if (modeId !== "quick") return false;
    const m = MODES.quick;
    return wave >= m.maxWave && enemiesLen === 0 && queueLen === 0;
  }

  window.MODES = MODES;
  window.getMode = getMode;
  window.listModes = listModes;
  window.isQuickClear = isQuickClear;
})();
