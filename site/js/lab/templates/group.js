// Template `group`: three ways to see a group acting, chosen by the experiment's `groupView`:
//   cards     n numbered cards in a row (Sₙ). Applying a shuffle σ sends the card at position i to position σ(i): the cards glide
//             along arcs, the arrows of σ are drawn above them, coloured cycle by cycle. Two cards clicked in turn are swapped.
//   polygon   a regular polygon with numbered, coloured corners and a flag that shows its side (Dₙ). The rotation r turns it,
//             the reflection τ flips it over the fixed vertical axis, in 3D; the 2n elements of the group are listed under it.
//   cube      a Rubik's cube in 3D. Each move turns one layer by a quarter turn, animated; a long sequence plays quickly. Drag
//             the background (or use the arrow keys) to turn the view; the view is never part of the state.
// Every change goes through setState; the shell's buttons and the cards share the same state. Under reduced motion nothing
// glides: the figure jumps to the new state. Readouts are written under the figure (a custom stage hides the shell's own).
import * as G from "../models/groups.js";

const STYLE_ID = "lab-group-style";
const CSS = `
.grp { position: relative; padding: 10px; min-width: 0; touch-action: manipulation; }
.grp-canvas { position: relative; width: 100%; }
.grp-canvas canvas { display: block; width: 100%; height: 100%; }
.grp-cards { position: absolute; inset: 0; pointer-events: none; }
.grp-card { position: absolute; left: 0; top: 0; display: grid; place-items: center; border: 2px solid var(--ink, #222); border-radius: 10px; font: 700 1.35rem/1 var(--math, serif); color: #fff; cursor: pointer; pointer-events: auto; box-shadow: 0 3px 0 rgba(0,0,0,.35); will-change: transform; padding: 0; }
.grp-card:focus-visible { outline: 3px solid var(--focus, #5b8def); outline-offset: 3px; }
.grp-card[aria-pressed="true"] { box-shadow: 0 0 0 4px var(--object-ink, #d9b25f); }
.grp-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr)); gap: 8px 18px; margin: 10px 0 0; padding: 10px 12px; border-top: 1px solid var(--line, #444); font: .95rem/1.35 var(--ui, system-ui); }
.grp-info div { min-width: 0; }
.grp-info dt { font-size: .76rem; letter-spacing: .04em; text-transform: uppercase; color: var(--muted, #999); }
.grp-info dd { margin: 2px 0 0; font: 600 1.05rem/1.3 var(--math, serif); overflow-wrap: anywhere; }
.grp-note { margin: 8px 12px 0; font: .9rem/1.4 var(--ui, system-ui); color: var(--muted, #999); }
.grp-note[data-tone="win"] { color: var(--object-ink, #d9b25f); font-weight: 700; }
`;

const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
const css = (node, name, fallback) => getComputedStyle(node).getPropertyValue(name).trim() || fallback;
const ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

export function createStage(host, { onFrame, label }) {
  const wrap = el("div", "grp lab2-group");
  wrap.tabIndex = 0; wrap.setAttribute("role", "group"); wrap.setAttribute("aria-label", label);
  host.append(wrap);
  let frame = 0, alive = true;
  return {
    wrap, canvas: null, setHandles() {},
    reduced: () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    invalidate() { if (alive && !frame) frame = requestAnimationFrame(() => { frame = 0; if (alive) onFrame(); }); },
    destroy() { alive = false; cancelAnimationFrame(frame); wrap.remove(); },
  };
}

export function mount(env) {
  const { exp, stage } = env, doc = stage.wrap.ownerDocument;
  if (!doc.getElementById(STYLE_ID)) { const st = doc.createElement("style"); st.id = STYLE_ID; st.textContent = CSS; doc.head.append(st); }
  const box = el("div", "grp-canvas"), cv = el("canvas"), info = el("dl", "grp-info"), note = el("p", "grp-note");
  note.setAttribute("role", "status"); note.setAttribute("aria-live", "polite");
  box.append(cv); stage.wrap.append(box, info, note);
  const view = { cards: cardsView, polygon: polygonView, cube: cubeView }[exp.groupView](env, { box, cv, info, note });
  const ro = new ResizeObserver(() => view.resize?.()); ro.observe(box);
  return { handles: [], draw: () => view.draw(), destroy() { ro.disconnect(); view.destroy?.(); } };
}

