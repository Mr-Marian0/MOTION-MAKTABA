/** Quarter FAB: a line rises from the button, then sweeps down like a clock hand, uncovering a quarter-circle tray of actions. */
import { kit, esc, labelsOf, fabToggle } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Quarter FAB',
  element: 'FAB',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Activation-dependent', 'Sequential', 'Staggered', 'Reversible'],
  effect: ['Rising', 'Sweeping', 'Expansion'],
  purpose: ['Hierarchy', 'Affordance', 'Continuity'],
  properties: ['Clip & mask', 'Rotation', 'Scale'],
  description: 'A line rises straight up from the button, then sweeps down to the right like a clock hand. The quarter-circle tray is uncovered behind it and each action pops in as the line passes. Closing sweeps it back up.',
  params: [
    { key: 'labels', label: 'Actions', group: 'Content', type: 'text', default: 'Note, Photo, Clip' },
    { key: 'speed', label: 'Sweep time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.65, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Action color'),
  ],
};

const R = 10; // tray radius, em
const r = 6.2; // action ring radius, em (circle radius 1.4em keeps them well inside R)

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const acts = labelsOf(p.labels, ['Note', 'Photo', 'Clip']).slice(0, 4);
    const ang = acts.map((_, i) => (90 / (acts.length + 1)) * (i + 1)); // degrees clockwise from straight up
    const rad = (a) => (a * Math.PI) / 180;
    k.html(`
      <div class="sp sp-fabx sp-qfab">
        <div class="sp-fabx__hub">
          <div class="sp-qfab__tray">
            ${acts.map((a, i) => `<button type="button" class="sp-qfab__act" aria-label="${esc(a)}" style="left:${(Math.sin(rad(ang[i])) * r).toFixed(2)}em;bottom:${(Math.cos(rad(ang[i])) * r).toFixed(2)}em"><span>${esc(a[0])}</span></button>`).join('')}
          </div>
          <i class="sp-qfab__line"></i>
        </div>
        <button type="button" class="sp-fabx__main" aria-expanded="false" aria-label="Actions"><i aria-hidden="true">+</i></button>
        <p class="sp-note">Click the button</p>
      </div>`);
    const tray = k.$('.sp-qfab__tray');
    const line = k.$('.sp-qfab__line');
    const items = k.$$('.sp-qfab__act');
    const st = k.track({ sweep: 0 });
    const paint = () => tray.style.setProperty('--sweep', `${st.sweep}deg`);
    gsap.set(items, { scale: 0 });
    gsap.set(line, { scaleY: 0, autoAlpha: 0, transformOrigin: '50% 100%' });
    paint();

    fabToggle(k, gsap, k.$('.sp-fabx__main'), items, (open) => {
      const t = Number(p.speed);
      const tl = gsap.timeline();
      if (open) {
        tl.set(line, { autoAlpha: 1, rotation: 0 })
          .to(line, { scaleY: 1, duration: 0.3, ease: 'power3.out' })
          .addLabel('sweep')
          .to(st, { sweep: 90, duration: t, ease: 'power2.inOut', onUpdate: paint })
          .to(line, { rotation: 90, duration: t, ease: 'power2.inOut' }, '<');
        // Each action pops as the hand passes its angle (roughly: the ease is symmetric).
        items.forEach((b, i) => tl.to(b, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, `sweep+=${(ang[i] / 90) * t}`));
        tl.to(line, { autoAlpha: 0, duration: 0.2 });
      } else {
        tl.set(line, { autoAlpha: 1, rotation: 90, scaleY: 1 })
          .to(items.slice().reverse(), { scale: 0, duration: 0.2, stagger: 0.04, ease: 'power2.in' })
          .to(st, { sweep: 0, duration: t * 0.8, ease: 'power2.inOut', onUpdate: paint }, '<0.05')
          .to(line, { rotation: 0, duration: t * 0.8, ease: 'power2.inOut' }, '<')
          .to(line, { scaleY: 0, duration: 0.25, ease: 'power2.in' });
      }
      return tl;
    }, reducedMotion);

    return () => k.destroy();
  },
};
