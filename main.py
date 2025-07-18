import requests

def run():
    url = "https://script.google.com/macros/s/AKfycbzW7T8iKLXHOd69OrODPbnxGke9DoTKtTcqioLHhCwZOvNVAOoNa2K3mfcMk5lqju7CVw/exec"
    params = {"name": "池上さま"}

    response = requests.get(url, params=params)
    print("GASからの返答:")
    print(response.text)
