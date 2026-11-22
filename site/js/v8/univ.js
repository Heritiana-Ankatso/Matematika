// Design v8, the Université world (#university under ?v8; docs/DESIGN_V8.md section 3, docs/REBUILD_PLAN.md stage 4):
// the live map of the fields of mathematics (the lit stars are our courses) with its list alternative, the courses of
// manifest.json `university`, the foundation lessons (#basics) beside "Fondements mathématiques" (decision 4), and "Les
// grands assauts" with a Syracuse sequence to try. Fields: university-map.js; problems: sieges-data.js.
import { FIELDS, LINKS, LIT, fieldById, litFields } from '../university-map.js';
import { SIEGES, resisted } from '../sieges-data.js';
import { university } from '../catalogue-data.js';
import { BASICS_GROUPS } from '../basics-page.js';
import { animationLoop } from '../visible-loop.js';
import { topBar, foldGroup, bindMenu, sayer, typo, E } from './kit.js';

const P = (fr, en) => [fr, en];
const NOW = new Date().getFullYear();
const T0 = -500;
const pct = (v) => (((v - T0) / (NOW - T0)) * 100).toFixed(2);

// a day written in full, without a time zone shift: 2026-11-22 -> « 22 novembre 2026 », "22 November 2026"
export const longDate = (iso, lang) => new Date(iso + 'T12:00:00Z').toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
function siegeRow(x, say, lang) {
  const fy = (v) => (v < 0 ? `${x.approx ? '≈ ' : ''}${-v} ${lang === 'fr' ? 'av. J.-C.' : 'BC'}` : `${x.approx ? '≈ ' : ''}${v}`);
  const years = resisted(x, NOW).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-GB');
  const span = x.st === 'open' ? `${fy(x.from)} → ?` : `${fy(x.from)} → ${x.to}`;
  const verdict = x.st === 'done' ? say(P(`A résisté ${x.approx ? 'environ ' : ''}${years} ans`, `Resisted ${x.approx ? 'about ' : ''}${years} years`)) : say(P(`Résiste depuis ${years} ans`, `Resisting for ${years} years`));
  const end = x.st === 'done' ? x.to : NOW;
  return `<li class="v8-siege is-${x.st}" data-siege="${x.id}"><div class="v8-sg-t"><span class="v8-coord">${E(span)}</span><span class="v8-sg-n">${say(x.name)}</span><span class="v8-sg-q">${say(x.q)}</span>${x.a ? `<span class="v8-sg-a">${say(x.a)} <span class="v8-sg-by">${E(x.by)}</span></span>` : ''}${x.checked ? `<span class="v8-sg-a">${say(P(`Ouvert au ${longDate(x.checked, 'fr')}`, `Open as of ${longDate(x.checked, 'en')}`))}</span>` : ''}<a class="v8-sg-src" href="${E(x.source)}" target="_blank" rel="noopener noreferrer">${say(P('Source', 'Source'))}<span class="sr-only"> ${say(P('(nouvel onglet)', '(new tab)'))}</span></a></div><div class="v8-sg-bar" aria-hidden="true"><i style="left:${pct(x.from)}%;width:${(pct(end) - pct(x.from)).toFixed(2)}%"></i></div><span class="v8-sg-v">${verdict}</span></li>`;
}

