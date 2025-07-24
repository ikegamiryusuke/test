# 施設案内チャットボット

このリポジトリは Google Apps Script (GAS) と Google Drive を利用した簡易チャットボットの実装例です。PDF やテキストファイルから取得した知識をもとに Gemini API へ質問を送り、回答を返します。Python などは使用しません。

## 構成
- **Code.gs**: GAS のメインスクリプト。`doPost()` をエントリーポイントとして Web アプリ化します。
- **Google Drive**: 回答の根拠となるドキュメントを保存するフォルダ。
- **Gemini API**: ドキュメントと質問をもとに回答を生成します。

## セットアップ
1. 新しい Apps Script プロジェクトを作成し、`Code.gs` の内容を貼り付けます。
2. エディタ左側の **サービス** から **Google Drive API** を追加して有効化します。最初に Cloud Console で Drive API を有効化しておく必要があります。
3. スクリプトプロパティに以下を設定します。
   - `GEMINI_API_KEY`: Gemini API キー
   - `DRIVE_FOLDER_ID`: 知識ベースを保存したフォルダの ID
4. `Code.gs` を保存して Web アプリとしてデプロイします。
5. Google サイト等から Web アプリの URL に対して POST リクエストを送ることで利用できます。

## agent.yaml
エージェント設定ファイルとして `agent.yaml` を用意しています。`entrypoint` は `Code.gs:doPost` を指しています。

## 利用制限の調整
`Code.gs` 冒頭で `RATE_LIMIT_SECONDS` と `DAILY_QUOTA` を定義しています。
前者は同じユーザーが再質問できるまでの待ち時間、後者は 1 日あたりの総リクエスト
上限を示します。無料枠内で運用したい場合は `DAILY_QUOTA` を小さめに設定すると過剰
利用を抑えられます。用途に合わせて値を変更し、必要に応じて Google Cloud 側の
クォータ設定と併せて管理してください。

### 無料枠を超えないために
無料プランのみで運用する場合は、Google Cloud Console で Gemini API の割り当て量
を無料枠相当まで下げ、課金が発生しないようにしてください。`DAILY_QUOTA` の値も
同じ回数以下に設定することで、Apps Script からの呼び出し回数を制限できます。
また、予算アラートを設定しておくと課金が発生しそうな場合に通知を受け取れます。

## 動作確認例
Web アプリをデプロイしたら、以下のように `curl` で質問を送って動作確認できます。

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"question": "開館時間は？"}' \
  "https://script.google.com/macros/s/デプロイID/exec"
```
フロントエンドから POST リクエストを送る際も同じ形式の JSON を渡してください。

## ライセンス
本プロジェクトは [MIT License](LICENSE) の下で公開されています。

## トラブルシューティング
- **Drive API 関連のエラーが出る**: Apps Script の [サービス] で Drive API を追加し、Google Cloud Console 側でも API を有効化しているか確認してください。
- **応答が返ってこない**: スクリプトエディタの [実行数] 画面でログを確認し、エラーメッセージを参照します。API キーやフォルダ ID が正しいかもチェックしてください。
