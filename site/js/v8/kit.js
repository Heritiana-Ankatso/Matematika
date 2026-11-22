// Design v8: the shared frame of the four worlds (docs/DESIGN_V8.md section 4), markup and behaviour. Styles: the v8
// section of styles/controls.css, tokens in styles/tokens.css, signatures in styles/world-<id>.css.
// Every string is a [French, English] pair read through `t`.
import { icon } from '../icons.js';

export const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// French typography (docs/DESIGN_V8.md section 6): a narrow no-break space before ? ! ; : and inside « », applied to
// French text when a v8 page writes it (the sources keep plain spaces). Text only, never markup.
export const typo = (text, lang) => (lang === 'fr' ? String(text).replace(/ ([?!;:»])/g, '\u202f$1').replace(/« /g, '«\u202f') : String(text));
// A pair read in the page language, typeset and escaped: the one way v8 pages write text.
export const sayer = (lang) => (pair) => E(typo(pair[lang === 'fr' ? 0 : 1], lang));

// The worlds of the folded menu, in the order of the threshold, with the address that enters each one.
export const WORLD_MENU = [
  { id: 'musee', hash: '#musee', name: ['Musée', 'Museum'], line: ['Curiosités, collections, chronologies', 'Curiosities, collections, timelines'] },
  { id: 'univ', hash: '#university', name: ['Université', 'University'], line: ['Cours, fondements, carte des domaines', 'Courses, foundations, map of the fields'] },
  { id: 'lycee', hash: '#resources', name: ['Lycée', 'Lycée'], line: ['Cahiers malgache, français et international', 'Malagasy, French and international notebooks'] },
  { id: 'olymp', hash: '#olympiad', name: ['Olympiades', 'Olympiads'], line: ['Stratégies, problèmes, échauffements', 'Strategies, problems, warm-ups'] },
];

const brandMark = '<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false"><path class="bm-arc" d="M90 60A30 30 0 1 1 30 60A30 30 0 1 1 90 60ZM30 0A30 30 0 0 1 0 30M90 0A30 30 0 0 0 120 30M0 90A30 30 0 0 1 30 120M120 90A30 30 0 0 0 90 120"/></svg>';

// Top bar: brand, one folded world menu, search. Nothing else is unfolded by default.
export function topBar({ t, world, siteName, home = '#home' }) {
  const here = WORLD_MENU.find((w) => w.id === world);
  return `<header class="v8-bar"><div class="v8-wrap"><a class="v8-brand" href="${home}" aria-label="${E(siteName)}">${brandMark}<span>${E(siteName)}</span></a>`
    + `<details class="v8-worlds" data-v8-menu><summary>${E(here ? t(here.name) : t(['Les mondes', 'The worlds']))}</summary><nav class="v8-worlds-list" aria-label="${E(t(['Les quatre mondes', 'The four worlds']))}">`
    + WORLD_MENU.map((w) => `<a href="${w.hash}"${w.id === world ? ' aria-current="page"' : ''}>${E(t(w.name))}<small>${E(t(w.line))}</small></a>`).join('')
    + `</nav></details><span class="v8-spacer"></span><a class="v8-icon" href="#search" aria-label="${E(t(['Rechercher', 'Search']))}" title="${E(t(['Rechercher', 'Search']))}">${icon('magnifying-glass', 22)}</a></div></header>`;
}

// A folded list: closed until clicked, one open at a time. `items`: [{ id, title, count, body }] (body is markup).
export function foldList(items, group) {
  return `<div class="v8-fold" data-fold-group="${E(group)}">${items.map((x) => `<details name="${E(group)}" data-fold="${E(x.id)}"><summary><span>${x.title}</span>${x.count ? `<span class="v8-count">${x.count}</span>` : ''}</summary><div class="v8-fold-body">${x.body}</div></details>`).join('')}</div>`;
}
// One open at a time where <details name> is not supported; returns what removes the listeners.
export function foldGroup(root) {
  const handlers = [];
  root.querySelectorAll('[data-fold-group]').forEach((group) => {
    const on = (e) => {
      const opened = e.target;
      if (!opened.open || opened.parentElement !== group) return;
      group.querySelectorAll(':scope > details[open]').forEach((d) => { if (d !== opened) d.open = false; });
    };
    group.addEventListener('toggle', on, true);
    handlers.push(() => group.removeEventListener('toggle', on, true));
  });
  return () => handlers.forEach((stop) => stop());
}

// The world menu closes on Escape, on a choice and on a click outside.
export function bindMenu(root) {
  const menu = root.querySelector('[data-v8-menu]');
  if (!menu) return () => {};
  const key = (e) => { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } };
  const click = (e) => { if (menu.open && (!menu.contains(e.target) || e.target.closest('a'))) menu.open = false; };
  document.addEventListener('keydown', key);
  document.addEventListener('click', click);
  return () => { document.removeEventListener('keydown', key); document.removeEventListener('click', click); };
}

