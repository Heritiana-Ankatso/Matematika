// The lessons and exercises of the chapters whose companion guide names an experiment or exhibit ("Cours et exercices
// liés"), for the laboratory and gallery pages, which do not load the course library itself.
import { resourceCatalog as completeCatalog } from './resources-data.js';
import { liveCompanionCatalog, liveCourses } from './live-curriculum.js';
import { guides } from './learning-content.js';
const resourceCatalog = liveCompanionCatalog(completeCatalog);
const P=(fr,en)=>[fr,en];
const courses=Object.fromEntries(liveCourses.map(c=>[c.id,c.title]));
const E=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// The chapters whose companion guide names `labId`, with the course title: [{ id, course: pair, title: pair }].
export const chaptersForLab=labId=>resourceCatalog.chapters.filter(c=>guides[c.topic]?.lab===labId).map(c=>({id:c.id,course:courses[c.course],title:c.title}));
export function relatedChapters(labId,t){const related=resourceCatalog.chapters.filter(c=>guides[c.topic]?.lab===labId);return related.length?`<details class="related-chapters"><summary>${t(P('Cours et exercices liés','Related lessons and exercises'))}</summary><div>${related.map(c=>`<a href="#chapter/${c.id}">${E(t(courses[c.course]))} · ${E(t(c.title))}</a>`).join('')}</div></details>`:'';}
