/** Coin Flip: the icon button is a coin. A click tosses it up, spinning, and it lands heads or tails. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Coin Flip',
  element: 'Icon button',
  trigger: ['Click', 'Hover', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Randomized', 'Hover-dependent'],
  effect: ['Axial-rotation', 'Spinning', 'Projectile-motion', 'Wobbling', 'Shimmering'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Rotation', 'Position', 'Scale', 'Shadow'],
  description: 'A coin with heads on the front and tails on the back. Click to toss it: it rises, spins and lands on the other face. Hovering makes it wobble and catch the light.',
  params: [
    { key: 'direction', label: 'Flip direction', group: 'Motion', type: 'choice', options: ['Up', 'Down', 'Left', 'Right'], default: 'Up', live: true },
    { key: 'spins', label: 'Spins', group: 'Motion', type: 'range', min: 1, max: 6, step: 1, default: 3, live: true },
    { key: 'height', label: 'Toss height', group: 'Motion', type: 'range', min: 0, max: 5, step: 0.5, unit: 'em', default: 2.5, live: true },
    { key: 'outcome', label: 'Outcome', group: 'Behavior', type: 'choice', options: ['Alternate', 'Random'], default: 'Alternate', live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Coin color'),
  ],
};

const face = (big, word, cls = '') => `<span class="sp-coin__face ${cls}"><b>${big}</b><small>${word}</small></span>`;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-coin">
        <button type="button" class="sp-coin__btn" aria-label="Flip coin, showing heads">
          <i class="sp-coin__shadow"></i>
          <span class="sp-coin__toss"><span class="sp-coin__disc">${face('H', 'Heads')}${face('T', 'Tails', 'sp-coin__face--back')}</span></span>
        </button>
        <p class="sp-note" aria-live="polite">Heads · click to flip</p>
      </div>`);
    const btn = k.$('.sp-coin__btn');
    const toss = k.$('.sp-coin__toss');
    const disc = k.$('.sp-coin__disc');
    const back = k.$('.sp-coin__face--back');
    const shadow = k.$('.sp-coin__shadow');
    const note = k.$('.sp-note');
    let heads = true;
    let rot = 0;
    let busy = false;

    const axis = () => (/Left|Right/.test(p.direction) ? 'rotationY' : 'rotationX');
    const sign = () => (/Down|Left/.test(p.direction) ? -1 : 1);
    const setAxis = () => {
      rot = heads ? 0 : 180;
      gsap.set(disc, { rotationX: 0, rotationY: 0, [axis()]: rot });
      gsap.set(back, { rotationX: 0, rotationY: 0, [axis()]: 180 });
    };
    setAxis();

    k.on(btn, 'pointerenter', () => {
      if (busy || reducedMotion) return;
      gsap.to(toss, { keyframes: { rotation: [-9, 7, -4, 0] }, duration: 0.6, ease: 'power1.out' });
    });

    k.on(btn, 'click', () => {
      if (busy) return;
      const next = p.outcome === 'Random' ? Math.random() < 0.5 : !heads;
      const done = () => {
        heads = next;
        busy = false;
        const word = heads ? 'Heads' : 'Tails';
        btn.setAttribute('aria-label', `Flip coin, showing ${word.toLowerCase()}`);
        note.textContent = `${word} · click to flip`;
        setAxis();
      };
      if (reducedMotion) return done();
      busy = true;
      rot += sign() * (360 * Number(p.spins) + (next !== heads ? 180 : 0));
      const t = 0.5 + Number(p.spins) * 0.14;
      const h = Number(p.height);
      gsap.timeline({ onComplete: done })
        .to(disc, { [axis()]: rot, duration: t, ease: 'power1.inOut' }, 0)
        .to(toss, { rotation: 0, y: `${-h}em`, duration: t / 2, ease: 'power2.out' }, 0)
        .to(toss, { y: 0, duration: t / 2, ease: 'power2.in' })
        .to(shadow, { scale: 1 - h * 0.1, opacity: 0.4, duration: t / 2, ease: 'power2.out', yoyo: true, repeat: 1 }, 0)
        .to(toss, { scaleY: 0.88, scaleX: 1.06, duration: 0.08, yoyo: true, repeat: 1, ease: 'power2.out' });
    });

    return { destroy: () => k.destroy(), update: (key) => key === 'direction' && !busy && setAxis() };
  },
};
