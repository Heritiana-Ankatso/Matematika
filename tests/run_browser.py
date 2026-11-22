"""Start a server and browser tests in one process environment; no app dependencies."""
import os
from pathlib import Path
import subprocess
import sys
import time
from urllib.request import urlopen

root = Path(__file__).resolve().parents[1]
# An externally selected URL uses the caller's already-running server.
server = None
if not os.environ.get('MATHS_EXPLORER_URL'):
    server = subprocess.Popen(['node', 'scripts/serve.mjs'], cwd=root,
                              stdout=subprocess.DEVNULL)
    try:
        for _ in range(100):
            if server.poll() is not None:
                raise RuntimeError('Local server exited before browser checks')
            try:
                with urlopen('http://localhost:4173', timeout=.2):
                    break
            except OSError:
                time.sleep(.05)
        else:
            raise RuntimeError('Local server did not become ready')
    except BaseException:
        server.terminate()
        server.wait(timeout=5)
        raise
try:
    # The live site is French-curriculum only. Standalone collection and other-curriculum
    # scripts remain in tests/ alongside their source modules; their unit suites still run.
    for script in ['ergonomics_browser.py', 'live_curriculum_browser.py', 'slides_lab_browser.py',
                   'generators_browser.py', 'chapter_destinations_browser.py', 'teacher_browser.py', 'search_browser.py', 'related_browser.py', 'exercise_link_browser.py', 'challenge_browser.py', 'hover_browser.py', 'v8_foundation_browser.py', 'v8_musee_browser.py', 'v8_worlds_browser.py', 'v8_lycee_browser.py', 'v8_addresses_browser.py']:
        # the checks of the previous look open it with ?v8=off remembered (tests/current-look/sitecustomize.py)
        env = dict(os.environ)
        if not script.startswith('v8_'):
            env['PYTHONPATH'] = os.pathsep.join(filter(None, [str(root / 'tests' / 'current-look'), env.get('PYTHONPATH', '')]))
        result = subprocess.run([sys.executable, 'tests/' + script], cwd=root, env=env)
        if result.returncode:
            break
finally:
    if server:
        server.terminate()
        server.wait(timeout=5)
sys.exit(result.returncode)
