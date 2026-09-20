/* 玄天劫 · 战绩分享卡（Canvas 540×960） */
(function () {
  "use strict";
  const W = 540;
  const H = 960;

  function formatSummary(modeName, wave, kills, combo, coins) {
    return `玄天劫·${modeName} 第${wave}波 斩${kills} 连杀${combo} +${coins}灵石`;
  }

  function drawCard(data) {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const x = c.getContext("2d");
    const modeName = data.modeName || "天劫无尽";
    const wave = data.wave || 0;
    const kills = data.kills || 0;
    const timeText = data.timeText || "0:00";
    const combo = data.combo || 0;
    const level = data.level || 1;
    const coins = data.coins || 0;
    const charName = data.charName || "修士";
    const realm = data.realm || "炼气";
    const win = !!data.win;

    const bg = x.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#070b12");
    bg.addColorStop(0.45, "#0c1520");
    bg.addColorStop(1, "#0a1820");
    x.fillStyle = bg;
    x.fillRect(0, 0, W, H);

    // decorative rings
    x.save();
    x.strokeStyle = "rgba(92,225,230,0.18)";
    x.lineWidth = 2;
    x.beginPath(); x.arc(W / 2, 210, 130, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = "rgba(240,193,75,0.22)";
    x.beginPath(); x.arc(W / 2, 210, 150, 0, Math.PI * 2); x.stroke();
    x.restore();

    x.textAlign = "center";
    x.fillStyle = "#a5f3fc";
    x.font = "600 18px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    x.fillText("无尽妖潮 · 修真幸存", W / 2, 78);

    x.fillStyle = "#f8fafc";
    x.font = "800 64px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    x.shadowColor = "rgba(92,225,230,0.45)";
    x.shadowBlur = 24;
    x.fillText("玄天劫", W / 2, 150);
    x.shadowBlur = 0;

    x.fillStyle = win ? "#fde68a" : "#e8e6d9";
    x.font = "700 34px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    x.fillText(win ? "斩妖功成" : "道消形散", W / 2, 220);

    x.fillStyle = "#8a9bb0";
    x.font = "400 20px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    x.fillText(`${modeName} · ${charName} · ${realm}境`, W / 2, 268);

    const rows = [
      ["撑过波次", String(wave)],
      ["斩妖数", String(kills)],
      ["存活", timeText],
      ["峰值连杀", String(combo)],
      ["境界等级", String(level)],
      ["获得灵石", "+" + coins],
    ];
    const top = 340;
    const rowH = 72;
    for (let i = 0; i < rows.length; i++) {
      const y = top + i * rowH;
      x.fillStyle = i === rows.length - 1 ? "rgba(48,36,10,0.55)" : "rgba(16,28,40,0.72)";
      x.strokeStyle = i === rows.length - 1 ? "rgba(240,193,75,0.45)" : "rgba(92,225,230,0.22)";
      roundRect(x, 48, y - 36, W - 96, 64, 12);
      x.fill();
      x.stroke();
      x.textAlign = "left";
      x.fillStyle = "#8a9bb0";
      x.font = "400 20px 'Segoe UI', 'Microsoft YaHei', sans-serif";
      x.fillText(rows[i][0], 76, y + 2);
      x.textAlign = "right";
      x.fillStyle = i === rows.length - 1 ? "#f0c14b" : "#e8e6d9";
      x.font = "700 28px 'Segoe UI', 'Microsoft YaHei', sans-serif";
      x.fillText(rows[i][1], W - 76, y + 4);
    }

    x.textAlign = "center";
    x.fillStyle = "rgba(232,230,217,0.55)";
    x.font = "400 16px 'Segoe UI', 'Microsoft YaHei', sans-serif";
    x.fillText("timmmmmo.github.io/xuantianjie", W / 2, H - 42);

    return c;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => {
      if (canvas.toBlob) canvas.toBlob((b) => resolve(b), "image/png");
      else {
        try {
          const dataUrl = canvas.toDataURL("image/png");
          const bin = atob(dataUrl.split(",")[1]);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          resolve(new Blob([arr], { type: "image/png" }));
        } catch (_) { resolve(null); }
      }
    });
  }

  async function share(data) {
    const summary = formatSummary(
      data.modeName || "无尽",
      data.wave || 0,
      data.kills || 0,
      data.combo || 0,
      data.coins || 0
    );
    const canvas = drawCard(data);
    let shared = false;
    let downloaded = false;
    let cancelled = false;
    try {
      const blob = await canvasToBlob(canvas);
      if (blob && typeof File !== "undefined" && navigator.share) {
        const file = new File([blob], "xuantianjie-result.png", { type: "image/png" });
        const payload = { files: [file], title: "玄天劫战绩", text: summary };
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share(payload);
            shared = true;
          } catch (err) {
            // 用户取消分享：不再自动下载
            if (err && (err.name === "AbortError" || err.name === "NotAllowedError")) cancelled = true;
          }
        }
      }
    } catch (_) { shared = false; }

    if (!shared && !cancelled) {
      try {
        const url = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = url;
        a.download = "玄天劫-战绩.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        downloaded = true;
      } catch (_) { downloaded = false; }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
      }
    } catch (_) {}

    return { summary, shared, downloaded, cancelled };
  }

  window.ShareCard = {
    W,
    H,
    formatSummary,
    drawCard,
    share,
  };
})();
