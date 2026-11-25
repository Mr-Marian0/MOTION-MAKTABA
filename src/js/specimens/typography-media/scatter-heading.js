/** Scatter Heading: letters rise in, scatter like loose type on hover and spring back into the line. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Loose Type',
  element: 'Heading',
  trigger: ['In view', 'Hover'],
  behavior: ['Hover-dependent', 'Randomized', 'Staggered', 'Reversible'],
  effect: ['Rising', 'Scattering', 'Reassembly', 'Rotating'],
  purpose: ['Delight', 'Branding'],
  properties: ['Position', 'Rotation', 'Typography'],
  description: 'A headline set in loose metal type. It rises in letter by letter when it comes into view. Hover and the letters scatter across the page; move away and they spring back into line.',
  params: [
    { key: 'text', label: 'Headline', group: 'Content', type: 'text', default: 'Loose type' },
    { key: 'scatter', label: 'Scatter', group: 'Motion', type: 'range', min: 0, max: 3, step: 0.1, unit: '×', default: 1.4, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-loose">
        <h4 class="sp-loose__h" aria-label="${esc(p.text)}">${[...String(p.text)].map((c) => `<span class="sp-loose__ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</h4>
        <p class="sp-note">Hover the headline</p>
      </div>`);
    const h = k.$('.sp-loose__h');
    const chars = k.$$('.sp-loose__ch');
    const r = gsap.utils.random;

    k.inView(h, () => !reducedMotion && gsap.fromTo(chars, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.04 }));
    k.on(h, 'pointerenter', () => {
      if (reducedMotion) return;
      const s = Number(p.scatter);
      gsap.to(chars, { x: () => r(-60, 60) * s, y: () => r(-50, 50) * s, rotation: () => r(-50, 50) * s, duration: 0.6, ease: 'power3.out', stagger: 0.015, overwrite: true });
    });
    k.on(h, 'pointerleave', () =>
      gsap.to(chars, { x: 0, y: 0, rotation: 0, duration: reducedMotion ? 0 : 1, ease: 'elastic.out(1, 0.5)', stagger: 0.02, overwrite: true }));

    return () => k.destroy();
  },
};
