"""Build the Algèbre 1 university course: web lessons and three XeLaTeX editions from one source per chapter.

Source: content/university/algebre-1/*.tex, a small LaTeX dialect (documented in that folder's README.md). The file is
parsed once into blocks; the HTML lessons and the LaTeX editions are both rendered from that tree, so numbering,
cross-references and wording agree everywhere. --check verifies the receipt without TeX.
"""
import argparse, hashlib, html, json, re, shutil, subprocess, tempfile, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'content/university/algebre-1'
OUT = ROOT / 'dist/resources/university/algebre-1'
RECEIPT = ROOT / 'content/data/algebre1-build.json'
SECTION = 'algebre-1'
FONTS = ROOT / 'content/tex/core/fonts'

# Mathematics macros: one table for MathJax and for LaTeX.
MACROS = {
    'N': (0, r'\mathbb{N}'), 'Z': (0, r'\mathbb{Z}'), 'Q': (0, r'\mathbb{Q}'), 'R': (0, r'\mathbb{R}'),
    'C': (0, r'\mathbb{C}'), 'K': (0, r'\mathbb{K}'), 'parties': (0, r'\mathcal{P}'), 'Card': (0, r'\operatorname{Card}'),
    'pgcd': (0, r'\operatorname{pgcd}'), 'ppcm': (0, r'\operatorname{ppcm}'), 'Ker': (0, r'\operatorname{Ker}'),
    'Img': (0, r'\operatorname{Im}'), 'Id': (0, r'\mathrm{Id}'), 'id': (0, r'\mathrm{id}'), 'GL': (0, r'\mathrm{GL}'),
    'SL': (0, r'\mathrm{SL}'), 'rg': (0, r'\operatorname{rang}'), 'Mat': (0, r'\mathcal{M}'), 'cl': (1, r'\overline{#1}'),
    'ens': (1, r'\{#1\}'), 'abs': (1, r'\left\lvert #1\right\rvert'), 'norm': (1, r'\left\lVert #1\right\rVert'),
    'sgn': (0, r'\varepsilon'), 'tr': (0, r'^{T}'), 'Vect': (0, r'\operatorname{L}'), 'Hom': (0, r'\operatorname{Hom}'),
}
KINDS = {  # name: (label, numbered, css/latex style)
    'definition': ('Définition', True, 'def'), 'theoreme': ('Théorème', True, 'thm'), 'proposition': ('Proposition', True, 'thm'),
    'lemme': ('Lemme', True, 'thm'), 'corollaire': ('Corollaire', True, 'thm'), 'exemple': ('Exemple', True, 'ex'),
    'methode': ('Méthode', False, 'meth'), 'remarque': ('Remarque', False, 'rem'), 'attention': ('Attention', False, 'warn'),
    'intuition': ('Intuition', False, 'idea'), 'essentiel': ('À retenir', False, 'key'), 'histoire': ('Repère historique', False, 'rem'),
}
SHORT = {'definition': 'Déf.', 'theoreme': 'Thm', 'proposition': 'Prop.', 'lemme': 'Lemme', 'corollaire': 'Cor.', 'exemple': 'Ex.', 'exo': 'Exercice'}
RUBRIQUES = {'A': 'Techniques', 'B': 'Preuves types', 'C': 'Décisions et contre-exemples', 'D': 'Problèmes de synthèse'}
LEVELS = {'S': 'Socle', 'A': 'Approfondissement', 'D': 'Défi'}
WIDGET_TITLES = {'venn': 'Opérations ensemblistes et diagrammes de Venn', 'maps': 'Injective, surjective, bijective ?',
                 'zn': 'Calculer dans ℤ/nℤ', 'lu': 'Élimination pas à pas : PA = LU', 'cayley': 'Tables de Cayley',
                 'perms': 'Atelier des permutations', 'dihedral': 'Le groupe diédral Dₙ'}
MATH_ENVS = ('align*', 'gather*', 'equation*')

# ------------------------------------------------------------------ parsing
def braced(s, i):
    """s[i] == '{': return (content, index after the closing brace)."""
    assert s[i] == '{', s[i:i + 40]
    depth, j = 0, i
    while j < len(s):
        c = s[j]
        if c == '\\': j += 2; continue
        if c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return s[i + 1:j], j + 1
        j += 1
    raise ValueError('Unbalanced brace near: ' + s[i:i + 60])

def bracketed(s, i):
    if i < len(s) and s[i] == '[':
        depth, j = 0, i
        while j < len(s):
            if s[j] == '[': depth += 1
            elif s[j] == ']':
                depth -= 1
                if depth == 0: return s[i + 1:j], j + 1
            elif s[j] == '{': j = braced(s, j)[1] - 1
            j += 1
    return None, i

def strip_comments(s):
    return '\n'.join(re.sub(r'(?<!\\)%.*$', '', line) for line in s.split('\n'))

BLOCK_ENVS = set(KINDS) | {'preuve', 'itemize', 'enumerate', 'objectifs', 'prerequis', 'exo', 'indication', 'corrige', 'erreurs', 'bilan', 'tabular', 'cadre'} | set(MATH_ENVS)
BLOCK_CMDS = ('chapitre', 'resume', 'summary', 'section', 'subsection', 'rubrique', 'exercices', 'widget', 'item', 'label')

def find_end(s, i, env):
    """Index of the matching \\end{env} for a body that starts at i."""
    depth, pat = 1, re.compile(r'\\(begin|end)\{' + re.escape(env) + r'\}')
    for m in pat.finditer(s, i):
        depth += 1 if m[1] == 'begin' else -1
        if depth == 0: return m.start(), m.end()
    raise ValueError('Missing \\end{' + env + '}')

