/** Jitter Upload: a file that is too big is turned away: its chip jitters on the spot in tiny nervous shakes, flashing red, then slides out; files that fit sit calmly in the list. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

const LIMIT = 1; // MB

export const meta = {
  title: 'Jitter Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Conditional', 'Randomized', 'Temporary'],
  effect: ['Jittering', 'Vibrating', 'Sliding'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Position', 'Rotation', 'Color'],
  description: 'An upload with a 1 MB limit that makes rejection obvious. A file that is too large still appears, but its chip jitters in place: many tiny random shakes and twitches, its border flashing red, with a note saying why; then it slides out and is gone. Files under the limit drop in and stay. The zone itself jitters briefly when you drag a too-large file over it.',
  params: [
    { key: 'amount', label: 'Jitter', group: 'Motion', type: 'range', min: 0.5, max: 5, step: 0.5, unit: 'px', default: 2, live: true },
    { key: 'time', label: 'Jitter time', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Reject'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-jit">
        <div class="sp-fi__wrap">
          <div class="sp-fi__drop sp-jit__zone" role="button" tabindex="0" aria-label="Add a file, 1 MB at most"><b>Attach a file</b><small>up to ${LIMIT} MB · click or drop</small></div>
          <div class="sp-jit__list"></div>
          <small class="sp-fi__msg" aria-live="polite"></small>
        </div>
      </div>`);
    const zone = k.$('.sp-jit__zone');
    const list = k.$('.sp-jit__list');
    const msg = k.$('.sp-fi__msg');
    const mb = (size) => parseFloat(size) * (size.includes('MB') ? 1 : 0.001);
    const add = (file) => {
      if (list.children.length >= 3) list.lastElementChild.remove();
      list.insertAdjacentHTML('afterbegin', fileChip(file, 'sp-jit__chip'));
      const chip = list.firstElementChild;
      k.on(chip.querySelector('.sp-fi__x'), 'click', () => { chip.remove(); zone.focus(); });
      const big = mb(file[1]) > LIMIT;
      if (!big) {
        msg.textContent = `${file[0]} attached.`;
        if (!reducedMotion) gsap.from(chip, { y: '-0.8em', autoAlpha: 0, duration: 0.35, ease: 'back.out(2)' });
        return;
      }
      chip.classList.add('is-bad');
      msg.textContent = `${file[0]} is ${file[1]}, over the ${LIMIT} MB limit.`;
      if (reducedMotion) return chip.remove();
      // Jitter: a fresh random offset and twitch every frame-ish step (steps(1) keeps each pose sharp)
      const n = Math.round(p.time / 0.035);
      gsap.timeline({ onComplete: () => chip.remove() })
        .to(chip, { keyframes: Array.from({ length: n }, (_, i) => {
          const f = 1 - i / n / 2;
          return { x: (Math.random() - 0.5) * 2 * p.amount * f, y: (Math.random() - 0.5) * p.amount * f, rotation: (Math.random() - 0.5) * p.amount * 0.6, duration: 0.035, ease: 'steps(1)' };
        }) })
        .to(chip, { x: '14em', autoAlpha: 0, rotation: 0, duration: 0.45, ease: 'power2.in' });
    };
    pickFiles(k, zone, add, (on) => {
      zone.classList.toggle('is-over', on);
      // Extra: a short nervous jitter of the zone while something is dragged over it
      if (on && !reducedMotion) gsap.fromTo(zone, { x: 0 }, { keyframes: { x: [-1, 1, -1, 0] }, duration: 0.2, ease: 'steps(4)' });
    });
    return () => k.destroy();
  },
};
