// Algèbre 1, chapter 2 (vectors of R^n and C^n, matrices, inverses, independence, transposition, elimination PA = LU):
// QCM and quiz generators for the bank. Every numerical answer is computed here, never typed.
import * as Q from './algebra1-qbank.js';
import { eliminate, Frac } from './algebra1-model.js';
const { qcm, quiz, right: ok, wrong: no, single, fromPool, pmatrix: pm } = Q;

const vec = (R, n = 3, lo = -5, hi = 5) => [...Array(n).keys()].map(() => R.int(lo, hi));
const vtex = v => `(${v.join(',')})`;
const col = v => pm(v.map(x => [x]));
const dot = (u, v) => u.reduce((s, x, i) => s + x * v[i], 0);
const add = (u, v) => u.map((x, i) => x + v[i]);
const scal = (k, u) => u.map(x => k * x);
const mat = (R, m, n, lo = -4, hi = 4) => [...Array(m).keys()].map(() => vec(R, n, lo, hi));
const mul = (A, B) => A.map(r => B[0].map((_, j) => r.reduce((s, x, k) => s + x * B[k][j], 0)));
const tr = A => A[0].map((_, j) => A.map(r => r[j]));
const det2 = ([[a, b], [c, d]]) => a * d - b * c;
const det3 = A => A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
const same = (A, B) => JSON.stringify(A) === JSON.stringify(B);
const NORMS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [4, 4, 7, 9], [2, 6, 9, 11], [6, 6, 7, 11], [2, 10, 11, 15], [3, 4, 12, 13]];
const signed = (R, v) => v.map(x => R.sign() * x);
const unimodular = R => { for (;;) { const A = mat(R, 2, 2, -4, 4); if (Math.abs(det2(A)) === 1) return A; } };
const inv2 = ([[a, b], [c, d]]) => { const D = a * d - b * c; return [[new Frac(d, D), new Frac(-b, D)], [new Frac(-c, D), new Frac(a, D)]]; };

