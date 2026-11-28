// Algèbre 1: question banks (QCM and short-answer quizzes), pure and DOM-free. Each chapter's bank
// (algebra1-bank-<key>.js) lists items { id, topic, kind: 'qcm' | 'quiz', gen(R) }; gen draws one instance from the
// seeded generator R. Instances are checked by tests/algebra1-bank.test.mjs over many seeds.
import { Frac, gcd, parseCycles, compose, inverse, permIdentity, cycleText } from './algebra1-model.js';
export { gcd };

// ------------------------------------------------------------------ randomness (mulberry32: one seed, one series)
export function rng(seed) {
  let a = seed >>> 0;
  const R = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  R.int = (lo, hi) => lo + Math.floor(R() * (hi - lo + 1));
  R.pick = arr => arr[Math.floor(R() * arr.length)];
  R.shuffle = arr => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; };
  R.sample = (arr, k) => R.shuffle(arr).slice(0, k);
  R.sign = () => (R() < 0.5 ? -1 : 1);
  R.nonzero = (lo, hi) => { let x = 0; while (!x) x = R.int(lo, hi); return x; };
  return R;
}
export const seedOf = text => { let h = 2166136261; for (const c of String(text)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// ------------------------------------------------------------------ small arithmetic shared by the banks
export const mod = (a, n) => ((a % n) + n) % n;
export const lcm = (a, b) => a / gcd(a, b) * b;
export const phi = n => { let r = 0; for (let k = 1; k <= n; k++) if (gcd(k, n) === 1) r++; return r; };
export const divisors = n => { const d = []; for (let k = 1; k <= n; k++) if (n % k === 0) d.push(k); return d; };
export const isPrime = n => n > 1 && divisors(n).length === 2;
export const fact = n => (n <= 1 ? 1 : n * fact(n - 1));
export const binom = (n, k) => (k < 0 || k > n ? 0 : fact(n) / (fact(k) * fact(n - k)));
export function inverseMod(a, n) { for (let u = 1; u < n; u++) if (mod(a * u, n) === 1 % n) return u; return null; }
export function orderMod(a, n) { let x = mod(a, n), k = 1; while (x !== 1) { x = mod(x * a, n); k++; if (k > n) return null; } return k; }
export const frac = (p, q = 1) => new Frac(p, q);
export const ftex = x => Frac.of(x).tex();
/** A signed term in a sum: coef 1 → "+ x", −1 → "− x", 0 → "". */
export function term(c, v, first = false) {
  if (!c) return '';
  const s = c < 0 ? '-' : (first ? '' : '+'), a = Math.abs(c);
  return `${s}${a === 1 && v ? '' : a}${v}`;
}
export const poly = (coefs, v = 'x') => { // coefs from the highest degree
  const d = coefs.length - 1; let out = '';
  coefs.forEach((c, i) => { const e = d - i; out += term(c, e === 0 ? '' : e === 1 ? v : `${v}^{${e}}`, !out); });
  return out || '0';
};
export const pmatrix = M => String.raw`\begin{pmatrix}` + M.map(r => r.map(x => (x instanceof Frac ? x.tex() : String(x))).join('&')).join(String.raw`\\`) + String.raw`\end{pmatrix}`;
export const cyc = p => cycleText(p);
export { parseCycles, compose, inverse, permIdentity };

// ------------------------------------------------------------------ building items
export const qcm = (id, topic, gen) => ({ id, topic, kind: 'qcm', gen });
export const quiz = (id, topic, gen) => ({ id, topic, kind: 'quiz', gen });
export const right = (text, fb) => [true, String(text), fb];
export const wrong = (text, fb) => [false, String(text), fb];

/** A conceptual question: draw `n` statements from a vetted pool [[truth, text, why], …], at least one true and one false. */
export function fromPool(R, stem, pool, expl, n = 5) {
  for (let t = 0; t < 50; t++) {
    const pickd = R.sample(pool, Math.min(n, pool.length));
    if (pickd.some(p => p[0]) && pickd.some(p => !p[0])) return { stem, multi: true, choices: pickd.map(([ok, text, why]) => [ok, text, why]), expl };
  }
  throw new Error('pool without true and false statements: ' + stem);
}
/** One right answer among `wrongs` (at least three distinct choices are kept after removing duplicates). */
export const single = (stem, ok, wrongs, expl) => ({ stem, multi: false, choices: [ok, ...wrongs], expl });

/** Remove choices whose text repeats an earlier one (the right answer is kept first); null if fewer than three remain. */
export function finalize(q) {
  const seen = new Set(), out = [];
  const ordered = [...q.choices.filter(c => c[0]), ...q.choices.filter(c => !c[0])];
  for (const c of ordered) { const key = String(c[1]).replace(/\s+/g, ''); if (!seen.has(key)) { seen.add(key); out.push(c); } }
  if (out.length < 3 || !out.some(c => c[0])) return null;
  if (!q.multi && out.filter(c => c[0]).length !== 1) return null;
  return { ...q, choices: out };
}
/** One instance of an item, retried with derived seeds until it is well formed. */
export function instance(item, seed) {
  for (let t = 0; t < 40; t++) {
    const R = rng(seed + t * 7919), q = item.gen(R);
    if (item.kind === 'quiz') return { ...q, id: item.id, topic: item.topic, kind: 'quiz' };
    const f = finalize(q);
    if (f) return { ...f, id: item.id, topic: item.topic, kind: 'qcm' };
  }
  throw new Error('no well-formed instance: ' + item.id);
}
/** A series: `count` distinct items drawn from the bank, each instantiated with its own seed. */
export function drawSeries(items, kind, count, seed) {
  const R = rng(seed), pool = R.shuffle(items.filter(i => i.kind === kind)).slice(0, count);
  return pool.map((it, k) => instance(it, seed + 1000003 * (k + 1)));
}

// ------------------------------------------------------------------ text of an instance as HTML (formulas left to MathJax)
const escHtml = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** Text between formulas: the few text macros of the course (\og, \fg, \emph, \textbf), French spaces; formulas: \( … \). */
export function richText(s) {
  return String(s).split(/(\$[^$]+\$)/).map(part => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 1) return '\\(' + escHtml(part.slice(1, -1)) + '\\)';
    return escHtml(part).replace(/\\og(\{\})?\s*/g, '« ').replace(/\s*\\fg(\{\})?/g, ' »')
      .replace(/\\emph\{([^}]*)\}/g, '<em>$1</em>').replace(/\\textbf\{([^}]*)\}/g, '<strong>$1</strong>');
  }).join('');
}

