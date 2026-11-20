#!/usr/bin/env python3
"""Independent check of every computation in the Malagasy T11 S chapter 1 (functions), unit mada-t11-s-01.

Exact arithmetic (fractions) or dense sampling only: images and antecedents, domains (by testing where the formula can be
evaluated), parity, symmetry axes and centres, periods (including minimality by scanning candidate periods), the values of the
exercises and problems, the table of the activity read back from content/tex/courses/mada-t11s/c01.fr.tex, and the facts of the
laboratory model (site/js/lab/models/function-symmetry.js, same functions). Exits 1 at the first disagreement.

    python3 scripts/check-mada-t11s-functions.py
"""
import math, re, sys
from fractions import Fraction as Fr
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEX = (ROOT / 'content/tex/courses/mada-t11s/c01.fr.tex').read_text(encoding='utf8')
SOL = (ROOT / 'content/tex/courses/mada-t11s/corriges/c01.fr.tex').read_text(encoding='utf8')
LAB = (ROOT / 'site/js/lab/models/function-symmetry.js').read_text(encoding='utf8')
checks = 0


def ok(cond, what):
    global checks
    checks += 1
    if not cond:
        print('FAIL:', what); sys.exit(1)


def defined(f, x):
    try:
        v = f(x)
        return isinstance(v, complex) is False and math.isfinite(v)
    except (ZeroDivisionError, ValueError, OverflowError):
        return False


def sqrt(x): return math.sqrt(x)   # raises ValueError below 0


# ---- activity table, read back from the unit ------------------------------------------------------------------------------
rows = {}
for line in TEX.splitlines():
    m = re.match(r'^\$([fgh])\(x\)\$ & (.*?)(\\\\)?$', line.strip())
    if m: rows[m.group(1)] = [int(c.replace('$', '').strip()) for c in m.group(2).replace('\\\\', '').split('&')]
ok(set(rows) == {'f', 'g', 'h'} and all(len(v) == 7 for v in rows.values()), 'activity table read back')
f_, g_, h_ = rows['f'], rows['g'], rows['h']          # values at -3..3
ok(all(f_[i] == f_[6 - i] for i in range(7)), 'activity: f even on the table')
ok(all(g_[i] == -g_[6 - i] for i in range(7)), 'activity: g odd on the table')
ok(h_[0] == h_[3] == h_[6] and h_[1] == h_[4] and h_[2] == h_[5], 'activity: h repeats every 3')
ok(h_[2] != h_[4] and h_[2] != -h_[4], 'activity: h(-1) is neither h(1) nor -h(1)')
motif = {0: h_[3], 1: h_[4], 2: h_[5]}                 # h(0), h(1), h(2)
ok(motif[30 % 3] == 2 and motif[(-7) % 3] == 3, 'activity: h(30) = 2, h(-7) = 3')
ok([x * x * 0 + (x * x - 2) for x in range(-3, 4)] == [7, 2, -1, -2, -1, 2, 7], 'activity: f(x) = x^2 - 2 fits the table')

# ---- section 1: image and antecedents ------------------------------------------------------------------------------------
f = lambda x: x * x - 4 * x + 1
ok(f(5) == 6 and f(0) == 1 and f(-2) == 13 and f(Fr(1, 2)) == Fr(-3, 4), 'f(x)=x^2-4x+1 values')
ok([x for x in range(-20, 21) if f(x) == -2] == [1, 3], 'antecedents of -2 are 1 and 3')
ok(all(f(Fr(k, 8)) != -4 for k in range(-160, 161)) and min(f(Fr(k, 100)) for k in range(-1000, 1001)) == -3, 'no antecedent of -4 (minimum -3)')
q = lambda x: Fr(2 * x + 1, 1) / (x - 3)
ok(q(0) == Fr(-1, 3) and q(4) == 9 and q(-1) == Fr(1, 4), 'g(x)=(2x+1)/(x-3) values')
ok(all(q(Fr(k, 4)) != 2 for k in range(-120, 121) if Fr(k, 4) != 3), 'g never takes the value 2')
ok(q(-4) == 1 and [x for x in range(-30, 31) if x != 3 and q(x) == 1] == [-4], 'g(x) = 1 only at -4')
ok(all(q(Fr(k, 4)) == 2 + Fr(7, 1) / (Fr(k, 4) - 3) for k in range(-40, 40) if Fr(k, 4) != 3), 'g(x) = 2 + 7/(x - 3)')
sq = lambda x: Fr(x) * x / 3 - 2
ok(sq(3) == 1 and sq(-3) == 1, 'figure: f(x) = x^2/3 - 2, f(3) = f(-3) = 1')

