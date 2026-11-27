/** Gem Drop: "Add" turns the product card into a cut gem; it blinks, then flies into the bag. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { rounded, along, poly, shapeHTML } from './_shape.js';

export const meta = {
  title: 'Gem Drop',
  element: 'Product card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential'],
  effect: ['Shape-shifting', 'Morphing', 'Shimmering', 'Pulsating', 'Projectile-motion', 'Bouncing'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Shape', 'Clip & mask', 'Color', 'Position', 'Scale'],
  description: 'Press "Add" and the product card folds its corners into a cut gem. The gem blinks with a sparkle, then arcs into the bag, which bounces and counts up. The card re-forms for the next one.',
  params: [
    { key: 'title', label: 'Product', group: 'Content', type: 'text', default: 'Field Notebook' },
    { key: 'blinks', label: 'Blinks', group: 'Motion', type: 'range', min: 1, max: 4, step: 1, unit: '×', default: 2, live: true },
    { key: 'speed', label: 'Morph time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.7, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Gem color'),
  ],
};

const CARD = rounded(7, 5.5);
// A brilliant-cut silhouette: left girdle → table → right girdle → tip, as the same 32 points.
const GEM = along([[6, 34], [28, 6], [72, 6], [94, 34], [72, 65], [50, 96], [28, 65], [8, 37]]);

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-gem">
        <div class="sp-prod__bag">Bag <b aria-live="polite">0</b></div>
        <div class="sp-gem__wrap">
          ${shapeHTML('sp-gem__card', `
            <div class="sp-gem__body">
              <div class="sp-prod__img"><i class="sp-prod__book"></i></div>
              <h4 class="sp-prod__title">${esc(p.title)}</h4>
              <p class="sp-prod__sub">Kraft cover · 96 pages</p>
              <div class="sp-prod__row"><b>$18</b><button type="button" class="sp-prod__add sp-gem__add">Add</button></div>
            </div>
            <div class="sp-gem__stone" aria-hidden="true">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                <path class="sp-gem__facet" d="M28 6L38 34L50 6Z M72 6L62 34L50 6Z M38 34L50 96L62 34Z" />
                <path class="sp-gem__line" d="M6 34H94 M28 6L38 34L50 6L62 34L72 6 M38 34L50 96L62 34 M20 34L50 96L80 34" />
              </svg>
              <i class="sp-gem__shine"></i>
            </div>`)}
          <i class="sp-gem__spark" aria-hidden="true"></i>
        </div>
      </div>`);
    const wrap = k.$('.sp-gem__wrap');
    const card = k.$('.sp-gem__card');
    const clips = [k.$('.sp-shape__edge'), k.$('.sp-shape__face')];
    const body = k.$('.sp-gem__body');
    const stone = k.$('.sp-gem__stone');
    const spark = k.$('.sp-gem__spark');
    const bag = k.$('.sp-prod__bag');
    const count = k.$('.sp-prod__bag b');
    const btn = k.$('.sp-gem__add');
    k.fit(wrap);
    const d = (t) => (reducedMotion ? 0 : t);
    gsap.set(clips, { clipPath: poly(CARD) });
    gsap.set(stone, { autoAlpha: 0 });
    gsap.set(spark, { scale: 0 });
    let busy = false;

    k.on(btn, 'click', () => {
      if (busy) return;
      busy = true;
      const T = d(p.speed);
      // Where the bag is, in the (possibly shrunk) wrapper's own pixels.
      const s = Number(wrap.style.scale) || 1;
      const a = card.getBoundingClientRect();
      const b = bag.getBoundingClientRect();
      const dx = (b.left + b.width / 2 - (a.left + a.width / 2)) / s;
      const dy = (b.top + b.height / 2 - (a.top + a.height / 2)) / s;

      const tl = gsap.timeline({ onComplete: () => { busy = false; } })
        .to(btn, { scale: 0.85, duration: d(0.1) })
        .to(body, { autoAlpha: 0, y: '-0.4em', duration: d(0.2) })
        // Shape-shift: the corners fold into the crown, the bottom draws to a point
        .to(clips, { clipPath: poly(GEM), duration: T, ease: 'power3.inOut' }, '<0.05')
        .to(card, { scaleX: 0.6, scaleY: 0.44, rotation: 360, duration: T, ease: 'power3.inOut' }, '<')
        .to(stone, { autoAlpha: 1, duration: T * 0.5 }, `<${T * 0.1}`)
        .to(card, { scaleX: 0.66, scaleY: 0.48, duration: d(0.12), ease: 'power2.out' })
        .to(card, { scaleX: 0.6, scaleY: 0.44, duration: d(0.4), ease: 'elastic.out(1, 0.5)' });

      // Blink: a sparkle on the crown and a flash of light through the stone
      for (let i = 0; i < p.blinks; i++) {
        tl.fromTo(spark, { scale: 0, rotation: 0 }, { scale: 1.2, rotation: 90, duration: d(0.18), ease: 'power2.out' }, i ? '+=0.08' : '-=0.2')
          .fromTo(stone.querySelector('.sp-gem__shine'), { xPercent: -120 }, { xPercent: 120, duration: d(0.36), ease: 'power1.inOut' }, '<')
          .to(clips[1], { filter: 'brightness(1.6)', duration: d(0.12), yoyo: true, repeat: 1 }, '<')
          .to(spark, { scale: 0, rotation: 180, duration: d(0.18), ease: 'power2.in' });
      }

      // Into the bag along an arc, shrinking as it goes
      const F = d(0.7);
      tl.addLabel('fly', '+=0.1')
        .to(card, { x: dx, duration: F, ease: 'none' }, 'fly')
        .to(card, { y: Math.min(0, dy) - 60, duration: F / 2, ease: 'power2.out' }, 'fly')
        .to(card, { y: dy, duration: F / 2, ease: 'power2.in' }, `fly+=${F / 2}`)
        .to(card, { scale: 0.1, rotation: 400, duration: F, ease: 'power2.in' }, 'fly')
        .add(() => {
          count.textContent = Number(count.textContent) + 1;
          gsap.fromTo(bag, { scale: 1.3 }, { scale: 1, duration: d(0.6), ease: 'elastic.out(1, 0.4)' });
        })
        // The card re-forms where it was
        .set(card, { x: 0, y: 0, rotation: 0, scale: 0.5, autoAlpha: 0 })
        .set(clips, { clipPath: poly(CARD) })
        .set(stone, { autoAlpha: 0 })
        .set([body, btn], { autoAlpha: 1, y: 0, scale: 1 })
        .to(card, { scale: 1, autoAlpha: 1, duration: d(0.5), ease: 'back.out(2)' }, '+=0.15');
    });

    return () => k.destroy();
  },
};
