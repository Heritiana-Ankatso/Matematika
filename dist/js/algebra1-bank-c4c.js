// Algèbre 1, complement 4C (centre, conjugation, automorphisms, products of subgroups, group actions, Burnside,
// class equation, p-groups, Cauchy, Sylow, conjugation in S_n and A_n, simplicity of A_5): QCM and quiz generators.
import * as Q from './algebra1-qbank.js';
import { cycleText, symmetryGroup, burnsideTable } from './algebra1-model.js';
const { qcm, quiz, right: ok, wrong: no, single, fromPool, gcd, lcm, compose, inverse } = Q;

const PRIMES = [2, 3, 5, 7, 11, 13];
const cy = p => cycleText(p).replace(/ /g, '\\,').replace(/^id$/, '\\id');
const randPerm = (R, n) => R.shuffle([...Array(n).keys()]);
const nonId = (R, n) => { let p; do { p = randPerm(R, n); } while (p.every((y, i) => y === i)); return p; };
const type = p => { const seen = new Set(), L = []; for (let i = 0; i < p.length; i++) { if (seen.has(i)) continue; let k = 0, j = i; while (!seen.has(j)) { seen.add(j); j = p[j]; k++; } L.push(k); } return L.sort((a, b) => b - a); };
const classSize = L => { const n = L.reduce((a, b) => a + b, 0), m = {}; L.forEach(k => { m[k] = (m[k] || 0) + 1; }); return Q.fact(n) / Object.entries(m).reduce((a, [k, v]) => a * Number(k) ** v * Q.fact(v), 1); };
const partitions = n => [1, 1, 2, 3, 5, 7, 11, 15, 22][n];
const pPart = (N, p) => { let a = 0; while (N % p === 0) { N /= p; a++; } return [a, N]; };
const sylowOptions = (N, p) => { const [, m] = pPart(N, p); return Q.divisors(m).filter(d => d % p === 1 % p); };
const typeText = L => `(${L.join(',')})`;

const CLASS_EQ = [['S_3', 6, [1, 2, 3]], ['S_4', 24, [1, 3, 6, 6, 8]], ['A_4', 12, [1, 3, 4, 4]], ['D_4', 8, [1, 1, 2, 2, 2]], ['Q_8', 8, [1, 1, 2, 2, 2]], ['A_5', 60, [1, 12, 12, 15, 20]], ['D_5', 10, [1, 2, 2, 5]], ['D_6', 12, [1, 1, 2, 2, 3, 3]]];

