/* 통합과학2 Ⅱ-2 — 근거 카드 토론(선택 활동). 공용 부품: ../assets/debate.js (sthDebate) · 자료 단추는 ../assets/link.js
   하지 않아도 이야기·문제 진행에는 영향이 없다. */
window.sthDebate({
  mount: "debate", key: "energy",
  title: "2040년 우리나라 전기, 무엇을 더 늘려야 할까?",
  issue: "탄소를 줄이려면 원자력 발전을 늘려야 할까, 재생 에너지(태양광·풍력)를 늘려야 할까?",
  sides: [
    { k: "a", label: "원자력을 더 늘려야 한다", say: "날씨와 상관없이 많은 전기를 꾸준히, 탄소를 적게 내며 만든다" },
    { k: "b", label: "재생 에너지를 더 늘려야 한다", say: "연료가 들지 않고 값이 빠르게 내려가며, 사고·폐기물 걱정이 적다" }
  ],
  cards: [
    { id: "death", title: "에너지원별 사망률(사고·대기 오염)", view: "owid:death-rates-from-energy-production-per-twh|에너지원별 사망률", hint: "같은 전기량(TWh)을 만들 때 석탄·석유·원자력·풍력·태양광의 차이" },
    { id: "ci", title: "나라별 전기 1 kWh당 탄소 배출", view: "owid:carbon-intensity-electricity|전기의 탄소 집약도", hint: "South Korea 와 프랑스(원자력 비중 큼)·덴마크(풍력 비중 큼) 견주기" },
    { id: "nuc", title: "나라별 원자력 발전 비율", view: "owid:share-electricity-nuclear|원자력 비율", hint: "우리나라 원자력 비율은 몇 %이고, 줄고 있나 늘고 있나" },
    { id: "ren", title: "나라별 재생 에너지 발전 비율", view: "owid:share-of-electricity-production-from-renewable-sources|재생 에너지 비율", hint: "우리나라와 세계 평균의 차이" },
    { id: "cost", title: "발전원별 전기 생산 단가의 변화", view: "owid:levelized-cost-of-energy|발전 단가", hint: "2010년 뒤 태양광·풍력 값이 얼마나 내려갔나" },
    { id: "mix", title: "우리나라 전기는 무엇으로 만드나", view: "owid:electricity-prod-source-stacked|발전원별 전기 생산", hint: "나라를 South Korea 로 바꿔, 석탄·가스·원자력·재생의 몫 읽기" },
    { id: "fk", title: "후쿠시마 제1원전 (2011년 사고 현장)", view: "place:37.4227,141.0269,15,s", open: "현장 위성 사진 열기", hint: "원전이 바닷가에 있는 까닭과, 지진 해일에 약했던 까닭" }
  ],
  note: "그래프는 영어입니다. 그래프 위의 <b>Edit countries</b> 나 나라 이름 목록에서 <b>South Korea</b> 를 골라 보세요. 숫자는 그래프에서 직접 읽어 적고, 언제 자료인지(연도)도 함께 적습니다."
});
