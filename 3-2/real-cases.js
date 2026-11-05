/* 통합과학2 Ⅲ 과학 기술의 발전과 쟁점 — 실제 자료
   r1 겨울 딸기 온실의 햇빛 — 12월에 땅에 닿는 햇빛은 6월의 몇 %
   r2 보조 난방기를 켜는 문턱 — 논산의 2024~2025년 겨울 최저 기온으로 제어 규칙 정하기
   자료: data/seoul-sun.js (NASA POWER 서울 일사량 2001~2024), data/nonsan-winter.js (ERA5 논산 2024~2025 겨울) */
(function () {
"use strict";
var S = window.REAL_SUN || { monthly: [] }, N = window.REAL_NONSAN || { days: [] };
var NY = {}; S.monthly.forEach(function (r) { NY[r[0]] = 1; });
function mavg(m, i) { var a = S.monthly.filter(function (r) { return r[1] === m && r[i] != null && r[i] >= 0; }); return a.length ? a.reduce(function (s, r) { return s + r[i]; }, 0) / a.length : 0; }
var ALL = [], CLR = [];
for (var m = 1; m <= 12; m++) { ALL.push(mavg(m, 2)); CLR.push(mavg(m, 3)); }
var PCT = ALL[5] ? ALL[11] / ALL[5] * 100 : 40;
var CL = 0; for (var k = 1; k < 12; k++) if (ALL[k] / CLR[k] < ALL[CL] / CLR[CL]) CL = k;
var SRC = "<small>출처: 미국 항공우주국(NASA) POWER 자료 서비스 — 서울(북위 37.57°, 동경 126.98°) 수평면에 하루 동안 닿은 햇빛 에너지(kWh/m²/일)의 달 평균을 2001~2024년 " + Object.keys(NY).length + "해로 평균. 짙은 막대는 구름까지 포함한 실제 값, 옅은 막대는 구름이 없다고 친 값입니다. 사본은 data/seoul-sun.js.</small>";
var COLD = (N.days || []).reduce(function (b, r) { return r[1] < b[1] ? r : b; }, (N.days || [])[0] || ["2025-02-05", -11.7]);
var TH30 = (function () { var a = (N.days || []).map(function (r) { return r[1]; }).sort(function (x, y) { return x - y; }); return a.length > 30 ? (a[29] + a[30]) / 2 : -5; })();
var SRC2 = "<small>출처: 유럽 중기예보센터 ERA5 재분석(Open-Meteo 과거 날씨 API) — 충남 논산 부근(북위 36.20°, 동경 127.10°)의 하루 최저 기온, 2024년 12월 1일 ~ 2025년 2월 28일. 약 25 km 격자 값이라 들판의 실제 기온과 1~2 °C 다를 수 있습니다. 사본은 data/nonsan-winter.js.</small>";
var MN = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

/* ---- 스튜디오 말투(밝은 바탕 + 입체 미니어처 + 흰 판정 카드) — window.sthKit (_tools/STUDIO_GUIDE.md) ---- */
var K = window.sthKit, LT = K.LT;
function lpill(ctx, s, x, y, o) { o = o || {}; o.bg = o.bg || "rgba(255,255,255,.94)"; o.line = o.line || "rgba(20,40,90,.16)"; o.c = o.c || LT.ink; return K.pill(ctx, s, x, y, o); }
function note(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 11, w: o.w || "700", a: o.a, c: o.c || LT.mute }); }
function cube(ctx, x, y, w, h, d, cF, cT, cR, al) {
  var dx = d * .7, dy = d * .5;
  ctx.save(); if (al != null) ctx.globalAlpha = al;
  ctx.fillStyle = cT; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - dy); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cR; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w + dx, y + h - dy); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cF; ctx.fillRect(x, y, w, h); ctx.restore();
}
function card(ctx, RX, W, CH, title, head, headCol, rows, tip, good) {
  K.card(ctx, RX, 0, W - RX, CH, title);
  if (head) K.t(ctx, head, RX + 18, 60, { s: 19, w: "900", c: headCol || LT.ink });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], RX + 18, W - 18, 94 + i * 27, r[2]); });
  if (tip) K.tip(ctx, tip, RX + 12, CH - 46, W - RX - 24, good);
}
/* 작은 비닐 온실 미니어처 (흙 블록 위). heat: 보조 난방기 불빛 0~1 */
function greenhouse(ctx, x, y, heat) {
  cube(ctx, x, y, 120, 12, 44, "#8a6a48", "#8fbf63", "#6d523a");
  var gx = x + 14, gy = y - 6, w = 84, h = 30, dx = 20, dy = 14;
  ctx.fillStyle = "rgba(215,232,250,.55)"; ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy - h); ctx.quadraticCurveTo(gx + w / 2, gy - h - 24, gx + w, gy - h); ctx.lineTo(gx + w, gy); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx + w, gy); ctx.lineTo(gx + w + dx, gy - dy); ctx.lineTo(gx + w + dx, gy - dy - h); ctx.lineTo(gx + w, gy - h); ctx.closePath(); ctx.fillStyle = "rgba(180,205,235,.5)"; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(gx + w, gy - h); ctx.lineTo(gx + w + dx, gy - dy - h); ctx.moveTo(gx + w / 2, gy - h - 12); ctx.lineTo(gx + w / 2 + dx, gy - h - 12 - dy); ctx.stroke();
  for (var i = 0; i < 4; i++) { var px = gx + 12 + i * 20; ctx.fillStyle = "#2fae6a"; ctx.beginPath(); ctx.ellipse(px, gy - 5, 6, 3.5, 0, 0, 6.2832); ctx.fill(); ctx.fillStyle = "#ff4d63"; ctx.beginPath(); ctx.arc(px + 3, gy - 3, 1.8, 0, 6.2832); ctx.fill(); }
  if (heat) { cube(ctx, gx + w - 22, gy - 12, 14, 10, 8, "#868e96", "#adb5bd", "#495057"); K.glow(ctx, gx + w - 15, gy - 8, 3, "rgba(255,120,40," + (0.4 + 0.55 * heat).toFixed(2) + ")", 3.2); }
}
function chart(H, ctx, W, CH, pick) {
  ctx.clearRect(0, 0, W, CH);
  K.studio(ctx, 0, 0, 612, CH, { x: 520, y: CH - 40, rx: 100, ry: 16 });
  var g = K.chart(ctx, { x: 4, y: 26, w: 436, h: CH - 30, pl: 40, pb: 30, pt: 18, pr: 12, x0: 0, x1: 12, y0: 0, y1: 8, xt: 12, yt: 4, light: true, xf: function () { return ""; } });
  var bw = (g.X(1) - g.X(0)), i;
  for (i = 0; i < 12; i++) {
    var x = g.X(i) + bw * .18, w = bw * .5;
    cube(ctx, x, g.Y(CLR[i]), w, g.B - g.Y(CLR[i]), 10, "rgba(245,159,0,.25)", "rgba(245,159,0,.32)", "rgba(200,120,0,.25)");
    cube(ctx, x, g.Y(ALL[i]), w, g.B - g.Y(ALL[i]), 10, pick === i ? "#e8590c" : "#f59f00", pick === i ? "#ff8a4c" : "#ffc04d", pick === i ? "#b8430a" : "#c47f00");
    K.t(ctx, MN[i], g.X(i + .5), g.B + 15, { s: 10, a: "center", c: (i === 5 || i === 11) ? LT.ink : LT.mute, w: (i === 5 || i === 11) ? "900" : "600" });
  }
  note(ctx, "하루에 땅 1 m²에 닿는 햇빛 (kWh) — 짙은: 실제 · 옅은: 구름이 없을 때", 8, 18, { s: 11, c: LT.mute });
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 스마트 온실의 센서·장치를 어떻게 정할지 근거를 들어 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "01", tag: "실제 자료 · 일사량", title: "겨울 딸기 온실의 햇빛", short: "12월의 햇빛",
    who: "🍓", name: "할머니의 딸기 온실",
    say: "“딸기는 겨울에 열매를 맺는데, 겨울에는 햇빛이 모자라 보광등을 켜는 농가도 있어요. 서울의 <b>실제 일사량</b> 자료로, <b>12월</b>에 땅에 닿는 햇빛이 <b>6월</b>의 <b>몇 %</b> 인지 구해 주세요(짙은 막대, 구름 포함).”",
    predict: {
      q: "겨울에 땅에 닿는 햇빛이 적은 가장 큰 까닭은 무엇일까요?",
      options: ["㉠ 지구가 태양에서 멀어져서", "㉡ 태양의 고도가 낮고 낮의 길이가 짧아서", "㉢ 겨울에는 늘 흐려서"],
      answer: 1
    },
    task: "12월 ÷ 6월 × 100을 슬라이더로 맞추세요(± 3%).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, g = 50;
      function draw() {
        chart(H, ctx, W, cv.H, null);
        var CH = cv.H;
        /* 입체 미니어처: 한낮의 태양 고도 — 6월 약 76°, 12월 약 29° (서울) */
        var bx = 452, by = CH - 58, tx = bx + 46, ty = by - 34;
        greenhouse(ctx, bx, by, 0);
        [[76, 140, "#f59f00", "6월 76°", "#a85d00"], [29, 100, "#ff7a1a", "12월 29°", LT.orange]].forEach(function (s) {
          var a = s[0] * Math.PI / 180, sx = tx + Math.cos(a) * s[1], sy = ty - Math.sin(a) * s[1];
          K.line(ctx, { x: sx, y: sy }, { x: tx, y: ty }, s[2], 2.2, [5, 4]);
          K.sun(ctx, sx, sy, 7);
          lpill(ctx, s[3], sx + 12, sy + (s[0] > 50 ? 4 : -14), { s: 10.5, c: s[4], box: [446, 612] });
        });
        lpill(ctx, "겨울 해는 낮고 낮이 짧다", 520, CH - 14, { s: 10.5, a: "center", c: LT.mute, box: [446, 612] });
        card(ctx, 620, W, CH, "서울의 햇빛 (2001~2024 평균)", "내 답 " + g + "%", LT.blue, [
          ["6월 (실제)", ALL[5].toFixed(2) + " kWh/m²/일", "#a85d00"],
          ["12월 (실제)", ALL[11].toFixed(2) + " kWh/m²/일", LT.orange],
          ["구하는 값", "12월 ÷ 6월 × 100"]
        ], null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "12월은 6월의 몇 %", min: 0, max: 100, step: 1, value: 50, fmt: function (x) { return x + "%"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("1 kWh는 1 kW 전열기를 한 시간 켠 에너지입니다. " + SRC
        + "<div data-link='{\"id\":\"power-dav\",\"title\":\"NASA POWER 자료 보기\",\"src\":\"미국 항공우주국\",\"url\":\"https://power.larc.nasa.gov/data-access-viewer/\",\"ask\":\"왼쪽 메뉴의 Single Point 를 누르고 User Community 는 Renewable Energy(RE), Temporal Level 은 Climatology 를 고른 뒤, Latitude·Longitude 에 우리 학교(35.11, 128.75)를 넣고 All Sky Surface Shortwave Downward Irradiance(ALLSKY_SFC_SW_DWN)를 골라 Submit 하세요. 12월(DEC)과 6월(JUN) 값을 찾아 서울과 비교해 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (Math.abs(g - PCT) <= 3) return { ok: true, msg: ALL[11].toFixed(2) + " ÷ " + ALL[5].toFixed(2) + " × 100 ≈ " + PCT.toFixed(0) + "% — 겨울 햇빛은 여름의 절반에도 못 미칩니다." };
          return { ok: false, msg: g + "%는 " + (g < PCT ? "작습니다" : "큽니다") + ". 12월 값을 6월 값으로 나누세요." };
        }
      };
    },
    hints: ["오른쪽 판의 두 값을 쓰세요.", ALL[11].toFixed(2) + " ÷ " + ALL[5].toFixed(2) + " × 100 ≈ ?"],
    solution: "약 <b>" + Math.round(PCT) + "%</b>.",
    why: "서울에서 한낮의 태양 고도는 하지 무렵 약 76°, 동지 무렵 약 29°입니다. 고도가 낮으면 같은 햇빛이 넓은 땅에 퍼지고 공기를 더 길게 지나며 약해지고, 낮의 길이도 짧습니다. 지구는 오히려 1월 초에 태양에 가장 가깝습니다.<br>"
      + "그래서 겨울 온실은 햇빛을 최대한 받도록 비닐을 깨끗이 하고, 흐린 날에는 보광등을, 밤에는 보온을 씁니다. 스마트 온실의 조도 센서는 ‘햇빛이 얼마나 모자란지’를 재어 이런 장치를 켜고 끄는 근거가 됩니다."
  },
  {
    id: "r2", sec: "01", tag: "실제 자료 · 제어 규칙", title: "보조 난방기를 켜는 문턱", short: "난방 문턱",
    who: "🌡️", name: "스마트팜 설계팀",
    say: "“딸기는 밤에도 온실 안이 5~8 °C 아래로 내려가지 않아야 합니다. 온실은 비닐 두 겹과 보온 커튼으로 버티지만, 바깥이 아주 추운 밤에는 <b>보조 난방기</b>를 켜야 합니다. 딸기 산지 논산의 <b>2024~2025년 겨울</b> 실제 최저 기온으로, 겨울 " + (N.days || []).length + "일 가운데 <b>약 30일만</b> 난방기가 켜지도록 바깥 기온 문턱을 정해 주세요.”",
    predict: {
      q: "문턱을 높게(덜 추운 값으로) 잡으면 어떻게 될까요?",
      options: ["㉠ 난방기가 더 자주 켜져 연료는 더 들지만 딸기는 안전해진다", "㉡ 난방기가 덜 켜진다", "㉢ 아무 차이가 없다"],
      answer: 0
    },
    task: "바깥 최저 기온이 문턱보다 낮은 날이 25~35일이 되도록 문턱을 맞추세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, th = 0;
      var D = N.days || [];
      function cnt(t) { return D.filter(function (r) { return r[1] < t; }).length; }
      function draw() {
        var CH = cv.H, n = cnt(th), ok = n >= 25 && n <= 35;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, 612, CH, { x: 520, y: CH - 40, rx: 100, ry: 16 });
        var g = K.chart(ctx, { x: 4, y: 26, w: 436, h: CH - 30, pl: 40, pb: 30, pt: 18, pr: 12, x0: 0, x1: Math.max(1, D.length), y0: -16, y1: 8, xt: 1, yt: 6, light: true,
          xf: function () { return ""; }, yf: function (q) { return Math.round(q) + "°"; } });
        var bw = (g.R - g.L) / Math.max(1, D.length);
        K.line(ctx, { x: g.L, y: g.Y(0) }, { x: g.R, y: g.Y(0) }, "rgba(20,40,90,.35)", 1);
        D.forEach(function (r, i) {
          var on = r[1] < th, y0 = g.Y(Math.max(r[1], 0)), h = Math.abs(g.Y(r[1]) - g.Y(0));
          ctx.fillStyle = on ? LT.red : "rgba(28,126,214,.75)"; ctx.fillRect(g.L + i * bw + 0.5, y0, Math.max(1, bw - 1), Math.max(1, h));
          if (r[0].slice(8) === "01") K.t(ctx, (+r[0].slice(5, 7)) + "월", g.L + i * bw + 8, g.B + 15, { s: 10, c: LT.mute, w: "700" });
        });
        K.line(ctx, { x: g.L, y: g.Y(th) }, { x: g.R, y: g.Y(th) }, LT.orange, 2.2, [6, 4]);
        lpill(ctx, "문턱 " + th.toFixed(1) + "°", g.R - 4, g.Y(th) + (th > -10 ? 18 : -6), { s: 10.5, a: "right", c: "#a85d00" });
        note(ctx, "논산 부근 하루 최저 기온 (°C) — 빨강: 난방기가 켜지는 날", 8, 18, { s: 11 });
        /* 입체 미니어처: 추운 밤 비닐 온실과 보조 난방기 */
        greenhouse(ctx, 452, CH - 58, Math.min(1, n / 30));
        lpill(ctx, "보조 난방기 " + n + "일 켜짐", 520, CH - 16, { s: 10.5, a: "center", c: ok ? LT.green : LT.orange, box: [446, 612] });
        lpill(ctx, "바깥 " + th.toFixed(1) + "° 아래면 켬", 520, 64, { s: 10.5, a: "center", c: LT.ink, box: [446, 612] });
        card(ctx, 620, W, CH, "판정", n + "일 켜짐", ok ? LT.green : LT.orange, [
          ["문턱", th.toFixed(1) + " °C", "#a85d00"],
          ["난방기 켜지는 날", n + " 일", ok ? LT.green : LT.red],
          ["겨울 전체", D.length + " 일"]
        ], ok ? "목표 25~35일 안" : (n > 35 ? "너무 자주 켜집니다" : "너무 드물게 켜집니다"), ok);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "바깥 기온 문턱", min: -12, max: 5, step: 0.1, value: 0, fmt: function (x) { return x.toFixed(1) + " °C"; }, onInput: function (x) { th = x; api.changed(); draw(); } });
      api.info(SRC2);
      draw();
      return {
        judge: function () {
          var c = cnt(th);
          if (c >= 25 && c <= 35) return { ok: true, msg: "문턱 " + th.toFixed(1) + " °C — " + D.length + "일 가운데 " + c + "일 켜집니다. 그 겨울 가장 추운 밤은 " + (+COLD[0].slice(5, 7)) + "월 " + (+COLD[0].slice(8, 10)) + "일 " + COLD[1].toFixed(1) + " °C 였어요." };
          return { ok: false, msg: "문턱 " + th.toFixed(1) + " °C 에서는 " + c + "일 켜집니다. " + (c > 35 ? "너무 자주 켜져요. 문턱을 더 낮추세요." : "너무 드물어요. 문턱을 더 높이세요.") };
        }
      };
    },
    hints: ["문턱 선을 내리면 빨간 막대(켜지는 날)가 줄어듭니다.", "오른쪽 ‘난방기 켜지는 날’이 30 근처가 될 때까지 옮기세요(−5 °C 근처부터 보세요)."],
    solution: "문턱 약 <b>" + TH30.toFixed(1) + " °C</b> 안팎(켜지는 날 25~35일).",
    why: "스마트팜의 제어 규칙은 ‘센서 값이 문턱을 넘으면 장치를 켠다’는 단순한 형식이지만, 문턱을 어디에 두느냐에 따라 작물의 안전과 연료비가 맞바뀝니다(트레이드오프). 실제 자료로 ‘몇 번 켜질지’를 미리 세어 보면 근거 있게 문턱을 정할 수 있습니다. 오늘날 스마트팜은 바깥 기온 대신 온실 안 온도 센서를 쓰고, 일기 예보를 받아 미리 보온 커튼을 닫기도 합니다.<br>"
      + "또 한 해의 자료만으로 정한 규칙은 더 추운 해에 맞지 않을 수 있습니다. 여러 해의 자료를 보고, 가장 추운 밤에도 견디도록 안전장치(경보·예비 난방)를 함께 두는 것이 공학적 설계의 기본입니다."
  }
  ]
});
})();
