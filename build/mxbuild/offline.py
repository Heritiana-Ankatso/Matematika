"""Offline support: the precache manifest of the application shell, inlined into the served service worker.

site/sw.js is the hand-written worker with one placeholder line (`self.__MX_SHELL = null;`). The build writes
dist/sw.js = that source with the placeholder replaced by the manifest: the list of shell files of dist/ with the hash
of their content, and a version derived from that list. A changed shell file therefore changes dist/sw.js, which is
how a browser learns that a new version exists (docs/OFFLINE.md). Deterministic: sorted, no timestamps.
"""
import hashlib, json, posixpath, re
from . import ROOT, DIST

SOURCE = ROOT / 'site' / 'sw.js'
OUTPUT = DIST / 'sw.js'
PLACEHOLDER = 'self.__MX_SHELL = null;'

# The application shell: what every page needs to start (owner, 22 November 2026: a smaller offline copy). The page,
# the stylesheets, the current look's fonts and the modules that js/app.js imports statically (the shell of
# docs/REBUILD_PLAN.md stage 1). A page's own code, MathJax, PDFs, decks and portraits are cached when they are opened
# (runtime cache of the worker), so a page never opened online is not available offline.
SHELL = ['index.html', 'styles/*.css', 'fonts/*.woff2']
SHELL_ENTRY = 'js/app.js'
# Small indexes that pages fetch when they open (the dashboard and the slides page). Skipped above MAX_DATA bytes.
START_DATA = ['slides/data/index.json', 'slides/lectures/index.json']
MAX_DATA = 256 * 1024
IMPORT = re.compile(r'^\s*(?:import|export)\s[^\'"`;]*?from\s*["\']([^"\']+)["\']|^\s*import\s*["\']([^"\']+)["\']', re.M)


def shell_modules(root):
    """The modules reached from js/app.js by static imports and re-exports (relative paths of root)."""
    seen, todo = set(), [SHELL_ENTRY]
    while todo:
        rel = todo.pop()
        path = root / rel
        if rel in seen or not path.is_file():
            continue
        seen.add(rel)
        for m in IMPORT.finditer(path.read_text(encoding='utf-8')):
            spec = (m.group(1) or m.group(2)).split('?')[0]
            if spec.startswith('.'):
                todo.append(posixpath.normpath(posixpath.join(posixpath.dirname(rel), spec)))
    return seen


def _hash(path):
    return hashlib.sha1(path.read_bytes()).hexdigest()[:10]   # same rule as the import map (site.py)


def shell_files(root=None):
    """Sorted relative paths of the files of `root` (default dist/) that the worker precaches."""
    root = root or DIST
    found = {p for pattern in SHELL for p in root.glob(pattern) if p.is_file()}
    found |= {root / f for f in shell_modules(root)}
    found |= {root / f for f in START_DATA if (root / f).is_file() and (root / f).stat().st_size <= MAX_DATA}
    return sorted(p.relative_to(root).as_posix() for p in found)


def manifest(root=None):
    """{'version', 'bytes', 'files': [[path, hash], ...], 'known': [[path, hash], ...]} for the shell of `root` (default
    dist/). `known` lists the other modules with their hash: the worker checks a module it fetches later against it, so a
    page of one version never runs a module of another (docs/OFFLINE.md)."""
    root = root or DIST
    shell = shell_files(root)
    files = [[f, _hash(root / f)] for f in shell]
    known = [[p.relative_to(root).as_posix(), _hash(p)] for p in sorted(root.glob('js/**/*.js')) if p.relative_to(root).as_posix() not in shell]
    version = hashlib.sha1(json.dumps([files, known], separators=(',', ':')).encode()).hexdigest()[:16]
    return {'version': version, 'bytes': sum((root / f).stat().st_size for f, _ in files), 'files': files, 'known': known}


def render(root=None, source=None):
    """The served worker: site/sw.js with the manifest in place of the placeholder."""
    from .site import edition_text   # the offline page of the worker names the site
    text = edition_text((source or SOURCE).read_text(encoding='utf-8'))
    if text.count(PLACEHOLDER) != 1:
        raise ValueError(f'site/sw.js must contain the line `{PLACEHOLDER}` exactly once')
    data = json.dumps(manifest(root), separators=(',', ':'), ensure_ascii=True)
    return text.replace(PLACEHOLDER, 'self.__MX_SHELL = ' + data + ';')


def write(check=False):
    """Write dist/sw.js; with check=True only report it when it is stale. Returns the stale paths."""
    text = render()
    if OUTPUT.exists() and OUTPUT.read_text(encoding='utf-8') == text:
        return []
    if not check:
        OUTPUT.write_text(text, encoding='utf-8')
    return [OUTPUT.relative_to(ROOT)]
