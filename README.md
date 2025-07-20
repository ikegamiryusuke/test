# Test Repository

This repository contains a simple Google Apps Script (GAS) web app.

## gas_app

The `gas_app` directory provides a minimal example of a GAS web application that stores user progress in a Google Spreadsheet. It implements a small digital stamp rally: users register with a nickname and four-digit birthday, then collect stamps by entering secret codes at each location. When all stamps are gathered, the app displays **"COMPLETE!!"**. Duplicate nicknames are not allowed — a nickname can only be registered once.

### Usage

1. Create a Google Spreadsheet and note its ID (the string after `/d/` in the URL).
2. Copy the files in `gas_app` into a new Apps Script project.
3. The script currently uses the spreadsheet ID `19vdwSjc_4zYtBo5XNZVhT_QylE8Qm4EZhJP07DUe7YQ`. Change the `SPREADSHEET_ID` constant in `gas_app/Code.gs` if you want to use a different sheet.
4. `index.html` loads `style.html` and `main.html` through the `include()` helper defined in `Code.gs`.
5. Deploy the script as a web app with access to the spreadsheet.
6. Users can visit the web app URL and log in with their nickname and four-digit birthday. If the account exists, their progress is shown and they can submit stamp codes. Otherwise a new entry is created.
   If another user already registered the same nickname, registration will fail.

スタンプは3種類で、デフォルトのコードは `1234`、`5678`、`9999` です。画像 URL も `gas_app/Code.gs` の `STAMPS` 配列で設定できます。
背景パターンは `BACKGROUND` 定数で指定しています。

`Users` という名前のシートには `Nickname`、`Birthday`、`Progress` の列が並びます。同じニックネームが存在した場合は誕生日を照合し、一致すれば進捗を返します。なければ新しい行を追加して登録します。

画面にはスタンプスロットが3つ表示されます。空欄には「?」マークが付き、コード入力は4桁のダイヤル式です。正解すると中央に「STAMP!」と表示され、すべて集めると「COMPLETE!!」が現れます。
