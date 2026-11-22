// The shell: router, header, footer, theme, language, search trigger. Everything a page draws is loaded with import()
// the first time that page is opened (routes.js lists what each page needs; LOADERS below), so a page downloads only its
// own code (docs/REBUILD_PLAN.md stage 1).
import {currentCourse,rememberCourse} from './navigation-state.js';
import {organizePage} from './page-ergonomics.js';
import {isLiveRoute, isLiveHash, liveDiscovery, livePathways, liveChapterCourse, FULL_EDITION} from './live-curriculum.js';
import { installNavFlyout, installHoverDetails } from "./nav-flyout.js";
import {installControlPolicy} from "./control-policy.js";
import {preferredLanguage,routeLanguage} from "./content-language.js";
import { rememberScrolls, restoreScrolls } from "./scroll-memory.js";
import { withEntryNav } from "./entry-nav.js";
import { observeSvgNavigation } from "./canvas-navigation.js";
import { discoveryChapters, companionChapters } from "./catalogue-data.js";
import { needsOf, v8RouteOf } from "./routes.js";
import { V8_ACTIVE, WORLDS, enterWorld, leaveWorld } from "./v8.js";
// The name of this edition (Maths Explorer or Matematika), written into index.html by the build (build/mxbuild/site.py).
const SITE_NAME = document.querySelector('meta[name="application-name"]')?.content || "Maths Explorer";
import { icon } from "./icons.js";
import { currentTheme, toggleTheme, installPresenting } from "./ui.js";
import { illuminateFeedback } from "./motion.js";
import { isAnswer, formatNumber } from "./math.js";
import * as teacherState from './teacher-state.js';
import {noteOpen,recentFor,contextStripHtml,mountContextStrip} from './classroom-context.js';
import {landingHash,homeHash,effectiveEntry,installEntrySwitch,AUDIENCES} from './teacher-entry.js';
import {MODES,modeOfRoute,showModeBar} from './modes.js';
import {installOffline} from './offline.js';

// Page code, set by LOADERS the first time a page needs it.
let labs = [], challenges = [];
let articleOf, articleHtml, galleryContext, mountObject, galleryIndex, mountArt, fullscreenButton, relatedChapters;
let workshopMarkup, bindWorkshop, errorsPage, bindErrors, isErrorRoute, intuitionPage, fractalsPage;
let olympiadPage, bindOlympiad, isOlympiadRoute, libraryPage, bindLibrary, chapterPage, bindChapter;
let packPage, bindPack, sourcesPage, bindSources, automatismesPage, bindAutomatismes, sheetsPage, bindSheets;
let bankPage, bindBank, isBankRoute, slidesPage, bindSlides, universityPage, bindUniversity;
let pathwayPageView, bindPathways, homePage, bindHome, mountHomeFigure, isReading, readingPage, readAlso, mountLibrary;
let VARIANTS, hasVariants, variantDefaults, randomParams, normaliseVariant, mountActivity, hasActivity, challengeIcon, originalOf, mountSolution, hasSolution, cartoonPress;
let basicsPage, bindBasics, isBasicsRoute, assetHref, mountExperiment, resolveRef, labRef, labIndexPage, experimentPage, bindLabIndex;
let discoveryIndex, discoveryPage, bindDiscovery, isTopicRoute, historyPage, bindHistory, isHistoryRoute, mathematiciansTimelineUrl;
let companionCatalog = { chapters: [] };
let samplerPage, bindSampler, thresholdPage, bindThreshold, museePage, bindMusee, exhibitPage, bindExhibit;
const LOADERS = {
  content: async () => { ({ labs, challenges } = await import("./content.js")); pruneSaved(); },
  companion: async () => { const [{ resourceCatalog }, { liveCompanionCatalog }] = await Promise.all([import("./resources-data.js"), import("./live-curriculum.js")]); companionCatalog = liveCompanionCatalog(resourceCatalog); },
  welcome: async () => { ({ homePage, bindHome, mountHomeFigure } = await import("./welcome.js")); },
  library: async () => { ({ libraryPage, bindLibrary, chapterPage, bindChapter, relatedChapters, resourceCatalog: companionCatalog } = await import("./resource-library.js")); },
  libraryPage: async () => { ({ mountLibrary } = await import("./library.js")); },
  workshop: async () => { ({ workshopMarkup, bindWorkshop } = await import("./quadratic-workshop.js")); },
  pack: async () => { ({ packPage, bindPack, sourcesPage, bindSources } = await import("./pack-builder.js")); },
  automatismes: async () => { ({ automatismesPage, bindAutomatismes } = await import("./automatismes.js")); },
  sheets: async () => { ({ sheetsPage, bindSheets } = await import("./worksheets.js")); },
  bank: async () => { ({ bankPage, bindBank, isBankRoute } = await import("./bank-page.js")); },
  slides: async () => { ({ slidesPage, bindSlides } = await import("./slides-page.js")); },
  university: async () => { ({ universityPage, bindUniversity } = await import("./university.js")); },
  pathways: async () => { ({ pathwayPage: pathwayPageView, bindPathways } = await import("./pathways-view.js")); },
  basics: async () => { const [b, d] = await Promise.all([import("./basics-page.js"), import("./data-loader.js")]); ({ basicsPage, bindBasics, isBasicsRoute } = b); ({ assetHref } = d); },
  lab: async () => { const [m, reg, p] = await Promise.all([import("./lab/mount.js"), import("./lab/registry.js"), import("./lab/page.js")]); ({ mountExperiment } = m); ({ resolveRef, labRef } = reg); ({ indexPage: labIndexPage, experimentPage, bindLabIndex } = p); },
  gallery: async () => {
    const [a, c, o, w, h, v, r, l] = await Promise.all([import("./gallery/article.js"), import("./gallery/gallery-context.js"), import("./lab-objects.js"), import("./welcome.js"), import("./home-art.js"), import("./visual-lessons.js"), import("./reading.js"), import("./related-chapters.js")]);
    ({ articleOf, articleHtml } = a); ({ galleryContext } = c); ({ mountObject } = o); ({ galleryPage: galleryIndex } = w); ({ mountArt } = h); ({ fullscreenButton } = v); ({ readAlso } = r); ({ relatedChapters } = l);
  },
  intuition: async () => { ({ intuitionPage } = await import("./intuition-page.js")); },
  fractals: async () => { ({ fractalsPage } = await import("./fractals-page.js")); },
  errors: async () => { const [e, m] = await Promise.all([import("./errors.js"), import("./errors-model.js")]); ({ errorsPage, bindErrors } = e); ({ isErrorRoute } = m); },
  olympiad: async () => { ({ olympiadPage, bindOlympiad, isOlympiadRoute } = await import("./olympiad.js")); },
  reading: async () => { ({ isReading, readingPage, readAlso } = await import("./reading.js")); },
  challenges: async () => {
    const [reg, c, r] = await Promise.all([import("./challenges/registry.js"), import("./challenges/common/cartoon.js"), import("./reading.js")]);
    ({ VARIANTS, hasVariants, defaults: variantDefaults, randomParams, normalise: normaliseVariant, mountActivity, hasActivity, challengeIcon, originalOf, mountSolution, hasSolution } = reg);
    ({ cartoonPress } = c); ({ readAlso } = r);
  },
  discovery: async () => { ({ discoveryIndex, discoveryPage, bindDiscovery, isTopicRoute } = await import("./discovery.js")); },
  v8sampler: async () => { ({ samplerPage, bindSampler } = await import("./v8/sampler.js")); },
  v8threshold: async () => { ({ thresholdPage, bindThreshold } = await import("./v8/threshold.js")); },
  v8musee: async () => { ({ museePage, bindMusee } = await import("./v8/musee.js")); },
  v8exhibit: async () => { ({ exhibitPage, bindExhibit } = await import("./v8/exhibit.js")); },
  history: async () => { ({ historyPage, bindHistory, isHistoryRoute, mathematiciansTimelineUrl } = await import("./history.js")); },
};
const loaded = new Set(), loading = new Map();
const ensure = (groups) => Promise.all(groups.filter((g) => !loaded.has(g)).map((g) => {
  if (!loading.has(g)) loading.set(g, LOADERS[g]().then(() => { loaded.add(g); }, (e) => { loading.delete(g); throw e; }));
  return loading.get(g);
}));

