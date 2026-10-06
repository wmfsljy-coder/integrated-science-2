/* 통합과학2 Ⅰ-1 지구 환경 변화와 생물다양성 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 표준화석으로 나이 좁히기 */
  {
    id: "c1", tag: "지질시대 · 표준화석", title: "화석 세 개로 지층 나이 좁히기", short: "화석 세 개",
    who: "⛏️", name: "지질 조사원",
    say: "“도로 공사장 절벽의 한 층에서 <b>삼엽충, 필석, 암모나이트</b> 화석이 함께 나왔어요. 방사성 연대를 잴 화산재 층은 없습니다. 화석만으로 이 층이 쌓인 때를 <b>최대한 좁혀</b> 보고서에 적어야 해요.”",
    predict: {
      q: "세 화석이 한 지층에서 함께 나왔습니다. 이 지층이 쌓인 때는?",
      options: ["㉠ 셋 중 가장 오래 살았던 화석의 생존 기간 어디든", "㉡ 셋의 생존 기간이 모두 겹치는 기간 안", "㉢ 셋 중 가장 먼저 나타난 화석이 처음 나타난 때"],
      answer: 1
    },
    task: "두 슬라이더로 <b>이 층이 쌓였을 수 있는 기간</b>의 시작(오래된 쪽)과 끝(젊은 쪽)을 정하세요. 가능한 기간을 빠짐없이, 그러나 가장 좁게 잡아야 합니다(양 끝 각각 ±1000만 년까지 인정).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var FOS = [
        { n: "삼엽충", a: 520, b: 250, c: "--brand" },
        { n: "필석", a: 500, b: 320, c: "--violet" },
        { n: "암모나이트", a: 410, b: 66, c: "--amber" }
      ];
      var ERA = [[541, 252, "고생대", "--teal"], [252, 66, "중생대", "--green"], [66, 0, "신생대", "--coral"]];
      var old = 540, young = 0;
      var x0 = 60, x1 = 840;
      function X(ma) { return x0 + (560 - ma) / 560 * (x1 - x0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "생존 기간 (단위: 백만 년 전 · 왼쪽이 오래된 때)", 40, 26, { s: 14, w: "900" });
        ERA.forEach(function (e) {
          H.box(ctx, X(e[0]), 44, X(e[1]) - X(e[0]), 22, H.v(e[3]), 0.28);
          H.text(ctx, e[2], (X(e[0]) + X(e[1])) / 2, 60, { s: 12, w: "800", a: "center", c: H.v(e[3] + "-700") });
        });
        var lo = Math.min(old, young), hi = Math.max(old, young);
        H.box(ctx, X(hi), 76, X(lo) - X(hi), 176, H.v("--rose"), 0.12);
        FOS.forEach(function (f, i) {
          var y = 100 + i * 50;
          H.text(ctx, f.n, x0, y - 6, { s: 12, w: "800", c: H.v(f.c + "-700") });
          H.box(ctx, X(f.a), y, X(f.b) - X(f.a), 14, H.v(f.c), 0.75);
          H.text(ctx, f.a + " ~ " + f.b, X(f.b) + 8, y + 12, { s: 11, c: H.v("--mist") });
        });
        H.line(ctx, [[X(hi), 76], [X(hi), 252]], H.v("--rose-700"), 2);
        H.line(ctx, [[X(lo), 76], [X(lo), 252]], H.v("--rose-700"), 2);
        H.axes(ctx, x0, 252, x1, 252);
        [500, 400, 300, 200, 100, 0].forEach(function (m) { H.text(ctx, m + "", X(m), 270, { s: 10.5, a: "center", c: H.v("--mist") }); });
        var ok = hi >= 400 && hi <= 420 && lo >= 310 && lo <= 330;
        H.text(ctx, "보고서에 적을 기간:  " + hi + " ~ " + lo + " 백만 년 전  (폭 " + (hi - lo) + " 백만 년)", 40, 306,
          { s: 14, w: "900", c: ok ? H.v("--green-700") : H.v("--ink") });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "기간의 시작 (오래된 쪽)", min: 0, max: 560, step: 10, value: 540, fmt: function (x) { return x + " 백만 년 전"; },
        onInput: function (x) { old = x; draw(); } });
      api.slider({ label: "기간의 끝 (젊은 쪽)", min: 0, max: 560, step: 10, value: 0, fmt: function (x) { return x + " 백만 년 전"; },
        onInput: function (x) { young = x; draw(); } });
      api.info("분홍 띠가 여러분이 고른 기간입니다. 그 기간 <b>어느 때든</b> 세 생물이 모두 살아 있었어야 이 층에 함께 묻힐 수 있습니다. ※ 생존 기간은 수업용으로 어림한 값입니다.");
      draw();
      return {
        judge: function () {
          var lo = Math.min(old, young), hi = Math.max(old, young);
          var okHi = hi >= 400 && hi <= 420, okLo = lo >= 310 && lo <= 330;
          if (okHi && okLo) return { ok: true, msg: hi + " ~ " + lo + " 백만 년 전 — 고생대 데본기에서 석탄기 초까지로 좁혔습니다." };
          if (hi > 420) return { ok: false, msg: "시작이 너무 오래되었습니다. 그때 세 화석 가운데 아직 나타나지 않은 것이 있습니다." };
          if (hi < 400) return { ok: false, msg: "시작을 너무 늦게 잡았습니다. 셋이 함께 살던 때가 더 이른 시기에도 있었습니다." };
          if (lo < 310) return { ok: false, msg: "끝이 너무 젊습니다. 그때는 세 화석 가운데 이미 사라진 것이 있습니다." };
          return { ok: false, msg: "끝을 너무 이르게 잡았습니다. 셋이 함께 살던 때가 더 뒤에도 있었습니다." };
        }
      };
    },
    hints: [
      "지층에 화석이 묻히려면 그 순간 <b>세 생물이 모두 살아 있어야</b> 합니다. 한 화석이라도 아직 나타나지 않았거나 이미 멸종했다면 안 됩니다.",
      "셋 중 <b>가장 늦게 나타난</b> 것이 기간의 시작, <b>가장 먼저 사라진</b> 것이 기간의 끝을 정합니다."
    ],
    solution: "시작은 암모나이트가 나타난 <b>410</b>, 끝은 필석이 사라진 <b>320</b> 백만 년 전입니다. 두 슬라이더를 410과 320에 두세요.",
    why: "여러 화석이 함께 나오면 그 층의 나이는 <b>생존 기간이 모두 겹치는 구간</b>으로 좁혀집니다. 삼엽충 하나만으로는 2억 7천만 년이나 되는 폭이었지만, 셋을 겹치니 9천만 년으로 줄었습니다.<br>" +
      "그래서 <b>생존 기간이 짧고 넓은 지역에 퍼져 살았던 생물</b>의 화석일수록 좋은 표준화석이 됩니다. 점토층 이야기에서 대멸종의 경계를 짚을 수 있었던 것도, 경계 아래위로 나오는 화석이 뚜렷이 달랐기 때문입니다.<br>※ 암모나이트 무리는 고생대 데본기에 처음 나타났지만, 크게 번성하고 널리 퍼진 때는 중생대여서 <b>중생대 표준 화석</b>으로 씁니다."
  },

  /* ------------------------------------------------------------------ 2. 자연선택 거꾸로 */
  {
    id: "c2", tag: "자연선택", title: "공기가 맑아진 도시의 나방", short: "나방",
    who: "🦋", name: "도시 환경 연구소",
    say: "“공장 그을음으로 나무껍질이 검게 변한 뒤, 이 도시 나방은 <b>95%가 검은색</b>이 되었어요. 이제 굴뚝 규제로 그을음을 줄이려 합니다. 목표는 <b>50세대 뒤 흰 나방이 다시 절반 이상</b>. 다만 예산으로는 그을음을 <b>35%</b> 아래로는 줄일 수 없어요.”",
    predict: {
      q: "공기가 깨끗해져 나무껍질이 밝아지면, 검은 나방들에게 일어나는 일은?",
      options: ["㉠ 검은 나방 한 마리 한 마리가 점점 흰색으로 바뀐다", "㉡ 흰 나방이 새에게 덜 잡아먹혀 자손을 더 남기면서, 세대가 지날수록 비율이 바뀐다", "㉢ 이미 검은색이 된 집단이라 다시 바뀌지 않는다"],
      answer: 1
    },
    task: "그을음 정도를 정해 <b>50세대 뒤 흰 나방이 50% 이상</b>이 되게 하세요. 그을음은 35% 이상이어야 합니다(예산 한계). ▶ 로 세대를 돌려 볼 수 있어요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var soot = 90, shown = 50;
      var run = api.ticker();
      function surv(x) { var k = x / 100; return { L: 1 - 0.4 * k, D: 1 - 0.4 * (1 - k) }; }
      function series(x) {
        var s = surv(x), p = 0.05, out = [p];
        for (var g = 1; g <= 50; g++) { p = p * s.L / (p * s.L + (1 - p) * s.D); out.push(p); }
        return out;
      }
      var gx0 = 70, gx1 = 560, gy0 = 60, gy1 = 280;
      function GX(g) { return gx0 + g / 50 * (gx1 - gx0); }
      function GY(p) { return gy1 - p * (gy1 - gy0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        var ser = series(soot), s = surv(soot);
        H.text(ctx, "흰 나방의 비율 — 세대가 지나며", 40, 30, { s: 14, w: "900" });
        H.axes(ctx, gx0, gy0, gx1, gy1);
        H.dash(ctx, gx0, GY(0.5), gx1, GY(0.5), H.v("--green"));
        H.text(ctx, "50%", gx0 - 8, GY(0.5) + 4, { s: 10.5, a: "right", c: H.v("--green-700") });
        H.text(ctx, "0%", gx0 - 8, gy1 + 4, { s: 10.5, a: "right", c: H.v("--mist") });
        H.text(ctx, "100%", gx0 - 8, gy0 + 4, { s: 10.5, a: "right", c: H.v("--mist") });
        [0, 10, 20, 30, 40, 50].forEach(function (g) { H.text(ctx, g + "", GX(g), gy1 + 18, { s: 10.5, a: "center", c: H.v("--mist") }); });
        H.text(ctx, "세대", gx1, gy1 + 34, { s: 11, a: "right", c: H.v("--mist") });
        var pts = [];
        for (var g = 0; g <= shown; g++) pts.push([GX(g), GY(ser[g])]);
        H.line(ctx, pts, H.v("--brand"), 3);
        H.dot(ctx, GX(shown), GY(ser[shown]), 5, H.v("--brand-700"));
        /* 나무껍질 견본 */
        var bark = Math.round(225 - soot * 1.7);
        ctx.fillStyle = "rgb(" + bark + "," + (bark - 8) + "," + (bark - 20) + ")"; ctx.fillRect(610, 60, 90, 90);
        H.text(ctx, "나무껍질", 655, 170, { s: 11.5, w: "800", a: "center", c: H.v("--mist") });
        H.text(ctx, "🦋", 640, 100, { s: 22, a: "center" });
        ctx.fillStyle = "#222"; ctx.beginPath(); ctx.arc(676, 124, 9, 0, Math.PI * 2); ctx.fill();
        H.rows(ctx, 730, 70, [
          ["흰 나방 생존율", (s.L * 100).toFixed(0) + "%", "--brand-700"],
          ["검은 나방 생존율", (s.D * 100).toFixed(0) + "%"],
          [shown + "세대 뒤 흰 나방", (ser[shown] * 100).toFixed(1) + "%", ser[shown] >= 0.5 ? "--green-700" : "--rose-700", true]
        ], 58);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "그을음 정도", min: 0, max: 100, step: 1, value: 90, fmt: function (x) { return x + "%"; },
        onInput: function (x) { soot = x; shown = 50; draw(); } });
      api.button("▶ 50세대 돌려 보기", function () { run(50, 45, function (k) { shown = Math.round(k * 50); draw(); }); });
      api.info("그을음이 많을수록 나무껍질이 어두워져 <b>흰 나방이 새 눈에 잘 띕니다</b>. 한 세대 안에서 나방 색은 바뀌지 않습니다. 살아남은 쪽이 자손을 남길 뿐입니다.");
      draw();
      return {
        judge: function () {
          var p = series(soot)[50];
          if (soot < 35) return { ok: false, msg: "그을음 " + soot + "% — 예산으로는 35% 아래까지 줄일 수 없습니다." };
          if (p >= 0.5) return { ok: true, msg: "그을음 " + soot + "% · 50세대 뒤 흰 나방 " + (p * 100).toFixed(1) + "% — 흰 나방이 살아남기 유리해지니 비율이 되돌아왔습니다." };
          return { ok: false, msg: "50세대 뒤 흰 나방 " + (p * 100).toFixed(1) + "% — 아직 절반이 안 됩니다." };
        }
      };
    },
    hints: [
      "그을음이 50%보다 많으면 여전히 <b>검은 나방이 유리</b>합니다. 흰 나방이 늘려면 적어도 흰 쪽이 더 잘 살아남는 환경이어야 합니다.",
      "흰 나방이 조금만 유리해도 50세대 동안 쌓이면 큰 차이가 됩니다. 그을음을 40% 안팎으로 옮기며 그래프 끝을 보세요."
    ],
    solution: "그을음을 <b>35~44%</b>로 두세요. 44%에서 흰 나방이 한 세대에 약 6% 더 잘 살아남고, 그 차이가 50세대 쌓여 절반을 넘깁니다.",
    why: "변하는 것은 나방 한 마리가 아니라 <b>집단 속 비율</b>입니다. 환경(나무껍질 색)에 따라 <b>살아남아 자손을 남기는 정도</b>가 달라지고, 그 작은 차이가 세대마다 곱해져 집단의 모습이 바뀝니다 — 이것이 <b>자연선택</b>입니다.<br>" +
      "가뭄 뒤 부리가 큰 핀치가 늘어난 것과 같은 원리입니다. 그리고 환경이 되돌아가면 선택의 방향도 되돌아갑니다. 실제로 영국 맨체스터에서는 대기 정화법 이후 수십 년에 걸쳐 흰 나방이 다시 늘었습니다. " +
      "※ 생존율 공식은 수업용 모형입니다."
  },

  /* ------------------------------------------------------------------ 3. 종-면적 관계와 가장자리 효과 */
  {
    id: "c3", tag: "생물다양성 보전", title: "숲 보호구역 설계", short: "보호구역",
    who: "🌲", name: "국립공원 설계팀",
    say: "“이 숲에는 숲 속 깊은 곳에만 사는 종이 많아요. 조사해 보니 <b>50종 이상</b>이 함께 살 수 있어야 먹이그물이 유지됩니다. 땅은 <b>800 km²</b>까지 살 수 있고, 가운데로 도로를 내면 관광객이 늘어 좋다는 의견도 있어요.”",
    predict: {
      q: "보호구역 넓이를 두 배로 늘리면, 그 안에 살 수 있는 종의 수는?",
      options: ["㉠ 두 배가 된다", "㉡ 늘지만 두 배보다는 적게 는다", "㉢ 변하지 않는다"],
      answer: 1
    },
    task: "모양과 넓이를 정해 <b>800 km² 이하에서 50종 이상</b>이 살 수 있게 만드세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var A = 300, shape = "one";
      function inner(a, sh) {
        if (sh === "one") { var s = Math.max(0, Math.sqrt(a) - 2); return s * s; }
        var q = Math.max(0, Math.sqrt(a / 4) - 2); return 4 * q * q;
      }
      function species(a, sh) { return 10 * Math.pow(inner(a, sh), 0.25); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "보호구역 (위에서 본 모습)", 40, 30, { s: 14, w: "900" });
        var side = Math.sqrt(A), sc = 240 / Math.sqrt(1500), L = side * sc, cx = 190, cy = 180;
        var e = 1 * sc;
        function piece(x, y, s) {
          H.box(ctx, x, y, s, s, H.v("--green"), 0.25);
          if (s > 2 * e) H.box(ctx, x + e, y + e, s - 2 * e, s - 2 * e, H.v("--green"), 0.6);
        }
        if (shape === "one") piece(cx - L / 2, cy - L / 2, L);
        else {
          var h = L / 2, gap = 8;
          piece(cx - h - gap / 2, cy - h - gap / 2, h); piece(cx + gap / 2, cy - h - gap / 2, h);
          piece(cx - h - gap / 2, cy + gap / 2, h); piece(cx + gap / 2, cy + gap / 2, h);
          ctx.fillStyle = H.v("--mist"); ctx.fillRect(cx - L / 2 - 12, cy - 2, L + 24, 4); ctx.fillRect(cx - 2, cy - L / 2 - 12, 4, L + 24);
        }
        H.text(ctx, "진한 곳 = 숲 속 (가장자리 1 km 안쪽은 소음·빛 때문에 숲 속 종이 못 삼)", 40, 318, { s: 11, c: H.v("--mist") });
        /* 종-면적 곡선 */
        var gx0 = 420, gx1 = 680, gy0 = 70, gy1 = 270;
        function GX(a) { return gx0 + a / 1500 * (gx1 - gx0); }
        function GY(s) { return gy1 - s / 70 * (gy1 - gy0); }
        H.axes(ctx, gx0, gy0, gx1, gy1);
        H.text(ctx, "숲 속 넓이 → 종 수", gx0, gy0 - 14, { s: 12, w: "800", c: H.v("--mist") });
        var pts = []; for (var a = 0; a <= 1500; a += 20) pts.push([GX(a), GY(10 * Math.pow(a, 0.25))]);
        H.line(ctx, pts, H.v("--teal"), 2.5);
        H.dash(ctx, gx0, GY(50), gx1, GY(50), H.v("--rose"));
        H.text(ctx, "50종", gx0 - 6, GY(50) + 4, { s: 10.5, a: "right", c: H.v("--rose-700") });
        [0, 500, 1000, 1500].forEach(function (a) { H.text(ctx, a + "", GX(a), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        var ia = inner(A, shape), S = species(A, shape);
        H.dot(ctx, GX(ia), GY(S), 6, S >= 50 ? H.v("--green-700") : H.v("--rose-700"));
        H.rows(ctx, 720, 70, [
          ["사들인 땅", A + " km²", A > 800 ? "--rose-700" : null],
          ["숲 속 넓이", ia.toFixed(0) + " km²"],
          ["살 수 있는 종", S.toFixed(1) + " 종", S >= 50 ? "--green-700" : "--rose-700", true]
        ], 60);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "모양", value: "one", options: [{ v: "one", t: "한 덩어리" }, { v: "four", t: "도로로 나눈 네 조각" }],
        onPick: function (x) { shape = x; draw(); } });
      api.slider({ label: "넓이", min: 100, max: 1500, step: 10, value: 300, fmt: function (x) { return x + " km²"; },
        onInput: function (x) { A = x; draw(); } });
      api.info("종 수는 <b>숲 속 넓이</b>로 정해집니다(종 수 = 10 × 넓이<sup>0.25</sup>). 곡선이 어떻게 휘는지 보세요.");
      draw();
      return {
        judge: function () {
          var S = species(A, shape);
          if (A > 800) return { ok: false, msg: A + " km² — 살 수 있는 땅(800 km²)을 넘었습니다." };
          if (S >= 50) return { ok: true, msg: (shape === "one" ? "한 덩어리 " : "네 조각 ") + A + " km² · 숲 속 " + inner(A, shape).toFixed(0) + " km² · " + S.toFixed(1) + "종 — 목표를 채웠습니다." };
          return { ok: false, msg: S.toFixed(1) + "종 — 50종에 모자랍니다." + (shape === "four" ? " 도로가 숲 속을 얼마나 깎아 먹는지 보세요." : "") };
        }
      };
    },
    hints: [
      "곡선이 점점 눕습니다. 넓이를 늘려도 종 수는 <b>조금씩만</b> 늡니다. 50종이 되려면 숲 속 넓이가 약 625 km²는 되어야 합니다.",
      "땅을 네 조각으로 나누면 가장자리가 두 배로 늘어 <b>숲 속 넓이가 크게 줄어듭니다</b>. 같은 800 km² 라도 모양에 따라 결과가 다릅니다."
    ],
    solution: "<b>한 덩어리</b>로 두고 넓이를 <b>730~800 km²</b>로 하세요. 네 조각으로 나누면 800 km²를 다 사도 약 49종에 그칩니다.",
    why: "넓은 서식지일수록 종이 많이 살지만, 종 수는 넓이에 비례하지 않고 <b>천천히</b> 늘어납니다(종-면적 관계). 그래서 서식지가 조금만 줄어도 목표선 아래로 떨어지기 쉽습니다.<br>" +
      "또 서식지를 도로로 <b>쪼개면(단편화)</b> 가장자리가 늘어나 깊은 숲에 사는 종이 살 곳이 줄어듭니다. 넓이보다 <b>연결</b>이 중요할 때가 있는 까닭이고, 끊긴 숲을 잇는 <b>생태 통로</b>를 만드는 것도 이 때문입니다. " +
      "※ 식의 계수는 수업용 값입니다."
  }
  ]
});
})();
