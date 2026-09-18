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
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
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
    function thick(L) { return 80 + 1.7 * L; }
    function area(L) { return 45 - 0.3 * L; }

    function draw() {
      paper(ctx, W, H);
      var L = light(h), T = thick(L), A = area(L);
      /* 하늘과 해 */
      ctx.fillStyle = v("--amber"); ctx.beginPath(); ctx.arc(60, 50, 24, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = v("--amber"); ctx.lineWidth = 2; ctx.globalAlpha = .5;
      for (var i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(86 + i * 6, 62 + i * 4); ctx.lineTo(170 + i * 22, 96 + i * 8); ctx.stroke(); }
      ctx.globalAlpha = 1;
      /* 나무 */
      var gx = 250, top = 40, bottom = 330;
      ctx.fillStyle = v("--coral-700"); ctx.fillRect(gx - 12, 262, 24, bottom - 262);
      for (var k = 0; k < 6; k++) {                     // 위가 밝고 아래가 어두운 수관
        var yy = lerp(top + 30, 250, k / 5), rr = lerp(60, 150, k / 5);
        ctx.globalAlpha = lerp(.95, .45, k / 5);
        ctx.fillStyle = k < 2 ? v("--green") : v("--green-700");
        ctx.beginPath(); ctx.ellipse(gx, yy, rr, 34, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = v("--line"); ctx.fillRect(40, bottom, 440, 3);
      /* 채집 위치 */
      var py = lerp(262, top + 22, h / 100);
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 3; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(90, py); ctx.lineTo(430, py); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = v("--brand"); ctx.beginPath(); ctx.arc(430, py, 7, 0, Math.PI * 2); ctx.fill();
      text(ctx, "✂ 높이 " + h + "%", 440, py - 10, { s: 12, w: "800", c: v("--brand-700") });
      /* 빛 막대 */
      text(ctx, "이 자리의 빛", 40, 356, { s: 11, c: v("--mist") });
      ctx.fillStyle = v("--card-2"); ctx.fillRect(120, 346, 300, 12);
      ctx.fillStyle = v("--amber"); ctx.fillRect(120, 346, 300 * L / 100, 12);
      text(ctx, Math.round(L) + "%", 428, 357, { s: 12, w: "800" });

      /* 오른쪽: 잎 단면 */
      var x0 = 520, wBox = 272, scale = 0.62, hh = T * scale, y0 = 60;
      text(ctx, "잎의 단면 (현미경)", x0, 36, { s: 13, w: "800" });
      var epi = 10, pal = (T - 60) * 0.55 * scale, sp = hh - 2 * epi - pal;
      ctx.fillStyle = v("--green-100"); ctx.fillRect(x0, y0, wBox, epi);
      ctx.fillStyle = v("--green"); ctx.fillRect(x0, y0 + epi, wBox, pal);
      var layers = T > 190 ? 3 : (T > 130 ? 2 : 1);
      ctx.strokeStyle = v("--panel"); ctx.lineWidth = 2;
      for (var c = 1; c < 17; c++) { ctx.beginPath(); ctx.moveTo(x0 + c * 16, y0 + epi); ctx.lineTo(x0 + c * 16, y0 + epi + pal); ctx.stroke(); }
      for (var l = 1; l < layers; l++) { ctx.beginPath(); ctx.moveTo(x0, y0 + epi + pal * l / layers); ctx.lineTo(x0 + wBox, y0 + epi + pal * l / layers); ctx.stroke(); }
      ctx.fillStyle = v("--teal-100"); ctx.fillRect(x0, y0 + epi + pal, wBox, sp);
      ctx.fillStyle = v("--green-700"); ctx.globalAlpha = .55;
      for (var s = 0; s < 12; s++) { ctx.beginPath(); ctx.arc(x0 + 14 + s * 23, y0 + epi + pal + sp * (s % 2 ? .35 : .68), Math.min(8, sp / 3), 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = v("--green-100"); ctx.fillRect(x0, y0 + hh - epi, wBox, epi);
      text(ctx, "울타리 조직 " + layers + "겹", x0 + wBox + 8, y0 + epi + pal / 2 + 4, { s: 10.5, c: v("--green-700"), w: "800" });
      text(ctx, "해면 조직", x0 + wBox + 8, y0 + epi + pal + sp / 2 + 4, { s: 10.5, c: v("--mist") });
      /* 두께 자 */
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x0 - 14, y0); ctx.lineTo(x0 - 14, y0 + hh); ctx.moveTo(x0 - 19, y0); ctx.lineTo(x0 - 9, y0); ctx.moveTo(x0 - 19, y0 + hh); ctx.lineTo(x0 - 9, y0 + hh); ctx.stroke();
      text(ctx, Math.round(T) + " µm", x0 - 22, y0 + hh / 2 + 4, { s: 12, w: "800", a: "right" });
      /* 잎 넓이 */
      var ly = 300, r = Math.sqrt(A) * 7.2;
      ctx.fillStyle = L > 55 ? v("--green-700") : v("--green");
      ctx.beginPath(); ctx.ellipse(x0 + 90, ly, r * 1.5, r * .8, 0, 0, Math.PI * 2); ctx.fill();
      text(ctx, "넓이 약 " + Math.round(A) + " cm²", x0 + 190, ly - 4, { s: 12, w: "800" });
      text(ctx, "두께 " + Math.round(T) + " µm", x0 + 190, ly + 16, { s: 12, c: v("--mist") });
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
      (p.indexOf("㉢") === 0 ? "처음부터 정확히 짚었습니다. 이제 증거까지 갖췄네요." : "처음 생각과 달랐지요? 추리를 증거로 고쳐 나가는 것이 과학입니다.");
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
  function chart(ctx, W, H, sim, upto, startYear, marks) {
    paper(ctx, W, H);
    var x0 = 60, x1 = W - 30, y0 = 50, y1 = H - 46, n = sim.t.length - 1, T = sim.t[n];
    ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
    for (var yr = 0; yr <= T; yr += 10) {
      var gx = x0 + yr / T * (x1 - x0);
      ctx.beginPath(); ctx.moveTo(gx, y1); ctx.lineTo(gx, y1 + 5); ctx.stroke();
      text(ctx, String(startYear + yr), gx, y1 + 20, { s: 10.5, c: v("--mist"), a: "center" });
    }
    (marks || []).forEach(function (m) {
      var mx = x0 + m.t / T * (x1 - x0);
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(mx, y0); ctx.lineTo(mx, y1); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, m.label, mx + 5, y0 + 12, { s: 10.5, c: v("--amber-700"), w: "800" });
    });
    var series = [
      { a: sim.V, max: 100, c: "--green", name: "🌿 식생", unit: "%", f: function (x) { return Math.round(x); } },
      { a: sim.E, max: 20, c: "--coral", name: "🦌 엘크", unit: "마리", f: function (x) { return (Math.round(x * 100) * 10).toLocaleString(); } },
      { a: sim.W, max: 320, c: "--violet", name: "🐺 늑대", unit: "마리", f: function (x) { return Math.round(x); } }
    ];
    series.forEach(function (s, k) {
      ctx.strokeStyle = v(s.c); ctx.lineWidth = 3; ctx.beginPath();
      for (var i = 0; i <= upto; i++) {
        var xx = x0 + i / n * (x1 - x0), yy = y1 - clamp(s.a[i] / s.max, 0, 1) * (y1 - y0);
        if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      text(ctx, s.name + " " + s.f(s.a[upto]) + s.unit, x0 + 10 + k * 230, 28, { s: 13, w: "800", c: v(s.c) });
    });
    text(ctx, "세 줄은 각자의 눈금으로 그렸습니다 (식생 0~100%, 엘크 0~2만, 늑대 0~320)", x1, H - 8, { s: 10, c: v("--mist"), a: "right" });
  }

  function animate(canvas, sim, startYear, marks, onEnd) {
    var ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h, n = sim.t.length - 1, i = 0;
    canvas._redraw = function () { chart(ctx, W, H, sim, Math.min(i, n), startYear, marks); };
    (function step() {
      i = Math.min(n, i + Math.ceil(n / 120));
      chart(ctx, W, H, sim, i, startYear, marks);
      if (i < n) window.setTimeout(step, 25); else if (onEnd) onEnd();   // rAF 는 가려진 탭에서 멈추므로 쓰지 않는다
    })();
  }

  /* 장면 2 — 생태 피라미드 */
  (function () {
    var canvas = $("c-pyr"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var e0 = 100000, eff = 10, okA = !!window.sthState("pyrA"), okB = !!window.sthState("pyrB");
    function draw() {
      paper(ctx, W, H);
      var names = ["🌿 생산자 (풀·버드나무)", "🦌 1차 소비자 (엘크)", "🐺 2차 소비자 (늑대)"], vals = [e0, e0 * eff / 100, e0 * eff * eff / 10000];
      var cols = ["--green", "--coral", "--violet"];
      for (var i = 0; i < 3; i++) {
        var w = Math.max(14, 760 * Math.pow(vals[i] / e0, 0.5)), y = 190 - i * 70;
        ctx.fillStyle = v(cols[i]); ctx.beginPath(); ctx.roundRect(W / 2 - w / 2, y, w, 56, 10); ctx.fill();
        text(ctx, names[i], 24, y + 24, { s: 12, w: "800" });
        text(ctx, Math.round(vals[i]).toLocaleString(), W - 24, y + 34, { s: 15, w: "900", a: "right", c: v(cols[i] + "-700") || v("--ink") });
      }
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
        $("gone-info").innerHTML = "엘크는 약 3,800마리에서 한때 <b>1만 6천 마리</b>까지 늘었다가 1만 2천 마리쯤에서 멈췄습니다. 식생은 <b>75% → 20%</b>로 무너진 뒤 70년이 지나도 회복되지 않았습니다.";
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
      { id: "e2b", label: "우리 주변의 사례", hint: "외래종 유입, 서식지 파괴처럼 평형을 깨뜨리는 환경 변화 하나를 골라, 먹이 관계를 따라 어떤 영향이 퍼질지 예상해 쓰세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 2℃의 문턱
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  /* 장면 1 — 킬링 곡선 */
  (function () {
    var canvas = $("c-keel"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    function ppm(y) { var t = y - 1958; return 315 + 0.78 * t + 0.0128 * t * t; }      // 1958년 315 → 2024년 약 422
    function draw() {
      paper(ctx, W, H);
      var x0 = 70, x1 = W - 30, y0 = 30, y1 = H - 40;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (var p = 320; p <= 420; p += 20) { var gy = y1 - (p - 300) / 130 * (y1 - y0); text(ctx, p + "", x0 - 8, gy + 4, { s: 10.5, c: v("--mist"), a: "right" }); ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); ctx.globalAlpha = 1; }
      for (var y = 1960; y <= 2020; y += 10) text(ctx, y + "", x0 + (y - 1958) / 66 * (x1 - x0), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" });
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2; ctx.beginPath();
      for (var m = 0; m <= 66 * 12; m++) {
        var yr = 1958 + m / 12, val = ppm(yr) + 3 * Math.sin(m / 12 * 2 * Math.PI + 1.2);
        var xx = x0 + m / (66 * 12) * (x1 - x0), yy = y1 - (val - 300) / 130 * (y1 - y0);
        if (m === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
      }
      ctx.stroke();
      text(ctx, "대기 중 CO₂ 농도 (ppm) — 마우나로아 관측소", x0 + 10, y0 + 6, { s: 12.5, w: "800" });
      text(ctx, "톱니는 계절 변화: 북반구 식물이 자라는 여름에 줄고 겨울에 늘어납니다", x1, y1 - 10, { s: 10.5, c: v("--mist"), a: "right" });
    }
    canvas._redraw = draw; draw();
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
    function arrow(x, ya, yb, w, col, label, lx) {
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = Math.max(2, w);
      window.drawArrow(ctx, x, ya, x, yb, 10 + w * .6);
      if (label) text(ctx, label, lx || x + 14, (ya + yb) / 2, { s: 11.5, w: "800", c: col });
    }
    function draw() {
      paper(ctx, W, H);
      var ep01 = e / 100, T = temp(ep01), ground = 320, atmTop = 120, atmBot = 190;
      /* 대기층 */
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.08 + 0.4 * ep01; ctx.fillRect(40, atmTop, W - 80, atmBot - atmTop); ctx.globalAlpha = 1;
      text(ctx, "대기 (온실 기체)", 52, atmTop + 20, { s: 12, w: "800", c: v("--brand-700") });
      /* 지표 */
      var warm = clamp((T + 20) / 55, 0, 1);
      ctx.fillStyle = T < 0 ? v("--brand-100") : v("--green"); ctx.globalAlpha = T < 0 ? 1 : lerp(.5, 1, warm); ctx.fillRect(40, ground, W - 80, 40); ctx.globalAlpha = 1;
      text(ctx, T < 0 ? "❄️ 얼어붙은 지표" : "지표", 52, ground + 25, { s: 12, w: "800" });
      /* 복사 화살표 */
      arrow(200, 30, ground - 6, 9, v("--amber"), "", 0);
      text(ctx, "태양 복사 (대기를 거의 그대로 통과)", 216, 70, { s: 11.5, w: "800", c: v("--amber-700") });
      var up = 6 + 8 * Math.pow((T + 273) / 288, 4);
      arrow(480, ground - 6, atmBot + 4, up, v("--coral"), "지구 복사 (적외선)", 500);
      if (ep01 < 1) arrow(480, atmTop - 4, 34, up * (1 - ep01), v("--coral"), "우주로 빠져나감 " + Math.round((1 - ep01) * 100) + "%", 500);
      if (ep01 > 0) {
        arrow(700, atmBot + 4, ground - 6, up * ep01 / 2 + 1, v("--rose"), "대기가 지표로 재복사", 716);
        arrow(760, atmTop - 4, 60, up * ep01 / 2 + 1, v("--rose"), "", 0);
      }
      /* 온도계 */
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(60, 220, 110, 70, 14); ctx.fill();
      text(ctx, "지표 평균 기온", 115, 242, { s: 11, c: v("--mist"), a: "center" });
      text(ctx, (T > 0 ? "+" : "") + T.toFixed(1) + " ℃", 115, 274, { s: 22, w: "900", a: "center", c: T < 0 ? v("--brand-700") : (T > 17 ? v("--rose-700") : v("--green-700")) });

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
    $("gh-e").addEventListener("input", function (ev) { e = +ev.target.value; $("gh-e-val").textContent = e + "%"; draw(); });
    draw(); mission();
  })();

  /* 장면 3 — 엘니뇨 단면 + 보고 분류 */
  (function () {
    var canvas = $("c-enso"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var w = 70, seen = !!window.sthState("ensoSeen"), sorted = !!window.sthState("ensoSorted");
    function draw() {
      paper(ctx, W, H);
      var k = w / 100, sea = 130, x0 = 60, x1 = W - 60, bot = H - 30;
      /* 육지 */
      ctx.fillStyle = v("--coral-100"); ctx.fillRect(0, sea - 26, x0, bot - sea + 26); ctx.fillRect(x1, sea - 40, W - x1, bot - sea + 40);
      text(ctx, "인도네시아·호주", 6, sea - 34, { s: 10.5, w: "800" }); text(ctx, "페루", x1 + 8, sea - 48, { s: 10.5, w: "800" });
      text(ctx, "서태평양", x0 + 10, bot + 18, { s: 11, c: v("--mist") }); text(ctx, "동태평양", x1 - 10, bot + 18, { s: 11, c: v("--mist"), a: "right" });
      /* 찬 바다 + 따뜻한 표층 (수온 약층이 기울어진다) */
      ctx.fillStyle = v("--brand-700"); ctx.fillRect(x0, sea, x1 - x0, bot - sea);
      var dW = lerp(70, 170, k), dE = lerp(120, 22, k);
      ctx.fillStyle = v("--coral"); ctx.globalAlpha = .85; ctx.beginPath(); ctx.moveTo(x0, sea); ctx.lineTo(x1, sea); ctx.lineTo(x1, sea + dE); ctx.lineTo(x0, sea + dW); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      text(ctx, "따뜻한 표층수", lerp(x1 - 330, x0 + 40, k), sea + 28, { s: 12, w: "800", c: v("--on-accent") });
      text(ctx, "차가운 심층수", (x0 + x1) / 2, bot - 16, { s: 12, w: "800", c: v("--on-accent"), a: "center" });
      /* 용승 */
      if (k > 0.15) { ctx.strokeStyle = v("--brand-100"); ctx.fillStyle = v("--brand-100"); ctx.lineWidth = 2 + 5 * k; window.drawArrow(ctx, x1 - 30, bot - 40, x1 - 30, sea + dE + 14, 12); text(ctx, "용승", x1 - 78, bot - 50, { s: 11.5, w: "800", c: v("--brand-100") }); }
      /* 무역풍 */
      ctx.strokeStyle = v("--ink"); ctx.fillStyle = v("--ink"); ctx.lineWidth = 1.5 + 5 * k;
      window.drawArrow(ctx, x1 - 120, sea - 50, lerp(x1 - 220, x0 + 160, k), sea - 50, 12);
      text(ctx, "무역풍", x1 - 110, sea - 62, { s: 11.5, w: "800" });
      /* 비구름 위치 */
      var cx = lerp(x1 - 190, x0 + 110, k);
      ctx.fillStyle = v("--mist"); for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(cx + i * 26 - 26, 46 - (i === 1 ? 10 : 0), 22, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2; for (var r = 0; r < 5; r++) { ctx.beginPath(); ctx.moveTo(cx - 40 + r * 20, 70); ctx.lineTo(cx - 46 + r * 20, 88); ctx.stroke(); }

      var sst = lerp(29, 20, k), fish = Math.round(lerp(15, 100, k));
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
      paper(ctx, W, H);
      var r = run(), n = r.em.length - 1, T = r.tp[n];
      lastT = T;
      function panel(x0, x1, title, arr, max, col, fill) {
        var y0 = 50, y1 = H - 40;
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
        text(ctx, title, x0, 30, { s: 12.5, w: "800" });
        [2030, 2050, 2070, 2090].forEach(function (yy) { text(ctx, yy + "", x0 + (yy - 2024) / 76 * (x1 - x0), y1 + 18, { s: 10.5, c: v("--mist"), a: "center" }); });
        ctx.beginPath();
        arr.forEach(function (val, i) { var xx = x0 + i / n * (x1 - x0), yy = y1 - clamp(val / max, 0, 1) * (y1 - y0); if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); });
        ctx.strokeStyle = v(col); ctx.lineWidth = 3; ctx.stroke();
        if (fill) { ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.closePath(); ctx.fillStyle = v(col); ctx.globalAlpha = .18; ctx.fill(); ctx.globalAlpha = 1; }
        return { y0: y0, y1: y1 };
      }
      var a = panel(60, 420, "해마다 내보내는 CO₂ (Gt/년) — 색칠한 넓이가 누적 배출량", r.em, 60, "--coral", true);
      var sx = 60 + (ys - 2024) / 76 * 360;
      ctx.strokeStyle = v("--teal"); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(sx, a.y0); ctx.lineTo(sx, a.y1); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "감축 시작", sx + 5, a.y0 + 12, { s: 10.5, w: "800", c: v("--teal-700") });
      var b = panel(520, 870, "산업화 이전 대비 기온 상승 (℃)", r.tp, 3.5, T < 2 ? "--green" : "--rose", false);
      [[1.5, "1.5℃"], [2.0, "2.0℃"]].forEach(function (g) {
        var gy = b.y1 - g[0] / 3.5 * (b.y1 - b.y0);
        ctx.strokeStyle = v("--amber"); ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(520, gy); ctx.lineTo(870, gy); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, g[1], 874, gy + 4, { s: 10.5, w: "800", c: v("--amber-700") });
      });
      text(ctx, "2100년 +" + T.toFixed(2) + "℃", 870, b.y1 - clamp(T / 3.5, 0, 1) * (b.y1 - b.y0) - 10, { s: 14, w: "900", a: "right", c: T < 2 ? v("--green-700") : v("--rose-700") });

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
    { key: "r3", label: "③ 2℃의 문턱" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "잎과 빛, 늑대와 숲, 온실 기체와 기온. 세 이야기에 공통으로 들어 있는 생각을 ‘생물’과 ‘환경’이라는 말을 넣어 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

})();
