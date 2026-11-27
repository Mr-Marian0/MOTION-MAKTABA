/** Shear Deck: drag the deck sideways and it shears like a pushed stack of cards: the front stays put, each card behind slides a little further, and all lean the same way. */
import { kit, clamp } from '../_kit.js';
import { TONES } from '../_params.js';

export const meta = {
  title: 'Shear Deck',
  element: 'Card stack',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Elastic', 'Constrained', 'Velocity-aware', 'Spring-driven'],
  effect: ['Shearing', 'Damped-oscillation', 'Sliding'],
  purpose: ['Delight', 'Affordance'],
  properties: ['Position', 'Shape', 'Layout'],
  description: 'A deck of project cards. Drag it sideways and it shears like a stack you are pushing: the front card stays put, every card behind slides a little further, and they all lean together. A quick flick leans it more. Let go and it wobbles back square.',
  params: [
    { key: 'reach', label: 'Max push', group: 'Behavior', type: 'range', min: 2, max: 10, step: 0.5, unit: 'em', default: 6, live: true },
    { key: 'cards', label: 'Cards', group: 'Content', type: 'range', min: 3, max: 7, step: 1, unit: '', default: 5 },
    { key: 'spring', label: 'Springiness', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: '', default: 0.3, live: true },
  ],
};

const STEP = 1.5; // em each card sits above the one in front of it
const TITLES = ['Field guide', 'Sketchbook', 'Moodboard', 'Shot list', 'Type tests', 'Archive', 'Palette'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.cards);
    k.html(`
      <div class="sp sp-cc sp-shr">
        <div class="sp-shr__deck" style="padding-top:${(n - 1) * STEP + 0.5}em" tabindex="0" role="group" aria-label="Deck of cards: drag or use arrow keys to push it">
          ${Array.from({ length: n }, (_, i) => `<div class="sp-cc__card sp-shr__card" style="--sp-accent:${TONES[(i + 1) % TONES.length].value};z-index:${n - i}"><span class="sp-cc__kick">Project ${String(i + 1).padStart(2, '0')}</span><b class="sp-cc__title">${TITLES[i]}</b><i class="sp-shr__band"></i></div>`).join('')}
        </div>
        <p class="sp-note">Drag sideways</p>
      </div>`);
    const deck = k.$('.sp-shr__deck');
    const cards = k.$$('.sp-shr__card');
    k.fit(deck, 0.8);
    const s = k.track({ dx: 0, lean: 0 });
    const tall = (n - 1) * STEP + 8;

    // Card i (0 = front) slides i/(n-1) of the way; every card leans by the same angle, so the edges line up.
    const draw = () => cards.forEach((c, i) => gsap.set(c, {
      y: `${-i * STEP}em`,
      x: `${s.dx * (i / (n - 1))}em`,
      skewX: (-Math.atan2(s.dx, tall) * 180) / Math.PI * (1 + s.lean),
    }));
    draw();
    const back = () => gsap.to(s, { dx: 0, lean: 0, duration: reducedMotion ? 0 : 1.4, ease: `elastic.out(1, ${p.spring})`, onUpdate: draw });

    let drag = null;
    k.on(deck, 'pointerdown', (e) => {
      deck.setPointerCapture(e.pointerId);
      gsap.killTweensOf(s);
      drag = { x: e.clientX, dx: s.dx, t: performance.now(), last: e.clientX };
    });
    k.on(deck, 'pointermove', (e) => {
      if (!drag) return;
      const scale = deck.getBoundingClientRect().width / deck.offsetWidth || 1;
      const em = parseFloat(getComputedStyle(deck).fontSize) * scale;
      const now = performance.now();
      const v = (e.clientX - drag.last) / Math.max(now - drag.t, 1); // px per ms
      drag.t = now;
      drag.last = e.clientX;
      s.dx = clamp(drag.dx + (e.clientX - drag.x) / em, -p.reach, p.reach);
      gsap.to(s, { lean: clamp(Math.abs(v) * 0.4, 0, 0.6), duration: 0.2, overwrite: true, onUpdate: draw });
      draw();
    });
    const drop = () => drag && ((drag = null), back());
    k.on(deck, 'pointerup', drop);
    k.on(deck, 'pointercancel', drop);
    k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the element
    k.on(deck, 'keydown', (e) => {
      const dir = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      gsap.killTweensOf(s);
      gsap.timeline().to(s, { dx: dir * p.reach * 0.7, duration: reducedMotion ? 0 : 0.25, ease: 'power2.out', onUpdate: draw }).add(back);
    });

    return () => k.destroy();
  },
};
