// The competitions of the archive (#contests): one entry per competition, with its official site, what we may do with
// its papers, and its papers when they are on the site. `kind: 'olympiad'` puts every solution on its own page
// (owner rule of 23 November 2026); any other kind shows the solution folded under the problem. Licences were read on
// the official sites on 23 November 2026; an entry marked [VERIFY] in the private notes still needs a written answer
// from the organiser. Where the papers are not openly licensed, problems are restated in our own words and the
// official paper is linked (the rule of the Olympiad strategies, olympiad-content.js).
// Rule (owner, 24 November 2026): a competition has its own section only when the site holds at least 24 of its papers.
// Today that is the Euclid Contest (2002 to 2025) and the IOI (2002 to 2025). The IMO is held back (owner, 24 November 2026): no open licence found, so its papers left `site/` (see `content/held-back/imo/README.md`). The sections that could not reach 24 were
// removed (PAMO, EGMO, OFM, Olympiades nationales, Concours général, BCC, Castor, Algoréa, Prologin, CCC, USACO);
// `bcc.js` and its models stay in the repository, unpublished, with their tests.
import { PAPERS as EUCLID_2025 } from './euclid.js';
import { PAPERS as EUCLID_EARLIER } from './euclid-earlier.js';
import { SOLUTIONS as EUCLID_SOLUTIONS } from './euclid-solutions.js';
import { PAPERS as IOI_PAPERS, PAGE_ID as IOI_PAGE } from './ioi.js';

const P = (fr, en) => [fr, en];
export const FIELDS = {
  math: P('Mathématiques', 'Mathematics'),
  cs: P('Informatique', 'Computer science'),
};
export const KINDS = {
  olympiad: P('Olympiade', 'Olympiad'),
  contest: P('Concours', 'Contest'),
};
export const TOPICS = {
  A: P('Algèbre', 'Algebra'), C: P('Combinatoire', 'Combinatorics'), G: P('Géométrie', 'Geometry'), N: P('Arithmétique', 'Number theory'),
  // computing contests (IOI)
  D: P('Programmation dynamique', 'Dynamic programming'), R: P('Graphes et arbres', 'Graphs and trees'), Y: P('Géométrie algorithmique', 'Computational geometry'),
  S: P('Structures de données', 'Data structures'), T: P('Chaînes de caractères', 'Strings'), V: P('Algorithmes divers', 'Other algorithms'),
};


// Official solutions, linked where the PDF exists (checked 24 November 2026): the CEMC publishes the Euclid solutions of 2002 to 2025 except 2020 (not found).
const OFFICIAL = {
  euclid: (y) => (y >= 2002 && y <= 2025 && y !== 2020 ? { url: `https://cemc.uwaterloo.ca/sites/default/files/documents/${y}/${y}EuclidSolution.pdf`, label: P('Solutions officielles (CEMC)', 'Official solutions (CEMC)') } : null),
};
OFFICIAL.ioi = (y) => (IOI_PAGE[y] ? { url: `https://ioinformatics.org/page/ioi-${y}/${IOI_PAGE[y]}`, label: P('Page officielle de l’édition (sujets, solutions)', 'Official page of the edition (tasks, solutions)') } : null);
const withOfficial = (id, papers) => papers.map((p) => ({ ...p, official: OFFICIAL[id](p.year) }));
// Written solutions kept apart from the statements: `solutions[paperId][n]` becomes `s` of problem `n`.
const withSolutions = (papers, solutions) => papers.map((p) => ({ ...p, problems: p.problems.map((x) => (solutions[p.id] && solutions[p.id][x.n] ? { ...x, s: solutions[p.id][x.n] } : x)) }));

export const COMPETITIONS = [
  { id: 'euclid', field: 'math', kind: 'contest', short: 'Euclid',
    name: P('Concours Euclide (CEMC, Waterloo)', 'Euclid Contest (CEMC, Waterloo)'),
    level: P('Dernière année du secondaire', 'Final year of secondary school'), site: 'https://cemc.uwaterloo.ca/resources/past-contests',
    about: P('Dix questions en deux heures et demie, avec des parties à réponse courte et des parties à rédiger.', 'Ten questions in two and a half hours, with short-answer parts and full-solution parts.'),
    rights: P('© CEMC, Université de Waterloo, licence CC BY-NC 4.0. Traduit en français, solutions abrégées et adaptées, réponses vérifiées sur la page pour 2025 ; de 2002 à 2024, une sélection de questions sans figure, avec des solutions abrégées d’après les solutions officielles du CEMC (aucune pour 2020, le CEMC n’en ayant pas publié).', '© CEMC, University of Waterloo, licence CC BY-NC 4.0. Translated into French, solutions shortened and adapted, answers checked on the page for 2025; for 2002 to 2024, a selection of questions that need no figure, with solutions condensed from the official CEMC solutions (none for 2020, which the CEMC did not publish).'), papers: withOfficial('euclid', withSolutions([...EUCLID_2025, ...EUCLID_EARLIER], EUCLID_SOLUTIONS)) },
  { id: 'ioi', field: 'cs', kind: 'olympiad', short: 'IOI',
    name: P('Olympiade internationale d’informatique', 'International Olympiad in Informatics'),
    level: P('International, élèves de lycée', 'International, secondary school students'), site: 'https://ioinformatics.org/page/contests/10',
    about: P('Deux journées de compétition, de 2002 à 2025 : une sélection de deux tâches par édition.', 'Two competition days, from 2002 to 2025: a selection of two tasks per edition.'),
    rights: P('Énoncés reformulés par nos soins (formats d’entrée et de sortie, limites et sous-tâches omis) ; le sujet officiel fait foi. Aucune solution sur le site : la page officielle de chaque édition donne les sujets et, selon l’année, les solutions.', 'Tasks restated in our own words (input and output formats, limits and subtasks left out); the official task is the reference. No solutions on the site: the official page of each edition gives the tasks and, depending on the year, the solutions.'),
    papers: withOfficial('ioi', IOI_PAPERS) },
];

export const competition = (id) => COMPETITIONS.find((c) => c.id === id) || null;
export const paperOf = (c, id) => c?.papers.find((p) => p.id === id) || null;
export const problemOf = (paper, n) => paper?.problems.find((p) => String(p.n) === String(n)) || null;
// #contests, #contests/<competition>, #contests/<competition>/<paper>, #contests/<competition>/<paper>/<n> (the
// solution page of an Olympiad problem, the only kind that has one)
export function isContestRoute(id, paper, n) {
  if (!id) return !paper && !n;
  const c = competition(id); if (!c) return false;
  if (!paper) return !n;
  const p = paperOf(c, paper); if (!p) return false;
  if (n === undefined || n === '') return true;
  return c.kind === 'olympiad' && !!problemOf(p, n);
}
export const solvedCount = (c) => c.papers.reduce((s, p) => s + p.problems.filter((x) => x.s).length, 0);
export const problemCount = (c) => c.papers.reduce((s, p) => s + p.problems.length, 0);
