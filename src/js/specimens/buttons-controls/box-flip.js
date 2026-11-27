/** Box Flip: the button is a rectangular box that rolls over a quarter turn per click to show the next label. */
import { kit, esc, labelsOf, EASES, clickSignal } from '../_kit.js';
import { tone, signal, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Box Flip',
  element: 'Primary button',
  trigger: ['Hover', 'Click', 'Keyboard'],
  behavior: ['Hover-dependent', 'State-dependent', 'Cyclic'],
  effect: ['Rolling', 'Axial-rotation', 'Overshoot-motion'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Rotation', 'Depth (z)'],
  description: 'The button is a 3D box. Hovering tips it to peek at the next side; clicking rolls it a quarter turn so the next label faces you.',
  params: [
    { key: 'labels', label: 'Labels', group: 'Content', type: 'text', default: 'Flip me, Rolled, Once more, Again' },
    { key: 'direction', label: 'Roll direction', group: 'Motion', type: 'choice', options: ['Up', 'Down'], default: 'Up' },
    { key: 'speed', label: 'Roll time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Back', live: true },
    signal('Squash'),
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Flip me', 'Rolled']);
    const longest = labels.reduce((a, b) => (b.length > a.length ? b : a));
    k.html(`
      <div class="sp sp-box">
        <button type="button" class="sp-box__btn" aria-label="${esc(labels[0])}">
          <span class="sp-box__sizer" aria-hidden="true">${esc(longest)}</span>
          <span class="sp-box__cube" aria-hidden="true">
            ${[0, 1, 2, 3].map((i) => `<span class="sp-box__face" style="--r:${i * 90}deg">${i ? '' : esc(labels[0])}</span>`).join('')}
          </span>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-box__btn');
    const cube = k.$('.sp-box__cube');
    const faces = k.$$('.sp-box__face');
    const s = p.direction === 'Down' ? -1 : 1;
    // Face k sits at rotateX(k·90°); it faces the viewer when the cube is at -k·90°.
    const faceFor = (n) => faces[(((-n * s) % 4) + 4) % 4];
    let n = 0;
    let hover = false;
    const prepNext = () => (faceFor(n + 1).textContent = labels[(n + 1) % labels.length]);
    const tilt = (deg, t = 0.4) => gsap.to(cube, { rotationX: n * 90 * s + deg, duration: reducedMotion ? 0 : t, ease: 'power3.out' });
    prepNext();

    k.on(btn, 'pointerenter', () => ((hover = true), tilt(s * 16)));
    k.on(btn, 'pointerleave', () => ((hover = false), tilt(0)));
    k.on(btn, 'click', () => {
      n++;
      clickSignal(gsap, btn, p.signal, reducedMotion);
      btn.setAttribute('aria-label', labels[n % labels.length]);
      gsap.to(cube, {
        rotationX: n * 90 * s,
        duration: reducedMotion ? 0 : Number(p.speed),
        ease: EASES[p.ease] || 'back.out(1.8)',
        overwrite: true,
        onComplete: () => (prepNext(), hover && tilt(s * 16)),
      });
    });

    return () => k.destroy();
  },
};
