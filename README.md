# GAS リクエストサンプル

Google Apps Script のエンドポイントに HTTP リクエストを送り、その返答を表示するサンプルです。
URL と名前をコマンドライン引数または環境変数で指定できます。

## 必要環境
- Python 3.11 以上

## セットアップ
1. 依存パッケージをインストールします。
   ```bash
   pip install -r requirements.txt
   ```

`agent.yaml` にはエージェント設定が記述されており、`main.py` を実行する際の
エントリーポイントや説明を定義しています。

## 使い方
`main.py` を実行すると、GAS からの返答を表示します。URL や名前はコマンドライン引数または環境変数で指定可能です。

```bash
python main.py --url <GAS の URL> --name <名前>
```

環境変数を利用する場合:

```bash
API_URL=<GAS の URL> NAME=<名前> python main.py
```

ログを出力する場合の例:
```python
import logging
from main import run

logging.basicConfig(level=logging.INFO)
run("<GAS の URL>", "<名前>")
```

## テスト
`pytest` を実行するとテストが走ります。
`flake8` でコードスタイルも確認できます。

```bash
pytest
```

## ライセンス
このプロジェクトは [MIT License](LICENSE) の下で公開されています。
