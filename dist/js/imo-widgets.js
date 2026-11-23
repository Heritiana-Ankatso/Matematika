// The interactive figures of the IMO papers (#olympiad/imo/<year>-<n>): they let the visitor handle the problem and check
// a command sequence against its rules (moves, lines, tiles). They apply the rules only and never state the answer;
// the models are in imo-models.js (checked by tests/imo-models.test.mjs). Canvases are drawn with canvasIn; every
// canvas action has a form alternative for the keyboard. Bilingual through `lang`.
import { canvasIn, palette } from './object-kit.js';
import { boardMove, boardLegalPairs, boardFinished, boardRandomPlay, sharedSequence, divisorOrbit, divisors, lineThrough, sameLine, isSunny, requiredPoints, linesReport, canAddTile, tilesReport } from './imo-models.js';

const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ints = (s) => (String(s).match(/-?\d+/g) || []).map(Number);
function shell(host, html) { host.classList.add('imo-figure'); host.insertAdjacentHTML('beforeend', html); return host; }
const fmtN = (n, en) => (en ? String(n) : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '));

// ---- 2026 problem 1: the blackboard (a small board; the problem has 2026 numbers)
function blackboard(host, en) {
  const T = (fr, e) => (en ? e : fr);
  shell(host, `<div class="imo-controls"><label>${T('Entiers supérieurs à 1, séparés par des espaces', 'Integers above 1, separated by spaces')} <input class="imo-in" value="12 18 20 35 9" inputmode="numeric" size="26"></label>
<button class="btn btn-quiet" data-a="load">${T('Écrire au tableau', 'Write on the board')}</button></div>
<div class="imo-chips" role="group" aria-label="${T('Tableau', 'Blackboard')}"></div>
<div class="imo-controls"><button class="btn btn-quiet" data-a="random">${T('Jouer au hasard jusqu’au bout', 'Play at random to the end')}</button><button class="btn btn-quiet" data-a="undo">${T('Annuler', 'Undo')}</button><button class="btn btn-quiet" data-a="reset">${T('Recommencer', 'Start again')}</button></div>
<p class="olymp-readout" aria-live="polite"></p><ol class="imo-log"></ol>`);
  const chips = host.querySelector('.imo-chips'), read = host.querySelector('.olymp-readout'), log = host.querySelector('.imo-log'), input = host.querySelector('.imo-in');
  let start = [12, 18, 20, 35, 9], hist = [start.slice()], moves = [], picked = -1;
  const board = () => hist[hist.length - 1];
  function draw(msg) {
    const b = board();
    chips.innerHTML = b.map((x, i) => `<button class="imo-chip${picked === i ? ' is-picked' : ''}" data-i="${i}" ${x > 1 ? '' : 'disabled'} aria-pressed="${picked === i}">${E(fmtN(x, en))}</button>`).join('');
    log.innerHTML = moves.map(([i, j], k) => `<li>${T('Choix', 'Chose')} ${E(fmtN(hist[k][i], en))} ${T('et', 'and')} ${E(fmtN(hist[k][j], en))} → ${E(fmtN(hist[k + 1][i], en))}, ${E(fmtN(hist[k + 1][j], en))}</li>`).join('');
    const big = b.filter((x) => x > 1);
    read.textContent = msg || (boardFinished(b)
      ? T(`Plus aucun coup n’est possible. Entiers supérieurs à 1 restants : ${big.length}${big.length === 1 ? ` (M = ${fmtN(big[0], en)})` : ''}. ${moves.length} mouvements.`, `No move is possible any more. Integers above 1 left: ${big.length}${big.length === 1 ? ` (M = ${fmtN(big[0], en)})` : ''}. ${moves.length} moves.`)
      : T('Choisissez deux entiers supérieurs à 1 : ils sont remplacés par leur pgcd et par ppcm ÷ pgcd.', 'Choose two integers above 1: they are replaced by their gcd and by lcm ÷ gcd.'));
  }
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-i]'); if (!b) return; const i = Number(b.dataset.i);
    if (picked < 0) { picked = i; draw(T('Choisissez un second entier, à un autre endroit du tableau.', 'Now choose a second integer, in a different place.')); return; }
    if (picked === i) { picked = -1; draw(); return; }
    const nxt = boardMove(board(), picked, i); if (nxt) { moves.push([picked, i]); hist.push(nxt); } picked = -1; draw();
  });
  host.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'load') { const v = ints(input.value).filter((x) => x > 1 && x < 1000).slice(0, 12); if (v.length >= 2) { start = v; hist = [start.slice()]; moves = []; picked = -1; draw(); } else draw(T('Écrivez au moins deux entiers entre 2 et 999.', 'Write at least two integers between 2 and 999.')); }
    if (a === 'reset') { hist = [start.slice()]; moves = []; picked = -1; draw(); }
    if (a === 'undo' && moves.length) { moves.pop(); hist.pop(); picked = -1; draw(); }
    if (a === 'random') { const p = boardRandomPlay(board()); let cur = board(); p.moves.forEach(([i, j]) => { cur = boardMove(cur, i, j); moves.push([i, j]); hist.push(cur); }); picked = -1; draw(); }
  });
  draw();
  return { destroy() { host.innerHTML = ''; } };
}

