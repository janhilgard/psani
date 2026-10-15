/* ================================================================
   OSNOVA A GENERÁTOR CVIČENÍ
   Každá lekce přidává nové znaky (adds). Text lekce se pokaždé generuje
   znovu, a to jen ze znaků, které žák už zná (known) — s důrazem na nové
   znaky (focus). Pořadí písmen sleduje četnost v češtině.
================================================================ */
import { WORDS, NAMES, TEXTS } from "./words.js";

export const PASS_ACC = 94;
const UPPER_PLAIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const UPPER_DIA = "ÁČĎÉĚÍŇÓŘŠŤÚÝŽ";

export const SECTIONS = [
  { id: "home",  title: "Domovská řada" },
  { id: "top",   title: "Horní řada" },
  { id: "bottom", title: "Dolní řada" },
  { id: "dia",   title: "Diakritika" },
  { id: "shift", title: "Shift, číslice a znaménka" },
  { id: "text",  title: "Souvislý text" },
];

const DEFS = [
  ["home", "F a J", "fj", "keys", 90, 40,
    "Položte ukazováčky na F a J — mají hmatové výstupky. Ostatní prsty leží vedle nich na domovské řadě a palce na mezerníku."],
  ["home", "D a K", "dk", "keys", 100, 45,
    "Prostředníky leží na D a K. Po každém úhozu se prst vrací na své místo."],
  ["home", "S a L", "sl", "keys", 110, 50,
    "Prsteníky na S a L. Pište rytmicky a stejnoměrně, rychlost zatím neřešte."],
  ["home", "A a Ů", "aů", "keys", 120, 55,
    "Malíky na A a Ů. Teď máte obsazenou celou domovskou řadu: ASDF a JKLŮ."],
  ["home", "G a H", "gh", "keys", 130, 60,
    "Ukazováky se natáhnou dovnitř: levý na G, pravý na H. Pak se hned vrátí na F a J."],
  ["home", "Domovská řada — slova", "", "words", 150, 65,
    "Opakování celé domovské řady na skutečných slovech. Dívejte se na obrazovku, ne na ruce."],

  ["top", "E a I", "ei", "words", 160, 70,
    "Prostředníky jdou nahoru: levý na E, pravý na I. Dvě z nejčastějších písmen češtiny."],
  ["top", "R a U", "ru", "words", 170, 75,
    "Ukazováky nahoru na R a U. Ruka se nezvedá — pohybuje se jen prst."],
  ["top", "O", "o", "words", 170, 80,
    "Pravý prsteník nahoru na O. Nejčastější písmeno české abecedy."],
  ["top", "T a Z", "tz", "words", 180, 85,
    "Levý ukazovák na T, pravý ukazovák na Z. Na české klávesnici leží Z v horní řadě."],
  ["top", "P", "p", "words", 180, 90,
    "Pravý malík nahoru na P."],
  ["top", "Opakování: horní řada", "", "words", 200, 95,
    "Kombinace domovské a horní řady v běžných slovech."],

  ["bottom", "N a M", "nm", "words", 200, 95,
    "Pravý ukazovák dolů na N a M."],
  ["bottom", "V a B", "vb", "words", 200, 100,
    "Levý ukazovák dolů na V a B."],
  ["bottom", "C a Y", "cy", "words", 200, 105,
    "Levý prostředník dolů na C, levý malík dolů na Y."],
  ["bottom", "Čárka a tečka", ",.", "words", 210, 105,
    "Čárku píše pravý prostředník, tečku pravý prsteník. Za oběma vždy mezera."],
  ["bottom", "X, W a Q", "xwq", "words", 200, 105,
    "Vzácná písmena: X levý prsteník dole, W levý prsteník nahoře, Q levý malík nahoře."],
  ["bottom", "Opakování: celá abeceda", "", "words", 240, 115,
    "Celá abeceda bez diakritiky. Soustřeďte se na plynulý rytmus."],

  ["dia", "ě, š a č", "ěšč", "words", 200, 105,
    "Diakritika je v horní číselné řadě: ě levý prsteník, š levý prostředník, č levý ukazovák."],
  ["dia", "ř a ž", "řž", "words", 200, 110,
    "Ř píše levý ukazovák, Ž pravý ukazovák — obě klávesy jsou v číselné řadě."],
  ["dia", "ý, á, í a é", "ýáíé", "words", 220, 115,
    "ý pravý ukazovák, á pravý prostředník, í pravý prsteník, é pravý malík."],
  ["dia", "ú", "ú", "words", 200, 115,
    "Ú leží vpravo vedle P a píše ho pravý malík. Ů už znáte z domovské řady."],
  ["dia", "Mrtvá klávesa ˇ: ď, ť a ň", "ďťň", "words", 200, 105,
    "Háček se píše dvěma úhozy: nejdřív levý Shift + ´ (vpravo nahoře), potom písmeno. Na obrazovce se háček objeví až s písmenem."],
  ["dia", "Mrtvá klávesa ´: ó", "ó", "words", 180, 105,
    "Ó je vzácné: nejdřív ´ (bez Shiftu), potom O."],
  ["dia", "Opakování diakritiky", "", "words", 260, 125,
    "Všechna česká písmena v jednom cvičení."],

  ["shift", "Velká písmena", UPPER_PLAIN, "shift", 220, 115,
    "Shift mačkejte malíkem OPAČNÉ ruky, než kterou píšete písmeno. Velké J = levý Shift + J."],
  ["shift", "Velká písmena s diakritikou", UPPER_DIA, "shift", 220, 115,
    "Velká Č, Ř, Á… se píšou přes mrtvou klávesu: nejdřív ˇ nebo ´, potom Shift + písmeno."],
  ["shift", "Otazník a vykřičník", "?!", "words", 240, 120,
    "? je Shift + čárka, ! je Shift + § (vpravo od Ů)."],
  ["shift", "Dvojtečka, pomlčka a závorky", ":-()", "words", 240, 120,
    ": je Shift + tečka, - je vpravo dole, ) vpravo od ú a ( je Shift + ta samá klávesa."],
  ["shift", "Číslice", "0123456789", "numbers", 220, 110,
    "Na české klávesnici se číslice píšou se Shiftem v horní řadě. Každou číslici píše prst, který má tu klávesu i bez Shiftu."],
  ["shift", "Další znaky: + = % / \" ;", "+=%/\";", "numbers", 220, 110,
    "+ a ; jsou vlevo nahoře, = vedle é, % je Shift + =, / je Shift + ú a uvozovky Shift + ů."],

  ["text", "Souvislý text I", "", "text", 300, 135,
    "Skutečný text se vším, co umíte. Udržujte stálé tempo a po chybě se nezastavujte."],
  ["text", "Souvislý text II", "", "text", 400, 145,
    "Delší text. Hlídejte si držení těla a uvolněná ramena."],
  ["text", "Závěrečná zkouška", "", "text", 500, 160,
    "Závěr kurzu. Pro splnění potřebujete přesnost alespoň 95 %.", { acc: 95 }],
];

