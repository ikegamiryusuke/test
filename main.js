const WEBAPP_URL = 'YOUR_WEBAPP_URL';

let nickname = '';
let pin = '';
let stampsState = {};
let authMode = '';

const SPOTS = [
  { spotId: 'spot1', name: 'クジラ', code: '1234', stampURL: '', fallbackURL: '' },
  { spotId: 'spot2', name: 'ヨット', code: '5678', stampURL: '', fallbackURL: '' },
  { spotId: 'spot3', name: 'ヤシの木', code: '9999', stampURL: '', fallbackURL: '' },
];

function createStampBoard() {
  const board = document.getElementById('stamp-board');
  board.innerHTML = '';
  SPOTS.forEach(s => {
    const frame = document.createElement('div');
    frame.className = 'stamp-frame';
    frame.id = s.spotId;
    const img = document.createElement('img');
    img.alt = s.name;
    img.decoding = 'async';
    img.loading = 'lazy';
    if (s.stampURL) {
      img.src = s.stampURL;
      img.dataset.fallback = s.fallbackURL;
      img.onerror = () => {
        if (img.dataset.fallback) img.src = img.dataset.fallback;
      };
    }
    frame.appendChild(img);
    const label = document.createElement('div');
    label.className = 'stamp-label';
    label.textContent = s.name;
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.appendChild(frame);
    wrapper.appendChild(label);
    board.appendChild(wrapper);
  });
}

function $(id) { return document.getElementById(id); }

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  $(id).style.display = 'flex';
}

function saveToLocal() {
  localStorage.setItem('stampUser', JSON.stringify({ nickname, pin }));
  localStorage.setItem('stampsState', JSON.stringify(stampsState));
}

function restoreFromLocal() {
  const u = JSON.parse(localStorage.getItem('stampUser') || 'null');
  const s = JSON.parse(localStorage.getItem('stampsState') || 'null');
  if (u && typeof u.nickname === 'string' && typeof u.pin === 'string' && /^\d{4}$/.test(u.pin) && s) {
    nickname = u.nickname;
    pin = u.pin;
    stampsState = s;
    showPage('main-page');
    renderStamps();
    restoreMemo();
  } else {
    nickname = '';
    pin = '';
    showPage('mode-page');
  }
}

function renderStamps() {
  SPOTS.forEach(s => {
    if (stampsState[s.spotId]) {
      $(s.spotId).classList.add('stamped');
    } else {
      $(s.spotId).classList.remove('stamped');
    }
  });
}

function restoreMemo() {
  $('memo-input').value = localStorage.getItem('stampMemo') || '';
}

function errorMessage(code) {
  switch (code) {
    case 'not found':
      return 'ユーザーが見つかりません';
    case 'duplicate':
      return 'すでに登録されています';
    case 'missing param':
      return '必要な情報が不足しています';
    default:
      return code || '未知のエラー';
  }
}

function requireUser(msgTarget) {
  if (!nickname || !pin) {
    if (msgTarget) msgTarget.textContent = '内部エラー：ユーザー情報がありません。もう一度ログインしてください。';
    showPage('mode-page');
    return false;
  }
  return true;
}

function cycleDigit(el) {
  let num = parseInt(el.textContent, 10);
  num = (num + 1) % 10;
  el.textContent = String(num);
}

function getDialValue() {
  return Array.from(document.querySelectorAll('#dial .dial-slot'))
    .map(el => el.textContent).join('');
}

function resetDial() {
  document.querySelectorAll('#dial .dial-slot').forEach(el => el.textContent = '0');
}

function login() {
  const n = $('nick').value.trim();
  const p = $('pin').value.trim();
  if (!n || p.length !== 4) {
    $('login-error').textContent = '入力を確認してください';
    return;
  }
  console.log('API呼び出し時', { nickname: n, pin: p, mode: authMode });
  if (authMode === 'signup') {
    const body = { nickname: n, pin: p, mode: 'register' };
    SPOTS.forEach(s => { body[s.spotId] = false; });
    fetch(WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          $('login-error').textContent = errorMessage(data.error);
        } else {
          nickname = n;
          pin = p;
          stampsState = {};
          SPOTS.forEach(s => { stampsState[s.spotId] = false; });
          $('memo-input').value = '';
          localStorage.setItem('stampMemo', '');
          saveToLocal();
          showPage('main-page');
          renderStamps();
        }
      })
      .catch(() => {
        $('login-error').textContent = 'サーバに接続できません。時間をおいて再試行してください';
      });
  } else {
    fetch(`${WEBAPP_URL}?nickname=${encodeURIComponent(n)}&pin=${encodeURIComponent(p)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          $('login-error').textContent = errorMessage(data.error);
        } else {
          nickname = n;
          pin = p;
          stampsState = {};
          SPOTS.forEach(s => { stampsState[s.spotId] = data[s.spotId]; });
          $('memo-input').value = data.memo || '';
          localStorage.setItem('stampMemo', $('memo-input').value);
          saveToLocal();
          showPage('main-page');
          renderStamps();
        }
      })
      .catch(() => {
        $('login-error').textContent = 'サーバに接続できません。時間をおいて再試行してください';
      });
  }
}

function syncToSheet(spotId) {
  if (!requireUser($('sync-msg'))) return;
  console.log('API呼び出し時', { nickname, pin });
  const body = { nickname, pin };
  if (spotId) {
    stampsState[spotId] = true;
    body[spotId] = true;
  }
  body.memo = $('memo-input').value;
  fetch(WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json()).then(() => {
    $('sync-msg').textContent = '同期しました';
    localStorage.setItem('stampMemo', $('memo-input').value);
    saveToLocal();
    renderStamps();
  }).catch(() => {
    $('sync-msg').textContent = 'サーバに接続できません。再ログインしてください';
  });
}

function setup() {
  createStampBoard();
  $('login-btn').addEventListener('click', login);
  $('choose-signin').addEventListener('click', () => { authMode = 'signin'; showPage('input-page'); });
  $('choose-signup').addEventListener('click', () => { authMode = 'signup'; showPage('input-page'); });
  $('sync-button').addEventListener('click', () => syncToSheet());
  $('memo-input').addEventListener('input', () => {
    localStorage.setItem('stampMemo', $('memo-input').value);
  });
  document.querySelectorAll('#dial .dial-slot').forEach(el => {
    el.addEventListener('click', () => {
      cycleDigit(el);
      const val = getDialValue();
      SPOTS.forEach(s => {
        if (val === s.code && !$(s.spotId).classList.contains('stamped')) {
          $(s.spotId).classList.add('stamped');
          syncToSheet(s.spotId);
          resetDial();
          if (document.querySelectorAll('.stamp-frame.stamped').length === SPOTS.length) {
            $('complete-effect').style.display = 'flex';
          }
        }
      });
    });
  });
  restoreFromLocal();
}

document.addEventListener('DOMContentLoaded', setup);
