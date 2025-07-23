# 施設案内チャットボット

このリポジトリは Google Apps Script (GAS) と Google Drive を利用した簡易チャットボットの実装例です。PDF やテキストファイルから取得した知識をもとに Gemini API へ質問を送り、回答を返します。Python などは使用しません。

## 構成
- **Code.gs**: GAS のメインスクリプト。`doPost()` をエントリーポイントとして Web アプリ化します。
- **Google Drive**: 回答の根拠となるドキュメントを保存するフォルダ。
- **Gemini API**: ドキュメントと質問をもとに回答を生成します。

## セットアップ
1. 新しい Apps Script プロジェクトを作成し、`Code.gs` の内容を貼り付けます。
2. スクリプトプロパティに以下を設定します。
   - `GEMINI_API_KEY`: Gemini API キー
   - `DRIVE_FOLDER_ID`: 知識ベースを保存したフォルダの ID
3. `Code.gs` を保存して Web アプリとしてデプロイします。
4. Google サイト等から Web アプリの URL に対して POST リクエストを送ることで利用できます。

## agent.yaml
エージェント設定ファイルとして `agent.yaml` を用意しています。`entrypoint` は `Code.gs:doPost` を指しています。

## ライセンス
本プロジェクトは [MIT License](LICENSE) の下で公開されています。