// ---- 2026 problem 6: the sequence of numbers sharing a factor with all earlier ones
function sharedFactor(host, en) {
  const T = (fr, e) => (en ? e : fr);
  shell(host, `<div class="imo-controls"><label>${T('Premier terme \\(a_1\\) (entier ≥ 2)', 'First term \\(a_1\\) (integer ≥ 2)')} <input class="imo-in" value="6" inputmode="numeric" size="8"></label>
<label>${T('Nombre de termes', 'Number of terms')} <select class="imo-len"><option>20</option><option selected>40</option><option>80</option></select></label><button class="btn btn-quiet">${T('Calculer', 'Compute')}</button></div>
<div class="imo-scroll"></div><p class="olymp-readout" aria-live="polite"></p>`);
  const out = host.querySelector('.imo-scroll'), read = host.querySelector('.olymp-readout'), input = host.querySelector('.imo-in'), sel = host.querySelector('.imo-len');
  function run() {
    const a1 = ints(input.value)[0], len = Number(sel.value);
    if (!Number.isInteger(a1) || a1 < 2 || a1 > 100000) { out.innerHTML = ''; read.textContent = T('Entrez un entier entre 2 et 100 000.', 'Enter an integer between 2 and 100,000.'); return; }
    const t = sharedSequence(a1, len);
    out.innerHTML = `<table class="imo-table"><thead><tr><th scope="row">n</th>${t.map((_, i) => `<th>${i + 1}</th>`).join('')}</tr></thead><tbody><tr><th scope="row">\\(a_n\\)</th>${t.map((x) => `<td>${fmtN(x, en)}</td>`).join('')}</tr><tr><th scope="row">\\(a_{n+1}-a_n\\)</th>${t.map((x, i) => `<td>${i + 1 < t.length ? fmtN(t[i + 1] - x, en) : ''}</td>`).join('')}</tr></tbody></table>`;
    read.textContent = T('Regardez la ligne des différences. Essayez un nombre premier, une puissance de 2, un produit de deux premiers.', 'Look at the row of differences. Try a prime, a power of 2, a product of two primes.');
    host.dispatchEvent(new CustomEvent('imo-typeset', { bubbles: true }));
  }
  host.querySelector('button').addEventListener('click', run); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  run();
  return { destroy() { host.innerHTML = ''; } };
}

