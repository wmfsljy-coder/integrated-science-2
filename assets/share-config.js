/* 우리 반 공유 뒷단(Google Apps Script 웹앱) 주소. 비워 두면 공유 없이 내 성과만 보인다.
   배포 방법은 science-teacher-hub 저장소의 share-backend/README.md 참고. */
window.STH_SHARE_URL = "https://script.google.com/macros/s/AKfycbxIFfvQS-gIVKYCan11Bpr0I35KWyRZUD7gOvUGl2fJCC08nXpLGYQ5OKZfJcbSXMjF/exec";

/* 반 목록 — 통합과학은 1학년 1 ~ 7반. 목록이 있으면 반 코드를 직접 치지 않고 고른다. */
window.STH_CLASSES = [
  { v: "1-1", t: "1학년 1반" }, { v: "1-2", t: "1학년 2반" }, { v: "1-3", t: "1학년 3반" }, { v: "1-4", t: "1학년 4반" },
  { v: "1-5", t: "1학년 5반" }, { v: "1-6", t: "1학년 6반" }, { v: "1-7", t: "1학년 7반" }
];
/* 이 주소에서 열렸을 때만 위 공유 주소를 쓴다. 학교를 옮겨 복사했다면 내 Pages 주소로 바꾸고, 위 STH_SHARE_URL 도 내 웹 앱 주소로 바꾼다. */
window.STH_SHARE_HOSTS = ["wmfsljy-coder.github.io", "localhost", "127.0.0.1"];
