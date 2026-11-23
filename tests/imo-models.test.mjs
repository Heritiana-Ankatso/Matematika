// The models behind the interactive figures of the IMO papers (site/js/imo-models.js), checked on cases worked by hand.
import test from 'node:test';
import assert from 'node:assert/strict';
import { boardMove, boardFinished, boardRandomPlay, sharedSequence, divisorOrbit, threeLargestSum, lineThrough, isSunny, linesReport, requiredPoints, canAddTile, tilesReport } from '../site/js/imo-models.js';

test('IMO 2026 P1: a move writes gcd and lcm/gcd; entries equal to 1 cannot be chosen', () => {
  assert.deepEqual(boardMove([4, 6, 5], 0, 1), [2, 6, 5]);   // gcd 2, lcm 12 / 2 = 6
  assert.deepEqual(boardMove([2, 3], 0, 1), [1, 6]);
  assert.equal(boardMove([1, 6], 0, 1), null);
  assert.equal(boardMove([4, 6], 0, 0), null);
  assert.ok(boardFinished([1, 6, 1]) && !boardFinished([2, 3]));
});
test('IMO 2026 P1: random play always ends with one entry above 1, and its value does not depend on the moves (60 boards, 5 plays each)', () => {
  let seed = 7; const rng = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let k = 0; k < 60; k++) {
    const board = Array.from({ length: 2 + (k % 6) }, () => 2 + Math.floor(rng() * 40));
    const finals = new Set();
    for (let r = 0; r < 5; r++) {
      const p = boardRandomPlay(board, rng); assert.ok(p.finished, board.join());
      assert.equal(p.board.filter((x) => x > 1).length, 1, board.join()); finals.add(p.board.find((x) => x > 1));
    }
    assert.equal(finals.size, 1, `M depends on the play for ${board.join()}`);
  }
});
test('IMO 2026 P6: the sequence from a1 = 2 and 6 follows the rule', () => {
  assert.deepEqual(sharedSequence(2, 5), [2, 4, 6, 8, 10]);
  assert.deepEqual(sharedSequence(6, 4), [6, 8, 10, 12]);   // 7 and 9 share no factor with 6... 8 does, then 10: gcd(10,8)=2, gcd(10,6)=2
  assert.deepEqual(sharedSequence(1, 3), []);
});
test('IMO 2025 P4: three largest proper divisors, fixed point 6, orbit of 72, a stop at a prime', () => {
  assert.equal(threeLargestSum(12), 6 + 4 + 3);
  assert.equal(threeLargestSum(6), 6);             // proper divisors 1, 2, 3
  assert.equal(threeLargestSum(5), null);          // only one proper divisor
  assert.deepEqual(divisorOrbit(72), { terms: [72, 78], status: 'constant' });   // 36 + 24 + 18 = 78, then 39 + 26 + 13 = 78
  assert.deepEqual(divisorOrbit(12), { terms: [12, 13], status: 'stops' });      // 13 is prime
});
test('IMO 2025 P1: lines through lattice points, sunny or not', () => {
  assert.ok(!isSunny(lineThrough([1, 1], [5, 1])));    // horizontal
  assert.ok(!isSunny(lineThrough([2, 1], [2, 4])));    // vertical
  assert.ok(!isSunny(lineThrough([1, 3], [3, 1])));    // parallel to x + y = 0
  assert.ok(isSunny(lineThrough([1, 1], [2, 3])));
  assert.equal(lineThrough([1, 1], [1, 1]), null);
  assert.deepEqual(lineThrough([1, 3], [2, 1]), lineThrough([2, 1], [1, 3]));
  assert.equal(requiredPoints(3).length, 6);            // (1,1) (1,2) (1,3) (2,1) (2,2) (3,1)
});
test('IMO 2025 P1: three lines covering the six points of n = 3 with 0, 1 and 3 sunny lines are accepted', () => {
  const L = (p, q) => lineThrough(p, q);
  const horizontal = [L([1, 1], [3, 1]), L([1, 2], [2, 2]), L([1, 3], [2, 3])];
  assert.deepEqual([linesReport(3, horizontal).ok, linesReport(3, horizontal).sunny], [true, 0]);
  const one = [L([1, 1], [3, 1]), L([1, 2], [2, 2]), L([1, 3], [2, 4])];
  assert.deepEqual([linesReport(3, one).ok, linesReport(3, one).sunny], [true, 1]);
  const three = [L([1, 1], [2, 2]), L([1, 2], [3, 1]), L([2, 1], [1, 3])];
  const r = linesReport(3, three); assert.deepEqual([r.ok, r.sunny], [true, 3]);
  assert.ok(!linesReport(3, horizontal.slice(0, 2)).ok);
});
test('IMO 2025 P6: tiles on a 4 by 4 grid, each row and column keeps exactly one free square', () => {
  assert.ok(canAddTile(4, [], { r0: 0, c0: 0, r1: 1, c1: 1 }));
  assert.ok(!canAddTile(4, [{ r0: 0, c0: 0, r1: 1, c1: 1 }], { r0: 1, c0: 1, r1: 2, c1: 2 }));
  assert.ok(!canAddTile(4, [], { r0: 0, c0: 0, r1: 4, c1: 0 }));
  // free squares on the diagonal; tiles above and below it
  const tiles = [{ r0: 0, c0: 1, r1: 0, c1: 3 }, { r0: 1, c0: 2, r1: 1, c1: 3 }, { r0: 2, c0: 3, r1: 2, c1: 3 },
    { r0: 1, c0: 0, r1: 3, c1: 0 }, { r0: 2, c0: 1, r1: 3, c1: 1 }, { r0: 3, c0: 2, r1: 3, c1: 2 }];
  const rep = tilesReport(4, tiles); assert.ok(rep.ok); assert.equal(rep.count, 6); assert.deepEqual(rep.free, [[0, 0], [1, 1], [2, 2], [3, 3]]);
  assert.ok(!tilesReport(4, tiles.slice(1)).ok);
});
