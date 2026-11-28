"""Publish one measured content model for every catalogue entry point.

Editorial metadata belongs to manifest.json. Pages, file sizes, hashes and
sequence positions belong to the build, never to hand-written UI copy.
"""
import copy
import subprocess
import hashlib
import json
from pathlib import Path
from . import ROOT, DIST
from . import catalog

MODEL = ROOT / 'site/js/catalogue-data.js'
# Split so that a page loads only what it uses (docs/REBUILD_PLAN.md stage 1): the versions of linked files are read by
# data-loader.js (pages that link files), the annals records and their versions by annals-bank.js.
VERSIONS = ROOT / 'site/js/asset-versions.js'
ANNALS = ROOT / 'site/js/annals-data.js'
ANNALS_PREFIX = 'resources/annals/'
# Catalogue lines of the experiments, the gallery and the challenges, and the context of every address of the site index,
# read from their modules by Node (scripts/catalogue-lines.mjs).
UNIVERSITY = DIST / 'resources/university/index.json'


def file_record(path):
    path = Path(path)
    relative = path.relative_to(DIST).as_posix()
    if not path.is_file():
        raise ValueError(f'Missing linked content: {relative}')
    record = {'path': relative, 'bytes': path.stat().st_size,
              'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
    if path.suffix == '.pdf':
        import pymupdf
        with pymupdf.open(path) as pdf:
            record['pages'] = len(pdf)
    return record


def lesson_meta(section):
    path = ROOT / section['lessonSource']
    return json.loads(path.read_text())['sequences'] if path.exists() else {s['id']: {} for s in section['sequences']}


def university_index(manifest, previous, measure=file_record):
    index = copy.deepcopy(manifest['university'])
    files, ids = {}, set()
    old_sequences = {s['id']: s for c in previous.get('sections', []) for s in c['sequences']}
    from runpy import run_path
    fourier_lessons = {x['id']: x for x in run_path(str(ROOT / 'content/university/fourier/lessons.py'))['LESSONS']} if any(s['id']=='fourier' for s in index['sections']) else {}
    for section in index['sections']:
        if section['id'] in ids:
            raise ValueError('Duplicate collection ID: ' + section['id'])
        ids.add(section['id'])
        for position, seq in enumerate(section['sequences'], 1):
            if seq['id'] in ids:
                raise ValueError('Duplicate sequence ID: ' + seq['id'])
            ids.add(seq['id'])
            if section['id']=='fourier':
                lesson=fourier_lessons[seq['id']]
                seq.update(title=[lesson['title'],lesson['title']],summary=[lesson['objectives'][0],lesson['objectives'][0]],prerequisites=[lesson['prerequisites'],lesson['prerequisites']])
            if section.get('lessonSource'):
                # Titles, summaries, prerequisites and outline come from the lesson sources, through their build receipt.
                seq.update(lesson_meta(section).get(seq['id'], {}))
            seq['number'] = position
            for key in ('studentPage', 'teacherPage'):
                if key in old_sequences.get(seq['id'], {}):
                    seq[key] = old_sequences[seq['id']][key]
            path = f"resources/university/{section['id']}/{seq.get('folder', 'slides')}/{seq['slide']}"
            files[seq['id']] = measure(DIST / path)
        for doc in section['documents']:
            record = measure(DIST / doc['path'])
            if doc['key'] in files and files[doc['key']] != record:
                raise ValueError('Conflicting document ID: ' + doc['key'])
            files[doc['key']] = record
        for doc in section.get('studyDocuments', []):
            if doc['key'] not in files:
                raise ValueError('Unknown study document: ' + doc['key'])
    index['files'] = files
    for key in ('sourceDigest', 'moduleDigest'):
        if key in previous:
            index[key] = previous[key]
    return index


def asset_versions():
    return {p.relative_to(DIST).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()[:16]
            for folder in ('resources', 'slides', 'sources', 'data')
            for p in sorted((DIST / folder).rglob('*')) if p.is_file()}


def generate(manifest=None):
    manifest = manifest or catalog.load()
    previous = json.loads(UNIVERSITY.read_text()) if UNIVERSITY.exists() else {}
    university = university_index(manifest, previous)
    course_ids = {c['course'] for c in manifest['companion']['chapters']}
    courses = manifest['catalog']['courses']
    discovery_chapters = [dict(c, formats=sorted({r['format'] for r in manifest['catalog']['resources'] if r['chapter'] == c['id']}), languages=sorted({lang for r in manifest['catalog']['resources'] if r['chapter'] == c['id'] for lang in r.get('editions', {})})) for c in manifest['catalog']['chapters']]
    model = {'courses': courses, 'discoveryChapters': discovery_chapters, 'primaryCourses': [c for c in courses if c['id'] in course_ids],
             'university': university, 'companionChapters': [c['id'] for c in manifest['companion']['chapters']]}
    versions = asset_versions()
    # The model embeds this index, so use the new index's hash, not the previous file's.
    uni_text = json.dumps(university, ensure_ascii=False, indent=2) + '\n'
    versions['resources/university/index.json'] = hashlib.sha256(uni_text.encode()).hexdigest()[:16]
    annals = {'annalsBank': manifest.get('annalsBank', {'records': []}),
              'annalsVersions': {k: v for k, v in versions.items() if k.startswith(ANNALS_PREFIX)}}
    shared = {'assetVersions': {k: v for k, v in versions.items() if not k.startswith(ANNALS_PREFIX)}}
    head = '// Generated by mxbuild; edit content/data/manifest.json and rebuild.\n'
    module = lambda values: head + '\n'.join('export const ' + key + ' = ' + json.dumps(value, ensure_ascii=False, separators=(',', ':')) + ';'
                                             for key, value in values.items()) + '\n'
    text = module(model)
    lines = json.loads(subprocess.run(['node', 'scripts/catalogue-lines.mjs', '--print'], cwd=ROOT, check=True,
                                      capture_output=True, text=True).stdout)
    return {UNIVERSITY: uni_text, MODEL: text, VERSIONS: module(shared), ANNALS: module(annals),
            **{ROOT / path: value for path, value in lines.items()}}


def write(check=False):
    stale = []
    for path, text in generate().items():
        if path.exists() and path.read_text() == text:
            continue
        stale.append(path.relative_to(ROOT))
        if not check:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    return stale
