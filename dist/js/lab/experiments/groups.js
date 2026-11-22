// Experiments of the group `groups` (template group): a group seen acting. `shuffles` (the symmetric group Sₙ: shuffles of
// n cards, order of a shuffle, swaps and parity), `polygon` (the dihedral group Dₙ: the symmetries of a regular polygon, order
// matters, τ r τ = r⁻¹) and `rubik` (the Rubik's cube as a group of moves: the order of a sequence, commutators, and the
// picture hung on nails). Pure maths: models/groups.js. Linked from the Algèbre 1 sequence « Groupes ».
import * as G from "../models/groups.js";

const P = (fr, en) => [fr, en];
const ident = (n) => G.identity(n).join(",");

// ---------------------------------------------------------------- shuffles (Sₙ)
const SHUFFLES = [
  ["5|(1 2)", P("Échanger les deux premières (5 cartes)", "Swap the first two (5 cards)")],
  ["5|(1 2 3)", P("Faire tourner les trois premières (5 cartes)", "Rotate the first three (5 cards)")],
  ["5|(1 2 3)(4 5)", P("(1 2 3)(4 5) (5 cartes)", "(1 2 3)(4 5) (5 cards)")],
  ["5|(1 2 3 4 5)", P("Couper le paquet : (1 2 3 4 5)", "Cut the deck: (1 2 3 4 5)")],
  ["6|(1 6)(2 5)(3 4)", P("Retourner le paquet (6 cartes)", "Reverse the deck (6 cards)")],
  ["8|(2 3 5)(4 7 6)", P("Mélange parfait de 8 cartes", "Perfect shuffle of 8 cards")],
  ["7|(1 2 3)(4 5 6 7)", P("(1 2 3)(4 5 6 7) (7 cartes)", "(1 2 3)(4 5 6 7) (7 cards)")],
  ["8|(1 2 3 4 5)(6 7 8)", P("(1 2 3 4 5)(6 7 8) (8 cartes)", "(1 2 3 4 5)(6 7 8) (8 cards)")],
];
const shuffleSet = (v) => { const [n, sigma] = v.split("|"); return { n: +n, sigma, cards: ident(+n), k: 0, swaps: 0 }; };
const permModel = (s) => {
  const sigma = G.fromCycles(s.sigma, s.n), cards = s.cards.split(",").map(Number), arr = G.inverse(cards);
  return { sigma, order: G.order(sigma), swaps: G.minSwaps(arr), sign: G.sign(arr), back: cards.every((c, i) => c === i) };
};
export const shuffles = {
  id: "shuffles", template: "group", groupView: "cards", section: "groups", sub: P("Le groupe symétrique Sₙ", "The symmetric group Sₙ"),
  symbol: "Sₙ", group: P("Algèbre", "Algebra"),
  title: P("Mélanger des cartes", "Shuffling cards"),
  short: P("Permutations et groupe Sₙ", "Permutations and the group Sₙ"),
  intro: P(
    "Un mélange de n cartes est une permutation. On peut l’appliquer, le répéter, le défaire : les mélanges forment un groupe, et des nombres simples (ordre, nombre d’échanges) décrivent ce qu’ils font.",
    "A shuffle of n cards is a permutation. It can be applied, repeated and undone: the shuffles form a group, and simple numbers (order, number of swaps) describe what they do."),
  duration: 15,
  level: P("Lycée curieux · Université", "Curious students · University"),
  prereq: P("Compter, le ppcm", "Counting, the lowest common multiple"),
  model: { model: permModel, quantities: { swaps: P("Échanges pour tout remettre", "Swaps to put it back"), order: P("Ordre de σ", "Order of σ") }, quantity: (q, st) => permModel(st)[q] },
  state: { n: 5, sigma: "(1 2 3)(4 5)", cards: ident(5), k: 0, swaps: 0 },
  keys: P("Cliquez deux cartes pour les échanger (ou Tab puis Entrée) ; les boutons appliquent le mélange σ.", "Click two cards to swap them (or Tab then Enter); the buttons apply the shuffle σ."),
  controls: {
    sigma: {
      kind: "choice", presentation: "select", label: P("Mélange σ", "Shuffle σ"),
      options: SHUFFLES.map(([value, label]) => ({ value, label })),
      get: (s) => `${s.n}|${s.sigma}`, set: (s, v) => shuffleSet(v),
    },
    apply: {
      kind: "action", label: P("Mélanger", "Shuffle"),
      options: [{ value: "s", label: P("Appliquer σ", "Apply σ") }, { value: "reset", label: P("Remettre dans l’ordre", "Put back in order") }],
      act: (s, v) => (v === "reset" ? { cards: ident(s.n), k: 0, swaps: 0 } : { cards: G.applyTo(s.cards.split(",").map(Number), G.fromCycles(s.sigma, s.n)).join(","), k: s.k + 1 }),
    },
  },
  views: {
    panels: [],
    formula: (s) => `σ = ${s.sigma}`,
    readout: (s) => { const m = permModel(s); return [[P("Ordre de σ", "Order of σ"), String(m.order)], [P("σ appliqué", "σ applied"), String(s.k)]]; },
  },
  missions: [
    {
      id: "order", kind: "predict", set: shuffleSet("5|(1 2 3)(4 5)"), correct: 3,
      scene: { title: P("Six fois avant le retour", "Six times before coming back"), caption: P(
        "σ = (1 2 3)(4 5) : les cartes 1, 2, 3 tournent en rond, les cartes 4 et 5 s’échangent. Le petit cycle revient tous les 3 coups, l’échange tous les 2 : l’ordre de départ revient après un multiple de 3 et de 2, soit 6 applications.",
        "σ = (1 2 3)(4 5): cards 1, 2, 3 go round, cards 4 and 5 swap. The 3-cycle comes back every 3 moves, the swap every 2: the starting order comes back after a multiple of 3 and 2, so 6 applications.") },
      prompt: P("σ fait tourner les cartes 1, 2, 3 et échange 4 et 5. Combien de fois faut-il appliquer σ pour retrouver l’ordre de départ ?", "σ rotates cards 1, 2, 3 and swaps 4 and 5. How many times must σ be applied to get the starting order back?"),
      choices: [P("2 fois", "2 times"), P("3 fois", "3 times"), P("5 fois", "5 times"), P("6 fois", "6 times")],
    },
    {
      id: "perfect", kind: "explore", set: shuffleSet("8|(2 3 5)(4 7 6)"), unlock: ["apply"],
      scene: { title: P("Le mélange parfait des magiciens", "The magicians’ perfect shuffle"), caption: P(
        "On coupe 8 cartes en deux moitiés et on les intercale exactement : la carte du dessus reste dessus. Trois mélanges parfaits et le paquet est revenu dans l’ordre : les mélanges « au hasard » d’un magicien ne le sont pas.",
        "Cut 8 cards into two halves and interleave them exactly: the top card stays on top. Three perfect shuffles and the deck is back in order: a magician’s “random” shuffles are not random at all.") },
      prompt: P("Appliquez le mélange parfait jusqu’à retrouver l’ordre de départ.", "Apply the perfect shuffle until the starting order comes back."),
      goal: (s, m) => s.k > 0 && m.back,
      done: P("Trois mélanges parfaits suffisent pour 8 cartes : σ a deux cycles de longueur 3, son ordre est 3. Pour 52 cartes il en faut 8.", "Three perfect shuffles are enough for 8 cards: σ has two cycles of length 3, its order is 3. For 52 cards it takes 8."),
    },
    {
      id: "lcm", kind: "explore", set: shuffleSet("5|(1 2 3 4 5)"), unlock: ["sigma"],
      scene: { title: P("L’ordre est un ppcm", "The order is a lowest common multiple"), caption: P(
        "L’ordre d’un mélange est le ppcm des longueurs de ses cycles. (1 2 3)(4 5 6 7) ne bouge que 7 cartes mais demande ppcm(3, 4) = 12 applications, plus que le cycle des 7 cartes d’un coup.",
        "The order of a shuffle is the lowest common multiple of its cycle lengths. (1 2 3)(4 5 6 7) moves only 7 cards but needs lcm(3, 4) = 12 applications, more than one cycle of all 7 cards.") },
      prompt: P("Parmi les mélanges proposés, trouvez-en un d’ordre au moins 12.", "Among the shuffles offered, find one of order at least 12."),
      goal: (s, m) => m.order >= 12,
      done: P("(1 2 3)(4 5 6 7) est d’ordre 12 et (1 2 3 4 5)(6 7 8) d’ordre 15 : des cycles de longueurs premières entre elles font de grands ordres.", "(1 2 3)(4 5 6 7) has order 12 and (1 2 3 4 5)(6 7 8) order 15: cycles of coprime lengths give large orders."),
    },
    {
      id: "swaps", kind: "check", set: { ...shuffleSet("5|(1 2 3)(4 5)"), cards: "2,0,1,4,3" }, quantity: "swaps", answer: 3,
      scene: { title: P("Défaire un mélange en échanges", "Undoing a shuffle with swaps"), caption: P(
        "Les cartes sont dans l’ordre 3 1 2 5 4. En cliquant deux cartes à la fois, il faut au moins 3 échanges : un cycle de 3 cartes demande 2 échanges, un cycle de 2 cartes en demande 1. Quelle que soit la méthode, le nombre d’échanges reste impair : c’est la signature.",
        "The cards read 3 1 2 5 4. Clicking two cards at a time, at least 3 swaps are needed: a cycle of 3 cards takes 2 swaps, a cycle of 2 takes 1. Whatever the method, the number of swaps stays odd: that is the sign.") },
      prompt: P("Les cartes sont dans l’ordre 3 1 2 5 4. Combien d’échanges de deux cartes faut-il au minimum pour les remettre dans l’ordre ?", "The cards read 3 1 2 5 4. What is the least number of swaps of two cards that puts them back in order?"),
      hint: P("Suivez où va chaque carte : on trouve un cycle de 3 cartes et un de 2.", "Follow where each card goes: there is a cycle of 3 cards and one of 2."),
      because: P("Un cycle de longueur L se défait en L − 1 échanges : 2 + 1 = 3.", "A cycle of length L is undone in L − 1 swaps: 2 + 1 = 3."),
    },
    {
      id: "why", kind: "explain", set: shuffleSet("5|(1 2 3)(4 5)"),
      scene: { title: P("Pourquoi c’est un groupe", "Why it is a group"), caption: P(
        "Enchaîner deux mélanges donne un mélange ; ne rien faire en est un ; tout mélange se défait. Les n! mélanges de n cartes forment le groupe symétrique Sₙ. L’ordre d’un mélange est le ppcm de ses cycles, et la parité du nombre d’échanges ne dépend que du mélange.",
        "Doing two shuffles in a row gives a shuffle; doing nothing is one; every shuffle can be undone. The n! shuffles of n cards form the symmetric group Sₙ. The order of a shuffle is the lcm of its cycles, and the parity of the number of swaps depends only on the shuffle.") },
      prompt: P("Pourquoi l’ordre de σ est-il le ppcm des longueurs de ses cycles ?", "Why is the order of σ the lowest common multiple of its cycle lengths?"),
      argument: P(
        "Les cycles disjoints de σ agissent sur des cartes différentes, donc indépendamment. Un cycle de longueur L remet ses cartes en place exactement après L, 2L, 3L… applications. Toutes les cartes sont en place après k applications si et seulement si k est un multiple de chaque longueur, et le plus petit tel k est leur ppcm.",
        "The disjoint cycles of σ act on different cards, so independently. A cycle of length L puts its cards back exactly after L, 2L, 3L… applications. All cards are back after k applications if and only if k is a multiple of every length, and the least such k is their lcm."),
    },
  ],
  conclusion: P(
    "Les mélanges de n cartes forment un groupe à n! éléments. L’ordre d’un mélange est le ppcm des longueurs de ses cycles ; la parité du nombre d’échanges qui le réalisent ne dépend pas de la façon de faire (la signature).",
    "The shuffles of n cards form a group with n! elements. The order of a shuffle is the lcm of its cycle lengths; the parity of the number of swaps that produce it does not depend on how it is done (the sign)."),
  seeAlso: [["#university/algebre-1-groupes", P("Cours : Algèbre 1, les groupes", "Course: Algebra 1, groups")], ["#lab/polygon", P("Les symétries d’un polygone", "The symmetries of a polygon")], ["#lab/rubik", P("Le Rubik’s cube", "The Rubik’s cube")]],
  history: {
    title: P("Cauchy · 1815, Diaconis, Graham et Kantor · 1983", "Cauchy · 1815, Diaconis, Graham and Kantor · 1983"),
    story: P(
      "Augustin Louis Cauchy étudie les permutations dès 1815 ; Galois en fait l’outil de sa théorie des équations. En 1983, Persi Diaconis (mathématicien et ancien magicien), Ronald Graham et William Kantor publient l’étude complète des mélanges parfaits.",
      "Augustin Louis Cauchy studied permutations from 1815; Galois made them the tool of his theory of equations. In 1983 Persi Diaconis (mathematician and former magician), Ronald Graham and William Kantor published the full study of perfect shuffles."),
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Cauchy/",
  },
};

