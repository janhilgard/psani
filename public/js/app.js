/* ================================================================
   PSANÍ VŠEMI DESETI — aplikace
================================================================ */
import { buildLayout, FINGERS, FINGER_ORDER } from "./layout.js";
import { LESSONS, SECTIONS, buildText, taskText, testText, starsFor } from "./curriculum.js";
import * as store from "./store.js";
import { renderKeyboard, highlightNext, flashKey, renderHands, highlightFingers, lineChart, fingerColor } from "./keyboard.js";

const $ = id => document.getElementById(id);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const fmt = n => n.toLocaleString("cs-CZ", { maximumFractionDigits: 1 });
const fmtTime = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const showChar = ch => ch === " " ? "␣" : ch;

const CTX = { lessonIds: LESSONS.map(l => l.id), chars: [...buildLayout().allChars] };
let S = store.load(CTX);
let layout = buildLayout(S.settings.layout);
let run = null;
let view = "home";
const save = () => store.save(S);

/* ================================================================
   STAV LEKCÍ
================================================================ */
const best = id => S.lessons[id]?.best ?? null;
const starsOf = id => best(id)?.stars ?? 0;
const passed = id => starsOf(id) >= 1;
const unlocked = idx => S.settings.freeChoice || idx === 0 || passed(LESSONS[idx - 1].id);
const nextLesson = () => LESSONS.find((l, i) => unlocked(i) && !passed(l.id)) ?? LESSONS[LESSONS.length - 1];
const passedCount = () => LESSONS.filter(l => passed(l.id)).length;
/* Úlohy: lekce je splněná, až když jsou splněné všechny její úlohy. */
const taskStars = (id, ti) => S.lessons[id]?.tasks?.[ti]?.stars ?? 0;
const taskPassed = (l, ti) => passed(l.id) || taskStars(l.id, ti) >= 1;
const tasksDone = l => l.tasks.filter((_, i) => taskPassed(l, i)).length;
const taskUnlocked = (l, ti) => S.settings.freeChoice || ti === 0 || taskPassed(l, ti - 1);
function firstOpenTask(l) {
  const i = l.tasks.findIndex((_, ti) => !taskPassed(l, ti));
  return i < 0 ? 0 : i;
}
/* Základ pro trénink: poslední splněná lekce (znaky, které žák opravdu umí). */
function trainingBase() {
  const done = LESSONS.filter(l => passed(l.id));
  return done.length ? done[done.length - 1] : LESSONS[0];
}

/* ================================================================
   NASTAVENÍ
================================================================ */
function applySettings() {
  document.documentElement.dataset.theme = S.settings.theme;
  $("textbox").classList.remove("size-s", "size-m", "size-l");
  $("textbox").classList.add("size-" + S.settings.size);
  for (const seg of document.querySelectorAll(".seg[data-setting]")) {
    for (const b of seg.querySelectorAll("button")) {
      const on = b.dataset.v === String(S.settings[seg.dataset.setting]);
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    }
  }
  if (layout.variant !== S.settings.layout) {
    layout = buildLayout(S.settings.layout);
    renderKeyboard($("keyboard"), layout);
    if (run) updateGuide();
  }
  applyKbMode();
}

for (const seg of document.querySelectorAll(".seg[data-setting]")) {
  seg.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const key = seg.dataset.setting;
    const value = store.SETTING_VALUES[key].find(v => String(v) === b.dataset.v);
    if (value === undefined) return;
    S.settings[key] = value;
    save();
    applySettings();
    if (key === "freeChoice") renderNav();
    if (key === "goal") renderHome();
  });
}

/* Režim zobrazení klávesnice. „Automaticky“ postupně odvyká koukání:
   nové klávesy ukáže celé, opakování jen s rukama, souvislý text a testy bez nápovědy. */
function kbMode() {
  const m = S.settings.kb;
  if (m !== "auto") return m;
  if (!run) return "full";
  if (run.mode === "test") return "hidden";
  if (run.mode === "adaptive") return "hands";
  if (run.lesson.kind === "text") return "hidden";
  return run.lesson.adds.length || run.lesson.id <= 6 ? "full" : "hands";
}
function applyKbMode() { $("kb-wrap").dataset.mode = kbMode(); }

/* ================================================================
   POHLEDY
================================================================ */
const VIEWS = ["home", "practice", "test", "stats"];
function show(v) {
  if (v !== "practice" && run) { stopClock(); run = null; }
  view = v;
  for (const name of VIEWS) $("view-" + name).classList.toggle("hidden", name !== v);
  for (const b of document.querySelectorAll("[data-go]")) b.classList.toggle("active", b.dataset.go === v);
  $("main").scrollTop = 0;
  if (v === "home") renderHome();
  if (v === "stats") renderStats();
  renderNav();
}

for (const b of document.querySelectorAll("[data-go]")) {
  b.addEventListener("click", () => {
    if (b.dataset.go === "adaptive") startAdaptive();
    else show(b.dataset.go);
  });
}

