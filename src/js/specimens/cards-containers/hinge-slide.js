/** Hinge Slide: the current product card slides down and tips back on its bottom edge, fading out; the next swings in from depth on its top edge. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone, TONES } from '../_params.js';

export const meta = {
  title: 'Hinge Slide',
  element: ['Product card', 'Content card'],
  trigger: ['Click', 'Swipe', 'Keyboard', 'Hover'],
  behavior: ['Auto-advancing', 'Direction-aware', 'Reversible', 'Sequential', 'Staggered', 'Pausable', 'Looping'],
  effect: ['Axial-rotation', 'Sliding', 'Descending', 'Rising', 'Overshoot-motion'],
  purpose: ['Continuity', 'Navigation', 'Delight'],
  properties: ['Position', 'Rotation', 'Depth (z)', 'Opacity'],
  description: 'Product cards on hinges. Next: the card slides down and tips back into depth on its bottom edge, fading out before it lands, while the next one swings down from its top edge. Previous plays the mirror image.',
  params: [
    { key: 'labels', label: 'Products', group: 'Content', type: 'text', default: 'Field Notebook, Ink Pen, Kraft Envelope, Wax Seal' },
    { key: 'drop', label: 'Slide distance', group: 'Motion', type: 'range', min: 0, max: 14, step: 1, unit: 'em', default: 7, live: true },
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.5, live: true },
    { key: 'auto', label: 'Auto-advance', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Spine color'),
  ],
};

// cubic-bezier(.455, .03, .515, .955) is easeInOutQuad, which GSAP calls power1.inOut.
const EASE = 'power1.inOut';
const PRICES = [18, 6, 4, 12, 9, 24, 15];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Field Notebook', 'Ink Pen', 'Wax Seal']);
    const n = labels.length;
    k.html(`
      <div class="sp sp-hinge">
        <div class="sp-prod__bag">Bag <b aria-live="polite">0</b></div>
        <div class="sp-hinge__wrap">
          <div class="sp-hinge__deck" tabindex="0" aria-roledescription="carousel" aria-label="Products: swipe, click or use arrow keys">
            ${labels.map((l, i) => `
              <article class="sp-hinge__card" aria-hidden="${i > 0}">
                <div class="sp-prod__img"><i class="sp-prod__book" style="background:${TONES[(i + 1) % TONES.length].value}"></i></div>
                <h4 class="sp-prod__title">${esc(l)}</h4>
                <p class="sp-prod__sub sp-hinge__in">No. ${String(i + 1).padStart(2, '0')} of ${String(n).padStart(2, '0')} · paper goods</p>
                <div class="sp-prod__row sp-hinge__in"><b>$${PRICES[i % PRICES.length]}</b><button type="button" class="sp-prod__add sp-hinge__add" tabindex="${i ? -1 : 0}">Add</button></div>
                <i class="sp-hinge__shade"></i>
              </article>`).join('')}
          </div>
          <div class="sp-hinge__ctrl">
            <button type="button" class="sp-stack__btn sp-hinge__btn" data-dir="-1" aria-label="Previous product">↑</button>
            <span class="sp-hinge__dots">${labels.map(() => '<i class="sp-hinge__dot"></i>').join('')}</span>
            <button type="button" class="sp-stack__btn sp-hinge__btn" data-dir="1" aria-label="Next product">↓</button>
          </div>
        </div>
      </div>`);
    const wrap = k.$('.sp-hinge__wrap');
    const deck = k.$('.sp-hinge__deck');
    const cards = k.$$('.sp-hinge__card');
    const dots = k.$$('.sp-hinge__dot');
    const bag = k.$('.sp-prod__bag');
    const count = k.$('.sp-prod__bag b');
    k.fit(wrap);
    const shade = (c) => c.querySelector('.sp-hinge__shade');
    const d = (t) => (reducedMotion ? 0 : t);
    const em = () => parseFloat(getComputedStyle(deck).fontSize);
    // Where a card goes when it leaves toward dir (1 = down, hinge at the bottom; -1 = up, hinge at the top).
    // translateY : translateZ = 150px : 230px, as in the source keyframes.
    const pose = (dir) => ({
      transformOrigin: dir > 0 ? '50% 100%' : '50% 0%',
      rotationX: dir * 90,
      y: dir * p.drop * em(),
      z: -p.drop * em() * 1.53,
    });
    let i = 0;
    let busy = false;
    let hold = false;
    let timer;

    cards.forEach((c, j) => gsap.set(c, { autoAlpha: j ? 0 : 1 }));
    const mark = () => dots.forEach((dot, j) => dot.classList.toggle('is-on', j === i));
    mark();

    const schedule = () => {
      timer?.kill();
      if (p.auto && !hold && !reducedMotion) timer = gsap.delayedCall(2.6, () => go(1));
    };

    function go(dir) {
      if (busy) return;
      busy = true;
      timer?.kill();
      const cur = cards[i];
      i = (i + dir + n) % n;
      const next = cards[i];
      cur.setAttribute('aria-hidden', 'true');
      next.setAttribute('aria-hidden', 'false');
      cur.querySelector('.sp-hinge__add').tabIndex = -1;
      next.querySelector('.sp-hinge__add').tabIndex = 0;
      mark();
      const T = d(p.speed);
      const out = pose(dir);
      const from = pose(-dir);
      const body = next.querySelectorAll('.sp-hinge__in');
      const enter = T * 0.35;
      const land = enter + T;
      gsap.timeline({ onComplete: () => { busy = false; schedule(); } })
        // Exit (slide-rotate-hor-*-bck); it fades out well before it reaches the end pose
        .set(cur, { transformOrigin: out.transformOrigin, zIndex: 1 }, 0)
        .to(cur, { y: out.y, z: out.z, rotationX: out.rotationX, duration: T, ease: EASE }, 0)
        .to(shade(cur), { opacity: 0.5, duration: T * 0.6, ease: EASE }, 0)
        .to(cur, { autoAlpha: 0, duration: T * 0.45, ease: 'power1.in' }, T * 0.2)
        // Entrance (the same keyframes reversed), starting a beat later and fading in early
        .set(next, { ...from, autoAlpha: 0, zIndex: 2 }, 0)
        .set(shade(next), { opacity: 0.5 }, 0)
        .set(body, { y: '0.6em', opacity: 0 }, 0)
        .to(next, { y: 0, z: 0, rotationX: 0, duration: T, ease: EASE }, enter)
        .to(next, { autoAlpha: 1, duration: T * 0.45, ease: 'power1.out' }, enter + T * 0.1)
        .to(shade(next), { opacity: 0, duration: T, ease: EASE }, enter)
        // Follow-through: the hinge swings a few degrees past flat and settles
        .to(next, { rotationX: dir * 6, duration: d(0.12), ease: 'power1.out' }, land)
        .to(next, { rotationX: 0, duration: d(0.5), ease: 'elastic.out(1, 0.5)' }, land + d(0.12))
        // The details settle in one by one after the card lands
        .to(body, { y: 0, opacity: 1, stagger: d(0.06), duration: d(0.35), ease: 'power2.out' }, land - d(0.1));
    }
    schedule();

    k.$$('.sp-hinge__add').forEach((b) => k.on(b, 'click', () => {
      count.textContent = Number(count.textContent) + 1;
      gsap.fromTo(b, { scale: 0.85 }, { scale: 1, duration: d(0.4), ease: 'back.out(3)' });
      gsap.fromTo(bag, { scale: 1.25 }, { scale: 1, duration: d(0.6), ease: 'elastic.out(1, 0.4)' });
    }));

    // Pull down = next (the card falls away downward), push up = previous, tap = next.
    let startY = null;
    k.on(deck, 'pointerdown', (e) => { startY = e.target.closest('.sp-hinge__add') ? null : e.clientY; });
    k.on(deck, 'pointerup', (e) => {
      if (startY === null) return;
      const dy = e.clientY - startY;
      startY = null;
      go(dy < -24 ? -1 : 1);
    });
    k.on(deck, 'pointercancel', () => { startY = null; });
    k.on(deck, 'keydown', (e) => {
      const dir = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (dir) e.preventDefault(), go(dir);
    });
    k.$$('.sp-hinge__btn').forEach((b) => k.on(b, 'click', () => go(Number(b.dataset.dir))));
    const pause = (on) => () => { hold = on; on ? timer?.kill() : schedule(); };
    k.on(wrap, 'pointerenter', pause(true));
    k.on(wrap, 'pointerleave', pause(false));
    k.on(wrap, 'focusin', pause(true));
    k.on(wrap, 'focusout', pause(false));

    return {
      destroy: () => { timer?.kill(); k.destroy(); },
      update: (key) => key === 'auto' && schedule(),
    };
  },
};
