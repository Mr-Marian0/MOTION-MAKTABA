/** Wave Paragraph: press a word and a wave runs out through the paragraph from it: words rise and fall in turn as the crest passes, travelling outward along the lines and fading with distance. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { words } from './_tm.js';

const TEXT = 'Sound travels as a wave: each bit of air nudges the next and settles back, so the disturbance moves on while the air itself stays more or less where it was, the way a crowd does a wave in a stadium.';

export const meta = {
  title: 'Wave Paragraph',
  element: 'Paragraph',
  trigger: ['Click', 'Keyboard', 'In view'],
  behavior: ['Position-aware', 'Cascading', 'Event-driven'],
  effect: ['Traveling-wave', 'Wave-propagation', 'Bobbing'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Position', 'Color'],
  description: 'An explainer paragraph that demonstrates itself. Press any word (or tab to it and press Enter) and a wave sets off from it: each word lifts and drops back as the crest reaches it, the crest travelling outward word by word at a steady speed in both directions, lighting each word briefly and fading the further it gets. A first wave runs from the start when the paragraph comes into view.',
  params: [
    { key: 'speed', label: 'Wave speed', group: 'Motion', type: 'range', min: 4, max: 40, step: 1, unit: 'words/s', default: 16, live: true },
    { key: 'height', label: 'Wave height', group: 'Motion', type: 'range', min: 0.1, max: 0.8, step: 0.05, unit: 'em', default: 0.35, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Crest'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`<div class="sp sp-tm sp-wvp"><p class="sp-tm__p sp-wvp__p">${words(TEXT, 'sp-tm__w sp-wvp__w')}</p></div>`);
    const ws = k.$$('.sp-wvp__w');
    ws.forEach((w) => { w.tabIndex = 0; w.setAttribute('role', 'button'); });
    const send = (from) => {
      if (reducedMotion) return;
      const crest = getComputedStyle(ws[0]).getPropertyValue('--sp-accent').trim() || '#2f4a6b'; // once per wave
      ws.forEach((w, i) => {
        const d = Math.abs(i - from);
        const fade = Math.max(0.15, 1 - d / ws.length);
        gsap.timeline({ delay: d / p.speed })
          .to(w, { y: `-${p.height * fade}em`, color: crest, duration: 0.14, ease: 'sine.out' })
          .to(w, { y: 0, color: '#111111', duration: 0.3, ease: 'sine.in' });
      });
    };
    ws.forEach((w, i) => {
      k.on(w, 'click', () => send(i));
      k.on(w, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), send(i)));
    });
    k.inView(k.$('.sp-wvp__p'), () => send(0));
    return () => k.destroy();
  },
};
