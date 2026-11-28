// The napkin ring on the GPU (maths in gallery-napkin-model.js; stage in gl3d.js). Each ring is drawn from its exact equations in the
// vertex shader (outer band ρ = √(R² − z²), drilled wall ρ = r, flat cut ρ ∈ [r, √(R² − z₀²)]), so every slider only changes
// uniforms and the motion stays smooth. Both rings are always drawn whole; the slice is an x-ray annulus at level z₀ whose area
// π(h²/4 − z₀²) does not depend on R. A bracket marks h on each ring and a big = or ≠ says whether the volumes agree.
// "Grow the sphere" lets the right sphere grow at fixed h: the ring gets thinner and wider, its volume stays π h³/6.
// Layout: the canvas and the controls sit side by side (the canvas stays in view while the page scrolls); on a phone the canvas sticks above the controls.
import { glStage, compile, vao, gridMesh, rgb, GLSL_LIGHT, clamp } from './gl3d.js';
import { holeRadius, height, sliceArea, volume } from './gallery-napkin-model.js';
import { field as sliderField, bind } from '../object-kit.js';
import { metricStrip, plotPanel } from './gallery-panels.js';

const RING_VS = `#version 300 es
precision highp float;
in vec2 aUV;
uniform mat4 uVP; uniform vec3 uC; uniform float uS, uR, uH, ur, uZc; uniform int uKind, uPart;
out vec3 vW; out vec3 vN; out vec2 vRZ;
void main(){
  float th = aUV.x * 6.283185307179586, c = cos(th), s = sin(th), h2 = uH * 0.5;
  float z0 = uPart == 0 ? -h2 : uZc, z1 = uPart == 0 ? uZc : h2, rho, z; vec3 n;
  if (uKind == 0) { z = mix(z0, z1, aUV.y); rho = sqrt(max(uR * uR - z * z, 0.0)); n = vec3(rho * c, rho * s, z) / uR; }
  else if (uKind == 1) { z = mix(z0, z1, aUV.y); rho = ur; n = vec3(-c, -s, 0.0); }
  else if (uKind == 2) { z = uZc; rho = mix(ur, sqrt(max(uR * uR - z * z, 0.0)), aUV.y); n = vec3(0.0, 0.0, 1.0); }
  else { float ph = (aUV.y - 0.5) * 3.141592653589793; n = vec3(cos(ph) * c, cos(ph) * s, sin(ph)); rho = uR * cos(ph); z = uR * sin(ph); }
  vW = uC + uS * vec3(rho * c, rho * s, z); vN = n; vRZ = vec2(rho, z);
  gl_Position = uVP * vec4(vW, 1.0);
}`;
const RING_FS = `#version 300 es
precision highp float; precision highp int;
in vec3 vW; in vec3 vN; in vec2 vRZ;
uniform vec3 uEye, uCol, uCut; uniform int uKind; uniform float uAlpha, ur, uR, uZc;
out vec4 frag;
${GLSL_LIGHT}
float ring(float x, float step){ float f = abs(fract(x / step + 0.5) - 0.5) * step, w = fwidth(x); return 1.0 - smoothstep(w * 0.6, w * 1.6, f); }
void main(){
  vec3 V = normalize(uEye - vW), n = normalize(vN); if (dot(n, V) < 0.0) n = -n;
  vec3 base = uCol;
  if (uKind == 1) base = uCol * (0.62 + 0.08 * ring(vRZ.y, 0.25));                    // drilled wall, faint tool marks
  if (uKind == 2) { base = uCut; base = mix(base, base * 0.55, 0.6 * ring(vRZ.x, 0.5)); }   // the cut: rings every 0.5 cm
  if (uKind == 3) { float f = pow(1.0 - abs(dot(n, V)), 2.2); float a = uAlpha * (0.06 + 0.5 * f); frag = vec4(pow(uCol, vec3(1.0 / 2.2)) * a, a); return; }
  vec3 col = studio(base, n, V, uKind == 2 ? 20.0 : 70.0, uKind == 2 ? 0.08 : 0.45);
  frag = vec4(toSRGB(col) * uAlpha, uAlpha);
}`;

