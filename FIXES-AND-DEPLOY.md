# CodeLearn Google Sheets fix

## Changes made
- Student name fields now ask for first name only.
- First-name normalization is applied before sending pre-test and assessment scores.
- The feedback form now asks for a first name and sends it with the feedback.
- The Google Sheets Feedback tab now includes a First name column.
- Updated the setup instructions to explain that Apps Script must be redeployed.

## Required steps after uploading to GitHub
1. Open the Google Sheet that should receive the data.
2. Open Extensions > Apps Script.
3. Replace the Apps Script code with the updated `apps-script/Code.gs` in this ZIP and save.
4. Deploy > Manage deployments > pencil icon > choose **New version** > Deploy.
5. Open the deployed web app URL ending in `/exec` and make sure it says CodeLearn is connected to your spreadsheet.
6. Confirm that the exact `/exec` URL in `js/script.js` is the current deployment URL. If you created a new deployment instead of editing the existing one, replace `SHEET_URL` with the new URL.
7. Upload the updated site files to GitHub and refresh the website with Ctrl+F5.
8. In the Teacher page, click **Test Google Sheets connection**, then submit a test pre-test and check the **Results** tab; submit feedback and check **Feedback**.

## Important
- Apps Script changes do not go live until redeployed as a new version.
- Google Sheets stores the Results and Feedback tabs, not necessarily the default Sheet1 tab.
- First names are not unique. If two students share a first name, their scores can be merged in the Results tab. A short student code is safer for matching while still avoiding full names.
- Do not put sensitive information in a public spreadsheet or collect information you do not need.
