/* 통합과학2 Ⅱ-1 생태계와 환경 변화 — 실제 자료
   r1 킬링 곡선: 최근 10년 속도가 이어지면 2050년의 이산화 탄소 농도는?
   r2 이산화 탄소 농도와 지구 평균 기온 — 100 ppm마다 몇 °C?
   r3 우리 동네 폭염 — 창원기상대 폭염일은 40년 동안 몇 배가 됐나
   자료: data/co2-mlo.js (NOAA 지구감시연구소, 마우나로아), data/gistemp.js (NASA GISTEMP v4) — 공공 영역, data/cw155.js (기상청 창원 155) */
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
var SRC2 = "<small>출처: NASA 고다드 우주연구소 GISTEMP v4 전 지구 육지·해양 연평균 기온 편차(1951~1980 평균 기준), NOAA 마우나로아 이산화 탄소. 사본은 data/gistemp.js, data/co2-mlo.js.</small>";
var CW = (window.REAL_CW155 || { rows: [] }).rows.filter(function (r) { return r[0] >= 1986 && r[0] <= 2025; });   /* [연도, 평균기온, 폭염일, 열대야, 영하일, 강수, 호우일] */
function cwAvg(a, j) { var t = 0; a.forEach(function (r) { t += r[j]; }); return a.length ? t / a.length : 0; }
var CW_Y0 = CW.length ? CW[0][0] : 1986, CW_YL = CW.length ? CW[CW.length - 1][0] : 2025;
var CW_H0 = cwAvg(CW.slice(0, 10), 2), CW_H1 = cwAvg(CW.slice(-10), 2), CW_K = CW_H0 ? CW_H1 / CW_H0 : 0;
var CW_T0 = cwAvg(CW.slice(0, 10), 1), CW_T1 = cwAvg(CW.slice(-10), 1);
var CW_MAX = CW.reduce(function (m, r) { return r[2] > m[2] ? r : m; }, [0, 0, -1]);
var SRC3 = "<small>출처: 기상청 날씨누리 과거 관측 일별 자료, 창원(155) 날마다의 최고 기온으로 해마다 센 값(" + CW_Y0 + " ~ " + CW_YL + "). 사본은 data/cw155.js.</small>";

