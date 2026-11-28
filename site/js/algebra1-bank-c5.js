// Algèbre 1, chapter 5 (rings, units, integral domains, fields, ideals, quotients, prime and maximal ideals, ring
// homomorphisms, Chinese remainder theorem, K[X]/(P)): QCM and quiz generators. Roots and irreducibility over Z/pZ
// are found by trying every element, never typed.
import * as Q from './algebra1-qbank.js';
const { qcm, quiz, right: ok, wrong: no, single, fromPool, gcd, lcm, mod } = Q;

const evalMod = (c, x, p) => c.reduce((acc, a) => mod(acc * x + a, p), 0); // c from the highest degree
const roots = (c, p) => [...Array(p).keys()].filter(x => evalMod(c, x, p) === 0);
const ptex = (c, v = 'X') => Q.poly(c, v);
const primeFactors = n => { const f = []; for (let q = 2; q <= n; q++) if (n % q === 0 && Q.isPrime(q)) f.push(q); return f; };
const rad = n => primeFactors(n).reduce((a, b) => a * b, 1);
const crt = (a, m, b, n) => { for (let x = 0; x < m * n; x++) if (mod(x - a, m) === 0 && mod(x - b, n) === 0) return x; return null; };
const zi = (a, b) => (b === 0 ? `${a}` : a === 0 ? `${b === 1 ? '' : b === -1 ? '-' : b}i` : `${a}${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}i`);