// A canvas sized to its box, with a loop that runs only while something moves.
function surface(box, cv, height, paint) {
  let W = 1, H = 1, raf = 0, alive = true;
  const g = cv.getContext("2d");
  const size = () => {
    const d = Math.min(2, devicePixelRatio || 1); W = Math.max(1, box.clientWidth); H = height(W);
    box.style.height = H + "px"; cv.width = Math.round(W * d); cv.height = Math.round(H * d); g.setTransform(d, 0, 0, d, 0, 0);
  };
  const tick = (now) => { raf = 0; if (!alive) return; if (paint(g, W, H, now)) raf = requestAnimationFrame(tick); };
  size();
  return {
    get W() { return W; }, get H() { return H; },
    resize() { size(); this.kick(); },
    kick() { if (!raf && alive) raf = requestAnimationFrame(tick); },
    stop() { alive = false; cancelAnimationFrame(raf); },
  };
}
function info(dl, rows) {
  const html = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  if (dl._html !== html) { dl._html = html; dl.innerHTML = html; }
}
const say = (node, text, tone = "") => { if (node.textContent !== text) node.textContent = text; node.dataset.tone = tone; };

// ---------------------------------------------------------------- cards (Sₙ)
function cardsView({ exp, stage, fmt, getState, setState }, { box, cv, info: dl, note }) {
  const t = fmt.t, layer = el("div", "grp-cards"); box.append(layer);
  let buttons = [], shown = null, from = null, start = 0, dur = 0, pick = -1, n = 0;
  const palette = () => [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css(stage.wrap, `--c${i}`, "#888"));
  const geom = (W, H) => { const s = Math.min(78, (W - 24) / n - 12), gap = (W - n * s) / (n + 1); return { s, x: (i) => gap + i * (s + gap), y: H * 0.56 }; };
  const surf = surface(box, cv, (W) => Math.max(220, Math.min(320, W * 0.42)), paint);
  function build(count) {
    n = count; layer.replaceChildren(); pick = -1;
    const cols = palette();
    buttons = Array.from({ length: n }, (_, c) => {
      const b = el("button", "grp-card", String(c + 1));
      b.type = "button"; b.style.background = cols[c % 8]; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => choose(c));
      layer.append(b); return b;
    });
  }
  function choose(card) {
    const s = getState(), cards = s.cards.split(",").map(Number), at = cards.indexOf(card);
    if (pick < 0) { pick = at; paintPick(); return; }
    if (pick === at) { pick = -1; paintPick(); return; }
    const next = cards.slice(); [next[pick], next[at]] = [next[at], next[pick]];
    pick = -1; paintPick();
    setState({ cards: next.join(","), swaps: s.swaps + 1 });
  }
  function paintPick() { const cards = getState().cards.split(",").map(Number); buttons.forEach((b, c) => b.setAttribute("aria-pressed", String(cards.indexOf(c) === pick))); }
  function paint(g, W, H, now) {
    const s = getState(), sigma = G.fromCycles(s.sigma, s.n), { s: size, x, y } = geom(W, H);
    g.clearRect(0, 0, W, H);
    const ink = css(stage.wrap, "--ink", "#ddd"), muted = css(stage.wrap, "--muted", "#999"), cols = palette();
    // the arrows of σ above the row: from position i to position σ(i), one colour per cycle
    G.cycles(sigma).forEach((cyc, ci) => cyc.forEach((i) => {
      const j = sigma[i], a = x(i) + size / 2, b = x(j) + size / 2, top = y - size / 2 - 10, lift = 22 + Math.abs(j - i) * 10;
      g.strokeStyle = cols[(ci * 3 + 2) % 8]; g.fillStyle = g.strokeStyle; g.lineWidth = 2.2; g.globalAlpha = 0.9;
      g.beginPath(); g.moveTo(a, top); g.quadraticCurveTo((a + b) / 2, top - lift * 1.4, b, top); g.stroke();
      const ang = Math.atan2(top - (top - lift * 1.4), b - (a + b) / 2);
      g.beginPath(); g.moveTo(b, top); g.lineTo(b - 10 * Math.cos(ang - 0.4), top - 10 * Math.sin(ang - 0.4)); g.lineTo(b - 10 * Math.cos(ang + 0.4), top - 10 * Math.sin(ang + 0.4)); g.closePath(); g.fill();
    }));
    g.globalAlpha = 1;
    g.fillStyle = muted; g.font = "600 13px system-ui"; g.textAlign = "center";
    g.fillText(t(["σ envoie la carte de chaque position au bout de sa flèche", "σ sends the card at each position to the end of its arrow"]), W / 2, 18);
    for (let i = 0; i < n; i++) { g.strokeStyle = muted; g.setLineDash([4, 4]); g.lineWidth = 1; g.strokeRect(x(i) - 3, y - size / 2 - 3, size + 6, size + 6); g.setLineDash([]); g.fillStyle = muted; g.fillText(`${t(["position", "position"])} ${i + 1}`, x(i) + size / 2, y + size / 2 + 22); }
    // the cards, gliding from their old places along an arc
    const target = s.cards.split(",").map(Number), u = dur ? Math.min(1, (now - start) / dur) : 1, e = ease(u);
    target.forEach((card, pos) => {
      const b = buttons[card]; if (!b) return;
      const p0 = from ? from.indexOf(card) : pos, x0 = x(p0), x1 = x(pos), lift = p0 === pos ? 0 : Math.sin(Math.PI * e) * (28 + 6 * Math.abs(pos - p0));
      const px = x0 + (x1 - x0) * e, py = y - size / 2 - lift;
      b.style.width = b.style.height = size + "px";
      b.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
    });
    void ink;
    if (u >= 1) { from = null; dur = 0; return false; }
    return true;
  }
  return {
    resize: () => surf.resize(),
    draw() {
      const s = getState();
      if (s.n !== n) { build(s.n); shown = null; }
      if (shown !== s.cards) {
        if (shown && !stage.reduced() && shown.split(",").length === s.n) { from = shown.split(",").map(Number); start = performance.now(); dur = 650; }
        shown = s.cards; pick = -1; paintPick();
      }
      surf.kick();
      const sigma = G.fromCycles(s.sigma, s.n), cards = s.cards.split(",").map(Number);
      // the arrangement as a permutation: the card at position i is cards[i]; the map "position of card c" is its inverse
      const arr = G.inverse(cards), back = cards.every((c, i) => c === i);
      info(dl, [
        [t(["Mélange σ", "Shuffle σ"]), G.cycleText(sigma)],
        [t(["Ordre de σ", "Order of σ"]), `${G.order(sigma)}${G.cycles(sigma).length > 1 ? ` = ppcm(${G.cycles(sigma).map((c) => c.length).join(", ")})`.replace("ppcm", t(["ppcm", "lcm"])) : ""}`],
        [t(["σ appliqué", "σ applied"]), `${s.k} ${t(s.k > 1 ? ["fois", "times"] : ["fois", "time"])}`],
        [t(["Ordre des cartes", "Order of the cards"]), cards.map((c) => c + 1).join(" ")],
        [t(["Comme permutation", "As a permutation"]), G.cycleText(arr)],
        [t(["Échanges pour tout remettre", "Swaps to put it back"]), `${G.minSwaps(arr)} · ${G.sign(arr) > 0 ? t(["paire", "even"]) : t(["impaire", "odd"])}`],
      ]);
      say(note, back && s.k > 0 ? t([`Retour à l’ordre de départ après ${s.k} application${s.k > 1 ? "s" : ""} de σ.`, `Back to the starting order after applying σ ${s.k} time${s.k > 1 ? "s" : ""}.`]) : t(["Cliquez deux cartes l’une après l’autre pour les échanger.", "Click two cards one after the other to swap them."]), back && s.k > 0 ? "win" : "");
    },
    destroy: () => surf.stop(),
  };
}

