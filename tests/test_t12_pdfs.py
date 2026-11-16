"""The published T12 C/D PDFs (dist/resources/t12c-*, t12d-*) and their manifest records agree with content/tex/mada/t12/chapitres.json.

Run after `make site` (scripts/build-mada.py --t12). Catches a wrong build: a chapter in the wrong course or position, a teacher PDF
where no answers exist (or none where they do), a student PDF that carries answers, a missing Bac year, a PDF with the owner's name
or without the running footer on a page, metadata that names an author, or a leftover file that no record names."""
import json
from pathlib import Path
import re
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
T12 = ROOT / 'content/tex/mada/t12'
sys.path.insert(0, str(ROOT / 'build'))
sys.path.insert(0, str(ROOT / 'tests'))
import pymupdf  # noqa: E402
from mxbuild import t12  # noqa: E402

COURSES = {'t12c': 'C', 't12d': 'D'}
manifest = json.loads((ROOT / 'content/data/manifest.json').read_text(encoding='utf8'))
index = json.loads((T12 / 'chapitres.json').read_text(encoding='utf8'))
cat, comp = manifest['catalog'], manifest['companion']
DIST = ROOT / 'dist'


def pdf(path): return pymupdf.open(DIST / str(path).removeprefix('./'))


def text(document, skip_numbers=True):
    return ''.join(l.replace(' ', '') for p in document for l in p.get_text().splitlines() if not l.strip().isdigit())


class T12Pdfs(unittest.TestCase):
    def test_courses(self):
        for cid, title in (('t12c', 'T12 série C'), ('t12d', 'T12 série D')):
            course = next(c for c in cat['courses'] if c['id'] == cid)
            self.assertEqual((course['curriculum'], course['contentLanguage'], course['title'][0]), ('mg', 'fr', title))

    def test_chapters_follow_the_index(self):
        by_number = {c['number']: c for c in index['chapters']}
        for course in COURSES:
            order = index['courses'][course]
            chapters = sorted((c for c in cat['chapters'] if c['course'] == course), key=lambda c: c['number'])
            self.assertEqual([c['id'] for c in chapters], [f'{course}-{k:02d}' for k in range(1, len(order) + 1)])
            self.assertEqual([c['title'][0] for c in chapters], [by_number[n]['title'] for n in order])
            for position, number in enumerate(order, 1):
                cid = f'{course}-{position:02d}'
                files = {r['audience']: r for r in cat['resources'] if r['chapter'] == cid}
                self.assertIn('student', files)
                self.assertEqual('teacher' in files, bool(by_number[number]['answers']), f'{cid}: teacher PDF only where answers exist')
                self.assertEqual((DIST / f'resources/{cid}/teacher.pdf').exists(), bool(by_number[number]['answers']))
                self.assertEqual(sorted(f['kind'] for c in comp['chapters'] if c['id'] == cid for f in c['files']),
                                 ['chapter', 'teacher'] if by_number[number]['answers'] else ['chapter'])

    def test_student_edition_has_no_answers_and_teacher_has_more(self):
        by_number = {c['number']: c for c in index['chapters']}
        for course in COURSES:
            for position, number in enumerate(index['courses'][course], 1):
                cid = f'{course}-{position:02d}'
                student = pdf(f'resources/{cid}/chapter.pdf')
                self.assertGreater(len(student), 1, cid)
                self.assertNotRegex(student[1].get_text() + student[len(student) - 1].get_text(), r'Corrigé de l|Solution de l', cid)
                if by_number[number]['answers']:
                    teacher = pdf(f'resources/{cid}/teacher.pdf')
                    self.assertNotEqual(text(student), text(teacher), f'{cid}: the teacher edition must print the answers')
                    self.assertGreaterEqual(len(teacher), len(student))

    def test_supplements(self):
        for course, series in COURSES.items():
            ids = {s['id']: s for s in comp['supplements'] if s['course'] == course}
            self.assertIn(f'{course}-problems', ids); self.assertIn(f'{course}-annexes', ids)
            years = sorted(int(i.rsplit('-', 1)[1]) for i in ids if i.startswith(f'{course}-bac-'))
            self.assertEqual(years, list(range(2003, 2019)), f'{course}: Bac {series} statements, one per year')
            other = 'D' if series == 'C' else 'C'
            for year in years:
                s = ids[f'{course}-bac-{year}']
                self.assertEqual(s['title'][0], f'Baccalauréat série {series} {year}')
                first = pdf(s['files'][0]['path'])
                self.assertIn(f'série {series}, {year}', ' '.join(first[0].get_text().split()), f'{s["id"]}: attribution line')
                self.assertNotIn(f'série {other}', text(first).replace('série', 'série '))   # one series per course
                solved = next((b for b in index['bac'] if (b['series'], b['year']) == (series, year)), {}).get('solution')
                self.assertEqual(sorted(f['kind'] for f in s['files']), ['chapter', 'teacher'] if solved else ['chapter'], s['id'])
            for s in ids.values():
                for f in s['files']: self.assertTrue((DIST / f['path']).is_file(), f['path'])

    def test_every_record_has_its_file_and_no_file_is_orphan(self):
        named = set()
        for r in cat['resources']:
            if r['course'] in COURSES:
                named |= {DIST / e['path'].removeprefix('./') for e in r['editions'].values()}
                self.assertEqual(r['source'], 't12-student' if r['audience'] == 'student' else 't12-teacher')
        for s in comp['supplements']:
            if s['course'] in COURSES:
                named |= {DIST / e['path'] for f in s['files'] for e in f['editions'].values()}
        on_disk = {p for course in COURSES for p in (DIST / 'resources').glob(course + '-*') for p in ([p] if p.is_file() else p.rglob('*.pdf'))}
        self.assertEqual(on_disk, named)
        self.assertEqual({s['name'] for s in cat['sources'] if s['name'].startswith('t12-')}, {'t12-student', 't12-teacher'})

    def test_every_page_anonymous_with_footer(self):
        for path in sorted(on for course in COURSES for on in (DIST / 'resources').glob(course + '-*') for on in ([on] if on.is_file() else on.rglob('*.pdf'))):
            with pymupdf.open(path) as d:
                self.assertEqual(d.metadata.get('author'), '', path.name)
                # a chapter opening page has no footer: the first page of a file, or the page that opens the corrections chapter
                starts = {i for i, p in enumerate(d) if i == 0 or 'Corrigés du baccalauréat' in p.get_text()[:60]}
            self.assertEqual(t12.check_pdf(path, starts), [], path.name)


if __name__ == '__main__':
    unittest.main()
