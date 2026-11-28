// Design v8, the chapter page of the Lycée (#chapter/<id> under ?v8; docs/DESIGN_V8.md sections 4 and 5,
// docs/REBUILD_PLAN.md stage 5): the course text written on the copybook with the outline in the margin; everything
// else on demand: Exercices (side sheet, solutions one by one or all), Le chapitre (objectives, booklets, things to
// handle, frequent errors), Projeter (the slide player, which keeps "Fond clair / Fond sombre"). The text is the chapter
// deck (content/slides/<id>.json, read through sequence-model.js), as on the current chapter page, until the TeX
// converter of stage 5 gives each course its full web text; notions sit in a green frame, proofs are folded under
// « Démonstration ».
import { resourceCatalog as completeCatalog } from '../resources-data.js';
import { liveCompanionCatalog, liveCourses } from '../live-curriculum.js';
import { editionFor } from '../resource-editions.js';
import { assetHref } from '../data-loader.js';
import { sequenceModel, goalFields } from '../sequence-model.js';
import { errorsFor } from '../errors-model.js';
import { resolveLine } from '../lab/lines.js';
import { typeset } from '../mathjax.js';
import { keepOnRuling } from '../seyes-rhythm.js';
import { topBar, bindMenu, bindSheets, sheet, sayer, E } from './kit.js';

const P = (fr, en) => [fr, en];
const catalog = liveCompanionCatalog(completeCatalog);
export const chapterById = (id) => catalog.chapters.find((c) => c.id === id) || null;
const KINDS = { chapter: P('Livret élève', 'Student booklet'), teacher: P('Corrigés et guide professeur', 'Solutions and teacher guide'), fluency: P('Automatismes', 'Fluency'), 'fluency-solutions': P('Corrigés des automatismes', 'Fluency solutions') };

// the text of a slide in the reader's language, the French one when the chapter has no English text
const pick = (pairOrText, L) => (Array.isArray(pairOrText) ? pairOrText[L] || pairOrText[0] || '' : pairOrText || '');
function body(slide, id, L) {
  if (slide.k === 'code') return `<pre class="v8-code"><code>${E(pick(slide.b, L).replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&'))}</code></pre>`;
  const figs = (slide.f || []).map((p) => `<figure class="v8-figure"><img loading="lazy" src="./slides/fig/${E(id)}-${E(p[L] || p[0])}${L && p[1] ? '-en' : ''}.svg" alt="${E(pick(slide.t, L))}"></figure>`).join('');
  return `<div class="v8-text" data-math>${pick(slide.b, L)}</div>${figs}`;
}

export function fileLink(f, L, s) {
  const own = editionFor(f, L ? 'en' : 'fr'), edition = own || editionFor(f, 'fr');
  if (!edition) return '';
  const label = s(KINDS[f.kind] || P('Document', 'Document'));
  const note = own ? '' : ` · ${s(P('en français', 'in French'))}`;
  return `<li><a href="./${E(assetHref(edition.path.replace(/^\.\//, '')))}" target="_blank" rel="noopener">${label}</a> <small>PDF · ${edition.pages} p.${note}</small></li>`;
}

export function copybookPage({ t, lang, siteName, id }) {
  const s = sayer(lang), c = chapterById(id);
  const course = liveCourses.find((x) => x.id === c?.course);
  if (!c) return `<div class="v8">${topBar({ t, world: 'lycee', siteName, lang })}<main id="main" tabindex="-1" class="v8-wrap v8-copybook"><h1>${s(P('Page introuvable', 'Page not found'))}</h1><p><a href="#resources">${s(P('Retour aux cahiers', 'Back to the notebooks'))}</a></p></main></div>`;
  const L = lang === 'fr' ? 0 : 1;
  const same = catalog.chapters.filter((x) => x.course === c.course);
  const prev = same.find((x) => x.number === c.number - 1), next = same.find((x) => x.number === c.number + 1);
  return `<div class="v8">${topBar({ t, world: 'lycee', siteName, lang })}<main id="main" tabindex="-1" class="v8-wrap v8-copybook v8-chapter" data-chapter="${E(c.id)}">`
    + `<p class="v8-where"><a href="#resources/${E(c.course)}">${E(pick(course?.title, 0) || c.course)}</a> · ${s(P('Chapitre', 'Chapter'))} ${c.number}</p>`
    + `<h1>${E(pick(c.title, L))}</h1>`
    + `<p class="v8-actions"><button class="v8-btn" type="button" data-sheet-open="v8-exercises">${s(P('Exercices', 'Exercises'))}</button> <button class="v8-btn" type="button" data-sheet-open="v8-about">${s(P('Le chapitre', 'The chapter'))}</button> <a class="v8-btn" href="${E(assetHref('./slides/player.html'))}&amp;deck=${E(c.id)}" target="_blank" rel="noopener">${s(P('Projeter', 'Project'))}</a></p>`
    + `<nav class="v8-margin" aria-label="${s(P('Plan du chapitre', 'Chapter outline'))}" data-v8-margin></nav>`
    + `<div class="v8-course" data-v8-course aria-busy="true"><p role="status">${s(P('Chargement du cours…', 'Loading the lesson…'))}</p></div>`
    + `<nav class="v8-next" aria-label="${s(P('Ordre des chapitres', 'Chapter order'))}">${prev ? `<a href="#chapter/${E(prev.id)}">← ${E(pick(prev.title, L))}</a>` : '<span></span>'}${next ? `<a href="#chapter/${E(next.id)}">${E(pick(next.title, L))} →</a>` : ''}</nav>`
    + `</main>`
    + sheet({ id: 'v8-exercises', title: s(P('Exercices', 'Exercises')), body: `<p role="status">${s(P('Chargement…', 'Loading…'))}</p>`, t })
    + sheet({ id: 'v8-about', title: s(P('Le chapitre', 'The chapter')), body: aboutBody(c, L, s, []), t })
    + `</div>`;
}

