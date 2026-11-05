/* 통합과학2 Ⅲ-2 과학 기술과 사회 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

/* ---- 스튜디오 말투(밝은 바탕 + 입체 미니어처 + 흰 판정 카드) — window.sthKit (_tools/STUDIO_GUIDE.md) ---- */
var K = window.sthKit, LT = K.LT;
function lpill(ctx, s, x, y, o) { o = o || {}; o.bg = o.bg || "rgba(255,255,255,.94)"; o.line = o.line || "rgba(20,40,90,.16)"; o.c = o.c || LT.ink; return K.pill(ctx, s, x, y, o); }
function note(ctx, s, x, y, o) { o = o || {}; K.t(ctx, s, x, y, { s: o.s || 11, w: o.w || "700", a: o.a, c: o.c || LT.mute }); }
function cube(ctx, x, y, w, h, d, cF, cT, cR) {
  var dx = d * .7, dy = d * .5;
  ctx.fillStyle = cT; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y - dy); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cR; ctx.beginPath(); ctx.moveTo(x + w, y); ctx.lineTo(x + w + dx, y - dy); ctx.lineTo(x + w + dx, y + h - dy); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
  ctx.fillStyle = cF; ctx.fillRect(x, y, w, h);
}
/* 오른쪽 흰 판정 카드: rows = [[이름, 값, 색], …] */
function card(ctx, RX, W, CH, title, head, headCol, rows, tip, good) {
  K.card(ctx, RX, 0, W - RX, CH, title);
  if (head) K.t(ctx, head, RX + 18, 60, { s: 19, w: "900", c: headCol || LT.ink });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], RX + 18, W - 18, 94 + i * 27, r[2]); });
  if (tip) K.tip(ctx, tip, RX + 12, CH - 46, W - RX - 24, good);
}
function erf(x) {
  var s = x < 0 ? -1 : 1; x = Math.abs(x);
  var t = 1 / (1 + 0.3275911 * x);
  var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}
