/** Developing Print: the picture develops like a photo print in a tray, then zooms gently on hover. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Developing Print',
  element: 'Image',
  trigger: ['In view', 'Hover', 'Click'],
  behavior: ['Visibility-dependent', 'Hover-dependent', 'Time-driven'],
  effect: ['Dissolving', 'Expansion', 'Drifting'],
  purpose: ['Storytelling', 'Delight', 'Focus'],
  properties: ['Opacity', 'Color', 'Scale', 'Blur'],
  description: 'An image that develops like a print in the darkroom: it starts pale, blurred and sepia, then sharpens into full colour when it comes into view. Hover for a slow zoom inside the frame; click to develop it again.',
  params: [
    { key: 'time', label: 'Develop time', group: 'Motion', type: 'range', min: 0.5, max: 5, step: 0.25, unit: 's', default: 2.5, live: true },
    { key: 'zoom', label: 'Hover zoom', group: 'Motion', type: 'range', min: 1, max: 1.3, step: 0.01, unit: '×', default: 1.1, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sky'),
  ],
};

const RAW = 'blur(10px) sepia(1) brightness(1.6) contrast(0.6)';
const DONE = 'blur(0px) sepia(0) brightness(1) contrast(1)';

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-print">
        <button type="button" class="sp-print__frame" aria-label="Develop the print again">
          <svg class="sp-print__img" viewBox="0 0 160 110" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Hills under a low sun">
            <rect width="160" height="110" style="fill: var(--sp-accent)"/>
            <circle cx="112" cy="40" r="16" fill="#f3c86b"/>
            <path d="M0 78 Q40 50 80 72 T160 64 V110 H0Z" fill="#6e4f33"/>
            <path d="M0 92 Q50 70 100 88 T160 84 V110 H0Z" fill="#a07a52"/>
          </svg>
        </button>
        <p class="sp-note">Hover · click to develop again</p>
      </div>`);
    const frame = k.$('.sp-print__frame');
    const img = k.$('.sp-print__img');

    const develop = () => {
      if (reducedMotion) return gsap.set(img, { filter: DONE });
      gsap.fromTo(img, { filter: RAW, opacity: 0.5 }, { filter: DONE, opacity: 1, duration: Number(p.time), ease: 'power2.inOut' });
    };
    k.inView(frame, develop);
    k.on(frame, 'click', develop);
    k.on(frame, 'pointerenter', () => !reducedMotion && gsap.to(img, { scale: p.zoom, duration: 2.5, ease: 'power2.out' }));
    k.on(frame, 'pointerleave', () => gsap.to(img, { scale: 1, duration: 1.2, ease: 'power2.out' }));

    return () => k.destroy();
  },
};
