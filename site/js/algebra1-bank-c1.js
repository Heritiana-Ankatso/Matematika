// Algèbre 1, chapter 1 (sets, maps, relations, Z/nZ, order, countability): QCM and quiz generators for the bank.
import * as Q from './algebra1-qbank.js';
import { parseSetExpr, setMask } from './algebra1-model.js';
const T = String.raw;
const { qcm, quiz, right: ok, wrong: no, single, fromPool, gcd, mod } = Q;

// Set identities: the truth of each one is computed from the eight regions of a Venn diagram, never typed by hand.
const IDS = [
  ['(A ∪ B)ᶜ', 'Aᶜ ∩ Bᶜ'], ['(A ∩ B)ᶜ', 'Aᶜ ∪ Bᶜ'], ['(A ∪ B)ᶜ', 'Aᶜ ∪ Bᶜ'], ['A ∖ (B ∪ C)', '(A ∖ B) ∩ (A ∖ C)'],
  ['A ∖ (B ∩ C)', '(A ∖ B) ∪ (A ∖ C)'], ['A ∖ (B ∩ C)', '(A ∖ B) ∩ (A ∖ C)'], ['A ∪ (B ∩ C)', '(A ∪ B) ∩ (A ∪ C)'],
  ['A ∩ (B ∪ C)', '(A ∩ B) ∪ C'], ['(A ∖ B) ∪ B', 'A'], ['(A ∖ B) ∪ B', 'A ∪ B'], ['(A ∪ B) ∖ B', 'A'], ['(A ∪ B) ∖ B', 'A ∖ B'],
  ['A Δ B', '(A ∪ B) ∖ (A ∩ B)'], ['A Δ (A Δ B)', 'B'], ['(A Δ B) Δ C', 'A Δ (B Δ C)'], ['A ∖ (A ∖ B)', 'A ∩ B'],
  ['A ∖ (A ∖ B)', 'B'], ['(A ∖ B)ᶜ', 'Aᶜ ∪ B'], ['A ∩ (B ∖ C)', '(A ∩ B) ∖ (A ∩ C)'], ['A ∪ (B ∖ C)', '(A ∪ B) ∖ (A ∪ C)'],
  ['A Δ B', 'Aᶜ Δ Bᶜ'], ['(A ∩ B) ∪ (A ∩ Bᶜ)', 'A'], ['(A ∪ B) ∩ Aᶜ', 'B'], ['(A ∪ B) ∩ Aᶜ', 'B ∖ A'],
];
const setTex = s => s.replace(/∪/g, T`\cup `).replace(/∩/g, T`\cap `).replace(/∖/g, T`\setminus `).replace(/Δ/g, T`\mathbin{\Delta}`).replace(/ᶜ/g, '^c');
function identity([l, r]) {
  const a = setMask(parseSetExpr(l)), b = setMask(parseSetExpr(r)), text = `$${setTex(l)}=${setTex(r)}$`;
  if (a === b) return [true, text, 'Vrai : les deux membres colorient les mêmes régions du diagramme de Venn (même table de vérité).'];
  const region = [...Array(8).keys()].find(k => ((a >> k) & 1) !== ((b >> k) & 1));
  const where = ['A', 'B', 'C'].map((s, i) => ((region >> i) & 1 ? `dans ${s}` : `hors de ${s}`)).join(', ');
  return [false, text, `Faux : un élément ${where} est dans l’un des membres et pas dans l’autre.`];
}

// Relations with their properties (reflexive, symmetric, antisymmetric, transitive), each checked in the comments.
const RELS = [
  ['$\\le$ sur $\\R$', [1, 0, 1, 1]], ['$<$ sur $\\R$', [0, 0, 1, 1]], ['la divisibilité sur $\\N^*$', [1, 0, 1, 1]],
  ['la divisibilité sur $\\Z$', [1, 0, 0, 1]], ['la congruence modulo 5 sur $\\Z$', [1, 1, 0, 1]], ['$x\\neq y$ sur $\\Z$', [0, 1, 0, 0]],
  ['$\\abs{x-y}\\le1$ sur $\\Z$', [1, 1, 0, 0]], ['$x+y$ pair, sur $\\Z$', [1, 1, 0, 1]], ['$\\subset$ sur $\\parties(E)$, $E$ à deux éléments', [1, 0, 1, 1]],
  ['l’égalité sur un ensemble $E$', [1, 1, 1, 1]], ['$xy\\ge0$ sur $\\R$', [1, 1, 0, 0]], ['$xy>0$ sur $\\R^*$', [1, 1, 0, 1]],
  ['$x^2=y^2$ sur $\\R$', [1, 1, 0, 1]], ['$x\\le y+1$ sur $\\Z$', [1, 0, 0, 0]],
];
const PROPS = ['réflexive', 'symétrique', 'antisymétrique', 'transitive'];

// Real functions with (injective, surjective) from R to R, each justified.
const FUNS = [
  ['$x\\mapsto x^2$', 0, 0, '$(-1)^2=1^2$, et $-1$ n’a pas d’antécédent'], ['$x\\mapsto x^3$', 1, 1, 'strictement croissante et continue, de limites $\\pm\\infty$'],
  ['$x\\mapsto e^x$', 1, 0, 'strictement croissante, mais à valeurs dans $\\R_+^*$'], ['$x\\mapsto x^3-x$', 0, 1, '$0$, $1$ et $-1$ ont la même image, et elle est continue de limites $\\pm\\infty$'],
  ['$x\\mapsto\\abs x$', 0, 0, '$\\abs{-1}=\\abs1$, et $-1$ n’a pas d’antécédent'], ['$x\\mapsto 3x-2$', 1, 1, 'de réciproque $y\\mapsto\\frac{y+2}3$'],
  ['$x\\mapsto\\arctan x$', 1, 0, 'strictement croissante, à valeurs dans $]-\\frac\\pi2,\\frac\\pi2[$'], ['$x\\mapsto\\sin x$', 0, 0, '$\\sin0=\\sin\\pi$, et $2$ n’a pas d’antécédent'],
  ['$x\\mapsto x+\\sin x$', 1, 1, 'de dérivée $1+\\cos x\\ge0$ nulle seulement en des points isolés, donc strictement croissante, de limites $\\pm\\infty$'],
  ['$x\\mapsto x^2+x$', 0, 0, '$0$ et $-1$ ont la même image, et le minimum est $-\\frac14$'],
];
const VERDICT = (i, s) => (i && s ? 'bijective' : i ? 'injective, non surjective' : s ? 'surjective, non injective' : 'ni injective ni surjective');

const SUPS = [
  ['$[0,1[$', '1', false], ['$\\ens{\\frac1n\\mid n\\in\\N^*}$', '1', true], ['$\\ens{1-\\frac1n\\mid n\\in\\N^*}$', '1', false],
  ['$]-\\infty,3]$', '3', true], ['$\\ens{x\\in\\Q\\mid x^2<2}$ (dans $\\R$)', '\\sqrt2', false], ['$\\ens{(-1)^n+\\frac1n\\mid n\\in\\N^*}$', '\\frac32', true],
  ['$\\ens{\\frac{n}{n+1}\\mid n\\in\\N}$', '1', false], ['$\\ens{-x^2\\mid x\\in\\R}$', '0', true],
];

