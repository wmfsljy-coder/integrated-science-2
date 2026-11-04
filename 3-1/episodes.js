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
      var y0 = DH + 8, h = H - y0, i;
      ctx.clearRect(0, y0 - 4, W, h + 4);
      K.stage(ctx, 0, y0, W, h, "lab", { seed: 18 });
      K.pill(ctx, "1854년 소호 · 펌프별 집 100채당 사망자 (조사한 펌프만 나타납니다)", 14, y0 + 24, { s: 12, c: KC.blue });
      var mx = 0; data.stats.forEach(function (s) { mx = Math.max(mx, s.rate); }); mx = mx * 1.08 || 1;
      for (i = 0; i < 5; i++) {
        var yy = y0 + 46 + i * 22, s = data.stats[i];
        K.t(ctx, M.PUMPS[i].n, 20, yy + 11, { s: 12, w: "800", c: sel === i ? KC.blue : KC.ink });
        track(ctx, 100, yy, 470, 14, 5);
        if (seen[i]) {
          gbar(ctx, 100, yy, 470 * s.rate / mx, 14, s.rate >= 50 ? "#ff8a9a" : "#7fd3ff", s.rate >= 50 ? KC.red : KC.blue, 5, 8);
          K.t(ctx, s.rate.toFixed(0) + "명 (" + s.h + "채 · " + s.d + "명)", 100 + 470 * s.rate / mx + 8, yy + 11, { s: 11.5, w: "800", c: s.rate >= 50 ? KC.red : KC.ink });
        } else K.t(ctx, "?  아직 조사하지 않음", 108, yy + 11, { s: 11, c: KC.mute });
      }
      var n = 0; for (i = 0; i < 5; i++) if (seen[i]) n++;
      K.t(ctx, "조사한 펌프", 720, y0 + 58, { s: 12, c: KC.mute });
      K.t(ctx, n + " / 5", 720, y0 + 92, { s: 28, w: "900", c: n === 5 ? KC.green : KC.yellow });
      K.t(ctx, hit ? "브로드가 손잡이 제거" : "손잡이: 모두 그대로", 720, y0 + 124, { s: 12.5, w: "800", c: hit ? KC.red : KC.ink });
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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var ct = M.pcrCt(x), now = M.pcrN(x, c), over = now >= 0.1 * M.P, i;
      K.stage(ctx, 0, 0, 640, H, "lab", { seed: 31, title: "PCR · 주기마다 2배로 불어나는 유전자" });
      var g = K.chart(ctx, { x: 10, y: 40, w: 620, h: 274, x0: 0, x1: 45, y0: 0, y1: 1, xt: 9, yt: 4, xl: "증폭 주기 수", yl: "형광 신호(유전자 양)", yf: function () { return ""; }, pl: 30 });
      /* 기준선 */
      hline(ctx, g.L, g.R, g.Y(0.1), KC.yellow, [6, 5]);
      K.pill(ctx, "검출 기준선", g.R - 4, g.Y(0.1) - 8, { s: 10.5, a: "right", c: KC.yellow });
      /* 전체 곡선(옅게) + 진행한 데까지(빛나게) */
      var all = [], upto = [];
      for (i = 0; i <= 180; i++) { var cc = i / 4; all.push([cc, M.pcrN(x, cc) / M.P]); if (cc <= c) upto.push([cc, M.pcrN(x, cc) / M.P]); }
      K.plot(ctx, g, all, "rgba(200,210,255,.28)", { w: 2, glow: false });
      K.plot(ctx, g, upto, KC.green, { w: 3.2 });
      if (ct !== null && c >= ct) {
        vline(ctx, g.X(ct), g.T, g.B, KC.blue);
        K.pill(ctx, "Ct = " + ct, g.X(ct) + 8, g.T + 16, { s: 13, c: KC.blue, box: [0, 640] });
      }
      K.glow(ctx, g.X(c), g.Y(now / M.P), 4.5, "rgba(63,211,163,.95)", 3.6);

      /* ── 오른쪽: 검체 튜브 ── */
      var RX = 648, RW = W - RX, tx = RX + RW / 2;
      K.stage(ctx, RX, 0, RW, H, "lab", { seed: 33, title: "검체 튜브" });
      var fl = clamp(now / M.P, 0, 1), lit = clamp(Math.log(Math.max(now, 1)) / Math.log(M.P), 0, 1);
      var top = 82, bot = 238, hw = 34, liq = 160;
      /* 형광(신호가 셀수록 밝게) */
      if (fl > 0.02) K.glow(ctx, tx, (liq + bot) / 2 + 8, 24 + 30 * fl, "rgba(63,211,163," + clamp(fl * 0.8, 0.1, 0.8) + ")", 2.2);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(tx - hw, top); ctx.lineTo(tx - hw, bot - 30); ctx.quadraticCurveTo(tx - hw * 0.6, bot + 18, tx, bot + 22); ctx.quadraticCurveTo(tx + hw * 0.6, bot + 18, tx + hw, bot - 30); ctx.lineTo(tx + hw, top); ctx.closePath();
      var gl = ctx.createLinearGradient(tx - hw, 0, tx + hw, 0); gl.addColorStop(0, "rgba(255,255,255,.16)"); gl.addColorStop(.3, "rgba(255,255,255,.04)"); gl.addColorStop(1, "rgba(255,255,255,.12)");
      ctx.fillStyle = gl; ctx.fill(); ctx.strokeStyle = "rgba(220,230,255,.5)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.clip();
      var lg = ctx.createLinearGradient(0, liq, 0, bot + 22);
      lg.addColorStop(0, "rgba(" + Math.round(40 + 23 * fl) + "," + Math.round(70 + 141 * fl) + "," + Math.round(140 + 23 * fl) + ",.75)"); lg.addColorStop(1, "rgba(20,40,90,.85)");
      ctx.fillStyle = lg; ctx.fillRect(tx - hw, liq, hw * 2, bot - liq + 30);
      var R = K.rng(7), nd = Math.round(4 + lit * 120);
      for (i = 0; i < nd; i++) { var dx = tx - hw + 6 + R() * (hw * 2 - 12), dy = liq + 8 + R() * (bot - liq); K.glow(ctx, dx, dy, 1.2, "rgba(170,255,220,.9)", 2.6); }
      ctx.restore();
      metal(ctx, tx - hw - 6, top - 14, hw * 2 + 12, 16, "#e8ecf6", "#7a8296", 5);
      K.pill(ctx, big(now), tx, 284, { s: 13, a: "center", c: over ? KC.green : KC.ink, box: [RX, W] });
      K.pill(ctx, over ? "✅ 검출됨 (양성 신호)" : (c === 0 ? "증폭 전" : "아직 기준선 아래"), tx, 310, { s: 11.5, a: "center", c: over ? KC.green : KC.mute, box: [RX, W] });
      K.t(ctx, "한 주기 = 95℃ 변성 → 55℃ 결합 → 72℃ 신장", RX + RW / 2, 54, { s: 9.5, a: "center", c: KC.dim });

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
    function bar(y, parts, total, title, right, rc) {
      var x0 = 24, x1 = 590, x = x0;
      K.t(ctx, title, x0, y - 9, { s: 12, w: "800", c: KC.ink });
      if (right) K.pill(ctx, right, x1, y - 9, { s: 12, a: "right", c: rc || KC.blue });
      track(ctx, x0, y, x1 - x0, 34, 8);
      parts.forEach(function (p, i) {
        var w = total > 0 ? p.n / total * (x1 - x0) : 0;
        if (w > 0.5) {
          ctx.save(); ctx.beginPath(); ctx.roundRect(x0, y, x1 - x0, 34, 8); ctx.clip();
          gbar(ctx, x, y, w - (i < parts.length - 1 && w > 3 ? 2 : 0), 34, p.c0, p.c, 2, 6); ctx.restore();
        }
        if (w > 120) K.t(ctx, p.t + " " + fmt(p.n) + "명", x + 8, y + 22, { s: 11.5, w: "800", c: "#ffffff" });
        x += w;
      });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      if (!okT && !OPEN_ALL) {
        K.stage(ctx, 0, 0, W, H, "lab", { seed: 41 });
        K.pill(ctx, "🔒 위의 결과표를 먼저 직접 계산해 채우면 이 화면이 열립니다.", W / 2, H / 2, { s: 14, a: "center", c: KC.mute });
        $("a-rt-info").innerHTML = "표를 채운 뒤에는 유병률·민감도·특이도를 바꿔 가며 결과가 어떻게 달라지는지 볼 수 있습니다.";
        $("a-rt-read").innerHTML = "<span class='k'>양성 예측도</span><span class='v y'>?</span><span class='sub'>결과표를 먼저 채우세요</span>";
        return;
      }
      var r = M.rt(prev, se, sp), pos = r.tp + r.fp, neg = r.tn + r.fn;
      var RED = ["#8a2a3c", KC.red], TEAL = ["#0f4c4a", "#6fe3d6"], AMB = ["#8a5a12", KC.orange], ROSE = ["#6e1a4a", "#ff8fc8"];
      K.stage(ctx, 0, 0, 608, H, "lab", { seed: 41 });
      bar(48, [{ n: r.tp + r.fn, c0: RED[0], c: RED[1], t: "감염자" }, { n: r.fp + r.tn, c0: TEAL[0], c: TEAL[1], t: "비감염자" }], 10000, "시민 10,000명", "유병률 " + prev + "%", KC.ink);
      bar(140, [{ n: r.tp, c0: RED[0], c: RED[1], t: "진짜 감염자" }, { n: r.fp, c0: AMB[0], c: AMB[1], t: "위양성(감염 아님)" }], pos, "검사 ‘양성’ " + fmt(pos) + "명 — 이 가운데 진짜 감염자는?", "양성 예측도 " + r.ppv.toFixed(1) + "%", KC.yellow);
      bar(232, [{ n: r.tn, c0: TEAL[0], c: TEAL[1], t: "진짜 비감염자" }, { n: r.fn, c0: ROSE[0], c: ROSE[1], t: "위음성" }], neg, "검사 ‘음성’ " + fmt(neg) + "명 — 놓친 감염자(위음성) " + fmt(r.fn) + "명", "음성 예측도 " + r.npv.toFixed(1) + "%", KC.blue);
      K.t(ctx, "막대는 각 줄의 인원을 100%로 놓고 그렸습니다.", 590, H - 12, { s: 10.5, c: KC.dim, a: "right" });

      /* ── 오른쪽: 양성 판정을 받은 사람 ── */
      var RX = 616, RW = W - RX, cx = RX + RW / 2, cy = 168, rr = 82;
      K.stage(ctx, RX, 0, RW, H, "lab", { seed: 43, title: "양성 " + fmt(pos) + "명을 쪼개 보면" });
      var a0 = -Math.PI / 2, a1 = a0 + (pos > 0 ? r.tp / pos : 0) * Math.PI * 2;
      ctx.lineWidth = 26; ctx.lineCap = "butt";
      ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.2832); ctx.stroke();
      ctx.save(); ctx.shadowBlur = 12;
      if (pos > 0) {
        ctx.shadowColor = KC.red; ctx.strokeStyle = KC.red; ctx.beginPath(); ctx.arc(cx, cy, rr, a0, a1); ctx.stroke();
        ctx.shadowColor = KC.orange; ctx.strokeStyle = KC.orange; ctx.beginPath(); ctx.arc(cx, cy, rr, a1, a0 + Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
      var good = r.ppv >= 90;
      ctx.save(); ctx.shadowColor = good ? KC.green : KC.yellow; ctx.shadowBlur = 10;
      K.t(ctx, r.ppv.toFixed(1) + "%", cx, cy + 8, { s: 26, w: "900", a: "center", c: good ? KC.green : KC.yellow }); ctx.restore();
      K.t(ctx, "진짜 감염자일 확률", cx, cy + 30, { s: 10.5, a: "center", c: KC.mute });
      K.pill(ctx, "● 진짜 감염자 " + fmt(r.tp) + "명", RX + 14, 284, { s: 11, c: KC.red, box: [RX, W] });
      K.pill(ctx, "● 위양성 " + fmt(r.fp) + "명", RX + 14, 310, { s: 11, c: KC.orange, box: [RX, W] });

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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = M.sir(cut, vac), YM = 32000, DAYS = 360, ok = r.peak <= CAP;
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 51, title: "동시에 앓고 있는 환자 수(명)" });
      var g = K.chart(ctx, { x: 10, y: 44, w: 880, h: 312, x0: 0, x1: DAYS, y0: 0, y1: YM, xt: 6, yt: 4, xl: "유행 시작 뒤 날수", xf: function (q) { return Math.round(q) + "일"; }, yf: function (q) { return fmt(q); }, pl: 58 });
      function pts(arr) { var o = []; for (var d = 0; d <= DAYS; d++) o.push([d, clamp(arr[d], 0, YM)]); return o; }
      /* 대책 없음 */
      K.plot(ctx, g, pts(base.I), "rgba(200,210,255,.45)", { w: 2, dash: [5, 5], glow: false });
      if (cut || vac) K.pill(ctx, "대책 없음", g.X(base.peakDay) + 40, g.Y(base.peak) + 14, { s: 11, c: KC.mute });
      /* 지금 대책 — 넓이를 칠한다 */
      var p = pts(r.I), col = ok ? KC.green : KC.red;
      var ag = ctx.createLinearGradient(0, g.T, 0, g.B); ag.addColorStop(0, ok ? "rgba(63,211,163,.45)" : "rgba(255,107,129,.45)"); ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(g.X(0), g.B);
      p.forEach(function (q) { ctx.lineTo(g.X(q[0]), g.Y(q[1])); }); ctx.lineTo(g.X(DAYS), g.B); ctx.closePath(); ctx.fill();
      /* 의료 역량 */
      hline(ctx, g.L, g.R, g.Y(CAP), KC.yellow, [8, 5], 2);
      K.pill(ctx, "의료 역량 5,000명", g.R - 4, g.Y(CAP) - 9, { s: 11.5, a: "right", c: KC.yellow });
      K.plot(ctx, g, p, col, { w: 3.2 });
      if (r.peak >= 50 && r.peakDay <= DAYS) {
        var px = g.X(r.peakDay), py = g.Y(Math.min(r.peak, YM));
        K.glow(ctx, px, py, 4.5, ok ? "rgba(63,211,163,.95)" : "rgba(255,107,129,.95)", 3.4);
        K.pill(ctx, "정점 " + fmt(r.peak) + "명 · " + fmt(r.peakDay) + "일째", px + 12, Math.max(py, g.T + 30) - 10, { s: 11.5, c: col, box: [g.L, g.R - 150] });
      }
      K.pill(ctx, "R = " + r.reff.toFixed(2), W - 18, 28, { s: 15, a: "right", c: r.reff < 1 ? KC.green : KC.red });
      K.t(ctx, "R = R₀ 3 × (1 − 접촉 감소) × (1 − 접종률)", W - 118, 28, { s: 11, a: "right", c: KC.mute });

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
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var k = M.TECH[ti].k, i, COLS = [KC.blue, KC.orange, KC.violet];
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 61, title: "보급률 — " + M.TECH[ti].n + "형 확산 모형" });
      var g = K.chart(ctx, { x: 10, y: 40, w: 860, h: 254, x0: 0, x1: 40, y0: 0, y1: 100, xt: 8, yt: 2, xl: "도입 후 경과 연수", xf: function (q) { return q + "년"; }, yf: function (q) { return q + "%"; } });
      /* 단계 띠 (고른 기술) */
      var bands = [[0, 15, "초기 도입기"], [15, 50, "급속 확산기"], [50, 90, "성숙기"], [90, 100.1, "포화기"]], prevT = 0;
      bands.forEach(function (b, j) {
        var t1 = 40; for (var tt = 0; tt <= 40; tt += 0.25) if (M.adopt(tt, k) >= b[1]) { t1 = tt; break; }
        if (t1 > prevT) {
          ctx.fillStyle = j % 2 ? "rgba(127,211,255,.06)" : "rgba(182,156,255,.05)"; ctx.fillRect(g.X(prevT), g.T, g.X(t1) - g.X(prevT), g.B - g.T);
          if (g.X(t1) - g.X(prevT) > 76) K.t(ctx, b[2], (g.X(prevT) + g.X(t1)) / 2, g.B - 8, { s: 10.5, a: "center", c: KC.dim });
        }
        prevT = t1;
      });
      hline(ctx, g.L, g.R, g.Y(90), KC.yellow, [6, 5]);
      K.pill(ctx, "90%", g.L + 6, g.Y(90) - 8, { s: 10.5, c: KC.yellow });
      M.TECH.forEach(function (t, j) {
        if (j === ti) return;
        var p = []; for (var q = 0; q <= 160; q++) p.push([q / 4, M.adopt(q / 4, t.k)]);
        K.plot(ctx, g, p, "rgba(200,210,255,.3)", { w: 1.6, glow: false });
      });
      var pp = []; for (i = 0; i <= 160; i++) pp.push([i / 4, M.adopt(i / 4, k)]);
      K.plot(ctx, g, pp, COLS[ti], { w: 3.4 });
      var pct = M.adopt(year, k), cx = g.X(year), cy = g.Y(pct);
      vline(ctx, cx, cy, g.B, "rgba(255,255,255,.45)", [3, 4], 1.2);
      K.glow(ctx, cx, cy, 5, "rgba(255,236,190,.95)", 3.4);
      K.pill(ctx, year + "년 · " + pct.toFixed(1) + "%", clamp(cx, g.L + 60, g.R - 60), cy < g.T + 40 ? cy + 30 : (cy > g.B - 40 ? cy - 24 : cy - 14), { s: 13, a: "center", c: "#ffffff" });
      M.TECH.forEach(function (t, j) { K.pill(ctx, "● " + t.n, W - 22 - (2 - j) * 92, 28, { s: 11, a: "right", c: j === ti ? COLS[j] : KC.dim }); });

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
    function X(p) { return 60 + (p - 30) / 50 * 800; }           // 30%~80%
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var n = M.NS[ni], r = M.poll(n, share);
      K.stage(ctx, 0, 0, W, H, "lab", { seed: 71 });
      /* 구성 막대 */
      function comp(y, sh, title) {
        K.t(ctx, title, 60, y - 9, { s: 12, w: "800", c: KC.ink });
        var w = 800 * sh / 100;
        track(ctx, 60, y, 800, 26, 7);
        gbar(ctx, 60, y, w, 26, "#3d2a80", KC.violet, 6, 6);
        gbar(ctx, 60 + w + (w > 0 ? 2 : 0), y, 800 - w - (w > 0 ? 2 : 0), 26, "#0f4c4a", "#6fe3d6", 6, 6);
        if (w > 150) K.t(ctx, "☎ 보유층 " + sh + "%", 68, y + 18, { s: 11.5, w: "800", c: "#ffffff" });
        if (800 - w > 150) K.t(ctx, "비보유층 " + (100 - sh) + "%", 852, y + 18, { s: 11.5, w: "800", a: "right", c: "#ffffff" });
      }
      comp(40, 35, "실제 유권자 전체 (보유층 지지율 40% · 비보유층 지지율 72%)");
      comp(102, share, "내가 뽑는 표본 — " + fmt(n) + "명");
      /* 수직선 */
      var ay = 252;
      K.t(ctx, "루스벨트 지지율 예측", 60, 166, { s: 12.5, w: "800", c: KC.ink });
      var lg = ctx.createLinearGradient(60, 0, 860, 0); lg.addColorStop(0, "rgba(200,210,255,.35)"); lg.addColorStop(1, "rgba(200,210,255,.7)");
      ctx.strokeStyle = lg; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, ay); ctx.lineTo(860, ay); ctx.stroke();
      ctx.strokeStyle = KC.line; ctx.lineWidth = 1.5;
      for (var p = 30; p <= 80; p += 10) { ctx.beginPath(); ctx.moveTo(X(p), ay - 5); ctx.lineTo(X(p), ay + 5); ctx.stroke(); K.t(ctx, p + "%", X(p), ay + 22, { s: 10.5, c: KC.mute, a: "center" }); }
      vline(ctx, X(50), 178, ay + 30, "rgba(200,210,255,.55)", [4, 4], 1.4);
      K.t(ctx, "50% 당선선", X(50), ay + 44, { s: 10.5, c: KC.mute, a: "center" });
      /* 이 조건에서 예측이 찍히는 범위 */
      var bx0 = X(clamp(r.exp - r.moe, 30, 80)), bx1 = X(clamp(r.exp + r.moe, 30, 80));
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 14; ctx.fillStyle = "rgba(127,211,255,.22)"; ctx.fillRect(bx0, ay - 30, Math.max(3, bx1 - bx0), 60); ctx.restore();
      ctx.strokeStyle = "rgba(127,211,255,.6)"; ctx.lineWidth = 1; ctx.strokeRect(bx0, ay - 30, Math.max(3, bx1 - bx0), 60);
      K.pill(ctx, "이 조건의 예측 범위", clamp((bx0 + bx1) / 2, 120, 800), ay - 40, { s: 10.5, a: "center", c: KC.blue });
      /* 실제 결과 */
      vline(ctx, X(M.TRUE), 178, ay + 30, KC.green, [], 3);
      K.pill(ctx, "실제 결과 60.8%", X(M.TRUE) + 8, 190, { s: 11.5, c: KC.green });
      dots.forEach(function (d, i) {
        var last = i === dots.length - 1, yy = ay - 16 + (i % 5) * 8;
        if (last && drop < 1) yy = 150 + (yy - 150) * (1 - Math.pow(1 - drop, 3));
        ctx.save(); ctx.globalAlpha = last ? 1 : .5; K.glow(ctx, X(clamp(d, 30, 80)), yy, last ? 4.5 : 3.5, "rgba(255,140,150,.95)", 3); ctx.restore();
      });
      var good = Math.abs(r.bias) <= 2 && r.moe <= 1;
      K.pill(ctx, "치우침 " + (r.bias >= 0 ? "+" : "−") + Math.abs(r.bias).toFixed(1) + "%p   ·   오차 범위 ±" + (r.moe < 0.1 ? r.moe.toFixed(2) : r.moe.toFixed(1)) + "%p", 860, 336, { s: 13, a: "right", c: good ? KC.green : KC.red });
      K.t(ctx, "● 뽑을 때마다 나온 예측", 60, 336, { s: 11, c: KC.mute });
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

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = M.priv(lv.loc, lv.bir, lv.sex), i;
      K.stage(ctx, 0, 0, W, H, "night", { seed: 81, title: "주민 2,000명 — 공개된 항목의 값이 나와 똑같은 사람이 몇 명인가" });
      var COL = { u: [255, 107, 129], s: [255, 179, 92], h: [111, 227, 214] };
      for (i = 0; i < 2000; i++) {
        var z = r.sizes[i], c = z === 1 ? COL.u : (z < 5 ? COL.s : COL.h), px = 50 + (i % 80) * 10, py = 46 + Math.floor(i / 80) * 9.6;
        if (z === 1) { ctx.fillStyle = "rgba(255,107,129,.22)"; ctx.beginPath(); ctx.arc(px + 3.5, py + 3.5, 6, 0, 6.2832); ctx.fill(); }
        ctx.fillStyle = "rgba(" + c.join(",") + "," + (z >= 5 ? 0.42 : 1) + ")";
        ctx.beginPath(); ctx.arc(px + 3.5, py + 3.5, z >= 5 ? 2.6 : 3.2, 0, 6.2832); ctx.fill();
      }
      var ly = 302;
      K.pill(ctx, "● 단 한 명(특정됨) " + r.uniq.toFixed(1) + "%", 44, ly, { s: 11.5, c: KC.red });
      K.pill(ctx, "● 2~4명 가운데 하나", 270, ly, { s: 11.5, c: KC.orange });
      K.pill(ctx, "● 5명 이상 속에 숨음", 440, ly, { s: 11.5, c: "#6fe3d6" });
      K.pill(ctx, "정보량 " + r.util + "점 / 5점", 856, ly, { s: 12.5, a: "right", c: r.util >= 3 ? KC.green : KC.mute });

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
