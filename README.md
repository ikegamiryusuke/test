# Google Sites スタンプラリー

このリポジトリは Google Apps Script(GAS) と Google Sheets だけで動作する
簡易スタンプラリーのサンプルです。Google Sites に Web アプリを埋め込めば、
誰でもブラウザから参加できます。

## セットアップ
1. **スプレッドシート作成**
   - `Users` シートを作成し、`nickname` `pin` `spot1` `spot2` `spot3` `memo`
     `updated_at` の列を用意します。
   - スプレッドシート ID をスクリプトプロパティ `SHEET_ID` に保存します。
2. **Apps Script にファイルをコピー**
   - `Code.gs`, `index.html`, `main.js`, `style.css` を GAS プロジェクトに追加します。
   - `WEBAPP_URL` を実際の Web アプリ URL に書き換えます。
   - 新しいバージョンをデプロイし、アクセス権を "誰でも" に設定します。
3. **Google Sites へ埋め込み**
   - Sites でページを作成し、"挿入 > 埋め込み > URL" から Web アプリ URL を登録します。

## カスタマイズ
`main.js` の `SPOTS` 配列を書き換えるだけで、スタンプスポットの数やコード、画像 URL を自由に変更できます。ページ読み込み時に `SPOTS` からスタンプ枠を自動生成するため、HTML を個別に編集する必要はありません。シートの列名も `spot1`, `spot2` ... と揃えれば任意の数に拡張可能です。

## Python スクリプトの利用 (任意)
`main.py` は GAS を呼び出すサンプルです。依存パッケージを
インストールした上で実行できます。

```bash
pip install -r requirements.txt
python main.py
```

テストは `pytest` で実行できます。

```bash
python -m pytest -q
```

## ファイル構成
- `Code.gs` – GAS バックエンド
- `index.html`, `main.js`, `style.css` – フロントエンド
- `main.py` – Python からの呼び出し例
- `requirements.txt` – 依存パッケージ

## ライセンス
本プロジェクトは MIT ライセンスで公開されています。詳細は
[LICENSE](LICENSE) を参照してください。
