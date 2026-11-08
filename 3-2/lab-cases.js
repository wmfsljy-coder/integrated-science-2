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
      var H = api.h, cv = api.canvas(420), ctx = cv.ctx, W = cv.W;
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
      /* 거리 블록 두 개: 해 질 녘(깜빡임·꺼짐을 본다) / 오후 2시 먹구름(대낮에 켜지는지 본다) */
      function street(ox, oy, sky0, sky1, state, flick, title, tc) {
        var I = K.iso({ ox: ox, oy: oy, s: 1, L: 170, D: 120 }), i;
        I.box(ctx, 0, 0, -7, 170, 120, 0, "#c9cfd6", "#9aa3ae", "#7d8693");   /* 얇은 단색 받침 */
        I.box(ctx, 0, 0, 0, 170, 46, 3, "#e3e6ea", "#c3c9d0", "#a9b0ba");
        I.plane(ctx, .1, "#5c6370", null, 0, 170, 50, 120);
        for (i = 0; i < 5; i++) { var a = I.P(8 + i * 36, 85, .2), b = I.P(26 + i * 36, 85, .2); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        /* 뒤 하늘 판: 그 시각의 하늘 색 */
        var s0 = I.P(0, 0, 0), s1 = I.P(170, 0, 0), s2 = I.P(170, 0, 120), s3 = I.P(0, 0, 120);
        var sg = ctx.createLinearGradient(0, s3.y, 0, s0.y); sg.addColorStop(0, sky0); sg.addColorStop(1, sky1);
        I.quad(ctx, s0, s1, s2, s3, sg, "rgba(255,255,255,.6)");
        if (state === "cloud") { [[60, 96], [100, 104], [130, 92]].forEach(function (q) { var c = I.P(q[0], 0, q[1]); ctx.fillStyle = "rgba(110,118,130,.85)"; ctx.beginPath(); ctx.ellipse(c.x, c.y, 26, 11, .5, 0, 6.2832); ctx.fill(); }); }
        /* 가로등: 기둥 · 팔 · 등 · 위 센서 */
        var base = I.P(90, 30, 3), top = I.P(90, 30, 92), head = I.P(90, 62, 88), lit = state === "on" || state === "waste" || flick;
        if (lit) {
          var gp = I.P(90, 70, 0), cg = ctx.createRadialGradient(gp.x, gp.y, 4, gp.x, gp.y, 70); cg.addColorStop(0, flick ? "rgba(255,214,90,.28)" : "rgba(255,214,90,.55)"); cg.addColorStop(1, "rgba(255,214,90,0)");
          ctx.fillStyle = cg; ctx.beginPath(); ctx.ellipse(gp.x, gp.y, 70, 34, 0, 0, 6.2832); ctx.fill();
          ctx.fillStyle = flick ? "rgba(255,226,140,.18)" : "rgba(255,226,140,.34)"; ctx.beginPath(); ctx.moveTo(head.x - 6, head.y + 4); ctx.lineTo(head.x + 6, head.y + 4); ctx.lineTo(gp.x + 46, gp.y); ctx.lineTo(gp.x - 46, gp.y); ctx.closePath(); ctx.fill();
        }
        var pg = ctx.createLinearGradient(base.x - 4, 0, base.x + 4, 0); pg.addColorStop(0, "#5f6878"); pg.addColorStop(.5, "#e5e9ef"); pg.addColorStop(1, "#5f6878");
        ctx.fillStyle = pg; ctx.fillRect(base.x - 3.5, top.y, 7, base.y - top.y);
        ctx.strokeStyle = "#6b7484"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(top.x, top.y + 4); ctx.quadraticCurveTo(top.x - 2, head.y - 14, head.x, head.y - 2); ctx.stroke();
        ctx.fillStyle = "#59606e"; ctx.beginPath(); ctx.ellipse(head.x, head.y, 16, 7, -.45, 0, 6.2832); ctx.fill();
        if (lit) K.glow(ctx, head.x, head.y + 4, 6, flick ? "rgba(255,226,140,.7)" : "rgba(255,226,140,.98)", 3.4);
        else { ctx.fillStyle = "#adb5bd"; ctx.beginPath(); ctx.ellipse(head.x, head.y + 3, 9, 3.5, -.45, 0, 6.2832); ctx.fill(); }
        ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#868e96"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(top.x, top.y - 2, 5, Math.PI, 0); ctx.fill(); ctx.stroke();
        if (flick) { ctx.strokeStyle = LT.orange; ctx.lineWidth = 2.4; [[-28, 0], [24, 8]].forEach(function (z) { var x = head.x + z[0], y = head.y + z[1]; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 7); ctx.lineTo(x + 1, y - 10); ctx.lineTo(x + 8, y - 18); ctx.stroke(); }); }
        /* 걷는 사람 */
        I.person(ctx, 40, 22, 3, "#4dabf7", 1.5); I.person(ctx, 130, 34, 3, "#ff8787", 1.5);
        lpill(ctx, title, ox, oy - 132, { s: 12, a: "center", c: LT.ink, box: [0, LW] });
        lpill(ctx, tc[0], ox + 10, oy + 192, { s: 12, a: "center", c: tc[1], box: [ox - 150, Math.min(LW, ox + 160)] });
        return top;
      }
      function draw() {
        var r = sim(), CH = cv.H, ok = r.flips <= 2 && !r.dark && !r.waste, i, a;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 306, y: CH - 50, rx: 290, ry: 24 });
        K.bigText(ctx, "하루 " + r.flips + "번 바뀜", 16, 36, 22, r.flips <= 2 ? "#8ce99a" : "#ffffff");
        var cloudOn = false; for (i = 13 * 360; i < 15 * 360; i++) if (r.st[i]) { cloudOn = true; break; }
        var dusk = r.dark ? "off" : "on", flick = !r.dark && r.flips > 2;
        street(170, 190, "#ffb27a", "#6a5acd", dusk, flick, "해 질 녘 · 18시 무렵", r.dark ? ["어두운데 꺼짐 " + r.dark + "분", LT.red] : (flick ? ["깜빡깜빡 · 하루 " + r.flips + "번", LT.orange] : ["한 번에 켜짐", LT.green]));
        var t2 = street(450, 190, "#cfd6de", "#9aa5b3", cloudOn ? "waste" : "cloud", false, "오후 2시 · 먹구름", cloudOn ? ["대낮에 켜짐 (전기 낭비)", LT.red] : ["꺼져 있음", LT.green]);
        lpill(ctx, "밝기 센서", t2.x + 12, t2.y - 14, { s: 11, c: LT.blue, box: [300, LW] });
        note(ctx, "해 질 녘 센서 잡음 약 ±40 lux · 먹구름 때 약 700 lux", 16, CH - 14, { s: 11.5 });
        /* 오른쪽 카드: 판정 + 작은 하루 그래프 */
        card(ctx, LW + 8, W, CH, "판정", ok ? "깜빡임 없음" : "아직 고칠 곳 있음", ok ? LT.green : LT.orange, [
          ["하루에 바뀐 횟수", r.flips + " 번", r.flips <= 2 ? LT.green : LT.red],
          ["50 lux보다 어두운데 꺼짐", r.dark + " 분", r.dark ? LT.red : LT.green],
          ["1000 lux보다 밝은데 켜짐", r.waste + " 분", r.waste ? LT.red : LT.green]
        ], r.dark ? "어두운데 꺼집니다" : (r.waste ? "밝은데 켜집니다" : (r.flips > 2 ? "문턱 근처에서 깜빡입니다" : "두 문턱 사이 간격이 잡음을 막음")), ok);
        var g = K.chart(ctx, { x: LW + 12, y: 180, w: W - LW - 22, h: 166, pl: 34, pb: 40, pt: 12, pr: 8, x0: 0, x1: 24, y0: 0, y1: 5, xt: 4, yt: 5, light: true,
          xf: function (h) { return h + "시"; }, yf: function (q) { return ["1", "10", "100", "1천", "1만", "10만"][Math.round(q)]; } });
        function GX(k) { return g.X(k / 360); }
        function GY(l) { return g.Y(H.log10(Math.max(l, 1))); }
        for (i = 0, a = -1; i <= NS; i++) {
          if (i < NS && r.st[i]) { if (a < 0) a = i; }
          else if (a >= 0) { ctx.fillStyle = "rgba(245,159,0,.9)"; ctx.fillRect(GX(a), g.B + 22, Math.max(1.5, GX(i) - GX(a)), 7); a = -1; }
        }
        note(ctx, "켜짐", g.L - 4, g.B + 30, { s: 10.5, a: "right", c: "#a85d00" });
        var pts = []; for (var j = 0; j < NS; j += 24) pts.push([j / 360, H.log10(Math.max(SENS[j], 1))]);
        K.plot(ctx, g, pts, LT.blue, { w: 1.2, light: true, glow: false });
        K.line(ctx, { x: g.L, y: GY(ON) }, { x: g.R, y: GY(ON) }, LT.orange, 1.8, [5, 4]);
        K.line(ctx, { x: g.L, y: GY(OFF) }, { x: g.R, y: GY(OFF) }, LT.teal, 1.8, [5, 4]);
        function yl(y) { return Math.max(g.T + 14, Math.min(g.B - 4, y)); }
        note(ctx, "켜기 " + ON, g.R - 2, yl(GY(ON) + (ON >= OFF ? -5 : 15)), { s: 10.5, a: "right", c: LT.orange, w: "900" });
        note(ctx, "끄기 " + OFF, g.R - 2, yl(GY(OFF) + (ON >= OFF ? 15 : -5)), { s: 10.5, a: "right", c: LT.teal, w: "900" });
        note(ctx, "센서 밝기(lux) · 하루", LW + 26, 180, { s: 10.5, c: LT.blue });
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
      var H = api.h, cv = api.canvas(420), ctx = cv.ctx, W = cv.W;
      var t = 0.5, sd = 0.12;
      function fp() { return 1 - Phi((t - 0.3) / sd); }
      function catchR() { return 1 - Phi((t - 0.75) / sd); }
      function pdf(x, m) { return Math.exp(-0.5 * Math.pow((x - m) / sd, 2)); }
      var LW = 612;
      /* 우편 분류 책상 블록: 스팸 필터 기계 → 두 편지함(쌓인 편지 높이 = 메일 수) */
      var ID = K.iso({ ox: 300, oy: 112, s: 1, L: 300, D: 200 });
      function letters(x0, y0, nW, nR) {                     /* 편지 더미: 아래 빨강(스팸) · 위 흰색(정상) */
        var hr = nR ? Math.max(2, nR / 900 * 70) : 0, hw = nW ? Math.max(2, nW / 900 * 70) : 0, z = 4;
        if (hr) { ID.box(ctx, x0 + 8, y0 + 8, z, x0 + 72, y0 + 52, z + hr, "#ffb3ba", "#f37a85", "#c9404d"); for (var k = 4; k < hr; k += 4) { var a = ID.P(x0 + 8, y0 + 52, z + k), b = ID.P(x0 + 72, y0 + 52, z + k); ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } z += hr; }
        if (hw) { ID.box(ctx, x0 + 8, y0 + 8, z, x0 + 72, y0 + 52, z + hw, "#ffffff", "#f1f3f5", "#cfd6df"); for (var k2 = 4; k2 < hw; k2 += 4) { var c = ID.P(x0 + 8, y0 + 52, z + k2), d = ID.P(x0 + 72, y0 + 52, z + k2); ctx.strokeStyle = "rgba(120,130,150,.3)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(d.x, d.y); ctx.stroke(); } z += hw; }
        return ID.P(x0 + 40, y0 + 30, z);
      }
      function tray(x0, y0, col) {
        ID.box(ctx, x0, y0, 0, x0 + 80, y0 + 60, 4, K.tint(col, 1.15), col, K.tint(col, .8));
        ID.box(ctx, x0, y0, 4, x0 + 80, y0 + 3, 22, K.tint(col, 1.1), col, K.tint(col, .8));
        ID.box(ctx, x0, y0 + 3, 4, x0 + 3, y0 + 60, 22, K.tint(col, 1.1), col, K.tint(col, .8));
      }
      function trayFront(x0, y0, col) {
        ID.box(ctx, x0, y0 + 57, 4, x0 + 80, y0 + 60, 14, K.tint(col, 1.1), K.tint(col, .95), K.tint(col, .8));
        ID.box(ctx, x0 + 77, y0, 4, x0 + 80, y0 + 60, 14, K.tint(col, 1.1), K.tint(col, .95), K.tint(col, .8));
      }
      function draw() {
        var CH = cv.H, f = fp(), c = catchR(), ok = f <= 0.01 && c >= 0.9, x;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 300, y: CH - 40, rx: 280, ry: 24 });
        K.bigText(ctx, "문턱 " + t.toFixed(3), 16, 36, 22, ok ? "#8ce99a" : "#ffffff");
        var nf = Math.round(900 * f), nc = Math.round(900 * c);
        ID.box(ctx, 0, 0, -12, 300, 200, 0, "#d9b98f", "#a47148", "#7f5539");
        /* 필터 기계 (뒤) */
        ID.box(ctx, 110, 14, 0, 210, 74, 64, "#e7f5ff", "#d0ebff", "#a5d8ff");
        ID.box(ctx, 140, 30, 64, 180, 58, 70, "#f8f9fa", "#dee2e6", "#ced4da");
        for (var q = 0; q < 4; q++) { var lp = ID.P(146 + q * 8, 44, 74 + q * 5); ctx.fillStyle = q % 2 ? "#ffe3e3" : "#ffffff"; ctx.strokeStyle = "#adb5bd"; ctx.lineWidth = 1; ctx.beginPath(); ctx.rect(lp.x - 9, lp.y - 5, 18, 10); ctx.fill(); ctx.stroke(); }
        var dial = ID.P(160, 74, 40); ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "#495057"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(dial.x, dial.y, 14, 12, 0, 0, 6.2832); ctx.fill(); ctx.stroke();
        var ang = Math.PI * (0.8 + 1.4 * (t - 0.3) / 0.6); ctx.strokeStyle = "#e03131"; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(dial.x, dial.y); ctx.lineTo(dial.x + Math.cos(ang) * 11, dial.y + Math.sin(ang) * 9); ctx.stroke();
        if (sd < 0.1) { var bk = ID.P(196, 74, 26); ctx.fillStyle = "#ffd43b"; ctx.strokeStyle = "#b08900"; ctx.beginPath(); ctx.rect(bk.x - 8, bk.y - 10, 16, 20); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#b08900"; ctx.fillRect(bk.x - 5, bk.y - 5, 10, 2); ctx.fillRect(bk.x - 5, bk.y, 10, 2); }
        /* 홈통 두 개 */
        ID.box(ctx, 120, 74, 18, 140, 128, 22, "#ced4da", "#adb5bd", "#868e96");
        ID.box(ctx, 210, 30, 18, 228, 50, 22, "#ced4da", "#adb5bd", "#868e96");
        /* 받은 편지함(왼쪽 앞) · 스팸함(오른쪽) */
        tray(90, 128, "#4dabf7"); var tA = letters(90, 128, 900 - nf, 900 - nc); trayFront(90, 128, "#4dabf7");
        tray(206, 52, "#ff8787"); var tB = letters(206, 52, nf, nc); trayFront(206, 52, "#ff8787");
        var mk = ID.P(160, 14, 70); lpill(ctx, "스팸 필터 · 다이얼 = 문턱" + (sd < 0.1 ? " · 주소록" : ""), mk.x, mk.y - 18, { s: 11.5, a: "center", c: LT.ink, box: [0, LW] });
        var la = ID.P(90, 188, 0), lb = ID.P(286, 112, 0);
        lpill(ctx, "받은 편지함 · 정상 " + (900 - nf) + " · 스팸 " + (900 - nc), 190, CH - 22, { s: 12, a: "center", c: "#1864ab", box: [0, LW] });
        lpill(ctx, "스팸함 · 스팸 " + nc + " · 정상 " + nf, 470, CH - 22, { s: 12, a: "center", c: "#c92a2a", box: [0, LW] });
        if (nf) lpill(ctx, "⚠ 정상 메일 " + nf + "통이 스팸함에!", 470, CH - 56, { s: 12, a: "center", c: LT.red, box: [300, LW] });
        note(ctx, "흰 편지 = 정상 · 빨간 편지 = 스팸 (하루 각 900통)", 16, 60, { s: 11.5 });
        /* 오른쪽 카드: 판정 + 두 산 그래프 */
        card(ctx, LW + 8, W, CH, "판정", ok ? "두 조건 모두 만족" : "아직 맞지 않음", ok ? LT.green : LT.orange, [
          ["스팸함에 빠진 정상 메일", (f * 100).toFixed(2) + "%", f <= 0.01 ? LT.green : LT.red],
          ["막아 낸 스팸", (c * 100).toFixed(1) + "%", c >= 0.9 ? LT.green : LT.red],
          ["정상 900통 중 잘못 막힘", nf + " 통"],
          ["판단 단서", sd < 0.1 ? "내용 + 주소록" : "내용만"]
        ], f > 0.01 ? "정상 메일이 너무 많이 걸립니다" : (c < 0.9 ? "스팸을 덜 막습니다" : "두 실수를 함께 줄였습니다"), ok);
        var g = K.chart(ctx, { x: LW + 12, y: 194, w: W - LW - 22, h: 170, pl: 12, pb: 30, pt: 22, pr: 10, x0: 0, x1: 1, y0: 0, y1: 1.15, xt: 4, yt: 1, light: true,
          yf: function () { return ""; }, xl: "스팸 점수 →" });
        [[0.3, LT.teal, "정상", "rgba(12,133,153,.38)"], [0.75, LT.red, "스팸", "rgba(224,49,49,.32)"]].forEach(function (dd) {
          var lo = dd[0] < 0.5 ? t : 0, hi = dd[0] < 0.5 ? 1 : t;
          ctx.fillStyle = dd[3]; ctx.beginPath(); ctx.moveTo(g.X(lo), g.B);
          for (x = lo; x <= hi + 1e-9; x += 0.005) ctx.lineTo(g.X(x), g.Y(pdf(x, dd[0])));
          ctx.lineTo(g.X(hi), g.B); ctx.closePath(); ctx.fill();
          var pts = []; for (x = 0; x <= 1.0001; x += 0.005) pts.push([x, pdf(x, dd[0])]);
          K.plot(ctx, g, pts, dd[1], { w: 2.2, light: true });
          note(ctx, dd[2], g.X(dd[0]), g.Y(1.02) - 3, { s: 11, a: "center", c: dd[1], w: "900" });
        });
        K.line(ctx, { x: g.X(t), y: g.T - 4 }, { x: g.X(t), y: g.B }, LT.ink, 2.2);
        note(ctx, "진한 부분 = 잘못 판단한 메일", LW + 24, 190, { s: 10.5 });
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
      var H = api.h, cv = api.canvas(400), ctx = cv.ctx, W = cv.W;
      var lg = 4, cars = 10;
      function D() { return Math.pow(10, lg); }
      function p0(d) { return Math.exp(-d / 1e6); }
      var LW = 612;
      function km(d) { return d >= 1e6 ? (d / 1e6).toFixed(2) + " 백만 km" : Math.round(d / 1000) + " 천 km"; }
      /* 시험 도로 블록: 길이 눈금이 한 칸에 10배(1만 → 1억 km). 차가 달린 만큼 도로가 칠해지고, 예산 밖은 막혀 있다 */
      var IRD = K.iso({ ox: 118, oy: 118, s: .9, L: 420, D: 96 });
      function carAt(x, y, sc) {
        var I = IRD;
        var sh = I.P(x + 14, y + 10, 0); ctx.fillStyle = "rgba(10,15,30,.28)"; ctx.beginPath(); ctx.ellipse(sh.x, sh.y, 20 * sc, 6 * sc, 0, 0, 6.2832); ctx.fill();
        I.box(ctx, x, y, 3, x + 30 * sc, y + 16 * sc, 12 * sc, "#4dabf7", "#1c7ed6", "#1864ab");
        I.box(ctx, x + 7 * sc, y + 2 * sc, 12 * sc, x + 22 * sc, y + 14 * sc, 20 * sc, "#e7f5ff", "#a5d8ff", "#74c0fc");
        var ld = I.P(x + 15 * sc, y + 8 * sc, 24 * sc); K.planet(ctx, ld.x, ld.y, 3.2 * sc, "#ffffff", "#495057");
        [[x + 6 * sc, y + 16 * sc], [x + 24 * sc, y + 16 * sc]].forEach(function (w) { var wp = I.P(w[0], w[1], 4); ctx.fillStyle = "#212529"; ctx.beginPath(); ctx.ellipse(wp.x, wp.y, 4 * sc, 4.4 * sc, 0, 0, 6.2832); ctx.fill(); });
      }
      function draw() {
        var CH = cv.H, d = D(), p = p0(d), over = d > 4e6 + 1, ok = p <= 0.05 && !over, l, i;
        ctx.clearRect(0, 0, W, CH);
        K.studio(ctx, 0, 0, LW, CH, { x: 306, y: CH - 40, rx: 290, ry: 24 });
        K.bigText(ctx, "사고 없이 달릴 확률 " + (p * 100).toFixed(1) + "%", 16, 36, 21, ok ? "#8ce99a" : "#ffffff");
        var I = IRD, xb = (H.log10(4e6) - 4) * 100, xc = (lg - 4) * 100;
        I.box(ctx, 0, 0, -7, 420, 96, 0, "#a9d18e", "#8a6a48", "#73573b");   /* 얇은 단색 받침 */
        I.box(ctx, 0, 26, 0, 420, 74, 1.5, "#5c6370", "#4a5160", "#3d434f");
        I.plane(ctx, 1.6, ok ? "rgba(15,159,118,.55)" : "rgba(28,126,214,.5)", null, 0, Math.min(xc, 420), 28, 72);
        for (i = 0; i < 26; i++) { var a = I.P(6 + i * 16, 50, 1.7), b = I.P(14 + i * 16, 50, 1.7); ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        /* 예산 밖: 줄무늬 바닥 + 차단봉 */
        ctx.save(); ctx.globalAlpha = .55; I.plane(ctx, 1.8, "rgba(120,130,145,.8)", null, xb, 420, 26, 74); ctx.restore();
        for (i = 0; i < 6; i++) { var s0 = I.P(xb + 6 + i * 26, 26, 2), s1 = I.P(xb + 18 + i * 26, 74, 2); ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(s0.x, s0.y); ctx.lineTo(s1.x, s1.y); ctx.stroke(); }
        I.box(ctx, xb - 2, 20, 0, xb + 2, 24, 22, "#f1f3f5", "#dee2e6", "#adb5bd");
        I.box(ctx, xb - 1.5, 24, 16, xb + 1.5, 78, 20, "#ff8787", "#e03131", "#c92a2a");
        var bl = I.P(xb, 24, 26); lpill(ctx, "예산 400만 km", bl.x, bl.y - 12, { s: 11.5, a: "center", c: LT.red, box: [0, LW] });
        /* 거리 표지판: 1만 · 10만 · 100만 · 1000만 · 1억 km */
        ["1만", "10만", "100만", "1000만", "1억"].forEach(function (s, k) {
          var px = k * 100 + (k === 4 ? -4 : 0), pb = I.P(px, 88, 0), pt = I.P(px, 88, 18);
          ctx.strokeStyle = "#6b7484"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pb.x, pb.y); ctx.lineTo(pt.x, pt.y); ctx.stroke();
          lpill(ctx, s + " km", pt.x, pt.y + 26, { s: 11.5, a: "center", c: LT.ink, box: [0, LW] });
        });
        /* 시험 차 */
        var nC = cars === 10 ? 1 : (cars === 100 ? 2 : 3);
        for (i = nC - 1; i >= 0; i--) carAt(Math.max(0, Math.min(400, xc) - i * 12), 30 + i * 14 - (nC - 1) * 4, 1.25);
        var cp = I.P(Math.min(400, xc) + 18, 40, 34);
        lpill(ctx, "주행 " + km(d) + " · 사고 0건", Math.max(110, Math.min(520, cp.x)), cp.y - 24, { s: 12, a: "center", c: over ? LT.red : LT.ink, box: [0, LW] });
        note(ctx, "도로 한 칸 = 10배 · 차 " + cars + "대 (그림은 " + nC + "대)", 16, 60, { s: 11.5 });
        lpill(ctx, ok ? "0건이 우연이라 보기 어렵다" : (over ? "예산을 넘어 더 달릴 수 없다" : "이만큼은 사람만큼 위험한 차도 0건일 수 있다"), 306, CH - 16, { s: 12, a: "center", c: ok ? LT.green : LT.orange, box: [0, LW] });
        /* 오른쪽 카드: 판정 + 작은 그래프 */
        var days = d / (cars * 500);
        card(ctx, LW + 8, W, CH, "판정", ok ? "근거가 됩니다" : (over ? "예산 초과" : "아직 우연일 수 있음"), ok ? LT.green : LT.orange, [
          ["시험 거리", km(d), over ? LT.red : LT.ink],
          ["사고 없이 달릴 확률", (p * 100).toFixed(1) + "%", p <= 0.05 ? LT.green : LT.red],
          ["차 " + cars + "대 · 하루 500 km", days >= 365 ? (days / 365).toFixed(1) + " 년" : Math.ceil(days) + " 일"]
        ], over ? "예산 400만 km를 넘었습니다" : (p > 0.05 ? "0건이 운일 확률이 큽니다" : "0건이 우연이라 보기 어렵습니다"), ok);
        note(ctx, "예산 사용", LW + 26, 182);
        K.bar(ctx, LW + 26, 190, W - LW - 52, d / 4e6, over ? LT.red : LT.blue);
        var g = K.chart(ctx, { x: LW + 12, y: 210, w: W - LW - 22, h: 134, pl: 36, pb: 26, pt: 10, pr: 10, x0: 4, x1: 8, y0: 0, y1: 1, xt: 4, yt: 2, light: true,
          xf: function (q) { return ["1만", "10만", "100만", "1천만", "1억"][Math.round(q) - 4]; }, yf: function (q) { return Math.round(q * 100) + "%"; } });
        var xg = g.X(H.log10(4e6)); ctx.fillStyle = "rgba(20,40,90,.08)"; ctx.fillRect(xg, g.T, g.R - xg, g.B - g.T);
        K.line(ctx, { x: g.L, y: g.Y(0.05) }, { x: g.R, y: g.Y(0.05) }, LT.red, 1.6, [5, 4]);
        note(ctx, "5%", g.L + 4, g.Y(0.05) - 4, { s: 10.5, c: LT.red, w: "900" });
        var pts = []; for (l = 4; l <= 8.0001; l += 0.02) pts.push([l, p0(Math.pow(10, l))]);
        K.plot(ctx, g, pts, LT.violet, { w: 2.4, light: true });
        ctx.fillStyle = "#ffffff"; ctx.beginPath(); ctx.arc(g.X(lg), g.Y(p), 6.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = ok ? LT.green : LT.violet; ctx.beginPath(); ctx.arc(g.X(lg), g.Y(p), 4.5, 0, 6.2832); ctx.fill();
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
