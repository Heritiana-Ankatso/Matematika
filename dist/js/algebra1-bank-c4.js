// Algèbre 1, chapter 4 (laws, groups, subgroups, order, cyclic groups, homomorphisms, Lagrange, normal subgroups,
// quotients, S_n, D_n, matrix groups): QCM and quiz generators for the bank.
import * as Q from './algebra1-qbank.js';
import { sign, permOrder, cycleText, dihedralMul, dihedralName } from './algebra1-model.js';
const { qcm, quiz, right: ok, wrong: no, single, fromPool, gcd, lcm, mod, parseCycles: P, compose, inverse } = Q;

const randPerm = (R, n) => R.shuffle([...Array(n).keys()]);
const nonId = (R, n) => { let p; do { p = randPerm(R, n); } while (p.every((y, i) => y === i)); return p; };
const two = p => `\\begin{pmatrix}${p.map((_, i) => i + 1).join('&')}\\\\${p.map(y => y + 1).join('&')}\\end{pmatrix}`;
const cy = p => cycleText(p).replace(/ /g, '\\,').replace(/^id$/, '\\id');
const ordZ = (k, n) => n / gcd(k, n);
const tau = n => Q.divisors(n).length;

export const ITEMS = [
  // ---------------------------------------------------------------- laws and groups
  qcm('c4-groupes', 'Lois', R => fromPool(R, 'Lesquelles de ces structures sont des groupes ?', [
    [false, '$(\\Z,-)$', 'Pas associative, pas de neutre.'], [false, '$(\\N,+)$', 'Pas d’opposé pour $1$.'], [true, '$(\\Q^*,\\times)$', 'Groupe abélien.'], [false, '$(2\\Z+1,+)$', 'Pas stable : $1+1=2$.'],
    [true, '$(\\ens{1,-1,i,-i},\\times)$', 'Racines quatrièmes de l’unité.'], [false, '$(\\Z/6\\Z\\setminus\\ens{\\cl0},\\times)$', '$\\cl2\\cdot\\cl3=\\cl0$.'], [true, '$(\\Z/7\\Z\\setminus\\ens{\\cl0},\\times)$', '$7$ premier.'],
    [true, '$(\\R,\\star)$ avec $x\\star y=x+y-3$', 'Neutre $3$, symétrique $6-x$.'], [false, '$(\\Mat_2(\\R),\\times)$', 'Les matrices singulières n’ont pas d’inverse.'], [true, '$(\\GL_2(\\R),\\times)$', 'Groupe non abélien.'],
    [false, '$(\\Z,\\max)$', 'Pas de neutre.'], [true, '$(\\parties(E),\\mathbin\\Delta)$', 'Neutre $\\varnothing$, chaque partie est son propre symétrique.'], [false, '$(\\parties(E),\\cup)$', 'Monoïde : pas de symétrique pour $E\\neq\\varnothing$.'],
  ], 'Groupe : loi interne associative, neutre, symétriques. Nommer l’axiome qui échoue.')),
  qcm('c4-neutre-affine', 'Lois', R => { const c = R.nonzero(-6, 6);
    return single(`Sur $\\R$, on pose $x\\star y=x+y${c > 0 ? '+' : '-'}${Math.abs(c)}$. Quel est l’élément neutre ?`, ok(`$${-c}$`, `$x\\star(${-c})=x$.`),
      [no(`$${c}$`, 'Erreur de signe.'), no('$0$', `$x\\star0=x${c > 0 ? '+' : '-'}${Math.abs(c)}\\neq x$.`), no('il n’y en a pas', 'Résoudre $x\\star e=x$.')],
      'C’est l’addition transportée par $x\\mapsto x+c$ : un groupe isomorphe à $(\\R,+)$.'); }),
  qcm('c4-symetrique-affine', 'Lois', R => { const c = R.nonzero(-6, 6), x = R.int(-9, 9);
    return single(`Sur $\\R$, avec $a\\star b=a+b${c > 0 ? '+' : '-'}${Math.abs(c)}$, quel est le symétrique de $${x}$ ?`, ok(`$${-x - 2 * c}$`, `Il faut $${x}\\star y=${-c}$ (le neutre).`),
      [no(`$${-x}$`, 'C’est l’opposé pour l’addition usuelle.'), no(`$${-x - c}$`, 'Il faut atteindre le neutre $-c$, pas $0$.'), no(`$${-x + 2 * c}$`, 'Erreur de signe.')],
      'Symétrique de $x$ : $-x-2c$ ; vérifier $x\\star(-x-2c)=-c$.'); }),
  qcm('c4-loi-xy', 'Lois', R => { const a = R.pick([1, 2, 3, 4, -2, -3, -5]);
    return single(`Sur $\\R\\setminus\\ens{-1}$, avec $x\\star y=xy+x+y$, quel est le symétrique de $${a}$ ?`, ok(`$${Q.frac(-a, 1 + a).tex()}$`, `$(1+x)(1+y)=1$ donne $y=\\frac{-x}{1+x}$.`),
      [no(`$${-a}$`, 'C’est l’opposé.'), no(`$${Q.frac(1, a).tex()}$`, 'C’est l’inverse pour $\\times$.'), no(`$${Q.frac(1, 1 + a).tex()}$`, 'C’est $1+y$, pas $y$.')],
      '$x\\star y=(1+x)(1+y)-1$ : c’est $(\\R^*,\\times)$ transporté par $x\\mapsto x+1$ ; le neutre est $0$.'); }),
  qcm('c4-table', 'Lois', R => fromPool(R, 'Lesquelles de ces affirmations sur la table de Cayley d’une loi finie sont vraies ?', [
    [true, 'Dans un groupe, chaque élément apparaît une fois par ligne et par colonne', 'Carré latin.'], [false, 'Un carré latin avec neutre est toujours une table de groupe', 'L’associativité peut manquer.'],
    [true, 'La loi est commutative si et seulement si la table est symétrique', 'Par rapport à la diagonale.'], [true, 'L’associativité ne se lit pas d’un coup d’œil', 'Il faut $n^3$ vérifications.'],
    [true, 'Le neutre se reconnaît à une ligne qui reproduit l’en-tête', 'Et la colonne correspondante.'], [false, 'Si la diagonale ne contient que le neutre, la loi est commutative', 'Vrai dans un groupe (exercice), faux pour une loi quelconque.'],
  ], 'Lire une table de Cayley.')),
  qcm('c4-inverses', 'Lois', R => fromPool(R, 'Dans un groupe $G$, lesquelles de ces égalités sont toujours vraies ?', [
    [true, '$(xy)^{-1}=y^{-1}x^{-1}$', 'L’ordre s’inverse.'], [false, '$(xy)^{-1}=x^{-1}y^{-1}$', 'Seulement si $x,y$ commutent.'], [true, '$(x^{-1})^{-1}=x$', 'Unicité du symétrique.'],
    [false, '$(xy)^2=x^2y^2$', 'Équivaut à $yx=xy$.'], [true, '$xy=xz\\Rightarrow y=z$', 'Simplifier à gauche.'], [false, '$xy=zx\\Rightarrow y=z$', 'Faux dans $S_3$.'], [true, '$x^mx^n=x^{m+n}$', 'Pour tous $m,n\\in\\Z$.'],
  ], 'Calcul dans un groupe : on simplifie du même côté.')),
  // ---------------------------------------------------------------- subgroups, order, cyclic groups
  qcm('c4-sous-groupes', 'Sous-groupes', R => fromPool(R, 'Lesquelles de ces parties sont des sous-groupes du groupe indiqué ?', [
    [true, '$\\ens{z\\mid z^{12}=1}$ dans $(\\C^*,\\times)$', 'Racines 12-ièmes de l’unité.'], [false, '$\\ens{A\\mid\\det A=2}$ dans $\\GL_2(\\R)$', '$I_2$ n’y est pas.'], [true, '$\\ens{A\\mid\\det A>0}$ dans $\\GL_2(\\R)$', 'Image réciproque de $\\R_+^*$.'],
    [false, '$2\\Z\\cup3\\Z$ dans $(\\Z,+)$', '$2+3=5$.'], [true, '$\\ens{\\sigma\\mid\\sigma(1)=1}$ dans $S_n$', 'Stabilisateur.'], [false, '$\\N$ dans $(\\Z,+)$', 'Pas d’opposés.'], [true, '$\\ens{\\cl0,\\cl3,\\cl6,\\cl9}$ dans $\\Z/12\\Z$', '$\\langle\\cl3\\rangle$.'],
    [false, 'l’ensemble des transpositions dans $S_n$', '$\\id$ n’en est pas une.'], [true, '$\\SL_n(\\R)$ dans $\\GL_n(\\R)$', 'Noyau du déterminant.'], [false, '$\\ens{x\\mid x>1}$ dans $(\\R_+^*,\\times)$', '$1$ n’y est pas.'],
  ], 'Critère : $H\\neq\\varnothing$ et $xy^{-1}\\in H$ pour tous $x,y\\in H$.')),
  qcm('c4-ordre-Zn', 'Ordre', R => { const n = R.int(6, 48), k = R.int(1, n - 1), o = ordZ(k, n);
    return single(`Quel est l’ordre de $\\cl{${k}}$ dans $\\Z/${n}\\Z$ ?`, ok(o, `$\\frac{${n}}{\\pgcd(${k},${n})}=\\frac{${n}}{${gcd(k, n)}}$.`),
      [no(k, 'L’ordre n’est pas le représentant.'), no(gcd(k, n), 'C’est le pgcd.'), no(n, 'Seulement pour un générateur.'), no(n - k, 'C’est l’opposé.')].filter(c => c[1] !== String(o)).slice(0, 3),
      'Dans $\\Z/n\\Z$, l’ordre de $\\cl k$ est $\\frac n{\\pgcd(k,n)}$.'); }),
  qcm('c4-generateurs', 'Groupes cycliques', R => { const n = R.int(6, 40);
    return single(`Combien d’éléments engendrent $\\Z/${n}\\Z$ ?`, ok(Q.phi(n), `Les $\\cl k$ avec $\\pgcd(k,${n})=1$.`),
      [no(tau(n), 'C’est le nombre de sous-groupes.'), no(n - 1, 'Seulement si $n$ est premier.'), no(1, 'Il y en a plusieurs ($\\cl1$ et $\\cl{-1}$ au moins).')].filter(c => c[1] !== String(Q.phi(n))),
      '$\\cl k$ engendre $\\Z/n\\Z$ si et seulement si $\\pgcd(k,n)=1$ : $\\varphi(n)$ générateurs.'); }),
  qcm('c4-nb-sg-Zn', 'Groupes cycliques', R => { const n = R.pick([6, 8, 9, 10, 12, 15, 16, 18, 20, 24, 30, 36, 48, 60]);
    return single(`Combien $\\Z/${n}\\Z$ a-t-il de sous-groupes ?`, ok(tau(n), `Un par diviseur de ${n} : ${Q.divisors(n).join(', ')}.`),
      [no(Q.phi(n), 'C’est le nombre de générateurs.'), no(n, 'Pas un par élément.'), no(2, 'Seulement si $n$ est premier.')].filter(c => c[1] !== String(tau(n))),
      'Pour chaque diviseur $d$ de $n$, un unique sous-groupe d’ordre $d$.'); }),
  qcm('c4-sg-ordre-d', 'Groupes cycliques', R => { const n = R.pick([12, 18, 20, 24, 30, 36, 40]), d = R.pick(Q.divisors(n).filter(x => x > 1 && x < n));
    return single(`Quel est le sous-groupe d’ordre $${d}$ de $\\Z/${n}\\Z$ ?`, ok(`$\\langle\\cl{${n / d}}\\rangle$`, `$\\cl{${n / d}}$ est d’ordre ${d}.`),
      [no(`$\\langle\\cl{${d}}\\rangle$`, `$\\cl{${d}}$ est d’ordre ${ordZ(d, n)}.`), no(`$\\ens{\\cl0,\\dots,\\cl{${d - 1}}}$`, 'Ce n’est pas un sous-groupe.'), no('il n’y en a pas', `${d} divise ${n}.`)],
      'Le sous-groupe d’ordre $d$ de $\\Z/n\\Z$ est $\\langle\\cl{n/d}\\rangle$.'); }),
  qcm('c4-elements-ordre-d', 'Groupes cycliques', R => { const n = R.pick([12, 18, 20, 24, 30, 36, 60]), d = R.pick(Q.divisors(n).filter(x => x > 1));
    return single(`Combien d’éléments de $\\Z/${n}\\Z$ sont d’ordre exactement $${d}$ ?`, ok(Q.phi(d), `Les générateurs de l’unique sous-groupe d’ordre ${d}.`),
      [no(d, 'C’est le nombre d’éléments d’ordre divisant $d$.'), no(n / d, 'C’est l’indice.'), no(d - 1, 'Seulement si $d$ est premier.')].filter(c => c[1] !== String(Q.phi(d))),
      'Dans un groupe cyclique d’ordre $n$, il y a $\\varphi(d)$ éléments d’ordre $d$ pour chaque $d\\mid n$.'); }),
  qcm('c4-aZ-bZ', 'Sous-groupes', R => { const a = R.int(4, 40), b = R.int(4, 40), which = R() < 0.5;
    return single(which ? `Que vaut $${a}\\Z+${b}\\Z$ ?` : `Que vaut $${a}\\Z\\cap${b}\\Z$ ?`, ok(`$${which ? gcd(a, b) : lcm(a, b)}\\Z$`, which ? 'Bézout.' : 'Multiples communs.'),
      [no(`$${which ? lcm(a, b) : gcd(a, b)}\\Z$`, 'On a confondu somme et intersection.'), no(`$${a + b}\\Z$`, 'Ce n’est pas la somme des générateurs.'), no(`$${a * b}\\Z$`, 'Contenu dedans, mais pas égal en général.')],
      'Sous-groupes de $\\Z$ : $a\\Z+b\\Z=\\pgcd(a,b)\\Z$, $a\\Z\\cap b\\Z=\\ppcm(a,b)\\Z$.'); }),
  qcm('c4-ordre-mult', 'Ordre', R => { const p = R.pick([7, 11, 13, 17, 19]), a = R.int(2, p - 2), o = Q.orderMod(a, p);
    return single(`Quel est l’ordre de $\\cl{${a}}$ dans $(\\Z/${p}\\Z)^\\times$ ?`, ok(o, `Plus petit $k\\ge1$ avec $${a}^k\\equiv1\\pmod{${p}}$.`),
      [no(p - 1, 'C’est l’ordre du groupe, un multiple de la réponse.'), no(p, 'L’ordre divise $p-1$.'), no(a, 'Sans rapport.'), no((p - 1) / 2, 'Recompter les puissances.')].filter(c => c[1] !== String(o)).slice(0, 3),
      'Lagrange : l’ordre divise $p-1$ ; on teste les diviseurs.'); }),
  qcm('c4-ordre-matrice', 'Ordre', R => { const cases = [['\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}', '4'], ['\\begin{pmatrix}0&1\\\\-1&-1\\end{pmatrix}', '3'], ['\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}', 'infini'], ['\\begin{pmatrix}-1&0\\\\0&-1\\end{pmatrix}', '2'], ['\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}', '2'], ['\\begin{pmatrix}1&-1\\\\1&0\\end{pmatrix}', '6'], ['\\begin{pmatrix}2&0\\\\0&1\\end{pmatrix}', 'infini']];
    const [M, o] = R.pick(cases);
    return single(`Quel est l’ordre de $${M}$ dans $\\GL_2(\\R)$ ?`, ok(o, 'Calculer les puissances successives.'), ['2', '3', '4', '6', 'infini'].filter(x => x !== o).slice(0, 4).map(x => no(x, 'Calculer les puissances jusqu’à revenir à $I_2$.')),
      'Rotations d’angle $\\frac{2\\pi}n$ : ordre $n$ ; une transvection ou une homothétie de rapport $\\neq\\pm1$ : ordre infini.'); }),
  qcm('c4-racines-unite', 'Ordre', R => { const n = R.int(4, 24), k = R.int(1, n - 1);
    return single(`Quel est l’ordre de $e^{2i\\pi\\cdot${k}/${n}}$ dans $(\\C^*,\\times)$ ?`, ok(ordZ(k, n), `$\\frac{${n}}{\\pgcd(${k},${n})}$.`),
      [no(n, 'Seulement si $\\pgcd(k,n)=1$.'), no(k, 'Sans rapport.'), no(gcd(k, n), 'C’est le pgcd.')].filter(c => c[1] !== String(ordZ(k, n))),
      '$\\langle e^{2i\\pi/n}\\rangle\\simeq\\Z/n\\Z$, par $\\cl k\\mapsto e^{2ik\\pi/n}$.'); }),
  qcm('c4-produit-cyclique', 'Groupes cycliques', R => { const m = R.int(2, 12), n = R.int(2, 12), c = gcd(m, n) === 1;
    return single(`Le groupe $\\Z/${m}\\Z\\times\\Z/${n}\\Z$ est-il cyclique ?`, ok(c ? `Oui, car $\\pgcd(${m},${n})=1$` : `Non, car $\\pgcd(${m},${n})=${gcd(m, n)}\\neq1$`, c ? `$(\\cl1,\\cl1)$ est d’ordre ${m * n}.` : `Tout élément a un ordre divisant $\\ppcm(${m},${n})=${lcm(m, n)}<${m * n}$.`),
      [no(c ? `Non, car $${m}$ et $${n}$ sont distincts` : `Oui, car $(\\cl1,\\cl1)$ engendre`, c ? 'Ce n’est pas le critère.' : `$(\\cl1,\\cl1)$ est d’ordre ${lcm(m, n)}.`), no('Oui, toujours', 'Faux pour $\\Z/2\\Z\\times\\Z/2\\Z$.'), no('Non, jamais', 'Faux pour $\\Z/2\\Z\\times\\Z/3\\Z$.')],
      '$\\Z/m\\Z\\times\\Z/n\\Z\\simeq\\Z/mn\\Z$ si et seulement si $\\pgcd(m,n)=1$.'); }),
  qcm('c4-ordre-couple', 'Ordre', R => { const m = R.int(2, 12), n = R.int(2, 12), a = R.int(0, m - 1), b = R.int(0, n - 1), o = lcm(ordZ(a, m) || 1, ordZ(b, n) || 1);
    return single(`Quel est l’ordre de $(\\cl{${a}},\\cl{${b}})$ dans $\\Z/${m}\\Z\\times\\Z/${n}\\Z$ ?`, ok(o, `$\\ppcm(${ordZ(a, m)},${ordZ(b, n)})$.`),
      [no(ordZ(a, m) * ordZ(b, n), 'C’est le produit des ordres, pas leur ppcm.'), no(m * n, 'C’est l’ordre du groupe.'), no(Math.max(ordZ(a, m), ordZ(b, n)), 'Le maximum ne suffit pas.')].filter(c => c[1] !== String(o)),
      'L’ordre d’un couple est le ppcm des ordres des composantes.'); }),
  // ---------------------------------------------------------------- homomorphisms
  qcm('c4-homomorphismes', 'Homomorphismes', R => fromPool(R, 'Lesquelles de ces applications sont des homomorphismes de groupes ?', [
    [true, '$(\\R,+)\\to(\\C^*,\\times)$, $\\theta\\mapsto e^{i\\theta}$', 'Exponentielle.'], [false, '$(\\Z,+)\\to(\\Z,+)$, $k\\mapsto k+1$', '$0\\mapsto1$.'], [true, '$\\GL_n(\\R)\\to\\R^*$, $A\\mapsto\\det(A)^2$', 'Composée d’homomorphismes.'],
    [false, '$S_3\\to S_3$, $\\sigma\\mapsto\\sigma^2$', '$S_3$ n’est pas abélien.'], [true, '$\\Z/6\\Z\\to\\Z/3\\Z$, $\\cl k\\mapsto\\cl k$', 'Bien défini car $3\\mid6$.'], [true, '$(\\R_+^*,\\times)\\to(\\R,+)$, $x\\mapsto\\ln x$', 'Isomorphisme.'],
    [false, '$(\\R,+)\\to(\\R,+)$, $x\\mapsto x^2$', '$(1+1)^2\\neq1+1$.'], [true, '$S_n\\to\\ens{\\pm1}$, $\\sigma\\mapsto\\sgn\\sigma$', 'Théorème du cours.'], [false, '$\\GL_2(\\R)\\to\\GL_2(\\R)$, $A\\mapsto A\\tr$', '$(AB)\\tr=B\\tr A\\tr$ : anti-homomorphisme.'],
    [true, '$\\GL_2(\\R)\\to\\GL_2(\\R)$, $A\\mapsto(A\\tr)^{-1}$', 'Les deux renversements se compensent.'],
  ], 'Un homomorphisme envoie le neutre sur le neutre et respecte la loi.')),
  qcm('c4-noyau-Z', 'Homomorphismes', R => { const n = R.int(4, 30), a = R.int(1, n - 1);
    return single(`Quel est le noyau de $f:\\Z\\to\\Z/${n}\\Z$, $k\\mapsto\\cl{${a}k}$ ?`, ok(`$${ordZ(a, n)}\\Z$`, `$${n}\\mid${a}k\\iff${ordZ(a, n)}\\mid k$.`),
      [no(`$${n}\\Z$`, `Trop petit si $\\pgcd(${a},${n})>1$.`), no(`$${a}\\Z$`, 'Sans rapport.'), no(`$${gcd(a, n)}\\Z$`, 'C’est l’indice de l’image.')].filter(c => c[1] !== `$${ordZ(a, n)}\\Z$`),
      'Le noyau est $m\\Z$ avec $m$ l’ordre de $\\cl a$ ; le premier théorème donne $\\Img f\\simeq\\Z/m\\Z$.'); }),
  qcm('c4-nb-hom', 'Homomorphismes', R => { const n = R.int(2, 20), m = R.int(2, 20);
    return single(`Combien y a-t-il d’homomorphismes de $\\Z/${n}\\Z$ dans $\\Z/${m}\\Z$ ?`, ok(gcd(n, m), `L’image de $\\cl1$ doit être d’ordre divisant ${n} et ${m}.`),
      [no(m, 'Toutes les images de $\\cl1$ ne conviennent pas.'), no(lcm(n, m), 'C’est le ppcm.'), no(1, gcd(n, m) === 1 ? 'Exact' : 'Il y en a d’autres que le trivial.')].filter(c => c[1] !== String(gcd(n, m))),
      '$\\varphi$ est déterminé par $\\varphi(\\cl1)=\\cl a$ avec $n\\cl a=\\cl0$, soit $\\frac m{\\pgcd(n,m)}\\mid a$ : $\\pgcd(n,m)$ choix.'); }),
  qcm('c4-iso1', 'Homomorphismes', R => { const k = R.int(2, 12), i = R.int(2, 12), g = k * i, which = R.pick(['ker', 'im']);
    return single(which === 'ker' ? `$f:G\\to H$ est un homomorphisme surjectif, $\\abs G=${g}$, $\\abs H=${i}$. Que vaut $\\abs{\\Ker f}$ ?` : `$f:G\\to H$ est un homomorphisme, $\\abs G=${g}$ et $\\abs{\\Ker f}=${k}$. Que vaut $\\abs{\\Img f}$ ?`,
      ok(which === 'ker' ? k : i, '$G/\\Ker f\\simeq\\Img f$.'), [no(g - (which === 'ker' ? i : k), 'Ce n’est pas une différence.'), no(g, 'C’est l’ordre de $G$.'), no(g * (which === 'ker' ? i : k), 'C’est un produit, pas un quotient.')].filter(c => c[1] !== String(which === 'ker' ? k : i)),
      'Premier théorème d’isomorphisme : $\\abs G=\\abs{\\Ker f}\\cdot\\abs{\\Img f}$.'); }),
  qcm('c4-iso-paires', 'Homomorphismes', R => fromPool(R, 'Lesquelles de ces paires sont formées de groupes isomorphes ?', [
    [true, '$\\Z/6\\Z$ et $\\Z/2\\Z\\times\\Z/3\\Z$', 'Premiers entre eux.'], [false, '$\\Z/4\\Z$ et $\\Z/2\\Z\\times\\Z/2\\Z$', 'Un élément d’ordre 4 d’un côté seulement.'], [false, '$S_3$ et $\\Z/6\\Z$', 'Un seul est abélien.'],
    [true, '$D_3$ et $S_3$', 'Action sur les sommets.'], [true, '$(\\R,+)$ et $(\\R_+^*,\\times)$', 'Exponentielle.'], [false, '$(\\Z,+)$ et $(\\Q,+)$', '$\\Q$ n’est pas cyclique.'],
    [true, '$\\ens{\\pm1}$ et $\\Z/2\\Z$', 'Même table.'], [false, '$\\Z/8\\Z$ et $\\Z/2\\Z\\times\\Z/4\\Z$', 'Élément d’ordre 8.'], [true, '$\\langle(1\\,2\\,3\\,4)\\rangle$ et $\\Z/4\\Z$', 'Cyclique d’ordre 4.'], [false, '$(\\Q^*,\\times)$ et $(\\Q,+)$', '$-1$ est d’ordre 2 dans $\\Q^*$, rien n’est d’ordre 2 dans $\\Q$.'],
  ], 'Pour un isomorphisme, l’exhiber ; pour le réfuter, un invariant (commutativité, cyclicité, ordres des éléments).')),
  qcm('c4-noyaux-connus', 'Homomorphismes', R => fromPool(R, 'Lesquelles de ces affirmations sur des homomorphismes connus sont vraies ?', [
    [true, '$\\Ker(\\det:\\GL_n(\\R)\\to\\R^*)=\\SL_n(\\R)$', 'Définition.'], [true, '$\\GL_n(\\R)/\\SL_n(\\R)\\simeq\\R^*$', '$\\det$ est surjectif.'], [true, '$\\R/\\Z\\simeq S^1$', 'Par $\\theta\\mapsto e^{2i\\pi\\theta}$.'],
    [true, '$\\Ker(\\sgn)=A_n$', 'Définition.'], [false, '$\\R/\\Z\\simeq\\R$', '$\\R/\\Z$ a des éléments d’ordre fini non nuls.'], [false, '$\\GL_n(\\R)/\\SL_n(\\R)\\simeq\\ens{\\pm1}$', 'L’image est $\\R^*$ tout entier.'],
    [true, 'Le noyau de $\\Z\\to\\Z/n\\Z$ est $n\\Z$', 'Projection.'],
  ], 'Premier théorème d’isomorphisme appliqué aux exemples du cours.')),
  // ---------------------------------------------------------------- Lagrange, cosets
  qcm('c4-indice', 'Lagrange', R => { const h = R.int(2, 12), i = R.int(2, 12);
    return single(`$H$ est un sous-groupe d’ordre $${h}$ d’un groupe d’ordre $${h * i}$. Combien $H$ a-t-il de classes à gauche ?`, ok(i, `$[G:H]=\\frac{${h * i}}{${h}}$.`),
      [no(h, 'C’est le cardinal de chaque classe.'), no(h * i, 'C’est l’ordre de $G$.'), no(h * i - h, 'Les classes ne se comptent pas ainsi.')].filter(c => c[1] !== String(i)),
      'Lagrange : $\\abs G=[G:H]\\cdot\\abs H$.'); }),
  qcm('c4-ordres-impossibles', 'Lagrange', R => { const n = R.pick([12, 18, 20, 24, 30, 36, 40, 42]), bad = R.pick([...Array(n).keys()].map(x => x + 1).filter(x => n % x && x < n && x > 2)), good = R.sample(Q.divisors(n).filter(x => x > 1 && x < n), 3);
    return single(`Un groupe d’ordre $${n}$ peut-il avoir un sous-groupe d’ordre... ? Lequel de ces ordres est impossible ?`, ok(bad, `${bad} ne divise pas ${n}.`), good.map(d => no(d, `${d} divise ${n} : Lagrange ne l’exclut pas.`)),
      'Lagrange : l’ordre d’un sous-groupe divise l’ordre du groupe. (Diviser ne garantit pas l’existence : $A_4$ n’a pas de sous-groupe d’ordre 6.)'); }),
  qcm('c4-euler', 'Lagrange', R => { let m, a; do { m = R.int(8, 40); a = R.int(2, m - 1); } while (gcd(a, m) !== 1); const k = R.int(20, 200), r = Number(BigInt(a) ** BigInt(k) % BigInt(m)), f = Q.phi(m);
    return single(`Que vaut $${a}^{${k}}$ modulo $${m}$ ?`, ok(r, `$\\varphi(${m})=${f}$ et $${k}\\equiv${k % f}\\pmod{${f}}$.`),
      [no(Number(BigInt(a) ** BigInt(k % m) % BigInt(m)), 'On a réduit l’exposant modulo $m$ au lieu de $\\varphi(m)$.'), no(mod(a * k, m), 'C’est $ak$, pas $a^k$.'), no(1, 'Seulement si $\\varphi(m)$ divise l’exposant.')].filter(c => c[1] !== String(r)),
      'Euler : $a^{\\varphi(m)}\\equiv1\\pmod m$ si $\\pgcd(a,m)=1$ (Lagrange dans $(\\Z/m\\Z)^\\times$).'); }),
  qcm('c4-classes-Zn', 'Lagrange', R => { const n = R.pick([12, 15, 18, 20, 24, 30]), k = R.int(1, n - 1);
    return single(`Combien le sous-groupe $\\langle\\cl{${k}}\\rangle$ de $\\Z/${n}\\Z$ a-t-il de classes ?`, ok(gcd(k, n), `Il est d’ordre ${ordZ(k, n)}, d’indice ${gcd(k, n)}.`),
      [no(ordZ(k, n), 'C’est son ordre.'), no(n, 'Trop.'), no(k, 'Sans rapport.')].filter(c => c[1] !== String(gcd(k, n))),
      '$[\\Z/n\\Z:\\langle\\cl k\\rangle]=\\frac n{\\abs{\\cl k}}=\\pgcd(k,n)$.'); }),
  qcm('c4-classes-props', 'Lagrange', R => fromPool(R, 'Soit $H<G$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$xH=yH\\iff y^{-1}x\\in H$', 'Définition de la relation.'], [true, 'Deux classes à gauche sont égales ou disjointes', 'Classes d’équivalence.'], [true, 'Toutes les classes à gauche ont le cardinal de $H$', '$h\\mapsto xh$.'],
    [false, '$xH=Hx$ pour tout $x$', 'Seulement si $H$ est normal.'], [false, 'Les classes à gauche sont des sous-groupes', 'Seule $H$ elle-même en est un.'], [true, '$xH=H\\iff x\\in H$', 'Cas $y=e$.'],
    [true, 'Les classes à gauche et à droite sont en même nombre', '$xH\\mapsto Hx^{-1}$.'],
  ], 'Classes et théorème de Lagrange.')),
  qcm('c4-premier', 'Lagrange', R => fromPool(R, 'Soit $G$ un groupe d’ordre $p$ premier. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$G$ est cyclique', 'Lagrange.'], [true, 'Tout élément $\\neq e$ engendre $G$', 'Son ordre divise $p$ et vaut plus que 1.'], [true, '$G$ est abélien', 'Cyclique.'], [true, '$G\\simeq\\Z/p\\Z$', 'Classification des cycliques.'],
    [false, '$G$ a un sous-groupe propre non trivial', 'Ordres possibles : 1 et $p$.'], [false, '$G$ a exactement $p$ générateurs', 'Il en a $p-1$.'],
  ], 'Un groupe d’ordre premier est cyclique.')),
  // ---------------------------------------------------------------- normal subgroups and quotients
  qcm('c4-normaux', 'Sous-groupes normaux', R => fromPool(R, 'Lesquels de ces sous-groupes sont normaux ?', [
    [true, '$A_n$ dans $S_n$', 'Noyau de la signature.'], [true, '$\\SL_n(\\R)$ dans $\\GL_n(\\R)$', 'Noyau du déterminant.'], [false, '$\\langle\\tau\\rangle$ dans $D_4$', '$r\\tau r^{-1}=r^2\\tau$.'], [true, '$\\langle r\\rangle$ dans $D_n$', 'Indice 2.'],
    [false, 'les triangulaires supérieures dans $\\GL_2(\\R)$', 'Conjuguer par $\\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}$.'], [false, '$\\langle(1\\,2)\\rangle$ dans $S_3$', '$(1\\,3)(1\\,2)(1\\,3)=(2\\,3)$.'], [true, 'tout sous-groupe de $\\Z/n\\Z$', 'Groupe abélien.'],
    [true, '$V=\\ens{\\id,(1\\,2)(3\\,4),(1\\,3)(2\\,4),(1\\,4)(2\\,3)}$ dans $S_4$', 'Réunion de classes de conjugaison.'], [false, '$\\langle(1\\,2\\,3\\,4)\\rangle$ dans $S_4$', 'Il ne contient pas $(1\\,3\\,2\\,4)$, conjugué de $(1\\,2\\,3\\,4)$.'],
  ], 'Noyau, indice 2, groupe abélien ; pour réfuter, un conjugué qui sort.')),
  qcm('c4-quotient-Zn', 'Quotients', R => { const n = R.pick([12, 18, 20, 24, 30, 36]), k = R.pick([2, 3, 4, 5, 6, 8, 9, 10].filter(x => x < n)), d = gcd(k, n);
    return single(`À quel groupe $(\\Z/${n}\\Z)/\\langle\\cl{${k}}\\rangle$ est-il isomorphe ?`, ok(`$\\Z/${d}\\Z$`, `$\\langle\\cl{${k}}\\rangle=\\langle\\cl{${d}}\\rangle$ est d’ordre ${n / d}, d’indice ${d}.`),
      [no(`$\\Z/${n / d}\\Z$`, 'C’est l’ordre du sous-groupe, pas du quotient.'), no(`$\\Z/${k}\\Z$`, `Il faut $\\pgcd(${k},${n})$.`), no(`$\\Z/${n}\\Z$`, 'Le quotient est plus petit.')].filter(c => c[1] !== `$\\Z/${d}\\Z$`),
      'Troisième théorème d’isomorphisme : $(\\Z/n\\Z)/(d\\Z/n\\Z)\\simeq\\Z/d\\Z$ pour $d\\mid n$.'); }),
  qcm('c4-quotient-props', 'Quotients', R => fromPool(R, 'Lesquelles de ces affirmations sur les quotients sont vraies ?', [
    [true, 'Si $H\\lhd G$, $(xH)(yH)=xyH$ est bien défini', 'La normalité sert exactement là.'], [false, 'Pour tout $H<G$, $G/H$ est un groupe', 'Contre-exemple : $\\langle(1\\,2)\\rangle$ dans $S_3$.'],
    [true, 'La projection $G\\to G/H$ est un homomorphisme de noyau $H$', 'Théorème du cours.'], [true, 'Tout sous-groupe normal est un noyau', 'Celui de la projection.'],
    [true, 'Un quotient d’un groupe abélien est abélien', '$xHyH=xyH=yxH$.'], [true, 'Un quotient d’un groupe cyclique est cyclique', 'Engendré par la classe d’un générateur.'], [false, 'Si $G/H$ est abélien, $G$ est abélien', '$S_3/A_3$.'],
  ], 'Groupe quotient et premier théorème d’isomorphisme.')),
  // ---------------------------------------------------------------- permutations
  qcm('c4-produit-perm', 'Permutations', R => { const n = 5, s = nonId(R, n), t = nonId(R, n);
    return single(`Dans $S_5$, avec $\\sigma=${cy(s)}$ et $\\tau=${cy(t)}$, que vaut $\\sigma\\tau$ (on applique d’abord $\\tau$) ?`, ok(`$${cy(compose(s, t))}$`, 'Suivre chaque élément : d’abord $\\tau$, puis $\\sigma$.'),
      [no(`$${cy(compose(t, s))}$`, 'C’est $\\tau\\sigma$ : mauvais ordre.'), no(`$${cy(compose(inverse(s), t))}$`, 'C’est $\\sigma^{-1}\\tau$.'), no(`$${cy(compose(s, inverse(t)))}$`, 'C’est $\\sigma\\tau^{-1}$.')],
      'Convention du cours : $\\sigma\\tau=\\sigma\\circ\\tau$ applique d’abord $\\tau$.'); }),
  qcm('c4-inverse-perm', 'Permutations', R => { const s = nonId(R, 6);
    return single(`Quel est l’inverse de $\\sigma=${cy(s)}$ dans $S_6$ ?`, ok(`$${cy(inverse(s))}$`, 'On parcourt chaque cycle à l’envers.'),
      [no(`$${cy(compose(s, s))}$`, 'C’est $\\sigma^2$.'), no(`$${cy(s)}$`, 'Seulement si $\\sigma$ est d’ordre 2.'), no(`$${cy(compose(inverse(s), inverse(s)))}$`, 'C’est $\\sigma^{-2}$.')],
      'L’inverse d’un cycle $(a_1\\,\\cdots\\,a_k)$ est $(a_k\\,\\cdots\\,a_1)$.'); }),
  qcm('c4-deux-lignes', 'Permutations', R => { const s = nonId(R, 6);
    return single(`Écrire $${two(s)}$ en cycles disjoints.`, ok(`$${cy(s)}$`, 'Suivre $1\\mapsto\\sigma(1)\\mapsto\\cdots$ jusqu’au retour.'),
      [no(`$${cy(inverse(s))}$`, 'C’est l’inverse : cycles parcourus à l’envers.'), no(`$${cy(compose(s, s))}$`, 'C’est le carré.'), no(`$${cy(s.map(y => s.indexOf(y)))}$`, 'Recalculer.')],
      'Notation à deux lignes : la seconde ligne donne les images.'); }),
  qcm('c4-ordre-perm', 'Permutations', R => { const s = nonId(R, R.int(6, 9)), o = permOrder(s), L = Q.cyc(s).match(/\(([^)]*)\)/g).map(c => c.split(' ').length);
    return single(`Quel est l’ordre de $${cy(s)}$ ?`, ok(o, `ppcm des longueurs ${L.join(', ')}.`),
      [no(L.reduce((a, b) => a * b, 1), 'C’est le produit des longueurs.'), no(L.reduce((a, b) => a + b, 0), 'C’est la somme des longueurs.'), no(Math.max(...L), 'C’est la plus grande longueur.')].filter(c => c[1] !== String(o)),
      'L’ordre d’une permutation est le ppcm des longueurs de ses cycles disjoints.'); }),
  qcm('c4-signature', 'Permutations', R => { const s = nonId(R, R.int(5, 8)), e = sign(s);
    return single(`Quelle est la signature de $${cy(s)}$ ?`, ok(e > 0 ? '$+1$' : '$-1$', 'Un $k$-cycle a pour signature $(-1)^{k-1}$.'),
      [no(e > 0 ? '$-1$' : '$+1$', 'Recompter : $(-1)^{k-1}$ par cycle.'), no('$0$', 'Une signature vaut $\\pm1$.'), no(`$${s.length}$`, 'Une signature vaut $\\pm1$.')],
      '$\\sgn$ est un homomorphisme ; un $k$-cycle est produit de $k-1$ transpositions.'); }),
  qcm('c4-cycle-parite', 'Permutations', R => { const k = R.int(2, 9);
    return single(`Un $${k}$-cycle est-il pair ?`, ok(k % 2 ? 'Oui' : 'Non', `Signature $(-1)^{${k - 1}}$.`),
      [no(k % 2 ? 'Non' : 'Oui', 'Un $k$-cycle est pair si et seulement si $k$ est impair.'), no('Cela dépend des éléments du cycle', 'Seule la longueur compte.'), no('Un cycle n’a pas de parité', 'Toute permutation en a une.')],
      '$(a_1\\,\\cdots\\,a_k)=(a_1\\,a_2)(a_2\\,a_3)\\cdots(a_{k-1}\\,a_k)$ : $k-1$ transpositions.'); }),
  qcm('c4-puissance-cycle', 'Permutations', R => { const k = R.int(5, 9), m = R.int(2, k - 1), c = P('(' + [...Array(k).keys()].map(i => i + 1).join(' ') + ')', k), pw = Q.permIdentity(k).map((_, i) => (i + m) % k);
    return single(`Que vaut $(1\\,2\\,\\cdots\\,${k})^{${m}}$ ?`, ok(`$${cy(pw)}$`, `Chaque élément avance de ${m} crans ; ${gcd(m, k)} cycle${gcd(m, k) > 1 ? 's' : ''} de longueur ${k / gcd(m, k)}.`),
      [no(`$${cy(pw.map((_, i) => (i - m + k) % k))}$`, 'Recule au lieu d’avancer.'), no(`$${cy(c)}$`, 'C’est le cycle lui-même.'), no(`$${cy(pw.map((_, i) => (i + m + 1) % k))}$`, 'Décalage d’un cran de trop.')],
      'La puissance $m$-ième d’un $k$-cycle se décompose en $\\pgcd(m,k)$ cycles de longueur $\\frac k{\\pgcd(m,k)}$.'); }),
  qcm('c4-nb-k-cycles', 'Permutations', R => { const n = R.int(4, 7), k = R.int(2, n), c = Q.fact(n) / (Q.fact(n - k) * k);
    return single(`Combien $S_{${n}}$ contient-il de $${k}$-cycles ?`, ok(c, `$\\frac{${n}!}{(${n}-${k})!\\cdot${k}}$ : on choisit les ${k} éléments dans l’ordre, puis on divise par les ${k} façons de commencer.`),
      [no(Q.binom(n, k), 'Il faut aussi choisir l’ordre cyclique : $(k-1)!$ façons.'), no(Q.fact(n) / Q.fact(n - k), 'Chaque cycle est compté $k$ fois.'), no(Q.fact(k - 1), 'C’est le nombre de cycles sur $k$ éléments fixés.')].filter(c2 => c2[1] !== String(c)),
      'Nombre de $k$-cycles : $\\binom nk(k-1)!$.'); }),
  qcm('c4-An', 'Permutations', R => { const n = R.int(3, 7);
    return single(`Quel est l’ordre de $A_{${n}}$ ?`, ok(Q.fact(n) / 2, `$\\frac{${n}!}2$.`), [no(Q.fact(n), 'C’est $\\abs{S_n}$.'), no(Q.fact(n - 1), 'Recompter.'), no(n * (n - 1) / 2, 'C’est le nombre de transpositions.')].filter(c => c[1] !== String(Q.fact(n) / 2)),
      '$A_n=\\Ker\\sgn$ est d’indice 2 dans $S_n$ ($n\\ge2$).'); }),
  qcm('c4-perm-pool', 'Permutations', R => fromPool(R, 'Lesquelles de ces affirmations sur $S_n$ sont vraies ?', [
    [true, 'Deux cycles disjoints commutent', 'Chaque point bouge sous un seul des deux.'], [false, 'Deux cycles quelconques commutent', '$(1\\,2)(2\\,3)\\neq(2\\,3)(1\\,2)$.'], [true, 'Toute permutation est produit de transpositions', 'Proposition du cours.'],
    [false, 'L’écriture en produit de transpositions est unique', 'Seule sa parité l’est.'], [true, 'Le produit de deux permutations impaires est pair', 'Signature multiplicative.'], [true, 'Une permutation d’ordre impair est paire', 'Ses cycles sont de longueur impaire.'],
    [false, 'Une permutation paire est d’ordre impair', '$(1\\,2)(3\\,4)$ est paire, d’ordre 2.'], [true, '$S_n$ n’est pas abélien pour $n\\ge3$', '$(1\\,2)(1\\,3)\\neq(1\\,3)(1\\,2)$.'], [true, '$\\abs{S_n}=n!$', 'Bijections d’un ensemble à $n$ éléments.'],
  ], 'Cycles, transpositions, signature.')),
  // ---------------------------------------------------------------- dihedral groups
  qcm('c4-diedral-produit', 'Groupe diédral', R => { const n = R.int(3, 8), x = { k: R.int(0, n - 1), s: R.int(0, 1) }, y = { k: R.int(0, n - 1), s: R.int(0, 1) }, z = dihedralMul(n, x, y), w = dihedralMul(n, y, x);
    const nm = g => dihedralName(g).replace(/\^(\d+)/, '^{$1}');
    return single(`Dans $D_{${n}}$ (relations $r^{${n}}=e$, $\\tau^2=e$, $\\tau r\\tau=r^{-1}$), que vaut $${nm(x)}\\cdot${nm(y)}$ ?`, ok(`$${nm(z)}$`, 'Faire passer $\\tau$ à droite avec $\\tau r^k=r^{-k}\\tau$.'),
      [no(`$${nm(w)}$`, 'C’est le produit dans l’autre ordre.'), no(`$${nm({ k: mod(x.k + y.k, n), s: x.s ^ y.s })}$`, 'On a oublié que $\\tau$ renverse les rotations.'), no(`$${nm({ k: mod(z.k + 1, n), s: z.s })}$`, 'Décalage d’un cran.')],
      '$(r^a\\tau^s)(r^b\\tau^t)=r^{a+(-1)^sb}\\tau^{s+t}$.'); }),
  qcm('c4-diedral-ordre2', 'Groupe diédral', R => { const n = R.int(3, 12), c = n % 2 ? n : n + 1;
    return single(`Combien $D_{${n}}$ a-t-il d’éléments d’ordre 2 ?`, ok(c, n % 2 ? `Les ${n} réflexions.` : `Les ${n} réflexions et le demi-tour $r^{${n / 2}}$.`),
      [no(n % 2 ? n + 1 : n, n % 2 ? `Pas de demi-tour quand ${n} est impair.` : 'On a oublié le demi-tour.'), no(1, 'Toutes les réflexions sont d’ordre 2.'), no(2 * n, 'C’est l’ordre du groupe.')].filter(x => x[1] !== String(c)),
      'Réflexions : $n$ éléments d’ordre 2 ; une rotation $r^k$ est d’ordre 2 si et seulement si $2k=n$.'); }),
  qcm('c4-diedral-pool', 'Groupe diédral', R => fromPool(R, 'Lesquelles de ces affirmations sur $D_n$ ($n\\ge3$) sont vraies ?', [
    [true, '$\\abs{D_n}=2n$', '$n$ rotations, $n$ réflexions.'], [true, '$D_n$ n’est pas abélien', '$\\tau r=r^{-1}\\tau\\neq r\\tau$.'], [true, '$(r^k\\tau)(r^l\\tau)=r^{k-l}$', 'Relation du cours.'],
    [true, 'Le produit de deux réflexions est une rotation', 'Formule précédente.'], [false, 'Le produit de deux réflexions est une réflexion', 'C’est une rotation.'], [true, '$D_n$ est un sous-groupe de $S_n$', 'Action fidèle sur les sommets.'],
    [false, '$D_n$ est cyclique', 'Il n’est même pas abélien.'], [true, '$\\langle r\\rangle$ est normal dans $D_n$', 'Indice 2.'],
  ], 'Le groupe diédral.')),
  // ---------------------------------------------------------------- matrix groups
  qcm('c4-GLnZ', 'Groupes de matrices', R => { const A = [[R.int(-4, 4), R.int(-4, 4)], [R.int(-4, 4), R.int(-4, 4)]], d = A[0][0] * A[1][1] - A[0][1] * A[1][0], inGL = Math.abs(d) === 1;
    return single(`La matrice $${Q.pmatrix(A)}$ appartient-elle à $\\GL_2(\\Z)$ ?`, ok(inGL ? 'Oui' : 'Non', `Son déterminant vaut ${d}.`),
      [no(inGL ? 'Non' : 'Oui', 'Le critère est $\\det=\\pm1$.'), no(inGL ? 'Non, car elle a un coefficient négatif ou nul' : 'Oui, car ses coefficients sont entiers', inGL ? 'Ce n’est pas le critère.' : 'Il faut aussi que l’inverse soit entière.'), no(inGL ? 'Non, car son inverse n’est pas entière' : 'Oui, car son déterminant est non nul', inGL ? 'Son inverse est entière, puisque $\\det=\\pm1$.' : 'Sur $\\Z$, il faut $\\det=\\pm1$.')],
      'Une matrice entière est dans $\\GL_n(\\Z)$ si et seulement si $\\det=\\pm1$ (cofacteurs).'); }),
  qcm('c4-O2', 'Groupes de matrices', R => fromPool(R, 'Lesquelles de ces affirmations sur $O_2(\\R)$ sont vraies ?', [
    [true, 'Ses éléments ont un déterminant $\\pm1$', '$\\det(A\\tr A)=1$.'], [true, 'Ce sont les rotations et les réflexions', 'Proposition du cours.'], [true, 'Le produit de deux réflexions est une rotation', 'Déterminant $1$.'],
    [false, '$O_2(\\R)$ est abélien', 'Deux réflexions ne commutent pas en général.'], [true, '$SO_2(\\R)$ est abélien', 'Les rotations commutent.'], [false, 'Toute matrice de déterminant 1 est une rotation', '$\\mathrm{diag}(2,\\frac12)$.'],
  ], '$O_2(\\R)=\\ens{A\\mid A\\tr A=I_2}$.')),
  qcm('c4-SL2Z', 'Groupes de matrices', R => fromPool(R, 'Avec $S=\\begin{pmatrix}0&-1\\\\1&0\\end{pmatrix}$ et $T=\\begin{pmatrix}1&1\\\\0&1\\end{pmatrix}$, lesquelles de ces affirmations sont vraies ?', [
    [true, '$S^2=-I_2$', 'Calcul.'], [true, '$S$ est d’ordre 4', '$S^4=I_2$.'], [true, '$T$ est d’ordre infini', '$T^k=\\begin{pmatrix}1&k\\\\0&1\\end{pmatrix}$.'], [true, '$S$ et $T$ engendrent $\\SL_2(\\Z)$', 'Algorithme d’Euclide (exercice du chapitre).'],
    [false, '$ST=TS$', '$ST=\\begin{pmatrix}0&-1\\\\1&1\\end{pmatrix}$ et $TS=\\begin{pmatrix}1&-1\\\\1&0\\end{pmatrix}$.'], [false, '$\\SL_2(\\Z)$ est fini', '$T$ est d’ordre infini.'],
  ], '$\\SL_2(\\Z)=\\langle S,T\\rangle$.')),
  qcm('c4-cayley', 'Permutations', R => fromPool(R, 'Lesquelles de ces affirmations sur le théorème de Cayley sont vraies ?', [
    [true, 'Tout groupe d’ordre $n$ est isomorphe à un sous-groupe de $S_n$', 'Énoncé.'], [true, 'La preuve fait agir $G$ sur lui-même par translation', '$f_g(x)=gx$.'], [true, '$g\\mapsto f_g$ est injectif', '$f_g=\\id\\Rightarrow g=e$.'],
    [false, 'Tout groupe d’ordre $n$ est isomorphe à $S_n$', 'Seulement à un sous-groupe.'], [false, 'Le plongement est surjectif', '$n<n!$ pour $n\\ge3$.'],
  ], 'Théorème de Cayley.')),
  qcm('c4-ordre4', 'Groupes cycliques', R => fromPool(R, 'Lesquelles de ces affirmations sur les petits groupes sont vraies ?', [
    [true, 'Tout groupe d’ordre 4 est isomorphe à $\\Z/4\\Z$ ou à $\\Z/2\\Z\\times\\Z/2\\Z$', 'Exercice du chapitre.'], [true, 'Tout groupe d’ordre 6 est isomorphe à $\\Z/6\\Z$ ou à $S_3$', 'Exercice du chapitre.'],
    [true, 'Tout groupe d’ordre au plus 5 est abélien', 'Ordres premiers et ordre 4.'], [false, 'Tout groupe d’ordre 6 est abélien', '$S_3$.'], [true, 'Si $g^2=e$ pour tout $g$, $G$ est abélien', '$ab=(ab)^{-1}=b^{-1}a^{-1}=ba$.'],
    [true, 'Un groupe fini d’ordre pair a un élément d’ordre 2', 'Appariement $g\\leftrightarrow g^{-1}$.'],
  ], 'Classification des petits groupes.')),
  qcm('c4-hom-trivial', 'Homomorphismes', R => { const n = R.int(3, 6), m = R.pick([3, 5, 7, 9, 15]);
    return single(`Combien y a-t-il d’homomorphismes de $S_{${n}}$ dans $\\Z/${m}\\Z$ ?`, ok(1, `Les transpositions engendrent $S_{${n}}$ et doivent aller sur un élément d’ordre divisant 2 de $\\Z/${m}\\Z$, c’est-à-dire $\\cl0$.`),
      [no(2, 'Il n’y a pas d’élément d’ordre 2 dans un groupe d’ordre impair.'), no(m, 'Les images de transpositions sont contraintes.'), no(0, 'L’homomorphisme trivial existe toujours.')],
      'Exercice du chapitre : vers un groupe d’ordre impair, $S_n$ n’a que l’homomorphisme trivial.'); }),
];