var K = window.sthKit, LT = K.LT;
function rcl(x, a, b) { return Math.max(a, Math.min(b, x)); }
/* 밝은 스튜디오 + 흰 카드 그래프 틀(왼쪽 0~600) */
function rbase(ctx, W, CH, head, sub) {
  ctx.clearRect(0, 0, W, CH);
  K.studio(ctx, 0, 0, 600, CH, null);
  K.bigText(ctx, head, 16, 34, 20, "#ffffff");
  if (sub) K.bigText(ctx, sub, 16 + Math.min(300, head.length * 17), 32, 13, "#ffd35a");
}
/* 오른쪽 흰 카드와 작은 입체 모형: kind = "mlo"(화산 위 관측소) · "globe"(지구와 온도계) · "city"(뜨거운 도시) */
function rside(ctx, W, CH, kind, title, rows, tip, good) {
  var RX = 612, x0 = RX + 18, x1 = W - 18, i;
  K.card(ctx, RX, 0, W - RX, CH, title);
  if (kind === "mlo") {
    var I = K.iso({ ox: RX + 140, oy: 74, s: 0.5, L: 200, D: 150 });
    I.field(ctx, function (x, y) { var dx = (x - 100) / 70, dy = (y - 75) / 56, r = Math.sqrt(dx * dx + dy * dy); return 8 + 80 * Math.max(0, 1 - r) * Math.max(0, 1 - r * .6); },
      function (x, y, z, lt) { return z > 64 ? K.tint("#8b7d70", lt) : (z > 26 ? K.tint("#6e5a4a", lt) : K.tint("#7a9a55", lt)); }, 26, 20);
    I.box(ctx, 96, 70, 84, 112, 82, 96, "#ffffff", "#e6e9ee", "#b9c0cc");
    for (i = 0; i < 3; i++) { var a = I.P(20 + i * 20, 10, 112), b = I.P(66 + i * 10, 40, 98); K.arrow(ctx, a, b, "#1c7ed6", 1.8, 8); }
  } else if (kind === "globe") {
    var gx = RX + 110, gy = 98; K.earth(ctx, gx, gy, 44);
    ctx.fillStyle = "rgba(255,140,90,.18)"; ctx.beginPath(); ctx.arc(gx, gy, 58, 0, 6.283); ctx.fill();
    for (i = 0; i < 6; i++) { var an = i * 1.05, px = gx + Math.cos(an) * 54, py = gy + Math.sin(an) * 54; K.planet(ctx, px - 5, py, 3, "#ff6b6b", "#7a1f1f"); K.planet(ctx, px, py, 3.4, "#8a92a8", "#2c3140"); K.planet(ctx, px + 5, py, 3, "#ff6b6b", "#7a1f1f"); }
    var tx = W - 60; ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.roundRect(tx - 8, 46, 16, 92, 8); ctx.fill(); ctx.strokeStyle = "rgba(110,130,160,.7)"; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = "#e8590c"; ctx.fillRect(tx - 3, 76, 6, 60); K.planet(ctx, tx, 142, 12, "#ff6b4a", "#7a1f12");
  } else {
    var J = K.iso({ ox: RX + 140, oy: 78, s: 0.45, L: 200, D: 120 });
    J.box(ctx, 0, 0, 0, 200, 120, 10, "#9aa3b0", "#7d8696", "#6b7482");
    [[16, 14, 46], [70, 20, 70], [130, 12, 40], [30, 70, 34], [100, 72, 56], [160, 70, 30]].forEach(function (q) { J.box(ctx, q[0], q[1], 10, q[0] + 34, q[1] + 34, 10 + q[2], "#e9ecf1", "#c9ced6", "#a7aeb9"); });
    K.sun(ctx, RX + 44, 66, 12);
    ctx.strokeStyle = "rgba(255,120,60,.55)"; ctx.lineWidth = 2;
    for (i = 0; i < 4; i++) { var hx2 = RX + 116 + i * 24; ctx.beginPath(); ctx.moveTo(hx2, 104); ctx.bezierCurveTo(hx2 - 6, 94, hx2 + 6, 84, hx2, 72); ctx.stroke(); }
  }
  rows.forEach(function (r, k) { K.row(ctx, r[0], r[1], x0, x1, 186 + k * 26, r[2] || LT.ink); });
  if (tip) K.tip(ctx, tip, x0 - 4, CH - 44, x1 - x0 + 8, good);
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료가 보여 준 변화와 우리가 할 일을 적어 보세요.",
  cases: [
  {
    id: "r1", sec: "03", tag: "실제 자료 · 킬링 곡선", title: "2050년의 이산화 탄소 농도", short: "2050년 예상",
    who: "🌋", name: "마우나로아 관측소",
    say: "“1958년부터 하와이 마우나로아 산 위에서 공기 속 이산화 탄소를 재 왔어요. 아래는 " + Y0 + " ~ " + YL + "년의 <b>실제 연평균</b>입니다. <b>최근 10년(" + (YL - 10) + " ~ " + YL + ")의 증가 속도</b>가 그대로 이어진다면 <b>2050년</b>에는 몇 ppm이 될지 예상해 주세요.”",
    predict: {
      q: "이산화 탄소가 늘어나는 속도는 어떻게 변해 왔을까요?",
      options: ["㉠ 해마다 같은 양씩 일정하게 늘었다", "㉡ 점점 더 빨리 늘고 있다", "㉢ 요즘은 줄어들기 시작했다"],
      answer: 1
    },
    task: "그래프를 읽고 최근 10년의 한 해 증가량을 구해, <b>2050년 예상 농도</b>를 슬라이더로 맞추세요(± 4 ppm).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W, p = 440;
      var x0 = 60, x1 = 640, y0 = 20, y1 = 240;
      function X(y) { return x0 + (y - 1955) / (2055 - 1955) * (x1 - x0); }
      function Y(c) { return y1 - (c - 300) / 220 * (y1 - y0); }
      function draw() {
        rbase(ctx, W, cv.H, "공기 속 이산화 탄소 (ppm)", "마우나로아 연평균");
        var g = K.chart(ctx, { x: 6, y: 46, w: 588, h: cv.H - 52, pl: 48, pb: 28, pt: 10, pr: 14, x0: 1955, x1: 2055, y0: 300, y1: 520, xt: 1, yt: 4, light: true, xf: function () { return ""; } });
        [1960, 1980, 2000, 2020, 2050].forEach(function (y) { K.t(ctx, String(y), g.X(y), g.B + 16, { s: 10.5, w: "600", a: "center", c: LT.mute }); });
        K.plot(ctx, g, AN.map(function (a) { return [a[0], a[1]]; }), LT.blue, { w: 2.6, light: true });
        K.line(ctx, { x: g.X(YL), y: g.Y(co2(YL)) }, { x: g.X(2050), y: g.Y(p) }, LT.orange, 2, [6, 4]);
        K.planet(ctx, g.X(2050), g.Y(p), 7, "#ff9a4d", "#a33c06");
        rside(ctx, W, cv.H, "mlo", "해발 3,400 m 화산 비탈의 관측소", [[YL + "년", co2(YL).toFixed(1) + " ppm"], [(YL - 10) + "년", co2(YL - 10).toFixed(1) + " ppm"], ["1959~1969 한 해 증가", ((co2(1969) - co2(1959)) / 10).toFixed(2) + " ppm"], ["내 2050년 예상", p + " ppm", LT.orange]], null, null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "2050년 예상 농도", min: 420, max: 520, step: 1, value: 440, fmt: function (x) { return x + " ppm"; }, onInput: function (x) { p = x; api.changed(); draw(); } });
      api.info("한 해 증가량 = (나중 값 − 처음 값) ÷ 햇수. 예상 = " + YL + "년 값 + 증가량 × 남은 햇수. " + SRC1
        + "<div data-link='{\"id\":\"gml-trends\",\"title\":\"마우나로아 이산화 탄소 최신 그래프\",\"src\":\"NOAA 지구감시연구소\",\"url\":\"https://gml.noaa.gov/ccgg/trends/\",\"ask\":\"가장 최근 달의 월평균 농도(ppm)와 그 달을 찾아 오세요.\"}'></div>"
        + "<div data-map='{\"id\":\"mlo\",\"name\":\"마우나로아 관측소\",\"lat\":19.536,\"lng\":-155.576,\"zoom\":14,\"ask\":\"관측소 둘레에 무엇이 있나요? 도시·숲·공장과 멀리 떨어진 해발 3,400 m 화산 비탈에서 재는 까닭을 한 문장으로 적어 보세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(p - PROJ) <= 4) return { ok: true, msg: "최근 10년 한 해 " + RATE.toFixed(2) + " ppm씩 → " + co2(YL).toFixed(1) + " + " + RATE.toFixed(2) + " × " + (2050 - YL) + " ≈ " + PROJ.toFixed(0) + " ppm입니다." };
          var all = co2(YL) + (2050 - YL) * (co2(YL) - co2(Y0)) / (YL - Y0);
          if (Math.abs(p - all) <= 4) return { ok: false, msg: "전체 기간의 평균 속도를 썼습니다. 최근 10년은 그보다 훨씬 빠릅니다." };
          return { ok: false, msg: p + " ppm은 " + (p < PROJ ? "낮습니다" : "높습니다") + ". 먼저 최근 10년의 한 해 증가량을 구하세요." };
        }
      };
    },
    hints: ["(" + YL + "년 값 − " + (YL - 10) + "년 값) ÷ 10 = 한 해 증가량", "그 증가량에 " + (2050 - YL) + "(년)을 곱해 " + YL + "년 값에 더하세요."],
    solution: "한 해 약 " + RATE.toFixed(2) + " ppm × " + (2050 - YL) + "년 → <b>약 " + PROJ.toFixed(0) + " ppm</b>.",
    why: "1960년대에는 한 해 1 ppm이 채 안 되게(약 0.9 ppm) 늘던 이산화 탄소가 요즘은 한 해 2.5 ppm 넘게 늘고 있습니다. 화석 연료를 태우는 양이 늘었기 때문입니다. 산업 혁명 전(약 280 ppm)과 비교하면 이미 1.5 배를 넘었습니다.<br>"
      + "다만 이 예상은 ‘지금 속도가 그대로’라는 가정 위의 값입니다. 배출을 줄이면 곡선은 꺾이고, 더 늘리면 더 가팔라집니다. 미래는 그래프가 아니라 우리의 선택이 정합니다."
  },
  {
    id: "r2", sec: "03", tag: "실제 자료 · 기온과 이산화 탄소", title: "100 ppm마다 지구는 몇 °C 따뜻해졌나", short: "기온 기울기",
    who: "🌡️", name: "기후 자료 분석실",
    say: "“점 하나가 한 해입니다. 가로는 그해의 이산화 탄소 농도, 세로는 지구 평균 기온 편차(1951~1980 평균보다 몇 °C 높은지)예요. 점들을 가장 잘 지나는 직선을 그려, <b>이산화 탄소가 100 ppm 늘 때 기온이 몇 °C 올랐는지</b> 구해 주세요.”",
    predict: {
      q: "두 값이 함께 오른다는 것만으로 ‘이산화 탄소가 기온을 올렸다’고 말할 수 있을까요?",
      options: ["㉠ 함께 오르면 그것으로 충분한 증거다", "㉡ 함께 오르는 것은 단서이고, 온실 효과라는 원리와 다른 증거가 있어야 원인이라 말할 수 있다", "㉢ 두 값은 아무 관계가 없다"],
      answer: 1
    },
    task: "직선의 기울기를 바꿔 점들을 가장 잘 지나게 하세요(100 ppm 당 °C, ± 0.1).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W, m = 0.5;
      var x0 = 60, x1 = 600, y0 = 20, y1 = 250;
      function X(c) { return x0 + (c - 310) / 125 * (x1 - x0); }
      function Y(t) { return y1 - (t + 0.4) / 1.8 * (y1 - y0); }
      function resid(mm) { var cx = 0, cy = 0; PAIRS.forEach(function (p) { cx += p[0]; cy += p[1]; }); cx /= PAIRS.length; cy /= PAIRS.length; var s = 0; PAIRS.forEach(function (p) { var e = p[1] - (cy + mm / 100 * (p[0] - cx)); s += e * e; }); return { r: Math.sqrt(s / PAIRS.length), cx: cx, cy: cy }; }
      function draw() {
        rbase(ctx, W, cv.H, "이산화 탄소 ↔ 지구 기온", "점 하나 = 한 해");
        var g = K.chart(ctx, { x: 6, y: 46, w: 588, h: cv.H - 52, pl: 48, pb: 28, pt: 10, pr: 14, x0: 310, x1: 435, y0: -0.4, y1: 1.4, xt: 1, yt: 6, light: true, xf: function () { return ""; }, yf: function (t) { return (t > 0 ? "+" : "") + t.toFixed(1); } });
        [320, 360, 400, 430].forEach(function (c) { K.t(ctx, c + " ppm", g.X(c), g.B + 16, { s: 10.5, w: "600", a: "center", c: LT.mute }); });
        PAIRS.forEach(function (q) { K.planet(ctx, g.X(q[0]), g.Y(q[1]), 3.2, q[2] >= 2015 ? "#ff6b6b" : "#5aa9ff", q[2] >= 2015 ? "#7a1f1f" : "#123a8a"); });
        var r = resid(m);
        K.plot(ctx, g, [[312, r.cy + m / 100 * (312 - r.cx)], [432, r.cy + m / 100 * (432 - r.cx)]], LT.yellow, { w: 3, light: true });
        var best = r.r < resid(FIT.m * 100).r + 0.003;
        rside(ctx, W, cv.H, "globe", "온실 기체가 늘면 지구가 데워진다", [["내 기울기", m.toFixed(2) + " °C / 100 ppm", LT.violet], ["점과 선의 평균 거리", r.r.toFixed(3) + " °C", best ? LT.green : LT.ink], ["빨간 점", "2015년 이후"]], best ? "평균 거리가 가장 작다" : "평균 거리를 줄여 보세요", best);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "직선의 기울기", min: 0, max: 2, step: 0.05, value: 0.5, fmt: function (x) { return x.toFixed(2) + " °C / 100 ppm"; }, onInput: function (x) { m = x; api.changed(); draw(); } });
      api.info("‘점과 선의 평균 거리’가 가장 작아지는 기울기를 찾으세요. " + SRC2
        + "<div data-link='{\"id\":\"gistemp\",\"title\":\"NASA GISTEMP 지구 기온 자료\",\"src\":\"NASA 고다드 우주연구소\",\"url\":\"https://data.giss.nasa.gov/gistemp/graphs_v4/\",\"ask\":\"첫 그래프(Global Mean Estimates based on Land and Ocean Data)의 마지막 점에 마우스를 올리거나 그래프 아래 plain text 를 눌러, 가장 최근 해의 전 지구 기온 편차(°C)를 찾아 이 그래프의 마지막 점과 비교해 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          var t = FIT.m * 100;
          if (Math.abs(m - t) <= 0.1) return { ok: true, msg: PAIRS.length + "년치 자료의 가장 잘 맞는 기울기는 약 " + t.toFixed(2) + " °C / 100 ppm입니다." };
          return { ok: false, msg: m.toFixed(2) + " 는 " + (m < t ? "너무 완만합니다" : "너무 가파릅니다") + ". 평균 거리가 더 작아지는 쪽으로 옮겨 보세요." };
        }
      };
    },
    hints: ["기울기를 0.05씩 바꾸며 ‘평균 거리’ 숫자를 보세요.", "1 °C 근처에서 가장 작아집니다."],
    solution: "약 <b>" + (FIT.m * 100).toFixed(2) + " °C / 100 ppm</b> (" + (Math.ceil((FIT.m * 100 - 0.1) * 20) / 20).toFixed(2) + " ~ " + (Math.floor((FIT.m * 100 + 0.1) * 20) / 20).toFixed(2) + ").",
    why: "지난 60여 년 동안 이산화 탄소가 100 ppm 늘 때마다 지구 평균 기온은 약 1 °C 올랐습니다. 두 값이 함께 오른다는 것(<b>상관</b>)만으로는 원인을 단정할 수 없지만, 이산화 탄소가 지표가 내는 적외선을 흡수한다는 실험실 측정(온실 효과), 위성으로 잰 지구 복사의 변화, 대류권은 데워지는데 성층권은 식는 현상 같은 여러 증거가 같은 방향을 가리켜 과학자들은 원인으로 결론 내렸습니다.<br>"
      + "점이 직선에서 위아래로 흩어진 것은 엘니뇨·화산 폭발처럼 해마다 달라지는 요인 때문입니다. 한 해의 값보다 긴 기간의 흐름을 보아야 하는 까닭입니다."
  },
  {
    id: "r3", sec: "03", tag: "실제 자료 · 우리 동네 폭염", title: "창원의 폭염일, 40년 동안 몇 배가 됐나", short: "창원 폭염일",
    who: "📍", name: "창원기상대(기상청)",
    say: "“진해에서 가까운 기상청 관측소 가운데 1985년부터 기록이 쌓인 곳이 마산합포구 가포동의 <b>창원기상대</b>예요. 아래 막대는 " + CW_Y0 + " ~ " + CW_YL + "년 해마다 <b>낮 최고 기온이 33 °C 이상</b>이었던 날(폭염일) 수입니다. <b>처음 10년(" + CW_Y0 + " ~ " + (CW_Y0 + 9) + ")</b>과 <b>마지막 10년(" + (CW_YL - 9) + " ~ " + CW_YL + ")</b>의 한 해 평균을 비교해, 폭염일이 몇 배가 되었는지 구해 주세요.”",
    predict: {
      q: "같은 기간 창원의 연평균 기온은 처음 10년 " + CW_T0.toFixed(1) + " °C, 마지막 10년 " + CW_T1.toFixed(1) + " °C로 " + (CW_T1 - CW_T0).toFixed(1) + " °C 차이입니다. 폭염일은 어떻게 되었을까요?",
      options: ["㉠ 평균이 거의 그대로이니 폭염일도 거의 그대로다", "㉡ 10~20 % 남짓 늘었다", "㉢ 두 배쯤 늘었다"],
      answer: 2
    },
    task: "막대를 읽어 두 기간의 평균을 구하고, <b>마지막 10년 ÷ 처음 10년</b>을 슬라이더로 맞추세요(± 0.2 배).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W, k = 1.0;
      var x0 = 50, x1 = 640, y0 = 24, y1 = 250, n = CW.length, bw = (x1 - x0) / n;
      function Y(d) { return y1 - d / 50 * (y1 - y0); }
      function draw() {
        rbase(ctx, W, cv.H, "창원의 폭염일 (최고 33 °C 이상)", "");
        var n = CW.length, g = K.chart(ctx, { x: 6, y: 46, w: 588, h: cv.H - 52, pl: 40, pb: 28, pt: 10, pr: 12, x0: 0, x1: n, y0: 0, y1: 50, xt: 1, yt: 5, light: true, xf: function () { return ""; } });
        var bw = (g.R - g.L) / n;
        CW.forEach(function (r, i) {
          var c0 = i < 10 ? ["#74b9ff", "#1c64c4"] : (i >= n - 10 ? ["#ff9a7a", "#c92a2a"] : ["#c9d2e0", "#8a96a8"]), y = g.Y(r[2]);
          var gg = ctx.createLinearGradient(0, y, 0, g.B); gg.addColorStop(0, c0[0]); gg.addColorStop(1, c0[1]);
          ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(g.L + i * bw + 1.5, y, bw - 3, g.B - y, [3, 3, 0, 0]); ctx.fill();
          if (r[0] % 5 === 0) K.t(ctx, String(r[0]), g.L + i * bw + bw / 2, g.B + 16, { s: 10.5, w: "600", a: "center", c: LT.mute });
        });
        rside(ctx, W, cv.H, "city", "평균보다 극단이 먼저 늘어난다", [["처음 10년 한 해 평균", "? 일", LT.blue], ["마지막 10년 한 해 평균", "? 일", LT.red], ["가장 많았던 해", CW_MAX[0] + "년 " + CW_MAX[2] + "일"], ["내 답 (몇 배)", k.toFixed(1) + " 배", LT.violet]], null, null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "마지막 10년 ÷ 처음 10년", min: 1, max: 4, step: 0.1, value: 1, fmt: function (x) { return x.toFixed(1) + " 배"; }, onInput: function (x) { k = x; api.changed(); draw(); } });
      api.info("파란 막대 10개의 합 ÷ 10, 빨간 막대 10개의 합 ÷ 10을 구한 뒤 나눕니다. 한 해 값은 들쭉날쭉하니(1993년 0일, 1994년 34일) 10년씩 묶어 평균을 냅니다. " + SRC3
        + "<div data-link='{\"id\":\"kma-cw155\",\"title\":\"창원 과거 관측 일별 자료\",\"src\":\"기상청 날씨누리\",\"url\":\"https://www.weather.go.kr/w/weather/land/past-obs/obs-by-day.do?stn=155&obs=1\",\"ask\":\"올해 8월을 골라 최고 기온이 33 °C 이상인 날이 며칠인지 세어 오세요. 가장 더웠던 날은 며칠, 몇 °C였나요?\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(k - CW_K) <= 0.2) return { ok: true, msg: "처음 10년 " + CW_H0.toFixed(1) + "일 → 마지막 10년 " + CW_H1.toFixed(1) + "일, 약 " + CW_K.toFixed(1) + " 배입니다." };
          return { ok: false, msg: k.toFixed(1) + " 배는 " + (k < CW_K ? "적습니다" : "많습니다") + ". 두 색의 막대를 10개씩 더해 각각 10으로 나눠 보세요." };
        }
      };
    },
    hints: ["처음 10년: 3 + 0 + 5 + 7 + 26 + 4 + 8 + 0 + 34 + 16 = ?", "마지막 10년: 28 + 20 + 36 + 9 + 8 + 13 + 12 + 17 + 45 + 39 = ?"],
    solution: "처음 10년 한 해 " + CW_H0.toFixed(1) + "일, 마지막 10년 " + CW_H1.toFixed(1) + "일 → <b>약 " + CW_K.toFixed(1) + " 배</b>.",
    why: "연평균 기온은 0.2 °C 남짓 차이인데 폭염일은 두 배가 넘었습니다. 기후 변화는 평균보다 <b>극단</b>에서 먼저, 크게 드러날 수 있습니다. 평균이 조금만 올라도 ‘아주 더운 날’의 문턱을 넘는 날은 훨씬 많아지고, 생물과 사람이 견디기 어려운 것은 평균이 아니라 그런 날입니다. 2026년 8월 1일 창원은 <b>40.4 °C</b>로 1985년 관측을 시작한 뒤 가장 더웠습니다(7월 29일 ~ 8월 2일 닷새 내내 38.5 °C 이상).<br>"
      + "※ 같은 자료에서 겨울에 영하로 내려간 날은 오히려 조금 늘었습니다. 관측소 한 곳의 기록은 그 둘레의 땅 이용·바다 영향도 받습니다. 그래서 과학자들은 한 지점이 아니라 여러 관측소와 긴 기간의 자료를 함께 보고 기후 변화를 판단합니다."
  }
  ]
});
})();
