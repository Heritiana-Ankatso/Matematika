// The design v8 switch (docs/REBUILD_PLAN.md section 3). Off by default: the site renders exactly as before. `?v8` in the
// address turns it on for this device (remembered, for the owner's review), `?v8=off` turns it off again. Stage 8 makes it
// the default. While it is on, a page that has its v8 version is drawn in its world (routes.js `world`): the root element
// carries `data-world`, and the world's stylesheet is loaded the first time the world is entered.
const KEY = 'mx-v8';

function decide() {
  let query = null;
  try { query = new URLSearchParams(globalThis.location?.search || '').get('v8'); } catch { /* no address */ }
  try {
    if (query !== null) {
      if (query === 'off' || query === '0') globalThis.localStorage?.removeItem(KEY);
      else globalThis.localStorage?.setItem(KEY, '1');
    }
    if (globalThis.localStorage?.getItem(KEY) === '1') return true;
  } catch { /* storage blocked: the address alone decides */ }
  return query !== null && query !== 'off' && query !== '0';
}

export const V8_ACTIVE = decide();

// The five grounds: the threshold (home) and the four worlds of docs/DESIGN_V8.md section 3.
export const WORLDS = ['home', 'musee', 'univ', 'lycee', 'olymp'];

const loaded = new Set();
// Sets the world on the root element and loads its stylesheet once. The shared v8 rules (tokens.css, controls.css) are
// already on every page; they apply only under `data-world`.
export function enterWorld(world, doc = globalThis.document) {
  if (!WORLDS.includes(world) || !doc) return;
  doc.documentElement.dataset.world = world;
  if (loaded.has(world)) return;
  loaded.add(world);
  // the versioned link written by the build into index.html (template #v8-world-styles), else the plain address
  const kept = doc.getElementById('v8-world-styles')?.content.querySelector(`link[data-world="${world}"]`);
  const link = kept ? kept.cloneNode(true) : Object.assign(doc.createElement('link'), { rel: 'stylesheet', href: `./styles/world-${world}.css` });
  link.dataset.world = world;
  doc.head.append(link);
}
// Back to the current look (a page without its v8 version, or the switch turned off).
export function leaveWorld(doc = globalThis.document) {
  if (doc?.documentElement.dataset.world) delete doc.documentElement.dataset.world;
}
