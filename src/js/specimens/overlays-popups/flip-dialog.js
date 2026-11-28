/** Flip Dialog: the button flips over like a card on its vertical axis and its back face is the dialog, growing to full size as it turns. Closing flips it back into a button. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Flip Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Coordinated'],
  effect: ['Axial-rotation', 'Expansion', 'Morphing-transition'],
  purpose: ['Continuity', 'Focus', 'Hierarchy'],
  properties: ['Rotation', 'Size', 'Depth (z)'],
  description: 'A rename dialog on the back of its own button. Click "Rename" and the button flips over on its vertical axis, growing as it turns, and its back face is the dialog, now full size in the middle of the page. Cancel flips it back over into the little button.',
  params: [
    { key: 'time', label: 'Flip time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Button'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-flp">
        ${page('Summer board', 'Board')}
        <i class="sp-ov__scrim"></i>
        <div class="sp-flp__card">
          <button type="button" class="sp-flp__front">Rename</button>
          <div class="sp-ov__card sp-flp__back" role="dialog" aria-label="Rename board" inert>
            <b class="sp-ov__title">Rename board</b>
            <span class="sp-flp__field">Summer board</span>
            <span class="sp-ov__actions"><button type="button" class="sp-ov__btn sp-ov__btn--ghost sp-flp__cancel">Cancel</button><button type="button" class="sp-ov__btn sp-flp__save">Save</button></span>
          </div>
        </div>
      </div>`);
    const card = k.$('.sp-flp__card');
    const front = k.$('.sp-flp__front');
    const back = k.$('.sp-flp__back');
    const scrim = k.$('.sp-ov__scrim');
    gsap.set(scrim, { autoAlpha: 0 });
    gsap.set(card, { transformPerspective: 1200 });
    let tl;
    const set = (open) => {
      tl?.kill();
      back.inert = !open;
      front.tabIndex = open ? -1 : 0;
      const t = reducedMotion ? 0 : p.time;
      // The card is a button-sized box that grows to dialog size while turning; at 90° the faces swap.
      tl = gsap.timeline()
        .to(scrim, { autoAlpha: open ? 1 : 0, duration: t * 0.5 }, 0)
        .to(card, { rotationY: open ? 180 : 0, '--open': open ? 1 : 0, duration: t, ease: 'power3.inOut' }, 0)
        .call(() => card.classList.toggle('is-open', open), null, t / 2);
      (open ? k.$('.sp-flp__save') : front).focus();
    };
    k.on(front, 'click', () => set(true));
    k.on(k.$('.sp-flp__cancel'), 'click', () => set(false));
    k.on(k.$('.sp-flp__save'), 'click', () => set(false));
    k.on(scrim, 'click', () => set(false));
    k.on(k.$('.sp-ov'), 'keydown', (e) => e.key === 'Escape' && card.classList.contains('is-open') && (e.stopPropagation(), set(false)));
    return () => { tl?.kill(); k.destroy(); };
  },
};