export function univPage({ t, lang, siteName }) {
  const say = sayer(lang);
  const lit = litFields();
  const courses = university.sections.map((s) => {
    const fields = (LIT[s.id] || []).map((id) => say(fieldById(id).name)).join(' · ');
    const lessons = s.sequences.map((q) => `<li><a href="#university/${E(q.id)}"><span class="v8-num">${E(q.number)}</span><span>${say(q.title)}</span></a></li>`).join('');
    const extra = s.id === 'foundations' ? `<h3 class="v8-sub-h">${say(P('Les bases', 'Foundations'))}</h3>${BASICS_GROUPS.map((g) => `<p class="v8-muted">${say(g.title)}</p><ul class="v8-list">${g.lessons.map((l) => `<li><a href="#basics/${E(l.id)}"><span>${say(l.title)}</span></a></li>`).join('')}</ul>`).join('')}` : '';
    return `<details name="v8-courses" data-course="${E(s.id)}"><summary><span><span class="v8-coord">${E(fields)}</span><span class="v8-course-name">${say(s.title)}</span></span><span class="v8-count">${s.sequences.length} ${say(P('leçons', 'lessons'))}</span></summary><div class="v8-fold-body"><ul class="v8-list">${lessons}</ul>${extra}</div></details>`;
  }).join('');
  const fieldList = FIELDS.map((f) => {
    const by = university.sections.filter((s) => (LIT[s.id] || []).includes(f.id)).map((s) => say(s.title));
    return `<li data-field="${f.id}"${lit.has(f.id) ? ' class="is-lit"' : ''}><b>${say(f.name)}</b> <span class="v8-muted">${say(f.line)}</span>${by.length ? ` <span class="v8-coord">${say(P('Nos cours', 'Our courses'))} : ${by.join(' · ')}</span>` : ''}${f.topics.map((id) => ` <a href="#topics/${E(id)}">${say(P('Ressources du site', 'Resources on the site'))}</a>`).join('')}</li>`;
  }).join('');
  const groups = [['done', P('Tombés', 'Fallen')], ['open', P('Toujours ouverts', 'Still open')]];
  return `<div class="v8">${topBar({ t, world: 'univ', siteName, lang })}<main id="main" tabindex="-1">`
    + `<section class="v8-sky"><canvas data-sky role="img" aria-label="${say(P('Carte du ciel des domaines des mathématiques ; les étoiles allumées sont ceux de nos cours. La liste des domaines suit.', 'Sky map of the fields of mathematics; the lit stars are those of our courses. The list of fields follows.'))}"></canvas><div class="v8-sky-tip" hidden></div>`
    + `<div class="v8-sky-title"><div class="v8-wrap"><p class="v8-coord">${FIELDS.length} ${say(P('domaines', 'fields'))} · ${LINKS.length} ${say(P('passerelles', 'links'))} · ${say(P('étoiles allumées : nos cours', 'lit stars: our courses'))}</p><h1>${say(P('Aux confins ', 'At the edge '))}<em>${say(P('du savoir', 'of knowledge'))}</em>.</h1><p class="v8-muted">${say(P('Les mathématiques sont un ciel immense : chaque domaine est une étoile, chaque passerelle relie deux façons de penser.', 'Mathematics is a vast sky: each field a star, each link a bridge between two ways of thinking.'))}</p></div></div></section>`
    + `<section class="v8-wrap v8-band"><details class="v8-fields"><summary>${say(P('La carte en liste : les domaines', 'The map as a list: the fields'))}</summary><ul class="v8-field-list">${fieldList}</ul></details></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-courses-h"><h2 id="v8-courses-h">${say(P('Nos cours', 'Our courses'))}</h2><p class="v8-muted">${say(P('Chaque cours allume des étoiles sur la carte. Ouvrez-en un pour voir ses leçons.', 'Each course lights stars on the map. Open one to see its lessons.'))}</p><div class="v8-fold" data-fold-group="v8-courses">${courses}</div></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-sieges-h"><h2 id="v8-sieges-h">${say(P('Les grands assauts', 'The great assaults'))}</h2><p class="v8-muted">${say(P('Certains problèmes ont résisté aux mathématiciens pendant des siècles, voire des millénaires. Chaque barre montre combien de temps a duré l’assaut.', 'Some problems resisted mathematicians for centuries, even millennia. Each bar shows how long the assault lasted.'))}</p>`
    + `<div class="v8-sg-axis" aria-hidden="true">${[-500, 0, 500, 1000, 1500, 2000].map((v) => `<span style="left:${pct(v)}%">${v < 0 ? '−500' : v}</span>`).join('')}</div>`
    + groups.map(([st, title]) => { const rows = SIEGES.filter((x) => x.st === st); return rows.length ? `<h3 class="v8-sub-h">${say(title)}</h3><ul class="v8-sieges">${rows.map((x) => siegeRow(x, say, lang)).join('')}</ul>` : ''; }).join('')
    + `<div class="v8-collatz"><label for="v8-cz">${say(P('Essayez Syracuse : partez de', 'Try Collatz: start from'))}</label> <input id="v8-cz" type="number" min="1" max="99999999" value="27" inputmode="numeric"> <output data-cz aria-live="polite"></output></div></section>`
    + `</main></div>`;
}

// The Syracuse (Collatz) sequence of n: the steps to reach 1 and the highest value.
export function collatz(n) {
  let steps = 0, top = n;
  while (n !== 1 && steps < 10000) { n = n % 2 ? 3 * n + 1 : n / 2; top = Math.max(top, n); steps++; }
  return { steps, top };
}

