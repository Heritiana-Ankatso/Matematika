// Design v8, stage 2: the foundation sampler, for the owner's review and the browser tests (contrast, overflow, reduced
// motion). `#v8` lists the five grounds, `#v8/<world>` shows one world with its type roles, its colours and every
// shared component (top bar and world menu, folded list, side sheet, outline, deck controls). Exists only under `?v8`.
import { WORLDS } from '../v8.js';
import { E, topBar, foldList, foldGroup, bindMenu, sheet, bindSheets, outline, bindOutline, deckBar, setProjectionGround } from './kit.js';

const NAMES = {
  home: [['Le seuil', 'The threshold'], ['Quatre mondes, une seule passion.', 'Four worlds, one passion.']],
  musee: [['Musée', 'Museum'], ['Solennel : des galeries de curiosités et les chronologies des grands esprits.', 'Solemn: galleries of curiosities and timelines of great minds.']],
  univ: [['Université', 'University'], ['Envoûtant : vivre à la frontière du savoir, dans l’immensité des mathématiques.', 'Mesmerising: living at the edge of knowledge, in the vastness of mathematics.']],
  lycee: [['Lycée', 'Lycée'], ['Bâtir le sol du savoir à venir : jeune, joueur, dynamique, curieux.', 'Building the ground of the knowledge to come: young, playful, dynamic, curious.']],
  olymp: [['Olympiades', 'Olympiads'], ['Un lieu de compétition : exigeant, rapide, tranchant.', 'A competitive place: challenging, fast, sharp.']],
};
const ROLES = [['Titres', 'Titles', '--w-head'], ['Lecture', 'Reading', '--w-text'], ['Interface', 'Interface', '--w-ui'], ['Chiffres', 'Figures', '--w-mono']];
const SWATCHES = ['--w-bg', '--w-surface', '--w-raise', '--w-rule', '--w-ink', '--w-muted', '--w-accent', '--w-accent2', '--w-warn'];

export function samplerPage(world, { t, siteName }) {
  if (!WORLDS.includes(world)) {
    return `<div class="v8">${topBar({ t, world: '', siteName })}<main id="main" tabindex="-1" class="v8-wrap"><h1>${E(t(['Design v8 : les fondations', 'Design v8: the foundation']))}</h1><ul class="v8-list">${WORLDS.map((w) => `<li><a href="#v8/${w}">${E(t(NAMES[w][0]))}</a></li>`).join('')}</ul></main></div>`;
  }
  const [name, feeling] = NAMES[world];
  const sections = [
    { id: 'v8-type', num: '1', title: E(t(['Les caractères', 'Type'])) },
    { id: 'v8-colours', num: '2', title: E(t(['Les couleurs', 'Colours'])) },
    { id: 'v8-parts', num: '3', title: E(t(['Les composants', 'Components'])) },
  ];
  const sign = world === 'musee' ? `<p><span class="v8-placard">${E(t(['Salle I', 'Room I']))}</span></p><div class="v8-cartel"><b>${E(t(['Cartel', 'Label']))}</b>${E(t(['Chaque pièce porte son cartel : ce qu’elle montre, d’où elle vient.', 'Each exhibit carries its label: what it shows, where it comes from.']))}</div>`
    : world === 'univ' ? `<p class="v8-coord">N 47° 12′ · ${E(t(['coordonnées', 'coordinates']))}</p>`
    : world === 'olymp' ? `<p class="v8-figure-mono">50 · 20 · 19 · 11</p>`
    : world === 'lycee' ? `<div class="v8-frame-def"><b>${E(t(['Définition', 'Definition']))}</b> ${E(t(['Un cadre vert entoure une définition.', 'A green frame surrounds a definition.']))}</div><div class="v8-frame-thm"><b>${E(t(['Théorème', 'Theorem']))}</b> ${E(t(['Un cadre rouge entoure un théorème.', 'A red frame surrounds a theorem.']))}</div><p>${E(t(['On souligne deux fois un', 'A key word is underlined twice:']))} <span class="v8-key">${E(t(['mot clé', 'key word']))}</span>.</p>`
    : '';
  const folds = foldList([1, 2, 3].map((n) => ({ id: 'f' + n, title: E(t([`Pli ${n}`, `Fold ${n}`])), body: `<ul class="v8-list"><li><a href="#v8/${world}"><span class="v8-num">${n}</span><span>${E(t(['Une entrée du pli', 'An entry of the fold']))}</span></a></li></ul>` })), 'v8-sample');
  const body = `<section id="v8-type"><h2>${sections[0].title}</h2>${ROLES.map(([fr, en, v]) => `<p style="font-family:var(${v})"><b>${E(t([fr, en]))}</b> · ${E(t(['Les mathématiques se voient.', 'Mathematics can be seen.']))} 0123456789</p>`).join('')}${sign}</section>`
    + `<section id="v8-colours"><h2>${sections[1].title}</h2><ul class="v8-list v8-swatches">${SWATCHES.map((v) => `<li><span><i style="display:inline-block;width:28px;height:28px;border:1px solid var(--w-rule);background:var(${v})"></i> <code>${v}</code></span></li>`).join('')}</ul></section>`
    + `<section id="v8-parts"><h2>${sections[2].title}</h2><p><button class="v8-btn" type="button">${E(t(['Action', 'Action']))}</button> <button class="v8-btn is-accent" type="button">${E(t(['Action principale', 'Main action']))}</button> <button class="v8-btn" type="button" aria-pressed="true">${E(t(['Choisi', 'Chosen']))}</button> <button class="v8-btn" type="button" disabled>${E(t(['Indisponible', 'Unavailable']))}</button></p>${folds}<p><button class="v8-btn" type="button" data-sheet-open="v8-sample-sheet">${E(t(['Exercices', 'Exercises']))}</button></p>${deckBar({ t, step: 1, steps: 4 })}</section>`;
  return `<div class="v8">${topBar({ t, world, siteName })}<main id="main" tabindex="-1" class="v8-wrap${world === 'lycee' ? ' v8-copybook' : ''}"><h1>${E(t(name))}</h1><p class="v8-muted">${E(t(feeling))}</p>${outline(sections, t)}${body}</main>${sheet({ id: 'v8-sample-sheet', title: E(t(['Exercices', 'Exercises'])), body: `<p>${E(t(['Les exercices et leurs solutions s’ouvrent ici.', 'Exercises and their solutions open here.']))}</p>`, t })}</div>`;
}

export function bindSampler(root) {
  const stops = [foldGroup(root), bindMenu(root), bindSheets(root), bindOutline(root)];
  const grounds = [...root.querySelectorAll('[data-ground]')];
  const pick = (e) => { setProjectionGround(e.currentTarget.dataset.ground); grounds.forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); };
  grounds.forEach((b) => b.addEventListener('click', pick));
  stops.push(() => grounds.forEach((b) => b.removeEventListener('click', pick)));
  return () => stops.forEach((stop) => stop());
}
