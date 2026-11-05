/* 통합과학2 Ⅱ-2 에너지 전환과 발전 — 응용 실험실
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
  var CX = 640, x0 = CX + 18, x1 = W - 18;
  K.card(ctx, CX, 0, W - CX, CH, title);
  lt(ctx, big, x0, 62, { s: 20, w: "900", c: bigCol });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], x0, x1, 98 + i * 27, r[2]); });
  if (tip) K.tip(ctx, tip, x0 - 4, 106 + rows.length * 27, x1 - x0 + 4, good);
}
function wireLine(ctx, pts, col, w) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }); ctx.stroke(); }

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 전자기 유도 */
  {
    id: "c1", about: "02", tag: "발전기 · 전자기 유도", title: "손으로 돌리는 충전기", short: "손 발전기",
    who: "🔦", name: "캠핑용품 개발팀",
    say: "“정전이나 캠핑 때 쓸 손잡이 발전기를 만들어요. 휴대폰을 충전하려면 <b>6 V (± 0.3 V)</b>가 필요합니다. 그런데 사람이 오래 편하게 돌릴 수 있는 건 <b>1분에 40바퀴</b>까지예요. 코일과 자석을 골라 주세요.”",
    predict: {
      q: "같은 빠르기로 돌릴 때, 코일을 두 배로 많이 감으면 만들어지는 전압은?",
      options: ["㉠ 절반이 된다", "㉡ 그대로다", "㉢ 두 배가 된다"],
      answer: 2
    },
    task: "코일 감은 수, 자석, 돌리는 빠르기를 정해 <b>1분에 40바퀴 이하로 5.7~6.3 V</b>를 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var N = 100, mag = 1, rpm = 60, ang = 0;
      var run = api.ticker();
      var KV = 0.16755 / 400;
      function volt() { return KV * N * mag * rpm; }
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var V = volt(), ok = V >= 5.7 && V <= 6.3, CH = cv.H, i;
        K.studio(ctx, 0, 0, 630, CH, { x: 170, y: 286, rx: 150, ry: 18 });
        var I = K.iso({ ox: 150, oy: 140, s: .85, L: 200, D: 110 }), turns = Math.round(N / 50) + 2;
        I.box(ctx, 0, 0, 0, 200, 110, 10, "#e9ecef", "#adb5bd", "#868e96");
        [40, 150].forEach(function (sx) { I.box(ctx, sx - 5, 40, 10, sx + 5, 70, 22, "#ced4da", "#adb5bd", "#868e96"); });
        function ring(xc, back) { ctx.strokeStyle = back ? "#8a4a1c" : "#d9853f"; ctx.lineWidth = 3; ctx.beginPath(); for (var k = 0; k <= 20; k++) { var a = Math.PI / 2 + (back ? 1 : -1) * k / 20 * Math.PI, p = I.P(xc, 55 + 22 * Math.cos(a), 44 + 22 * Math.sin(a)); if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); } ctx.stroke(); }
        for (i = 0; i < turns; i++) ring(48 + i * 96 / Math.max(1, turns - 1), true);
        var cM = I.P(95, 55, 44), nE = I.P(95 + 18 * Math.cos(ang), 55, 44 + 18 * Math.sin(ang)), sE = I.P(95 - 18 * Math.cos(ang), 55, 44 - 18 * Math.sin(ang));
        ctx.lineCap = "butt"; ctx.lineWidth = 11; ctx.strokeStyle = "#e03131"; ctx.beginPath(); ctx.moveTo(cM.x, cM.y); ctx.lineTo(nE.x, nE.y); ctx.stroke();
        ctx.strokeStyle = "#1c7ed6"; ctx.beginPath(); ctx.moveTo(cM.x, cM.y); ctx.lineTo(sE.x, sE.y); ctx.stroke();
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.beginPath(); ctx.moveTo(sE.x, sE.y - 4); ctx.lineTo(nE.x, nE.y - 4); ctx.stroke();
        for (i = 0; i < turns; i++) ring(48 + i * 96 / Math.max(1, turns - 1), false);
        var s0 = I.P(95, 55, 44), s1 = I.P(95, 130, 44), kE = I.P(95 + 26 * Math.cos(ang), 130, 44 + 26 * Math.sin(ang));
        wireLine(ctx, [s0, s1], "#868e96", 4); wireLine(ctx, [s1, kE], "#495057", 5); K.planet(ctx, kE.x, kE.y, 6, "#ffc078", "#d9480f");
        wireLine(ctx, [I.P(145, 77, 44), I.P(165, 100, 12), I.P(180, 52, 12)], "#343a40", 2);
        I.box(ctx, 176, 20, 10, 190, 50, 72, "#495057", "#343a40", "#212529");
        var ph = I.P(190, 35, 46); if (ok) K.glow(ctx, ph.x, ph.y, 5, "rgba(64,192,87,.95)", 3);
        lead(ctx, I.P(120, 77, 44).x, I.P(120, 77, 44).y, 50, 100, "코일 " + N + "회", "#ffd9a8", [0, 360]);
        lead(ctx, kE.x, kE.y, kE.x + 30, kE.y + 50, "손잡이 " + rpm + " 바퀴/분", rpm > 40 ? "#ffc9c9" : "#e8ecff", [0, 360]);
        lead(ctx, ph.x, ph.y - 16, 300, 96, "휴대폰", ok ? "#b2f2bb" : "#e8ecff", [0, 360]);
        K.bigText(ctx, V.toFixed(2) + " V", 18, 44, 26, ok ? "#8ff5cf" : "#ffffff");
        K.bigText(ctx, ok ? (rpm > 40 ? "전압은 맞지만 너무 빠르다" : "휴대폰 충전 가능!") : "목표 5.7~6.3 V", 18, 70, 15, "#ffd35a");
        var g = K.chart(ctx, { x: 364, y: 40, w: 262, h: 270, x0: 0, x1: 2, y0: -12, y1: 12, xt: 4, yt: 4, xl: "시간(s)", yl: "전압(V)", light: true });
        ctx.save(); ctx.strokeStyle = "rgba(15,159,118,.8)"; ctx.setLineDash([5, 4]); [6, -6].forEach(function (q) { ctx.beginPath(); ctx.moveTo(g.L, g.Y(q)); ctx.lineTo(g.R, g.Y(q)); ctx.stroke(); }); ctx.restore();
        lt(ctx, "필요 6 V", g.R - 4, g.Y(6) - 5, { s: 10.5, w: "800", a: "right", c: LT.green });
        var pts = [], cyc = rpm / 60 * 2; for (var x = 0; x <= 2.0001; x += 0.01) pts.push([x, Math.sin(x / 2 * cyc * Math.PI * 2 + ang) * Math.min(12, V)]);
        if (rpm > 0) K.plot(ctx, g, pts, LT.violet, { w: 2.4, light: true });
        judge(ctx, W, CH, "판정 · 휴대폰 충전", ok ? "충전할 수 있다" : (V > 6.3 ? "전압이 너무 높다" : "전압이 모자란다"), ok ? LT.green : LT.red,
          [["돌리는 빠르기", rpm + " 바퀴/분", rpm > 40 ? LT.red : LT.ink], ["코일 감은 수", N + "회"], ["자석", mag === 2 ? "네오디뮴 (2배)" : "페라이트"], ["최대 전압", V.toFixed(2) + " V", ok ? LT.green : LT.red]],
          rpm > 40 ? "40 바퀴/분 이하로 돌려야 한다" : (ok ? "감은 수·자석·빠르기의 곱이 맞았다" : "감은 수 × 자석 × 빠르기를 키우거나 줄이자"), ok && rpm <= 40);
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
      "전압은 <b>감은 수 × 자석 세기 × 빠르기</b>에 비례합니다. 빠르기를 40 이하로 묶어 두었으니 나머지 둘을 키워야 합니다.",
      "코일 100회·페라이트·40 바퀴/분이면 약 1.7 V. 6 V가 되려면 대략 3.5배가 필요합니다. 감은 수와 자석을 어떻게 조합하면 될까요?"
    ],
    solution: "<b>400회 · 페라이트 · 35 바퀴/분</b>(5.86 V) 또는 <b>200회 · 네오디뮴 · 35 바퀴/분</b>(5.86 V).",
    why: "코일을 지나는 자기장이 변하면 코일에 전류가 흐릅니다 — <b>전자기 유도</b>. 만들어지는 전압은 <b>코일 감은 수</b>, <b>자석의 세기</b>, <b>변하는 빠르기</b>가 클수록 커집니다.<br>" +
      "발전소의 거대한 발전기도 원리는 똑같습니다. 불 꺼진 섬에서 디젤·풍력·태양광을 비교했지만, 태양광을 뺀 대부분의 발전은 결국 <b>무언가로 터빈(자석)을 돌리는 일</b>입니다. 무엇으로 돌리느냐가 다를 뿐입니다."
  },

  /* ------------------------------------------------------------------ 2. 송전 손실 */
  {
    id: "c2", about: "03", tag: "전력 수송", title: "200 km 송전선 설계", short: "송전 전압",
    who: "🗼", name: "전력 회사 설계부",
    say: "“해안 발전소에서 <b>100 MW</b>를 200 km 떨어진 도시로 보내야 해요. 전선에서 열로 잃는 전력은 <b>1% 미만</b>이어야 합니다. 전압이 높을수록 철탑이 비싸고, 전선이 굵을수록 전선값이 비싸요. 조건을 지키면서 <b>건설비가 가장 적은</b> 조합을 찾아 주세요.”",
    predict: {
      q: "같은 전력을 보낼 때 송전 전압을 2배로 올리면, 전선에서 열로 잃는 전력은?",
      options: ["㉠ 2배가 된다", "㉡ 절반이 된다", "㉢ 4분의 1이 된다"],
      answer: 2
    },
    task: "송전 전압과 전선 굵기를 골라 <b>손실 1% 미만 · 건설비 최소</b>를 찾으세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
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
        ctx.clearRect(0, 0, W, cv.H);
        var c = calc(kv, wire), CH = cv.H, ok = c.loss < 0.01, lev = [22.9, 66, 154, 345, 765].indexOf(kv), i;
        K.studio(ctx, 0, 0, 630, CH, { x: 300, y: CH - 26, rx: 260, ry: 20 });
        var I = K.iso({ ox: 150, oy: 104, s: .74, L: 520, D: 70 });
        I.box(ctx, 0, 0, 0, 520, 70, 8, "#a9d18e", "#8a6a48", "#6d523a");
        I.box(ctx, 10, 12, 8, 70, 58, 48, "#e9ecef", "#ced4da", "#adb5bd"); I.box(ctx, 22, 20, 48, 30, 28, 92, "#f8f9fa", "#dee2e6", "#adb5bd");
        var th = 46 + lev * 14, TW = [150, 260, 370];
        function towerAt(x) {
          function q(z, w) { return [I.P(x - w, 35 - w, z), I.P(x + w, 35 - w, z), I.P(x + w, 35 + w, z), I.P(x - w, 35 + w, z)]; }
          var A = q(8, 7), B = q(8 + th, 2.5); for (var k = 0; k < 4; k++) { wireLine(ctx, [A[k], B[k]], "#5c6576", 1.5); wireLine(ctx, [A[k], B[(k + 1) % 4]], "rgba(92,101,118,.6)", .8); }
          wireLine(ctx, [I.P(x, 19, 8 + th), I.P(x, 51, 8 + th)], "#5c6576", 2.4);
        }
        TW.forEach(towerAt);
        var heat = clamp(c.loss * 8, 0, 1), wwid = wire === "thick" ? 3.4 : (wire === "std" ? 2.4 : 1.4);
        [21, 49].forEach(function (yw, wi) {
          var tops = [[70, 44]].concat(TW.map(function (x) { return [x, 8 + th]; })).concat([[460, 40]]), pts = [];
          for (var k = 0; k < tops.length - 1; k++) for (var t = 0; t <= 1.0001; t += .125) { if (k && t === 0) continue; var a = I.P(tops[k][0], yw, tops[k][1]), b = I.P(tops[k + 1][0], yw, tops[k + 1][1]); pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t + 10 * 4 * t * (1 - t) }); }
          if (heat > .02) { ctx.save(); ctx.shadowColor = "#ff5a5a"; ctx.shadowBlur = 10 * heat; wireLine(ctx, pts, "rgba(240,62,62," + (.2 + .6 * heat).toFixed(2) + ")", wwid + 6 * heat); ctx.restore(); }
          wireLine(ctx, pts, "#343a40", wwid);
        });
        [[455, 8, 495, 30, 60], [470, 36, 510, 62, 40], [500, 10, 518, 34, 80]].forEach(function (b) { I.box(ctx, b[0], b[1], 8, b[2], b[3], b[4], "#dbe4ff", "#bac8ff", "#91a7ff"); });
        var tp = I.P(260, 35, 8 + th); lead(ctx, tp.x, tp.y, tp.x - 40, 100, "철탑 · " + kv + " kV", "#e8ecff", [0, 630]);
        var pp = I.P(40, 35, 48); lead(ctx, pp.x, pp.y, 40, 150, "발전소 100 MW", "#ffd9a8", [0, 630]);
        var cp = I.P(490, 30, 70); lead(ctx, cp.x, cp.y, cp.x + 30, cp.y - 46, "200 km 떨어진 도시", "#dbe4ff", [0, 630]);
        var wp = I.P(320, 49, th - 6); lead(ctx, wp.x, wp.y + 8, wp.x + 40, wp.y + 70, WIRE[wire].t + (heat > .2 ? " · 뜨거워짐" : ""), heat > .2 ? "#ffc9c9" : "#e8ecff", [0, 630]);
        var lossTxt = c.loss >= 1 ? "보낼 수 없음" : (c.loss * 100).toFixed(2) + "%";
        K.bigText(ctx, "손실 " + lossTxt, 18, 44, 26, ok ? "#8ff5cf" : "#ffffff");
        K.bigText(ctx, ok ? "1% 미만 · 건설비 " + c.cost.toFixed(1) + "억/km" : "목표: 손실 1% 미만", 18, 70, 15, "#ffd35a");
        judge(ctx, W, CH, "판정 · 송전 손실과 건설비", "손실 " + lossTxt, ok ? LT.green : LT.red,
          [["흐르는 전류 I = P ÷ V", c.I.toFixed(0) + " A"], ["전선 저항 R", c.R.toFixed(0) + " Ω"], ["건설비 (억 원/km)", c.cost.toFixed(1)], ["철탑 + 전선", VOL[kv].toFixed(1) + " + " + WIRE[wire].c.toFixed(1)]],
          ok ? "손실 조건 통과 · 더 싼 조합은?" : "잃는 전력 = I² × R", ok);
        lt(ctx, "※ 건설비·저항은 수업용 어림값", W - 18, CH - 12, { s: 10.5, a: "right", c: LT.mute });
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
          if (c.loss >= 0.01) return { ok: false, msg: "손실 " + (c.loss >= 1 ? "100% 이상" : (c.loss * 100).toFixed(2) + "%") + " — 1%를 넘습니다." };
          if (c.cost > b.cost + 1e-9) return { ok: false, msg: "손실 " + (c.loss * 100).toFixed(2) + "%로 조건은 지켰지만, 건설비 " + c.cost.toFixed(1) + " 억/km — 더 싼 조합이 있습니다." };
          return { ok: true, msg: kv + " kV · " + WIRE[wire].t + " → 손실 " + (c.loss * 100).toFixed(2) + "% · 건설비 " + c.cost.toFixed(1) + " 억/km — 가장 경제적인 조합입니다." };
        }
      };
    },
    hints: [
      "154 kV에 굵은 선을 써도 손실이 1%를 넘습니다. 전선을 굵게 하는 것만으로는 한계가 있습니다.",
      "잃는 전력 = I² R이고 I = P ÷ V이므로 <b>손실은 V²에 반비례</b>합니다. 전압을 올리면 가는 선으로도 충분할지 모릅니다."
    ],
    solution: "<b>345 kV · 가는 선</b> — 손실 0.84%, 건설비 4.0 억/km.",
    why: "같은 전력(P = VI)을 보낼 때 전압을 높이면 <b>전류가 줄어듭니다</b>. 전선에서 열로 잃는 전력은 <b>I²R</b>이라 전류가 절반이면 손실은 4분의 1이 됩니다. 전선을 두 배 굵게 해도 손실은 절반밖에 줄지 않습니다.<br>" +
      "그래서 발전소는 <b>변압기로 전압을 수십만 볼트로 올려</b> 보내고, 도시 가까이서 다시 낮춥니다. 불 꺼진 섬에 육지 전기를 끌어오려면 이 손실까지 계산해야 하는 까닭입니다."
  },

  /* ------------------------------------------------------------------ 3. 위치 에너지 → 전기 에너지 */
  {
    id: "c3", about: "02", tag: "에너지 전환 · 효율", title: "산골 마을 소수력 발전", short: "소수력",
    who: "💧", name: "산골 마을 이장",
    say: "“마을 앞 계곡에 작은 댐을 막아 전기를 만들려 해요. 마을에는 <b>2.0~2.2 MW</b>가 필요합니다. 계곡물은 초당 <b>15 m³</b>. 물고기가 살려면 초당 <b>3 m³</b>는 그대로 흘려보내야 하고, 댐 높이가 <b>25 m</b>를 넘으면 윗마을 논이 잠겨요. 발전기 효율은 85%입니다.”",
    predict: {
      q: "같은 양의 물을 더 높은 곳에서 떨어뜨리면 발전량이 느는 까닭은?",
      options: ["㉠ 물의 양이 늘어나서", "㉡ 물 1 kg이 가진 위치 에너지가 커져서", "㉢ 물이 더 차가워져서"],
      answer: 1
    },
    task: "댐 높이와 발전에 쓸 물의 양을 정해 <b>2.0~2.2 MW</b>를 만드세요. 물고기와 윗마을을 지켜야 합니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var h = 10, Q = 6;
      function power() { return 0.85 * 1000 * 9.8 * Q * h; }
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var P = power(), left = 15 - Q, CH = cv.H, zs = 2.4, wl = 10 + h * zs, z25 = 10 + 25 * zs, okP = P >= 2e6 && P <= 2.2e6, i;
        K.studio(ctx, 0, 0, 630, CH, { x: 330, y: CH - 26, rx: 240, ry: 20 });
        var I = K.iso({ ox: 300, oy: 98, s: .72, L: 360, D: 150 });
        I.box(ctx, 0, 0, 0, 360, 150, 10, "#9c8a72", "#7d6b55", "#5f513f");
        I.box(ctx, 0, 0, 10, 360, 30, 100, "#a9d18e", "#8c7a62", "#6d5d48");
        I.box(ctx, 0, 30, 10, 60, 62, z25, "#8ce99a", "#7d6b55", "#5f513f");
        for (i = 0; i < 4; i++) { var r1 = I.P(4, 36 + i * 7, z25 + .2), r2 = I.P(56, 36 + i * 7, z25 + .2); wireLine(ctx, [r1, r2], "rgba(47,158,68,.8)", 1.2); }
        I.box(ctx, 0, 30, 10, 140, 120, wl, "rgba(116,192,252,.72)", "rgba(28,126,214,.62)", "rgba(24,100,171,.62)");
        ctx.save(); ctx.setLineDash([6, 4]); I.quad(ctx, I.P(0, 30, z25), I.P(140, 30, z25), I.P(140, 120, z25), I.P(0, 120, z25), null, "#e03131"); ctx.restore();
        I.box(ctx, 140, 30, 10, 154, 120, wl + 4, "#f8f9fa", "#dee2e6", "#adb5bd");
        I.box(ctx, 154, 62, 10.5, 360, 98, 11.5, "rgba(77,171,247,.85)", "rgba(28,126,214,.8)", "rgba(24,100,171,.8)");
        if (left > 0) I.box(ctx, 154, 104, 10.5, 360, 116, 11.5, "rgba(116,192,252," + clamp(.2 + left / 12, 0, .9).toFixed(2) + ")", "rgba(28,126,214,.6)", "rgba(24,100,171,.6)");
        if (left >= 3) for (i = 0; i < 3; i++) { var fp = I.P(200 + i * 50, 110, 12); ctx.fillStyle = "#ff922b"; ctx.beginPath(); ctx.ellipse(fp.x, fp.y, 5, 2.2, .5, 0, 6.2832); ctx.fill(); }
        I.box(ctx, 166, 64, 11, 206, 96, 34, "#f1f3f5", "#dee2e6", "#adb5bd");
        wireLine(ctx, [I.P(140, 80, 14), I.P(166, 80, 16)], "#495057", 4 + Q / 3);
        var fl = []; fl.push(I.P(120, 80, wl - 6), I.P(150, 80, 14), I.P(186, 80, 14), I.P(360, 80, 12));
        K.arrow(ctx, I.P(210, 80, 12), I.P(300, 80, 12), "rgba(28,126,214,.85)", 2 + Q / 2, 10);
        lead(ctx, I.P(147, 30, wl + 4).x, I.P(147, 30, wl + 4).y, 380, 40, "댐 높이 " + h + " m", "#e8ecff", [0, 630]);
        lead(ctx, I.P(30, 46, z25).x, I.P(30, 46, z25).y, 150, 140, "윗마을 논 (25 m)", h > 25 ? "#ffc9c9" : "#b2f2bb", [0, 630]);
        lead(ctx, I.P(186, 96, 34).x, I.P(186, 96, 34).y, 430, 150, "발전소 (효율 85%) · 물 " + Q.toFixed(1) + " m³/s", "#e8ecff", [0, 630]);
        lead(ctx, I.P(300, 116, 11).x, I.P(300, 116, 11).y, 440, 300, "물고기 길 " + left.toFixed(1) + " m³/s", left >= 3 ? "#b2f2bb" : "#ffc9c9", [0, 630]);
        K.bigText(ctx, (P / 1e6).toFixed(3) + " MW", 18, 44, 26, okP && h <= 25 && left >= 3 ? "#8ff5cf" : "#ffffff");
        K.bigText(ctx, h > 25 ? "윗마을 논이 잠긴다!" : (left < 3 ? "물고기 길이 마른다!" : (okP ? "마을에 딱 맞다" : "목표 2.0~2.2 MW")), 18, 70, 15, "#ffd35a");
        K.warn(ctx, 620, CH - 10, "⚠ 높이는 보기 쉽게 과장", "right");
        judge(ctx, W, CH, "판정 · 소수력 발전", (P / 1e6).toFixed(3) + " MW", okP ? LT.green : LT.red,
          [["물 1 kg의 위치 에너지", (9.8 * h).toFixed(0) + " J"], ["1초에 떨어지는 물", (Q * 1000).toFixed(0) + " kg"], ["댐 높이 (25 m 이하)", h + " m", h > 25 ? LT.red : LT.ink], ["물고기 길 (3 이상)", left.toFixed(1) + " m³/s", left < 3 ? LT.red : LT.ink]],
          h > 25 ? "윗마을 논이 잠깁니다" : (left < 3 ? "물고기가 살 수 없습니다" : (okP ? "세 조건을 모두 지켰다" : "물의 양 × 높이를 맞추자")), okP && h <= 25 && left >= 3);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "댐 높이 (떨어지는 높이)", min: 5, max: 40, step: 1, value: 10, fmt: function (x) { return x + " m"; },
        onInput: function (x) { h = x; draw(); } });
      api.slider({ label: "발전에 쓸 물의 양", min: 0, max: 15, step: 0.5, value: 6, fmt: function (x) { return x.toFixed(1) + " m³/s"; },
        onInput: function (x) { Q = x; draw(); } });
      api.info("1초 동안 떨어지는 물의 위치 에너지 = 질량 × 9.8 × 높이. 이 가운데 85%가 전기가 됩니다. 물 1 m³는 1000 kg.");
      draw();
      return {
        judge: function () {
          var P = power();
          if (h > 25) return { ok: false, msg: "댐 " + h + " m — 윗마을 논이 잠깁니다." };
          if (15 - Q < 3) return { ok: false, msg: "물고기 길에 " + (15 - Q).toFixed(1) + " m³/s만 남습니다. 3 m³/s는 남겨야 합니다." };
          if (P >= 2e6 && P <= 2.2e6) return { ok: true, msg: "높이 " + h + " m · 물 " + Q.toFixed(1) + " m³/s → " + (P / 1e6).toFixed(3) + " MW — 마을에 충분합니다." };
          return { ok: false, msg: (P / 1e6).toFixed(3) + " MW — " + (P > 2.2e6 ? "너무 큽니다(발전기 용량 초과)." : "모자랍니다.") };
        }
      };
    },
    hints: [
      "쓸 수 있는 물은 최대 15 − 3 = <b>12 m³/s</b>, 높이는 최대 <b>25 m</b>. 이 두 제한 안에서 곱을 키워야 해요.",
      "출력 = 0.85 × 1000 × 9.8 × 물의 양 × 높이 ≈ 8330 × 물의 양 × 높이. 2.0 MW가 되려면 물의 양 × 높이가 약 240 이어야 합니다."
    ],
    solution: "예: 높이 <b>25 m</b>, 물 <b>10 m³/s</b> (2.08 MW) 또는 높이 <b>21 m</b>, 물 <b>12 m³/s</b> (2.10 MW).",
    why: "댐은 물의 <b>위치 에너지</b>를 터빈의 <b>운동 에너지</b>로, 발전기가 다시 <b>전기 에너지</b>로 바꿉니다. 1초에 떨어지는 물의 질량과 높이의 곱이 곧 쓸 수 있는 에너지의 양입니다.<br>" +
      "그 과정에서 15%는 마찰열과 소리로 흩어집니다 — 사라진 것이 아니라 <b>쓸모없는 형태</b>로 바뀐 것입니다. 이 비율이 <b>에너지 효율</b>입니다. 수력은 85~90%로 효율이 높은 편이지만, 물고기 길과 잠기는 땅처럼 <b>환경과 맞바꾸는 것</b>도 함께 따져야 합니다."
  }
  ]
});
})();
