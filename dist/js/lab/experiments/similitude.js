// Experiment `similitude` (template figure, listed under « Transformer le plan »): plane similarities, for the Malagasy
// T12 C chapter 7 « Similitudes planes ». One plane holds a little house, its image, a point M and its image M′. The
// similitude is given by its centre Ω (handle), its ratio k and an angle (sliders): the angle α of a direct similitude
// z′ = az + b, or the direction θ of the axis of an indirect one z′ = a z̄ + b; dragging M′ sets k and the angle at once.
// A second similitude can be composed after it. State {kind, k, angle, ox, oy, mx, my, second, hide}; `hide` keeps the
// centre out of the figure and the readout (the fixed-point hunt, the check). Pure maths: models/similitude.js.
import * as S from "../models/similitude.js";
import { clamp, snap } from "../models/num.js";

const { model } = S;
const P = (fr, en) => [fr, en];
const RANGE_X = 6, RANGE_Y = 4.5, KMAX = 3;
const near = (a, b) => Math.abs(a - b) < 1e-9;
const base = { kind: "direct", k: 1, angle: 45, ox: 0, oy: 0, mx: 3, my: -1, second: "none", hide: 0 };

// x + iy written as a person would: 2 + i, −1 − 2i, 3, i
function alg(num, [x, y]) {
  const im = Math.abs(y) === 1 ? "i" : `${num(Math.abs(y))}i`;
  if (y === 0) return num(x);
  if (x === 0) return `${y < 0 ? "−" : ""}${im}`;
  return `${num(x)} ${y < 0 ? "−" : "+"} ${im}`;
}
const paren = (text) => (text.includes(" ") || text.startsWith("−") ? `(${text})` : text);
function written(num, f) {
  const z = f.conj ? "z̄" : "z", a = f.a, b = f.b;
  const head = a[0] === 1 && a[1] === 0 ? z : a[0] === -1 && a[1] === 0 ? `−${z}` : `${paren(alg(num, a))}${z}`;
  if (b[0] === 0 && b[1] === 0) return `z′ = ${head}`;
  const tail = alg(num, b);
  return tail.startsWith("−") && !tail.includes(" ") ? `z′ = ${head} − ${tail.slice(1)}` : `z′ = ${head} + ${paren(tail)}`;
}
// the nature of the similitude in words
function nature(t, s) {
  const turnBy = S.turn(s.angle);
  if (s.kind === "indirect") return s.k === 1 ? t(P("réflexion (similitude indirecte de rapport 1)", "reflection (indirect similarity of ratio 1)")) : t(P("similitude indirecte", "indirect similarity"));
  if (turnBy === 0) return s.k === 1 ? t(P("identité", "identity")) : t(P(`homothétie de rapport ${s.k}`, `enlargement of ratio ${s.k}`));
  if (turnBy === 180) return t(P(`homothétie de rapport −${s.k}`, `enlargement of ratio −${s.k}`));
  return s.k === 1 ? t(P("rotation (similitude directe de rapport 1)", "rotation (direct similarity of ratio 1)")) : t(P("similitude directe", "direct similarity"));
}
const SECOND_NAMES = {
  rot: P("rotation de centre O et d’angle 90°", "rotation about O by 90°"),
  hom: P("homothétie de centre O et de rapport −1/2", "enlargement about O of ratio −1/2"),
  refl: P("réflexion d’axe (Ox)", "reflection in the axis (Ox)"),
};

// The image handle M′: from M′ the map gives a = (M′ − Ω) / (M − Ω), or (M′ − Ω) / conj(M − Ω) for an indirect one.
function fromImage(s, x, y) {
  const u = [s.mx - s.ox, s.my - s.oy];
  if (S.abs(u) < 1e-9) return null;
  const a = S.div([x - s.ox, y - s.oy], s.kind === "indirect" ? S.conj(u) : u), arg = S.arg(a);
  if (arg === null) return null;
  const k = clamp(snap(S.abs(a), 0.25), 0.25, KMAX);
  return { k, angle: S.turn(snap(s.kind === "indirect" ? arg / 2 : arg, 15)) };
}

