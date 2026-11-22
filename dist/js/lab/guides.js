// How to read each experiment, for a visitor who arrives with no lesson behind them: the question in plain words, what
// each part of the figure shows, and a first thing to try. Shown above the figure of the experiment page (page.js
// `readingGuide`); what can be moved is listed from the experiment's own controls, so it is never written twice.
// Every string is a [French, English] pair. Keep each line short: it is read before the figure, not instead of it.
const P = (fr, en) => [fr, en];

export const GUIDES = {
  quadratic: {
    question: P("Comment trois nombres a, b, c décident-ils de la forme d’une parabole ?", "How do three numbers a, b, c decide the shape of a parabola?"),
    see: [P("La courbe de y = ax² + bx + c dans un repère.", "The curve of y = ax² + bx + c on a grid."), P("Le sommet S, le point C où la courbe coupe l’axe vertical, et les racines quand il y en a.", "The vertex S, the point C where the curve meets the vertical axis, and the roots when there are any.")],
    start: P("Tirez le sommet S : la courbe glisse sans changer de forme. Tirez ensuite P : elle s’ouvre ou se resserre.", "Drag the vertex S: the curve slides without changing shape. Then drag P: it opens or narrows."),
  },
  trig: {
    question: P("Pourquoi le cosinus et le sinus sont-ils les coordonnées d’un point qui tourne ?", "Why are cosine and sine the coordinates of a turning point?"),
    see: [P("À gauche, le cercle de rayon 1 et le point P repéré par l’angle x.", "On the left, the circle of radius 1 and the point P at angle x."), P("À droite, la courbe obtenue en reportant une coordonnée de P en fonction de x.", "On the right, the curve obtained by plotting one coordinate of P against x.")],
    start: P("Faites tourner P sur le cercle et regardez le point de la courbe suivre.", "Turn P around the circle and watch the point of the curve follow."),
  },
  sequences: {
    question: P("Ajouter toujours le même nombre, ou multiplier toujours par le même : où cela mène-t-il ?", "Always add the same number, or always multiply by the same: where does it lead?"),
    see: [P("Les points (n ; uₙ) : chaque point est un terme de la suite.", "The points (n, uₙ): each point is a term of the sequence."), P("En bas, les valeurs des premiers termes.", "Below, the values of the first terms.")],
    start: P("Choisissez « Arithmétique », tirez u₁ au-dessus de u₀, puis passez à « Géométrique » : les points quittent la droite pour une courbe.", "Choose “Arithmetic”, drag u₁ above u₀, then switch to “Geometric”: the points leave the line for a curve."),
  },
  derivative: {
    question: P("Que devient la droite qui passe par deux points d’une courbe quand ces points se rapprochent ?", "What happens to the line through two points of a curve when the points come together?"),
    see: [P("Une courbe, un point A et un point B qui s’en rapproche.", "A curve, a point A and a point B that comes closer to it."), P("La sécante (AB) et sa pente ; en tirets, la tangente en A, sa limite.", "The secant (AB) and its slope; dashed, the tangent at A, its limit.")],
    start: P("Diminuez |h| : B se rapproche de A et la pente se stabilise.", "Decrease |h|: B moves towards A and the slope settles."),
  },
  integral: {
    question: P("Comment mesurer l’aire sous une courbe avec des rectangles ?", "How can the area under a curve be measured with rectangles?"),
    see: [P("La courbe, les bornes a et b, et n rectangles dont la hauteur est prise sur la courbe.", "The curve, the bounds a and b, and n rectangles whose height is taken on the curve."), P("La somme des aires des rectangles, comparée à l’aire exacte.", "The total area of the rectangles, compared with the exact area.")],
    start: P("Augmentez n : l’écart entre les rectangles et la courbe fond.", "Increase n: the gap between the rectangles and the curve melts away."),
  },
  probability: {
    question: P("On lance n fois (ici 10) une pièce qui tombe sur face avec une probabilité p. Combien de faces obtient-on le plus souvent ?", "A coin landing heads with probability p is tossed n times (here 10). How many heads come up most often?"),
    see: [P("Chaque ligne du bas est une expérience : 10 lancers, pièce pleine = face.", "Each row at the bottom is one experiment: 10 tosses, filled coin = heads."), P("Le diagramme compte les expériences : en abscisse le nombre de faces k, en hauteur la part des expériences qui en ont donné k.", "The chart counts the experiments: across, the number of heads k; up, the share of experiments that gave k heads."), P("Le repère E = np marque le centre attendu ; on peut le tirer pour changer p.", "The marker E = np shows the expected centre; drag it to change p.")],
    start: P("Cliquez « + 10 » puis « + 1 000 » et regardez les barres se stabiliser autour de E.", "Click “+ 10”, then “+ 1,000”, and watch the bars settle around E."),
  },
  vectors: {
    question: P("Deux flèches définissent un parallélogramme : que mesure son aire ?", "Two arrows define a parallelogram: what does its area measure?"),
    see: [P("Les vecteurs u et v partant de l’origine.", "The vectors u and v starting at the origin."), P("Le parallélogramme qu’ils engendrent et son aire signée (le déterminant).", "The parallelogram they span and its signed area (the determinant).")],
    start: P("Rendez u et v presque parallèles : l’aire tombe vers 0.", "Make u and v almost parallel: the area drops towards 0."),
  },
  statistics: {
    question: P("Une moyenne dit-elle tout d’une série de notes ?", "Does an average tell everything about a list of marks?"),
    see: [P("Chaque point est une valeur ; les valeurs égales s’empilent.", "Each dot is a value; equal values stack."), P("Dessous, la boîte (quartiles, médiane) et la moyenne.", "Below, the box (quartiles, median) and the mean.")],
    start: P("Tirez une seule valeur tout à droite : la moyenne bouge, la médiane presque pas.", "Drag a single value far to the right: the mean moves, the median hardly does."),
  },
  complex: {
    question: P("Multiplier par un nombre complexe, est-ce tourner et agrandir le plan ?", "Is multiplying by a complex number turning and stretching the plane?"),
    see: [P("À gauche le plan avant, à droite le plan après multiplication par z.", "On the left the plane before, on the right after multiplying by z."), P("Le point t et son image z × t, reliés en pointillés.", "The point t and its image z × t, joined by a dashed line.")],
    start: P("Tournez z autour de l’origine : toute l’image tourne du même angle.", "Turn z around the origin: the whole image turns by the same angle."),
  },
  similitude: {
    question: P("Que fait au plan une transformation qui multiplie toutes les distances par le même nombre ?", "What does a map that multiplies every distance by the same number do to the plane?"),
    see: [P("Une petite maison grise et son image colorée, avec les coins A, B, C et leurs images A′, B′, C′.", "A little grey house and its coloured image, with the corners A, B, C and their images A′, B′, C′."), P("Le centre Ω, un point M et son image M′ ; sous la figure, l’écriture z′ = az + b ou z′ = a z̄ + b.", "The centre Ω, a point M and its image M′; under the figure, the formula z′ = az + b or z′ = a z̄ + b.")],
    start: P("Tirez M′ autour de Ω : le rapport et l’angle changent ensemble. Passez ensuite à « indirecte » : la maison se retourne.", "Drag M′ around Ω: the ratio and the angle change together. Then switch to “indirect”: the house flips over."),
  },
  line: {
    question: P("Deux points suffisent-ils pour connaître une droite et son équation ?", "Are two points enough to know a line and its equation?"),
    see: [P("Les points A et B, la droite qui les joint.", "The points A and B, the line through them."), P("Sa pente et son ordonnée à l’origine, en fractions exactes.", "Its slope and intercept, as exact fractions.")],
    start: P("Mettez A et B à la même hauteur : la pente vaut 0.", "Put A and B at the same height: the slope is 0."),
  },
  exponential: {
    question: P("Multiplier à chaque pas par le même facteur : pourquoi la courbe finit-elle par exploser ?", "Multiplying by the same factor at each step: why does the curve end up exploding?"),
    see: [P("Les points (n ; k × aⁿ) et la courbe qui les relie.", "The points (n, k × aⁿ) and the curve through them."), P("Le facteur a lu entre les points d’abscisses 0 et 1.", "The factor a read between the points at 0 and 1.")],
    start: P("Passez a de 1,25 à 0,75 : la croissance devient décroissance.", "Move a from 1.25 to 0.75: growth turns into decay."),
  },
  cobweb: {
    question: P("Une suite définie par uₙ₊₁ = f(uₙ) : où va-t-elle ?", "A sequence defined by uₙ₊₁ = f(uₙ): where does it go?"),
    see: [P("La droite de f et la diagonale y = x.", "The line of f and the diagonal y = x."), P("L’escalier : on monte à f, on revient sur la diagonale, et ainsi de suite.", "The staircase: up to f, across to the diagonal, and so on.")],
    start: P("Augmentez n et voyez si l’escalier converge vers le croisement.", "Increase n and see whether the staircase closes in on the crossing."),
  },
  matrix: {
    question: P("Une matrice 2 × 2 : que fait-elle au plan tout entier ?", "A 2 × 2 matrix: what does it do to the whole plane?"),
    see: [P("À gauche le carré unité et les vecteurs i et j, à droite leur image et le quadrillage transformé.", "On the left the unit square and the vectors i and j, on the right their image and the transformed grid."), P("Les images des vecteurs i et j : ce sont les colonnes de la matrice.", "The images of the vectors i and j: they are the columns of the matrix.")],
    start: P("Tirez l’image de i : tout le quadrillage se déforme avec.", "Drag the image of i: the whole grid deforms with it."),
  },
  "space-lines": {
    question: P("Une droite de l’espace traverse-t-elle un plan, et où ?", "Does a line in space cross a plane, and where?"),
    see: [P("Un plan, une droite passant par A et B, en vraie 3D.", "A plane, a line through A and B, in true 3D."), P("Le point d’intersection quand il existe ; en pointillés, ce qui est caché.", "The intersection point when it exists; dashed, what is hidden.")],
    start: P("Faites tourner la vue en tirant le fond, puis déplacez l’ombre de B et la hauteur de B jusqu’à n · u = 0 : la droite devient parallèle au plan.", "Turn the view by dragging the background, then move the shadow of B and the height of B until n · u = 0: the line becomes parallel to the plane."),
  },
  "fourier-series": {
    question: P("Peut-on construire n’importe quelle onde en additionnant des sinusoïdes ?", "Can any wave be built by adding sine waves?"),
    see: [P("Le signal cherché et la somme des N premières sinusoïdes.", "The target signal and the sum of the first N sine waves."), P("Pour une fréquence n, le produit f(t) sin(2πnt), dont l’aire donne le coefficient bₙ.", "For a frequency n, the product f(t) sin(2πnt), whose area gives the coefficient bₙ.")],
    start: P("Dans la mission « Somme partielle », augmentez le rang N : la somme épouse le signal, sauf près des sauts.", "In the partial-sum mission, increase the order N: the sum hugs the signal, except near the jumps."),
  },
  "fourier-drawing": {
    question: P("Comment des cercles qui tournent peuvent-ils dessiner un contour ?", "How can turning circles draw an outline?"),
    see: [P("Une chaîne de cercles, chacun tournant à sa vitesse.", "A chain of circles, each turning at its own speed."), P("La trace laissée par le bout de la chaîne.", "The trace left by the tip of the chain.")],
    start: P("Dans la mission « Vecteurs conservés », réduisez leur nombre : le contour s’arrondit et perd ses détails.", "In the retained-vectors mission, reduce their number: the outline rounds off and loses its details."),
  },
  tiles: {
    question: P("Les mêmes pièces, réarrangées, peuvent-elles changer d’aire ?", "Can the same pieces, rearranged, change their area?"),
    see: [P("Deux assemblages des mêmes pièces.", "Two arrangements of the same pieces."), P("L’aire de chaque assemblage ; avec « Vraies pièces », le mince écart qui trompe l’œil.", "The area of each arrangement; with “True pieces”, the thin gap that fools the eye.")],
    start: P("Changez la taille des pièces et comparez les aires des deux assemblages.", "Change the size of the pieces and compare the areas of the two arrangements."),
  },
  "euler-primes": {
    question: P("n² + n + 41 donne un nombre premier pour n = 0, 1, 2… mais jusqu’où ?", "n² + n + 41 gives a prime for n = 0, 1, 2… but how far?"),
    see: [P("La valeur de n² + n + c et sa décomposition en facteurs premiers.", "The value of n² + n + c and its prime factorisation.")],
    start: P("Avancez n jusqu’à 40 : le premier échec arrive.", "Move n up to 40: the first failure arrives."),
  },
  fermat: {
    question: P("Fermat pensait que 2^(2ⁿ) + 1 est toujours premier. Avait-il raison ?", "Fermat thought 2^(2ⁿ) + 1 is always prime. Was he right?"),
    see: [P("Le nombre 2^e + 1 et sa décomposition.", "The number 2^e + 1 and its factorisation.")],
    start: P("Essayez e = 1, 2, 4, 8, 16, puis 32.", "Try e = 1, 2, 4, 8, 16, then 32."),
  },
  "circle-regions": {
    question: P("Points sur un cercle, toutes les cordes tracées : le nombre de régions double-t-il toujours ?", "Points on a circle, every chord drawn: does the number of regions always double?"),
    see: [P("Le cercle, ses cordes et les régions comptées sur le dessin.", "The circle, its chords and the regions counted on the drawing.")],
    start: P("Passez de 5 à 6 points : on attend 32 régions.", "Go from 5 to 6 points: 32 regions are expected."),
  },
  buffon: {
    question: P("Lancer des aiguilles sur un parquet peut-il calculer π ?", "Can dropping needles on a floorboard compute π?"),
    see: [P("Le parquet (lignes espacées de 1) et les aiguilles tombées ; celles qui touchent une ligne sont marquées.", "The floor (lines 1 apart) and the dropped needles; those crossing a line are marked."), P("La part d’aiguilles qui croisent et l’estimation de π qu’elle donne.", "The share of crossing needles and the estimate of π it gives.")],
    start: P("Lâchez des aiguilles par centaines et regardez l’estimation se resserrer.", "Drop needles by the hundred and watch the estimate tighten."),
  },
  bertrand: {
    question: P("Une corde « au hasard » dans un cercle : quelle chance qu’elle soit plus longue que le côté du triangle équilatéral inscrit ?", "A chord “at random” in a circle: what chance that it is longer than the side of the inscribed equilateral triangle?"),
    see: [P("Les cordes tirées selon la méthode choisie.", "The chords drawn by the chosen method."), P("La fréquence observée, qui dépend de la méthode.", "The observed frequency, which depends on the method.")],
    start: P("Tirez des cordes avec une méthode, puis changez de méthode.", "Draw chords with one method, then switch methods."),
  },
  "fair-division": {
    question: P("Couper un gâteau en parts que chacun juge justes, quand les goûts diffèrent ?", "Cut a cake into shares everyone finds fair, when tastes differ?"),
    see: [P("Le gâteau en bande, les coupes et la valeur que chaque personne donne à chaque part.", "The cake as a strip, the cuts and the value each person gives each piece."), P("Le verdict : partage proportionnel, sans envie, ou non.", "The verdict: proportional, envy-free, or not.")],
    start: P("Choisissez la personne A, montez sa densité au milieu jusqu’à faire naître l’envie, puis déplacez les coupes pour la faire disparaître.", "Choose person A, raise their density in the middle until envy appears, then move the cuts to make it disappear."),
  },
  "fair-goods": {
    question: P("Partager des objets qu’on ne peut pas couper, sans jaloux ?", "Share objects that cannot be cut, with nobody jealous?"),
    see: [P("Chaque objet, sa valeur pour A et pour B, et à qui il va.", "Each object, its value for A and for B, and who gets it."), P("Les flèches d’envie entre les personnes.", "The envy arrows between the people.")],
    start: P("Donnez un objet à l’autre personne et voyez les flèches changer.", "Give an object to the other person and watch the arrows change."),
  },
  secretary: {
    question: P("Des candidats passent un par un ; on dit oui ou non pour toujours. Comment maximiser la chance de prendre le meilleur ?", "Candidates come one by one; you say yes or no for good. How do you maximise the chance of taking the best?"),
    see: [P("À gauche, les candidats dans l’ordre des entretiens ; la barre dit son rang parmi ceux déjà vus.", "On the left, the candidates in interview order; each bar shows its rank among those seen so far."), P("À droite, la probabilité de gagner selon le nombre r de candidats qu’on laisse passer.", "On the right, the probability of winning according to the number r of candidates let go first.")],
    start: P("Jouez une partie à la main, puis appliquez la règle du seuil.", "Play one game by hand, then apply the threshold rule."),
  },
  tank: {
    question: P("Avec quelques numéros de série relevés, peut-on deviner combien d’engins existent ?", "From a few serial numbers, can you guess how many machines exist?"),
    see: [P("Les numéros observés sur la droite des entiers.", "The observed numbers on the number line."), P("Votre estimation, l’estimateur sans biais N̂, et la dispersion de N̂ sur de nombreux essais.", "Your guess, the unbiased estimator N̂, and how N̂ spreads over many trials.")],
    start: P("Proposez une valeur de N, cliquez « Révéler la population », puis lancez « + 100 essais » pour comparer.", "Propose a value of N, click “Reveal population”, then run “+ 100 trials” to compare."),
  },
  benford: {
    question: P("Pourquoi, dans tant de données réelles, le premier chiffre est-il un 1 environ trois fois sur dix ?", "Why, in so much real data, is the first digit a 1 about three times in ten?"),
    see: [P("Les barres : la part de nombres qui commencent par 1, 2, …, 9.", "The bars: the share of numbers starting with 1, 2, …, 9."), P("Les repères de Benford, log₁₀(1 + 1/d), sur chaque barre pour comparer.", "Benford’s marks, log₁₀(1 + 1/d), on each bar to compare.")],
    start: P("Changez de jeu de données : certains suivent la loi, d’autres pas du tout.", "Change the dataset: some follow the law, others not at all."),
  },
  baker: {
    question: P("Les pains sont-ils trop légers, ou est-ce le hasard des pesées ?", "Is the bread underweight, or is it chance in the weighing?"),
    see: [P("Les masses des pains pesés et leur moyenne.", "The weights of the loaves and their mean."), P("Le test : à quel point cette moyenne serait surprenante si le boulanger était honnête.", "The test: how surprising that mean would be if the baker were honest.")],
    start: P("Réglez la moyenne vraie à 995 g, puis pesez plus de pains : cette petite triche devient détectable.", "Set the true mean to 995 g, then weigh more loaves: this small cheat becomes detectable."),
  },
  birthdays: {
    question: P("Combien de personnes faut-il pour que deux aient probablement le même anniversaire ?", "How many people are needed for two to probably share a birthday?"),
    see: [P("Le calendrier : chaque case remplie est un anniversaire, les doublons sont marqués.", "The calendar: each filled cell is a birthday, duplicates are marked."), P("La courbe de la probabilité d’un doublon selon le nombre de personnes.", "The curve of the probability of a match against the number of people.")],
    start: P("Mettez 23 personnes et lancez des expériences.", "Set 23 people and run experiments."),
  },
  monty: {
    question: P("Trois portes, une voiture ; l’animateur ouvre une porte vide. Faut-il changer ?", "Three doors, one car; the host opens an empty door. Should you switch?"),
    see: [P("Les portes, et le décompte des victoires selon la stratégie.", "The doors, and the tally of wins by strategy."), P("L’arbre des cas qui explique le résultat.", "The tree of cases that explains the result.")],
    start: P("Jouez quelques parties, puis répétez « changer » mille fois.", "Play a few games, then repeat “switch” a thousand times."),
  },
  "monte-carlo-pi": {
    question: P("Des points jetés au hasard dans un carré peuvent-ils révéler π ?", "Can random points thrown into a square reveal π?"),
    see: [P("Le carré de côté 2, le disque de rayon 1, les points dedans et dehors.", "The square of side 2, the disc of radius 1, the points inside and outside."), P("4 × (part des points dans le disque), avec son intervalle de confiance.", "4 × (share of points in the disc), with its confidence interval.")],
    start: P("Lancez des essais et regardez l’intervalle se resserrer autour de π.", "Run trials and watch the interval close in on π."),
  },
  "monte-carlo-lake": {
    question: P("Comment mesurer l’aire d’un lac de forme quelconque avec des points au hasard ?", "How do you measure the area of an odd-shaped lake with random points?"),
    see: [P("Le terrain, le lac et les points qui tombent dans l’eau.", "The land, the lake and the points landing in the water."), P("L’aire estimée et sa marge d’erreur.", "The estimated area and its margin of error.")],
    start: P("Dessinez un lac, puis lancez des essais.", "Draw a lake, then run trials."),
  },
  "monte-carlo-integral": {
    question: P("Une intégrale est-elle la moyenne d’une fonction ?", "Is an integral the average of a function?"),
    see: [P("La fonction, et les valeurs prises en des points tirés au hasard.", "The function, and its values at randomly drawn points."), P("La moyenne de ces valeurs multipliée par la largeur de l’intervalle, à comparer à l’intégrale exacte.", "The mean of those values times the width of the interval, to compare with the exact integral.")],
    start: P("Lancez des essais et suivez l’erreur qui diminue.", "Run trials and follow the shrinking error."),
  },
  "monte-carlo-walk": {
    question: P("Un marcheur fait des pas au hasard : atteindra-t-il le but avant de tomber ?", "A walker takes random steps: will they reach the goal before falling?"),
    see: [P("Des marches au hasard entre la limite basse L et le but U.", "Random walks between the lower stop L and the goal U."), P("La part de marches qui atteignent le but, et la valeur exacte.", "The share of walks reaching the goal, and the exact value.")],
    start: P("Rapprochez le but et voyez la probabilité monter.", "Bring the goal closer and watch the probability rise."),
  },
  "double-pendulum": {
    question: P("Deux pendules presque identiques : leurs avenirs restent-ils proches ?", "Two almost identical pendulums: do their futures stay close?"),
    see: [P("Deux doubles pendules lancés avec un tout petit écart.", "Two double pendulums started with a tiny difference."), P("Leur écart au fil du temps, qui finit par exploser.", "Their difference over time, which ends up exploding.")],
    start: P("Avancez le temps : d’abord ensemble, puis plus rien en commun.", "Move time forward: first together, then nothing in common."),
  },
  "three-body": {
    question: P("Trois corps qui s’attirent : peut-on prévoir leur danse ?", "Three bodies attracting each other: can their dance be predicted?"),
    see: [P("Les trajectoires des trois corps sous la gravitation.", "The paths of the three bodies under gravity."), P("Les contrôles : énergie et moment cinétique conservés par le calcul.", "The checks: energy and angular momentum kept by the computation.")],
    start: P("Choisissez une configuration, puis touchez à peine une vitesse.", "Choose a configuration, then barely touch one velocity."),
  },
  logistic: {
    question: P("Une population qui grandit puis sature : stable, en cycles ou chaotique ?", "A population that grows then saturates: steady, in cycles or chaotic?"),
    see: [P("L’escalier de xₙ₊₁ = r xₙ (1 − xₙ) sur la parabole.", "The staircase of xₙ₊₁ = r xₙ (1 − xₙ) on the parabola."), P("La population génération après génération, et le diagramme de bifurcation selon r.", "The population generation after generation, and the bifurcation diagram against r.")],
    start: P("Montez r de 2,8 à 3,2 : l’équilibre se dédouble ; continuez jusqu’à 3,6 : les cycles laissent place au chaos.", "Raise r from 2.8 to 3.2: the equilibrium splits; go on to 3.6: the cycles give way to chaos."),
  },
  illumination: {
    question: P("Une lampe dans une pièce aux murs miroirs éclaire-t-elle toujours tout ?", "Does a lamp in a room with mirror walls always light everything?"),
    see: [P("La pièce, la lampe et les rayons qui rebondissent.", "The room, the lamp and the bouncing rays."), P("Les zones que les rayons tracés n’atteignent pas, hachurées (ce n’est pas une preuve d’obscurité).", "The areas the traced rays do not reach, hatched (this is not a proof of darkness).")],
    start: P("Dans la pièce de Penrose, augmentez les réflexions maximales et regardez les zones hachurées.", "In Penrose’s room, increase the maximum reflections and watch the hatched areas."),
  },
  "hairy-ball": {
    question: P("Peut-on peigner une sphère chevelue sans faire d’épi ?", "Can a hairy sphere be combed without a cowlick?"),
    see: [P("Une sphère en 3D (ou le cercle S¹) couverte de petites flèches tangentes.", "A sphere in 3D (or the circle S¹) covered with small tangent arrows."), P("Les points où la flèche s’annule : les épis.", "The points where the arrow vanishes: the cowlicks.")],
    start: P("Passez de « Projection sur la sphère » à « Rotation sur la sphère » : il reste toujours au moins un épi ; sur le cercle S¹, aucun.", "Switch from “Projection on the sphere” to “Rotation on the sphere”: at least one cowlick always remains; on the circle S¹, none."),
  },
  "nonorientable-surfaces": {
    question: P("Une surface peut-elle n’avoir qu’une seule face ?", "Can a surface have only one side?"),
    see: [P("Le ruban de Möbius ou la bouteille de Klein, en 3D.", "The Möbius strip or the Klein bottle, in 3D."), P("Une petite flèche normale que l’on transporte le long de la surface.", "A small normal arrow carried along the surface.")],
    start: P("Faites faire un tour complet à la flèche : elle revient à l’envers.", "Carry the arrow once around: it comes back upside down."),
  },
  "banach-tarski-model": {
    question: P("Peut-on couper un ensemble fini en morceaux et en refaire deux copies ?", "Can a finite set be cut into pieces and reassembled into two copies?"),
    see: [P("Des points à répartir entre deux tas A et B.", "Points to share between two heaps A and B."), P("Le compte qui montre pourquoi c’est impossible avec un nombre fini de points.", "The count that shows why it is impossible with finitely many points.")],
    start: P("Essayez de faire deux copies : le compte vous en empêche.", "Try to make two copies: the count stops you."),
  },
  "banach-tarski-tree": {
    question: P("Comment un arbre infini peut-il contenir deux copies de lui-même ?", "How can an infinite tree contain two copies of itself?"),
    see: [P("L’arbre des mots en a, A, b, B, dessiné jusqu’à une profondeur.", "The tree of words in a, A, b, B, drawn to some depth."), P("Une copie obtenue en déplaçant une branche, et les trous qui ne se voient qu’à profondeur finie.", "A copy obtained by moving one branch, and the holes visible only at finite depth.")],
    start: P("Avec « Copie 1 : W(a) et a·W(A) », passez la profondeur de 1 à 3 et comptez les trous (cercles creux).", "With “Copy 1: W(a) and a·W(A)”, take the depth from 1 to 3 and count the holes (hollow circles)."),
  },
  "ferris-wheel": {
    question: P("Sur une grande roue, comment la hauteur d’une nacelle varie-t-elle avec le temps ?", "On an observation wheel, how does a seat’s height change with time?"),
    see: [P("La roue et la nacelle marquée.", "The wheel and the marked seat."), P("La courbe de sa hauteur en fonction du temps : une sinusoïde.", "The curve of its height against time: a sine wave.")],
    start: P("Avancez le temps et repérez quand la nacelle est au plus haut.", "Move time forward and find when the seat is highest."),
  },
  eratosthenes: {
    question: P("Comment mesurer la Terre avec deux bâtons et leurs ombres ?", "How can the Earth be measured with two sticks and their shadows?"),
    see: [P("Une coupe de la Terre, deux villes, deux bâtons verticaux et les rayons parallèles du Soleil.", "A section of the Earth, two towns, two vertical sticks and the parallel rays of the Sun."), P("L’écart des angles des ombres, égal à l’angle au centre.", "The difference of the shadow angles, equal to the angle at the centre.")],
    start: P("Éloignez Alexandrie de Syène : l’ombre d’Alexandrie et l’angle au centre grandissent ensemble.", "Move Alexandria away from Syene: Alexandria’s shadow and the angle at the centre grow together."),
  },
  shuffles: {
    question: P("Si l’on répète toujours le même mélange d’un paquet de cartes, les cartes reviennent-elles un jour dans l’ordre ? Quand ?", "If the same shuffle of a deck is repeated over and over, do the cards ever come back in order? When?"),
    see: [P("Les cartes numérotées, chacune à sa position.", "The numbered cards, each at its position."), P("Au-dessus, les flèches du mélange σ : la carte d’une position part au bout de sa flèche ; une couleur par cycle.", "Above, the arrows of the shuffle σ: the card at a position goes to the end of its arrow; one colour per cycle.")],
    start: P("Cliquez « Appliquer σ » plusieurs fois et comptez jusqu’au retour de l’ordre.", "Click “Apply σ” several times and count until the order comes back."),
  },
  polygon: {
    question: P("De combien de façons peut-on reposer un polygone dans son trou, et l’ordre des mouvements compte-t-il ?", "In how many ways can a polygon be put back into its hole, and does the order of the moves matter?"),
    see: [P("Le polygone, ses coins numérotés et un drapeau qui montre s’il est retourné.", "The polygon, its numbered corners and a flag that shows whether it is flipped."), P("À droite, toutes ses symétries ; celle où l’on se trouve est entourée.", "On the right, all its symmetries; the current one is ringed.")],
    start: P("Faites r puis τ, revenez au départ, puis τ puis r : comparez.", "Do r then τ, go back to the start, then τ then r: compare."),
  },
  rubik: {
    question: P("Si l’on répète une suite de mouvements du Rubik’s cube, combien de fois avant qu’il redevienne neuf ?", "Repeating a sequence of Rubik’s cube moves, how many times before it is back to new?"),
    see: [P("Le cube en 3D ; chaque mouvement tourne une face d’un quart de tour.", "The cube in 3D; each move turns one face by a quarter turn."), P("Sous le cube : la séquence, son ordre, et combien de petits cubes ont bougé.", "Under the cube: the sequence, its order, and how many small cubes moved.")],
    start: P("Choisissez R U et cliquez « Jusqu’au retour » : 105 répétitions.", "Choose R U and click “Until it comes back”: 105 repetitions."),
  },
};

// What can be moved or pressed, read from the experiment's controls (labels only, duplicates removed).
export function touchList(exp, t) {
  const seen = new Set(), out = [];
  for (const c of Object.values(exp.controls || {})) {
    if (!c?.label || c.hidden === true) continue;
    const label = t(c.label).replace(/\s*\(.*\)\s*$/, "");
    const kind = c.kind === "handle" ? ["à tirer", "drag"] : c.kind === "action" ? ["boutons", "buttons"] : c.kind === "choice" ? ["à choisir", "choose"] : ["curseur", "slider"];
    const key = label + kind[0];
    if (seen.has(key)) continue;
    seen.add(key); out.push([label, t(kind)]);
  }
  return out.slice(0, 6);
}
