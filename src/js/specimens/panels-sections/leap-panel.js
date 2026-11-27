/** Leap Panel: a checkout in three panels. "Next" makes the progress token leap in a long arc to the next panel, which opens out as it lands while the one behind folds narrow. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Leap Panel',
  element: 'Expandable panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'State-dependent', 'Coordinated', 'Reversible'],
  effect: ['Leaping', 'Stretching', 'Expansion', 'Contracting'],
  purpose: ['Progress', 'Continuity', 'Wayfinding'],
  properties: ['Size', 'Position', 'Scale'],
  description: 'A three-step checkout laid out as panels in a row, the current one open wide. Press Next and its token crouches and leaps in a long arc, stretching mid-air, over to the next panel; that panel opens out as the token lands while the one behind folds narrow. Back leaps the other way.',
  params: [
    { key: 'arc', label: 'Leap height', group: 'Motion', type: 'range', min: 2, max: 10, step: 0.5, unit: 'em', default: 5, live: true },
    { key: 'time', label: 'Leap time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#4f6b4a'),
  ],
};

const STEPS = [['Cart', '3 items · $30'], ['Address', 'Ship to: Malmö'], ['Pay', 'Card ending 4242']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-lep">
        <div class="sp-lep__row">
          ${STEPS.map(([t, d], i) => `<section class="sp-lep__panel${i ? '' : ' is-open'}"><small>${i + 1}</small><b>${t}</b><span>${d}</span><i class="sp-lep__slot"></i></section>`).join('')}
          <i class="sp-lep__token" aria-hidden="true"></i>
        </div>
        <div class="sp-lep__nav"><button type="button" class="sp-pn__btn sp-pn__btn--ghost" disabled>Back</button><button type="button" class="sp-pn__btn" aria-live="polite">Next</button></div>
      </div>`);
    const row = k.$('.sp-lep__row');
    const panels = k.$$('.sp-lep__panel');
    const slots = k.$$('.sp-lep__slot');
    const token = k.$('.sp-lep__token');
    const [back, next] = k.$$('.sp-lep__nav button');
    let cur = 0;
    let tl;
    // The token's resting place: the slot of panel i, in px from the row's top-left (layout box, unscaled).
    const spot = (i) => [panels[i].offsetLeft + slots[i].offsetLeft, panels[i].offsetTop + slots[i].offsetTop];
    const place = () => gsap.set(token, { x: spot(cur)[0], y: spot(cur)[1] });
    gsap.set(panels, { flexGrow: (i) => (i ? 1 : 3) });
    k.resize(row, () => !tl?.isActive() && place());

    const go = (to) => {
      if (to < 0 || to >= panels.length || tl?.isActive()) return;
      const from = cur;
      cur = to;
      back.disabled = to === 0;
      next.disabled = to === panels.length - 1;
      next.textContent = to === panels.length - 1 ? 'Done' : 'Next';
      const t = reducedMotion ? 0 : p.time;
      const em = parseFloat(getComputedStyle(row).fontSize);
      // Panels resize first (in the background), so measure where the slot will be once they have.
      gsap.set(panels, { flexGrow: (i) => (i === to ? 3 : 1) });
      const [x, y] = spot(to);
      gsap.set(panels, { flexGrow: (i) => (i === from ? 3 : 1) });
      panels.forEach((pn, i) => pn.classList.toggle('is-open', i === to));
      tl = gsap.timeline()
        .to(token, { scaleX: 1.3, scaleY: 0.7, duration: t * 0.2, ease: 'power2.out' })
        .to(panels, { flexGrow: (i) => (i === to ? 3 : 1), duration: t, ease: 'power3.inOut' }, t * 0.15)
        .to(token, { x, duration: t, ease: 'power1.inOut' }, t * 0.2)
        .to(token, { keyframes: { y: [Math.min(y, gsap.getProperty(token, 'y')) - p.arc * em, y], easeEach: 'sine.inOut' }, scaleX: 0.8, scaleY: 1.3, duration: t, ease: 'none' }, '<')
        .to(token, { scaleX: 1.3, scaleY: 0.7, duration: 0.08 })
        .to(token, { scaleX: 1, scaleY: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
    };
    k.on(next, 'click', () => go(cur + 1));
    k.on(back, 'click', () => go(cur - 1));

    return () => { tl?.kill(); k.destroy(); };
  },
};
