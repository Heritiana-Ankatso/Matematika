#!/usr/bin/env python3
"""Independent check of every computation in the Malagasy T10 chapter 1 (Logique), unit mada-t10-01.

Brute force only: truth tables, equivalences, tautologies, the numerical claims of the exercises and their solutions, the
puzzles (knights and knaves, the broken vase, the four cards), the lamp circuit, and the tables printed in the TeX unit
(read back from content/tex/courses/mada-t10/c01.fr.tex and compared with the computed ones). Exits 1 at the first
disagreement. The JavaScript model of the laboratory is checked against the same facts by tests/logic-truth.test.mjs.

    python3 scripts/check-mada-t10-logic.py
"""
import re, sys
from itertools import product
from math import isqrt
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEX = (ROOT / 'content/tex/courses/mada-t10/c01.fr.tex').read_text(encoding='utf8')
checks = 0


def ok(cond, what):
    global checks
    checks += 1
    if not cond:
        print('FAIL:', what); sys.exit(1)


B = (True, False)
NOT = lambda p: not p
AND = lambda p, q: p and q
OR = lambda p, q: p or q
XOR = lambda p, q: p != q
IMP = lambda p, q: (not p) or q
IFF = lambda p, q: p == q
V = lambda b: 'V' if b else 'F'

# ---- connectors table printed in the unit --------------------------------------------------------------------------
rows = [[c.strip() for c in l.replace('\\\\', '').replace('\\hline', '').split('&')]
        for l in TEX.splitlines() if re.match(r'^[VF] & [VF] & [VF] & [VF] & [VF] & [VF] & [VF] & [VF]', l)]
ok(len(rows) == 4, 'connector table has four rows')
for (p, q), row in zip(product(B, B), rows):
    want = [V(p), V(q), V(NOT(p)), V(AND(p, q)), V(OR(p, q)), V(XOR(p, q)), V(IMP(p, q)), V(IFF(p, q))]
    ok([c.strip() for c in row] == want, f'connector table row {p},{q}: {row} vs {want}')

# ---- equivalences of the Theorem and the De Morgan table ------------------------------------------------------------
eq2 = {
    'non non P': (lambda p, q: NOT(NOT(p)), lambda p, q: p),
    'De Morgan et': (lambda p, q: NOT(AND(p, q)), lambda p, q: OR(NOT(p), NOT(q))),
    'De Morgan ou': (lambda p, q: NOT(OR(p, q)), lambda p, q: AND(NOT(p), NOT(q))),
    'implication = non P ou Q': (IMP, lambda p, q: OR(NOT(p), q)),
    'non implication = P et non Q': (lambda p, q: NOT(IMP(p, q)), lambda p, q: AND(p, NOT(q))),
    'equivalence = deux implications': (IFF, lambda p, q: AND(IMP(p, q), IMP(q, p))),
    'ou exclusif = non equivalence': (XOR, lambda p, q: NOT(IFF(p, q))),
    'contraposee': (IMP, lambda p, q: IMP(NOT(q), NOT(p))),
}
for name, (f, g) in eq2.items():
    ok(all(f(p, q) == g(p, q) for p, q in product(B, B)), name)
ok(not all(IMP(p, q) == IMP(q, p) for p, q in product(B, B)), 'an implication is not its converse')
dm = [[c.strip() for c in l.replace('\\\\', '').replace('\\hline', '').split('&')]
      for l in TEX.splitlines() if re.match(r'^[VF] & [VF] & [VF] & [VF] & [VF] & [VF] & [VF]\s*(\\\\)?\s*$', l)]
ok(len(dm) == 4, 'De Morgan table has four rows')
for (p, q), row in zip(product(B, B), dm):
    want = [V(p), V(q), V(AND(p, q)), V(NOT(AND(p, q))), V(NOT(p)), V(NOT(q)), V(OR(NOT(p), NOT(q)))]
    ok(row == want, f'De Morgan table row {row} vs {want}')

