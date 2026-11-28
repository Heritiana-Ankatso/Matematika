// The Musée of design v8 (docs/DESIGN_V8.md section 3, docs/REBUILD_PLAN.md stage 3): the curated selection only. Every
// entry is named by the id it has in its collection; titles and counts are read from the sources through the generated
// world-lines.js, never typed here (tests/v8-musee.test.mjs checks that every id exists).
const P = (fr, en) => [fr, en];

// Where each collection's entries live on the site.
export const HREF = {
  curiosities: (x) => '#gallery/' + x.id,
  intuition: (x) => x.hash,
  fractals: (x) => x.hash,
  lab: (x) => '#lab/' + x.id,
  challenges: (x) => '#challenges/' + x.id,
  people: (x) => '#history/people/' + x.id,
  advances: (x) => '#history/advances/' + x.id,
  stories: (x) => '#stories/' + x.id,
  biographies: (x) => '#biographies/' + x.id,
  errors: (x) => '#errors/' + x.id,
};

// The eight rooms, "Salle I" to "Salle VIII": the collections they hold (with the word that counts their entries), the
// address of the whole room, a promise, the small drawing of the room's door, and a few entries shown when it opens.
export const ROOMS = [
  { id: 'curiosites', name: P('Curiosités', 'Curiosities'), hash: '#gallery', art: 'reuleaux',
    count: [['curiosities', P('pièce', 'exhibit'), P('pièces', 'exhibits')]],
    promise: P('Des objets étonnants à toucher, tourner, déformer.', 'Surprising objects to touch, turn and deform.'),
    picks: [['curiosities', 'galton'], ['curiosities', 'reuleaux'], ['curiosities', 'platonic'], ['curiosities', 'chaos'], ['curiosities', 'mandelbrot'], ['curiosities', 'moving-sofa'], ['curiosities', 'benford-gallery']] },
  { id: 'intuition', name: P('Contre l’intuition', 'Against intuition'), hash: '#intuition', art: 'pi',
    count: [['intuition', P('pièce', 'exhibit'), P('pièces', 'exhibits')]],
    promise: P('Là où le bon sens se trompe, et pourquoi.', 'Where common sense goes wrong, and why.'),
    picks: [['intuition', 'collisions'], ['intuition', 'napkin-ring'], ['intuition', 'hundred-boxes'], ['intuition', 'birthdays'], ['intuition', 'monty'], ['intuition', 'circle-regions']] },
  { id: 'fractales', name: P('Fractales', 'Fractals'), hash: '#fractals', art: 'koch',
    count: [['fractals', P('figure', 'figure'), P('figures', 'figures')]],
    promise: P('Des formes infinies nées d’une règle simple.', 'Infinite shapes born from a simple rule.'),
    picks: [['fractals', 'koch-snowflake'], ['fractals', 'sierpinski-carpet'], ['fractals', 'dragon-curve'], ['fractals', 'barnsley-fern'], ['fractals', 'menger-sponge'], ['fractals', 'apollonian-gasket']] },
  { id: 'laboratoire', name: P('Laboratoire', 'Laboratory'), hash: '#lab', art: 'curve',
    count: [['lab', P('expérience', 'experiment'), P('expériences', 'experiments')]],
    promise: P('Bouger, prévoir, vérifier : expérimenter avant de démontrer.', 'Move, predict, check: experiment before proving.'),
    picks: [['lab', 'quadratic'], ['lab', 'trig'], ['lab', 'derivative'], ['lab', 'integral'], ['lab', 'probability'], ['lab', 'statistics']] },
  { id: 'defis', name: P('Défis', 'Challenges'), hash: '#challenges', art: 'bridges',
    count: [['challenges', P('défi', 'challenge'), P('défis', 'challenges')]],
    promise: P('Des énigmes à résoudre, sans limite de temps.', 'Puzzles to solve, with no time limit.'),
    picks: [['challenges', 'gauss-sum'], ['challenges', 'doors'], ['challenges', 'hanoi'], ['challenges', 'eggs'], ['challenges', 'konigsberg'], ['challenges', 'josephus']] },
  { id: 'chronologies', name: P('Chronologies', 'Timelines'), hash: '#history/advances', art: 'time',
    count: [['people', P('mathématicien', 'mathematician'), P('mathématiciens', 'mathematicians')], ['advances', P('avancée', 'advance'), P('avancées', 'advances')]],
    promise: P('Cinq mille ans d’idées, de Babylone à aujourd’hui.', 'Five thousand years of ideas, from Babylon to today.'),
    picks: [['advances', 'babylonian-calculation'], ['advances', 'rhind'], ['advances', 'nine-chapters'], ['people', 'hypatia'], ['advances', 'al-jabr'], ['advances', 'liber-abaci']] },
  { id: 'lire', name: P('Histoires et biographies', 'Stories and biographies'), hash: '#stories', art: 'book',
    count: [['stories', P('histoire', 'story'), P('histoires', 'stories')], ['biographies', P('biographie', 'biography'), P('biographies', 'biographies')]],
    promise: P('Les femmes et les hommes derrière les idées.', 'The women and men behind the ideas.'),
    picks: [['stories', 'gauss-sum'], ['stories', 'zero-history'], ['stories', 'germain-letter'], ['stories', 'four-colours-history'], ['biographies', 'galois'], ['biographies', 'hypatia']] },
  { id: 'erreurs', name: P('Erreurs célèbres', 'Famous errors'), hash: '#errors', art: 'cross',
    count: [['errors', P('erreur', 'error'), P('erreurs', 'errors')]],
    promise: P('Comprendre une erreur, c’est apprendre deux fois.', 'Understanding an error is learning twice.'),
    picks: [['errors', 'square-of-sum'], ['errors', 'root-of-sum'], ['errors', 'cancel-a-term'], ['errors', 'square-inequality'], ['errors', 'log-of-sum']] },
];

// "Là où on ne les attend pas": everyday places where a curiosity is studied seriously. The question is the curiosity's
// own title; `where` names the place.
export const UNEXPECTED = [
  { id: 'benford-gallery', where: P('Audit des comptes', 'Auditing accounts') },
  { id: 'tank-gallery', where: P('Seconde Guerre mondiale', 'The Second World War') },
  { id: 'secretary-gallery', where: P('Recruter, choisir un logement', 'Hiring, choosing a flat') },
  { id: 'hairy-ball-gallery', where: P('Le vent sur la Terre', 'The wind on Earth') },
  { id: 'birthdays-gallery', where: P('Une classe de 23 élèves', 'A class of 23 pupils') },
  { id: 'fair-division-gallery', where: P('Partager un héritage', 'Sharing an inheritance') },
  { id: 'gomboc', where: P('Les carapaces de tortues', 'Tortoise shells') },
  { id: 'mirrored-rooms', where: P('Lumière et miroirs', 'Light and mirrors') },
];

// The exhibit of the day: one curiosity per calendar day, the same for everyone (no server), in the order of the
// collection. `day` is the number of days since 1 January 1970 in local time.
export const dayNumber = (date = new Date()) => Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
export const exhibitOfTheDay = (curiosities, date = new Date()) => (curiosities.length ? curiosities[dayNumber(date) % curiosities.length] : null);

// The room of a curiosity page (#gallery/<id>): the curiosities' room.
export const roomOfExhibit = () => ROOMS[0];
export const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