def split_items(body):
    """Top-level \\item pieces of a list body (nested lists keep their own items)."""
    parts, depth, last = [], 0, None
    for m in re.finditer(r'\\(begin|end)\{[a-z*]+\}|\\item\b', body):
        if m[0].startswith(r'\begin'): depth += 1
        elif m[0].startswith(r'\end'): depth -= 1
        elif depth == 0:
            if last is not None: parts.append(body[last:m.start()])
            last = m.end()
    if last is not None: parts.append(body[last:])
    return parts

def parse(s):
    nodes, i, para = [], 0, []
    def flush():
        text = ''.join(para).strip()
        if text: nodes.append({'t': 'p', 'text': text})
        para.clear()
    while i < len(s):
        if s.startswith('\n\n', i) or (s[i] == '\n' and s[i + 1:i + 2].strip() == '' and '\n' in s[i + 1:i + 3]):
            flush(); i += 1; continue
        m = re.match(r'\\begin\{([a-z*]+)\}', s[i:])
        if m and m[1] in BLOCK_ENVS:
            flush(); env = m[1]; j = i + m.end()
            opts = []
            if env not in MATH_ENVS and env != 'tabular':
                while True:
                    o, j2 = bracketed(s, j)
                    if o is None: break
                    opts.append(o.strip()); j = j2
            arg = None
            if env == 'tabular': arg, j = braced(s, j)
            a, b = find_end(s, j, env)
            body = s[j:a]
            if env in MATH_ENVS: nodes.append({'t': 'math', 'text': s[i:b]})
            elif env == 'tabular': nodes.append({'t': 'table', 'spec': arg, 'rows': [[c.strip() for c in r.split('&')] for r in re.split(r'\\\\', body.replace(r'\hline', '')) if r.strip()]})
            elif env in ('itemize', 'enumerate', 'objectifs', 'erreurs', 'bilan'):
                items = [parse(x.strip()) for x in split_items(body)]
                nodes.append({'t': env, 'items': items})
            else:
                nodes.append({'t': env, 'opts': opts, 'body': parse(body)})
            i = b; continue
        m = re.match(r'\\(' + '|'.join(BLOCK_CMDS) + r')\b', s[i:])
        if m:
            cmd = m[1]; j = i + m.end()
            if cmd == 'label':
                key, j = braced(s, j); nodes.append({'t': 'label', 'key': key}); i = j; continue
            flush()
            if cmd == 'exercices': nodes.append({'t': 'exercices'}); i = j; continue
            opt, j = bracketed(s, j)
            args = []
            n = {'chapitre': 3, 'resume': 1, 'summary': 1, 'section': 1, 'subsection': 1, 'rubrique': 1, 'widget': 1, 'item': 0}[cmd]
            for _ in range(n):
                while s[j] in ' \n': j += 1
                a, j = braced(s, j); args.append(a)
            nodes.append({'t': cmd, 'opt': opt, 'args': args}); i = j; continue
        para.append(s[i]); i += 1
    flush()
    return nodes

# ------------------------------------------------------------------ numbering and labels
def number(chapters):
    labels = {}
    for ch in chapters:
        count = {'box': 0, 'exo': 0}
        prefix = ch['prefix']
        def walk(nodes, owner=None):
            for nd in nodes:
                t = nd['t']
                if t in KINDS and KINDS[t][1]:
                    count['box'] += 1; nd['num'] = f'{prefix}.{count["box"]}' if prefix else str(count['box'])
                    nd['anchor'] = f'{ch["id"]}-{count["box"]}'
                if t == 'exo':
                    count['exo'] += 1; nd['num'] = f'{prefix}.{count["exo"]}' if prefix else str(count['exo'])
                    nd['anchor'] = f'{ch["id"]}-exo-{count["exo"]}'
                if t == 'label' and owner is not None:
                    labels[nd['key']] = {'num': owner['num'], 'anchor': owner['anchor'], 'kind': owner['t'], 'page': ch['slide']}
                if 'body' in nd: walk(nd['body'], nd if ('num' in nd) else owner)
                for it in nd.get('items', []): walk(it, owner)
        walk(ch['nodes'])
    return labels

# ------------------------------------------------------------------ inline rendering

def french_spaces(t):
    t = re.sub(r'\s+([:;!?»])', '\u202f\\1', t)
    return re.sub(r'«\s+', '«\u202f', t)

def label_text(labels, key):
    if key not in labels: raise ValueError('Unknown reference: ' + key)
    L = labels[key]
    name = 'Exercice' if L['kind'] == 'exo' else KINDS[L['kind']][0]
    return name + '\u00a0' + L['num'], L

BREAK_AFTER = re.compile(r'\\(?:iff|Rightarrow|Longleftrightarrow|Leftrightarrow)(?![a-zA-Z])|(?<![<>!\\])=|\\subset(?![a-zA-Z])|\\le(?![a-zA-Z])')

def inline_math(m):
    """MathJax does not wrap inline formulas: a long one is cut after its top-level relations into several formulas
    joined by a zero-width space, with empty groups {} so that TeX keeps the spacing around each relation."""
    if len(m) < 48: return r'\(' + html.escape(m, quote=False) + r'\)'
    pieces, depth, last, i = [], 0, 0, 0
    while i < len(m):
        c = m[i]
        if c == '\\' and m.startswith(('\\left', '\\right'), i): depth += 1 if m.startswith('\\left', i) else -1
        if c == '{': depth += 1
        elif c == '}': depth -= 1
        elif depth == 0:
            mm = BREAK_AFTER.match(m, i)
            if mm and i - last > 12 and len(m) - mm.end() > 8:
                pieces.append(m[last:mm.end()] + '{}'); last = mm.end(); i = mm.end(); continue
        i += 1
    pieces.append(m[last:])
    return '\u200b'.join(r'\(' + ('{}' if k else '') + html.escape(x, quote=False) + r'\)' for k, x in enumerate(pieces))

