// The Olympiad pages: #olympiad (the ten strategies, the three levels) and #olympiad/<id> (one strategy: the question
// that starts the search, something to handle, the idea, a solved example, a ladder of problems with hints and
// solutions, links to the experiments and challenges). Content in olympiad-content.js; figures in olympiad-widgets.js.
// Bilingual: the page follows the interface language. Hints stay folded on the strategy page; each solution has its own
// page, #olympiad/<id>/<n> (owner rule of 23 November 2026).
import { STRATEGIES, LEVELS } from './olympiad-content.js';
import { mountWidget } from './olympiad-widgets.js';
import { resolveLine } from './lab/lines.js';
import { CHALLENGE_LINES } from './catalogue-lines.js';
import { typeset } from './mathjax.js';
import { icon } from './icons.js';

const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// text with maths: escape the text, keep \( \) and \[ \] for MathJax
const M = (s) => E(s);
const code = (s) => `<pre class="olymp-code"><code>${E(s)}</code></pre>`;
// #olympiad, #olympiad/<id> (a strategy) and #olympiad/<id>/<n> (the solution of its problem n, on its own page:
// owner rule of 23 November 2026, an Olympiad solution is never on the page of its statement)
export const isOlympiadRoute = (id, n) => {
  if (!id) return !n;
  const s = STRATEGIES.find((x) => x.id === id); if (!s) return false;
  return n === undefined || n === '' || (/^\d+$/.test(n) && Number(n) >= 1 && Number(n) <= s.problems.length);
};

function challengeTitle(id, t) { const card = CHALLENGE_LINES.find((x) => x.id === id); return card ? t(card.title) : id; }
function linkList(s, t) {
  return s.links.map(([kind, ref]) => {
    if (kind === 'challenge') return `<li><a href="#challenges/${E(ref)}">${icon('puzzle-piece', 18)}<span>${E(challengeTitle(ref, t))}</span></a></li>`;
    const r = resolveLine(ref); if (!r) return '';
    return `<li><a href="#lab/${E(ref)}">${icon('flask', 18)}<span>${E(t(r.line.title))}</span></a></li>`;
  }).join('');
}

export function olympiadPage(id, t, n) {
  if (!id) {
    const byTheme = [...new Set(STRATEGIES.map((s) => t(s.theme)))];
    return `<main id="main" tabindex="-1" class="page olymp-page"><h1>${t(['Olympiades', 'Olympiads'])}</h1>
<p class="page-intro">${t(['Dix façons de penser qui reviennent dans tous les concours. Chacune commence par une question à manipuler, explique l’idée sur un exemple, puis propose une échelle de problèmes, de la sélection nationale au niveau international, avec des indices progressifs et des solutions complètes.', 'Ten ways of thinking that come back in every competition. Each one starts with a question to handle, explains the idea on an example, then offers a ladder of problems, from national selection to international level, with progressive hints and full solutions.'])}</p>
<ul class="olymp-levels">${Object.entries(LEVELS).map(([k, v]) => `<li class="olymp-level olymp-${k}">${E(t(v))}</li>`).join('')}</ul>
${byTheme.map((theme) => `<section class="olymp-theme"><h2>${E(theme)}</h2><ul class="olymp-grid">${STRATEGIES.filter((s) => t(s.theme) === theme).map((s) => `<li><a class="olymp-card" href="#olympiad/${s.id}">${icon(s.icon, 26)}<strong>${M(t(s.title))}</strong><span>${M(t(s.hook))}</span></a></li>`).join('')}</ul></section>`).join('')}
<p class="olymp-note"><a href="#contests">${t(['Sujets de compétitions : olympiades internationales et autres concours', 'Competition papers: international olympiads and other contests'])} →</a></p>
<p class="muted olymp-note">${t(['Les problèmes classiques sont reformulés ; la source est indiquée quand un problème vient d’un concours.', 'Classical problems are restated in our own words; the source is given when a problem comes from a competition.'])}</p></main>`;
  }
  const s = STRATEGIES.find((x) => x.id === id), i = STRATEGIES.indexOf(s);
  if (n) return solutionPage(s, Number(n) - 1, t);
  const prev = STRATEGIES[i - 1], next = STRATEGIES[i + 1];
  const lab = s.links.find(([k]) => k === 'lab');
  const handle = s.widget ? `<div class="olymp-widget" data-olymp-widget="${s.widget}"></div>`
    : lab ? `<div class="chapter-lab-host lab2-host olymp-lab" data-lab-ref="${E(lab[1])}"></div>` : '';
  const problem = (p, n) => `<article class="olymp-problem olymp-${p.level}" id="p${n + 1}"><header><span class="olymp-level olymp-${p.level}">${E(t(LEVELS[p.level]))}</span><h3>${t(['Problème', 'Problem'])} ${n + 1} · ${M(t(p.title))}</h3></header>
<p>${M(t(p.q))}</p>${p.hints.map((h, k) => `<details class="olymp-hint"><summary>${t(['Indice', 'Hint'])} ${k + 1}</summary><p>${M(t(h))}</p></details>`).join('')}
<p class="olymp-go"><a class="olymp-solution-link" href="#olympiad/${s.id}/${n + 1}">${t(['Voir la solution, après avoir cherché', 'See the solution, after trying'])} →</a></p>${p.source ? `<p class="olymp-source">${t(['Source : ', 'Source: '])}${E(t(p.source))}</p>` : ''}</article>`;
  return `<main id="main" tabindex="-1" class="page olymp-page olymp-detail"><nav class="breadcrumb"><a href="#olympiad">${t(['Toutes les stratégies', 'All strategies'])}</a></nav>
<p class="muted">${E(t(s.theme))}</p><h1>${M(t(s.title))}</h1>
<section class="olymp-hook"><h2>${t(['La question', 'The question'])}</h2><p class="olymp-question">${M(t(s.hook))}</p>${handle}</section>
<section class="olymp-idea"><h2>${t(['L’idée', 'The idea'])}</h2>${s.idea.map((x) => `<p>${M(t(x))}</p>`).join('')}</section>
<section class="olymp-example"><h2>${t(['Un exemple résolu', 'A solved example'])}</h2><p><strong>${M(t(s.example.q))}</strong></p><p>${M(t(s.example.s))}</p>${s.example.code ? code(s.example.code) : ''}</section>
<section class="olymp-problems"><h2>${t(['À vous de chercher', 'Your turn'])}</h2><p class="muted">${t(['Cherchez d’abord seul, au moins quelques minutes, avec des petits cas et une figure. Les indices s’ouvrent un par un.', 'Try alone first, for a few minutes at least, with small cases and a figure. The hints open one at a time.'])}</p>${s.problems.map(problem).join('')}</section>
${s.links.length ? `<section class="olymp-links"><h2>${t(['Manipuler sur le site', 'Hands-on on this site'])}</h2><ul>${linkList(s, t)}</ul></section>` : ''}
<nav class="olymp-pager">${prev ? `<a href="#olympiad/${prev.id}">← ${M(t(prev.title))}</a>` : '<span></span>'}${next ? `<a href="#olympiad/${next.id}">${M(t(next.title))} →</a>` : ''}</nav></main>`;
}

