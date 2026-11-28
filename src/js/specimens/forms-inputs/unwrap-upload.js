/** Unwrap Upload: each uploaded file arrives as a little parcel: the string snaps, the four paper flaps fold open one after another, and the file card is inside. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

export const meta = {
  title: 'Unwrap Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Sequential', 'Staggered'],
  effect: ['Unwrapping', 'Unfolding', 'Snapping'],
  purpose: ['Feedback', 'Delight', 'Storytelling'],
  properties: ['Rotation', 'Scale', 'Clip & mask'],
  description: 'An upload that treats each file like a delivery. When a file lands it appears wrapped in brown paper and string. The string snaps and springs away, then the four paper flaps fold back one after another (top, sides, bottom) to reveal the file card underneath, ready to remove.',
  params: [
    { key: 'time', label: 'Unwrap time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'String'),
  ],
};

// Envelope flaps meeting in the middle: [clip, transform origin, fold-away rotation]
const FLAPS = [
  ['polygon(0 0, 100% 0, 50% 55%)', '50% 0%', { rotationX: 175 }],
  ['polygon(0 0, 52% 50%, 0 100%)', '0% 50%', { rotationY: -175 }],
  ['polygon(100% 0, 100% 100%, 48% 50%)', '100% 50%', { rotationY: 175 }],
  ['polygon(0 100%, 50% 45%, 100% 100%)', '50% 100%', { rotationX: -175 }],
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-unw">
        <div class="sp-fi__wrap">
          <div class="sp-fi__drop sp-unw__zone" role="button" tabindex="0" aria-label="Add a file"><b>Send us a file</b><small>click, or drop one here</small></div>
          <div class="sp-unw__shelf" aria-live="polite"></div>
        </div>
      </div>`);
    const zone = k.$('.sp-unw__zone');
    const shelf = k.$('.sp-unw__shelf');
    const add = (file) => {
      shelf.lastElementChild && shelf.children.length >= 2 && shelf.lastElementChild.remove();
      shelf.insertAdjacentHTML('afterbegin', `<div class="sp-unw__parcel">${fileChip(file)}${FLAPS.map(([c]) => `<i class="sp-unw__flap" style="clip-path:${c}"></i>`).join('')}<i class="sp-unw__string"></i></div>`);
      const parcel = shelf.firstElementChild;
      const flaps = [...parcel.querySelectorAll('.sp-unw__flap')];
      const string = parcel.querySelector('.sp-unw__string');
      const x = parcel.querySelector('.sp-fi__x');
      x.tabIndex = -1;
      k.on(x, 'click', () => gsap.to(parcel, { autoAlpha: 0, scale: 0.8, duration: reducedMotion ? 0 : 0.25, onComplete: () => parcel.remove() }));
      flaps.forEach((f, i) => gsap.set(f, { transformOrigin: FLAPS[i][1], transformPerspective: 400 }));
      const t = p.time;
      const tl = gsap.timeline({ onComplete: () => { flaps.forEach((f) => f.remove()); string.remove(); x.tabIndex = 0; } })
        .from(parcel, { y: '-1.5em', autoAlpha: 0, duration: 0.3, ease: 'back.out(2)' })
        // the string: tightens, snaps, the two ends fly apart
        .to(string, { scaleX: 1.08, duration: t * 0.12, ease: 'power2.in' })
        .to(string, { scaleY: 0, autoAlpha: 0, duration: t * 0.1, ease: 'power3.out' })
        .to(parcel, { keyframes: { y: ['-0.12em', 0] }, duration: 0.2 }, '<');
      flaps.forEach((f, i) => tl.to(f, { ...FLAPS[i][2], autoAlpha: 0, duration: t * 0.3, ease: 'power2.in' }, `>-${t * 0.12}`));
      if (reducedMotion) tl.progress(1);
    };
    pickFiles(k, zone, add, (on) => zone.classList.toggle('is-over', on));
    return () => k.destroy();
  },
};
