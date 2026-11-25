/** Ink Drop Radio: one drop of ink runs from the old choice to the new one. */
import { kit, esc, labelsOf, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ink Drop Radio',
  element: 'Radio',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Selection-dependent', 'Direction-aware', 'State-dependent'],
  effect: ['Liquid-morphing', 'Stretching', 'Squashing', 'Sliding'],
  purpose: ['Feedback', 'Continuity'],
  properties: ['Position', 'Shape', 'Scale'],
  description: 'A radio group with a single drop of ink. Picking an option makes the drop stretch along the column toward it and squash into the new ring.',
  params: [
    { key: 'labels', label: 'Options', group: 'Content', type: 'text', default: 'Letterpress, Risograph, Linocut, Cyanotype' },
    { key: 'stretch', label: 'Drip stretch', group: 'Motion', type: 'range', min: 1, max: 3, step: 0.1, unit: '×', default: 2.2, live: true },
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.55, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const name = uid('r');
    const opts = labelsOf(p.labels, ['One', 'Two']).slice(0, 5);
    k.html(`
      <div class="sp sp-radio">
        <fieldset><legend class="sp-note sp-note--inline">Pick a print</legend>
          <div class="sp-radio__list">
            ${opts.map((o, i) => `<label><input type="radio" name="${name}" ${i ? '' : 'checked'} /><span class="sp-radio__ring"></span>${esc(o)}</label>`).join('')}
            <i class="sp-radio__drop" aria-hidden="true"></i>
          </div>
        </fieldset>
      </div>`);
    const drop = k.$('.sp-radio__drop');
    const inputs = k.$$('input');
    const yOf = (i) => `${i * 2.2}em`; // rows are a fixed 2.2em (see CSS), so nothing to measure
    let at = 0;

    inputs.forEach((input, i) => k.on(input, 'change', () => {
      const down = i > at;
      at = i;
      const t = reducedMotion ? 0 : Number(p.speed);
      gsap.to(drop, { y: yOf(i), duration: t, ease: 'power3.inOut' });
      gsap.to(drop, {
        keyframes: { scaleY: [1, Number(p.stretch), 0.7, 1.1, 1], scaleX: [1, 0.6, 1.3, 0.95, 1] },
        transformOrigin: down ? 'center bottom' : 'center top',
        duration: t * 1.5, ease: 'none',
      });
    }));

    return () => k.destroy();
  },
};
