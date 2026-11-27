/** Explode Stack: a deck of tip cards. Click the top card: it swells, then bursts into shards that fly outward, and the next card steps forward. */
import { kit, labelsOf } from '../_kit.js';
import { TONES } from '../_params.js';
import { pieces, shards } from './_pieces.js';

export const meta = {
  title: 'Explode Stack',
  element: 'Card stack',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Queue-based', 'Sequential', 'Looping', 'Randomized'],
  effect: ['Exploding', 'Anticipation-motion', 'Divergence', 'Spinning'],
  purpose: ['Delight', 'Focus', 'Continuity'],
  properties: ['Clip & mask', 'Position', 'Rotation', 'Scale', 'Order'],
  description: 'A stack of tip cards. Click the top one: it swells for a beat, then bursts into shards that spin outward and fade, and the card underneath steps up. After the last card the deck deals itself back in.',
  params: [
    { key: 'tips', label: 'Tips', group: 'Content', type: 'text', default: 'Ease out to arrive, Ease in to leave, Stagger by 40 ms, Less is more' },
    { key: 'grain', label: 'Shards', group: 'Shape', type: 'range', min: 2, max: 6, step: 1, unit: '', default: 4, live: true },
    { key: 'force', label: 'Force', group: 'Motion', type: 'range', min: 3, max: 20, step: 1, unit: 'em', default: 10, live: true },
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const tips = labelsOf(p.tips, ['Ease out to arrive', 'Ease in to leave', 'Less is more']);
    const card = (t, i) => `
      <article class="sp-cc__card sp-exp__card" style="--sp-accent:${TONES[(i + 1) % TONES.length].value}">
        <span class="sp-cc__kick">Tip ${i + 1} of ${tips.length}</span>
        <i class="sp-cc__img"></i>
        <b class="sp-cc__title">${t.replace(/[<>&]/g, '')}</b>
        <span class="sp-cc__text">Click to burst it</span>
      </article>`;
    k.html(`
      <div class="sp sp-cc sp-exp">
        <button type="button" class="sp-cc__wrap sp-exp__deck" aria-label="Next tip">
          ${tips.map(card).join('')}
          <span class="sp-cc__pieces"></span>
        </button>
        <p class="sp-note" aria-live="polite">${tips.length} left</p>
      </div>`);
    const deck = k.$('.sp-exp__deck');
    const host = k.$('.sp-cc__pieces');
    const cards = k.$$('.sp-exp__card');
    const note = k.$('.sp-note');
    k.fit(deck, 0.8);
    const d = (t) => (reducedMotion ? 0 : t);
    let top = 0;
    let busy = false;

    // Cards behind the top one sit a little lower and smaller.
    const layout = (dur) => cards.forEach((c, i) => {
      const depth = i - top;
      gsap.to(c, { y: `${depth * 1.1}em`, scale: 1 - depth * 0.04, zIndex: cards.length - i, autoAlpha: depth < 0 ? 0 : 1, duration: d(dur), ease: 'back.out(2)' });
    });
    layout(0);

    k.on(deck, 'click', () => {
      if (busy) return;
      busy = true;
      const c = cards[top];
      const tl = gsap.timeline({ onComplete: () => (busy = false) });
      tl.to(c, { scale: 1.06, duration: d(0.18), ease: 'power2.out' })
        .to(c, { keyframes: { rotation: [-1.5, 1.5, -1, 0] }, duration: d(0.16) })
        .add(() => {
          const g = Math.round(p.grain);
          const bits = pieces(host, c.outerHTML, shards(g, g, top + 2));
          gsap.set(c, { autoAlpha: 0 });
          top += 1;
          note.textContent = `${cards.length - top} left`;
          layout(0.5);
          if (reducedMotion) return (host.innerHTML = '');
          bits.forEach(({ el, c: [cx, cy] }) => {
            const [dx, dy] = [cx - 50, cy - 50];
            const len = Math.hypot(dx, dy) || 1;
            const f = p.force * (0.7 + Math.random() * 0.6);
            gsap.to(el, { x: `${(dx / len) * f}em`, y: `${(dy / len) * f}em`, rotation: (Math.random() - 0.5) * 540, scale: 0.6, autoAlpha: 0, duration: 0.8, ease: 'expo.out' });
          });
          gsap.delayedCall(0.85, () => (host.innerHTML = ''));
          if (top >= cards.length) {
            // Deal the deck back in
            top = 0;
            gsap.delayedCall(0.6, () => {
              note.textContent = `${cards.length} left`;
              cards.forEach((card, i) => gsap.fromTo(card, { y: '-10em', autoAlpha: 0 }, { y: `${i * 1.1}em`, scale: 1 - i * 0.04, autoAlpha: 1, zIndex: cards.length - i, duration: 0.6, delay: (cards.length - i) * 0.08, ease: 'bounce.out' }));
            });
          }
        });
    });

    return () => k.destroy();
  },
};