function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 센서 · 판단 · 작동 (이력 문턱) */
  {
    id: "c1", about: "01", tag: "센서와 자동 제어", title: "깜빡이는 스마트 가로등", short: "스마트 가로등",
    who: "💡", name: "시청 도로과",
    say: "“새로 단 스마트 가로등이 해 질 녘마다 <b>수십 번 깜빡여서</b> 민원이 들어와요. 밝기 센서 값이 정해 둔 문턱 근처에서 흔들리는 게 원인 같습니다. 게다가 오후에 먹구름이 끼면 대낮에 켜지기도 해요. 켜는 문턱과 끄는 문턱을 새로 정해 주세요.”",
    predict: {
      q: "해 질 녘 센서 값이 ±40 lux씩 흔들리며 천천히 어두워집니다. ‘문턱보다 어두우면 켜고, 밝으면 끈다’ 문턱 하나만 쓰면?",
      options: ["㉠ 문턱 근처에서 켜졌다 꺼졌다를 여러 번 되풀이한다", "㉡ 정확히 한 번만 켜진다", "㉢ 아예 켜지지 않는다"],
      answer: 0
    },
    task: "켜는 문턱과 끄는 문턱을 정해 <b>하루 두 번만</b>(해 질 녘 켜짐, 새벽 꺼짐) 바뀌고, <b>50 lux보다 어두울 때는 늘 켜져</b> 있으며, <b>1000 lux보다 밝을 때는 꺼져</b> 있게 하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var ON = 300, OFF = 300;
      var TRUE = [], SENS = [], NS = 8640;   /* 10초마다 한 번 잰다 */
      (function () {
        for (var i = 0; i < NS; i++) {
          var h = i / 360, b = 0;
          if (h > 6 && h < 18) { var s = Math.sin(Math.PI * (h - 6) / 12); b = 30000 * s * s; }
          if (h > 13 && h < 15) b *= 1 - 0.97 * Math.sin(Math.PI * (h - 13) / 2);
          b += 2;
          var r = Math.sin(i * 12.9898 + 78.233) * 43758.5453; r = r - Math.floor(r);
          TRUE.push(b); SENS.push(Math.max(0, b + Math.min(40, 5 + 0.25 * b) * (2 * r - 1)));   /* 잡음: 밤에는 작고 해 질 녘엔 ±40 */
        }
      })();
      function sim() {
        var on = true, flips = 0, dark = 0, waste = 0, st = [];
        for (var i = 0; i < NS; i++) {
          if (!on && SENS[i] < ON) { on = true; flips++; }
          else if (on && SENS[i] > OFF) { on = false; flips++; }
          st.push(on);
          if (!on && TRUE[i] < 50) dark++;
          if (on && TRUE[i] > 1000) waste++;
        }
        return { st: st, flips: flips, dark: Math.ceil(dark / 6), waste: Math.ceil(waste / 6) };
      }
      var LW = 612;
      function draw() {
        var r = sim(), CH = cv.H, ok = r.flips <= 2 && !r.dark && !r.waste, i, a;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 532, y: CH - 52, rx: 96, ry: 16 });
        K.bigText(ctx, "하루 " + r.flips + "번 바뀜", 16, 36, 22, r.flips <= 2 ? "#8ce99a" : "#ffffff");
        var g = K.chart(ctx, { x: 4, y: 46, w: 436, h: CH - 50, pl: 46, pb: 50, pt: 10, pr: 10, x0: 0, x1: 24, y0: 0, y1: 5, xt: 4, yt: 5, light: true,
          xf: function (h) { return h + "시"; }, yf: function (q) { return ["1", "10", "100", "1천", "1만", "10만"][Math.round(q)]; } });
        function GX(k) { return g.X(k / 360); }
        function GY(l) { return g.Y(H.log10(Math.max(l, 1))); }
        for (i = 0, a = -1; i <= NS; i++) {
          if (i < NS && r.st[i]) { if (a < 0) a = i; }
          else if (a >= 0) { ctx.fillStyle = "rgba(245,159,0,.9)"; ctx.fillRect(GX(a), g.B + 24, Math.max(1.5, GX(i) - GX(a)), 9); a = -1; }
        }
        note(ctx, "켜짐", g.L - 6, g.B + 33, { s: 10.5, a: "right", c: "#a85d00" });
        var pts = []; for (var j = 0; j < NS; j += 12) pts.push([j / 360, H.log10(Math.max(SENS[j], 1))]);
        K.plot(ctx, g, pts, LT.blue, { w: 1.4, light: true, glow: false });
        K.line(ctx, { x: g.L, y: GY(ON) }, { x: g.R, y: GY(ON) }, LT.orange, 2, [6, 4]);
        K.line(ctx, { x: g.L, y: GY(OFF) }, { x: g.R, y: GY(OFF) }, LT.teal, 2, [6, 4]);
        function yl(y) { return Math.max(g.T + 16, Math.min(g.B - 4, y)); }
        lpill(ctx, "켜는 문턱 " + ON, g.R - 4, yl(GY(ON) + (ON >= OFF ? -6 : 18)), { s: 10.5, a: "right", c: LT.orange });
        lpill(ctx, "끄는 문턱 " + OFF, g.R - 4, yl(GY(OFF) + (ON >= OFF ? 18 : -6)), { s: 10.5, a: "right", c: LT.teal });
        note(ctx, "센서가 잰 밝기 (lux · 눈금 한 칸 = 10배)", g.L + 6, g.T + 14, { s: 10.5, c: LT.blue });
        /* 입체 미니어처: 보도 위 스마트 가로등 (해 질 녘의 모습) */
        var sx = 532, base = CH - 64;
        cube(ctx, 462, base, 126, 14, 40, "#bcc4cf", "#e1e6ec", "#98a1ae");
        var lit = !r.dark;
        if (lit) {
          ctx.fillStyle = r.flips > 2 ? "rgba(255,214,90,.16)" : "rgba(255,214,90,.32)";
          ctx.beginPath(); ctx.moveTo(498, 128); ctx.lineTo(470, base - 6); ctx.lineTo(566, base - 6); ctx.closePath(); ctx.fill();
        }
        var pg = ctx.createLinearGradient(sx - 3, 0, sx + 3, 0); pg.addColorStop(0, "#5f6878"); pg.addColorStop(.5, "#dfe4ec"); pg.addColorStop(1, "#5f6878");
        ctx.fillStyle = pg; ctx.fillRect(sx - 3, 112, 6, base - 112 - 10);
        ctx.strokeStyle = "#6b7484"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx, 116); ctx.quadraticCurveTo(sx - 6, 104, sx - 28, 112); ctx.stroke();
        cube(ctx, sx - 46, 112, 30, 9, 12, "#59606e", "#8a93a3", "#3f4552");
        if (lit) K.glow(ctx, sx - 31, 124, 4, r.flips > 2 ? "rgba(255,226,140,.7)" : "rgba(255,226,140,.98)", 3.4);
        if (lit && r.flips > 2) { ctx.strokeStyle = LT.orange; ctx.lineWidth = 2; [[-62, 118], [-8, 130]].forEach(function (z) { ctx.beginPath(); ctx.moveTo(sx + z[0], z[1]); ctx.lineTo(sx + z[0] + 5, z[1] - 6); ctx.lineTo(sx + z[0] + 1, z[1] - 9); ctx.lineTo(sx + z[0] + 7, z[1] - 16); ctx.stroke(); }); }
        cube(ctx, sx - 4, 106, 8, 5, 6, "#ffffff", "#ffffff", "#c9ced6");
        lpill(ctx, "밝기 센서", sx + 12, 104, { s: 10.5, c: LT.blue, box: [440, LW] });
        lpill(ctx, ok ? "해 질 녘 한 번만 켜짐" : (r.flips > 2 ? "해 질 녘 깜빡깜빡" : "켜고 끄는 때가 어긋남"), 526, CH - 20, { s: 11, a: "center", c: ok ? LT.green : LT.orange, box: [440, LW] });
        card(ctx, LW + 8, W, CH, "판정", ok ? "깜빡임 없음" : "아직 고칠 곳 있음", ok ? LT.green : LT.orange, [
          ["하루에 바뀐 횟수", r.flips + " 번", r.flips <= 2 ? LT.green : LT.red],
          ["50 lux보다 어두운데 꺼짐", r.dark + " 분", r.dark ? LT.red : LT.green],
          ["1000 lux보다 밝은데 켜짐", r.waste + " 분", r.waste ? LT.red : LT.green]
        ], r.dark ? "어두운데 꺼집니다" : (r.waste ? "밝은데 켜집니다" : (r.flips > 2 ? "문턱 근처에서 깜빡입니다" : "두 문턱 사이 간격이 잡음을 막음")), ok);
        note(ctx, "해 질 녘 센서 잡음 약 ±40 lux", LW + 26, 190);
        note(ctx, "오후 2시 먹구름 약 700 lux", LW + 26, 210);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "켜는 문턱 (이보다 어두우면 켬)", min: 0, max: 1000, step: 25, value: 300, fmt: function (x) { return x + " lux"; },
        onInput: function (x) { ON = x; draw(); } });
      api.slider({ label: "끄는 문턱 (이보다 밝으면 끔)", min: 0, max: 1500, step: 25, value: 300, fmt: function (x) { return x + " lux"; },
        onInput: function (x) { OFF = x; draw(); } });
      api.info("센서는 10초마다 밝기를 재는데, 해 질 녘·새벽에는 값이 ±40 lux 쯤 흔들립니다. 오후 2시 무렵 먹구름이 지나가면 약 700 lux까지 어두워집니다.");
      draw();
      return {
        judge: function () {
          var r = sim();
          if (r.dark) return { ok: false, msg: "어두운데 꺼져 있던 시간 " + r.dark + " 분 — 보행자가 위험합니다." };
          if (r.waste) return { ok: false, msg: "밝은데 켜져 있던 시간 " + r.waste + " 분 — 전기 낭비입니다." };
          if (r.flips > 2) return { ok: false, msg: "하루 " + r.flips + " 번 바뀝니다 — 아직 깜빡입니다." };
          return { ok: true, msg: "켜는 문턱 " + ON + " · 끄는 문턱 " + OFF + " lux — 하루 두 번만 바뀌고, 먹구름에도 흔들리지 않습니다." };
        }
      };
    },
    hints: [
      "켜는 문턱과 끄는 문턱이 같으면, 센서 값이 그 근처에서 흔들릴 때마다 켜졌다 꺼집니다. <b>두 문턱 사이에 간격</b>을 두면 어떨까요?",
      "켜는 문턱은 먹구름(약 700 lux)보다 낮고 50 lux 보다는 충분히 높게, 끄는 문턱은 켜는 문턱보다 흔들림 폭(약 80 lux)만큼 높게, 1000 lux 보다는 낮게."
    ],
    solution: "예: 켜는 문턱 <b>200 lux</b>, 끄는 문턱 <b>400 lux</b>. 두 문턱 사이가 흔들림 폭(약 80 lux) 이상 벌어지면 깜빡임이 사라집니다.",
    why: "자동 제어 장치는 <b>센서(측정) → 판단 → 작동</b>으로 움직입니다. 할머니 딸기 온실의 온도 센서와 환풍기도 같은 구조였습니다. 문제는 센서 값에는 늘 <b>잡음</b>이 있다는 것입니다.<br>" +
      "켜는 기준과 끄는 기준을 다르게 두는 것을 <b>이력(히스테리시스) 문턱</b>이라 합니다. 집의 보일러 온도 조절기, 냉장고도 이렇게 해서 스위치가 쉴 새 없이 켜졌다 꺼지는 것을 막습니다. 좋은 기술은 센서를 믿되 <b>센서의 흔들림까지</b> 계산에 넣습니다."
  },

  /* ------------------------------------------------------------------ 2. 판단 문턱과 두 가지 오류 */
  {
    id: "c2", about: "01", tag: "인공지능의 판단", title: "스팸 필터의 문턱", short: "스팸 필터",
    who: "📧", name: "학교 전산실",
    say: "“학교 메일 필터가 메일마다 <b>스팸 점수</b>(0~1)를 매깁니다. 문턱보다 높으면 스팸함으로 보내요. 학부모 상담 메일이 스팸함에 빠지면 큰일이라 <b>정상 메일은 1% 이하</b>만 걸려야 하고, 동시에 <b>스팸은 90% 이상</b> 막아야 합니다.”",
    predict: {
      q: "문턱을 낮추면(더 쉽게 스팸으로 판단하면) 어떻게 될까?",
      options: ["㉠ 스팸은 더 많이 막지만, 정상 메일도 더 많이 스팸함에 빠진다", "㉡ 스팸도 더 막고, 정상 메일도 덜 빠진다", "㉢ 아무것도 달라지지 않는다"],
      answer: 0
    },
    task: "판단에 쓸 단서와 문턱을 정해 <b>정상 메일 오판 1% 이하 · 스팸 차단 90% 이상</b>을 동시에 만족하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var t = 0.5, sd = 0.12;
      function fp() { return 1 - Phi((t - 0.3) / sd); }
      function catchR() { return 1 - Phi((t - 0.75) / sd); }
      function pdf(x, m) { return Math.exp(-0.5 * Math.pow((x - m) / sd, 2)); }
      var LW = 612;
      function draw() {
        var CH = cv.H, f = fp(), c = catchR(), ok = f <= 0.01 && c >= 0.9, x;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 530, y: CH - 44, rx: 96, ry: 16 });
        K.bigText(ctx, "문턱 " + t.toFixed(3), 16, 36, 22, ok ? "#8ce99a" : "#ffffff");
        var g = K.chart(ctx, { x: 4, y: 46, w: 440, h: CH - 50, pl: 22, pb: 34, pt: 26, pr: 12, x0: 0, x1: 1, y0: 0, y1: 1.15, xt: 4, yt: 1, light: true,
          yf: function () { return ""; }, xl: "메일의 스팸 점수 →" });
        [[0.3, LT.teal, "정상 메일", "rgba(12,133,153,.38)"], [0.75, LT.red, "스팸", "rgba(224,49,49,.32)"]].forEach(function (d) {
          var lo = d[0] < 0.5 ? t : 0, hi = d[0] < 0.5 ? 1 : t;
          ctx.fillStyle = d[3]; ctx.beginPath(); ctx.moveTo(g.X(lo), g.B);
          for (x = lo; x <= hi + 1e-9; x += 0.005) ctx.lineTo(g.X(x), g.Y(pdf(x, d[0])));
          ctx.lineTo(g.X(hi), g.B); ctx.closePath(); ctx.fill();
          var pts = []; for (x = 0; x <= 1.0001; x += 0.005) pts.push([x, pdf(x, d[0])]);
          K.plot(ctx, g, pts, d[1], { w: 2.6, light: true });
          lpill(ctx, d[2], g.X(d[0]), g.Y(1.02) - 4, { s: 11.5, a: "center", c: d[1] });
        });
        K.line(ctx, { x: g.X(t), y: g.T - 6 }, { x: g.X(t), y: g.B }, LT.ink, 2.4);
        lpill(ctx, "문턱", g.X(t), g.T - 8 > 60 ? g.T - 8 : 66, { s: 10.5, a: "center", c: LT.ink, box: [0, 446] });
        /* 입체 미니어처: 받은 편지함과 스팸함 — 쌓인 편지 높이 = 메일 수 */
        function tray(x, lab, nW, nR, warn) {
          var by = CH - 66, hw = Math.max(nW ? 2 : 0, nW / 900 * 60), hr = Math.max(nR ? 2 : 0, nR / 900 * 60);
          cube(ctx, x, by, 66, 16, 30, "#c9a26b", "#e7c48f", "#9c7a49");
          if (hr) cube(ctx, x + 6, by - hr, 52, hr, 20, "#f37a85", "#ffb3ba", "#c9404d");
          if (hw) cube(ctx, x + 6, by - hr - hw, 52, hw, 20, "#ffffff", "#f6f8fb", "#cfd6df");
          lpill(ctx, lab, x + 40, by + 34, { s: 10.5, a: "center", c: LT.ink, box: [446, LW] });
          if (warn) lpill(ctx, warn, x + 40, by - hr - hw - 24, { s: 10.5, a: "center", c: LT.red, box: [446, LW] });
        }
        var nf = Math.round(900 * f), nc = Math.round(900 * c);
        tray(456, "받은 편지함", 900 - nf, 900 - nc, null);
        tray(534, "스팸함", nf, nc, nf ? "정상 " + nf + "통!" : null);
        note(ctx, "흰 = 정상 · 빨강 = 스팸 (하루 각 900통)", 452, 62, { s: 10 });
        card(ctx, LW + 8, W, CH, "판정", ok ? "두 조건 모두 만족" : "아직 맞지 않음", ok ? LT.green : LT.orange, [
          ["스팸함에 빠진 정상 메일", (f * 100).toFixed(2) + "%", f <= 0.01 ? LT.green : LT.red],
          ["막아 낸 스팸", (c * 100).toFixed(1) + "%", c >= 0.9 ? LT.green : LT.red],
          ["정상 900통 중 잘못 막힘", nf + " 통"],
          ["판단 단서", sd < 0.1 ? "내용 + 주소록" : "내용만"]
        ], f > 0.01 ? "정상 메일이 너무 많이 걸립니다" : (c < 0.9 ? "스팸을 덜 막습니다" : "두 실수를 함께 줄였습니다"), ok);
        note(ctx, "진한 부분 = 잘못 판단한 메일", LW + 26, 222);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "판단에 쓰는 단서", value: 0.12, options: [{ v: 0.12, t: "글 내용 점수만" }, { v: 0.08, t: "내용 + 보낸 사람 주소록 확인" }],
        onPick: function (x) { sd = x; draw(); } });
      api.slider({ label: "문턱", min: 0.30, max: 0.90, step: 0.005, value: 0.5, fmt: function (x) { return x.toFixed(3); },
        onInput: function (x) { t = x; draw(); } });
      api.info("두 산이 겹치는 곳에 문턱을 두면 어느 쪽으로든 실수가 생깁니다. 단서를 더하면 산의 모양이 어떻게 바뀌나요?");
      draw();
      return {
        judge: function () {
          var f = fp(), c = catchR();
          if (f > 0.01) return { ok: false, msg: "정상 메일 " + (f * 100).toFixed(2) + "%가 스팸함으로 — 상담 메일을 놓칠 수 있습니다." };
          if (c < 0.9) return { ok: false, msg: "스팸을 " + (c * 100).toFixed(1) + "%만 막습니다 — 90%에 모자랍니다." };
          return { ok: true, msg: "문턱 " + t.toFixed(3) + " — 정상 메일 오판 " + (f * 100).toFixed(2) + "%, 스팸 차단 " + (c * 100).toFixed(1) + "%." + (sd < 0.1 ? " 단서를 더하니 문턱을 고를 여유가 넓어졌지요." : "") };
        }
      };
    },
    hints: [
      "문턱을 오른쪽으로 옮기면 정상 메일 오판이 줄고, 왼쪽으로 옮기면 스팸을 더 막습니다. 두 조건이 <b>함께</b> 맞는 좁은 틈을 찾으세요.",
      "내용 점수만 쓰면 그 틈이 0.58~0.595로 아주 좁습니다. 보낸 사람 정보를 더하면 두 산이 좁아져 틈이 넓어집니다."
    ],
    solution: "내용 점수만: 문턱 <b>0.580~0.595</b>. 주소록 단서를 더하면: <b>0.490~0.645</b>.",
    why: "판단하는 기계에는 늘 <b>두 가지 실수</b>가 있습니다 — 멀쩡한 것을 걸러 내는 실수와, 걸러야 할 것을 놓치는 실수. 문턱 하나를 옮기면 한쪽이 줄고 다른 쪽이 늡니다. 어느 실수를 더 줄일지는 <b>사람이 정하는 가치 판단</b>입니다.<br>" +
      "둘을 함께 줄이는 방법은 문턱이 아니라 <b>더 좋은 단서(데이터)</b>입니다. 공청회에서 기술의 이득과 위험을 저울질했던 것처럼, 인공지능의 판단도 어느 쪽 실수를 감수할지 사회가 함께 정해야 합니다."
  },

  /* ------------------------------------------------------------------ 3. 증거의 양 */
  {
    id: "c3", about: "02", tag: "과학 기술과 쟁점", title: "자율주행차는 얼마나 달려 봐야 할까", short: "자율주행 시험",
    who: "🚗", name: "교통 안전 공청회",
    say: "“자율주행차 회사가 ‘시험 주행에서 <b>사고가 한 번도 없었으니</b> 사람보다 안전하다’고 주장해요. 사람 운전자는 평균 <b>100만 km에 한 번</b> 다치는 사고를 냅니다. 사고 0건으로 ‘사람보다 안전하다’고 <b>95% 확신</b>하려면, 적어도 몇 km를 달려 봐야 할까요? 시험 예산은 <b>400만 km</b> 까지입니다.”",
    predict: {
      q: "자율주행차가 1만 km를 사고 없이 달렸습니다. 사람보다 안전하다고 말할 수 있을까?",
      options: ["㉠ 그렇다 — 사고가 0건이니까", "㉡ 아직 알 수 없다 — 사람만큼 위험한 차도 1만 km는 대개 사고 없이 달린다", "㉢ 아니다 — 사람보다 위험하다는 뜻이다"],
      answer: 1
    },
    task: "시험 거리를 정해 <b>‘사람만큼 위험한 차라도 이 거리를 사고 없이 달릴 확률’이 5% 이하</b>가 되게 하세요. 400만 km를 넘으면 안 됩니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var lg = 4, cars = 10;
      function D() { return Math.pow(10, lg); }
      function p0(d) { return Math.exp(-d / 1e6); }
      var LW = 612;
      function km(d) { return d >= 1e6 ? (d / 1e6).toFixed(2) + " 백만 km" : Math.round(d / 1000) + " 천 km"; }
      function draw() {
        var CH = cv.H, d = D(), p = p0(d), over = d > 4e6 + 1, ok = p <= 0.05 && !over, l;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 530, y: CH - 46, rx: 96, ry: 16 });
        K.bigText(ctx, "사고 없이 달릴 확률 " + (p * 100).toFixed(1) + "%", 16, 36, 21, ok ? "#8ce99a" : "#ffffff");
        var g = K.chart(ctx, { x: 4, y: 46, w: 440, h: CH - 50, pl: 46, pb: 36, pt: 14, pr: 14, x0: 4, x1: 8, y0: 0, y1: 1, xt: 4, yt: 2, light: true,
          xf: function (q) { return ["1만", "10만", "100만", "1000만", "1억"][Math.round(q) - 4] + " km"; }, yf: function (q) { return Math.round(q * 100) + "%"; } });
        var xb = g.X(H.log10(4e6));
        ctx.fillStyle = "rgba(20,40,90,.08)"; ctx.fillRect(xb, g.T, g.R - xb, g.B - g.T);
        note(ctx, "예산 초과", (xb + g.R) / 2, g.T + 16, { s: 10.5, a: "center" });
        K.line(ctx, { x: g.L, y: g.Y(0.05) }, { x: g.R, y: g.Y(0.05) }, LT.red, 1.8, [6, 4]);
        lpill(ctx, "5%", g.L + 8, g.Y(0.05) - 6, { s: 10.5, c: LT.red });
        var pts = []; for (l = 4; l <= 8.0001; l += 0.02) pts.push([l, p0(Math.pow(10, l))]);
        K.plot(ctx, g, pts, LT.violet, { w: 2.8, light: true });
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(g.X(lg), g.Y(p), 7.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = ok ? LT.green : LT.violet; ctx.beginPath(); ctx.arc(g.X(lg), g.Y(p), 5, 0, 6.2832); ctx.fill();
        note(ctx, "사람만큼 위험한 차의 0건 확률", g.L + 8, g.B - 40, { s: 10.5, c: LT.violet });
        /* 입체 미니어처: 시험 도로 위 자율 주행차 */
        var by = CH - 70;
        cube(ctx, 452, by, 132, 14, 64, "#4a5160", "#6b7383", "#363c48");
        ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
        ctx.beginPath(); ctx.moveTo(474, by - 11); ctx.lineTo(474 + 132, by - 11); ctx.stroke(); ctx.setLineDash([]);
        var cx = 470 + Math.min(1, (lg - 4) / 4) * 84;
        ctx.fillStyle = "rgba(10,15,30,.35)"; ctx.beginPath(); ctx.ellipse(cx + 22, by - 13, 22, 4, 0, 0, 6.2832); ctx.fill();
        cube(ctx, cx, by - 26, 36, 9, 18, "#1c7ed6", "#4dabf7", "#1864ab");
        cube(ctx, cx + 7, by - 33, 20, 7, 14, "#cfe8ff", "#e7f5ff", "#9cc8ef");
        ctx.fillStyle = "#212529"; [cx + 6, cx + 28].forEach(function (wx) { ctx.beginPath(); ctx.ellipse(wx, by - 17, 4, 4, 0, 0, 6.2832); ctx.fill(); });
        K.planet(ctx, cx + 21, by - 42, 3.2, "#ffffff", "#7a8494");
        lpill(ctx, "주행 " + km(d), 518, by - 66, { s: 11, a: "center", c: over ? LT.red : LT.ink, box: [446, LW] });
        lpill(ctx, "시험 도로", 518, CH - 18, { s: 10.5, a: "center", c: LT.mute, box: [446, LW] });
        var days = d / (cars * 500);
        card(ctx, LW + 8, W, CH, "판정", ok ? "근거가 됩니다" : (over ? "예산 초과" : "아직 우연일 수 있음"), ok ? LT.green : LT.orange, [
          ["시험 거리", km(d), over ? LT.red : LT.ink],
          ["사고 없이 달릴 확률", (p * 100).toFixed(1) + "%", p <= 0.05 ? LT.green : LT.red],
          ["차 " + cars + "대 · 하루 500 km", days >= 365 ? (days / 365).toFixed(1) + " 년" : Math.ceil(days) + " 일"]
        ], over ? "예산 400만 km를 넘었습니다" : (p > 0.05 ? "0건이 운일 확률이 큽니다" : "0건이 우연이라 보기 어렵습니다"), ok);
        note(ctx, "예산 사용", LW + 26, 192);
        K.bar(ctx, LW + 26, 200, W - LW - 52, d / 4e6, over ? LT.red : LT.blue);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "시험 거리 (눈금 한 칸 = 10배)", min: 4, max: 8, step: 0.05, value: 4,
        fmt: function (x) { var d = Math.pow(10, x); return d >= 1e6 ? (d / 1e6).toFixed(2) + " 백만 km" : Math.round(d / 1000) + " 천 km"; },
        onInput: function (x) { lg = x; draw(); } });
      api.seg({ label: "시험 차 대수", value: 10, options: [{ v: 10, t: "10대" }, { v: 100, t: "100대" }, { v: 1000, t: "1000대" }],
        onPick: function (x) { cars = x; draw(); } });
      api.info("이 확률이 크다면 ‘사고 0건’은 <b>운이 좋았을 뿐</b>일 수 있습니다. 확률이 5% 이하로 떨어져야 우연이라고 보기 어렵습니다.");
      draw();
      return {
        judge: function () {
          var d = D(), p = p0(d);
          if (d > 4e6 + 1) return { ok: false, msg: "시험 예산(400만 km)을 넘었습니다." };
          if (p > 0.05) return { ok: false, msg: "사고 없이 달릴 확률 " + (p * 100).toFixed(1) + "% — 사람만큼 위험한 차라도 이만큼은 운 좋게 달릴 수 있습니다." };
          return { ok: true, msg: (d / 1e6).toFixed(2) + " 백만 km 사고 0건 — 사람만큼 위험한 차였다면 이럴 확률이 " + (p * 100).toFixed(1) + "% 뿐이니, 더 안전하다고 말할 근거가 됩니다." };
        }
      };
    },
    hints: [
      "사람도 100만 km에 겨우 한 번 사고를 냅니다. 1만 km 쯤은 사람 운전자도 거의 늘 사고 없이 달립니다. 그래프가 5% 선 아래로 내려가는 곳을 찾으세요.",
      "사고 없이 달릴 확률은 약 e<sup>−거리/100만 km</sup>. 5%가 되려면 거리/100만 ≈ 3, 즉 약 300만 km."
    ],
    solution: "시험 거리를 <b>약 300만 ~ 400만 km</b>(눈금 6.5~6.6)에 두세요. 차 10대로는 약 2년이 걸립니다.",
    why: "‘한 번도 안 일어났다’는 것은 <b>충분히 많이 시도했을 때만</b> 증거가 됩니다. 사고가 드문 일일수록 필요한 시험의 양은 엄청나게 커집니다. 0건일 때 필요한 양은 대략 ‘기준 간격의 3배’라서 <b>3의 규칙</b>이라고도 부릅니다.<br>" +
      "과학 기술의 쟁점에서 ‘안전하다’, ‘효과 있다’는 주장을 들으면 <b>얼마나 많은 자료</b>에서 나온 결론인지 먼저 물어야 합니다. 공청회에서 필요한 것은 찬반의 목소리 크기가 아니라 이런 <b>증거의 무게</b>입니다."
  }
  ]
});
})();
