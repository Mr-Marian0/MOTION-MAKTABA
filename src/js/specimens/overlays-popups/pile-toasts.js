/** Pile Toasts: notifications are physical: each new toast drops from above under gravity, lands on the pile, bounces and settles, and the pile shifts under the impact. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Pile Toasts',
  element: 'Toast',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Physics-driven', 'Gravity-driven', 'Collision-responsive', 'Queue-based'],
  effect: ['Physics-based-motion', 'Bouncing', 'Accumulation', 'Impact-motion'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position', 'Rotation', 'Order'],
  description: 'Notifications with weight. Each new toast drops from the top of the page under gravity, lands on top of the pile in the corner, bounces with a little loss each time and settles, while the toasts below jolt under the impact. The pile keeps four; "Clear" sweeps them away.',
  params: [
    { key: 'gravity', label: 'Gravity', group: 'Motion', type: 'range', min: 40, max: 200, step: 10, unit: 'em/s²', default: 110, live: true },
    { key: 'bounce', label: 'Bounciness', group: 'Motion', type: 'range', min: 0, max: 0.7, step: 0.05, unit: '', default: 0.35, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Dot'),
  ],
};

const MSGS = ['New comment', 'Export done', 'Bo joined', 'Pin saved', 'Backup complete', 'Mei liked this'];
const H = 2.8; // em per toast in the pile

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-pil">
        ${page('Activity', 'Studio')}
        <div class="sp-pil__pile" role="log" aria-live="polite"></div>
        <span class="sp-pil__btns"><button type="button" class="sp-ov__btn sp-pil__add">Notify</button><button type="button" class="sp-ov__btn sp-ov__btn--ghost sp-pil__clear">Clear</button></span>
      </div>`);
    const pile = k.$('.sp-pil__pile');
    const bodies = []; // { el, y (em above floor, of the toast's bottom), vy, rest }
    let n = 0;
    let running = false;
    // A tiny physics step: gravity pulls each toast down until it rests on the one below (or the floor).
    const step = (time, dt) => {
      const s = Math.min(dt / 1000, 0.04);
      let moving = false;
      bodies.forEach((b, i) => {
        const floor = i * H;
        b.vy -= p.gravity * s;
        b.y += b.vy * s;
        if (b.y <= floor) {
          if (b.vy < -3) {
            // Impact: bounce with some loss, and jolt the toast underneath
            bodies[i - 1] && gsap.fromTo(bodies[i - 1].el, { scaleY: 0.9 }, { scaleY: 1, duration: 0.3, ease: 'elastic.out(1, 0.4)' });
            b.vy = -b.vy * p.bounce;
          } else b.vy = 0;
          b.y = floor;
        }
        if (Math.abs(b.vy) > 0.01 || b.y > floor + 0.001) moving = true;
        gsap.set(b.el, { y: `${-b.y}em` });
      });
      if (!moving) running = false, gsap.ticker.remove(step);
    };
    const run = () => !running && ((running = true), gsap.ticker.add(step));
    k.on(k.$('.sp-pil__add'), 'click', () => {
      if (bodies.length >= 4) {
        const old = bodies.shift();
        gsap.to(old.el, { x: '6em', autoAlpha: 0, duration: 0.3, onComplete: () => old.el.remove() });
      }
      const el = document.createElement('div');
      el.className = 'sp-ov__toast sp-pil__toast';
      el.innerHTML = `<i></i><span>${MSGS[n++ % MSGS.length]}</span>`;
      el.style.rotate = `${(Math.random() - 0.5) * 4}deg`;
      pile.append(el);
      bodies.push({ el, y: reducedMotion ? bodies.length * H : 22, vy: 0 });
      reducedMotion ? step(0, 0) : run();
    });
    k.on(k.$('.sp-pil__clear'), 'click', () => {
      bodies.splice(0).forEach((b, i) => gsap.to(b.el, { x: '8em', autoAlpha: 0, duration: 0.35, delay: i * 0.05, onComplete: () => b.el.remove() }));
    });
    return () => { gsap.ticker.remove(step); k.destroy(); };
  },
};
