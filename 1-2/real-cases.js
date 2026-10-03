/* 통합과학2 Ⅰ-2 화학 변화 — 실제 자료
   r1 바다는 산성으로 가고 있을까 — 하와이 스테이션 ALOHA 표층 pH 의 10년 추세
   r2 pH 0.07 은 작은 변화일까 — 수소 이온 농도는 몇 % 늘었나
   자료: data/hot-ph.js (하와이 해양 시계열 관측 HOT, Dore 외 2009 PNAS) */
(function () {
"use strict";
var R = (window.REAL_HOTPH || { rows: [] }).rows;                   /* [연도, pH, pCO2] */
function mean(a) { return a.reduce(function (s, x) { return s + x; }, 0) / (a.length || 1); }
var FIT = (function () { var x = R.map(function (r) { return r[0]; }), y = R.map(function (r) { return r[1]; }), mx = mean(x), my = mean(y), b = 0, q = 0; x.forEach(function (v, i) { b += (v - mx) * (y[i] - my); q += (v - mx) * (v - mx); }); b /= q; return { b: b, mx: mx, my: my }; })();
var DEC = FIT.b * 10, Y0 = 1989, Y1 = 2024;
var P0 = FIT.my + FIT.b * (Y0 - FIT.mx), P1 = FIT.my + FIT.b * (Y1 - FIT.mx), DH = (Math.pow(10, P0 - P1) - 1) * 100;
var SRC = "<small>출처: 하와이 해양 시계열 관측(HOT), 스테이션 ALOHA(북위 22.75°, 서경 158°) 표층 바닷물의 이산화 탄소 계열 자료(현장 수온에서 계산한 pH, 이산화 탄소 분압), 1988 ~ 2024. Dore, Lukas, Sadler, Church & Karl (2009), PNAS 106:12235. 사본은 data/hot-ph.js.</small>";

function chart(H, ctx, W, CH, slope, what) {
  H.paper(ctx, W, CH);
  var x0 = 70, x1 = 640, y0 = 24, y1 = CH - 36;
  function X(y) { return x0 + (y - 1988) / (2026 - 1988) * (x1 - x0); }
  var lo = what === "c" ? 290 : 8.00, hi = what === "c" ? 440 : 8.16;
  function Y(v) { return y1 - (v - lo) / (hi - lo) * (y1 - y0); }
  H.axes(ctx, x0, y0, x1, y1);
  (what === "c" ? [300, 340, 380, 420] : [8.00, 8.04, 8.08, 8.12, 8.16]).forEach(function (v) { H.text(ctx, what === "c" ? v : v.toFixed(2), x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  [1990, 2000, 2010, 2020].forEach(function (y) { H.text(ctx, y, X(y), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
  H.text(ctx, what === "c" ? "바닷물의 이산화 탄소 분압 (μatm, 녹은 이산화 탄소의 양)" : "표층 바닷물의 pH", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
  R.forEach(function (r) { H.dot(ctx, X(r[0]), Y(what === "c" ? r[2] : r[1]), 2.8, H.v(what === "c" ? "--coral-700" : "--brand")); });
  if (slope != null && what !== "c") H.line(ctx, [[X(1988.8), Y(FIT.my + slope / 10 * (1988.8 - FIT.mx))], [X(2025), Y(FIT.my + slope / 10 * (2025 - FIT.mx))]], H.v("--amber-700"), 2.5);
  return { X: X, Y: Y };
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 산과 염기, pH 의 뜻을 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 해양 산성화", title: "바다는 산성으로 가고 있을까", short: "바다의 pH",
    who: "🌊", name: "해양 관측선",
    say: "“하와이 북쪽 먼바다의 스테이션 ALOHA 에서 1988년부터 거의 달마다 배를 띄워 표층 바닷물을 떠 왔어요. 아래는 그 바닷물의 <b>pH</b> 입니다. 직선을 맞춰 <b>10년마다 pH 가 얼마나 변했는지</b> 구해 주세요. ‘이산화 탄소’ 보기도 눌러 보세요.”",
    predict: {
      q: "공기 중 이산화 탄소가 늘면 바닷물의 pH 는?",
      options: ["㉠ 올라간다(염기성 쪽으로)", "㉡ 내려간다(산성 쪽으로)", "㉢ 바다는 넓어서 변하지 않는다"],
      answer: 1
    },
    task: "직선의 기울기(10년마다 pH 변화)를 맞추세요(± 0.004).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, sl = 0, what = "p";
      function err(m) { return Math.sqrt(mean(R.map(function (r) { var e = r[1] - (FIT.my + m / 10 * (r[0] - FIT.mx)); return e * e; }))); }
      function draw() {
        chart(H, ctx, W, cv.H, what === "p" ? sl : null, what);
        H.rows(ctx, 680, 50, [["내 기울기", (sl >= 0 ? "+" : "") + sl.toFixed(3) + " / 10년", null, true], ["점과 선의 평균 거리", err(sl).toFixed(4)], ["측정한 날", R.length + " 번"]], 60);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "보기", value: "p", options: [{ v: "p", t: "pH" }, { v: "c", t: "바닷물 속 이산화 탄소" }], onPick: function (x) { what = x; draw(); } });
      api.slider({ label: "10년마다 pH 변화", min: -0.06, max: 0.02, step: 0.001, value: 0, fmt: function (x) { return (x >= 0 ? "+" : "") + x.toFixed(3); }, onInput: function (x) { sl = x; api.changed(); draw(); } });
      api.info("점들이 계절에 따라 위아래로 출렁이지만, 긴 흐름을 보세요. " + SRC
        + "<div data-map='{\"id\":\"aloha\",\"name\":\"스테이션 ALOHA (하와이 북쪽 먼바다)\",\"lat\":22.75,\"lng\":-158.0,\"zoom\":6,\"ask\":\"관측 지점은 오아후섬에서 북쪽으로 약 100 km 떨어진 먼바다입니다. 육지에서 멀리 떨어진 곳을 고른 까닭을 짐작해 적어 보세요.\"}'></div>"
        + "<div data-link='{\"id\":\"noaa-oa\",\"title\":\"NOAA — 해양 산성화란?\",\"src\":\"미국 해양대기청\",\"url\":\"https://www.noaa.gov/education/resource-collections/ocean-coasts/ocean-acidification\",\"ask\":\"산업 혁명 이후 바다 표층의 pH 가 얼마나 내려갔다고 하는지 찾아, 이 사례의 값과 비교해 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(sl - DEC) <= 0.004) return { ok: true, msg: "가장 잘 맞는 기울기는 10년마다 약 " + DEC.toFixed(3) + " — 바다가 조금씩 산성 쪽으로 가고 있습니다." };
          return { ok: false, msg: (sl >= 0 ? "+" : "") + sl.toFixed(3) + " 는 " + (sl > DEC ? "너무 완만합니다(또는 방향이 반대)" : "너무 가파릅니다") + "." };
        }
      };
    },
    hints: ["1989년 무렵 약 8.12, 2024년 무렵 약 8.05 입니다.", "35년에 약 0.07 → 10년에 약 0.02 내려갔습니다."],
    solution: "10년마다 약 <b>" + DEC.toFixed(3) + "</b>.",
    why: "공기 중 이산화 탄소가 바닷물에 녹으면 물과 반응해 탄산이 되고, 탄산이 수소 이온(H⁺)을 내놓아 pH 가 내려갑니다(CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻). ‘바닷물 속 이산화 탄소’ 보기에서 같은 기간 이산화 탄소 분압이 꾸준히 오른 것이 보여요. 바닷물은 여전히 pH 8 이 넘는 약한 염기성이지만, 산성 쪽으로 움직이고 있어 <b>해양 산성화</b>라고 부릅니다.<br>"
      + "한 해 안에서 계절마다 출렁이는 것은 수온이 바뀌면 같은 바닷물이라도 pH 가 달라지기 때문입니다. 그래서 긴 기간의 자료로 추세를 봐야 합니다."
  },
  {
    id: "r2", tag: "실제 자료 · pH 의 뜻", title: "pH 0.07 은 작은 변화일까", short: "수소 이온 증가",
    who: "🧪", name: "화학 교사",
    say: "“추세선으로 보면 " + Y0 + "년 pH 는 약 " + P0.toFixed(3) + ", " + Y1 + "년은 약 " + P1.toFixed(3) + " 이에요. 차이는 0.07 쯤이라 작아 보이지만, pH 는 <b>수소 이온 농도의 로그 눈금</b>입니다(pH 가 1 내려가면 수소 이온이 10배). 그동안 바닷물의 <b>수소 이온 농도가 몇 % 늘었는지</b> 구해 주세요.”",
    predict: {
      q: "pH 가 0.07 내려가면 수소 이온 농도는 대략?",
      options: ["㉠ 0.07% 늘어난다", "㉡ 약 7% 늘어난다", "㉢ 약 17% 늘어난다"],
      answer: 2
    },
    task: "10^(pH 차이) 를 계산해 수소 이온이 몇 % 늘었는지 슬라이더로 맞추세요(± 2 %).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, g = 0;
      function draw() {
        var p = chart(H, ctx, W, cv.H, DEC, "p");
        H.dot(ctx, p.X(Y0), p.Y(P0), 6, H.v("--amber-700")); H.dot(ctx, p.X(Y1), p.Y(P1), 6, H.v("--amber-700"));
        H.rows(ctx, 680, 40, [[Y0 + "년 (추세)", "pH " + P0.toFixed(3)], [Y1 + "년 (추세)", "pH " + P1.toFixed(3)], ["pH 차이", (P0 - P1).toFixed(3)], ["내 답 (수소 이온)", "+" + g + " %", null, true]], 52);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "수소 이온 농도가 늘어난 비율", min: 0, max: 60, step: 1, value: 0, fmt: function (x) { return "+" + x + " %"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("[H⁺] = 10^(−pH). 나중 ÷ 처음 = 10^(처음 pH − 나중 pH). 계산기의 10ˣ 단추를 쓰세요. " + SRC);
      draw();
      return {
        judge: function () {
          if (Math.abs(g - DH) <= 2) return { ok: true, msg: "10^" + (P0 - P1).toFixed(3) + " ≈ " + (1 + DH / 100).toFixed(3) + " — 35년 사이 수소 이온이 약 " + DH.toFixed(0) + "% 늘었습니다." };
          if (Math.abs(g - (P0 - P1) * 100) <= 2) return { ok: false, msg: "pH 차이를 그대로 % 로 바꾸면 안 됩니다. pH 는 로그 눈금이라 10^(차이) 를 계산해야 해요." };
          return { ok: false, msg: "+" + g + "% 는 " + (g < DH ? "작습니다" : "큽니다") + ". 10^(pH 차이) − 1 을 % 로 바꾸세요." };
        }
      };
    },
    hints: ["pH 차이 ≈ " + (P0 - P1).toFixed(2) + " 입니다.", "10^0.05 ≈ 1.12, 10^0.07 ≈ 1.17, 10^0.1 ≈ 1.26 — 10^" + (P0 - P1).toFixed(2) + " 는?"],
    solution: "10^" + (P0 - P1).toFixed(3) + " ≈ " + (1 + DH / 100).toFixed(2) + " → <b>약 " + DH.toFixed(0) + "% 증가</b>.",
    why: "pH 는 수소 이온 농도에 로그를 취한 값이라, 작은 숫자 변화가 큰 농도 변화를 뜻합니다. 산업 혁명 이후 바다 표층의 pH 는 약 0.1 내려갔는데, 이는 수소 이온이 약 26% 늘었다는 뜻이에요(실제로는 0.1 보다 조금 더 내려가 ‘약 30%’라고 쓰는 자료도 많습니다).<br>"
      + "수소 이온이 늘면 바닷물의 탄산 이온(CO₃²⁻)이 줄어, 조개·산호·플랑크톤이 탄산 칼슘 껍데기와 뼈대를 만들기 어려워집니다. 산과 염기의 반응이 바다 생태계에도 영향을 주는 예입니다."
  }
  ]
});
})();