// ---------------------------------------------------------------- polygon (Dₙ)
const gText = (g) => `${g.k},${g.s}`;
const polySet = (n, word = "") => ({ n, word, g: gText(G.dWord(n, word)) });
const polyModel = (s) => { const [k, sg] = s.g.split(",").map(Number), g = { k, s: sg }; return { g, order: G.dOrder(s.n, g), home: k === 0 && sg === 0, size: 2 * s.n }; };
const MOVE = { r: G.R, t: G.T };
export const polygon = {
  id: "polygon", template: "group", groupView: "polygon", section: "groups", sub: P("Le groupe diédral Dₙ", "The dihedral group Dₙ"),
  symbol: "Dₙ", group: P("Algèbre", "Algebra"),
  title: P("Les symétries d’un polygone", "The symmetries of a polygon"),
  short: P("Rotations, retournements, groupe Dₙ", "Rotations, flips, the group Dₙ"),
  intro: P(
    "Un carré découpé dans du carton se repose dans son trou de 8 façons : 4 en le tournant, 4 en le retournant. Ces mouvements se composent, et l’ordre dans lequel on les fait compte.",
    "A square cut out of card fits back into its hole in 8 ways: 4 by turning it, 4 by flipping it. These moves compose, and the order in which they are done matters."),
  duration: 12,
  level: P("Lycée curieux · Université", "Curious students · University"),
  prereq: P("Angles, rotations et symétries axiales", "Angles, rotations and reflections"),
  model: { model: polyModel, quantities: { order: P("Ordre de l’élément", "Order of the element") }, quantity: (q, st) => polyModel(st)[q] },
  state: polySet(4),
  keys: P("Les boutons tournent (r, r⁻¹) ou retournent (τ) la figure autour de l’axe fixe en pointillés.", "The buttons turn (r, r⁻¹) or flip (τ) the figure over the fixed dashed axis."),
  controls: {
    n: { kind: "choice", label: P("Polygone", "Polygon"), options: [3, 4, 5, 6, 8].map((n) => ({ value: n, label: P({ 3: "triangle", 4: "carré", 5: "pentagone", 6: "hexagone", 8: "octogone" }[n], { 3: "triangle", 4: "square", 5: "pentagon", 6: "hexagon", 8: "octagon" }[n]) })), get: (s) => s.n, set: (s, v) => polySet(v) },
    move: {
      kind: "action", label: P("Bouger la figure", "Move the figure"),
      options: [{ value: "r", label: P("r : tourner", "r: turn") }, { value: "R", label: P("r⁻¹ : tourner en arrière", "r⁻¹: turn back") }, { value: "t", label: P("τ : retourner", "τ: flip") }, { value: "0", label: P("Position de départ", "Starting position") }],
      act: (s, v) => {
        if (v === "0") return { g: "0,0", word: "" };
        const [k, sg] = s.g.split(",").map(Number), m = v === "R" ? { k: s.n - 1, s: 0 } : MOVE[v];
        return { g: gText(G.dMul(s.n, m, { k, s: sg })), word: s.word + v };
      },
    },
  },
  views: { panels: [], formula: (s) => s.g, readout: (s) => [[P("Ordre", "Order"), String(polyModel(s).order)]] },
  missions: [
    {
      id: "count", kind: "predict", set: polySet(4), correct: 2,
      scene: { title: P("Huit symétries pour un carré", "Eight symmetries for a square"), caption: P(
        "Le carré a 4 rotations (dont « ne rien faire ») et 4 retournements : 8 symétries, rangées à droite, où la position atteinte s’allume. Un polygone régulier à n côtés en a 2n.",
        "The square has 4 rotations (including “do nothing”) and 4 flips: 8 symmetries, listed on the right, where the position reached lights up. A regular polygon with n sides has 2n.") },
      prompt: P("De combien de façons peut-on reposer un carré de carton dans son trou ?", "In how many ways can a cardboard square be put back into its hole?"),
      choices: [P("4", "4"), P("6", "6"), P("8", "8"), P("16", "16")],
    },
    {
      id: "order-matters", kind: "contrast", set: polySet(4, "rt"),
      variants: [{ label: P("A : tourner puis retourner", "A: turn then flip"), set: polySet(4, "rt") }, { label: P("B : retourner puis tourner", "B: flip then turn"), set: polySet(4, "tr") }],
      scene: { title: P("L’ordre compte", "Order matters"), caption: P(
        "Tourner puis retourner ne met pas le carré dans la même position que retourner puis tourner : le coin 1 n’arrive pas au même endroit. Le groupe n’est pas commutatif : τ ∘ r = r⁻¹ ∘ τ.",
        "Turning then flipping does not put the square in the same position as flipping then turning: corner 1 does not end up in the same place. The group is not commutative: τ ∘ r = r⁻¹ ∘ τ.") },
      prompt: P("Comparez A et B : la position finale est-elle la même ?", "Compare A and B: is the final position the same?"),
      done: P("Non : A donne r³τ et B donne rτ. En général, a ∘ b ≠ b ∘ a.", "No: A gives r³τ and B gives rτ. In general, a ∘ b ≠ b ∘ a."),
    },
    {
      id: "relation", kind: "explore", set: polySet(5), unlock: ["move"],
      scene: { title: P("Une relation qui dit tout", "One relation says it all"), caption: P(
        "Retourner, tourner, retourner revient à tourner dans l’autre sens : τ r τ = r⁻¹. Ainsi τ, r, τ, r ramène le pentagone à sa place. Avec rⁿ = e et τ² = e, cette relation suffit à calculer dans tout le groupe.",
        "Flip, turn, flip amounts to turning the other way: τ r τ = r⁻¹. So τ, r, τ, r brings the pentagon back into place. With rⁿ = e and τ² = e, this relation is enough to compute in the whole group.") },
      prompt: P("Trouvez une suite de mouvements qui contient au moins un retournement et ramène le pentagone exactement à sa place.", "Find a sequence of moves containing at least one flip that brings the pentagon exactly back into place."),
      goal: (s, m) => m.home && s.word.includes("t") && /[rR]/.test(s.word),
      done: P("Par exemple τ r τ r = e, car τ r τ = r⁻¹.", "For example τ r τ r = e, because τ r τ = r⁻¹."),
    },
    {
      id: "hexagon", kind: "check", set: polySet(6, "rr"), quantity: "order", answer: 3,
      scene: { title: P("L’ordre d’une rotation", "The order of a rotation"), caption: P(
        "Dans l’hexagone, r² tourne de 2 × 60° = 120° : trois fois r² font un tour complet, son ordre est 3. Chaque retournement est d’ordre 2.",
        "In the hexagon, r² turns by 2 × 60° = 120°: three times r² is a full turn, its order is 3. Every flip has order 2.") },
      prompt: P("Dans l’hexagone, quel est l’ordre de r² (combien de fois le faire pour revenir) ?", "In the hexagon, what is the order of r² (how many times to do it to come back)?"),
      because: P("r² tourne de 120° et 3 × 120° = 360°.", "r² turns by 120° and 3 × 120° = 360°."),
    },
    {
      id: "why", kind: "explain", set: polySet(4),
      scene: { title: P("Le groupe diédral", "The dihedral group"), caption: P(
        "Les 2n symétries du polygone forment le groupe diédral Dₙ. Les n rotations en forment un sous-groupe, de moitié moins d’éléments : un exemple du théorème de Lagrange (l’ordre d’un sous-groupe divise l’ordre du groupe).",
        "The 2n symmetries of the polygon form the dihedral group Dₙ. The n rotations form a subgroup with half as many elements: an example of Lagrange’s theorem (the order of a subgroup divides the order of the group).") },
      prompt: P("Pourquoi un polygone régulier à n côtés a-t-il exactement 2n symétries ?", "Why does a regular polygon with n sides have exactly 2n symmetries?"),
      argument: P(
        "Une symétrie est déterminée par l’endroit où elle envoie le coin 1 (n choix) et par le sens dans lequel les coins se suivent ensuite (2 choix : le même, ou retourné). Toutes ces 2n possibilités sont réalisées par les rotations rᵏ et les retournements rᵏτ.",
        "A symmetry is determined by where it sends corner 1 (n choices) and by the direction in which the corners then follow (2 choices: the same, or flipped). All 2n possibilities are achieved by the rotations rᵏ and the flips rᵏτ."),
    },
  ],
  conclusion: P(
    "Le groupe diédral Dₙ a 2n éléments : n rotations et n retournements. Il n’est pas commutatif, et tout s’y calcule avec rⁿ = e, τ² = e et τ r τ = r⁻¹.",
    "The dihedral group Dₙ has 2n elements: n rotations and n flips. It is not commutative, and everything in it follows from rⁿ = e, τ² = e and τ r τ = r⁻¹."),
  seeAlso: [["#university/algebre-1-groupes", P("Cours : Algèbre 1, les groupes", "Course: Algebra 1, groups")], ["#lab/shuffles", P("Mélanger des cartes", "Shuffling cards")], ["#lab/rubik", P("Le Rubik’s cube", "The Rubik’s cube")]],
  history: {
    title: P("Cayley · 1854", "Cayley · 1854"),
    story: P("Arthur Cayley donne en 1854 la première définition abstraite d’un groupe, avec sa table de multiplication ; les symétries des figures en sont les premiers exemples.", "In 1854 Arthur Cayley gave the first abstract definition of a group, with its multiplication table; the symmetries of figures are its first examples."),
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Cayley/",
  },
};