/* ================================================================
   SIDEBAR
================================================================ */
function starsEl(n, cls = "stars") {
  const s = el("span", cls);
  s.setAttribute("aria-label", `${n} ze 3 hvězd`);
  for (let i = 0; i < 3; i++) s.append(el("i", i < n ? "on" : "", "★"));
  return s;
}

function renderNav() {
  const nav = $("nav");
  nav.replaceChildren();
  for (const sec of SECTIONS) {
    nav.append(el("div", "nav-sec", sec.title));
    LESSONS.forEach((l, idx) => {
      if (l.section !== sec.id) return;
      const st = starsOf(l.id), open = unlocked(idx);
      const b = el("button", "nav-item");
      if (st) b.classList.add("done");
      if (!open) b.classList.add("locked");
      if (view === "practice" && run?.mode === "lesson" && run.lesson.id === l.id) b.classList.add("active");
      b.title = l.title;
      b.append(el("span", "no", st ? "✓" : String(l.id)), el("span", "tt", l.title));
      const part = tasksDone(l);
      if (!open) b.append(el("span", "lock", "🔒"));
      else if (!st && part) b.append(el("span", "part", `${part}/${l.tasks.length}`));
      else b.append(starsEl(st, "stars mini"));
      b.addEventListener("click", () => {
        if (open) startLesson(l);
        else toast(`Nejdřív splňte lekci ${idx}. Volný výběr lekcí zapnete v Nastavení.`);
      });
      nav.append(b);
    });
  }
}

function renderProgress() {
  const d = passedCount(), n = LESSONS.length;
  const C = 2 * Math.PI * 24;
  $("ring-fill").style.strokeDashoffset = String(C * (1 - d / n));
  $("ring-pct").textContent = Math.round(100 * d / n) + " %";
  $("prog-text").textContent = `${d} z ${n} lekcí splněno`;
}

/* ================================================================
   PŘEHLED
================================================================ */
function renderHome() {
  const d = passedCount(), n = LESSONS.length, next = nextLesson();
  const allDone = d === n;
  $("hero-title").replaceChildren();
  if (allDone) {
    $("hero-title").append("Kurz ", el("em", null, "dokončen"), ". Skvělá práce!");
    $("hero-sub").textContent = "Všechny lekce máte splněné. Teď je čas na rychlost: trénujte slabé klávesy a zkoušejte testy.";
  } else if (d === 0) {
    $("hero-title").append("Naučte se psát ", el("em", null, "všemi deseti"), ".");
    $("hero-sub").textContent = `${n} lekcí podle četnosti písmen v češtině — od domovské řady po diakritiku, velká písmena a souvislý text. Každý pokus je jiný text.`;
  } else {
    $("hero-title").append("Pokračujte: ", el("em", null, next.title));
    $("hero-sub").textContent = `Lekce ${next.id} z ${n}. ${next.desc}`;
  }
  $("btn-continue").textContent = allDone ? "Zopakovat závěrečnou zkoušku →" : `${d ? "Pokračovat" : "Začít"}: lekce ${next.id} →`;

  const bests = LESSONS.map(l => best(l.id)).filter(Boolean);
  $("h-done").replaceChildren(String(d), el("small", null, ` / ${n}`));
  const recent = S.history.slice(-20);
  $("h-best").textContent = S.history.length ? String(Math.max(...S.history.map(h => h.cpm))) : "–";
  $("h-acc").textContent = recent.length ? fmt(recent.reduce((a, h) => a + h.acc, 0) / recent.length) + " %" : "–";

  const mins = store.minutesToday(S), goal = S.settings.goal;
  $("goal-fill").style.width = Math.min(100, 100 * mins / goal) + "%";
  $("goal-text").textContent = mins >= goal
    ? `Splněno! ${fmt(Math.round(mins))} z ${goal} min`
    : `${fmt(Math.round(mins))} z ${goal} min`;
  const sk = store.streak(S);
  $("streak").textContent = sk ? `${sk} ${sk === 1 ? "den" : sk < 5 ? "dny" : "dní"} v řadě` : "Začněte dnes";

  const letters = [...trainingBase().known].filter(c => c !== " ");
  const weak = store.weakChars(S, letters, 5);
  const wk = $("weak-keys");
  wk.replaceChildren();
  if (!weak.length) wk.append(el("p", "muted", "Zatím málo dat. Slabé klávesy se ukážou po několika cvičeních."));
  for (const w of weak) {
    const chip = el("span", "weak-chip");
    chip.append(el("kbd", null, showChar(w.ch)), ` ${fmt(Math.round(w.acc * 1000) / 10)} %`);
    wk.append(chip);
  }
  $("btn-adaptive-home").disabled = false;
  lineChart($("home-chart"), historySeries(30), { height: 150, empty: "Graf se objeví po dvou dokončených cvičeních." });
}

function historySeries(count) {
  const h = S.history.slice(-count);
  return [
    { label: "úhozů za minutu", values: h.map(x => x.cpm), cls: "s-cpm", axis: true },
    { label: "přesnost (%)", values: h.map(x => x.acc), cls: "s-acc", min: 50, max: 100 },
  ];
}

