/** Liquid Widget: the card's edge is liquid that reaches toward the cursor; a click drops water in and a wave runs through the whole card. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Liquid Widget',
  element: 'Widget',
  trigger: ['Cursor move', 'Click', 'Idle'],
  behavior: ['Proximity-aware', 'Pointer-tracking', 'Spring-driven', 'Continuous'],
  effect: ['Liquid-morphing', 'Ripple-deformation', 'Wave-propagation', 'Dropping'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Shape', 'Path'],
  description: 'A water tracker whose edge is liquid: it sways at rest and bulges toward the cursor as it passes near. Click to drop in 250 ml; the drop splashes and a wave runs through the whole card.',
  params: [
    { key: 'reach', label: 'Reach', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '', default: 14, live: true },
    { key: 'wave', label: 'Wave size', group: 'Motion', type: 'range', min: 0, max: 12, step: 1, unit: '', default: 6, live: true },
    { key: 'calm', label: 'Thickness', group: 'Behavior', type: 'range', min: 0.75, max: 0.95, step: 0.01, unit: '', default: 0.86, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water color'),
  ],
};

// Drawing units: 1 unit = 0.1em. The card is 140 × 100 with a 25-unit margin for the liquid to reach into.
const W = 140, H = 100, R = 12, O = 25, N = 72;

/** Evenly spaced points (with outward normals) around the rounded card. */
function outline() {
  const line = (x1, y1, x2, y2, nx, ny) => ({ len: Math.hypot(x2 - x1, y2 - y1), at: (u) => [x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, nx, ny] });
  const arc = (cx, cy, a0) => ({ len: (Math.PI * R) / 2, at: (u) => { const a = ((a0 + u * 90) * Math.PI) / 180; return [cx + Math.cos(a) * R, cy + Math.sin(a) * R, Math.cos(a), Math.sin(a)]; } });
  const [l, t, r, b] = [O, O, O + W, O + H];
  const segs = [
    line(l + R, t, r - R, t, 0, -1), arc(r - R, t + R, -90),
    line(r, t + R, r, b - R, 1, 0), arc(r - R, b - R, 0),
    line(r - R, b, l + R, b, 0, 1), arc(l + R, b - R, 90),
    line(l, b - R, l, t + R, -1, 0), arc(l + R, t + R, 180),
  ];
  const total = segs.reduce((s, g) => s + g.len, 0);
  return Array.from({ length: N }, (_, i) => {
    let dist = (i / N) * total;
    const g = segs.find((s) => (dist <= s.len ? true : ((dist -= s.len), false))) || segs[segs.length - 1];
    const [x, y, nx, ny] = g.at(Math.min(1, dist / g.len));
    return { x, y, nx, ny, o: 0, v: 0 };
  });
}

