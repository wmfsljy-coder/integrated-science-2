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
/* 미션 상자는 완료되면 내용이 통째로 바뀐다. 그 안에 있던 자리를 뒤늦게 건드리면 오류가 나므로 확인하고 쓴다. */
function put(id, html) { var e = $(id); if (e) e.innerHTML = html; }
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

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;
function col(c) { return !c ? KC.ink : (c.indexOf("--") === 0 ? v(c) : c); }
function rgbOf(c) {
  c = col(c);
  if (c.charAt(0) === "#") {
    if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
  }
  var m = /(\d+)\D+(\d+)\D+(\d+)/.exec(c); return m ? [+m[1], +m[2], +m[3]] : [200, 210, 255];
}
function rgba(c, a) { var r = rgbOf(c); return "rgba(" + r[0] + "," + r[1] + "," + r[2] + "," + a + ")"; }
function shade(c, k) { var r = rgbOf(c); return "rgb(" + Math.min(255, Math.round(r[0] * k)) + "," + Math.min(255, Math.round(r[1] * k)) + "," + Math.min(255, Math.round(r[2] * k)) + ")"; }
function pill(ctx, s, x, y, o) { o = o || {}; return K.pill(ctx, s, x, y, { a: o.a, s: o.s, w: o.w, c: col(o.c), box: o.box, bg: o.bg, line: o.line }); }
function ball(ctx, x, y, r, c) { var b = col(c); K.planet(ctx, x, y, r, b, shade(b, .38)); }
function dot(ctx, x, y, r, c, halo) { K.glow(ctx, x, y, r, rgba(c, .95), halo || 3); }
function meter(ctx, x, y, w, h, f, c) {
  ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = "rgba(200,210,255,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
  f = clamp(f, 0, 1); if (f <= 0) return;
  var g = ctx.createLinearGradient(x, 0, x + w * f, 0);
  g.addColorStop(0, shade(c, .55)); g.addColorStop(1, col(c));
  ctx.save(); ctx.shadowColor = col(c); ctx.shadowBlur = 10; ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * f), h, h / 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.beginPath(); ctx.roundRect(x + 2, y + 2, Math.max(h - 4, w * f - 4), h * .35, h / 4); ctx.fill();
}
/* 세로 막대(빛나는 유리 기둥) */
function column(ctx, x, y, w, h, c) {
  if (h <= 0) return;
  var g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, shade(c, .6)); g.addColorStop(.45, col(c)); g.addColorStop(1, shade(c, .5));
  ctx.save(); ctx.shadowColor = col(c); ctx.shadowBlur = 8; ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, [5, 5, 1, 1]); ctx.fill(); ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.18)"; ctx.fillRect(x + w * .18, y + 3, w * .16, Math.max(0, h - 6));
}
function playBtn(id, onLabel, offLabel, get, set) {
  var b = $(id); if (!b) return;
  function lab() { b.textContent = get() ? onLabel : offLabel; }
  b.addEventListener("click", function () { set(!get()); lab(); }); lab();
}
/* 갈라파고스 핀치 옆모습 — beak 은 부리 두께(mm) */
function finch(ctx, x, y, s, beak, alpha) {
  ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
  var bg = ctx.createRadialGradient(x - 6 * s, y - 6 * s, 2 * s, x, y, 26 * s);
  bg.addColorStop(0, "#6a625a"); bg.addColorStop(1, "#181512");
  ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(x - 8 * s, y + 6 * s, 24 * s, 15 * s, -.25, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 28 * s, y + 10 * s); ctx.lineTo(x - 46 * s, y + 20 * s); ctx.lineTo(x - 26 * s, y + 18 * s); ctx.closePath(); ctx.fill();
  var hg = ctx.createRadialGradient(x + 6 * s, y - 10 * s, 1, x + 8 * s, y - 6 * s, 14 * s);
  hg.addColorStop(0, "#5b544d"); hg.addColorStop(1, "#1d1915");
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(x + 8 * s, y - 6 * s, 12 * s, 0, 6.2832); ctx.fill();
  var d = beak * 1.15 * s, L = 7 + beak * 1.05;
  var kg = ctx.createLinearGradient(0, y - 6 * s - d / 2, 0, y - 6 * s + d / 2);
  kg.addColorStop(0, "#f3d9b0"); kg.addColorStop(1, "#9a7650");
  ctx.fillStyle = kg; ctx.beginPath();
  ctx.moveTo(x + 16 * s, y - 6 * s - d / 2); ctx.quadraticCurveTo(x + (18 + L * .7) * s, y - 6 * s - d / 3, x + (18 + L) * s, y - 6 * s + d * .08);
  ctx.quadraticCurveTo(x + (18 + L * .6) * s, y - 6 * s + d / 2, x + 16 * s, y - 6 * s + d / 2); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + 11 * s, y - 9 * s, 2.2 * s, 0, 6.2832); ctx.fill();
  ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(x + 11.5 * s, y - 9 * s, 1.2 * s, 0, 6.2832); ctx.fill();
  ctx.restore();
}

