/** Scratch Panel: a reward panel under a silver coating. Drag to scrape it off (shavings fall away); once most is gone the rest flakes off and the panel opens up with the details. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Scratch Panel',
  element: 'Expandable panel',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Pointer-tracking', 'Conditional', 'Self-expanding'],
  effect: ['Scraping', 'Expansion', 'Falling'],
  purpose: ['Delight', 'Storytelling', 'Feedback'],
  properties: ['Clip & mask', 'Size', 'Opacity'],
  description: 'A reward panel hidden under a silver scratch-off coating. Drag across it to scrape the coating away, little shavings dropping off as you go; once most of it is gone the rest flakes off on its own and the panel opens up to show the details. "Reveal" scrapes it for you.',
  params: [
    { key: 'brush', label: 'Scraper size', group: 'Shape', type: 'range', min: 0.8, max: 3, step: 0.1, unit: 'em', default: 1.5, live: true },
    { key: 'done', label: 'Opens at', group: 'Behavior', type: 'range', min: 30, max: 90, step: 5, unit: '%', default: 55, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Reward'),
  ],
};

const [GX, GY] = [24, 8]; // coverage grid, to tell how much has been scraped without reading pixels

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-scr">
        <section class="sp-scr__panel">
          <div class="sp-scr__prize"><span class="sp-pn__kick">You found</span><b class="sp-scr__big">Free shipping</b><span class="sp-scr__code">CODE · SCRAPE26</span></div>
          <div class="sp-scr__more"><p>On any order this month. Applies at checkout; one use per account.</p></div>
          <canvas class="sp-scr__coat" aria-hidden="true"></canvas>
          <div class="sp-scr__flecks" aria-hidden="true"></div>
        </section>
        <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-scr__btn">Reveal</button>
      </div>`);
    const panel = k.$('.sp-scr__panel');
    const prize = k.$('.sp-scr__prize');
    const more = k.$('.sp-scr__more');
    const canvas = k.$('.sp-scr__coat');
    const flecks = k.$('.sp-scr__flecks');
    const btn = k.$('.sp-scr__btn');
    const ctx = canvas.getContext('2d');
    const seen = new Set();
    let opened = false;
    gsap.set(more, { height: 0 });

    // Paint the coating at the canvas's real pixel size (capped for cheap redraws).
    const paint = () => {
      const [w, h] = [prize.offsetWidth, prize.offsetHeight];
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.style.height = `${h}px`; // exactly over the prize
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      ['#c9ccce', '#f1f2f2', '#a9adb0', '#e3e5e6', '#b6babc'].forEach((c, i) => g.addColorStop(i / 4, c));
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(17 17 17 / 0.45)';
      ctx.font = `${Math.round(13 * dpr)}px ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('S C R A T C H   H E R E', canvas.width / 2, canvas.height / 2 + 4 * dpr);
      seen.clear();
    };
    k.resize(prize, () => !opened && paint());

    const scrape = (x, y) => {
      const r = canvas.getBoundingClientRect();
      const [fx, fy] = [(x - r.left) / r.width, (y - r.top) / r.height];
      const em = parseFloat(getComputedStyle(panel).fontSize) * (canvas.width / r.width);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(fx * canvas.width, fy * canvas.height, p.brush * em * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Mark the coverage cells the scraper passed over
      const rx = (p.brush * 0.5 * parseFloat(getComputedStyle(panel).fontSize)) / r.width;
      for (let gx = Math.floor((fx - rx) * GX); gx <= Math.floor((fx + rx) * GX); gx++) {
        if (gx >= 0 && gx < GX && fy >= 0 && fy <= 1) seen.add(`${gx},${Math.min(GY - 1, Math.floor(fy * GY))}`);
      }
      if (!reducedMotion && Math.random() < 0.35) {
        const f = document.createElement('i');
        f.style.left = `${fx * 100}%`;
        f.style.top = `${fy * 100}%`;
        flecks.append(f);
        gsap.to(f, { y: '4em', x: `${(Math.random() - 0.5) * 2}em`, rotation: 200, autoAlpha: 0, duration: 0.8, ease: 'power2.in', onComplete: () => f.remove() });
      }
      if (seen.size / (GX * GY) >= p.done / 100) open();
    };
    const open = () => {
      if (opened) return;
      opened = true;
      btn.hidden = true;
      // The rest flakes away and the panel expands with the details
      gsap.timeline()
        .to(canvas, { autoAlpha: 0, scale: 1.04, duration: reducedMotion ? 0 : 0.4 })
        .fromTo(prize, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' }, '<')
        .to(more, { height: more.scrollHeight, duration: reducedMotion ? 0 : 0.5, ease: 'power3.out' });
    };

    let down = false;
    k.on(canvas, 'pointerdown', (e) => { down = true; canvas.setPointerCapture(e.pointerId); scrape(e.clientX, e.clientY); });
    k.on(canvas, 'pointermove', (e) => down && scrape(e.clientX, e.clientY));
    k.on(window, 'pointerup', () => (down = false));
    // Reveal: a scraper zig-zags across by itself
    k.on(btn, 'click', () => {
      const r = canvas.getBoundingClientRect();
      const pen = k.track({ t: 0 });
      gsap.to(pen, {
        t: 1,
        duration: reducedMotion ? 0 : 1.4,
        ease: 'none',
        onUpdate: () => scrape(r.left + r.width * ((pen.t * 6) % 1 < 0.5 ? ((pen.t * 6) % 1) * 2 : 2 - ((pen.t * 6) % 1) * 2), r.top + r.height * pen.t),
        onComplete: open,
      });
    });

    return () => k.destroy();
  },
};