const $ = (s, root = document) => root.querySelector(s);
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let storageWorks = true;
let saved = {};
try {
  saved = JSON.parse(localStorage.getItem("maths-explorer-v1") || "{}") || {};
} catch { storageWorks = false; }
if (!saved || typeof saved !== "object" || Array.isArray(saved)) saved = {};
let preferredLang = preferredLanguage(saved.lang);
let lang = preferredLang;
installControlPolicy(document.getElementById("app"));
// Finished experiments and challenges: kept as stored until the catalogue of labs and challenges is loaded, then only
// the ids that still exist (pruneSaved).
const completed = new Set(Array.isArray(saved.completed) ? saved.completed : []);
function pruneSaved() {
  for (const id of completed) if (![...labs, ...challenges].some((x) => x.id === id)) completed.delete(id);
}
// The chapters with a companion page (#chapter/<id>) that are live in this edition, as resource-library.js lists them.
const chapterIds = new Set(companionChapters.filter((id) => liveChapterCourse(id)));
const shellChapters = discoveryChapters.filter((c) => chapterIds.has(c.id));
const seen = new Set(Array.isArray(saved.seen) ? saved.seen.filter((id) => chapterIds.has(id)) : []);
let last = chapterIds.has(saved.last) ? saved.last : "";
const states = {};
let challengeFilter = "all";
let currentLab = "quadratic";
let stopChapter = () => {};
let stopObject = () => {};
let stopArt = [];
let homeFigure = null;
let stopLab = () => {};
let stopViews = [];
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const reducedMotion = () => motionPreference.matches;
motionPreference.addEventListener?.("change", () => {
  if (reducedMotion()) document.getAnimations?.().forEach(animation => animation.cancel());
});
const t = (pair) => pair[lang === "fr" ? 0 : 1];
const fmt = (n, d = 3) => formatNumber(n, lang, d);
const pair = (fr, en) => t([fr, en]);
// The header and footer speak the reader's chosen language, even on a page whose content has one edition.
const inChosenLanguage = (draw) => { const kept = lang; lang = preferredLang; try { return draw(); } finally { lang = kept; } };
function save() {
  try {
    localStorage.setItem(
      "maths-explorer-v1",
      JSON.stringify({ lang:preferredLang, completed: [...completed], seen: [...seen], last }),
    );
  } catch {
    storageWorks = false;
  }
  if ($("footer")) $("footer").outerHTML = inChosenLanguage(footer);
}
// What a gallery exhibit remembers while the visitor browses: the values of its controls and the answer to its question.
function state(lab) {
  return (states[lab.id] ??= { values: (lab.params || []).map((p) => p[4]), answer: "", result: null });
}
function route() {
  const parts = location.hash.slice(1).split("/");
  return { page: parts[0] || "home", id: parts[1], tab: parts[2], sub: parts[3] };
}
function link(page, id = "") {
  return "#" + page + (id ? "/" + id : "");
}
const brandMark = `<svg class="brandmark" viewBox="0 0 120 120" aria-hidden="true" focusable="false"><rect width="120" height="120" class="bm-bg"/><path d="M90 60A30 30 0 1 1 30 60A30 30 0 1 1 90 60ZM30 0A30 30 0 0 1 0 30M90 0A30 30 0 0 0 120 30M0 90A30 30 0 0 1 30 120M120 90A30 30 0 0 0 90 120" class="bm-arc"/></svg>`;
// Three sections: "Apprendre" (courses and classroom tools), "Explorer" (laboratory, challenges) and "Lire" (biographies,
// stories, and the curiosities of the gallery).
// The main bar names the sections; a row of tabs under it names the pages of the current section. A section may fold a
// second group of pages under one labelled menu (Apprendre: the classroom tools under "Pour enseigner", owner request of
// 16 November 2026 for a shorter, grouped row); the menu is open on its own pages and for the teacher profile.
const SECTIONS = [
  ["learn", "Apprendre", "Learn", "books", [
    ["resources", "Cours", "Lessons", "books"],
    ["bank", "Exercices", "Exercises", "seal-check"],
    ["review", "Réviser", "Review", "arrows-clockwise"],
    ["bank/annales", "Annales", "Past papers", "scroll"],
    ["basics", "Bases", "Foundations", "books"],
    ...(FULL_EDITION ? [["pathways", "Programmes", "Curricula", "path"]] : []),
  ], ["Pour enseigner", "For teaching", [
    ["slides", "Diaporamas", "Slides", "presentation-chart"],
    ["automatismes", "Automatismes", "Starters", "lightbulb"],
    ["sheets", "Fiches", "Worksheets", "pencil-simple-line"],
    ["pack", "Dossier sur mesure", "Custom pack", "package"],
  ]]],
  // Explorer: everything you handle (experiments, exhibits and the collections built from them).
  ["explore", "Explorer", "Explore", "flask", [
    ["topics", "Domaines", "Topics", "magnifying-glass"],
    ["lab", "Laboratoire", "Laboratory", "flask"],
    ["gallery", "Curiosités", "Curiosities", "sparkle"],
    ["fractals", "Fractales", "Fractals", "sparkle"],
    ["intuition", "Contre l’intuition", "Against intuition", "lightbulb"],
  ]],
  // Résoudre: everything you solve (problems, competition strategies, errors to correct).
  ["solve", "Résoudre", "Solve", "puzzle-piece", [
    ["challenges", "Défis", "Challenges", "puzzle-piece"],
    ...(FULL_EDITION ? [["olympiad", "Olympiades", "Olympiads", "trophy"]] : []),
    ["errors", "Erreurs", "Errors", "warning"],
  ]],
  // Lire: everything you read (texts and timelines).
  ["read", "Lire", "Read", "book-open", [
    ["stories", "Histoires", "Stories", "scroll"],
    ["biographies", "Biographies", "Biographies", "user"],
    ["history", "Chronologies", "Timelines", "scroll"],
  ]],
];
// pages reached from a tab count as that tab
const TAB_OF = { chapter: "resources", library: "resources", workshop: "resources", sources: "pack", university: "pathways" };
const pagesOf = ([, , , , tabs, fold]) => [...tabs, ...(fold ? fold[2] : [])];
function header(page) {
  const contentLang = document.documentElement.lang || lang;
  const singleEdition = contentLang === "fr" ? pair("Cette page existe en français seulement.", "This page is only available in French.") : pair("Cette page existe en anglais seulement.", "This page is only available in English.");
  const tab = page === "bank" && route().id === "annales" ? "bank/annales" : TAB_OF[page] || page;
  const section = SECTIONS.find(s => pagesOf(s).some(([id]) => id === tab));
  const dark = currentTheme() === "nuit";
  const themeLabel = dark ? pair("Passer au thème clair", "Switch to light theme") : pair("Passer au thème sombre", "Switch to dark theme");
  const destination=id=>['resources','bank','slides'].includes(id)&&currentCourse()?link(id,currentCourse()):link(id);
  const sectionLinks = SECTIONS.map(([id, fr, en, ic, tabs]) =>
    `<a href="${destination(tabs[0][0])}" data-section="${id}" ${['resources','bank','slides'].includes(tabs[0][0])?`data-course-page="${tabs[0][0]}"`:''} ${section?.[0] === id ? 'aria-current="true"' : ""}>${icon(ic, 20)}<span>${pair(fr, en)}</span></a>`).join("");
  const entry = teacherState.getEntry();
  const tabLink = ([id, fr, en, ic]) => `<a href="${destination(id)}" ${['resources','bank','slides'].includes(id)?`data-course-page="${id}"`:''} ${tab === id ? 'aria-current="page"' : ""}>${icon(ic, 18)}<span>${pair(fr, en)}</span></a>`;
  const fold = section?.[5], foldHere = fold?.[2].find(([id]) => id === tab);
  const flyoutLink = ([tid, tfr, ten, tic]) => `<a href="${destination(tid)}"${['resources','bank','slides'].includes(tid) ? ` data-course-page="${tid}"` : ""}>${icon(tic, 18)}<span>${pair(tfr, ten)}</span></a>`;
  const flyouts = SECTIONS.map(([id, fr, en, , tabs, more]) => `<div class="nav-flyout" data-for="${id}" role="group" aria-label="${pair(fr, en)}" hidden>${tabs.map(flyoutLink).join("")}${more ? `<span class="nav-flyout-label">${pair(more[0], more[1])}</span>${more[2].map(flyoutLink).join("")}` : ""}</div>`).join("");
  const subnav = section ? `<nav class="subnav" aria-label="${pair(section[1], section[2])}"><div class="subnav-inner">${section[4].map(tabLink).join("")}${fold ? `<details class="section-tools secondary-tools"${foldHere || effectiveEntry(entry) === "teacher" ? " open" : ""}><summary>${pair(fold[0], fold[1])}${foldHere ? `<span class="sr-only"> : ${pair(foldHere[1], foldHere[2])}</span>` : ""}</summary><div>${fold[2].map(tabLink).join("")}</div></details>` : ""}</div></nav>` : "";
  const modeBar = showModeBar({ entry, page }) ? (active => `<nav class="modebar" aria-label="${pair("Modes", "Modes")}">${MODES.map(m => `<a href="${m.hash}" data-teacher-mode="${m.id}"${active === m.id ? ' aria-current="page"' : ""}>${pair(...m.label)}</a>`).join("")}<a class="modebar-switch" href="#home" data-set-entry="student">${pair("Espace élève", "Student area")}</a></nav>`)(modeOfRoute(page, teacherState.getMode())) : "";
  const audience = effectiveEntry(entry), who = AUDIENCES.find(a => a.id === audience);
  const audienceMenu = `<details class="audience-menu"><summary aria-label="${pair("Profil", "Profile")} : ${t(who.label)}. ${pair("Changer de profil", "Change profile")}" title="${pair("Changer de profil", "Change profile")}">${icon(audience === "teacher" ? "presentation-chart" : audience === "student" ? "graduation-cap" : "user", 20)}<span>${t(who.label)}</span></summary><div class="audience-list" role="group" aria-label="${pair("Profil", "Profile")}">${AUDIENCES.map(a => `<a href="${a.hash}" data-set-entry="${a.id}"${a.id === audience ? ' aria-current="true"' : ""}><b>${t(a.label)}</b><span>${t(a.hint)}</span></a>`).join("")}<p>${pair("Mémorisé sur cet appareil.", "Remembered on this device.")}</p></div></details>`;
  return `<header class="topbar"${lang !== contentLang ? ` lang="${lang}"` : ""}><a class="brand" href="${homeHash(entry)}" aria-label="${SITE_NAME}">${brandMark}<span class="brand-name">${SITE_NAME}</span></a><button class="nav-toggle" aria-expanded="false" aria-controls="primary-nav">${pair("Menu","Menu")}</button><nav id="primary-nav" class="mainnav" aria-label="${pair("Navigation principale", "Main navigation")}">${sectionLinks}</nav>${flyouts}<div class="tools">${audienceMenu}<a class="icon-btn" href="#search" data-search-link aria-label="${pair("Rechercher une ressource", "Search resources")}" title="${pair("Rechercher une ressource", "Search resources")}"${route().page === "search" ? ' aria-current="page"' : ""}>${icon("magnifying-glass", 22)}</a><button class="icon-btn" data-theme-toggle aria-label="${themeLabel}" title="${themeLabel}">${icon(dark ? "sun" : "moon", 22)}</button><div class="language" role="group" aria-label="${pair("Langue", "Language")}"${lang !== contentLang ? ` aria-describedby="language-note" title="${singleEdition}"` : ""}><button data-lang="fr" aria-pressed="${lang === "fr"}" lang="fr">FR</button><button data-lang="en" aria-pressed="${lang === "en"}" lang="en">EN</button>${lang !== contentLang ? `<span id="language-note" class="sr-only">${singleEdition}</span>` : ""}</div></div></header>${modeBar}${subnav}`;
}
// The footer repeats every section and page as a site map, then the other pages.
function footer() {
  const columns = SECTIONS.map(sec => `<nav class="foot-col" aria-label="${pair(sec[1], sec[2])}"><p class="foot-title">${pair(sec[1], sec[2])}</p><ul>${pagesOf(sec).map(([id, fr, en]) => `<li><a href="${link(...id.split("/"))}">${pair(fr, en)}</a></li>`).join("")}</ul></nav>`).join("");
  return `<footer><div class="foot-grid"><div class="foot-about"><a class="foot-brand" href="#home">${brandMark}<span>${SITE_NAME}</span></a><p>${pair("Des mathématiques à voir, à manipuler et à raconter.", "Maths you can see, handle and tell.")}</p><p class="foot-storage">${storageWorks ? pair("Progression enregistrée sur cet appareil.", "Progress saved on this device.") : pair("Stockage indisponible : progression conservée pour cette session.", "Storage unavailable: progress kept for this session.")}</p></div>${columns}<nav class="foot-links foot-col" aria-label="${pair("Autres pages", "More pages")}"><p class="foot-title">${pair("Plus", "More")}</p>${effectiveEntry(teacherState.getEntry()) !== "teacher" ? `<a class="foot-switch" href="#teacher" data-set-entry="teacher">${pair("Espace professeur", "Teacher area")}</a>` : ""}<a href="#sources">${pair("Sources LaTeX", "LaTeX sources")}</a><a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.${lang}" rel="license noopener" target="_blank">${pair("Licence CC BY-NC-SA 4.0", "CC BY-NC-SA 4.0 licence")}</a></nav></div></footer>`;
}
// French title of a chapter, for the generators (their content is French)
const chapterTitleFr = (id) => companionCatalog.chapters.find((c) => c.id === id)?.title?.[0] || id;
let lastPage = null, renderSerial = 0;
// Applies the redirects of the address and returns the groups of code (routes.js) its page still needs.
function missingFor() {
  let r = route();
  if (V8_ACTIVE && v8RouteOf(r)) return v8RouteOf(r).needs.filter((g) => !loaded.has(g));
  if (!isLiveRoute(r)) {
    history.replaceState(null, '', '#resources');
    r = route();
  }
  const groups = [...needsOf(r.page)];
  // the curiosities live in the gallery, whatever link points at them: an address that is no experiment is checked
  // against the catalogue of curiosities
  if (r.page === "lab" && r.id && loaded.has("lab") && !(resolveRef(labRef(r.id, r.tab)) || resolveRef(r.id))) {
    if (!loaded.has("content")) groups.push("content");
    else if (labs.some((l) => l.id === r.id && l.custom)) { history.replaceState(null, "", link("gallery", r.id)); return missingFor(); }
  }
  return groups.filter((g) => !loaded.has(g));
}
// Draws the page of the address. When its code is already loaded the page is drawn at once, as before; otherwise the
// code is loaded first, under a short loading line. The returned promise settles once the page is
// drawn, for callers that move the focus afterwards; a newer navigation wins over an older one still loading.
function render() {
  const serial = ++renderSerial, missing = missingFor();
  if (!missing.length) { draw(serial); return Promise.resolve(); }
  // Nothing of the previous page stays usable while the next one loads (no click lands on a page that is leaving).
  if (lastPage !== null || $("#app").childElementCount) {
    teardown();
    $("#app").setAttribute("aria-busy", "true");
    $("#app").innerHTML = `<p class="page-loading" role="status">${pair("Chargement…", "Loading…")}</p>`;
  }
  return ensure(missing).then(() => { if (serial === renderSerial) return render(); }, () => { if (serial === renderSerial) unavailable(); });
}
function unavailable() {
  document.body.dataset.page = "missing";
  $("#app").removeAttribute("aria-busy");
  $("#app").innerHTML = inChosenLanguage(() => header(route().page)) + `<main id="main" tabindex="-1" class="page"><h1>${pair("Page indisponible", "Page unavailable")}</h1><p role="alert">${pair("La page n’a pas pu se charger. Vérifie la connexion, puis recharge la page.", "The page could not load. Check the connection, then reload the page.")}</p></main>` + inChosenLanguage(footer);
  bindCommon();
}
// A page in its v8 world (docs/DESIGN_V8.md): its own frame (top bar, world menu), no current header or footer.
const V8_DRAW = {
  v8: (r) => ({ world: WORLDS.includes(r.id) ? r.id : "home", html: samplerPage(r.id, { t, siteName: SITE_NAME }), bind: bindSampler }),
  home: () => ({ world: "home", html: thresholdPage({ t, lang, siteName: SITE_NAME }), bind: (root) => bindThreshold(root, { reduced: reducedMotion }) }),
  musee: () => ({ world: "musee", html: museePage({ t, lang, siteName: SITE_NAME }), bind: (root) => bindMusee(root, { lang, reduced: reducedMotion }) }),
  gallery: (r) => {
    const lab = labs.find((l) => l.custom && l.id === r.id);
    return { world: "musee", html: exhibitPage(lab, { t, lang, siteName: SITE_NAME }), bind: (root) => bindExhibit(root, lab, { lang, reduced: reducedMotion, state: state(lab) }) };
  },
};
function drawV8() {
  const r = route();
  lang = preferredLang;
  document.documentElement.lang = lang;
  const page = V8_DRAW[r.page](r);
  enterWorld(page.world);
  document.body.dataset.page = r.page;
  $("#app").innerHTML = page.html;
  $(".skip").textContent = pair("Aller au contenu", "Skip to content");
  stopChapter = page.bind($("#app")) || (() => {});
  syncDock(r.page);
  lastPage = r.page;
}
// Stops everything the page on screen runs (figures, observers, experiments).
function teardown() {
  stopViews.forEach(stop=>stop()); stopViews=[];
  stopLab();
  stopLab = () => {};
  stopChapter();
  stopChapter = () => {};
  stopObject();
  stopArt.forEach((f) => f());
  stopArt = [];
  homeFigure?.destroy(); homeFigure = null;
  stopObject = () => {};
}
function draw(serial) {
  const keptScrolls = rememberScrolls($("#app")), cameFrom = lastPage;
  teardown();
  $("#app").removeAttribute("aria-busy");
  if (V8_ACTIVE && v8RouteOf(route()) && (route().page !== "gallery" || labs.some((l) => l.custom && l.id === route().id))) { drawV8(); return; }
  leaveWorld();
  let r = route();
  if (!isLiveRoute(r)) {
    history.replaceState(null, '', '#resources');
    r = route();
  }
  lang=routeLanguage(r,shellChapters,preferredLang);
  // The mathematicians' chronology owns its viewport and its own navigation.
  if (r.page === 'history' && (!r.id || r.id === 'people') && !r.tab) {
    window.location.replace(mathematiciansTimelineUrl(lang));
    return;
  }
  // the curiosities live in the gallery, whatever link points at them
  if (r.page === "lab" && labs.some((l) => l.id === r.id && l.custom)) { history.replaceState(null, "", link("gallery", r.id)); r = route(); }
  document.documentElement.lang = lang;
  document.title = pair(
    `${SITE_NAME} · Laboratoire de mathématiques`,
    `${SITE_NAME} · Mathematics laboratory`,
  );
  const experiment = r.page === "lab" && r.id ? (resolveRef(labRef(r.id, r.tab)) || resolveRef(r.id))?.experiment || null : null;
  // The full index of the site is built only by the pages that list it; the home needs only its live chapter pages.
  const discovery = r.page === "topics" || r.page === "history" ? liveDiscovery(discoveryIndex({labs,challenges,chapters:companionCatalog.chapters})) : null;
  const homeIndex = [...chapterIds].map((id) => ({ route: "#chapter/" + id })).filter((x) => isLiveHash(x.route));
  const valid = (r.page === "lab" && (!r.id || !!experiment)) || (r.page === "gallery" && (!r.id || labs.some(l => l.id === r.id && l.custom))) ||
    (r.page === 'history' && isHistoryRoute(r.id,r.tab)) ||
    (r.page === 'topics' && isTopicRoute(r.id,r.tab)) ||
    (r.page === "errors" && isErrorRoute(r.id)) || (r.page === "intuition" && !r.id) || (r.page === "fractals" && !r.id) ||
    (r.page === "olympiad" && isOlympiadRoute(r.id)) ||
    (r.page === "challenges" && (!r.id || challenges.some(c => c.id === r.id))) ||
    (r.page === "home" && !r.id) || (r.page === "teacher" && !r.id) || (r.page === "prepare" && !r.id) || (r.page === "relax" && !r.id) || (r.page === "review" && !r.id) || r.page === "search" || (r.page === "basics" && isBasicsRoute(r.id)) || ((r.page === "biographies" || r.page === "stories") && isReading(r.page, r.id)) || (r.page === "pathways" && (!r.id || livePathways.some(p => p.id === r.id))) || r.page === "library" || r.page === "pack" || r.page === "sources" || r.page === "slides" || r.page === "automatismes" || r.page === "sheets" || (r.page === "bank" && isBankRoute(r.id, r.tab, r.sub)) ||
    r.page === "university" || (r.page === "resources" && isLiveRoute(r)) || (r.page === "workshop" && r.id === "quadratic") ||
    (r.page === "chapter" && chapterIds.has(r.id));
  const page = valid ? r.page : "missing";
  if(['resources','slides','bank'].includes(page))rememberCourse(r.id);
  if(page==='chapter')rememberCourse(shellChapters.find(c=>c.id===r.id)?.course);
  document.body.dataset.page=page;
  $("#app").innerHTML =
    inChosenLanguage(() => header(page)) +
    (page === "search" ? searchLoading() : page === "teacher" ? teacherLoading() : page === "prepare" ? modeLoading(pair("Préparer", "Prepare")) : page === "relax" ? modeLoading(pair("Détente", "Relax")) : page === "review" ? modeLoading(pair("Réviser", "Review")) : page === "basics" ? basicsPage(r.id, { t, pair, lang, assetHref }) : page === "home" ? homePage({ pair, t, link, index:homeIndex, last, audience: effectiveEntry(teacherState.getEntry()) }) : page === "workshop" ? workshopMarkup(t) : page === "pack" ? packPage(t, r.id) : page === "bank" ? bankPage(t, r.id, r.tab) : page === "sources" ? sourcesPage(t) : page === "slides" ? slidesPage(t) : page === "automatismes" ? automatismesPage(t, pair) : page === "sheets" ? sheetsPage(t) : page === "resources" ? libraryPage(t, { challenges, completed, seen, last, labs })
      : page === "university" ? universityPage(lang)
      : page === "topics" ? discoveryPage(discovery,r.id,r.tab,t)
      : page === "history" ? historyPage(r.id,r.tab,t,discovery)
      : page === "chapter" ? chapterPage(r.id, r.tab, t, labs)
      : page === "errors" ? errorsPage(r.id, t)
      : page === "intuition" ? intuitionPage(t)
      : page === "fractals" ? fractalsPage(t, lang)
      : page === "olympiad" ? olympiadPage(r.id, t)
      : page === "lab"
      ? (experiment ? experimentPage(experiment, { t, pair, link, completed, mission: r.tab || "" }) : labIndexPage({ t, pair, link, completed }))
      : page === "gallery"
      ? (r.id ? galleryDetail(r.id) : galleryIndex({ pair, t, link, labs }))
      : page === "biographies" || page === "stories"
      ? readingPage(page, r.id, t)
      : page === "challenges"
        ? challengePage(r.id)
        : page === "library"
          ? `<main id="main" tabindex="-1" class="library-page"></main>`
        : page === "pathways"
          ? pathwayPage()
          : `<main id="main" tabindex="-1" class="page"><h1>${pair("Page introuvable", "Page not found")}</h1><a href="#lab">${pair("Ouvrir le laboratoire", "Open the laboratory")}</a></main>`) +
    inChosenLanguage(footer);
  if(r.id && page!=='topics') stopViews.push(mountContext($('#main'),`#${page}/${r.id}${page==='history'&&r.tab?'/'+r.tab:''}`));
  if (experiment) {
    // The mission is part of the address (#lab/<experiment>/<mission>); replaceState keeps the history clean.
    stopLab = mountExperiment($("#lab2-host"), labRef(experiment.id, r.tab), {
      mode: "full", lang,
      onMission: (id, mission) => { const hash = link("lab", id) + "/" + mission; if (location.hash !== hash) history.replaceState(null, "", hash); },
      onComplete: (id) => { completed.add(id); save(); },
    }).destroy;
  }
  if (page === "home") homeFigure = mountHomeFigure($("#main"), { lang, reduced: reducedMotion() });
  if (page === "home" || (page === "gallery" && !r.id)) {
    const canvases = [...document.querySelectorAll("canvas[data-art]")];
    if (canvases.length && mountArt) stopArt = canvases.map((cv) => mountArt(cv, cv.dataset.art, { reduced: reducedMotion }));
    else if (canvases.length) import("./home-art.js").then((m) => { mountArt = m.mountArt; if (serial === renderSerial) stopArt = canvases.filter((cv) => cv.isConnected).map((cv) => mountArt(cv, cv.dataset.art, { reduced: reducedMotion })); });
  }
  if (page === "gallery" && $("#object-stage")) stopObject = mountObject($("#object-stage").dataset.object, $("#object-stage"), { lang, reduced: reducedMotion, initialValues: state(labs.find(x=>x.id===currentLab)).values, onChange: values => { state(labs.find(x=>x.id===currentLab)).values = values; } });
  $(".skip").textContent = pair("Aller au contenu", "Skip to content");
  document.querySelectorAll('#app a[href^="#"]').forEach(a => {
    if (!isLiveHash(a.getAttribute('href'))) a.remove();
  });
  bindCommon();
  // The device remembers what was opened (Espace professeur recents) and names the class chapter on lessons and exercises.
  if (valid) {
    const recent = recentFor(page, r.id, r.tab, t, experiment ? t(experiment.title) : "");
    if (recent) noteOpen(recent);
    if (page === "resources" || (page === "bank" && r.id !== "annales" && !r.tab)) mountContextStrip($("#main"), contextStripHtml({ page, t, course: r.id || currentCourse() }));
  }
  if (page === "gallery" && r.id) bindGallery();
  if (page === "chapter" || (page === "gallery" && r.id) || experiment) stopViews.push(mountRelated($("#main"), page === "chapter" ? "#chapter/" + r.id : page === "gallery" ? "#gallery/" + r.id : "#lab/" + experiment.id));
  if (page === "lab" && !experiment) bindLabIndex($("#main"), pair);
  if (page === "challenges") stopChapter = bindChallenges();
  if (page === "errors") stopChapter = bindErrors($("#main"), t, r.id);
  if (page === "olympiad") stopChapter = bindOlympiad($("#main"), lang);
  if (page === "home") stopChapter = bindHome($("#main"),homeIndex,t);
  if (page === "teacher") stopChapter = mountTeacher($("#main"));
  if (page === "prepare") stopChapter = mountMode($("#main"), "prepare");
  if (page === "relax") stopChapter = mountMode($("#main"), "relax");
  if (page === "review") stopChapter = mountMode($("#main"), "review");
  if (page === "search") stopChapter = mountSearch($("#main"), r.id);
  if (page === "basics" && r.id) stopChapter = bindBasics({ $, currentTheme });
  if (page === "resources") stopChapter = bindLibrary(t, { fmt });
  if (page === "pathways") stopChapter = bindPathways({ root: $("#main"), pathways: livePathways, labs, t, pair, link, glyph, completed });
  if (page === "pack") bindPack(t);
  if (page === "sources") bindSources(t);
  if (page === "slides") bindSlides(t);
  if (page === "automatismes") stopChapter = bindAutomatismes($("#main"), t, { chapterTitle: chapterTitleFr, launch: r.id === "go", list: r.id === "list" });
  if (page === "bank") stopChapter = bindBank($("#main"), t, r.id, r.tab, r.sub);
  if (page === "sheets") stopChapter = bindSheets($("#main"), t, { chapterTitle: chapterTitleFr });
  if (page === "university") bindUniversity(r.id, lang);
  if (page === "chapter") {
    stopChapter = bindChapter(r.id, t, fmt);
    if (last !== r.id || !seen.has(r.id)) {
      last = r.id;
      seen.add(r.id);
      save();
    }
  }
  if (page === "workshop") stopChapter = bindWorkshop($("#main"),t,lang);
  if (page === 'topics') stopChapter = bindDiscovery($('#main'),discovery,r.id,r.tab,t);
  if (page === 'history') stopChapter = bindHistory($('#main'),r.id,t,discovery);
  stopViews.push(observeSvgNavigation($("#main"), "svg.act-svg, #quadratic-graph svg",lang));
  if (page === "library") mountLibrary($("#main"), {lang,id:r.id});
  stopViews.push(organizePage($("#main"),t));
  installPresenting();
  syncDock(page);
  // the lists of the previous page of the same kind keep their scroll position (gallery sidebar, timelines, strips)
  restoreScrolls($("#app"), cameFrom === page ? keptScrolls : null);
  lastPage = page;
}
// The in-class dock (dock.js) is loaded only once the device remembers the En classe mode: students never download it.
let dockApi = null;
function syncDock(page) {
  if (!dockApi && teacherState.getMode() !== "classe") { document.documentElement.classList.remove("has-dock"); return; }
  if (dockApi) { dockApi.update(page); return; }
  import("./dock.js").then(m => { dockApi = dockApi || m.mountDock({ state: teacherState, pair, getPage: () => document.body.dataset.page || "" }); dockApi.update(document.body.dataset.page || ""); }).catch(() => {});
}
// The teacher dashboard is loaded on demand: students never download it.
const teacherLoading = () => `<main id="main" class="page teacher-page" tabindex="-1"><h1>${pair("Espace professeur", "Teacher area")}</h1><p role="status">${pair("Chargement…", "Loading…")}</p></main>`;
const modeLoading = title => `<main id="main" class="page teacher-page" tabindex="-1"><h1>${title}</h1><p role="status">${pair("Chargement…", "Loading…")}</p></main>`;
// #prepare, #relax and #review are loaded on demand like the dashboard.
function mountMode(main, kind) {
  let stop = () => {}, gone = false;
  import(kind === "prepare" ? './prepare-page.js' : kind === "review" ? './review-page.js' : './relax-page.js').then(async m => {
    if (gone) return;
    const done = await (kind === "prepare" ? m.mountPreparePage : kind === "review" ? m.mountReviewPage : m.mountRelaxPage)(main, { t, state: teacherState, isGone: () => gone });
    stop = done || stop;
    if (gone) stop();
  }).catch(() => { if (!gone) main.innerHTML = `<h1>${pair("Page indisponible", "Page unavailable")}</h1><p role="alert">${pair("La page n’a pas pu se charger. Recharge-la.", "The page could not load. Reload it.")}</p>`; });
  return () => { gone = true; stop(); };
}
const searchLoading = () => `<main id="main" class="page teacher-page rs-page" tabindex="-1"><h1>${pair("Rechercher", "Search")}</h1><p role="status">${pair("Chargement…", "Loading…")}</p></main>`;
// Runs `load` once the end of the page comes near the viewport. A chapter waits for its content first, so the page is
// not short when the decision is taken. Returns the function that stops watching.
function whenNearEnd(main, slot, load) {
  let gone = false, observer = null, mutations = null, timer = 0;
  const fire = () => { observer?.disconnect(); observer = null; if (!gone) load(); };
  const watch = () => {
    if (gone) return;
    if (typeof IntersectionObserver !== "function") { timer = setTimeout(fire, 1500); return; }
    observer = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) fire(); }, { rootMargin: "400px 0px" });
    observer.observe(slot);
    // the site-map footer is tall: reaching it also means the end of the page is near
    const foot = document.querySelector("footer"); if (foot) observer.observe(foot);
  };
  const seq = main.querySelector("#chapter-sequence");
  if (seq && seq.getAttribute("aria-busy") !== "false") {
    mutations = new MutationObserver(() => { if (seq.getAttribute("aria-busy") === "false") { mutations.disconnect(); mutations = null; clearTimeout(timer); watch(); } });
    mutations.observe(seq, { attributes: true, attributeFilter: ["aria-busy"] });
    timer = setTimeout(() => { mutations?.disconnect(); mutations = null; watch(); }, 8000);
  } else watch();
  return () => { gone = true; observer?.disconnect(); mutations?.disconnect(); clearTimeout(timer); };
}
// The "related resources" box: a placeholder at the end of the page, filled by related-box.js (which carries the whole index)
// only when it comes near the viewport.
function mountRelated(main, hash) {
  if (!main) return () => {};
  main.insertAdjacentHTML("beforeend", '<div class="related-slot" data-related-slot></div>');
  const slot = main.querySelector("[data-related-slot]");
  let gone = false;
  const stop = whenNearEnd(main, slot, () => {
    import("./related-box.js").then((m) => { if (!gone && slot.isConnected) m.fillRelatedBox(slot, { main, hash, t }); }).catch(() => { slot.remove(); });
  });
  return () => { gone = true; stop(); };
}
// "Cette idée dans le site": the first field of the resource and its neighbours in the index of the whole site, drawn at
// the end of the page when the end nears the viewport, from the context generated by the build
// (discovery-context-data.js, scripts/catalogue-lines.mjs).
function mountContext(main, hash) {
  if (!main) return () => {};
  main.insertAdjacentHTML("beforeend", '<div class="context-slot" data-context-slot></div>');
  const slot = main.querySelector("[data-context-slot]");
  let gone = false;
  const stop = whenNearEnd(main, slot, () => {
    Promise.all([import("./discovery-context-data.js"), import("./discovery-context.js")]).then(([{ DISCOVERY_CONTEXT }, { contextBox }]) => {
      if (gone || !slot.isConnected) return;
      const entry = Object.hasOwn(DISCOVERY_CONTEXT, hash) ? DISCOVERY_CONTEXT[hash] : null;
      if (!entry) { slot.remove(); return; }
      slot.insertAdjacentHTML("afterend", contextBox(entry, t));
      const box = slot.nextElementSibling;
      slot.remove();
      box?.querySelectorAll('a[href^="#"]').forEach((a) => { if (!isLiveHash(a.getAttribute("href"))) a.remove(); });
    }).catch(() => { slot.remove(); });
  });
  return () => { gone = true; stop(); };
}
function mountSearch(main, query) {
  let stop = () => {}, gone = false;
  import('./resource-search.js').then(m => {
    if (gone) return;
    main.outerHTML = m.searchPageMarkup(t);
    const fresh = $("#main");
    let q = ""; try { q = query ? decodeURIComponent(query) : ""; } catch {}
    stop = m.mountSearchPage(fresh, { t, state: teacherState, query: q });
  }).catch(() => { if (!gone) main.innerHTML = `<h1>${pair("Rechercher", "Search")}</h1><p role="alert">${pair("La recherche n’a pas pu se charger. Recharge la page.", "Search could not load. Reload the page.")}</p>`; });
  return () => { gone = true; stop(); };
}
function mountTeacher(main) {
  let stop = () => {}, gone = false;
  import('./teacher-dashboard.js').then(async m => {
    if (gone) return;
    const done = await m.mountTeacherDashboard(main, { t, state: teacherState, isGone: () => gone });
    stop = done || stop;
    if (gone) stop();
  }).catch(() => {
    if (!gone) main.innerHTML = `<h1>${pair("Espace professeur", "Teacher area")}</h1><p role="alert">${pair("Le tableau de bord n’a pas pu se charger. Vérifie la connexion, puis recharge la page.", "The dashboard could not load. Check the connection, then reload the page.")} <a href="#home" data-set-entry="student">${pair("Accueil élèves", "Student home")}</a></p>`;
  });
  return () => { gone = true; stop(); };
}
function bindCommon() {
 const syncCourseLinks=()=>document.querySelectorAll('[data-course-page]').forEach(a=>{const c=currentCourse();a.href=link(a.dataset.coursePage,c);});
 window.addEventListener('mx-course-change',syncCourseLinks);
 stopViews.push(()=>window.removeEventListener('mx-course-change',syncCourseLinks));
 // a row of tabs that scrolls sideways (phones) shows the current tab
 const strip=$(".subnav-inner"), here=strip?.querySelector('[aria-current="page"]');
 if(strip&&here&&strip.scrollWidth>strip.clientWidth)strip.scrollLeft=Math.max(0,here.offsetLeft-strip.clientWidth/2+here.offsetWidth/2);
 const navButton=$(".nav-toggle"), nav=$("#primary-nav");
 stopViews.push(installNavFlyout(), installHoverDetails());
 const closeMenu=()=>{navButton.setAttribute("aria-expanded","false");nav.classList.remove("is-open");};
 navButton.addEventListener("click",()=>{const open=navButton.getAttribute("aria-expanded")!=="true";navButton.setAttribute("aria-expanded",String(open));nav.classList.toggle("is-open",open);});
 $(".topbar").addEventListener("keydown",e=>{if(e.key==="Escape"&&navButton.getAttribute("aria-expanded")==="true"){closeMenu();navButton.focus();}});

  $("[data-theme-toggle]")?.addEventListener("click", () => {
    toggleTheme();
    homeFigure?.retheme();
    const dark = currentTheme() === "nuit";
    const label = inChosenLanguage(() => dark ? pair("Passer au thème clair", "Switch to light theme") : pair("Passer au thème sombre", "Switch to dark theme"));
    const button = $("[data-theme-toggle]");
    button.setAttribute("aria-label", label);
    button.title = label;
    button.innerHTML = icon(dark ? "sun" : "moon", 22);
  });
  document.querySelectorAll("[data-lang]").forEach((b) =>
    b.addEventListener("click", () => {
      preferredLang = b.dataset.lang;
      lang = preferredLang;
      save();
      render().then(() => {
        const selected = $(`[data-lang="${lang}"]`);
        (selected?.offsetParent ? selected : $(".nav-toggle"))?.focus();
      });
    }),
  );
}
// The gallery page of one exhibit: the exhibit itself (lab-objects.js), what to try, a question, the history box and the
// reading paths. The guided experiments of the laboratory are in lab/ (mountExperiment); nothing here draws a chart.
function galleryDetail(id) {
  const pool = labs.filter((x) => x.custom), lab = pool.find((x) => x.id === id) || pool[0];
  currentLab = lab.id;
  const s = state(lab), art = articleOf(lab.id);
  const content = ` <main id="main" class="lab-main${art ? " lab-main-article" : ""}" tabindex="-1"><div class="breadcrumb">${pair("Curiosités", "Curiosities")}<span>/</span>${t(lab.group)}</div><div class="lab-heading"><div><h1>${t(lab.title)}</h1>${art ? "" : `<p>${t(lab.intro)}</p>`}</div>${art ? "" : `<span class="level">${t(lab.level)}</span>`}</div>
 <div class="workbench${lab.layout === "exhibit" ? " workbench-exhibit" : art ? " workbench-article" : ""}"><section class="experiment" data-fs-target aria-label="${pair("Expérience interactive", "Interactive experiment")}"><div class="experiment-top"><span class="eyebrow">${art ? pair("Figure interactive", "Interactive figure") : pair("À toi d’expérimenter", "Your turn to experiment")}</span><span class="experiment-actions">${fullscreenButton(pair)}<button id="reset" class="text-button">${pair("Réinitialiser", "Reset")}</button></span></div>${relatedChapters(lab.id, t)}<div id="object-stage" class="object-stage" data-object="${lab.id}"></div></section>
 ${art ? "" : `<aside class="learning"><div class="learning-label"><span aria-hidden="true">◷</span> ${pair("Temps d’apprentissage", "Learning time")} <span>${lab.duration} min</span></div><h2>${pair("De l’intuition à l’idée", "From intuition to insight")}</h2><p class="prereq"><strong>${pair("Avant de commencer", "Before you begin")}</strong><br>${t(lab.prereq)}</p><p class="muted">${pair("Les mesures affichées sont arrondies. Des essais suggèrent une conjecture ; un argument général établit une preuve.", "Displayed measurements are rounded. Examples suggest a conjecture; a general argument establishes a proof.")}</p><ol class="steps">${lab.steps.map((x) => `<li>${t(x)}</li>`).join("")}</ol>${lab.reasoning ? `<div class="reasoning"><details><summary>${pair("Comparer avec un argument", "Compare with an argument")}</summary><p><strong>${pair("Conjecture", "Conjecture")}</strong> ${t(lab.reasoning.conjecture)}</p><p><strong>${pair("Justification", "Justification")}</strong> ${t(lab.reasoning.proof)}</p><p>${t(lab.reasoning.transfer)}</p></details></div>` : ""}${lab.answer === undefined ? `<div class="checkpoint checkpoint-open"><span class="eyebrow">${pair("La question", "The question")}</span><p class="open-question">${t(lab.quiz)}</p><p class="muted">${pair("Le site ne vérifie pas ta réponse : cherche avec l’expérience, discutes-en, puis compare.", "The site does not check your answer: explore with the experiment, talk it over, then compare.")}</p><details class="explain-open"><summary>${pair("Comprendre la réponse", "Understand the answer")}</summary><div class="sol-host" data-explain="${lab.id}"></div><details class="written"><summary>${pair("Version écrite", "Written version")}</summary><p>${t(lab.explain)}</p></details></details></div>` : `<div class="checkpoint"><span class="eyebrow">${pair("Le petit déclic", "Check your understanding")}</span>${Object.keys(lab.quizState || {}).length ? `<button id="quiz-preset" class="secondary">${pair("Régler l’expérience pour cette question", "Set the experiment for this question")}</button>` : ""}<form id="lab-quiz"><label for="quiz-answer">${t(lab.quiz)}</label><div class="answer-row"><input id="quiz-answer" name="answer" type="text" inputmode="text" autocomplete="off" placeholder="${pair("Ta réponse", "Your answer")}" required value="${esc(s.answer)}"><button class="primary" type="submit">${pair("Vérifier", "Check")}</button></div></form><p id="quiz-feedback" class="feedback ${s.result === true ? "success" : ""}" role="status">${s.result === true ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain) : s.result === false ? pair("Pas encore. Reprends l’expérience et essaie à nouveau.", "Not yet. Revisit the experiment and try again.") : ""}</p><details class="explain-comic"><summary>${pair("Comprendre la réponse", "Understand the answer")}</summary><div class="sol-host comic-host" data-comic-explain></div><p>${t(lab.explain)}</p></details>`}</div></aside>`}</div>${art ? articleHtml(lab, art, t, pair) : ""}
 ${art ? `<section class="art-sources"><h2>${pair("Pour approfondir", "Further reading")}</h2><p><a href="${lab.source}" target="_blank" rel="noopener noreferrer">${lab.sourceLabel ? t(lab.sourceLabel) : lab.source.includes("mathshistory.st-andrews.ac.uk") ? pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor") : pair("Source et explications", "Source and explanation")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></p></section>` : `<section class="history"><div class="history-icon" aria-hidden="true">H</div><div class="history-title"><span class="eyebrow">${art ? pair("Histoire", "History") : pair("Repère historique", "History box")}</span><h2>${t(lab.history)}</h2></div><div><p>${t(lab.story)}</p><a href="${lab.source}" target="_blank" rel="noopener noreferrer">${lab.sourceLabel ? t(lab.sourceLabel) : lab.source.includes("mathshistory.st-andrews.ac.uk") ? pair("En savoir plus · MacTutor (anglais)", "Read more · MacTutor") : pair("Source et explications", "Source and explanation")} <span class="sr-only">${pair("(nouvel onglet)", "(new tab)")}</span></a></div></section>`}${art ? "" : galleryContext(lab.id, pair)}${readAlso(link("gallery", lab.id), lab.links, t)}</main>`;
  const groups=[...new Set(pool.map(x=>t(x.group)))].map(label=>({label:[label,label],items:pool.filter(x=>t(x.group)===label).map(x=>({id:x.id,href:link('gallery',x.id),title:x.short||x.title}))}));
  return withEntryNav(content,{t,label:['Curiosités','Curiosities'],title:['Curiosités','Curiosities'],groups,current:lab.id});
}
// The vector symbol (combining arrow) is missing from the maths font: show a plain arrow.
const glyph = (symbol) => (symbol.includes("\u20d7") ? "→" : symbol);
function bindGallery() {
  const lab = labs.find((x) => x.id === currentLab), s = state(lab);
  $("#lab-picker")?.addEventListener("change", e => { location.hash = link("gallery", e.target.value); });
  // Open question: the animated explanation is loaded and mounted the first time "Comprendre la réponse" is opened.
  const explainHost = $("[data-explain]");
  $(".explain-open")?.addEventListener("toggle", async (e) => {
    if (!explainHost) return;
    if (!e.target.open) { explainHost.__solution?.stop(); return; }
    if (!explainHost.__solution) {
      const { mountExplainer } = await import("./gallery/curiosity-explainers.js");
      if (!explainHost.isConnected) return;
      explainHost.__solution = mountExplainer(explainHost.dataset.explain, explainHost, { lang, reduced: reducedMotion });
    }
    explainHost.__solution?.start();
  });
  if (explainHost && !$(".explain-open")) import("./gallery/curiosity-explainers.js").then(({ mountExplainer }) => {
    if (!explainHost.isConnected) return;
    explainHost.__solution = mountExplainer(explainHost.dataset.explain, explainHost, { lang, reduced: reducedMotion });
  });
  // An article without an animated explanation shows its lead as a cartoon at the board (mounted, not started)
  const articleComic = $("[data-comic-article]");
  if (articleComic) import("./challenges/common/comic.js").then(({ mountComic, hasFormulas }) => {
    const art = articleOf(lab.id);
    if (!articleComic.isConnected || !art) return;
    const lead = [art.lead.map((x) => x[0]).join(" "), art.lead.map((x) => x[1]).join(" ")];
    if (!hasFormulas(lead)) return;   // prose only: the section stays hidden
    articleComic.closest(".art-cartoon").hidden = false;
    const picture = (cv) => import("./home-art.js").then(({ mountArt }) => { if (cv.isConnected) articleComic.__art = mountArt(cv, lab.id); });
    articleComic.__solution = mountComic(lead, articleComic, { lang, reduced: reducedMotion, picture });
  });
  // "Comprendre la réponse" of a checked curiosity: the written explanation played as a short cartoon at the board
  const comicHost = $("[data-comic-explain]");
  $(".explain-comic")?.addEventListener("toggle", async (e) => {
    if (!comicHost) return;
    if (!e.target.open) { comicHost.__solution?.stop(); return; }
    if (!comicHost.__solution) {
      const { mountComic, hasFormulas } = await import("./challenges/common/comic.js");
      if (!comicHost.isConnected || !hasFormulas(lab.explain)) return;
      comicHost.__solution = mountComic(lab.explain, comicHost, { lang, reduced: reducedMotion });
    }
    comicHost.__solution?.start();
  });
  $("#quiz-preset")?.addEventListener("click", () => {
    Object.assign(s, lab.quizState);
    render();
    $("#quiz-preset").focus();
  });
  $("#reset")?.addEventListener("click", () => {
    delete states[lab.id];
    state(lab);
    render();
    $("#reset").focus();
  });
  $("#quiz-answer")?.addEventListener("input", (e) => (s.answer = e.target.value));
  $("#lab-quiz")?.addEventListener("submit", (e) => {
    e.preventDefault();
    s.result = isAnswer(s.answer, lab.answer, lab.tolerance ?? 1e-6);
    if (s.result) {
      completed.add(lab.id);
      save();
      const active = $(".lab-link.selected");
      if (active && !$(".check", active)) active.insertAdjacentHTML("beforeend", `<span class="check" aria-label="${pair("Question réussie", "Check completed")}">✓</span>`);
    }
    $("#quiz-feedback").textContent = s.result
      ? pair("Bien vu ! ", "That’s right! ") + t(lab.explain)
      : pair(
          "Pas encore. Compare les valeurs et l’argument. Tu peux écrire une fraction, comme 1/3.",
          "Not yet. Compare the values and the argument. You can enter a fraction, such as 1/3.",
        );
    $("#quiz-feedback").classList.toggle("success", s.result);
    illuminateFeedback($("#quiz-feedback"), reducedMotion);
  });
}
function challengePage(id) {
  const c = challenges.find((x) => x.id === id);
  if (c) {
    // the list of challenges, grouped by topic, beside the open one
    const groups = [];
    for (const x of challenges) { const key = x.topic[0]; let g = groups.find((y) => y.key === key); if (!g) groups.push((g = { key, label: x.topic, items: [] })); g.items.push({ id: x.id, href: link("challenges", x.id), title: x.title }); }
    return withEntryNav(challengeDetail(c), { t, label: ["Défis", "Challenges"], title: ["Les défis", "The challenges"], groups, current: c.id });
  }
  const filtered = challenges.filter(
    (x) => challengeFilter === "all" || x.type === challengeFilter,
  );
  // Two shelves: challenges whose classic statement asks for a number (the site checks it), and open challenges, whose
  // classic statement asks for a proof, a construction or a yes/no with a reason (the site does not check them).
  const checked = challenges.filter((x) => !VARIANTS[x.id]?.open), isOpen = (x) => Boolean(VARIANTS[x.id]?.open);
  const card = (x) => `<a class="challenge-card" href="${link("challenges", x.id)}"><div class="card-top"><span class="tag ${x.type}">${x.type === "play" ? pair("Récréatif", "Recreational") : pair("Olympiade", "Olympiad")}</span><span class="card-number">${String((isOpen(x) ? challenges.filter(isOpen) : checked).indexOf(x) + 1).padStart(2, "0")}</span></div><span class="challenge-motif" aria-hidden="true">${challengeIcon(x.id)}</span><h2>${t(x.title)}</h2><p>${t(x.topic)}</p><div class="card-bottom"><span>${"●".repeat(x.difficulty)}${"○".repeat(3 - x.difficulty)} <span class="sr-only">${pair("Difficulté", "Difficulty")} ${x.difficulty}/3</span></span><span>${completed.has(x.id) && !isOpen(x) ? pair("✓ Réponse trouvée", "✓ Answer found") : x.minutes + " min"}</span></div></a>`;
  const shelf = (id, title, note, items) => items.length ? `<section class="challenge-shelf" aria-labelledby="${id}"><h2 id="${id}" class="shelf-title">${title}</h2><p class="muted shelf-note">${note}</p><div class="challenge-grid">${items.map(card).join("")}</div></section>` : "";
  return `<main id="main" class="page" tabindex="-1"><div class="page-heading"><div><h1>${pair("À chaque problème, une découverte.", "A discovery in every problem.")}</h1><p>${pair("Prends un crayon. Essaie une idée. La solution animée t’attend quand tu as cherché.", "Grab a pencil. Try an idea. The animated solution is waiting once you have tried.")}</p></div><div class="progress-badge"><strong>${checked.filter((x) => completed.has(x.id)).length} / ${checked.length}</strong><span>${pair("réponses trouvées", "answers found")}</span></div></div><div class="filter-row" role="group" aria-label="${pair("Type de défi", "Challenge type")}">${[
    ["all", "Tous les défis", "All challenges"],
    ["play", "Maths récréatives", "Recreational maths"],
    ["olympiad", "Esprit olympiade", "Olympiad thinking"],
  ]
    .map(
      ([v, fr, en]) =>
        `<button class="filter" data-filter="${v}" aria-pressed="${challengeFilter === v}">${pair(fr, en)}</button>`,
    )
    .join(
      "",
    )}</div>${shelf("shelf-checked", pair("Défis à réponse", "Challenges with an answer"), pair("Le problème demande un nombre : tape-le, le site te dit si c’est juste. Reste à le justifier.", "The problem asks for a number: type it and the site tells you whether it is right. Then justify it."), filtered.filter((x) => !isOpen(x)))}${shelf("shelf-open", pair("Défis ouverts", "Open challenges"), pair("Ici on démontre, on construit, on explique : le site ne vérifie rien. Cherche seul ou à plusieurs, puis regarde la solution animée.", "Here you prove, build, explain: the site checks nothing. Work alone or with others, then watch the animated solution."), filtered.filter(isOpen))}<p class="editorial-note">${pair("Problèmes classiques, posés comme dans leur énoncé d’origine. « Esprit olympiade » désigne le type de raisonnement, pas une provenance officielle. Une réponse numérique ne remplace pas une preuve.", "Classic problems, asked as in their original statement. “Olympiad thinking” describes the reasoning style, not official contest provenance. A numerical answer does not replace a proof.")}</p></main>`;
}
// Parameters of the variation currently shown, per challenge (kept while the visitor browses; not stored).
const variantState = {};
const paramsOf = (id) => (variantState[id] ??= hasVariants(id) ? variantDefaults(id) : {});
const variantText = (c, q) => {
  const v = VARIANTS[c.id];
  return v ? { prompt: v.prompt(q), original: originalOf(c.id, q), answer: v.open ? null : v.answer(q), solution: v.solution(q) } : { prompt: c.prompt, original: null, answer: c.answer, solution: c.solution };
};
function variationPanel(c) {
  if (!hasVariants(c.id)) return "";
  const q = paramsOf(c.id);
  const controls = VARIANTS[c.id].params.map((prm) => prm.kind === "int"
    ? `<label class="var-field" for="var-${prm.id}"><span class="var-label">${t(prm.label)} <output data-out="${prm.id}">${c.id === "konigsberg" && q[prm.id] === 0 ? pair("0 (Königsberg)", "0 (Königsberg)") : q[prm.id]}</output></span><input type="range" id="var-${prm.id}" data-var="${prm.id}" min="${prm.min}" max="${prm.max}" step="${prm.step}" value="${q[prm.id]}"><span class="range-ends" aria-hidden="true"><span>${prm.min}</span><span>${prm.max}</span></span></label>`
    : `<div class="var-field"><label for="var-${prm.id}">${t(prm.label)}${prm.fields ? ' · ' + pair('Exemples facultatifs', 'Optional examples') : ''}</label><select id="var-${prm.id}" data-var="${prm.id}">${prm.fields ? `<option value="custom">${pair('Mes valeurs', 'My values')}</option>` : ''}${prm.options.map(([val, fr, en]) => `<option value="${val}" ${String(q[prm.id]) === String(val) ? 'selected' : ''}>${pair(fr, en)}</option>`).join('')}</select>${prm.fields ? `<div class="var-numbers">${prm.fields.map((field, i) => `<label>${t(field.label)}<input type="number" inputmode="numeric" min="${field.min}" max="${field.max}" step="1" required data-custom="${prm.id}" data-part="${i}" value="${String(q[prm.id]).split(',')[i]}"></label>`).join('')}</div><button class="secondary" type="button" data-apply="${prm.id}">${pair('Appliquer mes valeurs', 'Apply my values')}</button>` : ''}</div>`).join("");
  return `<details class="variation" aria-labelledby="variation-title"><summary id="variation-title">${pair("Modifier les données", "Change the data")}</summary><p class="muted">${pair("Choisis tes valeurs. Le problème, la solution et l’expérience suivront tes réglages.", "Choose your own values. The problem, solution and experiment will follow your settings.")}</p><div class="var-controls">${controls}</div><div class="variation-actions"><button class="text-button" id="var-random" type="button">${pair("Au hasard", "Surprise me")}</button><button class="text-button" id="var-reset" type="button">${pair("Valeurs d’origine", "Original values")}</button></div></details>`;
}
function challengeDetail(c) {
  const v = variantText(c, paramsOf(c.id));
  const open = Boolean(VARIANTS[c.id]?.open);
  return `<main id="main" class="page challenge-detail${open ? " challenge-open" : ""}" tabindex="-1" data-id="${c.id}"><a class="backlink" href="#challenges">${pair("Tous les défis", "All challenges")}</a><div class="challenge-columns"><article><span class="section-kicker">${t(c.topic)} · ${c.minutes} min</span><h1>${t(c.title)}</h1><p class="problem" id="problem">${t(v.prompt)}</p>${variationPanel(c)}${hasActivity(c.id) ? `<section class="activity" aria-labelledby="activity-title"><h2 id="activity-title">${pair("À toi d’explorer", "Explore it yourself")}</h2><div id="activity" data-activity="${c.id}"></div></section>` : ""}${open ? `<p class="open-note">${pair("Défi ouvert : le site ne vérifie pas ta réponse. Cherche, rédige, discutes-en avec d’autres, puis compare avec la solution.", "Open challenge: the site does not check your answer. Think, write it up, talk it over with others, then compare with the solution.")}</p>` : `<form id="challenge-form" data-id="${c.id}"><label for="challenge-answer">${pair("Ta réponse numérique", "Your numerical answer")}</label><div class="answer-row"><input type="text" id="challenge-answer" inputmode="text" required autocomplete="off" placeholder="${pair("Nombre ou fraction", "Number or fraction")}"><button class="primary" type="submit">${pair("Vérifier", "Check")}</button>${VARIANTS[c.id]?.impossible ? `<button class="secondary" type="button" id="challenge-impossible">${pair("Impossible", "Impossible")}</button>` : ""}</div><p id="challenge-feedback" class="feedback" role="status">${completed.has(c.id) ? pair("Tu as déjà trouvé cette réponse. Essaie maintenant de rédiger la preuve.", "You have already found this answer. Now try writing the proof.") : ""}</p></form>`}${v.original ? `<details class="original-statement"><summary>${pair("Jusqu’à la preuve", "All the way to a proof")}</summary><p class="problem original-q" id="original">${t(v.original)}</p><p class="muted">${pair("À traiter seul ou avec d’autres : le site ne vérifie pas cette partie.", "To work out alone or with others: the site does not check this part.")}</p></details>` : ""}</article></div>${readAlso(link("challenges", c.id), [], t)}<section class="solution-wide"><details class="solution"><summary>${pair("Voir la solution expliquée", "See the worked solution")}</summary>${hasSolution(c.id) ? `<div id="solution-anim" class="sol-host" data-solution="${c.id}"></div>` : ""}<details class="written" id="written-solution"><summary>${pair("Version écrite", "Written version")}</summary><div class="sol-host comic-host" id="solution-comic"></div><p id="solution-text">${t(v.solution)}</p></details><div class="extension"><strong>${pair("Pour aller plus loin", "Take it further")}</strong><p>${t(c.extension)}</p></div></details></section></main>`;
}
function bindChallenges() {
  const host = $("#activity"), solHost = $("#solution-anim"), cid = $("#main.challenge-detail")?.dataset.id;
  let stopActivity = () => {}, sol = null;
  // (Re)mount the experiment and the animated solution for the parameters now chosen.
  function mountAll() {
    stopActivity(); sol?.stop();
    const q = cid ? paramsOf(cid) : {};
    stopActivity = host ? mountActivity(host.dataset.activity, host, { lang, reduced: reducedMotion, params: q }) : () => {};
    sol = solHost ? mountSolution(solHost.dataset.solution, solHost, { lang, reduced: reducedMotion, params: q }) : null;
    if (solHost) solHost.__solution = sol;   // handle for the browser tests (seek to any frame)
    if ($(".solution")?.open) sol?.start();
  }
  // The animated solution starts the first time the worked solution is opened and stops when it is closed.
  $(".solution")?.addEventListener("toggle", (e) => (e.target.open ? sol?.start() : sol?.stop()));
  // The written version is also played as a cartoon at the board (common/comic.js), built when it is first opened and
  // rebuilt when the variation changes.
  const comicHost = $("#solution-comic");
  let comicPlayer = null;
  const comicText = () => { const c = challenges.find((x) => x.id === cid); return c ? variantText(c, paramsOf(cid)).solution : null; };
  async function mountWrittenComic() {
    comicPlayer?.stop(); comicPlayer = null;
    if (!comicHost || !$("#written-solution")?.open) return;
    const { mountComic, hasFormulas } = await import("./challenges/common/comic.js");
    const text = comicText();
    if (!comicHost.isConnected || !text || !hasFormulas(text)) return;
    comicPlayer = mountComic(text, comicHost, { lang, reduced: reducedMotion, icon: challengeIcon(cid) || "" });
    comicHost.__solution = comicPlayer;
    comicPlayer.start();
  }
  $("#written-solution")?.addEventListener("toggle", (e) => (e.target.open ? mountWrittenComic() : comicPlayer?.stop()));
  mountAll();
  const stopPress = $("#main") ? cartoonPress($("#main"), reducedMotion, "#challenge-form button, .variation-actions button") : () => {};
  const stop = () => { stopActivity(); sol?.stop(); comicPlayer?.stop(); stopPress(); };
  if (cid && hasVariants(cid)) {
    const c = challenges.find((x) => x.id === cid);
    const refresh = () => {
      const q = paramsOf(cid), v = variantText(c, q);
      $("#problem").innerHTML = t(v.prompt);
      if ($("#original") && v.original) $("#original").innerHTML = t(v.original);
      $("#solution-text").innerHTML = t(v.solution);
      if (comicPlayer) mountWrittenComic();
      if ($("#challenge-feedback")) { $("#challenge-feedback").textContent = ""; $("#challenge-feedback").classList.remove("success"); $("#challenge-answer").value = ""; }
      mountAll();
    };
    const syncControls = () => {
      const q = paramsOf(cid);
      document.querySelectorAll("[data-var]").forEach((el) => {
        el.value = q[el.dataset.var]; if (el.tagName === 'SELECT' && el.selectedIndex < 0) el.value = 'custom';
        const o = $(`[data-out="${el.dataset.var}"]`); if (o) o.textContent = q[el.dataset.var];
      });
      document.querySelectorAll('[data-custom]').forEach((el) => { el.value = String(q[el.dataset.custom]).split(',')[Number(el.dataset.part)]; el.setCustomValidity(''); });
    };
    const read = () => { const q = {}; document.querySelectorAll("[data-var]").forEach((el) => { if (el.type !== "radio" || el.checked) q[el.dataset.var] = el.value; }); variantState[cid] = normaliseVariant(cid, q); };
    document.querySelectorAll("[data-var]").forEach((el) => {
      el.addEventListener("input", () => { const o = $(`[data-out="${el.dataset.var}"]`); if (o && el.type !== "radio") o.textContent = el.value; });
      el.addEventListener("change", () => { if (el.value === 'custom') { document.querySelector(`[data-custom="${el.dataset.var}"]`)?.focus(); return; } read(); syncControls(); refresh(); });
    });
    const applyCustom = (id) => {
      const prm = VARIANTS[cid].params.find((p) => p.id === id), fields = [...document.querySelectorAll(`[data-custom="${id}"]`)];
      fields.forEach((el) => el.setCustomValidity(''));
      const invalid = fields.find((el) => !el.checkValidity()); if (invalid) { invalid.reportValidity(); return; }
      const values = fields.map((el) => Number(el.value));
      if (prm.validate && !prm.validate(values)) { fields.at(-1).setCustomValidity(t(prm.error)); fields.at(-1).reportValidity(); return; }
      variantState[cid] = normaliseVariant(cid, { ...paramsOf(cid), [id]: values.join(',') }); syncControls(); refresh();
    };
    document.querySelectorAll('[data-apply]').forEach((el) => el.addEventListener('click', () => applyCustom(el.dataset.apply)));
    document.querySelectorAll('[data-custom]').forEach((el) => {
      el.addEventListener('input', () => { el.setCustomValidity(''); $(`[data-var="${el.dataset.custom}"]`).value = 'custom'; });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyCustom(el.dataset.custom); } });
    });
    $("#var-random")?.addEventListener("click", () => { variantState[cid] = randomParams(cid); syncControls(); refresh(); $("#var-random").focus(); });
    $("#var-reset")?.addEventListener("click", () => { variantState[cid] = variantDefaults(cid); syncControls(); refresh(); $("#var-reset").focus(); });
  }
  document.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      challengeFilter = b.dataset.filter;
      render();
      $(`[data-filter="${challengeFilter}"]`).focus();
    }),
  );
  // `raw` is what the learner typed, or "0" for the neutral Impossible button (only offered when the answer can be impossible).
  const check = (raw) => {
    const c = challenges.find((x) => x.id === cid), correct = isAnswer(raw, variantText(c, paramsOf(c.id)).answer);
    if (correct) {
      completed.add(c.id);
      save();
    }
    $("#challenge-feedback").textContent = correct
      ? pair(
          "C’est la bonne valeur. Maintenant, justifie-la : la solution t’aide à comparer ton raisonnement.",
          "That is the correct value. Now justify it: use the solution to compare your reasoning.",
        )
      : pair("Pas encore.", "Not yet.");
    $("#challenge-feedback").classList.toggle("success", correct);
    illuminateFeedback($("#challenge-feedback"), reducedMotion);
  };
  $("#challenge-form")?.addEventListener("submit", (e) => { e.preventDefault(); check($("#challenge-answer").value); });
  $("#challenge-impossible")?.addEventListener("click", () => { $("#challenge-answer").value = ""; check("0"); });
  return stop;
}
// Pathways page: curriculum rail, level tabs, topic filters and tile grid (js/pathways-view.js).
function pathwayPage() { return pathwayPageView({ pathways: livePathways, labs, t, pair, icon }); }

