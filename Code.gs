function doGet(e) {
  var nickname = e.parameter.nickname;
  var pin = e.parameter.pin;
  if (!nickname || !pin) {
    return outputJson({ error: 'missing param' });
  }

  var sheet = getSheet();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === nickname && String(values[i][1]) === String(pin)) {
      return outputJson({
        nickname: values[i][0],
        pin: values[i][1],
        spot1: values[i][2],
        spot2: values[i][3],
        spot3: values[i][4],
        memo: values[i][5],
        updated_at: values[i][6],
      });
    }
  }
  return outputJson({ error: 'not found' });
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  if (!data.nickname || !data.pin) {
    return outputJson({ error: 'missing param' });
  }
  var sheet = getSheet();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.nickname && String(values[i][1]) === String(data.pin)) {
      if (data.mode === 'register') {
        return outputJson({ error: 'duplicate' });
      }
      var row = i + 1;
      sheet.getRange(row, 3, 1, 4).setValues([
        [data.spot1, data.spot2, data.spot3, data.memo]
      ]);
      sheet.getRange(row, 7).setValue(new Date());
      return outputJson({ status: 'ok' });
    }
  }
  if (data.mode === 'register') {
    sheet.appendRow([
      data.nickname,
      data.pin,
      !!data.spot1,
      !!data.spot2,
      !!data.spot3,
      data.memo || '',
      new Date()
    ]);
    return outputJson({ status: 'registered' });
  }
  return outputJson({ error: 'not found' });
}

function getSheet() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return SpreadsheetApp.openById(id).getSheetByName('Users');
}

function outputJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
