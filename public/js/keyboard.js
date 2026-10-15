/* ================================================================
   KLÁVESNICE, RUCE A GRAF — vykreslování
   Jen DOM API a CSSOM (element.style.setProperty), žádné inline styly
   v markupu, aby stačilo CSP se style-src 'self'.
================================================================ */
import { FINGERS, shiftKeyFor } from "./layout.js";

const SVG = "http://www.w3.org/2000/svg";
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};
const svg = (tag, attrs = {}) => {
  const e = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
};

/* ---------- klávesnice ---------- */
export function renderKeyboard(container, layout, { heat } = {}) {
  container.replaceChildren();
  for (const row of layout.rows) {
    const rowEl = el("div", "kb-row");
    for (const key of row) {
      const k = el("div", "key");
      k.dataset.code = key.code;
      k.dataset.f = key.f;
      k.style.setProperty("--w", key.w);
      if (key.mod) {
        k.classList.add("mod");
        k.append(el("span", "lbl", key.label));
      } else if (key.code === "Space") {
        k.classList.add("space");
        k.append(el("span", "lbl", key.label));
      } else {
        k.append(el("span", "fbar"));
        const isLetterKey = key.shift === key.base.toUpperCase() && key.shift !== key.base;
        if (isLetterKey) {
          k.append(el("span", "cap", key.shift));
        } else {
          k.append(el("span", "top", key.shift), el("span", "cap", key.base));
        }
        if (key.dead) k.classList.add("dead");
      }
      if (key.home) k.classList.add("home");
      if (key.bump) k.classList.add("bump");
      if (heat && heat.has(key.code)) {
        const h = heat.get(key.code);
        k.classList.add("heat");
        k.style.setProperty("--heat", h.rate.toFixed(3));
        k.title = `${h.label}: přesnost ${h.acc} % (${h.total} úhozů)`;
      }
      rowEl.append(k);
    }
    container.append(rowEl);
  }
}

const keyEl = (container, code) => container.querySelector(`.key[data-code="${code}"]`);

/* Zvýrazní klávesy pro další znak: aktuální úhoz výrazně, další úhoz
   (písmeno po mrtvé klávese) slaběji. Vrací prsty, které mají pracovat. */
export function highlightNext(container, layout, strokes, step) {
  container.querySelectorAll(".next, .next2").forEach(k => k.classList.remove("next", "next2"));
  const fingers = new Set();
  if (!strokes) return fingers;
  strokes.forEach((st, i) => {
    if (i < step) return;
    const cls = i === step ? "next" : "next2";
    const key = layout.byCode.get(st.code);
    keyEl(container, st.code)?.classList.add(cls);
    if (st.shift) keyEl(container, shiftKeyFor(key.f))?.classList.add(cls);
    if (i === step) {
      fingers.add(key.f);
      if (st.shift) fingers.add(key.f.startsWith("l") ? "r1" : "l1");
    }
  });
  return fingers;
}

export function flashKey(container, code, cls) {
  const k = code && keyEl(container, code);
  if (!k) return;
  k.classList.add("pressed");
  if (cls) k.classList.add(cls);
  setTimeout(() => k.classList.remove("pressed", cls), cls ? 220 : 110);
}

/* ---------- ruce ---------- */
// prsty od malíku k ukazováku: [x, výška], palec zvlášť
const FINGER_SHAPES = [[52, 62], [92, 84], [132, 94], [172, 82]];

function hand(ids, mirror) {
  const g = svg("g", mirror ? { transform: "translate(560 0) scale(-1 1)" } : {});
  g.append(svg("rect", { x: 44, y: 104, width: 172, height: 74, rx: 34, class: "palm" }));
  FINGER_SHAPES.forEach(([x, h], i) => {
    g.append(svg("rect", { x, y: 120 - h, width: 34, height: h + 10, rx: 17, class: "finger", "data-f": ids[i] }));
  });
  g.append(svg("rect", {
    x: 196, y: 128, width: 76, height: 32, rx: 16, class: "finger",
    "data-f": "t", transform: "rotate(28 196 128)",
  }));
  return g;
}

export function renderHands(container) {
  const s = svg("svg", { viewBox: "0 0 560 200", class: "hands-svg", "aria-hidden": "true" });
  s.append(hand(["l1", "l2", "l3", "l4"], false), hand(["r1", "r2", "r3", "r4"], true));
  container.replaceChildren(s);
}

export function highlightFingers(container, fingers) {
  container.querySelectorAll(".finger").forEach(f => {
    f.classList.toggle("on", fingers.has(f.dataset.f));
  });
}

/* ---------- graf ---------- */
export function lineChart(container, series, { height = 180, empty = "Zatím žádná data." } = {}) {
  container.replaceChildren();
  const n = Math.max(0, ...series.map(s => s.values.length));
  if (n < 2) { container.append(el("p", "muted", empty)); return; }
  // kreslíme v pixelech podle skutečné šířky, aby se graf nedeformoval
  const W = Math.max(280, Math.round(container.clientWidth || 640)), H = height, P = { l: 40, r: 12, t: 12, b: 22 };
  const s = svg("svg", { viewBox: `0 0 ${W} ${H}`, class: "chart-svg", role: "img" });
  s.setAttribute("aria-label", series.map(x => x.label).join(", "));
  for (const ser of series) {
    const max = Math.max(ser.max ?? 0, ...ser.values) || 1;
    const min = ser.min ?? 0;
    const x = i => P.l + (i / (n - 1)) * (W - P.l - P.r);
    const y = v => P.t + (1 - (v - min) / (max - min || 1)) * (H - P.t - P.b);
    if (ser.axis) {
      for (const v of [min, (min + max) / 2, max]) {
        s.append(svg("line", { x1: P.l, x2: W - P.r, y1: y(v), y2: y(v), class: "grid" }));
        const t = svg("text", { x: P.l - 6, y: y(v) + 4, class: "axis" });
        t.textContent = Math.round(v);
        s.append(t);
      }
    }
    const pts = ser.values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    s.append(svg("polyline", { points: pts, class: `line ${ser.cls}` }));
    const lastV = ser.values[ser.values.length - 1];
    s.append(svg("circle", { cx: x(ser.values.length - 1), cy: y(lastV), r: 4, class: `dot ${ser.cls}` }));
  }
  container.append(s);
  const legend = el("div", "legend");
  for (const ser of series) {
    const item = el("span", `lg ${ser.cls}`);
    item.append(el("i"), document.createTextNode(ser.label));
    legend.append(item);
  }
  container.append(legend);
}

export function fingerColor(f) { return FINGERS[f]?.color ?? "#94A3B8"; }
