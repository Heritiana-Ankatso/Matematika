"""Design v8, stage 7 (docs/REBUILD_PLAN.md): every address of the site keeps working under ?v8. The v8 pages kept the
current addresses (no page was renamed, so no alias table is needed): this test opens one address for every route of
MAP.md section 3 (and every route head of that table must be covered here) and checks that it renders in its world,
with the world's top bar, no « Page introuvable » and no page error. Old links shared with students, printed in PDFs or
written in slide decks therefore keep working after the switch of stage 8. Run by run_browser.py."""
import os, re, shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173').rstrip('/')
ADDRESSES = [
    'home', 'musee', 'topics', 'topics/algebra', 'search', 'search/vecteur', 'teacher', 'prepare', 'relax', 'review',
    'basics', 'basics/fractions', 'resources', 'resources/t10', 'chapter/seconde-01', 'chapter/seconde-01/exercices',
    'library', 'workshop/quadratic', 'pack', 'sources', 'automatismes', 'sheets', 'bank', 'bank/seconde/seconde-01',
    'slides', 'slides/premiere', 'lab', 'lab/quadratic/vertex', 'history/advances', 'history/advances/babylonian-calculation',
    'biographies', 'biographies/gauss', 'stories/gauss-sum', 'gallery', 'gallery/galton', 'olympiad', 'olympiad/pigeonhole',
    'intuition', 'fractals', 'errors', 'errors/square-of-sum', 'challenges', 'challenges/gauss-sum', 'pathways', 'pathways/mg',
    'university', 'university/algebre-1-guide',
]
MISSING = re.compile(r'Page introuvable|Page not found')

# every route head of MAP.md section 3 is covered
section = Path(__file__).resolve().parents[1].joinpath('MAP.md').read_text().split('## 3.')[1].split('## 4.')[0]
heads = set(re.findall(r'`#([a-z-]+)', section))
covered = {a.split('/')[0] for a in ADDRESSES}
assert heads <= covered, f'routes of MAP.md section 3 not opened here: {sorted(heads - covered)}'

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') or shutil.which('chromium'))
    context = browser.new_context(viewport={'width': 1280, 'height': 900}, service_workers='block', locale='fr-FR', reduced_motion='reduce')
    page = context.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    for address in ADDRESSES:
        page.goto(BASE + '/?v8#' + address)
        page.wait_for_function("document.documentElement.dataset.world && document.querySelector('#main') && !document.querySelector('#app[aria-busy=\"true\"]')", timeout=20000)
        page.wait_for_timeout(300)
        assert page.locator('.v8-bar').count() == 1, f'{address}: the world top bar'
        text = page.locator('#main').inner_text()
        assert not MISSING.search(text), f'{address}: page not found'
    # #history/people opens the standalone portrait timeline, as before
    page.goto(BASE + '/?v8#history/people'); page.wait_for_url('**/mathematicians-timeline.html**', timeout=20000)
    assert not errors, errors
    context.close(); browser.close()
print(f'v8 address checks passed ({len(ADDRESSES) + 1} addresses, every route of MAP.md section 3)')
