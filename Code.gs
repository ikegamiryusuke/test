// HTMLを返すハンドラ。クエリにnicknameがあればAPIとして処理します。
function doGet(e) {
  if (e && e.parameter && e.parameter.nickname) {
    return doGetApi(e);
  }
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('スタンプラリー')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// テンプレートから別ファイルを読み込むユーティリティ
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ===== API部分 =====
function doGetApi(e) {
  var nickname = e.parameter.nickname;
  var pin = e.parameter.pin;
  if (!nickname || !pin) {
    return outputJson({ error: 'missing param' });
  }

  var sheet = getSheet();
  var info = getSheetInfo(sheet);
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === nickname && String(values[i][1]) === String(pin)) {
      var obj = {
        nickname: values[i][0],
        pin: values[i][1]
      };
      for (var s = 0; s < info.spotCount; s++) {
        obj['spot' + (s + 1)] = values[i][2 + s];
      }
      obj.memo = values[i][info.memoIndex - 1];
      obj.updated_at = values[i][info.updatedIndex - 1];
      return outputJson(obj);
    }
  }
  return outputJson({ error: 'not found' });
}

function doPost(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return outputJson({ error: 'missing param' });
  }
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return outputJson({ error: 'invalid json' });
  }
  if (!data.nickname || !data.pin) {
    return outputJson({ error: 'missing param' });
  }
  var sheet = getSheet();
  var info = getSheetInfo(sheet);
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === data.nickname && String(values[i][1]) === String(data.pin)) {
      if (data.mode === 'register') {
        return outputJson({ error: 'duplicate' });
      }
      var row = i + 1;
      var arr = [];
      for (var s = 0; s < info.spotCount; s++) {
        arr.push(!!data['spot' + (s + 1)]);
      }
      arr.push(data.memo || '');
      sheet.getRange(row, 3, 1, info.spotCount + 1).setValues([arr]);
      sheet.getRange(row, info.updatedIndex).setValue(new Date());
      return outputJson({ status: 'ok' });
    }
  }
  if (data.mode === 'register') {
    var newRow = [data.nickname, data.pin];
    for (var s = 0; s < info.spotCount; s++) {
      newRow.push(!!data['spot' + (s + 1)]);
    }
    newRow.push(data.memo || '');
    newRow.push(new Date());
    sheet.appendRow(newRow);
    return outputJson({ status: 'registered' });
  }
  return outputJson({ error: 'not found' });
}

function getSheet() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return SpreadsheetApp.openById(id).getSheetByName('Users');
}

// シート構造を解析してスポット数や各列の位置を返す
function getSheetInfo(sheet) {
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var memoIdx = headers.indexOf('memo');
  var updatedIdx = headers.indexOf('updated_at');
  if (memoIdx === -1) memoIdx = headers.length - 1; // Fallback
  if (updatedIdx === -1) updatedIdx = headers.length;
  var spotCount = memoIdx - 2; // A,B列以外をスポットとして数える
  return {
    spotCount: spotCount,
    memoIndex: memoIdx + 1, // 1-indexed
    updatedIndex: updatedIdx + 1
  };
}

function outputJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
