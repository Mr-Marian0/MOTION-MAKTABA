/** Compress Stack: press and hold the stack to squeeze its notes together; hold to the end and it straps into a bundle. Click the bundle to spring it open. */
import { kit } from '../_kit.js';
import { TONES } from '../_params.js';

export const meta = {
  title: 'Compress Stack',
  element: 'Card stack',
  trigger: ['Long-press', 'Keyboard', 'Click'],
  behavior: ['Long-press-controlled', 'Elastic', 'Spring-driven', 'Interruptible', 'Self-collapsing'],
  effect: ['Compression', 'Springing', 'Overshoot-motion'],
  purpose: ['Feedback', 'Hierarchy', 'Delight'],
  properties: ['Spacing', 'Scale', 'Position', 'Size'],
  description: 'A stack of notes with room between them. Press and hold: the press plate pushes down and the stack squeezes, gaps closing and each note compressing. Let go early and it springs back; hold to the end and a paper strap locks it into a bundle. Click the bundle to spring it open.',
  params: [
    { key: 'hold', label: 'Hold time', group: 'Behavior', type: 'range', min: 0.4, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    { key: 'squeeze', label: 'Squeeze', group: 'Shape', type: 'range', min: 0.2, max: 0.6, step: 0.05, unit: '', default: 0.4, live: true },
    { key: 'spring', label: 'Springiness', group: 'Motion', type: 'range', min: 0.2, max: 0.9, step: 0.05, unit: '', default: 0.35, live: true },
  ],
};

const NOTES = ['Brief', 'Sketches', 'Feedback', 'Final'];
const GAP = 3.3; // em between notes at rest
const TIGHT = 0.8; // em between notes when squeezed

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-cmp">
        <button type="button" class="sp-cmp__stack" aria-label="Press and hold to bundle the notes">
          <i class="sp-cmp__plate"></i>
          ${NOTES.map((n, i) => `<span class="sp-cc__card sp-cmp__note" style="--sp-accent:${TONES[(i + 2) % TONES.length].value}"><i></i><b>${n}</b><small>${i + 3} pages</small></span>`).join('')}
          <span class="sp-cmp__strap">${NOTES.length} notes</span>
        </button>
        <p class="sp-note" aria-live="polite">Press and hold</p>
      </div>`);
    const stack = k.$('.sp-cmp__stack');
    const plate = k.$('.sp-cmp__plate');
    const notes = k.$$('.sp-cmp__note');
    const strap = k.$('.sp-cmp__strap');
    const hint = k.$('.sp-note');
    k.fit(stack, 0.8);
    const s = k.track({ c: 0 });
    let locked = false;
    let tw;

    const draw = () => {
      const gap = GAP - (GAP - TIGHT) * s.c;
      // CSS translate/scale, so the browser resolves em live as the stage resizes
      notes.forEach((n, i) => {
        n.style.translate = `0 ${-(notes.length - 1 - i) * gap}em`;
        n.style.scale = `1 ${1 - s.c * p.squeeze}`;
      });
      // The plate rides on the top note: hovering a little at rest, pressing on it when squeezed
      plate.style.translate = `0 ${-(notes.length - 1) * gap + 3.2 * s.c * p.squeeze - (1 - s.c) * 0.6}em`;
    };
    draw();
    gsap.set(strap, { autoAlpha: 0, scaleX: 0 });

    const lock = () => {
      locked = true;
      hint.textContent = 'Click to open';
      gsap.to(strap, { autoAlpha: 1, scaleX: 1, duration: reducedMotion ? 0 : 0.35, ease: 'back.out(2)' });
      gsap.to(plate, { autoAlpha: 0, duration: 0.2 });
    };
    const press = () => {
      if (locked) return;
      tw?.kill();
      tw = gsap.to(s, { c: 1, duration: reducedMotion ? 0 : p.hold * (1 - s.c), ease: 'power1.in', onUpdate: draw, onComplete: lock });
    };
    const release = () => {
      if (locked || s.c === 0) return;
      tw?.kill();
      tw = gsap.to(s, { c: 0, duration: reducedMotion ? 0 : 1.1, ease: `elastic.out(1, ${p.spring})`, onUpdate: draw });
    };
    const open = () => {
      locked = false;
      hint.textContent = 'Press and hold';
      gsap.to(strap, { scaleX: 1.15, autoAlpha: 0, duration: 0.2 });
      gsap.to(plate, { autoAlpha: 1, duration: 0.3, delay: 0.3 });
      tw?.kill();
      tw = gsap.fromTo(s, { c: 1.15 }, { c: 0, duration: reducedMotion ? 0 : 1.2, ease: `elastic.out(1.2, ${p.spring})`, onUpdate: draw });
    };

    // Only a press that starts on a locked bundle opens it, not the click that ends the squeeze.
    let fromLocked = false;
    k.on(stack, 'pointerdown', (e) => {
      fromLocked = locked;
      if (!locked) stack.setPointerCapture(e.pointerId), press();
    });
    k.on(stack, 'pointerup', release);
    k.on(stack, 'pointercancel', release);
    k.on(window, 'pointerup', release); // lets go even if the release never reaches the stack
    k.on(stack, 'click', () => locked && fromLocked && open());
    k.on(stack, 'keydown', (e) => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        fromLocked = locked;
        if (!locked) press();
      }
    });
    k.on(stack, 'keyup', (e) => (e.key === ' ' || e.key === 'Enter') && release());

    return () => { tw?.kill(); k.destroy(); };
  },
};
