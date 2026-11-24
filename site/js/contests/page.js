// The competition archive: #contests (every competition, by field), #contests/<c> (its papers), #contests/<c>/<paper>
// (the statements) and, for an Olympiad only, #contests/<c>/<paper>/<n> (the solution on its own page, owner rule of
// 23 November 2026). Other competitions show the solution folded under the problem; a task whose answer is a sequence
// of commands is also played and checked on the page (widgets.js). Data: registry.js, euclid.js, ioi.js (bcc.js unpublished, IMO held back); maths: models.js.
import { COMPETITIONS, FIELDS, KINDS, TOPICS, competition, paperOf, problemOf, problemCount } from './registry.js';
import { typeset } from '../mathjax.js';
import { icon } from '../icons.js';

const E = (x) => String(x).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = (fr, en) => [fr, en];
const ext = (href, label) => `<a href="${E(href)}" rel="noopener" target="_blank">${E(label)}</a>`;
const nameOf = (c, t) => (Array.isArray(c.short) ? t(c.short) : c.short);
const paperTitle = (c, p, t) => `${nameOf(c, t)} ${p.year}`;
const crumbs = (items) => `<nav class="breadcrumb contest-crumbs">${items.map(([href, label]) => (href ? `<a href="${href}">${E(label)}</a>` : `<span>${E(label)}</span>`)).join(' <span aria-hidden="true">›</span> ')}</nav>`;
const statement = (q, t) => (Array.isArray(q[0]) ? q : [q]).map((x) => `<p>${E(t(x))}</p>`).join('');

function card(c, t) {
  const n = problemCount(c);
  const status = n ? `${c.papers.length} ${t(c.papers.length > 1 ? P('sujets', 'papers') : P('sujet', 'paper'))}` : t(P('Sujets à venir', 'Papers to come'));   // no count of problems (owner rule, 23 November 2026)
  return `<li><a class="olymp-card contest-card${n ? '' : ' is-planned'}" href="#contests/${c.id}">${icon(c.field === 'cs' ? 'code' : 'trophy', 24)}<strong>${E(t(c.name))}</strong><span>${E(t(c.level))}</span><small>${E(t(KINDS[c.kind]))} · ${E(status)}</small></a></li>`;
}

function indexPage(t) {
  const group = (field, kind, title) => {
    const list = COMPETITIONS.filter((c) => c.field === field && (!kind || c.kind === kind));
    return list.length ? `<section class="olymp-theme"><h2>${E(t(title))}</h2><ul class="olymp-grid">${list.map((c) => card(c, t)).join('')}</ul></section>` : '';
  };
  return `<main id="main" tabindex="-1" class="page olymp-page contest-page"><h1>${t(P('Concours et olympiades', 'Competitions and olympiads'))}</h1>
<p class="page-intro">${t(P('Les sujets de vraies compétitions, en français et en anglais. Pour les olympiades, la solution est sur une page à part : cherchez d’abord. Pour les autres concours, elle est repliée sous chaque problème, et une tâche dont la réponse est une suite de commandes se joue et se vérifie directement sur la page.', 'Papers from real competitions, in French and English. For olympiads the solution has its own page: try first. For the other contests it is folded under each problem, and a task whose answer is a sequence of commands is played and checked on the page.'))}</p>
${group('math', 'olympiad', P('Olympiades de mathématiques', 'Mathematics olympiads'))}${group('math', 'contest', P('Concours de mathématiques', 'Mathematics contests'))}${group('cs', null, FIELDS.cs)}
<p class="muted olymp-note">${t(P('Chaque fiche indique la source officielle et ce que ses conditions permettent. Les énoncés sans licence ouverte sont reformulés par nos soins.', 'Each entry gives the official source and what its terms allow. Problems without an open licence are restated in our own words.'))}</p></main>`;
}

function competitionPage(c, t) {
  const papers = c.papers.length
    ? `<ul class="contest-papers">${c.papers.map((p) => `<li><a href="#contests/${c.id}/${p.id}"><strong>${E(paperTitle(c, p, t))}</strong><span>${E(t(p.place))}</span>${p.problems.some((x) => x.s) ? `<small>${t(P('avec solutions', 'with solutions'))}</small>` : ''}</a></li>`).join('')}</ul>`
    : `<p class="contest-planned">${t(P('Aucun sujet sur le site pour l’instant.', 'No paper on the site yet.'))}</p>`;
  return `<main id="main" tabindex="-1" class="page olymp-page contest-page">${crumbs([['#contests', t(P('Concours', 'Competitions'))], [null, nameOf(c, t)]])}
<p class="muted">${E(t(FIELDS[c.field]))} · ${E(t(KINDS[c.kind]))}</p><h1>${E(t(c.name))}</h1><p>${E(t(c.level))}</p>${c.about ? `<p>${E(t(c.about))}</p>` : ''}
${papers}<p class="olymp-source">${E(t(c.rights))}${c.site ? ` ${t(P('Source officielle :', 'Official source:'))} ${ext(c.site, new URL(c.site).hostname)}` : ''}</p></main>`;
}

