(() => {
const $ = id => document.getElementById(id) || document.createElement("div");
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const KEY = "codelearn.v5", LOGKEY = "codelearn.log";
let S = { lessons: [], missions: [], quick: [], quiz: null, cur: 0, code: null, fb: [], plan: null, xp: 0, heroLevel: 1 };
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
/* class log: every learner's pre/post result on this device, kept even when progress is reset for the next learner */
let LOG = {};
try { LOG = JSON.parse(localStorage.getItem(LOGKEY)) || {}; } catch (e) {}
const nkey = n => (n || "").trim().replace(/\s+/g, " ").toLowerCase();
function logSet(kind, rec) {
  if (!S.who) return; const k = nkey(S.who);
  LOG[k] = LOG[k] || { name: S.who.trim().replace(/\s+/g, " ") }; LOG[k][kind] = rec;
  try { localStorage.setItem(LOGKEY, JSON.stringify(LOG)); } catch (e) {}
}
/* send results to the teacher's Google Sheet (see apps-script/Code.gs). Leave empty to keep everything on the device only. */
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzHfaV5hzhVAjwkEIsFefsWsgimVeo1efo5Ox81Euc696Mzn6Ej7giVRif9Kk8DjKzwVA/exec";
/* optional: your Google Sheet's normal link (the one in the address bar). Only shown as a button on the teacher page. */
const SHEET_VIEW_URL = "https://docs.google.com/spreadsheets/d/1Vo7c3ZE2l4MDhzkRgpZA8tb5y5-9gOu8QQ5TPoqmoHo/edit?gid=0#gid=0";
const sentNote = () => SHEET_URL ? '<p class="why">Your results were sent to your teacher. If you are offline, they will send automatically when you are back online.</p>' : "";
const iloN = (set, ans, k) => set.filter((q, i) => q.ilo === k && ans[i] === q.a).length;
function send(type, data) {
  if (!SHEET_URL) return;
  S.outbox = S.outbox || [];
  S.outbox.push({ type, who: S.who || "", at: new Date().toISOString(), ...data });
  save(); flush();
}
function flush() {
  if (!SHEET_URL || !navigator.onLine || !S.outbox || !S.outbox.length) return;
  const batch = S.outbox.slice();
  fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(batch),
    keepalive: true
  }).then(() => {
    // no-cors gives an opaque response, so a successful browser request cannot expose
    // the Apps Script response. Keep the normal behavior: remove the queued batch after
    // the request completes; the Apps Script itself validates and writes each record.
    S.outbox = S.outbox.filter(r => !batch.includes(r));
    save();
  }).catch(e => console.warn("CodeLearn: could not reach Google Sheets yet", e));
}
addEventListener("online", flush); flush();
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const LESSONS = [
 { t: "What is HTML?", b: `<p><b>HTML</b> (HyperText Markup Language) gives a webpage its structure and content. Elements are written with tags: an opening tag, content, and a closing tag.</p><pre class="eg">${esc('<h1>My Webpage</h1>\n<p>This is my first paragraph.</p>')}</pre><p>HTML says <i>what</i> something is. CSS styles it and JavaScript makes it interactive.</p>`,
   tr: ["Change the text inside the h1 so it shows your name.", "<h1>My Webpage</h1>\n<p>This is my first paragraph.</p>"],
   q: ["What does HTML mainly define?", ["The structure and content of a page", "Only the colors of a page", "How fast a computer runs"], 0] },
 { t: "Page structure", b: `<p>Every page has the same skeleton. <code>&lt;html&gt;</code> wraps everything, <code>&lt;head&gt;</code> holds information about the page, and <code>&lt;body&gt;</code> holds what people see.</p><pre class="eg">${esc('<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>')}</pre><p><b>Plan the structure first.</b> Decide what the page needs and where each part goes before adding colors or extras. A clear structure keeps content organized and prevents rework, because changing a plan is easier than rewriting a finished page.</p><div class="pair"><b>Think-pair-share</b><p>Turn to a partner. Imagine you add colors and pictures to a page before deciding its headings and sections. What problems could come up? Share one idea, then listen to your partner's idea.</p></div>`,
   tr: ["Add a new <p> inside the body that says what this page is for.", "<html>\n  <head>\n    <title>My Page</title>\n  </head>\n  <body>\n    <h1>Hello</h1>\n  </body>\n</html>"],
   q: ["Where does visible content go?", ["Inside <body>", "Inside <head>", "Inside <title>"], 0] },
 { t: "Text and links", b: `<p>Headings (<code>h1</code> to <code>h6</code>) show hierarchy. <code>&lt;p&gt;</code> holds a paragraph. <code>&lt;a&gt;</code> makes a link, and its <code>href</code> says where it goes.</p><pre class="eg">${esc('<h1>ICT Resources</h1>\n<p>Explore useful materials.</p>\n<a href="https://example.com">Open resource</a>')}</pre>`,
   tr: ["Change the link text, then change the href to another website.", "<h1>ICT Resources</h1>\n<p>Explore useful materials.</p>\n<a href=\"https://example.com\">Open resource</a>"],
   q: ["Which element creates a hyperlink?", ["<link>", "<a>", "<url>"], 1] },
 { t: "Images and buttons", b: `<p>Images show information visually. Buttons offer an action. The <code>alt</code> text describes an image for people who cannot see it.</p><pre class="eg">${esc('<img src="computer.jpg" alt="A computer">\n<button>Start Activity</button>')}</pre>`,
   tr: ["The picture file does not exist here, so the alt text shows instead. Change the alt text, then change the button label.", "<img src=\"computer.jpg\" alt=\"A computer\">\n<button>Start Activity</button>"],
   q: ["What is the alt attribute for?", ["Describing the image in text", "Making the image bigger", "Linking to another page"], 0] }
];