// ---------------------------------------------------------------- Rubik's cube
const SEQUENCES = ["R", "RU", "RUR'U'", "R2U2", "RUF", "RUR'URU2R'"];
const seqLabel = (q) => `${G.parseMoves(q).join(" ")} · ${G.sequenceOrder(G.parseMoves(q))}`;
const cubeModel = (s) => {
  const moves = G.parseMoves(s.moves), st = G.applyMoves(G.solvedStickers(), moves);
  return { order: G.sequenceOrder(G.parseMoves(s.seq)), solved: G.isSolved(st), moved: G.movedCubies(st), played: moves.length };
};
const cubeSet = (seq) => ({ seq, moves: "", reps: 0 });
export const rubik = {
  id: "rubik", template: "group", groupView: "cube", section: "groups", sub: P("Le groupe du Rubik’s cube", "The Rubik’s cube group"),
  symbol: "⧈", group: P("Algèbre", "Algebra"),
  title: P("Le Rubik’s cube, un groupe dans la main", "The Rubik’s cube, a group in your hand"),
  short: P("Ordre d’une séquence, commutateurs", "Order of a sequence, commutators"),
  intro: P(
    "Chaque mouvement du Rubik’s cube se défait, et deux mouvements enchaînés en font un troisième : les positions du cube forment un groupe. Répétez une séquence assez longtemps et le cube revient toujours à son état de départ.",
    "Every move of the Rubik’s cube can be undone, and two moves in a row make a third: the positions of the cube form a group. Repeat a sequence long enough and the cube always comes back to its starting state."),
  duration: 15,
  level: P("Tout public · Université", "Everyone · University"),
  prereq: P("Le ppcm ; pour aller plus loin, les permutations", "The lowest common multiple; to go further, permutations"),
  model: { model: cubeModel, quantities: { order: P("Ordre de la séquence", "Order of the sequence") }, quantity: (q, st) => cubeModel(st)[q] },
  state: cubeSet("RU"),
  keys: P("Faites glisser le fond pour tourner la vue (ou les flèches du clavier) ; les boutons tournent les faces. R = droite, U = haut, F = devant ; ' = dans l’autre sens.", "Drag the background to turn the view (or the arrow keys); the buttons turn the faces. R = right, U = up, F = front; ' = the other way."),
  controls: {
    seq: { kind: "choice", presentation: "select", label: P("Séquence étudiée (et son ordre)", "Sequence studied (and its order)"), options: SEQUENCES.map((q) => ({ value: q, label: [seqLabel(q), seqLabel(q)] })), get: (s) => s.seq, set: (s, v) => cubeSet(v) },
    play: {
      kind: "action", label: P("Jouer la séquence", "Play the sequence"),
      options: [{ value: "once", label: P("Une fois", "Once") }, { value: "all", label: P("Jusqu’au retour", "Until it comes back") }, { value: "reset", label: P("Cube neuf", "New cube") }],
      act: (s, v) => {
        if (v === "reset") return { moves: "", reps: 0 };
        const order = G.sequenceOrder(G.parseMoves(s.seq)), times = v === "once" ? 1 : order - (s.reps % order);
        return { moves: s.moves + s.seq.repeat(times), reps: s.reps + times };
      },
    },
    turn: {
      kind: "action", label: P("Tourner une face", "Turn a face"),
      options: ["U", "R", "F", "U'", "R'", "F'"].map((m) => ({ value: m, label: [m, m] })),
      act: (s, v) => ({ moves: s.moves + v }),
    },
  },
  views: { panels: [], formula: (s) => s.seq, readout: (s) => [[P("Ordre", "Order"), String(cubeModel(s).order)]] },
  missions: [
    {
      id: "guess", kind: "predict", set: cubeSet("RU"), correct: 3,
      scene: { title: P("R puis U, cent cinq fois", "R then U, a hundred and five times"), caption: P(
        "Tourner la face droite puis la face du haut, et recommencer : le cube ne revient qu’après 105 fois. Le désordre grandit, puis tout se remet en place d’un coup.",
        "Turn the right face then the top face, and again: the cube only comes back after 105 times. The mess grows, then everything falls back into place at once.") },
      prompt: P("On répète « R puis U ». Combien de répétitions avant que le cube revienne à son état de départ ?", "Repeat “R then U”. How many repetitions before the cube is back to its starting state?"),
      choices: [P("4", "4"), P("12", "12"), P("36", "36"), P("105", "105")],
    },
    {
      id: "back", kind: "explore", set: cubeSet("RU"), unlock: ["play"],
      scene: { title: P("Le retour, et pourquoi 105", "The return, and why 105"), caption: P(
        "105 = 3 × 5 × 7. La séquence R U déplace les coins et les arêtes en cycles de longueurs différentes, en les faisant aussi pivoter sur eux-mêmes ; le cube revient quand tous les cycles sont revenus en même temps : au ppcm, comme pour les cartes.",
        "105 = 3 × 5 × 7. The sequence R U moves the corners and edges in cycles of different lengths, twisting them as well; the cube comes back when every cycle is back at the same time: at the lcm, as with the cards.") },
      prompt: P("Jouez R U jusqu’au retour du cube.", "Play R U until the cube comes back."),
      goal: (s, m) => s.reps > 0 && m.solved,
      done: P("Retour après 105 répétitions, soit 210 quarts de tour.", "Back after 105 repetitions, that is 210 quarter turns."),
    },
    {
      id: "commutator", kind: "explore", set: cubeSet("RUR'U'"), unlock: ["play"],
      scene: { title: P("Le commutateur, l’outil des solveurs", "The commutator, the solvers’ tool"), caption: P(
        "R U R⁻¹ U⁻¹ ne déplace que 7 des 20 petits cubes : si R et U commutaient, il ne ferait rien du tout. Un commutateur a b a⁻¹ b⁻¹ mesure à quel point a et b ne commutent pas ; ceux qui résolvent le cube les utilisent pour bouger peu de pièces à la fois.",
        "R U R⁻¹ U⁻¹ moves only 7 of the 20 small cubes: if R and U commuted, it would do nothing at all. A commutator a b a⁻¹ b⁻¹ measures how far a and b fail to commute; people who solve the cube use them to move few pieces at a time.") },
      prompt: P("Jouez R U R′ U′ une fois : combien de petits cubes ont bougé ? Puis jusqu’au retour.", "Play R U R′ U′ once: how many small cubes moved? Then until it comes back."),
      goal: (s, m) => s.reps >= 1,
      done: P("7 cubes seulement ont bougé, et le retour arrive après 6 répétitions.", "Only 7 cubes moved, and it comes back after 6 repetitions."),
    },
    {
      id: "half", kind: "check", set: cubeSet("R2U2"), quantity: "order", answer: 6,
      scene: { title: P("Des demi-tours", "Half turns"), caption: P(
        "R2 U2 (deux demi-tours) a pour ordre 6 : six répétitions ramènent le cube neuf.",
        "R2 U2 (two half turns) has order 6: six repetitions bring the cube back to new.") },
      prompt: P("Combien de fois faut-il répéter R2 U2 pour retrouver le cube de départ ?", "How many times must R2 U2 be repeated to get the starting cube back?"),
      because: P("R2 U2 échange des pièces par paires et en fait tourner d’autres par trois : ppcm(2, 3) = 6.", "R2 U2 swaps pieces in pairs and moves others in threes: lcm(2, 3) = 6."),
    },
    {
      id: "nails", kind: "explain", set: cubeSet("RUR'U'"),
      scene: { title: P("Le même calcul que le tableau sur des clous", "The same algebra as the picture on nails"), caption: P(
        "Un tableau suspendu à deux clous a et b par la ficelle enroulée a b a⁻¹ b⁻¹ tombe dès qu’on retire un seul clou : retirer a efface les lettres a, il reste b b⁻¹, qui se défait. C’est un commutateur, comme R U R⁻¹ U⁻¹. Le défi « Un tableau sur des clous » est de la théorie des groupes.",
        "A picture hung on two nails a and b by the string wound a b a⁻¹ b⁻¹ falls as soon as one nail is removed: removing a erases the letters a, leaving b b⁻¹, which comes undone. It is a commutator, like R U R⁻¹ U⁻¹. The challenge “A picture on nails” is group theory.") },
      prompt: P("Pourquoi toute séquence répétée finit-elle par ramener le cube ?", "Why does every repeated sequence end up bringing the cube back?"),
      argument: P(
        "Le cube n’a qu’un nombre fini d’états (43 252 003 274 489 856 000). En répétant une séquence s, deux états finissent par se répéter : sᵃ = sᵇ avec a < b. Comme chaque mouvement se défait, on simplifie par sᵃ : s^(b − a) = identité. Le plus petit tel exposant est l’ordre de s.",
        "The cube has only finitely many states (43,252,003,274,489,856,000). Repeating a sequence s, two states must eventually repeat: sᵃ = sᵇ with a < b. Since every move can be undone, cancel sᵃ: s^(b − a) = identity. The least such exponent is the order of s."),
    },
  ],
  conclusion: P(
    "Les positions du Rubik’s cube forment un groupe de 43 252 003 274 489 856 000 éléments. Toute séquence a un ordre fini, le ppcm des cycles qu’elle produit ; les commutateurs a b a⁻¹ b⁻¹ ne bougent que peu de pièces. Depuis 2010 on sait que 20 mouvements suffisent toujours pour résoudre le cube.",
    "The positions of the Rubik’s cube form a group of 43,252,003,274,489,856,000 elements. Every sequence has a finite order, the lcm of the cycles it produces; commutators a b a⁻¹ b⁻¹ move only a few pieces. Since 2010 it has been known that 20 moves always suffice to solve the cube."),
  seeAlso: [["#challenges/nails", P("Défi : un tableau sur des clous", "Challenge: a picture on nails")], ["#university/algebre-1-groupes", P("Cours : Algèbre 1, les groupes", "Course: Algebra 1, groups")], ["#lab/shuffles", P("Mélanger des cartes", "Shuffling cards")]],
  history: {
    title: P("Rubik · 1974, le nombre de Dieu · 2010", "Rubik · 1974, God’s number · 2010"),
    story: P(
      "Ernő Rubik invente le cube en 1974 pour enseigner la géométrie dans l’espace. En 2010, Tomas Rokicki, Herbert Kociemba, Morley Davidson et John Dethridge montrent par calcul que 20 mouvements suffisent pour résoudre n’importe quelle position.",
      "Ernő Rubik invented the cube in 1974 to teach spatial geometry. In 2010 Tomas Rokicki, Herbert Kociemba, Morley Davidson and John Dethridge showed by computation that 20 moves suffice to solve any position."),
    source: "https://www.cube20.org/",
    sourceLabel: P("Le nombre de Dieu est 20 (cube20.org)", "God’s number is 20 (cube20.org)"),
  },
};

export const groupExperiments = [shuffles, polygon, rubik];