/** A smooth closed path through the points (Catmull-Rom as cubic Béziers). */
function smooth(P) {
  const at = (i) => P[(i + P.length) % P.length];
  let d = `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;
  for (let i = 0; i < P.length; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('liq'); // the card and the workbench can show this design at once
    k.html(`
      <div class="sp sp-liq">
        <div class="sp-liq__wrap">
          <svg class="sp-liq__svg" viewBox="0 0 ${W + O * 2} ${H + O * 2}" aria-hidden="true">
            <defs>
              <clipPath id="${id}-clip"><path class="sp-liq__clip" /></clipPath>
              <linearGradient id="${id}-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" class="sp-liq__stop1" /><stop offset="1" class="sp-liq__stop2" />
              </linearGradient>
            </defs>
            <path class="sp-liq__body" fill="url(#${id}-grad)" />
            <g clip-path="url(#${id}-clip)" class="sp-liq__rings"></g>
            <path class="sp-liq__drop" d="M0 -9C3 -4 5 -1 5 2A5 5 0 0 1 -5 2C-5 -1 -3 -4 0 -9Z" />
          </svg>
          <div class="sp-liq__content">
            <small>Water today</small>
            <b><span class="sp-liq__ml" aria-live="polite">1250</span> ml</b>
            <span class="sp-liq__goal">of 2000 ml goal</span>
            <i class="sp-liq__bar"><i></i></i>
          </div>
        </div>
        <p class="sp-note">Move near the edge · click to add a drop</p>
      </div>`);
    const wrap = k.$('.sp-liq__wrap');
    const svg = k.$('.sp-liq__svg');
    const body = k.$('.sp-liq__body');
    const clip = k.$('.sp-liq__clip');
    const rings = k.$('.sp-liq__rings');
    const drop = k.$('.sp-liq__drop');
    const ml = k.$('.sp-liq__ml');
    const fill = k.$('.sp-liq__bar i');
    k.fit(wrap, 0.86);
    const pts = outline();
    const waves = []; // { x, y, t0 }
    let mouse = null;
    let total = 1250;
    gsap.set(drop, { autoAlpha: 0 });
    gsap.set(fill, { scaleX: total / 2000 });

    const toSvg = (e) => {
      const r = svg.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * (W + O * 2), ((e.clientY - r.top) / r.height) * (H + O * 2)];
    };

    const draw = (time) => {
      const P = pts.map((q, i) => {
        // Wave from each drop: a ring travelling outward from where it landed, fading as it goes.
        let w = 0;
        waves.forEach((v) => {
          const age = time - v.t0;
          const dist = Math.hypot(q.x - v.x, q.y - v.y);
          const front = age * 110;
          if (dist < front) w += p.wave * Math.exp(-age * 1.6) * Math.sin((dist - front) * 0.22);
        });
        const o = q.o + w;
        return [q.x + q.nx * o, q.y + q.ny * o, i];
      });
      const d = smooth(P);
      body.setAttribute('d', d);
      clip.setAttribute('d', d);
    };

    const tick = () => {
      const time = gsap.ticker.time;
      while (waves.length && time - waves[0].t0 > 3) waves.shift();
      pts.forEach((q, i) => {
        // At rest: a slow sway. Near the cursor: reach toward it, more the closer it is.
        let target = Math.sin(time * 1.6 + i * 0.45) * 1.2;
        if (mouse) {
          // Pulled toward the cursor: out when it's outside or on the edge, in when it's well inside.
          const dx = mouse[0] - q.x;
          const dy = mouse[1] - q.y;
          const f = Math.max(0, 1 - Math.hypot(dx, dy) / 48);
          target += p.reach * f * f * (dx * q.nx + dy * q.ny >= -6 ? 1 : -0.6);
        }
        const prev = pts[(i - 1 + N) % N].o;
        const next = pts[(i + 1) % N].o;
        q.v += (target - q.o) * 0.08 + (prev + next - 2 * q.o) * 0.12; // spring + surface tension
        q.v *= p.calm;
      });
      pts.forEach((q) => { q.o += q.v; });
      draw(time);
    };
    draw(0);
    if (!reducedMotion) {
      gsap.ticker.add(tick);
      k.on(stage, 'pointermove', (e) => { mouse = toSvg(e); });
      k.on(stage, 'pointerleave', () => { mouse = null; });
    }

    // Click: a drop falls in, splashes, and a wave runs through the card.
    k.on(wrap, 'click', (e) => {
      let [x, y] = toSvg(e);
      x = Math.min(O + W - 12, Math.max(O + 12, x));
      y = Math.min(O + H - 12, Math.max(O + 12, y));
      total += 250;
      ml.textContent = total;
      gsap.to(fill, { scaleX: Math.min(1, total / 2000), duration: 0.6, ease: 'power2.out' });
      if (reducedMotion) return;
      const land = () => {
        waves.push({ x, y, t0: gsap.ticker.time });
        pts.forEach((q) => { q.v += 2.5 * Math.exp(-Math.hypot(q.x - x, q.y - y) / 60); });
        for (let i = 0; i < 3; i++) {
          const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          ring.setAttribute('class', 'sp-liq__ring');
          ring.setAttribute('cx', x);
          ring.setAttribute('cy', y);
          rings.append(ring);
          gsap.fromTo(ring, { attr: { r: 0 }, opacity: 0.7 }, { attr: { r: 160 }, opacity: 0, duration: 1.6, delay: i * 0.18, ease: 'power1.out', onComplete: () => ring.remove() });
        }
        gsap.fromTo(ml, { scale: 1.3 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      };
      gsap.timeline()
        .set(drop, { x, y: y - 45, scaleY: 0.8, autoAlpha: 1 })
        .to(drop, { y, scaleY: 1.3, duration: 0.35, ease: 'power2.in' })
        .set(drop, { autoAlpha: 0 })
        .add(land);
    });

    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