const BASE = `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>My First Webpage</h1>
  <p>I am learning HTML with CodeLearn.</p>
</body>
</html>`;

const MISSIONS = [
 { n: "Quest 1 · Title Goblin", xp: 100, task: "A Title Goblin has scrambled the main heading. Defeat it by changing the h1 so it says ICT Learning.", test: d => { const h = d.querySelector("h1"); return h && h.textContent.trim().toLowerCase() === "ict learning" ? 0 : "Edit the text inside the <h1> tag so it reads exactly: ICT Learning."; } },
 { n: "Quest 2 · Link Phantom", xp: 150, task: "A Link Phantom has broken the path between pages. Add a link with an href that opens https://example.com, and text people can click.", test: d => { const a = d.querySelector("a[href]"); if (!a) return "No link found. Add an <a> tag with an href attribute."; if (!a.textContent.trim()) return "Your link has no text. Put words between <a> and </a>."; return 0; } },
 { n: "Quest 3 · Media Beast", xp: 200, task: "The Media Beast is blocking the activity page. Add an image with alt text and a button labeled Start Activity. Keep the page structure.", test: (d, raw) => { if (!/<head[\s>]/i.test(raw) || !/<body[\s>]/i.test(raw) || !d.title.trim()) return "Keep the page structure: <head> with a <title>, and <body>."; const i = d.querySelector("img"); if (!i) return "Add an <img> tag."; if (!(i.getAttribute("alt") || "").trim()) return "Your image needs alt text, such as alt with a description."; const b = d.querySelector("button"); if (!b) return "Add a <button> tag."; return /start activity/i.test(b.textContent) ? 0 : "The button should say Start Activity."; } },
 { n: "Final Quest · Web Guardian", xp: 300, bonus: true, task: "The Web Guardian guards the final gate. Build a complete mini lesson page with a title, h1, paragraph, a list with at least 3 items, a link, and an image with alt text.", test: (d, raw) => { if (!/<head[\s>]/i.test(raw) || !/<body[\s>]/i.test(raw)) return "Keep the page structure: add <head> and <body> tags."; if (!d.title.trim()) return "Add a <title> inside <head>."; if (!d.querySelector("h1")) return "Add an <h1> heading."; if (!d.querySelector("p")) return "Add a <p> paragraph."; if (d.querySelectorAll("ul li").length < 3) return "Add a list: <ul> with at least 3 <li> items."; if (!d.querySelector("a[href]")) return "Add a link with an href."; const i = d.querySelector("img"); if (!i || !(i.getAttribute("alt") || "").trim()) return "Add an <img> with alt text."; return 0; } }
];

