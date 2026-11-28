/** Blur Gallery: flick through the carousel fast and the photos smear with motion blur: while sliding, each picture streaks along the direction of travel with faint after-images, the faster the longer; it snaps sharp the moment it stops. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo, PHOTOS } from './_tm.js';

export const meta = {
  title: 'Blur Gallery',
  element: 'Gallery',
  trigger: ['Click', 'Keyboard', 'Swipe'],
  behavior: ['Velocity-aware', 'Direction-aware', 'Snapping'],
  effect: ['Motion-blur', 'Motion-smear', 'Sliding'],
  purpose: ['Navigation', 'Continuity', 'Feedback'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A full-width photo carousel that shows its speed. Step to the next photo and the strip slides across fast; while it moves, every photo smears into a motion blur along the direction of travel (stretched, with faint after-images trailing behind), longer the faster it is going and the more steps you skip. When it stops the blur snaps away and the picture is sharp. Arrows, ←/→, dots and swipes all move it.',
  params: [
    { key: 'time', label: 'Slide time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.45, live: true },
    { key: 'smear', label: 'Blur', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.05, unit: '', default: 0.6, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Dots'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = PHOTOS.length;
    // each slide carries two faint copies (after-images) that only show while moving
    const slide = (i) => `<div class="sp-blg__slide">${photo(i, 'sp-blg__img')}<span class="sp-blg__ghost">${photo(i, 'sp-blg__img')}</span><span class="sp-blg__ghost">${photo(i, 'sp-blg__img')}</span></div>`;
    k.html(`
      <div class="sp sp-tm sp-blg">
        <div class="sp-tm__frame sp-blg__view" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Photo 1 of ${n}"><div class="sp-blg__strip">${PHOTOS.map((_, i) => slide(i)).join('')}</div></div>
        <div class="sp-blg__bar"><button type="button" class="sp-tm__btn sp-tm__btn--ghost" data-d="-1" aria-label="Previous">‹</button><span class="sp-blg__dots">${PHOTOS.map((_, i) => `<button type="button" data-i="${i}" aria-label="Photo ${i + 1}"></button>`).join('')}</span><button type="button" class="sp-tm__btn" data-d="1" aria-label="Next">›</button></div>
      </div>`);
    const view = k.$('.sp-blg__view');
    const strip = k.$('.sp-blg__strip');
    const ghosts = k.$$('.sp-blg__ghost');
    const slides = k.$$('.sp-blg__slide'); // each stretches about its own centre while moving
    const dots = k.$$('.sp-blg__dots button');
    let W = 300, at = 0;
    k.resize(view, () => { W = view.clientWidth; gsap.set(strip, { x: -at * W }); });
    const mark = () => { dots.forEach((d, i) => d.setAttribute('aria-current', String(i === at))); view.setAttribute('aria-label', `Photo ${at + 1} of ${n}`); };
    mark();
    gsap.set(ghosts, { autoAlpha: 0 });
    let last = 0;
    const go = (to) => {
      to = (to + n) % n;
      if (to === at) return;
      const jumps = Math.abs(to - at), dir = Math.sign(to - at);
      at = to;
      mark();
      if (reducedMotion) return gsap.set(strip, { x: -at * W });
      // smear strength rises with the distance covered (and with taps in quick succession)
      const now = performance.now();
      const speed = Math.min(1, (jumps / 2 + (now - last < 350 ? 0.4 : 0)) * p.smear);
      last = now;
      const t = p.time;
      gsap.timeline()
        .to(strip, { x: -at * W, duration: t, ease: 'power3.inOut' }, 0)
        .fromTo(ghosts, { x: (i) => -dir * (i % 2 ? 0.08 : 0.04) * W * speed, autoAlpha: 0 }, { autoAlpha: 0.35 * speed, duration: t * 0.3, ease: 'power1.out' }, 0)
        .to(ghosts, { autoAlpha: 0, duration: t * 0.2 }, t * 0.75)
        .fromTo(slides, { scaleX: 1 }, { keyframes: { scaleX: [1 + 0.06 * speed, 1] }, duration: t, ease: 'power2.inOut' }, 0);
    };
    k.$$('[data-d]').forEach((b) => k.on(b, 'click', () => go(at + Number(b.dataset.d))));
    dots.forEach((d) => k.on(d, 'click', () => go(Number(d.dataset.i))));
    k.on(view, 'keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (d) e.preventDefault(), go(at + d); });
    let x0 = null;
    k.on(view, 'pointerdown', (e) => (x0 = e.clientX));
    k.on(view, 'pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 30) go(at + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    return () => k.destroy();
  },
};
