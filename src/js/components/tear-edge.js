/**
 * TEAR EDGE — generates organic torn-paper lines as clip-path polygons.
 *
 * A tear is two things layered:
 *   - a slow wave (the overall direction the paper ripped)
 *   - sharp alternating teeth (the paper fibers)
 * Both are seeded, so the same seed always gives the same tear.
 */

/** Small deterministic PRNG (mulberry32). */
export function seededRandom(seed = Math.random() * 1e9) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A vertical tear line running from y=0% to y=100%.
 * @param {object}  o
 * @param {number}  o.center     x position of the line, in % of the parent
 * @param {number}  o.amplitude  max sway of the slow wave, in %
 * @param {number}  o.jag        size of the fiber teeth, in %
 * @param {number}  o.steps      number of points (more = finer tear)
 * @param {number}  o.seed       seed for repeatable tears
 * @returns {{x:number, y:number}[]}
 */
export function tearLine({ center = 50, amplitude = 2.4, jag = 0.7, steps = 48, seed } = {}) {
  const rand = seededRandom(seed);
  const p1 = rand() * Math.PI * 2;
  const p2 = rand() * Math.PI * 2;
  const f2 = 2.5 + rand() * 2;

  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const wave = Math.sin(t * Math.PI * 1.3 + p1) * 0.65 + Math.sin(t * Math.PI * f2 + p2) * 0.35;
    const tooth = (i % 2 ? 1 : -1) * rand() * jag + (rand() - 0.5) * jag * 0.6;
    return { x: center + wave * amplitude + tooth, y: t * 100 };
  });
}

/** Offset every point of a line horizontally by a small random amount. */
export function shiftLine(points, { min = 0.25, max = 0.8, direction = 1, seed } = {}) {
  const rand = seededRandom(seed);
  return points.map((p) => ({ x: p.x + direction * (min + rand() * (max - min)), y: p.y }));
}

const pct = (n) => `${n.toFixed(3)}%`;

/**
 * Clip paths for two panels that meet along a shared tear line.
 * Line x-values are in % of the full stage; each panel is `panelWidth`%
 * wide and pinned to its own edge, so the line is re-mapped into each
 * panel's own coordinate space. Result: the two pieces interlock exactly.
 */
export function seamClipPaths(points, panelWidth) {
  const toLeft = (x) => (x / panelWidth) * 100;
  const rightStart = 100 - panelWidth;
  const toRight = (x) => ((x - rightStart) / panelWidth) * 100;

  const left = [
    '0% 0%',
    ...points.map((p) => `${pct(toLeft(p.x))} ${pct(p.y)}`),
    '0% 100%',
  ];
  const right = [
    '100% 0%',
    '100% 100%',
    ...[...points].reverse().map((p) => `${pct(toRight(p.x))} ${pct(p.y)}`),
  ];

  return { left: `polygon(${left.join(',')})`, right: `polygon(${right.join(',')})` };
}

/**
 * Generic: a clip path that tears ONE side of any element.
 * Handy for cards and one-off scraps (each call = a unique tear).
 * @param {'top'|'right'|'bottom'|'left'} side
 * @param {object} o  depth in %, steps, seed
 */
export function edgeClipPath(side = 'bottom', { depth = 4, steps = 40, seed } = {}) {
  const line = tearLine({ center: 100 - depth / 2, amplitude: depth / 4, jag: depth / 3, steps, seed });
  const clamp = (n) => Math.min(100, Math.max(0, n));
  let pts;
  switch (side) {
    case 'right':
      pts = ['0% 0%', ...line.map((p) => `${pct(clamp(p.x))} ${pct(p.y)}`), '0% 100%'];
      break;
    case 'left':
      pts = ['100% 0%', '100% 100%', ...[...line].reverse().map((p) => `${pct(clamp(100 - p.x))} ${pct(p.y)}`)];
      break;
    case 'top':
      pts = ['0% 100%', '100% 100%', ...[...line].reverse().map((p) => `${pct(p.y)} ${pct(clamp(100 - p.x))}`)];
      break;
    default: // bottom
      pts = ['0% 0%', '100% 0%', ...[...line].reverse().map((p) => `${pct(p.y)} ${pct(clamp(p.x))}`)];
  }
  return `polygon(${pts.join(',')})`;
}
