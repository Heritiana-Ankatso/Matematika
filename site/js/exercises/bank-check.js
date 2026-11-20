// Answer checking of the online bank (js/bank-page.js) for the parts that carry a `check` (bank-mada.js). Pure, no DOM.
// A typed answer is read by a small complex-number evaluator: decimal comma or point, fractions, implicit products (2x, 3i),
// powers, sqrt / √, π / pi, e, i, exp, ln, sin, cos, tan. Check types:
//   number {value, tol?}   complex {value, tol?}   tuple {value:[..]} (ordered, separated by ;)   set {value:[..]} (any order)
//   expr {value, vars?:['x'], at?:[..]} (equal at sample points)   choice {options, answer, why}   order {steps} (letters typed in order)
// Nothing here gives a hint: the verdict is only right or not yet.
import { rng } from './engine.js';

const C = (re, im = 0) => ({ re, im });
const add = (a, b) => C(a.re + b.re, a.im + b.im), sub = (a, b) => C(a.re - b.re, a.im - b.im);
const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => { const d = b.re * b.re + b.im * b.im; if (d === 0) throw new Error('division by zero'); return C((a.re * b.re + a.im * b.im) / d, (a.im * b.re - a.re * b.im) / d); };
const cexp = (a) => { const r = Math.exp(a.re); return C(r * Math.cos(a.im), r * Math.sin(a.im)); };
const clog = (a) => { if (a.re === 0 && a.im === 0) throw new Error('log 0'); return C(Math.log(Math.hypot(a.re, a.im)), Math.atan2(a.im, a.re)); };
const cpow = (a, b) => {
  if (b.im === 0 && Number.isInteger(b.re) && Math.abs(b.re) <= 64) { let out = C(1), k = Math.abs(b.re); while (k--) out = mul(out, a); return b.re < 0 ? div(C(1), out) : out; }
  if (a.im === 0 && b.im === 0 && a.re >= 0) return C(a.re ** b.re);
  return cexp(mul(b, clog(a)));
};
const csqrt = (a) => (a.im === 0 && a.re >= 0 ? C(Math.sqrt(a.re)) : cpow(a, C(0.5)));
const csin = (a) => C(Math.sin(a.re) * Math.cosh(a.im), Math.cos(a.re) * Math.sinh(a.im));
const ccos = (a) => C(Math.cos(a.re) * Math.cosh(a.im), -Math.sin(a.re) * Math.sinh(a.im));
const FUNCS = { sqrt: csqrt, racine: csqrt, exp: cexp, ln: clog, log: clog, sin: csin, cos: ccos, tan: (a) => div(csin(a), ccos(a)) };
const NAMES = ['racine', 'sqrt', 'exp', 'sin', 'cos', 'tan', 'ln', 'log', 'pi'];

// Tokens: numbers, names (functions, constants, one-letter variables), operators.
function tokens(src, vars) {
  const s = String(src).normalize('NFKC').replace(/[−–—]/g, '-').replace(/[×·⋅]/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3')
    .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/\\left|\\right|\\,|\\;|\\!/g, '').replace(/\\(dfrac|tfrac|frac)\{([^{}]*)\}\{([^{}]*)\}/g, '(($2)/($3))')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'sqrt($1)').replace(/\\(pi|ln|exp|sin|cos|tan)/g, '$1').replace(/\\times|\\cdot/g, '*').replace(/[{}]/g, (c) => (c === '{' ? '(' : ')')).replace(/\\/g, '');
  const out = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    const num = /^(\d+(?:[.,]\d+)?|[.,]\d+)/.exec(s.slice(i));
    if (num) { out.push({ t: 'n', v: Number(num[1].replace(',', '.')) }); i += num[1].length; continue; }
    if (/[a-zA-Z]/.test(c)) {
      const run = /^[a-zA-Z]+/.exec(s.slice(i))[0];
      let k = 0;
      while (k < run.length) {
        const name = NAMES.find((n) => run.startsWith(n, k));
        if (name) { out.push(name === 'pi' ? { t: 'n', v: Math.PI } : { t: 'f', v: name }); k += name.length; continue; }
        const l = run[k];
        if (vars.includes(l)) out.push({ t: 'v', v: l });
        else if (l === 'e') out.push({ t: 'n', v: Math.E });
        else if (l === 'i') out.push({ t: 'i' });
        else throw new Error(`unknown name ${l}`);
        k++;
      }
      i += run.length; continue;
    }
    if ('+-*/^()'.includes(c)) { out.push({ t: c }); i++; continue; }
    throw new Error(`unexpected ${c}`);
  }
  return out;
}