// ---- 2025 problem 4: the three largest proper divisors
function properDivisors(host, en) {
  const T = (fr, e) => (en ? e : fr);
  shell(host, `<div class="imo-controls"><label>${T('Premier terme \\(a_1\\)', 'First term \\(a_1\\)')} <input class="imo-in" value="72" inputmode="numeric" size="12"></label><button class="btn btn-quiet">${T('Calculer', 'Compute')}</button></div>
<ol class="imo-log"></ol><p class="olymp-readout" aria-live="polite"></p>`);
  const log = host.querySelector('.imo-log'), read = host.querySelector('.olymp-readout'), input = host.querySelector('.imo-in');
  function run() {
    const a1 = ints(input.value)[0];
    if (!Number.isInteger(a1) || a1 < 1 || a1 > 1e9) { log.innerHTML = ''; read.textContent = T('Entrez un entier entre 1 et 1 000 000 000.', 'Enter an integer between 1 and 1,000,000,000.'); return; }
    const { terms, status } = divisorOrbit(a1, 40);
    log.innerHTML = terms.map((x) => { const d = divisors(x).filter((y) => y !== x), top = d.slice(-3).reverse(); return `<li>${fmtN(x, en)}${top.length >= 3 ? ` : ${top.map((y) => fmtN(y, en)).join(' + ')} = ${fmtN(top[0] + top[1] + top[2], en)}` : ` : ${T('moins de trois diviseurs stricts', 'fewer than three proper divisors')}`}</li>`; }).join('');
    read.textContent = { stops: T('La suite s’arrête : le dernier terme a moins de trois diviseurs stricts, donc cette valeur de \\(a_1\\) est impossible.', 'The sequence stops: the last term has fewer than three proper divisors, so this value of \\(a_1\\) is impossible.'),
      constant: T('Le dernier terme est sa propre image : la suite est constante à partir de là.', 'The last term is its own image: the sequence is constant from there on.'),
      running: T('La suite continue après 40 termes sans s’arrêter ni se stabiliser (pour l’instant).', 'The sequence goes on past 40 terms without stopping or settling (so far).'),
      large: T('Les termes dépassent \\(10^{12}\\) : le calcul s’arrête.', 'The terms pass \\(10^{12}\\): the computation stops.') }[status];
    host.dispatchEvent(new CustomEvent('imo-typeset', { bubbles: true }));
  }
  host.querySelector('button').addEventListener('click', run); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  run();
  return { destroy() { host.innerHTML = ''; } };
}

