// Experiment `logic-truth` (template logic): Malagasy T10 chapter 1 "Logique". Three activities of the programme's logic section:
// the truth tables of the connectors (build one cell by cell), the equivalence of two formulas (find the one pair that is not
// equivalent), and quantifiers (hunt for a counter-example; test a quantified statement on a small set). State {view, target, cells,
// pair, claim, n, stmt, checked}. Pure maths: models/logic-truth.js; independent check: scripts/check-mada-t10-logic.py.
// NOT YET REGISTERED in registry.js (the chapter is unpublished: the owner's publication gate, no manifest entry). To publish:
// import it there, add it to EXPERIMENTS, add the template `logic` to TEMPLATE_INFO / INDEX_ORDER, and name it in the chapter's `labs`.
import * as M from "../models/logic-truth.js";

const { model, CONNECTIVES, PAIRS, CLAIMS, STATEMENTS, EMPTY, TARGETS, PAIR_IDS, CLAIM_IDS, STATEMENT_IDS, N_MAX } = M;
const both = (s) => [s, s];

export default {
  id: "logic-truth", template: "logic",
  symbol: "⇒", group: ["Algèbre", "Algebra"],
  title: ["Tables de vérité et contre-exemples", "Truth tables and counter-examples"],
  short: ["Connecteurs, équivalences, quantificateurs", "Connectives, equivalences, quantifiers"],
  intro: [
    "Remplis la table de vérité d’un connecteur, trouve les deux formules qui ne disent pas la même chose, puis chasse un contre-exemple parmi les entiers.",
    "Fill in the truth table of a connective, find the two formulas that do not say the same thing, then hunt for a counter-example among the integers.",
  ],
  duration: 15,
  level: ["Seconde (programme malgache T10)", "Grade 10 (Malagasy T10)"],
  prereq: ["Les mots « vrai » et « faux », les nombres premiers, pair et impair", "The words “true” and “false”, prime numbers, even and odd"],
  model: M,
  state: { view: "table", target: "imp", cells: EMPTY, pair: "morgan", claim: "prime", n: 0, stmt: "all-even", checked: 0 },
  onlyUnlocked: true,
  keys: ["Touche une case ou une tuile pour la changer ; V et F remplissent une case, les flèches déplacent la sélection.", "Press a cell or a tile to change it; V and F fill a cell, the arrow keys move the selection."],
  controls: {
    target: {
      kind: "choice", label: ["Connecteur", "Connective"],
      options: TARGETS.map((id) => ({ value: id, label: both(CONNECTIVES[id].label) })),
      get: (s) => s.target, set: (s, v) => ({ target: v, cells: EMPTY }),
    },
    pair: {
      kind: "choice", label: ["Paire de formules", "Pair of formulas"], presentation: "select",
      options: PAIR_IDS.map((id) => ({ value: id, label: both(`${PAIRS[id].left[0]}  et  ${PAIRS[id].right[0]}`) })),
      key: "pair",
    },
    claim: {
      kind: "choice", label: ["Proposition à tester", "Claim to test"], presentation: "select",
      options: CLAIM_IDS.map((id) => ({ value: id, label: CLAIMS[id].text })), key: "claim",
    },
    n: { kind: "slider", key: "n", label: ["Entier n", "Integer n"], min: 0, max: N_MAX, step: 1, digits: 0 },
    stmt: {
      kind: "choice", label: ["Proposition", "Statement"], presentation: "select",
      options: STATEMENT_IDS.map((id) => ({ value: id, label: [STATEMENTS[id].text, STATEMENTS[id].textEn] })),
      get: (s) => s.stmt, set: (s, v) => ({ stmt: v, checked: 0 }),
    },
  },
  views: {
    panels: [],
    formula(s, { fmt }) {
      const m = model(s);
      if (s.view === "table") return `${CONNECTIVES[s.target].label} : ${s.cells}`;
      if (s.view === "pair") return `${m.pair.leftLabel}  ${m.pair.equivalent ? "≡" : "≢"}  ${m.pair.rightLabel}`;
      if (s.view === "hunt") return `${fmt.t(CLAIMS[s.claim].text)} (n = ${s.n})`;
      return fmt.t([STATEMENTS[s.stmt].text, STATEMENTS[s.stmt].textEn]);
    },
    readout(s) {
      const m = model(s);
      if (s.view === "table") return [[["Cases justes", "Right cells"], m.table.right.filter((r) => r === true).length + " / 4"]];
      if (s.view === "pair") return [[["Lignes différentes", "Different rows"], String(m.pair.diff)]];
      if (s.view === "hunt") return [[["n", "n"], String(s.n)], [["Contre-exemple ?", "Counter-example?"], m.hunt.holds ? "non" : "oui"]];
      return [[["Nombres testés", "Numbers tested"], `${m.negate.count} / ${m.negate.n}`]];
    },
  },
  missions: [
    {
      id: "open", kind: "predict", set: { view: "table", target: "imp", cells: EMPTY }, correct: 1,
      prompt: [
        "Une promesse « si tu réussis, alors je t’offre un livre » est rompue dans un seul cas. Dans la table de vérité de P ⇒ Q, combien de lignes sur quatre donnent F ?",
        "A promise “if you pass, then I give you a book” is broken in one case only. In the truth table of P ⇒ Q, how many of the four rows give F?",
      ],
      choices: [["Aucune", "None"], ["Une seule", "Exactly one"], ["Deux", "Two"], ["Trois", "Three"]],
    },
    {
      id: "build", kind: "explore", set: { view: "table", target: "imp", cells: EMPTY }, unlock: ["target"],
      prompt: [
        "Clique sur chaque case de la colonne P ⇒ Q pour choisir V ou F. Tu peux ensuite changer de connecteur et remplir sa table.",
        "Click each cell of the P ⇒ Q column to choose V or F. Then change the connective and fill in its table.",
      ],
      goal: (s, m) => s.target === "imp" && m.table.allCorrect,
      done: [
        "La table est juste : P ⇒ Q n’est fausse que lorsque P est vraie et Q fausse. Quand P est fausse, l’implication est vraie, comme la promesse que l’on ne rompt pas si tu échoues.",
        "The table is right: P ⇒ Q is false only when P is true and Q false. When P is false, the implication is true, like a promise that is not broken if you fail.",
      ],
    },
    {
      id: "equiv", kind: "explore", set: { view: "pair", pair: "morgan" }, unlock: ["pair"],
      prompt: [
        "Parmi les six paires, cinq ont exactement les mêmes colonnes (formules équivalentes). Parcours-les : laquelle est l’intruse ?",
        "Among the six pairs, five have exactly the same columns (equivalent formulas). Browse them: which one is the odd one out?",
      ],
      goal: (s, m) => !m.pair.equivalent,
      done: [
        "L’intruse est P ⇒ Q et Q ⇒ P : leurs colonnes diffèrent sur deux lignes. Une implication n’est pas équivalente à sa réciproque. Les cinq autres paires se justifient par une table : c’est ce qu’on appelle démontrer par une table de vérité.",
        "The odd one is P ⇒ Q and Q ⇒ P: their columns differ on two rows. An implication is not equivalent to its converse. The other five pairs are justified by a table: that is proving with a truth table.",
      ],
    },
    {
      id: "hunt", kind: "explore", set: { view: "hunt", claim: "prime", n: 0 }, unlock: ["n", "claim"],
      prompt: [
        "Fais glisser n (ou touche une tuile) : la proposition « pour tout entier n, n² + n + 17 est premier » est-elle vraie ? Cherche un contre-exemple.",
        "Drag n (or press a tile): is the claim “for every integer n, n² + n + 17 is prime” true? Look for a counter-example.",
      ],
      goal: (s, m) => s.claim === "prime" && m.hunt.counter,
      done: [
        "Pour n = 16, n² + n + 17 = 289 = 17². Seize exemples favorables ne prouvent rien : un seul contre-exemple suffit à réfuter un « pour tout ». Essaie les deux autres propositions : l’une a trois contre-exemples, l’autre aucun, mais cela ne la prouve pas pour autant.",
        "For n = 16, n² + n + 17 = 289 = 17². Sixteen favourable examples prove nothing: one counter-example is enough to refute a “for all”. Try the other two claims: one has three counter-examples, the other none, but that does not prove it either.",
      ],
    },
    {
      id: "negate", kind: "explore", set: { view: "negate", stmt: "all-even", checked: 0 }, unlock: ["stmt"],
      prompt: [
        "Teste les nombres de l’ensemble E en touchant les tuiles, pour la proposition « tous les x de E sont pairs ». Arrête-toi dès que tu peux conclure. Passe ensuite à l’autre proposition.",
        "Test the numbers of the set E by pressing the tiles, for the statement “every x in E is even”. Stop as soon as you can conclude. Then switch to the other statement.",
      ],
      goal: (s, m) => s.stmt === "all-even" && m.negate.refuted,
      done: [
        "Un nombre impair suffit : « pour tout x, x est pair » est fausse, et sa négation est « il existe un x qui n’est pas pair ». Pour la proposition « il existe », c’est l’inverse : un exemple la prouve, mais pour la réfuter il faut tout tester.",
        "One odd number is enough: “for all x, x is even” is false, and its negation is “there is an x that is not even”. For the “there exists” statement it is the other way round: one example proves it, but refuting it takes testing every number.",
      ],
    },
    {
      id: "why", kind: "explain", set: { view: "table", target: "imp", cells: "VFVV" },
      prompt: [
        "Pourquoi une table de vérité suffit-elle à démontrer que deux formules sont équivalentes, alors que les exemples ne suffisent pas pour un « pour tout » sur les entiers ?",
        "Why is a truth table enough to prove that two formulas are equivalent, while examples are not enough for a “for all” over the integers?",
      ],
      argument: [
        "Avec deux propositions, il n’y a que quatre cas possibles (VV, VF, FV, FF), et la table les examine tous : c’est une vérification exhaustive, donc une démonstration. Parmi les entiers, il y a une infinité de cas : quarante essais réussis ne disent rien du suivant. C’est pourquoi un exemple prouve un « il existe », un contre-exemple réfute un « pour tout », et la négation d’un « pour tout » est un « il existe » : ¬(∀x, P(x)) ≡ ∃x, ¬P(x).",
        "With two propositions there are only four possible cases (VV, VF, FV, FF) and the table examines them all: it is an exhaustive check, hence a proof. Among the integers there are infinitely many cases: forty successful trials say nothing about the next one. That is why one example proves a “there exists”, one counter-example refutes a “for all”, and the negation of a “for all” is a “there exists”: ¬(∀x, P(x)) ≡ ∃x, ¬P(x).",
      ],
    },
  ],
  conclusion: [
    "Une table de vérité épuise tous les cas d’un nombre fini de propositions, donc elle démontre. Sur une infinité d’éléments, les exemples ne prouvent pas un « pour tout » : il faut un raisonnement, et un seul contre-exemple suffit à le réfuter.",
    "A truth table exhausts every case of finitely many propositions, so it proves. Over infinitely many elements, examples do not prove a “for all”: it takes an argument, and a single counter-example is enough to refute it.",
  ],
  history: {
    title: ["Boole · 1847", "Boole · 1847"],
    story: [
      "George Boole traita la logique comme une algèbre dans « The Mathematical Analysis of Logic » (1847) : les valeurs vrai et faux se calculent, comme les nombres. Les tables de vérité que l’on dessine aujourd’hui sont plus tardives, au début du XXᵉ siècle.",
      "George Boole treated logic as an algebra in “The Mathematical Analysis of Logic” (1847): the values true and false can be computed with, like numbers. The truth tables we draw today came later, in the early twentieth century.",
    ],
    source: "https://mathshistory.st-andrews.ac.uk/Biographies/Boole/",
  },
};
