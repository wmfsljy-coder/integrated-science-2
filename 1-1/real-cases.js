/* 통합과학2 Ⅰ-1 지구 환경 변화와 생물다양성 — 실제 자료
   r1 북극 바다얼음은 얼마나 빨리 줄고 있나 — 9월 해빙 면적의 추세(10년마다)
   r2 줄어든 얼음은 한반도 몇 개 넓이일까 — 서식지가 사라지는 규모
   자료: data/seaice-sep.js (NSIDC Sea Ice Index v4, NOAA/NSIDC) */
(function () {
"use strict";
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

function chart(H, ctx, W, CH, slope, showFit) {
  H.paper(ctx, W, CH);
  var x0 = 60, x1 = 640, y0 = 24, y1 = CH - 36;
  function X(y) { return x0 + (y - 1978) / (2027 - 1978) * (x1 - x0); }
  function Y(v) { return y1 - (v - 2) / 7 * (y1 - y0); }
  H.axes(ctx, x0, y0, x1, y1);
  [3, 5, 7, 9].forEach(function (v) { H.text(ctx, v, x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  [1980, 1990, 2000, 2010, 2020].forEach(function (y) { H.text(ctx, y, X(y), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
  H.text(ctx, "9월 북극 해빙 면적 (백만 km²)", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
  S.forEach(function (r) { H.dot(ctx, X(r[0]), Y(r[1]), 3.6, r[0] === 2012 ? H.v("--rose-700") : H.v("--brand")); });
  if (showFit) {
    var my = mean(S.map(function (r) { return r[1]; })), mx = mean(S.map(function (r) { return r[0]; }));
    H.line(ctx, [[X(1979), Y(my + slope / 10 * (1979 - mx))], [X(2026), Y(my + slope / 10 * (2026 - mx))]], H.v("--amber-700"), 2.5);
  }
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 환경 변화가 생물다양성에 주는 영향을 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 북극 해빙", title: "북극 바다얼음은 얼마나 빨리 줄고 있나", short: "해빙 추세",
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
        H.rows(ctx, 680, 40, [["내 기울기 (백만 km²)", sl.toFixed(2) + " / 10년", null, true], ["= 1981~2010 평균의", (sl / BASE * 100).toFixed(1) + " % / 10년"], ["점과 선의 평균 거리", err(sl).toFixed(3)], ["빨간 점", "2012년 (가장 작았던 해)"]], 52);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "10년마다 변한 넓이", min: -1.5, max: 0.5, step: 0.05, value: 0, fmt: function (x) { return x.toFixed(2) + " 백만 km²"; }, onInput: function (x) { sl = x; api.changed(); draw(); } });
      api.info("‘점과 선의 평균 거리’가 가장 작아지는 기울기를 찾으세요. " + SRC
        + "<div data-link='{\"id\":\"nsidc-news\",\"title\":\"NSIDC 북극 해빙 소식\",\"src\":\"미국 국립 설빙자료센터\",\"url\":\"https://nsidc.org/arcticseaicenews/\",\"ask\":\"올해 북극 해빙이 가장 작았던 날의 면적과, 그것이 관측 이래 몇 번째로 작은지 찾아 오세요.\"}'></div>");
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
    id: "r2", tag: "실제 자료 · 서식지의 규모", title: "사라진 얼음은 한반도 몇 개 넓이일까", short: "한반도 몇 개",
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
        var p = chart(H, ctx, W, cv.H, 0, false);
        H.dash(ctx, p.X(1979), p.Y(EARLY), p.X(1988), p.Y(EARLY), H.v("--amber-700"), 3);
        H.dash(ctx, p.X(2015), p.Y(LATE), p.X(2024), p.Y(LATE), H.v("--amber-700"), 3);
        H.rows(ctx, 680, 40, [["1979~1988 평균", EARLY.toFixed(2) + " 백만 km²"], ["2015~2024 평균", LATE.toFixed(2) + " 백만 km²"], ["한반도", "0.22 백만 km²"], ["내 답", g + " 개", null, true]], 52);
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