def html_inline(s, labels, page):
    """One scanner for text, maths and inline commands (maths may sit inside \\textbf{...})."""
    res, i, n = [], 0, len(s)
    text = []
    def flush():
        if text: res.append(french_spaces(''.join(text))); text.clear()
    while i < n:
        c = s[i]
        if c == '$' :
            j = s.index('$', i + 1)
            while s[j - 1] == '\\': j = s.index('$', j + 1)
            flush(); res.append(inline_math(s[i + 1:j])); i = j + 1; continue
        if s.startswith(r'\[', i) or s.startswith(r'\(', i):
            close = r'\]' if s[i + 1] == '[' else r'\)'; j = s.index(close, i) + 2
            flush(); chunk = html.escape(s[i:j], quote=False)
            res.append('<span class="disp">' + chunk + '</span>' if close == r'\]' else chunk); i = j; continue
        if c == '\\':
            m = re.match(r'\\([a-zA-Z]+)\s*', s[i:])
            if not m:
                nxt = s[i + 1:i + 2]
                text.append({'\\': '\n', '%': '%', '&': '&amp;', '_': '_', '{': '{', '}': '}', ',': '\u202f', ' ': ' ', '$': '$'}.get(nxt, nxt))
                if nxt == '\\': text.pop(); flush(); res.append('<br>')
                i += 2; continue
            name = m[1]; j = i + len(m[0]) if name in ('og', 'fg', 'ldots', 'dots', 'quad', 'newline') else i + 1 + len(name)
            if name in ('textbf', 'emph', 'textit', 'voir', 'href', 'url', 'textsc', 'mbox', 'nom', 'site'):
                a, j = braced(s, j); flush()
                if name == 'textbf': res.append('<strong>' + html_inline(a, labels, page) + '</strong>')
                elif name in ('emph', 'textit'): res.append('<em>' + html_inline(a, labels, page) + '</em>')
                elif name in ('textsc', 'nom'): res.append('<span class="sc">' + html_inline(a, labels, page) + '</span>')
                elif name == 'mbox': res.append(html_inline(a, labels, page))
                elif name == 'url': res.append(f'<a href="{html.escape(a)}">{html.escape(a)}</a>')
                elif name == 'href':
                    b, j = braced(s, j); res.append(f'<a href="{html.escape(a)}">{html_inline(b, labels, page)}</a>')
                elif name == 'site':   # \site{lab/rubik}{text}: a page of the site, opened in the whole window (the lesson is in a frame)
                    b, j = braced(s, j); res.append(f'<a class="site-link" href="../../../../index.html#{html.escape(a)}" target="_top">{html_inline(b, labels, page)}</a>')
                else:
                    t, L = label_text(labels, a)
                    href = ('' if L['page'] == page else L['page']) + '#' + L['anchor']
                    res.append(f'<a class="xref" href="{href}">{html.escape(t)}</a>')
                i = j; continue
            sym = {'og': '«\u202f', 'fg': '\u202f»', 'ldots': '…', 'dots': '…', 'quad': '\u2003', 'newline': ''}
            if name in sym:
                if name == 'newline': flush(); res.append('<br>')
                else: text.append(sym[name])
                i = j; continue
            raise ValueError(f'Unsupported command \\{name} in: {s[i:i + 60]!r}')
        if c == '~': text.append('\u00a0'); i += 1; continue
        if c in '{}': i += 1; continue
        text.append(html.escape(c, quote=False)); i += 1
    flush()
    return ''.join(res)

def tex_inline(s, labels):
    def voir(m):
        text, _ = label_text(labels, m[1]); return r'\hyperlink{' + labels[m[1]]['anchor'] + '}{' + text.replace('\u00a0', '~') + '}'
    s = re.sub(r'\\voir\{([^}]*)\}', voir, s)
    s = re.sub(r'\\site\{[^}]*\}\{([^}]*)\}', lambda m: r'\emph{' + m[1] + r'} (site Matematika)', s)
    s = s.replace(r'\nom{', r'\textsc{')
    return s

# ------------------------------------------------------------------ HTML
def text_of(nodes):
    return ' '.join(nd.get('text', '') for nd in nodes if nd['t'] == 'p')

def box_opts(nd):
    """Optional box title."""
    return (nd['opts'] + [None])[0] or None

