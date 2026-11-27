/**
 * Clip-path shapes for the shape-shifting cards. Every shape has the same 32 points
 * in the same clockwise order (corner, edge, corner, edge…), so GSAP can tween
 * any shape into any other. Coordinates are % of the card box.
 */
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const COUNTS = [5, 3, 5, 3, 5, 3, 5, 3]; // points per outline segment: corner, edge, corner, edge…

/** A rounded rectangle: 4 corner arcs of 5 points, 3 points along each edge between them. */
export function rounded(rx = 7, ry = 6) {
  const arcs = [[rx, ry, 180], [100 - rx, ry, 270], [100 - rx, 100 - ry, 0], [rx, 100 - ry, 90]].map(([cx, cy, a0]) =>
    Array.from({ length: 5 }, (_, j) => {
      const a = ((a0 + j * 22.5) * Math.PI) / 180;
      return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
    }));
  return arcs.flatMap((arc, i) => [...arc, ...[1, 2, 3].map((j) => lerp(arc[4], arcs[(i + 1) % 4][0], j / 4))]);
}

/** Any 8-corner outline, spread into the same 32 points (start at the left side, go clockwise). */
export const along = (outline) =>
  outline.flatMap((p, i) => Array.from({ length: COUNTS[i] }, (_, j) => lerp(p, outline[(i + 1) % 8], j / COUNTS[i])));

/** A regular polygon with n sides (rot in radians), spread into the same 32 points. */
export function ngon(n, rot = 0) {
  const v = Array.from({ length: n }, (_, i) => {
    const a = rot + Math.PI + (i * 2 * Math.PI) / n; // start on the left, go clockwise like rounded()
    return [50 + 50 * Math.cos(a), 50 + 50 * Math.sin(a)];
  });
  return v.flatMap((p, i) => {
    const c = Math.floor(32 / n) + (i < 32 % n ? 1 : 0);
    return Array.from({ length: c }, (_, j) => lerp(p, v[(i + 1) % n], j / c));
  });
}

export const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(', ')})`;

/** A small seeded random, so a "random" shape is the same on every visit. */
export function seeded(seed = 7) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** Wrap a card in a shape: an ink edge layer and a face layer, both clipped to the same polygon. */
export const shapeHTML = (cls, inner) => `
  <div class="sp-shape ${cls}">
    <i class="sp-shape__edge"></i>
    <div class="sp-shape__face">${inner}</div>
  </div>`;
