/* 통합과학2 Ⅰ-2 화학 변화 — 소단원별 이야기 세 편
   01 붉은 돌에서 철을 꺼내라 / 02 물고기가 사라진 호수 / 03 불 없이 따뜻하게, 얼음 없이 차갑게
   공용 부품: ../assets/theme.js (sthUnit·sthGate·sthWork), ../assets/story.js (sthStory·sthSort·sthOrder·sthPick) */
(function () {
"use strict";

window.sthUnit("is2-1-2");

var FONT = "'Gothic A1','Segoe UI',sans-serif";
function $(id) { return document.getElementById(id); }
function v(name) { return window.cssVar(name); }
function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function done(id) { var e = $(id); if (e) e.classList.add("done"); }
/* 미션 상자는 완료되면 내용이 통째로 바뀐다. 그 안에 있던 자리를 뒤늦게 건드리면 오류가 나므로 확인하고 쓴다. */
function put(id, html) { var e = $(id); if (e) e.innerHTML = html; }
function paper(ctx, W, H) { ctx.clearRect(0, 0, W, H); ctx.fillStyle = v("--panel"); ctx.fillRect(0, 0, W, H); }
function text(ctx, s, x, y, o) {
  o = o || {};
  ctx.font = (o.w || "500") + " " + (o.s || 12) + "px " + FONT;
  ctx.fillStyle = o.c || v("--ink"); ctx.textAlign = o.a || "left";
  ctx.fillText(s, x, y);
}
/* ---- 무대 그림 도구 (../assets/kit.js) ---- */
var K = window.sthKit, KC = K.C, REDUCE = K.REDUCE;
function col(c) { return !c ? KC.ink : (c.indexOf("--") === 0 ? v(c) : c); }
function rgbOf(c) {
  c = col(c);
  if (c.charAt(0) === "#") {
    if (c.length === 4) c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    return [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
  }
  var m = /(\d+)\D+(\d+)\D+(\d+)/.exec(c); return m ? [+m[1], +m[2], +m[3]] : [200, 210, 255];
}
function rgba(c, a) { var r = rgbOf(c); return "rgba(" + r[0] + "," + r[1] + "," + r[2] + "," + a + ")"; }
function shade(c, k) { var r = rgbOf(c); return "rgb(" + Math.min(255, Math.round(r[0] * k)) + "," + Math.min(255, Math.round(r[1] * k)) + "," + Math.min(255, Math.round(r[2] * k)) + ")"; }
/* 반투명 이름표 */
function tag(ctx, s, x, y, o) { o = o || {}; return K.pill(ctx, s, x, y, { a: o.a, s: o.s, w: o.w, c: col(o.c), box: o.box, bg: o.bg, line: o.line }); }
/* 입체 공(원자·입자) — 글자는 공 한가운데 */
function dot(ctx, x, y, r, fill, label, ink, size) {
  K.planet(ctx, x, y, r, fill, shade(fill, .4));
  if (label) text(ctx, label, x, y + (size || 10) * 0.36, { s: size || 10, w: "800", a: "center", c: ink || "#06202c" });
}
/* 이온·분자: 글자 길이에 맞춘 윤나는 알약 */
function pill(ctx, x, y, label, fill, ink) {
  ctx.font = "800 10.5px " + FONT;
  var w = Math.max(30, ctx.measureText(label).width + 14), g = ctx.createLinearGradient(0, y - 12, 0, y + 12);
  g.addColorStop(0, shade(fill, 1.18)); g.addColorStop(.55, col(fill)); g.addColorStop(1, shade(fill, .55));
  ctx.save(); ctx.shadowColor = rgba(fill, .55); ctx.shadowBlur = 7;
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x - w / 2, y - 12, w, 24, 12); ctx.fill(); ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.28)"; ctx.beginPath(); ctx.roundRect(x - w / 2 + 4, y - 10, w - 8, 7, 4); ctx.fill();
  text(ctx, label, x, y + 4, { s: 10.5, w: "800", a: "center", c: ink || "#06202c" });
}
/* 유리 비커: 액체 윗면 y = top, 색 c(없으면 맑은 물) */
function beaker(ctx, x, y, w, h, top, c, a) {
  var lg = ctx.createLinearGradient(x, 0, x + w, 0), cc = c || "#8fc8ff", aa = a == null ? .22 : a;
  lg.addColorStop(0, rgba(cc, aa * 1.5)); lg.addColorStop(.5, rgba(cc, aa * .8)); lg.addColorStop(1, rgba(cc, aa * 1.6));
  ctx.fillStyle = lg; ctx.beginPath(); ctx.roundRect(x, top, w, y + h - top, [0, 0, 16, 16]); ctx.fill();
  ctx.fillStyle = rgba(cc, Math.min(.9, aa * 2.4)); ctx.fillRect(x + 2, top - 2, w - 4, 4);
  ctx.save(); ctx.strokeStyle = "rgba(220,235,255,.6)"; ctx.lineWidth = 3; ctx.shadowColor = "rgba(160,200,255,.45)"; ctx.shadowBlur = 8;
  ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x, y + 4); ctx.lineTo(x, y + h - 16); ctx.quadraticCurveTo(x, y + h, x + 16, y + h);
  ctx.lineTo(x + w - 16, y + h); ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - 16); ctx.lineTo(x + w, y + 4); ctx.lineTo(x + w + 6, y); ctx.stroke(); ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.fillRect(x + 8, y + 14, 6, h - 40);
  ctx.strokeStyle = "rgba(220,235,255,.35)"; ctx.lineWidth = 1;
  for (var k = 1; k <= 4; k++) { var gy = y + h - k * (h - 20) / 5; ctx.beginPath(); ctx.moveTo(x + w - 22, gy); ctx.lineTo(x + w - 6, gy); ctx.stroke(); }
}
/* 빛나는 가로 막대 */
function meter(ctx, x, y, w, h, f, c) {
  ctx.fillStyle = "rgba(255,255,255,.07)"; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = "rgba(200,210,255,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.stroke();
  f = clamp(f, 0, 1); if (f <= 0) return;
  var g = ctx.createLinearGradient(x, 0, x + w * f, 0);
  g.addColorStop(0, shade(c, .55)); g.addColorStop(1, col(c));
  ctx.save(); ctx.shadowColor = col(c); ctx.shadowBlur = 10; ctx.fillStyle = g;
  ctx.beginPath(); ctx.roundRect(x, y, Math.max(h, w * f), h, h / 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.22)"; ctx.beginPath(); ctx.roundRect(x + 2, y + 2, Math.max(h - 4, w * f - 4), h * .35, h / 4); ctx.fill();
}
function playBtn(id, onLabel, offLabel, get, set) {
  var b = $(id); if (!b) return;
  function lab() { b.textContent = get() ? onLabel : offLabel; }
  b.addEventListener("click", function () { set(!get()); lab(); }); lab();
}
/* 원자 색: 산소 빨강, 탄소 짙은 회색, 철 주황갈색 */
var AT = { O: "#ff6b6b", C: "#5b6275", Fe: "#d07a3e" };
/* .seg 단추 묶음 */
/* 받침에 따라 조사 고르기 : josa("구리", "이", "가") → "구리가" */
function josa(w, a, b) { var c = w.charCodeAt(w.length - 1); return w + ((c - 0xAC00) % 28 ? a : b); }
function seg(id, cb) {
  var bs = Array.prototype.slice.call($(id).querySelectorAll("button"));
  bs.forEach(function (b) {
    b.addEventListener("click", function () {
      bs.forEach(function (x) { x.classList.toggle("on", x === b); });
      cb(b.getAttribute("data-k"));
    });
  });
}

/* ---- 스튜디오 미니어처 도구 — 밝은 스튜디오 바닥 위에 놓인 입체 모형(유리 비커·시험관·팩)과 흰 판정 카드 ---- */
var LT = K.LT;
function ell(ctx, x, y, rx, ry) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, 6.2832); }
/* 바닥에 드리운 부드러운 그림자 */
function floorShadow(ctx, x, y, rx, ry, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
  var g = ctx.createRadialGradient(0, 0, 2, 0, 0, rx); g.addColorStop(0, "rgba(20,30,50," + (a || .28) + ")"); g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g; ell(ctx, 0, 0, rx, rx); ctx.fill(); ctx.restore();
}
/* 입체 유리 비커: cx 가운데, yb 바닥 중심, rx 반지름, h 높이, lv 액체 높이, c 액체 색, a 진하기, inside(yl) 액체 속(유리 앞면 뒤)에 그릴 것, ry 타원 높이 */
function beaker3(ctx, cx, yb, rx, h, lv, c, a, inside, ry) {
  ry = ry || rx * .24; var yt = yb - h, yl = yb - lv, aa = a == null ? .3 : a, cc = c || "#9fd0ff", k;
  floorShadow(ctx, cx + rx * .12, yb + ry * .35, rx * 1.3, ry * 1.5, .32);
  /* 뒤쪽 유리벽 */
  var bg = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0); bg.addColorStop(0, "rgba(255,255,255,.55)"); bg.addColorStop(.5, "rgba(225,236,248,.25)"); bg.addColorStop(1, "rgba(200,214,232,.5)");
  ctx.fillStyle = bg; ctx.beginPath(); ctx.moveTo(cx - rx, yt); ctx.lineTo(cx - rx, yb); ctx.ellipse(cx, yb, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, yt); ctx.ellipse(cx, yt, rx, ry, 0, 0, Math.PI, true); ctx.fill();
  if (lv > 0) {
    var lg = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    lg.addColorStop(0, rgba(cc, Math.min(.95, aa * 1.7))); lg.addColorStop(.35, rgba(cc, aa)); lg.addColorStop(.7, rgba(cc, aa * 1.1)); lg.addColorStop(1, rgba(cc, Math.min(.95, aa * 1.9)));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(cx - rx + 2, yl); ctx.lineTo(cx - rx + 2, yb); ctx.ellipse(cx, yb, rx - 2, ry - 1, 0, Math.PI, 0, true); ctx.lineTo(cx + rx - 2, yl); ctx.ellipse(cx, yl, rx - 2, ry, 0, 0, Math.PI, false); ctx.fill();
    ctx.fillStyle = rgba(cc, Math.min(.9, aa * .9)); ell(ctx, cx, yl, rx - 2, ry); ctx.fill();
  }
  if (inside) inside(yl, ry);
  if (lv > 0) { ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(cx, yl, rx - 2, ry, 0, 0, Math.PI, false); ctx.stroke(); }
  /* 앞쪽 유리: 테두리·윤기·눈금 */
  ctx.save(); ctx.strokeStyle = "rgba(120,140,170,.75)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx - rx, yt); ctx.lineTo(cx - rx, yb); ctx.ellipse(cx, yb, rx, ry, 0, Math.PI, 0, true); ctx.lineTo(cx + rx, yt); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2.4; ell(ctx, cx, yt, rx, ry); ctx.stroke();
  ctx.strokeStyle = "rgba(120,140,170,.55)"; ctx.lineWidth = 1; ell(ctx, cx, yt, rx + 1.5, ry + 1); ctx.stroke(); ctx.restore();
  var hl = ctx.createLinearGradient(cx - rx * .82, 0, cx - rx * .62, 0); hl.addColorStop(0, "rgba(255,255,255,0)"); hl.addColorStop(.5, "rgba(255,255,255,.55)"); hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl; ctx.fillRect(cx - rx * .82, yt + ry + 6, rx * .2, h - ry - 10);
  ctx.strokeStyle = "rgba(90,110,140,.55)"; ctx.lineWidth = 1.2;
  for (k = 1; k <= 4; k++) { var gy = yb - k * (h - ry) / 5; ctx.beginPath(); ctx.moveTo(cx + rx * .55, gy + ry * .55); ctx.lineTo(cx + rx * .75, gy + ry * .45); ctx.stroke(); }
  return { yl: yl, yt: yt, ry: ry };
}
/* 입체 시험관(둥근 바닥): cx 가운데, yt 입구, r 반지름, h 길이, lv 액체 높이, c 색, a 진하기, inside(yl) */
function tube3(ctx, cx, yt, r, h, lv, c, a, inside) {
  var yb = yt + h, yl = yb - lv, ry = r * .32, cc = c || "#cfe3ff", aa = a == null ? .3 : a;
  floorShadow(ctx, cx + 6, yb + 8, r * 2.2, r * .7, .25);
  ctx.fillStyle = "rgba(235,242,250,.45)"; ctx.beginPath(); ctx.moveTo(cx - r, yt); ctx.lineTo(cx - r, yb - r); ctx.arc(cx, yb - r, r, Math.PI, 0, true); ctx.lineTo(cx + r, yt); ctx.closePath(); ctx.fill();
  if (lv > 0) {
    var lg = ctx.createLinearGradient(cx - r, 0, cx + r, 0); lg.addColorStop(0, rgba(cc, Math.min(.95, aa * 1.6))); lg.addColorStop(.45, rgba(cc, aa)); lg.addColorStop(1, rgba(cc, Math.min(.95, aa * 1.8)));
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(cx - r + 2, yl); ctx.lineTo(cx - r + 2, yb - r); ctx.arc(cx, yb - r, r - 2, Math.PI, 0, true); ctx.lineTo(cx + r - 2, yl); ctx.closePath(); ctx.fill();
    ctx.fillStyle = rgba(cc, Math.min(.9, aa * 1.2)); ell(ctx, cx, yl, r - 2, ry); ctx.fill();
  }
  if (inside) inside(yl);
  ctx.strokeStyle = "rgba(110,130,160,.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - r, yt); ctx.lineTo(cx - r, yb - r); ctx.arc(cx, yb - r, r, Math.PI, 0, true); ctx.lineTo(cx + r, yt); ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 2; ell(ctx, cx, yt, r, ry); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.fillRect(cx - r * .6, yt + 8, r * .25, h - r - 14);
  return { yl: yl, yb: yb };
}
/* 입체 온도계: x 가운데, y0 위, y1 구 중심, f 0~1 눈금, c 색 */
function thermo3(ctx, x, y0, y1, f, c) {
  floorShadow(ctx, x + 6, y1 + 16, 22, 6, .25);
  var tg = ctx.createLinearGradient(x - 9, 0, x + 9, 0); tg.addColorStop(0, "rgba(255,255,255,.95)"); tg.addColorStop(.5, "rgba(225,233,243,.8)"); tg.addColorStop(1, "rgba(170,185,205,.9)");
  ctx.fillStyle = tg; ctx.beginPath(); ctx.roundRect(x - 9, y0 - 6, 18, y1 - y0 + 6, 9); ctx.fill();
  ctx.strokeStyle = "rgba(110,130,160,.7)"; ctx.lineWidth = 1.4; ctx.stroke();
  var top = y1 - clamp(f, 0, 1) * (y1 - y0 - 6), lq = ctx.createLinearGradient(x - 4, 0, x + 4, 0); lq.addColorStop(0, shade(c, .7)); lq.addColorStop(.5, c); lq.addColorStop(1, shade(c, .6));
  ctx.fillStyle = lq; ctx.fillRect(x - 3.5, top, 7, y1 - top);
  K.planet(ctx, x, y1 + 6, 14, c, shade(c, .45));
  ctx.strokeStyle = "rgba(90,110,140,.6)"; ctx.lineWidth = 1;
  for (var i = 0; i <= 8; i++) { var gy = y1 - 6 - i * (y1 - y0 - 12) / 8; ctx.beginPath(); ctx.moveTo(x + 10, gy); ctx.lineTo(x + (i % 2 ? 15 : 19), gy); ctx.stroke(); }
}
/* 두 색 섞기 */
function mixC(a, b, t) { var p = rgbOf(a), q = rgbOf(b); t = clamp(t, 0, 1); return "rgb(" + Math.round(lerp(p[0], q[0], t)) + "," + Math.round(lerp(p[1], q[1], t)) + "," + Math.round(lerp(p[2], q[2], t)) + ")"; }
/* 흰 판정 카드 안의 큰 판정 글자 */
function cardBig(ctx, s, x, y, c, size) { K.t(ctx, s, x, y, { s: size || 22, w: "900", c: c || LT.ink }); }

