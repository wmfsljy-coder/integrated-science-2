/* 통합과학2 Ⅰ-1 지구 환경 변화와 생물다양성 — 소단원별 이야기 세 편
   01 1센티미터의 점토층 / 02 가뭄이 지나간 섬 / 03 한 가지만 심은 밭
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is2-1-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
/* 되풀이해도 같은 값이 나오는 난수 (미션 판정이 기기마다 달라지지 않게) */
function rng(seed) {
  var s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return function () { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; };
}
function gauss(r) { var u = Math.max(r(), 1e-9), w = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); }
function segOn(box, btn) { Array.prototype.forEach.call(box.querySelectorAll("button"), function (b) { b.classList.toggle("on", b === btn); }); }
function first(p) { return p ? p.charAt(0) : "-"; }

/* =========================================================================
   이야기 ① 1센티미터의 점토층
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 */
  window.sthGate({
    gate: "g1", key: "p1", title: "탐정의 첫 추리",
    question: "겨우 1 cm의 점토층을 경계로 바다 생물이 거의 다 바뀌었습니다. 이 층이 쌓이는 동안 무슨 일이 있었을까요?",
    options: ["㉠ 아주 오랜 세월에 걸쳐 기후가 서서히 변해 생물이 조금씩 사라졌다", "㉡ 새로 나타난 생물과의 경쟁에서 밀려 차례로 사라졌다", "㉢ 지구 밖에서 온 천체가 충돌해 환경이 갑자기 바뀌었다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 이리듐 분석 + 소행성 크기 */
  function irAt(z) { return 0.3 + 8.7 * Math.exp(-Math.abs(z) / (z >= 0 ? 5 : 2)); }        // ppb, 구비오: 바탕 0.3 → 최고 9
  function deposit(d) { var cm = d * 1e5; return 2.2 * Math.PI / 6 * cm * cm * cm * 0.5e-6 * 0.22 / 5.1e18 * 1e9; }   // ng/cm²
  var irOK = { a: false, b: false, c: !!window.sthState("astOK") };
  function mission2() {
    if (irOK.a) done("m1-2a"); if (irOK.b) done("m1-2b"); if (irOK.c) done("m1-2c");
    if (irOK.a && irOK.b && irOK.c) {
      window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>점토층의 이리듐은 주변 석회암의 약 <b>30배</b>. 우주 먼지가 천천히 쌓여서는 나올 수 없는 양이고, 지름 <b>수 km~10 km</b>급 소행성 하나가 있어야 설명됩니다.");
      ep.clear(1);
    }
  }
  (function () {
    var canvas = $("a-c-ir"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var z = -30, log = window.sthState("irLog") || [];
    var fr = rng(66), fos = [];
    for (var i = 0; i < 46; i++) fos.push({ x: 60 + fr() * 220, y: 196 + fr() * 126, r: 3 + fr() * 5 });
    for (var j = 0; j < 9; j++) fos.push({ x: 60 + fr() * 220, y: 40 + fr() * 120, r: 1.6 });
    function yOf(zz) { return 180 - zz * 3.75; }
    function draw() {
      paper(ctx, W, H);
      /* 지층 기둥 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(50, 30, 240, 146);
      ctx.fillStyle = v("--amber-100"); ctx.fillRect(50, 184, 240, 146);
      ctx.fillStyle = v("--coral-700"); ctx.fillRect(50, 176, 240, 8);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(50, 30, 240, 300);
      fos.forEach(function (f) { ctx.strokeStyle = v("--mist"); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.stroke(); });
      text(ctx, "신생대 석회암", 58, 48, { s: 11.5, w: "800" });
      text(ctx, "중생대 백악기 석회암", 58, 322, { s: 11.5, w: "800" });
      text(ctx, "점토층", 296, 184, { s: 11, w: "800", c: v("--coral-700") });
      /* 채취 위치 */
      var py = yOf(z);
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(30, py); ctx.lineTo(400, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(290, py, 6, 0, Math.PI * 2); ctx.fill();
      text(ctx, "⛏ " + (z > 0 ? "+" : (z < 0 ? "−" : "")) + Math.abs(z) + " cm", 300, py + (z > -6 && z < 6 ? 22 : -8), { s: 12, w: "800", c: v("--brand-700") });
      /* 그래프 */
      var x0 = 430, x1 = 850;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, 30); ctx.lineTo(x0, 330); ctx.lineTo(x1, 330); ctx.stroke();
      for (var p = 0; p <= 10; p += 2) { var gx = x0 + p / 10 * (x1 - x0); text(ctx, String(p), gx, 346, { s: 10.5, c: v("--mist"), a: "center" }); ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(gx, 30); ctx.lineTo(gx, 330); ctx.stroke(); ctx.globalAlpha = 1; }
      text(ctx, "이리듐 농도 (ppb, 10억분의 1)", x1, 22, { s: 12, w: "800", a: "right" });
      ctx.strokeStyle = v("--coral-700"); ctx.globalAlpha = .5; ctx.beginPath(); ctx.moveTo(x0, 180); ctx.lineTo(x1, 180); ctx.stroke(); ctx.globalAlpha = 1;
      var pts = log.slice().sort(function (a, b) { return a.z - b.z; });
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2; ctx.beginPath();
      pts.forEach(function (q, k) { var xx = x0 + q.v / 10 * (x1 - x0), yy = yOf(q.z); if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); });
      ctx.stroke();
      pts.forEach(function (q) { ctx.fillStyle = q.v >= 6 ? v("--rose") : v("--violet"); ctx.beginPath(); ctx.arc(x0 + q.v / 10 * (x1 - x0), yOf(q.z), 5.5, 0, Math.PI * 2); ctx.fill(); });
      if (!pts.length) text(ctx, "아직 분석한 시료가 없습니다", (x0 + x1) / 2, 120, { s: 12, c: v("--mist"), a: "center" });
    }
    function check() {
      var seen = {}, n = 0, hi = false;
      log.forEach(function (q) { if (!seen[q.z]) { seen[q.z] = 1; n++; } if (q.v >= 6) hi = true; });
      irOK.a = n >= 5; irOK.b = hi; mission2();
    }
    function say() {
      var rows = log.slice(-4).map(function (q) { return "높이 " + (q.z > 0 ? "+" : "") + q.z + " cm → 이리듐 <b>" + q.v.toFixed(1) + " ppb</b>" + (q.v >= 6 ? " — ⚠️ 주변의 20~30배!" : (q.v > 1 ? " — 바탕값보다 높음" : " — 바탕값 수준")); });
      if (rows.length) $("a-ir-info").innerHTML = "<b>분석 기록</b> (시료 " + log.length + "개)<br>" + rows.join("<br>");
    }
    canvas._redraw = draw;
    $("a-ir-z").addEventListener("input", function (e) { z = +e.target.value; $("a-ir-z-val").textContent = (z > 0 ? "+" : (z < 0 ? "−" : "")) + Math.abs(z) + " cm"; draw(); });
    $("a-ir-pick").addEventListener("click", function () {
      log.push({ z: z, v: Math.round(irAt(z) * 10) / 10 });
      if (log.length > 24) log = log.slice(-24);
      window.sthState("irLog", log);
      draw(); say(); check();
    });
    draw(); say(); check();
  })();
  (function () {
    var canvas = $("a-c-ast"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h, d = 2;
    function tons(dd) { var t = 2.2 * Math.PI / 6 * Math.pow(dd, 3) * 10; return t >= 10000 ? (t / 10000).toFixed(1) + "조 톤" : Math.round(t).toLocaleString() + "억 톤"; }   // 1 km³ × 2.2 g/cm³ = 22억 톤
    function draw() {
      paper(ctx, W, H);
      var g = 226, k = 9.5;                                   // 1 km = 9.5 px
      ctx.fillStyle = v("--line"); ctx.fillRect(30, g, 440, 3);
      ctx.fillStyle = v("--mist"); ctx.beginPath(); ctx.moveTo(50, g); ctx.lineTo(50 + 8.85 * k * .9, g - 8.85 * k); ctx.lineTo(50 + 8.85 * k * 1.9, g); ctx.closePath(); ctx.fill();
      text(ctx, "에베레스트산 8.8 km", 40, g + 20, { s: 11, c: v("--mist") });
      var r = d * k / 2, cx = 345;
      ctx.fillStyle = v("--coral-700"); ctx.beginPath(); ctx.arc(cx, g - r, r, 0, Math.PI * 2); ctx.fill();
      text(ctx, "소행성 " + d.toFixed(1) + " km", cx, g + 20, { s: 12, w: "800", a: "center" });
      /* 이리듐 쌓이는 양 */
      var dep = deposit(d), x0 = 520, x1 = 860, max = 40;
      text(ctx, "지구 전체에 고르게 쌓이는 이리듐 (ng/cm²)", x0, 50, { s: 12.5, w: "800" });
      ctx.fillStyle = v("--card-2"); ctx.fillRect(x0, 80, x1 - x0, 40);
      ctx.fillStyle = v("--green"); ctx.globalAlpha = .35; ctx.fillRect(x0 + 7 / max * (x1 - x0), 72, 2 / max * (x1 - x0), 56); ctx.globalAlpha = 1;
      ctx.fillStyle = dep >= 7 && dep <= 9 ? v("--green") : v("--violet"); ctx.fillRect(x0, 80, clamp(dep / max, 0, 1) * (x1 - x0), 40);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(x0, 80, x1 - x0, 40);
      [0, 10, 20, 30, 40].forEach(function (t) { text(ctx, String(t), x0 + t / max * (x1 - x0), 146, { s: 10.5, c: v("--mist"), a: "center" }); });
      text(ctx, "▲ 구비오 측정값 8", x0 + 8 / max * (x1 - x0) - 6, 166, { s: 11, w: "800", c: v("--green-700") });
      text(ctx, (dep >= 100 ? Math.round(dep) : dep.toFixed(1)) + " ng/cm²" + (dep > max ? " ▶ 눈금 밖" : ""), x0, 200, { s: 18, w: "900", c: dep >= 7 && dep <= 9 ? v("--green-700") : v("--ink") });
      text(ctx, "가정: 소행성 밀도 2.2 g/cm³, 이리듐 0.5 ppm, 22%가 성층권으로 퍼짐", x1, 236, { s: 10, c: v("--mist"), a: "right" });
      $("a-ast-info").innerHTML = "지름 <b>" + d.toFixed(1) + " km</b> 소행성의 질량은 약 <b>" + tons(d) + "</b>. " +
        (dep < 7 ? "측정값 8 ng/cm²에 못 미칩니다. 더 큰 천체가 필요합니다." : (dep > 9 ? "측정값보다 너무 많이 쌓입니다. 지름이 조금만 커져도 부피는 세제곱으로 늘어납니다." :
          "✅ 측정값과 맞습니다! 알바레즈 연구팀도 이 계산으로 약 7 km를 얻었고, 다른 방법들과 종합해 <b>지름 10 ± 4 km</b>의 소행성 충돌을 주장했습니다. 에베레스트산만 한 돌덩이가 떨어진 셈입니다."));
      if (dep >= 7 && dep <= 9 && !irOK.c) { irOK.c = true; window.sthState("astOK", 1); window.sthState("astD", d); mission2(); }
    }
    canvas._redraw = draw;
    $("a-ast-d").addEventListener("input", function (e) { d = +e.target.value; $("a-ast-d-val").textContent = d.toFixed(1) + " km"; draw(); });
    draw();
  })();

  /* 장면 3 — 지구의 1년 달력 */
  (function () {
    var canvas = $("a-c-cal"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var day = 1, got = window.sthState("cal") || { a: false, b: false }, sorted = !!window.sthState("fosSorted");
    var ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function md(d) { var m = 0; while (d > ML[m]) { d -= ML[m]; m++; } return (m + 1) + "월 " + d + "일"; }
    function maStart(d) { return 4600 * (1 - (d - 1) / 365); }
    function maEnd(d) { return 4600 * (1 - d / 365); }
    function dayOf(ma) { return Math.min(365, Math.floor((1 - ma / 4600) * 365) + 1); }
    function fmt(ma) { return ma >= 100 ? "약 " + (ma / 100).toFixed(1) + "억 년 전" : (ma < 0.5 ? "현재" : "약 " + Math.round(ma * 100).toLocaleString() + "만 년 전"); }
    var ERAS = [
      { name: "선캄브리아 시대", from: 4600, to: 539, c: "--violet" },
      { name: "고생대", from: 539, to: 252, c: "--teal" },
      { name: "중생대", from: 252, to: 66, c: "--coral" },
      { name: "신생대", from: 66, to: 0, c: "--amber" }
    ];
    var EVENTS = [
      { ma: 4600, t: "지구가 태어났습니다." },
      { ma: 3500, t: "가장 오래된 생물의 흔적으로 꼽히는 <b>스트로마톨라이트</b>(남세균이 만든 퇴적 구조)가 이 무렵의 것입니다." },
      { ma: 2400, t: "남세균의 광합성으로 대기 중 <b>산소</b>가 크게 늘기 시작합니다." },
      { ma: 539, t: "🎉 <b>고생대가 시작되는 날</b>입니다. 삼엽충처럼 단단한 껍데기를 가진 생물이 갑자기 다양해져 화석이 풍부해집니다." },
      { ma: 445, t: "⚠️ 오르도비스기 말 대멸종." },
      { ma: 372, t: "⚠️ 데본기 후기 대멸종." },
      { ma: 252, t: "⚠️ <b>페름기 말 대멸종</b>으로 삼엽충이 사라지고, 이날 고생대가 끝나 <b>중생대</b>가 시작됩니다." },
      { ma: 201, t: "⚠️ 트라이아스기 말 대멸종. 이후 공룡의 시대가 열립니다." },
      { ma: 66, t: "☄️ <b>공룡이 사라진 날</b>입니다. 소행성 충돌과 함께 중생대가 끝나고 <b>신생대</b>가 시작됩니다." },
      { ma: 0.3, t: "현생 인류(호모 사피엔스)는 이날 <b>밤 11시 26분쯤</b>에야 나타납니다." }
    ];
    EVENTS.forEach(function (e) { e.day = dayOf(e.ma); });
    function eraOf(d) { var e = maEnd(d); for (var i = 0; i < ERAS.length; i++) if (e >= ERAS[i].to && e < ERAS[i].from) return ERAS[i]; return ERAS[3]; }
    function draw() {
      paper(ctx, W, H);
      var x0 = 40, x1 = 860;
      function xd(d) { return x0 + d / 365 * (x1 - x0); }
      text(ctx, "지구의 역사 46억 년 = 1년", x0, 28, { s: 13, w: "800" });
      ERAS.forEach(function (E) {
        var a = (1 - E.from / 4600) * 365, b = (1 - E.to / 4600) * 365;
        ctx.fillStyle = v(E.c); ctx.globalAlpha = .8; ctx.fillRect(xd(a), 44, xd(b) - xd(a), 40); ctx.globalAlpha = 1;
      });
      text(ctx, "선캄브리아 시대", xd(160), 69, { s: 13, w: "800", a: "center", c: v("--on-accent") });
      var acc = 0;
      ML.forEach(function (n, m) { var xx = xd(acc); ctx.strokeStyle = v("--panel"); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xx, 44); ctx.lineTo(xx, 84); ctx.stroke(); text(ctx, (m + 1) + "월", xd(acc + n / 2), 100, { s: 10.5, c: v("--mist"), a: "center" }); acc += n; });
      /* 확대: 11월 1일(305일째) ~ 12월 31일 */
      var z0 = 304, zx0 = 120, zx1 = 860;
      function xz(d) { return zx0 + (d - z0) / (365 - z0) * (zx1 - zx0); }
      ctx.strokeStyle = v("--line"); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(xd(z0), 84); ctx.lineTo(zx0, 160); ctx.moveTo(xd(365), 84); ctx.lineTo(zx1, 160); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "확대", 40, 178, { s: 11, c: v("--mist") }); text(ctx, "11월~12월", 40, 194, { s: 11, c: v("--mist") });
      ctx.fillStyle = v("--violet"); ctx.globalAlpha = .8; ctx.fillRect(zx0, 160, zx1 - zx0, 44); ctx.globalAlpha = 1;
      ERAS.slice(1).forEach(function (E) {
        var a = (1 - E.from / 4600) * 365, b = (1 - E.to / 4600) * 365;
        ctx.fillStyle = v(E.c); ctx.fillRect(xz(a), 160, xz(b) - xz(a), 44);
        text(ctx, E.name, (xz(a) + xz(b)) / 2, 187, { s: 12.5, w: "800", a: "center", c: v("--on-accent") });
      });
      [305, 315, 325, 335, 345, 355, 365].forEach(function (d) { text(ctx, md(d), xz(d - .5), 222, { s: 10, c: v("--mist"), a: "center" }); });
      EVENTS.forEach(function (e) { if (e.ma > 539 || e.ma < 1) return; var xx = xz(e.day - .5); ctx.fillStyle = v("--ink"); ctx.beginPath(); ctx.moveTo(xx, 158); ctx.lineTo(xx - 5, 148); ctx.lineTo(xx + 5, 148); ctx.closePath(); ctx.fill(); });
      text(ctx, "▼ 표시는 생물 무리가 크게 바뀐 사건", zx1, 142, { s: 10.5, c: v("--mist"), a: "right" });
      /* 커서 */
      var cx = xd(day - .5);
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx, 38); ctx.lineTo(cx, 90); ctx.stroke();
      if (day > z0) { var cz = xz(day - .5); ctx.beginPath(); ctx.moveTo(cz, 154); ctx.lineTo(cz, 210); ctx.stroke(); }
      var E = eraOf(day);
      text(ctx, md(day) + " · " + E.name, clamp(cx, 90, 810), 270, { s: 15, w: "900", a: "center", c: v(E.c + "-700") });
      text(ctx, fmt(maStart(day)) + " ~ " + fmt(maEnd(day)), clamp(cx, 110, 790), 290, { s: 11.5, c: v("--mist"), a: "center" });

      $("a-cal-d-val").textContent = md(day);
      var hit = EVENTS.filter(function (e) { return e.day === day; }).map(function (e) { return e.t; });
      $("a-cal-info").innerHTML = "<b>" + md(day) + "</b> (" + fmt(maStart(day)) + " ~ " + fmt(maEnd(day)) + ") · <b>" + E.name + "</b><br>" +
        (hit.length ? hit.join(" ") : (E === ERAS[0] ? "아직 선캄브리아 시대입니다. 이 시대가 1년 가운데 <b>322일(약 88%)</b>을 차지하지만, 생물이 단순하고 단단한 부분이 없어 화석이 드뭅니다." :
          "하루가 약 1260만 년입니다. 날짜를 하루씩 옮기며 ▼ 표시가 있는 날을 찾아보세요."));
      var ch = false;
      if (!got.a && Math.abs(day - 323) <= 1) { got.a = ch = true; }
      if (!got.b && Math.abs(day - 360) <= 1) { got.b = ch = true; }
      if (ch) { window.sthState("cal", got); mission(); }
    }
    function mission() {
      if (got.a) { done("m1-3a"); $("m1-3a").innerHTML = "고생대는 <b>11월 19일</b>에야 시작됩니다. 그 앞 322일이 선캄브리아 시대입니다."; }
      if (got.b) { done("m1-3b"); $("m1-3b").innerHTML = "공룡이 사라진 날은 <b>12월 26일</b>. 중생대는 약 2주, 신생대는 엿새가 채 안 됩니다."; }
      if (sorted) done("m1-3c");
      if (got.a && got.b && sorted) { window.sthMission("m1-3", true); ep.clear(2); }
    }
    canvas._redraw = draw;
    $("a-cal-d").addEventListener("input", function (e) { day = +e.target.value; draw(); });

    window.sthGate({
      gate: "gt", key: "dino", title: "잠깐, 중생대 퀴즈",
      question: "중생대 하늘을 날던 <b>익룡</b>은 공룡일까요?",
      options: ["㉠ 공룡이다", "㉡ 공룡이 아니다", "㉢ 공룡의 조상이다", "㉣ 공룡이 진화한 것이다"],
      onPick: function (i) {
        var ok = (i === 1);
        window.sthState("dinoOK", ok ? "맞음" : "어긋남");
        var box = $("a-dino-info"); box.hidden = false;
        box.innerHTML = (ok ? "<b>맞았습니다.</b> " : "<b>정답은 ㉡ 입니다.</b> ") + "공룡은 <b>중생대 육상에서 살았던 공룡상목 파충류</b>만을 가리킵니다. 익룡, 어룡, 수장룡은 모두 중생대에 살았지만 <b>공룡이 아닙니다.</b> 중생대 파충류가 모두 공룡인 것은 아닙니다.";
      }
    });

    window.sthSort({
      mount: "s1-fossil",
      buckets: [{ id: "p", label: "고생대", sub: "11월 19일 ~ 12월 11일" }, { id: "m", label: "중생대", sub: "12월 12일 ~ 12월 26일" }, { id: "c", label: "신생대", sub: "12월 26일 ~ 지금" }],
      items: [
        { t: "🪲 삼엽충", a: "p", why: "고생대 바다에 번성한 대표적인 표준 화석입니다." },
        { t: "🌾 방추충(푸줄리나)", a: "p", why: "고생대 후기의 표준 화석입니다.", hint: "쌀알 모양의 껍데기를 가진 고생대 후기 바다 생물입니다." },
        { t: "🐟 갑주어", a: "p", why: "단단한 골판으로 덮인 고생대의 어류입니다.", hint: "최초의 척추동물 무리에 속합니다." },
        { t: "🐚 암모나이트", a: "m", why: "중생대 바다에 번성했고 백악기 말에 멸종했습니다." },
        { t: "🦕 공룡", a: "m", why: "중생대 육지를 지배했습니다." },
        { t: "🪶 시조새", a: "m", why: "중생대 쥐라기 지층에서 발견됩니다.", hint: "파충류와 조류의 특징을 함께 가진 생물입니다." },
        { t: "🪙 화폐석", a: "c", why: "신생대 전기 바다에 번성한 대형 유공충입니다.", hint: "동전처럼 생긴 유공충으로, 공룡이 사라진 뒤의 바다에 살았습니다." },
        { t: "🦣 매머드", a: "c", why: "신생대 후기 빙하기에 살았던 포유류입니다." }
      ],
      doneText: "이렇게 특정 시대에만 살았던 생물의 화석(표준 화석)이 나오면 그 지층이 쌓인 시대를 알 수 있습니다.",
      onDone: function () { sorted = true; window.sthState("fosSorted", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 다섯 번의 대멸종 */
  var EXT = [
    { name: "오르도비스기 말", ma: 445, loss: 85, depth: .26, desc: "급격한 <b>빙하기</b>로 해수면이 낮아지고 얕은 바다가 사라져, 해양 생물 종의 약 85%가 사라진 것으로 추정됩니다." },
    { name: "데본기 후기", ma: 372, loss: 75, depth: .2, desc: "바다의 <b>산소 부족</b>과 기후 변화로 산호, 갑주어 등 해양 생물이 큰 타격을 입었습니다(약 75%)." },
    { name: "페름기 말", ma: 252, loss: 96, depth: .52, desc: "지구 역사상 <b>가장 큰 멸종</b>입니다. 시베리아의 대규모 화산 분출이 온난화와 해양 산성화·산소 부족을 일으켜 해양 생물 종의 약 96%가 사라졌고 삼엽충도 이때 멸종했습니다. 이 사건이 고생대와 중생대의 경계입니다." },
    { name: "트라이아스기 말", ma: 201, loss: 80, depth: .22, desc: "판게아가 갈라지며 일어난 대규모 <b>화산 활동</b>으로 생물 종의 약 80%가 사라졌습니다. 경쟁자가 사라진 뒤 공룡이 번성했습니다." },
    { name: "백악기 말", ma: 66, loss: 75, depth: .18, desc: "<b>소행성 충돌</b>로 공룡, 암모나이트를 포함한 생물 종의 약 75%가 멸종했습니다. 중생대와 신생대의 경계이며, 이후 포유류가 번성했습니다." }
  ];
  (function () {
    var canvas = $("a-c-ext"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var c2 = $("a-c-bar"), ctx2 = window.setupCanvas(c2);
    var t = 540, found = window.sthState("extFound") || [0, 0, 0, 0, 0], sorted = !!window.sthState("extSorted"), near = -1;
    var CP = [[540, 80], [500, 190], [470, 380], [445, 450], [372, 470], [300, 440], [252, 430], [201, 380], [150, 500], [100, 640], [66, 720], [0, 1000]];
    function base(tt) { for (var i = 0; i < CP.length - 1; i++) if (tt <= CP[i][0] && tt >= CP[i + 1][0]) return lerp(CP[i][1], CP[i + 1][1], (CP[i][0] - tt) / (CP[i][0] - CP[i + 1][0])); return 1000; }
    function fam(tt) { var f = base(tt); EXT.forEach(function (e) { if (tt < e.ma) f *= 1 - e.depth * Math.exp(-(e.ma - tt) / 9); }); return f; }
    function fmtT(tt) { return tt >= 100 ? (tt / 100).toFixed(2) + "억 년 전" : (tt === 0 ? "현재" : (tt * 100).toLocaleString() + "만 년 전"); }
    function nFound() { return found.reduce(function (a, b) { return a + (b ? 1 : 0); }, 0); }
    function draw() {
      paper(ctx, W, H);
      var x0 = 70, x1 = 860, y0 = 40, y1 = 262;
      function X(tt) { return x0 + (540 - tt) / 540 * (x1 - x0); }
      function Y(f) { return y1 - f / 1100 * (y1 - y0); }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      text(ctx, "화석으로 남은 해양 생물 무리(과)의 수 — 개략도", x0 + 8, 28, { s: 12.5, w: "800" });
      [[539, 252, "고생대", "--teal"], [252, 66, "중생대", "--coral"], [66, 0, "신생대", "--amber"]].forEach(function (E) {
        ctx.fillStyle = v(E[3]); ctx.fillRect(X(Math.min(E[0], 540)), y1 + 6, X(E[1]) - X(Math.min(E[0], 540)), 14);
        text(ctx, E[2], (X(Math.min(E[0], 540)) + X(E[1])) / 2, y1 + 17, { s: 10.5, w: "800", a: "center", c: v("--on-accent") });
      });
      [500, 400, 300, 200, 100, 0].forEach(function (tt) { text(ctx, tt === 0 ? "현재" : (tt / 100) + "억 년 전", X(tt), y1 + 38, { s: 10.5, c: v("--mist"), a: tt === 0 ? "right" : "center" }); });
      ctx.beginPath();
      for (var tt = 540; tt >= 0; tt -= 1) { if (tt === 540) ctx.moveTo(X(tt), Y(fam(tt))); else ctx.lineTo(X(tt), Y(fam(tt))); }
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.stroke();
      ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fillStyle = v("--brand"); ctx.globalAlpha = .12; ctx.fill(); ctx.globalAlpha = 1;
      EXT.forEach(function (e, i) {
        if (!found[i]) return;
        var xx = X(e.ma);
        ctx.fillStyle = v("--rose"); ctx.beginPath(); ctx.moveTo(xx, Y(fam(e.ma + 1)) - 8); ctx.lineTo(xx - 7, Y(fam(e.ma + 1)) - 22); ctx.lineTo(xx + 7, Y(fam(e.ma + 1)) - 22); ctx.closePath(); ctx.fill();
        text(ctx, e.name, clamp(xx, 110, 810), Y(fam(e.ma + 1)) - 28, { s: 10.5, w: "800", a: "center", c: v("--rose-700") });
      });
      var cx = X(t);
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y1); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--ink"); ctx.beginPath(); ctx.arc(cx, Y(fam(t)), 6, 0, Math.PI * 2); ctx.fill();

      near = -1;
      EXT.forEach(function (e, i) { if (Math.abs(t - e.ma) <= 5) near = i; });
      if (near >= 0 && !found[near]) { found[near] = 1; window.sthState("extFound", found); bars(); mission(); draw(); return; }
      $("a-ext-info").innerHTML = near >= 0 ? "<b>⚠️ " + EXT[near].name + " 대멸종</b> (약 " + fmtT(EXT[near].ma) + ") — " + EXT[near].desc :
        "<b>" + fmtT(t) + "</b> · 곡선이 갑자기 꺼지는 곳으로 커서를 옮겨 보세요. 꺼진 뒤에는 곡선이 어떻게 되는지도 눈여겨보세요.";
    }
    function bars() {
      var W2 = c2._w, H2 = c2._h;
      paper(ctx2, W2, H2);
      var x0 = 250, x1 = 850;
      text(ctx2, "사건별 멸종 규모 — 사라진 종의 비율(추정)", 30, 24, { s: 12.5, w: "800" });
      EXT.forEach(function (e, i) {
        var y = 40 + i * 40;
        text(ctx2, found[i] ? e.name + " (" + fmtT(e.ma) + ")" : "아직 찾지 못한 사건", x0 - 10, y + 19, { s: 11.5, w: "700", a: "right", c: found[i] ? v("--ink") : v("--mist") });
        ctx2.fillStyle = v("--card-2"); ctx2.fillRect(x0, y, x1 - x0, 28);
        if (found[i]) {
          ctx2.fillStyle = i === near ? v("--rose") : (e.loss > 90 ? v("--coral-700") : v("--teal")); ctx2.fillRect(x0, y, (x1 - x0) * e.loss / 100, 28);
          text(ctx2, "약 " + e.loss + "%", x0 + 10, y + 19, { s: 12.5, w: "900", c: v("--on-accent") });
        } else text(ctx2, "?", x0 + 10, y + 19, { s: 12.5, w: "900", c: v("--mist") });
      });
    }
    function mission() {
      $("a-ext-n").textContent = nFound();
      if (nFound() === 5) done("m1-4a");
      if (sorted) done("m1-4b");
      if (nFound() === 5 && sorted) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>원인은 빙하기, 산소 부족, 화산, 소행성으로 제각각이지만 공통점이 있습니다. <b>환경이 급격히 변했고</b>, 멸종 뒤에는 살아남은 생물이 다시 다양해져 <b>곡선이 이전보다 더 높이</b> 올라갔습니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = function () { draw(); bars(); };
    c2._redraw = bars;
    $("a-ext-t").addEventListener("input", function (e) { t = 540 - (+e.target.value); $("a-ext-t-val").textContent = fmtT(t); draw(); bars(); });
    window.sthSort({
      mount: "s1-cause",
      buckets: EXT.map(function (e, i) { return { id: "e" + i, label: e.name, sub: "약 " + fmtT(e.ma) }; }),
      items: [
        { t: "급격한 빙하기로 해수면이 낮아져 얕은 바다의 생물이 사라졌다", a: "e0", why: "오르도비스기 말 대멸종입니다.", hint: "위 화면에서 ‘빙하기’가 원인인 사건을 다시 찾아보세요." },
        { t: "바다에 산소가 부족해져 산호와 갑주어가 큰 타격을 입었다", a: "e1", why: "데본기 후기 대멸종입니다.", hint: "갑주어는 고생대 어류입니다." },
        { t: "시베리아의 대규모 화산 분출로 종의 약 96%가 사라졌다", a: "e2", why: "가장 규모가 큰 페름기 말 대멸종입니다." },
        { t: "삼엽충이 완전히 사라지고 고생대가 끝났다", a: "e2", why: "페름기 말 대멸종이 고생대와 중생대의 경계입니다.", hint: "고생대의 마지막 시기는 페름기입니다." },
        { t: "판게아가 갈라지며 화산 활동이 일어났고, 그 뒤 공룡이 번성했다", a: "e3", why: "트라이아스기 말 대멸종입니다.", hint: "공룡이 번성하기 ‘직전’의 사건입니다." },
        { t: "이리듐이 많은 점토층이 전 세계에 쌓였고, 그 뒤 포유류가 번성했다", a: "e4", why: "백악기 말 대멸종, 바로 이번 사건입니다." }
      ],
      onDone: function () { sorted = true; window.sthState("extSorted", 1); mission(); }
    });
    $("a-ext-t-val").textContent = fmtT(t);
    draw(); bars(); mission();
  })();

  /* 장면 5 — 결말 */
  var STEPS = ["지름 약 10 km의 소행성이 지금의 유카탄반도에 충돌한다", "엄청난 양의 먼지와 그을음이 대기로 퍼져 햇빛을 가린다", "기온이 떨어지고 식물과 식물 플랑크톤의 광합성이 크게 줄어든다", "먹이 사슬이 아래부터 무너져 공룡과 암모나이트 등이 멸종한다", "살아남은 작은 포유류와 조류가 빈 환경으로 퍼져 신생대에 번성한다"];
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "처음부터 정확히 짚었습니다. 이제 이리듐이라는 증거까지 갖췄네요." : "1980년 이전에는 많은 과학자도 그렇게 생각했습니다. 1 cm 점토층의 이리듐이 생각을 바꿔 놓았습니다.") +
      "<br><b>내가 계산한 소행성</b> 지름 약 " + (window.sthState("astD") || "-") + " km";
  }
  function finish() { window.sthState("r1", "해결 · 첫 추리 " + first(window.sthState("p1")) + " · 이리듐으로 계산한 소행성 지름 약 " + (window.sthState("astD") || "-") + " km · 대멸종 5건 확인"); }
  if (ep.cleared(4)) {
    $("s1-order").innerHTML = "<div class='order sort'><div class='slots'>" + STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    reveal();
  } else {
    window.sthOrder({ mount: "s1-order", steps: STEPS, onDone: function () { reveal(); ep.clear(4); } });
  }
  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학2 Ⅰ-1] 이야기 ① 1센티미터의 점토층",
    items: [
      { id: "w1", label: "환경 변화와 생물다양성", hint: "대멸종 하나를 골라, 그때 환경이 어떻게 바뀌었고 생물다양성이 어떻게 달라졌는지 쓰세요." },
      { id: "e1b", label: "탐정의 증거 보고", hint: "‘소행성이 충돌했다’는 주장을 뒷받침하는 증거를 두 가지 이상 들고, 이리듐이 왜 증거가 되는지 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 가뭄이 지나간 섬
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "조사원의 첫 추리",
    question: "어떤 핀치가 살아남았고, 이듬해 태어난 새끼들의 부리는 어땠을까요?",
    options: ["㉠ 운 좋은 새들이 무작위로 살아남았고, 다음 세대의 부리는 예전과 같았다", "㉡ 딱딱한 씨앗을 깨려고 애쓰는 동안 새들의 부리가 저마다 두꺼워졌고, 그 부리가 새끼에게 전해졌다", "㉢ 원래 부리가 두꺼웠던 새들이 더 많이 살아남았고, 다음 세대는 평균 부리가 두꺼워졌다"],
    onPick: function () { ep.clear(0); }
  });

  /* 핀치 200마리 — 부리 두께 평균 9.4 mm, 표준 편차 0.8 mm */
  var BIRDS = (function () { var r = rng(1977), a = []; for (var i = 0; i < 200; i++) a.push({ p: 9.4 + 0.8 * gauss(r), u: r() }); return a; })();
  function mean(arr) { var s = 0; arr.forEach(function (b) { s += b.p; }); return arr.length ? s / arr.length : 0; }
  var MEAN0 = mean(BIRDS);

  /* 장면 2 — 변이 측정 */
  (function () {
    var canvas = $("b-c-var"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var n = Math.min(200, window.sthState("varN") || 0), answered = !!window.sthState("varQ");
    function draw() {
      paper(ctx, W, H);
      var x0 = 80, x1 = 860, y0 = 40, y1 = 262, bins = [], i;
      for (i = 0; i < 10; i++) bins.push(0);
      BIRDS.slice(0, n).forEach(function (b) { var k = clamp(Math.floor((b.p - 7) / 0.5), 0, 9); bins[k]++; });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      text(ctx, "마리", x0 - 10, y0 - 8, { s: 10.5, c: v("--mist"), a: "right" });
      [0, 20, 40, 60].forEach(function (c) { var gy = y1 - c / 60 * (y1 - y0); text(ctx, String(c), x0 - 10, gy + 4, { s: 10.5, c: v("--mist"), a: "right" }); });
      for (i = 0; i <= 10; i++) text(ctx, (7 + i * .5).toFixed(1), x0 + i / 10 * (x1 - x0), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      text(ctx, "부리 두께 (mm)", (x0 + x1) / 2, y1 + 40, { s: 11.5, w: "800", a: "center" });
      bins.forEach(function (c, k) {
        var bx = x0 + k / 10 * (x1 - x0) + 3, bw = (x1 - x0) / 10 - 6, bh = c / 60 * (y1 - y0);
        ctx.fillStyle = v("--teal"); ctx.fillRect(bx, y1 - bh, bw, bh);
        if (c) text(ctx, String(c), bx + bw / 2, y1 - bh - 6, { s: 11, w: "800", a: "center" });
      });
      if (n) {
        var m = mean(BIRDS.slice(0, n)), mx = x0 + (m - 7) / 5 * (x1 - x0);
        ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(mx, y0); ctx.lineTo(mx, y1); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, "평균 " + m.toFixed(2) + " mm", mx + 6, y0 + 10, { s: 12, w: "800", c: v("--coral-700") });
      }
      text(ctx, "잰 핀치 " + n + "마리", x1, 28, { s: 12.5, w: "800", a: "right" });
    }
    function say() {
      if (!n) return;
      var part = BIRDS.slice(0, n), lo = 99, hi = 0;
      part.forEach(function (b) { lo = Math.min(lo, b.p); hi = Math.max(hi, b.p); });
      $("b-var-info").innerHTML = "지금까지 <b>" + n + "마리</b> · 평균 <b>" + mean(part).toFixed(2) + " mm</b> · 가장 얇은 부리 " + lo.toFixed(1) + " mm, 가장 두꺼운 부리 " + hi.toFixed(1) + " mm" +
        (n >= 100 ? "<br>같은 종, 같은 섬인데도 부리 두께가 <b>" + (hi - lo).toFixed(1) + " mm</b>나 차이 납니다. 평균 근처가 가장 많고 양 끝으로 갈수록 드뭅니다." : "");
      if (n >= 200) { $("b-var-catch").disabled = true; $("b-var-catch").textContent = "섬의 표본 200마리를 모두 쟀습니다"; }
    }
    function check() {
      if (n >= 100) done("m2-2a"); if (answered) done("m2-2b");
      if (n >= 100 && answered) { window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>가뭄이 오기 <b>전부터</b> 핀치 집단에는 부리 두께의 변이가 있었습니다. 이 점을 꼭 기억해 두세요."); ep.clear(1); }
    }
    canvas._redraw = draw;
    $("b-var-catch").addEventListener("click", function () { n = Math.min(200, n + 20); window.sthState("varN", n); draw(); say(); check(); });
    window.sthPick({
      mount: "s2-q1",
      q: "이 분포에서 알 수 있는 것은 무엇일까요?",
      options: ["같은 종이면 부리 두께는 모두 같다", "같은 종 안에서도 개체마다 형질이 다르며, 이 차이는 가뭄이 오기 전부터 있었다", "부리가 두꺼운 새와 얇은 새는 서로 다른 종이다", "가뭄이 와야 비로소 부리 두께에 차이가 생긴다"],
      answer: 1,
      why: ["막대가 하나가 아니라 넓게 퍼져 있습니다.", "이렇게 같은 종의 개체 사이에 나타나는 형질의 차이가 변이입니다. 변이는 환경이 바뀌기 전에 이미 있습니다.", "모두 중간땅핀치 한 종입니다. 분포가 끊기지 않고 이어져 있지요.", "이 기록은 가뭄 전에 잰 것입니다."],
      onDone: function () { answered = true; window.sthState("varQ", 1); check(); }
    });
    draw(); say(); check();
  })();

  /* 장면 3 — 가뭄의 선택 */
  function theta(x) { return 8 + 0.06 * x; }
  function survives(b, x) { return b.u < 1 / (1 + Math.exp(-(b.p - theta(x)))); }
  (function () {
    var canvas = $("b-c-sel"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var x = 20, shown = null, running = false, tries = window.sthState("selTries") || [], okA = !!window.sthState("selOK"), okB = !!window.sthState("selQ");
    /* 점 자리: 0.1 mm 칸마다 쌓는다 */
    var slots = {}, POS = BIRDS.map(function (b) { var k = Math.round(b.p * 10); slots[k] = (slots[k] || 0) + 1; return { k: k, n: slots[k] }; });
    var ORDER = (function () { var r = rng(7), a = BIRDS.map(function (b, i) { return i; }); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; })();
    function draw() {
      paper(ctx, W, H);
      var x0 = 60, x1 = 860, yb = 300;
      function X(p) { return x0 + (p - 6.8) / 5.6 * (x1 - x0); }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, yb + 8); ctx.lineTo(x1, yb + 8); ctx.stroke();
      for (var p = 7; p <= 12; p += 1) text(ctx, p + " mm", X(p), yb + 28, { s: 10.5, c: v("--mist"), a: "center" });
      text(ctx, "부리 두께 →", x1, yb + 48, { s: 11, c: v("--mist"), a: "right" });
      var th = theta(x);
      ctx.fillStyle = v("--amber"); ctx.globalAlpha = .16; ctx.fillRect(X(clamp(th, 6.8, 12.4)), 60, x1 - X(clamp(th, 6.8, 12.4)), yb - 52); ctx.globalAlpha = 1;
      if (th < 12.2) text(ctx, "남은 씨앗을 깨기에 충분한 부리 ▶", Math.min(X(th) + 8, 640), 78, { s: 11, w: "800", c: v("--amber-700") });
      else text(ctx, "남은 씨앗을 깰 수 있는 핀치가 거의 없습니다", x1, 78, { s: 11, w: "800", c: v("--amber-700"), a: "right" });
      var alive = [];
      BIRDS.forEach(function (b, i) {
        var dead = shown && shown[i];
        if (!dead) alive.push(b);
        ctx.fillStyle = dead ? v("--line") : v("--coral"); ctx.globalAlpha = dead ? .7 : .95;
        ctx.beginPath(); ctx.arc(X(POS[i].k / 10), yb - (POS[i].n - 1) * 11, 4.6, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      var mx = X(MEAN0);
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(mx, 96); ctx.lineTo(mx, yb + 8); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "가뭄 전 평균 " + MEAN0.toFixed(2), mx - 6, 110, { s: 11, w: "800", c: v("--mist"), a: "right" });
      if (shown && alive.length && alive.length < 200) {
        var ms = mean(alive), sx = X(ms);
        ctx.strokeStyle = v("--coral-700"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, 96); ctx.lineTo(sx, yb + 8); ctx.stroke();
        text(ctx, "생존자 평균 " + ms.toFixed(2), sx + 6, 126, { s: 11.5, w: "800", c: v("--coral-700") });
      }
      text(ctx, "점 하나 = 핀치 한 마리 (200마리) · 회색 = 굶어 죽음", x0, 34, { s: 12.5, w: "800" });
      text(ctx, "살아 있는 핀치 " + alive.length + "마리", x1, 34, { s: 12.5, w: "800", a: "right", c: v("--coral-700") });
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "가뭄 세기 " + t.x + " → 생존 <b>" + t.s + "%</b>, 생존자 평균 " + (t.s ? t.m + " mm (" + (t.d >= 0 ? "+" : "") + t.d + ")" : "-") + " " + (t.ok ? "✅ 1977년과 비슷!" : (t.s > 18 ? "❌ 가뭄이 약해 대부분 살아남음" : "❌ 개체군이 사라질 위기")); });
      if (rows.length) $("b-sel-info").innerHTML = "<b>실험 기록</b><br>" + rows.join("<br>");
    }
    function check() {
      if (okA) done("m2-3a"); if (okB) done("m2-3b");
      if (okA && okB) { window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>가뭄은 아무나 죽이지 않았습니다. 부리가 두꺼운 개체가 <b>더 높은 확률로</b> 살아남아, 생존자의 평균 부리가 0.5~0.6 mm 두꺼워졌습니다(실제 기록은 약 0.5 mm). 이것이 <b>자연선택</b>입니다."); ep.clear(2); }
    }
    canvas._redraw = draw;
    $("b-sel-x").addEventListener("input", function (e) { if (running) return; x = +e.target.value; $("b-sel-x-val").textContent = x; shown = null; draw(); });
    $("b-sel-run").addEventListener("click", function () {
      if (running) return;
      running = true; $("b-sel-run").disabled = true; $("b-sel-x").disabled = true;
      var runX = x, deadList = ORDER.filter(function (i) { return !survives(BIRDS[i], runX); }), k = 0;
      shown = {};
      (function step() {
        var n = Math.ceil(deadList.length / 24);
        for (var j = 0; j < n && k < deadList.length; j++, k++) shown[deadList[k]] = 1;
        draw();
        if (k < deadList.length) window.setTimeout(step, 60);
        else {
          running = false; $("b-sel-run").disabled = false; $("b-sel-x").disabled = false;
          var alive = BIRDS.filter(function (b) { return survives(b, runX); }), s = alive.length / 2, ok = s >= 12 && s <= 18;
          tries.push({ x: runX, s: s, m: mean(alive).toFixed(2), d: +(mean(alive) - MEAN0).toFixed(2), ok: ok });
          window.sthState("selTries", tries.slice(-8));
          if (ok) { okA = true; window.sthState("selOK", 1); window.sthState("selBest", "가뭄 세기 " + runX + "에서 생존율 " + s + "%, 생존자 평균 +" + (mean(alive) - MEAN0).toFixed(2) + " mm"); }
          report(); check();
        }
      })();
    });
    window.sthPick({
      mount: "s2-q2",
      q: "가뭄을 겪는 동안, 핀치 한 마리 한 마리의 부리가 두꺼워진 걸까요?",
      options: ["그렇다. 딱딱한 씨앗을 먹다 보니 부리가 자랐다", "아니다. 각 개체의 부리는 그대로이고, 부리가 얇은 개체가 더 많이 죽어 ‘집단의 평균’이 달라졌다", "그렇다. 살아남으려는 의지가 부리를 바꿨다", "아니다. 평균은 달라지지 않았다"],
      answer: 1,
      why: ["다 자란 핀치의 부리 두께는 거의 변하지 않습니다. 점들이 옆으로 움직였는지 떠올려 보세요.", "점은 제자리에 있고, 회색으로 바뀐 점만 늘었습니다. 개체가 변한 것이 아니라 집단의 구성이 변했습니다.", "생물의 필요나 의지가 형질을 바꾸지는 않습니다.", "생존자 평균선이 오른쪽으로 옮겨 갔습니다."],
      onDone: function () { okB = true; window.sthState("selQ", 1); check(); }
    });
    draw(); report(); check();
  })();

  /* 장면 4 — 유전과 세대 (자손 평균의 변화 = 유전되는 비율 × 선택으로 생긴 부모 평균의 차이) */
  function selDiff(m, env, press) {
    var sd = 0.8, w = 1 / press, n = 0, d = 0;
    for (var i = -80; i <= 80; i++) {
      var p = m + i * sd / 20, phi = Math.exp(-i * i / 800);
      var f = env === "drought" ? 1 / (1 + Math.exp(-(p - 11.3) / w)) : 1 / (1 + Math.exp((p - 8.3) / w));
      n += phi * f; d += phi * f * p;
    }
    return d / n - m;
  }
  (function () {
    var canvas = $("b-c-gen"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var env = "drought", h = 0.4, press = 1, hist, zeroRun, peak, last = null;
    var ok = window.sthState("genOK") || { a: false, b: false, c: false };
    function reset() { hist = [{ m: 9.4, env: null }]; zeroRun = 0; peak = 9.4; last = null; }
    function cur() { return hist[hist.length - 1].m; }
    function draw() {
      paper(ctx, W, H);
      /* 왼쪽: 분포 */
      var x0 = 40, x1 = 440, yb = 300;
      function X(p) { return x0 + (p - 6.5) / 7 * (x1 - x0); }
      function bell(m, col, dash, fill) {
        ctx.beginPath();
        for (var p = 6.5; p <= 13.5; p += 0.05) { var y = yb - 210 * Math.exp(-(p - m) * (p - m) / (2 * .64)); if (p === 6.5) ctx.moveTo(X(p), y); else ctx.lineTo(X(p), y); }
        ctx.strokeStyle = col; ctx.lineWidth = dash ? 2 : 3; ctx.setLineDash(dash ? [6, 5] : []); ctx.stroke(); ctx.setLineDash([]);
        if (fill) { ctx.lineTo(x1, yb); ctx.lineTo(x0, yb); ctx.closePath(); ctx.fillStyle = col; ctx.globalAlpha = .15; ctx.fill(); ctx.globalAlpha = 1; }
      }
      text(ctx, "집단의 부리 두께 분포", x0, 28, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
      for (var p = 7; p <= 13; p += 1) text(ctx, String(p), X(p), yb + 18, { s: 10.5, c: v("--mist"), a: "center" });
      text(ctx, "부리 두께 (mm)", (x0 + x1) / 2, yb + 40, { s: 11, c: v("--mist"), a: "center" });
      bell(9.4, v("--mist"), true, false);
      bell(cur(), v("--coral"), false, true);
      text(ctx, "점선: 처음 집단 (평균 9.40)", x0, 50, { s: 10.5, c: v("--mist") });
      text(ctx, hist.length - 1 + "세대 평균 " + cur().toFixed(2) + " mm", clamp(X(cur()), 110, 370), 76, { s: 13, w: "900", a: "center", c: v("--coral-700") });
      /* 오른쪽: 세대별 평균 */
      var gx0 = 530, gx1 = 856, gy0 = 50, gy1 = 300;
      function GX(g) { return gx0 + g / 12 * (gx1 - gx0); }
      function GY(m) { return gy1 - (clamp(m, 8, 12) - 8) / 4 * (gy1 - gy0); }
      text(ctx, "세대별 평균 부리 두께 (mm)", gx0 - 30, 28, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
      [8, 9, 10, 11, 12].forEach(function (m) { text(ctx, String(m), gx0 - 8, GY(m) + 4, { s: 10.5, c: v("--mist"), a: "right" }); ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(gx0, GY(m)); ctx.lineTo(gx1, GY(m)); ctx.stroke(); ctx.globalAlpha = 1; });
      [0, 3, 6, 9, 12].forEach(function (g) { text(ctx, g + "세대", GX(g), gy1 + 18, { s: 10.5, c: v("--mist"), a: "center" }); });
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(gx0, GY(10.4)); ctx.lineTo(gx1, GY(10.4)); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "10.4", gx1 + 4, GY(10.4) + 4, { s: 10, w: "800", c: v("--amber-700") });
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.beginPath();
      hist.forEach(function (q, g) { if (g === 0) ctx.moveTo(GX(g), GY(q.m)); else ctx.lineTo(GX(g), GY(q.m)); });
      ctx.stroke();
      hist.forEach(function (q, g) { ctx.fillStyle = q.env === "rain" ? v("--brand") : (q.env ? v("--coral") : v("--mist")); ctx.beginPath(); ctx.arc(GX(g), GY(q.m), 5.5, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(gx0 + 6, 336, 5, 0, Math.PI * 2); ctx.fill(); text(ctx, "가뭄 세대", gx0 + 16, 340, { s: 10.5, c: v("--mist") });
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(gx0 + 96, 336, 5, 0, Math.PI * 2); ctx.fill(); text(ctx, "폭우 세대", gx0 + 106, 340, { s: 10.5, c: v("--mist") });
    }
    function say() {
      if (!last) { $("b-gen-info").innerHTML = "처음 집단의 평균은 <b>9.40 mm</b>입니다. 환경과 유전되는 비율을 정하고 ‘한 세대 진행’을 누르세요."; return; }
      $("b-gen-info").innerHTML = "<b>" + (hist.length - 1) + "세대</b> (" + (last.env === "drought" ? "가뭄" : "폭우") + ", 유전되는 비율 " + Math.round(last.h * 100) + "%) · 살아남은 부모의 평균은 집단 평균보다 <b>" + (last.S >= 0 ? "+" : "") + last.S.toFixed(2) + " mm</b>, 그 가운데 자손에게 전해진 것은 <b>" + (last.R >= 0 ? "+" : "") + last.R.toFixed(2) + " mm</b> → 자손 세대 평균 <b>" + cur().toFixed(2) + " mm</b><br>" +
        (last.h === 0 ? "부모는 부리가 두꺼운 새들이었는데도 자손은 제자리입니다. 차이가 유전되지 않으면 <b>선택은 일어나도 진화는 일어나지 않습니다.</b>" :
          (last.env === "drought" ? "두꺼운 부리가 유전되므로 세대를 거듭할수록 집단 전체가 오른쪽으로 옮겨 갑니다." : "환경이 바뀌자 이번에는 <b>얇은 부리</b>가 유리해져 집단이 왼쪽으로 되돌아갑니다. 유리한 형질은 환경이 정합니다."));
    }
    function mission() {
      if (ok.a) { done("m2-4a"); } if (ok.b) done("m2-4b"); if (ok.c) done("m2-4c");
      if (ok.a && ok.b && ok.c) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>진화에는 세 가지가 모두 필요합니다. <b>변이</b>가 있고, 환경이 그 가운데 일부를 <b>선택</b>하고, 그 차이가 <b>유전</b>되어야 합니다. 그리고 선택의 방향은 환경이 바뀌면 함께 바뀝니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call($("b-gen-env").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { env = b.getAttribute("data-e"); segOn($("b-gen-env"), b); });
    });
    $("b-gen-h").addEventListener("input", function (e) { h = +e.target.value; $("b-gen-h-val").textContent = Math.round(h * 100) + "%"; });
    $("b-gen-p").addEventListener("input", function (e) { press = +e.target.value; $("b-gen-p-val").textContent = press.toFixed(1) + "×"; });
    $("b-gen-reset").addEventListener("click", function () { reset(); $("b-gen-step").disabled = false; draw(); say(); });
    $("b-gen-step").addEventListener("click", function () {
      if (hist.length > 12) return;
      var S = selDiff(cur(), env, press), R = h * S, m = cur() + R, ch = false;
      hist.push({ m: m, env: env }); last = { S: S, R: R, h: h, env: env };
      if (hist.length > 12) $("b-gen-step").disabled = true;
      zeroRun = (h === 0 && env === "drought") ? zeroRun + 1 : 0;
      peak = Math.max(peak, m);
      if (!ok.a && zeroRun >= 3) { ok.a = ch = true; }
      if (!ok.b && Math.abs(h - 0.8) < 0.01 && env === "drought" && m >= 10.4) { ok.b = ch = true; }
      if (!ok.c && env === "rain" && h > 0 && peak >= 10.4 && peak - m >= 0.3) { ok.c = ch = true; }
      if (ch) window.sthState("genOK", ok);
      draw(); say(); mission();
    });
    reset(); draw(); say(); mission();
  })();

  /* 장면 5 — 항생제 내성 */
  function culture(r0, drug) {
    var S = 1e6, R = r0, K = 1e9, out = [{ S: S, R: R }];
    for (var t = 0; t < 12; t++) {
      var room = Math.max(0, 1 - (S + R) / K);
      S = S * (1 + 1.0 * room); R = R * (1 + 0.8 * room);
      if (drug) S *= 0.1;
      if (S < 1) S = 0; if (R < 1) R = 0;
      out.push({ S: S, R: R });
    }
    return out;
  }
  (function () {
    var canvas = $("b-c-abx"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var r0 = 0, drug = 0, sim = null, upto = 0, running = false;
    var ok = window.sthState("abxOK") || { a: false, b: false, c: false }, okD = !!window.sthState("abxQ");
    function num(n) { if (n < 1) return "0"; if (n < 1e4) return Math.round(n).toLocaleString(); var e = Math.floor(Math.log(n) / Math.LN10); return (n / Math.pow(10, e)).toFixed(1) + "×10^" + e; }
    function draw() {
      paper(ctx, W, H);
      var x0 = 90, x1 = 620, y0 = 40, y1 = 270;
      function X(t) { return x0 + t / 12 * (x1 - x0); }
      function Y(n) { return y1 - clamp(Math.log(Math.max(n, 1)) / Math.LN10 / 10, 0, 1) * (y1 - y0); }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      [[0, "1"], [2, "100"], [4, "1만"], [6, "100만"], [8, "1억"], [10, "100억"]].forEach(function (g) { var gy = y1 - g[0] / 10 * (y1 - y0); text(ctx, g[1], x0 - 8, gy + 4, { s: 10.5, c: v("--mist"), a: "right" }); ctx.globalAlpha = .35; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); ctx.globalAlpha = 1; });
      [0, 3, 6, 9, 12].forEach(function (t) { text(ctx, t + "시간", X(t), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" }); });
      text(ctx, "세균 수 (마리)", x0, 26, { s: 12.5, w: "800" });
      text(ctx, "— 보통 세균", 360, 26, { s: 12, w: "800", c: v("--brand-700") });
      text(ctx, "— 내성 세균", 470, 26, { s: 12, w: "800", c: v("--rose-700") });
      if (sim) {
        [["S", "--brand"], ["R", "--rose"]].forEach(function (L) {
          ctx.strokeStyle = v(L[1]); ctx.lineWidth = 3; ctx.beginPath();
          var pen = false;
          for (var t = 0; t <= upto; t++) { var n = sim[t][L[0]]; if (n < 1 && t > 0 && sim[t - 1][L[0]] < 1) { pen = false; continue; } if (!pen) { ctx.moveTo(X(t), Y(n)); pen = true; } else ctx.lineTo(X(t), Y(n)); }
          ctx.stroke();
        });
        var e = sim[upto], tot = e.S + e.R, fr = tot >= 1 ? e.R / tot : 0;
        text(ctx, upto + "시간 뒤", 760, 60, { s: 12.5, w: "800", a: "center" });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(720, 76, 80, 170);
        if (tot >= 1) { ctx.fillStyle = v("--brand"); ctx.fillRect(720, 76, 80, 170 * (1 - fr)); ctx.fillStyle = v("--rose"); ctx.fillRect(720, 76 + 170 * (1 - fr), 80, 170 * fr); }
        else text(ctx, "전멸", 760, 166, { s: 14, w: "900", a: "center", c: v("--mist") });
        ctx.strokeStyle = v("--line"); ctx.strokeRect(720, 76, 80, 170);
        text(ctx, "내성 세균 비율", 760, 268, { s: 11, c: v("--mist"), a: "center" });
        text(ctx, tot >= 1 ? (fr < 0.0001 && fr > 0 ? "0.01% 미만" : (fr * 100).toFixed(fr < 0.01 ? 3 : 1) + "%") : "-", 760, 292, { s: 16, w: "900", a: "center", c: v("--rose-700") });
      } else text(ctx, "조건을 정하고 배양을 시작하세요", (x0 + x1) / 2, 150, { s: 12.5, c: v("--mist"), a: "center" });
    }
    function mission() {
      if (ok.a) done("m2-5a"); if (ok.b) done("m2-5b"); if (ok.c) done("m2-5c"); if (okD) done("m2-5d");
      if (ok.a && ok.b && ok.c && okD) {
        window.sthMission("m2-5", true, "<span class='m-tag'>미션 완료</span>항생제는 내성 세균을 ‘만들지’ 않았습니다. 돌연변이로 <b>이미 있던</b> 내성 세균만 남겨 <b>선택</b>했고, 그 세균이 분열해 내성 유전자를 물려주었습니다. 핀치의 가뭄과 같은 원리입니다.");
        ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("b-abx-r").addEventListener("input", function (e) { if (running) return; r0 = +e.target.value; $("b-abx-r-val").textContent = r0 + "마리"; });
    Array.prototype.forEach.call($("b-abx-drug").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { if (running) return; drug = +b.getAttribute("data-d"); segOn($("b-abx-drug"), b); });
    });
    $("b-abx-run").addEventListener("click", function () {
      if (running) return;
      running = true; $("b-abx-run").disabled = true; $("b-abx-r").disabled = true;
      var R0 = r0, D = drug; sim = culture(R0, D); upto = 0;
      (function step() {
        draw();
        if (upto < 12) { upto++; window.setTimeout(step, 160); return; }
        running = false; $("b-abx-run").disabled = false; $("b-abx-r").disabled = false;
        var e = sim[12], tot = e.S + e.R, fr = tot >= 1 ? e.R / tot : 0, ch = false, msg;
        if (tot < 1) msg = "세균이 <b>전멸</b>했습니다. 내성 변이가 하나도 없으면 항생제가 고를 것이 없습니다. 내성 세균은 생기지 않았습니다.";
        else if (!D) msg = "항생제가 없으면 보통 세균이 접시를 가득 채웁니다(" + num(e.S) + "마리). 내성 세균은 " + num(e.R) + "마리로, 비율은 <b>" + (fr * 100).toFixed(3) + "%</b>뿐입니다. 내성을 유지하는 데 에너지가 들어 오히려 조금 느리게 자랍니다.";
        else msg = "보통 세균은 항생제에 죽어 사라졌고, 처음 " + R0 + "마리뿐이던 내성 세균이 " + num(e.R) + "마리로 불어나 접시의 <b>" + (fr * 100).toFixed(1) + "%</b>를 차지했습니다.";
        $("b-abx-info").innerHTML = "<b>" + (R0 ? "내성 세균 " + R0 + "마리" : "내성 세균 없음") + " · " + (D ? "항생제 투여" : "항생제 없음") + "</b><br>" + msg;
        if (!ok.a && R0 === 0 && D && tot < 1) { ok.a = ch = true; }
        if (!ok.b && R0 > 0 && !D && fr < 0.01) { ok.b = ch = true; }
        if (!ok.c && R0 > 0 && D && fr > 0.9) { ok.c = ch = true; }
        if (ch) window.sthState("abxOK", ok);
        mission();
      })();
    });
    window.sthPick({
      mount: "s2-q3",
      q: "세 실험을 비교하면, 항생제 내성 세균이 접시를 차지하게 된 까닭은 무엇일까요?",
      options: ["항생제가 보통 세균을 내성 세균으로 바꾸었다", "세균이 살아남으려고 스스로 내성을 길렀다", "돌연변이로 이미 있던 소수의 내성 세균만 살아남아 증식했다", "항생제가 세균의 분열을 빠르게 했다"],
      answer: 2,
      why: ["내성 세균이 0마리였던 접시에서는 항생제를 넣어도 내성 세균이 생기지 않았습니다.", "필요하다고 해서 형질이 생기지는 않습니다. 첫 번째 실험을 떠올려 보세요.", "변이가 먼저 있었고, 항생제라는 환경이 그것을 선택했습니다. 자연선택에 의한 진화입니다.", "분열 속도는 그대로입니다. 경쟁자가 사라졌을 뿐입니다."],
      onDone: function () { okD = true; window.sthState("abxQ", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 6 — 결말 */
  var STEPS = ["핀치 집단에는 부리 두께가 조금씩 다른 개체들이 섞여 있다 (변이)", "가뭄으로 먹이가 부족해져 살아남기 위한 경쟁이 심해진다", "딱딱한 씨앗을 깰 수 있는 두꺼운 부리의 핀치가 더 많이 살아남는다 (자연선택)", "살아남은 핀치가 번식해 두꺼운 부리 형질을 자손에게 물려준다 (유전)", "다음 세대에서는 집단의 평균 부리 두께가 커진다 (진화)"];
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "정확했습니다. 변이가 먼저, 선택이 그다음입니다." : (p.indexOf("㉡") === 0 ? "가장 흔한 오해입니다. 개체가 노력해서 얻은 변화가 아니라, 원래 있던 변이 가운데 일부가 선택된 것입니다." : "생존은 무작위가 아니었습니다. 부리 두께에 따라 살아남을 확률이 달랐습니다.")) +
      "<br><b>내가 재현한 1977년</b> " + (window.sthState("selBest") || "-");
  }
  function finish() { window.sthState("r2", "해결 · 첫 추리 " + first(window.sthState("p2")) + " · " + (window.sthState("selBest") || "-")); }
  if (ep.cleared(5)) {
    $("s2-order").innerHTML = "<div class='order sort'><div class='slots'>" + STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    reveal();
  } else {
    window.sthOrder({ mount: "s2-order", steps: STEPS, onDone: function () { reveal(); ep.clear(5); } });
  }
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학2 Ⅰ-1] 이야기 ② 가뭄이 지나간 섬",
    items: [
      { id: "w2", label: "자연선택이 일어나는 순서", hint: "변이 → 선택 → 유전의 순서를 예 하나로 풀어 쓰세요." },
      { id: "e2b", label: "친구의 말 고쳐 주기", hint: "“항생제를 자주 먹으면 세균이 항생제에 적응해서 내성이 생긴대.” 이 말에서 과학적으로 어색한 부분을 찾아, 배양 실험 결과를 근거로 고쳐 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 한 가지만 심은 밭
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "조사관의 첫 추리",
    question: "아일랜드의 감자밭과 그로 미셸 농장은 왜 병 하나에 한꺼번에 무너졌을까요?",
    options: ["㉠ 유난히 독한 병원균이 나타났기 때문이다", "㉡ 농약과 재배 기술이 부족했기 때문이다", "㉢ 밭 전체가 유전적으로 똑같은 한 품종이었기 때문이다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 밭 설계 */
  var ROWS = 10, COLS = 24, YEARS = [0, 0, 1, 1, 3, 1], YNAME = [1843, 1844, 1845, 1846, 1847, 1848];
  function layout(n) { var r = rng(100 + n * 7), a = []; for (var i = 0; i < ROWS * COLS; i++) a.push(1 + Math.floor(r() * n)); return a; }
  function outbreak(lay, target, seed) {
    var dead = [], r = rng(seed), idx = [], i, k;
    for (i = 0; i < lay.length; i++) if (lay[i] === target) idx.push(i);
    if (!idx.length) return { dead: dead, waves: [] };
    var front = [];
    for (k = 0; k < 3; k++) { var s = idx[Math.floor(r() * idx.length)]; if (!dead[s]) { dead[s] = 1; front.push(s); } }
    var waves = [front.slice()];
    while (front.length) {
      var nx = [];
      front.forEach(function (c) {
        var y = Math.floor(c / COLS), x = c % COLS;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var yy = y + dy, xx = x + dx;
          if (yy < 0 || yy >= ROWS || xx < 0 || xx >= COLS) continue;
          var j = yy * COLS + xx;
          if (!dead[j] && lay[j] === target) { dead[j] = 1; nx.push(j); }
        }
      });
      if (nx.length) waves.push(nx);
      front = nx;
    }
    return { dead: dead, waves: waves };
  }
  function harvest(lay, dead) { var h = 0; for (var i = 0; i < lay.length; i++) if (!dead[i]) h += 100 - 5 * (lay[i] - 1); return h / (ROWS * COLS); }
  (function () {
    var canvas = $("c-c-farm"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var n = 1, lay = layout(1), dead = [], bars = [], title = "1843년 봄 — 씨감자를 심었습니다", running = false;
    var tries = window.sthState("farmTries") || [], okA = !!window.sthState("farmA"), okB = !!window.sthState("farmOK");
    var COL = ["--green", "--teal", "--brand", "--violet", "--amber", "--coral", "--rose", "--green-700", "--brand-700", "--violet-700"];
    var NUM = "①②③④⑤⑥⑦⑧⑨⑩";
    function draw() {
      paper(ctx, W, H);
      var gx = 30, gy = 64, cs = 25;
      text(ctx, title, gx, 34, { s: 14, w: "900" });
      for (var i = 0; i < lay.length; i++) {
        var x = gx + (i % COLS) * cs, y = gy + Math.floor(i / COLS) * cs;
        ctx.fillStyle = dead[i] ? v("--line") : v(COL[lay[i] - 1]);
        ctx.globalAlpha = dead[i] ? .8 : .9; ctx.beginPath(); ctx.roundRect(x + 1.5, y + 1.5, cs - 3, cs - 3, 5); ctx.fill(); ctx.globalAlpha = 1;
        text(ctx, dead[i] ? "✕" : String(lay[i]), x + cs / 2, y + cs / 2 + 4, { s: 10.5, w: "800", a: "center", c: dead[i] ? v("--mist") : v("--on-accent") });
      }
      var lg = "품종별 수확량  ";
      for (var k = 1; k <= n; k++) lg += NUM.charAt(k - 1) + " " + (100 - 5 * (k - 1)) + "   ";
      text(ctx, lg, gx, 340, { s: 11, c: v("--mist") });
      text(ctx, "역병균 A → 품종 ①만 감염 · 역병균 B → 품종 ③만 감염 · 이웃한 같은 품종으로 번짐", gx, 362, { s: 10.5, c: v("--mist") });
      /* 수확 막대 */
      var bx = 672, by = 300, bh = 200;
      text(ctx, "해마다의 수확", bx - 8, 58, { s: 12.5, w: "800" });
      text(ctx, "(100 = 럼퍼만 심은 풍년)", bx - 8, 76, { s: 10.5, c: v("--mist") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx - 8, by - bh); ctx.lineTo(bx - 8, by); ctx.lineTo(880, by); ctx.stroke();
      ctx.strokeStyle = v("--rose"); ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(bx - 8, by - bh * .6); ctx.lineTo(880, by - bh * .6); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "기근선 60", 880, by - bh * .6 - 5, { s: 10, w: "800", c: v("--rose-700"), a: "right" });
      YNAME.forEach(function (yr, yi) {
        var xx = bx + yi * 35;
        text(ctx, "'" + (yr % 100), xx + 13, by + 16, { s: 10.5, c: v("--mist"), a: "center" });
        if (bars[yi] == null) return;
        ctx.fillStyle = bars[yi] < 60 ? v("--rose") : v("--green"); ctx.fillRect(xx, by - bh * bars[yi] / 100, 26, bh * bars[yi] / 100);
        text(ctx, String(Math.round(bars[yi])), xx + 13, by - bh * bars[yi] / 100 - 5, { s: 11, w: "800", a: "center" });
      });
      if (bars.length === 6) { var avg = bars.reduce(function (a, b) { return a + b; }, 0) / 6; text(ctx, "6년 평균 " + avg.toFixed(1), 880, by + 40, { s: 13, w: "900", a: "right", c: v("--ink") }); }
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "🥔 " + t.n + "품종 → 평균 <b>" + t.avg + "</b>, 최저 " + t.min + " " + (t.ok ? "✅" : "❌ " + t.why); });
      if (rows.length) $("c-farm-info").innerHTML = "<b>설계 기록</b><br>" + rows.join("<br>");
    }
    function check() {
      if (okA) { done("m3-2a"); $("m3-2a").innerHTML = "1품종 밭은 2년 동안 최고의 수확을 냈지만, 역병이 온 해에는 <b>240포기가 전멸</b>했습니다."; }
      if (okB) done("m3-2b");
      if (okA && okB) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>" + (window.sthState("farmBest") || "") + " 품종이 섞여 있으면 병에 걸리는 포기가 일부에 그치고, 사이사이의 다른 품종이 <b>병이 번지는 길</b>도 끊어 줍니다. 이것이 <b>유전적 다양성</b>의 힘입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    $("c-farm-n").addEventListener("input", function (e) {
      if (running) return;
      n = +e.target.value; $("c-farm-n-val").textContent = n + "품종"; lay = layout(n); dead = []; bars = []; title = "1843년 봄 — " + n + "품종을 섞어 심었습니다"; draw();
    });
    $("c-farm-run").addEventListener("click", function () {
      if (running) return;
      running = true; $("c-farm-run").disabled = true; $("c-farm-n").disabled = true;
      var N = n, yi = 0; bars = [];
      function year() {
        if (yi >= 6) return finishRun();
        var t = YEARS[yi]; dead = [];
        if (!t) { title = YNAME[yi] + "년 — 병 없이 풍년입니다"; endYear(); return; }
        var o = outbreak(lay, t, 500 + yi * 13 + N), w = 0;
        title = YNAME[yi] + "년 — 역병균 " + (t === 1 ? "A" : "B") + " 발생!" + (o.waves.length ? "" : " (감염될 품종이 없어 피해 없음)");
        (function wave() {
          if (w < o.waves.length) { o.waves[w].forEach(function (c) { dead[c] = 1; }); w++; draw(); window.setTimeout(wave, 70); }
          else endYear();
        })();
      }
      function endYear() { bars[yi] = harvest(lay, dead); draw(); yi++; window.setTimeout(year, 650); }
      function finishRun() {
        running = false; $("c-farm-run").disabled = false; $("c-farm-n").disabled = false;
        var avg = bars.reduce(function (a, b) { return a + b; }, 0) / 6, min = Math.min.apply(null, bars), ok = min >= 60 && avg >= 87;
        title = "1848년 가을 — 6년 평균 수확 " + avg.toFixed(1) + (min < 60 ? " · 기근 발생" : ""); draw();
        tries.push({ n: N, avg: avg.toFixed(1), min: Math.round(min), ok: ok, why: min < 60 ? "기근이 든 해가 있음" : "평균 수확이 87에 못 미침" });
        window.sthState("farmTries", tries.slice(-8));
        if (N === 1) { okA = true; window.sthState("farmA", 1); }
        if (ok) { okB = true; window.sthState("farmOK", 1); window.sthState("farmBest", N + "품종 혼합 재배로 기근 없이 6년 평균 수확 " + avg.toFixed(1) + "."); }
        report(); check();
      }
      year();
    });
    draw(); report(); check();
  })();

  /* 장면 3 — 종 풍부도·균등도와 다양성 지수 */
  (function () {
    var canvas = $("c-c-div"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var N = [40, 25, 10, 5], NAME = ["🌳 참나무", "🌲 소나무", "🍁 단풍나무", "🌸 벚나무"], COL = ["--green", "--teal", "--coral", "--rose"];
    var ok = window.sthState("divOK") || { a: false, b: false, c: false }, okD = !!window.sthState("divQ");
    var pr = rng(314), PTS = [];
    for (var i = 0; i < 200; i++) PTS.push({ x: 44 + pr() * 440, y: 50 + pr() * 214 });
    function index() {
      var tot = N[0] + N[1] + N[2] + N[3], s = 0, rich = 0;
      N.forEach(function (c) { if (c > 0) { rich++; s += (c / tot) * (c / tot); } });
      return { tot: tot, rich: rich, D: tot ? 1 - s : 0 };
    }
    function draw() {
      paper(ctx, W, H);
      var I = index();
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(30, 36, 470, 242, 14); ctx.fill();
      text(ctx, "숲 조사 구역 (점 하나 = 나무 한 그루)", 30, 24, { s: 12.5, w: "800" });
      var k = 0;
      N.forEach(function (c, sp) { ctx.fillStyle = v(COL[sp]); for (var j = 0; j < c; j++, k++) { ctx.beginPath(); ctx.arc(PTS[k].x, PTS[k].y, 6, 0, Math.PI * 2); ctx.fill(); } });
      var x0 = 640, x1 = 860;
      text(ctx, "종별 비율", 540, 24, { s: 12.5, w: "800" });
      N.forEach(function (c, sp) {
        var y = 40 + sp * 38, p = I.tot ? c / I.tot : 0;
        text(ctx, NAME[sp], 540, y + 18, { s: 11.5, w: "700", c: c ? v("--ink") : v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(x0, y, x1 - x0, 26);
        ctx.fillStyle = v(COL[sp]); ctx.fillRect(x0, y, (x1 - x0) * p, 26);
        text(ctx, c ? Math.round(p * 100) + "%" : "없음", x1 + 4, y + 18, { s: 11, w: "800", c: v("--mist") });
      });
      text(ctx, "종 풍부도 " + I.rich + "종 · 전체 " + I.tot + "그루", 540, 214, { s: 12, w: "800" });
      text(ctx, "다양성 지수 D", 540, 250, { s: 12, c: v("--mist") });
      text(ctx, I.D.toFixed(3), 640, 256, { s: 26, w: "900", c: I.D >= .6 ? v("--green-700") : (I.D <= .3 ? v("--rose-700") : v("--ink")) });
      ctx.fillStyle = v("--card-2"); ctx.fillRect(540, 270, 320, 10);
      ctx.fillStyle = v("--teal"); ctx.fillRect(540, 270, 320 * clamp(I.D, 0, 1), 10);
      text(ctx, "0", 540, 294, { s: 10, c: v("--mist") }); text(ctx, "1", 860, 294, { s: 10, c: v("--mist"), a: "right" });

      $("c-div-index").innerHTML = "다양성 지수 D = 1 − Σp<sub>i</sub>² = <b>" + I.D.toFixed(3) + "</b> (p는 각 종의 비율. 0에 가까울수록 한 종이 우세, 클수록 여러 종이 고르게 있음)";
      $("c-div-info").innerHTML = I.tot === 0 ? "나무가 한 그루도 없습니다." :
        (I.rich === 1 ? "한 종뿐인 숲입니다. 아무렇게나 두 그루를 골라도 늘 같은 종이므로 D = 0입니다." :
        (I.D <= 0.3 ? "종은 " + I.rich + "종이지만 한 종이 숲을 거의 차지했습니다. <b>종 균등도가 낮으면</b> 종 수가 많아도 다양성 지수는 낮습니다." :
        (I.D >= 0.7499 && I.rich === 4 ? "네 종이 똑같은 비율일 때 D = 1 − 4×(1/4)² = <b>0.75</b>, 네 종으로 낼 수 있는 최댓값입니다. 그루 수가 아니라 <b>비율</b>이 같으면 됩니다." :
        "종 풍부도 " + I.rich + "종. 각 종의 비율이 비슷해질수록 D가 커집니다.")));
      var ch = false;
      if (!ok.a && I.rich === 4 && I.D <= 0.30) { ok.a = ch = true; }
      if (!ok.b && I.rich === 3 && I.D >= 0.60) { ok.b = ch = true; }
      if (!ok.c && I.rich === 4 && I.D >= 0.7499) { ok.c = ch = true; }
      if (ch) { window.sthState("divOK", ok); mission(); }
    }
    function mission() {
      if (ok.a) done("m3-3a"); if (ok.b) done("m3-3b"); if (ok.c) done("m3-3c"); if (okD) done("m3-3d");
      if (ok.a && ok.b && ok.c && okD) {
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>고르게 섞인 3종의 숲(D ≥ 0.6)이 한 종이 뒤덮은 4종의 숲(D ≤ 0.3)보다 종 다양성이 높습니다. 종 다양성은 <b>종 풍부도와 종 균등도</b>를 함께 봐야 합니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    [0, 1, 2, 3].forEach(function (sp) {
      $("c-div-" + sp).addEventListener("input", function (e) { N[sp] = +e.target.value; $("c-div-" + sp + "-val").textContent = N[sp]; draw(); });
    });
    window.sthPick({
      mount: "s3-q1",
      q: "(가) 숲은 네 종이 25그루씩, (나) 숲은 한 종이 85그루이고 나머지 세 종이 5그루씩입니다. 두 숲의 종 다양성을 바르게 비교한 것은?",
      options: ["종 수와 전체 그루 수가 같으므로 종 다양성도 같다", "(나)가 높다. 가장 많은 종의 그루 수가 더 많기 때문이다", "(가)가 높다. 종 풍부도는 같지만 종 균등도가 더 높기 때문이다", "비교할 수 없다"],
      answer: 2,
      why: ["종 수만으로는 정해지지 않습니다. 위 화면에서 두 숲을 직접 만들어 D를 비교해 보세요.", "한 종이 우세할수록 다양성 지수는 낮아집니다.", "(가)는 D = 0.75, (나)는 D ≈ 0.27입니다. 풍부도가 같다면 고르게 분포한 쪽이 종 다양성이 높습니다.", "두 숲 모두 다양성 지수를 계산할 수 있습니다."],
      onDone: function () { okD = true; window.sthState("divQ", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 먹이 그물 */
  var WEBS = {
    simple: [
      { id: "grass", n: "🌿 풀", x: 450, y: 330, eat: [] },
      { id: "hopper", n: "🦗 메뚜기", x: 450, y: 255, eat: ["grass"] },
      { id: "frog", n: "🐸 개구리", x: 450, y: 180, eat: ["hopper"] },
      { id: "snake", n: "🐍 뱀", x: 450, y: 105, eat: ["frog"] },
      { id: "hawk", n: "🦅 매", x: 450, y: 30, eat: ["snake"] }
    ],
    complex: [
      { id: "grass", n: "🌿 풀", x: 290, y: 330, eat: [] },
      { id: "oak", n: "🌰 참나무(도토리)", x: 660, y: 330, eat: [] },
      { id: "hopper", n: "🦗 메뚜기", x: 170, y: 255, eat: ["grass"] },
      { id: "mouse", n: "🐭 들쥐", x: 450, y: 255, eat: ["grass", "oak"] },
      { id: "rabbit", n: "🐇 토끼", x: 730, y: 255, eat: ["grass"] },
      { id: "frog", n: "🐸 개구리", x: 230, y: 180, eat: ["hopper"] },
      { id: "bird", n: "🐦 박새", x: 570, y: 180, eat: ["hopper", "oak"] },
      { id: "snake", n: "🐍 뱀", x: 360, y: 105, eat: ["frog", "mouse"] },
      { id: "hawk", n: "🦅 매", x: 540, y: 30, eat: ["snake", "mouse", "bird", "rabbit"] }
    ]
  };
  function cascade(web, removed) {
    var dead = {}, ch = true;
    web.forEach(function (s) { if (removed[s.id]) dead[s.id] = 1; });
    while (ch) {
      ch = false;
      web.forEach(function (s) {
        if (dead[s.id] || !s.eat.length) return;
        var food = s.eat.filter(function (f) { return !dead[f]; });
        if (!food.length) { dead[s.id] = 2; ch = true; }
      });
    }
    return dead;                                           // 1 = 없앤 종, 2 = 먹이를 잃어 사라진 종
  }
  (function () {
    var canvas = $("c-c-web"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var kind = "simple", removed = { simple: {}, complex: {} }, ok = window.sthState("webOK") || { a: false, b: false };
    function byId(web, id) { for (var i = 0; i < web.length; i++) if (web[i].id === id) return web[i]; return null; }
    function draw() {
      paper(ctx, W, H);
      var web = WEBS[kind], dead = cascade(web, removed[kind]);
      web.forEach(function (s) {
        s.eat.forEach(function (f) {
          var a = byId(web, f), gone = dead[s.id] || dead[f];
          ctx.strokeStyle = gone ? v("--line") : v("--mist"); ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = gone ? 1.2 : 2;
          if (gone) ctx.setLineDash([4, 4]);
          window.drawArrow(ctx, a.x, a.y, s.x, s.y + 38, 9); ctx.setLineDash([]);
        });
      });
      web.forEach(function (s) {
        var d = dead[s.id], w = 150;
        ctx.fillStyle = d === 1 ? v("--line") : (d === 2 ? v("--rose-100") : v("--card"));
        ctx.strokeStyle = d === 2 ? v("--rose") : (d === 1 ? v("--mist") : v("--teal")); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(s.x - w / 2, s.y, w, 36, 12); ctx.fill(); ctx.stroke();
        text(ctx, s.n + (d === 1 ? " (없앰)" : (d === 2 ? " ✕" : "")), s.x, s.y + 23, { s: 12, w: "800", a: "center", c: d === 2 ? v("--rose-700") : (d === 1 ? v("--mist") : v("--ink")) });
      });
      text(ctx, "화살표: 먹히는 쪽 → 먹는 쪽", 30, 24, { s: 11, c: v("--mist") });

      var rem = web.filter(function (s) { return dead[s.id] === 1; }), lost = web.filter(function (s) { return dead[s.id] === 2; });
      $("c-web-info").innerHTML = !rem.length ? "아직 모든 종이 살아 있습니다. 없앨 종을 골라 보세요." :
        "<b>" + rem.map(function (s) { return s.n; }).join(", ") + "</b>을(를) 없앴더니 → " +
        (lost.length ? "먹이를 모두 잃은 <b>" + lost.map(function (s) { return s.n; }).join(", ") + "</b>까지 연달아 사라졌습니다. (" + web.length + "종 중 " + (web.length - rem.length - lost.length) + "종 남음)" :
          "<b>다른 종은 모두 살아남았습니다.</b> 개구리를 먹던 동물에게 다른 먹이가 있기 때문입니다. 먹이 그물이 복잡할수록 한 종이 사라진 충격을 잘 견딥니다.");
      var only = rem.length === 1 && rem[0].id === "frog", ch = false;
      if (!ok.a && kind === "simple" && only && lost.length >= 2) { ok.a = ch = true; }
      if (!ok.b && kind === "complex" && only && lost.length === 0) { ok.b = ch = true; }
      if (ch) { window.sthState("webOK", ok); mission(); }
    }
    function buttons() {
      var box = $("c-web-sp"); box.innerHTML = "";
      WEBS[kind].forEach(function (s) {
        var b = document.createElement("button");
        b.type = "button"; b.textContent = s.n; if (removed[kind][s.id]) b.className = "on";
        b.addEventListener("click", function () { removed[kind][s.id] = !removed[kind][s.id]; b.classList.toggle("on", !!removed[kind][s.id]); draw(); });
        box.appendChild(b);
      });
    }
    function mission() {
      if (ok.a) { done("m3-4a"); $("m3-4a").innerHTML = "종이 적은 들판: 개구리가 사라지자 <b>뱀과 매</b>까지 사라졌습니다."; }
      if (ok.b) { done("m3-4b"); $("m3-4b").innerHTML = "종이 많은 들판: 개구리가 사라져도 <b>나머지 8종이 모두</b> 살아남았습니다."; }
      if (ok.a && ok.b) { window.sthMission("m3-4", true); ep.clear(3); }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call($("c-web-kind").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { kind = b.getAttribute("data-k"); segOn($("c-web-kind"), b); buttons(); draw(); });
    });
    buttons(); draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function reveal() {
    $("e3-wrap").hidden = false;
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "정확했습니다. 밭 설계 실험으로 직접 확인했지요." : "병원균과 기술도 영향을 주었지만, 같은 병이 돌아도 품종이 섞인 밭은 무너지지 않았습니다. 결정적인 차이는 유전적 다양성이었습니다.") +
      "<br><b>나의 밭 설계</b> " + (window.sthState("farmBest") || "-");
  }
  function finish() { window.sthState("r3", "해결 · 첫 추리 " + first(window.sthState("p3")) + " · " + (window.sthState("farmBest") || "-")); }
  window.sthSort({
    mount: "s3-sort",
    buckets: [
      { id: "g", label: "🧬 유전적 다양성", sub: "같은 종 안에서 유전자가 다양한 정도" },
      { id: "s", label: "🐾 종 다양성", sub: "한 지역에 사는 종의 수와 고른 정도" },
      { id: "e", label: "🏞️ 생태계 다양성", sub: "생태계의 종류가 다양한 정도" }
    ],
    items: [
      { t: "같은 종의 무당벌레인데 개체마다 등 무늬와 색이 다르다", a: "g", why: "한 종 안에서 나타나는 변이, 유전적 다양성입니다." },
      { t: "안데스의 농부는 한 밭에 감자 품종 수십 가지를 섞어 심는다", a: "g", why: "품종은 같은 종 안의 유전적 차이입니다.", hint: "품종이 달라도 모두 ‘감자’ 한 종입니다." },
      { t: "치타는 개체 사이의 유전자 차이가 매우 작아 전염병에 약하다", a: "g", why: "유전적 다양성이 낮은 예입니다.", hint: "한 종(치타) 안의 이야기입니다." },
      { t: "이 갯벌에는 게, 조개, 갯지렁이 등 여러 종이 고르게 산다", a: "s", why: "종의 수와 분포의 고른 정도, 종 다양성입니다." },
      { t: "외래종 한 종이 호수를 뒤덮어 토종 물고기 종 수가 줄었다", a: "s", why: "종 풍부도와 균등도가 함께 낮아졌습니다." },
      { t: "두 숲은 나무 종 수가 같지만 한쪽은 소나무가 90%를 차지한다", a: "s", why: "종 균등도의 차이, 종 다양성입니다.", hint: "방금 계산한 다양성 지수를 떠올려 보세요." },
      { t: "우리나라에는 숲, 하천, 갯벌, 습지, 농경지가 함께 있다", a: "e", why: "생태계의 종류가 다양한 것, 생태계 다양성입니다." },
      { t: "열대 우림을 밀어 넓은 땅을 모두 기름야자 농장으로 바꾸었다", a: "e", why: "다양한 생태계가 한 가지로 바뀌어 생태계 다양성이 줄었습니다.", hint: "사라진 것이 한 종이 아니라 ‘숲 전체’입니다." },
      { t: "사막, 초원, 산호초는 환경이 달라 사는 생물 무리도 서로 다르다", a: "e", why: "생태계 다양성입니다. 생태계가 다양할수록 더 많은 종이 깃듭니다." }
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학2 Ⅰ-1] 이야기 ③ 한 가지만 심은 밭",
    items: [
      { id: "e3a", label: "바나나 회사에 보내는 경고", hint: "캐번디시 한 품종만 재배하는 것이 왜 위험한지 ‘유전적 다양성’이라는 말을 넣어 두세 문장으로 쓰세요. 밭 설계 실험의 숫자를 근거로 드세요." },
      { id: "e3b", label: "종 수가 같은 두 숲", hint: "종 수가 같아도 종 다양성이 다를 수 있는 까닭을 ‘종 풍부도’와 ‘종 균등도’로 설명하고, 종 다양성이 높은 생태계가 안정적인 까닭을 먹이 그물로 설명하세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학2 Ⅰ-1] 지구 환경 변화와 생물다양성 — 정리",
  recap: [
    { key: "r1", label: "① 1센티미터의 점토층" },
    { key: "r2", label: "② 가뭄이 지나간 섬" },
    { key: "r3", label: "③ 한 가지만 심은 밭" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "소행성과 공룡, 가뭄과 핀치, 역병과 감자. 세 이야기에 공통으로 들어 있는 생각을 ‘환경 변화’, ‘변이’, ‘생물다양성’이라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is2-1-1", unitLabel: "[통합과학2 Ⅰ-1] 지구 환경 변화와 생물다양성",
  rows: [
    { key: "r1", label: "① 1센티미터의 점토층" },
    { key: "r2", label: "② 가뭄이 지나간 섬" },
    { key: "r3", label: "③ 한 가지만 심은 밭" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
