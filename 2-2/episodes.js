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

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;
function track(ctx, x, y, w, h, r) { ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 6 : r); ctx.fill(); }
function gbar(ctx, x, y, w, h, c0, c1, r, blur) {          // 빛나는 그라데이션 막대
  if (!(w > 0.5)) return;
  var g = ctx.createLinearGradient(x, y, x + w, y); g.addColorStop(0, c0); g.addColorStop(1, c1 || c0);
  ctx.save(); ctx.shadowColor = c1 || c0; ctx.shadowBlur = blur == null ? 10 : blur; ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r == null ? 6 : r, w / 2, h / 2)); ctx.fill(); ctx.restore();
  var s = ctx.createLinearGradient(0, y, 0, y + h); s.addColorStop(0, "rgba(255,255,255,.28)"); s.addColorStop(.5, "rgba(255,255,255,0)");
  ctx.fillStyle = s; ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.min(r == null ? 6 : r, w / 2, h / 2)); ctx.fill();
}
function glass(ctx, x, y, w, h, line, r) {                 // 반투명 유리 판
  var g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, "rgba(255,255,255,.11)"); g.addColorStop(1, "rgba(255,255,255,.03)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 10 : r); ctx.fill();
  ctx.strokeStyle = line || "rgba(200,210,255,.25)"; ctx.lineWidth = 1.2; ctx.stroke();
}
function metal(ctx, x, y, w, h, c0, c1, r, vert) {        // 금속·자석 재질
  var g = vert ? ctx.createLinearGradient(x, y, x + w, y) : ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c1); g.addColorStop(.3, c0); g.addColorStop(.55, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 6 : r); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1; ctx.stroke();
}
function flowDots(ctx, pts, phase, n, col, r) {            // 경로를 따라 흐르는 빛 알갱이
  var L = [0], i;
  for (i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  var tot = L[L.length - 1]; if (!tot) return;
  for (var k = 0; k < n; k++) {
    var d = ((k / n + phase) % 1 + 1) % 1 * tot, j = 1;
    while (j < L.length - 1 && L[j] < d) j++;
    var u = (d - L[j - 1]) / ((L[j] - L[j - 1]) || 1);
    K.glow(ctx, pts[j - 1].x + (pts[j].x - pts[j - 1].x) * u, pts[j - 1].y + (pts[j].y - pts[j - 1].y) * u, r || 2, col, 3.2);
  }
}
function playBtn(id, get, set, on, off) {                  // ⏸ 멈추기 단추
  var b = $(id); if (!b) return;
  function paint() { b.textContent = get() ? on : off; }
  b.addEventListener("click", function () { set(!get()); paint(); });
  paint();
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
      ctx.clearRect(0, 0, W, H);
      var e = Math.pow(10, x), y = lifeYears(e);
      K.stage(ctx, 0, 0, W, H, "space", { seed: 21, title: "연료 1 kg이 내는 에너지 → 태양이 빛날 수 있는 시간" });
      var x0 = 70, x1 = 840, ay = 122;
      function AX(k) { return x0 + (k - 7) / 8 * (x1 - x0); }
      /* 반응 종류 띠 */
      ctx.fillStyle = "rgba(255,179,92,.10)"; ctx.beginPath(); ctx.roundRect(AX(7) - 8, ay - 16, AX(8.7) - AX(7) + 16, 32, 8); ctx.fill();
      K.t(ctx, "화학 반응(연소)", AX(7) - 4, ay + 46, { s: 10.5, c: KC.orange });
      if (okB) {
        ctx.fillStyle = "rgba(182,156,255,.12)"; ctx.beginPath(); ctx.roundRect(AX(13.6) - 8, ay - 16, AX(15) - AX(13.6) + 16, 32, 8); ctx.fill();
        K.t(ctx, "원자핵 반응", AX(15) + 4, ay + 46, { s: 10.5, a: "right", c: KC.violet });
      }
      /* 눈금자(10배씩) */
      var ag = ctx.createLinearGradient(x0, 0, x1, 0); ag.addColorStop(0, "rgba(255,179,92,.8)"); ag.addColorStop(1, "rgba(182,156,255,.9)");
      ctx.save(); ctx.shadowColor = "rgba(160,170,255,.6)"; ctx.shadowBlur = 6; ctx.strokeStyle = ag; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5;
      for (var k = 7; k <= 15; k++) {
        var gx = AX(k);
        ctx.beginPath(); ctx.moveTo(gx, ay - 6); ctx.lineTo(gx, ay + 6); ctx.stroke();
        K.t(ctx, "10" + sup(k), gx, ay + 25, { s: 11, c: KC.mute, a: "center" });
      }
      FUELS.concat(okB ? NUKE : []).forEach(function (f) {
        var fx = AX(f.x), nuke = f.x > 12;
        K.glow(ctx, fx, ay, 4, nuke ? "rgba(182,156,255,.95)" : "rgba(255,179,92,.95)", 3.4);
        K.pill(ctx, f.n, fx, f.up ? ay - 40 : ay - 20, { s: 11, a: "center", c: nuke ? KC.violet : KC.orange });
      });
      /* 지금 고른 연료 */
      var px = AX(x);
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 12; ctx.fillStyle = KC.blue;
      ctx.beginPath(); ctx.moveTo(px, ay - 3); ctx.lineTo(px - 8, ay - 52); ctx.lineTo(px + 8, ay - 52); ctx.closePath(); ctx.fill(); ctx.restore();
      K.pill(ctx, "1 kg에 " + sci(e) + " J", px, ay - 62, { s: 13, a: "center", c: KC.blue });

      /* 수명 막대 (로그 눈금 10³~10¹¹ 년) */
      var by = 196, bh = 26;
      K.t(ctx, "이 연료로 태양이 빛날 수 있는 시간 (눈금은 100배씩)", x0, by - 12, { s: 12, c: KC.ink });
      track(ctx, x0, by, x1 - x0, bh, 13);
      var t = clamp((Math.log(y) / Math.LN10 - 3) / 8, 0.01, 1), ok = y >= 4.6e9;
      gbar(ctx, x0, by, (x1 - x0) * t, bh, ok ? "#1f8f6a" : "#a8324a", ok ? KC.green : KC.red, 13);
      K.sun(ctx, x0 + (x1 - x0) * t, by + bh / 2, 8);
      var ex = x0 + (Math.log(4.6e9) / Math.LN10 - 3) / 8 * (x1 - x0);
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(ex, by - 10); ctx.lineTo(ex, by + bh + 8); ctx.stroke(); ctx.setLineDash([]);
      K.pill(ctx, "지구의 나이 46억 년", ex, by + bh + 26, { s: 11, a: "center", c: KC.yellow });
      [3, 5, 7, 9, 11].forEach(function (k) { K.t(ctx, ["천 년", "10만 년", "천만 년", "10억 년", "천억 년"][(k - 3) / 2], x0 + (k - 3) / 8 * (x1 - x0), by + bh + 50, { s: 10.5, c: KC.dim, a: k === 3 ? "left" : (k === 11 ? "right" : "center") }); });
      K.pill(ctx, years(y), x0 + 14, by + 18, { s: 12.5, c: "#ffffff", bg: "rgba(5,8,26,.55)" });
      $("a-fuel-read").innerHTML = "<span class='k'>연료 1 kg</span><span class='v y'>" + sci(e) + " J</span>" +
        "<span class='k'>태양의 수명</span><span class='v b'>" + years(y) + "</span>" +
        "<span class='sub'>= 태양 질량 × 연료 1 kg의 에너지 ÷ 1초에 내보내는 에너지</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "지구의 나이 46억 년을 넘깁니다" : "46억 년에 못 미칩니다") + "</span>";

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
    var ph = 0.72, playing = !REDUCE;
    function nucleus(cx, cy, r, c0, c1, label) {
      K.planet(ctx, cx, cy, r, c0, c1);
      if (label) K.t(ctx, label, cx, cy + 4, { s: r > 20 ? 13 : 11, w: "900", c: "#ffffff", a: "center" });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 446, he = { x: 285, y: 105 }, HS = [[70, 80], [120, 80], [70, 130], [120, 130]];
      /* ── 왼쪽: 반응과 질량 ── */
      K.stage(ctx, 0, 0, LW, H, "space", { seed: 5, title: "태양 중심부 · 수소 핵융합" });
      var core = ctx.createRadialGradient(180, 108, 10, 180, 108, 190);
      core.addColorStop(0, "rgba(255,170,60,.22)"); core.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = core; ctx.fillRect(0, 0, LW, H);
      K.t(ctx, "중심부 온도 약 1,500만 ℃", LW - 16, 30, { s: 11, a: "right", c: KC.orange });
      HS.forEach(function (p) { nucleus(p[0], p[1], 18, "#ff8f7e", "#6e1424", "H"); });
      K.arrow(ctx, { x: 150, y: 105 }, { x: 236, y: 105 }, KC.ink, 2.5, 11);
      /* 움직이는 원자핵 → 합쳐지는 순간 → 빛 */
      if (ph < 0.55) {
        var u = ph / 0.55, ee = u * u * (3 - 2 * u);
        HS.forEach(function (p) { K.glow(ctx, lerp(p[0], he.x, ee), lerp(p[1], he.y, ee), 3.2, "rgba(255,143,126,.95)", 3.2); });
      }
      var fl = ph > 0.5 && ph < 0.8 ? 1 - Math.abs(ph - 0.6) / 0.2 : 0;
      if (fl > 0) { ctx.save(); ctx.globalAlpha = clamp(fl, 0, 1); K.glow(ctx, he.x, he.y, 26, "rgba(255,236,170,.95)", 3); ctx.restore(); }
      nucleus(he.x, he.y, 28, "#c8b4ff", "#2f1d6b", "He");
      if (ph > 0.55) {
        var rr = (ph - 0.55) / 0.45;
        [-0.9, -0.2, 0.5].forEach(function (a) {
          var d0 = 34 + rr * 70, x0 = he.x + Math.cos(a) * d0, y0 = he.y + Math.sin(a) * d0;
          ctx.save(); ctx.globalAlpha = 1 - rr * 0.7; K.glow(ctx, x0, y0, 3, "rgba(255,224,130,.95)", 3.4); ctx.restore();
        });
      }
      K.pill(ctx, "+ 에너지 (빛·열)", 328, 110, { s: 13, c: KC.yellow, box: [0, LW] });
      K.pill(ctx, "수소 원자핵 4개", 95, 168, { s: 11, a: "center", c: "#ffb3a6" });
      K.pill(ctx, "헬륨 원자핵 1개", he.x, 156, { s: 11, a: "center", c: KC.violet });
      var bx = 30, bw = 380, gapX = bx + bw * 4.0015 / 4.0292;
      K.t(ctx, "수소 원자핵 4개의 질량  4.0292", bx, 198, { s: 11.5, w: "800", c: "#ffb3a6" });
      gbar(ctx, bx, 206, bw, 18, "#a8324a", "#ff8f7e", 5, 6);
      K.t(ctx, "헬륨 원자핵 1개의 질량  4.0015", bx, 246, { s: 11.5, w: "800", c: KC.violet });
      gbar(ctx, bx, 254, gapX - bx, 18, "#4b2fa0", "#b69cff", 5, 6);
      ctx.save(); ctx.shadowColor = KC.yellow; ctx.shadowBlur = 10; ctx.strokeStyle = KC.yellow; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
      ctx.strokeRect(gapX, 252, Math.max(3, bw * 0.0277 / 4.0292), 22); ctx.restore();
      K.glow(ctx, gapX + 1.5, 263, 2.5, "rgba(255,224,130,.95)", 4);
      K.pill(ctx, "↑ 줄어든 질량 0.0277 (약 0.7%) → 에너지로", bx + bw + 4, 300, { s: 11.5, a: "right", c: KC.yellow, box: [0, LW] });
      K.t(ctx, "(막대 끝의 점선 칸이 0.7%입니다)", bx + bw, 324, { s: 10.5, c: KC.mute, a: "right" });

      /* ── 오른쪽: 태양과 지구 ── */
      var RX = LW + 8, RW = W - RX, P = fusionPower(m), maxP = 7.6e26, ratio = P / 3.8e26;
      K.stage(ctx, RX, 0, RW, H, "space", { seed: 9, title: "태양이 1초에 내보내는 에너지" });
      var ok = P >= 3.724e26 && P <= 3.876e26, sun = { x: RX + 86, y: 170 }, ea = { x: W - 74, y: 170 };
      var sr = 6 + 10 * clamp(ratio, 0, 2.2);
      if (P > 0) {
        flowDots(ctx, [{ x: sun.x + sr + 8, y: sun.y }, { x: ea.x - 24, y: ea.y }], ph * 2, Math.round(3 + 7 * clamp(ratio, 0, 2)), "rgba(255,224,130,.95)", 2.2);
        K.sun(ctx, sun.x, sun.y, sr);
      } else { ctx.fillStyle = "#2a1c10"; ctx.beginPath(); ctx.arc(sun.x, sun.y, 10, 0, 6.2832); ctx.fill(); }
      K.earth(ctx, ea.x, ea.y, 18);
      if (!ok && P < 3.724e26) { ctx.fillStyle = "rgba(235,248,255," + clamp((1 - ratio) * 0.8, 0.15, 0.75) + ")"; ctx.beginPath(); ctx.arc(ea.x, ea.y, 18, 0, 6.2832); ctx.fill(); }
      if (!ok && P > 3.876e26) { K.glow(ctx, ea.x, ea.y, 18, "rgba(255,90,60," + clamp((ratio - 1) * 0.6, 0.2, 0.7) + ")", 1.8); }
      K.pill(ctx, "태양", sun.x, 222, { s: 11, a: "center", c: KC.yellow });
      K.pill(ctx, "지구", ea.x, 222, { s: 11, a: "center", c: KC.blue });
      K.t(ctx, "Δm = 0.7% × " + m.toFixed(1) + "억 톤 = " + Math.round(m * 70).toLocaleString() + "만 톤", RX + 18, 62, { s: 11.5, c: KC.mute });
      K.pill(ctx, "E = Δm × c² = " + sci(P, 2) + " J", RX + 18, 92, { s: 14, c: KC.yellow });
      var gx = RX + 24, gw = RW - 48, gy = 240;
      track(ctx, gx, gy, gw, 18, 9);
      var t0 = 3.724e26 / maxP, t1 = 3.876e26 / maxP;
      ctx.fillStyle = "rgba(63,211,163,.35)"; ctx.fillRect(gx + gw * t0 - 3, gy - 6, gw * (t1 - t0) + 6, 30);
      gbar(ctx, gx, gy + 3, clamp(P / maxP, 0.005, 1) * gw, 12, ok ? "#1f8f6a" : "#b5671f", ok ? KC.green : KC.orange, 6);
      K.pill(ctx, "실제 태양 3.8×10²⁶ J", gx + gw * 0.5, gy + 42, { s: 11, a: "center", c: KC.green });
      var mood = ok ? "🌍 지금의 지구" : (P < 3.724e26 ? "🧊 햇빛이 모자라 지구가 식어 갑니다" : "🔥 햇빛이 넘쳐 지구가 뜨거워집니다");
      K.pill(ctx, mood, RX + 18, 306, { s: 13, c: ok ? KC.green : (P < 3.724e26 ? KC.blue : KC.red) });
      if (m > 0) K.t(ctx, "중심부 수소(태양의 약 10%)를 다 쓰는 데 " + years(M_SUN * 0.1 / (m * 1e11) / YEAR), RX + 18, 330, { s: 11, c: KC.mute });
      $("a-fus-read").innerHTML = "<span class='k'>사라지는 질량</span><span class='v y'>Δm = " + Math.round(m * 70).toLocaleString() + "만 톤/초</span>" +
        "<span class='k'>나오는 에너지</span><span class='v b'>" + sci(P, 2) + " J/초</span>" +
        "<span class='sub'>E = Δm × c² (c = 3.0×10⁸ m/s)</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "실제 태양(3.8×10²⁶ J)과 일치" : (P < 3.724e26 ? "실제 태양보다 어둡니다" : "실제 태양보다 밝습니다")) + "</span>";

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
    playBtn("a-fus-play", function () { return playing; }, function (x) { playing = x; }, "⏸ 핵융합 멈추기", "▶ 핵융합 보기");
    K.animate(canvas, function (dt) { if (playing) { ph = (ph + dt / 3200) % 1; draw(); } });
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
      var ph = 0, playing = !REDUCE;
      var rows = [
        { y: 46, c: KC.red, d: "#7a1f33", t: "🌡️ 대기와 지표를 데운다", e: "열에너지", to: "결국 지구 복사로 우주에 방출" },
        { y: 102, c: KC.blue, d: "#123d6e", t: "💨 바람·해류·파도를 일으킨다", e: "운동 에너지", to: "풍력·파력 발전" },
        { y: 158, c: "#6fe3d6", d: "#0f4c4a", t: "💧 물을 증발시켜 비와 눈으로 (물의 순환)", e: "위치 에너지", to: "수력 발전" },
        { y: 214, c: KC.green, d: "#124a33", t: "🌱 광합성 — 도달한 빛의 0.1%도 안 됨", e: "화학 에너지", to: "먹이(양분) · 장작 · 화석 연료" }
      ];
      function draw() {
        ctx.clearRect(0, 0, W, H);
        K.stage(ctx, 0, 0, W, H, "space", { seed: 13, title: "지구에 온 햇빛은 어디로 갈까" });
        var sun = { x: 64, y: 150 }, ea = { x: 252, y: 150 };
        /* 햇빛 띠 */
        var bg = ctx.createLinearGradient(sun.x, 0, ea.x, 0); bg.addColorStop(0, "rgba(255,211,107,.55)"); bg.addColorStop(1, "rgba(255,211,107,.12)");
        ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(sun.x + 14, sun.y - 22); ctx.lineTo(ea.x - 20, ea.y - 16); ctx.lineTo(ea.x - 20, ea.y + 16); ctx.lineTo(sun.x + 14, sun.y + 22); ctx.closePath(); ctx.fill();
        flowDots(ctx, [{ x: sun.x + 24, y: sun.y }, { x: ea.x - 26, y: ea.y }], ph, 6, "rgba(255,230,150,.95)", 2.2);
        K.sun(ctx, sun.x, sun.y, 22);
        K.pill(ctx, "태양 · 수소 핵융합", sun.x, 206, { s: 11, a: "center", c: KC.yellow });
        K.pill(ctx, "태양 복사 에너지 100", 156, 112, { s: 11.5, a: "center", c: KC.yellow });
        /* 반사 */
        K.arrow(ctx, { x: ea.x - 4, y: ea.y - 30 }, { x: ea.x + 30, y: 80 }, "rgba(200,210,255,.85)", 2.5, 10);
        flowDots(ctx, [{ x: ea.x - 4, y: ea.y - 30 }, { x: ea.x + 30, y: 80 }], ph * 1.3, 2, "rgba(220,230,255,.9)", 1.8);
        K.pill(ctx, "반사 약 30 → 우주로", ea.x + 18, 68, { s: 11.5, a: "right", c: KC.mute });
        /* 지구와 대기 */
        K.glow(ctx, ea.x, ea.y, 26, "rgba(120,190,255,.35)", 1.5);
        K.earth(ctx, ea.x, ea.y, 26);
        K.pill(ctx, "지구 · 흡수 약 70", ea.x, 206, { s: 11.5, a: "center", c: KC.blue });
        rows.forEach(function (r, i) {
          var cy = r.y + 23, a = { x: ea.x + 28, y: ea.y + (i - 1.5) * 10 }, b = { x: 350, y: cy };
          K.arrow(ctx, a, b, r.c, 2.2, 9);
          flowDots(ctx, [a, b], ph + i * 0.17, 2, r.c, 1.8);
          var g = ctx.createLinearGradient(356, 0, 656, 0); g.addColorStop(0, r.d); g.addColorStop(1, "rgba(20,26,60,.55)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(356, r.y, 300, 46, 10); ctx.fill();
          ctx.strokeStyle = r.c; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.fillStyle = r.c; ctx.beginPath(); ctx.roundRect(356, r.y, 5, 46, [10, 0, 0, 10]); ctx.fill();
          K.t(ctx, r.t, 370, r.y + 19, { s: 11.5, w: "800", c: "#ffffff" });
          K.t(ctx, "→ " + r.e, 370, r.y + 37, { s: 11, w: "800", c: r.c });
          K.arrow(ctx, { x: 662, y: cy }, { x: 690, y: cy }, r.c, 2, 8);
          K.pill(ctx, r.to, 698, cy + 5, { s: 11, c: KC.ink });
        });
        K.t(ctx, "에너지는 형태를 바꾸며 흐르다가 마지막에는 열이 되어 우주로 빠져나갑니다.", 22, H - 14, { s: 11, c: KC.mute });
        K.warn(ctx, W - 16, H - 14, "⚠ 크기·거리는 실제 비율이 아님", "right");
      }
      canvas._redraw = draw; draw();
      playBtn("a-flow-play", function () { return playing; }, function (x) { playing = x; }, "⏸ 흐름 멈추기", "▶ 흐름 보기");
      K.animate(canvas, function (dt) { if (playing) { ph = (ph + dt / 2600) % 1; draw(); } });
    })();

    function check() {
      if (sorted) done("m1-4a"); if (chained) done("m1-4b");
      if (sorted && chained) {
        window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>바람도, 댐의 물도, 밥도, 석탄도 거슬러 올라가면 <b>태양</b>입니다. 그리고 화석 연료 1 J 에는 햇빛 약 20만 J과 수억 년의 시간이 들어 있습니다. 단, 지열·조력·핵에너지의 근원은 태양이 아닙니다.");
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
        { t: "🌊 서핑하는 파도", a: "k", why: "파도는 대부분 바람이 일으킵니다. 바람의 근원이 태양입니다.", hint: "파도를 일으키는 것은 무엇인가요?" },
        { t: "🏞️ 댐에 고인 물", a: "p", why: "태양 에너지로 증발한 물이 높은 곳에 비로 내려 위치 에너지를 갖습니다." },
        { t: "🍚 밥 한 공기", a: "c", why: "벼가 광합성으로 저장한 화학 에너지입니다." },
        { t: "🪨 석탄", a: "c", why: "수억 년 전 식물이 광합성으로 저장한 에너지입니다.", hint: "석탄은 무엇이 묻혀서 만들어졌나요?" },
        { t: "🛢️ 석유·천연가스", a: "c", why: "옛 바다 생물(플랑크톤)의 유해입니다. 그 에너지도 광합성에서 왔습니다." },
        { t: "🌋 지열 발전", a: "x", why: "지구 내부의 열(방사성 원소의 붕괴열 등)이 근원입니다.", hint: "땅속의 열은 햇빛이 데운 것이 아닙니다." },
        { t: "🌗 조력 발전(밀물과 썰물)", a: "x", why: "밀물과 썰물은 주로 달의 인력 때문에 생깁니다.", hint: "밀물과 썰물은 왜 생기나요?" },
        { t: "☢️ 원자력 발전의 우라늄", a: "x", why: "우라늄 원자핵에 저장된 핵에너지입니다. 태양보다 먼저 있던 별들이 만든 원소입니다." }
      ],
      onDone: function () { sorted = true; window.sthState("flowSort", 1); check(); }
    });

    /* (나) 직렬 전환 계산기 — 기존 화면을 로그 눈금으로 고쳤다 */
    (function () {
      var canvas = $("c-a-chain"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
      var a = 30, b = 2, c = 0.1;
      function draw() {
        ctx.clearRect(0, 0, W, H);
        K.stage(ctx, 0, 0, W, H, "lab", { seed: 4 });
        var s1 = a, s2 = s1 * b / 100, s3 = s2 * c / 100;
        var st = [{ n: "대기 밖 햇빛", p: 100, c0: "#8a6a12", c: KC.yellow }, { n: "지표에 도달", p: s1, c0: "#8a3f12", c: KC.orange, m: "× " + a + "%" },
          { n: "광합성으로 저장 (화학 에너지)", p: s2, c0: "#11573f", c: KC.green, m: "× " + b.toFixed(1) + "%" }, { n: "화석 연료로 보존", p: s3, c0: "#3d2a80", c: KC.violet, m: "× " + c.toFixed(2) + "%" }];
        var x0 = 34, full = 560;
        ctx.strokeStyle = "rgba(200,210,255,.10)"; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        for (var k = -6; k <= 2; k++) { var lx = x0 + full * (k + 6) / 8; ctx.beginPath(); ctx.moveTo(lx, 10); ctx.lineTo(lx, 196); ctx.stroke(); }
        ctx.setLineDash([]);
        st.forEach(function (s, i) {
          var y = 16 + i * 46, w = Math.max(6, full * (Math.log(s.p) / Math.LN10 + 6) / 8);
          track(ctx, x0, y, full, 28, 8);
          gbar(ctx, x0, y, w, 28, s.c0, s.c, 8);
          if (i) K.arrow(ctx, { x: 18, y: y - 14 }, { x: 18, y: y + 8 }, s.c, 2, 7);
          K.t(ctx, s.n, x0 + w + 10, y + 12, { s: 11.5, w: "800", c: "#ffffff" });
          K.t(ctx, (s.p >= 0.1 ? s.p.toFixed(1) : (s.p >= 0.001 ? s.p.toFixed(4) : s.p.toFixed(6))) + " %", x0 + w + 10, y + 27, { s: 11, w: "800", c: s.c });
          if (s.m) K.pill(ctx, s.m, W - 20, y + 19, { s: 12, a: "right", c: s.c });
        });
        K.t(ctx, "막대는 로그 눈금 (점선 한 칸이 10배)", W - 20, H - 8, { s: 10.5, c: KC.mute, a: "right" });
        var need = 100 / s3, ok = need >= 190000 && need <= 210000;
        $("a-ch-read").innerHTML = "<span class='k'>남는 비율</span><span class='v g'>" + s3.toFixed(6) + "%</span>" +
          "<span class='k'>화석 연료 1 J에</span><span class='v y'>햇빛 약 " + (Math.round(need / 1000) * 1000).toLocaleString() + " J</span>" +
          "<span class='sub'>100 × " + a + "% × " + b.toFixed(1) + "% × " + c.toFixed(2) + "%</span>" +
          "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "조사한 값(약 20만 J)과 일치" : "조사한 값(약 20만 J)과 다릅니다") + "</span>";
        $("a-ch-info").innerHTML = "100 × " + a + "% × " + b.toFixed(1) + "% × " + c.toFixed(2) + "% = <b>" + s3.toFixed(6) + "%</b>. 화석 연료 1 J이 만들어지려면 햇빛이 <b>약 " + (Math.round(need / 1000) * 1000).toLocaleString() + " J</b> 필요합니다. " +
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
    var got = window.sthState("ind") || { p: false, m: false, z: false }, eph = 0;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 8, title: "패러데이의 실험대 · 코일과 검류계" });
      /* 실험대 */
      var tb = ctx.createLinearGradient(0, 270, 0, H); tb.addColorStop(0, "rgba(120,80,50,.55)"); tb.addColorStop(1, "rgba(60,36,20,.7)");
      ctx.fillStyle = tb; ctx.fillRect(0, 270, W, H - 270);
      var cx0 = 560, cx1 = 760, cy = 190, turns = 6 * N, i;
      var mx = lerp(60, 470, x / 100), mw = 220, mc = mx + mw / 2;
      /* 자기력선 (N → S) */
      ctx.save(); ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
      for (i = 0; i < 3; i++) { ctx.strokeStyle = "rgba(190,170,255," + (0.42 - i * 0.1) + ")"; ctx.beginPath(); ctx.ellipse(mc, cy, mw / 2 + 26 + i * 22, 36 + i * 18, 0, 0, 6.2832); ctx.stroke(); }
      ctx.restore();
      /* 코일 뒷면 */
      ctx.strokeStyle = "#7a4520"; ctx.lineWidth = 3.4;
      for (i = 0; i < turns; i++) { var tx = cx0 + (i + 0.5) / turns * (cx1 - cx0); ctx.beginPath(); ctx.ellipse(tx, cy, 10, 52, 0, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); }
      /* 자석 (금속 재질) */
      metal(ctx, mx, cy - 24, mw / 2, 48, "#4f8cf0", "#16336e", [8, 0, 0, 8]);
      metal(ctx, mc, cy - 24, mw / 2, 48, "#f0606c", "#701822", [0, 8, 8, 0]);
      K.t(ctx, "S", mx + mw / 4, cy + 7, { s: 19, w: "900", c: "#ffffff", a: "center" });
      K.t(ctx, "N", mx + mw * 3 / 4, cy + 7, { s: 19, w: "900", c: "#ffffff", a: "center" });
      /* 코일 앞면 (구리) */
      var cg = ctx.createLinearGradient(0, cy - 52, 0, cy + 52); cg.addColorStop(0, "#ffcf94"); cg.addColorStop(.5, "#d9853f"); cg.addColorStop(1, "#8a4a1c");
      ctx.strokeStyle = cg; ctx.lineWidth = 3.4;
      for (var j = 0; j < turns; j++) { var ux = cx0 + (j + 0.5) / turns * (cx1 - cx0); ctx.beginPath(); ctx.ellipse(ux, cy, 10, 52, 0, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke(); }
      K.pill(ctx, "코일 " + N * 100 + "회 감음", (cx0 + cx1) / 2, 276, { s: 12, a: "center", c: KC.orange });
      /* 검류계와 도선 */
      var gx = 760, gy = 108, R = 66;
      var w1 = [{ x: cx0, y: cy - 52 }, { x: cx0, y: 40 }, { x: gx - 90, y: 40 }], w2 = [{ x: cx1, y: cy - 52 }, { x: cx1 + 60, y: cy - 52 }, { x: cx1 + 60, y: 126 }];
      [w1, w2].forEach(function (wp) { ctx.strokeStyle = "#c9773a"; ctx.lineWidth = 2.6; ctx.beginPath(); wp.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke(); });
      eph += g * 0.0025;
      if (Math.abs(g) >= 0.5) { var nE = Math.round(clamp(Math.abs(g) / 5, 2, 8)); flowDots(ctx, w1, eph, nE, "rgba(127,211,255,.95)", 2); flowDots(ctx, w2, -eph, nE, "rgba(127,211,255,.95)", 2); }
      metal(ctx, gx - 90, 22, 180, 106, "#596480", "#262c40", 14);
      var face = ctx.createRadialGradient(gx, gy - 20, 10, gx, gy, 90); face.addColorStop(0, "#1d2550"); face.addColorStop(1, "#0a0e24");
      ctx.fillStyle = face; ctx.beginPath(); ctx.roundRect(gx - 82, 30, 164, 90, 10); ctx.fill();
      ctx.strokeStyle = "rgba(200,210,255,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(gx, gy, R, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
      [-50, -25, 0, 25, 50].forEach(function (t) {
        var an = -Math.PI / 2 + t / 50 * Math.PI * 0.3;
        ctx.strokeStyle = "rgba(200,210,255,.5)"; ctx.beginPath(); ctx.moveTo(gx + Math.cos(an) * (R - 5), gy + Math.sin(an) * (R - 5)); ctx.lineTo(gx + Math.cos(an) * (R + 4), gy + Math.sin(an) * (R + 4)); ctx.stroke();
        K.t(ctx, t === 0 ? "0" : (t > 0 ? "+" : "−") + Math.abs(t), gx + Math.cos(an) * (R - 16), gy + Math.sin(an) * (R - 16) + 4, { s: 10, c: KC.mute, a: "center" });
      });
      var ang = -Math.PI / 2 + clamp(g, -50, 50) / 50 * Math.PI * 0.3;
      ctx.save(); ctx.shadowColor = KC.red; ctx.shadowBlur = 8; ctx.strokeStyle = KC.red; ctx.lineWidth = 3; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(ang) * (R - 4), gy + Math.sin(ang) * (R - 4)); ctx.stroke(); ctx.restore();
      K.planet(ctx, gx, gy, 5, "#c9d2f0", "#3a4260");
      K.t(ctx, "검류계 " + (g > 0 ? "+" : (g < 0 ? "−" : "")) + Math.abs(Math.round(g)) + "칸", gx, 118, { s: 11.5, w: "900", a: "center", c: Math.abs(g) >= 10 ? KC.yellow : KC.ink });
      K.pill(ctx, "이번 실험의 최대 흔들림 " + Math.round(peak) + "칸", 16, 62, { s: 12, c: KC.yellow });
      K.t(ctx, "코일을 지나는 자기장 " + Math.round(flux(x) * 100) + "%", 16, 92, { s: 11.5, c: KC.mute });
      track(ctx, 16, 100, 170, 8, 4);
      gbar(ctx, 16, 100, 170 * flux(x), 8, "#4b2fa0", KC.violet, 4, 6);
      if (Math.abs(g) >= 0.5) K.pill(ctx, g > 0 ? "전류 → (+) 방향" : "전류 ← (−) 방향", 16, 136, { s: 11, c: KC.blue });
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
    var N = 100, B = 0.2, f = 20, th = 0, tries = window.sthState("genTries") || [], playing = !REDUCE;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var V = genVolt(N, B, f), okV = V >= 210 && V <= 230, okF = f >= 59 && f <= 61;
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 6, title: "발전기 · 자석 사이에서 도는 코일" });
      /* 자석과 자기장 */
      var cx = 150, cy = 172, bs = lerp(.4, 1, (B - 0.1) / 0.9);
      metal(ctx, 22, 92, 52, 160, "#f0606c", "#701822", 8, true);
      metal(ctx, 226, 92, 52, 160, "#4f8cf0", "#16336e", 8, true);
      K.t(ctx, "N", 48, 178, { s: 20, w: "900", c: "#ffffff", a: "center" }); K.t(ctx, "S", 252, 178, { s: 20, w: "900", c: "#ffffff", a: "center" });
      for (var k = 0; k < 5; k++) { var fy = 112 + k * 30; K.arrow(ctx, { x: 78, y: fy }, { x: 222, y: fy }, "rgba(190,170,255," + (0.2 + 0.5 * bs) + ")", 1.2, 7); }
      /* 회전하는 코일 */
      var c = Math.cos(th), hw = 62 * Math.abs(c);
      ctx.strokeStyle = "rgba(200,210,255,.5)"; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx, 72); ctx.lineTo(cx, 268); ctx.stroke(); ctx.setLineDash([]);
      var cg = ctx.createLinearGradient(cx - 62, 0, cx + 62, 0); cg.addColorStop(0, c > 0 ? "#ffcf94" : "#a35a24"); cg.addColorStop(1, c > 0 ? "#b8692c" : "#e9a060");
      ctx.save(); ctx.shadowColor = "rgba(255,170,90,.6)"; ctx.shadowBlur = 6; ctx.strokeStyle = cg; ctx.lineWidth = clamp(N / 60, 2, 7);
      ctx.strokeRect(cx - hw, cy - 56, Math.max(hw * 2, 1), 112); ctx.restore();
      metal(ctx, cx - 16, 262, 32, 8, "#d9b25a", "#6b521c", 3); metal(ctx, cx - 16, 274, 32, 8, "#d9b25a", "#6b521c", 3);
      K.pill(ctx, "🚲 운동 에너지 → ⚡ 전기 에너지", cx, 64, { s: 12, a: "center", c: KC.yellow });
      K.pill(ctx, "코일 " + N + "회 · " + B.toFixed(2) + " T · 1초에 " + f + "회전", cx, 306, { s: 11.5, a: "center", c: KC.orange });
      K.t(ctx, "회전은 실제보다 느리게 보여 줍니다", cx, 332, { s: 10, c: KC.dim, a: "center" });

      /* 파형 (0.05초) */
      K.pill(ctx, "코일에 생기는 전압 (0.05초 동안)", 372, 28, { s: 12, c: KC.violet });
      var g = K.chart(ctx, { x: 318, y: 42, w: 344, h: 270, x0: 0, x1: 0.05, y0: -450, y1: 450, xt: 5, yt: 6, xl: "시간(s)", yl: "전압(V)", xf: function (q) { return q.toFixed(2); } });
      ctx.save(); ctx.strokeStyle = "rgba(63,211,163,.8)"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      [311, -311].forEach(function (q) { ctx.beginPath(); ctx.moveTo(g.L, g.Y(q)); ctx.lineTo(g.R, g.Y(q)); ctx.stroke(); }); ctx.restore();
      K.pill(ctx, "220 V 교류의 최댓값 311 V", g.R - 4, g.Y(311) - 8, { s: 10.5, a: "right", c: KC.green });
      var vp = Math.min(V * Math.SQRT2, 450), pts = [];
      for (var i = 0; i <= 200; i++) { var tt = 0.05 * i / 200; pts.push([tt, vp * Math.sin(2 * Math.PI * f * tt + th)]); }
      K.plot(ctx, g, pts, KC.violet, { w: 2.4 });
      K.pill(ctx, "주파수 " + f + " Hz", g.L, 332, { s: 12, c: okF ? KC.green : KC.ink });

      /* 전압계와 전구 */
      metal(ctx, 690, 46, 194, 96, "#3b4466", "#1a2038", 14);
      ctx.fillStyle = "#071012"; ctx.beginPath(); ctx.roundRect(702, 78, 170, 54, 8); ctx.fill();
      K.t(ctx, "전압(실횻값)", 787, 68, { s: 11, c: KC.mute, a: "center" });
      var dc = okV ? KC.green : (V > 230 ? KC.red : KC.yellow);
      ctx.save(); ctx.shadowColor = dc; ctx.shadowBlur = 12; K.t(ctx, Math.round(V) + " V", 787, 120, { s: 30, w: "900", a: "center", c: dc }); ctx.restore();
      var bx = 787, by = 214, glow = clamp(V / 220, 0, 1.6);
      if (V > 1) K.glow(ctx, bx, by, 12 + 14 * Math.min(glow, 1.4), "rgba(255,214,120," + clamp(glow * 0.55, 0.06, 0.95) + ")", 3);
      var bg = ctx.createRadialGradient(bx - 8, by - 10, 3, bx, by, 26); bg.addColorStop(0, "rgba(255,255,255,.35)"); bg.addColorStop(1, "rgba(200,220,255,.08)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, 24, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = "rgba(220,230,255,.55)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.strokeStyle = glow > 0.05 ? "rgba(255,230,150," + clamp(0.4 + glow * 0.5, 0, 1) + ")" : "rgba(160,140,120,.7)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx - 9, by + 6); ctx.lineTo(bx - 5, by - 6); ctx.lineTo(bx - 1, by + 4); ctx.lineTo(bx + 3, by - 6); ctx.lineTo(bx + 8, by + 6); ctx.stroke();
      metal(ctx, bx - 12, by + 22, 24, 20, "#c9ccd6", "#5b6070", 3);
      if (V > 230) { ctx.save(); ctx.strokeStyle = KC.red; ctx.lineWidth = 2; [[-1, -1], [1, -1], [1.2, .3], [-1.2, .3]].forEach(function (d) { ctx.beginPath(); ctx.moveTo(bx + d[0] * 32, by + d[1] * 32); ctx.lineTo(bx + d[0] * 44, by + d[1] * 44); ctx.stroke(); }); ctx.restore(); }
      K.pill(ctx, V > 230 ? "💥 과전압!" : (V < 210 ? "전등이 희미합니다" : "딱 알맞은 밝기"), bx, 296, { s: 12, a: "center", c: V > 230 ? KC.red : (okV ? KC.green : KC.mute) });
      $("b-gen-read").innerHTML = "<span class='k'>전압</span><span class='v y'>" + Math.round(V) + " V</span>" +
        "<span class='k'>주파수</span><span class='v b'>" + f + " Hz</span>" +
        "<span class='sub'>V = N × B × A × 2πf ÷ √2 (A ≈ 206 cm²)</span>" +
        "<span class='ok " + (okV && okF ? "g" : "r") + "'>" + (okV && okF ? "두 조건을 모두 만족 · 송전해 보세요" : (okV ? "전압은 맞음 · 주파수는 59~61 Hz" : (okF ? "주파수는 맞음 · 전압은 210~230 V" : "목표: 210~230 V, 59~61 Hz"))) + "</span>";
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
      var why = !okV ? (V < 210 ? "전압이 낮아 전등이 희미하고 냉장고가 돌지 않음" : "전압이 높아 가전제품이 타 버림") : "주파수가 60 Hz가 아니라 모터와 시계가 제 속도로 돌지 않음";
      tries.push({ N: N, B: B.toFixed(2), f: f, V: Math.round(V), ok: ok, why: why });
      window.sthState("genTries", tries.slice(-8)); report();
      if (ok) {
        window.sthState("genBest", "코일 " + N + "회 · " + B.toFixed(2) + " T · 1초에 " + f + "회전 → " + Math.round(V) + " V");
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>코일 " + N + "회, 자석 " + B.toFixed(2) + " T, 1초에 " + f + "회전으로 <b>" + Math.round(V) + " V · " + f + " Hz</b>를 만들었습니다. 회전수는 60으로 묶여 있으니 전압은 <b>감은 수 × 자석 세기</b>로 맞춰야 했습니다. 다른 조합도 찾아보세요.");
        ep.clear(2);
      }
    });
    canvas._redraw = draw;
    playBtn("b-gen-play", function () { return playing; }, function (x) { playing = x; }, "⏸ 회전 멈추기", "▶ 회전 보기");
    K.animate(canvas, function (dt) { if (playing && f > 0) { th += f / 60 * 0.45 * dt / 70; draw(); } });
    draw(); report();
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
    var ph = 0, rot = 0, playing = !REDUCE;
    function ecol(s) {                                   // 에너지 형태마다 색
      if (s.indexOf("전기") >= 0) return [KC.violet, "#2f1d6b"];
      if (s.indexOf("핵") >= 0) return ["#c6f06b", "#3a5214"];
      if (s.indexOf("화학") >= 0) return [KC.orange, "#6b3410"];
      if (s.indexOf("위치") >= 0) return ["#6fe3d6", "#0f4c4a"];
      if (s.indexOf("운동") >= 0) return [KC.blue, "#123d6e"];
      if (s.indexOf("빛") >= 0) return [KC.yellow, "#6b5210"];
      return [KC.red, "#6e1a2c"];
    }
    function turbine(x, y, r, col) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      for (var b = 0; b < 3; b++) { ctx.rotate(Math.PI * 2 / 3); ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, -r * 0.55, r * 0.22, r * 0.55, 0, 0, 6.2832); ctx.fill(); }
      ctx.restore(); K.planet(ctx, x, y, r * 0.22, "#dfe6ff", "#4a5270");
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 12, title: PLANTS[sel].icon + " " + PLANTS[sel].name + "의 에너지 전환" });
      var p = PLANTS[sel], n = p.chain.length, bw = 170, gap = (860 - n * bw) / Math.max(1, n - 1);
      if (n === 2) gap = 200;
      var sx = n === 2 ? 180 : 20, cy = 84;
      p.chain.forEach(function (c, i) {
        var bx = sx + i * (bw + gap), last = i === n - 1, cc = ecol(c);
        var g = ctx.createLinearGradient(bx, 50, bx, 118); g.addColorStop(0, cc[1]); g.addColorStop(1, "rgba(14,20,48,.85)");
        ctx.save(); if (last) { ctx.shadowColor = cc[0]; ctx.shadowBlur = 16; }
        ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(bx, 50, bw, 68, 12); ctx.fill(); ctx.restore();
        ctx.strokeStyle = cc[0]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(bx, 50, bw, 68, 12); ctx.stroke();
        c.split("\n").forEach(function (ln, k) { K.t(ctx, ln, bx + bw / 2, 80 + k * 18, { s: 12, w: "800", a: "center", c: k ? cc[0] : "#ffffff" }); });
        if (c.indexOf("터빈") >= 0) turbine(bx + bw - 16, 66, 13, "rgba(127,211,255,.85)");
        if (!last) {
          var a = { x: bx + bw + 6, y: cy }, b = { x: bx + bw + gap - 6, y: cy };
          K.arrow(ctx, a, b, cc[0], 2.6, 10);
          flowDots(ctx, [a, { x: b.x - 10, y: b.y }], ph + i * 0.3, 2, cc[0], 2);
        }
      });
      K.pill(ctx, "섬의 1년(1,000만 kWh): CO₂ 약 " + (p.co2 * 10).toLocaleString() + "톤 배출 · 넣은 에너지 100 중 전기로 " + p.eff, 20, 148, { s: 12, c: KC.yellow });
      /* 비교 막대 */
      var x0 = 170, x1 = 820, maxV = mode === "eff" ? 100 : 900;
      K.t(ctx, mode === "eff" ? "발전 효율 (%)" : "전기 1 kWh를 만들 때 나오는 CO₂ (g) — 건설·연료 채굴 포함", 20, 186, { s: 12.5, w: "800", c: KC.ink });
      PLANTS.forEach(function (q, i) {
        var y = 198 + i * 35, val = mode === "eff" ? q.eff : q.co2, bwid = Math.max(4, (x1 - x0) * val / maxV), on = i === sel;
        K.t(ctx, q.icon + " " + q.name, x0 - 12, y + 18, { s: 12, w: on ? "900" : "600", a: "right", c: on ? "#ffffff" : KC.mute });
        track(ctx, x0, y, x1 - x0, 25, 7);
        if (mode === "eff") gbar(ctx, x0, y, bwid, 25, on ? "#8a3f12" : "#0f4c4a", on ? KC.orange : "#6fe3d6", 7, on ? 14 : 6);
        else gbar(ctx, x0, y, bwid, 25, on ? "#8a3f12" : "#5a1a2c", on ? KC.orange : KC.red, 7, on ? 14 : 6);
        K.t(ctx, val + (mode === "eff" ? " %" : " g"), x0 + bwid + 8, y + 18, { s: 12, w: "800", c: on ? KC.orange : KC.ink });
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
      why: ["그래프의 숫자로 직접 나눠 보세요. 820 ÷ 12는?", "820 ÷ 12 ≈ 68, 약 70배입니다. 화석 연료는 <b>태우는 과정 자체</b>에서 이산화 탄소가 나오기 때문입니다.", "820 ÷ 12를 다시 계산해 보세요.", "CO₂ 비교 그래프로 바꿔 막대 길이를 비교해 보세요."],
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
    playBtn("b-src-play", function () { return playing; }, function (x) { playing = x; }, "⏸ 흐름 멈추기", "▶ 흐름 보기");
    K.animate(canvas, function (dt) { if (playing) { ph = (ph + dt / 1800) % 1; rot += dt / 260; draw(); } });
    draw(); check();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* 장면 5 — 온실 기체(기존 예측 잠금) + 발전소의 영향 + 결말 */
  var ghgPicked = false, sorted5 = !!window.sthState("b5sorted");
  function reveal() {
    $("b-end").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉢") === 0 ? " — 정확했습니다. 검류계로 직접 확인했습니다." : " — 실험해 보니 자석이 가만히 있으면 바늘은 0이었습니다. 필요한 것은 센 자석이 아니라 <b>변하는 자기장</b>입니다.") +
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
      { t: "사고가 나면 방사성 물질이 넓은 지역으로 퍼질 수 있다", a: "n", why: "<span data-place=51.3896,30.1042,13,s>체르노빌</span>(1986), <span data-place=37.4214,141.0325,14,s>후쿠시마</span>(2011) 사고가 그 예입니다." },
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
    var ph = 0, playing = !REDUCE;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 15, title: "에너지 100의 길 · 단계마다 새어 나가는 에너지" });
      var s0 = 100, s1 = s0 * e1 / 100, s2 = s1 * e2 / 100, s3 = s2 * e3 / 100;
      var val = [s0, s1, s2, s3], X = [40, 290, 540, 790], top = 66, k = 1.7, end = 868;
      var names = ["연료의 에너지", "① 발전소를 나온 전기 에너지", "② 집에 도착한 전기 에너지", "③ 쓸모 있게 쓰인 에너지"];
      var why = ["", "굴뚝·냉각수의 폐열", "전선의 저항에서 나는 열", "기구에서 나는 열 등"];
      /* 새어 나가는 갈래 (열) */
      for (var i = 0; i < 3; i++) {
        var xs = X[i + 1] - 40, lw = (val[i] - val[i + 1]) * k, yA = top + val[i + 1] * k, yEnd = H - 62;
        if (lw < 0.4) continue;
        var cxr = xs + 40, cyr = yA + 20 + lw;
        var lg = ctx.createLinearGradient(0, yA, 0, yEnd + 16); lg.addColorStop(0, "rgba(255,107,129,.75)"); lg.addColorStop(1, "rgba(255,140,90,.15)");
        ctx.fillStyle = lg; ctx.beginPath();
        ctx.moveTo(xs, yA); ctx.lineTo(cxr, yA); ctx.arc(cxr, cyr, 20 + lw, -Math.PI / 2, 0); ctx.lineTo(cxr + 20 + lw, yEnd);
        ctx.lineTo(cxr + 20 + lw / 2 + Math.max(6, lw / 2 + 4), yEnd); ctx.lineTo(cxr + 20 + lw / 2, yEnd + 16); ctx.lineTo(cxr + 20 + lw / 2 - Math.max(6, lw / 2 + 4), yEnd);
        ctx.lineTo(cxr + 20, yEnd); ctx.lineTo(cxr + 20, cyr); ctx.arc(cxr, cyr, 20, 0, -Math.PI / 2, true); ctx.lineTo(xs, yA + lw); ctx.closePath(); ctx.fill();
        flowDots(ctx, [{ x: xs, y: yA + lw / 2 }, { x: cxr, y: yA + lw / 2 }, { x: cxr + 20 + lw / 2, y: cyr }, { x: cxr + 20 + lw / 2, y: yEnd + 6 }], ph + i * 0.21, 3, "rgba(255,150,120,.95)", 1.8);
        var lx = cxr + 20 + lw / 2;
        K.pill(ctx, "손실 " + (val[i] - val[i + 1]).toFixed(1), lx, H - 28, { s: 12, a: "center", c: KC.red, box: [4, W - 4] });
        K.pill(ctx, why[i + 1], lx, H - 7, { s: 10.5, a: "center", c: "#ffb3a6", bg: "rgba(9,12,34,.55)", box: [4, W - 4] });
      }
      /* 쓸모 있게 남는 줄기 */
      var mg = ctx.createLinearGradient(X[0], 0, end, 0);
      mg.addColorStop(0, "#ffb35c"); mg.addColorStop(.3, "#3fd3a3"); mg.addColorStop(.62, "#7fd3ff"); mg.addColorStop(1, "#b69cff");
      ctx.save(); ctx.shadowColor = "rgba(127,211,255,.45)"; ctx.shadowBlur = 12; ctx.fillStyle = mg;
      ctx.beginPath();
      ctx.moveTo(X[0], top); ctx.lineTo(end, top); ctx.lineTo(end + 14, top + Math.max(val[3] * k, 2) / 2); ctx.lineTo(end, top + Math.max(val[3] * k, 2));
      ctx.lineTo(X[3] - 40, top + Math.max(val[3] * k, 2)); ctx.lineTo(X[3] - 40, top + val[2] * k); ctx.lineTo(X[2] - 40, top + val[2] * k);
      ctx.lineTo(X[2] - 40, top + val[1] * k); ctx.lineTo(X[1] - 40, top + val[1] * k); ctx.lineTo(X[1] - 40, top + val[0] * k); ctx.lineTo(X[0], top + val[0] * k);
      ctx.closePath(); ctx.fill(); ctx.restore();
      var sh = ctx.createLinearGradient(0, top, 0, top + 30); sh.addColorStop(0, "rgba(255,255,255,.25)"); sh.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sh; ctx.fillRect(X[0], top, end - X[0], Math.min(30, Math.max(2, val[3] * k)));
      flowDots(ctx, [{ x: X[0] + 4, y: top + Math.max(val[3] * k, 2) / 2 }, { x: end + 8, y: top + Math.max(val[3] * k, 2) / 2 }], ph, 9, "rgba(255,255,255,.9)", 1.8);
      K.glow(ctx, end + 10, top + Math.max(val[3] * k, 2) / 2, 3 + 5 * Math.min(1, s3 / 40), "rgba(255,236,170,.95)", 3.4);
      /* 이름과 값 */
      for (i = 0; i < 4; i++) {
        K.t(ctx, names[i], i === 3 ? W - 16 : X[i] + (i ? -36 : 0), top - 10, { s: 11.5, w: "800", a: i === 3 ? "right" : "left", c: "#ffffff" });
        var vx = i === 3 ? X[3] - 30 : X[i] + (i ? -34 : 6), vy = top + Math.max(val[i] * k, 2) / 2 + 5;
        K.pill(ctx, val[i].toFixed(1), vx, val[i] * k < 22 ? top + val[i] * k + 20 : vy, { s: 13, c: "#ffffff", bg: "rgba(5,8,26,.6)" });
      }
      $("c-loss-read").innerHTML = "<span class='k'>전체 효율</span><span class='v y'>" + s3.toFixed(1) + "%</span>" +
        "<span class='sub'>= " + e1 + "% × " + e2 + "% × " + e3 + "%</span>" +
        "<span class='k'>흩어진 에너지</span><span class='v r'>" + (100 - s3).toFixed(1) + "</span>" +
        (e1 === 40 && e2 === 96 && e3 === 5 ? "<span class='ok g'>위원장이 알려 준 값 · 빛이 되는 것은 2도 안 됩니다</span>" : "");
      $("c-loss-info").innerHTML = "연료의 에너지 100 가운데 <b>" + (100 - s3).toFixed(1) + "</b>이 도중에 열 등으로 흩어지고 <b>" + s3.toFixed(1) + "</b>만 쓸모 있게 쓰입니다. 흩어진 에너지는 없어진 것이 아니라 <b>다시 쓰기 어려운 형태</b>가 된 것입니다.";
      if (!okA && e1 === 40 && e2 === 96 && e3 === 5) { okA = true; window.sthState("lossA", 1); check(); }
    }
    function check() {
      if (okA) { done("m3-2a"); $("m3-2a").innerHTML = "100 × 40% × 96% × 5% = <b>1.9</b>. 석탄의 에너지 100 가운데 백열전구의 빛이 되는 것은 <b>2도 안 됩니다.</b>"; }
      if (okB) done("m3-2b");
      if (okA && okB) { window.sthMission("m3-2", true); ep.clear(1); }
    }
    canvas._redraw = draw;
    playBtn("c-loss-play", function () { return playing; }, function (x) { playing = x; }, "⏸ 흐름 멈추기", "▶ 흐름 보기");
    K.animate(canvas, function (dt) { if (playing) { ph = (ph + dt / 3000) % 1; draw(); } });
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
    function bulb(cx, cy, kind, glow) {
      var on = clamp(glow, 0, 1.6);
      if (kind === "led") {
        var dg = ctx.createRadialGradient(cx, cy - 6, 2, cx, cy, 34); dg.addColorStop(0, "rgba(255,255,255," + (0.5 + 0.5 * Math.min(on, 1)) + ")"); dg.addColorStop(1, "rgba(220,235,255,.25)");
        ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(cx, cy + 4, 32, 30, 0, Math.PI, 0); ctx.lineTo(cx + 32, cy + 10); ctx.lineTo(cx - 32, cy + 10); ctx.closePath(); ctx.fill();
        for (var f = -2; f <= 2; f++) metal(ctx, cx + f * 6 - 2, cy + 10, 4, 18, "#cfd4e0", "#5b6070", 1, true);
        metal(ctx, cx - 18, cy + 10, 36, 6, "#e6e9f0", "#7a8090", 2);
      } else if (kind === "cfl") {
        ctx.save(); ctx.lineCap = "round"; ctx.shadowColor = "rgba(255,250,230," + Math.min(1, on) + ")"; ctx.shadowBlur = 18 * Math.min(on, 1);
        ctx.strokeStyle = "rgba(255,252,240," + (0.55 + 0.45 * Math.min(on, 1)) + ")"; ctx.lineWidth = 9;
        for (var s = 0; s < 3; s++) { ctx.beginPath(); ctx.ellipse(cx, cy - 26 + s * 16, 22, 7, 0, 0, 6.2832); ctx.stroke(); }
        ctx.restore();
        metal(ctx, cx - 20, cy + 14, 40, 14, "#f2f2f2", "#9aa0ae", 4);
      } else {
        var gg = ctx.createRadialGradient(cx - 10, cy - 14, 3, cx, cy, 40); gg.addColorStop(0, "rgba(255,250,235,.55)"); gg.addColorStop(1, "rgba(255,210,150,.12)");
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy - 8, 34, Math.PI * 0.78, Math.PI * 2.22); ctx.lineTo(cx + 13, cy + 26); ctx.lineTo(cx - 13, cy + 26); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(255,240,220,.45)"; ctx.lineWidth = 1.3; ctx.stroke();
        ctx.save(); ctx.shadowColor = "#ffb35c"; ctx.shadowBlur = 14 * Math.min(on, 1);
        ctx.strokeStyle = on > 0.05 ? "rgba(255," + Math.round(170 + 60 * Math.min(on, 1)) + ",90,1)" : "rgba(150,120,100,.8)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx - 12, cy - 6); for (var z = 0; z <= 6; z++) ctx.lineTo(cx - 12 + z * 4, cy - 12 + (z % 2) * 8); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = "rgba(200,200,210,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - 12, cy - 6); ctx.lineTo(cx - 6, cy + 26); ctx.moveTo(cx + 12, cy - 6); ctx.lineTo(cx + 6, cy + 26); ctx.stroke();
      }
      var by = kind === "inc" ? cy + 26 : cy + 28;
      for (var t = 0; t < 4; t++) metal(ctx, cx - 12, by + t * 6, 24, 6, "#d8dbe4", "#6a7080", 2);
      ctx.fillStyle = "#2a2d38"; ctx.beginPath(); ctx.roundRect(cx - 6, by + 24, 12, 6, 2); ctx.fill();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var L = LAMPS[type], lm = w * L.lmw, ok = lm >= 760 && lm <= 840, effPct = 5 * L.lmw / 13.3;
      /* ── 왼쪽: 회관 천장의 전구 ── */
      var LW = 270, cx = 135, cy = 104, glow = clamp(lm / 800, 0, 2);
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 3, title: "회관 천장" });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var cone = ctx.createRadialGradient(cx, cy, 10, cx, cy + 60, 240);
      cone.addColorStop(0, "rgba(255,225,160," + clamp(glow * 0.32, 0.02, 0.5) + ")"); cone.addColorStop(1, "rgba(255,225,160,0)");
      ctx.fillStyle = cone; ctx.fillRect(0, 0, LW, H);
      var fl = ctx.createRadialGradient(cx, H - 20, 4, cx, H - 20, 130); fl.addColorStop(0, "rgba(255,225,160," + clamp(glow * 0.25, 0.02, 0.4) + ")"); fl.addColorStop(1, "rgba(255,225,160,0)");
      ctx.fillStyle = fl; ctx.beginPath(); ctx.ellipse(cx, H - 20, 130, 26, 0, 0, 6.2832); ctx.fill();
      ctx.restore();
      ctx.strokeStyle = "rgba(200,210,255,.4)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, 40); ctx.lineTo(cx, cy - 46); ctx.stroke();
      if (lm > 5) K.glow(ctx, cx, cy - 8, 10 + 14 * Math.min(glow, 1.5), "rgba(255,236,190," + clamp(glow * 0.6, 0.08, 0.95) + ")", 2.6);
      /* 열 (쓸모없이 흩어지는 몫) */
      var heat = (100 - effPct) / 100, nw = Math.round(heat * 4 * Math.min(1, w / 20));
      ctx.save(); ctx.strokeStyle = "rgba(255,107,129,.55)"; ctx.lineWidth = 2;
      for (var hq = 0; hq < nw; hq++) {
        [-1, 1].forEach(function (sd) {
          var x0 = cx + sd * (50 + hq * 13); ctx.beginPath();
          for (var yy = 0; yy <= 48; yy += 4) { var xx = x0 + Math.sin(yy / 6 + hq) * 3; if (yy) ctx.lineTo(xx, cy + 14 - yy); else ctx.moveTo(xx, cy + 14 - yy); }
          ctx.stroke();
        });
      }
      ctx.restore();
      bulb(cx, cy, type, glow);
      if (nw) K.pill(ctx, "열", cx + 54 + nw * 13, cy - 26, { s: 11, c: KC.red, box: [0, LW] });
      K.pill(ctx, L.n + " " + w + " W", cx, 228, { s: 13, a: "center", c: "#ffffff", box: [0, LW] });
      K.pill(ctx, Math.round(lm) + " lm", cx, 262, { s: 17, a: "center", c: ok ? KC.green : (lm > 840 ? KC.red : KC.yellow), box: [0, LW] });
      K.t(ctx, ok ? "✅ 회관에 알맞은 밝기" : (lm < 760 ? "어둡습니다" : "필요 이상으로 밝습니다 (낭비)"), cx, 298, { s: 11.5, a: "center", c: KC.mute });

      /* ── 오른쪽: 계기 ── */
      var RX = LW + 8, gx = RX + 24, gw = W - gx - 26;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 7 });
      K.t(ctx, "밝기 (lm) — 초록 띠가 목표 760~840", gx, 30, { s: 12.5, w: "800", c: KC.ink });
      track(ctx, gx, 42, gw, 22, 11);
      ctx.fillStyle = "rgba(63,211,163,.35)"; ctx.fillRect(gx + gw * 760 / 1600, 36, gw * 80 / 1600, 34);
      gbar(ctx, gx, 47, clamp(lm / 1600, 0.004, 1) * gw, 12, ok ? "#1f8f6a" : "#8a6a12", ok ? KC.green : KC.yellow, 6);
      [0, 400, 800, 1200, 1600].forEach(function (q) { K.t(ctx, String(q), gx + gw * q / 1600, 84, { s: 10.5, a: q === 0 ? "left" : (q === 1600 ? "right" : "center"), c: KC.dim }); });
      K.t(ctx, "들어간 전기 에너지 100은 어디로 갔나", gx, 116, { s: 12.5, w: "800", c: KC.ink });
      var lw = gw * effPct / 100;
      gbar(ctx, gx, 126, lw, 36, "#8a6a12", KC.yellow, 6);
      gbar(ctx, gx + lw + 3, 126, gw - lw - 3, 36, "#5a1a2c", KC.red, 6, 4);
      K.pill(ctx, "빛 " + effPct.toFixed(0), gx, 184, { s: 12, c: KC.yellow });
      K.pill(ctx, "열 " + (100 - effPct).toFixed(0) + " (쓸모없이 흩어짐)", gx + gw, 184, { s: 12, a: "right", c: KC.red });
      K.t(ctx, "하루 5시간씩 1년 동안 쓰는 전기 (내가 맞춘 전구)", gx, 222, { s: 12.5, w: "800", c: KC.ink });
      ["inc", "cfl", "led"].forEach(function (k, i) {
        var y = 234 + i * 27, fw = found[k];
        K.t(ctx, LAMPS[k].n, gx + 96, y + 14, { s: 11, a: "right", c: k === type ? "#ffffff" : KC.mute });
        track(ctx, gx + 104, y, 380, 18, 5);
        if (fw) { var kwh = fw * 5 * 365 / 1000; gbar(ctx, gx + 104, y, 380 * kwh / 130, 18, k === "inc" ? "#5a1a2c" : "#0f4c4a", k === "inc" ? KC.red : "#6fe3d6", 5, 6); K.t(ctx, fw + " W → " + kwh.toFixed(0) + " kWh", gx + 104 + 380 * kwh / 130 + 8, y + 14, { s: 11, w: "800", c: KC.ink }); }
        else K.t(ctx, "아직 맞추지 못함", gx + 112, y + 14, { s: 10.5, c: KC.dim });
      });
      $("c-lamp-read").innerHTML = "<span class='k'>밝기</span><span class='v y'>" + Math.round(lm) + " lm</span>" +
        "<span class='sub'>= " + w + " W × " + L.lmw + " lm/W</span>" +
        "<span class='k'>빛 효율</span><span class='v b'>약 " + effPct.toFixed(0) + "%</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "목표 760~840 lm 안" : (lm < 760 ? "어둡습니다 · 목표 760~840 lm" : "너무 밝습니다 · 목표 760~840 lm")) + "</span>";
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
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 10 });
      var r = village(S, Wd, Bt, Dg), x0 = 50, x1 = 880, y0 = 50, y1 = 250, bw = (x1 - x0) / 48, maxP = 900;
      /* 낮·밤과 날씨 */
      for (var hb = 0; hb < 48; hb++) {
        var hh = hb % 24, dayT = hh >= 6 && hh < 18, d2 = hb >= 24;
        ctx.fillStyle = dayT ? (d2 ? "rgba(170,180,205,.10)" : "rgba(127,211,255,.12)") : "rgba(0,0,12,.28)";
        ctx.fillRect(x0 + hb * bw, y0, bw + 0.5, y1 - y0);
      }
      ctx.strokeStyle = "rgba(200,210,255,.35)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0 + 24 * bw, y0 - 6); ctx.lineTo(x0 + 24 * bw, y1); ctx.stroke(); ctx.setLineDash([]);
      K.pill(ctx, "1일째 ☀️💨 맑고 바람 부는 날", x0 + 6, 30, { s: 12, c: KC.yellow });
      K.pill(ctx, "2일째 ☁️ 흐리고 바람 없는 날", x0 + (x1 - x0) / 2 + 10, 30, { s: 12, c: KC.mute });
      [0, 300, 600, 900].forEach(function (q) {
        var gy = y1 - q / maxP * (y1 - y0);
        ctx.strokeStyle = KC.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();
        K.t(ctx, String(q), x0 - 6, gy + 4, { s: 10, a: "right", c: KC.dim });
      });
      /* 쌓은 막대 */
      var COL = [["#1f8f6a", KC.green], ["#1d5f8a", KC.blue], ["#8a4a12", KC.orange], ["#7a1f33", KC.red]];
      r.rows.forEach(function (o, h) {
        var x = x0 + h * bw, y = y1;
        [o.R, o.dis, o.dg, o.un].forEach(function (q, j) {
          var hgt = q / maxP * (y1 - y0); if (hgt <= 0) return;
          var g = ctx.createLinearGradient(0, y - hgt, 0, y); g.addColorStop(0, COL[j][1]); g.addColorStop(1, COL[j][0]);
          ctx.fillStyle = g; ctx.fillRect(x + 1, y - hgt, bw - 2, hgt); y -= hgt;
        });
      });
      ctx.save(); ctx.shadowColor = KC.violet; ctx.shadowBlur = 8; ctx.strokeStyle = KC.violet; ctx.lineWidth = 2.5; ctx.beginPath();
      r.rows.forEach(function (o, h) { var xx = x0 + (h + 0.5) * bw, yy = y1 - o.D / maxP * (y1 - y0); if (h === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); });
      ctx.stroke(); ctx.restore();
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      [0, 6, 12, 18, 24, 30, 36, 42].forEach(function (h) { K.t(ctx, (h % 24) + "시", x0 + h * bw, y1 + 15, { s: 10, c: KC.mute, a: h ? "center" : "left" }); });
      K.t(ctx, "kW", x0 - 6, y0 - 10, { s: 10, a: "right", c: KC.mute });
      /* 배터리 잔량 띠 */
      K.t(ctx, "🔋", 20, 288, { s: 13 });
      track(ctx, x0, 274, x1 - x0, 18, 5);
      if (Bt > 0) r.rows.forEach(function (o, h) { ctx.fillStyle = "rgba(127,211,255," + (0.08 + 0.85 * o.soc / Bt) + ")"; ctx.fillRect(x0 + h * bw, 274, bw, 18); });
      else K.t(ctx, "배터리 없음", x0 + 8, 287, { s: 10.5, c: KC.dim });
      /* 범례 */
      [[KC.green, "태양광·풍력"], [KC.blue, "배터리 방전"], [KC.orange, "경유 발전"], [KC.red, "정전(모자람)"], [KC.violet, "— 마을이 쓰는 전력"]].forEach(function (p, i) {
        ctx.fillStyle = p[0]; ctx.beginPath(); ctx.roundRect(x0 + i * 160, 308, 12, 12, 3); ctx.fill(); K.t(ctx, p[1], x0 + i * 160 + 18, 319, { s: 11, c: KC.ink });
      });
      var k = verdict(r);
      K.pill(ctx, (k.a ? "✅" : "❌") + " 정전 " + r.black + "시간", x0, 350, { s: 12.5, c: k.a ? KC.green : KC.red });
      K.pill(ctx, (k.b ? "✅" : "❌") + " 설치비 " + r.cost.toFixed(1) + "억 원", x0 + 220, 350, { s: 12.5, c: k.b ? KC.green : KC.red });
      K.pill(ctx, (k.c ? "✅" : "❌") + " CO₂ 지금의 " + Math.round(r.ratio * 100) + "% (" + (r.co2 / 1000).toFixed(1) + "톤)", x0 + 480, 350, { s: 12.5, c: k.c ? KC.green : KC.red });
      return r;
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "☀️" + t.s + " 💨" + t.w + " 🔋" + t.b + " 🛢️" + t.d + " → 정전 " + t.bl + "시간 · " + t.cost + "억 원 · CO₂ " + t.co + "% " + (t.ok ? "✅" : "❌ " + t.why); });
      $("c-v-info").innerHTML = (rows.length ? "<b>제출 기록</b><br>" + rows.join("<br>") + "<br>" : "") +
        "막대가 보라색 선(마을이 쓰는 전력)에 닿지 못해 빨간색이 생기면 정전입니다. 남는 전기는 배터리에 저장되고, 배터리가 가득 차면 버려집니다.";
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
    $("e3-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉢") === 0 ? " — 정확했습니다. 40% × 96% × 5% ≈ 1.9입니다." : " — 실제로는 40% × 96% × 5% ≈ <b>1.9</b>. 단계마다 효율이 곱해지기 때문입니다.") +
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
      { t: "🌊 밀물과 썰물의 흐름으로 터빈을 돌린다(조력 발전)", a: "r", why: "고갈되지 않는 재생 에너지입니다. 우리나라에는 <span data-place=37.3135,126.6125,15,s>시화호 조력 발전소</span>가 있습니다." }
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
    { key: "r3", label: "③ 사라진 98" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
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
    { key: "r3", label: "③ 사라진 98" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
