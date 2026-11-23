// The competitions of the archive (#contests): one entry per competition, with its official site, what we may do with
// its papers, and its papers when they are on the site. `kind: 'olympiad'` puts every solution on its own page
// (owner rule of 23 November 2026); any other kind shows the solution folded under the problem. Licences were read on
// the official sites on 23 November 2026; an entry marked [VERIFY] in the private notes still needs a written answer
// from the organiser. Where the papers are not openly licensed, problems are restated in our own words and the
// official paper is linked (the rule of the Olympiad strategies, olympiad-content.js).
// Rule (owner, 24 November 2026): a competition has its own section only when the site holds at least 24 of its papers.
// Today that is the IMO (2002 to 2026) and the Euclid Contest (2002 to 2025). The sections that could not reach 24 were
// removed (PAMO, EGMO, OFM, Olympiades nationales, Concours général, BCC, Castor, Algoréa, Prologin, CCC, USACO, IOI);
// `bcc.js` and its models stay in the repository, unpublished, with their tests.
import { PAPERS as IMO_RECENT } from './imo.js';
import { PAPERS as IMO_EARLIER } from './imo-earlier.js';
import { PAPERS as EUCLID_2025 } from './euclid.js';
import { PAPERS as EUCLID_EARLIER } from './euclid-earlier.js';

const P = (fr, en) => [fr, en];
export const FIELDS = {
  math: P('Mathématiques', 'Mathematics'),
  cs: P('Informatique', 'Computer science'),
};
export const KINDS = {
  olympiad: P('Olympiade', 'Olympiad'),
  contest: P('Concours', 'Contest'),
};
export const TOPICS = { A: P('Algèbre', 'Algebra'), C: P('Combinatoire', 'Combinatorics'), G: P('Géométrie', 'Geometry'), N: P('Arithmétique', 'Number theory') };


export const COMPETITIONS = [
  { id: 'imo', field: 'math', kind: 'olympiad', short: 'IMO',
    name: P('Olympiade internationale de mathématiques', 'International Mathematical Olympiad'),
    level: P('International, élèves de lycée', 'International, secondary school students'),
    about: P('Deux épreuves de quatre heures et demie, trois problèmes chacune, notés sur sept points.', 'Two papers of four and a half hours, three problems each, marked out of seven.'),
    site: 'https://www.imo-official.org/problems.aspx', rights: P('Énoncés reformulés par nos soins ; le sujet officiel fait foi. Les sujets de 2002 à 2022 sont donnés sans solution.', 'Problems restated in our own words; the official paper is the reference. The papers of 2002 to 2022 are given without solutions.'), papers: [...IMO_RECENT, ...IMO_EARLIER] },
  { id: 'euclid', field: 'math', kind: 'contest', short: 'Euclid',
    name: P('Concours Euclide (CEMC, Waterloo)', 'Euclid Contest (CEMC, Waterloo)'),
    level: P('Dernière année du secondaire', 'Final year of secondary school'), site: 'https://cemc.uwaterloo.ca/resources/past-contests',
    about: P('Dix questions en deux heures et demie, avec des parties à réponse courte et des parties à rédiger.', 'Ten questions in two and a half hours, with short-answer parts and full-solution parts.'),
    rights: P('© CEMC, Université de Waterloo, licence CC BY-NC 4.0. Traduit en français, solutions abrégées et adaptées, réponses vérifiées sur la page pour 2025 ; de 2002 à 2024, une sélection de questions sans figure, sans solution (les solutions officielles sont sur le site du CEMC).', '© CEMC, University of Waterloo, licence CC BY-NC 4.0. Translated into French, solutions shortened and adapted, answers checked on the page for 2025; for 2002 to 2024, a selection of questions that need no figure, without solutions (the official solutions are on the CEMC site).'), papers: [...EUCLID_2025, ...EUCLID_EARLIER] },
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
