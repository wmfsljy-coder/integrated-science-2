/* 통합과학2 Ⅱ-1 생태계와 환경 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

/* ---- 스튜디오 미니어처 도구(밝은 바닥 위 입체 모형 + 흰 판정 카드) ---- */
var K = window.sthKit, LT = K.LT;
function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 6.2832); }
function rgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgba(h, a) { var c = rgb(h); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
function mix(a, b, t) { var p = rgb(a), q = rgb(b), o = [], i; t = cl(t, 0, 1); for (i = 0; i < 3; i++) o.push(Math.round(p[i] + (q[i] - p[i]) * t)); return "rgb(" + o.join(",") + ")"; }
function shadowF(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 2, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ell(ctx, 0, 0, rx, rx); ctx.fill(); ctx.restore();
}
/* 유리 원기둥(비커·수조): inside(yl) 는 액체 속에 그릴 것 */
function glass(ctx, cx, yb, rx, h, lv, c, a, inside, ry) {
  ry = ry || rx * .22; var yt = yb - h, yl = yb - lv;
  shadowF(ctx, cx + rx * .1, yb + ry * .4, rx * 1.3, ry * 1.5, .3);
  ctx.fillStyle = "rgba(235,242,250,.45)"; ctx.beginPath(); ctx.moveTo(cx - rx, yt); ctx.lineTo(cx - rx, yb); ctx.ellipse(cx, yb, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, yt); ctx.ellipse(cx, yt, rx, ry, 0, 0, Math.PI, true); ctx.fill();
  if (lv > 0) {
    var g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); g.addColorStop(0, rgba(c, Math.min(.95, a * 1.7))); g.addColorStop(.4, rgba(c, a)); g.addColorStop(1, rgba(c, Math.min(.95, a * 1.8)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - rx + 2, yl); ctx.lineTo(cx - rx + 2, yb); ctx.ellipse(cx, yb, rx - 2, ry - 1, 0, Math.PI, 0, true); ctx.lineTo(cx + rx - 2, yl); ctx.ellipse(cx, yl, rx - 2, ry, 0, 0, Math.PI, false); ctx.fill();
    ctx.fillStyle = rgba(c, Math.min(.9, a)); ell(ctx, cx, yl, rx - 2, ry); ctx.fill();
  }
  if (inside) inside(yl);
  ctx.strokeStyle = "rgba(120,140,170,.75)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - rx, yt); ctx.lineTo(cx - rx, yb); ctx.ellipse(cx, yb, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, yt); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2.2; ell(ctx, cx, yt, rx, ry); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(cx - rx * .8, yt + ry + 6, rx * .12, h - ry - 12);
  return { yl: yl, yt: yt };
}
/* 입체 온도계 */
function thermo(ctx, x, y0, y1, f, c) {
  var tg = ctx.createLinearGradient(x - 8, 0, x + 8, 0); tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#b9c6d6");
  ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(x - 8, y0, 16, y1 - y0, 8); ctx.fill(); ctx.strokeStyle = "rgba(110,130,160,.7)"; ctx.lineWidth = 1.2; ctx.stroke();
  var top = y1 - cl(f, 0, 1) * (y1 - y0 - 8); ctx.fillStyle = c; ctx.fillRect(x - 3, top, 6, y1 - top);
  K.planet(ctx, x, y1 + 5, 12, c, "#7a1f12");
}

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 비생물 요인(온도) → 생물 */
  {
    id: "c1", about: "01", tag: "비생물 요인", title: "바다거북 부화장의 그늘막", short: "거북 성비",
    who: "🐢", name: "바다거북 보호 센터",
    say: "“바다거북은 알이 묻힌 <b>모래의 온도</b>로 새끼의 암수가 정해져요. 약 <b>29 ℃</b>면 암수가 반반, 더 따뜻하면 암컷, 더 서늘하면 수컷이 많아집니다. 요즘 여름이 뜨거워져 부화장 새끼가 거의 다 암컷이에요. 그늘막으로 온도를 낮춰 <b>암컷 40~60%</b>를 맞춰 주세요.”",
    predict: {
      q: "새끼 암수가 온도로 정해지는 바다거북에게 기온 상승이 계속되면, 먼저 생길 문제는?",
      options: ["㉠ 알을 더 많이 낳게 되어 개체 수가 폭발한다", "㉡ 한쪽 성만 태어나 다음 세대에 짝을 찾기 어려워진다", "㉢ 성비는 유전자로 정해지므로 아무 영향이 없다"],
      answer: 1
    },
    task: "모래 종류와 그늘막 가림 정도를 조절해 <b>암컷 비율 40~60%</b>를 맞추세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var SAND = { light: { t: "밝은 산호 모래", d: -1, c: "#e9dcc0" }, dark: { t: "검은 화산 모래", d: 1.5, c: "#6b625a" } };
      var sand = "dark", shade = 0;
      function temp() { return 31.5 - 0.05 * shade + SAND[sand].d; }
      function fem(T) { return 1 / (1 + Math.exp(-(T - 29) / 0.6)); }
      function draw() {
        var T = temp(), f = fem(T), LW = 500, i, ok = f >= 0.4 && f <= 0.6;
        ctx.clearRect(0, 0, W, cv.H);
        K.studio(ctx, 0, 0, LW, cv.H, null);
        /* 모래사장 블록: 앞면은 둥지를 자른 단면(알 20개), 윗면은 모래와 그늘막 */
        var I = K.iso({ ox: 250, oy: 128, s: 0.8, L: 260, D: 140 }), ZS = 110, sc = SAND[sand].c;
        shadowF(ctx, 250, 320, 210, 28, .25);
        I.face(ctx, "front", function (Lw) {
          var g = ctx.createLinearGradient(0, ZS, 0, 0); g.addColorStop(0, mix(sc, "#ffffff", .1)); g.addColorStop(1, mix(sc, "#3a2e22", .35));
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, ZS);
          var R = K.rng(3); ctx.fillStyle = "rgba(255,255,255,.25)"; for (var k = 0; k < 160; k++) ctx.fillRect(R() * Lw, R() * ZS, 1.4, 1.4);
          ctx.fillStyle = "rgba(60,40,20,.25)"; ctx.beginPath(); ctx.ellipse(Lw / 2, 46, 100, 30, 0, 0, 6.283); ctx.fill();
        });
        I.face(ctx, "right", function (Lw) { ctx.fillStyle = mix(sc, "#2a2018", .45); ctx.fillRect(0, 0, Lw, ZS); });
        I.top(ctx, function () { return ZS; }, function (k) { return mix(sc, "#ffffff", k % 2 ? .12 : .05); }, 20);
        I.edges(ctx, ZS, ZS);
        /* 단면 속 알: ♀ 암컷 / ♂ 수컷 */
        for (i = 0; i < 20; i++) {
          var u = 22 + (i % 10) * 24, z = 60 - Math.floor(i / 10) * 24, p = I.P(u, I.D, z), isF = i < Math.round(f * 20);
          K.planet(ctx, p.x, p.y, 8.5, "#fbf6e8", "#b8a98a");
          K.t(ctx, isF ? "♀" : "♂", p.x, p.y + 4, { s: 11, w: "900", a: "center", c: isF ? "#c2255c" : "#1c64c4" });
        }
        /* 그늘막: 네 기둥 위 반투명 천 */
        [[20, 20], [240, 20], [20, 120], [240, 120]].forEach(function (q) { var a = I.P(q[0], q[1], ZS), b = I.P(q[0], q[1], ZS + 46); ctx.strokeStyle = "#6d5a46"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
        if (shade > 0) I.plane(ctx, ZS + 46, "rgba(12,133,153," + (0.12 + shade / 100 * 0.6).toFixed(3) + ")", "rgba(255,255,255,.6)", 20, 240, 20, 120);
        K.sun(ctx, 440, 46, 15);
        var nRay = Math.max(1, Math.round(5 * (1 - shade / 100)));
        for (i = 0; i < nRay; i++) { var r0 = I.P(60 + i * 40, 70, ZS + 2); K.arrow(ctx, { x: 430 - i * 6, y: 64 + i * 3 }, r0, "rgba(245,159,0,.85)", 2, 8); }
        K.bigText(ctx, "암컷 " + (f * 100).toFixed(0) + "%", 18, 40, 26, ok ? "#7ee0a0" : "#ffffff");
        K.bigText(ctx, SAND[sand].t + " · 그늘막 " + shade + "%", 18, 66, 15, "#ffd35a");
        /* 오른쪽 흰 카드: 온도 → 암컷 비율 곡선 */
        var RX = LW + 12;
        K.card(ctx, RX, 0, W - RX, cv.H, "둥지 온도 " + T.toFixed(2) + " ℃ → 암컷 비율");
        var g = K.chart(ctx, { x: RX + 6, y: 40, w: W - RX - 12, h: cv.H - 92, pl: 46, pb: 28, pt: 10, pr: 16, x0: 26, x1: 34, y0: 0, y1: 1, xt: 4, yt: 2, light: true, xf: function (q) { return Math.round(q) + " ℃"; }, yf: function (q) { return Math.round(q * 100) + "%"; } });
        ctx.fillStyle = "rgba(15,159,118,.14)"; ctx.fillRect(g.L, g.Y(0.6), g.R - g.L, g.Y(0.4) - g.Y(0.6));
        var pts = []; for (var t = 26; t <= 34; t += 0.1) pts.push([t, fem(t)]);
        K.plot(ctx, g, pts, "#e64980", { w: 2.8, light: true });
        K.planet(ctx, g.X(cl(T, 26, 34)), g.Y(f), 6, "#ff6b9a", "#8a1645");
        K.tip(ctx, ok ? "암수가 고르게 태어납니다" : (f > 0.6 ? "아직 너무 따뜻해 암컷이 많음" : "너무 서늘해 수컷이 많음"), RX + 14, cv.H - 46, W - RX - 28, ok);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "모래", value: "dark", options: [{ v: "light", t: "밝은 산호 모래" }, { v: "dark", t: "검은 화산 모래" }],
        onPick: function (x) { sand = x; draw(); } });
      api.slider({ label: "그늘막 가림 정도", min: 0, max: 100, step: 1, value: 0, fmt: function (x) { return x + "%"; },
        onInput: function (x) { shade = x; draw(); } });
      api.info("어두운 모래는 햇빛을 더 흡수해 뜨겁고, 그늘막은 모래를 식힙니다. 곡선의 가파른 부분을 보세요 — 1 ℃ 차이가 얼마나 큰가요?");
      draw();
      return {
        judge: function () {
          var T = temp(), f = fem(T);
          if (f >= 0.4 && f <= 0.6) return { ok: true, msg: SAND[sand].t + " · 그늘막 " + shade + "% → " + T.toFixed(2) + " ℃ · 암컷 " + (f * 100).toFixed(0) + "% — 암수가 고르게 태어납니다." };
          return { ok: false, msg: T.toFixed(2) + " ℃ · 암컷 " + (f * 100).toFixed(0) + "% — " + (f > 0.6 ? "아직 너무 따뜻합니다." : "너무 서늘해져 수컷이 많습니다.") };
        }
      };
    },
    hints: [
      "목표 온도는 약 <b>29 ℃</b>. 곡선이 가파라서 0.3 ℃만 벗어나도 비율이 크게 기웁니다.",
      "그늘막 1%마다 0.05 ℃씩 내려갑니다. 모래마다 29 ℃가 되는 그늘막 값이 다르니, 모래를 먼저 고르고 천천히 맞추세요."
    ],
    solution: "밝은 산호 모래면 그늘막 <b>약 30%</b>(26~34%), 검은 화산 모래면 <b>약 80%</b>(76~84%)입니다.",
    why: "온도·빛·물 같은 <b>비생물 요인</b>은 생물의 생김새뿐 아니라 번식에까지 영향을 줍니다. 같은 나무에서도 햇빛을 받는 잎과 그늘 잎의 두께가 달랐던 것처럼요.<br>" +
      "바다거북처럼 온도로 성이 정해지는 생물에게는 기온이 1~2 ℃ 오르는 것만으로도 <b>개체군 전체의 성비</b>가 무너질 수 있습니다. 실제로 호주 북부의 한 바다거북 무리에서는 새끼의 99%가 암컷으로 나타났습니다. " +
      "그래서 2 ℃의 문턱은 사람만의 문제가 아닙니다. ※ 모래 온도 계산은 수업용 모형입니다."
  },

  /* ------------------------------------------------------------------ 2. 생물 농축 */
  {
    id: "c2", about: "02", tag: "먹이 사슬 · 생물 농축", title: "물수리 알이 깨지는 호수", short: "생물 농축",
    who: "🦅", name: "환경청 수질 담당",
    say: "“호숫가 물수리 알 껍데기가 얇아져 품다가 깨져요. 원인은 농약 성분이 쌓인 것으로 보입니다. 물수리 몸속 농도가 <b>5 ppm</b>을 넘으면 껍데기가 얇아진다고 해요. 공장에 줄 <b>물 속 배출 기준</b>을 정해야 하는데, 너무 엄격하면 공장이 문을 닫는대요. 물수리가 안전한 선에서 <b>가장 느슨한</b> 기준을 찾아 주세요.”",
    predict: {
      q: "호수 물 속 농약 농도가 0.00001 ppm처럼 아주 낮다면, 먹이 사슬 꼭대기 물수리의 몸속 농도는?",
      options: ["㉠ 물과 비슷하게 아주 낮다", "㉡ 먹이 단계를 거칠 때마다 쌓여 훨씬 높아진다", "㉢ 먹고 먹히는 동안 분해되어 0이 된다"],
      answer: 1
    },
    task: "물 속 농도 기준을 정해 <b>물수리 5 ppm 이하</b>를 지키면서 가장 느슨하게(물수리 2.5 ppm 이상) 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var lg = -4;
      var CH = [["물", 1, "💧"], ["플랑크톤", 1000, "🦠"], ["작은 물고기", 10, "🐟"], ["큰 물고기", 10, "🐠"], ["물수리", 10, "🦅"]];
      function levels() { var c = Math.pow(10, lg), out = []; CH.forEach(function (k) { c *= k[1]; out.push(c); }); return out; }
      function fmt(c) { return c >= 1 ? c.toFixed(2) : (c >= 0.001 ? c.toFixed(4) : c.toExponential(1)); }
      function draw() {
        var L = levels(), LW = 380, i, top = L[4], bad = top > 5;
        ctx.clearRect(0, 0, W, cv.H);
        K.studio(ctx, 0, 0, LW, cv.H, null);
        /* 먹이 사슬 계단(입체 받침): 위 단계로 갈수록 몸속 농약 알갱이(빨간 점)가 빽빽해진다 */
        var I = K.iso({ ox: 150, oy: 150, s: 0.72, L: 300, D: 90 });
        shadowF(ctx, 210, 300, 180, 26, .25);
        for (i = 0; i < 5; i++) {
          var x0 = i * 60, z1 = 16 + i * 22;
          I.box(ctx, x0, 0, 0, x0 + 58, 90, z1, ["#bfe3f7", "#c6e8c0", "#d6eef5", "#cfe1f0", "#f3e3c8"][i], "#9aa8b8", "#7d8a9a");
          var p = I.P(x0 + 29, 45, z1), rr = 10 + i * 2.4;
          K.planet(ctx, p.x, p.y - rr, rr, ["#5aa9ff", "#7ee07e", "#7fb6e6", "#4f8dd8", "#a7825a"][i], "#2a3a50");
          var nd = Math.min(18, Math.max(0, Math.round((Math.log(L[i]) / Math.LN10 + 9) * 1.4)));
          var R = K.rng(11 + i); for (var k = 0; k < nd; k++) { var a = R() * 6.283, d = R() * rr * .75; ctx.fillStyle = "#e03131"; ctx.beginPath(); ctx.arc(p.x + Math.cos(a) * d, p.y - rr + Math.sin(a) * d, 1.6, 0, 6.283); ctx.fill(); }
          K.t(ctx, CH[i][2], p.x, p.y - rr * 2 - 6, { s: 13, a: "center" });
        }
        K.bigText(ctx, "물수리 " + fmt(top) + " ppm", 18, 40, 22, bad ? "#ffb0a0" : (top >= 2.5 ? "#7ee0a0" : "#ffffff"));
        K.bigText(ctx, "단계마다 쌓여 백만 배", 18, 64, 14, "#ffd35a");
        K.t(ctx, "빨간 점 = 몸속 농약 성분(눈금은 10배씩)", 18, cv.H - 12, { s: 10.5, w: "800", c: LT.mute });
        /* 오른쪽 흰 카드: 단계별 농도 막대(로그 눈금) */
        var RX = LW + 12, bx0 = RX + 150, bx1 = W - 24;
        K.card(ctx, RX, 0, W - RX, cv.H, "단계별 몸속 농도 (ppm, 눈금 한 칸 = 10배)");
        function X(c) { return bx0 + (H.log10(c) + 9) / 12 * (bx1 - bx0); }
        [-8, -6, -4, -2, 0, 2].forEach(function (e) { K.line(ctx, { x: X(Math.pow(10, e)), y: 44 }, { x: X(Math.pow(10, e)), y: 262 }, LT.line, .6); K.t(ctx, e === 0 ? "1" : "10^" + e, X(Math.pow(10, e)), 278, { s: 10, w: "600", a: "center", c: LT.mute }); });
        K.line(ctx, { x: X(5), y: 44 }, { x: X(5), y: 262 }, LT.red, 2.2);
        K.t(ctx, "5 ppm", X(5) - 4, 58, { s: 11, w: "900", a: "right", c: LT.red });
        L.forEach(function (c, i) {
          var y = 70 + i * 40, b2 = i === 4 && c > 5;
          K.t(ctx, CH[i][0], RX + 18, y + 15, { s: 12.5, w: "800", c: LT.ink });
          if (i > 0) K.t(ctx, "×" + CH[i][1], bx0 - 8, y + 15, { s: 10.5, w: "700", a: "right", c: LT.mute });
          var gg = ctx.createLinearGradient(0, y, 0, y + 20); gg.addColorStop(0, b2 ? "#ff8a8a" : (i === 4 ? "#5fd3a3" : "#5ab8d0")); gg.addColorStop(1, b2 ? "#c92a2a" : (i === 4 ? "#0f9f76" : "#0c8599"));
          ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(bx0, y, Math.max(3, X(c) - bx0), 20, 6); ctx.fill();
          var inB = X(c) + 6 > bx1 - 60; K.t(ctx, fmt(c), inB ? X(c) - 8 : X(c) + 6, y + 15, { s: 11.5, w: "900", a: inB ? "right" : "left", c: inB ? "#ffffff" : LT.ink });
        });
        K.tip(ctx, bad ? "알 껍질이 얇아진다" : (top >= 2.5 ? "안전하면서 가장 느슨한 기준" : "안전하지만 필요 이상으로 엄격"), RX + 14, cv.H - 40, W - RX - 28, bad ? false : (top >= 2.5 ? true : null));
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "물 속 배출 기준 (10의 지수)", min: -8, max: -3, step: 0.1, value: -4,
        fmt: function (x) { return Math.pow(10, x).toExponential(1) + " ppm"; },
        onInput: function (x) { lg = Math.round(x * 10) / 10; draw(); } });
      api.info("농약 성분은 지방에 녹아 몸 밖으로 잘 빠져나가지 않습니다. 한 단계 위 생물은 아래 생물을 <b>아주 많이</b> 먹습니다.");
      draw();
      return {
        judge: function () {
          var top = levels()[4];
          if (top > 5) return { ok: false, msg: "물수리 " + fmt(top) + " ppm — 알 껍데기가 얇아집니다." };
          if (top >= 2.5) return { ok: true, msg: "물 " + Math.pow(10, lg).toExponential(1) + " ppm → 물수리 " + fmt(top) + " ppm — 백만 배로 쌓여도 기준 아래입니다." };
          return { ok: false, msg: "물수리 " + fmt(top) + " ppm — 안전하지만 필요 이상으로 엄격합니다. 조금 더 느슨하게 해도 됩니다." };
        }
      };
    },
    hints: [
      "막대에 적힌 배율을 모두 곱해 보세요. 물에서 물수리까지 농도가 <b>몇 배</b>로 커지나요?",
      "1000 × 10 × 10 × 10 = 1,000,000 배. 물수리가 5 ppm 이하가 되려면 물은 5 ÷ 1,000,000 ppm 이하여야 합니다."
    ],
    solution: "물 속 기준을 <b>약 2.5 × 10⁻⁶~4 × 10⁻⁶ ppm</b>(지수 −5.6~−5.4)에 두세요.",
    why: "분해되지 않고 몸에 쌓이는 물질은 먹이 사슬의 단계를 오를 때마다 농도가 커집니다 — <b>생물 농축</b>입니다. 한 단계 위 생물은 아래 생물을 몸무게의 몇 배나 먹으니까요.<br>" +
      "그래서 물속에서는 거의 없는 것처럼 보이는 양도 <b>최종 소비자</b>에게는 위험해집니다. 늑대가 사라졌을 때 먹이그물 전체가 흔들렸던 것처럼, 꼭대기 포식자의 위기는 생태계 평형 전체의 위기가 됩니다. " +
      "1960년대 미국에서 DDT 때문에 흰머리수리가 사라질 뻔했고, 사용을 금지한 뒤 되살아났습니다. ※ 단계별 배율은 수업용 값입니다."
  },

  /* ------------------------------------------------------------------ 3. 해빙과 빙상 */
  {
    id: "c3", about: "03", tag: "지구 환경 변화", title: "녹는 얼음과 해수면 뉴스", short: "해빙 vs 빙상",
    who: "📰", name: "과학 기자",
    say: "“기사 초안에 ‘<b>북극 바다 얼음</b> 2만 km³가 녹으면 해수면이 5 cm 오른다’고 썼는데, 데스크가 틀렸다고 해요. 정말 해수면을 <b>5.0~5.5 cm</b> 올리는 것은 어떤 얼음이 얼마나 녹을 때인지 확인해 주세요. 바다 넓이는 3.61억 km², 얼음 밀도는 물의 0.917배입니다.”",
    predict: {
      q: "물 컵에 떠 있는 얼음이 모두 녹으면 컵의 수면은?",
      options: ["㉠ 올라간다", "㉡ 그대로다", "㉢ 내려간다"],
      answer: 1
    },
    task: "얼음 종류와 녹는 부피를 정해 <b>해수면이 5.0~5.5 cm</b> 오르게 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(350), ctx = cv.ctx, W = cv.W;
      var kind = "sea", V = 20000;
      function rise() { return kind === "land" ? V * 0.917 / 3.61e8 * 1e5 : 0; }
      function cube(x, y, s, a) {
        var d = s * .35;
        ctx.globalAlpha = a; ctx.fillStyle = "#cfe9f7"; ctx.beginPath(); ctx.moveTo(x - s / 2, y - s); ctx.lineTo(x - s / 2 + d, y - s - d * .6); ctx.lineTo(x + s / 2 + d, y - s - d * .6); ctx.lineTo(x + s / 2, y - s); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#9cc9e6"; ctx.beginPath(); ctx.moveTo(x + s / 2, y - s); ctx.lineTo(x + s / 2 + d, y - s - d * .6); ctx.lineTo(x + s / 2 + d, y - d * .6); ctx.lineTo(x + s / 2, y); ctx.closePath(); ctx.fill();
        var g = ctx.createLinearGradient(x - s / 2, y - s, x + s / 2, y); g.addColorStop(0, "#f4fbff"); g.addColorStop(1, "#b9dcf0"); ctx.fillStyle = g; ctx.fillRect(x - s / 2, y - s, s, s); ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(110,150,190,.6)"; ctx.lineWidth = 1; ctx.strokeRect(x - s / 2, y - s, s, s);
      }
      function draw() {
        var k = V / 40000, r = rise(), ok = kind === "land" && r >= 5 && r <= 5.5, LW = 560;
        ctx.clearRect(0, 0, W, cv.H);
        K.studio(ctx, 0, 0, LW, cv.H, null);
        [[150, "sea", "바다에 떠 있는 얼음 (해빙)"], [410, "land", "땅 위의 얼음 (빙상)"]].forEach(function (c) {
          var x = c[0], on = kind === c[1], lvH = 116 + (c[1] === "land" && on ? Math.min(40, r * 5) : 0), s = 60 * (1 - (on ? k : 0)) + 8;
          glass(ctx, x, 298, 92, 210, lvH, "#5aa9e6", .3, function (yl) {
            if (c[1] === "sea") cube(x - 6, yl + s * .917, s, .95);
            else {
              var rg = ctx.createLinearGradient(x - 50, 0, x + 50, 0); rg.addColorStop(0, "#6f6a64"); rg.addColorStop(.5, "#a39a90"); rg.addColorStop(1, "#5e5852");
              ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(x - 56, 292); ctx.lineTo(x + 56, 292); ctx.lineTo(x + 36, 168); ctx.lineTo(x - 36, 168); ctx.closePath(); ctx.fill();
              cube(x - 4, 168, s, .95);
            }
          }, 18);
          var ly = 298 - 116; ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(90,110,140,.8)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x - 108, ly); ctx.lineTo(x + 108, ly); ctx.stroke(); ctx.restore();
          K.pill(ctx, c[2], x, 330, { s: 11.5, a: "center", c: on ? "#ffffff" : "#c9d2e6", box: [0, LW] });
        });
        K.bigText(ctx, "해수면 +" + r.toFixed(2) + " cm", 18, 40, 24, ok ? "#7ee0a0" : "#ffffff");
        K.bigText(ctx, (kind === "land" ? "그린란드 빙상" : "북극 바다 얼음") + " " + (V / 1000) + " 천 km³ 녹음", 18, 64, 15, "#ffd35a");
        K.t(ctx, "점선 = 처음 수면", LW - 14, 64, { s: 11, w: "800", a: "right", c: LT.mute });
        var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
        K.card(ctx, RX, 0, W - RX, cv.H, "판정 — 해수면 상승");
        K.t(ctx, r.toFixed(2) + " cm", x0, 70, { s: 28, w: "900", c: ok ? LT.green : LT.red });
        K.t(ctx, "목표 5.0~5.5 cm", x1, 68, { s: 12, w: "800", a: "right", c: LT.mute });
        K.row(ctx, "녹은 얼음", (V / 1000).toFixed(0) + " 천 km³", x0, x1, 116);
        K.row(ctx, "바다에 더해진 물", kind === "land" ? (V * 0.917 / 1000).toFixed(1) + " 천 km³" : "0 (이미 밀어내던 자리)", x0, x1, 146, LT.blue);
        K.bar(ctx, x0, 158, x1 - x0, r / 10, ok ? LT.green : LT.blue);
        K.tip(ctx, kind === "sea" ? "떠 있는 얼음은 녹아도 그대로" : (ok ? "땅 위 얼음이 바다를 채움" : "부피를 조절해 보세요"), x0 - 4, 188, x1 - x0 + 8, ok ? true : (kind === "sea" ? false : null));
        K.t(ctx, "바다 넓이 3.61억 km² · 얼음 밀도 0.917", x0, 252, { s: 11, w: "700", c: LT.mute });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "녹는 얼음", value: "sea", options: [{ v: "sea", t: "북극 바다 얼음" }, { v: "land", t: "그린란드 빙상" }],
        onPick: function (x) { kind = x; draw(); } });
      api.slider({ label: "녹는 얼음의 부피", min: 0, max: 40000, step: 1000, value: 20000, fmt: function (x) { return (x / 1000) + " 천 km³"; },
        onInput: function (x) { V = x; draw(); } });
      api.info("떠 있는 얼음은 자기 무게만큼의 물을 이미 밀어내고 있습니다. 녹아서 물이 되면 그 부피가 얼마인가요?");
      draw();
      return {
        judge: function () {
          var r = rise();
          if (kind === "sea") return { ok: false, msg: "바다 얼음은 아무리 녹아도 해수면이 거의 그대로입니다 — 기사가 틀린 까닭이지요." };
          if (r >= 5 && r <= 5.5) return { ok: true, msg: "그린란드 빙상 " + (V / 1000) + " 천 km³ → 해수면 " + r.toFixed(2) + " cm. 땅 위 얼음이 녹아 바다로 들어올 때만 해수면이 오릅니다." };
          return { ok: false, msg: "해수면 " + r.toFixed(2) + " cm — 5.0~5.5 cm가 되도록 부피를 조절하세요." };
        }
      };
    },
    hints: [
      "떠 있는 얼음은 녹기 전부터 <b>자기 무게만큼의 바닷물을 밀어내고</b> 있습니다. 녹아서 생긴 물은 딱 그 자리를 채울 뿐입니다.",
      "땅 위 얼음은 녹아서 <b>새로</b> 바다에 들어옵니다. 늘어난 물 부피 ÷ 바다 넓이 = 상승 높이. 1천 km³가 녹으면 약 0.25 cm 오릅니다."
    ],
    solution: "<b>그린란드 빙상</b>을 고르고 <b>20~21 천 km³</b>를 녹이세요.",
    why: "물에 떠 있는 얼음은 <b>자기 무게만큼의 물을 밀어냅니다</b>. 녹아서 물이 되면 밀어내던 부피와 똑같아지므로 수면이 그대로입니다. 그래서 북극 바다 얼음(해빙)이 녹는 것은 해수면을 거의 올리지 않습니다.<br>" +
      "해수면을 올리는 것은 그린란드·남극 대륙처럼 <b>땅 위의 얼음(빙상·빙하)</b>과, 따뜻해진 바닷물의 <b>열팽창</b>입니다. 다만 해빙이 녹으면 햇빛을 반사하던 하얀 면이 줄어 지구가 더 데워지니, 다른 방식으로 기후 변화를 부추깁니다. " +
      "※ 그린란드 빙상 전체는 약 290만 km³, 모두 녹으면 해수면이 약 7 m 오릅니다."
  }
  ]
});
})();
