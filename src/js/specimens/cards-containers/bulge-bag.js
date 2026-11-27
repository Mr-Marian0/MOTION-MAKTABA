/** Bulge Bag: a cart widget drawn as a soft pouch. Every item added makes its sides and bottom bulge out a little more, with a springy wobble. */
import { kit } from '../_kit.js';
import { tone, TONES } from '../_params.js';

export const meta = {
  title: 'Bulge Bag',
  element: 'Widget',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Elastic', 'Spring-driven', 'Self-expanding'],
  effect: ['Bulging', 'Dropping', 'Wobbling'],
  purpose: ['Feedback', 'Delight', 'Progress'],
  properties: ['Shape', 'Path', 'Size'],
  description: 'A cart widget drawn as a soft pouch. Each item you add drops in, and the pouch’s sides and bottom bulge out a bit further with a springy wobble, so you can see how full it is at a glance. Empty it and it relaxes flat.',
  params: [
    { key: 'give', label: 'Bulge per item', group: 'Shape', type: 'range', min: 2, max: 10, step: 1, unit: '', default: 6, live: true },
    { key: 'wobble', label: 'Wobble', group: 'Motion', type: 'range', min: 0.2, max: 0.9, step: 0.05, unit: '', default: 0.35, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Pouch'),
  ],
};

const MAX = 6;
const ITEMS = [['Pencils', 4], ['Glue', 3], ['Twine', 5], ['Ink', 7], ['Tape', 2], ['Card', 6]];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-blg">
        <div class="sp-blg__bag">
          <svg class="sp-blg__svg" viewBox="0 0 160 120" aria-hidden="true"><path class="sp-blg__shadow" /><path class="sp-blg__skin" /></svg>
          <div class="sp-blg__head"><span class="sp-cc__kick">Cart</span><b class="sp-cc__price" aria-live="polite">$0</b></div>
          <div class="sp-blg__items"></div>
        </div>
        <div class="sp-cc__btns"><button type="button" class="sp-cc__btn sp-blg__add">Add item</button><button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-blg__empty">Empty</button></div>
      </div>`);
    const bag = k.$('.sp-blg__bag');
    const [shadow, skin] = k.$$('.sp-blg__svg path');
    const items = k.$('.sp-blg__items');
    const price = k.$('.sp-blg__head b');
    const add = k.$('.sp-blg__add');
    k.fit(bag, 0.62);
    const s = k.track({ side: 0, foot: 0 });
    let count = 0;

    const draw = () => {
      const [b, f] = [s.side, s.foot];
      const d = `M18 8 L142 8 Q152 8 152 18 Q${152 + b * 2} 60 152 102 Q152 112 142 112 Q80 ${112 + f * 2} 18 112 Q8 112 8 102 Q${8 - b * 2} 60 8 18 Q8 8 18 8 Z`;
      skin.setAttribute('d', d);
      shadow.setAttribute('d', d);
    };
    draw();
    const swell = () => gsap.to(s, {
      side: count * p.give * 0.8,
      foot: count * p.give * 0.5,
      duration: reducedMotion ? 0 : 1,
      ease: `elastic.out(1, ${p.wobble})`,
      onUpdate: draw,
    });
    const total = () => (price.textContent = `$${ITEMS.slice(0, count).reduce((a, [, c]) => a + c, 0)}`);

    k.on(add, 'click', () => {
      if (count >= MAX) return;
      const [name] = ITEMS[count];
      const el = document.createElement('i');
      el.className = 'sp-blg__item';
      el.textContent = name;
      el.style.background = TONES[(count + 1) % TONES.length].value;
      items.append(el);
      count += 1;
      add.disabled = count >= MAX;
      total();
      if (reducedMotion) return swell();
      gsap.fromTo(el, { y: '-7em', rotation: (Math.random() - 0.5) * 60 }, { y: 0, rotation: (Math.random() - 0.5) * 14, duration: 0.45, ease: 'power2.in', onComplete: swell });
    });
    k.on(k.$('.sp-blg__empty'), 'click', () => {
      const out = [...items.children];
      count = 0;
      add.disabled = false;
      total();
      swell();
      gsap.to(out, { y: '-8em', autoAlpha: 0, rotation: () => (Math.random() - 0.5) * 120, duration: reducedMotion ? 0 : 0.5, stagger: 0.04, ease: 'power2.out', onComplete: () => out.forEach((el) => el.remove()) });
    });

    return () => k.destroy();
  },
};
