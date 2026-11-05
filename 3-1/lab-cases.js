/* 통합과학2 Ⅲ-1 감염병과 빅데이터 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";
/* ---- 밝은 스튜디오 + 입체 미니어처 말투 (kit.js 머리말 K.iso·K.LT·K.card 참고) ---- */
var K = window.sthKit, LT = K.LT;
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lt(ctx, s, x, y, o) { o = o || {}; if (!o.c) o.c = LT.ink; K.t(ctx, s, x, y, o); }
function lead(ctx, px, py, qx, qy, s, col, box) {
  ctx.strokeStyle = "rgba(20,25,40,.75)"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(qx, qy); ctx.stroke();
  ctx.fillStyle = "#111622"; ctx.beginPath(); ctx.arc(px, py, 2.5, 0, 6.283); ctx.fill();
  return K.pill(ctx, s, qx + (qx < px ? -4 : 4), qy + 4, { s: 12, a: qx < px ? "right" : "left", c: col || "#e8ecff", box: box });
}
function judge(ctx, W, CH, title, big, bigCol, rows, tip, good) {      /* 오른쪽 흰 판정 카드 */
  var CX = 640, x0 = CX + 16, x1 = W - 16;
  K.card(ctx, CX, 0, W - CX, CH, title);
  lt(ctx, big, x0, 58, { s: 19, w: "900", c: bigCol });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], x0, x1, 92 + i * 26, r[2]); });
  if (tip) K.tip(ctx, tip, x0 - 4, 100 + rows.length * 26, x1 - x0 + 4, good);
}
function hospital(ctx, ox, oy, need) {                                  /* 병상 10개 병원 미니어처 (need = 필요한 침대 수) */
  var I = K.iso({ ox: ox, oy: oy, s: .78, L: 120, D: 70 }), fill = Math.min(10, Math.round(need)), extra = Math.max(0, Math.round(need) - 10);
  I.box(ctx, 0, 0, 0, 120, 70, 6, "#f1f3f5", "#dfe4ea", "#b8c0ca");
  I.box(ctx, 0, 0, 6, 120, 4, 40, "#ffffff", "#f1f3f5", "#ced4da");
  var c = I.P(60, 4, 26); ctx.fillStyle = "#e03131"; ctx.fillRect(c.x - 3, c.y - 9, 6, 18); ctx.fillRect(c.x - 9, c.y - 3, 18, 6);
  for (var b = 0; b < 10; b++) {
    var bx = 8 + (b % 5) * 22, by = b < 5 ? 14 : 42, on = b < fill;
    I.box(ctx, bx, by, 6, bx + 16, by + 22, 12, on ? "#ffc9c9" : "#ffffff", on ? "#e03131" : "#dee2e6", on ? "#a51111" : "#adb5bd");
    if (on) { var hp = I.P(bx + 8, by + 6, 13); ctx.fillStyle = "#f1c7a5"; ctx.beginPath(); ctx.arc(hp.x, hp.y, 2.4, 0, 6.2832); ctx.fill(); }
  }
  for (var e = 0; e < Math.min(8, extra); e++) I.person(ctx, 128 + (e % 4) * 7, 20 + e * 7, 0, "#e03131", 1.2);
  return extra;
}

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 집단 면역 */
  {
    id: "c1", about: "01", tag: "감염병 예방", title: "홍역이 들어온 학교", short: "집단 면역",
    who: "💉", name: "보건소 감염병 팀",
    say: "“이웃 학교에 홍역 환자가 생겼어요. 홍역은 면역이 없는 사람들 사이에서 환자 한 명이 평균 <b>15명</b>에게 옮깁니다(기초 감염 재생산 수 R₀ = 15). 추가 접종 목표를 정해야 하는데, 접종에도 비용과 준비가 드니 <b>유행이 멈추는 가장 낮은 접종률</b>을 알려 주세요.”",
    predict: {
      q: "환자 한 명이 옮기는 사람 수가 평균 1명보다 적어지면, 유행은?",
      options: ["㉠ 계속 커진다", "㉡ 그대로 유지된다", "㉢ 점점 줄어들다 멈춘다"],
      answer: 2
    },
    task: "백신과 접종률을 정해 <b>환자 한 명이 옮기는 수(실제 재생산 수)가 1 미만</b>이 되는 가장 낮은 접종률(여유 1%p 포함)을 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var R0 = 15, eff = 0.97, cov = 80;
      function Re() { return R0 * (1 - cov / 100 * eff); }
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var r = Re(), CH = cv.H, prot = Math.round(200 * cov / 100 * eff), vacc = Math.round(200 * cov / 100), i;
        K.studio(ctx, 0, 0, 630, CH, { x: 210, y: 292, rx: 180, ry: 16 });
        var I = K.iso({ ox: 168, oy: 108, s: .72, L: 300, D: 150 });
        I.box(ctx, 0, 0, 0, 300, 150, 8, "#d8c7a8", "#a68b67", "#86704f");
        I.box(ctx, 0, 0, 8, 300, 14, 52, "#e9ecef", "#f8f9fa", "#ced4da");
        for (i = 0; i < 9; i++) { var w0 = I.P(14 + i * 32, 14, 24), w1 = I.P(34 + i * 32, 14, 24), w2 = I.P(34 + i * 32, 14, 40), w3 = I.P(14 + i * 32, 14, 40); I.quad(ctx, w0, w1, w2, w3, "#a5d8ff", "rgba(255,255,255,.8)"); }
        for (i = 0; i < 200; i++) {
          var col = i % 20, row = Math.floor(i / 20);
          I.person(ctx, 12 + col * 14.4, 26 + row * 12.4, 8, i < prot ? "#0ca678" : (i < vacc ? "#f59f00" : "#adb5bd"), .95);
        }
        if (vacc < 200) { var sp = I.P(12 + 19 * 14.4, 26 + 9 * 12.4, 20); K.glow(ctx, sp.x, sp.y, 4, "rgba(240,62,62,.95)", 3); lead(ctx, sp.x, sp.y, sp.x + 40, sp.y + 30, "첫 환자", "#ffc9c9", [0, 390]); }
        lt(ctx, "● 접종·면역 생김 " + prot + "명", 18, CH - 34, { s: 11.5, w: "800", c: "#0ca678" });
        lt(ctx, "● 접종했지만 면역 없음 " + (vacc - prot) + "명", 18, CH - 14, { s: 11.5, w: "800", c: "#d9480f" });
        lt(ctx, "● 미접종 " + (200 - vacc) + "명", 210, CH - 34, { s: 11.5, w: "800", c: LT.mute });
        K.bigText(ctx, "R = " + r.toFixed(2), 18, 44, 26, r < 1 ? "#8ff5cf" : "#ffc9c9");
        K.bigText(ctx, r < 1 ? "유행이 번지지 못한다" : "유행이 번진다", 18, 70, 15, "#ffd35a");
        var ymax = Math.max(1.2, Math.pow(Math.max(r, 1), 4) * 1.15), g = K.chart(ctx, { x: 396, y: 60, w: 230, h: 236, x0: 0, x1: 5, y0: 0, y1: ymax, xt: 5, yt: 4, xf: function () { return ""; }, yf: function (q) { return q >= 10 ? Math.round(q) + "" : q.toFixed(1); }, yl: "세대별 새 환자", light: true });
        for (var gg = 0; gg <= 4; gg++) {
          var n = Math.pow(r, gg), x0 = g.X(gg + .2), x1 = g.X(gg + .8), y = g.Y(Math.min(n, ymax));
          var bg = ctx.createLinearGradient(0, y, 0, g.B); bg.addColorStop(0, r < 1 ? "#63e6be" : "#ff8787"); bg.addColorStop(1, r < 1 ? "#0f9f76" : "#c92a2a");
          ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x0, y, x1 - x0, g.B - y, [4, 4, 0, 0]); ctx.fill();
          lt(ctx, n >= 100 ? n.toFixed(0) : n.toFixed(2), (x0 + x1) / 2, y - 5, { s: 10, w: "800", a: "center" });
          lt(ctx, gg + "세대", (x0 + x1) / 2, g.B + 15, { s: 10, a: "center", c: LT.mute });
        }
        judge(ctx, W, CH, "판정 · 홍역이 퍼질까", r < 1 ? "집단 면역 성공" : "유행이 번진다", r < 1 ? LT.green : LT.red,
          [["접종률", cov + "%"], ["백신 효과", Math.round(eff * 100) + "%"], ["면역 생긴 학생", prot + "명"], ["15 × (1 − 접종 × 효과)", r.toFixed(2), r < 1 ? LT.green : LT.red]],
          r < 1 ? "환자 한 명이 한 명도 못 옮긴다" : "R을 1 아래로 낮춰야 한다", r < 1);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "백신", value: 0.97, options: [{ v: 0.97, t: "MMR 백신 (효과 97%)" }, { v: 0.6, t: "가상의 약한 백신 (효과 60%)" }],
        onPick: function (x) { eff = x; draw(); } });
      api.slider({ label: "접종률", min: 0, max: 100, step: 1, value: 80, fmt: function (x) { return x + "%"; },
        onInput: function (x) { cov = x; draw(); } });
      api.info("면역이 생긴 사람은 병을 옮기지도 않습니다. 환자가 만나는 사람 가운데 <b>면역 없는 사람의 비율</b>만큼만 옮긴다고 보세요.");
      draw();
      return {
        judge: function () {
          var r = Re();
          if (r >= 1) return { ok: false, msg: "실제 재생산 수 " + r.toFixed(2) + " — 1 이상이라 유행이 이어집니다." + (eff < 0.9 && cov === 100 ? " 이 백신으로는 모두 맞아도 막을 수 없어요." : "") };
          if (cov > 98) return { ok: false, msg: "유행은 멈추지만 " + cov + "%는 필요 이상입니다. 더 낮춰도 됩니다." };
          return { ok: true, msg: "접종률 " + cov + "% → 실제 재생산 수 " + r.toFixed(2) + " — 접종하지 못한 아기와 환자도 함께 보호됩니다(집단 면역)." };
        }
      };
    },
    hints: [
      "유행이 멈추려면 15 × (면역 없는 비율) < 1, 즉 면역 없는 사람이 <b>15명 중 1명보다 적어야</b> 합니다. 면역이 있어야 할 비율은?",
      "1 − 1/15 ≈ 93.3%가 면역을 가져야 합니다. 그런데 백신 효과가 97% 이니, 접종률은 93.3% ÷ 0.97보다 커야 합니다."
    ],
    solution: "<b>MMR 백신 · 접종률 97~98%</b>. 효과 60% 백신은 100%가 맞아도 재생산 수가 6이라 막을 수 없습니다.",
    why: "환자 한 명이 옮기는 평균 인원(실제 재생산 수)이 <b>1보다 작아지면</b> 세대마다 환자가 줄어 유행이 스스로 멈춥니다. 모두가 면역을 가질 필요는 없어요 — 충분히 많은 사람이 면역을 가지면 <b>나머지도 보호</b>받습니다. 이것이 <b>집단 면역</b>입니다.<br>" +
      "필요한 면역 비율은 1 − 1/R₀ 라서, 잘 옮는 병일수록 문턱이 높습니다(독감 R₀≈2 → 50%, 홍역 15 → 93%). 스노가 펌프 손잡이를 떼어 <b>옮기는 길</b>을 끊었듯, 백신은 사람과 사람 사이의 길을 끊는 방법입니다."
  },

  /* ------------------------------------------------------------------ 2. 표본 설계 */
  {
    id: "c2", about: "02", tag: "빅데이터 · 표본", title: "급식 만족도 조사 설계", short: "표본 설계",
    who: "📋", name: "학생회 조사부",
    say: "“전교생 <b>1000명</b>의 급식 만족도를 알고 싶어요. 결과는 <b>오차 ± 5%p 이내</b>여야 학교에 건의할 수 있대요. 설문지를 돌릴 일손이 모자라 <b>300명</b>까지만 조사할 수 있습니다. 어떻게, 몇 명에게 물어야 할까요?”",
    predict: {
      q: "240만 장의 엽서처럼 응답자가 아주 많으면, 뽑는 방법이 치우쳐 있어도 결과가 정확해질까?",
      options: ["㉠ 그렇다 — 표본이 크면 치우침도 사라진다", "㉡ 아니다 — 표본이 커지면 우연 오차는 줄지만 치우침은 그대로다", "㉢ 표본이 크면 오히려 더 부정확해진다"],
      answer: 1
    },
    task: "뽑는 방법과 조사 인원을 정해 <b>치우침 없이 오차 ± 5%p 이내, 300명 이하</b>를 만족하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var TRUE = 52;
      var M = { rand: { t: "학번 무작위 뽑기", bias: 0 }, line: { t: "급식실 앞 먼저 온 사람", bias: 14 }, web: { t: "누리집 자원 응답", bias: -17 } };
      var m = "line", n = 100;
      function moe(k) { return 196 * Math.sqrt(0.25 / k) * Math.sqrt((1000 - k) / 999); }
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var e = moe(n), est = TRUE + M[m].bias, CH = cv.H, ok = !M[m].bias && n <= 300 && e <= 5, i;
        K.studio(ctx, 0, 0, 630, CH, { x: 500, y: CH - 40, rx: 120, ry: 16 });
        K.bigText(ctx, "내 조사 " + est + "% ± " + e.toFixed(1) + "%p", 18, 44, 24, ok ? "#8ff5cf" : "#ffffff");
        K.bigText(ctx, "전교생에게 다 물으면 " + TRUE + "%", 18, 70, 15, "#ffd35a");
        var g = K.chart(ctx, { x: 6, y: 96, w: 370, h: 150, x0: 0, x1: 100, y0: 0, y1: 1, xt: 5, yt: 1, yf: function () { return ""; }, xf: function (q) { return q + "%"; }, pl: 18, light: true });
        ctx.fillStyle = "rgba(28,126,214,.18)"; ctx.fillRect(g.X(est - e), g.Y(.72), g.X(est + e) - g.X(est - e), g.Y(.28) - g.Y(.72));
        ctx.strokeStyle = "rgba(28,126,214,.6)"; ctx.strokeRect(g.X(est - e), g.Y(.72), g.X(est + e) - g.X(est - e), g.Y(.28) - g.Y(.72));
        K.planet(ctx, g.X(est), g.Y(.5), 6, "#74c0fc", "#1864ab");
        ctx.strokeStyle = LT.green; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(g.X(TRUE), g.T); ctx.lineTo(g.X(TRUE), g.B); ctx.stroke();
        lt(ctx, "전교생 " + TRUE + "%", g.X(TRUE) + 5, g.T + 14, { s: 11, w: "900", c: LT.green });
        lt(ctx, "내 조사 범위", g.X(est), g.Y(.28) + 14, { s: 10.5, w: "800", a: "center", c: LT.blue });
        /* 뽑는 방법 미니어처 */
        var I = K.iso({ ox: 500, oy: 128, s: .95, L: 90, D: 70 });
        I.box(ctx, 0, 0, 0, 90, 70, 6, "#e9ecef", "#ced4da", "#adb5bd");
        if (m === "rand") {
          var R = K.rng(4); I.box(ctx, 20, 15, 6, 70, 55, 54, "rgba(220,235,255,.35)", "rgba(200,220,245,.45)", "rgba(170,195,230,.45)");
          for (i = 0; i < 18; i++) { var bp = I.P(26 + R() * 38, 20 + R() * 30, 9 + R() * 22); K.planet(ctx, bp.x, bp.y, 4.5, ["#ff8787", "#74c0fc", "#ffe066", "#8ce99a"][i % 4], "#495057"); }
          lead(ctx, I.P(45, 15, 54).x, I.P(45, 15, 54).y, 420, 82, "학번 공 뽑기 · 누구나 같은 기회", "#b2f2bb", [380, 630]);
        } else if (m === "line") {
          I.box(ctx, 0, 0, 6, 90, 30, 56, "#ffe8cc", "#ffd8a8", "#e8a65c"); var dr = I.P(30, 30, 6), dr2 = I.P(30, 30, 30); ctx.fillStyle = "#5c3b1e"; ctx.fillRect(dr.x - 6, dr2.y, 12, dr.y - dr2.y);
          for (i = 0; i < 9; i++) I.person(ctx, 30 + i * 6, 38 + i * 3.5, 6, ["#ff6b81", "#4fb6ff", "#ffd35a"][i % 3], 1.3);
          lead(ctx, I.P(45, 0, 56).x, I.P(45, 0, 56).y, 420, 82, "급식실 앞에 먼저 온 사람", "#ffc9c9", [380, 630]);
        } else {
          I.box(ctx, 20, 20, 6, 70, 50, 26, "#c69c6d", "#a47148", "#7f5539"); I.box(ctx, 30, 26, 26, 60, 44, 28, "#495057", "#343a40", "#212529");
          var s1 = I.P(30, 26, 28), s2 = I.P(60, 26, 28), s3 = I.P(60, 26, 50), s4 = I.P(30, 26, 50); I.quad(ctx, s1, s2, s3, s4, "#4dabf7", "#343a40");
          I.person(ctx, 45, 62, 6, "#b197fc", 1.4); I.person(ctx, 75, 30, 6, "#b197fc", 1.4);
          lead(ctx, s3.x, s3.y, 420, 82, "누리집에 스스로 응답한 사람", "#ffc9c9", [380, 630]);
        }
        lt(ctx, "※ 오차는 95% 신뢰 수준, 전교생 1000명에서 뽑는 경우", 18, CH - 10, { s: 10.5, c: LT.mute });
        judge(ctx, W, CH, "판정 · 급식 만족도 조사", ok ? "믿을 만한 조사" : (M[m].bias ? "치우친 조사" : (n > 300 ? "일손이 모자란다" : "오차가 너무 크다")), ok ? LT.green : LT.red,
          [["방법", M[m].t, M[m].bias ? LT.red : LT.green], ["조사 인원 (300 이하)", n + "명", n > 300 ? LT.red : LT.ink], ["오차 (5%p 이하)", "± " + e.toFixed(1) + "%p", e > 5 ? LT.red : LT.ink], ["치우침", (M[m].bias > 0 ? "+" : "") + M[m].bias + "%p", M[m].bias ? LT.red : LT.ink]],
          M[m].bias ? "모인 사람이 전교생과 성향이 다르다" : "누구나 뽑힐 기회가 같다", !M[m].bias);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "뽑는 방법", value: "line", options: [{ v: "rand", t: "학번 무작위 뽑기" }, { v: "line", t: "급식실 앞 먼저 온 사람" }, { v: "web", t: "누리집 자원 응답" }],
        onPick: function (x) { m = x; draw(); } });
      api.slider({ label: "조사 인원", min: 20, max: 500, step: 2, value: 100, fmt: function (x) { return x + "명"; },
        onInput: function (x) { n = x; draw(); } });
      api.info("인원을 늘리면 파란 띠(오차)가 좁아집니다. 그런데 띠의 <b>가운데</b>는 무엇으로 움직이나요?");
      draw();
      return {
        judge: function () {
          var e = moe(n);
          if (M[m].bias) return { ok: false, msg: M[m].t + " — 인원을 아무리 늘려도 결과가 " + Math.abs(M[m].bias) + "%p 쯤 " + (M[m].bias > 0 ? "높게" : "낮게") + " 치우칩니다." };
          if (n > 300) return { ok: false, msg: n + "명 — 일손(300명)을 넘습니다." };
          if (e > 5) return { ok: false, msg: "오차 ± " + e.toFixed(1) + "%p — 아직 5%p보다 큽니다." };
          return { ok: true, msg: "무작위 " + n + "명 · 오차 ± " + e.toFixed(1) + "%p — 1000명 전체를 믿을 만하게 대표합니다." };
        }
      };
    },
    hints: [
      "급식실 앞에 먼저 오는 학생, 누리집에 스스로 답하는 학생은 전교생과 성향이 다를 수 있습니다. <b>누구나 뽑힐 기회가 같은</b> 방법은?",
      "무작위로 뽑았다면 남은 건 인원입니다. 인원을 늘리며 오차가 5%p 아래로 내려가는 지점을 찾으세요."
    ],
    solution: "<b>학번 무작위 뽑기</b>로 <b>278~300명</b>.",
    why: "표본 조사의 오차는 두 가지입니다. <b>우연 오차</b>는 인원을 늘리면 줄지만, 뽑는 방법이 한쪽으로 쏠린 <b>치우침(편향)</b>은 인원을 늘려도 그대로입니다. 240만 장의 엽서가 1936년 선거를 틀린 까닭이 바로 이것입니다.<br>" +
      "그래서 좋은 조사는 먼저 <b>누구나 뽑힐 기회가 같게</b> 설계하고, 그다음에 필요한 인원을 계산합니다. 빅데이터도 마찬가지로, 양이 많다고 저절로 대표성이 생기지는 않습니다."
  },

  /* ------------------------------------------------------------------ 3. 지수적 증가 */
  {
    id: "c3", about: "01", tag: "데이터로 예측하기", title: "3일마다 두 배", short: "두 배씩",
    who: "🏥", name: "도 방역 대책 본부",
    say: "“새 호흡기 감염병 입원 환자가 오늘 <b>100명</b>, 지금은 <b>3일마다 두 배</b>로 늘고 있어요. 도내 병상은 <b>5000개</b>. 백신이 나오기까지 <b>60일</b>을 버텨야 합니다. 방역을 세게 할수록 두 배가 되는 기간이 길어지지만 가게와 학교가 멈춥니다. <b>가장 약한 방역</b>으로 60일을 버텨 주세요.”",
    predict: {
      q: "대책 없이 3일마다 두 배가 되면, 병상 5000개가 모자라는 날은 대략?",
      options: ["㉠ 약 150일 뒤 (하루 33명씩 는다고 치면)", "㉡ 약 17일 뒤", "㉢ 약 50일 뒤"],
      answer: 1
    },
    task: "두 배가 되는 기간을 조절해 <b>60일 동안 입원 환자가 5000명 이하</b>가 되게 하되, 가장 약한 방역(두 배 기간 12일 이하)으로 하세요. 눈금을 바꿔 보면 그래프가 달리 보여요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var Td = 3, scale = "lin";
      function cases(d) { return 100 * Math.pow(2, d / Td); }
      var gx0 = 80, gx1 = 620, gy0 = 50, gy1 = 280;
      function GX(d) { return gx0 + d / 60 * (gx1 - gx0); }
      function GY(n) {
        if (scale === "lin") return gy1 - Math.min(n, 10000) / 10000 * (gy1 - gy0);
        return gy1 - (H.log10(Math.max(n, 10)) - 1) / 5 * (gy1 - gy0);
      }
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        gx0 = 66; gx1 = 420; gy0 = 104; gy1 = 290;
        var CH = cv.H, n60 = cases(60), over = null, pts = [], d, nn;
        K.studio(ctx, 0, 0, 630, CH, { x: 530, y: 262, rx: 90, ry: 14 });
        ctx.fillStyle = "rgba(255,255,255,.72)"; ctx.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
        ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy1); ctx.lineTo(gx1, gy1); ctx.stroke();
        (scale === "lin" ? [0, 2500, 5000, 7500, 10000] : [10, 100, 1000, 10000, 100000, 1000000]).forEach(function (q) {
          ctx.strokeStyle = LT.grid; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(gx0, GY(q)); ctx.lineTo(gx1, GY(q)); ctx.stroke();
          lt(ctx, q >= 1000 ? (q / 1000) + "천" : q + "", gx0 - 8, GY(q) + 4, { s: 10, a: "right", c: LT.mute });
        });
        [0, 10, 20, 30, 40, 50, 60].forEach(function (q) { lt(ctx, q + "일", GX(q), gy1 + 16, { s: 10, a: "center", c: LT.mute }); });
        ctx.save(); ctx.strokeStyle = LT.red; ctx.lineWidth = 2; ctx.setLineDash([7, 4]); ctx.beginPath(); ctx.moveTo(gx0, GY(5000)); ctx.lineTo(gx1, GY(5000)); ctx.stroke(); ctx.restore();
        lt(ctx, "병상 5000", gx1 - 4, GY(5000) - 6, { s: 11, w: "900", a: "right", c: LT.red });
        for (d = 0; d <= 60; d += 0.5) { nn = cases(d); if (over === null && nn > 5000) over = d; if (scale === "lin" && nn > 10000) break; pts.push([GX(d), GY(nn)]); }
        ctx.save(); ctx.strokeStyle = LT.violet; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.shadowColor = "rgba(112,72,232,.3)"; ctx.shadowBlur = 3; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); ctx.restore();
        lt(ctx, "입원 환자 수 (" + (scale === "lin" ? "보통 눈금" : "로그 눈금 · 한 칸 10배") + ")", gx0, gy0 - 8, { s: 11, w: "800", c: LT.mute });
        K.bigText(ctx, over === null ? "60일 안에는 버틴다" : Math.ceil(over) + "일째 병상 부족", 18, 44, 24, over === null ? "#8ff5cf" : "#ffc9c9");
        K.bigText(ctx, Td.toFixed(1) + "일마다 두 배로", 18, 70, 15, "#ffd35a");
        var ex = hospital(ctx, 490, 150, n60 / 500);
        K.pill(ctx, "60일째 병원 · 침대 1개 = 병상 500", 530, 300, { s: 11, a: "center", c: ex ? "#ffc9c9" : "#e8ecff", box: [430, 628] });
        judge(ctx, W, CH, "판정 · 병상이 버틸까", over === null ? "버틴다" : Math.ceil(over) + "일째 모자람", over === null ? LT.green : LT.red,
          [["두 배가 되는 기간", Td.toFixed(1) + " 일"], ["병상이 모자라는 날", over === null ? "60일 안에는 없음" : Math.ceil(over) + "일째", over === null ? LT.green : LT.red], ["60일째 입원 환자", n60 >= 1e6 ? (n60 / 1e6).toFixed(1) + " 백만" : Math.round(n60).toLocaleString() + " 명", n60 <= 5000 ? LT.green : LT.red]],
          over === null ? "두 배 기간을 늘렸다" : "두 배씩은 금세 폭발한다", over === null);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "세로 눈금", value: "lin", options: [{ v: "lin", t: "보통 눈금" }, { v: "log", t: "로그 눈금" }],
        onPick: function (x) { scale = x; draw(); } });
      api.slider({ label: "두 배가 되는 기간 (방역 세기)", min: 3, max: 20, step: 0.5, value: 3, fmt: function (x) { return x.toFixed(1) + " 일"; },
        onInput: function (x) { Td = x; draw(); } });
      api.info("로그 눈금에서는 ‘일정한 비율로 늘어나는’ 그래프가 <b>곧은 선</b>이 됩니다. 기울기가 곧 늘어나는 빠르기입니다.");
      draw();
      return {
        judge: function () {
          var n60 = cases(60);
          if (n60 > 5000) return { ok: false, msg: "60일째 " + Math.round(n60).toLocaleString() + " 명 — 병상이 모자랍니다." };
          if (Td > 12) return { ok: false, msg: "병상은 버티지만 두 배 기간 " + Td + " 일은 필요 이상으로 센 방역입니다." };
          return { ok: true, msg: "두 배 기간 " + Td + " 일 → 60일째 " + Math.round(n60).toLocaleString() + " 명 — 병상 안에서 버팁니다." };
        }
      };
    },
    hints: [
      "60일 동안 두 배가 몇 번 일어나는지 세어 보세요. 100명이 5000명을 넘지 않으려면 두 배가 <b>몇 번까지</b> 허락될까요?",
      "100 → 5000은 50배, 2⁵ = 32이고 2⁶ = 64 이니 두 배는 약 5.6번까지. 60일 ÷ 5.6 ≈ 10.6일."
    ],
    solution: "두 배가 되는 기간을 <b>11~12일</b>로 늘리세요. 대책이 없으면 <b>17일째</b>에 병상이 모자랍니다.",
    why: "일정한 <b>비율</b>로 늘어나는 것(지수적 증가)은 처음엔 느려 보이다가 갑자기 폭발합니다. 하루 33명씩 ‘더하는’ 증가라면 150일이 걸릴 일이, 3일마다 ‘곱하는’ 증가에서는 17일이면 닥칩니다.<br>" +
      "그래서 감염병 자료는 <b>로그 눈금</b>으로 보는 일이 많습니다. 곧은 선의 기울기가 곧 번지는 빠르기이고, 방역의 효과는 기울기가 눕는 것으로 드러납니다. 자료에서 규칙을 찾아 <b>앞날을 예측</b>하는 것이 빅데이터가 방역에 쓰이는 방식입니다."
  }
  ]
});
})();
