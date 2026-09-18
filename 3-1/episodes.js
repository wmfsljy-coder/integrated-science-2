/* 통합과학2 Ⅲ-1 과학 기술의 활용 — 이야기 두 편
   01 펌프의 손잡이를 떼어라(감염병의 진단·추적) / 02 240만 장의 엽서(기술 발전과 빅데이터)
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

/* =========================================================================
   계산 모형 (화면과 분리 — node 로 따로 돌려 미션 판정을 검증할 수 있다)
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

    function draw() {
      paper(ctx, W, H);
      /* 길 */
      ctx.strokeStyle = v("--card-2"); ctx.lineWidth = 12; ctx.lineCap = "round";
      [[40, 215, 860, 215], [450, 40, 450, 395], [120, 60, 800, 120], [100, 340, 820, 300], [230, 40, 180, 395], [700, 40, 660, 395]].forEach(function (l) {
        ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke();
      });
      ctx.lineCap = "butt";
      text(ctx, "브로드가 일대 — 막대 하나 = 사망자 한 명", 40, 24, { s: 13, w: "800" });
      /* 집과 사망자 막대 */
      data.houses.forEach(function (h) {
        var mine = sel !== null && h.p === sel;
        ctx.fillStyle = mine ? v("--brand") : v("--line");
        ctx.fillRect(h.x - 3, h.y - 3, 6, 6);
        ctx.fillStyle = v("--rose");
        for (var k = 0; k < h.d; k++) ctx.fillRect(h.x - 5, h.y - 7 - k * 3.5, 10, 2.5);
      });
      /* 건물 */
      M.BLD.forEach(function (b) {
        ctx.fillStyle = v("--amber-100"); ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 6); ctx.fill(); ctx.stroke();
        text(ctx, b.n, b.x + b.w / 2, b.y + b.h / 2 + 4, { s: 11.5, w: "800", a: "center", c: v("--amber-700") });
      });
      /* 펌프 */
      M.PUMPS.forEach(function (p, i) {
        if (sel === i) { ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.arc(p.x, p.y, 24, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
        ctx.fillStyle = (hit && i === 0) ? v("--mist") : v("--teal"); ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fill();
        text(ctx, "P", p.x, p.y + 4, { s: 11.5, w: "900", a: "center", c: v("--on-accent") });
        text(ctx, p.n + (seen[i] ? " ✓" : ""), p.x, p.y + 28, { s: 11.5, w: "800", a: "center", c: sel === i ? v("--brand-700") : v("--teal-700") });
        if (hit && i === 0) text(ctx, "손잡이 제거", p.x, p.y - 18, { s: 11, w: "900", a: "center", c: v("--rose-700") });
      });
      text(ctx, "■ 집   ▬ 사망자   ● 공동 펌프   (고른 펌프가 가장 가까운 집은 파랗게 표시됩니다)", 40, H - 12, { s: 11, c: v("--mist") });
    }
    canvas._redraw = draw;

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
      M.PUMPS.forEach(function (p, i) { if (Math.abs(mx - p.x) < 30 && Math.abs(my - p.y) < 30) pick(i); });
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
      why: ["같은 거리의 같은 공기를 마셨는데 이곳만 멀쩡했습니다. 공기로는 설명되지 않습니다.", "스노가 직접 확인한 사실입니다. 같은 공기를 마셨지만 <b>브로드가 펌프의 물을 마시지 않은</b> 사람들은 무사했습니다. 반대로, 멀리 떨어진 햄스테드에 살면서도 이 펌프의 물맛을 좋아해 날마다 길어다 마신 부인은 콜레라로 숨졌습니다.", "사망자가 수백 명인 한복판에서 수백 명이 무사한 것을 우연이라 하기는 어렵습니다.", "공기는 이웃집과 똑같았습니다. 달랐던 것은 마신 물입니다."],
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
      paper(ctx, W, H);
      var x0 = 70, x1 = 610, y0 = 46, y1 = 268, ct = M.pcrCt(x), i;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (i = 0; i <= 45; i += 5) text(ctx, String(i), x0 + i / 45 * (x1 - x0), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      text(ctx, "증폭 주기 수 →", (x0 + x1) / 2, y1 + 38, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, "형광 신호(유전자 양)", x0, 28, { s: 12.5, w: "800" });
      /* 기준선 */
      var ty = y1 - 0.1 * (y1 - y0);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x1, ty); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "검출 기준선", x1 - 4, ty - 6, { s: 10.5, w: "800", c: v("--amber-700"), a: "right" });
      /* 전체 곡선(옅게) + 진행한 데까지(진하게) */
      function curve(upto, col, lw, alpha) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath();
        for (var k = 0; k <= upto * 4; k++) {
          var cc = k / 4, xx = x0 + cc / 45 * (x1 - x0), yy = y1 - M.pcrN(x, cc) / M.P * (y1 - y0);
          if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke(); ctx.globalAlpha = 1;
      }
      curve(45, v("--mist"), 2, .35);
      curve(c, v("--coral"), 3.5, 1);
      var cx = x0 + c / 45 * (x1 - x0), cy = y1 - M.pcrN(x, c) / M.P * (y1 - y0);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
      if (ct !== null && c >= ct) {
        var gx = x0 + ct / 45 * (x1 - x0);
        ctx.strokeStyle = v("--brand"); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y1); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, "Ct = " + ct, gx + 6, y0 + 12, { s: 12.5, w: "900", c: v("--brand-700") });
      }
      /* 오른쪽 패널 */
      var now = M.pcrN(x, c), over = now >= 0.1 * M.P;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(640, 40, 236, 232, 16); ctx.fill();
      text(ctx, "처음", 658, 70, { s: 11.5, c: v("--mist") });
      text(ctx, fmt(n0()) + "개", 858, 70, { s: 14, w: "800", a: "right" });
      text(ctx, "× 2를 " + c + "번", 658, 100, { s: 11.5, c: v("--mist") });
      text(ctx, c <= 20 ? "× " + fmt(Math.pow(2, c)) : "× 2^" + c, 858, 100, { s: 14, w: "800", a: "right" });
      text(ctx, "지금 유전자 수", 658, 140, { s: 11.5, c: v("--mist") });
      text(ctx, big(now), 858, 168, { s: 18, w: "900", a: "right", c: over ? v("--green-700") : v("--coral-700") });
      text(ctx, over ? "✅ 검출됨 (양성 신호)" : "아직 기준선 아래", 858, 200, { s: 12.5, w: "800", a: "right", c: over ? v("--green-700") : v("--mist") });
      text(ctx, now > 0.8 * M.P ? "시약이 바닥나 더 늘지 않음(고원)" : "", 858, 226, { s: 11, a: "right", c: v("--mist") });
      text(ctx, "이 검체의 Ct", 658, 256, { s: 11.5, c: v("--mist") });
      text(ctx, (c >= ct ? String(ct) : "?"), 858, 258, { s: 16, w: "900", a: "right", c: v("--brand-700") });

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
    function bar(y, parts, total, title, right) {
      var x0 = 40, x1 = 860, x = x0;
      text(ctx, title, x0, y - 8, { s: 12.5, w: "800" });
      if (right) text(ctx, right, x1, y - 8, { s: 12.5, w: "900", a: "right", c: v("--brand-700") });
      parts.forEach(function (p) {
        var w = total > 0 ? p.n / total * (x1 - x0) : 0;
        ctx.fillStyle = v(p.c); ctx.fillRect(x, y, w, 34);
        if (w > 120) text(ctx, p.t + " " + fmt(p.n) + "명", x + 8, y + 22, { s: 11.5, w: "800", c: v(p.tc) });
        x += w;
      });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.strokeRect(x0, y, x1 - x0, 34);
    }
    function draw() {
      paper(ctx, W, H);
      if (!okT && !OPEN_ALL) {
        text(ctx, "🔒 위의 결과표를 먼저 직접 계산해 채우면 이 화면이 열립니다.", W / 2, H / 2, { s: 14, w: "800", a: "center", c: v("--mist") });
        $("a-rt-info").innerHTML = "표를 채운 뒤에는 유병률·민감도·특이도를 바꿔 가며 결과가 어떻게 달라지는지 볼 수 있습니다.";
        return;
      }
      var r = M.rt(prev, se, sp), pos = r.tp + r.fp, neg = r.tn + r.fn;
      bar(44, [{ n: r.tp + r.fn, c: "--coral", t: "감염자", tc: "--on-accent" }, { n: r.fp + r.tn, c: "--teal-100", t: "비감염자", tc: "--teal-700" }], 10000, "시민 10,000명", "유병률 " + prev + "%");
      bar(140, [{ n: r.tp, c: "--coral", t: "진짜 감염자", tc: "--on-accent" }, { n: r.fp, c: "--amber", t: "위양성(감염 아님)", tc: "--ink" }], pos, "검사 ‘양성’이 나온 " + fmt(pos) + "명 — 이 가운데 진짜 감염자는?", "양성 예측도 " + r.ppv.toFixed(1) + "%");
      bar(236, [{ n: r.tn, c: "--teal-100", t: "진짜 비감염자", tc: "--teal-700" }, { n: r.fn, c: "--rose", t: "위음성", tc: "--on-accent" }], neg, "검사 ‘음성’이 나온 " + fmt(neg) + "명 — 놓친 감염자(위음성) " + fmt(r.fn) + "명", "음성 예측도 " + r.npv.toFixed(1) + "%");
      text(ctx, "막대는 각 줄의 인원을 100%로 놓고 그렸습니다.", 860, H - 12, { s: 10.5, c: v("--mist"), a: "right" });

      $("a-rt-info").innerHTML = "양성 " + fmt(pos) + "명 = 진짜 감염자 <b>" + fmt(r.tp) + "명</b> + 위양성 <b>" + fmt(r.fp) + "명</b> → 양성인 사람이 진짜 감염자일 확률(양성 예측도) <b>" + r.ppv.toFixed(1) + "%</b>. " +
        (r.ppv < 50 ? "양성 판정을 받은 사람의 절반 이상이 사실은 감염자가 아닙니다! 감염자가 드물 때는 9,900명의 2%인 위양성이 진짜 감염자보다 많아지기 때문입니다. 그래서 신속검사 양성은 <b>PCR로 다시 확인</b>합니다." :
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
      paper(ctx, W, H);
      var r = M.sir(cut, vac), x0 = 70, x1 = 860, y0 = 50, y1 = H - 46, YM = 32000, DAYS = 365, i;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (i = 0; i <= 360; i += 60) text(ctx, i + "일", x0 + i / DAYS * (x1 - x0), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      for (i = 10000; i <= 30000; i += 10000) { var gy = y1 - i / YM * (y1 - y0); text(ctx, fmt(i), x0 - 8, gy + 4, { s: 10.5, c: v("--mist"), a: "right" }); ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); ctx.globalAlpha = 1; }
      text(ctx, "동시에 앓고 있는 환자 수(명)", x0, 30, { s: 12.5, w: "800" });
      function line(arr, col, lw, dash) {
        ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.setLineDash(dash || []); ctx.beginPath();
        for (var d = 0; d <= DAYS; d++) { var xx = x0 + d / DAYS * (x1 - x0), yy = y1 - clamp(arr[d] / YM, 0, 1) * (y1 - y0); if (d === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
        ctx.stroke(); ctx.setLineDash([]);
      }
      line(base.I, v("--mist"), 2, [5, 5]);
      text(ctx, "대책 없음", x0 + base.peakDay / DAYS * (x1 - x0) + 40, y1 - base.peak / YM * (y1 - y0) + 14, { s: 11, c: v("--mist") });
      var cy = y1 - CAP / YM * (y1 - y0);
      ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2; ctx.setLineDash([8, 5]); ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "의료 역량 5,000명", x1 - 4, cy - 7, { s: 11.5, w: "800", c: v("--amber-700"), a: "right" });
      var ok = r.peak <= CAP;
      line(r.I, ok ? v("--green") : v("--rose"), 3.5);
      text(ctx, "R = " + r.reff.toFixed(2), x1 - 4, 30, { s: 15, w: "900", a: "right", c: r.reff < 1 ? v("--green-700") : v("--rose-700") });
      text(ctx, "R = R₀ 3 × (1 − 접촉 감소) × (1 − 접종률)", x1 - 110, 30, { s: 11, a: "right", c: v("--mist") });

      var small = r.peak < 50;
      $("a-sir-info").innerHTML = "실제 재생산 지수 <b>R = " + r.reff.toFixed(2) + "</b> · 동시 환자 최대 <b>" + (small ? "수십 명 이하" : fmt(r.peak) + "명") + "</b>" + (small ? "" : " (" + fmt(r.peakDay) + "일째)") + " · 유행이 끝날 때까지 감염된 사람 <b>" + fmt(r.total) + "명</b><br>" +
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
      q: "면역을 가진 사람의 비율이 1 − 1/R₀ 을 넘으면 접촉을 줄이지 않아도 R이 1 아래로 내려갑니다(집단 면역). R₀ = 3인 감염병 X는 약 67%입니다. 그렇다면 R₀가 약 15나 되는 홍역은 인구의 몇 %가 면역을 가져야 할까요?",
      options: ["약 50%", "약 67%", "약 80%", "약 93%"],
      answer: 3,
      why: ["1 − 1/15 을 계산해 보세요.", "67%는 R₀ = 3일 때의 값입니다.", "1/15 ≈ 0.067 입니다. 1에서 빼 보세요.", "1 − 1/15 ≈ 0.93. 전파력이 큰 감염병일수록 훨씬 높은 접종률이 필요합니다. 홍역 예방 접종률을 95% 수준으로 유지하려는 까닭입니다."],
      onDone: function () { quiz = true; window.sthState("sirQuiz", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(4)) window.sthMission("m1-5", true);
  })();

  /* 장면 6 — 결말 */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "";
    $("e1-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉡") === 0 ? " — 스노와 같은 생각이었습니다. 이제 지도라는 증거까지 갖췄네요." : " — 당시 의사들 대부분도 그렇게 믿었습니다. 생각을 바꾼 것은 권위가 아니라 지도 위의 데이터였습니다.") +
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
      paper(ctx, W, H);
      var k = M.TECH[ti].k, x0 = 70, x1 = 850, y0 = 40, y1 = 236, i;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (i = 0; i <= 40; i += 5) text(ctx, i + "년", x0 + i / 40 * (x1 - x0), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      [0, 50, 100].forEach(function (p) { text(ctx, p + "%", x0 - 8, y1 - p / 100 * (y1 - y0) + 4, { s: 10.5, c: v("--mist"), a: "right" }); });
      text(ctx, "보급률 — " + M.TECH[ti].n + "형 확산 모형", x0, 24, { s: 12.5, w: "800" });
      text(ctx, "도입 후 경과 연수 →", (x0 + x1) / 2, y1 + 40, { s: 11, c: v("--mist"), a: "center" });
      var y90 = y1 - 0.9 * (y1 - y0);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(x0, y90); ctx.lineTo(x1, y90); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "90%", x1 + 4, y90 + 4, { s: 10.5, w: "800", c: v("--amber-700") });
      /* 다른 두 기술은 옅게 */
      M.TECH.forEach(function (t, j) {
        ctx.strokeStyle = j === ti ? v("--teal") : v("--mist"); ctx.lineWidth = j === ti ? 3.5 : 1.5; ctx.globalAlpha = j === ti ? 1 : .35; ctx.beginPath();
        for (var q = 0; q <= 160; q++) { var tt = q / 4, xx = x0 + tt / 40 * (x1 - x0), yy = y1 - M.adopt(tt, t.k) / 100 * (y1 - y0); if (q === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
        ctx.stroke(); ctx.globalAlpha = 1;
      });
      var pct = M.adopt(year, k), cx = x0 + year / 40 * (x1 - x0), cy = y1 - pct / 100 * (y1 - y0);
      ctx.fillStyle = v("--coral"); ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, pct.toFixed(1) + "%", clamp(cx, x0 + 30, x1 - 30), cy - 14, { s: 13, w: "900", a: "center", c: v("--coral-700") });

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
    var ni = 2, share = 90, dots = [], got = window.sthState("poll") || { a: false, b: false };

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
    function X(p) { return 60 + (p - 30) / 50 * 800; }           // 30% ~ 80%
    function draw() {
      paper(ctx, W, H);
      var n = M.NS[ni], r = M.poll(n, share);
      /* 구성 막대 */
      function comp(y, sh, title) {
        text(ctx, title, 60, y - 8, { s: 12, w: "800" });
        var w = 800 * sh / 100;
        ctx.fillStyle = v("--violet"); ctx.fillRect(60, y, w, 26);
        ctx.fillStyle = v("--teal-100"); ctx.fillRect(60 + w, y, 800 - w, 26);
        if (w > 150) text(ctx, "☎ 보유층 " + sh + "%", 68, y + 18, { s: 11.5, w: "800", c: v("--on-accent") });
        if (800 - w > 150) text(ctx, "비보유층 " + (100 - sh) + "%", 852, y + 18, { s: 11.5, w: "800", a: "right", c: v("--teal-700") });
      }
      comp(36, 35, "실제 유권자 전체 (보유층 지지율 40% · 비보유층 지지율 72%)");
      comp(98, share, "내가 뽑는 표본 — " + fmt(n) + "명");
      /* 수직선 */
      var ay = 250;
      text(ctx, "루스벨트 지지율 예측", 60, 160, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(60, ay); ctx.lineTo(860, ay); ctx.stroke();
      for (var p = 30; p <= 80; p += 10) { ctx.beginPath(); ctx.moveTo(X(p), ay - 5); ctx.lineTo(X(p), ay + 5); ctx.stroke(); text(ctx, p + "%", X(p), ay + 22, { s: 10.5, c: v("--mist"), a: "center" }); }
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(50), 176); ctx.lineTo(X(50), ay + 30); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "50% 당선선", X(50), ay + 44, { s: 10.5, c: v("--mist"), a: "center" });
      ctx.strokeStyle = v("--green"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(M.TRUE), 176); ctx.lineTo(X(M.TRUE), ay + 30); ctx.stroke();
      text(ctx, "실제 결과 60.8%", X(M.TRUE) + 6, 186, { s: 11.5, w: "900", c: v("--green-700") });
      /* 이 조건에서 예측이 찍히는 범위 */
      var bx0 = X(clamp(r.exp - r.moe, 30, 80)), bx1 = X(clamp(r.exp + r.moe, 30, 80));
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = .22; ctx.fillRect(bx0, ay - 30, Math.max(3, bx1 - bx0), 60); ctx.globalAlpha = 1;
      text(ctx, "이 조건의 예측 범위", clamp((bx0 + bx1) / 2, 120, 800), ay - 38, { s: 10.5, w: "800", a: "center", c: v("--brand-700") });
      dots.forEach(function (d, i) {
        ctx.fillStyle = v("--coral"); ctx.globalAlpha = i === dots.length - 1 ? 1 : .45;
        ctx.beginPath(); ctx.arc(X(clamp(d, 30, 80)), ay - 16 + (i % 5) * 8, 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      });
      text(ctx, "치우침 " + (r.bias >= 0 ? "+" : "−") + Math.abs(r.bias).toFixed(1) + "%p   ·   오차 범위 ±" + (r.moe < 0.1 ? r.moe.toFixed(2) : r.moe.toFixed(1)) + "%p", 860, 330, { s: 13, w: "900", a: "right", c: Math.abs(r.bias) <= 2 && r.moe <= 1 ? v("--green-700") : v("--rose-700") });
      text(ctx, "● 뽑을 때마다 나온 예측", 60, 330, { s: 11, c: v("--mist") });
    }
    function mission() {
      if (got.a) done("m2-3a"); if (got.b) done("m2-3b");
      if (got.a && got.b) {
        window.sthMission("m2-3", true, "<span class='m-tag'>미션 완료</span>내 설계: <b>" + (window.sthState("pollBest") || "-") + "</b>. 표본을 키우면 <b>오차 범위</b>는 줄지만 <b>치우침</b>은 그대로입니다. 240만 명은 ‘틀린 답을 아주 정밀하게’ 맞혔을 뿐입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("b-poll-n").addEventListener("input", function (e) { ni = +e.target.value; $("b-poll-n-val").textContent = fmt(M.NS[ni]) + "명"; dots = []; draw(); });
    $("b-poll-s").addEventListener("input", function (e) { share = +e.target.value; $("b-poll-s-val").textContent = share + "%"; dots = []; draw(); });
    $("b-poll-clear").addEventListener("click", function () { dots = []; draw(); $("b-poll-info").innerHTML = "기록을 지웠습니다."; });
    $("b-poll-run").addEventListener("click", function () {
      var n = M.NS[ni], r = M.poll(n, share), est = sample(n, share);
      dots.push(est); if (dots.length > 15) dots.shift();
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
      paper(ctx, W, H);
      var r = M.priv(lv.loc, lv.bir, lv.sex), i;
      text(ctx, "주민 2,000명 — 공개된 항목의 값이 나와 똑같은 사람이 몇 명인가", 50, 24, { s: 12.5, w: "800" });
      for (i = 0; i < 2000; i++) {
        var z = r.sizes[i], col = z === 1 ? "--rose" : (z < 5 ? "--amber" : "--teal");
        ctx.fillStyle = v(col); ctx.globalAlpha = z >= 5 ? .55 : 1;
        ctx.fillRect(50 + (i % 80) * 10, 38 + Math.floor(i / 80) * 10, 7, 7);
      }
      ctx.globalAlpha = 1;
      var ly = 306;
      ctx.fillStyle = v("--rose"); ctx.fillRect(50, ly - 9, 10, 10); text(ctx, "단 한 명(특정됨) " + r.uniq.toFixed(1) + "%", 66, ly, { s: 11.5, w: "800" });
      ctx.fillStyle = v("--amber"); ctx.fillRect(290, ly - 9, 10, 10); text(ctx, "2~4명 가운데 하나", 306, ly, { s: 11.5, w: "800" });
      ctx.fillStyle = v("--teal"); ctx.fillRect(490, ly - 9, 10, 10); text(ctx, "5명 이상 속에 숨음", 506, ly, { s: 11.5, w: "800" });
      text(ctx, "정보량 " + r.util + "점 / 5점", 850, ly, { s: 12.5, w: "900", a: "right", c: r.util >= 3 ? v("--green-700") : v("--mist") });

      var shown = [NAMES.loc[lv.loc], NAMES.bir[lv.bir], NAMES.sex[lv.sex]].filter(function (s) { return s; });
      var okB = r.util >= 3 && r.uniq <= 1;
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
      { t: "이름을 지운 자료도 다른 정보와 결합하면 누구인지 드러난다", a: "b", why: "개인 정보 침해 문제입니다. 방금 직접 확인했지요.", hint: "익명 데이터 장면을 떠올려 보세요." },
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
    { key: "r2", label: "② 240만 장의 엽서" }
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
    { key: "r2", label: "② 240만 장의 엽서" }
  ],
  line: { id: "all", label: "두 사건을 꿰는 한 문장" }
});

})();