function solutionPage(s, k, t) {
  const p = s.problems[k], prev = s.problems[k - 1], next = s.problems[k + 1];
  return `<main id="main" tabindex="-1" class="page olymp-page olymp-detail"><nav class="breadcrumb"><a href="#olympiad">${t(['Toutes les stratégies', 'All strategies'])}</a> › <a href="#olympiad/${s.id}">${M(t(s.title))}</a></nav>
<p class="muted">${E(t(s.theme))} · <span class="olymp-level olymp-${p.level}">${E(t(LEVELS[p.level]))}</span></p><h1>${t(['Problème', 'Problem'])} ${k + 1} · ${M(t(p.title))}</h1>
<details class="olymp-recall" open><summary>${t(['L’énoncé', 'The problem'])}</summary><p>${M(t(p.q))}</p></details>
<section class="olymp-solution-page"><h2>${t(['Solution', 'Solution'])}</h2><p>${M(t(p.s))}</p>${p.code ? code(p.code) : ''}</section>
${p.source ? `<p class="olymp-source">${t(['Source : ', 'Source: '])}${E(t(p.source))}</p>` : ''}
<nav class="olymp-pager">${prev ? `<a href="#olympiad/${s.id}/${k}">← ${t(['Problème', 'Problem'])} ${k}</a>` : `<a href="#olympiad/${s.id}">← ${M(t(s.title))}</a>`}${next ? `<a href="#olympiad/${s.id}/${k + 2}">${t(['Problème', 'Problem'])} ${k + 2} →</a>` : `<a href="#olympiad/${s.id}">${M(t(s.title))} →</a>`}</nav></main>`;
}

export function bindOlympiad(root, lang) {
  const live = [];
  root.querySelectorAll('[data-olymp-widget]').forEach((el) => live.push(mountWidget(el.dataset.olympWidget, el, lang)));
  // the laboratory's code is fetched only by a strategy that shows an experiment
  const labs = [...root.querySelectorAll('.olymp-lab')];
  let gone = false;
  if (labs.length) import('./lab/mount.js').then(({ mountExperiment }) => { if (!gone) labs.forEach((el) => live.push(mountExperiment(el, el.dataset.labRef, { mode: 'inline', lang }))); });
  typeset(root).catch(() => {});
  return () => { gone = true; live.forEach((x) => x?.destroy?.()); };
}