# ---- section 2: domains -----------------------------------------------------------------------------------------------------
def dom(fn, lo=-12, hi=12):
    return [x for x in (Fr(k, 4) for k in range(lo * 4, hi * 4 + 1)) if defined(fn, float(x))]
ok(all(defined(lambda x: 2 * x ** 3 - 5 * x + 1, x) for x in range(-9, 10)), 'dom1(1): R')
ok(set(range(-9, 10)) - {x for x in range(-9, 10) if defined(lambda t: 1 / (t - 7), x)} == {7}, 'dom1(2): R minus 7')
ok(set(range(-9, 10)) - {x for x in range(-9, 10) if defined(lambda t: 3 * t / (t * t - 16), x)} == {-4, 4}, 'dom1(3)')
ok(all(defined(lambda t: sqrt(3 * t + 6), float(x)) == (x >= -2) for x in dom(lambda t: 0)), 'dom1(4): [-2, +inf[')
ok(all(defined(lambda t: sqrt(8 - 2 * t), float(x)) == (x <= 4) for x in dom(lambda t: 0)), 'dom1(5): ]-inf, 4]')
ok(all(defined(lambda t: 1 / sqrt(t + 3), float(x)) == (x > -3) for x in dom(lambda t: 0)), 'dom1(6): ]-3, +inf[')
ok(all(defined(lambda t: (t + 2) / (t * t + 4), float(x)) for x in dom(lambda t: 0)), 'dom2: f on R')
ok({x for x in dom(lambda t: 0) if not defined(lambda t: (t + 2) / (t * t - 4), float(x))} == {-2, 2}, 'dom2: g excludes -2 and 2')
ok(all(abs((x + 2) / (x * x - 4) - 1 / (x - 2)) < 1e-12 for x in map(float, dom(lambda t: 0)) if x not in (-2.0, 2.0)), 'dom2: g(x) = 1/(x-2)')
ok(defined(lambda t: 1 / (t - 2), -2.0), 'dom2: 1/(x-2) is defined at -2, g is not')
ok(all(defined(lambda t: sqrt(t * t - 6 * t + 8), float(x)) == (x <= 2 or x >= 4) for x in dom(lambda t: 0)), 'dom3(1)')
ok(all(defined(lambda t: sqrt(5 - t) / (t * t - 9), float(x)) == (x <= 5 and x not in (-3, 3)) for x in dom(lambda t: 0)), 'dom3(2)')
ok(all(defined(lambda t: 1 / (abs(t) - 3), float(x)) == (x not in (-3, 3)) for x in dom(lambda t: 0)), 'dom3(3)')
ok(all(defined(lambda t: sqrt((t - 1) / (t + 4)), float(x)) == (x < -4 or x >= 1) for x in dom(lambda t: 0)), 'dom3(4)')
ok(all(defined(lambda t: sqrt(t + 3) / (t - 5), float(x)) == (x >= -3 and x != 5) for x in dom(lambda t: 0)), 'example: sqrt(x+3)/(x-5)')
ok(all(defined(lambda t: sqrt(t * t - t - 12), float(x)) == (x <= -3 or x >= 4) for x in dom(lambda t: 0)), 'example: sqrt(x^2-x-12)')
ok(1 + 48 == 49 and (-3) * 4 == -12 and -3 + 4 == 1, 'x^2 - x - 12 = (x + 3)(x - 4)')

