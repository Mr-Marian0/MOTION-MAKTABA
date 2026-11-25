/** Swipe Stack: throw the top card away; the next springs up and the thrown one tucks in at the back. */
import { kit, esc, labelsOf, bars, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Swipe Stack',
  element: 'Card stack',
  trigger: ['Drag', 'Swipe', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Swipe-controlled', 'Velocity-aware', 'Snapping', 'Looping'],
  effect: ['Projectile-motion', 'Rotating', 'Spring-motion', 'Sliding'],
  purpose: ['Delight', 'Focus', 'Continuity'],
  properties: ['Position', 'Rotation', 'Order', 'Scale'],
  description: 'A deck of paper notes. Drag the top card and let go: past the line (or flicked fast) it flies off, the next card springs up, and the thrown one tucks in at the back. Short drags snap back.',
  params: [
    { key: 'labels', label: 'Cards', group: 'Content', type: 'text', default: 'Monday, Tuesday, Wednesday, Thursday' },
    { key: 'tilt', label: 'Drag tilt', group: 'Motion', type: 'range', min: 0, max: 30, step: 1, unit: '°', default: 14, live: true },
    { key: 'line', label: 'Throw distance', group: 'Behavior', type: 'range', min: 10, max: 60, step: 5, unit: '%', default: 30, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Tab color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['One', 'Two', 'Three']).slice(0, 6);
    k.html(`
      <div class="sp sp-stack">
        <div class="sp-stack__deck">
          ${labels.map((l, i) => `<article class="sp-stack__card"><b>${esc(l)}</b><small>Note ${i + 1}</small>${bars(3)}</article>`).join('')}
        </div>
        <div class="sp-stack__btns">
          <button type="button" class="sp-stack__btn" data-dir="-1" aria-label="Throw left">←</button>
          <button type="button" class="sp-stack__btn" data-dir="1" aria-label="Throw right">→</button>
        </div>
      </div>`);
    const deck = k.$('.sp-stack__deck');
    let order = k.$$('.sp-stack__card'); // order[0] is on top
    const d = (t) => (reducedMotion ? 0 : t);

    const layout = (t = 0.5, skip) => order.forEach((c, i) => {
      if (c === skip) return; // the card that's still flying away
      gsap.set(c, { zIndex: order.length - i });
      gsap.to(c, { x: 0, y: `${i * 0.6}em`, rotation: i ? (i % 2 ? 2 : -2) : 0, scale: 1 - i * 0.04, opacity: i > 3 ? 0 : 1, duration: d(t), ease: 'back.out(1.6)' });
    });
    layout(0);

    const toss = (dir) => {
      const top = order[0];
      order = [...order.slice(1), top];
      gsap.to(top, {
        x: dir * deck.offsetWidth * 1.4, y: '-=40', rotation: dir * 35, duration: d(0.45), ease: 'power2.in',
        onComplete: () => { gsap.set(top, { x: 0, y: `${order.length}em`, rotation: 0, opacity: 0 }); layout(); },
      });
      gsap.set(top, { zIndex: order.length + 1 });
      layout(0.5, top);
    };

    // Drag the top card.
    let start = null;
    let last = { x: 0, t: 0, v: 0 };
    k.on(deck, 'pointerdown', (e) => {
      if (!order[0].contains(e.target)) return;
      start = e.clientX;
      last = { x: e.clientX, t: performance.now(), v: 0 };
      deck.setPointerCapture(e.pointerId);
    });
    k.on(deck, 'pointermove', (e) => {
      if (start === null) return;
      const now = performance.now();
      last = { x: e.clientX, t: now, v: (e.clientX - last.x) / Math.max(1, now - last.t) };
      const dx = e.clientX - start;
      gsap.set(order[0], { x: dx, rotation: clamp(dx / deck.offsetWidth, -1, 1) * p.tilt });
    });
    const release = (e) => {
      if (start === null) return;
      const dx = e.clientX - start;
      start = null;
      const far = Math.abs(dx) > (deck.offsetWidth * p.line) / 100 || Math.abs(last.v) > 0.8;
      if (far && dx) toss(Math.sign(dx));
      else gsap.to(order[0], { x: 0, rotation: 0, duration: d(0.7), ease: 'elastic.out(1, 0.45)' });
    };
    k.on(deck, 'pointerup', release);
    k.on(deck, 'pointercancel', release);
    k.$$('.sp-stack__btn').forEach((b) => k.on(b, 'click', () => toss(Number(b.dataset.dir))));

    return () => k.destroy();
  },
};
