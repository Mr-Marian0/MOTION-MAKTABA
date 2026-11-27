/** Shape Fill: a small shape trails the cursor inside the button; a click grows it to cover the label and reveal a new one. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Shape Fill',
  element: 'Primary button',
  trigger: ['Hover', 'Cursor move', 'Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Cursor-following', 'Position-aware'],
  effect: ['Expansion', 'Contracting'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Scale', 'Shape', 'Color', 'Clip & mask'],
  description: 'Hovering shows a small shape that follows the cursor inside the button. Clicking grows it from that point until it covers the label and a new label appears; click again to shrink it back.',
  params: [
    { key: 'labels', label: 'Labels', group: 'Content', type: 'text', default: 'Fill me, Filled ✓' },
    { key: 'shape', label: 'Shape', group: 'Shape', type: 'choice', options: ['Circle', 'Square', 'Diamond', 'Star'], default: 'Circle', live: true },
    tone('#b3412e', 'fill', '--sp-fill', 'Shape color'),
    { key: 'speed', label: 'Grow time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.6, live: true },
    tone('#111111'),
  ],
};

// How much bigger than a circle each shape must be to still cover the button from any point.
const COVER = { Circle: 1, Square: 1, Diamond: 1.42, Star: 2.2 };

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const [a, b = 'Done'] = labelsOf(p.labels, ['Fill me', 'Filled ✓']);
    k.html(`
      <div class="sp sp-press sp-fill">
        <button type="button" class="sp-press__btn sp-fill__btn" aria-pressed="false" aria-label="${esc(a)}">
          <span aria-hidden="true">${esc(a)}</span>
          <i class="sp-fill__blob"></i>
          <span class="sp-fill__new" aria-hidden="true">${esc(b)}</span>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-fill__btn');
    const blob = k.$('.sp-fill__blob');
    const neu = k.$('.sp-fill__new');
    const d = (t) => (reducedMotion ? 0 : t);
    let on = false;
    let hover = false;
    let S = 0;

    const fit = () => {
      blob.dataset.shape = p.shape;
      S = 2 * Math.hypot(btn.offsetWidth, btn.offsetHeight) * (COVER[p.shape] || 1);
      gsap.set(blob, { width: S, height: S });
    };
    const peek = () => (parseFloat(getComputedStyle(btn).fontSize) * 1.1) / S;
    const local = (e) => {
      const r = btn.getBoundingClientRect();
      return e && e.clientX ? [e.clientX - r.left, e.clientY - r.top] : [r.width / 2, r.height / 2];
    };
    const moveTo = ([x, y], t) => gsap.to(blob, { x: x - S / 2, y: y - S / 2, duration: d(t), ease: 'power3.out', overwrite: 'auto' });
    fit();
    gsap.set(blob, { scale: 0 });
    gsap.set(neu, { opacity: 0 });

    k.on(btn, 'pointerenter', (e) => {
      hover = true;
      if (on) return;
      fit();
      moveTo(local(e), 0);
      gsap.to(blob, { scale: peek(), duration: d(0.3), ease: 'back.out(2)' });
    });
    k.on(btn, 'pointermove', (e) => !on && moveTo(local(e), 0.3));
    k.on(btn, 'pointerleave', () => {
      hover = false;
      if (!on) gsap.to(blob, { scale: 0, duration: d(0.25) });
    });
    k.on(btn, 'click', (e) => {
      on = !on;
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? b : a);
      const t = Number(p.speed);
      if (on) {
        if (!e.detail) moveTo(local(), 0); // keyboard: grow from the center
        gsap.to(blob, { scale: 1, duration: d(t), ease: 'power3.inOut' });
        gsap.fromTo(neu, { opacity: 0, y: '0.6em' }, { opacity: 1, y: 0, delay: d(t * 0.55), duration: d(0.35), ease: 'back.out(2)' });
      } else {
        gsap.to(neu, { opacity: 0, y: '-0.6em', duration: d(0.2) });
        gsap.to(blob, { scale: hover ? peek() : 0, duration: d(t * 0.8), delay: d(0.1), ease: 'power3.inOut' });
      }
    });

    return {
      destroy: () => k.destroy(),
      update(key) {
        if (key !== 'shape') return;
        const cx = gsap.getProperty(blob, 'x') + S / 2;
        const cy = gsap.getProperty(blob, 'y') + S / 2;
        fit();
        gsap.set(blob, { x: cx - S / 2, y: cy - S / 2, scale: on ? 1 : hover ? peek() : 0 });
      },
    };
  },
};
