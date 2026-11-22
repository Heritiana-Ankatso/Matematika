// Design v8, the threshold (home under ?v8): "Quatre mondes, une seule passion." Four doors, each in its world's look and
// ground with a solid frame in its accent; a click anywhere on a door enters (docs/DESIGN_V8.md section 4). On a phone
// the four doors share the first screen as four bands (name left, live drawing right). Each door draws itself (chaos
// game, constellation, a parabola written in pen, the Olympiad problems as squares by level); the drawings run through
// visible-loop.js: nothing is drawn off screen or in a hidden tab, and under reduced motion each shows its final state.
import { animationLoop } from '../visible-loop.js';
import { OLYMPIAD_LEVELS } from '../world-lines.js';
import { topBar, sayer } from './kit.js';

const P = (fr, en) => [fr, en];
const LEVEL_ORDER = ['mg', 'pan', 'intl'];

export function thresholdPage({ t, lang, siteName }) {
  const say = sayer(lang);
  const n = OLYMPIAD_LEVELS.length;
  const doors = [
    { id: 'musee', hash: '#musee', name: say(P('Le musée', 'The museum')), line: say(P('Curiosités, chronologies des grands esprits, histoires vraies.', 'Curiosities, timelines of great minds, true stories.')), short: say(P('Curiosités, grands esprits, histoires', 'Curiosities, great minds, stories')) },
    { id: 'univ', hash: '#university', name: say(P('Université', 'University')), line: say(P('Aux confins du savoir · la carte des mathématiques', 'At the edge of knowledge · the map of mathematics')), short: say(P('La carte des mathématiques', 'The map of mathematics')) },
    { id: 'lycee', hash: '#resources', name: say(P('Le lycée', 'The lycée')), line: say(P('Bâtir les bases : lycée malgache, lycée français, international.', 'Building the ground: Malagasy, French and international lycée.')), short: say(P('Malgache, français, international', 'Malagasy, French, international')) },
    { id: 'olymp', hash: '#olympiad', name: say(P('Olympiades', 'Olympiads')), line: say(P(`${n} problèmes · national · panafricain · international`, `${n} problems · national · pan-African · international`)), short: say(P(`${n} problèmes, 3 niveaux`, `${n} problems, 3 levels`)) },
  ];
  return `<div class="v8">${topBar({ t, world: '', siteName, lang })}<main id="main" tabindex="-1" class="v8-threshold"><div class="v8-wrap v8-th-head"><h1>${say(P('Quatre mondes, une seule passion.', 'Four worlds, one passion.'))}</h1><p>${say(P('Contempler les merveilles des mathématiques, approcher les confins du savoir, bâtir les bases, ou se mesurer aux meilleurs.', 'Contemplate the marvels of mathematics, approach the edge of knowledge, build the ground, or measure yourself against the best.'))}</p></div>`
    + `<nav class="v8-wrap v8-doors" aria-label="${say(P('Les quatre mondes', 'The four worlds'))}">${doors.map((d) => `<a class="v8-door v8-world-${d.id}" href="${d.hash}" data-door="${d.id}"><span class="v8-door-vis"><canvas data-door-art="${d.id}" aria-hidden="true"></canvas></span><span class="v8-door-txt"><span class="v8-door-name">${d.name}</span><span class="v8-door-line">${d.line}</span><span class="v8-door-short">${d.short}</span></span></a>`).join('')}</nav></main></div>`;
}

// A pseudo-random sequence with a fixed seed: the same drawing on every visit.
const lcg = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const token = (el, name) => getComputedStyle(el).getPropertyValue(name).trim();

function fit(cv) {
  const W = Math.max(1, cv.clientWidth), H = Math.max(1, cv.clientHeight), r = Math.min(globalThis.devicePixelRatio || 1, 2);
  if (cv.width !== Math.round(W * r) || cv.height !== Math.round(H * r)) { cv.width = Math.round(W * r); cv.height = Math.round(H * r); }
  const c = cv.getContext('2d'); c.setTransform(r, 0, 0, r, 0, 0);
  return [c, W, H];
}

