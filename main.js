const WEBAPP_URL = 'YOUR_WEBAPP_URL';

let nickname = '';
let pin = '';
let stampsState = {};
let authMode = '';

const SPOTS = [
  {
    spotId: 'spot1',
    name: 'クジラ',
    code: '1234',
    stampURL: 'https://i.imgur.com/bvgNF9A.png',
    fallbackURL: 'https://i.imgur.com/bvgNF9A.png'
  },
  {
    spotId: 'spot2',
    name: 'ヨット',
    code: '5678',
    stampURL: 'https://i.imgur.com/Za5d3PQ.png',
    fallbackURL: 'https://i.imgur.com/Za5d3PQ.png'
  },
  {
    spotId: 'spot3',
    name: 'ヤシの木',
    code: '9999',
    stampURL: 'https://i.imgur.com/MSjf7Sr.png',
    fallbackURL: 'https://i.imgur.com/MSjf7Sr.png'
  }
];

const DIGIT_IMAGES = [
  'https://i.imgur.com/GHSxVu9.png',
  'https://i.imgur.com/Xl5wfjV.png',
  'https://i.imgur.com/yatEQu7.png',
  'https://i.imgur.com/XigHeh1.png',
  'https://i.imgur.com/O9rHaSK.png',
  'https://i.imgur.com/3LtxEO9.png',
  'https://i.imgur.com/VZKWZvY.png',
  'https://i.imgur.com/864NE8L.png',
  'https://i.imgur.com/ogZFbNo.png',
  'https://i.imgur.com/DFky1KH.png'
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

function checkOrientation() {
  const warn = document.getElementById('orientation-warning');
  if (!warn) return;
  if (window.matchMedia('(orientation: portrait)').matches) {
    warn.style.display = 'none';
  } else {
    warn.style.display = 'flex';
  }
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

function spawnParticles(target, count = 12) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 20;
    p.style.setProperty('--x', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--y', Math.sin(angle) * dist + 'px');
    p.style.setProperty('--color', `hsl(${Math.floor(Math.random()*360)},80%,60%)`);
    target.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

let enteredDigits = [0, 0, 0, 0];
let dialStartY = [];

function createDialSlots() {
  const dial = document.getElementById('dial');
  dial.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    slot.className = 'dial-slot';
    const up = document.createElement('button');
    up.className = 'dial-arrow dial-up';
    up.innerHTML = `<img src="https://i.imgur.com/CcRJgcL.png" loading="lazy" decoding="async" alt="up">`;
    const digit = document.createElement('img');
    digit.className = 'dial-digit';
    digit.dataset.index = i;
    digit.src = DIGIT_IMAGES[0];
    digit.loading = 'lazy';
    digit.decoding = 'async';
    const down = document.createElement('button');
    down.className = 'dial-arrow dial-down';
    down.innerHTML = `<img src="https://i.imgur.com/iCW495w.png" loading="lazy" decoding="async" alt="down">`;
    slot.appendChild(up);
    slot.appendChild(digit);
    slot.appendChild(down);
    dial.appendChild(slot);
  }
}

function initDial() {
  createDialSlots();
  const digits = document.querySelectorAll('.dial-digit');
  digits.forEach((img, i) => {
    img.addEventListener('pointerdown', ev => {
      dialStartY[i] = ev.clientY;
      img.setPointerCapture(ev.pointerId);
    });
    img.addEventListener('pointermove', ev => {
      if (dialStartY[i] == null) return;
      const delta = ev.clientY - dialStartY[i];
      if (Math.abs(delta) >= 20) {
        const steps = Math.floor(delta / 20);
        rotateDigit(i, steps);
        dialStartY[i] = ev.clientY;
      }
    });
    img.addEventListener('pointerup', ev => {
      dialStartY[i] = null;
      img.releasePointerCapture(ev.pointerId);
    });
    img.addEventListener('pointercancel', ev => {
      dialStartY[i] = null;
      img.releasePointerCapture(ev.pointerId);
    });
    img.addEventListener('transitionend', () => {
      img.classList.remove('spin-up', 'spin-down');
    });
  });

  document.querySelectorAll('.dial-up').forEach((btn, i) => {
    btn.addEventListener('click', () => rotateDigit(i, -1));
  });
  document.querySelectorAll('.dial-down').forEach((btn, i) => {
    btn.addEventListener('click', () => rotateDigit(i, 1));
  });
}

function rotateDigit(i, step) {
  if (step === 0) return;
  enteredDigits[i] = (enteredDigits[i] - step + 10) % 10;
  const img = document.querySelectorAll('.dial-digit')[i];
  img.classList.remove('spin-up', 'spin-down');
  void img.offsetWidth; // reflow for restart animation
  img.src = DIGIT_IMAGES[enteredDigits[i]];
  if (step > 0) {
    img.classList.add('spin-down');
  } else {
    img.classList.add('spin-up');
  }
  const seDial = document.getElementById('se-dial');
  if (seDial) {
    seDial.currentTime = 0;
    seDial.play().catch(() => {});
  }
  if (navigator.vibrate) navigator.vibrate(10);
  checkCode();
}

function resetDial() {
  enteredDigits = [0, 0, 0, 0];
  document.querySelectorAll('.dial-digit').forEach((img) => (img.src = DIGIT_IMAGES[0]));
}

function checkCode() {
  const code = enteredDigits.join('');
  SPOTS.some(spot => {
    if (!stampsState[spot.spotId] && code === spot.code) {
      stampsState[spot.spotId] = true;
      triggerStamp(spot);
      return true;
    }
    return false;
  });
}

function triggerStamp(spot) {
  const container = $(spot.spotId);
  const img = container.querySelector('img');
  img.dataset.fallback = spot.fallbackURL;
  img.src = spot.stampURL;
  img.onerror = () => {
    if (img.dataset.fallback) img.src = img.dataset.fallback;
  };
  img.style.display = 'block';
  container.classList.add('stamped');
  spawnParticles(container);
  const seStamp = document.getElementById('se-stamp');
  if (seStamp) seStamp.play().catch(() => {});
  if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
  syncToSheet(spot.spotId);
  resetDial();

  if (Object.values(stampsState).every(v => v)) {
    $('complete-effect').style.display = 'flex';
    spawnParticles(document.getElementById('complete-effect'), 40);
    const seComplete = document.getElementById('se-complete');
    if (seComplete) seComplete.play().catch(() => {});
    if (navigator.vibrate) navigator.vibrate([100, 30, 100]);
    setTimeout(() => {
      $('complete-effect').style.display = 'none';
    }, 4000);
  }
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
      .then(r => {
        if (!r.ok) throw new Error('server');
        return r.json();
      })
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
      .catch(err => {
        if (err.message === 'server') {
          $('login-error').textContent = 'サーバー側でエラーが発生しました';
        } else {
          $('login-error').textContent = 'タイムアウトしました';
        }
      });
  } else {
    fetch(`${WEBAPP_URL}?nickname=${encodeURIComponent(n)}&pin=${encodeURIComponent(p)}`)
      .then(r => {
        if (!r.ok) throw new Error('server');
        return r.json();
      })
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
      .catch(err => {
        if (err.message === 'server') {
          $('login-error').textContent = 'サーバー側でエラーが発生しました';
        } else {
          $('login-error').textContent = 'タイムアウトしました';
        }
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
  })
    .then(r => {
      if (!r.ok) throw new Error('server');
      return r.json();
    })
    .then(() => {
      $('sync-msg').textContent = '同期しました';
      localStorage.setItem('stampMemo', $('memo-input').value);
      saveToLocal();
      renderStamps();
    })
    .catch(err => {
      if (err.message === 'server') {
        $('sync-msg').textContent = 'サーバー側でエラーが発生しました';
      } else {
        $('sync-msg').textContent = 'タイムアウトしました';
      }
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
  window.addEventListener('resize', checkOrientation);
  window.addEventListener('orientationchange', checkOrientation);
  initDial();
  restoreFromLocal();
  checkOrientation();
}

document.addEventListener('DOMContentLoaded', setup);
