/* 교과서 실험 — 교과서 탐구를 시뮬레이션으로 해 보고 하나만 바꿔 내 탐구로. 엔진: ../assets/inquiry.js
   교과서 쪽 번호는 비상교육 교과서. 내용은 교과서 문장을 옮기지 않고 짧게 줄여 새로 썼다. */
window.sthInquiry({ mount: "inq", key: "inq", result: "rInq", items: [
  { id: "e1", book: "통합과학2", page: 24, title: "자연선택 모의실험", purpose: "색깔 과자를 색 도화지 위에 놓고 눈에 띄는 것부터 먹히게 하여 자연선택을 재현한다.",
    steps: ["빨간 도화지 위에 네 가지 색 과자를 10개씩 놓는다", "눈을 감았다 뜨고 가장 먼저 보이는 과자를 집어 낸다", "남은 과자의 색 비율대로 다시 채운다", "세 세대를 되풀이하며 기록한다", "초록 도화지로 바꿔 되풀이한다"],
    iv: "도화지(환경)의 색", dv: "세대별로 남은 색깔별 과자 수(개)", cv: ["처음 과자 수", "고르는 시간", "세대 수"], safety: "실험에 쓴 과자는 먹지 않는다.",
    extend: ["선택 요인을 늑대 대신 먹이 부족으로만 바꿔 털색 비율이 달라지는지 보기", "털색 돌연변이를 우성 ↔ 열성으로만 바꿔 퍼지는 빠르기 비교하기"],
    sim: { kind: "iframe", name: "PhET · 자연선택", url: "https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_ko.html", h: 600,
      ivControl: "환경을 적도(갈색 바탕) ↔ 북극(흰 바탕)으로 바꾸고, 털색 돌연변이를 넣은 뒤 선택 요인 [늑대] 켜기", dvReading: "세대별 털색별 개체 수 그래프",
      x: { label: "세대", unit: "세대" }, y: { label: "갈색 털 토끼 수", unit: "마리" } } }
] });
