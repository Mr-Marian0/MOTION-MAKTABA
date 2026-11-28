/** Crumple Modal: the modal is tossed onto the page as a crumpled paper ball that bounces once and opens out flat into the message, creases and all. Closing scrunches it back up. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, shards, crumpled } from '../cards-containers/_pieces.js';
import { seeded } from '../cards-containers/_shape.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Crumple Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible', 'Gravity-driven'],
  effect: ['Uncrumpling', 'Crumpling', 'Bouncing'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Clip & mask', 'Rotation', 'Scale', 'Position'],
  description: 'A modal delivered like a note passed in class. It is tossed onto the page as a crumpled ball, bounces once, then opens out from the middle, folds springing flat one after another, into the message, faint creases still showing. Closing scrunches it back into a ball.',
  params: [
    { key: 'creases', label: 'Creases', group: 'Shape', type: 'range', min: 2, max: 6, step: 1, unit: '', default: 4 },
    { key: 'open', label: 'Open time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Note'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const g = Math.round(p.creases);
    const cuts = shards(g, g, 21, 0.7);
    const note = `<div class="sp-ov__card sp-crm2__note" role="dialog" aria-label="Note"><span class="sp-ov__kick">Psst</span><b class="sp-ov__title">Meeting moved to 3pm</b><span class="sp-ov__text">Same room. Bring the paper samples.</span>
      <svg class="sp-crm2__creases" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${cuts.map((pts) => `<polygon points="${pts.map((pt) => pt.join(',')).join(' ')}" />`).join('')}</svg></div>`;
    k.html(scene('sp-crm2', `<div class="sp-crm2__hold">${note}<div class="sp-cc__pieces"></div></div>`, { label: 'Read note', title: 'Class notes' }));
    const hold = k.$('.sp-crm2__hold');
    const real = k.$('.sp-crm2__hold > .sp-crm2__note');
    const host = k.$('.sp-cc__pieces');
    const bits = pieces(host, note.replace('role="dialog"', 'aria-hidden="true"'), cuts);
    gsap.set(hold, { autoAlpha: 0 });
    gsap.set(real, { autoAlpha: 0 });
    const ball = () => { const r = seeded(7); bits.forEach((b) => gsap.set(b.el, crumpled(b, r))); };
    ball();

    toggle(k, gsap, { reducedMotion }, (open) => {
      const tl = gsap.timeline();
      if (open) {
        tl.set(real, { autoAlpha: 0 }).set(host, { autoAlpha: 1 }).call(ball)
          // Tossed in, one bounce…
          .fromTo(hold, { autoAlpha: 1, x: '-14em', y: '-6em', rotation: -260 }, { x: 0, rotation: 0, duration: 0.6, ease: 'power1.out' })
          .to(hold, { keyframes: { y: ['0em', '-1.2em', '0em'], easeEach: 'power1.inOut' }, duration: 0.6 }, '<');
        // …then the folds spring open from the middle out
        const base = tl.duration() - 0.15;
        bits.forEach((b) => {
          const far = Math.hypot(b.c[0] - 50, b.c[1] - 50) / 70;
          tl.to(b.el, { xPercent: 0, yPercent: 0, rotationX: 0, rotationY: 0, rotation: 0, scale: 1, filter: 'brightness(1)', duration: p.open, ease: 'back.out(1.3)' }, base + far * p.open * 0.4);
        });
        tl.set(real, { autoAlpha: 1 }).set(host, { autoAlpha: 0 });
      } else {
        tl.set(host, { autoAlpha: 1 }).set(real, { autoAlpha: 0 });
        const r = seeded(7);
        bits.forEach((b) => tl.to(b.el, { ...crumpled(b, r), duration: 0.45, ease: 'power3.in' }, 0));
        tl.to(hold, { x: '14em', y: '4em', rotation: 300, autoAlpha: 0, duration: 0.5, ease: 'power2.in' });
      }
      return tl;
    }, ['Read note', 'Close']);
    return () => k.destroy();
  },
};
