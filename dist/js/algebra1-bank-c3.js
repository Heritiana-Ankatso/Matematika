// Algèbre 1, chapter 3 (vector spaces, subspaces, bases, dimension, rank, change of basis, determinants, linear maps):
// QCM and quiz generators for the bank. Ranks and determinants are computed by the course's elimination.
import * as Q from './algebra1-qbank.js';
import { eliminate, Frac } from './algebra1-model.js';
const { qcm, quiz, right: ok, wrong: no, single, fromPool, pmatrix: pm } = Q;

const vec = (R, n = 3, lo = -4, hi = 4) => [...Array(n).keys()].map(() => R.int(lo, hi));
const vtex = v => `(${v.map(x => (x instanceof Frac ? x.tex() : x)).join(',')})`;
const add = (u, v) => u.map((x, i) => x + v[i]);
const scal = (k, u) => u.map(x => k * x);
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const mat = (R, m, n, lo = -3, hi = 3) => [...Array(m).keys()].map(() => vec(R, n, lo, hi));
const tr = A => A[0].map((_, j) => A.map(r => r[j]));
const rank = A => eliminate(A).rank;
const det = A => eliminate(A).det;
const det2 = ([[a, b], [c, d]]) => a * d - b * c;
/** An m×n integer matrix of rank exactly r: r random rows, the others combinations of them. */
function ofRank(R, m, n, r) {
  for (;;) {
    const base = mat(R, r, n), rows = [...base];
    while (rows.length < m) { const c = base.map(() => R.int(-2, 2)); rows.push(base.reduce((acc, row, k) => add(acc, scal(c[k], row)), Array(n).fill(0))); }
    const A = R.shuffle(rows); if (rank(A) === r) return A;
  }
}
const unimodular = R => { for (;;) { const A = mat(R, 2, 2, -3, 3); if (Math.abs(det2(A)) === 1) return A; } };

