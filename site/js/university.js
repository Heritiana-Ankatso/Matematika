import {fourierLinks} from './fourier-links.js';
import { university } from './catalogue-data.js';
import { assetHref } from './data-loader.js';
const E = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const P = (fr, en, L) => L ? en : fr;
export function universityPage(lang = 'fr') {
  const L = lang === 'en';
  return `<main id="main" class="page university-page" tabindex="-1"><nav class="breadcrumb" aria-label="${P('Fil d’Ariane','Breadcrumb',L)}"><a href="#pathways/university">${P('Programmes','Curricula',L)}</a><span>/</span>${P('Université','University',L)}</nav><div id="university-content" aria-busy="true"><h1>${P('Université','University',L)}</h1><p role="status">${P('Chargement des ressources…','Loading resources…',L)}</p></div></main>`;
}
export function universityContent(index, id = '', lang = 'fr') {
  if(!index.sections.length)return `<h1>${E(index.title[lang==='en'?1:0])}</h1><p>${lang==='en'?'No collections available.':'Aucune collection disponible.'}</p>`;
  const L = lang === 'en' ? 1 : 0, section = index.sections.find(s => s.sequences.some(q => q.id === id)) || index.sections[0], seq = section.sequences.find(s => s.id === id);
  const file = (key, label, page = '') => {
    const f = index.files[key], language=index.sections.find(s=>s.sequences.some(q=>q.id===key)||s.documents.some(d=>d.key===key))?.language || 'fr', type = f.path.endsWith('.pdf') ? 'PDF' : f.path.endsWith('.zip') ? 'ZIP' : 'HTML';
    const size = (f.bytes / 1024).toLocaleString(lang, {maximumFractionDigits:0});
    return `<a class="university-file" href="./${E(assetHref(f.path))}${page ? '#page=' + page : ''}"><strong>${E(label)}</strong><span>${type} · ${E(language.toUpperCase())} · ${f.pages ? f.pages + ' p. · ' : ''}${size} ${L ? 'KB' : 'Ko'}</span></a>`;
  };
  // Lesson editions (Algèbre 1): the course and its exercises are one click away, from the index and from the sequence page.
  const lessonHref = q => './' + assetHref(index.files[q.id].path);
  const lessonActions = q => q.edition !== 'lesson' ? '' : `<div class="lesson-actions"><a class="lesson-go primary" href="${E(lessonHref(q))}"><strong>${P('Lire le cours','Read the course',L)}</strong><span>${P('définitions, résultats, démonstrations, figures','definitions, results, proofs, figures',L)}</span></a>${q.exercises ? `<a class="lesson-go" href="${E(lessonHref(q))}#exercices"><strong>${P('Faire les exercices','Do the exercises',L)}</strong><span>${q.exercises} ${P('exercices corrigés, par niveau','exercises with solutions, by level',L)}</span></a>` : ''}</div>`;
  const lessonIndex = section => `<ol class="university-sequences is-lessons">${section.sequences.map(q=>`<li><div class="university-sequence"><span class="sequence-number">${q.number}</span><div><h3><a href="#university/${E(q.id)}">${E(q.title[L])}</a></h3><p>${E(q.summary[L])}</p>${lessonActions(q)}</div></div></li>`).join('')}</ol>`;
  if (id && !seq) return `<h1>${P('Séquence introuvable','Sequence not found',L)}</h1><a href="#university">${P('Revenir aux fondements','Back to foundations',L)}</a>`;
  const documents = section => section.documents;
  const commonFor = section => `<section class="university-documents"><h2>${P('Documents de la collection','Collection documents',L)}</h2><div class="university-files">${documents(section).map(d=>file(d.key,d.label[L])).join('')}</div><p class="muted">${section.note?E(section.note[L]):section.id==='fourier'?P('Les leçons web, les cours, les exercices et leurs corrigés sont en français.','Web lessons, notes, exercises and solutions are in French.',L):P('Les cahiers et guides PDF sont des supports de lecture et de travail. Les diaporamas HTML nécessitent une connexion pour afficher les formules.','PDF workbooks and guides are reading and practice materials. HTML decks require a connection to display formulas.',L)}</p></section>`;
  const common = commonFor(section);
  const triangle = section.id === 'fourier' ? fourierLinks('lessons', lang) : '';
  const lessonLabel = seq?.edition === 'lesson' ? P('Lire la leçon complète','Read the full lesson',L) : P('Ouvrir le diaporama interactif','Open the interactive slides',L);
  if (!seq) return `<h1>${E(index.title[L])}</h1><p class="page-intro">${P('Choisis une collection, puis une séquence. Retrouve les documents complets sous chaque collection.','Choose a collection, then a sequence. Complete documents are grouped below each collection.',L)}</p><nav aria-label="${P('Collections universitaires','University collections',L)}"><ul>${index.sections.map(s=>`<li><a href="${s.sequences.length ? '#university/' + E(s.sequences[0].id) : '#university'}">${E(s.title[L])}</a></li>`).join('')}</ul></nav>${index.sections.map(section=>`<section>${section.id==='fourier'?fourierLinks('lessons',lang):''}<h2>${E(section.title[L])}</h2><p>${E(section.intro[L])}</p>${section.sequences.every(q=>q.edition==='lesson')?`${lessonIndex(section)}${commonFor(section)}`:`<ol class="university-sequences">${section.sequences.map(s=>`<li><a class="university-sequence" href="#university/${E(s.id)}"><span class="sequence-number">${s.number}</span><div><h3>${E(s.title[L])}</h3><p>${E(s.summary[L])}</p><span>${P('Ouvrir la séquence','Open sequence',L)} →</span></div></a></li>`).join('')}</ol>${commonFor(section)}`}</section>`).join('')}`;
  const at = section.sequences.indexOf(seq);
  const nav = `<nav class="sequence-forward" aria-label="${P('Navigation des séquences','Sequence navigation',L)}">${at ? `<a href="#university/${section.sequences[at-1].id}">← ${E(section.sequences[at-1].title[L])}</a>` : '<span></span>'}${at < section.sequences.length-1 ? `<a href="#university/${section.sequences[at+1].id}">${E(section.sequences[at+1].title[L])} →</a>` : ''}</nav>`;
  // Lesson editions: the lesson itself is displayed here (course and exercises), documents live in an auxiliary menu.
  if (seq.edition === 'lesson') {
    const href = lessonHref(seq), docLink = (d, label) => `<li><a href="./${E(assetHref(index.files[d.key || d].path))}"${(d.key || d) === seq.id ? ' download' : ''}>${E(label)}</a></li>`;
    const menu = `<details class="university-aux"><summary>${P('PDF et téléchargements','PDF and downloads',L)}</summary><ul>${section.documents.map(d => docLink(d, d.label[L])).join('')}<li><a href="${E(href)}" target="_blank" rel="noopener">${P('Ouvrir la leçon en pleine page','Open the lesson full page',L)}</a></li><li><a href="${E(href)}" download>${P('Télécharger la leçon (HTML)','Download the lesson (HTML)',L)}</a></li></ul></details>`;
    const tabs = `<div class="lesson-tabs" role="group" aria-label="${P('Partie de la leçon','Part of the lesson',L)}"><button type="button" data-lesson-tab="cours" aria-pressed="true">${P('Cours','Course',L)}</button>${seq.exercises ? `<button type="button" data-lesson-tab="exercices" aria-pressed="false">${P('Exercices','Exercises',L)} · ${seq.exercises}</button>` : ''}</div>`;
    return `<div class="lesson-head"><a class="text-button" href="#university">← ${E(section.title[L])}</a><span class="muted">${P('Séquence','Sequence',L)} ${seq.number} / ${section.sequences.length} · ${E(section.language.toUpperCase())}</span>${menu}</div><h1>${E(seq.title[L])}</h1>${tabs}${seq.labRef?`<p><a class="secondary" href="#lab/${E(seq.labRef)}">${P('Expérimenter cette leçon','Experiment with this lesson',L)} →</a></p>`:''}<iframe class="lesson-frame" title="${E(seq.title[L])}" src="${E(href)}#cours" loading="lazy"></iframe>${nav}`;
  }
  return `<a class="text-button" href="#university">← ${E(section.title[L])}</a><p class="muted">${P('Séquence','Sequence',L)} ${seq.number} / ${section.sequences.length} · ${E(section.language.toUpperCase())}</p><h1>${E(seq.title[L])}</h1><p class="page-intro">${E(seq.summary[L])}</p>${lessonActions(seq)}<p><strong>${P('Prérequis :','Prerequisites:',L)}</strong> ${E(seq.prerequisites[L])}</p>${triangle}${seq.outline?.length?`<section><h2>${P('Au programme','Contents',L)}</h2><ol class="university-outline">${seq.outline.map(t=>`<li>${E(t.replace(/\$([^$]*)\$/g,'$1'))}</li>`).join('')}</ol></section>`:''}<section><h2>${P('Explorer puis formaliser','Explore, then formalise',L)}</h2><p>${seq.edition==='lesson'?(seq.labRef?P('Explore le laboratoire associé, puis lis la leçon et résous les exercices.','Explore the associated laboratory, then read the lesson and solve the exercises.',L):P('Lis la leçon en manipulant ses figures, puis travaille les exercices : cherche, ouvre l’indication, rédige, et seulement ensuite lis le corrigé.','Read the lesson while handling its figures, then work through the exercises: search, open the hint, write your answer, and only then read the solution.',L)):P('Manipule la figure du diaporama, avance par étapes, puis retrouve la trace écrite dans les notes de cours.','Manipulate the slide figure, move through the steps, then return to the written notes.',L)}</p>${seq.labRef?`<p><a class="secondary" href="#lab/${E(seq.labRef)}">${P('Expérimenter cette leçon','Experiment with this lesson',L)} →</a></p>`:''}<div class="university-files">${file(seq.id,lessonLabel)}<a class="university-file" href="./${E(assetHref(index.files[seq.id].path))}" download>${P("Télécharger HTML","Download HTML",L)}</a>${(section.studyDocuments || []).map(d=>file(d.key,d.label[L],d.pageField ? seq[d.pageField] : '')).join('')}</div></section>${common}${nav}`;
}
export async function bindUniversity(id = '', lang = 'fr') {
  const root = document.querySelector('#university-content');
  try {
    const index = university; if (!root?.isConnected) return;
    root.innerHTML = universityContent(index, id, lang); root.setAttribute('aria-busy','false');
    const frame = root.querySelector('.lesson-frame');
    root.querySelectorAll('[data-lesson-tab]').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('[data-lesson-tab]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      try { frame.contentWindow.location.hash = '#' + b.dataset.lessonTab; } catch { frame.src = frame.src.split('#')[0] + '#' + b.dataset.lessonTab; }
    }));
  } catch {
    if (!root?.isConnected) return;
    root.innerHTML = `<h1>${lang === 'en' ? 'University' : 'Université'}</h1><p role="alert">${lang === 'en' ? 'Resources could not be loaded. Please reload the page.' : 'Impossible de charger les ressources. Recharge la page pour réessayer.'}</p>`;
    root.setAttribute('aria-busy','false');
  }
}
