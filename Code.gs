const SHEET_NAME = 'Users';

function getSheet() {
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!id) throw new Error('Missing SHEET_ID in Script Properties');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet "Users" not found');
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const nickname = e.parameter.nickname;
  const pin = e.parameter.pin;
  if (nickname || pin) {
    if (!nickname || !pin) return json({ error: 'missing param' });
    const rows = getSheet().getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === nickname && String(rows[i][1]) === String(pin)) {
        return json({
          nickname, pin,
          spot1: rows[i][2] === true,
          spot2: rows[i][3] === true,
          spot3: rows[i][4] === true,
          memo: rows[i][5] || '',
          updated_at: rows[i][6] || ''
        });
      }
    }
    return json({ error: 'not found' });
  }
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('思いでスタンプラリー')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return json({ error: 'invalid json' });
  }
  const { nickname, pin, mode } = body;
  if (!nickname || !pin) return json({ error: 'missing param' });
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const lock = LockService.getScriptLock();
  lock.waitLock(3000);
  try {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === nickname && String(rows[i][1]) === String(pin)) {
        if (mode === 'register') return json({ error: 'duplicate' });
        const idx = i + 1;
        sheet.getRange(idx, 3, 1, 4).setValues([[
          typeof body.spot1 === 'boolean' ? body.spot1 : rows[i][2],
          typeof body.spot2 === 'boolean' ? body.spot2 : rows[i][3],
          typeof body.spot3 === 'boolean' ? body.spot3 : rows[i][4],
          typeof body.memo === 'string' ? body.memo : rows[i][5]
        ]]);
        sheet.getRange(idx, 7).setValue(new Date());
        return json({ status: 'ok' });
      }
    }
    if (mode === 'register') {
      sheet.appendRow([
        nickname, pin,
        !!body.spot1, !!body.spot2, !!body.spot3,
        body.memo || '', new Date()
      ]);
      return json({ status: 'registered' });
    }
    return json({ error: 'not found' });
  } finally {
    lock.releaseLock();
  }
}