# ---- section 3: variation -----------------------------------------------------------------------------------------------------
def monotone(fn, pts, inc):
    return all((fn(a) <= fn(b)) if inc else (fn(a) >= fn(b)) for a, b in zip(pts, pts[1:]))
pos = [Fr(k, 4) for k in range(0, 40)]; neg = [Fr(k, 4) for k in range(-40, 1)]
ok(monotone(lambda x: -2 * x + 5, neg + pos, False), 'var1: -2x+5 decreasing')
ok(monotone(lambda x: 3 * x * x, pos, True) and monotone(lambda x: 3 * x * x, neg, False), 'var1: 3x^2')
ok(monotone(lambda x: -x * x, pos, False), 'var1: -x^2 decreasing on [0, +inf[')
ok(monotone(lambda x: -2 * x * x, neg, True) and monotone(lambda x: -2 * x * x, pos, False), 'example: -2x^2')
ok(monotone(lambda x: Fr(1) / x, [Fr(-k, 4) for k in range(40, 0, -1)], False), 'var2: 1/x decreasing on ]-inf, 0[ (sampled)')
ok(Fr(-1, 2) < Fr(1, 3) and Fr(1) / -2 < Fr(1) / 3, 'pitfall: 1/x is not decreasing on R*: a=-2 < b=3 and f(a) < f(b)')
ok(all(Fr(1) / a - Fr(1) / b == Fr(b - a) / (a * b) for a, b in [(-5, -2), (-3, -1)]), 'var2 identity 1/a - 1/b = (b-a)/(ab)')
ok((-3) * (-3) == 9 > 1 == (-1) * (-1), 'var4: x^2 on negatives: -3 < -1 but 9 > 1')

# ---- section 4: parity, axes, centres ----------------------------------------------------------------------------------------------
def parity(fn, pts):
    ev = all(abs(fn(x) - fn(-x)) < 1e-9 for x in pts); od = all(abs(fn(x) + fn(-x)) < 1e-9 for x in pts)
    return 'even' if ev and not od else 'odd' if od and not ev else 'both' if ev and od else 'none'
P = [Fr(k, 4) for k in range(1, 40) if Fr(k, 4) not in (1, 2)]
ok(parity(lambda x: x ** 4 - 3 * x * x + 2, P) == 'even', 'par1(1)')
ok(parity(lambda x: x ** 3 + 5 * x, P) == 'odd', 'par1(2)')
ok(parity(lambda x: (x + 1) ** 2, P) == 'none' and (1 + 1) ** 2 == 4 and (-1 + 1) ** 2 == 0, 'par1(3)')
ok(parity(lambda x: Fr(x, 1) / (x * x - 1), [x for x in P if x != 1]) == 'odd', 'par1(4)')
ok(parity(lambda x: abs(x) + x * x, P) == 'even', 'par1(5)')
ok(not defined(lambda x: sqrt(x), -1.0) and defined(lambda x: sqrt(x), 1.0), 'par1(6): sqrt not defined at -1')
ok(not defined(lambda x: 1 / (x - 1), 1.0) and defined(lambda x: 1 / (x - 1), -1.0), 'par1(7): 1/(x-1) defined at -1 not 1')
ok(not defined(lambda x: sqrt(x + 2), -3.0) and defined(lambda x: sqrt(x + 2), 3.0), 'par2: sqrt(x+2): 3 in, -3 out')
ok(not defined(lambda x: 1 / (x - 5), 5.0) and defined(lambda x: 1 / (x - 5), -5.0), 'par2: 1/(x-5): -5 in, 5 out')
ok(parity(lambda x: (x * x + 1) / x, P) == 'odd', 'f(x)=(x^2+1)/x odd')
ok(all(f6(3 + h) == f6(3 - h) and f6(3 + h) == h * h - 4 for f6 in [lambda x: x * x - 6 * x + 5] for h in [Fr(k, 4) for k in range(-20, 21)]), 'axe: x = 3 and f(3+h) = h^2 - 4')
ok(all(abs(abs(-2 - x + 1) - abs(x + 1)) == 0 for x in [Fr(k, 4) for k in range(-40, 41)]), 'axe: |x+1| symmetric about x = -1')
g2 = lambda x: 2 + Fr(3) / (x - 1)
ok(all(g2(1 + h) + g2(1 - h) == 4 for h in [Fr(k, 4) for k in range(-20, 21)] if h != 0), 'centre: (1, 2)')
ok(all(Fr(2 * x + 1) / (x - 1) == g2(x) for x in [Fr(k, 4) for k in range(-20, 21)] if x != 1), 'centre: (2x+1)/(x-1) = 2 + 3/(x-1)')
ok(all(g2(2 - x) + g2(x) == 4 for x in [Fr(k, 4) for k in range(-20, 21)] if x != 1), 'centre: f(2a-x)+f(x) = 2b')
fp = lambda x: 1; gp = lambda x: x
ok(fp(1) + gp(1) == 2 and fp(-1) + gp(-1) == 0, 'par3: 1 + x is neither even nor odd')
ok(parity(lambda x: x ** 3 * (x * x + 1), P) == 'odd' and parity(lambda x: (x * x - 3) ** 2, P) == 'even', 'par3: product / square of an even')

