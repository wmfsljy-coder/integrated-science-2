/* 통합과학2 Ⅲ-2 과학 기술의 발전과 쟁점 — 소단원별 이야기 두 편
   01 할머니의 딸기 온실 (IoT 규칙 제어 · 기계 학습 분류기 · 학습 데이터 밖의 한계)
   02 공청회에 서다 (주장 분류 · 오인식의 산수 · 위험-편익 저울 · 과학 윤리 · 입장문)
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthPick) */
(function () {
"use strict";

window.sthUnit("is2-3-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}

/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;
function sc(tok) {                                          // 예전 색 이름 → 무대 색
  var m = { "--brand": KC.blue, "--brand-700": KC.blue, "--violet": KC.violet, "--violet-700": KC.violet, "--green-700": KC.green, "--rose-700": KC.red, "--teal": "#6fe3d6", "--teal-700": "#6fe3d6", "--coral": KC.red, "--coral-700": KC.red, "--mist": KC.mute };
  return m[tok] || KC.ink;
}
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
function playBtn(id, get, set, on, off) {                  // ⏸ 멈추기 단추
  var b = $(id); if (!b) return;
  function paint() { b.textContent = get() ? on : off; }
  b.addEventListener("click", function () { set(!get()); paint(); });
  paint();
}

/* ---- 스튜디오 + 블록 모형 공용 도구 (지침 _tools/STUDIO_GUIDE.md) ---- */
var LT = K.LT;
/* 밝은 바탕 위 흰 이름표 */
function lpill(ctx, s, x, y, o) { o = o || {}; o.bg = o.bg || "rgba(255,255,255,.94)"; o.line = o.line || "rgba(20,40,90,.16)"; o.c = o.c || LT.ink; return K.pill(ctx, s, x, y, o); }
/* 오른쪽 흰 판정 카드: 큰 판정 글자와 오른쪽 위 작은 글 */
function judgeCard(ctx, RX, W, H, title, head, col, side) {
  K.card(ctx, RX, 0, W - RX, H, title || "판정");
  if (head) K.t(ctx, head, RX + 18, 62, { s: 21, w: "900", c: col || LT.ink });
  if (side) K.t(ctx, side, W - 18, 28, { s: 11.5, w: "800", a: "right", c: LT.mute });
}
function note(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 11.5, w: o.w || "700", a: o.a, c: o.c || LT.mute }); }
/* 딸기 입체 미니어처: kind = "rr" 익은 빨간 품종 · "ru" 안 익은 빨간 품종 · "wr" 익은 흰 딸기 · "wu" 안 익은 흰 딸기 */
var BERRY = {
  rr: ["#ffd6db", "#f2344b", "#8c0d20", "#ffe27a"], ru: ["#f6ffe8", "#b6dc78", "#4d8a2e", "#e6f2b0"],
  wr: ["#ffffff", "#fde8ec", "#cf98a6", "#e0344c"], wu: ["#ffffff", "#eaf3dc", "#93ad80", "#c9dc9a"]
};
function berry(ctx, x, y, r, kind) {
  var c = BERRY[kind] || BERRY.rr, i;
  ctx.fillStyle = "rgba(20,30,50,.20)"; ctx.beginPath(); ctx.ellipse(x + r * .25, y + r * 1.05, r * .85, r * .26, 0, 0, 6.2832); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y + r * 1.05);
  ctx.bezierCurveTo(x - r * 1.18, y + r * .38, x - r * 1.08, y - r * .9, x, y - r * .62);
  ctx.bezierCurveTo(x + r * 1.08, y - r * .9, x + r * 1.18, y + r * .38, x, y + r * 1.05); ctx.closePath();
  var g = ctx.createRadialGradient(x - r * .38, y - r * .3, r * .08, x, y, r * 1.25);
  g.addColorStop(0, c[0]); g.addColorStop(.45, c[1]); g.addColorStop(1, c[2]);
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = "rgba(40,20,20,.25)"; ctx.lineWidth = .8; ctx.stroke();
  ctx.fillStyle = c[3];
  [[-.45, -.18], [0, -.22], [.45, -.18], [-.62, .18], [-.2, .14], [.22, .14], [.62, .18], [-.3, .5], [.3, .5], [0, .78]].forEach(function (q) {
    ctx.beginPath(); ctx.ellipse(x + q[0] * r, y + q[1] * r, r * .09, r * .13, 0, 0, 6.2832); ctx.fill();
  });
  for (i = 0; i < 5; i++) {
    var a = -Math.PI / 2 + (i - 2) * .55;
    ctx.fillStyle = i % 2 ? "#2f8f3a" : "#3fae4a"; ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * r * .42, y - r * .62 + Math.sin(a) * r * .18 + r * .12, r * .42, r * .14, a, 0, 6.2832); ctx.fill();
  }
  ctx.strokeStyle = "#2f7a33"; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(x, y - r * .66); ctx.lineTo(x + r * .15, y - r * 1.1); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.ellipse(x - r * .42, y - r * .18, r * .16, r * .3, .5, 0, 6.2832); ctx.fill();
}
/* 입체 상자(정면 + 윗면 + 오른쪽 면): 정면 왼쪽 위 (x, y), 폭 w, 높이 h, 깊이 d */
function cube(ctx, x, y, w, h, d, cF, cT, cR, alpha) {
  var dx = d * .7, dy = d * .5;
  ctx.save(); if (alpha != null) ctx.globalAlpha = alpha;
  ctx.fillStyle = cT; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - dy); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cR; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w + dx, y + h - dy); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cF; ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/*MODEL-BEGIN — 계산 모형 (node로 따로 검증한다) */
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function rng(seed) { var s = seed; return function () { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

/* 온실 하루(15분 간격 96칸). Ton: 환기창을 여는 온도, Mon: 물을 주는 토양 수분 */
function farmSim(Ton, Mon) {
  var dt = 0.25, n = 96, T = 14, M = 60, vent = false, i;
  var o = { T: [], M: [], vent: [], wat: [], hot: 0, cold: 0, good: 0, dry: 0, wet: 0, water: 0 };
  for (i = 0; i < n; i++) {
    var t = i * dt;
    var To = 15 + 7 * Math.sin((t - 9) / 24 * 2 * Math.PI);                 // 바깥 기온 8~22℃
    var S = (t > 6 && t < 18) ? Math.sin((t - 6) / 12 * Math.PI) : 0;       // 햇빛 0~1
    if (T >= Ton) vent = true; else if (T < Ton - 2) vent = false;          // 2℃ 여유를 둔 개폐
    var target = vent ? To + 1 + 5 * S : To + 4 + 20 * S;
    T += (target - T) * 0.45;
    M -= (0.6 + 0.12 * Math.max(0, T - 10)) * dt;                           // 더울수록 빨리 마른다
    var w = 0;
    if (M <= Mon) { w = 1; M = Math.min(100, M + 12); o.water += 30; }      // 한 번에 30 L
    M = Math.max(0, M);
    o.T.push(T); o.M.push(M); o.vent.push(vent ? 1 : 0); o.wat.push(w);
    if (T > 30) o.hot += dt; if (T < 10) o.cold += dt; if (T >= 18 && T <= 28) o.good += dt;
    if (M < 45) o.dry += dt; if (M > 80) o.wet += dt;
  }
  return o;
}
function farmOk(o) { return o.hot === 0 && o.good >= 14 && o.dry === 0 && o.wet === 0; }
var TIMER_WATER = 240;   // 3시간마다 무조건 30 L씩 주는 타이머 방식의 하루 물 사용량

/* 빨간 품종: 익을수록 붉고 커진다(숨은 값 u). r 붉은 정도 0~100, s 크기 mm, y 익음 1/0 */
function makeRed(seed, n) {
  var R = rng(seed), a = [], i;
  for (i = 0; i < n; i++) {
    var u = R(), r = clamp(8 + 84 * u + (R() - 0.5) * 24, 2, 98), s = clamp(14 + 30 * u + (R() - 0.5) * 22, 11, 49);
    var y = (u + (R() - 0.5) * 0.08) > 0.5 ? 1 : 0;
    a.push({ r: Math.round(r), s: Math.round(s * 10) / 10, y: y, w: 0 });
  }
  return a;
}
/* 흰 딸기 품종: 익어도 붉어지지 않는다 */
function makeWhite(seed, n) {
  var R = rng(seed), a = [], i;
  for (i = 0; i < n; i++) {
    a.push(i % 2 === 0 ? { r: Math.round(12 + 24 * R()), s: Math.round((30 + 15 * R()) * 10) / 10, y: 1, w: 1 }
                       : { r: Math.round(4 + 16 * R()), s: Math.round((13 + 14 * R()) * 10) / 10, y: 0, w: 1 });
  }
  return a;
}
/* 로지스틱 회귀를 경사 하강법으로 iters 번 갱신 */
function trainStep(pts, w, iters) {
  var k, i, lr = 0.8;
  for (k = 0; k < iters; k++) {
    var g0 = 0, g1 = 0, g2 = 0;
    for (i = 0; i < pts.length; i++) {
      var p = pts[i], x1 = (p.r - 50) / 50, x2 = (p.s - 30) / 20;
      var e = 1 / (1 + Math.exp(-(w[0] + w[1] * x1 + w[2] * x2))) - p.y;
      g0 += e; g1 += e * x1; g2 += e * x2;
    }
    w = [w[0] - lr * g0 / pts.length, w[1] - lr * g1 / pts.length, w[2] - lr * g2 / pts.length];
  }
  return w;
}
function lineOf(w) {                       // 가중치 → 화면의 직선 s = a·r + b
  var w2 = Math.abs(w[2]) < 1e-6 ? 1e-6 : w[2];
  return { a: -20 * w[1] / (50 * w2), b: 30 - 20 * (w[0] - w[1]) / w2 };
}
function errorsOf(pts, a, b) {             // 선보다 위 = 익음으로 판단
  var miss = 0, fa = 0, i;
  for (i = 0; i < pts.length; i++) {
    var pred = pts[i].s > a * pts[i].r + b ? 1 : 0;
    if (pred !== pts[i].y) { if (pts[i].y) miss++; else fa++; }
  }
  return { miss: miss, fa: fa, n: miss + fa };
}
var TRAIN = makeRed(6, 40), TEST_A = makeRed(106, 40), TEST_B = makeWhite(5, 30), WHITE_POOL = makeWhite(99, 40);
function robotLine(nWhite) { return lineOf(trainStep(TRAIN.concat(WHITE_POOL.slice(0, nWhite)), [0, 0, 0], 1500)); }

/* 오인식의 산수: 하루 N명(절반씩 집단 A·B), 찾는 사람 1명(99% 알아봄), 오인식률 fpr%, 집단 B는 ratio 배 */
var FPRS = [5, 2, 1, 0.5, 0.1, 0.05, 0.01, 0.001];
function baseRate(N, fpr, ratio) {
  var fA = fpr / 100, fB = Math.min(1, fA * ratio);
  var faA = N / 2 * fA, faB = N / 2 * fB, tp = 0.99;
  return { faA: faA, faB: faB, fa: faA + faB, tp: tp, prec: tp / (tp + faA + faB) };
}
/* 저울: 편익 무게 합 − 위험 무게 합(안전장치가 걸린 위험은 절반) */
function scaleNet(wb, wr, safe) {
  var B = 0, R = 0, i;
  for (i = 0; i < 3; i++) { B += wb[i]; R += wr[i] * (safe[i] ? 0.5 : 1); }
  return { B: B, R: R, net: B - R };
}
function stance(net) { return net >= 3 ? "도입 찬성 쪽" : (net <= -3 ? "도입 반대 쪽" : "팽팽함(판단 유보)"); }
/*MODEL-END*/

/* 산점도 한 장 — 장면 3·4가 함께 쓴다. 밝은 스튜디오 위 카드 그래프 + 딸기 입체 미니어처 + 오른쪽 흰 판정 카드 */
function drawScatter(ctx, W, H, pts, lines, title, side) {
  ctx.clearRect(0, 0, W, H);
  var LW = 622;
  K.studio(ctx, 0, 0, LW, H, { x: 330, y: H - 20, rx: 300, ry: 26 });
  var g = K.chart(ctx, { x: 6, y: 62, w: LW - 14, h: H - 66, x0: 0, x1: 100, y0: 10, y1: 50, xt: 5, yt: 4, xl: "붉은 정도 (카메라가 잰 값, %) →", yl: "↑ 크기(mm)", pl: 46, light: true });
  function px(r) { return g.X(r); }
  function py(s) { return g.Y(s); }
  function lc(tok) { return tok === "--violet" || tok === "--violet-700" ? LT.violet : LT.blue; }
  ctx.save(); ctx.beginPath(); ctx.rect(g.L, g.T, g.R - g.L, g.B - g.T); ctx.clip();
  lines.forEach(function (L, k) {
    var col = lc(L.c);
    if (k === 0) {                                   // 첫 번째 선의 위쪽을 '익음' 영역으로 칠한다
      var rg = ctx.createLinearGradient(0, g.T, 0, g.B); rg.addColorStop(0, "rgba(240,62,80,.16)"); rg.addColorStop(1, "rgba(240,62,80,.05)");
      ctx.fillStyle = rg; ctx.beginPath();
      ctx.moveTo(px(0), py(L.b)); ctx.lineTo(px(100), py(100 * L.a + L.b)); ctx.lineTo(px(100), -4000); ctx.lineTo(px(0), -4000); ctx.closePath(); ctx.fill();
    }
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 6; ctx.setLineDash(L.dash ? [10, 6] : []);
    ctx.beginPath(); ctx.moveTo(px(0), py(L.b)); ctx.lineTo(px(100), py(100 * L.a + L.b)); ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
  });
  ctx.restore();
  var L0 = lines[0];
  pts.slice().sort(function (p, q) { return q.s - p.s; }).forEach(function (p) {
    var X = px(p.r), Y = py(p.s), bad = (p.s > L0.a * p.r + L0.b ? 1 : 0) !== p.y;
    berry(ctx, X, Y, 6.6, (p.w ? "w" : "r") + (p.y ? "r" : "u"));
    if (bad) {
      ctx.save(); ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X - 10, Y - 10); ctx.lineTo(X + 10, Y + 10); ctx.moveTo(X + 10, Y - 10); ctx.lineTo(X - 10, Y + 10); ctx.stroke();
      ctx.strokeStyle = "#12203a"; ctx.lineWidth = 1.8; ctx.stroke(); ctx.restore();
    }
  });
  /* 큰 글자: 결과 한 줄 + 무엇을 보는 그림인지 */
  var r1 = side[1] || { t: "" };
  K.bigText(ctx, r1.t, 18, 38, 22, r1.c === "--green-700" ? "#8ce99a" : "#ffffff");
  note(ctx, title, 20, 58, { s: 11.5, w: "800", c: LT.mute });
  K.warn(ctx, LW - 12, 30, "⚠ 딸기 크기는 보기 쉽게 그림", "right");
  /* 오른쪽 흰 판정 카드 */
  var RX = LW + 8, sx = RX + 18, sy = 58;
  judgeCard(ctx, RX, W, H, "범례와 판정");
  berry(ctx, sx + 7, sy - 4, 6.5, "rr"); note(ctx, "익음 (할머니의 판정)", sx + 22, sy, { c: LT.ink });
  berry(ctx, sx + 7, sy + 20, 6.5, "ru"); note(ctx, "안 익음 (할머니의 판정)", sx + 22, sy + 24, { c: LT.ink });
  berry(ctx, sx + 7, sy + 44, 6.5, "wr"); note(ctx, "흰 딸기 품종 (익음)", sx + 22, sy + 48, { s: 11, c: LT.mute });
  ctx.save(); ctx.strokeStyle = "#12203a"; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(sx + 1, sy + 60); ctx.lineTo(sx + 13, sy + 72); ctx.moveTo(sx + 13, sy + 60); ctx.lineTo(sx + 1, sy + 72); ctx.stroke(); ctx.restore();
  note(ctx, "로봇이 잘못 가른 열매", sx + 22, sy + 71, { s: 11, c: LT.mute });
  ctx.fillStyle = "rgba(240,62,80,.16)"; ctx.fillRect(sx, sy + 82, 14, 12);
  note(ctx, "붉은 칸 = 로봇이 ‘익음’으로 보는 쪽", sx + 22, sy + 93, { s: 11, c: LT.mute });
  function col(tok) { return tok === "--green-700" ? LT.green : (tok === "--rose-700" ? LT.red : (tok === "--violet-700" ? LT.violet : (tok === "--brand-700" ? LT.blue : (tok === "--mist" ? LT.mute : LT.ink)))); }
  var y = sy + 128;
  side.forEach(function (row, i) {
    if (i === 1) {
      ctx.fillStyle = row.c === "--green-700" ? "#e7f7f0" : "#fdeee4"; ctx.beginPath(); ctx.roundRect(sx - 6, y - 21, W - sx - 12, 32, 10); ctx.fill();
      K.t(ctx, row.t, sx + 4, y + 1, { s: 15, w: "900", c: row.c === "--green-700" ? "#0f766e" : "#b4400c" });
      y += 34;
    } else {
      K.t(ctx, row.t, sx, y, { s: row.s && row.s < 13 ? 11.5 : 12.5, w: row.w || "700", c: col(row.c) });
      y += i === 0 ? 30 : 22;
    }
  });
}

/* =========================================================================
   이야기 ① 할머니의 딸기 온실
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "설계 파일 ①", onDone: finish });

  window.sthGate({
    gate: "g1", key: "p1", title: "설계자의 첫 예상",
    question: "센서와 인공지능에 온실을 맡기면 어떻게 될까요?",
    options: ["㉠ 기계는 지치지도 실수하지도 않으니, 사람 없이 완벽하게 돌아간다", "㉡ 익숙한 상황에서는 사람보다 잘하지만, 처음 보는 상황에서는 엉뚱하게 틀릴 수 있다", "㉢ 기계는 살아 있는 작물을 다룰 수 없으니 별 도움이 안 된다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 사물 인터넷 규칙 제어 */
  (function () {
    var canvas = $("a-farm"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var Ton = 35, Mon = 30, ci = 56, playing = !REDUCE, last = null;
    function mix(a, b, u) { return "rgb(" + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * u); }).join(",") + ")"; }
    /* ── 위: 스마트 온실을 블록처럼 잘라 본 모형 (앞벽·오른쪽 벽은 잘라 냄) ── */
    var DH = 420, GZ = 28, WT = GZ + 110, RZ = GZ + 160;
    var X0 = 30, X1 = 520, Y0 = 25, Y1 = 250, YM = (Y0 + Y1) / 2;
    var I = K.iso({ ox: 400, oy: 92, s: 0.72, L: 580, D: 250 });
    function P(x, y, z) { return I.P(x, y, z); }
    function poly(pts, fill, stroke, lw) {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }
    function seg(a, b, col, lw) { ctx.strokeStyle = col; ctx.lineWidth = lw || 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    function roofZ(y) { return y <= YM ? WT + (RZ - WT) * (y - Y0) / (YM - Y0) : RZ - (RZ - WT) * (y - YM) / (Y1 - YM); }
    function airCol(T, a) { return (T > 30 ? "rgba(255,107,129," : (T > 28 ? "rgba(255,179,92," : (T >= 18 ? "rgba(63,211,163," : "rgba(127,180,255,"))) + a + ")"; }
    function soilHex(Mo) {
      var u = clamp(Mo / 100, 0, 1), a = [176, 138, 90], b = [62, 42, 26];
      return "#" + a.map(function (c, k) { var x = Math.round(c + (b[k] - c) * u); return (x < 16 ? "0" : "") + x.toString(16); }).join("");
    }
    function diorama(o) {
      var t = ci * 0.25, S = (t > 6 && t < 18) ? Math.sin((t - 6) / 12 * Math.PI) : 0, night = 1 - Math.min(1, S * 3);
      var T = o.T[ci], Mo = o.M[ci], vent = !!o.vent[ci], wat = !!(o.wat[ci] || (ci > 0 && o.wat[ci - 1])), i, k;
      K.studio(ctx, 0, 0, W, DH, { x: 470, y: 335, rx: 330, ry: 66 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, DH, 14); ctx.clip();
      /* 밤에는 스튜디오도 어두워진다 */
      if (night > 0) {
        ctx.fillStyle = "rgba(12,20,52," + (0.62 * night).toFixed(2) + ")"; ctx.fillRect(0, 0, W, DH);
        var Rs = K.rng(4); ctx.fillStyle = "#ffffff";
        for (i = 0; i < 46; i++) { ctx.globalAlpha = night * (0.3 + 0.6 * Rs()); ctx.fillRect(430 + Rs() * 470, Rs() * 170, 1.4, 1.4); }
        ctx.globalAlpha = 1;
      }
      /* 해·달 — 오른쪽 하늘을 지나간다 */
      if (S > 0) K.sun(ctx, 590 + (t - 6) / 12 * 270, 160 - S * 112, 13);
      else { var mt = t < 6 ? t + 24 : t, mu = (mt - 18) / 12; K.glow(ctx, 590 + mu * 270, 160 - Math.sin(mu * Math.PI) * 100, 9, "rgba(250,244,210,.98)", 2.4); }
      /* 땅 블록 — 앞면이 온실 흙의 단면 */
      var soil = soilHex(Mo);
      I.box(ctx, 0, 0, 0, I.L, I.D, GZ, "#8fbf63", "#8a6a48", "#6d523a");
      I.face(ctx, "front", function (Lw) {
        ctx.fillStyle = soil; ctx.fillRect(X0, 0, X1 - X0, GZ);
        if (wat) { var wg = ctx.createLinearGradient(0, GZ, 0, GZ - 14); wg.addColorStop(0, "rgba(40,70,120,.55)"); wg.addColorStop(1, "rgba(40,70,120,0)"); ctx.fillStyle = wg; ctx.fillRect(X0, GZ - 14, X1 - X0, 14); }
        var R = K.rng(9);
        for (var q = 0; q < 220; q++) { ctx.fillStyle = R() > .5 ? "rgba(255,255,255,.14)" : "rgba(40,25,10,.25)"; ctx.fillRect(R() * Lw, R() * GZ, 1.6, 1.6); }
        ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(X0, 0); ctx.lineTo(X0, GZ); ctx.moveTo(X1, 0); ctx.lineTo(X1, GZ); ctx.stroke();
        /* 토양 수분 센서 막대 */
        ctx.fillStyle = "#cfd6df"; ctx.fillRect(438, GZ - 22, 3, 22); ctx.fillRect(446, GZ - 22, 3, 22);
      });
      I.plane(ctx, GZ + 0.2, "#b49d7a", null, X0, X1, Y0, Y1);
      I.edges(ctx, GZ, GZ);
      /* 물탱크 · 할머니 집 (온실 밖) */
      var tb = P(15, 160, GZ), tt = P(15, 160, GZ + 46);
      var tg = ctx.createLinearGradient(tb.x - 13, 0, tb.x + 13, 0); tg.addColorStop(0, "#7fc4ff"); tg.addColorStop(.6, "#3a86d8"); tg.addColorStop(1, "#235a9c");
      ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(tb.x - 13, tb.y); ctx.lineTo(tt.x - 13, tt.y); ctx.ellipse(tt.x, tt.y, 13, 5, 0, Math.PI, 0); ctx.lineTo(tb.x + 13, tb.y); ctx.ellipse(tb.x, tb.y, 13, 5, 0, 0, Math.PI); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#9fd2ff"; ctx.beginPath(); ctx.ellipse(tt.x, tt.y, 13, 5, 0, 0, 6.2832); ctx.fill();
      I.house(ctx, 532, 40, GZ, 40, 36, 26, "#c0553f");
      /* 뒷벽 · 왼쪽 벽 · 뒤 지붕 — 유리 너머 공기 색 = 온도 */
      var glass = "rgba(222,236,255,.30)";
      [[P(X0, Y0, GZ), P(X1, Y0, GZ), P(X1, Y0, WT), P(X0, Y0, WT)],
       [P(X0, Y0, GZ), P(X0, Y1, GZ), P(X0, Y1, WT), P(X0, YM, RZ), P(X0, Y0, WT)],
       [P(X0, Y0, WT), P(X1, Y0, WT), P(X1, YM, RZ), P(X0, YM, RZ)]].forEach(function (pp) { poly(pp, glass); poly(pp, airCol(T, 0.26), "rgba(255,255,255,.55)", 1); });
      for (i = 1; i < 8; i++) { var gx = X0 + (X1 - X0) * i / 8; seg(P(gx, Y0, GZ), P(gx, Y0, WT), "rgba(255,255,255,.4)", 1); seg(P(gx, Y0, WT), P(gx, YM, RZ), "rgba(255,255,255,.4)", 1); }
      /* 두둑(검은 비닐) 과 딸기 포기 — 뒤에서부터 */
      [45, 100, 155, 210].forEach(function (yr) {
        I.box(ctx, X0 + 25, yr, GZ, X1 - 25, yr + 26, GZ + 9, "#30353b", "#41474e", "#24282d");
        for (var x = X0 + 45; x < X1 - 30; x += 34) {
          var p = P(x, yr + 13, GZ + 9), lc = Mo < 45 ? "#9aa23c" : "#2fae6a";
          ctx.fillStyle = K.tint(lc, 0.78);
          ctx.beginPath(); ctx.ellipse(p.x - 5, p.y - 4, 6, 3.6, -0.5, 0, 6.2832); ctx.fill();
          ctx.fillStyle = lc;
          ctx.beginPath(); ctx.ellipse(p.x + 5, p.y - 4, 6, 3.6, 0.5, 0, 6.2832); ctx.fill();
          ctx.beginPath(); ctx.ellipse(p.x, p.y - 8, 5, 3.4, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = "#ff4d63"; ctx.beginPath(); ctx.arc(p.x + (Math.round(x / 34) % 2 ? 6 : -6), p.y + 1, 2.2, 0, 6.2832); ctx.fill();
        }
      });
      /* 물 주는 관 — 탱크 → 밸브 → 천장 관 */
      var pz = WT - 12;
      seg(tt, P(15, 160, pz), "#8d96a3", 3); seg(P(15, 160, pz), P(X0 + 8, 160, pz), "#8d96a3", 3);
      seg(P(X0 + 8, 75, pz), P(X0 + 8, 200, pz), "#8d96a3", 3);
      [75, 200].forEach(function (yp) { seg(P(X0 + 8, yp, pz), P(X1 - 15, yp, pz), "#aab3bf", 2.6); });
      var vp = P(22, 160, pz); ctx.fillStyle = wat ? "#3fa9ff" : "#d0d5dc"; ctx.beginPath(); ctx.arc(vp.x, vp.y, 4.5, 0, 6.2832); ctx.fill(); ctx.strokeStyle = "#5b6472"; ctx.lineWidth = 1.2; ctx.stroke();
      if (wat) {
        [75, 200].forEach(function (yp, j) {
          for (k = 0; k < 12; k++) {
            var xd = X0 + 40 + k * 38, f = ((k * 0.37 + j * 0.5 + ci * 0.21) % 1), dp = P(xd, yp + (f - 0.5) * 30, pz - 4 - f * (pz - GZ - 16));
            K.glow(ctx, dp.x, dp.y, 1.7, "rgba(90,180,255,.95)", 2.4);
          }
        });
      }
      /* 온도 센서 (용마루에 매달림) */
      var sp = P(140, YM, GZ + 76);
      seg(P(140, YM, RZ), P(140, YM, GZ + 82), "#6b7380", 1.2);
      I.box(ctx, 133, YM - 7, GZ + 70, 147, YM + 7, GZ + 82, "#f4f6f8", "#dfe3e8", "#b9c0c8");
      /* 앞 지붕(유리) 과 환기창 */
      var fr = [P(X0, YM, RZ), P(X1, YM, RZ), P(X1, Y1, WT), P(X0, Y1, WT)];
      poly(fr, "rgba(222,236,255,.10)"); poly(fr, airCol(T, 0.08));
      var VX0 = 200, VX1 = 340, vy = 48, kk = (RZ - WT) / (Y1 - YM), th0 = Math.atan(kk), vl = vy / Math.cos(th0), th = vent ? th0 - 1.0 : th0;
      function vpt(x) { return P(x, YM + vl * Math.cos(th), RZ - vl * Math.sin(th)); }
      if (vent) poly([P(VX0, YM, RZ), P(VX1, YM, RZ), P(VX1, YM + vy, RZ - vy * kk), P(VX0, YM + vy, RZ - vy * kk)], "rgba(40,50,70,.28)");
      poly([P(VX0, YM, RZ), P(VX1, YM, RZ), vpt(VX1), vpt(VX0)], vent ? "rgba(255,226,140,.35)" : "rgba(222,236,255,.28)", vent ? KC.yellow : "rgba(255,255,255,.85)", vent ? 2.4 : 1.4);
      if (vent) for (k = 0; k < 3; k++) {
        var hx = VX0 + 30 + k * 40, rise = 10 + 18 * ((ci * 0.3 + k * 0.33) % 1);
        K.arrow(ctx, P(hx, YM + 18, RZ - 8), P(hx, YM + 18, RZ + 22 + rise), "rgba(255,150,90,.9)", 2, 7);
      }
      /* 뼈대 — 잘라 낸 앞벽·오른쪽 벽은 흰 선 */
      ctx.save(); ctx.lineJoin = "round";
      [[P(X0, Y1, GZ), P(X0, Y1, WT)], [P(X0, Y0, GZ), P(X0, Y0, WT)], [P(X1, Y0, GZ), P(X1, Y0, WT)], [P(X0, YM, RZ), P(X1, YM, RZ)]].forEach(function (s2) { seg(s2[0], s2[1], "#7d8794", 2); });
      for (i = 0; i <= 8; i++) { var rx = X0 + (X1 - X0) * i / 8; seg(P(rx, YM, RZ), P(rx, Y1, WT), "rgba(125,135,148,.75)", 1.2); }
      ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2.4; ctx.beginPath();
      [P(X0, Y1, WT), P(X1, Y1, WT), P(X1, YM, RZ), P(X1, Y0, WT), P(X1, Y0, GZ)].forEach(function (p, j) { if (j) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
      ctx.moveTo(P(X1, Y1, WT).x, P(X1, Y1, WT).y); ctx.lineTo(P(X1, Y1, GZ).x, P(X1, Y1, GZ).y);
      ctx.stroke(); ctx.restore();
      /* 제어기 (센서 값 → 규칙 → 장치) */
      I.box(ctx, 541, 206, GZ, 546, 211, GZ + 22, "#9aa3b0", "#8a93a0", "#6f7884");
      I.box(ctx, 532, 198, GZ + 22, 556, 220, GZ + 48, "#f2f4f7", "#d7dce3", "#aab2bd");
      var an1 = P(552, 202, GZ + 66); seg(P(552, 202, GZ + 48), an1, "#5b6472", 1.4);
      /* 밤에는 블록도 어둡게 */
      if (night > 0) { ctx.fillStyle = "rgba(12,20,52," + (0.24 * night).toFixed(2) + ")"; ctx.fillRect(0, 0, W, DH); }
      /* 빛나는 것: 집 창문·센서 불빛·전파 */
      var win = P(552, 76, GZ + 13);
      K.glow(ctx, win.x, win.y, 3, night > 0.5 ? "rgba(120,140,190,.7)" : "rgba(255,226,150,.8)", 1.4);
      K.glow(ctx, sp.x, sp.y + 2, 2.4, T > 30 ? "rgba(255,90,110,.98)" : "rgba(63,211,163,.98)", 2.4);
      var ld = P(544, 220, GZ + 40); K.glow(ctx, ld.x, ld.y, 2.2, "rgba(63,211,163,.98)", 2.2);
      var pulse = (ci * 0.25) % 1;
      [[an1, 1], [P(140, YM, RZ + 6), 0.6]].forEach(function (w0) {
        for (k = 0; k < 3; k++) {
          var r = 6 + k * 6 + pulse * 6;
          ctx.strokeStyle = "rgba(127,211,255," + (0.85 - k * 0.25).toFixed(2) + ")"; ctx.lineWidth = 1.6 * w0[1] + 0.4;
          ctx.beginPath(); ctx.arc(w0[0].x, w0[0].y, r * w0[1], -2.4, -0.75); ctx.stroke();
        }
      });
      ctx.restore();
      /* 이름표 */
      var bx = [4, W - 4];
      I.label(ctx, 140, YM, GZ + 70, "🌡️ 온도 센서", -60, 70, "#ffd9a8", bx);
      I.label(ctx, 270, YM + 30, roofZ(YM + 30), "환기창 · 규칙 ①이 여닫음", 70, -96, vent ? "#ffe9a8" : "#e8ecff", bx);
      I.label(ctx, X1 - 40, 75, pz, "물 주는 관 · 규칙 ②가 밸브를 엶", 70, -40, "#bfe6ff", bx);
      I.label(ctx, 444, Y1, GZ - 8, "💧 토양 수분 센서 (흙 단면)", 50, 34, "#bfe6ff", bx);
      I.label(ctx, 556, 210, GZ + 36, "제어기 · 무선으로 연결", 34, 12, "#e8ecff", bx);
      /* 왼쪽 읽음 */
      var hh = Math.floor(t), mm = Math.round((t - hh) * 60);
      K.pill(ctx, (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm + " · " + (S > 0 ? "낮" : "밤"), 18, 128, { s: 13, c: S > 0 ? KC.yellow : KC.blue, box: bx });
      K.pill(ctx, "🌡️ 온실 " + T.toFixed(1) + "℃", 18, 156, { s: 12.5, c: T > 30 ? KC.red : (T >= 18 && T <= 28 ? KC.green : KC.blue), box: bx });
      K.pill(ctx, "💧 흙 " + Math.round(Mo) + "%", 18, 184, { s: 12.5, c: Mo < 45 || Mo > 80 ? KC.red : KC.blue, box: bx });
      K.pill(ctx, vent ? "환기창 열림" : "환기창 닫힘", 18, 212, { s: 11.5, c: vent ? KC.yellow : KC.mute, box: bx });
      if (o.wat[ci]) K.pill(ctx, "밸브 열림 · 물 주는 중", 18, 240, { s: 11.5, c: KC.blue, box: bx });
      /* 큰 제목 — 이 규칙으로 보낸 하루의 결과 */
      var h1, h2, hc;
      if (farmOk(o)) { h1 = "센서가 온실을 지킨다"; h2 = "사람이 밤새 깨지 않아도 된다 · 물 " + o.water + " L"; hc = "#3fd3a3"; }
      else if (o.hot > 0) { h1 = "한낮에 온실이 찜통"; h2 = "고온 피해 " + o.hot + "시간"; hc = "#ff8a9a"; }
      else if (o.good < 14) { h1 = "온실이 데워질 틈이 없다"; h2 = "알맞은 온도 " + o.good + "시간뿐"; hc = "#9fd2ff"; }
      else if (o.dry > 0) { h1 = "흙이 바싹 마른다"; h2 = "마른 시간 " + o.dry + "시간"; hc = "#ffd35a"; }
      else { h1 = "물이 넘친다 — 과습"; h2 = "과습 " + o.wet + "시간 · 물 " + o.water + " L"; hc = "#9fd2ff"; }
      K.bigText(ctx, h1, 20, 48, 27, "#ffffff");
      K.bigText(ctx, h2, 20, 82, 17, hc);
      K.warn(ctx, 14, DH - 16, "⚠ 온실·장치 크기는 보기 쉽게 바꿈 · 앞벽과 오른쪽 벽은 잘라 냄");
    }
    function render(o) {
      ctx.clearRect(0, 0, W, H);
      var n = o.T.length, i, t = ci * 0.25;
      var T = o.T[ci], Mo = o.M[ci];
      diorama(o);
      /* ── 아래: 하루 그래프 (밝은 카드 그래프) + 오른쪽 흰 판정 카드 ── */
      var SY = DH + 8, CW = 642, ok = farmOk(o);
      K.studio(ctx, 0, SY, CW, H - SY);
      var g1 = K.chart(ctx, { x: 4, y: SY + 6, w: CW - 8, h: 138, x0: 0, x1: 24, y0: 0, y1: 45, xt: 8, yt: 3, pb: 12, pl: 40, light: true, xf: function () { return ""; } });
      ctx.fillStyle = "rgba(15,159,118,.13)"; ctx.fillRect(g1.L, g1.Y(28), g1.R - g1.L, g1.Y(18) - g1.Y(28));
      K.line(ctx, { x: g1.L, y: g1.Y(30) }, { x: g1.R, y: g1.Y(30) }, LT.red, 1.6, [6, 5]);
      K.line(ctx, { x: g1.L, y: g1.Y(Ton) }, { x: g1.R, y: g1.Y(Ton) }, LT.yellow, 2, [6, 5]);
      var pT = o.T.map(function (q, k) { return [k * 0.25, clamp(q, 0, 45)]; });
      K.plot(ctx, g1, pT, LT.orange, { w: 2.8, light: true });
      function cursor(g, yv, col) {                       /* 지금 시각 (이름표보다 먼저) */
        K.line(ctx, { x: g.X(t), y: g.T }, { x: g.X(t), y: g.B }, "rgba(20,40,90,.45)", 1.3);
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(g.X(t), g.Y(yv), 6, 0, 6.2832); ctx.fill();
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(g.X(t), g.Y(yv), 4, 0, 6.2832); ctx.fill();
      }
      cursor(g1, clamp(T, 0, 45), LT.orange);
      lpill(ctx, "고온 피해 30℃", g1.X(2.2), g1.Y(30) - 6, { s: 10.5, c: LT.red });
      lpill(ctx, "규칙 ① " + Ton + "℃", g1.R - 4, g1.Y(Ton) - 6, { s: 10.5, a: "right", c: "#a85d00" });
      lpill(ctx, "🌡️ 온실 안 온도 (℃)", g1.L + 8, g1.T + 16, { s: 12, c: LT.orange });
      note(ctx, "초록 띠 = 알맞은 범위 (18~28℃)", g1.L + 10, g1.Y(28) + 15, { s: 10.5, c: LT.green });
      for (i = 0; i < n; i++) if (o.vent[i]) { ctx.fillStyle = "rgba(245,159,0,.85)"; ctx.fillRect(g1.X(i * 0.25) + 0.5, g1.B + 7, (g1.R - g1.L) / 96 - 1, 9); }
      note(ctx, "환기창", g1.L - 6, g1.B + 16, { s: 10.5, a: "right" });
      var g2 = K.chart(ctx, { x: 4, y: g1.B + 24, w: CW - 8, h: H - (g1.B + 24) - 4, x0: 0, x1: 24, y0: 0, y1: 100, xt: 8, yt: 4, pl: 40, light: true, xf: function (q) { return q + "시"; } });
      ctx.fillStyle = "rgba(15,159,118,.13)"; ctx.fillRect(g2.L, g2.Y(80), g2.R - g2.L, g2.Y(45) - g2.Y(80));
      K.line(ctx, { x: g2.L, y: g2.Y(Mon) }, { x: g2.R, y: g2.Y(Mon) }, LT.teal, 2, [6, 5]);
      K.plot(ctx, g2, o.M.map(function (q, k) { return [k * 0.25, q]; }), LT.blue, { w: 2.8, light: true });
      cursor(g2, Mo, LT.blue);
      for (i = 0; i < n; i++) if (o.wat[i]) { var wx = g2.X(i * 0.25); ctx.fillStyle = LT.teal; ctx.beginPath(); ctx.moveTo(wx, g2.T + 12); ctx.lineTo(wx - 4.5, g2.T + 3); ctx.lineTo(wx + 4.5, g2.T + 3); ctx.closePath(); ctx.fill(); }
      lpill(ctx, "규칙 ② " + Mon + "%", g2.R - 4, g2.Y(Mon) - 6, { s: 10.5, a: "right", c: LT.teal });
      lpill(ctx, "💧 토양 수분 (%) · ▼ 물 준 때", g2.L + 8, g2.T + 14, { s: 12, c: LT.blue });
      note(ctx, "초록 띠 = 알맞은 범위 (45~80%)", g2.L + 250, g2.T + 14, { s: 10.5, c: LT.green });
      /* 오른쪽 흰 판정 카드 — 하루 결과 */
      var RX = CW + 8, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, SY, W - RX, H - SY, "하루 판정 (24시간)");
      K.t(ctx, ok ? "네 조건 모두 지킴" : "못 지킨 조건 있음", x0, SY + 58, { s: 17, w: "900", c: ok ? LT.green : LT.orange });
      [["고온 피해 (30℃ 초과)", o.hot + "시간", o.hot === 0], ["알맞은 온도 (18~28℃)", o.good + "시간", o.good >= 14], ["흙 마름 (45% 미만)", o.dry + "시간", o.dry === 0], ["과습 (80% 초과)", o.wet + "시간", o.wet === 0]].forEach(function (rw, k) {
        K.row(ctx, (rw[2] ? "✓ " : "✗ ") + rw[0], rw[1], x0, x1, SY + 90 + k * 25, rw[2] ? LT.green : LT.red);
      });
      K.row(ctx, "물 사용", o.water + " L", x0, x1, SY + 196, LT.blue);
      K.bar(ctx, x0, SY + 206, x1 - x0, o.water / TIMER_WATER, LT.blue);
      note(ctx, "막대 끝 = 3시간마다 주는 타이머 " + TIMER_WATER + " L", x0, SY + 232, { s: 10.5 });
      K.tip(ctx, ok ? "센서가 필요한 때만 장치를 움직임" : (o.hot > 0 ? "환기창이 너무 늦게 열립니다" : (o.good < 14 ? "환기창이 너무 일찍 열립니다" : (o.dry > 0 ? "물을 너무 늦게 줍니다" : "물을 너무 자주 줍니다"))), x0 - 6, H - 44, x1 - x0 + 12, ok);
    }
    function draw() {
      var o = farmSim(Ton, Mon); last = o; render(o);

      var ok = farmOk(o), save = Math.round((1 - o.water / TIMER_WATER) * 100);
      $("a-farm-read").innerHTML = "<span class='k'>알맞은 온도</span><span class='v " + (o.good >= 14 ? "g" : "y") + "'>" + o.good + "시간</span>" +
        "<span class='sub'>고온 피해 " + o.hot + " · 마름 " + o.dry + " · 과습 " + o.wet + "시간</span>" +
        "<span class='k'>물 사용</span><span class='v b'>" + o.water + " L</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "네 조건을 모두 지킴" : "아직 지키지 못한 조건이 있습니다") + "</span>";
      $("a-farm-info").innerHTML = "고온 피해 <b>" + o.hot + "시간</b> · 알맞은 온도 <b>" + o.good + "시간</b> · 마름 <b>" + o.dry + "시간</b> · 과습 <b>" + o.wet + "시간</b> · 물 사용 <b>" + o.water + " L</b>" +
        (o.water <= TIMER_WATER ? " (3시간마다 무조건 주는 타이머 방식 " + TIMER_WATER + " L보다 " + save + "% 적음)" : " (타이머 방식 " + TIMER_WATER + " L보다도 많음)") + "<br>" +
        (ok ? "✅ 네 조건을 모두 지켰습니다. 사람이 밤새 지키지 않아도 센서와 규칙이 온실을 돌봅니다." :
          (o.hot > 0 ? "환기창이 너무 늦게 열려 한낮에 온실이 찜통이 됩니다. " : "") +
          (o.hot === 0 && o.good < 14 ? "환기창이 너무 일찍 열려 온실이 데워질 틈이 없습니다. " : "") +
          (o.dry > 0 ? "물을 너무 늦게 줘서 흙이 마릅니다. " : "") + (o.wet > 0 ? "흙이 마르기도 전에 물을 계속 줘서 과습입니다. 뿌리가 썩고 물도 낭비됩니다." : ""));
      [["m-a2a", o.hot === 0], ["m-a2b", o.good >= 14], ["m-a2c", o.dry === 0], ["m-a2d", o.wet === 0]].forEach(function (c) { var e = $(c[0]); if (e) e.classList.toggle("done", c[1]); });
      if (ok) {
        window.sthState("farmBest", "환기 " + Ton + "℃·물 " + Mon + "%");
        window.sthMission("m-a2", true, "<span class='m-tag'>미션 완료</span>‘온도 " + Ton + "℃ 이상이면 환기, 수분 " + Mon + "% 이하이면 물 주기’ 규칙으로 하루를 무사히 넘겼습니다. 물은 " + o.water + " L만 썼습니다. 센서가 <b>필요한 때에만</b> 장치를 움직이기 때문입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    playBtn("a-farm-play", function () { return playing; }, function (x) { playing = x; }, "⏸ 하루 멈추기", "▶ 하루 돌려 보기");
    K.animate(canvas, function (dt) { if (playing && last) { ci = (ci + 1) % 96; render(last); } }, 8);
    $("a-ton").addEventListener("input", function (e) { Ton = +e.target.value; $("a-ton-val").textContent = Ton + "℃"; draw(); });
    $("a-mon").addEventListener("input", function (e) { Mon = +e.target.value; $("a-mon-val").textContent = Mon + "%"; draw(); });
    draw();
    if (ep.cleared(1)) window.sthMission("m-a2", true, "<span class='m-tag'>미션 완료</span>내가 찾은 규칙: <b>" + (window.sthState("farmBest") || "-") + "</b>. 센서가 필요한 때에만 장치를 움직여 사람의 수고와 물을 함께 줄였습니다.");
  })();

  /* 장면 3 — 분류기: 직접 긋기와 기계 학습 */
  (function () {
    var canvas = $("a-cls"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var a = 0, b = 30, ai = null, busy = false;
    var got = window.sthState("cls") || { a: false, b: false };
    function draw() {
      var e = errorsOf(TRAIN, a, b), lines = [{ a: a, b: b, c: "--brand" }];
      var side = [
        { t: "내가 그은 선 (파란 실선)", c: "--brand-700", w: "800" },
        { t: "잘못 가른 열매 " + e.n + " / 40개", s: 15, w: "900", c: e.n <= 2 ? "--green-700" : "--rose-700" },
        { t: "· 익었는데 놓침 " + e.miss + "개", s: 12 },
        { t: "· 안 익었는데 땀 " + e.fa + "개", s: 12 }
      ];
      if (ai) {
        var L = lineOf(ai.w), ea = errorsOf(TRAIN, L.a, L.b);
        lines.push({ a: L.a, b: L.b, c: "--violet", dash: true });
        side.push({ t: "기계가 찾은 선 (보라 점선)", c: "--violet-700", w: "800" });
        side.push({ t: "학습 " + ai.it + "회째 · 오류 " + ea.n + "개", s: 12 });
      }
      drawScatter(ctx, W, H, TRAIN, lines, "학습 데이터: 할머니가 표시해 준 빨간 품종 딸기 40개", side);
      $("a-cls-info").innerHTML = "선보다 위쪽에 있는 열매를 ‘익음’으로 판단합니다. ✕ 표시는 그 판단이 할머니의 판정과 다른 열매입니다. " +
        (e.n <= 2 ? "✅ 40개 중 " + (40 - e.n) + "개를 맞혔습니다(정확도 " + Math.round((40 - e.n) / 40 * 100) + "%)." : "크기만 보는 수평선으로는 부족합니다. <b>붉은 정도와 크기를 함께</b> 보도록 선을 기울여 보세요.") +
        (ai && ai.end ? "<br>🤖 기계는 선을 아무 데나 그어 놓고, 틀린 만큼 조금씩 선을 옮기는 일을 " + ai.it + "번 되풀이해 기울기 <b>" + lineOf(ai.w).a.toFixed(2) + "</b>, 높이 <b>" + Math.round(lineOf(ai.w).b) + "</b>인 선을 찾았습니다. 이렇게 <b>데이터에서 규칙을 스스로 찾는 것</b>이 기계 학습입니다." : "");
      if (e.n <= 2 && !got.a) { got.a = true; window.sthState("cls", got); mission(); }
    }
    function mission() {
      if (got.a) done("m-a3a"); if (got.b) done("m-a3b");
      if (got.a && got.b) {
        window.sthMission("m-a3", true, "<span class='m-tag'>미션 완료</span>사람이 규칙을 말로 쓰기 어려운 일도, <b>정답이 표시된 데이터</b>가 있으면 기계가 규칙(선)을 스스로 찾아냅니다. 다만 그 선은 <b>학습에 쓴 40개</b>에 맞춘 것입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("a-sl").addEventListener("input", function (e) { a = +e.target.value; $("a-sl-val").textContent = a.toFixed(2); draw(); });
    $("a-ic").addEventListener("input", function (e) { b = +e.target.value; $("a-ic-val").textContent = b; draw(); });
    $("a-learn").addEventListener("click", function () {
      if (busy) return;
      busy = true; $("a-learn").disabled = true;
      ai = { w: [0, 0, 1], it: 0, end: false };           // 크기만 보는 수평선에서 출발
      var f = 0;
      (function step() {
        draw();
        if (f >= 60) {
          ai.end = true; busy = false; $("a-learn").disabled = false; $("a-learn").textContent = "↻ 학습 과정 다시 보기";
          got.b = true; window.sthState("cls", got); draw(); mission(); return;
        }
        var k = f < 24 ? 1 : 40;
        ai.w = trainStep(TRAIN, ai.w, k); ai.it += k; f++;
        window.setTimeout(step, f < 24 ? 130 : 45);
      })();
    });
    draw(); mission();
  })();

  /* 장면 4 — 학습 데이터 밖의 열매 */
  (function () {
    var canvas = $("a-test"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var saved = window.sthState("gen") || { a: false, b: false, n: 0 };
    var set = "A", nAdd = 0, nTrained = saved.b ? saved.n : 0, L = robotLine(nTrained), log = [];
    function acc(pts) { return Math.round((pts.length - errorsOf(pts, L.a, L.b).n) / pts.length * 100); }
    function draw() {
      var pts = set === "A" ? TEST_A : TEST_B, e = errorsOf(pts, L.a, L.b), aA = acc(TEST_A), aB = acc(TEST_B);
      drawScatter(ctx, W, H, pts, [{ a: L.a, b: L.b, c: "--violet" }],
        set === "A" ? "시험 ① 로봇이 처음 보는, 같은 빨간 품종 열매 40개" : "시험 ② 로봇이 처음 보는, 흰 딸기 품종 열매 30개", [
          { t: "로봇의 선 (학습: 빨강 40 + 흰 " + nTrained + ")", c: "--violet-700", w: "800", s: 12 },
          { t: "이 시험의 정확도 " + (set === "A" ? aA : aB) + "%", s: 15, w: "900", c: (set === "A" ? aA : aB) >= 85 ? "--green-700" : "--rose-700" },
          { t: "· 익었는데 놓침 " + e.miss + "개", s: 12 },
          { t: "· 안 익었는데 땀 " + e.fa + "개", s: 12 },
          { t: "빨간 품종 " + aA + "% · 흰 품종 " + aB + "%", s: 12, c: "--mist" }
        ]);
      var msg = set === "A"
        ? "같은 품종의 새 열매에서는 정확도 <b>" + aA + "%</b>입니다. 학습한 것과 비슷한 상황에서는 잘 맞습니다."
        : (aB < 85 && nTrained === 0 ? "흰 딸기에서는 정확도 <b>" + aB + "%</b>. 다 익은 흰 딸기를 거의 모두 ‘안 익음’으로 판단합니다. 로봇이 고장 난 것이 아닙니다. <b>학습 데이터에 흰 딸기가 한 개도 없었기</b> 때문에, 로봇에게 ‘익음’은 곧 ‘붉음’입니다."
          : aB < 85 ? "흰 딸기 " + nTrained + "개를 더해 다시 학습했더니 흰 딸기 정확도가 <b>" + aB + "%</b>가 되었습니다. 나아졌지만 아직 85%에 못 미칩니다. 흰 딸기 표본이 <b>아직 부족해서</b> 선이 덜 누웠습니다. 표본을 더 넣어 다시 학습시켜 보세요." : "흰 딸기에서도 정확도 <b>" + aB + "%</b>입니다. 흰 딸기 표본을 보고 나자 선이 <b>붉은 정도보다 크기를 더 보는 쪽</b>으로 누웠습니다.");
      $("a-test-info").innerHTML = msg + (log.length ? "<br><b>다시 학습한 기록</b> " + log.slice(-4).join(" → ") : "");
      if (set === "B" && nTrained === 0 && !saved.a) { saved.a = true; window.sthState("gen", saved); mission(); }
    }
    function mission() {
      if (saved.a) done("m-a4a"); if (saved.b) done("m-a4b");
      if (saved.a && saved.b) {
        window.sthMission("m-a4", true, "<span class='m-tag'>미션 완료</span>흰 딸기 표본 " + saved.n + "개를 더해 다시 학습시키자 두 시험 모두 85%를 넘었습니다. 인공지능은 <b>학습 데이터가 담고 있는 세상</b>만 압니다. 무엇이 빠졌는지 알아채고 채워 준 것은 사람이었습니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    Array.prototype.forEach.call(document.querySelectorAll("#a-set button"), function (btn) {
      btn.addEventListener("click", function () {
        set = btn.getAttribute("data-s");
        Array.prototype.forEach.call(document.querySelectorAll("#a-set button"), function (x) { x.classList.toggle("on", x === btn); });
        draw();
      });
    });
    $("a-add").addEventListener("input", function (e) { nAdd = +e.target.value; $("a-add-val").textContent = nAdd + "개" + (nAdd !== nTrained ? " (아직 학습 전)" : ""); });
    $("a-retrain").addEventListener("click", function () {
      $("a-retrain").disabled = true;
      window.setTimeout(function () {
        nTrained = nAdd; L = robotLine(nTrained); $("a-retrain").disabled = false; $("a-add-val").textContent = nAdd + "개";
        var aA = acc(TEST_A), aB = acc(TEST_B);
        log.push("흰 " + nTrained + "개: 빨강 " + aA + "%·흰 " + aB + "%");
        if (saved.a && aA >= 85 && aB >= 85 && !saved.b) { saved.b = true; saved.n = nTrained; saved.acc = aA + "%/" + aB + "%"; window.sthState("gen", saved); }
        draw(); mission();
      }, 350);
    });
    if (nTrained) { $("a-add").value = nTrained; nAdd = nTrained; $("a-add-val").textContent = nTrained + "개"; }
    draw(); mission();
  })();

  /* 장면 5 — 결말 */
  function reveal() {
    $("e1-wrap").hidden = false;
    var p = window.sthState("p1") || "", g = window.sthState("gen") || {};
    $("e1-vs").innerHTML = "<b>나의 첫 예상</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 내다봤습니다. 이제 그 까닭을 직접 확인했습니다." : "로봇은 빨간 딸기는 90% 넘게 맞혔지만, 처음 보는 흰 딸기 앞에서는 절반밖에 맞히지 못했습니다. 쓸모없지도, 완벽하지도 않았습니다.") +
      "<br><b>내가 짠 규칙</b> " + (window.sthState("farmBest") || "-") + " &nbsp;|&nbsp; <b>흰 딸기 표본</b> " + (g.n != null && g.b ? g.n + "개 추가 → " + (g.acc || "") : "-");
  }
  function finish() {
    var g = window.sthState("gen") || {};
    window.sthState("r1", "완성 · 규칙: " + (window.sthState("farmBest") || "-") + " · 흰 딸기 표본 " + (g.b ? g.n : "-") + "개 추가(정확도 " + (g.acc || "-") + ")");
  }
  window.sthSort({
    mount: "a-sort",
    buckets: [
      { id: "l", label: "유용성 — 삶의 개선", sub: "건강·안전·편리함" },
      { id: "e", label: "유용성 — 환경 개선", sub: "자원과 에너지를 아낀다" },
      { id: "x", label: "한계·우려", sub: "함께 대비해야 할 것" }
    ],
    items: [
      { t: "🩺 인공지능이 의료 영상을 판독해 의사의 진단을 돕는다", a: "l", why: "사람이 놓치기 쉬운 부분을 짚어 주어 건강을 지킵니다." },
      { t: "🤖 무너진 건물 속에 사람 대신 로봇이 들어가 수색한다", a: "l", why: "위험한 일을 대신해 사람의 안전을 지킵니다." },
      { t: "🧬 개인의 유전 정보에 맞춰 약과 치료법을 고른다", a: "l", why: "맞춤형 의료는 삶의 질을 높이는 사례입니다." },
      { t: "🍓 센서로 필요한 만큼만 물과 비료를 주는 스마트팜", a: "e", why: "방금 본 것처럼 물과 비료의 낭비를 줄입니다.", hint: "온실에서 물 사용량이 어떻게 달라졌나요?" },
      { t: "⚡ 전력 사용량을 실시간으로 주고받아 낭비를 줄이는 지능형 전력망", a: "e", why: "사물 인터넷으로 에너지를 아끼는 사례입니다." },
      { t: "🔋 태양광·풍력으로 만든 전기를 저장했다가 필요할 때 쓴다", a: "e", why: "에너지 저장 기술은 재생 에너지의 들쭉날쭉한 발전량을 보완합니다." },
      { t: "📊 학습 데이터가 한쪽으로 치우치면 인공지능의 판단도 치우친다", a: "x", why: "흰 딸기를 못 알아본 로봇과 같은 문제입니다. 사람에게 적용되면 차별이 됩니다." },
      { t: "🔓 인터넷에 연결된 기기가 해킹되면 사생활과 안전이 위협받는다", a: "x", why: "모든 것이 연결될수록 보안이 중요해집니다." },
      { t: "🏭 자동화로 일부 일자리가 줄어 직업을 바꿔야 하는 사람이 생긴다", a: "x", why: "기술의 혜택과 부담이 고르게 나뉘지 않을 수 있습니다." },
      { t: "🖥️ 거대한 인공지능을 학습·운영하는 데이터 센터가 많은 전력을 쓴다", a: "x", why: "환경을 돕는 기술이 환경에 부담을 주기도 합니다.", hint: "환경에 이로운 쪽일까요, 부담을 주는 쪽일까요?" }
    ],
    doneText: "같은 기술이 유용성과 한계를 함께 가지고 있습니다.",
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "wk1", unitLabel: "[통합과학2 Ⅲ-2] 이야기 ① 할머니의 딸기 온실",
    items: [
      { id: "w1", label: "내가 고른 기술", hint: "기술 하나를 골라 무엇을 가능하게 하는지, 그리고 무엇을 위험하게 하는지 각각 쓰세요." },
      { id: "e1b", label: "흰 딸기 사건을 사람의 일로 옮기면", hint: "학습 데이터에 없던 흰 딸기를 로봇이 알아보지 못했습니다. 같은 일이 사람을 대상으로 하는 인공지능(채용, 의료, 안면 인식 등)에서 일어나면 어떤 문제가 생길지, 어떻게 막을 수 있을지 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 공청회에 서다
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "g2", key: "p2", title: "발언자의 첫 생각",
    question: "안면 인식 CCTV를 도입할지 말지는 어떻게 정해야 할까요?",
    options: ["㉠ 과학 기술 문제이니, 전문가가 정확도만 확인해 정하면 된다", "㉡ 사실은 과학으로 확인하되, 무엇을 더 중요하게 여길지는 시민이 함께 따져 합의해야 한다", "㉢ 어차피 생각이 다 다르니, 따질 것 없이 바로 다수결로 정하면 된다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 주장 분류 */
  (function () {
    var got = window.sthState("claims") || { a: false, b: false };
    function mission() {
      if (got.a) done("m-b2a"); if (got.b) done("m-b2b");
      if (got.a && got.b) {
        window.sthMission("m-b2", true, "<span class='m-tag'>미션 완료</span>사실 주장은 <b>근거를 확인</b>하면 되고, 가치 주장은 맞고 틀림이 아니라 <b>무게를 저울질</b>해야 합니다. 근거 없는 사실 주장은 입장문에 쓸 수 없습니다.");
        ep.clear(1);
      }
    }
    window.sthSort({
      mount: "b-sort1",
      buckets: [
        { id: "f", label: "사실 주장", sub: "조사하면 참·거짓을 가릴 수 있다" },
        { id: "v", label: "가치 주장", sub: "무엇이 옳고 중요한가에 대한 말" }
      ],
      items: [
        { t: "👮 경찰관: “지난해 우리 시 실종 신고 1,240건에서, 사람이 CCTV 영상을 돌려 보는 데 건당 평균 9시간이 걸렸습니다.”", a: "f", why: "통계를 확인하면 참·거짓을 가릴 수 있는 사실 주장입니다." },
        { t: "👩‍🔬 연구원: “NIST 시험에서 다수의 알고리즘이 아시아계·아프리카계 얼굴을 10~100배 더 자주 오인식했습니다.”", a: "f", why: "시험 보고서로 확인할 수 있는 사실 주장입니다." },
        { t: "🧑‍💼 업체 영업 사원: “우리 제품은 절대 틀리지 않습니다.”", a: "f", why: "시험해 보면 참·거짓이 가려지므로 사실 주장입니다. (참인지는 별개입니다.)", hint: "믿음이 가지 않아도, 확인할 수 있는 말이라면 사실 주장입니다." },
        { t: "🙋 주민: “안면 인식을 달면 범죄가 절반으로 줄 게 뻔해요.”", a: "f", why: "앞으로의 일에 대한 예측이지만, 도입한 곳의 범죄 통계로 참·거짓을 확인할 수 있으므로 사실 주장입니다.", hint: "‘절반으로 준다’는 조사해서 확인할 수 있는 말인가요?" },
        { t: "🔐 보안 전문가: “2019년 한 보안 업체의 생체 정보 데이터베이스가 노출돼 100만 명이 넘는 사람의 지문과 얼굴 정보가 드러났습니다.”", a: "f", why: "보도와 조사 보고서로 확인할 수 있는 사실 주장입니다." },
        { t: "👨‍👧 학부모: “아이들의 안전은 그 무엇보다 먼저 지켜야 합니다.”", a: "v", why: "무엇이 더 중요한가에 대한 가치 주장입니다.", hint: "실험이나 통계로 참·거짓을 가릴 수 있나요?" },
        { t: "✊ 인권 활동가: “감시받지 않고 거리를 걸을 자유는 포기해서는 안 되는 권리입니다.”", a: "v", why: "권리와 옳음에 대한 가치 주장입니다." },
        { t: "🏙️ 시의원: “새 기술을 앞서 받아들이는 도시가 좋은 도시입니다.”", a: "v", why: "‘좋은 도시’가 무엇인지는 가치 판단입니다." }
      ],
      doneText: "이제 아래에서 사실 주장 5개의 근거를 따져 보세요.",
      onDone: function () { got.a = true; window.sthState("claims", got); mission(); }
    });
    window.sthSort({
      mount: "b-sort2",
      buckets: [
        { id: "y", label: "근거를 댐", sub: "출처·자료를 확인할 수 있다" },
        { id: "n", label: "근거 없음", sub: "말뿐이다 — 자료를 요구해야 한다" }
      ],
      items: [
        { t: "👮 “실종 신고 1,240건, 영상 검색에 건당 평균 9시간” (시 경찰서 통계)", a: "y", why: "출처가 있는 통계입니다." },
        { t: "👩‍🔬 “오인식이 10~100배” (2019년 NIST 시험 보고서)", a: "y", why: "공개된 시험 보고서가 근거입니다." },
        { t: "🔐 “100만 명 넘는 생체 정보 노출” (2019년 보안 연구자들의 조사와 언론 보도)", a: "y", why: "확인할 수 있는 조사와 보도가 있습니다." },
        { t: "🧑‍💼 “우리 제품은 절대 틀리지 않습니다”", a: "n", why: "시험 결과를 하나도 내놓지 않았습니다. 독립 기관의 시험 성적을 요구해야 합니다.", hint: "어떤 자료를 내놓았나요?" },
        { t: "🙋 “범죄가 절반으로 줄 게 뻔해요”", a: "n", why: "‘뻔하다’는 근거가 아닙니다. 도입한 도시의 전후 통계가 필요합니다.", hint: "‘뻔하다’는 말이 자료인가요?" }
      ],
      onDone: function () { got.b = true; window.sthState("claims", got); mission(); }
    });
    mission();
  })();

  /* 장면 3 — 오인식의 산수 */
  (function () {
    var canvas = $("b-base"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var N = 10000, fi = 2, ratio = 1, got = window.sthState("base") || { a: false, b: false, c: false };
    function fmt(x) { return x >= 100 ? Math.round(x).toLocaleString() : (x >= 10 ? x.toFixed(0) : (x >= 1 ? x.toFixed(1) : (x >= 0.01 ? x.toFixed(2) : x.toFixed(3)))); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var r = baseRate(N, FPRS[fi], ratio), pc = r.prec * 100, nTrue = Math.round(pc), i;
      var big1 = (pc >= 10 ? pc.toFixed(0) : pc.toFixed(1)) + "%", big2 = (100 - pc >= 10 ? (100 - pc).toFixed(0) : (100 - pc).toFixed(1)) + "%";
      /* ── 왼쪽: 경보가 울린 100명을 광장 블록 위에 세운 모형 (칸 하나 = 경보 1번) ── */
      var LW = 560;
      K.studio(ctx, 0, 0, LW, H, { x: 290, y: 322, rx: 240, ry: 34 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      var I = K.iso({ ox: 290, oy: 128, s: 0.6, L: 300, D: 300 }), ZT = 14, k;
      I.box(ctx, 0, 0, 0, 300, 300, ZT, "#e3e8ee", "#bcc6d2", "#97a2b1");
      I.edges(ctx, ZT, ZT);
      for (k = 0; k < 100; k++) {
        var tx = (k % 10) * 30, ty = Math.floor(k / 10) * 30, tr = k < nTrue;
        I.plane(ctx, ZT + 0.2, tr ? "rgba(15,159,118,.55)" : ((k + Math.floor(k / 10)) % 2 ? "rgba(240,90,100,.22)" : "rgba(240,90,100,.32)"), "rgba(255,255,255,.85)", tx + 1, tx + 29, ty + 1, ty + 29);
      }
      var order = []; for (k = 0; k < 100; k++) order.push(k);
      order.sort(function (a, b) { return (a % 10 + Math.floor(a / 10)) - (b % 10 + Math.floor(b / 10)); });
      order.forEach(function (k2) {
        var x = (k2 % 10) * 30 + 15, y = Math.floor(k2 / 10) * 30 + 15, tr = k2 < nTrue;
        if (tr) { var p = I.P(x, y, ZT); ctx.strokeStyle = LT.green; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.ellipse(p.x, p.y, 9, 4.5, 0, 0, 6.2832); ctx.stroke(); }
        I.person(ctx, x, y, ZT, tr ? "#12b886" : "#e8596a", tr ? 1.25 : 1.05);
      });
      /* 안면 인식 카메라 기둥과 살피는 범위 */
      var pb = I.P(292, 8, ZT), pt = I.P(292, 8, ZT + 120);
      ctx.fillStyle = "rgba(28,126,214,.10)"; ctx.beginPath(); ctx.moveTo(pt.x - 10, pt.y + 4);
      var c1 = I.P(40, 150, ZT), c2 = I.P(200, 290, ZT); ctx.lineTo(c1.x, c1.y); ctx.lineTo(c2.x, c2.y); ctx.closePath(); ctx.fill();
      var mg = ctx.createLinearGradient(pb.x - 3, 0, pb.x + 3, 0); mg.addColorStop(0, "#6c7686"); mg.addColorStop(.5, "#e9edf3"); mg.addColorStop(1, "#6c7686");
      ctx.fillStyle = mg; ctx.fillRect(pb.x - 2.5, pt.y, 5, pb.y - pt.y);
      cube(ctx, pt.x - 22, pt.y - 6, 24, 12, 10, "#f1f3f6", "#ffffff", "#b9c0ca");
      ctx.fillStyle = "#1e2533"; ctx.beginPath(); ctx.arc(pt.x - 22, pt.y, 4.6, 0, 6.2832); ctx.fill();
      K.glow(ctx, pt.x - 22, pt.y, 1.6, "rgba(255,80,90,.95)", 2.4);
      ctx.restore();
      var bx0 = [0, LW];
      I.label(ctx, 292, 8, ZT + 132, "안면 인식 카메라", 30, -16, "#e8ecff", bx0);
      K.bigText(ctx, "진짜일 확률 " + big1, 18, 44, 25, pc >= 50 ? "#8ce99a" : "#ffffff");
      K.bigText(ctx, "억울한 시민 " + big2, 18, 76, 17, "#ffd35a");
      lpill(ctx, "광장 칸 하나 = 경보 1번 · 초록 = 진짜로 찾는 사람", 16, H - 14, { s: 11, c: LT.mute, box: bx0 });

      /* ── 오른쪽 흰 판정 카드: 집단별 억울한 경보 ── */
      var RX = 568, bx = RX + 18, bw = W - 18 - bx, mx = Math.max(r.faA, r.faB, 1e-9);
      judgeCard(ctx, RX, W, H, "하루에 울리는 억울한 경보 (집단별)");
      [["집단 A · 오인식률 " + (+FPRS[fi].toFixed(3)) + "%", r.faA, LT.blue], ["집단 B · 오인식률 " + (+Math.min(100, FPRS[fi] * ratio).toFixed(3)) + "%", r.faB, LT.red]].forEach(function (gq, k3) {
        var y = 66 + k3 * 70;
        K.row(ctx, gq[0], "하루 " + fmt(gq[1]) + "건", bx, W - 18, y, gq[2]);
        K.bar(ctx, bx, y + 12, bw, gq[1] / mx, gq[2]);
        note(ctx, "시민의 절반", bx, y + 40, { s: 10.5, c: LT.dim });
      });
      K.row(ctx, "진짜 경보 (찾는 사람)", "하루 약 1건", bx, W - 18, 222, LT.green);
      note(ctx, "억울한 경보 = 지나간 사람 수 × 오인식률", bx, 252, { s: 11 });
      note(ctx, "진짜일 확률 = 진짜 ÷ (진짜 + 억울한 경보)", bx, 272, { s: 11 });
      K.tip(ctx, pc >= 50 ? "경보를 믿을 만합니다 (50% 이상)" : (ratio >= 10 ? "오류가 집단 B에 몰립니다" : "경보 대부분이 억울한 시민입니다"), bx - 6, H - 46, bw + 12, pc >= 50);
      $("b-base-read").innerHTML = "<span class='k'>경보가 진짜일 확률</span><span class='v " + (pc >= 50 ? "g" : "r") + "'>" + big1 + "</span>" +
        "<span class='sub'>진짜 약 1건 ÷ (진짜 + 억울한 경보 " + fmt(r.fa) + "건)</span>" +
        "<span class='k'>억울한 경보</span><span class='v y'>하루 " + fmt(r.fa) + "건</span>" +
        "<span class='ok " + (pc >= 50 ? "g" : "r") + "'>" + (pc >= 50 ? "경보를 믿을 만합니다(50% 이상)" : "경보 대부분이 억울한 시민입니다") + "</span>";

      $("b-f-val").textContent = FPRS[fi] + "%";
      $("b-base-info").innerHTML = "하루 <b>" + N.toLocaleString() + "명</b> × 오인식률 <b>" + FPRS[fi] + "%</b>" + (ratio > 1 ? " (집단 B는 " + ratio + "배)" : "") + " → 억울한 경보 하루 <b>" + fmt(r.fa) + "건</b>, 진짜 경보 약 1건. 경보가 울렸을 때 진짜일 확률은 <b>" + (pc >= 10 ? pc.toFixed(0) : pc.toFixed(1)) + "%</b>입니다.<br>" +
        (ratio >= 10 ? "같은 길을 걸어도 집단 B의 시민은 집단 A보다 <b>" + (r.faA > 0 ? Math.round(r.faB / r.faA) : ratio) + "배</b> 자주 멈춰 세워집니다. 학습 데이터가 치우친 알고리즘의 오류는 <b>고르게 나뉘지 않습니다.</b>" :
          (pc >= 50 ? "오인식률이 아주 낮거나 지나는 사람이 적어야 경보를 믿을 만해집니다." : "찾는 사람은 1명뿐인데 관계 없는 사람은 수천~수만 명이기 때문에, 오인식률이 낮아 보여도 <b>경보의 대부분은 억울한 시민</b>입니다."));
      var ch = false;
      if (r.prec >= 0.5 && !got.a) { got.a = ch = true; window.sthState("baseBest", "하루 " + N.toLocaleString() + "명·오인식률 " + FPRS[fi] + "%"); }
      if (ratio >= 10 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("base", got); mission(); }
    }
    function mission() {
      if (got.a) done("m-b3a"); if (got.b) done("m-b3b"); if (got.c) done("m-b3c");
      if (got.a && got.b && got.c) {
        window.sthMission("m-b3", true, "<span class='m-tag'>미션 완료</span>‘오인식률 1%’와 ‘경보의 99%가 진짜’는 전혀 다른 말이었습니다. 숫자는 <b>무엇을 무엇으로 나눈 것인지</b> 따져 읽어야 합니다. 그리고 오류가 어느 집단에 몰리는지도 함께 봐야 합니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("b-n").addEventListener("input", function (e) { N = +e.target.value; $("b-n-val").textContent = N.toLocaleString() + "명"; draw(); });
    $("b-f").addEventListener("input", function (e) { fi = +e.target.value; draw(); });
    $("b-k").addEventListener("input", function (e) { ratio = +e.target.value; $("b-k-val").textContent = ratio === 1 ? "1배 (차이 없음)" : ratio + "배"; draw(); });
    window.sthPick({
      mount: "b-q1",
      q: "영업 사원의 조건 그대로(오인식률 1%, 하루 1만 명, 찾는 사람 1명)라면, 경보 100건 가운데 진짜는 몇 건쯤일까요?",
      options: ["약 99건", "약 50건", "약 1건", "0건"],
      answer: 2,
      why: ["그것은 ‘관계 없는 사람 100명 중 99명을 그냥 보내 준다’는 뜻이지, 경보의 99%가 진짜라는 뜻이 아닙니다. 슬라이더를 1%, 1만 명에 놓고 보세요.", "슬라이더를 1%, 1만 명에 놓고 그림을 다시 보세요.", "관계 없는 시민 약 1만 명의 1%인 약 100명에게 경보가 울리는 동안 진짜는 1건뿐입니다. 실제로 2017년 영국 카디프에서 열린 축구 결승전 때 경찰의 안면 인식이 울린 경보 2,470건 가운데 2,297건(약 92%)이 오인식이었다고 경찰이 공개했습니다.", "찾는 사람이 지나가면 99% 확률로 알아보므로 0건은 아닙니다."],
      onDone: function () { got.c = true; window.sthState("base", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 4 — 위험-편익 저울 */
  var TOPICS = {
    cctv: { name: "안면 인식 CCTV",
      ben: [["실종자 수색", "실종 아동과 치매 어르신을 더 빨리 찾는다"], ["범죄 수사", "용의자의 이동 경로를 찾는 시간이 준다"], ["출입 확인", "학교 출입 확인이 빠르고 편해진다"]],
      risk: [["사생활 침해", "모든 시민의 이동이 기록되어 익명으로 다닐 자유가 사라진다"], ["오인식·편향", "오인식이 특정 집단에 몰려 억울한 사람이 생긴다"], ["유출·남용", "얼굴 정보는 유출돼도 바꿀 수 없고, 다른 목적에 쓰일 수 있다"]],
      safe: ["법원의 허가를 받은 실종·강력 범죄 수색에만 쓴다", "독립 기관이 정확도·편향을 검증하고, 최종 확인은 사람이 한다", "영상은 기한 뒤 자동 삭제하고 열람 기록을 공개한다"] },
    gene: { name: "유전자 가위",
      ben: [["유전병 치료", "겸상 적혈구 빈혈증 같은 유전 질환을 치료한다"], ["품종 개량", "병충해와 가뭄에 강한 작물을 만든다"], ["연구 도구", "질병의 원인 유전자를 찾는 연구가 빨라진다"]],
      risk: [["표적 이탈", "의도하지 않은 곳의 DNA가 잘려 돌연변이가 생길 수 있다"], ["배아 편집", "배아를 편집하면 동의한 적 없는 후손에게까지 유전된다"], ["불평등", "비싼 치료와 ‘맞춤 아기’로 격차가 벌어질 수 있다"]],
      safe: ["사람에게 쓰기 전 장기 안전성 검증을 의무화한다", "배아·생식 세포 편집은 금지하고 체세포 치료만 허용한다", "꼭 필요한 치료는 공공이 비용을 지원한다"] },
    car: { name: "자율 주행차",
      ben: [["사고 감소", "졸음·음주·부주의 같은 사람의 실수로 인한 사고가 준다"], ["이동권", "고령자와 장애인이 스스로 이동할 수 있다"], ["효율", "교통 흐름이 좋아지고 연료가 절약된다"]],
      risk: [["책임 공백", "사고가 났을 때 누구의 책임인지 불분명하다"], ["돌발 상황", "학습하지 않은 돌발 상황에서 잘못 판단할 수 있다"], ["일자리·해킹", "운전 직종 일자리가 줄고 해킹 위험이 생긴다"]],
      safe: ["사고 책임 기준과 보험 제도를 법으로 정한다", "제한 구역에서 시범 운행하고 주행 기록을 공개한다", "전직 교육을 지원하고 보안 인증을 의무화한다"] },
    nuke: { name: "원자력 발전",
      ben: [["대량 생산", "적은 연료로 대량의 전력을 생산한다"], ["적은 배출", "발전 과정에서 온실 기체 배출이 적다"], ["안정 공급", "날씨와 관계없이 전기를 안정적으로 공급한다"]],
      risk: [["방사성 폐기물", "방사성 폐기물을 오랫동안 안전하게 보관해야 한다"], ["대형 사고", "사고가 나면 피해 규모가 매우 크다"], ["지역 갈등", "발전소·처분장 입지를 둘러싼 갈등이 생긴다"]],
      safe: ["처분장 확보 계획을 먼저 확정한다", "독립 규제 기관이 상시 점검하고 정보를 공개한다", "주민이 의사 결정에 참여하고 정당하게 보상받는다"] }
  };
  (function () {
    var canvas = $("b-scale"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var all = window.sthState("scale") || {}, topic = "cctv", touched = !!window.sthState("scaleSafe");
    function cur() { if (!all[topic]) all[topic] = { b: [0, 0, 0], r: [0, 0, 0], s: [0, 0, 0] }; return all[topic]; }
    var angNow = null, angTo = 0;
    function stack(cx, plateY, items, ws, safe, col) {
      var y = plateY, i;
      for (i = 0; i < 3; i++) {
        var sf = !!(safe && safe[i]), eff = ws[i] * (sf ? 0.5 : 1), h = eff * 7;
        if (h <= 0) continue;
        y -= h;
        cube(ctx, cx - 64, y, 116, h - 1, 18, col[0], K.tint(col[0], 1.22), col[1], sf ? 0.5 : 1);
        if (sf) { ctx.save(); ctx.strokeStyle = "rgba(20,40,90,.55)"; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.strokeRect(cx - 64, y, 116, h - 1); ctx.restore(); }
        if (h >= 13) K.t(ctx, (sf ? "🛡️ " : "") + items[i][0] + " " + (+eff.toFixed(1)), cx - 6, y + h / 2 + 4, { s: 10.5, w: "800", a: "center", c: sf ? LT.ink : "#ffffff" });
      }
    }
    function render() {
      ctx.clearRect(0, 0, W, H);
      var d = TOPICS[topic], c = cur(), r = scaleNet(c.b, c.r, c.s);
      var LW = 632, ang = angNow, cx = 316, py = 64, arm = 200;
      var lx = cx - arm * Math.cos(ang), ly = py + arm * Math.sin(ang), rx = cx + arm * Math.cos(ang), ry = py - arm * Math.sin(ang);
      K.studio(ctx, 0, 0, LW, H, { x: cx, y: 304, rx: 270, ry: 24 });
      lpill(ctx, d.name, cx, 30, { s: 14, a: "center", box: [0, LW] });
      /* 나무 받침 · 금속 기둥 */
      cube(ctx, cx - 86, 286, 160, 22, 30, "#b47c4a", "#d7a06a", "#8a5a33");
      var pg = ctx.createLinearGradient(cx - 8, 0, cx + 8, 0); pg.addColorStop(0, "#7d879a"); pg.addColorStop(.45, "#f4f6fa"); pg.addColorStop(1, "#6e788b");
      ctx.fillStyle = pg; ctx.fillRect(cx - 7, py, 14, 220);
      ctx.fillStyle = "rgba(20,30,50,.18)"; ctx.beginPath(); ctx.ellipse(cx, 278, 22, 5, 0, 0, 6.2832); ctx.fill();
      /* 저울대 */
      ctx.save(); ctx.translate(cx, py); ctx.rotate(-ang);
      var bg2 = ctx.createLinearGradient(0, -6, 0, 6); bg2.addColorStop(0, "#f7f9fc"); bg2.addColorStop(.5, "#b9c2d0"); bg2.addColorStop(1, "#6b7588");
      ctx.fillStyle = bg2; ctx.beginPath(); ctx.roundRect(-arm - 8, -6, arm * 2 + 16, 12, 6); ctx.fill(); ctx.restore();
      [[lx, ly, d.ben, c.b, null, ["#12b886", "#087f5b"], "편익 " + r.B, LT.green], [rx, ry, d.risk, c.r, c.s, ["#f0565f", "#b02a33"], "위험 " + (+r.R.toFixed(1)), LT.red]].forEach(function (s) {
        var plate = s[1] + 128;
        ctx.strokeStyle = "rgba(60,70,90,.6)"; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[0] - 76, plate); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[0] + 76, plate); ctx.stroke();
        /* 접시: 얕은 그릇 */
        var dg = ctx.createLinearGradient(0, plate - 4, 0, plate + 12); dg.addColorStop(0, "#f2f5f9"); dg.addColorStop(1, "#7f8a9c");
        ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(s[0], plate, 88, 9, 0, 0, Math.PI); ctx.lineTo(s[0] - 88, plate); ctx.fill();
        var tg2 = ctx.createLinearGradient(s[0] - 88, 0, s[0] + 88, 0); tg2.addColorStop(0, "#aab4c4"); tg2.addColorStop(.4, "#eef2f7"); tg2.addColorStop(1, "#8f9aac");
        ctx.fillStyle = tg2; ctx.beginPath(); ctx.ellipse(s[0], plate, 88, 7, 0, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = s[7]; ctx.lineWidth = 2.4; ctx.stroke();
        stack(s[0], plate - 2, s[2], s[3], s[4], s[5]);
        lpill(ctx, s[6], s[0], plate + 34, { s: 14, a: "center", c: s[7], box: [0, LW] });
        K.planet(ctx, s[0], s[1], 4.5, "#f4f6fa", "#5b6488");
      });
      K.planet(ctx, cx, py, 8, "#ffe8a3", "#8a6a12");
      /* 오른쪽 흰 판정 카드 */
      var RX = LW + 8, x0 = RX + 18, x1 = W - 18, nS = c.s[0] + c.s[1] + c.s[2];
      judgeCard(ctx, RX, W, H, "나의 저울", stance(r.net), r.net >= 3 ? LT.green : (r.net <= -3 ? LT.red : LT.mute));
      K.row(ctx, "편익 무게 합", String(r.B), x0, x1, 100, LT.green);
      K.row(ctx, "위험 무게 합 (안전장치 반영)", String(+r.R.toFixed(1)), x0, x1, 126, LT.red);
      K.row(ctx, "편익 − 위험", (r.net > 0 ? "+" : "") + (+r.net.toFixed(1)), x0, x1, 152, r.net > 0 ? LT.green : (r.net < 0 ? LT.red : LT.ink));
      K.row(ctx, "켠 안전장치", nS + "개", x0, x1, 178, LT.blue);
      K.bar(ctx, x0, 192, x1 - x0, r.B + r.R > 0 ? r.B / (r.B + r.R) : 0.5, LT.green);
      note(ctx, "초록 막대 = 전체 무게 가운데 편익의 몫", x0, 220, { s: 10.5 });
      note(ctx, "🛡️ 안전장치를 켠 위험은 무게가 절반", x0, 240, { s: 10.5 });
      K.tip(ctx, r.net >= 3 ? "편익 쪽으로 기울었습니다" : (r.net <= -3 ? "위험 쪽으로 기울었습니다" : "어느 쪽으로도 크게 기울지 않음"), x0 - 6, H - 46, x1 - x0 + 12, null);
    }
    function draw() {
      var d = TOPICS[topic], c = cur(), r = scaleNet(c.b, c.r, c.s);
      angTo = clamp(r.net / 12, -1, 1) * 0.26;
      if (angNow === null || REDUCE) angNow = angTo;
      render();

      var nSafe = c.s[0] + c.s[1] + c.s[2], r0 = scaleNet(c.b, c.r, [0, 0, 0]);
      $("b-scale-info").innerHTML = "지금 나의 저울: <b>" + stance(r.net) + "</b> (편익 " + r.B + " − 위험 " + (+r.R.toFixed(1)) + " = " + (r.net > 0 ? "+" : "") + (+r.net.toFixed(1)) + ")" +
        (nSafe ? "<br>안전장치 " + nSafe + "개를 걸기 전에는 <b>" + stance(r0.net) + "</b>(" + (r0.net > 0 ? "+" : "") + r0.net + ")였습니다. " + (stance(r0.net) !== stance(r.net) ? "조건에 따라 입장이 달라졌습니다. 이런 입장을 <b>조건부 찬성</b>이라고 합니다." : "안전장치를 걸어도 입장은 그대로입니다. 그만큼 어느 한쪽에 큰 무게를 두고 있다는 뜻입니다.") : "<br>위험 항목 아래의 안전장치 버튼을 켜면 그 위험의 무게가 절반이 됩니다.") +
        "<br>같은 사실을 보고도 옆 친구의 저울은 다르게 기울 수 있습니다. 다른 것은 사실이 아니라 <b>가치에 둔 무게</b>입니다.";
      if (topic === "cctv") {
        var allIn = c.b.concat(c.r).every(function (x) { return x >= 1; });
        if ($("m-b4a")) $("m-b4a").classList.toggle("done", allIn); if ($("m-b4b")) $("m-b4b").classList.toggle("done", touched);
        if (allIn && touched) {
          window.sthState("scaleBest", stance(r.net) + " (" + (r.net > 0 ? "+" : "") + (+r.net.toFixed(1)) + ", 안전장치 " + nSafe + "개)");
          if (!ep.cleared(3)) {
            window.sthMission("m-b4", true, "<span class='m-tag'>미션 완료</span>편익과 위험을 빠짐없이 검토했고, 안전장치에 따라 저울이 움직이는 것도 확인했습니다. 찬성과 반대 사이에는 <b>‘어떤 조건에서라면’</b>이라는 넓은 땅이 있습니다.");
            ep.clear(3);
          }
        }
      }
    }
    function build() {
      var d = TOPICS[topic], c = cur(), box = $("b-weights");
      box.innerHTML = "";
      function group(kind, i, pair) {
        var g = document.createElement("div"); g.className = "ctrl-group"; g.style.minWidth = "240px";
        var lab = document.createElement("div"); lab.className = "ctrl-label";
        lab.innerHTML = "<span>" + (kind === "b" ? "🟢 편익 · " : "🔴 위험 · ") + pair[1] + "</span><span class='val'>" + c[kind][i] + "</span>";
        var inp = document.createElement("input"); inp.type = "range"; inp.min = 0; inp.max = 5; inp.step = 1; inp.value = c[kind][i];
        inp.addEventListener("input", function () { c[kind][i] = +inp.value; lab.querySelector(".val").textContent = inp.value; window.sthState("scale", all); draw(); });
        g.appendChild(lab); g.appendChild(inp);
        if (kind === "r") {
          var bt = document.createElement("button"); bt.type = "button"; bt.className = "btn" + (c.s[i] ? " primary" : "");
          bt.style.cssText = "border-radius:14px;font-size:12px;padding:7px 12px;text-align:left;line-height:1.5";
          bt.textContent = (c.s[i] ? "🛡️ 켜짐: " : "🛡️ 안전장치: ") + d.safe[i];
          bt.addEventListener("click", function () {
            c.s[i] = c.s[i] ? 0 : 1; touched = true; window.sthState("scaleSafe", 1); window.sthState("scale", all);
            bt.className = "btn" + (c.s[i] ? " primary" : ""); bt.textContent = (c.s[i] ? "🛡️ 켜짐: " : "🛡️ 안전장치: ") + d.safe[i];
            draw();
          });
          g.appendChild(bt);
        }
        box.appendChild(g);
      }
      d.ben.forEach(function (p, i) { group("b", i, p); });
      d.risk.forEach(function (p, i) { group("r", i, p); });
    }
    canvas._redraw = draw;
    K.animate(canvas, function (dt) { if (angNow !== null && Math.abs(angTo - angNow) > 0.0005) { angNow += (angTo - angNow) * Math.min(1, dt / 110); render(); } });
    Array.prototype.forEach.call(document.querySelectorAll("#b-topic button"), function (btn) {
      btn.addEventListener("click", function () {
        topic = btn.getAttribute("data-t");
        Array.prototype.forEach.call(document.querySelectorAll("#b-topic button"), function (x) { x.classList.toggle("on", x === btn); });
        build(); draw();
      });
    });
    build(); draw();
    if (ep.cleared(3)) window.sthMission("m-b4", true, "<span class='m-tag'>미션 완료</span>나의 저울: <b>" + (window.sthState("scaleBest") || "-") + "</b>. 찬성과 반대 사이에는 <b>‘어떤 조건에서라면’</b>이라는 넓은 땅이 있습니다.");
  })();

  /* 장면 5 — 과학 윤리 사례 */
  window.sthSort({
    mount: "b-eth",
    buckets: [
      { id: "i", label: "연구 진실성", sub: "위조·변조·표절을 하지 않는다" },
      { id: "l", label: "생명 윤리", sub: "연구 대상자와 다음 세대를 보호한다" },
      { id: "d", label: "데이터·알고리즘 윤리", sub: "편향과 차별을 점검한다" }
    ],
    items: [
      { t: "2005년, 사람의 복제 배아 줄기세포를 만들었다던 논문의 사진과 데이터가 조작된 것으로 드러나 논문이 철회되었다", a: "i", why: "없는 데이터를 만들어 내는 위조, 데이터를 고치는 변조는 대표적인 연구 부정행위입니다." },
      { t: "1912년 영국에서 발견된 ‘필트다운인’ 화석은 약 40년 뒤 사람의 머리뼈와 오랑우탄의 턱뼈를 짜 맞춘 가짜로 밝혀졌다", a: "i", why: "조작된 증거가 수십 년 동안 인류 진화 연구를 헷갈리게 했습니다." },
      { t: "1932~1972년 미국 터스키기에서, 매독에 걸린 흑인 남성들에게 병명도 알리지 않고 치료도 하지 않은 채 경과만 관찰했다", a: "l", why: "충분한 설명에 근거한 동의 없이 사람을 연구 대상으로 삼았습니다. 이 사건 뒤 연구 대상자 보호 원칙이 세워졌습니다.", hint: "피해를 입은 것은 누구인가요?" },
      { t: "2018년 한 연구자가 유전자 가위로 사람 배아의 유전자를 편집해 쌍둥이를 태어나게 했다고 발표해, 세계 과학계의 비판을 받고 처벌되었다", a: "l", why: "안전성이 확인되지 않은 편집을, 동의할 수 없는 다음 세대에게 물려주었습니다.", hint: "편집된 유전자는 누구에게 전해지나요?" },
      { t: "과거 합격자들의 이력서로 학습한 채용 인공지능이 ‘여성’이라는 낱말이 든 이력서의 점수를 깎는 것이 드러나 폐기되었다 (2018년 보도)", a: "d", why: "과거 데이터에 담긴 치우침을 인공지능이 그대로 배웠습니다. 흰 딸기 사건과 같은 구조입니다." },
      { t: "상용 얼굴 분석 프로그램의 성별 판별 오류율이 밝은 피부의 남성은 1% 미만, 어두운 피부의 여성은 최대 약 35%였다 (2018년 연구)", a: "d", why: "학습 데이터가 치우쳐 오류가 특정 집단에 몰렸습니다. 공개 검증 뒤 업체들이 프로그램을 개선했습니다." }
    ],
    doneText: "과학 윤리는 과학을 가로막는 것이 아니라, 사회가 과학을 믿을 수 있게 하는 바탕입니다.",
    onDone: function () { window.sthMission("m-b5", true, "<span class='m-tag'>미션 완료</span>세 사례 묶음 모두 <b>‘할 수 있는가’보다 ‘해도 되는가’</b>를 먼저 묻지 않아 생긴 일입니다."); ep.clear(4); }
  });
  if (ep.cleared(4)) window.sthMission("m-b5", true);

  /* 장면 6 — 입장문 조립 (논증의 형식으로 판정) */
  var POS = ["도입에 찬성", "조건부로 찬성", "도입에 반대"];
  var EVID = [
    { t: "지난해 실종 신고 1,240건에서 영상 검색에 건당 평균 9시간이 걸렸다 (시 경찰서 통계)", side: "pro" },
    { t: "오인식률이 0.001% 수준으로 낮아지면 경보의 대부분이 진짜가 된다 (장면 3의 계산)", side: "pro" },
    { t: "오인식률 1%, 하루 1만 명이면 경보 100건 중 진짜는 1건쯤이다 (장면 3의 계산)", side: "con" },
    { t: "다수의 알고리즘이 특정 인종의 얼굴을 10~100배 더 자주 오인식했다 (2019년 NIST 시험)", side: "con" },
    { t: "생체 정보 데이터베이스가 노출돼 100만 명 넘는 사람의 정보가 드러난 적이 있다 (2019년)", side: "con" },
    { t: "이 제품은 절대 틀리지 않는다 (업체 영업 사원)", side: "trap" },
    { t: "안면 인식을 달면 범죄가 절반으로 줄 게 뻔하다 (주민)", side: "trap" }
  ];
  var COUNTER = [
    { t: "아이들의 안전은 그 무엇보다 먼저 지켜야 한다", side: "pro" },
    { t: "실종자를 찾는 시간이 크게 줄어 생명을 구할 수 있다", side: "pro" },
    { t: "감시받지 않고 거리를 걸을 자유는 포기할 수 없는 권리다", side: "con" },
    { t: "오인식이 특정 집단에 몰려 억울한 사람이 생긴다", side: "con" }
  ];
  var ANSWER = [
    { t: "법원의 허가를 받은 실종·강력 범죄 수색에만 쓰도록 제한한다" },
    { t: "독립 기관이 정확도와 편향을 검증하고, 경보가 울려도 최종 확인은 사람이 한다" },
    { t: "영상은 기한 뒤 자동 삭제하고, 누가 열람했는지 기록을 공개한다" },
    { t: "실종 수색은 CCTV 증설과 인력 보강처럼 얼굴을 기록하지 않는 방법으로 먼저 개선한다" },
    { t: "편향이 검증으로 해소될 때까지 도입을 미루고 시범 운영 결과를 공개한다" },
    { t: "반론은 대꾸할 가치가 없으므로 답하지 않는다", trap: true }
  ];
  (function () {
    var st = window.sthState("stmt") || { pos: -1, ev: [], ct: [], an: [] };
    var box = $("b-build");
    box.classList.add("pick");
    var out = document.createElement("div");
    function section(title, sub) {
      var h = document.createElement("p"); h.className = "q"; h.style.marginTop = "14px"; h.innerHTML = title + (sub ? " <span style='font-weight:500;color:var(--mist);font-size:12.5px'>" + sub + "</span>" : "");
      box.appendChild(h);
      var o = document.createElement("div"); o.className = "opts"; box.appendChild(o); return o;
    }
    function toggles(wrap, list, arr, single) {
      list.forEach(function (it, i) {
        var b = document.createElement("button"); b.type = "button"; b.className = "opt"; b.textContent = typeof it === "string" ? it : it.t;
        function paint() { b.classList.toggle("right", single ? st.pos === i : arr.indexOf(i) >= 0); }
        b.addEventListener("click", function () {
          if (single) st.pos = i;
          else { var k = arr.indexOf(i); if (k >= 0) arr.splice(k, 1); else arr.push(i); }
          window.sthState("stmt", st);
          Array.prototype.forEach.call(wrap.children, function (c) { if (c._paint) c._paint(); });
        });
        b._paint = paint; paint(); wrap.appendChild(b);
      });
    }
    toggles(section("① 나의 주장", "통학로 CCTV 안면 인식 도입에 대해"), POS, null, true);
    toggles(section("② 근거", "내 주장을 뒷받침하는 사실을 고르세요 (여러 개 가능)"), EVID, st.ev);
    toggles(section("③ 예상되는 반론", "나와 반대편에 선 사람이 할 가장 강한 주장을 고르세요"), COUNTER, st.ct);
    toggles(section("④ 반론에 대한 나의 답", "반론을 인정하면서도 내 주장을 지킬 방법을 고르세요"), ANSWER, st.an);
    var row = document.createElement("div"); row.className = "btn-row"; row.style.marginTop = "16px";
    var go = document.createElement("button"); go.type = "button"; go.className = "btn primary"; go.textContent = "📜 입장문 조립하기";
    row.appendChild(go); box.appendChild(row);
    out.className = "why"; out.style.cssText = "font-size:13.5px;line-height:1.85;margin-top:12px"; box.appendChild(out);

    function check() {
      var mySide = st.pos === 0 ? "pro" : (st.pos === 2 ? "con" : "both"), otherSide = st.pos === 0 ? "con" : (st.pos === 2 ? "pro" : "both");
      if (st.pos < 0) return "① 주장이 없습니다. 입장을 먼저 고르세요.";
      if (!st.ev.length) return "② 근거가 없습니다. 주장만 있고 근거가 없으면 논증이 아닙니다.";
      if (st.ev.some(function (i) { return EVID[i].side === "trap"; })) return "② 근거 가운데 장면 2에서 <b>‘근거 없음’</b>으로 분류한 말이 들어 있습니다. 확인되지 않은 말은 근거가 될 수 없습니다.";
      if (mySide !== "both" && !st.ev.some(function (i) { return EVID[i].side === mySide; })) return "② 고른 근거가 모두 상대편을 뒷받침하는 사실입니다. 내 주장을 뒷받침하는 근거를 하나 이상 넣으세요.";
      if (!st.ct.length) return "③ 예상 반론이 없습니다. 상대편의 가장 강한 주장을 피하지 말고 적어야 설득력이 생깁니다.";
      if (otherSide !== "both" && !st.ct.some(function (i) { return COUNTER[i].side === otherSide; })) return "③ 고른 것은 반론이 아니라 내 편의 주장입니다. <b>반대편</b>이 할 말을 고르세요.";
      if (!st.an.length) return "④ 반론에 대한 답이 없습니다. 반론을 적기만 하고 답하지 않으면 논증이 끝나지 않습니다.";
      if (st.an.some(function (i) { return ANSWER[i].trap; })) return "④ 반론을 무시하는 것은 답이 아닙니다. 반론을 인정하고, 그래도 내 주장이 서는 까닭이나 조건을 고르세요.";
      return "";
    }
    function compose() {
      var circ = ["첫째, ", "둘째, ", "셋째, ", "넷째, ", "다섯째, "];
      return "저는 통학로 CCTV의 안면 인식 기능 <b>" + POS[st.pos] + "</b>합니다. " +
        st.ev.map(function (i, k) { return (circ[k] || "") + EVID[i].t + "."; }).join(" ") +
        " 물론 " + st.ct.map(function (i) { return "“" + COUNTER[i].t + "”"; }).join(", ") + "는 반론이 있고, 저도 그 무게를 가볍게 보지 않습니다. 그래서 다음을 함께 제안합니다. " +
        st.an.map(function (i) { return ANSWER[i].t + "."; }).join(" ");
    }
    function reveal(txt) {
      out.innerHTML = "✅ 주장·근거·반론·답을 모두 갖췄습니다.<div class='case-file' style='margin-top:10px'>" + txt + "</div>";
      $("e2-wrap").hidden = false;
      var p = window.sthState("p2") || "";
      $("e2-vs").innerHTML = "<b>나의 첫 생각</b> " + (p || "기록 없음") + "<br>" +
        (p.indexOf("㉡") === 0 ? "처음 생각대로, 사실 확인과 가치의 저울질이 모두 필요했습니다." : "정확도만으로도, 다수결만으로도 부족했습니다. 사실은 확인하고 가치는 저울질해야 했습니다.") +
        "<br><b>나의 저울</b> " + (window.sthState("scaleBest") || "-") + " &nbsp;|&nbsp; <b>나의 입장</b> " + POS[st.pos];
    }
    go.addEventListener("click", function () {
      var err = check();
      if (err) { out.innerHTML = "❌ " + err; return; }
      var txt = compose();
      window.sthState("stmtText", txt);
      window.sthState("stmtSum", POS[st.pos] + " · 근거 " + st.ev.length + "·반론 " + st.ct.length + "·답 " + st.an.length);
      window.sthMission("m-b6", true, "<span class='m-tag'>미션 완료</span>입장이 무엇이든, <b>근거를 대고 반론에 답한 주장</b>만이 공청회장에서 힘을 가집니다.");
      reveal(txt);
      ep.clear(5);
      window.sthState("r2", "해결 · 입장: " + window.sthState("stmtSum") + " · 저울: " + (window.sthState("scaleBest") || "-"));
    });
    if (ep.cleared(5) && window.sthState("stmtText") && st.pos >= 0) { window.sthMission("m-b6", true); reveal(window.sthState("stmtText")); }
  })();

  function finish() {
    window.sthState("r2", "해결 · 입장: " + (window.sthState("stmtSum") || "-") + " · 저울: " + (window.sthState("scaleBest") || "-"));
  }
  window.sthWork({
    mount: "wk2", unitLabel: "[통합과학2 Ⅲ-2] 이야기 ② 공청회에 서다",
    items: [
      { id: "w2", label: "반대편의 가장 강한 주장", hint: "내 입장과 반대되는 쪽의 가장 설득력 있는 주장을 한 문장으로 옮겨 적고, 그에 대한 답을 쓰세요." },
      { id: "e2b", label: "과학 윤리가 왜 중요한가", hint: "장면 5의 사례 하나를 골라, 그 일이 과학에 대한 사회의 믿음을 어떻게 무너뜨렸는지, 그리고 그것을 막으려면 과학자와 사회가 각각 무엇을 해야 하는지 논증하세요." }
    ]
  });
})();

/* ========================================================================= 03 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학2 Ⅲ-2] 과학 기술의 발전과 쟁점 — 정리",
  recap: [
    { key: "r1", label: "① 할머니의 딸기 온실" },
    { key: "r2", label: "② 공청회에 서다" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "두 이야기를 꿰는 한 문장", hint: "흰 딸기를 못 알아본 로봇과 특정 집단을 더 자주 오인식하는 CCTV. 두 이야기에 공통으로 들어 있는 생각을 ‘유용성’, ‘한계’, ‘사람의 책임’이라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 04 우리 반 */
window.sthShare({
  mount: "share", unit: "is2-3-2", unitLabel: "[통합과학2 Ⅲ-2] 과학 기술의 발전과 쟁점",
  rows: [
    { key: "r1", label: "① 할머니의 딸기 온실" },
    { key: "r2", label: "② 공청회에 서다" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "두 이야기를 꿰는 한 문장" }
});

})();
