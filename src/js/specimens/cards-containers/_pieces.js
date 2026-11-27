/**
 * Fragments for the breaking, dissolving and assembling cards. A piece is a whole copy of the
 * card clipped to one polygon (points in % of the card box), so pieces line up exactly
 * with the real card and can fly apart or come together. Styles: .sp-cc__piece in _card.css.
 */
import { poly, seeded } from './_shape.js';

export const centroid = (pts) => pts.reduce((a, [x, y]) => [a[0] + x / pts.length, a[1] + y / pts.length], [0, 0]);

/** Rectangles in a cols × rows grid, left to right, top to bottom. */
export const grid = (cols, rows) =>
  Array.from({ length: cols * rows }, (_, i) => {
    const [x0, y0] = [((i % cols) * 100) / cols, (Math.floor(i / cols) * 100) / rows];
    const [x1, y1] = [x0 + 100 / cols, y0 + 100 / rows];
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  });

/** Irregular triangles: a jittered cols × rows grid, each cell cut along a random diagonal. */
export function shards(cols, rows, seed = 3, jitter = 0.4) {
  const r = seeded(seed);
  // Edge points only slide along their edge, so the outline stays a clean rectangle.
  const pt = (i, j) => {
    const jx = i === 0 || i === cols ? 0 : (r() - 0.5) * jitter;
    const jy = j === 0 || j === rows ? 0 : (r() - 0.5) * jitter;
    return [((i + jx) * 100) / cols, ((j + jy) * 100) / rows];
  };
  const P = Array.from({ length: rows + 1 }, (_, j) => Array.from({ length: cols + 1 }, (_, i) => pt(i, j)));
  const out = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const [a, b, c, d] = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]];
      out.push(...(r() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]));
    }
  }
  return out;
}

/** Shards that radiate from an impact point (x, y in %): `rays` spokes cut by `rings` rings. */
export function radial(x, y, rays = 9, rings = 3, seed = 5) {
  const r = seeded(seed);
  const toEdge = (a) => {
    const [dx, dy] = [Math.cos(a), Math.sin(a)];
    const t = Math.min(dx > 0 ? (100 - x) / dx : dx < 0 ? -x / dx : 1e9, dy > 0 ? (100 - y) / dy : dy < 0 ? -y / dy : 1e9);
    return [x + dx * t, y + dy * t];
  };
  // The four corner directions are always spokes, so no shard has to bend round a corner.
  const angles = [
    ...[[0, 0], [100, 0], [100, 100], [0, 100]].map(([cx, cy]) => Math.atan2(cy - y, cx - x)),
    ...Array.from({ length: rays }, (_, i) => ((i + 0.3 + r() * 0.4) / rays) * Math.PI * 2 - Math.PI),
  ].sort((a, b) => a - b);
  const steps = Array.from({ length: rings }, (_, i) => ((i + 1) / rings) ** 1.4 * (i === rings - 1 ? 1 : 0.85 + r() * 0.3));
  const spoke = angles.map((a) => {
    const e = toEdge(a);
    return [[x, y], ...steps.map((t) => [x + (e[0] - x) * Math.min(t, 1), y + (e[1] - y) * Math.min(t, 1)])];
  });
  const out = [];
  spoke.forEach((s, i) => {
    const n = spoke[(i + 1) % spoke.length];
    for (let j = 0; j < rings; j++) out.push(j === 0 ? [s[0], s[1], n[1]] : [s[j], s[j + 1], n[j + 1], n[j]]);
  });
  return out;
}

/** GSAP vars that crush a piece into a paper ball: pulled to the middle, folded every which way, shaded. */
export const crumpled = ({ c: [cx, cy] }, r = Math.random) => ({
  xPercent: (50 - cx) * 0.72 + (r() - 0.5) * 6,
  yPercent: (50 - cy) * 0.72 + (r() - 0.5) * 6,
  rotationX: (r() - 0.5) * 140,
  rotationY: (r() - 0.5) * 140,
  rotation: (r() - 0.5) * 140,
  scale: 0.5,
  filter: `brightness(${(0.7 + r() * 0.4).toFixed(2)})`,
  transformPerspective: 500,
});

/** Fill `host` with one clipped copy of `html` per polygon. Returns [{ el, pts, c: [cx, cy] }]. */
export function pieces(host, html, polys) {
  host.innerHTML = polys
    .map((pts) => {
      const [cx, cy] = centroid(pts);
      return `<div class="sp-cc__piece" aria-hidden="true" style="clip-path:${poly(pts)};transform-origin:${cx.toFixed(1)}% ${cy.toFixed(1)}%">${html}</div>`;
    })
    .join('');
  return [...host.children].map((el, i) => ({ el, pts: polys[i], c: centroid(polys[i]) }));
}