// ---------------------------------------------------------------- quizzes
ITEMS.push(
  quiz('c4q-ordre-Zn', 'Ordre', R => { const n = R.int(10, 90), k = R.int(1, n - 1); return { stem: `Donner l’ordre de $\\cl{${k}}$ dans $\\Z/${n}\\Z$.`, type: 'int', answer: ordZ(k, n), expl: '$\\frac n{\\pgcd(k,n)}$.' }; }),
  quiz('c4q-ordre-perm', 'Permutations', R => { const s = nonId(R, R.int(7, 10)); return { stem: `Donner l’ordre de $${cy(s)}$.`, type: 'int', answer: permOrder(s), expl: 'ppcm des longueurs des cycles.' }; }),
  quiz('c4q-produit', 'Permutations', R => { const s = nonId(R, 6), t = nonId(R, 6); return { stem: `Dans $S_6$, calculer $\\sigma\\tau$ (d’abord $\\tau$) pour $\\sigma=${cy(s)}$ et $\\tau=${cy(t)}$.`, type: 'perm', n: 6, answer: compose(s, t), expl: 'Suivre chaque élément de droite à gauche.' }; }),
  quiz('c4q-inverse', 'Permutations', R => { const s = nonId(R, 7); return { stem: `Donner l’inverse de $${cy(s)}$ dans $S_7$.`, type: 'perm', n: 7, answer: inverse(s), expl: 'Chaque cycle parcouru à l’envers.' }; }),
  quiz('c4q-cycles', 'Permutations', R => { const s = nonId(R, 7); return { stem: `Écrire $${two(s)}$ en cycles disjoints.`, type: 'perm', n: 7, answer: s, expl: 'Suivre les images de $1$, puis du plus petit élément non encore vu.' }; }),
  quiz('c4q-signature', 'Permutations', R => { const s = nonId(R, R.int(6, 9)); return { stem: `Donner la signature ($1$ ou $-1$) de $${cy(s)}$.`, type: 'int', answer: sign(s), expl: '$\\prod(-1)^{k_i-1}$ sur les cycles.' }; }),
  quiz('c4q-puissance', 'Permutations', R => { const s = nonId(R, 7), m = R.int(2, 5); let p = Q.permIdentity(7); for (let i = 0; i < m; i++) p = compose(s, p);
    return { stem: `Calculer $\\sigma^{${m}}$ pour $\\sigma=${cy(s)}$ dans $S_7$.`, type: 'perm', n: 7, answer: p, expl: 'Chaque cycle de longueur $k$ se décale de $m$ crans.' }; }),
  quiz('c4q-nb-sg', 'Groupes cycliques', R => { const n = R.int(6, 100); return { stem: `Combien $\\Z/${n}\\Z$ a-t-il de sous-groupes ?`, type: 'int', answer: tau(n), expl: 'Un par diviseur de $n$.' }; }),
  quiz('c4q-generateurs', 'Groupes cycliques', R => { const n = R.int(6, 20); return { stem: `Donner l’ensemble des $k\\in\\ens{0,\\dots,${n - 1}}$ tels que $\\cl k$ engendre $\\Z/${n}\\Z$.`, type: 'set', answer: [...Array(n).keys()].filter(k => gcd(k, n) === 1), expl: '$\\pgcd(k,n)=1$.' }; }),
  quiz('c4q-hom', 'Homomorphismes', R => { const n = R.int(2, 40), m = R.int(2, 40); return { stem: `Combien y a-t-il d’homomorphismes de $\\Z/${n}\\Z$ dans $\\Z/${m}\\Z$ ?`, type: 'int', answer: gcd(n, m), expl: '$\\pgcd(n,m)$.' }; }),
  quiz('c4q-euler', 'Lagrange', R => { let m, a; do { m = R.int(10, 50); a = R.int(2, m - 1); } while (gcd(a, m) !== 1); const k = R.int(50, 500);
    return { stem: `Donner le reste de la division de $${a}^{${k}}$ par $${m}$.`, type: 'int', answer: Number(BigInt(a) ** BigInt(k) % BigInt(m)), expl: `Euler : $a^{\\varphi(${m})}\\equiv1$ avec $\\varphi(${m})=${Q.phi(m)}$.` }; }),
  quiz('c4q-ordre-couple', 'Ordre', R => { const m = R.int(2, 20), n = R.int(2, 20), a = R.int(1, m - 1), b = R.int(1, n - 1); return { stem: `Donner l’ordre de $(\\cl{${a}},\\cl{${b}})$ dans $\\Z/${m}\\Z\\times\\Z/${n}\\Z$.`, type: 'int', answer: lcm(ordZ(a, m), ordZ(b, n)), expl: 'ppcm des ordres.' }; }),
  quiz('c4q-k-cycles', 'Permutations', R => { const n = R.int(4, 8), k = R.int(2, n); return { stem: `Combien $S_{${n}}$ contient-il de $${k}$-cycles ?`, type: 'int', answer: Q.fact(n) / (Q.fact(n - k) * k), expl: '$\\binom nk(k-1)!$.' }; }),
  quiz('c4q-diedral', 'Groupe diédral', R => { const n = R.int(3, 20); return { stem: `Combien $D_{${n}}$ a-t-il d’éléments d’ordre 2 ?`, type: 'int', answer: n % 2 ? n : n + 1, expl: 'Les réflexions, plus le demi-tour si $n$ est pair.' }; }),
  quiz('c4q-noyau', 'Homomorphismes', R => { const n = R.int(4, 60), a = R.int(1, n - 1); return { stem: `Le noyau de $\\Z\\to\\Z/${n}\\Z$, $k\\mapsto\\cl{${a}k}$ est $m\\Z$ avec $m\\ge1$. Donner $m$.`, type: 'int', answer: ordZ(a, n), expl: '$m$ est l’ordre de $\\cl a$.' }; }),
);