$(".skip").addEventListener("click", e => {
  e.preventDefault();
  $("#main")?.focus();
  $("#main")?.scrollIntoView({ block: "start" });
});
window.addEventListener("hashchange", () => {
  render().then(() => {
    $("#main")?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  });
});
installEntrySwitch($("#app"), teacherState);
// A change of audience redraws the home at once (the link may point to the page already open); elsewhere the header
// is enough, and a page that owns its state (the dashboard) is left alone.
window.addEventListener("mx-teacher-change", e => {
  if (e.detail?.kind !== "entry") return;
  if (route().page === "home") render();
  else { const bar = $("#app .topbar .audience-menu"); if (bar) { const box = document.createElement("div"); box.innerHTML = header(route().page); const fresh = box.querySelector(".audience-menu"); if (fresh) bar.replaceWith(fresh); } }
});
// The profile menu opens inside the window: the tools row moves with the width and the text size (left under the brand
// on a phone, right of the brand elsewhere), so the list is placed when it opens, from its button, never off screen.
document.addEventListener("toggle", e => {
  const m = e.target; if (!m.matches?.(".audience-menu") || !m.open) return;
  const list = m.querySelector(".audience-list"), box = m.getBoundingClientRect(), w = list.offsetWidth, gap = 12;
  const left = Math.max(gap, Math.min(box.right - w, window.innerWidth - gap - w));   // right-aligned when it fits
  list.style.right = "auto"; list.style.left = `${Math.round(left - box.left)}px`;
}, true);
// The profile menu closes on a choice, on Escape and on a click outside.
document.addEventListener("click", e => { const m = $(".audience-menu[open]"); if (m && (!m.contains(e.target) || e.target.closest("a"))) m.open = false; });
document.addEventListener("keydown", e => { const m = e.key === "Escape" && $(".audience-menu[open]"); if (m) { m.open = false; m.querySelector("summary").focus(); } });
$("#app").addEventListener("click", e => { const a = e.target.closest?.("[data-teacher-mode]"); if (a) teacherState.setMode(a.dataset.teacherMode); });
// A teacher who chose the dashboard lands on it when opening the site without a destination.
{ const landing = landingHash(location.hash, teacherState.getEntry()); if (landing) history.replaceState(null, "", landing); }
render();
installOffline();

