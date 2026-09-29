/* 통합과학2 Ⅱ-1 생태계와 환경 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 비생물 요인(온도) → 생물 */
  {
    id: "c1", tag: "비생물 요인", title: "바다거북 부화장의 그늘막", short: "거북 성비",
    who: "🐢", name: "바다거북 보호 센터",
    say: "“바다거북은 알이 묻힌 <b>모래의 온도</b>로 새끼의 암수가 정해져요. 약 <b>29 ℃</b> 면 암수가 반반, 더 따뜻하면 암컷, 더 서늘하면 수컷이 많아집니다. 요즘 여름이 뜨거워져 부화장 새끼가 거의 다 암컷이에요. 그늘막으로 온도를 낮춰 <b>암컷 40 ~ 60%</b> 를 맞춰 주세요.”",
    predict: {
      q: "새끼 암수가 온도로 정해지는 바다거북에게 기온 상승이 계속되면, 먼저 생길 문제는?",
      options: ["㉠ 알을 더 많이 낳게 되어 개체 수가 폭발한다", "㉡ 한쪽 성만 태어나 다음 세대에 짝을 찾기 어려워진다", "㉢ 성비는 유전자로 정해지므로 아무 영향이 없다"],
      answer: 1
    },
    task: "모래 종류와 그늘막 가림 정도를 조절해 <b>암컷 비율 40 ~ 60%</b> 를 맞추세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var SAND = { light: { t: "밝은 산호 모래", d: -1, c: "#e9dcc0" }, dark: { t: "검은 화산 모래", d: 1.5, c: "#6b625a" } };
      var sand = "dark", shade = 0;
      function temp() { return 31.5 - 0.05 * shade + SAND[sand].d; }
      function fem(T) { return 1 / (1 + Math.exp(-(T - 29) / 0.6)); }
      var gx0 = 520, gx1 = 850, gy0 = 70, gy1 = 250;
      function GX(T) { return gx0 + (T - 26) / 8 * (gx1 - gx0); }
      function GY(p) { return gy1 - p * (gy1 - gy0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var T = temp(), f = fem(T);
        H.text(ctx, "부화장 단면", 40, 30, { s: 14, w: "900" });
        H.text(ctx, "☀️", 60, 76, { s: 28 });
        H.box(ctx, 110, 90, 320, 8, H.v("--teal"), 0.25 + shade / 100 * 0.7);
        H.text(ctx, "그늘막 " + shade + "%", 440, 98, { s: 11.5, w: "800", c: H.v("--teal-700") });
        ctx.fillStyle = SAND[sand].c; ctx.fillRect(80, 150, 380, 130);
        for (var i = 0; i < 20; i++) {
          var x = 110 + (i % 10) * 34, y = 200 + Math.floor(i / 10) * 40, isF = i < Math.round(f * 20);
          ctx.fillStyle = "#fbf6e8"; ctx.beginPath(); ctx.ellipse(x, y, 13, 16, 0, 0, Math.PI * 2); ctx.fill();
          H.text(ctx, isF ? "♀" : "♂", x, y + 6, { s: 15, w: "900", a: "center", c: isF ? H.v("--rose-700") : H.v("--brand-700") });
        }
        H.text(ctx, SAND[sand].t + " · 알 둥지 깊이 온도 " + T.toFixed(2) + " ℃", 80, 306, { s: 12.5, w: "800" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        H.text(ctx, "모래 온도 → 암컷 비율", gx0, gy0 - 14, { s: 12, w: "800", c: H.v("--mist") });
        H.box(ctx, gx0, GY(0.6), gx1 - gx0, GY(0.4) - GY(0.6), H.v("--green"), 0.18);
        var pts = []; for (var t = 26; t <= 34; t += 0.1) pts.push([GX(t), GY(fem(t))]);
        H.line(ctx, pts, H.v("--rose"), 2.5);
        [26, 28, 30, 32, 34].forEach(function (t) { H.text(ctx, t + " ℃", GX(t), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        H.text(ctx, "100%", gx0 - 6, gy0 + 4, { s: 10, a: "right", c: H.v("--mist") });
        H.text(ctx, "0%", gx0 - 6, gy1 + 4, { s: 10, a: "right", c: H.v("--mist") });
        var cx = H.clamp(GX(T), gx0, gx1);
        H.dot(ctx, cx, GY(f), 6, H.v("--rose-700"));
        H.text(ctx, "암컷 " + (f * 100).toFixed(0) + "%", gx0 + 10, gy1 + 44, { s: 16, w: "900", c: f >= 0.4 && f <= 0.6 ? H.v("--green-700") : H.v("--rose-700") });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "모래", value: "dark", options: [{ v: "light", t: "밝은 산호 모래" }, { v: "dark", t: "검은 화산 모래" }],
        onPick: function (x) { sand = x; draw(); } });
      api.slider({ label: "그늘막 가림 정도", min: 0, max: 100, step: 1, value: 0, fmt: function (x) { return x + "%"; },
        onInput: function (x) { shade = x; draw(); } });
      api.info("어두운 모래는 햇빛을 더 흡수해 뜨겁고, 그늘막은 모래를 식힙니다. 곡선의 가파른 부분을 보세요 — 1 ℃ 차이가 얼마나 큰가요?");
      draw();
      return {
        judge: function () {
          var T = temp(), f = fem(T);
          if (f >= 0.4 && f <= 0.6) return { ok: true, msg: SAND[sand].t + " · 그늘막 " + shade + "% → " + T.toFixed(2) + " ℃ · 암컷 " + (f * 100).toFixed(0) + "% — 암수가 고르게 태어납니다." };
          return { ok: false, msg: T.toFixed(2) + " ℃ · 암컷 " + (f * 100).toFixed(0) + "% — " + (f > 0.6 ? "아직 너무 따뜻합니다." : "너무 서늘해져 수컷이 많습니다.") };
        }
      };
    },
    hints: [
      "목표 온도는 약 <b>29 ℃</b>. 곡선이 가파라서 0.3 ℃ 만 벗어나도 비율이 크게 기웁니다.",
      "그늘막 1% 마다 0.05 ℃ 씩 내려갑니다. 모래마다 29 ℃ 가 되는 그늘막 값이 다르니, 모래를 먼저 고르고 천천히 맞추세요."
    ],
    solution: "밝은 산호 모래면 그늘막 <b>약 30%</b>(26 ~ 34%), 검은 화산 모래면 <b>약 80%</b>(76 ~ 84%)입니다.",
    why: "온도·빛·물 같은 <b>비생물 요인</b>은 생물의 생김새뿐 아니라 번식에까지 영향을 줍니다. 같은 나무에서도 햇빛을 받는 잎과 그늘 잎의 두께가 달랐던 것처럼요.<br>" +
      "바다거북처럼 온도로 성이 정해지는 생물에게는 기온이 1 ~ 2 ℃ 오르는 것만으로도 <b>개체군 전체의 성비</b>가 무너질 수 있습니다. 실제로 호주 북부의 한 바다거북 무리에서는 새끼의 99% 가 암컷으로 나타났습니다. " +
      "그래서 2 ℃ 의 문턱은 사람만의 문제가 아니에요. ※ 모래 온도 계산은 수업용 모형입니다."
  },

  /* ------------------------------------------------------------------ 2. 생물 농축 */
  {
    id: "c2", tag: "먹이 사슬 · 생물 농축", title: "물수리 알이 깨지는 호수", short: "생물 농축",
    who: "🦅", name: "환경청 수질 담당",
    say: "“호숫가 물수리 알 껍데기가 얇아져 품다가 깨져요. 원인은 농약 성분이 쌓인 것으로 보입니다. 물수리 몸속 농도가 <b>5 ppm</b> 을 넘으면 껍데기가 얇아진다고 해요. 공장에 줄 <b>물 속 배출 기준</b>을 정해야 하는데, 너무 엄격하면 공장이 문을 닫는대요. 물수리가 안전한 선에서 <b>가장 느슨한</b> 기준을 찾아 주세요.”",
    predict: {
      q: "호수 물 속 농약 농도가 0.00001 ppm 처럼 아주 낮다면, 먹이 사슬 꼭대기 물수리의 몸속 농도는?",
      options: ["㉠ 물과 비슷하게 아주 낮다", "㉡ 먹이 단계를 거칠 때마다 쌓여 훨씬 높아진다", "㉢ 먹고 먹히는 동안 분해되어 0 이 된다"],
      answer: 1
    },
    task: "물 속 농도 기준을 정해 <b>물수리 5 ppm 이하</b>를 지키면서 가장 느슨하게(물수리 2.5 ppm 이상) 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var lg = -4;
      var CH = [["물", 1, "💧"], ["플랑크톤", 1000, "🦠"], ["작은 물고기", 10, "🐟"], ["큰 물고기", 10, "🐠"], ["물수리", 10, "🦅"]];
      function levels() { var c = Math.pow(10, lg), out = []; CH.forEach(function (k) { c *= k[1]; out.push(c); }); return out; }
      function fmt(c) { return c >= 1 ? c.toFixed(2) : (c >= 0.001 ? c.toFixed(4) : c.toExponential(1)); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var L = levels();
        H.text(ctx, "먹이 사슬 단계별 몸속 농도 (ppm, 눈금 한 칸 = 10배)", 40, 30, { s: 14, w: "900" });
        var x0 = 200, x1 = 820;
        function X(c) { return x0 + (H.log10(c) + 9) / 12 * (x1 - x0); }
        [-8, -6, -4, -2, 0, 2].forEach(function (e) {
          H.dash(ctx, X(Math.pow(10, e)), 52, X(Math.pow(10, e)), 290, H.v("--line"), 1);
          H.text(ctx, e === 0 ? "1" : "10^" + e, X(Math.pow(10, e)), 308, { s: 10, a: "center", c: H.v("--mist") });
        });
        H.line(ctx, [[X(5), 52], [X(5), 290]], H.v("--rose"), 2.5);
        H.text(ctx, "5 ppm", X(5) + 6, 62, { s: 11, w: "800", c: H.v("--rose-700") });
        L.forEach(function (c, i) {
          var y = 80 + i * 44, bad = i === 4 && c > 5;
          H.text(ctx, CH[i][2] + " " + CH[i][0], 40, y + 14, { s: 13, w: "800" });
          H.box(ctx, x0, y, Math.max(2, X(c) - x0), 22, bad ? H.v("--rose") : H.v(i === 4 ? "--green" : "--teal"), 0.7);
          H.text(ctx, fmt(c), Math.min(X(c) + 8, 800), y + 16, { s: 11.5, w: "800", a: X(c) + 8 > 800 ? "right" : "left" });
          if (i > 0) H.text(ctx, "×" + CH[i][1], x0 - 8, y + 16, { s: 10.5, a: "right", c: H.v("--mist") });
        });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "물 속 배출 기준 (10의 지수)", min: -8, max: -3, step: 0.1, value: -4,
        fmt: function (x) { return Math.pow(10, x).toExponential(1) + " ppm"; },
        onInput: function (x) { lg = Math.round(x * 10) / 10; draw(); } });
      api.info("농약 성분은 지방에 녹아 몸 밖으로 잘 빠져나가지 않습니다. 한 단계 위 생물은 아래 생물을 <b>아주 많이</b> 먹지요.");
      draw();
      return {
        judge: function () {
          var top = levels()[4];
          if (top > 5) return { ok: false, msg: "물수리 " + fmt(top) + " ppm — 알 껍데기가 얇아집니다." };
          if (top >= 2.5) return { ok: true, msg: "물 " + Math.pow(10, lg).toExponential(1) + " ppm → 물수리 " + fmt(top) + " ppm — 백만 배로 쌓여도 기준 아래입니다." };
          return { ok: false, msg: "물수리 " + fmt(top) + " ppm — 안전하지만 필요 이상으로 엄격합니다. 조금 더 느슨하게 해도 됩니다." };
        }
      };
    },
    hints: [
      "막대에 적힌 배율을 모두 곱해 보세요. 물에서 물수리까지 농도가 <b>몇 배</b>로 커지나요?",
      "1000 × 10 × 10 × 10 = 1,000,000 배. 물수리가 5 ppm 이하가 되려면 물은 5 ÷ 1,000,000 ppm 이하여야 합니다."
    ],
    solution: "물 속 기준을 <b>약 2.5 × 10⁻⁶ ~ 4 × 10⁻⁶ ppm</b>(지수 −5.6 ~ −5.4)에 두세요.",
    why: "분해되지 않고 몸에 쌓이는 물질은 먹이 사슬의 단계를 오를 때마다 농도가 커집니다 — <b>생물 농축</b>입니다. 한 단계 위 생물은 아래 생물을 몸무게의 몇 배나 먹으니까요.<br>" +
      "그래서 물속에서는 거의 없는 것처럼 보이는 양도 <b>최종 소비자</b>에게는 위험해집니다. 늑대가 사라졌을 때 먹이그물 전체가 흔들렸던 것처럼, 꼭대기 포식자의 위기는 생태계 평형 전체의 위기가 됩니다. " +
      "1960년대 미국에서 DDT 때문에 흰머리수리가 사라질 뻔했고, 사용을 금지한 뒤 되살아났습니다. ※ 단계별 배율은 수업용 값입니다."
  },

  /* ------------------------------------------------------------------ 3. 해빙과 빙상 */
  {
    id: "c3", tag: "지구 환경 변화", title: "녹는 얼음과 해수면 뉴스", short: "해빙 vs 빙상",
    who: "📰", name: "과학 기자",
    say: "“기사 초안에 ‘<b>북극 바다 얼음</b> 2만 km³ 가 녹으면 해수면이 5 cm 오른다’고 썼는데, 데스크가 틀렸다고 해요. 정말 해수면을 <b>5.0 ~ 5.5 cm</b> 올리는 것은 어떤 얼음이 얼마나 녹을 때인지 확인해 주세요. 바다 넓이는 3.61억 km², 얼음 밀도는 물의 0.917배입니다.”",
    predict: {
      q: "물 컵에 떠 있는 얼음이 모두 녹으면 컵의 수면은?",
      options: ["㉠ 올라간다", "㉡ 그대로다", "㉢ 내려간다"],
      answer: 1
    },
    task: "얼음 종류와 녹는 부피를 정해 <b>해수면이 5.0 ~ 5.5 cm</b> 오르게 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var kind = "sea", V = 20000;
      function rise() { return kind === "land" ? V * 0.917 / 3.61e8 * 1e5 : 0; }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "두 컵으로 본 모형 — 녹은 만큼 얼음이 작아집니다", 40, 30, { s: 14, w: "900" });
        var k = V / 40000;
        [[160, "sea", "바다에 떠 있는 얼음 (해빙)"], [420, "land", "땅 위의 얼음 (빙상)"]].forEach(function (c) {
          var x = c[0], on = kind === c[1], w0 = 150, lvl = 220 - (c[1] === "land" && on ? Math.min(40, rise() * 5) : 0);
          ctx.strokeStyle = on ? H.v("--brand-700") : H.v("--line"); ctx.lineWidth = on ? 3 : 2;
          ctx.beginPath(); ctx.moveTo(x - w0 / 2, 80); ctx.lineTo(x - w0 / 2, 280); ctx.lineTo(x + w0 / 2, 280); ctx.lineTo(x + w0 / 2, 80); ctx.stroke();
          H.box(ctx, x - w0 / 2 + 2, lvl, w0 - 4, 278 - lvl, H.v("--brand"), 0.3);
          H.dash(ctx, x - w0 / 2 - 14, 220, x + w0 / 2 + 14, 220, H.v("--mist"));
          var s = 60 * (1 - (on ? k : 0)) + 8;
          if (c[1] === "sea") H.box(ctx, x - s / 2, 220 - s * 0.083, s, s * 0.917 * 0.6, H.v("--foam"), 0.95);
          else {
            ctx.fillStyle = H.v("--mist"); ctx.beginPath(); ctx.moveTo(x - 50, 280); ctx.lineTo(x + 50, 280); ctx.lineTo(x + 30, 170); ctx.lineTo(x - 30, 170); ctx.closePath(); ctx.fill();
            H.box(ctx, x - s / 2, 170 - s * 0.6, s, s * 0.6, H.v("--foam"), 0.95);
          }
          H.text(ctx, c[2], x, 304, { s: 12, w: "800", a: "center", c: on ? H.v("--brand-700") : H.v("--mist") });
        });
        var r = rise();
        H.rows(ctx, 620, 80, [
          ["녹은 얼음", (V / 1000).toFixed(0) + " 천 km³"],
          ["바다에 더해진 물의 부피", kind === "land" ? (V * 0.917 / 1000).toFixed(1) + " 천 km³" : "0 (이미 바다를 밀어내고 있었음)"],
          ["해수면 상승", r.toFixed(2) + " cm", r >= 5 && r <= 5.5 ? "--green-700" : "--rose-700", true]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "녹는 얼음", value: "sea", options: [{ v: "sea", t: "북극 바다 얼음" }, { v: "land", t: "그린란드 빙상" }],
        onPick: function (x) { kind = x; draw(); } });
      api.slider({ label: "녹는 얼음의 부피", min: 0, max: 40000, step: 1000, value: 20000, fmt: function (x) { return (x / 1000) + " 천 km³"; },
        onInput: function (x) { V = x; draw(); } });
      api.info("떠 있는 얼음은 자기 무게만큼의 물을 이미 밀어내고 있습니다. 녹아서 물이 되면 그 부피가 얼마인가요?");
      draw();
      return {
        judge: function () {
          var r = rise();
          if (kind === "sea") return { ok: false, msg: "바다 얼음은 아무리 녹아도 해수면이 거의 그대로입니다 — 기사가 틀린 까닭이지요." };
          if (r >= 5 && r <= 5.5) return { ok: true, msg: "그린란드 빙상 " + (V / 1000) + " 천 km³ → 해수면 " + r.toFixed(2) + " cm. 땅 위 얼음이 녹아 바다로 들어올 때만 해수면이 오릅니다." };
          return { ok: false, msg: "해수면 " + r.toFixed(2) + " cm — 5.0 ~ 5.5 cm 가 되도록 부피를 조절하세요." };
        }
      };
    },
    hints: [
      "떠 있는 얼음은 녹기 전부터 <b>자기 무게만큼의 바닷물을 밀어내고</b> 있습니다. 녹아서 생긴 물은 딱 그 자리를 채울 뿐이에요.",
      "땅 위 얼음은 녹아서 <b>새로</b> 바다에 들어옵니다. 늘어난 물 부피 ÷ 바다 넓이 = 상승 높이. 1천 km³ 가 녹으면 약 0.25 cm 오릅니다."
    ],
    solution: "<b>그린란드 빙상</b>을 고르고 <b>20 ~ 21 천 km³</b> 를 녹이세요.",
    why: "물에 떠 있는 얼음은 <b>자기 무게만큼의 물을 밀어냅니다</b>. 녹아서 물이 되면 밀어내던 부피와 똑같아지므로 수면이 그대로예요. 그래서 북극 바다 얼음(해빙)이 녹는 것은 해수면을 거의 올리지 않습니다.<br>" +
      "해수면을 올리는 것은 그린란드·남극 대륙처럼 <b>땅 위의 얼음(빙상·빙하)</b>과, 따뜻해진 바닷물의 <b>열팽창</b>입니다. 다만 해빙이 녹으면 햇빛을 반사하던 하얀 면이 줄어 지구가 더 데워지니, 다른 방식으로 기후 변화를 부추깁니다. " +
      "※ 그린란드 빙상 전체는 약 290 만 km³, 모두 녹으면 해수면이 약 7 m 오릅니다."
  }
  ]
});
})();