export function napkinRingGL(root, opts) {
  const { t, lang } = opts, reduced = typeof opts.reduced === 'function' ? opts.reduced : () => !!opts.reduced;
  const num = (v, d = 2) => Number(v).toLocaleString(lang, { maximumFractionDigits: d, minimumFractionDigits: d });
  const st = { RA: 4, RB: 8, h: 6, r: 2, mode: 'height', cut: 0.4, slice: true, ghost: true, growing: false, grow: 0 };
  const page = nkPage(root, t,
    t('Deux sphères de rayons différents sont percées de part en part : il reste un anneau. Les deux anneaux ont la même hauteur h. Lequel contient le plus de matière ? Devine, puis regarde le signe entre eux.', 'Two spheres of different radii are drilled right through, leaving a ring. Both rings have the same height h. Which holds more material? Guess, then look at the sign between them.'),
    `<label class="act-field exhibit-select nk-wide"><span class="act-label">${t('On garde', 'Keep the same')}</span><select id="ng-mode"><option value="height">${t('la même hauteur h', 'height h')}</option><option value="hole">${t('le même trou (rayon r)', 'hole radius r')}</option></select></label>` +
    sliderField('ng-ra', t('Sphère de gauche, R₁ (cm)', 'Left sphere, R₁ (cm)'), 3, 8, 0.5, st.RA) + sliderField('ng-rb', t('Sphère de droite, R₂ (cm)', 'Right sphere, R₂ (cm)'), 3, 8, 0.5, st.RB) +
    sliderField('ng-h', t('Hauteur h (cm)', 'Height h (cm)'), 1, 6, 0.5, st.h) + sliderField('ng-r', t('Rayon du trou r (cm)', 'Hole radius r (cm)'), 0.5, 2.9, 0.1, st.r) +
    `<label class="act-check nk-wide"><input id="ng-slice" type="checkbox" checked> ${t('Montrer une tranche horizontale', 'Show a horizontal slice')}</label>` +
    sliderField('ng-cut', t('Niveau de la tranche (fraction de h/2)', 'Level of the slice (fraction of h/2)'), -1, 1, 0.01, st.cut).replace('class="act-field"', 'class="act-field nk-wide"') +
    `<div class="act-buttons nk-wide"><button type="button" class="btn btn-primary" id="ng-grow">${t('Faire grossir la sphère de droite', 'Grow the right sphere')}</button><label class="act-check"><input id="ng-ghost" type="checkbox" checked> ${t('Montrer les sphères d’origine', 'Show the original spheres')}</label></div>`,
    `<p>${t('Percée par un trou cylindrique de rayon r, une sphère de rayon R laisse un anneau de hauteur h = 2√(R² − r²). À la hauteur z, sa tranche est une couronne entre r et √(R² − z²), d’aire π(R² − z²) − πr² = π(h²/4 − z²) : R a disparu. Deux anneaux de même hauteur ont donc des tranches de même aire à chaque niveau, et par le principe de Cavalieri le même volume : V = ∫ π(h²/4 − z²) dz = π h³/6.', 'Drilled by a cylindrical hole of radius r, a sphere of radius R leaves a ring of height h = 2√(R² − r²). At height z its slice is an annulus between r and √(R² − z²), of area π(R² − z²) − πr² = π(h²/4 − z²): R has gone. Two rings of the same height therefore have slices of equal area at every level, and by Cavalieri’s principle the same volume: V = ∫ π(h²/4 − z²) dz = π h³/6.')}</p>` +
    `<p>${t('Le volume est donné exactement, comme multiple de π, quand h est un multiple de 0,5 cm. Avec le même trou, les hauteurs diffèrent et les volumes aussi. Les anneaux sont dessinés à partir de leurs équations, point par point sur la carte graphique, sans facettes.', 'The volume is given exactly, as a multiple of π, when h is a multiple of 0.5 cm. With the same hole, the heights differ and so do the volumes. The rings are drawn from their equations, point by point on the graphics card, with no facets.')}</p>`);
  const stage = glStage(page.host, { aspect: 1.6, label: t('Deux anneaux de serviette en 3D. Flèches pour tourner, + et − pour zoomer, 0 pour revenir.', 'Two napkin rings in 3D. Arrows turn them, + and − zoom, 0 resets.'), view: { yaw: -0.3, pitch: 0.5, dist: 5.9, fov: 0.5 }, minDist: 2.5, maxDist: 14, reduced, scope: root });
  if (!stage) return null;
  const gl = stage.gl, $ = (s) => root.querySelector(s);
  const metrics = metricStrip(page.slot, t, [
    { id: 'va', label: t('Volume de l’anneau de gauche', 'Volume of the left ring'), kind: 'exact' },
    { id: 'vb', label: t('Volume de l’anneau de droite', 'Volume of the right ring'), kind: 'exact' },
    { id: 'sa', label: t('Aire de la coupe, gauche', 'Area of the cut, left'), kind: 'exact' },
    { id: 'sb', label: t('Aire de la coupe, droite', 'Area of the cut, right'), kind: 'exact' },
  ]);
  const plot = plotPanel(metrics.el, t('Aire de la tranche selon sa hauteur z : les deux courbes, π(h²/4 − z²), coïncident quand les hauteurs sont égales.', 'Area of the slice against its height z: the two curves, π(h²/4 − z²), coincide when the heights are equal.'), { aspect: 640 / 300 });
  let P, mesh, cap;
  function build() { P = compile(gl, RING_VS, RING_FS); const g = gridMesh(256, 96); mesh = vao(gl, P, { aUV: { data: g.uv, size: 2 } }, g.idx); const c = gridMesh(256, 8); cap = vao(gl, P, { aUV: { data: c.uv, size: 2 } }, c.idx); }
  // ring dimensions (cm): same height or same hole
  function dims() {
    const RB = st.growing || st.grow > 0 ? st.grow : st.RB, same = st.mode === 'height' || st.growing;
    return [st.RA, RB].map((R) => { const h = same ? Math.min(st.h, 2 * R - 1e-9) : height(R, Math.min(st.r, R - 0.05)); return { R, h, r: holeRadius(R, h) }; });
  }
  // V/π = h³/6 as a reduced fraction when 2h is an integer
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function exactVolume(h) {
    const k = Math.round(2 * h); if (Math.abs(k - 2 * h) > 1e-9) return `≈ ${num(volume(h), 3)} cm³`;
    const p = k ** 3, q = 48, d = gcd(p, q), a = p / d, b = q / d;
    return `${b === 1 ? a : `${a}/${b} `}π ≈ ${num(volume(h), 3)} cm³`;
  }
  const scale = () => 1 / 9;
  function centres(D) { const S = scale(), m = Math.max(D[0].R, D[1].R) * S; return [[0, -(m + 0.16), 0], [0, m + 0.16, 0]]; }
  stage.draw = (f) => {
    const C = f.C, D = dims(), S = scale(), cs = centres(D), VP = new Float32Array(f.viewProj);
    gl.useProgram(P); gl.uniformMatrix4fv(P.u('uVP'), false, VP); gl.uniform3fv(P.u('uEye'), f.eye); gl.uniform1f(P.u('uS'), S);
    const obj = rgb(C.object), cut = rgb(C.obj2), ink = rgb(C.ink);
    gl.uniform3fv(P.u('uCut'), cut);
    const pass = (d, c, part, alpha, zc) => {
      gl.uniform3fv(P.u('uC'), c); gl.uniform1f(P.u('uR'), d.R); gl.uniform1f(P.u('uH'), d.h); gl.uniform1f(P.u('ur'), d.r); gl.uniform1f(P.u('uZc'), zc);
      gl.uniform1i(P.u('uPart'), part); gl.uniform1f(P.u('uAlpha'), alpha); gl.uniform3fv(P.u('uCol'), obj);
    };
    // 1. both rings, whole and opaque (the part runs from the bottom to the top: zc = h/2)
    gl.bindVertexArray(mesh.vao);
    D.forEach((d, i) => { pass(d, cs[i], 0, 1, d.h / 2); for (const k of [0, 1]) { gl.uniform1i(P.u('uKind'), k); gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0); } });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    // 2. the slice, seen through the ring (x-ray): the annulus of area π(h²/4 − z²)
    if (st.slice) {
      gl.disable(gl.DEPTH_TEST); gl.bindVertexArray(cap.vao);
      D.forEach((d, i) => { pass(d, cs[i], 0, 0.9, clamp(st.cut, -1, 1) * d.h / 2); gl.uniform1i(P.u('uKind'), 2); gl.drawElements(gl.TRIANGLES, cap.count, gl.UNSIGNED_INT, 0); });
      gl.enable(gl.DEPTH_TEST);
    }
    // 3. the original spheres as faint glass
    if (st.ghost) D.forEach((d, i) => { gl.uniform3fv(P.u('uC'), cs[i]); gl.uniform1f(P.u('uR'), d.R); gl.uniform1i(P.u('uKind'), 3); gl.uniform1f(P.u('uAlpha'), f.dark ? 0.8 : 0.55); gl.uniform3fv(P.u('uCol'), ink); gl.bindVertexArray(mesh.vao); gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_INT, 0); });
    gl.depthMask(true); gl.disable(gl.BLEND); gl.bindVertexArray(null);
    report(D);
  };
  // "36π" when 2h is an integer, else the value in cm³
  const vShort = (h) => { const k = Math.round(2 * h); if (Math.abs(k - 2 * h) > 1e-9) return `${num(volume(h), 1)} cm³`; const p = k ** 3, d = gcd(p, 48), a = p / d, b = 48 / d; return `${b === 1 ? (a === 1 ? '' : a) : `${a}/${b} `}π cm³`; };
  stage.drawOverlay = (g, f) => {
    const C = f.C, D = dims(), S = scale(), cs = centres(D), k = Math.max(0.72, Math.min(1.15, f.W / 640)), font = (w, px) => `${w} ${Math.round(px * k)}px "Atkinson Hyperlegible", system-ui, sans-serif`;
    const text = (s, p, fill) => { g.strokeText(s, p[0], p[1]); g.fillStyle = fill; g.fillText(s, p[0], p[1]); };
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 4; g.lineJoin = 'round'; g.strokeStyle = C.sunken;
    D.forEach((d, i) => {
      const c = cs[i], top = stage.project([c[0], c[1], c[2] + d.R * S + 0.12]), bot = stage.project([c[0], c[1], c[2] - d.R * S - 0.14]);
      g.font = font(700, 15); text(`R = ${num(d.R, 1)} cm`, top, C.ink);
      g.font = font(800, 17); text(`V = ${vShort(d.h)}`, [bot[0], bot[1] - 2 * k], C.ink);
      g.font = font(600, 12.5); text(`h = ${num(d.h, 2)} · r = ${num(d.r, 2)} cm`, [bot[0], bot[1] + 17 * k], C.muted);
      // bracket for h, on the side of the ring facing the camera's right
      const x = c[0], y = c[1] + d.R * S + 0.07, a = stage.project([x, y, c[2] - d.h * S / 2]), b = stage.project([x, y, c[2] + d.h * S / 2]);
      g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.moveTo(a[0] - 5, a[1]); g.lineTo(a[0] + 5, a[1]); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.moveTo(b[0] - 5, b[1]); g.lineTo(b[0] + 5, b[1]); g.stroke();
      g.strokeStyle = C.sunken; g.lineWidth = 4; g.textAlign = 'left'; g.font = font(800, 16); text('h', [a[0] + 8, (a[1] + b[1]) / 2], C.ink); g.textAlign = 'center';
    });
    // the sign between the rings: equal volumes or not
    const eq = Math.abs(D[0].h - D[1].h) < 1e-9, mid = stage.project([0, 0, 0]);
    g.font = font(800, 64); text(eq ? '=' : '≠', mid, eq ? C.object : C.obj2);
    g.font = font(700, 12.5); text(eq ? t('même volume', 'same volume') : t('volumes différents', 'different volumes'), [mid[0], mid[1] + 36 * k], C.muted);
  };
  let lastKey = '';
  function report(D) {
    const key = D.map((d) => [d.R, d.h, d.r].join()).join('|') + st.cut + st.slice; if (key === lastKey) return; lastKey = key;
    const [A, B] = D, za = st.cut * A.h / 2, zb = st.cut * B.h / 2, sameH = Math.abs(A.h - B.h) < 1e-12;
    metrics.set('va', exactVolume(A.h)); metrics.set('vb', exactVolume(B.h));
    metrics.set('sa', `${num(sliceArea(A.R, A.h, za), 3)} cm²`); metrics.set('sb', `${num(sliceArea(B.R, B.h, zb), 3)} cm²`);
    page.read(sameH ? t(`Même hauteur h = ${num(A.h, 2)} cm : même volume π h³/6, alors que les sphères ont des rayons ${num(A.R, 1)} et ${num(B.R, 2)} cm.`, `Same height h = ${num(A.h, 2)} cm: same volume π h³/6, although the spheres have radii ${num(A.R, 1)} and ${num(B.R, 2)} cm.`)
      : t(`Hauteurs différentes (${num(A.h, 2)} et ${num(B.h, 2)} cm) : volumes différents.`, `Different heights (${num(A.h, 2)} and ${num(B.h, 2)} cm): different volumes.`));
    const hm = Math.max(A.h, B.h), curve = (d) => Array.from({ length: 121 }, (_, i) => { const z = -d.h / 2 + d.h * i / 120; return [z + hm / 2, sliceArea(d.R, d.h, z)]; });
    plot.draw({ xMax: hm, yMax: Math.PI * hm * hm / 4, xLabel: t('z + h/2 (cm)', 'z + h/2 (cm)'), yLabel: t('aire (cm²)', 'area (cm²)'), yFormat: (v) => num(v, 0),
      series: [{ points: curve(A), color: 'object', width: 3, dots: false }, { points: curve(B), color: 'obj2', width: 2, dash: [6, 5], dots: false }], marker: [za + hm / 2, sliceArea(A.R, A.h, za)] });
  }
  // grow the right sphere from h/2 to 8 cm at fixed h
  stage.update = (dt) => {
    if (!st.growing) return false;
    st.grow = Math.min(8, st.grow + dt * 1.4);
    if (st.grow >= 8) { st.growing = false; st.RB = 8; const s = $('#ng-rb'); s.value = '8'; s.dispatchEvent(new Event('input')); }
    return st.growing;
  };
  stage.restore = build;
  const sync = () => { $('#ng-cut').disabled = !st.slice; $('#ng-h').disabled = st.mode !== 'height'; $('#ng-r').disabled = st.mode !== 'hole'; lastKey = ''; stage.wake(); };
  const abort = new AbortController(), on = (el, ev, fn) => el.addEventListener(ev, fn, { signal: abort.signal });
  on($('#ng-mode'), 'change', (e) => { st.mode = e.target.value; sync(); });
  on($('#ng-ghost'), 'change', (e) => { st.ghost = e.target.checked; stage.wake(); });
  on($('#ng-slice'), 'change', (e) => { st.slice = e.target.checked; sync(); });
  on($('#ng-grow'), 'click', () => {
    st.mode = 'height'; $('#ng-mode').value = 'height'; sync();
    if (reduced()) { st.grow = 0; st.RB = st.RB >= 8 ? Math.max(3, st.h / 2) : 8; const s = $('#ng-rb'); s.value = String(st.RB); s.dispatchEvent(new Event('input')); return; }
    st.grow = st.h / 2 + 0.01; st.growing = true; stage.wake();
  });
  bind(root, 'ng-ra', (v) => { st.RA = v; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-rb', (v) => { st.RB = v; if (!st.growing) st.grow = 0; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-h', (v) => { st.h = v; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-r', (v) => { st.r = v; stage.wake(); }, (v) => num(v, 1));
  bind(root, 'ng-cut', (v) => { st.cut = v; stage.wake(); }, (v) => num(v, 2));
  build(); sync(); stage.start();
  return () => { abort.abort(); stage.destroy(); plot.stop(); metrics.el.remove(); };
}

// The page around the exhibit: help line, then the canvas and the controls side by side (the canvas column stays in view), notes under.
function nkPage(root, t, help, controls, notes) {
  root.innerHTML = `<p class="act-help">${help}</p><div class="nk"><div class="nk-view"><div class="obj-stage exhibit-stage gl-stage nk-stage"></div><p class="act-readout exhibit-readout" role="status" aria-live="polite"></p></div>` +
    `<div class="nk-side"><div class="act-controls exhibit-controls nk-controls">${controls}</div><div class="nk-slot"></div></div></div>` +
    `<details class="exhibit-notes"><summary>${t('Observer, puis comprendre', 'Observe, then understand')}</summary>${notes}</details>`;
  let last = '';
  return { host: root.querySelector('.exhibit-stage'), slot: root.querySelector('.nk-slot'), read: (s) => { if (s !== last) { last = s; root.querySelector('.exhibit-readout').textContent = s; } } };
}
