/* 통합과학2 Ⅰ-2 화학 변화 — 응용 실험실
   이야기에서 찾은 개념을 처음 보는 상황에 써 본다. 공용 엔진: ../assets/lab.js (sthLab) */
(function () {
"use strict";

/* ---- 스튜디오 미니어처 도구(밝은 바닥 위 입체 모형 + 흰 판정 카드) ---- */
var K = window.sthKit, LT = K.LT;
function cl(x, a, b) { return Math.max(a, Math.min(b, x)); }
function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 6.2832); }
function rgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgba(h, a) { var c = rgb(h); return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")"; }
function mix(a, b, t) { var p = rgb(a), q = rgb(b), o = [], i; t = cl(t, 0, 1); for (i = 0; i < 3; i++) o.push(Math.round(p[i] + (q[i] - p[i]) * t)); return "rgb(" + o.join(",") + ")"; }
function shadowF(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 2, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ell(ctx, 0, 0, rx, rx); ctx.fill(); ctx.restore();
}
/* 유리 원기둥(비커·수조): inside(yl) 는 액체 속에 그릴 것 */
function glass(ctx, cx, yb, rx, h, lv, c, a, inside, ry) {
  ry = ry || rx * .22; var yt = yb - h, yl = yb - lv;
  shadowF(ctx, cx + rx * .1, yb + ry * .4, rx * 1.3, ry * 1.5, .3);
  ctx.fillStyle = "rgba(235,242,250,.45)"; ctx.beginPath(); ctx.moveTo(cx - rx, yt); ctx.lineTo(cx - rx, yb); ctx.ellipse(cx, yb, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, yt); ctx.ellipse(cx, yt, rx, ry, 0, 0, Math.PI, true); ctx.fill();
  if (lv > 0) {
    var g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); g.addColorStop(0, rgba(c, Math.min(.95, a * 1.7))); g.addColorStop(.4, rgba(c, a)); g.addColorStop(1, rgba(c, Math.min(.95, a * 1.8)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - rx + 2, yl); ctx.lineTo(cx - rx + 2, yb); ctx.ellipse(cx, yb, rx - 2, ry - 1, 0, Math.PI, 0, true); ctx.lineTo(cx + rx - 2, yl); ctx.ellipse(cx, yl, rx - 2, ry, 0, 0, Math.PI, false); ctx.fill();
    ctx.fillStyle = rgba(c, Math.min(.9, a)); ell(ctx, cx, yl, rx - 2, ry); ctx.fill();
  }
  if (inside) inside(yl);
  ctx.strokeStyle = "rgba(120,140,170,.75)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - rx, yt); ctx.lineTo(cx - rx, yb); ctx.ellipse(cx, yb, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, yt); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2.2; ell(ctx, cx, yt, rx, ry); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(cx - rx * .8, yt + ry + 6, rx * .12, h - ry - 12);
  return { yl: yl, yt: yt };
}
/* 입체 온도계 */
function thermo(ctx, x, y0, y1, f, c) {
  var tg = ctx.createLinearGradient(x - 8, 0, x + 8, 0); tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#b9c6d6");
  ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(x - 8, y0, 16, y1 - y0, 8); ctx.fill(); ctx.strokeStyle = "rgba(110,130,160,.7)"; ctx.lineWidth = 1.2; ctx.stroke();
  var top = y1 - cl(f, 0, 1) * (y1 - y0 - 8); ctx.fillStyle = c; ctx.fillRect(x - 3, top, 6, y1 - top);
  K.planet(ctx, x, y1 + 5, 12, c, "#7a1f12");
}