/* ---- 밝은 스튜디오 + 블록 모형 (STUDIO_GUIDE) ---- */
/* 밝은 바탕 이름표(흰 알약) */
function lp(ctx, s, x, y, o) { o = o || {}; return K.pill(ctx, s, x, y, { a: o.a, s: o.s || 12, w: o.w || "800", c: o.c || K.LT.ink, bg: o.bg || "rgba(255,255,255,.92)", line: o.line || "rgba(20,40,90,.18)", box: o.box }); }
/* 바닥 그림자 */
function shadowE(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 1, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
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
    function zs(zz) { return (zz > 0 ? "+" : (zz < 0 ? "−" : "")) + Math.abs(zz) + " cm"; }
    /* ── 아이소메트릭 블록: 구비오 협곡 절벽에서 경계 위아래 80 cm 를 잘라 낸 모형 ──
       x = 앞면 가로(u), y = 깊이, z = 위(그림 단위). 높이 −40~+40 cm 를 z 20~280 에 놓는다. */
    var LW = 540, RX = LW + 8;
    var I = K.iso({ ox: 109, oy: 345, s: 0.76, L: 330, D: 120 });
    var L = I.L, D = I.D, ZT = 300, CL = 4, UH = 230;          /* CL: 점토층 반두께(실제보다 두껍게) · UH: 시료 뜨는 자리 */
    function zOf(zz) { return 20 + (zz + 40) / 80 * 260; }
    var Z0 = zOf(0);
    function zone(zz) { return zz < 0 ? "k" : (zz > 0 ? "p" : "c"); }
    /* 화석: 아래(백악기)는 크고 빽빽, 위(신생대)는 아주 작고 드묾 */
    var fr = rng(66), FOS = { front: [], right: [] };
    ["front", "right"].forEach(function (sd) {
      var Lw = sd === "front" ? L : D, nb = sd === "front" ? 58 : 20, ns = sd === "front" ? 10 : 4, i;
      for (i = 0; i < nb; i++) FOS[sd].push({ u: 6 + fr() * (Lw - 12), z: 4 + fr() * (Z0 - CL - 9), r: 2.6 + fr() * 3.6, a: fr() * 6.28 });
      for (i = 0; i < ns; i++) FOS[sd].push({ u: 6 + fr() * (Lw - 12), z: Z0 + CL + 6 + fr() * (ZT - Z0 - CL - 12), r: 1.1, a: 0 });
    });
    function shell(x, y, r, a, light) {                       /* 평면 나선으로 방이 늘어나는 유공충 껍데기 */
      var k, n = 7;
      for (k = 0; k < n; k++) {
        var t = k / (n - 1), ang = a + t * 5.2, rr = r * (.17 + .27 * t), dd = r * (.12 + .52 * t);
        var cx = x + Math.cos(ang) * dd, cy = y + Math.sin(ang) * dd;
        var g = ctx.createRadialGradient(cx - rr * .3, cy - rr * .3, .3, cx, cy, rr);
        g.addColorStop(0, light ? "rgba(255,252,240,.98)" : "rgba(255,250,235,.85)"); g.addColorStop(1, light ? "rgba(176,140,98,.95)" : "rgba(150,115,80,.75)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(90,60,35,.55)"; ctx.lineWidth = light ? 1 : .7; ctx.stroke();
      }
    }
    function face(side) {
      var Lw = side === "front" ? L : D;
      I.face(ctx, side, function () {
        var g = ctx.createLinearGradient(0, 0, 0, Z0);            /* 백악기 석회암: 희끄무레한 빛 */
        g.addColorStop(0, "#c9b48f"); g.addColorStop(1, "#ece0c6");
        ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, Z0 - CL);
        var g2 = ctx.createLinearGradient(0, Z0, 0, ZT);          /* 신생대 석회암: 붉은빛 */
        g2.addColorStop(0, "#c98a78"); g2.addColorStop(1, "#e2ab98");
        ctx.fillStyle = g2; ctx.fillRect(0, Z0 + CL, Lw, ZT - Z0 - CL);
        var R = K.rng(side === "front" ? 41 : 43), i;
        for (i = 0; i < Lw * 2.2; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.22)" : "rgba(70,40,25,.18)"; ctx.fillRect(R() * Lw, R() * ZT, 1.5, 1.5); }
        ctx.strokeStyle = "rgba(70,40,25,.30)"; ctx.lineWidth = 1.1;
        for (var zb = 12; zb < ZT; zb += 26) { if (Math.abs(zb - Z0) < 14) continue; ctx.beginPath(); ctx.moveTo(0, zb); ctx.bezierCurveTo(Lw * .3, zb + 2, Lw * .7, zb - 2, Lw, zb + 1); ctx.stroke(); }
        FOS[side].forEach(function (f) {
          if (f.r > 2) shell(f.u, f.z, f.r, f.a, false);
          else { ctx.fillStyle = "rgba(110,60,45,.6)"; ctx.beginPath(); ctx.arc(f.u, f.z, f.r, 0, 6.2832); ctx.fill(); }
        });
        var cg = ctx.createLinearGradient(0, Z0 - CL, 0, Z0 + CL);  /* 점토층 */
        cg.addColorStop(0, "#5a2a1a"); cg.addColorStop(.5, "#3a1a10"); cg.addColorStop(1, "#6b3322");
        ctx.fillStyle = cg; ctx.fillRect(0, Z0 - CL, Lw, CL * 2);
        ctx.save(); ctx.shadowColor = KC.orange; ctx.shadowBlur = 8; ctx.strokeStyle = "rgba(255,179,92,.7)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, Z0 + CL); ctx.lineTo(Lw, Z0 + CL); ctx.moveTo(0, Z0 - CL); ctx.lineTo(Lw, Z0 - CL); ctx.stroke(); ctx.restore();
        if (side === "front") log.forEach(function (q) { ctx.fillStyle = "rgba(25,14,8,.82)"; ctx.beginPath(); ctx.arc(UH + 14, zOf(q.z), 3.6, 0, 6.2832); ctx.fill(); });
        ctx.save(); ctx.setLineDash([7, 5]); ctx.strokeStyle = "#2f8fe0"; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(0, zOf(z)); ctx.lineTo(Lw, zOf(z)); ctx.stroke(); ctx.restore();
      });
      I.shade(ctx, side, function () { return ZT; });
    }
    function top() {
      var a = I.P(0, 0, ZT), c = I.P(L, D, ZT);
      var tg = ctx.createLinearGradient(a.x, a.y, c.x, c.y); tg.addColorStop(0, "#efc2b2"); tg.addColorStop(1, "#d39985");
      I.plane(ctx, ZT, tg, "rgba(255,255,255,.55)");
      var R = K.rng(77), i;
      ctx.strokeStyle = "rgba(110,60,45,.35)"; ctx.lineWidth = 1;
      for (i = 0; i < 6; i++) { var x0 = R() * L, y0 = R() * D, p1 = I.P(x0, y0, ZT), p2 = I.P(Math.min(L, x0 + 30 + R() * 60), Math.min(D, y0 + R() * 30), ZT); ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); }
      for (i = 0; i < 160; i++) { var q = I.P(R() * L, R() * D, ZT); ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.3)" : "rgba(120,60,45,.25)"; ctx.fillRect(q.x, q.y, 1.6, 1.2); }
      /* 지질 망치 */
      var h1 = I.P(150, 34, ZT), h2 = I.P(212, 72, ZT);
      ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(h1.x + 2, h1.y + 3); ctx.lineTo(h2.x + 2, h2.y + 3); ctx.stroke();
      ctx.strokeStyle = "#9a6a3c"; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(h2.x, h2.y); ctx.stroke(); ctx.lineCap = "butt";
      I.quad(ctx, I.P(204, 56, ZT + 4), I.P(222, 88, ZT + 4), I.P(226, 86, ZT + 4), I.P(208, 54, ZT + 4), "#59606b");
      I.quad(ctx, I.P(204, 56, ZT + 4), I.P(208, 54, ZT + 4), I.P(208, 54, ZT), I.P(204, 56, ZT), "#3c424b");
    }
    function loupe(cx, cy, r) {
      var zn = zone(z), R = K.rng(zn === "k" ? 91 : 93), i;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.clip();
      var bg = ctx.createRadialGradient(cx - r * .3, cy - r * .3, 4, cx, cy, r);
      if (zn === "k") { bg.addColorStop(0, "#f6ecd6"); bg.addColorStop(1, "#cdb994"); }
      else if (zn === "p") { bg.addColorStop(0, "#f0c3b3"); bg.addColorStop(1, "#c98a78"); }
      else { bg.addColorStop(0, "#7a3a24"); bg.addColorStop(1, "#3a1a10"); }
      ctx.fillStyle = bg; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      for (i = 0; i < 90; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.25)" : "rgba(60,30,20,.2)"; ctx.fillRect(cx - r + R() * r * 2, cy - r + R() * r * 2, 1.8, 1.8); }
      if (zn === "k") [[-.45, -.42], [.18, -.55], [.55, -.08], [-.62, .12], [-.08, .05], [.35, .45], [-.32, .55]].forEach(function (q, k) { shell(cx + q[0] * r, cy + q[1] * r, 11 + R() * 8, R() * 6.28, true); });
      if (zn === "p") for (i = 0; i < 3; i++) shell(cx - r * .55 + R() * r * 1.1, cy - r * .55 + R() * r * 1.1, 3.2, R() * 6.28, true);
      var gl = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r); gl.addColorStop(0, "rgba(255,255,255,.35)"); gl.addColorStop(.4, "rgba(255,255,255,0)");
      ctx.fillStyle = gl; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
      ctx.strokeStyle = "#1c2233"; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r + 7, 0, 6.2832); ctx.stroke();
    }
    var dust = [];
    function drawModel() {
      var hiQ = null;
      log.forEach(function (q) { if (q.v >= 6 && (!hiQ || q.v > hiQ.v)) hiQ = q; });
      K.studio(ctx, 0, 0, LW, H, { x: I.P(L, D, 0).x - 60, y: I.P(L, D, 0).y - 40, rx: 250, ry: 52 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      face("front"); face("right"); top(); I.edges(ctx, ZT, ZT);
      var p = I.P(UH, D, zOf(z));
      K.glow(ctx, p.x, p.y, 4.5, "rgba(80,170,255,.95)", 3.2);
      var lc = { x: 452, y: 196 }, lr = 62;
      K.line(ctx, p, { x: lc.x - lr * .9, y: lc.y + lr * .45 }, "rgba(30,40,70,.55)", 1.4, [4, 4]);
      loupe(lc.x, lc.y, lr);
      dust.forEach(function (d) { ctx.fillStyle = "rgba(120,80,60," + (d.life * .9).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(d.x, d.y, 1.8, 0, 6.2832); ctx.fill(); });
      ctx.restore();
      var box = [0, LW];
      pill(ctx, "⛏ " + zs(z), p.x + 12, p.y - 10, { s: 12, c: KC.blue, box: box });
      var pa = I.P(14, D, 250), pb = I.P(14, D, 50);
      pill(ctx, "신생대 석회암", pa.x + 6, pa.y, { s: 11, c: "#ffd9c9", box: box });
      pill(ctx, "중생대 백악기 석회암", pb.x + 6, pb.y, { s: 11, c: "#fff0d0", box: box });
      I.label(ctx, L, 60, Z0, "점토층 (경계)", 44, 8, "#ffb35c", box);
      var zn = zone(z);
      pill(ctx, "🔍 " + zs(z) + " 확대", lc.x, lc.y + lr + 26, { s: 11.5, a: "center", c: KC.ink, box: box });
      pill(ctx, zn === "k" ? "크고 다양한 유공충이 빽빽" : (zn === "p" ? "아주 작은 유공충만 드물게" : "화석이 거의 없는 점토"), lc.x, lc.y + lr + 50, { s: 11.5, a: "center", c: zn === "k" ? "#fff0d0" : (zn === "p" ? "#ffd9c9" : KC.orange), box: box });
      K.warn(ctx, LW - 12, 24, "⚠ 점토층 두께는 보기 쉽게 과장 (실제 약 1 cm)", "right");
      pill(ctx, "구비오 협곡 절벽 · 경계 위아래 80 cm", LW - 12, 52, { s: 11, a: "right", c: KC.mute, box: box });
      if (hiQ) { K.bigText(ctx, "점토층만 이리듐 " + Math.round(hiQ.v / 0.3) + "배", 20, 48, 26, "#ffd35a"); K.bigText(ctx, "우주 먼지로는 설명이 안 된다", 20, 80, 16, "#ffffff"); }
      else if (log.length) { K.bigText(ctx, "아직은 평범한 석회암", 20, 48, 26, "#ffffff"); var lv = log[log.length - 1].v; K.bigText(ctx, "이리듐 " + lv.toFixed(1) + " ppb · " + (lv > 1 ? "바탕값보다 높다, 경계 쪽으로" : "바탕값 근처"), 20, 80, 16, "#bfe6ff"); }
      else { K.bigText(ctx, "1 cm 점토층의 비밀", 20, 48, 26, "#ffffff"); K.bigText(ctx, "높이를 골라 시료를 떠 보세요", 20, 80, 16, "#bfe6ff"); }
    }
    function drawChart() {
      /* 오른쪽 흰 카드 안의 밝은 그래프 */
      var LTc = K.LT, cx0 = RX + 4, bx = [RX, W];
      K.card(ctx, cx0, 0, W - cx0, H, "높이별 이리듐 농도 (분석한 시료)");
      var g = K.chart(ctx, { x: cx0 + 4, y: 44, w: W - cx0 - 8, h: H - 96, pl: 50, pb: 44, pt: 14, pr: 18, x0: 0, x1: 10, y0: -40, y1: 40, xt: 5, yt: 8, light: true,
        xl: "이리듐 농도 (ppb, 10억분의 1)", yl: "높이", yf: function (t) { return (t > 0 ? "+" : "") + Math.round(t); } });
      var py = g.Y(z);
      ctx.fillStyle = "rgba(232,89,12,.10)"; ctx.fillRect(g.L, g.Y(1.2), g.R - g.L, g.Y(-1.2) - g.Y(1.2));
      K.line(ctx, { x: g.L, y: g.Y(0) }, { x: g.R, y: g.Y(0) }, LTc.orange, 1.6, [5, 4]);
      lp(ctx, "점토층 (0 cm)", g.R - 4, g.Y(0) - 10, { s: 11, a: "right", c: LTc.orange, box: bx });
      K.line(ctx, { x: g.X(0.3), y: g.T }, { x: g.X(0.3), y: g.B }, "rgba(20,40,90,.35)", 1.2, [3, 4]);
      K.line(ctx, { x: g.L, y: py }, { x: g.R, y: py }, LTc.blue, 1.4, [6, 5]);
      var pts = log.slice().sort(function (a, b) { return a.z - b.z; }), hi = null;
      if (pts.length > 1) K.plot(ctx, g, pts.map(function (q) { return [q.v, q.z]; }), LTc.violet, { w: 2.4, light: true });
      pts.forEach(function (q) {
        var big = q.v >= 6; if (big && (!hi || q.v > hi.v)) hi = q;
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.X(q.v), g.Y(q.z), big ? 7 : 6, 0, 6.2832); ctx.fill();
        ctx.fillStyle = big ? LTc.red : LTc.violet; ctx.beginPath(); ctx.arc(g.X(q.v), g.Y(q.z), big ? 5 : 4, 0, 6.2832); ctx.fill();
      });
      if (hi) lp(ctx, "⚠ " + hi.v.toFixed(1) + " ppb · 바탕값의 약 " + Math.round(hi.v / 0.3) + "배", g.X(hi.v) - 12, g.Y(hi.z) + 28, { s: 12, a: "right", c: LTc.red, box: bx });
      if (!pts.length) lp(ctx, "아직 분석한 시료가 없습니다", (g.L + g.R) / 2, g.Y(20), { s: 12, a: "center", c: LTc.mute, box: bx });
      K.t(ctx, "바탕값 0.3", g.X(0.3) + 5, g.B - 8, { s: 11, w: "700", c: LTc.mute });
      var n0 = {}, nz = 0; log.forEach(function (q) { if (!n0[q.z]) { n0[q.z] = 1; nz++; } });
      K.tip(ctx, hi ? "점토층에서만 값이 치솟는다" : (nz ? "서로 다른 높이 " + nz + "곳 분석 · 경계 쪽도 떠 보기" : "높이를 골라 시료를 떠 보세요"), cx0 + 14, H - 44, W - cx0 - 28, hi ? false : null);
    }
    function draw() { ctx.clearRect(0, 0, W, H); drawModel(); drawChart(); }
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
      if (!REDUCE) { var p = I.P(UH, D, zOf(z)), R = K.rng(log.length * 7 + 3); for (var i = 0; i < 16; i++) dust.push({ x: p.x, y: p.y, vx: -10 + R() * 70, vy: -60 + R() * 50, life: 1 }); }
      draw(); say(); check();
    });
    /* 시료를 뜰 때 돌가루가 잠깐 튄다(저절로 멈춘다 · 미션과 무관) */
    K.animate(canvas, function (dt) {
      if (!dust.length) return;
      var s = dt / 1000;
      dust.forEach(function (d) { d.x += d.vx * s; d.y += d.vy * s; d.vy += 140 * s; d.life -= s * 1.4; });
      dust = dust.filter(function (d) { return d.life > 0; });
      draw();
    });
    draw(); say(); check();
  })();
  (function () {
    var canvas = $("a-c-ast"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h, d = 2;
    function tons(dd) { var t = 2.2 * Math.PI / 6 * Math.pow(dd, 3) * 10; return t >= 10000 ? (t / 10000).toFixed(1) + "조 톤" : Math.round(t).toLocaleString() + "억 톤"; }   // 1 km³ × 2.2 g/cm³ = 22억 톤
    var CR = (function () { var r = rng(23), a = []; for (var i = 0; i < 7; i++) a.push({ a: r() * 6.28, d: r() * .7, s: .1 + r() * .16 }); return a; })();
    /* ── 칙술루브 충돌구 블록: 유카탄 땅을 충돌구 한가운데로 잘라 낸 모형 (가로 400 km) ── */
    var CI = K.iso({ ox: 104, oy: 186, s: 0.8, L: 400, D: 110 }), CZ = 90, CB = 44;   /* CZ 지표 · CB 기반암 윗면 */
    function craterKm(dd) { return 180 * Math.pow(dd / 10, 0.78); }                   /* 칙술루브(지름 약 10 km → 약 180 km)에 맞춘 어림 */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var I = CI, L = I.L, D = I.D, LW = 600, dc = craterKm(d), rc = dc / 2, uc = L / 2;
      var cdep = clamp(10 + rc * .3, 12, 52);                                         /* 그림 속 깊이(과장) */
      function surf(u) { var x = Math.abs(u - uc) / rc; if (x >= 1.15) return CZ; if (x >= 1) return CZ + 5 * (1.15 - x) / .15; var z = x < .6 ? CZ + 5 - (cdep + 5) * .64 : CZ + 5 - (cdep + 5) * (1 - x * x); if (Math.abs(x - .45) < .1) z += 7 * (1 - Math.abs(x - .45) / .1); return z; }
      function base(u) { var x = Math.abs(u - uc) / rc; return CB + (x < .45 ? 22 * (1 - x / .45) : 0); }
      var fl = I.P(L, D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 120, y: fl.y - 40, rx: 250, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 앞면 단면 */
      I.face(ctx, "front", function (Lw) {
        var u, R = K.rng(51), i;
        ctx.save(); I.profile(ctx, "front", surf, 0); ctx.clip();
        var gg = ctx.createLinearGradient(0, 0, 0, CB + 22); gg.addColorStop(0, "#a86c6e"); gg.addColorStop(1, "#d9a2a1");
        ctx.fillStyle = gg; ctx.fillRect(0, 0, Lw, CZ + 10);
        for (i = 0; i < 520; i++) { var r = R(); ctx.fillStyle = r > .62 ? "rgba(30,25,30,.7)" : (r > .3 ? "rgba(255,255,255,.55)" : "rgba(200,120,110,.55)"); ctx.fillRect(R() * Lw, R() * (CB + 20), 1.6 + R() * 2, 1.6 + R() * 2); }
        /* 석회암·증발암 지층(기반암 위) */
        var BANDS = [["#e9dfc8", "#cfc09c"], ["#bfc4c9", "#9ea5ad"], ["#efe6d0", "#d6c9a6"], ["#d8c79e", "#bba674"]];
        ctx.beginPath(); ctx.moveTo(0, CZ + 10); for (u = 0; u <= Lw; u += 4) ctx.lineTo(u, CZ + 10); for (u = Lw; u >= 0; u -= 4) ctx.lineTo(u, base(u)); ctx.closePath(); ctx.save(); ctx.clip();
        for (i = 0; i < 4; i++) { var b0 = CB + i * 12, lg = ctx.createLinearGradient(0, b0, 0, b0 + 12); lg.addColorStop(0, BANDS[i][1]); lg.addColorStop(1, BANDS[i][0]); ctx.fillStyle = lg; ctx.fillRect(0, b0 - 30, Lw, 12 + (i === 3 ? 40 : 0) + (i === 0 ? 30 : 0)); }
        ctx.strokeStyle = "rgba(60,45,25,.3)"; ctx.lineWidth = 1; for (i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, CB + i * 12); ctx.lineTo(Lw, CB + i * 12); ctx.stroke(); }
        ctx.restore();
        /* 녹은 암석·각력암이 충돌구 바닥을 덮는다 */
        ctx.beginPath(); for (u = uc - rc; u <= uc + rc; u += 3) ctx.lineTo(u, surf(u)); for (u = uc + rc; u >= uc - rc; u -= 3) ctx.lineTo(u, surf(u) - 7 - 4 * Math.sin((u - uc) / rc * 3.14)); ctx.closePath();
        var mg = ctx.createLinearGradient(0, CZ - cdep - 10, 0, CZ); mg.addColorStop(0, "#3b2f3a"); mg.addColorStop(1, "#7a5a62");
        ctx.fillStyle = mg; ctx.fill();
        for (i = 0; i < 60; i++) { var pu = uc - rc + R() * rc * 2; K.planet(ctx, pu, surf(pu) - 2 - R() * 4, 1 + R() * 1.6, ["#e6dccb", "#9aa0a8", "#c98f6a"][i % 3], "#40343a"); }
        ctx.restore();
      });
      I.shade(ctx, "front", surf);
      /* 오른쪽 면 */
      I.face(ctx, "right", function (Lw) {
        var gg = ctx.createLinearGradient(0, 0, 0, CB); gg.addColorStop(0, "#a86c6e"); gg.addColorStop(1, "#d9a2a1");
        ctx.fillStyle = gg; ctx.fillRect(0, 0, Lw, CB);
        var lg = ctx.createLinearGradient(0, CB, 0, CZ); lg.addColorStop(0, "#c9bb98"); lg.addColorStop(1, "#ece2ca");
        ctx.fillStyle = lg; ctx.fillRect(0, CB, Lw, CZ - CB);
        ctx.strokeStyle = "rgba(60,45,25,.3)"; for (var i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, CB + i * 12); ctx.lineTo(Lw, CB + i * 12); ctx.stroke(); }
      });
      I.shade(ctx, "right", function () { return CZ; });
      /* 윗면: 얕은 바다 가장자리의 땅 + 반쪽 충돌구 */
      I.plane(ctx, CZ, "#cdb98a", "rgba(255,255,255,.5)");
      var Rt = K.rng(9), k;
      for (k = 0; k < 220; k++) { var q = I.P(Rt() * L, Rt() * D, CZ); ctx.fillStyle = Rt() > .5 ? "rgba(255,255,255,.25)" : "rgba(110,80,40,.25)"; ctx.fillRect(q.x, q.y, 2, 1.2); }
      var rimY = Math.min(rc * 1.0, D);
      /* 분출물 띠(테두리 밖) */
      ctx.beginPath(); for (k = 0; k <= 40; k++) { var a = Math.PI + k / 40 * Math.PI, p = I.P(uc + Math.cos(a) * rc * 1.35, D + Math.sin(a) * Math.min(rc * 1.35, D), CZ); if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.closePath(); ctx.fillStyle = "rgba(120,90,70,.35)"; ctx.fill();
      ctx.beginPath(); for (k = 0; k <= 40; k++) { var a2 = Math.PI + k / 40 * Math.PI, p2 = I.P(uc + Math.cos(a2) * rc, D + Math.sin(a2) * rimY, CZ); if (k) ctx.lineTo(p2.x, p2.y); else ctx.moveTo(p2.x, p2.y); }
      ctx.closePath();
      var c0 = I.P(uc, D, CZ), cg = ctx.createRadialGradient(c0.x, c0.y, 4, c0.x, c0.y, rc * .9);
      cg.addColorStop(0, "#4a3a40"); cg.addColorStop(.7, "#6e5558"); cg.addColorStop(1, "#a08070");
      ctx.fillStyle = cg; ctx.fill(); ctx.strokeStyle = "rgba(255,240,220,.75)"; ctx.lineWidth = 1.6; ctx.stroke();
      I.edges(ctx, CZ, CZ);
      /* 먼지 기둥과 소행성 */
      var np = Math.round(4 + d * .6);
      for (k = 0; k < np; k++) { var pr = K.rng(300 + k)(), pz = CZ + 20 + k * 9, pp = I.P(uc + (pr - .5) * rc * .8 + k * 3, D * .6, pz), prr = 6 + k * 1.3 + d * .5; ctx.fillStyle = "rgba(110,95,90," + (0.55 - k / np * .35).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(pp.x, pp.y, prr, 0, 6.2832); ctx.fill(); }
      var ar = 5 + d * 1.3, ax = 520, ay = 64 + ar;
      for (k = 0; k < 9; k++) { var tf = k / 9; K.glow(ctx, ax + 30 * tf * 3, ay - 18 * tf * 3, ar * (1 - tf * .7), "rgba(255," + Math.round(150 + 80 * tf) + ",60," + (0.5 - tf * .45).toFixed(2) + ")", 1.6); }
      K.planet(ctx, ax, ay, ar, "#9a8470", "#2a2019");
      K.arrow(ctx, { x: ax - ar - 4, y: ay + ar * .6 }, { x: ax - ar - 40, y: ay + ar * .6 + 26 }, "rgba(200,80,30,.8)", 2.4, 10);
      ctx.restore();
      var BX = [0, LW];
      I.label(ctx, uc + rc * .7, D, CZ - 4, "충돌구 지름 약 " + Math.round(dc) + " km", 34, -46, "#ffd9a8", BX);
      I.label(ctx, 20, D, CB + 30, "석회암·증발암 지층", -10, 44, "#f4e6c4", BX);
      I.label(ctx, L, D * .5, CB * .5, "화강암 기반암", 40, 26, "#ffd0d0", BX);
      I.label(ctx, uc - rc * .55, D, surf(uc - rc * .55) - 3, "녹은 암석·각력암", -30, 72, "#e0d0ff", BX);
      K.pill(ctx, "소행성 " + d.toFixed(1) + " km", ax, ay + ar + 22, { s: 12, a: "center", c: "#ffd9a8", box: BX });
      K.bigText(ctx, "충돌구 약 " + Math.round(dc) + " km", 18, 48, 27, "#ffffff");
      K.bigText(ctx, "소행성 지름 " + d.toFixed(1) + " km · 질량 " + tons(d), 18, 76, 16, "#ffd35a");
      K.warn(ctx, LW - 12, 26, "⚠ 깊이·소행성 크기는 과장 · 가로 약 400 km", "right");
      /* 판정 카드 */
      var RX = LW + 10, dep = deposit(d), x0 = RX + 18, x1 = W - 18, max = 40, hit = dep >= 7 && dep <= 9;
      K.card(ctx, RX, 0, W - RX, H, "지구 전체에 쌓이는 이리듐");
      K.t(ctx, (dep >= 100 ? Math.round(dep) : dep.toFixed(1)) + " ng/cm²", x0, 66, { s: 22, w: "900", c: hit ? K.LT.green : K.LT.ink });
      function MX(t) { return x0 + clamp(t / max, 0, 1) * (x1 - x0); }
      ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(x0, 84, x1 - x0, 14, 7); ctx.fill();
      ctx.fillStyle = "rgba(15,159,118,.25)"; ctx.fillRect(MX(7), 80, MX(9) - MX(7), 22);
      ctx.fillStyle = hit ? K.LT.green : (dep > 9 ? K.LT.red : K.LT.violet); ctx.beginPath(); ctx.roundRect(x0, 84, Math.max(7, MX(Math.min(dep, max)) - x0), 14, 7); ctx.fill();
      [0, 10, 20, 30, 40].forEach(function (t) { K.t(ctx, String(t), MX(t), 118, { s: 10, a: "center", c: K.LT.mute }); });
      K.t(ctx, "▲ 구비오 측정값 8 ± 1", MX(8) - 6, 138, { s: 11, w: "800", c: K.LT.green });
      K.row(ctx, "소행성 지름", d.toFixed(1) + " km", x0, x1, 172);
      K.row(ctx, "에베레스트산과 견주면", (d / 8.85).toFixed(1) + " 배", x0, x1, 198);
      K.row(ctx, "질량", "약 " + tons(d), x0, x1, 224);
      K.row(ctx, "충돌구 지름 (어림)", "약 " + Math.round(dc) + " km", x0, x1, 250);
      K.tip(ctx, hit ? "측정값과 맞습니다" : (dep < 7 ? "측정값보다 적습니다" : "측정값보다 많습니다"), x0 - 4, 266, x1 - x0 + 8, hit);
      K.t(ctx, "가정: 밀도 2.2 g/cm³ · 이리듐 0.5 ppm", x0, 330, { s: 10, c: K.LT.mute });
      K.t(ctx, "22%가 성층권으로 퍼짐", x0, 346, { s: 10, c: K.LT.mute });
      K.t(ctx, "오늘날 이 충돌구는 신생대 지층 아래 묻혀 있음", x0, 372, { s: 10, w: "700", c: K.LT.blue });
      $("a-ast-read").innerHTML = "<span class='k'>소행성 지름</span><span class='v y'>" + d.toFixed(1) + " km</span>" +
        "<span class='k'>질량</span><span class='v b'>약 " + tons(d) + "</span><span class='sub'>부피는 지름의 세제곱 · 지름 2배면 질량 8배</span>" +
        "<span class='k'>쌓이는 이리듐</span><span class='v " + (hit ? "g" : "r") + "'>" + (dep >= 100 ? Math.round(dep) : dep.toFixed(1)) + " ng/cm²</span>" +
        "<span class='ok " + (hit ? "g" : "r") + "'>" + (hit ? "측정값 8 ± 1과 맞습니다" : (dep < 7 ? "측정값보다 적습니다" : "측정값보다 많습니다")) + "</span>";
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
    var ECOL = { "--violet": "#9775fa", "--teal": "#20c997", "--coral": "#ff8a80", "--amber": "#fcc419" };
    /* ── 지구 달력 탑: 46억 년을 아래(1월 1일)에서 위(12월 31일)로 쌓은 지층 기둥. 높이 = 시간 ──
       왼쪽 큰 탑은 1년 전체, 오른쪽 작은 탑은 맨 위 11~12월을 같은 높이로 늘려 본 확대 모형 */
    var TZ = 290, TI = K.iso({ ox: 178, oy: 330, s: 0.8, L: 120, D: 120 }), ZI = K.iso({ ox: 432, oy: 330, s: 0.8, L: 100, D: 100 });
    var Z0D = 304, EDAY = ERAS.map(function (E) { return [(1 - E.from / 4600) * 365, (1 - E.to / 4600) * 365, ECOL[E.c], E.name]; });
    function column(I, d0, d1) {
      var zOf = function (d) { return clamp((d - d0) / (d1 - d0), 0, 1) * TZ; };
      ["front", "right"].forEach(function (sd) {
        I.face(ctx, sd, function (Lw) {
          EDAY.forEach(function (e, k) {
            var za = zOf(e[0]), zb = zOf(e[1]); if (zb - za <= 0) return;
            var g = ctx.createLinearGradient(0, za, 0, zb); g.addColorStop(0, K.tint(e[2], .82)); g.addColorStop(1, K.tint(e[2], 1.04));
            ctx.fillStyle = g; ctx.fillRect(0, za, Lw, zb - za);
            var R = K.rng(17 + k * 5 + (sd === "front" ? 0 : 50)), st = Math.max(5, (zb - za) / 9), zz;
            ctx.strokeStyle = "rgba(40,30,60,.18)"; ctx.lineWidth = 1;
            for (zz = za + st; zz < zb - 1; zz += st) { var w0 = (R() - .5) * 3; ctx.beginPath(); ctx.moveTo(0, zz + w0); ctx.bezierCurveTo(Lw * .3, zz + 2 - w0, Lw * .7, zz - 2 + w0, Lw, zz); ctx.stroke(); }
            for (zz = 0; zz < (zb - za) * Lw / 60; zz++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.28)" : "rgba(40,25,10,.18)"; ctx.fillRect(R() * Lw, za + R() * (zb - za), 1.6, 1.6); }
            ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, zb); ctx.lineTo(Lw, zb); ctx.stroke();
          });
        });
        I.shade(ctx, sd, function () { return TZ; });
      });
      var top = EDAY[3][2], a = I.P(0, 0, TZ), c = I.P(I.L, I.D, TZ), tg = ctx.createLinearGradient(a.x, a.y, c.x, c.y);
      tg.addColorStop(0, K.tint(top, 1.15)); tg.addColorStop(1, K.tint(top, .92));
      I.plane(ctx, TZ, tg, "rgba(255,255,255,.7)");
      I.edges(ctx, TZ, TZ);
      return zOf;
    }
    function ring(I, z, c) {
      var a = I.P(0, I.D, z), b = I.P(I.L, I.D, z), d = I.P(I.L, 0, z);
      ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 8; ctx.strokeStyle = c; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.stroke();
    }
    function flag(x, y, c) {                                /* 탑 옆면에 꽂은 깃발 */
      ctx.strokeStyle = "#343a40"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 26, y - 10); ctx.stroke();
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x + 26, y - 10); ctx.lineTo(x + 26, y - 30); ctx.lineTo(x + 46, y - 22); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(20,30,50,.5)"; ctx.lineWidth = 1; ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 600, LTc = K.LT, E = eraOf(day), ec = ECOL[E.c], i;
      var fl = TI.P(TI.L, TI.D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x + 120, y: fl.y - 30, rx: 280, ry: 30 });
      /* 큰 탑(1년 전체) */
      var zA = column(TI, 0, 365), acc = 0;
      ML.forEach(function (n, m) {
        var z1 = zA(acc), z2 = zA(acc + n), p1 = TI.P(0, TI.D, z1), q1 = TI.P(TI.L, TI.D, z1), r1 = TI.P(TI.L, 0, z1);
        if (m) { ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(q1.x, q1.y); ctx.lineTo(r1.x, r1.y); ctx.stroke(); ctx.setLineDash([]); }
        var pm = TI.P(0, TI.D, (z1 + z2) / 2);
        K.t(ctx, (m + 1) + "월", pm.x - 8, pm.y + 4, { s: 12, w: "800", a: "right", c: LTc.mute });
        acc += n;
      });
      var pc = TI.P(TI.L / 2, TI.D, zA(160));
      K.t(ctx, "선캄브리아", pc.x, pc.y - 4, { s: 14, w: "900", a: "center", c: "#ffffff" });
      K.t(ctx, "약 88%", pc.x, pc.y + 14, { s: 13, w: "900", a: "center", c: "#f3f0ff" });
      /* 확대 띠: 큰 탑의 11~12월 조각 → 작은 탑 */
      var m1 = TI.P(TI.L, 0, zA(Z0D)), m2 = TI.P(TI.L, 0, TZ), n1 = ZI.P(0, ZI.D, 0), n2 = ZI.P(0, ZI.D, TZ);
      ctx.fillStyle = "rgba(112,72,232,.10)"; ctx.beginPath(); ctx.moveTo(m2.x, m2.y); ctx.lineTo(n2.x, n2.y); ctx.lineTo(n1.x, n1.y); ctx.lineTo(m1.x, m1.y); ctx.closePath(); ctx.fill();
      K.line(ctx, m2, n2, "rgba(112,72,232,.55)", 1.3, [4, 4]); K.line(ctx, m1, n1, "rgba(112,72,232,.55)", 1.3, [4, 4]);
      ring(TI, zA(Z0D), "rgba(112,72,232,.9)");
      /* 작은 탑(11월 1일~12월 31일) */
      var zB = column(ZI, Z0D, 365);
      EDAY.forEach(function (e) {
        var za = zB(e[0]), zb = zB(e[1]); if (zb - za < 14) return;
        var p = ZI.P(ZI.L / 2, ZI.D, (za + zb) / 2);
        K.t(ctx, e[3] === "선캄브리아 시대" ? "선캄브리아" : e[3], p.x, p.y + 4, { s: 12, w: "900", a: "center", c: "#1b1f2a" });
      });
      [305, 315, 325, 335, 345, 355, 365].forEach(function (d) {
        var p = ZI.P(ZI.L, 0, zB(d - .5));
        ctx.strokeStyle = "rgba(20,40,90,.5)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 6, p.y); ctx.stroke();
        K.t(ctx, md(d), p.x + 9, p.y + 4, { s: 12, w: "700", c: LTc.mute });
      });
      EVENTS.forEach(function (e) {
        if (e.ma > 539 || e.ma < 1) return;
        var p = ZI.P(0, ZI.D, zB(e.day - .5));
        ctx.fillStyle = LTc.red; ctx.beginPath(); ctx.moveTo(p.x - 3, p.y); ctx.lineTo(p.x - 13, p.y - 5); ctx.lineTo(p.x - 13, p.y + 5); ctx.closePath(); ctx.fill();
      });
      /* 고른 날짜: 두 탑에 띠와 깃발 */
      var zc = zA(day - .5);
      ring(TI, zc, ec);
      var fp = TI.P(TI.L, TI.D * .5, zc); flag(fp.x, fp.y, ec);
      if (day > Z0D) { var zc2 = zB(day - .5); ring(ZI, zc2, ec); var fq = ZI.P(ZI.L, ZI.D * .5, zc2); flag(fq.x, fq.y, ec); }
      K.t(ctx, "▶ 생물 무리가 크게 바뀐 사건", LW - 14, H - 38, { s: 12, w: "800", a: "right", c: LTc.red });
      var zt = ZI.P(0, 0, TZ); K.t(ctx, "확대 · 11월~12월", zt.x, zt.y - 12, { s: 13, w: "900", a: "center", c: LTc.violet });
      K.t(ctx, "탑 높이 = 시간 · 깃발 = 고른 날", LW - 14, H - 16, { s: 12, w: "700", a: "right", c: LTc.mute });
      K.bigText(ctx, md(day) + " · " + E.name, 18, 44, 24, "#ffffff");
      K.bigText(ctx, fmt(maStart(day)) + " ~ " + fmt(maEnd(day)), 18, 70, 15, "#ffd35a");
      /* 오른쪽 흰 카드 */
      var RX = LW + 10, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "지구 달력 — 시대별 차지한 날수");
      K.t(ctx, md(day), x0, 66, { s: 24, w: "900", c: K.tint(ec, .62) });
      K.t(ctx, E.name, x1, 64, { s: 14, w: "900", a: "right", c: K.tint(ec, .55) });
      K.t(ctx, fmt(maStart(day)) + " ~", x0, 92, { s: 12, w: "700", c: LTc.mute });
      K.t(ctx, fmt(maEnd(day)), x0, 110, { s: 12, w: "700", c: LTc.mute });
      EDAY.forEach(function (e, k) {
        var nd = e[1] - e[0], y = 146 + k * 50;
        K.row(ctx, e[3], Math.round(nd * 10) / 10 + "일 · " + (nd / 365 * 100).toFixed(1) + "%", x0, x1, y, e[3] === E.name ? K.tint(e[2], .55) : LTc.ink);
        K.bar(ctx, x0, y + 10, x1 - x0, nd / 365, e[2]);
      });
      K.tip(ctx, "하루 ≈ 1260만 년 · 46억 년 = 1년", x0 - 4, H - 54, x1 - x0 + 8, null);

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
      if (got.b) { done("m1-3b"); $("m1-3b").innerHTML = "공룡이 사라진 날은 <b>12월 26일</b>. 중생대는 약 2주, 신생대는 약 5일입니다."; }
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
        box.innerHTML = (ok ? "<b>맞았습니다.</b> " : "<b>정답은 ㉡ 입니다.</b> ") + "공룡은 <b>중생대 육지에 살았던 특정 파충류 무리</b>만을 가리킵니다. 익룡, 어룡, 수장룡은 모두 중생대에 살았지만 <b>공룡이 아닙니다.</b> 중생대 파충류가 모두 공룡인 것은 아닙니다.";
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
    /* ── 지층 절벽 모형: 5.4억 년 동안 쌓인 바다 지층(아래가 오래됨). 층마다 앞으로 튀어나온 길이 = 그 층 화석으로 본 과의 수.
       대멸종 직후의 층은 화석이 적어 움푹 들어간다. 커서보다 젊은 층은 아직 쌓이지 않은 것처럼 흐리게 둔다 ── */
    var XI = K.iso({ ox: 310, oy: 300, s: 0.8, L: 160, D: 26 }), XZ = 240, XDT = 5;
    function xz(tt) { return (540 - tt) / 540 * XZ; }
    function xe(f) { return clamp(f / 1000, 0, 1.1) * 150; }
    function rockC(tt) { return tt > 252 ? "#b7c6a0" : (tt > 66 ? "#dba890" : "#e8d08e"); }
    function drawCliff(ctx, I) {
      var k, NL = 540 / XDT;
      for (k = 0; k < NL; k++) {
        var t1 = 540 - k * XDT, t2 = t1 - XDT, z0 = xz(t1), z1 = xz(t2), f = fam(t1 - XDT / 2), e = xe(f);
        var c = shade(rockC(t1 - 1), (k % 4 < 2) ? 1 : .92), fut = t2 < t - .01;
        ctx.globalAlpha = fut ? .1 : 1;
        I.box(ctx, 0, 0, z0, I.L, I.D + e, z1, shade(c, 1.12), c, shade(c, .74));
        if (!fut) {
          var R = K.rng(k * 13 + 5), nf = Math.round(f / 1000 * 7), j;
          for (j = 0; j < nf; j++) { var p = I.P(R() * I.L, I.D + e, z0 + (z1 - z0) * (.2 + R() * .6)); ctx.fillStyle = j % 3 ? "rgba(70,50,30,.75)" : "rgba(255,255,255,.8)"; ctx.beginPath(); ctx.ellipse(p.x, p.y, 1.8, 1.1, 0, 0, 6.2832); ctx.fill(); }
        }
      }
      ctx.globalAlpha = 1;
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 600, LTc = K.LT, I = XI, f = fam(t), i;
      var fl = I.P(I.L, I.D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 40, y: fl.y - 30, rx: 230, ry: 30 });
      drawCliff(ctx, I);
      /* 지금 보는 층: 파란 띠 */
      var zc = xz(t), ec = xe(f), a = I.P(0, I.D + ec, zc), b = I.P(I.L, I.D + ec, zc), d = I.P(I.L, 0, zc);
      ctx.save(); ctx.shadowColor = LTc.blue; ctx.shadowBlur = 8; ctx.strokeStyle = LTc.blue; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(d.x, d.y); ctx.stroke();
      var pz = I.P(I.L, 0, zc);
      lp(ctx, "◀ 지금 보는 층 · 과 약 " + Math.round(f), pz.x + 14, pz.y + 5, { s: 12, c: LTc.blue, box: [0, LW] });
      /* 시대 이름(오른쪽) */
      [[539, 252, "고생대"], [252, 66, "중생대"], [66, 0, "신생대"]].forEach(function (E, k) {
        var p = I.P(I.L, 0, (xz(Math.min(E[0], 540)) + xz(E[1])) / 2);
        var ly = p.y + 4 + (k === 2 ? -14 : 0); if (Math.abs(ly - pz.y - 5) < 24) return;
        K.t(ctx, E[2], p.x + 10, ly, { s: 12.5, w: "900", c: K.tint(rockC(E[1] + 1), .55) });
      });
      /* 찾은 대멸종: 왼쪽 지시선 이름표(서로 겹치지 않게 아래위로 민다) */
      var tags = [];
      EXT.forEach(function (e, k) { if (found[k]) { var ee = xe(fam(e.ma - 3)), p = I.P(0, I.D + ee, xz(e.ma - 3)); tags.push({ k: k, p: p, y: p.y }); } });
      tags.sort(function (u, w) { return u.y - w.y; });
      for (i = 1; i < tags.length; i++) if (tags[i].y - tags[i - 1].y < 25) tags[i].y = tags[i - 1].y + 25;
      tags.forEach(function (g0) {
        var q = { x: 150, y: g0.y };
        K.line(ctx, g0.p, q, "rgba(224,49,49,.8)", 1.3);
        ctx.fillStyle = LTc.red; ctx.beginPath(); ctx.arc(g0.p.x, g0.p.y, 3, 0, 6.2832); ctx.fill();
        lp(ctx, "⚠ " + EXT[g0.k].name, q.x - 4, q.y + 5, { s: 12, a: "right", c: LTc.red, box: [0, LW] });
      });
      K.t(ctx, "층이 앞으로 튀어나온 길이 = 그 층 화석으로 센 과의 수", 18, H - 16, { s: 12, w: "700", c: LTc.mute });
      K.t(ctx, "흐린 층 = 아직 쌓이지 않음", LW - 14, H - 16, { s: 12, w: "700", a: "right", c: LTc.mute });
      K.bigText(ctx, fmtT(t), 18, 44, 24, "#ffffff");
      K.bigText(ctx, t > 252 ? "고생대 바다" : (t > 66 ? "중생대 바다" : "신생대 바다"), 18, 70, 15, "#ffd35a");
      /* 오른쪽 흰 카드: 작은 그래프와 판정 */
      var RX = LW + 10, nearI = -1, px0 = RX + 18, px1 = W - 18;
      EXT.forEach(function (e, k) { if (Math.abs(t - e.ma) <= 5) nearI = k; });
      K.card(ctx, RX, 0, W - RX, H, "과의 수 변화 (화석 기록)");
      var g = K.chart(ctx, { x: RX + 4, y: 40, w: W - RX - 8, h: 210, pl: 44, pb: 30, pt: 10, pr: 14, x0: 540, x1: 0, y0: 0, y1: 1200, xt: 3, yt: 4, light: true,
        xf: function (q) { return q < 1 ? "현재" : (q / 100).toFixed(1) + "억"; } });
      [[539, 252, "#20c997"], [252, 66, "#ff8a80"], [66, 0, "#fcc419"]].forEach(function (E) { var x0 = g.X(Math.min(E[0], 540)), x1 = g.X(E[1]); ctx.fillStyle = rgba(E[2], .12); ctx.fillRect(x0, g.T, x1 - x0, g.B - g.T); ctx.fillStyle = E[2]; ctx.fillRect(x0, g.B - 4, x1 - x0, 4); });
      var all = [], seen = [];
      for (var tt = 540; tt >= 0; tt -= 2) { all.push([tt, fam(tt)]); if (tt >= t) seen.push([tt, fam(tt)]); }
      K.plot(ctx, g, all, "rgba(20,40,90,.22)", { light: true, w: 1.6, glow: false });
      if (seen.length > 1) K.plot(ctx, g, seen, LTc.blue, { light: true, w: 2.6 });
      EXT.forEach(function (e, k) { if (!found[k]) return; var xx = g.X(e.ma), yy = g.Y(fam(e.ma + 1)); ctx.fillStyle = LTc.red; ctx.beginPath(); ctx.moveTo(xx, yy - 4); ctx.lineTo(xx - 5, yy - 13); ctx.lineTo(xx + 5, yy - 13); ctx.closePath(); ctx.fill(); });
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.X(t), g.Y(f), 6, 0, 6.2832); ctx.fill();
      ctx.fillStyle = LTc.ink; ctx.beginPath(); ctx.arc(g.X(t), g.Y(f), 4, 0, 6.2832); ctx.fill();
      K.row(ctx, "과의 수 (개략)", "약 " + Math.round(f), px0, px1, 286, nearI >= 0 ? LTc.red : LTc.ink);
      K.row(ctx, "찾은 대멸종", nFound() + " / 5", px0, px1, 316, nFound() === 5 ? LTc.green : LTc.ink);
      K.bar(ctx, px0, 326, px1 - px0, nFound() / 5, nFound() === 5 ? LTc.green : LTc.red);
      K.tip(ctx, nearI >= 0 ? "⚠ " + EXT[nearI].name + " · 약 " + EXT[nearI].loss + "%" : "움푹 들어간 층을 찾으세요", px0 - 4, 350, px1 - px0 + 8, nearI >= 0 ? false : null);
      K.t(ctx, "곡선이 꺼진 뒤 어떻게 되는지도 보세요", px0, 410, { s: 12, w: "700", c: LTc.mute });
      near = -1;
      EXT.forEach(function (e, i) { if (Math.abs(t - e.ma) <= 5) near = i; });
      if (near >= 0 && !found[near]) { found[near] = 1; window.sthState("extFound", found); bars(); mission(); draw(); return; }
      $("a-ext-info").innerHTML = near >= 0 ? "<b>⚠️ " + EXT[near].name + " 대멸종</b> (약 " + fmtT(EXT[near].ma) + ") — " + EXT[near].desc :
        "<b>" + fmtT(t) + "</b> · 절벽이 움푹 들어간 층(곡선이 갑자기 꺼지는 곳)으로 커서를 옮겨 보세요. 꺼진 뒤에는 곡선이 어떻게 되는지도 눈여겨보세요.";
    }
    /* ── 다섯 대멸종 = 지층 기둥 다섯 개. 기둥 전체 = 멸종 직전의 종(100%). 찾으면 사라진 몫이 빨간 빈 유리로 바뀐다 ── */
    function bars() {
      var W2 = c2._w, H2 = c2._h, LTc = K.LT;
      ctx2.clearRect(0, 0, W2, H2);
      K.studio(ctx2, 0, 0, W2, H2, { x: 560, y: 236, rx: 360, ry: 22 });
      var HC = 150, oyB = 196;
      EXT.forEach(function (e, i) {
        var cx = 286 + i * 124, I = K.iso({ ox: cx, oy: oyB, s: 1, L: 44, D: 44 }), lossZ = found[i] ? HC * e.loss / 100 : 0, zs = HC - lossZ;
        var c = rockC(e.ma - 1);
        var bp = I.P(I.L, I.D, 0);
        ctx2.fillStyle = "rgba(20,30,50,.18)"; ctx2.beginPath(); ctx2.ellipse(bp.x + 4, bp.y - 18, 52, 12, 0, 0, 6.2832); ctx2.fill();
        I.box(ctx2, 0, 0, 0, I.L, I.D, zs, K.tint(c, 1.12), c, K.tint(c, .74));
        ["front", "right"].forEach(function (sd) {
          I.face(ctx2, sd, function (Lw) {
            for (var zz = 8, k = 0; zz < zs; zz += 11, k++) {
              ctx2.fillStyle = k % 2 ? "rgba(255,255,255,.18)" : "rgba(60,40,20,.14)"; ctx2.fillRect(0, zz, Lw, Math.min(6, zs - zz));
            }
            var R = K.rng(i * 7 + (sd === "front" ? 1 : 2));
            for (var j = 0; j < zs / 6; j++) { ctx2.fillStyle = "rgba(70,50,30,.6)"; ctx2.beginPath(); ctx2.arc(3 + R() * (Lw - 6), 3 + R() * Math.max(1, zs - 6), 1.4, 0, 6.2832); ctx2.fill(); }
          });
        });
        if (lossZ > 0) {
          var red = i === near ? "rgba(224,49,49," : "rgba(232,89,12,";
          I.box(ctx2, 0, 0, zs, I.L, I.D, HC, red + ".16)", red + ".22)", red + ".30)");
          var p1 = I.P(0, I.D, HC), p2 = I.P(I.L, I.D, HC), p3 = I.P(I.L, 0, HC), p4 = I.P(0, 0, HC), q1 = I.P(0, I.D, zs), q2 = I.P(I.L, I.D, zs), q3 = I.P(I.L, 0, zs);
          ctx2.save(); ctx2.setLineDash([4, 3]); ctx2.strokeStyle = red + ".85)"; ctx2.lineWidth = 1.4;
          ctx2.beginPath(); ctx2.moveTo(q1.x, q1.y); ctx2.lineTo(p1.x, p1.y); ctx2.lineTo(p4.x, p4.y); ctx2.lineTo(p3.x, p3.y); ctx2.lineTo(q3.x, q3.y); ctx2.moveTo(p1.x, p1.y); ctx2.lineTo(p2.x, p2.y); ctx2.lineTo(p3.x, p3.y); ctx2.moveTo(p2.x, p2.y); ctx2.lineTo(q2.x, q2.y); ctx2.stroke(); ctx2.restore();
          var pm = I.P(I.L / 2, I.D, zs + lossZ / 2);
          lp(ctx2, "사라짐", pm.x, pm.y + 4, { s: 12, a: "center", c: i === near ? LTc.red : LTc.orange });
        }
        var top = I.P(0, 0, HC);
        K.t(ctx2, found[i] ? "약 " + e.loss + "%" : "?", top.x, top.y - 10, { s: 14, w: "900", a: "center", c: found[i] ? (i === near ? LTc.red : LTc.ink) : LTc.dim });
        K.t(ctx2, found[i] ? e.name : "아직 못 찾음", bp.x, bp.y + 22, { s: 12, w: "800", a: "center", c: found[i] ? (i === near ? LTc.red : LTc.ink) : LTc.dim });
        if (found[i]) K.t(ctx2, fmtT(e.ma), bp.x, bp.y + 38, { s: 11, w: "700", a: "center", c: LTc.mute });
      });
      K.card(ctx2, 10, 12, 200, H2 - 24, "사라진 종의 비율 (추정)");
      var big = near >= 0 && found[near] ? EXT[near] : null;
      K.t(ctx2, big ? big.name : nFound() + " / 5 찾음", 28, 74, { s: big ? 16 : 20, w: "900", c: big ? LTc.red : LTc.ink });
      K.t(ctx2, big ? "약 " + big.loss + "%" : "기둥 = 멸종 직전의 종", 28, 112, { s: big ? 30 : 12, w: big ? "900" : "700", c: big ? LTc.red : LTc.mute });
      K.t(ctx2, "가장 큰 멸종:", 28, 196, { s: 12, w: "700", c: LTc.mute });
      K.t(ctx2, found[2] ? "페름기 말 (약 96%)" : "?", 28, 218, { s: 13, w: "900", c: found[2] ? LTc.orange : LTc.dim });
    }
    function mission() {
      put("a-ext-n", nFound());
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
      (p.indexOf("㉢") === 0 ? "처음부터 정확히 짚었습니다. 이제 이리듐이라는 증거까지 갖췄습니다." : "1980년 이전에는 많은 과학자도 그렇게 생각했습니다. 1 cm 점토층의 이리듐이 생각을 바꿔 놓았습니다.") +
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
    var n = Math.min(200, window.sthState("varN") || 0), answered = !!window.sthState("varQ"), shownH = null;
    function binsOf(nn) { var b = [], i; for (i = 0; i < 10; i++) b.push(0); BIRDS.slice(0, nn).forEach(function (q) { b[clamp(Math.floor((q.p - 7) / 0.5), 0, 9)]++; }); return b; }
    /* ── 섬 블록: 왼쪽은 아직 안 잰 핀치 무리, 오른쪽은 부리 두께 측정판(0.5 mm 칸마다 잰 핀치를 쌓는다) ── */
    var VI = K.iso({ ox: 120, oy: 130, s: 0.74, L: 600, D: 96 }), VZ = 26, VB0 = 190, VBW = 40;
    var VF = (function () { var r = rng(321), a = []; for (var i = 0; i < 40; i++) a.push([12 + r() * 140, 10 + r() * 78, BIRDS[i * 5].p]); return a; })();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var bins = binsOf(n), i, LW = 640, LTc = K.LT, I = VI, L = I.L, D = I.D;
      if (!shownH || REDUCE) shownH = bins.slice();
      var fl = I.P(L, D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 150, y: fl.y - 40, rx: 280, ry: 34 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 섬 블록: 응회암 층 + 아래 바닷물 */
      ["front", "right"].forEach(function (sd) {
        I.face(ctx, sd, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, VZ); g.addColorStop(0, "#6e4f36"); g.addColorStop(1, "#a7784f");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, VZ);
          ctx.strokeStyle = "rgba(50,30,15,.35)"; ctx.lineWidth = 1; for (var k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(0, k * 6.5); ctx.bezierCurveTo(Lw * .3, k * 6.5 + 2, Lw * .7, k * 6.5 - 2, Lw, k * 6.5); ctx.stroke(); }
          var R = K.rng(sd === "front" ? 31 : 32); for (k = 0; k < Lw * .5; k++) { ctx.fillStyle = "rgba(40,25,10,.35)"; ctx.beginPath(); ctx.arc(R() * Lw, R() * VZ, .8 + R(), 0, 6.2832); ctx.fill(); }
          var wg = ctx.createLinearGradient(0, 0, 0, 10); wg.addColorStop(0, "rgba(20,90,170,.85)"); wg.addColorStop(1, "rgba(70,160,230,.7)");
          ctx.fillStyle = wg; ctx.fillRect(0, 0, Lw, 10);
          ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(Lw, 10); ctx.stroke();
        });
        I.shade(ctx, sd, function () { return VZ; });
      });
      var a0 = I.P(0, 0, VZ), c0 = I.P(L, D, VZ), tg = ctx.createLinearGradient(a0.x, a0.y, c0.x, c0.y);
      tg.addColorStop(0, "#c9a777"); tg.addColorStop(1, "#b48a58");
      I.plane(ctx, VZ, tg, "rgba(255,255,255,.5)");
      I.edges(ctx, VZ, VZ);
      /* 왼쪽: 아직 안 잰 핀치 무리(그림 하나 = 5마리) + 선인장 */
      [[30, 20], [120, 74], [70, 86]].forEach(function (q) {
        var p = I.P(q[0], q[1], VZ), cg = ctx.createLinearGradient(p.x - 5, 0, p.x + 5, 0); cg.addColorStop(0, "#5c9a3c"); cg.addColorStop(1, "#2f6b26");
        ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.beginPath(); ctx.ellipse(p.x + 5, p.y, 9, 3, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(p.x - 4.5, p.y - 30, 9, 30, 4.5); ctx.fill(); ctx.beginPath(); ctx.roundRect(p.x + 3, p.y - 22, 8, 5, 2.5); ctx.fill(); ctx.beginPath(); ctx.roundRect(p.x + 7, p.y - 30, 5, 12, 2.5); ctx.fill();
      });
      var nF = Math.round((200 - n) / 5);
      VF.slice(0, nF).sort(function (u, w) { return (u[0] + u[1]) - (w[0] + w[1]); }).forEach(function (q) { var p = I.P(q[0], q[1], VZ); shadowE(ctx, p.x, p.y + 1, 8, 2.5, .25); finch(ctx, p.x + 2, p.y - 7, .3, q[2], 1); });
      /* 오른쪽: 부리 두께 측정판 — 같은 칸의 핀치는 탑처럼 쌓는다(점 하나 = 1마리) */
      I.plane(ctx, VZ + .5, "rgba(250,244,230,.92)", "rgba(120,90,50,.55)", VB0, VB0 + 10 * VBW, 8, 88);
      for (i = 0; i <= 10; i++) {
        var u0 = VB0 + i * VBW, s1 = I.P(u0, 8, VZ + .5), s2 = I.P(u0, 88, VZ + .5);
        ctx.strokeStyle = i % 2 ? "rgba(120,90,50,.25)" : "rgba(120,90,50,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
        if (i % 2 === 0) { var tq = I.P(u0, D, VZ); K.t(ctx, (7 + i * .5) + (i === 10 ? " mm" : ""), tq.x - 10, tq.y + 34, { s: 12, w: "800", a: "center", c: LTc.ink }); }
      }
      var balls = [];
      for (var k = 0; k < 10; k++) {
        var cN = Math.round(shownH[k]);
        for (var j = 0; j < cN; j++) { var lv = Math.floor(j / 4), cell = j % 4; balls.push([VB0 + k * VBW + 11 + (cell % 2) * 14, 34 + Math.floor(cell / 2) * 24, VZ + 6 + lv * 9]); }
      }
      balls.sort(function (u, w) { return ((u[0] + u[1]) - (w[0] + w[1])) || (u[2] - w[2]); }).forEach(function (q) { var p = I.P(q[0], q[1], q[2]); K.planet(ctx, p.x, p.y, 5, "#8a7560", "#241c14"); });
      bins.forEach(function (c, k) { if (!c) return; var p = I.P(VB0 + k * VBW + 18, 46, VZ + 16 + Math.ceil(c / 4) * 9); K.t(ctx, String(c), p.x, p.y, { s: 12, w: "900", a: "center", c: LTc.ink }); });
      if (n) {
        var m = mean(BIRDS.slice(0, n)), um = VB0 + (m - 7) / .5 * VBW, b0 = I.P(um, D, VZ), b1 = I.P(um, D, VZ + 200);
        ctx.strokeStyle = LTc.orange; ctx.lineWidth = 2.2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); ctx.setLineDash([]);
        lp(ctx, "평균 " + m.toFixed(2) + " mm", b1.x + 6, b1.y + 4, { s: 12, c: LTc.orange, box: [0, LW] });
      } else {
        var pe = I.P(VB0 + 5 * VBW, 48, VZ + 60);
        lp(ctx, "잡아서 잰 핀치가 여기 쌓입니다", pe.x, pe.y, { s: 12, a: "center", c: LTc.mute, box: [0, LW] });
      }
      var pa = I.P(150, 40, VZ + 34), pb = I.P(VB0 + 8, 40, VZ + 34);
      if (nF > 0) K.arrow(ctx, pa, pb, "rgba(20,40,90,.55)", 2.4, 10);
      ctx.restore();
      var pf = I.P(60, 0, VZ + 50);
      lp(ctx, nF > 0 ? "아직 안 잰 핀치 " + (200 - n) + "마리" : "섬의 핀치를 모두 쟀습니다", pf.x, pf.y, { s: 12, a: "center", c: LTc.ink, box: [0, LW] });
      K.bigText(ctx, n ? "잰 핀치 " + n + " / 200마리" : "가뭄 전 중간땅핀치", 18, 40, 22, "#ffffff");
      K.t(ctx, "다프네메이저섬 · 점 하나 = 핀치 1마리 · 무리 그림 하나 = 5마리", 18, 64, { s: 12, w: "700", c: LTc.mute });
      /* ── 오른쪽 카드: 양 끝의 부리(미니어처) ── */
      var RX = LW + 10, part = BIRDS.slice(0, n), lo = 99, hi = 0;
      part.forEach(function (b) { lo = Math.min(lo, b.p); hi = Math.max(hi, b.p); });
      if (!n) { lo = 8.4; hi = 10.4; }
      K.card(ctx, RX, 0, W - RX, H, "같은 종, 다른 부리");
      shadowE(ctx, RX + 110, 150, 50, 7, .22);
      finch(ctx, RX + 110, 120, 1.25, lo, n ? 1 : .4);
      K.t(ctx, (n ? "가장 얇은 부리 " + lo.toFixed(1) : "얇은 부리") + " mm", RX + 125, 178, { s: 12, w: "800", a: "center", c: LTc.blue });
      shadowE(ctx, RX + 110, 272, 50, 7, .22);
      finch(ctx, RX + 110, 242, 1.25, hi, n ? 1 : .4);
      K.t(ctx, (n ? "가장 두꺼운 부리 " + hi.toFixed(1) : "두꺼운 부리") + " mm", RX + 125, 300, { s: 12, w: "800", a: "center", c: LTc.orange });
      K.tip(ctx, n ? "차이 " + (hi - lo).toFixed(1) + " mm · 같은 섬, 같은 종" : "잡아서 재면 실제 값이 나옵니다", RX + 14, 318, W - RX - 28, null);
      K.t(ctx, "부리 두께는 조금 과장", W - 16, H - 14, { s: 11, a: "right", c: LTc.dim });
    }
    K.animate(canvas, function () {
      if (!shownH) return;
      var target = binsOf(n), moved = false;
      for (var k = 0; k < 10; k++) { var d0 = target[k] - shownH[k]; if (Math.abs(d0) > .05) { shownH[k] += d0 * .22; moved = true; } else shownH[k] = target[k]; }
      if (moved) draw();
    });
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
      why: ["막대가 하나가 아니라 넓게 퍼져 있습니다.", "이렇게 같은 종의 개체 사이에 나타나는 형질의 차이가 변이입니다. 변이는 환경이 바뀌기 전에 이미 있습니다.", "모두 중간땅핀치 한 종입니다. 분포가 끊기지 않고 이어져 있습니다.", "이 기록은 가뭄 전에 잰 것입니다."],
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
    /* ── 다프네메이저섬 블록: 윗면 가로축 = 부리 두께. 같은 두께의 핀치는 탑처럼 쌓는다 ── */
    var SI = K.iso({ ox: 92, oy: 186, s: 0.7, L: 500, D: 90 }), SZ = 30;
    var SEEDS = (function () { var r = rng(55), a = []; for (var i = 0; i < 90; i++) a.push([r() * 500, r() * 90]); return a; })();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var I = SI, L = I.L, D = I.D, LW = 600, LTc = K.LT, YB = D * .45;
      function XB(p) { return clamp((p - 6.8) / 5.6, 0, 1) * L; }
      var fl = I.P(L, D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 140, y: fl.y - 30, rx: 260, ry: 34 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 섬 블록: 앞·오른쪽 면은 응회암 층, 아래쪽은 바닷물 */
      ["front", "right"].forEach(function (sd) {
        I.face(ctx, sd, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, SZ); g.addColorStop(0, "#6e4f36"); g.addColorStop(1, "#a7784f");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, SZ);
          ctx.strokeStyle = "rgba(50,30,15,.35)"; ctx.lineWidth = 1; for (var k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(0, k * 7.5); ctx.bezierCurveTo(Lw * .3, k * 7.5 + 2, Lw * .7, k * 7.5 - 2, Lw, k * 7.5); ctx.stroke(); }
          var R = K.rng(sd === "front" ? 3 : 4); for (k = 0; k < Lw * .5; k++) { ctx.fillStyle = "rgba(40,25,10,.35)"; ctx.beginPath(); ctx.arc(R() * Lw, R() * SZ, .8 + R(), 0, 6.2832); ctx.fill(); }
          var wg = ctx.createLinearGradient(0, 0, 0, 12); wg.addColorStop(0, "rgba(20,90,170,.85)"); wg.addColorStop(1, "rgba(70,160,230,.7)");
          ctx.fillStyle = wg; ctx.fillRect(0, 0, Lw, 12);
          ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(Lw, 12); ctx.stroke();
        });
        I.shade(ctx, sd, function () { return SZ; });
      });
      /* 윗면: 메마른 땅 + 가시 열매 */
      var a0 = I.P(0, 0, SZ), c0 = I.P(L, D, SZ), tg = ctx.createLinearGradient(a0.x, a0.y, c0.x, c0.y);
      tg.addColorStop(0, "#d2b48c"); tg.addColorStop(1, "#b8915f");
      I.plane(ctx, SZ, tg, "rgba(255,255,255,.5)");
      ctx.strokeStyle = "rgba(90,60,30,.25)"; ctx.lineWidth = 1;
      for (var cr = 0; cr < 14; cr++) { var q1 = I.P((cr * 37) % L, (cr * 23) % D, SZ), q2 = I.P((cr * 37) % L + 18, (cr * 23) % D + 6, SZ); ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke(); }
      SEEDS.forEach(function (sd2) { var q = I.P(sd2[0], sd2[1], SZ); ctx.fillStyle = "#c99a2e"; ctx.beginPath(); ctx.arc(q.x, q.y, 1.6, 0, 6.2832); ctx.fill(); });
      /* 딱딱한 씨앗을 깰 수 있는 구간(가뭄 세기에 따라) */
      var th = theta(x), tx = XB(th);
      if (tx < L) I.plane(ctx, SZ + .3, "rgba(250,176,5,.28)", "rgba(230,150,0,.7)", tx, L, 0, D);
      I.edges(ctx, SZ, SZ);
      /* 핀치 탑 */
      var alive = [], order = BIRDS.map(function (b, i) { return i; }).sort(function (a, b) { return (XB(BIRDS[a].p) - XB(BIRDS[b].p)) || (POS[a].n - POS[b].n); });
      order.forEach(function (i) {
        var b = BIRDS[i], dead = shown && shown[i], q = I.P(XB(POS[i].k / 10), YB, SZ + 4 + (POS[i].n - 1) * 8);
        if (!dead) { alive.push(b); K.planet(ctx, q.x, q.y, 4.6, "#e8590c", "#7a2a05"); }
        else { ctx.fillStyle = "rgba(120,130,150,.55)"; ctx.beginPath(); ctx.arc(q.x, q.y, 4, 0, 6.2832); ctx.fill(); }
      });
      /* 평균 깃대 */
      function post(p, c, lab, dy) {
        var u = XB(p), b0 = I.P(u, D, SZ), b1 = I.P(u, D, SZ + 130);
        ctx.strokeStyle = c; ctx.lineWidth = 2.2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(b0.x, b0.y); ctx.lineTo(b1.x, b1.y); ctx.stroke(); ctx.setLineDash([]);
        K.pill(ctx, lab, b1.x + 6, b1.y + dy, { s: 11.5, c: c === LTc.orange ? "#ffd8a8" : "#e9ecef", box: [0, LW] });
      }
      post(MEAN0, "#495057", "가뭄 전 평균 " + MEAN0.toFixed(2), 0);
      if (shown && alive.length && alive.length < 200) post(mean(alive), LTc.orange, "생존자 평균 " + mean(alive).toFixed(2), -24);
      /* 눈금(앞쪽 모서리) */
      for (var p = 7; p <= 12; p++) { var tq = I.P(XB(p), D, SZ); ctx.fillStyle = "#212529"; ctx.fillRect(tq.x - 1, tq.y, 2, 5); K.t(ctx, p + " mm", tq.x - 6, tq.y + 18, { s: 10.5, w: "800", a: "center", c: LTc.ink }); }
      ctx.restore();
      I.label(ctx, Math.min(L - 10, tx + 30), D * .9, SZ, th < 12.2 ? "남은 딱딱한 씨앗을 깰 수 있는 부리" : "씨앗을 깰 핀치가 거의 없음", 30, -54, "#ffe8a3", [0, LW]);
      K.bigText(ctx, "살아 있는 핀치 " + alive.length + "마리", 18, 44, 25, alive.length < 200 ? "#ffd8a8" : "#ffffff");
      K.bigText(ctx, "점 하나 = 핀치 한 마리 · 회색 = 굶어 죽음", 18, 70, 14, "#ffd35a");
      /* 판정 카드 */
      var RX = LW + 10, p0 = RX + 18, p1 = W - 18, sr = alive.length / 2, ms = alive.length ? mean(alive) : 0, okR = sr >= 12 && sr <= 18;
      K.card(ctx, RX, 0, W - RX, H, "가뭄 실험");
      K.t(ctx, !shown ? "가뭄 전" : (okR ? "1977년과 비슷" : (sr > 18 ? "가뭄이 약함" : "개체군 위기")), p0, 62, { s: 20, w: "900", c: !shown ? LTc.ink : (okR ? LTc.green : LTc.red) });
      K.row(ctx, "가뭄 세기", String(x), p0, p1, 98);
      K.row(ctx, "살아남은 핀치", alive.length + " / 200", p0, p1, 124);
      K.row(ctx, "생존율", sr.toFixed(1) + " %", p0, p1, 150, okR ? LTc.green : LTc.ink);
      K.bar(ctx, p0, 160, p1 - p0, sr / 100, okR ? LTc.green : LTc.orange);
      K.row(ctx, "생존자 평균 부리", shown && alive.length ? ms.toFixed(2) + " mm" : "—", p0, p1, 198);
      K.row(ctx, "평균의 변화", shown && alive.length ? (ms - MEAN0 >= 0 ? "+" : "") + (ms - MEAN0).toFixed(2) + " mm" : "—", p0, p1, 224, LTc.orange);
      K.tip(ctx, "목표: 생존율 12~18 % (1977년 약 15 %)", p0 - 4, 240, p1 - p0 + 8, okR && !!shown);
      K.t(ctx, "점은 옆으로 움직이지 않습니다.", p0, 304, { s: 11, c: LTc.mute });
      K.t(ctx, "개체가 변한 것이 아니라", p0, 322, { s: 11, c: LTc.mute });
      K.t(ctx, "집단의 구성이 변합니다.", p0, 340, { s: 11, c: LTc.mute });
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
    var GI = K.iso({ ox: 150, oy: 160, s: 0.72, L: 470, D: 184 });
    function reset() { hist = [{ m: 9.4, env: null }]; zeroRun = 0; peak = 9.4; last = null; }
    function cur() { return hist[hist.length - 1].m; }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 560, LTc = K.LT, I = GI, NS = 4, show = hist.slice(-NS), off = hist.length - show.length;
      var fl = I.P(I.L, I.D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 150, y: fl.y - 40, rx: 270, ry: 30 });
      function GX(p) { return clamp((p - 6.5) / 7, 0, 1) * I.L; }
      function pdf(p, m) { return Math.exp(-(p - m) * (p - m) / 1.28) / (0.8 * 2.5066); }
      /* 세대 계단: 맨 앞 아래 칸이 가장 옛 세대, 한 세대가 지날 때마다 한 칸 뒤·위로 오른다. 판 위 공 하나 = 핀치 1마리(세대마다 40마리 표본) */
      for (var sg = NS - 1; sg >= show.length; sg--) { var gy0 = (NS - 1 - sg) * 46, gzb = sg * 22; ctx.globalAlpha = .28; I.box(ctx, 0, gy0, gzb - 10, I.L, gy0 + 34, gzb, "#e9edf2", "#d5dbe3", "#b9c2ce"); ctx.globalAlpha = 1; if (sg === show.length) { var gl = I.P(I.L, gy0 + 17, gzb); K.t(ctx, "다음 세대", gl.x + 12, gl.y + 4, { s: 12, w: "700", c: LTc.dim }); } }
      show.slice().reverse().forEach(function (q, jr) {
        var j = show.length - 1 - jr, gi = off + j, slot = j, y0 = (NS - 1 - slot) * 46, y1 = y0 + 34, zb = slot * 22;
        var base = q.env === "rain" ? "#7fb6e6" : (q.env ? "#eaa565" : "#b8c0c9"), cur0 = j === show.length - 1;
        I.box(ctx, 0, y0, zb - 10, I.L, y1, zb, K.tint(base, 1.12), base, K.tint(base, .72));
        var pr = I.P(I.L, y1, zb - 10), pq = I.P(0, y1, zb - 10);
        ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pq.x, pq.y); ctx.lineTo(pr.x, pr.y); ctx.stroke();
        var t0 = I.P(GX(9.4), y0 + 2, zb), t1 = I.P(GX(9.4), y1 - 2, zb);
        ctx.strokeStyle = "rgba(40,50,70,.55)"; ctx.lineWidth = 2; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(t0.x, t0.y); ctx.lineTo(t1.x, t1.y); ctx.stroke(); ctx.setLineDash([]);
        if (cur0) { var u0 = I.P(GX(10.4), y0 + 2, zb), u1 = I.P(GX(10.4), y1 - 2, zb); ctx.strokeStyle = LTc.yellow; ctx.lineWidth = 2.4; ctx.setLineDash([5, 3]); ctx.beginPath(); ctx.moveTo(u0.x, u0.y); ctx.lineTo(u1.x, u1.y); ctx.stroke(); ctx.setLineDash([]); }
        var balls = [];
        for (var k = 0; k < 14; k++) {
          var pc = 6.75 + k * .5, cN = Math.round(40 * .5 * pdf(pc, q.m));
          for (var b = 0; b < cN; b++) { var lv = Math.floor(b / 4), cell = b % 4; balls.push([GX(pc - .25) + 10 + (cell % 2) * 16, y0 + 10 + Math.floor(cell / 2) * 14, zb + 5 + lv * 9]); }
        }
        balls.sort(function (u, w) { return ((u[0] + u[1]) - (w[0] + w[1])) || (u[2] - w[2]); }).forEach(function (v0) { var p = I.P(v0[0], v0[1], v0[2]); K.planet(ctx, p.x, p.y, 4.6, q.env === "rain" ? "#5c7c9c" : "#8a7560", "#241c14"); });
        var fm = I.P(GX(q.m), y0 + 17, zb), ft = { x: fm.x, y: fm.y - 52 };
        ctx.strokeStyle = "#343a40"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(fm.x, fm.y); ctx.lineTo(ft.x, ft.y); ctx.stroke();
        var fc = q.env === "rain" ? LTc.blue : (q.env ? LTc.orange : "#868e96");
        ctx.fillStyle = fc; ctx.beginPath(); ctx.moveTo(ft.x, ft.y); ctx.lineTo(ft.x + 14, ft.y + 5); ctx.lineTo(ft.x, ft.y + 10); ctx.closePath(); ctx.fill();
        var pl = I.P(I.L, y0 + 17, zb);
        K.t(ctx, gi + "세대 · 평균 " + q.m.toFixed(2), pl.x + 12, pl.y + 4, { s: cur0 ? 13 : 12, w: cur0 ? "900" : "700", c: cur0 ? fc : LTc.mute });
        if (cur0) {
          var fb = I.P(GX(q.m) + 6, y1 + 2, zb);
          shadowE(ctx, fb.x, fb.y + 2, 26, 5, .25); finch(ctx, fb.x + 4, fb.y - 22, .72, q.m, 1);
        }
        if (slot === 0) for (var p = 7; p <= 13; p++) { var tq = I.P(GX(p), y1, zb - 10); K.t(ctx, p + (p === 13 ? " mm" : ""), tq.x - 8, tq.y + 18, { s: 12, w: "800", a: "center", c: LTc.ink }); }
      });
      K.t(ctx, "점선 = 처음 평균 9.40 · 노란 선 = 10.4 mm", 18, H - 14, { s: 12, w: "700", c: LTc.mute });
      var rain = hist.length > 1 && hist[hist.length - 1].env === "rain";
      K.bigText(ctx, (hist.length - 1) + "세대 · 평균 " + cur().toFixed(2) + " mm", 18, 40, 22, rain ? "#a5d8ff" : "#ffd8a8");
      K.t(ctx, "계단 한 칸 = 한 세대(위로 갈수록 나중) · 공 하나 = 핀치 1마리", 18, 64, { s: 12, w: "700", c: LTc.mute });
      /* 오른쪽 카드: 세대별 평균 */
      var RX = LW + 10;
      K.card(ctx, RX, 0, W - RX, H, "세대별 평균 부리 두께 (mm)");
      var g = K.chart(ctx, { x: RX + 4, y: 40, w: W - RX - 8, h: H - 88, pl: 44, pb: 34, pt: 12, pr: 44, x0: 0, x1: 12, y0: 8, y1: 12, xt: 4, yt: 4, light: true,
        xf: function (q) { return Math.round(q) + "세대"; } });
      K.line(ctx, { x: g.L, y: g.Y(10.4) }, { x: g.R, y: g.Y(10.4) }, LTc.yellow, 1.5, [5, 5]);
      K.t(ctx, "10.4", g.R + 6, g.Y(10.4) + 4, { s: 10.5, w: "800", c: LTc.yellow });
      if (hist.length > 1) K.plot(ctx, g, hist.map(function (q, i) { return [i, clamp(q.m, 8, 12)]; }), "#495057", { light: true, w: 2, glow: false });
      hist.forEach(function (q, i) {
        var c = q.env === "rain" ? LTc.blue : (q.env ? LTc.orange : "#868e96");
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(g.X(i), g.Y(clamp(q.m, 8, 12)), 6, 0, 6.2832); ctx.fill();
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(g.X(i), g.Y(clamp(q.m, 8, 12)), 4.2, 0, 6.2832); ctx.fill();
      });
      ctx.fillStyle = LTc.orange; ctx.beginPath(); ctx.arc(RX + 26, H - 18, 4.5, 0, 6.2832); ctx.fill(); K.t(ctx, "가뭄 세대", RX + 36, H - 14, { s: 10.5, w: "700", c: LTc.mute });
      ctx.fillStyle = LTc.blue; ctx.beginPath(); ctx.arc(RX + 116, H - 18, 4.5, 0, 6.2832); ctx.fill(); K.t(ctx, "폭우 세대", RX + 126, H - 14, { s: 10.5, w: "700", c: LTc.mute });
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
    var COLS = (function () { var r = rng(909), a = []; for (var i = 0; i < 170; i++) { var t = r() * 6.2832, d = Math.sqrt(r()) * .88; a.push({ x: Math.cos(t) * d, y: Math.sin(t) * d, s: .6 + r() * .6 }); } return a; })();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 560, LTc = K.LT, i;
      K.studio(ctx, 0, 0, LW, H, { x: 280, y: 352, rx: 260, ry: 34 });
      /* ── 반으로 자른 배양 접시: 뒤쪽 반의 한천 윗면에 군체, 앞쪽은 단면 ── */
      var cxd = 270, cyd = 262, rx = 222, ry = 82, wall = 30, agar = 24;
      var dg = sim ? sim.D : drug;
      var e0 = sim ? sim[upto] : { S: 1e6, R: r0 }, tot = e0.S + e0.R, fr = tot >= 1 ? e0.R / tot : 0;
      var nShow = tot >= 1 ? Math.max(1, Math.round(clamp(Math.log(tot) / Math.LN10 / 9, 0, 1) * COLS.length)) : 0, nRed = Math.round(nShow * fr), boosted = false;
      if (e0.R >= 1 && nRed < 1) { nRed = 1; boosted = true; }
      var agTop = dg ? "#e5dbff" : "#fff3bf", agBot = dg ? "#b197fc" : "#f2c94c";
      shadowE(ctx, cxd + 10, cyd + agar + 14, rx + 30, 22, .3);
      /* 뒤쪽 유리벽(안쪽 면) */
      ctx.fillStyle = "rgba(220,232,246,.55)"; ctx.beginPath(); ctx.ellipse(cxd, cyd - wall, rx, ry, 0, Math.PI, 0); ctx.lineTo(cxd + rx, cyd); ctx.ellipse(cxd, cyd, rx, ry, 0, 0, Math.PI, true); ctx.closePath(); ctx.fill();
      /* 한천 윗면(뒤쪽 반) */
      var ag = ctx.createRadialGradient(cxd - 40, cyd - 50, 10, cxd, cyd, rx);
      ag.addColorStop(0, agTop); ag.addColorStop(1, agBot);
      ctx.fillStyle = ag; ctx.beginPath(); ctx.ellipse(cxd, cyd, rx - 3, ry - 2, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
      /* 군체: 바깥(뒤)부터 그려 앞이 뒤를 가린다 */
      var list = [];
      for (i = 0; i < nShow; i++) list.push([COLS[i], i < nRed]);
      list.sort(function (a, b) { return Math.abs(b[0].y) - Math.abs(a[0].y); }).forEach(function (q) {
        var px = cxd + q[0].x * (rx - 14), py = cyd - Math.abs(q[0].y) * (ry - 8) - 3, rr = 3.4 * q[0].s + 2.2;
        if (py > cyd - 4) return;
        ctx.fillStyle = "rgba(60,40,10,.18)"; ctx.beginPath(); ctx.ellipse(px + 1.5, py + 1.5, rr, rr * .5, 0, 0, 6.2832); ctx.fill();
        K.planet(ctx, px, py - rr * .3, rr, q[1] ? "#ff6b6b" : "#74c0fc", q[1] ? "#a51111" : "#1864ab");
        if (q[1]) { ctx.strokeStyle = "rgba(224,49,49,.9)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(px, py - rr * .3, rr + 3, 0, 6.2832); ctx.stroke(); }
      });
      /* 단면: 한천 층 + 유리 바닥 + 양쪽 벽 */
      var sg = ctx.createLinearGradient(0, cyd, 0, cyd + agar); sg.addColorStop(0, K.tint(agBot, 1.06)); sg.addColorStop(1, K.tint(agBot, .82));
      ctx.fillStyle = sg; ctx.fillRect(cxd - rx + 3, cyd, rx * 2 - 6, agar);
      if (dg) { var Rd = K.rng(77); for (i = 0; i < 60; i++) { ctx.fillStyle = "rgba(95,61,196,.55)"; ctx.beginPath(); ctx.arc(cxd - rx + 8 + Rd() * (rx * 2 - 16), cyd + 4 + Rd() * (agar - 8), 1.6, 0, 6.2832); ctx.fill(); } }
      var nCut = Math.round(nShow / 6);
      for (i = 0; i < nCut; i++) { var qx = cxd - rx + 14 + ((i * 53) % (rx * 2 - 28)), hb = 3 + (i % 3); ctx.fillStyle = (i < Math.round(nCut * fr) || (boosted && i === 0)) ? "#ff6b6b" : "#74c0fc"; ctx.beginPath(); ctx.ellipse(qx, cyd, 5 + (i % 2) * 2, hb, 0, Math.PI, 0); ctx.fill(); }
      ctx.fillStyle = "rgba(200,215,232,.95)"; ctx.fillRect(cxd - rx - 3, cyd + agar, rx * 2 + 6, 6);
      ctx.fillStyle = "rgba(205,220,238,.8)"; ctx.fillRect(cxd - rx - 3, cyd - wall, 6, wall + agar + 6); ctx.fillRect(cxd + rx - 3, cyd - wall, 6, wall + agar + 6);
      ctx.strokeStyle = "rgba(110,130,160,.75)"; ctx.lineWidth = 1.6; ctx.strokeRect(cxd - rx - 3, cyd - wall, rx * 2 + 6, wall + agar + 6);
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(cxd, cyd - wall, rx, ry, 0, Math.PI, 0); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cxd - rx, cyd - 2); ctx.lineTo(cxd + rx, cyd - 2); ctx.stroke();
      /* 돋보기: 세균 막대 16개 중 내성 세균의 몫 */
      var lx = 466, ly = 104, lr = 58, nR = e0.R >= 1 ? Math.max(1, Math.round(16 * fr)) : 0, Rr = K.rng(5);
      K.line(ctx, { x: lx - lr * .7, y: ly + lr * .7 }, { x: cxd + 60, y: cyd - 40 }, "rgba(30,40,70,.5)", 1.4, [4, 4]);
      ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, lr, 0, 6.2832); ctx.clip();
      var lg = ctx.createRadialGradient(lx - 20, ly - 20, 4, lx, ly, lr); lg.addColorStop(0, agTop); lg.addColorStop(1, agBot);
      ctx.fillStyle = lg; ctx.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
      if (tot >= 1) for (i = 0; i < 16; i++) {
        var bx = lx - lr * .7 + Rr() * lr * 1.4, by = ly - lr * .7 + Rr() * lr * 1.4, an = Rr() * 3.14;
        ctx.save(); ctx.translate(bx, by); ctx.rotate(an); ctx.fillStyle = i < nR ? "#e03131" : "#1c7ed6"; ctx.beginPath(); ctx.roundRect(-9, -3.5, 18, 7, 3.5); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(-6, -2.5, 10, 2); ctx.restore();
      }
      ctx.restore();
      ctx.strokeStyle = "#1c2233"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(lx, ly, lr + 3, 0, 6.2832); ctx.stroke();
      lp(ctx, "🔍 세균 확대", lx, ly + lr + 26, { s: 12, a: "center", c: LTc.ink, box: [0, LW] });
      lp(ctx, dg ? "💊 항생제가 든 한천 배지 (단면)" : "항생제 없는 한천 배지 (단면)", cxd, cyd + agar + 34, { s: 12, a: "center", c: dg ? LTc.violet : "#b7791f", box: [0, LW] });
      if (boosted || (!sim && r0 > 0)) K.t(ctx, "⚠ 내성 세균은 보이게 크게 표시", 18, H - 14, { s: 12, w: "700", c: "#b7791f" });
      /* ── 오른쪽 흰 카드: 작은 그래프 + 수 ── */
      var RX = LW + 10, px0 = RX + 18, px1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "세균 수 (10배씩 커지는 눈금)");
      var g = K.chart(ctx, { x: RX + 4, y: 40, w: W - RX - 8, h: 210, pl: 46, pb: 30, pt: 10, pr: 14, x0: 0, x1: 12, y0: 0, y1: 10, xt: 4, yt: 5, light: true,
        xf: function (q) { return Math.round(q) + "시간"; }, yf: function (q) { return ["1", "100", "1만", "100만", "1억", "100억"][Math.round(q / 2)]; } });
      K.t(ctx, "● 보통 세균", px0, 274, { s: 12, w: "800", c: LTc.blue });
      K.t(ctx, "● 내성 세균", px0 + 110, 274, { s: 12, w: "800", c: LTc.red });
      if (sim) {
        [["S", LTc.blue], ["R", LTc.red]].forEach(function (Lr) {
          var seg = [];
          for (var t = 0; t <= upto; t++) {
            var nn = sim[t][Lr[0]];
            if (nn < 1 && t > 0 && sim[t - 1][Lr[0]] < 1) { if (seg.length > 1) K.plot(ctx, g, seg, Lr[1], { light: true, w: 2.6 }); seg = []; continue; }
            seg.push([t, clamp(Math.log(Math.max(nn, 1)) / Math.LN10, 0, 10)]);
          }
          if (seg.length > 1) K.plot(ctx, g, seg, Lr[1], { light: true, w: 2.6, dots: 2.4 });
          else if (seg.length === 1) { ctx.fillStyle = Lr[1]; ctx.beginPath(); ctx.arc(g.X(seg[0][0]), g.Y(seg[0][1]), 3.5, 0, 6.2832); ctx.fill(); }
        });
      } else lp(ctx, "배양하면 곡선이 그려집니다", (g.L + g.R) / 2, g.Y(5), { s: 12, a: "center", c: LTc.mute, box: [RX, W] });
      K.row(ctx, "보통 세균", num(e0.S) + "마리", px0, px1, 304, LTc.blue);
      K.row(ctx, "내성 세균", num(e0.R) + "마리", px0, px1, 328, LTc.red);
      K.tip(ctx, (sim ? "배양 " + upto + "시간 · " : "배양 전 · ") + "내성 비율 " + (tot >= 1 ? (fr > 0 && fr < 0.0001 ? "0.01% 미만" : (fr * 100).toFixed(fr < 0.01 ? 3 : 1) + "%") : "없음"), px0 - 4, 344, px1 - px0 + 8, sim && fr > .9 ? false : null);
      if (sim) {
        if (tot < 1) K.t(ctx, "전멸", cxd, cyd - 30, { s: 22, w: "900", a: "center", c: LTc.mute });
        K.bigText(ctx, "내성 세균 " + (tot >= 1 ? (fr < 0.0001 && fr > 0 ? "0.01% 미만" : (fr * 100).toFixed(fr < 0.01 ? 3 : 1) + "%") : "없음"), 18, 40, 24, fr > .9 ? "#ffb0b0" : "#ffffff");
        K.bigText(ctx, "배양 " + upto + "시간 뒤 · " + (dg ? "항생제 있음" : "항생제 없음"), 18, 66, 15, "#ffd35a");
      }
      if (!sim) {
        K.bigText(ctx, "배양 접시", 18, 40, 24, "#ffffff");
        K.bigText(ctx, (drug ? "항생제 있음" : "항생제 없음") + " · 내성 세균 " + r0 + "마리 섞임", 18, 66, 15, "#ffd35a");
      }
    }
    function mission() {
      if (ok.a) done("m2-5a"); if (ok.b) done("m2-5b"); if (ok.c) done("m2-5c"); if (okD) done("m2-5d");
      if (ok.a && ok.b && ok.c && okD) {
        window.sthMission("m2-5", true, "<span class='m-tag'>미션 완료</span>항생제는 내성 세균을 ‘만들지’ 않았습니다. 돌연변이로 <b>이미 있던</b> 내성 세균만 남겨 <b>선택</b>했고, 그 세균이 분열해 내성 유전자를 물려주었습니다. 핀치의 가뭄과 같은 원리입니다.");
        ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("b-abx-r").addEventListener("input", function (e) { if (running) return; r0 = +e.target.value; $("b-abx-r-val").textContent = r0 + "마리"; sim = null; draw(); });
    Array.prototype.forEach.call($("b-abx-drug").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { if (running) return; drug = +b.getAttribute("data-d"); segOn($("b-abx-drug"), b); sim = null; draw(); });
    });
    $("b-abx-run").addEventListener("click", function () {
      if (running) return;
      running = true; $("b-abx-run").disabled = true; $("b-abx-r").disabled = true;
      var R0 = r0, D = drug; sim = culture(R0, D); sim.D = D; upto = 0;
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
      { id: "e2b", label: "친구의 말 고쳐 주기", hint: "“항생제를 자주 먹으면 세균이 항생제에 적응해서 내성이 생긴대.”이 말에서 과학적으로 어색한 부분을 찾아, 배양 실험 결과를 근거로 고쳐 쓰세요." }
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
    var PAL = ["#2f9e44", "#0c8599", "#1c7ed6", "#7048e8", "#f59f00", "#e8590c", "#d6336c", "#5c940d", "#1864ab", "#9c36b5"];
    var FI = K.iso({ ox: 196, oy: 104, s: 0.8, L: 480, D: 200 }), FZ = 46, CS = 20;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var I = FI, L = I.L, D = I.D, LW = 600, LTc = K.LT, i;
      var fl = I.P(L, D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 160, y: fl.y - 50, rx: 260, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 흙 단면(앞면·오른쪽 면) — 앞줄 포기 아래 감자 덩이줄기 */
      ["front", "right"].forEach(function (sd) {
        I.face(ctx, sd, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, FZ); g.addColorStop(0, "#3d2b1f"); g.addColorStop(1, "#6b4a32");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, FZ);
          var R = K.rng(sd === "front" ? 7 : 8), k;
          for (k = 0; k < Lw * .8; k++) { ctx.fillStyle = R() > .5 ? "rgba(255,230,200,.12)" : "rgba(0,0,0,.18)"; ctx.fillRect(R() * Lw, R() * FZ, 1.5, 1.5); }
          var nC = sd === "front" ? COLS : ROWS;
          for (k = 0; k < nC; k++) {
            var idx = sd === "front" ? (ROWS - 1) * COLS + k : k * COLS + COLS - 1, u = sd === "front" ? k * CS + CS / 2 : k * CS + CS / 2;
            var dd = dead[idx], c = dd ? "#3b2a20" : K.tint(PAL[lay[idx] - 1], .55);
            [[-4, 26, 5.5], [4, 18, 4.5], [-1, 12, 3.5]].forEach(function (t) {
              var gg = ctx.createRadialGradient(u + t[0] - 1, FZ - t[1] + 1, .5, u + t[0], FZ - t[1], t[2] + 2);
              gg.addColorStop(0, dd ? "#5a4636" : "#e8c48a"); gg.addColorStop(1, dd ? "#1e140e" : "#a5743f");
              ctx.fillStyle = gg; ctx.beginPath(); ctx.ellipse(u + t[0], FZ - t[1], t[2] + 1.5, t[2], 0, 0, 6.2832); ctx.fill();
            });
            ctx.strokeStyle = dd ? "rgba(30,20,10,.6)" : "rgba(210,190,150,.6)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(u, FZ); ctx.lineTo(u - 2, FZ - 10); ctx.stroke();
            if (!dd) { ctx.fillStyle = PAL[lay[idx] - 1]; ctx.fillRect(u - 3, FZ - 4, 6, 3); }
          }
        });
        I.shade(ctx, sd, function () { return FZ; });
      });
      /* 윗면: 밭고랑 */
      for (var r0 = 0; r0 < ROWS; r0++) I.plane(ctx, FZ, r0 % 2 ? "#7a573c" : "#6b4a32", null, 0, L, r0 * CS, (r0 + 1) * CS);
      for (r0 = 0; r0 < ROWS; r0++) { var a1 = I.P(0, r0 * CS + CS / 2, FZ), a2 = I.P(L, r0 * CS + CS / 2, FZ); ctx.strokeStyle = "rgba(40,25,15,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a1.x, a1.y); ctx.lineTo(a2.x, a2.y); ctx.stroke(); }
      I.edges(ctx, FZ, FZ);
      /* 감자 포기(뒤에서 앞으로) */
      for (var s0 = 0; s0 < ROWS + COLS - 1; s0++) {
        for (var rr = Math.max(0, s0 - COLS + 1); rr <= Math.min(ROWS - 1, s0); rr++) {
          var cI = s0 - rr; i = rr * COLS + cI;
          var p = I.P(cI * CS + CS / 2, rr * CS + CS / 2, FZ), c = PAL[lay[i] - 1];
          ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(p.x + 2, p.y + 1, 6, 2.4, 0, 0, 6.2832); ctx.fill();
          if (dead[i]) {
            ctx.strokeStyle = "#2b1d14"; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 4, p.y - 6); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 3, p.y - 7); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 5, p.y - 3); ctx.stroke();
            ctx.fillStyle = "rgba(60,45,35,.9)"; ctx.beginPath(); ctx.ellipse(p.x - 4, p.y - 6, 2.4, 1.4, .4, 0, 6.2832); ctx.ellipse(p.x + 3, p.y - 7, 2.2, 1.2, -.4, 0, 6.2832); ctx.fill();
          } else {
            var lg = ctx.createRadialGradient(p.x - 2, p.y - 9, .5, p.x, p.y - 6, 7);
            lg.addColorStop(0, "#b2f2bb"); lg.addColorStop(1, "#2b8a3e");
            ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(p.x - 2.5, p.y - 5, 4.2, 0, 6.2832); ctx.arc(p.x + 2.8, p.y - 6, 4, 0, 6.2832); ctx.arc(p.x, p.y - 9, 4, 0, 6.2832); ctx.fill();
            ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p.x, p.y - 12, 2.2, 0, 6.2832); ctx.fill();
          }
        }
      }
      ctx.restore();
      K.bigText(ctx, title, 18, 40, 19, title.indexOf("발생") >= 0 || title.indexOf("기근") >= 0 ? "#ffb0b0" : "#ffffff");
      K.t(ctx, "역병균 A → 품종 ①만 · 역병균 B → 품종 ③만 감염, 이웃한 같은 품종으로 번짐", 18, 392, { s: 10.5, w: "700", c: LTc.mute });
      /* 판정 카드: 해마다의 수확 */
      var RX = LW + 10;
      K.card(ctx, RX, 0, W - RX, H, "해마다의 수확 (100 = 럼퍼만 심은 풍년)");
      var g = K.chart(ctx, { x: RX + 4, y: 40, w: W - RX - 8, h: 250, pl: 34, pb: 36, pt: 12, pr: 12, x0: 0, x1: 6, y0: 0, y1: 100, xt: 1, yt: 4, light: true, xf: function () { return ""; } });
      K.line(ctx, { x: g.L, y: g.Y(60) }, { x: g.R, y: g.Y(60) }, LTc.red, 1.4, [5, 4]);
      var bw = (g.R - g.L) / 6;
      YNAME.forEach(function (yr, yi) {
        var xx = g.L + yi * bw + 5, ww = bw - 12, dz = 6;
        K.t(ctx, "'" + (yr % 100), xx + ww / 2, g.B + 15, { s: 10.5, c: LTc.mute, a: "center", w: "700" });
        if (YEARS[yi]) K.t(ctx, YEARS[yi] === 1 ? "A" : "B", xx + ww / 2, g.B + 29, { s: 9.5, c: LTc.red, a: "center", w: "900" });
        if (bars[yi] == null) return;
        var by = g.Y(bars[yi]), cc = bars[yi] < 60 ? "#e03131" : "#2f9e44";
        ctx.fillStyle = K.tint(cc, 1.25); ctx.beginPath(); ctx.moveTo(xx, by); ctx.lineTo(xx + dz, by - dz * .8); ctx.lineTo(xx + ww + dz, by - dz * .8); ctx.lineTo(xx + ww, by); ctx.closePath(); ctx.fill();
        ctx.fillStyle = K.tint(cc, .7); ctx.beginPath(); ctx.moveTo(xx + ww, by); ctx.lineTo(xx + ww + dz, by - dz * .8); ctx.lineTo(xx + ww + dz, g.B - dz * .8); ctx.lineTo(xx + ww, g.B); ctx.closePath(); ctx.fill();
        ctx.fillStyle = cc; ctx.fillRect(xx, by, ww, g.B - by);
        K.t(ctx, String(Math.round(bars[yi])), xx + ww / 2, by - 9, { s: 11, w: "900", a: "center", c: LTc.ink });
      });
      K.t(ctx, "60 기근선", g.R, g.Y(60) - 5, { s: 10, a: "right", c: LTc.red, w: "800" });
      var lx = RX + 18;
      for (var k = 1; k <= Math.min(n, 5); k++) { ctx.fillStyle = PAL[k - 1]; ctx.beginPath(); ctx.arc(lx + 5, 326, 5, 0, 6.2832); ctx.fill(); K.t(ctx, NUM.charAt(k - 1) + (100 - 5 * (k - 1)), lx + 13, 330, { s: 10.5, w: "700", c: LTc.ink }); lx += 52; }
      if (n > 5) K.t(ctx, "… ⑩" + (100 - 5 * 9), lx, 330, { s: 10.5, w: "700", c: LTc.mute });
      K.t(ctx, "꽃 색 = 품종 · 숫자 = 수확량", RX + 18, 350, { s: 10, c: LTc.mute });
      if (bars.length === 6) { var avg = bars.reduce(function (a, b) { return a + b; }, 0) / 6; K.t(ctx, "6년 평균 " + avg.toFixed(1), W - 18, 384, { s: 15, w: "900", a: "right", c: avg >= 87 ? LTc.green : LTc.ink }); }
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "🥔 " + t.n + "품종 → 평균 <b>" + t.avg + "</b>, 최저 " + t.min + " " + (t.ok ? "✅" : "❌ " + t.why); });
      if (rows.length) $("c-farm-info").innerHTML = "<b>설계 기록</b><br>" + rows.join("<br>");
    }
    function check() {
      if (okA) { done("m3-2a"); put("m3-2a", "1품종 밭은 2년 동안 최고의 수확을 냈지만, 역병이 온 해에는 <b>240포기가 전멸</b>했습니다."); }
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
    for (var i = 0; i < 200; i++) PTS.push({ x: 44 + pr() * 440, y: 54 + pr() * 214 });
    function index() {
      var tot = N[0] + N[1] + N[2] + N[3], s = 0, rich = 0;
      N.forEach(function (c) { if (c > 0) { rich++; s += (c / tot) * (c / tot); } });
      return { tot: tot, rich: rich, D: tot ? 1 - s : 0 };
    }
    var DI = K.iso({ ox: 134, oy: 100, s: 0.78, L: 380, D: 160 }), DZ = 22;
    var SPC = ["#2f9e44", "#0c8599", "#e8590c", "#f783ac"];
    function tree(x, y, sp) {                                   /* x, y = 월드 좌표(숲 바닥) */
      var I = DI, p = I.P(x, y, DZ);
      ctx.fillStyle = "rgba(0,0,0,.22)"; ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + 1, 7, 2.6, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#6b4a2e"; ctx.fillRect(p.x - 1.2, p.y - 8, 2.4, 8);
      if (sp === 1) { I.tree(ctx, x, y, DZ, .8); return; }
      var c = SPC[sp], g = ctx.createRadialGradient(p.x - 3, p.y - 15, 1, p.x, p.y - 12, 9);
      g.addColorStop(0, K.tint(c, 1.45)); g.addColorStop(1, K.tint(c, .7));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y - 12, 7.5, 0, 6.2832); ctx.arc(p.x - 4, p.y - 9, 5, 0, 6.2832); ctx.arc(p.x + 4, p.y - 9, 5, 0, 6.2832); ctx.fill();
      if (sp === 3) { ctx.fillStyle = "rgba(255,255,255,.85)"; [[-3, -14], [2, -11], [-1, -8], [4, -15]].forEach(function (q) { ctx.beginPath(); ctx.arc(p.x + q[0], p.y + q[1], 1, 0, 6.2832); ctx.fill(); }); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var I = index(), Q = DI, LW = 540, LTc = K.LT;
      var fl = Q.P(Q.L, Q.D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 120, y: fl.y - 40, rx: 220, ry: 34 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      ["front", "right"].forEach(function (sd) {
        Q.face(ctx, sd, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, DZ); g.addColorStop(0, "#4a3424"); g.addColorStop(1, "#7a573c");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, DZ);
          ctx.fillStyle = "#3f7d3a"; ctx.fillRect(0, DZ - 4, Lw, 4);
          var R = K.rng(sd === "front" ? 21 : 22); ctx.strokeStyle = "rgba(230,210,170,.35)"; ctx.lineWidth = 1;
          for (var k = 0; k < Lw / 12; k++) { var u = R() * Lw; ctx.beginPath(); ctx.moveTo(u, DZ - 4); ctx.lineTo(u + (R() - .5) * 8, 4 + R() * 8); ctx.stroke(); }
        });
        Q.shade(ctx, sd, function () { return DZ; });
      });
      var a0 = Q.P(0, 0, DZ), c0 = Q.P(Q.L, Q.D, DZ), tg = ctx.createLinearGradient(a0.x, a0.y, c0.x, c0.y);
      tg.addColorStop(0, "#8cc265"); tg.addColorStop(1, "#5f9e45");
      Q.plane(ctx, DZ, tg, "rgba(255,255,255,.5)");
      ctx.save(); ctx.setLineDash([6, 5]); ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.4;
      var b1 = Q.P(10, 10, DZ), b2 = Q.P(Q.L - 10, 10, DZ), b3 = Q.P(Q.L - 10, Q.D - 10, DZ), b4 = Q.P(10, Q.D - 10, DZ);
      ctx.beginPath(); ctx.moveTo(b1.x, b1.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y); ctx.closePath(); ctx.stroke(); ctx.restore();
      Q.edges(ctx, DZ, DZ);
      var list = [], k = 0;
      N.forEach(function (c, sp) { for (var j = 0; j < c; j++, k++) list.push({ x: 14 + (PTS[k].x - 44) / 440 * (Q.L - 28), y: 14 + (PTS[k].y - 54) / 214 * (Q.D - 28), sp: sp }); });
      list.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); }).forEach(function (q) { tree(q.x, q.y, q.sp); });
      ctx.restore();
      if (!I.tot) lp(ctx, "나무가 한 그루도 없습니다", 270, 190, { s: 12, a: "center", c: LTc.mute, box: [0, LW] });
      K.bigText(ctx, "다양성 지수 D = " + I.D.toFixed(3), 18, 38, 22, I.D >= .6 ? "#8ff0c8" : (I.D <= .3 ? "#ffb0b0" : "#ffffff"));
      K.t(ctx, "숲 조사 구역 · 나무 한 그루 = 한 그루", 18, H - 12, { s: 10.5, w: "700", c: LTc.mute });
      /* 오른쪽 카드: 비율과 지수 */
      var RX = LW + 10, p0 = RX + 18, p1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "종별 비율");
      N.forEach(function (c, sp) {
        var y = 56 + sp * 40, pp = I.tot ? c / I.tot : 0;
        K.t(ctx, NAME[sp], p0, y, { s: 11.5, w: "800", c: c ? LTc.ink : LTc.dim });
        K.t(ctx, c ? Math.round(pp * 100) + "%" : "없음", p1, y, { s: 11.5, w: "900", a: "right", c: LTc.mute });
        K.bar(ctx, p0, y + 8, p1 - p0, pp, SPC[sp]);
      });
      K.row(ctx, "종 풍부도 · 전체", I.rich + "종 · " + I.tot + "그루", p0, p1, 228);
      var dc = I.D >= .6 ? LTc.green : (I.D <= .3 ? LTc.red : LTc.ink);
      K.t(ctx, "D", p0, 268, { s: 12, w: "800", c: LTc.mute });
      K.t(ctx, I.D.toFixed(3), p0 + 24, 270, { s: 24, w: "900", c: dc });
      K.bar(ctx, p0, 282, p1 - p0, clamp(I.D, 0, 1), dc);
      K.t(ctx, "0", p0, 308, { s: 10, c: LTc.dim }); K.t(ctx, "1", p1, 308, { s: 10, a: "right", c: LTc.dim });

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
    /* 들판 블록과 종이 사는 자리 [x, y, 높이] */
    var WI = K.iso({ ox: 290, oy: 124, s: 0.8, L: 440, D: 300 }), WZ = 30;
    var WPOS = { grass: [100, 210], hopper: [190, 270], rabbit: [80, 100], mouse: [230, 150], frog: [300, 200], oak: [340, 50], bird: [340, 50, 75], snake: [200, 40, 16], hawk: [150, 120, 190] };
    var phase = 0, flowing = !REDUCE, painting = false;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var web = WEBS[kind], dead = cascade(web, removed[kind]), LTc = K.LT, I = WI, LW = 640, i;
      var fl = I.P(I.L, I.D, 0);
      K.studio(ctx, 0, 0, LW, H, { x: fl.x - 120, y: fl.y - 40, rx: 300, ry: 34 });
      /* ── 들판 블록: 앞·오른쪽 면은 흙 단면, 윗면은 풀밭 + 연못 + 바위 ── */
      ["front", "right"].forEach(function (sd) {
        I.face(ctx, sd, function (Lw) {
          var g = ctx.createLinearGradient(0, 0, 0, WZ); g.addColorStop(0, "#5a3d28"); g.addColorStop(.75, "#7a5236"); g.addColorStop(1, "#4f7a26");
          ctx.fillStyle = g; ctx.fillRect(0, 0, Lw, WZ);
          ctx.fillStyle = "#5f9e2f"; ctx.fillRect(0, WZ - 4, Lw, 4);
          var R = K.rng(sd === "front" ? 61 : 62), k;
          for (k = 0; k < Lw * .4; k++) { ctx.fillStyle = R() > .5 ? "rgba(255,230,190,.25)" : "rgba(30,15,5,.3)"; ctx.fillRect(R() * Lw, R() * (WZ - 6), 1.6, 1.6); }
          ctx.strokeStyle = "rgba(240,220,190,.35)"; ctx.lineWidth = 1; for (k = 0; k < Lw / 14; k++) { var rx0 = R() * Lw; ctx.beginPath(); ctx.moveTo(rx0, WZ - 4); ctx.quadraticCurveTo(rx0 + 3, WZ - 10, rx0 - 2, WZ - 16 - R() * 6); ctx.stroke(); }
        });
        I.shade(ctx, sd, function () { return WZ; });
      });
      var a0 = I.P(0, 0, WZ), c0 = I.P(I.L, I.D, WZ), tg = ctx.createLinearGradient(a0.x, a0.y, c0.x, c0.y);
      tg.addColorStop(0, "#b2e06a"); tg.addColorStop(1, "#7cbf3c");
      I.plane(ctx, WZ, tg, "rgba(255,255,255,.55)");
      ctx.beginPath();
      for (i = 0; i <= 36; i++) { var an = i / 36 * 6.2832, pp = I.P(360 + Math.cos(an) * 62, 238 + Math.sin(an) * 50, WZ + .3); if (i) ctx.lineTo(pp.x, pp.y); else ctx.moveTo(pp.x, pp.y); }
      var pc = I.P(360, 238, WZ), pg = ctx.createRadialGradient(pc.x - 10, pc.y - 6, 4, pc.x, pc.y, 70); pg.addColorStop(0, "#9fd7ff"); pg.addColorStop(1, "#3a8fd6");
      ctx.fillStyle = pg; ctx.fill(); ctx.strokeStyle = "#5c7a3a"; ctx.lineWidth = 3; ctx.stroke();
      var R2 = K.rng(12);
      for (i = 0; i < 150; i++) {
        var gx0 = R2() * I.L, gy0 = R2() * I.D, dense = Math.hypot(gx0 - 100, gy0 - 210) < 70;
        if (Math.hypot((gx0 - 360) / 62, (gy0 - 238) / 50) < 1.1) continue;
        if (!dense && R2() > .45) continue;
        var q = I.P(gx0, gy0, WZ), gh = dense ? 9 : 5;
        ctx.strokeStyle = dense ? "#3f8f2a" : "rgba(70,130,40,.7)"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(q.x - 2, q.y); ctx.lineTo(q.x - 3, q.y - gh); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x + 1, q.y - gh - 2); ctx.moveTo(q.x + 2, q.y); ctx.lineTo(q.x + 4, q.y - gh + 1); ctx.stroke();
      }
      var rk = I.P(200, 40, WZ), rg = ctx.createRadialGradient(rk.x - 8, rk.y - 14, 2, rk.x, rk.y - 6, 26); rg.addColorStop(0, "#d6d9de"); rg.addColorStop(1, "#7d838e");
      shadowE(ctx, rk.x + 6, rk.y + 2, 28, 7, .25); ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(rk.x, rk.y - 8, 26, 14, 0, 0, 6.2832); ctx.fill();
      I.edges(ctx, WZ, WZ);
      var hasOak = !!byId(web, "oak");
      if (hasOak) {                                           /* 참나무 */
        var ot = I.P(340, 50, WZ), od = dead.oak;
        ctx.globalAlpha = od ? .35 : 1;
        shadowE(ctx, ot.x + 14, ot.y + 2, 40, 9, .25);
        var trk = ctx.createLinearGradient(ot.x - 6, 0, ot.x + 6, 0); trk.addColorStop(0, "#5a3b22"); trk.addColorStop(1, "#8a5e38");
        ctx.fillStyle = trk; ctx.fillRect(ot.x - 6, ot.y - 70, 12, 70);
        [[0, -96, 34], [-24, -78, 24], [24, -80, 26], [0, -70, 26]].forEach(function (c) { var cg = ctx.createRadialGradient(ot.x + c[0] - 8, ot.y + c[1] - 10, 3, ot.x + c[0], ot.y + c[1], c[2]); cg.addColorStop(0, "#7cc35a"); cg.addColorStop(1, "#2f6b26"); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(ot.x + c[0], ot.y + c[1], c[2], 0, 6.2832); ctx.fill(); });
        ctx.globalAlpha = 1;
      }
      /* 종이 사는 자리 */
      function at(id) { var p = WPOS[id]; var q = I.P(p[0], p[1], WZ + (p[2] || 0)); return { x: q.x, y: q.y }; }
      /* 먹히는 쪽 → 먹는 쪽 곡선 화살표(에너지가 흐르는 길) */
      web.forEach(function (s) {
        s.eat.forEach(function (f) {
          var p0 = at(f), p1 = at(s.id), gone = dead[s.id] || dead[f];
          var a = { x: p0.x, y: p0.y - 16 }, b = { x: p1.x, y: p1.y - 16 }, cx = (a.x + b.x) / 2 + (b.y - a.y) * .18, cy = (a.y + b.y) / 2 - 28 - Math.abs(b.x - a.x) * .08;
          function Q(t) { var u = 1 - t; return { x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y }; }
          var e1 = Q(.86), e0 = Q(.8);
          ctx.save(); ctx.strokeStyle = gone ? "rgba(120,130,150,.55)" : "rgba(28,126,214,.85)"; ctx.lineWidth = gone ? 1.4 : 2.4; if (gone) ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); for (var t = .05; t <= .86; t += .05) { var pt = Q(t); ctx.lineTo(pt.x, pt.y); } ctx.stroke(); ctx.restore();
          if (gone) return;
          K.arrow(ctx, e0, e1, "rgba(28,126,214,.95)", 2.4, 11);
          for (var k = 0; k < 2; k++) { var fp = Q(((phase + k * .5) % 1) * .86); K.glow(ctx, fp.x, fp.y, 2.2, "rgba(245,159,0,.95)", 3); }
        });
      });
      /* 생물(그림 글자) + 이름표 */
      web.slice().sort(function (u, w) { return at(u.id).y - at(w.id).y; }).forEach(function (s) {
        var p = at(s.id), d = dead[s.id], nm = s.n.split(" ").slice(1).join(" "), ic = s.n.split(" ")[0];
        if (s.id !== "oak") {
          if (!WPOS[s.id][2]) shadowE(ctx, p.x + 3, p.y + 1, 15, 4, .25);
          ctx.globalAlpha = d ? .3 : 1;
          ctx.font = "30px 'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = "#000";
          ctx.fillText(ic, p.x, p.y - 2);
          ctx.globalAlpha = 1;
        }
        if (d) { ctx.strokeStyle = d === 2 ? LTc.red : "#868e96"; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(p.x - 12, p.y - 30); ctx.lineTo(p.x + 12, p.y - 6); ctx.moveTo(p.x + 12, p.y - 30); ctx.lineTo(p.x - 12, p.y - 6); ctx.stroke(); }
        lp(ctx, nm + (d === 1 ? " (없앰)" : (d === 2 ? " 사라짐" : "")), p.x, p.y + 17, { s: 12, a: "center", c: d === 2 ? LTc.red : (d === 1 ? LTc.dim : (s.eat.length ? LTc.ink : "#2f9e44")), box: [0, LW] });
      });
      var lost0 = web.filter(function (s) { return dead[s.id]; }).length;
      K.bigText(ctx, "남은 종 " + (web.length - lost0) + " / " + web.length, 18, 40, 24, lost0 ? "#ffb0b0" : "#8ff0c8");
      K.t(ctx, "파란 화살표: 먹히는 쪽 → 먹는 쪽", 18, 64, { s: 12, w: "800", c: LTc.blue });
      /* 오른쪽 흰 카드: 종마다 상태 */
      var RX = LW + 10, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, kind === "simple" ? "종이 적은 들판 · 5종" : "종이 많은 들판 · 9종");
      web.forEach(function (s, k) {
        var d = dead[s.id], y = 64 + k * (kind === "simple" ? 40 : 28);
        K.row(ctx, s.n.split(" ").slice(1).join(" "), d === 1 ? "없앰" : (d === 2 ? "사라짐 ✕" : "살아 있음"), x0, x1, y, d === 2 ? LTc.red : (d === 1 ? LTc.dim : LTc.green));
      });
      var casc = web.some(function (s) { return dead[s.id] === 2; });
      K.tip(ctx, casc ? "먹이를 모두 잃은 종까지 사라졌다" : (lost0 ? "다른 먹이가 있어 나머지는 버틴다" : "없앨 종을 골라 보세요"), x0 - 4, H - 50, x1 - x0 + 8, casc ? false : (lost0 ? true : null));

      if (painting) return;
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
    playBtn("c-web-play", "⏸ 흐름 멈추기", "▶ 흐름 보기", function () { return flowing; }, function (x) { flowing = x; });
    K.animate(canvas, function (dt) { if (flowing) { phase = (phase + dt / 2400) % 1; painting = true; draw(); painting = false; } });
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
      (p.indexOf("㉢") === 0 ? "정확했습니다. 밭 설계 실험으로 직접 확인했습니다." : "병원균과 기술도 영향을 주었지만, 같은 병이 돌아도 품종이 섞인 밭은 무너지지 않았습니다. 결정적인 차이는 유전적 다양성이었습니다.") +
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
    { key: "r3", label: "③ 한 가지만 심은 밭" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
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
    { key: "r3", label: "③ 한 가지만 심은 밭" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
