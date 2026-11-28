/** Magnet Paragraph: the pointer is a magnet for the important words: as it passes, the highlighted keywords lean and drift toward it, pulled harder the closer it gets, and spring back home when it moves on. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const TEXT = 'Good paper has a <b>tooth</b> that catches the pencil. Hot-pressed sheets are <b>smooth</b> for fine line, cold-pressed have <b>texture</b> for washes, and rough sheets <b>grip</b> pigment so it settles in the valleys.';

export const meta = {
  title: 'Magnet Paragraph',
  element: 'Paragraph',
  trigger: ['Cursor move', 'Hover'],
  behavior: ['Attracted', 'Proximity-aware', 'Elastic'],
  effect: ['Attraction-motion', 'Swaying', 'Spring-motion'],
  purpose: ['Focus', 'Delight', 'Hierarchy'],
  properties: ['Position', 'Rotation', 'Color'],
  description: 'A paragraph whose keywords are magnetic. Move the pointer over the text and the highlighted words are drawn toward it: they slide a little way out of their places and lean toward the pointer, more strongly the nearer it is, so the words you are close to cluster in to meet you. Move away and each springs back into the line.',
  params: [
    { key: 'pull', label: 'Pull', group: 'Motion', type: 'range', min: 0.1, max: 1.5, step: 0.05, unit: 'em', default: 0.6, live: true },
    { key: 'reach', label: 'Reach', group: 'Shape', type: 'range', min: 2, max: 12, step: 0.5, unit: 'em', default: 6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Keywords'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`<div class="sp sp-tm sp-mag"><p class="sp-tm__p sp-mag__p">${TEXT}</p></div>`);
    const para = k.$('.sp-mag__p');
    const keys = k.$$('.sp-mag__p b');
    // Keyword centres and the em size are measured on resize; a move only does arithmetic
    let C = [], E = 14;
    k.resize(para, () => {
      E = parseFloat(getComputedStyle(para).fontSize) || 14;
      C = keys.map((b) => [b.offsetLeft + b.offsetWidth / 2, b.offsetTop + b.offsetHeight / 2]);
    });
    const movers = keys.map((b) => [gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3.out' }), gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3.out' }), gsap.quickTo(b, 'rotation', { duration: 0.4, ease: 'power3.out' })]);
    let box;
    k.on(para, 'pointerenter', () => (box = para.getBoundingClientRect()));
    k.on(para, 'pointermove', (e) => {
      if (!box || reducedMotion) return;
      const [px, py] = [e.clientX - box.left, e.clientY - box.top];
      keys.forEach((b, i) => {
        const dx = px - C[i][0], dy = py - C[i][1];
        const d = Math.hypot(dx, dy);
        const f = Math.max(0, 1 - d / (p.reach * E));
        const pull = (f * f * p.pull * E) / (d || 1);
        movers[i][0](dx * pull); movers[i][1](dy * pull); movers[i][2](dx > 0 ? f * 8 : -f * 8);
        b.classList.toggle('is-near', f > 0.3);
      });
    });
    k.on(para, 'pointerleave', () => {
      box = null;
      keys.forEach((b) => { b.classList.remove('is-near'); gsap.to(b, { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: true }); });
    });
    return () => k.destroy();
  },
};
