/* 통합과학2 Ⅲ-1 과학 기술의 활용 — 실제 자료
   r1 독감이 사라진 겨울 — 미국 CDC 독감 감시 자료로 본 2020~21년 겨울
   r2 240만 장의 엽서는 왜 틀렸나 — 1936년 미국 대통령 선거 여론 조사와 실제 결과
   자료: data/flu-us.js (CDC ILINet), 1936년 선거 수치는 이 파일 안에 적음 */
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
  var CX = 690, x0 = CX + 16, x1 = W - 16;
  K.card(ctx, CX, 0, W - CX, CH, title);
  lt(ctx, big, x0, 58, { s: 19, w: "900", c: bigCol });
  rows.forEach(function (r, i) { K.row(ctx, r[0], r[1], x0, x1, 92 + i * 26, r[2]); });
  if (tip) K.tip(ctx, tip, x0 - 4, 100 + rows.length * 26, x1 - x0 + 4, good);
}
function hospital(ctx, ox, oy, need) {                                  /* 병상 10개 병원 미니어처 (need = 필요한 침대 수) */
  var I = K.iso({ ox: ox, oy: oy, s: .78, L: 120, D: 70 }), fill = Math.min(10, Math.round(need)), extra = Math.max(0, Math.round(need) - 10);
  I.box(ctx, 0, 0, 0, 120, 70, 6, "#f1f3f5", "#dfe4ea", "#b8c0ca");
  I.box(ctx, 0, 0, 6, 120, 4, 40, "#ffffff", "#f1f3f5", "#ced4da");
  var c = I.P(60, 4, 26); ctx.fillStyle = "#e03131"; ctx.fillRect(c.x - 3, c.y - 9, 6, 18); ctx.fillRect(c.x - 9, c.y - 3, 18, 6);
  for (var b = 0; b < 10; b++) {
    var bx = 8 + (b % 5) * 22, by = b < 5 ? 14 : 42, on = b < fill;
    I.box(ctx, bx, by, 6, bx + 16, by + 22, 12, on ? "#ffc9c9" : "#ffffff", on ? "#e03131" : "#dee2e6", on ? "#a51111" : "#adb5bd");
    if (on) { var hp = I.P(bx + 8, by + 6, 13); ctx.fillStyle = "#f1c7a5"; ctx.beginPath(); ctx.arc(hp.x, hp.y, 2.4, 0, 6.2832); ctx.fill(); }
  }
  for (var e = 0; e < Math.min(8, extra); e++) I.person(ctx, 128 + (e % 4) * 7, 20 + e * 7, 0, "#e03131", 1.2);
  return extra;
}
var F = (window.REAL_FLU || { rows: [] }).rows;                     /* [YYYYWW, %] */
function season(w) { var y = Math.floor(w / 100), k = w % 100; return k >= 40 ? y : y - 1; }
var PK = {}; F.forEach(function (r) { var k = r[0] % 100; if (k > 20 && k < 40) return; var s = season(r[0]); if (!PK[s] || r[1] > PK[s][1]) PK[s] = [r[0], r[1]]; });
var SEASONS = Object.keys(PK).map(Number).sort();
var LOW = SEASONS.reduce(function (b, s) { return PK[s][1] < PK[b][1] ? s : b; }, SEASONS[0] || 2020);
/* 1936년 미국 대통령 선거: 리터러리 다이제스트 우편 조사(약 1천만 장 발송, 약 238만 장 회수)와 실제 득표 */
var LD = { landon: 57, roosevelt: 43, n: 2376523 }, REAL = { roosevelt: 60.8, landon: 36.5 }, GALLUP = { roosevelt: 56, n: 50000 };
var SRC1 = "<small>출처: 미국 질병통제예방센터(CDC) ILINet 전국 독감 의사환자 비율(가중), 2016년 40주 ~ 2025년 20주 — 카네기멜런 대학 Delphi Epidata API로 받음. 사본은 data/flu-us.js.</small>";
var SRC2 = "<small>자료: 리터러리 다이제스트 1936년 10월 31일 호의 최종 집계(랜던 57%, 루스벨트 43%, 회수 약 238만 장), 실제 일반 투표 득표율(루스벨트 60.8%, 랜던 36.5%), 갤럽 예측(루스벨트 약 56%). 57 / 43은 두 후보만 놓고 본 비율이고 실제 득표율은 전체 투표 대비입니다. 출처: Squire (1988), Public Opinion Quarterly 52, 125–133.</small>";

