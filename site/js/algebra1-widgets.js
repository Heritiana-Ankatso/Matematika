// Algèbre 1: interactive figures mounted in the university lesson pages (elements [data-a1-widget="<name>"]).
import * as M from './algebra1-model.js';

const SVG = 'http://www.w3.org/2000/svg';
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const svgEl = (name, attrs = {}) => { const e = document.createElementNS(SVG, name); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); return e; };
const sub = n => String(n).replace(/\d/g, d => '₀₁₂₃₄₅₆₇₈₉'[d]);
const sup = n => String(n).replace(/-/g, '⁻').replace(/\d/g, d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]);
let uid = 0;

function frame(root, title, intro) {
  root.classList.add('a1w');
  root.innerHTML = `<header class="a1w-head"><p class="a1w-kicker">Manipuler</p><h3>${esc(title)}</h3><p>${intro}</p></header><div class="a1w-body"></div>`;
  return root.querySelector('.a1w-body');
}
const status = (ok, text) => `<span class="a1w-status ${ok ? 'is-yes' : 'is-no'}">${ok ? '✓' : '✗'} ${text}</span>`;

// ------------------------------------------------------------------ 1. sets and Venn diagrams
function venn(root) {
  const body = frame(root, 'Opérations ensemblistes et diagrammes de Venn',
    'Tape une expression en A, B, C (U désigne l’ensemble de référence). Les huit régions du diagramme sont les huit lignes d’une table de vérité : deux expressions qui colorient les mêmes régions sont égales <em>pour tous</em> les ensembles A, B, C.');
  const id = 'v' + (++uid);
  body.innerHTML = `
  <div class="a1w-grid">
    <div><svg class="a1w-venn" viewBox="0 0 320 250" role="img" aria-labelledby="${id}-desc"><desc id="${id}-desc">Diagramme de Venn de trois ensembles, régions coloriées selon l’expression.</desc></svg>
      <p class="a1w-legend"><span class="a1w-sw a1w-sw1"></span> expression 1 <span class="a1w-sw a1w-sw2"></span> expression 2 (contour)</p></div>
    <div class="a1w-controls">
      <label>Expression 1 <input id="${id}-e1" value="(A ∪ B)ᶜ" autocomplete="off" spellcheck="false"></label>
      <label>Expression 2 <input id="${id}-e2" value="Aᶜ ∩ Bᶜ" autocomplete="off" spellcheck="false"></label>
      <div class="a1w-keys" role="group" aria-label="Insérer un symbole">${['∪', '∩', '∖', 'ᶜ', 'Δ', '(', ')', 'A', 'B', 'C', 'U', '∅'].map(k => `<button type="button" data-k="${k}">${k}</button>`).join('')}</div>
      <div class="a1w-out" aria-live="polite"></div>
      <details><summary>Ensembles concrets</summary>
        <p class="a1w-small">Ensemble de référence U = {1, …, 12}. Modifie A, B, C (nombres séparés par des virgules).</p>
        <label>A <input id="${id}-A" value="1, 2, 3, 4, 5, 6"></label><label>B <input id="${id}-B" value="2, 4, 6, 8, 10, 12"></label><label>C <input id="${id}-C" value="3, 6, 9, 12"></label>
        <div class="a1w-out2"></div></details>
      <div class="a1w-presets" role="group" aria-label="Exemples">
        <button type="button" data-p="(A ∪ B)ᶜ|Aᶜ ∩ Bᶜ">De Morgan</button>
        <button type="button" data-p="A ∩ (B ∪ C)|(A ∩ B) ∪ (A ∩ C)">Distributivité</button>
        <button type="button" data-p="A ∖ B|A ∩ Bᶜ">Différence</button>
        <button type="button" data-p="A ∖ (B ∩ C)|(A ∖ B) ∩ (A ∖ C)">Piège</button>
        <button type="button" data-p="A Δ B|(A ∪ B) ∖ (A ∩ B)">Différence symétrique</button>
      </div>
    </div>
  </div>`;
  const svg = body.querySelector('svg'), e1 = body.querySelector(`#${id}-e1`), e2 = body.querySelector(`#${id}-e2`);
  const C = [[125, 100, 'A'], [195, 100, 'B'], [160, 160, 'C']], R = 68;
  svg.append(svgEl('rect', { x: 4, y: 4, width: 312, height: 242, class: 'a1w-universe' }));
  const t = svgEl('text', { x: 14, y: 24, class: 'a1w-lab' }); t.textContent = 'U'; svg.append(t);
  // Exact regions: region r = (inside the circles of r) ∩ (outside the others), by nested clip paths and a mask.
  const defs = svgEl('defs'); svg.append(defs);
  C.forEach(([cx, cy], k) => { const cp = svgEl('clipPath', { id: `${id}-c${k}` }); cp.append(svgEl('circle', { cx, cy, r: R })); defs.append(cp); });
  const layer1 = svgEl('g'), layer2 = svgEl('g');
  svg.append(layer1, layer2);
  const region = (r, cls) => {
    const mask = svgEl('mask', { id: `${id}-${cls}-m${r}` });
    mask.append(svgEl('rect', { x: 4, y: 4, width: 312, height: 242, fill: '#fff' }));
    C.forEach(([cx, cy], k) => { if (!((r >> k) & 1)) mask.append(svgEl('circle', { cx, cy, r: R, fill: '#000' })); });
    defs.append(mask);
    let node = svgEl('rect', { x: 4, y: 4, width: 312, height: 242, mask: `url(#${id}-${cls}-m${r})`, class: cls });
    C.forEach((_, k) => { if ((r >> k) & 1) { const g = svgEl('g', { 'clip-path': `url(#${id}-c${k})` }); g.append(node); node = g; } });
    return node;
  };
  const fills = [...Array(8)].map((_, r) => { const n = region(r, 'a1w-region'); layer1.append(n); return n.tagName === 'rect' ? n : n.querySelector('rect'); });
  const outs = [...Array(8)].map((_, r) => { const n = region(r, 'a1w-region2'); layer2.append(n); return n.tagName === 'rect' ? n : n.querySelector('rect'); });
  for (const [cx, cy, name] of C) {
    svg.append(svgEl('circle', { cx, cy, r: R, class: 'a1w-circle' }));
    const l = svgEl('text', { x: cx + (name === 'A' ? -52 : name === 'B' ? 44 : -4), y: cy + (name === 'C' ? 64 : -46), class: 'a1w-lab' }); l.textContent = name; svg.append(l);
  }
  let focus = e1;
  [e1, e2].forEach(e => e.addEventListener('focus', () => { focus = e; }));
  body.querySelector('.a1w-keys').addEventListener('click', ev => {
    const k = ev.target.closest('button')?.dataset.k; if (!k) return;
    const s = focus.selectionStart ?? focus.value.length, en = focus.selectionEnd ?? s;
    focus.value = focus.value.slice(0, s) + k + focus.value.slice(en); focus.focus(); focus.setSelectionRange(s + k.length, s + k.length); update();
  });
  body.querySelector('.a1w-presets').addEventListener('click', ev => { const p = ev.target.closest('button')?.dataset.p; if (!p) return; [e1.value, e2.value] = p.split('|'); update(); });
  body.querySelectorAll('input').forEach(i => i.addEventListener('input', update));
  const list = s => s.split(/[,;\s]+/).filter(Boolean).map(Number).filter(x => Number.isInteger(x) && x >= 1 && x <= 12);
  function update() {
    const out = body.querySelector('.a1w-out'), out2 = body.querySelector('.a1w-out2');
    let m1 = null, m2 = null, err = '';
    try { m1 = M.setMask(M.parseSetExpr(e1.value)); } catch (e) { err += `<p class="a1w-err">Expression 1 : ${esc(e.message)}</p>`; }
    try { m2 = M.setMask(M.parseSetExpr(e2.value)); } catch (e) { err += `<p class="a1w-err">Expression 2 : ${esc(e.message)}</p>`; }
    fills.forEach((p, r) => p.classList.toggle('is-on', m1 !== null && !!((m1 >> r) & 1)));
    outs.forEach((p, r) => p.classList.toggle('is-on', m2 !== null && !!((m2 >> r) & 1)));
    let html = err;
    if (m1 !== null && m2 !== null) {
      if (m1 === m2) html += `<p>${status(true, 'Les deux expressions colorient les mêmes régions : elles sont égales quels que soient A, B, C.')}</p>`;
      else {
        const r = [...Array(8).keys()].find(k => ((m1 ^ m2) >> k) & 1);
        html += `<p>${status(false, 'Les expressions diffèrent.')}</p><p class="a1w-small">Contre-exemple : un élément avec <strong>${M.regionText(r)}</strong> appartient à l’expression ${(m1 >> r) & 1 ? 1 : 2} mais pas à l’autre. Pour un contre-exemple explicite, prends A, B, C de façon que cette région contienne un seul élément.</p>`;
      }
    }
    out.innerHTML = html;
    const U = [...Array(12).keys()].map(x => x + 1), [A, B, Cc] = ['A', 'B', 'C'].map(s => list(body.querySelector(`#${id}-${s}`).value));
    out2.innerHTML = [m1, m2].map((m, i) => m === null ? '' : `<p>Expression ${i + 1} = {${M.elementsOf(m, U, A, B, Cc).join(', ')}}</p>`).join('');
  }
  update();
}

