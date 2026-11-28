// Stage 1 of docs/REBUILD_PLAN.md: the shell loads only itself, pages load their own code (routes.js, app.js LOADERS),
// and the generated light data (catalogue-lines.js, discovery-context-data.js, the split catalogue) says exactly what the
// modules say.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = fileURLToPath(new URL('../site/js/', import.meta.url));
const dist = fileURLToPath(new URL('../dist/js/', import.meta.url));

// static imports and re-exports of a module (not import()), resolved to paths under site/js
function staticDeps(file) {
  const src = readFileSync(file, 'utf8');
  const out = [];
  for (const m of src.matchAll(/^\s*(?:import|export)\s[^'"`;]*?from\s*["']([^"']+)["']|^\s*import\s*["']([^"']+)["']/gm)) {
    const spec = m[1] || m[2];
    if (spec.startsWith('.')) out.push(path.resolve(path.dirname(file), spec.split('?')[0]));
  }
  return out;
}
function closure(file, seen = new Set()) {
  if (seen.has(file) || !existsSync(file)) return seen;
  seen.add(file);
  for (const d of staticDeps(file)) closure(d, seen);
  return seen;
}

test('the shell imports no page code statically', () => {
  const shell = [...closure(site + 'app.js')].map((f) => path.relative(site, f));
  for (const heavy of ['content.js', 'lab/registry.js', 'challenges/registry.js', 'exercises/bank.js', 'discovery.js', 'resource-library.js',
    'welcome.js', 'lab-objects.js', 'asset-versions.js', 'resources-data.js', 'reading-content.js', 'history-data.js']) {
    assert.ok(!shell.includes(heavy), `app.js reaches ${heavy} through static imports`);
  }
  assert.ok(shell.length <= 30, `the shell has ${shell.length} modules`);
});

test('every group a page needs has a loader, and every loader is used', async () => {
  const { ROUTES, V8_ROUTES } = await import('../site/js/routes.js');
  const app = readFileSync(site + 'app.js', 'utf8');
  const block = app.slice(app.indexOf('const LOADERS = {'), app.indexOf('const loaded = new Set()'));
  const loaders = [...block.matchAll(/^  (\w+): async/gm)].map((m) => m[1]);
  const needed = new Set([...Object.values(ROUTES), ...Object.values(V8_ROUTES)].flatMap((r) => r.needs));
  for (const g of needed) assert.ok(loaders.includes(g), `no loader for ${g}`);
  for (const g of loaders) assert.ok(needed.has(g) || app.includes(`ensure(["${g}"`) || app.includes(`"${g}"`), `loader ${g} is never used`);
  for (const [page, r] of Object.entries(ROUTES)) assert.ok(['home', 'musee', 'univ', 'lycee', 'olymp'].includes(r.world), page);
});

test('the experiment lines resolve every reference as the registry does', async () => {
  const { resolveRef, allRefs, EXPERIMENTS } = await import('../site/js/lab/registry.js');
  const { resolveLine } = await import('../site/js/lab/lines.js');
  const { EXPERIMENT_LINES } = await import('../site/js/catalogue-lines.js');
  assert.deepEqual(EXPERIMENT_LINES.map((e) => e.id), EXPERIMENTS.map((e) => e.id));
  for (const ref of [...allRefs(), 'nothing', 'quadratic/none', 'quadratic/a/b', '', null]) {
    const a = resolveRef(ref), b = resolveLine(ref);
    if (!a) { assert.equal(b, null, String(ref)); continue; }
    assert.deepEqual({ id: b.line.id, mission: b.mission, index: b.index, ref: b.ref, explicit: b.explicit, n: b.line.missions.length, title: b.line.title, short: b.line.short },
      { id: a.experiment.id, mission: a.mission.id, index: a.index, ref: a.ref, explicit: a.explicit, n: a.experiment.missions.length, title: a.experiment.title, short: a.experiment.short }, ref);
  }
});

test('the lab and challenge lines repeat content.js', async () => {
  const { labs, challenges } = await import('../site/js/content.js');
  const { LAB_LINES, CHALLENGE_LINES } = await import('../site/js/catalogue-lines.js');
  assert.deepEqual(LAB_LINES.map((l) => [l.id, !!l.custom, l.title, l.short, l.links]), labs.map((l) => [l.id, !!l.custom, l.title, l.short, l.links]));
  assert.deepEqual(CHALLENGE_LINES.map((c) => [c.id, c.title, c.topic, c.type]), challenges.map((c) => [c.id, c.title, c.topic, c.type]));
  // app.js sends #lab/<id> to the gallery only when <id> is no experiment: no id may be both
  const experiments = new Set(labs.filter((l) => !l.custom).map((l) => l.id));
  assert.deepEqual(labs.filter((l) => l.custom && experiments.has(l.id)).map((l) => l.id), []);
});

test('the companion chapter ids are the chapters of the course library', async () => {
  const { companionChapters } = await import('../dist/js/catalogue-data.js');
  const { resourceCatalog } = await import('../dist/js/resources-data.js');
  assert.deepEqual(companionChapters, resourceCatalog.chapters.map((c) => c.id));
});

test('the generated context of every address is the one the site index gives', async () => {
  const { DISCOVERY_CONTEXT } = await import('../dist/js/discovery-context-data.js');
  const { discoveryIndex, discoveryContext } = await import('../dist/js/discovery.js');
  const { contextBox } = await import('../dist/js/discovery-context.js');
  const { labs, challenges } = await import('../dist/js/content.js');
  const { liveDiscovery, liveCompanionCatalog } = await import('../dist/js/live-curriculum.js');
  const { resourceCatalog } = await import('../dist/js/resources-data.js');
  const index = liveDiscovery(discoveryIndex({ labs, challenges, chapters: liveCompanionCatalog(resourceCatalog).chapters }));
  assert.deepEqual(Object.keys(DISCOVERY_CONTEXT).sort(), index.map((x) => x.route).sort());
  for (const lang of [0, 1]) {
    const t = (pair) => pair[lang];
    for (const item of index) assert.equal(contextBox(DISCOVERY_CONTEXT[item.route], t), discoveryContext(index, item.route, t), item.route);
  }
});

test('the asset versions are split, never lost', async () => {
  const { assetVersions } = await import('../dist/js/asset-versions.js');
  const { annalsVersions, annalsBank } = await import('../dist/js/annals-data.js');
  assert.ok(Object.keys(assetVersions).length > 100 && Object.keys(annalsVersions).length > 100);
  assert.ok(Object.keys(annalsVersions).every((k) => k.startsWith('resources/annals/')));
  assert.ok(Object.keys(assetVersions).every((k) => !k.startsWith('resources/annals/')));
  assert.ok(annalsBank.records.length > 0);
  const catalogue = readFileSync(dist + 'catalogue-data.js', 'utf8');
  assert.doesNotMatch(catalogue, /assetVersions|annalsBank/);
});
