# GAS スタンプラリー サンプル

このリポジトリには Google Apps Script で動作するシンプルなスタンプラリーのコード例が含まれています。
`Code.gs` では、スクリプト プロパティ `SHEET_ID` からスプレッドシート ID を取得して処理を行います。

## 構成ファイル
- `Code.gs` : GAS サーバー側スクリプト。スプレッドシートとの通信を行います。
- `index.html` : Web アプリの HTML。
- `style.css` : 画面のスタイル定義。背景画像として `https://imgur.com/Ctpg1SI` を利用しています。
- `main.js` : フロントエンドの挙動を記述した JavaScript。

`main.js` 内の `WEBAPP_URL` をご自身の Web アプリ URL に書き換えてからご利用ください。

## 初期設定
1. スプレッドシートを作成し、`Users` シートを用意します。
   - A列: ニックネーム
   - B列: PIN (4桁)
   - C列～E列: スタンプ取得状態 (TRUE/FALSE)
   - F列: メモ
   - G列: 更新日時
2. Google Apps Script の「スクリプト プロパティ」に `SHEET_ID` を登録します。
   - スプレッドシートのIDをコピーし、プロジェクトの設定画面から `SHEET_ID` として追加します。
3. `main.js` 先頭の `WEBAPP_URL` を、自分の Web アプリの URL に変更します。
