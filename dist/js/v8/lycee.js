// Design v8, the Lycée (#resources[/<course>] under ?v8; docs/DESIGN_V8.md sections 3 and 5, docs/REBUILD_PLAN.md
// stage 5): three notebooks on a copybook page, Lycée malgache, Lycée français and International, each with its cover;
// a notebook opens on its levels and a level on its chapters, one open at a time. Levels come from the live courses
// (live-curriculum.js), chapters from the companion catalogue (world-lines.js LYCEE_CHAPTERS): nothing is typed here.
// A level in the address (#resources/t10) opens its notebook and its level.
import { liveCourses, livePathways } from '../live-curriculum.js';
import { LYCEE_CHAPTERS } from '../world-lines.js';
import { keepOnRuling } from '../seyes-rhythm.js';
import { topBar, bindMenu, foldGroup, sayer, E } from './kit.js';

const P = (fr, en) => [fr, en];
// the class notebooks (Malagasy, French) and the one without lessons yet (International), in the owner's order
export const NOTEBOOKS = [
  { id: 'mg', line: P('Le programme malgache, de la T10 à la T12. Cours en français.', 'The Malagasy curriculum, from T10 to T12. Lessons in French.') },
  { id: 'fr', line: P('Le programme français, de la Seconde à la Terminale. Cours en français, certains aussi en anglais.', 'The French curriculum, from Seconde to Terminale. Lessons in French, some also in English.') },
  { id: 'int', line: P('IB et SAT : pas encore de cours, des expériences classées par niveau.', 'IB and SAT: no lessons yet, experiments placed by level.') },
];
const pathway = (id) => livePathways.find((p) => p.id === id);
export const levelsOf = (family) => liveCourses.filter((c) => c.curriculum === family).map((c) => ({ ...c, chapters: LYCEE_CHAPTERS.filter((x) => x.course === c.id).sort((a, b) => a.number - b.number) })).filter((c) => c.chapters.length);
export const notebookOf = (course) => liveCourses.find((c) => c.id === course)?.curriculum || '';
const two = (n) => String(n).padStart(2, '0');

export function lyceePage({ t, lang, siteName, course = '' }) {
  const s = sayer(lang), L = lang === 'fr' ? 0 : 1;
  const openBook = notebookOf(course);
  const book = (nb) => {
    const p = pathway(nb.id);
    if (!p) return '';
    const levels = levelsOf(nb.id);
    const count = levels.reduce((n, c) => n + c.chapters.length, 0);
    const body = levels.length
      ? `<div class="v8-fold" data-fold-group="level-${nb.id}">${levels.map((c) => `<details name="level-${nb.id}" data-fold="${E(c.id)}"${c.id === course ? ' open' : ''}><summary><span>${E(c.title[0])}</span><span class="v8-count">${c.chapters.length}</span></summary><div class="v8-fold-body"><ol class="v8-chapters">${c.chapters.map((x) => `<li><a href="#chapter/${E(x.id)}"><span class="v8-num">${two(x.number)}</span><span>${E(x.title[L] || x.title[0])}</span></a></li>`).join('')}</ol><p class="v8-level-more"><a href="#bank/${E(c.id)}">${s(P('Exercices de la classe', 'Exercises of the class'))}</a> · <a href="#slides/${E(c.id)}">${s(P('Diaporamas', 'Slides'))}</a></p></div></details>`).join('')}</div>`
      : `<ul class="v8-chapters">${(p.programmes || []).map((x) => `<li><a href="#pathways/${E(nb.id)}"><span>${s(x.name)}</span></a></li>`).join('')}</ul>`;
    const small = levels.length ? `${levels.length} ${s(P('classes', 'classes'))} · ${count} ${s(P('chapitres', 'chapters'))}` : s(P('Expériences par niveau', 'Experiments by level'));
    return `<details class="v8-notebook" name="notebook" data-notebook="${nb.id}"${nb.id === openBook ? ' open' : ''}><summary><span class="v8-cover is-${nb.id}" aria-hidden="true"></span><span class="v8-notebook-name"><b>${s(p.name)}</b><small>${small}</small></span></summary><div class="v8-notebook-body"><p>${s(nb.line)}</p>${body}</div></details>`;
  };
  return `<div class="v8">${topBar({ t, world: 'lycee', siteName, lang })}<main id="main" tabindex="-1" class="v8-wrap v8-copybook v8-lycee">`
    + `<h1>${s(P('Le lycée', 'The lycée'))}</h1><p>${s(P('Trois cahiers, un par programme. Ouvre le tien, puis ta classe : chaque chapitre a son cours, ses exercices et son diaporama.', 'Three notebooks, one per curriculum. Open yours, then your class: every chapter has its lesson, its exercises and its slides.'))}</p>`
    + `<div class="v8-notebooks" data-fold-group="notebook">${NOTEBOOKS.map(book).join('')}</div>`
    + `</main></div>`;
}

export function bindLycee(root) {
  const page = root.querySelector('.v8-copybook');
  const stops = [bindMenu(root), foldGroup(root), keepOnRuling(page)];
  root.querySelector('details[data-fold][open]')?.scrollIntoView({ block: 'start' });
  return () => stops.forEach((stop) => stop());
}