// ------------------------------------------------------------------ short answers: parse, compare, explain the format
const MINUS = /[−–—]/g;
const clean = s => String(s).replace(MINUS, '-').replace(/ | /g, ' ').trim();
function parseRat(s) {
  const t = clean(s).replace(/\s+/g, '');
  if (!t) throw new Error('Réponse vide');
  return Frac.of(parseFracLoose(t));
}
function parseFracLoose(t) {
  const m = t.match(/^([+-]?\d+)(?:\/([+-]?\d+))?$|^([+-]?\d*[.,]\d+)$/);
  if (!m) throw new Error(`Nombre illisible « ${t} »`);
  if (m[3]) { const [a, b] = m[3].replace(',', '.').split('.'); const d = b.length; const sign = a.startsWith('-') ? -1 : 1; return new Frac(sign * (Math.abs(Number(a || '0')) * 10 ** d + Number(b)), 10 ** d); }
  if (m[2] !== undefined && Number(m[2]) === 0) throw new Error('Division par zéro');
  return new Frac(Number(m[1]), m[2] !== undefined ? Number(m[2]) : 1);
}
const splitList = s => clean(s).replace(/^[({[]|[)}\]]$/g, '').split(/[,;]|\s+/).map(x => x.trim()).filter(Boolean);
export const FORMATS = {
  int: 'un entier, par exemple -12',
  rat: 'un entier ou une fraction, par exemple -3/4',
  mod: 'un entier (n’importe quel représentant de la classe)',
  set: 'les éléments entre accolades, séparés par des virgules, par exemple {1, 4, 7} ; {} pour l’ensemble vide',
  tuple: 'les composantes dans l’ordre, séparées par des virgules, par exemple (1, -2, 3/2)',
  perm: 'des cycles disjoints, par exemple (1 3 2)(4 5) ; id pour l’identité',
  matrix: 'les lignes séparées par ; et les coefficients par des espaces, par exemple 1 2 ; 0 1',
};
/** Check a typed answer: { ok, error? }. An unreadable answer gives an error and does not count as an attempt. */
export function checkAnswer(q, given) {
  try {
    switch (q.type) {
      case 'int': { const x = parseRat(given); if (x.q !== 1) throw new Error('Un entier est attendu'); return { ok: x.p === q.answer }; }
      case 'rat': return { ok: parseRat(given).eq(Frac.of(q.answer)) };
      case 'mod': { const x = parseRat(given); if (x.q !== 1) throw new Error('Un entier est attendu'); return { ok: mod(x.p - q.answer, q.n) === 0 }; }
      case 'set': {
        const t = clean(given);
        const items = /^(\{\s*\}|∅|vide)$/i.test(t) ? [] : splitList(t).map(x => { const v = parseRat(x); if (v.q !== 1) throw new Error('Des entiers sont attendus'); return v.p; });
        const A = new Set(items), B = new Set(q.answer);
        return { ok: A.size === B.size && [...A].every(x => B.has(x)) };
      }
      case 'tuple': {
        const xs = splitList(given).map(parseRat);
        if (xs.length !== q.answer.length) return { ok: false, note: `${q.answer.length} composantes sont attendues` };
        return { ok: xs.every((x, i) => x.eq(Frac.of(q.answer[i]))) };
      }
      case 'perm': {
        const p = parseCycles(clean(given), q.n);
        return { ok: p.every((y, i) => y === q.answer[i]) };
      }
      case 'matrix': {
        const rows = clean(given).split(/;|\n/).map(r => r.trim()).filter(Boolean).map(r => r.split(/[\s,]+/).filter(Boolean).map(parseRat));
        const A = q.answer;
        if (rows.length !== A.length || rows.some(r => r.length !== A[0].length)) return { ok: false, note: `une matrice ${A.length}×${A[0].length} est attendue` };
        return { ok: rows.every((r, i) => r.every((x, j) => x.eq(Frac.of(A[i][j])))) };
      }
      default: throw new Error('type inconnu ' + q.type);
    }
  } catch (e) { return { ok: false, error: e.message }; }
}
/** The canonical written answer, for the correction. */
export function answerText(q) {
  switch (q.type) {
    case 'int': case 'mod': return String(q.answer).replace('-', '−') + (q.type === 'mod' ? ` (modulo ${q.n})` : '');
    case 'rat': return Frac.of(q.answer).text();
    case 'set': return '{' + [...q.answer].sort((a, b) => a - b).join(', ') + '}';
    case 'tuple': return '(' + q.answer.map(x => Frac.of(x).text()).join(', ') + ')';
    case 'perm': return cycleText(q.answer);
    case 'matrix': return q.answer.map(r => r.map(x => Frac.of(x).text()).join(' ')).join(' ; ');
  }
  return '';
}
