/** Root Spread: scrolling a content card into view grows roots from its edges, out into the page and in across the card. */
import { kit, bars, clamp, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Root Spread',
  element: 'Content card',
  trigger: ['Scroll'],
  behavior: ['Scroll-scrubbed', 'Randomized', 'Reversible', 'Staggered', 'Hierarchical'],
  effect: ['Organic-morphing', 'Extending', 'Generative-motion'],
  purpose: ['Storytelling', 'Decoration', 'Delight'],
  properties: ['Path', 'Shape', 'Radius'],
  description: 'Scroll the page and roots grow out of the card\'s edges: some reach out into the page, some creep in across the card, branching as they go. Scroll back up and they draw back in; next time they grow a new way.',
  params: [
    { key: 'roots', label: 'Roots', group: 'Shape', type: 'range', min: 4, max: 20, step: 1, unit: '', default: 11 },
    { key: 'inside', label: 'Inside share', group: 'Shape', type: 'range', min: 0, max: 100, step: 5, unit: '%', default: 40 },
    { key: 'reach', label: 'Reach', group: 'Shape', type: 'range', min: 0.5, max: 1.6, step: 0.1, unit: '×', default: 1 },
    tone('#6e4f33', 'tone', '--sp-accent', 'Root color'),
  ],
};

// Drawing units: 1 = 0.1em. The svg is 220 × 180; the card sits at (40, 40), 140 × 100.
const [CX, CY, CW, CH] = [40, 40, 140, 100];

/** A root: a wandering line of small steps, with smaller branches off it. */
function grow(out, x, y, angle, len, width, start, depth, inside) {
  const steps = Math.max(3, Math.round(len / 4));
  const pts = [[x, y]];
  for (let j = 0; j < steps; j++) {
    angle += (Math.random() - 0.5) * 0.7;
    x += Math.cos(angle) * 4;
    y += Math.sin(angle) * 4;
    pts.push([x, y]);
  }
  const dur = 0.18 + len / 300;
  out.push({ d: `M${pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join('L')}`, width, start, dur, inside });
  if (depth > 1) return;
  const n = 1 + Math.floor(Math.random() * (depth ? 2 : 3));
  for (let b = 0; b < n; b++) {
    const j = Math.floor(steps * (0.25 + Math.random() * 0.55));
    const side = Math.random() < 0.5 ? -1 : 1;
    grow(out, pts[j][0], pts[j][1], angle + side * (0.5 + Math.random() * 0.6), len * (0.35 + Math.random() * 0.2), width * 0.55, start + (j / steps) * dur, depth + 1, inside);
  }
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-root">
        <div class="sp-root__view" data-lenis-prevent tabindex="0" aria-label="Scrollable sample page">
          <div class="sp-root__intro"><p class="sp-note sp-note--inline">Scroll down ↓</p>${bars(4)}</div>
          <div class="sp-root__stage">
            <article class="sp-root__card">
              <small>Field report · No. 04</small>
              <b>Under the Soil</b>
              ${bars(3)}
            </article>
            <svg class="sp-root__svg" viewBox="0 0 220 180" aria-hidden="true">
              <defs><clipPath><rect x="${CX}" y="${CY}" width="${CW}" height="${CH}" rx="6" /></clipPath></defs>
              <g class="sp-root__out"></g>
              <g class="sp-root__in"></g>
            </svg>
          </div>
          <div class="sp-root__outro">${bars(5)}</div>
        </div>
      </div>`);
    const view = k.$('.sp-root__view');
    const box = k.$('.sp-root__stage');
    const card = k.$('.sp-root__card');
    const gOut = k.$('.sp-root__out');
    const gIn = k.$('.sp-root__in');
    // Each mount gets its own clip id, so two copies of the design don't share one.
    const clipId = uid('root-clip');
    k.$('clipPath').id = clipId;
    gIn.setAttribute('clip-path', `url(#${clipId})`);
    let tl;
    let grown = false;

    const build = () => {
      tl?.kill();
      gOut.innerHTML = '';
      gIn.innerHTML = '';
      const roots = [];
      for (let i = 0; i < p.roots; i++) {
        // A random point on one of the four edges, and the outward direction there.
        const side = Math.floor(Math.random() * 4);
        const u = 0.08 + Math.random() * 0.84;
        const [x, y, a] = [
          [CX + u * CW, CY, -Math.PI / 2], [CX + CW, CY + u * CH, 0],
          [CX + u * CW, CY + CH, Math.PI / 2], [CX, CY + u * CH, Math.PI],
        ][side];
        const inside = Math.random() * 100 < p.inside;
        const len = (inside ? 22 + Math.random() * 26 : 26 + Math.random() * 34) * p.reach;
        grow(roots, x, y, inside ? a + Math.PI : a, len, inside ? 1.6 : 2.4, Math.random() * 0.35, 0, inside);
      }
      const end = Math.max(...roots.map((r) => r.start + r.dur));
      // One paused timeline holds the whole growth; scrolling sets its progress.
      tl = gsap.timeline({ paused: true });
      roots.forEach((r) => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', r.d);
        path.setAttribute('pathLength', '1');
        path.setAttribute('class', r.inside ? 'sp-root__line sp-root__line--in' : 'sp-root__line');
        path.style.strokeWidth = r.width;
        (r.inside ? gIn : gOut).append(path);
        tl.fromTo(path, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: r.dur / end, ease: 'power1.out' }, r.start / end);
      });
      // The card itself turns a little organic as the roots take hold.
      tl.fromTo(card, { borderRadius: '0.5em 0.5em 0.5em 0.5em' }, { borderRadius: '1.4em 0.5em 1.1em 0.7em', duration: 1, ease: 'none' }, 0);
      tl.progress(0);
    };
    build();

    const onScroll = () => {
      // 0 when the card is just below the fold, 1 when it sits in the middle of the view.
      const top = box.offsetTop + box.offsetHeight / 2 - view.clientHeight / 2;
      const t = clamp(view.scrollTop / Math.max(1, top), 0, 1);
      if (t > 0.5) grown = true;
      if (t === 0 && grown) { grown = false; build(); } // fully drawn back: next time, a new pattern
      if (reducedMotion) tl.progress(t > 0.5 ? 1 : 0);
      else gsap.to(tl, { progress: t, duration: 0.5, ease: 'power2.out', overwrite: true });
    };
    k.on(view, 'scroll', onScroll);

    return { destroy: () => { tl?.kill(); k.destroy(); } };
  },
};
