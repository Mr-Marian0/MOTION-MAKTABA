/** Float & Swipe: a product card floats in an idle loop; swipe right/left to browse, swipe down to drop it into the bag. */
import { kit, esc, labelsOf, clamp } from '../_kit.js';
import { tone, TONES } from '../_params.js';

export const meta = {
  title: 'Float & Swipe',
  element: 'Product card',
  trigger: ['Idle', 'Swipe', 'Drag', 'Click', 'Keyboard'],
  behavior: ['Floating', 'Looping', 'Swipe-controlled', 'Direction-aware', 'Velocity-aware', 'Snapping'],
  effect: ['Levitation', 'Bobbing', 'Swaying', 'Sliding', 'Dropping', 'Squashing', 'Projectile-motion'],
  purpose: ['Delight', 'Navigation', 'Feedback'],
  properties: ['Position', 'Rotation', 'Scale', 'Shadow'],
  description: 'A product card hovers over its shadow in a slow idle loop. Swipe right for the next product, left for the previous one, or swipe down to drop it into the bag.',
  params: [
    { key: 'labels', label: 'Products', group: 'Content', type: 'text', default: 'Field Notebook, Ink Pen, Kraft Envelope, Wax Seal' },
    { key: 'lift', label: 'Float height', group: 'Motion', type: 'range', min: 0, max: 3, step: 0.2, unit: 'em', default: 1.2, live: true },
    { key: 'speed', label: 'Float speed', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.1, unit: 's', default: 1.6, live: true },
    { key: 'line', label: 'Swipe distance', group: 'Behavior', type: 'range', min: 10, max: 50, step: 5, unit: '%', default: 25, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Card tint'),
  ],
};

const PRICES = [18, 6, 4, 12, 9, 24, 15];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const items = labelsOf(p.labels, ['Field Notebook', 'Ink Pen', 'Wax Seal']);
    const n = items.length;
    k.html(`
      <div class="sp sp-float">
        <div class="sp-prod__bag">Bag <b aria-live="polite">0</b></div>
        <div class="sp-float__scene">
          <div class="sp-float__hover">
            <article class="sp-prod__card sp-float__card" tabindex="0" aria-roledescription="product" aria-label="Swipe or use arrow keys">
              <div class="sp-prod__img"><i class="sp-prod__book"></i></div>
              <h4 class="sp-prod__title" aria-live="polite"></h4>
              <p class="sp-prod__sub"></p>
              <div class="sp-prod__row"><b class="sp-float__price"></b><button type="button" class="sp-prod__add sp-float__add">Add</button></div>
            </article>
          </div>
          <div class="sp-float__floor">
            <i class="sp-float__shadow"></i>
            <button type="button" class="sp-float__arrow sp-float__arrow--prev" data-dir="-1" aria-label="Previous product"></button>
            <button type="button" class="sp-float__arrow sp-float__arrow--next" data-dir="1" aria-label="Next product"></button>
            <button type="button" class="sp-float__arrow sp-float__arrow--add" aria-label="Add to bag"></button>
          </div>
        </div>
      </div>`);
    const root = k.$('.sp-float');
    const scene = k.$('.sp-float__scene');
    k.fit(scene);
    const hover = k.$('.sp-float__hover');
    const card = k.$('.sp-float__card');
    const shadow = k.$('.sp-float__shadow');
    const bag = k.$('.sp-prod__bag');
    const count = k.$('.sp-prod__bag b');
    const arrows = { '-1': k.$('.sp-float__arrow--prev'), 1: k.$('.sp-float__arrow--next'), add: k.$('.sp-float__arrow--add') };
    const d = (t) => (reducedMotion ? 0 : t);
    let i = 0;
    let busy = false;

    const render = () => {
      k.$('.sp-prod__title').textContent = items[i];
      k.$('.sp-prod__sub').textContent = `No. ${String(i + 1).padStart(2, '0')} of ${String(n).padStart(2, '0')} · paper goods`;
      k.$('.sp-float__price').textContent = `$${PRICES[i % PRICES.length]}`;
      k.$('.sp-prod__book').style.background = TONES[(i + 1) % TONES.length].value;
    };
    render();

    // Idle loop: the card bobs and sways; its shadow shrinks and fades as it rises.
    let idle;
    const startIdle = () => {
      idle?.kill();
      scene.style.paddingTop = `${p.lift}em`; // room for the rise, so the scene stays centered
      gsap.set(hover, { y: 0, rotation: 0 });
      gsap.set(shadow, { scale: 1, opacity: 0.5 });
      if (reducedMotion) return;
      idle = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: p.speed, ease: 'sine.inOut' } })
        .fromTo(hover, { y: 0, rotation: -2.5 }, { y: `${-p.lift}em`, rotation: 2.5 }, 0)
        .fromTo(shadow, { scale: 1, opacity: 0.5 }, { scale: 1 - p.lift * 0.12, opacity: 0.5 - p.lift * 0.08 }, 0);
    };
    startIdle();

    const hot = (key) => Object.entries(arrows).forEach(([a, el]) => el.classList.toggle('is-hot', a === String(key)));
    const done = () => { busy = false; hot(null); idle?.resume(); };

    const go = (dir) => {
      if (busy) return;
      busy = true;
      idle?.pause();
      const w = stage.offsetWidth;
      i = (i + dir + n) % n;
      gsap.timeline({ onComplete: done })
        .to(card, { x: dir * w, y: '-=20', rotation: dir * 28, opacity: 0, duration: d(0.4), ease: 'power2.in' })
        .add(render)
        .fromTo(card, { x: -dir * w * 0.6, y: 0, rotation: -dir * 18, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: d(0.75), ease: 'back.out(1.4)' });
    };

    const fly = () => {
      const s = stage.getBoundingClientRect();
      const a = shadow.getBoundingClientRect();
      const b = bag.getBoundingClientRect();
      const dot = document.createElement('i');
      dot.className = 'sp-prod__dot';
      root.append(dot);
      const from = { x: a.left - s.left + a.width / 2, y: a.top - s.top + a.height / 2 };
      const to = { x: b.left - s.left + b.width / 2, y: b.top - s.top + b.height / 2 };
      const bump = () => {
        dot.remove();
        count.textContent = Number(count.textContent) + 1;
        gsap.fromTo(bag, { scale: 1.25 }, { scale: 1, duration: d(0.6), ease: 'elastic.out(1, 0.4)' });
      };
      if (reducedMotion) return bump();
      gsap.set(dot, from);
      gsap.to(dot, { x: to.x, duration: 0.7, ease: 'none' });
      gsap.to(dot, { y: Math.min(from.y, to.y) - 60, duration: 0.35, ease: 'power2.out' });
      gsap.to(dot, { y: to.y, scale: 0.5, duration: 0.35, delay: 0.35, ease: 'power2.in', onComplete: bump });
    };

    const add = () => {
      if (busy) return;
      busy = true;
      idle?.pause();
      const drop = shadow.getBoundingClientRect().top - card.getBoundingClientRect().bottom + Number(gsap.getProperty(card, 'y'));
      gsap.timeline({ onComplete: done })
        .to(card, { x: 0, y: drop, rotation: 0, duration: d(0.25), ease: 'power2.in' })
        .to(shadow, { scale: 1.2, opacity: 0.75, duration: d(0.25), ease: 'power2.in' }, '<')
        .to(card, { scaleX: 1.12, scaleY: 0.82, transformOrigin: '50% 100%', duration: d(0.1) })
        .to(card, { scale: 0.15, opacity: 0, duration: d(0.3), ease: 'power3.in' })
        .add(fly, '<0.15')
        .to(shadow, { scale: 1, opacity: 0.5, duration: d(0.4) }, '<')
        .set(card, { y: 0, scaleX: 1, scaleY: 1 })
        .fromTo(card, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: d(0.6), ease: 'back.out(2)' }, '+=0.1');
    };

    // Drag: right = next, left = previous, down = add to bag. Short drags spring back.
    let start = null;
    let v = { x: 0, y: 0 };
    let last = { x: 0, y: 0, t: 0 };
    const pick = (dx, dy) => {
      const w = card.offsetWidth * (p.line / 100) * 2;
      if (Math.abs(dx) > Math.abs(dy)) return Math.abs(dx) > w || Math.abs(v.x) > 0.8 ? Math.sign(dx) : null;
      return dy > w * 0.6 || v.y > 0.8 ? 'add' : null;
    };
    k.on(card, 'pointerdown', (e) => {
      if (busy || e.target.closest('.sp-float__add')) return;
      start = { x: e.clientX, y: e.clientY };
      last = { ...start, t: performance.now() };
      v = { x: 0, y: 0 };
      idle?.pause();
      card.setPointerCapture(e.pointerId);
    });
    k.on(card, 'pointermove', (e) => {
      if (!start) return;
      const now = performance.now();
      const dt = Math.max(1, now - last.t);
      v = { x: (e.clientX - last.x) / dt, y: (e.clientY - last.y) / dt };
      last = { x: e.clientX, y: e.clientY, t: now };
      const s = Number(scene.style.scale) || 1; // keep the card under the finger when the scene is shrunk
      const dx = (e.clientX - start.x) / s;
      const dy = (e.clientY - start.y) / s;
      gsap.set(card, { x: dx, y: dy > 0 ? dy : dy * 0.25, rotation: clamp(dx / card.offsetWidth, -1, 1) * 16 });
      hot(pick(dx, dy));
    });
    const release = (e) => {
      if (!start) return;
      const s = Number(scene.style.scale) || 1;
      const dx = (e.clientX - start.x) / s;
      const dy = (e.clientY - start.y) / s;
      start = null;
      const act = pick(dx, dy);
      if (act === 'add') add();
      else if (act) go(act);
      else gsap.to(card, { x: 0, y: 0, rotation: 0, duration: d(0.8), ease: 'elastic.out(1, 0.45)', onComplete: done });
    };
    k.on(card, 'pointerup', release);
    k.on(card, 'pointercancel', release);

    k.on(card, 'keydown', (e) => {
      const act = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 'add' }[e.key];
      if (!act) return;
      e.preventDefault();
      act === 'add' ? add() : go(act);
    });
    k.on(k.$('.sp-float__add'), 'click', add);
    k.on(arrows.add, 'click', add);
    [arrows[-1], arrows[1]].forEach((b) => k.on(b, 'click', () => go(Number(b.dataset.dir))));

    return {
      destroy: () => { idle?.kill(); k.destroy(); },
      update: (key) => (key === 'lift' || key === 'speed') && startIdle(),
    };
  },
};
