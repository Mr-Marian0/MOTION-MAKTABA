/** Spiral Lightbox: the photo spirals in from its thumbnail, circling the middle in a tightening coil as it grows and turns upright; closing spirals it back out. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Spiral Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Position-aware'],
  effect: ['Spiraling', 'Scaling', 'Spinning'],
  purpose: ['Delight', 'Focus', 'Storytelling'],
  properties: ['Position', 'Scale', 'Rotation'],
  description: 'A lightbox that coils in. Click a thumbnail and the photo leaves it on a spiral: it circles the middle of the page on a tightening coil, growing and turning as it goes, and lands upright and full size at the centre. Closing unwinds it back out the same way.',
  params: [
    { key: 'turns', label: 'Turns', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.25, unit: '', default: 1.25, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

const HUES = [0, 40, 200, 300];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-spl">
        ${page('Field trip', 'Photos')}
        <div class="sp-ov__thumbs">${HUES.map((h, i) => `<button type="button" class="sp-ov__thumb sp-ov__photo" style="filter:hue-rotate(${h}deg)" aria-label="Open photo ${i + 1}"></button>`).join('')}</div>
        <i class="sp-ov__scrim"></i>
        <button type="button" class="sp-ov__light sp-ov__photo sp-spl__light" aria-label="Close photo"></button>
      </div>`);
    const light = k.$('.sp-spl__light');
    const scrim = k.$('.sp-ov__scrim');
    gsap.set([light, scrim], { autoAlpha: 0 });
    const s = k.track({ u: 0 });
    let from = [0, 0];
    let tl;
    let open = null;
    // u 0 → 1: from the thumbnail's offset to the centre, the offset spiralling round as it shrinks.
    const draw = () => {
      const a = (1 - s.u) * p.turns * Math.PI * 2;
      const r = 1 - s.u;
      const [x, y] = [from[0] * r, from[1] * r];
      gsap.set(light, { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a), scale: 0.12 + 0.88 * s.u, rotation: -a * 40 / Math.PI });
    };
    const set = (th) => {
      tl?.kill();
      const t = reducedMotion ? 0 : p.time;
      if (th) {
        open = th;
        light.style.filter = th.style.filter;
        // Offset of the thumbnail's centre from the lightbox's centre (layout px)
        from = [th.offsetLeft + th.parentElement.offsetLeft + th.offsetWidth / 2 - (light.offsetLeft + light.offsetWidth / 2), th.offsetTop + th.parentElement.offsetTop + th.offsetHeight / 2 - (light.offsetTop + light.offsetHeight / 2)];
        tl = gsap.timeline().set(light, { autoAlpha: 1 }).fromTo(s, { u: 0 }, { u: 1, duration: t, ease: 'power2.out', onUpdate: draw }).to(scrim, { autoAlpha: 1, duration: t * 0.6 }, 0);
        light.focus();
      } else if (open) {
        tl = gsap.timeline().to(s, { u: 0, duration: t * 0.8, ease: 'power2.in', onUpdate: draw }).to(scrim, { autoAlpha: 0, duration: t * 0.5 }, 0).set(light, { autoAlpha: 0 });
        open.focus();
        open = null;
      }
    };
    k.$$('.sp-ov__thumb').forEach((th) => k.on(th, 'click', () => set(th)));
    k.on(light, 'click', () => set(null));
    k.on(scrim, 'click', () => set(null));
    k.on(k.$('.sp-ov'), 'keydown', (e) => e.key === 'Escape' && open && (e.stopPropagation(), set(null)));
    return () => { tl?.kill(); k.destroy(); };
  },
};
