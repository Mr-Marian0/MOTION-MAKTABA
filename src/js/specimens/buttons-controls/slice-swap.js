/** Slice Swap: hovering marks a dashed cut line; a click slices the button in half and a fresh one scales up from behind. */
import { kit, esc, labelsOf, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Slice Swap',
  element: 'Primary button',
  trigger: ['Hover', 'Click', 'Keyboard'],
  behavior: ['Hover-dependent', 'Sequential', 'Event-driven'],
  effect: ['Splitting', 'Sliding', 'Expansion', 'Sweeping'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Rotation', 'Scale', 'Opacity'],
  description: 'Hovering shows a dashed "cut here" line and scissors. Clicking sweeps a blade across: the button splits in two, the halves slide apart, and a new button scales up from behind.',
  params: [
    { key: 'labels', label: 'Labels', group: 'Content', type: 'text', default: 'Slice me, Fresh one, Again' },
    { key: 'direction', label: 'Slice direction', group: 'Motion', type: 'choice', options: ['Horizontal', 'Vertical', 'Slant'], default: 'Horizontal' },
    { key: 'gap', label: 'Split distance', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    { key: 'speed', label: 'Split time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.6, live: true },
    { key: 'ease', label: 'New box ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Back', live: true },
    tone('#111111'),
  ],
};

/* cut: start → end of the cut as fractions of the button; a/b: clip of each half;
   ma/mb: where each half flies [x, y (× split distance), rotation°]. */
const CUTS = {
  Horizontal: { cut: [0, 0.5, 1, 0.5], a: 'polygon(0 0,100% 0,100% 50%,0 50%)', b: 'polygon(0 50%,100% 50%,100% 100%,0 100%)', ma: [-1, -0.6, -4], mb: [1, 1, 3] },
  Vertical: { cut: [0.5, 0, 0.5, 1], a: 'polygon(0 0,50% 0,50% 100%,0 100%)', b: 'polygon(50% 0,100% 0,100% 100%,50% 100%)', ma: [-1, 0.4, -8], mb: [1, 0.4, 8] },
  Slant: { cut: [0, 0.85, 1, 0.15], a: 'polygon(0 0,100% 0,100% 15%,0 85%)', b: 'polygon(0 85%,100% 15%,100% 100%,0 100%)', ma: [-1, -0.7, -5], mb: [1, 0.7, 4] },
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Slice me', 'Fresh one']);
    const longest = labels.reduce((a, b) => (b.length > a.length ? b : a));
    const C = CUTS[p.direction] || CUTS.Horizontal;
    const face = (cls, text) => `<span class="sp-press__btn sp-slice__face ${cls}" aria-hidden="true">${esc(text)}</span>`;
    k.html(`
      <div class="sp sp-slice">
        <button type="button" class="sp-slice__btn" aria-label="${esc(labels[0])}">
          ${face('sp-slice__sizer', longest)}
          ${face('sp-slice__next', labels[1 % labels.length])}
          ${face('sp-slice__half', labels[0])}
          ${face('sp-slice__half', labels[0])}
          <i class="sp-slice__guide"></i>
          <i class="sp-slice__blade"></i>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-slice__btn');
    const next = k.$('.sp-slice__next');
    const halves = k.$$('.sp-slice__half');
    const [top, bot] = halves;
    const blade = k.$('.sp-slice__blade');
    top.style.clipPath = C.a;
    bot.style.clipPath = C.b;
    let i = 0;
    let busy = false;

    // Lay the guide and blade along the cut, overshooting each end a little.
    k.resize(btn, () => {
      const w = btn.offsetWidth;
      const h = btn.offsetHeight;
      const [x0, y0, x1, y1] = C.cut;
      const dx = (x1 - x0) * w;
      const dy = (y1 - y0) * h;
      const len = Math.hypot(dx, dy);
      const ext = 8;
      gsap.set([blade, k.$('.sp-slice__guide')], {
        left: x0 * w - (dx / len) * ext,
        top: y0 * h - (dy / len) * ext,
        width: len + ext * 2,
        rotation: (Math.atan2(dy, dx) * 180) / Math.PI,
        transformOrigin: '0% 50%',
      });
    });

    // The new box now looks exactly like the halves, so swapping them back in is invisible.
    const advance = () => {
      i++;
      halves.forEach((h) => (h.textContent = labels[i % labels.length]));
      next.textContent = labels[(i + 1) % labels.length];
      gsap.set(halves, { clearProps: 'transform,opacity' });
      gsap.set([next, blade], { opacity: 0 });
      btn.setAttribute('aria-label', labels[i % labels.length]);
      busy = false;
    };

    k.on(btn, 'click', () => {
      if (busy) return;
      busy = true;
      if (reducedMotion) return advance();
      const t = Number(p.speed);
      const g = Number(p.gap);
      const fly = ([x, y, r]) => ({ x: `${x * g}em`, y: `${y * g}em`, rotation: r, opacity: 0, duration: t, ease: 'power3.out' });
      gsap.timeline({ onComplete: advance })
        .fromTo(blade, { opacity: 1, scaleX: 0 }, { scaleX: 1, duration: t * 0.3, ease: 'power4.in' })
        .to(top, fly(C.ma))
        .to(bot, fly(C.mb), '<')
        .to(blade, { opacity: 0, duration: 0.2 }, '<')
        .fromTo(next, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: t, ease: EASES[p.ease] || 'back.out(1.8)' }, `<${t * 0.25}`);
    });

    return () => k.destroy();
  },
};
