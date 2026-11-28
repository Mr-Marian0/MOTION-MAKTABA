/** String Tip: a tuner whose strings are real standing waves: hover one and it is plucked, vibrating between its fixed ends and dying away, while a tooltip names the note. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { page, onHover } from './_ov.js';

export const meta = {
  title: 'String Tip',
  element: 'Tooltip',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Anchored', 'Physics-driven'],
  effect: ['Standing-wave', 'Vibrating', 'Damped-oscillation'],
  purpose: ['Feedback', 'Delight', 'Affordance'],
  properties: ['Path', 'Opacity'],
  description: 'A guitar-tuner panel. Hover (or tab to) a string and it is plucked: it vibrates as a true standing wave (the ends stay fixed, the middle swings widest, a higher harmonic for the thinner strings) and dies away over a second, while a tooltip above it names the note and its pitch.',
  params: [
    { key: 'amp', label: 'Pluck', group: 'Motion', type: 'range', min: 2, max: 14, step: 1, unit: '', default: 8, live: true },
    { key: 'decay', label: 'Ring time', group: 'Motion', type: 'range', min: 0.4, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Strings'),
  ],
};

const NOTES = [['E', 82, 1], ['A', 110, 1], ['D', 147, 2], ['G', 196, 2], ['B', 247, 3], ['e', 330, 3]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-str">
        ${page('Tuner', 'Guitar')}
        <div class="sp-str__neck">
          ${NOTES.map(([n, hz], i) => { const id = uid('str'); return `<button type="button" class="sp-str__row" aria-describedby="${id}" aria-label="${n} string"><svg viewBox="0 -20 200 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 0 L200 0" style="stroke-width:${3 - i * 0.35}px" /></svg><span class="sp-ov__tip sp-str__tip" id="${id}" role="tooltip">${n} · ${hz} Hz</span></button>`; }).join('')}
        </div>
      </div>`);
    k.$$('.sp-str__row').forEach((row, i) => {
      const path = row.querySelector('path');
      const tip = row.querySelector('.sp-str__tip');
      const mode = NOTES[i][2]; // harmonic: how many half-waves fit between the ends
      const s = k.track({ e: 0, t: 0 });
      gsap.set(tip, { autoAlpha: 0, y: '0.3em' });
      // y(x, t) = A · e · sin(mode·π·x) · cos(ω t): the ends never move (nodes), the antinodes swing.
      const draw = () => {
        const c = Math.cos(s.t * (14 + i * 3)) * s.e * p.amp;
        path.setAttribute('d', `M${Array.from({ length: 41 }, (_, j) => `${j * 5} ${(Math.sin((j / 40) * Math.PI * mode) * c).toFixed(2)}`).join(' L')}`);
      };
      let ring;
      onHover(k, row, (on) => {
        gsap.to(tip, { autoAlpha: on ? 1 : 0, y: on ? 0 : '0.3em', duration: reducedMotion ? 0 : 0.2 });
        if (!on || reducedMotion) return;
        ring?.kill();
        ring = gsap.timeline({ onUpdate: draw })
          .fromTo(s, { e: 1, t: 0 }, { t: p.decay * 4, duration: p.decay, ease: 'none' })
          .to(s, { e: 0, duration: p.decay, ease: 'power2.out' }, 0);
      });
    });
    return () => k.destroy();
  },
};
