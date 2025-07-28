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
   - 新しいバージョンを **ウェブアプリ** としてデプロイし、アクセス権を "誰でも" に設定します。
   - デプロイ後に表示される **公開URL** をコピーし、`main.js` 内の `WEBAPP_URL` 定数に貼り付けます。
   - この公開URLは後述の Google Sites 埋め込み時にも使用します。
3. **Google Sites へ埋め込み**
   - Sites でページを作成し、"挿入 > 埋め込み > URL" から 上記で取得した公開URL を登録します。

## カスタマイズ
`main.js` の `SPOTS` 配列を書き換えるだけで、スタンプスポットの数やコード、画像 URL を自由に変更できます。ページ読み込み時に `SPOTS` からスタンプ枠を自動生成するため、HTML を個別に編集する必要はありません。`name` フィールドは枠の下に表示されます。

数字はダイヤルを上下にスワイプして入力します。正しい 4 桁が揃うとスタンプが押され、すべてのスポットを取得すると画面に「COMPLETE!!」が表示されます。

シートの列名も `spot1`, `spot2` ... と揃えれば任意の数に拡張可能です。GAS 側の `Code.gs` ではヘッダー行を解析し、存在する `spot?` 列の数に応じて自動的に処理するため、列を追加するだけで拡張できます。

## アセット素材
ダイヤル画像を変更したい場合は、以下のURLを参考に`style.css`を編集してください。

| 種別 | 用途 | URL |
| --- | --- | --- |
| コンパス背景 | ダイヤル背景テクスチャ | <https://i.imgur.com/In0hngB.png> |
| 目盛オーバーレイ | ダイヤル外周の刻み目 | <https://i.imgur.com/Ah6v5nD.png> |
| 矢印上 | ダイヤル↑ボタン | <https://i.imgur.com/CcRJgcL.png> |
| 矢印下 | ダイヤル↓ボタン | <https://i.imgur.com/iCW495w.png> |
| 数字「0」〜「9」 | ダイヤル内の数字 | 各 URL はソース参照 |

### 背景とスタンプ画像

| 種別 | 用途 | URL |
| --- | --- | --- |
| ログイン画面背景 | サインイン／サインアップ画面の背景 | <https://i.imgur.com/m5sdGA8.jpg> |
| メイン画面背景 | スタンプボード表示時の背景 | <https://i.imgur.com/wAN3v5K.jpg> |
| spot1 | クジラのスタンプ | <https://i.imgur.com/bvgNF9A.png> |
| spot2 | ヨットのスタンプ | <https://i.imgur.com/Za5d3PQ.png> |
| spot3 | ヤシの木のスタンプ | <https://i.imgur.com/MSjf7Sr.png> |


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