export const LESSONS = (() => {
  const known = new Set([" "]);
  return DEFS.map(([section, title, adds, kind, len, cpm, desc, extra], i) => {
    for (const ch of adds) known.add(ch);
    return {
      id: i + 1, section, title, adds: [...adds], kind, len, cpm, desc,
      acc: PASS_ACC, ...extra,
      known: new Set(known),
      focus: new Set(adds),
    };
  });
})();

/* ---------- pomocné ---------- */
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const isLetter = ch => ch.toLowerCase() !== ch.toUpperCase();
const isLower = ch => isLetter(ch) && ch === ch.toLowerCase();
const cap = w => w[0].toUpperCase() + w.slice(1);
const fits = (w, known) => [...w].every(c => known.has(c));

const poolCache = new Map();
function poolFor(known) {
  const key = [...known].sort().join("");
  if (!poolCache.has(key)) {
    poolCache.set(key, {
      words: WORDS.filter(w => fits(w, known)),
      names: NAMES.filter(n => fits(n, known)),
    });
  }
  return poolCache.get(key);
}

function numberToken(known, rng) {
  const r = (a, b) => a + Math.floor(rng() * (b - a + 1));
  const opts = [
    () => String(r(1, 9)), () => String(r(10, 99)), () => String(r(100, 999)),
    () => String(r(1950, 2030)),
  ];
  if (known.has(",")) opts.push(() => `${r(1, 99)},${r(1, 9)}`);
  if (known.has(":")) opts.push(() => `${r(6, 23)}:${String(r(0, 59)).padStart(2, "0")}`);
  if (known.has("%")) opts.push(() => `${r(5, 95)} %`);
  if (known.has("+") && known.has("=")) opts.push(() => { const a = r(1, 20), b = r(1, 20); return `${a}+${b}=${a + b}`; });
  if (known.has("/")) opts.push(() => `${r(1, 9)}/${r(2, 9)}`);
  return pick(opts, rng)();
}

/* Krátká „dril“ skupina písmen pro nácvik nových kláves. */
function drill(focusLetters, knownLetters, rng) {
  if (rng() < 0.15 && focusLetters.length) return pick(focusLetters, rng).repeat(3);
  const n = 2 + Math.floor(rng() * 4);
  let s = "";
  for (let i = 0; i < n; i++) {
    s += (focusLetters.length && rng() < 0.6) ? pick(focusLetters, rng) : pick(knownLetters, rng);
  }
  return s;
}

