/* 통합과학2 Ⅲ-1 과학 기술의 활용 — 이야기 두 편
   01 펌프의 손잡이를 떼어라(감염병의 진단·추적) / 02 240만 장의 엽서(기술 발전과 빅데이터)
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

/* =========================================================================
   계산 모형 (화면과 분리 — node로 따로 돌려 미션 판정을 검증할 수 있다)
   ========================================================================= */
function rng(seed) {                                   // mulberry32
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

var M = {};

/* ① 지도 — 펌프 다섯 개와 집·사망자 (실제 지도의 경향을 본뜬 가상 분포) */
M.PUMPS = [
  { n: "브로드가", x: 450, y: 215 }, { n: "말버러가", x: 290, y: 70 }, { n: "워릭가", x: 200, y: 330 },
  { n: "루퍼트가", x: 650, y: 365 }, { n: "딘가", x: 740, y: 140 }
];
M.BLD = [
  { n: "🍺 양조장", x: 492, y: 168, w: 96, h: 36 },
  { n: "🏚 구빈원", x: 340, y: 112, w: 104, h: 42 }
];
M.map = function () {
  var r = rng(1854), houses = [], guard = 0;
  while (houses.length < 300 && guard++ < 20000) {
    var x = 40 + r() * 820, y = 44 + r() * 346, ok = true, i;
    for (i = 0; i < M.BLD.length; i++) { var b = M.BLD[i]; if (x > b.x - 8 && x < b.x + b.w + 8 && y > b.y - 12 && y < b.y + b.h + 8) ok = false; }
    for (i = 0; i < M.PUMPS.length; i++) { if (Math.abs(x - M.PUMPS[i].x) < 50 && y > M.PUMPS[i].y - 16 && y < M.PUMPS[i].y + 34) ok = false; }
    for (i = 0; i < houses.length; i++) { if (Math.abs(x - houses[i].x) < 13 && Math.abs(y - houses[i].y) < 15) { ok = false; break; } }
    if (!ok) continue;
    var near = 0, best = 1e9;
    for (i = 0; i < M.PUMPS.length; i++) { var d = Math.sqrt(Math.pow(x - M.PUMPS[i].x, 2) + Math.pow(y - M.PUMPS[i].y, 2)); if (d < best) { best = d; near = i; } }
    var dB = Math.sqrt(Math.pow(x - 450, 2) + Math.pow(y - 215, 2)), dead = 0;
    if (r() < Math.exp(-Math.pow(dB / 150, 2))) dead = 1 + Math.floor(r() * r() * 4);
    else if (r() < 0.04) dead = 1;
    houses.push({ x: x, y: y, p: near, d: dead });
  }
  var stats = M.PUMPS.map(function () { return { h: 0, d: 0 }; });
  houses.forEach(function (h) { stats[h.p].h++; stats[h.p].d += h.d; });
  stats.forEach(function (s) { s.rate = s.h ? s.d / s.h * 100 : 0; });
  return { houses: houses, stats: stats };
};

/* ② PCR — 주기마다 2배, 시약이 바닥나면 고원(P). 신호가 기준선(P의 10%)을 처음 넘는 주기가 Ct */
M.P = 1e12;
M.pcrN = function (x, c) { var n0 = Math.pow(10, x); return M.P / (1 + (M.P / n0 - 1) * Math.pow(2, -c)); };
M.pcrCt = function (x) { for (var c = 0; c <= 45; c++) if (M.pcrN(x, c) >= 0.1 * M.P) return c; return null; };

/* ③ 신속항원검사 — 1만 명 2×2 표 */
M.rt = function (prev, se, sp) {
  var inf = 10000 * prev / 100, non = 10000 - inf;
  var tp = inf * se / 100, fn = inf - tp, tn = non * sp / 100, fp = non - tn;
  return { tp: tp, fn: fn, fp: fp, tn: tn, ppv: (tp + fp) > 0 ? tp / (tp + fp) * 100 : 0, npv: (tn + fn) > 0 ? tn / (tn + fn) * 100 : 0 };
};

/* ④ 전파 모형(SIR) — 인구 10만, R0 = 3, 감염 기간 7일, 접종자는 면역 */
M.sir = function (cut, vac) {
  var N = 100000, R0 = 3, g = 1 / 7, b = R0 * g * (1 - cut / 100), dt = 0.25;
  var S = N * (1 - vac / 100) - 10, I = 10, cum = 10, peak = 10, peakDay = 0, arr = [];
  for (var k = 0; k <= 1500 * 4; k++) {
    if (k % 4 === 0) arr.push(I);
    var ni = b * S * I / N * dt, nr = g * I * dt;
    if (ni > S) ni = S;
    S -= ni; I += ni - nr; cum += ni;
    if (I > peak) { peak = I; peakDay = k * dt; }
  }
  return { I: arr, peak: peak, peakDay: peakDay, total: cum, reff: R0 * (1 - cut / 100) * (1 - vac / 100) };
};

/* ⑤ 기술 확산(로지스틱) */
M.TECH = [{ n: "스마트폰", k: 0.35 }, { n: "전기", k: 0.15 }, { n: "인터넷", k: 0.25 }];
M.adopt = function (t, k) { return 100 / (1 + Math.exp(-k * (t - 15))); };
M.first90 = function (k) { for (var t = 0; t <= 40; t++) if (M.adopt(t, k) >= 90) return t; return null; };

/* ⑥ 여론 조사 — 보유층 35%(지지 40%), 비보유층 65%(지지 72%) → 참값 60.8% */
M.NS = [100, 300, 1000, 3000, 10000, 50000, 300000, 2400000];
M.TRUE = 0.35 * 40 + 0.65 * 72;
M.poll = function (n, share) {
  var e = share / 100 * 40 + (1 - share / 100) * 72, p = e / 100;
  return { exp: e, bias: e - M.TRUE, moe: 1.96 * Math.sqrt(p * (1 - p) / n) * 100 };
};

/* ⑦ 익명 데이터 — 가상 주민 2,000명, 공개 항목 조합별로 '같은 값을 가진 사람 수' */
M.people = (function () {
  var r = rng(87), a = [];
  for (var i = 0; i < 2000; i++) a.push({ dong: Math.floor(r() * 40), yr: 1960 + Math.floor(r() * 30), doy: Math.floor(r() * 365), sex: Math.floor(r() * 2) });
  return a;
})();
M.priv = function (loc, bir, sex) {
  var cnt = {}, keys = M.people.map(function (p) {
    var k = (loc === 2 ? "d" + p.dong : (loc === 1 ? "g" + Math.floor(p.dong / 8) : "")) + "|" +
            (bir === 2 ? p.yr + "-" + p.doy : (bir === 1 ? p.yr : "")) + "|" + (sex ? p.sex : "");
    cnt[k] = (cnt[k] || 0) + 1; return k;
  });
  var sizes = keys.map(function (k) { return cnt[k]; }), u = 0, s = 0;
  sizes.forEach(function (z) { if (z === 1) u++; if (z < 5) s++; });
  return { sizes: sizes, uniq: u / 20, small: s / 20, util: loc + bir + sex };
};

if (typeof window === "undefined") { module.exports = M; return; }

/* ========================================================================= 화면 */
window.sthUnit("is2-3-1");

var OPEN_ALL = /[?&]open=1/.test(location.search);
var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function put(id, html) { var e = $(id); if (e) e.innerHTML = html; }
function fmt(n) { return Math.round(n).toLocaleString(); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
function big(n) {                                       // 큰 수를 만·억·조로
  if (n < 1e4) return fmt(n) + "개";
  if (n < 1e8) return "약 " + (n / 1e4 >= 100 ? fmt(n / 1e4) : (n / 1e4).toFixed(1)) + "만 개";
  if (n < 1e12) return "약 " + (n / 1e8 >= 100 ? fmt(n / 1e8) : (n / 1e8).toFixed(1)) + "억 개";
  return "약 " + (n / 1e12).toFixed(2) + "조 개";
}
function segOn(box, btn) { Array.prototype.forEach.call(box.querySelectorAll("button"), function (b) { b.classList.toggle("on", b === btn); }); }

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;
function track(ctx, x, y, w, h, r) { ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 6 : r); ctx.fill(); }
function gbar(ctx, x, y, w, h, c0, c1, r, blur) {          // 빛나는 그라데이션 막대
  if (!(w > 0.5)) return;
  var rr = Math.min(r == null ? 6 : r, w / 2, h / 2), g = ctx.createLinearGradient(x, y, x + w, y); g.addColorStop(0, c0); g.addColorStop(1, c1 || c0);
  ctx.save(); ctx.shadowColor = c1 || c0; ctx.shadowBlur = blur == null ? 10 : blur; ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.fill(); ctx.restore();
  var s = ctx.createLinearGradient(0, y, 0, y + h); s.addColorStop(0, "rgba(255,255,255,.26)"); s.addColorStop(.5, "rgba(255,255,255,0)");
  ctx.fillStyle = s; ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.fill();
}
function metal(ctx, x, y, w, h, c0, c1, r, vert) {        // 금속 재질
  var g = vert ? ctx.createLinearGradient(x, y, x + w, y) : ctx.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, c1); g.addColorStop(.35, c0); g.addColorStop(.6, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 4 : r); ctx.fill();
}
function hline(ctx, x0, x1, y, col, dash, w) {             // 빛나는 가로 점선
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.strokeStyle = col; ctx.lineWidth = w || 1.8; ctx.setLineDash(dash || [6, 5]);
  ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.restore();
}
function vline(ctx, x, y0, y1, col, dash, w) {
  ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 6; ctx.strokeStyle = col; ctx.lineWidth = w || 1.8; ctx.setLineDash(dash || [4, 4]);
  ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); ctx.restore();
}
/* ---- 밝은 스튜디오 말투 도구 (블록 모형·입체 미니어처 장면, kit.js 머리말 K.iso·K.LT·K.card 참고) ---- */
var LT = K.LT;
function lt(ctx, s, x, y, o) { o = o || {}; if (!o.c) o.c = LT.ink; K.t(ctx, s, x, y, o); }
function ltrack(ctx, x, y, w, h, r) { ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(x, y, w, h, r == null ? 6 : r); ctx.fill(); }
function lbar(ctx, x, y, w, h, c0, c1, r) {
  if (!(w > 0.5)) return;
  var rr = Math.min(r == null ? 6 : r, w / 2, h / 2), g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c1 || c0); g.addColorStop(1, c0);
  ctx.save(); ctx.shadowColor = "rgba(20,30,60,.22)"; ctx.shadowBlur = 4; ctx.shadowOffsetY = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.fill(); ctx.restore();
  var s = ctx.createLinearGradient(0, y, 0, y + h); s.addColorStop(0, "rgba(255,255,255,.42)"); s.addColorStop(.5, "rgba(255,255,255,0)");
  ctx.fillStyle = s; ctx.beginPath(); ctx.roundRect(x, y, w, h, rr); ctx.fill();
}
function ldash(ctx, x0, y0, x1, y1, col, w, dash) { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w || 1.6; ctx.setLineDash(dash || [6, 5]); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.restore(); }
function floorShadow(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 1, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 6.2832); ctx.fill(); ctx.restore();
}
function lead(ctx, px, py, qx, qy, s, col, box) {
  ctx.strokeStyle = "rgba(20,25,40,.75)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
  ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 6.283); ctx.fill();
  return K.pill(ctx, s, qx + (qx < px ? -4 : 4), qy + 4, { s: 12, a: qx < px ? "right" : "left", c: col || "#e8ecff", box: box });
}
function onPlane(ctx, I, y, fn) {
  var o = I.P(0, y, 0), ex = I.P(1, y, 0), ez = I.P(0, y, 1);
  ctx.save(); ctx.transform(ex.x - o.x, ex.y - o.y, ez.x - o.x, ez.y - o.y, o.x, o.y); fn(); ctx.restore();
}