$("btn-continue").addEventListener("click", () => startLesson(nextLesson()));
$("btn-adaptive-home").addEventListener("click", startAdaptive);

/* ================================================================
   CVIČENÍ — start
================================================================ */
function startLesson(l, ti = firstOpenTask(l)) {
  const task = l.tasks[ti];
  begin({
    mode: "lesson", lesson: l, taskIdx: ti, task, text: taskText(task),
    title: `${l.id}. ${l.title}`, sub: l.desc,
    chip: l.adds.length ? "Nové: " + chipText(l.adds) : "Opakování",
  });
  if (l.id === 1 && !S.introSeen) openModal("intro");
}

/* Krokovník úloh nad textem. */
function renderSteps() {
  const box = $("task-steps");
  box.replaceChildren();
  if (run.mode !== "lesson") return;
  const l = run.lesson;
  l.tasks.forEach((t, i) => {
    const b = el("button", "step");
    if (taskPassed(l, i)) b.classList.add("done");
    if (i === run.taskIdx) { b.classList.add("current"); b.setAttribute("aria-current", "step"); }
    const open = taskUnlocked(l, i);
    if (!open) b.classList.add("locked");
    b.append(el("span", "n", taskPassed(l, i) ? "✓" : String(i + 1)), el("span", "t", t.title));
    b.title = open ? `Úloha ${i + 1}: ${t.title}` : "Nejdřív splňte předchozí úlohu.";
    b.addEventListener("click", () => {
      if (open) startLesson(l, i);
      else toast("Nejdřív splňte předchozí úlohu.");
    });
    box.append(b);
  });
}
function chipText(adds) {
  if (adds.join("") === "ABCDEFGHIJKLMNOPQRSTUVWXYZ") return "A–Z";
  return adds.map(showChar).join(" ");
}

function startAdaptive() {
  const base = trainingBase();
  const letters = [...base.known].filter(c => c !== " ");
  const weak = store.weakChars(S, letters, 4).map(w => w.ch);
  const focus = weak.length ? weak : (base.adds.length ? base.adds : letters.slice(0, 4));
  begin({
    mode: "adaptive",
    text: buildText({ known: base.known, focus: new Set(focus), kind: "words", len: 220 }),
    title: "Trénink slabých kláves",
    sub: weak.length
      ? "Text je složený tak, aby obsahoval znaky, u kterých nejčastěji chybujete nebo váháte."
      : "Zatím nemáte dost dat o chybách, procvičujeme proto znaky z poslední lekce.",
    chip: "Zaměření: " + focus.map(showChar).join(" "),
  });
}

function startTest(sec) {
  begin({
    mode: "test", limit: sec, text: testText(),
    title: `Test rychlosti — ${sec / 60} min`,
    sub: "Pište souvislý text co nejrychleji a nejpřesněji. Měří se čisté úhozy za minutu.",
    chip: "Bez nápovědy",
  });
}
for (const b of document.querySelectorAll("[data-test]")) {
  b.addEventListener("click", () => startTest(Number(b.dataset.test)));
}

function restart() {
  if (!run) return;
  if (run.mode === "lesson") startLesson(run.lesson, run.taskIdx);
  else if (run.mode === "adaptive") startAdaptive();
  else startTest(run.limit);
}

function begin(opts) {
  stopClock();
  closeModal();
  run = {
    ...opts, pos: 0, status: new Uint8Array(opts.text.length), spans: [],
    errors: 0, okChars: 0, okStrokes: 0, t0: 0, tLast: 0, timer: null,
    deadPending: false, finished: false, fingerErr: {}, charErr: {},
  };
  show("practice");
  $("practice-title").textContent = opts.title;
  $("practice-chip").textContent = opts.chip;
  $("practice-sub").textContent = opts.sub;
  $("practice-target").replaceChildren(...targetNodes());
  renderSteps();
  $("st-time-label").textContent = run.mode === "test" ? "Zbývá" : "Čas";
  $("warn").replaceChildren();
  renderText();
  markChar(0);
  applyKbMode();
  updateGuide();
  updateStats();
  document.activeElement?.blur?.();
}

function targetNodes() {
  if (run.mode !== "lesson") return [el("span", null, run.mode === "test"
    ? "Výsledek se uloží do statistik. Chyby se neopravují — pište dál."
    : "Po dokončení se statistiky kláves aktualizují a příští trénink se přizpůsobí.")];
  const t = run.task, b = S.lessons[run.lesson.id]?.tasks?.[run.taskIdx];
  const nodes = [
    el("span", "task-name", `Úloha ${run.taskIdx + 1}/${run.lesson.tasks.length}: ${t.title}`),
    el("span", null, `Splnění: přesnost ≥ ${t.acc} %`),
    el("span", null, `★★ od ${t.cpm} úhozů/min`),
    el("span", null, `★★★ přesnost 98 % a ${Math.round(t.cpm * 1.25)} úhozů/min`),
  ];
  if (b) {
    const s = el("span", "best");
    s.append("Nejlepší: ", starsEl(b.stars), ` ${b.cpm} úh/min, ${fmt(b.acc)} %`);
    nodes.push(s);
  }
  return nodes;
}

