/** Hop Flip: a square icon button that keeps hopping and flipping between two icons. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Hop Flip',
  element: 'Icon button',
  trigger: ['Load', 'Hover', 'Cursor move', 'Click'],
  behavior: ['Looping', 'Periodic', 'Pausable', 'Hover-dependent', 'Pointer-tracking'],
  effect: ['Hopping', 'Axial-rotation', 'Squashing', 'Anticipation-motion'],
  purpose: ['Delight', 'Affordance', 'Feedback'],
  properties: ['Position', 'Rotation', 'Scale', 'Shadow'],
  description: 'A square that loops: it crouches, hops up and flips to its other icon, then lands with a squash. Hovering pauses it and it leans toward the cursor; clicking makes a big hop with an extra spin.',
  params: [
    { key: 'rise', label: 'Hop height', group: 'Motion', type: 'range', min: 0.4, max: 3, step: 0.1, unit: 'em', default: 1.4, live: true },
    { key: 'axis', label: 'Flip axis', group: 'Motion', type: 'choice', options: ['X', 'Y'], default: 'X' },
    { key: 'pause', label: 'Rest between hops', group: 'Behavior', type: 'range', min: 0.2, max: 3, step: 0.1, unit: 's', default: 1, live: true },
    tone('#b3412e'),
  ],
};

const ICON = (d) => `<svg viewBox="0 0 24 24"><path d="${d}"/></svg>`;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-hop">
        <button type="button" class="sp-hop__btn" aria-label="Hop">
          <i class="sp-hop__shadow"></i>
          <span class="sp-hop__lean"><span class="sp-hop__body"><span class="sp-hop__cube">
            <span class="sp-hop__face">${ICON('M12 19V5M5 12l7-7 7 7')}</span>
            <span class="sp-hop__face sp-hop__face--back">${ICON('M5 12.5l4.5 4.5L19 7')}</span>
          </span></span></span>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-hop__btn');
    const lean = k.$('.sp-hop__lean');
    const body = k.$('.sp-hop__body');
    const cube = k.$('.sp-hop__cube');
    const shadow = k.$('.sp-hop__shadow');
    const axis = p.axis === 'Y' ? 'rotationY' : 'rotationX';
    gsap.set(k.$('.sp-hop__face--back'), { [axis]: 180 });
    let rot = 0;
    let hover = false;
    let tl = null;
    let wait = null;

    const schedule = () => {
      wait?.kill();
      if (!hover && !reducedMotion) wait = gsap.delayedCall(Number(p.pause), () => hop(1, 180));
    };
    // lift scales the height (and, by √, the air time); turn is the flip in degrees.
    const hop = (lift, turn) => {
      rot += turn;
      const air = Math.sqrt(lift);
      tl = gsap.timeline({ onComplete: () => ((tl = null), schedule()) })
        .to(body, { scaleX: 1.12, scaleY: 0.84, duration: 0.16, ease: 'power2.out' })
        .to(body, { y: `${-Number(p.rise) * lift}em`, scaleX: 0.94, scaleY: 1.08, duration: 0.32 * air, ease: 'power2.out' })
        .to(cube, { [axis]: rot, duration: 0.55 * air, ease: 'power2.inOut' }, '<')
        .to(shadow, { scale: 0.55, opacity: 0.35, duration: 0.32 * air, ease: 'power2.out' }, '<')
        .to(body, { y: 0, scaleX: 1, scaleY: 1, duration: 0.26 * air, ease: 'power2.in' })
        .to(shadow, { scale: 1, opacity: 1, duration: 0.26 * air, ease: 'power2.in' }, '<')
        .to(body, { scaleX: 1.1, scaleY: 0.88, duration: 0.07 })
        .to(body, { scaleX: 1, scaleY: 1, duration: 0.45, ease: 'elastic.out(1, 0.4)' });
    };
    schedule();

    k.on(btn, 'pointerenter', () => ((hover = true), wait?.kill()));
    k.on(btn, 'pointermove', (e) => {
      if (reducedMotion) return;
      const r = btn.getBoundingClientRect();
      const lx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ly = ((e.clientY - r.top) / r.height) * 2 - 1;
      gsap.to(lean, { rotationY: lx * 22, rotationX: -ly * 22, duration: 0.4, ease: 'power2.out' });
    });
    k.on(btn, 'pointerleave', () => {
      hover = false;
      gsap.to(lean, { rotationX: 0, rotationY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      if (!tl) schedule();
    });
    k.on(btn, 'click', () => {
      if (reducedMotion) return gsap.set(cube, { [axis]: (rot += 180) });
      if (tl) return;
      wait?.kill();
      hop(2.2, 540);
    });

    return () => (tl?.kill(), wait?.kill(), k.destroy());
  },
};
