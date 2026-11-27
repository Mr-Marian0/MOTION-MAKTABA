/** Catapult Hero: a little catapult in the corner flings the headline's letters one at a time in high arcs, and each lands in its place with a squash. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Catapult Hero',
  element: 'Hero section',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Sequential', 'Staggered', 'Gravity-driven'],
  effect: ['Catapulting', 'Projectile-motion', 'Squashing', 'Spinning'],
  purpose: ['Delight', 'Branding', 'Storytelling'],
  properties: ['Position', 'Rotation', 'Scale', 'Typography'],
  description: 'A playful hero that builds its own headline. A small catapult in the corner swings its arm again and again, flinging the letters one by one in high arcs across the section; each spins through the air and lands in its slot with a little squash. Click to fling them again.',
  params: [
    { key: 'word', label: 'Headline', group: 'Content', type: 'text', default: 'Fling!' },
    { key: 'arc', label: 'Arc height', group: 'Motion', type: 'range', min: 3, max: 16, step: 1, unit: 'em', default: 10, live: true },
    { key: 'rate', label: 'Letters per second', group: 'Motion', type: 'range', min: 2, max: 10, step: 1, unit: '', default: 5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Letters'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const word = (String(p.word || 'Fling!').trim() || 'Fling!').slice(0, 10);
    k.html(`
      <div class="sp sp-pn sp-cat">
        <span class="sp-pn__kick sp-cat__kick">The paper playground</span>
        <h3 class="sp-cat__word" aria-label="${word.replace(/"/g, '')}">${[...word].map((c) => `<span class="sp-cat__ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join('')}</h3>
        <div class="sp-cat__machine" aria-hidden="true"><i class="sp-cat__arm"><i></i></i><i class="sp-cat__base"></i></div>
        <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-pn__corner sp-cat__btn">Fling again</button>
      </div>`);
    const chars = k.$$('.sp-cat__ch');
    const arm = k.$('.sp-cat__arm');
    const bucket = k.$('.sp-cat__arm i');
    let tl;

    const fling = () => {
      tl?.kill();
      gsap.set(chars, { clearProps: 'transform', autoAlpha: 0 });
      if (reducedMotion) return gsap.set(chars, { autoAlpha: 1 });
      const em = parseFloat(getComputedStyle(stage.firstElementChild).fontSize);
      const gap = 1 / p.rate;
      tl = gsap.timeline();
      chars.forEach((ch, i) => {
        // Start each letter in the bucket: its offset from its own slot, in px
        const a = bucket.getBoundingClientRect();
        const b = ch.getBoundingClientRect();
        const [dx, dy] = [a.left + a.width / 2 - (b.left + b.width / 2), a.top - b.top];
        const at = i * gap;
        tl.set(ch, { x: dx, y: dy, rotation: 0, autoAlpha: 1, transformOrigin: '50% 100%' }, at)
          .fromTo(arm, { rotation: 35 }, { rotation: -55, duration: gap * 0.45, ease: 'power4.in' }, at)
          .to(arm, { rotation: 35, duration: gap * 0.5, ease: 'power2.out' }, at + gap * 0.45)
          // Fly: straight across, up-and-down in an arc, spinning
          .to(ch, { x: 0, duration: 0.9, ease: 'none' }, at + gap * 0.4)
          .to(ch, { keyframes: { y: [dy * 0.5 - p.arc * em, 0], easeEach: 'sine.inOut' }, rotation: 360, duration: 0.9, ease: 'power1.in' }, '<')
          // Land
          .to(ch, { scaleY: 0.7, scaleX: 1.2, duration: 0.08 })
          .to(ch, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
      });
    };
    k.inView(stage, () => !tl && fling(), 0.6);
    k.on(k.$('.sp-cat__btn'), 'click', fling);

    return () => { tl?.kill(); k.destroy(); };
  },
};