export const ITEMS = [
  // ---------------------------------------------------------------- vectors
  qcm('c2-somme', 'Vecteurs', R => { const u = vec(R), v = vec(R), k = R.nonzero(-3, 3), l = R.nonzero(-3, 3), w = add(scal(k, u), scal(l, v));
    return single(`Avec $u=${vtex(u)}$ et $v=${vtex(v)}$, que vaut $${Q.term(k, 'u', true)}${Q.term(l, 'v')}$ ?`, ok(`$${vtex(w)}$`, 'Composante par composante.'),
      [no(`$${vtex(add(scal(k, u), scal(-l, v)))}$`, 'Erreur de signe sur le second terme.'), no(`$${vtex(add(scal(l, u), scal(k, v)))}$`, 'Les coefficients ont été échangés.'), no(`$${vtex(u.map((x, i) => k * l * x * v[i]))}$`, 'Ce n’est pas un produit composante par composante.')],
      'Les opérations sur $\\R^n$ se font composante par composante.'); }),
  qcm('c2-produit-scalaire', 'Vecteurs', R => { const u = vec(R), v = vec(R), d = dot(u, v);
    return single(`Que vaut $u\\cdot v$ pour $u=${vtex(u)}$ et $v=${vtex(v)}$ ?`, ok(d, 'Somme des produits des composantes.'),
      [no(u.reduce((a, b) => a + b, 0) * v.reduce((a, b) => a + b, 0), 'C’est le produit des sommes.'), no(d - 2 * u[0] * v[0], 'Erreur de signe sur le premier terme.'), no(dot(u, v.slice().reverse()), 'Les composantes ne sont pas dans le même ordre.')],
      '$u\\cdot v=u_1v_1+u_2v_2+u_3v_3$.'); }),
  qcm('c2-norme', 'Vecteurs', R => { const [a, b, c, n] = R.pick(NORMS), u = R.shuffle(signed(R, [a, b, c]));
    return single(`Quelle est la norme de $u=${vtex(u)}$ ?`, ok(n, `$\\sqrt{${a * a}+${b * b}+${c * c}}=\\sqrt{${n * n}}$.`),
      [no(a + b + c, 'C’est la somme des valeurs absolues.'), no(n * n, 'On a oublié la racine carrée.'), no(`$\\sqrt{${a + b + c}}$`, 'On a additionné les composantes avant de les élever au carré.')],
      '$\\norm u=\\sqrt{u\\cdot u}$.'); }),
  qcm('c2-distance', 'Vecteurs', R => { const [a, b, c, n] = R.pick(NORMS), d = R.shuffle(signed(R, [a, b, c])), p = vec(R), q = add(p, d);
    return single(`Quelle est la distance entre $P=${vtex(p)}$ et $Q=${vtex(q)}$ ?`, ok(n, `$\\norm{Q-P}$ avec $Q-P=${vtex(d)}$.`),
      [no(Math.abs(d[0]) + Math.abs(d[1]) + Math.abs(d[2]), 'C’est la distance \\og en escalier \\fg, pas la distance euclidienne.'), no(n * n, 'Il manque la racine.'), no(`$\\sqrt{${dot(add(p, q), add(p, q))}}$`, 'On a utilisé $P+Q$ au lieu de $Q-P$.')],
      '$d(P,Q)=\\norm{Q-P}$.'); }),
  qcm('c2-orthogonal-k', 'Vecteurs', R => { const u = [R.nonzero(-4, 4), R.nonzero(-4, 4), R.pick([1, -1])], a = R.int(-4, 4), b = R.int(-4, 4), k = -(u[0] * a + u[1] * b) / u[2];
    return single(`Pour quelle valeur de $k$ les vecteurs $${vtex(u)}$ et $(${a},${b},k)$ sont-ils orthogonaux ?`, ok(`$k=${k}$`, `Le produit scalaire vaut $${u[0] * a + u[1] * b}${u[2] > 0 ? '+' : '-'}k$.`),
      [no(`$k=${-k}$`, 'Erreur de signe.'), no(`$k=${u[0] * a + u[1] * b}$`, 'On a oublié de résoudre l’équation.'), no('aucune', 'L’équation est du premier degré en $k$ avec un coefficient non nul.')],
      'Orthogonaux signifie $u\\cdot v=0$.'); }),
  qcm('c2-cs-impossible', 'Vecteurs', R => { const a = R.int(2, 6), b = R.int(2, 6), m = a * b, bad = m + R.int(1, 4);
    return single(`Dans $\\R^3$, $\\norm u=${a}$ et $\\norm v=${b}$. Laquelle de ces valeurs $u\\cdot v$ ne peut pas prendre ?`, ok(bad, `$\\abs{u\\cdot v}\\le${a}\\cdot${b}=${m}$.`),
      [no(m, 'Atteinte pour $v$ multiple positif de $u$.'), no(-m, 'Atteinte pour $v$ multiple négatif de $u$.'), no(R.int(-m + 1, m - 1), 'Toute valeur de $[-ab,ab]$ est atteinte.')],
      'Inégalité de Cauchy, Schwarz, avec égalité exactement pour des vecteurs colinéaires.'); }),
  qcm('c2-triangulaire', 'Vecteurs', R => { const a = R.int(2, 9), b = R.int(2, 9), bad = a + b + R.int(1, 3);
    return single(`$\\norm u=${a}$ et $\\norm v=${b}$. Laquelle de ces valeurs $\\norm{u+v}$ ne peut pas prendre ?`, ok(bad, `$\\norm{u+v}\\le\\norm u+\\norm v=${a + b}$.`),
      [no(a + b, 'Atteinte si $v$ est un multiple positif de $u$.'), no(Math.abs(a - b), 'Atteinte si $v$ est un multiple négatif de $u$.'), no(`$\\sqrt{${a * a + b * b}}$`, 'Atteinte si $u\\perp v$ (Pythagore).')],
      'Inégalité triangulaire et sa conséquence $\\abs{\\norm u-\\norm v}\\le\\norm{u+v}$.'); }),
  qcm('c2-angle', 'Vecteurs', R => { const cases = [['(1,0)', '(1,1)', '\\frac\\pi4'], ['(1,0)', '(0,3)', '\\frac\\pi2'], ['(1,1)', '(-1,-1)', '\\pi'], ['(1,0)', '(1,\\sqrt3)', '\\frac\\pi3'], ['(1,0)', '(-1,\\sqrt3)', '\\frac{2\\pi}3'], ['(2,0)', '(5,0)', '0'], ['(1,0)', '(\\sqrt3,1)', '\\frac\\pi6']];
    const [u, v, t] = R.pick(cases), others = ['0', '\\frac\\pi6', '\\frac\\pi4', '\\frac\\pi3', '\\frac\\pi2', '\\frac{2\\pi}3', '\\pi'].filter(x => x !== t);
    return single(`Quel est l’angle entre $u=${u}$ et $v=${v}$ ?`, ok(`$${t}$`, '$\\cos\\theta=\\frac{u\\cdot v}{\\norm u\\norm v}$.'), R.sample(others, 3).map(x => no(`$${x}$`, 'Recalculer $\\cos\\theta$.')),
      'L’angle $\\theta\\in[0,\\pi]$ est défini par $\\cos\\theta=\\frac{u\\cdot v}{\\norm u\\,\\norm v}$, qui est dans $[-1,1]$ par Cauchy, Schwarz.'); }),
  qcm('c2-proprietes-ps', 'Vecteurs', R => fromPool(R, 'Pour $u,v,w\\in\\R^n$ et $k\\in\\R$, lesquelles de ces affirmations sont vraies ?', [
    [true, '$(u+v)\\cdot w=u\\cdot w+v\\cdot w$', 'Linéarité.'], [true, '$u\\cdot v=v\\cdot u$', 'Symétrie (sur $\\R$).'], [true, '$u\\cdot u=0\\Rightarrow u=\\mathbf 0$', 'Somme de carrés.'],
    [false, '$u\\cdot v=0\\Rightarrow u=\\mathbf 0$ ou $v=\\mathbf 0$', '$(1,0)\\cdot(0,1)=0$.'], [false, '$\\norm{u+v}=\\norm u+\\norm v$', 'Seulement si l’un est multiple positif de l’autre.'],
    [true, '$\\norm{ku}=\\abs k\\norm u$', 'Homogénéité.'], [false, '$\\norm{ku}=k\\norm u$', 'Faux pour $k<0$.'], [true, 'Si $u\\perp v$, $\\norm{u+v}^2=\\norm u^2+\\norm v^2$', 'Pythagore.'],
    [false, '$u\\cdot v\\le\\norm u+\\norm v$ pour tous $u,v$', 'Faux : $u=v=(3,0)$ donne $9>6$. C’est $\\abs{u\\cdot v}\\le\\norm u\\norm v$ qui est vrai.'],
  ], 'Propriétés du produit scalaire et de la norme (chapitre 2, §2).')),
  qcm('c2-complexe', 'Vecteurs', R => { const z = [[R.int(-3, 3), R.int(-3, 3)], [R.int(-3, 3), R.int(-3, 3)]], w = [[R.int(-3, 3), R.int(-3, 3)], [R.int(-3, 3), R.int(-3, 3)]];
    const cm = ([a, b], [c, d]) => [a * c - b * d, a * d + b * c], conj = ([a, b]) => [a, -b], sum = (p, q) => [p[0] + q[0], p[1] + q[1]];
    const ztex = ([a, b]) => (b === 0 ? `${a}` : a === 0 ? `${b === 1 ? '' : b === -1 ? '-' : b}i` : `${a}${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}i`);
    const good = sum(cm(z[0], conj(w[0])), cm(z[1], conj(w[1]))), noconj = sum(cm(z[0], w[0]), cm(z[1], w[1])), first = sum(cm(conj(z[0]), w[0]), cm(conj(z[1]), w[1]));
    return single(`Dans $\\C^2$, avec $z\\cdot w=z_1\\overline{w_1}+z_2\\overline{w_2}$, que vaut $z\\cdot w$ pour $z=(${ztex(z[0])},${ztex(z[1])})$ et $w=(${ztex(w[0])},${ztex(w[1])})$ ?`, ok(`$${ztex(good)}$`, 'On conjugue les composantes de $w$.'),
      [no(`$${ztex(noconj)}$`, 'Sans conjugué.'), no(`$${ztex(first)}$`, 'C’est $w\\cdot z=\\overline{z\\cdot w}$ : le conjugué est sur le mauvais facteur.'), no(`$${ztex([good[0], 0])}$`, 'Le produit scalaire complexe n’est pas réel en général.')],
      'Le produit scalaire complexe conjugue le second facteur ; $w\\cdot z=\\overline{z\\cdot w}$.'); }),
  qcm('c2-complexe-props', 'Vecteurs', R => fromPool(R, 'Avec $z\\cdot w=\\sum z_i\\overline{w_i}$ sur $\\C^n$, lesquelles de ces affirmations sont vraies ?', [
    [true, '$w\\cdot z=\\overline{z\\cdot w}$', 'Symétrie hermitienne.'], [false, '$w\\cdot z=z\\cdot w$', 'Faux en général : $(1)\\cdot(i)=-i$ et $(i)\\cdot(1)=i$.'],
    [true, '$(kz)\\cdot w=k(z\\cdot w)$', 'Linéaire à gauche.'], [false, '$z\\cdot(kw)=k(z\\cdot w)$', 'C’est $\\overline k(z\\cdot w)$.'], [true, '$z\\cdot z$ est un réel positif', '$\\sum\\abs{z_i}^2$.'],
    [false, 'Sans conjugué, $z\\cdot z$ serait encore une longueur', '$(1,i)$ donnerait $0$.'], [true, '$\\C^n$ est de dimension $2n$ sur $\\R$', 'Base $(e_1,ie_1,\\dots)$.'],
  ], 'Le produit scalaire complexe est sesquilinéaire : linéaire à gauche, semi-linéaire à droite.')),
  // ---------------------------------------------------------------- matrices
  qcm('c2-tailles', 'Matrices', R => { const m = R.int(1, 5), n = R.int(1, 5), p = R.int(1, 5);
    return single(`$A$ est $${m}\\times${n}$ et $B$ est $${n}\\times${p}$. Quelle est la taille de $AB$ ?`, ok(`$${m}\\times${p}$`, 'Les lignes de $A$, les colonnes de $B$.'),
      [no(`$${n}\\times${n}$`, 'La dimension commune disparaît.'), no(`$${p}\\times${m}$`, 'C’est la taille de $(AB)\\tr$.'), no('$AB$ n’est pas défini', `$A$ a ${n} colonnes et $B$ ${n} lignes.`)],
      'Un produit $(m\\times n)(n\\times p)$ est $m\\times p$.'); }),
  qcm('c2-defini', 'Matrices', R => { const m = R.int(1, 4), n = R.int(2, 4), p = R.int(1, 4), q = R.int(1, 4);
    const defAB = n === p, defBA = q === m;
    return { stem: `$A$ est $${m}\\times${n}$ et $B$ est $${p}\\times${q}$. Lesquels de ces produits sont définis ?`, multi: true,
      choices: [[defAB, '$AB$', defAB ? 'Colonnes de $A$ = lignes de $B$.' : `$${n}\\neq${p}$.`], [defBA, '$BA$', defBA ? 'Colonnes de $B$ = lignes de $A$.' : `$${q}\\neq${m}$.`],
        [true, '$A\\tr A$', 'Toujours défini : $(n\\times m)(m\\times n)$.'], [m === n, '$A^2$', m === n ? '$A$ est carrée.' : '$A$ n’est pas carrée.'], [m === p, '$A\\tr B$', m === p ? `Lignes de $A$ = lignes de $B$ : $${m}=${p}$.` : `$${m}\\neq${p}$.`]],
      expl: '$XY$ est défini si et seulement si le nombre de colonnes de $X$ égale le nombre de lignes de $Y$.' }; }),
  qcm('c2-coef-produit', 'Matrices', R => { const A = mat(R, 2, 3), B = mat(R, 3, 2), i = R.int(0, 1), j = R.int(0, 1), P = mul(A, B), BA = mul(B, A);
    return single(`Avec $A=${pm(A)}$ et $B=${pm(B)}$, que vaut le coefficient $(${i + 1},${j + 1})$ de $AB$ ?`, ok(P[i][j], `Ligne ${i + 1} de $A$ fois colonne ${j + 1} de $B$.`),
      [no(BA[i][j], 'C’est un coefficient de $BA$.'), no(dot(A[i], A[j]), 'On a multiplié deux lignes de $A$.'), no(P[j][i], 'Indices échangés.')],
      '$(AB)_{ij}=\\sum_ka_{ik}b_{kj}$.'); }),
  qcm('c2-produit-2x2', 'Matrices', R => { const A = mat(R, 2, 2, -3, 3), B = mat(R, 2, 2, -3, 3), P = mul(A, B);
    return single(`Calculer $AB$ pour $A=${pm(A)}$ et $B=${pm(B)}$.`, ok(`$${pm(P)}$`, 'Lignes de $A$ par colonnes de $B$.'),
      [no(`$${pm(mul(B, A))}$`, 'C’est $BA$.'), no(`$${pm(A.map((r, i) => r.map((x, j) => x * B[i][j])))}$`, 'Produit coefficient par coefficient : ce n’est pas le produit matriciel.'), no(`$${pm(mul(A, tr(B)))}$`, 'Lignes de $A$ par lignes de $B$.')],
      '$(AB)_{ij}=\\text{ligne }i\\text{ de }A\\cdot\\text{colonne }j\\text{ de }B$.'); }),
  qcm('c2-commutent', 'Matrices', R => { const A = mat(R, 2, 2, -2, 2), B = R() < 0.3 ? A.map((r, i) => r.map((x, j) => 2 * x + (i === j ? 1 : 0))) : mat(R, 2, 2, -2, 2), c = same(mul(A, B), mul(B, A));
    return single(`Les matrices $A=${pm(A)}$ et $B=${pm(B)}$ commutent-elles ?`, ok(c ? 'Oui' : 'Non', c ? `$AB=BA=${pm(mul(A, B))}$.` : `$AB=${pm(mul(A, B))}$ et $BA=${pm(mul(B, A))}$.`),
      [no(c ? 'Non' : 'Oui', 'Calculer les deux produits.'), no('On ne peut pas savoir sans le déterminant', 'Il suffit de calculer $AB$ et $BA$.'), no('Toujours, car elles sont carrées', 'Le produit matriciel n’est pas commutatif.')],
      'En général $AB\\neq BA$ ; un polynôme en $A$ commute avec $A$.'); }),
  qcm('c2-Ax', 'Matrices', R => { const A = mat(R, 3, 3, -3, 3), x = vec(R, 3, -3, 3), y = A.map(r => dot(r, x));
    return single(`Calculer $Ax$ pour $A=${pm(A)}$ et $x=${col(x)}$.`, ok(`$${col(y)}$`, `C’est $${x[0]}$ fois la colonne 1, plus $${x[1]}$ fois la colonne 2, plus $${x[2]}$ fois la colonne 3.`),
      [no(`$${col(tr(A).map(r => dot(r, x)))}$`, 'C’est $A\\tr x$ (combinaison des lignes).'), no(`$${col(A.map((r, i) => r[i] * x[i]))}$`, 'On n’a gardé que la diagonale.'), no(`$${col(A.map(r => r.reduce((a, b) => a + b, 0)))}$`, 'Ce sont les sommes des lignes, avec $x=(1,1,1)$.')],
      '$Ax=x_1a_1+x_2a_2+x_3a_3$ : combinaison des colonnes de $A$.'); }),
  qcm('c2-lectures', 'Matrices', R => fromPool(R, 'Lesquelles de ces lectures du produit $AB$ sont correctes ?', [
    [true, 'Chaque colonne de $AB$ est une combinaison des colonnes de $A$.', '$AB=(Ab_1\\ \\cdots\\ Ab_p)$.'], [true, 'Chaque ligne de $AB$ est une combinaison des lignes de $B$.', 'Ligne $i$ : $\\sum_ka_{ik}\\beta_k$.'],
    [false, 'Chaque colonne de $AB$ est une combinaison des colonnes de $B$.', 'Ce sont les lignes de $AB$ qui viennent de $B$.'], [true, '$AB$ est la somme des produits colonne $k$ de $A$ par ligne $k$ de $B$.', 'Lecture colonne-ligne.'],
    [false, '$(AB)_{ij}$ est le produit de la ligne $i$ de $A$ par la ligne $j$ de $B$.', 'Par la colonne $j$ de $B$.'], [true, 'Multiplier $A$ à gauche par une matrice agit sur les lignes de $A$.', 'Lignes de $EA$ : combinaisons des lignes de $A$.'],
  ], 'Les quatre lectures du produit (Proposition du chapitre 2).')),
  qcm('c2-regles', 'Matrices', R => fromPool(R, 'Pour des matrices carrées $A,B,C$ de même taille, lesquelles de ces égalités sont toujours vraies ?', [
    [true, '$(AB)C=A(BC)$', 'Associativité.'], [true, '$A(B+C)=AB+AC$', 'Distributivité.'], [false, '$AB=BA$', 'Non commutatif.'], [false, '$(A+B)^2=A^2+2AB+B^2$', 'Il faut $AB=BA$.'],
    [true, '$(A+B)^2=A^2+AB+BA+B^2$', 'Développement sans commuter.'], [false, '$(AB)^2=A^2B^2$', 'C’est $ABAB$.'], [false, '$A^2=0\\Rightarrow A=0$', '$\\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$.'],
    [true, '$(A-B)(A+B)=A^2-B^2$ si $AB=BA$', 'Les termes croisés s’annulent alors.'], [false, '$AB=AC\\Rightarrow B=C$', 'Faux si $A$ n’est pas inversible ($A=0$).'],
  ], 'Le produit matriciel est associatif et distributif, mais ni commutatif ni intègre.')),
  qcm('c2-puissance-T', 'Matrices', R => { const a = R.nonzero(-4, 4), n = R.int(2, 9);
    return single(`Que vaut $${pm([[1, a], [0, 1]])}^{${n}}$ ?`, ok(`$${pm([[1, n * a], [0, 1]])}$`, 'Par récurrence, le coefficient en haut à droite s’ajoute.'),
      [no(`$${pm([[1, a ** n], [0, 1]])}$`, 'Le coefficient ne s’élève pas à la puissance.'), no(`$${pm([[1, a], [0, 1]])}$`, 'La matrice n’est pas idempotente.'), no(`$${pm([[n, n * a], [0, n]])}$`, 'Les 1 de la diagonale restent 1.')],
      `$\\begin{pmatrix}1&a\\\\0&1\\end{pmatrix}\\begin{pmatrix}1&b\\\\0&1\\end{pmatrix}=\\begin{pmatrix}1&a+b\\\\0&1\\end{pmatrix}$.`); }),
  qcm('c2-puissance-diag', 'Matrices', R => { const a = R.int(-3, 3), b = R.int(-3, 3), n = R.int(2, 5);
    return single(`Que vaut $${pm([[a, 0], [0, b]])}^{${n}}$ ?`, ok(`$${pm([[a ** n, 0], [0, b ** n]])}$`, 'Une matrice diagonale s’élève à la puissance coefficient par coefficient.'),
      [no(`$${pm([[n * a, 0], [0, n * b]])}$`, 'C’est $n$ fois la matrice.'), no(`$${pm([[a ** n, (a * b) ** (n - 1)], [0, b ** n]])}$`, 'Les zéros restent nuls.'), no(`$${pm([[a ** n, 0], [0, a ** n]])}$`, 'Chaque coefficient diagonal a sa propre puissance.')],
      'Produit de matrices diagonales : diagonale des produits.'); }),
  qcm('c2-centre', 'Matrices', R => single('Quelles matrices de $\\Mat_n(\\K)$ commutent avec toutes les matrices de $\\Mat_n(\\K)$ ?',
    ok('Les matrices $kI_n$, $k\\in\\K$', 'Commuter avec les $E_{ij}$ force la forme scalaire.'),
    [no('Les matrices diagonales', '$\\mathrm{diag}(1,2)$ ne commute pas avec $\\begin{pmatrix}0&1\\\\0&0\\end{pmatrix}$.'), no('Les matrices inversibles', '$\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$ ne commute pas avec $\\begin{pmatrix}1&0\\\\1&1\\end{pmatrix}$.'), no('Seulement $0$ et $I_n$', '$2I_n$ commute aussi.')],
    'Le centre de $\\Mat_n(\\K)$ est formé des matrices scalaires (exercice du chapitre 2).')),
  // ---------------------------------------------------------------- inverses
  qcm('c2-inverse-2x2', 'Inverses', R => { const A = unimodular(R), [[a, b], [c, d]] = A, D = det2(A), I = [[d * D, -b * D], [-c * D, a * D]];
    return single(`Quel est l’inverse de $A=${pm(A)}$ ?`, ok(`$${pm(I)}$`, `$\\det A=${D}$ et $A^{-1}=\\frac1{\\det A}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$.`),
      [no(`$${pm([[d, -b], [-c, a]].map(r => r.map(x => -D * x)))}$`, 'Signe du déterminant oublié.'), no(`$${pm(tr(A))}$`, 'C’est la transposée.'), no(`$${pm([[d, b], [c, a]])}$`, 'Il faut aussi changer le signe de $b$ et $c$.')],
      'Vérifier toujours $AA^{-1}=I_2$.'); }),
  qcm('c2-inversible-2x2', 'Inverses', R => { const a = R.int(-5, 5), b = R.int(-5, 5), k = R.int(-3, 3), sing = R() < 0.5, A = sing ? [[a, b], [k * a, k * b]] : mat(R, 2, 2, -5, 5), D = det2(A);
    return single(`La matrice $${pm(A)}$ est-elle inversible ?`, ok(D ? `Oui, car $ad-bc=${D}\\neq0$` : 'Non, car $ad-bc=0$', D ? 'Formule de l’inverse $2\\times2$.' : 'Ses lignes sont proportionnelles.'),
      [no(D ? 'Non, car $ad-bc=0$' : `Oui, car $ad-bc\\neq0$`, `$ad-bc=${D}$.`), no(D ? 'Non, car elle a un coefficient négatif ou nul' : 'Oui, car aucune ligne n’est nulle', 'Ce n’est pas le critère.'), no(D ? 'Non, car elle n’est pas symétrique' : 'Oui, car ses deux lignes sont différentes', 'Ce n’est pas le critère.')],
      'Une matrice $2\\times2$ est inversible si et seulement si $ad-bc\\neq0$.'); }),
  qcm('c2-systeme-2x2', 'Inverses', R => { let A; do { A = mat(R, 2, 2, -4, 4); } while (!det2(A)); const x = vec(R, 2, -4, 4), b = A.map(r => dot(r, x));
    return single(`Résoudre $${pm(A)}x=${col(b)}$.`, ok(`$x=${vtex(x)}$`, 'Vérifier en calculant $Ax$.'),
      [no(`$x=${vtex([x[1], x[0]])}$`, 'Composantes échangées.'), no(`$x=${vtex(scal(-1, x))}$`, 'Erreur de signe.'), no('Pas de solution unique', `$\\det A=${det2(A)}\\neq0$.`)],
      '$A$ inversible : solution unique $x=A^{-1}b$.'); }),
  qcm('c2-inverse-produit', 'Inverses', R => fromPool(R, 'Soient $A,B\\in\\GL_n(\\K)$. Lesquelles de ces égalités sont vraies ?', [
    [true, '$(AB)^{-1}=B^{-1}A^{-1}$', 'Vérification directe.'], [false, '$(AB)^{-1}=A^{-1}B^{-1}$', 'L’ordre s’inverse.'], [true, '$(A\\tr)^{-1}=(A^{-1})\\tr$', 'Transposer $AA^{-1}=I$.'],
    [false, '$(A+B)^{-1}=A^{-1}+B^{-1}$', 'Même pas défini en général : $A=I$, $B=-I$.'], [true, '$(A^{-1})^{-1}=A$', 'Unicité de l’inverse.'], [true, '$(kA)^{-1}=\\frac1kA^{-1}$ pour $k\\neq0$', 'Vérification directe.'],
    [false, '$A+B$ est inversible', '$I+(-I)=0$.'], [true, '$AB$ est inversible', 'Produit d’inversibles.'],
  ], 'Le produit d’inversibles est inversible, la somme non ; l’inverse d’un produit renverse l’ordre.')),
  qcm('c2-gauche-droite', 'Inverses', R => fromPool(R, 'Lesquelles de ces affirmations sur les inverses sont vraies ?', [
    [true, 'Pour $A$ carrée, $AB=I$ entraîne $BA=I$', 'Conséquence des caractérisations de l’inversibilité.'], [false, 'Pour $A$ de taille $2\\times3$, $AD=I_2$ entraîne $DA=I_3$', '$DA$ est $3\\times3$ de rang au plus 2.'],
    [true, 'Si $A$ a un inverse à gauche et un à droite, ils sont égaux', '$G=G(AD)=(GA)D=D$.'], [true, '$A$ inversible $\\iff Ax=b$ a une unique solution pour tout $b$', 'Théorème du chapitre.'],
    [false, 'Une matrice avec un coefficient nul n’est pas inversible', '$\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$ est inversible.'], [true, 'Si $Ax=\\mathbf 0$ a une solution non nulle, $A$ n’est pas inversible', 'Sinon $x=A^{-1}\\mathbf 0=\\mathbf 0$.'],
  ], 'Pour les matrices carrées, un inverse d’un côté suffit ; pas pour les rectangulaires.')),
  qcm('c2-inverse-elim', 'Inverses', R => { const i = R.int(2, 3), k = R.int(1, i - 1), l = R.nonzero(-5, 5);
    return single(`Quel est l’inverse de la matrice d’élimination $E_{${i}${k}}(${l})$ (qui retranche $${l}$ fois la ligne ${k} à la ligne ${i}) ?`, ok(`$E_{${i}${k}}(${-l})$`, 'On rajoute ce qu’on a retranché.'),
      [no(`$E_{${k}${i}}(${l})$`, 'Les indices ne s’échangent pas.'), no(`$E_{${i}${k}}(\\frac1{${l}})$`, 'L’inverse ne passe pas par $\\frac1\\ell$.'), no(`$E_{${i}${k}}(${l})\\tr$`, 'La transposée agit sur d’autres lignes.')],
      '$E_{ik}(\\ell)^{-1}=E_{ik}(-\\ell)$ : on change le signe de l’unique coefficient hors diagonale.'); }),
  // ---------------------------------------------------------------- independence
  qcm('c2-lies-2', 'Indépendance', R => { const u = vec(R, 2, -5, 5).map(x => x || 1), k = R.nonzero(-3, 3), v = R() < 0.5 ? scal(k, u) : vec(R, 2, -5, 5), D = det2([u, v]);
    return single(`Les vecteurs $${vtex(u)}$ et $${vtex(v)}$ de $\\R^2$ sont-ils liés ?`, ok(D ? 'Non : ils sont libres' : 'Oui : l’un est multiple de l’autre', `$u_1v_2-u_2v_1=${D}$.`),
      [no(D ? 'Oui : l’un est multiple de l’autre' : 'Non : ils sont libres', 'Tester la proportionnalité.'), no('On ne peut pas savoir sans un troisième vecteur', 'Deux vecteurs suffisent pour la question.'), no(D ? 'Oui : deux vecteurs de $\\R^2$ sont toujours liés' : 'Non : aucun des deux n’est nul', D ? 'Faux : $e_1,e_2$ sont libres.' : 'Ne pas être nul ne suffit pas : ils sont proportionnels.')],
      'Deux vecteurs sont liés si et seulement si l’un est multiple de l’autre, ici $u_1v_2-u_2v_1=0$.'); }),
  qcm('c2-lies-3', 'Indépendance', R => { const u = vec(R, 3, -3, 3), v = vec(R, 3, -3, 3), a = R.nonzero(-2, 2), b = R.nonzero(-2, 2), w = R() < 0.5 ? add(scal(a, u), scal(b, v)) : vec(R, 3, -3, 3), D = det3([u, v, w]);
    return single(`Les vecteurs $${vtex(u)}$, $${vtex(v)}$, $${vtex(w)}$ sont-ils libres ?`, ok(D ? 'Oui' : 'Non', D ? `La matrice de ces vecteurs est inversible (son déterminant vaut ${D}).` : 'La matrice qu’ils forment n’a pas trois pivots.'),
      [no(D ? 'Non' : 'Oui', 'Faire l’élimination sur la matrice de ces vecteurs.'), no(D ? 'Non, car ils ont des composantes de signes différents' : 'Oui, car aucun n’est nul', D ? 'Les signes ne jouent aucun rôle.' : 'Insuffisant : $(1,0,0),(0,1,0),(1,1,0)$.'), no(D ? 'Non, car trois vecteurs sont toujours liés' : 'Oui, car deux à deux non colinéaires', D ? 'Faux dans $\\R^3$ : $e_1,e_2,e_3$.' : 'Insuffisant pour trois vecteurs.')],
      'Libres si et seulement si l’élimination donne trois pivots (la matrice est inversible).'); }),
  qcm('c2-k-lies', 'Indépendance', R => { const a = R.nonzero(-4, 4), b = R.nonzero(-4, 4), m = R.nonzero(-3, 3);
    return single(`Pour quelle valeur de $k$ les vecteurs $(${a},${b})$ et $(${m * a},k)$ sont-ils liés ?`, ok(`$k=${m * b}$`, `Il faut $(${m * a},k)=${m}(${a},${b})$.`),
      [no(`$k=${b}$`, 'La première composante a été multipliée par ' + m + '.'), no(`$k=${-m * b}$`, 'Erreur de signe.'), no('pour aucune valeur', 'Une valeur convient.')],
      'Deux vecteurs non nuls sont liés si et seulement s’ils sont proportionnels : $a\\,k-b\\,(ma)=0$.'); }),
  qcm('c2-familles', 'Indépendance', R => fromPool(R, 'Lesquelles de ces affirmations sur les familles de vecteurs sont vraies ?', [
    [true, 'Une famille contenant $\\mathbf 0$ est liée', '$1\\cdot\\mathbf 0=\\mathbf 0$.'], [true, 'Les colonnes de $A$ sont libres si et seulement si $Ax=\\mathbf 0$ n’a que $x=\\mathbf 0$', 'Définition.'],
    [false, 'Trois vecteurs deux à deux non colinéaires sont libres', '$(1,0),(0,1),(1,1)$.'], [true, 'Une sous-famille d’une famille libre est libre', 'Une relation dans la sous-famille en est une dans la famille.'],
    [false, 'Une sur-famille d’une famille libre est libre', 'Ajouter $\\mathbf 0$.'], [true, '$n+1$ vecteurs de $\\R^n$ sont liés', 'Plus d’inconnues que d’équations.'],
  ], 'Libre : la seule combinaison nulle est la combinaison triviale.')),
  // ---------------------------------------------------------------- transposition and permutations
  qcm('c2-transposee', 'Transposition', R => { const A = mat(R, 2, 3);
    return single(`Quelle est la transposée de $A=${pm(A)}$ ?`, ok(`$${pm(tr(A))}$`, 'Les lignes de $A$ deviennent les colonnes.'),
      [no(`$${pm(tr(A).map(r => r.slice().reverse()))}$`, 'Les colonnes sont dans le mauvais ordre.'), no(`$${pm(tr(A).slice().reverse())}$`, 'Les lignes sont dans le mauvais ordre.'), no(`$${pm(A.map(r => r.slice().reverse()))}$`, 'Ce n’est pas une transposée : la taille ne change pas.')],
      '$(A\\tr)_{ij}=a_{ji}$ ; une $2\\times3$ devient une $3\\times2$.'); }),
  qcm('c2-transposee-props', 'Transposition', R => fromPool(R, 'Lesquelles de ces égalités sont vraies (tailles compatibles) ?', [
    [true, '$(AB)\\tr=B\\tr A\\tr$', 'L’ordre s’inverse.'], [false, '$(AB)\\tr=A\\tr B\\tr$', 'Pas même défini en général.'], [true, '$(A\\tr)\\tr=A$', 'Évident.'],
    [true, '$A\\tr A$ est symétrique', '$(A\\tr A)\\tr=A\\tr A$.'], [true, 'Dans $\\R^n$, $(Ax)\\cdot y=x\\cdot(A\\tr y)$', '$(Ax)\\tr y=x\\tr A\\tr y$.'], [false, '$AA\\tr=A\\tr A$', 'Faux en général, même pour $A$ carrée.'],
    [true, '$A+A\\tr$ est symétrique pour $A$ carrée', 'Sa transposée est $A\\tr+A$.'], [false, 'Le produit de deux matrices symétriques est symétrique', '$(SS\')\\tr=S\'S$, différent en général.'],
  ], 'Transposition : $(AB)\\tr=B\\tr A\\tr$.')),
  qcm('c2-symetrique', 'Transposition', R => { const a = R.int(-4, 4), b = R.nonzero(-4, 4), c = R.int(-4, 4), kind = R.pick(['sym', 'anti', 'none']);
    const A = kind === 'sym' ? [[a, b], [b, c]] : kind === 'anti' ? [[0, b], [-b, 0]] : [[a, b], [b + R.nonzero(1, 3), c]], v = { sym: 'symétrique', anti: 'antisymétrique', none: 'ni symétrique ni antisymétrique' }[kind];
    return single(`La matrice $${pm(A)}$ est :`, ok(v, 'Comparer $A\\tr$ avec $A$ et $-A$.'), ['symétrique', 'antisymétrique', 'ni symétrique ni antisymétrique', 'triangulaire'].filter(x => x !== v).map(x => no(x, 'Comparer $A\\tr$ avec $A$ et $-A$.')),
      'Symétrique : $A\\tr=A$ ; antisymétrique : $A\\tr=-A$ (la diagonale est alors nulle).'); }),
  qcm('c2-PA', 'Permutations', R => { const A = mat(R, 3, 3, -4, 4), i = R.int(1, 3), j = R.pick([1, 2, 3].filter(x => x !== i)), S = A.map(r => r.slice()); [S[i - 1], S[j - 1]] = [S[j - 1], S[i - 1]];
    const C = A.map(r => r.slice()); C.forEach(r => { [r[i - 1], r[j - 1]] = [r[j - 1], r[i - 1]]; });
    return single(`Que vaut $P_{${Math.min(i, j)}${Math.max(i, j)}}A$ pour $A=${pm(A)}$ ?`, ok(`$${pm(S)}$`, `Les lignes ${i} et ${j} sont échangées.`),
      [no(`$${pm(C)}$`, 'C’est $AP$ : on a échangé des colonnes.'), no(`$${pm(tr(A))}$`, 'C’est la transposée.'), no(`$${pm(A)}$`, 'La multiplication change la matrice.')],
      'Multiplier à gauche par $P_{ij}$ échange les lignes $i$ et $j$ ; à droite, les colonnes.'); }),
  qcm('c2-nb-perm', 'Permutations', R => { const n = R.int(2, 6);
    return single(`Combien y a-t-il de matrices de permutation d’ordre $${n}$ ?`, ok(Q.fact(n), `Une par permutation de $\\ens{1,\\dots,${n}}$.`),
      [no(n * n, 'Ce n’est pas le nombre de cases.'), no(2 ** n, 'Ce n’est pas le nombre de parties.'), no(n, 'Il y en a bien plus.')].filter(c => c[1] !== String(Q.fact(n))),
      'Un seul 1 par ligne et par colonne : $n!$ matrices.'); }),
  qcm('c2-perm-props', 'Permutations', R => fromPool(R, 'Soit $P$ une matrice de permutation. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$P^{-1}=P\\tr$', 'Colonnes orthonormées.'], [true, 'Le produit de deux matrices de permutation en est une', 'Composée de permutations.'], [false, '$P^2=I$', 'Faux pour un 3-cycle.'],
    [true, '$\\det P=\\pm1$', 'Produit de $P_{ij}$, chacune de déterminant $-1$.'], [false, '$P$ est symétrique', 'Faux pour la matrice d’un 3-cycle.'], [true, '$PA$ a les lignes de $A$ dans un autre ordre', 'Permutation des lignes.'],
  ], 'Matrices de permutation : un 1 par ligne et par colonne.')),
  // ---------------------------------------------------------------- elimination
  qcm('c2-multiplicateur', 'Élimination', R => { const a = R.nonzero(-4, 4), m = R.nonzero(-3, 3), A = [[a, R.int(-4, 4)], [m * a, R.int(-4, 4)]];
    return single(`Dans l’élimination de $${pm(A)}$, quel est le multiplicateur $\\ell_{21}$ ?`, ok(m, `$\\ell_{21}=\\frac{a_{21}}{a_{11}}=\\frac{${m * a}}{${a}}$.`),
      [no(-m, 'Le signe est dans $E_{21}$, pas dans $\\ell_{21}$.'), no(`$\\frac{${a}}{${m * a}}$`, 'Fraction renversée.'), no(m * a, 'Il faut diviser par le pivot.')],
      'On retranche $\\ell_{21}$ fois la ligne 1 à la ligne 2.'); }),
  qcm('c2-LU-2x2', 'Élimination', R => { const a = R.nonzero(-3, 3), b = R.int(-4, 4), m = R.nonzero(-3, 3), d = R.int(-4, 4) + m * b, A = [[a, b], [m * a, d]];
    return single(`L’élimination donne $A=LU$ pour $A=${pm(A)}$. Quelle est $L$ ?`, ok(`$${pm([[1, 0], [m, 1]])}$`, `$\\ell_{21}=${m}$ ; $U=${pm([[a, b], [0, d - m * b]])}$.`),
      [no(`$${pm([[1, 0], [-m, 1]])}$`, 'C’est $E_{21}=L^{-1}$.'), no(`$${pm([[1, m], [0, 1]])}$`, '$L$ est triangulaire inférieure.'), no(`$${pm([[a, 0], [m * a, 1]])}$`, '$L$ a des 1 sur la diagonale.')],
      '$L$ contient les multiplicateurs avec leur signe.'); }),
  qcm('c2-U-2x2', 'Élimination', R => { const a = R.nonzero(-3, 3), b = R.int(-4, 4), m = R.nonzero(-3, 3), d = R.int(-6, 6), A = [[a, b], [m * a, d]];
    return single(`Quelle est la matrice $U$ obtenue par élimination de $A=${pm(A)}$ ?`, ok(`$${pm([[a, b], [0, d - m * b]])}$`, `Ligne 2 moins $${m}$ fois la ligne 1.`),
      [no(`$${pm([[a, b], [0, d + m * b]])}$`, 'On a ajouté au lieu de retrancher.'), no(`$${pm([[a, b], [0, d]])}$`, 'Seul le premier coefficient de la ligne 2 a été annulé.'), no(`$${pm([[1, 0], [m, 1]])}$`, 'C’est $L$.')],
      '$U$ est triangulaire supérieure ; ses coefficients diagonaux sont les pivots.'); }),
  qcm('c2-E21', 'Élimination', R => { const a = R.nonzero(-3, 3), m = R.nonzero(-3, 3), A = [[a, R.int(-3, 3)], [m * a, R.int(-3, 3)]];
    return single(`Quelle matrice $E_{21}$ annule le coefficient $(2,1)$ de $A=${pm(A)}$ dans $E_{21}A$ ?`, ok(`$${pm([[1, 0], [-m, 1]])}$`, `Elle retranche $${m}$ fois la ligne 1.`),
      [no(`$${pm([[1, 0], [m, 1]])}$`, 'C’est $L$, l’inverse.'), no(`$${pm([[1, -m], [0, 1]])}$`, 'Elle agirait sur la ligne 1.'), no(`$${pm([[0, 1], [1, 0]])}$`, 'C’est un échange de lignes.')],
      '$E_{21}(\\ell)$ : la matrice identité avec $-\\ell$ en position $(2,1)$.'); }),
  qcm('c2-pivots-3x3', 'Élimination', R => { let A, r; do { A = mat(R, 3, 3, -3, 3); r = eliminate(A); } while (r.swaps || r.rank < 3 || r.U.some((row, i) => row[i].q > 4));
    const p3 = r.U[2][2];
    return single(`L’élimination (sans échange) de $A=${pm(A)}$ donne trois pivots. Quel est le troisième ?`, ok(`$${p3.tex()}$`, `$U=${pm(r.U)}$.`),
      [no(`$${p3.neg().tex()}$`, 'Erreur de signe.'), no(`$${A[2][2]}$`, 'C’est le coefficient initial, avant élimination.'), no(`$${r.det.tex()}$`, 'C’est le produit des pivots, $\\det A$.')],
      'Les pivots sont les coefficients diagonaux de $U$ ; leur produit est $\\det A$ (au signe des échanges près).'); }),
  qcm('c2-echange', 'Élimination', R => fromPool(R, 'Lesquelles de ces affirmations sur l’élimination sont vraies ?', [
    [true, 'On n’échange deux lignes que si le pivot est nul', 'Règle du cours.'], [true, 'Si toute la colonne sous un pivot nul est nulle, on passe à la colonne suivante', 'La matrice n’est alors pas inversible.'],
    [true, 'Pour toute $A$, il existe $P$, $L$, $U$ avec $PA=LU$', 'Théorème du cours.'], [false, '$L$ a sur sa diagonale les pivots', 'Des 1 ; les pivots sont dans $U$.'],
    [false, 'L’élimination ne change pas l’espace colonne', 'Elle change $C(A)$ en général ; elle conserve l’espace ligne.'], [true, '$A$ est inversible si et seulement si l’élimination produit $n$ pivots', 'Caractérisation.'],
  ], 'Élimination de Gauss et factorisation $PA=LU$.')),
  qcm('c2-remontee', 'Élimination', R => { const U = [[R.nonzero(-3, 3), R.int(-3, 3), R.int(-3, 3)], [0, R.nonzero(-3, 3), R.int(-3, 3)], [0, 0, R.nonzero(-3, 3)]], x = vec(R, 3, -3, 3), b = U.map(r => dot(r, x));
    return single(`Résoudre $Ux=b$ avec $U=${pm(U)}$ et $b=${col(b)}$.`, ok(`$x=${vtex(x)}$`, 'Remontée : $x_3$, puis $x_2$, puis $x_1$.'),
      [no(`$x=${vtex(x.slice().reverse())}$`, 'Ordre des inconnues inversé.'), no(`$x=${vtex([x[0], x[1], -x[2]])}$`, 'Erreur de signe sur $x_3$.'), no(`$x=${vtex(b)}$`, 'C’est $b$.')],
      'Un système triangulaire supérieur se résout par remontée.'); }),
  qcm('c2-LU-solve', 'Élimination', R => fromPool(R, 'Pour résoudre $Ax=b$ quand $PA=LU$, lesquelles de ces étapes sont correctes ?', [
    [true, 'Résoudre $Lc=Pb$ par descente', 'Premier système triangulaire.'], [true, 'Puis $Ux=c$ par remontée', 'Second système.'], [false, 'Résoudre $Ux=b$ directement', 'Il faut d’abord transformer $b$.'],
    [false, 'Calculer $A^{-1}$ d’abord', 'Inutile et plus coûteux.'], [true, 'La factorisation sert pour tous les seconds membres $b$', 'On la calcule une fois.'],
  ], 'Deux systèmes triangulaires remplacent un système plein.')),
  qcm('c2-nb-solutions', 'Élimination', R => { const kind = R.pick(['none', 'one', 'inf']), a = R.nonzero(-3, 3), c = R.int(-3, 3);
    const U = kind === 'one' ? [[a, c], [0, R.nonzero(-3, 3)]] : [[a, c], [0, 0]], rhs = kind === 'none' ? R.nonzero(-3, 3) : 0;
    const v = { none: 'aucune solution', one: 'une solution unique', inf: 'une infinité de solutions' }[kind];
    return single(`Après élimination, un système devient $${pm(U)}x=${col([R.int(-3, 3), rhs])}$. Il a :`, ok(v, kind === 'none' ? `La dernière équation s’écrit $0=${rhs}$.` : kind === 'inf' ? 'La dernière équation est $0=0$ : une inconnue libre.' : 'Deux pivots.'),
      ['aucune solution', 'une solution unique', 'une infinité de solutions', 'exactement deux solutions'].filter(x => x !== v).map(x => no(x, 'Lire la dernière ligne et compter les pivots.')),
      'Sur $\\R$, un système linéaire a zéro, une ou une infinité de solutions, jamais exactement deux.'); }),
  qcm('c2-gauss-jordan', 'Élimination', R => fromPool(R, 'Pour calculer $A^{-1}$ par Gauss, Jordan sur $(A\\mid I_n)$, lesquelles de ces affirmations sont vraies ?', [
    [true, 'On résout simultanément les $n$ systèmes $Ax=e_j$', 'Une colonne par vecteur de base.'], [true, 'On arrive à $(I_n\\mid A^{-1})$ si $A$ est inversible', 'Fin de l’algorithme.'],
    [false, 'On peut faire des opérations sur les colonnes', 'Seulement sur les lignes, appliquées aux deux blocs.'], [true, 'Un pivot nul impossible à remplacer prouve que $A$ n’est pas inversible', 'Moins de $n$ pivots.'],
    [false, 'On obtient $(A^{-1}\\mid I_n)$', 'Le bloc de gauche devient $I_n$.'],
  ], 'Méthode de Gauss, Jordan.')),
  qcm('c2-singuliere', 'Inverses', R => fromPool(R, 'Soit $A\\in\\Mat_n(\\R)$ telle que $Ax=b$ a deux solutions distinctes $x\\neq y$. Lesquelles de ces conclusions sont justes ?', [
    [true, '$A$ n’est pas inversible', 'Solution unique sinon.'], [true, '$y-x$ est une solution non nulle de $Ax=\\mathbf 0$', 'Différence de deux solutions.'], [true, 'Il y a une infinité de solutions', '$x+t(y-x)$.'],
    [false, '$b=\\mathbf 0$', 'Pas nécessairement.'], [false, 'Les colonnes de $A$ sont libres', '$A(y-x)=\\mathbf 0$ est une relation de dépendance.'], [false, 'Il y a exactement deux solutions', 'Toute la droite $x+t(y-x)$.'],
  ], 'Proposition : deux solutions distinctes en donnent une infinité.')),
  qcm('c2-blocs', 'Matrices', R => single('Avec des blocs compatibles, que vaut $\\begin{pmatrix}A_1&A_2\\end{pmatrix}\\begin{pmatrix}B_1\\\\B_2\\end{pmatrix}$ ?',
    ok('$A_1B_1+A_2B_2$', 'On multiplie les blocs comme des nombres, dans l’ordre.'),
    [no('$B_1A_1+B_2A_2$', 'L’ordre des facteurs compte.'), no('$\\begin{pmatrix}A_1B_1&A_2B_2\\end{pmatrix}$', 'Le résultat est un seul bloc.'), no('$A_1B_2+A_2B_1$', 'Les blocs se multiplient position par position.')],
    'Produit par blocs : les colonnes de $A$ découpées comme les lignes de $B$.')),
  qcm('c2-differences', 'Matrices', R => { const x = vec(R, 3, -5, 5);
    return single(`Avec $A=${pm([[1, 0, 0], [-1, 1, 0], [0, -1, 1]])}$, que vaut $Ax$ pour $x=${col(x)}$ ?`, ok(`$${col([x[0], x[1] - x[0], x[2] - x[1]])}$`, 'Les différences successives.'),
      [no(`$${col([x[0], x[0] + x[1], x[0] + x[1] + x[2]])}$`, 'Ce sont les sommes partielles, $A^{-1}x$.'), no(`$${col([x[0] - x[1], x[1] - x[2], x[2]])}$`, 'Différences dans l’autre sens.'), no(`$${col(x)}$`, '$A$ n’est pas l’identité.')],
      'Matrice des différences ; son inverse est la matrice des sommes (exemple du cours).'); }),
  qcm('c2-rang1', 'Matrices', R => { const u = vec(R, 3, -3, 3).map(x => x || 1), v = vec(R, 3, -3, 3).map(x => x || 2), M = u.map(a => v.map(b => a * b));
    return single(`La matrice $${pm(M)}$ s’écrit $uv\\tr$. Que peut-on dire de ses colonnes ?`, ok('Elles sont toutes proportionnelles à un même vecteur', `Toutes multiples de $${vtex(u)}$.`),
      [no('Elles sont libres', 'Trois colonnes proportionnelles sont liées.'), no('Elles sont orthogonales deux à deux', 'Rien ne l’impose.'), no('L’une d’elles est nulle', 'Aucune n’est nulle ici.')],
      'Colonne $j$ de $uv\\tr$ : $v_ju$. Une telle matrice (non nulle) est de rang 1.'); }),
  qcm('c2-inversibles', 'Matrices', R => fromPool(R, 'Lesquelles de ces matrices $2\\times2$ sont inversibles ?', [
    [true, '$\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$', 'C’est $P_{12}$, son propre inverse.'], [false, '$\\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$', 'Lignes proportionnelles.'], [true, '$\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$', 'Inverse $\\begin{pmatrix}1&-1\\\\0&1\\end{pmatrix}$.'],
    [false, '$\\begin{pmatrix}0&0\\\\0&1\\end{pmatrix}$', 'Une ligne nulle.'], [true, '$\\begin{pmatrix}2&0\\\\0&3\\end{pmatrix}$', 'Inverse $\\mathrm{diag}(\\frac12,\\frac13)$.'], [false, '$\\begin{pmatrix}1&-1\\\\-1&1\\end{pmatrix}$', '$ad-bc=0$.'],
    [true, '$\\begin{pmatrix}\\cos t&-\\sin t\\\\\\sin t&\\cos t\\end{pmatrix}$', 'Rotation, de déterminant 1.'],
  ], '$2\\times2$ : inversible si et seulement si $ad-bc\\neq0$.')),
  qcm('c2-pythagore', 'Vecteurs', R => { const a = R.int(1, 8), b = R.int(1, 8);
    return single(`$u\\perp v$, $\\norm u=${a}$ et $\\norm v=${b}$. Que vaut $\\norm{u-v}^2$ ?`, ok(a * a + b * b, 'Pythagore.'),
      [no((a - b) ** 2, 'C’est le cas de vecteurs colinéaires de même sens.'), no(a * a - b * b, 'Le terme croisé est nul, pas soustrait.'), no((a + b) ** 2, 'C’est le cas colinéaire de sens opposés.')],
      '$\\norm{u-v}^2=\\norm u^2-2u\\cdot v+\\norm v^2$, avec $u\\cdot v=0$.'); }),
  qcm('c2-combinaison', 'Vecteurs', R => { const u = vec(R, 2, -4, 4), v = vec(R, 2, -4, 4); if (!det2([u, v])) { u[0] = 1; v[0] = 0; u[1] = 0; v[1] = 1; } const a = R.int(-3, 3), b = R.int(-3, 3), w = add(scal(a, u), scal(b, v));
    return single(`Trouver $a,b$ tels que $a${vtex(u)}+b${vtex(v)}=${vtex(w)}$.`, ok(`$a=${a}$, $b=${b}$`, 'Vérifier composante par composante.'),
      [no(`$a=${b}$, $b=${a}$`, 'Coefficients échangés.'), no(`$a=${-a}$, $b=${-b}$`, 'Signes échangés.'), no('Pas de solution', 'Les deux vecteurs sont libres : une solution unique.')],
      'Résoudre le système $2\\times2$ dont les colonnes sont $u$ et $v$.'); }),
  qcm('c2-Pij-carre', 'Permutations', R => single('Que vaut $P_{ij}^2$ ?', ok('$I_n$', 'Échanger deux fois les mêmes lignes ne change rien.'),
    [no('$P_{ij}$', 'Ce n’est pas un projecteur.'), no('$-I_n$', 'Les coefficients restent 0 ou 1.'), no('$P_{ji}$ différent de $P_{ij}$', '$P_{ji}=P_{ij}$.')],
    '$P_{ij}$ est sa propre inverse : $P_{ij}^{-1}=P_{ij}=P_{ij}\\tr$.')),
  qcm('c2-triangulaires', 'Élimination', R => fromPool(R, 'Lesquelles de ces affirmations sur les matrices triangulaires sont vraies ?', [
    [true, 'Le produit de deux triangulaires inférieures est triangulaire inférieure', 'Ce qui rend $L$ triangulaire.'], [true, 'L’inverse d’une triangulaire inférieure inversible est triangulaire inférieure', 'Descente.'],
    [true, 'Une triangulaire est inversible si et seulement si ses coefficients diagonaux sont non nuls', 'Les pivots sont sur la diagonale.'], [false, 'La somme d’une triangulaire supérieure et d’une inférieure est triangulaire', 'Elle est quelconque.'],
    [false, 'La transposée d’une triangulaire inférieure est triangulaire inférieure', 'Elle est supérieure.'],
  ], 'Les triangulaires inférieures à diagonale de 1 forment un groupe : c’est pour cela que $L$ en est une.')),
];

