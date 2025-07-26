"""Simple script to call a Google Apps Script web application."""

import requests


def run():
    """Call the GAS web app and print the response."""
    url = (
        "https://script.google.com/macros/s/AKfycbzW7T8iKLXHOd69OrODPbnxGke9DoTKtTcqioLHhCwZOvNVAOoNa2K3mfcMk5lqju7CVw/exec"
    )
    params = {"name": "池上さま"}

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        print("リクエスト中にエラーが発生しました:", exc)
        return

    print("GASからの返答:")
    print(response.text)


if __name__ == "__main__":
    run()