function choices(c, prob, t, lang) {
  if (!prob.choices) return '';
  const list = lang === 'en' && prob.choicesEn ? prob.choicesEn : prob.choices;
  const name = `q-${c.id}-${prob.n}`;
  return `<fieldset class="contest-choices" data-correct="${prob.correct}"><legend>${t(P('Votre réponse', 'Your answer'))}</legend>${list.map((x, i) => `<label><input type="radio" name="${name}" value="${i}"> <b>${'ABCD'[i]}</b> ${E(Array.isArray(x) ? t(x) : x)}</label>`).join('')}
<button type="button" class="contest-check">${t(P('Vérifier', 'Check'))}</button><p class="contest-verdict" aria-live="polite"></p></fieldset>`;
}

// a short answer typed by the visitor, compared with the official ones (spaces ignored, decimal comma accepted)
function typed(c, prob, t) {
  if (!prob.expect) return '';
  return `<form class="contest-choices contest-typed" data-expect="${E(JSON.stringify(prob.expect))}"><label class="contest-field"><span>${t(P('Votre réponse', 'Your answer'))}</span><input type="text" inputmode="decimal" autocomplete="off" size="10"></label>
<button type="submit">${t(P('Vérifier', 'Check'))}</button><p class="contest-verdict" aria-live="polite"></p></form>`;
}
export const sameAnswer = (typedText, expected) => { const norm = (x) => String(x).replace(/\s+/g, '').replace(',', '.').replace('\u2212', '-').toLowerCase(); return expected.some((e) => norm(e) === norm(typedText)); };
const heading = (prob, t) => (prob.label ? `${t(P('Question', 'Question'))} ${E(prob.label)}` : `${t(P('Problème', 'Problem'))} ${prob.n}`);

function problemBlock(c, paper, prob, t, lang) {
  const olympiad = c.kind === 'olympiad';
  const topic = prob.topic ? `<span class="olymp-level">${E(t(TOPICS[prob.topic]))}</span>` : '';
  const widget = prob.widget ? `<div class="contest-widget" data-contest-widget="${prob.widget}" data-mode="explore"></div>${prob.command ? `<p class="muted contest-command">${E(t(prob.command))}</p>` : ''}` : '';
  const after = olympiad
    ? (prob.s ? `<p class="contest-go"><a class="contest-solution-link" href="#contests/${c.id}/${paper.id}/${prob.n}">${t(P('Voir la solution', 'See the solution'))} →</a></p>` : `<p class="muted contest-go">${t(P('Pas de solution rédigée sur le site pour l’instant.', 'No written solution on the site for now.'))}</p>`)
    : `${choices(c, prob, t, lang)}${typed(c, prob, t)}${prob.s ? `<details class="olymp-solution"><summary>${t(P('Solution', 'Solution'))}</summary>${prob.s.map((x) => `<p>${E(t(x))}</p>`).join('')}</details>` : ''}`;
  return `<article class="olymp-problem contest-problem" id="p${prob.n}"><header><h2>${heading(prob, t)} · ${E(t(prob.title))}</h2>${topic}</header>${statement(prob.q, t)}${widget}${after}</article>`;
}

