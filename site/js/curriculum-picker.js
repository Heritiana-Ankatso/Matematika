// The curricula and their levels, shared by the Lessons, Exercises and Slides pages: one grouped level rail and one
// chooser shown when the address names no level, so that no curriculum is assumed (owner request, 16 November 2026).
// The remembered class (navigation-state.js) only fills the links of the navigation, and is then said to be remembered.
// Curricula stay distinct: each family lists only its own levels. Names come from content.js `pathways`.
import { liveCourses, livePathways } from './live-curriculum.js';

const P = (fr, en) => [fr, en];
const E = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const SHORT = { seconde: P('Seconde', 'Seconde'), premiere: P('Première spécialité', 'Première'), terminale: P('Terminale spécialité', 'Terminale'), expertes: P('Maths expertes', 'Further maths'), stmg: P('Terminale STMG', 'Terminale STMG'), t10: P('T10', 'T10'), t11s: P('T11 série S', 'T11 S') };
export const shortName = (id, t) => t(SHORT[id] || liveCourses.find(c => c.id === id)?.title || P(id, id));
const pathway = id => livePathways.find(p => p.id === id);
// Order of the pathways page: the Malagasy curriculum first, then the French one.
const FAMILIES = [
  { id: 'mg', note: P('Lycée malgache. Cours en français.', 'Malagasy lycée. Lessons in French.') },
  { id: 'fr', note: P('Lycée français. Cours en français, certains aussi en anglais.', 'French lycée. Lessons in French, some also in English.') },
].filter(f => pathway(f.id));
const familyName = id => pathway(id)?.name || P(id, id);
export const curriculumOf = id => liveCourses.find(c => c.id === id)?.curriculum || '';
export const curriculumName = (id, t) => t(familyName(curriculumOf(id)));
// The levels of each family among `ids` (the courses a page offers), in the order of the manifest.
export const families = ids => FAMILIES.map(f => ({ ...f, name: familyName(f.id), ids: liveCourses.filter(c => c.curriculum === f.id && ids.includes(c.id)).map(c => c.id) })).filter(f => f.ids.length);
// Curricula with no class lessons here: they open their own pages.
function elsewhere(t) {
  const names = id => (pathway(id)?.programmes || []).map(x => t(x.name)).join(', ');
  return [
    pathway('university') && { href: '#university', name: familyName('university'), note: P(`Cours de première année : ${names('university')}.`, `First-year courses: ${names('university')}.`) },
    pathway('int') && { href: '#pathways/int', name: familyName('int'), note: P(`${names('int')} : pas encore de cours, des expériences classées par niveau.`, `${names('int')}: no lessons yet, experiments placed by level.`) },
  ].filter(Boolean);
}

// The rail beside a list: one labelled group per curriculum, then the curricula that live elsewhere.
// pick(id, label) returns one <li> control; each page keeps its own (button or link) and its counts.
export function levelRail({ t, ids, pick, label = P('Programmes et classes', 'Curricula and classes') }) {
  const own = families(ids).map(f => `<div class="pw-family"><p class="pw-family-name">${E(t(f.name))}</p><ul>${f.ids.map(id => pick(id, shortName(id, t))).join('')}</ul></div>`).join('');
  const other = elsewhere(t).map(x => `<li><a class="pw-pick pw-out" href="${x.href}"><span>${E(t(x.name))}</span><span aria-hidden="true">→</span></a></li>`).join('');
  return `<nav class="pw-rail res-rail" aria-label="${E(t(label))}">${own}${other ? `<div class="pw-family"><p class="pw-family-name">${E(t(P('Autres programmes', 'Other curricula')))}</p><ul>${other}</ul></div>` : ''}</nav>`;
}

// The first screen of a page when no class is chosen: every curriculum with its levels, nothing preselected.
// pick(id, label) as for levelRail; intro replaces the default explanation. A class curriculum with no level in `ids`
// still gets a card, saying why (absent: [fr, en]) and where to go instead (absentHref, absentLink: [fr, en]).
export function curriculumChooser({ t, ids, pick, intro, absent, absentHref, absentLink }) {
  const card = (name, note, body) => `<li class="curriculum-card"><h3>${E(t(name))}</h3><p>${E(t(note))}</p>${body}</li>`;
  const own = families(ids).map(f => card(f.name, f.note, `<ul class="curriculum-levels">${f.ids.map(id => pick(id, shortName(id, t))).join('')}</ul>`)).join('');
  const shown = new Set(families(ids).map(f => f.id));
  const missing = absent ? families(liveCourses.map(c => c.id)).filter(f => !shown.has(f.id)).map(f => card(f.name, absent, `<a class="curriculum-out" href="${absentHref}">${E(t(absentLink))} <span aria-hidden="true">→</span></a>`)).join('') : '';
  const other = elsewhere(t).map(x => card(x.name, x.note, `<a class="curriculum-out" href="${x.href}">${E(t(P('Ouvrir', 'Open')))} ${E(t(x.name))} <span aria-hidden="true">→</span></a>`)).join('');
  return `<section class="curriculum-chooser" aria-labelledby="curriculum-chooser-title"><h2 id="curriculum-chooser-title" tabindex="-1">${E(t(P('Quel programme suis-tu ?', 'Which curriculum do you follow?')))}</h2><p class="group-note">${E(t(intro || P('Choisis ton programme, puis ta classe. Ton choix reste sur cet appareil et se change à tout moment dans la liste des classes.', 'Pick your curriculum, then your class. Your choice stays on this device and can be changed at any time from the list of classes.')))}</p><ul class="curriculum-grid">${own}${missing}${other}</ul></section>`;
}

// The line above a chosen level: its curriculum, why it is shown when it comes from this device, and the way back to
// the chooser (the page's address without a level).
export function chosenLevelNote({ t, id, remembered, href }) {
  return `<p class="curriculum-eyebrow"><span>${E(curriculumName(id, t))}</span>${remembered ? `<span class="curriculum-why">${E(t(P('Classe mémorisée sur cet appareil', 'Class remembered on this device')))}</span>` : ''}<a href="${href}">${E(t(P('Changer de programme', 'Change curriculum')))}</a></p>`;
}
