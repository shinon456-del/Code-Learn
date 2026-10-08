# Send CodeLearn results to your Google Sheet (about 5 minutes)

You need a Google account. Learners do not need one.

1. Go to https://sheets.google.com and create a blank spreadsheet. Name it "CodeLearn Results".
2. In the sheet, click **Extensions > Apps Script**.
3. Delete the sample code. Open `apps-script/Code.gs` from this folder, copy everything, and paste it in. Click the save icon.
4. Click **Deploy > New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   Click **Deploy**. Approve the permissions when Google asks (click Advanced > Go to project if you see a warning; it is your own script).
5. Copy the **Web app URL** (it ends in `/exec`).
6. Open `js/script.js` in Notepad. Near the top, find `const SHEET_URL = "...";` and make sure it contains your deployed `/exec` Web app URL. Save.
7. (Optional) Copy your sheet's normal address-bar link into `SHEET_VIEW_URL` on the next line. This adds an "Open class Google Sheet" button on the teacher page only.
8. Test: open the site, take the pre-test as "Test Learner", wait a few seconds, and check the **Results** sheet. Then delete the test row.

What you get
- **Results** sheet: one row per learner with pre-test, post-test, per-outcome scores, gain and missions done. The pre-test and post-test fill the same row when the learner types the same name.
- **Feedback** sheet: the micro-teaching feedback responses.

Good to know
- If a learner is offline, results wait on their device and send when the internet returns.
- On the teacher page, "Send class log to Google Sheet" re-sends everything saved on that device. It is safe to press more than once because rows are matched by name, not duplicated.
- If you change Code.gs later: Deploy > Manage deployments > edit (pencil) > Version: New version > Deploy.
- Anyone who has the web app URL can post to it, and the URL is visible in script.js. That is fine for a class activity. Do not share the site's files publicly with the URL inside.
- Do not put the Google Sheet link on pages learners see. It would show everyone's scores. The teacher page is the only place for it.
- Tell learners their name and scores are shared with the teacher.

## Nothing showing up in the sheet? Check these in order
1. On the teacher page press **Test Google Sheets connection**. It tells you what is wrong.
2. Look at the tabs at the **bottom** of your sheet. Data goes to a tab called **Results** (and **Feedback**), not Sheet1. The tabs appear after the first result arrives.
3. Did the learner finish the pre-test BEFORE you pasted the URL? Then it was only saved on the device. On the teacher page press **Send class log to Google Sheet**.
4. The URL must start with https://script.google.com/ and end with /exec. It is NOT the link of the Apps Script editor and NOT the link of the sheet.
5. Deploy settings: Execute as **Me**, Who has access **Anyone**. "Only myself" blocks learners.
6. The script must be created from the sheet itself (Extensions > Apps Script). A script made on its own at script.google.com is not attached to any sheet.
7. After you edit js/script.js, refresh the page with Ctrl+F5. After you edit Code.gs, redeploy: Deploy > Manage deployments > pencil > Version: New version > Deploy.
8. Press F12 in Chrome and open the Console tab. Red errors there help find the cause. The Teacher page connection test now uses a Google Apps Script callback, so it can distinguish a deployment problem from a browser CORS warning.
