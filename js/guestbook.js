/* =========================================================
   방명록 (GUESTBOOK)

   ▶ 아래 GUESTBOOK_URL 에 구글 Apps Script 웹 앱 주소를 넣으면
     모든 방문자가 함께 보는 방명록이 됩니다. (설정 방법: guestbook-setup.md)
   ▶ 비워두면 '미리보기 모드' — 글이 내 브라우저에만 저장됩니다.
   ========================================================= */
const GUESTBOOK_URL = '';   // 예: 'https://script.google.com/macros/s/……/exec'

(function () {
  const form = document.getElementById('gbForm');
  if (!form) return;

  const nameEl = document.getElementById('gbName');
  const msgEl = document.getElementById('gbMsg');
  const listEl = document.getElementById('gbList');
  const countEl = document.getElementById('gbCount');
  const noteEl = document.getElementById('gbNote');
  const submitBtn = form.querySelector('.gb-submit');
  const LOCAL_KEY = 'rescene-guestbook';
  const NAME_KEY = 'rescene-guestbook-name';
  const online = GUESTBOOK_URL.trim() !== '';

  /* ---------- 저장소 ---------- */
  function readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch (e) { return []; }
  }
  function writeLocal(list) {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, 100))); } catch (e) {}
  }

  async function load() {
    if (!online) return readLocal();
    const res = await fetch(GUESTBOOK_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('load failed');
    return res.json();
  }

  async function save(entry) {
    if (!online) {
      const list = readLocal();
      list.unshift(entry);
      writeLocal(list);
      return;
    }
    // text/plain 으로 보내야 구글 Apps Script 가 추가 확인 없이 받아줍니다
    const res = await fetch(GUESTBOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ name: entry.name, msg: entry.msg })
    });
    if (!res.ok) throw new Error('save failed');
  }

  /* ---------- 화면 그리기 ---------- */
  function formatTime(t) {
    const d = new Date(t);
    if (isNaN(d)) return '';
    const diff = (Date.now() - d) / 1000;
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}`;
  }

  function render(list) {
    countEl.textContent = list.length;
    listEl.innerHTML = '';
    if (!list.length) {
      const li = document.createElement('li');
      li.className = 'gb-empty';
      li.textContent = '아직 남겨진 글이 없어요. 첫 번째 방명록을 남겨주세요!';
      listEl.appendChild(li);
      return;
    }
    list.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'gb-item';
      const name = String(item.name || '익명');
      // 사용자가 쓴 글은 항상 textContent 로 넣어서 HTML 로 해석되지 않게 합니다 (보안)
      li.innerHTML = `
        <span class="gb-avatar" aria-hidden="true"></span>
        <div class="gb-body">
          <div class="gb-meta"><strong class="gb-nick"></strong><time class="gb-time"></time></div>
          <p class="gb-text"></p>
        </div>`;
      li.querySelector('.gb-avatar').textContent = name.trim().charAt(0).toUpperCase();
      li.querySelector('.gb-nick').textContent = name;
      li.querySelector('.gb-time').textContent = formatTime(item.time);
      if (item.time) li.querySelector('.gb-time').dateTime = new Date(item.time).toISOString();
      li.querySelector('.gb-text').textContent = String(item.msg || '');
      listEl.appendChild(li);
    });
  }

  function note(text, isError) {
    noteEl.textContent = text;
    noteEl.classList.toggle('is-error', !!isError);
  }

  async function refresh() {
    try { render(await load()); }
    catch (e) { render([]); note('방명록을 불러오지 못했어요. 잠시 후 다시 시도해주세요.', true); }
  }

  /* ---------- 글 남기기 ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameEl.value.trim();
    const msg = msgEl.value.trim();
    if (!name) { note('닉네임을 입력해주세요.', true); nameEl.focus(); return; }
    if (!msg) { note('메시지를 입력해주세요.', true); msgEl.focus(); return; }

    submitBtn.disabled = true;
    note('등록 중…');
    try {
      await save({ name, msg, time: new Date().toISOString() });
      try { localStorage.setItem(NAME_KEY, name); } catch (err) {}
      msgEl.value = '';
      note(online ? '방명록이 등록되었어요. 고마워요!' : '등록되었어요. (미리보기 모드: 내 브라우저에만 저장됩니다)');
      await refresh();
      listEl.scrollTop = 0;
    } catch (err) {
      note('등록에 실패했어요. 잠시 후 다시 시도해주세요.', true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  // 지난번에 쓴 닉네임 기억
  try { nameEl.value = localStorage.getItem(NAME_KEY) || ''; } catch (e) {}

  if (!online) note('미리보기 모드: 남긴 글이 내 브라우저에만 저장됩니다.');
  refresh();
})();
