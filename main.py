import argparse
import logging
import os
import requests

logger = logging.getLogger(__name__)

DEFAULT_URL = (
    "https://script.google.com/macros/s/AKfycbzW7T8iKLXHOd69Or"
    "ODPbnxGke9DoTKtTcqioLHhCwZOvNVAOoNa2K3mfcMk5lqju7CVw/exec"
)
DEFAULT_NAME = "池上さま"


def run(url: str = DEFAULT_URL, name: str = DEFAULT_NAME) -> str:
    """指定された URL に名前パラメータを付けて GET リクエストを送信する。"""
    params = {"name": name}
    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        logger.error("リクエストエラー: %s", e)
        return ""

    print("GASからの返答:")
    print(response.text)
    return response.text


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="GAS API 呼び出しスクリプト",
    )
    parser.add_argument(
        "--url",
        default=os.getenv("API_URL", DEFAULT_URL),
        help="GAS の URL",
    )
    parser.add_argument(
        "--name",
        default=os.getenv("NAME", DEFAULT_NAME),
        help="送信する名前",
    )
    args = parser.parse_args()
    run(args.url, args.name)