const questUnlocked = i => i === 0 || S.missions.includes(i - 1) || (MISSIONS[i]?.bonus && S.missions.length >= 3);
const MON = [
 { name: "Title Goblin",  taunts: ["Hehe! Your heading is MINE!", "1H? Looks fine to me!"], hit: "Noooo! My scrambled h1...", ko: "K.O.!" },
 { name: "Link Phantom",  taunts: ["Woooo... your link leads nowhere!", "Missing href... boo!"], hit: "My chains... they're linked!", ko: "K.O.!" },
 { name: "Media Beast",   taunts: ["GRAAAH! No pictures allowed!", "I ate your alt text!"], hit: "Ow! You described my image!", ko: "K.O.!" },
 { name: "Web Guardian",  taunts: ["None shall pass my web!", "Build a better page, hero!"], hit: "Impossible... a perfect page!", ko: "VICTORY!" }
];
let fxFresh = false, fxTimer, monSayTimer;
function monsterSay(text){ const b=document.getElementById("taunt"); if(!b) return; b.textContent=text; b.classList.add("show"); clearTimeout(monSayTimer); monSayTimer=setTimeout(()=>b.classList.remove("show"),2800); }
function playFx(kind, line, tag){
 const scene=document.getElementById("battleScene"); if(!scene) return;
 const ht=document.getElementById("hitText"); if(ht) ht.textContent = tag || "HIT!";
 scene.classList.remove("attack","hurt"); void scene.offsetWidth; scene.classList.add(kind);
 clearTimeout(fxTimer); fxTimer=setTimeout(()=>scene.classList.remove(kind),1400);
 if(line) setTimeout(()=>monsterSay(line), kind==="attack" ? 700 : 350);
}
const heroLevel = x => x >= 450 ? 4 : x >= 250 ? 3 : x >= 100 ? 2 : 1;
function updateRPG(){
 const xp = Number(S.xp || 0), max = 750, pct = Math.min(100, Math.round(xp / max * 100));
 const level = heroLevel(xp); S.heroLevel = level;
 const names = ["Novice Web Hero","Tag Apprentice","Code Knight","HTML Guardian"];
 const el=id=>document.getElementById(id);
 if(el("xpText")) el("xpText").textContent = `${xp} XP`;
 if(el("xpBar")) el("xpBar").style.width = pct+"%";
 if(el("heroTitle")) el("heroTitle").textContent = `Level ${level} · ${names[level-1]}`;
 if(el("heroName")) el("heroName").textContent = `Lv.${level} ${names[level-1]}`;
 if(el("questCount")) el("questCount").textContent = `${S.missions.length} / 3 defeated`;
 const q = MISSIONS[m];
 if(el("battleLabel")) el("battleLabel").textContent = q?.bonus ? "FINAL QUEST" : `QUEST ${m+1}`;
 if(el("battleHint")) el("battleHint").textContent = q?.bonus ? "Defeat the Web Guardian with your final build." : `Defeat the ${q.n.split(" · ")[1]} with code.`;
 const done = !!(S.missions.includes(m) || (q?.bonus && S.bonus));
 const scene=el("battleScene");
 if(scene){ scene.dataset.m=String(Math.min(m,3)); scene.dataset.lv=String(level); scene.classList.toggle("quest-done", done); scene.classList.toggle("settled", !fxFresh); }
 if(el("monName")) el("monName").textContent = MON[Math.min(m,3)].name;
 if(el("monHp")){
   if(!done) el("monHp").style.width = "100%";
   else if(!fxFresh) el("monHp").style.width = "0%";
 }
}
function awardXP(amount){ const before=Number(S.xp||0); S.xp=Math.min(750,before+amount); save(); updateRPG(); if(S.xp>before){ const up=heroLevel(S.xp)>heroLevel(before); toast(up ? `+${amount} XP · LEVEL UP! You are now Level ${heroLevel(S.xp)}` : `+${amount} XP · Quest defeated`); confetti(); } }

const QUIZ = [
 { q: "What does HTML mainly define?", o: ["The structure and content of a webpage", "Only the colors of a webpage", "The computer's operating system"], a: 0, ilo: 1, why: "HTML provides structure and content. CSS handles colors." },
 { q: "Which tag makes the largest heading?", o: ["<p>", "<h1>", "<img>"], a: 1, ilo: 1, why: "h1 is the top-level heading." },
 { q: "Which element creates a link?", o: ["<link>", "<a>", "<url>"], a: 1, ilo: 1, why: "The a (anchor) element with an href makes a link." },
 { q: "You must build a page for a task. What comes first?", o: ["Start typing random code", "Plan the structure and purpose", "Add animations"], a: 1, ilo: 3, why: "Planning the structure first prevents rework." },
 { q: "Why should you plan a page's structure before adding colors and extras?", o: ["A clear structure keeps content organized and prevents rework", "Colors cannot be added to a page that has a plan", "A planned page always loads faster"], a: 0, ilo: 3, why: "Planning the structure first keeps the content organized, so you do not have to rewrite the page later." }
];


function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;t.setAttribute("role","status");document.body.appendChild(t);setTimeout(()=>t.remove(),2700);}
function confetti(){if(REDUCE)return;const c=["#0a64d8","#34c759","#ff9f0a","#ff453a","#af52de"];
 for(let i=0;i<42;i++){const p=document.createElement("i");p.className="pc";p.style.background=c[i%5];document.body.appendChild(p);
  const x=innerWidth/2+(Math.random()-.5)*200,dx=(Math.random()-.5)*innerWidth*.7,dy=innerHeight*(.5+Math.random()*.5);
  p.animate([{transform:`translate(${x}px,${innerHeight*.35}px) rotate(0)`,opacity:1},{transform:`translate(${x+dx}px,${innerHeight*.35+dy}px) rotate(${Math.random()*720}deg)`,opacity:0}],{duration:1400+Math.random()*900,easing:"cubic-bezier(.2,.8,.4,1)"}).onfinish=()=>p.remove();}}

/* progress: 4 lessons + 3 missions + 1 quiz pass attempt = 8 */
function progress() {
  const n = S.lessons.length + S.missions.length + (S.quiz !== null ? 1 : 0);
  const p = Math.round(n / 8 * 100);
  $("pText").textContent = p + "%"; $("pBar").style.width = p + "%";
  const setB=(k,n,tot)=>{document.querySelectorAll(`[data-step="${k}"]`).forEach(b=>{b.textContent=n>=tot?"Done":n?`${n} of ${tot} done`:"Not started";b.className="badge "+(n>=tot?"fin":n?"go":"");});};
  setB("lessons",S.lessons.length,4);setB("lab",S.missions.length,3);setB("quiz",S.quiz?1:0,1);
  const r = $("resume");
  if (n && n < 8) { r.hidden = false; r.textContent = `Welcome back. You have finished ${n} of 8 steps. Keep going!`; } else if (n === 8) { r.hidden = false; r.textContent = "You have finished everything. Retake the assessment to improve your score."; } else r.hidden = true;
}

