/* =========================================================================
   🌍 ○○년에 태어난 나 (선택 활동) — 지금 고1·고2의 생년으로, 기후 조건 속에서 한평생 살아 보기
   theme.js 다음에 불러온다. 이야기·문제 흐름과 따로 논다(하지 않아도 진행·채점에 영향 없음).

     sthClimateLife({ mount: "lifesim", id: "is2-2-1", grade: 1 });   // grade: 처음 골라 둘 학년(1·2)

   생년은 오늘 날짜의 학년도(3월 시작)로 셈한다: 고1 = 학년도 − 16, 고2 = 학년도 − 17 (2026학년도 → 2010·2009년생).
   태어나서 지난해까지는 모두 같은 실제 관측 기온(OBS)으로 살고, 올해부터 고른 시나리오대로 갈린다.

   해마다 그해의 지구 평균 기온(시나리오 + 자연 변동)에 따라 극한 현상이 ‘확률로’ 찾아온다.
   같은 해 같은 세상에 태어난 네 사람도 같은 규칙으로 산다 — 조건은 확률을 바꿀 뿐, 결과를 정하지 않는다.
   근거: IPCC AR6 WG1 정책결정자를 위한 요약(2021) 표 SPM.1(시나리오별 기온), 그림 SPM.6(극한 현상 빈도), 해수면 전망.
   단순화: 지역 차이·인구·적응은 넣지 않았다. 해수면 사건의 잦기는 ‘10 cm 오를 때마다 2배’로 가정했다(장소마다 다름).
   ========================================================================= */
