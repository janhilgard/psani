/* ================================================================
   POKROK A NASTAVENÍ (localStorage)
   Data z localStorage i z importované zálohy jsou nedůvěryhodná: sanitize()
   z nich převezme jen známá pole se správnými typy a rozsahy. Klíče se
   procházejí podle seznamu povolených hodnot, nikdy podle vstupu.
================================================================ */

const KEY = "psani10_v4";
const HISTORY_MAX = 1000;

export const SETTING_VALUES = {
  theme: ["dark", "light"],
  mode: ["strict", "free"],
  size: ["m", "s", "l"],
  kb: ["auto", "full", "hands", "hidden"],
  layout: ["qwertz", "qwerty"],
  sound: [false, true],
  freeChoice: [false, true],
  goal: [10, 5, 15, 20, 30],
};
const KINDS = ["lesson", "adaptive", "test"];

export function fresh() {
  const settings = {};
  for (const [k, v] of Object.entries(SETTING_VALUES)) settings[k] = v[0];
  return { version: 4, settings, lessons: {}, keys: {}, history: [], introSeen: false };
}

const isObj = v => v !== null && typeof v === "object" && !Array.isArray(v);
const num = (v, min, max, d = 0) =>
  (typeof v === "number" && Number.isFinite(v)) ? Math.min(max, Math.max(min, v)) : d;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

export function sanitize(raw, { lessonIds, chars }) {
  const s = fresh();
  if (!isObj(raw)) return s;

  if (isObj(raw.settings)) {
    for (const [k, allowed] of Object.entries(SETTING_VALUES)) {
      if (own(raw.settings, k) && allowed.includes(raw.settings[k])) s.settings[k] = raw.settings[k];
    }
  }
  if (isObj(raw.lessons)) {
    for (const id of lessonIds) {
      const l = own(raw.lessons, id) ? raw.lessons[id] : null;
      if (!isObj(l)) continue;
      const tasks = Array.isArray(l.tasks) ? l.tasks.slice(0, 12).map(t => isObj(t) ? {
        cpm: num(t.cpm, 0, 2000), acc: num(t.acc, 0, 100), stars: Math.round(num(t.stars, 0, 3)),
      } : null) : [];
      if (!isObj(l.best) && !tasks.some(Boolean)) continue;
      s.lessons[id] = {
        tasks,
        best: !isObj(l.best) ? null : {
          cpm: num(l.best.cpm, 0, 2000), acc: num(l.best.acc, 0, 100),
          stars: Math.round(num(l.best.stars, 0, 3)), ts: num(l.best.ts, 0, 1e14),
        },
        tries: Math.round(num(l.tries, 0, 1e6)),
      };
    }
  }
  if (isObj(raw.keys)) {
    for (const ch of chars) {
      const k = own(raw.keys, ch) ? raw.keys[ch] : null;
      if (!isObj(k)) continue;
      s.keys[ch] = {
        n: Math.round(num(k.n, 0, 1e9)), err: Math.round(num(k.err, 0, 1e9)),
        t: num(k.t, 0, 1e12), nt: Math.round(num(k.nt, 0, 1e9)),
      };
    }
  }
  if (Array.isArray(raw.history)) {
    s.history = raw.history.slice(-HISTORY_MAX).filter(isObj)
      .filter(h => KINDS.includes(h.kind))
      .map(h => ({
        ts: num(h.ts, 0, 1e14), kind: h.kind, id: Math.round(num(h.id, 0, 1000)),
        cpm: num(h.cpm, 0, 2000), acc: num(h.acc, 0, 100), sec: num(h.sec, 0, 86400),
        err: Math.round(num(h.err, 0, 1e6)),
      }));
  }
  s.introSeen = raw.introSeen === true;
  return s;
}

export function load(ctx) {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return sanitize(JSON.parse(raw), ctx);
  } catch (e) { /* poškozená nebo nedostupná data → začínáme znovu */ }
  return fresh();
}

export function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* plné nebo zakázané úložiště */ }
}

/* ---------- statistiky kláves ---------- */
export function keyStat(state, ch) {
  if (!own(state.keys, ch)) state.keys[ch] = { n: 0, err: 0, t: 0, nt: 0 };
  return state.keys[ch];
}

/* Slabé znaky: nízká přesnost a dlouhá prodleva před úhozem. */
export function weakChars(state, allowed, count = 4) {
  const scored = [];
  for (const ch of allowed) {
    if (!own(state.keys, ch)) continue;
    const k = state.keys[ch];
    if (k.n + k.err < 8) continue;
    const acc = k.n / (k.n + k.err);
    const lat = k.nt ? k.t / k.nt / 1000 : null;
    scored.push({ ch, acc, lat, score: (1 - acc) * 4 + (lat ?? 0.5) });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, count);
}

/* ---------- denní cíl a série ---------- */
const dayKey = ts => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export function minutesToday(state) {
  const today = dayKey(Date.now());
  return state.history.filter(h => dayKey(h.ts) === today).reduce((a, h) => a + h.sec, 0) / 60;
}

export function streak(state) {
  const days = new Set(state.history.map(h => dayKey(h.ts)));
  const d = new Date();
  if (!days.has(dayKey(d.getTime()))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d.getTime()))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