function paperPage(c, paper, t, lang) {
  return `<main id="main" tabindex="-1" class="page olymp-page olymp-detail contest-page">${crumbs([['#contests', t(P('Concours', 'Competitions'))], [`#contests/${c.id}`, nameOf(c, t)], [null, String(paper.year)]])}
<h1>${E(paperTitle(c, paper, t))}</h1><p class="muted">${E(t(paper.place))}</p>
${paper.official ? `<p class="olymp-source contest-official">${E(t(paper.official.label))} : ${ext(paper.official.url, new URL(paper.official.url).hostname)}</p>` : ''}
${c.kind === 'olympiad' ? `<p class="olymp-question contest-advice">${t(P('Cherchez chaque problème avant d’ouvrir sa solution : elle est sur une page à part.', 'Work on each problem before opening its solution: it is on a separate page.'))}</p>` : ''}
${paper.problems.map((p) => problemBlock(c, paper, p, t, lang)).join('')}
<p class="olymp-source">${E(t(c.rights))}${c.site ? ` ${t(P('Sujet officiel :', 'Official paper:'))} ${ext(c.site, new URL(c.site).hostname)}` : ''}</p></main>`;
}

function solutionPage(c, paper, prob, t) {
  const solved = paper.problems.filter((p) => p.s), i = solved.indexOf(prob), prev = solved[i - 1], next = solved[i + 1];
  const body = prob.s
    ? `${prob.answer ? `<section><h2>${t(P('Réponse', 'Answer'))}</h2><p class="olymp-question">${E(t(prob.answer))}</p></section>` : ''}
<section class="contest-solution"><h2>${t(P('Solution', 'Solution'))}</h2>${prob.s.map((x) => `<p>${E(t(x))}</p>`).join('')}</section>
${prob.widget === 'turbo' ? `<section><h2>${t(P('La stratégie en action', 'The strategy at work'))}</h2><div class="contest-widget" data-contest-widget="turbo" data-mode="strategy"></div></section>` : ''}
${prob.check ? `<p class="olymp-source">${t(P('Vérifié par le calcul : ', 'Checked by computation: '))}${E(t(prob.check))}</p>` : ''}`
    : `<p class="muted">${t(P('Pas de solution rédigée sur le site pour l’instant.', 'No written solution on the site for now.'))}</p>`;
  return `<main id="main" tabindex="-1" class="page olymp-page olymp-detail contest-page">${crumbs([['#contests', t(P('Concours', 'Competitions'))], [`#contests/${c.id}`, nameOf(c, t)], [`#contests/${c.id}/${paper.id}`, String(paper.year)], [null, `${t(P('Solution du problème', 'Solution to problem'))} ${prob.n}`]])}
<h1>${E(paperTitle(c, paper, t))} · ${t(P('Problème', 'Problem'))} ${prob.n} · ${E(t(prob.title))}</h1>
<details class="contest-recall" open><summary>${t(P('L’énoncé', 'The problem'))}</summary>${statement(prob.q, t)}</details>${body}
<nav class="olymp-pager">${prev ? `<a href="#contests/${c.id}/${paper.id}/${prev.n}">← ${t(P('Problème', 'Problem'))} ${prev.n}</a>` : `<a href="#contests/${c.id}/${paper.id}">← ${t(P('Le sujet', 'The paper'))}</a>`}${next ? `<a href="#contests/${c.id}/${paper.id}/${next.n}">${t(P('Problème', 'Problem'))} ${next.n} →</a>` : ''}</nav></main>`;
}

export function contestsPage(r, t, lang) {
  const c = competition(r.id);
  if (!c) return indexPage(t);
  const paper = paperOf(c, r.tab);
  if (!paper) return competitionPage(c, t);
  const prob = r.sub ? problemOf(paper, r.sub) : null;
  return prob ? solutionPage(c, paper, prob, t) : paperPage(c, paper, t, lang);
}

export function bindContests(root, lang) {
  const live = [];
  let gone = false;
  root.querySelectorAll('.contest-choices:not(.contest-typed)').forEach((f) => {
    const out = f.querySelector('.contest-verdict');
    f.querySelector('.contest-check').addEventListener('click', () => {
      const v = f.querySelector('input:checked');
      if (!v) { out.textContent = lang === 'en' ? 'Choose an answer first.' : 'Choisissez d’abord une réponse.'; return; }
      const ok = v.value === f.dataset.correct;
      out.className = `contest-verdict ${ok ? 'is-ok' : 'is-no'}`;
      out.textContent = ok ? (lang === 'en' ? 'Right.' : 'C’est juste.') : (lang === 'en' ? 'Not this one. Try again, or play it on the figure.' : 'Pas celle-ci. Réessayez, ou jouez-la sur la figure.');
    });
  });
  root.querySelectorAll('.contest-typed').forEach((f) => f.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = f.querySelector('input').value.trim(), out = f.querySelector('.contest-verdict');
    if (!v) { out.textContent = lang === 'en' ? 'Type an answer first.' : 'Tapez d’abord une réponse.'; return; }
    const ok = sameAnswer(v, JSON.parse(f.dataset.expect));
    out.className = `contest-verdict ${ok ? 'is-ok' : 'is-no'}`;
    out.textContent = ok ? (lang === 'en' ? 'Right.' : 'C’est juste.') : (lang === 'en' ? 'Not yet.' : 'Pas encore.');
  }));
  const hosts = [...root.querySelectorAll('[data-contest-widget]')];
  if (hosts.length) import('./widgets.js').then(({ mountContestWidget }) => {
    if (!gone) hosts.forEach((el) => live.push(mountContestWidget(el.dataset.contestWidget, el, { lang, mode: el.dataset.mode })));
  });
  // a folded solution is typeset when it opens
  const open = (e) => { if (e.target.open) typeset(e.target).catch(() => {}); };
  root.addEventListener('toggle', open, true);
  typeset(root).catch(() => {});
  return () => { gone = true; root.removeEventListener('toggle', open, true); live.forEach((x) => x?.destroy?.()); };
}
