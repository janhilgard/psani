/* ================================================================
   ČESKÁ KLÁVESNICE (ČSN, rozložení „Czech“ ve Windows / Linuxu, ISO)
   code  = fyzická poloha klávesy (KeyboardEvent.code, pojmenovaná podle US)
   base  = znak bez Shiftu, shift = znak se Shiftem
   f     = prst: l1 malík … l4 ukazovák levé ruky, r4 ukazovák … r1 malík
           pravé ruky, t palce
   dead  = mrtvá klávesa ("both" = obě vrstvy, "base" = jen bez Shiftu)
================================================================ */

export const FINGERS = {
  l1: { name: "levý malík",        color: "#F43F5E" },
  l2: { name: "levý prsteník",     color: "#F59E0B" },
  l3: { name: "levý prostředník",  color: "#10B981" },
  l4: { name: "levý ukazovák",     color: "#3B82F6" },
  t:  { name: "palec",             color: "#94A3B8" },
  r4: { name: "pravý ukazovák",    color: "#06B6D4" },
  r3: { name: "pravý prostředník", color: "#A855F7" },
  r2: { name: "pravý prsteník",    color: "#EC4899" },
  r1: { name: "pravý malík",       color: "#84CC16" },
};
export const FINGER_ORDER = ["l1", "l2", "l3", "l4", "t", "r4", "r3", "r2", "r1"];

export const ACUTE = "´";
export const CARON = "ˇ";
const ACUTE_MAP = { á: "a", é: "e", í: "i", ó: "o", ú: "u", ý: "y",
                    Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U", Ý: "Y" };
const CARON_MAP = { č: "c", ď: "d", ě: "e", ň: "n", ř: "r", š: "s", ť: "t", ž: "z",
                    Č: "C", Ď: "D", Ě: "E", Ň: "N", Ř: "R", Š: "S", Ť: "T", Ž: "Z" };

function k(code, base, shift, f, opts = {}) {
  return { code, base, shift, f, w: 1, ...opts };
}
function letter(code, ch, f, opts = {}) {
  return k(code, ch, ch.toUpperCase(), f, opts);
}
function mod(code, label, f, w) {
  return k(code, "", "", f, { w, mod: true, label });
}

function rows(variant) {
  // česká QWERTZ má Z vpravo nahoře (kód KeyY) a Y vlevo dole (kód KeyZ)
  const top = variant === "qwerty" ? "y" : "z";
  const bottom = variant === "qwerty" ? "z" : "y";
  return [
    [ k("Backquote", ";", "°", "l1"), k("Digit1", "+", "1", "l1"),
      k("Digit2", "ě", "2", "l2"), k("Digit3", "š", "3", "l3"),
      k("Digit4", "č", "4", "l4"), k("Digit5", "ř", "5", "l4"),
      k("Digit6", "ž", "6", "r4"), k("Digit7", "ý", "7", "r4"),
      k("Digit8", "á", "8", "r3"), k("Digit9", "í", "9", "r2"),
      k("Digit0", "é", "0", "r1"), k("Minus", "=", "%", "r1"),
      k("Equal", ACUTE, CARON, "r1", { dead: "both" }),
      mod("Backspace", "⌫", "r1", 2) ],
    [ mod("Tab", "Tab", "l1", 1.5),
      letter("KeyQ", "q", "l1"), letter("KeyW", "w", "l2"), letter("KeyE", "e", "l3"),
      letter("KeyR", "r", "l4"), letter("KeyT", "t", "l4"), letter("KeyY", top, "r4"),
      letter("KeyU", "u", "r4"), letter("KeyI", "i", "r3"), letter("KeyO", "o", "r2"),
      letter("KeyP", "p", "r1"), k("BracketLeft", "ú", "/", "r1"),
      k("BracketRight", ")", "(", "r1"), mod("Enter", "Enter", "r1", 1.5) ],
    [ mod("CapsLock", "Caps", "l1", 1.75),
      letter("KeyA", "a", "l1", { home: true }), letter("KeyS", "s", "l2", { home: true }),
      letter("KeyD", "d", "l3", { home: true }), letter("KeyF", "f", "l4", { home: true, bump: true }),
      letter("KeyG", "g", "l4"), letter("KeyH", "h", "r4"),
      letter("KeyJ", "j", "r4", { home: true, bump: true }), letter("KeyK", "k", "r3", { home: true }),
      letter("KeyL", "l", "r2", { home: true }), k("Semicolon", "ů", "\"", "r1", { home: true }),
      k("Quote", "§", "!", "r1"), k("Backslash", "¨", "'", "r1", { dead: "base" }),
      mod("EnterTail", "", "r1", 1.25) ],
    [ mod("ShiftLeft", "Shift", "l1", 1.25), k("IntlBackslash", "\\", "|", "l1"),
      letter("KeyZ", bottom, "l1"), letter("KeyX", "x", "l2"), letter("KeyC", "c", "l3"),
      letter("KeyV", "v", "l4"), letter("KeyB", "b", "l4"), letter("KeyN", "n", "r4"),
      letter("KeyM", "m", "r4"), k("Comma", ",", "?", "r3"), k("Period", ".", ":", "r2"),
      k("Slash", "-", "_", "r1"), mod("ShiftRight", "Shift", "r1", 2.75) ],
    [ k("Space", " ", "", "t", { w: 6.25, label: "mezerník" }) ],
  ];
}

/* Shift se mačká malíkem opačné ruky než klávesa se znakem. */
export function shiftKeyFor(finger) {
  return finger.startsWith("l") ? "ShiftRight" : "ShiftLeft";
}

export function buildLayout(variant = "qwertz") {
  const keyRows = rows(variant);
  const byCode = new Map();
  const direct = new Map(); // znak -> { code, shift }

  for (const row of keyRows) for (const key of row) {
    byCode.set(key.code, key);
    if (key.mod) continue;
    const deadBase = key.dead === "both" || key.dead === "base";
    const deadShift = key.dead === "both";
    if (key.base && !deadBase && !direct.has(key.base)) direct.set(key.base, { code: key.code, shift: false });
    if (key.shift && !deadShift && !direct.has(key.shift)) direct.set(key.shift, { code: key.code, shift: true });
  }

  /* Posloupnost úhozů pro znak. Diakritika, která nemá vlastní klávesu
     (ď, ť, ň, ó a velká písmena s diakritikou), se píše přes mrtvou klávesu:
     nejdřív ´ nebo ˇ (Shift + ´), pak písmeno. */
  function strokesFor(ch) {
    if (direct.has(ch)) return [direct.get(ch)];
    const viaAcute = ACUTE_MAP[ch], viaCaron = CARON_MAP[ch];
    const baseCh = viaAcute || viaCaron;
    if (baseCh && direct.has(baseCh)) {
      return [{ code: "Equal", shift: !!viaCaron, dead: viaCaron ? CARON : ACUTE }, direct.get(baseCh)];
    }
    return null;
  }

  /* Počet úhozů znaku (Shift i mrtvá klávesa se počítají), podle české normy. */
  function strokeCount(ch) {
    const s = strokesFor(ch);
    return s ? s.reduce((n, st) => n + 1 + (st.shift ? 1 : 0), 0) : 1;
  }

  function fingerForChar(ch) {
    const s = strokesFor(ch);
    return s ? byCode.get(s[s.length - 1].code).f : "t";
  }

  const allChars = new Set([...direct.keys(), ...Object.keys(ACUTE_MAP), ...Object.keys(CARON_MAP)]);

  return { variant, rows: keyRows, byCode, strokesFor, strokeCount, fingerForChar, allChars };
}