/* lessons */
function renderTabs() {
  $("tabs").innerHTML = LESSONS.map((l, i) => `<button class="tab" role="tab" data-i="${i}" aria-selected="${i === S.cur}"><span>${i + 1}. ${l.t}</span>${S.lessons.includes(i) ? '<span class="tick">✓</span>' : ""}</button>`).join("");
}
function renderLesson() {
  const l = LESSONS[S.cur];
  $("lTitle").textContent = l.t; $("lBody").innerHTML = l.b;
  const done = S.lessons.includes(S.cur);
  const box = $("lTry"); box.innerHTML = `<p class="tryTask"><b>Try it:</b> ${esc(l.tr[0])} <span class="tryNote">(practice only, not graded)</span></p><div class="tryBox"><textarea id="tryEd" spellcheck="false" aria-label="Practice editor"></textarea><iframe id="tryFrame" title="Practice preview" sandbox=""></iframe></div><button class="link" id="tryReset" type="button">Reset practice</button>`;
  { const ed = box.querySelector("#tryEd"), fr = box.querySelector("#tryFrame"); ed.value = l.tr[1]; fr.srcdoc = ed.value;
    ed.oninput = () => { fr.srcdoc = ed.value; };
    ed.onkeydown = e => { if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); ed.setRangeText("  ", ed.selectionStart, ed.selectionEnd, "end"); ed.dispatchEvent(new Event("input")); } };
    box.querySelector("#tryReset").onclick = () => { ed.value = l.tr[1]; fr.srcdoc = ed.value; }; }
  $("lQuick").innerHTML = `<p>Quick check: ${esc(l.q[0])}</p><div class="opts">${l.q[1].map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join("")}</div><p class="why" id="qWhy">${done ? "Lesson complete." : "Answer correctly to complete this lesson."}</p>`;
  $("lStatus").textContent = `Lesson ${S.cur + 1} of ${LESSONS.length}`;
  $("prev").disabled = S.cur === 0; $("next").disabled = S.cur === LESSONS.length - 1;
  renderTabs();
  const c=$("lessonCard");if(!REDUCE){c.classList.remove("swap");void c.offsetWidth;c.classList.add("swap");}
}
$("tabs").addEventListener("click", e => { const t = e.target.closest(".tab"); if (t) { S.cur = +t.dataset.i; save(); renderLesson(); } });
$("prev").onclick = () => { S.cur = Math.max(0, S.cur - 1); save(); renderLesson(); };
$("next").onclick = () => { S.cur = Math.min(LESSONS.length - 1, S.cur + 1); save(); renderLesson(); };
$("lQuick").addEventListener("click", e => {
  const b = e.target.closest(".opt"); if (!b) return;
  const ok = +b.dataset.i === LESSONS[S.cur].q[2];
  b.classList.remove("right", "wrong"); b.classList.add(ok ? "right" : "wrong");
  $("qWhy").textContent = ok ? "Correct. Lesson complete." : "Not quite. Reread the lesson above and try again.";
  if (ok && !S.lessons.includes(S.cur)) { S.lessons.push(S.cur); save(); renderTabs(); progress(); toast(S.lessons.length===4?"All lessons done. On to the code lab!":"Lesson complete"); if(S.lessons.length===4)confetti(); }
});

