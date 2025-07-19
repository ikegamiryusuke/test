var USERS_SHEET = 'users';
var CODES_SHEET = 'codes';

function initSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var user = ss.getSheetByName(USERS_SHEET);
  if (!user) {
    user = ss.insertSheet(USERS_SHEET);
    user.appendRow(['nickname', 'pin', 'stamp1', 'stamp2', 'stamp3', 'updated']);
  }
  var codes = ss.getSheetByName(CODES_SHEET);
  if (!codes) {
    codes = ss.insertSheet(CODES_SHEET);
    codes.appendRow(['spotId', 'name', 'code', 'stampURL']);
    codes.appendRow(['spot1', 'スポット1', '1234', 'https://i.imgur.com/bvgNF9A.png']);
    codes.appendRow(['spot2', 'スポット2', '5678', 'https://i.imgur.com/Za5d3PQ.png']);
    codes.appendRow(['spot3', 'スポット3', '9999', 'https://i.imgur.com/MSjf7Sr.png']);
  }
  return { user: user, codes: codes };
}

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getUserSheet() {
  return initSheets().user;
}

function getSpots() {
  var sheet = initSheets().codes;
  var vals = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  return vals.map(function(r) {
    return { spotId: r[0], name: r[1], code: r[2], stampURL: r[3] };
  });
}

function getSpotsJson() {
  return JSON.stringify(getSpots());
}

function doGet(e) {
  initSheets();
  var file = e.parameter.file;
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
  var tmpl = HtmlService.createTemplateFromFile('index');
  tmpl.WEBAPP_URL = ScriptApp.getService().getUrl();
  tmpl.getSpotsJson = getSpotsJson;
  return tmpl.evaluate();
}

function doPost(e) {
  initSheets();
  var data = JSON.parse(e.postData.contents);
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
  var sheet = getUserSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === d.nickname) {
      return json({error:'nickname_taken'});
    }
  }
  sheet.appendRow([d.nickname, d.pin, '', '', '', new Date()]);
  return json({nickname:d.nickname, spot1:false, spot2:false, spot3:false});
}

function handleLogin(d) {
  var sheet = getUserSheet();
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === d.nickname && rows[i][1] === d.pin) {
      return json({
        nickname: rows[i][0],
        spot1: !!rows[i][2],
        spot2: !!rows[i][3],
        spot3: !!rows[i][4]
      });
    }
  }
  return json({error:'not_found'});
}

function handleStamp(d) {
  var sheet = getUserSheet();
  var rows = sheet.getDataRange().getValues();
  var spots = getSpots();
  var spot = null;
  for (var i = 0; i < spots.length; i++) {
    if (spots[i].spotId === d.spotId) {
      spot = spots[i];
      break;
    }
  }
  if (!spot || spot.code !== d.code.replace(/\D/g,'')) {
    return json({error:'invalid_code'});
  }
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === d.nickname && rows[i][1] === d.pin) {
      var col = d.spotId === 'spot1' ? 3 : d.spotId === 'spot2' ? 4 : 5;
      if (rows[i][col-1]) {
        return json({error:'already'});
      }
      sheet.getRange(i+1, col).setValue(new Date());
      sheet.getRange(i+1, 6).setValue(new Date());
      var updated = sheet.getRange(i+1, 3, 1, 3).getValues()[0];
      var complete = updated.every(String);
      return json({complete: complete});
    }
  }
  return json({error:'not_found'});
}
