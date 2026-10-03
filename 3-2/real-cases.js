/* 통합과학2 Ⅲ 과학 기술의 발전과 쟁점 — 실제 자료
   r1 겨울 딸기 온실의 햇빛 — 12월에 땅에 닿는 햇빛은 6월의 몇 %
   r2 가장 흐린 달 — 맑은 날 기준에 비해 햇빛이 가장 많이 가려지는 달
   자료: data/seoul-sun.js (NASA POWER 서울 일사량 2001 ~ 2024) */
(function () {
"use strict";
var S = window.REAL_SUN || { monthly: [] };
var NY = {}; S.monthly.forEach(function (r) { NY[r[0]] = 1; });
function mavg(m, i) { var a = S.monthly.filter(function (r) { return r[1] === m && r[i] != null && r[i] >= 0; }); return a.length ? a.reduce(function (s, r) { return s + r[i]; }, 0) / a.length : 0; }
var ALL = [], CLR = [];
for (var m = 1; m <= 12; m++) { ALL.push(mavg(m, 2)); CLR.push(mavg(m, 3)); }
var PCT = ALL[5] ? ALL[11] / ALL[5] * 100 : 40;
var CL = 0; for (var k = 1; k < 12; k++) if (ALL[k] / CLR[k] < ALL[CL] / CLR[CL]) CL = k;
var SRC = "<small>출처: 미국 항공우주국(NASA) POWER 자료 서비스 — 서울(북위 37.57°, 동경 126.98°) 수평면에 하루 동안 닿은 햇빛 에너지(kWh/m²/일)의 달 평균을 2001 ~ 2024년 " + Object.keys(NY).length + "해로 평균. 짙은 막대는 구름까지 포함한 실제 값, 옅은 막대는 구름이 없다고 친 값입니다. 사본은 data/seoul-sun.js.</small>";
var MN = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function chart(H, ctx, W, CH, pick) {
  H.paper(ctx, W, CH);
  var x0 = 60, x1 = 600, y0 = 26, y1 = CH - 36, bw = (x1 - x0) / 12;
  function Y(v) { return y1 - v / 28 * (y1 - y0); }
  H.axes(ctx, x0, y0, x1, y1);
  [0, 10, 20].forEach(function (v) { H.text(ctx, v, x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
  for (var i = 0; i < 12; i++) {
    var x = x0 + i * bw;
    H.box(ctx, x + 6, Y(CLR[i]), bw - 12, y1 - Y(CLR[i]), H.v("--amber-700"), 0.25);
    H.box(ctx, x + 6, Y(ALL[i]), bw - 12, y1 - Y(ALL[i]), H.v("--amber-700"), pick === i ? 1 : 0.75);
    H.text(ctx, MN[i], x + bw / 2, y1 + 15, { s: 10, a: "center", c: pick === i ? H.v("--ink") : H.v("--mist") });
  }
  H.text(ctx, "하루에 땅 1 m² 에 닿는 햇빛 (kWh) — 짙은: 실제, 옅은: 구름 없을 때", x0 + 6, y0 - 10, { s: 11, w: "700", c: H.v("--mist") });
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 스마트 온실의 센서·장치를 어떻게 정할지 근거를 들어 설명해 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 일사량", title: "겨울 딸기 온실의 햇빛", short: "12월의 햇빛",
    who: "🍓", name: "할머니의 딸기 온실",
    say: "“딸기는 겨울에 열매를 맺는데, 겨울에는 햇빛이 모자라 보광등을 켜는 농가도 있어요. 서울의 <b>실제 일사량</b> 자료로, <b>12월</b>에 땅에 닿는 햇빛이 <b>6월</b>의 <b>몇 %</b> 인지 구해 주세요(짙은 막대, 구름 포함).”",
    predict: {
      q: "겨울에 땅에 닿는 햇빛이 적은 가장 큰 까닭은 무엇일까요?",
      options: ["㉠ 지구가 태양에서 멀어져서", "㉡ 태양의 고도가 낮고 낮의 길이가 짧아서", "㉢ 겨울에는 늘 흐려서"],
      answer: 1
    },
    task: "12월 ÷ 6월 × 100 을 슬라이더로 맞추세요(± 3%).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, g = 50;
      function draw() {
        chart(H, ctx, W, cv.H, null);
        H.rows(ctx, 640, 30, [["6월 (실제)", ALL[5].toFixed(2) + " kWh/m²"], ["12월 (실제)", ALL[11].toFixed(2) + " kWh/m²"], ["내 답 (6월의 몇 %)", g + "%", null, true]], 62);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "12월은 6월의 몇 %", min: 0, max: 100, step: 1, value: 50, fmt: function (x) { return x + "%"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("1 kWh 는 1 kW 전열기를 한 시간 켠 에너지입니다. " + SRC
        + "<div data-link='{\"id\":\"power-dav\",\"title\":\"NASA POWER 자료 보기\",\"src\":\"미국 항공우주국\",\"url\":\"https://power.larc.nasa.gov/data-access-viewer/\",\"ask\":\"지도에서 우리 학교(또는 가까운 딸기 농가) 위치를 찍고 달마다의 일사량(ALLSKY_SFC_SW_DWN)을 찾아, 12월과 6월 값을 서울과 비교해 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(g - PCT) <= 3) return { ok: true, msg: ALL[11].toFixed(2) + " ÷ " + ALL[5].toFixed(2) + " × 100 ≈ " + PCT.toFixed(0) + "% — 겨울 햇빛은 여름의 절반에도 못 미칩니다." };
          return { ok: false, msg: g + "% 는 " + (g < PCT ? "작습니다" : "큽니다") + ". 12월 값을 6월 값으로 나누세요." };
        }
      };
    },
    hints: ["오른쪽 판의 두 값을 쓰세요.", ALL[11].toFixed(2) + " ÷ " + ALL[5].toFixed(2) + " × 100 ≈ ?"],
    solution: "약 <b>" + Math.round(PCT) + "%</b>.",
    why: "서울에서 한낮의 태양 고도는 하지 무렵 약 76°, 동지 무렵 약 29° 입니다. 고도가 낮으면 같은 햇빛이 넓은 땅에 퍼지고 공기를 더 길게 지나며 약해지고, 낮의 길이도 짧아요. 지구는 오히려 1월 초에 태양에 가장 가깝습니다.<br>"
      + "그래서 겨울 온실은 햇빛을 최대한 받도록 비닐을 깨끗이 하고, 흐린 날에는 보광등을, 밤에는 보온을 씁니다. 스마트 온실의 조도 센서는 ‘햇빛이 얼마나 모자란지’를 재어 이런 장치를 켜고 끄는 근거가 돼요."
  },
  {
    id: "r2", tag: "실제 자료 · 구름", title: "가장 흐린 달", short: "흐린 달",
    who: "☁️", name: "온실 센서 설계팀",
    say: "“구름이 없다면 받을 햇빛(옅은 막대)에 비해 실제로 받은 햇빛(짙은 막대)이 <b>가장 적은 비율</b>인 달을 찾아 주세요. 그달에 온실의 햇빛 센서가 가장 바빠질 거예요. 그리고 그 까닭을 골라 주세요.”",
    predict: {
      q: "햇빛이 가장 센 계절과 땅에 닿는 햇빛이 가장 많은 달은 늘 같을까요?",
      options: ["㉠ 늘 같다", "㉡ 다를 수 있다 — 구름이 많은 달은 햇빛이 가려진다", "㉢ 구름은 햇빛과 상관없다"],
      answer: 1
    },
    task: "실제 ÷ 구름 없을 때 비율이 가장 작은 달을 고르고, 그 까닭을 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, i = 0, why = "none";
      function draw() {
        chart(H, ctx, W, cv.H, i);
        H.rows(ctx, 640, 30, [["고른 달", MN[i], "--amber-700"], ["실제 · 구름 없을 때", ALL[i].toFixed(1) + " · " + CLR[i].toFixed(1)], ["실제 ÷ 구름 없을 때", (ALL[i] / CLR[i] * 100).toFixed(0) + "%", null, true]], 62);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "달", min: 0, max: 11, step: 1, value: 0, fmt: function (x) { return MN[x]; }, onInput: function (x) { i = x; api.changed(); draw(); } });
      api.seg({ label: "그달이 흐린 까닭", value: "none", options: [{ v: "rain", t: "장마 전선이 머물러서" }, { v: "snow", t: "눈이 많이 와서" }, { v: "dust", t: "황사가 와서" }], onPick: function (x) { why = x; api.changed(); } });
      api.info(SRC);
      draw();
      return {
        judge: function () {
          if (i !== CL) return { ok: false, msg: MN[i] + " 은 " + (ALL[i] / CLR[i] * 100).toFixed(0) + "% 입니다. 더 많이 가려지는 달이 있어요." };
          if (why !== "rain") return { ok: false, msg: "달은 맞았습니다. 그달 우리나라에 오래 머무는 것은 무엇일까요?" };
          return { ok: true, msg: MN[CL] + " — 구름이 없을 때의 " + (ALL[CL] / CLR[CL] * 100).toFixed(0) + "% 만 땅에 닿습니다. 장마 때문에 6월보다 햇빛이 크게 줄어요." };
        }
      };
    },
    hints: ["짙은 막대와 옅은 막대의 차이가 가장 큰 달을 찾으세요.", "여름 한가운데, 비가 가장 많이 오는 달입니다."],
    solution: "<b>" + MN[CL] + "</b>, 장마 전선 때문.",
    why: "우리나라는 6월 말 ~ 7월에 장마 전선이 머물러 구름과 비가 많습니다. 그래서 낮이 가장 긴 하지(6월) 무렵보다 7월에 땅에 닿는 햇빛이 오히려 적어요. 태양광 발전량이 5월에 가장 많은 것도 같은 까닭입니다.<br>"
      + "스마트 온실을 설계할 때 ‘평균’만 보지 말고, 이렇게 햇빛이 가장 모자란 달과 가장 남는 달(차광이 필요한 때)을 함께 따져야 장치가 실제 상황에 맞게 움직입니다."
  }
  ]
});
})();