// ------------------------------------------------------------------ 2. finite maps
function maps(root) {
  const body = frame(root, 'Injective, surjective, bijective ?',
    'Clique sur un élément de E, puis sur un élément de F pour changer sa flèche. Coche une partie A de E et une partie B de F pour lire f(A), f⁻¹(B), f⁻¹(f(A)) et f(f⁻¹(B)).');
  const id = 'm' + (++uid);
  let m = 4, p = 4, f = [0, 1, 1, 3], picked = null, A = new Set([1]), B = new Set([1, 2]);
  body.innerHTML = `<div class="a1w-grid"><div><svg class="a1w-map" viewBox="0 0 300 260" role="img" aria-label="Diagramme sagittal de f de E dans F"></svg>
    <div class="a1w-row"><label>|E| <input type="number" id="${id}-m" min="1" max="6" value="4"></label><label>|F| <input type="number" id="${id}-p" min="1" max="6" value="4"></label></div></div>
    <div class="a1w-controls"><div class="a1w-out" aria-live="polite"></div>
    <fieldset><legend>Partie A de E</legend><div id="${id}-A" class="a1w-checks"></div></fieldset>
    <fieldset><legend>Partie B de F</legend><div id="${id}-B" class="a1w-checks"></div></fieldset>
    <div class="a1w-out2"></div></div></div>`;
  const svg = body.querySelector('svg'), E = i => `${i + 1}`, F = j => 'abcdef'[j];
  const pos = (side, i, k) => [side ? 230 : 70, 30 + (i + .5) * (200 / k)];
  function draw() {
    svg.replaceChildren();
    svg.append(svgEl('defs', {}));
    svg.querySelector('defs').innerHTML = `<marker id="${id}-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" class="a1w-arrowhead"/></marker>`;
    for (const [side, k, lab] of [[0, m, 'E'], [1, p, 'F']]) {
      const [x] = pos(side, 0, k);
      svg.append(svgEl('ellipse', { cx: x, cy: 130, rx: 44, ry: 112, class: 'a1w-blob' }));
      const t = svgEl('text', { x, y: 16, class: 'a1w-lab', 'text-anchor': 'middle' }); t.textContent = lab; svg.append(t);
    }
    f.forEach((y, x) => { const [x1, y1] = pos(0, x, m), [x2, y2] = pos(1, y, p); svg.append(svgEl('line', { x1: x1 + 12, y1, x2: x2 - 14, y2, class: 'a1w-arrow' + (A.has(x) ? ' is-hot' : ''), 'marker-end': `url(#${id}-ar)` })); });
    const node = (side, i, k, label, hot, sel) => {
      const [x, y] = pos(side, i, k), g = svgEl('g', { class: 'a1w-node' + (hot ? ' is-hot' : '') + (sel ? ' is-sel' : ''), tabindex: 0, role: 'button', 'aria-label': (side ? 'F ' : 'E ') + label });
      g.append(svgEl('circle', { cx: x, cy: y, r: 13 }));
      const t = svgEl('text', { x, y: y + 5, 'text-anchor': 'middle' }); t.textContent = label; g.append(t);
      const act = () => { if (!side) picked = picked === i ? null : i; else if (picked !== null) { f[picked] = i; picked = null; } draw(); };
      g.addEventListener('click', act); g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
      svg.append(g);
    };
    for (let i = 0; i < m; i++) node(0, i, m, E(i), A.has(i), picked === i);
    for (let j = 0; j < p; j++) node(1, j, p, F(j), B.has(j), false);
    report();
  }
  const setText = (xs, lab) => '{' + xs.map(lab).join(', ') + '}';
  function report() {
    const info = M.mapInfo(f, p);
    body.querySelector('.a1w-out').innerHTML = `<p>${status(info.injective, 'injective')} ${status(info.surjective, 'surjective')} ${status(info.bijective, 'bijective')}</p>
      <p class="a1w-small">${info.injective ? 'Deux éléments distincts de E ont des images distinctes.' : `Non injective : f(${E(info.collision[0])}) = f(${E(info.collision[1])}) = ${F(f[info.collision[0]])} avec ${E(info.collision[0])} ≠ ${E(info.collision[1])}.`}
      ${info.surjective ? 'Tout élément de F a au moins un antécédent.' : `Non surjective : ${F(info.missed)} n’a pas d’antécédent.`}</p>
      ${picked !== null ? `<p class="a1w-small">Choisis maintenant l’image de ${E(picked)} dans F.</p>` : ''}`;
    const a = [...A].sort(), b = [...B].sort(), fa = M.directImage(f, a), fib = M.preimage(f, b), ffa = M.preimage(f, fa), ffib = M.directImage(f, fib);
    body.querySelector('.a1w-out2').innerHTML = `<table class="a1w-table"><tbody>
      <tr><th>f(A)</th><td>${setText(fa, F)}</td></tr><tr><th>f⁻¹(B)</th><td>${setText(fib, E)}</td></tr>
      <tr><th>f⁻¹(f(A))</th><td>${setText(ffa, E)} ${ffa.length === a.length ? '= A' : '⊋ A : un élément hors de A a la même image qu’un élément de A'}</td></tr>
      <tr><th>f(f⁻¹(B))</th><td>${setText(ffib, F)} ${ffib.length === b.length ? '= B' : '= B ∩ Im f ⊊ B'}</td></tr></tbody></table>`;
  }
  function checks() {
    for (const [key, k, set, lab] of [['A', m, A, E], ['B', p, B, F]]) {
      const box = body.querySelector(`#${id}-${key}`);
      box.innerHTML = [...Array(k).keys()].map(i => `<label><input type="checkbox" value="${i}" ${set.has(i) ? 'checked' : ''}> ${lab(i)}</label>`).join('');
      box.onchange = e => { const v = Number(e.target.value); e.target.checked ? set.add(v) : set.delete(v); draw(); };
    }
  }
  const resize = () => {
    m = Math.max(1, Math.min(6, Number(body.querySelector(`#${id}-m`).value) || 1)); p = Math.max(1, Math.min(6, Number(body.querySelector(`#${id}-p`).value) || 1));
    f = [...Array(m).keys()].map(i => Math.min(f[i] ?? i, p - 1)); A = new Set([...A].filter(x => x < m)); B = new Set([...B].filter(x => x < p)); picked = null; checks(); draw();
  };
  body.querySelector(`#${id}-m`).addEventListener('input', resize); body.querySelector(`#${id}-p`).addEventListener('input', resize);
  checks(); draw();
}

