/* =========================================================
   LP 플레이어 — ALBUM 카드를 누르면 오른쪽에서 패널이 열리고
   수록곡을 누르면 LP가 돌아가며 재생됩니다.
   (수록곡 내용은 js/albums.js 에서 수정)
   ========================================================= */
(function () {
  const cards = document.querySelectorAll('.albums .album');
  if (!cards.length || typeof ALBUMS === 'undefined') return;

  const clean = (s) => (s || '').replace(/^\s*\[|\]\s*$/g, '').trim();   // 앞뒤 [ ] 제거
  const fmt = (t) => {
    if (!isFinite(t)) return '0:00';
    const m = Math.floor(t / 60), s = Math.floor(t % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };
  const icon = {
    play:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill="currentColor"/></svg>',
    prev:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h2v14H6zM19 5.5v13L9.5 12z" fill="currentColor"/></svg>',
    next:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 5h2v14h-2zM5 5.5v13L14.5 12z" fill="currentColor"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.6" fill="none"/></svg>'
  };

  /* ---------- 화면 만들기 ---------- */
  const root = document.createElement('div');
  root.className = 'lp';
  root.innerHTML = `
    <div class="lp-backdrop" data-close></div>
    <aside class="lp-panel" role="dialog" aria-modal="true" aria-labelledby="lpTitle" tabindex="-1">
      <button class="lp-close" type="button" data-close aria-label="플레이어 닫기">${icon.close}</button>

      <div class="lp-deck" aria-hidden="true">
        <div class="lp-disc"><div class="lp-disc-spin">
          <div class="lp-label"><img class="lp-label-img" alt=""></div>
        </div></div>
        <div class="lp-sleeve"><img class="lp-sleeve-img" alt=""></div>
        <svg class="lp-arm" viewBox="0 0 60 200">
          <circle cx="30" cy="22" r="16" class="lp-arm-base"/>
          <circle cx="30" cy="22" r="6" class="lp-arm-pivot"/>
          <path d="M30 22 L30 150 L18 178" class="lp-arm-rod"/>
          <rect x="8" y="172" width="20" height="24" rx="3" transform="rotate(25 18 184)" class="lp-arm-head"/>
        </svg>
      </div>

      <div class="lp-info">
        <p class="eyebrow lp-eyebrow">ALBUM</p>
        <h3 class="lp-title" id="lpTitle"></h3>
        <p class="lp-date"></p>
      </div>

      <div class="lp-now">
        <p class="lp-now-title" aria-live="polite">재생할 곡을 선택하세요</p>
        <div class="lp-progress">
          <span class="lp-time lp-cur">0:00</span>
          <input class="lp-seek" type="range" min="0" max="100" step="0.1" value="0" aria-label="재생 위치">
          <span class="lp-time lp-dur">0:00</span>
        </div>
        <div class="lp-controls">
          <button class="lp-btn lp-prev" type="button" aria-label="이전 곡">${icon.prev}</button>
          <button class="lp-btn lp-play" type="button" aria-label="재생">${icon.play}</button>
          <button class="lp-btn lp-next" type="button" aria-label="다음 곡">${icon.next}</button>
        </div>
        <p class="lp-status" role="status"></p>
      </div>

      <ol class="lp-tracks"></ol>
    </aside>

    <button class="lp-mini" type="button" aria-label="플레이어 열기">
      <span class="lp-mini-disc"><img class="lp-mini-img" alt=""></span>
      <span class="lp-mini-text"></span>
    </button>`;
  document.body.appendChild(root);

  const $ = (s) => root.querySelector(s);
  const panel = $('.lp-panel'), tracksEl = $('.lp-tracks'), seek = $('.lp-seek');
  const playBtn = $('.lp-play'), statusEl = $('.lp-status'), nowTitle = $('.lp-now-title');
  const audio = new Audio();
  audio.preload = 'metadata';

  let viewAlbum = -1;          // 패널에 보이는 앨범
  let playAlbum = -1;          // 재생 중인 앨범
  let playTrack = -1;          // 재생 중인 곡
  let lastFocus = null;

  /* ---------- 앨범 정보 (index.html 카드에서 읽기) ---------- */
  function albumInfo(i) {
    const card = cards[i];
    const img = card.querySelector('.ph-media');
    return {
      title: clean(card.querySelector('.album-title')?.textContent),
      date: clean(card.querySelector('.album-date')?.textContent),
      cover: img ? img.getAttribute('src') : '',
      tracks: (ALBUMS[i] && ALBUMS[i].tracks) || []
    };
  }

  function setCover(selector, src) {
    const img = $(selector);
    if (src) { img.src = src; img.style.display = ''; img.onerror = () => { img.style.display = 'none'; }; }
    else img.style.display = 'none';
  }

  /* ---------- 패널 열기 / 닫기 ---------- */
  function open(i) {
    viewAlbum = i;
    const a = albumInfo(i);
    $('.lp-title').textContent = a.title;
    $('.lp-date').textContent = a.date;
    setCover('.lp-sleeve-img', a.cover);
    // 재생 중인 앨범이 아니면 LP 라벨도 이 앨범으로
    if (playAlbum !== i) setCover('.lp-label-img', a.cover);
    renderTracks();
    root.classList.add('is-open');
    document.documentElement.classList.add('lp-lock');
    lastFocus = document.activeElement;
    setTimeout(() => panel.focus(), 50);
  }
  function close() {
    root.classList.remove('is-open');
    document.documentElement.classList.remove('lp-lock');
    if (lastFocus) lastFocus.focus();
  }

  function renderTracks() {
    const a = albumInfo(viewAlbum);
    tracksEl.innerHTML = '';
    if (!a.tracks.length) {
      tracksEl.innerHTML = '<li class="lp-empty">등록된 수록곡이 없습니다.</li>';
      return;
    }
    a.tracks.forEach((t, j) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lp-track';
      if (playAlbum === viewAlbum && playTrack === j) btn.classList.add('is-current');
      btn.innerHTML = `<span class="lp-track-no">${String(j + 1).padStart(2, '0')}</span>
        <span class="lp-track-title"></span>
        <span class="lp-eq" aria-hidden="true"><i></i><i></i><i></i></span>`;
      btn.querySelector('.lp-track-title').innerHTML = clean(t.title);
      btn.addEventListener('click', () => play(viewAlbum, j));
      li.appendChild(btn);
      tracksEl.appendChild(li);
    });
  }

  /* ---------- 재생 ---------- */
  function play(ai, ti) {
    const a = albumInfo(ai);
    const t = a.tracks[ti];
    if (!t) return;
    playAlbum = ai; playTrack = ti;
    root.classList.add('has-track');
    statusEl.textContent = '';
    nowTitle.innerHTML = clean(t.title);
    setCover('.lp-label-img', a.cover);
    setCover('.lp-mini-img', a.cover);
    $('.lp-mini-text').innerHTML = clean(t.title);
    audio.src = t.src;
    audio.play().catch(() => {});
    renderTracks();
  }
  function toggle() {
    if (playAlbum < 0) { if (viewAlbum >= 0) play(viewAlbum, 0); return; }
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  }
  function step(d) {
    if (playAlbum < 0) return;
    const n = albumInfo(playAlbum).tracks.length;
    play(playAlbum, (playTrack + d + n) % n);
  }

  audio.addEventListener('play', () => {
    root.classList.add('is-playing');
    playBtn.innerHTML = icon.pause; playBtn.setAttribute('aria-label', '일시정지');
  });
  audio.addEventListener('pause', () => {
    root.classList.remove('is-playing');
    playBtn.innerHTML = icon.play; playBtn.setAttribute('aria-label', '재생');
  });
  audio.addEventListener('loadedmetadata', () => { $('.lp-dur').textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    $('.lp-cur').textContent = fmt(audio.currentTime);
    if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
  });
  audio.addEventListener('ended', () => {
    const n = albumInfo(playAlbum).tracks.length;
    if (playTrack < n - 1) play(playAlbum, playTrack + 1);    // 다음 곡 자동 재생
  });
  audio.addEventListener('error', () => {
    root.classList.remove('is-playing');
    statusEl.textContent = `음원 파일을 찾을 수 없습니다: ${audio.getAttribute('src')}`;
  });
  seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
  });

  /* ---------- 이벤트 연결 ---------- */
  cards.forEach((card, i) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${albumInfo(i).title} 수록곡 보기`);
    card.addEventListener('click', () => open(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
  root.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', close));
  playBtn.addEventListener('click', toggle);
  $('.lp-prev').addEventListener('click', () => step(-1));
  $('.lp-next').addEventListener('click', () => step(1));
  $('.lp-mini').addEventListener('click', () => open(playAlbum >= 0 ? playAlbum : 0));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) close();
  });
})();