export const ITEMS = [
  // ---------------------------------------------------------------- centre, conjugation, automorphisms
  qcm('c4c-centre-Dn', 'Centre', R => { const n = R.int(3, 12), z = n % 2 ? 1 : 2;
    return single(`Quel est l’ordre du centre de $D_{${n}}$ ?`, ok(z, n % 2 ? 'Centre trivial pour $n$ impair.' : `$\\ens{e,r^{${n / 2}}}$.`),
      [no(3 - z, n % 2 ? `Pas de demi-tour, ${n} est impair.` : 'Le demi-tour est central.'), no(n, '$\\langle r\\rangle$ n’est pas central.'), no(2 * n, '$D_n$ n’est pas abélien.')],
      '$r^k$ est central si et seulement si $n\\mid2k$ ; aucune réflexion n’est centrale.'); }),
  qcm('c4c-centres', 'Centre', R => fromPool(R, 'Lesquelles de ces affirmations sur des centres sont vraies ?', [
    [true, '$Z(S_n)=\\ens{\\id}$ pour $n\\ge3$', 'Exercice du complément.'], [true, '$Z(Q_8)=\\ens{\\pm I_2}$', 'Exemple du cours.'], [true, '$Z(\\GL_2(\\R))=\\R^*I_2$', 'Matrices scalaires.'], [true, '$Z(G)=G$ si $G$ est abélien', 'Définition.'],
    [false, '$Z(D_4)$ est trivial', '$r^2$ est central.'], [false, '$Z(S_2)$ est trivial', '$S_2$ est abélien d’ordre 2.'], [true, '$Z(G)$ est un sous-groupe normal', 'Proposition du cours.'], [false, '$Z(G)$ est toujours cyclique', '$Z$ d’un groupe abélien non cyclique.'],
  ], 'Le centre est l’ensemble des points fixes de la conjugaison.')),
  qcm('c4c-indice-centre', 'Centre', R => { const p = R.pick([2, 3, 5, 7]), a = R.int(3, 4), N = p ** a;
    return { stem: `$G$ est un groupe non abélien d’ordre $${N}=${p}^{${a}}$. Lesquelles de ces valeurs sont impossibles pour l’indice $[G:Z(G)]$ ?`, multi: true,
      choices: [[true, '$1$', 'Ce serait $Z(G)=G$ : $G$ abélien.'], [true, `$${p}$`, 'Un quotient $G/Z(G)$ d’ordre premier est cyclique, et $G$ serait abélien.'],
        [true, `$${N}$`, 'Le centre d’un $p$-groupe non trivial n’est pas trivial.'], [false, `$${p * p}$`, a === 3 ? `Réalisé : $\\abs{Z(G)}=${p}$ (par exemple $D_4$ ou $Q_8$ pour $p=2$).` : 'Réalisé, par exemple par $D_4\\times\\Z/2\\Z$ pour $p=2$.']],
      expl: 'Trois contraintes : $G$ non abélien (indice $\\neq1$), $G/Z(G)$ jamais cyclique non trivial (indice jamais premier), centre non trivial pour un $p$-groupe (indice $\\neq\\abs G$).' }; }),
  qcm('c4c-conjugues', 'Conjugaison', R => { const N = R.pick([24, 48, 60, 120, 36, 72]), c = R.pick(Q.divisors(N).filter(d => d > 1 && d < N));
    return single(`Dans un groupe d’ordre $${N}$, le centralisateur d’un élément $x$ est d’ordre $${c}$. Combien $x$ a-t-il de conjugués ?`, ok(N / c, `$[G:C_G(x)]=\\frac{${N}}{${c}}$.`),
      [no(c, 'C’est l’ordre du centralisateur.'), no(N - c, 'Ce n’est pas une différence.'), no(N, 'Trop.')].filter(x => x[1] !== String(N / c)),
      'Relation orbite-stabilisateur pour la conjugaison.'); }),
  qcm('c4c-normalisateur', 'Conjugaison', R => { const N = R.pick([24, 60, 120, 36, 168]), m = R.pick(Q.divisors(N).filter(d => d > 1 && d < N));
    return single(`Dans un groupe d’ordre $${N}$, un sous-groupe $H$ a un normalisateur d’ordre $${m}$. Combien $H$ a-t-il de conjugués ?`, ok(N / m, `$[G:N_G(H)]$.`),
      [no(m, 'C’est l’ordre du normalisateur.'), no(1, 'Seulement si $H$ est normal.'), no(N / m + 1, 'Recompter.')].filter(x => x[1] !== String(N / m)),
      'Les conjugués de $H$ forment l’orbite de $H$ sous la conjugaison, de stabilisateur $N_G(H)$.'); }),
  qcm('c4c-aut-Zn', 'Automorphismes', R => { const n = R.int(5, 40);
    return single(`Quel est l’ordre de $\\Aut(\\Z/${n}\\Z)$ ?`, ok(Q.phi(n), `$\\Aut(\\Z/${n}\\Z)\\simeq(\\Z/${n}\\Z)^\\times$.`),
      [no(n, 'Pas une permutation quelconque des éléments.'), no(n - 1, 'Seulement si $n$ est premier.'), no(Q.fact(n) > 1e6 ? n * n : Q.fact(n), 'Ce serait toutes les bijections.')].filter(x => x[1] !== String(Q.phi(n))),
      'Un automorphisme est déterminé par l’image d’un générateur, qui doit être un générateur.'); }),
  qcm('c4c-aut-pool', 'Automorphismes', R => fromPool(R, 'Lesquelles de ces affirmations sur les automorphismes sont vraies ?', [
    [true, '$\\Aut(\\Z)\\simeq\\Z/2\\Z$', '$\\pm\\Id$.'], [true, '$\\Aut(\\Z/2\\Z\\times\\Z/2\\Z)\\simeq S_3$', 'Permutations des trois éléments non nuls.'], [true, '$\\Aut(S_3)\\simeq S_3$', 'Tous intérieurs.'],
    [false, '$\\Aut(\\Z/8\\Z)$ est cyclique', '$(\\Z/8\\Z)^\\times$ est d’exposant 2.'], [true, '$\\Inn(G)\\simeq G/Z(G)$', 'Premier théorème.'], [true, '$\\Inn(G)$ est normal dans $\\Aut(G)$', '$\\varphi c_g\\varphi^{-1}=c_{\\varphi(g)}$.'],
    [false, '$\\Inn(G)=\\Aut(G)$ pour tout $G$', 'Pour $G$ abélien non trivial d’exposant $>2$, $x\\mapsto x^{-1}$ n’est pas intérieur.'], [true, '$\\Inn(G)$ est trivial si et seulement si $G$ est abélien', 'Noyau $Z(G)$.'],
  ], 'Automorphismes intérieurs et extérieurs.')),
  qcm('c4c-inn-Dn', 'Automorphismes', R => { const n = R.int(3, 10), o = n % 2 ? 2 * n : n;
    return single(`Quel est l’ordre de $\\Inn(D_{${n}})$ ?`, ok(o, `$\\abs{D_{${n}}}/\\abs{Z(D_{${n}})}=${2 * n}/${n % 2 ? 1 : 2}$.`),
      [no(2 * n, n % 2 ? 'Exact aussi' : 'Le centre n’est pas trivial.'), no(n, n % 2 ? 'Le centre est trivial.' : 'Exact aussi'), no(Q.phi(n) * n, 'C’est $\\abs{\\Aut(D_n)}$ pour $n\\ge3$, non demandé.')].filter(x => x[1] !== String(o)),
      '$\\Inn(G)\\simeq G/Z(G)$.'); }),
  // ---------------------------------------------------------------- products of subgroups
  qcm('c4c-HK', 'Produits', R => { const i = R.int(1, 6), h = i * R.int(1, 6), k = i * R.int(1, 6);
    return single(`$\\abs H=${h}$, $\\abs K=${k}$ et $\\abs{H\\cap K}=${i}$. Que vaut $\\abs{HK}$ ?`, ok(h * k / i, `$\\frac{${h}\\cdot${k}}{${i}}$.`),
      [no(h * k, 'Chaque élément est compté $\\abs{H\\cap K}$ fois.'), no(h + k - i, 'Ce n’est pas une réunion.'), no(lcm(h, k), 'Ce n’est pas un ppcm.')].filter(x => x[1] !== String(h * k / i)),
      '$\\abs{HK}=\\frac{\\abs H\\abs K}{\\abs{H\\cap K}}$, que $HK$ soit un sous-groupe ou non.'); }),
  qcm('c4c-HK-pool', 'Produits', R => fromPool(R, 'Soient $H,K<G$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$HK$ est un sous-groupe si et seulement si $HK=KH$', 'Proposition du cours.'], [true, 'Si $H\\lhd G$, $HK$ est un sous-groupe', '$KH=HK$.'], [false, '$HK$ est toujours un sous-groupe', 'Dans $S_3$, $\\langle(1\\,2)\\rangle\\langle(1\\,3)\\rangle$.'],
    [true, 'Si $H,K\\lhd G$, $H\\cap K=\\ens e$ et $HK=G$, alors $G\\simeq H\\times K$', 'Produit direct interne.'], [false, 'Si $H\\lhd G$, $H\\cap K=\\ens e$ et $HK=G$, alors $G\\simeq H\\times K$', '$S_3=A_3\\langle(1\\,2)\\rangle$.'],
    [true, 'Si $H,K\\lhd G$ et $H\\cap K=\\ens e$, $hk=kh$', 'Le commutateur est dans $H\\cap K$.'],
  ], 'Produits de sous-groupes, produit direct interne.')),
  // ---------------------------------------------------------------- actions
  qcm('c4c-actions', 'Actions', R => fromPool(R, 'Lesquelles de ces formules définissent une action (à gauche) de $G$ sur $X=G$ ?', [
    [true, '$g\\cdot x=gx$', 'Translation.'], [false, '$g\\cdot x=xg$', 'Action à droite.'], [true, '$g\\cdot x=xg^{-1}$', '$g\\cdot(h\\cdot x)=x(gh)^{-1}$.'], [true, '$g\\cdot x=gxg^{-1}$', 'Conjugaison.'],
    [false, '$g\\cdot x=g^{-1}xg$', 'Action à droite.'], [false, '$g\\cdot x=g^2x$', '$g^2h^2\\neq(gh)^2$ en général.'], [true, '$g\\cdot x=x$', 'Action triviale.'], [false, '$g\\cdot x=g$', '$e\\cdot x=e\\neq x$.'],
  ], 'Tester $e\\cdot x=x$ et $g\\cdot(h\\cdot x)=(gh)\\cdot x$.')),
  qcm('c4c-orbite', 'Actions', R => { const N = R.pick([12, 24, 36, 48, 60, 120]), s = R.pick(Q.divisors(N).filter(d => d < N));
    return single(`Un groupe d’ordre $${N}$ agit sur $X$ ; le stabilisateur de $x$ est d’ordre $${s}$. Combien d’éléments a l’orbite de $x$ ?`, ok(N / s, `$\\frac{${N}}{${s}}$.`),
      [no(s, 'C’est l’ordre du stabilisateur.'), no(N - s, 'Pas une différence.'), no(N * s, 'Pas un produit.')].filter(x => x[1] !== String(N / s)),
      'Orbite-stabilisateur : $\\abs{G\\cdot x}\\abs{G_x}=\\abs G$.'); }),
  qcm('c4c-orbites-possibles', 'Actions', R => { const N = R.pick([12, 15, 18, 20, 24, 30, 42]), bad = R.pick([...Array(N).keys()].map(x => x + 1).filter(x => N % x && x > 1));
    return single(`Un groupe d’ordre $${N}$ agit sur un ensemble fini. Laquelle de ces tailles d’orbite est impossible ?`, ok(bad, `${bad} ne divise pas ${N}.`),
      R.sample(Q.divisors(N), 3).map(d => no(d, `${d} divise ${N}.`)), 'Le cardinal d’une orbite divise l’ordre du groupe.'); }),
  qcm('c4c-point-fixe', 'Actions', R => { const N = R.pick([6, 8, 9, 10, 12, 15, 16, 21, 25, 27]), m = R.int(2, 12);
    const sizes = Q.divisors(N).filter(d => d > 1), reach = new Set([0]); for (let t = 0; t < m; t++) for (const s of [...reach]) for (const d of sizes) if (s + d <= m) reach.add(s + d);
    const forced = !reach.has(m);
    return single(`Un groupe d’ordre $${N}$ agit sur un ensemble à $${m}$ éléments. Y a-t-il forcément un point fixe ?`, ok(forced ? 'Oui' : 'Non', forced ? `${m} ne s’écrit pas comme somme de diviseurs $>1$ de ${N}.` : `${m} est somme de diviseurs $>1$ de ${N} : une action sans point fixe existe (union d’actions sur des classes).`),
      [no(forced ? 'Non' : 'Oui', 'Chercher à écrire $m$ comme somme de tailles d’orbite $>1$.'), no('Seulement si l’action est fidèle', 'La fidélité ne joue aucun rôle ici.'), no('Seulement si le groupe est abélien', 'Seules les tailles d’orbite possibles comptent.')],
      'Sans point fixe, $\\abs X$ est somme de diviseurs de $\\abs G$ strictement supérieurs à 1. Réciproquement, chaque diviseur $d$ est réalisé par l’action sur $G/H$ avec $[G:H]=d$ pour un groupe cyclique.'); }),
  qcm('c4c-p-fixe', 'Actions', R => { const p = R.pick([2, 3, 5, 7]), a = R.int(1, 4), m = R.int(2, 40), forced = m % p !== 0;
    return single(`Un groupe d’ordre $${p}^{${a}}$ agit sur un ensemble à $${m}$ éléments. Y a-t-il forcément un point fixe ?`, ok(forced ? 'Oui' : 'Non, pas forcément', forced ? `$\\abs{X^P}\\equiv${m}\\not\\equiv0\\pmod{${p}}$.` : `${m} est multiple de ${p} : $\\Z/${p}\\Z$ peut permuter circulairement des paquets de ${p}.`),
      [no(forced ? 'Non, pas forcément' : 'Oui', 'Lemme des points fixes d’un $p$-groupe.'), no('Oui, exactement un', 'Le lemme ne donne que la congruence.'), no('Seulement si l’action est fidèle', 'Sans rapport.')],
      'Lemme : $\\abs X\\equiv\\abs{X^P}\\pmod p$ pour un $p$-groupe $P$.'); }),
  qcm('c4c-actions-connues', 'Actions', R => fromPool(R, 'Lesquelles de ces affirmations sur des actions classiques sont vraies ?', [
    [true, 'Pour la conjugaison, les orbites sont les classes de conjugaison', 'Définition.'], [true, 'Pour la conjugaison, le stabilisateur de $x$ est $C_G(x)$', 'Définition.'], [true, 'Pour la conjugaison, les points fixes forment $Z(G)$', 'Définition.'],
    [true, 'L’action sur $G/H$ par translation est transitive', 'Toute classe est $g\\cdot H$.'], [false, 'L’action sur $G/H$ est toujours fidèle', 'Son noyau est $\\bigcap gHg^{-1}$.'], [true, 'L’action de $G$ sur lui-même par translation est fidèle', 'Cayley.'],
    [false, 'Les stabilisateurs de deux points d’une même orbite sont égaux', 'Ils sont conjugués.'], [true, '$\\GL_n(\\R)$ a deux orbites sur $\\R^n$', '$\\ens0$ et le reste.'],
  ], 'Actions à connaître.')),
  // ---------------------------------------------------------------- Burnside
  qcm('c4c-colliers', 'Burnside', R => { const n = R.int(3, 8), k = R.int(2, 3), T = burnsideTable(symmetryGroup('rotations', n), k);
    return single(`Combien de colliers de $${n}$ perles à $${k}$ couleurs, à rotation près ?`, ok(T.orbits, `$\\frac1{${n}}\\sum_{j}${k}^{\\pgcd(j,${n})}=\\frac{${T.total}}{${n}}$.`),
      [no(k ** n, 'Ce sont tous les coloriages.'), no(Math.ceil(k ** n / n), 'Diviser par $\\abs G$ suppose toutes les orbites de taille $n$.'), no(burnsideTable(symmetryGroup('dihedral', n), k).orbits, 'C’est le nombre de bracelets (retournements permis).')].filter(x => x[1] !== String(T.orbits)),
      'Formule de Burnside avec $\\abs{\\Fix(r^j)}=k^{\\pgcd(j,n)}$.'); }),
  qcm('c4c-bracelets', 'Burnside', R => { const n = R.int(3, 8), k = R.int(2, 3), T = burnsideTable(symmetryGroup('dihedral', n), k);
    return single(`Combien de bracelets de $${n}$ perles à $${k}$ couleurs (rotations et retournements) ?`, ok(T.orbits, `$\\frac{${T.total}}{${2 * n}}$.`),
      [no(burnsideTable(symmetryGroup('rotations', n), k).orbits, 'C’est le nombre de colliers : on a oublié les retournements.'), no(k ** n, 'Ce sont tous les coloriages.'), no(Math.ceil(k ** n / (2 * n)), 'Diviser par $\\abs G$ ne suffit pas.')].filter(x => x[1] !== String(T.orbits)),
      'Formule de Burnside sur $D_n$.'); }),
  qcm('c4c-cube', 'Burnside', R => { const k = R.int(2, 4), T = burnsideTable(symmetryGroup('cube', 6), k);
    return single(`Combien de coloriages des faces d’un cube avec $${k}$ couleurs, à rotation près ?`, ok(T.orbits, `$\\frac1{24}(k^6+3k^4+12k^3+8k^2)=\\frac{${T.total}}{24}$.`),
      [no(k ** 6, 'Tous les coloriages.'), no(Math.ceil(k ** 6 / 24), 'Les orbites n’ont pas toutes 24 éléments.'), no(T.orbits + k, 'Recompter.')].filter(x => x[1] !== String(T.orbits)),
      'Les 24 rotations : identité ; 6 quarts de tour ; 3 demi-tours d’axe de faces ; 8 rotations d’axe de diagonale ; 6 demi-tours d’axe d’arêtes.'); }),
  qcm('c4c-fix-rotation', 'Burnside', R => { const n = R.int(4, 12), j = R.int(1, n - 1), k = R.int(2, 4), c = gcd(j, n);
    return single(`La rotation de $${j}$ crans d’un collier de $${n}$ perles fixe combien de coloriages à $${k}$ couleurs ?`, ok(k ** c, `Elle a ${c} cycles sur les positions : $${k}^{${c}}$.`),
      [no(k, 'C’est le cas d’une rotation à un seul cycle.'), no(k ** (n / c), 'Il faut le nombre de cycles, pas leur longueur.'), no(k ** n, 'C’est l’identité.')].filter(x => x[1] !== String(k ** c)),
      'Un coloriage fixé est constant sur chaque cycle ; la rotation de $j$ crans a $\\pgcd(j,n)$ cycles.'); }),
  qcm('c4c-burnside-pool', 'Burnside', R => fromPool(R, 'Lesquelles de ces affirmations sur la formule de Burnside sont vraies ?', [
    [true, 'Nombre d’orbites $=\\frac1{\\abs G}\\sum_g\\abs{\\Fix(g)}$', 'Énoncé.'], [true, 'La preuve compte les couples $(g,x)$ avec $g\\cdot x=x$', 'Double comptage.'], [false, 'Nombre d’orbites $=\\frac{\\abs X}{\\abs G}$', 'Seulement si toutes les orbites ont $\\abs G$ éléments.'],
    [true, 'Elle donne une preuve du petit théorème de Fermat', 'Colliers de $p$ perles.'], [false, 'Elle ne vaut que pour les groupes abéliens', 'Pour tout groupe fini.'], [true, 'L’identité fixe tous les éléments de $X$', 'Terme $\\abs X$.'],
  ], 'Formule de Burnside (Cauchy, Frobenius).')),
  // ---------------------------------------------------------------- class equation and p-groups
  qcm('c4c-eq-classes', 'Équation aux classes', R => { const [name, N, cls] = R.pick(CLASS_EQ);
    const bad1 = cls.slice(); bad1[bad1.length - 1] += 1;
    const merged = [...cls.slice(0, -2), cls[cls.length - 2] + cls[cls.length - 1]];
    const big = cls.findIndex(x => x > 1), split = [...cls.slice(0, big), 1, cls[big] - 1, ...cls.slice(big + 1)];
    return single(`Laquelle de ces listes est l’équation aux classes de $${name}$ (ordre ${N}) ?`, ok(`$${N}=${cls.join('+')}$`, 'Les tailles divisent l’ordre, et les classes à un élément forment le centre.'),
      [no(`$${N + 1}=${bad1.join('+')}$`, 'La somme ne vaut pas l’ordre du groupe.'), no(`$${N}=${merged.join('+')}$`, 'Deux classes ont été fusionnées : ce ne sont pas les classes de ce groupe.'),
        no(`$${N}=${split.join('+')}$`, 'Une classe a été coupée : le centre de ce groupe n’a pas cette taille.')],
      'Les classes de conjugaison partitionnent $G$ ; chaque taille est $[G:C_G(x)]$, un diviseur de $\\abs G$.'); }),
  qcm('c4c-p-groupes', 'p-groupes', R => fromPool(R, 'Soit $P$ un $p$-groupe non trivial. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$Z(P)\\neq\\ens e$', 'Équation aux classes.'], [true, 'Si $\\abs P=p^2$, $P$ est abélien', 'Corollaire du cours.'], [false, 'Si $\\abs P=p^3$, $P$ est abélien', '$D_4$, $Q_8$.'],
    [true, '$P$ a un sous-groupe normal d’ordre $p^k$ pour chaque $p^k\\mid\\abs P$', 'Exercice du complément.'], [true, 'Tout élément de $P$ a pour ordre une puissance de $p$', 'Lagrange.'], [false, '$P$ est cyclique', '$\\Z/p\\Z\\times\\Z/p\\Z$.'],
    [true, 'Si $P$ n’est pas abélien d’ordre $p^3$, $\\abs{Z(P)}=p$', 'Exercice du complément.'],
  ], 'Centre d’un $p$-groupe et ses conséquences.')),
  qcm('c4c-ordre-p2', 'p-groupes', R => { const p = R.pick([2, 3, 5, 7, 11]);
    return single(`Combien y a-t-il de groupes d’ordre $${p * p}$, à isomorphisme près ?`, ok(2, `$\\Z/${p * p}\\Z$ et $\\Z/${p}\\Z\\times\\Z/${p}\\Z$.`),
      [no(1, 'Le second n’est pas cyclique.'), no(p, 'Tous sont abéliens, et il n’y en a que deux.'), no(3, 'Il n’y a pas de groupe non abélien d’ordre $p^2$.')],
      'Corollaire du cours : tout groupe d’ordre $p^2$ est abélien.'); }),
  qcm('c4c-cauchy', 'Cauchy', R => fromPool(R, 'Soit $G$ fini et $p$ premier divisant $\\abs G$. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$G$ a un élément d’ordre $p$', 'Théorème de Cauchy.'], [true, 'Le nombre d’éléments d’ordre $p$ est un multiple de $p-1$', 'Par sous-groupes d’ordre $p$.'], [false, '$G$ a un élément d’ordre $p^2$ si $p^2\\mid\\abs G$', '$\\Z/p\\Z\\times\\Z/p\\Z$.'],
    [true, 'Le nombre de solutions de $x^p=e$ est un multiple de $p$', 'Preuve de McKay.'], [false, '$G$ a un unique sous-groupe d’ordre $p$', '$S_3$ en a trois d’ordre 2.'], [true, 'Si tout élément a pour ordre une puissance de $p$, $G$ est un $p$-groupe', 'Cauchy pour un autre premier.'],
  ], 'Théorème de Cauchy (preuve de McKay).')),
  // ---------------------------------------------------------------- Sylow
  qcm('c4c-np', 'Sylow', R => { const N = R.pick([12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 56, 60, 63, 72, 84, 100, 105, 120, 132, 150, 200]), p = R.pick(PRIMES.filter(q => N % q === 0)), opts = sylowOptions(N, p), [a, m] = pPart(N, p);
    const fmt = L => `$${L.join(', ')}$`, wrongs = [Q.divisors(m), Q.divisors(N).filter(d => d % p === 1 % p), [1]].map(fmt).filter(t => t !== fmt(opts));
    return single(`Un groupe a pour ordre $${N}=${p}^{${a}}\\cdot${m}$. Quelles sont les valeurs de $n_{${p}}$ permises par le théorème de Sylow ?`, ok(fmt(opts), `Diviseurs de ${m} congrus à 1 modulo ${p}.`),
      wrongs.map((t, i) => no(t, ['On a oublié la congruence modulo $p$.', 'Il faut diviser $m$, pas $\\abs G$.', 'D’autres valeurs ne sont pas exclues par Sylow.'][i])),
      '$n_p\\mid m$ et $n_p\\equiv1\\pmod p$.'); }),
  qcm('c4c-sylow-normal', 'Sylow', R => { const N = R.pick([15, 20, 33, 35, 45, 51, 65, 77, 99, 12, 24, 60, 42, 56, 18]), p = R.pick(PRIMES.filter(q => N % q === 0)), forced = sylowOptions(N, p).length === 1;
    return single(`Dans tout groupe d’ordre $${N}$, le $${p}$-Sylow est-il forcément normal ?`, ok(forced ? 'Oui' : 'Non, pas forcément', forced ? `Seule la valeur $n_{${p}}=1$ est permise.` : `Sylow permet ${sylowOptions(N, p).join(', ')} pour $n_{${p}}$.`),
      [no(forced ? 'Non, pas forcément' : 'Oui', 'Lister les valeurs possibles de $n_p$.'), no('Oui, car un Sylow est toujours normal', 'Faux : $S_3$ a trois 2-Sylow.'), no('Seulement si le groupe est abélien', 'La condition vient de $n_p$.')],
      'Un $p$-Sylow est normal si et seulement si $n_p=1$. (Quand Sylow permet d’autres valeurs, il existe d’ailleurs souvent un groupe qui les réalise, mais pas toujours : il faut le vérifier.)'); }),
  qcm('c4c-pq', 'Sylow', R => { const ps = [2, 3, 5, 7, 11, 13, 17, 19, 23], p = R.pick(ps.slice(0, 5)), q = R.pick(ps.filter(x => x > p && p * x < 300)), cyc = (q - 1) % p !== 0;
    return single(`Tout groupe d’ordre $${p * q}=${p}\\cdot${q}$ est-il cyclique ?`, ok(cyc ? `Oui, car $${p}\\nmid${q}-1$` : `Non, car $${p}\\mid${q}-1$`, cyc ? 'Les deux Sylow sont normaux.' : 'Un groupe non abélien d’ordre $pq$ existe alors.'),
      [no(cyc ? `Non, car $${p}<${q}$` : `Oui, car $${p}$ et $${q}$ sont premiers`, 'Le critère est la divisibilité de $q-1$ par $p$.'), no('Oui, tout groupe d’ordre $pq$ est cyclique', '$S_3$, d’ordre $2\\cdot3$.'), no('Non, aucun groupe d’ordre $pq$ n’est cyclique', '$\\Z/pq\\Z$ en est un.')],
      'Exercice du complément : $p<q$, $n_q=1$ toujours ; si $p\\nmid q-1$, $n_p=1$ aussi et $G\\simeq\\Z/pq\\Z$.'); }),
  qcm('c4c-non-simples', 'Sylow', R => fromPool(R, 'Lesquelles de ces affirmations sont vraies ?', [
    [true, 'Aucun groupe d’ordre 12 n’est simple', 'Exercice : $n_3=4$ force $n_2=1$.'], [true, 'Aucun groupe d’ordre 30 n’est simple', 'Comptage des éléments.'], [true, 'Aucun groupe d’ordre 56 n’est simple', 'Comptage.'],
    [true, 'Aucun groupe d’ordre 200 n’est simple', '$n_5=1$.'], [false, 'Aucun groupe d’ordre 60 n’est simple', '$A_5$ est simple.'], [true, 'Tout groupe d’ordre 15 est cyclique', '$n_3=n_5=1$.'],
    [false, 'Tout groupe d’ordre 21 est cyclique', 'Groupe affine de $\\Z/7\\Z$ d’ordre 21.'], [true, 'Aucun groupe d’ordre $2n$, $n>1$ impair, n’est simple', 'Exercice : sous-groupe d’indice 2.'], [false, 'Un groupe simple est toujours abélien', '$A_5$.'],
  ], 'Méthode de Sylow : valeurs de $n_p$, puis comptage des éléments d’ordre premier.')),
  qcm('c4c-elements-ordre-p', 'Sylow', R => { const p = R.pick([3, 5, 7]), np = R.pick([1, p + 1, 2 * p + 1, 3 * p + 1]);
    return single(`Un groupe a $${np}$ sous-groupes d’ordre $${p}$. Combien a-t-il d’éléments d’ordre $${p}$ ?`, ok(np * (p - 1), `${np} sous-groupes, ${p - 1} éléments d’ordre ${p} chacun, sans recouvrement.`),
      [no(np * p, 'Le neutre est commun à tous.'), no(np, 'Chaque sous-groupe en contient $p-1$.'), no(np * (p - 1) + 1, 'Le neutre n’est pas d’ordre $p$.')].filter(x => x[1] !== String(np * (p - 1))),
      'Deux sous-groupes distincts d’ordre premier ne se rencontrent qu’en $e$.'); }),
  qcm('c4c-sylow-pool', 'Sylow', R => fromPool(R, 'Lesquelles de ces affirmations découlent des théorèmes de Sylow ?', [
    [true, 'Deux $p$-Sylow sont conjugués', 'Deuxième théorème.'], [true, 'Tout $p$-sous-groupe est contenu dans un $p$-Sylow', 'Deuxième théorème.'], [true, '$n_p=[G:N_G(P)]$', 'Orbite-stabilisateur.'],
    [false, 'Deux $p$-Sylow distincts se rencontrent en $\\ens e$', 'Faux dans $S_4$ : ils contiennent tous $V$.'], [true, 'Un $p$-sous-groupe normal est contenu dans tous les $p$-Sylow', 'Conjugaison.'], [false, '$n_p$ divise $\\abs G$ seulement', '$n_p$ divise même $m$.'],
    [false, 'Un groupe d’ordre $n$ a un sous-groupe de chaque ordre divisant $n$', '$A_4$ et l’ordre 6.'],
  ], 'Les trois théorèmes de Sylow.')),
  qcm('c4c-sylow-ordre', 'Sylow', R => { const N = R.pick([24, 36, 48, 60, 72, 80, 96, 100, 108, 120, 144, 160, 180, 200, 240]), p = R.pick(PRIMES.filter(q => N % q === 0)), [a] = pPart(N, p);
    return single(`Quel est l’ordre d’un $${p}$-Sylow d’un groupe d’ordre $${N}$ ?`, ok(p ** a, `La plus grande puissance de ${p} qui divise ${N}.`),
      [no(p, 'C’est un sous-groupe d’ordre $p$, pas forcément un Sylow.'), no(N / p ** a, 'C’est l’indice $m$.'), no(p ** (a + 1), `${p ** (a + 1)} ne divise pas ${N}.`)].filter(x => x[1] !== String(p ** a)),
      '$\\abs G=p^am$ avec $p\\nmid m$ ; un $p$-Sylow est d’ordre $p^a$.'); }),
  // ---------------------------------------------------------------- S_n, A_n
  qcm('c4c-conjugue-cycle', 'Conjugaison dans S_n', R => { const n = 6, s = nonId(R, n), k = R.int(2, 4), c = Q.permIdentity(n); const supp = R.sample([0, 1, 2, 3, 4, 5], k); supp.forEach((x, i) => { c[x] = supp[(i + 1) % k]; });
    const conj = compose(compose(s, c), inverse(s)), wrongSide = compose(compose(inverse(s), c), s);
    return single(`Dans $S_6$, avec $\\sigma=${cy(s)}$, que vaut $\\sigma${cy(c)}\\sigma^{-1}$ ?`, ok(`$${cy(conj)}$`, 'On remplace chaque $a_i$ par $\\sigma(a_i)$.'),
      [no(`$${cy(wrongSide)}$`, 'C’est $\\sigma^{-1}c\\sigma$ : on a appliqué $\\sigma^{-1}$ aux entrées.'), no(`$${cy(c)}$`, 'La conjugaison déplace le support.'), no(`$${cy(compose(s, c))}$`, 'Ce n’est pas un produit simple.')].filter(x => x[1] !== `$${cy(conj)}$`),
      '$\\sigma(a_1\\,\\cdots\\,a_k)\\sigma^{-1}=(\\sigma(a_1)\\,\\cdots\\,\\sigma(a_k))$.'); }),
  qcm('c4c-conjugues-Sn', 'Conjugaison dans S_n', R => { const n = 6, s = nonId(R, n), same = R() < 0.5; let t; do { t = nonId(R, n); } while ((String(type(t)) === String(type(s))) !== same && R() < 0.98);
    const c = String(type(t)) === String(type(s));
    return single(`Dans $S_6$, $${cy(s)}$ et $${cy(t)}$ sont-elles conjuguées ?`, ok(c ? 'Oui' : 'Non', `Types ${typeText(type(s))} et ${typeText(type(t))}.`),
      [no(c ? 'Non' : 'Oui', 'Comparer les types (longueurs des cycles, points fixes compris).'), no(c ? 'Non, car elles n’ont pas le même support' : 'Oui, car elles ont la même signature', c ? 'Le support change par conjugaison.' : 'La signature ne suffit pas.'), no(c ? 'Non, car elles ne commutent pas' : 'Oui, car elles sont dans le même groupe', 'Ce n’est pas le critère.')],
      'Dans $S_n$, conjuguées $\\iff$ même type.'); }),
  qcm('c4c-classe-Sn', 'Conjugaison dans S_n', R => { const n = R.int(4, 7), s = nonId(R, n), L = type(s), c = classSize(L);
    return single(`Combien d’éléments a la classe de conjugaison de $${cy(s)}$ dans $S_{${n}}$ ?`, ok(c, `Type ${typeText(L)} : $\\frac{n!}{\\prod_kk^{m_k}m_k!}$.`),
      [no(Q.fact(n) / c, 'C’est l’ordre du centralisateur.'), no(Q.fact(n), 'C’est l’ordre de $S_n$.'), no(c * 2, 'Recompter les symétries de l’écriture.')].filter(x => x[1] !== String(c)),
      'Exercice du complément : taille d’une classe de $S_n$ selon le type.'); }),
  qcm('c4c-partitions', 'Conjugaison dans S_n', R => { const n = R.int(3, 8);
    return single(`Combien $S_{${n}}$ a-t-il de classes de conjugaison ?`, ok(partitions(n), `Autant que de partitions de ${n}.`),
      [no(n, 'Pas une par longueur de cycle.'), no(Q.fact(n), 'C’est l’ordre du groupe.'), no(2 ** (n - 1), 'C’est le nombre de compositions (sommes ordonnées).')].filter(x => x[1] !== String(partitions(n))),
      'Classes de $S_n$ = types = partitions de $n$ : 3, 5, 7, 11, 15, 22 pour $n=3,\\dots,8$.'); }),
  qcm('c4c-An-split', 'Classes de A_n', R => fromPool(R, 'Lesquelles de ces classes de $S_n$ se coupent en deux classes de $A_n$ ?', [
    [true, 'les 5-cycles de $S_5$, dans $A_5$', 'Centralisateur $\\langle c\\rangle\\subset A_5$.'], [false, 'les 3-cycles de $S_5$, dans $A_5$', '$(4\\,5)$ commute avec $(1\\,2\\,3)$.'], [true, 'les 3-cycles de $S_4$, dans $A_4$', 'Centralisateur $\\langle c\\rangle\\subset A_4$.'],
    [false, 'les doubles transpositions de $S_4$, dans $A_4$', '$(1\\,2)$ commute avec $(1\\,2)(3\\,4)$.'], [false, 'les doubles transpositions de $S_5$, dans $A_5$', '$(1\\,2)$ commute avec $(1\\,2)(3\\,4)$.'], [true, 'les 3-cycles de $S_3$, dans $A_3$', '$A_3$ est abélien : classes à un élément.'],
  ], 'La classe se coupe si et seulement si le centralisateur dans $S_n$ est contenu dans $A_n$.')),
  qcm('c4c-A5', 'Classes de A_n', R => fromPool(R, 'Lesquelles de ces affirmations sur $A_5$ sont vraies ?', [
    [true, 'Ses classes ont pour tailles 1, 12, 12, 15, 20', 'Théorème du cours.'], [true, '$A_5$ est simple', 'Aucune réunion de classes contenant 1 n’a un cardinal divisant 60, sauf 1 et 60.'], [true, '$n_5(A_5)=6$', '24 éléments d’ordre 5.'],
    [false, '$A_5$ a un sous-groupe d’ordre 30', 'Il serait normal.'], [false, '$A_5$ a un sous-groupe d’ordre 15', 'Il serait cyclique.'], [true, '$A_5$ a un sous-groupe d’ordre 12', '$A_4$.'], [true, '$A_5$ a un sous-groupe d’ordre 10', '$D_5$.'],
    [false, '$A_5$ a un élément d’ordre 6', 'Ordres possibles : 1, 2, 3, 5.'],
  ], 'Simplicité de $A_5$ et sous-groupes.')),
  qcm('c4c-commutateur', 'Groupe dérivé', R => { const n = 4, s = nonId(R, n), t = nonId(R, n), c = compose(compose(s, t), compose(inverse(s), inverse(t)));
    return single(`Dans $S_4$, calculer le commutateur $[\\sigma,\\tau]=\\sigma\\tau\\sigma^{-1}\\tau^{-1}$ pour $\\sigma=${cy(s)}$ et $\\tau=${cy(t)}$.`, ok(`$${cy(c)}$`, 'Appliquer de droite à gauche : $\\tau^{-1}$, $\\sigma^{-1}$, $\\tau$, $\\sigma$.'),
      [no(`$${cy(compose(compose(t, s), compose(inverse(t), inverse(s))))}$`, 'C’est $[\\tau,\\sigma]=[\\sigma,\\tau]^{-1}$.'), no(`$${cy(compose(s, t))}$`, 'C’est seulement $\\sigma\\tau$.'), no(`$\\id$`, 'Seulement si $\\sigma$ et $\\tau$ commutent.')].filter(x => x[1] !== `$${cy(c)}$`),
      'Un commutateur est toujours pair : $[S_n,S_n]\\subset A_n$.'); }),
  qcm('c4c-derive', 'Groupe dérivé', R => fromPool(R, 'Lesquelles de ces égalités sont vraies ?', [
    [true, '$D(S_n)=A_n$ pour $n\\ge3$', '3-cycles commutateurs.'], [true, '$D(A_4)=V$', 'Seul sous-groupe normal non trivial contenu dans $V$.'], [true, '$D(Q_8)=\\ens{\\pm I_2}$', '$[\\mathbf i,\\mathbf j]=-I_2$.'],
    [true, '$D(G)=\\ens e$ si $G$ est abélien', 'Tous les commutateurs valent $e$.'], [false, '$D(S_3)=S_3$', '$D(S_3)=A_3$.'], [true, '$G/D(G)$ est abélien', 'Exercice.'], [false, '$D(G)$ est toujours abélien', '$D(S_5)=A_5$.'],
  ], 'Groupe dérivé : le plus petit sous-groupe normal à quotient abélien.')),
  qcm('c4c-plus-petit-premier', 'Actions', R => { const N = R.pick([15, 21, 33, 35, 45, 55, 63, 75, 77, 91, 105]), p = Math.min(...PRIMES.filter(q => N % q === 0)), other = PRIMES.filter(q => N % q === 0 && q > p)[0] || p;
    const ask = R() < 0.6 ? p : other, forced = ask === p;
    return single(`$G$ est d’ordre $${N}$ et $H$ est un sous-groupe d’indice $${ask}$. $H$ est-il forcément normal ?`, ok(forced ? 'Oui' : 'Pas d’après ce critère', forced ? `${p} est le plus petit premier divisant ${N}.` : `${ask} n’est pas le plus petit premier divisant ${N} : le corollaire ne s’applique pas (il faudrait un autre argument).`),
      [no(forced ? 'Pas d’après ce critère' : 'Oui', 'Comparer l’indice au plus petit premier divisant $\\abs G$.'), no('Seulement si l’indice vaut 2', 'Le cas $p=2$ n’est qu’un cas particulier.'), no('Non, jamais', 'Faux : le critère s’applique parfois.')],
      'Corollaire : un sous-groupe d’indice égal au plus petit premier divisant $\\abs G$ est normal.'); }),
  qcm('c4c-ordre8', 'p-groupes', R => fromPool(R, 'Lesquelles de ces affirmations sur les groupes d’ordre 8 sont vraies ?', [
    [true, 'Il y en a cinq à isomorphisme près', 'Exercice du complément.'], [true, 'Trois sont abéliens', '$\\Z/8\\Z$, $\\Z/4\\Z\\times\\Z/2\\Z$, $(\\Z/2\\Z)^3$.'], [true, '$D_4$ et $Q_8$ ne sont pas isomorphes', 'Éléments d’ordre 2 : 5 contre 1.'],
    [false, '$Q_8$ est isomorphe à un sous-groupe de $D_4$', 'Même ordre : il faudrait l’isomorphisme.'], [true, '$Q_8$ a un unique élément d’ordre 2', '$-I_2$.'], [false, 'Tout groupe d’ordre 8 a un élément d’ordre 4', '$(\\Z/2\\Z)^3$.'],
  ], 'Classification des groupes d’ordre 8.')),
];

