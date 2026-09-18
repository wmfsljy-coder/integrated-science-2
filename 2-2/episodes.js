/* 통합과학2 Ⅱ-2 에너지 전환과 활용 — 소단원별 이야기 세 편
   01 태양은 석탄 덩어리일까 / 02 불 꺼진 섬 / 03 사라진 98
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is2-2-2");

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
function box(ctx, x, y, w, h, fill, r) { ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 10 : r); ctx.fill(); }
var SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };
function sup(n) { return String(n).split("").map(function (c) { return SUP[c] || c; }).join(""); }
function sci(x, d) {                                   // 3.2×10⁷ 꼴
  if (x === 0) return "0";
  var e = Math.floor(Math.log(x) / Math.LN10 + 1e-9), m = x / Math.pow(10, e);
  if (+m.toFixed(d == null ? 1 : d) >= 10) { m /= 10; e += 1; }
  return m.toFixed(d == null ? 1 : d) + "×10" + sup(e);
}
function years(y) {                                    // 읽기 쉬운 햇수
  if (y < 1e4) return "약 " + (Math.round(y / 100) * 100).toLocaleString() + "년";
  if (y < 1e8) return "약 " + (Math.round(y / 1e3) / 10).toLocaleString() + "만 년";
  return "약 " + (Math.round(y / 1e7) / 10).toLocaleString() + "억 년";
}
function segBind(id, attr, fn) {
  var btns = $(id).querySelectorAll("button");
  Array.prototype.forEach.call(btns, function (b) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(btns, function (x) { x.classList.toggle("on", x === b); });
      fn(b.getAttribute(attr));
    });
  });
}

/* =========================================================================
   이야기 ① 태양은 석탄 덩어리일까
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });
  var M_SUN = 2.0e30, L_SUN = 3.8e26, YEAR = 3.156e7, C2 = 9.0e16;

  window.sthGate({
    gate: "g1", key: "p1", title: "계산원의 첫 추리",
    question: "태양이 통째로 석탄이고 지금과 같은 밝기로 탄다면, 다 타 버릴 때까지 얼마나 걸릴까요?",
    options: ["㉠ 수천 년", "㉡ 수백만 년", "㉢ 수십억 년"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 연료 수명 계산기 : 수명 = M × e ÷ L */
  function lifeYears(e) { return M_SUN * e / L_SUN / YEAR; }
  (function () {
    var canvas = $("c-a-fuel"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var x = 9, okA = !!window.sthState("fuelA"), okB = !!window.sthState("fuelB");
    var FUELS = [{ x: 7.5, n: "석탄", up: 1 }, { x: 8.15, n: "수소 기체 연소", up: 0 }];
    var NUKE = [{ x: 13.9, n: "우라늄 핵분열", up: 0 }, { x: 14.8, n: "수소 핵융합", up: 1 }];
    function draw() {
      paper(ctx, W, H);
      var e = Math.pow(10, x), y = lifeYears(e);
      var x0 = 70, x1 = 840, ay = 110;
      text(ctx, "연료 1 kg이 내는 에너지 (J) — 눈금 하나에 10배", x0, 28, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.stroke();
      for (var k = 7; k <= 15; k++) {
        var gx = x0 + (k - 7) / 8 * (x1 - x0);
        ctx.beginPath(); ctx.moveTo(gx, ay - 6); ctx.lineTo(gx, ay + 6); ctx.stroke();
        text(ctx, "10" + sup(k), gx, ay + 24, { s: 11, c: v("--mist"), a: "center" });
      }
      FUELS.concat(okB ? NUKE : []).forEach(function (f) {
        var fx = x0 + (f.x - 7) / 8 * (x1 - x0);
        ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(fx, ay, 5, 0, Math.PI * 2); ctx.fill();
        text(ctx, f.n, fx, f.up ? ay - 34 : ay - 16, { s: 11, w: "800", c: v("--amber-700"), a: "center" });
      });
      var px = x0 + (x - 7) / 8 * (x1 - x0);
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.moveTo(px, ay - 2); ctx.lineTo(px - 9, ay - 58); ctx.lineTo(px + 9, ay - 58); ctx.closePath(); ctx.fill();
      text(ctx, sci(e) + " J", clamp(px, 110, 800), ay - 64, { s: 12.5, w: "900", c: v("--brand-700"), a: "center" });

      /* 수명 막대 (로그 눈금 10³ ~ 10¹¹ 년) */
      var by = 190, bh = 34;
      text(ctx, "이 연료로 태양이 빛날 수 있는 시간", x0, by - 12, { s: 12.5, w: "800" });
      box(ctx, x0, by, x1 - x0, bh, v("--card-2"), 8);
      var t = clamp((Math.log(y) / Math.LN10 - 3) / 8, 0.01, 1), ok = y >= 4.6e9;
      box(ctx, x0, by, (x1 - x0) * t, bh, ok ? v("--green") : v("--coral"), 8);
      var ex = x0 + (Math.log(4.6e9) / Math.LN10 - 3) / 8 * (x1 - x0);
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(ex, by - 8); ctx.lineTo(ex, by + bh + 8); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "지구의 나이 46억 년", ex, by + bh + 24, { s: 11, w: "800", a: "center" });
      [3, 5, 7, 9, 11].forEach(function (k) { text(ctx, ["천 년", "10만 년", "천만 년", "10억 년", "천억 년"][(k - 3) / 2], x0 + (k - 3) / 8 * (x1 - x0), by + bh + 44, { s: 10.5, c: v("--mist"), a: k === 3 ? "left" : (k === 11 ? "right" : "center") }); });
      text(ctx, years(y), x0 + 12, by + 23, { s: 15, w: "900", c: v("--on-accent") });

      $("a-fuel-info").innerHTML = "수명 = 2.0×10³⁰ kg × <b>" + sci(e) + " J/kg</b> ÷ 3.8×10²⁶ J/s = " + sci(lifeYears(e) * YEAR) + " 초 = <b>" + years(y) + "</b>. " +
        (ok ? "46억 년을 넘겼습니다. 이만한 에너지를 내는 연료는 석탄의 약 <b>" + Math.round(e / 3.16e7 / 1e4).toLocaleString() + "만 배</b> 진해야 합니다." : "지구의 나이 46억 년에 한참 못 미칩니다.");
      var ch = false;
      if (!okA && Math.abs(x - 7.5) < 0.01) { okA = ch = true; window.sthState("fuelA", 1); }
      if (!okB && Math.abs(x - 13.5) < 0.01) { okB = ch = true; window.sthState("fuelB", 1); }
      if (ch) { check(); if (okB) draw(); }
    }
    function check() {
      if (okA) { done("m1-2a"); $("m1-2a").innerHTML = "석탄 태양의 수명은 <b>약 5,300년</b>. 피라미드가 세워진 때부터 지금까지도 못 버팁니다."; }
      if (okB) { done("m1-2b"); $("m1-2b").innerHTML = "눈금 <b>13.5</b>(약 3.2×10¹³ J/kg)부터 46억 년을 넘깁니다. 석탄의 <b>100만 배</b>! 화학 반응으로는 불가능한 값입니다."; }
      if (okA && okB) { window.sthMission("m1-2", true); ep.clear(1); }
    }
    canvas._redraw = draw;
    $("a-fuel-x").addEventListener("input", function (ev) { x = +ev.target.value; $("a-fuel-x-val").textContent = "눈금 " + x.toFixed(1); draw(); });
    $("a-fuel-x-val").textContent = "눈금 " + x.toFixed(1);
    draw(); check();
  })();

  /* 장면 3 — 질량 결손과 E = Δm c² */
  function fusionPower(m) { return 0.007 * m * 1e11 * C2; }          // m: 억 톤/초 → J/초
  (function () {
    var canvas = $("c-a-fus"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var m = 1, okA = !!window.sthState("fusA"), okB = !!window.sthState("fusB");
    function nucleus(cx, cy, r, col, label) {
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
      if (label) text(ctx, label, cx, cy + 4, { s: 11, w: "900", c: v("--on-accent"), a: "center" });
    }
    function draw() {
      paper(ctx, W, H);
      /* 왼쪽: 반응 그림과 질량 저울 */
      text(ctx, "수소 핵융합 (태양 중심부)", 30, 30, { s: 13, w: "800" });
      [[70, 80], [120, 80], [70, 130], [120, 130]].forEach(function (p) { nucleus(p[0], p[1], 18, v("--coral"), "H"); });
      ctx.strokeStyle = v("--ink"); ctx.fillStyle = v("--ink"); ctx.lineWidth = 2.5; window.drawArrow(ctx, 160, 105, 230, 105, 10);
      nucleus(285, 105, 30, v("--violet"), "He");
      text(ctx, "+ 에너지", 330, 110, { s: 14, w: "900", c: v("--amber-700") });
      var bx = 30, bw = 380;
      text(ctx, "수소 원자핵 4개의 질량  4.0292", bx, 190, { s: 11.5, w: "800" });
      box(ctx, bx, 198, bw, 20, v("--coral"), 5);
      text(ctx, "헬륨 원자핵 1개의 질량  4.0015", bx, 246, { s: 11.5, w: "800" });
      box(ctx, bx, 254, bw * 4.0015 / 4.0292, 20, v("--violet"), 5);
      ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2; ctx.setLineDash([4, 3]); ctx.strokeRect(bx + bw * 4.0015 / 4.0292, 254, bw * 0.0277 / 4.0292, 20); ctx.setLineDash([]);
      text(ctx, "↑ 줄어든 질량 0.0277 (약 0.7%) → 에너지로", bx + bw, 296, { s: 11.5, w: "800", c: v("--amber-700"), a: "right" });
      text(ctx, "(막대 끝의 점선 칸이 0.7%입니다)", bx + bw, 314, { s: 10.5, c: v("--mist"), a: "right" });

      /* 오른쪽: 방출 에너지 계기 */
      var P = fusionPower(m), gx = 480, gw = 380, gy = 120, maxP = 7.6e26;
      text(ctx, "태양이 1초에 내보내는 에너지", gx, 30, { s: 13, w: "800" });
      text(ctx, "Δm = 0.7% × " + m.toFixed(1) + "억 톤 = " + Math.round(m * 70).toLocaleString() + "만 톤", gx, 62, { s: 12, c: v("--mist") });
      text(ctx, "E = Δm × c² = " + sci(P, 2) + " J", gx, 88, { s: 15, w: "900" });
      box(ctx, gx, gy, gw, 36, v("--card-2"), 8);
      var t0 = 3.724e26 / maxP, t1 = 3.876e26 / maxP;
      ctx.fillStyle = v("--green"); ctx.globalAlpha = .45; ctx.fillRect(gx + gw * t0 - 3, gy - 8, gw * (t1 - t0) + 6, 52); ctx.globalAlpha = 1;
      var ok = P >= 3.724e26 && P <= 3.876e26;
      box(ctx, gx, gy + 6, clamp(P / maxP, 0.005, 1) * gw, 24, ok ? v("--green-700") : v("--amber"), 6);
      text(ctx, "실제 태양 3.8×10²⁶ J", gx + gw * 0.5, gy + 64, { s: 11, w: "800", c: v("--green-700"), a: "center" });
      /* 지구 */
      var mood = ok ? "🌍 지금의 지구" : (P < 3.724e26 ? "🧊 햇빛이 모자라 지구가 식어 갑니다" : "🔥 햇빛이 넘쳐 지구가 뜨거워집니다");
      text(ctx, mood, gx, 230, { s: 14, w: "900", c: ok ? v("--green-700") : (P < 3.724e26 ? v("--brand-700") : v("--rose-700")) });
      if (m > 0) text(ctx, "중심부 수소(태양의 약 10%)를 다 쓰는 데 " + years(M_SUN * 0.1 / (m * 1e11) / YEAR), gx, 262, { s: 11.5, c: v("--mist") });

      $("a-fus-info").innerHTML = "1초에 수소 <b>" + m.toFixed(1) + "억 톤</b>이 핵융합하면 그 0.7%인 <b>" + Math.round(m * 70).toLocaleString() + "만 톤</b>의 질량이 사라지고, E = Δm c² = <b>" + sci(P, 2) + " J</b>의 에너지가 나옵니다. " +
        (ok ? "실제 태양과 일치합니다! 태양은 1초마다 약 <b>420만 톤</b>씩 가벼워지고 있습니다." : (P < 3.724e26 ? "실제 태양(3.8×10²⁶ J)보다 어둡습니다." : "실제 태양(3.8×10²⁶ J)보다 밝습니다."));
      if (ok && !okA) { okA = true; window.sthState("fusA", m.toFixed(1)); check(); }
    }
    function check() {
      if (okA) { done("m1-3a"); $("m1-3a").innerHTML = "1초에 수소 약 <b>6억 톤</b>이 핵융합하고, 그중 약 <b>420만 톤</b>의 질량이 에너지로 바뀝니다. 이 속도라면 중심부의 수소만으로도 <b>약 100억 년</b>을 빛납니다."; }
      if (okB) done("m1-3b");
      if (okA && okB) { window.sthMission("m1-3", true); ep.clear(2); }
    }
    canvas._redraw = draw;
    $("a-fus-m").addEventListener("input", function (ev) { m = +ev.target.value; $("a-fus-m-val").textContent = m.toFixed(1) + "억 톤"; draw(); });
    window.sthPick({
      mount: "a-q1",
      q: "핵융합 전보다 후의 질량이 0.7% 줄었습니다. 줄어든 질량은 어떻게 된 것일까요?",
      options: ["재가 되어 태양 중심에 쌓였다", "에너지로 바뀌어 빛과 열로 방출되었다", "수소가 타서 연기(기체)로 날아갔다", "측정 오차일 뿐 실제로는 줄지 않았다"],
      answer: 1,
      why: ["핵융합은 연소가 아닙니다. 재가 생기지 않으며, 생긴 헬륨의 질량은 이미 계산에 넣었습니다.", "질량과 에너지는 서로 바뀔 수 있습니다(E = mc²). 줄어든 질량에 c²(9×10¹⁶)을 곱한 만큼의 막대한 에너지가 나옵니다.", "산소와 결합하는 연소가 아닙니다. 원자핵끼리 합쳐지는 반응입니다.", "0.7%는 정밀하게 측정된 값이고, 태양의 밝기를 정확히 설명합니다."],
      onDone: function () { okB = true; window.sthState("fusB", 1); check(); }
    });
    draw(); check();
  })();

  /* 장면 4 — 지구에서의 에너지 흐름 */
  (function () {
    var sorted = !!window.sthState("flowSort"), chained = !!window.sthState("chainOK");
    /* (가) 흐름 그림 */
    (function () {
      var canvas = $("c-a-flow"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
      function draw() {
        paper(ctx, W, H);
        ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(70, 80, 40, 0, Math.PI * 2); ctx.fill();
        text(ctx, "태양", 70, 85, { s: 13, w: "900", c: v("--on-accent"), a: "center" });
        text(ctx, "수소 핵융합", 70, 142, { s: 11, c: v("--mist"), a: "center" });
        ctx.strokeStyle = v("--amber"); ctx.fillStyle = v("--amber"); ctx.lineWidth = 8; window.drawArrow(ctx, 120, 80, 250, 80, 16);
        text(ctx, "태양 복사 에너지 100", 125, 56, { s: 11.5, w: "800", c: v("--amber-700") });
        ctx.lineWidth = 3; ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); window.drawArrow(ctx, 262, 66, 330, 22, 10);
        text(ctx, "반사 약 30 → 우주로", 340, 26, { s: 11.5, w: "800", c: v("--mist") });
        ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(278, 92, 20, 0, Math.PI * 2); ctx.fill();
        text(ctx, "지구", 278, 96, { s: 11, w: "900", c: v("--on-accent"), a: "center" });
        text(ctx, "흡수 약 70", 236, 140, { s: 11.5, w: "800" });
        var rows = [
          { y: 60, c: "--coral", t: "🌡️ 대기와 지표를 데운다", e: "열에너지", to: "결국 지구 복사로 우주에 방출" },
          { y: 116, c: "--brand", t: "💨 바람·해류·파도를 일으킨다", e: "운동 에너지", to: "풍력·파력 발전" },
          { y: 172, c: "--teal", t: "💧 물을 증발시켜 비와 눈으로 (물의 순환)", e: "위치 에너지", to: "수력 발전" },
          { y: 228, c: "--green", t: "🌱 광합성 — 도달한 빛의 0.1%도 안 됨", e: "화학 에너지", to: "먹이(양분) · 장작 · 화석 연료" }
        ];
        rows.forEach(function (r) {
          ctx.strokeStyle = v(r.c); ctx.fillStyle = v(r.c); ctx.lineWidth = 2.5; window.drawArrow(ctx, 300, 120, 350, r.y + 22, 9);
          box(ctx, 356, r.y, 300, 46, v(r.c), 10);
          text(ctx, r.t, 366, r.y + 19, { s: 11.5, w: "800", c: v("--on-accent") });
          text(ctx, "→ " + r.e, 366, r.y + 37, { s: 11, c: v("--on-accent") });
          ctx.lineWidth = 2; window.drawArrow(ctx, 660, r.y + 23, 690, r.y + 23, 8);
          text(ctx, r.to, 698, r.y + 27, { s: 11, w: "800" });
        });
        text(ctx, "에너지는 형태를 바꾸며 흐르다가 마지막에는 열이 되어 우주로 빠져나갑니다.", 30, H - 12, { s: 11, c: v("--mist") });
      }
      canvas._redraw = draw; draw();
    })();

    function check() {
      if (sorted) done("m1-4a"); if (chained) done("m1-4b");
      if (sorted && chained) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>바람도, 댐의 물도, 밥도, 석탄도 거슬러 올라가면 <b>태양</b>입니다. 그리고 화석 연료 1 J 에는 햇빛 약 20만 J 과 수억 년의 시간이 들어 있습니다. 단, 지열·조력·핵에너지의 근원은 태양이 아닙니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    window.sthSort({
      mount: "a-sort",
      buckets: [
        { id: "k", label: "태양 → 대기·해수의 운동", sub: "고르지 않게 데워져 바람·해류가 생긴다" },
        { id: "p", label: "태양 → 물의 순환", sub: "증발한 물이 높은 곳에 내린다" },
        { id: "c", label: "태양 → 광합성", sub: "빛에너지가 화학 에너지로 저장된다" },
        { id: "x", label: "근원이 태양이 아니다", sub: "지구 내부·달·원자핵" }
      ],
      items: [
        { t: "💨 풍력 발전기를 돌리는 바람", a: "k", why: "태양이 지표를 고르지 않게 데워 생긴 기압 차가 바람을 일으킵니다." },
        { t: "🌊 서핑하는 파도", a: "k", why: "파도는 대부분 바람이 일으킵니다. 바람의 근원이 태양이지요.", hint: "파도를 일으키는 것은 무엇인가요?" },
        { t: "🏞️ 댐에 고인 물", a: "p", why: "태양 에너지로 증발한 물이 높은 곳에 비로 내려 위치 에너지를 갖습니다." },
        { t: "🍚 밥 한 공기", a: "c", why: "벼가 광합성으로 저장한 화학 에너지입니다." },
        { t: "🪨 석탄", a: "c", why: "수억 년 전 식물이 광합성으로 저장한 에너지입니다.", hint: "석탄은 무엇이 묻혀서 만들어졌나요?" },
        { t: "🛢️ 석유·천연가스", a: "c", why: "옛 바다 생물(플랑크톤)의 유해입니다. 그 에너지도 광합성에서 왔습니다." },
        { t: "🌋 지열 발전", a: "x", why: "지구 내부의 열(방사성 원소의 붕괴열 등)이 근원입니다.", hint: "땅속의 열은 햇빛이 데운 것이 아닙니다." },
        { t: "🌗 조력 발전(밀물과 썰물)", a: "x", why: "밀물과 썰물은 주로 달의 인력 때문에 생깁니다.", hint: "밀물과 썰물은 왜 생기나요?" },
        { t: "☢️ 원자력 발전의 우라늄", a: "x", why: "우라늄 원자핵에 저장된 핵에너지입니다. 태양보다 먼저 있던 별들이 만든 원소이지요." }
      ],
      onDone: function () { sorted = true; window.sthState("flowSort", 1); check(); }
    });

    /* (나) 직렬 전환 계산기 — 기존 화면을 로그 눈금으로 고쳤다 */
    (function () {
      var canvas = $("c-a-chain"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
      var a = 70, b = 2, c = 0.1;
      function draw() {
        paper(ctx, W, H);
        var s1 = a, s2 = s1 * b / 100, s3 = s2 * c / 100;
        var st = [{ n: "대기 밖 햇빛", p: 100, c: "--amber" }, { n: "지표에 도달", p: s1, c: "--coral" }, { n: "광합성으로 저장 (화학 에너지)", p: s2, c: "--green" }, { n: "화석 연료로 보존", p: s3, c: "--violet" }];
        var x0 = 30, full = 560;
        st.forEach(function (s, i) {
          var y = 18 + i * 46, w = Math.max(6, full * (Math.log(s.p) / Math.LN10 + 6) / 8);
          box(ctx, x0, y, w, 30, v(s.c), 6);
          text(ctx, s.n, x0 + w + 10, y + 13, { s: 11.5, w: "800" });
          text(ctx, (s.p >= 0.1 ? s.p.toFixed(1) : (s.p >= 0.001 ? s.p.toFixed(4) : s.p.toFixed(6))) + " %", x0 + w + 10, y + 28, { s: 11, c: v("--mist") });
        });
        text(ctx, "막대는 로그 눈금 (한 칸 줄면 10분의 1)", W - 20, H - 10, { s: 10.5, c: v("--mist"), a: "right" });
        var need = 100 / s3, ok = need >= 190000 && need <= 210000;
        $("a-ch-info").innerHTML = "100 × " + a + "% × " + b.toFixed(1) + "% × " + c.toFixed(2) + "% = <b>" + s3.toFixed(6) + "%</b>. 화석 연료 1 J 이 만들어지려면 햇빛이 <b>약 " + (Math.round(need / 1000) * 1000).toLocaleString() + " J</b> 필요합니다. " +
          (ok ? "✅ 조사한 값과 일치합니다. 우리는 수억 년 동안 아주 조금씩 모인 햇빛을 단 몇백 년 만에 태우고 있는 셈입니다." : "단계를 거칠 때마다 <b>효율이 곱해져</b> 급격히 줄어듭니다.");
        if (ok && !chained) { chained = true; window.sthState("chainOK", 1); check(); }
      }
      canvas._redraw = draw;
      $("a-ch-a").addEventListener("input", function (ev) { a = +ev.target.value; $("a-ch-a-val").textContent = a; draw(); });
      $("a-ch-b").addEventListener("input", function (ev) { b = +ev.target.value; $("a-ch-b-val").textContent = b.toFixed(1); draw(); });
      $("a-ch-c").addEventListener("input", function (ev) { c = +ev.target.value; $("a-ch-c-val").textContent = c.toFixed(2); draw(); });
      draw();
    })();
    check();
    if (ep.cleared(3)) window.sthMission("m1-4", true);
  })();

  /* 장면 5 — 결말 */
  function vs() {
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉠") === 0 ? "정확했습니다. 석탄 태양은 약 5,300년이면 꺼집니다. 그래서 태양은 석탄일 수 없습니다." : "계산해 보니 석탄 태양은 <b>약 5,300년</b>밖에 못 갑니다. 46억 년을 설명하려면 석탄보다 100만 배 진한 에너지원, 곧 핵융합이 필요했습니다.");
  }
  function finish() { window.sthState("r1", "해결 · 석탄 태양은 5,300년 → 핵융합: 1초에 수소 " + (window.sthState("fusA") || "6.0") + "억 톤, 질량 0.7%가 에너지로"); }
  ep.onShow(function (i) { if (i === 4) vs(); });
  vs();
  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학2 Ⅱ-2] 이야기 ① 태양은 석탄 덩어리일까",
    items: [
      { id: "a1", label: "에밀에게 보내는 편지: 태양이 빛나는 까닭", hint: "‘수소 원자핵’, ‘헬륨 원자핵’, ‘질량’, ‘에너지’를 모두 넣어, 태양이 석탄일 수 없는 까닭과 진짜 에너지원을 설명하세요." },
      { id: "a2", label: "오늘 내가 쓴 에너지의 족보", hint: "오늘 쓴 에너지 하나(급식, 버스, 휴대 전화 충전 등)를 골라 태양까지 거슬러 올라가며 에너지가 전환된 과정을 화살표로 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 불 꺼진 섬
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "지원단의 첫 추리",
    question: "강한 자석을 코일 바로 옆에 가만히 붙여 두면 코일에 전류가 흐를까요?",
    options: ["㉠ 흐른다. 자석이 셀수록 큰 전류가 계속 흐른다", "㉡ 코일을 아주 많이 감으면 가만히 있어도 흐른다", "㉢ 흐르지 않는다. 자석이나 코일이 움직일 때만 흐른다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 전자기 유도 : 유도 전압 ∝ 감은 수 × (자기장의 변화 ÷ 시간) */
  function flux(x) { var d = (100 - x) * 3; return 1 / (1 + (d / 80) * (d / 80)); }   // 코일을 지나는 자기장(상대값)
  (function () {
    var canvas = $("c-b-ind"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var x = 0, N = 1, g = 0, lastT = 0, lastPhi = flux(0), timer = null, peak = 0;
    var got = window.sthState("ind") || { p: false, m: false, z: false };
    function draw() {
      paper(ctx, W, H);
      /* 코일 */
      var cx0 = 560, cx1 = 760, cy = 190, turns = 6 * N;
      ctx.strokeStyle = v("--coral-700"); ctx.lineWidth = 3;
      for (var i = 0; i < turns; i++) { var tx = cx0 + (i + 0.5) / turns * (cx1 - cx0); ctx.beginPath(); ctx.ellipse(tx, cy, 10, 52, 0, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); }
      /* 자석 */
      var mx = lerp(60, 470, x / 100), mw = 220;
      box(ctx, mx, cy - 24, mw / 2, 48, v("--brand"), 6); box(ctx, mx + mw / 2, cy - 24, mw / 2, 48, v("--rose"), 6);
      text(ctx, "S", mx + mw / 4, cy + 7, { s: 18, w: "900", c: v("--on-accent"), a: "center" });
      text(ctx, "N", mx + mw * 3 / 4, cy + 7, { s: 18, w: "900", c: v("--on-accent"), a: "center" });
      ctx.strokeStyle = v("--coral-700"); ctx.lineWidth = 3;
      for (var j = 0; j < turns; j++) { var ux = cx0 + (j + 0.5) / turns * (cx1 - cx0); ctx.beginPath(); ctx.ellipse(ux, cy, 10, 52, 0, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); }
      text(ctx, "코일 " + N * 100 + "회", (cx0 + cx1) / 2, cy + 84, { s: 12, w: "800", a: "center" });
      /* 검류계 */
      var gx = 760, gy = 110, R = 70;
      ctx.strokeStyle = v("--coral-700"); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx0, cy - 52); ctx.lineTo(cx0, 40); ctx.lineTo(gx - 40, 40); ctx.moveTo(cx1, cy - 52); ctx.lineTo(cx1 + 60, cy - 52); ctx.lineTo(cx1 + 60, gy); ctx.stroke();
      box(ctx, gx - 90, gy - 80, 180, 96, v("--card-2"), 12);
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, gy, R, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
      [-50, -25, 0, 25, 50].forEach(function (t) { var an = -Math.PI / 2 + t / 50 * Math.PI * 0.3; text(ctx, t === 0 ? "0" : (t > 0 ? "+" : "−") + Math.abs(t), gx + Math.cos(an) * (R - 14), gy + Math.sin(an) * (R - 14) + 4, { s: 10, c: v("--mist"), a: "center" }); });
      var ang = -Math.PI / 2 + clamp(g, -50, 50) / 50 * Math.PI * 0.3;
      ctx.strokeStyle = v("--rose"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(ang) * (R - 6), gy + Math.sin(ang) * (R - 6)); ctx.stroke();
      text(ctx, "검류계  " + (g > 0 ? "+" : (g < 0 ? "−" : "")) + Math.abs(Math.round(g)) + "칸", gx, gy - 86, { s: 12, w: "800", a: "center" });
      text(ctx, "이번 실험의 최대 흔들림 " + Math.round(peak) + "칸", 30, 30, { s: 12.5, w: "800" });
      text(ctx, "코일을 지나는 자기장 " + Math.round(flux(x) * 100) + "%", 30, 52, { s: 11.5, c: v("--mist") });
    }
    function mission() {
      if (got.p) done("m2-2a"); if (got.m) done("m2-2b");
      if (got.z) { done("m2-2c"); $("m2-2c").innerHTML = "자석이 코일 속에 있어도 <b>가만히 있으면 바늘은 0</b>입니다. 자석의 세기가 아니라 <b>자기장의 변화</b>가 전류를 만듭니다."; }
      if (got.p && got.m && got.z) {
        window.sthMission("m2-2", true);
        ep.clear(1);
      }
    }
    function tick() {
      timer = null;
      var idle = Date.now() - lastT;
      if (idle > 80) { g *= 0.6; if (Math.abs(g) < 0.4) g = 0; }
      if (!got.z && (got.p || got.m) && x >= 80 && idle >= 2000 && g === 0) {
        got.z = true; window.sthState("ind", got); mission();
        $("b-ind-info").innerHTML = "자석이 코일 속에 <b>가만히</b> 있습니다. 코일을 지나는 자기장은 크지만 <b>변하지 않으므로</b> 바늘은 0입니다.";
      }
      draw();
      if (g !== 0 || (!got.z && x >= 80 && idle < 2600)) timer = window.setTimeout(tick, 50);
    }
    $("b-ind-x").addEventListener("input", function (ev) {
      var nx = +ev.target.value, now = Date.now(), dt = Math.min(0.5, Math.max(16, now - lastT) / 1000), ph = flux(nx);
      var emf = N * (ph - lastPhi) / dt * 15;                    // 유도 전압 ∝ N × ΔΦ/Δt
      g = clamp(0.5 * g + 0.5 * emf, -50, 50);
      if (Math.abs(g) > peak) peak = Math.abs(g);
      x = nx; lastT = now; lastPhi = ph;
      $("b-ind-x-val").textContent = x < 35 ? "코일 밖" : (x < 80 ? "코일 입구" : "코일 속");
      var ch = false;
      if (g >= 10 && !got.p) { got.p = ch = true; }
      if (g <= -10 && !got.m) { got.m = ch = true; }
      if (ch) { window.sthState("ind", got); mission(); }
      $("b-ind-info").innerHTML = Math.abs(g) >= 10 ? "바늘이 <b>" + (g > 0 ? "오른쪽(+)" : "왼쪽(−)") + "</b>으로 크게 움직였습니다. 넣을 때와 뺄 때 전류의 방향이 반대입니다. 더 빠르게, 또는 코일을 더 많이 감고 해 보세요." :
        "바늘이 조금 움직입니다. <b>더 빠르게</b> 움직이면 어떻게 될까요?";
      draw();
      if (!timer) timer = window.setTimeout(tick, 50);
    });
    segBind("b-ind-n", "data-n", function (n) { N = +n; peak = 0; draw(); });
    canvas._redraw = draw;
    draw(); mission();
  })();

  /* 장면 3 — 발전기 : V(실횻값) = N·B·A·2πf ÷ √2 */
  var AREA = 0.02063;
  function genVolt(N, B, f) { return N * B * AREA * 2 * Math.PI * f / Math.SQRT2; }
  (function () {
    var canvas = $("c-b-gen"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var N = 100, B = 0.2, f = 20, th = 0, tries = window.sthState("genTries") || [];
    function draw() {
      paper(ctx, W, H);
      var V = genVolt(N, B, f);
      /* 자석과 회전 코일 */
      var cx = 150, cy = 170;
      ctx.globalAlpha = lerp(.45, 1, (B - 0.1) / 0.9);
      box(ctx, 20, 90, 50, 160, v("--rose"), 8); box(ctx, 230, 90, 50, 160, v("--brand"), 8);
      ctx.globalAlpha = 1;
      text(ctx, "N", 45, 176, { s: 20, w: "900", c: v("--on-accent"), a: "center" }); text(ctx, "S", 255, 176, { s: 20, w: "900", c: v("--on-accent"), a: "center" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1;
      for (var k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(74, 110 + k * 30); ctx.lineTo(226, 110 + k * 30); ctx.stroke(); }
      var hw = 62 * Math.cos(th);
      ctx.strokeStyle = v("--coral-700"); ctx.lineWidth = clamp(N / 60, 2, 7);
      ctx.strokeRect(cx - Math.abs(hw), cy - 56, Math.abs(hw) * 2 || 1, 112);
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx, 70); ctx.lineTo(cx, 270); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "코일 " + N + "회 · " + B.toFixed(2) + " T · 1초에 " + f + "회전", cx, 300, { s: 11.5, w: "800", a: "center" });
      text(ctx, "🚲 운동 에너지 → ⚡ 전기 에너지", cx, 40, { s: 12.5, w: "800", a: "center" });

      /* 파형 (0.05초) */
      var x0 = 330, x1 = 650, y0 = 170, amp = clamp(V * Math.SQRT2 / 450, 0, 1) * 100;
      text(ctx, "코일에 생기는 전압 (0.05초 동안)", x0, 40, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.moveTo(x0, 60); ctx.lineTo(x0, 280); ctx.stroke();
      var top = 311 / 450 * 100;
      ctx.strokeStyle = v("--green"); ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x0, y0 - top); ctx.lineTo(x1, y0 - top); ctx.moveTo(x0, y0 + top); ctx.lineTo(x1, y0 + top); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "220 V 교류의 최댓값", x1, y0 - top - 6, { s: 10.5, c: v("--green-700"), a: "right" });
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 320; i++) { var yy = y0 - amp * Math.sin(2 * Math.PI * f * 0.05 * i / 320 + th); if (i === 0) ctx.moveTo(x0 + i, yy); else ctx.lineTo(x0 + i, yy); }
      ctx.stroke();
      text(ctx, "주파수 " + f + " Hz", x0, 304, { s: 12, w: "800", c: Math.abs(f - 60) <= 1 ? v("--green-700") : v("--ink") });

      /* 전압계와 전구 */
      var okV = V >= 210 && V <= 230;
      box(ctx, 690, 60, 190, 84, v("--card-2"), 14);
      text(ctx, "전압(실횻값)", 785, 84, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, Math.round(V) + " V", 785, 124, { s: 28, w: "900", a: "center", c: okV ? v("--green-700") : (V > 230 ? v("--rose-700") : v("--ink")) });
      var glow = clamp(V / 220, 0, 1.6);
      ctx.fillStyle = v("--amber"); ctx.globalAlpha = clamp(glow * 0.6, 0.05, 1); ctx.beginPath(); ctx.arc(785, 220, 20 + 22 * Math.min(glow, 1.3), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(785, 220, 20, 0, Math.PI * 2); ctx.stroke();
      text(ctx, V > 230 ? "💥 과전압!" : (V < 210 ? "전등이 희미합니다" : "딱 알맞은 밝기"), 785, 296, { s: 12, w: "800", a: "center", c: V > 230 ? v("--rose-700") : (okV ? v("--green-700") : v("--mist")) });
    }
    function loop() {
      if (canvas.offsetParent !== null && f > 0) { th += f / 60 * 0.45; draw(); }
      window.setTimeout(loop, 70);                       // rAF 는 가려진 탭에서 멈추므로 쓰지 않는다
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "코일 " + t.N + "회 · " + t.B + " T · " + t.f + "회전 → <b>" + t.V + " V, " + t.f + " Hz</b> " + (t.ok ? "✅" : "❌ " + t.why); });
      $("b-gen-info").innerHTML = rows.length ? "<b>송전 기록</b><br>" + rows.join("<br>") : "세 값을 정하고 송전해 보세요. 여러 번 시도할 수 있습니다.";
    }
    $("b-gen-n").addEventListener("input", function (ev) { N = +ev.target.value; $("b-gen-n-val").textContent = N + "회"; draw(); });
    $("b-gen-b").addEventListener("input", function (ev) { B = +ev.target.value; $("b-gen-b-val").textContent = B.toFixed(2) + " T"; draw(); });
    $("b-gen-f").addEventListener("input", function (ev) { f = +ev.target.value; $("b-gen-f-val").textContent = f + "회"; draw(); });
    $("b-gen-run").addEventListener("click", function () {
      var V = genVolt(N, B, f), okV = V >= 210 && V <= 230, okF = f >= 59 && f <= 61, ok = okV && okF;
      var why = !okV ? (V < 210 ? "전압이 낮아 전등이 희미하고 냉장고가 돌지 않음" : "전압이 높아 가전제품이 타 버림") : "주파수가 60 Hz 가 아니라 모터와 시계가 제 속도로 돌지 않음";
      tries.push({ N: N, B: B.toFixed(2), f: f, V: Math.round(V), ok: ok, why: why });
      window.sthState("genTries", tries.slice(-8)); report();
      if (ok) {
        window.sthState("genBest", "코일 " + N + "회 · " + B.toFixed(2) + " T · 1초에 " + f + "회전 → " + Math.round(V) + " V");
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>코일 " + N + "회, 자석 " + B.toFixed(2) + " T, 1초에 " + f + "회전으로 <b>" + Math.round(V) + " V · " + f + " Hz</b>를 만들었습니다. 회전수는 60으로 묶여 있으니 전압은 <b>감은 수 × 자석 세기</b>로 맞춰야 했지요. 다른 조합도 찾아보세요.");
        ep.clear(2);
      }
    });
    canvas._redraw = draw;
    draw(); report(); loop();
    if (ep.cleared(2)) window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>" + (window.sthState("genBest") || "") + " — 다른 조합도 찾아보세요.");
  })();

  /* 장면 4 — 터빈을 돌리는 에너지원 비교 (섬의 1년 = 1,000만 kWh) */
  var PLANTS = [
    { icon: "🔥", name: "화력 발전", eff: 40, co2: 820, chain: ["화석 연료의\n화학 에너지", "열에너지\n(보일러의 증기)", "터빈의\n운동 에너지", "전기 에너지"],
      note: "석탄 <b>약 3,000톤</b>을 태워야 합니다(효율 40%, 석탄 1 kg에 3×10⁷ J). 날씨와 상관없이 많은 전기를 안정적으로 만들지만, 이산화 탄소와 미세 먼지를 많이 내보내고 연료는 언젠가 고갈됩니다." },
    { icon: "☢️", name: "원자력 발전", eff: 33, co2: 12, chain: ["우라늄의\n핵에너지", "열에너지\n(원자로의 증기)", "터빈의\n운동 에너지", "전기 에너지"],
      note: "우라늄-235 <b>약 1.4 kg</b>이면 됩니다(핵분열 1 kg에 약 8×10¹³ J). 발전 중 이산화 탄소를 거의 내지 않지만, 방사성 폐기물을 오랫동안 안전하게 보관해야 하고 사고가 나면 피해가 큽니다. 큰 설비라 작은 섬에는 맞지 않습니다." },
    { icon: "💧", name: "수력 발전", eff: 90, co2: 24, chain: ["높은 곳 물의\n위치 에너지", "떨어지는 물의\n운동 에너지", "터빈의\n운동 에너지", "전기 에너지"],
      note: "연료가 필요 없고 효율이 가장 높습니다. 다만 높은 곳에 많은 물을 가둘 지형이 있어야 하고, 댐은 주변 생태계와 마을을 물에 잠기게 합니다." },
    { icon: "💨", name: "풍력 발전", eff: 35, co2: 11, chain: ["바람의\n운동 에너지", "날개(터빈)의\n운동 에너지", "전기 에너지"],
      note: "연료가 필요 없고 배출량이 가장 적습니다. 바람의 세기에 따라 발전량이 들쭉날쭉하고, 소음과 새의 충돌 문제가 있습니다. 바람이 센 섬에는 유리합니다." },
    { icon: "☀️", name: "태양광 발전", eff: 20, co2: 48, chain: ["태양의\n빛에너지", "전기 에너지\n(태양 전지)"],
      note: "<b>터빈도 발전기도 없습니다.</b> 태양 전지가 빛에너지를 곧바로 전기 에너지로 바꿉니다. 밤과 흐린 날에는 발전하지 못하고 넓은 면적이 필요합니다." },
    { icon: "🌋", name: "지열 발전", eff: 16, co2: 38, chain: ["지구 내부의\n열에너지", "증기의\n열에너지", "터빈의\n운동 에너지", "전기 에너지"],
      note: "날씨와 상관없이 발전할 수 있지만, 뜨거운 지하수나 증기를 쉽게 얻는 화산 지대가 아니면 깊이 파야 해서 비용이 큽니다." }
  ];
  (function () {
    var canvas = $("c-b-src"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var sel = 0, mode = "eff", seen = window.sthState("srcSeen") || [1, 0, 0, 0, 0, 0];
    var okQ = !!window.sthState("srcQ"), okS = !!window.sthState("srcSort");
    function draw() {
      paper(ctx, W, H);
      var p = PLANTS[sel], n = p.chain.length, bw = 170, gap = (860 - n * bw) / Math.max(1, n - 1);
      if (n === 2) gap = 200;
      var sx = n === 2 ? 180 : 20;
      text(ctx, p.icon + " " + p.name + "의 에너지 전환", 20, 28, { s: 13.5, w: "900" });
      p.chain.forEach(function (c, i) {
        var bx = sx + i * (bw + gap), last = i === n - 1;
        box(ctx, bx, 46, bw, 64, last ? v("--amber") : v("--card-2"), 12);
        c.split("\n").forEach(function (ln, k) { text(ctx, ln, bx + bw / 2, 74 + k * 18, { s: 12, w: "800", a: "center", c: last ? v("--on-accent") : v("--ink") }); });
        if (!last) { ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 3; window.drawArrow(ctx, bx + bw + 6, 78, bx + bw + gap - 6, 78, 10); }
      });
      text(ctx, "섬의 1년(1,000만 kWh): CO₂ 약 " + (p.co2 * 10).toLocaleString() + "톤 배출 · 넣은 에너지 100 중 전기로 " + p.eff, 20, 140, { s: 12, w: "800", c: v("--brand-700") });
      /* 비교 막대 */
      var x0 = 170, x1 = 820, maxV = mode === "eff" ? 100 : 900;
      text(ctx, mode === "eff" ? "발전 효율 (%)" : "전기 1 kWh를 만들 때 나오는 CO₂ (g) — 건설·연료 채굴 포함", 20, 176, { s: 12.5, w: "800" });
      PLANTS.forEach(function (q, i) {
        var y = 190 + i * 37, val = mode === "eff" ? q.eff : q.co2;
        text(ctx, q.icon + " " + q.name, x0 - 12, y + 19, { s: 12, w: i === sel ? "900" : "500", a: "right" });
        box(ctx, x0, y, x1 - x0, 27, v("--card-2"), 6);
        box(ctx, x0, y, Math.max(4, (x1 - x0) * val / maxV), 27, i === sel ? v("--coral") : v("--teal"), 6);
        text(ctx, val + (mode === "eff" ? " %" : " g"), x0 + Math.max(4, (x1 - x0) * val / maxV) + 8, y + 19, { s: 12, w: "800" });
      });
      $("b-src-info").innerHTML = "<b>" + p.icon + " " + p.name + "</b> — " + p.note;
    }
    function check() {
      var all = seen.every(function (s) { return !!s; });
      if (all) done("m2-4a"); if (okQ) done("m2-4b"); if (okS) done("m2-4c");
      if (all && okQ && okS) {
        window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>열원은 달라도 대부분의 발전소는 결국 <b>터빈을 돌려 발전기의 코일(또는 자석)을 회전</b>시킵니다. 장면 3의 발전기가 그 안에 들어 있는 셈입니다. 태양광만 예외입니다.");
        ep.clear(3);
      }
    }
    segBind("b-src-pick", "data-k", function (k) { sel = +k; seen[sel] = 1; window.sthState("srcSeen", seen); draw(); check(); });
    segBind("b-src-mode", "data-m", function (m) { mode = m; draw(); });
    window.sthPick({
      mount: "b-q1",
      q: "같은 양의 전기를 만들 때, 화력 발전이 내보내는 CO₂는 원자력 발전의 약 몇 배일까요? (CO₂ 배출량 비교 그래프를 보세요.)",
      options: ["약 7배", "약 70배", "약 700배", "거의 같다"],
      answer: 1,
      why: ["그래프의 숫자로 직접 나눠 보세요. 820 ÷ 12 는?", "820 ÷ 12 ≈ 68, 약 70배입니다. 화석 연료는 <b>태우는 과정 자체</b>에서 이산화 탄소가 나오기 때문입니다.", "820 ÷ 12 를 다시 계산해 보세요.", "CO₂ 비교 그래프로 바꿔 막대 길이를 비교해 보세요."],
      onDone: function () { okQ = true; window.sthState("srcQ", 1); check(); }
    });
    window.sthSort({
      mount: "b-sort1",
      buckets: [
        { id: "s", label: "증기가 터빈을 돌린다", sub: "열원으로 물을 끓인다" },
        { id: "d", label: "물·바람이 터빈을 직접 돌린다", sub: "끓이는 과정이 없다" },
        { id: "n", label: "터빈이 없다", sub: "발전기 없이 곧바로 전기로" }
      ],
      items: [
        { t: "🔥 석탄 화력 발전", a: "s", why: "석탄을 태운 열로 물을 끓입니다." },
        { t: "🔥 천연가스(LNG) 화력 발전", a: "s", why: "연소 가스와 증기로 터빈을 돌립니다. 열원은 화석 연료입니다." },
        { t: "☢️ 원자력 발전", a: "s", why: "핵분열의 열로 물을 끓입니다. 원자로는 ‘불 없는 보일러’입니다.", hint: "원자로에서 나온 열로 무엇을 할까요?" },
        { t: "🌋 지열 발전", a: "s", why: "땅속 열로 만든 증기가 터빈을 돌립니다." },
        { t: "💧 수력 발전", a: "d", why: "떨어지는 물이 수차(터빈)를 직접 돌립니다." },
        { t: "💨 풍력 발전", a: "d", why: "바람이 날개를 직접 돌립니다." },
        { t: "🌗 조력 발전", a: "d", why: "밀물과 썰물 때 흐르는 바닷물이 터빈을 직접 돌립니다.", hint: "바닷물을 끓이지는 않습니다." },
        { t: "☀️ 태양광 발전", a: "n", why: "태양 전지는 움직이는 부분 없이 빛을 곧바로 전기로 바꿉니다.", hint: "태양 전지판에 돌아가는 부분이 있나요?" }
      ],
      onDone: function () { okS = true; window.sthState("srcSort", 1); check(); }
    });
    canvas._redraw = draw;
    draw(); check();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* 장면 5 — 온실 기체(기존 예측 잠금) + 발전소의 영향 + 결말 */
  var ghgPicked = false, sorted5 = !!window.sthState("b5sorted");
  function reveal() {
    $("b-end").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉢") === 0 ? " — 정확했습니다. 검류계로 직접 확인했지요." : " — 실험해 보니 자석이 가만히 있으면 바늘은 0이었습니다. 필요한 것은 센 자석이 아니라 <b>변하는 자기장</b>입니다.") +
      "<br><b>내가 설계한 발전기</b> " + (window.sthState("genBest") || "-");
  }
  function check5() {
    if (ghgPicked) done("m2-5a"); if (sorted5) done("m2-5b");
    if (ghgPicked && sorted5) { window.sthMission("m2-5", true); reveal(); ep.clear(4); }
  }
  function finish() { window.sthState("r2", "해결 · " + (window.sthState("genBest") || "-")); }
  window.sthGate({
    gate: "b-gt", key: "ghg", title: "먼저 예상해 봅시다",
    question: "지구의 <b>온실 효과에 가장 크게 기여하는</b> 기체는 무엇일까요?",
    options: ["㉠ 이산화 탄소", "㉡ 메테인", "㉢ 수증기", "㉣ 오존"],
    onPick: function (i) {
      var ok = (i === 2);
      window.sthState("ghgOK", ok ? "맞음" : "어긋남");
      var info = $("b-ghg-info");
      info.hidden = false;
      info.innerHTML = (ok ? "<b>맞았습니다.</b> " : "<b>정답은 ㉢ 입니다.</b> ") + "온실 효과 자체에 가장 크게 기여하는 것은 <b>수증기</b>입니다. 그런데도 기후변화 논의에서 이산화 탄소를 주로 다루는 까닭은, 수증기의 양은 <b>기온이 정하는 결과</b>인 반면 이산화 탄소는 <b>사람이 늘리는 원인</b>이기 때문입니다. 화력 발전소는 그 이산화 탄소를 가장 많이 내보내는 곳 가운데 하나입니다.";
      ghgPicked = true; check5();
    }
  });
  window.sthSort({
    mount: "b-sort2",
    buckets: [
      { id: "f", label: "🔥 화석 연료 발전소", sub: "석탄·석유·천연가스" },
      { id: "n", label: "☢️ 핵발전소", sub: "우라늄의 핵분열" },
      { id: "b", label: "두 발전소 모두" }
    ],
    items: [
      { t: "연료를 태울 때 이산화 탄소가 많이 나와 지구 온난화를 부추긴다", a: "f", why: "화석 연료의 연소는 이산화 탄소를 내보냅니다." },
      { t: "미세 먼지, 황 산화물, 질소 산화물이 나와 대기를 오염시킨다", a: "f", why: "화석 연료를 태울 때 나오는 오염 물질입니다." },
      { t: "발전하는 동안에는 이산화 탄소를 거의 내보내지 않는다", a: "n", why: "핵분열은 연소가 아니므로 이산화 탄소가 나오지 않습니다." },
      { t: "아주 적은 양의 연료로 많은 전기를 만든다", a: "n", why: "섬의 1년 전기에 석탄은 3,000톤, 우라늄-235는 1.4 kg이었습니다.", hint: "장면 4의 계산서를 떠올려 보세요." },
      { t: "다 쓴 연료를 수만 년 넘게 안전하게 보관할 곳이 필요하다", a: "n", why: "사용 후 핵연료는 오랫동안 방사선을 냅니다." },
      { t: "사고가 나면 방사성 물질이 넓은 지역으로 퍼질 수 있다", a: "n", why: "체르노빌(1986), 후쿠시마(2011) 사고가 그 예입니다." },
      { t: "날씨와 상관없이 많은 전기를 안정적으로 공급해 산업과 생활을 떠받친다", a: "b", why: "두 방식 모두 대규모로 안정적인 발전이 가능합니다.", hint: "한쪽만의 장점일까요?" },
      { t: "터빈을 돌린 증기를 식힌 따뜻한 물(온배수)이 주변 바다 생태계에 영향을 준다", a: "b", why: "둘 다 증기를 식히는 냉각수가 필요해 주로 바닷가에 짓습니다.", hint: "두 발전소 모두 물을 끓여 증기를 만듭니다." },
      { t: "연료의 매장량이 한정되어 있고 우리나라는 대부분 수입한다", a: "b", why: "석탄·석유·천연가스도, 우라늄도 한정된 자원입니다.", hint: "우라늄도 땅에서 캐는 광물입니다." }
    ],
    onDone: function () { sorted5 = true; window.sthState("b5sorted", 1); check5(); }
  });
  if (ep.cleared(4)) { window.sthMission("m2-5", true); reveal(); }
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학2 Ⅱ-2] 이야기 ② 불 꺼진 섬",
    items: [
      { id: "b1", label: "이장님께 드리는 설명: 발전기는 어떻게 전기를 만드나", hint: "‘자석을 가만히 두면 왜 안 되는지’부터 시작해, ‘자기장의 변화’, ‘운동 에너지 → 전기 에너지’라는 말을 넣어 설명하세요." },
      { id: "w2", label: "온실 기체 다시 보기", hint: "수증기가 온실 효과에 가장 큰 영향을 주는데도 기후변화 논의에서 이산화 탄소를 주로 다루는 까닭을 생각해 쓰세요." },
      { id: "b2", label: "주민 설명회 발표문", hint: "화석 연료 발전소와 핵발전소 가운데 하나를 골라, 우리 생활에 주는 이로운 점과 해로운 점을 한 가지 이상씩 쓰고 조사한 근거(수치)를 붙이세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 사라진 98
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "g3", key: "p3", title: "조사원의 첫 추리",
    question: "발전소에 넣은 석탄의 에너지 100 가운데, 마을 회관 백열전구의 ‘빛’이 되는 것은 얼마쯤일까요?",
    options: ["㉠ 약 50", "㉡ 약 20", "㉢ 약 2"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 세 단계 직렬 효율 (기존 2단계 화면을 넓혔다) */
  (function () {
    var canvas = $("c-c-loss"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var e1 = 50, e2 = 90, e3 = 50, okA = !!window.sthState("lossA"), okB = !!window.sthState("lossB");
    function draw() {
      paper(ctx, W, H);
      var s0 = 100, s1 = s0 * e1 / 100, s2 = s1 * e2 / 100, s3 = s2 * e3 / 100;
      var x0 = 40, full = 640, rows = [
        { n: "연료의 에너지", val: s0, lost: 0, c: "--amber", why: "" },
        { n: "① 발전소를 나온 전기 에너지", val: s1, lost: s0 - s1, c: "--teal", why: "굴뚝·냉각수의 폐열" },
        { n: "② 집에 도착한 전기 에너지", val: s2, lost: s1 - s2, c: "--brand", why: "전선의 저항에서 나는 열" },
        { n: "③ 쓸모 있게 쓰인 에너지", val: s3, lost: s2 - s3, c: "--violet", why: "기구에서 나는 열 등" }
      ];
      rows.forEach(function (r, i) {
        var y = 30 + i * 76;
        text(ctx, r.n, x0, y, { s: 12, w: "800" });
        box(ctx, x0, y + 8, Math.max(3, full * r.val / 100), 36, v(r.c), 6);
        if (r.lost > 0) { ctx.globalAlpha = .35; box(ctx, x0 + full * r.val / 100, y + 8, Math.max(2, full * r.lost / 100), 36, v("--coral"), 6); ctx.globalAlpha = 1; }
        text(ctx, r.val.toFixed(1), x0 + Math.max(3, full * r.val / 100) + (r.lost > 0 ? full * r.lost / 100 : 0) + 10, y + 32, { s: 14, w: "900" });
        if (r.lost > 0) text(ctx, "손실 " + r.lost.toFixed(1) + " — " + r.why, W - 20, y, { s: 11, c: v("--coral-700"), a: "right" });
      });
      $("c-loss-total").innerHTML = "전체 효율 = " + e1 + "% × " + e2 + "% × " + e3 + "% = <b>" + s3.toFixed(1) + "%</b>";
      $("c-loss-info").innerHTML = "연료의 에너지 100 가운데 <b>" + (100 - s3).toFixed(1) + "</b>이 도중에 열 등으로 흩어지고 <b>" + s3.toFixed(1) + "</b>만 쓸모 있게 쓰입니다. 흩어진 에너지는 없어진 것이 아니라 <b>다시 쓰기 어려운 형태</b>가 된 것입니다.";
      if (!okA && e1 === 40 && e2 === 96 && e3 === 5) { okA = true; window.sthState("lossA", 1); check(); }
    }
    function check() {
      if (okA) { done("m3-2a"); $("m3-2a").innerHTML = "100 × 40% × 96% × 5% = <b>1.9</b>. 석탄의 에너지 100 가운데 백열전구의 빛이 되는 것은 <b>2도 안 됩니다.</b>"; }
      if (okB) done("m3-2b");
      if (okA && okB) { window.sthMission("m3-2", true); ep.clear(1); }
    }
    canvas._redraw = draw;
    [["c-l1", function (x) { e1 = x; }], ["c-l2", function (x) { e2 = x; }], ["c-l3", function (x) { e3 = x; }]].forEach(function (p) {
      $(p[0]).addEventListener("input", function (ev) { p[1](+ev.target.value); $(p[0] + "-val").textContent = ev.target.value; draw(); });
    });
    window.sthPick({
      mount: "c-q1",
      q: "40% × 96% × 5% 상태에서 <b>한 단계만 10%p</b> 높일 수 있다면, 어느 단계를 높일 때 최종 효율이 가장 크게 오를까요? (슬라이더로 직접 해 보세요.)",
      options: ["① 발전 효율 40% → 50%", "② 송전·배전 효율 (이미 96%라 100%까지만)", "③ 전기 기구 효율 5% → 15%", "어느 단계든 똑같이 오른다"],
      answer: 2,
      why: ["최종 효율은 1.9% → 2.4%가 됩니다. 다른 단계도 해 보세요.", "100%로 올려도 1.9% → 2.0%입니다.", "1.9% → 5.8%, 세 배가 됩니다. 효율은 곱해지므로 <b>가장 낮은 단계</b>를 고치는 것이 가장 효과적입니다. 전구를 바꿔야 하는 까닭입니다.", "효율은 더해지는 것이 아니라 곱해집니다. 직접 비교해 보세요."],
      onDone: function () { okB = true; window.sthState("lossB", 1); check(); }
    });
    draw(); check();
  })();

  /* 장면 3 — 전구 교체 : 밝기(lm) = 소비 전력(W) × 전구의 발광 효율(lm/W) */
  var LAMPS = {
    inc: { n: "백열전구", lmw: 13.3, id: "m3-3a" },
    cfl: { n: "전구형 형광등", lmw: 57, id: "m3-3b" },
    led: { n: "LED 전구", lmw: 90, id: "m3-3c" }
  };
  (function () {
    var canvas = $("c-c-lamp"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var type = "inc", w = 30, found = window.sthState("lamp") || {};
    function draw() {
      paper(ctx, W, H);
      var L = LAMPS[type], lm = w * L.lmw, ok = lm >= 760 && lm <= 840, effPct = 5 * L.lmw / 13.3;
      /* 전구 */
      var cx = 130, cy = 140, glow = clamp(lm / 800, 0, 2);
      ctx.fillStyle = v("--amber"); ctx.globalAlpha = clamp(glow * 0.35, 0.04, 0.8); ctx.beginPath(); ctx.arc(cx, cy, 40 + 45 * Math.min(glow, 1.6), 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = clamp(glow * 0.7, 0.1, 1); ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, 38, 0, Math.PI * 2); ctx.stroke();
      box(ctx, cx - 16, cy + 36, 32, 26, v("--mist"), 4);
      text(ctx, L.n + " " + w + " W", cx, 250, { s: 13, w: "900", a: "center" });
      text(ctx, Math.round(lm) + " lm", cx, 276, { s: 18, w: "900", a: "center", c: ok ? v("--green-700") : (lm > 840 ? v("--rose-700") : v("--ink")) });
      text(ctx, ok ? "✅ 회관에 알맞은 밝기" : (lm < 760 ? "어둡습니다" : "필요 이상으로 밝습니다 (낭비)"), cx, 300, { s: 11.5, a: "center", c: v("--mist") });
      /* 밝기 계기 */
      var gx = 290, gw = 570;
      text(ctx, "밝기 (lm) — 초록 띠가 목표 760~840", gx, 34, { s: 12.5, w: "800" });
      box(ctx, gx, 46, gw, 26, v("--card-2"), 6);
      ctx.fillStyle = v("--green"); ctx.globalAlpha = .45; ctx.fillRect(gx + gw * 760 / 1600, 40, gw * 80 / 1600, 38); ctx.globalAlpha = 1;
      box(ctx, gx, 51, clamp(lm / 1600, 0.004, 1) * gw, 16, ok ? v("--green-700") : v("--amber"), 5);
      /* 전기 에너지가 간 곳 */
      text(ctx, "들어간 전기 에너지 100 은 어디로 갔나", gx, 116, { s: 12.5, w: "800" });
      var lw = gw * effPct / 100;
      box(ctx, gx, 128, lw, 40, v("--amber"), 6); box(ctx, gx + lw + 3, 128, gw - lw - 3, 40, v("--coral"), 6);
      text(ctx, "빛 " + effPct.toFixed(0), gx + 6, 190, { s: 12, w: "900", c: v("--amber-700") });
      text(ctx, "열 " + (100 - effPct).toFixed(0) + " (쓸모없이 흩어짐)", gx + gw, 190, { s: 12, w: "900", c: v("--coral-700"), a: "right" });
      /* 1년 전기 사용량 비교 */
      text(ctx, "하루 5시간씩 1년 동안 쓰는 전기 (내가 맞춘 전구)", gx, 226, { s: 12.5, w: "800" });
      ["inc", "cfl", "led"].forEach(function (k, i) {
        var y = 238 + i * 26, fw = found[k];
        text(ctx, LAMPS[k].n, gx + 96, y + 15, { s: 11, a: "right" });
        box(ctx, gx + 104, y, 380, 18, v("--card-2"), 4);
        if (fw) { var kwh = fw * 5 * 365 / 1000; box(ctx, gx + 104, y, 380 * kwh / 130, 18, k === "inc" ? v("--coral") : v("--teal"), 4); text(ctx, fw + " W → " + kwh.toFixed(0) + " kWh", gx + 104 + 380 * kwh / 130 + 8, y + 14, { s: 11, w: "800" }); }
        else text(ctx, "아직 맞추지 못함", gx + 112, y + 14, { s: 10.5, c: v("--mist") });
      });
      $("c-lamp-info").innerHTML = "<b>" + L.n + "</b>는 전력 1 W로 약 " + L.lmw + " lm의 빛을 냅니다. " + w + " W × " + L.lmw + " = <b>" + Math.round(lm) + " lm</b>. " +
        "백열전구의 빛 효율을 5%로 보면 이 전구의 빛 효율은 <b>약 " + effPct.toFixed(0) + "%</b>, 나머지는 열로 나갑니다.";
      if (ok && found[type] !== w) { found[type] = w; window.sthState("lamp", found); mission(); draw(); }
    }
    function mission() {
      ["inc", "cfl", "led"].forEach(function (k) { if (found[k]) { done(LAMPS[k].id); $(LAMPS[k].id).innerHTML = LAMPS[k].n + " — <b>" + found[k] + " W</b>"; } });
      if (found.inc && found.cfl && found.led) {
        var save = Math.round((1 - found.led / found.inc) * 100);
        window.sthState("lampSave", "백열 " + found.inc + " W → LED " + found.led + " W (" + save + "% 절약)");
        window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>같은 밝기를 내는 데 백열전구 <b>" + found.inc + " W</b>, 형광등 <b>" + found.cfl + " W</b>, LED <b>" + found.led + " W</b>. 전구만 바꿔도 전기를 <b>" + save + "%</b> 덜 씁니다. 발전소에서 태우는 석탄도 그만큼 줄어듭니다.");
        ep.clear(2);
      }
    }
    segBind("c-lamp-type", "data-k", function (k) { type = k; draw(); });
    $("c-lamp-w").addEventListener("input", function (ev) { w = +ev.target.value; $("c-lamp-w-val").textContent = w + " W"; draw(); });
    canvas._redraw = draw;
    draw(); mission();
  })();

  /* 장면 4 — 에너지 자립 마을 : 이틀(48시간) 전력 수급 모형 */
  var DEM = [300, 280, 270, 260, 260, 280, 350, 450, 500, 520, 530, 540, 550, 540, 530, 520, 540, 600, 700, 750, 720, 620, 480, 360];
  function village(s, w, b, d) {
    var soc = b * 0.5, black = 0, dies = 0, dem = 0, rows = [];
    for (var h = 0; h < 48; h++) {
      var day = h < 24 ? 0 : 1, hh = h % 24;
      var sun = Math.max(0, Math.sin(Math.PI * (hh - 6) / 12)) * (day ? 0.2 : 0.8);      // 1일: 맑음, 2일: 흐림
      var wind = day ? 0.06 : (0.35 + 0.15 * Math.sin(hh / 24 * 2 * Math.PI + 1));       // 1일: 바람, 2일: 잔잔
      var D = DEM[hh], R = s * sun + w * wind, net = R - D, dg = 0, un = 0, dis = 0;
      if (net >= 0) { soc += Math.min(net, b - soc); }
      else { var need = -net; dis = Math.min(need, soc); soc -= dis; need -= dis; dg = Math.min(need, d); need -= dg; un = need; }
      if (un > 1) black++;
      dies += dg; dem += D;
      rows.push({ D: D, R: Math.min(R, D), dis: dis, dg: dg, un: un, soc: soc });
    }
    return { black: black, ratio: dies / dem, co2: dies * 0.7, base: dem * 0.7, cost: s * 0.015 + w * 0.03 + b * 0.005 + d * 0.005, rows: rows };
  }
  (function () {
    var canvas = $("c-c-vill"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var S = 500, Wd = 0, Bt = 0, Dg = 0, tries = window.sthState("villTries") || [];
    function verdict(r) { return { a: r.black === 0, b: r.cost <= 55 + 1e-9, c: r.ratio <= 0.4 + 1e-9 }; }
    function draw() {
      paper(ctx, W, H);
      var r = village(S, Wd, Bt, Dg), x0 = 50, x1 = 880, y0 = 50, y1 = 250, bw = (x1 - x0) / 48, maxP = 900;
      text(ctx, "1일째 ☀️💨 맑고 바람 부는 날", x0 + 6, 30, { s: 12, w: "800" }); text(ctx, "2일째 ☁️ 흐리고 바람 없는 날", x0 + (x1 - x0) / 2 + 6, 30, { s: 12, w: "800" });
      ctx.fillStyle = v("--card-2"); ctx.fillRect(x0 + (x1 - x0) / 2, y0, (x1 - x0) / 2, y1 - y0);
      r.rows.forEach(function (o, h) {
        var x = x0 + h * bw, y = y1;
        [[o.R, "--green"], [o.dis, "--teal"], [o.dg, "--coral"], [o.un, "--ink"]].forEach(function (p) {
          var hh = p[0] / maxP * (y1 - y0); if (hh <= 0) return;
          ctx.fillStyle = v(p[1]); ctx.fillRect(x + 1, y - hh, bw - 2, hh); y -= hh;
        });
      });
      ctx.strokeStyle = v("--violet"); ctx.lineWidth = 2.5; ctx.beginPath();
      r.rows.forEach(function (o, h) { var xx = x0 + (h + 0.5) * bw, yy = y1 - o.D / maxP * (y1 - y0); if (h === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); });
      ctx.stroke();
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      [0, 6, 12, 18, 24, 30, 36, 42].forEach(function (h) { text(ctx, (h % 24) + "시", x0 + h * bw, y1 + 16, { s: 10, c: v("--mist") }); });
      text(ctx, "kW", 14, y0 + 4, { s: 10, c: v("--mist") });
      /* 배터리 잔량 띠 */
      text(ctx, "🔋", 22, 292, { s: 12 });
      box(ctx, x0, 278, x1 - x0, 18, v("--card-2"), 4);
      if (Bt > 0) r.rows.forEach(function (o, h) { ctx.fillStyle = v("--teal"); ctx.globalAlpha = 0.15 + 0.85 * o.soc / Bt; ctx.fillRect(x0 + h * bw, 278, bw, 18); ctx.globalAlpha = 1; });
      /* 범례 */
      [["--green", "태양광·풍력"], ["--teal", "배터리 방전"], ["--coral", "경유 발전"], ["--ink", "정전(모자람)"], ["--violet", "— 마을이 쓰는 전력"]].forEach(function (p, i) {
        ctx.fillStyle = v(p[0]); ctx.fillRect(x0 + i * 160, 316, 12, 12); text(ctx, p[1], x0 + i * 160 + 18, 327, { s: 11 });
      });
      var k = verdict(r);
      text(ctx, (k.a ? "✅" : "❌") + " 정전 " + r.black + "시간", x0, 352, { s: 12.5, w: "900", c: k.a ? v("--green-700") : v("--rose-700") });
      text(ctx, (k.b ? "✅" : "❌") + " 설치비 " + r.cost.toFixed(1) + "억 원", x0 + 220, 352, { s: 12.5, w: "900", c: k.b ? v("--green-700") : v("--rose-700") });
      text(ctx, (k.c ? "✅" : "❌") + " CO₂ 지금의 " + Math.round(r.ratio * 100) + "% (" + (r.co2 / 1000).toFixed(1) + "톤)", x0 + 480, 352, { s: 12.5, w: "900", c: k.c ? v("--green-700") : v("--rose-700") });
      return r;
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "☀️" + t.s + " 💨" + t.w + " 🔋" + t.b + " 🛢️" + t.d + " → 정전 " + t.bl + "시간 · " + t.cost + "억 원 · CO₂ " + t.co + "% " + (t.ok ? "✅" : "❌ " + t.why); });
      $("c-v-info").innerHTML = (rows.length ? "<b>제출 기록</b><br>" + rows.join("<br>") + "<br>" : "") +
        "막대가 보라색 선(마을이 쓰는 전력)에 닿지 못해 검은색이 생기면 정전입니다. 남는 전기는 배터리에 저장되고, 배터리가 가득 차면 버려집니다.";
    }
    [["c-v-s", function (x) { S = x; }, " kW"], ["c-v-w", function (x) { Wd = x; }, " kW"], ["c-v-b", function (x) { Bt = x; }, " kWh"], ["c-v-d", function (x) { Dg = x; }, " kW"]].forEach(function (p) {
      $(p[0]).addEventListener("input", function (ev) { p[1](+ev.target.value); $(p[0] + "-val").textContent = (+ev.target.value).toLocaleString() + p[2]; draw(); });
    });
    $("c-v-run").addEventListener("click", function () {
      var r = draw(), k = verdict(r), ok = k.a && k.b && k.c;
      var why = !k.a ? "정전 발생 — 흐리고 바람 없는 날을 버틸 저장 장치나 보조 전원이 모자람" : (!k.b ? "예산 초과" : "경유 발전에 너무 기댐 — 신재생 에너지와 배터리를 늘려야 함");
      tries.push({ s: S, w: Wd, b: Bt, d: Dg, bl: r.black, cost: r.cost.toFixed(1), co: Math.round(r.ratio * 100), ok: ok, why: why });
      window.sthState("villTries", tries.slice(-8)); report();
      if (ok) {
        window.sthState("villBest", "태양광 " + S + " · 풍력 " + Wd + " kW · 배터리 " + Bt + " kWh · 경유 " + Dg + " kW → " + r.cost.toFixed(1) + "억 원, CO₂ " + Math.round(r.ratio * 100) + "%");
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>설치비 " + r.cost.toFixed(1) + "억 원, 정전 0시간, CO₂는 지금의 " + Math.round(r.ratio * 100) + "%. 햇빛과 바람은 공짜이고 깨끗하지만 <b>날씨에 따라 들쭉날쭉</b>해서, 저장 장치와 보조 전원을 함께 설계해야 했습니다. 더 싸거나 더 깨끗한 설계도 찾아보세요.");
        ep.clear(3);
      }
    });
    canvas._redraw = draw;
    draw(); report();
    if (ep.cleared(3)) window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>" + (window.sthState("villBest") || "") + " — 더 싸거나 더 깨끗한 설계도 찾아보세요.");
  })();

  /* 장면 5 — 결말 */
  function reveal() {
    $("c-end").hidden = false;
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉢") === 0 ? " — 정확했습니다. 40% × 96% × 5% ≈ 1.9 입니다." : " — 실제로는 40% × 96% × 5% ≈ <b>1.9</b>. 단계마다 효율이 곱해지기 때문입니다.") +
      "<br><b>전구 교체</b> " + (window.sthState("lampSave") || "-") + "<br><b>내가 설계한 마을</b> " + (window.sthState("villBest") || "-");
  }
  function finish() { window.sthState("r3", ("해결 · " + (window.sthState("villBest") || "-")).slice(0, 118)); }
  window.sthSort({
    mount: "c-sort",
    buckets: [
      { id: "e", label: "효율 향상 기술", sub: "같은 일을 더 적은 에너지로 (덜 버리기)" },
      { id: "r", label: "신재생 에너지 기술", sub: "고갈되지 않고 깨끗한 에너지원 (깨끗하게 만들기)" }
    ],
    items: [
      { t: "💡 백열전구를 LED 전구로 바꾼다", a: "e", why: "같은 밝기를 훨씬 적은 전력으로 냅니다." },
      { t: "🚗 하이브리드 자동차 — 브레이크를 밟을 때 버려지던 운동 에너지로 배터리를 충전한다", a: "e", why: "버려지던 에너지를 다시 쓰므로 효율이 높아집니다.", hint: "새 에너지원일까요, 버려지던 에너지를 되살리는 걸까요?" },
      { t: "🏠 단열재와 이중창으로 새는 열을 막는 집(패시브 하우스)", a: "e", why: "냉난방에 드는 에너지를 줄입니다." },
      { t: "🏭 열병합 발전 — 발전소의 폐열로 지역난방을 한다", a: "e", why: "장면 2에서 버려지던 폐열을 쓸모 있게 씁니다.", hint: "발전소에서 가장 큰 손실은 무엇이었나요?" },
      { t: "🏷️ 에너지 소비 효율 1등급 가전제품을 고른다", a: "e", why: "에너지 소비 효율 등급은 효율이 높은 제품을 고르도록 돕는 제도입니다." },
      { t: "☀️ 지붕에 태양 전지를 설치한다", a: "r", why: "태양의 빛에너지를 이용하는 재생 에너지입니다." },
      { t: "💨 바다 위에 풍력 발전 단지를 세운다", a: "r", why: "바람의 운동 에너지를 이용하는 재생 에너지입니다." },
      { t: "🔋 수소와 산소의 반응으로 전기를 만드는 연료 전지", a: "r", why: "연료 전지는 신에너지입니다. 생성물이 물뿐이라 오염 물질이 거의 없습니다.", hint: "‘신재생’은 신에너지 + 재생 에너지입니다." },
      { t: "🌾 음식물 쓰레기·가축 분뇨에서 나온 가스로 발전한다(바이오 에너지)", a: "r", why: "생물 자원에서 얻는 재생 에너지입니다." },
      { t: "🌊 밀물과 썰물의 흐름으로 터빈을 돌린다(조력 발전)", a: "r", why: "고갈되지 않는 재생 에너지입니다. 우리나라에는 시화호 조력 발전소가 있습니다." }
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학2 Ⅱ-2] 이야기 ③ 사라진 98",
    items: [
      { id: "w1", label: "에너지는 어디로 갔나", hint: "고른 기기 하나에서 들어간 에너지가 어떤 형태로 얼마씩 나뉘는지 쓰세요.", ph: "들어간 에너지: … → 쓸모 있는 …%, 버려지는 …%" },
      { id: "c1", label: "공모 신청서: 우리 마을 설계를 소개합니다", hint: "내가 정한 전원 구성을 적고, 신재생 에너지만으로는 왜 부족했는지, 그 약점을 어떻게 메웠는지 ‘지속가능한 발전’이라는 말을 넣어 설명하세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학2 Ⅱ-2] 에너지 전환과 활용 — 정리",
  recap: [
    { key: "r1", label: "① 태양은 석탄 덩어리일까" },
    { key: "r2", label: "② 불 꺼진 섬" },
    { key: "r3", label: "③ 사라진 98" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "태양의 핵융합, 섬의 발전기, 새어 나간 98. 세 이야기에 공통으로 들어 있는 생각을 ‘전환’과 ‘효율’이라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is2-2-2", unitLabel: "[통합과학2 Ⅱ-2] 에너지 전환과 활용",
  rows: [
    { key: "r1", label: "① 태양은 석탄 덩어리일까" },
    { key: "r2", label: "② 불 꺼진 섬" },
    { key: "r3", label: "③ 사라진 98" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
