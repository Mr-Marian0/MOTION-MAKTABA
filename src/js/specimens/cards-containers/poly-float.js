/** Poly Float: a levitating card that, while hovered, keeps turning into a random polygon with a new number of sides. */
import { kit } from '../_kit.js';
import { TONES } from '../_params.js';
import { rounded, ngon, poly, shapeHTML } from './_shape.js';

export const meta = {
  title: 'Poly Float',
  element: 'Widget',
  trigger: ['Hover', 'Focus', 'Idle'],
  behavior: ['Hover-dependent', 'Randomized', 'Floating', 'Looping'],
  effect: ['Geometry-morphing', 'Shape-shifting', 'Levitation', 'Bobbing', 'Rising'],
  purpose: ['Delight', 'Affordance'],
  properties: ['Shape', 'Clip & mask', 'Color', 'Position'],
  description: 'A card that levitates over its shadow. Hover it and it rises, then keeps changing into a random polygon (triangle, pentagon, octagon…) with a new number of sides and a new tilt. Let go and it settles back into a card.',
  params: [
    { key: 'every', label: 'Change every', group: 'Behavior', type: 'range', min: 0.6, max: 3, step: 0.1, unit: 's', default: 1.3, live: true },
    { key: 'max', label: 'Most sides', group: 'Shape', type: 'range', min: 4, max: 10, step: 1, unit: '', default: 8, live: true },
    { key: 'speed', label: 'Morph time', group: 'Motion', type: 'range', min: 0.3, max: 1.2, step: 0.1, unit: 's', default: 0.6, live: true },
    { key: 'lift', label: 'Float height', group: 'Motion', type: 'range', min: 0, max: 2, step: 0.1, unit: 'em', default: 0.8 },
  ],
};

const CARD = rounded(9, 9);
const NAMES = { 3: 'Triangle', 4: 'Square', 5: 'Pentagon', 6: 'Hexagon', 7: 'Heptagon', 8: 'Octagon', 9: 'Nonagon', 10: 'Decagon' };

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-poly">
        <div class="sp-poly__wrap">
          <div class="sp-poly__float">
            ${shapeHTML('sp-poly__card', `<div class="sp-poly__body"><b class="sp-poly__n">—</b><small class="sp-poly__name" aria-live="polite">Card</small></div>`)}
          </div>
          <i class="sp-poly__shadow"></i>
        </div>
        <p class="sp-note">Hover the card</p>
      </div>`);
    const wrap = k.$('.sp-poly__wrap');
    const float = k.$('.sp-poly__float');
    const card = k.$('.sp-poly__card');
    const clips = [card.querySelector('.sp-shape__edge'), card.querySelector('.sp-shape__face')];
    const face = clips[1];
    const shadow = k.$('.sp-poly__shadow');
    const num = k.$('.sp-poly__n');
    const name = k.$('.sp-poly__name');
    card.tabIndex = 0;
    card.setAttribute('aria-label', 'Shape card: hover or focus to change its shape');
    k.fit(wrap, 0.86);
    gsap.set(clips, { clipPath: poly(CARD) });
    let sides = 0;
    let timer;
    let over = false;

    // Levitation: a slow bob, the shadow breathing with it.
    const bob = reducedMotion ? null : gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 1.8, ease: 'sine.inOut' } })
      .fromTo(card, { y: 0, rotation: -2 }, { y: `${-p.lift}em`, rotation: 2 }, 0)
      .fromTo(shadow, { scale: 1, opacity: 0.5 }, { scale: 0.8, opacity: 0.32 }, 0);

    const label = (n) => {
      gsap.timeline()
        .to([num, name], { y: '-0.4em', opacity: 0, duration: 0.12 })
        .add(() => { num.textContent = n || '—'; name.textContent = n ? NAMES[n] : 'Card'; })
        .to([num, name], { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(2)' });
    };

    const morph = () => {
      let n;
      do n = 3 + Math.floor(Math.random() * (p.max - 2)); while (n === sides);
      sides = n;
      const tilt = (Math.random() - 0.5) * ((2 * Math.PI) / n);
      gsap.to(clips, { clipPath: poly(ngon(n, tilt)), duration: reducedMotion ? 0 : p.speed, ease: 'back.out(1.6)', overwrite: true });
      gsap.to(face, { backgroundColor: TONES[n % TONES.length].value, color: '#fafaf7', duration: p.speed });
      label(n);
      timer = gsap.delayedCall(p.every, morph);
    };

    const enter = () => {
      if (over) return;
      over = true;
      gsap.to(float, { y: '-1.2em', duration: 0.5, ease: 'back.out(2)' });
      morph();
    };
    const leave = () => {
      if (!over) return;
      over = false;
      timer?.kill();
      sides = 0;
      gsap.to(float, { y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
      gsap.to(clips, { clipPath: poly(CARD), duration: reducedMotion ? 0 : p.speed, ease: 'power3.out', overwrite: true });
      gsap.to(face, { backgroundColor: '#fafaf7', color: '#111111', duration: p.speed });
      label(0);
    };
    // Hover is read on the whole wrapper, so the card rising out from under the cursor doesn't count as leaving.
    k.on(wrap, 'pointerenter', enter);
    k.on(wrap, 'pointerleave', leave);
    k.on(card, 'focus', enter);
    k.on(card, 'blur', leave);

    return () => { timer?.kill(); bob?.kill(); k.destroy(); };
  },
};
