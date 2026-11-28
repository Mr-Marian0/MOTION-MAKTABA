/** Prism Video: a video thumbnail seen through a cheap lens: as the pointer moves away from its centre, the picture's red and blue channels separate toward the edges, more the further out you go; at the centre it is sharp. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Prism Video',
  element: 'Video',
  trigger: ['Cursor move', 'Hover', 'Focus'],
  behavior: ['Cursor-following', 'Proximity-aware', 'Hover-dependent'],
  effect: ['Chromatic-aberration-motion', 'RGB-splitting', 'Optical-warping'],
  purpose: ['Delight', 'Affordance', 'Branding'],
  properties: ['Position', 'Color', 'Scale'],
  description: 'A music-video thumbnail with a lens flaw. Move the pointer over it and the image splits into colour fringes like light through a prism: a red copy slides one way and a blue copy the other, along the line from the centre to the pointer, wider the nearer the pointer is to the edge. At the centre, or when you leave, the colours slide back into a clean picture. The play button gets a small pulse when focused.',
  params: [
    { key: 'split', label: 'Split', group: 'Motion', type: 'range', min: 0.1, max: 1.2, step: 0.05, unit: 'em', default: 0.5, live: true },
    tone('#f2a541', 'tone', '--sp-accent', 'Play'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-psv">
        <div class="sp-tm__video sp-psv__video" tabindex="0" aria-label="Video: Night drive (3:42)">
          <span class="sp-psv__ch sp-psv__ch--r" aria-hidden="true">${photo(3, 'sp-psv__img')}</span>
          <span class="sp-psv__ch sp-psv__ch--b" aria-hidden="true">${photo(3, 'sp-psv__img')}</span>
          <span class="sp-psv__base" aria-hidden="true">${photo(3, 'sp-psv__img')}</span>
          <b class="sp-psv__title">Night drive</b>
          <i class="sp-psv__play" aria-hidden="true">▶</i>
        </div>
      </div>`);
    const v = k.$('.sp-psv__video');
    const base = k.$('.sp-psv__base');
    const [r, b] = k.$$('.sp-psv__ch');
    let E = 14, box;
    const mx = [r, b].map((el) => [gsap.quickTo(el, 'x', { duration: 0.3 }), gsap.quickTo(el, 'y', { duration: 0.3 })]);
    const bo = gsap.quickTo(base, 'opacity', { duration: 0.3 });
    k.on(v, 'pointerenter', () => { box = v.getBoundingClientRect(); E = parseFloat(getComputedStyle(v).fontSize) || 14; });
    k.on(v, 'pointermove', (e) => {
      if (!box || reducedMotion) return;
      const dx = ((e.clientX - box.left) / box.width - 0.5) * 2;
      const dy = ((e.clientY - box.top) / box.height - 0.5) * 2;
      const amt = Math.min(1, Math.hypot(dx, dy)) * p.split * E;
      const [ux, uy] = [dx || 0.0001, dy];
      const len = Math.hypot(ux, uy) || 1;
      mx[0][0]((ux / len) * amt); mx[0][1]((uy / len) * amt);
      mx[1][0]((-ux / len) * amt); mx[1][1]((-uy / len) * amt);
      bo(1 - Math.min(1, Math.hypot(dx, dy)) * 0.35); // the clean picture thins so the fringes show
    });
    k.on(v, 'pointerleave', () => { box = null; mx.forEach(([x, y]) => { x(0); y(0); }); bo(1); });
    // Extra: focusing pulses the play button
    k.on(v, 'focus', () => !reducedMotion && gsap.fromTo(k.$('.sp-psv__play'), { scale: 1 }, { keyframes: { scale: [1.2, 1] }, duration: 0.5 }));
    return () => k.destroy();
  },
};