/* code lab */
let m = 0;
const editor = $("editor"), frame = $("frame");
editor.value = S.code || BASE;
const run = () => { frame.srcdoc = editor.value; S.code = editor.value; save(); };
let t; editor.addEventListener("input", () => { clearTimeout(t); t = setTimeout(run, 150); });
editor.addEventListener("keydown", e => {
  if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); const s = editor.selectionStart; editor.setRangeText("  ", s, editor.selectionEnd, "end"); editor.dispatchEvent(new Event("input")); }
});
$("reset").onclick = () => { editor.value = BASE; run(); setFb("", ""); };
function renderMissions() {
  $("missions").innerHTML = MISSIONS.map((x, i) => { const unlocked=questUnlocked(i), done=x.bonus ? !!S.bonus : S.missions.includes(i); return `<button class="chip quest-chip ${done ? "done" : ""} ${!unlocked ? "locked" : ""}" data-i="${i}" aria-pressed="${i === m}" ${unlocked ? "" : "disabled"}><span class="quest-icon">${done ? "✓" : (i === 3 ? "F" : (i+1))}</span><span><b>${x.n}</b><small>${unlocked ? `${x.xp} XP` : "Locked · defeat the previous quest"}</small></span></button>`; }).join("");
  $("mTask").textContent = MISSIONS[m].task;
  $("checkM").textContent = MISSIONS[m].bonus ? "Attack the Guardian" : "Attack the Monster";
  updateRPG();
}
function setFb(msg, cls) { const f = $("mFb"); f.textContent = msg; f.className = "fb " + cls; }
$("missions").addEventListener("click", e => { const c = e.target.closest(".chip"); if (c && !c.disabled) { m = +c.dataset.i; fxFresh = false; const tb=document.getElementById("taunt"); if(tb) tb.classList.remove("show"); renderMissions(); setFb("", ""); scrollBattle(false); } });
function scrollBattle(focus=true){
  const scene=document.getElementById("battleScene");
  if(scene && focus) scene.scrollIntoView({behavior: REDUCE ? "auto" : "smooth", block:"center"});
}
function setBattleHp(width, immediate=false){
  const hp=document.getElementById("monHp"); if(!hp) return;
  if(immediate) hp.style.transition="none";
  hp.style.width=width+"%";
  if(immediate) requestAnimationFrame(()=>hp.style.transition="width .7s ease .1s");
}
function checkQuest(){
  const doc = new DOMParser().parseFromString(editor.value, "text/html");
  const r = MISSIONS[m].test(doc, editor.value);
  scrollBattle(true);
  if (r === 0) {
    if (MISSIONS[m].bonus) {
      const freshB = !S.bonus; fxFresh = freshB;
      playFx("attack", freshB ? MON[3].hit : "Again? I already lost to you!", MON[3].ko);
      if(freshB){ setBattleHp(32, true); S.bonus = true; save(); awardXP(MISSIONS[m].xp); renderMissions();
        setTimeout(()=>{ setBattleHp(0); setTimeout(()=>{ fxFresh=false; updateRPG(); },850); },520);
      } else { setBattleHp(0); }
      setFb("Final quest complete. You defeated the Web Guardian and built a complete HTML lesson page.", "ok");
      return;
    }
    const fresh = !S.missions.includes(m);
    fxFresh = fresh; playFx("attack", fresh ? MON[m].hit : "Again? I already lost to you!", fresh ? MON[m].ko : "HIT!");
    if (fresh) {
      setBattleHp(35, true);
      S.missions.push(m); awardXP(MISSIONS[m].xp);
      renderMissions();
      setTimeout(()=>{ setBattleHp(0); setTimeout(()=>{ fxFresh=false; updateRPG(); },850); },520);
    } else { setBattleHp(0); save(); }
    progress();
    const next = [0, 1, 2].find(i => !S.missions.includes(i));
    setFb(next === undefined ? "Quest complete. All three monsters are defeated. The Final Quest is now unlocked." : `Quest complete. ${MISSIONS[next].n} is now unlocked.`, "ok");
  } else {
    setFb(r, "no"); const tl = MON[Math.min(m,3)].taunts; playFx("hurt", tl[Math.floor(Math.random()*tl.length)]);
  }
}
$("checkM").onclick = checkQuest;
const battleAttack=document.getElementById("battleAttack"); if(battleAttack) battleAttack.onclick=checkQuest;
const attackFloat=document.getElementById("attackFloat"); if(attackFloat) attackFloat.onclick=checkQuest;

