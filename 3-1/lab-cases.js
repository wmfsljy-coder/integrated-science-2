/* 통합과학2 Ⅲ-1 감염병과 빅데이터 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 집단 면역 */
  {
    id: "c1", tag: "감염병 예방", title: "홍역이 들어온 학교", short: "집단 면역",
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
        H.paper(ctx, W, cv.H);
        var r = Re();
        H.text(ctx, "전교생 200명", 40, 30, { s: 14, w: "900" });
        var prot = Math.round(200 * cov / 100 * eff), vacc = Math.round(200 * cov / 100);
        for (var i = 0; i < 200; i++) {
          var x = 50 + (i % 20) * 19, y = 52 + Math.floor(i / 20) * 19;
          var col = i < prot ? H.v("--teal") : (i < vacc ? H.v("--amber") : H.v("--line"));
          H.dot(ctx, x, y, 7, col);
        }
        H.dot(ctx, 56, 260, 6, H.v("--teal")); H.text(ctx, "접종·면역 생김", 68, 264, { s: 11, c: H.v("--mist") });
        H.dot(ctx, 176, 260, 6, H.v("--amber")); H.text(ctx, "접종했지만 면역 안 생김", 188, 264, { s: 11, c: H.v("--mist") });
        H.dot(ctx, 56, 284, 6, H.v("--line")); H.text(ctx, "미접종", 68, 288, { s: 11, c: H.v("--mist") });
        /* 세대별 환자 */
        var gx0 = 480, gy1 = 250;
        H.text(ctx, "환자 1명에서 시작한 세대별 새 환자", gx0, 60, { s: 12, w: "800", c: H.v("--mist") });
        H.axes(ctx, gx0, 70, gx0 + 260, gy1);
        var mx = Math.max(1, Math.pow(Math.max(r, 1), 4));
        for (var g = 0; g <= 4; g++) {
          var n = Math.pow(r, g), bh = Math.min(170, n / mx * 170);
          H.box(ctx, gx0 + 12 + g * 50, gy1 - bh, 34, bh, r < 1 ? H.v("--green") : H.v("--rose"), 0.75);
          H.text(ctx, n >= 100 ? n.toFixed(0) : n.toFixed(2), gx0 + 29 + g * 50, gy1 - bh - 6, { s: 10.5, w: "800", a: "center" });
          H.text(ctx, g + "세대", gx0 + 29 + g * 50, gy1 + 16, { s: 10, a: "center", c: H.v("--mist") });
        }
        H.text(ctx, "실제 재생산 수 = 15 × (1 − " + cov + "% × " + Math.round(eff * 100) + "%) = " + r.toFixed(2), 480, 300,
          { s: 13, w: "900", c: r < 1 ? H.v("--green-700") : H.v("--rose-700") });
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
          if (cov > 98) return { ok: false, msg: "유행은 멈추지만 " + cov + "% 는 필요 이상입니다. 더 낮춰도 됩니다." };
          return { ok: true, msg: "접종률 " + cov + "% → 실제 재생산 수 " + r.toFixed(2) + " — 접종하지 못한 아기와 환자도 함께 보호됩니다(집단 면역)." };
        }
      };
    },
    hints: [
      "유행이 멈추려면 15 × (면역 없는 비율) < 1, 즉 면역 없는 사람이 <b>15명 중 1명보다 적어야</b> 합니다. 면역이 있어야 할 비율은?",
      "1 − 1/15 ≈ 93.3% 가 면역을 가져야 합니다. 그런데 백신 효과가 97% 이니, 접종률은 93.3% ÷ 0.97 보다 커야 해요."
    ],
    solution: "<b>MMR 백신 · 접종률 97 ~ 98%</b>. 효과 60% 백신은 100% 가 맞아도 재생산 수가 6 이라 막을 수 없습니다.",
    why: "환자 한 명이 옮기는 평균 인원(실제 재생산 수)이 <b>1 보다 작아지면</b> 세대마다 환자가 줄어 유행이 스스로 멈춥니다. 모두가 면역을 가질 필요는 없어요 — 충분히 많은 사람이 면역을 가지면 <b>나머지도 보호</b>받습니다. 이것이 <b>집단 면역</b>이에요.<br>" +
      "필요한 면역 비율은 1 − 1/R₀ 라서, 잘 옮는 병일수록 문턱이 높습니다(독감 R₀≈2 → 50%, 홍역 15 → 93%). 스노가 펌프 손잡이를 떼어 <b>옮기는 길</b>을 끊었듯, 백신은 사람과 사람 사이의 길을 끊는 방법입니다."
  },

  /* ------------------------------------------------------------------ 2. 표본 설계 */
  {
    id: "c2", tag: "빅데이터 · 표본", title: "급식 만족도 조사 설계", short: "표본 설계",
    who: "📋", name: "학생회 조사부",
    say: "“전교생 <b>1000명</b>의 급식 만족도를 알고 싶어요. 결과는 <b>오차 ± 5%p 이내</b>여야 학교에 건의할 수 있대요. 설문지를 돌릴 일손이 모자라 <b>300명</b>까지만 조사할 수 있습니다. 어떻게, 몇 명에게 물어야 할까요?”",
    predict: {
      q: "240만 장의 엽서처럼 응답자가 아주 많으면, 뽑는 방법이 치우쳐 있어도 결과가 정확해질까?",
      options: ["㉠ 그렇다 — 표본이 크면 치우침도 사라진다", "㉡ 아니다 — 표본이 커지면 우연 오차는 줄지만 치우침은 그대로다", "㉢ 표본이 크면 오히려 더 부정확해진다"],
      answer: 1
    },
    task: "뽑는 방법과 조사 인원을 정해 <b>치우침 없이 오차 ± 5%p 이내, 300명 이하</b>를 만족하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var TRUE = 52;
      var M = { rand: { t: "학번 무작위 뽑기", bias: 0 }, line: { t: "급식실 앞 먼저 온 사람", bias: 14 }, web: { t: "누리집 자원 응답", bias: -17 } };
      var m = "line", n = 100;
      function moe(k) { return 196 * Math.sqrt(0.25 / k) * Math.sqrt((1000 - k) / 999); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var e = moe(n), est = TRUE + M[m].bias;
        H.text(ctx, "조사 결과 — ‘급식에 만족한다’ 비율", 40, 30, { s: 14, w: "900" });
        var x0 = 80, x1 = 820;
        function X(p) { return x0 + p / 100 * (x1 - x0); }
        H.axes(ctx, x0, 60, x1, 200);
        [0, 20, 40, 60, 80, 100].forEach(function (p) { H.text(ctx, p + "%", X(p), 218, { s: 10.5, a: "center", c: H.v("--mist") }); });
        H.box(ctx, X(est - e), 110, X(est + e) - X(est - e), 40, H.v("--brand"), 0.3);
        H.dot(ctx, X(est), 130, 7, H.v("--brand-700"));
        H.text(ctx, "내 조사: " + est + "% ± " + e.toFixed(1) + "%p", X(est), 98, { s: 12.5, w: "900", a: "center", c: H.v("--brand-700") });
        H.line(ctx, [[X(TRUE), 64], [X(TRUE), 196]], H.v("--green-700"), 2);
        H.text(ctx, "전교생에게 다 물었을 때 " + TRUE + "%", X(TRUE), 180, { s: 11.5, w: "800", a: "center", c: H.v("--green-700") });
        H.text(ctx, "방법: " + M[m].t + (M[m].bias ? "  — 이 방법으로 모인 사람은 전교생과 성향이 다릅니다" : "  — 누구나 뽑힐 기회가 같습니다"), 40, 256,
          { s: 12.5, w: "800", c: M[m].bias ? H.v("--rose-700") : H.v("--green-700") });
        H.text(ctx, "조사 인원 " + n + "명" + (n > 300 ? " (일손 초과)" : "") + " · 오차 ± " + e.toFixed(1) + "%p" + (e <= 5 ? "" : " (너무 큼)"), 40, 284,
          { s: 12.5, w: "800", c: n > 300 || e > 5 ? H.v("--rose-700") : H.v("--ink") });
        H.text(ctx, "※ 오차는 95% 신뢰 수준, 전교생 1000명에서 뽑는 경우로 계산", 40, 308, { s: 11, c: H.v("--mist") });
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
          if (e > 5) return { ok: false, msg: "오차 ± " + e.toFixed(1) + "%p — 아직 5%p 보다 큽니다." };
          return { ok: true, msg: "무작위 " + n + "명 · 오차 ± " + e.toFixed(1) + "%p — 1000명 전체를 믿을 만하게 대표합니다." };
        }
      };
    },
    hints: [
      "급식실 앞에 먼저 오는 학생, 누리집에 스스로 답하는 학생은 전교생과 성향이 다를 수 있습니다. <b>누구나 뽑힐 기회가 같은</b> 방법은?",
      "무작위로 뽑았다면 남은 건 인원입니다. 인원을 늘리며 오차가 5%p 아래로 내려가는 지점을 찾으세요."
    ],
    solution: "<b>학번 무작위 뽑기</b>로 <b>278 ~ 300명</b>.",
    why: "표본 조사의 오차는 두 가지입니다. <b>우연 오차</b>는 인원을 늘리면 줄지만, 뽑는 방법이 한쪽으로 쏠린 <b>치우침(편향)</b>은 인원을 늘려도 그대로예요. 240만 장의 엽서가 1936년 선거를 틀린 까닭이 바로 이것이지요.<br>" +
      "그래서 좋은 조사는 먼저 <b>누구나 뽑힐 기회가 같게</b> 설계하고, 그다음에 필요한 인원을 계산합니다. 빅데이터도 마찬가지로, 양이 많다고 저절로 대표성이 생기지는 않습니다."
  },

  /* ------------------------------------------------------------------ 3. 지수적 증가 */
  {
    id: "c3", tag: "데이터로 예측하기", title: "3일마다 두 배", short: "두 배씩",
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
        H.paper(ctx, W, cv.H);
        H.text(ctx, "입원 환자 수 (" + (scale === "lin" ? "보통 눈금" : "로그 눈금 — 한 칸마다 10배") + ")", 40, 30, { s: 14, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        (scale === "lin" ? [0, 2500, 5000, 7500, 10000] : [10, 100, 1000, 10000, 100000, 1000000]).forEach(function (n) {
          H.text(ctx, n >= 1000 ? (n / 1000) + "천" : n + "", gx0 - 8, GY(n) + 4, { s: 10, a: "right", c: H.v("--mist") });
        });
        [0, 10, 20, 30, 40, 50, 60].forEach(function (d) { H.text(ctx, d + "일", GX(d), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        H.line(ctx, [[gx0, GY(5000)], [gx1, GY(5000)]], H.v("--rose"), 2);
        H.text(ctx, "병상 5000", gx1 - 4, GY(5000) - 6, { s: 11, w: "800", a: "right", c: H.v("--rose-700") });
        var pts = [], over = null;
        for (var d = 0; d <= 60; d += 0.5) {
          var n = cases(d); if (over === null && n > 5000) over = d;
          if (scale === "lin" && n > 10000) break;
          pts.push([GX(d), GY(n)]);
        }
        H.line(ctx, pts, H.v("--violet"), 3);
        var n60 = cases(60);
        H.rows(ctx, 660, 70, [
          ["두 배가 되는 기간", Td.toFixed(1) + " 일"],
          ["병상이 모자라는 날", over === null ? "60일 안에는 없음" : Math.ceil(over) + "일째", over === null ? "--green-700" : "--rose-700"],
          ["60일째 입원 환자", n60 >= 1e6 ? (n60 / 1e6).toFixed(1) + " 백만" : Math.round(n60).toLocaleString() + " 명", n60 <= 5000 ? "--green-700" : "--rose-700", true]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "세로 눈금", value: "lin", options: [{ v: "lin", t: "보통 눈금" }, { v: "log", t: "로그 눈금" }],
        onPick: function (x) { scale = x; draw(); } });
      api.slider({ label: "두 배가 되는 기간 (방역 세기)", min: 3, max: 20, step: 0.5, value: 3, fmt: function (x) { return x.toFixed(1) + " 일"; },
        onInput: function (x) { Td = x; draw(); } });
      api.info("로그 눈금에서는 ‘일정한 비율로 늘어나는’ 그래프가 <b>곧은 선</b>이 됩니다. 기울기가 곧 늘어나는 빠르기예요.");
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
      "100 → 5000 은 50배, 2⁵ = 32 이고 2⁶ = 64 이니 두 배는 약 5.6번까지. 60일 ÷ 5.6 ≈ 10.6일."
    ],
    solution: "두 배가 되는 기간을 <b>11 ~ 12일</b>로 늘리세요. 대책이 없으면 <b>17일째</b>에 병상이 모자랍니다.",
    why: "일정한 <b>비율</b>로 늘어나는 것(지수적 증가)은 처음엔 느려 보이다가 갑자기 폭발합니다. 하루 33명씩 ‘더하는’ 증가라면 150일이 걸릴 일이, 3일마다 ‘곱하는’ 증가에서는 17일이면 닥치지요.<br>" +
      "그래서 감염병 자료는 <b>로그 눈금</b>으로 보는 일이 많습니다. 곧은 선의 기울기가 곧 번지는 빠르기이고, 방역의 효과는 기울기가 눕는 것으로 드러납니다. 자료에서 규칙을 찾아 <b>앞날을 예측</b>하는 것이 빅데이터가 방역에 쓰이는 방식입니다."
  }
  ]
});
})();
