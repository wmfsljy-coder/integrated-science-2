/* 통합과학2 Ⅲ-1 과학 기술의 활용 — 실제 자료
   r1 독감이 사라진 겨울 — 미국 CDC 독감 감시 자료로 본 2020~21년 겨울
   r2 240만 장의 엽서는 왜 틀렸나 — 1936년 미국 대통령 선거 여론 조사와 실제 결과
   자료: data/flu-us.js (CDC ILINet), 1936년 선거 수치는 이 파일 안에 적음 */
(function () {
"use strict";
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
      var H = api.h, cv = api.canvas(280), ctx = cv.ctx, W = cv.W, s = SEASONS[0];
      function idx(w) { for (var i = 0; i < F.length; i++) if (F[i][0] === w) return i; return 0; }
      function draw() {
        H.paper(ctx, W, cv.H);
        var x0 = 60, x1 = 640, y0 = 24, y1 = cv.H - 36;
        function X(i) { return x0 + i / (F.length - 1) * (x1 - x0); }
        function Y(v) { return y1 - v / 9 * (y1 - y0); }
        H.axes(ctx, x0, y0, x1, y1);
        [0, 2, 4, 6, 8].forEach(function (v) { H.text(ctx, v + "%", x0 - 6, Y(v) + 4, { s: 10, a: "right", c: H.v("--mist") }); });
        var a = idx(s * 100 + 40), b = idx((s + 1) * 100 + 20);
        ctx.fillStyle = "rgba(255,190,60,.18)"; ctx.fillRect(X(a), y0, X(b) - X(a), y1 - y0);
        H.line(ctx, F.map(function (r, i) { return [X(i), Y(r[1])]; }), H.v("--coral-700"), 2);
        SEASONS.forEach(function (q) { var i = idx(q * 100 + 52) || idx(q * 100 + 51); H.text(ctx, String(q).slice(2) + "-" + String(q + 1).slice(2), X(i), y1 + 15, { s: 9.5, a: "center", c: q === s ? H.v("--amber-700") : H.v("--mist") }); });
        H.text(ctx, "독감 의심 환자 비율 (%)", x0 + 6, y0 - 8, { s: 11, w: "700", c: H.v("--mist") });
        H.rows(ctx, 680, 50, [["고른 겨울", s + " ~ " + (s + 1), "--amber-700"], ["가장 높은 주", String(PK[s][0]).slice(0, 4) + "년 " + (PK[s][0] % 100) + "주"], ["봉우리", PK[s][1].toFixed(1) + " %", null, true]], 58);
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
      var H = api.h, cv = api.canvas(260), ctx = cv.ctx, W = cv.W, g = 0;
      function draw() {
        H.paper(ctx, W, cv.H);
        var x0 = 230, x1 = 620, rows = [["리터러리 다이제스트 (238만 장)", LD.roosevelt, "--coral-700"], ["갤럽 (약 5만 명)", GALLUP.roosevelt, "--amber-700"], ["실제 결과", REAL.roosevelt, "--green-700"]];
        H.text(ctx, "루스벨트 득표율", x0, 24, { s: 11, w: "700", c: H.v("--mist") });
        rows.forEach(function (r, i) { var y = 40 + i * 52; H.text(ctx, r[0], x0 - 10, y + 20, { s: 12, w: "800", a: "right" }); H.box(ctx, x0, y, r[1] / 100 * (x1 - x0), 30, H.v(r[2]), 0.85); H.text(ctx, r[1] + " %", x0 + r[1] / 100 * (x1 - x0) + 8, y + 20, { s: 12, w: "900", c: H.v(r[2]) }); });
        H.dash(ctx, x0 + 0.5 * (x1 - x0), 34, x0 + 0.5 * (x1 - x0), 200, H.v("--line"), 1);
        H.rows(ctx, 690, 60, [["내 답 (어긋남)", g.toFixed(1) + " %p", null, true]], 60);
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
