"""Loaded by Python when tests/current-look is on PYTHONPATH (tests/run_browser.py does it for the browser checks of the
previous look). Design v8 is on by default since stage 8 (docs/REBUILD_PLAN.md); the previous look stays reachable with
`?v8=off`, remembered on the device as localStorage mx-v8 = '0'. Every browser context these checks open starts with
that choice made, so they keep testing the previous look until it is removed."""
try:
    from playwright.sync_api._generated import Browser
except Exception:  # Playwright absent: nothing to prepare
    Browser = None

if Browser is not None:
    _new_context = Browser.new_context
    _new_page = Browser.new_page

    def _prepare(context):
        context.add_init_script("try { localStorage.setItem('mx-v8', '0'); } catch (e) {}")
        return context

    def new_context(self, *args, **kwargs):
        return _prepare(_new_context(self, *args, **kwargs))

    def new_page(self, *args, **kwargs):
        page = _new_page(self, *args, **kwargs)
        _prepare(page.context)
        return page

    Browser.new_context = new_context
    Browser.new_page = new_page