// Optional browser-standard agent access; ordinary browsers need no polyfill or service (nor the catalogue it lists).
if (document.modelContext?.registerTool) ensure(["content"]).then(() => {
  const lifecycle = new AbortController();
  const register = (tool) => {
    try {
      Promise.resolve(
        document.modelContext.registerTool(tool, { signal: lifecycle.signal }),
      ).catch(() => {});
    } catch {}
  };
  register({
    name: "list_math_experiments",
    description: "List the available mathematics experiments.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => labs.map((l) => ({ id: l.id, title: t(l.title) })),
  });
  register({
    name: "configure_math_experiment",
    description:
      "Open an experiment and optionally set its numeric sliders. This does not submit a learning answer.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", enum: labs.map((l) => l.id) },
        values: { type: "array", items: { type: "number" } },
      },
      required: ["id"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false },
    execute: async (input) => {
      const l = labs.find((x) => x.id === input?.id);
      if (!l) throw new Error("Unknown experiment");
      if (input.values !== undefined) {
        if (
          !Array.isArray(input.values) ||
          input.values.length !== l.params.length ||
          input.values.some(
            (v, i) =>
              !Number.isFinite(v) ||
              v < l.params[i][1] ||
              v > l.params[i][2] ||
              Math.abs(
                (v - l.params[i][1]) / l.params[i][3] -
                  Math.round((v - l.params[i][1]) / l.params[i][3]),
              ) > 1e-7,
          )
        )
          throw new Error("Invalid slider values");
        state(l).values = [...input.values];
        state(l).bins = null;
        state(l).trials = 0;
      }
      history.replaceState(null, "", link("lab", l.id));
      await render();
      $("#main")?.focus({ preventScroll: true });
      return { id: l.id, values: state(l).values };
    },
  });
  window.addEventListener("pagehide", () => lifecycle.abort(), { once: true });
}).catch(() => {});
