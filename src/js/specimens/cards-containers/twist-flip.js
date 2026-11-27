/** Twist Flip: a profile card that turns over band by band from top to bottom, so mid-turn it is twisted like a ribbon. */
import { kit, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';
import { pieces, grid } from './_pieces.js';

export const meta = {
  title: 'Twist Flip',
  element: 'Profile card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Staggered', 'Cascading', 'Reversible'],
  effect: ['Twisting', 'Axial-rotation'],
  purpose: ['Hierarchy', 'Continuity', 'Delight'],
  properties: ['Rotation', 'Clip & mask'],
  description: 'A two-sided profile card that twists over instead of flipping flat. Each horizontal band starts turning a moment after the one above it, so half-way the card is a twisted ribbon showing both sides at once. Click again to twist back.',
  params: [
    { key: 'bands', label: 'Bands', group: 'Shape', type: 'range', min: 4, max: 24, step: 1, unit: '', default: 12 },
    { key: 'stagger', label: 'Twist', group: 'Motion', type: 'range', min: 0, max: 0.12, step: 0.01, unit: 's', default: 0.05, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Smooth', live: true },
    tone('#b3412e'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const faces = `
      <div class="sp-tw__faces">
        <article class="sp-cc__card sp-tw__front">
          <i class="sp-cc__avatar">BL</i>
          <b class="sp-cc__title">Bo Lindqvist</b>
          <span class="sp-cc__kick">Sound designer · Malmö</span>
          <span class="sp-cc__text">Foley, ambience and tiny UI clicks.</span>
        </article>
        <article class="sp-cc__card sp-tw__back">
          <span class="sp-cc__kick">Stats</span>
          <div class="sp-tw__stats"><b>212</b><span>sounds</span><b>38</b><span>games</span><b>9 yrs</b><span>at it</span></div>
          <span class="sp-cc__text">bo@example.com</span>
        </article>
      </div>`;
    k.html(`
      <div class="sp sp-cc sp-tw">
        <button type="button" class="sp-cc__wrap sp-tw__wrap" aria-pressed="false" aria-label="Turn the card over">
          <span class="sp-tw__size">${faces}</span>
          <span class="sp-cc__pieces"></span>
        </button>
        <p class="sp-note">Click the card</p>
      </div>`);
    const wrap = k.$('.sp-tw__wrap');
    const bands = pieces(k.$('.sp-cc__pieces'), faces, grid(1, Math.round(p.bands))).map((b) => b.el);
    k.fit(wrap, 0.8);
    gsap.set(bands, { transformPerspective: 900 });
    // A band shows its back once it has turned past edge-on.
    const face = (el) => {
      const a = ((gsap.getProperty(el, 'rotationY') % 360) + 360) % 360;
      el.classList.toggle('is-back', a > 90 && a < 270);
    };

    k.on(wrap, 'click', () => {
      const back = wrap.getAttribute('aria-pressed') !== 'true';
      wrap.setAttribute('aria-pressed', String(back));
      gsap.to(bands, {
        rotationY: back ? 180 : 0,
        duration: reducedMotion ? 0 : 0.8,
        ease: EASES[p.ease] || 'power3.out',
        overwrite: true,
        stagger: { each: reducedMotion ? 0 : p.stagger, onUpdate() { face(this.targets()[0]); }, onComplete() { face(this.targets()[0]); } },
      });
    });

    return () => k.destroy();
  },
};
