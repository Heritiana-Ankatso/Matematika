// The one MathJax loader of the site (chapter pages, banks, generators, Olympiad): MathJax is fetched the first time a
// formula is typeset, never before, and the formulas are typeset in place; printMarkup prints a block of markup alone.
// The macro table between the mx-math markers is written by build/mxbuild/notation.py.
let mathPromise = null;
export function loadMath() {
  if (window.MathJax?.typesetPromise) return window.MathJax.startup?.promise || Promise.resolve();
  return (mathPromise ||= new Promise((ok, fail) => {
    if (!window.MathJax) window.MathJax = { startup: { typeset: false }, svg: { fontCache: 'none' }, options: { enableAssistiveMml: true }, tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']], macros: {pgcd:'\\operatorname{PGCD}',ppcm:'\\operatorname{PPCM}',/*mx-math*/"N":"\\mathbb{N}","Z":"\\mathbb{Z}","D":"\\mathbb{D}","Q":"\\mathbb{Q}","R":"\\mathbb{R}","C":"\\mathbb{C}","vect":["\\overrightarrow{#1}",1],"vi":"\\vec{\\imath}","vj":"\\vec{\\jmath}","vk":"\\vec{k}","norm":["\\left\\lVert #1\\right\\rVert",1],"vc":["\\begin{pmatrix}#1\\\\#2\\end{pmatrix}",2],"deter":["\\det\\left(#1,#2\\right)",2],"abs":["\\left\\lvert #1\\right\\rvert",1],"dd":"\\,\\mathrm{d}","e":"\\mathrm{e}","Card":"\\operatorname{Card}","E":"\\operatorname{E}","V":"\\operatorname{V}","degre":"^{\\circ}","un":["\\,\\mathrm{#1}",1],"sci":["#1\\times10^{#2}",2],"llbracket":"\\mathopen{[\\mkern-3mu[}","rrbracket":"\\mathclose{]\\mkern-3mu]}"/*end mx-math*/} } };
    const s = document.createElement('script');
    s.src = './vendor/mathjax-tex-svg.js?v=3.2.2-full'; s.onload = () => (window.MathJax.startup?.promise || Promise.resolve()).then(ok, ok); s.onerror = () => { mathPromise = null; fail(new Error('MathJax')); };
    document.head.append(s);
  }));
}
export async function typeset(root) {
  try { await loadMath(); if (root && root.isConnected === false) return; await window.MathJax.typesetPromise([root]); } catch { /* the text stays readable as plain LaTeX */ }
}

// Prints a block of markup alone: it is mounted in .print-doc, the rest of the page is hidden by print.css rules.
export async function printMarkup(markup) {
  document.querySelector('.print-doc')?.remove();
  const host = Object.assign(document.createElement('div'), { className: 'print-doc', innerHTML: markup });
  document.body.append(host);
  await typeset(host);
  await Promise.all([...host.querySelectorAll('img')].map(img=>{img.loading='eager';return img.decode?img.decode().catch(()=>{}):Promise.resolve();}));
  const root = document.documentElement;
  root.classList.add('printing-doc');
  const done = () => { root.classList.remove('printing-doc'); host.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}
