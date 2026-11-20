// Pure maths of the experiment `logic-truth` (Malagasy T10, chapter 1 "Logique"): truth tables of the connectors, equivalent
// pairs of formulas, a hunt for counter-examples over the integers 0 to 40, and the checking of a quantified statement on a
// small finite set. Everything is exhaustive and exact; there is no randomness and no DOM. The independent check of the same
// facts in Python is scripts/check-mada-t10-logic.py.
import { isPrime } from "./primes.js";

// ---- truth tables ------------------------------------------------------------------------------------------------
// The four lines in the order of the course: (P, Q) = VV, VF, FV, FF.
export const ROWS = [[true, true], [true, false], [false, true], [false, false]];
export const V = (b) => (b ? "V" : "F");

const NOT = (a) => !a, IMP = (p, q) => !p || q, IFF = (p, q) => p === q;
// The five connectors of the programme (negation is one-variable and shown in the pairs).
export const CONNECTIVES = {
  and: { label: "P ∧ Q", name: ["ET", "AND"], fn: (p, q) => p && q },
  or: { label: "P ∨ Q", name: ["OU inclusif", "inclusive OR"], fn: (p, q) => p || q },
  xor: { label: "P ⊕ Q", name: ["OU exclusif", "exclusive OR"], fn: (p, q) => p !== q },
  imp: { label: "P ⇒ Q", name: ["implication", "implication"], fn: IMP },
  iff: { label: "P ⇔ Q", name: ["équivalence", "equivalence"], fn: IFF },
};
export const TARGETS = Object.keys(CONNECTIVES);
export const column = (id) => ROWS.map(([p, q]) => CONNECTIVES[id].fn(p, q));
export const EMPTY = "????";

// What the learner has entered in the result column of the target (a string of four characters V, F or ?).
export function tableModel(s) {
  const want = column(s.target);
  const cells = [...s.cells].slice(0, 4);
  const entered = cells.map((c) => (c === "V" ? true : c === "F" ? false : null));
  const right = entered.map((e, i) => (e === null ? null : e === want[i]));
  return {
    want, entered, right,
    complete: entered.every((e) => e !== null),
    allCorrect: right.every((r) => r === true),
    wrong: right.filter((r) => r === false).length,
  };
}

// Six pairs of formulas: five are equivalent, one is not (an implication and its converse).
export const PAIRS = {
  morgan: { left: ["¬(P ∧ Q)", (p, q) => NOT(p && q)], right: ["¬P ∨ ¬Q", (p, q) => NOT(p) || NOT(q)], name: ["première loi de De Morgan", "first De Morgan law"] },
  impor: { left: ["P ⇒ Q", IMP], right: ["¬P ∨ Q", (p, q) => NOT(p) || q], name: ["implication et disjonction", "implication and disjunction"] },
  negimp: { left: ["¬(P ⇒ Q)", (p, q) => NOT(IMP(p, q))], right: ["P ∧ ¬Q", (p, q) => p && NOT(q)], name: ["négation d’une implication", "negation of an implication"] },
  iff2: { left: ["P ⇔ Q", IFF], right: ["(P ⇒ Q) ∧ (Q ⇒ P)", (p, q) => IMP(p, q) && IMP(q, p)], name: ["double implication", "double implication"] },
  xor: { left: ["P ⊕ Q", (p, q) => p !== q], right: ["¬(P ⇔ Q)", (p, q) => NOT(IFF(p, q))], name: ["ou exclusif et équivalence", "exclusive or and equivalence"] },
  conv: { left: ["P ⇒ Q", IMP], right: ["Q ⇒ P", (p, q) => IMP(q, p)], name: ["implication et réciproque", "implication and converse"] },
};
export const PAIR_IDS = Object.keys(PAIRS);

