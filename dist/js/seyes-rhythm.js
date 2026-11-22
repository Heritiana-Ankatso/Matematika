// The Lycée copybook writes on the ruling (docs/DESIGN_V8.md section 5): the first baseline of every block of writing
// sits on a heavy Seyès line (every 32 px from the top of the page). CSS gives every line a height of one or two heavy
// lines, so the lines of a block follow its first; what CSS cannot know is where a block starts once fonts, formulas,
// frames, folded proofs and the width have moved it. This script measures each block's first baseline (a zero-size probe
// on the baseline) and pads the block down to the next heavy line, top to bottom, after fonts load, after formulas are
// typeset, when the width changes and when a fold opens or closes.
export const BLOCKS = 'h1, h2, h3, p, li, summary, .v8-text, .v8-rhythm';
const HEAVY = 32;

// The padding that brings a baseline at `y` (from the top of the page) onto the next heavy line.
export const shiftFor = (y, heavy = HEAVY) => { const r = ((y % heavy) + heavy) % heavy; return r < 0.5 || heavy - r < 0.5 ? 0 : heavy - r; };

function baseline(block) {
  const probe = document.createElement('span');
  probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline;';
  probe.setAttribute('aria-hidden', 'true');
  block.prepend(probe);
  const y = probe.getBoundingClientRect().bottom;
  probe.remove();
  return y;
}

// Every block of writing inside `page`, outermost first; blocks inside a closed fold are skipped.
const blocksOf = (page) => [...page.querySelectorAll(BLOCKS)].filter((b) => b.getClientRects().length && !b.closest('[data-rhythm-off]'));

export function align(page) {
  const blocks = blocksOf(page);
  blocks.forEach((b) => { b.style.paddingTop = ''; });
  const top = () => page.getBoundingClientRect().top;
  for (const b of blocks) {
    // a block inside another (a paragraph in a list item) is measured after its parent moved: often nothing is left
    const shift = shiftFor(baseline(b) - top());
    if (shift) b.style.paddingTop = `calc(${getComputedStyle(b).paddingTop} + ${shift}px)`;
  }
}

// Keeps `page` on the ruling; returns what stops it.
export function keepOnRuling(page, { ready = [] } = {}) {
  if (!page || typeof window === 'undefined') return () => {};
  let frame = 0, stopped = false, width = page.clientWidth;
  const later = () => { if (stopped) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (!stopped) align(page); }); };
  later();
  document.fonts?.ready?.then(later);
  ready.forEach((p) => Promise.resolve(p).then(later, later));
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => { if (page.clientWidth !== width) { width = page.clientWidth; later(); } }) : null;
  ro?.observe(page);
  page.addEventListener('toggle', later, true);
  return () => { stopped = true; cancelAnimationFrame(frame); ro?.disconnect(); page.removeEventListener('toggle', later, true); };
}
