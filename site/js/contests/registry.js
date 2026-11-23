// The competitions of the archive (#contests): one entry per competition, with its official site, what we may do with
// its papers, and its papers when they are on the site. `kind: 'olympiad'` puts every solution on its own page
// (owner rule of 23 November 2026); any other kind shows the solution folded under the problem. Licences were read on
// the official sites on 23 November 2026; an entry marked [VERIFY] in the private notes still needs a written answer
// from the organiser. Where the papers are not openly licensed, problems are restated in our own words and the
// official paper is linked (the rule of the Olympiad strategies, olympiad-content.js).
import { PAPERS as IMO } from './imo.js';
import { PAPERS as BCC } from './bcc.js';
import { PAPERS as EUCLID } from './euclid.js';

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

const RESTATED = P('Énoncés reformulés par nos soins ; le sujet officiel fait foi.', 'Problems restated in our own words; the official paper is the reference.');
const PENDING = P('Sujets à venir : les conditions de réutilisation sont à confirmer auprès de l’organisateur.', 'Papers to come: the terms of reuse are to be confirmed with the organiser.');

export const COMPETITIONS = [
  { id: 'imo', field: 'math', kind: 'olympiad', short: 'IMO',
    name: P('Olympiade internationale de mathématiques', 'International Mathematical Olympiad'),
    level: P('International, élèves de lycée', 'International, secondary school students'),
    about: P('Deux épreuves de quatre heures et demie, trois problèmes chacune, notés sur sept points.', 'Two papers of four and a half hours, three problems each, marked out of seven.'),
    site: 'https://www.imo-official.org/problems.aspx', rights: RESTATED, papers: IMO },
  { id: 'pamo', field: 'math', kind: 'olympiad', short: 'PAMO',
    name: P('Olympiade panafricaine de mathématiques', 'Pan-African Mathematics Olympiad'),
    level: P('Continental, élèves de lycée', 'Continental, secondary school students'),
    rights: P('Aucune archive officielle en ligne trouvée à ce jour.', 'No official online archive found so far.'), papers: [] },
  { id: 'egmo', field: 'math', kind: 'olympiad', short: 'EGMO',
    name: P('Olympiade européenne de mathématiques pour filles', 'European Girls’ Mathematical Olympiad'),
    level: P('International, lycéennes', 'International, secondary school girls'), site: 'https://www.egmo.org/egmos/', rights: PENDING, papers: [] },
  { id: 'ofm', field: 'math', kind: 'olympiad', short: 'OFM',
    name: P('Olympiade francophone de mathématiques', 'Francophone Mathematical Olympiad'),
    level: P('International francophone, collège et lycée', 'French-speaking countries, lower and upper secondary'), site: 'https://www.animath.fr/', rights: PENDING, papers: [] },
  { id: 'olymp-fr', field: 'math', kind: 'olympiad', short: P('Olympiades de Première', 'French Year 11 Olympiad'),
    name: P('Olympiades nationales de mathématiques (Première)', 'French national mathematics Olympiad (Year 11)'),
    level: P('Élèves de Première, France et lycées français', 'Year 11 students, France and French schools abroad'), site: 'https://eduscol.education.fr/', rights: PENDING, papers: [] },
  { id: 'cg', field: 'math', kind: 'contest', short: P('Concours général', 'Concours général'),
    name: P('Concours général des lycées (mathématiques)', 'Concours général (mathematics)'),
    level: P('Terminale, France', 'Final year, France'), site: 'https://www.education.gouv.fr/', rights: PENDING, papers: [] },
  { id: 'euclid', field: 'math', kind: 'contest', short: 'Euclid',
    name: P('Concours Euclide (CEMC, Waterloo)', 'Euclid Contest (CEMC, Waterloo)'),
    level: P('Dernière année du secondaire', 'Final year of secondary school'), site: 'https://cemc.uwaterloo.ca/resources/past-contests',
    about: P('Dix questions en deux heures et demie, avec des parties à réponse courte et des parties à rédiger.', 'Ten questions in two and a half hours, with short-answer parts and full-solution parts.'),
    rights: P('© CEMC, Université de Waterloo, licence CC BY-NC 4.0. Traduit en français, solutions abrégées et adaptées, réponses vérifiées sur la page.', '© CEMC, University of Waterloo, licence CC BY-NC 4.0. Translated into French, solutions shortened and adapted, answers checked on the page.'), papers: EUCLID },
  { id: 'bcc', field: 'cs', kind: 'contest', short: 'BCC',
    name: P('Beaver Computing Challenge (CEMC, Waterloo)', 'Beaver Computing Challenge (CEMC, Waterloo)'),
    level: P('De la 5e à la 10e année (environ 10 à 16 ans)', 'Grades 5 to 10 (about ages 10 to 16)'),
    about: P('Le concours canadien de la famille Bebras : des tâches courtes de pensée informatique, sans programmer.', 'The Canadian contest of the Bebras family: short computational thinking tasks, with no programming.'),
    site: 'https://cemc.uwaterloo.ca/resources/past-contests',
    rights: P('© CEMC, Université de Waterloo, licence CC BY-NC 4.0. Traduit en français et adapté (figures interactives, vérification des suites de commandes).', '© CEMC, University of Waterloo, licence CC BY-NC 4.0. Translated into French and adapted (interactive figures, checking of command sequences).'),
    papers: BCC },
  { id: 'castor', field: 'cs', kind: 'contest', short: 'Castor',
    name: P('Concours Castor informatique', 'Castor computing contest'),
    level: P('Du CM1 à la Terminale, France', 'Ages 9 to 18, France'), site: 'https://castor-informatique.fr/', rights: PENDING, papers: [] },
  { id: 'algorea', field: 'cs', kind: 'contest', short: 'Algoréa',
    name: P('Concours Algoréa', 'Algoréa contest'),
    level: P('Collège et lycée, France', 'Lower and upper secondary, France'), site: 'https://algorea.org/', rights: PENDING, papers: [] },
  { id: 'prologin', field: 'cs', kind: 'contest', short: 'Prologin',
    name: P('Concours Prologin', 'Prologin contest'),
    level: P('Moins de 21 ans, France', 'Under 21, France'), site: 'https://prologin.org/', rights: PENDING, papers: [] },
  { id: 'ccc', field: 'cs', kind: 'contest', short: 'CCC',
    name: P('Concours canadien d’informatique (CEMC, Waterloo)', 'Canadian Computing Competition (CEMC, Waterloo)'),
    level: P('Lycée', 'Secondary school'), site: 'https://cemc.uwaterloo.ca/resources/past-contests',
    rights: P('CC BY-NC 4.0, CEMC, Université de Waterloo. Sujets à venir.', 'CC BY-NC 4.0, CEMC, University of Waterloo. Papers to come.'), papers: [] },
  { id: 'usaco', field: 'cs', kind: 'contest', short: 'USACO',
    name: P('Olympiade d’informatique des États-Unis (USACO)', 'USA Computing Olympiad'),
    level: P('Bronze à Platine, ouvert à tous', 'Bronze to Platinum, open to everyone'), site: 'https://usaco.org/index.php?page=contests', rights: PENDING, papers: [] },
  { id: 'ioi', field: 'cs', kind: 'olympiad', short: 'IOI',
    name: P('Olympiade internationale d’informatique', 'International Olympiad in Informatics'),
    level: P('International, élèves de lycée', 'International, secondary school students'), site: 'https://ioinformatics.org/', rights: PENDING, papers: [] },
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
