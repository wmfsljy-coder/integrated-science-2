/* 통합과학2 Ⅱ-1 생태계와 환경 변화 — 실제 자료
   r1 킬링 곡선: 최근 10년 속도가 이어지면 2050년의 이산화 탄소 농도는?
   r2 이산화 탄소 농도와 지구 평균 기온 — 100 ppm 마다 몇 °C?
   자료: data/co2-mlo.js (NOAA 지구감시연구소, 마우나로아), data/gistemp.js (NASA GISTEMP v4) — 공공 영역 */
(function () {
"use strict";
var AN = (window.REAL_CO2 || { annual: [] }).annual;          /* [연도, 연평균 ppm] */
var GT = (window.REAL_GISTEMP || { rows: [] }).rows;          /* [연도, 1951~1980 평균 대비 기온 편차 °C] */
function co2(y) { for (var i = 0; i < AN.length; i++) if (AN[i][0] === y) return AN[i][1]; return null; }
var Y0 = AN.length ? AN[0][0] : 1959, YL = AN.length ? AN[AN.length - 1][0] : 2025;
var RATE = (co2(YL) - co2(YL - 10)) / 10, PROJ = co2(YL) + (2050 - YL) * RATE;
var PAIRS = AN.map(function (a) { var g = null; GT.forEach(function (r) { if (r[0] === a[0]) g = r[1]; }); return g == null ? null : [a[1], g, a[0]]; }).filter(function (p) { return p; });
var FIT = (function () { var n = PAIRS.length, sx = 0, sy = 0, sxx = 0, sxy = 0; PAIRS.forEach(function (p) { sx += p[0]; sy += p[1]; sxx += p[0] * p[0]; sxy += p[0] * p[1]; }); var m = (n * sxy - sx * sy) / (n * sxx - sx * sx); return { m: m, b: (sy - m * sx) / n }; })();
var SRC1 = "<small>출처: 미국 해양대기청(NOAA) 지구감시연구소 GML, 마우나로아 관측소 이산화 탄소 연평균(" + Y0 + " ~ " + YL + "). 사본은 이 단원의 data/co2-mlo.js.</small>";
var SRC2 = "<small>출처: NASA 고다드 우주연구소 GISTEMP v4 전 지구 육지·해양 연평균 기온 편차(1951 ~ 1980 평균 기준), NOAA 마우나로아 이산화 탄소. 사본은 data/gistemp.js, data/co2-mlo.js.</small>";

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료가 보여 준 변화와 우리가 할 일을 적어 보세요.",
  cases: [
  {
    id: "r1", tag: "실제 자료 · 킬링 곡선", title: "2050년의 이산화 탄소 농도", short: "2050년 예상",
    who: "🌋", name: "마우나로아 관측소",
    say: "“1958년부터 하와이 마우나로아 산 위에서 공기 속 이산화 탄소를 재 왔어요. 아래는 " + Y0 + " ~ " + YL + "년의 <b>실제 연평균</b>입니다. <b>최근 10년(" + (YL - 10) + " ~ " + YL + ")의 증가 속도</b>가 그대로 이어진다면 <b>2050년</b>에는 몇 ppm 이 될지 예상해 주세요.”",
    predict: {
      q: "이산화 탄소가 늘어나는 속도는 어떻게 변해 왔을까요?",
      options: ["㉠ 해마다 같은 양씩 일정하게 늘었다", "㉡ 점점 더 빨리 늘고 있다", "㉢ 요즘은 줄어들기 시작했다"],
      answer: 1
    },
    task: "그래프를 읽고 최근 10년의 한 해 증가량을 구해, <b>2050년 예상 농도</b>를 슬라이더로 맞추세요(± 4 ppm).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, p = 440;
      var x0 = 60, x1 = 640, y0 = 20, y1 = 240;
      function X(y) { return x0 + (y - 1955) / (2055 - 1955) * (x1 - x0); }
      function Y(c) { return y1 - (c - 300) / 220 * (y1 - y0); }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [300, 350, 400, 450, 500].forEach(function (c) { H.text(ctx, c, x0 - 8, Y(c) + 4, { s: 10, a: "right", c: H.v("--mist") }); H.dash(ctx, x0, Y(c), x1, Y(c), H.v("--line"), 0.6); });
        [1960, 1980, 2000, 2020, 2050].forEach(function (y) { H.text(ctx, y, X(y), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
        H.text(ctx, "ppm", x0 + 6, y0 - 6, { s: 11, w: "700", c: H.v("--mist") });
        H.line(ctx, AN.map(function (a) { return [X(a[0]), Y(a[1])]; }), H.v("--brand"), 2.5);
        H.dash(ctx, X(YL), Y(co2(YL)), X(2050), Y(p), H.v("--coral-700"), 2);
        H.dot(ctx, X(2050), Y(p), 7, H.v("--coral-700"));
        H.rows(ctx, 680, 40, [[YL + "년", co2(YL).toFixed(1) + " ppm"], [(YL - 10) + "년", co2(YL - 10).toFixed(1) + " ppm"], ["1959 ~ 1969 한 해 증가", ((co2(1969) - co2(1959)) / 10).toFixed(2) + " ppm"], ["내 2050년 예상", p + " ppm", "--coral-700", true]], 52);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "2050년 예상 농도", min: 420, max: 540, step: 1, value: 440, fmt: function (x) { return x + " ppm"; }, onInput: function (x) { p = x; api.changed(); draw(); } });
      api.info("한 해 증가량 = (나중 값 − 처음 값) ÷ 햇수. 예상 = " + YL + "년 값 + 증가량 × 남은 햇수. " + SRC1
        + "<div data-link='{\"id\":\"gml-trends\",\"title\":\"마우나로아 이산화 탄소 최신 그래프\",\"src\":\"NOAA 지구감시연구소\",\"url\":\"https://gml.noaa.gov/ccgg/trends/\",\"ask\":\"가장 최근 달의 월평균 농도(ppm)와 그 달을 찾아 오세요.\"}'></div>"
        + "<div data-map='{\"id\":\"mlo\",\"name\":\"마우나로아 관측소\",\"lat\":19.536,\"lng\":-155.576,\"zoom\":14,\"ask\":\"관측소 둘레에 무엇이 있나요? 도시·숲·공장과 멀리 떨어진 해발 3,400 m 화산 비탈에서 재는 까닭을 한 문장으로 적어 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(p - PROJ) <= 4) return { ok: true, msg: "최근 10년 한 해 " + RATE.toFixed(2) + " ppm 씩 → " + co2(YL).toFixed(1) + " + " + RATE.toFixed(2) + " × " + (2050 - YL) + " ≈ " + PROJ.toFixed(0) + " ppm 입니다." };
          var all = co2(YL) + (2050 - YL) * (co2(YL) - co2(Y0)) / (YL - Y0);
          if (Math.abs(p - all) <= 4) return { ok: false, msg: "전체 기간의 평균 속도를 썼네요. 최근 10년은 그보다 훨씬 빠릅니다." };
          return { ok: false, msg: p + " ppm 은 " + (p < PROJ ? "낮습니다" : "높습니다") + ". 먼저 최근 10년의 한 해 증가량을 구하세요." };
        }
      };
    },
    hints: ["(" + YL + "년 값 − " + (YL - 10) + "년 값) ÷ 10 = 한 해 증가량", "그 증가량에 " + (2050 - YL) + "(년)을 곱해 " + YL + "년 값에 더하세요."],
    solution: "한 해 약 " + RATE.toFixed(2) + " ppm × " + (2050 - YL) + "년 → <b>약 " + PROJ.toFixed(0) + " ppm</b>.",
    why: "1960년대에는 한 해 1 ppm 남짓 늘던 이산화 탄소가 요즘은 한 해 2.5 ppm 넘게 늘고 있습니다. 화석 연료를 태우는 양이 늘었기 때문이에요. 산업 혁명 전(약 280 ppm)과 비교하면 이미 1.5 배를 넘었습니다.<br>"
      + "다만 이 예상은 ‘지금 속도가 그대로’라는 가정 위의 값입니다. 배출을 줄이면 곡선은 꺾이고, 더 늘리면 더 가팔라집니다. 미래는 그래프가 아니라 우리의 선택이 정해요."
  },
  {
    id: "r2", tag: "실제 자료 · 기온과 이산화 탄소", title: "100 ppm 마다 지구는 몇 °C 따뜻해졌나", short: "기온 기울기",
    who: "🌡️", name: "기후 자료 분석실",
    say: "“점 하나가 한 해입니다. 가로는 그해의 이산화 탄소 농도, 세로는 지구 평균 기온 편차(1951 ~ 1980 평균보다 몇 °C 높은지)예요. 점들을 가장 잘 지나는 직선을 그려, <b>이산화 탄소가 100 ppm 늘 때 기온이 몇 °C 올랐는지</b> 구해 주세요.”",
    predict: {
      q: "두 값이 함께 오른다는 것만으로 ‘이산화 탄소가 기온을 올렸다’고 말할 수 있을까요?",
      options: ["㉠ 함께 오르면 그것으로 충분한 증거다", "㉡ 함께 오르는 것은 단서이고, 온실 효과라는 원리와 다른 증거가 있어야 원인이라 말할 수 있다", "㉢ 두 값은 아무 관계가 없다"],
      answer: 1
    },
    task: "직선의 기울기를 바꿔 점들을 가장 잘 지나게 하세요(100 ppm 당 °C, ± 0.1).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(290), ctx = cv.ctx, W = cv.W, m = 0.5;
      var x0 = 60, x1 = 600, y0 = 20, y1 = 250;
      function X(c) { return x0 + (c - 310) / 125 * (x1 - x0); }
      function Y(t) { return y1 - (t + 0.4) / 1.8 * (y1 - y0); }
      function resid(mm) { var cx = 0, cy = 0; PAIRS.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= PAIRS.length; cy /= PAIRS.length; var s = 0; PAIRS.forEach(function (p) { var e = p[1] - (cy + mm / 100 * (p[0] - cx)); s += e * e; }); return { r: Math.sqrt(s / PAIRS.length), cx: cx, cy: cy }; }
      function draw() {
        H.paper(ctx, W, cv.H); H.axes(ctx, x0, y0, x1, y1);
        [-0.2, 0, 0.4, 0.8, 1.2].forEach(function (t) { H.text(ctx, (t > 0 ? "+" : "") + t.toFixed(1), x0 - 8, Y(t) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        [320, 360, 400, 430].forEach(function (c) { H.text(ctx, c + " ppm", X(c), y1 + 15, { s: 10, a: "center", c: H.v("--mist") }); });
        H.text(ctx, "기온 편차 (°C)", x0 + 6, y0 - 6, { s: 11, w: "700", c: H.v("--mist") });
        PAIRS.forEach(function (p) { H.dot(ctx, X(p[0]), Y(p[1]), 3.2, p[2] >= 2015 ? H.v("--coral-700") : H.v("--brand")); });
        var r = resid(m);
        H.line(ctx, [[X(312), Y(r.cy + m / 100 * (312 - r.cx))], [X(432), Y(r.cy + m / 100 * (432 - r.cx))]], H.v("--amber-700"), 2.5);
        H.rows(ctx, 640, 40, [["내 기울기", m.toFixed(2) + " °C / 100 ppm", null, true], ["점과 선의 평균 거리", r.r.toFixed(3) + " °C", r.r < resid(FIT.m * 100).r + 0.003 ? "--green-700" : "--mist"], ["빨간 점", "2015년 이후"]], 58);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "직선의 기울기", min: 0, max: 2, step: 0.05, value: 0.5, fmt: function (x) { return x.toFixed(2) + " °C / 100 ppm"; }, onInput: function (x) { m = x; api.changed(); draw(); } });
      api.info("‘점과 선의 평균 거리’가 가장 작아지는 기울기를 찾으세요. " + SRC2
        + "<div data-link='{\"id\":\"gistemp\",\"title\":\"NASA GISTEMP 지구 기온 자료\",\"src\":\"NASA 고다드 우주연구소\",\"url\":\"https://data.giss.nasa.gov/gistemp/\",\"ask\":\"가장 최근 해의 전 지구 기온 편차(°C)를 찾아, 이 그래프의 마지막 점과 비교해 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var t = FIT.m * 100;
          if (Math.abs(m - t) <= 0.1) return { ok: true, msg: PAIRS.length + "년치 자료의 가장 잘 맞는 기울기는 약 " + t.toFixed(2) + " °C / 100 ppm 입니다." };
          return { ok: false, msg: m.toFixed(2) + " 는 " + (m < t ? "너무 완만합니다" : "너무 가파릅니다") + ". 평균 거리가 더 작아지는 쪽으로 옮겨 보세요." };
        }
      };
    },
    hints: ["기울기를 0.05 씩 바꾸며 ‘평균 거리’ 숫자를 보세요.", "1 °C 근처에서 가장 작아집니다."],
    solution: "약 <b>" + (FIT.m * 100).toFixed(2) + " °C / 100 ppm</b> (" + (FIT.m * 100 - 0.1).toFixed(2) + " ~ " + (FIT.m * 100 + 0.1).toFixed(2) + ").",
    why: "지난 60여 년 동안 이산화 탄소가 100 ppm 늘 때마다 지구 평균 기온은 약 1 °C 올랐습니다. 두 값이 함께 오른다는 것(<b>상관</b>)만으로는 원인을 단정할 수 없지만, 이산화 탄소가 지표가 내는 적외선을 흡수한다는 실험실 측정(온실 효과), 위성으로 잰 지구 복사의 변화, 밤 기온이 낮 기온보다 더 빨리 오르는 현상 같은 여러 증거가 같은 방향을 가리켜 과학자들은 원인으로 결론 내렸습니다.<br>"
      + "점이 직선에서 위아래로 흩어진 것은 엘니뇨·화산 폭발처럼 해마다 달라지는 요인 때문입니다. 한 해의 값보다 긴 기간의 흐름을 보아야 하는 까닭이에요."
  }
  ]
});
})();
