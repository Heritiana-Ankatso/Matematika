"""Design v8, stage 3 (docs/REBUILD_PLAN.md): the threshold and the Musée under ?v8, in Chromium.
Threshold: four doors, on a phone all four inside the first screen (down to 360 x 640), a click on a door enters its
world, the drawings rest under reduced motion. Hall: eight folded rooms, one open at a time, counts shown, the exhibit
of the day drawn. Exhibit pages (#gallery/<id>): live figure, "Ce qui se passe", the same room, no overflow at 360, 390
and 1280 px, no page error. Without ?v8 the home and the exhibits are the current ones. Run by run_browser.py."""
import os, shutil
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173').rstrip('/')
COUNT_FRAMES = "window.__frames=0;const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=f=>{window.__frames++;return raf(f);};"
EXHIBITS = ['benford-gallery', 'galton', 'chaos', 'collisions', 'gomboc', 'mirrored-rooms']

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') or shutil.which('chromium'))

    # threshold on a small phone: four bands on the first screen, reduced motion leaves the drawings still
    context = browser.new_context(viewport={'width': 360, 'height': 640}, service_workers='block', reduced_motion='reduce')
    context.add_init_script(COUNT_FRAMES)
    page = context.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE + '/?v8#home'); page.locator('.v8-door').first.wait_for(); page.wait_for_load_state('networkidle'); page.wait_for_timeout(300)
    assert page.evaluate('document.documentElement.dataset.world') == 'home'
    doors = page.locator('a.v8-door')
    assert doors.count() == 4
    for i in range(4):
        box = doors.nth(i).bounding_box()
        assert box['y'] >= 0 and box['y'] + box['height'] <= 640 + 0.5, f'door {i} leaves the first screen: {box}'
        assert box['height'] >= 88
    assert page.evaluate('document.documentElement.scrollWidth') <= 360
    before = page.evaluate('window.__frames'); page.wait_for_timeout(1200)
    assert page.evaluate('window.__frames') - before <= 2, 'the doors animate under reduced motion'
    # a click anywhere on a door enters
    doors.nth(0).click(position={'x': 30, 'y': 30}); page.wait_for_function("location.hash === '#musee'"); page.locator('.v8-room').first.wait_for()
    assert page.evaluate('document.documentElement.dataset.world') == 'musee'
    context.close()

    for width in (360, 390, 1280):
        context = browser.new_context(viewport={'width': width, 'height': 820}, service_workers='block', locale='fr-FR')
        page = context.new_page(); errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(BASE + '/?v8#musee'); page.locator('.v8-room').first.wait_for(); page.wait_for_load_state('networkidle')
        rooms = page.locator('details.v8-room')
        assert rooms.count() == 8 and page.locator('details.v8-room[open]').count() == 0
        rooms.nth(0).locator('summary').click(); rooms.nth(3).locator('summary').click()
        assert page.locator('details.v8-room[open]').count() == 1, 'one room open at a time'
        assert page.locator('details.v8-room[open] .v8-list a').count() >= 4
        page.locator('.v8-today canvas').wait_for()
        assert page.evaluate("(()=>{const c=document.querySelector('.v8-today canvas');return c.width>0&&c.height>0})()"), 'the exhibit of the day is drawn'
        assert page.evaluate('document.documentElement.scrollWidth - innerWidth') <= 0, f'hall overflows at {width}px'
        for ex in EXHIBITS:
            page.goto(f'{BASE}/?v8#gallery/{ex}'); page.locator('.v8-exhibit h1').wait_for()
            page.locator('#object-stage > *').first.wait_for()
            assert page.evaluate('document.documentElement.dataset.world') == 'musee'
            assert page.get_by_role('heading', name='Ce qui se passe').count() == 1
            assert page.get_by_role('heading', name='Dans la même salle').count() == 1
            page.wait_for_timeout(200)
            overflow = page.evaluate('document.documentElement.scrollWidth - innerWidth')
            assert overflow <= 0, f'{ex} overflows by {overflow}px at {width}px'
        assert not errors, errors
        context.close()

    # with ?v8=off: the previous home and exhibit
    context = browser.new_context(viewport={'width': 1280, 'height': 820}, service_workers='block')
    page = context.new_page()
    page.goto(BASE + '/?v8=off#gallery/galton'); page.locator('main').wait_for(); page.wait_for_load_state('networkidle')
    assert page.locator('.v8').count() == 0 and page.evaluate('document.documentElement.dataset.world') is None
    page.goto(BASE + '/#musee'); page.wait_for_url('**/#resources')
    context.close()
    browser.close()
print('v8 Musée browser checks passed (threshold at 360 x 640, hall, 6 exhibits at 360, 390, 1280 px)')
