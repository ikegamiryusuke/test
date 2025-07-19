const SHEET_NAME = 'users';
const CODE_SHEET = 'codes';

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['nickname', 'birth', 'stamp1', 'stamp2', 'stamp3', 'memo', '最終更新']);
  }
  return sheet;
}

function getSpots() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CODE_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CODE_SHEET);
    sheet.appendRow(['spotId', 'name', 'code', 'stampURL']);
    sheet.appendRow(['spot1', 'スポット1', '1234', 'https://via.placeholder.com/80?text=1']);
    sheet.appendRow(['spot2', 'スポット2', '5678', 'https://via.placeholder.com/80?text=2']);
    sheet.appendRow(['spot3', 'スポット3', '9999', 'https://via.placeholder.com/80?text=3']);
  }
  const vals = sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues();
  return vals.map(r => ({ spotId:r[0], name:r[1], code:r[2], stampURL:r[3] }));
}

function getSpotsJson() {
  return JSON.stringify(getSpots());
}

function doGet(e) {
  const file = e.parameter.file;
  if (file === 'style.css') {
    return ContentService.createTextOutput(
      HtmlService.createHtmlOutputFromFile('style.css').getContent()
    ).setMimeType(ContentService.MimeType.CSS);
  }
  if (file === 'main.js') {
    return ContentService.createTextOutput(
      HtmlService.createHtmlOutputFromFile('main.js').getContent()
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  const tmpl = HtmlService.createTemplateFromFile('index');
  tmpl.WEBAPP_URL = ScriptApp.getService().getUrl();
  tmpl.getSpotsJson = getSpotsJson;
  return tmpl.evaluate();
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  switch (data.mode) {
    case 'login':
      return handleLogin(data);
    case 'register':
      return handleRegister(data);
    case 'stamp':
      return handleStamp(data);
    default:
      return json({error:'invalid_mode'});
  }
}

function handleRegister(d) {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === d.nickname) {
      return json({error:'nickname_taken'});
    }
  }
  sheet.appendRow([d.nickname, d.birth, '', '', '', '', new Date()]);
  return json({nickname:d.nickname, spot1:false, spot2:false, spot3:false});
}

function handleLogin(d) {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === d.nickname && rows[i][1] === d.birth) {
      return json({
        nickname: rows[i][0],
        spot1: !!rows[i][2],
        spot2: !!rows[i][3],
        spot3: !!rows[i][4],
        memo: rows[i][5] || ''
      });
    }
  }
  return json({error:'not_found'});
}

function handleStamp(d) {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const spots = getSpots();
  const spot = spots.find(s => s.spotId === d.spotId);
  if (!spot || spot.code !== d.code.replace(/\D/g,'')) {
    return json({error:'invalid_code'});
  }
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === d.nickname && rows[i][1] === d.birth) {
      const col = d.spotId === 'spot1' ? 3 : d.spotId === 'spot2' ? 4 : 5;
      if (rows[i][col-1]) {
        return json({error:'already'});
      }
      sheet.getRange(i+1, col).setValue(new Date());
      sheet.getRange(i+1, 7).setValue(new Date());
      const updated = sheet.getRange(i+1, 3, 1, 3).getValues()[0];
      const complete = updated.every(String);
      return json({complete: complete});
    }
  }
  return json({error:'not_found'});
}