(function () {
  "use strict";
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function lerp(xs, ys, x) {          /* 꺾은선 보간, 끝 바깥은 마지막 기울기로 연장 */
    var n = xs.length;
    if (x <= xs[0]) return ys[0];
    for (var i = 1; i < n; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    return ys[n - 1] + (ys[n - 1] - ys[n - 2]) * (x - xs[n - 1]) / (xs[n - 1] - xs[n - 2]);
  }
  function gauss(rnd) { var u = 1 - rnd(), v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }

  /* ---- 자료 ---- */
  var SC = [   /* 1850~1900년 대비 지구 평균 기온(℃) 최선 추정: 2021~40년(2030) · 2041~60년(2050) · 2081~2100년(2090) — 표 SPM.1 */
    { k: "1-1.9", name: "SSP1-1.9 · 아주 빠른 감축", t: [1.5, 1.6, 1.4], sl: [0.18, 0.38], c: "var(--teal)" },
    { k: "1-2.6", name: "SSP1-2.6 · 빠른 감축", t: [1.5, 1.7, 1.8], sl: [0.19, 0.44], c: "var(--green)" },
    { k: "2-4.5", name: "SSP2-4.5 · 지금 추세쯤", t: [1.5, 2.0, 2.7], sl: [0.20, 0.56], c: "var(--amber)" },
    { k: "3-7.0", name: "SSP3-7.0 · 배출 늘어남", t: [1.5, 2.1, 3.6], sl: [0.22, 0.68], c: "var(--coral)" },
    { k: "5-8.5", name: "SSP5-8.5 · 화석 연료 많이", t: [1.6, 2.4, 4.4], sl: [0.23, 0.77], c: "var(--rose)" }
  ];
  /* 극한 현상 잦기 배수(1850~1900년 기후 대비) — 그림 SPM.6, 지구 기온 0·1·1.5·2·4℃ */
  var WL = [0, 1, 1.5, 2, 4];
  var EV = {
    h50: { ico: "🔥", name: "50년 빈도 극한 고온", desc: "그해 가장 더운 날이, 예전 기후에서는 50년에 한 번 나오던 수준을 넘음", p0: 0.02, f: [1, 4.8, 8.6, 13.9, 39.2], col: "#b42318", hot: [0, 1.2, 2.0, 2.7, 5.3] },
    h10: { ico: "☀️", name: "10년 빈도 극한 고온", desc: "그해 가장 더운 날이, 예전에는 10년에 한 번 나오던 수준을 넘음", p0: 0.1, f: [1, 2.8, 4.1, 5.6, 9.4], col: "#f79009" },
    r10: { ico: "🌧", name: "10년 빈도 극한 호우", desc: "그해 가장 많이 온 하루 비가, 예전에는 10년에 한 번 나오던 양을 넘음", p0: 0.1, f: [1, 1.3, 1.5, 1.7, 2.7], col: "#2e90fa" },
    d10: { ico: "🌾", name: "10년 빈도 농업 가뭄", desc: "예전에는 10년에 한 번 오던 농사 가뭄(건조해지는 지역)", p0: 0.1, f: [1, 1.7, 2.0, 2.4, 4.1], col: "#a15c07", only: "dry" },
    s100: { ico: "🌊", name: "100년 빈도 해수면 범람", desc: "예전에는 100년에 한 번 오던 해일·만조 범람", p0: 0.01, col: "#155eef", only: "coast" }
  };
  var ORDER = ["h50", "h10", "r10", "d10", "s100"];
  var PLACE = [
    { k: "jinhae", ico: "🌸", name: "진해 바닷가", ex: "우리 학교가 있는 창원 진해구 해안", as: "coast" },
    { k: "city", ico: "🏙", name: "내륙 도시", ex: "서울·대구 같은 곳" },
    { k: "coast", ico: "🏖", name: "해안 저지대", ex: "부산 해안·다카·자카르타 같은 곳" },
    { k: "dry", ico: "🏜", name: "건조해지는 지역", ex: "지중해 연안·호주 남부·아프리카 남부 같은 곳" }
  ];
  var TODAY = new Date(), NOW = TODAY.getFullYear(), SY = TODAY.getMonth() >= 2 ? NOW : NOW - 1;
  var BORN = SY - 16, AGES = 80, NOWAGE = NOW - BORN, STOPS = [NOWAGE, 30, 50, 70];
  /* 실제로 지나온 해의 지구 평균 기온(1850~1900년 대비, ℃) — WMO 기후 현황 보고서·관측 자료의 연평균 근삿값 */
  var OBS = { 2005: 1.01, 2006: 0.99, 2007: 1.01, 2008: 0.88, 2009: 1.00, 2010: 1.07, 2011: 0.93, 2012: 0.97, 2013: 1.01, 2014: 1.06, 2015: 1.18, 2016: 1.29,
              2017: 1.18, 2018: 1.12, 2019: 1.24, 2020: 1.27, 2021: 1.11, 2022: 1.15, 2023: 1.45, 2024: 1.55, 2025: 1.44 };
  var OBS_END = 2025;
  var Q = {
    now: "지금 {a}살. 여기까지는 이미 살아온 시간입니다 — 다섯 사람 모두 실제로 관측된 같은 기온 속에서 살았습니다. 그런데 겪은 일은 왜 서로 다를까요? 이제부터는 세상이 고른 시나리오에 따라 갈립니다.",
    30: "서른 살. 예전 기후(1850~1900년)였다면 30년 동안 ‘50년 빈도 극한 고온’은 평균 0.6번쯤입니다(맨 아래 회색 줄). 나는 몇 번이었나요?",
    50: "쉰 살. 내가 겪은 일 가운데, 기후 변화가 없었어도 일어났을 일은 무엇일까요? ‘확률이 커졌다’는 말과 ‘그 일이 기후 변화 때문이다’는 말은 어떻게 다를까요?",
    70: "일흔 살. 이 세상(시나리오)을 고른 것은 {now}년 무렵을 살던 사람들, 곧 여러분 세대와 지금의 어른들입니다. {now}년의 나에게 한마디를 남긴다면?"
  };
  var PRE = { k: "pre", name: "예전 기후(1850~1900년)", pre: 1 };
  function temp(sc, y, rnd) {      /* 그해 지구 기온 = 시나리오 경향 + 자연 변동(엘니뇨 등, 표준편차 0.12℃) */
    if (sc.pre) return rnd ? 0.12 * gauss(rnd) : 0;
    if (y <= OBS_END && OBS[y] != null) return OBS[y];   /* 지나온 해: 모두 같은 실제 값 */
    var base = lerp([2020, 2030, 2050, 2090], [1.2, sc.t[0], sc.t[1], sc.t[2]], y);
    return base + (rnd ? 0.12 * gauss(rnd) : 0);
  }
  function sea(sc, y) { if (sc.pre) return 0; return lerp([2005, 2020, 2050, 2100], [0, 0.06, sc.sl[0], sc.sl[1]], y); }   /* 1995~2014년 대비 해수면(m), 중앙값 */
  function prob(k, T, SL) {
    var e = EV[k];
    if (k === "s100") return Math.min(0.95, e.p0 * Math.pow(2, SL / 0.10));
    return Math.min(0.95, e.p0 * lerp(WL, e.f, Math.max(0, T)));
  }
  /* 한 사람의 한평생: 해마다 가장 센 사건 하나를 칸에 칠하고, 모든 사건을 센다 */
  function kindOf(place) { var p = PLACE.filter(function (x) { return x.k === place; })[0]; return (p && p.as) || place; }   /* 진해 = 해안으로 셈 */
  function live(sc, place, seed) {
    var P0 = place; place = kindOf(place);
    var rnd = rng(seed), yrs = [], cnt = {};
    ORDER.forEach(function (k) { cnt[k] = 0; });
    for (var a = 0; a < AGES; a++) {
      var y = BORN + a, T = temp(sc, y, rnd), SL = sea(sc, y), ev = [];
      if (rnd() < prob("h50", T, SL)) ev.push("h50"); else if (rnd() < prob("h10", T, SL)) ev.push("h10");
      if (rnd() < prob("r10", T, SL)) ev.push("r10");
      if (place === "dry" && rnd() < prob("d10", T, SL)) ev.push("d10");
      if (place === "coast" && rnd() < prob("s100", T, SL)) ev.push("s100");
      ev.forEach(function (k) { cnt[k]++; });
      yrs.push({ y: y, a: a, T: T, SL: SL, ev: ev });
    }
    return { yrs: yrs, cnt: cnt, place: P0 };
  }
  function baseline(place, n) {   /* 예전 기후(배수 1)라면 n년 동안의 기대 횟수 */
    var o = {}; place = kindOf(place);
    ORDER.forEach(function (k) { var e = EV[k]; o[k] = (e.only && e.only !== place) ? null : e.p0 * n * (k === "h10" ? (1 - EV.h50.p0) : 1); });
    return o;
  }

  var CSS = false;
  function css() {
    if (CSS) return; CSS = true;
    var s = document.createElement("style");
    s.textContent = ".cl-box{border:2px solid var(--line);border-radius:18px;background:var(--panel);padding:16px 18px;margin:18px 0}"
      + ".cl-h{font-size:18px;margin:0 0 4px}.cl-sub{color:var(--mist);font-size:13.5px;line-height:1.7;margin:0 0 12px}"
      + ".cl-row{display:flex;flex-wrap:wrap;gap:7px;margin:6px 0 10px}.cl-lab{font-size:12px;font-weight:800;color:var(--mist);margin-top:8px}"
      + ".cl-chip{border:2px solid var(--line);border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;font-weight:800;background:var(--card);color:var(--ink);cursor:pointer}"
      + ".cl-chip.on{border-color:var(--brand);background:var(--brand-100);color:var(--brand-700)}.cl-chip small{display:block;font-weight:600;color:var(--mist);font-size:11px}"
      + ".cl-go{margin-top:6px}.cl-warn{font-size:12px;color:var(--mist);margin:8px 0 0}"
      + ".cl-stage{margin-top:14px}.cl-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}"
      + ".cl-now{display:flex;gap:14px;flex-wrap:wrap}.cl-now div{background:var(--card-2);border-radius:12px;padding:6px 12px;font-size:12px;color:var(--mist)}.cl-now b{display:block;font-size:20px;color:var(--ink)}"
      + ".cl-spd{display:flex;gap:5px;flex-wrap:wrap}.cl-spd .btn{padding:5px 10px;font-size:12px}"
      + ".cl-p{display:grid;grid-template-columns:120px 1fr 108px;gap:8px;align-items:center;margin:6px 0}.cl-p.me{margin:12px 0 10px}"
      + ".cl-nm{font-size:12.5px;font-weight:800;color:var(--ink);line-height:1.35}.cl-nm small{display:block;color:var(--mist);font-weight:600;font-size:11px}"
      + ".cl-strip{display:grid;grid-template-columns:repeat(80,1fr);gap:1px;height:16px}.cl-p.me .cl-strip{height:26px}"
      + ".cl-strip i{display:block;background:var(--card-2);border-radius:2px;position:relative}.cl-strip i.dec{box-shadow:inset 0 -2px 0 var(--line)}"
      + ".cl-pick{font-size:13.5px;font-weight:800;color:var(--ink)}.cl-sel{border:2px solid var(--line);border-radius:10px;padding:5px 8px;font:inherit;font-size:13.5px;background:var(--card);color:var(--ink);margin-left:2px}.cl-age{font-size:13.5px;font-weight:800;color:var(--brand-700)}.cl-g{display:inline-flex;gap:6px;flex-wrap:wrap}"
      + ".cl-strip i.now{outline:2px solid var(--ink);outline-offset:0;z-index:1}.cl-strip i.two:after{content:'';position:absolute;left:25%;right:25%;top:35%;bottom:35%;background:#fff;opacity:.85;border-radius:2px}"
      + ".cl-ct{font-size:12px;color:var(--mist);text-align:right;line-height:1.4}"
      + ".cl-ax{display:grid;grid-template-columns:120px 1fr 108px;gap:8px;font-size:11px;color:var(--mist)}.cl-ax div:nth-child(2){display:flex;justify-content:space-between}"
      + ".cl-leg{display:flex;flex-wrap:wrap;gap:10px;font-size:12px;color:var(--mist);margin:8px 0}.cl-leg span:before{content:'';display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:4px;vertical-align:-1px;background:var(--c)}"
      + ".cl-log{list-style:none;margin:8px 0 0;padding:0;font-size:13px;line-height:1.7;color:var(--ink);max-height:150px;overflow:auto;border-top:1px dashed var(--line);padding-top:6px}"
      + ".cl-log li{margin:2px 0}.cl-log .y{color:var(--mist);font-weight:800;margin-right:6px}"
      + ".cl-pause{border:2px solid var(--brand);border-radius:14px;background:var(--brand-100);padding:12px 14px;margin:12px 0}"
      + ".cl-pause p{margin:0 0 8px;font-weight:800;color:var(--ink);font-size:14px;line-height:1.6}.cl-pause textarea{width:100%;min-height:54px;border:2px solid var(--line);border-radius:10px;padding:8px;font:inherit;font-size:13.5px;background:var(--card);color:var(--ink);box-sizing:border-box}"
      + ".cl-end table{border-collapse:collapse;width:100%;font-size:13px;margin:8px 0}.cl-end th,.cl-end td{border:1px solid var(--line);padding:6px 8px;text-align:center;color:var(--ink)}.cl-end th{background:var(--card-2);color:var(--mist)}.cl-end td:first-child{text-align:left}"
      + ".cl-hist{display:flex;align-items:flex-end;gap:3px;height:120px;border-bottom:2px solid var(--line);margin:10px 0 2px;padding:0 4px}"
      + ".cl-hist div{flex:1;display:flex;flex-direction:column-reverse;gap:1px;min-width:0}.cl-hist i{display:block;height:9px;border-radius:2px}"
      + ".cl-hx{display:flex;gap:3px;padding:0 4px;font-size:10.5px;color:var(--mist)}.cl-hx span{flex:1;text-align:center;min-width:0}"
      + ".cl-src{font-size:11.5px;color:var(--mist);margin:12px 0 0;line-height:1.6}"
      + "@media (max-width:640px){.cl-p,.cl-ax{grid-template-columns:78px 1fr 70px}.cl-nm{font-size:11px}}";
    document.head.appendChild(s);
  }

  window.sthClimateLife = function (o) {
    var mount = document.getElementById(o.mount); if (!mount) return;
    css();
    var SK = "life_" + (o.id || "x"), st = (window.sthState && window.sthState(SK)) || {};
    function save() { if (window.sthState) window.sthState(SK, st); }
    var pick = { sc: st.sc || "2-4.5", pl: st.pl || "jinhae" };
    var box = el("div", "cl-box");
    /* 지금 연도·생년은 고를 수 있다(처음 값은 오늘 날짜 · 고른 학년). 해가 바뀌어도 고르기만 하면 나이가 맞는다 */
    function grades(now) { var sy = now === TODAY.getFullYear() && TODAY.getMonth() < 2 ? now - 1 : now; return [{ k: 1, born: sy - 16, name: "고1" }, { k: 2, born: sy - 17, name: "고2" }]; }
    NOW = st.now || NOW;
    BORN = st.born || (grades(NOW).filter(function (g) { return g.k === (o.grade || 1); })[0] || grades(NOW)[0]).born;
    function setBorn() { NOWAGE = NOW - BORN; STOPS = [NOWAGE, 30, 50, 70].filter(function (x, i, a) { return x > 0 && x < AGES && a.indexOf(x) === i; }); }
    setBorn();
    var title = el("h3", "cl-h"); box.appendChild(title);
    function retitle() { title.textContent = "🌍 " + BORN + "년에 태어난 나 — 한평생 살아 보기"; }
    retitle();
    var sub = el("p", "cl-sub"); sub.innerHTML = "내가 태어난 해부터 <b>80살까지</b> 살아 봅니다. 지나온 해는 <b>실제로 관측된 지구 기온</b>(" + OBS_END + "년까지 들어 있음) 그대로, 앞으로의 해는 고른 세상(배출 시나리오)대로 흘러갑니다. 해마다 그해의 지구 기온에 따라 극한 고온·호우·가뭄·해수면 범람이 <b>확률로</b> 찾아옵니다. 같은 해 같은 세상에 태어난 네 사람도 같은 규칙으로 함께 삽니다. <span style='color:var(--mist)'>(선택 활동 · 약 3~5분 · 기록·채점 없음)</span>";
    box.appendChild(sub);
    box.appendChild(el("div", "cl-lab", "① 지금과 나"));
    var grow = el("div", "cl-row"); grow.style.alignItems = "center";
    function sel(from, to, v) { var x = document.createElement("select"); x.className = "cl-sel"; for (var y = from; y <= to; y++) { var op = document.createElement("option"); op.value = y; op.textContent = y + "년"; if (y === v) op.selected = true; x.appendChild(op); } return x; }
    var sNow = sel(2024, 2040, NOW), sBorn = sel(NOW - 25, NOW - 10, BORN), ageTag = el("span", "cl-age"), gBtns = el("span", "cl-g");
    var l1 = el("label", "cl-pick", "지금은 "); l1.appendChild(sNow);
    var l2 = el("label", "cl-pick", "나는 "); l2.appendChild(sBorn); l2.appendChild(document.createTextNode(" 생"));
    grow.appendChild(l1); grow.appendChild(l2); grow.appendChild(ageTag); grow.appendChild(gBtns);
    function refreshBorn() {   /* 지금 연도를 바꾸면 생년 고르기 범위와 고1·고2 단추를 다시 만든다 */
      var keep = BORN; sBorn.innerHTML = "";
      for (var y = NOW - 25; y <= NOW - 10; y++) { var op = document.createElement("option"); op.value = y; op.textContent = y + "년"; if (y === keep) op.selected = true; sBorn.appendChild(op); }
      if (keep < NOW - 25 || keep > NOW - 10) { BORN = NOW - 16; sBorn.value = BORN; }
      gBtns.innerHTML = "";
      grades(NOW).forEach(function (g) {
        var b = el("button", "cl-chip" + (g.born === BORN ? " on" : ""), g.name + " (" + g.born + "년생)"); b.type = "button";
        b.addEventListener("click", function () { BORN = g.born; sBorn.value = BORN; changed(); });
        gBtns.appendChild(b);
      });
    }
    function changed() { setBorn(); retitle(); ageTag.textContent = "→ 올해 " + NOWAGE + "살"; Array.prototype.forEach.call(gBtns.children, function (c) { c.classList.toggle("on", c.textContent.indexOf(BORN + "") >= 0); }); st.now = NOW; st.born = BORN; save(); }
    sNow.addEventListener("change", function () { NOW = +sNow.value; refreshBorn(); changed(); });
    sBorn.addEventListener("change", function () { BORN = +sBorn.value; changed(); });
    refreshBorn(); changed();
    box.appendChild(grow);
    function chips(label, list, key, render) {
      box.appendChild(el("div", "cl-lab", label));
      var row = el("div", "cl-row");
      list.forEach(function (x) {
        var b = el("button", "cl-chip" + (pick[key] === x.k ? " on" : "")); b.type = "button"; b.innerHTML = render(x);
        b.addEventListener("click", function () { pick[key] = x.k; Array.prototype.forEach.call(row.children, function (c) { c.classList.toggle("on", c === b); }); });
        row.appendChild(b);
      });
      box.appendChild(row);
    }
    chips("② 살아갈 세상 — 사람들이 앞으로 온실 기체를 얼마나 내보낼까", SC, "sc", function (s) { return s.name + "<small>2090년 무렵 +" + f1(s.t[2]) + " ℃</small>"; });
    chips("③ 사는 곳", PLACE, "pl", function (p) { return p.ico + " " + p.name + "<small>" + p.ex + "</small>"; });
    var go = el("button", "btn primary cl-go", "👶 태어나기"); go.type = "button"; box.appendChild(go);
    box.appendChild(el("p", "cl-warn", "같은 조건으로 다시 태어나도 삶은 매번 달라집니다. 몇 번 살아 보고, 조건을 바꿔서도 살아 보세요."));
    var stage = el("div", "cl-stage"); box.appendChild(stage);
    var src = el("p", "cl-src"); src.innerHTML = "근거: IPCC 제6차 평가보고서 제1실무그룹 「정책결정자를 위한 요약」(2021) — 시나리오별 지구 기온(표 SPM.1), 극한 현상의 잦기 배수(그림 SPM.6: 예) 50년 빈도 폭염은 지구 기온 1.5 ℃에서 8.6배, 2 ℃에서 13.9배, 4 ℃에서 39.2배), 해수면 상승 중앙값. "
      + "지나온 해(" + OBS_END + "년까지)의 기온은 WMO 기후 현황 보고서·관측 자료의 연평균 근삿값입니다. <b>단순화한 모형</b>입니다: 앞으로의 해 기온에 자연 변동(표준편차 0.12 ℃)을 더했고, 지역 차이·인구·적응(제방·냉방 등)은 넣지 않았습니다. 해수면 범람의 잦기는 ‘해수면이 10 cm 오를 때마다 2배’로 가정했습니다(실제로는 장소마다 다름). 우리나라 연안의 해수면은 1989~2024년 연평균 약 3.2 mm(남해안 약 2.6~3.4 mm) 올랐습니다(국립해양조사원, 전국 21개 조위관측소). 2100년 뒤는 앞의 경향을 이어 그었습니다.";
    box.appendChild(src);
    mount.appendChild(box);

    var timer = null, speed = 300;
    go.addEventListener("click", function () { start(); });

    function start() {
      if (timer) clearTimeout(timer);
      var sc = SC.filter(function (s) { return s.k === pick.sc; })[0];
      st.sc = pick.sc; st.pl = pick.pl; st.n = (st.n || 0) + 1; save();
      var seed0 = (Date.now() ^ (Math.random() * 1e9)) >>> 0;
      var placesOther = [];
      for (var i = 0; i < 4; i++) placesOther.push(PLACE[1 + Math.floor(rng(seed0 + 7 * i + 3)() * 3)].k);
      var lives = [live(sc, pick.pl, seed0)].concat(placesOther.map(function (p, i) { return live(sc, p, seed0 + 101 * (i + 1)); }));
      lives.push(live(PRE, pick.pl, seed0 + 999)); lives[5].pre = 1;
      var names = ["나", "지우", "아마라", "루카스", "메이", "예전 기후라면"];
      stage.innerHTML = "";
      var top = el("div", "cl-top"), now = el("div", "cl-now");
      var nAge = el("div"), nYear = el("div"), nT = el("div"), nS = el("div");
      [nAge, nYear, nT].forEach(function (d) { now.appendChild(d); }); if (kindOf(pick.pl) === "coast") now.appendChild(nS);
      var spd = el("div", "cl-spd");
      [["느리게", 650], ["보통", 300], ["빠르게", 70]].forEach(function (x) { var b = el("button", "btn", x[0]); b.type = "button"; b.addEventListener("click", function () { speed = x[1]; }); spd.appendChild(b); });
      var skip = el("button", "btn", "⏭ 끝까지"); skip.type = "button"; spd.appendChild(skip);
      top.appendChild(now); top.appendChild(spd); stage.appendChild(top);
      var leg = el("div", "cl-leg");
      ORDER.forEach(function (k) { var e = EV[k]; if (e.only && lives.every(function (L) { return kindOf(L.place) !== e.only; })) return; var s = el("span", null, e.ico + " " + e.name); s.style.setProperty("--c", e.col); leg.appendChild(s); });
      stage.appendChild(leg);
      var rows = [];
      lives.forEach(function (L, i) {
        var pl = PLACE.filter(function (p) { return p.k === L.place; })[0];
        var r = el("div", "cl-p" + (i === 0 ? " me" : ""));
        if (L.pre) { r.style.opacity = "0.85"; stage.appendChild(el("div", "cl-lab", "비교: 나와 같은 곳에서, 산업화 전(1850~1900년) 기후 그대로 80년을 산다면")); }
        var nm = el("div", "cl-nm"); nm.innerHTML = (i === 0 ? "👤 " : L.pre ? "🕰 " : "") + names[i] + "<small>" + pl.ico + " " + pl.name + "</small>";
        var strip = el("div", "cl-strip"), cells = [];
        for (var a = 0; a < AGES; a++) { var c = el("i"); if (a % 10 === 9) c.className = "dec"; if (BORN + a === NOW) c.className += " now"; strip.appendChild(c); cells.push(c); }
        var ct = el("div", "cl-ct");
        r.appendChild(nm); r.appendChild(strip); r.appendChild(ct);
        if (i === 0) { stage.appendChild(r); stage.appendChild(el("div", "cl-lab", "같은 해, 같은 세상에 태어난 네 사람")); } else stage.appendChild(r);
        rows.push({ L: L, cells: cells, ct: ct });
      });
      var ax = el("div", "cl-ax"); ax.innerHTML = "<div></div><div><span>0살 (" + BORN + ")</span><span>20</span><span>40</span><span>60</span><span>80살 (" + (BORN + AGES) + ")</span></div><div></div>";
      var nowNote = el("p", "cl-warn"); nowNote.innerHTML = "▮ 굵은 테두리 칸 = 올해(" + NOW + "년, " + NOWAGE + "살). 그 앞은 이미 지나온 해, 그 뒤는 앞으로의 해입니다." + (NOW - 1 > OBS_END ? " (" + (OBS_END + 1) + "~" + (NOW - 1) + "년은 관측값을 아직 넣지 않아 시나리오 값으로 셈했습니다.)" : ""); stage.appendChild(ax); stage.appendChild(nowNote);
      var pauseBox = el("div"); stage.appendChild(pauseBox);
      var log = el("ul", "cl-log"); stage.appendChild(log);
      var endBox = el("div", "cl-end"); stage.appendChild(endBox);
      var a = 0, done = false;
      function paint(i, age) {
        var R = rows[i], Y = R.L.yrs[age], c = R.cells[age];
        if (Y.ev.length) { var k = ORDER.filter(function (x) { return Y.ev.indexOf(x) >= 0; })[0]; c.style.background = EV[k].col; c.title = (BORN + age) + "년 " + age + "살: " + Y.ev.map(function (x) { return EV[x].ico + EV[x].name; }).join(", "); if (Y.ev.length > 1) c.className += " two"; }
        else c.style.background = "var(--line)";
        var n = 0; for (var j = 0; j <= age; j++) n += R.L.yrs[j].ev.length;
        R.ct.textContent = "극한 현상 " + n + "번";
      }
      var seen = {};
      function note(Y) {   /* 처음 겪은 종류는 설명까지, 그 뒤로는 짧게 */
        Y.ev.forEach(function (k) {
          var e = EV[k], li = el("li"), extra = k === "h50" ? " — 그 더위는 예전의 같은 빈도 더위보다 약 " + f1(lerp(WL, e.hot, Math.max(0, Y.T))) + " ℃ 더 뜨거웠다" : "";
          li.innerHTML = "<span class='y'>" + Y.y + "년 · " + Y.a + "살</span>" + e.ico + " <b>" + e.name + "</b>" + (seen[k] ? "" : " (" + e.desc + ")") + extra;
          seen[k] = 1; log.insertBefore(li, log.firstChild);
        });
      }
      function step() {
        if (done) return;
        var Y = lives[0].yrs[a];
        for (var i = 0; i < rows.length; i++) paint(i, a);
        nAge.innerHTML = "나이<b>" + a + "살</b>"; nYear.innerHTML = "해<b>" + Y.y + "</b>"; nT.innerHTML = "지구 기온(1850~1900년 대비)" + (Y.y <= OBS_END ? " · 관측" : "") + "<b>+" + f1(Y.T) + " ℃</b>"; nS.innerHTML = "해수면(1995~2014년 대비)<b>+" + Math.round(Y.SL * 100) + " cm</b>";
        note(Y);
        a++;
        if (a >= AGES) return finish();
        if (STOPS.indexOf(a) >= 0) return pause(a);
        timer = setTimeout(step, speed);
      }
      function pause(age) {
        pauseBox.innerHTML = "";
        var p = el("div", "cl-pause"), q = el("p", null, "⏸ " + (age === NOWAGE ? Q.now : Q[age]).replace(/\{a\}/g, age).replace(/\{now\}/g, NOW)), ta = document.createElement("textarea");
        ta.placeholder = "한두 줄로 (이 기기에만 저장)"; ta.value = (st.notes && st.notes[age]) || "";
        ta.addEventListener("change", function () { st.notes = st.notes || {}; st.notes[age] = ta.value.trim(); save(); });
        var b = el("button", "btn primary", "계속 살기 ▶"); b.type = "button";
        b.addEventListener("click", function () { pauseBox.innerHTML = ""; timer = setTimeout(step, speed); });
        p.appendChild(q); p.appendChild(ta); p.appendChild(b); pauseBox.appendChild(p);
      }
      skip.addEventListener("click", function () { if (done) return; clearTimeout(timer); pauseBox.innerHTML = ""; while (a < AGES) { var Y = lives[0].yrs[a]; for (var i = 0; i < rows.length; i++) paint(i, a); note(Y); a++; } finish(); });
      function finish() {
        done = true; clearTimeout(timer);
        var Y = lives[0].yrs[AGES - 1];
        nAge.innerHTML = "나이<b>80살</b>"; nYear.innerHTML = "해<b>" + Y.y + "</b>"; nT.innerHTML = "지구 기온(1850~1900년 대비)" + (Y.y <= OBS_END ? " · 관측" : "") + "<b>+" + f1(Y.T) + " ℃</b>"; nS.innerHTML = "해수면(1995~2014년 대비)<b>+" + Math.round(Y.SL * 100) + " cm</b>";
        var me = lives[0], bl = baseline(me.place, AGES), exp = {};
        ORDER.forEach(function (k) { if (bl[k] == null) return; var s = 0; for (var j = 0; j < AGES; j++) { var y = me.yrs[j]; var p = prob(k, temp(sc, y.y), sea(sc, y.y)); if (k === "h10") p = p * (1 - prob("h50", temp(sc, y.y), 0)); s += p; } exp[k] = s; });
        var h = "<h4 style='margin:14px 0 4px'>🕯 80년의 삶을 마쳤습니다</h4><table><tr><th>일</th><th>내가 겪은 횟수</th><th>이 세상의 평균(기대)</th><th>예전 기후였다면(평균)</th></tr>";
        ORDER.forEach(function (k) { if (bl[k] == null) return; h += "<tr><td>" + EV[k].ico + " " + EV[k].name + "</td><td><b>" + me.cnt[k] + "</b></td><td>" + f1(exp[k]) + "</td><td>" + f1(bl[k]) + "</td></tr>"; });
        h += "</table><p style='font-size:13px;color:var(--mist);margin:4px 0 10px'>‘평균’은 같은 조건으로 아주 많이 살아 봤을 때의 값입니다. 한 사람의 횟수는 평균보다 많을 수도, 적을 수도 있습니다.</p>";
        endBox.innerHTML = h;
        st.last = { sc: sc.k, pl: me.place, cnt: me.cnt }; save();
        var cls = el("button", "btn primary", "👥 반 30명이 이 세상에 함께 태어났다면?"); cls.type = "button"; endBox.appendChild(cls);
        var again = el("button", "btn", "🔁 같은 조건으로 다시 태어나기"); again.type = "button"; again.style.marginLeft = "6px"; again.addEventListener("click", start); endBox.appendChild(again);
        var cw = el("div"); endBox.appendChild(cw);
        cls.addEventListener("click", function () { cw.innerHTML = ""; classView(cw, sc, me.place, me.cnt.h50); });
      }
      timer = setTimeout(step, 400);
    }
    /* 반 30명(시험용 가상) — 실제 수업에서는 ‘우리 반’으로 모아 진짜 30명의 삶을 쌓는다 */
    function classView(wrap, sc, place, mine) {
      var low = SC[1], sets = [{ s: sc, c: "var(--rose)" }];
      if (sc.k !== low.k) sets.push({ s: low, c: "var(--teal)" });
      var seed = (Date.now() >>> 0), data = sets.map(function (S, j) { var a = []; for (var i = 0; i < 30; i++) { var L = live(S.s, place, seed + 977 * i + 13 * j); a.push(L.cnt.h50); } return a; });
      var mx = Math.max.apply(null, data.reduce(function (x, y) { return x.concat(y); }, [mine])) + 1, B = Math.min(mx, 40), bw = Math.max(1, Math.ceil(mx / B));
      var bins = []; for (var b = 0; b * bw < mx; b++) bins.push(b);
      wrap.appendChild(el("div", "cl-lab", "같은 곳(" + PLACE.filter(function (p) { return p.k === place; })[0].name + ")에 태어난 30명씩 — 80년 동안 겪은 ‘50년 빈도 극한 고온’ 횟수 (예전 기후라면 평균 1.6번)"));
      var hist = el("div", "cl-hist"), hx = el("div", "cl-hx");
      bins.forEach(function (b) {
        var col = el("div");
        data.forEach(function (d, j) { d.forEach(function (v) { if (Math.floor(v / bw) === b) { var i = el("i"); i.style.background = sets[j].c; i.style.opacity = j ? 0.75 : 1; col.appendChild(i); } }); });
        if (Math.floor(mine / bw) === b) { var m = el("i"); m.style.background = "var(--ink)"; m.title = "나"; col.appendChild(m); }
        hist.appendChild(col); hx.appendChild(el("span", null, b % 2 ? "" : String(b * bw)));
      });
      var mx = 1; Array.prototype.forEach.call(hist.children, function (c) { mx = Math.max(mx, c.children.length); });
      var ih = Math.max(1, Math.min(9, Math.floor((110 - mx) / mx)));   /* 가장 높은 칸이 상자 안에 들어오게 */
      Array.prototype.forEach.call(hist.querySelectorAll("i"), function (i) { i.style.height = ih + "px"; });
      wrap.appendChild(hist); wrap.appendChild(hx);
      var lg = el("div", "cl-leg");
      sets.forEach(function (S, j) { var mean = data[j].reduce(function (x, y) { return x + y; }, 0) / 30; var s = el("span", null, S.s.name + " — 30명 평균 " + f1(mean) + "번"); s.style.setProperty("--c", S.c); lg.appendChild(s); });
      var ms = el("span", null, "검은 칸 = 나 (" + mine + "번)"); ms.style.setProperty("--c", "var(--ink)"); lg.appendChild(ms);
      wrap.appendChild(lg);
      var p = el("p", null); p.style.cssText = "font-size:13.5px;font-weight:800;color:var(--ink);margin:6px 0 0;line-height:1.6";
      p.textContent = "🤔 두 무더기는 겹치는 부분이 있나요? ‘빠른 감축 세상에 태어나도 극한 고온을 많이 겪는 사람이 있다’는 사실은, 감축이 소용없다는 뜻일까요? 무더기 전체가 어디로 옮겨 갔는지로 답해 보세요.";
      wrap.appendChild(p);
      wrap.appendChild(el("p", "cl-warn", "컴퓨터가 같은 조건으로 30명을 대신 살려 본 결과입니다. 누를 때마다 30명이 새로 태어납니다."));
    }
  };
})();
