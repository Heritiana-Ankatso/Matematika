// Design v8, stage 2: every text colour of every world is readable on its grounds (WCAG 2.1 contrast, read from the
// tokens of styles/tokens.css), the fonts named by the worlds are self-hosted with their licence, and the v8 rules stay
// inert without `data-world` (the current look is untouched).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const css = readFileSync(new URL('../site/styles/tokens.css', import.meta.url), 'utf8');
const worlds = Object.fromEntries([...css.matchAll(/:root\[data-world="(\w+)"\][^{]*\{([^}]*)\}/g)].map(([, id, body]) =>
  [id, Object.fromEntries([...body.matchAll(/--(w-[\w-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim()]))]));

const rgb = (hex) => { const h = hex.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); };
const lum = (hex) => { const [r, g, b] = rgb(hex).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('the five grounds of docs/DESIGN_V8.md are defined', () => {
  assert.deepEqual(Object.keys(worlds).sort(), ['home', 'lycee', 'musee', 'olymp', 'univ']);
  // values of DESIGN_V8.md section 3
  assert.equal(worlds.musee['w-bg'], '#121826'); assert.equal(worlds.musee['w-accent'], '#d9b25f');
  assert.equal(worlds.univ['w-bg'], '#04050b'); assert.equal(worlds.univ['w-accent'], '#a594ff'); assert.equal(worlds.univ['w-accent2'], '#62e3ea');
  assert.equal(worlds.lycee['w-ink'], '#1b3796'); assert.equal(worlds.lycee['w-accent'], '#d22f45'); assert.equal(worlds.lycee['w-accent2'], '#16804f');
  assert.equal(worlds.olymp['w-bg'], '#0a0b0d'); assert.equal(worlds.olymp['w-accent'], '#ff3b30');
  assert.match(worlds.lycee['w-text'], /^"Caveat"/); assert.match(worlds.lycee['w-head'], /^"Playwrite FR Moderne"/);
});

test('every text colour of every world reaches 4.5:1 on its ground and its panels', () => {
  for (const [id, w] of Object.entries(worlds)) {
    for (const fg of ['w-ink', 'w-muted', 'w-accent', 'w-accent2', 'w-warn']) for (const bg of ['w-bg', 'w-surface', 'w-raise']) {
      const r = ratio(w[fg], w[bg]);
      assert.ok(r >= 4.5, `${id}: ${fg} ${w[fg]} on ${bg} ${w[bg]} is ${r.toFixed(2)}:1`);
    }
    const r = ratio(w['w-accent-ink'], w['w-accent']);
    assert.ok(r >= 4.5, `${id}: text on the accent is ${r.toFixed(2)}:1`);
  }
});

test('every face is self-hosted with its licence, and only v8 rules use the v8 tokens', () => {
  const faces = [...css.matchAll(/url\(\.\.\/(fonts\/v8\/[\w.-]+)\)/g)].map((m) => m[1]);
  assert.ok(faces.length >= 25);
  for (const f of faces) assert.ok(existsSync(new URL('../site/' + f, import.meta.url)), f);
  const licences = readdirSync(new URL('../site/fonts/v8/', import.meta.url)).filter((f) => f.startsWith('LICENSE-'));
  for (const family of ['newsreader', 'literata', 'instrument-sans', 'instrument-serif', 'ibm-plex-sans', 'ibm-plex-mono', 'playwrite-fr-moderne', 'caveat', 'jetbrains-mono']) {
    assert.ok(licences.includes(`LICENSE-${family}.txt`), family);
    assert.match(readFileSync(new URL(`../site/fonts/v8/LICENSE-${family}.txt`, import.meta.url), 'utf8'), /SIL Open Font License/);
  }
  for (const file of ['controls.css', 'world-home.css', 'world-musee.css', 'world-univ.css', 'world-lycee.css', 'world-olymp.css']) {
    const text = readFileSync(new URL('../site/styles/' + file, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    // a rule that reads a --w-* token is scoped to a world, to the .v8 frame or to a v8 class
    for (const [, selector, body] of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/var\(--w-/.test(body) || /@keyframes|from|to/.test(selector.trim().split(/\s/)[0])) continue;
      assert.ok(/data-world|\.v8/.test(selector), `${file}: "${selector.trim()}" uses v8 tokens without a v8 scope`);
    }
  }
});
