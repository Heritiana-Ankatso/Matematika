"""Design v8, stage 2 (docs/REBUILD_PLAN.md): the switch and the foundation, in Chromium.
Without ?v8 nothing changes: no data-world, no v8 font or world stylesheet requested, #v8 is an unknown address.
With ?v8 (remembered; ?v8=off forgets it) each world of the sampler #v8/<world> has its ground and faces, no horizontal
overflow at 360, 390 and 1280 px, nothing animated under reduced motion (no requestAnimationFrame loop), the world menu
folded, folded lists one open at a time, the side sheet opening and closing with Escape, the projection ground remembered.
Run by run_browser.py."""
import os, shutil
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173').rstrip('/')
WORLDS = ['home', 'musee', 'univ', 'lycee', 'olymp']
TEXT_FACE = {'home': 'Literata', 'musee': 'Literata', 'univ': 'Literata', 'lycee': 'Caveat', 'olymp': 'Literata'}
# count the frames a page asks for, to prove that nothing loops under reduced motion
COUNT_FRAMES = "window.__frames=0;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=f=>{window.__frames++;return raf(f);};"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') or shutil.which('chromium'))

    # 1. switch off: the site as before
    context = browser.new_context(viewport={'width': 390, 'height': 844}, service_workers='block')
    page = context.new_page(); asked = []
    page.on('request', lambda r: asked.append(r.url))
    page.goto(BASE + '/#home'); page.locator('main').wait_for(); page.wait_for_load_state('networkidle')
    assert page.evaluate('document.documentElement.dataset.world') is None
    assert not [u for u in asked if '/fonts/v8/' in u or '/styles/world-' in u], 'the current site fetched v8 files'
    page.goto(BASE + '/#v8'); page.wait_for_url('**/#resources')
    context.close()

    # 2. switch on: every world of the sampler
    for width in (360, 390, 1280):
        context = browser.new_context(viewport={'width': width, 'height': 800}, service_workers='block', reduced_motion='reduce', locale='fr-FR')
        context.add_init_script(COUNT_FRAMES)
        page = context.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        for world in WORLDS:
            page.goto(f'{BASE}/?v8#v8/{world}'); page.locator('.v8 main h1').wait_for()
            page.wait_for_load_state('networkidle'); page.evaluate('document.fonts.ready')
            assert page.evaluate('document.documentElement.dataset.world') == world
            assert page.locator(f'link[data-world="{world}"]').count() == 1
            face = page.evaluate("getComputedStyle(document.querySelector('.v8 main p')).fontFamily")
            assert face.replace('"', '').startswith(TEXT_FACE[world]), (world, face)
            overflow = page.evaluate('document.documentElement.scrollWidth - window.innerWidth')
            assert overflow <= 0, f'{world} overflows by {overflow}px at {width}px'
            before = page.evaluate('window.__frames'); page.wait_for_timeout(1200)
            assert page.evaluate('window.__frames') - before <= 2, f'{world} animates under reduced motion'
            # the world menu is folded; folded lists open one at a time
            assert page.locator('[data-v8-menu]').get_attribute('open') is None
            folds = page.locator('[data-fold-group] > details')
            folds.nth(0).locator('summary').click(); folds.nth(1).locator('summary').click()
            assert page.locator('[data-fold-group] > details[open]').count() == 1
            # side sheet: opens, Escape closes it
            page.locator('[data-sheet-open]').click(); assert page.locator('dialog.v8-sheet').is_visible()
            page.keyboard.press('Escape'); page.wait_for_timeout(100); assert not page.locator('dialog.v8-sheet').is_visible()
            # 44 px targets for the commands
            for b in page.locator('.v8 button, .v8-worlds > summary, .v8-icon').all():
                if b.is_visible():
                    box = b.bounding_box(); assert box['height'] >= 43.5, (world, b.inner_text(), box)
        assert not errors, errors
        context.close()

    # 3. remembered on the device, forgotten with ?v8=off; the projection ground is remembered
    context = browser.new_context(viewport={'width': 1280, 'height': 800}, service_workers='block')
    page = context.new_page()
    page.goto(BASE + '/?v8#v8/musee'); page.locator('.v8 main h1').wait_for()
    page.locator('[data-ground="clair"]').click()
    page.goto(BASE + '/#v8/univ'); page.reload(); page.locator('.v8 main h1').wait_for()
    assert page.evaluate('document.documentElement.dataset.world') == 'univ', 'the switch is remembered'
    assert page.locator('[data-ground="clair"]').get_attribute('aria-pressed') == 'true'
    page.goto(BASE + '/?v8=off#home'); page.reload(); page.locator('main').wait_for()
    assert page.evaluate('document.documentElement.dataset.world') is None
    context.close()
    browser.close()
print('v8 foundation browser checks passed (switch off untouched; 5 worlds at 360, 390, 1280 px)')