window.sthLab({
  mount: "real", key: "real", result: "rReal", label: "실제 자료",
  doneNote: "정리하기 탭에서 실제 자료로 감염병 감시와 빅데이터의 장단점을 설명해 보세요.",
  cases: [
  {
    id: "r1", sec: "01", tag: "실제 자료 · 감염병 감시", title: "독감이 사라진 겨울", short: "독감 감시",
    who: "🦠", name: "질병 감시 센터",
    say: "“미국 질병통제예방센터는 전국 약 3천 곳의 외래 진료 기관에서 해마다 <b>독감 의심 환자 비율</b>을 주마다 모아요. 아래는 2016~2025년의 실제 자료입니다. 겨울마다 봉우리가 솟는데, 한 겨울만 이상해요. 독감 유행이 <b>가장 약했던 겨울</b>을 찾아 주세요.”",
    predict: {
      q: "코로나19 유행으로 마스크 쓰기·거리 두기를 하던 2020~21년 겨울, 독감은?",
      options: ["㉠ 평소보다 훨씬 크게 유행했다", "㉡ 평소와 비슷했다", "㉢ 거의 유행하지 않았다"],
      answer: 2
    },
    task: "겨울(유행 철)을 골라 봉우리 높이를 비교하고, 독감 유행이 가장 약했던 겨울을 고르세요.",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(300), ctx = cv.ctx, W = cv.W, s = SEASONS[0];
      function idx(w) { for (var i = 0; i < F.length; i++) if (F[i][0] === w) return i; return 0; }
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var CH = cv.H, i;
        K.studio(ctx, 0, 0, 684, CH, { x: 600, y: CH - 40, rx: 80, ry: 12 });
        var g = K.chart(ctx, { x: 4, y: 22, w: 510, h: CH - 30, x0: 0, x1: F.length - 1, y0: 0, y1: 9, xt: 1, yt: 3, xf: function () { return ""; }, yf: function (q) { return q + "%"; }, yl: "독감 의심 환자 비율 (%)", light: true });
        var a = idx(s * 100 + 40), b = idx((s + 1) * 100 + 20);
        ctx.fillStyle = "rgba(245,159,0,.18)"; ctx.fillRect(g.X(a), g.T, g.X(b) - g.X(a), g.B - g.T);
        K.plot(ctx, g, F.map(function (r, k) { return [k, r[1]]; }), LT.red, { w: 2, light: true });
        SEASONS.forEach(function (q) { var k = idx(q * 100 + 52) || idx(q * 100 + 51); lt(ctx, String(q).slice(2) + "-" + String(q + 1).slice(2), g.X(k), g.B + 14, { s: 9.5, a: "center", w: q === s ? "900" : "600", c: q === s ? LT.orange : LT.mute }); });
        /* 동네 의원 미니어처: 대기 환자 수 = 봉우리 높이, 2020~21년은 모두 마스크 */
        var I = K.iso({ ox: 600, oy: 120, s: .7, L: 110, D: 80 }), pk = PK[s][1], np = Math.min(14, Math.round(pk * 2)), mask = s === 2020;
        I.box(ctx, 0, 0, 0, 110, 80, 6, "#e9ecef", "#ced4da", "#adb5bd");
        I.box(ctx, 0, 0, 6, 70, 34, 50, "#ffffff", "#f1f3f5", "#ced4da");
        var cr = I.P(35, 34, 36); ctx.fillStyle = "#1c7ed6"; ctx.fillRect(cr.x - 2.5, cr.y - 8, 5, 16); ctx.fillRect(cr.x - 8, cr.y - 2.5, 16, 5);
        for (i = 0; i < np; i++) { var px = 10 + (i % 7) * 13, py = 46 + Math.floor(i / 7) * 16; I.person(ctx, px, py, 6, "#ff922b", 1.3); if (mask) { var fp = I.P(px, py, 6); ctx.fillStyle = "#ffffff"; ctx.fillRect(fp.x - 2.2, fp.y - 16.5, 4.4, 2.6); } }
        K.pill(ctx, mask ? "모두 마스크 · 대기 환자 적음" : "대기 환자 " + np + "명", 600, CH - 12, { s: 11, a: "center", c: mask ? "#b2f2bb" : "#ffd8a8", box: [516, 684] });
        judge(ctx, W, CH, "판정 · 고른 겨울", s + " ~ " + (s + 1), s === LOW ? LT.green : LT.orange, [["가장 높은 주", String(PK[s][0]).slice(0, 4) + "년 " + (PK[s][0] % 100) + "주"], ["봉우리", PK[s][1].toFixed(1) + " %", s === LOW ? LT.green : LT.red]], s === LOW ? "유행이 가장 약했던 겨울" : "더 낮은 봉우리가 있다", s === LOW);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "겨울(유행 철)", min: SEASONS[0], max: SEASONS[SEASONS.length - 1], step: 1, value: SEASONS[0], fmt: function (x) { return x + " ~ " + (x + 1); }, onInput: function (x) { s = x; api.changed(); draw(); } });
      api.info("유행 철은 그해 40주(10월 초)부터 이듬해 20주(5월)까지로 잡았습니다. " + SRC1
        + "<div data-link='{\"id\":\"kdca-flu\",\"title\":\"질병관리청 감염병포털 — 인플루엔자 통계\",\"src\":\"질병관리청\",\"url\":\"https://dportal.kdca.go.kr/pot/is/st/influ.do\",\"ask\":\"기간(절기)을 2019년 ~ 2021년으로 고르고 ‘통계작성’을 누르세요. 우리나라 외래 환자 1,000명당 독감 의사 환자 수가 2019~2020 겨울과 2020~2021 겨울에 각각 가장 높았던 값을 찾아, 미국 자료처럼 한 겨울이 사라졌는지 적어 오세요.\"}'></div>");
      draw();
      return {
        judge: function () {
          if (s === LOW) return { ok: true, msg: s + " ~ " + (s + 1) + "년 겨울의 봉우리는 " + PK[s][1].toFixed(1) + "% 뿐 — 다른 해(5~8%)의 3분의 1 아래였습니다." };
          return { ok: false, msg: s + " ~ " + (s + 1) + "년 봉우리는 " + PK[s][1].toFixed(1) + "%입니다. 더 낮은 겨울이 있습니다." };
        }
      };
    },
    hints: ["봉우리가 거의 솟지 않은 겨울을 찾으세요.", "코로나19 유행 첫 겨울입니다."],
    solution: "<b>" + LOW + " ~ " + (LOW + 1) + "년</b> 겨울.",
    why: "마스크 쓰기, 손 씻기, 거리 두기, 국경 통제가 코로나19 뿐 아니라 같은 경로(호흡기 비말)로 퍼지는 독감까지 막았습니다. 감염병 감시 체계가 해마다 같은 방법으로 자료를 모아 왔기에, 이런 변화를 숫자로 확인할 수 있었습니다.<br>"
      + "그 뒤 방역을 풀자 2022~23년 겨울에는 독감이 평소보다 일찍(11~12월) 크게 유행했습니다. 면역을 가진 사람이 줄어든 탓으로 보입니다. 꾸준한 감시가 유행을 미리 알아채는 데 꼭 필요한 까닭입니다.<br>※ ‘독감 의심 환자’에는 증상이 비슷한 다른 병도 섞입니다. 2021년 여름의 작은 봉우리(약 2.3%)는 독감이 아니라 코로나19 유행 때문입니다. 2020~21년 겨울에 보이는 낮은 봉우리(약 1.6%)도 독감보다는 코로나19 같은 다른 병이 섞인 값으로 보입니다."
  },
  {
    id: "r2", sec: "02", tag: "실제 자료 · 데이터의 치우침", title: "240만 장의 엽서는 왜 틀렸나", short: "1936년 여론 조사",
    who: "📮", name: "여론 조사 연구소",
    say: "“1936년 미국 대통령 선거 때 잡지 리터러리 다이제스트는 엽서 1천만 장을 보내 <b>약 238만 장</b>을 돌려받았어요. 갤럽은 고작 <b>5만 명</b> 남짓을 골라 물었고요. 아래는 두 조사의 예측과 <b>실제 득표율</b>입니다. 루스벨트의 득표율 예측이 실제와 <b>몇 %p 어긋났는지</b>, 리터러리 다이제스트를 계산해 주세요.”",
    predict: {
      q: "응답자 수가 훨씬 많은 리터러리 다이제스트의 예측이 더 정확했을까요?",
      options: ["㉠ 응답자가 많으니 더 정확했다", "㉡ 응답자가 한쪽(전화·자동차를 가진 부유층, 잡지 구독자)에 치우쳐 크게 틀렸다", "㉢ 두 조사 모두 정확했다"],
      answer: 1
    },
    task: "리터러리 다이제스트가 예측한 루스벨트 득표율과 실제 득표율의 차이(%p)를 맞추세요(± 0.5 %p). (예측 43%는 두 후보만 놓고 본 비율, 실제 60.8%는 전체 투표 대비라 기준이 조금 다르지만 여기서는 그대로 뺍니다.)",
    build: function (stage, api) {
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, g = 0;
      function draw() {
        ctx.clearRect(0, 0, W, cv.H);
        var CH = cv.H, x0 = 210, x1 = 500, rows = [["리터러리 다이제스트 (238만 장)", LD.roosevelt, "#c92a2a", "#ff8787"], ["갤럽 (약 5만 명)", GALLUP.roosevelt, "#d9480f", "#ffa94d"], ["실제 결과", REAL.roosevelt, "#0f9f76", "#63e6be"]];
        K.studio(ctx, 0, 0, 684, CH, { x: 600, y: CH - 36, rx: 80, ry: 12 });
        lt(ctx, "루스벨트 득표율", x0, 26, { s: 11, w: "800", c: LT.mute });
        rows.forEach(function (r, i) {
          var y = 42 + i * 56, w = r[1] / 100 * (x1 - x0);
          lt(ctx, r[0], x0 - 10, y + 20, { s: 12, w: "800", a: "right" });
          ctx.fillStyle = "#e3e9f1"; ctx.beginPath(); ctx.roundRect(x0, y, x1 - x0, 30, 6); ctx.fill();
          var bg = ctx.createLinearGradient(0, y, 0, y + 30); bg.addColorStop(0, r[3]); bg.addColorStop(1, r[2]); ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x0, y, w, 30, 6); ctx.fill();
          lt(ctx, r[1] + " %", x0 + w + 8, y + 20, { s: 12, w: "900", c: r[2] });
        });
        ctx.save(); ctx.strokeStyle = "rgba(20,40,90,.45)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x0 + .5 * (x1 - x0), 34); ctx.lineTo(x0 + .5 * (x1 - x0), 208); ctx.stroke(); ctx.restore();
        lt(ctx, "50%", x0 + .5 * (x1 - x0), 222, { s: 10.5, a: "center", c: LT.mute });
        /* 엽서 더미 미니어처: 238만 장 대 5만 명 (부피는 수의 세제곱근 비율) */
        var I = K.iso({ ox: 600, oy: 96, s: .62, L: 130, D: 130 });
        I.box(ctx, 0, 0, 0, 130, 130, 4, "#e9ecef", "#ced4da", "#adb5bd");
        I.box(ctx, 8, 8, 4, 88, 88, 84, "#ffffff", "#f1f3f5", "#dee2e6");
        var Ia = K.iso({ ox: 600, oy: 96, s: .62, L: 130, D: 130 }); for (var k = 10; k < 84; k += 6) { var l1 = Ia.P(8, 88, k), l2 = Ia.P(88, 88, k); ctx.strokeStyle = "rgba(120,130,150,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(l1.x, l1.y); ctx.lineTo(l2.x, l2.y); ctx.stroke(); }
        I.box(ctx, 100, 100, 4, 122, 122, 26, "#fff9db", "#ffec99", "#fcc419");
        K.pill(ctx, "238만 장", I.P(48, 48, 84).x, I.P(48, 48, 84).y - 8, { s: 11, a: "center", c: "#ffc9c9", box: [516, 684] });
        K.pill(ctx, "5만 명", I.P(111, 111, 26).x + 26, I.P(111, 111, 26).y + 30, { s: 11, a: "center", c: "#ffe066", box: [516, 684] });
        K.pill(ctx, "많다고 정확하지 않다", 600, CH - 10, { s: 11, a: "center", c: "#e8ecff", box: [516, 684] });
        judge(ctx, W, CH, "판정 · 예측이 얼마나 어긋났나", "내 답 " + g.toFixed(1) + " %p", Math.abs(g - (REAL.roosevelt - LD.roosevelt)) <= 0.5 ? LT.green : LT.orange, [["다이제스트 예측", LD.roosevelt + " %"], ["실제 득표율", REAL.roosevelt + " %", LT.green]], "실제 − 예측을 계산해 보세요", null);
      }
      cv.canvas._redraw = draw;
      api.slider({ label: "예측과 실제의 차이", min: 0, max: 30, step: 0.1, value: 0, fmt: function (x) { return x.toFixed(1) + " %p"; }, onInput: function (x) { g = x; api.changed(); draw(); } });
      api.info("%p(퍼센트포인트) = 두 백분율의 차이. " + SRC2);
      draw();
      return {
        judge: function () {
          var d = REAL.roosevelt - LD.roosevelt;
          if (Math.abs(g - d) <= 0.5 + 1e-9) return { ok: true, msg: REAL.roosevelt + " − " + LD.roosevelt + " = " + d.toFixed(1) + " %p — 238만 장을 모으고도 승자를 거꾸로 맞혔습니다. 5만 명의 갤럽은 " + (REAL.roosevelt - GALLUP.roosevelt).toFixed(1) + " %p 차이로 승자를 맞혔어요." };
          return { ok: false, msg: g.toFixed(1) + " %p는 " + (g < d ? "작습니다" : "큽니다") + ". 실제 득표율에서 예측을 빼세요." };
        }
      };
    },
    hints: ["실제 60.8 %, 리터러리 다이제스트 43 %.", "60.8 − 43 = ?"],
    solution: "<b>17.8 %p</b>.",
    why: "리터러리 다이제스트는 잡지 구독자, 전화번호부, 자동차 등록부에서 주소를 뽑았는데, 대공황 시기에 전화와 자동차를 가진 사람은 부유층에 치우쳐 있었습니다. 게다가 답장을 보낸 사람은 정부에 불만이 많은 사람이 많았어요(응답 편향). 표본이 아무리 커도 <b>모집단을 고르게 대표하지 못하면</b> 결과가 틀립니다.<br>"
      + "빅데이터도 마찬가지입니다. 데이터의 양이 많다고 저절로 정확해지지 않고, 누구의 데이터가 빠졌는지 살펴야 합니다. 이 실패 뒤 인구 구성에 맞춰 표본을 고르는 과학적 여론 조사가 자리 잡았고, 1948년 그 방법마저 빗나간 뒤에는 무작위 표본 추출이 표준이 되었습니다."
  }
  ]
});
})();