// Side sheet (Exercices, chapter information): a modal <dialog>; Escape and the close button close it, focus returns.
export function sheet({ id, title, body, t }) {
  return `<dialog class="v8-sheet" id="${E(id)}" aria-labelledby="${E(id)}-title"><div class="v8-sheet-head"><h2 id="${E(id)}-title">${title}</h2><button class="v8-btn" type="button" data-sheet-close>${E(t(['Fermer', 'Close']))}</button></div><div class="v8-sheet-body">${body}</div></dialog>`;
}
export function bindSheets(root) {
  const stops = [];
  root.querySelectorAll('[data-sheet-open]').forEach((button) => {
    const dialog = root.querySelector('#' + CSS.escape(button.dataset.sheetOpen));
    if (!dialog) return;
    const open = () => { dialog.showModal?.() ?? dialog.setAttribute('open', ''); };
    const close = () => { dialog.close?.() ?? dialog.removeAttribute('open'); button.focus(); };
    const closer = dialog.querySelector('[data-sheet-close]');
    button.addEventListener('click', open);
    closer?.addEventListener('click', close);
    stops.push(() => { button.removeEventListener('click', open); closer?.removeEventListener('click', close); });
  });
  return () => stops.forEach((stop) => stop());
}

// Chapter outline: a slim list of the sections, the current one marked while reading (IntersectionObserver).
// `sections`: [{ id, title, num }].
export function outline(sections, t) {
  return `<details class="v8-outline" open data-v8-outline><summary>${E(t(['Plan', 'Outline']))}</summary><ol>${sections.map((s) => `<li><a href="#${E(s.id)}" data-outline="${E(s.id)}">${s.num ? `<span class="v8-num">${E(s.num)}</span>` : ''}<span>${s.title}</span></a></li>`).join('')}</ol></details>`;
}
export function bindOutline(root) {
  const links = [...root.querySelectorAll('[data-outline]')];
  const stops = [];
  links.forEach((a) => {
    const go = (e) => { e.preventDefault(); root.querySelector('#' + CSS.escape(a.dataset.outline))?.scrollIntoView({ block: 'start' }); };
    a.addEventListener('click', go);
    stops.push(() => a.removeEventListener('click', go));
  });
  if (typeof IntersectionObserver !== 'function' || !links.length) return () => stops.forEach((s) => s());
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)));
    const first = links.find((a) => seen.has(a.dataset.outline));
    if (first) links.forEach((a) => (a === first ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  }, { rootMargin: '-20% 0px -60% 0px' });
  links.forEach((a) => { const target = root.querySelector('#' + CSS.escape(a.dataset.outline)); if (target) io.observe(target); });
  return () => { io.disconnect(); stops.forEach((s) => s()); };
}

// Projection: "Fond clair / Fond sombre", remembered on the device (classroom projectors wash out dark slides).
const GROUND = 'mx-v8-projection';
export function projectionGround() { try { return localStorage.getItem(GROUND) === 'clair' ? 'clair' : 'sombre'; } catch { return 'sombre'; } }
export function setProjectionGround(value) { try { localStorage.setItem(GROUND, value === 'clair' ? 'clair' : 'sombre'); } catch { /* storage blocked */ } }
// Deck controls: previous, step counter, next, "Tout", the ground switch.
export function deckBar({ t, step, steps }) {
  const ground = projectionGround();
  return `<div class="v8-deck-bar" role="group" aria-label="${E(t(['Commandes du diaporama', 'Slide controls']))}"><button class="v8-btn" type="button" data-deck="prev"${step <= 1 ? ' disabled' : ''}>${E(t(['Précédent', 'Previous']))}</button><output data-deck-count aria-live="polite">${step} / ${steps}</output><button class="v8-btn is-accent" type="button" data-deck="next"${step >= steps ? ' disabled' : ''}>${E(t(['Suivant', 'Next']))}</button><button class="v8-btn" type="button" data-deck="all">${E(t(['Tout', 'All']))}</button><span class="v8-spacer"></span><div role="group" aria-label="${E(t(['Fond de projection', 'Projection ground']))}"><button class="v8-btn" type="button" data-ground="clair" aria-pressed="${ground === 'clair'}">${E(t(['Fond clair', 'Light ground']))}</button> <button class="v8-btn" type="button" data-ground="sombre" aria-pressed="${ground === 'sombre'}">${E(t(['Fond sombre', 'Dark ground']))}</button></div></div>`;
}
