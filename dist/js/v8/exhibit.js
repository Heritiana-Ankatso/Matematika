// Design v8, the exhibit page of the Musée (#gallery/<id> under ?v8; docs/DESIGN_V8.md section 4): the hook, the live
// figure, "Ce qui se passe" with the mathematics, "Où on la rencontre", "Dans les cours" (the chapters it serves), what
// else to read, and the same room. Everything comes from the existing sources: the curiosity of content.js, its article
// (gallery/articles), its figure (lab-objects.js), the chapters (related-chapters.js), the cross-links (reading.js) and the
// curated room (museum-data.js).
import { articleOf } from '../gallery/article.js';
import { mountObject } from '../lab-objects.js';
import { chaptersForLab } from '../related-chapters.js';
import { relatedTo, describe } from '../reading.js';
import { COLLECTIONS } from '../world-lines.js';
import { ROOMS, UNEXPECTED, HREF, ROMAN, roomOfExhibit } from '../museum-data.js';
import { topBar, bindMenu, sayer, E } from './kit.js';

const P = (fr, en) => [fr, en];

export function exhibitPage(lab, { t, lang, siteName }) {
  const say = sayer(lang);
  const art = articleOf(lab.id);
  const room = roomOfExhibit(lab.id), roomNumber = ROMAN[ROOMS.indexOf(room)];
  const hook = art?.lead?.[0] || lab.intro;
  const more = art?.lead?.slice(1) || [];
  const where = UNEXPECTED.find((u) => u.id === lab.id)?.where;
  const sections = (art?.sections || []).map((s, i) => `<section class="v8-ex-part" id="v8-s${i + 1}"><h3>${say(s.h)}</h3>${(s.p || []).map((p) => `<p>${say(p)}</p>`).join('')}${s.explainer ? `<div class="sol-host art-explainer" data-explain="${E(lab.id)}"></div>` : ''}</section>`).join('');
  const facts = art?.facts?.length ? `<aside class="v8-cartel" aria-label="${say(P('En bref', 'At a glance'))}"><b>${say(P('Cartel', 'Label'))}</b><dl>${art.facts.map(([k, v]) => `<dt>${say(k)}</dt><dd>${say(v)}</dd>`).join('')}</dl></aside>` : '';
  const chapters = chaptersForLab(lab.id);
  const hash = '#gallery/' + lab.id;
  const reading = [...new Set([...(lab.links || []), ...relatedTo(hash)])].map((h) => [h, describe(h)]).filter(([h, d]) => d && h !== hash);
  const sameRoom = room.picks.filter(([c, id]) => !(c === 'curiosities' && id === lab.id)).map(([c, id]) => { const x = COLLECTIONS[c].find((y) => y.id === id); return x && `<li><a href="${E(HREF[c](x))}">${say(x.title)}</a></li>`; }).filter(Boolean).join('');
  const source = lab.source ? `<p class="v8-source"><a href="${E(lab.source)}" target="_blank" rel="noopener noreferrer">${say(lab.sourceLabel || P('Source et explications', 'Source and explanation'))} <span class="sr-only">${say(P('(nouvel onglet)', '(new tab)'))}</span></a></p>` : '';
  return `<div class="v8">${topBar({ t, world: 'musee', siteName, lang })}<main id="main" tabindex="-1" class="v8-exhibit"><div class="v8-wrap v8-ex-w">`
    + `<nav class="v8-crumbs" aria-label="${say(P('Fil d’Ariane', 'Breadcrumb'))}"><a href="#musee">${say(P('Musée', 'Museum'))}</a> › <a href="${room.hash}">${say(P('Salle', 'Room'))} ${roomNumber} · ${say(room.name)}</a></nav>`
    + `${where ? `<p class="v8-where">${say(where)}</p>` : ''}<h1>${say(lab.title)}</h1><p class="v8-lede">${say(hook)}</p>`
    + `<figure class="v8-stage"><div id="object-stage" class="object-stage" data-object="${E(lab.id)}"></div></figure>`
    + `${more.map((p) => `<p>${say(p)}</p>`).join('')}`
    + `<h2>${say(P('Ce qui se passe', 'What is going on'))}</h2>${facts}${sections || `<p>${say(lab.explain || lab.intro)}</p>`}`
    + (where ? `<h2>${say(P('Où on la rencontre', 'Where it is found'))}</h2><p>${say(where)}.</p>` : '')
    + (chapters.length ? `<h2>${say(P('Dans les cours', 'In the courses'))}</h2><ul class="v8-chips">${chapters.map((c) => `<li><a href="#chapter/${E(c.id)}">${say(c.course)} › ${say(c.title)}</a></li>`).join('')}</ul>` : '')
    + (reading.length ? `<h2>${say(P('À lire aussi', 'Read also'))}</h2><ul class="v8-chips">${reading.map(([h, d]) => `<li><a href="${E(h)}">${say(d.kind)} · ${say(d.title)}</a></li>`).join('')}</ul>` : '')
    + `<h2>${say(P('Dans la même salle', 'In the same room'))}</h2><ul class="v8-chips">${sameRoom}</ul><p><a class="v8-btn" href="${room.hash}">${say(P('Toute la salle', 'The whole room'))}</a></p>`
    + `${source}</div></main></div>`;
}

export function bindExhibit(root, lab, { lang, reduced = () => false, state }) {
  const stops = [bindMenu(root)];
  const stage = root.querySelector('#object-stage');
  if (stage) stops.push(mountObject(lab.id, stage, { lang, reduced, initialValues: state?.values, onChange: (values) => { if (state) state.values = values; } }));
  // the animated explanation of an open curiosity, loaded when its section comes near
  const host = root.querySelector('[data-explain]');
  let gone = false, observer = null;
  if (host) {
    const load = () => import('../gallery/curiosity-explainers.js').then(({ mountExplainer }) => {
      if (gone || !host.isConnected) return;
      host.__solution = mountExplainer(host.dataset.explain, host, { lang, reduced });
      host.__solution?.start?.();
    }).catch(() => {});
    if (typeof IntersectionObserver === 'function') { observer = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { observer.disconnect(); load(); } }, { rootMargin: '200px 0px' }); observer.observe(host); } else load();
  }
  return () => { gone = true; observer?.disconnect(); host?.__solution?.stop?.(); stops.forEach((stop) => stop?.()); };
}
