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
    for (var i = 0; i < 46; i++) fos.push({ x: 88 + fr() * 150, z: -1.8 - fr() * 37.5, r: 3 + fr() * 4.5, a: fr() * 6.28 });
    for (var j = 0; j < 9; j++) fos.push({ x: 88 + fr() * 150, z: 1.8 + fr() * 37, r: 1.6, a: 0 });
    var T = 68, B = H - 44, LW = 330, CX0 = 80, CX1 = 246;
    function yOf(zz) { return B - (zz + 40) / 80 * (B - T); }
    function zs(zz) { return (zz > 0 ? "+" : (zz < 0 ? "−" : "")) + Math.abs(zz) + " cm"; }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽: 구비오 협곡의 지층 ── */
      K.stage(ctx, 0, 0, LW, H, "earth", { seed: 5, title: "구비오 협곡의 지층" });
      var y0 = yOf(0), cw = CX1 - CX0;
      function rock(top, bot, c1, c2) {
        var g = ctx.createLinearGradient(CX0, 0, CX1, 0);
        g.addColorStop(0, c2); g.addColorStop(.35, c1); g.addColorStop(1, c2);
        ctx.fillStyle = g; ctx.fillRect(CX0, top, cw, bot - top);
      }
      rock(T, y0 - 4, "#d9a796", "#a8786a");                     /* 신생대 초기 석회암(붉은빛) */
      rock(y0 + 4, B, "#e6d6b8", "#b59f7c");                     /* 백악기 말 석회암(희끌한 빛) */
      ctx.strokeStyle = "rgba(70,40,25,.28)"; ctx.lineWidth = 1;
      for (var zb = -36; zb <= 36; zb += 8) { if (Math.abs(zb) < 3) continue; var yb = yOf(zb); ctx.beginPath(); ctx.moveTo(CX0, yb); ctx.bezierCurveTo(CX0 + cw * .3, yb - 2, CX0 + cw * .7, yb + 2, CX1, yb); ctx.stroke(); }
      fos.forEach(function (f) {
        var fy = yOf(f.z);
        if (f.r > 2) {
          var fg = ctx.createRadialGradient(f.x - f.r * .3, fy - f.r * .3, .5, f.x, fy, f.r);
          fg.addColorStop(0, "rgba(255,250,235,.9)"); fg.addColorStop(1, "rgba(150,115,80,.75)");
          ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(f.x, fy, f.r, 0, 6.2832); ctx.fill();
          ctx.strokeStyle = "rgba(90,60,35,.6)"; ctx.lineWidth = .9; ctx.beginPath();
          for (var q = 0; q < 14; q++) { var aa = f.a + q * .55, rr = f.r * (1 - q / 16); if (q) ctx.lineTo(f.x + Math.cos(aa) * rr, fy + Math.sin(aa) * rr); else ctx.moveTo(f.x + Math.cos(aa) * rr, fy + Math.sin(aa) * rr); }
          ctx.stroke();
        } else { ctx.fillStyle = "rgba(110,70,50,.55)"; ctx.beginPath(); ctx.arc(f.x, fy, f.r, 0, 6.2832); ctx.fill(); }
      });
      /* 점토층 */
      var cg = ctx.createLinearGradient(0, y0 - 4, 0, y0 + 4);
      cg.addColorStop(0, "#6b3322"); cg.addColorStop(.5, "#3a1a10"); cg.addColorStop(1, "#5a2a1a");
      ctx.fillStyle = cg; ctx.fillRect(CX0, y0 - 4, cw, 8);
      ctx.save(); ctx.shadowColor = KC.orange; ctx.shadowBlur = 10; ctx.strokeStyle = "rgba(255,179,92,.55)"; ctx.lineWidth = 1;
      ctx.strokeRect(CX0, y0 - 4, cw, 8); ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 1; ctx.strokeRect(CX0, T, cw, B - T);
      pill(ctx, "신생대 석회암", CX0 + 8, T + 20, { s: 11.5, c: "#ffd9c9" });
      pill(ctx, "중생대 백악기 석회암", CX0 + 8, B - 10, { s: 11.5, c: "#fff0d0", box: [0, LW] });
      pill(ctx, "점토층", CX0 - 6, y0 + 5, { s: 11, a: "right", c: KC.orange, box: [0, LW] });
      /* 분석한 자리(채취 구멍) */
      log.forEach(function (q) { var hy = yOf(q.z); ctx.fillStyle = "rgba(20,12,8,.75)"; ctx.beginPath(); ctx.arc(CX1 - 10, hy, 3.4, 0, 6.2832); ctx.fill(); });
      /* 채취 위치 */
      var py = yOf(z);
      K.line(ctx, { x: CX0 - 4, y: py }, { x: LW, y: py }, KC.blue, 2, [6, 5], .95);
      K.glow(ctx, CX1, py, 4, rgba(KC.blue, .95), 3.2);
      pill(ctx, "⛏ " + zs(z), CX1 + 10, py + 5, { s: 11.5, c: KC.blue, box: [0, LW] });
      /* ── 오른쪽: 이리듐 농도 그래프 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 8, title: "높이별 이리듐 농도" });
      var g = K.chart(ctx, { x: RX, y: 54, w: W - RX, h: H - 54, pl: 60, pb: 44, pt: 14, pr: 22, x0: 0, x1: 10, y0: -40, y1: 40, xt: 5, yt: 8,
        xl: "이리듐 농도 (ppb, 10억분의 1)", yl: "높이", yf: function (t) { return (t > 0 ? "+" : "") + Math.round(t); } });
      K.line(ctx, { x: g.L, y: g.Y(0) }, { x: g.R, y: g.Y(0) }, KC.orange, 1.4, [5, 4], .7);
      pill(ctx, "점토층 (0 cm)", g.R - 4, g.Y(0) - 8, { s: 10.5, a: "right", c: KC.orange });
      K.line(ctx, { x: g.X(0.3), y: g.T }, { x: g.X(0.3), y: g.B }, "rgba(200,210,255,.5)", 1.2, [3, 4]);
      K.line(ctx, { x: g.L, y: py }, { x: g.R, y: py }, KC.blue, 1.2, [6, 5], .5);
      var pts = log.slice().sort(function (a, b) { return a.z - b.z; }), hi = null;
      if (pts.length > 1) K.plot(ctx, g, pts.map(function (q) { return [q.v, q.z]; }), KC.violet, { w: 2 });
      pts.forEach(function (q) {
        var big = q.v >= 6; if (big && (!hi || q.v > hi.v)) hi = q;
        K.glow(ctx, g.X(q.v), g.Y(q.z), big ? 5 : 4, rgba(big ? KC.red : KC.violet, .95), 3);
      });
      if (hi) pill(ctx, "⚠ " + hi.v.toFixed(1) + " ppb · 바탕값(0.3)의 약 " + Math.round(hi.v / 0.3) + "배", g.X(hi.v) - 12, g.Y(hi.z) + 26, { s: 11, a: "right", c: KC.red, box: [RX, W] });
      if (!pts.length) pill(ctx, "아직 분석한 시료가 없습니다", (g.L + g.R) / 2, g.Y(20), { s: 12, a: "center", c: KC.mute });
      K.t(ctx, "바탕값", g.X(0.3) + 5, g.B - 8, { s: 10, c: KC.dim });
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
    var CR = (function () { var r = rng(23), a = []; for (var i = 0; i < 7; i++) a.push({ a: r() * 6.28, d: r() * .7, s: .1 + r() * .16 }); return a; })();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 448, g = H - 44, k = 9.5;                       // 1 km = 9.5 px (산과 소행성은 같은 축척)
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 31, title: "크기 견주기 · 같은 축척" });
      var gr = ctx.createLinearGradient(0, g, 0, H);
      gr.addColorStop(0, "#3b2f25"); gr.addColorStop(1, "#16100c");
      ctx.fillStyle = gr; ctx.fillRect(0, g, LW, H - g);
      ctx.strokeStyle = "rgba(255,220,180,.35)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(LW, g); ctx.stroke();
      K.bracket(ctx, LW - 30 - 10 * k, LW - 30, 64, KC.mute, "10 km", false);
      /* 에베레스트산 */
      var mh = 8.85 * k, mx = 40, mt = { x: mx + mh * .9, y: g - mh };
      var mg = ctx.createLinearGradient(mx, 0, mx + mh * 1.9, 0);
      mg.addColorStop(0, "#5d6478"); mg.addColorStop(.48, "#8b93a8"); mg.addColorStop(.52, "#4a5064"); mg.addColorStop(1, "#2e3242");
      ctx.fillStyle = mg; ctx.beginPath(); ctx.moveTo(mx, g); ctx.lineTo(mt.x, mt.y); ctx.lineTo(mx + mh * 1.9, g); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(240,246,255,.92)"; ctx.beginPath(); ctx.moveTo(mt.x, mt.y);
      ctx.lineTo(mt.x - 20, mt.y + 22); ctx.lineTo(mt.x - 9, mt.y + 18); ctx.lineTo(mt.x - 2, mt.y + 26); ctx.lineTo(mt.x + 7, mt.y + 17); ctx.lineTo(mt.x + 21, mt.y + 23); ctx.closePath(); ctx.fill();
      pill(ctx, "에베레스트산 8.8 km", mt.x, g + 26, { s: 11, a: "center", c: KC.mute, box: [0, LW] });
      /* 소행성 */
      var r = d * k / 2, cx = 320, cy = g - r;
      K.glow(ctx, cx, cy, r * .9, "rgba(255,170,90,.25)", 1.35);
      K.planet(ctx, cx, cy, r, "#9a8470", "#2a2019");
      CR.forEach(function (c) {
        var px = cx + Math.cos(c.a) * c.d * r * .8, py = cy + Math.sin(c.a) * c.d * r * .8, rr = c.s * r;
        ctx.fillStyle = "rgba(30,22,16,.45)"; ctx.beginPath(); ctx.arc(px, py, rr, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(255,235,210,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(px + rr * .15, py + rr * .15, rr, 3.6, 5.6); ctx.stroke();
      });
      pill(ctx, "소행성 " + d.toFixed(1) + " km", cx, g + 26, { s: 12, a: "center", c: KC.orange, box: [0, LW] });
      K.bracket(ctx, cx - r, cx + r, cy - r - 10, KC.orange, null, true);
      /* ── 오른쪽: 쌓이는 이리듐 ── */
      var RX = LW + 8, dep = deposit(d), x0 = RX + 26, x1 = W - 30, max = 40, hit = dep >= 7 && dep <= 9;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 12, title: "지구 전체에 고르게 쌓이는 이리듐" });
      function MX(t) { return x0 + clamp(t / max, 0, 1) * (x1 - x0); }
      ctx.fillStyle = "rgba(63,211,163,.18)"; ctx.fillRect(MX(7), 70, MX(9) - MX(7), 52);
      ctx.strokeStyle = "rgba(63,211,163,.75)"; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]); ctx.strokeRect(MX(7), 70, MX(9) - MX(7), 52); ctx.setLineDash([]);
      meter(ctx, x0, 82, x1 - x0, 28, dep / max, hit ? KC.green : (dep > 9 ? KC.red : KC.violet));
      [0, 10, 20, 30, 40].forEach(function (t) { K.t(ctx, String(t), MX(t), 140, { s: 10.5, c: KC.mute, a: "center" }); });
      pill(ctx, "▲ 구비오 측정값 8 ± 1", MX(8), 166, { s: 11, a: "center", c: KC.green, box: [RX, W] });
      pill(ctx, (dep >= 100 ? Math.round(dep) : dep.toFixed(1)) + " ng/cm²" + (dep > max ? " ▶ 눈금 밖" : ""), x0, 206, { s: 18, c: hit ? KC.green : KC.ink, box: [RX, W] });
      K.t(ctx, "가정: 밀도 2.2 g/cm³ · 이리듐 0.5 ppm · 22%가 성층권으로 퍼짐", W - 16, H - 14, { s: 10, c: KC.mute, a: "right" });
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
    function band(x, y, w, h, c, r) {
      if (w <= 0) return;
      var g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, shade(c, 1.15)); g.addColorStop(.5, col(c)); g.addColorStop(1, shade(c, .55));
      ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r || 0); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.16)"; ctx.fillRect(x + 1, y + 2, Math.max(0, w - 2), h * .28);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "space", { seed: 46, title: "지구의 역사 46억 년 = 1년 달력" });
      var x0 = 40, x1 = 860, yb = 46, hb = 36;
      function xd(d) { return x0 + d / 365 * (x1 - x0); }
      ctx.save(); ctx.beginPath(); ctx.roundRect(x0, yb, x1 - x0, hb, 8); ctx.clip();
      ERAS.forEach(function (E) {
        var a = (1 - E.from / 4600) * 365, b = (1 - E.to / 4600) * 365;
        band(xd(a), yb, xd(b) - xd(a), hb, E.c);
      });
      ctx.restore();
      K.t(ctx, "선캄브리아 시대 · 약 88%", xd(160), yb + 23, { s: 13, w: "800", a: "center", c: "#ffffff" });
      var acc = 0;
      ML.forEach(function (n, m) { var xx = xd(acc); ctx.strokeStyle = "rgba(7,10,34,.55)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(xx, yb); ctx.lineTo(xx, yb + hb); ctx.stroke(); K.t(ctx, (m + 1) + "월", xd(acc + n / 2), yb + hb + 16, { s: 10.5, c: KC.mute, a: "center", w: "600" }); acc += n; });
      /* 확대: 11월 1일(305일째)~12월 31일 */
      var z0 = 304, zx0 = 120, zx1 = 860, zy = 156, zh = 44;
      function xz(d) { return zx0 + (d - z0) / (365 - z0) * (zx1 - zx0); }
      ctx.fillStyle = "rgba(162,136,245,.08)"; ctx.beginPath(); ctx.moveTo(xd(z0), yb + hb); ctx.lineTo(xd(365), yb + hb); ctx.lineTo(zx1, zy); ctx.lineTo(zx0, zy); ctx.closePath(); ctx.fill();
      K.line(ctx, { x: xd(z0), y: yb + hb }, { x: zx0, y: zy }, KC.line, 1.2, [4, 4]);
      K.line(ctx, { x: xd(365), y: yb + hb }, { x: zx1, y: zy }, KC.line, 1.2, [4, 4]);
      pill(ctx, "확대", 16, zy + 18, { s: 11, c: KC.violet });
      K.t(ctx, "11월~12월", 18, zy + 38, { s: 10.5, c: KC.mute });
      ctx.save(); ctx.beginPath(); ctx.roundRect(zx0, zy, zx1 - zx0, zh, 8); ctx.clip();
      band(zx0, zy, zx1 - zx0, zh, "--violet");
      ERAS.slice(1).forEach(function (E) {
        var a = (1 - E.from / 4600) * 365, b = (1 - E.to / 4600) * 365;
        band(xz(a), zy, xz(b) - xz(a), zh, E.c);
      });
      ctx.restore();
      ERAS.slice(1).forEach(function (E) {
        var a = (1 - E.from / 4600) * 365, b = (1 - E.to / 4600) * 365;
        K.t(ctx, E.name, (xz(a) + xz(b)) / 2, zy + 27, { s: 12.5, w: "900", a: "center", c: "#06202c" });
      });
      [305, 315, 325, 335, 345, 355, 365].forEach(function (d) { K.t(ctx, md(d), xz(d - .5), zy + zh + 17, { s: 10, c: KC.mute, a: "center", w: "600" }); });
      EVENTS.forEach(function (e) {
        if (e.ma > 539 || e.ma < 1) return;
        var xx = xz(e.day - .5);
        K.glow(ctx, xx, zy - 10, 2.4, rgba(KC.red, .95), 3);
        ctx.fillStyle = KC.red; ctx.beginPath(); ctx.moveTo(xx, zy - 1); ctx.lineTo(xx - 5, zy - 9); ctx.lineTo(xx + 5, zy - 9); ctx.closePath(); ctx.fill();
      });
      pill(ctx, "▼ 생물 무리가 크게 바뀐 사건", zx1, zy - 22, { s: 10.5, a: "right", c: KC.red });
      /* 커서 */
      var cx = xd(day - .5), E = eraOf(day);
      ctx.save(); ctx.shadowColor = "#ffffff"; ctx.shadowBlur = 8; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(cx, yb - 6); ctx.lineTo(cx, yb + hb + 4); ctx.stroke();
      if (day > z0) { var cz = xz(day - .5); ctx.beginPath(); ctx.moveTo(cz, zy - 4); ctx.lineTo(cz, zy + zh + 4); ctx.stroke(); }
      ctx.restore();
      pill(ctx, md(day) + " · " + E.name, clamp(cx, 90, 810), H - 36, { s: 15, a: "center", c: col(E.c) });
      K.t(ctx, fmt(maStart(day)) + " ~ " + fmt(maEnd(day)), clamp(cx, 110, 790), H - 10, { s: 11.5, c: KC.mute, a: "center" });

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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 54, title: "화석으로 남은 해양 생물 무리(과)의 수 — 개략도" });
      var g = K.chart(ctx, { x: 0, y: 40, w: W, h: H - 40, pl: 66, pb: 40, pt: 16, pr: 24, x0: 540, x1: 0, y0: 0, y1: 1200, xt: 6, yt: 4,
        xf: function (q) { return q < 1 ? "현재" : (q / 100).toFixed(1) + "억 년 전"; }, yl: "과의 수" });
      function X(tt) { return g.X(tt); }
      function Y(f) { return g.Y(f); }
      [[539, 252, "고생대", "--teal"], [252, 66, "중생대", "--coral"], [66, 0, "신생대", "--amber"]].forEach(function (E) {
        var a = X(Math.min(E[0], 540)), b = X(E[1]);
        ctx.fillStyle = rgba(E[3], .08); ctx.fillRect(a, g.T, b - a, g.B - g.T);
        ctx.fillStyle = rgba(E[3], .85); ctx.fillRect(a, g.B - 4, b - a, 4);
        pill(ctx, E[2], (a + b) / 2, g.B - 12, { s: 10.5, a: "center", c: col(E[3]) });
      });
      var pts = [];
      for (var tt = 540; tt >= 0; tt -= 1) pts.push([tt, fam(tt)]);
      var ag = ctx.createLinearGradient(0, g.T, 0, g.B);
      ag.addColorStop(0, rgba(KC.blue, .32)); ag.addColorStop(1, rgba(KC.blue, .02));
      ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(X(p[0]), Y(p[1])); else ctx.moveTo(X(p[0]), Y(p[1])); });
      ctx.lineTo(g.R, g.B); ctx.lineTo(g.L, g.B); ctx.closePath(); ctx.fillStyle = ag; ctx.fill();
      K.plot(ctx, g, pts, KC.blue, { w: 2.6 });
      EXT.forEach(function (e, i) {
        if (!found[i]) return;
        var xx = X(e.ma), yy = Y(fam(e.ma + 1));
        K.glow(ctx, xx, yy, 3.2, rgba(KC.red, .95), 3.4);
        ctx.fillStyle = KC.red; ctx.beginPath(); ctx.moveTo(xx, yy - 8); ctx.lineTo(xx - 7, yy - 20); ctx.lineTo(xx + 7, yy - 20); ctx.closePath(); ctx.fill();
        pill(ctx, e.name, clamp(xx, 110, 830), Math.max(g.T + 36, yy - 28 - (i % 2) * 22), { s: 10.5, a: "center", c: KC.red });
      });
      var cx = X(t), cyy = Y(fam(t));
      K.line(ctx, { x: cx, y: g.T }, { x: cx, y: g.B }, "#ffffff", 1.6, [5, 4], .75);
      K.glow(ctx, cx, cyy, 4.5, "rgba(255,255,255,.95)", 3.2);
      pill(ctx, fmtT(t), cx, g.T + 14, { s: 11, a: "center", c: KC.ink });

      near = -1;
      EXT.forEach(function (e, i) { if (Math.abs(t - e.ma) <= 5) near = i; });
      if (near >= 0 && !found[near]) { found[near] = 1; window.sthState("extFound", found); bars(); mission(); draw(); return; }
      $("a-ext-info").innerHTML = near >= 0 ? "<b>⚠️ " + EXT[near].name + " 대멸종</b> (약 " + fmtT(EXT[near].ma) + ") — " + EXT[near].desc :
        "<b>" + fmtT(t) + "</b> · 곡선이 갑자기 꺼지는 곳으로 커서를 옮겨 보세요. 꺼진 뒤에는 곡선이 어떻게 되는지도 눈여겨보세요.";
    }
    function bars() {
      var W2 = c2._w, H2 = c2._h;
      ctx2.clearRect(0, 0, W2, H2);
      K.stage(ctx2, 0, 0, W2, H2, "lab", { seed: 55, title: "사건별 멸종 규모 — 사라진 종의 비율(추정)" });
      var x0 = 260, x1 = 860;
      [0, 25, 50, 75, 100].forEach(function (p) { var gx = x0 + (x1 - x0) * p / 100; ctx2.strokeStyle = KC.grid; ctx2.lineWidth = 1; ctx2.beginPath(); ctx2.moveTo(gx, 44); ctx2.lineTo(gx, 236); ctx2.stroke(); K.t(ctx2, p + "%", gx, 246, { s: 10, a: "center", c: KC.dim }); });
      EXT.forEach(function (e, i) {
        var y = 48 + i * 38;
        pill(ctx2, found[i] ? e.name + " (" + fmtT(e.ma) + ")" : "아직 찾지 못한 사건", x0 - 14, y + 17, { s: 11.5, a: "right", c: found[i] ? (i === near ? KC.red : KC.ink) : KC.dim });
        if (found[i]) {
          meter(ctx2, x0, y, x1 - x0, 24, e.loss / 100, i === near ? KC.red : (e.loss > 90 ? KC.orange : "--teal"));
          K.t(ctx2, "약 " + e.loss + "%", x0 + 12, y + 17, { s: 12.5, w: "900", c: "#ffffff" });
        } else { meter(ctx2, x0, y, x1 - x0, 24, 0, KC.dim); K.t(ctx2, "?", x0 + 12, y + 17, { s: 12.5, w: "900", c: KC.mute }); }
      });
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var bins = binsOf(n), i, LW = 660;
      if (!shownH || REDUCE) shownH = bins.slice();
      K.stage(ctx, 0, 0, LW, H, "lab", { seed: 61, title: "부리 두께 분포 — 가뭄 전 중간땅핀치" });
      var g = K.chart(ctx, { x: 0, y: 44, w: LW, h: H - 44, pl: 56, pb: 42, pt: 14, pr: 18, x0: 7, x1: 12, y0: 0, y1: 60, xt: 10, yt: 3, xl: "부리 두께 (mm)", yl: "마리",
        xf: function (q) { return q.toFixed(1); } });
      bins.forEach(function (c, k) {
        var bx = g.X(7 + k * .5) + 4, bw = g.X(7.5) - g.X(7) - 8, hc = shownH[k], by = g.Y(hc);
        column(ctx, bx, by, bw, g.B - by, "--teal");
        if (c) K.t(ctx, String(c), bx + bw / 2, by - 6, { s: 11, w: "800", a: "center", c: KC.ink });
      });
      if (n) {
        var m = mean(BIRDS.slice(0, n)), mx = g.X(m);
        K.line(ctx, { x: mx, y: g.T }, { x: mx, y: g.B }, KC.orange, 2, [6, 4]);
        pill(ctx, "평균 " + m.toFixed(2) + " mm", mx + 8, g.T + 16, { s: 12, c: KC.orange, box: [0, LW] });
      } else pill(ctx, "그물로 핀치를 잡아 재 보세요", (g.L + g.R) / 2, g.Y(30), { s: 12, a: "center", c: KC.mute });
      /* ── 오른쪽: 양 끝의 부리 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "night", { seed: 62, title: "같은 종, 다른 부리" });
      pill(ctx, "잰 핀치 " + n + " / 200마리", RX + 16, 58, { s: 11.5, c: KC.yellow, box: [RX, W] });
      var part = BIRDS.slice(0, n), lo = 99, hi = 0;
      part.forEach(function (b) { lo = Math.min(lo, b.p); hi = Math.max(hi, b.p); });
      if (!n) { lo = 8.4; hi = 10.4; }
      finch(ctx, RX + 100, 110, 1.35, lo, n ? 1 : .35);
      pill(ctx, (n ? "가장 얇은 부리 " + lo.toFixed(1) : "얇은 부리") + " mm", RX + 116, 168, { s: 11, a: "center", c: KC.blue, box: [RX, W] });
      finch(ctx, RX + 100, 232, 1.35, hi, n ? 1 : .35);
      pill(ctx, (n ? "가장 두꺼운 부리 " + hi.toFixed(1) : "두꺼운 부리") + " mm", RX + 116, 292, { s: 11, a: "center", c: KC.orange, box: [RX, W] });
      K.t(ctx, "부리 두께는 조금 과장해 그렸습니다", W - 14, H - 10, { s: 9.5, a: "right", c: KC.dim });
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "night", { seed: 77, title: "점 하나 = 핀치 한 마리 (200마리) · 회색 = 굶어 죽음" });
      var x0 = 60, x1 = 860, yb = 300;
      function X(p) { return x0 + (p - 6.8) / 5.6 * (x1 - x0); }
      /* 메마른 땅 */
      var gr = ctx.createLinearGradient(0, yb + 8, 0, H);
      gr.addColorStop(0, "#4a3a27"); gr.addColorStop(1, "#1b140d");
      ctx.fillStyle = gr; ctx.beginPath(); ctx.roundRect(0, yb + 8, W, H - yb - 8, [0, 0, 14, 14]); ctx.fill();
      ctx.strokeStyle = "rgba(255,220,170,.4)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, yb + 8); ctx.lineTo(W, yb + 8); ctx.stroke();
      for (var p = 7; p <= 12; p += 1) { K.t(ctx, p + " mm", X(p), yb + 28, { s: 10.5, c: "#e9d6b8", a: "center", w: "700" }); ctx.fillStyle = "rgba(255,230,190,.5)"; ctx.fillRect(X(p) - .5, yb + 8, 1, 6); }
      K.t(ctx, "부리 두께 →", x1, yb + 48, { s: 11, c: "#cdb894", a: "right" });
      var th = theta(x), tx = X(clamp(th, 6.8, 12.4));
      var zg = ctx.createLinearGradient(tx, 0, x1, 0);
      zg.addColorStop(0, "rgba(255,196,46,.28)"); zg.addColorStop(1, "rgba(255,196,46,.06)");
      ctx.fillStyle = zg; ctx.fillRect(tx, 60, Math.max(0, x1 + 30 - tx), yb - 52);
      K.line(ctx, { x: tx, y: 60 }, { x: tx, y: yb + 8 }, KC.yellow, 1.6, [4, 4], .8);
      if (th < 12.2) pill(ctx, "남은 딱딱한 씨앗을 깨기에 충분한 부리 ▶", Math.min(tx + 8, 600), 80, { s: 11, c: KC.yellow });
      else pill(ctx, "남은 씨앗을 깰 수 있는 핀치가 거의 없습니다", x1, 80, { s: 11, a: "right", c: KC.yellow });
      var alive = [];
      BIRDS.forEach(function (b, i) {
        var dead = shown && shown[i], px = X(POS[i].k / 10), py = yb - (POS[i].n - 1) * 11;
        if (!dead) { alive.push(b); ball(ctx, px, py, 4.8, "--coral"); }
        else { ctx.fillStyle = "rgba(120,130,170,.45)"; ctx.beginPath(); ctx.arc(px, py, 4.2, 0, 6.2832); ctx.fill(); }
      });
      var mx = X(MEAN0);
      K.line(ctx, { x: mx, y: 96 }, { x: mx, y: yb + 8 }, KC.mute, 2, [5, 4]);
      pill(ctx, "가뭄 전 평균 " + MEAN0.toFixed(2), mx - 8, 112, { s: 11, a: "right", c: KC.mute });
      if (shown && alive.length && alive.length < 200) {
        var ms = mean(alive), sx = X(ms);
        ctx.save(); ctx.shadowColor = KC.orange; ctx.shadowBlur = 8; K.line(ctx, { x: sx, y: 96 }, { x: sx, y: yb + 8 }, KC.orange, 2.5); ctx.restore();
        pill(ctx, "생존자 평균 " + ms.toFixed(2), sx + 8, 136, { s: 11.5, c: KC.orange });
      }
      pill(ctx, "살아 있는 핀치 " + alive.length + "마리", W - 16, 28, { s: 12.5, a: "right", c: KC.orange });
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
      ctx.clearRect(0, 0, W, H);
      /* ── 왼쪽: 분포 ── */
      var LW = 446;
      K.stage(ctx, 0, 0, LW, H, "lab", { seed: 81, title: "집단의 부리 두께 분포" });
      var x0 = 30, x1 = 420, yb = 300;
      function X(p) { return x0 + (p - 6.5) / 7 * (x1 - x0); }
      function bell(m, c, dash, fill) {
        ctx.beginPath();
        for (var p = 6.5; p <= 13.5; p += 0.05) { var y = yb - 190 * Math.exp(-(p - m) * (p - m) / (2 * .64)); if (p === 6.5) ctx.moveTo(X(p), y); else ctx.lineTo(X(p), y); }
        ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = dash ? 2 : 3; ctx.setLineDash(dash ? [6, 5] : []);
        if (!dash) { ctx.shadowColor = c; ctx.shadowBlur = 10; }
        ctx.stroke(); ctx.restore();
        if (fill) {
          ctx.lineTo(x1, yb); ctx.lineTo(x0, yb); ctx.closePath();
          var fg = ctx.createLinearGradient(0, yb - 190, 0, yb); fg.addColorStop(0, rgba(c, .42)); fg.addColorStop(1, rgba(c, .04));
          ctx.fillStyle = fg; ctx.fill();
        }
      }
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, yb); ctx.lineTo(x1, yb); ctx.stroke();
      for (var p = 7; p <= 13; p += 1) K.t(ctx, String(p), X(p), yb + 18, { s: 10.5, c: KC.mute, a: "center", w: "600" });
      K.t(ctx, "부리 두께 (mm)", (x0 + x1) / 2, yb + 38, { s: 11, c: KC.mute, a: "center" });
      bell(9.4, KC.mute, true, false);
      var cc = hist.length > 1 && hist[hist.length - 1].env === "rain" ? KC.blue : KC.orange;
      bell(cur(), cc, false, true);
      K.line(ctx, { x: X(cur()), y: yb - 196 }, { x: X(cur()), y: yb }, cc, 1.4, [3, 3], .8);
      K.t(ctx, "점선: 처음 집단 (평균 9.40)", x0, 56, { s: 10.5, c: KC.mute });
      pill(ctx, (hist.length - 1) + "세대 평균 " + cur().toFixed(2) + " mm", clamp(X(cur()), 110, 336), 98, { s: 13, a: "center", c: cc, box: [0, LW] });
      finch(ctx, LW - 74, 52, .9, cur(), .95);
      /* ── 오른쪽: 세대별 평균 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 82, title: "세대별 평균 부리 두께 (mm)" });
      var g = K.chart(ctx, { x: RX, y: 44, w: W - RX, h: 292, pl: 44, pb: 34, pt: 14, pr: 46, x0: 0, x1: 12, y0: 8, y1: 12, xt: 4, yt: 4,
        xf: function (q) { return Math.round(q) + "세대"; } });
      K.line(ctx, { x: g.L, y: g.Y(10.4) }, { x: g.R, y: g.Y(10.4) }, KC.yellow, 1.5, [5, 5]);
      pill(ctx, "10.4", g.R + 4, g.Y(10.4) + 5, { s: 10.5, c: KC.yellow, box: [RX, W] });
      if (hist.length > 1) K.plot(ctx, g, hist.map(function (q, i) { return [i, clamp(q.m, 8, 12)]; }), "#ffffff", { w: 2 });
      hist.forEach(function (q, i) {
        var c = q.env === "rain" ? KC.blue : (q.env ? KC.orange : KC.mute);
        K.glow(ctx, g.X(i), g.Y(clamp(q.m, 8, 12)), 4.2, rgba(c, .95), 2.8);
      });
      K.glow(ctx, RX + 22, H - 16, 3.5, rgba(KC.orange, .95), 2.6); K.t(ctx, "가뭄 세대", RX + 32, H - 12, { s: 10.5, c: KC.mute });
      K.glow(ctx, RX + 112, H - 16, 3.5, rgba(KC.blue, .95), 2.6); K.t(ctx, "폭우 세대", RX + 122, H - 12, { s: 10.5, c: KC.mute });
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
      var LW = 600;
      K.stage(ctx, 0, 0, LW, H, "lab", { seed: 91, title: "세균 수 (마리) · 10배씩 커지는 눈금" });
      var g = K.chart(ctx, { x: 0, y: 40, w: LW, h: H - 40, pl: 62, pb: 36, pt: 14, pr: 20, x0: 0, x1: 12, y0: 0, y1: 10, xt: 4, yt: 5,
        xf: function (q) { return Math.round(q) + "시간"; }, yf: function (q) { return ["1", "100", "1만", "100만", "1억", "100억"][Math.round(q / 2)]; } });
      function Y(n) { return g.Y(clamp(Math.log(Math.max(n, 1)) / Math.LN10, 0, 10)); }
      pill(ctx, "● 보통 세균", 372, 28, { s: 11.5, c: KC.blue, box: [0, LW] });
      pill(ctx, "● 내성 세균", 476, 28, { s: 11.5, c: KC.red, box: [0, LW] });
      var RX = LW + 8, cxd = RX + (W - RX) / 2, cyd = 150, rd = 108;
      K.stage(ctx, RX, 0, W - RX, H, "night", { seed: 92, title: sim ? "배양 접시 · " + upto + "시간 뒤" : "배양 접시" });
      /* 접시: 유리 테두리와 한천 배지 */
      var ag = ctx.createRadialGradient(cxd - 30, cyd - 30, 10, cxd, cyd, rd);
      var dg = sim ? sim.D : drug;
      ag.addColorStop(0, dg ? "rgba(214,226,255,.30)" : "rgba(255,226,160,.30)"); ag.addColorStop(1, dg ? "rgba(140,160,230,.14)" : "rgba(230,180,90,.14)");
      ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(cxd, cyd, rd, 0, 6.2832); ctx.fill();
      ctx.save(); ctx.strokeStyle = "rgba(220,235,255,.55)"; ctx.lineWidth = 3; ctx.shadowColor = "rgba(180,210,255,.6)"; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(cxd, cyd, rd + 4, 0, 6.2832); ctx.stroke(); ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cxd, cyd, rd - 6, 3.6, 4.6); ctx.stroke();
      if (sim) {
        [["S", KC.blue], ["R", KC.red]].forEach(function (L) {
          var seg = [];
          for (var t = 0; t <= upto; t++) {
            var nn = sim[t][L[0]];
            if (nn < 1 && t > 0 && sim[t - 1][L[0]] < 1) { if (seg.length > 1) K.plot(ctx, g, seg, L[1], { w: 3 }); seg = []; continue; }
            seg.push([t, clamp(Math.log(Math.max(nn, 1)) / Math.LN10, 0, 10)]);
          }
          if (seg.length > 1) K.plot(ctx, g, seg, L[1], { w: 3, dots: 2.5 });
          else if (seg.length === 1) K.glow(ctx, g.X(seg[0][0]), g.Y(seg[0][1]), 3, rgba(L[1], .95), 2.6);
        });
        var e = sim[upto], tot = e.S + e.R, fr = tot >= 1 ? e.R / tot : 0;
        var nShow = tot >= 1 ? Math.max(1, Math.round(clamp(Math.log(tot) / Math.LN10 / 9, 0, 1) * COLS.length)) : 0, nRed = Math.round(nShow * fr);
        for (var i = 0; i < nShow; i++) {
          var q = COLS[i], red = i < nRed, px = cxd + q.x * rd, py = cyd + q.y * rd;
          ball(ctx, px, py, 4.2 * q.s + 2, red ? KC.red : KC.blue);
        }
        if (tot < 1) pill(ctx, "전멸", cxd, cyd + 6, { s: 16, a: "center", c: KC.mute, box: [RX, W] });
        pill(ctx, "내성 세균 비율 " + (tot >= 1 ? (fr < 0.0001 && fr > 0 ? "0.01% 미만" : (fr * 100).toFixed(fr < 0.01 ? 3 : 1) + "%") : "-"), cxd, H - 40, { s: 13, a: "center", c: KC.red, box: [RX, W] });
        K.t(ctx, "점 하나 ≈ 군체 · 수는 10배씩 늘린 눈금", cxd, H - 14, { s: 10, a: "center", c: KC.dim });
      } else {
        pill(ctx, "조건을 정하고 배양을 시작하세요", (g.L + g.R) / 2, g.Y(5), { s: 12.5, a: "center", c: KC.mute });
        pill(ctx, drug ? "💊 항생제가 든 배지" : "항생제 없는 배지", cxd, H - 40, { s: 12, a: "center", c: drug ? KC.violet : KC.yellow, box: [RX, W] });
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
    $("b-abx-r").addEventListener("input", function (e) { if (running) return; r0 = +e.target.value; $("b-abx-r-val").textContent = r0 + "마리"; });
    Array.prototype.forEach.call($("b-abx-drug").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { if (running) return; drug = +b.getAttribute("data-d"); segOn($("b-abx-drug"), b); });
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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var LW = 652, gx = 26, gy = 60, cs = 25;
      K.stage(ctx, 0, 0, LW, H, "earth", { seed: 101 });
      /* 밭고랑 */
      for (var rr = 0; rr < ROWS; rr++) {
        var fy = gy + rr * cs, fg = ctx.createLinearGradient(0, fy, 0, fy + cs);
        fg.addColorStop(0, "#4a3424"); fg.addColorStop(.5, "#5d4330"); fg.addColorStop(1, "#33231a");
        ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(gx - 4, fy + 2, COLS * cs + 8, cs - 4, 8); ctx.fill();
      }
      for (var i = 0; i < lay.length; i++) {
        var x = gx + (i % COLS) * cs + cs / 2, y = gy + Math.floor(i / COLS) * cs + cs / 2;
        if (dead[i]) {
          ctx.fillStyle = "rgba(40,28,20,.95)"; ctx.beginPath(); ctx.ellipse(x, y + 2, 9, 6, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "rgba(110,90,60,.85)"; ctx.beginPath(); ctx.ellipse(x - 3, y, 4, 2.5, .6, 0, 6.2832); ctx.ellipse(x + 4, y + 1, 3.5, 2, -.5, 0, 6.2832); ctx.fill();
          K.t(ctx, "✕", x, y + 4, { s: 10, w: "900", a: "center", c: "#c9b89a" });
        } else {
          ball(ctx, x, y, 10.5, COL[lay[i] - 1]);
          K.t(ctx, String(lay[i]), x, y + 4, { s: 10.5, w: "900", a: "center", c: "#06202c" });
        }
      }
      pill(ctx, title, 16, 32, { s: 13.5, c: KC.yellow, box: [0, LW] });
      /* 품종 칩 */
      var lx = gx;
      K.t(ctx, "품종별 수확량", lx, 336, { s: 11, c: "#d8c8b0" }); lx += 82;
      for (var k = 1; k <= n; k++) { ball(ctx, lx + 6, 332, 6, COL[k - 1]); K.t(ctx, NUM.charAt(k - 1) + (100 - 5 * (k - 1)), lx + 15, 336, { s: 10.5, c: "#e8dcc6" }); lx += 52; }
      K.t(ctx, "역병균 A → 품종 ①만 감염 · 역병균 B → 품종 ③만 감염 · 이웃한 같은 품종으로 번짐", gx, 362, { s: 10.5, c: "#cdbba0" });
      /* ── 오른쪽: 해마다의 수확 ── */
      var RX = LW + 8;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 102, title: "해마다의 수확" });
      K.t(ctx, "(100 = 럼퍼만 심은 풍년)", RX + 16, 54, { s: 10.5, c: KC.mute });
      var g = K.chart(ctx, { x: RX, y: 60, w: W - RX, h: 274, pl: 36, pb: 34, pt: 14, pr: 12, x0: 0, x1: 6, y0: 0, y1: 100, xt: 1, yt: 4,
        xf: function () { return ""; } });
      K.line(ctx, { x: g.L, y: g.Y(60) }, { x: g.R, y: g.Y(60) }, KC.red, 1.4, [5, 4]);
      var bw = (g.R - g.L) / 6;
      YNAME.forEach(function (yr, yi) {
        var xx = g.L + yi * bw + 4, ww = bw - 8;
        K.t(ctx, "'" + (yr % 100), xx + ww / 2, g.B + 16, { s: 10.5, c: KC.mute, a: "center", w: "600" });
        if (YEARS[yi]) K.t(ctx, YEARS[yi] === 1 ? "A" : "B", xx + ww / 2, g.B + 30, { s: 9.5, c: KC.red, a: "center", w: "800" });
        if (bars[yi] == null) return;
        var by = g.Y(bars[yi]);
        column(ctx, xx, by, ww, g.B - by, bars[yi] < 60 ? KC.red : KC.green);
        K.t(ctx, String(Math.round(bars[yi])), xx + ww / 2, by - 5, { s: 11, w: "800", a: "center", c: KC.ink });
      });
      K.t(ctx, "60", g.L - 6, g.Y(60) + 4, { s: 10.5, a: "right", c: KC.red, w: "800" });
      K.t(ctx, "┄ 기근선 60", RX + 16, H - 14, { s: 10.5, c: KC.red, w: "800" });
      if (bars.length === 6) { var avg = bars.reduce(function (a, b) { return a + b; }, 0) / 6; pill(ctx, "6년 평균 " + avg.toFixed(1), W - 14, H - 12, { s: 13, a: "right", c: avg >= 87 ? KC.green : KC.ink, box: [RX, W] }); }
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
    function tree(x, y, sp) {
      ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(x + 2, y + 8, 7, 2.6, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#6b4a2e"; ctx.fillRect(x - 1.2, y + 1, 2.4, 7);
      if (sp === 1) {
        var g = ctx.createLinearGradient(x - 7, 0, x + 7, 0); g.addColorStop(0, shade("--teal", 1.1)); g.addColorStop(1, shade("--teal", .4));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.lineTo(x + 7, y + 3); ctx.lineTo(x - 7, y + 3); ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 8.5, y + 6); ctx.lineTo(x - 8.5, y + 6); ctx.closePath(); ctx.fill();
      } else {
        ball(ctx, x, y - 2, 7, COL[sp]);
        if (sp === 3) { ctx.fillStyle = "rgba(255,255,255,.75)"; [[-3, -4], [2, -1], [-1, 2], [3, -5]].forEach(function (q) { ctx.beginPath(); ctx.arc(x + q[0], y - 2 + q[1], 1, 0, 6.2832); ctx.fill(); }); }
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var I = index(), LW = 516;
      K.stage(ctx, 0, 0, LW, H, "night", { seed: 111, title: "숲 조사 구역 (그루 하나 = 나무 한 그루)" });
      var fg = ctx.createLinearGradient(0, 40, 0, 290);
      fg.addColorStop(0, "#1c3a2a"); fg.addColorStop(1, "#0f2218");
      ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(24, 42, 476, 242, 14); ctx.fill();
      ctx.strokeStyle = "rgba(160,230,180,.25)"; ctx.lineWidth = 1.2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.roundRect(24, 42, 476, 242, 14); ctx.stroke(); ctx.setLineDash([]);
      var list = [], k = 0;
      N.forEach(function (c, sp) { for (var j = 0; j < c; j++, k++) list.push({ p: PTS[k], sp: sp }); });
      list.sort(function (a, b) { return a.p.y - b.p.y; }).forEach(function (q) { tree(q.p.x, q.p.y, q.sp); });
      if (!I.tot) pill(ctx, "나무가 한 그루도 없습니다", 262, 166, { s: 12, a: "center", c: KC.mute });
      /* ── 오른쪽: 비율과 지수 ── */
      var RX = LW + 8, x0 = 640, x1 = 840;
      K.stage(ctx, RX, 0, W - RX, H, "lab", { seed: 112, title: "종별 비율" });
      N.forEach(function (c, sp) {
        var y = 46 + sp * 36, p = I.tot ? c / I.tot : 0;
        K.t(ctx, NAME[sp], RX + 14, y + 17, { s: 11.5, w: "700", c: c ? KC.ink : KC.dim });
        meter(ctx, x0, y + 2, x1 - x0, 20, p, COL[sp]);
        K.t(ctx, c ? Math.round(p * 100) + "%" : "없음", x1 + 8, y + 17, { s: 11, w: "800", c: KC.mute });
      });
      pill(ctx, "종 풍부도 " + I.rich + "종 · 전체 " + I.tot + "그루", RX + 14, 210, { s: 12, c: KC.blue, box: [RX, W] });
      var dc = I.D >= .6 ? KC.green : (I.D <= .3 ? KC.red : KC.ink);
      K.t(ctx, "다양성 지수 D", RX + 14, 250, { s: 12, c: KC.mute });
      ctx.save(); ctx.shadowColor = dc; ctx.shadowBlur = 12; K.t(ctx, I.D.toFixed(3), 640, 256, { s: 26, w: "900", c: dc }); ctx.restore();
      meter(ctx, RX + 14, 266, W - RX - 40, 10, clamp(I.D, 0, 1), dc);
      K.t(ctx, "0", RX + 14, 292, { s: 10, c: KC.dim }); K.t(ctx, "1", W - 26, 292, { s: 10, c: KC.dim, a: "right" });

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
    var phase = 0, flowing = !REDUCE, painting = false;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      K.stage(ctx, 0, 0, W, H, "night", { seed: 121 });
      var web = WEBS[kind], dead = cascade(web, removed[kind]);
      /* 바닥(생산자 자리) */
      var sg = ctx.createLinearGradient(0, 318, 0, H);
      sg.addColorStop(0, "rgba(99,201,122,0)"); sg.addColorStop(1, "rgba(99,201,122,.16)");
      ctx.fillStyle = sg; ctx.fillRect(0, 318, W, H - 318);
      web.forEach(function (s) {
        s.eat.forEach(function (f) {
          var a = byId(web, f), gone = dead[s.id] || dead[f], p0 = { x: a.x, y: a.y }, p1 = { x: s.x, y: s.y + 38 };
          if (gone) { K.line(ctx, p0, p1, "rgba(160,170,210,.35)", 1.2, [4, 4]); return; }
          K.arrow(ctx, p0, p1, "rgba(99,201,122,.75)", 2, 9);
          for (var q = 0; q < 2; q++) {
            var u = (phase + q * .5) % 1;
            K.glow(ctx, p0.x + (p1.x - p0.x) * u, p0.y + (p1.y - p0.y) * u, 2, "rgba(255,226,120,.95)", 3);
          }
        });
      });
      web.forEach(function (s) {
        var d = dead[s.id], w = 150, x0 = s.x - w / 2;
        var bc = d === 2 ? KC.red : (d === 1 ? KC.dim : (s.eat.length ? KC.blue : KC.green));
        var gg = ctx.createLinearGradient(0, s.y, 0, s.y + 36);
        gg.addColorStop(0, d === 2 ? "rgba(90,30,45,.92)" : (d === 1 ? "rgba(40,44,70,.85)" : "rgba(30,44,96,.92)"));
        gg.addColorStop(1, d === 2 ? "rgba(50,16,26,.92)" : (d === 1 ? "rgba(24,26,44,.85)" : "rgba(14,20,52,.92)"));
        ctx.save(); if (!d) { ctx.shadowColor = bc; ctx.shadowBlur = 10; }
        ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(x0, s.y, w, 36, 12); ctx.fill(); ctx.restore();
        ctx.strokeStyle = bc; ctx.lineWidth = d ? 1.4 : 2; if (d === 1) ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.roundRect(x0, s.y, w, 36, 12); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,255,255,.10)"; ctx.beginPath(); ctx.roundRect(x0 + 3, s.y + 3, w - 6, 11, 8); ctx.fill();
        K.t(ctx, s.n + (d === 1 ? " (없앰)" : (d === 2 ? " ✕" : "")), s.x, s.y + 23, { s: 12, w: "800", a: "center", c: d === 2 ? KC.red : (d === 1 ? KC.dim : KC.ink) });
      });
      pill(ctx, "→ 먹히는 쪽에서 먹는 쪽으로 (에너지가 흐르는 길)", 16, 24, { s: 11, c: KC.green });
      var lost0 = web.filter(function (s) { return dead[s.id]; }).length;
      pill(ctx, "남은 종 " + (web.length - lost0) + " / " + web.length, W - 16, H - 10, { s: 12, a: "right", c: lost0 ? KC.red : KC.green });

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
