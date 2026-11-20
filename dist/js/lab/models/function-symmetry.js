// Pure maths of the experiment `function-symmetry` (Malagasy T11 S, chapter 1 "Généralités sur les fonctions numériques"):
// seven curves, their parity (f(-x) against f(x)) and their period (the gap between f(x + T) and f(x)). Everything is exact on
// the declared facts (`parity`, `period`) and cross-checked by sampling in the tests; there is no randomness and no DOM.
// The independent check of the same facts in Python is scripts/check-mada-t11s-functions.py.

const PI = Math.PI;

// id: the curve; label: how it is written; parity "even" | "odd" | "none"; period: the smallest positive period, or null.
// Every domain is symmetric about 0 (the point 0 is excluded for the inverse function).
export const FUNCTIONS = {
  sq: { label: "f(x) = x²/3 − 2", f: (x) => x * x / 3 - 2, parity: "even", period: null, hole: false },
  cube: { label: "f(x) = (x³ − 6x)/10", f: (x) => (x ** 3 - 6 * x) / 10, parity: "odd", period: null, hole: false },
  inv: { label: "f(x) = 2/x", f: (x) => (x === 0 ? NaN : 2 / x), parity: "odd", period: null, hole: true },
  cos2: { label: "f(x) = 2 cos(2x)", f: (x) => 2 * Math.cos(2 * x), parity: "even", period: PI, hole: false },
  sin1: { label: "f(x) = 3 sin(x)", f: (x) => 3 * Math.sin(x), parity: "odd", period: 2 * PI, hole: false },
  shift: { label: "f(x) = x²/4 + x/2 − 1", f: (x) => x * x / 4 + x / 2 - 1, parity: "none", period: null, hole: false },
  phase: { label: "f(x) = 2 cos(x − 1)", f: (x) => 2 * Math.cos(x - 1), parity: "none", period: 2 * PI, hole: false },
};
export const FN_IDS = Object.keys(FUNCTIONS);

// The tested abscissa a moves on the grid of 0.5 from 0.5 to 4.5 (0 would hide the difference of the pairs of points).
export const A_MIN = 0.5, A_MAX = 4.5;
// The translation T = k * pi / 12, k from 0 to 24 (0 to 2 pi): 12 steps give pi, 24 steps give 2 pi.
export const K_MAX = 24, STEP = PI / 12;
export const shiftOf = (k) => k * STEP;
const EPS = 1e-9;

export const imageAt = (id, x) => FUNCTIONS[id].f(x);

// f(a) and f(-a) for the tested abscissa, and what the pair says.
export function parityModel(s) {
  const F = FUNCTIONS[s.fn], a = s.a, fa = F.f(a), fma = F.f(-a);
  const same = Math.abs(fa - fma) < EPS, opposite = Math.abs(fa + fma) < EPS;
  return { a, fa, fma, same, opposite, verdict: same ? "same" : opposite ? "opposite" : "neither", parity: F.parity };
}

// Over the grid -5 ... 5 (step 0.25, the pole of 2/x skipped): the largest |f(-x) - f(x)| and |f(-x) + f(x)|.
export function parityByScan(id) {
  const F = FUNCTIONS[id]; let even = 0, odd = 0;
  for (let i = 1; i <= 20; i++) { const x = i * 0.25, p = F.f(x), q = F.f(-x); even = Math.max(even, Math.abs(p - q)); odd = Math.max(odd, Math.abs(p + q)); }
  return { even: even < 1e-9, odd: odd < 1e-9, gapEven: even, gapOdd: odd };
}

// The gap between the curve and its translate by T = k pi / 12: the largest |f(x + T) - f(x)| on the window -5 ... 5.
export function periodGap(id, k) {
  const F = FUNCTIONS[id], T = shiftOf(k); let gap = 0;
  for (let i = -100; i <= 100; i++) {
    const x = i * 0.05, a = F.f(x), b = F.f(x + T);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    gap = Math.max(gap, Math.abs(a - b));
  }
  return gap;
}

export function periodModel(s) {
  const F = FUNCTIONS[s.fn], gap = periodGap(s.fn, s.k), T = shiftOf(s.k);
  const isPeriod = s.k > 0 && gap < 1e-7;
  const minimalK = F.period === null ? null : Math.round(F.period / STEP);
  return { T, gap, isPeriod, minimal: isPeriod && minimalK === s.k, minimalK, period: F.period };
}

export function model(s) { return { parity: parityModel(s), period: periodModel(s) }; }

// Numbers a mission or a test may ask for, recomputed from the state.
export const quantities = {
  oppositeImage: () => imageAt("sq", -3),         // f(3) = 1 for f(x) = x²/3 - 2, hence f(-3) = 1
  periodSteps: () => Math.round(FUNCTIONS.cos2.period / STEP),
};
export const quantity = (name, s) => quantities[name](s);
