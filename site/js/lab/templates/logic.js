// Template `logic`: a DOM-native surface for propositional logic (no canvas). Four views chosen by the state key `view`:
//   table   a truth table whose result column the learner fills cell by cell (click, or type V or F)
//   pair    two formulas side by side, line by line, with the lines where they differ marked
//   hunt    the integers 0 to 40 as tiles: pick n and see whether the claim holds, to find a counter-example
//   negate  a quantified statement on a small set: test the elements one by one and see what can be concluded
// Direct manipulation only: every change goes through setState, the shell controls (slider, choices) and the tiles share the same
// state, and the mission card holds no hint. Keyboard: all cells and tiles are buttons; in the hunt the arrow keys, Home and End move
// the selection. Targets are 44 px or more. Animations (a small pop, a wiggle on a discovery) stop under prefers-reduced-motion.
import { ROWS, V, CONNECTIVES, PAIRS, CLAIMS, N_MAX, STATEMENTS, model } from "../models/logic-truth.js";
import { sup } from "../models/primes.js";

const STYLE_ID = "lab-logic-style";
const CSS = `
.lg { padding: clamp(10px, 2.5vw, 22px); min-width: 0; touch-action: manipulation; }
.lg [hidden] { display: none !important; }
.lg-title { font: 700 1.05rem/1.3 var(--display, system-ui); margin: 0 0 .6rem; overflow-wrap: anywhere; }
.lg-table { border-collapse: collapse; margin: 0 0 .8rem; font: 1.15rem/1.2 var(--math, serif); max-width: 100%; }
.lg-table th, .lg-table td { border: 2px solid var(--line-strong, #5c6170); padding: .25rem .6rem; text-align: center; min-width: 3.2rem; }
.lg-table th { background: var(--sunken, #e4dfd3); font-weight: 700; }
.lg-fixed { font-weight: 700; }
.lg-cell { min-width: 56px; min-height: 48px; width: 100%; border: 0; border-radius: 12px; background: var(--surface, #fff); color: var(--ink, #18181b); font: 700 1.3rem var(--math, serif); box-shadow: inset 0 0 0 2px var(--accent, #2c3d8f); }
.lg-cell[data-state="V"], .lg-cell[data-state="F"] { background: var(--accent-soft, #e4e7f4); }
.lg-cell[data-right="true"] { box-shadow: inset 0 0 0 3px var(--pos, #2e6b3f); background: var(--pos-soft, #e2efe5); }
.lg-cell[data-right="false"] { box-shadow: inset 0 0 0 3px var(--neg, #a11d2b); background: var(--neg-soft, #f6e3e4); }
.lg-mark { font-size: .8rem; margin-left: .25rem; }
.lg-diff { background: var(--mark, #f0d9a8); }
.lg-bubble { position: relative; margin: .4rem 0 0 .8rem; padding: .6rem .9rem; border: 2px solid var(--ink, #18181b); border-radius: 16px; background: var(--surface, #fff); font: 1rem/1.45 var(--ui, system-ui); overflow-wrap: anywhere; min-height: 2.6em; }
.lg-bubble::before { content: ""; position: absolute; left: 18px; top: -10px; width: 16px; height: 16px; background: var(--surface, #fff); border-left: 2px solid var(--ink, #18181b); border-top: 2px solid var(--ink, #18181b); transform: rotate(45deg); }
.lg-bubble[data-tone="good"] { border-color: var(--pos, #2e6b3f); }
.lg-bubble[data-tone="found"] { border-color: var(--accent, #2c3d8f); }
.lg-tiles { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 .6rem; padding: 0; list-style: none; }
.lg-tile { min-width: 44px; min-height: 44px; padding: 0 .35rem; border-radius: 10px; border: 2px solid var(--line-strong, #5c6170); background: var(--surface, #fff); color: var(--ink, #18181b); font: 700 1rem var(--math, serif); display: grid; place-items: center; line-height: 1.1; }
.lg-tile small { font: .7rem var(--ui, system-ui); display: block; }
.lg-tile[aria-pressed="true"], .lg-tile[aria-current="true"] { border-color: var(--accent, #2c3d8f); background: var(--accent-soft, #e4e7f4); box-shadow: 0 0 0 2px var(--accent, #2c3d8f); }
.lg-tile[data-seen="ok"] { border-style: solid; }
.lg-tile[data-seen="bad"], .lg-tile[data-holds="false"][aria-pressed="true"] { border-color: var(--neg, #a11d2b); background: var(--neg-soft, #f6e3e4); }
.lg-tile[data-holds="true"][aria-pressed="true"] { border-color: var(--pos, #2e6b3f); background: var(--pos-soft, #e2efe5); }
.lg-statement { font: 1.2rem/1.4 var(--math, serif); margin: 0 0 .6rem; overflow-wrap: anywhere; }
.lg-line { margin: .2rem 0; font: .95rem/1.4 var(--ui, system-ui); overflow-wrap: anywhere; }
.lg-pop { animation: lg-pop .32s ease-out; }
.lg-wiggle { animation: lg-wiggle .5s ease-in-out; }
@keyframes lg-pop { 0% { transform: scale(.82); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
@keyframes lg-wiggle { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-6deg); } 40% { transform: rotate(5deg); } 60% { transform: rotate(-3deg); } 80% { transform: rotate(2deg); } }
/* the long option texts of the selects must not widen the page on a 320 px screen */
.lab2[data-experiment="logic-truth"] .lab2-ctl, .lab2[data-experiment="logic-truth"] .lab2-ctl select, .lab2[data-experiment="logic-truth"] .lab2-ctl input[type="range"] { min-width: 0; max-width: 100%; }
.lab2[data-experiment="logic-truth"] .lab2-ctl select { width: 100%; min-height: 44px; text-overflow: ellipsis; }
@media (prefers-reduced-motion: reduce) { .lg-pop, .lg-wiggle { animation: none; } }
@media (max-width: 420px) { .lg-table th, .lg-table td { padding: .2rem .3rem; min-width: 2.4rem; } .lg-table { font-size: 1rem; } }
`;

