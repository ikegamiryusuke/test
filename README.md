# Test Repository

This repository contains a simple Google Apps Script (GAS) web app.

## gas_app

The `gas_app` directory provides a minimal example of a GAS web application that stores user progress in a Google Spreadsheet. It implements a small digital stamp rally: users register with a nickname and four-digit birthday, then collect stamps by entering secret codes at each location. When all stamps are gathered, the app displays **"COMPLETE!!"**. Duplicate nicknames are not allowed — a nickname can only be registered once.

### Usage

1. Create a Google Spreadsheet and note its ID (the string after `/d/` in the URL).
2. Copy the files in `gas_app` into a new Apps Script project.
3. The script currently uses the spreadsheet ID `19vdwSjc_4zYtBo5XNZVhT_QylE8Qm4EZhJP07DUe7YQ`. Change the `SPREADSHEET_ID` constant in `gas_app/Code.gs` if you want to use a different sheet.
4. Deploy the script as a web app with access to the spreadsheet.
5. Users can visit the web app URL and log in with their nickname and four-digit birthday. If the account exists, their progress is shown and they can submit stamp codes. Otherwise a new entry is created.
   If another user already registered the same nickname, registration will fail.

The `STAMP_CODES` array in `gas_app/Code.gs` defines the secret 4-digit numbers for each stamp spot. By default it contains three codes (`1234`, `5678`, `9999`). Edit this list if you want different numbers or more/less spots.

The sheet named `Users` will contain rows with `Nickname`, `Birthday`, and `Progress` columns.

The web page includes a simple dial interface to enter the four-digit codes. Tap or click the top or bottom of each digit to increase or decrease its value. When all spots are solved, a "COMPLETE!!" overlay with falling confetti appears.
