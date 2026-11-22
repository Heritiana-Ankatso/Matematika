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
    see: [P("À gauche, le cercle de rayon 1 et le point P repéré par l’angle t.", "On the left, the circle of radius 1 and the point P at angle t."), P("À droite, la courbe obtenue en reportant une coordonnée de P en fonction de t.", "On the right, the curve obtained by plotting one coordinate of P against t.")],
    start: P("Faites tourner P sur le cercle et regardez le point de la courbe suivre.", "Turn P around the circle and watch the point of the curve follow."),
  },
  sequences: {
    question: P("Ajouter toujours le même nombre, ou multiplier toujours par le même : où cela mène-t-il ?", "Always add the same number, or always multiply by the same: where does it lead?"),
    see: [P("Les points (n ; uₙ) : chaque point est un terme de la suite.", "The points (n, uₙ): each point is a term of the sequence."), P("En bas, les valeurs des premiers termes.", "Below, the values of the first terms.")],
    start: P("Choisissez « arithmétique », tirez u₁ au-dessus de u₀, puis passez à « géométrique » sans bouger.", "Choose “arithmetic”, drag u₁ above u₀, then switch to “geometric” without moving."),
  },
  derivative: {
    question: P("Que devient la droite qui passe par deux points d’une courbe quand ces points se rapprochent ?", "What happens to the line through two points of a curve when the points come together?"),
    see: [P("Une courbe, un point fixe A et un point mobile B.", "A curve, a fixed point A and a moving point B."), P("La sécante (AB) et sa pente ; à la fin, la tangente en A.", "The secant (AB) and its slope; at the end, the tangent at A.")],
    start: P("Diminuez |h| : B se rapproche de A et la pente se stabilise.", "Decrease |h|: B moves towards A and the slope settles."),
  },
  integral: {
    question: P("Comment mesurer l’aire sous une courbe avec des rectangles ?", "How can the area under a curve be measured with rectangles?"),
    see: [P("La courbe, les bornes a et b, et n rectangles posés dessous.", "The curve, the bounds a and b, and n rectangles placed under it."), P("La somme des aires des rectangles, comparée à l’aire exacte.", "The total area of the rectangles, compared with the exact area.")],
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
  line: {
    question: P("Deux points suffisent-ils pour connaître une droite et son équation ?", "Are two points enough to know a line and its equation?"),
    see: [P("Les points A et B, la droite qui les joint.", "The points A and B, the line through them."), P("Sa pente et son ordonnée à l’origine, en fractions exactes.", "Its slope and intercept, as exact fractions.")],
    start: P("Mettez A et B à la même hauteur : la pente vaut 0.", "Put A and B at the same height: the slope is 0."),
  },
  exponential: {
    question: P("Multiplier à chaque pas par le même facteur : pourquoi la courbe finit-elle par exploser ?", "Multiplying by the same factor at each step: why does the curve end up exploding?"),
    see: [P("Les points (n ; k × aⁿ) et la courbe qui les relie.", "The points (n, k × aⁿ) and the curve through them."), P("Le facteur a lu entre les points d’abscisses 0 et 1.", "The factor a read between the points at 0 and 1.")],
    start: P("Passez a de 1,1 à 0,9 : la croissance devient décroissance.", "Move a from 1.1 to 0.9: growth turns into decay."),
  },
  cobweb: {
    question: P("Une suite définie par uₙ₊₁ = f(uₙ) : où va-t-elle ?", "A sequence defined by uₙ₊₁ = f(uₙ): where does it go?"),
    see: [P("La droite de f et la diagonale y = x.", "The line of f and the diagonal y = x."), P("L’escalier : on monte à f, on revient sur la diagonale, et ainsi de suite.", "The staircase: up to f, across to the diagonal, and so on.")],
    start: P("Augmentez n et voyez si l’escalier converge vers le croisement.", "Increase n and see whether the staircase closes in on the crossing."),
  },
  matrix: {
    question: P("Une matrice 2 × 2 : que fait-elle au plan tout entier ?", "A 2 × 2 matrix: what does it do to the whole plane?"),
    see: [P("À gauche le quadrillage de départ, à droite son image.", "On the left the starting grid, on the right its image."), P("Les images des vecteurs i et j : ce sont les colonnes de la matrice.", "The images of the vectors i and j: they are the columns of the matrix.")],
    start: P("Tirez l’image de i : tout le quadrillage se déforme avec.", "Drag the image of i: the whole grid deforms with it."),
  },
  "space-lines": {
    question: P("Une droite de l’espace traverse-t-elle un plan, et où ?", "Does a line in space cross a plane, and where?"),
    see: [P("Un plan, une droite passant par A et B, en vraie 3D.", "A plane, a line through A and B, in true 3D."), P("Le point d’intersection quand il existe ; en pointillés, ce qui est caché.", "The intersection point when it exists; dashed, what is hidden.")],
    start: P("Faites tourner la vue en tirant le fond, puis levez B jusqu’à rendre la droite parallèle au plan.", "Turn the view by dragging the background, then raise B until the line is parallel to the plane."),
  },
  "fourier-series": {
    question: P("Peut-on construire n’importe quelle onde en additionnant des sinusoïdes ?", "Can any wave be built by adding sine waves?"),
    see: [P("Le signal cherché et la somme des N premières sinusoïdes.", "The target signal and the sum of the first N sine waves."), P("Les amplitudes de chaque fréquence.", "The amplitude of each frequency.")],
    start: P("Augmentez l’ordre N : la somme épouse le signal, sauf près des sauts.", "Increase the order N: the sum hugs the signal, except near the jumps."),
  },
  "fourier-drawing": {
    question: P("Comment des cercles qui tournent peuvent-ils dessiner un contour ?", "How can turning circles draw an outline?"),
    see: [P("Une chaîne de cercles, chacun tournant à sa vitesse.", "A chain of circles, each turning at its own speed."), P("La trace laissée par le bout de la chaîne.", "The trace left by the tip of the chain.")],
    start: P("Réduisez le nombre de vecteurs : le dessin devient flou, puis grossier.", "Reduce the number of vectors: the drawing blurs, then coarsens."),
  },
  tiles: {
    question: P("Les mêmes pièces, réarrangées, peuvent-elles changer d’aire ?", "Can the same pieces, rearranged, change their area?"),
    see: [P("Deux assemblages des mêmes pièces.", "Two arrangements of the same pieces."), P("L’aire de chaque assemblage et le mince écart qui trompe l’œil.", "The area of each arrangement and the thin gap that fools the eye.")],
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
    question: P("Une corde « au hasard » dans un cercle : quelle chance qu’elle soit plus longue que le côté du triangle inscrit ?", "A chord “at random” in a circle: what chance that it is longer than the side of the inscribed triangle?"),
    see: [P("Les cordes tirées selon la méthode choisie.", "The chords drawn by the chosen method."), P("La fréquence observée, qui dépend de la méthode.", "The observed frequency, which depends on the method.")],
    start: P("Tirez des cordes avec une méthode, puis changez de méthode.", "Draw chords with one method, then switch methods."),
  },
  "fair-division": {
    question: P("Couper un gâteau en parts que chacun juge justes, quand les goûts diffèrent ?", "Cut a cake into shares everyone finds fair, when tastes differ?"),
    see: [P("Le gâteau en bande, les coupes et la valeur que chaque personne donne à chaque part.", "The cake as a strip, the cuts and the value each person gives each piece."), P("Le verdict : partage proportionnel, sans envie, ou non.", "The verdict: proportional, envy-free, or not.")],
    start: P("Déplacez une coupe jusqu’à ce que plus personne n’envie l’autre.", "Move a cut until nobody envies anybody."),
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
    see: [P("Les numéros observés sur la droite des entiers.", "The observed numbers on the number line."), P("Votre estimation, celle qui est sans biais, et leur dispersion sur de nombreux essais.", "Your guess, the unbiased one, and how they spread over many trials.")],
    start: P("Proposez une valeur de N, puis lancez des expériences pour comparer.", "Propose a value of N, then run experiments to compare."),
  },
  benford: {
    question: P("Pourquoi, dans tant de données réelles, le premier chiffre est-il un 1 environ trois fois sur dix ?", "Why, in so much real data, is the first digit a 1 about three times in ten?"),
    see: [P("Les barres : la part de nombres qui commencent par 1, 2, …, 9.", "The bars: the share of numbers starting with 1, 2, …, 9."), P("La courbe de Benford, log₁₀(1 + 1/d), pour comparer.", "Benford’s curve, log₁₀(1 + 1/d), to compare.")],
    start: P("Changez de jeu de données : certains suivent la loi, d’autres pas du tout.", "Change the dataset: some follow the law, others not at all."),
  },
  baker: {
    question: P("Les pains sont-ils trop légers, ou est-ce le hasard des pesées ?", "Is the bread underweight, or is it chance in the weighing?"),
    see: [P("Les masses des pains pesés et leur moyenne.", "The weights of the loaves and their mean."), P("Le test : à quel point cette moyenne serait surprenante si le boulanger était honnête.", "The test: how surprising that mean would be if the baker were honest.")],
    start: P("Pesez plus de pains : la même petite triche devient détectable.", "Weigh more loaves: the same small cheat becomes detectable."),
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
    see: [P("Le carré, le quart de disque, les points dedans et dehors.", "The square, the quarter disc, the points inside and outside."), P("4 × (part des points dans le disque), avec son intervalle de confiance.", "4 × (share of points in the disc), with its confidence interval.")],
    start: P("Lancez des essais et regardez l’intervalle se resserrer autour de π.", "Run trials and watch the interval close in on π."),
  },
  "monte-carlo-lake": {
    question: P("Comment mesurer l’aire d’un lac de forme quelconque avec des points au hasard ?", "How do you measure the area of an odd-shaped lake with random points?"),
    see: [P("Le terrain, le lac et les points qui tombent dans l’eau.", "The land, the lake and the points landing in the water."), P("L’aire estimée et sa marge d’erreur.", "The estimated area and its margin of error.")],
    start: P("Dessinez un lac, puis lancez des essais.", "Draw a lake, then run trials."),
  },
  "monte-carlo-integral": {
    question: P("Une intégrale est-elle la moyenne d’une fonction ?", "Is an integral the average of a function?"),
    see: [P("La fonction, et les valeurs prises en des points tirés au hasard.", "The function, and its values at randomly drawn points."), P("La moyenne de ces valeurs, comparée à l’intégrale exacte.", "The mean of those values, compared with the exact integral.")],
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
    see: [P("Les trajectoires des trois corps sous la gravitation.", "The paths of the three bodies under gravity."), P("Les contrôles : énergie et moment conservés par le calcul.", "The checks: energy and momentum kept by the computation.")],
    start: P("Choisissez une configuration, puis touchez à peine une vitesse.", "Choose a configuration, then barely touch one velocity."),
  },
  logistic: {
    question: P("Une population qui grandit puis sature : stable, en cycles ou chaotique ?", "A population that grows then saturates: steady, in cycles or chaotic?"),
    see: [P("L’escalier de xₙ₊₁ = r xₙ (1 − xₙ) sur la parabole.", "The staircase of xₙ₊₁ = r xₙ (1 − xₙ) on the parabola."), P("La population génération après génération, et le diagramme de bifurcation selon r.", "The population generation after generation, and the bifurcation diagram against r.")],
    start: P("Montez r de 2,8 à 3,6 et regardez l’équilibre se dédoubler.", "Raise r from 2.8 to 3.6 and watch the equilibrium split."),
  },
  illumination: {
    question: P("Une lampe dans une pièce aux murs miroirs éclaire-t-elle toujours tout ?", "Does a lamp in a room with mirror walls always light everything?"),
    see: [P("La pièce, la lampe et les rayons qui rebondissent.", "The room, the lamp and the bouncing rays."), P("Les zones restées sombres, hachurées.", "The areas left dark, hatched.")],
    start: P("Choisissez la pièce de Penrose et augmentez le nombre de reflets.", "Choose Penrose’s room and increase the number of reflections."),
  },
  "hairy-ball": {
    question: P("Peut-on peigner une sphère chevelue sans faire d’épi ?", "Can a hairy sphere be combed without a cowlick?"),
    see: [P("Une sphère en 3D couverte de petites flèches tangentes.", "A sphere in 3D covered with small tangent arrows."), P("Les points où la flèche s’annule : les épis.", "The points where the arrow vanishes: the cowlicks.")],
    start: P("Changez de champ : il reste toujours au moins un épi.", "Change the field: at least one cowlick always remains."),
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
    start: P("Choisissez la copie a·W(A) et augmentez la profondeur.", "Choose the copy a·W(A) and increase the depth."),
  },
  "ferris-wheel": {
    question: P("Sur une grande roue, comment la hauteur d’une nacelle varie-t-elle avec le temps ?", "On an observation wheel, how does a seat’s height change with time?"),
    see: [P("La roue et la nacelle marquée.", "The wheel and the marked seat."), P("La courbe de sa hauteur en fonction du temps : une sinusoïde.", "The curve of its height against time: a sine wave.")],
    start: P("Avancez le temps et repérez quand la nacelle est au plus haut.", "Move time forward and find when the seat is highest."),
  },
  eratosthenes: {
    question: P("Comment mesurer la Terre avec deux bâtons et leurs ombres ?", "How can the Earth be measured with two sticks and their shadows?"),
    see: [P("Une coupe de la Terre, deux villes, deux bâtons verticaux et les rayons parallèles du Soleil.", "A section of the Earth, two towns, two vertical sticks and the parallel rays of the Sun."), P("L’écart des angles des ombres, égal à l’angle au centre.", "The difference of the shadow angles, equal to the angle at the centre.")],
    start: P("Éloignez Alexandrie : l’angle grandit dans la même proportion que la distance.", "Move Alexandria away: the angle grows in proportion to the distance."),
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