export default {
  id: "similitude", template: "figure", section: "transform",
  symbol: "s", group: ["Géométrie", "Geometry"],
  title: ["Agrandir, tourner, retourner : les similitudes", "Enlarge, turn, flip: similarities"],
  short: ["Similitudes planes", "Plane similarities"],
  intro: [
    "Une similitude multiplie toutes les distances par un même nombre k, son rapport. La figure montre une petite maison, son image, un point M et son image M′ autour du centre Ω. Une similitude directe s’écrit z′ = az + b et garde le sens des figures ; une similitude indirecte s’écrit z′ = a z̄ + b et les retourne comme un miroir.",
    "A similarity multiplies every distance by the same number k, its ratio. The figure shows a little house, its image, a point M and its image M′ around the centre Ω. A direct similarity is written z′ = az + b and keeps the orientation of figures; an indirect one is written z′ = a z̄ + b and flips them like a mirror.",
  ],
  duration: 15,
  level: ["Terminale C", "Grade 12"],
  prereq: ["Nombres complexes, rotations et homothéties", "Complex numbers, rotations and enlargements"],
  model: S,
  state: base,
  controls: {
    centre: {
      kind: "handle", color: "obj2", grid: 0.5, label: ["Centre Ω de la similitude", "Centre Ω of the similarity"],
      at: (s) => [s.ox, s.oy],
      drag: (s, x, y) => (s.hide ? null : { ox: clamp(x, -5, 5), oy: clamp(y, -4, 4) }),
      hidden: (s) => !!s.hide,
      valuetext: (s, f) => (s.hide ? f.t(["caché", "hidden"]) : f.pt(s.ox, s.oy)),
    },
    point: {
      kind: "handle", color: "obj3", grid: 0.5, label: ["Point M", "Point M"],
      at: (s) => [s.mx, s.my],
      drag: (s, x, y) => ({ mx: clamp(x, -5, 5), my: clamp(y, -4, 4) }),
      valuetext: (s, f) => f.pt(s.mx, s.my),
    },
    image: {
      kind: "handle", color: "object",
      label: ["Image M′ de M (flèches : haut et bas changent le rapport, gauche et droite l’angle)", "Image M′ of M (arrows: up and down change the ratio, left and right the angle)"],
      at: (s) => model(s).M2,
      drag: fromImage,
      nudge: (s, dx, dy) => ({ k: clamp(snap(s.k + dy * 0.25, 0.25), 0.25, KMAX), angle: S.turn(s.angle + dx * 15) }),
      lattice: (s) => near(s.k / 0.25, Math.round(s.k / 0.25)) && near(s.angle / 15, Math.round(s.angle / 15)),
      valuetext: (s, f) => { const m = model(s); return `${f.pt(m.M2[0], m.M2[1])}, k = ${f.num(s.k)}`; },
    },
    ratio: { kind: "slider", key: "k", label: ["Rapport k", "Ratio k"], min: 0.25, max: KMAX, step: 0.25 },
    angle: { kind: "slider", key: "angle", label: ["Angle α (directe) ou direction θ de l’axe (indirecte), en degrés", "Angle α (direct) or direction θ of the axis (indirect), in degrees"], min: -180, max: 180, step: 15, format: (v) => `${v}°` },
    kind: {
      kind: "choice", key: "kind", label: ["Sorte de similitude", "Kind of similarity"],
      options: [{ value: "direct", label: ["directe : z′ = az + b", "direct: z′ = az + b"] }, { value: "indirect", label: ["indirecte : z′ = a z̄ + b", "indirect: z′ = a z̄ + b"] }],
    },
    second: {
      kind: "choice", key: "second", presentation: "select", label: ["Puis appliquer s₂", "Then apply s₂"],
      options: [{ value: "none", label: ["rien", "nothing"] }, ...Object.entries(SECOND_NAMES).map(([value, label]) => ({ value, label }))],
    },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [-RANGE_X, RANGE_X], y: [-RANGE_Y, RANGE_Y], equal: true, xTicks: [-6, -4, -2, 0, 2, 4, 6], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        const m = model(s), O = m.centre, scene = { polys: [], lines: [], arcs: [], points: [], texts: [] };
        // the axis of an indirect similitude, and the second line it keeps (perpendicular, through Ω)
        if (s.kind === "indirect" && !s.hide) {
          const d = S.polar(20, s.angle), e = S.polar(20, s.angle + 90);
          scene.lines.push({ a: S.sub(O, d), b: S.add(O, d), color: "obj2", width: 1.6, dash: [7, 6] });
          if (s.k !== 1) scene.lines.push({ a: S.sub(O, e), b: S.add(O, e), color: "obj2", width: 1, dash: [2, 6], alpha: 0.6 });
        }
        scene.polys.push({ pts: S.HOUSE, fill: "muted", alpha: 0.12, color: "muted", width: 1.6 });
        scene.polys.push({ pts: m.house, fill: "object", alpha: 0.25, color: "object", width: 2.2 });
        if (m.twice) scene.polys.push({ pts: m.twice, fill: "c6", alpha: 0.2, color: "c6", width: 2, dash: [6, 4] });
        // corners and their images: the order A, B, C turns the same way, or the other way
        for (const [name, z] of Object.entries(S.CORNERS)) {
          const w = S.tidy(S.apply(m.f, z));
          scene.points.push({ at: z, color: "muted", r: 3, label: name, dx: -14, dy: -6 }, { at: w, color: "object", r: 3.5, label: `${name}′`, dx: 6, dy: -6 });
        }
        // Ω, M, M′ and the angle at Ω
        if (S.abs(S.sub(m.M, O)) > 1e-9) {
          if (!s.hide) scene.lines.push({ a: O, b: m.M, color: "obj3", width: 1.4, dash: [5, 5] }, { a: O, b: m.M2, color: "object", width: 1.4, dash: [5, 5] });
          const from = S.arg(S.sub(m.M, O));
          if (!s.hide && s.kind === "direct" && S.turn(s.angle) !== 0 && from !== null) scene.arcs.push({ c: O, from, to: from + S.turn(s.angle), color: "obj2", width: 2.4, pixels: 30 });
          scene.lines.push({ a: m.M, b: m.M2, color: "muted", width: 1, dash: [2, 5] });
        }
        if (!s.hide) scene.points.push({ at: O, color: "obj2", r: 5, label: "Ω", dx: -16, dy: 18 });
        scene.points.push({ at: m.M, color: "obj3", r: 4, label: "M", dx: 9, dy: -9 }, { at: m.M2, color: "object", r: 4, label: "M′", dx: 9, dy: -9 });
        if (m.gfCentre && !s.hide) scene.points.push({ at: m.gfCentre, color: "c6", r: 4.5, hollow: true, label: fmt.t(["centre de s₂ ∘ s", "centre of s₂ ∘ s"]), dx: 8, dy: 18 });
        return scene;
      },
      measure(s, { fmt }) {
        return { text: s.kind === "indirect" ? `k = ${fmt.num(s.k)} · ${fmt.t(["axe", "axis"])} θ = ${fmt.num(S.turn(s.angle))}°` : `k = ${fmt.num(s.k)} · α = ${fmt.num(S.turn(s.angle))}°`, color: "obj2" };
      },
    },
    formula(s, { fmt }) {
      const m = model(s), e = [...m.f.a, ...m.f.b].every((v) => fmt.isExact(v)) ? "" : `${fmt.t(["valeurs arrondies", "rounded values"])} : `;
      return `${e}s : ${written(fmt.num, m.f).replace("z′ =", e ? "z′ ≈" : "z′ =")}`;
    },
    readout(s, { fmt }) {
      const m = model(s), t = fmt.t, num = fmt.num, fr = fmt.fr;
      let centre;
      if (s.hide) centre = t(["à trouver", "to be found"]);
      else if (!m.centreUnique) centre = s.kind === "direct" ? t(["tous les points sont fixes", "every point is fixed"]) : t(["tous les points de l’axe sont fixes", "every point of the axis is fixed"]);
      else centre = fmt.pt(s.ox, s.oy);
      const rows = [
        [["Nature", "Kind"], nature(t, s)],
        [["Rapport k", "Ratio k"], s.hide || S.abs(S.sub(m.M, m.centre)) < 1e-9 ? num(s.k) : `${num(s.k)} ${fr ? "et" : "and"} ΩM′ ÷ ΩM ${fmt.eq(m.distM2 / m.distM, 3)} ${num(m.distM2 / m.distM, 3)}`],
        s.kind === "indirect" ? [["Direction θ de l’axe", "Direction θ of the axis"], `${num(((S.turn(s.angle) % 180) + 180) % 180)}°`] : [["Angle α", "Angle α"], `${num(S.turn(s.angle))}°`],
        [["Centre Ω (point fixe)", "Centre Ω (fixed point)"], centre],
        [["M et son image M′", "M and its image M′"], `${fmt.pt(s.mx, s.my)} → ${fmt.pt(m.M2[0], m.M2[1])}`],
        [["Aire de l’image ÷ aire de la maison", "Area of the image ÷ area of the house"], `${fmt.eq(m.areaRatio, 3)} ${num(m.areaRatio, 3)} ; k² = ${num(s.k * s.k, 4)}`],
      ];
      if (!m.gf) rows.push([["s₂ ∘ s", "s₂ ∘ s"], t(["pas de seconde similitude", "no second similarity"])]);
      else {
        const a = m.gfAngle === null ? "" : m.gf.conj ? `, ${t(["axe", "axis"])} ${num(m.gfAngle)}°` : `, ${t(["angle", "angle"])} ${num(m.gfAngle)}°`;
        const c = m.gfCentre ? fmt.pt(m.gfCentre[0], m.gfCentre[1]) : t(["aucun centre unique", "no single centre"]);
        rows.push([["s₂ ∘ s", "s₂ ∘ s"], `${m.gf.conj ? t(["indirecte", "indirect"]) : t(["directe", "direct"])}, k = ${num(m.gfRatio, 3)}${a} ; ${t(["centre", "centre"])} ${c}`]);
      }
      return rows;
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { ...base }, correct: 1,
      prompt: [
        "Ici la similitude a pour rapport 1 : c’est une rotation de centre Ω, la maison tourne sans changer de taille. On passe au rapport 2, toutes les distances sont doublées. Par combien l’aire de la maison est-elle multipliée ?",
        "Here the similarity has ratio 1: it is a rotation about Ω, the house turns without changing size. The ratio becomes 2, every distance is doubled. By how much is the area of the house multiplied?",
      ],
      choices: [P("Par 2", "By 2"), P("Par 4", "By 4"), P("Par 8", "By 8")],
    },
    {
      id: "fixed", kind: "explore", set: { ...base, k: 1.5, angle: 90, ox: 1, oy: 0, mx: -1, my: 1, hide: 1 }, unlock: ["point"],
      scene: {
        title: ["Le centre caché", "The hidden centre"],
        caption: [
          "Une similitude directe de rapport 1,5 et d’angle 90° dont le centre est caché. Le seul point qui ne bouge pas est le centre Ω(1 ; 0) : quand M y arrive, M′ et M se confondent.",
          "A direct similarity of ratio 1.5 and angle 90° whose centre is hidden. The only point that does not move is the centre Ω(1, 0): when M gets there, M′ and M coincide.",
        ],
      },
      prompt: [
        "Le centre de cette similitude est caché. Déplace M jusqu’à ce que son image M′ soit M lui-même.",
        "The centre of this similarity is hidden. Move M until its image M′ is M itself.",
      ],
      hint: [
        "Quand M est loin du centre, M′ est encore plus loin (rapport 1,5) et un quart de tour plus loin. Rapproche M de l’endroit autour duquel la maison tourne.",
        "When M is far from the centre, M′ is even further away (ratio 1.5) and a quarter turn further round. Bring M towards the place the house turns about.",
      ],
      goal: (s, m) => m.fixedM,
      done: [
        "M′ = M : M est le centre Ω(1 ; 0). Une similitude directe qui n’est pas une translation a un seul point fixe, son centre, d’affixe b ÷ (1 − a).",
        "M′ = M: M is the centre Ω(1, 0). A direct similarity that is not a translation has exactly one fixed point, its centre, of affix b ÷ (1 − a).",
      ],
    },
    {
      id: "orient", kind: "contrast", set: { ...base, k: 1.5, angle: 30, ox: 1, oy: 1, mx: 3, my: 0 },
      scene: {
        title: ["Directe ou indirecte", "Direct or indirect"],
        caption: [
          "Rapport 1,5 et centre Ω(1 ; 1) dans les deux cas. La similitude directe d’angle 30° garde le sens A, B, C de la maison ; l’indirecte, d’axe incliné de 30°, la retourne : la cheminée change de côté.",
          "Ratio 1.5 and centre Ω(1, 1) in both cases. The direct similarity of angle 30° keeps the order A, B, C of the house; the indirect one, with its axis at 30°, flips it: the chimney changes side.",
        ],
      },
      variants: [
        { label: ["A : directe, z′ = az + b", "A: direct, z′ = az + b"], set: { kind: "direct" } },
        { label: ["B : indirecte, z′ = a z̄ + b", "B: indirect, z′ = a z̄ + b"], set: { kind: "indirect" } },
      ],
      prompt: [
        "Même rapport 1,5 et même centre. Compare la similitude directe (A) et l’indirecte (B). Dans quel cas la maison est-elle retournée, comme dans un miroir ? Regarde la cheminée et l’ordre A, B, C.",
        "Same ratio 1.5 and same centre. Compare the direct similarity (A) and the indirect one (B). In which case is the house flipped, as in a mirror? Look at the chimney and the order A, B, C.",
      ],
      done: [
        "La similitude indirecte (B) retourne la maison : A′, B′, C′ tournent dans l’autre sens que A, B, C. Elle est la composée d’une réflexion d’axe passant par Ω et d’une homothétie de centre Ω ; la directe (A) est la composée d’une rotation et d’une homothétie de même centre.",
        "The indirect similarity (B) flips the house: A′, B′, C′ turn the other way round from A, B, C. It is a reflection in an axis through Ω followed by an enlargement about Ω; the direct one (A) is a rotation followed by an enlargement with the same centre.",
      ],
    },
    {
      id: "compose", kind: "explore", set: { ...base, k: 2, angle: 0, ox: 2, oy: 1, mx: 1, my: 1, second: "rot" }, unlock: ["angle"],
      scene: {
        title: ["Deux similitudes à la suite", "Two similarities in a row"],
        caption: [
          "La similitude s est une homothétie de centre Ω(2 ; 1) et de rapport 2, puis s₂ fait un quart de tour autour de O. La composée s₂ ∘ s, en pointillés, a pour rapport 2 × 1 = 2 et pour angle 0° + 90° = 90°, avec un nouveau centre.",
          "The similarity s is an enlargement about Ω(2, 1) of ratio 2, then s₂ makes a quarter turn about O. The composition s₂ ∘ s, dashed, has ratio 2 × 1 = 2 and angle 0° + 90° = 90°, with a new centre.",
        ],
      },
      prompt: [
        "Après s, on applique s₂, le quart de tour de centre O : la maison en pointillés est l’image par s₂ ∘ s. Change l’angle α de s pour que s₂ ∘ s soit une homothétie (angle total 0° ou 180°).",
        "After s comes s₂, the quarter turn about O: the dashed house is the image under s₂ ∘ s. Change the angle α of s so that s₂ ∘ s is an enlargement (total angle 0° or 180°).",
      ],
      hint: [
        "Les angles s’ajoutent : l’angle de s₂ ∘ s est α + 90°.",
        "The angles add up: the angle of s₂ ∘ s is α + 90°.",
      ],
      goal: (s, m) => !!m.gf && !m.gf.conj && Math.abs(m.gf.a[1]) < 1e-9,
      done: [
        "Avec α = −90° (ou 90°), l’angle de s₂ ∘ s vaut 0° (ou 180°) : la composée est une homothétie de rapport 2 (ou −2). La composée de deux similitudes directes est une similitude directe : les rapports se multiplient, les angles s’ajoutent.",
        "With α = −90° (or 90°), the angle of s₂ ∘ s is 0° (or 180°): the composition is an enlargement of ratio 2 (or −2). Composing two direct similarities gives a direct similarity: the ratios multiply and the angles add up.",
      ],
    },
    {
      id: "book", kind: "check", set: { ...base, kind: "indirect", k: 2, angle: 0, ox: 0, oy: 1, mx: 2, my: 2, hide: 1 }, quantity: "centreY", answer: 1, tolerance: 0.01,
      scene: {
        title: ["L’exemple du cours : z′ = 2z̄ + 3i", "The lesson’s example: z′ = 2z̄ + 3i"],
        caption: [
          "La similitude z′ = 2z̄ + 3i est indirecte, de rapport 2. Son centre est le point fixe : z = 2z̄ + 3i donne x = 2x et y = −2y + 3, donc Ω = i, le point (0 ; 1), et son axe est la droite y = 1.",
          "The similarity z′ = 2z̄ + 3i is indirect, of ratio 2. Its centre is the fixed point: z = 2z̄ + 3i gives x = 2x and y = −2y + 3, so Ω = i, the point (0, 1), and its axis is the line y = 1.",
        ],
      },
      prompt: [
        "Voici la similitude indirecte z′ = 2z̄ + 3i (son écriture est sous la figure). Son centre Ω est caché. Quelle est l’ordonnée de Ω ?",
        "Here is the indirect similarity z′ = 2z̄ + 3i (written under the figure). Its centre Ω is hidden. What is the y-coordinate of Ω?",
      ],
      hint: [
        "Le centre est le point fixe : écris z = x + iy et résous z = 2z̄ + 3i, partie réelle et partie imaginaire.",
        "The centre is the fixed point: write z = x + iy and solve z = 2z̄ + 3i, real part and imaginary part.",
      ],
      because: [
        "z = 2z̄ + 3i donne x + iy = 2x − 2iy + 3i, donc x = 0 et 3y = 3 : Ω = i, d’ordonnée 1. La formule du cours (a b̄ + b) ÷ (1 − |a|²) = (−6i + 3i) ÷ (−3) = i donne le même point.",
        "z = 2z̄ + 3i gives x + iy = 2x − 2iy + 3i, so x = 0 and 3y = 3: Ω = i, with y-coordinate 1. The lesson’s formula (a b̄ + b) ÷ (1 − |a|²) = (−6i + 3i) ÷ (−3) = i gives the same point.",
      ],
    },
    {
      id: "why", kind: "explain", set: { ...base, k: 1.5, angle: 60, ox: 1, oy: 0, mx: 3, my: 0 },
      prompt: [
        "Pourquoi une similitude directe z′ = az + b multiplie-t-elle toutes les distances par |a|, et pourquoi a-t-elle un seul point fixe quand a ≠ 1 ?",
        "Why does a direct similarity z′ = az + b multiply every distance by |a|, and why does it have exactly one fixed point when a ≠ 1?",
      ],
      argument: [
        "Pour deux points M et N d’affixes z et w, les images ont pour affixes az + b et aw + b, donc z′ − w′ = a(z − w) et M′N′ = |a| × MN : le rapport est |a| pour tous les points à la fois. Un point fixe vérifie z = az + b, soit (1 − a)z = b ; si a ≠ 1 cette équation a une seule solution z = b ÷ (1 − a), le centre Ω. Alors z′ − ω = a(z − ω) : autour de Ω, la similitude tourne de arg a et agrandit de |a|. Pour z′ = a z̄ + b le même calcul donne M′N′ = |a| × MN, avec un conjugué qui retourne les figures.",
        "For two points M and N with affixes z and w, the images have affixes az + b and aw + b, so z′ − w′ = a(z − w) and M′N′ = |a| × MN: the ratio is |a| for every pair of points at once. A fixed point satisfies z = az + b, that is (1 − a)z = b; if a ≠ 1 this equation has exactly one solution z = b ÷ (1 − a), the centre Ω. Then z′ − ω = a(z − ω): about Ω the similarity turns by arg a and enlarges by |a|. For z′ = a z̄ + b the same computation gives M′N′ = |a| × MN, with a conjugate that flips figures.",
      ],
    },
  ],
  conclusion: [
    "Une similitude directe z′ = az + b, a ≠ 1, est la composée de la rotation de centre Ω et d’angle arg a et de l’homothétie de centre Ω et de rapport |a|, où Ω = b ÷ (1 − a) est son seul point fixe ; une similitude indirecte z′ = a z̄ + b y ajoute une réflexion. Composer deux similitudes multiplie les rapports. Les figures le montrent sur des exemples ; le calcul z′ − w′ = a(z − w) le démontre pour tous les points.",
    "A direct similarity z′ = az + b, a ≠ 1, is the rotation about Ω by arg a followed by the enlargement about Ω of ratio |a|, where Ω = b ÷ (1 − a) is its only fixed point; an indirect similarity z′ = a z̄ + b adds a reflection. Composing two similarities multiplies the ratios. The figures show this on examples; the computation z′ − w′ = a(z − w) proves it for every point.",
  ],
  history: {
    title: ["Wessel · 1799", "Wessel · 1799"],
    story: [
      "L’arpenteur danois Caspar Wessel présente en 1797 à l’Académie royale du Danemark, et publie en 1799, une représentation des nombres complexes par des segments du plan : multiplier revient à tourner et à agrandir, ce qu’écrit z′ = az.",
      "The Danish surveyor Caspar Wessel presented to the Royal Danish Academy in 1797, and published in 1799, a representation of complex numbers by segments of the plane: multiplying amounts to turning and enlarging, which is what z′ = az says.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Wessel/",
  },
};
