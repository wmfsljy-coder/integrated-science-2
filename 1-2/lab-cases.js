/* 통합과학2 Ⅰ-2 화학 변화 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 산화 환원 : 전자를 주는 쪽 */
  {
    id: "c1", tag: "산화와 환원", title: "까맣게 변한 은수저 되살리기", short: "은수저",
    who: "🥄", name: "박물관 보존 담당",
    say: "“돌아가신 분이 쓰시던 은수저가 까맣게 변했어요. 검은 막은 은이 공기 속 황과 만나 생긴 <b>황화 은(Ag₂S)</b>입니다. 문질러 벗기면 은까지 깎여 나가니, 은을 <b>원래대로 되돌리는</b> 방법을 찾아야 해요. 전시 준비로 <b>10분</b>밖에 없습니다.”",
    predict: {
      q: "소금물에 은수저와 알루미늄 포일을 함께 넣어 두면 검은 막이 사라집니다. 알루미늄이 하는 일은?",
      options: ["㉠ 검은 막을 긁어서 벗겨 낸다", "㉡ 은 이온(Ag⁺)에 전자를 주고, 자신은 산화된다", "㉢ 은을 산화시켜 녹여 낸다"],
      answer: 1
    },
    task: "함께 넣을 금속과 물 온도를 골라 <b>10분 안에 검은 막을 99% 이상</b> 은으로 되돌리세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var MET = { au: { t: "금", k: 0, c: "--amber" }, cu: { t: "구리", k: 0.001, c: "--coral" }, al: { t: "알루미늄", k: 0.02, c: "--mist" } };
      var met = "cu", T = 40, tNow = 10;
      var run = api.ticker();
      function removed(t) { return 1 - Math.exp(-MET[met].k * Math.pow(2, (T - 25) / 10) * t); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "소금물 속 — 은수저와 " + MET[met].t, 40, 30, { s: 14, w: "900" });
        ctx.fillStyle = H.v("--brand"); ctx.globalAlpha = 0.18; ctx.fillRect(80, 110, 360, 180); ctx.globalAlpha = 1;
        ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(80, 70); ctx.lineTo(80, 290); ctx.lineTo(440, 290); ctx.lineTo(440, 70); ctx.stroke();
        var r = removed(tNow), g = Math.round(40 + r * 170);
        ctx.fillStyle = "rgb(" + g + "," + g + "," + (g + 8) + ")";
        ctx.beginPath(); ctx.ellipse(170, 150, 26, 38, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(163, 186, 14, 96);
        H.text(ctx, "은수저", 170, 312, { s: 11.5, w: "800", a: "center", c: H.v("--mist") });
        H.box(ctx, 320, 150, 70, 130, H.v(MET[met].c), 0.8);
        H.text(ctx, MET[met].t, 355, 312, { s: 11.5, w: "800", a: "center", c: H.v("--mist") });
        if (MET[met].k > 0) {
          H.arrow(ctx, 312, 200, 206, 170, H.v("--teal-700"), 2.5, 9);
          H.text(ctx, "e⁻", 262, 176, { s: 13, w: "900", a: "center", c: H.v("--teal-700") });
        }
        H.text(ctx, T + " ℃", 420, 100, { s: 13, w: "900", a: "right", c: H.v("--coral-700") });
        H.rows(ctx, 520, 70, [
          ["담가 둔 시간", tNow.toFixed(1) + " 분"],
          ["은으로 되돌아간 비율", (r * 100).toFixed(1) + "%", r >= 0.99 ? "--green-700" : "--rose-700", true],
          ["반응 속도 배율 (25 ℃ 기준)", "× " + Math.pow(2, (T - 25) / 10).toFixed(1)]
        ], 60);
        H.text(ctx, "은 이온 쪽: Ag⁺ + e⁻ → Ag  (환원)", 520, 270, { s: 12, w: "800", c: H.v("--brand-700") });
        H.text(ctx, MET[met].k > 0 ? MET[met].t + " 쪽: 전자를 내놓음  (산화)" : MET[met].t + " 은 은보다 전자를 내놓지 않음", 520, 294,
          { s: 12, w: "800", c: MET[met].k > 0 ? H.v("--coral-700") : H.v("--mist") });
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "함께 넣을 금속", value: "cu", options: [{ v: "au", t: "금 반지" }, { v: "cu", t: "구리 동전" }, { v: "al", t: "알루미늄 포일" }],
        onPick: function (x) { met = x; tNow = 10; draw(); } });
      api.slider({ label: "물 온도", min: 20, max: 100, step: 5, value: 40, fmt: function (x) { return x + " ℃"; },
        onInput: function (x) { T = x; tNow = 10; draw(); } });
      api.button("▶ 10분 담가 두기", function () { run(40, 40, function (k) { tNow = k * 10; draw(); }); });
      api.info("금속마다 <b>전자를 내놓으려는 정도</b>가 다릅니다. 온도가 10 ℃ 오를 때마다 반응은 약 두 배 빨라진다고 보세요.");
      draw();
      return {
        judge: function () {
          var r = 1 - Math.exp(-MET[met].k * Math.pow(2, (T - 25) / 10) * 10);
          if (MET[met].k === 0) return { ok: false, msg: "금은 은보다도 전자를 내놓지 않습니다. 아무리 데워도 변화가 없어요." };
          if (r >= 0.99) return { ok: true, msg: MET[met].t + " · " + T + " ℃ · 10분 뒤 " + (r * 100).toFixed(1) + "% — 은이 전자를 받아 되살아났습니다." };
          return { ok: false, msg: "10분 뒤 " + (r * 100).toFixed(1) + "% — 아직 검은 막이 남습니다." + (met === "cu" ? " 구리는 너무 느려요." : "") };
        }
      };
    },
    hints: [
      "검은 막 속 은은 <b>Ag⁺</b> 상태입니다. 은으로 되돌리려면 누군가 <b>전자를 건네주어야</b> 해요. 은보다 전자를 쉽게 내놓는 금속은?",
      "금속이 정해졌다면 남은 것은 속도입니다. 10분 안에 끝내려면 반응을 몇 배 빠르게 해야 할까요? 온도를 올려 보세요."
    ],
    solution: "<b>알루미늄 포일</b>을 넣고 물을 <b>75 ℃ 이상</b>으로 데우세요.",
    why: "황화 은 속 Ag⁺ 가 전자를 얻어 은(Ag)이 되는 것이 <b>환원</b>, 알루미늄이 전자를 잃고 Al³⁺ 가 되는 것이 <b>산화</b>입니다. 두 반응은 언제나 <b>동시에</b> 일어나지요 — 한쪽이 잃은 전자를 다른 쪽이 얻으니까요.<br>" +
      "적철석에서 철을 꺼낼 때 탄소(일산화 탄소)가 산소를 가져가며 산화된 것과 같은 짝입니다. 문질러 닦으면 은이 깎여 없어지지만, 이 방법은 <b>검은 막 속 은까지 되찾아</b> 줍니다. " +
      "※ 속도 계수는 수업용 모형입니다."
  },

  /* ------------------------------------------------------------------ 2. 중화 반응의 양적 관계 */
  {
    id: "c2", tag: "중화 반응 · 더 나아가기", title: "식초 라벨을 믿어도 될까", short: "식초 적정",
    who: "🧪", name: "소비자 보호원",
    say: "“라벨 없는 식초 샘플이 들어왔어요. 식초 속 아세트산이 얼마나 진한지 알아야 합니다. <b>식초 10 mL</b> 에 페놀프탈레인을 두 방울 넣고, 뷰렛으로 <b>0.20 M 수산화 나트륨</b> 수용액을 떨어뜨려 보세요. 붉은빛이 처음 돌아 사라지지 않는 순간이 기준입니다.”",
    predict: {
      q: "식초가 막 중화된 순간, 식초 속 아세트산이 내놓을 수 있는 H⁺ 의 수와 넣어 준 OH⁻ 의 수는?",
      options: ["㉠ H⁺ 가 더 많다", "㉡ 서로 같다", "㉢ OH⁻ 가 더 많다"],
      answer: 1
    },
    task: "수산화 나트륨을 넣어 <b>처음 붉어지는 순간에서 멈추고</b>, 그 부피로 계산한 <b>아세트산 농도</b>를 슬라이더로 정하세요(± 0.02 M).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(330), ctx = cv.ctx, W = cv.W;
      var V = 0, C = 0.30, KA = 1.8e-5, NA = 8, CB = 0.2;
      function pH(v) {
        var nb = CB * v, tot = 10 + v;
        if (nb <= 0) return -H.log10(Math.sqrt(KA * NA / 10));
        if (nb < NA - 1e-9) return -H.log10(KA) + H.log10(nb / (NA - nb));
        if (Math.abs(nb - NA) < 1e-9) return 14 + H.log10(Math.sqrt(1e-14 / KA * NA / tot));
        return 14 + H.log10((nb - NA) / tot);
      }
      var gx0 = 470, gx1 = 850, gy0 = 60, gy1 = 250;
      function GX(v) { return gx0 + v / 60 * (gx1 - gx0); }
      function GY(p) { return gy1 - p / 14 * (gy1 - gy0); }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "뷰렛으로 한 방울씩", 40, 30, { s: 14, w: "900" });
        ctx.fillStyle = H.v("--card-2"); ctx.fillRect(150, 50, 24, 150);
        var lvl = 50 + V / 60 * 150;
        H.box(ctx, 150, lvl, 24, 200 - lvl, H.v("--brand"), 0.35);
        ctx.strokeStyle = H.v("--line"); ctx.lineWidth = 2; ctx.strokeRect(150, 50, 24, 150);
        for (var t = 0; t <= 60; t += 10) H.text(ctx, t + "", 144, 50 + t / 60 * 150 + 4, { s: 9.5, a: "right", c: H.v("--mist") });
        ctx.fillStyle = V >= 40 ? "rgba(236,72,153,.55)" : "rgba(200,220,240,.45)";
        ctx.beginPath(); ctx.moveTo(130, 240); ctx.lineTo(194, 240); ctx.lineTo(236, 305); ctx.lineTo(88, 305); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = H.v("--line"); ctx.stroke();
        H.text(ctx, V >= 40 ? "붉은빛 (염기성)" : "무색", 162, 322, { s: 11.5, w: "800", a: "center", c: V >= 40 ? H.v("--rose-700") : H.v("--mist") });
        H.rows(ctx, 260, 70, [
          ["넣은 NaOH", V + " mL"],
          ["넣은 OH⁻ 의 양", (CB * V).toFixed(1) + " mmol", "--brand-700"],
          ["내가 정한 농도로 본 산의 양", (10 * C).toFixed(1) + " mmol", Math.abs(10 * C - CB * V) < 0.05 ? "--green-700" : "--amber-700"]
        ], 60);
        H.axes(ctx, gx0, gy0, gx1, gy1);
        H.text(ctx, "pH", gx0 - 8, gy0 - 8, { s: 11, w: "800", a: "right", c: H.v("--mist") });
        [0, 7, 14].forEach(function (p) { H.text(ctx, p + "", gx0 - 8, GY(p) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        [0, 20, 40, 60].forEach(function (v) { H.text(ctx, v + " mL", GX(v), gy1 + 16, { s: 10, a: "center", c: H.v("--mist") }); });
        H.dash(ctx, gx0, GY(8.2), gx1, GY(8.2), H.v("--rose"));
        H.text(ctx, "붉어지기 시작 (pH 8.2)", gx1, GY(8.2) - 6, { s: 10.5, a: "right", c: H.v("--rose-700") });
        var pts = []; for (var v = 0; v <= V; v += 0.25) pts.push([GX(v), GY(pH(v))]);
        if (pts.length > 1) H.line(ctx, pts, H.v("--violet"), 2.5);
        H.dot(ctx, GX(V), GY(pH(V)), 5, H.v("--violet-700"));
        H.text(ctx, "지금 pH " + pH(V).toFixed(2), gx0 + 6, gy1 + 40, { s: 13, w: "900", c: H.v("--violet-700") });
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "넣은 수산화 나트륨 수용액", min: 0, max: 60, step: 1, value: 0, fmt: function (x) { return x + " mL"; },
        onInput: function (x) { V = x; draw(); } });
      api.slider({ label: "식초 속 아세트산 농도 (내 계산)", min: 0.10, max: 1.50, step: 0.02, value: 0.30, fmt: function (x) { return x.toFixed(2) + " M"; },
        onInput: function (x) { C = x; draw(); } });
      api.info("아세트산 한 개는 H⁺ 를 한 개 내놓을 수 있고, NaOH 한 개는 OH⁻ 를 한 개 내놓습니다. 몰 농도(M) × 부피(mL) = mmol 입니다.");
      draw();
      return {
        judge: function () {
          if (V !== 40) return { ok: false, msg: V < 40 ? "아직 무색입니다. 붉어지는 순간까지 더 넣으세요." : "이미 지나쳤습니다. 처음 붉어지는 순간에서 멈춰야 정확합니다." };
          if (Math.abs(C - 0.80) <= 0.021) return { ok: true, msg: "40 mL × 0.20 M = 8.0 mmol = 10 mL × " + C.toFixed(2) + " M — 아세트산 약 0.80 M, 약 4.8% 식초입니다." };
          return { ok: false, msg: "종말점은 찾았습니다. 그런데 " + C.toFixed(2) + " M 이면 산이 " + (10 * C).toFixed(1) + " mmol — 넣은 OH⁻ 8.0 mmol 과 맞지 않아요." };
        }
      };
    },
    hints: [
      "뷰렛을 조금씩 늘리다가 플라스크가 <b>처음 붉어지는</b> 부피를 찾으세요. 그래프가 갑자기 치솟는 곳이기도 합니다.",
      "중화점에서는 <b>H⁺ 의 양 = OH⁻ 의 양</b>. 넣은 OH⁻ = 0.20 × 40 = 8.0 mmol 이니, 식초 10 mL 속 아세트산 농도는?"
    ],
    solution: "<b>40 mL</b> 에서 처음 붉어집니다. 0.20 M × 40 mL = 8.0 mmol 이므로 농도 = 8.0 ÷ 10 = <b>0.80 M</b>. 두 슬라이더를 40 mL, 0.80 M 에 두세요.",
    why: "중화 반응에서 H⁺ 와 OH⁻ 는 <b>1 : 1</b> 로 만나 물이 됩니다. 그래서 중화점까지 들어간 OH⁻ 의 양을 알면, 모르는 산의 양을 거꾸로 알아낼 수 있어요. 이것이 <b>중화 적정</b>입니다.<br>" +
      "호수에 석회를 얼마나 뿌려야 할지 계산한 것과 같은 생각이지요. 지시약은 <b>그 순간을 눈으로 보여 주는 신호</b>일 뿐입니다. " +
      "※ 약산이라 중화점의 pH 가 7 보다 조금 높게(약 9) 나타나는데, 그래서 이 적정에는 pH 8 ~ 10 에서 색이 바뀌는 페놀프탈레인을 씁니다."
  },

  /* ------------------------------------------------------------------ 3. 증발 : 흡열 반응의 쓰임 */
  {
    id: "c3", tag: "에너지 출입", title: "전기 없는 항아리 냉장고", short: "항아리 냉장고",
    who: "🏺", name: "국제 구호 단체",
    say: "“큰 항아리 안에 작은 항아리를 넣고 사이를 <b>모래</b>로 채운 ‘항아리 냉장고’를 보급하려 해요. 전기가 없는 마을의 채소를 <b>20 ℃ 아래</b>로 두면 사흘은 버팁니다. 세 지역 모두 한낮 기온은 <b>30 ℃</b>. 어디에, 어떻게 두어야 할까요?”",
    predict: {
      q: "젖은 모래가 안쪽 항아리를 시원하게 만드는 까닭은?",
      options: ["㉠ 물이 원래 차가워서", "㉡ 물이 증발하면서 주변에서 열을 흡수해서", "㉢ 모래가 햇빛을 반사해서"],
      answer: 1
    },
    task: "지역·모래·두는 곳을 골라 <b>안쪽 항아리를 20 ℃ 아래</b>로 유지하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(320), ctx = cv.ctx, W = cv.W;
      var REG = { desert: { t: "사헬 (건조)", rh: 0.20 }, temp: { t: "온대 여름", rh: 0.55 }, rain: { t: "열대 우림", rh: 0.85 } };
      var PL = { sun: { t: "햇볕 드는 마당", wind: 1, heat: 5 }, shade: { t: "바람 부는 그늘", wind: 1, heat: 0 }, room: { t: "바람 없는 창고", wind: 0.5, heat: 0 } };
      var reg = "temp", wet = "dry", pl = "sun";
      function evap() { return wet === "wet" ? 16 * (1 - REG[reg].rh) * PL[pl].wind : 0; }
      function inside() { return 30 - evap() + PL[pl].heat; }
      function draw() {
        H.paper(ctx, W, cv.H);
        H.text(ctx, "항아리 냉장고 단면", 40, 30, { s: 14, w: "900" });
        var cx = 220;
        ctx.fillStyle = H.v("--coral"); ctx.globalAlpha = 0.35;
        ctx.beginPath(); ctx.moveTo(cx - 120, 80); ctx.lineTo(cx + 120, 80); ctx.lineTo(cx + 100, 290); ctx.lineTo(cx - 100, 290); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = wet === "wet" ? "rgba(120,150,190,.55)" : "rgba(230,200,140,.8)";
        ctx.beginPath(); ctx.moveTo(cx - 108, 88); ctx.lineTo(cx + 108, 88); ctx.lineTo(cx + 90, 280); ctx.lineTo(cx - 90, 280); ctx.closePath(); ctx.fill();
        ctx.fillStyle = H.v("--panel"); ctx.beginPath(); ctx.moveTo(cx - 70, 88); ctx.lineTo(cx + 70, 88); ctx.lineTo(cx + 58, 262); ctx.lineTo(cx - 58, 262); ctx.closePath(); ctx.fill();
        H.text(ctx, "🥕🍅", cx, 200, { s: 26, a: "center" });
        H.text(ctx, wet === "wet" ? "젖은 모래" : "마른 모래", cx - 150, 190, { s: 11.5, w: "800", a: "right", c: H.v("--mist") });
        var e = evap();
        if (e > 0) {
          var n = Math.max(1, Math.round(e / 3));
          for (var i = 0; i < n; i++) H.arrow(ctx, cx + 128, 240 - i * 34, cx + 170, 226 - i * 34, H.v("--brand"), 2, 7);
          H.text(ctx, "수증기 (열을 가지고 나감)", cx + 178, 230, { s: 11, w: "800", c: H.v("--brand-700") });
        }
        if (PL[pl].heat > 0) H.text(ctx, "☀️", 60, 80, { s: 26 });
        var tin = inside();
        H.rows(ctx, 560, 70, [
          ["바깥 기온 · 습도", "30 ℃ · " + Math.round(REG[reg].rh * 100) + "%"],
          ["증발로 빼앗는 온도", "− " + e.toFixed(1) + " ℃", "--brand-700"],
          ["햇볕으로 더해지는 온도", "+ " + PL[pl].heat + " ℃", PL[pl].heat ? "--coral-700" : null],
          ["안쪽 항아리", tin.toFixed(1) + " ℃", tin < 20 ? "--green-700" : "--rose-700", true]
        ], 54);
      }
      cv.canvas._redraw = draw;
      api.seg({ label: "지역", value: "temp", options: [{ v: "desert", t: "사헬 (건조)" }, { v: "temp", t: "온대 여름" }, { v: "rain", t: "열대 우림" }],
        onPick: function (x) { reg = x; draw(); } });
      api.seg({ label: "모래", value: "dry", options: [{ v: "dry", t: "마른 모래" }, { v: "wet", t: "물로 적신 모래" }],
        onPick: function (x) { wet = x; draw(); } });
      api.seg({ label: "두는 곳", value: "sun", options: [{ v: "sun", t: "햇볕 드는 마당" }, { v: "shade", t: "바람 부는 그늘" }, { v: "room", t: "바람 없는 창고" }],
        onPick: function (x) { pl = x; draw(); } });
      api.info("공기가 <b>건조할수록</b>, 바람이 <b>잘 통할수록</b> 물이 빨리 증발합니다.");
      draw();
      return {
        judge: function () {
          var t = inside();
          if (t < 20) return { ok: true, msg: REG[reg].t + " · 젖은 모래 · " + PL[pl].t + " → 안쪽 " + t.toFixed(1) + " ℃ — 증발이 열을 빼앗아 갑니다." };
          if (wet === "dry") return { ok: false, msg: "안쪽 " + t.toFixed(1) + " ℃ — 마른 모래로는 식힐 것이 없습니다." };
          return { ok: false, msg: "안쪽 " + t.toFixed(1) + " ℃ — 아직 20 ℃ 보다 높습니다." };
        }
      };
    },
    hints: [
      "물이 증발하려면 에너지가 필요하고, 그 에너지는 <b>항아리와 채소에서</b> 가져옵니다. 증발이 빠를수록 더 시원해져요.",
      "공기가 이미 습하면 물이 잘 증발하지 않습니다. 가장 건조한 곳에서, 증발을 돕고 햇볕은 막는 자리를 고르세요."
    ],
    solution: "<b>사헬 · 물로 적신 모래 · 바람 부는 그늘</b>. 안쪽이 약 17 ℃ 까지 내려갑니다.",
    why: "물이 증발할 때는 주변에서 열을 <b>흡수</b>합니다(흡열). 땀이 마르며 몸이 식고, 손 소독제를 바르면 차가운 것과 같은 까닭이지요. 반대로 수증기가 물로 응결할 때는 열을 내놓습니다.<br>" +
      "손난로(철의 산화 — 발열)와 냉찜질 팩(질산 암모늄의 용해 — 흡열)처럼, 이 항아리도 <b>에너지 출입</b>을 쓰는 도구입니다. 다만 증발은 공기가 건조할 때만 잘 일어나서, 실제로 나이지리아·수단 같은 건조 지역에서 널리 쓰입니다. " +
      "※ 온도 계산은 수업용 모형입니다."
  }
  ]
});
})();
