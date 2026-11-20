// Experiment `function-symmetry` (template figure): Malagasy T11 S chapter 1 "Généralités sur les fonctions numériques". Two
// activities of the programme's study of a function: parity (compare f(a) and f(-a) on the curve) and periodicity (slide the curve
// by T and see whether it falls back on itself). State {fn, a, k, view}; the handle is the abscissa a on the x-axis, the slider is the
// translation T = k pi / 12. Pure maths: models/function-symmetry.js; independent check: scripts/check-mada-t11s-functions.py.
// NOT YET REGISTERED in registry.js (the chapter is unpublished: the owner's publication gate, no manifest entry). To publish:
// import it there, add it to EXPERIMENTS, and name it in the chapter's `labs`; the template `figure` is already registered.
import * as M from "../models/function-symmetry.js";
import { clamp, snap } from "../models/num.js";

const { model, FUNCTIONS, FN_IDS, A_MIN, A_MAX, K_MAX, shiftOf } = M;
const both = (s) => [s, s];
const PI = Math.PI;
const piText = (k) => (k === 0 ? "0" : k % 12 === 0 ? (k === 12 ? "π" : `${k / 12}π`) : `${k}π/12`.replace(/^1π/, "π"));

export default {
  id: "function-symmetry", template: "figure",
  symbol: "f", group: ["Analyse", "Analysis"],
  title: ["Miroir et translation d’une courbe", "Mirror and translation of a curve"],
  short: ["Parité et périodicité", "Parity and periodicity"],
  intro: [
    "Compare f(a) et f(−a) sur sept courbes, puis fais glisser une courbe sur elle-même : la parité et la période se lisent sur le dessin avant de se démontrer.",
    "Compare f(a) and f(−a) on seven curves, then slide a curve over itself: parity and period can be read on the picture before they are proved.",
  ],
  duration: 12,
  level: ["Première S (programme malgache T11)", "Grade 11 S (Malagasy T11)"],
  prereq: ["Lire une image sur une courbe, fonctions de référence, sinus et cosinus", "Reading an image on a curve, reference functions, sine and cosine"],
  model: M,
  state: { fn: "sq", a: 1.5, k: 0, view: "parity" },
  onlyUnlocked: true,
  controls: {
    a: {
      kind: "handle", color: "object", grid: 0.5, label: ["Abscisse a", "Abscissa a"],
      at: (s) => [s.a, 0],
      drag: (s, x) => ({ a: clamp(snap(x, 0.5), A_MIN, A_MAX) }),
      valuetext: (s, f) => `a = ${f.num(s.a)}`,
    },
    fn: {
      kind: "choice", label: ["Fonction", "Function"], presentation: "select",
      options: FN_IDS.map((id) => ({ value: id, label: both(FUNCTIONS[id].label) })), key: "fn",
    },
    k: {
      kind: "slider", key: "k", label: ["Translation T (en douzièmes de π)", "Translation T (in twelfths of π)"], min: 0, max: K_MAX, step: 1, digits: 0,
      format: (v) => piText(v),
    },
  },
  views: {
    panels: ["figure"],
    figure: {
      x: [-6.5, 6.5], y: [-5, 5], equal: false, xTicks: [-6, -4, -2, 0, 2, 4, 6], yTicks: [-4, -2, 0, 2, 4],
      scene(s, { fmt }) {
        const F = FUNCTIONS[s.fn], m = model(s);
        if (s.view === "period") {
          const T = shiftOf(s.k);
          return {
            curves: [
              { f: F.f, color: "object", width: 3, samples: 400 },
              ...(s.k > 0 ? [{ f: (x) => F.f(x + T), color: m.period.isPeriod ? "pos" : "obj2", width: 2.5, dash: [7, 5], samples: 400 }] : []),
            ],
            lines: s.k > 0 ? [{ a: [0, 0], b: [-T, 0], color: "obj2", width: 3, arrow: true }] : [],
            points: [],
            texts: [],
          };
        }
        const p = m.parity, a = s.a;
        const pts = [];
        const ok = (y) => Math.abs(y) <= 5;
        const tone = p.same ? "pos" : p.opposite ? "obj2" : "neg";
        return {
          curves: [{ f: F.f, color: "object", width: 3, samples: 400 }],
          lines: [
            { a: [a, 0], b: [a, clamp(p.fa, -5, 5)], color: "object", width: 2, dash: [5, 5] },
            { a: [-a, 0], b: [-a, clamp(p.fma, -5, 5)], color: tone, width: 2, dash: [5, 5] },
            { a: [0, -5], b: [0, 5], color: "muted", width: 1.2, dash: [3, 6] },
          ],
          points: [
            ...(ok(p.fa) ? [{ at: [a, p.fa], color: "object", r: 6, label: `f(${fmt.num(a)})`, dx: 10, dy: -10 }] : []),
            ...(ok(p.fma) ? [{ at: [-a, p.fma], color: tone, r: 6, label: `f(${fmt.num(-a)})`, dx: -10, dy: -10, anchor: "right" }] : []),
            ...pts,
          ],
          texts: [],
        };
      },
      measure(s, { fmt }) {
        const m = model(s);
        if (s.view === "period") {
          if (s.k === 0) return { text: fmt.fr ? "T = 0 : choisis une translation" : "T = 0: choose a translation", color: "muted" };
          return { text: m.period.isPeriod ? (fmt.fr ? "la courbe retombe sur elle-même" : "the curve falls back on itself") : (fmt.fr ? `écart maximal ${fmt.num(m.period.gap)}` : `largest gap ${fmt.num(m.period.gap)}`), color: m.period.isPeriod ? "pos" : "neg" };
        }
        const p = m.parity;
        return { text: `f(−a) ${p.same ? "= f(a)" : p.opposite ? "= −f(a)" : "≠ ±f(a)"}`, color: p.same ? "pos" : p.opposite ? "obj2" : "neg" };
      },
    },
    formula(s, { fmt }) {
      const F = FUNCTIONS[s.fn];
      if (s.view === "period") return `${F.label} ; T = ${piText(s.k)}`;
      return F.label;
    },
    readout(s, { fmt }) {
      const m = model(s);
      if (s.view === "period") return [
        [["Translation T", "Translation T"], piText(s.k)],
        [["Écart maximal |f(x+T) − f(x)|", "Largest gap |f(x+T) − f(x)|"], fmt.num(m.period.gap)],
      ];
      const p = m.parity;
      return [
        [["a", "a"], fmt.num(p.a)],
        [["f(a)", "f(a)"], fmt.num(p.fa)],
        [["f(−a)", "f(−a)"], fmt.num(p.fma)],
      ];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { fn: "sq", a: 1.5, k: 0, view: "parity" }, correct: 0,
      prompt: [
        "Pour f(x) = x²/3 − 2, on a f(3) = 1. Sans tracer, que vaut f(−3) ?",
        "For f(x) = x²/3 − 2 we have f(3) = 1. Without drawing, what is f(−3)?",
      ],
      choices: [["1", "1"], ["−1", "−1"], ["−5", "−5"]],
    },
    {
      id: "mirror", kind: "explore", set: { fn: "sq", a: 1.5, k: 0, view: "parity" }, unlock: ["a", "fn"],
      prompt: [
        "Déplace a, puis parcours les sept fonctions. Pour la première, f(−a) = f(a) partout. Trouve une fonction pour laquelle f(−a) est l’opposé de f(a).",
        "Move a, then browse the seven functions. For the first one, f(−a) = f(a) everywhere. Find a function for which f(−a) is the opposite of f(a).",
      ],
      goal: (s, m) => m.parity.parity === "odd" && m.parity.opposite,
      done: [
        "Quand f(−a) = f(a), la courbe se reflète dans l’axe des ordonnées : f est paire. Quand f(−a) = −f(a), elle est invariante par le demi-tour autour de l’origine : f est impaire.",
        "When f(−a) = f(a), the curve is mirrored in the y-axis: f is even. When f(−a) = −f(a), it is unchanged by the half-turn about the origin: f is odd.",
      ],
    },
    {
      id: "neither", kind: "explore", set: { fn: "sq", a: 1.5, k: 0, view: "parity" }, unlock: ["a", "fn"],
      prompt: [
        "Une fonction n’est pas forcément paire ou impaire. Trouve une courbe pour laquelle f(−a) n’est ni f(a) ni −f(a), et repère le point où l’on voit la différence.",
        "A function need not be even or odd. Find a curve for which f(−a) is neither f(a) nor −f(a), and spot the point where the difference shows.",
      ],
      goal: (s, m) => m.parity.parity === "none" && m.parity.verdict === "neither",
      done: [
        "Un seul a pour lequel f(−a) n’est ni f(a) ni −f(a) suffit : la fonction n’est ni paire ni impaire. Pour démontrer qu’elle est paire, au contraire, un exemple ne suffit pas : il faut f(−x) = f(x) pour tout x du domaine.",
        "A single a for which f(−a) is neither f(a) nor −f(a) is enough: the function is neither even nor odd. To prove it is even, on the other hand, one example is not enough: f(−x) = f(x) is needed for every x of the domain.",
      ],
    },
    {
      id: "period", kind: "explore", set: { fn: "cos2", a: 1.5, k: 0, view: "period" }, unlock: ["k"],
      prompt: [
        "La courbe pleine est celle de f(x) = 2 cos(2x). Fais glisser la courbe en pointillés avec la translation T : pour quelles valeurs retombe-t-elle sur la première ? Trouve la plus petite.",
        "The solid curve is f(x) = 2 cos(2x). Slide the dashed curve with the translation T: for which values does it fall back on the first one? Find the smallest.",
      ],
      goal: (s, m) => m.period.minimal,
      done: [
        "La plus petite translation est T = π, puis 2π, 3π... : f(x + π) = f(x) pour tout x, f est périodique de période π. On peut donc l’étudier sur un seul intervalle de longueur π, et même sur [0 ; π/2] puisqu’elle est aussi paire.",
        "The smallest translation is T = π, then 2π, 3π...: f(x + π) = f(x) for every x, so f is periodic with period π. It can be studied on a single interval of length π, even on [0, π/2] since it is also even.",
      ],
    },
    {
      id: "why", kind: "explain", set: { fn: "cos2", a: 1.5, k: 12, view: "period" },
      prompt: [
        "Pourquoi suffit-il d’étudier une fonction paire sur [0 ; +∞[ et une fonction périodique sur un seul intervalle de longueur égale à sa période ?",
        "Why is it enough to study an even function on [0, +∞) and a periodic function on a single interval of length equal to its period?",
      ],
      argument: [
        "Si f est paire, la partie de la courbe pour x < 0 est le symétrique de celle pour x > 0 par rapport à l’axe des ordonnées : on la déduit sans calcul. Si f est périodique de période T, la courbe sur [a ; a + T] est recopiée par translation de vecteur kT sur chaque intervalle suivant ou précédent. Dans les deux cas, une partie du travail est faite d’avance par une symétrie ou une translation, et ce que l’on démontre sur la partie étudiée vaut partout.",
        "If f is even, the part of the curve for x < 0 is the mirror image of the part for x > 0 in the y-axis: it follows without computation. If f is periodic with period T, the curve on [a, a + T] is copied by the translation of vector kT on every following or preceding interval. In both cases part of the work is done in advance by a symmetry or a translation, and what is proved on the studied part holds everywhere.",
      ],
    },
  ],
  conclusion: [
    "Une symétrie ou une périodicité réduit l’étude : f paire se lit sur [0 ; +∞[, f impaire aussi, f périodique de période T sur un intervalle de longueur T. Le dessin le suggère ; seul un calcul valable pour tout x du domaine le démontre.",
    "A symmetry or a periodicity shortens the study: an even or odd f is read on [0, +∞), a periodic f with period T on an interval of length T. The picture suggests it; only a calculation valid for every x of the domain proves it.",
  ],
  history: {
    title: ["Euler · 1748", "Euler · 1748"],
    story: [
      "Leonhard Euler donne à la notion de fonction son sens moderne dans l’« Introductio in analysin infinitorum » (1748) et emploie l’écriture f(x) dès les années 1730. Dans le même ouvrage, il étudie les fonctions sinus et cosinus, qui se répètent, comme des fonctions à part entière.",
      "Leonhard Euler gives the notion of function its modern meaning in the “Introductio in analysin infinitorum” (1748) and uses the notation f(x) from the 1730s. In the same book he treats sine and cosine, which repeat, as functions in their own right.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Euler/",
  },
};