// ---------------------------------------------------------------- quizzes
ITEMS.push(
  quiz('c4cq-conjugue', 'Conjugaison dans S_n', R => { const n = 7, s = nonId(R, n), c = Q.permIdentity(n), k = R.int(3, 5), supp = R.sample([...Array(n).keys()], k); supp.forEach((x, i) => { c[x] = supp[(i + 1) % k]; });
    return { stem: `Dans $S_7$, calculer $\\sigma c\\sigma^{-1}$ pour $\\sigma=${cy(s)}$ et $c=${cy(c)}$.`, type: 'perm', n, answer: compose(compose(s, c), inverse(s)), expl: 'Remplacer chaque entrée $a$ du cycle par $\\sigma(a)$.' }; }),
  quiz('c4cq-classe', 'Conjugaison dans S_n', R => { const n = R.int(4, 8), s = nonId(R, n); return { stem: `Combien d’éléments a la classe de conjugaison de $${cy(s)}$ dans $S_{${n}}$ ?`, type: 'int', answer: classSize(type(s)), expl: '$\\frac{n!}{\\prod_kk^{m_k}m_k!}$.' }; }),
  quiz('c4cq-centralisateur', 'Conjugaison dans S_n', R => { const n = R.int(4, 8), s = nonId(R, n); return { stem: `Quel est l’ordre du centralisateur de $${cy(s)}$ dans $S_{${n}}$ ?`, type: 'int', answer: Q.fact(n) / classSize(type(s)), expl: '$\\prod_kk^{m_k}m_k!$ (orbite-stabilisateur).' }; }),
  quiz('c4cq-colliers', 'Burnside', R => { const n = R.int(3, 10), k = R.int(2, 4); return { stem: `Combien de colliers de $${n}$ perles à $${k}$ couleurs, à rotation près ?`, type: 'int', answer: burnsideTable(symmetryGroup('rotations', n), k).orbits, expl: '$\\frac1n\\sum_{j=0}^{n-1}k^{\\pgcd(j,n)}$.' }; }),
  quiz('c4cq-bracelets', 'Burnside', R => { const n = R.int(3, 9), k = R.int(2, 3); return { stem: `Combien de bracelets de $${n}$ perles à $${k}$ couleurs (rotations et retournements) ?`, type: 'int', answer: burnsideTable(symmetryGroup('dihedral', n), k).orbits, expl: 'Burnside sur $D_n$, en distinguant les axes des réflexions selon la parité de $n$.' }; }),
  quiz('c4cq-cube', 'Burnside', R => { const k = R.int(2, 6); return { stem: `Combien de coloriages des faces d’un cube avec $${k}$ couleurs, à rotation près ?`, type: 'int', answer: burnsideTable(symmetryGroup('cube', 6), k).orbits, expl: '$\\frac1{24}(k^6+3k^4+12k^3+8k^2)$.' }; }),
  quiz('c4cq-orbite', 'Actions', R => { const N = R.pick([24, 48, 60, 120, 72]), s = R.pick(Q.divisors(N)); return { stem: `Un groupe d’ordre $${N}$ agit ; un stabilisateur est d’ordre $${s}$. Combien d’éléments a l’orbite correspondante ?`, type: 'int', answer: N / s, expl: 'Orbite-stabilisateur.' }; }),
  quiz('c4cq-np', 'Sylow', R => { const N = R.pick([12, 20, 24, 30, 36, 40, 42, 48, 56, 60, 72, 84, 90, 100, 105, 120, 132, 168]), p = R.pick(PRIMES.filter(q => N % q === 0));
    return { stem: `Donner l’ensemble des valeurs de $n_{${p}}$ permises par Sylow pour un groupe d’ordre $${N}$.`, type: 'set', answer: sylowOptions(N, p), expl: 'Diviseurs de $m$ congrus à 1 modulo $p$.' }; }),
  quiz('c4cq-HK', 'Produits', R => { const i = R.int(1, 8), h = i * R.int(1, 7), k = i * R.int(1, 7); return { stem: `$\\abs H=${h}$, $\\abs K=${k}$, $\\abs{H\\cap K}=${i}$. Donner $\\abs{HK}$.`, type: 'int', answer: h * k / i, expl: '$\\frac{\\abs H\\abs K}{\\abs{H\\cap K}}$.' }; }),
  quiz('c4cq-centre-Dn', 'Centre', R => { const n = R.int(3, 30); return { stem: `Donner l’ordre du centre de $D_{${n}}$.`, type: 'int', answer: n % 2 ? 1 : 2, expl: 'Trivial pour $n$ impair, $\\ens{e,r^{n/2}}$ pour $n$ pair.' }; }),
  quiz('c4cq-ordre-p', 'Sylow', R => { const p = R.pick([3, 5, 7, 11]), np = 1 + p * R.int(0, 4); return { stem: `Un groupe a $${np}$ sous-groupes d’ordre $${p}$. Combien a-t-il d’éléments d’ordre $${p}$ ?`, type: 'int', answer: np * (p - 1), expl: '$n_p(p-1)$.' }; }),
  quiz('c4cq-partitions', 'Conjugaison dans S_n', R => { const n = R.int(3, 8); return { stem: `Combien $S_{${n}}$ a-t-il de classes de conjugaison ?`, type: 'int', answer: partitions(n), expl: 'Le nombre de partitions de $n$.' }; }),
  quiz('c4cq-commutateur', 'Groupe dérivé', R => { const s = nonId(R, 5), t = nonId(R, 5); return { stem: `Dans $S_5$, calculer $\\sigma\\tau\\sigma^{-1}\\tau^{-1}$ pour $\\sigma=${cy(s)}$ et $\\tau=${cy(t)}$.`, type: 'perm', n: 5, answer: compose(compose(s, t), compose(inverse(s), inverse(t))), expl: 'De droite à gauche.' }; }),
  quiz('c4cq-aut', 'Automorphismes', R => { const n = R.int(5, 60); return { stem: `Donner l’ordre de $\\Aut(\\Z/${n}\\Z)$.`, type: 'int', answer: Q.phi(n), expl: '$\\varphi(n)$.' }; }),
  quiz('c4cq-sylow-ordre', 'Sylow', R => { const N = R.pick([48, 72, 96, 120, 144, 180, 240, 360, 720]), p = R.pick([2, 3, 5].filter(q => N % q === 0)); return { stem: `Quel est l’ordre d’un $${p}$-Sylow d’un groupe d’ordre $${N}$ ?`, type: 'int', answer: p ** pPart(N, p)[0], expl: 'Plus grande puissance de $p$ divisant l’ordre.' }; }),
);
