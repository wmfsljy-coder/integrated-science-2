/* 통합과학2 Ⅱ-2 에너지 전환과 활용 — 실제 자료
   r1 우리 학교에 햇빛이 가장 많이 오는 달 — 장마 때문에 여름이 아니다
   r2 학교 지붕 태양광, 한 해 몇 kWh를 만들까 — 에너지 효율과 전환
   자료: data/power-ungcheon-monthly.js (NASA POWER, 창원 웅천 부근 2015~2024 월별 일사량) */
(function () {
"use strict";
var P = window.REAL_POWER_MONTHLY || { sw: [], swClear: [], precip: [] };
function avg(list) { var s = [], n = []; for (var m = 1; m <= 12; m++) { s[m] = 0; n[m] = 0; } list.forEach(function (r) { s[r[1]] += r[2]; n[r[1]]++; }); var o = []; for (m = 1; m <= 12; m++) o[m] = n[m] ? s[m] / n[m] : 0; return o; }
var SW = avg(P.sw), CL = avg(P.swClear), PR = avg(P.precip);
var DAYS = [0, 31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var YEAR = 0; for (var m = 1; m <= 12; m++) YEAR += SW[m] * DAYS[m];             /* kWh/m² · 년 */
var BEST = 1; for (m = 2; m <= 12; m++) if (SW[m] > SW[BEST]) BEST = m;
var AREA = 100, EFF = 0.20, PR_ = 0.8, OUT = YEAR * AREA * EFF * PR_;             /* kWh/년 */
var SRC = "<small>출처: NASA 랭글리 연구소 POWER 프로젝트, 창원 웅천 부근(북위 35.13°, 동경 128.70°) 2015~2024 월평균 지표 일사량(ALLSKY_SFC_SW_DWN, 구름 낀 날 포함)·맑은 하늘 일사량·강수량. 위성 관측과 재분석 자료로 만든 격자값입니다. 사본은 data/power-ungcheon-monthly.js.</small>";

var K = window.sthKit, LT = K.LT;
function lt(ctx, s, x, y, o) { o = o || {}; if (!o.c) o.c = LT.ink; K.t(ctx, s, x, y, o); }
function judge(ctx, W, CH, title, big, bigCol, rows, tip, good) {
  var CX = 690, x0 = CX + 16, x1 = W - 16;
  K.card(ctx, CX, 0, W - CX, CH, title);
  lt(ctx, big, x0, 58, { s: 19, w: "900", c: bigCol });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], x0, x1, 92 + i * 26, r[2]); });
  if (tip) K.tip(ctx, tip, x0 - 4, 100 + rows.length * 26, x1 - x0 + 4, good);
}
function roof(ctx, CH, m, panels) {                  /* 학교 지붕 태양광 미니어처: 그달 한낮의 해 높이와 비구름 */
  var I = K.iso({ ox: 590, oy: CH - 128, s: .62, L: 120, D: 90 }), i;
  var dec = 23.44 * Math.sin(2 * Math.PI * (30.4 * (m - 0.5) - 81) / 365), alt = 90 - 35.1 + dec, a = alt * Math.PI / 180;
  var sx = 590 - 74 * Math.cos(a), sy = CH - 150 - 96 * Math.sin(a) + 30;
  ctx.strokeStyle = "rgba(245,159,0,.35)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.arc(590, CH - 120, 96, Math.PI, Math.PI * 1.5); ctx.stroke(); ctx.setLineDash([]);
  K.sun(ctx, sx, sy, 9); K.planet(ctx, sx, sy, 10, "#fff3bf", "#f59f00");
  I.box(ctx, 0, 0, 0, 120, 90, 46, "#dee2e6", "#f1f3f5", "#ced4da");
  for (i = 0; i < 3; i++) for (var j = 0; j < (panels ? 4 : 3); j++) {
    var x0 = 10 + j * 26, y0 = 10 + i * 26, p1 = I.P(x0, y0, 47), p2 = I.P(x0 + 22, y0, 47), p3 = I.P(x0 + 22, y0 + 18, 56), p4 = I.P(x0, y0 + 18, 56);
    var pg = ctx.createLinearGradient(p1.x, p1.y, p3.x, p3.y); pg.addColorStop(0, "#1c3d78"); pg.addColorStop(.5, "#3b6fc4"); pg.addColorStop(1, "#14305e");
    I.quad(ctx, p1, p2, p3, p4, pg, "rgba(255,255,255,.6)");
  }
  for (i = 0; i < 4; i++) { var wp = I.P(20 + i * 26, 90, 20); ctx.fillStyle = "#a5d8ff"; ctx.fillRect(wp.x - 6, wp.y - 6, 10, 8); }
  if (m) { var nc = Math.round(clamp(PR[m] / 3, 0, 4)); for (i = 0; i < nc; i++) { var cx = 540 + i * 34, cy = 40 + (i % 2) * 14; [[-10, 2, 10], [0, -4, 13], [12, 2, 10]].forEach(function (q) { var g = ctx.createRadialGradient(cx + q[0] - 3, cy + q[1] - 4, 2, cx + q[0], cy + q[1], q[2]); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#adb5bd"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + q[0], cy + q[1], q[2], 0, 6.2832); ctx.fill(); }); if (PR[m] > 5) { ctx.strokeStyle = "rgba(28,100,190,.6)"; ctx.lineWidth = 1.2; for (var r = 0; r < 4; r++) { ctx.beginPath(); ctx.moveTo(cx - 8 + r * 6, cy + 14); ctx.lineTo(cx - 11 + r * 6, cy + 24); ctx.stroke(); } } } }
  if (m) K.pill(ctx, m + "월 한낮 해 높이 약 " + Math.round(alt) + "°", 590, CH - 10, { s: 11, a: "center", c: "#ffe3a3", box: [500, 684] });
  else K.pill(ctx, "지붕 패널 100 m²", 590, CH - 10, { s: 11, a: "center", c: "#bfe6ff", box: [500, 684] });
}
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function bars(H, ctx, W, CH, pick, showClear) {
  ctx.clearRect(0, 0, W, CH);
  K.studio(ctx, 0, 0, 684, CH, { x: 590, y: CH - 40, rx: 90, ry: 14 });
  var g = K.chart(ctx, { x: 6, y: 22, w: 496, h: CH - 26, x0: 0, x1: 12, y0: 0, y1: 10, xt: 12, yt: 5, xf: function () { return ""; }, yl: "하루 1 m²에 닿는 햇빛 (kWh)", light: true });
  for (var m = 1; m <= 12; m++) {
    var on = m === pick, cx = g.X(m - 0.5);
    if (showClear) { ctx.fillStyle = "rgba(20,40,90,.12)"; ctx.fillRect(cx - 16, g.Y(CL[m]), 32, g.B - g.Y(CL[m])); }
    var bg = ctx.createLinearGradient(0, g.Y(SW[m]), 0, g.B); bg.addColorStop(0, on ? "#ffa94d" : "#74c0fc"); bg.addColorStop(1, on ? "#d9480f" : "#1c7ed6");
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(cx - 12, g.Y(SW[m]), 24, g.B - g.Y(SW[m]), [5, 5, 0, 0]); ctx.fill();
    lt(ctx, m + "월", cx, g.B + 15, { s: 10.5, w: on ? "900" : "600", a: "center", c: on ? LT.orange : LT.mute });
    if (showClear) lt(ctx, PR[m].toFixed(1), cx, g.T + 12, { s: 9.5, a: "center", c: LT.teal });
  }
  if (showClear) lt(ctx, "위 숫자 = 하루 평균 강수량(mm) · 회색 = 구름이 없을 때", g.L + 6, g.T + 28, { s: 10.5, w: "800", c: LT.teal });
}

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 에너지 전환과 효율을 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "03", tag: "실제 자료 · 우리 동네 일사량", title: "우리 학교에 햇빛이 가장 많이 오는 달", short: "가장 밝은 달",
    who: "☀️", name: "학교 에너지 동아리",
    say: "“학교 옥상에 태양광 패널을 놓자는 건의가 나왔어요. NASA가 위성 관측으로 만든 자료에서 <b>우리 학교 근처</b>의 10년(2015~2024) 월평균 일사량을 받아 왔습니다. 패널이 가장 많은 전기를 만들 <b>달</b>을 찾아 주세요.”",
    predict: {
      q: "1 m²에 닿는 햇빛 에너지가 가장 많은 달은 언제일까요?",
      options: ["㉠ 해가 가장 높은 6월 하지 무렵", "㉡ 가장 더운 7~8월", "㉢ 늦봄인 5월 무렵"],
      answer: 2
    },
    task: "슬라이더로 달을 골라 <b>일사량이 가장 많은 달</b>을 찾고, ‘구름 없을 때’ 보기를 켜서 그 까닭도 확인하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, k = 7, clear = false;
      function draw() {
        bars(H, ctx, W, cv.H, k, clear);
        roof(ctx, cv.H, k, false);
        judge(ctx, W, cv.H, "판정 · 고른 달", k + "월 · " + SW[k].toFixed(2) + " kWh/m²", k === BEST ? LT.green : LT.orange, [["하루 일사량", SW[k].toFixed(2) + " kWh/m²"], ["구름 없을 때", CL[k].toFixed(2) + " kWh/m²"], ["하루 강수량", PR[k].toFixed(1) + " mm", LT.teal]], k === BEST ? "가장 많은 달" : "더 높은 막대가 있다", k === BEST);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "달", min: 1, max: 12, step: 1, value: 7, fmt: function (x) { return x + "월"; }, onInput: function (x) { k = x; api.changed(); draw(); } });
      api.seg({ label: "보기", value: "real", options: [{ v: "real", t: "실제(구름 포함)" }, { v: "clear", t: "구름 없을 때도 함께" }], onPick: function (x) { clear = x === "clear"; draw(); } });
      api.info("막대는 구름 낀 날까지 모두 넣은 실제 값입니다. " + SRC
        + "<div data-link='{\"id\":\"nasa-power\",\"title\":\"NASA POWER 자료 보기\",\"src\":\"NASA 랭글리 연구소\",\"url\":\"https://power.larc.nasa.gov/data-access-viewer/\",\"ask\":\"① 왼쪽 메뉴의 Single Point 를 누르고 ② Data Resolution 은 Standard, User Community 는 Renewable Energy(RE), Temporal Level 은 Climatology 를 고르세요. ③ Latitude 35.11, Longitude 128.75(우리 학교)를 넣고 ④ Parameters 에서 All Sky Surface Shortwave Downward Irradiance 를 골라 Submit 하세요. 결과의 ANN(연평균) 값이 몇 kWh/m²/일인지 찾아 오세요. 기간이 달라 이 화면의 값(약 4.1)과 조금 다를 수 있어요.\"}'></div>"
        + "<div data-map='{\"id\":\"school-roof\",\"name\":\"창원 웅천고 일대\",\"lat\":35.1125,\"lng\":128.7495,\"zoom\":15,\"ask\":\"위성 사진에서 지붕에 태양광 패널이 있는 건물을 찾아보세요. 패널은 대부분 어느 쪽을 향해 있나요?\"}'></div>");
      draw();
      return {
        judge: function () {
          if (k === BEST) return { ok: true, msg: BEST + "월이 하루 " + SW[BEST].toFixed(2) + " kWh/m²로 가장 많습니다. 7월(" + SW[7].toFixed(2) + ")은 해가 높아도 장마 구름(하루 " + PR[7].toFixed(1) + " mm 비) 때문에 적어요." };
          return { ok: false, msg: k + "월은 " + SW[k].toFixed(2) + " kWh/m²입니다. 더 높은 막대가 있습니다." };
        }
      };
    },
    hints: ["가장 높은 파란 막대를 찾으세요.", "‘구름 없을 때도 함께’를 켜면 5~7월이 모두 높지만, 실제로는 장마가 시작되기 전이 가장 많습니다."],
    solution: "<b>" + BEST + "월</b> (하루 약 " + SW[BEST].toFixed(1) + " kWh/m²).",
    why: "구름이 없다면 해가 높고 낮이 긴 5~7월(하지 무렵)에 햇빛이 가장 많이 닿습니다. 그러나 우리나라는 6월 말부터 장마가 시작되고 7~9월에는 비구름이 잦아, 지표에 실제로 닿는 햇빛은 맑은 날이 많은 늦봄(5월)에 가장 많습니다(해마다 조금 다르지만 10년 중 6번이 5월). 태양에서 온 에너지가 지구에서 날씨를 만들고, 그 날씨가 다시 우리가 쓸 수 있는 햇빛의 양을 바꾸는 셈입니다.<br>"
      + "태양광 발전소를 세울 때는 이렇게 그 지역의 실제 관측 자료로 발전량을 미리 계산합니다. 교과서의 ‘평균적인’ 값이 아니라 우리 동네 값이 필요한 까닭입니다."
  },
  {
    id: "r2", sec: "03", tag: "실제 자료 · 에너지 효율", title: "학교 지붕 태양광, 한 해 몇 kWh를 만들까", short: "한 해 발전량",
    who: "🔋", name: "학교 행정실",
    say: "“옥상에 패널을 <b>100 m²</b> 깔 수 있대요. 패널은 받은 햇빛의 <b>20%</b>를 전기로 바꾸고(효율), 열·먼지·전선·인버터에서 다시 <b>20%</b>가 줄어 실제로는 그중 <b>80%</b>만 쓸 수 있어요. 앞 사례의 월별 자료로 <b>한 해 동안 만들 전기(kWh)</b>를 구해 주세요.”",
    predict: {
      q: "패널에 닿은 햇빛 에너지 가운데 우리가 실제로 쓰는 전기는 대략 얼마일까요?",
      options: ["㉠ 거의 전부(90% 넘게)", "㉡ 절반쯤", "㉢ 6분의 1 정도(약 16%)"],
      answer: 2
    },
    task: "한 해 일사량(kWh/m²) × 넓이 × 효율 × 0.8을 계산해, <b>한 해 발전량</b>을 슬라이더로 맞추세요(± 1,000 kWh).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(270), ctx = cv.ctx, W = cv.W, g = 10000;
      function draw() {
        bars(H, ctx, W, cv.H, 0, false);
        roof(ctx, cv.H, 0, true);
        judge(ctx, W, cv.H, "판정 · 한 해 발전량", g.toLocaleString() + " kWh", Math.abs(g - OUT) <= 1000 ? LT.green : LT.orange, [["한 해 일사량", Math.round(YEAR) + " kWh/m²"], ["집 몇 채 몫", (g / 3600).toFixed(1) + " 채"], ["효율 × 손실", "0.2 × 0.8"]], Math.abs(g - OUT) <= 1000 ? "계산이 맞았다" : "넓이·효율·0.8을 곱해 보자", Math.abs(g - OUT) <= 1000);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "한 해 발전량", min: 2000, max: 60000, step: 500, value: 10000, fmt: function (x) { return x.toLocaleString() + " kWh"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("한 해 일사량 = 달마다 (하루 일사량 × 그 달의 날수)를 더한 값 ≈ " + Math.round(YEAR) + " kWh/m². 4인 가구가 한 달에 약 300 kWh를 쓴다고 보았습니다. " + SRC);
      draw();
      return {
        judge: function () {
          if (Math.abs(g - OUT) <= 1000) return { ok: true, msg: Math.round(YEAR) + " × 100 × 0.2 × 0.8 ≈ " + Math.round(OUT).toLocaleString() + " kWh — 집 약 " + (OUT / 3600).toFixed(1) + " 채가 한 해 쓰는 전기입니다." };
          if (Math.abs(g - YEAR * AREA * EFF) <= 1000) return { ok: false, msg: "효율 20% 까지는 맞았습니다. 열·먼지·인버터에서 줄어드는 20%도 빼야 해요(× 0.8)." };
          return { ok: false, msg: g.toLocaleString() + " kWh는 " + (g < OUT ? "적습니다" : "많습니다") + ". 한 해 일사량에 넓이·효율·0.8을 차례로 곱해 보세요." };
        }
      };
    },
    hints: ["한 해 일사량은 안내 칸에 있습니다(약 " + Math.round(YEAR) + " kWh/m²).", Math.round(YEAR) + " × 100 = " + (Math.round(YEAR) * 100).toLocaleString() + " kWh가 패널에 닿고, × 0.2 × 0.8을 하세요."],
    solution: "약 " + Math.round(YEAR) + " × 100 × 0.2 × 0.8 ≈ <b>" + Math.round(OUT).toLocaleString() + " kWh</b>.",
    why: "패널에 닿은 햇빛 에너지 가운데 전기로 바뀌는 것은 약 16%(0.2 × 0.8) 뿐이고, 나머지는 대부분 열이 되고 일부는 반사됩니다. 에너지는 사라지지 않지만(에너지 보존) 쓸모 있는 형태로 바뀌는 몫이 <b>효율</b>입니다. 효율을 20%에서 21%로 1%p만 올려도 같은 지붕에서 한 해 약 1,200 kWh(5%)를 더 얻습니다.<br>"
      + "태양광 전기는 발전하는 동안 온실 기체를 내지 않지만, 밤과 흐린 날에는 만들 수 없어 저장 장치나 다른 발전 방식과 함께 써야 합니다. ※ 실제 발전량은 패널의 방향·기울기·그늘에 따라 달라집니다."
  }
  ]
});
})();
