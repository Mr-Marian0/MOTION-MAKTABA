/** Break Heading: hit the headline and it breaks: the word cracks into chunks along jagged lines, the chunks drop and tumble apart, then fly back up and lock together again. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, shards } from '../cards-containers/_pieces.js';

export const meta = {
  title: 'Break Heading',
  element: 'Heading',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Randomized', 'Reversible'],
  effect: ['Breaking', 'Fracturing', 'Reassembly'],
  purpose: ['Delight', 'Branding'],
  properties: ['Clip & mask', 'Position', 'Rotation'],
  description: 'A bold headline you can smash. Click it (or press Enter) and it breaks along jagged cracks into a dozen chunks that fall, tumble and spread apart under gravity; after a beat they fly back up and lock together into the word again with a small jolt. Each break cracks along different lines.',
  params: [
    { key: 'text', label: 'Headline', group: 'Content', type: 'text', default: 'BREAK' },
    { key: 'chunks', label: 'Chunks', group: 'Shape', type: 'range', min: 2, max: 8, step: 1, unit: '', default: 5 },
    { key: 'fall', label: 'Fall', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const word = `<h4 class="sp-tm__h sp-brk__word">${esc(p.text)}</h4>`;
    k.html(`
      <div class="sp sp-tm sp-brk">
        <button type="button" class="sp-brk__btn" aria-label="${esc(p.text)} (break it)"><span class="sp-brk__real" aria-hidden="true">${word}</span><span class="sp-cc__pieces"></span></button>
        <p class="sp-note">Click the word</p>
      </div>`);
    const btn = k.$('.sp-brk__btn');
    const real = k.$('.sp-brk__real');
    const host = k.$('.sp-cc__pieces');
    let tl;
    k.on(btn, 'click', () => {
      if (reducedMotion || tl?.isActive()) return;
      const c = Math.round(p.chunks);
      const bits = pieces(host, word, shards(c, 2, Math.ceil(Math.random() * 99), 0.7)).map((b) => b.el);
      const r = () => Math.random() - 0.5;
      tl = gsap.timeline({ onComplete: () => { host.innerHTML = ''; gsap.set(real, { autoAlpha: 1 }); } })
        .set(real, { autoAlpha: 0 })
        .to(bits, { x: () => `${r() * 4}em`, y: () => `${p.fall * (0.6 + Math.random() * 0.6)}em`, rotation: () => r() * 160, duration: 0.7, ease: 'power2.in', stagger: { each: 0.02, from: 'random' } })
        .to(bits, { x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'power3.inOut', stagger: { each: 0.02, from: 'random' } }, '+=0.35')
        .fromTo(btn, { y: 0 }, { keyframes: { y: ['0.08em', '-0.04em', 0] }, duration: 0.25 });
    });
    return () => k.destroy();
  },
};
