/* 통합과학2 Ⅰ-1 지구 환경 변화와 생물다양성 — 실제 자료
   r1 북극 바다얼음은 얼마나 빨리 줄고 있나 — 9월 해빙 면적의 추세(10년마다)
   r2 줄어든 얼음은 한반도 몇 개 넓이일까 — 서식지가 사라지는 규모
   자료: data/seaice-sep.js (NSIDC Sea Ice Index v4, NOAA/NSIDC) */
(function () {
"use strict";
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
var S = (window.REAL_SEAICE || { rows: [] }).rows;                 /* [연도, 백만 km²] */
function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / (a.length || 1); }
var FIT = (function () { var x = S.map(function (r) { return r[0]; }), y = S.map(function (r) { return r[1]; }), mx = mean(x), my = mean(y), b = 0, q = 0; x.forEach(function (v, i) { b += (v - mx) * (y[i] - my); q += (v - mx) * (v - mx); }); b /= q; return { b: b, a: my - b * mx }; })();
var BASE = mean(S.filter(function (r) { return r[0] >= 1981 && r[0] <= 2010; }).map(function (r) { return r[1]; }));
var DEC = FIT.b * 10;                                               /* 백만 km² / 10년 */
var EARLY = mean(S.filter(function (r) { return r[0] >= 1979 && r[0] <= 1988; }).map(function (r) { return r[1]; }));
var LATE = mean(S.filter(function (r) { return r[0] >= 2015 && r[0] <= 2024; }).map(function (r) { return r[1]; }));
var KOREA = 0.2207;                                                 /* 한반도 넓이 약 22.07만 km² = 0.2207 백만 km² */
var NK = (EARLY - LATE) / KOREA;
var SRC = "<small>출처: 미국 국립 설빙자료센터(NSIDC) Sea Ice Index 버전 4(G02135), 북극 9월 월평균 해빙 면적(바다 얼음이 15% 넘게 덮인 넓이), 1979 ~ " + (S.length ? S[S.length - 1][0] : "") + "년. 가장 최근 해는 잠정값일 수 있습니다. 사본은 data/seaice-sep.js.</small>";

function chart(H, ctx, W, CH, slope, showFit) {             /* 밝은 카드 그래프 */
  H.paper(ctx, W, CH);
  var K = window.sthKit, LTc = K.LT;
  var g = K.chart(ctx, { x: 6, y: 34, w: 630, h: CH - 34, pl: 46, pb: 32, pt: 10, pr: 14, x0: 1978, x1: 2027, y0: 2, y1: 9, xt: 7, yt: 7, light: true,
    xf: function (q) { return String(Math.round(q)); } });
  K.t(ctx, "9월 북극 해빙 면적 (백만 km²)", 18, 24, { s: 12, w: "900", c: LTc.ink });
  S.forEach(function (r) { var c = r[0] === 2012 ? LTc.red : LTc.blue; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.X(r[0]), g.Y(r[1]), 5, 0, 6.2832); ctx.fill(); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(g.X(r[0]), g.Y(r[1]), 3.6, 0, 6.2832); ctx.fill(); });
  if (showFit) {
    var my = mean(S.map(function (r) { return r[1]; })), mx = mean(S.map(function (r) { return r[0]; }));
    K.plot(ctx, g, [[1979, my + slope / 10 * (1979 - mx)], [2026, my + slope / 10 * (2026 - mx)]], LTc.orange, { light: true, w: 3 });
  }
  return { X: g.X, Y: g.Y };
}
/* 북극 바다 블록 미니어처: 위 얼음판의 넓이가 비율 f 만큼 */
function iceBlock(ctx, ox, oy, f, f0) {
  var K = window.sthKit, I = K.iso({ ox: ox, oy: oy, s: 0.55, L: 200, D: 150 }), Z = 34;
  ctx.fillStyle = "rgba(20,30,50,.18)"; ctx.beginPath(); ctx.ellipse(I.P(200, 150, 0).x - 30, I.P(200, 150, 0).y - 10, 110, 16, 0, 0, 6.2832); ctx.fill();
  I.box(ctx, 0, 0, 0, 200, 150, Z, "#4dabf7", "#1864ab", "#0b4f8a");
  function floe(r, fill, stroke, dash) {
    ctx.beginPath();
    for (var i = 0; i <= 24; i++) { var a = i / 24 * 6.2832, rr = r * (1 + .12 * Math.sin(a * 3) + .06 * Math.cos(a * 5)), p = I.P(100 + Math.cos(a) * rr, 75 + Math.sin(a) * rr * .8, Z + 3); if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
    ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.6; if (dash) ctx.setLineDash([5, 4]); ctx.stroke(); ctx.setLineDash([]); }
  }
  if (f0) floe(70 * Math.sqrt(f0), null, "rgba(255,255,255,.95)", true);
  floe(70 * Math.sqrt(f), "#f8f9fa", "#ced4da", false);
  return I;
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 환경 변화가 생물다양성에 주는 영향을 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "03", tag: "실제 자료 · 북극 해빙", title: "북극 바다얼음은 얼마나 빨리 줄고 있나", short: "해빙 추세",
    who: "🐻‍❄️", name: "극지 연구소",
    say: "“북극 바다얼음은 해마다 9월에 가장 작아져요. 1979년부터 위성으로 잰 <b>9월 평균 해빙 면적</b>입니다. 점들을 가장 잘 지나는 직선을 그려, <b>10년마다 얼마나 줄었는지</b> 구해 주세요.”",
    predict: {
      q: "지난 40여 년 동안 9월의 북극 해빙은 어떻게 변했을까요?",
      options: ["㉠ 해마다 들쭉날쭉할 뿐 추세는 없다", "㉡ 해마다 오르내리지만 전체적으로 뚜렷하게 줄었다", "㉢ 오히려 늘었다"],
      answer: 1
    },
    task: "직선의 기울기를 바꿔 점들을 가장 잘 지나게 하세요(10년마다 줄어든 넓이, ± 0.1 백만 km²).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, sl = 0;
      function err(m) { var mx = mean(S.map(function (r) { return r[0]; })), my = mean(S.map(function (r) { return r[1]; })); return Math.sqrt(mean(S.map(function (r) { var e = r[1] - (my + m / 10 * (r[0] - mx)); return e * e; }))); }
      function draw() {
        chart(H, ctx, W, cv.H, sl, true);
        var K = window.sthKit, LTc = K.LT;
        K.card(ctx, 646, 8, 246, cv.H - 16, "내 추세선");
        K.row(ctx, "기울기 / 10년", sl.toFixed(2), 664, 876, 56, LTc.orange);
        K.row(ctx, "평균에 견주면", (sl / BASE * 100).toFixed(1) + " %", 664, 876, 80);
        K.row(ctx, "점과 선의 거리", err(sl).toFixed(3), 664, 876, 104);
        var my = mean(S.map(function (r) { return r[1]; })), mx = mean(S.map(function (r) { return r[0]; })), v0 = my + sl / 10 * (1979 - mx), v1 = my + sl / 10 * (2024 - mx);
        iceBlock(ctx, 730, 150, clamp(v1 / Math.max(v0, .1), .05, 1.6) * .8, .8);
        K.t(ctx, "점선 1979 · 흰 얼음 2024 (내 선)", 664, cv.H - 22, { s: 10, w: "700", c: LTc.mute });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "10년마다 변한 넓이", min: -1.5, max: 0.5, step: 0.05, value: 0, fmt: function (x) { return x.toFixed(2) + " 백만 km²"; }, onInput: function (x) { sl = x; api.changed(); draw(); } });
      api.info("‘점과 선의 평균 거리’가 가장 작아지는 기울기를 찾으세요. " + SRC
        + "<div data-link='{\"id\":\"nsidc-news\",\"title\":\"NSIDC 북극 해빙 소식\",\"src\":\"미국 국립 설빙자료센터\",\"url\":\"https://nsidc.org/sea-ice-today\",\"ask\":\"첫 화면의 Featured Sea Ice Analysis(가장 최근 분석 글)를 열어, 올해 9월 평균 북극 해빙 면적(million square kilometers)과 그것이 위성 관측 이래 몇 번째로 작은지 찾아 오세요. 이 사례 그래프의 마지막 점과 견주어 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(sl - DEC) <= 0.1) return { ok: true, msg: "가장 잘 맞는 기울기는 약 " + DEC.toFixed(2) + " 백만 km² / 10년, 1981~2010 평균의 약 " + Math.abs(DEC / BASE * 100).toFixed(0) + "%씩 줄고 있습니다." };
          return { ok: false, msg: sl.toFixed(2) + " 는 " + (sl > DEC ? "너무 완만합니다" : "너무 가파릅니다") + ". 평균 거리가 더 작아지는 쪽으로 옮겨 보세요." };
        }
      };
    },
    hints: ["직선은 1979년 약 7.6에서 2026년 약 4.1로 — 47년에 약 3.5 백만 km²가 줄었습니다.", "3.5 ÷ 4.7(십 년 단위) ≈ 0.74 — 기울기는 −0.7 근처입니다."],
    solution: "약 <b>" + DEC.toFixed(2) + " 백만 km² / 10년</b> (평균의 약 " + Math.abs(DEC / BASE * 100).toFixed(0) + "%).",
    why: "기온이 오르면 여름에 얼음이 더 많이 녹고, 얼음이 사라진 어두운 바다는 햇빛을 더 많이 흡수해 다시 얼음을 녹입니다(되먹임). 그래서 북극은 지구 평균보다 몇 배 빨리 따뜻해지고 있습니다. 해마다 날씨에 따라 오르내리지만(2012년이 가장 작았음) 긴 추세는 뚜렷합니다.<br>"
      + "바다얼음은 북극곰·물범·바다코끼리의 사냥터이자 쉼터이고, 얼음 밑면에 붙어 자라는 미세 조류(식물 플랑크톤)는 북극 먹이 그물의 시작입니다. 서식지가 사라지는 속도가 생물이 적응하는 속도보다 빠르면 개체 수가 줄고 종이 사라질 수 있습니다. 지질시대의 대멸종도 환경이 생물이 적응할 수 없을 만큼 빠르게 바뀌었을 때 일어났습니다. 지금의 변화가 그때와 무엇이 같고 다른지 견주어 보세요."
  },
  {
    id: "r2", sec: "03", tag: "실제 자료 · 서식지의 규모", title: "사라진 얼음은 한반도 몇 개 넓이일까", short: "한반도 몇 개",
    who: "🗺️", name: "환경 기자",
    say: "“‘몇 백만 km²’라고 하면 감이 안 와요. <b>1979~1988년 10년 평균</b>과 <b>2015~2024년 10년 평균</b>을 비교해, 9월의 북극 바다얼음이 줄어든 넓이가 <b>한반도(약 22만 km²) 몇 개</b>인지 구해 주세요.”",
    predict: {
      q: "40여 년 동안 사라진 9월 북극 바다얼음은 한반도 몇 개쯤일까요?",
      options: ["㉠ 한반도 1개쯤", "㉡ 한반도 3~4개쯤", "㉢ 한반도 10개 넘게"],
      answer: 2
    },
    task: "두 기간의 평균을 읽어 차이를 한반도 넓이로 나누고, 슬라이더로 맞추세요(± 1 개).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, g = 1;
      function draw() {
        var p = chart(H, ctx, W, cv.H, 0, false), K = window.sthKit, LTc = K.LT;
        H.dash(ctx, p.X(1979), p.Y(EARLY), p.X(1988), p.Y(EARLY), LTc.orange, 3);
        H.dash(ctx, p.X(2015), p.Y(LATE), p.X(2024), p.Y(LATE), LTc.orange, 3);
        K.card(ctx, 646, 8, 246, cv.H - 16, "사라진 얼음 = 한반도 몇 개?");
        K.row(ctx, "1979~1988 평균", EARLY.toFixed(2) + " 백만 km²", 664, 876, 58);
        K.row(ctx, "2015~2024 평균", LATE.toFixed(2) + " 백만 km²", 664, 876, 82);
        K.row(ctx, "한반도", "0.22 백만 km²", 664, 876, 106);
        /* 한반도 넓이 타일(입체 판) g 개 */
        for (var i = 0; i < 20; i++) {
          var cx = 676 + (i % 10) * 20, cy = 140 + Math.floor(i / 10) * 26, on = i < g, c = on ? "#20c997" : "#dee2e6";
          ctx.fillStyle = K.tint(c, 1.2); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 5, cy - 4); ctx.lineTo(cx + 19, cy - 4); ctx.lineTo(cx + 14, cy); ctx.closePath(); ctx.fill();
          ctx.fillStyle = c; ctx.fillRect(cx, cy, 14, 14);
        }
        K.t(ctx, "판 하나 = 한반도 넓이", 664, 200, { s: 10.5, w: "700", c: LTc.mute });
        K.t(ctx, "내 답  " + g + " 개", 664, 236, { s: 20, w: "900", c: LTc.ink });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "한반도 몇 개 넓이", min: 1, max: 20, step: 1, value: 1, fmt: function (x) { return x + " 개"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("노란 점선이 두 기간의 평균입니다. " + SRC);
      draw();
      return {
        judge: function () {
          if (Math.abs(g - NK) <= 1) return { ok: true, msg: "(" + EARLY.toFixed(2) + " − " + LATE.toFixed(2) + ") ÷ 0.22 ≈ " + NK.toFixed(1) + " 개 — 한반도 " + Math.round(NK) + "개 넓이의 바다얼음이 9월마다 사라졌습니다." };
          return { ok: false, msg: g + " 개는 " + (g < NK ? "적습니다" : "많습니다") + ". 두 평균의 차이를 0.22로 나누세요." };
        }
      };
    },
    hints: ["두 평균의 차이는 약 2.6 백만 km²입니다.", "2.6 ÷ 0.22 ≈ ?"],
    solution: "약 <b>" + NK.toFixed(0) + " 개</b> (" + (EARLY - LATE).toFixed(2) + " 백만 km² ÷ 0.22).",
    why: "40여 년 만에 한반도 열 개가 넘는 넓이의 여름 바다얼음이 사라졌습니다. 숫자를 익숙한 넓이로 바꾸면 변화의 규모가 실감 납니다. 이 넓이는 북극 생물들에게는 사냥터와 번식지가 사라진 넓이이기도 합니다.<br>"
      + "지질 시대의 대멸종도 대부분 기후와 환경이 빠르게 바뀐 때 일어났습니다. 지금의 변화가 지질 시대의 변화보다 훨씬 빠르다는 점에서, 과학자들은 생물다양성에 주는 영향을 걱정하고 있습니다."
  }
  ]
});
})();
