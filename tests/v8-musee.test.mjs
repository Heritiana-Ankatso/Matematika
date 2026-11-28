// Design v8, stage 3: the Musée and the threshold name only what exists. Every entry of museum-data.js resolves in the
// generated world-lines.js, the lines and counts equal the sources, every address is live, the exhibit of the day is
// deterministic, and the pages render under jsdom in both languages with French typography.
import test from 'node:test';
import assert from 'node:assert/strict';

const { COLLECTIONS, OLYMPIAD_LEVELS } = await import('../site/js/world-lines.js');
const { ROOMS, UNEXPECTED, HREF, exhibitOfTheDay, dayNumber } = await import('../site/js/museum-data.js');

test('the lines repeat the sources (titles and counts are never typed)', async () => {
  const { labs } = await import('../site/js/content.js');
  const { challengeBase } = await import('../site/js/challenges/registry.js');
  const { ENTRIES } = await import('../site/js/intuition-data.js');
  const { FRACTALS } = await import('../site/js/fractals-data.js');
  const { ERRORS } = await import('../site/js/errors-data.js');
  const { PEOPLE, ADVANCES } = await import('../site/js/history-data.js');
  const { BIOGRAPHIES, STORIES } = await import('../site/js/reading-content.js');
  const { STRATEGIES } = await import('../site/js/olympiad-content.js');
  const counts = Object.fromEntries(Object.entries(COLLECTIONS).map(([k, v]) => [k, v.length]));
  assert.deepEqual(counts, { curiosities: labs.filter((l) => l.custom).length, intuition: ENTRIES.length, fractals: FRACTALS.length, lab: labs.filter((l) => !l.custom).length,
    challenges: challengeBase.length, people: PEOPLE.length, advances: ADVANCES.length, stories: STORIES.length, biographies: BIOGRAPHIES.length, errors: ERRORS.length });
  assert.deepEqual(COLLECTIONS.curiosities.map((x) => x.title), labs.filter((l) => l.custom).map((l) => l.title));
  assert.deepEqual(OLYMPIAD_LEVELS, STRATEGIES.flatMap((s) => s.problems.map((p) => p.level)));
  for (const list of Object.values(COLLECTIONS)) assert.equal(new Set(list.map((x) => x.id)).size, list.length, 'ids are unique');
});

test('every curated entry exists and every address is live', async () => {
  const { isLiveHash } = await import('../dist/js/live-curriculum.js');
  assert.equal(ROOMS.length, 8);
  for (const room of ROOMS) {
    assert.ok(isLiveHash(room.hash), room.hash);
    for (const [c] of room.count) assert.ok(COLLECTIONS[c], c);
    assert.ok(room.picks.length >= 4);
    for (const [c, id] of room.picks) {
      const x = COLLECTIONS[c].find((y) => y.id === id);
      assert.ok(x, `${room.id}: ${c}/${id}`);
      assert.ok(isLiveHash(HREF[c](x)), HREF[c](x));
    }
    for (const pair of [room.name, room.promise]) assert.ok(pair[0] && pair[1] && pair[0] !== pair[1] || room.name === pair);
  }
  for (const u of UNEXPECTED) assert.ok(COLLECTIONS.curiosities.some((x) => x.id === u.id), u.id);
});

test('the exhibit of the day is the same all day and changes the next day', () => {
  const list = COLLECTIONS.curiosities;
  const a = exhibitOfTheDay(list, new Date(2026, 10, 22, 0, 5)), b = exhibitOfTheDay(list, new Date(2026, 10, 22, 23, 55)), c = exhibitOfTheDay(list, new Date(2026, 10, 23, 9));
  assert.equal(a.id, b.id); assert.notEqual(a.id, c.id);
  assert.equal(dayNumber(new Date(2026, 10, 23)) - dayNumber(new Date(2026, 10, 22)), 1);
});

test('the hall and the threshold render in both languages, with counts from the sources', async () => {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>');
  Object.assign(globalThis, { window: dom.window, document: dom.window.document });
  const { museePage, roomCount } = await import('../site/js/v8/musee.js');
  const { thresholdPage } = await import('../site/js/v8/threshold.js');
  for (const lang of ['fr', 'en']) {
    const t = (p) => p[lang === 'fr' ? 0 : 1];
    document.body.innerHTML = museePage({ t, lang, siteName: 'Matematika', date: new Date(2026, 10, 22) });
    assert.equal(document.querySelectorAll('details.v8-room').length, 8);
    assert.equal(document.querySelectorAll('details.v8-room[open]').length, 0, 'the rooms are folded');
    assert.equal(document.querySelectorAll('.v8-uq').length, UNEXPECTED.length);
    assert.match(document.querySelector('[data-room="curiosites"] .v8-room-count').textContent, new RegExp(`^${COLLECTIONS.curiosities.length} `));
    assert.equal(document.querySelector('[data-room="chronologies"] .v8-room-count').textContent, roomCount(ROOMS[5], lang));
    document.body.innerHTML = thresholdPage({ t, lang, siteName: 'Matematika' });
    assert.equal(document.querySelectorAll('a.v8-door').length, 4);
    assert.doesNotMatch(document.querySelector('[data-door="olymp"]').textContent, new RegExp(`\\b${OLYMPIAD_LEVELS.length}\\b`)); // owner rule: no problem count
  }
  // French typography: a narrow no-break space before ? in French, none added in English
  document.body.innerHTML = museePage({ t: (p) => p[0], lang: 'fr', siteName: 'M' });
  assert.ok(/ \?/.test(document.body.textContent) && !/ \?/.test(document.body.textContent));
  document.body.innerHTML = museePage({ t: (p) => p[1], lang: 'en', siteName: 'M' });
  assert.ok(!/ /.test(document.body.textContent));
});