def html_blocks(nodes, ctx):
    out = []
    labels, page = ctx['labels'], ctx['page']
    inl = lambda s: html_inline(s, labels, page)
    for nd in nodes:
        t = nd['t']
        if t == 'p': out.append('<p>' + inl(nd['text']) + '</p>')
        elif t == 'math': out.append('<div class="formula">' + html.escape(nd['text'], quote=False) + '</div>')
        elif t == 'label': pass
        elif t == 'section':
            ctx['sec'] += 1; anchor = f's{ctx["sec"]}'; ctx['toc'].append((2, anchor, nd['args'][0]))
            out.append(f'<h2 id="{anchor}"><span class="secnum">§{ctx["prefix"] + "." if ctx["prefix"] else ""}{ctx["sec"]}</span> {inl(nd["args"][0])}</h2>')
            ctx['sub'] = 0
        elif t == 'subsection':
            ctx['sub'] += 1; anchor = f's{ctx["sec"]}-{ctx["sub"]}'; ctx['toc'].append((3, anchor, nd['args'][0]))
            out.append(f'<h3 id="{anchor}">{inl(nd["args"][0])}</h3>')
        elif t in ('itemize', 'enumerate'):
            tag = 'ul' if t == 'itemize' else 'ol'
            out.append(f'<{tag}>' + ''.join('<li>' + html_blocks(it, ctx) + '</li>' for it in nd['items']) + f'</{tag}>')
        elif t == 'table':
            rows = nd['rows']
            out.append('<div class="tablewrap"><table><thead><tr>' + ''.join(f'<th scope="col">{inl(c)}</th>' for c in rows[0]) + '</tr></thead><tbody>' +
                       ''.join('<tr>' + ''.join(f'<td>{inl(c)}</td>' for c in r) + '</tr>' for r in rows[1:]) + '</tbody></table></div>')
        elif t in KINDS:
            label, numbered, style = KINDS[t]
            title = box_opts(nd)
            head = f'<span class="kind">{label}{(" " + nd["num"]) if numbered else ""}</span>' + (f'<span class="btitle">{inl(title)}</span>' if title else '') 
            idattr = f' id="{nd["anchor"]}"' if 'anchor' in nd else ''
            out.append(f'<div class="box box-{style}"{idattr}><p class="bhead">{head}</p>{html_blocks(nd["body"], ctx)}</div>')
        elif t == 'preuve':
            title = nd['opts'][0] if nd['opts'] else 'Démonstration'
            out.append(f'<details class="proof" open><summary>{inl(title)}</summary>{html_blocks(nd["body"], ctx)}<p class="qed" aria-hidden="true">□</p></details>')
        elif t == 'cadre': out.append('<div class="cadre">' + html_blocks(nd['body'], ctx) + '</div>')
        elif t == 'widget':
            name = nd['args'][0]; mode = f' data-mode="{nd["opt"]}"' if nd['opt'] else ''
            ctx['widgets'] += 1
            out.append(f'<figure class="widget" data-a1-widget="{name}"{mode}><noscript>La figure interactive « {WIDGET_TITLES[name]} » demande JavaScript.</noscript></figure>')
        elif t == 'exercices':
            ctx['toc'].append((2, 'exercices', 'Exercices et problèmes'))
            out.append('<section class="exercises" id="exercices" aria-labelledby="exercices-h"><h2 id="exercices-h"><span class="secnum">✎</span> Exercices et problèmes</h2>'
                       '<p class="lede">Quatre rubriques : <strong>A</strong> techniques à automatiser, <strong>B</strong> preuves types à savoir rédiger, <strong>C</strong> décisions (vrai ou faux, avec preuve ou contre-exemple), <strong>D</strong> problèmes de synthèse. Niveaux : <span class="lvl lvl-S">S</span> socle, indispensable ; <span class="lvl lvl-A">A</span> approfondissement ; <span class="lvl lvl-D">D</span> défi. Cherche avant d’ouvrir l’indication, puis rédige avant de lire le corrigé.</p>'
                       '<div class="filters" role="group" aria-label="Filtrer les exercices"><span>Niveau</span>' + ''.join(f'<button type="button" data-level="{k}" aria-pressed="true">{k}</button>' for k in LEVELS) +
                       '<span>Rubrique</span>' + ''.join(f'<button type="button" data-rub="{k}" aria-pressed="true">{k}</button>' for k in RUBRIQUES) +
                       '<label><input type="checkbox" data-hide-done> masquer les exercices maîtrisés</label><output class="progress" aria-live="polite"></output></div>')
            ctx['in_ex'] = True
        elif t == 'rubrique':
            k = nd['args'][0]; ctx['rub'] = k; ctx['toc'].append((3, f'rub-{k}', f'{k}. {RUBRIQUES[k]}'))
            out.append(f'<h3 class="rub" id="rub-{k}" data-rub-head="{k}"><span class="rubk">{k}</span> {RUBRIQUES[k]}</h3>')
        elif t == 'exo':
            level, title = (nd['opts'] + ['S', ''])[:2]
            parts = {'indication': [], 'corrige': []}; body = []
            for x in nd['body']:
                (parts[x['t']] if x['t'] in parts else body).append(x)
            ctx['exos'] += 1
            extra = ''.join(f'<details class="{k}"><summary>{"Indication" if k == "indication" else "Corrigé détaillé"}</summary>{html_blocks(v[0]["body"], ctx)}</details>' for k, v in parts.items() if v)
            out.append(f'<article class="exo" id="{nd["anchor"]}" data-level="{level}" data-rub="{ctx["rub"]}"><header><span class="lvl lvl-{level}" title="{LEVELS[level]}">{level}</span><h4>Exercice {nd["num"]}{(" · " + inl(title)) if title else ""}</h4>'
                       f'<label class="done"><input type="checkbox" data-done="{nd["anchor"]}"> je sais le refaire seul</label></header>{html_blocks(body, ctx)}{extra}</article>')
        elif t == 'erreurs':
            out.append('<div class="box box-warn errors"><p class="bhead"><span class="kind">Erreurs fréquentes</span></p><ul>' + ''.join('<li>' + html_blocks(it, ctx) + '</li>' for it in nd['items']) + '</ul></div>')
        elif t == 'bilan':
            ctx['toc'].append((2, 'bilan', 'Bilan : je sais faire'))
            out.append('<section class="bilan" id="bilan"><h2><span class="secnum">✓</span> Bilan : je sais faire, à froid et sans notes</h2><ul>' +
                       ''.join(f'<li><label><input type="checkbox" data-done="{ctx["page"]}-bilan-{k}"> <span>{html_blocks(it, ctx)}</span></label></li>' for k, it in enumerate(nd['items'])) + '</ul></section>')
        elif t in ('chapitre', 'resume', 'summary', 'objectifs', 'prerequis'): pass
        else: raise ValueError('Unhandled node ' + t)
    return ''.join(out)

ASSETS = {'css': ROOT / 'site/styles/algebra1.css', 'js': ROOT / 'site/js/algebra1-widgets.js', 'model': ROOT / 'site/js/algebra1-model.js'}

def version(*keys):
    """Cache-busting suffix: the lesson pages are static files outside the site's versioned import map."""
    h = hashlib.sha256()
    for k in keys: h.update(ASSETS[k].read_bytes())
    return '?v=' + h.hexdigest()[:12]