export const ITEMS = [
  // ---------------------------------------------------------------- spaces and subspaces
  qcm('c3-sev-R3', 'Sous-espaces', R => fromPool(R, 'Lesquelles de ces parties de $\\R^3$ sont des sous-espaces vectoriels ?', [
    [true, '$\\ens{(x,y,z)\\mid x+y+z=0}$', 'Espace nul de $(1\\ 1\\ 1)$.'], [false, '$\\ens{(x,y,z)\\mid x+y+z=1}$', '$\\mathbf 0$ n’y est pas.'], [false, '$\\ens{(x,y,z)\\mid xy=0}$', 'Réunion de deux plans.'],
    [true, '$\\ens{(t,2t,3t)\\mid t\\in\\R}$', 'Une droite vectorielle.'], [false, '$\\ens{(x,y,z)\\mid x\\ge0}$', 'Pas stable par $-1$.'], [true, '$\\ens{(x,y,z)\\mid x=2y=3z}$', 'Intersection de deux plans.'],
    [false, '$\\ens{(x,y,z)\\mid x^2=y^2}$', 'Réunion des plans $x=y$ et $x=-y$.'], [true, '$\\ens{\\mathbf 0}$', 'Le sous-espace trivial.'], [false, '$\\ens{(x,y,z)\\mid x\\in\\Z}$', 'Pas stable par $\\frac12$.'],
    [true, '$\\ens{(x,y,z)\\mid x-y=0\\text{ et }y+z=0}$', 'Espace nul d’une matrice $2\\times3$.'],
  ], 'Critère de sous-espace : contient $\\mathbf 0$, stable par addition et par multiplication par un scalaire.')),
  qcm('c3-sev-fonctions', 'Sous-espaces', R => fromPool(R, 'Lesquels de ces ensembles sont des sous-espaces vectoriels (de l’espace qui les contient naturellement) ?', [
    [true, '$\\ens{P\\in\\R[X]\\mid P(1)=0}$', 'Noyau de l’évaluation en 1.'], [false, '$\\ens{P\\in\\R[X]\\mid P(0)=1}$', 'Ne contient pas $0$.'], [true, 'les fonctions $f:\\R\\to\\R$ avec $f(0)=f(1)$', 'Condition linéaire.'],
    [false, 'les fonctions $f:\\R\\to\\R$ positives', 'Pas stable par $-1$.'], [true, 'les suites réelles de limite nulle', 'Somme et multiples de suites tendant vers 0.'], [false, 'les matrices de $\\Mat_2(\\R)$ de déterminant nul', '$\\mathrm{diag}(1,0)+\\mathrm{diag}(0,1)=I_2$.'],
    [true, 'les matrices symétriques de $\\Mat_n(\\R)$', '$(A+B)\\tr=A+B$.'], [false, '$\\GL_n(\\R)$', 'Ne contient pas $0$.'], [false, 'les polynômes de degré exactement 3', '$X^3+(-X^3+1)$ est de degré 0.'],
    [true, 'les polynômes de degré au plus 3', '$\\R_3[X]$.'], [true, 'les solutions de $y\'\'+y=0$', 'Équation différentielle linéaire homogène.'], [false, 'les solutions de $y\'=y+1$', '$0$ n’en est pas une.'],
  ], 'Un sous-espace contient $0$ et est stable par combinaisons linéaires ; une équation linéaire homogène définit toujours un sous-espace.')),
  qcm('c3-ev', 'Espaces', R => fromPool(R, 'Lesquels de ces ensembles, munis des opérations usuelles, sont des espaces vectoriels sur $\\R$ ?', [
    [true, '$\\C$', 'De dimension 2 sur $\\R$.'], [false, '$\\Z$', 'Pas stable par multiplication par $\\frac12$.'], [false, '$\\R_+$', 'Pas d’opposé.'], [true, '$\\ens0$', 'L’espace nul.'],
    [true, '$\\Mat_{2\\times3}(\\R)$', 'Dimension 6.'], [false, '$\\ens{x\\in\\R\\mid x\\neq0}$', 'Ne contient pas $0$.'], [true, '$\\R[X]$', 'Dimension infinie.'], [false, 'un cercle de $\\R^2$ centré en $0$', 'Pas stable par addition.'],
  ], 'Un espace vectoriel contient $0$, est stable par addition et par multiplication par les scalaires.')),
  qcm('c3-zero', 'Espaces', R => fromPool(R, 'Dans un espace vectoriel $V$ sur $\\K$, lesquelles de ces règles sont des théorèmes (conséquences des axiomes) ?', [
    [true, '$0u=\\mathbf 0$', '$0u=(0+0)u=0u+0u$, puis simplifier.'], [true, '$k\\mathbf 0=\\mathbf 0$', 'Même idée.'], [true, '$ku=\\mathbf 0\\Rightarrow k=0$ ou $u=\\mathbf 0$', 'Si $k\\neq0$, multiplier par $k^{-1}$.'],
    [true, '$(-1)u=-u$', '$u+(-1)u=0u=\\mathbf 0$.'], [false, '$u+v=u\\Rightarrow v=u$', 'Elle donne $v=\\mathbf 0$.'], [false, '$ku=lu\\Rightarrow k=l$', 'Faux pour $u=\\mathbf 0$.'],
  ], 'Théorème \\og Calcul avec zéro \\fg.')),
  qcm('c3-reunion', 'Sous-espaces', R => fromPool(R, 'Soient $U,W$ des sous-espaces de $V$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$U\\cap W$ est un sous-espace', 'Critère dans chacun.'], [false, '$U\\cup W$ est toujours un sous-espace', 'Deux droites distinctes.'], [true, '$U\\cup W$ est un sous-espace si et seulement si $U\\subset W$ ou $W\\subset U$', 'Proposition du cours.'],
    [true, '$U+W$ est le plus petit sous-espace contenant $U$ et $W$', 'Définition de la somme.'], [false, '$U+W=U\\cup W$', 'La somme est en général bien plus grande.'], [true, '$U\\cap W\\subset U+W$', 'Évident.'],
  ], 'Intersections et sommes de sous-espaces sont des sous-espaces ; les réunions presque jamais.')),
  // ---------------------------------------------------------------- span, bases, dimension
  qcm('c3-dans-vect', 'Familles', R => { const u = vec(R), v = vec(R); if (rank([u, v]) < 2) { u.splice(0, 3, 1, 0, 1); v.splice(0, 3, 0, 1, 1); }
    const inside = R() < 0.5, a = R.nonzero(-2, 2), b = R.nonzero(-2, 2), w = inside ? add(scal(a, u), scal(b, v)) : add(add(scal(a, u), scal(b, v)), R.pick([[1, 0, 0], [0, 1, 0], [0, 0, 1]]));
    const isIn = rank([u, v, w]) === 2;
    return single(`Le vecteur $w=${vtex(w)}$ appartient-il à $\\Vect(u,v)$, avec $u=${vtex(u)}$, $v=${vtex(v)}$ ?`, ok(isIn ? 'Oui' : 'Non', isIn ? 'Le rang de $(u,v,w)$ est 2.' : 'Le rang de $(u,v,w)$ est 3.'),
      [no(isIn ? 'Non' : 'Oui', 'Calculer le rang de la famille $(u,v,w)$.'), no(isIn ? 'Non, car $w$ n’est colinéaire ni à $u$ ni à $v$' : 'Oui, car $w$ n’est pas nul', isIn ? 'Une combinaison de $u$ et $v$ n’est en général colinéaire à aucun des deux.' : 'Ce n’est pas le critère.'), no('On ne peut pas le savoir sans une base de $\\R^3$', 'Le rang suffit.')],
      '$w\\in\\Vect(u,v)\\iff\\rg(u,v,w)=\\rg(u,v)$ : résoudre $au+bv=w$.'); }),
  qcm('c3-dim-vect', 'Dimension', R => { const r = R.int(1, 3), A = ofRank(R, 3, 4, r);
    return single(`Quelle est la dimension de $\\Vect(${A.map(vtex).join(',\\ ')})\\subset\\R^4$ ?`, ok(r, 'C’est le rang de la matrice de ces lignes.'),
      [no(3, 'C’est le nombre de vecteurs, un majorant.'), no(4, 'C’est la dimension de $\\R^4$.'), no(r === 1 ? 2 : r - 1, 'Recompter les pivots.')].filter(c => c[1] !== String(r)),
      'La dimension d’un sous-espace engendré est le rang de la matrice de ses générateurs (Proposition \\og Base d’un sous-espace engendré \\fg).'); }),
  qcm('c3-base-R3', 'Bases', R => { const A = R() < 0.5 ? ofRank(R, 3, 3, 2) : ofRank(R, 3, 3, 3), d = det(A);
    return single(`Les vecteurs $${A.map(vtex).join('$, $')}$ forment-ils une base de $\\R^3$ ?`, ok(d.isZero() ? 'Non' : 'Oui', d.isZero() ? 'Le déterminant est nul : la famille est liée.' : `Le déterminant vaut $${d.tex()}\\neq0$.`),
      [no(d.isZero() ? 'Oui' : 'Non', 'Calculer le déterminant ou le rang.'), no(d.isZero() ? 'Oui, car il y en a trois' : 'Non, car l’un d’eux a une composante négative ou nulle', d.isZero() ? 'Trois vecteurs liés ne forment pas une base.' : 'Ce n’est pas le critère.'), no(d.isZero() ? 'Oui, car aucun n’est nul' : 'Non, car ils ne sont pas orthogonaux', d.isZero() ? 'Insuffisant.' : 'Une base n’a pas à être orthogonale.')],
      'Trois vecteurs de $\\R^3$ forment une base si et seulement s’ils sont libres, si et seulement si leur déterminant est non nul.'); }),
  qcm('c3-coordonnees', 'Bases', R => { const P = unimodular(R), x = vec(R, 2, -4, 4), v = [P[0][0] * x[0] + P[0][1] * x[1], P[1][0] * x[0] + P[1][1] * x[1]], b1 = [P[0][0], P[1][0]], b2 = [P[0][1], P[1][1]];
    return single(`Quelles sont les coordonnées de $v=${vtex(v)}$ dans la base $b_1=${vtex(b1)}$, $b_2=${vtex(b2)}$ ?`, ok(`$${vtex(x)}$`, `$${x[0]}b_1${x[1] >= 0 ? '+' : ''}${x[1]}b_2=v$.`),
      [no(`$${vtex([x[1], x[0]])}$`, 'Ordre des vecteurs de base inversé.'), no(`$${vtex(v)}$`, 'Ce sont les coordonnées dans la base canonique.'), no(`$${vtex(scal(-1, x))}$`, 'Erreur de signe.')],
      'Les coordonnées $x$ vérifient $Px=v$, où $P$ a pour colonnes $b_1,b_2$.'); }),
  qcm('c3-dims-usuelles', 'Dimension', R => { const n = R.int(2, 6), m = R.int(2, 5), cases = [[`$\\Mat_{${m}\\times${n}}(\\R)$`, m * n], [`$\\R_{${n}}[X]$`, n + 1], [`les matrices symétriques de $\\Mat_{${n}}(\\R)$`, n * (n + 1) / 2], [`les matrices antisymétriques de $\\Mat_{${n}}(\\R)$`, n * (n - 1) / 2], [`les matrices diagonales de $\\Mat_{${n}}(\\R)$`, n], [`$\\C^{${n}}$ sur $\\R$`, 2 * n], [`les triangulaires supérieures de $\\Mat_{${n}}(\\R)$`, n * (n + 1) / 2]];
    const [S, d] = R.pick(cases);
    return single(`Quelle est la dimension de ${S} ?`, ok(d, 'Compter une base.'), [no(n, 'Recompter.'), no(n * n, 'C’est la dimension de $\\Mat_n$.'), no(n + 1, 'Recompter.'), no(n * (n - 1) / 2, 'Recompter.'), no(2 * n, 'Recompter.')].filter(c => c[1] !== String(d)).slice(0, 3),
      `Bases usuelles : les $E_{ij}$ ; $1,X,\\dots,X^n$ ; $E_{ij}+E_{ji}$ ($i\\le j$) ; $E_{ij}-E_{ji}$ ($i<j$) ; $(e_k,ie_k)$.`); }),
  qcm('c3-grassmann', 'Dimension', R => { const n = R.int(4, 7), u = R.int(2, n - 1), w = R.int(2, n - 1), s = R.int(Math.max(u, w), Math.min(n, u + w)), i = u + w - s;
    return single(`Dans $\\R^{${n}}$, $\\dim U=${u}$, $\\dim W=${w}$ et $\\dim(U+W)=${s}$. Que vaut $\\dim(U\\cap W)$ ?`, ok(i, `$${u}+${w}-${s}$.`),
      [no(u + w, 'C’est $\\dim U+\\dim W$.'), no(Math.min(u, w), 'Ce n’est qu’un majorant.'), no(n - s, 'Ce n’est pas la formule.'), no(Math.abs(u - w), 'Ce n’est pas la formule.')].filter(c => c[1] !== String(i)),
      'Formule de Grassmann : $\\dim(U+W)+\\dim(U\\cap W)=\\dim U+\\dim W$.'); }),
  qcm('c3-somme-directe', 'Sommes', R => fromPool(R, 'Soient $U,W$ des sous-espaces de $V$. Lesquelles de ces affirmations sont vraies ?', [
    [true, 'La somme $U+W$ est directe si et seulement si $U\\cap W=\\ens{\\mathbf 0}$', 'Théorème du cours.'], [true, '$V=U\\oplus W$ si et seulement si $V=U+W$ et $U\\cap W=\\ens{\\mathbf 0}$', 'Supplémentaires.'],
    [false, 'Un sous-espace a un unique supplémentaire', 'Toute droite non contenue dans un plan de $\\R^3$ le complète.'], [true, 'Dans $\\R^3$, un plan et une droite non contenue dans ce plan sont supplémentaires', 'Dimensions $2+1$, intersection nulle.'],
    [false, 'Deux plans de $\\R^3$ peuvent être supplémentaires', '$\\dim(U\\cap W)\\ge1$.'], [true, '$\\Mat_n(\\R)$ est la somme directe des symétriques et des antisymétriques', '$A=\\frac{A+A\\tr}2+\\frac{A-A\\tr}2$.'],
  ], 'Somme directe : écriture unique, ou intersection nulle.')),
  qcm('c3-compter', 'Dimension', R => { const n = R.int(2, 6), k = R.int(1, n + 2);
    return { stem: `Dans un espace de dimension $${n}$, on considère une famille de $${k}$ vecteurs. Lesquelles de ces affirmations sont vraies ?`, multi: true,
      choices: [[k > n, 'Elle est forcément liée', k > n ? `Plus de ${n} vecteurs.` : 'Elle peut être libre.'], [k < n, 'Elle n’est sûrement pas génératrice', k < n ? `Moins de ${n} vecteurs.` : 'Elle peut l’être.'],
        [k === n, 'Si elle est libre, c’est une base', k === n ? 'Libre de $n$ vecteurs.' : `Il faut exactement ${n} vecteurs.`], [k <= n, 'Elle peut être libre', k <= n ? 'Par exemple des vecteurs de base.' : 'Trop de vecteurs.'], [false, 'Elle est forcément une base', 'Elle peut être liée.']],
      expl: 'Corollaire \\og Compter suffit \\fg : libre $\\Rightarrow$ au plus $n$ vecteurs ; génératrice $\\Rightarrow$ au moins $n$ ; $n$ vecteurs libres ou générateurs forment une base.' }; }),
  qcm('c3-bases-props', 'Bases', R => fromPool(R, 'Lesquelles de ces affirmations sur les bases sont vraies ?', [
    [true, 'Une base est une famille libre maximale', 'Caractérisation.'], [true, 'Une base est une famille génératrice minimale', 'Caractérisation.'], [true, 'Toute famille libre se complète en une base', 'Dimension finie.'],
    [true, 'De toute famille génératrice finie on extrait une base', 'Corollaire.'], [false, 'Un espace a une unique base', 'Infinité de bases dès que $\\dim\\ge1$ sur $\\R$.'], [false, 'Deux bases peuvent avoir des cardinaux différents', 'Steinitz.'],
    [true, 'Les coordonnées dans une base sont uniques', 'Liberté.'], [false, 'Toute sous-famille d’une base est une base', 'Elle est libre, pas génératrice.'],
  ], 'Quatre caractérisations d’une base et lemme de Steinitz.')),
  qcm('c3-echange', 'Bases', R => { const a = vec(R, 3, -2, 2); if (a.every(x => !x)) a[0] = 1; const good = a.map((x, i) => [x !== 0, `$e_${i + 1}$`, x ? `Coefficient $${x}\\neq0$.` : 'Son coefficient est nul : $\\omega$ resterait dans le plan des deux autres.']);
    return { stem: `Soit $\\omega=${vtex(a)}$ dans la base canonique $(e_1,e_2,e_3)$ de $\\R^3$. Par quels $e_j$ peut-on remplacer $\\omega$ pour obtenir encore une base ?`, multi: true,
      choices: [...good, [false, 'aucun', 'Au moins un coefficient est non nul.']], expl: 'Lemme d’échange : on peut remplacer $w_j$ par $\\omega=\\sum a_iw_i$ exactement quand $a_j\\neq0$.' }; }),
  qcm('c3-taylor', 'Bases', R => { const a = R.int(-3, 3), b = R.int(-4, 4), c = R.int(-4, 4), x0 = R.pick([1, -1, 2]);
    const P = x => a * x * x + b * x + c, d1 = 2 * a * x0 + b;
    return single(`Quelles sont les coordonnées de $P=${Q.poly([a, b, c], 'X')}$ dans la base $(1,\\ X${x0 > 0 ? '-' : '+'}${Math.abs(x0)},\\ (X${x0 > 0 ? '-' : '+'}${Math.abs(x0)})^2)$ de $\\R_2[X]$ ?`,
      ok(`$${vtex([P(x0), d1, a])}$`, `$P(${x0})$, $P'(${x0})$ et $\\frac{P''(${x0})}2$ (formule de Taylor).`),
      [no(`$${vtex([c, b, a])}$`, 'Ce sont les coordonnées dans la base $(1,X,X^2)$.'), no(`$${vtex([a, d1, P(x0)])}$`, 'Ordre inversé.'), no(`$${vtex([P(x0), d1, 2 * a])}$`, 'Il faut $\\frac{P\'\'}2$, pas $P\'\'$.')],
      'Formule de Taylor : $P=P(a)+P\'(a)(X-a)+\\frac{P\'\'(a)}2(X-a)^2$.'); }),
  // ---------------------------------------------------------------- rank and the fundamental theorem
  qcm('c3-rang', 'Rang', R => { const m = R.int(2, 4), n = R.int(3, 4), r = R.int(1, Math.min(m, n)), A = ofRank(R, m, n, r);
    return single(`Quel est le rang de $${pm(A)}$ ?`, ok(r, 'Nombre de pivots après élimination.'),
      [no(Math.min(m, n), 'C’est le rang maximal possible.'), no(m, 'C’est le nombre de lignes.'), no(r === 1 ? 2 : r - 1, 'Recompter les pivots.'), no(n, 'C’est le nombre de colonnes.')].filter(c => c[1] !== String(r)),
      'Rang : nombre de pivots, dimension de $C(A)$ et de $R(A)$.'); }),
  qcm('c3-dimN', 'Rang', R => { const m = R.int(2, 6), n = R.int(2, 7), r = R.int(1, Math.min(m, n));
    return single(`$A$ est une matrice $${m}\\times${n}$ de rang $${r}$. Quelle est la dimension de $N(A)$ ?`, ok(n - r, `$n-r=${n}-${r}$.`),
      [no(m - r, 'C’est $\\dim N(A\\tr)$.'), no(r, 'C’est le rang.'), no(n, 'C’est le nombre d’inconnues.')].filter(c => c[1] !== String(n - r)),
      'Théorème fondamental : $\\dim N(A)=n-r$, $\\dim N(A\\tr)=m-r$.'); }),
  qcm('c3-dimNt', 'Rang', R => { const m = R.int(2, 6), n = R.int(2, 7), r = R.int(1, Math.min(m, n));
    return single(`$A$ est une matrice $${m}\\times${n}$ de rang $${r}$. Quelle est la dimension de $N(A\\tr)$ ?`, ok(m - r, `$m-r=${m}-${r}$.`),
      [no(n - r, 'C’est $\\dim N(A)$.'), no(r, 'C’est le rang.'), no(m, 'C’est le nombre de lignes.')].filter(c => c[1] !== String(m - r)),
      '$N(A\\tr)\\subset\\R^m$ est de dimension $m-r$.'); }),
  qcm('c3-systeme-homogene', 'Rang', R => { const n = R.int(3, 7), m = R.int(1, n - 1), r = R.int(1, m);
    return single(`Un système linéaire homogène de $${m}$ équations à $${n}$ inconnues a une matrice de rang $${r}$. Quelle est la dimension de l’espace des solutions ?`, ok(n - r, 'Une inconnue libre par colonne sans pivot.'),
      [no(n - m, 'Il faut le rang, pas le nombre d’équations.'), no(r, 'C’est le rang.'), no(0, `${n} inconnues pour au plus ${m} pivots : il y a des inconnues libres.`)].filter(c => c[1] !== String(n - r)),
      '$\\dim N(A)=n-r$ ; avec moins d’équations que d’inconnues, il y a toujours une solution non nulle.'); }),
  qcm('c3-CA', 'Rang', R => fromPool(R, 'Soit $A\\in\\Mat_{m\\times n}(\\R)$ de rang $r$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$Ax=b$ a une solution si et seulement si $b\\in C(A)$', 'Proposition du cours.'], [true, 'Si $r=m$, $Ax=b$ a une solution pour tout $b$', '$C(A)=\\R^m$.'], [true, 'Si $r=n$, $Ax=b$ a au plus une solution', '$N(A)=\\ens{\\mathbf 0}$.'],
    [false, 'Si $r=m$, la solution est unique', 'Unique si $r=n$.'], [true, '$\\dim C(A)=\\dim R(A)$', 'Rang ligne = rang colonne.'], [false, '$C(A)=R(A)$', 'Ils ne sont même pas dans le même espace si $m\\neq n$.'],
    [true, 'Les colonnes pivots de $A$ forment une base de $C(A)$', 'Théorème fondamental.'], [false, 'Les colonnes pivots de $U$ forment une base de $C(A)$', '$C(U)\\neq C(A)$ en général.'],
  ], 'Théorème fondamental de l’algèbre linéaire.')),
  qcm('c3-elim-preserve', 'Rang', R => fromPool(R, 'Si $PA=LU$, lesquelles de ces données sont les mêmes pour $A$ et pour $U$ ?', [
    [true, 'l’espace ligne', 'Théorème du cours.'], [true, 'l’espace nul', '$Ax=\\mathbf 0\\iff Ux=\\mathbf 0$.'], [false, 'l’espace colonne', 'Faux pour $\\begin{pmatrix}1&1\\\\1&1\\end{pmatrix}$.'], [true, 'le rang', 'Égal à $\\dim R$.'],
    [false, 'le déterminant, toujours', 'Au signe de $P$ près.'], [true, 'la liste des colonnes pivots', 'Lue sur $U$.'],
  ], 'Les opérations sur les lignes conservent $R(A)$ et $N(A)$, pas $C(A)$.')),
  qcm('c3-orthogonaux', 'Rang', R => fromPool(R, 'Soit $A\\in\\Mat_{m\\times n}(\\R)$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$N(A)$ et $R(A)$ sont orthogonaux dans $\\R^n$', 'Chaque ligne de $A$ est orthogonale à toute solution de $Ax=\\mathbf 0$.'], [true, '$\\R^n=R(A)\\oplus N(A)$', 'Dimensions $r$ et $n-r$, intersection nulle.'],
    [true, '$N(A\\tr)$ et $C(A)$ sont orthogonaux dans $\\R^m$', 'Même argument pour $A\\tr$.'], [false, '$N(A)\\subset C(A)$', 'Ils vivent dans $\\R^n$ et $\\R^m$.'], [false, 'Sur $\\C$, avec le produit $x\\tr y$, $N(A)\\cap R(A)=\\ens{\\mathbf 0}$', 'Contre-exemple du cours : $(1,i)$.'],
  ], 'Les quatre sous-espaces fondamentaux et leurs orthogonalités.')),
  // ---------------------------------------------------------------- change of basis, orthonormal bases
  qcm('c3-passage', 'Changement de base', R => { const P = unimodular(R), b1 = [P[0][0], P[1][0]], b2 = [P[0][1], P[1][1]];
    return single(`La base $B'=(b_1',b_2')$ de $\\R^2$ est donnée par $b_1'=${vtex(b1)}$, $b_2'=${vtex(b2)}$. Quelle est la matrice de passage de la base canonique à $B'$ ?`, ok(`$${pm(P)}$`, 'Ses colonnes sont les nouveaux vecteurs écrits dans l’ancienne base.'),
      [no(`$${pm(tr(P))}$`, 'Les vecteurs ont été mis en lignes.'), no(`$${pm([[P[1][1], -P[0][1]], [-P[1][0], P[0][0]]].map(r => r.map(x => x * det2(P))))}$`, 'C’est $P^{-1}$.'), no(`$${pm([[P[0][1], P[0][0]], [P[1][1], P[1][0]]])}$`, 'Colonnes dans le mauvais ordre.')],
      'Colonnes de $P$ : coordonnées de $b\'_j$ dans l’ancienne base ; alors $x=Px\'$.'); }),
  qcm('c3-nouvelles-coord', 'Changement de base', R => { const P = unimodular(R), xp = vec(R, 2, -3, 3), x = [P[0][0] * xp[0] + P[0][1] * xp[1], P[1][0] * xp[0] + P[1][1] * xp[1]];
    return single(`Avec la matrice de passage $P=${pm(P)}$ (de la base canonique à $B'$), quelles sont les coordonnées dans $B'$ du vecteur $v=${vtex(x)}$ ?`, ok(`$${vtex(xp)}$`, '$x\'=P^{-1}x$ ; vérifier que $Px\'=x$.'),
      [no(`$${vtex([P[0][0] * x[0] + P[0][1] * x[1], P[1][0] * x[0] + P[1][1] * x[1]])}$`, 'C’est $Px$ : sens inverse.'), no(`$${vtex(x)}$`, 'Ce sont les anciennes coordonnées.'), no(`$${vtex(scal(-1, xp))}$`, 'Erreur de signe.')],
      'La source d’erreur la plus fréquente : $P$ transforme les nouvelles coordonnées en anciennes.'); }),
  qcm('c3-orthogonale', 'Orthonormalité', R => { const cases = [['\\begin{pmatrix}\\frac35&-\\frac45\\\\\\frac45&\\frac35\\end{pmatrix}', true, 'Colonnes unitaires et orthogonales (rotation).'], ['\\begin{pmatrix}0&1&0\\\\0&0&1\\\\1&0&0\\end{pmatrix}', true, 'Matrice de permutation.'],
      ['\\begin{pmatrix}1&1\\\\-1&1\\end{pmatrix}', false, 'Colonnes orthogonales mais de norme $\\sqrt2$.'], ['\\frac1{\\sqrt2}\\begin{pmatrix}1&1\\\\1&-1\\end{pmatrix}', true, 'Colonnes orthonormées (réflexion).'],
      ['\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}', false, 'Colonnes non orthogonales.'], ['\\begin{pmatrix}2&0\\\\0&\\frac12\\end{pmatrix}', false, 'Déterminant 1 mais colonnes non unitaires.'], ['-I_3', true, '$(-I)\\tr(-I)=I$.']];
    const [M, isO, why] = R.pick(cases);
    return single(`La matrice $${M}$ est-elle orthogonale ?`, ok(isO ? 'Oui' : 'Non', why),
      [no(isO ? 'Non' : 'Oui', 'Calculer $Q\\tr Q$.'), no(isO ? 'Non, car elle n’est pas symétrique' : 'Oui, car son déterminant est non nul', isO ? 'La symétrie n’est pas le critère.' : 'Il faut $Q\\tr Q=I$.'), no(isO ? 'Non, car un coefficient est négatif ou nul' : 'Oui, car ses colonnes sont non nulles', 'Ce n’est pas le critère.')],
      '$Q$ orthogonale $\\iff Q\\tr Q=I_n\\iff$ ses colonnes forment une base orthonormée.'); }),
  qcm('c3-coord-on', 'Orthonormalité', R => { const [a, b, c] = R.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17]]), v = vec(R, 2, -5, 5);
    const q1 = [new Frac(a, c), new Frac(b, c)], x1 = new Frac(v[0] * a + v[1] * b, c), x2 = new Frac(-v[0] * b + v[1] * a, c);
    return single(`Dans la base orthonormée $q_1=(\\frac{${a}}{${c}},\\frac{${b}}{${c}})$, $q_2=(-\\frac{${b}}{${c}},\\frac{${a}}{${c}})$, quelle est la première coordonnée de $v=${vtex(v)}$ ?`,
      ok(`$${x1.tex()}$`, '$x_1=v\\cdot q_1$.'), [no(`$${x2.tex()}$`, 'C’est $v\\cdot q_2$.'), no(`$${new Frac(v[0] * a + v[1] * b, c * c).tex()}$`, 'On a divisé deux fois.'), no(`$${v[0]}$`, 'C’est la coordonnée canonique.')],
      'Dans une base orthonormée, $x_j=v\\cdot q_j$ : pas de système à résoudre.'); }),
  // ---------------------------------------------------------------- determinants
  qcm('c3-det3', 'Déterminants', R => { const A = mat(R, 3, 3, -3, 3), d = det(A).p;
    const diag = A[0][0] * A[1][1] * A[2][2], sarrusPlus = diag + A[0][1] * A[1][2] * A[2][0] + A[0][2] * A[1][0] * A[2][1];
    return single(`Calculer $\\det${pm(A)}$.`, ok(d, 'Développement ou élimination.'),
      [no(-d, 'Erreur de signe.'), no(diag, 'Produit de la diagonale seulement : vrai pour une triangulaire.'), no(sarrusPlus, 'Seulement les trois termes positifs de Sarrus.')],
      'Par élimination : produit des pivots, au signe des échanges près.'); }),
  qcm('c3-det-tri', 'Déterminants', R => { const d = vec(R, 3, -4, 4).map(x => x || 2), A = [[d[0], R.int(-5, 5), R.int(-5, 5)], [0, d[1], R.int(-5, 5)], [0, 0, d[2]]], p = d[0] * d[1] * d[2];
    return single(`Calculer $\\det${pm(A)}$.`, ok(p, 'Triangulaire : produit de la diagonale.'),
      [no(d[0] + d[1] + d[2], 'C’est la trace.'), no(-p, 'Pas de signe à ajouter.'), no(p * A[0][1] || p + 1, 'Les coefficients hors diagonale ne comptent pas.')],
      'P6 : le déterminant d’une triangulaire est le produit des coefficients diagonaux.'); }),
  qcm('c3-det-kA', 'Déterminants', R => { const n = R.int(2, 4), k = R.pick([-2, 2, 3, -1]), d = R.nonzero(-5, 5);
    return single(`$A\\in\\Mat_{${n}}(\\R)$ a pour déterminant $${d}$. Que vaut $\\det(${k}A)$ ?`, ok(k ** n * d, `$(${k})^{${n}}\\cdot${d}$.`),
      [no(k * d, 'On n’a multiplié qu’une ligne.'), no(k ** n + d, 'Le facteur multiplie.'), no(n * k * d, 'Ce n’est pas linéaire en $k$.')].filter(c => c[1] !== String(k ** n * d)),
      '$\\det(kA)=k^n\\det A$ : linéarité par rapport à chacune des $n$ lignes.'); }),
  qcm('c3-det-produit', 'Déterminants', R => { const a = R.nonzero(-5, 5), b = R.nonzero(-5, 5), which = R.pick(['AB', 'A^{-1}', 'A\\tr B', 'A^2B^{-1}']);
    const val = { AB: new Frac(a * b), 'A^{-1}': new Frac(1, a), 'A\\tr B': new Frac(a * b), 'A^2B^{-1}': new Frac(a * a, b) }[which];
    return single(`$\\det A=${a}$ et $\\det B=${b}$ ($A,B$ carrées de même taille). Que vaut $\\det(${which})$ ?`, ok(`$${val.tex()}$`, 'Le déterminant est multiplicatif, et $\\det A\\tr=\\det A$.'),
      [no(`$${new Frac(a + b).tex()}$`, 'Le déterminant n’est pas additif.'), no(`$${val.neg().tex()}$`, 'Erreur de signe.'), no(`$${new Frac(a * b * 2).tex()}$`, 'Recompter.')],
      'P8 : $\\det(AB)=\\det A\\det B$, d’où $\\det A^{-1}=\\frac1{\\det A}$ ; P9 : $\\det A\\tr=\\det A$.'); }),
  qcm('c3-det-operations', 'Déterminants', R => { const d = R.nonzero(-6, 6), k = R.pick([2, 3, -2, 5]), op = R.pick(['swap', 'add', 'scale', 'two']);
    const txt = { swap: 'en échangeant les lignes 1 et 2', add: `en ajoutant ${k} fois la ligne 1 à la ligne 3`, scale: `en multipliant la ligne 2 par ${k}`, two: 'en remplaçant la ligne 3 par une copie de la ligne 1' }[op];
    const val = { swap: -d, add: d, scale: k * d, two: 0 }[op];
    return single(`$\\det A=${d}$. On obtient $B$ à partir de $A$ ${txt}. Que vaut $\\det B$ ?`, ok(val, { swap: 'P2.', add: 'P5.', scale: 'P3.', two: 'P4 : deux lignes égales.' }[op]),
      [no(d, 'Cette opération change le déterminant.'), no(-d, 'Ce n’est pas un échange.'), no(k * d, 'Ce n’est pas une multiplication de ligne.'), no(0, 'Les lignes de $B$ restent distinctes.'), no(d + k, 'Recompter.')].filter(c => c[1] !== String(val)).slice(0, 3),
      'Échange : signe change ; ajout d’un multiple d’une autre ligne : rien ne change ; ligne multipliée par $k$ : déterminant multiplié par $k$.'); }),
  qcm('c3-det-props', 'Déterminants', R => fromPool(R, 'Pour $A,B\\in\\Mat_n(\\R)$, lesquelles de ces affirmations sont vraies ?', [
    [true, '$A$ inversible $\\iff\\det A\\neq0$', 'Caractérisation.'], [true, '$\\det(AB)=\\det(BA)$', 'Produit de deux réels.'], [false, '$\\det(A+B)=\\det A+\\det B$', '$\\det(I_2+I_2)=4\\neq2$.'],
    [true, 'Si deux colonnes de $A$ sont égales, $\\det A=0$', 'P9 puis P4.'], [false, '$\\det(-A)=-\\det A$', 'C’est $(-1)^n\\det A$.'], [true, '$\\det P_\\sigma=\\sgn(\\sigma)$', 'Matrices de permutation.'],
    [false, 'Un déterminant nul implique une ligne nulle', 'Deux lignes égales suffisent.'], [true, '$\\det A=\\pm$ produit des pivots', 'Élimination.'],
  ], 'Propriétés P1 à P9 du déterminant.')),
  qcm('c3-det-param2', 'Déterminants', R => { const a = R.int(1, 6);
    return single(`Pour quelles valeurs de $t\\in\\R$ la matrice $\\begin{pmatrix}t&${a}\\\\${a}&t\\end{pmatrix}$ n’est-elle pas inversible ?`, ok(`$t=${a}$ ou $t=-${a}$`, `$\\det=t^2-${a * a}$.`),
      [no(`$t=${a}$ seulement`, `$t=-${a}$ annule aussi $t^2-${a * a}$.`), no(`$t=${a * a}$`, 'On a oublié la racine.'), no('aucune', 'Le déterminant s’annule.')],
      'Non inversible $\\iff\\det=0$.'); }),
  // ---------------------------------------------------------------- linear maps
  qcm('c3-lineaires', 'Applications linéaires', R => fromPool(R, 'Lesquelles de ces applications sont linéaires ?', [
    [true, '$\\R[X]\\to\\R[X]$, $P\\mapsto P\'$', 'Dérivation.'], [false, '$\\R^2\\to\\R^2$, $v\\mapsto v+(1,0)$', '$f(\\mathbf 0)\\neq\\mathbf 0$.'], [true, '$\\Mat_n(\\R)\\to\\Mat_n(\\R)$, $A\\mapsto A\\tr$', 'Transposition.'],
    [false, '$\\Mat_2(\\R)\\to\\R$, $A\\mapsto\\det A$', '$\\det(2I_2)=4$.'], [false, '$\\R\\to\\R$, $x\\mapsto\\abs x$', '$\\abs{-1}\\neq-1$.'], [true, '$\\R^2\\to\\R$, $(x,y)\\mapsto3x-2y$', 'Forme linéaire.'],
    [false, '$\\R^2\\to\\R^2$, $(x,y)\\mapsto(x+y,xy)$', '$xy$ n’est pas linéaire.'], [true, '$\\R[X]\\to\\R$, $P\\mapsto P(2)$', 'Évaluation.'], [true, '$\\Mat_n(\\R)\\to\\R$, $A\\mapsto\\sum_ia_{ii}$', 'La trace.'],
    [false, '$\\R^2\\to\\R$, $(x,y)\\mapsto\\sqrt{x^2+y^2}$', 'La norme n’est pas linéaire.'],
  ], 'Linéaire : $f(\\lambda v+\\mu w)=\\lambda f(v)+\\mu f(w)$ ; en particulier $f(\\mathbf 0)=\\mathbf 0$.')),
  qcm('c3-rang-theoreme', 'Applications linéaires', R => { const n = R.int(3, 8), m = R.int(2, 7), r = R.int(1, Math.min(m, n));
    return single(`$f:\\R^{${n}}\\to\\R^{${m}}$ est linéaire et $\\dim\\Img f=${r}$. Que vaut $\\dim\\Ker f$ ?`, ok(n - r, `$${n}-${r}$.`),
      [no(m - r, 'Il faut la dimension de l’espace de départ.'), no(r, 'C’est le rang.'), no(n + m - r, 'Recompter.')].filter(c => c[1] !== String(n - r)),
      'Théorème du rang : $\\dim\\Ker f+\\dim\\Img f=\\dim V_1$.'); }),
  qcm('c3-inj-surj', 'Applications linéaires', R => { const n = R.int(1, 6), m = R.int(1, 6);
    return { stem: `Une application linéaire $f:\\R^{${n}}\\to\\R^{${m}}$ peut-elle être :`, multi: true,
      choices: [[n <= m, 'injective', n <= m ? 'Possible : par exemple l’inclusion.' : `Le noyau a une dimension au moins $${n}-${m}$.`], [n >= m, 'surjective', n >= m ? 'Possible : par exemple une projection.' : `L’image a une dimension au plus $${n}$.`],
        [n === m, 'bijective', n === m ? 'Par exemple l’identité.' : 'Il faudrait $n=m$.'], [true, 'nulle', 'Toujours possible.']],
      expl: 'Théorème du rang : injective $\\Rightarrow n\\le m$, surjective $\\Rightarrow n\\ge m$.' }; }),
  qcm('c3-matrice-derivee', 'Applications linéaires', R => { const n = R.int(2, 3), M = [...Array(n + 1).keys()].map(i => [...Array(n + 1).keys()].map(j => (j === i + 1 ? j : 0)));
    return single(`Quelle est la matrice de $P\\mapsto P'$ dans la base $(1,X,\\dots,X^{${n}})$ de $\\R_{${n}}[X]$ ?`, ok(`$${pm(M)}$`, 'Colonne $j$ : coordonnées de $(X^j)\'=jX^{j-1}$.'),
      [no(`$${pm(M.map((r, i) => r.map((x, j) => M[j][i])))}$`, 'Transposée : les images ont été mises en lignes.'), no(`$${pm(M.map(r => r.map(x => (x ? 1 : 0))))}$`, 'Il faut les coefficients $j$.'), no(`$${pm([...Array(n + 1).keys()].map(i => [...Array(n + 1).keys()].map(j => (i === j ? i : 0))))}$`, 'Ce n’est pas une matrice diagonale.')],
      'La colonne $j$ contient les coordonnées de l’image du $j$-ème vecteur de base.'); }),
  qcm('c3-matrice-geo', 'Applications linéaires', R => { const cases = [['la rotation d’angle $\\frac\\pi2$', [[0, -1], [1, 0]]], ['la symétrie $(x,y)\\mapsto(y,x)$', [[0, 1], [1, 0]]], ['la projection $(x,y)\\mapsto(x,0)$', [[1, 0], [0, 0]]], ['l’homothétie de rapport 3', [[3, 0], [0, 3]]], ['la rotation d’angle $\\pi$', [[-1, 0], [0, -1]]], ['la symétrie $(x,y)\\mapsto(x,-y)$', [[1, 0], [0, -1]]]];
    const [name, M] = R.pick(cases), others = R.shuffle(cases.filter(c => c[1] !== M)).slice(0, 3);
    return single(`Quelle est la matrice, dans la base canonique de $\\R^2$, de ${name} ?`, ok(`$${pm(M)}$`, 'Colonnes : images de $e_1$ et de $e_2$.'), others.map(([n2, M2]) => no(`$${pm(M2)}$`, `C’est la matrice de ${n2}.`)),
      'La colonne $j$ est l’image de $e_j$.'); }),
  qcm('c3-noyau-image', 'Applications linéaires', R => fromPool(R, 'Soit $f:V_1\\to V_2$ linéaire. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$\\Ker f$ est un sous-espace de $V_1$', 'Proposition du cours.'], [true, '$\\Img f$ est un sous-espace de $V_2$', 'Proposition du cours.'], [true, '$f$ injective $\\iff\\Ker f=\\ens{\\mathbf 0}$', '$f(x)=f(y)\\iff x-y\\in\\Ker f$.'],
    [false, '$f$ surjective $\\iff\\Ker f=V_1$', 'C’est $f=0$.'], [true, 'L’image d’une famille génératrice engendre $\\Img f$', 'Linéarité.'], [false, 'L’image d’une famille libre est libre', 'Faux pour $f=0$ ; vrai si $f$ est injective.'],
    [true, 'En dimension finie égale, $f$ injective $\\iff f$ surjective', 'Théorème du rang.'],
  ], 'Noyau, image, injectivité, théorème du rang.')),
  qcm('c3-composition-rang', 'Applications linéaires', R => fromPool(R, 'Pour des matrices $A$ ($m\\times n$) et $B$ ($n\\times p$), lesquelles de ces affirmations sont vraies ?', [
    [true, '$\\rg(AB)\\le\\rg A$', '$C(AB)\\subset C(A)$.'], [true, '$\\rg(AB)\\le\\rg B$', '$N(B)\\subset N(AB)$.'], [false, '$\\rg(AB)=\\rg A\\cdot\\rg B$', 'Le rang ne se multiplie pas.'],
    [true, 'Si $B$ est carrée inversible, $\\rg(AB)=\\rg A$', '$C(AB)=C(A)$.'], [true, '$\\rg A\\tr=\\rg A$', 'Rang ligne = rang colonne.'], [false, '$\\rg(A+A)=2\\rg A$', '$\\rg(2A)=\\rg A$.'],
  ], 'Le rang est la dimension de l’image ; composer ne peut que la réduire.')),
  qcm('c3-vect-vide', 'Familles', R => fromPool(R, 'Lesquelles de ces affirmations sur les sous-espaces engendrés sont vraies ?', [
    [true, '$\\Vect(\\varnothing)=\\ens{\\mathbf 0}$', 'La combinaison vide vaut $\\mathbf 0$.'], [true, '$\\Vect(S)$ est l’intersection des sous-espaces contenant $S$', 'Théorème du cours.'],
    [true, '$\\Vect(u)$ est une droite si $u\\neq\\mathbf 0$', 'Exemple du cours.'], [false, '$\\Vect(u,v)$ est toujours un plan', 'Pas si $u,v$ sont colinéaires.'], [true, '$S\\subset T\\Rightarrow\\Vect(S)\\subset\\Vect(T)$', 'Monotonie.'],
    [false, '$\\Vect(S\\cup T)=\\Vect(S)\\cup\\Vect(T)$', 'C’est $\\Vect(S)+\\Vect(T)$.'],
  ], '$\\Vect(S)$ : plus petit sous-espace contenant $S$, ensemble des combinaisons linéaires finies.')),
  qcm('c3-noyau-base', 'Rang', R => { const a = R.nonzero(-3, 3), b = R.int(-3, 3), c = R.int(-3, 3);
    return single(`Laquelle de ces familles est une base de $N\\begin{pmatrix}${a}&${b}&${c}\\end{pmatrix}\\subset\\R^3$ ?`, ok(`$(${-b},${a},0)$, $(${-c},0,${a})$`, 'Deux solutions libres (colonnes 2 et 3 libres), et $\\dim N=3-1=2$.'),
      [no(`$(${a},${b},${c})$`, 'C’est le vecteur ligne, orthogonal au noyau.'), no(`$(${-b},${a},0)$`, 'Une seule : il en faut deux ($\\dim N=2$).'), no(`$(1,0,0)$, $(0,1,0)$`, 'Ces vecteurs ne vérifient pas l’équation en général.')],
      'Variables libres : $y$ et $z$ ; on donne successivement la valeur 1 à chacune.'); }),
  qcm('c3-dim-C', 'Dimension', R => fromPool(R, 'Lesquelles de ces affirmations sur $\\C^n$ sont vraies ?', [
    [true, '$\\dim_\\C\\C^n=n$', 'Base canonique.'], [true, '$\\dim_\\R\\C^n=2n$', 'Base $(e_k,ie_k)$.'], [false, '$(e_1,\\dots,e_n)$ est une base de $\\C^n$ sur $\\R$', 'Elle n’engendre que $\\R^n$.'],
    [true, '$1$ et $i$ sont libres sur $\\R$', 'Pas de $a+bi=0$ avec $(a,b)\\neq0$ réels.'], [false, '$1$ et $i$ sont libres sur $\\C$', '$i\\cdot1-1\\cdot i=0$.'],
  ], 'Les scalaires font partie de la donnée : le même ensemble a deux dimensions.')),
  qcm('c3-dimension-sev', 'Dimension', R => { const n = R.int(3, 6), k = R.int(1, n - 1);
    return single(`Dans $\\R^{${n}}$, quelle est la dimension du sous-espace défini par $${k}$ équations linéaires homogènes indépendantes ?`, ok(n - k, 'Une matrice de rang $k$ à $n$ colonnes.'),
      [no(k, 'C’est le nombre d’équations.'), no(n, 'Les équations réduisent la dimension.'), no(n - k + 1, 'Recompter.')].filter(c => c[1] !== String(n - k)),
      'Espace nul d’une matrice $k\\times n$ de rang $k$ : dimension $n-k$.'); }),
  qcm('c3-steinitz', 'Dimension', R => fromPool(R, 'Lesquelles de ces affirmations découlent du lemme de Steinitz ?', [
    [true, 'Si $V$ est engendré par $n$ vecteurs, toute famille libre a au plus $n$ éléments', 'C’est l’énoncé.'], [true, 'Deux bases finies ont le même nombre d’éléments', 'Corollaire.'],
    [true, '$\\R^3$ ne contient pas 4 vecteurs libres', 'Engendré par 3 vecteurs.'], [false, 'Toute famille de $n$ vecteurs d’un espace de dimension $n$ est une base', 'Elle peut être liée.'],
    [false, 'Un espace engendré par $n$ vecteurs est de dimension $n$', 'Au plus $n$.'],
  ], 'Lemme de Steinitz, invariance de la dimension.')),
  qcm('c3-polynomes-libres', 'Familles', R => fromPool(R, 'Lesquelles de ces familles de $\\R_2[X]$ sont des bases ?', [
    [true, '$(1,X,X^2)$', 'Base canonique.'], [true, '$(1,X-1,(X-1)^2)$', 'Degrés échelonnés.'], [true, '$(1+X,1-X,X^2)$', 'Libres, trois vecteurs.'], [false, '$(1,X,1+X)$', '$1+X$ est combinaison des deux autres.'],
    [false, '$(X,X^2)$', 'Deux vecteurs seulement.'], [true, '$(X^2,X^2+X,X^2+X+1)$', 'Échelonnés en degré.'], [false, '$(1,X^2,1-X^2)$', 'Liée.'],
  ], 'Des polynômes de degrés deux à deux distincts sont libres ; trois polynômes libres de $\\R_2[X]$ forment une base.')),
  qcm('c3-det-permutation', 'Déterminants', R => { const s = R.shuffle([0, 1, 2]), P = [0, 1, 2].map(i => [0, 1, 2].map(j => (s[j] === i ? 1 : 0))), d = det(P).p;
    return single(`Que vaut $\\det${pm(P)}$ ?`, ok(d, d === 1 ? 'Permutation paire.' : 'Permutation impaire.'),
      [no(-d, 'Compter les échanges de lignes qui ramènent à $I_3$.'), no(0, 'Une matrice de permutation est inversible.'), no(3, 'Ce n’est pas le nombre de 1.')],
      '$\\det P_\\sigma=\\sgn(\\sigma)$ : chaque échange de deux lignes change le signe.'); }),
  qcm('c3-supplementaire', 'Sommes', R => { const n = R.int(3, 9), k = R.int(1, n - 1);
    return single(`$W$ est un sous-espace de dimension $${k}$ de $\\R^{${n}}$. Quelle est la dimension de tout supplémentaire de $W$ ?`, ok(n - k, 'Grassmann avec une intersection nulle.'),
      [no(k, 'C’est $\\dim W$.'), no(n, 'C’est $\\dim\\R^n$.'), no(n + k, 'La somme ne dépasse pas $n$.')].filter(c => c[1] !== String(n - k)),
      '$V=W\\oplus W\'$ donne $\\dim W\'=\\dim V-\\dim W$, et tous les supplémentaires ont la même dimension.'); }),
  qcm('c3-dans-noyau', 'Rang', R => { const A = mat(R, 2, 3), v = vec(R, 3, -3, 3), inN = R() < 0.5;
    if (inN) { const a = A[0], b = A[1]; const c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; if (c.some(x => x)) v.splice(0, 3, ...c); }
    const Av = A.map(r => dot(r, v)), is0 = Av.every(x => x === 0);
    return single(`Le vecteur $v=${vtex(v)}$ est-il dans l’espace nul de $A=${pm(A)}$ ?`, ok(is0 ? 'Oui' : 'Non', `$Av=${vtex(Av)}$.`),
      [no(is0 ? 'Non' : 'Oui', 'Calculer $Av$.'), no(is0 ? 'Non, car $v$ n’est pas nul' : 'Oui, car $v$ n’est pas nul', 'Ce n’est pas le critère : on calcule $Av$.'), no('La question n’a pas de sens : $A$ n’est pas carrée', '$N(A)\\subset\\R^3$ existe pour toute $A$ à 3 colonnes.')],
      '$v\\in N(A)\\iff Av=\\mathbf 0$.'); }),
  qcm('c3-image-contient', 'Rang', R => { const u = vec(R, 2, -4, 4).map(x => x || 1), k = R.nonzero(-3, 3), A = [[u[0], k * u[0]], [u[1], k * u[1]]], t = R.nonzero(-3, 3), inside = R() < 0.5, b = inside ? [t * u[0], t * u[1]] : [t * u[0] + 1, t * u[1]];
    const isIn = b[0] * u[1] - b[1] * u[0] === 0;
    return single(`Le système $${pm(A)}x=${pm(b.map(x => [x]))}$ a-t-il une solution ?`, ok(isIn ? 'Oui' : 'Non', isIn ? '$b$ est un multiple de la première colonne.' : '$b$ n’est pas dans $C(A)$, qui est une droite.'),
      [no(isIn ? 'Non' : 'Oui', 'Comparer $b$ à l’espace colonne.'), no('Oui, une solution unique', 'La matrice est de rang 1 : jamais unique.'), no(isIn ? 'Non, car la matrice n’est pas inversible' : 'Oui, car la matrice est carrée', isIn ? 'Non inversible n’empêche pas d’avoir des solutions : $b$ est dans $C(A)$.' : 'Elle n’est pas inversible.')],
      '$Ax=b$ a une solution $\\iff b\\in C(A)$ ; ici $C(A)$ est la droite engendrée par la première colonne.'); }),
  qcm('c3-det2', 'Déterminants', R => { const A = mat(R, 2, 2, -7, 7), d = det2(A);
    return single(`Calculer $\\det${pm(A)}$.`, ok(d, '$ad-bc$.'), [no(A[0][0] * A[1][1] + A[0][1] * A[1][0], 'Signe oublié : $ad+bc$.'), no(A[0][1] * A[1][0] - A[0][0] * A[1][1], 'C’est $bc-ad$, l’opposé.'), no(A[0][0] * A[1][0] - A[0][1] * A[1][1], 'Produits des colonnes au lieu des diagonales.')],
      'En dimension 2, $\\det=ad-bc$.'); }),
  qcm('c3-orthogonal-dim', 'Orthonormalité', R => { const n = R.int(3, 8), k = R.int(1, n - 1);
    return single(`$W$ est un sous-espace de dimension $${k}$ de $\\R^{${n}}$. Quelle est la dimension de $W^\\perp=\\ens{x\\mid x\\cdot w=0\\ \\forall w\\in W}$ ?`, ok(n - k, `Écrire $W=R(A)$ avec $A$ de rang ${k} : $W^\\perp=N(A)$.`),
      [no(k, 'C’est $\\dim W$.'), no(n, 'Trop grand.'), no(1, 'Ce n’est pas toujours une droite.')].filter(c => c[1] !== String(n - k)),
      'Théorème fondamental : $N(A)$ est l’orthogonal de $R(A)$ dans $\\R^n$, de dimension $n-r$.'); }),
];