/* ================================================================
   CVIČENÍ — text
================================================================ */
function renderText() {
  const inner = $("text-inner");
  inner.replaceChildren();
  run.spans = [];
  let word = el("span", "w");
  for (const ch of run.text) {
    const sp = el("span", ch === " " ? "ch sp" : "ch", ch);
    run.spans.push(sp);
    word.append(sp);
    if (ch === " ") { inner.append(word); word = el("span", "w"); }
  }
  if (word.childNodes.length) inner.append(word);
  inner.style.transform = "translateY(0)";
  $("textbox").setAttribute("aria-label", "Text k opsání: " + run.text.slice(0, 300));
}

const STATUS_CLS = ["", " ok", " bad", " fixed", " bad"];
function markChar(i) {
  const sp = run.spans[i];
  if (!sp) return;
  sp.className = (run.text[i] === " " ? "ch sp" : "ch") + STATUS_CLS[run.status[i]] + (i === run.pos && !run.finished ? " cur" : "");
}

/* Text se posouvá po řádcích: aktuální řádek je vždy druhý shora. */
function scrollText() {
  const sp = run.spans[Math.min(run.pos, run.spans.length - 1)];
  const inner = $("text-inner");
  const lh = parseFloat(getComputedStyle(inner).lineHeight) || 40;
  inner.style.transform = `translateY(${-Math.max(0, sp.offsetTop - lh)}px)`;
}

/* ================================================================
   CVIČENÍ — nápověda (klávesnice, ruce, text)
================================================================ */
function strokeName(st) {
  const key = layout.byCode.get(st.code);
  let name;
  if (key.code === "Space") name = "mezerník";
  else if (key.shift === key.base.toUpperCase() && key.shift !== key.base) name = key.shift;
  else name = st.dead ? st.dead : (st.shift ? key.shift : key.base);
  const finger = FINGERS[key.f].name;
  if (st.dead) return `mrtvá klávesa ${st.dead} (${st.shift ? "Shift + ´" : "´"}, ${finger})`;
  return `${st.shift ? "Shift + " : ""}${name} (${finger})`;
}

function updateGuide() {
  const kb = $("keyboard"), hands = $("hands"), hint = $("next-hint");
  if (!run || run.finished) {
    highlightNext(kb, layout, null);
    highlightFingers(hands, new Set());
    hint.replaceChildren();
    return;
  }
  const ch = run.text[run.pos];
  const strokes = layout.strokesFor(ch);
  const step = run.deadPending && strokes && strokes.length > 1 ? 1 : 0;
  highlightFingers(hands, highlightNext(kb, layout, strokes, step));
  hint.replaceChildren(el("span", "lbl", "Další znak"), el("kbd", "big", showChar(ch)));
  if (strokes) {
    const parts = strokes.map((st, i) => {
      const s = el("span", i < step ? "done" : i === step ? "now" : "", strokeName(st));
      return s;
    });
    parts.forEach((p, i) => { if (i) hint.append(el("span", "arrow", "→")); hint.append(p); });
  }
  $("kb-wrap").classList.toggle("reveal", run.status[run.pos] === 2);
}

/* ================================================================
   CVIČENÍ — klávesy
================================================================ */
document.addEventListener("keydown", e => {
  if (openModalId) { modalKey(e); return; }
  if (view !== "practice" || !run) return;
  if (e.ctrlKey || e.metaKey || e.isComposing) return;
  if (e.key === "Escape") { e.preventDefault(); show("home"); return; }
  if (e.key === "Enter") { e.preventDefault(); restart(); return; }
  if (run.finished) return;
  capsWarning(e);

  if (e.key === "Dead") {
    if (!run.t0) startClock();
    run.deadPending = true;
    flashKey($("keyboard"), e.code);
    updateGuide();
    return;
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    if (S.settings.mode === "free") stepBack();
    return;
  }
  if (e.key.length !== 1) return;
  e.preventDefault();
  if (e.repeat) return;
  typeChar(e);
});

function typeChar(e) {
  const ch = e.key, expected = run.text[run.pos];
  const now = performance.now();
  run.deadPending = false;
  if (!run.t0) startClock();
  layoutChecks(e, expected);

  if (ch === expected) {
    flashKey($("keyboard"), e.code);
    const k = store.keyStat(S, expected);
    k.n++;
    if (run.tLast) {
      const lat = now - run.tLast;
      if (lat < 4000) { k.t += lat; k.nt++; }
    }
    run.tLast = now;
    run.okChars++;
    run.okStrokes += layout.strokeCount(expected);
    run.status[run.pos] = run.status[run.pos] === 2 ? 3 : 1;
    advance();
  } else {
    flashKey($("keyboard"), e.code, "miss");
    beep();
    run.errors++;
    store.keyStat(S, expected).err++;
    const f = layout.fingerForChar(expected);
    run.fingerErr[f] = (run.fingerErr[f] || 0) + 1;
    run.charErr[expected] = (run.charErr[expected] || 0) + 1;
    if (S.settings.mode === "free" || run.mode === "test") {
      run.status[run.pos] = 4;
      run.tLast = now;
      advance();
    } else {
      run.status[run.pos] = 2;
      markChar(run.pos);
      updateGuide();
    }
  }
  updateStats();
}