def page_html(ch, chapters, labels, pdfs):
    ctx = {'labels': labels, 'page': ch['slide'], 'toc': [], 'sec': 0, 'sub': 0, 'rub': 'A', 'exos': 0, 'widgets': 0, 'prefix': ch['prefix'], 'in_ex': False}
    body = html_blocks(ch['nodes'], ctx)
    meta = ch['meta']; inl = lambda s: html_inline(s, labels, ch['slide'])
    get = lambda t: next((n for n in ch['nodes'] if n['t'] == t), None)
    obj, pre = get('objectifs'), get('prerequis')
    i = chapters.index(ch)
    prev, nxt = (chapters[i - 1] if i else None), (chapters[i + 1] if i + 1 < len(chapters) else None)
    kicker = f'Chapitre {ch["prefix"]}' if ch['prefix'] else ch['kicker']
    counts = {k: 0 for k in ('def', 'thm', 'exo')}
    def count(nodes):
        for nd in nodes:
            if nd['t'] == 'definition': counts['def'] += 1
            if nd['t'] in ('theoreme', 'proposition', 'lemme', 'corollaire'): counts['thm'] += 1
            if nd['t'] == 'exo': counts['exo'] += 1
            count(nd.get('body', []))
    count(ch['nodes'])
    facts = [f'{counts["def"]} définitions' if counts['def'] else '', f'{counts["thm"]} résultats' if counts['thm'] else '', f'{counts["exo"]} exercices corrigés' if counts['exo'] else '', f'{ctx["widgets"]} figure{"s" if ctx["widgets"] > 1 else ""} à manipuler' if ctx['widgets'] else '']
    toc = ''.join(f'<li class="toc{lvl}"><a href="#{a}">{inl(title)}</a></li>' for lvl, a, title in ctx['toc'])
    chapters_nav = ''.join(f'<li><a href="{c["slide"]}"{" aria-current=page" if c is ch else ""}>{(c["prefix"] + ". ") if c["prefix"] else ""}{html.escape(c["meta"]["title"][0])}</a></li>' for c in chapters)
    macros = json.dumps({k: [v[1], v[0]] if v[0] else v[1] for k, v in MACROS.items()}, ensure_ascii=False)
    n_ex = counts['exo']
    entry = ('<nav class="entry" aria-label="Cours et exercices">'
             '<a class="entry-main" href="#cours"><strong>Cours</strong><span>définitions, résultats, démonstrations</span></a>'
             + (f'<a class="entry-main" href="#exercices"><strong>Exercices</strong><span>{n_ex} exercices corrigés, par niveau</span></a>' if n_ex else '')
             + '</nav>')
    hero = f'''<header class="hero"><p class="kicker">{kicker}</p><h1>{html.escape(meta["title"][0])}</h1><p class="lede">{inl(get("resume")["args"][0]) if get("resume") else ""}</p>
<p class="facts">{" · ".join(f for f in facts if f)}</p>
{entry}<div class="hero-grid">{f'<div><h2 class="mini">Objectifs</h2><ul>{"".join("<li>" + html_blocks(it, ctx) + "</li>" for it in obj["items"])}</ul></div>' if obj else ''}{f'<div><h2 class="mini">Prérequis</h2>{html_blocks(pre["body"], ctx)}</div>' if pre else ''}</div></header>'''
    link = lambda c, rel, text: f'<a href="{c["slide"]}" rel="{rel}">{text}</a>'
    nav = ('<nav class="pager" aria-label="Chapitres voisins">' + (link(prev, 'prev', '← ' + html.escape(prev['meta']['title'][0])) if prev else '<span></span>')
           + (link(nxt, 'next', html.escape(nxt['meta']['title'][0]) + ' →') if nxt else '') + '</nav>')
    downloads = ''.join(f'<li><a href="../{f}">{label}</a></li>' for f, label in pdfs)
    return f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(meta["title"][0])} · Algèbre 1 · Matematika</title>
