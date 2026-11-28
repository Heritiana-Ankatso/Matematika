// "Les grands assauts" (design v8, Université world; docs/DESIGN_V8.md section 6): problems that fell, with dates, solvers
// and how long they resisted (ancient dates rounded to the century and marked "environ"), and problems still open with
// how long they have resisted. Each entry has a source. Re-check the status of every open problem before publishing.
// An open problem may carry `checked`, the date its status was last verified, shown as « Ouvert au <date> »; announced
// attempts are not listed (owner, 22 November 2026). Update the date when the status is re-checked.
const P = (fr, en) => [fr, en];

// st: 'done' (fell) or 'open'. approx: the start is known only to the century.
export const SIEGES = [
  { id: 'circle', name: P('Quadrature du cercle', 'Squaring the circle'), from: -450, approx: true, to: 1882, by: 'Ferdinand von Lindemann', st: 'done',
    q: P('Construire, à la règle et au compas, un carré de même aire qu’un disque donné.', 'With ruler and compass, construct a square with the area of a given disc.'),
    a: P('Impossible : π est transcendant.', 'Impossible: π is transcendental.'), source: 'https://mathshistory.st-andrews.ac.uk/Biographies/Lindemann/' },
  { id: 'cube', name: P('Duplication du cube, trisection de l’angle', 'Doubling the cube, trisecting the angle'), from: -430, approx: true, to: 1837, by: 'Pierre-Laurent Wantzel', st: 'done',
    q: P('Doubler le volume d’un cube, couper un angle en trois, à la règle et au compas.', 'Double the volume of a cube, cut an angle in three, with ruler and compass.'),
    a: P('Impossible en général.', 'Impossible in general.'), source: 'https://mathshistory.st-andrews.ac.uk/Biographies/Wantzel/' },
  { id: 'parallel', name: P('Le cinquième postulat d’Euclide', 'Euclid’s fifth postulate'), from: -300, approx: true, to: 1868, by: 'Lobatchevski, Bolyai, puis Beltrami', st: 'done',
    q: P('Le postulat des parallèles se déduit-il des autres axiomes ?', 'Does the parallel postulate follow from the other axioms?'),
    a: P('Non : il existe des géométries non euclidiennes.', 'No: non-Euclidean geometries exist.'), source: 'https://mathshistory.st-andrews.ac.uk/HistTopics/Non-Euclidean_geometry/' },
  { id: 'quintic', name: P('L’équation du cinquième degré', 'The quintic equation'), from: 1545, to: 1824, by: 'Niels Henrik Abel (après Ruffini)', st: 'done',
    q: P('Après le 3e et le 4e degré (Cardan, 1545), existe-t-il une formule par radicaux pour le 5e ?', 'After degrees 3 and 4 (Cardano, 1545), is there a formula by radicals for degree 5?'),
    a: P('Non, pas de formule générale.', 'No, there is no general formula.'), source: 'https://mathshistory.st-andrews.ac.uk/Biographies/Abel/' },
  { id: 'kepler', name: P('Conjecture de Kepler', 'Kepler conjecture'), from: 1611, to: 1998, by: 'Thomas Hales (vérification formelle achevée en 2014)', st: 'done',
    q: P('L’empilement « de l’épicier » est-il le plus dense possible pour des sphères égales ?', 'Is the greengrocer’s stacking the densest packing of equal spheres?'),
    a: P('Oui.', 'Yes.'), source: 'https://arxiv.org/abs/1501.02155' },
  { id: 'fermat', name: P('Dernier théorème de Fermat', 'Fermat’s last theorem'), from: 1637, to: 1994, by: 'Andrew Wiles (avec Richard Taylor)', st: 'done',
    q: P('xⁿ + yⁿ = zⁿ a-t-elle des solutions entières non nulles pour n ≥ 3 ?', 'Does xⁿ + yⁿ = zⁿ have non-zero integer solutions for n ≥ 3?'),
    a: P('Aucune.', 'None.'), source: 'https://mathshistory.st-andrews.ac.uk/Biographies/Fermat/' },
  { id: 'four-colours', name: P('Théorème des quatre couleurs', 'Four colour theorem'), from: 1852, to: 1976, by: 'Kenneth Appel et Wolfgang Haken', st: 'done',
    q: P('Quatre couleurs suffisent-elles pour colorier toute carte sans que deux pays voisins se ressemblent ?', 'Are four colours enough to colour any map so that no two neighbouring countries match?'),
    a: P('Oui : première grande preuve assistée par ordinateur.', 'Yes: the first major computer-assisted proof.'), source: 'https://mathshistory.st-andrews.ac.uk/HistTopics/The_four_colour_theorem/' },
  { id: 'poincare', name: P('Conjecture de Poincaré', 'Poincaré conjecture'), from: 1904, to: 2003, by: 'Grigori Perelman', st: 'done',
    q: P('Une forme de dimension 3 sans trou, fermée et bornée, est-elle une sphère déformée ?', 'Is a closed, bounded three-dimensional shape without holes a deformed sphere?'),
    a: P('Oui.', 'Yes.'), source: 'https://www.claymath.org/millennium/poincare-conjecture/' },
  { id: 'riemann', name: P('Hypothèse de Riemann', 'Riemann hypothesis'), from: 1859, st: 'open',
    q: P('Les zéros non triviaux de la fonction zêta ont-ils tous une partie réelle égale à 1/2 ?', 'Do all non-trivial zeros of the zeta function have real part 1/2?'),
    checked: '2026-11-22',
    source: 'https://mathshistory.st-andrews.ac.uk/Biographies/Riemann/' },
  { id: 'goldbach', name: P('Conjecture de Goldbach', 'Goldbach conjecture'), from: 1742, st: 'open',
    q: P('Tout entier pair supérieur à 2 est-il la somme de deux nombres premiers ?', 'Is every even integer greater than 2 the sum of two primes?'), source: 'https://mathshistory.st-andrews.ac.uk/Biographies/Goldbach/' },
  { id: 'twin', name: P('Nombres premiers jumeaux', 'Twin primes'), from: 1849, st: 'open',
    q: P('Existe-t-il une infinité de nombres premiers p tels que p + 2 soit premier ?', 'Are there infinitely many primes p such that p + 2 is prime?'), source: 'https://mathworld.wolfram.com/TwinPrimeConjecture.html' },
  { id: 'syracuse', name: P('Conjecture de Syracuse', 'Collatz conjecture'), from: 1937, st: 'open',
    q: P('En divisant les pairs par 2 et en remplaçant un impair n par 3n + 1, atteint-on toujours 1 ?', 'Halving even numbers and replacing an odd n by 3n + 1, does one always reach 1?'), source: 'https://mathworld.wolfram.com/CollatzProblem.html' },
  { id: 'p-np', name: P('P = NP ?', 'P = NP?'), from: 1971, st: 'open',
    q: P('Tout problème dont on vérifie vite une solution peut-il aussi être résolu vite ?', 'Can every problem whose solutions are quickly checked also be solved quickly?'), source: 'https://www.claymath.org/millennium/p-vs-np/' },
  { id: 'navier-stokes', name: P('Navier et Stokes', 'Navier and Stokes'), from: 2000, st: 'open',
    q: P('Les équations des fluides en dimension 3 ont-elles toujours des solutions régulières ? (Équations du XIXe siècle ; question posée par l’Institut Clay en 2000.)', 'Do the fluid equations in dimension 3 always have smooth solutions? (Equations of the 19th century; question set by the Clay Institute in 2000.)'),
    source: 'https://www.claymath.org/millennium/navier-stokes-equation/' },
];

// How long a problem resisted (fell) or has resisted (open, until `now`); ancient starts rounded to the century.
export function resisted(x, now = new Date().getFullYear()) {
  const years = (x.st === 'done' ? x.to : now) - x.from;
  return x.approx ? Math.round(years / 100) * 100 : years;
}
