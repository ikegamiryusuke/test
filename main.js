// ============================ main.js ============================
// Google Apps Script WebApp Front-End (Refined – no localStorage)
// -----------------------------------------------------------------

// 1. DOM helpers & Utilities ---------------------------------------
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel); // querySelectorのエイリアス
const show = el => el.classList.remove('hidden');
const hide = el => el.classList.add('hidden');

// 2. 画面要素 (DOM キャッシュ) --------------------------------------
const scrMode = $('mode-screen');
const scrAuth = $('auth-screen');
const scrMain = $('main-screen');

const chooseLogin = $('choose-login');
const chooseRegister = $('choose-register');
const backBtn = $('back-mode');
const authBtn = $('btn-auth');

const nickInput = $('nick');
const pinInput = $('pin');
const errNick = $('err-nick');
const errPin = $('err-pin');
const authMsg = $('auth-msg');

const dialArea = $('dial-area');
const errorMsg = $('error');
const loadingOverlay = $('loading-overlay'); // 変数名をより明確に
const completeOverlay = $('complete-overlay'); // 変数名をより明確に
const confettiArea = $('confetti');
const stampEffect = $('stampEffect');
const stampConfetti = $('stampConfetti');
const stampImg = qs('#stampEffect .stamp');

// 3. 定数・状態 ----------------------------------------------------
const WEBAPP_URL = window.WEBAPP_URL;
const SPOTS = JSON.parse($('spot-data').textContent); // [{spotId,name,code,stampURL},...]

let curUser = null; // {nickname,pin}
let stamped = { spot1: false, spot2: false, spot3: false }; // {spot1:true,...}
let dialNodes = []; // 4桁ダイヤルDOM要素配列

const ERR_MSG = {
  missing_param: '入力が不足しています',
  not_found: 'ユーザーが見つかりません',
  nickname_taken: 'そのニックネームは使用済みです',
  invalid_code: 'コードが違います',
  already: 'そのスタンプは取得済みです',
  internal_error: 'サーバーエラーが発生しました',
  network: '通信に失敗しました'
};

let errTimer = null;
function showError(key, el = errorMsg) { // デフォルト引数でerrorMsgを設定
  clearTimeout(errTimer);
  el.textContent = ERR_MSG[key] || ('エラー:' + key); // より分かりやすいメッセージ形式
  errTimer = setTimeout(() => { el.textContent = ''; }, 3500);
}

// 4. fetch ラッパー ------------------------------------------------
async function postJSON(body) {
  show(loadingOverlay); // DOMキャッシュ変数を使用
  try {
    const res = await fetch(WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return await res.json();
  } catch (e) {
    console.error('POST error:', e); // エラーログをより詳細に
    return { error: 'network' }; // ネットワークエラーを返す
  } finally {
    hide(loadingOverlay); // DOMキャッシュ変数を使用
  }
}

// 5. 認証画面 -----------------------------------------------------
function clearAuth() {
  nickInput.value = '';
  pinInput.value = '';
  errNick.textContent = errPin.textContent = authMsg.textContent = '';
}

async function submitAuth(mode) {
  const nick = nickInput.value.trim();
  const pin = pinInput.value.trim();
  if (!nick) { errNick.textContent = '必須'; return; }
  if (!/^\d{4}$/.test(pin)) { errPin.textContent = '4桁数字'; return; } // 正規表現を修正
  errNick.textContent = errPin.textContent = ''; // エラーメッセージをクリア

  const res = await postJSON({ mode, nickname: nick, pin });
  if (res.error) { showError(res.error, authMsg); return; }

  curUser = { nickname: res.nickname, pin };
  stamped = { spot1: !!res.spot1, spot2: !!res.spot2, spot3: !!res.spot3 };
  setupMain();
  goto(scrMain);
}

// イベントリスナーの登録 (DOMキャッシュ変数を使用)
chooseLogin.onclick = () => { clearAuth(); $('auth-title').textContent = 'ログイン'; goto(scrAuth); };
chooseRegister.onclick = () => { clearAuth(); $('auth-title').textContent = '新規登録'; goto(scrAuth); };
backBtn.onclick = () => { goto(scrMode); };
authBtn.onclick = () => submitAuth($('auth-title').textContent === '新規登録' ? 'register' : 'login');

// 6. メイン画面 ----------------------------------------------------
function setupMain() {
  // スタンプスロット描画
  SPOTS.forEach(s => {
    const slot = $(`slot-${s.spotId}`);
    slot.innerHTML = '';
    if (stamped[s.spotId]) fillStamp(slot, s.stampURL);
  });
  renderDials(); // ダイヤル描画
}

function fillStamp(slot, url) {
  const img = new Image();
  img.className = 'stamp-img';
  img.src = url;
  slot.appendChild(img);
}

function createConfetti(container, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const size = Math.random() * 8 + 6;
    p.style.width = size + 'px';
    p.style.height = size * 0.4 + 'px';
    p.style.background = `hsl(${Math.random()*360},80%,50%)`;
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = Math.random() * 1.5 + 1 + 's';
    container.appendChild(p);
  }
  setTimeout(() => container.innerHTML = '', 1600);
}

function runStampEffect(url) {
  stampImg.style.backgroundImage = `url(${url})`;
  stampImg.textContent = '';
  stampEffect.classList.add('show');
  createConfetti(stampConfetti, 40);
  setTimeout(() => stampEffect.classList.remove('show'), 1000);
}

function renderDials() {
  dialArea.innerHTML = '';
  dialNodes = [];
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'dial';
    d.textContent = '0';
    d.onclick = e => {
      const rect = d.getBoundingClientRect();
      const up = (e.clientY - rect.top) < rect.height / 2; // 上半分クリック
      let v = parseInt(d.textContent, 10); // 数値として取得
      v = (up ? (v + 1) : (v + 9)) % 10; // 上半分で+1、下半分で-1 (0-9循環)
      d.textContent = v.toString(); // 文字列に戻す
      checkCode();
    };
    dialArea.appendChild(d);
    dialNodes.push(d);
  }
}

async function checkCode() {
  const code = dialNodes.map(n => n.textContent).join('');
  // 未取得のスタンプがあるか、かつ入力されたコードが正しいか
  for (const s of SPOTS) {
    if (code === s.code && !stamped[s.spotId]) {
      const res = await postJSON({
        mode: 'stamp',
        nickname: curUser.nickname,
        pin: curUser.pin,
        spotId: s.spotId,
        code // サーバー側での二重チェック用
      });
      if (res.error) { showError(res.error); return; }
      stamped[s.spotId] = true; // クライアント側の状態を更新
      fillStamp($(`slot-${s.spotId}`), s.stampURL); // スタンプ描画
      runStampEffect(s.stampURL);
      if (res.complete) setTimeout(showComplete, 1100); // 演出後に表示
      dialNodes.forEach(n => n.textContent = '0'); // ダイヤルをリセット
      return; // 該当スタンプが見つかったら終了
    }
  }
}

function showComplete() {
  show(completeOverlay); // DOMキャッシュ変数を使用
  createConfetti(confettiArea, 80);
  setTimeout(() => hide(completeOverlay), 4000); // 表示時間を少し長く (UXのため)
}

// 7. 画面遷移ロジック ----------------------------------------------
function goto(screen) {
  [scrMode, scrAuth, scrMain].forEach(hide); // 全ての画面を非表示に
  show(screen); // 指定された画面を表示
}

// 8. アプリ起動時の処理 --------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  goto(scrMode); // アプリ起動時は常にモード選択画面から開始
});

// ======================== end main.js ============================
