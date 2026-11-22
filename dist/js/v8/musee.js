// Design v8, the Musée hall (#musee under ?v8; docs/DESIGN_V8.md section 3, docs/REBUILD_PLAN.md stage 3): the exhibit of
// the day drawing itself, "Là où on ne les attend pas", and the eight rooms, folded, one open at a time. The selection is
// museum-data.js (ids only); every title and count is read from the sources through world-lines.js.
import { COLLECTIONS } from '../world-lines.js';
import { ROOMS, UNEXPECTED, HREF, ROMAN, exhibitOfTheDay } from '../museum-data.js';
import { topBar, foldGroup, bindMenu, sayer, E } from './kit.js';

const P = (fr, en) => [fr, en];
const find = (collection, id) => COLLECTIONS[collection]?.find((x) => x.id === id) || null;
// "49 pièces", "69 mathématiciens · 82 avancées": counted from the collections
export const roomCount = (room, lang) => room.count.map(([collection, one, many]) => {
  const n = COLLECTIONS[collection].length;
  return `${n} ${(n === 1 ? one : many)[lang === 'fr' ? 0 : 1]}`;
}).join(' · ');

// The small drawing on each room's door (decorative).
function roomArt(kind) {
  let s = '';
  if (kind === 'reuleaux') {
    const P3 = [90, 210, 330].map((a) => [60 + 30 * Math.cos(a * Math.PI / 180), 46 - 30 * Math.sin(a * Math.PI / 180)]), R = 30 * Math.sqrt(3);
    s = P3.map((c, i) => {
      const a = P3[(i + 1) % 3], b = P3[(i + 2) % 3];
      const t0 = Math.atan2(a[1] - c[1], a[0] - c[0]); let dt = Math.atan2(b[1] - c[1], b[0] - c[0]) - t0;
      while (dt > Math.PI) dt -= 2 * Math.PI; while (dt < -Math.PI) dt += 2 * Math.PI;
      const pts = []; for (let k = 0; k <= 16; k++) { const t = t0 + dt * k / 16; pts.push((c[0] + R * Math.cos(t)).toFixed(1) + ',' + (c[1] + R * Math.sin(t)).toFixed(1)); }
      return `<polyline points="${pts.join(' ')}"/>`;
    }).join('') + '<circle class="dot" cx="60" cy="46" r="2.6"/>';
  }
  if (kind === 'pi') s = '<line class="faint" x1="10" y1="76" x2="110" y2="76"/><line class="faint" x1="14" y1="20" x2="14" y2="76"/><rect x="34" y="60" width="16" height="16" class="box"/><rect x="72" y="52" width="24" height="24" class="box"/><path d="M28 68 h-8 M104 64 h-8"/><circle class="dot" cx="60" cy="30" r="2.6"/>';
  if (kind === 'koch') {
    let pts = [[20, 70], [100, 70]];
    for (let k = 0; k < 3; k++) { const n = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]], dx = (b[0] - a[0]) / 3, dy = (b[1] - a[1]) / 3, p1 = [a[0] + dx, a[1] + dy], p2 = [a[0] + 2 * dx, a[1] + 2 * dy]; n.push(a, p1, [p1[0] + dx / 2 + dy * Math.sqrt(3) / 2, p1[1] + dy / 2 - dx * Math.sqrt(3) / 2], p2); } n.push(pts.at(-1)); pts = n; }
    s = `<polyline points="${pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}"/>`;
  }
  if (kind === 'curve') { const pts = []; for (let x = -2.6; x <= 2.61; x += 0.1) pts.push(`${(60 + x * 18).toFixed(1)},${(78 - x * x * 8).toFixed(1)}`); s = `<line class="faint" x1="10" y1="78" x2="110" y2="78"/><polyline points="${pts.join(' ')}"/><circle class="dot" cx="${60 + 1.4 * 18}" cy="${78 - 1.96 * 8}" r="3"/>`; }
  if (kind === 'bridges') {
    const N = [[30, 24], [30, 68], [70, 46], [98, 46]], L = [[0, 2], [0, 2], [1, 2], [1, 2], [0, 3], [1, 3], [2, 3]];
    s = L.map(([a, b], i) => { const [p, q] = [N[a], N[b]], bend = (i % 2 ? 1 : -1) * (L.filter((e) => e[0] === a && e[1] === b).length > 1 ? 10 : 0); return `<path d="M${p[0]},${p[1]} Q${(p[0] + q[0]) / 2},${(p[1] + q[1]) / 2 + bend} ${q[0]},${q[1]}"/>`; }).join('') + N.map((p) => `<circle class="dot" cx="${p[0]}" cy="${p[1]}" r="3.2"/>`).join('');
  }
  if (kind === 'time') s = '<line x1="8" y1="50" x2="112" y2="50"/>' + [16, 34, 48, 70, 88, 104].map((x, i) => `<line class="faint" x1="${x}" y1="${i % 2 ? 42 : 50}" x2="${x}" y2="${i % 2 ? 50 : 58}"/><circle class="dot" cx="${x}" cy="50" r="2.4"/>`).join('');
  if (kind === 'book') s = '<path d="M60 30 C48 24 30 24 18 28 V74 C30 70 48 70 60 76 Z"/><path d="M60 30 C72 24 90 24 102 28 V74 C90 70 72 70 60 76 Z"/><path class="faint" d="M26 40 h24 M26 50 h24 M70 40 h24 M70 50 h20"/>';
  if (kind === 'cross') s = '<path class="faint" d="M18 34 h84 M18 58 h84"/><path d="M22 46 h30"/><path d="M64 38 l14 16 M78 38 l-14 16"/><circle class="dot" cx="96" cy="46" r="2.6"/>';
  return `<svg class="v8-art" viewBox="0 0 120 92" aria-hidden="true" focusable="false">${s}</svg>`;
}

