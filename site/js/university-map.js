// The map of the fields of mathematics (design v8, Université world; docs/DESIGN_V8.md section 3, decision 4): one
// list of fields, their position on the sky map, the links between them, which university course lights which field,
// and which topic of the site index (topic-registry.js, #topics) each field gathers. The topic map and the sky map are
// the same fields: tests/v8-univ.test.mjs checks that every topic of the index (history aside) belongs to a field.
const P = (fr, en) => [fr, en];

// [id, name, x, y (0 to 1 on the sky), one line, topics of the site index]
export const FIELDS = [
  ['log', P('Logique', 'Logic'), 0.07, 0.24, P('Ce qu’est une preuve, et ce qu’aucune preuve ne peut atteindre.', 'What a proof is, and what no proof can reach.'), ['foundations']],
  ['ens', P('Théorie des ensembles', 'Set theory'), 0.21, 0.14, P('Le langage commun : ensembles, applications, infinis de tailles différentes.', 'The common language: sets, maps, infinities of different sizes.'), ['foundations']],
  ['cat', P('Théorie des catégories', 'Category theory'), 0.37, 0.08, P('Les mathématiques des structures et de leurs transformations.', 'The mathematics of structures and their transformations.'), []],
  ['info', P('Informatique théorique', 'Theoretical computer science'), 0.07, 0.5, P('Ce qu’un calcul peut faire, et à quel coût.', 'What a computation can do, and at what cost.'), ['discrete']],
  ['comb', P('Combinatoire', 'Combinatorics'), 0.19, 0.64, P('Compter, ranger, colorier : l’art des structures finies.', 'Counting, arranging, colouring: the art of finite structures.'), ['discrete']],
  ['nb', P('Théorie des nombres', 'Number theory'), 0.31, 0.44, P('Les entiers et les nombres premiers, simples à énoncer, profonds à comprendre.', 'Integers and primes, simple to state, deep to understand.'), ['arithmetic']],
  ['alg', P('Algèbre', 'Algebra'), 0.43, 0.27, P('Groupes, anneaux, corps : les structures du calcul.', 'Groups, rings, fields: the structures of calculation.'), ['algebra']],
  ['lin', P('Algèbre linéaire', 'Linear algebra'), 0.51, 0.47, P('Vecteurs et matrices, l’outil de presque toutes les sciences.', 'Vectors and matrices, the tool of almost every science.'), ['algebra']],
  ['grp', P('Théorie des groupes', 'Group theory'), 0.57, 0.14, P('La symétrie devenue objet mathématique.', 'Symmetry made into a mathematical object.'), ['algebra']],
  ['galg', P('Géométrie algébrique', 'Algebraic geometry'), 0.72, 0.11, P('Les figures décrites par des équations polynomiales.', 'Figures described by polynomial equations.'), ['geometry']],
  ['top', P('Topologie', 'Topology'), 0.82, 0.27, P('Ce qui reste quand on déforme sans déchirer.', 'What remains when you deform without tearing.'), ['topology']],
  ['gdiff', P('Géométrie différentielle', 'Differential geometry'), 0.91, 0.44, P('Courbes, surfaces et espaces courbes, jusqu’à la relativité.', 'Curves, surfaces and curved spaces, up to relativity.'), ['geometry']],
  ['ar', P('Analyse réelle', 'Real analysis'), 0.61, 0.62, P('Limites, dérivées, intégrales : le continu maîtrisé.', 'Limits, derivatives, integrals: the continuum mastered.'), ['analysis']],
  ['ac', P('Analyse complexe', 'Complex analysis'), 0.73, 0.5, P('Les fonctions d’une variable complexe et leurs surprises.', 'Functions of a complex variable and their surprises.'), ['analysis']],
  ['harm', P('Analyse harmonique', 'Harmonic analysis'), 0.82, 0.68, P('Décomposer un signal en ondes : Fourier et ses héritiers.', 'Breaking a signal into waves: Fourier and his heirs.'), ['analysis']],
  ['fonc', P('Analyse fonctionnelle', 'Functional analysis'), 0.7, 0.82, P('Des espaces de fonctions de dimension infinie.', 'Spaces of functions of infinite dimension.'), ['analysis']],
  ['ed', P('Équations différentielles', 'Differential equations'), 0.51, 0.8, P('Prévoir une évolution à partir de sa loi de variation.', 'Predicting a change from its law of variation.'), ['dynamics']],
  ['edp', P('Équations aux dérivées partielles', 'Partial differential equations'), 0.88, 0.86, P('Chaleur, ondes, fluides : les lois de la physique.', 'Heat, waves, fluids: the laws of physics.'), []],
  ['dyn', P('Systèmes dynamiques', 'Dynamical systems'), 0.37, 0.74, P('L’ordre et le chaos dans le temps long.', 'Order and chaos over long times.'), ['dynamics']],
  ['proba', P('Probabilités', 'Probability'), 0.25, 0.86, P('Le hasard rendu calculable.', 'Chance made calculable.'), ['probability']],
  ['stat', P('Statistique', 'Statistics'), 0.09, 0.8, P('Apprendre des données, et mesurer son incertitude.', 'Learning from data, and measuring its uncertainty.'), ['statistics']],
  ['opt', P('Optimisation', 'Optimisation'), 0.37, 0.93, P('Trouver le meilleur choix sous contraintes.', 'Finding the best choice under constraints.'), []],
  ['num', P('Analyse numérique', 'Numerical analysis'), 0.58, 0.94, P('Calculer pour de vrai, avec des erreurs maîtrisées.', 'Computing for real, with errors under control.'), []],
  ['phys', P('Physique mathématique', 'Mathematical physics'), 0.95, 0.64, P('Quand les équations de la nature deviennent théorèmes.', 'When the equations of nature become theorems.'), []],
].map(([id, name, x, y, line, topics]) => ({ id, name, x, y, line, topics }));

// The links of the sky map (34): two fields joined when one feeds the other.
export const LINKS = ('log-ens log-info ens-cat ens-alg cat-alg cat-galg comb-nb comb-proba comb-info nb-alg nb-ac alg-lin alg-grp grp-galg '
  + 'grp-top galg-top top-gdiff gdiff-phys lin-ar lin-num ar-ac ar-ed ar-proba ac-harm harm-fonc fonc-edp ed-edp ed-dyn dyn-proba proba-stat '
  + 'stat-opt opt-num num-edp edp-phys').split(' ').map((s) => s.split('-'));

// Which fields each university course (a section of manifest.json `university`) lights on the map.
export const LIT = {
  'algebre-1': ['ens', 'alg', 'grp', 'lin'],
  foundations: ['log', 'ens'],
  'module-maths': ['ar', 'ed', 'lin'],
  fourier: ['harm'],
};
export const fieldById = (id) => FIELDS.find((f) => f.id === id) || null;
export const litFields = () => new Set(Object.values(LIT).flat());
