const SPREADSHEET_ID = '19vdwSjc_4zYtBo5XNZVhT_QylE8Qm4EZhJP07DUe7YQ';
const SHEET_NAME = 'Users';

// 変更しやすいよう、スタンプの情報をオブジェクトで保持
// id は画面上の要素名に利用されます
const STAMPS = [
  { id: 'spot1', code: '1234', img: 'https://i.imgur.com/bvgNF9A.png' },
  { id: 'spot2', code: '5678', img: 'https://i.imgur.com/Za5d3PQ.png' },
  { id: 'spot3', code: '9999', img: 'https://i.imgur.com/MSjf7Sr.png' },
];
const NUM_STAMPS = STAMPS.length;

// 背景パターンも定数で定義してテンプレートへ渡す
const BACKGROUND = 'linear-gradient(#fdf7e8, #e8ddb9)';

/**
 * Fetch the data sheet, creating it if necessary.
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getOrCreateSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Nickname', 'Birthday', 'Progress']);
  }
  return sheet;
}


function doGet(e) {
  var tpl = HtmlService.createTemplateFromFile('index.html');
  tpl.spotsJson = getSpotsJson();
  tpl.background = BACKGROUND;
  tpl.webAppUrl = ScriptApp.getService().getUrl();
  return tpl.evaluate();
}

function getSpotsJson() {
  return JSON.stringify(STAMPS.map(function(s) {
    return { id: s.id, img: s.img };
  }));
}

function processLogin(form) {
  var nickname = (form.nickname || '').trim();
  var birthday = (form.birthday || '').trim();
  if (!nickname || !birthday) {
    return {status: 'error', message: 'Missing nickname or birthday'};
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === nickname) {
      if (data[i][1] !== birthday) {
        return {status: 'error', message: 'Nickname already taken'};
      }
      var prog = ('' + (data[i][2] || '')).padEnd(NUM_STAMPS, '0').substring(0, NUM_STAMPS);
      return {status: 'login', progress: prog, row: i + 1};
    }
  }

  var newProgress = Array(NUM_STAMPS + 1).join('0');
  sheet.appendRow([nickname, birthday, newProgress]);
  return {status: 'registered', progress: newProgress, row: sheet.getLastRow()};
}

function submitCode(form) {
  var nickname = (form.nickname || '').trim();
  var birthday = (form.birthday || '').trim();
  var code = (form.code || '').trim();
  var row = parseInt(form.row, 10) || 0;
  if (!nickname || !birthday || !code) {
    return {error: 'Missing data'};
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  var progress;
  if (row > 1) {
    var values = sheet.getRange(row, 1, 1, 3).getValues()[0];
    if (values[0] === nickname && values[1] === birthday) {
      progress = ('' + (values[2] || '')).padEnd(NUM_STAMPS, '0').substring(0, NUM_STAMPS);
    }
  }
  if (progress === undefined) {
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === nickname && data[i][1] === birthday) {
        row = i + 1;
        progress = ('' + (data[i][2] || '')).padEnd(NUM_STAMPS, '0').substring(0, NUM_STAMPS);
        break;
      }
    }
  }
  if (progress === undefined) {
    return {error: 'User not found'};
  }
  var idx = -1;
  for (var i = 0; i < STAMPS.length; i++) {
    if (STAMPS[i].code === code) { idx = i; break; }
  }
  if (idx >= 0 && progress[idx] === '0') {
    progress = progress.substring(0, idx) + '1' + progress.substring(idx + 1);
    sheet.getRange(row, 3).setValue(progress);
  }
  return {progress: progress, complete: progress.indexOf('0') === -1, row: row};
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}