// ------------------------------------------------------------------ 3. Z/nZ: tables, units, Euclid, ideals
function zn(root) {
  const ring = root.dataset.mode === 'ring';
  const body = frame(root, ring ? 'L’anneau ℤ/nℤ : inversibles, diviseurs de zéro, idéaux' : 'Calculer dans ℤ/nℤ',
    ring ? 'Choisis n. Les inversibles sont les classes premières avec n ; les autres classes non nulles sont des diviseurs de zéro. Les idéaux sont les dℤ/nℤ pour d diviseur de n : clique sur l’un d’eux pour le voir dans la table.'
      : 'Choisis n et la loi. Clique sur une classe pour obtenir son inverse par l’algorithme d’Euclide étendu, ou la preuve qu’il n’existe pas.');
  const id = 'z' + (++uid);
  let n = ring ? 12 : 10, op = '×', a = 3, ideal = null;
  body.innerHTML = `<div class="a1w-row"><label>n <input type="number" id="${id}-n" min="2" max="20" value="${n}"></label>
    <div role="group" aria-label="Loi" class="a1w-seg"><button type="button" data-op="+">+</button><button type="button" data-op="×" aria-pressed="true">×</button></div></div>
    <div class="a1w-grid"><div class="a1w-scroll"><table class="a1w-cayley"></table></div><div class="a1w-controls"><div class="a1w-out" aria-live="polite"></div></div></div>`;
  const table = body.querySelector('table'), out = body.querySelector('.a1w-out');
  function draw() {
    const U = new Set(M.units(n)), Z = new Set(M.zeroDivisors(n)), I = ideal ? new Set([...Array(n / ideal).keys()].map(k => k * ideal)) : null;
    const f = op === '+' ? (x, y) => (x + y) % n : (x, y) => (x * y) % n, idx = [...Array(n).keys()];
    table.innerHTML = `<thead><tr><th scope="col">${op}</th>${idx.map(j => `<th scope="col">${j}</th>`).join('')}</tr></thead><tbody>${idx.map(i => `<tr><th scope="row"><button type="button" data-a="${i}" class="${U.has(i) ? 'is-unit' : Z.has(i) ? 'is-zd' : ''}${i === a ? ' is-sel' : ''}">${i}</button></th>${idx.map(j => {
      const v = f(i, j), cls = [(op === '×' && v === 1) || (op === '+' && v === 0) ? 'is-one' : '', op === '×' && v === 0 && i && j ? 'is-zero' : '', I && I.has(v) ? 'is-ideal' : '', i === a ? 'is-row' : ''].filter(Boolean).join(' ');
      return `<td class="${cls}">${v}</td>`;
    }).join('')}</tr>`).join('')}</tbody>`;
    const e = M.extendedEuclid(a, n);
    const rows = e.rows.map(r => `<tr><td>${r.r}</td><td>${r.u}</td><td>${r.v}</td><td>${r.q ?? ''}</td></tr>`).join('');
    const isField = U.size === n - 1;
    out.innerHTML = `<p><strong>Classe choisie : ${a}̄</strong></p>
      <table class="a1w-table a1w-euclid"><thead><tr><th>reste r</th><th>u</th><th>v</th><th>quotient</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="a1w-small">Chaque ligne vérifie r = u·${a} + v·${n}.</p>
      ${e.gcd === 1 ? `<p>${status(true, `pgcd(${a}, ${n}) = 1`)} : ${e.u}·${a} + ${e.v}·${n} = 1, donc ${a}̄ · ${M.mod(e.u, n)}̄ = 1̄ et <strong>${a}̄⁻¹ = ${e.inverse}̄</strong>.</p>`
        : `<p>${status(false, `pgcd(${a}, ${n}) = ${e.gcd}`)} : ${a}̄ n’est pas inversible${a ? `, et ${a}̄ · ${n / e.gcd}̄ = 0̄ avec ${n / e.gcd}̄ ≠ 0̄ : c’est un diviseur de zéro` : ''}.</p>`}
      <p class="a1w-small">Inversibles (${U.size}) : {${[...U].join(', ')}}. ${ring ? `Diviseurs de zéro : {${[...Z].join(', ') || 'aucun'}}. ` : ''}${isField ? `ℤ/${n}ℤ est un corps (${n} est premier).` : `ℤ/${n}ℤ n’est pas un corps.`}</p>
      ${ring ? `<p><strong>Idéaux</strong> (cliquer) :</p><div class="a1w-chips">${M.divisors(n).map(d => `<button type="button" data-d="${d}" aria-pressed="${ideal === d}">(${d}̄) = ${d === n ? '{0̄}' : `${d}ℤ/${n}ℤ`}</button>`).join('')}</div>
      ${ideal ? `<p class="a1w-small">(${ideal}̄) a ${n / ideal} éléments ; le quotient (ℤ/${n}ℤ)/(${ideal}̄) est isomorphe à ℤ/${ideal}ℤ (3e théorème d’isomorphisme), ${M.units(ideal).length === ideal - 1 && ideal > 1 ? `un corps : l’idéal est maximal` : ideal === 1 ? 'l’anneau nul : (1̄) est l’anneau tout entier' : 'qui n’est pas intègre : l’idéal n’est pas premier'}.</p>` : ''}` : ''}`;
  }
  body.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.op) { op = b.dataset.op; body.querySelectorAll('[data-op]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }
    if (b.dataset.a) a = Number(b.dataset.a);
    if (b.dataset.d) ideal = ideal === Number(b.dataset.d) ? null : Number(b.dataset.d);
    draw();
  });
  body.querySelector(`#${id}-n`).addEventListener('input', e => { n = Math.max(2, Math.min(20, Number(e.target.value) || 2)); a = Math.min(a, n - 1); ideal = null; draw(); });
  draw();
}

