// Pure maths of the group laboratories (no DOM, no Math.random): permutations of n cards (the symmetric group Sₙ), the
// symmetries of a regular polygon (the dihedral group Dₙ) and the Rubik's cube as a group of moves acting on its 54
// stickers. Positions and cards are numbered from 0 here; the pages show them from 1.

// ---------------------------------------------------------------- permutations
// A permutation of {0, …, n−1} is an array p with p[i] = image of i. "Apply σ to the cards" sends the card at position i
// to position σ(i).
export const identity = (n) => Array.from({ length: n }, (_, i) => i);
// (p ∘ q)(i) = p(q(i)): first q, then p
export const compose = (p, q) => q.map((x) => p[x]);
export const inverse = (p) => { const r = Array(p.length); p.forEach((y, x) => { r[y] = x; }); return r; };
export const isIdentity = (p) => p.every((y, i) => y === i);
export function power(p, k) {
  let r = identity(p.length), b = k >= 0 ? p : inverse(p);
  for (let i = 0; i < Math.abs(k); i++) r = compose(b, r);
  return r;
}
// disjoint cycles (fixed points left out unless `all`)
export function cycles(p, all = false) {
  const seen = new Array(p.length).fill(false), out = [];
  for (let i = 0; i < p.length; i++) {
    if (seen[i]) continue;
    const c = []; let x = i;
    while (!seen[x]) { seen[x] = true; c.push(x); x = p[x]; }
    if (c.length > 1 || all) out.push(c);
  }
  return out;
}
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a, b) => (a / gcd(a, b)) * b;
export const order = (p) => cycles(p).reduce((m, c) => lcm(m, c.length), 1);
// least number of swaps (transpositions) that give p: n − (number of cycles, fixed points included)
export const minSwaps = (p) => p.length - cycles(p, true).length;
export const sign = (p) => (minSwaps(p) % 2 ? -1 : 1);
export const cycleText = (p) => { const c = cycles(p); return c.length ? c.map((x) => `(${x.map((i) => i + 1).join(" ")})`).join("") : "id"; };
// "(1 2 3)(4 5)" in Sₙ → array; positions written from 1
export function fromCycles(text, n) {
  const p = identity(n);
  for (const m of String(text).matchAll(/\(([^)]*)\)/g)) {
    const c = m[1].trim().split(/[\s,]+/).filter(Boolean).map((x) => Number(x) - 1);
    if (c.some((x) => !Number.isInteger(x) || x < 0 || x >= n) || new Set(c).size !== c.length) throw new Error("bad cycle");
    c.forEach((x, i) => { p[x] = c[(i + 1) % c.length]; });
  }
  return p;
}
// The cards after applying a word of permutations, rightmost first: arrangement[pos] = card at that position.
// Applying σ moves the card at position i to position σ(i): new[σ(i)] = old[i].
export const applyTo = (cards, p) => { const r = Array(cards.length); cards.forEach((c, i) => { r[p[i]] = c; }); return r; };

// ---------------------------------------------------------------- dihedral group Dₙ
// An element is {k, s}: first the reflection τ if s = 1 (axis through vertex 0), then the rotation rᵏ (angle 2πk/n).
// As a map of the vertex positions: i ↦ (s ? −i : i) + k (mod n).
const mod = (a, n) => ((a % n) + n) % n;
export const dIdentity = { k: 0, s: 0 };
export const dPerm = (n, g) => Array.from({ length: n }, (_, i) => mod((g.s ? -i : i) + g.k, n));
// (a ∘ b): first b, then a. rᵃτ^α ∘ rᵇτ^β = r^(a + (−1)^α b) τ^(α+β)
export const dMul = (n, a, b) => ({ k: mod(a.k + (a.s ? -b.k : b.k), n), s: (a.s + b.s) % 2 });
export const dInverse = (n, g) => (g.s ? { ...g } : { k: mod(-g.k, n), s: 0 });
export const dOrder = (n, g) => (g.s ? 2 : n / gcd(g.k || n, n));
export const dName = (g, fr = true) => (g.s ? (g.k ? `r${sup(g.k)}τ` : "τ") : g.k ? `r${sup(g.k)}` : "e");
export const R = { k: 1, s: 0 }, T = { k: 0, s: 1 };
// apply a word written as a string of 'r', 'R' (r⁻¹) and 't' to the identity, the leftmost letter acting first
export function dWord(n, word) {
  let g = dIdentity;
  for (const c of word) g = dMul(n, c === "r" ? R : c === "R" ? { k: n - 1, s: 0 } : T, g);
  return g;
}
const SUP = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹", "-": "⁻" };
export const sup = (k) => (k === 1 ? "" : String(k).split("").map((c) => SUP[c]).join(""));

