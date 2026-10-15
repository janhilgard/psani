/* Kontroly obsahu a logiky kurzu: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildLayout } from "../public/js/layout.js";
import { LESSONS, PASS_ACC, buildText, lessonText, taskText, testText, makeRng, starsFor } from "../public/js/curriculum.js";
import { WORDS, NAMES, TEXTS } from "../public/js/words.js";
import { sanitize, fresh, weakChars } from "../public/js/store.js";

const qwertz = buildLayout("qwertz");
const qwerty = buildLayout("qwerty");
const stroke = (ch, l = qwertz) => l.strokesFor(ch);

test("české rozložení: číselná řada a domovská řada", () => {
  const expect = { "+": "Digit1", "ě": "Digit2", "š": "Digit3", "č": "Digit4", "ř": "Digit5",
    "ž": "Digit6", "ý": "Digit7", "á": "Digit8", "í": "Digit9", "é": "Digit0",
    "ú": "BracketLeft", "ů": "Semicolon", "=": "Minus", ";": "Backquote", "-": "Slash" };
  for (const [ch, code] of Object.entries(expect)) {
    assert.deepEqual(stroke(ch), [{ code, shift: false }], ch);
  }
  // číslice jsou na české klávesnici se Shiftem
  for (let d = 0; d <= 9; d++) assert.deepEqual(stroke(String(d)), [{ code: `Digit${d}`, shift: true }]);
  assert.deepEqual(stroke("?"), [{ code: "Comma", shift: true }]);
  assert.deepEqual(stroke(":"), [{ code: "Period", shift: true }]);
  assert.deepEqual(stroke("!"), [{ code: "Quote", shift: true }]);
});

test("QWERTZ vs QWERTY: Z a Y", () => {
  assert.equal(stroke("z")[0].code, "KeyY");
  assert.equal(stroke("y")[0].code, "KeyZ");
  assert.equal(stroke("z", qwerty)[0].code, "KeyZ");
  assert.equal(stroke("y", qwerty)[0].code, "KeyY");
  assert.equal(qwertz.fingerForChar("z"), "r4");
  assert.equal(qwertz.fingerForChar("y"), "l1");
});

test("mrtvé klávesy: ď ť ň ó a velká písmena s diakritikou", () => {
  assert.deepEqual(stroke("ď"), [{ code: "Equal", shift: true, dead: "ˇ" }, { code: "KeyD", shift: false }]);
  assert.deepEqual(stroke("ó"), [{ code: "Equal", shift: false, dead: "´" }, { code: "KeyO", shift: false }]);
  assert.deepEqual(stroke("Č"), [{ code: "Equal", shift: true, dead: "ˇ" }, { code: "KeyC", shift: true }]);
  assert.deepEqual(stroke("Á"), [{ code: "Equal", shift: false, dead: "´" }, { code: "KeyA", shift: true }]);
  assert.equal(qwertz.strokeCount("a"), 1);
  assert.equal(qwertz.strokeCount("A"), 2);
  assert.equal(qwertz.strokeCount("ď"), 3);
  assert.equal(qwertz.strokeCount("Č"), 4);
});

test("přiřazení prstů podle české metodiky", () => {
  const fingers = {
    l1: "qay+;", l2: "wsxě", l3: "edcš", l4: "rtfgvbčř",
    r4: "zuhjnmžý", r3: "ik,á", r2: "ol.í", r1: "pů§ú)é=-",
  };
  for (const [f, chars] of Object.entries(fingers)) {
    for (const ch of chars) assert.equal(qwertz.fingerForChar(ch), f, `${ch} má psát ${f}`);
  }
  assert.equal(qwertz.fingerForChar(" "), "t");
  // výstupky jen na F a J, domovská řada ASDF JKLŮ
  const keys = qwertz.rows.flat();
  assert.deepEqual(keys.filter(k => k.bump).map(k => k.code), ["KeyF", "KeyJ"]);
  assert.deepEqual(keys.filter(k => k.home).map(k => k.base).join(""), "asdfjklů");
});

test("každý znak slovníku a textů jde napsat", () => {
  for (const src of [WORDS, NAMES, TEXTS]) for (const item of src) {
    for (const ch of item) assert.ok(stroke(ch), `„${ch}“ v „${item.slice(0, 40)}“ nejde napsat`);
  }
  for (const w of WORDS) assert.match(w, /^[a-záčďéěíňóřšťúůýž]+$/, w);
});

test("lekce: každá přidává nové znaky jen jednou a vše jde napsat", () => {
  const seen = new Set();
  for (const l of LESSONS) {
    for (const ch of l.adds) {
      assert.ok(!seen.has(ch), `lekce ${l.id} znovu přidává ${ch}`);
      assert.ok(stroke(ch), `lekce ${l.id}: ${ch} nejde napsat`);
      seen.add(ch);
    }
  }
  assert.equal(LESSONS.length, 34);
});

test("generované texty obsahují jen naučené znaky a procvičují nové", () => {
  for (const l of LESSONS) {
    for (let seed = 1; seed <= 40; seed++) {
      const t = lessonText(l, makeRng(seed * 7919 + l.id));
      assert.ok(t.length >= Math.min(l.len, 80), `lekce ${l.id}: text je krátký`);
      for (const ch of t) assert.ok(l.known.has(ch), `lekce ${l.id} (seed ${seed}): neznámý znak „${ch}“ v „${t}“`);
      assert.ok(!/ {2}/.test(t) && t === t.trim(), `lekce ${l.id}: zdvojené mezery`);
    }
    // nové znaky se v textu opravdu objeví (ověřeno na 10 pokusech)
    const joined = Array.from({ length: 10 }, (_, i) => lessonText(l, makeRng(i + 1))).join("");
    for (const ch of l.adds) assert.ok(joined.includes(ch), `lekce ${l.id}: nový znak „${ch}“ se neprocvičuje`);
  }
});

test("úlohy: nácvik každého nového znaku, slova a procvičení", () => {
  let total = 0;
  for (const l of LESSONS) {
    total += l.tasks.length;
    assert.ok(l.tasks.length >= 1, `lekce ${l.id} nemá úlohy`);
    // každý nový znak má svou úlohu
    // úlohy na jednotlivé znaky jsou všechny kromě posledních dvou (slova a procvičení)
    const drilled = new Set(l.tasks.slice(0, -2).flatMap(t => [...t.focus]));
    if (l.adds.length) for (const ch of l.adds) assert.ok(drilled.has(ch), `lekce ${l.id}: znak ${ch} nemá vlastní úlohu`);
    for (const [ti, t] of l.tasks.entries()) {
      for (const ch of t.known) assert.ok(l.known.has(ch), `lekce ${l.id}/${ti}: úloha zná víc než lekce`);
      for (let seed = 1; seed <= 25; seed++) {
        const txt = taskText(t, makeRng(seed * 31 + l.id * 7 + ti));
        for (const ch of txt) assert.ok(t.known.has(ch), `lekce ${l.id}, úloha „${t.title}“: neznámý znak „${ch}“ v „${txt.slice(0, 80)}“`);
        assert.ok(txt === txt.trim() && !/ {2}/.test(txt), `lekce ${l.id}/${ti}: mezery`);
      }
      const joined = Array.from({ length: 8 }, (_, i) => taskText(t, makeRng(i + 1))).join("");
      for (const ch of t.focus) assert.ok(joined.includes(ch), `lekce ${l.id}, úloha „${t.title}“: znak ${ch} se neprocvičuje`);
    }
  }
  assert.ok(total >= 100, `úloh je jen ${total}`);
  // úlohy na jednotlivá písmena: E a I → samostatně E, samostatně I
  const ei = LESSONS.find(l => l.title === "E a I");
  assert.deepEqual(ei.tasks.slice(0, 2).map(t => [...t.focus]), [["e"], ["i"]]);
  assert.ok(!ei.tasks[0].known.has("i"), "úloha na E nesmí používat I");
});

test("slovník je dost velký i pro rané lekce", () => {
  assert.ok(WORDS.length >= 1500, `slov je jen ${WORDS.length}`);
  const pool = l => WORDS.filter(w => [...w].every(c => l.known.has(c))).length;
  assert.ok(pool(LESSONS[5]) >= 20, `domovská řada: jen ${pool(LESSONS[5])} slov`);
  assert.ok(pool(LESSONS[8]) >= 80, `po lekci O: jen ${pool(LESSONS[8])} slov`);
});

test("adaptivní trénink a test rychlosti", () => {
  const l = LESSONS[12];
  const t = buildText({ known: l.known, focus: new Set(["n", "m"]), kind: "words", len: 220, rng: makeRng(5) });
  for (const ch of t) assert.ok(l.known.has(ch));
  assert.ok((t.match(/[nm]/g) || []).length > 15, "zaměření na slabé znaky se neprojevilo");
  assert.ok(testText(makeRng(3)).length > 3000);
});

test("hvězdy", () => {
  const l = LESSONS[0];
  assert.equal(PASS_ACC, 90);
  assert.equal(starsFor(l, 999, 89.9), 0);
  assert.equal(starsFor(l, l.cpm - 1, 90), 1);
  assert.equal(starsFor(l, l.cpm, 97), 2);
  assert.equal(starsFor(l, l.cpm * 1.25, 98), 3);
});

test("sanitize: import zálohy přijme jen platná pole", () => {
  const ctx = { lessonIds: LESSONS.map(x => x.id), chars: [...qwertz.allChars] };
  const evil = JSON.parse(`{"__proto__":{"polluted":1},"settings":{"theme":"<script>","mode":"free","goal":99},
    "lessons":{"1":{"best":{"cpm":"x","acc":150,"stars":7},"tries":-3},"999":{"best":{}}},
    "keys":{"a":{"n":5,"err":1e99},"constructor":{"n":1}},
    "history":[{"kind":"lesson","cpm":100,"acc":95,"sec":60,"ts":1},{"kind":"hack"},"x"],"introSeen":"yes"}`);
  const s = sanitize(evil, ctx);
  assert.equal({}.polluted, undefined);
  assert.equal(s.settings.theme, "dark");
  assert.equal(s.settings.mode, "free");
  assert.equal(s.settings.goal, 10);
  assert.deepEqual(s.lessons[1].best, { cpm: 0, acc: 100, stars: 3, ts: 0 });
  assert.equal(s.lessons[1].tries, 0);
  assert.deepEqual(s.lessons[1].tasks, []);
  const withTasks = sanitize({ lessons: { 2: { tasks: [{ stars: 2, cpm: 80, acc: 95 }, "x", null], tries: 3 } } }, ctx);
  assert.deepEqual(withTasks.lessons[2].tasks, [{ cpm: 80, acc: 95, stars: 2 }, null, null]);
  assert.equal(withTasks.lessons[2].best, null);
  assert.equal(s.lessons[999], undefined);
  assert.equal(s.keys.a.err, 1e9);
  assert.equal(Object.hasOwn(s.keys, "constructor"), false);
  assert.equal(s.history.length, 1);
  assert.equal(s.introSeen, false);
  assert.deepEqual(sanitize(null, ctx), fresh());
});

test("slabé znaky: řadí podle chyb a prodlevy", () => {
  const s = fresh();
  s.keys = { a: { n: 50, err: 1, t: 50 * 200, nt: 50 }, ř: { n: 20, err: 8, t: 20 * 700, nt: 20 }, k: { n: 3, err: 3, t: 0, nt: 0 } };
  const w = weakChars(s, ["a", "ř", "k"]);
  assert.equal(w[0].ch, "ř");
  assert.equal(w.find(x => x.ch === "k"), undefined, "málo dat se nehodnotí");
});

test("index.html neobsahuje inline skripty ani styly (kvůli CSP)", () => {
  const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /<script(?![^>]*\bsrc=)[^>]*>/i);
  assert.doesNotMatch(html, /\sstyle\s*=/i);
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/);
});
