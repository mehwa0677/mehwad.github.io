/* =========================================================
   [BRAND] Landing — main.js
   ========================================================= */
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

/* 4. 헤더 — 아래로 스크롤하면 숨기고, 위로 올리면 표시 */
const header = document.querySelector('.header');
let lastY = window.scrollY;
function updateHeader() {
  const y = window.scrollY;
  const menuOpen = document.getElementById('menu').classList.contains('is-open');
  header.classList.toggle('is-hidden', y > lastY && y > 200 && !menuOpen);
  lastY = y;
}

let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    if (!reduceMotion) updateParallax();
    updateHeader();
    ticking = false;
  });
}, { passive: true });
if (!reduceMotion) updateParallax();

/* 5. 모바일 메뉴 */
const toggle = document.querySelector('.menu-toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
});
menu.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

/* 6. 신청 폼 (데모 — 실제 전송은 Formspree 등 연결 필요) */
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button');
  btn.textContent = '신청 완료';
  btn.disabled = true;
  form.reset();
});

/* 7. 푸터 연도 */
document.getElementById('year').textContent = new Date().getFullYear();
