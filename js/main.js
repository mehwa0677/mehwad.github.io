/* =========================================================
   [BRAND] Landing — main.js
   ========================================================= */
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 0. 시작 위치 — 새로 열면 항상 맨 위에서 시작
      (브라우저가 이전 스크롤 위치나 주소 끝 #contact 등으로 내려가던 문제 방지) */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const introEl = document.getElementById('intro');
const introOn = introEl && document.documentElement.classList.contains('intro-active');
if (introOn && location.hash) history.replaceState(null, '', location.pathname + location.search);
if (introOn || !location.hash) window.scrollTo(0, 0);

/* 0-1. 대문(인트로) — 클릭 / 위로 드래그 / 휠 / 키보드로 입장 */
if (introOn) {
  const html = document.documentElement;
  const video = document.getElementById('introVideo');
  const soundBtn = document.getElementById('introSound');
  let entered = false;

  // 동영상 파일이 없으면 배경 이미지(포스터)나 단색으로 유지
  if (video) video.addEventListener('error', () => video.remove());

  function enter() {
    if (entered) return;
    entered = true;
    try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
    introEl.classList.remove('is-snapping');
    introEl.style.transform = '';
    introEl.classList.add('is-leaving');
    html.classList.remove('intro-active');            // 첫 화면 애니메이션 시작
    window.scrollTo(0, 0);
    setTimeout(() => {
      if (video) video.pause();
      introEl.remove();
    }, 1200);
  }

  // 드래그(마우스·터치 공통)
  let startY = null, dy = 0;
  introEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.intro-sound')) return;
    startY = e.clientY; dy = 0;
    introEl.classList.remove('is-snapping');
    introEl.setPointerCapture(e.pointerId);
  });
  introEl.addEventListener('pointermove', (e) => {
    if (startY === null) return;
    dy = Math.max(0, startY - e.clientY);             // 위로 끈 거리
    introEl.style.transform = `translateY(${-dy}px)`;
  });
  introEl.addEventListener('pointerup', () => {
    if (startY === null) return;
    startY = null;
    if (dy < 6 || dy > window.innerHeight * 0.18) enter();   // 짧게 누름 = 클릭, 충분히 끌면 입장
    else { introEl.classList.add('is-snapping'); introEl.style.transform = ''; }
  });
  introEl.addEventListener('pointercancel', () => {
    startY = null; introEl.classList.add('is-snapping'); introEl.style.transform = '';
  });

  // 마우스 휠 아래로 / 키보드
  introEl.addEventListener('wheel', (e) => { if (e.deltaY > 10) enter(); }, { passive: true });
  document.addEventListener('keydown', (e) => {
    if (!entered && ['Enter', ' ', 'ArrowDown', 'PageDown'].includes(e.key)) { e.preventDefault(); enter(); }
  });

  // 소리 켜기/끄기 (브라우저 정책상 처음엔 음소거로 자동재생)
  if (soundBtn && video) {
    soundBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if (!video.muted) video.play();
      soundBtn.textContent = video.muted ? 'SOUND OFF' : 'SOUND ON';
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
    });
  }
}

/* 1. 이미지 처리 — 파일이 있으면 표시, 없으면 플레이스홀더 유지 */
document.querySelectorAll('.ph-media').forEach((img) => {
  const ph = img.closest('.ph');
  const ok = () => ph && ph.classList.add('has-img');
  const fail = () => img.remove();
  if (img.complete) {
    img.naturalWidth > 0 ? ok() : fail();
  } else {
    img.addEventListener('load', ok);
    img.addEventListener('error', fail);
  }
});

/* 1-1. 로고 — logo.png가 없으면 글자 로고로 대체 */
document.querySelectorAll('.logo-img').forEach((img) => {
  const fail = () => { img.closest('.logo').classList.add('no-img'); img.remove(); };
  if (img.complete) { if (img.naturalWidth === 0) fail(); }
  else img.addEventListener('error', fail);
});

/* 2. 스크롤 등장 애니메이션 */
const revealEls = document.querySelectorAll('.reveal, .reveal-img, .reveal-line');
if ('IntersectionObserver' in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-in'));
}

/* 3. 패럴랙스 — 이미지가 스크롤보다 천천히 움직임 */
const parallaxEls = document.querySelectorAll('.parallax');
function updateParallax() {
  const vh = window.innerHeight;
  parallaxEls.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > vh) return;
    const progress = (rect.top + rect.height / 2 - vh / 2) / vh; // -1 ~ 1
    const y = progress * -60;
    el.style.setProperty('--py', `${y}px`);
    const media = el.querySelector('.ph-media');
    if (media) media.style.transform = `translateY(${y}px) scale(1.15)`;
  });
}


let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    if (!reduceMotion) updateParallax();
    ticking = false;
  });
}, { passive: true });
if (!reduceMotion) updateParallax();

/* 5. 모바일 메뉴 */
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
if (toggle && menu) toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
});
if (menu) menu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

/* 6. 신청 폼 (데모 — 실제 전송은 Formspree 등 연결 필요) */
const form = document.getElementById('contactForm');
if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.textContent = '신청 완료';
  btn.disabled = true;
  form.reset();
});

/* 7. 푸터 연도 */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