function advance() {
  run.pos++;
  markChar(run.pos - 1);
  if (run.pos >= run.text.length) { finish(); return; }
  markChar(run.pos);
  scrollText();
  updateGuide();
}

function stepBack() {
  if (run.pos === 0) return;
  run.pos--;
  run.status[run.pos] = 0;
  markChar(run.pos + 1);
  markChar(run.pos);
  scrollText();
  updateGuide();
}

/* ---------- varování: Caps Lock a rozložení klávesnice ---------- */
function setWarn(id, text, action) {
  if ($("warn").querySelector(`[data-id="${id}"]`)) return;
  const w = el("div", "warn-chip");
  w.dataset.id = id;
  w.setAttribute("role", "alert");
  w.append(el("span", null, text));
  if (action) {
    const b = el("button", "btn sm", action.label);
    b.addEventListener("click", () => { action.run(); w.remove(); });
    w.append(b);
  }
  $("warn").append(w);
}
function clearWarn(id) { $("warn").querySelector(`[data-id="${id}"]`)?.remove(); }

function capsWarning(e) {
  if (typeof e.getModifierState !== "function") return;
  if (e.getModifierState("CapsLock")) setWarn("caps", "Máte zapnutý Caps Lock. Vypněte ho — velká písmena se píšou se Shiftem.");
  else clearWarn("caps");
}

const NUMROW_DIA = "ěščřžýáíé";
function layoutChecks(e, expected) {
  const strokes = layout.strokesFor(expected);
  if (!strokes) return;
  // čekáme ě/š/č…, ale z té klávesy přišla číslice → systém má anglickou klávesnici
  if (NUMROW_DIA.includes(expected) && e.code === strokes[0].code && /^[0-9]$/.test(e.key) && !e.shiftKey) {
    setWarn("layout-cz", "Vypadá to, že máte zapnutou anglickou klávesnici. Přepněte rozložení v systému na češtinu.");
  }
  // správné Y/Z, ale z jiné fyzické klávesy → systém má opačnou variantu (QWERTY/QWERTZ)
  if ("yzYZ".includes(expected) && e.key === expected && e.code !== strokes[0].code) {
    const other = S.settings.layout === "qwertz" ? "qwerty" : "qwertz";
    setWarn("layout-yz", `Vaše klávesnice má prohozené Y a Z (${other.toUpperCase()}).`, {
      label: `Přepnout na ${other.toUpperCase()}`,
      run: () => { S.settings.layout = other; save(); applySettings(); },
    });
  }
}

/* ---------- zvuk chyby (volitelný) ---------- */
let audio = null;
function beep() {
  if (!S.settings.sound) return;
  try {
    audio ??= new AudioContext();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = 196;
    g.gain.setValueAtTime(0.06, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.12);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.13);
  } catch (e) { /* zvuk není k dispozici */ }
}

/* ================================================================
   CVIČENÍ — čas a statistiky
================================================================ */
function startClock() {
  run.t0 = performance.now();
  run.timer = setInterval(tick, 250);
}
function stopClock() {
  if (run?.timer) { clearInterval(run.timer); run.timer = null; }
}
function elapsed() {
  if (!run.t0) return 0;
  const s = (performance.now() - run.t0) / 1000;
  return run.limit ? Math.min(s, run.limit) : s;
}
function tick() {
  if (!run || run.finished) return;
  updateStats();
  if (run.limit && elapsed() >= run.limit) finish();
}
function currentCpm(sec) { return sec >= 1 ? Math.round(run.okStrokes / (sec / 60)) : 0; }
function currentAcc() {
  const t = run.okChars + run.errors;
  return t ? Math.round(1000 * run.okChars / t) / 10 : 100;
}
function updateStats() {
  const sec = elapsed();
  $("st-cpm").textContent = currentCpm(sec);
  $("st-acc").textContent = fmt(currentAcc()) + " %";
  $("st-err").textContent = run.errors;
  $("st-time").textContent = run.limit ? fmtTime(run.limit - sec) : fmtTime(sec);
  const progress = run.limit ? sec / run.limit : run.pos / run.text.length;
  $("bar").style.width = Math.min(100, 100 * progress) + "%";
}

