// The interactive figures of the competition archive (page.js mounts them in [data-contest-widget]). Olympiad figures
// let the visitor explore a statement (sunny lines, sums of floors, the gcd, the divisor chain, Turbo's board) without
// giving the answer away; the Turbo board also replays the strategy on the solution page. Contest figures play a
// task and check the visitor's own sequence of commands (video game, trains) or step through it (buttons, carrots,
// lockers). Pure maths in models.js; every control is a button or a field, so the keyboard reaches everything.
import * as M from './models.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, kids = []) => { const e = document.createElement(tag); for (const [k, v] of Object.entries(attrs)) { if (k === 'text') e.textContent = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v); } e.append(...kids); return e; };
const sv = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
const reduced = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const MINUS = '−';
const num = (x) => String(x).replace('-', MINUS);

export function mountContestWidget(kind, host, { lang = 'fr', mode = 'explore' } = {}) {
  const en = lang === 'en', T = (fr, e) => (en ? e : fr);
  host.classList.add('contest-fig');
  const out = el('p', { class: 'contest-readout', 'aria-live': 'polite' });
  const timers = [];
  const later = (f, ms) => timers.push(setTimeout(f, reduced() ? 0 : ms));
  const stop = () => { timers.forEach(clearTimeout); timers.length = 0; };
  const make = BUILD[kind];
  if (!make) return { destroy() {} };
  make({ host, out, T, en, mode, later, stop });
  host.append(out);
  return { destroy() { stop(); host.innerHTML = ''; } };
}

const field = (label, attrs) => { const i = el('input', attrs); return [el('label', { class: 'contest-field' }, [el('span', { text: label }), i]), i]; };
const button = (text, on, cls = '') => el('button', { type: 'button', class: cls, text, onclick: on });

