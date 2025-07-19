# Treasure Hunt Stamp Rally

This repo contains a sample implementation of a Google Apps Script web app.
Users sign up with a nickname and 4-digit PIN to collect stamps by dialing the
correct code at each spot. When all stamps are collected a brief "COMPLETE!!"
animation is displayed.

Files:
- **Code.gs** - GAS backend that stores users and stamp codes in Sheets
- **index.html** - main page served by the GAS web app
- **main.js** - front-end logic for login and stamping
- **style.css** - simple look & feel with animations

Run `python -m py_compile main.py` to check the Python helper script.