/* ================================================================
   VÝSLEDEK
================================================================ */
function finish() {
  run.finished = true;
  stopClock();
  markChar(run.pos);
  updateGuide();
  const sec = Math.max(1, elapsed());
  const cpm = currentCpm(sec), acc = currentAcc();
  const r = { cpm, acc, sec, stars: null, wasPassed: false, record: false };

  if (run.mode === "lesson") {
    const l = run.lesson, ti = run.taskIdx;
    r.wasPassed = passed(l.id);
    r.stars = starsFor(run.task, cpm, acc);
    const rec = S.lessons[l.id] ?? { best: null, tries: 0, tasks: [] };
    rec.tasks ??= [];
    rec.tries++;
    const tb = rec.tasks[ti];
    if (!tb || r.stars > tb.stars || (r.stars === tb.stars && cpm > tb.cpm)) {
      r.record = !!tb && r.stars >= 1 && cpm > tb.cpm;
      rec.tasks[ti] = { cpm, acc, stars: r.stars };
    }
    for (let i = 0; i < l.tasks.length; i++) rec.tasks[i] ??= null;
    // souhrn lekce, jakmile jsou splněné všechny úlohy
    const ts = rec.tasks.slice(0, l.tasks.length);
    if (ts.every(t => t && t.stars >= 1)) {
      const sum = {
        stars: Math.min(...ts.map(t => t.stars)),
        cpm: Math.round(ts.reduce((a, t) => a + t.cpm, 0) / ts.length),
        acc: Math.round(10 * ts.reduce((a, t) => a + t.acc, 0) / ts.length) / 10,
        ts: Date.now(),
      };
      if (!rec.best || sum.stars > rec.best.stars || (sum.stars === rec.best.stars && sum.cpm > rec.best.cpm)) rec.best = sum;
    }
    S.lessons[l.id] = rec;
    r.lessonDone = !r.wasPassed && passed(l.id);
  } else if (run.mode === "test") {
    const prev = S.history.filter(h => h.kind === "test" && h.id === run.limit);
    r.record = prev.length > 0 && cpm > Math.max(...prev.map(h => h.cpm));
  }
  S.history.push({
    ts: Date.now(), kind: run.mode, id: run.mode === "lesson" ? run.lesson.id : (run.limit || 0),
    cpm, acc, sec: Math.round(sec), err: run.errors,
  });
  if (S.history.length > 1000) S.history.splice(0, S.history.length - 1000);
  save();
  renderProgress();
  renderNav();
  showResults(r);
}

function showResults(r) {
  const l = run.lesson, ti = run.taskIdx;
  $("res-title").textContent = run.mode === "lesson" ? `Lekce ${l.id} · úloha ${ti + 1}/${l.tasks.length}: ${run.task.title}`
    : run.mode === "test" ? `Test rychlosti — ${run.limit / 60} min` : "Trénink slabých kláves";
  $("res-stars").replaceChildren();
  if (r.stars !== null) $("res-stars").append(starsEl(r.stars, "stars big"));
  $("res-cpm").textContent = r.cpm;
  $("res-acc").textContent = fmt(r.acc) + " %";
  $("res-time").textContent = fmtTime(r.sec);
  $("res-err").textContent = run.errors;
  $("res-record").classList.toggle("show", r.record);

  let verdict, cls = "ok";
  const next = l && LESSONS.find(x => x.id === l.id + 1);
  const nextTask = l && l.tasks[ti + 1];
  nextAction = null;
  if (run.mode === "lesson") {
    const t = run.task;
    if (r.stars === 0) {
      cls = "fail";
      verdict = `Pro splnění potřebujete přesnost alespoň ${t.acc} % (máte ${fmt(r.acc)} %). Zpomalte — přesnost je teď důležitější než rychlost.`;
    } else {
      const done = nextTask ? `Úloha splněna! Další: ${nextTask.title}.`
        : r.lessonDone ? `Celá lekce splněna${next ? " a další lekce je odemčená" : ""}!`
        : "Úloha splněna!";
      const more = r.stars === 1 ? ` Druhou hvězdu získáte při ${t.cpm} úhozech za minutu.`
        : r.stars === 2 ? ` Třetí hvězda: přesnost 98 % a ${Math.round(t.cpm * 1.25)} úhozů za minutu.`
        : " Perfektní výkon — tři hvězdy!";
      verdict = done + more;
      if (nextTask) nextAction = { label: "Další úloha →", run: () => startLesson(l, ti + 1) };
      else if (next && passed(l.id)) nextAction = { label: "Další lekce →", run: () => startLesson(next) };
    }
  } else if (run.mode === "test") {
    verdict = r.cpm >= 200 ? "Skvělé tempo, to už je rychlost zkušeného písaře."
      : r.cpm >= 120 ? "Dobré tempo. Pravidelným tréninkem se dostanete přes 200 úhozů za minutu."
      : "Dobrý začátek. Rychlost poroste sama, když budete psát přesně a pravidelně.";
  } else {
    verdict = "Statistiky kláves jsou aktualizované. Další trénink se zaměří na to, co je teď nejslabší.";
  }
  $("res-verdict").textContent = verdict;
  $("res-verdict").className = "verdict " + cls;

  // chyby podle prstů
  const box = $("res-fingers");
  box.replaceChildren();
  const max = Math.max(1, ...FINGER_ORDER.map(f => run.fingerErr[f] || 0));
  for (const f of FINGER_ORDER) {
    const c = run.fingerErr[f] || 0;
    const row = el("div", "fbar-row");
    const tr = el("span", "tr"), fill = el("i");
    fill.style.width = (100 * c / max) + "%";
    fill.style.background = fingerColor(f);
    tr.append(fill);
    row.append(el("span", "nm", FINGERS[f].name), tr, el("span", "ct", String(c)));
    box.append(row);
  }
  // nejproblematičtější znaky
  const chars = Object.entries(run.charErr).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const cbox = $("res-chars");
  cbox.replaceChildren();
  if (chars.length) {
    cbox.append(el("span", "lbl", "Nejvíc chyb:"));
    for (const [ch, n] of chars) {
      const c = el("span", "weak-chip");
      c.append(el("kbd", null, showChar(ch)), ` × ${n}`);
      cbox.append(c);
    }
  }

  const canNext = !!nextAction;
  if (canNext) $("btn-next").textContent = nextAction.label;
  $("btn-next").classList.toggle("hidden", !canNext);
  $("btn-again").classList.toggle("primary", !canNext);
  openModal("overlay", canNext ? "btn-next" : "btn-again");
  $("live").textContent = `${$("res-title").textContent}. ${r.cpm} úhozů za minutu, přesnost ${fmt(r.acc)} %. ${verdict}`;
}

