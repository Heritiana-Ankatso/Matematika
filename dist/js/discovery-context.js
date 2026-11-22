// The box "Cette idée dans le site" at the end of a page: the first field of the resource and the resources that follow
// the idea. One markup for discovery.js (from the live index) and app.js (from discovery-context-data.js, generated).
const E = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// entry: { field: { key, topic, subtopic } | null, next: [{ route, title, format }] }, titles and formats as [fr, en]
export function contextBox({ field, next }, t) {
  return `<aside class="discovery-context" aria-label="${t(['Cette idée dans le site','This idea across the site'])}"><nav aria-label="${t(['Domaines de cette ressource','Fields of this resource'])}"><a href="#topics">${t(['Explorer par domaine','Browse by field'])}</a>${field ? ` / <a href="#topics/${field.key}">${E(t(field.topic))} : ${E(t(field.subtopic))}</a>` : ''}</nav>${next.length ? `<details><summary>${t(['Poursuivre cette idée','Follow this idea'])}</summary><ul>${next.map((x) => `<li><a href="${E(x.route)}">${E(t(x.title))}</a> <span class="muted">${E(t(x.format))}</span></li>`).join('')}</ul></details>` : ''}</aside>`;
}
