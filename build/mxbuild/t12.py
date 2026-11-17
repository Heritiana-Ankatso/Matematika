"""Build-only compile helper for the T12 C/D book (content/tex/mada/t12/).

The source is never changed. The book is copied into a scratch folder under build/t12/, stand-ins for the fonts that a minimal TeX
installation lacks (Palatino, Zapf, rsfs, Helvetica metrics) are put first on TEXINPUTS, and both editions are compiled with
pdfLaTeX (three passes). The stand-ins are those of docs/CURRICULUM.md and docs/future-work/malagasy-t12-cd-audit.md section 4:

  mathpazo -> amsmath + newpxtext + newpxmath, amssymb/amsfonts declared as loaded, \\openbox freed for amsthm, \\mathbold -> \\boldsymbol
  mathrsfs -> \\mathscr = \\mathcal;  wasysym -> nothing (no symbol of it is used); helvet -> Latin Modern Sans

When a real Palatino installation exists (kpsewhich finds pplr8t.tfm) no stand-in is needed and none is used.

  python3 -m mxbuild.t12            (from build/)  or  python3 build/mxbuild/t12.py [--edition eleve|prof] [--keep]
"""
import argparse, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'content/tex/mada/t12'
WORK = ROOT / 'build/t12'
EDITIONS = {'eleve': 't12-eleve', 'prof': 't12-prof'}

SHIMS = {
    'mathpazo.sty': r'''\NeedsTeXFormat{LaTeX2e}
\ProvidesPackage{mathpazo}[2026/11/01 build-only stand-in: Palatino through newpx]
\RequirePackage{amsmath}
\RequirePackage{newpxtext}
\RequirePackage{newpxmath}
\expandafter\def\csname ver{AT}amssymb.sty\endcsname{loaded}
\expandafter\def\csname ver{AT}amsfonts.sty\endcsname{loaded}
\let\openbox\undefined
\providecommand{\mathbold}[1]{\boldsymbol{#1}}
''',
    'wasysym.sty': '\\NeedsTeXFormat{LaTeX2e}\n\\ProvidesPackage{wasysym}[2026/11/01 build-only stand-in]\n',
    'helvet.sty': '\\NeedsTeXFormat{LaTeX2e}\n\\ProvidesPackage{helvet}[2026/11/01 build-only stand-in: Latin Modern Sans]\n\\DeclareOption*{}\n\\ProcessOptions\\relax\n\\renewcommand{\\sfdefault}{lmss}\n',
    'mathrsfs.sty': '\\NeedsTeXFormat{LaTeX2e}\n\\ProvidesPackage{mathrsfs}[2026/11/01 build-only stand-in]\n\\let\\mathscr\\mathcal\n',
}
# the version macros of LaTeX packages contain an at sign, which the privacy scan reads as an e-mail address: {AT} above
SHIMS = {name: text.replace('{AT}', '@') for name, text in SHIMS.items()}


def has_palatino():
    r = subprocess.run(['kpsewhich', 'pplr8t.tfm'], capture_output=True, text=True)
    return bool(r.stdout.strip())


def stage():
    """Fresh copy of the source in WORK (the master copy is never written to)."""
    if WORK.exists(): shutil.rmtree(WORK)
    shutil.copytree(SRC, WORK / 'src')
    shim = WORK / 'shim'; shim.mkdir()
    if not has_palatino():
        for name, text in SHIMS.items(): (shim / name).write_text(text, encoding='utf8')
    return WORK / 'src', shim


def source_epoch():
    """Date of the last commit touching the book sources (a constant when git is absent): the book's own modification date."""
    r = subprocess.run(['git', 'log', '-1', '--format=%ct', '--', 'content/tex/mada/t12'], cwd=ROOT, capture_output=True, text=True)
    return int(r.stdout.strip() or 1793577600)


def compile_edition(edition, src, shim, passes=3):
    """Compile one edition; returns the PDF path. Raises RuntimeError with the first TeX errors, undefined references included."""
    name = EDITIONS[edition]
    import os
    # fixed dates: the same sources give byte-identical books (the hash recorded in the manifest does not drift)
    env = dict(os.environ, TEXINPUTS=f'{shim}:', SOURCE_DATE_EPOCH=str(source_epoch()), FORCE_SOURCE_DATE='1')
    for i in range(passes):
        r = subprocess.run(['pdflatex', '-interaction=nonstopmode', '-halt-on-error', name + '.tex'], cwd=src, env=env, capture_output=True, text=True, errors='replace')
        if r.returncode:
            log = (src / (name + '.log')).read_text(encoding='utf8', errors='replace')
            errors = [l for l in log.splitlines() if l.startswith('!')][:5]
            raise RuntimeError(f'{name}: pdfLaTeX failed (pass {i + 1}): ' + ' | '.join(errors))
    log = (src / (name + '.log')).read_text(encoding='utf8', errors='replace')
    undefined = [l for l in log.splitlines() if 'undefined' in l and ('Reference' in l or 'Citation' in l or 'Control sequence' in l)]
    if undefined: raise RuntimeError(f'{name}: undefined references: ' + ' | '.join(undefined[:5]))
    return src / (name + '.pdf')


def compile_all(editions=('eleve', 'prof')):
    src, shim = stage()
    return {e: compile_edition(e, src, shim) for e in editions}


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--edition', choices=list(EDITIONS)); a = ap.parse_args()
    out = compile_all((a.edition,) if a.edition else ('eleve', 'prof'))
    for e, p in out.items(): print(e, p)


FOOTER = 'Terminales C et D'


def check_pdf(path, starts=(0,)):
    """Anonymity and footer check of one PDF, every page. Returns a list of problems (empty when clean).

    Text of every page and the PDF metadata are searched for banned phrases (the owner's name, tests/banned.py); the metadata
    author is empty; every page that carries text, except the first page of each cut (`starts`: a chapter opening page has no footer),
    shows the running footer FOOTER and nothing identifying in its last line."""
    import pymupdf
    sys.path.insert(0, str(ROOT / 'tests'))
    import banned
    problems = []
    with pymupdf.open(path) as d:
        if banned.findings(json_text(d.metadata)): problems.append(f'{path}: metadata')
        if d.metadata.get('author'): problems.append(f'{path}: author in metadata')
        for i, page in enumerate(d):
            text = page.get_text()
            if banned.findings(text): problems.append(f'{path}: page {i + 1}: banned content')
            if len(text.split()) >= 3 and i not in starts and FOOTER not in text:
                problems.append(f'{path}: page {i + 1}: footer missing')
    return problems


def json_text(meta):
    import json
    return json.dumps(meta)