// ---- 2025 problem 1: lines through the points (a, b), a + b <= n + 1
function sunnyLines(host, en) {
  const T = (fr, e) => (en ? e : fr);
  shell(host, `<div class="imo-controls"><label>n <select class="imo-n">${[3, 4, 5, 6, 7, 8].map((n) => `<option${n === 3 ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
<button class="btn btn-quiet" data-a="undo">${T('Annuler la dernière droite', 'Undo last line')}</button><button class="btn btn-quiet" data-a="clear">${T('Effacer', 'Clear')}</button></div>
<div class="imo-canvas"></div>
<div class="imo-controls"><label>${T('Ou, au clavier : deux points « x1,y1 x2,y2 »', 'Or by keyboard: two points “x1,y1 x2,y2”')} <input class="imo-in" placeholder="1,1 2,3" size="14"></label><button class="btn btn-quiet" data-a="add">${T('Ajouter la droite', 'Add the line')}</button></div>
<p class="olymp-readout" aria-live="polite"></p>`);
  const cvHost = host.querySelector('.imo-canvas'), read = host.querySelector('.olymp-readout'), sel = host.querySelector('.imo-n'), input = host.querySelector('.imo-in');
  const o = canvasIn(cvHost, 4 / 3, { navigation: false });
  let n = 3, lines = [], first = null, note = '';
  const geo = () => { const m = n + 2, c = Math.min((o.W - 70) / m, (o.H - 70) / m); return { m, c, x0: 44, y0: o.H - 40 }; };
  const toPx = ([x, y]) => { const g = geo(); return [g.x0 + x * g.c, g.y0 - y * g.c]; };
  function draw() {
    const p = palette(), g = o.g, G = geo(); g.clearRect(0, 0, o.W, o.H); g.font = '13px system-ui, sans-serif';
    const rep = linesReport(n, lines), bad = new Set(rep.uncovered.map((q) => q.join()));
    // axes and the line x + y = n + 1 (the triangle's boundary), faint
    g.strokeStyle = p.grid; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= G.m; i++) { const a = toPx([i, 0]), b = toPx([i, G.m]), c = toPx([0, i]), d = toPx([G.m, i]); g.moveTo(...a); g.lineTo(...b); g.moveTo(...c); g.lineTo(...d); } g.stroke();
    lines.forEach((l) => {
      const pts = []; const lo = 0, hi = G.m;
      if (l.b !== 0) [lo, hi].forEach((x) => { const y = (l.c - l.a * x) / l.b; if (y >= lo - 1e-9 && y <= hi + 1e-9) pts.push([x, y]); });
      if (l.a !== 0) [lo, hi].forEach((y) => { const x = (l.c - l.b * y) / l.a; if (x >= lo - 1e-9 && x <= hi + 1e-9) pts.push([x, y]); });
      if (pts.length >= 2) { g.strokeStyle = isSunny(l) ? p.obj2 : p.object; g.lineWidth = 2.5; g.setLineDash(isSunny(l) ? [8, 5] : []); g.beginPath(); g.moveTo(...toPx(pts[0])); g.lineTo(...toPx(pts[pts.length - 1])); g.stroke(); g.setLineDash([]); }
    });
    for (let x = 0; x <= G.m; x++) for (let y = 0; y <= G.m; y++) {
      const need = x >= 1 && y >= 1 && x + y <= n + 1, [px, py] = toPx([x, y]);
      g.fillStyle = need ? (bad.has(`${x},${y}`) ? p.neg : p.ink) : p.muted; g.globalAlpha = need ? 1 : 0.45;
      g.beginPath(); g.arc(px, py, need ? 6 : 3, 0, 7); g.fill(); g.globalAlpha = 1;
      if (first && first[0] === x && first[1] === y) { g.strokeStyle = p.ink; g.lineWidth = 2; g.beginPath(); g.arc(px, py, 11, 0, 7); g.stroke(); }
    }
    g.fillStyle = p.muted; for (let i = 1; i <= G.m; i++) { g.fillText(String(i), toPx([i, 0])[0] - 3, G.y0 + 16); g.fillText(String(i), G.x0 - 16, toPx([0, i])[1] + 4); }
    read.textContent = (note ? note + ' ' : '') + T(`${rep.count} droite${rep.count > 1 ? 's' : ''} sur ${n} demandées, dont ${rep.sunny} ensoleillée${rep.sunny > 1 ? 's' : ''} (en pointillés). ${rep.uncovered.length ? `Points non couverts : ${rep.uncovered.length} (en rouge).` : 'Tous les points sont couverts.'}${rep.ok ? ` Valide : ${n} droites couvrent tous les points avec ${rep.sunny} ensoleillée${rep.sunny > 1 ? 's' : ''}.` : ''}`,
      `${rep.count} line${rep.count > 1 ? 's' : ''} of the ${n} required, ${rep.sunny} sunny (dashed). ${rep.uncovered.length ? `Uncovered points: ${rep.uncovered.length} (in red).` : 'Every point is covered.'}${rep.ok ? ` Valid: ${n} lines cover every point with ${rep.sunny} sunny.` : ''}`);
  }
  const add = (p, q) => { const l = lineThrough(p, q); if (!l) { note = T('Deux points distincts sont nécessaires.', 'Two distinct points are needed.'); return; } if (lines.some((m) => sameLine(m, l))) { note = T('Cette droite est déjà tracée : les droites doivent être distinctes.', 'That line is already drawn: the lines must be distinct.'); return; } lines.push(l); note = ''; };
  o.cv.addEventListener('pointerdown', (e) => {
    const [mx, my] = o.point(e), G = geo(); let best = null, d = 20;
    for (let x = 0; x <= G.m; x++) for (let y = 0; y <= G.m; y++) { const [px, py] = toPx([x, y]), k = Math.hypot(px - mx, py - my); if (k < d) { d = k; best = [x, y]; } }
    if (!best) return; if (!first) { first = best; note = ''; } else { add(first, best); first = null; } draw(); e.preventDefault();
  });
  o.touchHit(() => true); o.redraw = draw;
  sel.addEventListener('change', () => { n = Number(sel.value); lines = []; first = null; note = ''; draw(); });
  host.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'undo') { lines.pop(); first = null; note = ''; }
    if (a === 'clear') { lines = []; first = null; note = ''; }
    if (a === 'add') { const v = ints(input.value); if (v.length === 4) add([v[0], v[1]], [v[2], v[3]]); else note = T('Écrivez quatre nombres : x1,y1 x2,y2.', 'Write four numbers: x1,y1 x2,y2.'); }
    draw();
  });
  o.cv.setAttribute('role', 'img'); o.cv.setAttribute('aria-label', T('Réseau de points : cliquez deux points pour tracer la droite qui les joint (ou utilisez le champ au clavier).', 'Grid of points: click two points to draw the line through them (or use the keyboard field).'));
  draw();
  return { destroy() { o.stopTouch?.(); o.disconnect?.(); host.innerHTML = ''; } };
}

// ---- 2025 problem 6: rectangular tiles on a small grid
function tiles(host, en) {
  const T = (fr, e) => (en ? e : fr);
  shell(host, `<div class="imo-controls"><label>${T('Taille \\(n\\) de la grille', 'Grid size \\(n\\)')} <select class="imo-n">${[3, 4, 5, 6, 7, 8, 9].map((n) => `<option${n === 4 ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
<button class="btn btn-quiet" data-a="undo">${T('Annuler la dernière tuile', 'Undo last tile')}</button><button class="btn btn-quiet" data-a="clear">${T('Effacer', 'Clear')}</button></div>
<div class="imo-canvas"></div>
<div class="imo-controls"><label>${T('Ou, au clavier : « ligne colonne ligne colonne » (coins, à partir de 1)', 'Or by keyboard: “row column row column” (corners, from 1)')} <input class="imo-in" placeholder="1 2 1 4" size="12"></label><button class="btn btn-quiet" data-a="add">${T('Ajouter la tuile', 'Add the tile')}</button></div>
<p class="olymp-readout" aria-live="polite"></p>`);
  const cvHost = host.querySelector('.imo-canvas'), read = host.querySelector('.olymp-readout'), sel = host.querySelector('.imo-n'), input = host.querySelector('.imo-in');
  const o = canvasIn(cvHost, 1, { navigation: false });
  let n = 4, list = [], drag = null, removeAt = null, note = '';
  const geo = () => { const c = (Math.min(o.W, o.H) - 20) / n; return { c, x0: 10, y0: 10 }; };
  const cellAt = (pt) => { const G = geo(), r = Math.floor((pt[1] - G.y0) / G.c), c = Math.floor((pt[0] - G.x0) / G.c); return r >= 0 && c >= 0 && r < n && c < n ? [r, c] : null; };
  const rect = (a, b) => ({ r0: Math.min(a[0], b[0]), c0: Math.min(a[1], b[1]), r1: Math.max(a[0], b[0]), c1: Math.max(a[1], b[1]) });
  function draw() {
    const p = palette(), g = o.g, G = geo(); g.clearRect(0, 0, o.W, o.H);
    list.forEach((t, i) => { g.fillStyle = p.c[i % p.c.length]; g.globalAlpha = 0.55; g.fillRect(G.x0 + t.c0 * G.c, G.y0 + t.r0 * G.c, (t.c1 - t.c0 + 1) * G.c, (t.r1 - t.r0 + 1) * G.c); g.globalAlpha = 1; g.strokeStyle = p.ink; g.lineWidth = 2.5; g.strokeRect(G.x0 + t.c0 * G.c + 1, G.y0 + t.r0 * G.c + 1, (t.c1 - t.c0 + 1) * G.c - 2, (t.r1 - t.r0 + 1) * G.c - 2); });
    if (drag) { const t = rect(drag.from, drag.to), okTile = canAddTile(n, list, t); g.strokeStyle = okTile ? p.object : p.neg; g.setLineDash([6, 4]); g.lineWidth = 2.5; g.strokeRect(G.x0 + t.c0 * G.c + 2, G.y0 + t.r0 * G.c + 2, (t.c1 - t.c0 + 1) * G.c - 4, (t.r1 - t.r0 + 1) * G.c - 4); g.setLineDash([]); }
    g.strokeStyle = p.line; g.lineWidth = 1; g.beginPath(); for (let i = 0; i <= n; i++) { g.moveTo(G.x0 + i * G.c, G.y0); g.lineTo(G.x0 + i * G.c, G.y0 + n * G.c); g.moveTo(G.x0, G.y0 + i * G.c); g.lineTo(G.x0 + n * G.c, G.y0 + i * G.c); } g.stroke();
    const rep = tilesReport(n, list);
    rep.free.forEach(([r, c]) => { g.fillStyle = (rep.rowFree[r] === 1 && rep.colFree[c] === 1) ? p.ink : p.neg; g.beginPath(); g.arc(G.x0 + (c + 0.5) * G.c, G.y0 + (r + 0.5) * G.c, Math.max(4, G.c * 0.14), 0, 7); g.fill(); });
    const rowsOk = rep.rowFree.filter((x) => x === 1).length, colsOk = rep.colFree.filter((x) => x === 1).length;
    read.textContent = (note ? note + ' ' : '') + T(`${rep.count} tuile${rep.count > 1 ? 's' : ''}. Lignes avec exactement une case libre : ${rowsOk} sur ${n}. Colonnes : ${colsOk} sur ${n}. Cases libres : points.${rep.ok ? ` Valide : chaque ligne et chaque colonne a exactement une case libre, avec ${rep.count} tuile${rep.count > 1 ? 's' : ''}.` : ''}`,
      `${rep.count} tile${rep.count > 1 ? 's' : ''}. Rows with exactly one free square: ${rowsOk} of ${n}. Columns: ${colsOk} of ${n}. Free squares: dots.${rep.ok ? ` Valid: every row and column has exactly one free square, using ${rep.count} tile${rep.count > 1 ? 's' : ''}.` : ''}`);
  }
  const tryAdd = (t) => { if (canAddTile(n, list, t)) { list.push(t); note = ''; } else note = T('Cette tuile sort de la grille ou en recouvre une autre.', 'That tile leaves the grid or overlaps another.'); };
  const tileAt = (cell) => list.findIndex((t) => cell[0] >= t.r0 && cell[0] <= t.r1 && cell[1] >= t.c0 && cell[1] <= t.c1);
  o.cv.addEventListener('pointerdown', (e) => { const cell = cellAt(o.point(e)); if (!cell) return; o.cv.setPointerCapture(e.pointerId); const k = tileAt(cell); if (k >= 0) removeAt = k; else drag = { from: cell, to: cell }; draw(); e.preventDefault(); });
  o.cv.addEventListener('pointermove', (e) => { if (!drag) return; const cell = cellAt(o.point(e)); if (cell) { drag.to = cell; draw(); } });
  o.cv.addEventListener('pointerup', (e) => {
    if (drag) { tryAdd(rect(drag.from, drag.to)); drag = null; }
    else if (removeAt !== null) { const cell = cellAt(o.point(e)); if (cell && tileAt(cell) === removeAt) { list.splice(removeAt, 1); note = ''; } removeAt = null; }
    draw();
  });
  o.touchHit(() => true); o.redraw = draw;
  sel.addEventListener('change', () => { n = Number(sel.value); list = []; note = ''; draw(); });
  host.addEventListener('click', (e) => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'undo') { list.pop(); note = ''; }
    if (a === 'clear') { list = []; note = ''; }
    if (a === 'add') { const v = ints(input.value); if (v.length === 4) tryAdd(rect([v[0] - 1, v[1] - 1], [v[2] - 1, v[3] - 1])); else note = T('Écrivez quatre nombres : ligne colonne ligne colonne.', 'Write four numbers: row column row column.'); }
    draw();
  });
  o.cv.setAttribute('role', 'img'); o.cv.setAttribute('aria-label', T('Grille : faites glisser pour tracer une tuile rectangulaire, cliquez une tuile pour la retirer (ou utilisez le champ au clavier).', 'Grid: drag to draw a rectangular tile, click a tile to remove it (or use the keyboard field).'));
  draw();
  return { destroy() { o.stopTouch?.(); o.disconnect?.(); host.innerHTML = ''; } };
}

const FIGURES = { blackboard, sharedFactor, properDivisors, sunnyLines, tiles };
export const mountImoFigure = (kind, host, lang) => FIGURES[kind](host, lang === 'en');