// ---------------------------------------------------------------- quizzes
ITEMS.push(
  quiz('c2q-dot', 'Vecteurs', R => { const u = vec(R, 4, -6, 6), v = vec(R, 4, -6, 6); return { stem: `Calculer $u\\cdot v$ pour $u=${vtex(u)}$ et $v=${vtex(v)}$.`, type: 'int', answer: dot(u, v), expl: 'Somme des produits des composantes.' }; }),
  quiz('c2q-norm2', 'Vecteurs', R => { const u = vec(R, 3, -7, 7); return { stem: `Calculer $\\norm u^2$ pour $u=${vtex(u)}$.`, type: 'int', answer: dot(u, u), expl: '$\\norm u^2=u\\cdot u$.' }; }),
  quiz('c2q-norm', 'Vecteurs', R => { const [a, b, c, n] = R.pick(NORMS); return { stem: `Calculer $\\norm u$ pour $u=${vtex(R.shuffle(signed(R, [a, b, c])))}$.`, type: 'int', answer: n, expl: '$\\sqrt{u\\cdot u}$.' }; }),
  quiz('c2q-comb', 'Vecteurs', R => { const u = vec(R), v = vec(R), k = R.nonzero(-4, 4), l = R.nonzero(-4, 4); return { stem: `Avec $u=${vtex(u)}$ et $v=${vtex(v)}$, calculer $${Q.term(k, 'u', true)}${Q.term(l, 'v')}$.`, type: 'tuple', answer: add(scal(k, u), scal(l, v)), expl: 'Composante par composante.' }; }),
  quiz('c2q-orth', 'Vecteurs', R => { const u = [R.nonzero(-5, 5), R.nonzero(-5, 5), R.nonzero(-4, 4)], a = R.int(-5, 5), b = R.int(-5, 5);
    return { stem: `Trouver $k$ tel que $${vtex(u)}$ et $(${a},${b},k)$ soient orthogonaux.`, type: 'rat', answer: new Frac(-(u[0] * a + u[1] * b), u[2]), expl: 'Résoudre $u\\cdot v=0$.' }; }),
  quiz('c2q-coef', 'Matrices', R => { const A = mat(R, 3, 3), B = mat(R, 3, 3), i = R.int(1, 3), j = R.int(1, 3);
    return { stem: `Avec $A=${pm(A)}$ et $B=${pm(B)}$, calculer le coefficient $(${i},${j})$ de $AB$.`, type: 'int', answer: mul(A, B)[i - 1][j - 1], expl: 'Ligne $i$ de $A$ fois colonne $j$ de $B$.' }; }),
  quiz('c2q-prod', 'Matrices', R => { const A = mat(R, 2, 2, -4, 4), B = mat(R, 2, 2, -4, 4); return { stem: `Calculer $AB$ pour $A=${pm(A)}$ et $B=${pm(B)}$.`, type: 'matrix', answer: mul(A, B), expl: 'Lignes de $A$ par colonnes de $B$.' }; }),
  quiz('c2q-Ax', 'Matrices', R => { const A = mat(R, 3, 3), x = vec(R, 3, -4, 4); return { stem: `Calculer $Ax$ pour $A=${pm(A)}$ et $x=${col(x)}$ ; donner les composantes.`, type: 'tuple', answer: A.map(r => dot(r, x)), expl: 'Combinaison des colonnes de $A$ de coefficients $x_1,x_2,x_3$.' }; }),
  quiz('c2q-det2', 'Inverses', R => { const A = mat(R, 2, 2, -9, 9); return { stem: `Calculer $ad-bc$ pour $${pm(A)}$.`, type: 'int', answer: det2(A), expl: 'Produit de la diagonale moins produit de l’autre diagonale.' }; }),
  quiz('c2q-inverse', 'Inverses', R => { let A; do { A = mat(R, 2, 2, -5, 5); } while (!det2(A)); return { stem: `Calculer l’inverse de $${pm(A)}$.`, type: 'matrix', answer: inv2(A), expl: '$\\frac1{ad-bc}\\begin{pmatrix}d&-b\\\\-c&a\\end{pmatrix}$ ; vérifier $AA^{-1}=I_2$.' }; }),
  quiz('c2q-systeme', 'Inverses', R => { let A; do { A = mat(R, 2, 2, -5, 5); } while (!det2(A)); const x = vec(R, 2, -6, 6), b = A.map(r => dot(r, x));
    return { stem: `Résoudre $${pm(A)}x=${col(b)}$ ; donner $x=(x_1,x_2)$.`, type: 'tuple', answer: x, expl: 'Élimination ou $x=A^{-1}b$.' }; }),
  quiz('c2q-ell', 'Élimination', R => { const a = R.nonzero(-6, 6), c = R.int(-9, 9); return { stem: `Dans l’élimination de $${pm([[a, R.int(-5, 5)], [c, R.int(-5, 5)]])}$, donner le multiplicateur $\\ell_{21}$.`, type: 'rat', answer: new Frac(c, a), expl: '$\\ell_{21}=\\frac{a_{21}}{a_{11}}$.' }; }),
  quiz('c2q-U', 'Élimination', R => { const a = R.nonzero(-3, 3), b = R.int(-4, 4), m = R.nonzero(-3, 3), d = R.int(-6, 6);
    return { stem: `Donner la matrice $U$ de l’élimination de $${pm([[a, b], [m * a, d]])}$.`, type: 'matrix', answer: [[a, b], [0, d - m * b]], expl: 'Retrancher $\\ell_{21}$ fois la ligne 1 à la ligne 2.' }; }),
  quiz('c2q-transposee', 'Transposition', R => { const A = mat(R, 2, 3); return { stem: `Donner la transposée de $${pm(A)}$.`, type: 'matrix', answer: tr(A), expl: 'Les lignes deviennent les colonnes : une matrice $3\\times2$.' }; }),
  quiz('c2q-puissance', 'Matrices', R => { const a = R.nonzero(-5, 5), n = R.int(2, 12); return { stem: `Calculer $${pm([[1, a], [0, 1]])}^{${n}}$.`, type: 'matrix', answer: [[1, n * a], [0, 1]], expl: 'Les coefficients en haut à droite s’ajoutent.' }; }),
  quiz('c2q-pivot3', 'Élimination', R => { let A, r; do { A = mat(R, 3, 3, -3, 3); r = eliminate(A); } while (r.swaps || r.rank < 3);
    return { stem: `Effectuer l’élimination sans échange de $A=${pm(A)}$ et donner le troisième pivot.`, type: 'rat', answer: r.U[2][2], expl: `$U=${pm(r.U)}$.` }; }),
);
