// Design v8 is on by default (docs/REBUILD_PLAN.md stage 8); ?v8=off brings back the previous look on the device
// (remembered), ?v8 turns v8 on again; with storage blocked the address alone decides.
import test from 'node:test';
import assert from 'node:assert/strict';
import { decide } from '../site/js/v8.js';

const store = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; };

test('on by default, off when asked and remembered, on again with ?v8', () => {
  const s = store();
  assert.equal(decide('', s), true);
  assert.equal(decide('?v8=off', s), false);
  assert.equal(decide('', s), false, 'remembered');
  assert.equal(decide('?v8', s), true);
  assert.equal(decide('', s), true);
  assert.equal(decide('?v8=0', s), false);
});

test('storage blocked: the address alone decides', () => {
  const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  assert.equal(decide('', blocked), true);
  assert.equal(decide('?v8=off', blocked), false);
});
