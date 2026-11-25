/** Tilt Product: the card tilts toward the cursor with a moving glare; "Add to bag" flies a dot into the bag. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Tilt & Bag',
  element: 'Product card',
  trigger: ['Cursor move', 'Hover', 'Click'],
  behavior: ['Pointer-tracking', 'Hover-dependent', 'Event-driven'],
  effect: ['Axial-rotation', 'Shimmering', 'Projectile-motion', 'Bouncing'],
  purpose: ['Affordance', 'Feedback', 'Delight'],
  properties: ['Rotation', 'Position', 'Color'],
  description: 'A product card that tilts in 3D toward the cursor while a glare slides across it. "Add to bag" throws a dot along an arc into the bag, which bounces and counts up.',
  params: [
    { key: 'title', label: 'Product', group: 'Content', type: 'text', default: 'Field Notebook' },
    { key: 'tilt', label: 'Tilt', group: 'Motion', type: 'range', min: 0, max: 25, step: 1, unit: '°', default: 12, live: true },
    { key: 'glare', label: 'Glare', group: 'Appearance', type: 'toggle', default: true, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Cover color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-prod">
        <article class="sp-prod__card">
          <div class="sp-prod__img"><i class="sp-prod__book"></i><i class="sp-prod__glare"></i></div>
          <h4 class="sp-prod__title">${esc(p.title)}</h4>
          <p class="sp-prod__sub">Kraft cover · 96 pages</p>
          <div class="sp-prod__row"><b>$18</b><button type="button" class="sp-prod__add">Add to bag</button></div>
        </article>
        <div class="sp-prod__bag">Bag <b aria-live="polite">0</b></div>
        <p class="sp-note">Move over the card · add to bag</p>
      </div>`);
    const card = k.$('.sp-prod__card');
    const glare = k.$('.sp-prod__glare');
    const bag = k.$('.sp-prod__bag');
    const count = k.$('.sp-prod__bag b');
    gsap.set(card, { transformPerspective: 700 });

    k.on(card, 'pointermove', (e) => {
      if (reducedMotion) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotationY: x * p.tilt * 2, rotationX: -y * p.tilt * 2, duration: 0.4, ease: 'power2.out' });
      gsap.to(glare, { opacity: p.glare ? 0.6 : 0, xPercent: x * 120, yPercent: y * 120, duration: 0.4 });
    });
    k.on(card, 'pointerleave', () => {
      gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)' });
      gsap.to(glare, { opacity: 0, duration: 0.4 });
    });

    k.on(k.$('.sp-prod__add'), 'click', (e) => {
      const s = stage.getBoundingClientRect();
      const a = e.currentTarget.getBoundingClientRect();
      const b = bag.getBoundingClientRect();
      const dot = document.createElement('i');
      dot.className = 'sp-prod__dot';
      k.$('.sp-prod').append(dot);
      const from = { x: a.left - s.left + a.width / 2, y: a.top - s.top + a.height / 2 };
      const to = { x: b.left - s.left + b.width / 2, y: b.top - s.top + b.height / 2 };
      const bump = () => {
        dot.remove();
        count.textContent = Number(count.textContent) + 1;
        gsap.fromTo(bag, { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      };
      if (reducedMotion) return bump();
      gsap.set(dot, from);
      gsap.to(dot, { x: to.x, duration: 0.7, ease: 'none' });
      gsap.to(dot, { y: Math.min(from.y, to.y) - 60, duration: 0.35, ease: 'power2.out' });
      gsap.to(dot, { y: to.y, scale: 0.5, duration: 0.35, delay: 0.35, ease: 'power2.in', onComplete: bump });
    });

    return () => k.destroy();
  },
};
