/** Eject Upload: files slot into the uploader like cartridges, half sticking out; removing one ejects it: it sinks a little into the slot, then springs up and out, spinning away. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { pickFiles } from './_fi.js';

export const meta = {
  title: 'Eject Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Spring-driven', 'Randomized'],
  effect: ['Ejecting', 'Anticipation-motion', 'Spinning'],
  purpose: ['Feedback', 'Delight', 'Affordance'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'An uploader built like a cartridge slot. Each file you add drops into the slot and sits there half inserted, its label showing. Press its eject button and it is pushed down a little (the spring loading), then shoots up out of the slot and spins away, and the cartridges either side slide together.',
  params: [
    { key: 'power', label: 'Eject power', group: 'Motion', type: 'range', min: 3, max: 14, step: 1, unit: 'em', default: 8, live: true },
    { key: 'spin', label: 'Spin', group: 'Motion', type: 'range', min: 0, max: 720, step: 30, unit: '°', default: 240, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Cartridge'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-ejc">
        <div class="sp-fi__wrap">
          <div class="sp-ejc__bay"><div class="sp-ejc__carts" aria-live="polite"></div><i class="sp-ejc__slot" aria-hidden="true"></i></div>
          <div class="sp-fi__drop sp-ejc__zone" role="button" tabindex="0" aria-label="Insert a file"><b>Insert a file</b><small>click, or drop one here</small></div>
        </div>
      </div>`);
    const carts = k.$('.sp-ejc__carts');
    const zone = k.$('.sp-ejc__zone');
    // The other cartridges slide to fill a gap: measure before and after (once per change), animate the difference
    const slide = (fn) => {
      const before = new Map([...carts.children].map((c) => [c, c.offsetLeft]));
      fn();
      if (reducedMotion) return;
      [...carts.children].forEach((c) => before.has(c) && gsap.fromTo(c, { x: before.get(c) - c.offsetLeft }, { x: 0, duration: 0.4, ease: 'back.out(1.6)' }));
    };
    const add = ([name]) => {
      if (carts.children.length >= 4) return;
      slide(() => carts.insertAdjacentHTML('beforeend', `<div class="sp-ejc__cart"><b>${esc(name)}</b><button type="button" class="sp-ejc__eject" aria-label="Eject ${esc(name)}">⏏</button></div>`));
      const cart = carts.lastElementChild;
      if (!reducedMotion) gsap.from(cart, { y: '-5em', duration: 0.5, ease: 'bounce.out' });
      k.on(cart.querySelector('.sp-ejc__eject'), 'click', () => {
        const ghost = cart.cloneNode(true);
        ghost.classList.add('is-out');
        ghost.querySelector('button').remove();
        ghost.style.left = `${cart.offsetLeft}px`;
        carts.append(ghost);
        slide(() => cart.remove());
        zone.focus();
        if (reducedMotion) return ghost.remove();
        gsap.timeline({ onComplete: () => ghost.remove() })
          .to(ghost, { y: '0.6em', duration: 0.12, ease: 'power2.in' })
          .to(ghost, { y: `-${p.power}em`, x: `${(Math.random() - 0.5) * 6}em`, rotation: (Math.random() < 0.5 ? -1 : 1) * p.spin, autoAlpha: 0, duration: 0.7, ease: 'power3.out' });
      });
    };
    pickFiles(k, zone, add, (on) => zone.classList.toggle('is-over', on));
    add(['scan.pdf']);
    return () => k.destroy();
  },
};