export const ITEMS = [
  // ---------------------------------------------------------------- rings, units, fields
  qcm('c5-anneaux', 'Anneaux', R => fromPool(R, 'Lesquels de ces ensembles, avec les opérations usuelles, sont des anneaux (avec unité) ?', [
    [true, '$\\Z[i]$', 'Sous-anneau de $\\C$.'], [false, '$2\\Z$', 'Pas d’élément unité.'], [true, '$\\Mat_2(\\R)$', 'Anneau non commutatif.'], [true, '$\\Z/n\\Z$', 'Anneau quotient.'],
    [false, '$\\N$', 'Pas d’opposés.'], [true, '$\\R[X]$', 'Anneau de polynômes.'], [true, '$\\Z\\times\\Z$', 'Produit d’anneaux.'], [false, 'les entiers impairs', 'Pas stable par addition.'],
    [true, '$\\ens{\\frac a{2^k}\\mid a\\in\\Z,k\\in\\N}$', 'Stable par somme et produit, contient 1.'], [false, '$\\ens{a+b\\sqrt2\\mid a,b\\in\\N}$', 'Pas d’opposés.'],
  ], 'Anneau : groupe abélien pour $+$, monoïde pour $\\times$, distributivité.')),
  qcm('c5-corps', 'Anneaux', R => fromPool(R, 'Lesquels de ces anneaux sont des corps ?', [
    [true, '$\\Z/7\\Z$', '7 premier.'], [false, '$\\Z/8\\Z$', '$\\cl2$ non inversible.'], [true, '$\\Q$', 'Évident.'], [false, '$\\Z$', '$2$ non inversible.'], [false, '$\\Z[i]$', '$2$ non inversible.'],
    [true, '$\\Q(\\sqrt2)=\\ens{a+b\\sqrt2\\mid a,b\\in\\Q}$', '$\\frac1{a+b\\sqrt2}=\\frac{a-b\\sqrt2}{a^2-2b^2}$.'], [true, '$\\R[X]/(X^2+1)$', 'Isomorphe à $\\C$.'], [false, '$\\R[X]/(X^2-1)$', '$(\\cl X-1)(\\cl X+1)=0$.'],
    [false, '$\\R[X]$', '$X$ non inversible.'], [true, '$(\\Z/2\\Z)[X]/(X^2+X+1)$', 'Corps à 4 éléments.'], [false, '$\\Z\\times\\Z$', 'Diviseurs de zéro.'],
  ], 'Un corps : anneau commutatif où tout élément non nul est inversible ; $\\Z/n\\Z$ est un corps exactement quand $n$ est premier.')),
  qcm('c5-integres', 'Anneaux', R => fromPool(R, 'Lesquels de ces anneaux sont intègres ?', [
    [true, '$\\Z[i]$', 'Sous-anneau de $\\C$.'], [false, '$\\Z/12\\Z$', '$\\cl3\\cdot\\cl4=\\cl0$.'], [true, '$\\R[X]$', '$\\R$ intègre.'], [false, '$\\Z\\times\\Z$', '$(1,0)(0,1)=0$.'],
    [false, '$\\Mat_2(\\R)$', 'Diviseurs de zéro (et non commutatif).'], [true, '$\\Z/13\\Z$', 'Corps.'], [true, '$\\Z[X]$', '$\\Z$ intègre.'], [false, '$(\\Z/6\\Z)[X]$', '$\\cl2\\cdot\\cl3=\\cl0$.'],
    [false, '$\\R[X]/(X^2)$', '$\\cl X^2=0$ avec $\\cl X\\neq0$.'], [true, '$\\Q[X]/(X^2-2)$', '$X^2-2$ irréductible sur $\\Q$ : corps.'],
  ], 'Intègre : commutatif, non nul, sans diviseur de zéro.')),
  qcm('c5-inversibles-Zn', 'Inversibles', R => { const n = R.int(8, 60);
    return single(`Combien d’éléments inversibles a l’anneau $\\Z/${n}\\Z$ ?`, ok(Q.phi(n), `$\\varphi(${n})$.`),
      [no(n - 1, 'Seulement si $n$ est premier.'), no(n - Q.phi(n), 'C’est le nombre de non-inversibles.'), no(Q.divisors(n).length, 'C’est le nombre d’idéaux.')].filter(x => x[1] !== String(Q.phi(n))),
      'Inversible $\\iff\\pgcd(a,n)=1$ (Bézout).'); }),
  qcm('c5-inverse', 'Inversibles', R => { let n, a; do { n = R.int(9, 50); a = R.int(2, n - 2); } while (gcd(a, n) !== 1); const u = Q.inverseMod(a, n);
    return single(`Quel est l’inverse de $\\cl{${a}}$ dans l’anneau $\\Z/${n}\\Z$ ?`, ok(`$\\cl{${u}}$`, `$${a}\\cdot${u}\\equiv1$.`),
      [no(`$\\cl{${n - a}}$`, 'C’est l’opposé.'), no(`$\\cl{${n - u}}$`, 'C’est $-u$.'), no(`$\\cl{${mod(u + 1, n)}}$`, 'Décalage d’un cran.')], 'Euclide étendu.'); }),
  qcm('c5-produit-anneaux', 'Inversibles', R => { let m, n; do { m = R.int(3, 15); n = R.int(3, 15); } while (m === n);
    return single(`Combien d’éléments inversibles a l’anneau $\\Z/${m}\\Z\\times\\Z/${n}\\Z$ ?`, ok(Q.phi(m) * Q.phi(n), `$(a,b)$ inversible $\\iff a$ et $b$ inversibles : $\\varphi(${m})\\varphi(${n})$.`),
      [no(Q.phi(m) + Q.phi(n), 'C’est une somme, il faut un produit.'), no(Q.phi(m * n), gcd(m, n) === 1 ? 'Exact aussi' : 'Les anneaux ne sont pas isomorphes ici.'), no(m * n - 1, 'Ce n’est pas un corps.')].filter(x => x[1] !== String(Q.phi(m) * Q.phi(n))),
      '$(A\\times B)^\\times=A^\\times\\times B^\\times$.'); }),
  qcm('c5-nilpotents', 'Inversibles', R => { const n = R.pick([4, 8, 9, 12, 16, 18, 20, 24, 25, 27, 36, 50, 72]), c = n / rad(n);
    return single(`Combien d’éléments nilpotents ($x^k=0$ pour un $k\\ge1$) a $\\Z/${n}\\Z$ ?`, ok(c, `Les multiples de $${rad(n)}$, produit des premiers divisant ${n}.`),
      [no(n - Q.phi(n), 'Ce sont les non-inversibles.'), no(1, `Il y en a d’autres que $\\cl0$ : $\\cl{${rad(n)}}$ par exemple.`), no(rad(n), 'C’est le produit des premiers, pas le nombre de multiples.')].filter(x => x[1] !== String(c)),
      '$\\cl x$ est nilpotent si et seulement si chaque premier divisant $n$ divise $x$.'); }),
  qcm('c5-idempotents', 'Inversibles', R => { const n = R.pick([6, 10, 12, 15, 18, 20, 21, 30, 35, 42, 60, 105]), c = 2 ** primeFactors(n).length;
    return single(`Combien d’éléments $e$ de $\\Z/${n}\\Z$ vérifient $e^2=e$ ?`, ok(c, `Théorème chinois : $e\\equiv0$ ou $1$ modulo chaque puissance de premier, ${primeFactors(n).length} premiers.`),
      [no(2, 'Il y en a d’autres que $\\cl0$ et $\\cl1$.'), no(primeFactors(n).length, 'Il faut $2^{\\omega(n)}$.'), no(Q.divisors(n).length, 'Ce n’est pas le nombre de diviseurs.')].filter(x => x[1] !== String(c)),
      'Idempotents de $\\Z/n\\Z$ : $2^{\\omega(n)}$, où $\\omega(n)$ est le nombre de facteurs premiers distincts.'); }),
  qcm('c5-gauss', 'Inversibles', R => { const a = R.int(-5, 5), b = R.int(-5, 5);
    return single(`Quelle est la norme $N(${zi(a, b)})=a^2+b^2$ dans $\\Z[i]$, et cet élément est-il inversible ?`, ok(`$${a * a + b * b}$, ${a * a + b * b === 1 ? 'inversible' : 'non inversible'}`, 'Inversible $\\iff N=1$.'),
      [no(`$${a * a + b * b}$, ${a * a + b * b === 1 ? 'non inversible' : 'inversible'}`, 'Inversible exactement quand la norme vaut 1.'), no(`$${a + b}$, non inversible`, 'La norme est $a^2+b^2$.'), no(`$${a * a - b * b}$, non inversible`, 'Signe : $a^2+b^2$.')],
      '$N(zw)=N(z)N(w)$ ; $zw=1$ force $N(z)=1$ ; donc $\\Z[i]^\\times=\\ens{\\pm1,\\pm i}$.'); }),
  qcm('c5-AX', 'Polynômes', R => fromPool(R, 'Lesquelles de ces affirmations sur les anneaux de polynômes sont vraies ?', [
    [true, 'Si $A$ est intègre, $\\deg(PQ)=\\deg P+\\deg Q$', 'Coefficients dominants non nuls.'], [true, 'Si $A$ est intègre, $(A[X])^\\times=A^\\times$', 'Degrés.'], [false, 'Dans $(\\Z/4\\Z)[X]$, les inversibles sont les constantes inversibles', '$(1+2X)^2=1$.'],
    [false, 'Dans $(\\Z/6\\Z)[X]$, $\\deg(PQ)=\\deg P+\\deg Q$', '$(2X+1)(3X+1)=5X+1$.'], [true, '$\\K[X]$ est principal', 'Division euclidienne.'], [false, '$\\Z[X]$ est principal', '$(2,X)$ n’est pas principal.'],
    [true, '$\\K[X]^\\times=\\K^*$', 'Degrés.'], [false, '$\\R[X,Y]$ est principal', '$(X,Y)$.'],
  ], 'Intégrité et degrés dans $A[X]$.')),
  // ---------------------------------------------------------------- ideals
  qcm('c5-ideaux', 'Idéaux', R => fromPool(R, 'Lesquelles de ces parties sont des idéaux de l’anneau indiqué ?', [
    [true, '$6\\Z$ dans $\\Z$', 'Idéal principal.'], [false, '$\\Z$ dans $\\Q$', '$\\frac12\\cdot1\\notin\\Z$.'], [true, '$\\ens0$ dans tout anneau', 'Idéal nul.'], [true, '$(X)$ dans $\\Z[X]$', 'Polynômes sans terme constant.'],
    [true, 'les polynômes de $\\Z[X]$ à terme constant pair', 'C’est $(2,X)$.'], [false, '$\\R_2[X]$ dans $\\R[X]$', '$X\\cdot X^2$ sort.'], [false, '$\\N$ dans $\\Z$', 'Pas un sous-groupe.'], [false, '$\\Z$ dans $\\Z[i]$', '$i\\cdot1\\notin\\Z$.'],
    [true, '$\\ens{\\cl0,\\cl3,\\cl6,\\cl9}$ dans $\\Z/12\\Z$', '$(\\cl3)$.'], [false, 'les matrices de rang 1 dans $\\Mat_2(\\R)$', 'Pas même un sous-groupe additif.'],
  ], 'Idéal : sous-groupe additif stable par multiplication par tout élément de l’anneau.')),
  qcm('c5-somme-ideaux', 'Idéaux', R => { const a = R.int(4, 50), b = R.int(4, 50), which = R.pick(['+', '∩', '·']), val = { '+': gcd(a, b), '∩': lcm(a, b), '·': a * b }[which];
    const stem = { '+': `(${a})+(${b})`, '∩': `(${a})\\cap(${b})`, '·': `(${a})(${b})` }[which];
    return single(`Dans $\\Z$, que vaut l’idéal $${stem}$ ?`, ok(`$(${val})$`, { '+': 'Bézout : $(\\pgcd)$.', '∩': 'Multiples communs : $(\\ppcm)$.', '·': 'Produit des générateurs.' }[which]),
      [no(`$(${gcd(a, b)})$`, 'C’est la somme.'), no(`$(${lcm(a, b)})$`, 'C’est l’intersection.'), no(`$(${a * b})$`, 'C’est le produit.'), no(`$(${a + b})$`, 'Ce n’est pas la somme des générateurs.')].filter(x => x[1] !== `$(${val})$`).slice(0, 3),
      'Dans $\\Z$ : $(a)+(b)=(\\pgcd)$, $(a)\\cap(b)=(\\ppcm)$, $(a)(b)=(ab)$.'); }),
  qcm('c5-ideaux-Zn', 'Idéaux', R => { const n = R.int(6, 100);
    return single(`Combien l’anneau $\\Z/${n}\\Z$ a-t-il d’idéaux ?`, ok(Q.divisors(n).length, `Un par diviseur de ${n}.`),
      [no(Q.phi(n), 'C’est le nombre d’inversibles.'), no(2, 'Seulement si $n$ est premier.'), no(n, 'Trop.')].filter(x => x[1] !== String(Q.divisors(n).length)),
      'Les idéaux de $\\Z/n\\Z$ sont les $(\\cl d)$, $d\\mid n$ ; ce sont aussi ses sous-groupes.'); }),
  qcm('c5-ideaux-pool', 'Idéaux', R => fromPool(R, 'Lesquelles de ces affirmations sur les idéaux sont vraies ?', [
    [true, 'Un idéal qui contient $1$ est l’anneau entier', '$a=a\\cdot1$.'], [true, 'Un idéal qui contient un inversible est l’anneau entier', 'Il contient $u^{-1}u=1$.'], [true, 'Un corps n’a que deux idéaux', '$\\ens0$ et lui-même.'],
    [false, 'Un sous-anneau est un idéal', 'Il contient 1.'], [true, 'Le noyau d’un homomorphisme d’anneaux est un idéal', 'Proposition du cours.'], [false, 'L’image d’un homomorphisme d’anneaux est un idéal', '$\\Z\\subset\\Q$.'],
    [true, 'Une intersection d’idéaux est un idéal', 'Critère.'], [false, 'Une réunion de deux idéaux est un idéal', '$(2)\\cup(3)$.'],
  ], 'Idéaux, sommes, intersections.')),
  qcm('c5-associes', 'Divisibilité', R => fromPool(R, 'Lesquelles de ces paires engendrent le même idéal ?', [
    [true, '$6$ et $-6$ dans $\\Z$', 'Associés.'], [false, '$2$ et $4$ dans $\\Z$', '$(4)\\subsetneq(2)$.'], [true, '$X-1$ et $3X-3$ dans $\\Q[X]$', '$3$ est inversible dans $\\Q$.'], [false, '$X-1$ et $3X-3$ dans $\\Z[X]$', '$3$ n’est pas inversible dans $\\Z$.'],
    [true, '$1+i$ et $1-i$ dans $\\Z[i]$', '$1-i=-i(1+i)$.'], [false, '$2$ et $1+i$ dans $\\Z[i]$', '$2=-i(1+i)^2$ : $(2)\\subsetneq(1+i)$.'], [true, '$\\cl2$ et $\\cl4$ dans $\\Z/6\\Z$', '$\\cl4=2\\cdot\\cl2$ et $\\cl2=2\\cdot\\cl4$.'],
  ], 'Dans un anneau intègre, $(a)=(b)$ si et seulement si $a$ et $b$ sont associés ($a=ub$, $u$ inversible).')),
  // ---------------------------------------------------------------- quotients
  qcm('c5-quotients', 'Quotients', R => fromPool(R, 'Lesquels de ces isomorphismes d’anneaux sont vrais ?', [
    [true, '$\\R[X]/(X^2+1)\\simeq\\C$', '$\\cl X\\mapsto i$.'], [true, '$\\Z[X]/(X)\\simeq\\Z$', 'Évaluation en 0.'], [true, '$\\R[X]/(X-a)\\simeq\\R$', 'Évaluation en $a$.'], [true, '$\\R[X]/(X^2-1)\\simeq\\R\\times\\R$', 'Théorème chinois avec $X-1$, $X+1$.'],
    [false, '$\\R[X]/(X^2)\\simeq\\R\\times\\R$', '$\\cl X$ est nilpotent ; $\\R\\times\\R$ n’a pas de nilpotent non nul.'], [true, '$\\Z/6\\Z\\simeq\\Z/2\\Z\\times\\Z/3\\Z$', 'Théorème chinois.'], [false, '$\\Z/4\\Z\\simeq\\Z/2\\Z\\times\\Z/2\\Z$', 'Groupes additifs non isomorphes.'],
    [false, '$\\Z[X]/(2)\\simeq\\Z/2\\Z$', 'C’est $(\\Z/2\\Z)[X]$, infini.'],
  ], 'Premier théorème d’isomorphisme et théorème chinois.')),
  qcm('c5-calcul-C', 'Quotients', R => { const a = R.int(-4, 4), b = R.int(-4, 4), c = R.int(-4, 4), d = R.int(-4, 4);
    return single(`Dans $\\R[X]/(X^2+1)$, calculer $(${ptex([b, a])})(${ptex([d, c])})$ (classes modulo $X^2+1$).`, ok(`$${ptex([a * d + b * c, a * c - b * d])}$`, '$\\cl X^2=-1$.'),
      [no(`$${ptex([a * d + b * c, a * c + b * d])}$`, 'On a pris $\\cl X^2=1$.'), no(`$${ptex([b * d, a * d + b * c, a * c])}$`, 'Il faut réduire modulo $X^2+1$.'), no(`$${ptex([a * d - b * c, a * c - b * d])}$`, 'Erreur de signe dans le terme en $X$.')],
      'Réduire modulo $X^2+1$ revient à calculer dans $\\C$ avec $\\cl X=i$.'); }),
  qcm('c5-cardinal-quotient', 'Quotients', R => { const p = R.pick([2, 3, 5, 7]), d = R.int(2, 4);
    return single(`Combien d’éléments a l’anneau $(\\Z/${p}\\Z)[X]/(P)$ pour $P$ de degré $${d}$ ?`, ok(p ** d, `Les restes $a_0+\\dots+a_{${d - 1}}X^{${d - 1}}$ : $${p}^{${d}}$.`),
      [no(p * d, 'Ce n’est pas un produit.'), no(d ** p, 'Exposant et base inversés.'), no(p ** (d + 1), 'Les restes sont de degré $<d$.')].filter(x => x[1] !== String(p ** d)),
      '$\\K[X]/(P)$ a pour base $\\cl1,\\cl X,\\dots,\\cl X^{d-1}$.'); }),
  qcm('c5-reste-X-a', 'Polynômes', R => { const c = [R.int(-3, 3), R.int(-4, 4), R.int(-4, 4), R.int(-5, 5)], a = R.int(-3, 3), val = c.reduce((acc, x) => acc * a + x, 0);
    return single(`Quel est le reste de la division de $P=${ptex(c)}$ par $X${a > 0 ? '-' : '+'}${Math.abs(a)}$ ?`.replace('X+0', 'X').replace('X-0', 'X'), ok(val, `C’est $P(${a})$.`),
      [no(c.reduce((acc, x) => acc * -a + x, 0), `C’est $P(${-a})$ : erreur de signe.`), no(c[3], 'C’est $P(0)$.'), no(val + c[0], 'Recalculer.')].filter(x => x[1] !== String(val)),
      'Le reste de $P$ par $X-a$ est la constante $P(a)$.'); }),
  qcm('c5-reste-puissance', 'Polynômes', R => { const n = R.int(5, 50), which = R.pick(['X^2+1', 'X^2-1', 'X^3-1']);
    const r = which === 'X^2-1' ? (n % 2 ? 'X' : '1') : which === 'X^3-1' ? ['1', 'X', 'X^2'][n % 3] : ['1', 'X', '-1', '-X'][n % 4];
    const all = which === 'X^2+1' ? ['1', 'X', '-1', '-X'] : which === 'X^2-1' ? ['1', 'X', '-1', '-X'] : ['1', 'X', 'X^2', '-1'];
    return single(`Quel est le reste de la division de $X^{${n}}$ par $${which}$ ?`, ok(`$${r}$`, which === 'X^2+1' ? '$X^2\\equiv-1$, période 4.' : which === 'X^2-1' ? '$X^2\\equiv1$, période 2.' : '$X^3\\equiv1$, période 3.'),
      all.filter(x => x !== r).map(x => no(`$${x}$`, 'Réduire l’exposant selon la période.')), 'Calculer dans le quotient : remplacer $X^2$ ou $X^3$ par sa valeur.'); }),
  // ---------------------------------------------------------------- prime and maximal ideals
  qcm('c5-premiers', 'Premiers et maximaux', R => fromPool(R, 'Lesquels de ces idéaux sont premiers ?', [
    [true, '$(7)$ dans $\\Z$', '$\\Z/7\\Z$ intègre.'], [true, '$(0)$ dans $\\Z$', '$\\Z$ intègre.'], [false, '$(6)$ dans $\\Z$', '$2\\cdot3\\in(6)$.'], [true, '$(X)$ dans $\\Z[X]$', 'Quotient $\\Z$, intègre.'],
    [false, '$(X^2)$ dans $\\R[X]$', '$X\\cdot X\\in(X^2)$.'], [true, '$(X^2+1)$ dans $\\R[X]$', 'Irréductible.'], [false, '$(X^2-1)$ dans $\\R[X]$', 'Produit $(X-1)(X+1)$.'], [true, '$(2,X)$ dans $\\Z[X]$', 'Quotient $\\Z/2\\Z$.'],
    [false, '$(4)$ dans $\\Z$', '$2\\cdot2\\in(4)$.'], [true, '$(X)$ dans $\\R[X,Y]$', 'Quotient $\\R[Y]$, intègre.'],
  ], '$I$ premier $\\iff A/I$ intègre.')),
  qcm('c5-maximal-Z', 'Premiers et maximaux', R => { const n = R.int(2, 60), m = Q.isPrime(n);
    return single(`L’idéal $(${n})$ de $\\Z$ est-il maximal ?`, ok(m ? 'Oui' : 'Non', m ? `$\\Z/${n}\\Z$ est un corps.` : `$(${n})\\subsetneq(${primeFactors(n)[0]})\\subsetneq\\Z$.`),
      [no(m ? 'Non' : 'Oui', `${n} ${m ? 'est' : 'n’est pas'} premier.`), no(m ? 'Non, car il est premier sans être maximal' : 'Oui, car il est premier', m ? 'Dans $\\Z$, les idéaux premiers non nuls sont maximaux.' : `$(${n})$ n’est même pas premier.`), no('On ne peut pas savoir', 'Il suffit de savoir si $n$ est premier.')],
      'Dans $\\Z$ : $(n)$ ($n\\ge2$) est maximal $\\iff$ premier $\\iff n$ premier.'); }),
  qcm('c5-maximaux', 'Premiers et maximaux', R => fromPool(R, 'Lesquels de ces idéaux sont maximaux ?', [
    [true, '$(7)$ dans $\\Z$', 'Corps.'], [false, '$(0)$ dans $\\Z$', 'Premier non maximal.'], [true, '$(X^2+1)$ dans $\\R[X]$', 'Quotient $\\C$.'], [false, '$(X^2+1)$ dans $\\C[X]$', '$(X^2+1)\\subsetneq(X-i)$.'],
    [false, '$(X)$ dans $\\Z[X]$', 'Quotient $\\Z$, pas un corps.'], [true, '$(2,X)$ dans $\\Z[X]$', 'Quotient $\\Z/2\\Z$.'], [true, '$(X-3)$ dans $\\Q[X]$', 'Quotient $\\Q$.'], [true, '$(X^2+X+1)$ dans $(\\Z/2\\Z)[X]$', 'Pas de racine, degré 2 : corps à 4 éléments.'],
    [false, '$(X^2+1)$ dans $(\\Z/2\\Z)[X]$', '$X^2+1=(X+1)^2$ sur $\\Z/2\\Z$.'],
  ], '$I$ maximal $\\iff A/I$ corps ; dans $\\K[X]$, $(P)$ maximal $\\iff P$ irréductible.')),
  qcm('c5-max-prem', 'Premiers et maximaux', R => fromPool(R, 'Lesquelles de ces implications sont vraies en général (anneau commutatif) ?', [
    [true, 'maximal $\\Rightarrow$ premier', 'Un corps est intègre.'], [false, 'premier $\\Rightarrow$ maximal', '$(0)$ dans $\\Z$.'], [true, 'dans $\\Z$, premier non nul $\\Rightarrow$ maximal', 'Liste des idéaux de $\\Z$.'],
    [true, 'dans $\\K[X]$, premier non nul $\\Rightarrow$ maximal', 'Irréductible $\\Rightarrow$ maximal.'], [false, 'dans $\\Z[X]$, premier non nul $\\Rightarrow$ maximal', '$(X)$.'], [true, '$I$ premier $\\iff A/I$ intègre', 'Définition.'],
  ], 'Maximal implique premier ; la réciproque vaut dans les anneaux principaux pour les idéaux non nuls.')),
  // ---------------------------------------------------------------- irreducibility and roots over Z/pZ
  qcm('c5-irred-Fp', 'Polynômes', R => { const p = R.pick([2, 3, 5]), d = R.int(2, 3), c = [1, ...[...Array(d).keys()].map(() => R.int(0, p - 1))], r = roots(c, p), irr = r.length === 0;
    return single(`Le polynôme $${ptex(c)}$ est-il irréductible dans $(\\Z/${p}\\Z)[X]$ ?`, ok(irr ? 'Oui' : 'Non', irr ? `Degré ${d} sans racine dans $\\Z/${p}\\Z$.` : `Il a la racine $\\cl{${r[0]}}$.`),
      [no(irr ? 'Non' : 'Oui', 'Tester les ' + p + ' valeurs possibles.'), no(irr ? 'Non, car son degré est au moins 2' : 'Oui, car ses coefficients sont premiers entre eux', 'Ce n’est pas le critère.'), no(irr ? 'On ne peut pas conclure sans factoriser' : 'Oui, car il est unitaire', irr ? 'En degré 2 ou 3, l’absence de racine suffit.' : 'Ce n’est pas le critère.')],
      'En degré 2 ou 3 sur un corps : irréductible $\\iff$ pas de racine. (Faux en degré 4.)'); }),
  qcm('c5-racines-Fp', 'Polynômes', R => { const p = R.pick([5, 7]), c = [1, R.int(0, p - 1), R.int(0, p - 1)], r = roots(c, p);
    return { stem: `Quels éléments de $\\Z/${p}\\Z$ sont racines de $${ptex(c)}$ ?`, multi: true,
      choices: [...[...Array(p).keys()].map(x => [r.includes(x), `$\\cl{${x}}$`, `$P(${x})\\equiv${evalMod(c, x, p)}$.`]), [r.length === 0, 'aucun', r.length ? 'Il y en a.' : 'Aucune valeur n’annule $P$.']],
      expl: `Évaluer en chacun des ${p} éléments ; un polynôme de degré 2 sur un corps a au plus 2 racines.` }; }),
  qcm('c5-nb-irred', 'Polynômes', R => { const p = R.pick([2, 3, 5, 7, 11]);
    return single(`Combien de polynômes unitaires irréductibles de degré 2 y a-t-il dans $(\\Z/${p}\\Z)[X]$ ?`, ok((p * p - p) / 2, `$${p}^2$ unitaires, moins les $(X-a)(X-b)$ : $\\frac{${p}(${p}+1)}2$ réductibles.`),
      [no(p * p, 'C’est le nombre de tous les unitaires.'), no((p * p + p) / 2, 'C’est le nombre de réductibles.'), no(p - 1, 'Recompter.')].filter(x => x[1] !== String((p * p - p) / 2)),
      'Réductibles unitaires de degré 2 : $(X-a)(X-b)$, soit $\\frac{p(p+1)}2$ ; il reste $\\frac{p^2-p}2$ irréductibles.'); }),
  qcm('c5-irred-R', 'Polynômes', R => fromPool(R, 'Lesquels de ces polynômes sont irréductibles dans $\\R[X]$ ?', [
    [true, '$X^2+1$', 'Pas de racine réelle, degré 2.'], [true, '$X^2+X+1$', 'Discriminant $-3$.'], [false, '$X^3+1$', 'Racine $-1$.'], [false, '$X^4+1$', '$(X^2+\\sqrt2X+1)(X^2-\\sqrt2X+1)$.'],
    [false, '$(X^2+1)^2$', 'Pas de racine, mais produit.'], [true, '$X-5$', 'Degré 1.'], [false, '$X^2-2$', '$(X-\\sqrt2)(X+\\sqrt2)$.'], [true, '$3X^2+1$', 'Pas de racine réelle.'],
  ], 'Sur $\\R$, les irréductibles sont les degrés 1 et les degrés 2 sans racine réelle ; \\og pas de racine \\fg{} ne suffit qu’en degré 2 ou 3.')),
  qcm('c5-irred-Q', 'Polynômes', R => fromPool(R, 'Lesquels de ces polynômes sont irréductibles dans $\\Q[X]$ ?', [
    [true, '$X^2-2$', '$\\sqrt2\\notin\\Q$.'], [true, '$X^3-2$', 'Pas de racine rationnelle, degré 3.'], [false, '$X^4+4$', '$(X^2+2X+2)(X^2-2X+2)$.'], [true, '$X^2+X+1$', 'Pas de racine.'],
    [false, '$X^3-X$', '$X(X-1)(X+1)$.'], [false, '$X^4-4$', '$(X^2-2)(X^2+2)$.'], [true, '$X^3+X+1$', 'Racines rationnelles possibles $\\pm1$ : aucune ne convient.'],
  ], 'En degré 2 ou 3, irréductible sur un corps $\\iff$ pas de racine dans ce corps.')),
  qcm('c5-fermat', 'Polynômes', R => { const p = R.pick([3, 5, 7, 11, 13]), a = R.int(2, 40);
    return single(`Dans $\\Z/${p}\\Z$, que vaut $\\cl{${a}}^{${p}}$ ?`, ok(`$\\cl{${mod(a, p)}}$`, 'Petit théorème de Fermat : $x^p=x$.'),
      [no('$\\cl1$', 'C’est $x^{p-1}$ pour $x\\neq0$.'), no('$\\cl0$', 'Seulement pour $x=0$.'), no(`$\\cl{${mod(a * p, p) + 1}}$`, 'Recalculer.')].filter(x => x[1] !== `$\\cl{${mod(a, p)}}$`),
      'Dans $\\Z/p\\Z$, tous les éléments sont racines de $X^p-X$.'); }),
  qcm('c5-F4', 'Polynômes', R => fromPool(R, 'Dans $\\mathbb F_4=(\\Z/2\\Z)[X]/(X^2+X+1)$, avec $\\alpha=\\cl X$, lesquelles de ces égalités sont vraies ?', [
    [true, '$\\alpha^2=\\alpha+1$', 'Car $\\alpha^2+\\alpha+1=0$ et $-1=1$.'], [true, '$\\alpha^3=1$', '$\\alpha^3=\\alpha^2+\\alpha=1$.'], [false, '$\\alpha^2=1$', 'Alors $\\alpha=1$ (car $(\\alpha+1)^2=0$).'],
    [true, '$\\alpha(\\alpha+1)=1$', '$\\alpha^2+\\alpha=1$.'], [true, '$1+1=0$', 'Caractéristique 2.'], [false, '$\\mathbb F_4\\simeq\\Z/4\\Z$', '$\\Z/4\\Z$ n’est pas un corps.'],
  ], 'Le corps à quatre éléments $\\ens{0,1,\\alpha,\\alpha+1}$.')),
  // ---------------------------------------------------------------- homomorphisms and CRT
  qcm('c5-homs', 'Homomorphismes', R => fromPool(R, 'Lesquelles de ces applications sont des homomorphismes d’anneaux (avec $f(1)=1$) ?', [
    [true, '$\\Z\\to\\Z/n\\Z$, $k\\mapsto\\cl k$', 'Projection.'], [true, '$\\R[X]\\to\\R$, $P\\mapsto P(2)$', 'Évaluation.'], [false, '$\\Z\\to\\Z$, $k\\mapsto2k$', '$1\\mapsto2$.'], [true, '$\\C\\to\\C$, $z\\mapsto\\overline z$', 'Conjugaison.'],
    [false, '$\\Mat_2(\\R)\\to\\R$, $A\\mapsto\\det A$', 'Pas additif.'], [true, '$\\Z/6\\Z\\to\\Z/3\\Z$, $\\cl k\\mapsto\\cl k$', '$3\\mid6$.'], [false, '$\\Z/3\\Z\\to\\Z/6\\Z$, $\\cl k\\mapsto\\cl k$', 'Pas bien défini.'],
    [false, '$\\R\\to\\R$, $x\\mapsto x^2$', 'Pas additif.'], [true, '$\\Q[X]\\to\\R$, $P\\mapsto P(\\sqrt2)$', 'Évaluation.'],
  ], 'Un homomorphisme d’anneaux respecte $+$, $\\times$ et envoie $1$ sur $1$.')),
  qcm('c5-noyau-eval', 'Homomorphismes', R => { const kind = R.pick(['a', 'i', 'sqrt']), a = R.nonzero(-5, 5);
    const [map, ker, w] = { a: [`P\\mapsto P(${a})`, `(X${a > 0 ? '-' : '+'}${Math.abs(a)})`, `(X${a > 0 ? '+' : '-'}${Math.abs(a)})`], i: ['P\\mapsto P(i)\\in\\C', '(X^2+1)', '(X-i)'], sqrt: ['P\\mapsto P(\\sqrt2)', '(X^2-2)', '(X-\\sqrt2)'] }[kind];
    return single(`Quel est le noyau de $\\Q[X]\\to${kind === 'i' ? '\\C' : '\\R'}$, $${map}$ ?`, ok(`$${ker}$`, 'Engendré par le polynôme minimal.'),
      [no(`$${w}$`, kind === 'a' ? 'Erreur de signe.' : 'Ce polynôme n’est pas à coefficients rationnels.'), no('$\\ens0$', 'L’application n’est pas injective.'), no('$\\Q[X]$', '$1\\mapsto1$.')],
      '$\\Q[X]$ est principal : le noyau est engendré par le polynôme unitaire de plus petit degré qui s’annule.'); }),
  qcm('c5-chinois', 'Théorème chinois', R => { let m, n; do { m = R.int(3, 13); n = R.int(3, 13); } while (gcd(m, n) !== 1); const a = R.int(0, m - 1), b = R.int(0, n - 1), x = crt(a, m, b, n);
    return single(`Résoudre $x\\equiv${a}\\pmod{${m}}$, $x\\equiv${b}\\pmod{${n}}$.`, ok(`$x\\equiv${x}\\pmod{${m * n}}$`, `$${x}=${Math.floor(x / m)}\\cdot${m}+${a}=${Math.floor(x / n)}\\cdot${n}+${b}$.`),
      [no(`$x\\equiv${mod(a + b, m * n)}\\pmod{${m * n}}$`, 'On a additionné les congruences.'), no(`$x\\equiv${mod(x + m, m * n)}\\pmod{${m * n}}$`, 'Vérifier la seconde congruence.'), no('Pas de solution', `$\\pgcd(${m},${n})=1$ : solution unique modulo ${m * n}.`)],
      'Théorème chinois : $\\Z/mn\\Z\\simeq\\Z/m\\Z\\times\\Z/n\\Z$ si $\\pgcd(m,n)=1$.'); }),
  qcm('c5-chinois-iso', 'Théorème chinois', R => { const m = R.int(2, 12), n = R.int(2, 12), iso = gcd(m, n) === 1;
    return single(`Les anneaux $\\Z/${m * n}\\Z$ et $\\Z/${m}\\Z\\times\\Z/${n}\\Z$ sont-ils isomorphes ?`, ok(iso ? 'Oui' : 'Non', iso ? `$\\pgcd(${m},${n})=1$.` : `$\\pgcd(${m},${n})=${gcd(m, n)}$ : $(\\cl1,\\cl1)$ est d’ordre additif $${lcm(m, n)}<${m * n}$.`),
      [no(iso ? 'Non' : 'Oui', 'Le critère est $\\pgcd(m,n)=1$.'), no(iso ? 'Seulement comme groupes' : 'Oui, comme groupes seulement', iso ? 'Aussi comme anneaux.' : 'Pas même comme groupes.'), no(iso ? 'Non, car les cardinaux diffèrent' : 'Oui, car ils ont le même cardinal', 'Même cardinal ne suffit pas.')],
      'Théorème chinois.'); }),
  qcm('c5-phi-mult', 'Théorème chinois', R => { let m, n; do { m = R.int(3, 15); n = R.int(3, 15); } while (gcd(m, n) !== 1 || m === n);
    return single(`Sachant $\\varphi(${m})=${Q.phi(m)}$ et $\\varphi(${n})=${Q.phi(n)}$, que vaut $\\varphi(${m * n})$ ?`, ok(Q.phi(m * n), 'Multiplicativité pour $m,n$ premiers entre eux.'),
      [no(Q.phi(m) + Q.phi(n), 'Ce n’est pas additif.'), no(m * n - 1, 'Seulement si $mn$ est premier.'), no(Q.phi(m) * Q.phi(n) + 1, 'Recompter.')].filter(x => x[1] !== String(Q.phi(m * n))),
      '$\\varphi(mn)=\\varphi(m)\\varphi(n)$ pour $\\pgcd(m,n)=1$, conséquence du théorème chinois.'); }),
  qcm('c5-carres-un', 'Théorème chinois', R => { const n = R.pick([15, 21, 35, 33, 105, 39, 55, 77]), c = 2 ** primeFactors(n).length;
    return single(`Combien de solutions a $x^2=\\cl1$ dans $\\Z/${n}\\Z$ ?`, ok(c, `$x\\equiv\\pm1$ modulo chacun des ${primeFactors(n).length} premiers, combinés par le théorème chinois.`),
      [no(2, 'Plus que $\\pm1$ quand $n$ n’est pas premier.'), no(1, '$-1$ en est une autre.'), no(primeFactors(n).length, 'Il faut $2^{\\omega(n)}$.')].filter(x => x[1] !== String(c)),
      'Dans un corps, $x^2=1$ a au plus 2 solutions ; dans un produit de corps, on multiplie.'); }),
  qcm('c5-pgcd-poly', 'Divisibilité', R => { const [a, b, c] = R.sample([-3, -2, -1, 1, 2, 3, 4], 3);
    const P = [1, -(a + b), a * b], S = [1, -(a + c), a * c];
    return single(`Quel est le pgcd unitaire de $${ptex(P)}$ et $${ptex(S)}$ dans $\\Q[X]$ ?`, ok(`$X${a > 0 ? '-' : '+'}${Math.abs(a)}$`, `Racine commune ${a}.`),
      [no(`$X${b > 0 ? '-' : '+'}${Math.abs(b)}$`, 'Ne divise pas le second.'), no('$1$', 'Ils ont une racine commune.'), no(`$${ptex(P)}$`, 'Ne divise pas le second.')],
      'Les deux polynômes se factorisent ; le pgcd est le produit des facteurs communs.'); }),
  qcm('c5-principaux', 'Divisibilité', R => fromPool(R, 'Lesquels de ces anneaux sont principaux ?', [
    [true, '$\\Z$', 'Sous-groupes de $\\Z$.'], [true, '$\\Q[X]$', 'Division euclidienne.'], [false, '$\\Z[X]$', '$(2,X)$.'], [false, '$\\R[X,Y]$', '$(X,Y)$.'], [true, '$\\R[X]$', 'Division euclidienne.'],
    [false, '$\\Z/6\\Z$', 'Pas intègre (la définition demande l’intégrité).'], [true, '$(\\Z/5\\Z)[X]$', 'Polynômes sur un corps.'],
  ], 'Principal : intègre et tout idéal est engendré par un élément.')),
  qcm('c5-ideal-principal', 'Divisibilité', R => { const [a, b] = R.sample([-3, -2, -1, 1, 2, 3], 2);
    return single(`L’idéal de $\\Q[X]$ formé des polynômes qui s’annulent en $${a}$ et en $${b}$ est engendré par :`, ok(`$${ptex([1, -(a + b), a * b])}$`, `$(X${a > 0 ? '-' : '+'}${Math.abs(a)})(X${b > 0 ? '-' : '+'}${Math.abs(b)})$.`),
      [no(`$X${a > 0 ? '-' : '+'}${Math.abs(a)}$`, `Ce générateur ne s’annule pas en ${b}.`), no(`$${ptex([1, a + b, a * b])}$`, 'Erreur de signe : ses racines sont $-a$ et $-b$.'), no('il n’est pas principal', '$\\Q[X]$ est principal.')],
      'Dans $\\K[X]$, l’idéal est engendré par un polynôme de degré minimal.'); }),
  qcm('c5-diviseurs-zero-mat', 'Anneaux', R => fromPool(R, 'Lesquelles de ces affirmations sur $\\Mat_2(\\R)$ sont vraies ?', [
    [true, 'C’est un anneau non commutatif', '$AB\\neq BA$.'], [true, 'Il a des diviseurs de zéro', '$\\mathrm{diag}(1,0)\\mathrm{diag}(0,1)=0$.'], [true, 'Ses inversibles forment $\\GL_2(\\R)$', 'Définition.'],
    [false, 'C’est un corps', 'Non commutatif et non intègre.'], [true, 'Les matrices de la forme $\\begin{pmatrix}a&-b\\\\b&a\\end{pmatrix}$ en forment un sous-anneau isomorphe à $\\C$', '$a+bi$.'],
    [false, 'L’ensemble des matrices de première colonne nulle est un idéal bilatère', 'Idéal à gauche seulement (exercice du chapitre).'],
  ], 'L’anneau des matrices.')),
  qcm('c5-zero-div-Zn', 'Anneaux', R => { const n = R.int(6, 30), a = R.int(2, n - 1), d = gcd(a, n);
    return single(`La classe $\\cl{${a}}$ est-elle un diviseur de zéro dans $\\Z/${n}\\Z$ ?`, ok(d > 1 ? `Oui : $\\cl{${a}}\\cdot\\cl{${n / d}}=\\cl0$` : 'Non : elle est inversible', d > 1 ? `$\\pgcd(${a},${n})=${d}$.` : `$\\pgcd(${a},${n})=1$.`),
      [no(d > 1 ? 'Non : elle est inversible' : `Oui : $\\cl{${a}}\\cdot\\cl{${n - a}}=\\cl0$`, d > 1 ? `$\\pgcd(${a},${n})\\neq1$.` : 'Vérifier le produit.'), no(d > 1 ? 'Non, car elle n’est pas nulle' : 'Oui, car $n$ n’est pas premier', 'Ce n’est pas le critère.'), no(d > 1 ? 'Non, car $\\cl{a}^2\\neq\\cl0$' : 'Oui, car $\\cl a$ n’engendre pas l’anneau', 'Ce n’est pas le critère.')],
      'Dans $\\Z/n\\Z$, toute classe non nulle est inversible ou diviseur de zéro, selon $\\pgcd(a,n)$.'); }),
  qcm('c5-gauss-associes', 'Divisibilité', R => { const a = R.nonzero(-4, 4), b = R.nonzero(-4, 4), ass = [[a, b], [-a, -b], [-b, a], [b, -a]];
    return { stem: `Lesquels de ces éléments sont associés à $${zi(a, b)}$ dans $\\Z[i]$ ?`, multi: true,
      choices: [[true, `$${zi(-a, -b)}$`, 'Multiplié par $-1$.'], [true, `$${zi(-b, a)}$`, 'Multiplié par $i$.'], [false, `$${zi(a, -b)}$`, 'Le conjugué n’est pas associé ici : le quotient n’est pas $\\pm1$ ou $\\pm i$.'], [false, `$${zi(2 * a, 2 * b)}$`, '$2$ n’est pas inversible.']].filter((c, i) => !(i === 2 && ass.some(([x, y]) => x === a && y === -b))),
      expl: 'Associés : multipliés par un inversible $\\pm1,\\pm i$.' }; }),
  qcm('c5-eval-mod', 'Polynômes', R => { const p = R.pick([5, 7, 11, 13]), c = [R.int(1, p - 1), R.int(0, p - 1), R.int(0, p - 1), R.int(0, p - 1)], x = R.int(0, p - 1), v = evalMod(c, x, p);
    return single(`Dans $\\Z/${p}\\Z$, que vaut $P(\\cl{${x}})$ pour $P=${ptex(c)}$ ?`, ok(`$\\cl{${v}}$`, 'Calcul modulo ' + p + ' (Horner).'),
      [no(`$\\cl{${mod(v + 1, p)}}$`, 'Recalculer.'), no(`$\\cl{${evalMod(c, mod(-x, p), p)}}$`, `C’est $P(-\\cl{${x}})$.`), no(`$\\cl{${mod(c[3], p)}}$`, 'C’est $P(\\cl0)$.')].filter(z => z[1] !== `$\\cl{${v}}$`),
      'On évalue dans $\\Z/p\\Z$ en réduisant à chaque étape.'); }),
  qcm('c5-sous-anneaux', 'Anneaux', R => fromPool(R, 'Lesquelles de ces parties sont des sous-anneaux de l’anneau indiqué ?', [
    [true, '$\\Z$ dans $\\Q$', 'Contient 1, stable.'], [false, '$2\\Z$ dans $\\Z$', 'Ne contient pas 1 (c’est un idéal).'], [true, '$\\Z[i]$ dans $\\C$', 'Stable par produit.'], [true, 'les matrices diagonales dans $\\Mat_2(\\R)$', 'Contient $I_2$.'],
    [false, '$\\ens{\\cl0,\\cl3}$ dans $\\Z/6\\Z$', 'Ne contient pas $\\cl1$.'], [true, '$\\R$ (constantes) dans $\\R[X]$', 'Contient 1.'], [false, 'les polynômes sans terme constant dans $\\R[X]$', 'Ne contient pas 1 (idéal $(X)$).'],
  ], 'Un sous-anneau contient 1 ; un idéal propre ne contient pas 1 : les deux notions ne se recouvrent pas.')),
  qcm('c5-iso-anneaux', 'Homomorphismes', R => fromPool(R, 'Soit $f:A\\to B$ un homomorphisme d’anneaux. Lesquelles de ces affirmations sont vraies ?', [
    [true, '$A/\\Ker f\\simeq\\Img f$', 'Premier théorème.'], [true, '$f$ injectif $\\iff\\Ker f=\\ens0$', 'Comme pour les groupes.'], [true, 'Si $A$ est un corps et $B\\neq\\ens0$, $f$ est injectif', 'Deux idéaux seulement.'],
    [false, '$\\Img f$ est un idéal de $B$', 'Un sous-anneau.'], [true, '$f$ envoie un inversible sur un inversible', '$f(u)f(u^{-1})=1$.'], [false, '$f$ envoie un diviseur de zéro sur un diviseur de zéro', 'Il peut l’envoyer sur 0.'],
  ], 'Premier théorème d’isomorphisme pour les anneaux.')),
  qcm('c5-cardinal-corps', 'Polynômes', R => fromPool(R, 'Lesquelles de ces affirmations sur les corps finis construits au chapitre 5 sont vraies ?', [
    [true, '$(\\Z/p\\Z)[X]/(P)$ est un corps si $P$ est irréductible', 'Idéal maximal.'], [true, 'Il a alors $p^{\\deg P}$ éléments', 'Base des restes.'], [true, 'Il existe un corps à 8 éléments', '$X^3+X+1$ irréductible sur $\\Z/2\\Z$.'],
    [false, '$\\Z/9\\Z$ est un corps à 9 éléments', '$\\cl3^2=\\cl0$.'], [true, 'Il existe un corps à 9 éléments', '$(\\Z/3\\Z)[X]/(X^2+1)$.'], [false, 'Il existe un corps à 6 éléments', 'Non construit ici, et en fait impossible (le cardinal d’un corps fini est une puissance d’un premier).'],
  ], 'Construire des corps finis par quotient.')),
  qcm('c5-inclusion-ideaux', 'Idéaux', R => { const a = R.int(2, 15), k = R.int(2, 6), b = R() < 0.5 ? a * k : R.int(2, 60), inc = b % a === 0;
    return single(`Dans $\\Z$, a-t-on $(${b})\\subset(${a})$ ?`, ok(inc ? `Oui, car $${a}$ divise $${b}$` : `Non, car $${a}$ ne divise pas $${b}$`, inc ? 'Tout multiple de ' + b + ' est multiple de ' + a + '.' : `$${b}\\notin(${a})$.`),
      [no(inc ? `Non, car $${b}$ est plus grand que $${a}$` : `Oui, car $${b}$ est plus grand que $${a}$`, 'La taille des générateurs ne décide rien.'), no(inc ? `Non, car $${b}$ ne divise pas $${a}$` : `Oui, car $(${a})\\subset(${b})$`, 'Le sens est inversé.'), no('On ne peut pas comparer deux idéaux', 'Ici, on peut.')],
      '$(b)\\subset(a)\\iff b\\in(a)\\iff a\\mid b$ : « contenir, c’est diviser ».'); }),
  qcm('c5-unites-anneaux', 'Inversibles', R => { const cases = [['$\\Z$', '$\\ens{\\pm1}$'], ['$\\Z[i]$', '$\\ens{\\pm1,\\pm i}$'], ['$\\Z\\times\\Z$', '$\\ens{(\\pm1,\\pm1)}$, 4 éléments'], ['$\\Z[X]$', '$\\ens{\\pm1}$'], ['$\\Q[X]$', '$\\Q^*$ (les constantes non nulles)'], ['$\\Z/8\\Z$', '$\\ens{\\cl1,\\cl3,\\cl5,\\cl7}$']];
    const [A, U] = R.pick(cases), others = R.shuffle(cases.filter(c => c[1] !== U)).slice(0, 3);
    return single(`Quel est le groupe des inversibles de ${A} ?`, ok(U, 'Résoudre $ab=1$ dans cet anneau.'), others.map(([A2, U2]) => no(U2, `C’est le groupe des inversibles de ${A2}.`)),
      'Les inversibles d’un anneau forment un groupe pour la multiplication.'); }),
  qcm('c5-Zn-corps', 'Anneaux', R => { const n = R.int(2, 40), pr = Q.isPrime(n);
    return single(`L’anneau $\\Z/${n}\\Z$ est-il intègre ?`, ok(pr ? 'Oui, et c’est même un corps' : 'Non', pr ? `${n} est premier.` : `$${n}$ n’est pas premier : $\\cl{${primeFactors(n)[0]}}\\cdot\\cl{${n / primeFactors(n)[0]}}=\\cl0$.`),
      [no(pr ? 'Non' : 'Oui, et c’est même un corps', `${n} ${pr ? 'est' : 'n’est pas'} premier.`), no(pr ? 'Oui, mais ce n’est pas un corps' : 'Oui, mais ce n’est pas un corps', 'Pour $\\Z/n\\Z$, intègre et corps sont équivalents.'), no(pr ? (n % 2 ? 'Non, car $n$ est impair' : 'Non, car $n$ est pair') : (n % 2 ? 'Oui, car $n$ est impair' : 'Oui, car $n$ est pair'), 'La parité ne décide rien.')].filter(c => c[1] !== (pr ? 'Oui, et c’est même un corps' : 'Non')),
      '$\\Z/n\\Z$ intègre $\\iff$ corps $\\iff n$ premier.'); }),
  qcm('c5-frobenius', 'Polynômes', R => fromPool(R, 'Lesquelles de ces égalités sont vraies ?', [
    [true, '$(X+1)^p=X^p+1$ dans $(\\Z/p\\Z)[X]$, $p$ premier', '$p\\mid\\binom pk$ pour $0<k<p$.'], [false, '$(X+1)^4=X^4+1$ dans $(\\Z/4\\Z)[X]$', 'Le coefficient de $X^2$ vaut $6\\equiv2$.'],
    [true, '$(a+b)^2=a^2+b^2$ dans $\\Z/2\\Z$', '$2ab=0$.'], [false, '$(a+b)^2=a^2+b^2$ pour tous $a,b\\in\\Z/4\\Z$', '$a=b=\\cl1$ : $(\\cl2)^2=\\cl0$ mais $\\cl1+\\cl1=\\cl2$.'],
    [true, '$(X+1)^{p^2}=X^{p^2}+1$ dans $(\\Z/p\\Z)[X]$', 'Itérer deux fois.'], [false, '$(X+1)^p=X^p+1$ dans $\\Z[X]$', 'Les coefficients binomiaux ne s’annulent pas dans $\\Z$.'],
  ], 'En caractéristique $p$ premier : $(A+B)^p=A^p+B^p$ (lemme utilisé pour les théorèmes de Sylow).')),
  qcm('c5-degre-produit', 'Polynômes', R => { const n = R.pick([6, 8, 10, 12]), a = R.int(1, n - 1), b = R.int(1, n - 1), d1 = R.int(1, 3), d2 = R.int(1, 3), ok0 = (a * b) % n !== 0;
    return single(`Dans $(\\Z/${n}\\Z)[X]$, $P$ a pour coefficient dominant $\\cl{${a}}$ et degré ${d1}, $Q$ a pour coefficient dominant $\\cl{${b}}$ et degré ${d2}. A-t-on $\\deg(PQ)=${d1 + d2}$ ?`,
      ok(ok0 ? 'Oui' : 'Non, le degré est plus petit', `$\\cl{${a}}\\cdot\\cl{${b}}=\\cl{${(a * b) % n}}$.`),
      [no(ok0 ? 'Non, le degré est plus petit' : 'Oui', 'Calculer le produit des coefficients dominants.'), no(ok0 ? 'Non, le degré est plus grand' : 'Oui, toujours', 'Le degré d’un produit n’excède jamais la somme.'), no('On ne peut pas savoir sans les autres coefficients', 'Le terme de degré $d_1+d_2$ ne dépend que des coefficients dominants.')],
      'Le coefficient de $X^{d_1+d_2}$ dans $PQ$ est le produit des coefficients dominants ; il peut être nul si l’anneau n’est pas intègre.'); }),
  qcm('c5-idempotent-test', 'Inversibles', R => { const n = R.pick([6, 10, 12, 15, 20, 30]), e = R.int(2, n - 1), id = (e * e) % n === e;
    return single(`Dans $\\Z/${n}\\Z$, la classe $\\cl{${e}}$ vérifie-t-elle $e^2=e$ ?`, ok(id ? 'Oui' : 'Non', `$${e}^2=${e * e}\\equiv${(e * e) % n}$.`),
      [no(id ? 'Non' : 'Oui', 'Calculer $e^2$ modulo $n$.'), no(id ? 'Non, seules $\\cl0$ et $\\cl1$ le vérifient' : 'Oui, car $\\cl e$ n’est pas inversible', 'Ce n’est pas le critère.'), no(id ? 'Non, car $\\cl e$ n’est pas inversible' : 'Oui, car $\\cl e$ divise zéro', 'Ce n’est pas le critère.')],
      'Idempotents de $\\Z/n\\Z$ : les $e$ avec $e\\equiv0$ ou $1$ modulo chaque puissance de premier divisant $n$.'); }),
  qcm('c5-chinois-image', 'Théorème chinois', R => { let m, n; do { m = R.int(3, 11); n = R.int(3, 11); } while (gcd(m, n) !== 1); const x = R.int(0, m * n - 1);
    return single(`Quelle est l’image de $\\cl{${x}}\\in\\Z/${m * n}\\Z$ par l’isomorphisme $\\Z/${m * n}\\Z\\to\\Z/${m}\\Z\\times\\Z/${n}\\Z$ ?`, ok(`$(\\cl{${x % m}},\\cl{${x % n}})$`, 'Réduire modulo chacun des deux entiers.'),
      [no(`$(\\cl{${x % n}},\\cl{${x % m}})$`, 'Composantes échangées.'), no(`$(\\cl{${Math.floor(x / n) % m}},\\cl{${x % n}})$`, 'La première composante est le reste modulo ' + m + '.'), no(`$(\\cl{${x % m}},\\cl{${(x + 1) % n}})$`, 'Recalculer la seconde composante.')],
      'Théorème chinois : $\\cl k\\mapsto(\\cl k,\\cl k)$.'); }),
  qcm('c5-quotient-integre', 'Quotients', R => fromPool(R, 'Lesquels de ces anneaux quotients sont intègres ?', [
    [true, '$\\Z/(5)$', 'Corps.'], [false, '$\\Z/(10)$', '$\\cl2\\cdot\\cl5=\\cl0$.'], [true, '$\\Z[X]/(X)$', 'Isomorphe à $\\Z$.'], [false, '$\\R[X]/(X^2)$', '$\\cl X^2=0$.'], [true, '$\\R[X]/(X^2+X+1)$', 'Irréductible : corps.'],
    [false, '$\\Q[X]/(X^2-4)$', '$(\\cl X-2)(\\cl X+2)=0$.'], [true, '$\\Z[X]/(2,X)$', 'Isomorphe à $\\Z/2\\Z$.'], [false, '$(\\Z/3\\Z)[X]/(X^2+2)$', '$X^2+2=X^2-1=(X-1)(X+1)$ sur $\\Z/3\\Z$.'],
  ], '$A/I$ intègre $\\iff I$ premier.')),
];