$("btn-again").addEventListener("click", restart);
let nextAction = null;
$("btn-next").addEventListener("click", () => nextAction?.run());
$("btn-menu").addEventListener("click", () => { closeModal(); show("home"); });
$("btn-back").addEventListener("click", () => show("home"));
$("btn-restart").addEventListener("click", restart);

/* ================================================================
   MODÁLNÍ OKNA
================================================================ */
let openModalId = null;
function openModal(id, focusId) {
  closeModal();
  openModalId = id;
  $(id).classList.remove("hidden");
  const f = focusId ? $(focusId) : $(id).querySelector("button");
  f?.focus();
}
function closeModal() {
  if (!openModalId) return;
  $(openModalId).classList.add("hidden");
  openModalId = null;
}
function modalKey(e) {
  if (e.key === "Escape") {
    e.preventDefault();
    const id = openModalId;
    closeModal();
    if (id === "overlay") show("home");
    if (id === "intro") { S.introSeen = true; save(); }
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (openModalId === "intro") $("btn-intro").click();
    else if (openModalId === "overlay") (!$("btn-next").classList.contains("hidden") ? $("btn-next") : $("btn-again")).click();
    else if (openModalId === "settings") closeModal();
  }
}
$("btn-intro").addEventListener("click", () => { S.introSeen = true; save(); closeModal(); });
$("btn-settings").addEventListener("click", () => { openModal("settings"); detectLayout(); });
$("btn-settings-close").addEventListener("click", closeModal);
for (const id of ["overlay", "intro", "settings"]) {
  $(id).addEventListener("click", e => { if (e.target === $(id) && id !== "overlay") closeModal(); });
}

/* ================================================================
   STATISTIKY
================================================================ */
function activityName(h) {
  if (h.kind === "lesson") return `Lekce ${h.id}`;
  if (h.kind === "test") return `Test ${h.id / 60} min`;
  return "Trénink";
}

function renderStats() {
  const h = S.history;
  const totalMin = h.reduce((a, x) => a + x.sec, 0) / 60;
  $("s-time").textContent = totalMin >= 60 ? `${fmt(Math.round(totalMin / 6) / 10)} h` : `${Math.round(totalMin)} min`;
  $("s-count").textContent = h.length;
  const tests = h.filter(x => x.kind === "test");
  $("s-best").textContent = tests.length ? Math.max(...tests.map(x => x.cpm)) : "–";
  $("s-acc").textContent = h.length ? fmt(h.reduce((a, x) => a + x.acc, 0) / h.length) + " %" : "–";

  lineChart($("stats-chart"), historySeries(60), { empty: "Graf se objeví po dvou dokončených cvičeních." });

  // teplotní mapa: chyby sečtené podle klávesy, na kterou znak připadá
  const heat = new Map();
  for (const [ch, k] of Object.entries(S.keys)) {
    const strokes = layout.strokesFor(ch);
    if (!strokes) continue;
    const code = strokes[strokes.length - 1].code;
    const a = heat.get(code) ?? { n: 0, err: 0, chars: [] };
    a.n += k.n; a.err += k.err; a.chars.push(showChar(ch));
    heat.set(code, a);
  }
  for (const [code, a] of heat) {
    const total = a.n + a.err;
    if (!total) { heat.delete(code); continue; }
    const rate = a.err / total;
    heat.set(code, { rate: Math.min(1, rate * 5), acc: fmt(Math.round(1000 * (1 - rate)) / 10), total, label: a.chars.join(" ") });
  }
  renderKeyboard($("heatmap"), layout, { heat });

  const weak = store.weakChars(S, Object.keys(S.keys), 10);
  const wt = $("weak-table");
  wt.replaceChildren();
  if (!weak.length) {
    const tr = el("tr"), td = el("td", "muted", "Zatím málo dat.");
    td.colSpan = 3;
    tr.append(td);
    wt.append(tr);
  }
  for (const w of weak) {
    const tr = el("tr");
    const k = el("td");
    k.append(el("kbd", null, showChar(w.ch)));
    tr.append(k, el("td", null, fmt(Math.round(w.acc * 1000) / 10) + " %"), el("td", null, w.lat === null ? "–" : Math.round(w.lat * 1000) + " ms"));
    wt.append(tr);
  }

  const ht = $("history");
  ht.replaceChildren();
  for (const x of h.slice(-15).reverse()) {
    const tr = el("tr");
    const d = new Date(x.ts);
    tr.append(
      el("td", null, d.toLocaleDateString("cs-CZ") + " " + d.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })),
      el("td", null, activityName(x)), el("td", null, String(x.cpm)),
      el("td", null, fmt(x.acc) + " %"), el("td", null, fmtTime(x.sec)),
    );
    ht.append(tr);
  }
  if (!h.length) {
    const tr = el("tr"), td = el("td", "muted", "Zatím žádná cvičení.");
    td.colSpan = 5;
    tr.append(td);
    ht.append(tr);
  }
}