/* =========================================================================
   이야기 ① 펌프의 손잡이를 떼어라
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  /* 장면 1 — 첫 추리 */
  window.sthGate({
    gate: "g1", key: "p1", title: "조수의 첫 추리",
    question: "브로드가의 콜레라는 무엇을 타고 퍼졌을까요?",
    options: ["㉠ 썩은 것에서 나는 나쁜 공기(악취)", "㉡ 오염된 마실 물", "㉢ 환자와 몸이 닿는 접촉"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 스노의 지도 */
  (function () {
    var canvas = $("a-map"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var data = M.map(), sel = null;
    var seen = window.sthState("mapSeen") || {}, hit = !!window.sthState("mapHit"), quiz = !!window.sthState("mapQuiz");

    /* ── 블록 모형: 소호 한 구역을 땅째 잘라 낸 디오라마 (지도 좌표 mx, my → 월드 x = mx − 20, y = my − 30) ── */
    var DH = 488, G = 60;                                   /* 모형 칸 높이, 땅 두께(그림 단위) */
    var I = K.iso({ ox: 330, oy: 106, s: 0.6, L: 860, D: 380 });
    var L = I.L, D = I.D;
    function wx(mx) { return mx - 20; }
    function wy(my) { return my - 30; }
    function PP(mx, my, z) { return I.P(wx(mx), wy(my), G + (z || 0)); }
    var ROADS = [[40, 215, 860, 215], [450, 40, 450, 395], [120, 60, 800, 120], [100, 340, 820, 300], [230, 40, 180, 395], [700, 40, 660, 395]];
    var ph = 0, playing = !REDUCE, pumpScr = [];
    var objs = [];                                          /* 먼 것부터 그리도록 (x + y) 순서 */
    data.houses.forEach(function (h, i) { objs.push({ k: "h", i: i, o: wx(h.x) + wy(h.y) }); });
    M.BLD.forEach(function (b, i) { objs.push({ k: "b", i: i, o: wx(b.x + b.w / 2) + wy(b.y + b.h / 2) }); });
    M.PUMPS.forEach(function (p, i) { objs.push({ k: "p", i: i, o: wx(p.x) + wy(p.y) }); });
    objs.sort(function (a, b) { return a.o - b.o; });
    var leakSeed = K.rng(40);
    var PEB = []; for (var q = 0; q < 46; q++) PEB.push([leakSeed(), leakSeed(), 1 + leakSeed() * 2.2]);

    function strata(side) {
      I.face(ctx, side, function (Lw) {
        var g1 = ctx.createLinearGradient(0, 0, 0, 22); g1.addColorStop(0, "#6f6c66"); g1.addColorStop(1, "#8e8a80");
        ctx.fillStyle = g1; ctx.fillRect(0, 0, Lw, 22);                                   /* 자갈층 */
        ctx.fillStyle = "rgba(70,140,215,.42)"; ctx.fillRect(0, 0, Lw, 17);               /* 지하수 */
        var R = K.rng(side === "front" ? 7 : 9);
        for (var i = 0; i < Lw / 5; i++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.28)" : "rgba(30,25,20,.35)"; ctx.beginPath(); ctx.arc(R() * Lw, 2 + R() * 18, 1 + R() * 1.6, 0, 6.2832); ctx.fill(); }
        var g2 = ctx.createLinearGradient(0, 22, 0, 48); g2.addColorStop(0, "#b99a68"); g2.addColorStop(1, "#cdb283");
        ctx.fillStyle = g2; ctx.fillRect(0, 22, Lw, 26);                                  /* 점토·모래 */
        ctx.fillStyle = "#5a4433"; ctx.fillRect(0, 48, Lw, 12);                           /* 흙·포장 */
        ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.moveTo(0, 17); ctx.lineTo(Lw, 17); ctx.stroke(); ctx.setLineDash([]);
      });
      I.shade(ctx, side, function () { return G; });
    }

    function house(h, mine) {
      var cx = wx(h.x), cy = wy(h.y);
      if (mine) I.box(ctx, cx - 4, cy - 4, G, cx + 4, cy + 4, G + 8, "#3d8fd0", "#cfe9ff", "#8fbfe6");
      else I.box(ctx, cx - 4, cy - 4, G, cx + 4, cy + 4, G + 8, "#9b5b45", "#e6dccb", "#b9ad98");
      if (h.d) I.box(ctx, cx - 2.4, cy - 2.4, G + 8, cx + 2.4, cy + 2.4, G + 8 + h.d * 10, "#ffb3bf", "#ff4d6d", "#c42d4a");
    }
    function building(b) {
      I.box(ctx, wx(b.x), wy(b.y), G, wx(b.x + b.w), wy(b.y + b.h), G + 16, "#7b4a35", "#a55a3a", "#6f3622");
      /* 벽돌 줄눈 */
      var a = I.P(wx(b.x), wy(b.y + b.h), G), c = I.P(wx(b.x + b.w), wy(b.y + b.h), G);
      ctx.strokeStyle = "rgba(255,220,190,.22)"; ctx.lineWidth = .8;
      for (var z = 4; z < 16; z += 4) { ctx.beginPath(); ctx.moveTo(a.x, a.y - z * .6); ctx.lineTo(c.x, c.y - z * .6); ctx.stroke(); }
    }
    function pump(p, i) {
      var off = hit && i === 0, cx = wx(p.x), cy = wy(p.y);
      var c0 = off ? "#9aa0b0" : "#3fbfae", c1 = off ? "#5d6272" : "#1f7a70", c2 = off ? "#444958" : "#145a52";
      I.box(ctx, cx - 6, cy - 6, G, cx + 6, cy + 6, G + 3, "#8b8478", "#a39c90", "#706a60");     /* 돌 받침 */
      I.box(ctx, cx - 3, cy - 3, G + 3, cx + 3, cy + 3, G + 26, c0, c1, c2);                    /* 펌프 기둥 */
      I.box(ctx, cx - 4.5, cy - 4.5, G + 26, cx + 4.5, cy + 4.5, G + 30, c0, c1, c2);           /* 머리 */
      var s1 = I.P(cx - 3, cy + 1, G + 18), s2 = I.P(cx - 9, cy + 1, G + 16);                   /* 주둥이 */
      ctx.strokeStyle = c1; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.lineTo(s2.x, s2.y); ctx.stroke();
      if (!off) {
        var h1 = I.P(cx + 3, cy, G + 27), h2 = I.P(cx + 14, cy, G + 40);
        ctx.strokeStyle = "#2b3346"; ctx.lineWidth = 2.6; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(h1.x, h1.y); ctx.lineTo(h2.x, h2.y); ctx.stroke(); ctx.lineCap = "butt";
      }
    }
    function person(x0, y0, x1, y1, t, col) {
      I.person(ctx, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, G, col, .9);
    }

    function inset(idx, leak) {
      var cx = 792, cy = 172, r = 80, p = idx === null ? null : M.PUMPS[idx], a = idx === null ? null : pumpScr[idx], off = hit && idx === 0;
      if (a) {
        var ang = Math.atan2(a.y - 14 - cy, a.x - cx);
        ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = "rgba(20,30,60,.55)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(a.x, a.y - 14); ctx.lineTo(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r); ctx.stroke(); ctx.restore();
      }
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.clip();
      var gs = cy - 30, sk = ctx.createLinearGradient(0, cy - r, 0, gs); sk.addColorStop(0, "#dfe8f2"); sk.addColorStop(1, "#c9d6e4");
      ctx.fillStyle = sk; ctx.fillRect(cx - r, cy - r, 2 * r, gs - (cy - r));
      ctx.fillStyle = "#5a4433"; ctx.fillRect(cx - r, gs, 2 * r, 12);
      var cl = ctx.createLinearGradient(0, gs + 12, 0, cy + 20); cl.addColorStop(0, "#b99a68"); cl.addColorStop(1, "#cdb283");
      ctx.fillStyle = cl; ctx.fillRect(cx - r, gs + 12, 2 * r, cy + 20 - gs - 12);
      ctx.fillStyle = "#86837a"; ctx.fillRect(cx - r, cy + 20, 2 * r, r);
      ctx.fillStyle = "rgba(70,140,215,.45)"; ctx.fillRect(cx - r, cy + 30, 2 * r, r);
      PEB.forEach(function (e) { ctx.fillStyle = e[0] > .5 ? "rgba(255,255,255,.35)" : "rgba(30,25,20,.35)"; ctx.beginPath(); ctx.arc(cx - r + e[0] * 2 * r, cy + 22 + e[1] * 56, e[2], 0, 6.2832); ctx.fill(); });
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(cx - r, cy + 30); ctx.lineTo(cx + r, cy + 30); ctx.stroke(); ctx.setLineDash([]);
      /* 벽돌로 쌓은 우물 */
      ctx.fillStyle = "#8a4b32"; ctx.fillRect(cx - 14, gs, 6, cy + 52 - gs); ctx.fillRect(cx + 8, gs, 6, cy + 52 - gs);
      ctx.strokeStyle = "rgba(255,220,190,.35)"; ctx.lineWidth = .8;
      for (var by = gs + 5; by < cy + 52; by += 5) { ctx.beginPath(); ctx.moveTo(cx - 14, by); ctx.lineTo(cx - 8, by); ctx.moveTo(cx + 8, by); ctx.lineTo(cx + 14, by); ctx.stroke(); }
      ctx.fillStyle = "#2a2420"; ctx.fillRect(cx - 8, gs, 16, cy + 30 - gs);
      var wg = ctx.createLinearGradient(0, cy + 30, 0, cy + 52); wg.addColorStop(0, "#5aa8e6"); wg.addColorStop(1, "#1d4f8a");
      ctx.fillStyle = wg; ctx.fillRect(cx - 8, cy + 30, 16, 22);
      ctx.strokeStyle = "#9aa3b0"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(cx, gs - 6); ctx.lineTo(cx, cy + 46); ctx.stroke();
      /* 펌프 */
      metal(ctx, cx - 6, gs - 34, 12, 34, off ? "#9aa0b0" : "#3fbfae", off ? "#4a4f60" : "#145a52", 3, true);
      metal(ctx, cx - 9, gs - 38, 18, 6, off ? "#b0b5c3" : "#7fe6d9", off ? "#5a5f70" : "#2a7a70", 2);
      ctx.fillStyle = off ? "#6a6f80" : "#1f7a70"; ctx.fillRect(cx - 18, gs - 24, 12, 4);
      if (!off) { ctx.strokeStyle = "#2b3346"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx + 5, gs - 30); ctx.lineTo(cx + 22, gs - 46); ctx.stroke(); ctx.lineCap = "butt"; }
      /* 떠 올라가는 물 (움직임) */
      if (!off) {
        ctx.fillStyle = "rgba(127,211,255,.9)";
        for (var k = 0; k < 4; k++) { var t = (ph * .35 + k / 4) % 1; ctx.beginPath(); ctx.arc(cx, cy + 46 - t * (cy + 46 - gs + 4), 1.8, 0, 6.2832); ctx.fill(); }
      }
      if (leak) {                                           /* 바로 옆 정화조 */
        ctx.fillStyle = "#4b3a28"; ctx.fillRect(cx + 34, gs, 30, cy + 8 - gs);
        ctx.fillStyle = "#6b5236"; ctx.fillRect(cx + 37, gs + 10, 24, cy + 5 - gs - 10);
        ctx.fillStyle = "rgba(150,120,60,.85)";
        for (var j = 0; j < 9; j++) {
          var u = (ph * .22 + j / 9) % 1, px = cx + 40 - u * 26, py = cy + 8 + u * 26 + Math.sin((ph + j) * 2) * 2;
          ctx.beginPath(); ctx.arc(px, py, 2, 0, 6.2832); ctx.fill();
        }
      }
      ctx.restore();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "#1b2150"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(cx, cy, r + 2.5, 0, 6.2832); ctx.stroke();
      K.t(ctx, "흙", cx - 58, gs + 9, { s: 10, c: "#f4e9da" });
      K.t(ctx, "점토·모래", cx - 66, cy + 12, { s: 10, c: "#3b2a18" });
      K.t(ctx, "자갈층", cx - 60, cy + 40, { s: 10, c: "#ffffff" });
      K.t(ctx, "지하수", cx + 22, cy + 58, { s: 10, c: "#ffffff" });
      K.pill(ctx, "🔍 " + (p ? p.n + " 펌프" : "공동 펌프") + " 아래 단면", cx, cy - r - 10, { s: 11.5, a: "center", c: "#e8ecff", box: [600, W - 6] });
      K.pill(ctx, leak ? "🚽 바로 옆 정화조가 새고 있었다" : "우물 → 자갈층의 지하수", cx, cy + r + 18, { s: 11, a: "center", c: leak ? "#ffb35c" : "#bfe6ff", box: [600, W - 6] });
    }

    function drawModel() {
      ctx.clearRect(0, 0, W, DH + 4);
      K.studio(ctx, 0, 0, W, DH, { x: 440, y: 470, rx: 360, ry: 40 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      strata("front"); strata("right");
      /* 윗면: 포장된 땅 */
      var tg = ctx.createLinearGradient(I.P(0, 0, G).x, I.P(0, 0, G).y, I.P(L, D, G).x, I.P(L, D, G).y);
      tg.addColorStop(0, "#c9bfae"); tg.addColorStop(1, "#ada190");
      I.plane(ctx, G, tg, "rgba(255,255,255,.6)");
      /* 자갈길 */
      ctx.lineCap = "round";
      ROADS.forEach(function (l) { var a = PP(l[0], l[1]), b = PP(l[2], l[3]); ctx.strokeStyle = "#7d7466"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
      ROADS.forEach(function (l) { var a = PP(l[0], l[1]), b = PP(l[2], l[3]); ctx.strokeStyle = "#a59a86"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); });
      ctx.lineCap = "butt";
      /* 사망자가 나온 집 둘레의 붉은 기운 */
      data.houses.forEach(function (h) {
        if (!h.d) return;
        var c = PP(h.x, h.y); ctx.save(); ctx.translate(c.x, c.y); ctx.scale(1, .5);
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, 22); g.addColorStop(0, "rgba(255,70,95," + (0.10 + 0.05 * h.d) + ")"); g.addColorStop(1, "rgba(255,70,95,0)");
        ctx.fillStyle = g; ctx.fillRect(-22, -22, 44, 44); ctx.restore();
      });
      /* 고른 펌프에서 물을 길어 가는 집 */
      if (sel !== null) {
        var sp = PP(M.PUMPS[sel].x, M.PUMPS[sel].y); ctx.strokeStyle = "rgba(40,120,210,.35)"; ctx.lineWidth = 1;
        data.houses.forEach(function (h) { if (h.p === sel) { var c = PP(h.x, h.y); ctx.beginPath(); ctx.moveTo(sp.x, sp.y); ctx.lineTo(c.x, c.y); ctx.stroke(); } });
        var g0 = PP(M.PUMPS[sel].x, M.PUMPS[sel].y);
        ctx.save(); ctx.setLineDash([6, 4]); ctx.strokeStyle = "#1f6fd0"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.ellipse(g0.x, g0.y, 26, 13, 0, 0, 6.2832); ctx.stroke(); ctx.restore();
      }
      /* 집·건물·펌프 (먼 것부터) */
      objs.forEach(function (o) {
        if (o.k === "h") { var h = data.houses[o.i]; house(h, sel !== null && h.p === sel); }
        else if (o.k === "b") building(M.BLD[o.i]);
        else pump(M.PUMPS[o.i], o.i);
      });
      /* 물 긷는 사람들 (움직임) */
      if (sel !== null && !(hit && sel === 0)) {
        var p0 = M.PUMPS[sel], mine = data.houses.filter(function (h) { return h.p === sel; }), n = Math.min(8, mine.length);
        for (var k = 0; k < n; k++) {
          var h = mine[Math.floor(k * mine.length / n)], t = (ph * .12 + k * .37) % 1, tt = t < .5 ? t * 2 : 2 - t * 2;
          person(wx(p0.x) + 8, wy(p0.y) + 8, wx(h.x), wy(h.y), tt, ["#ff6b81", "#ffd35a", "#4fb6ff", "#3fd3a3", "#b69cff", "#ff9a3c"][k % 6]);
        }
      }
      I.edges(ctx, G, G);
      ctx.restore();
      /* 펌프 이름표 */
      M.PUMPS.forEach(function (p, i) {
        var c = PP(p.x, p.y); pumpScr[i] = c;
        K.pill(ctx, p.n + (seen[i] ? " ✓" : ""), c.x, c.y + 18, { s: 11.5, a: "center", c: sel === i ? "#7fd3ff" : "#9ff0e4" });
        if (seen[i]) K.pill(ctx, "100채당 " + data.stats[i].rate.toFixed(0) + "명", c.x, c.y + 38, { s: 10.5, a: "center", c: data.stats[i].rate >= 50 ? "#ff9aac" : "#c9d2ee" });
        if (hit && i === 0) K.pill(ctx, "✖ 손잡이 제거", c.x + 14, c.y - 30, { s: 11, a: "left", c: "#ff9aac" });
      });
      var box = [0, W];
      M.BLD.forEach(function (b, i) {
        var cx = wx(b.x + b.w / 2), cy = wy(b.y + b.h / 2);
        I.label(ctx, cx, cy, G + 16, b.n, i === 0 ? 64 : -70, i === 0 ? -46 : -22, "#ffe2c4", box);
      });
      I.label(ctx, 120, D, 9, "자갈층 · 지하수", -36, 34, "#bfe6ff", box);
      I.label(ctx, 300, D, 36, "점토·모래", -30, 46, "#f3e2c4", box);
      inset(sel, ep.cleared(1) && sel === 0);
      /* 큰 제목 */
      var t1, t2, c2 = "#ffd35a";
      if (hit) { t1 = "브로드가 펌프, 손잡이를 떼다"; t2 = "1854년 9월 8일, 위원회가 건의를 받아들였다"; }
      else if (sel === null) { t1 = "펌프 다섯 개, 범인은 어디에"; t2 = "펌프를 골라 둘레의 사망자를 세어 보세요"; c2 = "#ffffff"; }
      else {
        var nSeen = 0; for (var s = 0; s < 5; s++) if (seen[s]) nSeen++;
        if (nSeen === 5) { t1 = "다섯 펌프를 모두 세었다"; t2 = "어느 펌프의 손잡이를 뗄까?"; }
        else { t1 = M.PUMPS[sel].n + " 펌프 둘레"; t2 = "집 100채당 사망자 " + data.stats[sel].rate.toFixed(0) + "명 · 조사 " + nSeen + " / 5"; }
      }
      K.bigText(ctx, t1, 22, 50, 27, "#ffffff");
      K.bigText(ctx, t2, 22, 82, 17, c2);
      K.warn(ctx, W - 14, 30, "⚠ 높이는 과장 · 집 배치는 실제 지도를 본뜬 모형", "right");
      K.pill(ctx, "■ 집   ▮ 빨간 기둥 = 사망자 수   (고른 펌프가 가장 가까운 집은 파랗게)", 16, DH - 14, { s: 11, c: "#e8ecff" });
    }

    function drawChart() {
      var y0 = DH + 8, h = H - y0, i, CX = 650;
      ctx.clearRect(0, y0 - 4, W, h + 4);
      K.studio(ctx, 0, y0, CX - 10, h);
      K.pill(ctx, "1854년 소호 · 펌프별 집 100채당 사망자 (조사한 펌프만)", 14, y0 + 26, { s: 12, c: "#bfe6ff" });
      var mx = 0; data.stats.forEach(function (s) { mx = Math.max(mx, s.rate); }); mx = mx * 1.08 || 1;
      for (i = 0; i < 5; i++) {
        var yy = y0 + 44 + i * 22, s = data.stats[i], hot = s.rate >= 50;
        lt(ctx, M.PUMPS[i].n, 20, yy + 11, { s: 12, w: "800", c: sel === i ? LT.blue : LT.ink });
        ltrack(ctx, 96, yy, 360, 14, 5);
        if (seen[i]) {
          lbar(ctx, 96, yy, 360 * s.rate / mx, 14, hot ? "#c92a2a" : "#1c7ed6", hot ? "#ff8787" : "#74c0fc", 5);
          lt(ctx, s.rate.toFixed(0) + "명 (" + s.h + "채 · " + s.d + "명)", 96 + 360 * s.rate / mx + 8, yy + 11, { s: 11.5, w: "800", c: hot ? LT.red : LT.ink });
        } else lt(ctx, "?  아직 조사하지 않음", 104, yy + 11, { s: 11, c: LT.mute });
      }
      var n = 0; for (i = 0; i < 5; i++) if (seen[i]) n++;
      K.card(ctx, CX, y0, W - CX, h, "판정 · 조사한 펌프");
      lt(ctx, n + " / 5", CX + 18, y0 + 66, { s: 26, w: "900", c: n === 5 ? LT.green : LT.orange });
      lt(ctx, hit ? "브로드가 손잡이 제거" : "손잡이: 모두 그대로", W - 18, y0 + 64, { s: 12.5, w: "800", a: "right", c: hit ? LT.red : LT.ink });
      K.bar(ctx, CX + 18, y0 + 80, W - CX - 36, n / 5, n === 5 ? LT.green : LT.orange);
      K.tip(ctx, hit ? "손잡이를 뗀 뒤 새 환자가 줄었다" : (n === 5 ? "가장 높은 막대의 펌프를 고르세요" : "다섯 펌프를 모두 세어 보세요"), CX + 14, y0 + 104, W - CX - 32, hit ? true : null);
    }
    function draw() { drawModel(); drawChart(); }
    canvas._redraw = draw;
    function moving() { return sel !== null || ep.cleared(1); }
    var pb = $("a-map-play");
    function btn() { if (pb) pb.textContent = playing ? "⏸ 움직임 멈추기" : "▶ 물 긷는 사람 보기"; }
    if (pb) pb.addEventListener("click", function () { playing = !playing; btn(); });
    btn();
    K.animate(canvas, function (dt) {
      if (!playing || !moving()) return;
      ph += dt / 1000; drawModel();
    }, 20);

    function say(extra) {
      var rows = M.PUMPS.map(function (p, i) {
        if (!seen[i]) return "";
        var s = data.stats[i];
        return "<b>" + p.n + " 펌프</b> — 가장 가까운 집 " + s.h + "채 · 사망 <b>" + s.d + "명</b> · 집 100채당 <b>" + s.rate.toFixed(0) + "명</b>";
      }).filter(function (x) { return x; });
      $("a-map-info").innerHTML = (rows.length ? "<b>조사 기록</b><br>" + rows.join("<br>") : "펌프를 하나 골라 조사를 시작하세요.") + (extra ? "<br>" + extra : "");
    }
    function mission() {
      var all = true; for (var i = 0; i < 5; i++) if (!seen[i]) all = false;
      if (all) done("m1-2a"); if (hit) done("m1-2b"); if (quiz) done("m1-2c");
      if (all && hit && quiz) {
        var s = data.stats[0], tot = 0; data.stats.forEach(function (z) { tot += z.d; });
        window.sthMission("m1-2", true, "<span class='m-tag'>미션 완료</span>사망자 " + tot + "명 가운데 <b>" + s.d + "명</b>이 브로드가 펌프가 가장 가까운 집에서 나왔습니다. 병원체를 보지 못해도, <b>‘어디서 몇 명’이라는 데이터</b>가 감염원을 가리켰습니다.");
        ep.clear(1);
      }
    }
    function pick(i) {
      sel = i; seen[i] = 1; window.sthState("mapSeen", seen);
      segOn($("a-pumps"), $("a-pumps").querySelectorAll("button")[i]);
      draw(); say(); mission();
    }
    Array.prototype.forEach.call($("a-pumps").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { pick(+b.getAttribute("data-i")); });
    });
    canvas.addEventListener("click", function (e) {
      var rc = canvas.getBoundingClientRect(), mx = (e.clientX - rc.left) * W / rc.width, my = (e.clientY - rc.top) * H / rc.height;
      M.PUMPS.forEach(function (p, i) { var c = pumpScr[i]; if (c && Math.abs(mx - c.x) < 26 && my > c.y - 40 && my < c.y + 14) pick(i); });
    });
    $("a-handle").addEventListener("click", function () {
      if (sel === null) { say("먼저 펌프를 하나 고르세요."); return; }
      if (sel !== 0) { var s = data.stats[sel]; say("❌ 위원회가 고개를 젓습니다. “" + M.PUMPS[sel].n + " 펌프 둘레의 사망자는 " + s.d + "명(집 100채당 " + s.rate.toFixed(0) + "명)뿐이오. 다른 펌프와 비교해 보시오.”"); return; }
      hit = true; window.sthState("mapHit", 1); draw();
      say("✅ 브로드가 펌프 둘레의 사망률이 다른 펌프의 몇 배나 됩니다. 위원회는 반신반의하면서도 손잡이를 떼기로 했습니다."); mission();
    });
    window.sthPick({
      mount: "a-q1",
      q: "브로드가 펌프 바로 옆 양조장의 일꾼 70여 명은 아무도 콜레라로 죽지 않았고, 수용자가 500명이 넘던 구빈원에서도 사망자는 5명뿐이었습니다. ‘나쁜 공기’설과 ‘물’설 가운데 어느 쪽이 이 사실을 설명할 수 있을까요?",
      options: ["나쁜 공기설 — 건물이 튼튼해 악취가 들어오지 못했다", "물설 — 양조장과 구빈원에는 자체 우물이 있었고, 양조장 일꾼은 물 대신 맥주를 마셨다", "둘 다 설명하지 못한다 — 그저 우연이다", "둘 다 설명할 수 있다 — 공기도 물도 깨끗했다"],
      answer: 1,
      why: ["같은 거리의 같은 공기를 마셨는데 이곳만 멀쩡했습니다. 공기로는 설명되지 않습니다.", "스노가 직접 확인한 사실입니다. 같은 공기를 마셨지만 <b>브로드가 펌프의 물을 마시지 않은</b> 사람들은 무사했습니다. 반대로, 멀리 떨어진 <span data-place=51.5565,-0.1783,12,r>햄스테드</span>에 살면서도 이 펌프의 물맛을 좋아해 날마다 길어다 마신 부인은 콜레라로 숨졌습니다.", "사망자가 수백 명인 한복판에서 수백 명이 무사한 것을 우연이라 하기는 어렵습니다.", "공기는 이웃집과 똑같았습니다. 달랐던 것은 마신 물입니다."],
      onDone: function () { quiz = true; window.sthState("mapQuiz", 1); mission(); }
    });
    draw(); say(); mission();
    if (ep.cleared(1)) window.sthMission("m1-2", true);
  })();

  /* 장면 3 — PCR 증폭과 Ct */
  (function () {
    var canvas = $("a-pcr"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var x = 3, c = 0, got = window.sthState("pcr") || { a: false, b: false };
    var CT10 = M.pcrCt(1);
    function n0() { return Math.round(Math.pow(10, x) / Math.pow(10, Math.floor(x) - 1)) * Math.pow(10, Math.floor(x) - 1); }

    /* 실시간 PCR 기계(열 순환기)를 잘라 본 큰 미니어처 — 뚜껑을 열고 오른쪽 벽을 잘라 온도 블록 속을 보인다 */
    var IP = K.iso({ ox: 352, oy: 172, s: 1.15, L: 200, D: 130 });
    var OTH = [[0, 40, 5.5], [1, 40, 0], [3, 40, 2], [4, 40, 6.5], [5, 40, 0], [0, 80, 4], [1, 80, 0], [3, 80, 3.5], [4, 80, 0], [5, 80, 6]];   /* 다른 검체: 칸, 줄, 처음 양(0 = 음성) */
    function dna(px, py, w, glow) {                         /* 작은 이중 나선 한 가닥 */
      var k, t;
      ctx.lineWidth = 1.7;
      for (k = 0; k < 2; k++) {
        ctx.strokeStyle = k ? "#1c7ed6" : (glow ? "#2fb35a" : "#e8590c"); ctx.beginPath();
        for (t = 0; t <= 1.001; t += 0.1) { var qx = px + t * w, qy = py + Math.sin(t * Math.PI * 3 + k * Math.PI) * 3; if (t) ctx.lineTo(qx, qy); else ctx.moveTo(qx, qy); }
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(60,70,90,.45)"; ctx.lineWidth = 1;
      for (t = 0.08; t < 1; t += 0.14) { var a2 = Math.sin(t * Math.PI * 3) * 3; ctx.beginPath(); ctx.moveTo(px + t * w, py + a2); ctx.lineTo(px + t * w, py - a2); ctx.stroke(); }
    }
    function tube(tx, ty, f2, mine) {                        /* 기계에 꽂힌 튜브 (f2 = 형광 세기) */
      var b = IP.P(tx, ty, 50), t = IP.P(tx, ty, 80);
      if (f2 > .05) K.glow(ctx, b.x, b.y - 10, 5 + 10 * f2, "rgba(64,192,87," + clamp(f2, .15, .9).toFixed(2) + ")", 2.4);
      var tg = ctx.createLinearGradient(t.x - 6, 0, t.x + 6, 0); tg.addColorStop(0, "rgba(255,255,255,.95)"); tg.addColorStop(1, "rgba(190,202,220,.9)");
      ctx.fillStyle = tg; ctx.strokeStyle = "rgba(90,105,130,.6)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(t.x - 6, t.y); ctx.lineTo(b.x - 4, b.y - 5); ctx.quadraticCurveTo(b.x, b.y + 4, b.x + 4, b.y - 5); ctx.lineTo(t.x + 6, t.y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(" + Math.round(150 - 110 * f2) + "," + Math.round(200 + 50 * f2) + "," + Math.round(170 - 60 * f2) + ",.9)"; ctx.beginPath(); ctx.ellipse(b.x, b.y - 8, 3.6, 6.5, 0, 0, 6.2832); ctx.fill();
      ctx.fillStyle = mine ? "#ff922b" : "#e9ecef"; ctx.strokeStyle = mine ? "#c25e00" : "#adb5bd"; ctx.beginPath(); ctx.ellipse(t.x, t.y, 6.5, 3, 0, 0, 6.2832); ctx.fill(); ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var ct = M.pcrCt(x), now = M.pcrN(x, c), over = now >= 0.1 * M.P, i, fl = clamp(now / M.P, 0, 1), SW = 600;
      var stepI = c === 0 ? -1 : c % 3, TC = ["#ff6b6b", "#4dabf7", "#ffa94d"];
      K.studio(ctx, 0, 0, SW, H, { x: 400, y: 352, rx: 230, ry: 30 });
      K.bigText(ctx, ct !== null && c >= ct ? "Ct = " + ct : (c === 0 ? "증폭 전" : c + "번 증폭"), 18, 44, 26, ct !== null && c >= ct ? "#a5d8ff" : "#ffffff");
      K.bigText(ctx, "지금 " + big(now) + (over ? " · 검출!" : ""), 18, 70, 15, "#ffd35a");
      /* 열린 뚜껑 (뒤쪽 경첩) */
      IP.quad(ctx, IP.P(0, 0, 56), IP.P(200, 0, 56), IP.P(200, -10, 122), IP.P(0, -10, 122), "#d3d9e1", "rgba(255,255,255,.9)");
      IP.quad(ctx, IP.P(14, -1, 64), IP.P(186, -1, 64), IP.P(186, -9, 114), IP.P(14, -9, 114), "#bcc5d0");
      /* 몸통 */
      IP.box(ctx, 0, 0, 0, 200, 130, 56, "#eef1f5", "#dde3ea", "#c3cbd5");
      /* 오른쪽 벽을 잘라 본 속: 아래 팬 · 가운데 온도 소자 · 위 금속 블록과 튜브 끝 */
      IP.face(ctx, "right", function () {
        ctx.fillStyle = "#e7ebf0"; ctx.fillRect(10, 5, 112, 46);
        ctx.fillStyle = "#c9d0d9"; ctx.fillRect(14, 8, 104, 11);
        for (var f = 0; f < 4; f++) { ctx.strokeStyle = "#8a94a3"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(28 + f * 26, 13.5, 4.2, 0, 6.2832); ctx.stroke(); }
        ctx.fillStyle = stepI < 0 ? "#ced4da" : TC[stepI]; ctx.fillRect(14, 21, 104, 6);
        var mg = ctx.createLinearGradient(0, 29, 0, 50); mg.addColorStop(0, "#aab4c1"); mg.addColorStop(1, "#dfe5ec");
        ctx.fillStyle = mg; ctx.fillRect(14, 29, 104, 21);
        [40, 80].forEach(function (u) { ctx.fillStyle = "#f8f9fa"; ctx.fillRect(u - 5, 34, 10, 16); ctx.fillStyle = "rgba(64,192,87," + (0.25 + 0.6 * fl).toFixed(2) + ")"; ctx.fillRect(u - 3, 35, 6, 9); });
        if (stepI >= 0) { ctx.strokeStyle = TC[stepI]; ctx.lineWidth = 1.3; for (var h = 0; h < 3; h++) { ctx.beginPath(); ctx.moveTo(30 + h * 34, 28); ctx.quadraticCurveTo(34 + h * 34, 31, 30 + h * 34, 34); ctx.stroke(); } }
      });
      IP.shade(ctx, "right", function () { return 56; });
      /* 윗면: 오목한 온도 블록 */
      IP.box(ctx, 26, 20, 50, 174, 100, 56, "#9aa5b3", "#808b9b", "#68727f");
      if (stepI >= 0) { ctx.save(); ctx.globalAlpha = .22; IP.plane(ctx, 56.2, TC[stepI], null, 26, 174, 20, 100); ctx.restore(); }
      /* 튜브 12개: 다른 검체 10개 + 이 검체(주황 뚜껑) + 음성 대조 */
      var cells = [];
      OTH.forEach(function (o) { cells.push({ tx: 46 + o[0] * 22, ty: o[1], f: o[2] ? clamp(M.pcrN(o[2], c) / M.P, 0, 1) : 0, mine: false }); });
      cells.push({ tx: 46 + 2 * 22, ty: 40, f: 0, mine: false });
      cells.push({ tx: 46 + 2 * 22, ty: 80, f: fl, mine: true });
      cells.sort(function (p, q) { return (p.tx + p.ty) - (q.tx + q.ty); }).forEach(function (q) { tube(q.tx, q.ty, q.f, q.mine); });
      /* 앞면 조작판: 주기 표시창과 세 단계 불빛 */
      IP.quad(ctx, IP.P(14, 130, 14), IP.P(98, 130, 14), IP.P(98, 130, 46), IP.P(14, 130, 46), "#eaf6d8", "rgba(80,110,60,.6)");
      var sc1 = IP.P(56, 130, 34), sc2 = IP.P(56, 130, 22);
      K.t(ctx, "주기 " + c + " / 45", sc1.x, sc1.y + 5, { s: 12, w: "900", a: "center", c: "#2b3a1e" });
      K.t(ctx, stepI < 0 ? "대기" : ["95℃ 변성", "55℃ 결합", "72℃ 신장"][stepI], sc2.x, sc2.y + 5, { s: 12, w: "800", a: "center", c: stepI < 0 ? "#5c6b4a" : K.tint(TC[stepI], .7) });
      for (i = 0; i < 3; i++) { var lp = IP.P(124 + i * 22, 130, 32); K.planet(ctx, lp.x, lp.y, 5, i === stepI ? TC[i] : "#e9ecef", i === stepI ? K.tint(TC[i], .6) : "#adb5bd"); if (i === stepI) K.glow(ctx, lp.x, lp.y, 4, TC[i], 2.5); }
      /* 확대 거품: 이 검체 튜브 속 DNA — 주기마다 가닥 수가 2배 */
      var bx = 108, by = 270, br = 84, show = Math.min(32, Math.pow(2, Math.min(c, 5)));
      var mt = IP.P(90, 80, 70);
      ctx.strokeStyle = "rgba(20,25,40,.45)"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(mt.x, mt.y); ctx.lineTo(bx + br * .8, by - br * .6); ctx.stroke(); ctx.setLineDash([]);
      floorShadow(ctx, bx, by + br + 6, br * .9, 9, .2);
      var bg3 = ctx.createRadialGradient(bx - 30, by - 30, 10, bx, by, br); bg3.addColorStop(0, "#ffffff"); bg3.addColorStop(1, over ? "#d3f9d8" : "#e7f0f8");
      ctx.fillStyle = bg3; ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = over ? "#2fb35a" : "#8fa3bb"; ctx.lineWidth = 3; ctx.stroke();
      if (fl > .05) K.glow(ctx, bx, by, br * .5 * fl + 8, "rgba(64,192,87," + (0.35 * fl).toFixed(2) + ")", 2);
      ctx.save(); ctx.beginPath(); ctx.arc(bx, by, br - 4, 0, 6.2832); ctx.clip();
      /* 튜브 벽과 시약(형광이 세질수록 초록) */
      var tw = 62, liq = ctx.createLinearGradient(0, by - 44, 0, by + 70);
      liq.addColorStop(0, "rgba(" + Math.round(200 - 120 * fl) + "," + Math.round(225 + 20 * fl) + "," + Math.round(235 - 110 * fl) + ",.85)"); liq.addColorStop(1, "rgba(" + Math.round(170 - 110 * fl) + "," + Math.round(205 + 30 * fl) + "," + Math.round(225 - 120 * fl) + ",.95)");
      ctx.fillStyle = liq; ctx.beginPath(); ctx.moveTo(bx - tw, by - 44); ctx.lineTo(bx - tw, by + 30); ctx.quadraticCurveTo(bx - tw, by + 76, bx, by + 78); ctx.quadraticCurveTo(bx + tw, by + 76, bx + tw, by + 30); ctx.lineTo(bx + tw, by - 44); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.8)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(bx, by - 44, tw, 6, 0, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = "rgba(90,110,140,.7)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(bx - tw - 3, by - 90); ctx.lineTo(bx - tw - 3, by + 30); ctx.quadraticCurveTo(bx - tw - 3, by + 80, bx, by + 82); ctx.quadraticCurveTo(bx + tw + 3, by + 80, bx + tw + 3, by + 30); ctx.lineTo(bx + tw + 3, by - 90); ctx.stroke();
      var nc = Math.min(4, show), nr = Math.ceil(show / nc), sx0 = bx - nc * 29 / 2 + 2, sy0 = by + 16 - (nr - 1) * 12.5 / 2;
      for (i = 0; i < show; i++) dna(sx0 + (i % nc) * 29, sy0 + Math.floor(i / nc) * 12.5, 25, over);
      ctx.restore();
      K.pill(ctx, "튜브 속 확대 · DNA ×" + (c <= 20 ? fmt(Math.pow(2, c)) : "2^" + c), bx, by - br - 10, { s: 12, a: "center", c: "#ffe3a3", box: [0, 240] });
      K.pill(ctx, c > 5 ? "그림은 32가닥까지만 · 실제 " + big(now) : "주기마다 가닥 수가 2배", bx, by + br + 4 > H - 8 ? H - 8 : by + br + 4, { s: 11.5, a: "center", c: over ? "#8ce99a" : "#e8ecff", box: [0, 300] });
      var tp = IP.P(90, 80, 82); lead(ctx, tp.x, tp.y, 262, 112, "이 검체 (주황 뚜껑)", "#ffe3a3", [0, SW]);
      var rp = IP.P(200, 60, 30); lead(ctx, rp.x, rp.y, 590, 330, "잘라 본 속: 온도 블록", "#e8ecff", [0, SW]);
      K.warn(ctx, SW - 12, 26, "⚠ 튜브·DNA는 보기 쉽게 크게 그림", "right");
      /* 오른쪽 흰 판정 카드: 증폭 곡선은 카드 안의 작은 그래프로 */
      var CX = SW + 10, x0 = CX + 18, x1 = W - 18;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 형광 신호(증폭 곡선)");
      var g = K.chart(ctx, { x: CX + 4, y: 40, w: W - CX - 12, h: 180, x0: 0, x1: 45, y0: 0, y1: 1, xt: 3, yt: 2, xl: "주기", yf: function () { return ""; }, pl: 18, pb: 30, light: true });
      ldash(ctx, g.L, g.Y(0.1), g.R, g.Y(0.1), LT.orange, 1.6);
      lt(ctx, "검출 기준선", g.L + 4, g.Y(0.1) - 5, { s: 10.5, w: "800", c: LT.orange });
      var all = [], upto = [];
      for (i = 0; i <= 180; i++) { var cc = i / 4; all.push([cc, M.pcrN(x, cc) / M.P]); if (cc <= c) upto.push([cc, M.pcrN(x, cc) / M.P]); }
      K.plot(ctx, g, all, "rgba(20,40,90,.22)", { w: 1.8, glow: false });
      K.plot(ctx, g, upto, LT.green, { w: 3, light: true });
      if (ct !== null && c >= ct) { ldash(ctx, g.X(ct), g.T, g.X(ct), g.B, LT.blue, 1.6, [4, 4]); lt(ctx, "Ct", g.X(ct) + 4, g.T + 12, { s: 11, w: "900", c: LT.blue }); }
      K.planet(ctx, g.X(c), g.Y(now / M.P), 4.5, "#8ce99a", "#0b7a55");
      K.row(ctx, "처음 유전자", fmt(n0()) + "개", x0, x1, 246, LT.blue);
      K.row(ctx, "지금", big(now), x0, x1, 270, over ? LT.green : LT.ink);
      K.row(ctx, "이 검체의 Ct", ct !== null && c >= ct ? String(ct) : "?", x0, x1, 294, LT.blue);
      K.bar(ctx, x0, 306, x1 - x0, c / 45, over ? LT.green : LT.yellow);
      K.tip(ctx, over ? "검출됨 · 기준선을 넘었다" : (c === 0 ? "주기를 돌려 보세요" : "아직 기준선 아래"), x0 - 4, 330, x1 - x0 + 4, over ? true : null);

      $("a-pcr-read").innerHTML = "<span class='k'>처음</span><span class='v b'>" + fmt(n0()) + "개</span>" +
        "<span class='k'>지금</span><span class='v y'>" + big(now) + "</span>" +
        "<span class='sub'>× 2를 " + c + "번" + (c <= 20 ? " = × " + fmt(Math.pow(2, c)) : "") + (now > 0.8 * M.P ? " · 시약이 바닥나 더 늘지 않음(고원)" : "") + "</span>" +
        "<span class='k'>이 검체의 Ct</span><span class='v g'>" + (ct !== null && c >= ct ? ct : "?") + "</span>" +
        "<span class='ok " + (over ? "g" : "r") + "'>" + (over ? "검출됨 · 형광이 기준선을 넘었습니다" : "아직 기준선 아래 · 기계가 보지 못합니다") + "</span>";
      $("a-pcr-info").innerHTML = (c < ct ?
        "주기를 한 번 돌 때마다 2배가 됩니다. 지금 <b>" + big(now) + "</b>. 아직 형광이 기준선에 닿지 않아 기계는 아무것도 보지 못합니다. 주기를 더 돌려 보세요." :
        "<b>" + ct + "번째 주기</b>에서 신호가 기준선을 넘었습니다. 이 검체의 <b>Ct 값은 " + ct + "</b>입니다." + (c > ct ? " (지금은 Ct를 " + (c - ct) + "주기 지난 상태)" : "")) +
        "<br>처음 양이 많을수록 기준선에 빨리 닿으므로 <b>Ct가 작을수록 검체 속 바이러스가 많았다</b>는 뜻입니다. 정해 둔 주기 수(보통 40 안팎)까지 돌려도 신호가 없으면 음성으로 판정합니다.";

      var ch = false;
      if (!got.a && Math.abs(x - 1) < 1e-6 && c === CT10) { got.a = ch = true; }
      if (!got.b && ct === CT10 - 10 && c === ct) { got.b = ch = true; window.sthState("pcrN", fmt(n0())); }
      if (ch) { window.sthState("pcr", got); mission(); }
    }
    function mission() {
      if (got.a) { done("m1-3a"); put("m1-3a", "유전자 10개짜리 검체의 Ct = <b>" + CT10 + "</b>"); }
      if (got.b) { done("m1-3b"); put("m1-3b", "Ct = <b>" + (CT10 - 10) + "</b>인 검체의 처음 유전자 수는 약 <b>1만 개</b>"); }
      if (got.a && got.b) {
        window.sthMission("m1-3", true, "<span class='m-tag'>미션 완료</span>Ct " + CT10 + " → " + (CT10 - 10) + ". Ct가 10 작다는 것은 처음 양이 2¹⁰ = <b>약 1,000배</b> 많았다는 뜻입니다. 겨우 10개뿐인 유전자도 30여 번 2배로 불리면 천억 개가 넘어 검출됩니다. 이것이 PCR이 <b>아주 적은 병원체도 찾아내는</b> 까닭입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("a-pcr-n").addEventListener("input", function (e) { x = Math.round(+e.target.value * 10) / 10; $("a-pcr-n-val").textContent = fmt(n0()) + "개"; draw(); });
    $("a-pcr-c").addEventListener("input", function (e) { c = +e.target.value; $("a-pcr-c-val").textContent = c + "회"; draw(); });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m1-3", true);
  })();

  /* 장면 4 — 신속항원검사 2×2 표 */
  (function () {
    var canvas = $("a-rt"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var prev = 1, se = 80, sp = 98, okT = !!window.sthState("rtTable"), okP = !!window.sthState("rtPpv");
    var ANS = { "a-tp": 80, "a-fn": 20, "a-fp": 198, "a-tn": 9702 };

    function fillTable() { Object.keys(ANS).forEach(function (id) { $(id).value = ANS[id]; $(id).disabled = true; }); $("a-rt-check").disabled = true; }
    /* 시민 10,000명이 모인 광장 블록 (사람 모형 1개 = 20명, 500개) */
    var IQ = K.iso({ ox: 300, oy: 116, s: .9, L: 330, D: 230 }), SPOT = [];
    (function () {
      var i, j;
      for (i = 0; i < 25; i++) for (j = 0; j < 20; j++) SPOT.push({ x: 16 + i * 12.4, y: 36 + j * 9.6 });
      SPOT.sort(function (p, q) { return (q.x + q.y) - (p.x + p.y); });   /* 앞(오른쪽 아래)부터 */
    })();
    function plaza(cnt) {                                    /* cnt = { tp, fp, fn } 모형 개수, 없으면 검사 전 */
      var i;
      IQ.box(ctx, 0, 0, -12, 330, 230, 0, "#e9dfcf", "#b9a88f", "#97876f");
      IQ.face(ctx, "front", function (Lw) { ctx.fillStyle = "rgba(255,255,255,.18)"; for (var u = 0; u < Lw; u += 22) ctx.fillRect(u, -12, 1.2, 12); });
      for (i = 0; i <= 330; i += 30) { var a = IQ.P(i, 0, 0), b = IQ.P(i, 230, 0); ctx.strokeStyle = "rgba(140,120,90,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      for (i = 0; i < 6; i++) IQ.house(ctx, 10 + i * 54, 2, 0, 36, 22, 18, ["#c0553f", "#3b7dd8", "#d08c2c"][i % 3]);
      IQ.tree(ctx, 4, 226, 0, 1.1); IQ.tree(ctx, 326, 30, 0, 1.1);
      var kinds = [], P = cnt || { tp: 0, fp: 0, fn: 0 };
      for (i = 0; i < 500; i++) kinds.push(i < P.tp ? "tp" : (i < P.tp + P.fp ? "fp" : (i < P.tp + P.fp + P.fn ? "fn" : "tn")));
      var list = SPOT.map(function (s, k) { return { x: s.x, y: s.y, k: kinds[k] }; }).sort(function (p, q) { return (p.x + p.y) - (q.x + q.y); });
      list.forEach(function (q) { if (cnt && (q.k === "tp" || q.k === "fp")) { var m = IQ.P(q.x, q.y, 0); ctx.fillStyle = "rgba(247,103,7,.35)"; ctx.beginPath(); ctx.ellipse(m.x, m.y, 7, 3.6, 0, 0, 6.2832); ctx.fill(); } });
      list.forEach(function (q) {
        var col = !cnt ? "#adb5bd" : (q.k === "tp" || q.k === "fn" ? "#e03131" : "#5c9ee6");
        IQ.person(ctx, q.x, q.y, 0, col, .9);
        if (cnt && (q.k === "tp" || q.k === "fp")) { var h = IQ.P(q.x, q.y, 0); ctx.fillStyle = "#f76707"; ctx.beginPath(); ctx.arc(h.x, h.y - 19, 3.4, 0, 6.2832); ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(h.x - 2, h.y - 19.6, 4, 1.2); ctx.fillRect(h.x - .6, h.y - 21, 1.2, 4); }
      });
    }
    var plazaKey = null, plazaCv = null;
    function plazaCached(cnt) {                               /* 개수가 같으면 숨은 캔버스에 그려 둔 광장을 다시 쓴다 */
      var key = cnt ? cnt.tp + "|" + cnt.fp + "|" + cnt.fn : "-";
      if (key !== plazaKey || !plazaCv || plazaCv.width !== canvas.width || plazaCv.height !== canvas.height) {
        if (!plazaCv || plazaCv.width !== canvas.width || plazaCv.height !== canvas.height) { plazaCv = document.createElement("canvas"); plazaCv.width = canvas.width; plazaCv.height = canvas.height; }
        var oc = plazaCv.getContext("2d"), main = ctx;
        oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, plazaCv.width, plazaCv.height); oc.setTransform(canvas.width / W, 0, 0, canvas.height / H, 0, 0);
        ctx = oc; try { plaza(cnt); } finally { ctx = main; }
        plazaKey = key;
      }
      ctx.drawImage(plazaCv, 0, 0, W, H);
    }
    function kit(ox, oy) {                                   /* 신속항원 키트 미니어처 (C·T 두 줄 = 양성) */
      var IK = K.iso({ ox: ox, oy: oy, s: 1.25, L: 96, D: 34 });
      floorShadow(ctx, ox + 40, oy + 72, 74, 11, .22);
      IK.box(ctx, 0, 0, 0, 96, 34, 7, "#ffffff", "#e9ecef", "#ced4da");
      IK.quad(ctx, IK.P(34, 8, 7.1), IK.P(74, 8, 7.1), IK.P(74, 26, 7.1), IK.P(34, 26, 7.1), "#f8f0f3", "rgba(120,130,150,.6)");
      [[46, "#c2255c"], [60, "rgba(194,37,92,.75)"]].forEach(function (q) { IK.quad(ctx, IK.P(q[0], 9, 7.2), IK.P(q[0] + 4, 9, 7.2), IK.P(q[0] + 4, 25, 7.2), IK.P(q[0], 25, 7.2), q[1]); });
      var hole = IK.P(16, 17, 7.2); ctx.fillStyle = "#dee2e6"; ctx.beginPath(); ctx.ellipse(hole.x, hole.y, 7, 3.5, 0, 0, 6.2832); ctx.fill();
      var cP = IK.P(48, 0, 7), tP = IK.P(62, 0, 7);
      K.t(ctx, "C", cP.x, cP.y - 3, { s: 12, w: "900", a: "center", c: "#495057" }); K.t(ctx, "T", tP.x, tP.y - 3, { s: 12, w: "900", a: "center", c: "#495057" });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (!okT && !OPEN_ALL) {
        K.studio(ctx, 0, 0, W, H, { x: 340, y: 360, rx: 260, ry: 26 });
        plazaCached(null);
        K.bigText(ctx, "시민 10,000명", 18, 44, 25, "#ffffff");
        K.bigText(ctx, "아직 검사 전 · 회색 사람 1개 = 20명", 18, 70, 15, "#ffd35a");
        kit(52, 300);
        K.pill(ctx, "🔒 위의 결과표를 먼저 직접 계산해 채우면", 750, 190, { s: 13, a: "center", c: "#e8ecff", box: [600, W - 4] });
        K.pill(ctx, "검사 결과가 광장에 나타납니다", 750, 222, { s: 13, a: "center", c: "#e8ecff", box: [600, W - 4] });
        $("a-rt-info").innerHTML = "표를 채운 뒤에는 유병률·민감도·특이도를 바꿔 가며 결과가 어떻게 달라지는지 볼 수 있습니다.";
        $("a-rt-read").innerHTML = "<span class='k'>양성 예측도</span><span class='v y'>?</span><span class='sub'>결과표를 먼저 채우세요</span>";
        return;
      }
      var r = M.rt(prev, se, sp), pos = r.tp + r.fp, neg = r.tn + r.fn, good = r.ppv >= 90, SW = 600;
      K.studio(ctx, 0, 0, SW, H, { x: 340, y: 360, rx: 260, ry: 26 });
      var nTP = Math.round(r.tp / 20), nFP = Math.round(r.fp / 20), nFN = Math.round(r.fn / 20);
      plazaCached({ tp: nTP, fp: nFP, fn: nFN });
      K.bigText(ctx, "양성 예측도 " + r.ppv.toFixed(1) + "%", 18, 44, 25, good ? "#8ff5cf" : "#ffffff");
      K.bigText(ctx, "유병률 " + prev + "% · 민감도 " + se + "% · 특이도 " + sp + "%", 18, 70, 15, "#ffd35a");
      kit(52, 300);
      K.pill(ctx, "키트의 두 줄 = 양성", 84, 392, { s: 11.5, a: "center", c: "#e8ecff", box: [0, 200] });
      var fr = IQ.P(314, 218, 0); lead(ctx, fr.x, fr.y - 8, 400, 392, "주황 받침·⊕ = 양성 판정", "#ffd8a8", [0, SW]);
      K.warn(ctx, SW - 12, 26, "⚠ 사람 모형 1개 = 시민 20명", "right");
      /* 오른쪽 판정 카드: 양성 판정을 받은 사람 */
      var CX = SW + 10, cx = CX + (W - CX) / 2, cy = 112, rr = 52;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 양성 " + fmt(pos) + "명을 쪼개 보면");
      var a0 = -Math.PI / 2, a1 = a0 + (pos > 0 ? r.tp / pos : 0) * Math.PI * 2;
      ctx.lineWidth = 22; ctx.lineCap = "butt";
      ctx.strokeStyle = "#e3e9f1"; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.stroke();
      if (pos > 0) { ctx.strokeStyle = LT.red; ctx.beginPath(); ctx.arc(cx, cy, rr, a0, a1); ctx.stroke(); ctx.strokeStyle = "#ff922b"; ctx.beginPath(); ctx.arc(cx, cy, rr, a1, a0 + Math.PI * 2); ctx.stroke(); }
      lt(ctx, r.ppv.toFixed(1) + "%", cx, cy + 7, { s: r.ppv >= 99.95 ? 18 : 20, w: "900", a: "center", c: good ? LT.green : LT.orange });
      lt(ctx, "양성인 사람이 진짜 감염자일 확률", cx, cy + rr + 26, { s: 11, a: "center", c: LT.mute });
      var xa = CX + 18, xb = W - 18;
      K.row(ctx, "진짜 감염자(양성)", fmt(r.tp) + "명", xa, xb, 212, LT.red);
      K.row(ctx, "위양성(감염 아님)", fmt(r.fp) + "명", xa, xb, 236, "#d9480f");
      K.row(ctx, "놓친 감염자(위음성)", fmt(r.fn) + "명", xa, xb, 260, "#a61e4d");
      K.row(ctx, "음성 예측도", r.npv.toFixed(1) + "%", xa, xb, 284, LT.blue);
      lt(ctx, "몸 빨강 = 감염 · 파랑 = 비감염", xa, 312, { s: 11, w: "700", c: LT.mute });
      lt(ctx, "머리 위 ⊕ = 검사 양성", xa, 330, { s: 11, w: "700", c: LT.mute });
      K.tip(ctx, good ? "양성 결과를 믿을 만합니다" : "양성이어도 감염이 아닐 수 있다", CX + 14, 348, W - CX - 32, good ? true : false);

      $("a-rt-read").innerHTML = "<span class='k'>양성 예측도</span><span class='v y'>" + r.ppv.toFixed(1) + "%</span>" +
        "<span class='sub'>양성 " + fmt(pos) + "명 = 진짜 감염자 " + fmt(r.tp) + " + 위양성 " + fmt(r.fp) + "</span>" +
        "<span class='k'>음성 예측도</span><span class='v b'>" + r.npv.toFixed(1) + "%</span>" +
        "<span class='ok " + (good ? "g" : "r") + "'>" + (good ? "양성 결과를 믿을 만합니다(90% 이상)" : "양성인데도 감염이 아닐 수 있습니다") + "</span>";
      $("a-rt-info").innerHTML = "양성 " + fmt(pos) + "명 = 진짜 감염자 <b>" + fmt(r.tp) + "명</b> + 위양성 <b>" + fmt(r.fp) + "명</b> → 양성인 사람이 진짜 감염자일 확률(양성 예측도) <b>" + r.ppv.toFixed(1) + "%</b>. " +
        (r.ppv < 50 ? "양성 판정을 받은 사람의 절반 이상이 사실은 감염자가 아닙니다! 감염자가 드물 때는 수많은 비감염자 가운데 일부만 잘못 양성이 나와도, 그 수(위양성)가 진짜 감염자보다 많아지기 때문입니다. 그래서 신속검사 양성은 <b>PCR로 다시 확인</b>합니다." :
         (r.ppv < 90 ? "유병률이 높아질수록 같은 검사의 양성 결과를 더 믿을 수 있게 됩니다." : "유행이 커졌거나 증상이 있는 사람만 검사할 때처럼 감염자 비율이 높으면, 같은 검사라도 양성 결과를 훨씬 믿을 만합니다.")) +
        " 한편 위음성 " + fmt(r.fn) + "명은 음성 판정을 받고 돌아다니게 되므로, <b>음성이어도 증상이 있으면 다시 검사</b>해야 합니다.";
      if (!okP && se === 80 && sp === 98 && prev === 19) { okP = true; window.sthState("rtPpv", 1); mission(); }
    }
    function mission() {
      if (okT) done("m1-4a");
      if (okP) { done("m1-4b"); put("m1-4b", "유병률 <b>19%</b>부터 양성 예측도가 90%를 넘습니다(18%에서는 89.8%). 같은 검사도 <b>누구를 검사하느냐</b>에 따라 결과의 믿음직함이 달라집니다."); }
      if (okT && okP) { window.sthMission("m1-4", true); ep.clear(3); }
    }
    canvas._redraw = draw;
    $("a-rt-check").addEventListener("click", function () {
      var bad = [], names = { "a-tp": "감염자·양성", "a-fn": "감염자·음성", "a-fp": "비감염자·양성", "a-tn": "비감염자·음성" };
      Object.keys(ANS).forEach(function (id) { var ok = $(id).value !== "" && +$(id).value === ANS[id]; $(id).style.borderColor = ok ? v("--green") : v("--rose"); if (!ok) bad.push(names[id]); });
      if (bad.length) { $("a-rt-msg").innerHTML = "❌ 다시 볼 칸: <b>" + bad.join(", ") + "</b>. 감염자 100명의 80%가 양성, 비감염자 9,900명의 98%가 음성입니다. 각 줄의 합이 100명, 9,900명이 되는지도 확인하세요."; return; }
      okT = true; window.sthState("rtTable", 1); fillTable();
      $("a-rt-msg").innerHTML = "✅ 양성은 모두 80 + 198 = <b>278명</b>. 그런데 그 가운데 진짜 감염자는 80명, 겨우 <b>28.8%</b>입니다. ‘정확도 98%’처럼 들리는 검사에서 왜 이런 일이 생길까요? 아래 화면에서 유병률을 바꿔 보세요.";
      draw(); mission();
    });
    [["a-rt-p", function (n) { prev = n; }], ["a-rt-se", function (n) { se = n; }], ["a-rt-sp", function (n) { sp = n; }]].forEach(function (p) {
      $(p[0]).addEventListener("input", function (e) { p[1](+e.target.value); $(p[0] + "-val").textContent = e.target.value + "%"; draw(); });
    });
    if (okT) { fillTable(); $("a-rt-msg").innerHTML = "✅ 양성 278명 가운데 진짜 감염자는 80명(28.8%)입니다."; }
    draw(); mission();
  })();

  /* 장면 5 — 전파 모형 */
  (function () {
    var canvas = $("a-sir"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var cut = 0, vac = 0, base = M.sir(0, 0), CAP = 5000;
    var got = window.sthState("sir") || { a: false, b: false }, quiz = !!window.sthState("sirQuiz");

    /* 마을 블록: 사람 모형 200개(1개 = 500명). 첫 환자가 나온 집에서 가까운 사람부터 걸린다고 보고 배치 */
    var ITN = K.iso({ ox: 214, oy: 124, s: .92, L: 260, D: 200 }), FOLK = [], HOUSES = [];
    (function () {
      var R = K.rng(77), i, j;
      for (i = 0; i < 5; i++) for (j = 0; j < 4; j++) HOUSES.push({ x: 14 + i * 50, y: 12 + j * 48 });
      HOUSES.forEach(function (h, k) {
        for (var m = 0; m < 10; m++) {
          var px = h.x + 6 + (m % 5) * 6.5 + (R() - .5) * 2, py = h.y + 30 + Math.floor(m / 5) * 7 + (R() - .5) * 2;
          FOLK.push({ x: px, y: py, d: Math.sqrt(Math.pow(px - 40, 2) + Math.pow(py - 40, 2)) + R() * 40, v: R(), h: k });
        }
      });
    })();
    function peakMix(cut2, vac2) {                           /* 정점 날의 아픈 사람·회복한 사람 (계산 모형과 같은 식) */
      var N = 100000, g = 1 / 7, b = 3 * g * (1 - cut2 / 100), dt = 0.25;
      var S = N * (1 - vac2 / 100) - 10, I = 10, cum = 10, peak = 10, cumP = 10;
      for (var k = 0; k <= 6000; k++) { var ni = b * S * I / N * dt, nr = g * I * dt; if (ni > S) ni = S; S -= ni; I += ni - nr; cum += ni; if (I > peak) { peak = I; cumP = cum; } }
      return { I: peak, R: Math.max(0, cumP - peak) };
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = M.sir(cut, vac), YM = 32000, DAYS = 360, ok = r.peak <= CAP, SW = 600, i;
      K.studio(ctx, 0, 0, SW, H, { x: 320, y: 372, rx: 280, ry: 26 });
      K.bigText(ctx, "R = " + r.reff.toFixed(2), 18, 44, 26, r.reff < 1 ? "#8ff5cf" : "#ffc9c9");
      K.bigText(ctx, ok ? "의료 역량 안에서 버틴다" : "병상이 모자란다", 18, 70, 15, "#ffd35a");
      /* 마을 — 정점 날의 모습 */
      var mix = peakMix(cut, vac), nV = Math.round(200 * vac / 100), nI = r.peak < 50 ? 0 : Math.max(1, Math.round(200 * mix.I / 100000)), nR = Math.round(200 * mix.R / 100000);
      var order = FOLK.map(function (f, k) { return k; }), state = [];
      var vacSet = order.slice().sort(function (a, b) { return FOLK[a].v - FOLK[b].v; }).slice(0, nV), isV = {};
      vacSet.forEach(function (k) { isV[k] = 1; });
      var rest = order.filter(function (k) { return !isV[k]; }).sort(function (a, b) { return FOLK[a].d - FOLK[b].d; });
      rest.forEach(function (k, n) { state[k] = n < nR ? "R" : (n < nR + nI ? "I" : "S"); });
      vacSet.forEach(function (k) { state[k] = "V"; });
      var sickH = {}; FOLK.forEach(function (f, k) { if (state[k] === "I") sickH[f.h] = (sickH[f.h] || 0) + 1; });
      ITN.box(ctx, 0, 0, -14, 260, 200, 0, "#b5d99c", "#8a6a48", "#6d523a");
      for (i = 0; i < 4; i++) { ITN.box(ctx, 0, 52 + i * 48 - 6, 0, 260, 52 + i * 48 - 2, .4, "#d9cdb8", "#c2b59e", "#a99c86"); }
      HOUSES.forEach(function (h, k) {
        var sick = sickH[k] || 0;
        ITN.house(ctx, h.x, h.y, 0, 30, 22, 16, sick >= 3 ? "#e03131" : (sick ? "#ff8787" : "#8d6e63"));
        if (sick) { var wp = ITN.P(h.x + 15, h.y + 22, 9); K.glow(ctx, wp.x, wp.y, 2.5, "rgba(255,90,90,.9)", 3); }
      });
      var COLS = { S: "#dee2e6", I: "#e03131", R: "#748ffc", V: "#12b886" };
      FOLK.map(function (f, k) { return k; }).sort(function (a, b) { return (FOLK[a].x + FOLK[a].y) - (FOLK[b].x + FOLK[b].y); }).forEach(function (k) {
        var f = FOLK[k]; ITN.person(ctx, f.x, f.y, 0, COLS[state[k]], .95);
        if (state[k] === "I") { var hp = ITN.P(f.x, f.y, 0); ctx.strokeStyle = "rgba(224,49,49,.55)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hp.x, hp.y - 12, 5.5, 0, 6.2832); ctx.stroke(); }
      });
      var o1 = ITN.P(40, 40, 18); lead(ctx, o1.x, o1.y, 60, 104, "첫 환자가 나온 집", "#ffc9c9", [0, SW]);
      K.pill(ctx, r.peak < 50 ? "유행이 번지지 못한 마을" : "정점 " + fmt(r.peakDay) + "일째의 마을", 214, 380, { s: 12, a: "center", c: "#e8ecff", box: [0, 420] });
      lt(ctx, "● 앓는 중", 20, H - 12, { s: 12, w: "800", c: LT.red });
      lt(ctx, "● 회복", 98, H - 12, { s: 12, w: "800", c: "#4c6ef5" });
      lt(ctx, "● 접종(면역)", 158, H - 12, { s: 12, w: "800", c: "#0ca678" });
      lt(ctx, "● 아직 안 걸림", 260, H - 12, { s: 12, w: "800", c: LT.mute });
      /* 병원 미니어처: 침대 10개 = 병상 5,000개, 넘치면 밖에 줄을 선다 */
      var beds = 10, need = r.peak / CAP * beds, fill = Math.min(beds, Math.round(need)), extra = Math.max(0, Math.round(need) - beds);
      var IH = K.iso({ ox: 492, oy: 160, s: 1.05, L: 110, D: 80 });
      IH.box(ctx, 0, 0, 0, 110, 80, 6, "#f1f3f5", "#dfe4ea", "#b8c0ca");
      IH.box(ctx, 0, 0, 6, 110, 5, 52, "#ffffff", "#f1f3f5", "#ced4da");
      IH.box(ctx, 0, 5, 6, 4, 80, 52, "#ffffff", "#e9ecef", "#ced4da");
      onPlane(ctx, IH, 5, function () { ctx.fillStyle = "#e03131"; ctx.fillRect(51, 26, 8, 22); ctx.fillRect(44, 33, 22, 8); });
      for (var b = 0; b < beds; b++) {
        var bx = 10 + (b % 5) * 19, by = b < 5 ? 16 : 48, on = b < fill;
        IH.box(ctx, bx, by, 6, bx + 14, by + 24, 13, on ? "#ffc9c9" : "#ffffff", on ? "#e03131" : "#dee2e6", on ? "#a51111" : "#adb5bd");
        IH.box(ctx, bx, by, 13, bx + 14, by + 5, 16, "#f8f9fa", "#e9ecef", "#ced4da");
        if (on) { var hp2 = IH.P(bx + 7, by + 8, 15); ctx.fillStyle = "#f1c7a5"; ctx.beginPath(); ctx.arc(hp2.x, hp2.y, 3, 0, 6.2832); ctx.fill(); }
      }
      for (var e = 0; e < Math.min(10, extra); e++) IH.person(ctx, 118 + (e % 2) * 9, 10 + e * 7, 0, "#e03131", 1.25);
      K.pill(ctx, "병원 · 침대 1개 = 병상 500개", 506, 322, { s: 12, a: "center", c: "#e8ecff", box: [380, SW] });
      if (extra) K.pill(ctx, "밖에서 기다리는 환자 " + fmt(r.peak - CAP) + "명", 506, 346, { s: 12, a: "center", c: "#ffc9c9", box: [380, SW] });
      K.warn(ctx, SW - 12, 26, "⚠ 사람 1개 = 500명 (인구 10만)", "right");
      /* 판정 카드: 유행 곡선은 카드 안의 작은 그래프 */
      var CX = SW + 10, x0 = CX + 18, x1 = W - 18;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 병원은 버틸까");
      lt(ctx, ok ? "병상 충분" : "병상 부족 × " + (r.peak / CAP).toFixed(1), x0, 60, { s: 21, w: "900", c: ok ? LT.green : LT.red });
      var g = K.chart(ctx, { x: CX + 4, y: 72, w: W - CX - 12, h: 150, x0: 0, x1: DAYS, y0: 0, y1: YM, xt: 3, yt: 2, xf: function (q) { return Math.round(q) + "일"; }, yf: function (q) { return q ? Math.round(q / 1000) + "천" : "0"; }, pl: 40, pb: 22, light: true });
      function pts(arr) { var o = []; for (var d = 0; d <= DAYS; d++) o.push([d, clamp(arr[d], 0, YM)]); return o; }
      K.plot(ctx, g, pts(base.I), "rgba(20,40,90,.35)", { w: 1.6, dash: [5, 5], glow: false });
      var p = pts(r.I), col = ok ? LT.green : LT.red;
      var ag = ctx.createLinearGradient(0, g.T, 0, g.B); ag.addColorStop(0, ok ? "rgba(15,159,118,.35)" : "rgba(224,49,49,.3)"); ag.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(g.X(0), g.B); p.forEach(function (q) { ctx.lineTo(g.X(q[0]), g.Y(q[1])); }); ctx.lineTo(g.X(DAYS), g.B); ctx.closePath(); ctx.fill();
      ldash(ctx, g.L, g.Y(CAP), g.R, g.Y(CAP), LT.orange, 1.8, [6, 4]);
      lt(ctx, "의료 역량", g.R - 2, g.Y(CAP) - 5, { s: 10.5, w: "900", a: "right", c: LT.orange });
      K.plot(ctx, g, p, col, { w: 2.8, light: true });
      if (r.peak >= 50 && r.peakDay <= DAYS) K.planet(ctx, g.X(r.peakDay), g.Y(Math.min(r.peak, YM)), 4, ok ? "#63e6be" : "#ff8787", ok ? "#087f5b" : "#a51111");
      K.row(ctx, "접촉 줄이기 · 접종률", cut + "% · " + vac + "%", x0, x1, 246);
      K.row(ctx, "재생산 지수 R", r.reff.toFixed(2), x0, x1, 270, r.reff < 1 ? LT.green : LT.red);
      K.row(ctx, "동시 환자 최대", r.peak < 50 ? "수십 명 이하" : fmt(r.peak) + "명", x0, x1, 294);
      lt(ctx, "R = 3 × (1 − 접촉 감소) × (1 − 접종률)", x0, 318, { s: 11, w: "700", c: LT.mute });
      lt(ctx, "점선 = 대책 없을 때", x0, 338, { s: 11, w: "700", c: LT.mute });
      K.tip(ctx, ok ? "곡선이 역량 아래로 눌렸다" : "정점을 더 낮춰야 한다", x0 - 4, 356, x1 - x0 + 4, ok);

      var small = r.peak < 50;
      $("a-sir-read").innerHTML = "<span class='k'>재생산 지수</span><span class='v " + (r.reff < 1 ? "g" : "r") + "'>R = " + r.reff.toFixed(2) + "</span>" +
        "<span class='k'>동시 환자 최대</span><span class='v y'>" + (small ? "수십 명 이하" : fmt(r.peak) + "명") + "</span>" +
        "<span class='sub'>유행이 끝날 때까지 감염 " + fmt(r.total) + "명</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "의료 역량(5,000명) 아래" : "의료 역량의 " + (r.peak / CAP).toFixed(1) + "배 · 병상이 모자랍니다") + "</span>";
      $("a-sir-info").innerHTML = "실제 재생산 지수 <b>R = " + r.reff.toFixed(2) + "</b> · 동시 환자 최대 <b>" + (small ? "수십 명 이하" : fmt(r.peak) + "명") + "</b>" + (small ? "" : (r.peakDay > 365 ? " (1년이 지난 뒤)" : " (" + fmt(r.peakDay) + "일째)")) + " · 유행이 끝날 때까지 감염된 사람 <b>" + fmt(r.total) + "명</b><br>" +
        (r.reff < 1 ? "R이 1보다 작으면 환자 한 명이 평균 한 명도 못 되는 사람에게 옮기므로, 환자 수가 세대마다 줄어 <b>유행이 스스로 꺼집니다.</b>" :
         (ok ? (cut > 40 ? "곡선은 역량 아래로 내려왔지만 접촉을 " + cut + "%나 줄였습니다. 학교와 가게가 멈춥니다. 접촉 감소를 40% 이하로 두고 백신을 함께 써 보세요." : "✅ 유행 곡선이 의료 역량 아래로 눌렸습니다. 정점이 <b>낮아지고 늦춰진</b> 것을 보세요. 늦춰진 시간은 백신과 치료제를 준비할 시간이 됩니다.") :
          (r.peak > 20000 ? "환자가 한꺼번에 몰려 의료 역량의 " + (r.peak / CAP).toFixed(1) + "배가 됩니다. 병상이 모자라면 살릴 수 있던 환자도 잃게 됩니다." : "곡선이 낮아졌지만 아직 의료 역량을 넘습니다.")));
      var ch = false;
      if (ok && cut <= 40 && (cut > 0 || vac > 0)) {
        window.sthState("sirBest", "접촉 −" + cut + "%·접종 " + vac + "% → R " + r.reff.toFixed(2) + ", 최대 " + (small ? "수십" : fmt(r.peak)) + "명");
        if (!got.a) { got.a = ch = true; }
      }
      if (!got.b && r.reff < 1) { got.b = ch = true; }
      if (ch) { window.sthState("sir", got); mission(); }
    }
    function mission() {
      if (got.a) done("m1-5a"); if (got.b) done("m1-5b"); if (quiz) done("m1-5c");
      if (got.a && got.b && quiz) {
        window.sthMission("m1-5", true, "<span class='m-tag'>미션 완료</span>내 대책: <b>" + (window.sthState("sirBest") || "-") + "</b>. 진단으로 환자를 찾아 격리하는 것도, 백신도 결국은 <b>R을 낮추는 일</b>입니다. 모형은 대책의 효과를 <b>미리 계산해</b> 고를 수 있게 해 줍니다.");
        ep.clear(4);
      }
    }
    canvas._redraw = draw;
    $("a-sir-c").addEventListener("input", function (e) { cut = +e.target.value; $("a-sir-c-val").textContent = cut + "%"; draw(); });
    $("a-sir-v").addEventListener("input", function (e) { vac = +e.target.value; $("a-sir-v-val").textContent = vac + "%"; draw(); });
    window.sthPick({
      mount: "a-q2",
      q: "면역을 가진 사람의 비율이 1 − 1/R₀을 넘으면 접촉을 줄이지 않아도 R이 1 아래로 내려갑니다(집단 면역). R₀ = 3인 감염병 X는 약 67%입니다. 그렇다면 R₀가 약 15나 되는 홍역은 인구의 몇 %가 면역을 가져야 할까요?",
      options: ["약 50%", "약 67%", "약 80%", "약 93%"],
      answer: 3,
      why: ["1 − 1/15을 계산해 보세요.", "67%는 R₀ = 3일 때의 값입니다.", "1/15 ≈ 0.067입니다. 1에서 빼 보세요.", "1 − 1/15 ≈ 0.93. 전파력이 큰 감염병일수록 훨씬 높은 접종률이 필요합니다. 홍역 예방 접종률을 95% 수준으로 유지하려는 까닭입니다."],
      onDone: function () { quiz = true; window.sthState("sirQuiz", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(4)) window.sthMission("m1-5", true);
  })();

  /* 장면 6 — 결말 */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉡") === 0 ? " — 스노와 같은 생각이었습니다. 이제 지도라는 증거까지 갖췄습니다." : " — 당시 의사들 대부분도 그렇게 믿었습니다. 생각을 바꾼 것은 권위가 아니라 지도 위의 데이터였습니다.") +
      "<br><b>나의 방역 대책</b> " + (window.sthState("sirBest") || "-");
  }
  function finish() { window.sthState("r1", "해결 · 브로드가 펌프 · " + (window.sthState("sirBest") || "-")); }
  window.sthSort({
    mount: "a-sort",
    buckets: [
      { id: "d", label: "🧪 진단", sub: "감염 여부를 알아낸다" },
      { id: "t", label: "🗺️ 추적", sub: "어디서 어떻게 퍼지는지 밝힌다" },
      { id: "p", label: "📈 예측·예방", sub: "앞일을 계산하고 미리 막는다" }
    ],
    items: [
      { t: "PCR로 병원체의 유전자를 증폭해 검출한다", a: "d", why: "아주 적은 병원체도 찾아내는 진단 기술입니다." },
      { t: "신속항원검사 결과를 민감도·특이도를 따져 해석한다", a: "d", why: "검사 결과를 올바로 읽는 것도 진단의 일부입니다." },
      { t: "사망자의 주소를 지도에 찍어 오염된 펌프를 찾는다", a: "t", why: "스노가 한 일, 곧 역학 조사입니다." },
      { t: "확진자가 누구를 만났는지 조사해 접촉자에게 검사를 권한다", a: "t", why: "전파 경로를 따라가는 추적입니다.", hint: "이미 일어난 전파의 길을 따라가는 일입니다." },
      { t: "감염 재생산 지수로 유행 곡선을 계산해 병상을 준비한다", a: "p", why: "모형으로 앞일을 내다보는 예측입니다." },
      { t: "백신 접종률을 높여 R을 1 아래로 낮춘다", a: "p", why: "유행을 미리 막는 예방입니다." }
    ],
    onDone: function () { reveal(); ep.clear(5); }
  });
  if (ep.cleared(5)) reveal();
  ep.onShow(function (i) { if (i === 5 && ep.cleared(5)) reveal(); });
  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학2 Ⅲ-1] 이야기 ① 펌프의 손잡이를 떼어라",
    items: [
      { id: "w1", label: "데이터에서 결론까지", hint: "이 단원에서 본 사례 하나를 골라, 어떤 데이터를 모아 어떤 결론을 냈는지 순서대로 쓰세요. (예: 스노의 지도, PCR의 Ct 값, 신속검사 결과표, 유행 곡선)" },
      { id: "e1b", label: "논증: 미래 사회의 문제를 푸는 데 과학이 왜 필요한가", hint: "주장 → 근거(이 이야기에서 직접 확인한 숫자나 사례) → 예상되는 반론에 대한 답 순서로 쓰세요. 감염병 말고 기후 변화·식량·에너지 문제 하나에도 적용해 보세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 240만 장의 엽서
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "신입 분석가의 첫 예상",
    question: "240만 명에게 물은 다이제스트와 5만 명에게 물은 갤럽, 어느 쪽 예측이 맞았을까요?",
    options: ["㉠ 다이제스트 — 데이터가 50배 가까이 많으니 더 정확하다", "㉡ 갤럽 — 많이 묻는 것보다 누구에게 묻느냐가 중요하다", "㉢ 둘 다 비슷하게 맞혔다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 기술 발전의 흐름 + S자 곡선 */
  (function () {
    var canvas = $("b-scurve"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ti = 0, year = 10, okO = !!window.sthState("techOrder"), found = window.sthState("scv") || {}, quiz = !!window.sthState("scvQuiz");
    var STEPS = [
      "18세기 · 증기 기관 — 사람과 가축의 힘을 기계의 힘으로 바꿔 산업 혁명을 이끌었다",
      "19세기 · 전기의 활용 — 발전과 송전으로 조명·통신·온갖 기기를 쓸 수 있게 되었다",
      "20세기 중반 · 컴퓨터 — 복잡한 계산과 정보 처리를 자동화해 정보화 사회의 바탕이 되었다",
      "20세기 말 · 인터넷 — 전 세계가 연결되어 정보와 지식을 실시간으로 나누게 되었다",
      "21세기 · 인공지능(AI) — 방대한 데이터에서 스스로 학습하고 판단하는 기술이 생활 전반에 퍼지고 있다"
    ];
    function count() { var n = 0; for (var i = 0; i < 3; i++) if (found[i]) n++; return n; }
    /* 마을 40집 블록 모형 (집 1채 = 2.5%). 기술 시설(기지국·발전소·통신실)에서 가까운 집부터 받아들인다 */
    var ITW = K.iso({ ox: 250, oy: 118, s: .95, L: 300, D: 220 }), VH = [];
    (function () {
      var R = K.rng(1936), i, j;
      for (j = 0; j < 5; j++) for (i = 0; i < 8; i++) VH.push({ x: 14 + i * 35 + (j % 2) * 6, y: 14 + j * 41, r: R() });
      VH.forEach(function (h, k) { h.d = Math.sqrt(Math.pow(h.x - 140, 2) + Math.pow(h.y - 100, 2)) / 160 + h.r * .7; h.k = k; });
      var rank = VH.slice().sort(function (a, b) { return a.d - b.d; });
      rank.forEach(function (h, n) { h.n = n; });
    })();
    function techSite(ti2, col) {                            /* 마을 가운데 기술 시설 */
      var b = ITW.P(140, 100, 0);
      if (ti2 === 1) {                                       /* 전기: 변전소 */
        ITW.box(ctx, 128, 90, 0, 152, 110, 16, "#e9ecef", "#ced4da", "#adb5bd");
        for (var c2 = 0; c2 < 3; c2++) { var p0 = ITW.P(132 + c2 * 8, 98, 16), p1 = ITW.P(132 + c2 * 8, 98, 30); ctx.strokeStyle = "#868e96"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke(); K.planet(ctx, p1.x, p1.y, 2.6, "#ffe066", "#b08900"); }
      } else if (ti2 === 0) {                                /* 스마트폰: 기지국 */
        var top = ITW.P(140, 100, 70);
        ctx.strokeStyle = "#6b7484"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(b.x - 9, b.y); ctx.lineTo(top.x, top.y); ctx.lineTo(b.x + 9, b.y); ctx.moveTo(b.x - 5, b.y - 22); ctx.lineTo(b.x + 5, b.y - 22); ctx.moveTo(b.x - 3, b.y - 44); ctx.lineTo(b.x + 3, b.y - 44); ctx.stroke();
        ctx.strokeStyle = col; ctx.lineWidth = 1.6; for (var w2 = 1; w2 <= 3; w2++) { ctx.beginPath(); ctx.arc(top.x, top.y, w2 * 7, -2.4, -.7); ctx.stroke(); }
      } else {                                               /* 인터넷: 통신실과 접시 안테나 */
        ITW.box(ctx, 128, 90, 0, 152, 112, 22, "#e7f5ff", "#a5d8ff", "#74c0fc");
        var d0 = ITW.P(140, 100, 28); ctx.fillStyle = "#f1f3f5"; ctx.strokeStyle = "#868e96"; ctx.beginPath(); ctx.ellipse(d0.x, d0.y, 9, 5, -.5, 0, 6.2832); ctx.fill(); ctx.stroke();
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var k = M.TECH[ti].k, i, COLS = [LT.blue, LT.orange, LT.violet], SW = 600, pct = M.adopt(year, k);
      var phaseS = pct < 15 ? "초기 도입기" : pct < 50 ? "급속 확산기" : pct < 90 ? "성숙기" : "포화기";
      K.studio(ctx, 0, 0, SW, H, { x: 300, y: 372, rx: 270, ry: 26 });
      K.bigText(ctx, year + "년 뒤 · " + pct.toFixed(1) + "%", 18, 44, 26, "#ffffff");
      K.bigText(ctx, M.TECH[ti].n + "형 확산 모형 · " + phaseS, 18, 70, 15, "#ffd35a");
      /* 마을 블록 */
      var own = Math.round(pct / 2.5);
      ITW.box(ctx, 0, 0, -16, 300, 220, 0, "#a9d18e", "#8a6a48", "#6d523a");
      ITW.face(ctx, "front", function (Lw) { ctx.fillStyle = "#5a4433"; ctx.fillRect(0, -16, Lw, 6); });
      for (i = 0; i < 5; i++) ITW.box(ctx, 0, 34 + i * 41, 0, 300, 39 + i * 41, .5, "#e3d5bd", "#c9b99c", "#b0a084");
      var siteDone = false;
      VH.slice().sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); }).forEach(function (h) {
        var has = h.n < own;
        if (!siteDone && h.x + h.y > 250) { techSite(ti, COLS[ti]); siteDone = true; }
        if (ti === 1 && has) { var w0 = ITW.P(140, 100, 26), w1 = ITW.P(h.x + 10, h.y + 9, 22); ctx.strokeStyle = "rgba(60,60,70,.28)"; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(w0.x, w0.y); ctx.quadraticCurveTo((w0.x + w1.x) / 2, (w0.y + w1.y) / 2 + 6, w1.x, w1.y); ctx.stroke(); }
        ITW.house(ctx, h.x, h.y, 0, 20, 18, 13, has ? COLS[ti] : "#adb5bd");
        if (has) {
          var wp = ITW.P(h.x + 10, h.y + 18, 7); K.glow(ctx, wp.x, wp.y, 2.4, "rgba(255,236,150,.95)", 3);
          var ip = ITW.P(h.x + 10, h.y + 9, 30);
          if (ti === 0) { ctx.fillStyle = "#343a40"; ctx.fillRect(ip.x - 2.5, ip.y - 4, 5, 8); ctx.fillStyle = "#74c0fc"; ctx.fillRect(ip.x - 1.6, ip.y - 3, 3.2, 5.5); }
          else if (ti === 2) { ctx.strokeStyle = "#5f3dc4"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(ip.x, ip.y + 2, 3.5, -2.6, -.5); ctx.stroke(); ctx.beginPath(); ctx.arc(ip.x, ip.y + 2, 6, -2.6, -.5); ctx.stroke(); }
        }
      });
      var cp = ITW.P(140, 100, ti === 0 ? 70 : 28);
      lead(ctx, cp.x, cp.y, 470, 112, ["기지국", "변전소", "통신실"][ti] + " — 가까운 집부터", "#e8ecff", [0, SW]);
      K.pill(ctx, own + " / 40집 · " + phaseS, 300, 402, { s: 13, a: "center", c: "#ffe3a3", box: [0, SW] });
      K.warn(ctx, SW - 12, 26, "⚠ 집 1채 = 가구 2.5%", "right");
      /* 판정 카드: S자 곡선은 카드 안의 작은 그래프 */
      var CX = SW + 10, x0 = CX + 18, x1 = W - 18;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 40집 가운데 가진 집");
      lt(ctx, own + " / 40집", x0, 60, { s: 21, w: "900", c: COLS[ti] });
      var g = K.chart(ctx, { x: CX + 4, y: 72, w: W - CX - 12, h: 160, x0: 0, x1: 40, y0: 0, y1: 100, xt: 4, yt: 2, xf: function (q) { return q + "년"; }, yf: function (q) { return q + "%"; }, pl: 38, pb: 22, light: true });
      ldash(ctx, g.L, g.Y(90), g.R, g.Y(90), LT.orange, 1.4);
      lt(ctx, "90%", g.L + 4, g.Y(90) - 5, { s: 10.5, w: "900", c: LT.orange });
      M.TECH.forEach(function (t, j) { if (j === ti) return; var p = []; for (var q = 0; q <= 160; q++) p.push([q / 4, M.adopt(q / 4, t.k)]); K.plot(ctx, g, p, "rgba(20,40,90,.2)", { w: 1.4, glow: false }); });
      var pp = []; for (i = 0; i <= 160; i++) pp.push([i / 4, M.adopt(i / 4, k)]);
      K.plot(ctx, g, pp, COLS[ti], { w: 3, light: true });
      ldash(ctx, g.X(year), g.Y(pct), g.X(year), g.B, "rgba(20,40,90,.4)", 1.2, [3, 4]);
      K.planet(ctx, g.X(year), g.Y(pct), 5, "#ffffff", COLS[ti]);
      M.TECH.forEach(function (t, j) { K.row(ctx, t.n + "형 90% 도달", found[j] ? found[j] + "년" : "?", x0, x1, 258 + j * 24, j === ti ? COLS[j] : LT.ink); });
      K.tip(ctx, pct < 15 ? "소수만 먼저 가졌다" : (pct < 90 ? "가진 집과 못 가진 집이 갈린다" : "거의 모두 가졌다"), x0 - 4, 340, x1 - x0 + 4, pct >= 90 ? true : null);

      var phase = pct < 15 ? "초기 도입기(소수의 혁신 수용자만 사용)" : pct < 50 ? "급속 확산기(대중이 빠르게 받아들이는 단계)" : pct < 90 ? "성숙기(보급률 증가세가 둔화)" : "포화기(거의 모든 사람이 사용)";
      $("b-scurve-info").innerHTML = "<b>" + M.TECH[ti].n + "</b>형 기술은 도입 " + year + "년 뒤 보급률이 약 <b>" + pct.toFixed(1) + "%</b>, <b>" + phase + "</b>입니다. 새 기술은 처음에는 천천히, 어느 시점(변곡점)부터 폭발적으로, 그 뒤 다시 완만하게 퍼지는 <b>S자형(로지스틱) 곡선</b>을 그립니다. 전화는 1876년에 발명되었지만, 60년 뒤인 1936년에도 미국에서 전화가 있는 집은 절반이 되지 않았습니다.";
      if (!found[ti] && pct >= 90 && (year === 0 || M.adopt(year - 1, k) < 90)) { found[ti] = year; window.sthState("scv", found); mission(); }
    }
    function mission() {
      if (okO) done("m2-2a");
      put("b-scv-prog", "(" + count() + " / 3" + M.TECH.map(function (t, i) { return found[i] ? " · " + t.n + " " + found[i] + "년" : ""; }).join("") + ")");
      if (count() === 3) done("m2-2b");
      if (quiz) done("m2-2c");
      if (okO && count() === 3 && quiz) {
        window.sthMission("m2-2", true, "<span class='m-tag'>미션 완료</span>90%에 닿는 데 스마트폰형 " + found[0] + "년, 인터넷형 " + found[2] + "년, 전기형 " + found[1] + "년. 빠르든 느리든 모양은 S자이고, <b>곡선의 중간에서는 그 기술을 가진 사람과 못 가진 사람이 갈립니다.</b> 1936년의 전화가 바로 그랬습니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call($("b-tech").querySelectorAll("button"), function (b) {
      b.addEventListener("click", function () { ti = +b.getAttribute("data-i"); segOn($("b-tech"), b); draw(); });
    });
    $("b-year").addEventListener("input", function (e) { year = +e.target.value; $("b-year-val").textContent = year + "년"; draw(); });
    if (okO) {
      $("b-order").innerHTML = "<div class='order sort'><div class='slots'>" + STEPS.map(function (s) { return "<div class='slot filled'>" + s + "</div>"; }).join("") + "</div></div>";
    } else {
      window.sthOrder({ mount: "b-order", steps: STEPS, onDone: function () { okO = true; window.sthState("techOrder", 1); mission(); } });
    }
    window.sthPick({
      mount: "b-q1",
      q: "보급률이 아직 절반에 못 미치는 기술(1936년의 전화·자동차)의 사용자 명단에서 조사 대상을 뽑으면 어떤 일이 생길까요?",
      options: ["사용자가 수백만 명이나 되므로 전체 국민의 생각과 거의 같다", "새 기술을 먼저 받아들인 쪽(대체로 형편이 넉넉한 사람들)의 생각만 크게 반영된다", "기술과 정치적 의견은 아무 관계가 없으므로 문제없다", "명단이 길수록 치우침은 저절로 사라진다"],
      answer: 1,
      why: ["수가 많은 것과 전체를 닮은 것은 다른 문제입니다.", "S자 곡선의 앞부분에 올라탄 사람들은 전체의 축소판이 아닙니다. 대공황기에 전화·자동차를 가진 층은 루스벨트의 정책에 반대하는 쪽이 많았습니다.", "형편에 따라 기술을 가졌는지도, 지지하는 후보도 달랐습니다.", "다음 장면에서 직접 확인해 봅시다. 과연 그럴까요?"],
      onDone: function () { quiz = true; window.sthState("scvQuiz", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("m2-2", true);
  })();

  /* 장면 3 — 표본 뽑기 */
  (function () {
    var canvas = $("b-poll"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ni = 2, share = 90, dots = [], drop = 1, got = window.sthState("poll") || { a: false, b: false };

    function gauss() { var u = 0, w = 0; while (u === 0) u = Math.random(); while (w === 0) w = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w); }
    function sample(n, sh) {
      var nO = Math.round(n * sh / 100), nN = n - nO;
      function bin(m, p) {
        if (m === 0) return 0;
        if (m > 20000) return clamp(Math.round(m * p + gauss() * Math.sqrt(m * p * (1 - p))), 0, m);
        var s = 0; for (var i = 0; i < m; i++) if (Math.random() < p) s++; return s;
      }
      return (bin(nO, 0.40) + bin(nN, 0.72)) / n * 100;
    }
    /* 유권자 마을 블록(집 40채, ☎ 전화 보유 14채 = 35%) + 표본 구슬 항아리 */
    var IPL = K.iso({ ox: 196, oy: 132, s: .86, L: 280, D: 200 }), PH = [];
    (function () {
      var R = K.rng(1936), i, j, own = {};
      for (j = 0; j < 5; j++) for (i = 0; i < 8; i++) PH.push({ x: 12 + i * 33, y: 12 + j * 38, r: R() });
      PH.slice().sort(function (a, b) { return a.r - b.r; }).forEach(function (h, n) { h.own = n < 14; h.ord = n < 14 ? n : n - 14; });
    })();
    function XP(p) { return 648 + (p - 30) / 50 * 230; }        /* 카드 안 예측 띠: 30%~80% */
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var n = M.NS[ni], r = M.poll(n, share), SW = 620, good = Math.abs(r.bias) <= 2 && r.moe <= 1, i;
      K.studio(ctx, 0, 0, SW, H, { x: 320, y: 404, rx: 290, ry: 26 });
      var lastD = dots.length ? dots[dots.length - 1] : null;
      K.bigText(ctx, lastD === null ? "표본 " + fmt(n) + "명" : "예측 " + lastD.toFixed(1) + "% (실제 60.8%)", 18, 44, 24, "#ffffff");
      K.bigText(ctx, "치우침 " + (r.bias >= 0 ? "+" : "−") + Math.abs(r.bias).toFixed(1) + "%p · 오차 범위 ±" + (r.moe < 0.1 ? r.moe.toFixed(2) : r.moe.toFixed(1)) + "%p", 18, 70, 15, "#ffd35a");
      /* 마을: 보유층 집 = 보라 지붕 + 전화선, 엽서를 받은 집 = 엽서가 떠 있음 */
      var env = 4 + ni * 2, eO = Math.min(14, Math.round(env * share / 100)), eN = Math.min(26, env - eO);
      IPL.box(ctx, 0, 0, -14, 280, 200, 0, "#b5d99c", "#8a6a48", "#6d523a");
      for (i = 0; i < 5; i++) IPL.box(ctx, 0, 33 + i * 38, 0, 280, 37 + i * 38, .5, "#e3d5bd", "#c9b99c", "#b0a084");
      PH.slice().sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); }).forEach(function (h) {
        var pick = h.own ? h.ord < eO : h.ord < eN;
        if (pick) { var gp = IPL.P(h.x + 10, h.y + 8, 0); ctx.fillStyle = "rgba(255,212,59,.55)"; ctx.beginPath(); ctx.ellipse(gp.x, gp.y, 17, 9, 0, 0, 6.2832); ctx.fill(); }
        IPL.house(ctx, h.x, h.y, 0, 20, 17, 12, h.own ? "#7048e8" : "#0c8599");
        if (h.own) {                                         /* 집 옆 전화주와 짧은 전화선 */
          var pa = IPL.P(h.x + 26, h.y + 4, 0), pt2 = IPL.P(h.x + 26, h.y + 4, 30), wq = IPL.P(h.x + 18, h.y + 8, 17);
          ctx.strokeStyle = "#6b4a2e"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pt2.x, pt2.y); ctx.stroke();
          ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(pt2.x - 4, pt2.y + 2); ctx.lineTo(pt2.x + 4, pt2.y + 2); ctx.stroke();
          ctx.strokeStyle = "rgba(40,40,60,.6)"; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(pt2.x, pt2.y + 2); ctx.quadraticCurveTo((pt2.x + wq.x) / 2, (pt2.y + wq.y) / 2 + 4, wq.x, wq.y); ctx.stroke();
        }
        if (pick) { var ep2 = IPL.P(h.x + 10, h.y + 8, 40); ctx.fillStyle = "#fffdf5"; ctx.strokeStyle = "#b08900"; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(ep2.x - 7, ep2.y - 5, 14, 10); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ep2.x - 7, ep2.y - 5); ctx.lineTo(ep2.x, ep2.y + 1); ctx.lineTo(ep2.x + 7, ep2.y - 5); ctx.stroke(); ctx.fillStyle = "#e03131"; ctx.fillRect(ep2.x + 3, ep2.y + 1, 3, 3); }
      });
      K.pill(ctx, "실제 유권자 마을 · ☎ 보유 35%", 196, 372, { s: 12, a: "center", c: "#e8ecff", box: [0, 400] });
      K.pill(ctx, "✉ 엽서를 받은 집 = 표본", 196, 398, { s: 12, a: "center", c: "#ffe066", box: [0, 400] });
      /* 표본 구슬 항아리 (유리, 입체) */
      var jx = 512, jt = 132, jb = 352, jw = 78, nM = 77, nP = Math.round(share / 100 * nM), m2;
      floorShadow(ctx, jx + 10, jb + 10, 100, 14, .26);
      var back = ctx.createLinearGradient(jx - jw, 0, jx + jw, 0); back.addColorStop(0, "rgba(210,225,240,.35)"); back.addColorStop(1, "rgba(160,180,205,.35)");
      ctx.fillStyle = back; ctx.beginPath(); ctx.ellipse(jx, jb, jw, 14, 0, 0, 6.2832); ctx.fill();
      var RR = K.rng(36), order = [];
      for (m2 = 0; m2 < nM; m2++) order.push({ k: m2, r: RR() });
      order.sort(function (a, b) { return a.r - b.r; }).forEach(function (o, idx) { o.pur = idx < nP; });
      order.sort(function (a, b) { return a.k - b.k; });
      for (m2 = 0; m2 < nM; m2++) {
        var row = Math.floor(m2 / 11), colm = m2 % 11, mx = jx - jw + 13 + colm * 12.8 + (row % 2) * 5, my = jb - 9 - row * 13 + ((colm % 2) ? 2 : 0);
        K.planet(ctx, mx, my, 6.8, order[m2].pur ? "#b197fc" : "#66d9e8", order[m2].pur ? "#4c2a9e" : "#0b6e7a");
      }
      var gl = ctx.createLinearGradient(jx - jw, 0, jx + jw, 0); gl.addColorStop(0, "rgba(255,255,255,.6)"); gl.addColorStop(.22, "rgba(255,255,255,.12)"); gl.addColorStop(.8, "rgba(255,255,255,.06)"); gl.addColorStop(1, "rgba(200,215,235,.55)");
      ctx.fillStyle = gl; ctx.strokeStyle = "rgba(90,110,140,.75)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(jx - jw + 14, jt); ctx.quadraticCurveTo(jx - jw, jt + 8, jx - jw, jt + 30); ctx.lineTo(jx - jw, jb); ctx.ellipse(jx, jb, jw, 14, 0, Math.PI, 0, true); ctx.lineTo(jx + jw, jt + 30); ctx.quadraticCurveTo(jx + jw, jt + 8, jx + jw - 14, jt); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.roundRect(jx - jw + 8, jt + 34, 7, jb - jt - 60, 4); ctx.fill();
      var lid = ctx.createLinearGradient(0, jt - 18, 0, jt + 2); lid.addColorStop(0, "#d0d6de"); lid.addColorStop(1, "#8f99a6");
      ctx.fillStyle = lid; ctx.beginPath(); ctx.ellipse(jx, jt - 2, jw - 10, 9, 0, 0, 6.2832); ctx.fill();
      ctx.fillRect(jx - jw + 10, jt - 14, (jw - 10) * 2, 12); ctx.fillStyle = "#e9edf2"; ctx.beginPath(); ctx.ellipse(jx, jt - 14, jw - 10, 9, 0, 0, 6.2832); ctx.fill();
      K.pill(ctx, "표본 항아리 · 보라 " + share + "%", jx, jb + 36, { s: 12, a: "center", c: "#d0bfff", box: [400, SW] });
      K.pill(ctx, "보라 = ☎ 보유층 · 청록 = 비보유층", jx, jt - 34, { s: 11.5, a: "center", c: "#e8ecff", box: [400, SW] });
      K.warn(ctx, SW - 12, 26, "⚠ 집·구슬 수는 비율만 맞춤", "right");
      /* 판정 카드: 예측 띠는 카드 안에 작게 */
      var CX = SW + 10, x0 = CX + 18, x1 = W - 18;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 내 조사의 예측");
      K.row(ctx, "표본 크기", fmt(n) + "명", x0, x1, 60);
      K.row(ctx, "보유층 비율", share + "% (실제 35%)", x0, x1, 84, LT.violet);
      K.row(ctx, "치우침", (r.bias >= 0 ? "+" : "−") + Math.abs(r.bias).toFixed(1) + "%p", x0, x1, 108, Math.abs(r.bias) <= 2 ? LT.green : LT.red);
      K.row(ctx, "오차 범위", "±" + (r.moe < 0.1 ? r.moe.toFixed(2) : r.moe.toFixed(1)) + "%p", x0, x1, 132, r.moe <= 1 ? LT.green : LT.orange);
      var ay = 262;
      lt(ctx, "루스벨트 지지율 예측", x0, 166, { s: 12, w: "800" });
      ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(XP(30), 180, XP(80) - XP(30), ay - 180);
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(XP(30), ay); ctx.lineTo(XP(80), ay); ctx.stroke();
      for (var p = 30; p <= 80; p += 10) { ctx.beginPath(); ctx.moveTo(XP(p), ay - 4); ctx.lineTo(XP(p), ay + 4); ctx.stroke(); lt(ctx, p + "", XP(p), ay + 18, { s: 10.5, c: LT.mute, a: "center" }); }
      ldash(ctx, XP(50), 182, XP(50), ay, "rgba(20,40,90,.45)", 1.3, [4, 4]);
      lt(ctx, "50% 당선선", XP(50), ay + 34, { s: 10.5, c: LT.mute, a: "center" });
      var bx0 = XP(clamp(r.exp - r.moe, 30, 80)), bx1 = XP(clamp(r.exp + r.moe, 30, 80));
      ctx.fillStyle = "rgba(28,126,214,.18)"; ctx.fillRect(bx0, 196, Math.max(3, bx1 - bx0), ay - 196);
      ctx.strokeStyle = "rgba(28,126,214,.6)"; ctx.lineWidth = 1; ctx.strokeRect(bx0, 196, Math.max(3, bx1 - bx0), ay - 196);
      ctx.strokeStyle = LT.green; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(XP(M.TRUE), 182); ctx.lineTo(XP(M.TRUE), ay); ctx.stroke();
      lt(ctx, "실제 60.8%", XP(M.TRUE) + 4, 194, { s: 10.5, w: "900", c: LT.green });
      dots.forEach(function (d, k2) {
        var last = k2 === dots.length - 1, yy = ay - 12 - (k2 % 5) * 9;
        if (last && drop < 1) yy = 150 + (yy - 150) * (1 - Math.pow(1 - drop, 3));
        ctx.save(); ctx.globalAlpha = last ? 1 : .6; K.planet(ctx, XP(clamp(d, 30, 80)), yy, last ? 5 : 4, "#ff8fab", "#a61e4d"); ctx.restore();
      });
      lt(ctx, "파란 띠 = 이 조건의 예측 범위", x0, 318, { s: 11, w: "700", c: LT.blue });
      lt(ctx, "● 뽑을 때마다 나온 예측", x0, 338, { s: 11, w: "700", c: "#a61e4d" });
      K.tip(ctx, good ? "구성도 크기도 알맞다" : (Math.abs(r.bias) > 2 ? "표본이 한쪽으로 치우쳤다" : "표본이 작아 흔들린다"), x0 - 4, 360, x1 - x0 + 4, good);
    }
    function mission() {
      if (got.a) done("m2-3a"); if (got.b) done("m2-3b");
      if (got.a && got.b) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>내 설계: <b>" + (window.sthState("pollBest") || "-") + "</b>. 표본을 키우면 <b>오차 범위</b>는 줄지만 <b>치우침</b>은 그대로입니다. 240만 명은 ‘틀린 답을 아주 정밀하게’ 맞혔을 뿐입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    K.animate(canvas, function (dt) { if (drop < 1) { drop = Math.min(1, drop + dt / 450); draw(); } });
    $("b-poll-n").addEventListener("input", function (e) { ni = +e.target.value; $("b-poll-n-val").textContent = fmt(M.NS[ni]) + "명"; dots = []; draw(); });
    $("b-poll-s").addEventListener("input", function (e) { share = +e.target.value; $("b-poll-s-val").textContent = share + "%"; dots = []; draw(); });
    $("b-poll-clear").addEventListener("click", function () { dots = []; draw(); $("b-poll-info").innerHTML = "기록을 지웠습니다."; });
    $("b-poll-run").addEventListener("click", function () {
      var n = M.NS[ni], r = M.poll(n, share), est = sample(n, share);
      dots.push(est); if (dots.length > 15) dots.shift(); drop = REDUCE ? 1 : 0;
      draw();
      var msg = "표본 <b>" + fmt(n) + "명</b>(보유층 " + share + "%) → 루스벨트 <b>" + est.toFixed(1) + "%</b> 예측 (실제 60.8%, 차이 " + Math.abs(est - M.TRUE).toFixed(1) + "%p). ";
      if (Math.abs(r.bias) > 2 && r.moe <= 1) msg += "여러 번 뽑아도 점이 거의 한자리에 찍힙니다. 아주 ‘정밀’하지만 <b>과녁이 아닌 곳</b>에 모여 있습니다." + (est < 50 ? " 이 조사는 루스벨트의 <b>낙선</b>을 예측합니다!" : "");
      else if (Math.abs(r.bias) > 2) msg += "치우친 데다 뽑을 때마다 흔들리기까지 합니다.";
      else if (r.moe > 1) msg += "치우침은 작지만 표본이 적어 뽑을 때마다 ±" + r.moe.toFixed(1) + "%p쯤 흔들립니다. 몇 번 더 뽑아 보세요.";
      else msg += "✅ 치우침도 작고 흔들림도 작습니다. 표본의 구성이 전체 유권자를 닮았기 때문입니다.";
      $("b-poll-info").innerHTML = msg;
      var ch = false;
      if (!got.a && share >= 85 && n === 2400000) { got.a = ch = true; }
      if (n <= 50000 && Math.abs(r.bias) <= 2 && r.moe <= 1) {
        window.sthState("pollBest", "표본 " + fmt(n) + "명·보유층 " + share + "% → " + est.toFixed(1) + "% 예측");
        if (!got.b) { got.b = ch = true; }
      }
      if (ch) { window.sthState("poll", got); mission(); }
    });
    draw(); mission();
    if (ep.cleared(2)) window.sthMission("m2-3", true);
  })();

  /* 장면 4 — 빅데이터 활용 단계 */
  (function () {
    var okS = !!window.sthState("bdSort"), okQ = !!window.sthState("bdQuiz");
    function mission() {
      if (okS) done("m2-4a"); if (okQ) done("m2-4b");
      if (okS && okQ) { window.sthMission("m2-4", true, "<span class='m-tag'>미션 완료</span>수집 → 저장·정리 → 분석 → 활용. 다이제스트의 실패는 맨 앞 <b>수집 단계</b>에서 이미 정해졌습니다. 첫 단계가 치우치면 뒤 단계가 아무리 뛰어나도 소용없습니다."); ep.clear(3); }
    }
    if (okS) {
      $("b-sort1").innerHTML = "<div class='sort'><div class='msg'>🎉 업무 기록 8건을 수집 → 저장·정리 → 분석 → 활용 단계로 모두 분류했습니다.</div></div>";
    } else {
      window.sthSort({
        mount: "b-sort1",
        buckets: [
          { id: "c", label: "📥 수집", sub: "여러 경로에서 데이터를 모은다" },
          { id: "s", label: "🗂️ 저장·정리", sub: "분석할 수 있는 형태로 만든다" },
          { id: "a", label: "🔍 분석", sub: "규칙과 패턴을 찾아낸다" },
          { id: "u", label: "💡 활용", sub: "예측하고 결정한다" }
        ],
        items: [
          { t: "센서, SNS, 거래 기록 등 다양한 경로에서 방대한 데이터를 모은다", a: "c", why: "수집 단계입니다." },
          { t: "전국 기상 관측소와 위성이 기온·습도·구름 자료를 시시각각 보내온다", a: "c", why: "데이터가 들어오는 수집 단계입니다." },
          { t: "쇼핑몰 서버에 쌓인 구매 기록 원본을 데이터베이스에 옮겨 정리한다", a: "s", why: "저장·정리 단계입니다." },
          { t: "중복되거나 빠진 값을 걸러 내고 형식을 하나로 맞춘다", a: "s", why: "분석하기 좋은 형태로 다듬는 저장·정리 단계입니다.", hint: "아직 규칙을 찾는 것은 아닙니다." },
          { t: "통계와 인공지능 기법으로 데이터 속 규칙과 패턴을 찾아낸다", a: "a", why: "분석 단계입니다." },
          { t: "해열제 판매량과 검색어 변화가 환자 수와 함께 움직이는지 계산한다", a: "a", why: "데이터 사이의 관계를 찾는 분석 단계입니다.", hint: "결정을 내린 것은 아니고, 관계를 찾고 있습니다." },
          { t: "감염병이 번질 지역을 예측해 방역 인력과 물자를 미리 배치한다", a: "u", why: "분석 결과로 의사 결정을 하는 활용 단계입니다." },
          { t: "고객이 좋아할 만한 상품을 첫 화면에 추천한다", a: "u", why: "분석 결과를 서비스에 쓰는 활용 단계입니다." }
        ],
        onDone: function () { okS = true; window.sthState("bdSort", 1); mission(); }
      });
    }
    window.sthPick({
      mount: "b-q2",
      q: "다음 중 빅데이터를 활용한 사례로 보기 어려운 것은?",
      options: ["수많은 관측 자료를 모아 동네 단위로 날씨를 예보한다", "심야 시간대의 휴대 전화 통화량 수십억 건을 분석해 심야 버스 노선을 정한다", "친구 세 명에게 물어보고 우리 학교 학생 전체의 의견이라고 발표한다", "이동 통신 기록과 검사 결과를 종합해 감염병의 확산 경로를 추정한다"],
      answer: 2,
      why: ["대표적인 빅데이터 활용 사례(정밀 기상 예보)입니다.", "서울시의 심야 버스 노선이 실제로 이렇게 정해졌습니다. 빅데이터 활용 사례입니다.", "양도 적고, 모은 길목도 치우쳐 있습니다. 크기와 상관없이 ‘누구에게서 모았나’는 늘 따져야 합니다.", "감염병 추적은 빅데이터가 쓰이는 대표적인 분야입니다. 다만 개인 정보 문제가 따라옵니다."],
      onDone: function () { okQ = true; window.sthState("bdQuiz", 1); mission(); }
    });
    mission();
    if (ep.cleared(3)) window.sthMission("m2-4", true);
  })();

  /* 장면 5 — 익명 데이터의 재식별 */
  (function () {
    var canvas = $("b-priv"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var lv = { loc: 0, bir: 0, sex: 0 }, got = window.sthState("priv") || { a: false, b: false };
    var NAMES = { loc: ["", "구", "동"], bir: ["", "출생 연도", "생년월일"], sex: ["", "성별"] };
    var IPV = K.iso({ ox: 222, oy: 116, s: .8, L: 400, D: 250 });

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = M.priv(lv.loc, lv.bir, lv.sex), i, SW = 610;
      var shownL = [NAMES.loc[lv.loc], NAMES.bir[lv.bir], NAMES.sex[lv.sex]].filter(function (s) { return s; });
      K.studio(ctx, 0, 0, SW, H, { x: 280, y: 392, rx: 270, ry: 24 });
      K.bigText(ctx, "단 한 명으로 특정 " + r.uniq.toFixed(1) + "%", 18, 44, 25, r.uniq > 1 ? "#ffc9c9" : "#8ff5cf");
      K.bigText(ctx, "공개: " + (shownL.length ? shownL.join(" · ") + " + 병명" : "병명만"), 18, 70, 15, "#ffd35a");
      /* 동네 블록: 40개 동 칸(8 × 5), 한 줄 = 한 구. 주민 400명(2,000명 가운데 앞 400명)을 자기 동 칸에 세운다 */
      var GU = ["#cfe8c0", "#f3e3b5", "#d7e3f4", "#f2d3d8", "#e2d8f2"];
      IPV.box(ctx, 0, 0, -12, 400, 250, 0, "#e6e0d4", "#a89a84", "#8a7d69");
      for (i = 0; i < 40; i++) {
        var cI = i % 8, rI = Math.floor(i / 8), px0 = cI * 50, py0 = rI * 50;
        IPV.plane(ctx, 0.2, lv.loc >= 1 ? GU[rI] : "#ece6da", lv.loc === 2 ? "rgba(110,90,60,.55)" : null, px0 + 1.5, px0 + 48.5, py0 + 1.5, py0 + 48.5);
      }
      var folks = [], cntD = {};
      for (i = 0; i < 400; i++) {
        var pp = M.people[i], j = cntD[pp.dong] || 0; cntD[pp.dong] = j + 1;
        folks.push({ x: (pp.dong % 8) * 50 + 6 + (j % 5) * 9.5, y: Math.floor(pp.dong / 8) * 50 + 8 + Math.floor(j / 5) * 10, z: r.sizes[i], sx: pp.sex });
      }
      folks.sort(function (a, b) { return (a.x + a.y) - (b.x + b.y); }).forEach(function (f) {
        var q = IPV.P(f.x, f.y, 0);
        if (f.z === 1) {
          var sg = ctx.createLinearGradient(0, q.y - 36, 0, q.y); sg.addColorStop(0, "rgba(255,90,90,0)"); sg.addColorStop(1, "rgba(255,90,90,.2)");
          ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(q.x - 1.5, q.y - 36); ctx.lineTo(q.x + 1.5, q.y - 36); ctx.lineTo(q.x + 5, q.y); ctx.lineTo(q.x - 5, q.y); ctx.closePath(); ctx.fill();
          IPV.box(ctx, f.x - 3, f.y - 3, 0, f.x + 3, f.y + 3, 5, "#ffffff", "#dee2e6", "#adb5bd");
          IPV.person(ctx, f.x, f.y, 5, "#e03131", 1.25);
        } else if (f.z < 5) IPV.person(ctx, f.x, f.y, 0, "#f08c00", 1.05);
        else { ctx.save(); ctx.globalAlpha = .75; IPV.person(ctx, f.x, f.y, 0, "#3bc9db", .95); ctx.restore(); }
      });
      if (lv.loc >= 1) { var gq = IPV.P(400, 25, 0); lead(ctx, gq.x, gq.y, 560, 150, lv.loc === 2 ? "칸 = 동 · 줄 = 구" : "줄(색) = 구", "#e8ecff", [0, SW]); }
      K.pill(ctx, "사람 모형 = 주민 한 명 (가상 2,000명 중 400명)", 300, H - 12, { s: 12, a: "center", c: "#e8ecff", box: [0, SW] });
      var CX = SW + 10, x0 = CX + 18, x1 = W - 18, okB = r.util >= 3 && r.uniq <= 1;
      K.card(ctx, CX, 0, W - CX, H, "판정 · 쓸모와 안전의 균형");
      lt(ctx, okB ? "균형을 찾았다" : (r.util < 3 ? "정보가 모자람" : "개인이 드러남"), x0, 62, { s: 21, w: "900", c: okB ? LT.green : (r.util < 3 ? LT.orange : LT.red) });
      K.row(ctx, "단 한 명으로 특정", r.uniq.toFixed(1) + "%", x0, x1, 98, r.uniq > 1 ? LT.red : LT.green);
      K.row(ctx, "5명 미만으로 좁혀짐", r.small.toFixed(1) + "%", x0, x1, 124, LT.orange);
      K.row(ctx, "정보량 (3점 이상 필요)", r.util + "점 / 5점", x0, x1, 150, r.util >= 3 ? LT.green : LT.ink);
      K.bar(ctx, x0, 160, x1 - x0, r.util / 5, r.util >= 3 ? LT.green : LT.orange);
      lt(ctx, "● 단 한 명(특정됨)", x0, 204, { s: 12, w: "800", c: LT.red });
      lt(ctx, "● 2~4명 가운데 하나", x0, 228, { s: 12, w: "800", c: "#d9480f" });
      lt(ctx, "● 5명 이상 속에 숨음", x0, 252, { s: 12, w: "800", c: LT.teal });
      K.tip(ctx, okB ? "분석은 되고 개인은 숨는다" : (r.util < 3 ? "덜 감추면 쓸모가 생긴다" : "덜 자세하게 공개해 보세요"), x0 - 4, 276, x1 - x0 + 4, okB);

      var shown = [NAMES.loc[lv.loc], NAMES.bir[lv.bir], NAMES.sex[lv.sex]].filter(function (s) { return s; });
      var okB = r.util >= 3 && r.uniq <= 1;
      $("b-priv-read").innerHTML = "<span class='k'>단 한 명으로 특정</span><span class='v r'>" + r.uniq.toFixed(1) + "%</span>" +
        "<span class='sub'>5명 미만으로 좁혀지는 사람 " + r.small.toFixed(1) + "%</span>" +
        "<span class='k'>정보량</span><span class='v b'>" + r.util + "점 / 5점</span>" +
        "<span class='ok " + (okB ? "g" : "r") + "'>" + (okB ? "쓸모와 안전의 균형" : (r.util < 3 ? "연구에 쓰기에 정보가 모자람(3점 이상)" : "개인이 드러납니다(1% 이하로)")) + "</span>";
      $("b-priv-info").innerHTML = "공개 항목: <b>" + (shown.length ? shown.join(" · ") + " + 병명" : "병명만") + "</b> (정보량 " + r.util + "점) → 단 한 명으로 특정되는 사람 <b>" + r.uniq.toFixed(1) + "%</b>, 5명 미만으로 좁혀지는 사람 " + r.small.toFixed(1) + "%<br>" +
        (r.util === 0 ? "아무도 특정되지 않지만, 지역별·나이별 분석을 전혀 할 수 없어 연구에는 거의 쓸모가 없습니다." :
         (r.uniq > 50 ? "이름을 지워도 소용없습니다. 누군가 이웃의 사는 곳·생일·성별만 알면, 이 표에서 그 사람의 <b>병명</b>을 찾아낼 수 있습니다. 여러 정보가 <b>결합</b>되면 개인이 드러납니다." :
          (okB ? "✅ 지역별·나이대별 분석은 할 수 있으면서 개인은 무리 속에 숨습니다. 덜 자세하게 공개하는 것만으로도 위험이 크게 줄어듭니다." :
           (r.util < 3 ? "안전하지만 연구에 쓰기에는 정보가 모자랍니다(3점 이상 필요)." : "아직 " + fmt(r.uniq * 20) + "명이 단 한 명으로 특정됩니다. 어느 항목을 덜 자세하게 바꾸면 좋을까요?"))));
      var ch = false;
      if (!got.a && lv.loc === 2 && lv.bir === 2 && lv.sex === 1) { got.a = ch = true; window.sthState("privAll", r.uniq.toFixed(1)); }
      if (okB) { window.sthState("privBest", shown.join("·") + " 공개 → 특정 " + r.uniq.toFixed(1) + "%"); if (!got.b) { got.b = ch = true; } }
      if (ch) { window.sthState("priv", got); mission(); }
    }
    function mission() {
      if (got.a) { done("m2-5a"); put("m2-5a", "동·생년월일·성별을 모두 공개하면 <b>" + (window.sthState("privAll") || "-") + "%</b>가 단 한 명으로 특정됩니다."); }
      if (got.b) done("m2-5b");
      if (got.a && got.b) {
        window.sthMission("m2-5", true, "<span class='m-tag'>미션 완료</span>내 공개 설계: <b>" + (window.sthState("privBest") || "-") + "</b>. 너무 자세하면 개인이 드러나고, 너무 감추면 쓸모가 없습니다. 빅데이터 활용에는 이런 <b>균형을 잡는 규칙</b>(가명 처리, 개인 정보 보호 제도)이 함께 필요합니다.");
        ep.clear(4);
      }
    }
    canvas._redraw = draw;
    [["b-pv-loc", "loc"], ["b-pv-bir", "bir"], ["b-pv-sex", "sex"]].forEach(function (p) {
      Array.prototype.forEach.call($(p[0]).querySelectorAll("button"), function (b) {
        b.addEventListener("click", function () { lv[p[1]] = +b.getAttribute("data-l"); segOn($(p[0]), b); draw(); });
      });
    });
    draw(); mission();
    if (ep.cleared(4)) window.sthMission("m2-5", true);
  })();

  /* 장면 6 — 결말 */
  function reveal() {
    $("e2-wrap").hidden = false;
    var p = window.sthState("p2") || "";
    $("e2-vs").innerHTML = "<b>나의 첫 예상</b> " + (p || "기록 없음") + (p.indexOf("㉡") === 0 ? " — 맞았습니다. 이제 그 까닭을 숫자로 설명할 수 있습니다." : " — 실제로는 5만 명의 갤럽이 맞혔습니다. 크기보다 ‘누구에게서 모았나’가 먼저였습니다.") +
      "<br><b>나의 조사 설계</b> " + (window.sthState("pollBest") || "-") + "<br><b>나의 공개 설계</b> " + (window.sthState("privBest") || "-");
  }
  function finish() { window.sthState("r2", "해결 · " + (window.sthState("pollBest") || "-") + " / " + (window.sthState("privBest") || "-")); }
  window.sthSort({
    mount: "b-sort2",
    buckets: [{ id: "g", label: "👍 장점", sub: "빅데이터라서 할 수 있게 된 일" }, { id: "b", label: "⚠️ 문제점", sub: "함께 따라오는 위험" }],
    items: [
      { t: "감염병이 번질 지역을 미리 예측해 방역 자원을 제때 보낸다", a: "g", why: "빠르고 정확한 예측은 빅데이터의 대표적인 장점입니다." },
      { t: "사람이 일일이 볼 수 없는 방대한 자료에서 숨은 규칙을 찾아낸다", a: "g", why: "새로운 정보와 지식을 산출할 수 있습니다." },
      { t: "개인의 취향과 건강 상태에 맞춘 추천·의료 서비스를 받는다", a: "g", why: "맞춤형 서비스가 가능해집니다." },
      { t: "경험과 감이 아니라 근거 자료를 바탕으로 정책을 결정한다", a: "g", why: "합리적인 의사 결정을 돕습니다." },
      { t: "이름을 지운 자료도 다른 정보와 결합하면 누구인지 드러난다", a: "b", why: "개인 정보 침해 문제입니다. 방금 직접 확인했습니다.", hint: "익명 데이터 장면을 떠올려 보세요." },
      { t: "특정 집단에 치우쳐 모인 데이터로 전체에 대한 잘못된 결론을 낸다", a: "b", why: "편향된 데이터의 문제입니다. 240만 장의 엽서가 그랬습니다." },
      { t: "치우친 데이터로 학습한 인공지능이 특정 사람들에게 불리한 판단을 되풀이한다", a: "b", why: "데이터의 편향은 그것을 학습한 인공지능에도 그대로 옮겨 갑니다." },
      { t: "내 위치와 검색·구매 기록이 나도 모르게 수집되어 이용된다", a: "b", why: "사생활 침해와 정보 오남용의 위험입니다." }
    ],
    onDone: function () { reveal(); ep.clear(5); }
  });
  if (ep.cleared(5)) reveal();
  ep.onShow(function (i) { if (i === 5 && ep.cleared(5)) reveal(); });
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학2 Ⅲ-1] 이야기 ② 240만 장의 엽서",
    items: [
      { id: "w2", label: "데이터가 거짓말할 때", hint: "같은 데이터로 다른 결론이 나올 수 있는 경우를 하나 들어 보세요. (예: 누구에게서 모은 데이터인가에 따라, 양성 결과를 어떤 집단에서 얻었는가에 따라)" },
      { id: "e2b", label: "빅데이터 활용 사례 하나의 장점과 문제점", hint: "내가 조사한(또는 날마다 쓰는) 빅데이터 활용 사례 하나를 골라, 장점 한 가지와 문제점 한 가지, 그 문제점을 줄일 방법을 쓰세요." }
    ]
  });
})();

/* ========================================================================= 03 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학2 Ⅲ-1] 과학 기술의 활용 — 정리",
  recap: [
    { key: "r1", label: "① 펌프의 손잡이를 떼어라" },
    { key: "r2", label: "② 240만 장의 엽서" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "두 사건을 꿰는 한 문장", hint: "스노의 지도와 다이제스트의 엽서. 하나는 데이터로 도시를 구했고 하나는 데이터로 망신을 당했습니다. 둘의 차이를 ‘데이터’와 ‘과학’이라는 말을 넣어 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 04 우리 반 */
window.sthShare({
  mount: "share", unit: "is2-3-1", unitLabel: "[통합과학2 Ⅲ-1] 과학 기술의 활용",
  rows: [
    { key: "r1", label: "① 펌프의 손잡이를 떼어라" },
    { key: "r2", label: "② 240만 장의 엽서" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "두 사건을 꿰는 한 문장" }
});

})();