// ---------------------------------------------------------------- polygon (Dₙ)
function polygonView({ stage, fmt, getState }, { box, cv, info: dl, note }) {
  const t = fmt.t;
  let shown = null, anim = null;
  const parse = (s) => { const [k, sg] = s.g.split(",").map(Number); return { k, s: sg }; };
  const surf = surface(box, cv, (W) => Math.max(260, Math.min(400, W * 0.62)), paint);
  // the figure for the element g, partway through a move: rotation by `turn` (radians), flip with horizontal scale `sx`
  function paint(g, W, H, now) {
    const s = getState(), n = s.n, cur = parse(s), cx = W * 0.36, cy = H / 2, R = Math.min(W * 0.28, H * 0.38);
    const ink = css(stage.wrap, "--ink", "#ddd"), muted = css(stage.wrap, "--muted", "#999"), line = css(stage.wrap, "--line", "#555"), obj = css(stage.wrap, "--object-ink", "#d9b25f");
    const cols = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => css(stage.wrap, `--c${i}`, "#888"));
    let base = cur, turn = 0, sx = 1, u = 1;
    if (anim) {
      u = Math.min(1, (now - anim.start) / anim.dur); const e = ease(u);
      base = anim.from;
      if (anim.move === "t") sx = Math.cos(Math.PI * e); else turn = (anim.move === "r" ? 1 : -1) * e * 2 * Math.PI / n;
    }
    g.clearRect(0, 0, W, H);
    // the fixed axis of τ and the outline of the starting position
    g.strokeStyle = line; g.setLineDash([6, 6]); g.lineWidth = 1.2; g.beginPath(); g.moveTo(cx, cy - R * 1.32); g.lineTo(cx, cy + R * 1.32); g.stroke(); g.setLineDash([]);
    g.fillStyle = muted; g.font = "600 12px system-ui"; g.textAlign = "center"; g.fillText(t(["axe de τ", "axis of τ"]), cx, cy - R * 1.36);
    const corner = (i) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [Math.cos(a), Math.sin(a)]; };
    g.strokeStyle = line; g.beginPath(); for (let i = 0; i <= n; i++) { const [a, b] = corner(i % n); i ? g.lineTo(cx + R * a, cy + R * b) : g.moveTo(cx + R * a, cy + R * b); } g.stroke();
    // where vertex i of the shape is: its place under `base`, then the partial move (turn about the centre, or flip)
    const perm = G.dPerm(n, base);
    const place = (i) => { const [a, b] = corner(perm[i]), c = Math.cos(turn), sn = Math.sin(turn); const x = a * c - b * sn, y = a * sn + b * c; return [cx + R * x * sx, cy + R * y]; };
    const flipped = (base.s ? -1 : 1) * Math.sign(sx || 1) < 0;
    g.fillStyle = flipped ? css(stage.wrap, "--sunken", "#2a2f3d") : css(stage.wrap, "--surface", "#1b2336"); g.strokeStyle = ink; g.lineWidth = 2.5;
    g.beginPath(); for (let i = 0; i <= n; i++) { const [x, y] = place(i % n); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.fill(); g.stroke();
    // the flag: a small asymmetric mark inside, from the centre towards corner 1 then bent towards corner 2, so a flip shows
    const [ax, ay] = place(0), [bx, by] = place(1), mx = cx + (ax - cx) * 0.55, my = cy + (ay - cy) * 0.55, fx = mx + (bx - ax) * 0.22, fy = my + (by - ay) * 0.22;
    g.strokeStyle = obj; g.fillStyle = obj; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + (mx - cx) * 0.1, cy + (my - cy) * 0.1); g.lineTo(mx, my); g.stroke();
    g.beginPath(); g.moveTo(mx, my); g.lineTo(fx, fy); g.lineTo(mx + (fx - mx) * 0.2 + (cx - mx) * 0.25, my + (fy - my) * 0.2 + (cy - my) * 0.25); g.closePath(); g.fill();
    for (let i = 0; i < n; i++) { const [x, y] = place(i); g.fillStyle = cols[i % 8]; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 2; g.stroke(); g.fillStyle = "#fff"; g.font = "700 15px system-ui"; g.fillText(String(i + 1), x, y + 5); }
    // the 2n elements: rotations above, reflections below; the current one ringed
    const gx = W * 0.7, gw = W * 0.27, cell = Math.min(46, gw / n), top = cy - cell * 1.3;
    g.font = "600 12px system-ui"; g.fillStyle = muted; g.textAlign = "left";
    g.fillText(t([`les ${2 * n} symétries`, `the ${2 * n} symmetries`]), gx, top - 12);
    for (let row = 0; row < 2; row++) for (let k = 0; k < n; k++) {
      const x = gx + k * cell, y = top + row * cell * 1.3, el2 = { k, s: row }, here = el2.k === cur.k && el2.s === cur.s && !anim;
      g.strokeStyle = here ? obj : line; g.lineWidth = here ? 3 : 1; g.strokeRect(x + 2, y, cell - 4, cell - 4);
      g.fillStyle = here ? obj : ink; g.font = `${here ? 700 : 500} ${Math.min(15, cell * 0.36)}px serif`; g.textAlign = "center";
      g.fillText(G.dName(el2), x + cell / 2, y + cell / 2 + 3);
    }
    g.textAlign = "left"; g.fillStyle = muted; g.font = "12px system-ui";
    g.fillText(t(["rotations", "rotations"]), gx, top + cell * 2.6 + 6); g.fillText(t(["retournements", "reflections"]), gx + gw * 0.5, top + cell * 2.6 + 6);
    if (u >= 1 && anim) { anim = null; return true; }
    return !!anim;
  }
  return {
    resize: () => surf.resize(),
    draw() {
      const s = getState();
      if (shown && shown.n === s.n && shown.word !== s.word && s.word.startsWith(shown.word) && s.word.length === shown.word.length + 1 && !stage.reduced()) {
        anim = { from: parse(shown), move: s.word.at(-1), start: performance.now(), dur: 700 };
      } else anim = null;
      shown = { n: s.n, word: s.word, g: s.g };
      surf.kick();
      const g = parse(s), perm = G.dPerm(s.n, g);
      const word = s.word ? s.word.split("").map((c) => (c === "t" ? "τ" : c === "R" ? "r⁻¹" : "r")).reverse().join(" ∘ ") : "e";
      info(dl, [
        [t(["Mouvements faits (le dernier à gauche)", "Moves made (last on the left)"]), word],
        [t(["Résultat", "Result"]), `${G.dName(g)}${g.s ? t([" : un retournement", ": a reflection"]) : g.k ? t([" : une rotation", ": a rotation"]) : t([" : rien n’a bougé", ": nothing moved"])}`],
        [t(["Ordre de cet élément", "Order of this element"]), String(G.dOrder(s.n, g))],
        [t(["Sommets déplacés", "Corners moved"]), G.cycleText(perm)],
      ]);
      say(note, g.k === 0 && g.s === 0 && s.word ? t(["Retour à la position de départ.", "Back to the starting position."]) : t(["r tourne d’un cran ; τ retourne la figure autour de l’axe fixe.", "r turns by one step; τ flips the figure over the fixed axis."]), g.k === 0 && g.s === 0 && s.word ? "win" : "");
    },
    destroy: () => surf.stop(),
  };
}

