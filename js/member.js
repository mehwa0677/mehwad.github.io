/* =========================================================
   멤버 상세 페이지 — 주소의 ?id= 값으로 멤버를 찾아 화면을 채웁니다.
   (내용 수정은 js/members.js 에서 하세요)
   ========================================================= */
(function () {
  const id = new URLSearchParams(location.search).get('id');
  let index = MEMBERS.findIndex((m) => m.id === id);
  if (index < 0) index = 0;                       // 잘못된 주소면 첫 멤버
  const m = MEMBERS[index];
  const total = MEMBERS.length;
  const pad = (n) => String(n).padStart(2, '0');
  const set = (sel, text) => { const el = document.querySelector(sel); if (el) el.textContent = text; };

  document.title = `${m.name} — RESCENE`;

  const img = document.querySelector('#memberPhoto');
  img.src = m.photo;
  img.alt = `${m.name} 사진`;
  document.querySelector('#memberPhotoBox').dataset.label = `${m.name} · 4:5`;

  set('#memberCount', `MEMBER ${pad(index + 1)} / ${pad(total)}`);
  set('#memberName', m.name);
  set('#memberLine', m.line);
  set('#memberPosition', m.position);
  set('#memberBirth', m.birth);
  set('#memberIntro', m.intro);

  // 이전 · 다음 멤버
  const prev = MEMBERS[(index - 1 + total) % total];
  const next = MEMBERS[(index + 1) % total];
  const prevLink = document.querySelector('#prevMember');
  const nextLink = document.querySelector('#nextMember');
  prevLink.href = `member.html?id=${prev.id}`;
  nextLink.href = `member.html?id=${next.id}`;
  set('#prevName', prev.name);
  set('#nextName', next.name);

  // 키보드 ← → 로 이동
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowLeft') location.href = prevLink.href;
    if (e.key === 'ArrowRight') location.href = nextLink.href;
  });
})();
