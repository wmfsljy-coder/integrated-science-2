/* 통합과학2 Ⅰ-1 지구 환경 변화와 생물다양성 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 표준화석으로 나이 좁히기 */
  {
    id: "c1", about: "01", tag: "지질시대 · 표준화석", title: "화석 세 개로 지층 나이 좁히기", short: "화석 세 개",
    who: "⛏️", name: "지질 조사원",
    say: "“도로 공사장 절벽의 한 층에서 <b>삼엽충, 필석, 암모나이트</b> 화석이 함께 나왔어요. 방사성 연대를 잴 화산재 층은 없습니다. 화석만으로 이 층이 쌓인 때를 <b>최대한 좁혀</b> 보고서에 적어야 해요.”",
    predict: {
      q: "세 화석이 한 지층에서 함께 나왔습니다. 이 지층이 쌓인 때는?",
      options: ["㉠ 셋 중 가장 오래 살았던 화석의 생존 기간 어디든", "㉡ 셋의 생존 기간이 모두 겹치는 기간 안", "㉢ 셋 중 가장 먼저 나타난 화석이 처음 나타난 때"],
      answer: 1
    },
    task: "두 슬라이더로 <b>이 층이 쌓였을 수 있는 기간</b>의 시작(오래된 쪽)과 끝(젊은 쪽)을 정하세요. 가능한 기간을 빠짐없이, 그러나 가장 좁게 잡아야 합니다(양 끝 각각 ±1000만 년까지 인정).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var FOS = [
        { n: "삼엽충", a: 520, b: 250, c: "--brand" },
        { n: "필석", a: 500, b: 320, c: "--violet" },
        { n: "암모나이트", a: 410, b: 66, c: "--amber" }
      ];
      var ERA = [[541, 252, "고생대", "--teal"], [252, 66, "중생대", "--green"], [66, 0, "신생대", "--coral"]];
      var old = 540, young = 0;
      var x0 = 60, x1 = 840;
      function X(ma) { return x0 + (560 - ma) / 560 * (x1 - x0); }
      var FC = { "--brand": "#4c6ef5", "--violet": "#7048e8", "--amber": "#f59f00", "--teal": "#20c997", "--green": "#51cf66", "--coral": "#ff8a80" };
      x0 = 300; x1 = 860;
      function fossil(kind, x, y, s) {                         /* 암석에 박힌 화석 미니어처 */
        ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
        if (kind === 0) {                                     /* 삼엽충: 머리·가슴 마디·꼬리 */
          var g = ctx.createRadialGradient(-3, -6, 1, 0, 0, 16); g.addColorStop(0, "#d0bfa0"); g.addColorStop(1, "#6b5a45");
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 10, 15, 0, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = "rgba(50,35,20,.6)"; ctx.lineWidth = 1; for (var k = -2; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(-9, k * 3.6); ctx.lineTo(9, k * 3.6); ctx.stroke(); }
          ctx.beginPath(); ctx.moveTo(-3, -14); ctx.lineTo(-3, 13); ctx.moveTo(3, -14); ctx.lineTo(3, 13); ctx.stroke();
        } else if (kind === 1) {                              /* 필석: 톱니 달린 가는 가지 */
          ctx.strokeStyle = "#3d3a36"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 8); ctx.lineTo(14, -8); ctx.stroke();
          for (var t = 0; t < 7; t++) { var px = -12 + t * 4, py = 7 - t * 2.3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 1.5, py - 4); ctx.stroke(); }
        } else {                                              /* 암모나이트: 감긴 껍데기 */
          var g2 = ctx.createRadialGradient(-4, -4, 1, 0, 0, 14); g2.addColorStop(0, "#f1d9a8"); g2.addColorStop(1, "#9c6b2f");
          ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(0, 0, 13, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = "rgba(80,50,20,.7)"; ctx.lineWidth = 1.2; ctx.beginPath();
          for (var a = 0; a < 14; a += .2) { var r = 12 * Math.exp(-a * .17); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
          for (var q = 0; q < 12; q++) { var aa = q * .52; ctx.beginPath(); ctx.moveTo(Math.cos(aa) * 7, Math.sin(aa) * 7); ctx.lineTo(Math.cos(aa) * 12.5, Math.sin(aa) * 12.5); ctx.stroke(); }
        }
        ctx.restore();
      }
      var BI = window.sthKit.iso({ ox: 120, oy: 120, s: 0.9, L: 140, D: 110 });
      function draw() {
        H.paper(ctx, W, cv.H);
        var K = window.sthKit, LTc = K.LT, I = BI, lo = Math.min(old, young), hi = Math.max(old, young);
        var ok = hi >= 400 && hi <= 420 && lo >= 310 && lo <= 330;
        /* 왼쪽: 화석이 함께 나온 지층 블록 */
        ctx.fillStyle = "rgba(20,30,50,.18)"; ctx.beginPath(); ctx.ellipse(I.P(70, 55, 0).x + 8, I.P(140, 110, 0).y - 20, 120, 18, 0, 0, 6.2832); ctx.fill();
        var LAY = [["#c9b48f", 0, 40], ["#8d8f94", 40, 70], ["#d8c79e", 70, 110]];
        ["front", "right"].forEach(function (sd) {
          I.face(ctx, sd, function (Lw) {
            LAY.forEach(function (ly, k) { var g = ctx.createLinearGradient(0, ly[1], 0, ly[2]); g.addColorStop(0, K.tint(ly[0], .85)); g.addColorStop(1, ly[0]); ctx.fillStyle = g; ctx.fillRect(0, ly[1], Lw, ly[2] - ly[1]); });
            ctx.strokeStyle = "rgba(60,45,25,.35)"; ctx.lineWidth = 1; [40, 70].forEach(function (z) { ctx.beginPath(); ctx.moveTo(0, z); ctx.lineTo(Lw, z); ctx.stroke(); });
          });
          I.shade(ctx, sd, function () { return 110; });
        });
        I.plane(ctx, 110, "#e2d3ad", "rgba(255,255,255,.6)");
        I.edges(ctx, 110, 110);
        [[0, 30, 30], [1, 90, 70], [2, 60, 95]].forEach(function (f) { var p = I.P(f[1], f[2], 110); fossil(f[0], p.x, p.y, .9); });
        K.t(ctx, "세 화석이 같은 층에서 나왔다", 140, 312, { s: 12, w: "900", a: "center", c: LTc.ink });
        /* 오른쪽: 생존 기간 막대(입체) */
        K.t(ctx, "생존 기간 (백만 년 전 · 왼쪽이 오래된 때)", x0, 26, { s: 13, w: "900", c: LTc.ink });
        ERA.forEach(function (e) {
          var c = FC[e[3]], a = X(e[0]), b = X(e[1]);
          ctx.fillStyle = K.tint(c, 1.15); ctx.fillRect(a, 40, b - a, 22);
          K.t(ctx, e[2], (a + b) / 2, 56, { s: 12, w: "900", a: "center", c: K.tint(c, .5) });
        });
        ctx.fillStyle = "rgba(240,62,122,.12)"; ctx.fillRect(X(hi), 70, X(lo) - X(hi), 180);
        FOS.forEach(function (f, i) {
          var y = 96 + i * 52, c = FC[f.c], a = X(f.a), b = X(f.b), dz = 6;
          fossil(i, x0 - 16, y + 6, .55);
          K.t(ctx, f.n, a, y - 8, { s: 12, w: "900", c: K.tint(c, .7) });
          ctx.fillStyle = K.tint(c, 1.3); ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(a + dz, y - dz * .8); ctx.lineTo(b + dz, y - dz * .8); ctx.lineTo(b, y); ctx.closePath(); ctx.fill();
          ctx.fillStyle = K.tint(c, .7); ctx.beginPath(); ctx.moveTo(b, y); ctx.lineTo(b + dz, y - dz * .8); ctx.lineTo(b + dz, y + 16 - dz * .8); ctx.lineTo(b, y + 16); ctx.closePath(); ctx.fill();
          ctx.fillStyle = c; ctx.fillRect(a, y, b - a, 16);
          K.t(ctx, f.a + " ~ " + f.b, b + 12, y + 13, { s: 11, w: "700", c: LTc.mute });
        });
        ctx.strokeStyle = "#c2255c"; ctx.lineWidth = 2; [hi, lo].forEach(function (m) { ctx.beginPath(); ctx.moveTo(X(m), 70); ctx.lineTo(X(m), 252); ctx.stroke(); });
        ctx.strokeStyle = LTc.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, 252); ctx.lineTo(x1, 252); ctx.stroke();
        [500, 400, 300, 200, 100, 0].forEach(function (m) { K.t(ctx, m + "", X(m), 270, { s: 10.5, a: "center", c: LTc.mute }); });
        K.card(ctx, x0 - 6, 282, x1 - x0 + 30, 40, null);
        K.t(ctx, "보고서에 적을 기간:  " + hi + " ~ " + lo + " 백만 년 전  (폭 " + (hi - lo) + " 백만 년)", x0 + 8, 308, { s: 13.5, w: "900", c: ok ? LTc.green : LTc.ink });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "기간의 시작 (오래된 쪽)", min: 0, max: 560, step: 10, value: 540, fmt: function (x) { return x + " 백만 년 전"; },
        onInput: function (x) { old = x; draw(); } });
      api.slider({ label: "기간의 끝 (젊은 쪽)", min: 0, max: 560, step: 10, value: 0, fmt: function (x) { return x + " 백만 년 전"; },
        onInput: function (x) { young = x; draw(); } });
      api.info("분홍 띠가 여러분이 고른 기간입니다. 그 기간 <b>어느 때든</b> 세 생물이 모두 살아 있었어야 이 층에 함께 묻힐 수 있습니다. ※ 생존 기간은 수업용으로 어림한 값입니다.");
      draw();
      return {
        judge: function () {
          var lo = Math.min(old, young), hi = Math.max(old, young);
          var okHi = hi >= 400 && hi <= 420, okLo = lo >= 310 && lo <= 330;
          if (okHi && okLo) return { ok: true, msg: hi + " ~ " + lo + " 백만 년 전 — 고생대 데본기에서 석탄기 초까지로 좁혔습니다." };
          if (hi > 420) return { ok: false, msg: "시작이 너무 오래되었습니다. 그때 세 화석 가운데 아직 나타나지 않은 것이 있습니다." };
          if (hi < 400) return { ok: false, msg: "시작을 너무 늦게 잡았습니다. 셋이 함께 살던 때가 더 이른 시기에도 있었습니다." };
          if (lo < 310) return { ok: false, msg: "끝이 너무 젊습니다. 그때는 세 화석 가운데 이미 사라진 것이 있습니다." };
          return { ok: false, msg: "끝을 너무 이르게 잡았습니다. 셋이 함께 살던 때가 더 뒤에도 있었습니다." };
        }
      };
    },
    hints: [
      "지층에 화석이 묻히려면 그 순간 <b>세 생물이 모두 살아 있어야</b> 합니다. 한 화석이라도 아직 나타나지 않았거나 이미 멸종했다면 안 됩니다.",
      "셋 중 <b>가장 늦게 나타난</b> 것이 기간의 시작, <b>가장 먼저 사라진</b> 것이 기간의 끝을 정합니다."
    ],
    solution: "시작은 암모나이트가 나타난 <b>410</b>, 끝은 필석이 사라진 <b>320</b> 백만 년 전입니다. 두 슬라이더를 410과 320에 두세요.",
    why: "여러 화석이 함께 나오면 그 층의 나이는 <b>생존 기간이 모두 겹치는 구간</b>으로 좁혀집니다. 삼엽충 하나만으로는 2억 7천만 년이나 되는 폭이었지만, 셋을 겹치니 9천만 년으로 줄었습니다.<br>" +
      "그래서 <b>생존 기간이 짧고 넓은 지역에 퍼져 살았던 생물</b>의 화석일수록 좋은 표준화석이 됩니다. 점토층 이야기에서 대멸종의 경계를 짚을 수 있었던 것도, 경계 아래위로 나오는 화석이 뚜렷이 달랐기 때문입니다.<br>※ 암모나이트 무리는 고생대 데본기에 처음 나타났지만, 크게 번성하고 널리 퍼진 때는 중생대여서 <b>중생대 표준 화석</b>으로 씁니다."
  },

  /* ------------------------------------------------------------------ 2. 자연선택 거꾸로 */
  {
    id: "c2", about: "02", tag: "자연선택", title: "공기가 맑아진 도시의 나방", short: "나방",
    who: "🦋", name: "도시 환경 연구소",
    say: "“공장 그을음으로 나무껍질이 검게 변한 뒤, 이 도시 나방은 <b>95%가 검은색</b>이 되었어요. 이제 굴뚝 규제로 그을음을 줄이려 합니다. 목표는 <b>50세대 뒤 흰 나방이 다시 절반 이상</b>. 다만 예산으로는 그을음을 <b>35%</b> 아래로는 줄일 수 없어요.”",
    predict: {
      q: "공기가 깨끗해져 나무껍질이 밝아지면, 검은 나방들에게 일어나는 일은?",
      options: ["㉠ 검은 나방 한 마리 한 마리가 점점 흰색으로 바뀐다", "㉡ 흰 나방이 새에게 덜 잡아먹혀 자손을 더 남기면서, 세대가 지날수록 비율이 바뀐다", "㉢ 이미 검은색이 된 집단이라 다시 바뀌지 않는다"],
      answer: 1
    },
    task: "그을음 정도를 정해 <b>50세대 뒤 흰 나방이 50% 이상</b>이 되게 하세요. 그을음은 35% 이상이어야 합니다(예산 한계). ▶ 로 세대를 돌려 볼 수 있어요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(360), ctx = cv.ctx, W = cv.W;
      var soot = 90, shown = 50;
      var run = api.ticker();
      function surv(x) { var k = x / 100; return { L: 1 - 0.4 * k, D: 1 - 0.4 * (1 - k) }; }
      function series(x) {
        var s = surv(x), p = 0.05, out = [p];
        for (var g = 1; g <= 50; g++) { p = p * s.L / (p * s.L + (1 - p) * s.D); out.push(p); }
        return out;
      }
      var gx0 = 70, gx1 = 560, gy0 = 60, gy1 = 280;
      function GX(g) { return gx0 + g / 50 * (gx1 - gx0); }
      function GY(p) { return gy1 - p * (gy1 - gy0); }
      var MR = (function () { var a = [], s = 17; for (var i = 0; i < 24; i++) { s = s * 16807 % 2147483647; var r1 = s / 2147483647; s = s * 16807 % 2147483647; a.push([r1, s / 2147483647]); } return a; })();
      function moth(x, y, white, sc) {                         /* 나무껍질 위의 나방(날개를 편 옆모습) */
        ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
        ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(2, 2, 9, 5, 0, 0, 6.2832); ctx.fill();
        var g = ctx.createLinearGradient(-9, 0, 9, 0); g.addColorStop(0, white ? "#f1f3f5" : "#343a40"); g.addColorStop(.5, white ? "#ffffff" : "#495057"); g.addColorStop(1, white ? "#dee2e6" : "#212529");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(-10, -6); ctx.lineTo(-8, 5); ctx.lineTo(0, 3); ctx.lineTo(8, 5); ctx.lineTo(10, -6); ctx.closePath(); ctx.fill();
        if (white) { ctx.fillStyle = "rgba(60,60,60,.5)"; [[-5, -1], [5, 0], [-3, 2], [4, -3]].forEach(function (q) { ctx.fillRect(q[0], q[1], 1.4, 1.4); }); }
        ctx.fillStyle = white ? "#adb5bd" : "#111"; ctx.fillRect(-1, -4, 2, 8);
        ctx.restore();
      }
      function mix(a, b, t) { var p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), o = [16, 8, 0].map(function (sh) { var u = (p >> sh) & 255, w = (q >> sh) & 255; return Math.round(u + (w - u) * t); }); return "rgb(" + o.join(",") + ")"; }
      function draw() {
        var K = window.sthKit, LTc = K.LT, ser = series(soot), s = surv(soot), pW = ser[shown], LW = 560, i;
        ctx.clearRect(0, 0, W, cv.H);
        var I = K.iso({ ox: 250, oy: 172, s: 0.72, L: 300, D: 160 }), FZ = 16, fl = I.P(I.L, I.D, 0);
        K.studio(ctx, 0, 0, LW, cv.H, { x: fl.x - 100, y: fl.y - 30, rx: 250, ry: 28 });
        var bark = Math.round(225 - soot * 1.7);
        function barkC(k) { return "rgb(" + Math.round(bark * k) + "," + Math.round((bark - 8) * k) + "," + Math.round(Math.max(0, bark - 20) * k) + ")"; }
        /* 숲 땅 블록: 그을음이 많을수록 풀빛이 잿빛으로 */
        var gk = soot / 100;
        ["front", "right"].forEach(function (sd) {
          I.face(ctx, sd, function (Lw) {
            var g = ctx.createLinearGradient(0, 0, 0, FZ); g.addColorStop(0, "#5a3d28"); g.addColorStop(1, "#7a5236");
            ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, FZ); ctx.fillStyle = mix("#5f9e2f", "#55585c", gk); ctx.fillRect(0, FZ - 3, Lw, 3);
          });
          I.shade(ctx, sd, function () { return FZ; });
        });
        var a0 = I.P(0, 0, FZ), c0 = I.P(I.L, I.D, FZ), tg = ctx.createLinearGradient(a0.x, a0.y, c0.x, c0.y);
        tg.addColorStop(0, mix("#a8d86a", "#8d9196", gk)); tg.addColorStop(1, mix("#6fae3a", "#5e6268", gk));
        I.plane(ctx, FZ, tg, "rgba(255,255,255,.5)");
        /* 공장 굴뚝과 연기 */
        I.box(ctx, 230, 6, FZ, 296, 46, FZ + 40, "#c9ced6", "#a5adb8", "#7f8894");
        I.box(ctx, 262, 14, FZ + 40, 278, 30, FZ + 150, "#b7795a", "#9a5f45", "#7a4632");
        var ch = I.P(270, 22, FZ + 150);
        for (i = 0; i < 7; i++) { var sk = i / 6, r0 = 9 + i * 5; ctx.fillStyle = "rgba(" + Math.round(150 - 110 * gk) + "," + Math.round(150 - 110 * gk) + "," + Math.round(155 - 110 * gk) + "," + (0.12 + 0.55 * gk) * (1 - sk * .6) + ")"; ctx.beginPath(); ctx.arc(ch.x + 4 + i * 13, ch.y - 8 - i * 12, r0, 0, 6.2832); ctx.fill(); }
        /* 뒤쪽 나무들(껍질 색 = 그을음) */
        function trunk(x, y, w, h, k0) {
          var bg = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
          bg.addColorStop(0, barkC(.6 * k0)); bg.addColorStop(.4, barkC(1 * k0)); bg.addColorStop(1, barkC(.5 * k0));
          ctx.fillStyle = "rgba(20,30,50,.2)"; ctx.beginPath(); ctx.ellipse(x + w * .5, y + 2, w * .9, w * .25, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = bg; ctx.fillRect(x - w / 2, y - h, w, h); ctx.beginPath(); ctx.ellipse(x, y, w / 2, w * .18, 0, 0, Math.PI); ctx.fill();
          ctx.strokeStyle = "rgba(0,0,0,.16)"; ctx.lineWidth = 1; for (var b = 0; b < w / 7; b++) { var bx = x - w / 2 + 4 + b * 7; ctx.beginPath(); ctx.moveTo(bx, y - h + 4); ctx.bezierCurveTo(bx - 3, y - h * .6, bx + 3, y - h * .3, bx, y - 3); ctx.stroke(); }
        }
        [[40, 30, 16, 120], [120, 20, 18, 132], [30, 110, 18, 112], [110, 90, 20, 124]].forEach(function (t0) { var p = I.P(t0[0], t0[1], FZ); trunk(p.x, p.y, t0[2], t0[3], .95); });
        /* 앞쪽 큰 줄기 — 나방 16마리 표본이 앉아 있다(흰 나방 비율 = 지금 세대의 비율) */
        var tp = I.P(220, 124, FZ), tx = tp.x, tw = 78;
        trunk(tx, tp.y, tw, tp.y - 22, 1);
        var nW = Math.round(pW * 16);
        for (var m = 0; m < 16; m++) moth(tx - 24 + MR[m][0] * 48, 44 + m * 14 + MR[m][1] * 5, m < nW, 1.2);
        /* 나방을 노리는 새 */
        var bd = { x: tx + 160, y: 200 };
        ctx.fillStyle = "#3d3a36"; ctx.beginPath(); ctx.ellipse(bd.x, bd.y, 15, 8, -.2, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.arc(bd.x - 13, bd.y - 5, 6, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "#e8a33d"; ctx.beginPath(); ctx.moveTo(bd.x - 18, bd.y - 6); ctx.lineTo(bd.x - 26, bd.y - 3); ctx.lineTo(bd.x - 18, bd.y - 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#57534e"; ctx.beginPath(); ctx.moveTo(bd.x - 2, bd.y - 4); ctx.lineTo(bd.x + 12, bd.y - 22); ctx.lineTo(bd.x + 10, bd.y - 2); ctx.closePath(); ctx.fill();
        K.pill(ctx, "눈에 띄는 나방부터 잡힘", bd.x - 2, bd.y + 30, { s: 12, a: "center", c: LTc.ink, bg: "rgba(255,255,255,.92)", line: "rgba(20,40,90,.18)", box: [0, LW] });
        K.pill(ctx, "껍질 밝기 " + Math.round(bark / 225 * 100) + "%", tx, tp.y + 26, { s: 12, a: "center", c: LTc.ink, bg: "rgba(255,255,255,.92)", line: "rgba(20,40,90,.18)", box: [0, LW] });
        K.bigText(ctx, shown + "세대 뒤 흰 나방 " + (pW * 100).toFixed(1) + "%", 18, 34, 21, pW >= .5 ? "#8ff0c8" : "#ffffff");
        K.t(ctx, "줄기 위 나방 16마리 = 집단 표본", 18, 58, { s: 12, w: "700", c: LTc.mute });
        K.t(ctx, "한 마리의 색은 바뀌지 않습니다", 18, cv.H - 14, { s: 12, w: "700", c: LTc.mute });
        /* 오른쪽 흰 카드: 작은 그래프 + 생존율 */
        var p0 = 590, p1 = 868;
        K.card(ctx, 572, 14, 314, cv.H - 28, "그을음 " + soot + "% · 흰 나방 비율");
        var g = K.chart(ctx, { x: 576, y: 44, w: 306, h: 132, pl: 44, pb: 28, pt: 8, pr: 12, x0: 0, x1: 50, y0: 0, y1: 1, xt: 5, yt: 2, light: true, yf: function (q) { return Math.round(q * 100) + "%"; } });
        K.line(ctx, { x: g.L, y: g.Y(.5) }, { x: g.R, y: g.Y(.5) }, LTc.green, 1.4, [5, 4]);
        var pts = []; for (var gg = 0; gg <= shown; gg++) pts.push([gg, ser[gg]]);
        K.plot(ctx, g, pts, LTc.blue, { light: true, w: 2.6 });
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.X(shown), g.Y(pW), 6, 0, 6.2832); ctx.fill();
        ctx.fillStyle = LTc.blue; ctx.beginPath(); ctx.arc(g.X(shown), g.Y(pW), 4, 0, 6.2832); ctx.fill();
        K.t(ctx, "세대", g.R, g.B + 26, { s: 11, w: "700", a: "right", c: LTc.mute });
        K.row(ctx, "흰 나방 생존율", (s.L * 100).toFixed(0) + "%", p0, p1, 214, LTc.blue);
        K.bar(ctx, p0, 222, p1 - p0, s.L, LTc.blue);
        K.row(ctx, "검은 나방 생존율", (s.D * 100).toFixed(0) + "%", p0, p1, 254);
        K.bar(ctx, p0, 262, p1 - p0, s.D, "#495057");
        K.row(ctx, shown + "세대 뒤 흰 나방", (pW * 100).toFixed(1) + "%", p0, p1, 294, pW >= .5 ? LTc.green : LTc.red);
        K.tip(ctx, pW >= .5 ? "흰 나방이 절반을 넘었습니다" : "아직 절반이 안 됩니다", p0 - 4, 302, p1 - p0 + 8, pW >= .5);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "그을음 정도", min: 0, max: 100, step: 1, value: 90, fmt: function (x) { return x + "%"; },
        onInput: function (x) { soot = x; shown = 50; draw(); } });
      api.button("▶ 50세대 돌려 보기", function () { run(50, 45, function (k) { shown = Math.round(k * 50); draw(); }); });
      api.info("그을음이 많을수록 나무껍질이 어두워져 <b>흰 나방이 새 눈에 잘 띕니다</b>. 한 세대 안에서 나방 색은 바뀌지 않습니다. 살아남은 쪽이 자손을 남길 뿐입니다.");
      draw();
      return {
        judge: function () {
          var p = series(soot)[50];
          if (soot < 35) return { ok: false, msg: "그을음 " + soot + "% — 예산으로는 35% 아래까지 줄일 수 없습니다." };
          if (p >= 0.5) return { ok: true, msg: "그을음 " + soot + "% · 50세대 뒤 흰 나방 " + (p * 100).toFixed(1) + "% — 흰 나방이 살아남기 유리해지니 비율이 되돌아왔습니다." };
          return { ok: false, msg: "50세대 뒤 흰 나방 " + (p * 100).toFixed(1) + "% — 아직 절반이 안 됩니다." };
        }
      };
    },
    hints: [
      "그을음이 50%보다 많으면 여전히 <b>검은 나방이 유리</b>합니다. 흰 나방이 늘려면 적어도 흰 쪽이 더 잘 살아남는 환경이어야 합니다.",
      "흰 나방이 조금만 유리해도 50세대 동안 쌓이면 큰 차이가 됩니다. 그을음을 40% 안팎으로 옮기며 그래프 끝을 보세요."
    ],
    solution: "그을음을 <b>35~44%</b>로 두세요. 44%에서 흰 나방이 한 세대에 약 6% 더 잘 살아남고, 그 차이가 50세대 쌓여 절반을 넘깁니다.",
    why: "변하는 것은 나방 한 마리가 아니라 <b>집단 속 비율</b>입니다. 환경(나무껍질 색)에 따라 <b>살아남아 자손을 남기는 정도</b>가 달라지고, 그 작은 차이가 세대마다 곱해져 집단의 모습이 바뀝니다 — 이것이 <b>자연선택</b>입니다.<br>" +
      "가뭄 뒤 부리가 큰 핀치가 늘어난 것과 같은 원리입니다. 그리고 환경이 되돌아가면 선택의 방향도 되돌아갑니다. 실제로 영국 맨체스터에서는 대기 정화법 이후 수십 년에 걸쳐 흰 나방이 다시 늘었습니다. " +
      "※ 생존율 공식은 수업용 모형입니다."
  },

  /* ------------------------------------------------------------------ 3. 종-면적 관계와 가장자리 효과 */
  {
    id: "c3", about: "03", tag: "생물다양성 보전", title: "숲 보호구역 설계", short: "보호구역",
    who: "🌲", name: "국립공원 설계팀",
    say: "“이 숲에는 숲 속 깊은 곳에만 사는 종이 많아요. 조사해 보니 <b>50종 이상</b>이 함께 살 수 있어야 먹이그물이 유지됩니다. 땅은 <b>800 km²</b>까지 살 수 있고, 가운데로 도로를 내면 관광객이 늘어 좋다는 의견도 있어요.”",
    predict: {
      q: "보호구역 넓이를 두 배로 늘리면, 그 안에 살 수 있는 종의 수는?",
      options: ["㉠ 두 배가 된다", "㉡ 늘지만 두 배보다는 적게 는다", "㉢ 변하지 않는다"],
      answer: 1
    },
    task: "모양과 넓이를 정해 <b>800 km² 이하에서 50종 이상</b>이 살 수 있게 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var A = 300, shape = "one";
      function inner(a, sh) {
        if (sh === "one") { var s = Math.max(0, Math.sqrt(a) - 2); return s * s; }
        var q = Math.max(0, Math.sqrt(a / 4) - 2); return 4 * q * q;
      }
      function species(a, sh) { return 10 * Math.pow(inner(a, sh), 0.25); }
      var RI = window.sthKit.iso({ ox: 180, oy: 74, s: 0.62, L: 240, D: 240 }), RZ = 18;
      function draw() {
        H.paper(ctx, W, cv.H);
        var K = window.sthKit, LTc = K.LT, I = RI, ia = inner(A, shape), S = species(A, shape);
        /* 땅 블록(둘레는 농경지) */
        ctx.fillStyle = "rgba(20,30,50,.18)"; ctx.beginPath(); ctx.ellipse(I.P(240, 240, 0).x, I.P(240, 240, 0).y - 30, 160, 26, 0, 0, 6.2832); ctx.fill();
        I.box(ctx, 0, 0, 0, I.L, I.D, RZ, "#d8e3a6", "#8d6e4f", "#6f5640");
        var u = 240 / Math.sqrt(1500), side = Math.sqrt(A) * u, e = u, c0 = 120;
        function piece(x, y, s) {
          I.box(ctx, x, y, RZ, x + s, y + s, RZ + 4, "#8ce99a", "#2f9e44", "#2b8a3e");
          if (s > 2 * e) {
            I.plane(ctx, RZ + 4.2, "#2b8a3e", null, x + e, x + s - e, y + e, y + s - e);
            var nT = Math.min(14, Math.round((s - 2 * e) / 10)), R = K.rng(Math.round(x * 7 + y));
            for (var t = 0; t < nT * nT / 3; t++) I.tree(ctx, x + e + R() * (s - 2 * e), y + e + R() * (s - 2 * e), RZ + 4, .45);
          }
        }
        if (shape === "one") piece(c0 - side / 2, c0 - side / 2, side);
        else {
          var h = side / 2, gap = 6;
          I.plane(ctx, RZ + .5, "#868e96", null, c0 - side / 2 - 8, c0 + side / 2 + 8, c0 - 2.5, c0 + 2.5);
          I.plane(ctx, RZ + .5, "#868e96", null, c0 - 2.5, c0 + 2.5, c0 - side / 2 - 8, c0 + side / 2 + 8);
          piece(c0 - h - gap / 2, c0 - h - gap / 2, h); piece(c0 + gap / 2, c0 - h - gap / 2, h);
          piece(c0 - h - gap / 2, c0 + gap / 2, h); piece(c0 + gap / 2, c0 + gap / 2, h);
        }
        I.edges(ctx, RZ, RZ);
        K.bigText(ctx, "숲 속 " + ia.toFixed(0) + " km² · " + S.toFixed(1) + "종", 18, 34, 21, S >= 50 ? "#8ff0c8" : "#ffffff");
        K.t(ctx, "연한 초록 = 가장자리 1 km (소음·빛 때문에 숲 속 종이 못 삶)", 18, 318, { s: 10.5, w: "700", c: LTc.mute });
        /* 종-면적 곡선 */
        var g = K.chart(ctx, { x: 380, y: 46, w: 270, h: 250, pl: 42, pb: 32, pt: 12, pr: 12, x0: 0, x1: 1500, y0: 0, y1: 70, xt: 3, yt: 2, light: true, xl: "숲 속 넓이 (km²)", yl: "종 수" });
        var pts = []; for (var a = 0; a <= 1500; a += 20) pts.push([a, 10 * Math.pow(a, 0.25)]);
        K.plot(ctx, g, pts, LTc.teal, { light: true, w: 2.6 });
        K.line(ctx, { x: g.L, y: g.Y(50) }, { x: g.R, y: g.Y(50) }, LTc.red, 1.4, [5, 4]);
        K.t(ctx, "50종", g.R - 4, g.Y(50) - 6, { s: 10.5, w: "800", a: "right", c: LTc.red });
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.X(ia), g.Y(S), 6.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = S >= 50 ? LTc.green : LTc.red; ctx.beginPath(); ctx.arc(g.X(ia), g.Y(S), 4.5, 0, 6.2832); ctx.fill();
        /* 판정 카드 */
        var p0 = 682, p1 = 868;
        K.card(ctx, 664, 14, 222, cv.H - 28, "보호구역");
        K.row(ctx, "사들인 땅", A + " km²", p0, p1, 74, A > 800 ? LTc.red : LTc.ink);
        K.row(ctx, "모양", shape === "one" ? "한 덩어리" : "네 조각", p0, p1, 102);
        K.row(ctx, "숲 속 넓이", ia.toFixed(0) + " km²", p0, p1, 130);
        K.row(ctx, "살 수 있는 종", S.toFixed(1) + " 종", p0, p1, 158, S >= 50 ? LTc.green : LTc.red);
        K.bar(ctx, p0, 168, p1 - p0, S / 70, S >= 50 ? LTc.green : LTc.orange);
        K.tip(ctx, S >= 50 ? "50종 넘게 살 수 있음" : "숲 속 종 50종을 지키기", p0 - 4, 192, p1 - p0 + 8, S >= 50);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "모양", value: "one", options: [{ v: "one", t: "한 덩어리" }, { v: "four", t: "도로로 나눈 네 조각" }],
        onPick: function (x) { shape = x; draw(); } });
      api.slider({ label: "넓이", min: 100, max: 1500, step: 10, value: 300, fmt: function (x) { return x + " km²"; },
        onInput: function (x) { A = x; draw(); } });
      api.info("종 수는 <b>숲 속 넓이</b>로 정해집니다(종 수 = 10 × 넓이<sup>0.25</sup>). 곡선이 어떻게 휘는지 보세요.");
      draw();
      return {
        judge: function () {
          var S = species(A, shape);
          if (A > 800) return { ok: false, msg: A + " km² — 살 수 있는 땅(800 km²)을 넘었습니다." };
          if (S >= 50) return { ok: true, msg: (shape === "one" ? "한 덩어리 " : "네 조각 ") + A + " km² · 숲 속 " + inner(A, shape).toFixed(0) + " km² · " + S.toFixed(1) + "종 — 목표를 채웠습니다." };
          return { ok: false, msg: S.toFixed(1) + "종 — 50종에 모자랍니다." + (shape === "four" ? " 도로가 숲 속을 얼마나 깎아 먹는지 보세요." : "") };
        }
      };
    },
    hints: [
      "곡선이 점점 눕습니다. 넓이를 늘려도 종 수는 <b>조금씩만</b> 늡니다. 50종이 되려면 숲 속 넓이가 약 625 km²는 되어야 합니다.",
      "땅을 네 조각으로 나누면 가장자리가 두 배로 늘어 <b>숲 속 넓이가 크게 줄어듭니다</b>. 같은 800 km² 라도 모양에 따라 결과가 다릅니다."
    ],
    solution: "<b>한 덩어리</b>로 두고 넓이를 <b>730~800 km²</b>로 하세요. 네 조각으로 나누면 800 km²를 다 사도 약 49종에 그칩니다.",
    why: "넓은 서식지일수록 종이 많이 살지만, 종 수는 넓이에 비례하지 않고 <b>천천히</b> 늘어납니다(종-면적 관계). 그래서 서식지가 조금만 줄어도 목표선 아래로 떨어지기 쉽습니다.<br>" +
      "또 서식지를 도로로 <b>쪼개면(단편화)</b> 가장자리가 늘어나 깊은 숲에 사는 종이 살 곳이 줄어듭니다. 넓이보다 <b>연결</b>이 중요할 때가 있는 까닭이고, 끊긴 숲을 잇는 <b>생태 통로</b>를 만드는 것도 이 때문입니다. " +
      "※ 식의 계수는 수업용 값입니다."
  }
  ]
});
})();
