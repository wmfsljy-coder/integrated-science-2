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

/*MODEL-BEGIN — 계산 모형 (node 로 따로 검증한다) */
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
var TIMER_WATER = 240;   // 3시간마다 무조건 30 L 씩 주는 타이머 방식의 하루 물 사용량

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

/* 오인식의 산수: 하루 N명(절반씩 집단 A·B), 찾는 사람 1명(99% 알아봄), 오인식률 fpr%, 집단 B 는 ratio 배 */
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

/* 산점도 한 장 — 장면 3·4 가 함께 쓴다 */
function drawScatter(ctx, W, H, pts, lines, title, side) {
  paper(ctx, W, H);
  var x0 = 70, x1 = 610, y0 = 44, y1 = 370;
  function px(r) { return x0 + r / 100 * (x1 - x0); }
  function py(s) { return y1 - (s - 10) / 40 * (y1 - y0); }
  text(ctx, title, x0, 24, { s: 13, w: "800" });
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
  lines.forEach(function (L, k) {
    if (k === 0) {                                   // 첫 번째 선의 위쪽을 '익음' 영역으로 칠한다
      ctx.fillStyle = v("--coral"); ctx.globalAlpha = .1; ctx.beginPath();
      ctx.moveTo(px(0), py(L.b)); ctx.lineTo(px(100), py(100 * L.a + L.b)); ctx.lineTo(px(100), -4000); ctx.lineTo(px(0), -4000); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = v(L.c); ctx.lineWidth = 3; ctx.setLineDash(L.dash ? [9, 6] : []);
    ctx.beginPath(); ctx.moveTo(px(0), py(L.b)); ctx.lineTo(px(100), py(100 * L.a + L.b)); ctx.stroke(); ctx.setLineDash([]);
  });
  ctx.restore();
  ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
  var g;
  for (g = 0; g <= 100; g += 20) text(ctx, g + "", px(g), y1 + 16, { s: 10.5, c: v("--mist"), a: "center" });
  for (g = 10; g <= 50; g += 10) text(ctx, g + "", x0 - 8, py(g) + 4, { s: 10.5, c: v("--mist"), a: "right" });
  text(ctx, "붉은 정도 (카메라가 잰 값, %) →", (x0 + x1) / 2, y1 + 36, { s: 11.5, c: v("--mist"), a: "center" });
  text(ctx, "↑ 크기(mm)", 8, y0 - 6, { s: 11.5, c: v("--mist") });
  var L0 = lines[0];
  pts.forEach(function (p) {
    var X = px(p.r), Y = py(p.s), bad = (p.s > L0.a * p.r + L0.b ? 1 : 0) !== p.y;
    ctx.lineWidth = 2;
    if (p.y) {
      ctx.fillStyle = p.w ? v("--amber-100") : v("--coral"); ctx.strokeStyle = v("--coral-700");
      ctx.beginPath(); ctx.arc(X, Y, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = p.w ? v("--green-100") : v("--green"); ctx.strokeStyle = v("--green-700");
      ctx.beginPath(); ctx.rect(X - 6, Y - 6, 12, 12); ctx.fill(); ctx.stroke();
    }
    if (bad) {
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(X - 10, Y - 10); ctx.lineTo(X + 10, Y + 10); ctx.moveTo(X + 10, Y - 10); ctx.lineTo(X - 10, Y + 10); ctx.stroke();
    }
  });
  /* 오른쪽 설명 칸 */
  var sx = 640, sy = 60;
  ctx.fillStyle = v("--coral"); ctx.strokeStyle = v("--coral-700"); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx + 7, sy - 4, 6.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  text(ctx, "익음 (할머니의 판정)", sx + 22, sy, { s: 12 });
  ctx.fillStyle = v("--green"); ctx.strokeStyle = v("--green-700"); ctx.beginPath(); ctx.rect(sx + 1, sy + 12, 12, 12); ctx.fill(); ctx.stroke();
  text(ctx, "안 익음 (할머니의 판정)", sx + 22, sy + 22, { s: 12 });
  ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, sy + 34); ctx.lineTo(sx + 14, sy + 48); ctx.moveTo(sx + 14, sy + 34); ctx.lineTo(sx, sy + 48); ctx.stroke();
  text(ctx, "로봇이 잘못 가른 열매", sx + 22, sy + 45, { s: 12 });
  text(ctx, "옅은 색 = 흰 딸기 품종", sx + 22, sy + 67, { s: 11, c: v("--mist") });
  side.forEach(function (row, i) { text(ctx, row.t, sx, sy + 110 + i * 30, { s: row.s || 13, w: row.w || "700", c: row.c ? v(row.c) : v("--ink") }); });
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
    var Ton = 35, Mon = 30;
    function draw() {
      paper(ctx, W, H);
      var o = farmSim(Ton, Mon), x0 = 70, x1 = 860, n = o.T.length, i;
      function X(i) { return x0 + i / (n - 1) * (x1 - x0); }
      function panel(y0, y1, arr, max, col, bandLo, bandHi, title, unit, marks) {
        function Y(val) { return y1 - clamp(val / max, 0, 1) * (y1 - y0); }
        ctx.fillStyle = v("--green"); ctx.globalAlpha = .14; ctx.fillRect(x0, Y(bandHi), x1 - x0, Y(bandLo) - Y(bandHi)); ctx.globalAlpha = 1;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
        marks.forEach(function (m) {
          ctx.strokeStyle = v(m.c); ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(x0, Y(m.v)); ctx.lineTo(x1, Y(m.v)); ctx.stroke(); ctx.setLineDash([]);
          text(ctx, m.t, x1 - 4, Y(m.v) - 5, { s: 10.5, w: "800", c: v(m.c + "-700"), a: "right" });
          text(ctx, m.v + "", x0 - 8, Y(m.v) + 4, { s: 10.5, c: v("--mist"), a: "right" });
        });
        ctx.strokeStyle = v(col); ctx.lineWidth = 3; ctx.beginPath();
        for (i = 0; i < n; i++) { if (i === 0) ctx.moveTo(X(i), Y(arr[i])); else ctx.lineTo(X(i), Y(arr[i])); }
        ctx.stroke();
        text(ctx, title, x0 + 8, y0 + 4, { s: 12.5, w: "800" });
        text(ctx, "초록 띠 = 알맞은 범위 (" + bandLo + "~" + bandHi + unit + ")", x0 + 8, y0 + 22, { s: 10.5, c: v("--green-700") });
      }
      panel(30, 170, o.T, 45, "--coral", 18, 28, "🌡️ 온실 안 온도 (℃)", "℃", [{ v: 30, c: "--rose", t: "고온 피해 30℃" }, { v: Ton, c: "--amber", t: "규칙 ① " + Ton + "℃" }]);
      /* 환기창 띠 */
      for (i = 0; i < n; i++) if (o.vent[i]) { ctx.fillStyle = v("--amber"); ctx.fillRect(X(i) - 4.2, 178, 8.4, 10); }
      text(ctx, "환기창", x0 - 8, 187, { s: 10.5, c: v("--mist"), a: "right" });
      panel(220, 350, o.M, 100, "--brand", 45, 80, "💧 토양 수분 (%)", "%", [{ v: Mon, c: "--teal", t: "규칙 ② " + Mon + "%" }]);
      for (i = 0; i < n; i++) if (o.wat[i]) { ctx.fillStyle = v("--teal"); ctx.beginPath(); ctx.moveTo(X(i), 366); ctx.lineTo(X(i) - 5, 356); ctx.lineTo(X(i) + 5, 356); ctx.closePath(); ctx.fill(); }
      text(ctx, "물 주기", x0 - 8, 366, { s: 10.5, c: v("--mist"), a: "right" });
      for (i = 0; i <= 24; i += 3) text(ctx, i + "시", x0 + i / 24 * (x1 - x0), 388, { s: 10.5, c: v("--mist"), a: "center" });

      var ok = farmOk(o), save = Math.round((1 - o.water / TIMER_WATER) * 100);
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
        : (aB < 85 ? "흰 딸기에서는 정확도 <b>" + aB + "%</b>. 다 익은 흰 딸기를 거의 모두 ‘안 익음’으로 판단합니다. 로봇이 고장 난 것이 아닙니다. <b>학습 데이터에 흰 딸기가 한 개도 없었기</b> 때문에, 로봇에게 ‘익음’은 곧 ‘붉음’입니다." : "흰 딸기에서도 정확도 <b>" + aB + "%</b>입니다. 흰 딸기 표본을 보고 나자 선이 <b>붉은 정도보다 크기를 더 보는 쪽</b>으로 누웠습니다.");
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
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 내다봤습니다. 이제 그 까닭을 직접 확인했네요." : "로봇은 빨간 딸기는 90% 넘게 맞혔지만, 처음 보는 흰 딸기 앞에서는 절반밖에 맞히지 못했습니다. 쓸모없지도, 완벽하지도 않았습니다.") +
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
        { t: "🙋 주민: “안면 인식을 달면 범죄가 절반으로 줄 게 뻔해요.”", a: "f", why: "도입한 곳의 범죄 통계로 확인할 수 있는 사실 주장입니다.", hint: "‘절반으로 준다’는 조사해서 확인할 수 있는 말인가요?" },
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
      paper(ctx, W, H);
      var r = baseRate(N, FPRS[fi], ratio), pc = r.prec * 100, nTrue = Math.round(pc), i;
      text(ctx, "경보가 100번 울렸다면, 그 가운데", 40, 32, { s: 13, w: "800" });
      for (i = 0; i < 100; i++) {
        var gx = 40 + (i % 10) * 28, gy = 50 + Math.floor(i / 10) * 28;
        ctx.fillStyle = i < nTrue ? v("--teal") : v("--rose"); ctx.globalAlpha = i < nTrue ? 1 : .55;
        ctx.beginPath(); ctx.roundRect(gx, gy, 24, 24, 6); ctx.fill(); ctx.globalAlpha = 1;
      }
      text(ctx, "진짜 (찾는 사람)", 340, 110, { s: 12, c: v("--teal-700"), w: "800" });
      text(ctx, (pc >= 10 ? pc.toFixed(0) : pc.toFixed(1)) + "%", 340, 150, { s: 32, w: "900", c: pc >= 50 ? v("--teal-700") : v("--rose-700") });
      text(ctx, "억울한 시민", 340, 210, { s: 12, c: v("--rose-700"), w: "800" });
      text(ctx, (100 - pc >= 10 ? (100 - pc).toFixed(0) : (100 - pc).toFixed(1)) + "%", 340, 246, { s: 24, w: "900", c: v("--rose-700") });
      /* 집단별 억울한 경보 */
      var bx = 560, bw = 300, mx = Math.max(r.faA, r.faB, 1e-9);
      text(ctx, "하루에 울리는 억울한 경보 (집단별)", bx, 32, { s: 13, w: "800" });
      [["집단 A (시민의 절반)", r.faA, "--brand", FPRS[fi]], ["집단 B (시민의 절반)", r.faB, "--coral", Math.min(100, FPRS[fi] * ratio)]].forEach(function (g, k) {
        var y = 64 + k * 96;
        text(ctx, g[0] + " · 오인식률 " + (+g[3].toFixed(3)) + "%", bx, y, { s: 11.5, c: v("--mist") });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(bx, y + 10, bw, 30);
        ctx.fillStyle = v(g[2]); ctx.fillRect(bx, y + 10, Math.max(3, bw * g[1] / mx), 30);
        text(ctx, "하루 " + fmt(g[1]) + "건", bx, y + 62, { s: 14, w: "900", c: v(g[2] + "-700") });
      });
      text(ctx, "진짜 경보는 하루 약 1건", bx, 280, { s: 12.5, w: "800", c: v("--teal-700") });
      text(ctx, "계산: 억울한 경보 = 지나간 사람 수 × 오인식률", bx, 306, { s: 11, c: v("--mist") });
      text(ctx, "진짜일 확률 = 진짜 ÷ (진짜 + 억울한 경보)", bx, 326, { s: 11, c: v("--mist") });

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
    function stack(cx, plateY, items, ws, safe, col) {
      var y = plateY, i;
      for (i = 0; i < 3; i++) {
        var eff = ws[i] * (safe && safe[i] ? 0.5 : 1), h = eff * 8;
        if (h <= 0) continue;
        y -= h;
        ctx.fillStyle = v(col); ctx.globalAlpha = safe && safe[i] ? .55 : .9; ctx.beginPath(); ctx.roundRect(cx - 80, y, 160, h - 1.5, 4); ctx.fill(); ctx.globalAlpha = 1;
        if (h >= 15) text(ctx, items[i][0] + " " + (+eff.toFixed(1)), cx, y + h / 2 + 4, { s: 11, w: "800", a: "center", c: v("--on-accent") });
      }
    }
    function draw() {
      paper(ctx, W, H);
      var d = TOPICS[topic], c = cur(), r = scaleNet(c.b, c.r, c.s);
      var ang = clamp(r.net / 12, -1, 1) * 0.26, cx = W / 2, py = 46, arm = 250;
      var lx = cx - arm * Math.cos(ang), ly = py + arm * Math.sin(ang), rx = cx + arm * Math.cos(ang), ry = py - arm * Math.sin(ang);
      text(ctx, d.name, cx, 24, { s: 14, w: "900", a: "center" });
      ctx.strokeStyle = v("--mist"); ctx.lineWidth = 5; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(cx, 300); ctx.moveTo(cx - 60, 300); ctx.lineTo(cx + 60, 300); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
      [[lx, ly, d.ben, c.b, null, "--teal", "편익 " + r.B], [rx, ry, d.risk, c.r, c.s, "--coral", "위험 " + (+r.R.toFixed(1))]].forEach(function (s) {
        var plate = s[1] + 136;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[0] - 90, plate); ctx.moveTo(s[0], s[1]); ctx.lineTo(s[0] + 90, plate); ctx.stroke();
        ctx.strokeStyle = v(s[5]); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(s[0] - 96, plate); ctx.lineTo(s[0] + 96, plate); ctx.stroke();
        stack(s[0], plate - 3, s[2], s[3], s[4], s[5]);
        text(ctx, s[6], s[0], plate + 22, { s: 14, w: "900", a: "center", c: v(s[5] + "-700") });
      });
      ctx.lineCap = "butt";
      ctx.fillStyle = v("--ink"); ctx.beginPath(); ctx.arc(cx, py, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "편익 − 위험 = " + (r.net > 0 ? "+" : "") + (+r.net.toFixed(1)), cx, 322, { s: 12.5, w: "800", a: "center", c: v("--mist") });

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
    { key: "r2", label: "② 공청회에 서다" }
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
    { key: "r2", label: "② 공청회에 서다" }
  ],
  line: { id: "all", label: "두 이야기를 꿰는 한 문장" }
});

})();
