/** Telescope Panel: "Show details" extends the panel section by section, each one sliding out from under the last like a telescope; "Less" slides them back in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Telescope Panel',
  element: 'Expandable panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Nested', 'Reversible'],
  effect: ['Extending', 'Retracting', 'Sliding'],
  purpose: ['Hierarchy', 'Continuity', 'Focus'],
  properties: ['Position', 'Size', 'Order'],
  description: 'An order summary that extends like a telescope. Show details and each section slides out from under the one above, one after another with a small click into place; Less slides them back inside each other.',
  params: [
    { key: 'step', label: 'Step time', group: 'Motion', type: 'range', min: 0.1, max: 0.6, step: 0.05, unit: 's', default: 0.25, live: true },
    { key: 'click', label: 'Click into place', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#4f6b4a'),
  ],
};

const SEGS = [['Items', '3 pads · 1 ink · 2 tapes', '$74'], ['Shipping', 'Flat mailer, tracked', '$6'], ['Tax', 'Included at checkout', '$8'], ['Total', 'Pay on the next step', '$88']];
const H = 3.6; // em per segment

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-tlp">
        <div class="sp-tlp__panel">
          <div class="sp-tlp__tube" style="height:${H}em">
            ${SEGS.map(([a, b, c], i) => `<div class="sp-tlp__seg" style="z-index:${SEGS.length - i}"><span><b>${a}</b><small>${b}</small></span><em>${c}</em></div>`).join('')}
          </div>
          <button type="button" class="sp-pn__btn sp-tlp__btn" aria-expanded="false">Show details</button>
        </div>
      </div>`);
    const tube = k.$('.sp-tlp__tube');
    const segs = k.$$('.sp-tlp__seg');
    const btn = k.$('.sp-tlp__btn');
    // Collapsed, every section sits inside the first (the total shows on top).
    gsap.set(segs, { y: 0 });
    segs[segs.length - 1].style.zIndex = SEGS.length + 1;
    let tl;

    k.on(btn, 'click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Less' : 'Show details';
      tl?.kill();
      const t = reducedMotion ? 0 : p.step;
      tl = gsap.timeline();
      if (open) {
        segs[segs.length - 1].style.zIndex = 1;
        segs.forEach((seg, i) => {
          if (!i) return;
          tl.to(tube, { height: `${(i + 1) * H}em`, duration: t, ease: 'power2.out' }, (i - 1) * t)
            .to(segs.slice(i), { y: `${i * H}em`, duration: t, ease: 'power2.out' }, '<');
          if (p.click) tl.to(seg, { keyframes: { y: [`${i * H + 0.3}em`, `${i * H}em`] }, duration: t * 0.5 });
        });
      } else {
        tl.to(segs, { y: 0, duration: t * 1.6, ease: 'power3.in', stagger: { each: t * 0.3, from: 'end' } })
          .to(tube, { height: `${H}em`, duration: t * 1.6, ease: 'power3.in' }, 0)
          .add(() => (segs[segs.length - 1].style.zIndex = SEGS.length + 1));
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