<meta name="description" content="{html.escape(meta["summary"][0])}">
<script>try{{if(window.top!==window.self)document.documentElement.classList.add('embedded')}}catch(e){{}}</script>
<script>try{{var t=localStorage.getItem('maths-explorer-theme');if(t==='jour'||t==='nuit')document.documentElement.dataset.theme=t}}catch(e){{}}</script>
<link rel="stylesheet" href="../../../../styles/algebra1.css{version('css')}">
<script>window.MathJax={{tex:{{inlineMath:[['\\\\(','\\\\)']],displayMath:[['\\\\[','\\\\]']],macros:{macros}}},svg:{{fontCache:'global'}},options:{{enableAssistiveMml:true}}}};</script>
<script defer src="../../../../vendor/mathjax-tex-svg.js"></script>
<script type="module" src="../../../../js/algebra1-widgets.js{version('js', 'model')}"></script>
</head><body>
<a class="skip" href="#main">Aller au contenu</a>
<div class="topbar"><a class="brand" href="../../../../index.html#university">Matematika</a><span class="crumbs"><a href="../../../../index.html#university">Université</a> / <a href="index.html">Algèbre 1</a></span><button type="button" class="theme" data-theme-toggle aria-label="Changer de thème"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/></svg></button></div>
<div class="layout">
<aside class="rail" aria-label="Sommaire"><details open class="railbox"><summary>Dans ce chapitre</summary><ol class="toc">{toc}</ol></details>
<details class="railbox host-only"><summary>Tous les chapitres</summary><ol class="chapters">{chapters_nav}</ol></details>
<details class="railbox host-only"><summary>Télécharger (PDF)</summary><ul class="dl">{downloads}</ul></details></aside>
<main id="main">{hero}<div id="cours" class="course">{body}</div>{nav}</main></div>
<footer class="foot"><p>Algèbre 1 · cours de première année de licence · Matematika. Textes, démonstrations, figures et exercices originaux.</p></footer>
<script>{PAGE_SCRIPT}</script>
</body></html>
'''

PAGE_SCRIPT = r"""(function(){
var K='algebre1-progress',store={};try{store=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(store))}catch(e){}}
var boxes=[].slice.call(document.querySelectorAll('[data-done]'));
boxes.forEach(function(b){b.checked=!!store[b.dataset.done];b.addEventListener('change',function(){if(b.checked)store[b.dataset.done]=1;else delete store[b.dataset.done];save();apply();})});
var levels={S:1,A:1,D:1},rubs={A:1,B:1,C:1,D:1},hide=document.querySelector('[data-hide-done]');
document.querySelectorAll('[data-level],[data-rub]').forEach(function(b){if(b.tagName!=='BUTTON')return;b.addEventListener('click',function(){var map=b.dataset.level?levels:rubs,k=b.dataset.level||b.dataset.rub;map[k]=!map[k];b.setAttribute('aria-pressed',String(!!map[k]));apply();})});
if(hide)hide.addEventListener('change',apply);
function apply(){var ex=[].slice.call(document.querySelectorAll('article.exo')),shown=0,done=0;
ex.forEach(function(a){var cb=a.querySelector('[data-done]'),d=cb&&cb.checked;if(d)done++;var on=levels[a.dataset.level]&&rubs[a.dataset.rub]&&!(hide&&hide.checked&&d);a.hidden=!on;if(on)shown++;a.classList.toggle('is-done',!!d)});
document.querySelectorAll('[data-rub-head]').forEach(function(h){h.hidden=!rubs[h.dataset.rubHead]});
var o=document.querySelector('.progress');if(o)o.textContent=done+' / '+ex.length+' maîtrisés · '+shown+' affichés';}
apply();
var tg=document.querySelector('[data-theme-toggle]');if(tg)tg.addEventListener('click',function(){var r=document.documentElement,cur=r.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'nuit':'jour'),n=cur==='nuit'?'jour':'nuit';r.dataset.theme=n;try{localStorage.setItem('maths-explorer-theme',n)}catch(e){}});
var links=[].slice.call(document.querySelectorAll('.toc a')),targets=links.map(function(a){return document.getElementById(a.getAttribute('href').slice(1))});
if('IntersectionObserver'in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=targets.indexOf(e.target);links.forEach(function(l,k){l.classList.toggle('is-here',k===i)})}})},{rootMargin:'0px 0px -70% 0px'});targets.forEach(function(t){t&&io.observe(t)})}
if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t){var d=t.closest('article.exo');if(d)d.hidden=false}}
})();"""

# ------------------------------------------------------------------ LaTeX
def tex_blocks(nodes, ctx, edition):
    out = []; L = ctx['labels']; inl = lambda s: tex_inline(s, L)
    for nd in nodes:
        t = nd['t']
        if t == 'exercices':
            ctx['in_ex'] = True
            if edition != 'cours': out.append(r'\section*{Exercices et problèmes}\addcontentsline{toc}{section}{Exercices et problèmes}' + '\n')
            continue
        if t in ('erreurs', 'bilan') and edition != 'cours': continue
        if ctx['in_ex'] and edition == 'cours' and t not in ('erreurs', 'bilan'): continue
        if not ctx['in_ex'] and edition != 'cours' and t not in ('chapitre',): continue
        if t == 'p': out.append(inl(nd['text']) + '\n\n')
        elif t == 'math': out.append(nd['text'] + '\n')
        elif t == 'label': pass
        elif t == 'section': out.append(r'\section' + ctx['star'] + '{' + inl(nd['args'][0]) + '}\n')
        elif t == 'subsection': out.append(r'\subsection' + ctx['star'] + '{' + inl(nd['args'][0]) + '}\n')
        elif t in ('itemize', 'enumerate'):
            out.append(r'\begin{' + t + '}\n' + ''.join(r'\item ' + tex_blocks(it, ctx, edition) for it in nd['items']) + r'\end{' + t + '}\n')
        elif t == 'table':
            rows = nd['rows']
            n = len(rows[0]); col = r'>{\raggedright\arraybackslash}p{%.3f\linewidth}' % ((0.98 - 0.04 * n) / n)
            out.append(r'\begin{center}\small\begin{tabular}{' + col * n + r'}\toprule ' + ' & '.join(inl(c) for c in rows[0]) + r'\\\midrule ' + ''.join(' & '.join(inl(c) for c in r) + r'\\' for r in rows[1:]) + r'\bottomrule\end{tabular}\end{center}' + '\n')
        elif t in KINDS:
            label, numbered, style = KINDS[t]
            title = box_opts(nd)
            head = label + ((' ' + nd['num']) if numbered else '') + ((r' \textperiodcentered{} ' + inl(title)) if title else '')
            anchor = r'\hypertarget{' + nd['anchor'] + '}{}' if 'anchor' in nd else ''
            out.append(r'\begin{a1box}{' + style + '}{' + head + '}' + anchor + '\n' + tex_blocks(nd['body'], ctx, edition) + r'\end{a1box}' + '\n')
        elif t == 'preuve':
            out.append(r'\begin{a1proof}{' + inl(nd['opts'][0] if nd['opts'] else 'Démonstration') + '}\n' + tex_blocks(nd['body'], ctx, edition) + r'\end{a1proof}' + '\n')
        elif t == 'cadre': out.append(r'\begin{a1box}{key}{}' + tex_blocks(nd['body'], ctx, edition) + r'\end{a1box}' + '\n')
        elif t == 'widget':
            title = WIDGET_TITLES[nd['args'][0]].replace('ℤ/nℤ', r'$\Z/n\Z$').replace('Dₙ', r'$D_n$')
            out.append(r'\begin{a1box}{web}{Figure interactive \textperiodcentered{} ' + title + r'}Cette figure se manipule dans la version web de la leçon (site Matematika, rubrique Université, Algèbre~1).' + r'\end{a1box}' + '\n')
        elif t == 'rubrique':
            k = nd['args'][0]; out.append(r'\subsection*{' + k + '. ' + RUBRIQUES[k] + '}\n')
        elif t == 'exo':
            level, title = (nd['opts'] + ['S', ''])[:2]
            body = [x for x in nd['body'] if x['t'] not in ('indication', 'corrige')]
            out.append(r'\begin{a1exo}{' + nd['num'] + '}{' + level + '}{' + inl(title) + '}' + r'\hypertarget{' + nd['anchor'] + '}{}\n' + tex_blocks(body, ctx, edition))
            for x in nd['body']:
                if x['t'] == 'indication' and edition == 'exercices': out.append(r'\begin{a1sol}{Indication}' + tex_blocks(x['body'], ctx, edition) + r'\end{a1sol}' + '\n')
                if x['t'] == 'corrige' and edition == 'corriges': out.append(r'\begin{a1sol}{Corrigé}' + tex_blocks(x['body'], ctx, edition) + r'\end{a1sol}' + '\n')
            out.append(r'\end{a1exo}' + '\n')
        elif t == 'erreurs':
            out.append(r'\begin{a1box}{warn}{Erreurs fréquentes}\begin{itemize}' + ''.join(r'\item ' + tex_blocks(it, ctx, edition) for it in nd['items']) + r'\end{itemize}\end{a1box}' + '\n')
        elif t == 'bilan':
            out.append(r'\section*{Bilan : je sais faire, à froid et sans notes}\begin{itemize}[label=$\square$]' + ''.join(r'\item ' + tex_blocks(it, ctx, edition) for it in nd['items']) + r'\end{itemize}' + '\n')
        elif t in ('chapitre', 'resume', 'summary', 'objectifs', 'prerequis', 'indication', 'corrige'): pass
        else: raise ValueError('Unhandled node ' + t)
    return ''.join(out)

EDITIONS = {'cours': 'Cours : définitions, théorèmes et démonstrations', 'exercices': 'Exercices et problèmes, avec indications', 'corriges': 'Exercices et problèmes corrigés'}

def tex_document(chapters, labels, edition):
    sty = (SOURCE / 'algebre1.sty').read_text()
    macros = ''.join((r'\providecommand{\%s}{}\renewcommand{\%s}%s{%s}' % (k, k, f'[{n}]' if n else '', body)) + '\n' for k, (n, body) in MACROS.items())
    doc = r'\documentclass[11pt,a4paper,oneside]{book}' + '\n' + r'\usepackage{algebre1}' + '\n' + macros
    doc += r'\begin{document}\algtitle{' + EDITIONS[edition] + '}\n'
    for ch in chapters:
        if edition != 'cours' and not any(n['t'] == 'exercices' for n in ch['nodes']): continue
        num = ch['prefix']
        ctx = {'labels': labels, 'in_ex': False, 'star': '' if num else '*'}
        doc += (r'\chapter{' if num else r'\chapter*{') + ch['meta']['title'][0] + '}' + ('' if num else r'\addcontentsline{toc}{chapter}{' + ch['meta']['title'][0] + '}') + r'\markboth{' + ch['meta']['title'][0] + '}{}\n'
        if edition == 'cours':
            res = next((n for n in ch['nodes'] if n['t'] == 'resume'), None)
            if res: doc += r'{\large\itshape ' + tex_inline(res['args'][0], labels) + r'\par}\medskip' + '\n'
            obj = next((n for n in ch['nodes'] if n['t'] == 'objectifs'), None)
            if obj: doc += r'\begin{a1box}{key}{Objectifs}\begin{itemize}' + ''.join(r'\item ' + tex_blocks(it, ctx, edition) for it in obj['items']) + r'\end{itemize}\end{a1box}' + '\n'
            pre = next((n for n in ch['nodes'] if n['t'] == 'prerequis'), None)
            if pre: doc += r'\begin{a1box}{rem}{Prérequis}' + tex_blocks(pre['body'], ctx, edition) + r'\end{a1box}' + '\n'
        doc += tex_blocks(ch['nodes'], ctx, edition)
    return doc + r'\end{document}' + '\n', sty

def compile_tex(name, doc, sty):
    with tempfile.TemporaryDirectory(prefix='mx-algebre1-') as tmp:
        p = Path(tmp); (p / (name + '.tex')).write_text(doc); (p / 'algebre1.sty').write_text(sty.replace('FONTPATH', str(FONTS) + '/'))
        for _ in range(3):
            r = subprocess.run(['xelatex', '-interaction=nonstopmode', '-halt-on-error', name + '.tex'], cwd=p, capture_output=True, text=True)
            if r.returncode: raise RuntimeError(r.stdout[-6000:])
        log = (p / (name + '.log')).read_text(errors='replace')
        bad = [s for s in log.splitlines() if 'Missing character' in s or ('Overfull' in s and float(re.search(r'\(([\d.]+)pt', s)[1]) > 6)]
        if bad: raise RuntimeError(name + ':\n' + '\n'.join(bad[:30]))
        import pymupdf
        d = pymupdf.open(p / (name + '.pdf'))
        d.set_metadata({'title': 'Algèbre 1 : ' + EDITIONS[name], 'author': '', 'subject': 'Ensembles, matrices, espaces vectoriels, groupes, anneaux', 'keywords': '', 'creator': '', 'producer': ''})
        d.del_xml_metadata(); d.save(OUT / (name + '.pdf'), garbage=4, deflate=True); d.close()

# ------------------------------------------------------------------ driver
def load():
    manifest = json.loads((ROOT / 'content/data/manifest.json').read_text())
    section = next(s for s in manifest['university']['sections'] if s['id'] == SECTION)
    chapters = []
    for seq in section['sequences']:
        src = strip_comments((SOURCE / seq['source']).read_text())
        nodes = parse(src)
        head = next(n for n in nodes if n['t'] == 'chapitre')
        number_, title, title_en = head['args']
        summary = next((n['args'][0] for n in nodes if n['t'] == 'resume'), '')
        summary_en = next((n['args'][0] for n in nodes if n['t'] == 'summary'), '')
        pre = next((n for n in nodes if n['t'] == 'prerequis'), None)
        meta = {'title': [title, title_en], 'summary': [plain(summary), plain(summary_en)],
                'prerequisites': [plain(text_of(pre['body'])) if pre else 'Aucun.', head['opt'] or 'See the French text.']}
        chapters.append({'id': seq['id'], 'slide': seq['slide'], 'nodes': nodes, 'prefix': number_ if number_.isdigit() else '', 'kicker': number_ if not number_.isdigit() else '', 'meta': meta})
    return section, chapters

def digest():
    h = hashlib.sha256()
    for p in sorted(SOURCE.rglob('*')) + [Path(__file__), *ASSETS.values()]:
        if p.is_file(): h.update(p.relative_to(ROOT).as_posix().encode()); h.update(p.read_bytes())
    manifest = json.loads((ROOT / 'content/data/manifest.json').read_text())
    h.update(json.dumps(next(s for s in manifest['university']['sections'] if s['id'] == SECTION), sort_keys=True, ensure_ascii=False).encode())
    return h.hexdigest()

UNICODE = {r'\Z': 'ℤ', r'\R': 'ℝ', r'\C': 'ℂ', r'\N': 'ℕ', r'\Q': 'ℚ', r'\K': '𝕂', r'\GL': 'GL', r'\SL': 'SL', r'\times': '×', r'\setminus': '∖',
           r'\infty': '∞', r'\sigma': 'σ', r'\mathfrak': '', r'\leq': '≤', r'\neq': '≠', r'\in': '∈', r'\cdot': '·', r'\to': '→'}

def plain(s):
    """Readable text for site cards and outlines: maths turned into Unicode, markup removed."""
    def maths(m):
        t = m[1]
        for k, v in sorted(UNICODE.items(), key=lambda x: -len(x[0])): t = re.sub(re.escape(k) + r'(?![a-zA-Z])', v, t)
        t = re.sub(r'\\cl\{([^}]*)\}', r'\1̄', t)
        t = re.sub(r'_\{?([0-9nkij])\}?', lambda m: dict(zip('0123456789nkij', '₀₁₂₃₄₅₆₇₈₉ₙₖᵢⱼ'))[m[1]], t)
        return re.sub(r'[{}\\]', '', t)
    s = re.sub(r'\$([^$]*)\$', maths, s)
    s = re.sub(r'\\(?:og|fg)\b\s*(\{\})?', lambda m: '«' if 'og' in m[0] else '»', s)
    s = re.sub(r'\\[a-zA-Z]+\{([^}]*)\}', r'\1', s)
    return re.sub(r'\s+', ' ', s.replace('~', ' ')).strip()

def count_exos(nodes):
    return sum((nd['t'] == 'exo') + count_exos(nd.get('body', [])) for nd in nodes)

def outline(ch):
    return [plain(n['args'][0]) for n in ch['nodes'] if n['t'] == 'section']

def build(check=False, web_only=False):
    if check:
        saved = json.loads(RECEIPT.read_text()); assert saved['sourceDigest'] == digest(), 'Algèbre 1 sources changed: run python3 scripts/build-algebre1.py'
        for p, hsh in saved['outputs'].items(): assert hashlib.sha256((ROOT / p).read_bytes()).hexdigest() == hsh, p
        print('Algèbre 1: source fingerprint and published file hashes match.'); return
    section, chapters = load()
    labels = number(chapters)
    (OUT / 'lecons').mkdir(parents=True, exist_ok=True)
    pdfs = [('cours.pdf', 'Cours complet'), ('exercices.pdf', 'Exercices avec indications'), ('corriges.pdf', 'Exercices corrigés')]
    for ch in chapters:
        (OUT / 'lecons' / ch['slide']).write_text(page_html(ch, chapters, labels, pdfs))
    if not web_only:
        for edition in EDITIONS:
            doc, sty = tex_document(chapters, labels, edition)
            compile_tex(edition, doc, sty)
        with zipfile.ZipFile(OUT / 'sources-latex.zip', 'w', zipfile.ZIP_DEFLATED) as z:
            for edition in EDITIONS:
                doc, sty = tex_document(chapters, labels, edition)
                z.writestr(f'{edition}.tex', doc)
            z.writestr('algebre1.sty', (SOURCE / 'algebre1.sty').read_text().replace('FONTPATH', './fonts/'))
            for p in sorted(SOURCE.glob('*.tex')): z.write(p, 'source/' + p.name)
            z.write(SOURCE / 'README.md', 'source/README.md')
            for f in ('STIXTwoText-Regular.otf', 'STIXTwoText-Italic.otf', 'STIXTwoText-Bold.otf', 'STIXTwoText-BoldItalic.otf', 'STIXTwoText-SemiBold.otf', 'STIXTwoMath-Regular.otf', 'LICENSE-stix-two-text.txt'):
                z.write(FONTS / f, 'fonts/' + f)
            z.writestr('LISEZMOI.txt', 'Algèbre 1 : trois éditions LaTeX autonomes (cours, exercices, corrigés) produites par scripts/build-algebre1.py\n'
                       'depuis les sources du dossier source/. Compiler chaque fichier .tex trois fois avec XeLaTeX ; les polices STIX Two sont dans fonts/.\n')
    outputs = {p.relative_to(ROOT).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(OUT.rglob('*')) if p.is_file()}
    sequences = {ch['id']: dict(ch['meta'], outline=outline(ch), exercises=count_exos(ch['nodes'])) for ch in chapters}
    RECEIPT.write_text(json.dumps({'sourceDigest': digest(), 'sequences': sequences, 'outputs': outputs}, ensure_ascii=False, indent=2) + '\n')
    print(f'Algèbre 1: {len(chapters)} web lessons' + ('' if web_only else ', three PDF editions and LaTeX sources') + ' built.')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--check', action='store_true'); ap.add_argument('--web', action='store_true', help='web pages only (drafting)')
    a = ap.parse_args(); build(a.check, a.web)
