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
/* ---- 밝은 스튜디오 말투 도구 (블록 모형·입체 미니어처 장면, kit.js 머리말 K.iso·K.LT·K.card 참고) ---- */
var LT = K.LT;
function mixHex(a, b, t) { var p = parseInt(a.slice(1), 16), q = parseInt(b.slice(1), 16), o = [16, 8, 0].map(function (s) { var u = (p >> s) & 255, w = (q >> s) & 255; return Math.round(u + (w - u) * t); }); return "rgb(" + o.join(",") + ")"; }
function lt(ctx, s, x, y, o) { o = o || {}; if (!o.c) o.c = LT.ink; K.t(ctx, s, x, y, o); }
function ltrack(ctx, x, y, w, h, r) { ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 6 : r); ctx.fill(); }
function lbar(ctx, x, y, w, h, c0, c1, r) {                 // 밝은 바탕 막대(살짝 볼록)
  if (!(w > 0.5)) return;
  var rr = Math.min(r == null ? 6 : r, w / 2, h / 2), g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1 || c0); g.addColorStop(1, c0);
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.22)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.fill(); ctx.restore();
  var s = ctx.createLinearGradient(0, y, 0, y + h); s.addColorStop(0, "rgba(255,255,255,.42)"); s.addColorStop(.5, "rgba(255,255,255,0)");
  ctx.fillStyle = s; ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.fill();
}
function floorShadow(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 1, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function cyl(ctx, cx, yTop, yBot, rx, ry, c0, c1, c2, cTop) {   // 세운 원기둥(탱크·탑·받침)
  var g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); g.addColorStop(0, c1); g.addColorStop(.38, c0); g.addColorStop(1, c2);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - rx, yTop); ctx.lineTo(cx - rx, yBot); ctx.ellipse(cx, yBot, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, yTop); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cTop || "#eef1f5"; ctx.beginPath(); ctx.ellipse(cx, yTop, rx, ry, 0, 0, 6.2832); ctx.fill();
}
function lead(ctx, px, py, qx, qy, s, col, box) {           // 지시선 이름표(화면 좌표)
  ctx.strokeStyle = "rgba(20,25,40,.75)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
  ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 6.283); ctx.fill();
  return K.pill(ctx, s, qx + (qx < px ? -4 : 4), qy + 4, { s: 12, a: qx < px ? "right" : "left", c: col || "#e8ecff", box: box });
}
function onPlane(ctx, I, y, fn) {                          // 상자 앞면(y = 일정)에 평면처럼 그리기: fn 안의 좌표 (u = x, v = z)
  var o = I.P(0, y, 0), ex = I.P(1, y, 0), ez = I.P(0, y, 1);
  ctx.save(); ctx.transform(ex.x - o.x, ex.y - o.y, ez.x - o.x, ez.y - o.y, o.x, o.y); fn(); ctx.restore();
}
function rotor(ctx, x, y, r, a) {                          // 풍력 날개(화면 좌표)
  for (var b = 0; b < 3; b++) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + b * 2.0944);
    var g = ctx.createLinearGradient(-r * .1, 0, r * .1, 0); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#b9c2cf");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -r * .5, r * .085, r * .5, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = "rgba(60,70,90,.35)"; ctx.lineWidth = .8; ctx.stroke(); ctx.restore();
  }
  K.planet(ctx, x, y, Math.max(2, r * .1), "#ffffff", "#7a8496");
}
function windmill(ctx, base, h, r, a) {
  var g = ctx.createLinearGradient(base.x - 3, 0, base.x + 3, 0); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#a9b2bf");
  ctx.strokeStyle = g; ctx.lineWidth = Math.max(2, r * .09); ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(base.x, base.y - h); ctx.stroke(); ctx.lineCap = "butt";
  floorShadow(ctx, base.x + 3, base.y, r * .35, r * .1, .25);
  rotor(ctx, base.x, base.y - h, r, a);
}
function puffCloud(ctx, x, y, sc, dark) {                  // 입체 구름 덩어리
  [[-26, 4, 15], [-8, -8, 19], [14, -4, 17], [30, 6, 13], [2, 8, 16], [-16, 10, 12]].forEach(function (q) {
    var px = x + q[0] * sc, py = y + q[1] * sc, r = q[2] * sc, g = ctx.createRadialGradient(px - r * .35, py - r * .45, r * .1, px, py, r);
    g.addColorStop(0, "#ffffff"); g.addColorStop(.65, dark ? "#c3cad6" : "#eef2f7"); g.addColorStop(1, dark ? "#8b95a6" : "#b9c3d1");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill();
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
      ctx.clearRect(0, 0, W, H);
      var e = Math.pow(10, x), y = lifeYears(e), ok = y >= 4.6e9, SW = 600;
      K.studio(ctx, 0, 0, SW, H, { x: 310, y: 330, rx: 300, ry: 26 });
      var x0 = 50, x1 = 560, sy = 300, sd = 26, sdx = 18;
      function AX(k) { return x0 + (k - 7) / 8 * (x1 - x0); }
      var kind = x < 8.4 ? "coal" : (x < 12.5 ? "mid" : "nuke");
      K.bigText(ctx, "태양의 수명 " + years(y), 18, 44, 25, ok ? "#8ff5cf" : "#ffffff");
      K.bigText(ctx, ok ? "지구의 나이 46억 년을 넘긴다" : "지구의 나이 46억 년에 못 미친다", 18, 72, 16, "#ffd35a");
      /* 태양(입체 공): 태양 전체가 지금 고른 연료라면 */
      var SX = 470, SY = 116, SR = 56;
      floorShadow(ctx, SX + 8, 262, SR * .9, 12, .22);
      if (kind === "nuke") { K.glow(ctx, SX, SY, SR * 1.25, "rgba(255,200,80,.55)", 2.2); }
      var sg = ctx.createRadialGradient(SX - SR * .35, SY - SR * .4, SR * .1, SX, SY, SR);
      if (kind === "coal") { sg.addColorStop(0, "#6b6b74"); sg.addColorStop(.6, "#2c2c33"); sg.addColorStop(1, "#141418"); }
      else if (kind === "mid") { sg.addColorStop(0, "#ffffff"); sg.addColorStop(.55, "#ffd8a8"); sg.addColorStop(1, "#e8590c"); }
      else { sg.addColorStop(0, "#fffbe6"); sg.addColorStop(.5, "#ffd43b"); sg.addColorStop(1, "#f76707"); }
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(SX, SY, SR, 0, 6.2832); ctx.fill();
      if (kind === "coal") {
        /* 불씨가 박힌 석탄 덩어리 표면 */
        var Rc = K.rng(3);
        ctx.save(); ctx.beginPath(); ctx.arc(SX, SY, SR, 0, 6.2832); ctx.clip();
        for (var cq = 0; cq < 14; cq++) { var ca = Rc() * 6.28, cr = Rc() * SR * .9, cx = SX + Math.cos(ca) * cr, cy = SY + Math.sin(ca) * cr; ctx.strokeStyle = "rgba(255," + Math.round(90 + Rc() * 80) + ",40," + (0.5 + Rc() * .4).toFixed(2) + ")"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + (Rc() - .5) * 22, cy + (Rc() - .5) * 16); ctx.stroke(); }
        ctx.restore();
        for (var fl = 0; fl < 5; fl++) { var fa = -2.6 + fl * .55, fx = SX + Math.cos(fa) * SR, fy = SY + Math.sin(fa) * SR; ctx.fillStyle = "rgba(255,146,43,.75)"; ctx.beginPath(); ctx.moveTo(fx - 6, fy + 4); ctx.quadraticCurveTo(fx, fy - 18, fx + 6, fy + 4); ctx.fill(); }
      } else if (kind === "nuke") {
        ctx.save(); ctx.beginPath(); ctx.arc(SX, SY, SR, 0, 6.2832); ctx.clip();
        var Rg = K.rng(6); for (var gq = 0; gq < 40; gq++) { ctx.fillStyle = "rgba(255,255,255," + (0.12 + Rg() * .2).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(SX + (Rg() - .5) * SR * 1.8, SY + (Rg() - .5) * SR * 1.8, 2 + Rg() * 4, 0, 6.2832); ctx.fill(); }
        ctx.restore();
      }
      K.pill(ctx, kind === "coal" ? "석탄으로 된 태양" : (kind === "nuke" ? "원자핵 반응으로 빛나는 태양" : "가상의 연료로 된 태양"), SX - SR - 14, SY + 4, { s: 12.5, a: "right", c: kind === "coal" ? "#ffd8a8" : "#fff3bf", box: [0, SW - 4] });
      /* 견본 진열대(연료 1 kg 견본을 에너지 순서로 올려 둔 선반). 앞면 = 10배 눈금자 */
      var shG = ctx.createLinearGradient(0, sy, 0, sy + 30); shG.addColorStop(0, "#ffffff"); shG.addColorStop(1, "#dfe5ee");
      ctx.fillStyle = "#eef2f7"; ctx.beginPath(); ctx.moveTo(x0 - 20, sy); ctx.lineTo(x1 + 20, sy); ctx.lineTo(x1 + 20 + sdx, sy - sd); ctx.lineTo(x0 - 20 + sdx, sy - sd); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#c3ccd8"; ctx.beginPath(); ctx.moveTo(x1 + 20, sy); ctx.lineTo(x1 + 20 + sdx, sy - sd); ctx.lineTo(x1 + 20 + sdx, sy - sd + 30); ctx.lineTo(x1 + 20, sy + 30); ctx.closePath(); ctx.fill();
      ctx.fillStyle = shG; ctx.fillRect(x0 - 20, sy, x1 - x0 + 40, 30);
      ctx.strokeStyle = "rgba(110,130,160,.5)"; ctx.lineWidth = 1; ctx.strokeRect(x0 - 20, sy, x1 - x0 + 40, 30);
      ctx.fillStyle = "rgba(232,89,12,.16)"; ctx.fillRect(AX(7) - 8, sy + 2, AX(8.7) - AX(7) + 16, 26);
      if (okB) { ctx.fillStyle = "rgba(112,72,232,.16)"; ctx.fillRect(AX(13.6) - 8, sy + 2, AX(15) - AX(13.6) + 16, 26); }
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.4;
      for (var k = 7; k <= 15; k++) { var gx = AX(k); ctx.beginPath(); ctx.moveTo(gx, sy); ctx.lineTo(gx, sy + 8); ctx.stroke(); lt(ctx, "10" + sup(k), gx, sy + 23, { s: 12, c: LT.ink, a: "center", w: "800" }); }
      lt(ctx, "연료 1 kg이 내는 에너지 (J) · 한 칸 = 10배", x0 - 20, sy + 50, { s: 12, w: "800", c: LT.mute });
      lt(ctx, "화학 반응(연소)", AX(7) - 8, sy + 70, { s: 12, w: "800", c: LT.orange });
      if (okB) lt(ctx, "원자핵 반응", AX(15) + 8, sy + 70, { s: 12, w: "800", a: "right", c: LT.violet });
      /* 견본: 석탄 덩어리, 수소 가스통, (찾은 뒤) 우라늄 알갱이, 수소 핵융합 플라스마 */
      function cube(cx, by, s0, cTop, cFront, cSide) {
        var d = s0 * .45;
        ctx.fillStyle = cFront; ctx.fillRect(cx - s0 / 2, by - s0, s0, s0);
        ctx.fillStyle = cTop; ctx.beginPath(); ctx.moveTo(cx - s0 / 2, by - s0); ctx.lineTo(cx + s0 / 2, by - s0); ctx.lineTo(cx + s0 / 2 + d * .7, by - s0 - d); ctx.lineTo(cx - s0 / 2 + d * .7, by - s0 - d); ctx.closePath(); ctx.fill();
        ctx.fillStyle = cSide; ctx.beginPath(); ctx.moveTo(cx + s0 / 2, by - s0); ctx.lineTo(cx + s0 / 2 + d * .7, by - s0 - d); ctx.lineTo(cx + s0 / 2 + d * .7, by - d); ctx.lineTo(cx + s0 / 2, by); ctx.closePath(); ctx.fill();
      }
      var shelfY = sy - 8;
      function sample(f, i) {
        var fx = AX(f.x) + 6, nuke = f.x > 12;
        floorShadow(ctx, fx + 6, shelfY + 2, 18, 4, .25);
        if (f.n === "석탄") {
          cube(fx, shelfY, 24, "#55555e", "#2b2b31", "#18181c");
          var Rr = K.rng(5); for (var q = 0; q < 8; q++) { ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(fx - 10 + Rr() * 18, shelfY - 22 + Rr() * 18, 2, 1.5); }
        } else if (f.n === "수소 기체 연소") {
          cyl(ctx, fx, shelfY - 30, shelfY, 9, 3.5, "#d0ebff", "#ffffff", "#74c0fc", "#e7f5ff");
          ctx.fillStyle = "#495057"; ctx.fillRect(fx - 3, shelfY - 38, 6, 8);
          lt(ctx, "H₂", fx, shelfY - 12, { s: 11, w: "900", a: "center", c: "#1864ab" });
        } else if (f.n === "우라늄 핵분열") {
          K.glow(ctx, fx, shelfY - 12, 16, "rgba(140,233,154,.6)", 2.2);
          cyl(ctx, fx, shelfY - 22, shelfY, 8, 3, "#a9e34b", "#d8f5a2", "#5c940d", "#c0eb75");
        } else {
          K.glow(ctx, fx, shelfY - 14, 20, "rgba(255,212,59,.8)", 2.4);
          cube(fx, shelfY, 26, "rgba(255,255,255,.35)", "rgba(220,235,255,.35)", "rgba(180,200,230,.35)");
          K.planet(ctx, fx + 2, shelfY - 15, 8, "#fff3bf", "#f59f00");
        }
        var ly = f.up ? sy - 82 : sy - 58;
        ctx.strokeStyle = "rgba(20,25,40,.55)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(fx, shelfY - 32); ctx.lineTo(fx, ly + 6); ctx.stroke();
        K.pill(ctx, f.n, fx, ly, { s: 12, a: "center", c: nuke ? "#d9ccff" : "#ffd9a8", box: [0, SW] });
      }
      FUELS.concat(okB ? NUKE : []).forEach(sample);
      /* 내가 고른 연료 1 kg (투명 상자): 눈금을 따라 움직이고, 진할수록 밝게 빛난다 */
      var px = AX(x), t = (x - 7) / 8;
      if (t > .25) K.glow(ctx, px, shelfY - 4, 10 + 26 * t, "rgba(" + Math.round(255) + "," + Math.round(200 - 60 * t) + "," + Math.round(80 + 170 * t) + "," + (0.25 + .55 * t).toFixed(2) + ")", 2.2);
      var core = t < .2 ? "#3a3a42" : mixHex("#ff922b", "#b197fc", clamp((t - .2) / .8, 0, 1));
      floorShadow(ctx, px + 8, sy + 2, 24, 5, .3);
      cube(px, sy + 2, 34, "rgba(220,240,255,.55)", "rgba(200,225,255,.45)", "rgba(150,180,220,.45)");
      K.planet(ctx, px + 3, sy - 15, 7 + 4 * t, core, t < .2 ? "#111" : "#5f3dc4");
      ctx.strokeStyle = "rgba(28,126,214,.9)"; ctx.lineWidth = 1.6; ctx.strokeRect(px - 17, sy - 32, 34, 34);
      K.pill(ctx, "1 kg에 " + sci(e) + " J", px, sy - 112, { s: 13, a: "center", c: "#bfe6ff", box: [0, SW] });
      ctx.strokeStyle = "rgba(28,126,214,.85)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(px, sy - 104); ctx.lineTo(px, sy - 40); ctx.stroke();
      ctx.fillStyle = LT.blue; ctx.beginPath(); ctx.moveTo(px, sy + 10); ctx.lineTo(px - 6, sy + 2); ctx.lineTo(px + 6, sy + 2); ctx.closePath(); ctx.fill();
      /* 견본 → 태양: 태양 전체가 이 연료라면 */
      ctx.save(); ctx.setLineDash([5, 5]); ctx.strokeStyle = "rgba(28,126,214,.55)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(px + 18, sy - 30); ctx.quadraticCurveTo((px + SX) / 2, sy - 30, SX - SR * .7, SY + SR * .7); ctx.stroke(); ctx.restore();
      K.warn(ctx, SW - 12, H - 12, "⚠ 견본·태양의 크기는 실제 비율이 아닙니다", "right");
      /* 오른쪽 판정 카드: 수명 시간띠는 여기로 */
      var CX = 612, cx0 = CX + 18, cx1 = W - 18, rt = e / 3.16e7;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 이 연료로 태양이 빛나는 시간");
      lt(ctx, years(y), cx0, 64, { s: 22, w: "900", c: ok ? LT.green : LT.orange });
      K.row(ctx, "연료 1 kg의 에너지", sci(e) + " J", cx0, cx1, 98);
      K.row(ctx, "석탄과 비교", "× " + (rt < 10 ? rt.toFixed(1) : (rt < 1e4 ? Math.round(rt).toLocaleString() : sci(rt, 1))), cx0, cx1, 122, rt >= 1e6 ? LT.violet : LT.ink);
      K.row(ctx, "태양의 질량", "2.0×10³⁰ kg", cx0, cx1, 146);
      K.row(ctx, "1초에 내보내는 에너지", "3.8×10²⁶ J", cx0, cx1, 170);
      /* 수명 시간띠 (로그 눈금 10³~10¹¹ 년) */
      lt(ctx, "태양의 수명 (한 칸 = 100배)", cx0, 198, { s: 12, w: "800", c: LT.ink });
      var bx0 = cx0, bw = cx1 - cx0, by = 216, tl = clamp((Math.log(y) / Math.LN10 - 3) / 8, 0.01, 1);
      ltrack(ctx, bx0, by, bw, 14, 7);
      lbar(ctx, bx0, by, bw * tl, 14, ok ? "#0f9f76" : "#c92a2a", ok ? "#63e6be" : "#ff8787", 7);
      K.planet(ctx, bx0 + bw * tl, by + 7, 6, "#ffe066", "#e8590c");
      var ex = bx0 + (Math.log(4.6e9) / Math.LN10 - 3) / 8 * bw;
      ctx.strokeStyle = LT.ink; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(ex, by - 6); ctx.lineTo(ex, by + 22); ctx.stroke(); ctx.setLineDash([]);
      lt(ctx, "천 년", bx0, by + 34, { s: 11, c: LT.mute }); lt(ctx, "46억 년", ex, by - 10, { s: 11, w: "800", a: "center", c: LT.ink }); lt(ctx, "천억 년", cx1, by + 34, { s: 11, a: "right", c: LT.mute });
      K.tip(ctx, ok ? "화학 반응으로는 낼 수 없는 에너지" : "46억 년을 설명하지 못합니다", cx0 - 4, 262, cx1 - cx0 + 4, ok);
      lt(ctx, (okA ? "✓" : "○") + " 석탄 태양의 수명 (눈금 7.5)", cx0, 334, { s: 12, w: "800", c: okA ? LT.green : LT.mute });
      lt(ctx, (okB ? "✓" : "○") + " 46억 년을 넘기는 첫 눈금", cx0, 358, { s: 12, w: "800", c: okB ? LT.green : LT.mute });
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
    var GRAN = (function () { var R = K.rng(17), a = []; for (var i = 0; i < 90; i++) { var t = R() * 6.2832, r = Math.sqrt(R()) * .95; a.push([Math.cos(t) * r, Math.sin(t) * r, 2 + R() * 5]); } return a; })();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var SW = 590, P = fusionPower(m), ratio = P / 3.8e26, ok = P >= 3.724e26 && P <= 3.876e26, lit = clamp(ratio, 0, 2);
      var cx = 300, cy = 238, R = 134, i;
      K.studio(ctx, 0, 0, SW, H, { x: cx, y: 386, rx: 220, ry: 14 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, SW, H, 14); ctx.clip();
      if (lit > 0) { var co = ctx.createRadialGradient(cx, cy, R * .92, cx, cy, R * (1.22 + .22 * lit)); co.addColorStop(0, "rgba(255,160,40," + (0.42 * Math.min(lit, 1.5)).toFixed(2) + ")"); co.addColorStop(1, "rgba(255,160,40,0)"); ctx.fillStyle = co; ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, 6.2832); ctx.fill(); }
      /* 겉면(광구)과 쌀알 무늬 */
      var sg = ctx.createRadialGradient(cx - R * .35, cy - R * .35, R * .1, cx, cy, R);
      if (lit > 0) { sg.addColorStop(0, "#fff3c4"); sg.addColorStop(.5, "#ffb13b"); sg.addColorStop(1, "#d9480f"); } else { sg.addColorStop(0, "#9a6a50"); sg.addColorStop(1, "#3a2218"); }
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();
      GRAN.forEach(function (gq) { if (gq[0] < 0 && gq[1] < 0) return; ctx.fillStyle = lit > 0 ? "rgba(255,244,200,.22)" : "rgba(255,220,180,.08)"; ctx.beginPath(); ctx.arc(cx + gq[0] * R, cy + gq[1] * R, gq[2], 0, 6.2832); ctx.fill(); });
      /* 왼쪽 위 4분의 1을 잘라 낸 단면: 중심핵(0~0.25R) · 복사층(~0.7R) · 대류층 */
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, Math.PI, Math.PI * 1.5); ctx.closePath(); ctx.clip();
      var zg = ctx.createRadialGradient(cx, cy, R * .7, cx, cy, R); zg.addColorStop(0, "#f76707"); zg.addColorStop(1, "#c92a2a");
      ctx.fillStyle = zg; ctx.fillRect(cx - R, cy - R, R, R);
      ctx.strokeStyle = "rgba(255,226,160,.6)"; ctx.lineWidth = 1.4;
      for (var a = Math.PI + .1; a < Math.PI * 1.5 - .05; a += .19) { ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * R * .85, cy + Math.sin(a) * R * .85, R * .12, R * .065, a + Math.PI / 2, 0, 6.2832); ctx.stroke(); }
      var rg = ctx.createRadialGradient(cx, cy, R * .25, cx, cy, R * .7); rg.addColorStop(0, "#ffd43b"); rg.addColorStop(1, "#ff922b");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, R * .7, 0, 6.2832); ctx.fill();
      var kg = ctx.createRadialGradient(cx, cy, 2, cx, cy, R * .25); kg.addColorStop(0, "#ffffff"); kg.addColorStop(.6, "#fff3bf"); kg.addColorStop(1, "#ffd43b");
      ctx.fillStyle = kg; ctx.beginPath(); ctx.arc(cx, cy, R * .25, 0, 6.2832); ctx.fill();
      if (lit > 0) for (i = 0; i < 7; i++) { var tt = (ph * 1.3 + i / 7) % 1, an = Math.PI * (1.08 + .36 * ((i * .37) % 1)) + Math.sin(tt * 18 + i) * .05, rr = R * (.27 + tt * .42); K.glow(ctx, cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, 1.6, "rgba(255,255,255,.95)", 3); }
      if (lit <= 0) { ctx.fillStyle = "rgba(40,20,10,.6)"; ctx.fillRect(cx - R, cy - R, R, R); }
      ctx.restore();
      ctx.strokeStyle = "rgba(110,30,0,.6)"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy - R); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx - R, cy - 1.5); ctx.lineTo(cx - 1.5, cy - 1.5); ctx.lineTo(cx - 1.5, cy - R); ctx.stroke();
      /* 중심핵 확대: 수소 원자핵 4개 → 헬륨 1개 + 빛 */
      var ix = 506, iy = 112, ir = 58, he = { x: ix, y: iy };
      ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(20,30,60,.55)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx + 6, cy - 6); ctx.lineTo(ix - ir * .7, iy + ir * .7); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 6.2832); ctx.clip();
      var ig = ctx.createRadialGradient(ix, iy, 4, ix, iy, ir); ig.addColorStop(0, lit > 0 ? "#fff1c1" : "#6b4a3a"); ig.addColorStop(1, lit > 0 ? "#ffb347" : "#3a2218");
      ctx.fillStyle = ig; ctx.fillRect(ix - ir, iy - ir, ir * 2, ir * 2);
      var HS = [[-30, -24], [30, -24], [-30, 24], [30, 24]];
      if (lit > 0 && ph < 0.55) { var u = ph / 0.55, ee = u * u * (3 - 2 * u); HS.forEach(function (p) { nucleus(ix + p[0] * (1 - ee), iy + p[1] * (1 - ee), 9, "#ff8f7e", "#8a1c2c", ee < .7 ? "H" : ""); }); }
      else if (lit <= 0) HS.forEach(function (p) { nucleus(ix + p[0], iy + p[1], 9, "#ff8f7e", "#8a1c2c", "H"); });
      var fl = ph > 0.5 && ph < 0.8 ? 1 - Math.abs(ph - 0.6) / 0.2 : 0;
      if (lit > 0 && fl > 0) { ctx.save(); ctx.globalAlpha = clamp(fl, 0, 1); K.glow(ctx, he.x, he.y, 18, "rgba(255,255,255,.95)", 2.6); ctx.restore(); }
      if (lit > 0 && ph >= 0.5) {
        nucleus(he.x, he.y, 15, "#c8b4ff", "#3b2390", "He");
        var r2 = clamp((ph - 0.55) / 0.45, 0, 1);
        [-0.9, 0.3, 1.6, 2.6].forEach(function (aa) { ctx.save(); ctx.globalAlpha = 1 - r2 * .6; K.glow(ctx, he.x + Math.cos(aa) * (20 + r2 * 30), he.y + Math.sin(aa) * (20 + r2 * 30), 2.6, "rgba(255,240,150,.95)", 3); ctx.restore(); });
      }
      ctx.restore();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "rgba(20,30,60,.6)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(ix, iy, ir + 2.5, 0, 6.2832); ctx.stroke();
      K.pill(ctx, "🔍 중심핵 확대 · 1,500만 ℃", ix, iy + ir + 22, { s: 11.5, a: "center", c: "#ffe3a3", box: [430, SW - 4] });
      K.pill(ctx, "H 4개 → He 1개 + 빛", ix, iy + ir + 46, { s: 11, a: "center", c: "#ffffff", box: [430, SW - 4] });
      /* 층 이름표 */
      lead(ctx, cx + Math.cos(Math.PI * 1.16) * R * .86, cy + Math.sin(Math.PI * 1.16) * R * .86, 150, 136, "대류층", "#ffc9a8", [0, SW]);
      lead(ctx, cx + Math.cos(Math.PI * 1.2) * R * .5, cy + Math.sin(Math.PI * 1.2) * R * .5, 150, 196, "복사층", "#ffe8a3", [0, SW]);
      lead(ctx, cx - R * .1, cy - R * .08, 150, 252, "중심핵 · 수소 핵융합", "#ffffff", [0, SW]);
      /* 지구 */
      var ea = { x: 66, y: 344 };
      if (lit > 0) K.arrow(ctx, { x: cx - R * .72, y: cy + R * .66 }, { x: ea.x + 22, y: ea.y - 8 }, "rgba(245,159,0,.9)", 2.4, 10);
      K.earth(ctx, ea.x, ea.y, 16);
      if (P < 3.724e26) { ctx.fillStyle = "rgba(235,248,255," + clamp((1 - ratio) * 0.8, 0.15, 0.75) + ")"; ctx.beginPath(); ctx.arc(ea.x, ea.y, 16, 0, 6.2832); ctx.fill(); }
      if (P > 3.876e26) { ctx.fillStyle = "rgba(255,90,60," + clamp((ratio - 1) * 0.6, 0.2, 0.6) + ")"; ctx.beginPath(); ctx.arc(ea.x, ea.y, 16, 0, 6.2832); ctx.fill(); }
      K.pill(ctx, "지구", ea.x, 386, { s: 11, a: "center", c: "#bfe6ff", box: [0, SW] });
      K.warn(ctx, SW - 14, H - 10, "⚠ 원자핵·지구의 크기는 실제 비율이 아님", "right");
      ctx.restore();
      K.bigText(ctx, ok ? "지금의 태양" : (P <= 0 ? "핵융합이 멈춘 태양" : (P < 3.724e26 ? "너무 어두운 태양" : "너무 밝은 태양")), 18, 46, 26, ok ? "#8ff5cf" : "#ffffff");
      K.bigText(ctx, "1초에 수소 " + m.toFixed(1) + "억 톤 → 헬륨", 18, 76, 16, "#ffd35a");
      /* 오른쪽 판정 카드 */
      var CX = SW + 10, x0 = CX + 18, x1 = W - 18, gw = x1 - x0, maxP = 7.6e26, t0 = 3.724e26 / maxP, t1 = 3.876e26 / maxP;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 태양이 1초에 내보내는 에너지");
      lt(ctx, ok ? "실제 태양과 일치" : (P < 3.724e26 ? "실제보다 어둡다" : "실제보다 밝다"), x0, 62, { s: 21, w: "900", c: ok ? LT.green : (P < 3.724e26 ? LT.blue : LT.red) });
      K.row(ctx, "핵융합하는 수소", m.toFixed(1) + "억 톤/초", x0, x1, 96);
      K.row(ctx, "사라지는 질량 Δm", Math.round(m * 70).toLocaleString() + "만 톤/초", x0, x1, 122);
      K.row(ctx, "E = Δm × c²", sci(P, 2) + " J", x0, x1, 148, LT.orange);
      ltrack(ctx, x0, 160, gw, 14, 7);
      ctx.fillStyle = "rgba(15,159,118,.35)"; ctx.fillRect(x0 + gw * t0 - 2, 156, gw * (t1 - t0) + 4, 22);
      lbar(ctx, x0, 162, clamp(P / maxP, .005, 1) * gw, 10, ok ? "#0f9f76" : "#e8590c", ok ? "#63e6be" : "#ffa94d", 5);
      lt(ctx, "초록 칸 = 실제 태양 3.8×10²⁶ J", x0, 194, { s: 10.5, c: LT.mute });
      lt(ctx, "수소 원자핵 4개  4.0292", x0, 222, { s: 11.5, w: "800", c: "#c2255c" });
      lbar(ctx, x0, 228, gw, 12, "#c2255c", "#ff8fab", 4);
      var gapX = x0 + gw * 4.0015 / 4.0292;
      lt(ctx, "헬륨 원자핵 1개  4.0015", x0, 258, { s: 11.5, w: "800", c: LT.violet });
      lbar(ctx, x0, 264, gapX - x0, 12, "#5f3dc4", "#b197fc", 4);
      ctx.save(); ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; ctx.setLineDash([3, 2]); ctx.strokeRect(gapX, 262, Math.max(3, gw * .0277 / 4.0292), 16); ctx.restore();
      lt(ctx, "↑ 줄어든 질량 0.7%가 에너지로", x1, 294, { s: 11.5, w: "800", a: "right", c: LT.orange });
      K.tip(ctx, ok ? "1초마다 약 420만 톤씩 가벼워진다" : (P < 3.724e26 ? "햇빛이 모자라 지구가 식는다" : "햇빛이 넘쳐 지구가 뜨거워진다"), x0 - 4, 308, gw + 4, ok);
      if (m > 0) lt(ctx, "중심부 수소를 다 쓰는 데 " + years(M_SUN * 0.1 / (m * 1e11) / YEAR), x0, 368, { s: 11, c: LT.mute });
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
      var canvas = $("c-a-flow"), ctx = window.setupCanvas(canvas), mainCtx = ctx, W = canvas._w, H = canvas._h;
      var ph = 0, playing = !REDUCE, off = null;
      var L = 520, D = 240, G = 40, SEA = 360, LEV = G - 4, LK = { x: 200, y: 120, a: 36, b: 27 }, LKZ = G + 18;
      var I = K.iso({ ox: 330, oy: 132, s: 0.6, L: L, D: D }), SW = 612;
      function sm(a, b, v0) { var t = clamp((v0 - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
      function hill(x, y) { return 104 * Math.exp(-(Math.pow((x - 70) / 62, 2) + Math.pow((y - 62) / 56, 2))) + 62 * Math.exp(-(Math.pow((x - 168) / 48, 2) + Math.pow((y - 34) / 40, 2))); }
      function lake(x, y) { return Math.pow((x - LK.x) / LK.a, 2) + Math.pow((y - LK.y) / LK.b, 2); }
      function zOf(x, y) {
        var z = G + hill(x, y) + 2 * Math.sin(x / 13 + y / 17), lk = lake(x, y);
        if (lk < 1.7) z = lerp(G + 13, z, sm(1, 1.7, lk));
        return lerp(z, G - 20, sm(SEA - 24, SEA + 12, x));
      }
      function colOf(x, y, z, l) {
        if (z < G - 2) return K.tint("#d8c393", l);
        if (z > G + 84) return K.tint("#f2f5f9", l);
        if (z > G + 50) return K.tint("#9c8a72", l);
        if (x > 120 && x < 330 && y > 150) return K.tint("#3f8f3a", l);
        return K.tint(z < G + 3 && x > SEA - 40 ? "#d9c99a" : "#79b85a", l);
      }
      var TREES = (function () { var R = K.rng(9), a = []; while (a.length < 26) { var x = 128 + R() * 200, y = 156 + R() * 78; if (lake(x, y) > 1.8) a.push([x, y]); } return a.sort(function (p, q) { return (p[0] + p[1]) - (q[0] + q[1]); }); })();
      var MILLS = [[338, 22], [336, 66], [342, 196]];
      var RIVER = []; (function () { for (var x = LK.x + LK.a; x <= SEA - 6; x += 6) RIVER.push([x, LK.y + 6 + 10 * Math.sin((x - 230) / 30)]); })();
      function cache() {
        off = document.createElement("canvas"); off.width = canvas.width; off.height = canvas.height;
        var dpr = canvas.width / W; ctx = off.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        K.studio(ctx, 0, 0, SW, H, { x: 390, y: 372, rx: 250, ry: 30 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, SW, H, 14); ctx.clip();
        I.field(ctx, zOf, colOf, 60, 28, function (c, x0, y0, x1, y1, zMax, zMin) {
          var xc = (x0 + x1) / 2, yc = (y0 + y1) / 2;
          if (zMin < LEV) I.quad(c, I.P(x0, y0, LEV), I.P(x1, y0, LEV), I.P(x1, y1, LEV), I.P(x0, y1, LEV), "rgba(40,140,215,.72)");
          else if (lake(xc, yc) < 1.15 && zMin < LKZ) I.quad(c, I.P(x0, y0, LKZ), I.P(x1, y0, LKZ), I.P(x1, y1, LKZ), I.P(x0, y1, LKZ), "rgba(60,150,220,.85)");
        });
        ["front", "right"].forEach(function (side) {
          var zf = side === "front" ? function (u) { return zOf(u, D); } : function (u) { return zOf(L, u); };
          I.face(ctx, side, function (Lw) {
            I.profile(ctx, side, zf, 0); ctx.save(); ctx.clip();
            var rg = ctx.createLinearGradient(0, 0, 0, G + 40); rg.addColorStop(0, "#5b4636"); rg.addColorStop(1, "#a7825a");
            ctx.fillStyle = rg; ctx.fillRect(0, 0, Lw, 300);
            ctx.strokeStyle = "rgba(255,240,220,.2)"; ctx.lineWidth = 1;
            for (var z = 6; z < G + 70; z += 7) { ctx.beginPath(); ctx.moveTo(0, z); ctx.lineTo(Lw, z + 2); ctx.stroke(); }
            if (side === "front") {
              ctx.fillStyle = "#18181d"; ctx.beginPath(); ctx.moveTo(100, 12); ctx.bezierCurveTo(190, 17, 260, 9, 345, 14); ctx.lineTo(345, 22); ctx.bezierCurveTo(260, 18, 190, 26, 100, 21); ctx.closePath(); ctx.fill();
              ctx.fillStyle = "rgba(255,255,255,.25)"; for (var q = 0; q < 40; q++) ctx.fillRect(110 + (q * 37) % 230, 14 + (q * 13) % 6, 1.6, 1.2);
            }
            ctx.restore();
          });
        });
        I.water(ctx, LEV, function (u, side) { return side === "front" ? zOf(u, D) : zOf(L, u); }, { surface: false });
        I.shade(ctx, "front", function (u) { return Math.max(zOf(u, D), LEV); });
        I.shade(ctx, "right", function (u) { return Math.max(zOf(L, u), LEV); });
        I.edges(ctx, G, G);
        /* 댐·발전소·강 */
        I.box(ctx, LK.x + LK.a - 4, LK.y - 22, G + 8, LK.x + LK.a + 3, LK.y + 22, LKZ + 4, "#eef0f3", "#cfd4db", "#a9b0ba");
        I.box(ctx, LK.x + LK.a + 6, LK.y + 4, zOf(LK.x + LK.a + 9, LK.y + 10), LK.x + LK.a + 20, LK.y + 18, zOf(LK.x + LK.a + 9, LK.y + 10) + 10, "#f1ede6", "#d9cfc0", "#b5a893");
        ctx.strokeStyle = "rgba(40,130,210,.9)"; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.beginPath();
        RIVER.forEach(function (p, i) { var s = I.P(p[0], p[1], zOf(p[0], p[1]) + .5); if (i) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y); }); ctx.stroke();
        TREES.forEach(function (t, i) { I.tree(ctx, t[0], t[1], zOf(t[0], t[1]), 0.8 + (i % 3) * .12); });
        [[300, 96], [316, 120], [296, 142]].forEach(function (h) { I.house(ctx, h[0], h[1], zOf(h[0], h[1]), 10, 9, 8); });
        ctx.restore();
        ctx = mainCtx;
      }
      function draw() {
        if (!off || off.width !== canvas.width) cache();
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(off, 0, 0, W, H);
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, SW, H, 14); ctx.clip();
        var sun = { x: 82, y: 118 }, i;
        K.sun(ctx, sun.x, sun.y, 22);
        K.planet(ctx, sun.x, sun.y, 20, "#fff3bf", "#f59f00");
        /* 들어오는 햇빛 */
        var tg = [I.P(90, 70, zOf(90, 70)), I.P(230, 200, zOf(230, 200) + 4), I.P(440, 130, LEV)];
        tg.forEach(function (p, k) { var a0 = { x: sun.x + 18, y: sun.y + 8 + k * 6 }; K.arrow(ctx, a0, p, "rgba(245,159,0,.85)", 2.6, 10); flowDots(ctx, [a0, p], ph + k * .3, 3, "rgba(255,220,120,.95)", 2); });
        /* 파도·바람결 */
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.2;
        for (i = 0; i < 12; i++) { var gx = SEA + 12 + ((i * .37 + ph * .2) % 1) * (L - SEA - 20), gy = 10 + ((i * .618) % 1) * (D - 20), s1 = I.P(gx - 8, gy, LEV), s2 = I.P(gx + 6, gy, LEV); ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.quadraticCurveTo((s1.x + s2.x) / 2, s1.y - 2.5, s2.x, s2.y); ctx.stroke(); }
        for (i = 0; i < 6; i++) { var su = (ph * 1.4 + i / 6) % 1, wy = 30 + i * 34, a1 = I.P(L - su * 200, wy, G + 30), a2 = I.P(L - su * 200 - 30, wy, G + 30); ctx.strokeStyle = "rgba(28,126,214," + (0.7 * Math.sin(su * Math.PI)).toFixed(2) + ")"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke(); }
        /* 풍력 발전기 */
        MILLS.forEach(function (mq, k) { windmill(ctx, I.P(mq[0], mq[1], zOf(mq[0], mq[1])), 46, 26, ph * 25 + k); });
        /* 증발 → 구름 → 비 */
        var c1 = I.P(84, 66, G + 150), c2 = I.P(230, 40, G + 150);
        for (i = 0; i < 6; i++) { var eu = (ph * .8 + i / 6) % 1, e0 = I.P(430 + (i % 3) * 20, 120 + i * 10, LEV); K.glow(ctx, lerp(e0.x, c2.x + 20, eu) + Math.sin(eu * 12 + i) * 4, lerp(e0.y, c2.y + 12, eu), 1.8, "rgba(12,133,153,.9)", 2.4); }
        ctx.strokeStyle = "rgba(28,100,190,.7)"; ctx.lineWidth = 1.3;
        for (i = 0; i < 16; i++) { var ru = (ph * 2.2 + i * .137) % 1, rx = c1.x - 26 + (i * 37 % 52), ry0 = c1.y + 14 + ru * 60; ctx.beginPath(); ctx.moveTo(rx, ry0); ctx.lineTo(rx - 2, ry0 + 7); ctx.stroke(); }
        puffCloud(ctx, c1.x, c1.y, 1.05, true); puffCloud(ctx, c2.x, c2.y, .95, false);
        /* 반사(약 30) */
        K.arrow(ctx, { x: c1.x + 20, y: c1.y - 18 }, { x: c1.x + 58, y: 18 }, "rgba(92,112,134,.9)", 2.4, 10);
        /* 강물 */
        flowDots(ctx, RIVER.map(function (p) { return I.P(p[0], p[1], zOf(p[0], p[1]) + 1); }), ph * 1.5, 6, "rgba(28,126,214,.95)", 1.8);
        /* 열 → 우주로 */
        ctx.strokeStyle = "rgba(224,49,49,.55)"; ctx.lineWidth = 1.6;
        [[250, 205], [300, 230], [470, 200]].forEach(function (hq, k) { var b0 = I.P(hq[0], hq[1], zOf(hq[0], hq[1]) + 6); ctx.beginPath(); for (var yy = 0; yy <= 34; yy += 3) ctx.lineTo(b0.x + 3 * Math.sin(yy / 4 + ph * 12 + k), b0.y - yy - 6 * ((ph * 2 + k * .3) % 1)); ctx.stroke(); });
        ctx.restore();
        /* 이름표 */
        var BX = [0, SW];
        K.pill(ctx, "태양 복사 에너지 100", sun.x, sun.y + 52, { s: 11.5, a: "center", c: "#ffe3a3", box: BX });
        K.pill(ctx, "반사 약 30 → 우주로", c1.x + 66, 30, { s: 11.5, c: "#e8ecff", box: BX });
        lead(ctx, LK.x * 0 + I.P(LK.x, LK.y, LKZ).x, I.P(LK.x, LK.y, LKZ).y, 214, 200, "물의 순환 → 위치 에너지 (수력)", "#bfe6ff", BX);
        lead(ctx, I.P(230, 205, zOf(230, 205)).x, I.P(230, 205, zOf(230, 205)).y - 6, 214, 290, "광합성 → 화학 에너지", "#c3f0b0", BX);
        lead(ctx, I.P(230, D, 17).x, I.P(230, D, 17).y, 214, 332, "화석 연료 (옛 광합성)", "#e9ecef", BX);
        var mh = I.P(MILLS[0][0], MILLS[0][1], zOf(MILLS[0][0], MILLS[0][1]));
        lead(ctx, mh.x, mh.y - 46, mh.x + 54, mh.y - 92, "바람 → 운동 에너지 (풍력)", "#bfe6ff", BX);
        K.pill(ctx, "증발 → 구름 → 비", c2.x + 44, c2.y + 4, { s: 11.5, c: "#c5f6fa", box: BX });
        K.pill(ctx, "열 → 지구 복사로 우주로", 600, 300, { s: 11.5, a: "right", c: "#ffc9c9", box: BX });
        K.warn(ctx, SW - 14, H - 10, "⚠ 높이·크기는 보기 쉽게 과장", "right");
        K.bigText(ctx, "햇빛 100 → 반사 30 · 흡수 70", 18, 46, 23, "#ffffff");
        K.bigText(ctx, "형태를 바꾸며 흐르다 결국 열로", 18, 74, 15, "#ffd35a");
        /* 오른쪽 카드 */
        var CX = SW + 10, x0 = CX + 18, x1 = W - 18;
        K.card(ctx, CX, 0, W - CX, H, "지구에 온 햇빛 100은 어디로");
        K.row(ctx, "반사 (구름·얼음·땅)", "약 30", x0, x1, 62);
        K.row(ctx, "흡수 (대기·지표·바다)", "약 70", x0, x1, 88, LT.orange);
        [[LT.red, "● 열에너지", "대기·지표를 데움 → 우주로 방출"], [LT.blue, "● 운동 에너지", "바람·해류·파도 → 풍력·파력 발전"],
         [LT.teal, "● 위치 에너지", "물의 순환 → 수력 발전"], [LT.green, "● 화학 에너지 (빛의 0.1% 미만)", "광합성 → 먹이·장작·화석 연료"]].forEach(function (r, k) {
          lt(ctx, r[1], x0, 126 + k * 48, { s: 12.5, w: "900", c: r[0] }); lt(ctx, r[2], x0 + 12, 144 + k * 48, { s: 11, c: LT.mute });
        });
        K.tip(ctx, "거슬러 오르면 모두 태양에서 왔다", x0 - 4, 318, x1 - x0 + 4, true);
        lt(ctx, "태양이 근원이 아닌 것: 지열·조력·핵에너지", x0, 380, { s: 10.5, c: LT.mute });
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
        var SW = 600, s1 = a, s2 = s1 * b / 100, s3 = s2 * c / 100, need = 100 / s3, ok = need >= 190000 && need <= 210000;
        K.studio(ctx, 0, 0, SW, H, { x: 300, y: 304, rx: 300, ry: 22 });
        /* 계단 블록: 대기 밖 햇빛 → 지표 → 식물 → 석탄층 → 발전소. 블록 높이 = 남은 에너지(로그 눈금) */
        var st = [{ n: "대기 밖 햇빛", p: 100, c: "#ffd43b" }, { n: "지표에 도달", p: s1, c: "#c8a46a", m: "× " + a + "%" },
          { n: "식물이 저장", p: s2, c: "#69b34c", m: "× " + b.toFixed(1) + "%" }, { n: "석탄층", p: s3, c: "#3a3a42", m: "× " + c.toFixed(2) + "%" }];
        var FY = 300, BW = 92, GAP = 22, DX = 22, DY = 15, X0 = 26;
        function hOf(p) { return clamp(20 + 170 * (Math.log(p) / Math.LN10 + 5) / 7, 16, 200); }
        function obox(x, h, top, front, side) {
          ctx.fillStyle = front; ctx.fillRect(x, FY - h, BW, h);
          ctx.fillStyle = side; ctx.beginPath(); ctx.moveTo(x + BW, FY - h); ctx.lineTo(x + BW + DX, FY - h - DY); ctx.lineTo(x + BW + DX, FY - DY); ctx.lineTo(x + BW, FY); ctx.closePath(); ctx.fill();
          ctx.fillStyle = top; ctx.beginPath(); ctx.moveTo(x, FY - h); ctx.lineTo(x + BW, FY - h); ctx.lineTo(x + BW + DX, FY - h - DY); ctx.lineTo(x + DX, FY - h - DY); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, FY - h); ctx.lineTo(x + BW, FY - h); ctx.lineTo(x + BW + DX, FY - h - DY); ctx.moveTo(x + BW, FY - h); ctx.lineTo(x + BW, FY); ctx.stroke();
        }
        var hs = st.map(function (s) { return hOf(s.p); }), xs = st.map(function (s, i) { return X0 + i * (BW + GAP); });
        floorShadow(ctx, 300, FY + 4, 290, 16, .2);
        /* 해(왼쪽 위) */
        var sunX = xs[0] + 30, sunY = FY - hs[0] - 58;
        K.sun(ctx, sunX, sunY, 16); K.planet(ctx, sunX, sunY, 16, "#fff3bf", "#f59f00");
        /* ① 대기 밖 햇빛: 빛 덩어리(반투명 노란 블록) */
        obox(xs[0], hs[0], "rgba(255,236,153,.95)", "rgba(255,212,59,.85)", "rgba(240,170,20,.85)");
        ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 2; for (var q = 0; q < 5; q++) { var qx = xs[0] + 10 + q * 18; ctx.beginPath(); ctx.moveTo(qx, FY - hs[0] + 8); ctx.lineTo(qx - 8, FY - 6); ctx.stroke(); }
        /* ② 지표: 흙 블록 + 반사되는 빛(위로 튀는 회색 화살표) */
        obox(xs[1], hs[1], "#e9d8a6", "#a07d52", "#7d5f3c");
        var nIn = Math.round(2 + a / 18), nOut = Math.round((100 - a) / 18);
        for (q = 0; q < nIn; q++) { var ix = xs[1] + 12 + q * (BW - 20) / Math.max(1, nIn - 1); K.arrow(ctx, { x: ix - 14, y: FY - hs[1] - 52 }, { x: ix, y: FY - hs[1] - 18 }, "rgba(245,159,0,.9)", 2.2, 7); }
        for (q = 0; q < nOut; q++) { var ox = xs[1] + 16 + q * 15; K.arrow(ctx, { x: ox, y: FY - hs[1] - 22 }, { x: ox + 10, y: FY - hs[1] - 54 - (q % 2) * 8 }, "rgba(134,142,150,.8)", 1.8, 6); }
        /* ③ 식물: 흙 블록 위 풀과 나무(광합성 효율 ∝ 그루 수) */
        obox(xs[2], hs[2], "#8cc46a", "#8a6a48", "#6d523a");
        ctx.fillStyle = "#4f9a3f"; ctx.fillRect(xs[2], FY - hs[2], BW, 5);
        var nTr = Math.round(1 + b * 2), Rt = K.rng(11);
        for (q = 0; q < nTr; q++) {
          var tx = xs[2] + 8 + Rt() * (BW - 8), ty = FY - hs[2] - 2 - Rt() * (DY - 3), tsc = 0.8 + Rt() * .3;
          tx += (FY - hs[2] - ty) / DY * DX * .6;
          ctx.fillStyle = "#6b4a2e"; ctx.fillRect(tx - 1.5, ty - 8 * tsc, 3, 8 * tsc);
          ctx.fillStyle = q % 2 ? "#2f7a2a" : "#3f8f35"; ctx.beginPath(); ctx.moveTo(tx, ty - 28 * tsc); ctx.lineTo(tx + 9 * tsc, ty - 8 * tsc); ctx.lineTo(tx - 9 * tsc, ty - 8 * tsc); ctx.closePath(); ctx.fill();
        }
        /* ④ 석탄층: 암석 블록 속 검은 석탄층(보존 비율 ∝ 두께) */
        obox(xs[3], hs[3], "#a8a29a", "#8c857c", "#6e675f");
        var seam = clamp(4 + 16 * (Math.log(c) / Math.LN10 + 2) / 2, 3, Math.max(4, hs[3] - 8));
        ctx.fillStyle = "#16161a"; ctx.fillRect(xs[3], FY - hs[3] * .5 - seam / 2, BW, seam);
        ctx.beginPath(); ctx.moveTo(xs[3] + BW, FY - hs[3] * .5 - seam / 2); ctx.lineTo(xs[3] + BW + DX, FY - hs[3] * .5 - seam / 2 - DY); ctx.lineTo(xs[3] + BW + DX, FY - hs[3] * .5 + seam / 2 - DY); ctx.lineTo(xs[3] + BW, FY - hs[3] * .5 + seam / 2); ctx.closePath(); ctx.fillStyle = "#0c0c0f"; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1; for (q = 1; q < 4; q++) { ctx.beginPath(); ctx.moveTo(xs[3], FY - hs[3] * q / 4); ctx.lineTo(xs[3] + BW, FY - hs[3] * q / 4); ctx.stroke(); }
        /* ⑤ 발전소: 석탄을 태워 전기로 */
        var px = X0 + 4 * (BW + GAP) - 6;
        obox(px, 10, "#ced4da", "#adb5bd", "#868e96");
        ctx.fillStyle = "#e9ecef"; ctx.fillRect(px + 8, FY - 46, 40, 36); ctx.fillStyle = "#c3cad3"; ctx.beginPath(); ctx.moveTo(px + 48, FY - 46); ctx.lineTo(px + 58, FY - 53); ctx.lineTo(px + 58, FY - 17); ctx.lineTo(px + 48, FY - 10); ctx.fill();
        ctx.fillStyle = "#c92a2a"; ctx.fillRect(px + 14, FY - 82, 7, 36);
        cyl(ctx, px + 72, FY - 58, FY - 12, 13, 4, "#dee2e6", "#f8f9fa", "#adb5bd", "#ced4da");
        puffCloud(ctx, px + 22, FY - 98, .4, true);
        /* 단계 사이: 남은 에너지 띠(점점 가늘어짐) + 곱하는 효율 */
        for (var i = 0; i < 4; i++) {
          var x1 = xs[i] + BW + DX - 4, y1 = FY - hs[i] - DY / 2, nx = i < 3 ? xs[i + 1] + 6 : px + 10, ny = i < 3 ? FY - hs[i + 1] - DY / 2 : FY - 50;
          if (i === 3) K.arrow(ctx, { x: xs[3] + BW + DX - 2, y: FY - hs[3] * .5 - DY }, { x: px + 6, y: FY - 30 }, "rgba(40,40,46,.85)", 2.4, 8);
          if (i < 3) K.pill(ctx, st[i + 1].m, (x1 + nx) / 2, Math.min(y1, ny) - 26, { s: 12.5, a: "center", c: ["#ffd8a8", "#d3f9d8", "#e9ecef"][i], box: [0, SW] });
        }
        /* 블록 앞면 이름·값 */
        st.forEach(function (s, k) {
          var dark = k === 0 || k === 1;
          var val = (s.p >= 0.1 ? s.p.toFixed(1) : (s.p >= 0.001 ? s.p.toFixed(4) : s.p.toFixed(6))) + "%";
          var ty2 = FY - Math.min(hs[k], 60) + 22;
          if (hs[k] < 44) { K.pill(ctx, s.n + " " + val, xs[k] + BW / 2, FY + 22, { s: 12, a: "center", c: "#ffffff", box: [0, SW] }); return; }
          lt(ctx, s.n, xs[k] + BW / 2, ty2, { s: 12, w: "900", a: "center", c: dark ? LT.ink : "#ffffff" });
          lt(ctx, val, xs[k] + BW / 2, ty2 + 17, { s: 12, w: "900", a: "center", c: dark ? "#7a4a00" : "#ffe066" });
        });
        lt(ctx, "발전소", px + 40, FY + 22, { s: 12, w: "900", a: "center", c: LT.ink });
        K.bigText(ctx, "햇빛 " + (Math.round(need / 1000) * 1000).toLocaleString() + " J", SW - 14, 44, 24, ok ? "#8ff5cf" : "#ffffff", "right");
        K.bigText(ctx, "→ 화석 연료 1 J", SW - 14, 70, 16, "#ffd35a", "right");
        K.warn(ctx, SW - 14, 98, "⚠ 블록 높이는 로그 눈금", "right");
        var CX = SW + 12, cx0 = CX + 18, cx1 = W - 18;
        K.card(ctx, CX, 0, W - CX, H, "판정 · 화석 연료 1 J에 든 햇빛");
        lt(ctx, "햇빛 약 " + (Math.round(need / 1000) * 1000).toLocaleString() + " J", cx0, 62, { s: 20, w: "900", c: ok ? LT.green : LT.orange });
        K.row(ctx, "남는 비율", s3.toFixed(6) + "%", cx0, cx1, 94);
        K.row(ctx, "조사한 값", "약 20만 J", cx0, cx1, 118);
        K.tip(ctx, ok ? "조사한 값과 일치합니다" : "효율이 곱해지며 급격히 줄어든다", cx0 - 4, 132, cx1 - cx0 + 4, ok);
        /* 작은 로그 막대(카드 안) */
        st.forEach(function (s, k) {
          var y = 196 + k * 30, f = clamp((Math.log(s.p) / Math.LN10 + 6) / 8, 0.02, 1);
          lt(ctx, s.n, cx0, y, { s: 12, w: "700", c: LT.mute });
          K.bar(ctx, cx0, y + 6, cx1 - cx0, f, ["#f59f00", "#c8a46a", "#0f9f76", "#495057"][k]);
        });
        lt(ctx, "막대: 로그 눈금 10⁻⁶ ~ 100%", cx0, H - 14, { s: 11, c: LT.mute });
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
    var IN = K.iso({ ox: 124, oy: 122, s: .75, L: 500, D: 130 }), TZ = 20, SW = 600;
    function ring(xc, back, col, lw) {
      ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
      for (var k = 0; k <= 24; k++) { var a = Math.PI / 2 + (back ? 1 : -1) * k / 24 * Math.PI, p = IN.P(xc, 65 + 34 * Math.cos(a), TZ + 40 + 34 * Math.sin(a)); if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var turns = 6 * N, i, mx = lerp(0, 230, x / 100), fx = flux(x);
      K.studio(ctx, 0, 0, SW, H, { x: 250, y: 300, rx: 260, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, SW, H, 14); ctx.clip();
      /* 나무 실험대 */
      IN.box(ctx, 0, 0, 0, 500, 130, TZ, "#c99a63", "#a8743f", "#8a5d31");
      IN.face(ctx, "front", function (Lw) { ctx.strokeStyle = "rgba(90,50,20,.35)"; ctx.lineWidth = 1; for (var z = 4; z < TZ; z += 5) { ctx.beginPath(); ctx.moveTo(0, z); ctx.lineTo(Lw, z); ctx.stroke(); } });
      var sh = IN.P(250, 65, TZ); floorShadow(ctx, sh.x + 30, sh.y + 4, 150, 22, .18);
      /* 자기력선 */
      var mcp = IN.P(mx + 75, 65, TZ + 40);
      ctx.save(); ctx.setLineDash([5, 5]); ctx.lineWidth = 1.2;
      for (i = 0; i < 3; i++) { ctx.strokeStyle = "rgba(112,72,232," + (0.5 - i * .13).toFixed(2) + ")"; ctx.beginPath(); ctx.ellipse(mcp.x, mcp.y, 82 + i * 20, 26 + i * 13, Math.PI / 6, 0, 6.2832); ctx.stroke(); }
      ctx.restore();
      /* 코일 받침과 코일 뒤쪽 반 */
      [256, 364].forEach(function (sx) { IN.box(ctx, sx - 5, 46, TZ, sx + 5, 84, TZ + 7, "#d8b27e", "#b8874f", "#946a3b"); });
      for (i = 0; i < turns; i++) ring(250 + (i + .5) / turns * 120, true, "#8a4a1c", 3);
      /* 막대자석 (S | N) */
      IN.box(ctx, mx, 52, TZ + 27, mx + 75, 78, TZ + 53, "#74c0fc", "#1c7ed6", "#1864ab");
      IN.box(ctx, mx + 75, 52, TZ + 27, mx + 150, 78, TZ + 53, "#ff8787", "#e03131", "#a51111");
      var ps = IN.P(mx + 37, 78, TZ + 36), pn = IN.P(mx + 112, 78, TZ + 36);
      K.t(ctx, "S", ps.x, ps.y + 6, { s: 16, w: "900", c: "#ffffff", a: "center" }); K.t(ctx, "N", pn.x, pn.y + 6, { s: 16, w: "900", c: "#ffffff", a: "center" });
      /* 코일 앞쪽 반 (구리) */
      for (i = 0; i < turns; i++) ring(250 + (i + .5) / turns * 120, false, i % 2 ? "#e9a060" : "#d9853f", 3.2);
      /* 검류계 */
      IN.box(ctx, 410, 30, TZ, 490, 100, TZ + 74, "#59627e", "#363d58", "#252b40");
      onPlane(ctx, IN, 100, function () {
        ctx.fillStyle = "#f8f9fb"; ctx.beginPath(); ctx.roundRect(416, TZ + 10, 68, 58, 4); ctx.fill();
        ctx.strokeStyle = "#5c7086"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(450, TZ + 18, 38, Math.PI * .2, Math.PI * .8); ctx.stroke();
        for (var t = -2; t <= 2; t++) { var an = Math.PI / 2 - t * .3; ctx.beginPath(); ctx.moveTo(450 + 34 * Math.cos(an), TZ + 18 + 34 * Math.sin(an)); ctx.lineTo(450 + 41 * Math.cos(an), TZ + 18 + 41 * Math.sin(an)); ctx.stroke(); }
        var ang = Math.PI / 2 - clamp(g, -50, 50) / 50 * .6;
        ctx.strokeStyle = "#e03131"; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(450, TZ + 18); ctx.lineTo(450 + 36 * Math.cos(ang), TZ + 18 + 36 * Math.sin(ang)); ctx.stroke(); ctx.lineCap = "butt";
        ctx.fillStyle = "#12203a"; ctx.beginPath(); ctx.arc(450, TZ + 18, 3, 0, 6.2832); ctx.fill();
      });
      /* 도선 */
      var w1 = [IN.P(252, 99, TZ + 40), IN.P(252, 118, TZ + 1), IN.P(395, 118, TZ + 1), IN.P(418, 100, TZ + 26)];
      var w2 = [IN.P(368, 99, TZ + 40), IN.P(368, 110, TZ + 1), IN.P(400, 110, TZ + 1), IN.P(482, 100, TZ + 26)];
      [w1, w2].forEach(function (wp) { ctx.strokeStyle = "#c9773a"; ctx.lineWidth = 2.4; ctx.beginPath(); wp.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke(); });
      eph += g * 0.0025;
      if (Math.abs(g) >= 0.5) { var nE = Math.round(clamp(Math.abs(g) / 5, 2, 8)); flowDots(ctx, w1, eph, nE, "rgba(28,126,214,.95)", 2); flowDots(ctx, w2, -eph, nE, "rgba(28,126,214,.95)", 2); }
      ctx.restore();
      var gp = IN.P(450, 100, TZ + 74);
      lead(ctx, gp.x, gp.y, gp.x + 26, gp.y - 44, "검류계 " + (g > 0 ? "+" : (g < 0 ? "−" : "")) + Math.abs(Math.round(g)) + "칸", Math.abs(g) >= 10 ? "#ffd35a" : "#e8ecff", [0, SW]);
      var cp = IN.P(310, 99, TZ + 74);
      lead(ctx, cp.x, cp.y, cp.x - 20, cp.y - 58, "코일 " + N * 100 + "회 감음", "#ffd9a8", [0, SW]);
      var mp = IN.P(mx + 40, 78, TZ + 27);
      lead(ctx, mp.x, mp.y, mp.x - 24, mp.y + 74, "막대자석", "#ffc9c9", [0, SW]);
      K.bigText(ctx, Math.abs(g) >= 10 ? (g > 0 ? "넣는 순간: 바늘이 + 쪽!" : "빼는 순간: 바늘이 − 쪽!") : (Math.abs(g) >= 0.5 ? "바늘이 조금 움직인다" : "자석이 멈추면 바늘은 0"), 18, 44, 24, "#ffffff");
      K.bigText(ctx, "최대 흔들림 " + Math.round(peak) + "칸", 18, 72, 16, "#ffd35a");
      K.warn(ctx, SW - 14, H - 10, "⚠ 전류는 실제보다 느리게 그렸습니다", "right");
      /* 판정 카드 */
      var CX = SW + 10, x0 = CX + 18, x1 = W - 18;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 코일에 전류가 흐를까");
      lt(ctx, Math.abs(g) >= 0.5 ? "흐른다 (" + (g > 0 ? "+" : "−") + " 방향)" : "흐르지 않는다", x0, 62, { s: 21, w: "900", c: Math.abs(g) >= 0.5 ? LT.blue : LT.mute });
      K.row(ctx, "자석 위치", x < 35 ? "코일 밖" : (x < 80 ? "코일 입구" : "코일 속"), x0, x1, 98);
      K.row(ctx, "코일을 지나는 자기장", Math.round(fx * 100) + "%", x0, x1, 126);
      K.bar(ctx, x0, 136, x1 - x0, fx, LT.violet);
      K.row(ctx, "코일 감은 수", N * 100 + "회", x0, x1, 176);
      K.row(ctx, "이번 최대 흔들림", Math.round(peak) + "칸", x0, x1, 202, peak >= 10 ? LT.orange : LT.ink);
      K.tip(ctx, Math.abs(g) >= 0.5 ? "자기장이 변하는 동안만 흐른다" : (x >= 80 ? "자기장은 크지만 변하지 않는다" : "자석을 빠르게 움직여 보세요"), x0 - 4, 218, x1 - x0 + 4, Math.abs(g) >= 0.5 ? true : (x >= 80 ? false : null));
      lt(ctx, (got.p ? "✓" : "○") + " 넣을 때 바늘 +10칸 이상", x0, 286, { s: 11.5, w: "800", c: got.p ? LT.green : LT.mute });
      lt(ctx, (got.m ? "✓" : "○") + " 뺄 때 바늘 −10칸 이상", x0, 310, { s: 11.5, w: "800", c: got.m ? LT.green : LT.mute });
      lt(ctx, (got.z ? "✓" : "○") + " 코일 속에서 가만히 두기", x0, 334, { s: 11.5, w: "800", c: got.z ? LT.green : LT.mute });
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
    var IG = K.iso({ ox: 205, oy: 196, s: .75, L: 300, D: 200 });
    function circ(xc, yc, zc, r, axis) { var pts = []; for (var k = 0; k <= 28; k++) { var a = k / 28 * 6.2832; pts.push(axis === "y" ? IG.P(xc + r * Math.cos(a), yc, zc + r * Math.sin(a)) : IG.P(xc, yc + r * Math.cos(a), zc + r * Math.sin(a))); } return pts; }
    function path(pts, col, lw, close) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); pts.forEach(function (p, k) { if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); if (close) ctx.closePath(); ctx.stroke(); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var V = genVolt(N, B, f), okV = V >= 210 && V <= 230, okF = f >= 59 && f <= 61, bs = lerp(.35, 1, (B - 0.1) / 0.9), k, c = Math.cos(th), s = Math.sin(th);
      K.studio(ctx, 0, 0, W, H, { x: 240, y: 360, rx: 220, ry: 30 });
      /* 받침판 */
      IG.box(ctx, 0, 0, 0, 300, 200, 10, "#e3e8ee", "#b8c0ca", "#97a1ad");
      /* 터빈(돌리는 쪽) */
      var tc = IG.P(150, 14, 80);
      path(circ(150, 14, 80, 30, "y"), "rgba(92,112,134,.9)", 2, true);
      for (k = 0; k < 6; k++) { var an = th + k * Math.PI / 3, tp = IG.P(150 + 28 * Math.cos(an), 14, 80 + 28 * Math.sin(an)); ctx.strokeStyle = "#7a8496"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tc.x, tc.y); ctx.lineTo(tp.x, tp.y); ctx.stroke(); }
      /* N극 */
      IG.box(ctx, 20, 50, 10, 80, 150, 150, "#ff8787", "#e03131", "#c92a2a");
      var pN = IG.P(50, 150, 82); K.t(ctx, "N", pN.x, pN.y + 8, { s: 22, w: "900", c: "#ffffff", a: "center" });
      /* 자기장 */
      [75, 125].forEach(function (yy) { [45, 80, 115].forEach(function (zz) { K.arrow(ctx, IG.P(84, yy, zz), IG.P(216, yy, zz), "rgba(112,72,232," + (0.25 + 0.5 * bs).toFixed(2) + ")", 1.3, 8); }); });
      /* 회전축·코일 */
      path([IG.P(150, 10, 80), IG.P(150, 196, 80)], "#6b7380", 4);
      var A = IG.P(150 + 46 * c, 65, 80 + 46 * s), Bq = IG.P(150 + 46 * c, 135, 80 + 46 * s), Cq = IG.P(150 - 46 * c, 135, 80 - 46 * s), Dq = IG.P(150 - 46 * c, 65, 80 - 46 * s);
      ctx.fillStyle = "rgba(217,133,63,.16)"; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(Bq.x, Bq.y); ctx.lineTo(Cq.x, Cq.y); ctx.lineTo(Dq.x, Dq.y); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.shadowColor = "rgba(150,70,20,.4)"; ctx.shadowBlur = 3; path([A, Bq, Cq, Dq], "#d9853f", clamp(N / 60, 2, 6.5), true); ctx.restore();
      path([A, Bq], "#f0b070", 1.2); 
      /* 슬립 링과 브러시 */
      [152, 164].forEach(function (yy) { path(circ(150, yy, 80, 9, "y"), "#c9a227", 3.4, true); var b0 = IG.P(150, yy, 66), b1 = IG.P(150, yy, 12); ctx.strokeStyle = "#343a40"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); });
      var wA = [IG.P(150, 152, 12), IG.P(300, 152, 11)], wB = [IG.P(150, 164, 12), IG.P(300, 164, 11)];
      path(wA, "#c9773a", 2.2); path(wB, "#c9773a", 2.2);
      if (V > 1) { flowDots(ctx, wA, th / 6, 4, "rgba(28,126,214,.95)", 2); flowDots(ctx, wB, -th / 6, 4, "rgba(28,126,214,.95)", 2); }
      /* S극 (앞쪽이라 반투명) */
      ctx.save(); ctx.globalAlpha = .55; IG.box(ctx, 220, 50, 10, 280, 150, 150, "#a5d8ff", "#4dabf7", "#1c7ed6"); ctx.restore();
      var e1 = IG.P(220, 150, 150), e2 = IG.P(280, 150, 150), e3 = IG.P(280, 150, 10), e4 = IG.P(220, 150, 10);
      ctx.strokeStyle = "rgba(24,100,171,.8)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(e4.x, e4.y); ctx.lineTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y); ctx.lineTo(e3.x, e3.y); ctx.stroke();
      var pS = IG.P(250, 150, 82); K.t(ctx, "S", pS.x, pS.y + 8, { s: 22, w: "900", c: "#ffffff", a: "center" });
      lead(ctx, tc.x, tc.y, tc.x + 40, tc.y - 66, "터빈이 축을 돌린다", "#e8ecff", [0, 436]);
      var cp = IG.P(150 - 46 * c, 100, 80 - 46 * s);
      lead(ctx, cp.x, cp.y, 34, 150, "코일 " + N + "회", "#ffd9a8", [0, 436]);
      var rp = IG.P(150, 164, 89);
      lead(ctx, rp.x, rp.y, rp.x + 64, rp.y + 34, "슬립 링 → 전등", "#e8ecff", [0, 436]);
      /* 축 방향에서 본 단면 */
      var ix = 62, iy = 340, ir = 40;
      ctx.save(); ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 6.2832); ctx.clip();
      ctx.fillStyle = "#f8f9fb"; ctx.fillRect(ix - ir, iy - ir, ir * 2, ir * 2);
      ctx.fillStyle = "#e03131"; ctx.fillRect(ix - ir, iy - ir, 16, ir * 2); ctx.fillStyle = "#1c7ed6"; ctx.fillRect(ix + ir - 16, iy - ir, 16, ir * 2);
      for (k = -1; k <= 1; k++) K.arrow(ctx, { x: ix - 22, y: iy + k * 13 }, { x: ix + 22, y: iy + k * 13 }, "rgba(112,72,232,.6)", 1, 5);
      var dx = 17 * c, dy = -17 * s;
      ctx.strokeStyle = "#d9853f"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ix - dx, iy - dy); ctx.lineTo(ix + dx, iy + dy); ctx.stroke();
      K.planet(ctx, ix + dx, iy + dy, 4, "#ffd8a8", "#a35a24"); K.planet(ctx, ix - dx, iy - dy, 4, "#ffd8a8", "#a35a24");
      ctx.restore();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(ix, iy, ir, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "rgba(20,30,60,.55)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(ix, iy, ir + 2, 0, 6.2832); ctx.stroke();
      K.pill(ctx, "축 방향 단면", ix + ir + 8, iy + ir - 2, { s: 11, c: "#e8ecff", box: [0, 436] });
      K.bigText(ctx, Math.round(V) + " V · " + f + " Hz", 18, 44, 26, okV && okF ? "#8ff5cf" : "#ffffff");
      K.bigText(ctx, okV && okF ? "220 V · 60 Hz 완성!" : "목표 220 V · 60 Hz", 18, 72, 16, "#ffd35a");
      K.warn(ctx, 432, H - 10, "⚠ 회전은 실제보다 느리게", "right");
      /* 전압 파형 (밝은 그래프) */
      var g = K.chart(ctx, { x: 444, y: 12, w: 446, h: 214, x0: 0, x1: 0.05, y0: -450, y1: 450, xt: 5, yt: 6, xl: "시간(s)", yl: "전압(V)", xf: function (q) { return q.toFixed(2); }, light: true });
      ctx.save(); ctx.strokeStyle = "rgba(15,159,118,.85)"; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      [311, -311].forEach(function (q) { ctx.beginPath(); ctx.moveTo(g.L, g.Y(q)); ctx.lineTo(g.R, g.Y(q)); ctx.stroke(); }); ctx.restore();
      lt(ctx, "220 V 교류의 최댓값 311 V", g.R - 4, g.Y(311) - 6, { s: 10.5, w: "800", a: "right", c: LT.green });
      var vp = Math.min(V * Math.SQRT2, 450), pts = [];
      for (var i = 0; i <= 200; i++) { var tt = 0.05 * i / 200; pts.push([tt, vp * Math.sin(2 * Math.PI * f * tt + th)]); }
      K.plot(ctx, g, pts, LT.violet, { w: 2.4, light: true });
      /* 전압계·전등 카드 */
      var CY = 238, CX = 444, x0 = CX + 18, x1 = W - 18;
      K.card(ctx, CX, CY, W - CX, H - CY - 6, "판정 · 전압계와 전등");
      ctx.fillStyle = "#0b1516"; ctx.beginPath(); ctx.roundRect(x0, CY + 40, 180, 52, 8); ctx.fill();
      var dc = okV ? "#63e6be" : (V > 230 ? "#ff8787" : "#ffd43b");
      ctx.save(); ctx.shadowColor = dc; ctx.shadowBlur = 10; K.t(ctx, Math.round(V) + " V", x0 + 90, CY + 78, { s: 28, w: "900", a: "center", c: dc }); ctx.restore();
      K.row(ctx, "주파수", f + " Hz", x0 + 200, x1 - 70, CY + 58, okF ? LT.green : LT.ink);
      K.row(ctx, "전압 (실횻값)", Math.round(V) + " V", x0 + 200, x1 - 70, CY + 84, okV ? LT.green : (V > 230 ? LT.red : LT.ink));
      var bx = x1 - 26, by = CY + 66, glow = clamp(V / 220, 0, 1.6);
      if (V > 1) K.glow(ctx, bx, by, 8 + 10 * Math.min(glow, 1.4), "rgba(255,200,80," + clamp(glow * 0.6, 0.08, 0.95) + ")", 2.6);
      var bg = ctx.createRadialGradient(bx - 6, by - 8, 2, bx, by, 18); bg.addColorStop(0, glow > .2 ? "#fff9db" : "#f1f3f5"); bg.addColorStop(1, glow > .2 ? "rgba(255,212,59,.7)" : "rgba(200,205,215,.7)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(bx, by, 16, 0, 6.2832); ctx.fill(); ctx.strokeStyle = "rgba(90,100,120,.6)"; ctx.lineWidth = 1.2; ctx.stroke();
      cyl(ctx, bx, by + 14, by + 26, 8, 3, "#ced4da", "#868e96", "#495057", "#dee2e6");
      K.tip(ctx, okV && okF ? "두 조건을 모두 만족 · 송전해 보세요" : (V > 230 ? "과전압! 가전제품이 탑니다" : (okV ? "전압은 맞음 · 주파수를 59~61 Hz로" : (okF ? "주파수는 맞음 · 전압을 210~230 V로" : "목표: 210~230 V, 59~61 Hz"))), x0 - 4, CY + 104, x1 - x0 + 4, okV && okF ? true : (V > 230 ? false : null));
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
    var IB = K.iso({ ox: 250, oy: 134, s: .7, L: 380, D: 210 }), GZ = 14, PSW = 560;
    function ecolL(s) {
      if (s.indexOf("전기") >= 0) return LT.violet; if (s.indexOf("핵") >= 0) return "#5c940d"; if (s.indexOf("화학") >= 0) return LT.orange;
      if (s.indexOf("위치") >= 0) return LT.teal; if (s.indexOf("운동") >= 0) return LT.blue; if (s.indexOf("빛") >= 0) return "#e8a400"; return LT.red;
    }
    function steam(x, y, n, r0, rise, drift, phase, grey) {
      for (var k = 0; k < n; k++) {
        var t = ((k / n + phase) % 1 + 1) % 1, r = r0 * (0.55 + t * 0.9), cx = x + drift * t, cy = y - rise * t, al = 1 - t * .75;
        var g = ctx.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r);
        g.addColorStop(0, "rgba(255,255,255," + (.95 * al).toFixed(2) + ")"); g.addColorStop(1, grey ? "rgba(110,115,125," + (.7 * al).toFixed(2) + ")" : "rgba(170,182,198," + (.7 * al).toFixed(2) + ")");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.fill();
      }
    }
    function coolTower(x, y, hgt) {
      var tb = IB.P(x, y, GZ), tt = IB.P(x, y, GZ + hgt), tm = IB.P(x, y, GZ + hgt * .66);
      var cg = ctx.createLinearGradient(tb.x - 26, 0, tb.x + 26, 0); cg.addColorStop(0, "#f1f3f5"); cg.addColorStop(.55, "#c5c8cc"); cg.addColorStop(1, "#8d9298");
      ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(tb.x - 26, tb.y); ctx.quadraticCurveTo(tm.x - 12, tm.y, tt.x - 16, tt.y); ctx.lineTo(tt.x + 16, tt.y); ctx.quadraticCurveTo(tm.x + 12, tm.y, tb.x + 26, tb.y);
      ctx.ellipse(tb.x, tb.y, 26, 8, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#4b5058"; ctx.beginPath(); ctx.ellipse(tt.x, tt.y, 16, 5, 0, 0, 6.2832); ctx.fill();
      return tt;
    }
    function hall(x0, y0, x1, y1, h, roof) { IB.box(ctx, x0, y0, GZ, x1, y1, GZ + h, roof || "#e9ecef", "#d5d9df", "#b0b7c1"); }
    function plant(sel) {
      var BX = [0, PSW], tt, p, k;
      if (sel === 0 || sel === 1) {
        if (sel === 0) {
          var cc = IB.P(40, 170, GZ), ap = IB.P(40, 170, GZ + 26), coal = ctx.createLinearGradient(ap.x - 30, ap.y, ap.x + 30, cc.y); coal.addColorStop(0, "#5b5b60"); coal.addColorStop(1, "#141418");
          ctx.fillStyle = coal; ctx.beginPath(); ctx.moveTo(cc.x - 36, cc.y); ctx.lineTo(ap.x, ap.y); ctx.lineTo(cc.x + 36, cc.y); ctx.ellipse(cc.x, cc.y, 36, 11, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
          IB.box(ctx, 96, 30, GZ, 110, 44, GZ + 140, "#f1f3f5", "#dee2e6", "#adb5bd");
          IB.box(ctx, 96, 30, GZ + 118, 110, 44, GZ + 128, "#e15a4f", "#d04a40", "#a63a32");
          hall(70, 70, 140, 140, 80, "#cfd4db");
          onPlane(ctx, IB, 140, function () { var g = ctx.createRadialGradient(105, GZ + 26, 2, 105, GZ + 26, 26); g.addColorStop(0, "rgba(255,230,120,1)"); g.addColorStop(1, "rgba(255,110,30,.25)"); ctx.fillStyle = g; ctx.fillRect(82, GZ + 8, 46, 36); });
          var sm1 = IB.P(103, 37, GZ + 140); steam(sm1.x, sm1.y - 2, 4, 5, 30, 16, ph * 1.3, true);
        } else {
          var dc = IB.P(105, 105, GZ), r = 46;
          cyl(ctx, dc.x, dc.y - 62, dc.y, r, r * .4, "#e9ecef", "#ffffff", "#adb5bd", "#f1f3f5");
          var dg = ctx.createRadialGradient(dc.x - 14, dc.y - 90, 4, dc.x, dc.y - 62, r); dg.addColorStop(0, "#ffffff"); dg.addColorStop(1, "#adb5bd");
          ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(dc.x, dc.y - 62, r, r * .4, 0, Math.PI, 0, false); ctx.lineTo(dc.x + r, dc.y - 62); ctx.arc(dc.x, dc.y - 62, r, 0, Math.PI, true); ctx.closePath(); ctx.fill();
          IB.box(ctx, 300, 0, 0, 380, 210, GZ - 3, "#4dabf7", "#1c7ed6", "#1864ab");
          ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.2;
          for (k = 0; k < 6; k++) { var wq = IB.P(312 + (k * 23) % 60, 20 + k * 32, GZ - 3); ctx.beginPath(); ctx.moveTo(wq.x - 8, wq.y); ctx.quadraticCurveTo(wq.x, wq.y - 3, wq.x + 8, wq.y); ctx.stroke(); }
          K.arrow(ctx, IB.P(270, 150, GZ + 4), IB.P(330, 150, GZ - 2), "rgba(224,49,49,.75)", 3, 10);
        }
        hall(150, 70, 255, 140, 48);
        IB.box(ctx, 210, 92, GZ + 48, 244, 118, GZ + 64, "#e2a35c", "#c9853f", "#9b6330");
        if (sel === 0) { tt = coolTower(220, 28, 112); steam(tt.x, tt.y - 4, 6, 9, 46, 30, ph, false); }
        p = IB.P(105, 70, GZ + (sel === 0 ? 80 : 108));
        lead(ctx, p.x, p.y, p.x - 60, p.y - 30, sel === 0 ? "보일러 · 석탄을 태움" : "원자로 · 핵분열의 열", "#ffd9a8", BX);
        p = IB.P(227, 105, GZ + 64); lead(ctx, p.x, p.y, p.x + 60, p.y + 50, "증기 터빈 · 발전기", "#e8ecff", BX);
        if (sel === 0) { p = IB.P(220, 28, GZ + 90); lead(ctx, p.x, p.y, p.x + 60, p.y - 30, "냉각탑 · 남은 열을 버림", "#ffc9c9", BX); }
        else { p = IB.P(340, 120, GZ - 3); lead(ctx, p.x, p.y, p.x + 30, p.y + 50, "바닷물로 식힘(온배수)", "#bfe6ff", BX); }
      } else if (sel === 2) {
        IB.box(ctx, 0, 0, GZ, 150, 210, GZ + 70, "#74c0fc", "rgba(28,126,214,.85)", "rgba(24,100,171,.85)");
        [[0, 0, 150, 30], [0, 180, 150, 210]].forEach(function (q) { IB.box(ctx, q[0], q[1], GZ, q[2], q[3], GZ + 84, "#9c8a72", "#7d6b55", "#5f513f"); });
        IB.box(ctx, 150, 0, GZ, 168, 210, GZ + 84, "#f1f3f5", "#ced4da", "#adb5bd");
        IB.box(ctx, 174, 80, GZ, 228, 140, GZ + 26, "#e9ecef", "#d5d9df", "#b0b7c1");
        IB.box(ctx, 168, 90, GZ - 1, 380, 130, GZ + 1, "#4dabf7", "#1c7ed6", "#1864ab");
        flowDots(ctx, [IB.P(150, 110, GZ + 50), IB.P(176, 110, GZ + 12), IB.P(380, 110, GZ + 2)], ph, 8, "rgba(28,126,214,.95)", 2.2);
        p = IB.P(80, 100, GZ + 70); lead(ctx, p.x, p.y, p.x - 34, p.y - 38, "높은 곳의 물 · 위치 에너지", "#bfe6ff", BX);
        p = IB.P(159, 105, GZ + 84); lead(ctx, p.x, p.y, p.x + 60, p.y - 40, "댐", "#e8ecff", BX);
        p = IB.P(200, 110, GZ + 26); lead(ctx, p.x, p.y, p.x + 60, p.y + 50, "수차(터빈) · 발전기", "#e8ecff", BX);
      } else if (sel === 3) {
        [[60, 60], [170, 40], [280, 70], [120, 160], [250, 170]].forEach(function (q, j) { windmill(ctx, IB.P(q[0], q[1], GZ), 96, 50, rot * 1.6 + j); });
        p = IB.P(170, 40, GZ + 96); lead(ctx, p.x, p.y, p.x + 70, p.y - 20, "날개(터빈) · 발전기", "#e8ecff", BX);
      } else if (sel === 4) {
        for (var ry = 20; ry < 200; ry += 34) for (var rx = 20; rx < 360; rx += 46) {
          var a1 = IB.P(rx, ry, GZ + 4), a2 = IB.P(rx + 40, ry, GZ + 4), a3 = IB.P(rx + 40, ry + 20, GZ + 18), a4 = IB.P(rx, ry + 20, GZ + 18);
          var pg = ctx.createLinearGradient(a1.x, a1.y, a3.x, a3.y); pg.addColorStop(0, "#1c3d78"); pg.addColorStop(.5, "#3b6fc4"); pg.addColorStop(1, "#14305e");
          IB.quad(ctx, a1, a2, a3, a4, pg, "rgba(255,255,255,.55)");
          var m1 = IB.P(rx + 20, ry, GZ + 4), m2 = IB.P(rx + 20, ry + 20, GZ + 18); ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.stroke();
        }
        K.sun(ctx, 470, 70, 14); K.planet(ctx, 470, 70, 13, "#fff3bf", "#f59f00");
        p = IB.P(204, 122, GZ + 12); lead(ctx, p.x, p.y, p.x + 70, p.y + 70, "태양 전지 · 터빈도 발전기도 없다", "#ffe3a3", BX);
      } else {
        IB.face(ctx, "front", function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, GZ); g.addColorStop(0, "#e8590c"); g.addColorStop(.5, "#a0522d"); g.addColorStop(1, "#6d523a");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, GZ);
          ctx.strokeStyle = "#868e96"; ctx.lineWidth = 3; [150, 200].forEach(function (u) { ctx.beginPath(); ctx.moveTo(u, GZ); ctx.lineTo(u, 1); ctx.stroke(); });
        });
        hall(150, 120, 240, 190, 40); tt = coolTower(280, 60, 70); steam(tt.x, tt.y - 4, 5, 7, 36, 22, ph, false);
        for (k = 0; k < 2; k++) { var w0 = IB.P(150 + k * 50, 210, 2); flowDots(ctx, [w0, IB.P(150 + k * 50, 210, GZ)], ph + k * .5, 3, "rgba(255,255,255,.95)", 2); }
        p = IB.P(80, 210, 3); lead(ctx, p.x, p.y, p.x - 30, p.y + 40, "뜨거운 땅속 · 지구 내부 에너지", "#ffc9a8", BX);
        p = IB.P(195, 155, GZ + 40); lead(ctx, p.x, p.y, p.x + 70, p.y - 40, "증기 터빈 · 발전기", "#e8ecff", BX);
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var p = PLANTS[sel], n = p.chain.length, k;
      K.studio(ctx, 0, 0, PSW, H, { x: 280, y: 326, rx: 230, ry: 26 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, PSW, H, 14); ctx.clip();
      IB.box(ctx, 0, 0, 0, 380, 210, GZ, sel === 4 ? "#b9c98e" : "#86b562", "#8a6a48", "#73573b");   /* 얇은 단색 받침(땅속은 지열 발전만 따로 그림) */
      IB.edges(ctx, GZ, GZ);
      plant(sel);
      ctx.restore();
      K.bigText(ctx, p.name + " · 효율 " + p.eff + "%", 18, 44, 25, "#ffffff");
      K.bigText(ctx, sel === 4 ? "빛을 곧바로 전기로" : "무엇으로 터빈을 돌리나", 18, 72, 16, "#ffd35a");
      /* 에너지 전환 띠 */
      var bw = n === 2 ? 200 : (n === 3 ? 158 : 122), gap = (532 - n * bw) / Math.max(1, n - 1), y0 = 346;
      p.chain.forEach(function (c, i) {
        var bx = 14 + i * (bw + gap), col = ecolL(c), ln = c.split("\n");
        ctx.save(); ctx.shadowColor = "rgba(20,30,60,.18)"; ctx.shadowBlur = 6; ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.roundRect(bx, y0, bw, 52, 10); ctx.fill(); ctx.restore();
        ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(bx, y0, 6, 52, [10, 0, 0, 10]); ctx.fill();
        lt(ctx, ln[0], bx + bw / 2 + 3, y0 + 22, { s: 11.5, w: "800", a: "center" });
        if (ln[1]) lt(ctx, ln[1], bx + bw / 2 + 3, y0 + 40, { s: 11.5, w: "900", a: "center", c: col });
        if (i < n - 1) { var a = { x: bx + bw + 3, y: y0 + 26 }, b = { x: bx + bw + gap - 3, y: y0 + 26 }; K.arrow(ctx, a, b, col, 2.4, 8); flowDots(ctx, [a, b], ph + i * .3, 1, col, 1.8); }
      });
      /* 비교 카드 */
      var CX = PSW + 10, x0 = CX + 18, x1 = W - 18, maxV = mode === "eff" ? 100 : 900;
      K.card(ctx, CX, 0, W - CX, H, mode === "eff" ? "비교 · 발전 효율 (%)" : "비교 · 전기 1 kWh당 CO₂ (g)");
      PLANTS.forEach(function (q, i) {
        var y = 48 + i * 32, val = mode === "eff" ? q.eff : q.co2, on = i === sel, bx0 = x0 + 92, bwid = (x1 - 44 - bx0) * val / maxV;
        lt(ctx, q.name, x0, y + 13, { s: 12, w: on ? "900" : "700", c: on ? LT.ink : LT.mute });
        ltrack(ctx, bx0, y, x1 - 44 - bx0, 18, 6);
        lbar(ctx, bx0, y, Math.max(4, bwid), 18, on ? "#d9480f" : (mode === "eff" ? "#0c8599" : "#c92a2a"), on ? "#ffa94d" : (mode === "eff" ? "#66d9e8" : "#ff8787"), 6);
        lt(ctx, val + (mode === "eff" ? "%" : "g"), x1, y + 13, { s: 12, w: "900", a: "right", c: on ? LT.orange : LT.ink });
      });
      K.row(ctx, "섬의 1년 (1,000만 kWh) CO₂", "약 " + (p.co2 * 10).toLocaleString() + "톤", x0, x1, 256, LT.red);
      K.row(ctx, "넣은 에너지 100 중 전기", String(p.eff), x0, x1, 282, LT.green);
      K.tip(ctx, sel === 4 ? "터빈·발전기 없이 전기를 만든다" : "결국 터빈이 발전기를 돌린다", x0 - 4, 296, x1 - x0 + 4, true);
      var ns = 0; seen.forEach(function (s) { if (s) ns++; });
      lt(ctx, "살펴본 발전소 " + ns + " / 6", x0, 352, { s: 12, w: "800", c: ns === 6 ? LT.green : LT.mute });
      lt(ctx, "CO₂는 건설·연료 채굴까지 포함한 값", x0, 376, { s: 10.5, c: LT.mute });
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
    /* ── 위: 석탄 화력 발전소 → 송전선 → 우리 집을 잘라 본 블록 모형 / 아래: 에너지 100의 길(띠그림) ── */
    var DH = 386, Y0 = DH + 8, GZ = 10;
    var I = K.iso({ ox: 190, oy: 88, s: 0.65, L: 700, D: 170 }), LL = I.L, DD = I.D;
    function P(x, y, z) { return I.P(x, y, z); }
    function poly(pts, fill, stroke, lw) {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }
    function seg(a, b, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    /* 앞·오른쪽 벽을 잘라 낸 방: 뒤 벽(y0)·왼 벽(x0)·바닥만 그리고, 잘린 자리는 흰 테두리 */
    function room(x0, y0, x1, y1, z0, z1, wall, floor) {
      poly([P(x0, y0, z0), P(x1, y0, z0), P(x1, y0, z1), P(x0, y0, z1)], K.tint(wall, 0.9));
      poly([P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1)], K.tint(wall, 0.74));
      poly([P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x0, y1, z0)], floor);
    }
    function cutEdges(x0, y0, x1, y1, z0, z1) {
      ctx.save(); ctx.lineJoin = "round";
      var a = P(x1, y0, z0), b = P(x1, y0, z1), c = P(x0, y0, z1), d = P(x0, y1, z1), e = P(x0, y1, z0);
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.stroke();
      ctx.restore();
    }
    function wirePts(yw) {                                /* 기둥·송전탑 꼭대기 사이에 조금 처진 전선 */
      var tops = [[275, GZ + 70], [340, GZ + 105], [440, GZ + 105], [540, GZ + 105], [578, GZ + 60]], out = [], i, t;
      for (i = 0; i < tops.length - 1; i++) {
        var a = P(tops[i][0], yw, tops[i][1]), b = P(tops[i + 1][0], yw, tops[i + 1][1]);
        for (t = 0; t <= 1.0001; t += 0.125) {
          if (i && t === 0) continue;
          out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + 7 * 4 * t * (1 - t) });
        }
      }
      return out;
    }
    function puffs(cx, cy, n, r0, rise, drift, col, phase) {    /* 위로 피어오르는 김·연기 */
      for (var k = 0; k < n; k++) {
        var t = ((k / n + phase) % 1 + 1) % 1, r = r0 * (0.55 + t * 0.9);
        var g = ctx.createRadialGradient(cx + drift * t - r * .3, cy - rise * t - r * .3, r * .1, cx + drift * t, cy - rise * t, r);
        var al = (1 - t * .75);
        g.addColorStop(0, "rgba(255,255,255," + (0.98 * al).toFixed(2) + ")"); g.addColorStop(.7, "rgba(214,222,232," + (0.9 * al).toFixed(2) + ")"); g.addColorStop(1, col.replace("A", (0.75 * al).toFixed(2)));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx + drift * t, cy - rise * t, r, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(120,132,150," + (0.35 * al).toFixed(2) + ")"; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    function tower(x, y) {                                /* 격자 송전탑 */
      var h = 105, c = "#5b6472", lv = [0, 30, 58, 82, h], i, j;
      function q(z) { var w = 9 - 6.5 * z / h; return [P(x - w, y - w, GZ + z), P(x + w, y - w, GZ + z), P(x + w, y + w, GZ + z), P(x - w, y + w, GZ + z)]; }
      for (i = 0; i < 4; i++) seg(q(0)[i], q(h)[i], c, 1.6);
      for (j = 1; j < lv.length; j++) {
        var A = q(lv[j - 1]), B = q(lv[j]);
        for (i = 0; i < 4; i++) { seg(A[i], B[(i + 1) % 4], "rgba(91,100,114,.75)", 0.9); seg(B[i], B[(i + 1) % 4], c, 1); }
      }
      seg(P(x, y - 20, GZ + h), P(x, y + 20, GZ + h), c, 2.2);
      [-18, 18].forEach(function (d) { seg(P(x, y + d, GZ + h), P(x, y + d, GZ + h - 6), "#cfd6df", 2.6); });
    }
    function diorama(val) {
      var loss1 = val[0] - val[1], loss2 = val[1] - val[2], loss3 = val[2] - val[3], light = val[3];
      var mis = e1 === 40 && e2 === 96 && e3 === 5;
      K.studio(ctx, 0, 0, W, DH, { x: 350, y: 278, rx: 380, ry: 84 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 땅 블록 */
      I.box(ctx, 0, 0, 0, LL, DD, GZ, "#86b562", "#8a6a48", "#73573b");   /* 얇은 단색 받침 */
      I.face(ctx, "front", function (Lw) {
        ctx.fillStyle = "#6f9a4c"; ctx.fillRect(0, GZ - 3, Lw, 3);
      });
      I.plane(ctx, GZ + 0.2, "#c3c6c9", "rgba(255,255,255,.5)", 12, 285, 12, 160);          /* 발전소 마당 */
      I.plane(ctx, GZ + 0.2, "#a7aaa6", null, 285, LL, 150, 164);                           /* 길 */
      I.edges(ctx, GZ, GZ);
      /* 굴뚝 · 냉각탑(뒤쪽부터) */
      I.box(ctx, 98, 28, GZ, 114, 44, GZ + 150, "#e3e3e3", "#d2d2d2", "#a9a9a9");
      I.box(ctx, 98, 28, GZ + 126, 114, 44, GZ + 136, "#e15a4f", "#d04a40", "#a63a32");
      var tb = P(215, 28, GZ), tt = P(215, 28, GZ + 120), tm = P(215, 28, GZ + 80);
      var cg = ctx.createLinearGradient(tb.x - 28, 0, tb.x + 28, 0); cg.addColorStop(0, "#e9eaeb"); cg.addColorStop(.55, "#c5c8cc"); cg.addColorStop(1, "#8d9298");
      ctx.fillStyle = cg; ctx.beginPath();
      ctx.moveTo(tb.x - 30, tb.y); ctx.quadraticCurveTo(tm.x - 14, tm.y, tt.x - 19, tt.y);
      ctx.lineTo(tt.x + 19, tt.y); ctx.quadraticCurveTo(tm.x + 14, tm.y, tb.x + 30, tb.y);
      ctx.ellipse(tb.x, tb.y, 30, 9, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#4b5058"; ctx.beginPath(); ctx.ellipse(tt.x, tt.y, 19, 5.5, 0, 0, 6.2832); ctx.fill();
      /* 보일러실(잘라 봄) */
      room(70, 50, 150, 140, GZ, GZ + 95, "#cfd4db", "#8c929b");
      for (var tx = 78; tx < 146; tx += 8) seg(P(tx, 50, GZ + 6), P(tx, 50, GZ + 80), "rgba(120,128,140,.9)", 2);  /* 물이 끓는 관 */
      var drum = P(110, 60, GZ + 84);
      metal(ctx, drum.x - 30, drum.y - 8, 60, 16, "#d7dbe1", "#8d949e", 8);
      var fire = P(110, 98, GZ + 22), fl = 0.85 + 0.15 * Math.sin(ph * 6.2832 * 3);
      K.glow(ctx, fire.x, fire.y, 13 * fl, "rgba(255,150,50,.98)", 3.2);
      for (var f = 0; f < 5; f++) {
        var fx = fire.x - 16 + f * 8, fh = 10 + 8 * Math.abs(Math.sin(ph * 6.2832 * 2 + f));
        ctx.fillStyle = f % 2 ? "rgba(255,200,70,.95)" : "rgba(255,110,40,.9)";
        ctx.beginPath(); ctx.moveTo(fx - 4, fire.y + 6); ctx.quadraticCurveTo(fx, fire.y - fh, fx + 4, fire.y + 6); ctx.fill();
      }
      cutEdges(70, 50, 150, 140, GZ, GZ + 95);
      /* 터빈·발전기실(잘라 봄) */
      room(150, 70, 255, 140, GZ, GZ + 55, "#d9dde3", "#9aa1aa");
      var sa = P(158, 105, GZ + 20), sb = P(206, 105, GZ + 20);
      seg(sa, sb, "#59606b", 4);
      for (var d = 0; d < 3; d++) {                       /* 터빈 날개 원판 — 김이 지나가며 돌린다 */
        var xd = 164 + d * 15, rr = 9 + d * 2.5, pts = [];
        for (var a = 0; a < 6.29; a += 0.4) pts.push(P(xd, 105 + rr * Math.cos(a), GZ + 20 + rr * Math.sin(a)));
        poly(pts, "rgba(176,184,196,.9)", "rgba(255,255,255,.5)", 1);
        for (var b = 0; b < 4; b++) {
          var an = ph * 6.2832 * 2 + b * Math.PI / 4 + d;
          seg(P(xd, 105, GZ + 20), P(xd, 105 + rr * Math.cos(an), GZ + 20 + rr * Math.sin(an)), "#6b7380", 1.4);
        }
      }
      I.box(ctx, 212, 92, GZ, 246, 118, GZ + 34, "#e2a35c", "#c9853f", "#9b6330");          /* 발전기 */
      cutEdges(150, 70, 255, 140, GZ, GZ + 55);
      /* 석탄 더미 */
      var cc = P(42, 128, GZ), apex = P(42, 128, GZ + 22);
      var coal = ctx.createLinearGradient(apex.x - 30, apex.y, apex.x + 30, cc.y); coal.addColorStop(0, "#5b5b60"); coal.addColorStop(1, "#141418");
      ctx.fillStyle = coal; ctx.beginPath(); ctx.moveTo(cc.x - 34, cc.y); ctx.lineTo(apex.x, apex.y); ctx.lineTo(cc.x + 34, cc.y); ctx.ellipse(cc.x, cc.y, 34, 11, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
      /* 김(폐열) · 연기 — 발전 효율이 낮을수록 냉각탑 김이 커진다 */
      var steam = Math.max(0, loss1);
      puffs(tt.x, tt.y - 4, 7, 6 + steam * 0.18, 26 + steam * 0.6, 48, "rgba(150,162,180,A)", ph);
      var ct = P(106, 36, GZ + 150);
      puffs(ct.x, ct.y - 2, 4, 5, 34, 18, "rgba(110,115,125,A)", (ph * 1.3) % 1);
      /* 송전탑과 전선 — 전선에서 새는 열이 클수록 붉게 달아오른다 */
      seg(P(275, 82, GZ + 70), P(275, 118, GZ + 70), "#5b6472", 2); seg(P(275, 100, GZ), P(275, 100, GZ + 70), "#5b6472", 3);
      tower(340, 100); tower(440, 100);
      var heat = clamp(loss2 / 12, 0, 1);
      [82, 118].forEach(function (yw, wi) {
        var wp = wirePts(yw);
        if (heat > 0.02) {
          ctx.save(); ctx.strokeStyle = "rgba(255,90,90," + (0.15 + 0.55 * heat).toFixed(2) + ")"; ctx.lineWidth = 3 + 6 * heat; ctx.shadowColor = "#ff5a5a"; ctx.shadowBlur = 10 * heat;
          ctx.beginPath(); wp.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke(); ctx.restore();
        }
        ctx.strokeStyle = "#2f3540"; ctx.lineWidth = 1.4;
        ctx.beginPath(); wp.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke();
        flowDots(ctx, wp, (ph + wi * .5) % 1, 3 + Math.round(val[2] / 12), "rgba(127,211,255,.95)", 1.9);
      });
      tower(540, 100);
      seg(P(578, 82, GZ + 60), P(578, 118, GZ + 60), "#5b6472", 2); seg(P(578, 100, GZ), P(578, 100, GZ + 60), "#6b4a2e", 3);
      seg(P(578, 100, GZ + 60), P(600, 100, GZ + 48), "#2f3540", 1.4);
      /* 우리 집(잘라 봄) */
      room(595, 55, 680, 140, GZ, GZ + 62, "#efe6d8", "#c9a578");
      poly([P(595, 55, GZ + 62), P(680, 55, GZ + 62), P(680, 97.5, GZ + 88), P(595, 97.5, GZ + 88)], "rgba(176,72,58,.82)");
      seg(P(595, 97.5, GZ + 88), P(680, 97.5, GZ + 88), "rgba(255,255,255,.7)", 1.2);
      ctx.save(); ctx.setLineDash([4, 4]); seg(P(595, 97.5, GZ + 88), P(595, 140, GZ + 62), "rgba(176,72,58,.7)", 1.2); seg(P(680, 97.5, GZ + 88), P(680, 140, GZ + 62), "rgba(176,72,58,.7)", 1.2); ctx.restore();
      I.box(ctx, 645, 105, GZ, 668, 128, GZ + 14, "#a7774a", "#8a5f38", "#6e4b2c");          /* 탁자 */
      I.person(ctx, 625, 120, GZ, "#4fb6ff", 1.3);
      var bp = P(632, 95, GZ + 40), bc = P(632, 95, GZ + 62), fp = P(632, 95, GZ);
      seg(bc, bp, "#3a3a3a", 1);
      var lt = clamp(light / 40, 0, 1);
      var pool = ctx.createRadialGradient(fp.x, fp.y, 2, fp.x, fp.y, 46);
      pool.addColorStop(0, "rgba(255,226,140," + (0.15 + 0.6 * lt).toFixed(2) + ")"); pool.addColorStop(1, "rgba(255,226,140,0)");
      ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(fp.x, fp.y, 46, 18, 0, 0, 6.2832); ctx.fill();
      K.glow(ctx, bp.x, bp.y, 3 + 9 * lt, "rgba(255,236,170,.98)", 3.6);
      var hq = clamp(loss3 / Math.max(val[2], 1), 0, 1);           /* 전구에서 나는 열 */
      ctx.strokeStyle = "rgba(255,95,80," + (0.25 + 0.65 * hq).toFixed(2) + ")"; ctx.lineWidth = 1.6;
      for (var w2 = -1; w2 <= 1; w2++) {
        if (hq < 0.15 && w2) continue;
        ctx.beginPath();
        for (var yy = 0; yy <= 18; yy += 2) ctx.lineTo(bp.x + w2 * 7 + 2.5 * Math.sin(yy / 3 + ph * 12.566), bp.y - 9 - yy - 4 * ((ph * 2) % 1));
        ctx.stroke();
      }
      cutEdges(595, 55, 680, 140, GZ, GZ + 62);
      [[305, 158], [470, 152], [625, 22], [690, 158], [20, 20], [262, 40]].forEach(function (t, i) { I.tree(ctx, t[0], t[1], GZ, 0.85 + (i % 3) * .12); });
      /* 에너지가 흐르는 길: 석탄 → 불 → 김 → 터빈 */
      flowDots(ctx, [P(42, 128, GZ + 12), P(80, 110, GZ + 18), fire], ph, 5, "rgba(255,170,60,.98)", 2.2);
      flowDots(ctx, [P(118, 62, GZ + 84), P(150, 90, GZ + 50), sa], (ph * 1.4) % 1, 5, "rgba(255,255,255,.95)", 2);
      flowDots(ctx, [P(246, 105, GZ + 20), P(275, 100, GZ + 66)], ph, 2, "rgba(127,211,255,.95)", 1.9);
      ctx.restore();
      /* 이름표 */
      var bx = [4, W - 4];
      function neg(x) { return x < 0.05 ? "0" : "−" + x.toFixed(1); }
      I.label(ctx, 70, 50, GZ + 95, "보일러 · 석탄을 태워 물을 끓임", -40, -14, "#ffd9a8", bx);
      I.label(ctx, 180, 105, GZ + 20, "터빈·발전기", -18, 64, "#e8ecff", bx);
      I.label(ctx, 215, 28, GZ + 100, "냉각탑 · 남은 열을 김으로 내보냄", 60, -58, "#ffb3a6", bx);
      I.label(ctx, 440, 100, GZ + 105, "송전선 · 저항에서 열이 남", 44, -50, "#bfe6ff", bx);
      I.label(ctx, 680, 76, GZ + 62, "우리 집 · 백열전구", 44, -52, "#fff1cf", bx);
      /* 왼쪽 아래 장부 */
      var ly = 270;
      K.pill(ctx, "🪨 석탄의 화학 에너지 100", 14, ly, { s: 12, c: KC.orange, box: bx });
      K.pill(ctx, "① 발전소 폐열 " + neg(loss1), 14, ly + 25, { s: 12, c: KC.red, box: bx });
      K.pill(ctx, "② 전선의 열 " + neg(loss2), 14, ly + 50, { s: 12, c: KC.red, box: bx });
      K.pill(ctx, "③ 전구의 열 " + neg(loss3), 14, ly + 75, { s: 12, c: KC.red, box: bx });
      K.pill(ctx, "💡 빛이 된 에너지 " + light.toFixed(1), 14, ly + 100, { s: 12.5, c: KC.yellow, box: bx });
      /* 큰 제목 */
      var h1, h2;
      if (mis) { h1 = "석탄 100 중 빛은 " + light.toFixed(1); h2 = "나머지 " + (100 - light).toFixed(1) + "은 열로 흩어졌다"; }
      else if (light >= 50) { h1 = "새는 곳을 대부분 막았다"; h2 = "전체 효율 " + light.toFixed(1) + " %"; }
      else if (light < 5) { h1 = "빛이 되는 건 겨우 " + light.toFixed(1); h2 = "효율은 단계마다 곱해진다"; }
      else { h1 = "단계마다 에너지가 샌다"; h2 = "전체 효율 " + e1 + "% × " + e2 + "% × " + e3 + "%"; }
      K.bigText(ctx, h1, W - 20, 50, 28, "#ffffff", "right");
      K.bigText(ctx, h2, W - 20, 84, 18, "#ffd35a", "right");
      K.warn(ctx, W - 14, DH - 14, "⚠ 크기·거리는 보기 쉽게 줄임 · 냉각탑 김의 크기 = 발전소 폐열", "right");
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s0 = 100, s1 = s0 * e1 / 100, s2 = s1 * e2 / 100, s3 = s2 * e3 / 100;
      var val = [s0, s1, s2, s3], X = [40, 290, 540, 790], top = Y0 + 62, k = 1.4, end = 868;
      diorama(val);
      K.studio(ctx, 0, Y0, W, H - Y0, { x: 450, y: H - 30, rx: 380, ry: 18 });
      K.pill(ctx, "에너지 100의 길 · 단계마다 새어 나가는 에너지", 16, Y0 + 28, { s: 13, c: "#bfe6ff" });
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
        K.t(ctx, names[i], i === 3 ? W - 16 : X[i] + (i ? -36 : 0), top - 10, { s: 11.5, w: "800", a: i === 3 ? "right" : "left", c: LT.ink });
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
    var IR = K.iso({ ox: 236, oy: 184, s: 1.18, L: 170, D: 170 }), RZ = 120;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var L = LAMPS[type], lm = w * L.lmw, ok = lm >= 760 && lm <= 840, effPct = 5 * L.lmw / 13.3, glow = clamp(lm / 800, 0, 2), RW = 336;
      var dk = 0.3 + 0.7 * Math.min(1, glow);
      RW = 470;
      K.studio(ctx, 0, 0, RW, H, { x: 240, y: 388, rx: 210, ry: 22 });
      /* 회관 방(앞·오른쪽 벽과 천장을 잘라 냄) */
      function Q(a, b, c2, d, col) { IR.quad(ctx, IR.P(a[0], a[1], a[2]), IR.P(b[0], b[1], b[2]), IR.P(c2[0], c2[1], c2[2]), IR.P(d[0], d[1], d[2]), col); }
      Q([0, 0, 0], [170, 0, 0], [170, 170, 0], [0, 170, 0], K.tint("#c8a273", .4 + .65 * dk));
      ctx.strokeStyle = "rgba(60,40,20,.18)"; ctx.lineWidth = 1;
      for (var fb = 20; fb < 170; fb += 20) { var f1 = IR.P(fb, 0, 0), f2 = IR.P(fb, 170, 0); ctx.beginPath(); ctx.moveTo(f1.x, f1.y); ctx.lineTo(f2.x, f2.y); ctx.stroke(); }
      Q([0, 0, 0], [170, 0, 0], [170, 0, RZ], [0, 0, RZ], K.tint("#efe6d8", .35 + .65 * dk));
      Q([0, 0, 0], [0, 170, 0], [0, 170, RZ], [0, 0, RZ], K.tint("#e2d6c2", .3 + .6 * dk));
      onPlane(ctx, IR, 0, function () { ctx.fillStyle = "#1b2a4a"; ctx.fillRect(110, 52, 40, 44); ctx.strokeStyle = "#f8f9fa"; ctx.lineWidth = 3; ctx.strokeRect(110, 52, 40, 44); ctx.beginPath(); ctx.moveTo(130, 52); ctx.lineTo(130, 96); ctx.stroke(); });
      var fp = IR.P(85, 85, 0), pool = ctx.createRadialGradient(fp.x, fp.y, 2, fp.x, fp.y, 120);
      pool.addColorStop(0, "rgba(255,226,140," + clamp(glow * .55, 0, .7).toFixed(2) + ")"); pool.addColorStop(1, "rgba(255,226,140,0)");
      ctx.fillStyle = pool; ctx.beginPath(); ctx.ellipse(fp.x, fp.y, 160, 74, 0, 0, 6.2832); ctx.fill();
      IR.box(ctx, 60, 70, 0, 120, 112, 30, K.tint("#a7774a", .5 + .5 * dk), K.tint("#8a5f38", .5 + .5 * dk), K.tint("#6e4b2c", .5 + .5 * dk));
      IR.person(ctx, 40, 130, 0, "#4fb6ff", 2.3); IR.person(ctx, 140, 60, 0, "#ff922b", 2.3);
      [[70, 58], [104, 58], [52, 92], [126, 120]].forEach(function (c) { IR.box(ctx, c[0], c[1], 0, c[0] + 12, c[1] + 12, 18, K.tint("#9aa7b8", .5 + .5 * dk), K.tint("#7d8a9c", .5 + .5 * dk), K.tint("#5f6b7c", .5 + .5 * dk)); });
      /* 잘린 벽 테두리 */
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2.4; ctx.lineJoin = "round";
      var e1 = IR.P(170, 0, 0), e2 = IR.P(170, 0, RZ), e3 = IR.P(0, 0, RZ), e4 = IR.P(0, 170, RZ), e5 = IR.P(0, 170, 0);
      ctx.beginPath(); ctx.moveTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y); ctx.lineTo(e3.x, e3.y); ctx.lineTo(e4.x, e4.y); ctx.lineTo(e5.x, e5.y); ctx.stroke();
      /* 전구와 열 */
      var bp = IR.P(85, 85, 84), top = IR.P(85, 85, RZ);
      ctx.strokeStyle = "rgba(40,40,50,.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(top.x, top.y); ctx.lineTo(bp.x, bp.y - 34); ctx.stroke();
      if (lm > 5) K.glow(ctx, bp.x, bp.y - 8, 8 + 12 * Math.min(glow, 1.5), "rgba(255,226,150," + clamp(glow * 0.6, 0.08, 0.95) + ")", 2.6);
      var heat = (100 - effPct) / 100, nw = Math.round(heat * 4 * Math.min(1, w / 20));
      ctx.save(); ctx.strokeStyle = "rgba(224,49,49,.65)"; ctx.lineWidth = 2.4;
      for (var hq = 0; hq < nw; hq++) [-1, 1].forEach(function (sd) { var x0 = bp.x + sd * (60 + hq * 15); ctx.beginPath(); for (var yy = 0; yy <= 56; yy += 4) { var xx = x0 + Math.sin(yy / 7 + hq) * 4; if (yy) ctx.lineTo(xx, bp.y + 14 - yy); else ctx.moveTo(xx, bp.y + 14 - yy); } ctx.stroke(); });
      ctx.restore();
      ctx.save(); ctx.translate(bp.x, bp.y); ctx.scale(1.3, 1.3); bulb(0, 0, type, glow); ctx.restore();
      if (nw) K.pill(ctx, "열 " + (100 - effPct).toFixed(0) + "%", bp.x + 66 + nw * 15, bp.y - 44, { s: 12, c: "#ffc9c9", box: [0, RW] });
      if (lm > 5) K.pill(ctx, "빛 " + effPct.toFixed(0) + "%", bp.x, bp.y + 78, { s: 12, a: "center", c: "#fff3bf", box: [0, RW] });
      K.warn(ctx, RW - 12, H - 12, "⚠ 전구 크기는 보기 쉽게 과장", "right");
      K.bigText(ctx, Math.round(lm) + " lm", 18, 44, 28, ok ? "#8ff5cf" : "#ffffff");
      K.bigText(ctx, L.n + " " + w + " W", 18, 70, 15, "#ffd35a");
      /* 오른쪽 판정 카드 */
      var CX = RW + 10, gx = CX + 20, gw = W - 20 - gx;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 회관에 알맞은 밝기는 760~840 lm");
      ltrack(ctx, gx, 42, gw, 20, 10);
      ctx.fillStyle = "rgba(15,159,118,.32)"; ctx.fillRect(gx + gw * 760 / 1600, 36, gw * 80 / 1600, 32);
      lbar(ctx, gx, 46, clamp(lm / 1600, 0.004, 1) * gw, 12, ok ? "#0f9f76" : "#e8a400", ok ? "#63e6be" : "#ffe066", 6);
      [0, 400, 800, 1200, 1600].forEach(function (q) { lt(ctx, String(q), gx + gw * q / 1600, 84, { s: 10.5, a: q === 0 ? "left" : (q === 1600 ? "right" : "center"), c: LT.mute }); });
      lt(ctx, "들어간 전기 에너지 100은 어디로 갔나", gx, 114, { s: 12.5, w: "800" });
      var lw = gw * effPct / 100;
      lbar(ctx, gx, 124, lw, 30, "#e8a400", "#ffe066", 6);
      lbar(ctx, gx + lw + 3, 124, gw - lw - 3, 30, "#c92a2a", "#ff8787", 6);
      lt(ctx, "빛 " + effPct.toFixed(0), gx, 174, { s: 12, w: "900", c: "#b07b00" });
      lt(ctx, "열 " + (100 - effPct).toFixed(0) + " (쓸모없이 흩어짐)", gx + gw, 174, { s: 12, w: "900", a: "right", c: LT.red });
      lt(ctx, "하루 5시간씩 1년 동안 쓰는 전기 (내가 맞춘 전구)", gx, 208, { s: 12.5, w: "800" });
      ["inc", "cfl", "led"].forEach(function (k, i) {
        var y = 220 + i * 28, fw = found[k];
        var TW = gw - 214;
        lt(ctx, LAMPS[k].n, gx + 96, y + 14, { s: 11.5, a: "right", w: k === type ? "900" : "700", c: k === type ? LT.ink : LT.mute });
        ltrack(ctx, gx + 104, y, TW, 18, 5);
        if (fw) { var kwh = fw * 5 * 365 / 1000; lbar(ctx, gx + 104, y, TW * Math.min(1, kwh / 130), 18, k === "inc" ? "#c92a2a" : "#0c8599", k === "inc" ? "#ff8787" : "#66d9e8", 5); lt(ctx, fw + " W → " + kwh.toFixed(0) + " kWh", gx + gw, y + 14, { s: 11.5, w: "800", a: "right" }); }
        else lt(ctx, "아직 맞추지 못함", gx + gw, y + 14, { s: 11, a: "right", c: LT.dim });
      });
      K.tip(ctx, ok ? "✅ 회관에 알맞은 밝기" : (lm < 760 ? "어둡습니다 · 760 lm 이상으로" : "필요 이상으로 밝습니다 (낭비)"), gx - 4, 330, gw + 4, ok ? true : null);
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
    var IV = K.iso({ ox: 208, oy: 78, s: .72, L: 560, D: 200 }), GZ = 12, VH = 360, hr = 11, playing = !REDUCE, off = null, offKey = "", last = null;
    var HOUSES = []; (function () { for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) HOUSES.push([28 + c * 55, 22 + r * 60]); })();
    function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }); }
    function config() {
      return { nP: Math.round(S / 100), nW: Math.round(Wd / 200), nB: Math.ceil(Bt / 1000), nD: Math.ceil(Dg / 250) };
    }
    function panelAt(i) { return [262 + (i % 3) * 40, 14 + Math.floor(i / 3) * 18]; }
    function millAt(i) { return [404 + (i % 5) * 32, i < 5 ? 18 : 52]; }
    function battAt(i) { return [400 + (i % 4) * 36, i < 4 ? 82 : 112]; }
    function dieselAt(i) { return [408 + i * 36, 158]; }
    function paintStatic(c) {
      var octx = ctx; ctx = c;
      K.studio(ctx, 0, 0, 640, VH, { x: 330, y: 338, rx: 280, ry: 28 });
      IV.box(ctx, 0, 0, 0, 560, 200, GZ, "#8fbf6a", "#8a6a48", "#73573b");   /* 얇은 단색 받침 */
      IV.plane(ctx, GZ + .2, "#b8b2a4", null, 0, 250, 92, 100);
      IV.edges(ctx, GZ, GZ);
      var cf = config(), i;
      HOUSES.forEach(function (h) { IV.house(ctx, h[0], h[1], GZ, 30, 24, 20, ["#c0553f", "#3b6fc4", "#e8890c"][(h[0] + h[1]) % 3]);  });
      for (i = 0; i < cf.nP; i++) {
        var p = panelAt(i), a1 = IV.P(p[0], p[1], GZ + 3), a2 = IV.P(p[0] + 34, p[1], GZ + 3), a3 = IV.P(p[0] + 34, p[1] + 13, GZ + 12), a4 = IV.P(p[0], p[1] + 13, GZ + 12);
        var pg = ctx.createLinearGradient(a1.x, a1.y, a3.x, a3.y); pg.addColorStop(0, "#1c3d78"); pg.addColorStop(.5, "#3b6fc4"); pg.addColorStop(1, "#14305e");
        IV.quad(ctx, a1, a2, a3, a4, pg, "rgba(255,255,255,.6)");
      }
      for (i = 0; i < cf.nB; i++) { var b = battAt(i); IV.box(ctx, b[0], b[1], GZ, b[0] + 30, b[1] + 22, GZ + 18, "#f1f3f5", "#dfe6ee", "#b9c4d0"); }
      for (i = 0; i < cf.nD; i++) { var d = dieselAt(i); IV.box(ctx, d[0], d[1], GZ, d[0] + 28, d[1] + 20, GZ + 16, "#ffd8a8", "#e8590c", "#b8440a"); IV.box(ctx, d[0] + 4, d[1] + 4, GZ + 16, d[0] + 8, d[1] + 8, GZ + 32, "#868e96", "#495057", "#343a40"); }
      ctx = octx;
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = village(S, Wd, Bt, Dg), cf = config(), key = [S, Wd, Bt, Dg, canvas.width].join(","), i;
      if (!off || offKey !== key) { off = document.createElement("canvas"); off.width = canvas.width; off.height = canvas.height; var dpr = canvas.width / W, oc = off.getContext("2d"); oc.setTransform(dpr, 0, 0, dpr, 0, 0); paintStatic(oc); offKey = key; }
      var h = Math.floor(hr) % 48, o = r.rows[h], hh = h % 24, d2 = h >= 24, day = hh >= 6 && hh < 18;
      var sunUp = Math.max(0, Math.sin(Math.PI * (hr % 24 - 6) / 12)), wind = d2 ? 0.06 : (0.35 + 0.15 * Math.sin(hh / 24 * 2 * Math.PI + 1));
      ctx.drawImage(off, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, 640, VH, 14); ctx.clip();
      /* 하늘: 해·구름·밤 */
      var night = clamp(1 - sunUp * 3, 0, 1);
      if (night > 0) { ctx.fillStyle = "rgba(12,22,58," + (0.42 * night).toFixed(2) + ")"; ctx.fillRect(0, 0, 640, VH); }
      if (sunUp > 0) { var sx = lerp(230, 610, (hr % 24 - 6) / 12), sy = 120 - 92 * sunUp; K.sun(ctx, sx, sy, 12); K.planet(ctx, sx, sy, 12, "#fff3bf", "#f59f00"); if (d2) puffCloud(ctx, sx - 6, sy + 6, .9, true); }
      else { K.planet(ctx, 600, 40, 9, "#f8f9fa", "#adb5bd"); }
      if (d2) { puffCloud(ctx, 330, 50, .8, true); puffCloud(ctx, 470, 36, .7, true); }
      /* 집 창문: 정전이면 깜깜 */
      HOUSES.forEach(function (hq) {
        onPlane(ctx, IV, hq[1] + 22, function () { ctx.fillStyle = o.un > 1 ? "#2b2f3a" : (day ? "#a5d8ff" : "#ffe066"); ctx.fillRect(hq[0] + 5, GZ + 5, 6, 7); ctx.fillRect(hq[0] + 15, GZ + 5, 6, 7); });
        if (o.un <= 1 && !day) { var wp = IV.P(hq[0] + 13, hq[1] + 22, GZ + 8); K.glow(ctx, wp.x, wp.y, 3, "rgba(255,224,120,.9)", 3); }
      });
      /* 풍력 */
      for (i = 0; i < cf.nW; i++) { var m = millAt(i); windmill(ctx, IV.P(m[0], m[1], GZ), 70, 38, hr * 6 * wind * 4 + i); }
      /* 배터리 잔량 */
      for (i = 0; i < cf.nB; i++) { var b = battAt(i), f = Bt > 0 ? o.soc / Bt : 0; onPlane(ctx, IV, b[1] + 22, function () { ctx.fillStyle = "#e9ecef"; ctx.fillRect(b[0] + 4, GZ + 3, 22, 12); ctx.fillStyle = f > .2 ? "#20c997" : "#fa5252"; ctx.fillRect(b[0] + 4, GZ + 3, 22, 12 * f); }); }
      /* 경유 발전기 연기 */
      if (o.dg > 0) for (i = 0; i < cf.nD; i++) { var dq = dieselAt(i), sp = IV.P(dq[0] + 6, dq[1] + 6, GZ + 32); for (var k = 0; k < 3; k++) { var t = (hr * .8 + k / 3) % 1; ctx.fillStyle = "rgba(90,90,98," + (0.55 * (1 - t)).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(sp.x + t * 10, sp.y - t * 26, 3 + t * 6, 0, 6.2832); ctx.fill(); } }
      /* 전기의 흐름 → 마을 */
      var town = IV.P(140, 96, GZ + 4);
      if (o.R > 1 && cf.nP + cf.nW > 0) flowDots(ctx, [IV.P(320, 96, GZ + 4), town], hr * .7, 5, "rgba(12,166,120,.95)", 2);
      if (o.dis > 1) flowDots(ctx, [IV.P(420, 100, GZ + 4), IV.P(300, 96, GZ + 4), town], hr * .7 + .3, 5, "rgba(28,126,214,.95)", 2);
      if (o.dg > 1) flowDots(ctx, [IV.P(430, 168, GZ + 4), IV.P(300, 100, GZ + 4), town], hr * .7 + .6, 5, "rgba(232,89,12,.95)", 2);
      ctx.restore();
      if (o.un > 1) K.pill(ctx, "⚡ 정전!", IV.P(140, 60, GZ + 40).x, IV.P(140, 60, GZ + 40).y, { s: 14, a: "center", c: "#ff8787" });
      K.bigText(ctx, (d2 ? "2일째 " : "1일째 ") + hh + "시", 18, 44, 26, "#ffffff");
      K.bigText(ctx, d2 ? "흐리고 바람 없음" : "맑고 바람 부는 날", 18, 72, 16, "#ffd35a");
      lt(ctx, "태양광 " + S + " kW", 18, 268, { s: 12, w: "800", c: LT.blue }); lt(ctx, "풍력 " + Wd + " kW", 18, 290, { s: 12, w: "800", c: LT.teal });
      lt(ctx, "배터리 " + Bt.toLocaleString() + " kWh", 18, 312, { s: 12, w: "800", c: LT.green }); lt(ctx, "경유 발전기 " + Dg + " kW", 18, 334, { s: 12, w: "800", c: LT.orange });
      if (cf.nP) { var lp = panelAt(Math.min(cf.nP - 1, 2)); IV.label(ctx, lp[0] + 17, lp[1] + 6, GZ + 8, "태양광 판 " + cf.nP + "장", 30, -50, "#a5d8ff", [0, 640]); }
      if (cf.nB) { var lb = battAt(Math.min(cf.nB - 1, 3)); IV.label(ctx, lb[0] + 30, lb[1] + 11, GZ + 10, "배터리 컨테이너 " + cf.nB + "개", 50, -4, "#b2f2bb", [0, 640]); }
      if (cf.nD) { var ld = dieselAt(cf.nD - 1); IV.label(ctx, ld[0] + 28, ld[1] + 10, GZ + 10, "경유 발전기 " + cf.nD + "대", 56, 6, "#ffd8a8", [0, 640]); }
      IV.label(ctx, 28, 160, GZ + 20, "집 12채", -30, 40, "#e8ecff", [0, 640]);
      /* 지금 시각 카드 */
      var CX = 650, x0 = CX + 18, x1 = W - 18;
      K.card(ctx, CX, 0, W - CX, VH, "지금 · " + (d2 ? "2일째 " : "1일째 ") + hh + "시");
      lt(ctx, o.un > 1 ? "정전!" : (o.dg > 1 ? "경유 발전 중" : (o.dis > 1 ? "배터리로 버팀" : "햇빛·바람으로 충분")), x0, 62, { s: 19, w: "900", c: o.un > 1 ? LT.red : (o.dg > 1 ? LT.orange : (o.dis > 1 ? LT.blue : LT.green)) });
      K.row(ctx, "마을이 쓰는 전력", Math.round(o.D) + " kW", x0, x1, 96);
      K.row(ctx, "태양광·풍력", Math.round(o.R) + " kW", x0, x1, 122, LT.green);
      K.row(ctx, "배터리 방전", Math.round(o.dis) + " kW", x0, x1, 148, LT.blue);
      K.row(ctx, "경유 발전", Math.round(o.dg) + " kW", x0, x1, 174, LT.orange);
      K.row(ctx, "모자람(정전)", Math.round(o.un) + " kW", x0, x1, 200, o.un > 1 ? LT.red : LT.ink);
      K.row(ctx, "배터리 잔량", Bt > 0 ? Math.round(o.soc / Bt * 100) + "%" : "없음", x0, x1, 226);
      K.bar(ctx, x0, 236, x1 - x0, Bt > 0 ? o.soc / Bt : 0, LT.teal);
      lt(ctx, "▶ 시간을 흘려 보며 마을을 지켜보세요", x0, VH - 20, { s: 12, c: LT.mute });
      /* 아래: 이틀(48시간) 전력 수급 그래프 */
      var Y0 = VH + 8, gx0 = 56, gx1 = 880, gy0 = 406, gy1 = 556, bw = (gx1 - gx0) / 48, maxP = 900;
      K.studio(ctx, 0, Y0, W, H - Y0);
      ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
      for (var hb = 0; hb < 48; hb++) { var q = hb % 24; if (!(q >= 6 && q < 18)) { ctx.fillStyle = "rgba(20,40,90,.07)"; ctx.fillRect(gx0 + hb * bw, gy0, bw + .5, gy1 - gy0); } }
      ctx.strokeStyle = LT.line; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(gx0 + 24 * bw, gy0 - 6); ctx.lineTo(gx0 + 24 * bw, gy1); ctx.stroke(); ctx.setLineDash([]);
      K.pill(ctx, "1일째 ☀️💨 맑고 바람 부는 날", gx0 + 6, Y0 + 26, { s: 12, c: "#ffe3a3" });
      K.pill(ctx, "2일째 ☁️ 흐리고 바람 없는 날", gx0 + (gx1 - gx0) / 2 + 10, Y0 + 26, { s: 12, c: "#dee2e6" });
      [0, 300, 600, 900].forEach(function (qv) { var gy = gy1 - qv / maxP * (gy1 - gy0); ctx.strokeStyle = LT.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, gy); ctx.lineTo(gx1, gy); ctx.stroke(); lt(ctx, String(qv), gx0 - 6, gy + 4, { s: 10, a: "right", c: LT.mute }); });
      var COL = [["#0f9f76", "#63e6be"], ["#1c7ed6", "#74c0fc"], ["#e8590c", "#ffa94d"], ["#c92a2a", "#ff8787"]];
      r.rows.forEach(function (oo, hh2) {
        var x = gx0 + hh2 * bw, y = gy1;
        [oo.R, oo.dis, oo.dg, oo.un].forEach(function (qv, j) { var hg = qv / maxP * (gy1 - gy0); if (hg <= 0) return; var g = ctx.createLinearGradient(0, y - hg, 0, y); g.addColorStop(0, COL[j][1]); g.addColorStop(1, COL[j][0]); ctx.fillStyle = g; ctx.fillRect(x + 1, y - hg, bw - 2, hg); y -= hg; });
      });
      ctx.strokeStyle = LT.violet; ctx.lineWidth = 2.5; ctx.beginPath();
      r.rows.forEach(function (oo, hh2) { var xx = gx0 + (hh2 + 0.5) * bw, yy = gy1 - oo.D / maxP * (gy1 - gy0); if (hh2 === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }); ctx.stroke();
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
      [0, 6, 12, 18, 24, 30, 36, 42].forEach(function (hq) { lt(ctx, (hq % 24) + "시", gx0 + hq * bw, gy1 + 15, { s: 10, c: LT.mute, a: hq ? "center" : "left" }); });
      lt(ctx, "kW", gx0 - 6, gy0 - 6, { s: 10, a: "right", c: LT.mute });
      var cxh = gx0 + (hr % 48) * bw; ctx.strokeStyle = LT.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cxh, gy0 - 4); ctx.lineTo(cxh, gy1 + 2); ctx.stroke();
      ctx.fillStyle = LT.ink; ctx.beginPath(); ctx.moveTo(cxh, gy0 - 2); ctx.lineTo(cxh - 5, gy0 - 10); ctx.lineTo(cxh + 5, gy0 - 10); ctx.closePath(); ctx.fill();
      lt(ctx, "🔋", 22, 596, { s: 13 });
      ltrack(ctx, gx0, 582, gx1 - gx0, 16, 5);
      if (Bt > 0) r.rows.forEach(function (oo, hh2) { ctx.fillStyle = "rgba(12,133,153," + (0.08 + 0.85 * oo.soc / Bt).toFixed(2) + ")"; ctx.fillRect(gx0 + hh2 * bw, 582, bw, 16); });
      else lt(ctx, "배터리 없음", gx0 + 8, 594, { s: 10.5, c: LT.dim });
      [["#0f9f76", "태양광·풍력"], ["#1c7ed6", "배터리 방전"], ["#e8590c", "경유 발전"], ["#c92a2a", "정전(모자람)"], [LT.violet, "— 마을이 쓰는 전력"]].forEach(function (pq, k) {
        ctx.fillStyle = pq[0]; ctx.beginPath(); ctx.roundRect(gx0 + k * 160, 608, 12, 12, 3); ctx.fill(); lt(ctx, pq[1], gx0 + k * 160 + 18, 619, { s: 11 });
      });
      var vd = verdict(r);
      K.tip(ctx, (vd.a ? "✅" : "❌") + " 정전 " + r.black + "시간", gx0 - 4, 626, 250, vd.a);
      K.tip(ctx, (vd.b ? "✅" : "❌") + " 설치비 " + r.cost.toFixed(1) + "억 원", gx0 + 262, 626, 250, vd.b);
      K.tip(ctx, (vd.c ? "✅" : "❌") + " CO₂ 지금의 " + Math.round(r.ratio * 100) + "% (" + (r.co2 / 1000).toFixed(1) + "톤)", gx0 + 524, 626, 300, vd.c);
      return r;
    }
    playBtn("c-v-play", function () { return playing; }, function (x) { playing = x; }, "⏸ 시간 멈추기", "▶ 이틀 흘려 보기");
    K.animate(canvas, function (dt) { if (playing) { hr = (hr + dt / 500) % 48; draw(); } });
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