/* Rozdělí slova do vět a doplní interpunkci, kterou žák zná. */
function shapeSentences(tokens, known, focus, rng) {
  const has = ch => known.has(ch);
  const p = (ch, base, focused) => focus.has(ch) ? focused : base;
  const canCap = t => isLetter(t[0]) && has(t[0].toUpperCase());
  const out = [];
  for (let i = 0; i < tokens.length;) {
    const n = 3 + Math.floor(rng() * 5);
    const s = tokens.slice(i, i + n);
    i += n;
    if (has("A")) {
      const j = s.findIndex(canCap);
      if (j > 0) [s[0], s[j]] = [s[j], s[0]];
      if (j >= 0) s[0] = cap(s[0]);
    }
    for (let k = 1; k < s.length; k++) {
      if (has("(") && has(")") && rng() < p("(", 0.03, 0.12)) s[k] = `(${s[k]})`;
      else if (has("\"") && rng() < p("\"", 0.03, 0.15)) s[k] = `"${s[k]}"`;
    }
    for (let k = 0; k < s.length - 1; k++) {
      const r = rng();
      if (has(",") && r < p(",", 0.12, 0.3)) s[k] += ",";
      else if (has(":") && r < p(":", 0.15, 0.28)) s[k] += ":";
      else if (has(";") && r < p(";", 0.17, 0.42)) s[k] += ";";
      else if (has("-") && r < p("-", 0.2, 0.42)) s[k] += " -";
    }
    let end = ".";
    const r = rng();
    if (has("?") && r < p("?", 0.1, 0.35)) end = "?";
    else if (has("!") && r < p("!", 0.18, 0.6)) end = "!";
    out.push(s.join(" ") + end);
  }
  return out.join(" ");
}

function textsFor(known, len, rng) {
  const ok = TEXTS.filter(t => fits(t, known));
  if (!ok.length) return null;
  const order = [...ok].sort(() => rng() - 0.5);
  let out = "";
  for (let i = 0; out.length < len; i++) out += (out ? " " : "") + order[i % order.length];
  return out;
}

/* ---------- veřejné API ---------- */

/* Text cvičení. kind: keys | words | shift | numbers | text */
export function buildText({ known, focus = new Set(), kind = "words", len = 160, rng = Math.random }) {
  if (kind === "text") {
    const t = textsFor(known, len, rng);
    if (t) return t;
    kind = "words";
  }
  const { words, names } = poolFor(known);
  const knownLetters = [...known].filter(isLower);
  const focusLetters = [...focus].filter(isLower);
  const focused = focusLetters.length ? words.filter(w => focusLetters.some(c => w.includes(c))) : words;
  // velká písmena: střídáme rovnoměrně všechna nová. Slovo začínající daným
  // písmenem dostane velké první písmeno; když žádné není (Q, Ě, Ý…), napíše
  // se velkými celé slovo, které ho obsahuje (AQUAPARK, MALÝ).
  const allUpper = w => [...w.toUpperCase()].every(c => known.has(c));
  const upperFocus = kind === "shift" ? [...focus].filter(c => isLetter(c) && c === c.toUpperCase()) : [];
  const capToken = () => {
    const F = pick(upperFocus, rng), f = F.toLowerCase();
    const starts = [...words.filter(w => w[0] === f), ...names.filter(n => n[0] === F)];
    if (starts.length && rng() < 0.8) return cap(pick(starts, rng));
    const inside = words.filter(w => w.includes(f) && allUpper(w));
    if (inside.length) return pick(inside, rng).toUpperCase();
    return F + drill([], knownLetters, rng);
  };

  const tokens = [];
  let length = 0, last = "";
  while (length < len) {
    const r = rng();
    let t;
    if (kind === "numbers" && r < 0.45) t = numberToken(known, rng);
    else if (kind === "keys") t = (r < 0.65 || focused.length < 3) ? drill(focusLetters, knownLetters, rng) : pick(focused, rng);
    else if (upperFocus.length && r < 0.6) t = capToken();
    else if (focused.length >= 4 && r < 0.7) t = pick(focused, rng);
    // umělé skupiny písmen jen tam, kde je skutečných slov s novými znaky málo
    else if (words.length >= 8 && (r < 0.93 || focused.length >= 12)) t = pick(words, rng);
    else t = drill(focusLetters, knownLetters, rng);
    if (known.has("0") && kind !== "numbers" && rng() < 0.04) t = numberToken(known, rng);
    if (t === last) continue;
    tokens.push(t);
    last = t;
    length += t.length + 1;
  }
  if (known.has(".")) return shapeSentences(tokens, known, focus, rng);
  return tokens.join(" ");
}

export function lessonText(lesson, rng = Math.random) {
  return buildText({ known: lesson.known, focus: lesson.focus, kind: lesson.kind, len: lesson.len, rng });
}

/* Dlouhý souvislý text pro test rychlosti. */
export function testText(rng = Math.random) {
  return textsFor(LESSONS[LESSONS.length - 1].known, 4000, rng);
}

/* 0 = nesplněno, 1 = splněna přesnost, 2 = i rychlost, 3 = výborně */
export function starsFor(lesson, cpm, acc) {
  if (acc < lesson.acc) return 0;
  if (cpm < lesson.cpm) return 1;
  if (acc >= 98 && cpm >= lesson.cpm * 1.25) return 3;
  return 2;
}