// Recursive descent; implicit product between adjacent factors. Returns a function of the variable values.
function parse(src, vars) {
  const tk = tokens(src, vars);
  let p = 0;
  const peek = () => tk[p], take = (t) => (tk[p] && tk[p].t === t ? tk[p++] : null);
  const starts = (x) => x && (x.t === 'n' || x.t === 'v' || x.t === 'i' || x.t === 'f' || x.t === '(');
  function expr() { let a = term(); for (;;) { if (take('+')) { const l = a, r = term(); a = (e) => add(l(e), r(e)); } else if (take('-')) { const l = a, r = term(); a = (e) => sub(l(e), r(e)); } else return a; } }
  function term() {
    let a = unary();
    for (;;) {
      if (take('*')) { const l = a, r = unary(); a = (e) => mul(l(e), r(e)); } else if (take('/')) { const l = a, r = unary(); a = (e) => div(l(e), r(e)); } else if (starts(peek())) { const l = a, r = power(); a = (e) => mul(l(e), r(e)); } else return a;
    }
  }
  function unary() { if (take('-')) { const a = unary(); return (e) => sub(C(0), a(e)); } if (take('+')) return unary(); return power(); }
  function power() { const b = primary(); if (take('^')) { const x = unary(); return (e) => cpow(b(e), x(e)); } return b; }
  function primary() {
    const x = tk[p++];
    if (!x) throw new Error('unexpected end');
    if (x.t === 'n') return () => C(x.v);
    if (x.t === 'i') return () => C(0, 1);
    if (x.t === 'v') return (e) => e[x.v];
    if (x.t === 'f') { const f = FUNCS[x.v], a = power(); return (e) => f(a(e)); }
    if (x.t === '(') { const a = expr(); if (!take(')')) throw new Error('missing )'); return a; }
    throw new Error(`unexpected ${x.t}`);
  }
  const f = expr();
  if (p !== tk.length) throw new Error('trailing input');
  return f;
}

// Value of an expression (no variable), or null when it cannot be read.
export function evaluate(src, env = {}) {
  try { const v = parse(src, Object.keys(env))(Object.fromEntries(Object.entries(env).map(([k, x]) => [k, typeof x === 'number' ? C(x) : x]))); return Number.isFinite(v.re) && Number.isFinite(v.im) ? v : null; } catch { return null; }
}
const close = (u, t, tol) => Math.hypot(u.re - t.re, u.im - t.im) <= tol * Math.max(1, Math.hypot(t.re, t.im));
const strip = (s) => String(s).trim().replace(/^[([{]\s*|\s*[)\]}]$/g, '').replace(/^\\\{|\\\}$/g, '');
const pieces = (s) => strip(s).split(/\s*;\s*/).filter((x) => x !== '');
const sameValue = (u, target, tol, real) => { const a = evaluate(u), b = evaluate(target); return !!a && !!b && (!real || Math.abs(a.im) < 1e-9) && close(a, b, tol); };
const SAMPLES = { real: [0.35, 0.8, 1.3, 1.9, 2.6, 3.4], complex: [C(0.4, 0.3), C(-0.7, 1.1), C(1.5, -0.6), C(0.2, -1.4), C(2.1, 0.9)] };

// Letters shown for the steps of an `order` check: the steps in a fixed shuffled order (never the right one), from the item id.
export function orderLayout(check, id) {
  const n = check.steps.length, r = rng(`order|${id}`);
  let perm = r.shuffle([...Array(n).keys()]);
  for (let k = 0; perm.every((v, j) => v === j) && k < 20; k++) perm = r.shuffle(perm);
  if (perm.every((v, j) => v === j)) perm = [...perm.slice(1), perm[0]];
  return perm; // perm[displayed position] = index in the right order
}
export const LETTERS = 'ABCDEFGH';
export const rightOrder = (check, id) => { const perm = orderLayout(check, id); return check.steps.map((_, k) => LETTERS[perm.indexOf(k)]).join(''); };

// true when the typed (or chosen) answer is right, false when it is wrong or cannot be read.
export function checkAnswer(check, answer, id = '') {
  const tol = check.tol ?? 1e-9, s = String(answer ?? '').trim();
  if (check.type === 'choice') return Number(answer) === check.answer;
  if (!s) return false;
  switch (check.type) {
    case 'number': return sameValue(s, check.value, tol, true);
    case 'complex': return sameValue(s, check.value, tol, false);
    case 'tuple': { const u = pieces(s); return u.length === check.value.length && u.every((x, k) => sameValue(x, check.value[k], tol, false)); }
    case 'set': {
      const u = pieces(s), left = [...check.value];
      if (u.length !== left.length) return false;
      for (const x of u) { const k = left.findIndex((t) => sameValue(x, t, tol, false)); if (k < 0) return false; left.splice(k, 1); }
      return true;
    }
    case 'expr': {
      const vars = check.vars || ['x'], v = vars[0], body = s.replace(/^\s*[a-zA-Z]\s*(\([a-z]\))?\s*=\s*/, '');
      let target, typed;
      try { target = parse(check.value, vars); typed = parse(body, vars); } catch { return false; }
      const pts = (check.at || (v === 'z' ? SAMPLES.complex : SAMPLES.real)).map((x) => (typeof x === 'number' ? C(x) : x));
      let agree = 0;
      for (const x of pts) {
        let a, b; try { a = target({ [v]: x }); b = typed({ [v]: x }); } catch { continue; }
        if (![a.re, a.im].every(Number.isFinite)) continue;
        if (![b.re, b.im].every(Number.isFinite) || !close(b, a, check.tol ?? 1e-7)) return false;
        agree++;
      }
      return agree >= 3;
    }
    case 'order': return s.toUpperCase().replace(/[^A-H]/g, '') === rightOrder(check, id);
    default: return false;
  }
}

// What the answer field expects, in a few words (format only, never a hint about the method).
export const FORMAT = {
  number: 'Un nombre : entier, décimal (virgule ou point), fraction a/b ; √, π, e et ln acceptés.',
  complex: 'Un nombre complexe, par exemple 2-3i ou (1+i)/2.',
  tuple: 'Les valeurs dans l’ordre demandé, séparées par des points-virgules.',
  set: 'Toutes les valeurs, dans n’importe quel ordre, séparées par des points-virgules.',
  expr: 'Une expression ; écrire les produits 2x, 3*x, les puissances x^2, exp(x) ou e^x, ln(x).',
  order: 'Les lettres des étapes dans le bon ordre, par exemple CABD.',
};
