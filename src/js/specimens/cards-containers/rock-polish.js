/** Rock Polish: Monthly is a rough, rock-edged card; Yearly polishes it smooth and shining. Rock chips sprinkle off on every change. */
import { kit, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';
import { rounded, along, poly, seeded, shapeHTML } from './_shape.js';

export const meta = {
  title: 'Rock Polish',
  element: 'Pricing card',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Toggle-dependent', 'Reversible', 'State-dependent', 'Gravity-driven', 'Randomized'],
  effect: ['Shape-shifting', 'Morphing', 'Scattering', 'Gravity-motion', 'Shimmering', 'Shaking'],
  purpose: ['Feedback', 'Hierarchy', 'Delight'],
  properties: ['Shape', 'Clip & mask', 'Color'],
  description: 'Monthly is a rough stone card with rock-cut edges. Switch to Yearly and it shakes, chips of rock sprinkle off, and the card polishes into a smooth, shining shape. Switching back roughens it again.',
  params: [
    { key: 'prices', label: 'Prices (month, year)', group: 'Content', type: 'text', default: '9, 86' },
    { key: 'rough', label: 'Roughness', group: 'Shape', type: 'range', min: 0, max: 2, step: 0.1, unit: '×', default: 1, live: true },
    { key: 'chips', label: 'Rock chips', group: 'Motion', type: 'range', min: 0, max: 40, step: 2, unit: '', default: 18, live: true },
    { key: 'speed', label: 'Morph time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.6, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Polished color'),
  ],
};

const SMOOTH = rounded(7, 6);
// A chunky, uneven outline (8 corners), then every point nudged inward by a seeded amount.
const ROCK_OUTLINE = [[2, 17], [19, 1], [80, 4], [99, 19], [96, 82], [79, 99], [17, 96], [1, 78]];
const rock = (rough) => {
  const r = seeded(11);
  return along(ROCK_OUTLINE).map(([x, y]) => {
    const t = r() * 0.13 * rough;
    return [x + (50 - x) * t, y + (50 - y) * t];
  });
};
const PLANS = { false: ['Stone', '/mo', 'Billed monthly'], true: ['Polished', '/yr', 'Save 20% yearly'] };

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const [month, year] = labelsOf(p.prices, ['9', '86']).map((v) => Math.abs(parseInt(v, 10) || 0));
    k.html(`
      <div class="sp sp-rock">
        <div class="sp-rock__wrap">
          <div class="sp-odo__switch" role="radiogroup" aria-label="Billing">
            <i class="sp-odo__pill"></i>
            <button type="button" role="radio" aria-checked="true">Monthly</button>
            <button type="button" role="radio" aria-checked="false">Yearly</button>
          </div>
          ${shapeHTML('sp-rock__card', `
            <i class="sp-rock__grain"></i>
            <i class="sp-rock__polish"></i>
            <i class="sp-rock__shine"></i>
            <div class="sp-rock__body">
              <p class="sp-rock__plan"></p>
              <p class="sp-rock__price" aria-live="polite"><b></b><small></small></p>
              <p class="sp-rock__note"></p>
              <i class="sp-line" style="--w:80%"></i><i class="sp-line" style="--w:60%"></i>
            </div>`)}
        </div>
      </div>`);
    const root = k.$('.sp-rock');
    const wrap = k.$('.sp-rock__wrap');
    const card = k.$('.sp-rock__card');
    const clips = [card.querySelector('.sp-shape__edge'), card.querySelector('.sp-shape__face')];
    const face = clips[1];
    const grain = k.$('.sp-rock__grain');
    const polish = k.$('.sp-rock__polish');
    const shine = k.$('.sp-rock__shine');
    const body = k.$('.sp-rock__body');
    const btns = k.$$('.sp-odo__switch button');
    const pill = k.$('.sp-odo__pill');
    k.fit(wrap);
    const d = (t) => (reducedMotion ? 0 : t);
    let yearly = false;
    let tl;

    // A slow shine across the polished card, every few seconds while Yearly is on.
    const gleam = gsap.timeline({ repeat: -1, repeatDelay: 2.2, paused: true })
      .fromTo(shine, { xPercent: -130 }, { xPercent: 130, duration: 0.9, ease: 'power1.inOut' });

    const text = () => {
      const [plan, unit, note] = PLANS[yearly];
      k.$('.sp-rock__plan').textContent = plan;
      k.$('.sp-rock__price b').textContent = `$${yearly ? year : month}`;
      k.$('.sp-rock__price small').textContent = unit;
      k.$('.sp-rock__note').textContent = note;
    };

    // Rock chips: small stone shards thrown off the card's edge, falling under gravity.
    const chips = () => {
      if (reducedMotion) return;
      const R = root.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const pts = rock(Math.max(0.6, p.rough));
      for (let i = 0; i < p.chips; i++) {
        const [px, py] = pts[Math.floor(Math.random() * pts.length)];
        const x = c.left - R.left + (px / 100) * c.width;
        const y = c.top - R.top + (py / 100) * c.height;
        const out = [(px - 50) / 50, (py - 50) / 50];
        const chip = document.createElement('i');
        chip.className = 'sp-rock__chip';
        chip.style.setProperty('--s', `${0.4 + Math.random() * 0.6}em`);
        chip.style.setProperty('--c', ['#8d867a', '#a69f92', '#6f695f', '#bdb6a8'][i % 4]);
        root.append(chip);
        const far = 20 + Math.random() * 50;
        const life = 0.8 + Math.random() * 0.5;
        gsap.set(chip, { x, y, rotation: Math.random() * 360 });
        gsap.timeline({ onComplete: () => chip.remove() })
          .to(chip, { x: x + out[0] * far + (Math.random() - 0.5) * 20, rotation: `+=${(Math.random() - 0.5) * 720}`, duration: life, ease: 'power1.out' }, 0)
          .to(chip, { y: y + out[1] * far * 0.5 - 15 - Math.random() * 25, duration: life * 0.35, ease: 'power2.out' }, 0)
          .to(chip, { y: R.height + 20, duration: life * 0.65, ease: 'power2.in' }, life * 0.35)
          .to(chip, { opacity: 0, duration: 0.2 }, life - 0.2);
      }
    };

    const show = (instant) => {
      const T = instant ? 0 : d(p.speed);
      btns.forEach((b, i) => b.setAttribute('aria-checked', String(i === Number(yearly))));
      gsap.to(pill, { xPercent: yearly ? 100 : 0, duration: d(0.4), ease: 'back.out(1.6)' });
      tl?.kill();
      gleam.pause(0);
      if (T) {
        // Everything starts on the click; the new price swaps in halfway through the morph.
        tl = gsap.timeline()
          .to(card, { keyframes: { x: [-4, 4, -3, 3, -1, 0] }, duration: 0.3, ease: 'none' }, 0)
          .add(chips, 0)
          .to(clips, { clipPath: poly(yearly ? SMOOTH : rock(p.rough)), duration: T, ease: yearly ? 'power2.out' : 'back.out(2)' }, 0)
          .to(grain, { opacity: yearly ? 0 : 1, duration: T * 0.6 }, 0)
          .to(polish, { opacity: yearly ? 1 : 0, duration: T * 0.6 }, 0)
          .to(face, { color: yearly ? '#fafaf7' : '#111111', duration: T * 0.6 }, 0)
          .to(body, { scale: 0.94, opacity: 0.4, duration: T * 0.3 }, 0)
          .add(text, T * 0.3)
          .to(body, { scale: 1, opacity: 1, duration: d(0.4), ease: 'back.out(2)' }, T * 0.3);
        if (yearly) tl.add(() => gleam.play(0), T);
      } else {
        gsap.set(clips, { clipPath: poly(yearly ? SMOOTH : rock(p.rough)) });
        gsap.set(grain, { opacity: yearly ? 0 : 1 });
        gsap.set(polish, { opacity: yearly ? 1 : 0 });
        gsap.set(face, { color: yearly ? '#fafaf7' : '#111111' });
        text();
        if (yearly && !reducedMotion) gleam.play(0);
      }
    };
    show(true);

    btns.forEach((b, i) => k.on(b, 'click', () => {
      if (yearly === Boolean(i)) return;
      yearly = Boolean(i);
      show();
    }));
    // A hover catches the light on the polished card.
    k.on(card, 'pointerenter', () => yearly && !reducedMotion && gleam.play(0));

    return {
      destroy: () => { gleam.kill(); tl?.kill(); k.destroy(); },
      update: (key) => key === 'rough' && !yearly && gsap.set(clips, { clipPath: poly(rock(p.rough)) }),
    };
  },
};