/* =========================================================================
   이야기 ① 붉은 돌에서 철을 꺼내라
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep1", key: "ep1", name: "사건 파일 ①", onDone: finish });

  window.sthGate({
    gate: "a-gate", key: "p1", title: "조사관의 첫 추리",
    question: "철광석에서 철을 꺼낼 때, 숯(코크스)이 하는 가장 중요한 일은 무엇일까요?",
    options: ["㉠ 가마의 온도를 높이는 연료일 뿐이다", "㉡ 철광석에 붙어 있는 산소를 떼어 간다", "㉢ 철광석을 녹여서, 섞여 있던 철 알갱이가 흘러나오게 한다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 용광로 : Fe₂O₃ + 3CO → 2Fe + 3CO₂ , 2C + O₂ → 2CO
     Fe₂O₃ 160 kg(1 kmol)에 C 36 kg(3 kmol) → Fe 112 kg, CO₂ 132 kg */
  (function () {
    var canvas = $("a-furn"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var ore = 160, coke = 10;
    var got = window.sthState("furn") || { a: false, b: false, q: false };

    function calc() {
      var need = ore * 9 / 40, ext = Math.min(1, coke / need);
      return { need: need, ext: ext, fe: ore * 0.7 * ext, oreLeft: ore * (1 - ext), cokeLeft: Math.max(0, coke - need),
               co2: Math.min(coke, need) * 44 / 12, oLost: ore * 0.3 * ext };
    }
    /* ── 잘라 보는 용광로(아이소메트릭 블록) : 앞면 = 노 한가운데를 자른 단면 ── */
    var TOP = 440, Z = 420, CU = 140, ph = 0, flowing = !REDUCE;
    var I = K.iso({ ox: 600, oy: 300, s: 0.62, L: 280, D: 150 }), L = I.L, D = I.D;
    var DARK = "#22304a";
    function hw(z) {                                   /* 노 안쪽 반폭: 노상 → 보시 → 노복 → 샤프트 → 노구 */
      if (z < 18) return 0;
      if (z < 90) return 74;
      if (z < 150) return lerp(74, 110, (z - 90) / 60);
      if (z < 190) return 110;
      if (z < 385) return lerp(110, 66, (z - 190) / 195);
      return 66;
    }
    function cavity(c) {
      var z; c.beginPath(); c.moveTo(CU - 74, 18);
      for (z = 18; z < Z; z += 6) c.lineTo(CU - hw(z), z);
      c.lineTo(CU - hw(Z), Z); c.lineTo(CU + hw(Z), Z);
      for (z = Z; z >= 18; z -= 6) c.lineTo(CU + hw(z), z);
      c.lineTo(CU + 74, 18); c.closePath();
    }
    function mixc(c1, c2, t) {
      var a = rgbOf(c1), b = rgbOf(c2);
      return "rgb(" + Math.round(lerp(a[0], b[0], t)) + "," + Math.round(lerp(a[1], b[1], t)) + "," + Math.round(lerp(a[2], b[2], t)) + ")";
    }
    function bricks(c, w, h, base) {
      var g = c.createLinearGradient(0, 0, w, 0), y, x, row;
      g.addColorStop(0, K.tint(base, .82)); g.addColorStop(.5, K.tint(base, 1.06)); g.addColorStop(1, K.tint(base, .78));
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.strokeStyle = "rgba(40,20,12,.32)"; c.lineWidth = 1;
      for (y = 14, row = 0; y < h; y += 14, row++) {
        c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
        for (x = (row % 2) * 14; x < w; x += 28) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 14); c.stroke(); }
      }
    }
    /* 남은 철광석·코크스를 샤프트에 번갈아 쌓인 층으로 놓는다(반응하고 남은 것만) */
    function lumps(nOre, nCoke) {
      /* 층마다 가운데부터 바깥으로, 두 줄까지. 알갱이는 세 층에 번갈아 나눠 담는다 */
      function slots(b) {
        var out = [], row, j;
        for (row = 0; row < 2; row++) {
          var z = 206 + b * 30 + row * 13, w = hw(z) - 12, n = Math.floor(w / 19);
          for (j = 0; j <= 2 * n; j++) { var k = j % 2 ? -Math.ceil(j / 2) : j / 2; out.push([CU + k * 19 + (row ? 9 : 0), z]); }
        }
        return out.filter(function (s) { return Math.abs(s[0] - CU) <= hw(s[1]) - 10; });
      }
      function fill(n, odd, r, c) {
        var i, S = [slots(odd), slots(odd + 2), slots(odd + 4)];
        for (i = 0; i < n; i++) {
          var s = S[i % 3][Math.floor(i / 3)]; if (!s) continue;
          var j = ((i * 7) % 5) - 2, p = I.P(s[0] + j, D, s[1] + (i % 2));
          dot(ctx, p.x, p.y, r, c);
        }
      }
      fill(nOre, 0, 6, "#b0553a"); fill(nCoke, 1, 4.6, "#4a4a52");
    }
    function paint() {
      var r = calc(), i, k, fire = Math.min(1, coke / 12), box = [0, W];
      var poolH = clamp(r.fe / 340 * 44, 0, 46);
      ctx.clearRect(0, 0, W, H);
      /* ── 위: 스튜디오 위의 용광로 블록 ── */
      K.studio(ctx, 0, 0, W, TOP, { x: 640, y: 398, rx: 230, ry: 44 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, W, TOP, 14); ctx.clip();
      /* 오른쪽 면: 내화 벽돌 + 강철 띠 */
      I.face(ctx, "right", function (Lw) {
        bricks(ctx, Lw, Z, "#8c5640");
        [66, 186, 306, 400].forEach(function (z) { ctx.fillStyle = "#4d5560"; ctx.fillRect(0, z, Lw, 9); ctx.fillStyle = "rgba(255,255,255,.2)"; ctx.fillRect(0, z + 7, Lw, 2); });
      });
      I.shade(ctx, "right", function () { return Z; });
      /* 앞면: 노 한가운데를 자른 단면 */
      I.face(ctx, "front", function (Lw) {
        bricks(ctx, Lw, Z, "#9a5f45");
        ctx.fillStyle = "#3d434c"; ctx.fillRect(0, 0, 7, Z); ctx.fillRect(Lw - 7, 0, 7, Z);
        cavity(ctx);
        var g = ctx.createLinearGradient(0, 18, 0, Z);
        g.addColorStop(0, mixc("#3a302c", "#ff8a2a", fire));
        g.addColorStop(.42, mixc("#2d2522", "#8a3414", fire));
        g.addColorStop(1, mixc("#211a17", "#2a1814", fire));
        ctx.fillStyle = g; ctx.fill();
        ctx.save(); cavity(ctx); ctx.clip();
        if (poolH > 0) {
          var pg = ctx.createLinearGradient(0, 18, 0, 18 + poolH);
          pg.addColorStop(0, "#ff6a10"); pg.addColorStop(.6, "#ffb347"); pg.addColorStop(1, "#fff3b0");
          ctx.fillStyle = pg; ctx.fillRect(0, 18, Lw, poolH);
        }
        ctx.restore();
        /* 풍구(송풍관): 벽을 뚫고 노 안으로 */
        var wl = CU - hw(102), wr = CU + hw(102);
        ctx.fillStyle = "#6d7682"; ctx.fillRect(0, 96, wl + 10, 12); ctx.fillRect(wr - 10, 96, Lw - wr + 10, 12);
        ctx.fillStyle = "#c3ccd8"; ctx.fillRect(wl + 4, 98, 8, 8); ctx.fillRect(wr - 12, 98, 8, 8);
        /* 출선구 */
        ctx.fillStyle = poolH > 0 ? "#ff9a3c" : "#1a1210"; ctx.fillRect(Lw - 40, 24, 40, 7);
      });
      /* 윗면과 노구(장입구) */
      I.plane(ctx, Z, "#a06a52", "rgba(255,255,255,.35)");
      var hx0 = CU - hw(Z), hx1 = CU + hw(Z);
      I.quad(ctx, I.P(hx0, 16, Z), I.P(hx1, 16, Z), I.P(hx1, D, Z), I.P(hx0, D, Z), "#1b120e");
      I.quad(ctx, I.P(hx0, 16, Z), I.P(hx1, 16, Z), I.P(hx1, 16, Z - 18), I.P(hx0, 16, Z - 18), "#5a3426");
      I.edges(ctx, Z, Z);
      /* 쇳물·불꽃 빛 */
      var pp = I.P(CU, D, 18 + poolH);
      if (poolH > 0) K.glow(ctx, pp.x, pp.y, 16, "rgba(255,170,60,.55)", 2.6);
      if (fire > 0) {
        var fl = 1 + 0.18 * Math.sin(ph * 9), a1 = I.P(CU - hw(102) + 18, D, 102), a2 = I.P(CU + hw(102) - 18, D, 102);
        K.glow(ctx, a1.x, a1.y, 8 * fl * (0.5 + 0.5 * fire), "rgba(255,190,70,.85)", 2.4);
        K.glow(ctx, a2.x, a2.y, 8 * fl * (0.5 + 0.5 * fire), "rgba(255,190,70,.85)", 2.4);
      }
      /* 남은 철광석·코크스 */
      lumps(Math.min(Math.round(r.oreLeft / 20), 24), Math.min(Math.round(r.cokeLeft / 4), 30));
      /* 올라가는 기체: 아래에서는 CO(파랑), 위로 갈수록 산소를 얻어 CO₂(회색) */
      if (r.ext > 0) {
        var nG = Math.round(5 + 13 * r.ext);
        for (k = 0; k < nG; k++) {
          var t = ((k / nG) + ph * 0.16) % 1, z = 112 + t * (Z - 124);
          var u = CU + Math.sin(k * 2.3 + t * 5) * hw(z) * 0.55, p = I.P(u, D, z);
          ctx.globalAlpha = 0.85 * Math.min(1, (1 - t) * 4);
          ctx.fillStyle = mixc("#7fd3ff", "#d9dce6", clamp((t - 0.2) / 0.6, 0, 1));
          ctx.beginPath(); ctx.arc(p.x, p.y, 3.3, 0, 6.2832); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
      /* 열풍관 */
      I.box(ctx, L, 52, 90, L + 150, 86, 114, "#c3cad3", "#929ba7", "#707985");
      var b0 = I.P(L + 138, 69, 114), b1 = I.P(L + 22, 69, 114);
      K.arrow(ctx, b0, b1, "#1f6fd1", 3.5, 11);
      /* 배기가스 */
      var top = I.P(CU, 60, Z);
      if (r.ext > 0) {
        K.arrow(ctx, { x: top.x, y: top.y }, { x: top.x, y: top.y - 36 }, "rgba(95,104,122,.9)", 2 + 4 * r.ext, 11);
        K.pill(ctx, "배기가스 CO₂ " + Math.round(r.co2) + " kg", top.x + 14, top.y - 18, { s: 11, c: "#e8ecf4", box: box });
      }
      ctx.restore();
      /* 이름표 */
      if (r.oreLeft > 0.01 || r.cokeLeft > 0.01) I.label(ctx, CU - 66, D, 232, "남은 철광석·코크스 층", -100, -60, "#ffe1c9", box);
      if (r.ext > 0) I.label(ctx, CU + 30, D, 250, "CO 기체가 올라가며 산소를 떼어 감", -170, 34, "#bfe6ff", box);
      if (poolH > 0) I.label(ctx, CU - 50, D, 18 + poolH * 0.5, "쇳물(철) " + Math.round(r.fe) + " kg", -130, 12, "#ffd35a", box);
      I.label(ctx, L + 110, 69, 114, "열풍 — 뜨거운 공기(O₂)를 불어 넣음", 26, -64, "#bfe0ff", box);
      /* 범례 */
      dot(ctx, 30, 398, 6, "#b0553a"); K.t(ctx, "철광석", 40, 402, { s: 11, w: "800", c: DARK });
      dot(ctx, 98, 398, 4.6, "#4a4a52"); K.t(ctx, "코크스", 107, 402, { s: 11, w: "800", c: DARK });
      ctx.fillStyle = "#7fd3ff"; ctx.beginPath(); ctx.arc(170, 398, 3.6, 0, 6.2832); ctx.fill();
      ctx.fillStyle = "#b9bdc9"; ctx.beginPath(); ctx.arc(180, 398, 3.6, 0, 6.2832); ctx.fill();
      K.t(ctx, "CO → CO₂ 기체", 190, 402, { s: 11, w: "800", c: DARK });
      K.t(ctx, "(반응하고 남은 것만 표시)", 22, 424, { s: 10.5, c: "#5a6478" });
      /* 큰 제목 */
      var h1, h2;
      if (coke === 0) { h1 = "코크스가 없으면 쇳물도 없다"; h2 = "철광석 " + ore + " kg이 그대로 남는다"; }
      else if (r.ext < 1) { h1 = "코크스가 모자라다"; h2 = "철광석 " + Math.round(r.oreLeft) + " kg이 아직 산소를 쥐고 있다"; }
      else if (r.cokeLeft > 0.01) { h1 = "철은 다 나왔지만 코크스가 남는다"; h2 = "코크스 " + Math.round(r.cokeLeft) + " kg이 쓰이지 못함"; }
      else { h1 = "남김없이 쇳물이 되었다"; h2 = "철 " + Math.round(r.fe) + " kg · 남은 철광석도 코크스도 0 kg"; }
      K.bigText(ctx, h1, 22, 52, 28, "#ffffff");
      K.bigText(ctx, h2, 22, 86, 18, "#ffd35a");
      K.warn(ctx, W - 14, 30, "⚠ 모양은 단순화 · 알갱이 수는 남은 양에 비례", "right");

      /* ── 아래: 입자 모형과 막대 장부 ── */
      var y0 = TOP + 8, X0 = -340, y = y0 + 116, xs;
      K.stage(ctx, 0, y0, W, H - y0, "lab", { seed: 14, title: "입자 모형 — 산소(O)는 누구에게서 누구에게로 갔나" });
      xs = [366, 388, 410, 432, 454];
      for (i = 0; i < 5; i++) dot(ctx, X0 + xs[i], y, 11, i % 2 ? AT.Fe : AT.O, i % 2 ? "Fe" : "O", "#06202c", 9);
      K.t(ctx, "+", X0 + 478, y + 5, { s: 16, w: "800", a: "center", c: KC.ink });
      for (i = 0; i < 3; i++) { dot(ctx, X0 + 506 + i * 32, y - 11, 10, AT.C, "C", "#ffffff", 9); dot(ctx, X0 + 506 + i * 32, y + 10, 10, AT.O, "O", "#06202c", 9); }
      K.arrow(ctx, { x: X0 + 594, y: y }, { x: X0 + 628, y: y }, KC.ink, 2, 9);
      dot(ctx, X0 + 652, y, 11, AT.Fe, "Fe", "#06202c", 9); dot(ctx, X0 + 678, y, 11, AT.Fe, "Fe", "#06202c", 9);
      K.t(ctx, "+", X0 + 702, y + 5, { s: 16, w: "800", a: "center", c: KC.ink });
      for (i = 0; i < 3; i++) { var cx = X0 + 738 + i * 54; dot(ctx, cx - 17, y, 9, AT.O, "O", "#06202c", 8); dot(ctx, cx, y, 9, AT.C, "C", "#ffffff", 8); dot(ctx, cx + 17, y, 9, AT.O, "O", "#06202c", 8); }
      K.t(ctx, "산화 철(Ⅲ)", X0 + 410, y + 38, { s: 10.5, a: "center", c: KC.mute });
      K.t(ctx, "일산화 탄소", X0 + 538, y + 38, { s: 10.5, a: "center", c: KC.mute });
      K.t(ctx, "철", X0 + 665, y + 38, { s: 10.5, a: "center", c: KC.mute });
      K.t(ctx, "이산화 탄소", X0 + 792, y + 38, { s: 10.5, a: "center", c: KC.mute });
      ctx.save(); ctx.shadowColor = KC.blue; ctx.shadowBlur = 8; ctx.strokeStyle = KC.blue; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(X0 + 410, y - 18); ctx.quadraticCurveTo(X0 + 538, y - 72, X0 + 656, y - 20); ctx.stroke(); ctx.restore();
      K.arrow(ctx, { x: X0 + 646, y: y - 26 }, { x: X0 + 658, y: y - 18 }, KC.blue, 2.2, 9);
      tag(ctx, "산소를 잃음 → 환원", X0 + 538, y - 48, { s: 11.5, a: "center", c: KC.blue });
      ctx.save(); ctx.shadowColor = KC.red; ctx.shadowBlur = 8; ctx.strokeStyle = KC.red; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(X0 + 538, y + 46); ctx.quadraticCurveTo(X0 + 665, y + 88, X0 + 788, y + 48); ctx.stroke(); ctx.restore();
      K.arrow(ctx, { x: X0 + 778, y: y + 54 }, { x: X0 + 790, y: y + 46 }, KC.red, 2.2, 9);
      tag(ctx, "산소를 얻음 → 산화", X0 + 665, y + 84, { s: 11.5, a: "center", c: KC.red });
      /* 막대 장부 */
      var rows = [["남은 철광석", r.oreLeft, "#d0704f"], ["얻은 철", r.fe, KC.yellow], ["남은 코크스", r.cokeLeft, "#9aa0b5"], ["나온 이산화 탄소", r.co2, KC.mute]];
      rows.forEach(function (row, n) {
        var bby = y0 + 52 + n * 38;
        K.t(ctx, row[0], 560, bby + 14, { s: 11.5, w: "800", c: KC.ink });
        meter(ctx, 668, bby, 162, 18, row[1] / 500, row[2]);
        K.t(ctx, Math.round(row[1]) + " kg", 888, bby + 14, { s: 12.5, w: "900", a: "right", c: KC.ink });
      });
    }
    function draw() {
      var r = calc();
      paint();
      $("a-furn-info").innerHTML = "철광석 " + ore + " kg, 코크스 " + coke + " kg → 철 <b>" + Math.round(r.fe) + " kg</b>. " +
        "철광석이 <b>잃은 산소 " + Math.round(r.oLost) + " kg</b>은 고스란히 일산화 탄소가 <b>얻어</b> 이산화 탄소가 되었습니다. " +
        (r.ext < 1 ? "코크스가 모자라 철광석 " + Math.round(r.oreLeft) + " kg이 산소를 잃지 못한 채 남았습니다." :
          (r.cokeLeft > 0.01 ? "철광석은 모두 철이 되었지만 코크스 " + Math.round(r.cokeLeft) + " kg이 쓰이지 못하고 남았습니다." :
            "철광석도 코크스도 남지 않았습니다. 철광석 160 kg마다 코크스 36 kg이 꼭 맞습니다."));
      var exact = r.ext >= 1 && r.cokeLeft < 0.01, ch = false;
      if (exact && ore === 160 && !got.a) { got.a = ch = true; }
      if (exact && Math.abs(r.fe - 280) < 0.01 && !got.b) { got.b = ch = true; }
      if (ch) { window.sthState("furn", got); mission(); }
    }
    function mission() {
      if (got.a) { done("a-m2a"); $("a-m2a").innerHTML = "철광석 160 kg ↔ 코크스 <b>36 kg</b> → 철 112 kg"; }
      if (got.b) { done("a-m2b"); $("a-m2b").innerHTML = "철광석 <b>400 kg</b> + 코크스 <b>90 kg</b> → 철 280 kg. 반응하는 물질의 양은 늘 같은 비율입니다."; }
      if (got.q) done("a-m2c");
      if (got.a && got.b && got.q) { window.sthMission("a-m2", true); ep.clear(1); }
    }
    canvas._redraw = draw;
    playBtn("a-furn-play", "⏸ 불길 멈추기", "▶ 불길 보기", function () { return flowing; }, function (x) { flowing = x; });
    K.animate(canvas, function (dt) { if (flowing) { ph += dt / 1000; paint(); } }, 24);
    $("a-ore").addEventListener("input", function (e) { ore = +e.target.value; $("a-ore-val").textContent = ore + " kg"; draw(); });
    $("a-coke").addEventListener("input", function (e) { coke = +e.target.value; $("a-coke-val").textContent = coke + " kg"; draw(); });
    window.sthPick({
      mount: "a-q2",
      q: "용광로 안에서 ‘환원’된 물질은 무엇이고, 그렇게 판단한 까닭은?",
      options: ["일산화 탄소 — 산소를 얻어 이산화 탄소가 되었으므로", "산화 철(Ⅲ) — 산소를 잃고 철이 되었으므로", "코크스 — 타서 없어졌으므로", "철 — 새로 생겨났으므로"],
      answer: 1,
      why: ["산소를 얻는 것은 산화입니다. 일산화 탄소는 산화되었습니다.", "산소를 잃는 것이 환원입니다. 그리고 그 산소를 얻은 일산화 탄소는 동시에 산화되었습니다.", "없어진 것이 아니라 산소와 결합해 기체가 되어 빠져나갔습니다.", "철은 환원의 결과로 생긴 생성물입니다. 환원된 것은 반응물인 산화 철(Ⅲ)입니다."],
      onDone: function () { got.q = true; window.sthState("furn", got); mission(); }
    });
    draw(); mission();
  })();

  /* 장면 3 — 세 사건의 공통점 */
  window.sthSort({
    mount: "a-sort",
    buckets: [
      { id: "ox", label: "산화", sub: "산소를 얻는다" },
      { id: "re", label: "환원", sub: "산소를 잃는다" }
    ],
    items: [
      { t: "제련: 산화 철(Ⅲ) Fe₂O₃ → 철 Fe", a: "re", why: "산소를 잃었으므로 환원입니다." },
      { t: "제련: 일산화 탄소 CO → 이산화 탄소 CO₂", a: "ox", why: "산소를 하나 더 얻었으므로 산화입니다." },
      { t: "연소: 메테인 CH₄ → 이산화 탄소 CO₂", a: "ox", why: "탄소가 산소와 결합했습니다. 연소는 빠른 산화입니다.", hint: "메테인의 탄소가 무엇과 결합했나요?" },
      { t: "광합성: 이산화 탄소 CO₂ → 포도당 C₆H₁₂O₆", a: "re", why: "이산화 탄소가 산소를 잃고 포도당이 됩니다. 광합성에서 이산화 탄소는 환원됩니다.", hint: "탄소 원자 하나에 붙은 산소의 수를 비교해 보세요. CO₂는 2개, 포도당은 1개꼴입니다." },
      { t: "세포 호흡: 포도당 C₆H₁₂O₆ → 이산화 탄소 CO₂", a: "ox", why: "광합성의 반대 방향입니다. 포도당이 산화됩니다.", hint: "광합성의 반대 방향입니다." },
      { t: "녹: 철 Fe → 산화 철", a: "ox", why: "철이 공기 중 산소와 결합하는 느린 산화입니다." },
      { t: "손난로: 철 가루 → 산화 철", a: "ox", why: "철의 산화입니다. 이때 나오는 열을 이용합니다. (이야기 ③에서 다시 만납니다.)" },
      { t: "구리 제련: 산화 구리(Ⅱ) CuO → 구리 Cu", a: "re", why: "탄소와 함께 가열하면 산화 구리가 산소를 잃고 구리가 됩니다." }
    ],
    doneText: "광합성·연소·제련 모두 한 물질이 산소를 잃으면 다른 물질이 그 산소를 얻습니다.",
    onDone: function () { window.sthMission("a-m3", true, "<span class='m-tag'>미션 완료</span>세 사건의 공통점은 <b>산소의 이동</b>입니다. 산소를 얻는 산화와 잃는 환원이 언제나 짝을 이루어 함께 일어납니다."); ep.clear(2); }
  });
  if (ep.cleared(2)) window.sthMission("a-m3", true);

  /* 장면 4 — 금속과 금속 이온 수용액 */
  (function () {
    var canvas = $("a-metal"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var MET = {
      Mg: { r: 5, name: "마그네슘", ion: "Mg²⁺", q: 2, col: "--mist" },
      Zn: { r: 4, name: "아연", ion: "Zn²⁺", q: 2, col: "--mist" },
      Fe: { r: 3, name: "철", ion: "Fe²⁺", q: 2, col: "--violet" },
      Cu: { r: 2, name: "구리", ion: "Cu²⁺", q: 2, col: "--coral" },
      Ag: { r: 1, name: "은", ion: "Ag⁺", q: 1, col: "--card" }
    };
    var metal = "Cu", ion = "Zn", time = 0, timer = null;
    var got = window.sthState("metal") || { a: false, b: false, c: false, q: false };
    var N = 12, SLOT = [], BX = 300, BYB = 380;
    /* 이온 자리: 금속 판을 사이에 두고 왼쪽 6·오른쪽 6 (줄마다 조금씩 엇갈림) */
    (function () { for (var i = 0; i < N; i++) { var side = i % 2 ? 1 : -1, k = Math.floor(i / 2), row = k % 3, col = Math.floor(k / 3); SLOT.push({ x: BX + side * (72 + col * 52 + (row === 1 ? 10 : 0)), y: BYB - 158 + row * 50 }); } })();

    var MC = { Mg: ["#f4f6fa", "#959dab"], Zn: ["#d9dfe8", "#76808f"], Fe: ["#b0b6bf", "#474e58"], Cu: ["#ffb987", "#9a4a20"], Ag: ["#ffffff", "#aab4c3"] };
    function state() {
      var reacts = MET[metal].r > MET[ion].r, frac = reacts ? time / 100 : 0, q = MET[ion].q;
      var used = q === 1 ? 2 * Math.round(N / 2 * frac) : Math.round(N * frac);      // 없어진 수용액 속 이온 수
      var made = q === 1 ? used / 2 : used;                                          // 새로 녹아 나온 금속 이온 수
      return { reacts: reacts, frac: frac, used: used, made: made, e: used * q };
    }
    /* 금속 판(입체 상자): 앞면·오른쪽 옆면·윗면 */
    function plate(x, y0, y1, w, mc) {
      var d = 10, e = 6, g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      g.addColorStop(0, mc[1]); g.addColorStop(.38, mc[0]); g.addColorStop(.62, K.tint(mc[0].length === 7 ? mc[0] : "#dddddd", .92)); g.addColorStop(1, mc[1]);
      ctx.fillStyle = shade(mc[1], .8); ctx.beginPath(); ctx.moveTo(x + w / 2, y0); ctx.lineTo(x + w / 2 + d, y0 - e); ctx.lineTo(x + w / 2 + d, y1 - e); ctx.lineTo(x + w / 2, y1); ctx.closePath(); ctx.fill();
      ctx.fillStyle = mc[0]; ctx.beginPath(); ctx.moveTo(x - w / 2, y0); ctx.lineTo(x - w / 2 + d, y0 - e); ctx.lineTo(x + w / 2 + d, y0 - e); ctx.lineTo(x + w / 2, y0); ctx.closePath(); ctx.fill();
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, y0, w, y1 - y0);
      ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.fillRect(x - w / 2 + 4, y0 + 4, 3, y1 - y0 - 8);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s = state(), m = MET[metal], t = MET[ion], i, LW = 572;
      K.studio(ctx, 0, 0, LW, H, null);
      /* 용액 색: Cu²⁺ 푸른색, Fe²⁺ 연한 초록, 나머지는 무색 */
      var cu = (ion === "Cu" ? N - s.used : 0) + (metal === "Cu" ? s.made : 0);
      var fe = (ion === "Fe" ? N - s.used : 0) + (metal === "Fe" ? s.made : 0);
      var lc = cu > 0 ? "#2f86e8" : (fe > 0 ? "#6fcf8f" : "#a9cfee"), la = cu > 0 ? .12 + .34 * cu / N : (fe > 0 ? .10 + .18 * fe / N : .14);
      var mw = s.reacts ? lerp(46, 30, s.frac) : 46, mc = MC[metal];
      var bk = beaker3(ctx, BX, BYB, 168, 262, 214, lc, la, function (yl) {
        plate(BX, 86, BYB - 22, mw, mc);
        /* 석출된 금속 알갱이 */
        for (i = 0; i < s.used; i++) {
          var side = i % 2 ? 1 : -1, dy = yl + 18 + Math.floor(i / 2) * 25, dc = MC[ion];
          K.planet(ctx, BX + side * (mw / 2 + 9) + (side > 0 ? 4 : 0), dy, 9, dc[0], dc[1]);
        }
        for (i = 0; i < N; i++) {
          var p = SLOT[i];
          if (i >= s.used) pill(ctx, p.x, p.y, t.ion, ion === "Cu" ? "#4aa8ff" : (ion === "Fe" ? "#7ee0a0" : "#d4dbe8"));
          else if (t.q === 2 || i % 2 === 0) pill(ctx, p.x, p.y, m.ion, "#ff6b81");
        }
      }, 30);
      /* 금속 이름(공기 중에 나온 부분) */
      K.t(ctx, metal, BX, 112, { s: 15, w: "900", a: "center", c: "#132036" });
      /* 전자 이동 */
      if (s.reacts && time > 0 && time < 100) {
        var a0 = { x: BX + mw / 2 + 8, y: bk.yl + 14 }, a1 = { x: BX + 112, y: bk.yl + 22 }, u = (time % 20) / 20;
        K.arrow(ctx, a0, a1, "#f59f00", 3, 11);
        K.glow(ctx, lerp(a0.x, a1.x, u), lerp(a0.y, a1.y, u), 3.4, "rgba(255,190,60,.95)", 3.2);
        K.pill(ctx, "e⁻ 이동", BX + 70, bk.yl - 34, { s: 12, a: "center", c: "#ffd35a", box: [0, LW] });
      }
      /* 큰 제목 */
      var h1, h2;
      if (metal === ion) { h1 = "같은 금속 — 변화 없음"; h2 = "견줄 상대가 없습니다"; }
      else if (s.reacts) { h1 = josa(t.name, "이", "가") + " 입혀진다"; h2 = m.name + " 원자가 전자를 내주고 녹아 나옴"; }
      else { h1 = "아무 일도 없다"; h2 = josa(m.name, "은", "는") + " " + t.ion + "에 전자를 못 준다"; }
      K.bigText(ctx, h1, 20, 46, 26, "#ffffff");
      K.bigText(ctx, h2, 20, 76, 16, "#ffd35a");
      K.warn(ctx, LW - 12, H - 14, "⚠ 입자 수·크기는 단순화", "right");
      /* ── 오른쪽 흰 판정 카드 ── */
      var RX = LW + 10, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "입자 수 장부");
      cardBig(ctx, metal === ion || !s.reacts ? "변화 없음" : (time === 0 ? "반응 준비" : "전자가 옮겨 감"), x0, 64, s.reacts ? LT.teal : LT.mute, 22);
      if (s.reacts) {
        K.t(ctx, "산화  " + m.name + " 원자 " + s.made + "개 → " + m.ion, x0, 96, { s: 12, w: "800", c: LT.red });
        K.t(ctx, "환원  " + t.ion + " " + s.used + "개 → " + t.name + " 원자", x0, 118, { s: 12, w: "800", c: LT.blue });
      } else K.t(ctx, "전자가 옮겨 가지 않습니다", x0, 96, { s: 12, w: "800", c: LT.mute });
      var bars = [["잃은 전자", s.e, LT.red], ["얻은 전자", s.e, LT.blue], ["수용액 속 " + t.ion, N - s.used, "#8fa3bf"], ["수용액 속 " + (s.reacts ? m.ion : "새 이온"), s.made, "#ff6b81"]];
      bars.forEach(function (b, k) {
        var by = 156 + k * 44;
        K.row(ctx, b[0], b[1] + "개", x0, x1, by, LT.ink);
        K.bar(ctx, x0, by + 9, x1 - x0, b[1] / 24, b[2]);
      });
      K.t(ctx, "수용액 속 금속 이온 모두 " + (N - s.used + s.made) + "개", x0, 342, { s: 12, w: "800", c: LT.ink });
      K.tip(ctx, metal === ion ? "같은 금속끼리는 견줄 수 없음" : (s.reacts ? "잃은 전자 수 = 얻은 전자 수" : "반응성이 더 작아 전자를 못 줌"), x0 - 4, 354, x1 - x0 + 8, s.reacts ? true : (metal === ion ? null : false));
      K.t(ctx, "(음이온은 반응하지 않아 그리지 않음)", x0, 408, { s: 10.5, c: LT.mute });

      $("a-time-val").textContent = time;
      if (metal === ion) {
        $("a-metal-info").innerHTML = "<b>변화가 없습니다.</b> " + m.name + " 금속을 같은 금속의 이온이 든 수용액에 넣었습니다. 반응성을 견줄 상대가 없습니다.";
      } else if (s.reacts) {
        $("a-metal-info").innerHTML = "<b>반응이 일어납니다.</b> " + josa(m.name, "이", "가") + " " + t.name + "보다 반응성이 커서, " + m.name + " 원자는 전자를 잃고 <b>산화</b>되어 " + m.ion + "으로 녹아 나오고, " + t.ion + "은 그 전자를 얻어 <b>환원</b>되어 " + t.name + " 금속으로 달라붙습니다. 지금까지 옮겨 간 전자는 <b>" + s.e + "개</b>, 잃은 수와 얻은 수가 늘 같습니다." +
          (t.q === 1 ? " Ag⁺은 전자를 1개씩만 얻으므로 " + m.name + " 원자 1개가 Ag⁺ <b>2개</b>를 환원시킵니다. 그래서 수용액 속 이온 수가 줄어듭니다." : "") +
          (ion === "Cu" ? " Cu²⁺이 줄어들면서 용액의 <b>푸른색이 옅어집니다.</b>" : "") + (metal === "Cu" ? " Cu²⁺이 생기면서 용액이 <b>푸른색</b>을 띱니다." : "");
      } else {
        $("a-metal-info").innerHTML = "<b>반응이 일어나지 않습니다.</b> " + josa(m.name, "은", "는") + " " + t.name + "보다 반응성이 작아, " + t.ion + "에게 전자를 내주지 못합니다. 시간이 지나도 그대로입니다.";
      }
      var ch = false;
      if (time === 100) {
        if (metal === "Fe" && ion === "Cu" && !got.a) { got.a = ch = true; }
        if (metal === "Cu" && ion === "Ag" && !got.b) { got.b = ch = true; }
        if (!s.reacts && !got.c) { got.c = ch = true; }
      }
      if (ch) { window.sthState("metal", got); mission(); }
    }
    function mission() {
      if (got.a) { done("a-m4a"); put("a-m4a", "철 못 + Cu²⁺ 수용액 → 철 못에 구리가 입혀집니다."); }
      if (got.b) { done("a-m4b"); put("a-m4b", "구리 선 + Ag⁺ 수용액 → 구리 선에 은이 자라납니다."); }
      if (got.c) done("a-m4c");
      if (got.q) done("a-m4d");
      if (got.a && got.b && got.c && got.q) {
        window.sthMission("a-m4", true, "<span class='m-tag'>미션 완료</span>반응성 <b>Mg &gt; Zn &gt; Fe &gt; Cu &gt; Ag</b>. 반응성이 큰 금속을, 반응성이 작은 금속의 이온이 든 수용액에 넣어야 도금이 됩니다. 산소가 없어도 <b>전자를 잃으면 산화, 얻으면 환원</b>입니다.");
        ep.clear(3); ep.clear(4);
      }
    }
    function stop() { if (timer) { window.clearTimeout(timer); timer = null; } $("a-play").textContent = "▶ 시간 흐르게 하기"; }
    function reset() { stop(); time = 0; $("a-time").value = 0; draw(); }
    canvas._redraw = draw;
    seg("a-metal-seg", function (k) { metal = k; reset(); });
    seg("a-ion-seg", function (k) { ion = k; reset(); });
    $("a-time").addEventListener("input", function (e) { stop(); time = +e.target.value; draw(); });
    $("a-play").addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (time >= 100) time = 0;
      $("a-play").textContent = "⏸ 멈추기";
      (function step() {
        time = Math.min(100, time + 2); $("a-time").value = time; draw();
        if (time < 100) timer = window.setTimeout(step, 60); else stop();
      })();
    });
    window.sthPick({
      mount: "a-q4",
      q: "여러 조합을 실험한 결과로 볼 때, 금속의 반응성(전자를 잃고 이온이 되려는 정도)을 큰 것부터 옳게 늘어놓은 것은?",
      options: ["Ag > Cu > Fe > Zn > Mg", "Mg > Zn > Fe > Cu > Ag", "Mg > Fe > Zn > Ag > Cu", "Cu > Ag > Mg > Zn > Fe"],
      answer: 1,
      why: ["거꾸로입니다. Ag⁺ 수용액에는 어떤 금속을 넣어도 은이 달라붙었습니다. 은이 가장 이온으로 있기 싫어한다는 뜻입니다.", "Mg은 모든 수용액에서 반응했고, Ag⁺은 모든 금속에게서 전자를 받았습니다.", "Zn을 Fe²⁺ 수용액에, Cu를 Ag⁺ 수용액에 넣어 다시 확인해 보세요.", "Cu 선은 Zn²⁺·Fe²⁺ 수용액에서 아무 변화가 없었습니다."],
      onDone: function () { got.q = true; window.sthState("metal", got); mission(); }
    });
    draw(); mission();
    if (ep.cleared(3)) window.sthMission("a-m4", true);
  })();

  /* 장면 5 — 결말 */
  function vs() {
    var p = window.sthState("p1") || "";
    $("a-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + "<br>" +
      (p.indexOf("㉡") === 0 ? "처음부터 정확히 짚었습니다. 용광로 장부가 그 증거입니다." : "숯은 열도 내지만, 그것만으로는 철이 나오지 않습니다. 산소를 떼어 가는 물질이 있어야 합니다.") +
      "<br><b>내가 찾은 배합</b> 철광석 160 kg ↔ 코크스 36 kg → 철 112 kg";
  }
  function finish() { window.sthState("r1", "해결 · 철광석 160 kg에 코크스 36 kg → 철 112 kg · 도금 조합 Fe+Cu²⁺, Cu+Ag⁺ · 반응성 Mg>Zn>Fe>Cu>Ag"); }
  ep.onShow(function (i) { if (i === 4) vs(); });
  vs();
  window.sthWork({
    mount: "a-wk", unitLabel: "[통합과학2 Ⅰ-2] 이야기 ① 붉은 돌에서 철을 꺼내라",
    items: [
      { id: "w1", label: "산화와 환원은 함께 일어난다", hint: "이야기에 나온 반응 하나(제련, 연소, 광합성, 금속과 금속 이온)를 골라 무엇이 산화되고 무엇이 환원되는지 짝지어 쓰세요. 옮겨 간 것이 산소인지 전자인지도 밝히세요." },
      { id: "a2", label: "서진이에게 보내는 답장", hint: "장작불로 달구기만 해서는 철이 나오지 않는 까닭, 숯을 철광석과 섞어 넣는 까닭을 ‘산소’라는 말을 넣어 두세 문장으로 설명하세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ② 물고기가 사라진 호수
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep2", key: "ep2", name: "사건 파일 ②", onDone: finish });

  window.sthGate({
    gate: "gt", key: "acidbase", title: "조사관의 첫 판단",
    question: "에탄올의 화학식은 C₂H₅<b>OH</b>입니다. 에탄올은 염기일까요?",
    options: ["㉠ OH가 있으므로 염기다", "㉡ 염기가 아니다", "㉢ 물에 녹으면 염기가 된다", "㉣ 산이면서 염기다"],
    onPick: function (i) { window.sthState("acidbaseOK", i === 1 ? "맞음" : "어긋남"); ep.clear(0); }
  });

  /* 장면 2 — 검사대 */
  (function () {
    var canvas = $("b-test"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var SUB = {
      hcl:  { name: "묽은 염산", kind: "acid", strong: 1, parts: [["H⁺", 5, "h"], ["Cl⁻", 5, "x"]], note: "염화 수소는 물에 녹아 거의 모두 H⁺과 Cl⁻으로 나뉩니다." },
      acoh: { name: "식초(아세트산 수용액)", kind: "acid", strong: 0, parts: [["H⁺", 1, "h"], ["CH₃COO⁻", 1, "x"], ["CH₃COOH", 6, "m"]], note: "아세트산은 H가 4개지만 일부 분자만, 그것도 H⁺ 하나만 내놓습니다." },
      naoh: { name: "수산화 나트륨 수용액", kind: "base", strong: 1, parts: [["Na⁺", 5, "x"], ["OH⁻", 5, "o"]], note: "물에 녹아 Na⁺과 OH⁻으로 나뉩니다." },
      caoh: { name: "석회수(수산화 칼슘 수용액)", kind: "base", strong: 1, parts: [["Ca²⁺", 3, "x"], ["OH⁻", 6, "o"]], note: "Ca(OH)₂ 하나가 OH⁻을 2개 내놓습니다." },
      nh3:  { name: "암모니아수", kind: "base", strong: 0, parts: [["NH₄⁺", 1, "x"], ["OH⁻", 1, "o"], ["NH₃", 6, "m"]], note: "화학식에 OH가 없지만, 일부 암모니아 분자가 물과 반응해 NH₄⁺과 OH⁻을 만듭니다." },
      etoh: { name: "에탄올 수용액", kind: "none", strong: 0, parts: [["C₂H₅OH", 8, "m"]], note: "에탄올은 물에 녹아도 이온으로 나뉘지 않습니다. 분자 그대로 섞여 있을 뿐, OH⁻을 내놓지 않습니다." }
    };
    var POS = [[90, 150], [200, 130], [310, 160], [140, 205], [260, 215], [85, 260], [195, 270], [320, 265], [250, 300], [130, 310]];
    var sub = "hcl", tool = null;
    var tested = window.sthState("tested") || {}, sorted = !!window.sthState("testSorted");

    function result() {
      var k = SUB[sub].kind, st = SUB[sub].strong;
      if (tool === "btb") return { col: k === "acid" ? "--amber" : (k === "base" ? "--brand" : "--green"), txt: "BTB 용액: <b>" + (k === "acid" ? "노란색" : (k === "base" ? "파란색" : "초록색")) + "</b> — " + (k === "acid" ? "산성" : (k === "base" ? "염기성" : "중성")) + "입니다." };
      if (tool === "pp") return { col: k === "base" ? "--rose" : null, txt: "페놀프탈레인 용액: <b>" + (k === "base" ? "붉은색" : "무색 그대로") + "</b>" + (k === "base" ? " — 염기성입니다." : " — 염기성은 아닙니다. (산성인지 중성인지는 이것만으로 알 수 없습니다.)") };
      if (tool === "lit") return { txt: "리트머스 종이: " + (k === "acid" ? "<b>푸른 종이가 붉게</b> 변했습니다 — 산성." : (k === "base" ? "<b>붉은 종이가 푸르게</b> 변했습니다 — 염기성." : "붉은 종이도 푸른 종이도 <b>변하지 않았습니다.</b>")) };
      if (tool === "mg") return { txt: "마그네슘 조각: " + (k === "acid" ? "<b>수소 기체가 " + (st ? "활발하게" : "천천히") + " 발생</b>합니다. 산의 H⁺이 마그네슘에게서 전자를 얻기 때문입니다." : "기체가 발생하지 않습니다. H⁺이 (거의) 없습니다.") };
      return { txt: "전류: " + (k === "none" ? "<b>흐르지 않습니다.</b> 전하를 나를 이온이 없습니다." : "<b>" + (st ? "잘 흐릅니다" : "약하게 흐릅니다") + ".</b> 수용액 속에 이온이 " + (st ? "많이" : "조금") + " 있습니다.") };
    }
    /* 지시약의 실제 색 */
    var REAL = { "--amber": "#ffd84a", "--brand": "#3d7bff", "--green": "#4ccf6a", "--rose": "#ff4fa0" };
    var bub = 0, bubbling = !REDUCE, painting = false;
    /* 비커 속 입자 자리(액체 안) */
    var POS2 = [[92, 184], [196, 176], [292, 188], [132, 230], [244, 236], [310, 228], [84, 276], [192, 282], [292, 274], [142, 322]];
    var SHORT = { hcl: "묽은 염산", acoh: "식초", naoh: "NaOH 수용액", caoh: "석회수", nh3: "암모니아수", etoh: "에탄올 수용액" };
    /* 나무 시험관 꽂이 */
    function rack(x, y, w) {
      floorShadow(ctx, x + 8, y + 30, w * .65, 10, .3);
      ctx.fillStyle = "#d9b48a"; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2 + 14, y - 10); ctx.lineTo(x + w / 2 + 14, y - 10); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
      var g = ctx.createLinearGradient(0, y, 0, y + 22); g.addColorStop(0, "#c08d5a"); g.addColorStop(1, "#8f6136");
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, y, w, 22);
      ctx.fillStyle = "#7a522d"; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2 + 14, y - 10); ctx.lineTo(x + w / 2 + 14, y + 12); ctx.lineTo(x + w / 2, y + 22); ctx.closePath(); ctx.fill();
    }
    /* 얼은 종이 띠(입체) : 위는 원래 색, 아래(적신 부분)는 바뀐 색 */
    function strip(x, y0, y1, yd, c0, c1) {
      var w = 34;
      ctx.fillStyle = shade(c0, .7); ctx.beginPath(); ctx.moveTo(x + w / 2, y0); ctx.lineTo(x + w / 2 + 5, y0 - 3); ctx.lineTo(x + w / 2 + 5, y1 - 3); ctx.lineTo(x + w / 2, y1); ctx.closePath(); ctx.fill();
      var g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, shade(c0, .85)); g.addColorStop(.5, shade(c0, 1.1)); g.addColorStop(1, shade(c0, .85));
      ctx.fillStyle = g; ctx.fillRect(x - w / 2, y0, w, yd - y0);
      var g2 = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g2.addColorStop(0, shade(c1, .8)); g2.addColorStop(.5, shade(c1, 1.05)); g2.addColorStop(1, shade(c1, .8));
      ctx.fillStyle = g2; ctx.fillRect(x - w / 2, yd, w, y1 - yd);
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var S = SUB[sub], k = S.kind, i = 0, res = tool ? result() : null, LW = 640, ax = 522;
      K.studio(ctx, 0, 0, LW, H, null);
      /* ── 왼쪽: 비커와 입자 모형 ── */
      beaker3(ctx, 200, 344, 166, 250, 200, res && res.col ? REAL[res.col] : "#a9cfee", res && res.col ? .34 : .14, function () {
        S.parts.forEach(function (p) {
          for (var n = 0; n < p[1]; n++, i++) {
            var c = p[2] === "h" ? "#ff7a6b" : (p[2] === "o" ? "#4f8dff" : (p[2] === "m" ? "#a58cff" : "#d4dbe8"));
            pill(ctx, POS2[i % 10][0], POS2[i % 10][1], p[0], c);
          }
        });
      }, 28);
      K.bigText(ctx, S.name, 18, 44, 23, "#ffffff");
      /* ── 가운데: 검사 장치 미니어처 ── */
      if (!tool) {
        tube3(ctx, ax, 110, 24, 200, 0, null, 0);
        K.pill(ctx, "검사 도구를 고르세요", ax, 86, { s: 12, a: "center", c: "#e8ecff", box: [380, LW] });
      } else if (tool === "btb" || tool === "pp") {
        tube3(ctx, ax, 96, 26, 222, 150, res.col ? REAL[res.col] : "#dde9f6", res.col ? .78 : .2);
        rack(ax, 262, 120);
        K.pill(ctx, tool === "btb" ? "BTB 용액을 떨어뜨림" : "페놀프탈레인을 떨어뜨림", ax, 76, { s: 11.5, a: "center", c: "#e8ecff", box: [380, LW] });
      } else if (tool === "lit") {
        var red = k === "base" ? "#4a7fe0" : "#e8505b", blue = k === "acid" ? "#e8505b" : "#4a7fe0";
        strip(ax - 44, 112, 312, 262, "#e8505b", red); strip(ax + 44, 112, 312, 262, "#4a7fe0", blue);
        beaker3(ctx, ax, 344, 92, 96, 66, "#a9cfee", .2, null, 16);
        K.pill(ctx, "붉은 종이", ax - 44, 100, { s: 11.5, a: "center", c: "#ffd0d4", box: [380, LW] });
        K.pill(ctx, "푸른 종이", ax + 44, 100, { s: 11.5, a: "center", c: "#cfe0ff", box: [380, LW] });
      } else if (tool === "mg") {
        var nb = k === "acid" ? (S.strong ? 14 : 4) : 0;
        tube3(ctx, ax, 96, 30, 222, 170, "#cfe3ff", .22, function (yl) {
          var rg = ctx.createLinearGradient(0, 278, 0, 292); rg.addColorStop(0, "#f6f8fb"); rg.addColorStop(1, "#7f8898");
          ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(ax - 18, 292); ctx.lineTo(ax + 14, 286); ctx.lineTo(ax + 18, 278); ctx.lineTo(ax - 14, 284); ctx.closePath(); ctx.fill();
          for (var b = 0; b < nb; b++) {
            var bx = ax - 18 + (b * 13) % 36, span = 278 - yl - 10, yy = 276 - ((b * 37 + bub * (S.strong ? 120 : 50)) % span);
            ctx.strokeStyle = "rgba(255,255,255,.95)"; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(bx, yy, 3 + b % 3, 0, 6.2832); ctx.stroke();
            ctx.strokeStyle = "rgba(60,110,170,.45)"; ctx.lineWidth = .8; ctx.stroke();
          }
        });
        rack(ax, 262, 120);
        K.pill(ctx, nb ? "H₂ 기체 발생" : "기체가 안 나옴", ax, 76, { s: 12, a: "center", c: nb ? "#bfe6ff" : "#e8ecff", box: [380, LW] });
        K.pill(ctx, "Mg 조각", ax + 70, 290, { s: 11, a: "left", c: "#e8ecff", box: [380, LW] });
      } else {
        var bright = k === "none" ? 0 : (S.strong ? 1 : .4), bc = { x: ax, y: 128 };
        beaker3(ctx, ax, 344, 92, 104, 74, "#a9cfee", .2, function () {
          ctx.fillStyle = "#7d8696"; ctx.fillRect(ax - 48, 230, 9, 98); ctx.fillRect(ax + 39, 230, 9, 98);
          ctx.fillStyle = "rgba(255,255,255,.4)"; ctx.fillRect(ax - 46, 232, 2, 94); ctx.fillRect(ax + 41, 232, 2, 94);
        }, 16);
        ctx.save(); ctx.strokeStyle = "#c4763a"; ctx.lineWidth = 3; ctx.lineJoin = "round";
        ctx.beginPath(); ctx.moveTo(ax - 44, 232); ctx.lineTo(ax - 44, bc.y); ctx.lineTo(bc.x - 22, bc.y); ctx.moveTo(bc.x + 22, bc.y); ctx.lineTo(ax + 44, bc.y); ctx.lineTo(ax + 44, 232); ctx.stroke(); ctx.restore();
        /* 건전지 */
        var cg = ctx.createLinearGradient(ax - 76, 0, ax - 12, 0); cg.addColorStop(0, "#2b2f38"); cg.addColorStop(.5, "#5b6272"); cg.addColorStop(1, "#22252c");
        ctx.fillStyle = cg; ctx.beginPath(); ctx.roundRect(ax - 62, 168, 36, 52, 6); ctx.fill(); ctx.fillStyle = "#e0a030"; ctx.fillRect(ax - 62, 168, 36, 10);
        if (bright) K.glow(ctx, bc.x, bc.y, 20 + 10 * bright, "rgba(255,210,90," + (.65 * bright) + ")", 2.4);
        var gb = ctx.createRadialGradient(bc.x - 7, bc.y - 9, 2, bc.x, bc.y, 24);
        gb.addColorStop(0, bright ? "rgba(255,252,225,1)" : "rgba(255,255,255,.7)"); gb.addColorStop(1, bright ? "rgba(255,180,60," + (.45 + .5 * bright) + ")" : "rgba(170,185,205,.55)");
        ctx.fillStyle = gb; ctx.beginPath(); ctx.arc(bc.x, bc.y, 24, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(110,130,160,.7)"; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = "#8b93a3"; ctx.fillRect(bc.x - 10, bc.y + 22, 20, 12);
        K.pill(ctx, bright === 1 ? "전구가 밝게 켜짐" : (bright ? "전구가 희미하게 켜짐" : "전구가 안 켜짐"), bc.x, 82, { s: 12, a: "center", c: bright ? "#ffd35a" : "#e8ecff", box: [380, LW] });
      }
      /* ── 오른쪽 흰 판정 카드 ── */
      var RX = LW + 10, x0 = RX + 16, x1 = W - 16, n = 0, kk;
      for (kk in SUB) if (tested[kk] || (kk === sub && tool)) n++;
      K.card(ctx, RX, 0, W - RX, H, "검사 결과");
      var big = "—", subT = "도구를 고르세요", bc2 = LT.mute, tip = "지시약·마그네슘·전류", st2 = S.strong;
      if (tool === "btb") { big = k === "acid" ? "노란색" : (k === "base" ? "파란색" : "초록색"); tip = "산성 노랑·중성 초록·염기성 파랑"; }
      else if (tool === "pp") { big = k === "base" ? "붉은색" : "무색 그대로"; tip = "염기성에서만 붉은색"; }
      else if (tool === "lit") { big = k === "acid" ? "푸른 종이가 붉게" : (k === "base" ? "붉은 종이가 푸르게" : "변화 없음"); tip = "산은 푸른 종이를 붉게"; }
      else if (tool === "mg") { big = k === "acid" ? (st2 ? "기체 활발" : "기체 조금") : "변화 없음"; tip = "산의 H⁺이 전자를 받아 H₂"; }
      else if (tool) { big = k === "none" ? "전구 꺼짐" : (st2 ? "전구 밝음" : "전구 희미"); tip = "이온이 전하를 나른다"; }
      if (tool) {
        subT = tool === "pp" && k !== "base" ? "염기성은 아님" : (tool === "mg" ? (k === "acid" ? "산성 · H⁺이 있음" : "H⁺이 거의 없음") : (tool === "cur" ? (k === "none" ? "이온이 없음" : (st2 ? "이온이 많음" : "이온이 조금")) : (k === "acid" ? "산성" : (k === "base" ? "염기성" : "중성"))));
        bc2 = k === "acid" ? LT.orange : (k === "base" ? LT.blue : LT.teal);
      }
      cardBig(ctx, big, x0, 66, bc2, big.length > 7 ? 17 : 22);
      K.t(ctx, subT, x0, 94, { s: 13, w: "800", c: LT.ink });
      K.row(ctx, "병", SHORT[sub], x0, x1, 140);
      K.row(ctx, "검사한 병", Math.min(6, n) + " / 6", x0, x1, 178);
      K.bar(ctx, x0, 188, x1 - x0, Math.min(6, n) / 6, LT.teal);
      K.tip(ctx, tip, x0 - 4, 222, x1 - x0 + 8, null);
      K.t(ctx, "비커 속은 입자 모형", x0, 290, { s: 11, w: "700", c: LT.mute });
      K.t(ctx, "(물 분자는 생략)", x0, 308, { s: 11, w: "700", c: LT.mute });
      pill(ctx, x0 + 22, 342, "H⁺", "#ff7a6b"); pill(ctx, x0 + 82, 342, "OH⁻", "#4f8dff"); pill(ctx, x0 + 152, 342, "분자", "#a58cff");
      if (painting) return;
      $("b-test-info").innerHTML = tool ? "<b>" + S.name + "</b> · " + res.txt + "<br>" + S.note : "물질과 검사 도구를 하나씩 고르세요.";
    }
    function mission() {
      var n = 0, k; for (k in SUB) if (tested[k]) n++;
      put("b-m2n", n);
      if (n >= 6) done("b-m2a");
      if (sorted) done("b-m2b");
      if (n >= 6 && sorted) {
        window.sthMission("b-m2", true, "<span class='m-tag'>미션 완료</span>에탄올은 OH가 있어도 염기가 아니었고, 암모니아는 OH가 없어도 염기였습니다. 기준은 화학식이 아니라 <b>물에 녹아 내놓는 이온</b>(산은 H⁺, 염기는 OH⁻)입니다.");
        ep.clear(1);
      }
    }
    function mark() { if (tool && !tested[sub]) { tested[sub] = 1; window.sthState("tested", tested); } draw(); mission(); }
    canvas._redraw = draw;
    playBtn("b-test-play", "⏸ 거품 멈추기", "▶ 거품 보기", function () { return bubbling; }, function (x) { bubbling = x; });
    K.animate(canvas, function (dt) { if (bubbling && tool === "mg" && SUB[sub].kind === "acid") { bub += dt / 1000; painting = true; draw(); painting = false; } });
    seg("b-sub-seg", function (k) { sub = k; mark(); });
    seg("b-tool-seg", function (k) { tool = k; mark(); });
    window.sthSort({
      mount: "b-sort",
      buckets: [{ id: "acid", label: "산", sub: "물에 녹아 H⁺을 내놓는다" }, { id: "base", label: "염기", sub: "물에 녹아 OH⁻을 내놓는다" }, { id: "none", label: "어느 쪽도 아님", sub: "이온을 내놓지 않는다" }],
      items: [
        { t: "묽은 염산 HCl", a: "acid", why: "H⁺을 내놓는 산입니다." },
        { t: "식초 CH₃COOH", a: "acid", why: "약하지만 H⁺을 내놓는 산입니다.", hint: "BTB 용액의 색을 확인해 보세요." },
        { t: "수산화 나트륨 NaOH", a: "base", why: "OH⁻을 내놓는 염기입니다." },
        { t: "석회수 Ca(OH)₂", a: "base", why: "OH⁻을 내놓는 염기입니다." },
        { t: "암모니아수 NH₃", a: "base", why: "화학식에 OH가 없지만 물과 반응해 OH⁻을 만듭니다.", hint: "화학식 말고 검사 결과를 보세요. 페놀프탈레인의 색은?" },
        { t: "에탄올 C₂H₅OH", a: "none", why: "OH가 있어도 이온화하지 않습니다. 지시약의 색이 변하지 않고 전류도 흐르지 않았습니다.", hint: "화학식 말고 검사 결과를 보세요. 전류가 흘렀나요?" }
      ],
      onDone: function () { sorted = true; window.sthState("testSorted", 1); mission(); }
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("b-m2", true);
  })();

  /* 장면 3 — 이온 모형과 중화열
     1.0 M HCl 20 mL (H⁺ 8개로 표현) + 1.25 M NaOH v mL (2 mL마다 OH⁻ 1개) → 중화점 16 mL */
  function neutT(vol) { return 20 + 56000 * Math.min(0.02, 0.00125 * vol) / (4.2 * (20 + vol)); }
  (function () {
    var canvas = $("b-ion"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var vol = 0, seen = window.sthState("ionSeen") || [], st = window.sthState("ion") || { a: false, q: false };
    var PERM = []; (function () { for (var i = 0; i < 40; i++) PERM.push((i * 17 + 5) % 40); })();
    function slot(k) { var s = PERM[k]; return { x: 58 + (s % 8) * 46 + (Math.floor(s / 8) % 2) * 10, y: 162 + Math.floor(s / 8) * 44 }; }
    var BTB = { "--amber": "#f2c418", "--brand": "#2f6fe8", "--green": "#34b85a" };
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var n = vol / 2, hLeft = Math.max(0, 8 - n), ohLeft = Math.max(0, n - 8), water = Math.min(8, n), i, p, LW = 440;
      var c = hLeft > 0 ? "--amber" : (ohLeft > 0 ? "--brand" : "--green");
      K.studio(ctx, 0, 0, LW, H, null);
      /* 동그란 비커 속 이온(물 분자는 새로 생긴 것만) */
      beaker3(ctx, 222, 364, 200, 262, 236, BTB[c], .36, function () {
        for (i = 0; i < 8; i++) { p = slot(i); pill(ctx, p.x, p.y, "Cl⁻", "#d4dbe8"); }
        for (i = 0; i < 8; i++) { p = slot(8 + i); if (i < n) pill(ctx, p.x, p.y, "H₂O", "#2bb3c0"); else pill(ctx, p.x, p.y, "H⁺", "#ff7a6b"); }
        for (i = 0; i < n; i++) { p = slot(16 + i); pill(ctx, p.x, p.y, "Na⁺", "#a58cff"); }
        for (i = 0; i < ohLeft; i++) { p = slot(32 + i); pill(ctx, p.x, p.y, "OH⁻", "#4f8dff"); }
      }, 28);
      K.bigText(ctx, hLeft > 0 ? "산성 · BTB 노랑" : (ohLeft > 0 ? "염기성 · BTB 파랑" : "중성 · BTB 초록"), 18, 44, 25, hLeft > 0 ? "#ffd84a" : (ohLeft > 0 ? "#8fc0ff" : "#7ee0a0"));
      K.bigText(ctx, "HCl 20 mL + NaOH " + vol + " mL", 18, 72, 15, "#ffffff");

      /* 오른쪽 흰 카드: 온도 그래프 — 기록한 지점만 찍힌다 */
      var RX = LW + 10;
      K.card(ctx, RX, 0, W - RX, H, "혼합 용액의 온도(℃)");
      var g = K.chart(ctx, { x: RX + 6, y: 40, w: W - RX - 12, h: H - 92, pl: 46, pb: 40, pt: 12, pr: 16, x0: 0, x1: 32, y0: 18, y1: 30, xt: 4, yt: 6, xl: "넣은 NaOH 수용액(mL)", light: true });
      function gx(a) { return g.X(a); } function gy(T) { return g.Y(T); }
      var pts = seen.slice().sort(function (a, b) { return a - b; });
      if (pts.length > 1) K.plot(ctx, g, pts.map(function (a) { return [a, neutT(a)]; }), LT.orange, { w: 2.6, light: true });
      pts.forEach(function (a) { K.planet(ctx, gx(a), gy(neutT(a)), 4.2, "#ff8a3d", "#a33c06"); });
      K.line(ctx, { x: gx(vol), y: g.T }, { x: gx(vol), y: g.B }, LT.line, 1.2, [4, 4]);
      K.planet(ctx, gx(vol), gy(neutT(vol)), 6.5, "#ffffff", "#5c7086");
      K.pill(ctx, neutT(vol).toFixed(1) + "℃", clamp(gx(vol), g.L + 30, g.R - 30), gy(neutT(vol)) - 16, { s: 13, a: "center", c: "#ffffff", bg: "rgba(18,32,58,.85)", box: [RX, W] });
      K.tip(ctx, hLeft ? "H⁺ " + hLeft + "개가 남음 — 아직 중화 전" : (ohLeft ? "OH⁻ " + ohLeft + "개가 남음 — 중화점을 지남" : "H⁺ = OH⁻ — 중화점"), RX + 14, H - 46, W - RX - 28, hLeft || ohLeft ? false : true);
      $("b-ion-read").innerHTML = "<span class='k'>넣은 NaOH</span><span class='v b'>" + vol + " mL</span><span class='sub'>OH⁻ " + n + "개가 들어감</span>" +
        "<span class='k'>온도</span><span class='v y'>" + neutT(vol).toFixed(1) + "℃</span>" +
        "<span class='k'>남은 이온</span><span class='v'>H⁺ " + hLeft + " · OH⁻ " + ohLeft + "</span><span class='sub'>Na⁺ " + n + " · Cl⁻ 8 · 새로 생긴 물 " + water + "</span>" +
        "<span class='ok " + (hLeft || ohLeft ? "r" : "g") + "'>" + (hLeft ? "산성 · H⁺이 남았습니다" : (ohLeft ? "염기성 · OH⁻이 남았습니다" : "중성 · H⁺도 OH⁻도 남지 않았습니다")) + "</span>";

      var total = hLeft + ohLeft + n + 8;
      $("b-ion-info").innerHTML = "NaOH 수용액 <b>" + vol + " mL</b> (OH⁻ " + n + "개) → H⁺ " + Math.min(8, n) + "개와 만나 물 " + water + "개 생성, 온도 <b>" + neutT(vol).toFixed(1) + "℃</b>, 전체 이온 수 " + total + "개. " +
        (hLeft > 0 ? "아직 H⁺이 " + hLeft + "개 남아 <b>산성</b>입니다. Na⁺은 반응에 끼지 않고 그대로 남는 구경꾼 이온입니다." :
          (ohLeft > 0 ? "H⁺이 모두 없어져 더는 물이 생기지 않습니다. 남는 OH⁻ " + ohLeft + "개 때문에 <b>염기성</b>입니다. 열은 더 나오지 않는데 20℃의 용액만 늘어나 온도가 내려갑니다." :
            "H⁺ 8개와 OH⁻ 8개가 <b>1:1로 모두 반응</b>했습니다. 여기가 <b>중화점</b>입니다. 남은 것은 Na⁺과 Cl⁻뿐이고, 물을 증발시키면 이들이 염화 나트륨, 곧 <b>염</b>으로 남습니다."));
    }
    function mission() {
      put("b-m3n", Math.min(7, seen.length));
      var both = seen.some(function (a) { return a < 16; }) && seen.some(function (a) { return a > 16; });
      if (st.a) done("b-m3a");
      if (seen.length >= 7 && both) done("b-m3b");
      if (st.q) done("b-m3c");
      if (st.a && seen.length >= 7 && both && st.q) {
        window.sthMission("b-m3", true, "<span class='m-tag'>미션 완료</span>중화점은 <b>16 mL</b>. H⁺과 OH⁻이 1:1로 만나 물이 되고, 반응한 수가 가장 많은 중화점에서 온도가 가장 높습니다(약 27.4℃).");
        ep.clear(2);
      }
    }
    function visit() {
      var ch = false;
      if (seen.indexOf(vol) < 0) { seen.push(vol); window.sthState("ionSeen", seen); ch = true; }
      if (vol === 16 && !st.a) { st.a = true; window.sthState("ion", st); ch = true; }
      if (ch) mission();
    }
    canvas._redraw = draw;
    $("b-v").addEventListener("input", function (e) { vol = +e.target.value; $("b-v-val").textContent = vol + " mL"; visit(); draw(); });
    window.sthPick({
      mount: "b-q3",
      q: "그래프에서 온도가 가장 높은 곳은 어디이고, 그 까닭은 무엇일까요?",
      options: ["염기를 가장 많이 넣은 32 mL — 염기를 많이 넣을수록 열이 많이 나므로", "중화점인 16 mL — 반응한 H⁺과 OH⁻의 수가 가장 많으므로", "아무것도 넣지 않은 0 mL — 산이 가장 진하므로", "어디서나 같다 — 중화 반응은 온도를 바꾸지 않으므로"],
      answer: 1,
      why: ["16 mL를 넘으면 반응할 H⁺이 없어 열이 더 나오지 않습니다. 그래프의 오른쪽을 다시 보세요.", "중화열은 H⁺과 OH⁻이 만나 물이 될 때 나옵니다. 중화점 뒤로는 더 반응할 H⁺이 없고 식은 용액만 더해집니다.", "산만 있을 때는 반응이 일어나지 않아 20℃ 그대로입니다.", "온도계는 20℃에서 27℃ 넘게 올라갔습니다. 중화 반응은 열을 내놓습니다."],
      onDone: function () { st.q = true; window.sthState("ion", st); mission(); }
    });
    visit(); draw(); mission();
    if (ep.cleared(2)) window.sthMission("b-m3", true);
  })();

  /* 장면 4 — 시험 수조 : pH 4.0 호수 물 1,000 L (H⁺ 0.1 mol) + Ca(OH)₂ m g (74 g/mol, OH⁻ 2개) */
  function lakePH(m) {
    var c = (0.1 - 2 * m / 74) / 1000, h = (c + Math.sqrt(c * c + 4e-14)) / 2;
    return -Math.log(h) / Math.LN10;
  }
  (function () {
    var canvas = $("b-lake"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var m = 0, tries = window.sthState("lakeTries") || [], st = window.sthState("lake") || { a: false, q: false };
    var swim = 0, swimming = !REDUCE;
    function fishAt(x, y, s, dir, a) {
      ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.globalAlpha = a;
      var g = ctx.createLinearGradient(0, -9, 0, 9); g.addColorStop(0, "#cfe8ff"); g.addColorStop(.5, "#7fb6e6"); g.addColorStop(1, "#3d6f9e");
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 18, 8, 0, 0, 6.2832); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-27, -8); ctx.lineTo(-25, 0); ctx.lineTo(-27, 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#0b1a2a"; ctx.beginPath(); ctx.arc(10, -2, 1.8, 0, 6.2832); ctx.fill();
      ctx.restore();
    }
    /* ── 호수 블록 모형: 앞면은 호수 한가운데를 자른 단면(물·호수 바닥·흙), 윗면은 호숫가 숲과 물 ── */
    var I = K.iso({ ox: 262, oy: 172, s: 0.8, L: 360, D: 250 }), LL = I.L, DD = I.D, ZG = 110, ZW = 100;
    var LCX = LL * 0.5, LCY = DD * 0.76, LRX = LL * 0.36, LRY = DD * 0.42;
    var off = null, offKey = null, ph = 0;
    function sm(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
    function rr(x, y) { var a = (x - LCX) / LRX, b = (y - LCY) / LRY; return Math.sqrt(a * a + b * b); }
    function zTop(x, y) {
      var r = rr(x, y), g = ZG + 3 * Math.sin(x / 23) * Math.cos(y / 17);
      if (r >= 1) return g;
      return g - 20 * sm((1 - r) / 0.14) - 44 * sm((1 - r) / 0.7);
    }
    function mixH(a, b, t, f) { var p = rgbOf(a), q = rgbOf(b), o = [], i; for (i = 0; i < 3; i++) o.push(clamp(Math.round((p[i] + (q[i] - p[i]) * clamp(t, 0, 1)) * (f || 1)), 0, 255)); return "rgb(" + o.join(",") + ")"; }
    /* 물 색: 산성 호수는 플랑크톤이 없어 유난히 맑은 청록, 중성은 생물이 사는 푸른 초록, 소석회가 넘치면 뿌연 하늘색 */
    function waterHex(p) {
      if (p < 6.5) return [mixH("#8fe3dc", "#4fb0b8", (p - 4) / 2.5), "#bfe9e2"];
      if (p <= 8.5) return [mixH("#4fb0b8", "#3a8fae", (p - 6.5) / 2), "#2b6f8f"];
      return [mixH("#3a8fae", "#b9d9e8", (p - 8.5) / 2.5), "#9cc6da"];
    }
    function colTop(x, y, z, lt, p) {
      var zt = zTop(x, y);
      if (zt < ZW - 0.2) {
        var d = clamp((ZW - zt) / 60, 0, 1), w = waterHex(p);
        return p < 6.5 ? mixH("#d8cfae", w[0], 0.35 + 0.6 * d, 1.02) : mixH(w[0], w[1], d * 0.8, 1);
      }
      if (zt < ZW + 4) return K.tint("#cdbb98", lt);
      return mixH("#6fae4f", "#4c8a3a", 0.5 + 0.5 * Math.sin(x / 19 + y / 13), lt);
    }
    var TREES = (function () { var R = K.rng(52), out = [], n = 0; while (out.length < 22 && n < 4000) { n++; var x = 10 + R() * (LL - 20), y = 8 + R() * (DD - 16); if (rr(x, y) > 1.12 && !(x < 90 && y < 70)) out.push([x, y]); } return out.sort(function (a, b) { return (a[0] + a[1]) - (b[0] + b[1]); }); })();
    var FISH = [[-0.22, .55, .9], [-0.08, .3, 1.1], [0.06, .62, 1.3], [0.18, .35, .8], [-0.15, .8, 1.2]];
    function front(u) { return zTop(u, DD); }
    function paintBlock(p) {
      var dpr = canvas.width / W;
      if (!off) off = document.createElement("canvas");
      off.width = canvas.width; off.height = canvas.height;
      var c0 = ctx; ctx = off.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      var fc = I.P(LL / 2, DD / 2, 0);
      K.studio(ctx, 0, 0, 560, H, { x: fc.x + 10, y: fc.y + 56, rx: 250, ry: 70 });
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, 560, H, 14); ctx.clip();
      /* 앞면: 흙·호수 바닥 단면 + 물 단면 */
      I.face(ctx, "front", function (Lw) {
        ctx.save(); I.profile(ctx, "front", front, 0); ctx.clip();
        var bands = [[0, 34, "#7d7f86"], [34, 72, "#a5865f"], [72, 96, "#8a6a45"], [96, 130, "#5a4330"]];
        bands.forEach(function (b) { ctx.fillStyle = b[2]; ctx.fillRect(0, b[0], Lw, b[1] - b[0]); });
        var R = K.rng(9); ctx.fillStyle = "rgba(255,240,220,.22)";
        for (var i = 0; i < 220; i++) ctx.fillRect(R() * Lw, R() * 100, 1.6, 1.6);
        ctx.fillStyle = "rgba(40,30,20,.25)"; for (i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(R() * Lw, R() * 30, 2 + R() * 3, 0, 6.283); ctx.fill(); }
        ctx.restore();
        var u, w = waterHex(p);
        ctx.beginPath(); ctx.moveTo(0, ZW);
        for (u = 0; u <= Lw; u += 3) ctx.lineTo(u, Math.min(front(u), ZW));
        ctx.lineTo(Lw, ZW); ctx.closePath();
        var wg = ctx.createLinearGradient(0, ZW, 0, ZW - 60); wg.addColorStop(0, rgba(w[0], .78)); wg.addColorStop(1, rgba(w[1], .92));
        ctx.fillStyle = wg; ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.4; ctx.beginPath();
        var on = false; for (u = 0; u <= Lw; u += 3) { if (front(u) < ZW) { if (!on) ctx.moveTo(u, ZW); else ctx.lineTo(u, ZW); on = true; } } ctx.stroke();
      });
      I.face(ctx, "right", function (Lw) {
        ctx.save(); I.profile(ctx, "right", function (u) { return zTop(LL, u); }, 0); ctx.clip();
        [[0, 34, "#6f7178"], [34, 72, "#957853"], [72, 96, "#7b5e3d"], [96, 130, "#4f3b2a"]].forEach(function (b) { ctx.fillStyle = b[2]; ctx.fillRect(0, b[0], Lw, b[1] - b[0]); });
        ctx.restore();
      });
      I.shade(ctx, "right", function (u) { return zTop(LL, u); });
      I.field(ctx, function (x, y) { return Math.max(zTop(x, y), ZW); }, function (x, y, z, lt) { return colTop(x, y, z, lt, p); }, 54, 38);
      I.edges(ctx, ZG, ZG);
      I.house(ctx, 26, 20, zTop(40, 30), 30, 22, 16, "#b8402e");
      TREES.forEach(function (t, i) { I.tree(ctx, t[0], t[1], zTop(t[0], t[1]), 0.9 + (i % 3) * 0.15); });
      /* 산성비를 내린 먼 굴뚝 */
      I.box(ctx, LL - 40, 14, zTop(LL - 30, 20), LL - 30, 24, zTop(LL - 30, 20) + 52, "#c9ced6", "#a7aeb9", "#878f9c");
      ctx.restore();
      ctx = c0;
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var pH = lakePH(m), i, LW = 560, ok = pH >= 6.5 && pH <= 8.5, key = Math.round(pH * 20);
      if (key !== offKey || !off || off.width !== canvas.width) { paintBlock(pH); offKey = key; }
      ctx.drawImage(off, 0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.roundRect(0, 0, LW, H, 14); ctx.clip();
      /* 굴뚝 연기 */
      var ch = I.P(LL - 35, 19, zTop(LL - 30, 20) + 52);
      for (i = 0; i < 5; i++) { var tt = (swim * 0.25 + i / 5) % 1; ctx.fillStyle = "rgba(110,115,125," + (0.45 * (1 - tt)).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(ch.x + tt * 26, ch.y - 6 - tt * 34, 4 + tt * 9, 0, 6.283); ctx.fill(); }
      /* 물결 */
      ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.lineWidth = 1;
      for (i = 0; i < 12; i++) {
        var gx = LCX - LRX * .7 + ((i * .37 + swim * .02) % 1) * LRX * 1.4, gy = LCY - LRY * .6 + ((i * .61) % 1) * LRY * .9;
        if (rr(gx, gy) > .85 || gy > DD - 4) continue;
        var s1 = I.P(gx - 8, gy, ZW), s2 = I.P(gx + 7, gy, ZW);
        ctx.beginPath(); ctx.moveTo(s1.x, s1.y); ctx.quadraticCurveTo((s1.x + s2.x) / 2, s1.y - 2.5, s2.x, s2.y); ctx.stroke();
      }
      /* 앞면 단면 속 물고기 */
      var fish = ok ? 5 : ((pH >= 5.5 && pH <= 9.2) ? 1 : 0);
      for (i = 0; i < fish; i++) {
        var f = FISH[i], fp = swim * (.6 + i * .11) + i * 1.7, u = LCX + f[0] * LL + Math.sin(fp) * 14, bed = front(u), z = bed + 6 + (ZW - bed - 12) * f[1], q = I.P(u, DD, z);
        if (ZW - bed < 14) continue;
        fishAt(q.x, q.y + Math.sin(fp * 2) * 1.5, 0.55 * f[2], Math.cos(fp) >= 0 ? 1 : -1, ok ? 1 : .55);
      }
      /* 소석회를 뿌리는 배 */
      var bx = LCX - 20, by = LCY - 16, bz = ZW + 0.6 * Math.sin(swim * 3);
      if (m > 0) {
        var milk = I.P(bx + 30, by + 4, ZW), mr = 14 + m * 6;
        var mg = ctx.createRadialGradient(milk.x, milk.y, 2, milk.x, milk.y, mr); mg.addColorStop(0, "rgba(255,255,255," + Math.min(.6, m * .09).toFixed(3) + ")"); mg.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = mg; ctx.beginPath(); ctx.ellipse(milk.x, milk.y, mr, mr * .5, 0, 0, 6.283); ctx.fill();
      }
      I.box(ctx, bx - 16, by - 6, bz, bx + 16, by + 6, bz + 6, "#f3efe6", "#e06a2c", "#b0501f");
      I.box(ctx, bx - 12, by - 4, bz + 6, bx + 2, by + 4, bz + 15, "#ffffff", "#e9ecf1", "#b9c0cc");
      var arm0 = I.P(bx + 10, by, bz + 10), arm1 = I.P(bx + 34, by + 4, bz + 18);
      ctx.strokeStyle = "#5b6272"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(arm0.x, arm0.y); ctx.lineTo(arm1.x, arm1.y); ctx.stroke();
      var nP = Math.round(m * 6);
      for (i = 0; i < nP; i++) {
        var t2 = (swim * 0.9 + i / Math.max(1, nP)) % 1, pp = I.P(bx + 34 + (i % 5) * 3 - 6, by + 4 + ((i * 7) % 9) - 4, bz + 18 - t2 * 18);
        ctx.fillStyle = "rgba(255,255,255," + (0.95 - 0.5 * t2).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(pp.x + t2 * 6, pp.y, 1.6 + t2 * 1.8, 0, 6.283); ctx.fill();
        ctx.fillStyle = "rgba(120,130,150,.35)"; ctx.beginPath(); ctx.arc(pp.x + t2 * 6 + .6, pp.y + .6, .7, 0, 6.283); ctx.fill();
      }
      ctx.restore();
      var BX = [0, LW];
      I.label(ctx, bx + 34, by + 4, bz + 18, m > 0 ? "소석회 Ca(OH)₂ 뿌리기" : "소석회를 실은 배", 40, -40, "#ffffff", BX);
      if (fish) I.label(ctx, LCX - 0.08 * LL, DD, front(LCX) + 30, ok ? "물고기가 돌아옴" : "겨우 버티는 물고기", -60, 70, "#bfe8ff", BX);
      else I.label(ctx, LCX - 0.1 * LL, DD, front(LCX - 0.1 * LL) + 6, "텅 빈 호수 바닥", -60, 72, "#ffe1c9", BX);
      I.label(ctx, LL - 35, 19, zTop(LL - 30, 20) + 40, "산성비의 원인(굴뚝)", 26, -20, "#e8ecf4", BX);
      K.bigText(ctx, pH < 6.5 ? "아직 산성 — 물고기가 못 산다" : (ok ? "물고기가 돌아왔다" : "소석회가 너무 많다"), 18, 44, 25, pH < 6.5 ? "#ffffff" : (ok ? "#7ee0a0" : "#d9c8ff"));
      K.bigText(ctx, "물 1 m³(1,000 L)마다 소석회 " + m.toFixed(1) + " g", 18, 72, 15, "#ffd35a");
      K.warn(ctx, LW - 12, H - 14, "⚠ 깊이·크기는 보기 쉽게 과장", "right");
      /* ── 오른쪽 흰 판정 카드: pH 와 지나온 pH 곡선 ── */
      var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "판정 — 호숫물 pH");
      cardBig(ctx, "pH " + pH.toFixed(2), x0, 68, ok ? LT.green : (pH < 6.5 ? LT.orange : LT.violet), 28);
      K.t(ctx, pH < 6.5 ? "산성" : (pH > 8.5 ? "염기성이 너무 강함" : (pH > 7.5 ? "약한 염기성" : "거의 중성")), x1, 66, { s: 13, w: "800", a: "right", c: LT.mute });
      var g = K.chart(ctx, { x: RX + 6, y: 92, w: W - RX - 12, h: 270, pl: 40, pb: 40, pt: 12, pr: 14, x0: 0, x1: 8, y0: 0, y1: 14, xt: 4, yt: 7, xl: "넣은 소석회 (g)", yl: "pH", light: true });
      ctx.fillStyle = "rgba(15,159,118,.14)"; ctx.fillRect(g.L, g.Y(8.5), g.R - g.L, g.Y(6.5) - g.Y(8.5));
      K.t(ctx, "물고기가 사는 pH 6.5~8.5", g.R - 4, g.Y(8.5) - 6, { s: 10.5, w: "800", a: "right", c: LT.green });
      var pts = [];
      for (var a2 = 0; a2 <= m + 1e-9; a2 += 0.02) pts.push([a2, lakePH(a2)]);
      pts.push([m, pH]);
      if (pts.length > 1) K.plot(ctx, g, pts, LT.teal, { w: 3, light: true });
      K.planet(ctx, g.X(m), g.Y(pH), 6, "#ff9a4d", "#a33c06");
      K.t(ctx, "지나온 구간만 그려집니다", x0, 382, { s: 11, w: "700", c: LT.mute });
      K.tip(ctx, ok ? "H⁺과 OH⁻의 수가 맞았다" : (pH < 6.5 ? "H⁺이 아직 많다 — 더 넣기" : "OH⁻이 남았다 — 너무 많음"), x0 - 4, 398, x1 - x0 + 8, ok);
    }
    function report() {
      var rows = tries.slice(-5).map(function (t) { return "소석회 " + t.m.toFixed(1) + " g → pH " + t.p.toFixed(2) + " " + (t.ok ? "✅ 물고기가 자리를 잡았습니다" : (t.p < 6.5 ? "❌ 아직 산성입니다" : "❌ 염기성이 너무 강합니다")); });
      $("b-lake-info").innerHTML = rows.length ? "<b>작전 기록</b><br>" + rows.join("<br>") : "소석회 양을 정하고 확정하세요. 여러 번 시도할 수 있습니다.";
    }
    function mission() {
      if (st.a) done("b-m4a"); if (st.q) done("b-m4b");
      if (st.a && st.q) {
        window.sthMission("b-m4", true, "<span class='m-tag'>미션 완료</span>수조 1,000 L에 소석회 약 <b>3.7 g</b>, 호수 전체에는 약 <b>7.4 t</b>. 중화점 근처에서는 0.1 g 차이로도 pH가 크게 달라졌습니다. H⁺의 수와 OH⁻의 수를 <b>맞추는 것</b>이 중화 작전의 핵심입니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    playBtn("b-lake-play", "⏸ 물고기 멈추기", "▶ 물고기 움직이기", function () { return swimming; }, function (x) { swimming = x; });
    K.animate(canvas, function (dt) { if (swimming) { swim += dt / 1000; draw(); } });
    $("b-m").addEventListener("input", function (e) { m = +e.target.value; $("b-m-val").textContent = m.toFixed(1) + " g"; draw(); });
    $("b-go").addEventListener("click", function () {
      var p = lakePH(m), ok = p >= 6.5 && p <= 8.5;
      tries.push({ m: m, p: p, ok: ok }); window.sthState("lakeTries", tries.slice(-8));
      if (ok) { st.a = true; window.sthState("lake", st); window.sthState("lakeBest", "소석회 " + m.toFixed(1) + " g → pH " + p.toFixed(1)); }
      report(); mission();
    });
    window.sthPick({
      mount: "b-q4",
      q: "수조의 물 1,000 L(= 1 m³)를 정확히 중화하는 데 소석회 3.7 g이 필요했습니다. 호수 전체의 물이 약 200만 m³라면 소석회는 모두 얼마나 필요할까요?",
      options: ["약 0.74 t", "약 7.4 t", "약 74 t", "약 740 t"],
      answer: 1,
      why: ["3.7 g × 2,000,000을 다시 계산해 보세요.", "3.7 g × 2,000,000 = 7,400,000 g = 7.4 t. 없애야 할 H⁺의 수가 물의 양에 비례하므로 필요한 OH⁻의 수도 비례합니다.", "자릿수를 다시 확인하세요. 1 t은 1,000,000 g입니다.", "자릿수를 다시 확인하세요. 1 t은 1,000,000 g입니다."],
      onDone: function () { st.q = true; window.sthState("lake", st); mission(); }
    });
    draw(); report(); mission();
    if (ep.cleared(3)) window.sthMission("b-m4", true);
  })();

  /* 장면 5 — 생활 속 중화 + 결말 */
  function reveal() {
    $("b-end").hidden = false;
    var p = window.sthState("acidbase") || "";
    $("b-vs").innerHTML = "<b>나의 첫 판단</b> " + (p || "기록 없음") + (p.indexOf("㉡") === 0 ? " — 정확했습니다. 검사대가 그 증거입니다." : " — 검사대에서 확인했듯 에탄올은 OH⁻을 내놓지 않으므로 염기가 아닙니다.") +
      "<br><b>나의 중화 작전</b> " + (window.sthState("lakeBest") || "-") + " (수조 1,000 L 기준)";
  }
  function finish() { window.sthState("r2", "해결 · 에탄올은 염기가 아님 · 중화점 16 mL에서 최고 27.4℃ · " + (window.sthState("lakeBest") || "-")); }
  window.sthSort({
    mount: "b-life",
    buckets: [{ id: "b", label: "염기성 물질을 쓴다", sub: "문제의 원인이 산성" }, { id: "a", label: "산성 물질을 쓴다", sub: "문제의 원인이 염기성" }],
    items: [
      { t: "위산(염산)이 너무 많이 나와 속이 쓰리다", a: "b", why: "수산화 마그네슘 같은 약한 염기가 든 제산제를 먹습니다." },
      { t: "생선을 손질한 도마에서 비린내가 난다", a: "a", why: "비린내의 원인 물질은 염기성입니다. 레몬즙이나 식초(산)로 중화합니다.", hint: "생선회에 레몬즙을 뿌리는 까닭을 떠올려 보세요." },
      { t: "산성화된 밭에서 작물이 잘 자라지 않는다", a: "b", why: "호수와 마찬가지로 석회 가루(염기성)를 뿌립니다." },
      { t: "벌레에 물린 자리가 산성 물질 때문에 따갑다", a: "b", why: "묽은 암모니아수가 든 약(염기성)을 바릅니다." },
      { t: "식사 뒤 입속 세균이 만든 산이 치아를 상하게 한다", a: "b", why: "치약에는 약한 염기성 물질이 들어 있습니다." },
      { t: "염기성인 비누로 감은 머리카락이 뻣뻣하다", a: "a", why: "식초나 구연산을 탄 물(산성)로 헹굽니다.", hint: "문제를 일으킨 비누가 염기성입니다." },
      { t: "공장 굴뚝에서 산성 기체인 이산화 황이 나온다", a: "b", why: "산화 칼슘 같은 염기성 물질로 걸러 냅니다. 산성비를 줄이는 방법이기도 합니다." },
      { t: "김치가 너무 시어졌다", a: "b", why: "신맛은 산 때문입니다. 탄산수소 나트륨(소다)을 조금 넣으면 신맛이 줄어듭니다." }
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "b-wk", unitLabel: "[통합과학2 Ⅰ-2] 이야기 ② 물고기가 사라진 호수",
    items: [
      { id: "w2", label: "산과 염기를 가르는 진짜 기준", hint: "에탄올이 왜 염기가 아닌지, 오개념 상자와 검사대의 결과(지시약, 전류)를 근거로 쓰세요. 암모니아의 경우도 함께 쓰면 더 좋습니다." },
      { id: "b2", label: "중화점에서 온도가 가장 높은 까닭", hint: "이온 모형에서 센 H⁺, OH⁻, 물 분자의 수를 근거로 설명하고, 내가 아는 생활 속 중화 반응의 예를 하나 덧붙이세요." }
    ]
  });
})();

/* =========================================================================
   이야기 ③ 불 없이 따뜻하게, 얼음 없이 차갑게
   ========================================================================= */
(function () {
  var ep = window.sthStory({ root: "ep3", key: "ep3", name: "사건 파일 ③", onDone: finish });

  window.sthGate({
    gate: "c-gate", key: "p3", title: "설계자의 첫 추리",
    question: "냉찜질 팩이 차가워질 때, 팩 속에서는 무슨 일이 일어나고 있을까요?",
    options: ["㉠ 팩 속 물질이 ‘냉기’를 만들어 밖으로 내보낸다", "㉡ 팩 속에서 일어나는 변화가 주변의 열을 흡수한다", "㉢ 팩 속의 에너지가 사라져 없어진다"],
    onPick: function () { ep.clear(0); }
  });

  /* 장면 2 — 에너지 장부 */
  (function () {
    var canvas = $("c-energy"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var RX = {
      ch4: { name: "메테인의 연소", eq: "CH₄ + 2O₂ → CO₂ + 2H₂O", dH: -890, per: "메테인 1몰이 탈 때", gap: 150 },
      fe:  { name: "철 가루의 산화", eq: "2Fe + 3/2 O₂ → Fe₂O₃", dH: -824, per: "산화 철(Ⅲ) 1몰이 생길 때", gap: 140 },
      an:  { name: "질산 암모늄의 용해", eq: "NH₄NO₃(고체) → NH₄⁺ + NO₃⁻ (수용액)", dH: 26, per: "질산 암모늄 1몰이 녹을 때", gap: -70 }
    };
    var type = "ch4", prog = 0, st = window.sthState("energy") || { a: false, b: false, q: false };

    /* 버너·손난로 주머니·비커 미니어처 */
    function burner(cx, yb, p) {
      floorShadow(ctx, cx + 8, yb + 6, 70, 16, .3);
      var bg = ctx.createLinearGradient(cx - 52, 0, cx + 52, 0); bg.addColorStop(0, "#5b6272"); bg.addColorStop(.45, "#c3cad3"); bg.addColorStop(1, "#4d5460");
      ctx.fillStyle = bg; ell(ctx, cx, yb, 52, 13); ctx.fill(); ctx.fillRect(cx - 52, yb - 12, 104, 12); ell(ctx, cx, yb - 12, 52, 13); ctx.fillStyle = "#dfe4ea"; ctx.fill();
      var tg = ctx.createLinearGradient(cx - 13, 0, cx + 13, 0); tg.addColorStop(0, "#6d7682"); tg.addColorStop(.4, "#e8ecf2"); tg.addColorStop(1, "#5b6272");
      ctx.fillStyle = tg; ctx.fillRect(cx - 13, yb - 150, 26, 140); ctx.fillStyle = "#3d434c"; ell(ctx, cx, yb - 150, 13, 4); ctx.fill();
      ctx.fillStyle = "#e0a030"; ctx.beginPath(); ctx.roundRect(cx + 12, yb - 60, 34, 10, 4); ctx.fill();
      if (p > 0) {
        var fl = 1 + .08 * Math.sin(Date.now() / 90), fh = (40 + 70 * p) * fl;
        K.glow(ctx, cx, yb - 150 - fh * .5, 14 + 16 * p, "rgba(255,190,90,.5)", 2.6);
        var g = ctx.createLinearGradient(0, yb - 150, 0, yb - 150 - fh); g.addColorStop(0, "rgba(70,120,255,.95)"); g.addColorStop(.5, "rgba(120,190,255,.75)"); g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - 12, yb - 150); ctx.quadraticCurveTo(cx - 16, yb - 150 - fh * .5, cx, yb - 150 - fh); ctx.quadraticCurveTo(cx + 16, yb - 150 - fh * .5, cx + 12, yb - 150); ctx.closePath(); ctx.fill();
      }
    }
    function pouch(cx, yb, p) {
      var w = 190, h = 120, x = cx - w / 2, y = yb - h - 14;
      floorShadow(ctx, cx + 10, yb, 120, 18, .3);
      if (p > 0) K.glow(ctx, cx, y + h / 2, 40 + 30 * p, "rgba(255,150,60," + (.25 + .3 * p).toFixed(3) + ")", 2.2);
      ctx.fillStyle = "#c8ccd4"; ctx.beginPath(); ctx.moveTo(x + w, y + 10); ctx.lineTo(x + w + 16, y); ctx.lineTo(x + w + 16, y + h - 10); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
      var fg = ctx.createLinearGradient(x, y, x, y + h); fg.addColorStop(0, "#ffffff"); fg.addColorStop(1, "#dfe3ea");
      ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(x, y + 10, w, h - 10, 14); ctx.fill();
      ctx.strokeStyle = "rgba(110,130,160,.55)"; ctx.lineWidth = 1.5; ctx.stroke();
      /* 잘라 보인 속: 철 가루(산화되면 붉은 갈색) */
      var cut = { x: x + w * .38, y: y + 26, w: w * .52, h: h - 34 };
      ctx.fillStyle = "#2f3138"; ctx.beginPath(); ctx.roundRect(cut.x, cut.y, cut.w, cut.h, 8); ctx.fill();
      var R = K.rng(5), i;
      for (i = 0; i < 90; i++) { var gx = cut.x + 4 + R() * (cut.w - 8), gy = cut.y + 4 + R() * (cut.h - 8), rust = R() < p; ctx.fillStyle = rust ? "#b0553a" : (R() < .25 ? "#15161a" : "#7d838e"); ctx.beginPath(); ctx.arc(gx, gy, 1.6 + R() * 1.6, 0, 6.283); ctx.fill(); }
      ctx.fillStyle = "rgba(90,110,140,.7)";
      for (i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(x + 18 + (i % 2) * 22, y + 30 + Math.floor(i / 2) * 18, 2.4, 0, 6.283); ctx.fill(); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var R = RX[type], exo = R.dH < 0, p = prog / 100, LW = 540, c = exo ? "#e8590c" : "#1c7ed6", i;
      K.studio(ctx, 0, 0, LW, H, null);
      var ox = 220, oyb = 340;
      if (type === "ch4") burner(ox, oyb, p);
      else if (type === "fe") pouch(ox, oyb, p);
      else {
        beaker3(ctx, ox, oyb, 110, 170, 128, "#a9cfee", .22, function (yl) {
          var R2 = K.rng(13), n = Math.round(26 * (1 - p));
          for (i = 0; i < n; i++) { var gx = ox - 70 + R2() * 140, gy = oyb - 8 - R2() * 16; ctx.fillStyle = "#ffffff"; ctx.strokeStyle = "rgba(120,140,170,.6)"; ctx.lineWidth = .8; ctx.beginPath(); ctx.rect(gx, gy, 6, 5); ctx.fill(); ctx.stroke(); }
          var m2 = Math.round(18 * p);
          for (i = 0; i < m2; i++) { var px = ox - 80 + ((i * 37) % 160), py = yl + 20 + ((i * 23) % 90); K.planet(ctx, px, py, 4.2, i % 2 ? "#ffb35c" : "#b69cff", i % 2 ? "#9a4a10" : "#4a3a90"); }
        }, 24);
        if (p > .3) { ctx.fillStyle = "rgba(255,255,255," + ((p - .3) * .8).toFixed(3) + ")"; for (i = 0; i < 26; i++) { ctx.beginPath(); ctx.arc(ox - 104 + (i % 2) * 6, oyb - 150 + i * 6, 2.2, 0, 6.283); ctx.arc(ox + 104 - (i % 2) * 6, oyb - 150 + i * 6, 2.2, 0, 6.283); ctx.fill(); } }
      }
      /* 주변 온도계와 열의 흐름 */
      var level0 = 0.5 + (exo ? 0.38 : -0.32) * p, tx = 470;
      thermo3(ctx, tx, 128, 320, level0, exo ? "#ff6b4a" : "#4f8dff");
      if (p > 0) {
        var aw = 2 + 5 * p;
        for (i = 0; i < 3; i++) {
          var yy = 190 + i * 40, a0 = { x: ox + 130, y: yy }, a1 = { x: tx - 32, y: yy };
          if (exo) K.arrow(ctx, a0, a1, c, aw, 10 + 4 * p); else K.arrow(ctx, a1, a0, c, aw, 10 + 4 * p);
        }
        K.pill(ctx, exo ? "열을 주변으로 방출" : "주변의 열을 흡수", (ox + tx) / 2 + 40, 172, { s: 12, a: "center", c: exo ? "#ffd0a8" : "#cfe4ff", box: [0, LW] });
      }
      K.pill(ctx, "주변 온도 " + (p === 0 ? "그대로" : (exo ? "상승 ↑" : "하강 ↓")), tx, 382, { s: 12, a: "center", c: "#ffffff", box: [0, LW] });
      K.bigText(ctx, p === 0 ? "반응 전" : (exo ? "발열 반응" : "흡열 반응"), 18, 46, 28, p === 0 ? "#ffffff" : (exo ? "#ffb35c" : "#8fc0ff"));
      K.bigText(ctx, R.name + " · 진행 " + prog + "%", 18, 76, 16, "#ffd35a");
      /* ── 오른쪽 흰 카드: 에너지 장부(에너지 높이 그림) ── */
      var SX = LW + 12, X0 = SX + 44, X1 = W - 18, Y0 = 52, Y1 = 318;
      K.card(ctx, SX, 0, W - SX, H, "에너지 장부 — 물질이 가진 에너지");
      ctx.strokeStyle = LT.line; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X0, Y0); ctx.lineTo(X0, Y1); ctx.lineTo(X1, Y1); ctx.stroke();
      K.t(ctx, "에너지", X0 - 6, Y0 + 14, { s: 11, w: "700", a: "right", c: LT.mute });
      K.t(ctx, "반응의 진행 →", X1, Y1 + 15, { s: 11, w: "700", a: "right", c: LT.mute });
      var mid = 190, ry = mid - R.gap / 2, py = mid + R.gap / 2, la = X0 + 14, lb = X0 + 104, lc = X1 - 104, ld = X1 - 14;
      function slab(xa, xb, yy, col2) { var g = ctx.createLinearGradient(0, yy - 6, 0, yy + 6); g.addColorStop(0, shade(col2, 1.25)); g.addColorStop(1, shade(col2, .7)); ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(xa, yy - 5, xb - xa, 10, 5); ctx.fill(); }
      slab(la, lb, ry, "#5c7086"); slab(lc, ld, py, c);
      K.t(ctx, "반응물", (la + lb) / 2, ry - 12, { s: 12.5, w: "900", a: "center", c: LT.ink });
      K.t(ctx, "생성물", (lc + ld) / 2, py - 12, { s: 12.5, w: "900", a: "center", c: c });
      ctx.save(); ctx.strokeStyle = c; ctx.lineWidth = 2.4; ctx.setLineDash([6, 5]); ctx.beginPath();
      for (i = 0; i <= 40; i++) { var xx = lerp(lb, lc, i / 40), yv = lerp(ry, py, (1 - Math.cos(Math.PI * i / 40)) / 2); if (i === 0) ctx.moveTo(xx, yv); else ctx.lineTo(xx, yv); }
      ctx.stroke(); ctx.restore();
      var bx2 = lerp((la + lb) / 2, (lc + ld) / 2, p), t2 = clamp((bx2 - lb) / (lc - lb), 0, 1), by2 = bx2 < lb ? ry : (bx2 > lc ? py : lerp(ry, py, (1 - Math.cos(Math.PI * t2)) / 2));
      K.planet(ctx, bx2, by2 - 11, 7, exo ? "#ff9a4d" : "#6aa8ff", exo ? "#a33c06" : "#1d4f9a");
      var ax2 = (lb + lc) / 2;
      ctx.fillStyle = rgba(c, .12); ctx.fillRect(ax2 - 13, Math.min(ry, py), 26, Math.abs(py - ry));
      K.arrow(ctx, { x: ax2, y: ry }, { x: ax2, y: py + (exo ? -2 : 2) }, c, 2.6, 10);
      K.t(ctx, (exo ? "방출 " : "흡수 ") + Math.abs(R.dH) + " kJ", ax2 + 18, mid + 5, { s: 13, w: "900", c: c });
      K.t(ctx, R.eq, (SX + W) / 2, 354, { s: 11.5, w: "800", a: "center", c: LT.ink });
      K.tip(ctx, exo ? "생성물이 더 낮다 → 남는 만큼 열로 나옴" : "생성물이 더 높다 → 모자란 만큼 흡수", SX + 14, 362, W - SX - 28, exo ? true : null);
      $("c-energy-info").innerHTML = "<b>" + R.name + "</b> (" + R.per + " " + Math.abs(R.dH) + " kJ " + (exo ? "방출" : "흡수") + ") · 진행률 " + prog + "% → 지금까지 <b>" + (Math.abs(R.dH) * p).toFixed(exo ? 0 : 1) + " kJ</b>을 " +
        (exo ? "주변으로 <b>방출</b>했습니다. 생성물의 에너지가 반응물보다 낮아, 그 차이만큼이 열로 나와 주변 온도가 올라갑니다 — <b>발열 반응</b>." :
          "주변에서 <b>흡수</b>했습니다. 생성물의 에너지가 반응물보다 높아, 모자라는 만큼을 주변에서 가져와 주변 온도가 내려갑니다 — <b>흡열 반응</b>.");
      var ch = false;
      if (prog === 100 && exo && !st.a) { st.a = ch = true; }
      if (prog === 100 && !exo && !st.b) { st.b = ch = true; }
      if (ch) { window.sthState("energy", st); mission(); }
    }
    function mission() {
      if (st.a) done("c-m2a"); if (st.b) done("c-m2b"); if (st.q) done("c-m2c");
      if (st.a && st.b && st.q) {
        window.sthMission("c-m2", true, "<span class='m-tag'>미션 완료</span>에너지를 방출해 주변 온도를 높이면 <b>발열 반응</b>, 흡수해 주변 온도를 낮추면 <b>흡열 반응</b>입니다. 드나드는 에너지의 크기는 반응물과 생성물의 에너지 차이입니다.");
        ep.clear(1);
      }
    }
    canvas._redraw = draw;
    seg("c-type-seg", function (k) { type = k; prog = 0; $("c-p").value = 0; $("c-p-val").textContent = "0"; draw(); });
    $("c-p").addEventListener("input", function (e) { prog = +e.target.value; $("c-p-val").textContent = prog; draw(); });
    window.sthPick({
      mount: "c-q2",
      q: "손난로처럼 주변 온도를 높이는 반응에서, 반응물과 생성물이 가진 에너지를 비교하면?",
      options: ["반응물의 에너지가 더 크다 — 그 차이만큼 주변으로 방출된다", "생성물의 에너지가 더 크다 — 그 차이만큼 주변으로 방출된다", "둘이 같다 — 열은 반응과 상관없이 생긴다", "반응물의 에너지가 더 크다 — 그 차이만큼 에너지가 사라진다"],
      answer: 0,
      why: ["높은 곳에서 낮은 곳으로 내려온 만큼의 에너지가 주변으로 나옵니다.", "생성물의 에너지가 더 크려면 에너지를 어디선가 받아 와야 합니다. 그것은 흡열 반응입니다.", "에너지 장부를 다시 보세요. 방출된 열은 두 높이의 차이와 같습니다.", "에너지는 사라지지 않습니다. 주변으로 옮겨 갔을 뿐입니다."],
      onDone: function () { st.q = true; window.sthState("energy", st); mission(); }
    });
    draw(); mission();
    if (ep.cleared(1)) window.sthMission("c-m2", true);
  })();

  /* 장면 3 — 손난로 : 철 1 g 산화에 7.38 kJ 방출(4Fe + 3O₂ → 2Fe₂O₃, 1648 kJ / 223.4 g)
     C dT/dt = P − k(T − 10℃) , P = r × 7.38 kJ/h (철이 남아 있는 동안) */
  function warm(m, lv) {
    var r = 0.5 * lv, k = 0.5, C = 0.15, Te = 10, T = Te, dt = 0.01, left = m, mx = T, h50 = 0, pts = [];
    for (var i = 0; i <= 1400; i++) {
      if (i % 10 === 0) pts.push(T);
      T += ((left > 0 ? r * 7.38 : 0) - k * (T - Te)) / C * dt;
      left = Math.max(0, left - r * dt); mx = Math.max(mx, T); if (T >= 50) h50 += dt;
    }
    return { mx: mx, h50: h50, pts: pts, life: m / r };
  }
  (function () {
    var canvas = $("c-warm"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var m = 10, lv = 2;
    /* 손난로 주머니(입체): 공기 구멍 lv개 줄, 철 가루 양 m */
    function pouchW(cx, cy, w, h) {
      var x = cx - w / 2, y = cy - h / 2, i, j;
      floorShadow(ctx, cx + 8, y + h + 12, w * .62, 12, .28);
      ctx.fillStyle = "#c5cad3"; ctx.beginPath(); ctx.moveTo(x + w, y + 8); ctx.lineTo(x + w + 12, y); ctx.lineTo(x + w + 12, y + h - 8); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
      var fg = ctx.createLinearGradient(x, y, x + w, y + h); fg.addColorStop(0, "#fff7ee"); fg.addColorStop(1, "#f0dcc6");
      ctx.fillStyle = fg; ctx.beginPath(); ctx.roundRect(x, y + 8, w, h - 8, 12); ctx.fill(); ctx.strokeStyle = "rgba(150,110,80,.5)"; ctx.lineWidth = 1.4; ctx.stroke();
      /* 잘라 낸 창: 철 가루 높이 ∝ 양 */
      var cw = w - 30, ch = h - 46, fx = x + 15, fy = y + 30, fh = ch * clamp(m / 60, 0.08, 1);
      ctx.fillStyle = "rgba(60,50,45,.18)"; ctx.beginPath(); ctx.roundRect(fx, fy, cw, ch, 8); ctx.fill();
      var R = K.rng(3), n = Math.round(30 + m * 2.4);
      for (i = 0; i < n; i++) { var gx = fx + 4 + R() * (cw - 8), gy = fy + ch - 4 - R() * (fh - 6); ctx.fillStyle = R() < .2 ? "#1a1b20" : (R() < .5 ? "#5d636e" : "#8a909b"); ctx.beginPath(); ctx.arc(gx, gy, 1.4 + R() * 1.5, 0, 6.283); ctx.fill(); }
      /* 공기 구멍 */
      ctx.fillStyle = "rgba(90,70,60,.75)";
      for (i = 0; i < lv; i++) for (j = 0; j < 2; j++) { ctx.beginPath(); ctx.arc(x + 18 + i * (w - 36) / 9, y + 18 + j * 6, 1.9, 0, 6.283); ctx.fill(); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var s = warm(m, lv), ok = s.mx <= 60 && s.h50 >= 8 && m <= 30, i, LW = 600;
      K.studio(ctx, 0, 0, LW, H, null);
      var cc = ok ? LT.green : LT.orange;
      K.bigText(ctx, "최고 " + s.mx.toFixed(1) + "℃ · 50℃ 이상 " + s.h50.toFixed(1) + "시간", 18, 44, 24, s.mx > 60 ? "#ffb35c" : (ok ? "#7ee0a0" : "#ffffff"));
      K.bigText(ctx, ok ? "뜨겁지 않게, 오래가는 손난로" : (m > 30 ? "철 가루가 30 g을 넘는다" : (s.mx > 60 ? "너무 뜨겁다 — 화상 위험" : (s.mx < 50 ? "미지근하다" : "온도는 좋지만 일찍 식는다"))), 18, 72, 15, "#ffd35a");
      var g = K.chart(ctx, { x: 6, y: 88, w: LW - 12, h: H - 96, pl: 54, pb: 36, pt: 12, pr: 16, x0: 0, x1: 14, y0: 0, y1: 90, xt: 7, yt: 9, light: true,
        xf: function (q) { return Math.round(q) + "시간"; }, yf: function (q) { return Math.round(q) + "℃"; } });
      function gx(h) { return g.X(h); } function gy(T) { return g.Y(T); }
      ctx.fillStyle = "rgba(15,159,118,.14)"; ctx.fillRect(g.L, gy(60), g.R - g.L, gy(50) - gy(60));
      K.t(ctx, "알맞은 온도 50~60℃", g.R - 6, gy(60) - 6, { s: 11, w: "800", a: "right", c: LT.green });
      K.line(ctx, { x: g.L, y: gy(10) }, { x: g.R, y: gy(10) }, LT.mute, 1.2, [4, 4]);
      K.t(ctx, "주변 10℃", g.L + 8, gy(10) + 16, { s: 11, w: "700", c: LT.mute });
      var pts = s.pts.map(function (T, k) { return [k * 0.1, clamp(T, 0, 90)]; });
      var ag = ctx.createLinearGradient(0, g.T, 0, g.B); ag.addColorStop(0, rgba(cc, .22)); ag.addColorStop(1, rgba(cc, 0));
      ctx.beginPath(); pts.forEach(function (q, k) { if (k) ctx.lineTo(gx(q[0]), gy(q[1])); else ctx.moveTo(gx(q[0]), gy(q[1])); });
      ctx.lineTo(gx(pts[pts.length - 1][0]), g.B); ctx.lineTo(g.L, g.B); ctx.closePath(); ctx.fillStyle = ag; ctx.fill();
      K.plot(ctx, g, pts, cc, { w: 3, light: true });
      var ex = gx(Math.min(14, s.life));
      K.line(ctx, { x: ex, y: g.T }, { x: ex, y: g.B }, LT.yellow, 1.5, [5, 5]);
      K.t(ctx, "철 가루 소진", clamp(ex, g.L + 40, g.R - 40), g.T + 14, { s: 11, w: "800", a: "center", c: "#b7791f" });
      var mi = 0; s.pts.forEach(function (T, k) { if (T > s.pts[mi]) mi = k; });
      K.planet(ctx, gx(mi * 0.1), gy(clamp(s.pts[mi], 0, 90)), 5.5, ok ? "#3fd3a3" : "#ff9a4d", ok ? "#0b6b4f" : "#a33c06");
      K.pill(ctx, "최고 " + s.mx.toFixed(1) + "℃", clamp(gx(mi * 0.1) + 12, g.L + 10, g.R - 110), clamp(gy(clamp(s.pts[mi], 0, 90)) - 12, g.T + 40, g.B - 10), { s: 12, c: "#ffffff", bg: "rgba(18,32,58,.85)", box: [0, LW] });
      /* ── 오른쪽 흰 카드: 손난로 모형과 설계 값 ── */
      var RX = LW + 12, x0 = RX + 18, x1 = W - 18;
      K.card(ctx, RX, 0, W - RX, H, "내가 설계한 손난로");
      pouchW((RX + W) / 2, 112, 196, 110);
      K.row(ctx, "철 가루", m + " g", x0, x1, 208, m > 30 ? LT.red : LT.ink);
      K.bar(ctx, x0, 216, x1 - x0, m / 60, m > 30 ? LT.red : "#7d838e");
      K.row(ctx, "공기 구멍", lv + "단계", x0, x1, 250);
      K.bar(ctx, x0, 258, x1 - x0, lv / 10, LT.blue);
      K.row(ctx, "1시간에 산화하는 철", (0.5 * lv).toFixed(1) + " g", x0, x1, 292);
      K.row(ctx, "방출한 열", Math.round(m * 7.38) + " kJ", x0, x1, 318, LT.orange);
      K.tip(ctx, ok ? "세 조건을 모두 만족" : (m > 30 ? "철 가루 30 g 이하로" : (s.mx > 60 ? "구멍을 줄여 천천히" : (s.mx < 50 ? "구멍을 늘려 더 빨리" : "철 가루를 더 넣기"))), x0 - 4, 340, x1 - x0 + 8, ok);
      K.t(ctx, "온도 = 빠르기(구멍) · 시간 = 양(철)", x0, 392, { s: 10.5, w: "700", c: LT.mute });
      $("c-warm-read").innerHTML = "<span class='k'>최고 온도</span><span class='v " + (s.mx > 60 || s.mx < 50 ? "r" : "g") + "'>" + s.mx.toFixed(1) + "℃</span><span class='sub'>60℃를 넘으면 화상 위험</span>" +
        "<span class='k'>50℃ 이상</span><span class='v y'>" + s.h50.toFixed(1) + "시간</span><span class='sub'>8시간 이상이어야 합니다</span>" +
        "<span class='k'>방출한 열</span><span class='v b'>" + Math.round(m * 7.38) + " kJ</span><span class='sub'>철 " + m + " g × 7.38 kJ/g · 1시간에 철 " + (0.5 * lv).toFixed(1) + " g 산화</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "세 조건을 모두 만족합니다" : (m > 30 ? "철 가루가 30 g을 넘습니다" : (s.mx > 60 ? "너무 뜨겁습니다" : (s.mx < 50 ? "미지근합니다" : "50℃ 이상이 8시간에 못 미칩니다")))) + "</span>";

      $("c-warm-info").innerHTML = "철 가루 <b>" + m + " g</b>, 공기 구멍 <b>" + lv + "단계</b>(1시간에 철 " + (0.5 * lv).toFixed(1) + " g 산화) → 최고 <b>" + s.mx.toFixed(1) + "℃</b>, 50℃ 이상 <b>" + s.h50.toFixed(1) + "시간</b>. " +
        (s.mx > 60 ? "🔥 너무 뜨겁습니다. 산소가 빨리 들어와 열이 한꺼번에 나옵니다. 화상 위험!" :
          (s.mx < 50 ? "미지근합니다. 1시간에 나오는 열이 주변으로 빠져나가는 열을 이기지 못합니다." :
            (s.h50 < 8 ? "온도는 알맞지만 철 가루가 일찍 떨어집니다." : (m > 30 ? "성능은 좋지만 철 가루가 30 g을 넘습니다." : "✅ 온도도 지속 시간도 알맞습니다.")))) +
        " <b>온도</b>는 열이 나오는 <b>빠르기</b>(구멍)가, <b>지속 시간</b>은 철 가루의 <b>양</b>이 정합니다.";
      if (ok) {
        window.sthState("warmBest", "철 " + m + " g·구멍 " + lv + "단계 → " + s.mx.toFixed(0) + "℃ " + s.h50.toFixed(1) + "시간");
        window.sthMission("c-m3", true, "<span class='m-tag'>미션 완료</span>철 가루 " + m + " g, 공기 구멍 " + lv + "단계 → 최고 " + s.mx.toFixed(1) + "℃, 50℃ 이상 " + s.h50.toFixed(1) + "시간. 같은 양의 철이 내놓는 열의 총량은 같지만, <b>반응의 빠르기</b>를 조절해 뜨겁지 않게 오래 쓰는 것입니다.");
        ep.clear(2);
      }
    }
    canvas._redraw = draw;
    $("c-fe").addEventListener("input", function (e) { m = +e.target.value; $("c-fe-val").textContent = m + " g"; draw(); });
    $("c-air").addEventListener("input", function (e) { lv = +e.target.value; $("c-air-val").textContent = lv + "단계"; draw(); });
    draw();
    if (ep.cleared(2)) window.sthMission("c-m3", true);
  })();

  /* 장면 4 — 냉찜질 팩 : NH₄NO₃ 용해열 +25.7 kJ/mol (80.04 g/mol), 용액의 비열 4.18 J/(g·℃) */
  function cold(w, a) { return 20 - (a / 80.04) * 25700 / ((w + a) * 4.18); }
  (function () {
    var canvas = $("c-cold"), ctx = window.setupCanvas(canvas), W = canvas._w, H = canvas._h;
    var w = 100, a = 5, st = window.sthState("cold") || { a: false, q: false };
    var jig = 0, moving = !REDUCE, painting = false;
    var PT = (function () { var r = [], s = 7; for (var k = 0; k < 60; k++) { s = s * 16807 % 2147483647; var u = (s - 1) / 2147483646; s = s * 16807 % 2147483647; var q = (s - 1) / 2147483646; r.push({ u: u, q: q, ph: u * 6.28 + q * 3 }); } return r; })();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var Tf = cold(w, a), ok = Tf >= 2 && Tf <= 6 && w + a <= 150, q = (a / 80.04) * 25.7, i, LW = 440, cx = 214;
      K.studio(ctx, 0, 0, LW, H, null);
      /* 냉찜질 팩(입체 주머니): 크기 ∝ 전체 무게, 차가울수록 서리와 푸른 빛 */
      var pw = lerp(200, 300, (w + a - 50) / 210), ph = 128, px = cx - pw / 2, py = 178, cool = clamp((20 - Tf) / 30, 0, 1), dz = 16;
      floorShadow(ctx, cx + 12, py + ph + 18, pw * .62, 18, .3);
      ctx.fillStyle = "rgba(150,180,215,.75)"; ctx.beginPath(); ctx.moveTo(px + pw, py + dz); ctx.lineTo(px + pw + dz, py); ctx.lineTo(px + pw + dz, py + ph - dz); ctx.lineTo(px + pw, py + ph); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "rgba(215,232,250,.9)"; ctx.beginPath(); ctx.moveTo(px + 10, py + dz); ctx.lineTo(px + 10 + dz, py); ctx.lineTo(px + pw + dz, py); ctx.lineTo(px + pw, py + dz); ctx.closePath(); ctx.fill();
      var pg = ctx.createLinearGradient(px, py, px + pw, py + ph);
      pg.addColorStop(0, mixC("#e9f3ff", "#d6ecff", cool)); pg.addColorStop(.55, mixC("#c9def4", "#8fc4f2", cool)); pg.addColorStop(1, mixC("#b3c9e2", "#5f9fe0", cool));
      ctx.fillStyle = pg; ctx.beginPath(); ctx.roundRect(px, py + dz, pw, ph - dz, 18); ctx.fill();
      ctx.strokeStyle = "rgba(110,140,180,.7)"; ctx.lineWidth = 1.6; ctx.stroke();
      /* 터진 물 주머니 */
      ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px + pw * .28, py + ph * .58, pw * .16, ph * .2, 0, .4, 5.6); ctx.stroke();
      var nP = Math.min(60, Math.round(a)), ph2 = jig;
      for (i = 0; i < nP; i++) {
        var P = PT[i], ix = px + 18 + P.u * (pw - 36) + Math.sin(ph2 * 2 + P.ph) * 4, iy = py + dz + 14 + P.q * (ph - dz - 28) + Math.cos(ph2 * 1.7 + P.ph) * 3;
        K.planet(ctx, ix, iy, 3.3, i % 2 ? "#b69cff" : "#ffb35c", i % 2 ? "#4a3a90" : "#9a4a10");
      }
      if (cool > .25) { ctx.fillStyle = "rgba(255,255,255," + Math.min(.85, (cool - .25) * 1.4).toFixed(3) + ")"; var R = K.rng(17); for (i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(px + R() * pw, py + dz + (R() < .5 ? R() * 10 : ph - dz - R() * 10), 1.2 + R() * 1.8, 0, 6.283); ctx.fill(); } }
      K.bigText(ctx, Tf.toFixed(1) + "℃", cx, py + ph / 2 + 22, 34, ok ? "#7ee0a0" : (Tf < 0 ? "#bfe0ff" : "#ffffff"), "center");
      if (a > 0) {
        var aw = 2 + Math.min(6, q / 3), hc = "#e8590c";
        K.arrow(ctx, { x: cx, y: 112 }, { x: cx, y: py - 8 }, hc, aw, 11);
        K.arrow(ctx, { x: 16, y: py + ph / 2 + 8 }, { x: px - 8, y: py + ph / 2 + 8 }, hc, aw, 11);
        K.arrow(ctx, { x: LW - 16, y: py + ph / 2 + 8 }, { x: px + pw + dz + 8, y: py + ph / 2 + 8 }, hc, aw, 11);
        K.pill(ctx, "주변의 열 " + q.toFixed(1) + " kJ 흡수", cx, 360, { s: 12, a: "center", c: "#ffd0a8", box: [0, LW] });
        K.pill(ctx, "NH₄⁺", px + pw - 30, py + ph + 8, { s: 10.5, a: "center", c: "#d9ccff", box: [0, LW] });
        K.pill(ctx, "NO₃⁻", px + 30, py + ph + 8, { s: 10.5, a: "center", c: "#ffd9b0", box: [0, LW] });
      }
      K.bigText(ctx, ok ? "알맞은 냉찜질 팩" : (w + a > 150 ? "150 g을 넘는다" : (Tf > 6 ? "아직 미지근하다" : "너무 차갑다")), 18, 44, 24, ok ? "#7ee0a0" : "#ffffff");
      K.bigText(ctx, "물 " + w + " g + 질산 암모늄 " + a + " g = " + (w + a) + " g", 18, 72, 15, w + a > 150 ? "#ffb0b0" : "#ffd35a");
      /* ── 오른쪽 흰 카드: 온도 그래프 ── */
      var RX = LW + 12;
      K.card(ctx, RX, 0, W - RX, H, "팩을 누른 뒤 온도 변화");
      var g = K.chart(ctx, { x: RX + 6, y: 40, w: W - RX - 12, h: H - 92, pl: 50, pb: 32, pt: 12, pr: 16, x0: 0, x1: 120, y0: -20, y1: 25, xt: 4, yt: 9, light: true,
        xf: function (t) { return Math.round(t) + "초"; }, yf: function (t) { return Math.round(t) + "℃"; } });
      function gx(t) { return g.X(t); } function gy(T) { return g.Y(clamp(T, -20, 25)); }
      ctx.fillStyle = "rgba(15,159,118,.14)"; ctx.fillRect(g.L, gy(6), g.R - g.L, gy(2) - gy(6));
      K.t(ctx, "알맞은 온도 2~6℃", g.R - 6, gy(6) - 6, { s: 11, w: "800", a: "right", c: LT.green });
      K.line(ctx, { x: g.L, y: gy(0) }, { x: g.R, y: gy(0) }, LT.mute, 1.2, [4, 4]);
      var pts = [];
      for (i = 0; i <= 120; i += 2) { var T = Tf + (20 - Tf) * Math.exp(-i / 18); pts.push([i, clamp(T, -20, 25)]); }
      K.plot(ctx, g, pts, ok ? LT.green : LT.blue, { w: 3, light: true });
      K.tip(ctx, ok ? "흡수한 열만큼 물이 식었다" : (Tf < 0 ? "영하 — 피부가 상할 수 있음" : (Tf > 6 ? "흡수한 열이 모자람" : (w + a > 150 ? "무게를 줄이기" : "조금 지나치게 차가움"))), RX + 14, H - 46, W - RX - 28, ok);
      if (painting) return;
      $("c-cold-read").innerHTML = "<span class='k'>다 녹은 뒤</span><span class='v " + (ok ? "g" : "r") + "'>" + Tf.toFixed(1) + "℃</span><span class='sub'>알맞은 온도 2~6℃</span>" +
        "<span class='k'>흡수한 열</span><span class='v y'>" + q.toFixed(1) + " kJ</span><span class='sub'>질산 암모늄 " + a + " g ÷ 80.04 g/mol × 25.7 kJ/mol</span>" +
        "<span class='k'>전체 무게</span><span class='v " + (w + a > 150 ? "r" : "b") + "'>" + (w + a) + " g</span>" +
        "<span class='ok " + (ok ? "g" : "r") + "'>" + (ok ? "알맞은 냉찜질 팩입니다" : (w + a > 150 ? "150 g을 넘습니다" : (Tf > 6 ? "아직 미지근합니다" : "너무 차갑습니다"))) + "</span>";

      $("c-cold-info").innerHTML = "물 <b>" + w + " g</b> + 질산 암모늄 <b>" + a + " g</b> → 녹으면서 열 <b>" + q.toFixed(1) + " kJ</b>을 물에서 빼앗아 <b>" + Tf.toFixed(1) + "℃</b>. " +
        (w + a > 150 ? "⚠️ 전체 무게가 150 g을 넘습니다. " : "") +
        (Tf > 6 ? "아직 미지근합니다. 흡수하는 열이 모자랍니다." : (Tf < 2 ? (Tf < 0 ? "❄️ 영하입니다. 피부에 바로 대면 상할 수 있습니다. 너무 많이 넣었습니다." : "조금 지나치게 차갑습니다.") : "알맞은 온도입니다.")) +
        " 같은 양의 질산 암모늄이라도 <b>물이 적을수록</b> 온도가 더 많이 내려갑니다.";
      if (ok && !st.a) { st.a = true; window.sthState("cold", st); }
      if (ok) window.sthState("coldBest", "물 " + w + " g+질산 암모늄 " + a + " g → " + Tf.toFixed(1) + "℃");
      mission();
    }
    function mission() {
      if (st.a) done("c-m4a"); if (st.q) done("c-m4b");
      if (st.a && st.q) {
        window.sthMission("c-m4", true, "<span class='m-tag'>미션 완료</span>" + (window.sthState("coldBest") || "") + ". 질산 암모늄이 녹으며 <b>흡수한 열</b>만큼 물의 온도가 내려갑니다. 너무 적으면 미지근하고, 너무 많으면 영하로 떨어집니다.");
        ep.clear(3);
      }
    }
    canvas._redraw = draw;
    playBtn("c-cold-play", "⏸ 입자 멈추기", "▶ 입자 움직이기", function () { return moving; }, function (x) { moving = x; });
    K.animate(canvas, function (dt) { if (moving && a > 0) { jig += dt / 1000; painting = true; draw(); painting = false; } });
    $("c-w").addEventListener("input", function (e) { w = +e.target.value; $("c-w-val").textContent = w + " g"; draw(); });
    $("c-an").addEventListener("input", function (e) { a = +e.target.value; $("c-an-val").textContent = a + " g"; draw(); });
    window.sthPick({
      mount: "c-q4",
      q: "완성한 냉찜질 팩을 삔 발목에 댔습니다. 발목이 시원해지는 동안 열은 어떻게 이동할까요?",
      options: ["팩의 ‘냉기’가 발목으로 들어간다", "발목의 열이 팩 쪽으로 이동하고, 팩 속의 흡열 과정이 그 열을 흡수한다", "열은 이동하지 않고 발목의 에너지가 그냥 없어진다", "팩이 열을 방출하고 발목이 그 열을 흡수한다"],
      answer: 1,
      why: ["‘냉기’라는 물질이나 에너지는 없습니다. 이동하는 것은 언제나 열입니다.", "열은 온도가 높은 발목에서 낮은 팩으로 이동합니다. 시원하다는 느낌은 열을 빼앗기고 있다는 뜻입니다.", "에너지는 사라지지 않습니다. 어디론가 옮겨 갑니다.", "그러면 발목이 더 뜨거워집니다. 그것은 손난로입니다."],
      onDone: function () { st.q = true; window.sthState("cold", st); mission(); }
    });
    draw();
    if (ep.cleared(3)) window.sthMission("c-m4", true);
  })();

  /* 장면 5 — 발열·흡열 판정 + 결말 */
  function reveal() {
    $("c-end").hidden = false;
    var p = window.sthState("p3") || "";
    $("c-vs").innerHTML = "<b>나의 첫 추리</b> " + (p || "기록 없음") + (p.indexOf("㉡") === 0 ? " — 정확했습니다." : " — ‘냉기’가 나오는 것도, 에너지가 사라지는 것도 아닙니다. 주변의 열을 흡수하는 것입니다.") +
      "<br><b>나의 손난로</b> " + (window.sthState("warmBest") || "-") + "<br><b>나의 냉찜질 팩</b> " + (window.sthState("coldBest") || "-");
  }
  function finish() { window.sthState("r3", "해결 · 손난로 " + (window.sthState("warmBest") || "-") + " · 냉찜질 팩 " + (window.sthState("coldBest") || "-")); }
  window.sthSort({
    mount: "c-sort",
    buckets: [{ id: "exo", label: "🔥 발열 반응", sub: "에너지 방출 → 주변 온도 상승" }, { id: "endo", label: "❄️ 열을 흡수하는 변화", sub: "에너지 흡수 → 주변 온도 하강" }],
    items: [
      { t: "손난로(철 가루)를 흔들면 따뜻해진다", a: "exo", why: "철의 산화는 발열 반응입니다." },
      { t: "물에 질산 암모늄을 녹이면 컵 표면에 물방울이 맺힐 만큼 차가워진다", a: "endo", why: "질산 암모늄의 용해는 주변의 열을 흡수합니다." },
      { t: "나무나 천연가스가 연소하면 주변이 뜨거워진다", a: "exo", why: "연소는 대표적인 발열 반응입니다." },
      { t: "탄산수소 나트륨과 구연산을 물에 녹이면 컵이 시원해진다", a: "endo", why: "주변의 열을 흡수하는 흡열 반응입니다.", hint: "컵이 시원해졌다면 열은 어느 쪽으로 갔을까요?" },
      { t: "묽은 염산에 마그네슘 리본을 넣으면 용액의 온도가 올라간다", a: "exo", why: "금속과 산의 반응은 발열 반응입니다." },
      { t: "얼음 위에 소금을 뿌리면 주변이 매우 차가워진다", a: "endo", why: "얼음이 녹고 소금이 녹으면서 주변의 열을 흡수합니다." },
      { t: "산과 염기를 섞으면 용액의 온도가 올라간다", a: "exo", why: "중화 반응은 발열 반응입니다. 이야기 ②의 온도 그래프를 떠올려 보세요." },
      { t: "식물이 빛에너지를 받아 광합성을 한다", a: "endo", why: "광합성은 빛에너지를 흡수해야 일어나는 흡열 반응입니다.", hint: "빛이 없으면 광합성이 일어나지 않습니다." },
      { t: "세포 호흡으로 체온을 유지한다", a: "exo", why: "포도당이 산화되며 에너지를 방출합니다." },
      { t: "발열 도시락의 끈을 당기면 산화 칼슘이 물과 만나 밥이 데워진다", a: "exo", why: "산화 칼슘과 물의 반응은 열을 많이 내놓습니다." }
    ],
    onDone: function () { reveal(); ep.clear(4); }
  });
  if (ep.cleared(4)) reveal();
  window.sthWork({
    mount: "c-wk", unitLabel: "[통합과학2 Ⅰ-2] 이야기 ③ 불 없이 따뜻하게, 얼음 없이 차갑게",
    items: [
      { id: "c1", label: "도윤이에게 건네는 사용 설명서", hint: "내가 설계한 손난로와 냉찜질 팩의 재료 양을 적고, 각각 따뜻해지는·차가워지는 까닭을 ‘에너지의 방출’과 ‘에너지의 흡수’라는 말을 넣어 설명하세요." },
      { id: "c2", label: "우리 생활 속 에너지 출입", hint: "발열 반응과 흡열 반응이 이용되는 예를 하나씩 더 찾아, 그 반응이 없다면 무엇이 불편할지 쓰세요." }
    ]
  });
})();

/* ========================================================================= 04 정리하기 */
window.sthWork({
  mount: "wk", unitLabel: "[통합과학2 Ⅰ-2] 화학 변화 — 정리",
  recap: [
    { key: "r1", label: "① 붉은 돌에서 철을 꺼내라" },
    { key: "r2", label: "② 물고기가 사라진 호수" },
    { key: "r3", label: "③ 불 없이 따뜻하게, 얼음 없이 차갑게" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  items: [
    { id: "all", label: "세 사건을 꿰는 한 문장", hint: "산소와 전자, H⁺과 OH⁻, 열. 세 이야기에서 화학 변화가 일어날 때마다 무엇인가가 ‘옮겨 갔고’ 그 양이 ‘딱 맞아떨어졌습니다’. 이 공통점을 넣어 한 문장으로 쓰세요." },
    { id: "w3", label: "아직 헷갈리는 것", hint: "다음 시간에 여기서부터 시작합니다." }
  ]
});

/* ========================================================================= 05 우리 반 */
window.sthShare({
  mount: "share", unit: "is2-1-2", unitLabel: "[통합과학2 Ⅰ-2] 화학 변화",
  rows: [
    { key: "r1", label: "① 붉은 돌에서 철을 꺼내라" },
    { key: "r2", label: "② 물고기가 사라진 호수" },
    { key: "r3", label: "③ 불 없이 따뜻하게, 얼음 없이 차갑게" },
    { key: "rQuiz", label: "수준별 문제" },
    { key: "rLab", label: "응용 실험실" },
    { key: "rInq", label: "교과서 실험" },
    { key: "rReal", label: "실제 자료" }
  ],
  line: { id: "all", label: "세 사건을 꿰는 한 문장" }
});

})();