export function createStage(host, { onFrame, label }) {
  const wrap = document.createElement("div");
  wrap.className = "lg lab2-logic"; wrap.tabIndex = 0;
  wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", label);
  host.append(wrap);
  let frame = 0, alive = true;
  return {
    wrap, canvas: null, setHandles() {},
    reduced: () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    invalidate() { if (alive && !frame) frame = requestAnimationFrame(() => { frame = 0; if (alive) onFrame(); }); },
    destroy() { alive = false; cancelAnimationFrame(frame); wrap.remove(); },
  };
}

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };
const attr = (n, k, v) => { if (n.getAttribute(k) !== v) n.setAttribute(k, v); };
const CYCLE = { "?": "V", V: "F", F: "?" };

export function mount({ exp, stage, fmt, getState, setState }) {
  const root = stage.wrap, doc = root.ownerDocument, t = fmt.t;
  if (!doc.getElementById(STYLE_ID)) { const st = doc.createElement("style"); st.id = STYLE_ID; st.textContent = CSS; doc.head.append(st); }
  const abort = new (doc.defaultView.AbortController)();
  const on = (n, ev, fn) => n.addEventListener(ev, fn, { signal: abort.signal });
  const pop = (n, kind = "lg-pop") => { if (stage.reduced()) return; n.classList.remove("lg-pop", "lg-wiggle"); void n.offsetWidth; n.classList.add(kind); };

  // ---------------------------------------------------------------- table view
  const table = el("section"), tTitle = el("h3", "lg-title"), tTable = el("table", "lg-table"), tBubble = el("p", "lg-bubble"), tRule = el("p", "lg-line");
  tBubble.setAttribute("role", "status"); tBubble.setAttribute("aria-live", "polite");
  const tHead = el("thead"), tBody = el("tbody");
  const tHr = el("tr"); const thP = el("th", "", "P"), thQ = el("th", "", "Q"), thR = el("th");
  tHr.append(thP, thQ, thR); tHead.append(tHr);
  const cellBtns = ROWS.map(([p, q], i) => {
    const tr = el("tr"), b = el("button", "lg-cell"), mark = el("span", "lg-mark");
    b.type = "button"; b.dataset.i = String(i); b.setAttribute("aria-label", "");
    const td = el("td"); td.append(b, mark);
    tr.append(el("td", "lg-fixed", V(p)), el("td", "lg-fixed", V(q)), td); tBody.append(tr);
    on(b, "click", () => cycle(i, null));
    on(b, "keydown", (e) => {
      const k = e.key.toLowerCase();
      if (k === "v" || k === "f") { e.preventDefault(); cycle(i, k.toUpperCase()); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); cellBtns[(i + (e.key === "ArrowDown" ? 1 : 3)) % 4].b.focus(); }
    });
    return { b, mark, tr };
  });
  tTable.append(tHead, tBody);
  table.append(tTitle, tTable, tBubble, tRule);
  function cycle(i, value) {
    const s = getState(), cells = [...s.cells];
    cells[i] = value ?? CYCLE[cells[i]] ?? "V";
    setState({ cells: cells.join("") });
    pop(cellBtns[i].b);
  }

  // ---------------------------------------------------------------- pair view
  const pair = el("section"), pTitle = el("h3", "lg-title"), pTable = el("table", "lg-table"), pBubble = el("p", "lg-bubble");
  pBubble.setAttribute("role", "status"); pBubble.setAttribute("aria-live", "polite");
  const pHr = el("tr"), pL = el("th"), pR = el("th"), pS = el("th", "", "="); pHr.append(el("th", "", "P"), el("th", "", "Q"), pL, pR, pS);
  const pHead = el("thead"); pHead.append(pHr);
  const pBody = el("tbody");
  const pRows = ROWS.map(([p, q]) => {
    const tr = el("tr"), l = el("td"), r = el("td"), s = el("td");
    tr.append(el("td", "lg-fixed", V(p)), el("td", "lg-fixed", V(q)), l, r, s); pBody.append(tr); return { tr, l, r, s };
  });
  pTable.append(pHead, pBody); pair.append(pTitle, pTable, pBubble);

  // ---------------------------------------------------------------- hunt view
  const hunt = el("section"), hStatement = el("p", "lg-statement"), hTiles = el("ul", "lg-tiles"), hBubble = el("p", "lg-bubble"), hLine = el("p", "lg-line");
  hBubble.setAttribute("role", "status"); hBubble.setAttribute("aria-live", "polite");
  hTiles.setAttribute("role", "group");
  const tiles = Array.from({ length: N_MAX + 1 }, (_, n) => {
    const li = el("li"), b = el("button", "lg-tile", String(n)); b.type = "button"; b.dataset.n = String(n);
    on(b, "click", () => { setState({ n }); pop(b); });
    on(b, "keydown", (e) => {
      const s = getState(); let to = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") to = Math.min(N_MAX, s.n + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = Math.max(0, s.n - 1);
      else if (e.key === "Home") to = 0; else if (e.key === "End") to = N_MAX;
      if (to !== null) { e.preventDefault(); setState({ n: to }); tiles[to].b.focus(); }
    });
    li.append(b); hTiles.append(li); return { b, li };
  });
  hunt.append(hStatement, hTiles, hBubble, hLine);
  let visited = new Set(), visitedClaim = "";

  // ---------------------------------------------------------------- negate view
  const neg = el("section"), nStatement = el("p", "lg-statement"), nNeg = el("p", "lg-line"), nTiles = el("ul", "lg-tiles"), nBubble = el("p", "lg-bubble");
  nBubble.setAttribute("role", "status"); nBubble.setAttribute("aria-live", "polite");
  const nBtns = Array.from({ length: 8 }, (_, i) => {
    const li = el("li"), b = el("button", "lg-tile"), sm = el("small"), num = el("span");
    b.type = "button"; b.append(num, sm); b.dataset.i = String(i);
    on(b, "click", () => { const s = getState(); setState({ checked: s.checked ^ (1 << i) }); pop(b); });
    li.append(b); nTiles.append(li); return { li, b, num, sm };
  });
  neg.append(nStatement, nTiles, nBubble, nNeg);

  root.append(table, pair, hunt, neg);
  const views = { table, pair, hunt, negate: neg };

  let previous = "";
  const bubble = (node, text, tone = "") => { write(node, text); attr(node, "data-tone", tone); };

  function drawTable(s, m) {
    const c = CONNECTIVES[s.target], tb = m.table;
    write(tTitle, t([`Table de vérité de ${c.label} (${c.name[0]})`, `Truth table of ${c.label} (${c.name[1]})`]));
    write(thR, c.label);
    cellBtns.forEach(({ b, mark }, i) => {
      const ch = s.cells[i] || "?", p = V(ROWS[i][0]), q = V(ROWS[i][1]);
      write(b, ch === "?" ? "?" : ch);
      attr(b, "data-state", ch);
      attr(b, "data-right", tb.right[i] === null ? "" : String(tb.right[i]));
      attr(b, "aria-label", t([`Ligne ${i + 1} : P ${p}, Q ${q}. Résultat de ${c.label} : ${ch === "?" ? "à choisir" : ch}. Appuie pour changer, ou tape V ou F.`,
        `Row ${i + 1}: P ${p}, Q ${q}. Result of ${c.label}: ${ch === "?" ? "to choose" : ch}. Press to change, or type V or F.`]));
      write(mark, tb.right[i] === null ? "" : tb.right[i] ? "✓" : "✗");
    });
    const left = s.cells.split("").filter((x) => x === "?").length;
    if (tb.allCorrect) {
      bubble(tBubble, t(["La colonne est juste.", "The column is right."]), "good");
      write(tRule, t([RULES[s.target][0], RULES[s.target][1]]));
    } else {
      write(tRule, "");
      if (tb.complete) bubble(tBubble, t([`${tb.wrong} case${tb.wrong > 1 ? "s" : ""} à corriger : relis la définition du connecteur.`, `${tb.wrong} cell${tb.wrong > 1 ? "s" : ""} to fix: reread the definition of the connective.`]));
      else bubble(tBubble, t([`Il reste ${left} case${left > 1 ? "s" : ""} à remplir. Clique sur une case pour choisir V ou F.`, `${left} cell${left > 1 ? "s" : ""} left to fill. Click a cell to choose V or F.`]));
    }
  }

  function drawPair(s, m) {
    const pm = m.pair, def = PAIRS[s.pair];
    write(pTitle, t([`Compare deux formules : ${pm.leftLabel} et ${pm.rightLabel}`, `Compare two formulas: ${pm.leftLabel} and ${pm.rightLabel}`]));
    write(pL, pm.leftLabel); write(pR, pm.rightLabel);
    pRows.forEach((r, i) => {
      write(r.l, V(pm.left[i])); write(r.r, V(pm.right[i])); write(r.s, pm.differing[i] ? "≠" : "=");
      attr(r.tr, "class", pm.differing[i] ? "lg-diff" : "");
      attr(r.s, "aria-label", pm.differing[i] ? t(["valeurs différentes", "different values"]) : t(["mêmes valeurs", "same values"]));
    });
    if (pm.equivalent) bubble(pBubble, t([`Les quatre lignes sont égales : ${pm.leftLabel} ≡ ${pm.rightLabel} (${def.name[0]}). On peut remplacer l’une par l’autre.`, `All four rows agree: ${pm.leftLabel} ≡ ${pm.rightLabel} (${def.name[1]}). One can replace the other.`]), "good");
    else bubble(pBubble, t([`Les colonnes diffèrent sur ${pm.diff} lignes : ces deux formules ne sont pas équivalentes.`, `The columns differ on ${pm.diff} rows: these two formulas are not equivalent.`]), "found");
  }

  function drawHunt(s, m) {
    const h = m.hunt, c = CLAIMS[s.claim];
    if (visitedClaim !== s.claim) { visited = new Set(); visitedClaim = s.claim; }
    visited.add(s.n);
    write(hStatement, t(c.text));
    hTiles.setAttribute("aria-label", t(["Les entiers de 0 à 40. Flèches pour changer d’entier.", "The integers from 0 to 40. Arrow keys change the integer."]));
    tiles.forEach(({ b }, n) => {
      const sel = n === s.n;
      attr(b, "aria-pressed", String(sel)); attr(b, "tabindex", sel ? "0" : "-1");
      attr(b, "data-seen", visited.has(n) ? (h.flags[n] ? "ok" : "bad") : "");
      attr(b, "aria-label", t([`n = ${n}${visited.has(n) ? (h.flags[n] ? ", la proposition est vraie" : ", contre-exemple") : ""}`, `n = ${n}${visited.has(n) ? (h.flags[n] ? ", the claim holds" : ", counter-example") : ""}`]));
    });
    const val = c.value(s.n);
    if (s.claim === "prime") bubble(hBubble, h.holds ? t([`n = ${s.n} : ${s.n}² + ${s.n} + 17 = ${val}, premier. Un exemple de plus qui ne prouve rien.`, `n = ${s.n}: ${s.n}² + ${s.n} + 17 = ${val}, prime. One more example that proves nothing.`]) : t([`n = ${s.n} : ${s.n}² + ${s.n} + 17 = ${val} = ${factorText(val)} n’est pas premier. Un contre-exemple : la proposition « pour tout n » est fausse.`, `n = ${s.n}: ${s.n}² + ${s.n} + 17 = ${val} = ${factorText(val)} is not prime. A counter-example: the “for all n” claim is false.`]), h.holds ? "" : "found");
    else if (s.claim === "pow") bubble(hBubble, h.holds ? t([`n = ${s.n} : ${fmtBig(2 ** s.n)} > ${fmtBig(s.n * s.n)}, la proposition tient.`, `n = ${s.n}: ${fmtBig(2 ** s.n)} > ${fmtBig(s.n * s.n)}, the claim holds.`]) : t([`n = ${s.n} : ${fmtBig(2 ** s.n)} n’est pas supérieur à ${fmtBig(s.n * s.n)} : contre-exemple.`, `n = ${s.n}: ${fmtBig(2 ** s.n)} is not greater than ${fmtBig(s.n * s.n)}: counter-example.`]), h.holds ? "" : "found");
    else bubble(hBubble, t([`n = ${s.n} : ${s.n * s.n} ≥ ${s.n}, la proposition tient.`, `n = ${s.n}: ${s.n * s.n} ≥ ${s.n}, the claim holds.`]));
    write(hLine, t([`Entiers essayés : ${visited.size} sur ${N_MAX + 1}. ${visited.size === N_MAX + 1 && !h.list.length ? "Tous vérifient la proposition ; pour une proposition « pour tout » sur tous les entiers, une vérification finie ne démontre rien." : ""}`,
      `Integers tried: ${visited.size} of ${N_MAX + 1}. ${visited.size === N_MAX + 1 && !h.list.length ? "All satisfy the claim; for a “for all” claim over all integers, a finite check proves nothing." : ""}`]));
    if (!h.holds) pop(tiles[s.n].b, "lg-wiggle");
  }

  function drawNegate(s, m) {
    const nm = m.negate, st = STATEMENTS[s.stmt];
    write(nStatement, t([st.text, st.textEn]) + " (E = " + st.set.join(" ; ") + ")");
    write(nNeg, t([`Négation : ${nm.negation}.`, `Negation: ${nm.quant === "all" ? "∃x ∈ E, x does not satisfy P" : "∀x ∈ E, x does not satisfy P"}.`]));
    nBtns.forEach(({ b, num, sm }, i) => {
      const mk = nm.marks[i];
      write(num, String(mk.x));
      write(sm, mk.checked ? (mk.holds ? t(["P vraie", "P true"]) : t(["P fausse", "P false"])) : "");
      attr(b, "aria-pressed", String(mk.checked));
      attr(b, "data-holds", String(mk.holds));
      attr(b, "aria-label", t([`${mk.x}${mk.checked ? (mk.holds ? ", testé : P vraie" : ", testé : P fausse") : ", pas encore testé"}`, `${mk.x}${mk.checked ? (mk.holds ? ", tested: P true" : ", tested: P false") : ", not tested yet"}`]));
    });
    let text, tone = "";
    if (nm.verdict === "open") text = t([`${nm.count} nombre${nm.count > 1 ? "s" : ""} testé${nm.count > 1 ? "s" : ""} sur ${nm.n} : on ne peut pas encore conclure. Clique sur d’autres nombres.`, `${nm.count} of ${nm.n} numbers tested: no conclusion yet. Click more numbers.`]);
    else if (nm.quant === "all" && nm.verdict === "false") { tone = "found"; text = t([`${nm.witness.x} ne vérifie pas P : un seul contre-exemple suffit, « pour tout » est fausse et sa négation « il existe un x qui ne vérifie pas P » est vraie.`, `${nm.witness.x} does not satisfy P: a single counter-example is enough, “for all” is false and its negation “there is an x that does not satisfy P” is true.`]); }
    else if (nm.quant === "all") { tone = "good"; text = t(["Tous les nombres ont été testés et vérifient P : « pour tout » est vraie.", "Every number was tested and satisfies P: “for all” is true."]); }
    else if (nm.verdict === "true") { tone = "found"; text = t([`${nm.witness.x} vérifie P : un seul exemple suffit, « il existe » est vraie.`, `${nm.witness.x} satisfies P: a single example is enough, “there exists” is true.`]); }
    else { tone = "good"; text = t(["Tous les nombres ont été testés et aucun ne vérifie P : « il existe » est fausse, sa négation « pour tout x, non P » est vraie.", "Every number was tested and none satisfies P: “there exists” is false, its negation “for all x, not P” is true."]); }
    bubble(nBubble, text, tone);
  }

  return {
    handles: [],
    draw() {
      const s = getState(), key = JSON.stringify(s);
      if (key === previous) return;
      previous = key;
      for (const [id, node] of Object.entries(views)) node.hidden = id !== s.view;
      const m = model(s);
      if (s.view === "table") drawTable(s, m);
      else if (s.view === "pair") drawPair(s, m);
      else if (s.view === "hunt") drawHunt(s, m);
      else drawNegate(s, m);
    },
    destroy() { abort.abort(); },
  };
}

const RULES = {
  and: ["P ∧ Q n’est vraie que si P et Q sont vraies toutes les deux.", "P ∧ Q is true only when both P and Q are true."],
  or: ["P ∨ Q est vraie dès qu’une des deux est vraie (ou les deux : « ou » inclusif).", "P ∨ Q is true as soon as one of them is true (or both: inclusive “or”)."],
  xor: ["P ⊕ Q est vraie si l’une est vraie et l’autre fausse, mais pas les deux.", "P ⊕ Q is true when one is true and the other false, not both."],
  imp: ["P ⇒ Q n’est fausse que dans un seul cas : P vraie et Q fausse.", "P ⇒ Q is false in only one case: P true and Q false."],
  iff: ["P ⇔ Q est vraie quand P et Q ont la même valeur.", "P ⇔ Q is true when P and Q have the same value."],
};
const fmtBig = (n) => String(n);
function factorText(n) {
  const out = []; let m = n;
  for (let d = 2; d * d <= m; d++) { let k = 0; while (m % d === 0) { m /= d; k++; } if (k) out.push(k > 1 ? `${d}${sup(k)}` : String(d)); }
  if (m > 1) out.push(String(m));
  return out.join(" × ");
}