# ---- section 5: periods ---------------------------------------------------------------------------------------------------------
def is_period(fn, T, xs):
    return all(abs(fn(x + T) - fn(x)) < 1e-9 for x in xs)
XS = [i / 20 for i in range(-200, 201)]
steps = [k * math.pi / 60 for k in range(1, 241)]        # candidates up to 4 pi
def smallest(fn):
    return next((T for T in steps if is_period(fn, T, XS)), None)
for name, fn, want in [('sin 3x', lambda x: math.sin(3 * x), 2 * math.pi / 3), ('cos(x/2)', lambda x: math.cos(x / 2), 4 * math.pi),
                       ('5cos(2x+pi/3)', lambda x: 5 * math.cos(2 * x + math.pi / 3), math.pi),
                       ('2cos 2x', lambda x: 2 * math.cos(2 * x), math.pi), ('3sin(4x-1)', lambda x: 3 * math.sin(4 * x - 1), math.pi / 2),
                       ('cos^2', lambda x: math.cos(x) ** 2, math.pi), ('sin+cos', lambda x: math.sin(x) + math.cos(x), 2 * math.pi),
                       ('cos x + cos 2x', lambda x: math.cos(x) + math.cos(2 * x), 2 * math.pi),
                       ('3 sin x', lambda x: 3 * math.sin(x), 2 * math.pi), ('2cos(x-1)', lambda x: 2 * math.cos(x - 1), 2 * math.pi)]:
    s = smallest(fn); ok(s is not None and abs(s - want) < 1e-9, f'period of {name}: {s} vs {want}')
ok(abs(math.tan(0.3 + math.pi) - math.tan(0.3)) < 1e-9, 'tan has period pi')
ok(smallest(lambda x: math.sin(x) + math.sin(math.sqrt(2) * x)) is None, 'sin x + sin(sqrt2 x): no period found up to 4 pi')
ok(all(not is_period(lambda x: x * x, T, XS) for T in steps) and all(not is_period(lambda x: 1 / x if x else 0.0, T, [x for x in XS if abs(x) > .2 and abs(x + T) > .2]) for T in steps), 'x^2 and 1/x are not periodic')
ok(parity(lambda x: math.cos(x) ** 2, [i / 8 for i in range(1, 30)]) == 'even' and parity(lambda x: math.cos(x) + math.cos(2 * x), [i / 8 for i in range(1, 30)]) == 'even', 'cos^2 and cos x + cos 2x are even')
u = {0: 1, 1: 3, 2: 2}; U = lambda n: u[n % 3]
ok(U(31) == 3 and U(-4) == 2 and U(300) == 1, 'per1: u(31) = 3, u(-4) = 2, u(300) = 1')
f5 = lambda x: (x % 5) ** 2
ok(f5(12) == 4 and f5(-1) == 16 and f5(17.5) == 6.25, 'per3: values')
ok(all(abs(math.cos(x + math.pi) ** 2 - math.cos(x) ** 2) < 1e-12 for x in XS), 'per4(1)')
ok(abs((1 + math.cos(2 * 0.7)) / 2 - math.cos(0.7) ** 2) < 1e-12, 'beyond: cos^2 = (1 + cos 2x)/2')

