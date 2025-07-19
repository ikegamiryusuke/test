/** Spreadsheet ID used to store player data */
// Spreadsheet used to store player data
const SPREADSHEET_ID = '19vdwSjc_4zYtBo5XNZVhT_QylE8Qm4EZhJP07DUe7YQ';
/** Name of the sheet that holds user records */
const SHEET_NAME = 'Users';
/** Secret codes for each stamp location */
const STAMP_CODES = ['1234', '5678', '9999'];
/** Total number of stamp slots */
const NUM_STAMPS = STAMP_CODES.length;

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
  return HtmlService.createHtmlOutputFromFile('index.html');
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
    var rowNick = data[i][0];
    var rowBirth = data[i][1];
    if (rowNick === nickname) {
      if (rowBirth === birthday) {
        var progress = (data[i][2] || '').toString().padEnd(NUM_STAMPS, '0');
        return {status: 'login', progress: progress};
      }
      return {status: 'error', message: 'Nickname already taken'};
    }
  }

  var newProgress = Array(NUM_STAMPS).fill('0').join('');
  sheet.appendRow([nickname, birthday, newProgress]);
  return {status: 'registered', progress: newProgress};
}

function submitCode(form) {
  var nickname = (form.nickname || '').trim();
  var birthday = (form.birthday || '').trim();
  var code = (form.code || '').trim();
  if (!nickname || !birthday || !code) {
    return {error: 'Missing data'};
  }

  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === nickname && data[i][1] === birthday) {
      var progress = (data[i][2] || '').toString().padEnd(NUM_STAMPS, '0');
      var idx = STAMP_CODES.indexOf(code);
      if (idx >= 0 && progress[idx] === '0') {
        progress = progress.substring(0, idx) + '1' + progress.substring(idx + 1);
        sheet.getRange(i + 1, 3).setValue(progress);
      }
      return {progress: progress, complete: progress.indexOf('0') === -1};
    }
  }
  return {error: 'User not found'};
}
