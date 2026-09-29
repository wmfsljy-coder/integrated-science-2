/* 통합과학2 Ⅲ-2 과학 기술과 사회 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

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
    id: "c1", tag: "센서와 자동 제어", title: "깜빡이는 스마트 가로등", short: "스마트 가로등",
    who: "💡", name: "시청 도로과",
    say: "“새로 단 스마트 가로등이 해 질 녘마다 <b>수십 번 깜빡여서</b> 민원이 들어와요. 밝기 센서 값이 정해 둔 문턱 근처에서 흔들리는 게 원인 같습니다. 게다가 오후에 먹구름이 끼면 대낮에 켜지기도 해요. 켜는 문턱과 끄는 문턱을 새로 정해 주세요.”",
    predict: {
      q: "해 질 녘 센서 값이 ±40 lux 씩 흔들리며 천천히 어두워집니다. ‘문턱보다 어두우면 켜고, 밝으면 끈다’ 문턱 하나만 쓰면?",
      options: ["㉠ 문턱 근처에서 켜졌다 꺼졌다를 여러 번 되풀이한다", "㉡ 정확히 한 번만 켜진다", "㉢ 아예 켜지지 않는다"],
      answer: 0
    },
    task: "켜는 문턱과 끄는 문턱을 정해 <b>하루 두 번만</b>(해 질 녘 켜짐, 새벽 꺼짐) 바뀌고, <b>50 lux 보다 어두울 때는 늘 켜져</b> 있으며, <b>1000 lux 보다 밝을 때는 꺼져</b> 있게 하세요.",
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
      var gx0 = 70, gx1 = 610, gy0 = 50, gy1 = 270;
      function GX(i) { return gx0 + i / NS * (gx1 - gx0); }
      function GY(l) { return gy1 - (H.log10(Math.max(l, 1))) / 5 * (gy1 - gy0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var r = sim();
        H.text(ctx, "하루 동안의 센서 밝기 (lux, 로그 눈금)", 40, 30, { s: 14, w: "900" });
        for (var i = 0, a = -1; i <= NS; i++) {
          if (i < NS && r.st[i]) { if (a < 0) a = i; }
          else if (a >= 0) { H.box(ctx, GX(a), gy1 + 4, Math.max(1.5, GX(i) - GX(a)), 10, H.v("--amber"), 0.9); a = -1; }
        }
        H.text(ctx, "가로등 켜짐", gx0, gy1 + 30, { s: 10.5, w: "800", c: H.v("--amber-700") });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        [1, 10, 100, 1000, 10000, 100000].forEach(function (l) { H.text(ctx, l >= 1000 ? (l / 1000) + "천" : l + "", gx0 - 6, GY(l) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        [0, 6, 12, 18, 24].forEach(function (h) { H.text(ctx, h + "시", GX(h * 360), gy1 + 48, { s: 10, a: "center", c: H.v("--mist") }); });
        var pts = []; for (var j = 0; j < NS; j += 12) pts.push([GX(j), GY(SENS[j])]);
        H.line(ctx, pts, H.v("--brand"), 1.5);
        H.line(ctx, [[gx0, GY(ON)], [gx1, GY(ON)]], H.v("--amber-700"), 1.5);
        H.line(ctx, [[gx0, GY(OFF)], [gx1, GY(OFF)]], H.v("--teal-700"), 1.5);
        H.text(ctx, "켜는 문턱 " + ON, gx1 + 6, GY(ON) + (ON >= OFF ? -4 : 12), { s: 10.5, w: "800", c: H.v("--amber-700") });
        H.text(ctx, "끄는 문턱 " + OFF, gx1 + 6, GY(OFF) + (ON >= OFF ? 12 : -4), { s: 10.5, w: "800", c: H.v("--teal-700") });
        H.rows(ctx, 730, 60, [
          ["하루에 바뀐 횟수", r.flips + " 번", r.flips <= 2 ? "--green-700" : "--rose-700", true],
          ["50 lux 보다 어두운데 꺼짐", r.dark + " 분", r.dark ? "--rose-700" : "--green-700"],
          ["1000 lux 보다 밝은데 켜짐", r.waste + " 분", r.waste ? "--rose-700" : "--green-700"]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "켜는 문턱 (이보다 어두우면 켬)", min: 0, max: 1000, step: 25, value: 300, fmt: function (x) { return x + " lux"; },
        onInput: function (x) { ON = x; draw(); } });
      api.slider({ label: "끄는 문턱 (이보다 밝으면 끔)", min: 0, max: 1500, step: 25, value: 300, fmt: function (x) { return x + " lux"; },
        onInput: function (x) { OFF = x; draw(); } });
      api.info("센서는 10초마다 밝기를 재는데, 해 질 녘·새벽에는 값이 ±40 lux 쯤 흔들립니다. 오후 2시 무렵 먹구름이 지나가면 약 700 lux 까지 어두워져요.");
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
    why: "자동 제어 장치는 <b>센서(측정) → 판단 → 작동</b>으로 움직입니다. 할머니 딸기 온실의 온도 센서와 환풍기도 같은 구조였지요. 문제는 센서 값에는 늘 <b>잡음</b>이 있다는 것이에요.<br>" +
      "켜는 기준과 끄는 기준을 다르게 두는 것을 <b>이력(히스테리시스) 문턱</b>이라 합니다. 집의 보일러 온도 조절기, 냉장고도 이렇게 해서 스위치가 쉴 새 없이 켜졌다 꺼지는 것을 막습니다. 좋은 기술은 센서를 믿되 <b>센서의 흔들림까지</b> 계산에 넣습니다."
  },

  /* ------------------------------------------------------------------ 2. 판단 문턱과 두 가지 오류 */
  {
    id: "c2", tag: "인공지능의 판단", title: "스팸 필터의 문턱", short: "스팸 필터",
    who: "📧", name: "학교 전산실",
    say: "“학교 메일 필터가 메일마다 <b>스팸 점수</b>(0 ~ 1)를 매깁니다. 문턱보다 높으면 스팸함으로 보내요. 학부모 상담 메일이 스팸함에 빠지면 큰일이라 <b>정상 메일은 1% 이하</b>만 걸려야 하고, 동시에 <b>스팸은 90% 이상</b> 막아야 합니다.”",
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
      var gx0 = 60, gx1 = 580, gy0 = 60, gy1 = 270;
      function GX(x) { return gx0 + x * (gx1 - gx0); }
      function pdf(x, m) { return Math.exp(-0.5 * Math.pow((x - m) / sd, 2)); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "메일별 스팸 점수의 분포", 40, 30, { s: 14, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        [0, 0.25, 0.5, 0.75, 1].forEach(function (x) { H.text(ctx, x + "", GX(x), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        [[0.3, "--teal", "정상 메일"], [0.75, "--rose", "스팸"]].forEach(function (d) {
          var pts = [];
          for (var x = 0; x <= 1.0001; x += 0.005) pts.push([GX(x), gy1 - pdf(x, d[0]) * 170]);
          for (var x2 = 0; x2 <= 1.0001; x2 += 0.005) {
            var bad = d[0] < 0.5 ? x2 >= t : x2 < t;
            if (bad) H.box(ctx, GX(x2), gy1 - pdf(x2, d[0]) * 170, (gx1 - gx0) * 0.005 + 0.5, pdf(x2, d[0]) * 170, H.v(d[1]), 0.45);
          }
          H.line(ctx, pts, H.v(d[1]), 2.5);
          H.text(ctx, d[2], GX(d[0]), gy1 - 180, { s: 12, w: "900", a: "center", c: H.v(d[1] + "-700") });
        });
        H.line(ctx, [[GX(t), gy0 - 6], [GX(t), gy1]], H.v("--ink"), 2);
        H.text(ctx, "문턱 " + t.toFixed(3), GX(t), gy0 - 12, { s: 12, w: "900", a: "center" });
        H.text(ctx, "진한 부분 = 잘못 판단한 메일", gx0, 312, { s: 11, c: H.v("--mist") });
        var f = fp(), c = catchR();
        H.rows(ctx, 630, 70, [
          ["스팸함에 빠진 정상 메일", (f * 100).toFixed(2) + "%", f <= 0.01 ? "--green-700" : "--rose-700", true],
          ["막아 낸 스팸", (c * 100).toFixed(1) + "%", c >= 0.9 ? "--green-700" : "--rose-700", true],
          ["하루 정상 900통 중 잘못 막힘", Math.round(900 * f) + " 통"]
        ], 66);
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
          if (f > 0.01) return { ok: false, msg: "정상 메일 " + (f * 100).toFixed(2) + "% 가 스팸함으로 — 상담 메일을 놓칠 수 있습니다." };
          if (c < 0.9) return { ok: false, msg: "스팸을 " + (c * 100).toFixed(1) + "% 만 막습니다 — 90% 에 모자랍니다." };
          return { ok: true, msg: "문턱 " + t.toFixed(3) + " — 정상 메일 오판 " + (f * 100).toFixed(2) + "%, 스팸 차단 " + (c * 100).toFixed(1) + "%." + (sd < 0.1 ? " 단서를 더하니 문턱을 고를 여유가 넓어졌지요." : "") };
        }
      };
    },
    hints: [
      "문턱을 오른쪽으로 옮기면 정상 메일 오판이 줄고, 왼쪽으로 옮기면 스팸을 더 막습니다. 두 조건이 <b>함께</b> 맞는 좁은 틈을 찾으세요.",
      "내용 점수만 쓰면 그 틈이 0.58 ~ 0.595 로 아주 좁습니다. 보낸 사람 정보를 더하면 두 산이 좁아져 틈이 넓어져요."
    ],
    solution: "내용 점수만: 문턱 <b>0.580 ~ 0.595</b>. 주소록 단서를 더하면: <b>0.490 ~ 0.645</b>.",
    why: "판단하는 기계에는 늘 <b>두 가지 실수</b>가 있습니다 — 멀쩡한 것을 걸러 내는 실수와, 걸러야 할 것을 놓치는 실수. 문턱 하나를 옮기면 한쪽이 줄고 다른 쪽이 늘지요. 어느 실수를 더 줄일지는 <b>사람이 정하는 가치 판단</b>입니다.<br>" +
      "둘을 함께 줄이는 방법은 문턱이 아니라 <b>더 좋은 단서(데이터)</b>입니다. 공청회에서 기술의 이득과 위험을 저울질했던 것처럼, 인공지능의 판단도 어느 쪽 실수를 감수할지 사회가 함께 정해야 합니다."
  },

  /* ------------------------------------------------------------------ 3. 증거의 양 */
  {
    id: "c3", tag: "과학 기술과 쟁점", title: "자율주행차는 얼마나 달려 봐야 할까", short: "자율주행 시험",
    who: "🚗", name: "교통 안전 공청회",
    say: "“자율주행차 회사가 ‘시험 주행에서 <b>사고가 한 번도 없었으니</b> 사람보다 안전하다’고 주장해요. 사람 운전자는 평균 <b>100만 km 에 한 번</b> 다치는 사고를 냅니다. 사고 0건으로 ‘사람보다 안전하다’고 <b>95% 확신</b>하려면, 적어도 몇 km 를 달려 봐야 할까요? 시험 예산은 <b>400만 km</b> 까지입니다.”",
    predict: {
      q: "자율주행차가 1만 km 를 사고 없이 달렸습니다. 사람보다 안전하다고 말할 수 있을까?",
      options: ["㉠ 그렇다 — 사고가 0건이니까", "㉡ 아직 알 수 없다 — 사람만큼 위험한 차도 1만 km 는 대개 사고 없이 달린다", "㉢ 아니다 — 사람보다 위험하다는 뜻이다"],
      answer: 1
    },
    task: "시험 거리를 정해 <b>‘사람만큼 위험한 차라도 이 거리를 사고 없이 달릴 확률’이 5% 이하</b>가 되게 하세요. 400만 km 를 넘으면 안 됩니다.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var lg = 4, cars = 10;
      function D() { return Math.pow(10, lg); }
      function p0(d) { return Math.exp(-d / 1e6); }
      var gx0 = 70, gx1 = 580, gy0 = 50, gy1 = 260;
      function GX(l) { return gx0 + (l - 4) / 4 * (gx1 - gx0); }
      function GY(p) { return gy1 - p * (gy1 - gy0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "사람만큼 위험한 차가 사고 없이 달릴 확률", 40, 30, { s: 14, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        [4, 5, 6, 7, 8].forEach(function (l) { H.text(ctx, ["1만", "10만", "100만", "1000만", "1억"][l - 4] + " km", GX(l), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        ["0%", "50%", "100%"].forEach(function (s, i) { H.text(ctx, s, gx0 - 6, GY(i / 2) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        H.line(ctx, [[gx0, GY(0.05)], [gx1, GY(0.05)]], H.v("--rose"), 1.5);
        H.text(ctx, "5%", gx1 + 6, GY(0.05) + 4, { s: 11, w: "800", c: H.v("--rose-700") });
        H.box(ctx, GX(H.log10(4e6)), gy0, gx1 - GX(H.log10(4e6)), gy1 - gy0, H.v("--mist"), 0.15);
        H.text(ctx, "예산 초과", (GX(H.log10(4e6)) + gx1) / 2, gy0 + 16, { s: 11, w: "800", a: "center", c: H.v("--mist") });
        var pts = []; for (var l = 4; l <= 8.0001; l += 0.02) pts.push([GX(l), GY(p0(Math.pow(10, l)))]);
        H.line(ctx, pts, H.v("--violet"), 2.5);
        var d = D(), p = p0(d);
        H.dot(ctx, GX(lg), GY(p), 6, H.v("--violet-700"));
        var days = d / (cars * 500);
        H.rows(ctx, 630, 70, [
          ["시험 거리", d >= 1e6 ? (d / 1e6).toFixed(2) + " 백만 km" : Math.round(d / 1000) + " 천 km", d > 4e6 ? "--rose-700" : null],
          ["사고 없이 달릴 확률", (p * 100).toFixed(1) + "%", p <= 0.05 ? "--green-700" : "--rose-700", true],
          ["시험 차 " + cars + "대 · 하루 500 km", days >= 365 ? (days / 365).toFixed(1) + " 년" : Math.ceil(days) + " 일"]
        ], 62);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "시험 거리 (눈금 한 칸 = 10배)", min: 4, max: 8, step: 0.05, value: 4,
        fmt: function (x) { var d = Math.pow(10, x); return d >= 1e6 ? (d / 1e6).toFixed(2) + " 백만 km" : Math.round(d / 1000) + " 천 km"; },
        onInput: function (x) { lg = x; draw(); } });
      api.seg({ label: "시험 차 대수", value: 10, options: [{ v: 10, t: "10대" }, { v: 100, t: "100대" }, { v: 1000, t: "1000대" }],
        onPick: function (x) { cars = x; draw(); } });
      api.info("이 확률이 크다면 ‘사고 0건’은 <b>운이 좋았을 뿐</b>일 수 있습니다. 확률이 5% 이하로 떨어져야 우연이라고 보기 어려워요.");
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
      "사람도 100만 km 에 겨우 한 번 사고를 냅니다. 1만 km 쯤은 사람 운전자도 거의 늘 사고 없이 달리지요. 그래프가 5% 선 아래로 내려가는 곳을 찾으세요.",
      "사고 없이 달릴 확률은 약 e<sup>−거리/100만 km</sup>. 5% 가 되려면 거리/100만 ≈ 3, 즉 약 300만 km."
    ],
    solution: "시험 거리를 <b>약 300만 ~ 400만 km</b>(눈금 6.5 ~ 6.6)에 두세요. 차 10대로는 약 2년이 걸립니다.",
    why: "‘한 번도 안 일어났다’는 것은 <b>충분히 많이 시도했을 때만</b> 증거가 됩니다. 사고가 드문 일일수록 필요한 시험의 양은 엄청나게 커지지요. 0건일 때 필요한 양은 대략 ‘기준 간격의 3배’라서 <b>3의 규칙</b>이라고도 부릅니다.<br>" +
      "과학 기술의 쟁점에서 ‘안전하다’, ‘효과 있다’는 주장을 들으면 <b>얼마나 많은 자료</b>에서 나온 결론인지 먼저 물어야 합니다. 공청회에서 필요한 것은 찬반의 목소리 크기가 아니라 이런 <b>증거의 무게</b>입니다."
  }
  ]
});
})();