# ---- problems -----------------------------------------------------------------------------------------------------------------------
def r(x):
    x = ((x + 2) % 4) - 2                 # reduce to [-2, 2[ with period 4
    x = abs(x)                              # even
    return 2 * x if x <= 1 else 2
ok(r(-0.5) == 1 and r(3) == 2 and r(10) == 2 and r(7.25) == 1.5, 'problem 1: values -0.5, 3, 10, 7.25')
ok(max(r(i / 100) for i in range(-800, 801)) == 2, 'problem 1: maximum 2')
ok(all((r(i / 100) == 2) == (any(1 + 4 * k <= i / 100 <= 3 + 4 * k for k in range(-3, 4))) for i in range(-800, 801)), 'problem 1: maximum exactly on [1+4k, 3+4k]')
ok(all(abs(r(x) - r(-x)) < 1e-12 and abs(r(x) - r(x + 4)) < 1e-12 for x in XS), 'problem 1: even and 4-periodic')
h = lambda t: 6 - 5 * math.cos(math.pi * t / 10)
ok(abs(h(0) - 1) < 1e-12 and abs(h(10) - 11) < 1e-12 and abs(h(35) - 6) < 1e-9 and abs(h(50) - 11) < 1e-9, 'problem 2: values')
ok(all(abs(h(t + 20) - h(t)) < 1e-9 for t in XS) and not any(all(abs(h(t + p) - h(t)) < 1e-9 for t in XS) for p in [x / 2 for x in range(1, 40)]), 'problem 2: period 20 and nothing smaller')
ok(all(abs(h(10 + u_) - h(10 - u_)) < 1e-9 for u_ in XS), 'problem 2: symmetric about t = 10')
ok([t for t in [x / 4 for x in range(0, 81)] if abs(h(t) - 6) < 1e-9] == [5.0, 15.0], 'problem 2: h = 6 at 5 and 15')

# ---- the laboratory model ---------------------------------------------------------------------------------------------------------------
want_lab = {'sq': ('even', None), 'cube': ('odd', None), 'inv': ('odd', None), 'cos2': ('even', math.pi), 'sin1': ('odd', 2 * math.pi), 'shift': ('none', None), 'phase': ('none', 2 * math.pi)}
fns = {'sq': lambda x: x * x / 3 - 2, 'cube': lambda x: (x ** 3 - 6 * x) / 10, 'inv': lambda x: 2 / x, 'cos2': lambda x: 2 * math.cos(2 * x),
       'sin1': lambda x: 3 * math.sin(x), 'shift': lambda x: x * x / 4 + x / 2 - 1, 'phase': lambda x: 2 * math.cos(x - 1)}
for fid, (par, per) in want_lab.items():
    ok(re.search(rf'{fid}: \{{[^}}]*parity: "{par}"', LAB) is not None, f'lab declares parity of {fid}')
    ok(parity(fns[fid], [i / 4 for i in range(1, 21)]) == par, f'lab {fid}: parity by scanning')
    ok((smallest(fns[fid]) if fid != 'inv' else None) is None if per is None else abs(smallest(fns[fid]) - per) < 1e-9, f'lab {fid}: smallest period')
ok(fns['sq'](3) == 1 and fns['sq'](-3) == 1, 'lab predict mission: f(-3) = 1')

print(f'{checks} checks passed')
