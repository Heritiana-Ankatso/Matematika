// Loading budget of six representative pages (npm run test:budget; needs a built dist/ and Playwright's Chromium).
// Serves dist/ over HTTP/2 with gzip, as GitHub Pages does, opens each page in a fresh context (no cache, no service
// worker) and counts what it fetched: requests, JavaScript requests, transferred bytes with and without fonts. Fails
// when a page goes above its budget in tests/budgets.json (docs/REBUILD_PLAN.md, stages 0 and 1).
//   node tests/budget_browser.mjs            counts only (CI)
//   node tests/budget_browser.mjs --timings  also loads every page under "Slow 4G" and CPU x4, prints the timings
//   node tests/budget_browser.mjs --json     prints the measurements as JSON (to update the budgets)
import http2 from 'node:http2';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const budgets = JSON.parse(readFileSync(fileURLToPath(new URL('./budgets.json', import.meta.url)), 'utf8'));
const TIMINGS = process.argv.includes('--timings');
const JSON_OUT = process.argv.includes('--json');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.json': 'application/json; charset=utf-8', '.pdf': 'application/pdf', '.woff2': 'font/woff2' };
const COMPRESSIBLE = new Set(['.html', '.js', '.mjs', '.css', '.svg', '.json']);

/* ---------------------------------------------------------------- the pages: read from the generated data */
const { discoveryChapters } = await import('../dist/js/catalogue-data.js');
const { isLiveHash } = await import('../dist/js/live-curriculum.js');
const { labs } = await import('../dist/js/content.js');
const university = JSON.parse(readFileSync(dist + 'resources/university/index.json', 'utf8'));
const chapter = discoveryChapters.find(c => isLiveHash('#chapter/' + c.id));
const exhibit = labs.find(l => l.custom && isLiveHash('#gallery/' + l.id));
const lesson = university.sections.flatMap(s => s.sequences).find(q => q.edition === 'lesson') || university.sections[0].sequences[0];
assert.ok(chapter && exhibit && lesson, 'a chapter, an exhibit and a university lesson exist in the generated data');
const PAGES = {
  home: '#home',
  chapter: '#chapter/' + chapter.id,
  university: '#university/' + lesson.id,
  lab: '#lab',
  gallery: '#gallery/' + exhibit.id,
  olympiad: '#olympiad',
};

/* ---------------------------------------------------------------- the server: HTTP/2, gzip, byte counter */
const certDir = mkdtempSync(path.join(tmpdir(), 'mx-budget-'));
execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=localhost',
  '-keyout', certDir + '/key.pem', '-out', certDir + '/cert.pem'], { stdio: 'ignore' });
const gz = new Map();
let log = [];
const server = http2.createSecureServer({ key: readFileSync(certDir + '/key.pem'), cert: readFileSync(certDir + '/cert.pem'), allowHTTP1: true }, (req, res) => {
  let name = decodeURIComponent(new URL(req.url, 'https://localhost').pathname).slice(1);
  if (name === '' || name.endsWith('/')) name += 'index.html';
  const target = path.resolve(dist, name);
  let data;
  try { if (!target.startsWith(dist) || !statSync(target).isFile()) throw 0; data = readFileSync(target); }
  catch { res.writeHead(404); res.end(); return; }
  const ext = path.extname(target).toLowerCase();
  const head = { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-store' };
  if (COMPRESSIBLE.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) {
    if (!gz.has(target)) gz.set(target, zlib.gzipSync(data, { level: 6 }));
    data = gz.get(target);
    head['content-encoding'] = 'gzip';
  }
  log.push({ name, ext, bytes: data.length });
  res.writeHead(200, head);
  res.end(data);
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const origin = `https://localhost:${server.address().port}/`;

/* ---------------------------------------------------------------- the browser */
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = createRequire('/opt/node-tools/node_modules/')('playwright')); }
const browser = await chromium.launch();

// Chrome DevTools "Slow 4G" (the same numbers as its preset, adjusted as DevTools does) and a CPU four times slower.
const SLOW_4G = { offline: false, latency: 150 * 3.75, downloadThroughput: 1.6 * 1e6 / 8 * 0.9, uploadThroughput: 750 * 1e3 / 8 * 0.9 };

async function measure(hash, throttled) {
  const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block', viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  if (throttled) {
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', SLOW_4G);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  }
  log = [];
  await page.goto(origin + hash, { waitUntil: 'load', timeout: 300_000 });
  // Content is on screen: the app has drawn a heading in the page (time taken in the page, from navigation start).
  const content = await page.waitForFunction(() => document.querySelector('#app h1, #app h2') && Math.round(performance.now()),
    null, { timeout: 120_000, polling: 50 }).then(h => h.jsonValue()).catch(() => null);
  await page.waitForLoadState('networkidle', { timeout: 300_000 });
  const paint = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const fcp = performance.getEntriesByName('first-contentful-paint')[0];
    const last = Math.max(nav.loadEventEnd, ...performance.getEntriesByType('resource').map(r => r.responseEnd));
    return { fcp: fcp ? Math.round(fcp.startTime) : null, load: Math.round(nav.loadEventEnd), settled: Math.round(last) };
  });
  paint.content = content;
  await context.close();
  const sum = list => list.reduce((s, r) => s + r.bytes, 0);
  const fonts = log.filter(r => r.ext === '.woff2');
  return {
    requests: log.length,
    js: log.filter(r => r.ext === '.js' || r.ext === '.mjs').length,
    kb: Math.round(sum(log) / 1024),
    kbNoFonts: Math.round((sum(log) - sum(fonts)) / 1024),
    ...(throttled ? paint : {}),
    errors,
  };
}

const results = {};
const failures = [];
for (const [key, hash] of Object.entries(PAGES)) {
  const m = await measure(hash, false);
  if (TIMINGS) Object.assign(m, Object.fromEntries(Object.entries(await measure(hash, true)).filter(([k]) => ['fcp', 'content', 'load', 'settled'].includes(k))));
  results[key] = { hash, ...m };
  if (m.errors.length) failures.push(`${key} (${hash}): page error ${m.errors[0]}`);
  const b = budgets.pages[key];
  if (!b) { failures.push(`${key}: no budget in tests/budgets.json`); continue; }
  for (const metric of ['requests', 'js', 'kbNoFonts']) {
    if (b[metric] != null && m[metric] > b[metric]) failures.push(`${key} (${hash}): ${metric} ${m[metric]} > budget ${b[metric]}`);
  }
}
await browser.close();
server.close();

if (JSON_OUT) console.log(JSON.stringify(results, null, 2));
else {
  const cols = ['requests', 'js', 'kb', 'kbNoFonts', ...(TIMINGS ? ['fcp', 'content', 'load', 'settled'] : [])];
  console.log(['page', 'route', ...cols].join('\t'));
  for (const [key, r] of Object.entries(results)) console.log([key, r.hash, ...cols.map(c => r[c])].join('\t'));
}
if (failures.length) { console.error('Budget exceeded:\n  ' + failures.join('\n  ')); process.exit(1); }
console.log('Loading budgets respected.');
