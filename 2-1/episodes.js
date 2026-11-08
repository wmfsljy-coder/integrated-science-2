/* 통합과학2 Ⅱ-1 생태계와 환경 변화 — 소단원별 이야기 세 편
   01 한 나무, 두 가지 잎 / 02 늑대가 돌아왔다 / 03 2℃의 문턱
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is2-2-1");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
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
function playBtn(id, onLabel, offLabel, get, set) {
  var b = $(id); if (!b) return;
  function lab() { b.textContent = get() ? onLabel : offLabel; }
  b.addEventListener("click", function () { set(!get()); lab(); }); lab();
}
/* 빛나는 선(그래프·곡선) */
function glowPath(ctx, pts, c, w) {
  if (pts.length < 2) return;
  ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = w || 3; ctx.lineJoin = "round"; ctx.shadowColor = c; ctx.shadowBlur = 8;
  ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
}
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}

/* ---- 스튜디오 미니어처 도구 — 밝은 스튜디오 바닥 위 입체 모형과 흰 판정 카드 ---- */
var LT = K.LT;
function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 6.2832); }
function floorShadow(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 2, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ell(ctx, 0, 0, rx, rx); ctx.fill(); ctx.restore();
}
function mixC(a, b, t) { var p = rgbOf(a), q = rgbOf(b); t = clamp(t, 0, 1); return "rgb(" + Math.round(lerp(p[0], q[0], t)) + "," + Math.round(lerp(p[1], q[1], t)) + "," + Math.round(lerp(p[2], q[2], t)) + ")"; }
function cardBig(ctx, s, x, y, c, size) { K.t(ctx, s, x, y, { s: size || 22, w: "900", c: c || LT.ink }); }
/* 입체 온도계 */
function thermo3(ctx, x, y0, y1, f, c) {
  floorShadow(ctx, x + 6, y1 + 16, 22, 6, .25);
  var tg = ctx.createLinearGradient(x - 9, 0, x + 9, 0); tg.addColorStop(0, "rgba(255,255,255,.95)"); tg.addColorStop(1, "rgba(170,185,205,.9)");
  ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(x - 9, y0 - 6, 18, y1 - y0 + 6, 9); ctx.fill(); ctx.strokeStyle = "rgba(110,130,160,.7)"; ctx.lineWidth = 1.4; ctx.stroke();
  var top = y1 - clamp(f, 0, 1) * (y1 - y0 - 6); ctx.fillStyle = c; ctx.fillRect(x - 3.5, top, 7, y1 - top);
  K.planet(ctx, x, y1 + 6, 14, c, shade(c, .45));
}

/* =========================================================================
   이야기 ① 한 나무, 두 가지 잎
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 예상 */
  window.sthGate({
    gate: "g1", key: "p1", title: "조사관의 첫 추리",
    question: "두께가 이렇게 다른 두 잎, 어떻게 된 일일까요?",
    options: ["㉠ 서로 다른 종류의 나무에서 온 잎이다", "㉡ 같은 나무지만 돋아난 지 오래된 잎과 새잎이다", "㉢ 같은 나무지만 달려 있던 자리의 빛이 달랐다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 현장 분류 */
  window.sthSort({
    mount: "s1-sort",
    buckets: [
      { id: "p", label: "생산자", sub: "광합성으로 양분을 스스로 만든다" },
      { id: "c", label: "소비자", sub: "다른 생물을 먹어 양분을 얻는다" },
      { id: "d", label: "분해자", sub: "죽은 생물·배설물을 분해한다" },
      { id: "a", label: "비생물적 요인", sub: "생물을 둘러싼 환경" }
    ],
    items: [
      { t: "🌳 느티나무", a: "p", why: "광합성을 하는 생산자입니다." },
      { t: "🌿 바위의 이끼", a: "p", why: "작아도 광합성을 하는 생산자입니다.", hint: "이끼도 엽록체가 있어요." },
      { t: "☘️ 토끼풀", a: "p", why: "생산자입니다." },
      { t: "🐛 잎을 갉는 애벌레", a: "c", why: "생산자를 먹는 1차 소비자입니다." },
      { t: "🐦 박새", a: "c", why: "애벌레를 먹는 2차 소비자입니다." },
      { t: "🕷️ 거미", a: "c", why: "다른 동물을 먹는 소비자입니다." },
      { t: "🍄 썩은 가지의 버섯", a: "d", why: "버섯은 식물이 아니라 균류, 분해자입니다.", hint: "버섯은 광합성을 하지 못해요." },
      { t: "🦠 낙엽 속 곰팡이", a: "d", why: "낙엽을 분해해 무기물로 되돌립니다." },
      { t: "🧫 흙 속 세균", a: "d", why: "분해자입니다." },
      { t: "☀️ 햇빛", a: "a", why: "빛은 대표적인 비생물적 요인입니다." },
      { t: "🟤 흙(토양)", a: "a", why: "토양은 비생물적 요인입니다.", hint: "흙 속 세균과 흙 자체는 다릅니다." },
      { t: "💧 물웅덩이의 물", a: "a", why: "물은 비생물적 요인입니다." },
      { t: "🌡️ 기온", a: "a", why: "온도는 비생물적 요인입니다." }
    ],
    doneText: "잎에 영향을 줄 만한 환경 요인이 넷이나 나왔네요.",
    onDone: function () { window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>생물적 요인 9개, 비생물적 요인 4개를 가려냈습니다."); ep.clear(1); }
  });
  if (ep.cleared(1)) window.sthMission("m1-2", true);

  /* 장면 3 — 가지 높이와 잎 */
  (function () {
    var canvas = $("c-leaf"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var h = 50, found = window.sthState("leafFound") || { a: false, b: false }, log = [];
    function light(hh) { return 10 + 90 * Math.pow(hh / 100, 1.6); }
    var BLOBS = (function () { var r = 9, a = []; for (var i = 0; i < 70; i++) { r = r * 16807 % 2147483647; var u = (r - 1) / 2147483646; r = r * 16807 % 2147483647; var q = (r - 1) / 2147483646; r = r * 16807 % 2147483647; var z = (r - 1) / 2147483646; var ang = u * 6.2832, d = Math.sqrt(q); a.push({ x: 250 + Math.cos(ang) * d * 160, y: 150 + Math.sin(ang) * d * 92, r: 22 + z * 18 }); } return a.sort(function (p, q2) { return q2.y - p.y; }); })();
    function thick(L) { return 80 + 1.7 * L; }
    function area(L) { return 45 - 0.3 * L; }
    function leafShape(cx, cy, rx, ry, c1, c2) {
      var g = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry); g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - rx, cy);
      ctx.bezierCurveTo(cx - rx * .5, cy - ry * 1.25, cx + rx * .55, cy - ry * 1.05, cx + rx, cy);
      ctx.bezierCurveTo(cx + rx * .55, cy + ry * 1.05, cx - rx * .5, cy + ry * 1.25, cx - rx, cy); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(230,255,210,.55)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx - rx - 10, cy); ctx.lineTo(cx + rx * .92, cy); ctx.stroke();
      ctx.lineWidth = 1;
      for (var k = 1; k <= 5; k++) { var vx = cx - rx + k * rx * .32; ctx.beginPath(); ctx.moveTo(vx, cy); ctx.lineTo(vx + rx * .2, cy - ry * .62); ctx.moveTo(vx, cy); ctx.lineTo(vx + rx * .2, cy + ry * .62); ctx.stroke(); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var L = light(h), T = thick(L), A = area(L), LW = 560, i;
      /* ── 왼쪽: 스튜디오 위 뒤뜰 블록과 느티나무 한 그루 ── */
      K.studio(ctx, 0, 0, LW, H, null);
      var I = K.iso({ ox: 300, oy: 246, s: 0.8, L: 230, D: 150 }), ZB = 34;
      floorShadow(ctx, 300, 372, 200, 34, .28);
      I.face(ctx, "front", function (Lw) { [[0, 12, "#7b5e3d"], [12, 26, "#9a7650"], [26, 34, "#5a4330"]].forEach(function (b) { ctx.fillStyle = b[2]; ctx.fillRect(0, b[0], Lw, b[1] - b[0]); }); var R = K.rng(4); ctx.fillStyle = "rgba(255,240,220,.3)"; for (var k = 0; k < 80; k++) ctx.fillRect(R() * Lw, R() * 30, 1.5, 1.5); });
      I.face(ctx, "right", function (Lw) { [[0, 12, "#6c5135"], [12, 26, "#876744"], [26, 34, "#4c3828"]].forEach(function (b) { ctx.fillStyle = b[2]; ctx.fillRect(0, b[0], Lw, b[1] - b[0]); }); });
      I.shade(ctx, "right", function () { return ZB; });
      I.top(ctx, function () { return ZB; }, function (k) { return k % 2 ? "#6aa84f" : "#64a04a"; }, 20);
      I.edges(ctx, ZB, ZB);
      /* 그늘(나무 아래)과 작은 것들 */
      var base = I.P(120, 80, ZB);
      ctx.fillStyle = "rgba(20,50,20,.25)"; ell(ctx, base.x + 20, base.y + 4, 92, 30); ctx.fill();
      K.planet(ctx, I.P(40, 120, ZB).x, I.P(40, 120, ZB).y - 6, 12, "#9aa0a8", "#4a4f57");
      ctx.fillStyle = "rgba(80,140,60,.9)"; ell(ctx, I.P(40, 120, ZB).x, I.P(40, 120, ZB).y - 14, 10, 4); ctx.fill();
      /* 햇빛 */
      K.sun(ctx, 46, 112, 15);
      for (i = 0; i < 4; i++) { ctx.fillStyle = "rgba(255,214,110,.16)"; ctx.beginPath(); ctx.moveTo(58, 104 + i * 6); ctx.lineTo(300 + i * 30, 60 + i * 26); ctx.lineTo(310 + i * 30, 86 + i * 26); ctx.closePath(); ctx.fill(); }
      /* 줄기와 가지 */
      var gx = base.x, gy0 = base.y, cx2 = gx + 10, cy2 = 150;
      var tg = ctx.createLinearGradient(gx - 14, 0, gx + 14, 0); tg.addColorStop(0, "#4a2f1d"); tg.addColorStop(.45, "#8a5a36"); tg.addColorStop(1, "#3a2416");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(gx - 9, 228); ctx.lineTo(gx + 9, 228); ctx.lineTo(gx + 14, gy0 + 2); ctx.lineTo(gx - 14, gy0 + 2); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#5a3a22"; ctx.lineCap = "round";
      [[-1, 110], [1, 126], [-.5, 86], [.6, 94]].forEach(function (q) { ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, 236); ctx.quadraticCurveTo(gx + q[0] * 32, q[1] + 52, gx + q[0] * 92, q[1]); ctx.stroke(); });
      ctx.lineCap = "butt";
      /* 둥근 수관: 위(햇빛) 밝고 작게, 아래(그늘) 어둡게 */
      BLOBS.forEach(function (b) {
        var bx = cx2 + (b.x - 250) * .8, by = cy2 + (b.y - 150) * .8, br = b.r * .8, t0 = clamp((by - 40) / 200, 0, 1);
        var cg = ctx.createRadialGradient(bx - br * .35, by - br * .4, 2, bx, by, br);
        cg.addColorStop(0, "rgb(" + Math.round(lerp(190, 120, t0)) + "," + Math.round(lerp(230, 175, t0)) + "," + Math.round(lerp(95, 80, t0)) + ")");
        cg.addColorStop(1, "rgb(" + Math.round(lerp(60, 40, t0)) + "," + Math.round(lerp(130, 95, t0)) + "," + Math.round(lerp(45, 40, t0)) + ")");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.2832); ctx.fill();
      });
      /* 채집 높이 고리 */
      var py = lerp(232, 62, h / 100);
      ctx.save(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2.4; ctx.setLineDash([6, 5]); ell(ctx, cx2, py, 150, 16); ctx.stroke(); ctx.restore();
      K.planet(ctx, cx2 + 150, py, 6, "#7fd3ff", "#1c64c4");
      K.pill(ctx, "✂ 높이 " + h + "%", cx2 + 162, py + 5, { s: 12, c: "#bfe6ff", box: [0, LW] });
      K.bigText(ctx, "빛 " + Math.round(L) + "% → 잎 두께 " + Math.round(T) + " µm", 18, 40, 21, "#ffffff");
      K.t(ctx, "이 자리의 빛", 22, 386, { s: 11.5, w: "800", c: LT.ink });
      K.bar(ctx, 104, 377, 240, L / 100, "#f59f00");
      K.t(ctx, Math.round(L) + "%", 352, 387, { s: 12, w: "900", c: LT.ink });

      /* ── 오른쪽 흰 카드: 잎의 단면(현미경)과 잎 넓이 ── */
      var RX = LW + 12, x0 = 616, wBox = 168, scale = 0.62, hh = T * scale, y0 = 52;
      K.card(ctx, RX, 0, W - RX, H, "잎의 단면 (현미경)");
      var epi = 10, pal = (T - 60) * 0.55 * scale, sp = hh - 2 * epi - pal, layers = T > 190 ? 3 : (T > 130 ? 2 : 1), c;
      ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y0, wBox, hh, 6); ctx.clip();
      ctx.fillStyle = "#dff0d6"; ctx.fillRect(x0, y0, wBox, hh);
      for (c = 0; c < 17; c++) { ctx.fillStyle = "rgba(150,200,140,.85)"; ctx.beginPath(); ctx.roundRect(x0 + c * 10 + 1, y0 + 1, 9, epi - 2, 3); ctx.fill(); }
      var lh = pal / layers;
      for (var l = 0; l < layers; l++) for (c = 0; c < 12; c++) {
        var cx0 = x0 + 2 + c * 14 + (l % 2) * 4, cy0 = y0 + epi + l * lh + 1;
        var pg = ctx.createLinearGradient(cx0, 0, cx0 + 12, 0); pg.addColorStop(0, "#2f8f3f"); pg.addColorStop(.5, "#5fcf66"); pg.addColorStop(1, "#2a7a36");
        ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(cx0, cy0, 12, Math.max(2, lh - 2), 5); ctx.fill();
        ctx.fillStyle = "rgba(20,90,30,.85)";
        for (var d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(cx0 + (d % 2 ? 8.5 : 3.5), cy0 + (d + .6) * (lh - 2) / 3.2, 1.6, 0, 6.2832); ctx.fill(); }
      }
      var sy0 = y0 + epi + pal;
      for (var s = 0; s < 10; s++) {
        var sx = x0 + 10 + s * 16.5, syy = sy0 + sp * (s % 2 ? .34 : .68), sr = Math.max(2, Math.min(8, sp / 3));
        var sg = ctx.createRadialGradient(sx - 2, syy - 2, 1, sx, syy, sr); sg.addColorStop(0, "#9fe09a"); sg.addColorStop(1, "#3b8a45");
        ctx.fillStyle = sg; ctx.beginPath(); ctx.ellipse(sx, syy, sr * 1.25, sr, (s % 3) * .5, 0, 6.2832); ctx.fill();
      }
      for (c = 0; c < 17; c++) { ctx.fillStyle = "rgba(150,200,140,.85)"; ctx.beginPath(); ctx.roundRect(x0 + c * 10 + 1, y0 + hh - epi + 1, 9, epi - 2, 3); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = "rgba(60,110,60,.5)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x0, y0, wBox, hh, 6); ctx.stroke();
      K.t(ctx, "울타리 " + layers + "겹", x0 + wBox + 8, y0 + epi + pal / 2 + 5, { s: 11, w: "800", c: LT.green });
      K.t(ctx, "해면 조직", x0 + wBox + 8, Math.max(y0 + epi + pal + sp / 2 + 5, y0 + epi + pal / 2 + 26), { s: 11, w: "800", c: LT.mute });
      ctx.strokeStyle = LT.ink; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0 - 12, y0); ctx.lineTo(x0 - 12, y0 + hh); ctx.moveTo(x0 - 17, y0); ctx.lineTo(x0 - 7, y0); ctx.moveTo(x0 - 17, y0 + hh); ctx.lineTo(x0 - 7, y0 + hh); ctx.stroke();
      /* 잎 넓이 */
      var ly = 296, r = Math.sqrt(A) * 5.2;
      if (L > 55) leafShape(x0 + 74, ly, r * 1.5, r * .8, "#3f8f3a", "#1f5a24"); else leafShape(x0 + 74, ly, r * 1.5, r * .8, "#8fd16a", "#3f8f3a");
      K.t(ctx, "넓이 약 " + Math.round(A) + " cm²", W - 18, ly - 4, { s: 13, w: "900", a: "right", c: LT.green });
      K.t(ctx, "두께 " + Math.round(T) + " µm", W - 18, ly + 18, { s: 13, w: "900", a: "right", c: LT.ink });
      var mA = Math.abs(Math.round(T) - 230) <= 15, mB = Math.abs(Math.round(T) - 100) <= 15;
      K.tip(ctx, mA ? "증거물 A(230 µm)와 비슷 · 채집!" : (mB ? "증거물 B(100 µm)와 비슷 · 채집!" : "증거물 A·B와 두께가 다름"), RX + 14, H - 46, W - RX - 28, mA || mB ? true : null);
      $("leaf-read").innerHTML = "<span class='k'>이 자리의 빛</span><span class='v y'>" + Math.round(L) + "%</span>" +
        "<span class='k'>잎 두께</span><span class='v g'>" + Math.round(T) + " µm</span><span class='sub'>울타리 조직 " + layers + "겹</span>" +
        "<span class='k'>잎 넓이</span><span class='v b'>약 " + Math.round(A) + " cm²</span>" +
        "<span class='ok " + (Math.abs(Math.round(T) - 230) <= 15 || Math.abs(Math.round(T) - 100) <= 15 ? "g" : "r") + "'>" + (Math.abs(Math.round(T) - 230) <= 15 ? "증거물 A(230 µm)와 비슷합니다 · 채집해 보세요" : (Math.abs(Math.round(T) - 100) <= 15 ? "증거물 B(100 µm)와 비슷합니다 · 채집해 보세요" : "증거물 A·B와 두께가 다릅니다")) + "</span>";
    }
    canvas._redraw = draw;

    function say() {
      var rows = log.slice(-4).map(function (r) { return "높이 " + r.h + "% · 빛 " + r.L + "% → 두께 <b>" + r.T + " µm</b>, 넓이 " + r.A + " cm²" + (r.m ? " — " + r.m : ""); });
      $("leaf-info").innerHTML = rows.length ? "<b>채집 기록</b><br>" + rows.join("<br>") : "슬라이더로 가지 높이를 정하고 잎을 채집해 증거물과 비교하세요.";
    }
    function mission() {
      if (found.a) done("m1-3a"); if (found.b) done("m1-3b");
      if (found.a && found.b) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>두 증거물과 같은 잎이 <b>한 나무의 꼭대기와 아래 가지</b>에서 나왔습니다. 빛이 강한 곳일수록 잎이 작고 두껍습니다.");
        ep.clear(2);
      }
    }
    $("leaf-h").addEventListener("input", function (e) { h = +e.target.value; $("leaf-h-val").textContent = h + "%"; draw(); });
    $("leaf-pick").addEventListener("click", function () {
      var L = light(h), T = Math.round(thick(L)), m = "";
      if (Math.abs(T - 230) <= 15) { found.a = true; m = "✅ 증거물 A와 일치!"; }
      else if (Math.abs(T - 100) <= 15) { found.b = true; m = "✅ 증거물 B와 일치!"; }
      else m = T > 230 ? "A보다도 두껍습니다" : (T < 100 ? "B보다도 얇습니다" : "A보다 얇고 B보다 두껍습니다");
      log.push({ h: h, L: Math.round(L), T: T, A: Math.round(area(L)), m: m });
      window.sthState("leafFound", found);
      say(); mission();
    });
    draw(); say(); mission();
  })();

  /* 장면 4 — 작용·반작용·상호 작용 */
  window.sthSort({
    mount: "s1-rel",
    buckets: [
      { id: "x", label: "작용", sub: "환경 → 생물" },
      { id: "y", label: "반작용", sub: "생물 → 환경" },
      { id: "z", label: "상호 작용", sub: "생물 ↔ 생물" }
    ],
    items: [
      { t: "빛이 강한 꼭대기 가지의 잎이 두껍다", a: "x", why: "빛(환경)이 잎(생물)에 영향을 준 작용입니다." },
      { t: "기온이 내려가자 느티나무가 잎을 떨군다", a: "x", why: "온도(환경)가 생물에 영향을 주었습니다." },
      { t: "낙엽이 썩어 흙이 기름지게 된다", a: "y", why: "생물이 토양(환경)을 바꾼 반작용입니다.", hint: "영향을 받은 쪽이 흙입니다." },
      { t: "지렁이가 땅속을 다녀 흙에 공기가 잘 통한다", a: "y", why: "지렁이(생물)가 토양(환경)을 바꾸었습니다.", hint: "영향을 받은 쪽이 무엇인지 보세요." },
      { t: "박새가 늘자 애벌레가 줄었다", a: "z", why: "생물과 생물 사이의 영향이므로 상호 작용입니다." },
      { t: "토끼풀 꽃에 벌이 찾아와 꽃가루를 옮긴다", a: "z", why: "생물 ↔ 생물, 상호 작용입니다." }
    ],
    onDone: function () { window.sthMission("m1-4", true, "<span class='m-tag'>미션 완료</span>영향을 <b>주는 쪽과 받는 쪽</b>을 가려내면 방향이 보입니다."); ep.clear(3); ep.clear(4); }
  });
  if (ep.cleared(3)) window.sthMission("m1-4", true);

  /* 장면 5 — 결말 */
  function finish() {
    window.sthState("r1", "해결 · 처음 추리: " + (window.sthState("p1") || "-"));
  }
  ep.onShow(function (i) {
    if (i !== 4) return;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉢") === 0 ? "처음부터 정확히 짚었습니다. 이제 증거까지 갖췄습니다." : "처음 생각과 달랐지요? 추리를 증거로 고쳐 나가는 것이 과학입니다.");
  });
  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학2 Ⅱ-1] 이야기 ① 한 나무, 두 가지 잎",
    items: [
      { id: "w1", label: "하람이에게 보내는 답장", hint: "같은 나무의 위쪽 잎과 아래쪽 잎이 다른 까닭을 빛의 세기와 울타리 조직으로 설명하세요." },
      { id: "e1b", label: "우리 학교에서 찾은 예", hint: "작용·반작용·상호 작용의 예를 하나씩, 영향을 주는 쪽 → 받는 쪽이 드러나게 쓰세요." }
    ]
  });
  if (ep.at() === 4) { var p0 = window.sthState("p1") || ""; $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p0 || "기록 없음"); }
})();

