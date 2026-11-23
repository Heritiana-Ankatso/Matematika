// The IMO pages of the Olympiad section, loaded on demand (the group `imo` of app.js), so the Olympiad page itself stays light:
//   #olympiad/imo                      the papers, year by year
//   #olympiad/imo/<year>-<n>           one problem: the statement and, for some, a figure to handle it
//   #olympiad/imo/<year>-<n>/solution  its solution, on a page of its own (never on the problem page)
// Data: imo-papers.js (statements), imo-solutions.js (solutions), figures imo-widgets.js (loaded only when a page has one).
import { PAPERS, IMO_SOURCE } from './imo-papers.js';
import { SOLUTIONS, SOLUTION_SOURCE } from './imo-solutions.js';
import { typeset } from './mathjax.js';
import { icon } from './icons.js';

const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = (fr, en) => [fr, en];
const paragraphs = (q) => q.split('\n').map((x) => `<p>${E(x)}</p>`).join('');

// Short descriptive titles (the assistant's own wording, not an official classification), and the figure of a problem.
export const TITLES = {
  '2026-1': P('Le tableau, pgcd et ppcm', 'The blackboard, gcd and lcm'), '2026-2': P('Un triangle et deux milieux', 'A triangle and two midpoints'),
  '2026-3': P('Le partage du bâton', 'Sharing the stick'), '2026-4': P('Le jeu du triangle de papier', 'The paper triangle game'),
  '2026-5': P('Une équation fonctionnelle', 'A functional inequality'), '2026-6': P('Une suite et des pgcd', 'A sequence and gcds'),
  '2025-1': P('Les droites ensoleillées', 'Sunny lines'), '2025-2': P('Deux cercles et une tangente', 'Two circles and a tangent'),
  '2025-3': P('Les fonctions balaises', 'Bonza functions'), '2025-4': P('Les trois plus grands diviseurs stricts', 'The three largest proper divisors'),
  '2025-5': P('Le jeu de l’inékoalaté', 'The inekoalaty game'), '2025-6': P('Des tuiles sur un quadrillage', 'Tiles on a grid'),
};
export const FIGURES = { '2026-1': 'blackboard', '2026-6': 'sharedFactor', '2025-4': 'properDivisors', '2025-1': 'sunnyLines', '2025-6': 'tiles' };
const FIGURE_HINT = {
  blackboard: P('Un petit tableau pour manipuler : choisissez deux entiers, observez ce qui reste à la fin, puis recommencez en jouant autrement.', 'A small board to handle: choose two integers, see what is left at the end, then start again and play differently.'),
  sharedFactor: P('Calculez les premiers termes pour un \\(a_1\\) de votre choix et regardez les différences.', 'Compute the first terms for an \\(a_1\\) of your choice and look at the differences.'),
  properDivisors: P('Essayez des valeurs de \\(a_1\\) : la suite s’arrête-t-elle, se stabilise-t-elle ?', 'Try values of \\(a_1\\): does the sequence stop, or settle?'),
  sunnyLines: P('Tracez des droites en cliquant deux points. Le site vérifie que les \\(n\\) droites couvrent tous les points et compte les droites ensoleillées ; il ne dit pas quelles valeurs de \\(k\\) sont possibles.', 'Draw lines by clicking two points. The page checks that the \\(n\\) lines cover every point and counts the sunny ones; it does not say which values of \\(k\\) are possible.'),
  tiles: P('Dessinez des tuiles en faisant glisser. Le site vérifie que chaque ligne et chaque colonne garde exactement une case libre, et compte les tuiles (essayez \\(n=4\\), puis \\(n=9\\)). Il ne dit pas le minimum.', 'Draw tiles by dragging. The page checks that each row and column keeps exactly one free square, and counts the tiles (try \\(n=4\\), then \\(n=9\\)). It does not say the minimum.'),
};
const allProblems = () => PAPERS.flatMap((p) => p.days.flatMap((d) => d.problems.map((x) => ({ ...x, year: p.year, key: `${p.year}-${x.n}`, paper: p }))));
const find = (key) => allProblems().find((x) => x.key === key);
const solutionHref = (key) => `#olympiad/imo/${key}/solution`;

function indexPage(t) {
  const paper = (p) => `<section class="olymp-theme imo-paper" id="imo-${p.year}"><h2>${t(['OIMI', 'IMO'])} ${p.year} · ${E(p.city)}, ${E(t(p.country))}</h2>
<p class="muted">${p.edition}${t(['e', 'th'])} ${t(['Olympiade internationale de mathématiques', 'International Mathematical Olympiad'])} · ${t(['deux jours de trois problèmes, 4 h 30 par jour, 7 points par problème', 'two days of three problems, 4 h 30 per day, 7 points per problem'])}</p>
<ul class="olymp-grid">${p.days.flatMap((d) => d.problems).map((x) => { const key = `${p.year}-${x.n}`; return `<li><a class="olymp-card" href="#olympiad/imo/${key}">${icon('trophy', 26)}<strong>${t(['Problème', 'Problem'])} ${x.n} · ${E(t(TITLES[key]))}</strong><span>${t(['Jour', 'Day'])} ${x.n <= 3 ? 1 : 2}</span><small>${FIGURES[key] ? t(['Figure interactive · ', 'Interactive figure · ']) : ''}${SOLUTIONS[key] ? t(['solution disponible', 'solution available']) : t(['solution à venir', 'solution to come'])}</small></a></li>`; }).join('')}</ul></section>`;
  return `<main id="main" tabindex="-1" class="page olymp-page"><nav class="breadcrumb"><a href="#olympiad">${t(['Olympiades', 'Olympiads'])}</a></nav>
<h1>${t(['Olympiades internationales de mathématiques', 'International Mathematical Olympiads'])}</h1>
<p class="page-intro">${t(['Les épreuves officielles, année par année. Chaque problème a sa page ; certains ont une figure pour le manipuler. Les solutions sont sur des pages à part : cherchez d’abord, avec des petits cas et une figure.', 'The official papers, year by year. Each problem has its own page; some have a figure to handle it. Solutions are on separate pages: try first, with small cases and a figure.'])}</p>
${PAPERS.map(paper).join('')}<p class="muted olymp-note">${t(['Source : ', 'Source: '])}${E(t(IMO_SOURCE))}</p></main>`;
}

