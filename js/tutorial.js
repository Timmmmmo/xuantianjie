/* 玄天劫 · 新手引导（可跳过，写入 meta.tutorialDone） */
(function () {
  "use strict";
  const STEPS = [
    { id: "move", title: "移动", body: "拖动屏幕任意位置，修士随指尖御风而行。" },
    { id: "skill", title: "技能", body: "右下「剑气 / 御风」：爆发清场，或短时加速闪避。" },
    { id: "level", title: "悟道", body: "击杀获得灵力，升级时三选一，形成你的 Build。" },
  ];

  let active = false;
  let index = 0;
  let rootEl = null;
  let bound = false;

  function ensureDom() {
    if (rootEl) return rootEl;
    rootEl = document.getElementById("tutorialOverlay");
    return rootEl;
  }

  function render() {
    const el = ensureDom();
    if (!el) return;
    const step = STEPS[index];
    const total = STEPS.length;
    el.innerHTML = `
      <div class="tut-card">
        <div class="tut-kicker">新手引导 ${index + 1}/${total}</div>
        <h3 class="tut-title">${step.title}</h3>
        <p class="tut-body">${step.body}</p>
        <div class="tut-dots">${STEPS.map((_, i) => `<i class="${i === index ? "on" : i < index ? "done" : ""}"></i>`).join("")}</div>
        <div class="btn-row tut-btns">
          <button type="button" class="btn-ghost" data-tut="skip">跳过</button>
          <button type="button" class="btn-primary" data-tut="next"><span>${index >= total - 1 ? "开始修行" : "明白"}</span></button>
        </div>
      </div>`;
    el.classList.remove("hidden");
  }

  function finish(skipped) {
    active = false;
    const el = ensureDom();
    if (el) {
      el.classList.add("hidden");
      el.innerHTML = "";
    }
    if (window.Meta && Meta.setTutorialDone) Meta.setTutorialDone();
    if (window.Analytics) {
      Analytics.track(skipped ? "tutorial_skip" : "tutorial_done", { step: index + 1 });
    }
  }

  function next() {
    if (!active) return;
    if (window.Analytics) Analytics.track("tutorial_step", { step: index + 1, id: STEPS[index].id });
    if (index >= STEPS.length - 1) {
      finish(false);
      return;
    }
    index += 1;
    render();
  }

  function onOverlayClick(e) {
    if (!active) return;
    const btn = e.target && e.target.closest && e.target.closest("[data-tut]");
    if (!btn) return;
    const act = btn.getAttribute("data-tut");
    if (act === "skip") finish(true);
    else if (act === "next") next();
  }

  /** 若需引导则展示；返回是否弹出 */
  function maybeShow() {
    const el = ensureDom();
    if (!el) return false;
    if (!bound) {
      el.addEventListener("click", onOverlayClick);
      bound = true;
    }
    if (!window.Meta) return false;
    const m = Meta.load();
    if (m.tutorialDone) {
      el.classList.add("hidden");
      return false;
    }
    active = true;
    index = 0;
    render();
    return true;
  }

  function isActive() { return active; }

  window.Tutorial = {
    STEPS,
    maybeShow,
    finish,
    next,
    isActive,
  };
})();