/* =========================================================================
   이야기 ② 늑대가 돌아왔다
   식생 V(%), 엘크 E(천 마리), 늑대 W(마리) — 단순화한 세 단계 모형
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "조사관의 첫 추리",
    question: "늑대가 모두 사라지면, 그 뒤 수십 년 동안 엘크와 버드나무 숲은 어떻게 될까요?",
    options: ["㉠ 엘크가 계속 늘고 숲도 그대로다", "㉡ 엘크가 크게 늘었다가 먹이가 모자라 다시 줄고, 숲은 망가진 채 남는다", "㉢ 엘크도 숲도 별 변화가 없다"],
    onPick: function () { ep.clear(0); }
  });

  function simulate(V, E, Wf, years) {
    var r = 0.4, hG = 0.0267, K = 60, g = 0.3, p = 0.00275, q = 0.04, d = 0.1, s = 0.0005, dt = 0.05;
    var out = { t: [], V: [], E: [], W: [] }, n = Math.round(years / dt);
    for (var i = 0; i <= n; i++) {
      if (i % 5 === 0) { out.t.push(i * dt); out.V.push(V); out.E.push(E); out.W.push(Wf); }
      var dV = r * V * (1 - V / 100) - hG * V * E;
      var dE = g * E * (1 - E / Math.max(K * V / 100, 0.01)) - p * E * Wf;
      var dW = Wf * (q * E - d - s * Wf);
      V = Math.max(0.5, V + dV * dt); E = Math.max(0, E + dE * dt); Wf = Math.max(0, Wf + dW * dt);
    }
    return out;
  }

  /* 세 줄 그래프 — upto 번째 표본까지 그린다 */
  /* 세 종의 수 — 위: 옐로스톤 강가 블록 모형(버드나무·엘크·늑대가 upto 시점의 수만큼), 오른쪽 판정 카드, 아래: 밝은 그래프 띠 */
  var VI = K.iso({ ox: 300, oy: 96, s: 0.78, L: 340, D: 220 }), VZ = 40;
  function rivY(x) { return VI.D * 0.56 + 22 * Math.sin(x / 52 + 0.6); }
  function vz(x, y) { var d = Math.abs(y - rivY(x)); return VZ - 9 * (1 - clamp((d - 9) / 14, 0, 1)) + 2 * Math.sin(x / 31) * Math.cos(y / 23); }
  var WIL = (function () { var R = K.rng(61), out = [], n = 0; while (out.length < 26 && n < 3000) { n++; var x = 6 + R() * (VI.L - 12), side = R() < .5 ? -1 : 1, y = rivY(x) + side * (24 + R() * 16); if (y > 8 && y < VI.D - 8) out.push([x, y]); } return out.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); }); })();
  var ELK = (function () { var R = K.rng(62), out = [], n = 0; while (out.length < 16 && n < 3000) { n++; var x = 14 + R() * (VI.L - 28), y = 10 + R() * (VI.D - 20); if (Math.abs(y - rivY(x)) > 28) out.push([x, y]); } return out; })();
  var WOL = [[250, 40], [268, 52], [236, 58], [282, 34], [258, 70], [300, 60], [222, 44], [290, 82]];
  function valley(ctx, W, V) {
    var key = Math.round(V / 4), c = ctx.canvas;
    if (c._vk === key && c._voff && c._voff.width === c.width) return c._voff;
    var off = c._voff || document.createElement("canvas"), dpr = c.width / W;
    off.width = c.width; off.height = c.height;
    var o = off.getContext("2d"); o.setTransform(dpr, 0, 0, dpr, 0, 0); o.clearRect(0, 0, W, c.height / dpr);
    var g = V / 100, fc = VI.P(VI.L / 2, VI.D / 2, 0);
    K.studio(o, 0, 0, 600, 330, { x: fc.x + 10, y: fc.y + 52, rx: 250, ry: 52 });
    o.save(); o.beginPath(); o.roundRect(0, 0, 600, 330, 14); o.clip();
    VI.face(o, "front", function (Lw) {
      o.save(); VI.profile(o, "front", function (u) { return vz(u, VI.D); }, 0); o.clip();
      [[0, 14, "#7d7f86"], [14, 28, "#a89070"], [28, 44, "#6e5238"]].forEach(function (b) { o.fillStyle = b[2]; o.fillRect(0, b[0], Lw, b[1] - b[0]); });
      var R = K.rng(5); o.fillStyle = "rgba(255,245,230,.35)"; for (var k = 0; k < 120; k++) { o.beginPath(); o.arc(R() * Lw, R() * 26, .8 + R() * 1.6, 0, 6.283); o.fill(); }
      o.restore();
      var u; o.beginPath(); o.moveTo(0, VZ - 4); for (u = 0; u <= Lw; u += 2) o.lineTo(u, Math.min(vz(u, VI.D), VZ - 4)); o.lineTo(Lw, VZ - 4); o.closePath(); o.fillStyle = "rgba(60,140,200,.8)"; o.fill();
    });
    VI.face(o, "right", function (Lw) { o.save(); VI.profile(o, "right", function (u) { return vz(VI.L, u); }, 0); o.clip(); [[0, 14, "#6c6e75"], [14, 28, "#957d60"], [28, 44, "#5e4530"]].forEach(function (b) { o.fillStyle = b[2]; o.fillRect(0, b[0], Lw, b[1] - b[0]); }); o.restore(); var u; o.beginPath(); o.moveTo(0, VZ - 4); for (u = 0; u <= Lw; u += 2) o.lineTo(u, Math.min(vz(VI.L, u), VZ - 4)); o.lineTo(Lw, VZ - 4); o.closePath(); o.fillStyle = "rgba(50,125,185,.85)"; o.fill(); });
    VI.shade(o, "right", function (u) { return vz(VI.L, u); });
    VI.field(o, function (x, y) { return Math.max(vz(x, y), VZ - 4); }, function (x, y, z, lt) {
      var d = Math.abs(y - rivY(x));
      if (vz(x, y) < VZ - 4.2) return K.tint("#4f9fd0", lt * (0.95 + 0.05 * Math.sin(x / 9)));
      if (d < 16) return K.tint("#cbbf9f", lt);
      return mixC("#b9a77a", "#5f9e45", g * (0.8 + 0.2 * Math.sin(x / 17 + y / 11))).replace(/rgb\((\d+),(\d+),(\d+)\)/, function (m, r, gg, b) { return "rgb(" + Math.round(r * lt) + "," + Math.round(gg * lt) + "," + Math.round(b * lt) + ")"; });
    }, 56, 36);
    VI.edges(o, VZ, VZ);
    /* 뒤쪽 침엽수 숲 */
    for (var t = 0; t < 12; t++) VI.tree(o, 10 + t * 28, 6 + (t % 3) * 4, vz(10 + t * 28, 8), 1.1);
    o.restore();
    c._voff = off; c._vk = key;
    return off;
  }
  function willow(ctx, x, y, sc) {
    var p = VI.P(x, y, vz(x, y));
    ctx.fillStyle = "rgba(0,0,0,.16)"; ell(ctx, p.x + 3, p.y, 7 * sc, 2.4 * sc); ctx.fill();
    ctx.strokeStyle = "#6b4a2e"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 8 * sc); ctx.stroke();
    K.planet(ctx, p.x, p.y - 11 * sc, 6.5 * sc, "#a6d86a", "#3f7a2a");
  }
  function animal(ctx, x, y, c, sc, wolf) {
    var p = VI.P(x, y, vz(x, y));
    ctx.fillStyle = "rgba(0,0,0,.2)"; ell(ctx, p.x + 2, p.y, 6 * sc, 2 * sc); ctx.fill();
    ctx.fillStyle = c; ell(ctx, p.x, p.y - 6 * sc, 5.6 * sc, 3 * sc); ctx.fill();
    ell(ctx, p.x + 5.5 * sc, p.y - (wolf ? 8 : 10) * sc, 2.2 * sc, 1.8 * sc); ctx.fill();
    ctx.fillRect(p.x - 4 * sc, p.y - 4 * sc, 1.3 * sc, 4 * sc); ctx.fillRect(p.x + 3 * sc, p.y - 4 * sc, 1.3 * sc, 4 * sc);
    if (!wolf) { ctx.strokeStyle = "#5a3a22"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x + 6 * sc, p.y - 11.5 * sc); ctx.lineTo(p.x + 4 * sc, p.y - 15 * sc); ctx.moveTo(p.x + 6 * sc, p.y - 11.5 * sc); ctx.lineTo(p.x + 8.5 * sc, p.y - 15 * sc); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(p.x - 5 * sc, p.y - 6 * sc); ctx.lineTo(p.x - 10 * sc, p.y - 4 * sc); ctx.strokeStyle = c; ctx.lineWidth = 1.6 * sc; ctx.stroke(); }
  }
  function chart(ctx, W, H, sim, upto, startYear, marks) {
    ctx.clearRect(0, 0, W, H);
    var n = sim.t.length - 1, T = sim.t[n], V = sim.V[upto], E = sim.E[upto], Wf = sim.W[upto], i, TOPH = 330;
    ctx.drawImage(valley(ctx, W, V), 0, 0, W, H);
    ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, 600, TOPH, 14); ctx.clip();
    var nW = Math.round(clamp(V / 100, 0, 1) * WIL.length), nE = Math.round(clamp(E / 18, 0, 1) * ELK.length), nWo = Math.round(clamp(Wf / 300, 0, 1) * WOL.length);
    if (Wf >= 1 && nWo < 1) nWo = 1;
    var items = [];
    for (i = 0; i < nW; i++) items.push([WIL[i][0], WIL[i][1], 0]);
    for (i = 0; i < nE; i++) items.push([ELK[i][0], ELK[i][1], 1]);
    for (i = 0; i < nWo; i++) items.push([WOL[i][0], WOL[i][1], 2]);
    items.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); }).forEach(function (q) {
      if (q[2] === 0) willow(ctx, q[0], q[1], 1); else if (q[2] === 1) animal(ctx, q[0], q[1], "#9a6a3e", 1.1, false); else animal(ctx, q[0], q[1], "#7d8594", 1.05, true);
    });
    ctx.restore();
    var BX = [0, 600];
    if (nW > 2) VI.label(ctx, WIL[0][0], WIL[0][1], vz(WIL[0][0], WIL[0][1]) + 8, "강가 버드나무", -30, 70, "#d9f7c8", BX);
    else VI.label(ctx, 60, rivY(60) + 20, VZ, "버드나무가 사라진 강가", -30, 70, "#ffe1c9", BX);
    if (nE > 0) VI.label(ctx, ELK[0][0], ELK[0][1], VZ + 6, "엘크 무리", 40, -46, "#ffe1c9", BX);
    if (nWo > 0) VI.label(ctx, WOL[0][0], WOL[0][1], VZ + 6, "늑대", 40, -30, "#e8ecff", BX);
    var yr = startYear + Math.round(sim.t[upto]);
    K.bigText(ctx, yr + "년", 18, 40, 28, "#ffffff");
    K.bigText(ctx, Wf < 1 ? "늑대가 없다" : "늑대 " + Math.round(Wf) + "마리", 18, 66, 16, "#ffd35a");
    K.warn(ctx, 588, TOPH - 12, "⚠ 그림 속 개체 수는 실제 수에 비례해 줄인 것", "right");
    /* 오른쪽 흰 판정 카드 */
    var RX = 612, x0 = RX + 18, x1 = W - 18;
    K.card(ctx, RX, 0, W - RX, TOPH, sim.t[upto] > 0 ? yr + "년의 강가" : "시작 상태");
    var rows = [["🌿 식생", Math.round(V) + " %", V / 100, LT.green], ["🦌 엘크", (Math.round(E * 100) * 10).toLocaleString() + " 마리", E / 20, LT.orange], ["🐺 늑대", Math.round(Wf) + " 마리", Wf / 320, LT.violet]];
    rows.forEach(function (r, k) { K.row(ctx, r[0], r[1], x0, x1, 64 + k * 50, r[3]); K.bar(ctx, x0, 74 + k * 50, x1 - x0, r[2], r[3]); });
    K.tip(ctx, V >= 60 ? "숲이 되살아났다" : (Wf < 1 && E > 8 ? "엘크가 강가를 뜯어 먹는다" : (V < 30 ? "숲이 무너져 있다" : "숲이 회복 중")), x0 - 4, 228, x1 - x0 + 8, V >= 60 ? true : (V < 30 ? false : null));
    K.t(ctx, "막대 = 각자의 눈금(식생 100%, 엘크 2만, 늑대 320)", x0, 292, { s: 10.5, w: "700", c: LT.mute });
    /* 아래: 밝은 그래프 띠 */
    var GY0 = TOPH + 10;
    K.studio(ctx, 0, GY0, W, H - GY0, null);
    var gch = K.chart(ctx, { x: 6, y: GY0 + 6, w: W - 12, h: H - GY0 - 10, pl: 40, pb: 26, pt: 26, pr: 16, x0: 0, x1: T, y0: 0, y1: 1, xt: Math.round(T / 10), yt: 2, light: true,
      xf: function (q) { return String(startYear + Math.round(q)); }, yf: function (q) { return Math.round(q * 100) + "%"; } });
    (marks || []).forEach(function (m) {
      K.line(ctx, { x: gch.X(m.t), y: gch.T }, { x: gch.X(m.t), y: gch.B }, LT.yellow, 1.5, [5, 5]);
      K.t(ctx, m.label, gch.X(m.t) + 6, gch.T + 12, { s: 11, w: "800", c: "#b7791f" });
    });
    var series = [[sim.V, 100, LT.green, "식생"], [sim.E, 20, LT.orange, "엘크"], [sim.W, 320, LT.violet, "늑대"]];
    series.forEach(function (s, k) {
      var pts = []; for (var j = 0; j <= upto; j++) pts.push([sim.t[j], clamp(s[0][j] / s[1], 0, 1)]);
      if (pts.length > 1) K.plot(ctx, gch, pts, s[2], { w: 2.8, light: true });
      var e = pts[pts.length - 1]; K.planet(ctx, gch.X(e[0]), gch.Y(e[1]), 4.5, s[2], shade(s[2], .5));
      K.t(ctx, "● " + s[3], gch.L + 10 + k * 64, GY0 + 22, { s: 11.5, w: "900", c: s[2] });
    });
    K.t(ctx, "세 줄은 각자의 눈금 (식생 0~100%, 엘크 0~2만, 늑대 0~320)", gch.R, GY0 + 22, { s: 10.5, w: "700", a: "right", c: LT.mute });
  }

  function animate(canvas, sim, startYear, marks, onEnd) {
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h, n = sim.t.length - 1, i = 0;
    canvas._redraw = function () { chart(ctx, W, H, sim, Math.min(i, n), startYear, marks); };
    (function step() {
      i = Math.min(n, i + Math.ceil(n / 120));
      chart(ctx, W, H, sim, i, startYear, marks);
      if (i < n) window.setTimeout(step, 25); else if (onEnd) onEnd();   // rAF는 가려진 탭에서 멈추므로 쓰지 않는다
    })();
  }

  /* 장면 2 — 생태 피라미드 */
  (function () {
    var canvas = $("c-pyr"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var e0 = 100000, eff = 10, okA = !!window.sthState("pyrA"), okB = !!window.sthState("pyrB");
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var names = ["생산자", "엘크", "늑대"], vals = [e0, e0 * eff / 100, e0 * eff * eff / 10000], LW = 568, i;
      var emax = +($("pyr-e").max || 1000000);
      /* 에너지 피라미드를 쌓은 큰 블록: 층의 넓이 ∝ 에너지 (한 변은 제곱근). 층마다 그 단계의 생물이 산다 */
      var PS = 1.22, OX = 262, OY = 84, TH = 36;
      var I = K.iso({ ox: OX, oy: OY, s: PS, L: 260, D: 260 });
      var kz = 0.6 + 0.4 * Math.sqrt(e0 / emax), side = vals.map(function (v) { return Math.max(10, 236 * kz * Math.sqrt(v / e0)); });
      var g0 = I.P(130, 130, 0);
      K.studio(ctx, 0, 0, LW, H, { x: g0.x + 10, y: g0.y + side[0] * PS * 0.5 + 10, rx: side[0] * PS * 1.05 + 30, ry: 30 + side[0] * .12 });
      var tops = ["#8fd16a", "#c9d98a", "#d8cfa8"], fr = ["#6b4b2e", "#7a5634", "#86603a"], rt = ["#523822", "#5f4229", "#6a4b2d"];
      var band = ["#4f9a3f", "#e8890c", "#7a5fd6"];
      function tier(i) {
        var s0 = side[i], a = 130 - s0 / 2, b = 130 + s0 / 2;
        I.box(ctx, a, a, TH * i, b, b, TH * (i + 1), tops[i], fr[i], rt[i]);
        /* 앞·오른쪽 면: 흙 단면 + 맨 위 단계 색 띠 */
        I.quad(ctx, I.P(a, b, TH * (i + 1) - 7), I.P(b, b, TH * (i + 1) - 7), I.P(b, b, TH * (i + 1)), I.P(a, b, TH * (i + 1)), band[i]);
        I.quad(ctx, I.P(b, a, TH * (i + 1) - 7), I.P(b, b, TH * (i + 1) - 7), I.P(b, b, TH * (i + 1)), I.P(b, a, TH * (i + 1)), K.tint(band[i].length === 7 ? band[i] : "#4f9a3f", .72));
        var e1 = I.P(a, b, TH * (i + 1)), e2 = I.P(b, b, TH * (i + 1)), e3 = I.P(b, a, TH * (i + 1)), e4 = I.P(b, b, TH * i);
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(e1.x, e1.y); ctx.lineTo(e2.x, e2.y); ctx.lineTo(e3.x, e3.y); ctx.moveTo(e2.x, e2.y); ctx.lineTo(e4.x, e4.y); ctx.stroke();
      }
      /* 생물: 생산자 층의 풀·버드나무, 엘크 층의 엘크, 늑대 층의 늑대 (넓을수록 많이 산다) */
      function grass(x, y, z) { var p = I.P(x, y, z); ctx.strokeStyle = "#3f8a2e"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(p.x - 3, p.y); ctx.lineTo(p.x - 4, p.y - 6); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 8); ctx.moveTo(p.x + 3, p.y); ctx.lineTo(p.x + 4, p.y - 6); ctx.stroke(); }
      function elk(x, y, z, sc) {
        var p = I.P(x, y, z);
        ctx.fillStyle = "rgba(0,0,0,.22)"; ell(ctx, p.x + 2, p.y, 8 * sc, 2.4 * sc); ctx.fill();
        ctx.fillStyle = "#6e4526"; ctx.fillRect(p.x - 5 * sc, p.y - 6 * sc, 1.6 * sc, 6 * sc); ctx.fillRect(p.x + 3.6 * sc, p.y - 6 * sc, 1.6 * sc, 6 * sc);
        var bg = ctx.createLinearGradient(0, p.y - 11 * sc, 0, p.y - 4 * sc); bg.addColorStop(0, "#b07a4a"); bg.addColorStop(1, "#7a4c2a");
        ctx.fillStyle = bg; ell(ctx, p.x, p.y - 8 * sc, 7 * sc, 3.6 * sc); ctx.fill();
        ctx.fillStyle = "#8a5a36"; ctx.beginPath(); ctx.moveTo(p.x + 5 * sc, p.y - 9 * sc); ctx.lineTo(p.x + 8 * sc, p.y - 14 * sc); ctx.lineTo(p.x + 10 * sc, p.y - 13 * sc); ctx.lineTo(p.x + 7 * sc, p.y - 7 * sc); ctx.fill();
        ctx.fillStyle = "#5e3a1f"; ell(ctx, p.x + 10 * sc, p.y - 13.5 * sc, 2.6 * sc, 1.8 * sc); ctx.fill();
        ctx.strokeStyle = "#d9c4a0"; ctx.lineWidth = 1.1 * sc; ctx.beginPath(); ctx.moveTo(p.x + 9 * sc, p.y - 15 * sc); ctx.lineTo(p.x + 7 * sc, p.y - 20 * sc); ctx.lineTo(p.x + 5 * sc, p.y - 21 * sc); ctx.moveTo(p.x + 7.6 * sc, p.y - 18 * sc); ctx.lineTo(p.x + 10 * sc, p.y - 21 * sc); ctx.stroke();
      }
      function wolf(x, y, z, sc) {
        var p = I.P(x, y, z);
        ctx.fillStyle = "rgba(0,0,0,.22)"; ell(ctx, p.x + 2, p.y, 7 * sc, 2.2 * sc); ctx.fill();
        ctx.fillStyle = "#4b5260"; ctx.fillRect(p.x - 4.5 * sc, p.y - 5 * sc, 1.5 * sc, 5 * sc); ctx.fillRect(p.x + 3 * sc, p.y - 5 * sc, 1.5 * sc, 5 * sc);
        var wg = ctx.createLinearGradient(0, p.y - 10 * sc, 0, p.y - 3 * sc); wg.addColorStop(0, "#c3c9d4"); wg.addColorStop(1, "#6b7383");
        ctx.fillStyle = wg; ell(ctx, p.x, p.y - 6.5 * sc, 6.2 * sc, 3 * sc); ctx.fill();
        ctx.beginPath(); ctx.moveTo(p.x - 6 * sc, p.y - 7 * sc); ctx.lineTo(p.x - 11 * sc, p.y - 4 * sc); ctx.lineTo(p.x - 6 * sc, p.y - 5 * sc); ctx.fill();
        ell(ctx, p.x + 6.5 * sc, p.y - 9 * sc, 3 * sc, 2.4 * sc); ctx.fill();
        ctx.beginPath(); ctx.moveTo(p.x + 8.5 * sc, p.y - 9.5 * sc); ctx.lineTo(p.x + 12 * sc, p.y - 8 * sc); ctx.lineTo(p.x + 8.5 * sc, p.y - 7.6 * sc); ctx.fill();
        ctx.fillStyle = "#4b5260"; ctx.beginPath(); ctx.moveTo(p.x + 5 * sc, p.y - 11 * sc); ctx.lineTo(p.x + 5.6 * sc, p.y - 14 * sc); ctx.lineTo(p.x + 7 * sc, p.y - 11 * sc); ctx.fill();
      }
      var R = K.rng(8), a0 = 130 - side[0] / 2, nT = Math.round(4 + 14 * side[0] / 236), nG = Math.round(10 + 30 * side[0] / 236);
      var inside1 = function (tx, ty) { return Math.abs(tx - 130) < side[1] / 2 + 5 && Math.abs(ty - 130) < side[1] / 2 + 5; };
      var spots = [];
      for (i = 0; i < 80 && spots.length < nG + nT; i++) { var tx = a0 + 6 + R() * (side[0] - 12), ty = a0 + 6 + R() * (side[0] - 12); if (!inside1(tx, ty)) spots.push([tx, ty]); }
      spots.sort(function (p, q) { return (p[0] + p[1]) - (q[0] + q[1]); });
      var nE = clamp(Math.round(side[1] / 22), 1, 9), a1 = 130 - side[1] / 2, ePos = [];
      for (i = 0; i < 60 && ePos.length < nE; i++) { var ex = a1 + 6 + R() * (side[1] - 12), ey = a1 + 6 + R() * (side[1] - 12); if (Math.abs(ex - 130) < side[2] / 2 + 6 && Math.abs(ey - 130) < side[2] / 2 + 6) continue; ePos.push([ex, ey]); }
      ePos.sort(function (p, q) { return (p[0] + p[1]) - (q[0] + q[1]); });
      function front(p, k) { var bb = 130 + side[k] / 2; return p[0] > bb || p[1] > bb; }
      function plant(sp, k) { if (k % 3 === 0 && k / 3 < nT) I.tree(ctx, sp[0], sp[1], TH, 1.15); else grass(sp[0], sp[1], TH); }
      var nW = side[2] >= 30 ? 3 : (side[2] >= 18 ? 2 : (side[2] >= 11 ? 1 : 0));
      /* 앞에 있는 것이 뒤를 가리도록: 밑층 → 뒤쪽 풀·나무 → 가운데 층 → 뒤쪽 엘크 → 꼭대기 층 → 앞쪽 엘크·늑대 → 앞쪽 풀·나무 */
      tier(0);
      spots.forEach(function (sp, k) { if (!front(sp, 1)) plant(sp, k); });
      tier(1);
      ePos.forEach(function (p) { if (!front(p, 2)) elk(p[0], p[1], TH * 2, 1.3); });
      tier(2);
      ePos.forEach(function (p) { if (front(p, 2)) elk(p[0], p[1], TH * 2, 1.3); });
      [[130, 130], [130 - side[2] / 4, 130 + side[2] / 5], [130 + side[2] / 5, 130 - side[2] / 4]].slice(0, nW).sort(function (p, q) { return (p[0] + p[1]) - (q[0] + q[1]); }).forEach(function (p) { wolf(p[0], p[1], TH * 3, 1.4); });
      spots.forEach(function (sp, k) { if (front(sp, 1)) plant(sp, k); });
      /* 층마다 이름표(오른쪽 지시선) */
      var LC = ["#d9f7c8", "#ffe1c9", "#e4dcff"], lys = [];
      for (i = 0; i < 3; i++) {
        var lp = I.P(130 + side[i] / 2, 130 + side[i] / 4, TH * i + TH * .45), ly = lp.y + 10 - i * 4;
        if (i && ly > lys[i - 1] - 30) ly = lys[i - 1] - 30;
        lys.push(ly);
        var lx = Math.max(lp.x + 26, 420);
        ctx.strokeStyle = "rgba(20,25,40,.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(lp.x, lp.y); ctx.lineTo(lx - 4, ly - 4); ctx.stroke();
        ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(lp.x, lp.y, 2.5, 0, 6.283); ctx.fill();
        K.pill(ctx, names[i] + " " + Math.round(vals[i]).toLocaleString(), lx, ly, { s: 12.5, c: LC[i], box: [0, LW - 4] });
      }
      /* 왼쪽: 위 단계로 올라가는 에너지 화살표 */
      var up0 = I.P(130, 130 + side[0] / 2, TH * .5), up1 = I.P(130, 130 + side[2] / 2, TH * 2.6);
      var ax = Math.min(up0.x - 22, up1.x - 40);
      K.arrow(ctx, { x: ax, y: up0.y }, { x: ax, y: up1.y }, "#f59f00", 3.2, 11);
      K.pill(ctx, "전달 " + eff + "%씩", ax - 8, (up0.y + up1.y) / 2, { s: 12.5, a: "right", c: "#ffd35a", box: [0, LW] });
      K.bigText(ctx, "늑대에게 " + Math.round(vals[2]).toLocaleString(), 18, 42, 26, vals[2] >= 5000 ? "#7ee0a0" : "#ffffff");
      K.bigText(ctx, "생산자 " + Math.round(e0).toLocaleString() + " × " + eff + "% × " + eff + "%", 18, 70, 15, "#ffd35a");
      K.warn(ctx, LW - 12, H - 12, "⚠ 층의 한 변 ∝ 에너지의 제곱근 · 생물 크기 과장", "right");
      /* 오른쪽 흰 판정 카드 */
      var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "에너지 장부");
      cardBig(ctx, Math.round(vals[2]).toLocaleString(), x0, 66, vals[2] >= 5000 ? LT.green : LT.orange, 24);
      K.t(ctx, "늑대에게 도달", x1, 66, { s: 12, w: "800", a: "right", c: LT.mute });
      vals.forEach(function (vv, k) { K.row(ctx, ["생산자 (풀·버드나무)", "1차 소비자 (엘크)", "2차 소비자 (늑대)"][k], Math.round(vv).toLocaleString(), x0, x1, 112 + k * 50, [LT.green, LT.orange, LT.violet][k]); K.bar(ctx, x0, 121 + k * 50, x1 - x0, kz * Math.sqrt(vv / e0), [LT.green, LT.orange, LT.violet][k]); });
      K.t(ctx, e0.toLocaleString() + " × " + eff + "% × " + eff + "% = " + (eff * eff / 100).toFixed(2) + "%", x0, 274, { s: 12, w: "800", c: LT.ink });
      K.tip(ctx, vals[2] >= 5000 ? "늑대에게 5,000 이상 도달" : "늑대 몫이 5,000에 못 미침", x0 - 4, 292, x1 - x0 + 8, vals[2] >= 5000);
      K.t(ctx, "나머지는 호흡·열로 빠져나감", x0, 354, { s: 12, w: "700", c: LT.mute });
      $("pyr-read").innerHTML = "<span class='k'>생산자 에너지</span><span class='v g'>" + e0.toLocaleString() + "</span>" +
        "<span class='k'>늑대에게 도달</span><span class='v y'>" + Math.round(vals[2]).toLocaleString() + "</span><span class='sub'>" + e0.toLocaleString() + " × " + eff + "% × " + eff + "% = " + (eff * eff / 100).toFixed(2) + "%</span>" +
        "<span class='ok " + (vals[2] >= 5000 ? "g" : "r") + "'>" + (vals[2] >= 5000 ? "늑대에게 5,000 이상 도달" : "늑대에게 가는 몫이 5,000에 못 미칩니다") + "</span>";
      $("pyr-info").innerHTML = "생산자가 가진 에너지 <b>" + e0.toLocaleString() + "</b> 가운데 늑대에게 도달하는 것은 <b>" + Math.round(vals[2]).toLocaleString() + "</b> (" + (eff * eff / 100).toFixed(2) + "%)입니다. 나머지는 각 단계에서 호흡으로 쓰이거나 열로 빠져나가고, 먹히지 않은 채 남습니다. (막대 폭은 보기 쉽게 제곱근 눈금으로 그렸습니다.)";
      if (!okA && eff === 10 && e0 === 500000) { okA = true; window.sthState("pyrA", 1); check(); }
    }
    function check() {
      if (okA) { done("m2-2a"); $("m2-2a").innerHTML = "전달 효율 10%에서 늑대에게 5,000을 보내려면 생산자 에너지가 <b>500,000</b>은 되어야 합니다. 100배!"; }
      if (okB) done("m2-2b");
      if (okA && okB) { window.sthMission("m2-2", true); ep.clear(1); }
    }
    canvas._redraw = draw;
    $("pyr-e").addEventListener("input", function (e) { e0 = +e.target.value; $("pyr-e-val").textContent = e0.toLocaleString(); draw(); });
    $("pyr-eff").addEventListener("input", function (e) { eff = +e.target.value; $("pyr-eff-val").textContent = eff; draw(); });
    window.sthPick({
      mount: "s2-q1",
      q: "그렇다면 늑대의 수가 엘크보다 훨씬 적을 수밖에 없는 까닭은 무엇일까요?",
      options: ["늑대가 엘크보다 번식을 못하는 동물이라서", "영양 단계를 올라갈수록 쓸 수 있는 에너지가 크게 줄어서", "늑대는 사냥을 당해 왔기 때문에", "엘크가 늑대보다 몸집이 커서"],
      answer: 1,
      why: ["번식력의 문제가 아닙니다. 피라미드의 숫자를 다시 보세요.", "위 단계로 갈수록 에너지가 약 10%씩만 전달되므로, 상위 포식자는 적은 수만 살 수 있습니다. 그래서 피라미드 모양이 됩니다.", "사냥이 없던 때에도 늑대는 엘크보다 훨씬 적었습니다.", "몸집이 아니라 에너지의 양이 열쇠입니다."],
      onDone: function () { okB = true; window.sthState("pyrB", 1); check(); }
    });
    draw(); check();
  })();

  /* 장면 3 — 늑대 없는 70년 */
  (function () {
    var canvas = $("c-gone"), sim = simulate(75, 3.75, 0, 70), watched = !!window.sthState("goneSeen"), answered = ep.cleared(2);
    var ctx = window.setupCanvas(canvas);
    canvas._redraw = function () { chart(ctx, canvas._w, canvas._h, sim, watched ? sim.t.length - 1 : 0, 1926); };
    canvas._redraw();
    function check() { if (watched && answered) { window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>포식자가 사라지자 피식자가 폭발적으로 늘었고, 결국 생산자가 무너졌습니다."); ep.clear(2); } }
    $("gone-run").addEventListener("click", function () {
      $("gone-run").disabled = true;
      animate(canvas, sim, 1926, [], function () {
        watched = true; window.sthState("goneSeen", 1); $("gone-run").disabled = false; $("gone-run").textContent = "↻ 다시 보기";
        $("gone-info").innerHTML = "엘크는 약 3,800마리에서 한때 <b>1만 7천 마리</b>까지 늘었다가 1만 2천 마리쯤에서 멈췄습니다. 식생은 <b>75% → 20%</b>로 무너진 뒤 70년이 지나도 회복되지 않았습니다.";
        check();
      });
    });
    window.sthPick({
      mount: "s2-q2",
      q: "그래프에서 엘크는 크게 늘었다가 조금 줄어든 뒤 멈춥니다. 늑대도 없는데 엘크가 더 늘지 못한 까닭은?",
      options: ["엘크끼리 싸워서", "먹이인 식생이 바닥나 먹이가 모자라서", "추위 때문에", "사람이 다시 늑대를 풀어서"],
      answer: 1,
      why: ["모형에 그런 요인은 없습니다. 초록색 선을 보세요.", "포식자가 없어도 먹이가 한계를 정합니다. 그 대가로 숲은 망가진 채 남았습니다.", "기온은 이 모형에 들어 있지 않습니다.", "이 70년 동안 늑대는 0마리였습니다."],
      onDone: function () { answered = true; check(); }
    });
    if (watched) $("gone-run").textContent = "↻ 다시 보기";
    if (ep.cleared(2)) window.sthMission("m2-3", true);
  })();

  /* 장면 4 — 복원 작전 */
  (function () {
    var canvas = $("c-back"), ctx = window.setupCanvas(canvas), n = 10, tries = window.sthState("backTries") || [];
    var blank = simulate(20, 12, 0, 40);
    canvas._redraw = function () { chart(ctx, canvas._w, canvas._h, blank, 0, 1995, [{ t: 15, label: "15년 (판정)" }]); };
    canvas._redraw();
    $("back-n").addEventListener("input", function (e) { n = +e.target.value; $("back-n-val").textContent = n + "마리"; });
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "🐺 " + t.n + "마리 → 15년 뒤 식생 " + t.v + "%, 엘크 최저 " + t.e.toLocaleString() + "마리 " + (t.ok ? "✅" : "❌ " + t.why); });
      $("back-info").innerHTML = rows.length ? "<b>작전 기록</b><br>" + rows.join("<br>") : "늑대 수를 정하고 실행하세요. 여러 번 시도할 수 있습니다.";
    }
    $("back-run").addEventListener("click", function () {
      var sim = simulate(20, 12, n, 40), i15 = 0, minE = 99, vMax = 0;
      sim.t.forEach(function (t, i) { if (t <= 15) { i15 = i; minE = Math.min(minE, sim.E[i]); vMax = Math.max(vMax, sim.V[i]); } });
      var okV = vMax >= 60, okE = minE >= 2, ok = okV && okE && n > 0;
      $("back-run").disabled = true;
      animate(canvas, sim, 1995, [{ t: 15, label: "15년 (판정)" }], function () {
        $("back-run").disabled = false;
        tries.push({ n: n, v: Math.round(sim.V[i15]), e: Math.round(minE * 100) * 10, ok: ok, why: !okV ? "숲의 회복이 너무 느림" : "엘크가 너무 줄어듦" });
        window.sthState("backTries", tries.slice(-8));
        report();
        if (ok) {
          window.sthState("backBest", n);
          window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>늑대 " + n + "마리로 성공했습니다. 40년 뒤를 보세요. 늑대를 몇 마리 풀었든 세 종은 결국 <b>비슷한 수준에서 균형</b>을 이룹니다. 다른 수로도 실험해 확인해 보세요.");
          ep.clear(3);
        }
      });
    });
    report();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* 장면 5 — 결말 */
  var STEPS = ["늑대가 늘어난다", "늑대에게 잡아먹혀 엘크가 줄어든다", "엘크에게 뜯기던 버드나무 숲이 되살아난다", "먹이(엘크)가 줄어 늑대도 더 늘지 못한다", "세 종의 수가 일정한 범위에서 오르내리며 균형을 이룬다"];
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br><b>나의 복원 작전</b> 늑대 " + (window.sthState("backBest") || "-") + "마리";
  }
  function finish() { window.sthState("r2", "해결 · 복원 작전: 늑대 " + (window.sthState("backBest") || "-") + "마리"); }
  if (ep.cleared(4)) {
    $("s2-order").innerHTML = "<div class='order sort'><div class='slots'>" + STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    reveal();
  } else {
    window.sthOrder({ mount: "s2-order", steps: STEPS, onDone: function () { reveal(); ep.clear(4); } });
  }
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학2 Ⅱ-1] 이야기 ② 늑대가 돌아왔다",
    items: [
      { id: "w2", label: "공원 보고서: 평형이 되돌아오는 과정", hint: "포식자가 늘었을 때 개체수가 다시 균형을 찾는 과정을 순서대로 쓰세요." },
      { id: "e2b", label: "우리 주변의 사례", hint: "외래종 유입, 서식지 파괴처럼 평형을 깨뜨리는 환경 변화 하나를 골라, 먹이 관계를 따라 어떤 영향이 퍼질지 예상해 쓰세요. 모둠 친구들의 예상과 비교해 서로 다른 점을 적고, 함께 합의한 대책 하나를 덧붙이세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 2℃의 문턱
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  /* 장면 1 — 킬링 곡선 */
  /* 큰 블록 모형: 마우나로아 화산을 땅째 잘라 낸 블록(앞·오른쪽 면 = 겹겹이 쌓인 용암층), 북쪽 비탈의 관측소와 공기 흡입 탑.
     하늘의 CO₂ 분자 하나 = 10 ppm. 회색은 산업화 이전(280 ppm)의 몫, 주황은 그 뒤 늘어난 몫. ▶ 1958 → 2024 한 번 흘려 보기 */
  (function () {
    var canvas = $("c-keel"), ctx = window.setupCanvas(canvas), mainCtx = ctx, W = canvas._w, H = canvas._h;
    function ppm(y) { var t = y - 1958; return 315 + 0.76 * t + 0.0137 * t * t; }      // 1958년 315 → 2024년 약 425 (NOAA 연평균 424.61에 맞춤)
    var kYr = REDUCE ? 2024 : 1958, kPlay = !REDUCE, kPh = 0, kOff = null, kPainting = false;
    var LW = 600, BL = 300, BD = 220, WL = 24;
    var I = K.iso({ ox: 292, oy: 132, s: 0.95, L: BL, D: BD });
    function vh(x, y) { var dx = (x - 150) / 128, dy = (y - 104) / 104, r = Math.sqrt(dx * dx + dy * dy); return 16 + 96 * Math.max(0, 1 - Math.pow(r, 1.8)) + 2.5 * Math.sin(x / 13) * Math.cos(y / 11) * (r < 1 ? 1 : 0); }
    var OBS = [196, 150]; OBS.push(vh(OBS[0], OBS[1]));
    /* 하늘의 분자 자리(고정 난수) */
    var MOL = [], Rm = K.rng(19);
    for (var mi = 0; mi < 44; mi++) MOL.push([20 + Rm() * 560, 118 + Rm() * 200, Rm() * 6.28]);
    function paintBlock(c) {
      ctx = c;
      var gc = I.P(BL / 2, BD / 2, 0);
      K.studio(ctx, 0, 0, LW, H, { x: gc.x + 20, y: I.P(BL, BD, 0).y - 30, rx: 300, ry: 44 });
      /* 앞·오른쪽 면: 용암층 단면 */
      ["front", "right"].forEach(function (side) {
        I.face(ctx, side, function (Lw) {
          var zOf = side === "front" ? function (u) { return vh(u, BD); } : function (u) { return vh(BL, u); };
          ctx.save(); I.profile(ctx, side, zOf, 0); ctx.clip();
          var cols = ["#3b3533", "#5a4a42", "#2f2b2b", "#6b5546", "#433b38", "#7a5c48", "#3a3433"];
          for (var k = 0; k < 14; k++) { ctx.fillStyle = cols[k % cols.length]; ctx.beginPath(); ctx.moveTo(0, k * 10); for (var u = 0; u <= Lw; u += 10) ctx.lineTo(u, k * 10 + 3 * Math.sin(u / 23 + k)); ctx.lineTo(Lw, 200); ctx.lineTo(0, 200); ctx.closePath(); ctx.fill(); }
          ctx.fillStyle = "rgba(255,120,60,.25)"; ctx.fillRect(0, 0, Lw, 6);
          ctx.restore();
          /* 바다 쪽 물 단면 */
          ctx.save(); ctx.beginPath(); ctx.moveTo(0, WL); for (var u2 = 0; u2 <= Lw; u2 += 3) ctx.lineTo(u2, Math.min(WL, zOf(u2))); ctx.lineTo(Lw, WL); ctx.closePath();
          ctx.fillStyle = "rgba(40,130,210,.55)"; ctx.fill(); ctx.restore();
        });
        I.shade(ctx, side, side === "front" ? function (u) { return vh(u, BD); } : function (u) { return vh(BL, u); });
      });
      /* 윗면: 화산 지형(아래는 숲, 위로 갈수록 검은 용암) + 둘레 바다 */
      I.field(ctx, vh, function (x, y, z, lt) {
        if (z < WL + 3) return K.tint("#d8c89c", lt);
        var u = clamp((z - WL - 3) / 80, 0, 1), base = u < .3 ? mixC("#5f9a48", "#7d6a52", u / .3) : mixC("#7d6a52", "#4f4846", (u - .3) / .7);
        var ang = Math.atan2(y - 104, x - 150), flow = Math.max(0, Math.sin(ang * 7 + Math.sqrt((x - 150) * (x - 150) + (y - 104) * (y - 104)) / 22));
        if (u > .15) base = mixC(base, "#2e2a2a", flow * .45 * Math.min(1, (u - .15) * 4));
        return "rgb(" + rgbOf(base).map(function (c3) { return clamp(Math.round(c3 * lt), 0, 255); }).join(",") + ")";
      }, 64, 48, function (c2, x0, y0, x1, y1, zMax) {
        if (zMax < WL) I.quad(ctx, I.P(x0, y0, WL), I.P(x1, y0, WL), I.P(x1, y1, WL), I.P(x0, y1, WL), "rgba(70,160,230,.72)");
      });
      var cr = I.P(150, 104, vh(150, 104) - 2);
      ctx.fillStyle = "rgba(30,25,25,.75)"; ell(ctx, cr.x, cr.y + 2, 16, 7); ctx.fill();
      ctx.fillStyle = "rgba(255,110,60,.35)"; ell(ctx, cr.x, cr.y + 3, 8, 3); ctx.fill();
      I.edges(ctx, WL, WL);
      /* 관측소 건물 + 공기 흡입 탑 */
      var ox0 = OBS[0], oy0 = OBS[1], oz = OBS[2];
      I.box(ctx, ox0 - 10, oy0 - 8, oz - 3, ox0 + 22, oy0 + 14, oz + 16, "#ffffff", "#e6e9ee", "#b9c0cc");
      I.box(ctx, ox0 + 22, oy0 - 2, oz - 3, ox0 + 34, oy0 + 10, oz + 9, "#f8f9fa", "#dfe4ea", "#aab3c0");
      var dm = I.P(ox0 + 6, oy0 + 3, oz + 16), dg = ctx.createRadialGradient(dm.x - 3, dm.y - 7, 1, dm.x, dm.y - 3, 11);
      dg.addColorStop(0, "#ffffff"); dg.addColorStop(1, "#aeb7c3"); ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(dm.x, dm.y, 10, Math.PI, 0); ctx.fill();
      onPlaneK(ctx, oy0 + 14, function () { ctx.fillStyle = "#4dabf7"; for (var wq = 0; wq < 4; wq++) ctx.fillRect(ox0 - 6 + wq * 7, oz + 5, 4.5, 5); });
      var tb = I.P(ox0 - 16, oy0 + 4, oz), tt = I.P(ox0 - 16, oy0 + 4, oz + 58);
      ctx.strokeStyle = "#6b7383"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tb.x, tb.y); ctx.lineTo(tt.x, tt.y); ctx.stroke();
      ctx.lineWidth = 1; for (var q = 1; q < 6; q++) { var a1 = I.P(ox0 - 16, oy0 + 4, oz + q * 10); ctx.beginPath(); ctx.moveTo(a1.x - 4, a1.y + 2); ctx.lineTo(a1.x + 4, a1.y - 2); ctx.stroke(); }
      /* 흡입관: 탑 꼭대기 → 건물 */
      ctx.strokeStyle = "#c08a2e"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(tt.x + 3, tt.y + 2); ctx.lineTo(tb.x + 3, tb.y - 3); var rf = I.P(ox0 - 8, oy0 + 4, oz + 8); ctx.lineTo(rf.x, rf.y); ctx.stroke();
      ctx.fillStyle = "#e8590c"; ctx.beginPath(); ctx.moveTo(tt.x - 7, tt.y - 3); ctx.lineTo(tt.x + 7, tt.y - 3); ctx.lineTo(tt.x + 3, tt.y + 4); ctx.lineTo(tt.x - 3, tt.y + 4); ctx.closePath(); ctx.fill();
      ctx = mainCtx;
    }
    function labels() {
      var ox0 = OBS[0], oy0 = OBS[1], oz = OBS[2];
      I.label(ctx, 150, 104, vh(150, 104), "마우나로아 화산 꼭대기 4,169 m", -70, -24, "#ffe8cc", [0, LW]);
      I.label(ctx, ox0 + 10, oy0 + 14, oz + 4, "관측소 (해발 3,400 m)", 60, 30, "#e8ecff", [0, LW]);
      I.label(ctx, ox0 - 16, oy0 + 4, oz + 58, "공기 흡입구 (높은 탑 꼭대기)", 46, -26, "#ffd8a8", [0, LW]);
      I.label(ctx, 40, BD, 18, "겹겹이 쌓인 용암층", -10, 30, "#dee2e6", [0, LW]);
      I.label(ctx, BL - 8, 46, WL, "태평양", 30, -14, "#a5d8ff", [0, LW]);
    }
    function onPlaneK(c, y, fn) { var o = I.P(0, y, 0), ex = I.P(1, y, 0), ez = I.P(0, y, 1); c.save(); c.transform(ex.x - o.x, ex.y - o.y, ez.x - o.x, ez.y - o.y, o.x, o.y); fn(); c.restore(); }
    function co2(x, y, r, extra) {
      if (extra) K.glow(ctx, x, y, r * 2.2, "rgba(255,146,43,.55)", 2);
      K.planet(ctx, x - r * 1.25, y, r * .78, extra ? "#ff8787" : "#f1a1a1", extra ? "#c92a2a" : "#a04d4d");
      K.planet(ctx, x + r * 1.25, y, r * .78, extra ? "#ff8787" : "#f1a1a1", extra ? "#c92a2a" : "#a04d4d");
      K.planet(ctx, x, y, r, extra ? "#495057" : "#868e96", "#212529");
    }
    function draw() {
      if (!kOff || kOff.width !== canvas.width) { kOff = document.createElement("canvas"); kOff.width = canvas.width; kOff.height = canvas.height; var oc = kOff.getContext("2d"); oc.setTransform(canvas.width / W, 0, 0, canvas.width / W, 0, 0); paintBlock(oc); }
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(kOff, 0, 0, W, H);
      var yr = Math.floor(kYr), cur = ppm(kYr), nBase = 28, nExtra = Math.round((cur - 280) / 10), i;
      /* 하늘이 탁해지는 정도(과장) */
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var hz = ctx.createLinearGradient(0, 0, 0, 300); hz.addColorStop(0, "rgba(232,89,12," + (0.10 * (cur - 315) / 110).toFixed(3) + ")"); hz.addColorStop(1, "rgba(232,89,12,0)");
      ctx.fillStyle = hz; ctx.fillRect(0, 0, LW, 300);
      /* 바람에 실려 오는 공기 → 흡입구 */
      var tt = I.P(OBS[0] - 16, OBS[1] + 4, OBS[2] + 58);
      for (i = 0; i < 3; i++) { var f = ((kPh * .6 + i / 3) % 1), ax = 40 + f * (tt.x - 70), ay = tt.y - 30 + i * 18 + f * (18 - i * 14); K.arrow(ctx, { x: ax, y: ay }, { x: ax + 34, y: ay + 2 }, "rgba(28,126,214," + (0.35 + 0.5 * Math.sin(f * Math.PI)).toFixed(2) + ")", 2.2, 8); }
      /* CO₂ 분자: 1개 = 10 ppm */
      for (i = 0; i < nBase + nExtra && i < MOL.length; i++) {
        var m = MOL[i], px = 20 + ((m[0] - 20 + kPh * 60) % 560), py = m[1] + 5 * Math.sin(kPh * 3 + m[2]);
        co2(px, py, 4.2, i >= nBase);
      }
      ctx.restore();
      labels();
      K.bigText(ctx, yr + "년 " + Math.round(cur) + " ppm", 18, 42, 27, cur > 400 ? "#ffb0a0" : "#ffffff");
      K.bigText(ctx, "대기 중 CO₂ · 마우나로아 관측소", 18, 68, 15, "#ffd35a");
      co2(28, H - 18, 4.6, false); K.t(ctx, "산업화 이전 몫", 42, H - 14, { s: 12, w: "800", c: LT.ink });
      co2(144, H - 18, 4.6, true); K.t(ctx, "늘어난 몫 (분자 1개 = 10 ppm)", 158, H - 14, { s: 12, w: "800", c: LT.orange });
      K.warn(ctx, LW - 12, H - 12, "⚠ 높이·분자 크기 과장", "right");
      /* 오른쪽 흰 카드: 킬링 곡선(작은 그래프) */
      var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "킬링 곡선 · " + yr + "년까지의 기록");
      cardBig(ctx, Math.round(cur) + " ppm", x0, 68, cur > 400 ? LT.red : LT.ink, 24);
      K.t(ctx, yr + "년", x1, 68, { s: 13, w: "900", a: "right", c: LT.mute });
      var g = K.chart(ctx, { x: RX + 6, y: 82, w: W - RX - 14, h: 170, pl: 40, pb: 26, pt: 8, pr: 10, x0: 1955, x1: 2025, y0: 300, y1: 440, xt: 2, yt: 4, light: true,
        xf: function (q) { return String(Math.round(q)); } });
      var pts = [];
      for (var mm = 0; mm <= (kYr - 1958) * 12; mm++) { var yy = 1958 + mm / 12; pts.push([yy, ppm(yy) + 3 * Math.sin(mm / 12 * 2 * Math.PI + 1.2)]); }
      K.plot(ctx, g, pts, LT.orange, { w: 1.6, light: true });
      K.planet(ctx, g.X(kYr), g.Y(cur), 5, "#ff6b6b", "#7a1f1f");
      K.row(ctx, "1958년 (첫 기록)", "약 315 ppm", x0, x1, 282, "#b7791f");
      K.row(ctx, yr + "년", "약 " + Math.round(cur) + " ppm", x0, x1, 306, LT.red);
      K.row(ctx, "늘어난 양", "+" + Math.round(cur - 315) + " ppm", x0, x1, 330, LT.ink);
      K.t(ctx, "톱니 = 계절 변화 (여름에 줄고 겨울에 늘어남)", x0, 362, { s: 12, w: "700", c: LT.mute });
      K.t(ctx, "산업화 이전 약 280 ppm", x0, 384, { s: 12, w: "700", c: LT.mute });
    }
    var kBtn = $("keel-play");
    function kLab() { if (kBtn) kBtn.textContent = kPlay ? "⏸ 멈추기" : (kYr >= 2024 ? "▶ 1958년부터 다시 보기" : "▶ 이어서 보기"); }
    if (kBtn) kBtn.addEventListener("click", function () { if (!kPlay && kYr >= 2024) kYr = 1958; kPlay = !kPlay; kLab(); draw(); });
    K.animate(canvas, function (dt) {
      if (!kPlay) return;
      kYr = Math.min(2024, kYr + dt / 150); kPh += dt / 4000;
      if (kYr >= 2024) { kPlay = false; kLab(); }
      kPainting = true; draw(); kPainting = false;
    });
    canvas._redraw = function () { kOff = null; draw(); };
    kLab(); draw();
  })();

  window.sthGate({
    gate: "g3", key: "p3", title: "자문관의 첫 답변",
    question: "만약 온실 효과가 아예 없다면 지구는 어떻게 될까요?",
    options: ["㉠ 지금보다 시원하고 살기 좋아진다", "㉡ 지금과 별 차이가 없다", "㉢ 평균 기온이 영하로 떨어져 꽁꽁 언다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 온실 상자 (한 겹 대기 복사 평형 모형) */
  (function () {
    var canvas = $("c-gh"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var e = 50, got = window.sthState("gh") || { a: false, b: false, c: false };
    function temp(ep01) { return 255 * Math.pow(2 / (2 - ep01), 0.25) - 273; }
    var ph = 0, flowing = !REDUCE, painting = false;
    var MOL = (function () { var r = [], s = 11; for (var k = 0; k < 24; k++) { s = s * 16807 % 2147483647; var u = (s - 1) / 2147483646; s = s * 16807 % 2147483647; var q = (s - 1) / 2147483646; r.push({ u: u, q: q }); } return r; })();
    function beam(x, ya, yb, w, c, label, lx, ly) {
      ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 10; K.arrow(ctx, { x: x, y: ya }, { x: x, y: yb }, c, Math.max(2, w), 10 + w * .6); ctx.restore();
      var u = (ph + x / 300) % 1; K.glow(ctx, x, lerp(ya, yb, u), 2.6, rgba(c, .95), 2.6);
      if (label) pill(ctx, label, lx || x + 14, ly || (ya + yb) / 2, { s: 11.5, c: c });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var ep01 = e / 100, T = temp(ep01), LW = 600, i;
      K.studio(ctx, 0, 0, LW, H, null);
      /* 블록 모형: 아래는 지표 블록, 위에 떠 있는 반투명 판 = 온실 기체가 든 대기층 */
      var I = K.iso({ ox: 300, oy: 196, s: 0.8, L: 300, D: 160 }), ZG = 30, ZA0 = 150, ZA1 = 196;
      floorShadow(ctx, 300, 370, 240, 40, .25);
      I.face(ctx, "front", function (Lw) { [[0, 10, "#6f7178"], [10, 22, "#9a7650"], [22, 30, "#5a4330"]].forEach(function (b) { ctx.fillStyle = b[2]; ctx.fillRect(0, b[0], Lw, b[1] - b[0]); }); });
      I.face(ctx, "right", function (Lw) { [[0, 10, "#5f6168"], [10, 22, "#876744"], [22, 30, "#4c3828"]].forEach(function (b) { ctx.fillStyle = b[2]; ctx.fillRect(0, b[0], Lw, b[1] - b[0]); }); });
      I.shade(ctx, "right", function () { return ZG; });
      var wt = clamp((T + 5) / 40, 0, 1);
      I.top(ctx, function () { return ZG; }, function (k) { return T < 0 ? (k % 2 ? "#eef6ff" : "#e2eefa") : mixC("#7fb85a", "#c9a45a", wt * .8 + (k % 2) * .04); }, 24);
      I.edges(ctx, ZG, ZG);
      if (T >= 0) for (i = 0; i < 8; i++) I.tree(ctx, 20 + i * 36, 20 + (i * 47) % 120, ZG, 0.9);
      else for (i = 0; i < 6; i++) { var ip = I.P(30 + i * 45, 30 + (i * 53) % 110, ZG); ctx.fillStyle = "rgba(255,255,255,.9)"; ell(ctx, ip.x, ip.y, 12, 4); ctx.fill(); }
      /* 대기층 판(흡수율이 클수록 진하게) */
      var al = .08 + .32 * ep01;
      I.box(ctx, 0, 0, ZA0, I.L, I.D, ZA1, "rgba(140,200,255," + (al * .9).toFixed(3) + ")", "rgba(90,160,230," + al.toFixed(3) + ")", "rgba(70,130,200," + (al * 1.1).toFixed(3) + ")");
      var nm = Math.round(ep01 * 24);
      for (var k = 0; k < nm; k++) {
        var mp = I.P(10 + MOL[k].u * (I.L - 20), 10 + MOL[k].q * (I.D - 20), ZA0 + 12 + (k % 3) * 10);
        K.planet(ctx, mp.x - 5, mp.y, 2.8, "#ff6b6b", "#7a1f1f"); K.planet(ctx, mp.x, mp.y, 3.2, "#8a92a8", "#2c3140"); K.planet(ctx, mp.x + 5, mp.y, 2.8, "#ff6b6b", "#7a1f1f");
      }
      /* 복사 화살표(화면에 수직인 기둥) */
      function col2(x, y, z0, z1, w, c) { var a = I.P(x, y, z0), b = I.P(x, y, z1); ctx.save(); ctx.shadowColor = c; ctx.shadowBlur = 6; K.arrow(ctx, a, b, c, Math.max(2, w), 9 + w * .5); ctx.restore(); var u = (ph + x / 300) % 1; K.glow(ctx, lerp(a.x, b.x, u), lerp(a.y, b.y, u), 2.4, "rgba(255,255,255,.95)", 2.4); return b; }
      var sp0 = I.P(60, 40, 282); K.sun(ctx, sp0.x, sp0.y, 12);
      col2(60, 40, 266, ZG + 2, 8, "#f59f00");
      var up = 5 + 7 * Math.pow((T + 273) / 288, 4);
      col2(150, 80, ZG + 2, ZA0 - 2, up, "#e8590c");
      if (ep01 < 1) col2(150, 80, ZA1 + 2, ZA1 + 90, up * (1 - ep01), "#e8590c");
      if (ep01 > 0) { col2(240, 110, ZA0 - 2, ZG + 2, up * ep01 / 2 + 1, "#e03131"); col2(240, 110, ZA1 + 2, ZA1 + 70, up * ep01 / 2 + 1, "#e03131"); }
      var BX = [0, LW];
      I.label(ctx, 60, 40, 232, "태양 복사 (대기를 거의 통과)", 24, 66, "#ffe9a8", BX);
      if (ep01 < 1) I.label(ctx, 150, 80, ZA1 + 60, "우주로 빠져나감 " + Math.round((1 - ep01) * 100) + "%", 40, -18, "#ffd0a8", BX);
      I.label(ctx, 150, 80, 90, "지구 복사 (적외선)", -130, 40, "#ffd0a8", BX);
      if (ep01 > 0) I.label(ctx, 240, 110, 80, "대기가 지표로 재복사", 60, 30, "#ffc9c9", BX);
      I.label(ctx, 0, I.D, ZA0 + 20, "대기 (온실 기체)", -20, 30, "#bfe6ff", BX);
      var tc = T < 0 ? "#8fc0ff" : (T > 17 ? "#ff9a7a" : "#7ee0a0");
      K.bigText(ctx, (T > 0 ? "+" : "") + T.toFixed(1) + " ℃", 18, 44, 28, tc);
      K.bigText(ctx, T < 0 ? "얼어붙은 지구" : (Math.abs(T - 15) <= 0.8 ? "지금의 지구와 비슷" : (e >= 85 ? "온실 효과가 강화된 지구" : "흡수율 " + e + "%")), 18, 72, 15, "#ffd35a");
      K.warn(ctx, LW - 12, H - 12, "⚠ 한 겹 대기 모형 · 두께와 크기는 과장", "right");
      /* 오른쪽 흰 판정 카드 */
      var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "지표 평균 기온");
      cardBig(ctx, (T > 0 ? "+" : "") + T.toFixed(1) + " ℃", x0, 70, T < 0 ? LT.blue : (T > 17 ? LT.red : LT.green), 30);
      thermo3(ctx, x1 - 16, 46, 120, (T + 25) / 50, T < 0 ? "#4f8dff" : (T > 17 ? "#ff6b4a" : "#3fbf7f"));
      K.row(ctx, "흡수율", e + " %", x0, x1 - 40, 160, LT.blue);
      K.bar(ctx, x0, 168, x1 - x0, ep01, LT.blue);
      K.row(ctx, "우주로 빠져나감", Math.round((1 - ep01) * 100) + " %", x0, x1, 206, LT.orange);
      K.row(ctx, "대기의 재복사", ep01 > 0 ? "있음" : "없음", x0, x1, 232, LT.red);
      K.t(ctx, "T = 255 K × (2 ÷ (2 − 흡수율))^¼", x0, 266, { s: 11, w: "800", c: LT.mute });
      var good2 = e === 0 || Math.abs(T - 15) <= 0.8 || e >= 85;
      K.tip(ctx, e === 0 ? "온실 효과가 없는 지구" : (Math.abs(T - 15) <= 0.8 ? "지금의 지구와 비슷합니다" : (e >= 85 ? "온실 효과가 강화된 지구" : "미션 상태가 아닙니다")), x0 - 4, 284, x1 - x0 + 8, good2 ? true : null);
      if (painting) return;
      var good = e === 0 || Math.abs(T - 15) <= 0.8 || e >= 85;
      $("gh-read").innerHTML = "<span class='k'>흡수율</span><span class='v b'>" + e + "%</span><span class='sub'>대기가 지구 복사(적외선)를 흡수하는 비율</span>" +
        "<span class='k'>지표 평균 기온</span><span class='v " + (T < 0 ? "b" : (T > 17 ? "r" : "g")) + "'>" + (T > 0 ? "+" : "") + T.toFixed(1) + " ℃</span><span class='sub'>T = 255 K × (2 ÷ (2 − 흡수율))^¼</span>" +
        "<span class='ok " + (good ? "g" : "r") + "'>" + (e === 0 ? "온실 효과가 없는 지구" : (Math.abs(T - 15) <= 0.8 ? "지금의 지구와 비슷합니다" : (e >= 85 ? "온실 효과가 강화된 지구" : "미션 상태가 아닙니다"))) + "</span>";

      var state = e === 0 ? "온실 효과가 전혀 없으면 지구는 평균 <b>−18℃</b>, 바다까지 얼어붙습니다." :
        (Math.abs(T - 15) <= 0.8 ? "지금의 지구와 같은 <b>약 15℃</b>입니다. 자연적인 온실 효과 덕분에 33℃나 따뜻한 셈입니다." :
        (e >= 85 ? "온실 기체가 늘어 흡수율이 높아지면 재복사가 늘고 지표가 더 뜨거워집니다. 이것이 <b>온실 효과의 강화</b>입니다." :
        (T < 15 ? "지금의 지구(15℃)보다 춥습니다. 흡수율을 더 높여 보세요." : "지금의 지구(15℃)보다 덥습니다.")));
      $("gh-info").innerHTML = state;
      var ch = false;
      if (e === 0 && !got.a) { got.a = ch = true; }
      if (Math.abs(T - 15) <= 0.8 && !got.b) { got.b = ch = true; }
      if (e >= 85 && !got.c) { got.c = ch = true; }
      if (ch) { window.sthState("gh", got); mission(); }
    }
    function mission() {
      if (got.a) done("m3-2a"); if (got.b) done("m3-2b"); if (got.c) done("m3-2c");
      if (got.a && got.b && got.c) {
        window.sthMission("m3-2", true, "<span class='m-tag'>미션 완료</span>온실 효과 없음 −18℃ → 자연 상태 15℃ → 강화되면 그 이상. 없애야 할 것은 온실 효과가 아니라 <b>온실 효과의 ‘강화’</b>입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    playBtn("gh-play", "⏸ 빛의 흐름 멈추기", "▶ 빛의 흐름 보기", function () { return flowing; }, function (x) { flowing = x; });
    K.animate(canvas, function (dt) { if (flowing) { ph = (ph + dt / 1800) % 1; painting = true; draw(); painting = false; } });
    $("gh-e").addEventListener("input", function (ev) { e = +ev.target.value; $("gh-e-val").textContent = e + "%"; draw(); });
    draw(); mission();
  })();

  /* 장면 3 — 엘니뇨 단면 + 보고 분류 */
  /* 아이소메트릭 블록 모형: 적도 태평양을 동서(x: 왼쪽 위 서태평양 → 오른쪽 아래 동태평양)로 잘라 낸 블록.
     앞면(y = D) = 적도 단면(따뜻한 표층수 / 기울어진 수온 약층 / 차가운 심층수), 오른쪽 면(x = L) = 페루 앞바다 남북 단면.
     윗면 = 해수면 수온 색 + 서쪽 인도네시아 섬들 + 뒤쪽 오른편 페루 해안·안데스. 위로는 워커 순환 고리와 비구름. */
  (function () {
    var canvas = $("c-enso"), mainCtx = window.setupCanvas(canvas), ctx = mainCtx, W = canvas._w, H = canvas._h;
    var off = null, offKey = null;   /* 움직이지 않는 부분(블록·지형)은 무역풍 값이 바뀔 때만 다시 그려 둔다 */
    var w = 70, seen = !!window.sthState("ensoSeen"), sorted = !!window.sthState("ensoSorted");
    var ph = 0, flowing = !REDUCE, painting = false;
    /* 모형 치수(그림 단위): 동서 L, 남북 D, 해저 ZB, 해수면 ZS. YC 보다 뒤(y < YC)에만 페루 땅, YL = 대기 고리가 지나는 면 */
    var LW = 636, L = 560, D = 130, ZB = 14, ZS = 128, HW = ZS - ZB, YC = D * 0.46, YL = D * 0.56;
    var I = K.iso({ ox: 250, oy: 214, s: 0.74, L: L, D: D });
    /* 섬·안데스 부분만 더 촘촘한 격자로 다시 그린다(같은 투영, 원점만 옮김) */
    var PX0 = 430, PD = 70, p0 = I.P(PX0, 0, 0);
    var IW = K.iso({ ox: 250, oy: 214, s: 0.74, L: 210, D: D }), IPe = K.iso({ ox: p0.x, oy: p0.y, s: 0.74, L: L - PX0, D: PD });
    var S = {};
    function sm(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
    function hx(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    function mix(a, b, t, f) {
      var p = hx(a), q = hx(b), o = [], i; f = f || 1;
      for (i = 0; i < 3; i++) o.push(clamp(Math.round((p[i] + (q[i] - p[i]) * t) * f), 0, 255));
      return "rgb(" + o.join(",") + ")";
    }
    /* 해수면 수온 색(20℃ 파랑 → 30℃ 빨강) */
    var SSTC = [[20, "#2c6fbb"], [22.5, "#3fa7c9"], [25, "#9fd3a0"], [27, "#f3d36b"], [28.5, "#f59a45"], [30, "#e2442f"]];
    function sstCol(t, f, wash) {
      t = clamp(t, 20, 30);
      for (var i = 1; i < SSTC.length; i++) if (t <= SSTC[i][0]) break;
      i = Math.min(i, SSTC.length - 1);
      var a = hx(SSTC[i - 1][1]), b = hx(SSTC[i][1]), u = clamp((t - SSTC[i - 1][0]) / (SSTC[i][0] - SSTC[i - 1][0]), 0, 1), o = [], j;
      for (j = 0; j < 3; j++) { var c = a[j] + (b[j] - a[j]) * u; if (wash) c = c + (232 - c) * wash; o.push(clamp(Math.round(c * (f || 1)), 0, 255)); }
      return "rgb(" + o.join(",") + ")";
    }
    /* 상태 — 수온 약층 깊이 fW·fE(서·동), 비구름 위치 cx, 페루 연안 수온 sE */
    function setState() {
      var k = w / 100;
      S.k = k; S.sE = lerp(29, 20, k); S.sW = 29 + k; S.xb = lerp(1.0, 0.38, k);
      S.fW = lerp(100, 170, k) / 200; S.fE = lerp(95, 22, k) / 200;     /* 무역풍이 약할수록 평평해진다(거꾸로 기울지는 않는다) */
      S.cx = L * lerp(0.75, 0.15, k);
      S.dry = clamp((0.5 - k) / 0.3, 0, 1);
    }
    function sst(x, y) { var c = sm(S.xb - 0.3, S.xb + 0.12, x / L) * (0.7 + 0.3 * y / D); return S.sW - (S.sW - S.sE) * c; }
    function thermo(u) { var t = u / L; return ZS - HW * lerp(S.fW, S.fE, t * 0.45 + sm(0, 1, t) * 0.55); }
    function thermoR(u) { return ZS - HW * S.fE * (1 - 0.5 * S.k * (1 - sm(YC, D, u))); }

    /* 지형: 서쪽 섬들(높이 봉우리 합), 뒤쪽 오른편 페루 해안과 안데스 */
    var ISL = [[46, 36, 30, 26], [100, 96, 22, 21], [32, 104, 19, 16], [146, 44, 16, 15]];
    function isl(x, y) {
      if (x > 210) return 0;
      var z = -8;
      for (var i = 0; i < ISL.length; i++) { var q = ISL[i], dx = x - q[0], dy = y - q[1]; z += q[2] * Math.exp(-(dx * dx + dy * dy) / (q[3] * q[3])); }
      return ZS + z;
    }
    function coast(y) { return L - 96 + 9 * Math.sin(y / 9); }
    function peru(x, y) {
      var xc = coast(y); if (x < xc - 8) return 0;
      var fy = 1 - sm(YC - 16, YC, y), r = x - xc;
      var andes = (70 + 14 * Math.sin(y / 6 + 1.3) + 8 * Math.sin(y / 2.7)) * Math.exp(-Math.pow((x - (L - 30)) / 28, 2)) * sm(0, 30, r);
      return ZS - 5 + fy * (5 + clamp(r, 0, 40) * 0.45 + andes);
    }
    function land(x, y) { return Math.max(isl(x, y), peru(x, y)); }
    function zTop(x, y) { return Math.max(ZS, land(x, y)); }
    function seabedF(u) { return ZB + (5 * Math.sin(u / 37) + 3 * Math.sin(u / 13 + 1)) * sm(0, 40, u) * (1 - sm(L - 40, L, u)); }
    function rockR(u) { return u < YC ? Math.max(ZB, peru(L, u)) : Math.max(ZB, ZS - 5 - (u - YC) * 2.4); }
    function colTop(x, y, z, lt) {
      if (z <= ZS + 0.4) {
        return sstCol(sst(x, y), 1.03 - 0.07 * x / L + 0.03 * Math.sin(x / 23 + y / 11), land(x, y) > ZS - 4 ? 0.2 : 0);
      }
      var h = z - ZS;
      if (x < 250) return h < 3 ? K.tint("#e9d9a6", lt) : mix("#4f9a3f", "#a88a52", S.dry, lt);
      if (h < 4) return K.tint("#e4cf98", lt);
      if (h > 74) return K.tint("#f4f7fb", lt);
      if (h > 66) return mix("#a89887", "#eef2f6", (h - 66) / 8, lt);
      if (h > 36) return mix("#a48b6c", "#857463", (h - 36) / 30, lt);
      return K.tint("#c9a86a", lt);
    }
    /* 섬의 나무 자리(고정) */
    var TREES = (function () {
      var R = K.rng(23), out = [], n = 0;
      while (out.length < 26 && n < 3000) {
        n++; var x = 8 + R() * 170, y = 6 + R() * (D - 12), z = isl(x, y);
        if (z > ZS + 5) out.push([x, y, z]);
      }
      return out.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); });
    })();
    var BOATS = [[L - 132, D - 26], [L - 92, D - 58], [L - 170, D - 66], [L - 62, D - 30], [L - 128, D - 92]];

    function drawFront() {
      I.face(ctx, "front", function (Lw) {
        var u, i;
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Lw, ZS); ctx.clip();
        var dg = ctx.createLinearGradient(0, ZB, 0, ZS); dg.addColorStop(0, "#0a2350"); dg.addColorStop(1, "#2f6db0");
        ctx.fillStyle = dg; ctx.fillRect(0, 0, Lw, ZS);
        /* 수온 약층 아래 옅은 띠(물의 온도가 급히 바뀌는 층) */
        ctx.beginPath(); for (u = 0; u <= Lw; u += 8) ctx.lineTo(u, thermo(u) + 1);
        for (u = Lw; u >= 0; u -= 8) ctx.lineTo(u, thermo(u) - 12); ctx.closePath();
        ctx.fillStyle = "rgba(140,190,240,.35)"; ctx.fill();
        /* 따뜻한 표층수: 가로 색 = 그 자리 수온 */
        ctx.beginPath(); ctx.moveTo(0, ZS); ctx.lineTo(Lw, ZS);
        for (u = Lw; u >= 0; u -= 8) ctx.lineTo(u, thermo(u)); ctx.closePath();
        var wg = ctx.createLinearGradient(0, 0, Lw, 0);
        for (i = 0; i <= 8; i++) wg.addColorStop(i / 8, sstCol(sst(Lw * i / 8, D) - 0.4, 0.97));
        ctx.fillStyle = wg; ctx.fill();
        ctx.save(); ctx.clip();
        var vg = ctx.createLinearGradient(0, ZS, 0, ZS - HW * 0.9); vg.addColorStop(0, "rgba(255,255,255,.16)"); vg.addColorStop(1, "rgba(40,20,60,.30)");
        ctx.fillStyle = vg; ctx.fillRect(0, 0, Lw, ZS); ctx.restore();
        ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.6; ctx.setLineDash([7, 5]);
        ctx.beginPath(); for (u = 0; u <= Lw; u += 8) ctx.lineTo(u, thermo(u)); ctx.stroke(); ctx.setLineDash([]);
        /* 해저 */
        ctx.beginPath(); ctx.moveTo(0, 0); for (u = 0; u <= Lw; u += 6) ctx.lineTo(u, seabedF(u)); ctx.lineTo(Lw, 0); ctx.closePath();
        var rg = ctx.createLinearGradient(0, 0, 0, ZB + 8); rg.addColorStop(0, "#3a2f2a"); rg.addColorStop(1, "#6d5d50");
        ctx.fillStyle = rg; ctx.fill();
        var R = K.rng(31); ctx.fillStyle = "rgba(255,240,220,.18)";
        for (i = 0; i < 160; i++) { var px = R() * Lw; ctx.fillRect(px, R() * (seabedF(px) - 2), 1.4, 1.4); }
        ctx.restore();
      });
    }
    function drawRight() {
      I.face(ctx, "right", function (Lw) {
        var u, i;
        var dg = ctx.createLinearGradient(0, ZB, 0, ZS); dg.addColorStop(0, "#0a2350"); dg.addColorStop(1, "#2f6db0");
        ctx.fillStyle = dg; ctx.fillRect(0, 0, Lw, ZS);
        ctx.beginPath(); ctx.moveTo(0, ZS); ctx.lineTo(Lw, ZS);
        for (u = Lw; u >= 0; u -= 4) ctx.lineTo(u, thermoR(u)); ctx.closePath();
        ctx.fillStyle = sstCol(S.sE - 0.4, 0.9); ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.4; ctx.setLineDash([6, 4]);
        ctx.beginPath(); for (u = 0; u <= Lw; u += 4) ctx.lineTo(u, thermoR(u)); ctx.stroke(); ctx.setLineDash([]);
        /* 남아메리카 대륙(페루)과 대륙 사면 */
        ctx.beginPath(); ctx.moveTo(0, 0); for (u = 0; u <= Lw; u += 3) ctx.lineTo(u, rockR(u)); ctx.lineTo(Lw, 0); ctx.closePath();
        var rg = ctx.createLinearGradient(0, 0, 0, ZS + 90); rg.addColorStop(0, "#3e3128"); rg.addColorStop(.6, "#7a5c40"); rg.addColorStop(1, "#946f4a");
        ctx.fillStyle = rg; ctx.fill();
        ctx.save(); ctx.clip();
        ctx.strokeStyle = "rgba(40,25,15,.28)"; ctx.lineWidth = 1;
        for (i = 1; i < 9; i++) { ctx.beginPath(); ctx.moveTo(0, ZB + i * 22); ctx.lineTo(Lw, ZB + i * 22 - 6); ctx.stroke(); }
        var R = K.rng(41); ctx.fillStyle = "rgba(255,240,210,.22)";
        for (i = 0; i < 90; i++) ctx.fillRect(R() * Lw, R() * (ZS + 90), 1.4, 1.4);
        ctx.restore();
        ctx.strokeStyle = "#c9a86a"; ctx.lineWidth = 2.4; ctx.beginPath();
        for (u = 0; u <= YC; u += 2) ctx.lineTo(u, rockR(u) - 1); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(YC + 2, ZS); ctx.lineTo(Lw, ZS); ctx.stroke();
      });
    }
    /* 섬의 나무(엘니뇨면 마른다) */
    function trees() {
      TREES.forEach(function (t, i) {
        var p = I.P(t[0], t[1], t[2]), sc = 0.8 + (i % 3) * 0.15;
        ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.beginPath(); ctx.ellipse(p.x + 2.5, p.y, 4.5 * sc, 1.6 * sc, 0, 0, 6.283); ctx.fill();
        ctx.fillStyle = "#6b4a2e"; ctx.fillRect(p.x - 0.8, p.y - 6 * sc, 1.6, 6 * sc);
        var g = ctx.createRadialGradient(p.x - 1.5 * sc, p.y - 9 * sc, 0.5, p.x, p.y - 8 * sc, 5 * sc);
        g.addColorStop(0, mix("#8fd06a", "#d8b878", S.dry)); g.addColorStop(1, mix("#25602a", "#7a5a32", S.dry));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y - 8 * sc, 4.6 * sc, 0, 6.283); ctx.fill();
      });
    }
    function smoke() {
      [[52, 42], [104, 98]].forEach(function (q, n) {
        var z = isl(q[0], q[1]), b = I.P(q[0], q[1], z);
        K.glow(ctx, b.x, b.y - 2, 2.2, "rgba(255,120,40,.95)", 3.2);
        for (var j = 0; j < 6; j++) {
          var t = (ph * 0.9 + j / 6 + n * 0.3) % 1, p = I.P(q[0] + t * 14, q[1] - t * 4, z + 4 + t * 46), r = 3 + t * 9;
          ctx.fillStyle = "rgba(95,92,98," + (0.5 * (1 - t)).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
        }
      });
    }
    function boats(n) {
      for (var i = 0; i < n; i++) {
        var b = BOATS[i], z = ZS + 0.8 * Math.sin(ph * 9 + i * 2), x = b[0], y = b[1];
        var w1 = I.P(x + 12, y, ZS), w2 = I.P(x + 30, y, ZS);
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(w1.x, w1.y); ctx.lineTo(w2.x, w2.y); ctx.stroke();
        I.box(ctx, x - 12, y - 4, z, x + 12, y + 4, z + 5, "#f3efe6", "#d9493a", "#a8352b");
        I.box(ctx, x - 1, y - 2.5, z + 5, x + 7, y + 2.5, z + 12, "#ffffff", "#e6e9ee", "#b9c0cc");
        var m1 = I.P(x - 6, y, z + 5), m2 = I.P(x - 6, y, z + 21);
        ctx.strokeStyle = "#5b4636"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.stroke();
      }
    }
    function ripples() {
      ctx.strokeStyle = "rgba(255,255,255,.55)"; ctx.lineWidth = 1;
      for (var i = 0; i < 16; i++) {
        var gx = 190 + ((i * 0.377 + ph * 0.03) % 1) * (L - 300), gy = 10 + ((i * 0.618) % 1) * (D - 20);
        if (land(gx, gy) > ZS - 4) continue;
        var s1 = I.P(gx - 9, gy, ZS), s2 = I.P(gx + 7, gy, ZS);
        ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.quadraticCurveTo((s1.x + s2.x) / 2, s1.y - 2.5, s2.x, s2.y); ctx.stroke();
      }
    }
    /* 워커 순환: y = YL 면 위의 둥근 고리(서쪽 상승 → 상층 동쪽으로 → 동쪽 하강 → 지표 무역풍 서쪽으로) */
    function loop(xR, xS, z0, z1) {
      var r = Math.min(16, (xS - xR) / 3), pts = [], i, a;
      function seg(x0, z0_, x1, z1_, n) { for (var j = 0; j < n; j++) pts.push([lerp(x0, x1, j / n), lerp(z0_, z1_, j / n)]); }
      function arc(cx, cz, a0, a1) { for (var j = 0; j < 6; j++) { a = lerp(a0, a1, j / 6); pts.push([cx + r * Math.cos(a), cz + r * Math.sin(a)]); } }
      seg(xS - r, z0, xR + r, z0, 24); arc(xR + r, z0 + r, -Math.PI / 2, -Math.PI);
      seg(xR, z0 + r, xR, z1 - r, 10); arc(xR + r, z1 - r, Math.PI, Math.PI / 2);
      seg(xR + r, z1, xS - r, z1, 24); arc(xS - r, z1 - r, Math.PI / 2, 0);
      seg(xS, z1 - r, xS, z0 + r, 10); arc(xS - r, z0 + r, 0, -Math.PI / 2);
      var sp = pts.map(function (q) { return I.P(q[0], YL, q[1]); }), len = [0];
      for (i = 1; i <= sp.length; i++) { var p0 = sp[i - 1], p1 = sp[i % sp.length]; len.push(len[i - 1] + Math.hypot(p1.x - p0.x, p1.y - p0.y)); }
      return { sp: sp, len: len, at: function (f) {
        var tl = len[len.length - 1] * (((f % 1) + 1) % 1), j = 1;
        while (j < len.length - 1 && len[j] < tl) j++;
        var q0 = sp[j - 1], q1 = sp[j % sp.length], t = (tl - len[j - 1]) / Math.max(1e-6, len[j] - len[j - 1]);
        return { x: lerp(q0.x, q1.x, t), y: lerp(q0.y, q1.y, t) };
      } };
    }
    function drawLoop(lp, k) {
      var sp = lp.sp, i, a = 0.35 + 0.5 * k;
      ctx.save(); ctx.lineJoin = "round";
      ctx.beginPath(); sp.forEach(function (p, j) { if (j) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.closePath();
      ctx.strokeStyle = "rgba(30,90,170," + (a * 0.55).toFixed(3) + ")"; ctx.lineWidth = 4 + 7 * k; ctx.stroke();
      ctx.strokeStyle = "rgba(235,248,255," + Math.min(1, a + 0.2).toFixed(3) + ")"; ctx.lineWidth = 1.4 + 2 * k; ctx.stroke();
      ctx.restore();
      [0.2, 0.42, 0.62, 0.9].forEach(function (f) {
        var p0 = lp.at(f - 0.012), p1 = lp.at(f + 0.012);
        K.arrow(ctx, p0, p1, "rgba(20,70,150,.9)", 2, 9 + 4 * k);
      });
      for (i = 0; i < 14; i++) {
        var q = lp.at(i / 14 + ph * (0.25 + 0.6 * k));
        K.glow(ctx, q.x, q.y, 1.7, "rgba(40,150,255,.95)", 2.6);
      }
    }
    /* 큰 적란운(입체 구름 덩어리)과 비 */
    /* 큰 적란운: 아래 덩어리 → 솟은 탑 → 위가 넓게 퍼진 모루. 퍼프마다 왼쪽 위에서 빛을 받는 공 */
    var PUFF = (function () {
      var R = K.rng(77), out = [], i, a, rr;
      for (i = 0; i < 30; i++) { a = R() * 6.283; rr = 26 * Math.sqrt(R()) * (1 - i / 45); out.push([Math.cos(a) * rr * 1.3, Math.sin(a) * rr * 0.7, (i / 30) * 46, 10 + R() * 7, 0]); }
      for (i = 0; i < 18; i++) { a = R() * 6.283; rr = Math.sqrt(R()); out.push([Math.cos(a) * rr * 58, Math.sin(a) * rr * 16, 50 + R() * 8, 9 + R() * 4, 1]); }
      return out;
    })();
    function puff(q, zb, flat) {
      var p = I.P(q[0], q[1], q[2]), r = q[3] * I.s * 1.3, lo = clamp((q[2] - zb) / 70, 0, 1);
      var g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.5, r * 0.1, p.x, p.y, r * 1.05);
      g.addColorStop(0, "#ffffff"); g.addColorStop(0.6, mix("#d3dae5", "#f3f6f9", lo)); g.addColorStop(1, mix("#8e9ab0", "#c2cad7", lo));
      ctx.fillStyle = g; ctx.beginPath();
      if (flat) ctx.ellipse(p.x, p.y, r * 1.35, r * 0.8, 0, 0, 6.283); else ctx.arc(p.x, p.y, r, 0, 6.283);
      ctx.fill();
    }
    function cloud(cx, cy) {
      var zb = ZS + 28, i;
      var sh = I.P(cx, cy, ZS), g0 = ctx.createRadialGradient(sh.x, sh.y, 2, sh.x, sh.y, 44);
      g0.addColorStop(0, "rgba(10,20,50,.30)"); g0.addColorStop(1, "rgba(10,20,50,0)");
      ctx.fillStyle = g0; ctx.beginPath(); ctx.ellipse(sh.x, sh.y, 46, 17, 0, 0, 6.283); ctx.fill();
      /* 비 */
      ctx.strokeStyle = "rgba(40,90,170,.7)"; ctx.lineWidth = 1.3;
      for (i = 0; i < 26; i++) {
        var ru = (ph * 2.4 + i * 0.137) % 1, rx = cx - 30 + (i * 37 % 60), ry = cy - 12 + (i * 23 % 24), zt = zb - 4 - ru * (zb - ZS - 4);
        if (zt - 8 < ZS) continue;
        var a = I.P(rx, ry, zt), b = I.P(rx, ry, zt - 8);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x - 1.5, b.y); ctx.stroke();
      }
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.22)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
      PUFF.map(function (q) { return [cx + q[0], cy + q[1], zb + q[2], q[3], q[4]]; })
        .sort(function (p, q) { return (p[0] + p[1] + 1.4 * p[2]) - (q[0] + q[1] + 1.4 * q[2]); })
        .forEach(function (q) { puff(q, zb, q[4] === 1); });
      ctx.restore();
    }
    function render() {
      setState();
      var k = S.k, i;
      if (offKey !== w || !off || off.width !== canvas.width) {
        if (!off) off = document.createElement("canvas");
        off.width = canvas.width; off.height = canvas.height;
        var dpr = canvas.width / W;
        ctx = off.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
        var fc = I.P(L * 0.5, D * 0.5, 0);
        K.studio(ctx, 0, 0, LW, H, { x: fc.x + 10, y: fc.y + 40, rx: 300, ry: 92 });
        ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
        I.field(ctx, function (x, y) { return (x < 210 || (x > PX0 && y < PD)) ? ZS : zTop(x, y); }, colTop, 80, 20);
        IW.field(ctx, zTop, colTop, 84, 52);
        IPe.field(ctx, function (x, y) { return zTop(x + PX0, y); }, function (x, y, z, lt) { return colTop(x + PX0, y, z, lt); }, 52, 28);
        drawFront(); drawRight();
        I.shade(ctx, "front", function () { return ZS; });
        I.shade(ctx, "right", function (u) { return Math.max(ZS, rockR(u)); });
        I.edges(ctx, ZS, ZS);
        trees();
        ctx.restore();
        ctx = mainCtx; offKey = w;
      }
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(off, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      ripples(); if (w < 40) smoke();
      var fish = Math.round(lerp(15, 100, k));
      boats(clamp(Math.round(fish / 20), 1, 5));
      /* 용승(페루 앞바다): 찬 심층수가 솟아오른다 */
      if (k > 0.15) {
        var ux = L - 24, ua = I.P(ux, D, ZB + 18), ub = I.P(ux, D, ZS - 6);
        ctx.save(); ctx.shadowColor = "#7fd3ff"; ctx.shadowBlur = 10; K.arrow(ctx, ua, ub, "#bfe8ff", 2 + 5 * k, 12); ctx.restore();
        for (i = 0; i < 4; i++) { var bu = (ph * (0.5 + k) + i / 4) % 1, bp = I.P(ux + Math.sin(i * 2 + ph * 6) * 6, D, lerp(ZB + 20, ZS - 8, bu)); K.glow(ctx, bp.x, bp.y, 1.8, "rgba(191,232,255,.9)", 2.4); }
        var ra = I.P(L, YC + 34, ZS - 62), rb = I.P(L, YC + 12, ZS - 5);
        ctx.save(); ctx.shadowColor = "#7fd3ff"; ctx.shadowBlur = 8; K.arrow(ctx, ra, rb, "#bfe8ff", 1.5 + 3 * k, 10); ctx.restore();
      }
      /* 지표 바람결(무역풍, 동 → 서) */
      var xa = L - 90, xw = lerp(L - 190, 120, k), nS = Math.round(3 + 9 * k);
      for (i = 0; i < nS; i++) {
        var su = (ph * (0.3 + k) + i / nS) % 1, sx = lerp(xa, xw, su), sy = D * (0.66 + 0.26 * ((i * 0.618) % 1));
        if (land(sx, sy) > ZS - 4) continue;
        var s1 = I.P(sx, sy, ZS + 7), s2 = I.P(sx - 22, sy, ZS + 7);
        ctx.strokeStyle = "rgba(255,255,255," + (0.85 * Math.sin(su * Math.PI)).toFixed(3) + ")"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
      }
      /* 워커 순환 고리 + 비구름 (구름은 기존 모형처럼 k 에 따라 동서로 이동) */
      var xS = L - 78, xR = Math.min(S.cx, xS - 60), lp = loop(xR, xS, ZS + 12, ZS + 76);
      drawLoop(lp, k);
      if (w < 40) {
        var da = I.P(L * 0.13, YL, ZS + 72), db = I.P(L * 0.13, YL, ZS + 20);
        ctx.save(); ctx.setLineDash([5, 4]); K.arrow(ctx, da, db, "rgba(170,95,35,.9)", 2.4, 10); ctx.restore();
      }
      cloud(S.cx, YL);
      ctx.restore();

      /* 이름표 */
      var BX = [0, LW];
      I.label(ctx, 70, D, ZS - 22, "따뜻한 표층수", -26, 66, "#ffd9a8", BX);
      I.label(ctx, 250, D, thermo(250), "수온 약층", -20, 74, "#ffffff", BX);
      I.label(ctx, 150, D, ZB + 26, "차가운 심층수", -26, 52, "#cfe8ff", BX);
      if (k > 0.15) I.label(ctx, L - 24, D, ZB + 52, "용승", 44, 34, "#bfe8ff", BX);
      if (k >= 0.4) I.label(ctx, (xR + xS) / 2, YL, ZS + 12, "무역풍", 14, -26, "#ffffff", BX);
      else I.label(ctx, (xR + xS) / 2, YL, ZS + 12, "약해진 무역풍", 10, 40, "#ffffff", BX);
      I.label(ctx, 32, 104, isl(32, 104), "인도네시아·호주", -34, -8, "#d9f7c8", BX);
      I.label(ctx, L - 26, 22, peru(L - 26, 22), "페루 · 안데스 산맥", 18, -26, "#f4e6c4", BX);
      if (k >= 0.4) I.label(ctx, (xR + xS) / 2 + 30, YL, ZS + 76, "워커 순환", 8, -24, "#e8ecff", BX);
      else I.label(ctx, xR + 6, YL, ZS + 76, "워커 순환 (동쪽으로 옮겨 감)", -30, -26, "#e8ecff", BX);
      if (w < 40) I.label(ctx, L * 0.13, YL, ZS + 46, "건조한 하강 기류", 40, -6, "#ffd0a0", BX);

      var name = w < 40 ? "엘니뇨" : (w > 88 ? "라니냐" : "평년");
      K.bigText(ctx, name, 18, 52, 32, w < 40 ? "#ffb35c" : (w > 88 ? "#8fd3ff" : "#ffffff"));
      K.bigText(ctx, w < 40 ? "무역풍이 약해져 따뜻한 물이 동쪽으로" : (w > 88 ? "무역풍이 강해져 동쪽 바다가 더 차갑다" : "무역풍이 따뜻한 물을 서쪽으로 민다"), 18, 82, 17, "#ffd35a");
      K.warn(ctx, LW - 14, 30, "⚠ 깊이·높이·기울기는 보기 쉽게 과장", "right");

      /* 오른쪽 판정 카드 */
      var RX = LW + 10, px = RX + 18, sE = S.sE;
      var card = ctx.createLinearGradient(RX, 0, W, H); card.addColorStop(0, "#ffffff"); card.addColorStop(1, "#eef2f8");
      ctx.save(); ctx.shadowColor = "rgba(20,30,60,.18)"; ctx.shadowBlur = 14; ctx.fillStyle = card; ctx.beginPath(); ctx.roundRect(RX, 0, W - RX, H, 14); ctx.fill(); ctx.restore();
      K.t(ctx, "판정", px, 30, { s: 12.5, w: "800", c: "#5c7086" });
      K.t(ctx, name, px, 66, { s: 24, w: "900", c: w < 40 ? "#d9480f" : (w > 88 ? "#1c64c4" : "#0f9f76") });
      K.t(ctx, "무역풍 세기 " + w + " / 100", W - 18, 66, { s: 12, w: "700", a: "right", c: "#5c7086" });
      var row = function (kk, vv, y, c) { K.t(ctx, kk, px, y, { s: 12, w: "700", c: "#5c7086" }); K.t(ctx, vv, W - 18, y, { s: 13.5, w: "900", a: "right", c: c || "#12203a" }); };
      row("페루 연안 표층 수온", sE.toFixed(1) + " ℃", 104, sE > 25 ? "#c2410c" : "#1c64c4");
      row("멸치 어획 지수", String(fish), 134, fish < 40 ? "#c2410c" : "#0f766e");
      var bx = px, bw = W - 18 - px;
      ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(bx, 144, bw, 10, 5); ctx.fill();
      ctx.fillStyle = fish < 40 ? "#f59e0b" : "#14b8a6"; ctx.beginPath(); ctx.roundRect(bx, 144, Math.max(6, bw * fish / 100), 10, 5); ctx.fill();
      var cf = S.cx / L;
      row("비구름 위치", cf < 0.36 ? "서태평양" : (cf < 0.58 ? "중앙 태평양" : "중앙·동태평양"), 184);
      row("인도네시아·호주", w < 40 ? "가뭄 · 산불" : (w > 88 ? "비가 더 많다" : "비가 많다"), 212, w < 40 ? "#c2410c" : "#1c64c4");
      row("페루 해안", w < 40 ? "폭우 · 홍수" : "맑고 건조", 240, w < 40 ? "#1c64c4" : "#a16207");
      var dif = S.fW - S.fE;
      row("수온 약층", dif > 0.35 ? "서쪽 깊고 동쪽 얕다" : (dif > 0.12 ? "기울기가 줄었다" : "거의 평평해짐"), 268);
      var tip = w < 40 ? "용승이 약해져 어장이 텅 빕니다" : (w > 88 ? "용승이 더 활발 · 동쪽이 더 차갑다" : "용승으로 영양염이 올라와 좋은 어장");
      ctx.fillStyle = w < 40 ? "#fdeee4" : "#e7f7f0"; ctx.beginPath(); ctx.roundRect(px - 4, 288, W - px - 14, 34, 10); ctx.fill();
      K.t(ctx, tip, px + 6, 310, { s: 11.5, w: "800", c: w < 40 ? "#b4400c" : "#0f766e" });
      /* 수온 색 범례 */
      K.t(ctx, "윗면 색 = 해수면 수온", px, 356, { s: 11.5, w: "800", c: "#5c7086" });
      var lg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
      for (i = 0; i <= 10; i++) lg.addColorStop(i / 10, sstCol(20 + i));
      ctx.fillStyle = lg; ctx.beginPath(); ctx.roundRect(bx, 366, bw, 12, 6); ctx.fill();
      K.t(ctx, "20℃", bx, 394, { s: 10.5, c: "#5c7086" }); K.t(ctx, "25", bx + bw / 2, 394, { s: 10.5, a: "center", c: "#5c7086" }); K.t(ctx, "30℃", bx + bw, 394, { s: 10.5, a: "right", c: "#5c7086" });
      K.t(ctx, "앞면 = 적도 단면 (서 → 동)", px, 428, { s: 11, c: "#5c7086" });
      K.t(ctx, "오른쪽 면 = 페루 앞바다 단면", px, 446, { s: 11, c: "#5c7086" });
      return { name: name, fish: fish };
    }
    function draw() {
      var r = render();
      if (painting) return;
      var k = w / 100, sst = lerp(29, 20, k), fish = r.fish;
      var name = w < 40 ? "엘니뇨" : (w > 88 ? "라니냐" : "평년");
      $("enso-w-val").textContent = name;
      $("enso-info").innerHTML = "<b>" + name + "</b> · 페루 연안 표층 수온 <b>" + sst.toFixed(1) + "℃</b> · 페루 멸치 어획량 지수 <b>" + fish + "</b><br>" +
        (w < 40 ? "무역풍이 약해지자 서쪽에 쌓여 있던 따뜻한 물이 동쪽으로 퍼지고, 페루 앞바다의 <b>용승이 약해져</b> 영양염이 올라오지 못합니다. 비구름이 동쪽으로 옮겨 가 인도네시아·호주에는 <b>가뭄과 산불</b>이, 페루에는 폭우가 옵니다." :
         (w > 88 ? "무역풍이 평소보다 강해 용승이 더 활발합니다. 동태평양은 더 차갑고, 서태평양에는 비가 더 많이 옵니다." :
          "무역풍이 따뜻한 물을 서쪽으로 밀어 서태평양에 비가 많고, 페루 앞바다에서는 찬 심층수가 솟아올라(용승) 좋은 어장이 됩니다."));
      if (w < 40 && !seen) { seen = true; window.sthState("ensoSeen", 1); mission(); }
    }
    function mission() {
      if (seen) done("m3-3a"); if (sorted) done("m3-3b");
      if (seen && sorted) { window.sthMission("m3-3", true, "<span class='m-tag'>미션 완료</span>엘니뇨는 자연 변동이지만, 바다가 더워질수록 그 피해가 커질 수 있습니다. 사막화는 기후 변화와 사람의 토지 이용이 겹쳐 일어납니다."); ep.clear(2); }
    }
    canvas._redraw = draw;
    playBtn("enso-play", "⏸ 바람·물 멈추기", "▶ 바람·물 움직이기", function () { return flowing; }, function (x) { flowing = x; });
    K.animate(canvas, function (dt) { if (flowing) { ph = (ph + dt / 4000) % 100; painting = true; draw(); painting = false; } });
    $("enso-w").addEventListener("input", function (ev) { w = +ev.target.value; draw(); });
    window.sthSort({
      mount: "s3-sort",
      buckets: [{ id: "g", label: "🌡️ 지구 온난화" }, { id: "e", label: "🌊 엘니뇨" }, { id: "d", label: "🏜️ 사막화" }],
      items: [
        { t: "화석 연료를 많이 써서 대기 중 온실 기체가 늘었다", a: "g", why: "지구 온난화의 원인입니다." },
        { t: "빙하가 녹고 바닷물이 팽창해 해수면이 높아진다", a: "g", why: "지구 온난화의 영향입니다." },
        { t: "봄꽃이 피는 시기가 해마다 빨라진다", a: "g", why: "기온 상승이 생물의 계절 활동을 바꾸고 있습니다." },
        { t: "무역풍이 약해져 따뜻한 바닷물이 동쪽으로 밀려온다", a: "e", why: "엘니뇨가 일어나는 과정입니다.", hint: "방금 조작한 화면을 떠올려 보세요." },
        { t: "페루 앞바다의 용승이 약해져 멸치가 잡히지 않는다", a: "e", why: "엘니뇨의 영향입니다." },
        { t: "인도네시아와 호주에 큰 가뭄과 산불이 난다", a: "e", why: "비구름이 동쪽으로 옮겨 가기 때문입니다.", hint: "비구름이 어디로 갔나요?" },
        { t: "가축을 너무 많이 풀어 초원의 풀이 사라졌다", a: "d", why: "과도한 방목은 사막화의 원인입니다." },
        { t: "맨땅이 드러나 모래 먼지(황사)가 자주 일어난다", a: "d", why: "사막화의 영향입니다." },
        { t: "호수와 우물이 말라 주민들이 고향을 떠난다", a: "d", why: "사막화가 인간 생활에 미치는 영향입니다." }
      ],
      onDone: function () { sorted = true; window.sthState("ensoSorted", 1); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 감축 경로 (누적 배출량 ∝ 기온 상승) */
  var lastT = null;
  (function () {
    var canvas = $("c-path"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ys = 2050, rate = 1;
    function run() {
      var E = 40, cum = 0, em = [], tp = [];
      for (var y = 2024; y <= 2100; y++) {
        em.push(E); tp.push(1.3 + 0.45 * cum / 1000);
        cum += E;
        E = y < ys ? E * 1.005 : E * (1 - rate / 100);
      }
      return { em: em, tp: tp, cum: cum };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = run(), n = r.em.length - 1, T = r.tp[n], LW = 560, RX = LW + 12;
      lastT = T;
      /* 2100년의 마을 블록: 뒤 왼쪽 숲, 공장 굴뚝, 도로의 차, 해안 마을, 오른쪽 바다(해수면 상승) + 탄소 예산 유리 원통 */
      var e2100 = r.em[n], eF = clamp(e2100 / 45, 0, 1.3), green = clamp(1 - e2100 / 40, 0, 1);
      var PI = K.iso({ ox: 206, oy: 140, s: 0.8, L: 320, D: 220 }), SEA0 = 30, rise = Math.max(0, (T - 1.3) * 3.6), WLv = SEA0 + rise;
      function tz(x) { return x < 160 ? 40 : (x < 240 ? 40 - (x - 160) / 80 * 10 : (x < 266 ? 30 - (x - 240) / 26 * 20 : 10)); }
      function shoreX(lv) { for (var sx = 0; sx <= 320; sx += 1) if (tz(sx) <= lv) return sx; return 320; }
      var g0 = PI.P(160, 110, 0);
      K.studio(ctx, 0, 0, LW, H, { x: g0.x + 40, y: PI.P(320, 220, 0).y - 40, rx: 300, ry: 40 });
      /* 앞면 흙·암석 단면, 오른쪽 면 바다 밑 */
      PI.face(ctx, "front", function (Lw) {
        ctx.save(); PI.profile(ctx, "front", tz, 0); ctx.clip();
        var sg = ctx.createLinearGradient(0, 0, 0, 44); sg.addColorStop(0, "#6d523a"); sg.addColorStop(.7, "#8a6a48"); sg.addColorStop(1, "#4f9a3f");
        ctx.fillStyle = sg; ctx.fillRect(0, 0, Lw, 60);
        ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 1; for (var z = 6; z < 40; z += 7) { ctx.beginPath(); ctx.moveTo(0, z); ctx.lineTo(Lw, z); ctx.stroke(); }
        ctx.restore();
      });
      PI.face(ctx, "right", function (Lw) { ctx.fillStyle = "#7a6248"; ctx.fillRect(0, 0, Lw, 10); });
      PI.shade(ctx, "front", tz); PI.shade(ctx, "right", function () { return 10; });
      PI.top(ctx, tz, function (i, u) { var z = tz(u); return z >= 39.9 ? "#8cc46a" : (z > 31 ? "#a9cf7c" : (z > 24 ? "#e3d3a1" : "#c7b48a")); }, 64);
      /* 도로 */
      PI.plane(ctx, 40.1, "#7c818b", null, 0, 138, 186, 204);
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.setLineDash([6, 6]); ctx.lineWidth = 1.2; var r1 = PI.P(0, 195, 40.2), r2 = PI.P(138, 195, 40.2); ctx.beginPath(); ctx.moveTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.stroke(); ctx.setLineDash([]);
      /* 바다(해수면 상승): 해안선 바깥만 물 */
      var sx0 = shoreX(WLv);
      PI.water(ctx, WLv, function (u, side) { return side === "front" ? tz(u) : 10; }, {
        clipSurface: function (c) { var a = PI.P(sx0, 0, WLv), b = PI.P(320, 0, WLv), cc = PI.P(320, 220, WLv), d = PI.P(sx0, 220, WLv); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.lineTo(cc.x, cc.y); c.lineTo(d.x, d.y); c.closePath(); c.clip(); }
      });
      /* 2024년 해수면 표시(오른쪽 면) */
      var m1 = PI.P(320, 0, SEA0), m2 = PI.P(320, 220, SEA0);
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(m1.x, m1.y); ctx.lineTo(m2.x, m2.y); ctx.stroke(); ctx.setLineDash([]);
      PI.edges(ctx, tz(320), 10);
      /* 물체들: 먼 것(x + y 작은 것)부터 */
      var objs = [], R = K.rng(4), i;
      var nTree = Math.round(5 + 13 * green);
      for (i = 0; i < 18; i++) { var tx = 8 + R() * 92, ty = 8 + R() * 92; if (i < nTree) objs.push({ k: "tree", x: tx, y: ty }); else objs.push({ k: "stump", x: tx, y: ty }); }
      objs.push({ k: "factory", x: 26, y: 116 });
      [[184, 26], [206, 58], [226, 92], [196, 126], [218, 160], [128, 40], [140, 84], [118, 128], [170, 190]].forEach(function (h, k) { objs.push({ k: "house", x: h[0], y: h[1], c: ["#c0553f", "#3b6fc4", "#e8890c"][k % 3] }); });
      var nCar = 7, nGas = Math.round(clamp(e2100 / 45, 0, 1) * nCar);
      for (i = 0; i < nCar; i++) objs.push({ k: "car", x: 10 + i * 18, y: i % 2 ? 199 : 189, gas: i < nGas });
      objs.sort(function (p, q) { return (p.x + p.y) - (q.x + q.y); });
      objs.forEach(function (o) {
        var z = tz(o.x), wet = WLv > z + 0.5;
        if (o.k === "tree") PI.tree(ctx, o.x, o.y, z, 1.1);
        else if (o.k === "stump") { var sp = PI.P(o.x, o.y, z); ctx.fillStyle = "#8a6a48"; ell(ctx, sp.x, sp.y - 1, 3, 1.5); ctx.fill(); }
        else if (o.k === "house") {
          PI.house(ctx, o.x, o.y, z, 14, 12, 10, o.c);
          if (wet) { PI.box(ctx, o.x - 2, o.y - 2, z, o.x + 16, o.y + 14, WLv, "rgba(90,170,235,.55)", "rgba(40,120,200,.5)", "rgba(30,100,180,.5)"); }
        } else if (o.k === "factory") {
          PI.box(ctx, o.x, o.y, z, o.x + 56, o.y + 40, z + 20, "#d5dbe3", "#aeb7c3", "#8d97a6");
          /* 지붕 태양광(감축할수록 많이) */
          var np = Math.round(green * 6);
          for (var pp = 0; pp < np; pp++) { var px0 = o.x + 4 + (pp % 3) * 17, py0 = o.y + 6 + Math.floor(pp / 3) * 16; PI.quad(ctx, PI.P(px0, py0, z + 21), PI.P(px0 + 14, py0, z + 21), PI.P(px0 + 14, py0 + 12, z + 21), PI.P(px0, py0 + 12, z + 21), "#2f5fa8", "rgba(255,255,255,.6)"); }
          for (var st = 0; st < 3; st++) {
            var cx = o.x + 46, cy = o.y + 6 + st * 13;
            PI.box(ctx, cx, cy, z + 20, cx + 6, cy + 6, z + 52, "#e9ecef", "#c92a2a", "#a51d1d");
            var top = PI.P(cx + 3, cy + 3, z + 52);
            for (var pf = 0; pf < 4 && eF > 0.03; pf++) {
              var rr = (5 + pf * 4) * (0.4 + eF * .8);
              ctx.fillStyle = "rgba(95,95,105," + (0.55 * eF * (1 - pf * .2)).toFixed(2) + ")"; ctx.beginPath(); ctx.arc(top.x + 6 + pf * 9, top.y - 8 - pf * 11, rr, 0, 6.2832); ctx.fill();
            }
          }
        } else if (o.k === "car") {
          PI.box(ctx, o.x, o.y - 3, z, o.x + 11, o.y + 3, z + 5, o.gas ? "#adb5bd" : "#8ce99a", o.gas ? "#868e96" : "#40c057", o.gas ? "#5c636a" : "#2b8a3e");
          if (o.gas) { var ep = PI.P(o.x, o.y, z + 2); ctx.fillStyle = "rgba(90,90,100,.45)"; ctx.beginPath(); ctx.arc(ep.x - 6, ep.y - 2, 3.5, 0, 6.2832); ctx.arc(ep.x - 11, ep.y - 5, 4.5, 0, 6.2832); ctx.fill(); }
        }
      });
      /* 이름표 */
      PI.label(ctx, 60, 40, 60, "숲 " + nTree + "그루", 70, -22, "#d3f9d8", [0, LW]);
      PI.label(ctx, 72, 125, 92, "굴뚝 · 해마다 " + e2100.toFixed(0) + " Gt", -50, 40, "#ffc9c9", [0, LW]);
      PI.label(ctx, 60, 204, 44, "휘발유 차 " + nGas + " · 전기차 " + (nCar - nGas), -10, 40, "#e8ecff", [0, LW]);
      PI.label(ctx, 300, 220, WLv, rise > 0.5 ? "해수면 상승 (점선 = 2024년)" : "해수면 거의 그대로", -10, 46, "#a5d8ff", [0, LW]);
      /* 탄소 예산 유리 원통 */
      var cx2 = 494, yT = 150, yB = 372, crx = 32, cry = 10, CAP = 4000, f = clamp(r.cum / CAP, 0, 1), yL = yB - f * (yB - yT);
      floorShadow(ctx, cx2 + 6, yB + 6, 52, 12, .3);
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.beginPath(); ctx.ellipse(cx2, yT, crx, cry, 0, Math.PI, 0); ctx.fill();
      var lc = T < 1.5 ? ["#20c997", "#0ca678"] : (T < 2 ? ["#94d82d", "#66a80f"] : ["#ff8787", "#e03131"]);
      var lg = ctx.createLinearGradient(cx2 - crx, 0, cx2 + crx, 0); lg.addColorStop(0, lc[1]); lg.addColorStop(.4, lc[0]); lg.addColorStop(1, lc[1]);
      ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(cx2 - crx, yL); ctx.lineTo(cx2 - crx, yB); ctx.ellipse(cx2, yB, crx, cry, 0, Math.PI, 0, true); ctx.lineTo(cx2 + crx, yL); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lc[0]; ctx.beginPath(); ctx.ellipse(cx2, yL, crx, cry, 0, 0, 6.2832); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 1; ctx.stroke();
      var gl = ctx.createLinearGradient(cx2 - crx, 0, cx2 + crx, 0); gl.addColorStop(0, "rgba(255,255,255,.55)"); gl.addColorStop(.25, "rgba(255,255,255,.08)"); gl.addColorStop(.8, "rgba(255,255,255,.04)"); gl.addColorStop(1, "rgba(255,255,255,.4)");
      ctx.fillStyle = gl; ctx.fillRect(cx2 - crx, yT, crx * 2, yB - yT);
      ctx.strokeStyle = "rgba(110,130,160,.75)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(cx2 - crx, yT); ctx.lineTo(cx2 - crx, yB); ctx.ellipse(cx2, yB, crx, cry, 0, Math.PI, 0, true); ctx.lineTo(cx2 + crx, yT); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(cx2, yT, crx, cry, 0, 0, 6.2832); ctx.stroke();
      [[(1.5 - 1.3) / 0.45 * 1000, "1.5℃"], [(2 - 1.3) / 0.45 * 1000, "2℃"]].forEach(function (q) {
        var yy = yB - q[0] / CAP * (yB - yT);
        ctx.strokeStyle = "#b7791f"; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.ellipse(cx2, yy, crx, cry, 0, 0, Math.PI); ctx.stroke(); ctx.setLineDash([]);
        K.t(ctx, q[1], cx2 + crx + 4, yy + 4, { s: 12, w: "900", c: "#b7791f" });
      });
      K.pill(ctx, "누적 " + Math.round(r.cum).toLocaleString() + " Gt", cx2, yT - 24, { s: 12.5, a: "center", c: T < 2 ? "#b2f2bb" : "#ffc9c9", box: [380, LW - 2] });
      K.t(ctx, "탄소 예산 원통", cx2, yB + 30, { s: 12, w: "800", a: "center", c: LT.ink });
      K.bigText(ctx, "2100년 +" + T.toFixed(2) + " ℃", 18, 42, 28, T < 1.5 ? "#7ee0a0" : (T < 2 ? "#b8f0c8" : "#ffb0a0"));
      K.bigText(ctx, T < 1.5 ? "1.5 ℃ 목표까지 달성" : (T < 2 ? "2 ℃ 아래로 묶었다" : "아직 2 ℃를 넘는다"), 18, 70, 16, "#ffd35a");
      K.warn(ctx, 14, H - 12, "⚠ 해수면·건물 크기는 보기 쉽게 과장", "left");
      /* 오른쪽 흰 카드: 작은 그래프 두 개 */
      K.card(ctx, RX, 0, W - RX, H, ys + "년부터 해마다 " + rate.toFixed(1) + "% 감축");
      function mini(y0, h, title, arr, max, yt, c, fill) {
        K.t(ctx, title, RX + 18, y0 + 4, { s: 12, w: "800", c: LT.ink });
        var g = K.chart(ctx, { x: RX + 4, y: y0 + 10, w: W - RX - 10, h: h, pl: 38, pb: 24, pt: 6, pr: 30, x0: 2024, x1: 2100, y0: 0, y1: max, xt: 1, yt: yt, light: true, xf: function () { return ""; } });
        [2030, 2060, 2090].forEach(function (yy) { K.t(ctx, String(yy), g.X(yy), g.B + 15, { s: 10.5, c: LT.mute, a: "center", w: "600" }); });
        var pts = arr.map(function (val, k) { return [2024 + k, clamp(val, 0, max)]; });
        if (fill) {
          var ag = ctx.createLinearGradient(0, g.T, 0, g.B); ag.addColorStop(0, rgba(c, .4)); ag.addColorStop(1, rgba(c, .06));
          ctx.beginPath(); pts.forEach(function (p, k) { if (k) ctx.lineTo(g.X(p[0]), g.Y(p[1])); else ctx.moveTo(g.X(p[0]), g.Y(p[1])); });
          ctx.lineTo(g.R, g.B); ctx.lineTo(g.L, g.B); ctx.closePath(); ctx.fillStyle = ag; ctx.fill();
        }
        K.plot(ctx, g, pts, c, { w: 2.6, light: true });
        return g;
      }
      var a = mini(46, 140, "해마다 내보내는 CO₂ (Gt/년) · 넓이 = 누적", r.em, 60, 3, LT.orange, true);
      var sx = a.X(ys);
      K.line(ctx, { x: sx, y: a.T }, { x: sx, y: a.B }, LT.teal, 1.6, [5, 5]);
      K.t(ctx, "감축 시작", clamp(sx + 5, a.L + 4, a.R - 56), a.T + 14, { s: 12, w: "900", c: LT.teal });
      var tc = T < 2 ? LT.green : LT.red;
      var b = mini(214, 150, "기온 상승 (℃, 산업화 이전 대비)", r.tp, 3.5, 7, tc, false);
      [[1.5, "1.5"], [2.0, "2.0"]].forEach(function (q) {
        K.line(ctx, { x: b.L, y: b.Y(q[0]) }, { x: b.R, y: b.Y(q[0]) }, LT.yellow, 1.4, [6, 5]);
        K.t(ctx, q[1], b.R + 4, b.Y(q[0]) + 4, { s: 10.5, w: "800", c: "#b7791f" });
      });
      K.planet(ctx, b.R, b.Y(clamp(T, 0, 3.5)), 5.5, T < 2 ? "#3fd3a3" : "#ff6b6b", T < 2 ? "#0b6b4f" : "#7a1f1f");
      K.tip(ctx, (T < 2 ? "✅ " : "") + "누적 " + Math.round(r.cum).toLocaleString() + " Gt → +" + T.toFixed(2) + " ℃", RX + 14, H - 46, W - RX - 28, T < 2);
      $("path-read").innerHTML = "<span class='k'>누적 배출량</span><span class='v y'>" + Math.round(r.cum).toLocaleString() + " Gt</span><span class='sub'>2024~2100년 · " + ys + "년부터 해마다 " + rate.toFixed(1) + "% 감축</span>" +
        "<span class='k'>2100년 기온 상승</span><span class='v " + (T < 2 ? "g" : "r") + "'>+" + T.toFixed(2) + "℃</span><span class='sub'>기온 상승 ≈ 1.3℃ + 0.45℃ × (누적 배출량 ÷ 1,000 Gt)</span>" +
        "<span class='ok " + (T < 2 ? "g" : "r") + "'>" + (T < 1.5 ? "1.5℃ 목표까지 달성" : (T < 2 ? "2℃ 아래로 묶었습니다" : "아직 2℃를 넘습니다")) + "</span>";

      $("path-info").innerHTML = "2024~2100년 누적 배출량 <b>" + Math.round(r.cum).toLocaleString() + " Gt</b> → 2100년 기온 상승 <b>+" + T.toFixed(2) + "℃</b>. " +
        (T < 1.5 ? "🏆 1.5℃ 목표까지 달성했습니다!" : (T < 2 ? "✅ 2℃ 아래로 묶었습니다. 시작 연도를 10년 늦추면 같은 결과를 내는 데 감축률이 얼마나 더 필요한지 확인해 보세요." :
          "아직 2℃를 넘습니다. 시작을 앞당기거나 감축률을 높여 보세요."));
      if (T < 2) {
        window.sthState("pathBest", ys + "년부터 해마다 " + rate + "%씩 감축 → +" + T.toFixed(2) + "℃");
        window.sthMission("m3-4", true, "<span class='m-tag'>미션 완료</span>" + ys + "년부터 해마다 " + rate + "%씩 줄이면 2100년 +" + T.toFixed(2) + "℃. 기온은 <b>누적 배출량</b>이 정하므로, 늦게 시작할수록 훨씬 가파르게 줄여야 합니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("path-y").addEventListener("input", function (e) { ys = +e.target.value; $("path-y-val").textContent = ys + "년"; draw(); });
    $("path-r").addEventListener("input", function (e) { rate = +e.target.value; $("path-r-val").textContent = rate.toFixed(1) + "%"; draw(); });
    draw();
    if (ep.cleared(3)) window.sthMission("m3-4", true);
  })();

  /* 장면 5 — 결말 */
  function reveal() {
    $("e3-wrap").hidden = false;
    var p = window.sthState("p3") || "";
    $("e3-vs").innerHTML = "<b>나의 첫 답변</b> " + (p || "기록 없음") + (p.indexOf("㉢") === 0 ? " — 정확했습니다." : " — 온실 상자 실험으로 확인했듯, 온실 효과가 없으면 지구는 −18℃입니다.") +
      "<br><b>내가 제출한 경로</b> " + (window.sthState("pathBest") || "-");
  }
  function finish() { window.sthState("r3", "해결 · " + (window.sthState("pathBest") || "-")); }
  window.sthSort({
    mount: "s3-act",
    buckets: [{ id: "m", label: "완화", sub: "온실 기체를 줄이거나 흡수한다" }, { id: "a", label: "적응", sub: "이미 닥친 변화에 대비한다" }],
    items: [
      { t: "태양광·풍력 발전 비중을 늘린다", a: "m", why: "배출 자체를 줄이는 완화입니다." },
      { t: "에너지 효율이 높은 제품을 쓰고 대중교통을 탄다", a: "m", why: "에너지 사용을 줄이는 완화입니다." },
      { t: "숲을 가꾸어 이산화 탄소 흡수원을 넓힌다", a: "m", why: "온실 기체를 흡수하는 것도 완화입니다.", hint: "이 대책은 대기 중 CO₂를 어떻게 하나요?" },
      { t: "해수면 상승에 대비해 해안 방조제를 높인다", a: "a", why: "피해를 줄이는 적응입니다." },
      { t: "가뭄과 더위에 강한 작물 품종을 개발한다", a: "a", why: "변한 기후에 맞추는 적응입니다." },
      { t: "폭염 경보 체계와 무더위 쉼터를 운영한다", a: "a", why: "적응 대책입니다." }
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "wk3", unitLabel: "[통합과학2 Ⅱ-1] 이야기 ③ 2℃의 문턱",
    items: [
      { id: "e3a", label: "회의장 발언: ‘온실 효과를 없애자’는 주장에 답하기", hint: "온실 효과와 ‘온실 효과의 강화’를 구분해 두세 문장으로 쓰세요. 온실 상자의 숫자를 근거로 드세요." },
      { id: "e3b", label: "내가 찾은 감축 경로", hint: "시작 연도와 감축률을 적고, 시작이 늦어질수록 어려워지는 까닭을 ‘누적 배출량’이라는 말을 넣어 설명하세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학2 Ⅱ-1] 생태계와 환경 변화 — 정리",
  recap: [
    { key: "r1", label: "① 한 나무, 두 가지 잎" },
    { key: "r2", label: "② 늑대가 돌아왔다" },
    { key: "r3", label: "③ 2℃의 문턱" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "잎과 빛, 늑대와 숲, 온실 기체와 기온. 세 이야기에 공통으로 들어 있는 생각을 ‘생물’과 ‘환경’이라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is2-2-1", unitLabel: "[통합과학2 Ⅱ-1] 생태계와 환경 변화",
  rows: [
    { key: "r1", label: "① 한 나무, 두 가지 잎" },
    { key: "r2", label: "② 늑대가 돌아왔다" },
    { key: "r3", label: "③ 2℃의 문턱" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
