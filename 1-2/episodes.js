/* 통합과학2 Ⅰ-2 화학 변화 — 소단원별 이야기 세 편
   01 붉은 돌에서 철을 꺼내라 / 02 물고기가 사라진 호수 / 03 불 없이 따뜻하게, 얼음 없이 차갑게
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is2-1-2");

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
function dot(ctx, x, y, r, fill, label, ink, size) {
  ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  if (label) text(ctx, label, x, y + (size || 10) * 0.36, { s: size || 10, w: "800", a: "center", c: ink || v("--on-accent") });
}
/* 글자 길이에 맞춘 알약 모양 입자 */
function pill(ctx, x, y, label, fill, ink) {
  ctx.font = "800 10.5px " + FONT;
  var w = Math.max(30, ctx.measureText(label).width + 14);
  ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 12, w, 24, 12); ctx.fill();
  text(ctx, label, x, y + 4, { s: 10.5, w: "800", a: "center", c: ink || v("--on-accent") });
}
/* .seg 단추 묶음 */
/* 받침에 따라 조사 고르기 : josa("구리", "이", "가") → "구리가" */
function josa(w, a, b) { var c = w.charCodeAt(w.length - 1); return w + ((c - 0xAC00) % 28 ? a : b); }
function seg(id, cb) {
  var bs = Array.prototype.slice.call($(id).querySelectorAll("button"));
  bs.forEach(function (b) {
    b.addEventListener("click", function () {
      bs.forEach(function (x) { x.classList.toggle("on", x === b); });
      cb(b.getAttribute("data-k"));
    });
  });
}

