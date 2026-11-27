/** Implode Clear: "Clear all" makes the notifications widget cave in on its own centre and vanish with a pop; "Undo" plays it back out. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, shards } from './_pieces.js';

export const meta = {
  title: 'Implode Clear',
  element: 'Widget',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Reversible', 'Event-driven', 'Toggle-dependent'],
  effect: ['Imploding', 'Convergence', 'Anticipation-motion', 'Pulsating'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Scale', 'Rotation', 'Opacity'],
  description: 'A notifications widget. "Clear all" makes it puff out for a beat, then cave in: every shard rushes to the centre and shrinks to nothing, ending in a small pop and a ring. "Undo" plays it back out.',
  params: [
    { key: 'grain', label: 'Shards', group: 'Shape', type: 'range', min: 3, max: 7, step: 1, unit: '', default: 5 },
    { key: 'time', label: 'Collapse time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 's', default: 0.7 },
    { key: 'spin', label: 'Spin', group: 'Motion', type: 'range', min: 0, max: 360, step: 30, unit: '°', default: 180 },
    tone('#2f4a6b'),
  ],
};

const ITEMS = [['Mei liked your post', '2m'], ['New comment on “Paper”', '14m'], ['Your export is ready', '1h']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-imp">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-imp__card">
            <div class="sp-cc__row"><span class="sp-cc__kick">Notifications</span><b class="sp-imp__badge">${ITEMS.length}</b></div>
            <ul class="sp-imp__list">${ITEMS.map(([t, m]) => `<li><i></i><span>${t}</span><small>${m}</small></li>`).join('')}</ul>
          </article>
          <div class="sp-cc__pieces"></div>
          <i class="sp-imp__pop"></i><i class="sp-imp__ring"></i>
          <span class="sp-imp__empty">All caught up</span>
        </div>
        <button type="button" class="sp-cc__btn sp-imp__btn" aria-live="polite">Clear all</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-imp__card');
    const host = k.$('.sp-cc__pieces');
    const pop = k.$('.sp-imp__pop');
    const ring = k.$('.sp-imp__ring');
    const empty = k.$('.sp-imp__empty');
    const btn = k.$('.sp-imp__btn');
    k.fit(wrap, 0.8);
    gsap.set([pop, ring, empty], { autoAlpha: 0, scale: 0 });
    let tl;
    let cleared = false;

    const build = () => {
      const g = Math.round(p.grain);
      const bits = pieces(host, card.outerHTML, shards(g, g, 9));
      const t = gsap.timeline({ paused: true });
      t.set(card, { autoAlpha: 0 })
        .fromTo(host, { scale: 1 }, { scale: 1.05, duration: 0.15, ease: 'power2.out' });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const far = Math.hypot(cx - 50, cy - 50) / 70;
        t.to(el, { xPercent: 50 - cx, yPercent: 50 - cy, scale: 0, rotation: (Math.random() - 0.5) * p.spin * 2, duration: p.time, ease: 'power4.in' }, 0.15 + (1 - far) * 0.12);
      });
      t.to(pop, { autoAlpha: 1, scale: 1.4, duration: 0.12, ease: 'power2.out' })
        .to(pop, { autoAlpha: 0, scale: 0, duration: 0.25, ease: 'power2.in' })
        .fromTo(ring, { autoAlpha: 1, scale: 0 }, { autoAlpha: 0, scale: 3, duration: 0.5, ease: 'power2.out' }, '<-0.1')
        .to(empty, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2.5)' }, '<');
      return t;
    };

    k.on(btn, 'click', () => {
      cleared = !cleared;
      btn.textContent = cleared ? 'Undo' : 'Clear all';
      if (cleared) {
        tl?.kill();
        tl = build();
        tl.play();
      } else {
        tl.eventCallback('onReverseComplete', () => (host.innerHTML = '')).timeScale(1.6).reverse();
      }
      if (reducedMotion) tl.progress(cleared ? 1 : 0);
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