function aboutBody(c, L, s, goals) {
  const files = c.files.map((f) => fileLink(f, L, s)).join('');
  const labs = (c.labs || []).map((ref) => { const x = resolveLine(ref); return x ? `<li><a href="#lab/${E(x.ref)}">${E(pick(x.line.title, L))}</a></li>` : ''; }).join('');
  const errors = errorsFor('#chapter/' + c.id).map((e) => `<li><a href="#errors/${E(e.id)}">${E(pick(e.title, L))}</a></li>`).join('');
  return (goals.length ? `<h3>${s(P('Objectifs et prérequis', 'Objectives and prerequisites'))}</h3>${goals.map((g) => `<h4>${E(g.label)}</h4><div data-math>${g.body}</div>`).join('')}` : '')
    + (files ? `<h3>${s(P('Les livrets', 'The booklets'))}</h3><ul>${files}</ul>` : '')
    + (labs ? `<h3>${s(P('À manipuler', 'To handle'))}</h3><ul>${labs}</ul>` : '')
    + (errors ? `<h3>${s(P('Erreurs fréquentes', 'Common errors'))}</h3><ul>${errors}</ul>` : '');
}

// The course: one section per notion (title in red pen, notion in a green frame, proofs folded, examples with their
// solution folded, points to watch). Returns the markup and the outline entries.
export function courseText(model, c, L, s) {
  const sections = model.lessons.map((n, i) => ({ id: `v8-n-${i + 1}`, num: String(i + 1), title: E(pick(n.title, L)) }));
  const html = model.lessons.map((n, i) => `<section id="v8-n-${i + 1}" aria-labelledby="v8-n-${i + 1}-h"><h2 id="v8-n-${i + 1}-h"><span class="v8-num">${i + 1}.</span> ${E(pick(n.title, L))}</h2>`
    + n.statements.map((x) => (x.k === 'proof'
      ? `<details class="v8-proof"><summary>${s(P('Démonstration', 'Proof'))}</summary>${body(x, c.id, L)}</details>`
      : x.k === 'method' ? `<h3>${s(P('Méthode', 'Method'))}</h3>${body(x, c.id, L)}`
        : x.k === 'concept' ? `<div class="v8-frame-def">${body(x, c.id, L)}</div>` : body(x, c.id, L))).join('')
    + n.examples.map((x) => `<h3>${s(P('Exemple', 'Example'))}</h3>${body(x, c.id, L)}${x.a ? `<details class="v8-proof"><summary>${s(P('Solution', 'Solution'))}</summary><div class="v8-text" data-math>${pick(x.a, L)}</div></details>` : ''}`).join('')
    + n.warnings.map((x) => `<h3 class="v8-watch">${s(P('Attention', 'Watch out'))}</h3>${body(x, c.id, L)}`).join('')
    + `</section>`).join('');
  return { html, sections };
}