const statement = (x, t) => `<article class="olymp-problem olymp-intl"><header><span class="olymp-level olymp-intl">${t(['Niveau international', 'International level'])}</span><h2>${t(['OIMI', 'IMO'])} ${x.year} · ${t(['Problème', 'Problem'])} ${x.n}</h2></header>${paragraphs(t(x.q))}</article>`;
const crumbs = (x, t, last) => `<nav class="breadcrumb"><a href="#olympiad/imo">${t(['Épreuves de l’OIMI', 'IMO papers'])}</a> › <a href="#olympiad/imo/${x.key}">${x.year} · ${t(['Problème', 'Problem'])} ${x.n}</a>${last ? ` › ${last}` : ''}</nav>`;

function problemPage(x, t) {
  const sibs = allProblems().filter((y) => y.year === x.year), i = sibs.findIndex((y) => y.key === x.key), prev = sibs[i - 1], next = sibs[i + 1];
  const fig = FIGURES[x.key];
  return `<main id="main" tabindex="-1" class="page olymp-page olymp-detail">${crumbs(x, t)}<h1>${E(t(TITLES[x.key]))}</h1>${statement(x, t)}
${fig ? `<section class="olymp-hook"><h2>${t(['À manipuler', 'To handle'])}</h2><p class="muted">${E(t(FIGURE_HINT[fig]))}</p><div class="imo-host" data-imo-figure="${fig}"></div></section>` : ''}
<p><a class="btn" href="${solutionHref(x.key)}">${t(['Voir la solution', 'See the solution'])} →</a> <span class="muted">${t(['(page séparée : cherchez d’abord)', '(separate page: try first)'])}</span></p>
<nav class="olymp-pager">${prev ? `<a href="#olympiad/imo/${prev.key}">← ${t(['Problème', 'Problem'])} ${prev.n}</a>` : '<span></span>'}${next ? `<a href="#olympiad/imo/${next.key}">${t(['Problème', 'Problem'])} ${next.n} →</a>` : ''}</nav></main>`;
}

function solutionPage(x, t) {
  const s = SOLUTIONS[x.key];
  const body = s ? `<section class="olymp-idea"><p class="olymp-question"><strong>${t(['Réponse', 'Answer'])} :</strong> ${E(t(s.answer))}</p>${s.body.map((b) => { const v = t(b); return v.startsWith('§') ? `<h3>${E(v.slice(1))}</h3>` : `<p>${E(v)}</p>`; }).join('')}
<p class="muted olymp-source">${t(['Source : ', 'Source: '])}${E(t(SOLUTION_SOURCE))} (${t(['problème', 'problem'])} ${s.from})</p></section>`
    : `<section class="olymp-idea"><p>${t(['La solution de ce problème n’est pas encore ajoutée : aucune solution officielle n’a été fournie pour cette épreuve, et le site ne publie pas de solution non vérifiée.', 'The solution to this problem has not been added yet: no official solution has been supplied for this paper, and the site does not publish an unchecked solution.'])}</p></section>`;
  return `<main id="main" tabindex="-1" class="page olymp-page olymp-detail">${crumbs(x, t, t(['Solution', 'Solution']))}<h1>${t(['Solution', 'Solution'])} · ${E(t(TITLES[x.key]))}</h1>${statement(x, t)}${body}
<p><a href="#olympiad/imo/${x.key}">← ${t(['Retour au problème', 'Back to the problem'])}</a></p></main>`;
}

export function imoPage(tab, sub, t) {
  const x = tab ? find(tab) : null;
  if (!x) return indexPage(t);
  return sub === 'solution' ? solutionPage(x, t) : problemPage(x, t);
}

export function bindImo(root, lang) {
  const live = []; let gone = false;
  const hosts = [...root.querySelectorAll('[data-imo-figure]')];
  const retype = () => typeset(root).catch(() => {});
  root.addEventListener('imo-typeset', retype);
  if (hosts.length) import('./imo-widgets.js').then(({ mountImoFigure }) => { if (gone) return; hosts.forEach((h) => live.push(mountImoFigure(h.dataset.imoFigure, h, lang))); retype(); });
  retype();
  return () => { gone = true; root.removeEventListener('imo-typeset', retype); live.forEach((w) => w?.destroy?.()); };
}