export const ITEMS = [
  // ---------------------------------------------------------------- sets
  qcm('c1-parties-card', 'Ensembles', R => { const n = R.int(2, 7);
    return single(`Combien de parties a un ensemble à $${n}$ éléments ?`, ok(2 ** n, `$2^{${n}}$ : chaque élément est dedans ou non.`),
      [no(n * n, 'C’est $n^2$.'), no(2 * n, 'C’est $2n$.'), no(2 ** n - 1, 'C’est le nombre de parties non vides.'), no(Q.fact(n), 'C’est $n!$, le nombre de permutations.')],
      T`Proposition \og Cardinal de l'ensemble des parties \fg : $\Card\parties(E)=2^n$.`); }),
  qcm('c1-parties-k', 'Ensembles', R => { const n = R.int(4, 8), k = R.int(2, n - 2);
    return single(`Combien de parties à $${k}$ éléments a un ensemble à $${n}$ éléments ?`, ok(Q.binom(n, k), `$\\binom{${n}}{${k}}$.`),
      [no(n ** k, 'C’est le nombre de $k$-uplets, avec répétitions et ordre.'), no(Q.fact(n) / Q.fact(n - k), 'Ce sont les $k$-uplets distincts : l’ordre compte encore.'), no(2 ** k, 'C’est le nombre de parties d’un ensemble à $k$ éléments.')],
      'Une partie à $k$ éléments est un $k$-uplet d’éléments distincts dont on oublie l’ordre : $\\frac{n!}{(n-k)!\\,k!}$.'); }),
  qcm('c1-parties-contenant', 'Ensembles', R => { const n = R.int(3, 8);
    return single(`Combien de parties de $\\ens{1,\\dots,${n}}$ contiennent $1$ ?`, ok(2 ** (n - 1), `$2^{${n - 1}}$ : on choisit librement les ${n - 1} autres éléments.`),
      [no(2 ** n, 'C’est le nombre total de parties.'), no(n, 'Il y en a beaucoup plus que $n$.'), no(2 ** n - 1, 'C’est le nombre de parties non vides.')],
      'Les parties qui contiennent $1$ sont en bijection avec les parties de $\\ens{2,\\dots,n}$ : $A\\mapsto A\\setminus\\ens1$.'); }),
  qcm('c1-produit-card', 'Ensembles', R => { const a = R.int(2, 7), b = R.int(2, 7);
    return single(`$\\Card A=${a}$ et $\\Card B=${b}$. Que vaut $\\Card(A\\times B)$ ?`, ok(a * b, 'Un couple : un choix dans $A$, un choix dans $B$.'),
      [no(a + b, 'C’est le cardinal maximal de $A\\cup B$.'), no(a ** b, 'C’est le nombre d’applications de $B$ dans $A$.'), no(b ** a, 'C’est le nombre d’applications de $A$ dans $B$.')],
      'Principe multiplicatif : $\\Card(A\\times B)=\\Card A\\cdot\\Card B$.'); }),
  qcm('c1-union-card', 'Ensembles', R => { const c = R.int(1, 5), a = c + R.int(1, 6), b = c + R.int(1, 6);
    return single(`$\\Card A=${a}$, $\\Card B=${b}$ et $\\Card(A\\cap B)=${c}$. Que vaut $\\Card(A\\cup B)$ ?`, ok(a + b - c, 'Les éléments communs sont comptés deux fois dans $\\Card A+\\Card B$.'),
      [no(a + b, 'On a compté deux fois $A\\cap B$.'), no(a + b + c, 'Il faut retrancher l’intersection, pas l’ajouter.'), no(a + b - 2 * c, 'C’est $\\Card(A\\mathbin\\Delta B)$.')],
      'Formule du crible : $\\Card(A\\cup B)=\\Card A+\\Card B-\\Card(A\\cap B)$.'); }),
  qcm('c1-sym-card', 'Ensembles', R => { const c = R.int(1, 5), a = c + R.int(1, 6), b = c + R.int(1, 6);
    return single(`$\\Card A=${a}$, $\\Card B=${b}$, $\\Card(A\\cap B)=${c}$. Que vaut $\\Card(A\\mathbin\\Delta B)$ ?`, ok(a + b - 2 * c, '$(A\\setminus B)\\cup(B\\setminus A)$ : $(a-c)+(b-c)$.'),
      [no(a + b - c, 'C’est $\\Card(A\\cup B)$.'), no(a + b, 'On a gardé les éléments communs.'), no(Math.abs(a - b), 'La différence symétrique n’est pas la différence des cardinaux.')],
      '$A\\mathbin\\Delta B=(A\\cup B)\\setminus(A\\cap B)$.'); }),
  qcm('c1-diff-card', 'Ensembles', R => { const c = R.int(1, 5), a = c + R.int(1, 6), b = c + R.int(1, 6);
    return single(`$\\Card A=${a}$, $\\Card B=${b}$, $\\Card(A\\cap B)=${c}$. Que vaut $\\Card(A\\setminus B)$ ?`, ok(a - c, 'On retire de $A$ ses éléments qui sont aussi dans $B$.'),
      [no(Math.abs(a - b), 'On ne retire pas tout $B$ : seulement $A\\cap B$.'), no(a + b - 2 * c, 'C’est $\\Card(A\\mathbin\\Delta B)$.'), no(b - c, 'C’est $\\Card(B\\setminus A)$.')],
      '$A$ est la réunion disjointe de $A\\setminus B$ et de $A\\cap B$.'); }),
  qcm('c1-identites', 'Ensembles', R => fromPool(R, 'Lesquelles de ces égalités sont vraies pour toutes parties $A,B,C$ d’un ensemble $E$ ?',
    IDS.map(identity), 'Une égalité d’ensembles se vérifie sur les huit cas $(x\\in A ?,x\\in B ?,x\\in C ?)$ ; un seul cas en défaut donne un contre-exemple (figure de Venn du cours).')),
  qcm('c1-identites-une', 'Ensembles', R => { const all = IDS.map(identity), t = R.pick(all.filter(x => x[0])), f = R.sample(all.filter(x => !x[0]), 3);
    return single('Laquelle de ces égalités est vraie pour toutes parties $A,B,C$ ?', [true, t[1], t[2]], f, 'Règles de calcul et lois de De Morgan ; vérifier sur les huit régions du diagramme.'); }),
  qcm('c1-appartenance-1', 'Ensembles', R => fromPool(R, 'Soit $E=\\ens{\\varnothing,\\ens{\\varnothing}}$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$\\varnothing\\in E$', 'C’est l’un des deux éléments.'], [true, '$\\varnothing\\subset E$', 'L’ensemble vide est inclus dans tout ensemble.'],
    [true, '$\\ens\\varnothing\\in E$', 'C’est l’autre élément.'], [true, '$\\ens\\varnothing\\subset E$', 'Son seul élément, $\\varnothing$, est dans $E$.'],
    [true, '$\\ens{\\ens\\varnothing}\\subset E$', 'Son seul élément, $\\ens\\varnothing$, est dans $E$.'], [false, '$\\ens{\\ens\\varnothing}\\in E$', 'Ce n’est aucun des deux éléments de $E$.'],
    [false, '$E$ a un seul élément', '$\\varnothing\\neq\\ens\\varnothing$ : le second a un élément, le premier aucun.'], [true, '$\\Card\\parties(E)=4$', '$E$ a deux éléments distincts.'],
  ], '$\\in$ relie un élément à un ensemble, $\\subset$ deux ensembles.')),
  qcm('c1-appartenance-2', 'Ensembles', R => fromPool(R, 'Soit $E=\\ens{a,\\ens{a,b}}$, avec $a\\neq b$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$a\\in E$', 'Élément de $E$.'], [true, '$\\ens a\\subset E$', 'Son seul élément $a$ est dans $E$.'], [false, '$\\ens a\\in E$', 'Les éléments de $E$ sont $a$ et $\\ens{a,b}$.'],
    [true, '$\\ens{a,b}\\in E$', 'Élément de $E$.'], [false, '$\\ens{a,b}\\subset E$', '$b\\notin E$.'], [false, '$b\\in E$', '$b$ est un élément d’un élément de $E$, pas de $E$.'],
    [true, '$\\ens{\\ens{a,b}}\\subset E$', 'Son seul élément $\\ens{a,b}$ est dans $E$.'], [true, '$\\Card E=2$', 'Deux éléments distincts.'],
  ], 'Appartenance et inclusion ne se confondent pas : écrire les éléments de $E$ un par un.')),
  // ---------------------------------------------------------------- maps
  qcm('c1-nb-applications', 'Applications', R => { const p = R.int(2, 5), n = R.int(2, 5);
    return single(`Combien y a-t-il d’applications d’un ensemble à $${p}$ éléments dans un ensemble à $${n}$ éléments ?`, ok(n ** p, `$${n}^{${p}}$ : $${n}$ choix pour l’image de chacun des $${p}$ éléments.`),
      [no(p ** n, 'Les rôles sont inversés.'), no(n * p, 'Les choix se multiplient, ils ne s’additionnent pas $p$ fois.'), no(Q.binom(n + p - 1, p), 'Ce sont des choix sans ordre.')],
      'Proposition \\og Dénombrements \\fg : $\\Card(F^E)=n^p$.'); }),
  qcm('c1-nb-injections', 'Applications', R => { const n = R.int(4, 7), p = R.int(2, n - 1), inj = Q.fact(n) / Q.fact(n - p);
    return single(`Combien y a-t-il d’injections d’un ensemble à $${p}$ éléments dans un ensemble à $${n}$ éléments ?`, ok(inj, `$${n}\\cdot${n - 1}\\cdots${n - p + 1}$.`),
      [no(n ** p, 'C’est le nombre de toutes les applications.'), no(Q.binom(n, p), 'Il faut encore choisir quel élément va où.'), no(Q.fact(p), 'C’est le nombre de bijections d’un ensemble à $p$ éléments.')],
      'Le premier élément a $n$ images possibles, le suivant $n-1$, etc.'); }),
  qcm('c1-nb-surj-2', 'Applications', R => { const p = R.int(2, 7);
    return single(`Combien y a-t-il de surjections d’un ensemble à $${p}$ éléments sur un ensemble à $2$ éléments ?`, ok(2 ** p - 2, `$2^{${p}}-2$ : toutes les applications sauf les deux constantes.`),
      [no(2 ** p, 'Les deux applications constantes ne sont pas surjectives.'), no(2 ** p - 1, 'Il y a deux applications constantes, pas une.'), no(2 * p, 'Ce n’est pas un comptage additif.')],
      'Une application dans $\\ens{0,1}$ est surjective si et seulement si elle n’est pas constante.'); }),
  qcm('c1-nb-bijections', 'Applications', R => { const n = R.int(3, 7);
    return single(`Combien y a-t-il de bijections d’un ensemble à $${n}$ éléments sur lui-même ?`, ok(Q.fact(n), `$${n}!$.`),
      [no(n ** n, 'C’est le nombre de toutes les applications.'), no(2 ** n, 'C’est le nombre de parties.'), no(n * (n - 1) / 2, 'C’est le nombre de paires.')],
      'Une bijection est une injection entre ensembles de même cardinal : $n(n-1)\\cdots1$.'); }),
  qcm('c1-affine-Z', 'Applications', R => { const a = R.pick([-3, -2, -1, 1, 2, 3]), b = R.int(-5, 5), bij = Math.abs(a) === 1, v = VERDICT(1, bij);
    const why = bij ? 'Oui : $f(x)=y$ a une unique solution, qui est un entier.' : `Oui : $${a}x+b=${a}x'+b$ donne $x=x'$ ; mais $f(x)=y$ demande $x=\\frac{y-(${b})}{${a}}$, entier seulement pour certains $y$.`;
    return single(`L’application $f:\\Z\\to\\Z$, $x\\mapsto ${Q.poly([a, b])}$ est :`, ok(v, why),
      ['bijective', 'injective, non surjective', 'surjective, non injective', 'ni injective ni surjective'].filter(x => x !== v).map(x => no(x, bij ? 'Elle a une réciproque à valeurs dans $\\Z$.' : 'Elle est injective, et toutes les valeurs ne sont pas atteintes.')),
      'Injectivité : $f(x)=f(y)\\Rightarrow x=y$. Surjectivité : résoudre $f(x)=y$ \\emph{dans l’ensemble de départ}.'); }),
  qcm('c1-fonctions-R', 'Applications', R => { const [f, i, s, why] = R.pick(FUNS), v = VERDICT(i, s);
    return single(`L’application $\\R\\to\\R$, ${f} est :`, ok(v, `Oui : ${why}.`),
      ['bijective', 'injective, non surjective', 'surjective, non injective', 'ni injective ni surjective'].filter(x => x !== v).map(x => no(x, `Non : ${why}.`)),
      'Pour réfuter l’injectivité, deux points de même image ; pour réfuter la surjectivité, une valeur sans antécédent.'); }),
  qcm('c1-carre-domaines', 'Applications', R => { const cases = [['\\R', '\\R', 0, 0], ['\\R_+', '\\R_+', 1, 1], ['\\R', '\\R_+', 0, 1], ['\\R_+', '\\R', 1, 0]], [E, F, i, s] = R.pick(cases), v = VERDICT(i, s);
    return single(`L’application $${E}\\to${F}$, $x\\mapsto x^2$ est :`, ok(v, 'Oui.'),
      ['bijective', 'injective, non surjective', 'surjective, non injective', 'ni injective ni surjective'].filter(x => x !== v).map(x => no(x, 'Regarder $(-1)^2=1^2$ (si $-1$ est au départ) et l’existence d’un antécédent pour $-1$ (si $-1$ est à l’arrivée).')),
      'Injectivité et surjectivité dépendent des ensembles de départ et d’arrivée, pas seulement de la formule.'); }),
  qcm('c1-composition', 'Applications', R => fromPool(R, 'Soient $f:E\\to F$ et $g:F\\to G$. Lesquelles de ces implications sont vraies en général ?', [
    [true, '$g\\circ f$ injective $\\Rightarrow f$ injective', 'Si $f(x)=f(x\')$, alors $g(f(x))=g(f(x\'))$.'], [false, '$g\\circ f$ injective $\\Rightarrow g$ injective', '$f:\\ens0\\to\\ens{0,1}$, $g$ constante.'],
    [true, '$g\\circ f$ surjective $\\Rightarrow g$ surjective', 'Un antécédent $x$ de $z$ par $g\\circ f$ donne l’antécédent $f(x)$ par $g$.'], [false, '$g\\circ f$ surjective $\\Rightarrow f$ surjective', '$f:\\ens0\\to\\ens{0,1}$, $g:\\ens{0,1}\\to\\ens0$.'],
    [true, '$f,g$ injectives $\\Rightarrow g\\circ f$ injective', 'On simplifie par $g$, puis par $f$.'], [true, '$f,g$ surjectives $\\Rightarrow g\\circ f$ surjective', 'On remonte deux fois.'],
    [false, '$g\\circ f$ bijective $\\Rightarrow f$ bijective', 'Même contre-exemple : $f$ n’est pas surjective.'], [true, '$g\\circ f$ bijective $\\Rightarrow f$ injective et $g$ surjective', 'Les deux premières implications.'],
    [false, '$g\\circ f=\\Id_E\\Rightarrow f$ bijective', 'Seulement injective : $f:\\ens0\\to\\ens{0,1}$.'], [true, '$g\\circ f=\\Id_E\\Rightarrow g$ surjective', '$\\Id_E$ est surjective.'],
  ], 'L’injectivité remonte vers la première application, la surjectivité vers la seconde (Proposition \\og Injectivité, surjectivité et composition \\fg).')),
  qcm('c1-images', 'Applications', R => fromPool(R, 'Soit $f:E\\to F$ quelconque, $A,A\'\\subset E$ et $B,B\'\\subset F$. Lesquelles de ces égalités sont toujours vraies ?', [
    [true, "$f(A\\cup A')=f(A)\\cup f(A')$", 'L’image directe respecte la réunion.'], [false, "$f(A\\cap A')=f(A)\\cap f(A')$", 'Inclusion seulement : $x\\mapsto x^2$, $A=\\ens{-1}$, $A\'=\\ens1$.'],
    [true, "$f^{-1}(B\\cap B')=f^{-1}(B)\\cap f^{-1}(B')$", 'L’image réciproque respecte toutes les opérations.'], [true, '$f^{-1}(F\\setminus B)=E\\setminus f^{-1}(B)$', 'Condition sur $f(x)$ seulement.'],
    [false, '$f(E\\setminus A)=F\\setminus f(A)$', 'Faux pour une constante.'], [false, '$f^{-1}(f(A))=A$', 'Vrai seulement si $f$ est injective.'],
    [false, '$f(f^{-1}(B))=B$', 'Égal à $B\\cap\\Img f$ : vrai seulement si $f$ est surjective (ou $B\\subset\\Img f$).'], [true, '$A\\subset f^{-1}(f(A))$', 'Tout $x\\in A$ a son image dans $f(A)$.'],
  ], 'Proposition \\og Images et opérations \\fg : l’image réciproque se comporte bien avec toutes les opérations, l’image directe seulement avec la réunion.')),
  qcm('c1-preimage-carre', 'Applications', R => { const a = R.int(1, 4), b = a + R.int(1, 4);
    return single(`Soit $f:\\R\\to\\R$, $x\\mapsto x^2$. Que vaut $f^{-1}([${a * a},${b * b}])$ ?`, ok(`$[-${b},-${a}]\\cup[${a},${b}]$`, 'Les $x$ tels que $' + a + '\\le\\abs x\\le' + b + '$.'),
      [no(`$[${a},${b}]$`, 'On a oublié les antécédents négatifs.'), no(`$[${a ** 4},${b ** 4}]$`, 'C’est l’image directe de l’intervalle par $f$.'), no(`$[-${b},${b}]$`, 'Les $x$ avec $\\abs x<' + a + '$ ont une image trop petite.')],
      'L’image réciproque est un ensemble d’antécédents ; elle existe même si $f$ n’est pas bijective.'); }),
  qcm('c1-image-carre', 'Applications', R => { const a = R.int(1, 5), b = R.int(1, 5); const m = Math.max(a, b) ** 2;
    return single(`Soit $f:\\R\\to\\R$, $x\\mapsto x^2$. Que vaut $f([-${a},${b}])$ ?`, ok(`$[0,${m}]$`, '$0$ est atteint en $0$, et le maximum de $x^2$ sur l’intervalle est le carré de la plus grande valeur absolue.'),
      [no(`$[${a * a},${b * b}]$`, 'On a appliqué $f$ aux bornes : $f$ n’est pas monotone sur l’intervalle.'), no(`$[-${a * a},${b * b}]$`, 'Un carré est positif.'), no(`$[0,${Math.min(a, b) ** 2}]$`, 'Le maximum de $x^2$ est le carré de la plus grande des deux valeurs absolues.')],
      'Image d’un intervalle par une fonction continue : un intervalle, entre le minimum et le maximum atteints.'); }),
  qcm('c1-fini-perm', 'Applications', R => { const n = 5, bij = R() < 0.5;
    const f = bij ? R.shuffle([1, 2, 3, 4, 5]) : (() => { let g; do { g = [1, 2, 3, 4, 5].map(() => R.int(1, 5)); } while (new Set(g).size === 5); return g; })();
    const table = f.map((y, i) => `f(${i + 1})=${y}`).join(',\\ '), v = bij ? 'bijective' : 'ni injective ni surjective';
    return single(`Soit $f:\\ens{1,\\dots,5}\\to\\ens{1,\\dots,5}$ avec $${table}$. Alors $f$ est :`, ok(v, bij ? 'Les cinq images sont distinctes.' : 'Deux éléments ont la même image, et il manque donc au moins une valeur.'),
      ['bijective', 'injective, non surjective', 'surjective, non injective', 'ni injective ni surjective'].filter(x => x !== v).map(x => no(x, 'Entre deux ensembles finis de même cardinal, injective, surjective et bijective sont équivalentes.')),
      'Ensembles finis de même cardinal : il suffit de vérifier l’injectivité (ou la surjectivité).'); }),
  qcm('c1-preimage-finie', 'Applications', R => { const f = [1, 2, 3, 4, 5, 6].map(() => R.int(1, 4)), B = R.sample([1, 2, 3, 4], 2).sort();
    const pre = f.map((y, i) => (B.includes(y) ? i + 1 : null)).filter(Boolean), img = [...new Set(B.filter(b => f.includes(b)))];
    const S = xs => (xs.length ? `$\\ens{${xs.join(',')}}$` : '$\\varnothing$');
    return single(`Soit $f:\\ens{1,\\dots,6}\\to\\ens{1,\\dots,4}$ définie par $${f.map((y, i) => `f(${i + 1})=${y}`).join(',\\ ')}$. Que vaut $f^{-1}(\\ens{${B.join(',')}})$ ?`,
      ok(S(pre), 'Les éléments du départ dont l’image est dans la partie.'),
      [no(S(img), 'C’est $f(f^{-1}(B))$, une partie de l’arrivée.'), no(S(B), 'C’est la partie elle-même.'), no(S([1, 2, 3, 4, 5, 6].filter(x => !pre.includes(x))), 'C’est le complémentaire de la bonne réponse.')],
      '$f^{-1}(B)=\\ens{x\\mid f(x)\\in B}$ est une partie de l’ensemble de \\emph{départ}.'); }),
  qcm('c1-reciproque-affine', 'Applications', R => { const a = R.pick([2, 3, 4, 5, -2, -3]), b = R.nonzero(-6, 6);
    return single(`La réciproque de $\\R\\to\\R$, $x\\mapsto ${Q.poly([a, b])}$ est :`, ok(`$y\\mapsto\\frac{y${b > 0 ? '-' : '+'}${Math.abs(b)}}{${a}}$`, 'On résout $ax+b=y$.'),
      [no(`$y\\mapsto\\frac{y${b > 0 ? '+' : '-'}${Math.abs(b)}}{${a}}$`, 'Erreur de signe sur $b$.'), no(`$y\\mapsto\\frac{1}{${Q.poly([a, b], 'y')}}$`, 'La réciproque n’est pas l’inverse $\\frac1{f}$.'), no(`$y\\mapsto ${a}y${b > 0 ? '-' : '+'}${Math.abs(b)}$`, 'On a oublié de diviser par $a$.')],
      'Théorème \\og Bijections et applications réciproques \\fg : résoudre $f(x)=y$ donne $f^{-1}(y)$.'); }),
  qcm('c1-inverse-gauche', 'Applications', R => fromPool(R, 'Soit $f:E\\to F$ avec $E\\neq\\varnothing$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$f$ injective $\\iff$ il existe $g$ avec $g\\circ f=\\Id_E$', 'Inverse à gauche (exercice du chapitre).'], [true, '$f$ bijective $\\iff$ il existe $g$ avec $g\\circ f=\\Id_E$ et $f\\circ g=\\Id_F$', 'Théorème du cours.'],
    [false, 'Si $g\\circ f=\\Id_E$, alors $f\\circ g=\\Id_F$', '$f:\\ens0\\to\\ens{0,1}$, $g$ constante.'], [false, 'Une application injective a toujours une réciproque définie sur $F$', 'Seulement sur $\\Img f$.'],
    [true, 'La réciproque d’une bijection est unique', '$g=g\\circ(f\\circ g\')=(g\\circ f)\\circ g\'=g\'$.'], [false, '$f^{-1}(B)$ n’a de sens que si $f$ est bijective', 'L’image réciproque d’une partie existe pour toute application.'],
  ], 'Un seul côté ne suffit pas : $g\\circ f=\\Id$ donne l’injectivité de $f$, $f\\circ g=\\Id$ sa surjectivité.')),
  // ---------------------------------------------------------------- relations
  qcm('c1-equivalences', 'Relations', R => fromPool(R, 'Lesquelles de ces relations sont des relations d’équivalence ?',
    RELS.map(([name, p]) => [p[0] && p[1] && p[3] ? true : false, name, p[0] && p[1] && p[3] ? 'Réflexive, symétrique et transitive.' : `Non : elle n’est pas ${PROPS.filter((_, i) => i !== 2 && !p[i]).join(', ni ')}.`]),
    'Équivalence : réflexive, symétrique, transitive. Un seul axiome en défaut, vérifié sur un exemple, suffit à réfuter.')),
  qcm('c1-proprietes', 'Relations', R => { const [name, p] = R.pick(RELS);
    return { stem: `Quelles propriétés possède la relation ${name} ?`, multi: true,
      choices: [...PROPS.map((pr, i) => [!!p[i], pr, p[i] ? `Oui, elle est ${pr}.` : `Non, elle n’est pas ${pr}.`]), [p.every(x => !x), 'aucune des quatre', p.every(x => !x) ? 'Exact.' : 'Elle en a au moins une.']],
      expl: 'Pour chaque propriété : une preuve générale si elle est vraie, un contre-exemple explicite sinon. Attention : $<$ est antisymétrique, car l’hypothèse $x<y$ et $y<x$ n’est jamais satisfaite.' }; }),
  qcm('c1-ordres', 'Relations', R => fromPool(R, 'Lesquelles de ces relations sont des relations d’ordre ?',
    RELS.map(([name, p]) => [!!(p[0] && p[2] && p[3]), name, p[0] && p[2] && p[3] ? 'Réflexive, antisymétrique et transitive.' : `Non : elle n’est pas ${PROPS.filter((_, i) => i !== 1 && !p[i]).join(', ni ')}.`]),
    'Ordre : réflexive, antisymétrique, transitive. La divisibilité est un ordre sur $\\N^*$ mais pas sur $\\Z$.')),
  qcm('c1-bell', 'Relations', R => { const k = R.int(2, 5), B = [1, 1, 2, 5, 15, 52][k];
    return single(`Combien y a-t-il de relations d’équivalence sur un ensemble à $${k}$ éléments ?`, ok(B, 'Autant que de partitions de l’ensemble.'),
      [no(2 ** k, 'C’est le nombre de parties.'), no(Q.fact(k), 'C’est le nombre de permutations.'), no(2 ** (k * k), 'C’est le nombre de toutes les relations binaires.')].filter(c => c[1] !== String(B)),
      'Équivalences et partitions se correspondent (Corollaire \\og Équivalences et partitions \\fg) ; on compte les partitions : 1, 2, 5, 15, 52 pour 1 à 5 éléments.'); }),
  qcm('c1-classes-carre', 'Relations', R => { const n = R.int(3, 9);
    return single(`Sur $\\ens{-${n},\\dots,${n}}$, on pose $x\\,\\mathcal R\\,y\\iff x^2=y^2$. Combien y a-t-il de classes ?`, ok(n + 1, `$\\ens0$ et les $\\ens{-k,k}$, $1\\le k\\le${n}$.`),
      [no(2 * n + 1, 'C’est le nombre d’éléments.'), no(n, 'On a oublié la classe $\\ens0$.'), no(2 * n, 'Les classes $\\ens{-k,k}$ ont deux éléments.')],
      'Relation \\og même image \\fg{} par $x\\mapsto x^2$ : les classes sont les fibres.'); }),
  qcm('c1-classe-mod', 'Relations', R => { const n = R.int(3, 9), a = R.int(0, n - 1), cands = R.sample([...Array(60).keys()].map(x => x - 30), 6);
    if (!cands.some(x => mod(x - a, n) === 0)) cands[0] = a + n * R.int(-3, 3);
    return { stem: `Lesquels de ces entiers sont dans la classe $\\cl{${a}}$ de $\\Z/${n}\\Z$ ?`, multi: true,
      choices: cands.map(x => [mod(x - a, n) === 0, `$${x}$`, mod(x - a, n) === 0 ? `$${x}-${a < 0 ? `(${a})` : a}$ est un multiple de ${n}.` : `$${x}\\equiv${mod(x, n)}\\pmod{${n}}$.`]),
      expl: `$\\cl{${a}}=${a}+${n}\\Z$ : les entiers dont la différence avec ${a} est un multiple de ${n}, négatifs compris.` }; }),
  qcm('c1-bien-defini-red', 'Relations', R => { const n = R.int(4, 12), m = R.int(2, 8), okk = n % m === 0;
    return single(`La formule $\\cl k\\mapsto\\cl k$ définit-elle une application de $\\Z/${n}\\Z$ dans $\\Z/${m}\\Z$ ?`,
      ok(okk ? `Oui, car $${m}$ divise $${n}$` : `Non, car $${m}$ ne divise pas $${n}$`, okk ? `Si $${n}\\mid k-k'$, alors $${m}\\mid k-k'$.` : `$\\cl0=\\cl{${n}}$ dans $\\Z/${n}\\Z$, mais $0\\not\\equiv${n}\\pmod{${m}}$.`),
      [no(okk ? `Non, car $${m}$ ne divise pas $${n}$` : `Oui, car $${m}$ divise $${n}$`, 'Vérifier la divisibilité.'), no('Oui, toujours', 'La valeur dépendrait du représentant.'), no(`Oui, si et seulement si $${n}$ divise $${m}$`, 'Le sens de la divisibilité est l’inverse.')],
      'Bien défini signifie : la valeur ne dépend pas du représentant. Ici il faut $n\\Z\\subset m\\Z$, c’est-à-dire $m\\mid n$.'); }),
  // ---------------------------------------------------------------- Z/nZ
  qcm('c1-inverse-mod', 'Z/nZ', R => { let n, a; do { n = R.int(7, 40); a = R.int(2, n - 2); } while (gcd(a, n) !== 1); const u = Q.inverseMod(a, n);
    return single(`Quel est l’inverse de $\\cl{${a}}$ dans $\\Z/${n}\\Z$ ?`, ok(`$\\cl{${u}}$`, `$${a}\\cdot${u}=${a * u}=${Math.floor(a * u / n)}\\cdot${n}+1$.`),
      [no(`$\\cl{${n - a}}$`, 'C’est l’opposé, inverse pour l’addition.'), no(`$\\cl{${n - u}}$`, 'C’est l’opposé de l’inverse.'), no(`$\\cl{${a}}$ n’est pas inversible`, `$\\pgcd(${a},${n})=1$ : il l’est.`)],
      'Euclide étendu donne $au+nv=1$, et $\\cl u$ est l’inverse (Théorème \\og Inversibles de $\\Z/n\\Z$ \\fg).'); }),
  qcm('c1-inversible-ou-pas', 'Z/nZ', R => { const n = R.int(8, 36), a = R.int(2, n - 1), d = gcd(a, n), u = Q.inverseMod(a, n);
    return single(`La classe $\\cl{${a}}$ est-elle inversible dans $\\Z/${n}\\Z$ ?`,
      ok(d === 1 ? `Oui, d’inverse $\\cl{${u}}$` : `Non, car $\\pgcd(${a},${n})=${d}$`, d === 1 ? 'Vérifier le produit.' : `$\\cl{${a}}\\cdot\\cl{${n / d}}=\\cl0$ : c’est un diviseur de zéro.`),
      [no(d === 1 ? `Non, car $${a}$ ne divise pas $${n}$` : `Oui, car $${a}$ ne divise pas $${n}$`, 'Le critère est $\\pgcd(a,n)=1$, pas la divisibilité.'), no(d === 1 ? `Oui, d’inverse $\\cl{${n - a}}$` : `Oui, d’inverse $\\cl{${n - a}}$`, 'C’est l’opposé.'), no(d === 1 ? `Non, car $${n}$ n’est pas premier` : `Oui, car $${a}$ est plus petit que $${n}$`, 'Il faut regarder $\\pgcd(a,n)$.')],
      '$\\cl a$ inversible dans $\\Z/n\\Z$ si et seulement si $\\pgcd(a,n)=1$.'); }),
  qcm('c1-phi', 'Z/nZ', R => { const n = R.pick([8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 36]), p = Q.phi(n);
    return single(`Combien d’éléments inversibles a $\\Z/${n}\\Z$ ?`, ok(p, `Les $k$ premiers avec ${n}.`),
      [no(n - 1, 'C’est le cas seulement si $n$ est premier.'), no(Math.ceil(n / 2), 'On n’a retiré que les nombres pairs.'), no(Q.divisors(n).length, 'C’est le nombre de diviseurs.')].filter(c => c[1] !== String(p)),
      `$\\varphi(${n})=${p}$, le nombre d’entiers de $\\ens{1,\\dots,${n}}$ premiers avec ${n}.`); }),
  qcm('c1-diviseurs-zero', 'Z/nZ', R => { const n = R.pick([6, 8, 9, 10, 12, 14, 15, 16, 18, 20]), z = n - 1 - Q.phi(n);
    return single(`Combien de diviseurs de zéro (classes non nulles $\\cl a$ telles que $\\cl a\\cl b=\\cl0$ pour un $\\cl b\\neq\\cl0$) a $\\Z/${n}\\Z$ ?`, ok(z, 'Toute classe non nulle et non inversible est un diviseur de zéro.'),
      [no(Q.phi(n), 'C’est le nombre d’inversibles.'), no(n - Q.phi(n), 'On a compté $\\cl0$.'), no(Q.divisors(n).length - 2, 'Il n’y a pas que les diviseurs de $n$.')],
      `Si $d=\\pgcd(a,${n})>1$, alors $\\cl a\\cdot\\cl{${n}/d}=\\cl0$ : les non-inversibles non nuls sont des diviseurs de zéro, et il y en a $${n}-1-\\varphi(${n})$.`); }),
  qcm('c1-equation-lin', 'Z/nZ', R => { let n, a; do { n = R.int(7, 30); a = R.int(2, n - 1); } while (gcd(a, n) !== 1); const b = R.int(1, n - 1), x = mod(Q.inverseMod(a, n) * b, n);
    return single(`Résoudre $${a}x\\equiv${b}\\pmod{${n}}$.`, ok(`$x\\equiv${x}\\pmod{${n}}$`, `$${a}\\cdot${x}=${a * x}\\equiv${b}$.`),
      [no(`$x\\equiv${mod(b * a, n)}\\pmod{${n}}$`, 'On a multiplié par $a$ au lieu de multiplier par son inverse.'), no(`$x\\equiv${mod(b - a, n)}\\pmod{${n}}$`, 'On a soustrait.'), no('Pas de solution', 'Comme $\\pgcd(a,n)=1$, $a$ est inversible et la solution est unique.')],
      'Multiplier les deux membres par l’inverse de $\\cl a$.'); }),
  qcm('c1-nb-solutions', 'Z/nZ', R => { const n = R.pick([12, 15, 18, 20, 24, 30]), a = R.int(2, n - 1), d = gcd(a, n), b = R.int(1, n - 1), cnt = b % d === 0 ? d : 0;
    return single(`Combien de solutions dans $\\Z/${n}\\Z$ a l’équation $\\cl{${a}}x=\\cl{${b}}$ ?`, ok(cnt, cnt ? `$d=\\pgcd(${a},${n})=${d}$ divise ${b} : ${d} solution${d > 1 ? 's' : ''}.` : `$d=\\pgcd(${a},${n})=${d}$ ne divise pas ${b}.`),
      [no(1, 'Unicité seulement quand $\\cl a$ est inversible.'), no(0, 'Une solution existe dès que $d\\mid b$.'), no(d, 'C’est le nombre de solutions quand $d\\mid b$.'), no(n, 'Pas toutes les classes.')].filter(c => c[1] !== String(cnt)),
      'Avec $d=\\pgcd(a,n)$ : aucune solution si $d\\nmid b$, sinon exactement $d$.'); }),
  qcm('c1-puissance-mod', 'Z/nZ', R => { const p = R.pick([5, 7, 11, 13]), a = R.int(2, p - 1), k = R.int(20, 99), r = Q.mod(Number(BigInt(a) ** BigInt(k) % BigInt(p)), p);
    const o = Q.orderMod(a, p);
    return single(`Que vaut $${a}^{${k}}$ modulo $${p}$ ?`, ok(r, `L’ordre de ${a} modulo ${p} est ${o} ; $${k}\\equiv${k % o}\\pmod{${o}}$.`),
      [no(mod(a * k, p), 'C’est $a\\cdot k$, pas $a^k$.'), no(Number(BigInt(a) ** BigInt(k % p) % BigInt(p)), 'On a réduit l’exposant modulo $p$ au lieu de $p-1$ (ou de l’ordre).'), no(mod(k, p), 'C’est $k$ modulo $p$.')],
      `Fermat : $a^{${p - 1}}\\equiv1\\pmod{${p}}$, donc l’exposant se réduit modulo ${p - 1}.`); }),
  qcm('c1-ops-bien-def', 'Z/nZ', R => fromPool(R, 'Lesquelles de ces formules définissent bien une application ?', [
    [true, '$\\Z/6\\Z\\to\\Z/3\\Z$, $\\cl k\\mapsto\\cl k$', '$3\\mid6$.'], [false, '$\\Z/6\\Z\\to\\Z/4\\Z$, $\\cl k\\mapsto\\cl k$', '$\\cl0=\\cl6$ mais $0\\not\\equiv6\\pmod4$.'],
    [false, '$\\Z/3\\Z\\to\\Z/3\\Z$, $\\cl a\\mapsto\\cl{2^a}$ ($a\\ge0$)', '$\\cl1=\\cl4$ mais $2\\not\\equiv16\\pmod3$.'], [true, '$\\Z/5\\Z\\to\\Z/5\\Z$, $\\cl a\\mapsto\\cl{a^2+1}$', 'Polynôme à coefficients entiers.'],
    [true, '$\\Z/4\\Z\\to\\Z/8\\Z$, $\\cl k\\mapsto\\cl{2k}$', 'Si $4\\mid k-k\'$, alors $8\\mid2k-2k\'$.'], [false, '$\\Z/4\\Z\\to\\Z/8\\Z$, $\\cl k\\mapsto\\cl k$', '$\\cl0=\\cl4$ mais $0\\not\\equiv4\\pmod8$.'],
    [true, '$\\Z/7\\Z\\to\\Z/7\\Z$, $\\cl a\\mapsto\\cl{a^7}$', 'Polynôme ; c’est d’ailleurs l’identité (Fermat).'], [false, '$\\Z/5\\Z\\to\\Q$, $\\cl a\\mapsto\\frac a5$', '$\\cl0=\\cl5$ mais $0\\neq1$.'],
  ], 'Une formule sur des classes est bien définie si sa valeur ne dépend pas du représentant (Proposition \\og Opérations sur $\\Z/n\\Z$ \\fg).')),
  // ---------------------------------------------------------------- order, sup
  qcm('c1-sup', 'Ordre', R => { const [S, s, att] = R.pick(SUPS);
    return single(`Soit $A=$ ${S}, partie de $\\R$. Alors :`, ok(`$\\sup A=${s}$, ${att ? 'atteint (c’est un maximum)' : 'non atteint'}`, att ? 'Le sup appartient à $A$.' : 'Le sup n’appartient pas à $A$.'),
      [no(`$\\sup A=${s}$, ${att ? 'non atteint' : 'atteint (c’est un maximum)'}`, att ? 'Vérifier qu’un élément de $A$ vaut le sup.' : 'Aucun élément de $A$ ne l’atteint.'), no('$A$ n’a pas de borne supérieure', '$A$ est majorée et non vide : le sup existe dans $\\R$.'), no('$\\sup A=+\\infty$', '$A$ est majorée.')],
      'Le sup est le plus petit majorant ; c’est un maximum exactement quand il appartient à $A$.'); }),
  qcm('c1-sup-divisibilite', 'Ordre', R => { const a = R.int(4, 30), b = R.int(4, 30), l = Q.lcm(a, b), g = gcd(a, b), which = R() < 0.5;
    return single(`Dans $\\N^*$ ordonné par la divisibilité, que vaut $\\${which ? 'sup' : 'inf'}\\ens{${a},${b}}$ ?`, ok(which ? l : g, which ? 'Le plus petit multiple commun au sens de la divisibilité.' : 'Le plus grand diviseur commun au sens de la divisibilité.'),
      [no(which ? Math.max(a, b) : Math.min(a, b), 'C’est pour l’ordre usuel.'), no(which ? a * b : 1, which ? 'Un majorant, mais pas le plus petit en général.' : 'Un minorant, pas le plus grand en général.'), no(which ? g : l, 'On a confondu sup et inf.')].filter(c => c[1] !== String(which ? l : g)),
      'Dans $(\\N^*,\\mid)$ : $\\sup\\ens{a,b}=\\ppcm(a,b)$ et $\\inf\\ens{a,b}=\\pgcd(a,b)$.'); }),
  qcm('c1-ordre-total', 'Ordre', R => fromPool(R, 'Lesquelles de ces relations d’ordre sont totales ?', [
    [true, '$\\le$ sur $\\R$', 'Deux réels sont toujours comparables.'], [false, 'la divisibilité sur $\\N^*$', '$2$ et $3$ ne sont pas comparables.'],
    [false, '$\\subset$ sur $\\parties(\\ens{a,b})$', '$\\ens a$ et $\\ens b$ ne sont pas comparables.'], [true, 'l’ordre lexicographique sur $\\R^2$', 'On compare la première coordonnée, puis la seconde en cas d’égalité.'],
    [false, 'l’ordre produit $(x,y)\\le(x\',y\')\\iff x\\le x\'$ et $y\\le y\'$ sur $\\R^2$', '$(0,1)$ et $(1,0)$ ne sont pas comparables.'], [true, '$\\subset$ sur $\\parties(\\ens a)$', 'Deux parties : $\\varnothing\\subset\\ens a$.'],
  ], 'Total : deux éléments quelconques sont comparables.')),
  // ---------------------------------------------------------------- countability
  qcm('c1-denombrables', 'Dénombrabilité', R => fromPool(R, 'Lesquels de ces ensembles sont dénombrables ?', [
    [true, '$\\Q$', 'Il s’injecte dans $\\Z\\times\\N^*$.'], [true, '$\\Z\\times\\Z$', 'Produit de dénombrables.'], [true, '$\\N^3$', '$(a,b,c)\\mapsto2^a3^b5^c$ est injective.'],
    [true, 'l’ensemble des parties finies de $\\N$', '$A\\mapsto\\sum_{a\\in A}2^a$ est une bijection sur $\\N$.'], [true, 'l’ensemble des réels algébriques', 'Réunion dénombrable d’ensembles finis de racines.'],
    [true, '$\\Z[X]$', 'Réunion sur le degré de dénombrables.'], [false, '$\\parties(\\N)$', 'Théorème de Cantor.'], [false, '$\\R$', 'Argument diagonal.'], [false, '$[0,1]$', 'Équipotent à $\\R$.'],
    [false, '$\\R\\setminus\\Q$', 'Sinon $\\R$ serait dénombrable.'], [false, 'l’ensemble des suites à valeurs dans $\\ens{0,1}$', 'En bijection avec $\\parties(\\N)$.'], [false, 'l’ensemble des réels transcendants', 'Complémentaire d’un dénombrable dans $\\R$.'],
  ], 'Dénombrable : s’injecte dans $\\N$. Les non-dénombrables viennent des deux théorèmes de Cantor.')),
  qcm('c1-injections-N2', 'Dénombrabilité', R => fromPool(R, 'Lesquelles de ces applications $\\N\\times\\N\\to\\N$ sont injectives ?', [
    [true, '$(m,n)\\mapsto2^m3^n$', 'Unicité de la décomposition en facteurs premiers.'], [false, '$(m,n)\\mapsto m+n$', '$(1,0)$ et $(0,1)$.'],
    [true, '$(m,n)\\mapsto2^m(2n+1)-1$', 'C’est même une bijection : tout entier non nul s’écrit $2^m\\times$ impair.'], [false, '$(m,n)\\mapsto mn$', '$(0,1)$ et $(0,2)$.'],
    [true, '$(m,n)\\mapsto\\frac{(m+n)(m+n+1)}2+n$', 'Énumération de Cantor par diagonales.'], [false, '$(m,n)\\mapsto2^m+3^n$', '$2^2+3^0=2^1+3^1=5$.'],
  ], 'Ces injections prouvent que $\\N\\times\\N$ est dénombrable.')),
  qcm('c1-equipotence', 'Dénombrabilité', R => fromPool(R, 'Lesquelles de ces paires d’ensembles sont équipotentes ?', [
    [true, '$\\N$ et $\\Z$', 'Bijection $n\\mapsto2n$, $-n\\mapsto2n-1$.'], [true, '$\\N$ et $\\Q$', 'Deux dénombrables infinis.'], [true, '$]0,1[$ et $\\R$', '$x\\mapsto\\tan(\\pi(x-\\frac12))$.'],
    [true, '$[0,1]$ et $]0,1[$', 'Cantor, Bernstein : injections dans les deux sens.'], [false, '$\\N$ et $\\R$', 'Cantor.'], [false, '$E$ et $\\parties(E)$', 'Cantor : pas de surjection.'],
    [true, '$\\N$ et l’ensemble des nombres pairs', '$n\\mapsto2n$.'], [false, '$\\Q$ et $\\R\\setminus\\Q$', 'L’un est dénombrable, l’autre non.'],
  ], 'Équipotents : il existe une bijection. Cantor, Bernstein permet de n’exhiber que deux injections.')),
  qcm('c1-cantor-diag', 'Dénombrabilité', R => fromPool(R, 'Dans l’argument diagonal de Cantor ($[0,1[$ non dénombrable), lesquelles de ces affirmations sont justes ?', [
    [true, 'On suppose une énumération $x_0,x_1,\\dots$ de tous les éléments, puis on construit un réel absent de la liste.', 'C’est la structure de la preuve par l’absurde.'],
    [true, 'Le $k$-ième chiffre du réel construit diffère du $k$-ième chiffre de $x_k$.', 'Il diffère ainsi de chaque $x_k$.'],
    [true, 'On évite les chiffres $0$ et $9$ pour ne pas tomber sur un réel à deux développements.', 'Ce qui garantit que le réel construit diffère vraiment de $x_k$.'],
    [false, 'L’argument montre aussi que $\\Q\\cap[0,1[$ n’est pas dénombrable.', 'Le réel construit n’a aucune raison d’être rationnel.'],
    [false, 'L’argument montre que $[0,1[$ est fini.', 'Il montre qu’il est infini non dénombrable.'],
  ], 'Théorème de Cantor ($\\R$ n’est pas dénombrable).')),
  qcm('c1-cantor-parties', 'Dénombrabilité', R => single('Dans la preuve qu’aucune $f:E\\to\\parties(E)$ n’est surjective, quel ensemble n’a pas d’antécédent ?',
    ok('$A=\\ens{u\\in E\\mid u\\notin f(u)}$', 'Si $A=f(a)$, alors $a\\in A\\iff a\\notin A$.'),
    [no('$A=\\ens{u\\in E\\mid u\\in f(u)}$', 'Celui-ci peut avoir un antécédent.'), no('$E$', '$E=f(a)$ est possible.'), no('$\\varnothing$', '$\\varnothing=f(a)$ est possible.')],
    'Le même argument diagonal que pour $\\R$, sous forme ensembliste.')),
  qcm('c1-bij-Z-N', 'Dénombrabilité', R => { const n = R.nonzero(-12, 12), img = n >= 0 ? 2 * n : -2 * n - 1;
    return single(`La bijection $\\Z\\to\\N$ du cours envoie $n\\ge0$ sur $2n$ et $n<0$ sur $-2n-1$. Quelle est l’image de $${n}$ ?`, ok(img, 'Appliquer la bonne formule selon le signe.'),
      [no(n >= 0 ? -2 * n - 1 : 2 * n, 'Mauvaise formule pour ce signe.'), no(Math.abs(n), 'Ce ne serait pas injectif.'), no(2 * Math.abs(n) + 1, 'Décalage d’un cran.')],
      'Les positifs vont sur les pairs, les négatifs sur les impairs.'); }),
  qcm('c1-factorisation', 'Relations', R => fromPool(R, 'Soit $f:E\\to F$, $\\mathcal R$ la relation \\og même image \\fg{} et $\\overline f:E/\\mathcal R\\to F$, $\\cl x\\mapsto f(x)$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$\\overline f$ est bien définie', 'Deux représentants ont même image par définition de $\\mathcal R$.'], [true, '$\\overline f$ est injective', '$\\overline f(\\cl x)=\\overline f(\\cl y)\\Rightarrow x\\mathcal R y$.'],
    [false, '$\\overline f$ est toujours surjective', 'Seulement sur $\\Img f$.'], [true, '$f=\\overline f\\circ\\pi$', 'Avec $\\pi$ la projection.'], [false, '$\\pi$ est injective', 'Seulement si $\\mathcal R$ est l’égalité.'],
    [true, '$E/\\mathcal R$ est en bijection avec $\\Img f$', 'Corollaire de l’injectivité.'],
  ], 'Théorème de factorisation canonique, prototype des théorèmes d’isomorphisme.')),
  qcm('c1-partition', 'Relations', R => fromPool(R, 'Lesquelles de ces familles sont des partitions de $\\Z$ ?', [
    [true, '$2\\Z$ et $2\\Z+1$', 'Pairs et impairs.'], [true, '$3\\Z$, $3\\Z+1$, $3\\Z+2$', 'Les classes modulo 3.'], [false, '$2\\Z$ et $3\\Z$', 'Non disjoints ($6$), et $1$ n’est dans aucun.'],
    [false, '$\\N$ et $-\\N$', '$0$ est dans les deux.'], [true, '$\\N$ et $\\ens{n\\mid n<0}$', 'Disjoints, non vides, de réunion $\\Z$.'], [false, '$\\ens{\\varnothing}\\cup\\ens{\\ens n\\mid n\\in\\Z}$', 'Une partie d’une partition est non vide.'],
  ], 'Partition : parties non vides, deux à deux disjointes, de réunion l’ensemble.')),
  qcm('c1-classes-cardinal', 'Relations', R => { const n = R.int(3, 7), N = n * R.int(3, 6);
    return single(`Sur $\\ens{0,1,\\dots,${N - 1}}$, combien d’éléments a chaque classe de la congruence modulo $${n}$ ?`, ok(N / n, `${N} éléments répartis en ${n} classes de même taille.`),
      [no(n, 'C’est le nombre de classes.'), no(N, 'C’est le nombre total.'), no(N / n + 1, 'Décalage : $0$ compte.')],
      'Les restes $0,\\dots,n-1$ apparaissent chacun le même nombre de fois quand $n$ divise le nombre d’éléments.'); }),
  qcm('c1-bezout', 'Z/nZ', R => { const a = R.int(10, 60), b = R.int(10, 60), d = gcd(a, b);
    return single(`Que vaut le plus petit entier $>0$ de la forme $${a}u+${b}v$, $u,v\\in\\Z$ ?`, ok(d, `$${a}\\Z+${b}\\Z=${d}\\Z$.`),
      [no(Q.lcm(a, b), 'C’est le ppcm, plus petit multiple commun positif.'), no(Math.min(a, b), 'On peut faire plus petit en combinant.'), no(1, d === 1 ? 'Exact' : `Tout entier $${a}u+${b}v$ est multiple de ${d}.`)].filter(c => c[1] !== String(d)),
      '$a\\Z+b\\Z$ est un sous-groupe de $\\Z$, de la forme $d\\Z$ avec $d=\\pgcd(a,b)$ (Bézout).'); }),
  qcm('c1-euclide-etapes', 'Z/nZ', R => { const a = R.int(40, 200), b = R.int(10, 39); let x = a, y = b, k = 0; while (y) { [x, y] = [y, x % y]; k++; }
    return single(`Quel est $\\pgcd(${a},${b})$ ?`, ok(x, `Algorithme d’Euclide en ${k} divisions.`),
      [no(a % b, 'C’est seulement le premier reste.'), no(Math.floor(a / b), 'C’est le premier quotient.'), no(Q.lcm(a, b), 'C’est le ppcm.')].filter(c => c[1] !== String(x)),
      '$\\pgcd(a,b)=\\pgcd(b,r)$ où $r$ est le reste de $a$ par $b$ ; le dernier reste non nul est le pgcd.'); }),
];

