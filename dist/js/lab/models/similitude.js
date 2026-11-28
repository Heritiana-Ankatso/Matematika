// Pure maths of the experiment `similitude` (Malagasy T12 C chapter 7, « Similitudes planes »). A similitude is written
// as a complex map {a, b, conj}: z' = a z + b (direct) or z' = a z̄ + b (indirect), a ≠ 0. The experiment gives it by its
// centre Ω, its ratio k and an angle: for a direct one the angle α (a = k e^{iα}, b = ω(1 − a)); for an indirect one the
// direction θ of its axis through Ω (a = k e^{2iθ}, b = ω − a ω̄). Points are [x, y] = x + iy. No DOM.
const clean = (x) => (Object.is(x, -0) || Math.abs(x) < 1e-12 ? 0 : x);
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

export const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
export const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
export const mul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
export const conj = (p) => [p[0], -p[1]];
export const abs = (p) => Math.hypot(p[0], p[1]);
export const div = (p, q) => { const d = q[0] * q[0] + q[1] * q[1]; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };
export const polar = (r, d) => [clean(r * Math.cos(rad(d))), clean(r * Math.sin(rad(d)))];
export const tidy = (p) => p.map((v) => clean(Number(v.toFixed(12))));
// argument in degrees in ]-180, 180], null for 0
export const arg = (p) => (abs(p) < 1e-12 ? null : clean(Number(deg(Math.atan2(p[1], p[0])).toFixed(9))));
export const turn = (d) => { let t = ((d % 360) + 360) % 360; if (t > 180) t -= 360; return clean(t); };

// The similitude of a state {kind, k, angle, ox, oy}.
export function simOf(s) {
  const w = [s.ox, s.oy];
  if (s.kind === "indirect") { const a = polar(s.k, 2 * s.angle); return { a, b: tidy(sub(w, mul(a, conj(w)))), conj: true }; }
  const a = polar(s.k, s.angle);
  return { a, b: tidy(mul(w, sub([1, 0], a))), conj: false };
}
export const apply = (f, z) => add(mul(f.a, f.conj ? conj(z) : z), f.b);
// g ∘ f: first f, then g
export const compose = (g, f) => ({
  a: tidy(mul(g.a, g.conj ? conj(f.a) : f.a)),
  b: tidy(add(mul(g.a, g.conj ? conj(f.b) : f.b), g.b)),
  conj: f.conj !== g.conj,
});
// The fixed point: b / (1 − a) for a direct map with a ≠ 1, (a b̄ + b) / (1 − |a|²) for an indirect one with |a| ≠ 1.
// Otherwise null: a translation or the identity (direct, a = 1), a reflection or a glide reflection (indirect, |a| = 1).
export function fixedPoint(f) {
  if (!f.conj) return abs(sub([1, 0], f.a)) < 1e-12 ? null : tidy(div(f.b, sub([1, 0], f.a)));
  const n = 1 - (f.a[0] ** 2 + f.a[1] ** 2);
  return Math.abs(n) < 1e-12 ? null : tidy(add(mul(f.a, conj(f.b)), f.b).map((v) => v / n));
}
export const ratio = (f) => abs(f.a);
// angle of a direct map (arg a), or direction of the axis of an indirect one (arg a / 2, in ]-90, 90])
export const angleOf = (f) => { const t = arg(f.a); return t === null ? null : f.conj ? clean(t / 2) : t; };

// The second similitude offered for a composition.
export const SECONDS = {
  none: null,
  rot: { a: [0, 1], b: [0, 0], conj: false },     // rotation of centre O and angle 90°
  hom: { a: [-0.5, 0], b: [0, 0], conj: false },  // homothety of centre O and ratio −1/2
  refl: { a: [1, 0], b: [0, 0], conj: true },     // reflection in the axis (Ox)
};

// The figure: a little house with a chimney on the right, so that a reflection shows. A, B, C name three of its corners.
export const HOUSE = [[1, 0.5], [2.5, 0.5], [2.5, 1.75], [2.25, 2], [2.25, 2.45], [2, 2.45], [2, 2.25], [1.75, 2.5], [1, 1.75]];
export const CORNERS = { A: HOUSE[0], B: HOUSE[1], C: HOUSE[7] };
export const area = (pts) => Math.abs(pts.reduce((t, p, i) => { const q = pts[(i + 1) % pts.length]; return t + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
// orientation of the triangle A, B, C: +1 counterclockwise, −1 clockwise
export const orientation = (A, B, C) => Math.sign((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]));

export function model(s) {
  const f = simOf(s), F = (z) => tidy(apply(f, z)), M = [s.mx, s.my], M2 = F(M), centre = [s.ox, s.oy];
  const g = SECONDS[s.second] || null, gf = g ? compose(g, f) : null, house = HOUSE.map(F);
  const om = abs(sub(M, centre)), om2 = abs(sub(M2, centre));
  return {
    f, M, M2, centre, house, g, gf,
    k: s.k,
    // the centre is the only fixed point unless k = 1 (a rotation by 0 is the identity; an indirect isometry fixes its axis)
    centreUnique: fixedPoint(f) !== null,
    distM: om, distM2: om2,
    areaRatio: area(house) / area(HOUSE),
    sameOrientation: orientation(...["A", "B", "C"].map((c) => F(CORNERS[c]))) === orientation(CORNERS.A, CORNERS.B, CORNERS.C),
    fixedM: abs(sub(M2, M)) < 1e-9,
    twice: gf ? HOUSE.map((z) => tidy(apply(gf, z))) : null,
    gfCentre: gf ? fixedPoint(gf) : null,
    gfRatio: gf ? ratio(gf) : null,
    gfAngle: gf ? angleOf(gf) : null,
  };
}

export const quantities = {
  centreY: (s) => model(s).centre[1],
  areaRatio: (s) => model(s).areaRatio,
  k: (s) => s.k,
};
export const quantity = (name, s) => quantities[name](s);