const BUILD = {
  // ---- IMO 2025 problem 1: draw lines through two points of the triangle
  sunny({ host, out, T }) {
    let n = 4, lines = [], pick = null;
    const bar = el('div', { class: 'contest-bar' }), svg = sv('svg', { class: 'contest-svg', role: 'group' }), list = el('ul', { class: 'contest-lines' });
    const sel = el('select', { 'aria-label': 'n' }, [3, 4, 5, 6].map((k) => el('option', { value: k, text: `n = ${k}` })));
    // the grid and the points are built once per n; a tap only redraws the lines and the points' state, so the
    // keyboard focus stays on the point just chosen
    const gLines = sv('g'), gDots = sv('g'); let dots = [], geo;
    function build() {
      const s = 46, pad = 30, W = pad * 2 + s * (n + 1);
      geo = { X: (x) => pad + x * s, Y: (y) => W - pad - y * s };
      svg.setAttribute('viewBox', `0 0 ${W} ${W}`); svg.replaceChildren();
      svg.setAttribute('aria-label', T(`Triangle de points pour n = ${n}`, `Triangle of points for n = ${n}`));
      for (let k = 0; k <= n + 1; k++) svg.append(sv('line', { x1: geo.X(k), y1: geo.Y(0), x2: geo.X(k), y2: geo.Y(n + 1), class: 'cg-grid' }), sv('line', { x1: geo.X(0), y1: geo.Y(k), x2: geo.X(n + 1), y2: geo.Y(k), class: 'cg-grid' }));
      gLines.replaceChildren(); gDots.replaceChildren(); svg.append(gLines, gDots);
      dots = M.trianglePoints(n).map((p) => {
        const dot = sv('circle', { cx: geo.X(p[0]), cy: geo.Y(p[1]), r: 9, class: 'cg-dot', tabindex: 0, role: 'button', 'aria-label': `(${p[0]}, ${p[1]})` });
        const act = () => { if (!pick) pick = p; else { const L = M.lineThrough(pick, p); pick = null; if (L && !lines.some((K) => K.u === L.u && K.v === L.v && K.w === L.w)) lines.push(L); } draw(); };
        dot.addEventListener('click', act); dot.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        gDots.append(dot); return [p, dot];
      });
    }
    sel.value = String(n); sel.addEventListener('change', () => { n = Number(sel.value); lines = []; pick = null; build(); draw(); });
    bar.append(sel, button(T('Effacer les droites', 'Clear the lines'), () => { lines = []; pick = null; draw(); }));
    host.append(el('p', { class: 'muted', text: T('Touchez deux points : la droite qui les relie est ajoutée. Les droites ensoleillées sont en trait plein coloré, les autres en pointillés.', 'Tap two points: the line through them is added. Sunny lines are solid and coloured, the others dashed.') }), bar, svg, list);
    function draw() {
      const { X, Y } = geo, m = n + 1;
      gLines.replaceChildren(...lines.flatMap((L) => {
        // clip u x + v y = w to the square [0, n + 1]^2
        const pts = [];
        if (L.v !== 0) for (const x of [0, m]) { const y = (L.w - L.u * x) / L.v; if (y >= 0 && y <= m) pts.push([x, y]); }
        if (L.u !== 0) for (const y of [0, m]) { const x = (L.w - L.v * y) / L.u; if (x >= 0 && x <= m) pts.push([x, y]); }
        return pts.length >= 2 ? [sv('line', { x1: X(pts[0][0]), y1: Y(pts[0][1]), x2: X(pts[pts.length - 1][0]), y2: Y(pts[pts.length - 1][1]), class: M.isSunny(L) ? 'cg-sunny' : 'cg-plain' })] : [];
      }));
      for (const [p, dot] of dots) dot.setAttribute('class', `cg-dot${lines.some((L) => M.onLine(L, p)) ? ' is-on' : ''}${pick && pick[0] === p[0] && pick[1] === p[1] ? ' is-pick' : ''}`);
      const cov = M.coverage(n, lines);
      list.replaceChildren(...lines.map((L, i) => el('li', {}, [el('span', { text: `${eq(L)} · ${M.isSunny(L) ? T('ensoleillée', 'sunny') : T('non ensoleillée', 'not sunny')}` }), button(T('Retirer', 'Remove'), () => { lines.splice(i, 1); draw(); }, 'contest-small')])));
      out.textContent = T(`${cov.covered} points couverts sur ${cov.total} · ${lines.length} droite${lines.length > 1 ? 's' : ''} sur ${n} · ${cov.sunny} ensoleillée${cov.sunny > 1 ? 's' : ''}.`, `${cov.covered} of ${cov.total} points covered · ${lines.length} of ${n} lines · ${cov.sunny} sunny.`)
        + (cov.covered === cov.total && lines.length === n ? T(' Tout est couvert avec exactement n droites.', ' Everything is covered with exactly n lines.') : '')
        + (cov.covered === cov.total && lines.length < n ? T(` Tout est couvert ; il faut encore ${n - lines.length} droite(s) distincte(s), et chacune compte si elle est ensoleillée.`, ` Everything is covered; ${n - lines.length} more distinct line(s) are still needed, and each one counts if it is sunny.`) : '')
        + (lines.length > n ? T(' Trop de droites.', ' Too many lines.') : '');
    }
    // u x + v y = w written the usual way: no coefficient 1, a true minus sign
    const term = (c, v, first) => (c === 0 ? '' : `${first ? (c < 0 ? MINUS : '') : c < 0 ? ` ${MINUS} ` : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}`);
    const eq = (L) => `${term(L.u, 'x', true)}${term(L.v, 'y', L.u === 0)} = ${num(L.w)}`;
    build(); draw();
  },

  // ---- IMO 2024 problem 1: S_n for a value of alpha typed by the visitor
  floorsum({ host, out, T }) {
    const [lab, inp] = field(T('α (décimal ou fraction, ex. 2,5 ou 7/3)', 'α (decimal or fraction, e.g. 2.5 or 7/3)'), { type: 'text', value: '2,5', inputmode: 'decimal', size: 10 });
    const table = el('table', { class: 'contest-table' });
    host.append(lab, table);
    const parse = (s) => {
      s = s.trim().replace(',', '.').replace(MINUS, '-');
      let m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/); if (m && Number(m[2]) > 0) return [Number(m[1]), Number(m[2])];
      m = s.match(/^(-?)(\d*)(?:\.(\d{1,6}))?$/); if (!m || (!m[2] && !m[3])) return null;
      const den = 10 ** (m[3] ? m[3].length : 0); return [(m[1] ? -1 : 1) * (Number(m[2] || 0) * den + Number(m[3] || 0)), den];
    };
    const run = () => {
      const f = parse(inp.value); if (!f) { out.textContent = T('Valeur illisible.', 'Cannot read this value.'); table.replaceChildren(); return; }
      const s = M.floorSums(f[0], f[1], 12), bad = M.firstFailure(f[0], f[1], 2000);
      table.replaceChildren(el('tr', {}, [el('th', { text: 'n' }), el('th', { text: 'S_n' }), el('th', { text: T('multiple de n ?', 'multiple of n?') })]),
        ...s.map((x, i) => el('tr', {}, [el('td', { text: i + 1 }), el('td', { text: num(x) }), el('td', { text: x % BigInt(i + 1) === 0n ? T('oui', 'yes') : T('non', 'no') })])));
      out.textContent = bad ? T(`Premier échec : n = ${bad}.`, `First failure: n = ${bad}.`) : T('Aucun échec jusqu’à n = 2000. Ce n’est pas une preuve.', 'No failure up to n = 2000. This is not a proof.');
    };
    inp.addEventListener('input', run); run();
  },

  // ---- IMO 2024 problem 2: the first values of gcd(a^n + b, b^n + a)
  gcd({ host, out, T }) {
    const [la, a] = field('a', { type: 'number', min: 1, max: 99, value: 2 }), [lb, b] = field('b', { type: 'number', min: 1, max: 99, value: 3 });
    const row = el('p', { class: 'contest-seq' });
    host.append(el('div', { class: 'contest-bar' }, [la, lb]), row);
    const run = () => {
      const x = Math.min(99, Math.max(1, Math.floor(Number(a.value) || 1))), y = Math.min(99, Math.max(1, Math.floor(Number(b.value) || 1)));
      const g = M.gcdSequence(x, y, 24);
      row.textContent = g.map((v, i) => `n=${i + 1}: ${v}`).join(' · ');
      out.textContent = T(`Les 24 premières valeurs pour a = ${x}, b = ${y}. Une régularité observée n’est pas une preuve.`, `The first 24 values for a = ${x}, b = ${y}. An observed pattern is not a proof.`);
    };
    a.addEventListener('input', run); b.addEventListener('input', run); run();
  },

  // ---- IMO 2026 problem 1: a small blackboard, moves chosen one by one or played at random (the problem has 2026 numbers)
  blackboard({ host, out, T }) {
    let start = [12, 18, 20, 35, 9], hist = [start.slice()], moves = [], picked = -1;
    const [lab, inp] = field(T('Entiers supérieurs à 1, séparés par des espaces', 'Integers above 1, separated by spaces'), { type: 'text', value: start.join(' '), size: 24 });
    const row = el('div', { class: 'contest-bar', role: 'group', 'aria-label': T('Tableau', 'Blackboard') }), log = el('ol', { class: 'contest-lines' });
    const board = () => hist[hist.length - 1], show = (x) => String(x).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    const draw = (msg) => {
      const b = board();
      row.replaceChildren(...b.map((x, i) => { const c = el('button', { type: 'button', class: 'contest-chip', 'aria-pressed': String(picked === i), text: show(x), onclick: () => choose(i) }); if (!(x > 1)) c.disabled = true; return c; }));
      log.replaceChildren(...moves.map(([i, j], k) => el('li', { text: `${show(hist[k][i])} + ${show(hist[k][j])} → ${show(hist[k + 1][i])}, ${show(hist[k + 1][j])}` })));
      const big = b.filter((x) => x > 1);
      out.textContent = msg || (M.boardFinished(b)
        ? T(`Plus aucun coup n’est possible : ${big.length} entier${big.length > 1 ? 's' : ''} supérieur${big.length > 1 ? 's' : ''} à 1${big.length === 1 ? ` (M = ${show(big[0])})` : ''}, après ${moves.length} mouvements.`, `No move is possible any more: ${big.length} integer${big.length > 1 ? 's' : ''} above 1${big.length === 1 ? ` (M = ${show(big[0])})` : ''}, after ${moves.length} moves.`)
        : T('Choisissez deux entiers supérieurs à 1 : ils sont remplacés par leur pgcd et par ppcm ÷ pgcd.', 'Choose two integers above 1: they are replaced by their gcd and by lcm ÷ gcd.'));
    };
    const choose = (i) => {
      if (picked < 0) { picked = i; draw(T('Choisissez un second entier, à un autre endroit du tableau.', 'Now choose a second integer, in another place.')); return; }
      if (picked === i) { picked = -1; draw(); return; }
      const nxt = M.boardMove(board(), picked, i); if (nxt) { moves.push([picked, i]); hist.push(nxt); } picked = -1; draw();
    };
    const load = () => { const v = (inp.value.match(/\d+/g) || []).map(Number).filter((x) => x > 1 && x < 1000).slice(0, 12); if (v.length < 2) { draw(T('Écrivez au moins deux entiers entre 2 et 999.', 'Write at least two integers between 2 and 999.')); return; } start = v; hist = [start.slice()]; moves = []; picked = -1; draw(); };
    host.append(el('div', { class: 'contest-bar' }, [lab, button(T('Écrire au tableau', 'Write on the board'), load)]), row,
      el('div', { class: 'contest-bar' }, [
        button(T('Jouer au hasard jusqu’au bout', 'Play at random to the end'), () => { let cur = board(); M.boardRandomPlay(cur).moves.forEach(([i, j]) => { cur = M.boardMove(cur, i, j); moves.push([i, j]); hist.push(cur); }); picked = -1; draw(); }),
        button(T('Annuler', 'Undo'), () => { if (moves.length) { moves.pop(); hist.pop(); } picked = -1; draw(); }),
        button(T('Recommencer', 'Start again'), () => { hist = [start.slice()]; moves = []; picked = -1; draw(); })]), log);
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
    draw();
  },

  // ---- IMO 2026 problem 6: the first terms for an a_1 typed by the visitor, and their differences
  sequence({ host, out, T }) {
    const [lab, inp] = field(T('Premier terme a₁ (entier ≥ 2)', 'First term a₁ (integer ≥ 2)'), { type: 'number', min: 2, max: 100000, value: 6 });
    const wrap = el('div', { class: 'contest-scroll' });
    host.append(el('div', { class: 'contest-bar' }, [lab]), wrap);
    const run = () => {
      const a1 = Math.floor(Number(inp.value));
      if (!(a1 >= 2 && a1 <= 100000)) { wrap.replaceChildren(); out.textContent = T('Choisissez un entier entre 2 et 100 000.', 'Choose an integer between 2 and 100,000.'); return; }
      const t = M.sharedSequence(a1, 40);
      const rowOf = (name, cells) => el('tr', {}, [el('th', { scope: 'row', text: name }), ...cells.map((x) => el('td', { text: x }))]);
      wrap.replaceChildren(el('table', { class: 'contest-table' }, [el('tbody', {}, [rowOf('n', t.map((_, i) => i + 1)), rowOf('aₙ', t), rowOf('aₙ₊₁ − aₙ', t.map((x, i) => (i + 1 < t.length ? t[i + 1] - x : '')))])]));
      out.textContent = T('Les 40 premiers termes et leurs différences. Essayez un nombre premier, une puissance de 2, un produit de deux nombres premiers. Une régularité observée n’est pas une preuve.', 'The first 40 terms and their differences. Try a prime, a power of 2, a product of two primes. An observed pattern is not a proof.');
    };
    inp.addEventListener('input', run); run();
  },

  // ---- IMO 2025 problem 4: the orbit of a_1 under "sum of the three largest proper divisors"
  orbit({ host, out, T }) {
    const [lab, inp] = field(T('Premier terme a₁', 'First term a₁'), { type: 'number', min: 1, max: 1000000000, value: 72 });
    const list = el('ol', { class: 'contest-lines' });
    host.append(el('div', { class: 'contest-bar' }, [lab]), list);
    const run = () => {
      const a1 = Math.floor(Number(inp.value));
      if (!(a1 >= 1 && a1 <= 1e9)) { list.replaceChildren(); out.textContent = T('Choisissez un entier entre 1 et 1 000 000 000.', 'Choose an integer between 1 and 1,000,000,000.'); return; }
      const { terms, status } = M.divisorOrbit(a1, 40);
      list.replaceChildren(...terms.map((x) => { const d = M.divisors(x).filter((y) => y !== x), top = d.slice(-3).reverse();
        return el('li', { text: top.length >= 3 ? `${x} : ${top.join(' + ')} = ${top[0] + top[1] + top[2]}` : `${x} : ${T('moins de trois diviseurs propres', 'fewer than three proper divisors')}` }); }));
      out.textContent = { stops: T('La suite s’arrête : le dernier terme a moins de trois diviseurs propres, donc cette valeur de a₁ est impossible.', 'The sequence stops: the last term has fewer than three proper divisors, so this value of a₁ is impossible.'),
        constant: T('Le dernier terme est sa propre image : la suite est constante à partir de là.', 'The last term is its own image: the sequence is constant from there on.'),
        running: T('La suite continue après 40 termes sans s’arrêter ni se stabiliser (pour l’instant).', 'The sequence goes on past 40 terms without stopping or settling (so far).'),
        large: T('Les termes dépassent 10¹² : le calcul s’arrête.', 'The terms pass 10¹²: the computation stops.') }[status];
    };
    inp.addEventListener('input', run); run();
  },

  // ---- IMO 2025 problem 6: tiles on a small grid; the page checks one free square per row and column, never the minimum
  tiles({ host, out, T }) {
    let n = 4, tiles = [], pick = null, note = '';
    const bar = el('div', { class: 'contest-bar' }), svg = sv('svg', { class: 'contest-svg', role: 'group' }), gTiles = sv('g'), gCells = sv('g');
    const sel = el('select', { 'aria-label': 'n' }, [3, 4, 5, 6, 7, 8, 9].map((k) => el('option', { value: k, text: `n = ${k}` })));
    let cells = [], S = 40, pad = 10;
    const build = () => {
      const W = pad * 2 + S * n; svg.setAttribute('viewBox', `0 0 ${W} ${W}`); svg.replaceChildren(gTiles, gCells); gCells.replaceChildren();
      svg.setAttribute('aria-label', T(`Grille ${n} sur ${n}`, `${n} by ${n} grid`));
      cells = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        const g = sv('rect', { x: pad + c * S, y: pad + r * S, width: S, height: S, class: 'cg-cell', tabindex: 0, role: 'button', 'aria-label': T(`ligne ${r + 1}, colonne ${c + 1}`, `row ${r + 1}, column ${c + 1}`) });
        const act = () => click(r, c); g.addEventListener('click', act); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        gCells.append(g); cells.push(g);
      }
    };
    const tileAt = (r, c) => tiles.findIndex((t) => r >= t.r0 && r <= t.r1 && c >= t.c0 && c <= t.c1);
    const click = (r, c) => {
      const at = tileAt(r, c);
      if (!pick && at >= 0) { tiles.splice(at, 1); note = ''; }
      else if (!pick) { pick = [r, c]; note = ''; }
      else { const t = { r0: Math.min(pick[0], r), c0: Math.min(pick[1], c), r1: Math.max(pick[0], r), c1: Math.max(pick[1], c) }; pick = null; if (M.canAddTile(n, tiles, t)) { tiles.push(t); note = ''; } else note = T('Cette tuile en recouvre une autre.', 'That tile overlaps another.'); }
      draw();
    };
    const draw = () => {
      gTiles.replaceChildren(...tiles.map((t, i) => sv('rect', { x: pad + t.c0 * S + 2, y: pad + t.r0 * S + 2, width: (t.c1 - t.c0 + 1) * S - 4, height: (t.r1 - t.r0 + 1) * S - 4, class: 'cg-tile', style: `fill:var(--c${(i % 8) + 1})`, 'pointer-events': 'none' })));
      const rep = M.tilesReport(n, tiles);
      cells.forEach((g, k) => { const r = Math.floor(k / n), c = k % n; g.setAttribute('class', `cg-cell${pick && pick[0] === r && pick[1] === c ? ' is-pick' : ''}${tileAt(r, c) >= 0 ? ' is-covered' : ' is-free'}${rep.free.some(([a, b]) => a === r && b === c) && (rep.rowFree[r] !== 1 || rep.colFree[c] !== 1) ? ' is-bad' : ''}`); });
      const rowsOk = rep.rowFree.filter((x) => x === 1).length, colsOk = rep.colFree.filter((x) => x === 1).length, k = rep.count;
      out.textContent = (note ? note + ' ' : '') + T(`${k} tuile${k > 1 ? 's' : ''} · lignes avec exactement une case libre : ${rowsOk} sur ${n} · colonnes : ${colsOk} sur ${n}.${rep.ok ? ` Valide : chaque ligne et chaque colonne a exactement une case libre, avec ${k} tuile${k > 1 ? 's' : ''}.` : ''}`,
        `${k} tile${k > 1 ? 's' : ''} · rows with exactly one free square: ${rowsOk} of ${n} · columns: ${colsOk} of ${n}.${rep.ok ? ` Valid: every row and column has exactly one free square, with ${k} tile${k > 1 ? 's' : ''}.` : ''}`);
    };
    sel.value = String(n); sel.addEventListener('change', () => { n = Number(sel.value); tiles = []; pick = null; note = ''; build(); draw(); });
    bar.append(sel, button(T('Annuler la dernière tuile', 'Undo last tile'), () => { tiles.pop(); pick = null; note = ''; draw(); }), button(T('Effacer', 'Clear'), () => { tiles = []; pick = null; note = ''; draw(); }));
    host.append(el('p', { class: 'muted', text: T('Touchez deux cases : elles sont les coins opposés d’une tuile (deux fois la même case : une tuile d’une case). Touchez une tuile pour la retirer. Les cases sans tuile sont les cases libres.', 'Tap two squares: they are opposite corners of a tile (the same square twice: a one-square tile). Tap a tile to remove it. Squares without a tile are the free squares.') }), bar, svg);
    build(); draw();
  },

  // ---- IMO 2023 problem 1: the divisors of n and the first link that breaks
  divisors({ host, out, T }) {
    const [lab, inp] = field('n', { type: 'number', min: 2, max: 10000000, value: 12 });
    const chips = el('ol', { class: 'contest-chips' });
    host.append(lab, chips);
    const run = () => {
      const n = Math.floor(Number(inp.value)); if (!(n >= 2 && n <= 1e7)) { out.textContent = T('Choisissez n entre 2 et 10 000 000.', 'Choose n between 2 and 10,000,000.'); chips.replaceChildren(); return; }
      const d = M.divisors(n), i = M.chainBreak(n);
      chips.replaceChildren(...d.slice(0, 60).map((x, k) => el('li', { class: i && (k === i - 1) ? 'is-bad' : i && (k === i || k === i + 1) ? 'is-pair' : '', text: x })));
      out.textContent = d.length === 2 ? T(`${n} est premier.`, `${n} is prime.`)
        : i ? T(`d${i} = ${d[i - 1]} ne divise pas d${i + 1} + d${i + 2} = ${d[i] + d[i + 1]}.`, `d${i} = ${d[i - 1]} does not divide d${i + 1} + d${i + 2} = ${d[i] + d[i + 1]}.`)
          : T(`La chaîne tient pour les ${d.length} diviseurs de ${n}.`, `The chain holds for the ${d.length} divisors of ${n}.`);
    };
    inp.addEventListener('input', run); run();
  },

  // ---- IMO 2023 problem 4: a_n for numbers typed by the visitor, and the gaps a_{n+2} - a_n
  cauchy({ host, out, T, en }) {
    const [lab, inp] = field(T('x₁, x₂, … (réels positifs distincts)', 'x₁, x₂, … (distinct positive reals)'), { type: 'text', value: '1; 2; 0,5; 3; 0,25', size: 30 });
    const table = el('table', { class: 'contest-table' });
    host.append(lab, table);
    const fmt = (v) => { const x = v.toFixed(4); return en ? x : x.replace('.', ','); };
    const run = () => {
      const xs = inp.value.split(en ? /[;,\s]+/ : /[;\s]+/).map((w) => Number(w.replace(',', '.'))).filter((v) => Number.isFinite(v) && v > 0);
      if (xs.length < 1) { out.textContent = T('Écrivez des réels strictement positifs, séparés par des points-virgules.', 'Type positive reals separated by commas.'); table.replaceChildren(); return; }
      const a = M.aSequence(xs.slice(0, 40)), dup = new Set(xs).size !== xs.length;
      table.replaceChildren(el('tr', {}, [el('th', { text: 'n' }), el('th', { text: 'xₙ' }), el('th', { text: 'aₙ' }), el('th', { text: 'aₙ − aₙ₋₂' })]),
        ...a.map((v, i) => el('tr', {}, [el('td', { text: i + 1 }), el('td', { text: fmt(xs[i]) }), el('td', { text: fmt(v) }), el('td', { text: i >= 2 ? fmt(v - a[i - 2]) : '' })])));
      out.textContent = (dup ? T('Attention : deux nombres sont égaux. ', 'Careful: two numbers are equal. ') : '') + T('Ici les aₙ ne sont pas forcément entiers ; regardez les écarts de deux en deux.', 'Here the aₙ need not be integers; look at the gaps two steps apart.');
    };
    inp.addEventListener('input', run); run();
  },

  // ---- IMO 2025 problem 5: the visitor plays both sides, the page shows the room left
  game({ host, out, T, en }) {
    let lambda = 0.7, xs = [], over = null;
    const [ll, li] = field('λ', { type: 'number', min: 0.05, max: 3, step: 0.01, value: lambda });
    const [lx, xi] = field(T('Votre nombre', 'Your number'), { type: 'number', min: 0, step: 0.01, value: 0 });
    const log = el('p', { class: 'contest-seq' });
    host.append(el('div', { class: 'contest-bar' }, [ll, button(T('Nouvelle partie', 'New game'), () => { lambda = Math.max(0.05, Number(li.value) || 0.7); xs = []; over = null; draw(); })]),
      el('div', { class: 'contest-bar' }, [lx, button(T('Jouer', 'Play'), () => { const x = Number(xi.value); if (!(x >= 0) || over) return; xs.push(x); draw(); }), button(T('Annuler', 'Undo'), () => { xs.pop(); over = null; draw(); })]), log);
    const f = (v) => { const x = (Math.round(v * 1000) / 1000).toString(); return en ? x : x.replace('.', ','); };
    function draw() {
      let S = 0, Q = 0; over = null;
      xs.forEach((x, i) => { S += x; Q += x * x; const n = i + 1; if (n % 2 ? S > lambda * n + 1e-9 : Q > n + 1e-9) over = over || n; });
      if (over) { xs = xs.slice(0, over - 1); S = xs.reduce((a, b) => a + b, 0); Q = xs.reduce((a, b) => a + b * b, 0); }
      const n = xs.length + 1, alice = n % 2 === 1, room = alice ? lambda * n - S : n - Q;
      log.textContent = xs.length ? xs.map((x, i) => `x${i + 1} = ${f(x)}`).join(' · ') : '';
      out.textContent = (over ? T('Ce nombre dépasse la limite : coup refusé. ', 'This number breaks the limit: move refused. ') : '')
        + (room < -1e-9 ? T(`Tour ${n} : ${alice ? 'Alice' : 'Bazza'} ne peut plus jouer et perd.`, `Turn ${n}: ${alice ? 'Alice' : 'Bazza'} cannot move and loses.`)
          : alice ? T(`Tour ${n}, Alice : somme actuelle ${f(S)}, elle peut jouer de 0 à ${f(room)}.`, `Turn ${n}, Alice: current sum ${f(S)}, she may play from 0 to ${f(room)}.`)
            : T(`Tour ${n}, Bazza : somme des carrés ${f(Q)}, il peut jouer de 0 à ${f(Math.sqrt(room))}.`, `Turn ${n}, Bazza: sum of squares ${f(Q)}, he may play from 0 to ${f(Math.sqrt(room))}.`));
    }
    draw();
  },

  // ---- IMO 2024 problem 5: Turbo's board, played by the visitor or by the strategy
  turbo({ host, out, T, mode, later, stop }) {
    let C = 5, monsters, seen, pos, attempt, trail, done;
    const svg = sv('svg', { class: 'contest-svg contest-board', role: 'img' }), bar = el('div', { class: 'contest-bar' });
    const sel = el('select', { 'aria-label': T('Colonnes', 'Columns') }, [4, 5, 6, 7].map((k) => el('option', { value: k, text: T(`${k} colonnes`, `${k} columns`) })));
    sel.value = String(C); sel.addEventListener('change', () => { C = Number(sel.value); reset(); });
    bar.append(sel, button(T('Nouveau plateau', 'New board'), () => reset()));
    const pad = el('div', { class: 'contest-pad' });
    const go = (dr, dc) => step(dr, dc);
    if (mode === 'strategy') bar.append(button(T('Tentative suivante', 'Next attempt'), () => nextAttempt()));
    else pad.append(...[['↑', -1, 0, T('Haut', 'Up')], ['←', 0, -1, T('Gauche', 'Left')], ['↓', 1, 0, T('Bas', 'Down')], ['→', 0, 1, T('Droite', 'Right')]].map(([g, dr, dc, name]) => el('button', { type: 'button', 'aria-label': name, text: g, onclick: () => go(dr, dc) })));
    host.append(el('p', { class: 'muted', text: mode === 'strategy' ? T('Chaque appui joue une tentative de la stratégie sur un placement tiré au hasard.', 'Each press plays one attempt of the strategy on a random placement.') : T('Touchez une case de la première ligne pour partir, puis avancez avec les flèches (clavier ou boutons). Les monstres sont cachés.', 'Tap a square of the first row to start, then move with the arrows (keyboard or buttons). The monsters are hidden.') }), bar, svg, pad);
    svg.tabIndex = 0;
    svg.addEventListener('keydown', (e) => { const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[e.key]; if (d && mode !== 'strategy') { e.preventDefault(); go(...d); } });
    let plan = [], shown = 0;
    function reset() {
      stop(); monsters = M.randomMonsters(C); seen = new Set(); pos = null; attempt = 1; trail = []; done = false;
      plan = mode === 'strategy' ? M.turboStrategy(monsters, C) : []; shown = 0;
      draw(); out.textContent = mode === 'strategy' ? T(`Plateau de ${C + 1} lignes et ${C} colonnes, ${C - 1} monstres cachés.`, `Board of ${C + 1} rows and ${C} columns, ${C - 1} hidden monsters.`) : T('Tentative 1. Choisissez votre case de départ.', 'Attempt 1. Choose your starting square.');
    }
    function nextAttempt() {
      if (shown >= plan.length) { reset(); return; }
      const path = plan[shown++]; trail = []; let k = 0;
      const tick = () => { if (k >= path.length) { const [r, c] = path[path.length - 1]; if (M.hasMonster(monsters, r, c)) seen.add(`${r},${c}`); draw(); out.textContent = r === C ? T(`Arrivé en ${shown} tentative(s).`, `Arrived in ${shown} attempt(s).`) : T(`Tentative ${shown} : monstre en ligne ${r + 1}, colonne ${c + 1}.`, `Attempt ${shown}: monster in row ${r + 1}, column ${c + 1}.`); return; }
        trail.push(path[k++]); pos = trail[trail.length - 1]; draw(); later(tick, 90); };
      tick();
    }
    function enter(r, c) {
      pos = [r, c]; trail.push(pos);
      if (M.hasMonster(monsters, r, c)) { seen.add(`${r},${c}`); out.textContent = T(`Monstre ! Tentative ${attempt} terminée. Repartez de la première ligne.`, `Monster! Attempt ${attempt} is over. Start again from the first row.`); attempt++; pos = null; trail = []; }
      else if (r === C) { done = true; out.textContent = T(`Arrivé à la dernière ligne à la tentative ${attempt}.`, `Reached the last row on attempt ${attempt}.`); }
      else out.textContent = T(`Tentative ${attempt}.`, `Attempt ${attempt}.`);
      draw();
    }
    function step(dr, dc) { if (done || !pos) return; const r = pos[0] + dr, c = pos[1] + dc; if (r < 0 || r > C || c < 0 || c >= C) return; enter(r, c); }
    function draw() {
      const s = 40, W = C * s + 2, H = (C + 1) * s + 2; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.replaceChildren();
      svg.setAttribute('aria-label', T(`Plateau de Turbo, tentative ${attempt}`, `Turbo’s board, attempt ${attempt}`));
      const visited = new Set(trail.map(([r, c]) => `${r},${c}`));
      for (let r = 0; r <= C; r++) for (let c = 0; c < C; c++) {
        const k = `${r},${c}`, cls = ['cg-cell', r === 0 || r === C ? 'is-edge' : '', visited.has(k) ? 'is-visited' : '', seen.has(k) ? 'is-monster' : ''].join(' ');
        const rect = sv('rect', { x: 1 + c * s, y: 1 + r * s, width: s, height: s, class: cls });
        if (r === 0 && mode !== 'strategy') rect.addEventListener('click', () => { if (!pos && !done) { trail = []; enter(0, c); } });
        else if (mode !== 'strategy') rect.addEventListener('click', () => { if (pos && Math.abs(pos[0] - r) + Math.abs(pos[1] - c) === 1) enter(r, c); });
        svg.append(rect);
        if (seen.has(k)) { const t = sv('text', { x: 1 + c * s + s / 2, y: 1 + r * s + s * 0.68, class: 'cg-mark', 'text-anchor': 'middle' }); t.textContent = '✕'; svg.append(t); }
      }
      if (pos) svg.append(sv('circle', { cx: 1 + pos[1] * s + s / 2, cy: 1 + pos[0] * s + s / 2, r: s * 0.3, class: 'cg-turbo' }));
    }
    reset();
  },

  // ---- BCC: the video game, any sequence of digits typed or built with the buttons
  video({ host, out, T, later, stop }) {
    const task = M.VIDEO, svg = sv('svg', { class: 'contest-svg', role: 'img', 'aria-label': T('Grille du jeu vidéo et chemin gris', 'Video game grid and grey path') });
    const [lab, inp] = field(T('Votre suite', 'Your sequence'), { type: 'text', inputmode: 'numeric', size: 26, placeholder: '1, 1, 0, ...' });
    const glyph = ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'];
    const keys = el('div', { class: 'contest-keys' }, glyph.map((g, d) => el('button', { type: 'button', 'aria-label': `${d}`, onclick: () => { inp.value = (inp.value.trim() ? `${inp.value.trim()}, ` : '') + d; } }, [el('b', { text: String(d) }), el('span', { 'aria-hidden': 'true', text: ` ${g}` })])));
    host.append(svg, keys, el('div', { class: 'contest-bar' }, [lab, button(T('Jouer', 'Play'), () => play()), button(T('Effacer', 'Clear'), () => { inp.value = ''; stop(); draw([]); out.textContent = ''; })]));
    const s = 40, grey = new Set(task.grey.map(([r, c]) => `${r},${c}`));
    function draw(trail) {
      svg.setAttribute('viewBox', `0 0 ${task.cols * s + 2} ${task.rows * s + 2}`); svg.replaceChildren();
      for (let r = 0; r < task.rows; r++) for (let c = 0; c < task.cols; c++) svg.append(sv('rect', { x: 1 + c * s, y: 1 + r * s, width: s, height: s, class: `cg-cell${grey.has(`${r},${c}`) ? ' is-grey' : ''}` }));
      if (trail.length > 1) svg.append(sv('polyline', { points: trail.map(([r, c]) => `${1 + c * s + s / 2},${1 + r * s + s / 2}`).join(' '), class: 'cg-path' }));
      const [r, c] = trail.length ? trail[trail.length - 1] : task.start;
      svg.append(sv('circle', { cx: 1 + c * s + s / 2, cy: 1 + r * s + s / 2, r: 11, class: 'cg-turbo' }));
    }
    function play() {
      stop();
      const seq = (inp.value.match(/\d/g) || []).map(Number);
      if (!seq.length) { out.textContent = T('Écrivez une suite de chiffres de 0 à 7.', 'Type a sequence of digits from 0 to 7.'); return; }
      const res = M.runVideo(seq); let k = 1;
      const tick = () => { draw(res.trail.slice(0, k)); if (k++ < res.trail.length) later(tick, 260); else verdict(res, seq); };
      tick();
    }
    function verdict(res, seq) {
      out.className = `contest-readout ${res.ok ? 'is-ok' : 'is-no'}`;
      if (res.error === 'digit') out.textContent = T(`Le chiffre ${seq[res.at]} ne désigne aucune direction.`, `Digit ${seq[res.at]} is no direction.`);
      else if (res.error) out.textContent = T(`Le pas ${res.at + 1} sort du chemin gris.`, `Step ${res.at + 1} leaves the grey path.`);
      else if (res.ok) out.textContent = T('Tour complet dans le sens des aiguilles d’une montre, retour au départ : suite validée.', 'Full clockwise tour, back to the start: sequence accepted.');
      else if (!res.back) out.textContent = T('Le personnage reste sur le chemin mais ne revient pas au départ.', 'The character stays on the path but does not come back to the start.');
      else if (!res.all) out.textContent = T('Retour au départ, mais sans passer une fois par chaque case grise.', 'Back to the start, but without visiting each grey square once.');
      else out.textContent = T('Tour complet, mais dans le sens inverse des aiguilles d’une montre.', 'Full tour, but anticlockwise.');
    }
    draw([]);
  },

  // ---- Euclid 2025 question 10: the triangle of coins; tap a small triangle or type T(r, j) moves
  coins({ host, out, T }) {
    let n = 3, moves = [];
    const svg = sv('svg', { class: 'contest-svg', role: 'group' });
    const sel = el('select', { 'aria-label': T('Rangées', 'Rows') }, [2, 3, 4, 5, 6, 7].map((k) => el('option', { value: k, text: T(`${k} rangées`, `${k} rows`) })));
    sel.value = '3'; sel.addEventListener('change', () => { n = Number(sel.value); moves = []; build(); draw(); });
    const [lab, inp] = field(T('Ou tapez les coups', 'Or type the moves'), { type: 'text', size: 30, placeholder: 'T(1,1) T(2,1) ...' });
    host.append(el('div', { class: 'contest-bar' }, [sel, button(T('Annuler', 'Undo'), () => { moves.pop(); draw(); }), button(T('Recommencer', 'Start again'), () => { moves = []; inp.value = ''; draw(); })]), svg,
      el('div', { class: 'contest-bar' }, [lab, button(T('Jouer', 'Play'), () => { moves = M.parseCoinMoves(inp.value); draw(); })]));
    const s0 = 56, h0 = 48, pos = (r, i) => [s0 * (i - (r + 1) / 2) + s0 * (n + 1) / 2, h0 * r - h0 / 2 + 8];
    let coinEls = new Map();
    function build() {
      const W = s0 * (n + 1), H = h0 * n + 16; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.replaceChildren(); coinEls = new Map();
      svg.setAttribute('aria-label', T(`Triangle de ${n} rangées de pièces`, `Triangle of ${n} rows of coins`));
      for (const [r, j] of M.coinMoves(n)) {
        const pts = M.coinMove(r, j).map(([a, b]) => pos(a, b)), cx = pts.reduce((x, p) => x + p[0], 0) / 3, cy = pts.reduce((x, p) => x + p[1], 0) / 3;
        const shrink = pts.map(([x, y]) => `${cx + (x - cx) * 0.8},${cy + (y - cy) * 0.8}`).join(' ');
        const tri = sv('polygon', { points: shrink, class: 'cg-move', tabindex: 0, role: 'button', 'aria-label': `T(${r},${j})` });
        const act = () => { moves.push([r, j]); draw(); };
        tri.addEventListener('click', act); tri.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
        svg.append(tri);
      }
      for (let r = 1; r <= n; r++) for (let i = 1; i <= r; i++) {
        const [x, y] = pos(r, i), g = sv('g', { class: 'cg-coin' });
        const c = sv('circle', { cx: x, cy: y, r: 14 }), t = sv('text', { x, y: y + 5, 'text-anchor': 'middle' });
        g.append(c, t); svg.append(g); coinEls.set(`${r},${i}`, [g, t]);
      }
    }
    function draw() {
      const tails = M.flipCoins(n, moves);
      if (!tails) { moves = moves.filter(([r, j]) => r >= 1 && r < n && j >= 1 && j <= 2 * r - 1); out.textContent = T('Un coup n’existe pas pour ce nombre de rangées ; il est ignoré.', 'A move does not exist for this number of rows; it is ignored.'); return draw(); }
      for (const [k, [g, t]] of coinEls) { const tl = tails.get(k); g.setAttribute('class', `cg-coin${tl ? ' is-tails' : ''}`); t.textContent = tl ? T('P', 'T') : T('F', 'H'); }
      const won = [...tails.values()].every(Boolean);
      out.className = `contest-readout ${won ? 'is-ok' : ''}`;
      const list = moves.map(([r, j]) => `T(${r},${j})`).join(' ');
      out.textContent = won ? T(`Toutes les pièces sont sur pile en ${moves.length} coup(s) : partie gagnée. ${list}`, `Every coin shows tails after ${moves.length} move(s): the game is won. ${list}`)
        : moves.length ? `${moves.length} ${T('coup(s)', 'move(s)')} : ${list}` : T('Toutes les pièces sont sur face.', 'Every coin shows heads.');
    }
    build(); draw();
  },

  // ---- BCC: push the buttons
  buttons({ host, out, T }) {
    let seq = [];
    const gates = el('div', { class: 'contest-gates' }), drop = el('p', { class: 'contest-seq' });
    const bar = el('div', { class: 'contest-bar' }, [...['P', 'Q', 'R'].map((b) => button(b, () => { seq.push(b); draw(); }, 'contest-key')), button(T('Annuler', 'Undo'), () => { seq.pop(); draw(); }), button(T('Recommencer', 'Start again'), () => { seq = []; draw(); })]);
    host.append(gates, bar, drop);
    function draw() {
      const res = M.runButtons(seq);
      if (res.error) seq.pop();
      const left = Object.fromEntries(Object.entries(M.BUTTONS).map(([k, v]) => [k, v.slice(seq.filter((x) => x === k).length)]));
      gates.replaceChildren(...Object.entries(left).map(([k, v]) => el('div', { class: 'contest-gate' }, [el('b', { text: k }), el('span', { text: v.length ? v.join(' · ') : T('vide', 'empty') })])));
      const r = M.runButtons(seq);
      drop.textContent = r.dropped.length ? `${T('Tombées', 'Dropped')} : ${r.dropped.join(', ')}` : '';
      out.className = `contest-readout ${r.increasing ? '' : 'is-no'}`;
      out.textContent = res.error ? T('Plus de boule derrière cette porte.', 'No ball left behind that gate.')
        : !r.dropped.length ? T('Appuyez sur un bouton.', 'Push a button.')
          : r.increasing ? T(`${r.dropped.length} appui(s), ordre croissant respecté.`, `${r.dropped.length} push(es), increasing order kept.`)
            : T('L’ordre croissant est rompu.', 'The increasing order is broken.');
    }
    draw();
  },

  // ---- BCC: eating carrots from a chosen start
  carrots({ host, out, T, later, stop }) {
    const svg = sv('svg', { class: 'contest-svg contest-wide', role: 'img', 'aria-label': T('Quatre parcelles et le lapin', 'Four patches and the rabbit') });
    const acts = M.CARROT_ACTIONS.map((a) => T({ R: 'D', L: 'G', E: 'M' }[a], a)).join(', ');
    host.append(el('p', { class: 'contest-seq', text: `${T('Actions', 'Actions')} : ${acts}` }), svg, el('div', { class: 'contest-bar' }, [0, 1, 2, 3].map((s) => button(T(`Partir de ${s + 1}`, `Start on ${s + 1}`), () => run(s)))));
    function draw(p, eaten) {
      svg.setAttribute('viewBox', '0 0 330 90'); svg.replaceChildren();
      for (let i = 0; i < 4; i++) {
        svg.append(sv('rect', { x: 10 + i * 80, y: 40, width: 70, height: 40, class: 'cg-soil' }));
        if (!eaten.has(i)) svg.append(sv('path', { d: `M${45 + i * 80} 70 l-8 -26 h16 z`, class: 'cg-carrot' }));
        const t = sv('text', { x: 45 + i * 80, y: 92 - 4, 'text-anchor': 'middle', class: 'cg-label' }); t.textContent = String(i + 1); svg.append(t);
      }
      if (p !== null && p >= 0 && p < 4) svg.append(sv('circle', { cx: 45 + p * 80, cy: 22, r: 12, class: 'cg-turbo' }));
    }
    function run(start) {
      stop(); const eaten = new Set(); let p = start, i = 0; draw(p, eaten);
      const tick = () => {
        if (i >= M.CARROT_ACTIONS.length) { out.textContent = T(`Il reste la carotte ${[0, 1, 2, 3].filter((k) => !eaten.has(k)).map((k) => k + 1).join(', ')}.`, `Carrot ${[0, 1, 2, 3].filter((k) => !eaten.has(k)).map((k) => k + 1).join(', ')} is left.`); return; }
        const a = M.CARROT_ACTIONS[i++]; if (a === 'R') p++; else if (a === 'L') p--; else eaten.add(p);
        draw(p, eaten);
        if (p < 0 || p > 3) { out.textContent = T(`Action ${i} : le lapin sort des parcelles. Ce départ est impossible.`, `Action ${i}: the rabbit leaves the patches. This start is impossible.`); return; }
        out.textContent = T(`Action ${i} sur ${M.CARROT_ACTIONS.length}.`, `Action ${i} of ${M.CARROT_ACTIONS.length}.`);
        later(tick, 450);
      };
      later(tick, 300);
    }
    draw(null, new Set());
  },

  // ---- BCC: lockers, event by event
  lockers({ host, out, T }) {
    let k = 0;
    const grid = el('div', { class: 'contest-lockers' }), events = M.LOCKER_EVENTS;
    const say = ([kind, x]) => (kind === 'pick' ? T(`retrait du casier ${x}`, `pick-up from locker ${x}`) : T({ small: 'arrivée d’un petit colis', medium: 'arrivée d’un colis moyen', large: 'arrivée d’un grand colis' }[kind], `a ${kind} package arrives`));
    host.append(grid, el('div', { class: 'contest-bar' }, [button(T('Événement suivant', 'Next event'), () => { if (k < events.length) k++; draw(); }), button(T('Recommencer', 'Start again'), () => { k = 0; draw(); })]));
    function draw() {
      const placed = M.runLockers(events.slice(0, k)).placed, taken = new Set(M.LOCKERS.taken);
      let j = 0; for (const [kind, x] of events.slice(0, k)) { if (kind === 'pick') taken.delete(x); else taken.add(placed[j++]); }
      const last = k && events[k - 1][0] !== 'pick' ? placed[placed.length - 1] : null;
      grid.replaceChildren(...[M.LOCKERS.small, M.LOCKERS.medium, M.LOCKERS.large].map((row) => el('div', { class: 'contest-locker-row' }, row.map((x) => el('span', { class: `contest-locker${taken.has(x) ? ' is-taken' : ''}${x === last ? ' is-new' : ''}`, text: x })))));
      out.textContent = k ? T(`Événement ${k} sur ${events.length} : ${say(events[k - 1])}${last ? `, placé en ${last}` : ''}.`, `Event ${k} of ${events.length}: ${say(events[k - 1])}${last ? `, placed in ${last}` : ''}.`) : T('Ouverture de la poste. Les casiers foncés sont occupés.', 'The post office opens. Dark lockers are taken.');
    }
    draw();
  },

  // ---- BCC: trains, commands built with buttons or typed, checked on depot 1
  trains({ host, out, T }) {
    let cmds = [];
    const yard = el('div', { class: 'contest-yard' });
    const [lab, inp] = field(T('Ou tapez la suite', 'Or type the sequence'), { type: 'text', size: 34, placeholder: T('SORT(1) ENTRE(1) ...', 'OUT(1) IN(1) ...') });
    const name = (op, x) => `${op === 'OUT' ? T('SORT', 'OUT') : T('ENTRE', 'IN')}(${x})`;
    const keys = el('div', { class: 'contest-keys' }, [1, 2, 3].flatMap((x) => [['OUT', x], ['IN', x]]).map(([op, x]) => button(name(op, x), () => { cmds.push([op, x]); draw(); })));
    host.append(yard, keys, el('div', { class: 'contest-bar' }, [lab, button(T('Jouer', 'Play'), () => { cmds = M.parseTrainCommands(inp.value); draw(); }), button(T('Annuler', 'Undo'), () => { cmds.pop(); draw(); }), button(T('Recommencer', 'Start again'), () => { cmds = []; inp.value = ''; draw(); })]));
    function draw() {
      const r = M.runTrains(cmds);
      if (r.error) cmds = cmds.slice(0, r.at);
      const shown = M.runTrains(cmds);
      const track = (label, trains) => el('div', { class: 'contest-track' }, [el('b', { text: label }), el('span', { class: 'contest-slots' }, [0, 1, 2].map((i) => el('span', { class: `contest-slot${trains[i] !== undefined ? ' is-train' : ''}`, text: trains[i] !== undefined ? trains[i] : '' })))]);
      yard.replaceChildren(...shown.depots.map((d, i) => track(T(`Dépôt ${i + 1}`, `Depot ${i + 1}`), d)), track(T('Voie principale', 'Main line'), shown.main));
      const list = cmds.map(([op, x]) => name(op, x)).join(' ');
      out.className = `contest-readout ${shown.ok ? 'is-ok' : r.error ? 'is-no' : ''}`;
      out.textContent = r.error ? T(`Commande impossible : ${r.error === 'full' ? 'la destination est pleine' : r.error === 'empty' ? 'il n’y a pas de train à déplacer' : 'dépôt inconnu'}. ${list}`, `Impossible command: ${r.error === 'full' ? 'the destination is full' : r.error === 'empty' ? 'there is no train to move' : 'unknown depot'}. ${list}`)
        : shown.ok ? T(`Le dépôt 1 contient 1, 2 et 3 : suite validée (${cmds.length} commandes).`, `Depot 1 holds 1, 2 and 3: sequence accepted (${cmds.length} commands).`)
          : cmds.length ? `${list}` : T('Composez une suite de commandes.', 'Build a sequence of commands.');
    }
    draw();
  },
};
