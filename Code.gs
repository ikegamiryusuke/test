// Google Apps Script for the facility guide chatbot

const RATE_LIMIT_SECONDS = 10; // 同じユーザーの連続質問を抑制
const DAILY_QUOTA = 500;       // 1日の利用回数上限

// Google Drive から知識ベースを取得
function getKnowledgeText(folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    const files = folder.getFiles();
    let knowledge = '';

    while (files.hasNext()) {
      const file = files.next();
      const mimeType = file.getMimeType();
      let text = '';

      if (mimeType === 'application/pdf') {
        const blob = file.getBlob();
        const resource = { title: file.getName(), mimeType: 'application/vnd.google-apps.document' };
        const tempDoc = Drive.Files.insert(resource, blob);
        text = DocumentApp.openById(tempDoc.id).getBody().getText();
        Drive.Files.remove(tempDoc.id);
      } else if (mimeType === 'text/plain') {
        text = file.getBlob().getDataAsString('UTF-8');
      }

      if (text) {
        knowledge += `\n\n--- 資料: ${file.getName()} ---\n${text}`;
      }
    }
    return knowledge;
  } catch (e) {
    Logger.log('ドキュメント取得エラー: ' + e.toString());
    return '';
  }
}

// Gemini API を呼び出して回答を生成
function callGemini(question, context) {
  const API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + API_KEY;
  const prompt = `あなたはとある施設の優秀な案内係です。以下の「施設の資料」だけを参考にして、お客様からの「質問」に誠実かつ正確に答えてください。資料に書かれていないことは、「申し訳ありませんが、その情報は見つかりませんでした。」と回答してください。\n\n# 施設の資料\n${context}\n\n# 質問\n${question}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(API_URL, options);
    const jsonResponse = JSON.parse(response.getContentText());
    const answer = jsonResponse.candidates[0].content.parts[0].text;
    return answer.trim();
  } catch (e) {
    Logger.log('Gemini APIエラー: ' + e.toString());
    return '申し訳ありません、AIとの通信中にエラーが発生しました。';
  }
}

// Webアプリのメインエントリーポイント
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(5000)) {
      throw new Error('ただいま大変混み合っています。しばらくしてからお試しください。');
    }

    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('リクエストが不正です。');
    }

    let params;
    try {
      params = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      throw new Error('リクエストの形式が正しくありません。');
    }

    const question = params.question || '';
    if (!question) {
      throw new Error('質問が見つかりません。');
    }

    // 流量制限
    const userKey = e.forwardedFor || e.remoteAddress || 'unknown_user';
    const userCache = CacheService.getScriptCache();
    if (userCache.get(userKey)) {
      throw new Error('ご質問のペースが速すぎます。少し時間をおいてから、再度ご質問ください。');
    }

    // 総量制限
    const properties = PropertiesService.getScriptProperties();
    const today = new Date().toLocaleDateString('ja-JP');
    const lastAccessDate = properties.getProperty('LAST_ACCESS_DATE');
    let dailyCount = parseInt(properties.getProperty('DAILY_COUNT') || '0');
    if (today !== lastAccessDate) {
      dailyCount = 0;
      properties.setProperty('LAST_ACCESS_DATE', today);
    }
    if (dailyCount >= DAILY_QUOTA) {
      throw new Error('申し訳ありません、本日のご利用上限に達しました。明日またご利用ください。');
    }

    // メイン処理
    const folderId = properties.getProperty('DRIVE_FOLDER_ID');
    const knowledge = getKnowledgeText(folderId);
    if (!knowledge) {
      throw new Error('知識ベースの読み込みに失敗しました。');
    }

    const answer = callGemini(question, knowledge);
    userCache.put(userKey, 'true', RATE_LIMIT_SECONDS);
    properties.setProperty('DAILY_COUNT', (dailyCount + 1).toString());

    const result = { status: 'success', answer: answer };
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const errorResult = { status: 'error', answer: err.message };
    return ContentService.createTextOutput(JSON.stringify(errorResult)).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
