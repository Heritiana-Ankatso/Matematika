// Design v8, the Olympiades arena (#olympiad under ?v8; docs/DESIGN_V8.md section 3, docs/REBUILD_PLAN.md stage 6): the
// problem of the day (chosen from the date, the same for everyone) with its hints and solution folded, the strategies,
// the problems as squares by level, and warm-ups from the Défis. No countdown or stopwatch (owner). Content:
// olympiad-content.js; warm-ups: olympiad-warmups.js; strategy pages keep their page, framed in this world.
import { STRATEGIES, LEVELS } from '../olympiad-content.js';
import { WARMUPS } from '../olympiad-warmups.js';
import { CHALLENGE_LINES } from '../catalogue-lines.js';
import { dayNumber } from '../museum-data.js';
import { typeset } from '../mathjax.js';
import { topBar, bindMenu, sayer, E } from './kit.js';

const P = (fr, en) => [fr, en];
const ORDER = ['mg', 'pan', 'intl'];
// every problem with its strategy, strategy by strategy
export const PROBLEMS = STRATEGIES.flatMap((s) => s.problems.map((p, i) => ({ ...p, strategy: s, index: i })));
export const problemOfTheDay = (date = new Date()) => PROBLEMS[dayNumber(date) % PROBLEMS.length];

// text with formulas: escaped, the \( \) delimiters kept for MathJax
const say = (lang) => { const s = sayer(lang); return s; };

export function olympPage({ t, lang, siteName, date = new Date() }) {
  const s = say(lang), L = lang === 'fr' ? 0 : 1;
  const day = problemOfTheDay(date);
  const squares = [...PROBLEMS].sort((a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level));
  return `<div class="v8">${topBar({ t, world: 'olymp', siteName, lang })}<main id="main" tabindex="-1">`
    + `<section class="v8-wrap v8-arena-hero"><p class="v8-figure-mono">${STRATEGIES.length} ${s(P('stratégies', 'strategies'))}</p><h1>${s(P('L’arène', 'The arena'))}</h1><p class="v8-muted v8-lede">${s(P('Des stratégies de compétition, des problèmes gradués du niveau national à l’international, et leurs solutions rédigées.', 'Competition strategies, problems graded from national to international level, and their written solutions.'))}</p></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-day-h"><div class="v8-day"><p class="v8-eyebrow">${s(P('Problème du jour', 'Problem of the day'))} · ${s(LEVELS[day.level])} · <a href="#olympiad/${E(day.strategy.id)}">${s(day.strategy.title)}</a></p><h2 id="v8-day-h">${s(day.title)}</h2><div class="v8-q" data-math>${s(day.q)}</div>`
    + day.hints.map((h, i) => `<details class="v8-reveal"><summary>${s(P(`Indice ${i + 1}`, `Hint ${i + 1}`))}</summary><div data-math>${s(h)}</div></details>`).join('')
    + `<p><a href="#olympiad/${E(day.strategy.id)}/${day.index + 1}">${s(P('Voir la solution, après avoir cherché', 'See the solution, after trying'))} →</a></p></div></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-strat-h"><h2 id="v8-strat-h">${s(P('Les stratégies', 'The strategies'))}</h2><ol class="v8-strategies">${STRATEGIES.map((x, i) => `<li><a href="#olympiad/${E(x.id)}"><span class="v8-figure-mono">${String(i + 1).padStart(2, '0')}</span><span><span class="v8-eyebrow">${s(x.theme)}</span><b>${s(x.title)}</b></span></a></li>`).join('')}</ol></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-grid-h"><h2 id="v8-grid-h">${s(P('Les problèmes', 'The problems'))}</h2><p class="v8-legend">${ORDER.map((lv) => `<span class="v8-sq is-${lv}" aria-hidden="true"></span> ${s(LEVELS[lv])}`).join(' · ')}</p><ul class="v8-squares">${squares.map((p) => `<li><a class="v8-sq is-${p.level}" href="#olympiad/${E(p.strategy.id)}" aria-label="${s(p.title)} · ${s(LEVELS[p.level])} · ${s(p.strategy.title)}" title="${s(p.title)}"></a></li>`).join('')}</ul></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-papers-h"><h2 id="v8-papers-h">${s(P('Sujets de compétitions', 'Competition papers'))}</h2><p class="v8-muted">${s(P('Les sujets des olympiades internationales et d’autres concours, avec les solutions sur des pages à part.', 'Papers from the international olympiads and other contests, with the solutions on separate pages.'))}</p><ul class="v8-chips"><li><a href="#contests/imo">IMO</a></li><li><a href="#contests">${s(P('Tous les concours', 'All competitions'))}</a></li></ul></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-warm-h"><h2 id="v8-warm-h">${s(P('Échauffements', 'Warm-ups'))}</h2><p class="v8-muted">${s(P('Des défis du musée pour s’échauffer, sans limite de temps.', 'Challenges from the museum to warm up, with no time limit.'))}</p><ul class="v8-chips">${WARMUPS.map((id) => CHALLENGE_LINES.find((c) => c.id === id)).filter(Boolean).map((c) => `<li><a href="#challenges/${E(c.id)}">${s(c.title)}</a></li>`).join('')}</ul></section>`
    + `</main></div>`;
}

export function bindOlymp(root) {
  const stops = [bindMenu(root)];
  typeset(root.querySelector('.v8-day')).catch(() => {});
  // a revealed hint or solution is typeset when opened (MathJax ignores hidden content for measuring)
  const open = (e) => { if (e.target.open) typeset(e.target).catch(() => {}); };
  root.addEventListener('toggle', open, true);
  stops.push(() => root.removeEventListener('toggle', open, true));
  return () => stops.forEach((stop) => stop());
}