// ---------------------------------------------------------------- quizzes (typed answers)
ITEMS.push(
  quiz('c1q-inverse', 'Z/nZ', R => { let n, a; do { n = R.int(11, 60); a = R.int(2, n - 2); } while (gcd(a, n) !== 1);
    return { stem: `Donner un entier $u$ tel que $\\cl{${a}}\\,\\cl u=\\cl1$ dans $\\Z/${n}\\Z$.`, type: 'mod', n, answer: Q.inverseMod(a, n), expl: 'Euclide étendu sur $(a,n)$, puis lecture du coefficient de $a$.' }; }),
  quiz('c1q-pgcd', 'Z/nZ', R => { const d = R.int(2, 15), a = d * R.int(3, 20), b = d * R.int(3, 20);
    return { stem: `Calculer $\\pgcd(${a},${b})$.`, type: 'int', answer: gcd(a, b), expl: 'Algorithme d’Euclide.' }; }),
  quiz('c1q-ppcm', 'Z/nZ', R => { const a = R.int(4, 40), b = R.int(4, 40);
    return { stem: `Calculer $\\ppcm(${a},${b})$.`, type: 'int', answer: Q.lcm(a, b), expl: '$\\ppcm(a,b)=\\frac{ab}{\\pgcd(a,b)}$.' }; }),
  quiz('c1q-phi', 'Z/nZ', R => { const n = R.int(10, 60); return { stem: `Combien d’éléments inversibles a $\\Z/${n}\\Z$ ?`, type: 'int', answer: Q.phi(n), expl: 'Compter les $k\\in\\ens{1,\\dots,n}$ premiers avec $n$ ; ou $\\varphi(n)=n\\prod_{p\\mid n}(1-\\frac1p)$.' }; }),
  quiz('c1q-equation', 'Z/nZ', R => { let n, a; do { n = R.int(7, 40); a = R.int(2, n - 1); } while (gcd(a, n) !== 1); const b = R.int(1, n - 1);
    return { stem: `Trouver $x$ tel que $${a}x\\equiv${b}\\pmod{${n}}$.`, type: 'mod', n, answer: mod(Q.inverseMod(a, n) * b, n), expl: 'Multiplier par l’inverse de $a$ modulo $n$.' }; }),
  quiz('c1q-puissance', 'Z/nZ', R => { const p = R.pick([7, 11, 13, 17]), a = R.int(2, p - 1), k = R.int(30, 300);
    return { stem: `Donner le reste de $${a}^{${k}}$ dans la division par $${p}$.`, type: 'int', answer: Number(BigInt(a) ** BigInt(k) % BigInt(p)), expl: `Fermat : réduire l’exposant modulo ${p - 1}.` }; }),
  quiz('c1q-parties', 'Ensembles', R => { const n = R.int(3, 10), k = R.int(1, n - 1);
    return { stem: `Combien de parties à $${k}$ éléments a un ensemble à $${n}$ éléments ?`, type: 'int', answer: Q.binom(n, k), expl: `$\\binom{${n}}{${k}}$.` }; }),
  quiz('c1q-applications', 'Applications', R => { const p = R.int(2, 5), n = R.int(2, 6), kind = R.pick(['applications', 'injections']);
    const ans = kind === 'applications' ? n ** p : (p <= n ? Q.fact(n) / Q.fact(n - p) : 0);
    return { stem: `Combien y a-t-il d’${kind} d’un ensemble à $${p}$ éléments dans un ensemble à $${n}$ éléments ?`, type: 'int', answer: ans, expl: kind === 'applications' ? '$n^p$.' : 'Zéro si $p>n$, sinon $\\frac{n!}{(n-p)!}$.' }; }),
  quiz('c1q-union', 'Ensembles', R => { const c = R.int(0, 6), a = c + R.int(1, 9), b = c + R.int(1, 9);
    return { stem: `$\\Card A=${a}$, $\\Card B=${b}$, $\\Card(A\\cap B)=${c}$. Donner $\\Card(A\\cup B)$.`, type: 'int', answer: a + b - c, expl: 'Formule du crible.' }; }),
  quiz('c1q-preimage', 'Applications', R => { const f = [1, 2, 3, 4, 5, 6, 7].map(() => R.int(1, 4)), B = R.sample([1, 2, 3, 4], R.int(1, 2));
    return { stem: `$f:\\ens{1,\\dots,7}\\to\\ens{1,\\dots,4}$ est donnée par $${f.map((y, i) => `f(${i + 1})=${y}`).join(',\\ ')}$. Donner $f^{-1}(\\ens{${B.join(',')}})$.`, type: 'set', answer: f.map((y, i) => (B.includes(y) ? i + 1 : null)).filter(Boolean), expl: 'Les antécédents des éléments de la partie.' }; }),
  quiz('c1q-image', 'Applications', R => { const f = [1, 2, 3, 4, 5, 6].map(() => R.int(1, 6)), A = R.sample([1, 2, 3, 4, 5, 6], 3).sort();
    return { stem: `$f:\\ens{1,\\dots,6}\\to\\ens{1,\\dots,6}$ est donnée par $${f.map((y, i) => `f(${i + 1})=${y}`).join(',\\ ')}$. Donner $f(\\ens{${A.join(',')}})$.`, type: 'set', answer: [...new Set(A.map(a => f[a - 1]))], expl: 'Les images des éléments de la partie, sans répétition.' }; }),
  quiz('c1q-classe', 'Relations', R => { const n = R.int(3, 9), a = R.int(-20, 20);
    return { stem: `Donner le représentant de $\\cl{${a}}\\in\\Z/${n}\\Z$ compris entre $0$ et $${n - 1}$.`, type: 'int', answer: mod(a, n), expl: 'Le reste de la division euclidienne, positif.' }; }),
  quiz('c1q-bell', 'Relations', R => { const k = R.int(1, 5); return { stem: `Combien y a-t-il de partitions d’un ensemble à $${k}$ éléments ?`, type: 'int', answer: [1, 1, 2, 5, 15, 52][k], expl: 'Nombres de Bell : 1, 2, 5, 15, 52 pour 1 à 5 éléments.' }; }),
  quiz('c1q-surjections', 'Applications', R => { const p = R.int(3, 6); return { stem: `Combien y a-t-il de surjections d’un ensemble à $${p}$ éléments sur un ensemble à 2 éléments ?`, type: 'int', answer: 2 ** p - 2, expl: 'Toutes les applications, sauf les deux constantes.' }; }),
  quiz('c1q-sym', 'Ensembles', R => { const U = [1, 2, 3, 4, 5, 6, 7, 8], A = R.sample(U, 4), B = R.sample(U, 4);
    return { stem: `$A=\\ens{${[...A].sort((x, y) => x - y).join(',')}}$ et $B=\\ens{${[...B].sort((x, y) => x - y).join(',')}}$. Donner $A\\mathbin\\Delta B$.`, type: 'set', answer: U.filter(x => A.includes(x) !== B.includes(x)), expl: 'Les éléments qui sont dans exactement un des deux ensembles.' }; }),
);
