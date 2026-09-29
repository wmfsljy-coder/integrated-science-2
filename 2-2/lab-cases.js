/* 통합과학2 Ⅱ-2 에너지 전환과 발전 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 전자기 유도 */
  {
    id: "c1", tag: "발전기 · 전자기 유도", title: "손으로 돌리는 충전기", short: "손 발전기",
    who: "🔦", name: "캠핑용품 개발팀",
    say: "“정전이나 캠핑 때 쓸 손잡이 발전기를 만들어요. 휴대폰을 충전하려면 <b>6 V (± 0.3 V)</b> 가 필요합니다. 그런데 사람이 오래 편하게 돌릴 수 있는 건 <b>1분에 40바퀴</b>까지예요. 코일과 자석을 골라 주세요.”",
    predict: {
      q: "같은 빠르기로 돌릴 때, 코일을 두 배로 많이 감으면 만들어지는 전압은?",
      options: ["㉠ 절반이 된다", "㉡ 그대로다", "㉢ 두 배가 된다"],
      answer: 2
    },
    task: "코일 감은 수, 자석, 돌리는 빠르기를 정해 <b>1분에 40바퀴 이하로 5.7 ~ 6.3 V</b> 를 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var N = 100, mag = 1, rpm = 60, ang = 0;
      var run = api.ticker();
      var K = 0.16755 / 400;
      function volt() { return K * N * mag * rpm; }
      function draw() {
        H.paper(ctx, W, cv.H);
        var V = volt();
        H.text(ctx, "코일 속에서 도는 자석", 40, 30, { s: 14, w: "900" });
        var cx = 180, cy = 170;
        var turns = N / 25;
        for (var i = 0; i < turns; i++) {
          ctx.strokeStyle = H.v("--amber-700"); ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.ellipse(cx - 70 + i * (140 / turns), cy, 6, 80, 0, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
        ctx.fillStyle = H.v("--rose"); ctx.fillRect(-10, -56, 20, 56);
        ctx.fillStyle = H.v("--brand"); ctx.fillRect(-10, 0, 20, 56);
        ctx.restore();
        H.text(ctx, "코일 " + N + "회 · " + (mag === 2 ? "강한 네오디뮴 자석" : "보통 페라이트 자석"), cx, 290, { s: 12, w: "800", a: "center", c: H.v("--mist") });
        /* 전압 파형 */
        var gx0 = 360, gx1 = 640, gy = 170;
        H.axes(ctx, gx0, 70, gx1, 270);
        H.dash(ctx, gx0, gy, gx1, gy, H.v("--line"));
        var pts = [], cyc = rpm / 60 * 2;
        for (var x = 0; x <= 280; x += 2) pts.push([gx0 + x, gy - Math.sin(x / 280 * cyc * Math.PI * 2 + ang) * Math.min(95, V * 10)]);
        if (rpm > 0) H.line(ctx, pts, H.v("--violet"), 2.5);
        H.text(ctx, "2초 동안의 전압", gx0, 60, { s: 11.5, w: "800", c: H.v("--mist") });
        var ok = V >= 5.7 && V <= 6.3;
        H.rows(ctx, 680, 80, [
          ["돌리는 빠르기", rpm + " 바퀴/분", rpm > 40 ? "--rose-700" : null],
          ["최대 전압", V.toFixed(2) + " V", ok ? "--green-700" : "--rose-700", true],
          ["휴대폰 충전", ok ? "가능 🔋" : (V > 6.3 ? "전압이 너무 높음" : "전압이 모자람"), ok ? "--green-700" : "--mist"]
        ], 60);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "코일 감은 수", value: 100, options: [{ v: 100, t: "100회" }, { v: 200, t: "200회" }, { v: 400, t: "400회" }],
        onPick: function (x) { N = x; draw(); } });
      api.seg({ label: "자석", value: 1, options: [{ v: 1, t: "보통 페라이트" }, { v: 2, t: "강한 네오디뮴 (2배)" }],
        onPick: function (x) { mag = x; draw(); } });
      api.slider({ label: "돌리는 빠르기", min: 0, max: 120, step: 5, value: 60, fmt: function (x) { return x + " 바퀴/분"; },
        onInput: function (x) { rpm = x; draw(); } });
      api.button("▶ 돌려 보기", function () { run(60, 30, function (k) { ang = k * Math.PI * 2 * rpm / 60 * 1.8; draw(); }); });
      api.info("코일을 지나는 자기장이 <b>빨리, 많이</b> 변할수록 전압이 커집니다. 무엇을 바꾸면 자기장의 변화가 커질까요?");
      draw();
      return {
        judge: function () {
          var V = volt();
          if (rpm > 40) return { ok: false, msg: rpm + " 바퀴/분 — 사람이 오래 돌리기에는 너무 빠릅니다(40 이하)." };
          if (V >= 5.7 && V <= 6.3) return { ok: true, msg: "코일 " + N + "회 · " + (mag === 2 ? "네오디뮴" : "페라이트") + " · " + rpm + " 바퀴/분 → " + V.toFixed(2) + " V — 충전할 수 있습니다." };
          return { ok: false, msg: V.toFixed(2) + " V — " + (V > 6.3 ? "너무 높습니다." : "모자랍니다.") };
        }
      };
    },
    hints: [
      "전압은 <b>감은 수 × 자석 세기 × 빠르기</b>에 비례합니다. 빠르기를 40 이하로 묶어 두었으니 나머지 둘을 키워야 해요.",
      "코일 100회·페라이트·40 바퀴/분이면 약 1.7 V. 6 V 가 되려면 대략 3.5배가 필요합니다. 감은 수와 자석을 어떻게 조합하면 될까요?"
    ],
    solution: "<b>400회 · 페라이트 · 35 바퀴/분</b>(5.86 V) 또는 <b>200회 · 네오디뮴 · 35 바퀴/분</b>(5.86 V).",
    why: "코일을 지나는 자기장이 변하면 코일에 전류가 흐릅니다 — <b>전자기 유도</b>. 만들어지는 전압은 <b>코일 감은 수</b>, <b>자석의 세기</b>, <b>변하는 빠르기</b>가 클수록 커집니다.<br>" +
      "발전소의 거대한 발전기도 원리는 똑같습니다. 불 꺼진 섬에서 디젤·풍력·태양광을 비교했지만, 태양광을 뺀 대부분의 발전은 결국 <b>무언가로 터빈(자석)을 돌리는 일</b>이에요. 무엇으로 돌리느냐가 다를 뿐입니다."
  },

  /* ------------------------------------------------------------------ 2. 송전 손실 */
  {
    id: "c2", tag: "전력 수송", title: "200 km 송전선 설계", short: "송전 전압",
    who: "🗼", name: "전력 회사 설계부",
    say: "“해안 발전소에서 <b>100 MW</b> 를 200 km 떨어진 도시로 보내야 해요. 전선에서 열로 잃는 전력은 <b>1% 미만</b>이어야 합니다. 전압이 높을수록 철탑이 비싸고, 전선이 굵을수록 전선값이 비싸요. 조건을 지키면서 <b>건설비가 가장 적은</b> 조합을 찾아 주세요.”",
    predict: {
      q: "같은 전력을 보낼 때 송전 전압을 2배로 올리면, 전선에서 열로 잃는 전력은?",
      options: ["㉠ 2배가 된다", "㉡ 절반이 된다", "㉢ 4분의 1이 된다"],
      answer: 2
    },
    task: "송전 전압과 전선 굵기를 골라 <b>손실 1% 미만 · 건설비 최소</b>를 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var VOL = { 22.9: 1.0, 66: 1.5, 154: 2.2, 345: 3.5, 765: 7.0 };
      var WIRE = { thin: { t: "가는 선", r: 0.05, c: 0.5 }, std: { t: "보통 선", r: 0.03, c: 1.0 }, thick: { t: "굵은 선", r: 0.015, c: 2.2 } };
      var kv = 154, wire = "thick", P = 100e6;
      function calc(k, w) {
        var R = WIRE[w].r * 200, I = P / (k * 1000), loss = I * I * R / P;
        return { R: R, I: I, loss: loss, cost: VOL[k] + WIRE[w].c };
      }
      function best() {
        var b = null;
        Object.keys(VOL).forEach(function (k) { Object.keys(WIRE).forEach(function (w) {
          var c = calc(+k, w); if (c.loss < 0.01 && (!b || c.cost < b.cost)) b = { k: +k, w: w, cost: c.cost };
        }); });
        return b;
      }
      function draw() {
        H.paper(ctx, W, cv.H);
        var c = calc(kv, wire);
        H.text(ctx, "발전소 → 200 km → 도시", 40, 30, { s: 14, w: "900" });
        H.text(ctx, "🏭", 70, 150, { s: 34, a: "center" });
        H.text(ctx, "🏙️", 540, 150, { s: 34, a: "center" });
        var glow = Math.min(1, c.loss * 8);
        ctx.strokeStyle = "rgba(239,68,68," + (0.25 + glow * 0.75) + ")"; ctx.lineWidth = 2 + (wire === "thick" ? 4 : wire === "std" ? 2.5 : 1);
        ctx.beginPath(); ctx.moveTo(100, 120); ctx.quadraticCurveTo(300, 170, 510, 120); ctx.stroke();
        for (var i = 1; i <= 3; i++) H.text(ctx, "🗼", 100 + i * 102, 140, { s: 22, a: "center" });
        if (glow > 0.2) H.text(ctx, "♨ 전선이 뜨거워짐", 305, 196, { s: 12, w: "800", a: "center", c: H.v("--rose-700") });
        H.text(ctx, "흐르는 전류 I = P ÷ V = " + c.I.toFixed(0) + " A", 60, 240, { s: 13, w: "800", c: H.v("--brand-700") });
        H.text(ctx, "전선 저항 R = " + c.R.toFixed(0) + " Ω   →   잃는 전력 = I² × R", 60, 266, { s: 13, w: "800", c: H.v("--mist") });
        H.text(ctx, "※ 건설비·저항은 수업용 어림값", 60, 300, { s: 11, c: H.v("--mist") });
        var lossTxt = c.loss >= 1 ? "보낼 수 없음" : (c.loss * 100).toFixed(2) + "%";
        H.rows(ctx, 660, 70, [
          ["전선에서 잃는 전력", lossTxt, c.loss < 0.01 ? "--green-700" : "--rose-700", true],
          ["건설비 (억 원 / km)", c.cost.toFixed(1)],
          ["철탑 · 전선", VOL[kv].toFixed(1) + " + " + WIRE[wire].c.toFixed(1)]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "송전 전압", value: 154, options: [{ v: 22.9, t: "22.9 kV" }, { v: 66, t: "66 kV" }, { v: 154, t: "154 kV" }, { v: 345, t: "345 kV" }, { v: 765, t: "765 kV" }],
        onPick: function (x) { kv = x; draw(); } });
      api.seg({ label: "전선 굵기", value: "thick", options: [{ v: "thin", t: "가는 선" }, { v: "std", t: "보통 선" }, { v: "thick", t: "굵은 선" }],
        onPick: function (x) { wire = x; draw(); } });
      api.info("굵은 선은 저항이 작고, 높은 전압은 <b>같은 전력을 더 작은 전류로</b> 보냅니다. 어느 쪽이 손실을 더 크게 줄일까요?");
      draw();
      return {
        judge: function () {
          var c = calc(kv, wire), b = best();
          if (c.loss >= 0.01) return { ok: false, msg: "손실 " + (c.loss >= 1 ? "100% 이상" : (c.loss * 100).toFixed(2) + "%") + " — 1% 를 넘습니다." };
          if (c.cost > b.cost + 1e-9) return { ok: false, msg: "손실 " + (c.loss * 100).toFixed(2) + "% 로 조건은 지켰지만, 건설비 " + c.cost.toFixed(1) + " 억/km — 더 싼 조합이 있습니다." };
          return { ok: true, msg: kv + " kV · " + WIRE[wire].t + " → 손실 " + (c.loss * 100).toFixed(2) + "% · 건설비 " + c.cost.toFixed(1) + " 억/km — 가장 경제적인 조합입니다." };
        }
      };
    },
    hints: [
      "154 kV 에 굵은 선을 써도 손실이 1% 를 넘습니다. 전선을 굵게 하는 것만으로는 한계가 있어요.",
      "잃는 전력 = I² R 이고 I = P ÷ V 이므로 <b>손실은 V² 에 반비례</b>합니다. 전압을 올리면 가는 선으로도 충분할지 모릅니다."
    ],
    solution: "<b>345 kV · 가는 선</b> — 손실 0.84%, 건설비 4.0 억/km.",
    why: "같은 전력(P = VI)을 보낼 때 전압을 높이면 <b>전류가 줄어듭니다</b>. 전선에서 열로 잃는 전력은 <b>I²R</b> 이라 전류가 절반이면 손실은 4분의 1이 되지요. 전선을 두 배 굵게 해도 손실은 절반밖에 줄지 않습니다.<br>" +
      "그래서 발전소는 <b>변압기로 전압을 수십만 볼트로 올려</b> 보내고, 도시 가까이서 다시 낮춥니다. 불 꺼진 섬에 육지 전기를 끌어오려면 이 손실까지 계산해야 하는 까닭입니다."
  },

  /* ------------------------------------------------------------------ 3. 위치 에너지 → 전기 에너지 */
  {
    id: "c3", tag: "에너지 전환 · 효율", title: "산골 마을 소수력 발전", short: "소수력",
    who: "💧", name: "산골 마을 이장",
    say: "“마을 앞 계곡에 작은 댐을 막아 전기를 만들려 해요. 마을에는 <b>2.0 ~ 2.2 MW</b> 가 필요합니다. 계곡물은 초당 <b>15 m³</b>. 물고기가 살려면 초당 <b>3 m³</b> 는 그대로 흘려보내야 하고, 댐 높이가 <b>25 m</b> 를 넘으면 윗마을 논이 잠겨요. 발전기 효율은 85% 입니다.”",
    predict: {
      q: "같은 양의 물을 더 높은 곳에서 떨어뜨리면 발전량이 느는 까닭은?",
      options: ["㉠ 물의 양이 늘어나서", "㉡ 물 1 kg 이 가진 위치 에너지가 커져서", "㉢ 물이 더 차가워져서"],
      answer: 1
    },
    task: "댐 높이와 발전에 쓸 물의 양을 정해 <b>2.0 ~ 2.2 MW</b> 를 만드세요. 물고기와 윗마을을 지켜야 합니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var h = 10, Q = 6;
      function power() { return 0.85 * 1000 * 9.8 * Q * h; }
      function draw() {
        H.paper(ctx, W, cv.H);
        var P = power(), left = 15 - Q;
        H.text(ctx, "댐 단면", 40, 30, { s: 14, w: "900" });
        var base = 290, sc = 5.5, top = base - h * sc;
        H.box(ctx, 60, top, 230, base - top, H.v("--brand"), 0.35);
        ctx.fillStyle = H.v("--mist"); ctx.fillRect(290, top - 6, 24, base - top + 6);
        H.line(ctx, [[60, base - 25 * sc], [290, base - 25 * sc]], H.v("--rose"), 1.5);
        H.text(ctx, "25 m (윗마을 논)", 64, base - 25 * sc - 6, { s: 10.5, w: "800", c: H.v("--rose-700") });
        H.text(ctx, h + " m", 250, top - 8, { s: 12, w: "900", a: "right", c: H.v("--brand-700") });
        if (h > 25) H.text(ctx, "🌾 잠김!", 150, 60, { s: 13, w: "900", a: "center", c: H.v("--rose-700") });
        H.arrow(ctx, 314, base - 20, 380, base - 20, H.v("--brand"), 2 + Q / 2, 10);
        H.text(ctx, "⚙️", 400, base - 12, { s: 24, a: "center" });
        H.text(ctx, "발전에 " + Q.toFixed(1) + " m³/s", 360, base + 22, { s: 11.5, w: "800", a: "center", c: H.v("--brand-700") });
        H.text(ctx, left >= 3 ? "🐟 물고기 길 " + left.toFixed(1) + " m³/s" : "🐟 물고기 길이 말랐다 (" + left.toFixed(1) + ")", 460, 250,
          { s: 12, w: "800", c: left >= 3 ? H.v("--green-700") : H.v("--rose-700") });
        H.rows(ctx, 620, 70, [
          ["물 1 kg 의 위치 에너지", (9.8 * h).toFixed(0) + " J"],
          ["1초에 떨어지는 물", (Q * 1000).toFixed(0) + " kg"],
          ["전기 출력 (효율 85%)", (P / 1e6).toFixed(3) + " MW", P >= 2e6 && P <= 2.2e6 ? "--green-700" : "--rose-700", true]
        ], 60);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "댐 높이 (떨어지는 높이)", min: 5, max: 40, step: 1, value: 10, fmt: function (x) { return x + " m"; },
        onInput: function (x) { h = x; draw(); } });
      api.slider({ label: "발전에 쓸 물의 양", min: 0, max: 15, step: 0.5, value: 6, fmt: function (x) { return x.toFixed(1) + " m³/s"; },
        onInput: function (x) { Q = x; draw(); } });
      api.info("1초 동안 떨어지는 물의 위치 에너지 = 질량 × 9.8 × 높이. 이 가운데 85% 가 전기가 됩니다. 물 1 m³ 는 1000 kg.");
      draw();
      return {
        judge: function () {
          var P = power();
          if (h > 25) return { ok: false, msg: "댐 " + h + " m — 윗마을 논이 잠깁니다." };
          if (15 - Q < 3) return { ok: false, msg: "물고기 길에 " + (15 - Q).toFixed(1) + " m³/s 만 남습니다. 3 m³/s 는 남겨야 해요." };
          if (P >= 2e6 && P <= 2.2e6) return { ok: true, msg: "높이 " + h + " m · 물 " + Q.toFixed(1) + " m³/s → " + (P / 1e6).toFixed(3) + " MW — 마을에 충분합니다." };
          return { ok: false, msg: (P / 1e6).toFixed(3) + " MW — " + (P > 2.2e6 ? "너무 큽니다(발전기 용량 초과)." : "모자랍니다.") };
        }
      };
    },
    hints: [
      "쓸 수 있는 물은 최대 15 − 3 = <b>12 m³/s</b>, 높이는 최대 <b>25 m</b>. 이 두 제한 안에서 곱을 키워야 해요.",
      "출력 = 0.85 × 1000 × 9.8 × 물의 양 × 높이 ≈ 8330 × 물의 양 × 높이. 2.0 MW 가 되려면 물의 양 × 높이가 약 240 이어야 합니다."
    ],
    solution: "예: 높이 <b>25 m</b>, 물 <b>10 m³/s</b> (2.08 MW) 또는 높이 <b>21 m</b>, 물 <b>12 m³/s</b> (2.10 MW).",
    why: "댐은 물의 <b>위치 에너지</b>를 터빈의 <b>운동 에너지</b>로, 발전기가 다시 <b>전기 에너지</b>로 바꿉니다. 1초에 떨어지는 물의 질량과 높이의 곱이 곧 쓸 수 있는 에너지의 양이지요.<br>" +
      "그 과정에서 15% 는 마찰열과 소리로 흩어집니다 — 사라진 것이 아니라 <b>쓸모없는 형태</b>로 바뀐 것이에요. 이 비율이 <b>에너지 효율</b>입니다. 수력은 85 ~ 90% 로 효율이 높은 편이지만, 물고기 길과 잠기는 땅처럼 <b>환경과 맞바꾸는 것</b>도 함께 따져야 합니다."
  }
  ]
});
})();
