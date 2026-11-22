// Every page of the site (MAP.md section 3): its world (docs/DESIGN_V8.md) and the groups of code it needs. app.js keeps
// only the shell (router, header, footer, theme, language, search trigger) and loads a page's groups with import() the
// first time the page is opened (docs/REBUILD_PLAN.md stage 1). The groups are defined by LOADERS in app.js.
// Pages loaded entirely by their own module (teacher, prepare, relax, review, search) need no group here.
export const ROUTES = {
  home: { world: 'home', needs: ['welcome'] },
  search: { world: 'home', needs: [] },
  teacher: { world: 'lycee', needs: [] },
  prepare: { world: 'lycee', needs: [] },
  relax: { world: 'home', needs: [] },
  review: { world: 'lycee', needs: [] },
  resources: { world: 'lycee', needs: ['library'] },
  chapter: { world: 'lycee', needs: ['library'] },
  library: { world: 'lycee', needs: ['libraryPage'] },
  workshop: { world: 'lycee', needs: ['workshop'] },
  pack: { world: 'lycee', needs: ['pack'] },
  sources: { world: 'lycee', needs: ['pack'] },
  automatismes: { world: 'lycee', needs: ['automatismes', 'companion'] },
  sheets: { world: 'lycee', needs: ['sheets', 'companion'] },
  bank: { world: 'lycee', needs: ['bank'] },
  slides: { world: 'lycee', needs: ['slides'] },
  pathways: { world: 'lycee', needs: ['content', 'pathways'] },
  university: { world: 'univ', needs: ['university'] },
  basics: { world: 'univ', needs: ['basics'] },
  topics: { world: 'univ', needs: ['content', 'companion', 'discovery'] },
  lab: { world: 'musee', needs: ['lab'] },
  gallery: { world: 'musee', needs: ['content', 'gallery'] },
  intuition: { world: 'musee', needs: ['intuition'] },
  fractals: { world: 'musee', needs: ['fractals'] },
  errors: { world: 'musee', needs: ['errors'] },
  history: { world: 'musee', needs: ['content', 'companion', 'discovery', 'history'] },
  biographies: { world: 'musee', needs: ['reading'] },
  stories: { world: 'musee', needs: ['reading'] },
  challenges: { world: 'musee', needs: ['content', 'challenges'] },
  olympiad: { world: 'olymp', needs: ['olympiad'] },
};

// Pages drawn in their v8 world while the switch is on (js/v8.js, docs/REBUILD_PLAN.md stages 2 to 8): the groups they
// need instead of the current page's. `#v8[/<world>]` is the foundation sampler (stage 2) and exists only under `?v8`.
// `match` (optional) narrows a page to some of its addresses; the others keep the current look.
export const V8_ROUTES = {
  v8: { needs: ['v8sampler'] },
  home: { needs: ['v8threshold'] },
  musee: { needs: ['v8musee'] },
  gallery: { needs: ['content', 'v8exhibit'], match: (r) => !!r.id },
  university: { needs: ['v8univ'], match: (r) => !r.id },
};
export const v8RouteOf = (r) => { const x = V8_ROUTES[r.page]; return x && (!x.match || x.match(r)) ? x : null; };

// The groups a page needs; an unknown page needs none (it renders "Page introuvable").
export const needsOf = (page) => ROUTES[page]?.needs || [];
export const worldOf = (page) => ROUTES[page]?.world || 'home';
