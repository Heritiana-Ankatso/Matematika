"""Design v8, stages 4 to 8 (docs/REBUILD_PLAN.md): under ?v8 every page is in a world. The pages built for v8 (threshold,
Musée, exhibits, Université, ...) and every page of the current look, framed by its world's top bar, ground and palette:
the expected world on the root, the world's top bar, no horizontal overflow at 390 px, no page error. Université: folded
courses one open at a time, the Syracuse sequence, the language buttons. Olympiades: the arena (problem of the day, squares,
warm-ups) and a strategy page in its world. Run by run_browser.py."""
import os, shutil
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173').rstrip('/')
# route -> world (routes.js ROUTES)
PAGES = {
    'university': 'univ', 'university/algebre-1-guide': 'univ', 'basics': 'univ', 'basics/sets': 'univ', 'topics': 'univ',
    'resources': 'lycee', 'resources/seconde': 'lycee', 'chapter/seconde-01': 'lycee', 'chapter/t10-01': 'lycee', 'bank/seconde': 'lycee', 'slides/premiere': 'lycee',
    'automatismes': 'lycee', 'sheets': 'lycee', 'pack': 'lycee', 'library': 'lycee', 'review': 'lycee',
    'lab': 'musee', 'lab/quadratic': 'musee', 'gallery': 'musee', 'intuition': 'musee', 'fractals': 'musee', 'errors': 'musee',
    'history/advances': 'musee', 'biographies': 'musee', 'stories': 'musee', 'challenges': 'musee', 'challenges/gauss-sum': 'musee',
    'olympiad': 'olymp', 'search': 'home',
}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') or shutil.which('chromium'))
    context = browser.new_context(viewport={'width': 390, 'height': 844}, service_workers='block', locale='fr-FR', reduced_motion='reduce')
    page = context.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE + '/?v8#home'); page.locator('.v8-door').first.wait_for()
    for route, world in PAGES.items():
        page.evaluate("h => { location.hash = h; }", '#' + route)
        page.wait_for_function("w => document.documentElement.dataset.world === w && document.querySelector('#main')", arg=world, timeout=20000)
        page.wait_for_load_state('networkidle'); page.wait_for_timeout(150)
        assert page.locator('.v8-bar').count() == 1, f'{route}: the world top bar'
        assert page.locator('header.topbar').count() == 0, f'{route}: no header of the current look'
        overflow = page.evaluate('document.documentElement.scrollWidth - innerWidth')
        assert overflow <= 0, f'{route} overflows by {overflow}px'
    assert not errors, errors

    # Université: folded courses one at a time, Syracuse, the language switch
    page.evaluate("h => { location.hash = h; }", '#university'); page.locator('[data-course]').first.wait_for()
    courses = page.locator('[data-course]')
    assert page.locator('[data-course][open]').count() == 0
    courses.nth(0).locator('summary').click(); courses.nth(1).locator('summary').click()
    assert page.locator('[data-course][open]').count() == 1
    page.fill('#v8-cz', '27'); assert '111' in page.locator('[data-cz]').inner_text()
    page.locator('.v8-lang [data-lang="en"]').click()
    page.wait_for_function("document.documentElement.lang === 'en' && /Our courses/.test(document.body.innerText)")
    page.locator('.v8-lang [data-lang="fr"]').click()
    page.wait_for_function("document.documentElement.lang === 'fr'")
    assert not errors, errors

    # Olympiades arena: the problem of the day with folded hints, the squares, the warm-ups
    page.evaluate("h => { location.hash = h; }", '#olympiad'); page.locator('.v8-day').wait_for()
    assert page.locator('.v8-day details[open]').count() == 0
    page.locator('.v8-day details summary').first.click()
    assert page.locator('.v8-day details[open]').count() == 1
    assert page.locator('.v8-squares .v8-sq').count() >= 50
    assert page.locator('.v8-chips a[href^="#challenges/"]').count() >= 1
    page.locator('.v8-strategies a').first.click()
    page.wait_for_function("/^#olympiad\\/./.test(location.hash) && document.documentElement.dataset.world === 'olymp'")
    assert not errors, errors
    context.close(); browser.close()
print(f'v8 worlds browser checks passed ({len(PAGES)} pages in their world at 390 px, Université, arena)')
