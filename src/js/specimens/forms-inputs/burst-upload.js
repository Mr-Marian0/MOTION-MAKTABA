/** Burst Upload: when a file finishes uploading, a ring of sparks diverges from its icon in every direction, streaking out and fading, and the icon flips to a tick. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

export const meta = {
  title: 'Burst Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Sequential', 'Randomized'],
  effect: ['Divergence', 'Exploding', 'Velocity-streak'],
  purpose: ['Feedback', 'Delight', 'Progress'],
  properties: ['Position', 'Rotation', 'Scale', 'Opacity'],
  description: 'An uploader that celebrates each finished file. While a file uploads its row shows a thin progress bar. The moment it completes, sparks diverge from the file icon: a ring of short streaks shoots straight outward in every direction, stretching as they fly and fading, and the icon turns into a green tick.',
  params: [
    { key: 'sparks', label: 'Sparks', group: 'Shape', type: 'range', min: 6, max: 24, step: 1, unit: '', default: 14 },
    { key: 'reach', label: 'Reach', group: 'Motion', type: 'range', min: 1, max: 5, step: 0.25, unit: 'em', default: 2.5, live: true },
    { key: 'time', label: 'Upload time', group: 'Motion', type: 'range', min: 0.4, max: 3, step: 0.1, unit: 's', default: 1.2, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Done'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.sparks);
    k.html(`
      <div class="sp sp-fi sp-bst">
        <div class="sp-fi__wrap">
          <div class="sp-fi__drop sp-bst__zone" role="button" tabindex="0" aria-label="Upload a file"><b>Upload</b><small>click, or drop a file</small></div>
          <div class="sp-bst__list" aria-live="polite"></div>
        </div>
      </div>`);
    const zone = k.$('.sp-bst__zone');
    const list = k.$('.sp-bst__list');
    const add = (file) => {
      if (list.children.length >= 3) list.lastElementChild.remove();
      list.insertAdjacentHTML('afterbegin', fileChip(file, 'sp-bst__row'));
      const row = list.firstElementChild;
      row.insertAdjacentHTML('beforeend', '<i class="sp-bst__bar" aria-hidden="true"></i>');
      const icon = row.querySelector('.sp-fi__ficon');
      icon.insertAdjacentHTML('afterend', `<span class="sp-bst__sparks" aria-hidden="true">${'<i></i>'.repeat(n)}</span>`);
      const sparks = [...row.querySelectorAll('.sp-bst__sparks i')];
      k.on(row.querySelector('.sp-fi__x'), 'click', () => row.remove());
      const bar = row.querySelector('.sp-bst__bar');
      // Sparks point outward: each is rotated to its angle and flies along its own length
      sparks.forEach((s, i) => gsap.set(s, { rotation: (i / n) * 360 + Math.random() * 10, transformOrigin: '0% 50%', autoAlpha: 0 }));
      const tl = gsap.timeline()
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: p.time, ease: 'power1.inOut' })
        .set(bar, { autoAlpha: 0 })
        .call(() => { icon.classList.add('is-done'); icon.textContent = '✓'; row.querySelector('.sp-fi__fname small').textContent += ' · uploaded'; })
        .fromTo(icon, { scale: 0.6 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
      sparks.forEach((s) => tl.fromTo(s, { autoAlpha: 1, x: 0, scaleX: 0.3 }, { x: `${p.reach * (0.7 + Math.random() * 0.4)}em`, scaleX: 1.4, autoAlpha: 0, duration: 0.55, ease: 'power3.out' }, '<'));
      if (reducedMotion) tl.progress(1);
    };
    pickFiles(k, zone, add, (on) => zone.classList.toggle('is-over', on));
    return () => k.destroy();
  },
};