// ---------------------------------------------------------------- quizzes
ITEMS.push(
  quiz('c5q-phi', 'Inversibles', R => { const n = R.int(10, 99); return { stem: `Combien d’inversibles a l’anneau $\\Z/${n}\\Z$ ?`, type: 'int', answer: Q.phi(n), expl: '$\\varphi(n)$.' }; }),
  quiz('c5q-inverse', 'Inversibles', R => { let n, a; do { n = R.int(11, 97); a = R.int(2, n - 2); } while (gcd(a, n) !== 1); return { stem: `Donner un représentant de l’inverse de $\\cl{${a}}$ dans $\\Z/${n}\\Z$.`, type: 'mod', n, answer: Q.inverseMod(a, n), expl: 'Euclide étendu.' }; }),
  quiz('c5q-crt', 'Théorème chinois', R => { let m, n; do { m = R.int(3, 17); n = R.int(3, 17); } while (gcd(m, n) !== 1); const a = R.int(0, m - 1), b = R.int(0, n - 1);
    return { stem: `Trouver $x$ avec $x\\equiv${a}\\pmod{${m}}$ et $x\\equiv${b}\\pmod{${n}}$.`, type: 'mod', n: m * n, answer: crt(a, m, b, n), expl: 'Bézout sur $(m,n)$, ou essais parmi $b, b+n, b+2n,\\dots$' }; }),
  quiz('c5q-reste', 'Polynômes', R => { const c = [R.int(-3, 3), R.int(-5, 5), R.int(-5, 5), R.int(-5, 5)], a = R.nonzero(-3, 3);
    return { stem: `Donner le reste de la division de $${ptex(c)}$ par $X${a > 0 ? '-' : '+'}${Math.abs(a)}$.`, type: 'int', answer: c.reduce((acc, x) => acc * a + x, 0), expl: 'C’est $P(a)$.' }; }),
  quiz('c5q-C', 'Quotients', R => { const a = R.int(-5, 5), b = R.int(-5, 5), c = R.int(-5, 5), d = R.int(-5, 5);
    return { stem: `Dans $\\R[X]/(X^2+1)$, le produit $(${ptex([b, a])})(${ptex([d, c])})$ s’écrit $u+v\\cl X$. Donner $(u,v)$.`, type: 'tuple', answer: [a * c - b * d, a * d + b * c], expl: '$\\cl X^2=-1$.' }; }),
  quiz('c5q-racines', 'Polynômes', R => { const p = R.pick([5, 7, 11, 13]), c = [1, R.int(0, p - 1), R.int(0, p - 1)]; return { stem: `Donner l’ensemble des $x\\in\\ens{0,\\dots,${p - 1}}$ tels que $\\cl x$ soit racine de $${ptex(c)}$ dans $\\Z/${p}\\Z$.`, type: 'set', answer: roots(c, p), expl: 'Essayer chaque valeur.' }; }),
  quiz('c5q-nb-irred', 'Polynômes', R => { const p = R.pick([2, 3, 5, 7, 11, 13]); return { stem: `Combien de polynômes unitaires irréductibles de degré 2 a $(\\Z/${p}\\Z)[X]$ ?`, type: 'int', answer: (p * p - p) / 2, expl: '$\\frac{p^2-p}2$.' }; }),
  quiz('c5q-card', 'Quotients', R => { const p = R.pick([2, 3, 5, 7]), d = R.int(2, 5); return { stem: `Combien d’éléments a $(\\Z/${p}\\Z)[X]/(P)$ si $\\deg P=${d}$ ?`, type: 'int', answer: p ** d, expl: '$p^d$.' }; }),
  quiz('c5q-nilp', 'Inversibles', R => { const n = R.pick([8, 12, 16, 18, 24, 27, 32, 36, 45, 48, 50, 72, 96]); return { stem: `Combien d’éléments nilpotents a $\\Z/${n}\\Z$ ?`, type: 'int', answer: n / rad(n), expl: 'Les multiples du produit des premiers divisant $n$.' }; }),
  quiz('c5q-idem', 'Inversibles', R => { const n = R.pick([6, 10, 12, 30, 42, 60, 66, 70, 210]); return { stem: `Combien d’éléments $e$ de $\\Z/${n}\\Z$ vérifient $e^2=e$ ?`, type: 'int', answer: 2 ** primeFactors(n).length, expl: '$2^{\\omega(n)}$.' }; }),
  quiz('c5q-norme', 'Inversibles', R => { const a = R.int(-9, 9), b = R.int(-9, 9); return { stem: `Calculer la norme $N(${zi(a, b)})$ dans $\\Z[i]$.`, type: 'int', answer: a * a + b * b, expl: '$a^2+b^2$.' }; }),
  quiz('c5q-ideal-somme', 'Idéaux', R => { const a = R.int(6, 120), b = R.int(6, 120); return { stem: `Dans $\\Z$, $(${a})+(${b})=(d)$ avec $d\\ge0$. Donner $d$.`, type: 'int', answer: gcd(a, b), expl: 'Le pgcd.' }; }),
  quiz('c5q-ideal-inter', 'Idéaux', R => { const a = R.int(4, 40), b = R.int(4, 40); return { stem: `Dans $\\Z$, $(${a})\\cap(${b})=(m)$ avec $m\\ge0$. Donner $m$.`, type: 'int', answer: lcm(a, b), expl: 'Le ppcm.' }; }),
  quiz('c5q-nb-ideaux', 'Idéaux', R => { const n = R.int(6, 120); return { stem: `Combien l’anneau $\\Z/${n}\\Z$ a-t-il d’idéaux ?`, type: 'int', answer: Q.divisors(n).length, expl: 'Un par diviseur.' }; }),
  quiz('c5q-x2', 'Théorème chinois', R => { const n = R.pick([15, 21, 35, 105, 165, 1155]); return { stem: `Combien de solutions a $x^2=\\cl1$ dans $\\Z/${n}\\Z$ ?`, type: 'int', answer: 2 ** primeFactors(n).length, expl: '$\\pm1$ modulo chaque premier impair, combinés.' }; }),
);
