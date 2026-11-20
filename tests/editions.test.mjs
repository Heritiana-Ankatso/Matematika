import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { EDITION_ID, FULL_EDITION } from '../site/js/edition-scope.js';
import * as live from '../site/js/live-curriculum.js';

const scope = id => JSON.parse(readFileSync(new URL(`../editions/${id}/scope.json`, import.meta.url), 'utf8'));
const ids = readdirSync(new URL('../editions/', import.meta.url));

test('every edition has a scope file whose id is its folder', () => {
  assert.deepEqual(ids.sort(), ['explorer', 'matematika']);
  for (const id of ids) { const s = scope(id); assert.equal(s.id, id); assert.equal(typeof s.full, 'boolean'); }
});

test('the source copy of edition-scope.js is the home edition, and live-curriculum follows it', () => {
  assert.equal(EDITION_ID, 'matematika');
  assert.equal(FULL_EDITION, scope('matematika').full);
  assert.equal(live.FULL_EDITION, FULL_EDITION);
  assert.equal(scope('explorer').full, false);
});
