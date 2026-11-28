/** Skid Gallery: photos arrive like cards skidding across a table: the next one slides in fast at an angle, brakes hard with a lean, overshoots its spot and rocks square; the old one skids off the far side. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo, PHOTOS } from './_tm.js';

export const meta = {
  title: 'Skid Gallery',
  element: 'Gallery',
  trigger: ['Click', 'Keyboard', 'Swipe'],
  behavior: ['Direction-aware', 'Momentum-driven', 'Cyclic'],
  effect: ['Skidding', 'Sliding', 'Recoiling'],
  purpose: ['Navigation', 'Delight', 'Continuity'],
  properties: ['Position', 'Rotation'],
  description: 'A photo stack dealt across a table. Step to the next picture and it skids in from the side at speed, turned at an angle, braking hard so it leans back, overshooting its place a little and rocking square; the previous print skids off the other side the same way. Arrows, ←/→ and swipes all deal.',
  params: [
    { key: 'speed', label: 'Skid time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'spin', label: 'Angle', group: 'Motion', type: 'range', min: 0, max: 30, step: 1, unit: '°', default: 14, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Arrows'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-skg">
        <div class="sp-skg__table" tabindex="0" role="group" aria-roledescription="gallery" aria-label="Prints, ← → to deal">
          <div class="sp-skg__card sp-tm__frame">${photo(0, 'sp-skg__img')}</div>
        </div>
        <div class="sp-skg__bar"><button type="button" class="sp-tm__btn sp-tm__btn--ghost" data-d="-1" aria-label="Previous">‹</button><small aria-live="polite">1 / ${PHOTOS.length}</small><button type="button" class="sp-tm__btn" data-d="1" aria-label="Next">›</button></div>
      </div>`);
    const table = k.$('.sp-skg__table');
    const count = k.$('.sp-skg__bar small');
    let at = 0;
    const deal = (d) => {
      at = (at + d + PHOTOS.length) % PHOTOS.length;
      count.textContent = `${at + 1} / ${PHOTOS.length}`;
      const old = table.querySelector('.sp-skg__card:last-child');
      table.insertAdjacentHTML('beforeend', `<div class="sp-skg__card sp-tm__frame">${photo(at, 'sp-skg__img')}</div>`);
      const card = table.lastElementChild;
      if (reducedMotion) return old.remove();
      const t = p.speed;
      gsap.to(old, { x: `${-d * 18}em`, rotation: -d * p.spin * 1.5, duration: t * 0.55, ease: 'power2.in', onComplete: () => old.remove() });
      gsap.timeline()
        .fromTo(card, { x: `${d * 18}em`, rotation: d * p.spin * 2 }, { x: `${-d * 0.6}em`, rotation: -d * p.spin * 0.25, duration: t, ease: 'expo.out' })
        .to(card, { x: 0, rotation: 0, duration: t * 0.8, ease: 'elastic.out(1, 0.45)' });
    };
    k.$$('[data-d]').forEach((b) => k.on(b, 'click', () => deal(Number(b.dataset.d))));
    k.on(table, 'keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (d) e.preventDefault(), deal(d); });
    let x0 = null;
    k.on(table, 'pointerdown', (e) => (x0 = e.clientX));
    k.on(table, 'pointerup', (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 30) deal(e.clientX < x0 ? 1 : -1); x0 = null; });
    return () => k.destroy();
  },
};