export function exercisesText(model, c, L, s) {
  if (!model.tasks.length) return `<p>${s(P('Ce chapitre n’a pas encore d’exercices en ligne : ceux du livret élève sont complets et corrigés.', 'This chapter has no online exercises yet: those of the student booklet are complete, with solutions.'))}</p>`;
  return `<p><button class="v8-btn" type="button" data-all-solutions aria-pressed="false">${s(P('Montrer toutes les solutions', 'Show all solutions'))}</button></p><ol class="v8-exercises">`
    + model.tasks.map((x) => `<li><p class="v8-where">${E(pick(x.lesson, L))}</p>${body(x, c.id, L)}${(x.hints || []).map((h, i) => `<details><summary>${s(P(`Indice ${i + 1}`, `Hint ${i + 1}`))}</summary><div class="v8-text" data-math>${pick(h, L)}</div></details>`).join('')}${x.a ? `<details data-solution><summary>${s(P('Solution', 'Solution'))}</summary><div class="v8-text" data-math>${pick(x.a, L)}</div></details>` : ''}</li>`).join('')
    + `</ol>`;
}

export function bindCopybook(root, { lang }) {
  const page = root.querySelector('.v8-chapter');
  const stops = [bindMenu(root), bindSheets(root)];
  if (!page) return () => stops.forEach((stop) => stop());
  const s = sayer(lang), L = lang === 'fr' ? 0 : 1, c = chapterById(page.dataset.chapter);
  const controller = new AbortController();
  let cancelled = false;
  stops.push(() => { cancelled = true; controller.abort(); });
  const courseBox = page.querySelector('[data-v8-course]');
  (async () => {
    try {
      const r = await fetch(assetHref(`./slides/data/${encodeURIComponent(c.id)}.json`), { signal: controller.signal });
      if (!r.ok) throw Error(r.status);
      const model = sequenceModel(await r.json());
      if (cancelled) return;
      const { html, sections } = courseText(model, c, L, s);
      courseBox.innerHTML = html;
      courseBox.setAttribute('aria-busy', 'false');
      page.querySelector('[data-v8-margin]').innerHTML = `<ol>${sections.map((x) => `<li><a href="#${x.id}" data-outline="${x.id}"><span class="v8-num">${x.num}</span><span>${x.title}</span></a></li>`).join('')}</ol>`;
      root.querySelector('#v8-exercises .v8-sheet-body').innerHTML = exercisesText(model, c, L, s);
      root.querySelector('#v8-about .v8-sheet-body').innerHTML = aboutBody(c, L, s, goalFields(model.goals, L));
      // the outline in the margin scrolls to its notion and marks the one being read
      const links = [...page.querySelectorAll('[data-outline]')];
      links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); page.querySelector('#' + CSS.escape(a.dataset.outline))?.scrollIntoView({ block: 'start' }); }));
      if (typeof IntersectionObserver === 'function') {
        const seen = new Set();
        const io = new IntersectionObserver((entries) => {
          entries.forEach((e) => (e.isIntersecting ? seen.add(e.target.id) : seen.delete(e.target.id)));
          const first = links.find((a) => seen.has(a.dataset.outline));
          if (first) links.forEach((a) => (a === first ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
        }, { rootMargin: '-20% 0px -60% 0px' });
        courseBox.querySelectorAll('section[id]').forEach((x) => io.observe(x));
        stops.push(() => io.disconnect());
      }
      // solutions one by one, or all at once
      const all = root.querySelector('[data-all-solutions]');
      all?.addEventListener('click', () => {
        const on = all.getAttribute('aria-pressed') !== 'true';
        all.setAttribute('aria-pressed', String(on));
        all.textContent = on ? s(P('Masquer les solutions', 'Hide the solutions')) : s(P('Montrer toutes les solutions', 'Show all solutions'));
        root.querySelectorAll('#v8-exercises [data-solution]').forEach((d) => { d.open = on; });
      });
      // formulas in a sheet are typeset when it opens
      root.querySelectorAll('[data-sheet-open]').forEach((b) => b.addEventListener('click', () => typeset(root.querySelector('#' + CSS.escape(b.dataset.sheetOpen))).catch(() => {})));
      const typed = typeset(courseBox).catch(() => {});
      stops.push(keepOnRuling(page, { ready: [typed] }));
      const open = (e) => { if (e.target.open) typeset(e.target).catch(() => {}); };
      root.addEventListener('toggle', open, true);
      stops.push(() => root.removeEventListener('toggle', open, true));
    } catch (e) {
      if (cancelled) return;
      courseBox.setAttribute('aria-busy', 'false');
      courseBox.innerHTML = `<p>${s(P('Le cours de ce chapitre ne peut pas être chargé. Les livrets restent disponibles :', 'The lesson of this chapter could not be loaded. The booklets remain available:'))}</p><ul>${c.files.map((f) => fileLink(f, L, s)).join('')}</ul>`;
      stops.push(keepOnRuling(page));
    }
  })();
  return () => stops.forEach((stop) => stop());
}