// ------------------------------------------------------------------ 4. elimination, PA = LU, rank, determinant
const matHTML = (Mx, hot = null, label = '') => `<div class="a1w-mat"${label ? ` aria-label="${esc(label)}"` : ''}>${label ? `<span class="a1w-matlab">${esc(label)} =</span>` : ''}<table><tbody>${Mx.map((r, i) => `<tr>${r.map((x, j) => `<td class="${hot && hot(i, j) ? 'is-hot' : ''}">${esc(x.text ? x.text() : x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
function lu(root) {
  const body = frame(root, 'Élimination pas à pas : PA = LU',
    'Modifie la matrice (entiers ou fractions comme 1/2), puis avance d’une étape. Chaque étape multiplie à gauche par une matrice d’élimination E, ou échange deux lignes quand le pivot est nul. À la fin : L, U, P, le rang et le déterminant.');
  const id = 'l' + (++uid);
  const presets = { 'Fil rouge': [[2, 1, 1], [4, -6, 0], [-2, 7, 2]], 'Pivot nul': [[0, 2, 1], [1, 1, 1], [2, 0, 3]], 'Singulière': [[1, 2, 3], [2, 4, 6], [1, 0, 1]], 'Rectangulaire': [[1, 2, 1, 0], [2, 4, 0, 2], [3, 6, 1, 2]] };
  let A = presets['Fil rouge'], at = 0;
  body.innerHTML = `<div class="a1w-row"><div class="a1w-chips" role="group" aria-label="Exemples">${Object.keys(presets).map(k => `<button type="button" data-p="${k}">${k}</button>`).join('')}</div></div>
    <div class="a1w-grid"><div><div class="a1w-edit"></div><div class="a1w-row"><button type="button" class="a1w-btn" data-s="-1">← Étape</button><button type="button" class="a1w-btn" data-s="1">Étape →</button><button type="button" class="a1w-btn" data-s="all">Tout</button></div></div>
    <div class="a1w-controls"><div class="a1w-out" aria-live="polite"></div></div></div>`;
  const edit = body.querySelector('.a1w-edit'), out = body.querySelector('.a1w-out');
  function editor() {
    edit.innerHTML = `<table class="a1w-matin"><tbody>${A.map((r, i) => `<tr>${r.map((x, j) => `<td><input aria-label="ligne ${i + 1}, colonne ${j + 1}" data-i="${i}" data-j="${j}" value="${esc(x)}" inputmode="text"></td>`).join('')}</tr>`).join('')}</tbody></table>`;
  }
  edit.addEventListener('input', e => { const t = e.target; A = A.map(r => r.slice()); A[t.dataset.i][t.dataset.j] = t.value; at = 0; draw(); });
  function draw() {
    let res;
    try { res = M.eliminate(A); } catch (e) { out.innerHTML = `<p class="a1w-err">${esc(e.message)}</p>`; return; }
    const steps = res.steps.filter(s => s.kind !== 'skip'); at = Math.max(0, Math.min(at, steps.length));
    const s = steps[at - 1], cur = s ? s.U : res.A;
    let html = `<p class="a1w-small">Étape ${at} / ${steps.length}</p>`;
    if (!s) html += `<p>Matrice de départ.</p>`;
    else if (s.kind === 'swap') html += `<p><strong>Pivot nul</strong> : on échange les lignes ${s.i + 1} et ${s.j + 1} (multiplication à gauche par P${sub(`${s.i + 1}${s.j + 1}`)}).</p>`;
    else html += `<p>On annule le coefficient (${s.i + 1}, ${s.col + 1}) : L${sub(s.i + 1)} ← L${sub(s.i + 1)} ${s.factor.p < 0 ? '+' : '−'} ${s.factor.p < 0 ? s.factor.neg().text() : s.factor.text()}·L${sub(s.k + 1)}. Matrice d’élimination :</p>${matHTML(s.E, (i, j) => i === s.i && j === s.k, `E${sub(`${s.i + 1}${s.k + 1}`)}`)}<p class="a1w-small">Son inverse s’obtient en changeant le signe du coefficient hors diagonale.</p>`;
    html += matHTML(cur, s && s.kind === 'elim' ? (i, j) => i === s.i : null, at === steps.length ? 'U' : 'Matrice courante');
    if (at === steps.length) {
      const m = res.A.length, n = res.A[0].length;
      html += `<div class="a1w-row">${res.swaps ? matHTML(res.P, null, 'P') : ''}${matHTML(res.L, (i, j) => i > j && !res.L[i][j].isZero(), 'L')}</div>
        <p>${status(true, 'PA = LU vérifié')} ${M.matMul(res.P, res.A).every((r, i) => r.every((x, j) => x.eq(M.matMul(res.L, res.U)[i][j]))) ? '' : '(échec)'}</p>
        <p><strong>Rang</strong> = nombre de pivots = ${res.rank}. dim N(A) = ${n} − ${res.rank} = ${n - res.rank} ; dim N(Aᵀ) = ${m} − ${res.rank} = ${m - res.rank}.</p>
        ${res.det ? `<p><strong>det A</strong> = (−1)${sup(res.swaps)} × ${res.rank === n ? res.pivots.map(p => '(' + p.value.text() + ')').join(' × ') : '0 (un pivot manque)'} = <strong>${res.det.text()}</strong> : A ${res.det.isZero() ? 'n’est pas inversible' : 'est inversible'}.</p>` : '<p class="a1w-small">Matrice non carrée : pas de déterminant.</p>'}`;
    }
    out.innerHTML = html;
    body.querySelector('[data-s="-1"]').disabled = at === 0; body.querySelector('[data-s="1"]').disabled = body.querySelector('[data-s="all"]').disabled = at === steps.length;
    body._steps = steps.length;
  }
  body.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.p) { A = presets[b.dataset.p].map(r => r.map(String)); at = 0; editor(); }
    if (b.dataset.s) at = b.dataset.s === 'all' ? Infinity : at + Number(b.dataset.s);
    draw();
  });
  A = A.map(r => r.map(String)); editor(); draw();
}

// ------------------------------------------------------------------ 5. Cayley tables
function cayley(root) {
  const body = frame(root, 'Tables de Cayley : lire un groupe',
    'Choisis une structure. Clique sur un élément pour voir son ordre et le sous-groupe qu’il engendre ; sélectionne plusieurs éléments pour tester un sous-groupe, voir ses classes à gauche et à droite, et sa normalité. En mode « compléter », clique sur une case pour la changer.');
  const id = 'c' + (++uid), cat = M.groupCatalogue();
  let cur = cat.find(c => c.id === 's3'), S = cur.s, chosen = new Set(), editing = false, focus = null;
  const puzzle = () => { const t = M.groupCatalogue().find(c => c.id === 'z6').s; const blank = [[1, 2], [2, 4], [3, 3], [4, 1], [4, 5], [5, 2], [2, 5], [5, 5]]; const table = t.table.map(r => r.slice()); blank.forEach(([i, j]) => { table[i][j] = -1; }); return { names: ['e', 'a', 'b', 'c', 'd', 'f'], table }; };
  body.innerHTML = `<div class="a1w-row"><label>Structure <select id="${id}-g">${cat.map(c => `<option value="${c.id}"${c.id === 's3' ? ' selected' : ''}>${esc(c.label)}</option>`).join('')}<option value="puzzle">Compléter une table (6 éléments)</option><option value="free">Table libre à 3 éléments</option></select></label>
    <label class="a1w-check"><input type="checkbox" id="${id}-ed"> modifier les cases</label></div>
    <div class="a1w-grid"><div class="a1w-scroll"><table class="a1w-cayley a1w-colour"></table><p class="a1w-small">Une même couleur = un même élément : dans un groupe, chaque ligne et chaque colonne contient chaque couleur une fois (carré latin).</p></div>
    <div class="a1w-controls"><div class="a1w-axioms"></div><div class="a1w-out" aria-live="polite"></div></div></div>`;
  const table = body.querySelector('table'), ax = body.querySelector('.a1w-axioms'), out = body.querySelector('.a1w-out');
  const name = i => (i >= 0 && i < S.names.length ? S.names[i] : '?');
  function draw() {
    const n = S.names.length, A = M.analyse(S), e = A.neutral;
    const H = [...chosen].sort((a, b) => a - b), sub = H.length > 1 && A.group ? M.isSubgroup(S, H, e) : null;
    const hl = new Set(focus !== null && A.group ? M.generated(S, [focus], e) : sub?.ok ? H : []);
    table.innerHTML = `<thead><tr><th scope="col">∗</th>${S.names.map((x, j) => `<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${S.table.map((r, i) => `<tr><th scope="row"><button type="button" data-el="${i}" aria-pressed="${chosen.has(i)}" class="${focus === i ? 'is-sel' : ''}">${esc(S.names[i])}</button></th>${r.map((v, j) =>
      `<td class="${v >= 0 && v < n ? 'k' + (v % 12) : 'is-blank'}${hl.size && hl.has(i) && hl.has(j) ? ' is-in' : ''}${A.assocFail && A.assocFail.includes(i) && A.assocFail.includes(j) ? '' : ''}"${editing ? ` tabindex="0" data-cell="${i},${j}" role="button" aria-label="case ${esc(S.names[i])} ∗ ${esc(S.names[j])}"` : ''}>${esc(name(v))}</td>`).join('')}</tr>`).join('')}</tbody>`;
    const line = (ok, label, why = '') => `<li class="${ok ? 'is-yes' : 'is-no'}">${ok ? '✓' : '✗'} ${label}${why ? ` <span class="a1w-small">${why}</span>` : ''}</li>`;
    ax.innerHTML = `<ul class="a1w-axlist">
      ${line(A.closed, 'loi interne', A.closed ? '' : `: ${name(A.notClosed[0])} ∗ ${name(A.notClosed[1])} n’est pas dans l’ensemble`)}
      ${A.closed ? line(A.associative, 'associative', A.associative ? '' : `: (${name(A.assocFail[0])} ∗ ${name(A.assocFail[1])}) ∗ ${name(A.assocFail[2])} = ${name(S.table[S.table[A.assocFail[0]][A.assocFail[1]]][A.assocFail[2]])} mais ${name(A.assocFail[0])} ∗ (${name(A.assocFail[1])} ∗ ${name(A.assocFail[2])}) = ${name(S.table[A.assocFail[0]][S.table[A.assocFail[1]][A.assocFail[2]]])}`) : ''}
      ${A.closed ? line(e !== null, 'élément neutre', e !== null ? `: ${name(e)}` : ': aucune ligne ne reproduit l’en-tête') : ''}
      ${e !== null ? line(A.noInverse < 0, 'tout élément a un inverse', A.noInverse >= 0 ? `: ${name(A.noInverse)} n’en a pas (pas de ${name(e)} sur sa ligne)` : '') : ''}
      ${line(A.commutative, 'commutative', A.commutative ? ': table symétrique' : `: ${name(A.commFail[0])} ∗ ${name(A.commFail[1])} ≠ ${name(A.commFail[1])} ∗ ${name(A.commFail[0])}`)}
      ${line(A.latin, 'carré latin')}</ul>
      <p><strong>${A.group ? (A.commutative ? 'Groupe abélien' : 'Groupe non abélien') : A.monoid ? 'Monoïde, pas un groupe' : 'Pas un groupe'}</strong>${A.group ? ` d’ordre ${n}` : ''}.</p>`;
    if (!A.group) { out.innerHTML = A.latin && !A.associative ? '<p class="a1w-small">Un carré latin n’est pas forcément un groupe : ici, l’associativité échoue.</p>' : ''; return; }
    let html = '';
    if (focus !== null) {
      const g = M.generated(S, [focus], e), o = M.elementOrder(S, focus, e);
      html += `<p>Ordre de ${esc(name(focus))} : <strong>${o}</strong>. ⟨${esc(name(focus))}⟩ = {${g.map(name).join(', ')}}${g.length === n ? ' : le groupe est cyclique, engendré par cet élément' : ''}. Lagrange : ${o} divise ${n}.</p>`;
    }
    const orders = S.names.map((_, i) => M.elementOrder(S, i, e)), hist = {};
    orders.forEach(o => { hist[o] = (hist[o] || 0) + 1; });
    html += `<p class="a1w-small">Ordres des éléments : ${Object.entries(hist).map(([o, c]) => `${c} d’ordre ${o}`).join(', ')}. Ces nombres sont un invariant d’isomorphisme.</p>`;
    if (H.length > 1) {
      if (!sub.ok) html += `<p>${status(false, `{${H.map(name).join(', ')}} n’est pas un sous-groupe`)} : ${sub.why === 'neutral' ? `il ne contient pas ${name(e)}` : sub.why === 'closure' ? `${name(sub.witness[0])} ∗ ${name(sub.witness[1])} = ${name(S.table[sub.witness[0]][sub.witness[1]])} en sort` : `l’inverse de ${name(sub.witness[0])} manque`}. Le sous-groupe engendré est {${M.generated(S, H, e).map(name).join(', ')}}.</p>`;
      else {
        const L = M.cosets(S, H, 'left'), R = M.cosets(S, H, 'right'), N = M.isNormal(S, H);
        html += `<p>${status(true, `H = {${H.map(name).join(', ')}} est un sous-groupe`)}, d’indice ${n / H.length}.</p>
          <p class="a1w-small">Classes à gauche xH : ${L.map(c => '{' + c.elements.map(name).join(', ') + '}').join(' ')}</p>
          <p class="a1w-small">Classes à droite Hx : ${R.map(c => '{' + c.elements.map(name).join(', ') + '}').join(' ')}</p>
          <p>${N.normal ? status(true, 'H est normal : xH = Hx pour tout x, le quotient G/H est un groupe') : status(false, `H n’est pas normal : pour x = ${name(N.witness)}, xH ≠ Hx. H n’est le noyau d’aucun homomorphisme.`)}</p>`;
      }
    } else html += '<p class="a1w-small">Sélectionne au moins deux éléments (dont le neutre) pour tester un sous-groupe.</p>';
    out.innerHTML = html;
  }
  body.querySelector(`#${id}-g`).addEventListener('change', e => {
    const v = e.target.value; chosen.clear(); focus = null;
    if (v === 'puzzle') { S = puzzle(); editing = true; }
    else if (v === 'free') { S = { names: ['e', 'a', 'b'], table: [[0, 1, 2], [1, 0, 0], [2, 0, 0]] }; editing = true; }
    else { S = cat.find(c => c.id === v).s; S = { names: S.names, table: S.table.map(r => r.slice()) }; editing = false; }
    body.querySelector(`#${id}-ed`).checked = editing; draw();
  });
  body.querySelector(`#${id}-ed`).addEventListener('change', e => { editing = e.target.checked; draw(); });
  const bump = cell => { const [i, j] = cell.split(',').map(Number), n = S.names.length; S.table[i][j] = S.table[i][j] + 1 >= n ? 0 : S.table[i][j] + 1; draw(); body.querySelector(`[data-cell="${i},${j}"]`)?.focus(); };
  table.addEventListener('click', e => {
    const b = e.target.closest('[data-el]'), c = e.target.closest('[data-cell]');
    if (b) { const i = Number(b.dataset.el); if (chosen.has(i)) chosen.delete(i); else chosen.add(i); focus = chosen.has(i) ? i : null; draw(); }
    else if (c) bump(c.dataset.cell);
  });
  table.addEventListener('keydown', e => { const c = e.target.closest('[data-cell]'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); bump(c.dataset.cell); } });
  draw();
}

// ------------------------------------------------------------------ 6. permutations
function perms(root) {
  const body = frame(root, 'Atelier des permutations',
    'Écris σ et τ en cycles, ou clique sur la ligne du bas de σ pour échanger deux images. La composée se lit de droite à gauche : σ∘τ applique d’abord τ.');
  const id = 'p' + (++uid);
  let n = 6, s = M.parseCycles('(1 3 5 2)(4 6)', 6), t = M.parseCycles('(1 2)', 6), k = 1, pick = null;
  body.innerHTML = `<div class="a1w-row"><label>n <input type="number" id="${id}-n" min="2" max="9" value="6"></label>
    <label>σ <input id="${id}-s" value="(1 3 5 2)(4 6)" spellcheck="false"></label><label>τ <input id="${id}-t" value="(1 2)" spellcheck="false"></label></div>
    <div class="a1w-grid"><div><div class="a1w-two"></div><svg class="a1w-arrows" viewBox="0 0 320 120" role="img" aria-label="Graphe de σ : chaque flèche va de x vers σ(x)"></svg>
      <div class="a1w-row"><button type="button" class="a1w-btn" data-k="-1">← σᵏ⁻¹</button><span class="a1w-pow"></span><button type="button" class="a1w-btn" data-k="1">σᵏ⁺¹ →</button></div></div>
    <div class="a1w-controls"><div class="a1w-out" aria-live="polite"></div></div></div>`;
  const two = body.querySelector('.a1w-two'), svg = body.querySelector('svg'), out = body.querySelector('.a1w-out');
  const cyc = x => M.cycleText(x), err = [];
  function draw() {
    const p = M.power(s, k);
    two.innerHTML = `<table class="a1w-twoline" aria-label="σ en notation à deux lignes"><tbody><tr><th>x</th>${s.map((_, i) => `<td>${i + 1}</td>`).join('')}</tr><tr><th>σ(x)</th>${s.map((y, i) => `<td><button type="button" data-i="${i}" class="${pick === i ? 'is-sel' : ''}">${y + 1}</button></td>`).join('')}</tr></tbody></table>`;
    // arrow diagram of σ^k: points on a circle, colour by cycle
    svg.replaceChildren(); const cx = 160, cy = 60, R = 46, P = i => [cx + R * 1.9 * Math.cos(2 * Math.PI * i / n - Math.PI / 2), cy + R * Math.sin(2 * Math.PI * i / n - Math.PI / 2)];
    svg.innerHTML = `<defs><marker id="${id}-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="a1w-arrowhead"/></marker></defs>`;
    M.cycles(p, true).forEach((c, ci) => c.forEach(x => {
      const y = p[x], [x1, y1] = P(x), [x2, y2] = P(y);
      if (x === y) svg.append(svgEl('circle', { cx: x1, cy: y1 - 14, r: 6, class: 'a1w-loop' }));
      else { const mx = (x1 + x2) / 2 + (cy - (y1 + y2) / 2) * .25, my = (y1 + y2) / 2 + ((x1 + x2) / 2 - cx) * .12, d = Math.hypot(x2 - x1, y2 - y1), ex = x2 - (x2 - mx) / Math.hypot(x2 - mx, y2 - my) * 12, ey = y2 - (y2 - my) / Math.hypot(x2 - mx, y2 - my) * 12; svg.append(svgEl('path', { d: `M${x1} ${y1}Q${mx} ${my} ${ex} ${ey}`, class: `a1w-parrow k${ci % 12}`, 'marker-end': `url(#${id}-a)` })); void d; }
    }));
    for (let i = 0; i < n; i++) { const [x, y] = P(i), g = svgEl('g', { class: 'a1w-pt' }); g.append(svgEl('circle', { cx: x, cy: y, r: 10 })); const tx = svgEl('text', { x, y: y + 4, 'text-anchor': 'middle' }); tx.textContent = i + 1; g.append(tx); svg.append(g); }
    body.querySelector('.a1w-pow').textContent = `k = ${k} : σ${sup(k)} = ${cyc(p)}`;
    const st = M.compose(s, t), ts = M.compose(t, s), tr = M.transpositions(s), o = M.permOrder(s), sg = M.sign(s);
    const lens = M.cycles(s).map(c => c.length);
    out.innerHTML = `${err.length ? `<p class="a1w-err">${esc(err.join(' '))}</p>` : ''}
      <table class="a1w-table"><tbody>
      <tr><th>σ en cycles disjoints</th><td>${cyc(s)}</td></tr>
      <tr><th>transpositions</th><td>${tr.length ? tr.map(([a, b]) => `(${a + 1} ${b + 1})`).join('') : 'aucune (σ = id)'}</td></tr>
      <tr><th>signature ε(σ)</th><td>${sg === 1 ? '+1, paire' : '−1, impaire'} (${tr.length} transposition${tr.length > 1 ? 's' : ''}${lens.length ? ` ; cycles de longueurs ${lens.join(', ')}` : ''})</td></tr>
      <tr><th>ordre de σ</th><td>${o}${lens.length > 1 ? ` = ppcm(${lens.join(', ')})` : ''}</td></tr>
      <tr><th>σ⁻¹</th><td>${cyc(M.inverse(s))}</td></tr>
      <tr><th>σ∘τ</th><td>${cyc(st)}</td></tr><tr><th>τ∘σ</th><td>${cyc(ts)} ${st.join() === ts.join() ? '(σ et τ commutent)' : '(différent : S<sub>n</sub> n’est pas abélien)'}</td></tr>
      <tr><th>ε(σ∘τ)</th><td>${M.sign(st)} = ε(σ)·ε(τ) = ${sg}·${M.sign(t)}</td></tr></tbody></table>
      <details><summary>Matrice de permutation P<sub>σ</sub> (det = ε(σ) = ${sg})</summary>${matHTML(M.permMatrix(s), (i, j) => s[j] === i)}</details>`;
  }
  const read = () => {
    err.length = 0;
    try { s = M.parseCycles(body.querySelector(`#${id}-s`).value, n); } catch (e) { err.push('σ : ' + e.message + '.'); }
    try { t = M.parseCycles(body.querySelector(`#${id}-t`).value, n); } catch (e) { err.push('τ : ' + e.message + '.'); }
    if (s.length !== n) s = M.permIdentity(n); if (t.length !== n) t = M.permIdentity(n);
    k = 1; pick = null; draw();
  };
  body.querySelector(`#${id}-s`).addEventListener('input', read); body.querySelector(`#${id}-t`).addEventListener('input', read);
  body.querySelector(`#${id}-n`).addEventListener('input', e => { n = Math.max(2, Math.min(9, Number(e.target.value) || 2)); read(); });
  body.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.k) { k += Number(b.dataset.k); draw(); }
    if (b.dataset.i !== undefined) {
      const i = Number(b.dataset.i);
      if (pick === null) pick = i; else { s = s.slice(); [s[pick], s[i]] = [s[i], s[pick]]; pick = null; body.querySelector(`#${id}-s`).value = cyc(s); k = 1; }
      draw();
    }
  });
  draw();
}

