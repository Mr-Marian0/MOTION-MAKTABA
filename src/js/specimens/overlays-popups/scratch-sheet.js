/** Scratch Sheet: a prize bottom sheet with a silver scratch-off strip. Drag across it to scrape the coating away; once most is gone the rest flakes off and the prize is revealed. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Scratch Sheet',
  element: 'Bottom sheet',
  trigger: ['Click', 'Drag', 'Keyboard'],
  behavior: ['Draggable', 'Pointer-tracking', 'Conditional', 'Toggle-dependent'],
  effect: ['Scraping', 'Sliding', 'Falling'],
  purpose: ['Delight', 'Storytelling', 'Feedback'],
  properties: ['Clip & mask', 'Position', 'Opacity'],
  description: 'A prize sheet that slides up from the bottom with a silver scratch-off strip on it. Drag across the strip to scrape the coating off, shavings dropping as you go; once most of it is gone the rest flakes off and the prize shows. "Scratch for me" does it for you.',
  params: [
    { key: 'brush', label: 'Scraper size', group: 'Shape', type: 'range', min: 0.8, max: 3, step: 0.1, unit: 'em', default: 1.6, live: true },
    { key: 'done', label: 'Reveals at', group: 'Behavior', type: 'range', min: 30, max: 90, step: 5, unit: '%', default: 55, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Prize'),
  ],
};

const [GX, GY] = [20, 4];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-scs', `
      <div class="sp-ov__sheet sp-scs__sheet" role="dialog" aria-label="Scratch card">
        <i class="sp-ov__grip"></i>
        <span class="sp-ov__kick">Spring raffle</span>
        <div class="sp-scs__strip"><b class="sp-scs__prize">You won a free notebook</b><canvas class="sp-scs__coat" aria-hidden="true"></canvas></div>
        <button type="button" class="sp-ov__btn sp-ov__btn--ghost sp-scs__auto">Scratch for me</button>
      </div>`, { label: 'Play', title: 'Raffle' }));
    const sheet = k.$('.sp-scs__sheet');
    const canvas = k.$('.sp-scs__coat');
    const prize = k.$('.sp-scs__prize');
    const ctx = canvas.getContext('2d');
    const seen = new Set();
    let done = false;
    let em = 10;
    gsap.set(sheet, { yPercent: 110 });

    const coat = () => {
      const [w, h] = [canvas.offsetWidth, canvas.offsetHeight];
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      em = parseFloat(getComputedStyle(canvas).fontSize) * dpr;
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      ['#c9ccce', '#f1f2f2', '#a9adb0', '#e3e5e6'].forEach((c, i) => g.addColorStop(i / 3, c));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      seen.clear();
      done = false;
      gsap.set(canvas, { autoAlpha: 1 });
    };
    const scrape = (x, y) => {
      const r = canvas.getBoundingClientRect();
      const [fx, fy] = [(x - r.left) / r.width, (y - r.top) / r.height];
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(fx * canvas.width, fy * canvas.height, p.brush * em * 0.5, 0, Math.PI * 2);
      ctx.fill();
      if (fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1) seen.add(`${Math.floor(fx * GX)},${Math.floor(fy * GY)}`);
      if (!done && seen.size / (GX * GY) >= p.done / 100) {
        done = true;
        gsap.timeline().to(canvas, { autoAlpha: 0, duration: 0.4 }).fromTo(prize, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, '<');
      }
    };
    let down = false;
    k.on(canvas, 'pointerdown', (e) => ((down = true), canvas.setPointerCapture(e.pointerId), scrape(e.clientX, e.clientY)));
    k.on(canvas, 'pointermove', (e) => down && scrape(e.clientX, e.clientY));
    k.on(window, 'pointerup', () => (down = false));
    k.on(k.$('.sp-scs__auto'), 'click', () => {
      const r = canvas.getBoundingClientRect();
      const pen = k.track({ t: 0 });
      gsap.to(pen, { t: 1, duration: reducedMotion ? 0 : 1.2, ease: 'none', onUpdate: () => {
        const zig = (pen.t * 8) % 1;
        scrape(r.left + r.width * pen.t, r.top + r.height * (zig < 0.5 ? zig * 2 : 2 - zig * 2));
      } });
    });

    toggle(k, gsap, { reducedMotion }, (open) => {
      if (open) coat();
      return gsap.timeline().to(sheet, { yPercent: open ? 0 : 110, duration: 0.5, ease: open ? 'power3.out' : 'power2.in' });
    }, ['Play', 'Close']);
    return () => k.destroy();
  },
};