export function pairModel(id) {
  const p = PAIRS[id];
  const left = ROWS.map(([a, b]) => p.left[1](a, b)), right = ROWS.map(([a, b]) => p.right[1](a, b));
  const differing = left.map((x, i) => x !== right[i]);
  return { left, right, differing, diff: differing.filter(Boolean).length, equivalent: differing.every((d) => !d), leftLabel: p.left[0], rightLabel: p.right[0] };
}

// ---- the counter-example hunt ------------------------------------------------------------------------------------
export const N_MAX = 40;
export const CLAIMS = {
  prime: { text: ["∀n ∈ ℕ, n² + n + 17 est premier", "∀n ∈ ℕ, n² + n + 17 is prime"], test: (n) => isPrime(n * n + n + 17), value: (n) => n * n + n + 17 },
  pow: { text: ["∀n ∈ ℕ, 2ⁿ > n²", "∀n ∈ ℕ, 2ⁿ > n²"], test: (n) => 2 ** n > n * n, value: (n) => 2 ** n },
  sq: { text: ["∀n ∈ ℕ, n² ≥ n", "∀n ∈ ℕ, n² ≥ n"], test: (n) => n * n >= n, value: (n) => n * n },
};
export const CLAIM_IDS = Object.keys(CLAIMS);
export const counterexamples = (claim) => Array.from({ length: N_MAX + 1 }, (_, n) => n).filter((n) => !CLAIMS[claim].test(n));

export function huntModel(s) {
  const c = CLAIMS[s.claim], list = counterexamples(s.claim);
  return { holds: c.test(s.n), counter: !c.test(s.n), value: c.value(s.n), list, first: list.length ? list[0] : null, flags: Array.from({ length: N_MAX + 1 }, (_, n) => c.test(n)) };
}

// ---- a quantified statement on a finite set ----------------------------------------------------------------------
export const STATEMENTS = {
  "all-even": { quant: "all", text: "∀x ∈ E, x est pair", textEn: "∀x ∈ E, x is even", set: [2, 4, 6, 8, 10, 13, 14, 16], pred: (x) => x % 2 === 0 },
  "some-seven": { quant: "some", text: "∃x ∈ E, x est un multiple de 7", textEn: "∃x ∈ E, x is a multiple of 7", set: [3, 5, 9, 11, 13, 16, 19, 22], pred: (x) => x % 7 === 0 },
};
export const STATEMENT_IDS = Object.keys(STATEMENTS);
const bit = (mask, i) => (mask >> i) & 1;

export function negateModel(s) {
  const st = STATEMENTS[s.stmt], n = st.set.length;
  const marks = st.set.map((x, i) => ({ x, checked: !!bit(s.checked, i), holds: st.pred(x) }));
  const done = marks.filter((m) => m.checked);
  const all = st.quant === "all";
  // the decisive tile: a checked tile where P fails (for ∀) or holds (for ∃)
  const witness = done.find((m) => (all ? !m.holds : m.holds)) || null;
  const verdict = witness ? (all ? "false" : "true") : done.length === n ? (all ? "true" : "false") : "open";
  const truth = all ? st.set.every(st.pred) : st.set.some(st.pred);   // the real value, known to the model only
  return {
    marks, quant: st.quant, n, count: done.length, witness, verdict, truth,
    negation: all ? "∃x ∈ E, x ne vérifie pas P" : "∀x ∈ E, x ne vérifie pas P",
    refuted: st.quant === "all" && !!witness,
    complete: done.length === n,
  };
}

// ---- the whole state ----------------------------------------------------------------------------------------------
export function model(s) {
  return { table: tableModel(s), pair: pairModel(s.pair), hunt: huntModel(s), negate: negateModel(s) };
}

// Numbers a mission or a test may ask for, recomputed from the state.
export const quantities = {
  falseLinesImp: () => column("imp").filter((v) => !v).length,
  diffConverse: () => pairModel("conv").diff,
  firstCounterexample: (s) => huntModel({ ...s, claim: "prime" }).first,
};
export const quantity = (name, s) => quantities[name](s);
