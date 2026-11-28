/** Wave Search: while a search runs, a travelling wave rolls along the bar's underline from left to right, swelling in the middle and flattening at the ends; it smooths out when results arrive. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Wave Search',
  element: 'Search bar',
  trigger: ['Keyboard', 'Click'],
  behavior: ['Event-driven', 'Continuous', 'State-dependent'],
  effect: ['Traveling-wave', 'Sinusoidal-motion', 'Damped-oscillation'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Path'],
  description: 'A minimal underline search bar whose loading state is a wave. Press Enter (or the arrow) and the flat underline starts rippling: a train of crests rolls steadily from left to right, tallest in the middle of the bar and dying away towards both ends. When the results come back the crests shrink to nothing and the line is flat again, with the count shown beneath.',
  params: [
    { key: 'amp', label: 'Wave height', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: '', default: 4, live: true },
    { key: 'length', label: 'Wavelength', group: 'Shape', type: 'range', min: 15, max: 80, step: 5, unit: '', default: 35, live: true },
    { key: 'search', label: 'Search time', group: 'Behavior', type: 'range', min: 0.5, max: 4, step: 0.1, unit: 's', default: 2, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Wave'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('wvs');
    k.html(`
      <div class="sp sp-fi sp-wvs">
        <div class="sp-fi__wrap">
          <form class="sp-wvs__bar" role="search">
            <input class="sp-fi__input" id="${id}" type="search" value="field recordings" aria-label="Search sounds" />
            <button class="sp-wvs__go" aria-label="Search">→</button>
            <svg class="sp-wvs__line" viewBox="0 -10 200 20" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
          </form>
          <small class="sp-fi__msg" aria-live="polite"></small>
        </div>
      </div>`);
    const form = k.$('form');
    const input = k.$('input');
    const path = k.$('.sp-wvs__line path');
    const msg = k.$('.sp-fi__msg');
    const s = k.track({ a: 0, ph: 0 });
    // y = A · envelope(x) · sin(2π(x/λ) − phase): the phase grows, so crests travel left → right
    const draw = () => {
      const env = (x) => Math.sin((x / 200) * Math.PI);
      path.setAttribute('d', `M${Array.from({ length: 81 }, (_, i) => { const x = i * 2.5; return `${x} ${(s.a * env(x) * Math.sin(((x / p.length) * Math.PI * 2) - s.ph)).toFixed(2)}`; }).join(' L')}`);
    };
    draw();
    let roll;
    k.on(form, 'submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      msg.textContent = 'Listening for matches…';
      const done = () => (msg.textContent = `${12 + (q.length % 11)} sounds for “${q}”`);
      if (reducedMotion) return gsap.delayedCall(p.search, done);
      roll?.kill();
      roll = gsap.to(s, { ph: `+=${Math.PI * 2}`, duration: 0.8, ease: 'none', repeat: -1, onUpdate: draw });
      gsap.timeline({ onUpdate: draw })
        .to(s, { a: p.amp, duration: 0.4, ease: 'power2.out' })
        .to(s, { a: 0, duration: 0.6, ease: 'power2.in' }, p.search)
        .call(() => { roll.kill(); done(); draw(); });
    });
    return () => { roll?.kill(); k.destroy(); };
  },
};