// ------------------------------------------------------------------ 7. dihedral group
function dihedral(root) {
  const body = frame(root, 'Le groupe diédral Dₙ',
    'Applique la rotation r (d’angle 2π/n) et la réflexion τ (axe passant par le sommet 1). Le mot s’écrit de droite à gauche : le dernier bouton appuyé agit en premier sur la figure de départ. Observe la relation τ r τ = r⁻¹.');
  const id = 'd' + (++uid);
  let n = 5, g = { k: 0, s: 0 }, word = [];
  body.innerHTML = `<div class="a1w-row"><label>n <input type="number" id="${id}-n" min="3" max="8" value="5"></label>
    <button type="button" class="a1w-btn" data-g="r">∘ r</button><button type="button" class="a1w-btn" data-g="t">∘ τ</button><button type="button" class="a1w-btn" data-g="0">e</button></div>
    <div class="a1w-grid"><svg class="a1w-poly" viewBox="-120 -120 240 240" role="img" aria-label="Polygone régulier et position de ses sommets"></svg><div class="a1w-controls"><div class="a1w-out" aria-live="polite"></div></div></div>`;
  const svg = body.querySelector('svg'), out = body.querySelector('.a1w-out');
  function draw() {
    const P = i => [90 * Math.sin(2 * Math.PI * i / n), -90 * Math.cos(2 * Math.PI * i / n)], perm = M.dihedralPerm(n, g);
    svg.innerHTML = `<line x1="0" y1="-112" x2="0" y2="112" class="a1w-axis"/><polygon class="a1w-ghost" points="${[...Array(n).keys()].map(i => P(i).join(',')).join(' ')}"/>`;
    // vertex i of the original figure now sits at position perm[i]
    const where = [...Array(n).keys()].map(i => P(perm[i]));
    svg.innerHTML += `<polygon class="a1w-shape" points="${where.map(p => p.join(',')).join(' ')}"/>`;
    where.forEach(([x, y], i) => { svg.innerHTML += `<g class="a1w-pt${i === 0 ? ' is-hot' : ''}"><circle cx="${x * 1.18}" cy="${y * 1.18}" r="11"/><text x="${x * 1.18}" y="${y * 1.18 + 4}" text-anchor="middle">${i + 1}</text></g>`; });
    const nm = M.dihedralName(g).replace(/\^(\d+)/g, (_, d) => sup(d));
    out.innerHTML = `<p>Mot : ${word.length ? word.join('') : 'e'} = <strong>${nm}</strong></p>
      <p>${g.s ? `Réflexion (${nm} est d’ordre 2)` : g.k ? `Rotation d’angle ${g.k}·2π/${n}, d’ordre ${n / M.gcd(g.k, n)}` : 'Identité'}. Comme permutation des sommets : ${M.cycleText(perm)}${g.s || g.k ? ` (signature ${M.sign(perm) > 0 ? '+1' : '−1'})` : ''}.</p>
      <p class="a1w-small">|D${sub(n)}| = 2n = ${2 * n} : les rotations rᵏ et les réflexions rᵏτ, 0 ≤ k < ${n}. Relation : (rᵏτ)(rˡτ) = rᵏ⁻ˡ.</p>`;
  }
  body.addEventListener('click', e => {
    const b = e.target.closest('[data-g]'); if (!b) return;
    if (b.dataset.g === '0') { g = { k: 0, s: 0 }; word = []; }
    else { const x = b.dataset.g === 'r' ? { k: 1, s: 0 } : { k: 0, s: 1 }; g = M.dihedralMul(n, g, x); word.push(b.dataset.g === 'r' ? 'r' : 'τ'); }
    draw();
  });
  body.querySelector(`#${id}-n`).addEventListener('input', e => { n = Math.max(3, Math.min(8, Number(e.target.value) || 3)); g = { k: 0, s: 0 }; word = []; draw(); });
  draw();
}

