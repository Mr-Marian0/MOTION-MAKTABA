/** Windup Icon: liking something has a wind-up: the heart first squashes down and leans back (anticipation), holds for a beat, then springs up big and fills with colour, throwing out a ring. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Windup Icon',
  element: 'Icon',
  trigger: ['Click', 'Keyboard', 'Long-press'],
  behavior: ['Toggle-dependent', 'Sequential', 'Elastic'],
  effect: ['Anticipation-motion', 'Springing', 'Expansion'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Scale', 'Rotation', 'Color'],
  description: 'A like button that winds up before it fires. Press the heart and it first crouches, squashing flat and leaning back, the way a character tenses before a jump; after the wind-up it springs up oversized, fills red, throws a ring outward and settles. Holding the press longer makes a deeper wind-up and a bigger pop. Pressing again unlikes it with a small deflate.',
  params: [
    { key: 'wind', label: 'Wind-up', group: 'Motion', type: 'range', min: 0.05, max: 0.6, step: 0.05, unit: 's', default: 0.22, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Liked'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-wnd">
        <button type="button" class="sp-tm__icon sp-wnd__tile" aria-pressed="false" aria-label="Like">
          <i class="sp-wnd__ring" aria-hidden="true"></i>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path class="sp-wnd__heart" d="M12 20 C5 15 3 11 3 8.5 C3 6 5 4 7.5 4 C9.5 4 11 5.2 12 7 C13 5.2 14.5 4 16.5 4 C19 4 21 6 21 8.5 C21 11 19 15 12 20 Z"/></svg>
        </button>
        <small class="sp-wnd__count" aria-live="polite">41 likes</small>
      </div>`);
    const tile = k.$('.sp-wnd__tile');
    const heart = k.$('.sp-wnd__heart');
    const ring = k.$('.sp-wnd__ring');
    const count = k.$('.sp-wnd__count');
    gsap.set(heart, { svgOrigin: '12 20' });
    gsap.set(ring, { scale: 0, autoAlpha: 0 });
    let liked = false, down = 0, crouch;
    // Press: start crouching at once (the anticipation), deeper the longer you hold
    k.on(tile, 'pointerdown', () => {
      down = performance.now();
      if (reducedMotion || liked) return;
      crouch = gsap.to(heart, { scaleY: 0.6, scaleX: 1.2, rotation: -10, duration: p.wind * 2.5, ease: 'power2.out' });
    });
    k.on(tile, 'click', () => {
      liked = !liked;
      tile.setAttribute('aria-pressed', String(liked));
      count.textContent = `${liked ? 42 : 41} likes`;
      const held = Math.min(1, (performance.now() - down) / 600);
      crouch?.kill();
      if (reducedMotion) return heart.classList.toggle('is-on', liked);
      if (!liked) {
        heart.classList.remove('is-on');
        return gsap.fromTo(heart, { scale: 0.85 }, { scale: 1, rotation: 0, duration: 0.3, ease: 'power2.out' });
      }
      const pop = 1.35 + held * 0.35;
      gsap.timeline()
        .to(heart, { scaleY: 0.6, scaleX: 1.2, rotation: -10, duration: p.wind, ease: 'power2.out' })
        .to({}, { duration: p.wind * 0.4 })
        .call(() => heart.classList.add('is-on'))
        .to(heart, { scaleY: pop, scaleX: pop * 0.9, rotation: 6, duration: 0.14, ease: 'power3.out' })
        .fromTo(ring, { scale: 0.4, autoAlpha: 1 }, { scale: 1.6 + held * 0.6, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, '<')
        .to(heart, { scaleX: 1, scaleY: 1, rotation: 0, duration: 0.6, ease: 'elastic.out(1.2, 0.4)' }, '<0.1');
    });
    return () => k.destroy();
  },
};
