/** Launch Accordion: opening a step launches its content up from the bottom of the panel with a puff of smoke, overshooting before it settles; its marker lifts off and lands as a tick. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Launch Accordion',
  element: 'Accordion',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Selection-dependent', 'Sequential'],
  effect: ['Launching', 'Overshoot-motion', 'Particle-trail', 'Expansion'],
  purpose: ['Progress', 'Delight', 'Hierarchy'],
  properties: ['Position', 'Size', 'Opacity'],
  description: 'An onboarding accordion that blasts off. Open a step and a puff of smoke bursts at the foot of the panel as its content is launched up into view, overshooting before it settles; the step number lifts off and lands back as a tick. Closing drops the content back down.',
  params: [
    { key: 'power', label: 'Launch power', group: 'Motion', type: 'range', min: 1, max: 4, step: 0.25, unit: '', default: 2.2, live: true },
    { key: 'puffs', label: 'Puffs', group: 'Shape', type: 'range', min: 0, max: 10, step: 1, unit: '', default: 6, live: true },
    tone('#4f6b4a'),
  ],
};

const STEPS = [['Make an account', 'Pick a name and a colour; that is all we need.'], ['Start a board', 'Drop in sketches, notes and swatches.'], ['Invite the team', 'Share a link; they can comment straight away.']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-lch">
        <ol class="sp-lch__list">
          ${STEPS.map(([t, d], i) => `
            <li class="sp-lch__item">
              <button type="button" class="sp-lch__q" aria-expanded="false"><i class="sp-lch__mark">${i + 1}</i>${t}</button>
              <div class="sp-lch__a"><div class="sp-lch__body"><p>${d}</p><span class="sp-pn__btn">Go</span></div><i class="sp-lch__smoke"></i></div>
            </li>`).join('')}
        </ol>
      </div>`);
    const qs = k.$$('.sp-lch__q');
    const as = k.$$('.sp-lch__a');
    gsap.set(as, { height: 0 });

    const set = (i, open) => {
      qs[i].setAttribute('aria-expanded', String(open));
      const a = as[i];
      const body = a.querySelector('.sp-lch__body');
      const mark = qs[i].querySelector('.sp-lch__mark');
      if (reducedMotion) return gsap.set(a, { height: open ? 'auto' : 0 });
      if (!open) return gsap.timeline().to(body, { y: '2em', autoAlpha: 0, duration: 0.25, ease: 'power2.in' }).to(a, { height: 0, duration: 0.3 }, '<0.1').add(() => (mark.textContent = i + 1));
      const smoke = a.querySelector('.sp-lch__smoke');
      const tl = gsap.timeline();
      tl.to(a, { height: a.scrollHeight, duration: 0.25, ease: 'power2.out' })
        .fromTo(body, { y: '4em', autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: `back.out(${p.power})` }, '<0.05')
        // Lift-off: the marker rises and lands as a tick
        .to(mark, { y: '-1.2em', duration: 0.25, ease: 'power3.out' }, '<')
        .add(() => (mark.textContent = '✓'))
        .to(mark, { y: 0, duration: 0.4, ease: 'bounce.out' });
      // A puff of smoke at the foot of the panel
      for (let n = 0; n < p.puffs; n++) {
        const s = document.createElement('i');
        smoke.append(s);
        gsap.fromTo(s, { x: 0, y: 0, scale: 0.3, autoAlpha: 0.9 }, { x: `${(n - p.puffs / 2) * 1.1}em`, y: `${-0.5 - Math.random()}em`, scale: 1.4 + Math.random(), autoAlpha: 0, duration: 0.9, delay: 0.05, ease: 'power2.out', onComplete: () => s.remove() });
      }
    };
    qs.forEach((q, i) => k.on(q, 'click', () => {
      const open = q.getAttribute('aria-expanded') !== 'true';
      qs.forEach((o, j) => j !== i && o.getAttribute('aria-expanded') === 'true' && set(j, false));
      set(i, open);
    }));

    return () => k.destroy();
  },
};