export function museePage({ t, lang, siteName, date = new Date() }) {
  const say = sayer(lang);
  const day = exhibitOfTheDay(COLLECTIONS.curiosities, date);
  const rooms = ROOMS.map((room, i) => {
    const items = room.picks.map(([collection, id]) => { const x = find(collection, id); return x && `<li><a href="${E(HREF[collection](x))}">${say(x.title)}</a></li>`; }).filter(Boolean).join('');
    const count = E(roomCount(room, lang));
    return `<details class="v8-room" name="v8-rooms" data-room="${room.id}"><summary>${roomArt(room.art)}<span class="v8-room-t"><span class="v8-placard">${say(P('Salle', 'Room'))} ${ROMAN[i]}</span><span class="v8-room-name">${say(room.name)}</span><span class="v8-room-count">${count}</span><span class="v8-room-promise">${say(room.promise)}</span></span></summary><div class="v8-room-body"><ul class="v8-list">${items}</ul><p><a class="v8-btn" href="${room.hash}">${say(P('Toute la salle', 'The whole room'))} · ${count}</a></p></div></details>`;
  }).join('');
  const unexpected = UNEXPECTED.map(({ id, where }) => { const x = find('curiosities', id); return x && `<a class="v8-uq" href="${E(HREF.curiosities(x))}"><span class="v8-where">${say(where)}</span><span class="v8-q">${say(x.title)}</span><span class="v8-open">${say(P('Entrer', 'Enter'))}</span></a>`; }).filter(Boolean).join('');
  return `<div class="v8">${topBar({ t, world: 'musee', siteName })}<main id="main" tabindex="-1">`
    + `<section class="v8-hall-hero"><div class="v8-wrap v8-hall-grid"><div><span class="v8-placard">${say(P('Le musée', 'The museum'))}</span><h1>${say(P('Contempler les merveilles des mathématiques.', 'Contemplate the marvels of mathematics.'))}</h1><p class="v8-lede">${say(P('Des objets à manipuler, cinq mille ans de grands esprits, des histoires vraies, et des idées cachées là où on ne les attend pas.', 'Objects to handle, five thousand years of great minds, true stories, and ideas hidden where nobody expects them.'))}</p><p><a class="v8-btn is-accent" href="#v8-rooms" data-jump>${say(P('Parcourir les salles', 'Walk through the rooms'))}</a></p></div>`
    + (day ? `<figure class="v8-today"><a href="${E(HREF.curiosities(day))}" class="v8-today-link"><canvas data-art="${E(day.id)}" role="img" aria-label="${say(day.title)}"></canvas></a><figcaption><span class="v8-eyebrow">${say(P('Pièce du jour', 'Exhibit of the day'))}</span><b>${say(day.title)}</b>${say(day.intro)} <a href="${E(HREF.curiosities(day))}">${say(P('Entrer', 'Enter'))}</a></figcaption></figure>` : '')
    + `</div></section>`
    + `<section class="v8-wrap v8-band" aria-labelledby="v8-unexp"><h2 id="v8-unexp">${say(P('Là où on ne les attend pas', 'Where nobody expects them'))}</h2><p class="v8-muted">${say(P('Des questions de tous les jours, que les mathématiciens étudient très sérieusement.', 'Everyday questions that mathematicians study very seriously.'))}</p><div class="v8-unexp">${unexpected}</div></section>`
    + `<section class="v8-wrap v8-band" id="v8-rooms" aria-labelledby="v8-rooms-h"><h2 id="v8-rooms-h">${say(P('Les salles du musée', 'The rooms of the museum'))}</h2><p class="v8-muted">${say(P('Huit salles, de la curiosité d’un instant à cinq mille ans d’histoire. Ouvrez celle qui vous attire.', 'Eight rooms, from a moment’s curiosity to five thousand years of history. Open the one that draws you.'))}</p><div class="v8-rooms" data-fold-group="v8-rooms">${rooms}</div></section>`
    + `</main></div>`;
}

export function bindMusee(root, { lang, reduced = () => false } = {}) {
  const stops = [foldGroup(root), bindMenu(root)];
  root.querySelectorAll('[data-jump]').forEach((a) => { const go = (e) => { e.preventDefault(); root.querySelector(a.getAttribute('href'))?.scrollIntoView({ block: 'start' }); }; a.addEventListener('click', go); stops.push(() => a.removeEventListener('click', go)); });
  // the exhibit of the day draws itself with its own card drawing (home-art.js), loaded after the hall is on screen
  const canvas = root.querySelector('.v8-today canvas[data-art]');
  let gone = false;
  if (canvas) import('../home-art.js').then(({ mountArt }) => { if (!gone && canvas.isConnected) stops.push(mountArt(canvas, canvas.dataset.art, { reduced, lang }) || (() => {})); }).catch(() => {});
  return () => { gone = true; stops.forEach((stop) => stop()); };
}