/* =========================================================================
   이야기 ① 붉은 돌에서 철을 꺼내라
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  window.sthGate({
    gate: "a-gate", key: "p1", title: "조사관의 첫 추리",
    question: "철광석에서 철을 꺼낼 때, 숯(코크스)이 하는 가장 중요한 일은 무엇일까요?",
    options: ["㉠ 가마의 온도를 높이는 연료일 뿐이다", "㉡ 철광석에 붙어 있는 산소를 떼어 간다", "㉢ 철광석을 녹여서, 섞여 있던 철 알갱이가 흘러나오게 한다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 용광로 : Fe₂O₃ + 3CO → 2Fe + 3CO₂ , 2C + O₂ → 2CO
     Fe₂O₃ 160 kg(1 kmol) 에 C 36 kg(3 kmol) → Fe 112 kg, CO₂ 132 kg */
  (function () {
    var canvas = $("a-furn"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ore = 160, coke = 10;
    var got = window.sthState("furn") || { a: false, b: false, q: false };

    function calc() {
      var need = ore * 9 / 40, ext = Math.min(1, coke / need);
      return { need: need, ext: ext, fe: ore * 0.7 * ext, oreLeft: ore * (1 - ext), cokeLeft: Math.max(0, coke - need),
               co2: Math.min(coke, need) * 44 / 12, oLost: ore * 0.3 * ext };
    }
    function draw() {
      paper(ctx, W, H);
      var r = calc(), i;
      /* 용광로 단면 */
      ctx.fillStyle = v("--card-2"); ctx.strokeStyle = v("--line"); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(100, 62); ctx.lineTo(240, 62); ctx.lineTo(290, 300); ctx.lineTo(50, 300); ctx.closePath(); ctx.fill(); ctx.stroke();
      var nOre = Math.round(r.oreLeft / 20), nCoke = Math.round(r.cokeLeft / 4), nFe = r.fe;
      for (i = 0; i < Math.min(nOre, 24); i++) dot(ctx, 92 + (i % 6) * 31 + (Math.floor(i / 6) % 2) * 10, 250 - Math.floor(i / 6) * 34, 11, v("--coral-700"));
      for (i = 0; i < Math.min(nCoke, 24); i++) dot(ctx, 108 + (i % 6) * 27, 96 + Math.floor(i / 6) * 20, 7, v("--ink"));
      var poolH = clamp(nFe / 340 * 34, 0, 34);
      ctx.fillStyle = v("--amber"); ctx.fillRect(56, 298 - poolH, 228, poolH);
      if (nFe > 0) text(ctx, "쇳물", 170, 294, { s: 10.5, w: "800", a: "center", c: v("--ink") });
      text(ctx, "용광로 단면", 170, 326, { s: 12, w: "800", a: "center" });
      text(ctx, "● 철광석  ● 코크스(반응하고 남은 것만 표시)", 170, 346, { s: 10, a: "center", c: v("--mist") });
      ctx.strokeStyle = v("--brand"); ctx.fillStyle = v("--brand"); ctx.lineWidth = 3;
      window.drawArrow(ctx, 6, 276, 50, 276, 9);
      text(ctx, "공기", 6, 262, { s: 10.5, w: "800", c: v("--brand-700") }); text(ctx, "(O₂)", 6, 296, { s: 10.5, w: "800", c: v("--brand-700") });
      if (r.ext > 0) {
        ctx.strokeStyle = v("--mist"); ctx.fillStyle = v("--mist"); ctx.lineWidth = 2 + 4 * r.ext;
        window.drawArrow(ctx, 170, 58, 170, 22, 10);
        text(ctx, "CO₂", 184, 36, { s: 11.5, w: "800", c: v("--mist") });
      }

      /* 입자 모형 : Fe₂O₃ + 3CO → 2Fe + 3CO₂ */
      var cFe = v("--coral-700"), cO = v("--rose"), cC = v("--ink"), y = 96, xs;
      text(ctx, "입자 모형 — 산소(O)는 누구에게서 누구에게로 갔나", 350, 24, { s: 12.5, w: "800" });
      xs = [366, 388, 410, 432, 454];
      for (i = 0; i < 5; i++) dot(ctx, xs[i], y, 11, i % 2 ? cFe : cO, i % 2 ? "Fe" : "O", null, 9);
      text(ctx, "+", 478, y + 5, { s: 16, w: "800", a: "center" });
      for (i = 0; i < 3; i++) { dot(ctx, 506 + i * 32, y - 11, 10, cC, "C", v("--panel"), 9); dot(ctx, 506 + i * 32, y + 10, 10, cO, "O", null, 9); }
      ctx.strokeStyle = v("--ink"); ctx.fillStyle = v("--ink"); ctx.lineWidth = 2; window.drawArrow(ctx, 596, y, 626, y, 8);
      dot(ctx, 652, y, 11, cFe, "Fe", null, 9); dot(ctx, 678, y, 11, cFe, "Fe", null, 9);
      text(ctx, "+", 702, y + 5, { s: 16, w: "800", a: "center" });
      for (i = 0; i < 3; i++) { var cx = 738 + i * 54; dot(ctx, cx - 17, y, 9, cO, "O", null, 8); dot(ctx, cx, y, 9, cC, "C", v("--panel"), 8); dot(ctx, cx + 17, y, 9, cO, "O", null, 8); }
      text(ctx, "산화 철(Ⅲ)", 410, y + 38, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "일산화 탄소", 538, y + 38, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "철", 665, y + 38, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "이산화 탄소", 792, y + 38, { s: 10.5, a: "center", c: v("--mist") });
      ctx.strokeStyle = v("--brand"); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(410, y - 18); ctx.quadraticCurveTo(538, y - 72, 660, y - 18); ctx.stroke();
      text(ctx, "산소를 잃음 → 환원", 538, y - 52, { s: 11.5, w: "800", a: "center", c: v("--brand-700") });
      ctx.strokeStyle = v("--rose"); ctx.beginPath(); ctx.moveTo(538, y + 46); ctx.quadraticCurveTo(665, y + 86, 792, y + 46); ctx.stroke();
      text(ctx, "산소를 얻음 → 산화", 665, y + 82, { s: 11.5, w: "800", a: "center", c: v("--rose-700") });

      /* 막대 장부 */
      var rows = [["남은 철광석", r.oreLeft, "--coral-700"], ["얻은 철", r.fe, "--amber"], ["남은 코크스", r.cokeLeft, "--ink"], ["나온 이산화 탄소", r.co2, "--mist"]];
      rows.forEach(function (row, k) {
        var by = 206 + k * 36;
        text(ctx, row[0], 350, by + 14, { s: 11.5, w: "800" });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(470, by, 320, 18);
        ctx.fillStyle = v(row[2]); ctx.fillRect(470, by, clamp(row[1] / 500, 0, 1) * 320, 18);
        text(ctx, Math.round(row[1]) + " kg", 880, by + 14, { s: 12.5, w: "900", a: "right" });
      });

      $("a-furn-info").innerHTML = "철광석 " + ore + " kg, 코크스 " + coke + " kg → 철 <b>" + Math.round(r.fe) + " kg</b>. " +
        "철광석이 <b>잃은 산소 " + Math.round(r.oLost) + " kg</b>은 고스란히 일산화 탄소가 <b>얻어</b> 이산화 탄소가 되었습니다. " +
        (r.ext < 1 ? "코크스가 모자라 철광석 " + Math.round(r.oreLeft) + " kg이 산소를 잃지 못한 채 남았습니다." :
          (r.cokeLeft > 0.01 ? "철광석은 모두 철이 되었지만 코크스 " + Math.round(r.cokeLeft) + " kg이 쓰이지 못하고 남았습니다." :
            "철광석도 코크스도 남지 않았습니다. 철광석 160 kg마다 코크스 36 kg이 꼭 맞습니다."));
      var exact = r.ext >= 1 && r.cokeLeft < 0.01, ch = false;
      if (exact && ore === 160 && !got.a) { got.a = ch = true; }
      if (exact && Math.abs(r.fe - 280) < 0.01 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("furn", got); mission(); }
    }
    function mission() {
      if (got.a) { done("a-m2a"); $("a-m2a").innerHTML = "철광석 160 kg ↔ 코크스 <b>36 kg</b> → 철 112 kg"; }
      if (got.b) { done("a-m2b"); $("a-m2b").innerHTML = "철광석 <b>400 kg</b> + 코크스 <b>90 kg</b> → 철 280 kg. 반응하는 물질의 양은 늘 같은 비율입니다."; }
      if (got.q) done("a-m2c");
      if (got.a && got.b && got.q) { window.sthMission("a-m2", true); ep.clear(1); }
    }
    canvas._redraw = draw;
    $("a-ore").addEventListener("input", function (e) { ore = +e.target.value; $("a-ore-val").textContent = ore + " kg"; draw(); });
    $("a-coke").addEventListener("input", function (e) { coke = +e.target.value; $("a-coke-val").textContent = coke + " kg"; draw(); });
    window.sthPick({
      mount: "a-q2",
      q: "용광로 안에서 ‘환원’된 물질은 무엇이고, 그렇게 판단한 까닭은?",
      options: ["일산화 탄소 — 산소를 얻어 이산화 탄소가 되었으므로", "산화 철(Ⅲ) — 산소를 잃고 철이 되었으므로", "코크스 — 타서 없어졌으므로", "철 — 새로 생겨났으므로"],
      answer: 1,
      why: ["산소를 얻는 것은 산화입니다. 일산화 탄소는 산화되었습니다.", "산소를 잃는 것이 환원입니다. 그리고 그 산소를 얻은 일산화 탄소는 동시에 산화되었습니다.", "없어진 것이 아니라 산소와 결합해 기체가 되어 빠져나갔습니다.", "철은 환원의 결과로 생긴 생성물입니다. 환원된 것은 반응물인 산화 철(Ⅲ)입니다."],
      onDone: function () { got.q = true; window.sthState("furn", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 3 — 세 사건의 공통점 */
  window.sthSort({
    mount: "a-sort",
    buckets: [
      { id: "ox", label: "산화", sub: "산소를 얻는다" },
      { id: "re", label: "환원", sub: "산소를 잃는다" }
    ],
    items: [
      { t: "제련: 산화 철(Ⅲ) Fe₂O₃ → 철 Fe", a: "re", why: "산소를 잃었으므로 환원입니다." },
      { t: "제련: 일산화 탄소 CO → 이산화 탄소 CO₂", a: "ox", why: "산소를 하나 더 얻었으므로 산화입니다." },
      { t: "연소: 메테인 CH₄ → 이산화 탄소 CO₂", a: "ox", why: "탄소가 산소와 결합했습니다. 연소는 빠른 산화입니다.", hint: "메테인의 탄소가 무엇과 결합했나요?" },
      { t: "광합성: 이산화 탄소 CO₂ → 포도당 C₆H₁₂O₆", a: "re", why: "이산화 탄소가 산소를 잃고 포도당이 됩니다. 광합성에서 이산화 탄소는 환원됩니다.", hint: "탄소 원자 하나에 붙은 산소의 수를 비교해 보세요. CO₂는 2개, 포도당은 1개꼴입니다." },
      { t: "세포 호흡: 포도당 C₆H₁₂O₆ → 이산화 탄소 CO₂", a: "ox", why: "광합성의 반대 방향입니다. 포도당이 산화됩니다.", hint: "광합성의 반대 방향입니다." },
      { t: "녹: 철 Fe → 산화 철", a: "ox", why: "철이 공기 중 산소와 결합하는 느린 산화입니다." },
      { t: "손난로: 철 가루 → 산화 철", a: "ox", why: "철의 산화입니다. 이때 나오는 열을 이용합니다. (이야기 ③에서 다시 만납니다.)" },
      { t: "구리 제련: 산화 구리(Ⅱ) CuO → 구리 Cu", a: "re", why: "탄소와 함께 가열하면 산화 구리가 산소를 잃고 구리가 됩니다." }
    ],
    doneText: "광합성·연소·제련 모두 한 물질이 산소를 잃으면 다른 물질이 그 산소를 얻습니다.",
    onDone: function () { window.sthMission("a-m3", true, "<span class='m-tag'>미션 완료</span>세 사건의 공통점은 <b>산소의 이동</b>입니다. 산소를 얻는 산화와 잃는 환원이 언제나 짝을 이루어 함께 일어납니다."); ep.clear(2); }
  });
  if (ep.cleared(2)) window.sthMission("a-m3", true);

  /* 장면 4 — 금속과 금속 이온 수용액 */
  (function () {
    var canvas = $("a-metal"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var MET = {
      Mg: { r: 5, name: "마그네슘", ion: "Mg²⁺", q: 2, col: "--mist" },
      Zn: { r: 4, name: "아연", ion: "Zn²⁺", q: 2, col: "--mist" },
      Fe: { r: 3, name: "철", ion: "Fe²⁺", q: 2, col: "--violet" },
      Cu: { r: 2, name: "구리", ion: "Cu²⁺", q: 2, col: "--coral" },
      Ag: { r: 1, name: "은", ion: "Ag⁺", q: 1, col: "--card" }
    };
    var metal = "Cu", ion = "Zn", time = 0, timer = null;
    var got = window.sthState("metal") || { a: false, b: false, c: false, q: false };
    var N = 12, SLOT = [];
    (function () { for (var i = 0; i < N; i++) { var left = i % 2 === 0, k = Math.floor(i / 2); SLOT.push({ x: (left ? 100 : 310) + (k % 2) * 62 + (k % 3) * 9, y: 150 + k * 30 }); } })();

    function state() {
      var reacts = MET[metal].r > MET[ion].r, frac = reacts ? time / 100 : 0, q = MET[ion].q;
      var used = q === 1 ? 2 * Math.round(N / 2 * frac) : Math.round(N * frac);      // 없어진 수용액 속 이온 수
      var made = q === 1 ? used / 2 : used;                                          // 새로 녹아 나온 금속 이온 수
      return { reacts: reacts, frac: frac, used: used, made: made, e: used * q };
    }
    function draw() {
      paper(ctx, W, H);
      var s = state(), m = MET[metal], t = MET[ion], i;
      /* 비커와 용액 색 */
      var cu = (ion === "Cu" ? N - s.used : 0) + (metal === "Cu" ? s.made : 0);
      var fe = (ion === "Fe" ? N - s.used : 0) + (metal === "Fe" ? s.made : 0);
      ctx.fillStyle = v("--card-2"); ctx.fillRect(60, 110, 380, 240);
      if (cu > 0) { ctx.fillStyle = v("--brand"); ctx.globalAlpha = 0.06 + 0.3 * cu / N; ctx.fillRect(60, 110, 380, 240); ctx.globalAlpha = 1; }
      if (fe > 0) { ctx.fillStyle = v("--green"); ctx.globalAlpha = 0.05 + 0.18 * fe / N; ctx.fillRect(60, 110, 380, 240); ctx.globalAlpha = 1; }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, 70); ctx.lineTo(60, 350); ctx.lineTo(440, 350); ctx.lineTo(440, 70); ctx.stroke();
      text(ctx, t.ion + " 수용액", 72, 96, { s: 12, w: "800", c: v("--mist") });
      /* 금속 */
      var mw = s.reacts ? lerp(44, 26, s.frac) : 44;
      ctx.fillStyle = v(m.col); ctx.fillRect(250 - mw / 2, 30, mw, 270);
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 1.5; ctx.strokeRect(250 - mw / 2, 30, mw, 270);
      text(ctx, metal, 250, 60, { s: 14, w: "900", a: "center", c: metal === "Ag" ? v("--ink") : v("--on-accent") });
      /* 석출된 금속 */
      for (i = 0; i < s.used; i++) {
        var side = i % 2 ? 1 : -1, dy = 128 + Math.floor(i / 2) * 27;
        ctx.fillStyle = v(t.col); ctx.strokeStyle = v("--ink"); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(250 + side * (mw / 2 + 8), dy, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      /* 이온 */
      for (i = 0; i < N; i++) {
        var p = SLOT[i];
        if (i >= s.used) pill(ctx, p.x, p.y, t.ion, v(ion === "Cu" ? "--brand" : (ion === "Fe" ? "--green-700" : "--mist")));
        else if (t.q === 2 || i % 2 === 0) pill(ctx, p.x, p.y, m.ion, v("--rose"));
      }
      /* 전자 이동 */
      if (s.reacts && time > 0 && time < 100) {
        ctx.strokeStyle = v("--amber"); ctx.fillStyle = v("--amber"); ctx.lineWidth = 2.5;
        window.drawArrow(ctx, 250 + mw / 2 + 2, 118, 330, 100, 9);
        text(ctx, "e⁻", 336, 98, { s: 12, w: "900", c: v("--amber-700") });
      }
      /* 오른쪽 장부 */
      var x0 = 490;
      text(ctx, "입자 수 장부", x0, 40, { s: 14, w: "900" });
      if (s.reacts) {
        text(ctx, m.name + " 원자 " + s.made + "개 → " + m.ion + "  (전자를 잃음 · 산화)", x0, 78, { s: 12, w: "800", c: v("--rose-700") });
        text(ctx, t.ion + " " + s.used + "개 → " + t.name + " 원자  (전자를 얻음 · 환원)", x0, 106, { s: 12, w: "800", c: v("--brand-700") });
      } else {
        text(ctx, "변화 없음 — 전자가 옮겨 가지 않습니다", x0, 78, { s: 12, w: "800", c: v("--mist") });
      }
      var bars = [["잃은 전자", s.e, "--rose"], ["얻은 전자", s.e, "--brand"], ["수용액 속 " + t.ion, N - s.used, "--mist"], ["수용액 속 " + (s.reacts ? m.ion : "새 이온"), s.made, "--rose"]];
      bars.forEach(function (b, k) {
        var by = 136 + k * 42;
        text(ctx, b[0], x0, by + 14, { s: 11.5, w: "800" });
        ctx.fillStyle = v("--card-2"); ctx.fillRect(x0 + 120, by, 220, 18);
        ctx.fillStyle = v(b[2]); ctx.fillRect(x0 + 120, by, 220 * b[1] / 24, 18);
        text(ctx, b[1] + "개", 880, by + 14, { s: 12.5, w: "900", a: "right" });
      });
      text(ctx, "수용액 속 금속 이온은 모두 " + (N - s.used + s.made) + "개", x0, 322, { s: 12, w: "800" });
      text(ctx, "(음이온은 반응하지 않으므로 그리지 않았습니다)", x0, 344, { s: 10.5, c: v("--mist") });

      $("a-time-val").textContent = time;
      if (metal === ion) {
        $("a-metal-info").innerHTML = "<b>변화가 없습니다.</b> " + m.name + " 금속을 같은 금속의 이온이 든 수용액에 넣었습니다. 반응성을 견줄 상대가 없습니다.";
      } else if (s.reacts) {
        $("a-metal-info").innerHTML = "<b>반응이 일어납니다.</b> " + josa(m.name, "이", "가") + " " + t.name + "보다 반응성이 커서, " + m.name + " 원자는 전자를 잃고 <b>산화</b>되어 " + m.ion + "으로 녹아 나오고, " + t.ion + "은 그 전자를 얻어 <b>환원</b>되어 " + t.name + " 금속으로 달라붙습니다. 지금까지 옮겨 간 전자는 <b>" + s.e + "개</b>, 잃은 수와 얻은 수가 늘 같습니다." +
          (t.q === 1 ? " Ag⁺은 전자를 1개씩만 얻으므로 " + m.name + " 원자 1개가 Ag⁺ <b>2개</b>를 환원시킵니다. 그래서 수용액 속 이온 수가 줄어듭니다." : "") +
          (ion === "Cu" ? " Cu²⁺이 줄어들면서 용액의 <b>푸른색이 옅어집니다.</b>" : "") + (metal === "Cu" ? " Cu²⁺이 생기면서 용액이 <b>푸른색</b>을 띱니다." : "");
      } else {
        $("a-metal-info").innerHTML = "<b>반응이 일어나지 않습니다.</b> " + josa(m.name, "은", "는") + " " + t.name + "보다 반응성이 작아, " + t.ion + "에게 전자를 내주지 못합니다. 시간이 지나도 그대로입니다.";
      }
      var ch = false;
      if (time === 100) {
        if (metal === "Fe" && ion === "Cu" && !got.a) { got.a = ch = true; }
        if (metal === "Cu" && ion === "Ag" && !got.b) { got.b = ch = true; }
        if (!s.reacts && !got.c) { got.c = ch = true; }
      }
      if (ch) { window.sthState("metal", got); mission(); }
    }
    function mission() {
      if (got.a) { done("a-m4a"); $("a-m4a").innerHTML = "철 못 + Cu²⁺ 수용액 → 철 못에 구리가 입혀집니다."; }
      if (got.b) { done("a-m4b"); $("a-m4b").innerHTML = "구리 선 + Ag⁺ 수용액 → 구리 선에 은이 자라납니다."; }
      if (got.c) done("a-m4c");
      if (got.q) done("a-m4d");
      if (got.a && got.b && got.c && got.q) {
        window.sthMission("a-m4", true, "<span class='m-tag'>미션 완료</span>반응성 <b>Mg &gt; Zn &gt; Fe &gt; Cu &gt; Ag</b>. 반응성이 큰 금속을, 반응성이 작은 금속의 이온이 든 수용액에 넣어야 도금이 됩니다. 산소가 없어도 <b>전자를 잃으면 산화, 얻으면 환원</b>입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    function stop() { if (timer) { window.clearTimeout(timer); timer = null; } $("a-play").textContent = "▶ 시간 흐르게 하기"; }
    function reset() { stop(); time = 0; $("a-time").value = 0; draw(); }
    canvas._redraw = draw;
    seg("a-metal-seg", function (k) { metal = k; reset(); });
    seg("a-ion-seg", function (k) { ion = k; reset(); });
    $("a-time").addEventListener("input", function (e) { stop(); time = +e.target.value; draw(); });
    $("a-play").addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (time >= 100) time = 0;
      $("a-play").textContent = "⏸ 멈추기";
      (function step() {
        time = Math.min(100, time + 2); $("a-time").value = time; draw();
        if (time < 100) timer = window.setTimeout(step, 60); else stop();
      })();
    });
    window.sthPick({
      mount: "a-q4",
      q: "여러 조합을 실험한 결과로 볼 때, 금속의 반응성(전자를 잃고 이온이 되려는 정도)을 큰 것부터 옳게 늘어놓은 것은?",
      options: ["Ag > Cu > Fe > Zn > Mg", "Mg > Zn > Fe > Cu > Ag", "Mg > Fe > Zn > Ag > Cu", "Cu > Ag > Mg > Zn > Fe"],
      answer: 1,
      why: ["거꾸로입니다. Ag⁺ 수용액에는 어떤 금속을 넣어도 은이 달라붙었습니다. 은이 가장 이온으로 있기 싫어한다는 뜻입니다.", "Mg은 모든 수용액에서 반응했고, Ag⁺은 모든 금속에게서 전자를 받았습니다.", "Zn을 Fe²⁺ 수용액에, Cu를 Ag⁺ 수용액에 넣어 다시 확인해 보세요.", "Cu 선은 Zn²⁺·Fe²⁺ 수용액에서 아무 변화가 없었습니다."],
      onDone: function () { got.q = true; window.sthState("metal", got); mission(); }
    });
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("a-m4", true);
  })();

  /* 장면 5 — 결말 */
  function vs() {
    var p = window.sthState("p1") || "";
    $("a-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 용광로 장부가 그 증거입니다." : "숯은 열도 내지만, 그것만으로는 철이 나오지 않습니다. 산소를 떼어 가는 물질이 있어야 합니다.") +
      "<br><b>내가 찾은 배합</b> 철광석 160 kg ↔ 코크스 36 kg → 철 112 kg";
  }
  function finish() { window.sthState("r1", "해결 · 철광석 160 kg에 코크스 36 kg → 철 112 kg · 도금 조합 Fe+Cu²⁺, Cu+Ag⁺ · 반응성 Mg>Zn>Fe>Cu>Ag"); }
  ep.onShow(function (i) { if (i === 4) vs(); });
  vs();
  window.sthWork({
    mount: "a-wk", unitLabel: "[통합과학2 Ⅰ-2] 이야기 ① 붉은 돌에서 철을 꺼내라",
    items: [
      { id: "w1", label: "산화와 환원은 함께 일어난다", hint: "이야기에 나온 반응 하나(제련, 연소, 광합성, 금속과 금속 이온)를 골라 무엇이 산화되고 무엇이 환원되는지 짝지어 쓰세요. 옮겨 간 것이 산소인지 전자인지도 밝히세요." },
      { id: "a2", label: "서진이에게 보내는 답장", hint: "장작불로 달구기만 해서는 철이 나오지 않는 까닭, 숯을 철광석과 섞어 넣는 까닭을 ‘산소’라는 말을 넣어 두세 문장으로 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 물고기가 사라진 호수
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "gt", key: "acidbase", title: "조사관의 첫 판단",
    question: "에탄올의 화학식은 C₂H₅<b>OH</b> 입니다. 에탄올은 염기일까요?",
    options: ["㉠ OH 가 있으므로 염기다", "㉡ 염기가 아니다", "㉢ 물에 녹으면 염기가 된다", "㉣ 산이면서 염기다"],
    onPick: function (i) { window.sthState("acidbaseOK", i === 1 ? "맞음" : "어긋남"); ep.clear(0); }
  });

  /* 장면 2 — 검사대 */
  (function () {
    var canvas = $("b-test"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var SUB = {
      hcl:  { name: "묽은 염산", kind: "acid", strong: 1, parts: [["H⁺", 5, "h"], ["Cl⁻", 5, "x"]], note: "염화 수소는 물에 녹아 거의 모두 H⁺과 Cl⁻으로 나뉩니다." },
      acoh: { name: "식초(아세트산 수용액)", kind: "acid", strong: 0, parts: [["H⁺", 1, "h"], ["CH₃COO⁻", 1, "x"], ["CH₃COOH", 6, "m"]], note: "아세트산은 H가 4개지만 일부 분자만, 그것도 H⁺ 하나만 내놓습니다." },
      naoh: { name: "수산화 나트륨 수용액", kind: "base", strong: 1, parts: [["Na⁺", 5, "x"], ["OH⁻", 5, "o"]], note: "물에 녹아 Na⁺과 OH⁻으로 나뉩니다." },
      caoh: { name: "석회수(수산화 칼슘 수용액)", kind: "base", strong: 1, parts: [["Ca²⁺", 3, "x"], ["OH⁻", 6, "o"]], note: "Ca(OH)₂ 하나가 OH⁻을 2개 내놓습니다." },
      nh3:  { name: "암모니아수", kind: "base", strong: 0, parts: [["NH₄⁺", 1, "x"], ["OH⁻", 1, "o"], ["NH₃", 6, "m"]], note: "화학식에 OH가 없지만, 일부 암모니아 분자가 물과 반응해 NH₄⁺과 OH⁻을 만듭니다." },
      etoh: { name: "에탄올 수용액", kind: "none", strong: 0, parts: [["C₂H₅OH", 8, "m"]], note: "에탄올은 물에 녹아도 이온으로 나뉘지 않습니다. 분자 그대로 섞여 있을 뿐, OH⁻을 내놓지 않습니다." }
    };
    var POS = [[90, 150], [200, 130], [310, 160], [140, 205], [260, 215], [85, 260], [195, 270], [320, 265], [250, 300], [130, 310]];
    var sub = "hcl", tool = null;
    var tested = window.sthState("tested") || {}, sorted = !!window.sthState("testSorted");

    function result() {
      var k = SUB[sub].kind, st = SUB[sub].strong;
      if (tool === "btb") return { col: k === "acid" ? "--amber" : (k === "base" ? "--brand" : "--green"), txt: "BTB 용액: <b>" + (k === "acid" ? "노란색" : (k === "base" ? "파란색" : "초록색")) + "</b> — " + (k === "acid" ? "산성" : (k === "base" ? "염기성" : "중성")) + "입니다." };
      if (tool === "pp") return { col: k === "base" ? "--rose" : null, txt: "페놀프탈레인 용액: <b>" + (k === "base" ? "붉은색" : "무색 그대로") + "</b>" + (k === "base" ? " — 염기성입니다." : " — 염기성은 아닙니다. (산성인지 중성인지는 이것만으로 알 수 없습니다.)") };
      if (tool === "lit") return { txt: "리트머스 종이: " + (k === "acid" ? "<b>푸른 종이가 붉게</b> 변했습니다 — 산성." : (k === "base" ? "<b>붉은 종이가 푸르게</b> 변했습니다 — 염기성." : "붉은 종이도 푸른 종이도 <b>변하지 않았습니다.</b>")) };
      if (tool === "mg") return { txt: "마그네슘 조각: " + (k === "acid" ? "<b>수소 기체가 " + (st ? "활발하게" : "천천히") + " 발생</b>합니다. 산의 H⁺이 마그네슘에게서 전자를 얻기 때문입니다." : "기체가 발생하지 않습니다. H⁺이 (거의) 없습니다.") };
      return { txt: "전류: " + (k === "none" ? "<b>흐르지 않습니다.</b> 전하를 나를 이온이 없습니다." : "<b>" + (st ? "잘 흐릅니다" : "약하게 흐릅니다") + ".</b> 수용액 속에 이온이 " + (st ? "많이" : "조금") + " 있습니다.") };
    }
    function draw() {
      paper(ctx, W, H);
      var S = SUB[sub], k = S.kind, i = 0, res = tool ? result() : null;
      /* 비커와 입자 모형 */
      ctx.fillStyle = v("--card-2"); ctx.fillRect(40, 100, 340, 230);
      if (res && res.col) { ctx.fillStyle = v(res.col); ctx.globalAlpha = .28; ctx.fillRect(40, 100, 340, 230); ctx.globalAlpha = 1; }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(40, 60); ctx.lineTo(40, 330); ctx.lineTo(380, 330); ctx.lineTo(380, 60); ctx.stroke();
      text(ctx, S.name + " — 입자 모형 (물 분자는 생략)", 40, 40, { s: 12.5, w: "800" });
      S.parts.forEach(function (p) {
        for (var n = 0; n < p[1]; n++, i++) {
          var col = p[2] === "h" ? v("--coral") : (p[2] === "o" ? v("--brand") : (p[2] === "m" ? v("--violet") : v("--mist")));
          pill(ctx, POS[i % 10][0], POS[i % 10][1], p[0], col);
        }
      });
      /* 오른쪽 : 검사 결과 그림 */
      var x0 = 450;
      text(ctx, "검사 결과", x0, 40, { s: 12.5, w: "800" });
      if (!tool) { text(ctx, "검사 도구를 고르세요.", x0, 80, { s: 12, c: v("--mist") }); }
      else if (tool === "btb" || tool === "pp") {
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(x0 + 40, 70, 70, 220, 30); ctx.fill();
        if (res.col) { ctx.fillStyle = v(res.col); ctx.globalAlpha = .85; ctx.beginPath(); ctx.roundRect(x0 + 40, 130, 70, 160, 30); ctx.fill(); ctx.globalAlpha = 1; }
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(x0 + 40, 70, 70, 220, 30); ctx.stroke();
        text(ctx, tool === "btb" ? "BTB: 산성 노랑 · 중성 초록 · 염기성 파랑" : "페놀프탈레인: 염기성에서만 붉은색", x0 + 140, 180, { s: 11.5, c: v("--mist") });
      } else if (tool === "lit") {
        var red = k === "acid" ? "--rose" : (k === "base" ? "--brand" : "--rose"), blue = k === "acid" ? "--rose" : "--brand";
        text(ctx, "붉은 리트머스 종이", x0, 100, { s: 11.5, c: v("--mist") }); text(ctx, "푸른 리트머스 종이", x0, 200, { s: 11.5, c: v("--mist") });
        ctx.fillStyle = v("--rose"); ctx.fillRect(x0, 112, 120, 40); ctx.fillStyle = v(red); ctx.fillRect(x0 + 120, 112, 160, 40);
        ctx.fillStyle = v("--brand"); ctx.fillRect(x0, 212, 120, 40); ctx.fillStyle = v(blue); ctx.fillRect(x0 + 120, 212, 160, 40);
        text(ctx, "← 용액에 적신 부분", x0 + 290, 137, { s: 11, c: v("--mist") }); text(ctx, "← 용액에 적신 부분", x0 + 290, 237, { s: 11, c: v("--mist") });
      } else if (tool === "mg") {
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(x0 + 40, 70, 90, 220, 30); ctx.fill();
        ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = v("--mist"); ctx.fillRect(x0 + 60, 250, 50, 12);
        text(ctx, "Mg", x0 + 85, 280, { s: 10.5, w: "800", a: "center" });
        var nb = k === "acid" ? (S.strong ? 14 : 4) : 0;
        ctx.strokeStyle = v("--brand"); ctx.lineWidth = 1.5;
        for (var b = 0; b < nb; b++) { ctx.beginPath(); ctx.arc(x0 + 58 + (b * 23) % 54, 236 - (b * 37) % 130, 4 + b % 3, 0, Math.PI * 2); ctx.stroke(); }
        text(ctx, nb ? "H₂ 기체 발생" : "변화 없음", x0 + 160, 180, { s: 12, w: "800", c: nb ? v("--brand-700") : v("--mist") });
      } else {
        var bright = k === "none" ? 0 : (S.strong ? 1 : .4);
        ctx.strokeStyle = v("--ink"); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x0 + 30, 280); ctx.lineTo(x0 + 30, 170); ctx.lineTo(x0 + 110, 170); ctx.moveTo(x0 + 170, 170); ctx.lineTo(x0 + 250, 170); ctx.lineTo(x0 + 250, 280); ctx.stroke();
        ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.arc(x0 + 140, 170, 32, 0, Math.PI * 2); ctx.fill();
        if (bright) { ctx.fillStyle = v("--amber"); ctx.globalAlpha = bright; ctx.beginPath(); ctx.arc(x0 + 140, 170, 32, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
        ctx.stroke();
        text(ctx, bright === 1 ? "전구가 밝게 켜짐" : (bright ? "전구가 희미하게 켜짐" : "전구가 켜지지 않음"), x0 + 140, 120, { s: 12, w: "800", a: "center" });
        text(ctx, "전극 →", x0 + 30, 300, { s: 10.5, c: v("--mist"), a: "center" }); text(ctx, "← 전극", x0 + 250, 300, { s: 10.5, c: v("--mist"), a: "center" });
      }
      $("b-test-info").innerHTML = tool ? "<b>" + S.name + "</b> · " + res.txt + "<br>" + S.note : "물질과 검사 도구를 하나씩 고르세요.";
    }
    function mission() {
      var n = 0, k; for (k in SUB) if (tested[k]) n++;
      $("b-m2n").textContent = n;
      if (n >= 6) done("b-m2a");
      if (sorted) done("b-m2b");
      if (n >= 6 && sorted) {
        window.sthMission("b-m2", true, "<span class='m-tag'>미션 완료</span>에탄올은 OH가 있어도 염기가 아니었고, 암모니아는 OH가 없어도 염기였습니다. 기준은 화학식이 아니라 <b>물에 녹아 내놓는 이온</b>(산은 H⁺, 염기는 OH⁻)입니다.");
        ep.clear(1);
      }
    }
    function mark() { if (tool && !tested[sub]) { tested[sub] = 1; window.sthState("tested", tested); } draw(); mission(); }
    canvas._redraw = draw;
    seg("b-sub-seg", function (k) { sub = k; mark(); });
    seg("b-tool-seg", function (k) { tool = k; mark(); });
    window.sthSort({
      mount: "b-sort",
      buckets: [{ id: "acid", label: "산", sub: "물에 녹아 H⁺을 내놓는다" }, { id: "base", label: "염기", sub: "물에 녹아 OH⁻을 내놓는다" }, { id: "none", label: "어느 쪽도 아님", sub: "이온을 내놓지 않는다" }],
      items: [
        { t: "묽은 염산 HCl", a: "acid", why: "H⁺을 내놓는 산입니다." },
        { t: "식초 CH₃COOH", a: "acid", why: "약하지만 H⁺을 내놓는 산입니다.", hint: "BTB 용액의 색을 확인해 보세요." },
        { t: "수산화 나트륨 NaOH", a: "base", why: "OH⁻을 내놓는 염기입니다." },
        { t: "석회수 Ca(OH)₂", a: "base", why: "OH⁻을 내놓는 염기입니다." },
        { t: "암모니아수 NH₃", a: "base", why: "화학식에 OH가 없지만 물과 반응해 OH⁻을 만듭니다.", hint: "화학식 말고 검사 결과를 보세요. 페놀프탈레인의 색은?" },
        { t: "에탄올 C₂H₅OH", a: "none", why: "OH가 있어도 이온화하지 않습니다. 지시약의 색이 변하지 않고 전류도 흐르지 않았습니다.", hint: "화학식 말고 검사 결과를 보세요. 전류가 흘렀나요?" }
      ],
      onDone: function () { sorted = true; window.sthState("testSorted", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("b-m2", true);
  })();

  /* 장면 3 — 이온 모형과 중화열
     1.0 M HCl 20 mL (H⁺ 8개로 표현) + 1.25 M NaOH v mL (2 mL마다 OH⁻ 1개) → 중화점 16 mL */
  function neutT(vol) { return 20 + 56000 * Math.min(0.02, 0.00125 * vol) / (4.2 * (20 + vol)); }
  (function () {
    var canvas = $("b-ion"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var vol = 0, seen = window.sthState("ionSeen") || [], st = window.sthState("ion") || { a: false, q: false };
    var PERM = []; (function () { for (var i = 0; i < 40; i++) PERM.push((i * 17 + 5) % 40); })();
    function slot(k) { var s = PERM[k]; return { x: 62 + (s % 8) * 45 + (Math.floor(s / 8) % 2) * 8, y: 140 + Math.floor(s / 8) * 50 }; }

    function draw() {
      paper(ctx, W, H);
      var n = vol / 2, hLeft = Math.max(0, 8 - n), ohLeft = Math.max(0, n - 8), water = Math.min(8, n), i, p;
      var col = hLeft > 0 ? "--amber" : (ohLeft > 0 ? "--brand" : "--green");
      ctx.fillStyle = v(col); ctx.globalAlpha = .22; ctx.fillRect(30, 105, 380, 265); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(30, 70); ctx.lineTo(30, 370); ctx.lineTo(410, 370); ctx.lineTo(410, 70); ctx.stroke();
      text(ctx, "BTB 색: " + (hLeft > 0 ? "노란색(산성)" : (ohLeft > 0 ? "파란색(염기성)" : "초록색(중성)")), 30, 30, { s: 13, w: "900", c: v(col + "-700") });
      text(ctx, "H⁺ " + hLeft + " · OH⁻ " + ohLeft + " · Na⁺ " + n + " · Cl⁻ 8 · 새로 생긴 물 " + water, 30, 54, { s: 12, w: "800" });
      for (i = 0; i < 8; i++) { p = slot(i); pill(ctx, p.x, p.y, "Cl⁻", v("--mist")); }
      for (i = 0; i < 8; i++) { p = slot(8 + i); if (i < n) pill(ctx, p.x, p.y, "H₂O", v("--teal")); else pill(ctx, p.x, p.y, "H⁺", v("--coral")); }
      for (i = 0; i < n; i++) { p = slot(16 + i); pill(ctx, p.x, p.y, "Na⁺", v("--violet")); }
      for (i = 0; i < ohLeft; i++) { p = slot(32 + i); pill(ctx, p.x, p.y, "OH⁻", v("--brand")); }

      /* 온도 그래프 — 기록한 지점만 찍힌다 */
      var x0 = 490, x1 = 860, y0 = 60, y1 = 340;
      function gx(a) { return x0 + a / 32 * (x1 - x0); } function gy(T) { return y1 - (T - 18) / 12 * (y1 - y0); }
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      text(ctx, "혼합 용액의 온도(℃)", x0, 40, { s: 12.5, w: "800" });
      for (i = 20; i <= 28; i += 2) { text(ctx, String(i), x0 - 8, gy(i) + 4, { s: 10.5, a: "right", c: v("--mist") }); ctx.globalAlpha = .4; ctx.beginPath(); ctx.moveTo(x0, gy(i)); ctx.lineTo(x1, gy(i)); ctx.stroke(); ctx.globalAlpha = 1; }
      for (i = 0; i <= 32; i += 8) text(ctx, String(i), gx(i), y1 + 18, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "넣은 NaOH 수용액(mL)", (x0 + x1) / 2, y1 + 38, { s: 11, a: "center", c: v("--mist") });
      var pts = seen.slice().sort(function (a, b) { return a - b; });
      ctx.strokeStyle = v("--coral"); ctx.lineWidth = 2.5; ctx.beginPath();
      pts.forEach(function (a, k) { if (k === 0) ctx.moveTo(gx(a), gy(neutT(a))); else ctx.lineTo(gx(a), gy(neutT(a))); });
      ctx.stroke();
      pts.forEach(function (a) { dot(ctx, gx(a), gy(neutT(a)), 4.5, v("--coral")); });
      dot(ctx, gx(vol), gy(neutT(vol)), 7, v("--ink"));
      text(ctx, neutT(vol).toFixed(1) + "℃", clamp(gx(vol), x0 + 24, x1 - 24), gy(neutT(vol)) - 14, { s: 13, w: "900", a: "center" });

      var total = hLeft + ohLeft + n + 8;
      $("b-ion-info").innerHTML = "NaOH 수용액 <b>" + vol + " mL</b> (OH⁻ " + n + "개) → H⁺ " + Math.min(8, n) + "개와 만나 물 " + water + "개 생성, 온도 <b>" + neutT(vol).toFixed(1) + "℃</b>, 전체 이온 수 " + total + "개. " +
        (hLeft > 0 ? "아직 H⁺이 " + hLeft + "개 남아 <b>산성</b>입니다. Na⁺은 반응에 끼지 않고 그대로 남는 구경꾼 이온입니다." :
          (ohLeft > 0 ? "H⁺이 모두 없어져 더는 물이 생기지 않습니다. 남는 OH⁻ " + ohLeft + "개 때문에 <b>염기성</b>입니다. 열은 더 나오지 않는데 20℃의 용액만 늘어나 온도가 내려갑니다." :
            "H⁺ 8개와 OH⁻ 8개가 <b>1:1로 모두 반응</b>했습니다. 여기가 <b>중화점</b>입니다. 남은 것은 Na⁺과 Cl⁻뿐입니다."));
    }
    function mission() {
      $("b-m3n").textContent = Math.min(7, seen.length);
      var both = seen.some(function (a) { return a < 16; }) && seen.some(function (a) { return a > 16; });
      if (st.a) done("b-m3a");
      if (seen.length >= 7 && both) done("b-m3b");
      if (st.q) done("b-m3c");
      if (st.a && seen.length >= 7 && both && st.q) {
        window.sthMission("b-m3", true, "<span class='m-tag'>미션 완료</span>중화점은 <b>16 mL</b>. H⁺과 OH⁻이 1:1로 만나 물이 되고, 반응한 수가 가장 많은 중화점에서 온도가 가장 높습니다(약 27.4℃).");
        ep.clear(2);
      }
    }
    function visit() {
      var ch = false;
      if (seen.indexOf(vol) < 0) { seen.push(vol); window.sthState("ionSeen", seen); ch = true; }
      if (vol === 16 && !st.a) { st.a = true; window.sthState("ion", st); ch = true; }
      if (ch) mission();
    }
    canvas._redraw = draw;
    $("b-v").addEventListener("input", function (e) { vol = +e.target.value; $("b-v-val").textContent = vol + " mL"; visit(); draw(); });
    window.sthPick({
      mount: "b-q3",
      q: "그래프에서 온도가 가장 높은 곳은 어디이고, 그 까닭은 무엇일까요?",
      options: ["염기를 가장 많이 넣은 32 mL — 염기를 많이 넣을수록 열이 많이 나므로", "중화점인 16 mL — 반응한 H⁺과 OH⁻의 수가 가장 많으므로", "아무것도 넣지 않은 0 mL — 산이 가장 진하므로", "어디서나 같다 — 중화 반응은 온도를 바꾸지 않으므로"],
      answer: 1,
      why: ["16 mL를 넘으면 반응할 H⁺이 없어 열이 더 나오지 않습니다. 그래프의 오른쪽을 다시 보세요.", "중화열은 H⁺과 OH⁻이 만나 물이 될 때 나옵니다. 중화점 뒤로는 더 반응할 H⁺이 없고 식은 용액만 더해집니다.", "산만 있을 때는 반응이 일어나지 않아 20℃ 그대로입니다.", "온도계는 20℃에서 27℃ 넘게 올라갔습니다. 중화 반응은 열을 내놓습니다."],
      onDone: function () { st.q = true; window.sthState("ion", st); mission(); }
    });
    visit(); draw(); mission();
    if (ep.cleared(2)) window.sthMission("b-m3", true);
  })();

  /* 장면 4 — 시험 수조 : pH 4.0 호수 물 1,000 L (H⁺ 0.1 mol) + Ca(OH)₂ m g (74 g/mol, OH⁻ 2개) */
  function lakePH(m) {
    var c = (0.1 - 2 * m / 74) / 1000, h = (c + Math.sqrt(c * c + 4e-14)) / 2;
    return -Math.log(h) / Math.LN10;
  }
  (function () {
    var canvas = $("b-lake"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var m = 0, tries = window.sthState("lakeTries") || [], st = window.sthState("lake") || { a: false, q: false };

    function draw() {
      paper(ctx, W, H);
      var x0 = 70, x1 = 540, y0 = 40, y1 = 340, pH = lakePH(m), i;
      function gx(a) { return x0 + a / 8 * (x1 - x0); } function gy(p) { return y1 - p / 14 * (y1 - y0); }
      ctx.fillStyle = v("--green"); ctx.globalAlpha = .18; ctx.fillRect(x0, gy(8.5), x1 - x0, gy(6.5) - gy(8.5)); ctx.globalAlpha = 1;
      text(ctx, "물고기가 사는 범위 pH 6.5~8.5", x1 - 6, gy(8.5) - 6, { s: 10.5, w: "800", a: "right", c: v("--green-700") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (i = 0; i <= 14; i += 2) text(ctx, String(i), x0 - 8, gy(i) + 4, { s: 10.5, a: "right", c: v("--mist") });
      for (i = 0; i <= 8; i += 1) text(ctx, String(i), gx(i), y1 + 18, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "pH", 24, y0 + 8, { s: 12, w: "800" });
      text(ctx, "넣은 소석회 Ca(OH)₂ (g) — 지나온 구간만 그려집니다", (x0 + x1) / 2, y1 + 40, { s: 11, a: "center", c: v("--mist") });
      ctx.strokeStyle = v("--teal"); ctx.lineWidth = 3; ctx.beginPath();
      for (var a = 0; a <= m + 1e-9; a += 0.02) { if (a === 0) ctx.moveTo(gx(a), gy(lakePH(a))); else ctx.lineTo(gx(a), gy(lakePH(a))); }
      ctx.lineTo(gx(m), gy(pH)); ctx.stroke();
      dot(ctx, gx(m), gy(pH), 7, v("--coral"));
      /* 수조 */
      var ok = pH >= 6.5 && pH <= 8.5, tx = 600, tw = 270, ty = 110, th = 220;
      ctx.fillStyle = v(ok ? "--brand" : (pH < 6.5 ? "--amber" : "--violet")); ctx.globalAlpha = .25; ctx.fillRect(tx, ty + 30, tw, th - 30); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx, ty + th); ctx.lineTo(tx + tw, ty + th); ctx.lineTo(tx + tw, ty); ctx.stroke();
      text(ctx, "시험 수조 1,000 L", tx, 60, { s: 12.5, w: "800" });
      text(ctx, "pH " + pH.toFixed(2), tx + tw, 62, { s: 20, w: "900", a: "right", c: ok ? v("--green-700") : v("--rose-700") });
      text(ctx, pH < 6.5 ? "산성" : (pH > 8.5 ? "염기성이 너무 강함" : (pH > 7.5 ? "약한 염기성" : "거의 중성")), tx + tw, 88, { s: 12, w: "800", a: "right", c: v("--mist") });
      var fish = ok ? 5 : ((pH >= 5.5 && pH <= 9.2) ? 1 : 0);
      for (i = 0; i < fish; i++) text(ctx, "🐟", tx + 30 + (i * 97) % 200, ty + 80 + (i * 53) % 120, { s: 26 });
      if (!fish) text(ctx, "물고기가 살 수 없습니다", tx + tw / 2, ty + 130, { s: 12, w: "800", a: "center", c: v("--mist") });
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "소석회 " + t.m.toFixed(1) + " g → pH " + t.p.toFixed(2) + " " + (t.ok ? "✅ 물고기가 자리를 잡았습니다" : (t.p < 6.5 ? "❌ 아직 산성입니다" : "❌ 염기성이 너무 강합니다")); });
      $("b-lake-info").innerHTML = rows.length ? "<b>작전 기록</b><br>" + rows.join("<br>") : "소석회 양을 정하고 확정하세요. 여러 번 시도할 수 있습니다.";
    }
    function mission() {
      if (st.a) done("b-m4a"); if (st.q) done("b-m4b");
      if (st.a && st.q) {
        window.sthMission("b-m4", true, "<span class='m-tag'>미션 완료</span>수조 1,000 L에 소석회 약 <b>3.7 g</b>, 호수 전체에는 약 <b>7.4 t</b>. 중화점 근처에서는 0.1 g 차이로도 pH가 크게 달라졌습니다. H⁺의 수와 OH⁻의 수를 <b>맞추는 것</b>이 중화 작전의 핵심입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("b-m").addEventListener("input", function (e) { m = +e.target.value; $("b-m-val").textContent = m.toFixed(1) + " g"; draw(); });
    $("b-go").addEventListener("click", function () {
      var p = lakePH(m), ok = p >= 6.5 && p <= 8.5;
      tries.push({ m: m, p: p, ok: ok }); window.sthState("lakeTries", tries.slice(-8));
      if (ok) { st.a = true; window.sthState("lake", st); window.sthState("lakeBest", "소석회 " + m.toFixed(1) + " g → pH " + p.toFixed(1)); }
      report(); mission();
    });
    window.sthPick({
      mount: "b-q4",
      q: "수조의 물 1,000 L(= 1 m³)를 정확히 중화하는 데 소석회 3.7 g이 필요했습니다. 호수 전체의 물이 약 200만 m³라면 소석회는 모두 얼마나 필요할까요?",
      options: ["약 0.74 t", "약 7.4 t", "약 74 t", "약 740 t"],
      answer: 1,
      why: ["3.7 g × 2,000,000을 다시 계산해 보세요.", "3.7 g × 2,000,000 = 7,400,000 g = 7.4 t. 없애야 할 H⁺의 수가 물의 양에 비례하므로 필요한 OH⁻의 수도 비례합니다.", "자릿수를 다시 확인하세요. 1 t은 1,000,000 g입니다.", "자릿수를 다시 확인하세요. 1 t은 1,000,000 g입니다."],
      onDone: function () { st.q = true; window.sthState("lake", st); mission(); }
    });
    draw(); report(); mission();
    if (ep.cleared(3)) window.sthMission("b-m4", true);
  })();

  /* 장면 5 — 생활 속 중화 + 결말 */
  function reveal() {
    $("b-end").hidden = false;
    var p = window.sthState("acidbase") || "";
    $("b-vs").innerHTML = "<b>나의 첫 판단</b> " + (p || "기록 없음") + (p.indexOf("㉡") === 0 ? " — 정확했습니다. 검사대가 그 증거입니다." : " — 검사대에서 확인했듯 에탄올은 OH⁻을 내놓지 않으므로 염기가 아닙니다.") +
      "<br><b>나의 중화 작전</b> " + (window.sthState("lakeBest") || "-") + " (수조 1,000 L 기준)";
  }
  function finish() { window.sthState("r2", "해결 · 에탄올은 염기가 아님 · 중화점 16 mL에서 최고 27.4℃ · " + (window.sthState("lakeBest") || "-")); }
  window.sthSort({
    mount: "b-life",
    buckets: [{ id: "b", label: "염기성 물질을 쓴다", sub: "문제의 원인이 산성" }, { id: "a", label: "산성 물질을 쓴다", sub: "문제의 원인이 염기성" }],
    items: [
      { t: "위산(염산)이 너무 많이 나와 속이 쓰리다", a: "b", why: "수산화 마그네슘 같은 약한 염기가 든 제산제를 먹습니다." },
      { t: "생선을 손질한 도마에서 비린내가 난다", a: "a", why: "비린내의 원인 물질은 염기성입니다. 레몬즙이나 식초(산)로 중화합니다.", hint: "생선회에 레몬즙을 뿌리는 까닭을 떠올려 보세요." },
      { t: "산성화된 밭에서 작물이 잘 자라지 않는다", a: "b", why: "호수와 마찬가지로 석회 가루(염기성)를 뿌립니다." },
      { t: "벌레에 물린 자리가 산성 물질 때문에 따갑다", a: "b", why: "묽은 암모니아수가 든 약(염기성)을 바릅니다." },
      { t: "식사 뒤 입속 세균이 만든 산이 치아를 상하게 한다", a: "b", why: "치약에는 약한 염기성 물질이 들어 있습니다." },
      { t: "염기성인 비누로 감은 머리카락이 뻣뻣하다", a: "a", why: "식초나 구연산을 탄 물(산성)로 헹굽니다.", hint: "문제를 일으킨 비누가 염기성입니다." },
      { t: "공장 굴뚝에서 산성 기체인 이산화 황이 나온다", a: "b", why: "산화 칼슘 같은 염기성 물질로 걸러 냅니다. 산성비를 줄이는 방법이기도 합니다." },
      { t: "김치가 너무 시어졌다", a: "b", why: "신맛은 산 때문입니다. 탄산수소 나트륨(소다)을 조금 넣으면 신맛이 줄어듭니다." }
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "b-wk", unitLabel: "[통합과학2 Ⅰ-2] 이야기 ② 물고기가 사라진 호수",
    items: [
      { id: "w2", label: "산과 염기를 가르는 진짜 기준", hint: "에탄올이 왜 염기가 아닌지, 오개념 상자와 검사대의 결과(지시약, 전류)를 근거로 쓰세요. 암모니아의 경우도 함께 쓰면 더 좋습니다." },
      { id: "b2", label: "중화점에서 온도가 가장 높은 까닭", hint: "이온 모형에서 센 H⁺, OH⁻, 물 분자의 수를 근거로 설명하고, 내가 아는 생활 속 중화 반응의 예를 하나 덧붙이세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 불 없이 따뜻하게, 얼음 없이 차갑게
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "c-gate", key: "p3", title: "설계자의 첫 추리",
    question: "냉찜질 팩이 차가워질 때, 팩 속에서는 무슨 일이 일어나고 있을까요?",
    options: ["㉠ 팩 속 물질이 ‘냉기’를 만들어 밖으로 내보낸다", "㉡ 팩 속에서 일어나는 변화가 주변의 열을 흡수한다", "㉢ 팩 속의 에너지가 사라져 없어진다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 에너지 장부 */
  (function () {
    var canvas = $("c-energy"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var RX = {
      ch4: { name: "메테인의 연소", eq: "CH₄ + 2O₂ → CO₂ + 2H₂O", dH: -890, per: "메테인 1몰이 탈 때", gap: 150 },
      fe:  { name: "철 가루의 산화", eq: "4Fe + 3O₂ → 2Fe₂O₃", dH: -824, per: "산화 철(Ⅲ) 1몰이 생길 때", gap: 140 },
      an:  { name: "질산 암모늄의 용해", eq: "NH₄NO₃(고체) → NH₄⁺ + NO₃⁻ (수용액)", dH: 26, per: "질산 암모늄 1몰이 녹을 때", gap: -70 }
    };
    var type = "ch4", prog = 0, st = window.sthState("energy") || { a: false, b: false, q: false };

    function draw() {
      paper(ctx, W, H);
      var R = RX[type], exo = R.dH < 0, p = prog / 100, x0 = 70, x1 = 520, y0 = 50, y1 = 320;
      var mid = 185, ry = mid - R.gap / 2, py = mid + R.gap / 2, col = exo ? "--coral" : "--brand";
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      text(ctx, "물질이 가진 에너지", x0 - 40, y0 - 14, { s: 11.5, c: v("--mist") });
      text(ctx, "반응의 진행 →", x1, y1 + 22, { s: 11.5, c: v("--mist"), a: "right" });
      text(ctx, R.eq, (x0 + x1) / 2 + 10, y1 + 34, { s: 11, a: "center", c: v("--mist") });
      ctx.strokeStyle = v("--ink"); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(100, ry); ctx.lineTo(250, ry); ctx.moveTo(350, py); ctx.lineTo(500, py); ctx.stroke();
      text(ctx, "반응물", 175, ry - 12, { s: 13, w: "800", a: "center" }); text(ctx, "생성물", 425, py - 12, { s: 13, w: "800", a: "center" });
      ctx.strokeStyle = v(col); ctx.lineWidth = 2.5; ctx.setLineDash([6, 5]); ctx.beginPath();
      for (var i = 0; i <= 40; i++) { var xx = 250 + i * 2.5, yy = lerp(ry, py, (1 - Math.cos(Math.PI * i / 40)) / 2); if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); }
      ctx.stroke(); ctx.setLineDash([]);
      var bx = lerp(175, 425, p), t = clamp((bx - 250) / 100, 0, 1), byy = lerp(ry, py, (1 - Math.cos(Math.PI * t)) / 2);
      dot(ctx, bx, byy - 9, 9, v(col));
      /* 에너지 차이 */
      ctx.strokeStyle = v(col); ctx.fillStyle = v(col); ctx.lineWidth = 2.5; window.drawArrow(ctx, 300, ry, 300, py + (exo ? -2 : 2), 9);
      text(ctx, (exo ? "방출 " : "흡수 ") + Math.abs(R.dH) + " kJ", 292, mid + 4, { s: 11.5, w: "800", a: "right", c: v(col + "-700") });
      /* 주변 */
      var sx = 600, tw = 260;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(sx, 60, tw, 250, 18); ctx.fill();
      text(ctx, "주변 (공기, 손, 물 …)", sx + tw / 2, 86, { s: 12, w: "800", a: "center" });
      var level = 0.5 + (exo ? 0.38 : -0.32) * p, tx = sx + tw / 2, ta = 110, tb = 270;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(tx, ta); ctx.lineTo(tx, tb); ctx.stroke();
      ctx.strokeStyle = v(col); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(tx, tb); ctx.lineTo(tx, tb - level * (tb - ta)); ctx.stroke(); ctx.lineCap = "butt";
      dot(ctx, tx, tb + 12, 14, v(col));
      text(ctx, "주변 온도 " + (p === 0 ? "그대로" : (exo ? "상승 ↑" : "하강 ↓")), tx, 302, { s: 11.5, w: "800", a: "center", c: v(col + "-700") });
      if (p > 0) {
        ctx.strokeStyle = v(col); ctx.fillStyle = v(col); ctx.lineWidth = 2 + 7 * p;
        if (exo) window.drawArrow(ctx, 530, 185, 592, 185, 12 + 5 * p); else window.drawArrow(ctx, 592, 185, 530, 185, 12 + 5 * p);
        text(ctx, exo ? "열 방출" : "열 흡수", 561, 160, { s: 11.5, w: "800", a: "center", c: v(col + "-700") });
      }
      $("c-energy-info").innerHTML = "<b>" + R.name + "</b> (" + R.per + " " + Math.abs(R.dH) + " kJ " + (exo ? "방출" : "흡수") + ") · 진행률 " + prog + "% → 지금까지 <b>" + (Math.abs(R.dH) * p).toFixed(exo ? 0 : 1) + " kJ</b>을 " +
        (exo ? "주변으로 <b>방출</b>했습니다. 생성물의 에너지가 반응물보다 낮아, 그 차이만큼이 열로 나와 주변 온도가 올라갑니다 — <b>발열 반응</b>." :
          "주변에서 <b>흡수</b>했습니다. 생성물의 에너지가 반응물보다 높아, 모자라는 만큼을 주변에서 가져와 주변 온도가 내려갑니다 — <b>흡열 반응</b>.");
      var ch = false;
      if (prog === 100 && exo && !st.a) { st.a = ch = true; }
      if (prog === 100 && !exo && !st.b) { st.b = ch = true; }
      if (ch) { window.sthState("energy", st); mission(); }
    }
    function mission() {
      if (st.a) done("c-m2a"); if (st.b) done("c-m2b"); if (st.q) done("c-m2c");
      if (st.a && st.b && st.q) {
        window.sthMission("c-m2", true, "<span class='m-tag'>미션 완료</span>에너지를 방출해 주변 온도를 높이면 <b>발열 반응</b>, 흡수해 주변 온도를 낮추면 <b>흡열 반응</b>입니다. 드나드는 에너지의 크기는 반응물과 생성물의 에너지 차이입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    seg("c-type-seg", function (k) { type = k; prog = 0; $("c-p").value = 0; $("c-p-val").textContent = "0"; draw(); });
    $("c-p").addEventListener("input", function (e) { prog = +e.target.value; $("c-p-val").textContent = prog; draw(); });
    window.sthPick({
      mount: "c-q2",
      q: "손난로처럼 주변 온도를 높이는 반응에서, 반응물과 생성물이 가진 에너지를 비교하면?",
      options: ["반응물의 에너지가 더 크다 — 그 차이만큼 주변으로 방출된다", "생성물의 에너지가 더 크다 — 그 차이만큼 주변으로 방출된다", "둘이 같다 — 열은 반응과 상관없이 생긴다", "반응물의 에너지가 더 크다 — 그 차이만큼 에너지가 사라진다"],
      answer: 0,
      why: ["높은 곳에서 낮은 곳으로 내려온 만큼의 에너지가 주변으로 나옵니다.", "생성물의 에너지가 더 크려면 에너지를 어디선가 받아 와야 합니다. 그것은 흡열 반응입니다.", "에너지 장부를 다시 보세요. 방출된 열은 두 높이의 차이와 같습니다.", "에너지는 사라지지 않습니다. 주변으로 옮겨 갔을 뿐입니다."],
      onDone: function () { st.q = true; window.sthState("energy", st); mission(); }
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("c-m2", true);
  })();

  /* 장면 3 — 손난로 : 철 1 g 산화에 7.38 kJ 방출(4Fe + 3O₂ → 2Fe₂O₃, 1648 kJ / 223.4 g)
     C dT/dt = P − k(T − 10℃) , P = r × 7.38 kJ/h (철이 남아 있는 동안) */
  function warm(m, lv) {
    var r = 0.5 * lv, k = 0.5, C = 0.15, Te = 10, T = Te, dt = 0.01, left = m, mx = T, h50 = 0, pts = [];
    for (var i = 0; i <= 1400; i++) {
      if (i % 10 === 0) pts.push(T);
      T += ((left > 0 ? r * 7.38 : 0) - k * (T - Te)) / C * dt;
      left = Math.max(0, left - r * dt); mx = Math.max(mx, T); if (T >= 50) h50 += dt;
    }
    return { mx: mx, h50: h50, pts: pts, life: m / r };
  }
  (function () {
    var canvas = $("c-warm"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var m = 10, lv = 2;
    function draw() {
      paper(ctx, W, H);
      var s = warm(m, lv), ok = s.mx <= 60 && s.h50 >= 8 && m <= 30, x0 = 70, x1 = 860, y0 = 60, y1 = 320, i;
      function gx(h) { return x0 + h / 14 * (x1 - x0); } function gy(T) { return y1 - T / 90 * (y1 - y0); }
      ctx.fillStyle = v("--green"); ctx.globalAlpha = .18; ctx.fillRect(x0, gy(60), x1 - x0, gy(50) - gy(60)); ctx.globalAlpha = 1;
      text(ctx, "알맞은 온도 50~60℃", x1 - 6, gy(60) - 6, { s: 10.5, w: "800", a: "right", c: v("--green-700") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (i = 0; i <= 80; i += 20) text(ctx, i + "℃", x0 - 8, gy(i) + 4, { s: 10.5, a: "right", c: v("--mist") });
      for (i = 0; i <= 14; i += 2) text(ctx, i + "시간", gx(i), y1 + 18, { s: 10.5, a: "center", c: v("--mist") });
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0, gy(10)); ctx.lineTo(x1, gy(10)); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "주변 10℃", x0 + 6, gy(10) + 16, { s: 10.5, c: v("--mist") });
      ctx.strokeStyle = v(ok ? "--green" : "--coral"); ctx.lineWidth = 3; ctx.beginPath();
      s.pts.forEach(function (T, k) { var xx = gx(k * 0.1), yy = gy(T); if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy); });
      ctx.stroke();
      var ex = gx(Math.min(14, s.life));
      ctx.strokeStyle = v("--amber"); ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(ex, y0); ctx.lineTo(ex, y1); ctx.stroke(); ctx.setLineDash([]);
      text(ctx, "철 가루 소진", clamp(ex, x0 + 40, x1 - 40), y0 - 6, { s: 10.5, w: "800", a: "center", c: v("--amber-700") });
      text(ctx, "최고 " + s.mx.toFixed(1) + "℃ · 50℃ 이상 " + s.h50.toFixed(1) + "시간 · 방출한 열 모두 " + Math.round(m * 7.38) + " kJ", x0, 30, { s: 13.5, w: "900", c: ok ? v("--green-700") : v("--ink") });

      $("c-warm-info").innerHTML = "철 가루 <b>" + m + " g</b>, 공기 구멍 <b>" + lv + "단계</b>(1시간에 철 " + (0.5 * lv).toFixed(1) + " g 산화) → 최고 <b>" + s.mx.toFixed(1) + "℃</b>, 50℃ 이상 <b>" + s.h50.toFixed(1) + "시간</b>. " +
        (s.mx > 60 ? "🔥 너무 뜨겁습니다. 산소가 빨리 들어와 열이 한꺼번에 나옵니다. 저온 화상 위험!" :
          (s.mx < 50 ? "미지근합니다. 1시간에 나오는 열이 주변으로 빠져나가는 열을 이기지 못합니다." :
            (s.h50 < 8 ? "온도는 알맞지만 철 가루가 일찍 떨어집니다." : (m > 30 ? "성능은 좋지만 철 가루가 30 g을 넘습니다." : "✅ 온도도 지속 시간도 알맞습니다.")))) +
        " <b>온도</b>는 열이 나오는 <b>빠르기</b>(구멍)가, <b>지속 시간</b>은 철 가루의 <b>양</b>이 정합니다.";
      if (ok) {
        window.sthState("warmBest", "철 " + m + " g·구멍 " + lv + "단계 → " + s.mx.toFixed(0) + "℃ " + s.h50.toFixed(1) + "시간");
        window.sthMission("c-m3", true, "<span class='m-tag'>미션 완료</span>철 가루 " + m + " g, 공기 구멍 " + lv + "단계 → 최고 " + s.mx.toFixed(1) + "℃, 50℃ 이상 " + s.h50.toFixed(1) + "시간. 같은 양의 철이 내놓는 열의 총량은 같지만, <b>반응의 빠르기</b>를 조절해 뜨겁지 않게 오래 쓰는 것입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-fe").addEventListener("input", function (e) { m = +e.target.value; $("c-fe-val").textContent = m + " g"; draw(); });
    $("c-air").addEventListener("input", function (e) { lv = +e.target.value; $("c-air-val").textContent = lv + "단계"; draw(); });
    draw();
    if (ep.cleared(2)) window.sthMission("c-m3", true);
  })();

  /* 장면 4 — 냉찜질 팩 : NH₄NO₃ 용해열 +25.7 kJ/mol (80.04 g/mol), 용액의 비열 4.18 J/(g·℃) */
  function cold(w, a) { return 20 - (a / 80.04) * 25700 / ((w + a) * 4.18); }
  (function () {
    var canvas = $("c-cold"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var w = 100, a = 5, st = window.sthState("cold") || { a: false, q: false };
    function draw() {
      paper(ctx, W, H);
      var Tf = cold(w, a), ok = Tf >= 2 && Tf <= 6 && w + a <= 150, q = (a / 80.04) * 25.7, i;
      /* 팩 */
      var pw = lerp(200, 320, (w + a - 50) / 210), ph = 150, px = 210 - pw / 2, py = 120;
      ctx.fillStyle = v("--card-2"); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 26); ctx.fill();
      ctx.fillStyle = v("--brand"); ctx.globalAlpha = clamp((20 - Tf) / 40, 0, .6); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 26); ctx.fill(); ctx.globalAlpha = 1;
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 26); ctx.stroke();
      text(ctx, "냉찜질 팩  " + (w + a) + " g", 210, 60, { s: 12.5, w: "800", a: "center", c: w + a > 150 ? v("--rose-700") : v("--ink") });
      text(ctx, Tf.toFixed(1) + "℃", 210, py + ph / 2 + 12, { s: 30, w: "900", a: "center", c: ok ? v("--green-700") : v("--ink") });
      text(ctx, "NH₄⁺ · NO₃⁻ 이 물속으로 퍼짐", 210, py + ph - 16, { s: 10.5, a: "center", c: v("--mist") });
      if (a > 0) {
        ctx.strokeStyle = v("--coral"); ctx.fillStyle = v("--coral"); ctx.lineWidth = 2 + Math.min(6, q / 3);
        window.drawArrow(ctx, 210, 78, 210, py - 4, 11); window.drawArrow(ctx, 210, 322, 210, py + ph + 4, 11);
        window.drawArrow(ctx, 20, py + ph / 2, px - 4, py + ph / 2, 11); window.drawArrow(ctx, 400, py + ph / 2, px + pw + 4, py + ph / 2, 11);
        text(ctx, "주변의 열 " + q.toFixed(1) + " kJ 흡수", 210, 336, { s: 11.5, w: "800", a: "center", c: v("--coral-700") });
      }
      /* 온도 그래프 */
      var x0 = 500, x1 = 860, y0 = 50, y1 = 290;
      function gx(t) { return x0 + t / 120 * (x1 - x0); } function gy(T) { return y1 - (clamp(T, -25, 25) + 25) / 50 * (y1 - y0); }
      ctx.fillStyle = v("--green"); ctx.globalAlpha = .2; ctx.fillRect(x0, gy(6), x1 - x0, gy(2) - gy(6)); ctx.globalAlpha = 1;
      text(ctx, "알맞은 온도 2~6℃", x1 - 6, gy(6) - 6, { s: 10.5, w: "800", a: "right", c: v("--green-700") });
      ctx.strokeStyle = v("--line"); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (i = -20; i <= 20; i += 10) text(ctx, i + "℃", x0 - 8, gy(i) + 4, { s: 10.5, a: "right", c: v("--mist") });
      for (i = 0; i <= 120; i += 30) text(ctx, i + "초", gx(i), y1 + 18, { s: 10.5, a: "center", c: v("--mist") });
      text(ctx, "팩을 누른 뒤 온도 변화", x0, 30, { s: 12.5, w: "800" });
      ctx.strokeStyle = v("--mist"); ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0, gy(0)); ctx.lineTo(x1, gy(0)); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = v(ok ? "--green" : "--brand"); ctx.lineWidth = 3; ctx.beginPath();
      for (i = 0; i <= 120; i += 2) { var T = Tf + (20 - Tf) * Math.exp(-i / 18); if (i === 0) ctx.moveTo(gx(i), gy(T)); else ctx.lineTo(gx(i), gy(T)); }
      ctx.stroke();

      $("c-cold-info").innerHTML = "물 <b>" + w + " g</b> + 질산 암모늄 <b>" + a + " g</b> → 녹으면서 열 <b>" + q.toFixed(1) + " kJ</b>을 물에서 빼앗아 <b>" + Tf.toFixed(1) + "℃</b>. " +
        (w + a > 150 ? "⚠️ 전체 무게가 150 g을 넘습니다. " : "") +
        (Tf > 6 ? "아직 미지근합니다. 흡수하는 열이 모자랍니다." : (Tf < 2 ? (Tf < 0 ? "❄️ 영하입니다. 피부에 바로 대면 상할 수 있습니다. 너무 많이 넣었습니다." : "조금 지나치게 차갑습니다.") : "알맞은 온도입니다.")) +
        " 같은 양의 질산 암모늄이라도 <b>물이 적을수록</b> 온도가 더 많이 내려갑니다.";
      if (ok && !st.a) { st.a = true; window.sthState("cold", st); }
      if (ok) window.sthState("coldBest", "물 " + w + " g+질산 암모늄 " + a + " g → " + Tf.toFixed(1) + "℃");
      mission();
    }
    function mission() {
      if (st.a) done("c-m4a"); if (st.q) done("c-m4b");
      if (st.a && st.q) {
        window.sthMission("c-m4", true, "<span class='m-tag'>미션 완료</span>" + (window.sthState("coldBest") || "") + ". 질산 암모늄이 녹으며 <b>흡수한 열</b>만큼 물의 온도가 내려갑니다. 너무 적으면 미지근하고, 너무 많으면 영하로 떨어집니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    $("c-w").addEventListener("input", function (e) { w = +e.target.value; $("c-w-val").textContent = w + " g"; draw(); });
    $("c-an").addEventListener("input", function (e) { a = +e.target.value; $("c-an-val").textContent = a + " g"; draw(); });
    window.sthPick({
      mount: "c-q4",
      q: "완성한 냉찜질 팩을 삔 발목에 댔습니다. 발목이 시원해지는 동안 열은 어떻게 이동할까요?",
      options: ["팩의 ‘냉기’가 발목으로 들어간다", "발목의 열이 팩 쪽으로 이동하고, 팩 속의 흡열 과정이 그 열을 흡수한다", "열은 이동하지 않고 발목의 에너지가 그냥 없어진다", "팩이 열을 방출하고 발목이 그 열을 흡수한다"],
      answer: 1,
      why: ["‘냉기’라는 물질이나 에너지는 없습니다. 이동하는 것은 언제나 열입니다.", "열은 온도가 높은 발목에서 낮은 팩으로 이동합니다. 시원하다는 느낌은 열을 빼앗기고 있다는 뜻입니다.", "에너지는 사라지지 않습니다. 어디론가 옮겨 갑니다.", "그러면 발목이 더 뜨거워집니다. 그것은 손난로입니다."],
      onDone: function () { st.q = true; window.sthState("cold", st); mission(); }
    });
    draw();
    if (ep.cleared(3)) window.sthMission("c-m4", true);
  })();

  /* 장면 5 — 발열·흡열 판정 + 결말 */
  function reveal() {
    $("c-end").hidden = false;
    var p = window.sthState("p3") || "";
    $("c-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉡") === 0 ? " — 정확했습니다." : " — ‘냉기’가 나오는 것도, 에너지가 사라지는 것도 아닙니다. 주변의 열을 흡수하는 것입니다.") +
      "<br><b>나의 손난로</b> " + (window.sthState("warmBest") || "-") + "<br><b>나의 냉찜질 팩</b> " + (window.sthState("coldBest") || "-");
  }
  function finish() { window.sthState("r3", "해결 · 손난로 " + (window.sthState("warmBest") || "-") + " · 냉찜질 팩 " + (window.sthState("coldBest") || "-")); }
  window.sthSort({
    mount: "c-sort",
    buckets: [{ id: "exo", label: "🔥 발열 반응", sub: "에너지 방출 → 주변 온도 상승" }, { id: "endo", label: "❄️ 흡열 반응", sub: "에너지 흡수 → 주변 온도 하강" }],
    items: [
      { t: "손난로(철 가루)를 흔들면 따뜻해진다", a: "exo", why: "철의 산화는 발열 반응입니다." },
      { t: "물에 질산 암모늄을 녹이면 컵 표면에 물방울이 맺힐 만큼 차가워진다", a: "endo", why: "질산 암모늄의 용해는 주변의 열을 흡수합니다." },
      { t: "나무나 천연가스가 연소하면 주변이 뜨거워진다", a: "exo", why: "연소는 대표적인 발열 반응입니다." },
      { t: "탄산수소 나트륨과 구연산을 물에 녹이면 컵이 시원해진다", a: "endo", why: "주변의 열을 흡수하는 흡열 반응입니다.", hint: "컵이 시원해졌다면 열은 어느 쪽으로 갔을까요?" },
      { t: "묽은 염산에 마그네슘 리본을 넣으면 용액의 온도가 올라간다", a: "exo", why: "금속과 산의 반응은 발열 반응입니다." },
      { t: "얼음 위에 소금을 뿌리면 주변이 매우 차가워진다", a: "endo", why: "얼음이 녹고 소금이 녹으면서 주변의 열을 흡수합니다." },
      { t: "산과 염기를 섞으면 용액의 온도가 올라간다", a: "exo", why: "중화 반응은 발열 반응입니다. 이야기 ②의 온도 그래프를 떠올려 보세요." },
      { t: "식물이 빛에너지를 받아 광합성을 한다", a: "endo", why: "광합성은 빛에너지를 흡수해야 일어나는 흡열 반응입니다.", hint: "빛이 없으면 광합성이 일어나지 않습니다." },
      { t: "세포 호흡으로 체온을 유지한다", a: "exo", why: "포도당이 산화되며 에너지를 방출합니다." },
      { t: "발열 도시락의 끈을 당기면 산화 칼슘이 물과 만나 밥이 데워진다", a: "exo", why: "산화 칼슘과 물의 반응은 열을 많이 내놓습니다." }
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "c-wk", unitLabel: "[통합과학2 Ⅰ-2] 이야기 ③ 불 없이 따뜻하게, 얼음 없이 차갑게",
    items: [
      { id: "c1", label: "도윤이에게 건네는 사용 설명서", hint: "내가 설계한 손난로와 냉찜질 팩의 재료 양을 적고, 각각 따뜻해지는·차가워지는 까닭을 ‘에너지의 방출’과 ‘에너지의 흡수’라는 말을 넣어 설명하세요." },
      { id: "c2", label: "우리 생활 속 에너지 출입", hint: "발열 반응과 흡열 반응이 이용되는 예를 하나씩 더 찾아, 그 반응이 없다면 무엇이 불편할지 쓰세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학2 Ⅰ-2] 화학 변화 — 정리",
  recap: [
    { key: "r1", label: "① 붉은 돌에서 철을 꺼내라" },
    { key: "r2", label: "② 물고기가 사라진 호수" },
    { key: "r3", label: "③ 불 없이 따뜻하게, 얼음 없이 차갑게" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "산소와 전자, H⁺과 OH⁻, 열. 세 이야기에서 화학 변화가 일어날 때마다 무엇인가가 ‘옮겨 갔고’ 그 양이 ‘딱 맞아떨어졌습니다’. 이 공통점을 넣어 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is2-1-2", unitLabel: "[통합과학2 Ⅰ-2] 화학 변화",
  rows: [
    { key: "r1", label: "① 붉은 돌에서 철을 꺼내라" },
    { key: "r2", label: "② 물고기가 사라진 호수" },
    { key: "r3", label: "③ 불 없이 따뜻하게, 얼음 없이 차갑게" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