// Each drawing: (canvas, colours) -> frame(seconds, still) returning false once nothing moves any more.
const DRAW = {
  // Musée: the chaos game, in gold; a few points at first, then faster and faster, each one faint, so the triangle
  // uncovers itself where they pile up instead of appearing at once
  musee(cv, col) {
    const TOTAL = 30000; let n = 0, x = 0, y = 0, rnd = lcg(3), size = '', start = null;
    return (s, still) => {
      const [c, W, H] = fit(cv);
      if (size !== W + 'x' + H) { size = W + 'x' + H; n = 0; rnd = lcg(3); x = W / 2; y = H / 2; start = s; c.clearRect(0, 0, W, H); }
      const side = Math.min(W, H * 1.15) * 0.8, ox = (W - side) / 2, oy = Math.max(8, (H - side * 0.86) / 2), V = [[ox + side / 2, oy], [ox, oy + side * 0.86], [ox + side, oy + side * 0.86]];
      const want = still ? TOTAL : Math.min(TOTAL, Math.floor(Math.expm1((s - start) * 1.1) * 4));
      c.fillStyle = col.accent;
      for (; n < want; n++) { const v = V[Math.floor(rnd() * 3)]; x = (x + v[0]) / 2; y = (y + v[1]) / 2; if (n > 20) { c.globalAlpha = n < 600 ? 0.8 : 0.35; c.fillRect(x - 0.6, y - 0.6, n < 600 ? 1.8 : 1.2, n < 600 ? 1.8 : 1.2); } }
      c.globalAlpha = 1;
      return n < TOTAL;
    };
  },
  // Université: a constellation over twinkling stars
  univ(cv, col) {
    const rnd = lcg(11), stars = [...Array(140)].map(() => [rnd(), rnd(), rnd() * 1.2 + 0.3, rnd() * 6]), nodes = [...Array(9)].map(() => [0.12 + rnd() * 0.76, 0.15 + rnd() * 0.7]);
    return (s, still) => {
      const [c, W, H] = fit(cv);
      c.clearRect(0, 0, W, H);
      stars.forEach(([x, y, r, p]) => { c.globalAlpha = still ? 0.55 : 0.35 + 0.35 * Math.sin(s * 1.1 + p); c.fillStyle = col.ink; c.fillRect(x * W, y * H, r, r); });
      c.globalAlpha = 0.45; c.strokeStyle = col.accent; c.lineWidth = 1; c.beginPath();
      nodes.forEach((p, i) => { if (i) { c.moveTo(nodes[i - 1][0] * W, nodes[i - 1][1] * H); c.lineTo(p[0] * W, p[1] * H); } });
      c.moveTo(nodes[2][0] * W, nodes[2][1] * H); c.lineTo(nodes[6][0] * W, nodes[6][1] * H); c.stroke();
      c.globalAlpha = 1;
      nodes.forEach(([x, y], i) => { const lit = i % 3 === 0; c.shadowColor = lit ? col.accent2 : col.accent; c.shadowBlur = 12; c.fillStyle = c.shadowColor; c.beginPath(); c.arc(x * W, y * H, lit ? 3.6 : 2.4, 0, 7); c.fill(); });
      c.shadowBlur = 0;
      return !still;
    };
  },
  // Lycée: a parabola written by a ballpoint, its vertex in red pen
  lycee(cv, col) {
    return (s, still) => {
      const [c, W, H] = fit(cv), X = (x) => W * 0.55 + x * W * 0.11, Y = (y) => H * 0.82 - y * H * 0.15;
      const p = still ? 1 : Math.min(1, (s / 1.8) % 2.6);
      c.clearRect(0, 0, W, H); c.strokeStyle = col.ink; c.lineWidth = 2.6; c.lineCap = 'round'; c.beginPath();
      for (let x = -2.6, first = true; x <= -2.6 + 5.2 * p; x += 0.04, first = false) { const y = x * x * 0.75; first ? c.moveTo(X(x), Y(y)) : c.lineTo(X(x), Y(y)); }
      c.stroke();
      c.fillStyle = col.accent; c.strokeStyle = col.bg; c.lineWidth = 2.5; c.beginPath(); c.arc(X(0), Y(0), 8, 0, 7); c.fill(); c.stroke();
      return !still;
    };
  },
  // Olympiades: the problems as sharp squares, one look per level (national filled red, pan-African filled, international
  // outlined), counted from the Olympiad content
  olymp(cv, col) {
    const levels = [...OLYMPIAD_LEVELS].sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
    let start = null;
    return (s, still) => {
      const [c, W, H] = fit(cv);
      if (start === null) start = s;
      const cols = 10, rows = Math.ceil(levels.length / cols), gap = 6;
      const sz = Math.max(2, Math.min((W * 0.78 - gap * (cols - 1)) / cols, (H * 0.8 - gap * (rows - 1)) / rows));
      const x0 = (W - cols * sz - (cols - 1) * gap) / 2, y0 = (H - rows * sz - (rows - 1) * gap) / 2, shown = still ? Infinity : (s - start) * 45;
      c.clearRect(0, 0, W, H);
      levels.forEach((l, k) => {
        if (k >= shown) return;
        const x = x0 + (k % cols) * (sz + gap), y = y0 + Math.floor(k / cols) * (sz + gap);
        c.globalAlpha = Math.min(1, (shown - k) / 6);
        if (l === 'mg') { c.fillStyle = col.accent; c.fillRect(x, y, sz, sz); }
        else if (l === 'pan') { c.fillStyle = col.ink; c.fillRect(x, y, sz, sz); }
        else { c.strokeStyle = col.ink; c.lineWidth = 1.5; c.strokeRect(x + 0.75, y + 0.75, sz - 1.5, sz - 1.5); }
      });
      c.globalAlpha = 1;
      return shown < levels.length + 6;
    };
  },
};

export function bindThreshold(root, { reduced = () => false } = {}) {
  const stops = [];
  root.querySelectorAll('[data-door-art]').forEach((cv) => {
    const door = cv.closest('.v8-door');
    const col = { bg: token(door, '--w-bg'), ink: token(door, '--w-ink'), accent: token(door, '--w-accent'), accent2: token(door, '--w-accent2') };
    const frame = DRAW[cv.dataset.doorArt](cv, col);
    const still = () => reduced() || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // under reduced motion the final state is drawn once and the loop sleeps
    const loop = animationLoop(cv, (dt, s) => (frame(s, still()) && !still() ? undefined : false), { reduced: still, scope: door });
    stops.push(loop.stop);
  });
  return () => stops.forEach((stop) => stop());
}
