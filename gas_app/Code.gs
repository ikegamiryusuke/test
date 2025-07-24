const SPREADSHEET_ID = '19vdwSjc_4zYtBo5XNZVhT_QylE8Qm4EZhJP07DUe7YQ';
const SHEET_NAME = 'Users';

// スタンプの定義（ID, コード, 画像URL）
const STAMPS = [
  { id: 'spot1', code: '1234', img: 'https://i.imgur.com/bvgNF9A.png' },
  { id: 'spot2', code: '5678', img: 'https://i.imgur.com/Za5d3PQ.png' },
  { id: 'spot3', code: '9999', img: 'https://i.imgur.com/MSjf7Sr.png' },
];
// 背景画像の既定値
const BACKGROUND = "url('https://i.imgur.com/m5sdGA8.png') no-repeat center/cover";
const STAMP_BACKGROUND = "url('https://i.imgur.com/wAN3v5K.png') no-repeat center/cover";
const NUM_STAMPS = STAMPS.length;

function getRowFromCache(name) {
  const props = PropertiesService.getScriptProperties();
  const key = 'row_' + encodeURIComponent(name);
  let value = props.getProperty(key);
  if (value) {
    return parseInt(value, 10);
  }
  const oldKey = 'row_' + name;
  value = props.getProperty(oldKey);
  if (value) {
    props.setProperty(key, value);
    return parseInt(value, 10);
  }
  return null;
}

function setRowCache(name, row) {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('row_' + encodeURIComponent(name), String(row));
}

function doGet() {
  // Apps Script では拡張子を付けずにファイル名を指定する
  const tpl = HtmlService.createTemplateFromFile('index');
  tpl.spotsJson = getSpotsJson();
  tpl.background = BACKGROUND;
  tpl.stampBg = STAMP_BACKGROUND;
  return tpl.evaluate();
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

function getSpotsJson() {
  return JSON.stringify(STAMPS.map(function(s) { return { id: s.id, img: s.img }; }));
}

function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Nickname', 'Birthday', 'Progress']);
  }
  return sheet;
}

function findUserRow(sheet, nickname) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === nickname) {
      return { row: i + 1, birthday: data[i][1], progress: data[i][2] };
    }
  }
  return null;
}

function processLogin(form) {
  const nickname = (form.nickname || '').trim();
  const birthday = (form.birthday || '').trim();
  if (!nickname || !/^\d{4}$/.test(birthday)) {
    return { status: 'error', message: '入力内容が不正です' };
  }
  const sheet = getSheet();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) {
    return { status: 'error', message: 'しばらくしてからお試しください' };
  }
  try {
    let row = getRowFromCache(nickname);
    if (row && row >= 2 && row <= sheet.getLastRow()) {
      const values = sheet.getRange(row, 1, 1, 3).getValues()[0];
      if (values[0] === nickname) {
        if (values[1] !== birthday) {
          return { status: 'error', message: 'そのニックネームは既に使用されています' };
        }
        const progress = String(values[2] || '').padEnd(NUM_STAMPS, '0').substring(0, NUM_STAMPS);
        return { status: 'login', progress: progress, row: row };
      }
    }

    const user = findUserRow(sheet, nickname);
    if (user) {
      if (user.birthday !== birthday) {
        return { status: 'error', message: 'そのニックネームは既に使用されています' };
      }
      setRowCache(nickname, user.row);
      const progress = String(user.progress || '').padEnd(NUM_STAMPS, '0').substring(0, NUM_STAMPS);
      return { status: 'login', progress: progress, row: user.row };
    }

    const progress = Array(NUM_STAMPS + 1).join('0');
    row = sheet.getLastRow() + 1;
    sheet.appendRow([nickname, birthday, progress]);
    setRowCache(nickname, row);
    return { status: 'registered', progress: progress, row: row };
  } finally {
    lock.releaseLock();
  }
}

function submitCode(form) {
  const nickname = (form.nickname || '').trim();
  const birthday = (form.birthday || '').trim();
  const code = (form.code || '').trim();
  let row = parseInt(form.row, 10) || 0;
  if (!nickname || !/^\d{4}$/.test(birthday) || !code) {
    return { error: '入力内容が不足しています' };
  }
  const sheet = getSheet();
  if (row < 2 || row > sheet.getLastRow()) {
    row = getRowFromCache(nickname);
  }
  let values = null;
  if (row && row >= 2 && row <= sheet.getLastRow()) {
    values = sheet.getRange(row, 1, 1, 3).getValues()[0];
    if (values[0] !== nickname || values[1] !== birthday) {
      row = 0;
      values = null;
    }
  }
  if (!row) {
    const user = findUserRow(sheet, nickname);
    if (!user || user.birthday !== birthday) {
      return { error: 'ユーザーが見つかりません' };
    }
    row = user.row;
    values = [nickname, user.birthday, user.progress];
  }
  setRowCache(nickname, row);

  let progress = String(values[2] || '').padEnd(NUM_STAMPS, '0').substring(0, NUM_STAMPS);
  const idx = STAMPS.findIndex(function(s) { return s.code === code; });
  if (idx >= 0 && progress[idx] === '0') {
    progress = progress.substring(0, idx) + '1' + progress.substring(idx + 1);
    sheet.getRange(row, 3).setValue(progress);
  }
  return { progress: progress, complete: progress.indexOf('0') === -1, row: row };
}