// ------------------------------------------------------------------ 8. colourings up to symmetry (Burnside)
function burnside(root) {
  const body = frame(root, 'Compter les coloriages à symétrie près',
    'Choisis un objet, ses symétries et un nombre de couleurs. Chaque ligne du tableau est une sorte de symétrie : un coloriage qu’elle fixe est constant sur chacun de ses cycles, d’où k<sup>c(g)</sup> coloriages fixes. Clique une ligne pour voir les cycles sur la figure, et clique les positions pour colorier : la figure donne l’orbite et le stabilisateur de ton coloriage.');
  const id = 'b' + (++uid), COLOURS = ['#f4f1ea', '#18181b', '#c98b1e', '#2c3d8f'] /* fixed: the names below must stay true in both themes */, NAMES = ['blanc', 'noir', 'ocre', 'indigo'];
  const LETTERS = 'ABCDEFGH';
  let kind = 'rotations', n = 6, k = 2, G, col, pick = null;
  body.innerHTML = `<div class="a1w-row a1w-burnrow">
      <label>Objet <select id="${id}-o"><option value="rotations">Collier (rotations)</option><option value="dihedral">Bracelet (rotations et retournements)</option><option value="cube">Faces d’un cube (rotations)</option></select></label>
      <label class="${id}-nl">Perles <input type="number" id="${id}-n" min="3" max="8" value="6"></label>
      <label>Couleurs <input type="number" id="${id}-k" min="2" max="4" value="2"></label></div>
    <div class="a1w-grid"><div><svg class="a1w-burn" viewBox="-120 -120 240 240" role="group" aria-label="Figure à colorier"></svg><div class="a1w-out a1w-mine" aria-live="polite"></div></div>
    <div class="a1w-controls"><div class="a1w-out a1w-btab"></div></div></div>
    <div class="a1w-out a1w-reps"></div>`;
  const svg = body.querySelector('svg'), tab = body.querySelector('.a1w-btab'), mine = body.querySelector('.a1w-mine'), reps = body.querySelector('.a1w-reps');
  const pos = () => kind === 'cube'
    ? [[2, 1], [0, 1], [1, 1], [3, 1], [1, 0], [1, 2]].map(([c, r]) => [-110 + c * 55 + 27.5, -82.5 + r * 55 + 27.5]) // +x, −x, +y (front), −y, +z, −z: an unfolded cube
    : [...Array(n).keys()].map(i => [85 * Math.sin(2 * Math.PI * i / n), -85 * Math.cos(2 * Math.PI * i / n)]);
  const cycleOf = () => { if (!pick) return null; const lab = Array(G.n); M.cycles(pick.perm, true).forEach((c, j) => c.forEach(x => { lab[x] = j; })); return lab; };
  function mini(c) {
    const P = kind === 'cube' ? [[2, 1], [0, 1], [1, 1], [3, 1], [1, 0], [1, 2]].map(([x, y]) => [x * 9 + 4.5, y * 9 + 4.5]) : [...Array(n).keys()].map(i => [18 + 13 * Math.sin(2 * Math.PI * i / n), 18 - 13 * Math.cos(2 * Math.PI * i / n)]);
    const shapes = c.map((v, i) => kind === 'cube' ? `<rect x="${P[i][0] - 4.5}" y="${P[i][1] - 4.5}" width="9" height="9" style="fill:${COLOURS[v]}"/>` : `<circle cx="${P[i][0]}" cy="${P[i][1]}" r="4" style="fill:${COLOURS[v]}"/>`).join('');
    return `<svg class="a1w-mini" viewBox="0 0 36 ${kind === 'cube' ? 27 : 36}" aria-hidden="true">${kind === 'cube' ? '' : '<circle cx="18" cy="18" r="13" class="a1w-ghost"/>'}${shapes}</svg>`;
  }
  function draw() {
    const P = pos(), lab = cycleOf(), cyc = pick ? M.cycles(pick.perm, true) : [];
    svg.innerHTML = (kind === 'cube' ? '' : '<circle cx="0" cy="0" r="85" class="a1w-ghost"/>') + P.map(([x, y], i) => {
      const shape = kind === 'cube' ? `<rect x="${x - 25}" y="${y - 25}" width="50" height="50" style="fill:${COLOURS[col[i]]}"/>` : `<circle cx="${x}" cy="${y}" r="17" style="fill:${COLOURS[col[i]]}"/>`;
      const tag = lab ? `<text x="${x}" y="${y + 5}" text-anchor="middle" class="a1w-tag${col[i] === 1 || col[i] === 3 ? ' is-dark' : ''}">${LETTERS[lab[i]]}</text>` : '';
      const name = kind === 'cube' ? ['+x', '−x', 'avant', 'arrière', 'haut', 'bas'][i] : `perle ${i + 1}`;
      return `<g class="a1w-cell" tabindex="0" role="button" data-i="${i}" aria-label="${name} : ${NAMES[col[i]]}${lab ? `, cycle ${LETTERS[lab[i]]}` : ''}">${shape}${tag}</g>`;
    }).join('');
    const T = M.burnsideTable(G, k);
    tab.innerHTML = `<table class="a1w-table"><thead><tr><th scope="col">Symétrie</th><th scope="col">Nombre</th><th scope="col">c(g)</th><th scope="col">k<sup>c(g)</sup></th></tr></thead><tbody>${T.rows.map((r, j) =>
      `<tr><td><button type="button" class="a1w-rowbtn" data-r="${j}" aria-pressed="${pick === r.sample}">${esc(r.type)}</button></td><td>${r.count}</td><td>${r.cycles}</td><td>${k}${sup(r.cycles)} = ${r.fixed}</td></tr>`).join('')}</tbody></table>
      <p>Somme des coloriages fixes : ${T.rows.map(r => `${r.count}·${r.fixed}`).join(' + ')} = <strong>${T.total}</strong>.</p>
      <p>Nombre d’orbites = ${T.total} / |G| = ${T.total} / ${T.order} = <strong>${T.orbits}</strong>.</p>
      ${pick ? `<p class="a1w-small">Cycles de l’élément choisi sur les positions : ${cyc.map((c, j) => LETTERS[j] + ' = {' + c.map(x => kind === 'cube' ? ['+x', '−x', 'avant', 'arrière', 'haut', 'bas'][x] : x + 1).join(', ') + '}').join(' ; ')}. Un coloriage fixé par cet élément a une seule couleur par lettre.</p>` : ''}`;
    tab._rows = T.rows;
    const orb = M.orbitOf(G, col), stab = M.stabiliser(G, col);
    mine.innerHTML = `<p>Ton coloriage : orbite de <strong>${orb.length}</strong> coloriage${orb.length > 1 ? 's' : ''}, stabilisateur de <strong>${stab.length}</strong> élément${stab.length > 1 ? 's' : ''} ; ${orb.length} × ${stab.length} = ${orb.length * stab.length} = |G| ${status(orb.length * stab.length === T.order, 'orbite-stabilisateur')}</p>${pick ? `<p class="a1w-small">L’élément choisi ${String(M.actOn(pick.perm, col)) === String(col) ? 'fixe' : 'ne fixe pas'} ton coloriage.</p>` : ''}`;
    const R = M.orbitRepresentatives(G, k);
    reps.innerHTML = R === null ? `<p class="a1w-small">${k}${sup(G.n)} coloriages : trop pour les énumérer ici, la formule suffit.</p>`
      : `<p>Vérification par énumération des ${k ** G.n} coloriages : <strong>${R.length}</strong> orbites ${status(R.length === T.orbits, 'accord avec la formule')}</p>`
        + (R.length <= 60 ? `<p class="a1w-small">Un représentant par orbite :</p><div class="a1w-minis">${R.map(mini).join('')}</div>` : '');
  }
  function reset() {
    kind = body.querySelector(`#${id}-o`).value;
    n = Math.max(3, Math.min(8, Number(body.querySelector(`#${id}-n`).value) || 6));
    k = Math.max(2, Math.min(4, Number(body.querySelector(`#${id}-k`).value) || 2));
    body.querySelector(`.${id}-nl`).style.display = kind === 'cube' ? 'none' : '';
    G = M.symmetryGroup(kind, n); col = Array(G.n).fill(0); pick = null; draw();
  }
  const paint = el => { const i = Number(el.dataset.i); col[i] = (col[i] + 1) % k; draw(); svg.querySelector(`[data-i="${i}"]`)?.focus(); };
  svg.addEventListener('click', e => { const g = e.target.closest('[data-i]'); if (g) paint(g); });
  svg.addEventListener('keydown', e => { const g = e.target.closest('[data-i]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); paint(g); } });
  tab.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b) return; const r = tab._rows[Number(b.dataset.r)]; pick = pick === r.sample ? null : r.sample; draw(); });
  body.querySelectorAll('select, input').forEach(x => x.addEventListener('change', reset));
  reset();
}

