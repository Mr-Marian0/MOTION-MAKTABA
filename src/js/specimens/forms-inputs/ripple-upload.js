/** Ripple Upload: drop a file into the zone and it lands like a stone in a pond: rings spread out from where it fell, and as the wave passes the files listed below, each one bobs in turn. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

export const meta = {
  title: 'Ripple Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Position-aware', 'Event-driven', 'Cascading'],
  effect: ['Wave-propagation', 'Ripple-deformation', 'Bobbing'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Scale', 'Opacity', 'Position'],
  description: 'An upload zone that behaves like water. Click it or drop a file on it and rings spread out from exactly where it landed, three ripples one after another, fading as they grow. The wave carries on past the zone: each file already in the list bobs down and up as the ripple reaches it, nearest first.',
  params: [
    { key: 'rings', label: 'Rings', group: 'Shape', type: 'range', min: 1, max: 5, step: 1, unit: '', default: 3, live: true },
    { key: 'speed', label: 'Wave time', group: 'Motion', type: 'range', min: 0.5, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-rpl">
        <div class="sp-fi__wrap">
          <div class="sp-fi__drop sp-rpl__pond" role="button" tabindex="0" aria-label="Add a file"><b>Drop a file in</b><small>or click anywhere here</small><span class="sp-rpl__rings" aria-hidden="true"></span></div>
          <div class="sp-rpl__list" aria-live="polite"></div>
        </div>
      </div>`);
    const pond = k.$('.sp-rpl__pond');
    const rings = k.$('.sp-rpl__rings');
    const list = k.$('.sp-rpl__list');
    let spot = null; // where the last pointer press / drop happened, in pond pixels
    const remember = (e) => { const r = pond.getBoundingClientRect(); spot = [e.clientX - r.left, e.clientY - r.top]; };
    k.on(pond, 'pointerdown', remember);
    k.on(pond, 'drop', remember);
    const splash = () => {
      const [x, y] = spot || [pond.offsetWidth / 2, pond.offsetHeight / 2];
      spot = null;
      if (reducedMotion) return;
      for (let i = 0; i < p.rings; i++) {
        const r = document.createElement('i');
        rings.append(r);
        gsap.fromTo(r, { x, y, scale: 0, opacity: 0.9 }, { scale: 1, opacity: 0, duration: p.speed, delay: i * p.speed * 0.22, ease: 'power1.out', onComplete: () => r.remove() });
      }
      // The wave reaches the listed files in order of distance below the splash
      [...list.children].forEach((c, i) => gsap.fromTo(c, { y: 0 }, { keyframes: { y: ['0.3em', '-0.15em', 0] }, duration: 0.6, delay: p.speed * 0.35 + i * p.speed * 0.15, ease: 'sine.inOut' }));
    };
    pickFiles(k, pond, (file) => {
      splash();
      if (list.children.length >= 3) list.lastElementChild.remove();
      list.insertAdjacentHTML('afterbegin', fileChip(file));
      const chip = list.firstElementChild;
      k.on(chip.querySelector('.sp-fi__x'), 'click', () => chip.remove());
      if (!reducedMotion) gsap.from(chip, { autoAlpha: 0, scale: 0.9, duration: 0.3 });
    }, (on) => pond.classList.toggle('is-over', on));
    return () => k.destroy();
  },
};