// ---------------------------------------------------------------- quizzes
ITEMS.push(
  quiz('c3q-rang', 'Rang', R => { const m = R.int(3, 4), n = R.int(3, 5), r = R.int(1, Math.min(m, n)), A = ofRank(R, m, n, r); return { stem: `Donner le rang de $${pm(A)}$.`, type: 'int', answer: r, expl: 'Nombre de pivots après élimination.' }; }),
  quiz('c3q-dimN', 'Rang', R => { const m = R.int(3, 4), n = R.int(3, 5), r = R.int(1, Math.min(m, n)), A = ofRank(R, m, n, r); return { stem: `Donner la dimension de l’espace nul de $${pm(A)}$.`, type: 'int', answer: n - r, expl: '$\\dim N(A)=n-\\rg A$.' }; }),
  quiz('c3q-det3', 'Déterminants', R => { const A = mat(R, 3, 3, -4, 4); return { stem: `Calculer $\\det${pm(A)}$.`, type: 'int', answer: det(A).p, expl: 'Élimination : produit des pivots, au signe des échanges près ; ou développement selon une ligne.' }; }),
  quiz('c3q-det4', 'Déterminants', R => { const U = [[R.nonzero(-3, 3), R.int(-3, 3), R.int(-3, 3), R.int(-3, 3)], [0, R.nonzero(-3, 3), R.int(-3, 3), R.int(-3, 3)], [0, 0, R.nonzero(-3, 3), R.int(-3, 3)], [0, 0, 0, R.nonzero(-3, 3)]];
    return { stem: `Calculer $\\det${pm(U)}$.`, type: 'int', answer: U[0][0] * U[1][1] * U[2][2] * U[3][3], expl: 'Triangulaire : produit de la diagonale.' }; }),
  quiz('c3q-det-param', 'Déterminants', R => { const a = R.int(1, 7); return { stem: `Donner l’ensemble des réels $t$ pour lesquels $\\begin{pmatrix}t&${a}\\\\${a}&t\\end{pmatrix}$ n’est pas inversible.`, type: 'set', answer: [a, -a], expl: `$t^2-${a * a}=0$.` }; }),
  quiz('c3q-coord', 'Bases', R => { const P = unimodular(R), x = vec(R, 2, -5, 5), v = [P[0][0] * x[0] + P[0][1] * x[1], P[1][0] * x[0] + P[1][1] * x[1]];
    return { stem: `Donner les coordonnées de $v=${vtex(v)}$ dans la base $b_1=${vtex([P[0][0], P[1][0]])}$, $b_2=${vtex([P[0][1], P[1][1]])}$.`, type: 'tuple', answer: x, expl: 'Résoudre $x_1b_1+x_2b_2=v$.' }; }),
  quiz('c3q-grassmann', 'Dimension', R => { const n = R.int(4, 9), u = R.int(2, n - 1), w = R.int(2, n - 1), s = R.int(Math.max(u, w), Math.min(n, u + w));
    return { stem: `Dans $\\R^{${n}}$ : $\\dim U=${u}$, $\\dim W=${w}$, $\\dim(U+W)=${s}$. Donner $\\dim(U\\cap W)$.`, type: 'int', answer: u + w - s, expl: 'Formule de Grassmann.' }; }),
  quiz('c3q-dims', 'Dimension', R => { const n = R.int(2, 8), k = R.pick(['sym', 'anti', 'poly', 'mat']); const S = { sym: [`des matrices symétriques $${n}\\times${n}$`, n * (n + 1) / 2], anti: [`des matrices antisymétriques $${n}\\times${n}$`, n * (n - 1) / 2], poly: [`de $\\R_{${n}}[X]$`, n + 1], mat: [`de $\\Mat_{${n}\\times${n + 1}}(\\R)$`, n * (n + 1)] }[k];
    return { stem: `Donner la dimension ${S[0]}.`, type: 'int', answer: S[1], expl: 'Compter les vecteurs d’une base.' }; }),
  quiz('c3q-detkA', 'Déterminants', R => { const n = R.int(2, 5), k = R.pick([-3, -2, 2, 3]), d = R.nonzero(-4, 4); return { stem: `$A\\in\\Mat_{${n}}(\\R)$ et $\\det A=${d}$. Calculer $\\det(${k}A)$.`, type: 'int', answer: k ** n * d, expl: '$\\det(kA)=k^n\\det A$.' }; }),
  quiz('c3q-derivee', 'Applications linéaires', R => { const n = R.int(2, 3); return { stem: `Donner la matrice de $P\\mapsto P'$ dans la base $(1,X,\\dots,X^{${n}})$ de $\\R_{${n}}[X]$.`, type: 'matrix', answer: [...Array(n + 1).keys()].map(i => [...Array(n + 1).keys()].map(j => (j === i + 1 ? j : 0))), expl: 'Colonne $j$ : coordonnées de $(X^j)\'=jX^{j-1}$.' }; }),
  quiz('c3q-onb', 'Orthonormalité', R => { const v = vec(R, 2, -6, 6); return { stem: `Donner les coordonnées de $v=${vtex(v)}$ dans la base orthonormée $q_1=(\\frac35,\\frac45)$, $q_2=(-\\frac45,\\frac35)$.`, type: 'tuple', answer: [new Frac(3 * v[0] + 4 * v[1], 5), new Frac(-4 * v[0] + 3 * v[1], 5)], expl: '$x_j=v\\cdot q_j$.' }; }),
  quiz('c3q-noyau-dim', 'Applications linéaires', R => { const n = R.int(3, 9), m = R.int(2, 8), r = R.int(1, Math.min(n, m)); return { stem: `$f:\\R^{${n}}\\to\\R^{${m}}$ linéaire, de rang $${r}$. Donner $\\dim\\Ker f$.`, type: 'int', answer: n - r, expl: 'Théorème du rang.' }; }),
  quiz('c3q-taylor', 'Bases', R => { const a = R.int(-4, 4), b = R.int(-5, 5), c = R.int(-5, 5), x0 = R.pick([1, -1, 2, -2]);
    return { stem: `Donner les coordonnées de $${Q.poly([a, b, c], 'X')}$ dans la base $(1,\\ X${x0 > 0 ? '-' : '+'}${Math.abs(x0)},\\ (X${x0 > 0 ? '-' : '+'}${Math.abs(x0)})^2)$.`, type: 'tuple', answer: [a * x0 * x0 + b * x0 + c, 2 * a * x0 + b, a], expl: '$P(a)$, $P\'(a)$, $\\frac{P\'\'(a)}2$.' }; }),
  quiz('c3q-k-lie', 'Familles', R => { const u = [1, R.int(-3, 3), R.int(-3, 3)], v = [0, 1, R.int(-3, 3)], a = R.nonzero(-3, 3), b = R.nonzero(-3, 3), w = add(scal(a, u), scal(b, v));
    return { stem: `Trouver $k$ pour que $(${u.join(',')})$, $(${v.join(',')})$ et $(${w[0]},${w[1]},k)$ soient liés.`, type: 'int', answer: w[2], expl: `Le troisième doit être $${a}u${b > 0 ? '+' : ''}${b}v$ ; on lit $k$ sur la dernière composante.` }; }),
);
