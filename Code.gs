// CodeLearn -> Google Sheets.
// Install this script from the target spreadsheet: Extensions > Apps Script.
const RESULT_HEAD = ["Name", "Pre /5", "Pre ILO1 /3", "Pre ILO3 /2", "Post /5", "Post ILO1 /3", "Post ILO3 /2", "Gain", "Missions /3", "Last updated"];
const FB_HEAD = ["Time", "Activity clear", "Technology helped", "Could complete", "Improve"];

function sheet_(ss, name, head) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(head); sh.setFrozenRows(1); }
  return sh;
}
const norm_ = s => String(s == null ? "" : s).trim().replace(/\s+/g, " ");
const safe_ = s => /^[=+\-@]/.test(String(s == null ? "" : s)) ? "'" + s : s;

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) return respond_(e, {ok:false, message:"The Apps Script is not attached to a Google Sheet. Create it from Extensions > Apps Script in the target Sheet."});
    return respond_(e, {ok:true, message:"CodeLearn is connected to: " + ss.getName()});
  } catch (err) {
    return respond_(e, {ok:false, message:String(err)});
  }
}

function respond_(e, obj) {
  const callback = e && e.parameter && e.parameter.callback;
  const json = JSON.stringify(obj);
  if (callback && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("The Apps Script is not attached to a Google Sheet.");
    if (!e || !e.postData || !e.postData.contents) throw new Error("No POST data was received.");

    let records;
    try { records = JSON.parse(e.postData.contents); }
    catch (err) { throw new Error("Invalid JSON received from CodeLearn."); }
    if (!Array.isArray(records)) records = [records];

    records.forEach(r => {
      if (!r || !r.type) return;
      if (r.type === "feedback") {
        sheet_(ss, "Feedback", FB_HEAD).appendRow([
          r.at || new Date(), r.clear || "", r.tech || "", r.done || "", safe_(r.note || "")
        ]);
        return;
      }
      if (r.type !== "pretest" && r.type !== "posttest") return;

      const name = norm_(r.who);
      if (!name) return;
      const sh = sheet_(ss, "Results", RESULT_HEAD);
      const last = sh.getLastRow();
      let row = -1;
      if (last > 1) {
        const names = sh.getRange(2, 1, last - 1, 1).getValues();
        for (let i = 0; i < names.length; i++) {
          if (norm_(names[i][0]).toLowerCase() === name.toLowerCase()) { row = i + 2; break; }
        }
      }
      if (row < 0) {
        sh.appendRow([safe_(name), "", "", "", "", "", "", "", "", ""]);
        row = sh.getLastRow();
      }
      if (r.type === "pretest") {
        sh.getRange(row, 2, 1, 3).setValues([[r.score ?? "", r.ilo1 ?? "", r.ilo3 ?? ""]]);
      } else {
        sh.getRange(row, 5, 1, 3).setValues([[r.score ?? "", r.ilo1 ?? "", r.ilo3 ?? ""]]);
        sh.getRange(row, 9).setValue(r.missions ?? "");
      }
      const v = sh.getRange(row, 2, 1, 6).getValues()[0];
      const pre = v[0], post = v[3];
      sh.getRange(row, 8).setValue(pre !== "" && post !== "" ? Number(post) - Number(pre) : "");
      sh.getRange(row, 10).setValue(new Date());
    });
    SpreadsheetApp.flush();
    return ContentService.createTextOutput("ok");
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput("ERROR: " + err);
  } finally {
    lock.releaseLock();
  }
}