// ---------------------------------------------------------------- Rubik's cube
// 54 stickers. Each sticker has a cubie position p ∈ {−1, 0, 1}³ and an outward normal n (a unit axis vector). A face turn
// rotates by a quarter turn every sticker whose cubie lies in the layer, clockwise when looking at that face. The colour of a
// sticker is the face it started on. x to the right (R), y up (U), z towards the viewer (F).
export const FACES = ["U", "D", "R", "L", "F", "B"];
const NORMAL = { U: [0, 1, 0], D: [0, -1, 0], R: [1, 0, 0], L: [-1, 0, 0], F: [0, 0, 1], B: [0, 0, -1] };
export function solvedStickers() {
  const out = [];
  for (const f of FACES) {
    const nv = NORMAL[f], axis = nv.findIndex((v) => v !== 0);
    for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
      const p = [0, 0, 0], others = [0, 1, 2].filter((i) => i !== axis);
      p[axis] = nv[axis]; p[others[0]] = a; p[others[1]] = b;
      out.push({ face: f, p, n: nv.slice() });
    }
  }
  return out;
}
// quarter turn about the axis (0 x, 1 y, 2 z), positive = counter-clockwise seen from the + side
const rot = (v, axis, q) => {
  const [i, j] = axis === 0 ? [1, 2] : axis === 1 ? [2, 0] : [0, 1];
  let r = v.slice();
  for (let t = 0; t < mod(q, 4); t++) { const a = r[i], b = r[j]; r[i] = -b; r[j] = a; }
  return r;
};
// a move: face letter, then ' for the inverse or 2 for a half turn
export function moveSpec(m) {
  const f = m[0], nv = NORMAL[f], axis = nv.findIndex((v) => v !== 0), side = nv[axis];
  const turns = m.endsWith("2") ? 2 : m.endsWith("'") ? -1 : 1;
  // clockwise seen from the face = negative rotation about the outward normal
  return { face: f, axis, side, q: -side * turns, turns };
}
export function applyMove(stickers, m) {
  const { axis, side, q } = moveSpec(m);
  return stickers.map((s) => (s.p[axis] === side ? { ...s, p: rot(s.p, axis, q), n: rot(s.n, axis, q) } : s));
}
export const parseMoves = (text) => (String(text).match(/[UDRLFB](?:2|')?/g) || []);
export const applyMoves = (stickers, moves) => moves.reduce(applyMove, stickers);
export const invertMoves = (moves) => moves.slice().reverse().map((m) => (m.endsWith("2") ? m : m.endsWith("'") ? m[0] : m + "'"));
const key = (s) => s.p.join(",") + "|" + s.n.join(",");
// the permutation of the 54 sticker places produced by a sequence of moves
export function stickerPerm(moves) {
  const start = solvedStickers(), end = applyMoves(start, moves), index = new Map(start.map((s, i) => [key(s), i]));
  return end.map((s) => index.get(key(s)));
}
// how many times the sequence must be repeated before the cube is solved again (its order in the cube group)
export const sequenceOrder = (moves) => order(stickerPerm(moves));
// the cube looks solved when each face shows one colour
export function isSolved(stickers) {
  const seen = {};
  for (const s of stickers) { const k = s.n.join(","); if (seen[k] && seen[k] !== s.face) return false; seen[k] = s.face; }
  return true;
}
// stickers not in their starting place (cubies moved), counted by cubie
export function movedCubies(stickers) {
  const start = solvedStickers(), moved = new Set();
  stickers.forEach((s, i) => { if (key(s) !== key(start[i])) moved.add(start[i].p.join(",")); });
  return moved.size;
}