# ---- numbers of the text and of the exercises -----------------------------------------------------------------------
prime = lambda n: n > 1 and all(n % d for d in range(2, isqrt(n) + 1))
ok(not prime(51) and 51 == 3 * 17, '51 = 3 x 17')
ok(not prime(91) and 91 == 7 * 13, '91 = 7 x 13')
ok(prime(2) and not prime(9) and 9 % 2 == 1, 'fluency and implication values')
ok(all(n * n != 50 for n in range(0, 51)) and 7 * 7 < 50 < 8 * 8, 'no integer square is 50')
ok(2 ** 5 == 32, '2^5')
# n^2 + n + 17: first failure n = 16
bad = [n for n in range(0, 100) if not prime(n * n + n + 17)]
ok(bad[0] == 16 and 16 * 16 + 16 + 17 == 289 == 17 * 17 and all(prime(n * n + n + 17) for n in range(16)), 'n^2+n+17 first composite at 16')
ok(all(x * x + 1 > 0 for x in [i / 4 for i in range(-40, 41)]), 'x^2+1>0 sample')
ok(1.5 ** 2 == 2.25 and (-1.5) ** 2 == 2.25, '1,5^2 = 2,25')
ok(all(2 * n + 1 >= 1 for n in range(0, 1000)), 'no n with 2n+1=0')
ok(2.1 ** 2 > 4 and abs(2.1 ** 2 - 4.41) < 1e-12 and 2.1 > 2 and 4.41 <= 5, 'x = 2,1 counterexample')
ok(all(n * n >= n for n in range(0, 1000)), 'n^2 >= n on N')
ok(not all(x * x > x for x in [0, 1, 0.5]) and 2 * 2 > 2, 'x^2 > x fails at 1, holds at 2')
ok(all(x + 1 > x for x in range(-20, 20)) and not any(x + 1 <= x for x in range(-20, 20)), 'x+1 > x')
ok(not any(n + 3 == 1 for n in range(0, 100)) and (-2) + 3 == 1, 'n+3=1 needs n=-2')
ok(not any(n * n != 2 * n for n in (0, 2)) and any(n * n == 2 * n for n in range(0, 10)) and not all(n * n != 2 * n for n in range(10)), 'n^2=2n at 0 and 2')
# kite with perpendicular diagonals, not a rhombus
A, Bp, C, D = (0, 2), (1, 0), (0, -1), (-1, 0)
d = lambda u, v: ((u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2)
ok(d(A, Bp) == 5 and d(Bp, C) == 2, 'kite sides sqrt5 and sqrt2')
ok((C[0] - A[0]) * (D[0] - Bp[0]) + (C[1] - A[1]) * (D[1] - Bp[1]) == 0, 'kite diagonals perpendicular')
ok(all((n % 6 == 0) == (n % 2 == 0 and n % 3 == 0) for n in range(-200, 200)), '6 | n iff 2 | n and 3 | n')
ok(all(n % 12 != 0 or n % 6 == 0 for n in range(-200, 200)) and 18 % 6 == 0 and 18 % 12 != 0, '12 | n => 6 | n, converse fails at 18')
ok(all(x * x > 9 for x in (3.5, 4, 10)) and (-4) ** 2 > 9 and not (-4 > 3), 'x>3 => x^2>9, converse fails at -4')
ok(2 ** 2 == (-2) ** 2 and 2 != -2, 'a^2 = b^2 does not give a = b')
ok(all(n % 4 != 0 or n % 2 == 0 for n in range(-100, 100)) and 6 % 2 == 0 and 6 % 4 != 0, '4 | n => even, not conversely')
ok(all((x * x == 16) == (x in (4, -4)) for x in range(-10, 11)), 'x^2=16 iff x=+-4')
ok(2 * (2 - 2) == 0 and 0 * (0 - 2) == 0 and 0 != 2, 'x(x-2)=0 holds at 0')
# truth values of the implications of the exercise "Valeur de verite d'une implication"
ok([IMP(9 % 2 == 1, prime(9)), IMP(8 % 2 == 1, prime(8)), IMP(10 % 5 == 0, 10 % 2 == 0), IMP(2 + 2 == 5, 3 % 2 == 0), IFF(3 % 2 == 1, 4 % 2 == 0)] == [False, True, True, True, True], 'five implication values')
# connectors on n in {6,7,9,10}
want = {6: (True, True, False), 7: (False, False, False), 9: (False, True, True), 10: (False, True, True)}
for n, (a, o, x) in want.items():
    P, Q = n % 2 == 0, n % 3 == 0
    ok((AND(P, Q), OR(P, Q), XOR(P, Q)) == (a, o, x), f'connectors for n={n}')
# negations of the exercise
ok(not (7 <= 5) and 7 > 5 and (-2 < 0) and not (-2 >= 0), 'simple negations (1)')
ok(15 % 4 == 3 and 15 % 4 != 0, '15 is not a multiple of 4')
sides = sorted((3, 4, 5)); ok(len(set(sides)) == 3, 'triangle 3 4 5 is scalene')
# De Morgan in practice, x = -3, 0, 5
f = lambda x: -1 < x <= 4; g = lambda x: x <= -1 or x > 4
ok(all(f(x) == (not g(x)) for x in (-3, 0, 5)) and [f(-3), f(0), f(5)] == [False, True, False], '-1<x<=4 and its negation')
ok(all((not (x >= 2 and x < 7)) == (x < 2 or x >= 7) for x in range(-20, 30)), 'negation of x>=2 and x<7')
ok(all((not (n % 2 == 0 or n % 5 == 0)) == (n % 2 == 1 and n % 5 != 0) for n in range(-50, 50)), 'negation of even or multiple of 5')
# tautologies
cls = {
    'P ou non P': (lambda p, q: OR(p, NOT(p)), 'T'), 'P et non P': (lambda p, q: AND(p, NOT(p)), 'C'),
    '(P et Q) => P': (lambda p, q: IMP(AND(p, q), p), 'T'), 'P => (P ou Q)': (lambda p, q: IMP(p, OR(p, q)), 'T'),
    'P <=> non P': (lambda p, q: IFF(p, NOT(p)), 'C'), '((P=>Q)=>P)': (lambda p, q: IMP(IMP(p, q), p), 'N'),
}
for name, (fn, want) in cls.items():
    vals = [fn(p, q) for p, q in product(B, B)]
    got = 'T' if all(vals) else 'C' if not any(vals) else 'N'
    ok(got == want, name)
ok(all(((IMP(p, q) and IMP(q, r)) <= IMP(p, r)) for p, q, r in product(B, B, B)), 'transitivity is a tautology')
ok(all(IMP(NOT(p), IMP(p, q)) for p, q in product(B, B)), 'not P => (P => Q) is a tautology')
tri = {(p, q, r): (AND(IMP(p, q), IMP(q, r)), IMP(p, r)) for p, q, r in product(B, B, B)}
ok([tri[k][0] for k in product(B, B, B)] == [True, False, False, False, True, False, True, True], 'column A of the three-variable table')
ok([tri[k][1] for k in product(B, B, B)] == [True, False, True, False, True, True, True, True], 'column B of the three-variable table')
ok(sorted(k for k, (a, b) in tri.items() if a != b) == [(False, True, False), (True, False, True)], 'A and B differ exactly on lines 3 and 6')
# counterexamples
ok((1 + 1) ** 2 > 1 and not ((-1 + 1) ** 2 > (-1) ** 2), '(x+1)^2 > x^2 fails at -1')
ok(not (2 ** 2 > 2 ** 2) and not (2 ** 3 > 3 ** 2) and not (2 ** 4 > 4 ** 2) and all(2 ** n > n * n for n in range(5, 60)), '2^n > n^2 first holds from 5')
ok(9 - 15 + 6 == 0 and 4 - 10 + 6 == 0, 'x^2-5x+6 = 0 for x = 2 and 3')
ok(all((x - 2) * (x - 3) == x * x - 5 * x + 6 for x in range(-10, 10)), 'factorisation')
ok(not (12 % 24 == 0) and 12 % 4 == 0 and 12 % 6 == 0 and all(n % 24 == 0 for n in range(1, 500) if n % 4 == 0 and n % 6 == 0 and n % 24 == 0), '12 is a counterexample to 4 and 6 => 24')
ok(all(IMP(n % 2 == 0, (n * n) % 2 == 0) for n in range(-100, 100)), 'even => square even')
# conditions nécessaires et suffisantes
ok(all(n % 5 == 0 for n in range(-100, 100) if n % 10 == 0) and 15 % 5 == 0 and 15 % 10 != 0, 'multiple of 10 is sufficient, not necessary, for multiple of 5')
ok(3 * 3 == 9 and (-3) ** 2 == 9, 'x=3 sufficient not necessary')
ok(2 % 2 == 0 and prime(2) and 9 % 2 == 1 and not prime(9), 'prime / odd: neither')
# croissante
ok(all(((-2) ** 2 > (-1) ** 2) for _ in [0]) and -2 < -1, 'x^2 is not increasing: -2 < -1 and 4 > 1')
ok(all((2 * x + 1) <= (2 * y + 1) for x in range(-20, 20) for y in range(x + 1, 21)), '2x+1 increasing (sample)')
# beyond
ok(all(IMP((3 * n + 2) % 2 == 1, n % 2 == 1) for n in range(-100, 100)) and all((3 * (2 * k) + 2) == 2 * (3 * k + 1) for k in range(-50, 50)), '3n+2 odd => n odd, contrapositive identity')
ok(not any(4 * x + 6 * y == 15 for x in range(-100, 100) for y in range(-100, 100)), '4x+6y=15 has no integer solution (finite check, parity proof in the text)')
ok(sorted({(n * n) % 3 for n in range(0, 300)}) == [0, 1] and all((n * n) % 3 == 0 for n in range(300) if n % 3 == 0) and all((n * n) % 3 == 1 for n in range(300) if n % 3 != 0), 'squares mod 3')
ok(all((3 * k + 1) ** 2 == 3 * (3 * k * k + 2 * k) + 1 and (3 * k + 2) ** 2 == 3 * (3 * k * k + 4 * k + 1) + 1 for k in range(-50, 50)), 'square identities mod 3')
ok(all(a * a != 3 * b * b for a in range(1, 600) for b in range(1, 400)), 'a^2 = 3 b^2 has no solution in a finite range')

# ---- the lamp ---------------------------------------------------------------------------------------------------------
ok([XOR(p, q) for p, q in product(B, B)] == [False, True, True, False], 'stair lamp table')
three = [XOR(XOR(p, q), r) for p, q, r in product(B, B, B)]
ok(sum(three) == 4 and all(three[i] != three[i ^ b] for i in range(8) for b in (1, 2, 4)), 'three switches: 4 of 8 lines, flipping one switch flips the lamp')
ok(all(XOR(XOR(p, q), r) == XOR(p, XOR(q, r)) for p, q, r in product(B, B, B)), 'xor is associative')

# ---- knights and knaves (True = chevalier) ------------------------------------------------------------------------------
def says(speaker_knight, statement_true):   # a knight's statement is true, a knave's is false
    return statement_true == speaker_knight
sol1 = [(a, b) for a, b in product(B, B) if says(a, (not a) and (not b))]
ok(sol1 == [(False, True)], f'A says both knaves: {sol1}')
sol2 = [(c, d) for c, d in product(B, B) if says(c, d) and says(d, c != d)]
ok(sol2 == [(False, False)], f'C says D knight, D says different: {sol2}')

# ---- the broken vase ----------------------------------------------------------------------------------------------------
S = [lambda c: c == 'B', lambda c: c != 'B', lambda c: c in ('A', 'D'), lambda c: c not in ('A', 'B')]
who = {c: sum(s(c) for s in S) for c in 'ABCD'}
ok(who == {'A': 2, 'B': 1, 'C': 2, 'D': 3}, f'vase counts {who}')
ok([c for c in 'ABCD' if who[c] == 1] == ['B'], 'the vase: only Bema')

# ---- the four cards -------------------------------------------------------------------------------------------------------
vowel = lambda x: x in 'AEIOU'
cards = ['E', 'K', 4, 7]
other = {'E': [2, 3], 'K': [2, 3], 4: ['E', 'K'], 7: ['E', 'K']}   # what the hidden side may be (parity or letter)
def violates(visible, hidden):
    letter, num = (visible, hidden) if isinstance(visible, str) else (hidden, visible)
    letter_is_vowel = vowel(letter)
    num_is_even = (num % 2 == 0) if isinstance(num, int) else None
    return letter_is_vowel and not num_is_even
must = [c for c in cards if any(violates(c, h) for h in other[c])]
ok(must == ['E', 7], f'cards to turn: {must}')

print(f'check-mada-t10-logic: {checks} checks passed')
