"""Design v8, stage 5 (docs/REBUILD_PLAN.md): the Lycée copybook. The notebooks open one at a time on their levels and a
level in the address opens its notebook; on a chapter page every block of writing has its first baseline on a heavy
Seyès line (32 px from the top of the page) at 390 and 1280 px, after fonts and formulas, and again after a proof is
unfolded; the outline is written in the margin on a wide screen; proofs are folded; the Exercices sheet shows its
solutions one by one or all; no horizontal overflow, no page error. Run by run_browser.py."""
import os, shutil
from playwright.sync_api import sync_playwright

BASE = os.environ.get('MATHS_EXPLORER_URL', 'http://localhost:4173').rstrip('/')
CHAPTER = 'seconde-01'
MEASURE = """() => {
  const page = document.querySelector('.v8-copybook'), top = page.getBoundingClientRect().top, off = [];
  for (const b of page.querySelectorAll('h1, h2, h3, p, li, summary, .v8-text, .v8-rhythm')) {
    if (!b.getClientRects().length) continue;
    const probe = document.createElement('span'); probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    b.prepend(probe); const y = probe.getBoundingClientRect().bottom - top; probe.remove();
    const r = ((y % 32) + 32) % 32, d = Math.min(r, 32 - r);
    if (d > 1) off.push(`${b.tagName} ${(b.textContent || '').trim().slice(0, 40)}: ${d.toFixed(1)}px`);
  }
  return off;
}"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=os.environ.get('PLAYWRIGHT_CHROMIUM_PATH') or shutil.which('chromium'))
    errors = []
    for width, height in [(390, 844), (1280, 900)]:
        context = browser.new_context(viewport={'width': width, 'height': height}, service_workers='block', locale='fr-FR', reduced_motion='reduce')
        page = context.new_page(); page.on('pageerror', lambda e: errors.append(str(e)))
        # notebooks: a level in the address opens its notebook and level; one notebook open at a time
        page.goto(BASE + '/?v8#resources/t10'); page.locator('.v8-notebook').first.wait_for()
        assert page.locator('.v8-notebook[open]').count() == 1 and page.locator('.v8-notebook[open]').get_attribute('data-notebook') == 'mg'
        assert page.locator('details[data-fold="t10"][open] .v8-chapters a').count() >= 1
        page.locator('.v8-notebook[data-notebook="fr"] > summary').click()
        page.wait_for_function("document.querySelectorAll('.v8-notebook[open]').length === 1 && document.querySelector('.v8-notebook[open]').dataset.notebook === 'fr'")
        # the chapter page on the ruling
        page.goto(BASE + f'/?v8#chapter/{CHAPTER}'); page.locator('.v8-course section').first.wait_for()
        page.wait_for_function("document.fonts.status === 'loaded' && document.querySelector('.v8-course mjx-container')", timeout=30000)
        page.wait_for_timeout(600)
        off = page.evaluate(MEASURE)
        assert not off, f'{width}px: blocks off the heavy lines: {off[:6]}'
        assert page.locator('.v8-proof[open]').count() == 0, 'proofs are folded'
        page.locator('.v8-proof > summary').first.click(); page.wait_for_timeout(400)
        off = page.evaluate(MEASURE)
        assert not off, f'{width}px after a proof opens: {off[:6]}'
        overflow = page.evaluate('document.documentElement.scrollWidth - innerWidth')
        assert overflow <= 0, f'{width}px: overflows by {overflow}px'
        if width >= 1100:
            box = page.locator('.v8-margin ol').bounding_box(); text = page.locator('.v8-course').bounding_box()
            assert box['x'] + box['width'] <= text['x'], 'the outline is written in the margin'
        # Exercices: solutions one by one, or all
        page.locator('[data-sheet-open="v8-exercises"]').click()
        page.locator('#v8-exercises [data-all-solutions]').click()
        n = page.locator('#v8-exercises [data-solution]').count()
        assert n >= 1 and page.locator('#v8-exercises [data-solution][open]').count() == n
        page.locator('#v8-exercises [data-sheet-close]').click()
        context.close()
    assert not errors, errors
    browser.close()
print('v8 Lycée browser checks passed (notebooks, chapter on the Seyès ruling at 390 and 1280 px, proofs, Exercices)')