// ------------------------------------------------------------------ QCM series ([data-a1-qcm], built by scripts/build-algebre1.py)
// Two modes, remembered for the visitor: instant correction (one "Valider" per question) or correction at the end of the
// series. A series can be restarted with its choices in a new order; the best score is kept in the browser only.
const QCM_MODE = 'algebre1-qcm-mode', QCM_BEST = 'algebre1-qcm-best';
const readStore = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const writeStore = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const VERDICT = { right: 'Juste.', wrong: 'Inexact.', partial: 'Incomplet : il manque au moins une bonne réponse.', empty: 'Sans réponse.' };

function qcm(root) {
  const id = root.id, questions = [...root.querySelectorAll('.qcm-q')];
  root.classList.add('is-live');
  const head = root.querySelector('.qcm-head');
  head.insertAdjacentHTML('beforeend', `<div class="qcm-mode" role="radiogroup" aria-label="Mode de correction">
    <label><input type="radio" name="${id}-mode" value="instant"> Correction immédiate</label>
    <label><input type="radio" name="${id}-mode" value="serie"> Correction à la fin de la série</label></div>`);
  root.insertAdjacentHTML('beforeend', `<footer class="qcm-foot"><button type="button" class="qcm-btn qcm-primary" data-qcm-finish>Corriger la série</button>
    <button type="button" class="qcm-btn" data-qcm-reset>Recommencer, réponses mélangées</button><output class="qcm-score" aria-live="polite"></output></footer>`);
  questions.forEach(q => q.querySelector('fieldset').insertAdjacentHTML('beforeend', '<div class="qcm-actions"><button type="button" class="qcm-btn" data-qcm-check>Valider</button></div>'));
  const score = root.querySelector('.qcm-score'), finish = root.querySelector('[data-qcm-finish]');
  let mode = readStore(QCM_MODE, 'instant') === 'serie' ? 'serie' : 'instant';
  const grades = new Map();

  const chosen = q => [...q.querySelectorAll('input:checked')].map(i => Number(i.value));
  const right = q => [...q.querySelectorAll('.qcm-c')].filter(c => c.dataset.ok === '1').map(c => Number(c.querySelector('input').value));
  function reveal(q) {
    const g = M.gradeQuestion(right(q), chosen(q)); grades.set(q, g);
    q.classList.add('is-graded', 'is-' + g.status);
    for (const c of q.querySelectorAll('.qcm-c')) {
      const input = c.querySelector('input'), ok = c.dataset.ok === '1';
      input.disabled = true;
      c.classList.toggle('is-ok', ok); c.classList.toggle('is-bad', input.checked && !ok); c.classList.toggle('is-missed', !input.checked && ok);
      c.classList.toggle('is-shown', ok || input.checked);
    }
    q.querySelector('.qcm-verdict').textContent = VERDICT[g.status];
    q.querySelector('[data-qcm-check]').hidden = true;
  }
  function tally(final) {
    const s = M.seriesScore(questions.map(q => grades.get(q) || { status: 'empty', right: false }));
    if (!final && mode === 'instant') { score.textContent = `${s.right} juste${s.right > 1 ? 's' : ''} sur ${grades.size} question${grades.size > 1 ? 's' : ''} corrigée${grades.size > 1 ? 's' : ''} (série de ${s.total}).`; }
    if (final || grades.size === questions.length) {
      const best = readStore(QCM_BEST, {}), prev = best[id] ?? -1;
      if (s.right > prev) { best[id] = s.right; writeStore(QCM_BEST, best); }
      const misses = questions.filter(q => !grades.get(q)?.right).map(q => `<a href="#${q.id}">${q.querySelector('.qcm-n').textContent}</a>`);
      score.innerHTML = `<strong>Score : ${s.right} / ${s.total}</strong>${s.answered < s.total ? ` (${s.total - s.answered} sans réponse)` : ''}. Meilleur score sur cet appareil : ${Math.max(prev, s.right)} / ${s.total}.`
        + (misses.length ? ` À reprendre : ${misses.join(', ')}.` : ' Série parfaite.');
      finish.hidden = true;
    }
  }
  function reset() {
    grades.clear();
    for (const q of questions) {
      q.className = 'qcm-q'; q.querySelector('.qcm-verdict').textContent = '';
      const list = q.querySelector('.qcm-choices');
      for (const c of M.shuffled([...list.children])) { list.append(c); c.className = 'qcm-c'; const i = c.querySelector('input'); i.checked = false; i.disabled = false; }
      q.querySelector('[data-qcm-check]').hidden = mode !== 'instant';
    }
    finish.hidden = false;
    root.classList.toggle('is-serie', mode === 'serie');
    const best = readStore(QCM_BEST, {})[id];
    score.textContent = best !== undefined ? `Meilleur score sur cet appareil : ${best} / ${questions.length}.` : '';
  }
  root.querySelectorAll(`[name="${id}-mode"]`).forEach(r => { r.checked = r.value === mode; });
  root.addEventListener('change', e => {
    if (e.target.name !== `${id}-mode`) return;
    mode = e.target.value; writeStore(QCM_MODE, mode); reset();
  });
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.matches('[data-qcm-check]')) {
      const q = b.closest('.qcm-q');
      if (!chosen(q).length) { q.querySelector('.qcm-verdict').textContent = 'Choisis au moins une réponse avant de valider.'; return; }
      reveal(q); tally(false);
    }
    if (b.matches('[data-qcm-finish]')) { questions.filter(q => !grades.has(q)).forEach(reveal); tally(true); score.scrollIntoView({ block: 'nearest' }); }
    if (b.matches('[data-qcm-reset]')) reset();
  });
  reset();
}

const WIDGETS = { venn, maps, zn, lu, cayley, perms, dihedral, burnside };
export function mountAll(scope = document) {
  for (const el of scope.querySelectorAll('[data-a1-qcm]')) {
    if (el.dataset.mounted) continue;
    el.dataset.mounted = '1';
    try { qcm(el); } catch (e) { console.error(e); }
  }
  for (const el of scope.querySelectorAll('[data-a1-widget]')) {
    const make = WIDGETS[el.dataset.a1Widget];
    if (!make || el.dataset.mounted) continue;
    el.dataset.mounted = '1';
    try { make(el); } catch (e) { el.textContent = 'Cette figure n’a pas pu se charger.'; console.error(e); }
  }
}
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mountAll()); else mountAll();
}