// ---------------------------------------------------------------- Rubik's cube
const FACE_COLOUR = { U: "#f4f4f0", D: "#f2cf1d", F: "#1f9e4a", B: "#2a5fd0", R: "#d6332b", L: "#f08a1c" };
function cubeView({ stage, fmt, getState }, { box, cv, info: dl, note }) {
  const t = fmt.t;
  let yaw = -0.62, pitch = 0.5, shown = null, stickers = G.solvedStickers(), queue = [], current = null, drag = null;
  const surf = surface(box, cv, (W) => Math.max(280, Math.min(420, W * 0.66)), paint);
  const rotAxis = (v, axis, a) => { const [i, j] = axis === 0 ? [1, 2] : axis === 1 ? [2, 0] : [0, 1], r = v.slice(), c = Math.cos(a), s = Math.sin(a); r[i] = v[i] * c - v[j] * s; r[j] = v[i] * s + v[j] * c; return r; };
  const toView = (v) => { let r = rotAxis(v, 1, yaw); r = rotAxis(r, 0, pitch); return r; };
  function paint(g, W, H, now) {
    // the queue of moves plays one move at a time; a long queue plays faster
    if (!current && queue.length) { const m = queue.shift(); current = { m, start: now, dur: stage.reduced() ? 0 : Math.max(60, 300 / Math.sqrt(1 + queue.length / 3)) }; }
    let angle = 0, spec = null;
    if (current) {
      const u = current.dur ? Math.min(1, (now - current.start) / current.dur) : 1;
      spec = G.moveSpec(current.m); angle = ease(u) * spec.q * Math.PI / 2;
      if (u >= 1) { stickers = G.applyMove(stickers, current.m); current = null; spec = null; angle = 0; }
    }
    const S = Math.min(W, H) * 0.19, cx = W / 2, cy = H / 2 + S * 0.15, line = css(stage.wrap, "--bg", "#111");
    const proj = (v) => [cx + v[0] * S, cy - v[1] * S, v[2]];
    // one quad per sticker and one dark quad per cubie face, all sorted back to front
    const quads = [];
    const inLayer = (p) => spec && p[spec.axis] === spec.side;
    const cubies = new Set();
    for (const s of stickers) cubies.add(s.p.join(","));
    for (const c of cubies) {
      const p = c.split(",").map(Number), moving = inLayer(p);
      for (const nv of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) quads.push(face(p, nv, 0.5, "#0d0d10", moving));
    }
    for (const s of stickers) quads.push(face(s.p, s.n, 0.42, FACE_COLOUR[s.face], inLayer(s.p), 0.505));
    function face(p, nv, half, colour, moving, out = 0.5) {
      const axis = nv.findIndex((v) => v !== 0), others = [0, 1, 2].filter((i) => i !== axis), pts = [];
      for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const v = p.slice(); v[axis] += nv[axis] * out; v[others[0]] += a * half; v[others[1]] += b * half; pts.push(v); }
      let P = pts, N = nv, C = p;
      if (moving) { P = pts.map((v) => rotAxis(v, spec.axis, angle)); N = rotAxis(nv, spec.axis, angle); C = rotAxis(p, spec.axis, angle); }
      const V = P.map(toView), n2 = toView(N), c2 = toView(C.map((x, i) => x + N[i] * out));
      return { pts: V.map(proj), depth: c2[2], facing: n2[2] > 0.001, colour };
    }
    g.clearRect(0, 0, W, H);
    quads.filter((q) => q.facing).sort((a, b) => a.depth - b.depth).forEach((q) => {
      g.beginPath(); q.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
      g.fillStyle = q.colour; g.fill(); g.strokeStyle = line; g.lineWidth = 1; g.stroke();
    });
    if (!current && !queue.length) { update(); return false; }
    return true;
  }
  function update() {
    const s = getState(), seq = G.parseMoves(s.seq), solved = G.isSolved(stickers), busy = !!current || queue.length > 0;
    info(dl, [
      [t(["Séquence étudiée", "Sequence studied"]), seq.join(" ") || "–"],
      [t(["Son ordre", "Its order"]), `${G.sequenceOrder(seq)} ${t(["répétitions", "repetitions"])}`],
      [t(["Séquence répétée", "Sequence repeated"]), `${s.reps} ${t(["fois", "times"])}`],
      [t(["Coups joués", "Moves played"]), String(G.parseMoves(s.moves).length)],
      [t(["Cubes déplacés", "Cubies moved"]), `${G.movedCubies(G.applyMoves(G.solvedStickers(), G.parseMoves(s.moves)))} / 20`],
    ]);
    say(note, busy ? t(["Le cube tourne…", "The cube is turning…"]) : solved && s.moves ? t(["Le cube est revenu à son état de départ.", "The cube is back to its starting state."]) : t(["Faites glisser le fond pour tourner la vue.", "Drag the background to turn the view."]), solved && s.moves && !busy ? "win" : "");
  }
  // turning the view: a drag on the canvas, or the arrow keys when the figure has the focus
  const down = (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch }; cv.setPointerCapture?.(e.pointerId); };
  const move = (e) => { if (!drag) return; yaw = drag.yaw + (e.clientX - drag.x) * 0.01; pitch = Math.max(-1.2, Math.min(1.2, drag.pitch + (e.clientY - drag.y) * 0.01)); surf.kick(); };
  const up = () => { drag = null; };
  const key = (e) => { const d = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key]; if (!d || e.target !== stage.wrap) return; e.preventDefault(); yaw += d[0]; pitch = Math.max(-1.2, Math.min(1.2, pitch + d[1])); surf.kick(); };
  cv.style.touchAction = "none"; cv.style.cursor = "grab";
  cv.addEventListener("pointerdown", down); cv.addEventListener("pointermove", move); cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  stage.wrap.addEventListener("keydown", key);
  return {
    resize: () => surf.resize(),
    draw() {
      const s = getState();
      if (s.moves !== shown) {
        // more moves at the end: play them; anything else (a reset, a new mission): jump there
        if (shown !== null && s.moves.startsWith(shown) && !stage.reduced()) queue.push(...G.parseMoves(s.moves.slice(shown.length)));
        else { queue = []; current = null; stickers = G.applyMoves(G.solvedStickers(), G.parseMoves(s.moves)); }
        shown = s.moves;
      }
      update(); surf.kick();
    },
    destroy() { surf.stop(); stage.wrap.removeEventListener("keydown", key); },
  };
}
