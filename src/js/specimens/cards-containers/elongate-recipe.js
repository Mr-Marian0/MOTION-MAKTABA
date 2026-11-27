/** Elongate Recipe: pull the tab and the recipe card draws out long like taffy, getting a little thinner as it stretches, to show the whole list. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Elongate Recipe',
  element: 'Content card',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Snapping', 'Elastic', 'Constrained', 'Self-expanding'],
  effect: ['Elongation', 'Springing', 'Overshoot-motion'],
  purpose: ['Hierarchy', 'Affordance', 'Delight'],
  properties: ['Size', 'Scale', 'Layout'],
  description: 'A recipe card that shows only the first few ingredients. Pull its tab down and the card draws out long like taffy, thinning a little as it stretches; let go past halfway and it springs fully open, otherwise it snaps back. Clicking the tab does the same.',
  params: [
    { key: 'thin', label: 'Thinning', group: 'Shape', type: 'range', min: 0, max: 0.2, step: 0.01, unit: '', default: 0.08, live: true },
    { key: 'spring', label: 'Springiness', group: 'Motion', type: 'range', min: 0.2, max: 0.9, step: 0.05, unit: '', default: 0.4, live: true },
    tone('#a07a52'),
  ],
};

const LIST = ['2 cups flour', '1 tsp salt', '3 eggs', '1 cup milk', '2 tbsp butter', '1 tbsp sugar', 'Zest of a lemon', 'Pinch of nutmeg'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-elg">
        <div class="sp-cc__wrap sp-elg__wrap">
          <article class="sp-cc__card sp-elg__card">
            <span class="sp-cc__kick">Recipe · 25 min</span>
            <b class="sp-cc__title">Lemon Crêpes</b>
            <div class="sp-elg__body"><ul class="sp-elg__list">${LIST.map((t) => `<li>${t}</li>`).join('')}</ul></div>
          </article>
          <button type="button" class="sp-elg__tab" aria-expanded="false" aria-label="Show all ingredients"><i></i></button>
        </div>
      </div>`);
    const wrap = k.$('.sp-elg__wrap');
    const card = k.$('.sp-elg__card');
    const body = k.$('.sp-elg__body');
    const list = k.$('.sp-elg__list');
    const tab = k.$('.sp-elg__tab');
    k.fit(wrap, 0.9);
    const em = () => parseFloat(getComputedStyle(body).fontSize);
    const scale = () => wrap.getBoundingClientRect().height / wrap.offsetHeight || 1;
    const MIN = 4.6;
    const s = k.track({ h: MIN, pull: 0 });
    const full = () => list.offsetHeight / em() + 0.4;
    // The card thins as it is pulled, and the list itself stretches a touch while held.
    const draw = () => {
      body.style.height = `${s.h}em`;
      const t = clamp((s.h - MIN) / (full() - MIN), 0, 1.3);
      gsap.set(card, { scaleX: 1 - t * p.thin });
      gsap.set(list, { scaleY: 1 + s.pull * 0.08, transformOrigin: '50% 0%' });
    };
    draw();
    // Reserve room for the fully pulled card, so fitting to the stage doesn't zoom while you pull.
    wrap.style.height = `${(card.offsetHeight + tab.offsetHeight) / em() + full() - MIN + 3}em`;
    const settle = (open) => {
      tab.setAttribute('aria-expanded', String(open));
      gsap.to(s, { h: open ? full() : MIN, pull: 0, duration: reducedMotion ? 0 : 0.9, ease: `elastic.out(1, ${p.spring})`, onUpdate: draw });
    };

    let drag = null;
    let moved = false;
    k.on(tab, 'pointerdown', (e) => {
      tab.setPointerCapture(e.pointerId);
      gsap.killTweensOf(s);
      drag = { y: e.clientY, h: s.h };
      moved = false;
    });
    k.on(tab, 'pointermove', (e) => {
      if (!drag) return;
      const dy = (e.clientY - drag.y) / scale() / em();
      if (Math.abs(dy) > 0.3) moved = true;
      // Past the end it keeps going, but harder, like taffy
      const want = drag.h + dy;
      const over = want - full();
      s.h = clamp(over > 0 ? full() + over * 0.3 : want, MIN * 0.85, full() + 3);
      s.pull = clamp(Math.abs(dy) / 8, 0, 1);
      draw();
    });
    const drop = () => {
      if (!drag) return;
      drag = null;
      if (moved) settle(s.h > (MIN + full()) / 2);
    };
    k.on(tab, 'pointerup', drop);
    k.on(tab, 'pointercancel', drop);
    k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the element
    k.on(tab, 'click', () => !moved && settle(tab.getAttribute('aria-expanded') !== 'true'));

    return () => k.destroy();
  },
};