window.sthLab({
  mount: "lab", key: "lab", result: "rLab",
  cases: [

  /* ------------------------------------------------------------------ 1. 산화 환원 : 전자를 주는 쪽 */
  {
    id: "c1", about: "01", tag: "산화와 환원", title: "까맣게 변한 은수저 되살리기", short: "은수저",
    who: "🥄", name: "박물관 보존 담당",
    say: "“돌아가신 분이 쓰시던 은수저가 까맣게 변했어요. 검은 막은 은이 공기 속 황과 만나 생긴 <b>황화 은(Ag₂S)</b>입니다. 문질러 벗기면 은까지 깎여 나가니, 은을 <b>원래대로 되돌리는</b> 방법을 찾아야 해요. 전시 준비로 <b>10분</b>밖에 없습니다.”",
    predict: {
      q: "소금물에 은수저와 알루미늄 포일을 함께 넣어 두면 검은 막이 사라집니다. 알루미늄이 하는 일은?",
      options: ["㉠ 검은 막을 긁어서 벗겨 낸다", "㉡ 은 이온(Ag⁺)에 전자를 주고, 자신은 산화된다", "㉢ 은을 산화시켜 녹여 낸다"],
      answer: 1
    },
    task: "함께 넣을 금속과 물 온도를 골라 <b>10분 안에 검은 막을 99% 이상</b> 은으로 되돌리세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(340), ctx = cv.ctx, W = cv.W;
      var MET = { au: { t: "금", k: 0, c: "--amber", m: ["#ffe08a", "#b8860b"] }, cu: { t: "구리", k: 0.001, c: "--coral", m: ["#ffb987", "#9a4a20"] }, al: { t: "알루미늄", k: 0.02, c: "--mist", m: ["#f4f6fa", "#8a93a3"] } };
      var met = "cu", T = 40, tNow = 10;
      var run = api.ticker();
      function removed(t) { return 1 - Math.exp(-MET[met].k * Math.pow(2, (T - 25) / 10) * t); }
      function draw() {
        var r = removed(tNow), M = MET[met], i, LW = 560, cx = 250, yb = 300;
        ctx.clearRect(0, 0, W, cv.H);
        K.studio(ctx, 0, 0, LW, cv.H, null);
        /* 유리 수조 속 소금물, 은수저와 함께 넣은 금속 */
        glass(ctx, cx, yb, 200, 150, 112, T >= 70 ? "#9fd2f0" : "#a9cfee", .26, function (yl) {
          var tar = 1 - r, sc = mix("#f4f6fa", "#2a2522", tar), sd = mix("#9aa3b0", "#120f0e", tar);
          /* 은수저: 숨은 면 → 둥근 머리와 자루 */
          var sg = ctx.createLinearGradient(cx - 150, 0, cx + 10, 0); sg.addColorStop(0, sd); sg.addColorStop(.45, sc); sg.addColorStop(1, sd);
          ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(cx - 40, yb - 26); ctx.lineTo(cx + 70, yb - 46); ctx.lineTo(cx + 72, yb - 38); ctx.lineTo(cx - 36, yb - 18); ctx.closePath(); ctx.fill();
          ell(ctx, cx - 82, yb - 18, 46, 20); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255," + (.15 + .5 * r).toFixed(3) + ")"; ell(ctx, cx - 92, yb - 24, 18, 6); ctx.fill();
          /* 함께 넣은 금속 */
          var mg = ctx.createLinearGradient(cx + 40, 0, cx + 150, 0); mg.addColorStop(0, M.m[1]); mg.addColorStop(.5, M.m[0]); mg.addColorStop(1, M.m[1]);
          ctx.fillStyle = mg;
          if (met === "al") { ctx.beginPath(); ctx.moveTo(cx + 40, yb - 8); ctx.lineTo(cx + 62, yb - 30); ctx.lineTo(cx + 96, yb - 22); ctx.lineTo(cx + 128, yb - 36); ctx.lineTo(cx + 156, yb - 16); ctx.lineTo(cx + 132, yb - 2); ctx.lineTo(cx + 84, yb - 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + 62, yb - 26); ctx.lineTo(cx + 92, yb - 14); ctx.lineTo(cx + 124, yb - 28); ctx.stroke(); }
          else if (met === "cu") { ell(ctx, cx + 100, yb - 12, 26, 9); ctx.fill(); ctx.fillStyle = M.m[1]; ctx.fillRect(cx + 74, yb - 12, 52, 4); ctx.fillStyle = mg; ell(ctx, cx + 100, yb - 16, 26, 9); ctx.fill(); }
          else { ctx.strokeStyle = mg; ctx.lineWidth = 7; ell(ctx, cx + 100, yb - 16, 24, 9); ctx.stroke(); }
          if (M.k > 0 && r < 0.995) {
            var u = (tNow * 3) % 1;
            K.arrow(ctx, { x: cx + 44, y: yb - 40 }, { x: cx - 40, y: yb - 40 }, "#f59f00", 3, 11);
            K.glow(ctx, cx + 44 - 84 * u, yb - 40, 3, "rgba(255,190,60,.95)", 3);
          }
          for (i = 0; i < 10; i++) { ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fillRect(cx - 170 + i * 36, yl + 18 + (i % 3) * 22, 3, 3); }
        }, 34);
        if (T >= 70) for (i = 0; i < 4; i++) { ctx.strokeStyle = "rgba(150,165,190,.55)"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 90 + i * 60, 140); ctx.bezierCurveTo(cx - 100 + i * 60, 120, cx - 80 + i * 60, 105, cx - 92 + i * 60, 86); ctx.stroke(); }
        thermo(ctx, 500, 120, 286, (T - 20) / 80, "#e8590c");
        K.pill(ctx, T + " ℃", 500, 104, { s: 12, a: "center", c: "#ffd0a8", box: [0, LW] });
        if (M.k > 0) K.pill(ctx, "e⁻ : " + M.t + " → 은수저", cx, 116, { s: 12, a: "center", c: "#ffd35a", box: [0, LW] });
        K.bigText(ctx, r >= 0.99 ? "은수저가 되살아났다" : "검은 막 " + ((1 - r) * 100).toFixed(0) + "% 남음", 18, 44, 24, r >= 0.99 ? "#7ee0a0" : "#ffffff");
        K.bigText(ctx, "소금물 + 은수저 + " + M.t + " · " + tNow.toFixed(1) + "분", 18, 72, 15, "#ffd35a");
        /* 오른쪽 흰 판정 카드 */
        var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
        K.card(ctx, RX, 0, W - RX, cv.H, "판정");
        K.t(ctx, (r * 100).toFixed(1) + "%", x0, 70, { s: 28, w: "900", c: r >= 0.99 ? LT.green : LT.orange });
        K.t(ctx, "은으로 되돌아감", x1, 68, { s: 12, w: "800", a: "right", c: LT.mute });
        K.bar(ctx, x0, 84, x1 - x0, r, r >= 0.99 ? LT.green : LT.orange);
        K.row(ctx, "담가 둔 시간", tNow.toFixed(1) + " 분", x0, x1, 130);
        K.row(ctx, "반응 속도 (25 ℃의)", "× " + Math.pow(2, (T - 25) / 10).toFixed(1), x0, x1, 160);
        K.t(ctx, "은 이온 쪽: Ag⁺ + e⁻ → Ag (환원)", x0, 200, { s: 12, w: "800", c: LT.blue });
        K.t(ctx, M.k > 0 ? M.t + " 쪽: 전자를 내놓음 (산화)" : M.t + "은 은보다 전자를 안 내놓음", x0, 224, { s: 12, w: "800", c: M.k > 0 ? LT.red : LT.mute });
        K.tip(ctx, r >= 0.99 ? "10분 안에 99% 이상 — 성공" : (M.k === 0 ? "전자를 줄 금속이 아님" : "아직 느립니다"), x0 - 4, 254, x1 - x0 + 8, r >= 0.99 ? true : false);
        K.t(ctx, "※ 속도 계수는 수업용 모형", x0, 318, { s: 10.5, w: "700", c: LT.mute });
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
          if (MET[met].k === 0) return { ok: false, msg: "금은 은보다도 전자를 내놓지 않습니다. 아무리 데워도 변화가 없습니다." };
          if (r >= 0.99) return { ok: true, msg: MET[met].t + " · " + T + " ℃ · 10분 뒤 " + (r * 100).toFixed(1) + "% — 은이 전자를 받아 되살아났습니다." };
          return { ok: false, msg: "10분 뒤 " + (r * 100).toFixed(1) + "% — 아직 검은 막이 남습니다." + (met === "cu" ? " 구리는 너무 느려요." : "") };
        }
      };
    },
    hints: [
      "검은 막 속 은은 <b>Ag⁺</b> 상태입니다. 은으로 되돌리려면 누군가 <b>전자를 건네주어야</b> 합니다. 은보다 전자를 쉽게 내놓는 금속은?",
      "금속이 정해졌다면 남은 것은 속도입니다. 10분 안에 끝내려면 반응을 몇 배 빠르게 해야 할까요? 온도를 올려 보세요."
    ],
    solution: "<b>알루미늄 포일</b>을 넣고 물을 <b>75 ℃ 이상</b>으로 데우세요.",
    why: "황화 은 속 Ag⁺가 전자를 얻어 은(Ag)이 되는 것이 <b>환원</b>, 알루미늄이 전자를 잃고 Al³⁺가 되는 것이 <b>산화</b>입니다. 두 반응은 언제나 <b>동시에</b> 일어나지요 — 한쪽이 잃은 전자를 다른 쪽이 얻으니까요.<br>" +
      "적철석에서 철을 꺼낼 때 탄소(일산화 탄소)가 산소를 가져가며 산화된 것과 같은 짝입니다. 문질러 닦으면 은이 깎여 없어지지만, 이 방법은 <b>검은 막 속 은까지 되찾아</b> 줍니다. " +
      "※ 속도 계수는 수업용 모형입니다."
  },

  /* ------------------------------------------------------------------ 2. 중화 반응의 양적 관계 */
  {
    id: "c2", about: "02", tag: "중화 반응 · 더 나아가기", title: "식초 라벨을 믿어도 될까", short: "식초 적정",
    who: "🧪", name: "소비자 보호원",
    say: "“라벨 없는 식초 샘플이 들어왔어요. 식초 속 아세트산이 얼마나 진한지 알아야 합니다. <b>식초 10 mL</b>에 페놀프탈레인을 두 방울 넣고, 뷰렛으로 <b>0.20 M 수산화 나트륨</b> 수용액을 떨어뜨려 보세요. 붉은빛이 처음 돌아 사라지지 않는 순간이 기준입니다.”",
    predict: {
      q: "식초가 막 중화된 순간, 식초 속 아세트산이 내놓을 수 있는 H⁺의 수와 넣어 준 OH⁻의 수는?",
      options: ["㉠ H⁺가 더 많다", "㉡ 서로 같다", "㉢ OH⁻가 더 많다"],
      answer: 1
    },
    task: "수산화 나트륨을 넣어 <b>처음 붉어지는 순간에서 멈추고</b>, 그 부피로 계산한 <b>아세트산 농도</b>를 슬라이더로 정하세요(± 0.02 M).",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(380), ctx = cv.ctx, W = cv.W;
      var V = 0, C = 0.30, KA = 1.8e-5, NA = 8, CB = 0.2;
      function pH(v) {
        var nb = CB * v, tot = 10 + v;
        if (nb <= 0) return -H.log10(Math.sqrt(KA * NA / 10));
        if (nb < NA - 1e-9) return -H.log10(KA) + H.log10(nb / (NA - nb));
        if (Math.abs(nb - NA) < 1e-9) return 14 + H.log10(Math.sqrt(1e-14 / KA * NA / tot));
        return 14 + H.log10((nb - NA) / tot);
      }
      function draw() {
        var LW = 540, bx = 200, pink = V >= 40, i;
        ctx.clearRect(0, 0, W, cv.H);
        K.studio(ctx, 0, 0, LW, cv.H, { x: 280, y: 356, rx: 240, ry: 18 });
        function lpill(s, x, y, c, a) { K.pill(ctx, s, x, y, { s: 12, a: a || "left", c: c || LT.ink, bg: "rgba(255,255,255,.94)", line: "rgba(20,40,90,.18)", box: [0, LW] }); }
        /* 받침판·흰 타일·스탠드 */
        shadowF(ctx, 210, 360, 170, 12, .3);
        ctx.fillStyle = "#8a93a3"; ctx.beginPath(); ctx.moveTo(60, 350); ctx.lineTo(80, 340); ctx.lineTo(352, 340); ctx.lineTo(332, 350); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#5b6272"; ctx.fillRect(60, 350, 272, 10); ctx.beginPath(); ctx.moveTo(332, 350); ctx.lineTo(352, 340); ctx.lineTo(352, 350); ctx.lineTo(332, 360); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#f8f9fa"; ctx.beginPath(); ctx.moveTo(116, 346); ctx.lineTo(130, 338); ctx.lineTo(292, 338); ctx.lineTo(278, 346); ctx.closePath(); ctx.fill();
        var rg = ctx.createLinearGradient(88, 0, 98, 0); rg.addColorStop(0, "#6d7682"); rg.addColorStop(.5, "#e1e6ec"); rg.addColorStop(1, "#6d7682");
        ctx.fillStyle = rg; ctx.fillRect(88, 22, 10, 322);
        /* 뷰렛 */
        var by0 = 30, by1 = 186, lvl = by0 + V / 60 * (by1 - by0);
        ctx.fillStyle = "rgba(235,242,250,.75)"; ctx.fillRect(bx - 11, by0 - 6, 22, by1 - by0 + 6);
        var lq = ctx.createLinearGradient(bx - 11, 0, bx + 11, 0); lq.addColorStop(0, "rgba(120,170,230,.6)"); lq.addColorStop(.5, "rgba(180,212,246,.45)"); lq.addColorStop(1, "rgba(110,160,220,.65)");
        ctx.fillStyle = lq; ctx.fillRect(bx - 11, lvl, 22, by1 - lvl);
        ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(bx - 11, lvl); ctx.lineTo(bx + 11, lvl); ctx.stroke();
        ctx.strokeStyle = "rgba(110,130,160,.85)"; ctx.lineWidth = 1.8; ctx.strokeRect(bx - 11, by0 - 6, 22, by1 - by0 + 6);
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(bx - 7, by0, 3, by1 - by0);
        ctx.strokeStyle = "rgba(60,75,100,.75)"; ctx.lineWidth = 1.2;
        for (i = 0; i <= 60; i += 10) { var ty = by0 + i / 60 * (by1 - by0); ctx.beginPath(); ctx.moveTo(bx + 11, ty); ctx.lineTo(bx + 18, ty); ctx.stroke(); K.t(ctx, String(i), bx + 21, ty + 4, { s: 12, w: "700", c: LT.mute }); }
        ctx.fillStyle = "#4d5460"; ctx.fillRect(92, 96, bx - 104, 9); ctx.fillStyle = "#343a40"; ctx.beginPath(); ctx.roundRect(bx - 18, 90, 36, 20, 5); ctx.fill();
        ctx.fillStyle = "rgba(235,242,250,.85)"; ctx.fillRect(bx - 4, by1, 8, 30);
        ctx.fillStyle = "#3b8a5a"; ctx.beginPath(); ctx.roundRect(bx - 17, by1 + 6, 34, 9, 3); ctx.fill(); ctx.fillStyle = "#2b6a44"; ctx.fillRect(bx - 3, by1 + 2, 6, 17);
        /* 삼각 플라스크(식초 + 페놀프탈레인) */
        function flaskPath() { ctx.beginPath(); ctx.moveTo(bx - 15, 222); ctx.lineTo(bx - 15, 252); ctx.lineTo(bx - 74, 326); ctx.quadraticCurveTo(bx - 80, 338, bx - 64, 338); ctx.lineTo(bx + 64, 338); ctx.quadraticCurveTo(bx + 80, 338, bx + 74, 326); ctx.lineTo(bx + 15, 252); ctx.lineTo(bx + 15, 222); }
        var lvY = 304 - V * .45, hw = 15 + (lvY - 252) / 74 * 59, fc = pink ? mix("#f9c2dc", "#d6336c", Math.min(1, .35 + (V - 40) / 25)) : "#e3eef9";
        ctx.fillStyle = "rgba(235,242,250,.5)"; flaskPath(); ctx.fill();
        ctx.save(); flaskPath(); ctx.clip();
        var fg = ctx.createLinearGradient(bx - 80, 0, bx + 80, 0); fg.addColorStop(0, fc); fg.addColorStop(.5, mix(fc.charAt(0) === "#" ? fc : "#e3eef9", "#ffffff", .25)); fg.addColorStop(1, fc);
        ctx.fillStyle = pink ? fc : fg; ctx.globalAlpha = pink ? .85 : .9; ctx.fillRect(bx - 82, lvY, 164, 340 - lvY); ctx.globalAlpha = 1;
        if (!pink && V >= 30) { var sw = ctx.createRadialGradient(bx, lvY + 10, 2, bx, lvY + 10, 34); sw.addColorStop(0, "rgba(236,72,153," + ((V - 30) / 10 * .55).toFixed(2) + ")"); sw.addColorStop(1, "rgba(236,72,153,0)"); ctx.fillStyle = sw; ctx.fillRect(bx - 40, lvY, 80, 50); }
        ctx.restore();
        ctx.fillStyle = "rgba(255,255,255,.55)"; ell(ctx, bx, lvY, hw - 2, 4); ctx.fill();
        ctx.strokeStyle = "rgba(110,130,160,.85)"; ctx.lineWidth = 2; flaskPath(); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2; ell(ctx, bx, 222, 15, 4); ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.beginPath(); ctx.moveTo(bx - 26, 268); ctx.lineTo(bx - 20, 268); ctx.lineTo(bx - 50, 320); ctx.lineTo(bx - 56, 320); ctx.closePath(); ctx.fill();
        if (V > 0 && V < 60) K.planet(ctx, bx, 232, 3.6, "#bcd8f5", "#5a8ac0");
        /* 수산화 나트륨 비커 */
        glass(ctx, 470, 346, 46, 96, 62, "#cfe3f5", .32, null, 10);
        lpill("0.20 M NaOH", 470, 232, LT.blue, "center");
        lpill("뷰렛 NaOH " + V + " mL", bx + 52, 150, LT.blue);
        lpill("식초 10 mL + 페놀프탈레인", 292, 268, LT.ink);
        lpill(pink ? "붉은빛 (염기성)" : (V >= 30 ? "붉은빛이 생겼다 사라짐" : "무색"), 292, 300, pink ? "#c2255c" : LT.mute);
        K.bigText(ctx, "pH " + pH(V).toFixed(2), 262, 44, 26, pink ? "#ff9cc9" : "#ffffff");
        K.bigText(ctx, V === 40 ? "처음 붉어진 순간" : (V > 40 ? "지나쳤다" : "아직 무색"), 262, 72, 15, "#ffd35a");
        /* 오른쪽 흰 카드: 작은 적정 곡선과 양 */
        var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
        K.card(ctx, RX, 0, W - RX, cv.H, "적정 곡선 — 지나온 구간");
        var g = K.chart(ctx, { x: RX + 4, y: 36, w: W - RX - 8, h: 190, pl: 40, pb: 30, pt: 8, pr: 14, x0: 0, x1: 60, y0: 0, y1: 14, xt: 6, yt: 7, light: true, xf: function (q) { return Math.round(q) + ""; } });
        K.line(ctx, { x: g.L, y: g.Y(8.2) }, { x: g.R, y: g.Y(8.2) }, "#e64980", 1.4, [5, 4]);
        K.t(ctx, "붉어지기 시작 pH 8.2", g.L + 6, g.Y(8.2) - 6, { s: 11, w: "800", c: "#c2255c" });
        K.t(ctx, "NaOH (mL)", g.R, g.B + 26, { s: 11, w: "700", a: "right", c: LT.mute });
        var pts = []; for (var v = 0; v <= V; v += 0.25) pts.push([v, pH(v)]);
        if (pts.length > 1) K.plot(ctx, g, pts, LT.violet, { w: 2.6, light: true });
        K.planet(ctx, g.X(V), g.Y(pH(V)), 5.5, "#9775fa", "#3b1f8a");
        var ok = Math.abs(10 * C - CB * V) < 0.05;
        K.row(ctx, "내가 정한 아세트산 농도", C.toFixed(2) + " M", x0, x1, 256);
        K.row(ctx, "넣은 OH⁻", (CB * V).toFixed(1) + " mmol", x0, x1, 282, LT.blue);
        K.row(ctx, "내 농도로 본 산", (10 * C).toFixed(1) + " mmol", x0, x1, 308, ok ? LT.green : LT.orange);
        K.tip(ctx, ok ? "H⁺의 양 = OH⁻의 양" : "두 양이 아직 다릅니다", x0 - 4, 324, x1 - x0 + 8, ok);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "넣은 수산화 나트륨 수용액", min: 0, max: 60, step: 1, value: 0, fmt: function (x) { return x + " mL"; },
        onInput: function (x) { V = x; draw(); } });
      api.slider({ label: "식초 속 아세트산 농도 (내 계산)", min: 0.10, max: 1.50, step: 0.02, value: 0.30, fmt: function (x) { return x.toFixed(2) + " M"; },
        onInput: function (x) { C = x; draw(); } });
      api.info("아세트산 한 개는 H⁺를 한 개 내놓을 수 있고, NaOH 한 개는 OH⁻를 한 개 내놓습니다. 몰 농도(M) × 부피(mL) = mmol입니다.");
      draw();
      return {
        judge: function () {
          if (V !== 40) return { ok: false, msg: V < 40 ? "아직 무색입니다. 붉어지는 순간까지 더 넣으세요." : "이미 지나쳤습니다. 처음 붉어지는 순간에서 멈춰야 정확합니다." };
          if (Math.abs(C - 0.80) <= 0.021) return { ok: true, msg: "40 mL × 0.20 M = 8.0 mmol = 10 mL × " + C.toFixed(2) + " M — 아세트산 약 0.80 M, 약 4.8% 식초입니다." };
          return { ok: false, msg: "종말점은 찾았습니다. 그런데 " + C.toFixed(2) + " M이면 산이 " + (10 * C).toFixed(1) + " mmol — 넣은 OH⁻ 8.0 mmol과 맞지 않아요." };
        }
      };
    },
    hints: [
      "뷰렛을 조금씩 늘리다가 플라스크가 <b>처음 붉어지는</b> 부피를 찾으세요. 그래프가 갑자기 치솟는 곳이기도 합니다.",
      "중화점에서는 <b>H⁺의 양 = OH⁻의 양</b>. 넣은 OH⁻ = 0.20 × 40 = 8.0 mmol 이니, 식초 10 mL 속 아세트산 농도는?"
    ],
    solution: "<b>40 mL</b>에서 처음 붉어집니다. 0.20 M × 40 mL = 8.0 mmol이므로 농도 = 8.0 ÷ 10 = <b>0.80 M</b>. 두 슬라이더를 40 mL, 0.80 M에 두세요.",
    why: "중화 반응에서 H⁺와 OH⁻는 <b>1 : 1</b>로 만나 물이 됩니다. 그래서 중화점까지 들어간 OH⁻의 양을 알면, 모르는 산의 양을 거꾸로 알아낼 수 있습니다. 이것이 <b>중화 적정</b>입니다.<br>" +
      "호수에 석회를 얼마나 뿌려야 할지 계산한 것과 같은 생각입니다. 지시약은 <b>그 순간을 눈으로 보여 주는 신호</b>일 뿐입니다. " +
      "※ 약산이라 중화점의 pH가 7보다 조금 높게(약 9) 나타나는데, 그래서 이 적정에는 pH 8~10에서 색이 바뀌는 페놀프탈레인을 씁니다."
  },

  /* ------------------------------------------------------------------ 3. 증발 : 흡열 반응의 쓰임 */
  {
    id: "c3", about: "03", tag: "에너지 출입", title: "전기 없는 항아리 냉장고", short: "항아리 냉장고",
    who: "🏺", name: "국제 구호 단체",
    say: "“큰 항아리 안에 작은 항아리를 넣고 사이를 <b>모래</b>로 채운 ‘항아리 냉장고’를 보급하려 해요. 전기가 없는 마을의 채소를 <b>20 ℃ 아래</b>로 두면 사흘은 버팁니다. 세 지역 모두 한낮 기온은 <b>30 ℃</b>. 어디에, 어떻게 두어야 할까요?”",
    predict: {
      q: "젖은 모래가 안쪽 항아리를 시원하게 만드는 까닭은?",
      options: ["㉠ 물이 원래 차가워서", "㉡ 물이 증발하면서 주변에서 열을 흡수해서", "㉢ 모래가 햇빛을 반사해서"],
      answer: 1
    },
    task: "지역·모래·두는 곳을 골라 <b>안쪽 항아리를 20 ℃ 아래</b>로 유지하세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(350), ctx = cv.ctx, W = cv.W;
      var REG = { desert: { t: "사헬 (건조)", rh: 0.20 }, temp: { t: "온대 여름", rh: 0.55 }, rain: { t: "열대 우림", rh: 0.85 } };
      var PL = { sun: { t: "햇볕 드는 마당", wind: 1, heat: 5 }, shade: { t: "바람 부는 그늘", wind: 1, heat: 0 }, room: { t: "바람 없는 창고", wind: 0.5, heat: 0 } };
      var reg = "temp", wet = "dry", pl = "sun";
      function evap() { return wet === "wet" ? 16 * (1 - REG[reg].rh) * PL[pl].wind : 0; }
      function inside() { return 30 - evap() + PL[pl].heat; }
      /* 잠라 본 항아리(입체): 바깥 항아리 → 모래 → 안쪽 항아리, 앞쪽 절반을 잘라 속을 보여 준다 */
      function pot(cx, yb) {
        var rT = 120, rB = 92, h = 200, yt = yb - h, ry = 22, sand = wet === "wet" ? ["#9c8f78", "#6f6553"] : ["#e9cf98", "#cdb07a"];
        shadowF(ctx, cx + 14, yb + 6, 150, 22, .32);
        /* 바깥 항아리 뒷면(차가우면 젖은 색) */
        var og = ctx.createLinearGradient(cx - rT, 0, cx + rT, 0); og.addColorStop(0, "#9a5436"); og.addColorStop(.45, wet === "wet" ? "#b3653f" : "#d38a5a"); og.addColorStop(1, "#7b3f27");
        ctx.fillStyle = og; ctx.beginPath(); ctx.moveTo(cx - rT, yt); ctx.lineTo(cx - rB, yb); ctx.ellipse(cx, yb, rB, ry * .8, 0, Math.PI, 0, true); ctx.lineTo(cx + rT, yt); ctx.ellipse(cx, yt, rT, ry, 0, 0, Math.PI, true); ctx.fill();
        /* 자른 단면: 모래 띠 */
        var sg = ctx.createLinearGradient(0, yt, 0, yb); sg.addColorStop(0, sand[0]); sg.addColorStop(1, sand[1]);
        ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(cx - rT + 10, yt + 4); ctx.lineTo(cx + rT - 10, yt + 4); ctx.lineTo(cx + rB - 8, yb - 8); ctx.lineTo(cx - rB + 8, yb - 8); ctx.closePath(); ctx.fill();
        var R = K.rng(7), i; ctx.fillStyle = "rgba(255,255,255,.28)"; for (i = 0; i < 160; i++) ctx.fillRect(cx - 100 + R() * 200, yt + 6 + R() * (h - 16), 1.5, 1.5);
        if (wet === "wet") { ctx.fillStyle = "rgba(70,130,200,.35)"; for (i = 0; i < 30; i++) { ctx.beginPath(); ctx.arc(cx - 95 + R() * 190, yt + 10 + R() * (h - 24), 2, 0, 6.283); ctx.fill(); } }
        /* 안쪽 항아리와 채소 */
        var ig = ctx.createLinearGradient(cx - 70, 0, cx + 70, 0); ig.addColorStop(0, "#a8613f"); ig.addColorStop(.5, "#d9966a"); ig.addColorStop(1, "#8c4c30");
        ctx.fillStyle = ig; ctx.beginPath(); ctx.moveTo(cx - 76, yt + 4); ctx.lineTo(cx - 62, yb - 24); ctx.lineTo(cx + 62, yb - 24); ctx.lineTo(cx + 76, yt + 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "#f3efe6"; ctx.beginPath(); ctx.moveTo(cx - 66, yt + 8); ctx.lineTo(cx - 54, yb - 32); ctx.lineTo(cx + 54, yb - 32); ctx.lineTo(cx + 66, yt + 8); ctx.closePath(); ctx.fill();
        [[-28, 0, "#f08c2e"], [10, 22, "#e8432f"], [34, -8, "#e8432f"], [-10, 40, "#f08c2e"], [-36, 60, "#3f9b3a"], [22, 70, "#e8432f"]].forEach(function (q) { K.planet(ctx, cx + q[0], yt + 60 + q[1], 15, q[2], "#5a1f0e"); });
        /* 항아리 입구 테두리와 젖은 천 뛪껑 */
        ctx.strokeStyle = "#6d3a24"; ctx.lineWidth = 6; ell(ctx, cx, yt, rT, ry); ctx.stroke();
        ctx.fillStyle = wet === "wet" ? "rgba(140,160,180,.55)" : "rgba(230,215,185,.6)"; ctx.beginPath(); ctx.ellipse(cx, yt - 4, rT * .9, ry * .7, 0, Math.PI, 0); ctx.fill();
        return { yt: yt, yb: yb };
      }
      function draw() {
        var LW = 560, tin = inside(), e = evap(), i, cx = 230;
        ctx.clearRect(0, 0, W, cv.H);
        K.studio(ctx, 0, 0, LW, cv.H, null);
        /* 두는 곳: 햇볕 · 나무 그늘 · 창고 벽 */
        if (pl === "sun") { K.sun(ctx, 470, 70, 18); for (i = 0; i < 4; i++) K.arrow(ctx, { x: 450 - i * 8, y: 96 + i * 4 }, { x: 370 - i * 26, y: 140 + i * 10 }, "#f59f00", 2.5, 9); }
        else if (pl === "shade") { ctx.fillStyle = "#6b4a2e"; ctx.fillRect(470, 90, 12, 230); [[476, 80, 60], [430, 100, 44], [520, 104, 44]].forEach(function (q) { K.planet(ctx, q[0], q[1], q[2], "#5fae4a", "#1f5a24"); }); for (i = 0; i < 3; i++) { ctx.strokeStyle = "rgba(90,120,160,.6)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(30, 150 + i * 40); ctx.bezierCurveTo(60, 140 + i * 40, 80, 160 + i * 40, 104, 150 + i * 40); ctx.stroke(); } }
        else { ctx.fillStyle = "#c9c2b6"; ctx.fillRect(0, 80, LW, 10); ctx.fillStyle = "rgba(160,150,135,.35)"; ctx.fillRect(0, 90, LW, 240); }
        var p = pot(cx, 316);
        if (e > 0) {
          var n = Math.max(1, Math.round(e / 3));
          for (i = 0; i < n; i++) { var yy = 260 - i * 34; K.arrow(ctx, { x: cx + 126, y: yy }, { x: cx + 178, y: yy - 18 }, "#4f8dff", 2.4, 9); }
          K.pill(ctx, "수증기가 열을 가지고 나감", cx + 140, 296, { s: 11.5, c: "#cfe4ff", box: [0, LW] });
        }
        if (PL[pl].heat > 0) K.pill(ctx, "햇볕 +" + PL[pl].heat + " ℃", 470, 120, { s: 11.5, a: "center", c: "#ffd0a8", box: [0, LW] });
        K.pill(ctx, wet === "wet" ? "젖은 모래" : "마른 모래", cx - 150, 220, { s: 11.5, a: "center", c: "#ffe7c2", box: [0, LW] });
        K.bigText(ctx, "안쪽 " + tin.toFixed(1) + " ℃", 18, 44, 26, tin < 20 ? "#7ee0a0" : "#ffffff");
        K.bigText(ctx, REG[reg].t + " · " + PL[pl].t, 18, 72, 15, "#ffd35a");
        /* 오른쪽 흰 판정 카드 */
        var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
        K.card(ctx, RX, 0, W - RX, cv.H, "판정 — 안쪽 항아리");
        K.t(ctx, tin.toFixed(1) + " ℃", x0, 70, { s: 28, w: "900", c: tin < 20 ? LT.green : LT.red });
        K.t(ctx, "목표 20 ℃ 아래", x1, 68, { s: 12, w: "800", a: "right", c: LT.mute });
        K.row(ctx, "바깥 기온 · 습도", "30 ℃ · " + Math.round(REG[reg].rh * 100) + "%", x0, x1, 112);
        K.row(ctx, "증발로 빼앗는 온도", "− " + e.toFixed(1) + " ℃", x0, x1, 144, LT.blue);
        K.bar(ctx, x0, 152, x1 - x0, e / 16, LT.blue);
        K.row(ctx, "햇볕으로 더해지는 온도", "+ " + PL[pl].heat + " ℃", x0, x1, 194, PL[pl].heat ? LT.red : LT.ink);
        K.tip(ctx, tin < 20 ? "증발이 열을 빼앗아 갑니다" : (wet === "dry" ? "마른 모래는 식힐 것이 없음" : "아직 20 ℃보다 높음"), x0 - 4, 216, x1 - x0 + 8, tin < 20);
        K.t(ctx, "※ 온도 계산은 수업용 모형", x0, 312, { s: 10.5, w: "700", c: LT.mute });
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
          return { ok: false, msg: "안쪽 " + t.toFixed(1) + " ℃ — 아직 20 ℃보다 높습니다." };
        }
      };
    },
    hints: [
      "물이 증발하려면 에너지가 필요하고, 그 에너지는 <b>항아리와 채소에서</b> 가져옵니다. 증발이 빠를수록 더 시원해집니다.",
      "공기가 이미 습하면 물이 잘 증발하지 않습니다. 가장 건조한 곳에서, 증발을 돕고 햇볕은 막는 자리를 고르세요."
    ],
    solution: "<b>사헬 · 물로 적신 모래 · 바람 부는 그늘</b>. 안쪽이 약 17 ℃까지 내려갑니다.",
    why: "물이 증발할 때는 주변에서 열을 <b>흡수</b>합니다(흡열). 땀이 마르며 몸이 식고, 손 소독제를 바르면 차가운 것과 같은 까닭입니다. 반대로 수증기가 물로 응결할 때는 열을 내놓습니다.<br>" +
      "손난로(철의 산화 — 발열)와 냉찜질 팩(질산 암모늄의 용해 — 흡열)처럼, 이 항아리도 <b>에너지 출입</b>을 쓰는 도구입니다. 다만 증발은 공기가 건조할 때만 잘 일어나서, 실제로 나이지리아·수단 같은 건조 지역에서 널리 쓰입니다. " +
      "※ 온도 계산은 수업용 모형입니다."
  }
  ]
});
})();