/* quiz */
function renderQuiz(review) {
  if (!document.getElementById("quiz")) return;
  const nameBox = (!S.who && !review) ? `<p><label><b>Your full name</b> (use the same name as your pre-test)<br><input id="postWho" type="text" autocomplete="name" style="width:100%;max-width:22rem;padding:.5rem;margin-top:.3rem"></label></p>` : "";
  $("quiz").innerHTML = nameBox + QUIZ.map((q, i) => `<fieldset data-i="${i}"><legend>${i + 1}. ${esc(q.q)}</legend>${q.o.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}" ${review && review.ans[i] === j ? "checked" : ""} ${review ? "disabled" : ""}> ${esc(o)}</label>`).join("")}<p class="why" id="why${i}"></p></fieldset>`).join("") + `<button class="btn primary" type="submit" id="sub">${review ? "Retake assessment" : "Submit answers"}</button>`;
  if (review) QUIZ.forEach((q, i) => { const f = document.querySelector(`fieldset[data-i="${i}"]`); const ok = review.ans[i] === q.a; f.classList.add(ok ? "right" : "wrong"); $("why" + i).textContent = (ok ? "Correct. " : `Correct answer: ${q.o[q.a]}. `) + q.why; });
}
$("quiz").addEventListener("submit", e => {
  e.preventDefault();
  if ($("sub").textContent === "Retake assessment") { renderQuiz(null); $("result").className = "result"; return; }
  const ans = QUIZ.map((q, i) => { const c = document.querySelector(`input[name="q${i}"]:checked`); return c ? +c.value : null; });
  let missing = false;
  ans.forEach((a, i) => { const f = document.querySelector(`fieldset[data-i="${i}"]`); f.classList.toggle("missing", a === null); if (a === null) missing = true; });
  if (missing) { const r = $("result"); r.className = "result show"; r.innerHTML = "Please answer every question. Unanswered ones are marked in red."; return; }
  if (!S.who) {
    const nm = ($("postWho").value || "").trim();
    if (!nm) { const r = $("result"); r.className = "result show"; r.innerHTML = "Please type your full name first."; return; }
    S.who = nm; const hit = LOG[nkey(nm)]; if (!S.pre && hit && hit.pre) S.pre = { score: hit.pre.score, ans: [], at: hit.pre.at, fromLog: true, ilo1: hit.pre.ilo1, ilo3: hit.pre.ilo3 };
  }
  const score = ans.filter((a, i) => a === QUIZ[i].a).length;
  const ilo = k => { const qs = QUIZ.map((q, i) => [q, i]).filter(([q]) => q.ilo === k); return `${qs.filter(([q, i]) => ans[i] === q.a).length}/${qs.length}`; };
  S.quiz = { score, ans, at: new Date().toISOString() }; save(); logSet("post", { score, ilo1: iloN(QUIZ, ans, 1), ilo3: iloN(QUIZ, ans, 3), missions: S.missions.length, at: S.quiz.at }); send("posttest", { score, answers: ans.join(""), ilo1: iloN(QUIZ, ans, 1), ilo3: iloN(QUIZ, ans, 3), missions: S.missions.length }); progress();
  renderQuiz(S.quiz); showResult(); renderCompare(); if(score>=4)confetti();
  $("result").focus();
});
function showResult() {
  const q = S.quiz, r = $("result"); if (!q) return;
  const ilo = k => { const qs = QUIZ.filter(x => x.ilo === k); return `${qs.filter((x, _) => q.ans[QUIZ.indexOf(x)] === x.a).length}/${qs.length}`; };
  const mm = S.missions.length;
  const lvl = mm === 3 && q.score >= 4 ? "Mastered: all three missions done and 4/5 or higher." : (mm >= 2 || q.score >= 3) ? "Developing: review the lessons, then retake the assessment." : "Beginning: ask your teacher for reteaching in a small group.";
  r.className = "result show";
  r.innerHTML = `<strong>${q.score}/5 (${q.score * 20}%)</strong><p><b>${lvl}</b></p><p>ILO1, identify HTML elements: ${ilo(1)}. ILO3, explain planning first: ${ilo(3)}. ILO2, write a page: ${S.missions.length}/3 missions complete.</p>`;
  r.insertAdjacentHTML("beforeend", `<p><button class="btn" type="button" id="nextLearner2">Done. Next learner</button></p><p class="why">Sharing this device? Press this so the next person can start fresh. Your scores stay in the class log.</p>${sentNote()}`);
  r.querySelector("#nextLearner2").onclick = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };
}

/* feedback + plan + export */
function renderFb() {
  const n = S.fb.length, box = $("fbSummary");
  if (!n) { box.textContent = "No feedback saved yet."; return; }
  const avg = k => (S.fb.reduce((s, f) => s + +f[k], 0) / n).toFixed(1);
  box.innerHTML = `<b>${n} response${n > 1 ? "s" : ""}</b>. Clarity ${avg("clear")}/5, technology helped ${avg("tech")}/5, could complete ${avg("done")}/5.` + (S.fb.some(f => f.note) ? "<br>Suggestions: " + S.fb.filter(f => f.note).map(f => esc(f.note)).join("; ") : "");
}
$("fbForm").addEventListener("submit", e => { e.preventDefault(); const d = Object.fromEntries(new FormData(e.target)); S.fb.push(d); save(); send("feedback", { ...d, who: "" }); e.target.reset(); renderFb(); });
const plan = $("plan");
if (S.plan) plan.querySelectorAll("tr:not(:first-child)").forEach((r, i) => r.querySelectorAll("td").forEach((c, j) => { if (S.plan[i] && S.plan[i][j] != null) c.textContent = S.plan[i][j]; }));
plan.addEventListener("input", () => { S.plan = [...plan.querySelectorAll("tr:not(:first-child)")].map(r => [...r.querySelectorAll("td")].map(c => c.textContent)); save(); });
$("exportData").onclick = () => {
  const blob = new Blob([JSON.stringify({ current: S, classLog: LOG }, null, 2)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "codelearn-class-data.json"; a.click(); URL.revokeObjectURL(a.href);
};
$("newLearner").onclick = () => { if (confirm("Clear this learner's progress, code and answers so the next learner can start fresh? Their pre-test and post-test scores stay in the class log.")) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } };
$("resetAll").onclick = () => { if (confirm("ERASE EVERYTHING on this device, including the class log and feedback? Download the class data first if you need it. This cannot be undone.")) { try { localStorage.removeItem(KEY); localStorage.removeItem(LOGKEY); } catch (e) {} location.reload(); } };
function renderLog() {
  const box = document.getElementById("logBox"); if (!box) return;
  const rows = Object.values(LOG).sort((a, b) => a.name.localeCompare(b.name));
  if (!rows.length) { box.textContent = "No learners recorded on this device yet."; return; }
  const f = v => v == null ? "–" : v;
  box.innerHTML = `<div class="scroll"><table><tr><th>Learner</th><th>Pre /5</th><th>Post /5</th><th>Gain</th><th>Missions /3</th></tr>` + rows.map(r => `<tr><td>${esc(r.name)}</td><td>${f(r.pre && r.pre.score)}</td><td>${f(r.post && r.post.score)}</td><td>${r.pre && r.post ? (r.post.score - r.pre.score >= 0 ? "+" : "") + (r.post.score - r.pre.score) : "–"}</td><td>${f(r.post && r.post.missions)}</td></tr>`).join("") + `</table></div>`;
  const have = rows.filter(r => r.pre && r.post);
  if (have.length) { const av = k => (have.reduce((t, r) => t + r[k].score, 0) / have.length).toFixed(1); box.innerHTML += `<p><b>${have.length} learner${have.length > 1 ? "s" : ""} with both tests.</b> Average pre ${av("pre")}/5, average post ${av("post")}/5.</p>`; }
}
{ const ov = $("openSheet"); if (SHEET_VIEW_URL) { ov.href = SHEET_VIEW_URL; ov.hidden = false; } }
const say = m => { $("sheetStatus").textContent = m; };
function pending() { const n = (S.outbox || []).length; if (SHEET_URL) say(n ? `Waiting to send from this device: ${n} record${n > 1 ? "s" : ""}.` : ""); }
$("testSheet").onclick = () => {
  const u = (SHEET_URL || "").trim();
  if (!u) { say("Google Sheets is not configured."); return; }
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(u)) {
    say("The Google Sheets URL is invalid. It must start with https://script.google.com/ and end with /exec.");
    return;
  }
  say("Testing Google Sheets connection...");
  const cb = "codeLearnCheck_" + Date.now();
  let done = false;
  const cleanup = () => { done = true; clearTimeout(timer); window[cb] = null; script.remove(); };
  const timer = setTimeout(() => {
    if (done) return;
    cleanup();
    say("Google did not return a connection response. Check that the deployment is a Web app, Execute as Me, Who has access Anyone, and that you used the /exec URL. Then redeploy a New version.");
  }, 10000);
  window[cb] = data => {
    if (done) return;
    const msg = data && data.message ? String(data.message) : "";
    cleanup();
    if (data && data.ok) say("Connected. " + msg + " You can now send the class log.");
    else say("Google responded, but the CodeLearn script reported an error: " + (msg || "Unknown error."));
  };
  const script = document.createElement("script");
  script.src = u + "?test=1&callback=" + encodeURIComponent(cb);
  script.onerror = () => { cleanup(); say("The Web app could not be loaded. Check the deployment access setting: Who has access must be Anyone."); };
  document.head.appendChild(script);
};

$("sendLog").onclick = () => {
  if (!SHEET_URL) { alert("Google Sheets is not set up yet. Follow SHEET-SETUP.md, then paste your web app URL into SHEET_URL in js/script.js."); return; }
  const rows = Object.values(LOG); if (!rows.length) { toast("Nothing to send yet"); return; }
  rows.forEach(r => {
    if (r.pre) send("pretest", { who: r.name, at: r.pre.at, score: r.pre.score, answers: "", ilo1: r.pre.ilo1, ilo3: r.pre.ilo3 });
    if (r.post) send("posttest", { who: r.name, at: r.post.at, score: r.post.score, answers: "", ilo1: r.post.ilo1, ilo3: r.post.ilo3, missions: r.post.missions });
  });
  toast("Sent " + rows.length + " learner" + (rows.length > 1 ? "s" : "") + " to Google Sheets"); say("Sent. Check the Results tab at the bottom of your sheet (it can take a few seconds).");
};
$("exportCsv").onclick = () => {
  const q = v => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
  const head = ["Name", "Pre /5", "Pre ILO1 /3", "Pre ILO3 /2", "Post /5", "Post ILO1 /3", "Post ILO3 /2", "Missions /3"];
  const lines = [head.map(q).join(",")].concat(Object.values(LOG).map(r => [r.name, r.pre && r.pre.score, r.pre && r.pre.ilo1, r.pre && r.pre.ilo3, r.post && r.post.score, r.post && r.post.ilo1, r.post && r.post.ilo3, r.post && r.post.missions].map(q).join(",")));
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" })); a.download = "codelearn-class-log.csv"; a.click(); URL.revokeObjectURL(a.href);
};



/* pre-test */
const PRE = [
 { q: "Which statement about HTML is true?", o: ["It describes the structure and content of a page", "It is a program for editing photos", "It is only used to change fonts"], a: 0, ilo: 1 },
 { q: "Which tag would you use to show a picture?", o: ["<p>", "<img>", "<h1>"], a: 1, ilo: 1 },
 { q: "Where does the content that people see on the page go?", o: ["Inside <head>", "Inside <title>", "Inside <body>"], a: 2, ilo: 1 },
 { q: "Before writing the code for a webpage, what should you do first?", o: ["Decide what the page needs and how it is organized", "Choose the colors", "Upload it online"], a: 0, ilo: 3 },
 { q: "Why is it better to decide a page's structure before adding colors and extras?", o: ["It makes the code shorter", "It keeps content organized and avoids rewriting the page", "It is required by the browser"], a: 1, ilo: 3 }
];
function renderPre() {
  const f = document.getElementById("preForm"); if (!f) return;
  if (S.pre) { f.innerHTML = `<p><b>Pre-test saved.</b> You answered ${S.pre.score} of 5 correctly. Please move on to the lessons. The pre-test can only be taken once so that your results stay fair.</p><div class="row"><a class="btn primary" href="lessons.html">Start the lessons</a><button class="btn" type="button" id="nextLearner">Done. Next learner</button></div><p class="why">Sharing this device? Press "Done. Next learner" so the next person can take the pre-test. Your score is kept in the class log.</p>${sentNote()}`; document.getElementById("nextLearner").onclick = () => { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); }; return; }
  f.innerHTML = `<p><label><b>Your full name</b><br><input id="preWho" type="text" autocomplete="name" style="width:100%;max-width:22rem;padding:.5rem;margin-top:.3rem"></label></p>` + PRE.map((q, i) => `<fieldset data-i="${i}"><legend>${i + 1}. ${esc(q.q)}</legend>${q.o.map((o, j) => `<label><input type="radio" name="p${i}" value="${j}"> ${esc(o)}</label>`).join("")}</fieldset>`).join("") + `<button class="btn primary" type="submit">Save pre-test</button><p class="why" id="preMsg" role="status"></p>`;
}
$("preForm").addEventListener("submit", e => {
  e.preventDefault(); if (S.pre) return;
  const ans = PRE.map((q, i) => { const c = document.querySelector(`input[name="p${i}"]:checked`); return c ? +c.value : null; });
  const who = ($("preWho").value || "").trim(); if (!who) { $("preMsg").textContent = "Please type your full name first."; return; }
  let miss = false; ans.forEach((a, i) => { const fs = document.querySelector(`#preForm fieldset[data-i="${i}"]`); fs.classList.toggle("missing", a === null); if (a === null) miss = true; });
  if (miss) { $("preMsg").textContent = "Please answer every question. Unanswered ones are marked in red. Choose your best answer."; return; }
  S.pre = { score: ans.filter((a, i) => a === PRE[i].a).length, ans, at: new Date().toISOString() }; S.who = who; save(); logSet("pre", { score: S.pre.score, ilo1: iloN(PRE, ans, 1), ilo3: iloN(PRE, ans, 3), at: S.pre.at }); send("pretest", { score: S.pre.score, answers: S.pre.ans.join(""), ilo1: iloN(PRE, S.pre.ans, 1), ilo3: iloN(PRE, S.pre.ans, 3) }); renderPre(); toast("Pre-test saved");
});
function renderCompare() {
  ["compare", "compareT"].forEach(id => {
    const box = document.getElementById(id); if (!box) return;
    if (!S.pre) { box.className = "result show"; box.innerHTML = "No pre-test on this device yet. Take the <a href=\"pretest.html\">pre-test</a> first."; return; }
    if (!S.quiz) { box.className = "result show"; box.innerHTML = `Pre-test: ${S.pre.score}/5. Finish the assessment to see the comparison.`; return; }
    const part = (set, ans, k) => { if (!ans || !ans.length) return (k === 1 ? S.pre.ilo1 + "/3" : S.pre.ilo3 + "/2"); const idx = set.map((q, i) => i).filter(i => set[i].ilo === k); return idx.filter(i => ans[i] === set[i].a).length + "/" + idx.length; };
    const d = S.quiz.score - S.pre.score;
    box.className = "result show";
    box.innerHTML = `<strong>Pre-test ${S.pre.score}/5 → Post-test ${S.quiz.score}/5 (${d >= 0 ? "+" : ""}${d})</strong><p>Outcome 1, identify elements: ${part(PRE, S.pre.ans, 1)} before, ${part(QUIZ, S.quiz.ans, 1)} after. Outcome 3, explain planning first: ${part(PRE, S.pre.ans, 3)} before, ${part(QUIZ, S.quiz.ans, 3)} after. Outcome 2, write a page: ${S.missions.length}/3 missions complete.</p>`;
  });
}

renderLesson(); renderMissions(); renderPre(); renderCompare(); renderQuiz(S.quiz); showResult(); renderFb(); renderLog(); pending(); progress(); updateRPG(); run();

/* home page life */
document.querySelectorAll("[data-count]").forEach(el=>{const to=+el.dataset.count;if(REDUCE){el.textContent=to;return;}let t0;const f=t=>{t0=t0||t;const k=Math.min(1,(t-t0)/900);el.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);});
const tc=document.getElementById("typeCode");
if(tc){const code=`<h1>Hello, learner!</h1>\n<p>I wrote this myself.</p>\n<button>Start learning</button>`;
 const prev=$("typePrev");const draw=txt=>{tc.textContent=txt;prev.innerHTML=txt.replace(/<(?!\/?(h1|p|button)\b)[^>]*$/,"");};
 if(REDUCE)draw(code);else{let i=0;const step=()=>{draw(code.slice(0,++i));if(i<code.length)setTimeout(step,i%7?45:140);else setTimeout(()=>{i=0;step();},4500);};setTimeout(step,500);}}
})();