/* ---------- záloha ---------- */
$("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(S)], { type: "application/json" });
  const a = el("a");
  a.href = URL.createObjectURL(blob);
  a.download = `psani-vsemi-deseti-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$("btn-import").addEventListener("click", () => $("file-import").click());
$("file-import").addEventListener("change", async e => {
  const file = e.target.files[0];
  e.target.value = "";
  if (!file) return;
  if (file.size > 2_000_000) { toast("Soubor je příliš velký na zálohu."); return; }
  let raw;
  try { raw = JSON.parse(await file.text()); } catch (err) { toast("Soubor není platná záloha."); return; }
  const imported = store.sanitize(raw, CTX);
  if (!confirm(`Načíst zálohu (${Object.keys(imported.lessons).length} lekcí, ${imported.history.length} cvičení)? Současný pokrok se přepíše.`)) return;
  S = imported;
  save();
  refreshAll();
  toast("Záloha načtena.");
});
$("btn-reset").addEventListener("click", () => {
  if (!confirm("Opravdu smazat veškerý pokrok a statistiky? Nastavení zůstane.")) return;
  const settings = S.settings;
  S = store.fresh();
  S.settings = settings;
  save();
  refreshAll();
  toast("Pokrok byl smazán.");
});

/* ================================================================
   ROZLOŽENÍ KLÁVESNICE V SYSTÉMU (Keyboard Map API, Chrome/Edge)
================================================================ */
async function detectLayout() {
  const out = $("layout-detect");
  out.replaceChildren();
  if (!navigator.keyboard?.getLayoutMap) {
    out.textContent = "Rozložení systému tento prohlížeč neprozradí. Pokud se zvýrazněná klávesa neshoduje se skutečností, zkontrolujte, že máte v systému zapnutou češtinu.";
    return null;
  }
  try {
    const map = await navigator.keyboard.getLayoutMap();
    const czech = map.get("Digit2") === "ě";
    const variant = map.get("KeyY") === "z" ? "qwertz" : map.get("KeyY") === "y" ? "qwerty" : null;
    if (!czech) {
      out.textContent = "Systém teď nemá zapnutou českou klávesnici. Přepněte rozložení na češtinu, jinak nepůjde psát diakritika.";
    } else {
      out.textContent = `Systém hlásí českou klávesnici ${variant ? variant.toUpperCase() : ""}.`;
      if (variant && variant !== S.settings.layout) {
        const b = el("button", "btn sm", `Použít ${variant.toUpperCase()}`);
        b.addEventListener("click", () => { S.settings.layout = variant; save(); applySettings(); detectLayout(); });
        out.append(" ", b);
      }
    }
    return { czech, variant };
  } catch (e) { return null; }
}

/* ================================================================
   OSTATNÍ
================================================================ */
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3200);
}

function refreshAll() {
  applySettings();
  renderNav();
  renderProgress();
  if (view === "home") renderHome();
  if (view === "stats") renderStats();
}

document.addEventListener("visibilitychange", () => { if (document.hidden) save(); });

if (matchMedia("(hover: none) and (pointer: coarse)").matches) $("mobile-warn").classList.remove("hidden");
$("mobile-warn-close").addEventListener("click", () => $("mobile-warn").classList.add("hidden"));

/* ---------- start ---------- */
renderKeyboard($("keyboard"), layout);
renderHands($("hands"));
applySettings();
renderProgress();
show("home");
// první návštěva: převezmeme variantu klávesnice ze systému, pokud ji prohlížeč zná
if (!S.history.length) {
  detectLayout().then(r => {
    if (r?.czech && r.variant && r.variant !== S.settings.layout) { S.settings.layout = r.variant; save(); applySettings(); }
  });
}