export function bindUniv(root, { lang, reduced = () => false } = {}) {
  const stops = [foldGroup(root), bindMenu(root)];
  const say = sayer(lang);
  // Syracuse
  const input = root.querySelector('#v8-cz'), out = root.querySelector('[data-cz]');
  const run = () => { const n = Math.floor(Number(input.value)); if (!(n >= 1 && n <= 99999999)) { out.textContent = ''; return; } const r = collatz(n); out.textContent = typo(lang === 'fr' ? `${r.steps} étapes pour atteindre 1, sommet ${r.top.toLocaleString('fr-FR')}` : `${r.steps} steps to reach 1, highest ${r.top.toLocaleString('en-GB')}`, lang); };
  input?.addEventListener('input', run); run();
  stops.push(() => input?.removeEventListener('input', run));
  // the sky: fields as stars, links as thin lines, our courses' fields lit; hover or focus names a star
  const cv = root.querySelector('[data-sky]'), tip = root.querySelector('.v8-sky-tip');
  if (cv) {
    const lit = litFields(), css = (n) => getComputedStyle(root.querySelector('.v8')).getPropertyValue(n).trim();
    const col = { ink: css('--w-ink'), muted: css('--w-muted'), accent: css('--w-accent'), accent2: css('--w-accent2') };
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const dust = [...Array(220)].map(() => [rnd(), rnd(), rnd() * 1.1 + 0.3, rnd() * 6]);
    const at = (f, W, H) => [24 + f.x * (W - 48), 24 + f.y * (H - 140)];
    let still = false;
    const draw = (s) => {
      const W = cv.clientWidth, H = cv.clientHeight, r = Math.min(globalThis.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * r)) { cv.width = Math.round(W * r); cv.height = Math.round(H * r); }
      const c = cv.getContext('2d'); c.setTransform(r, 0, 0, r, 0, 0); c.clearRect(0, 0, W, H);
      dust.forEach(([x, y, z, p]) => { c.globalAlpha = still ? 0.45 : 0.3 + 0.3 * Math.sin(s * 0.9 + p); c.fillStyle = col.ink; c.fillRect(x * W, y * H, z, z); });
      c.globalAlpha = 0.35; c.strokeStyle = col.accent; c.lineWidth = 1; c.beginPath();
      LINKS.forEach(([a, b]) => { const [x1, y1] = at(fieldById(a), W, H), [x2, y2] = at(fieldById(b), W, H); c.moveTo(x1, y1); c.lineTo(x2, y2); }); c.stroke();
      c.globalAlpha = 1;
      FIELDS.forEach((f) => { const [x, y] = at(f, W, H), on = lit.has(f.id); c.shadowColor = on ? col.accent2 : 'transparent'; c.shadowBlur = on ? 14 : 0; c.fillStyle = on ? col.accent2 : col.accent; c.beginPath(); c.arc(x, y, on ? 4.5 : 2.6, 0, 7); c.fill(); c.shadowBlur = 0;
        if (W > 700) { c.font = '12px "IBM Plex Sans", system-ui, sans-serif'; c.fillStyle = on ? col.ink : col.muted; c.fillText(f.name[lang === 'fr' ? 0 : 1], x + 8, y + 4); } });
    };
    const loop = animationLoop(cv, (dt, s) => { still = reduced() || !!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches; draw(s); return still ? false : undefined; }, { reduced });
    stops.push(loop.stop);
    const near = (e) => { const b = cv.getBoundingClientRect(), W = b.width, H = b.height; let best = null, d = 22; FIELDS.forEach((f) => { const [x, y] = at(f, W, H), dd = Math.hypot(x - (e.clientX - b.left), y - (e.clientY - b.top)); if (dd < d) { d = dd; best = [f, x, y]; } }); return best; };
    const show = (e) => { const hit = near(e); if (!hit) { tip.hidden = true; return; } const [f, x, y] = hit; tip.hidden = false; tip.innerHTML = `<b>${say(f.name)}</b>${say(f.line)}${lit.has(f.id) ? `<span class="v8-coord">${say(P('Allumée par nos cours', 'Lit by our courses'))}</span>` : ''}`; tip.style.left = `${Math.min(x + 12, cv.clientWidth - 270)}px`; tip.style.top = `${y + 12}px`; };
    const hide = () => { tip.hidden = true; };
    cv.addEventListener('pointermove', show); cv.addEventListener('pointerleave', hide);
    stops.push(() => { cv.removeEventListener('pointermove', show); cv.removeEventListener('pointerleave', hide); });
  }
  return () => stops.forEach((stop) => stop());
}
