/** Melt Heading: the headline melts in the heat: letters soften, sag and stretch downward one after another with drips running off them; cool it and they firm back up into crisp type. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { letters } from './_tm.js';

export const meta = {
  title: 'Melt Heading',
  element: 'Heading',
  trigger: ['Hover', 'Focus', 'Click'],
  behavior: ['Hover-dependent', 'Staggered', 'Reversible'],
  effect: ['Melting', 'Liquefaction', 'Elongation'],
  purpose: ['Delight', 'Branding', 'Storytelling'],
  properties: ['Scale', 'Position', 'Typography'],
  description: 'A summer-sale headline that cannot take the heat. Point at it (or focus it) and the letters melt one by one: each sags, stretching downward from its top while it squashes thinner, and a drip runs off its foot. Move away and the type cools and firms back up, letters snapping back to their crisp shapes.',
  params: [
    { key: 'text', label: 'Headline', group: 'Content', type: 'text', default: 'Heatwave' },
    { key: 'sag', label: 'Sag', group: 'Motion', type: 'range', min: 1.1, max: 2.2, step: 0.05, unit: '×', default: 1.6, live: true },
    tone('#f2701d', 'tone', '--sp-accent', 'Molten'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-mlt">
        <h4 class="sp-tm__h sp-mlt__h" tabindex="0" aria-label="${esc(p.text)}">${letters(p.text, 'sp-tm__c sp-mlt__c')}</h4>
        <p class="sp-note">Hover the heading</p>
      </div>`);
    const h = k.$('.sp-mlt__h');
    const cs = k.$$('.sp-mlt__c');
    cs.forEach((c) => c.insertAdjacentHTML('beforeend', '<i class="sp-mlt__drip"></i>'));
    const drips = k.$$('.sp-mlt__drip');
    gsap.set(cs, { transformOrigin: '50% 0%' });
    gsap.set(drips, { scaleY: 0, transformOrigin: '50% 0%' });
    const melt = (on) => {
      const d = reducedMotion ? 0 : 1;
      gsap.to(cs, on
        ? { scaleY: () => p.sag * (0.85 + Math.random() * 0.3), scaleX: 0.9, color: getComputedStyle(h).getPropertyValue('--sp-accent').trim() || '#f2701d', duration: 1.1 * d, ease: 'power2.in', stagger: { each: 0.06 * d, from: 'random' }, overwrite: true }
        : { scaleY: 1, scaleX: 1, color: '#111111', duration: 0.5 * d, ease: 'back.out(3)', stagger: { each: 0.03 * d, from: 'start' }, overwrite: true });
      gsap.to(drips, on
        ? { scaleY: () => 0.4 + Math.random(), duration: 1.4 * d, delay: 0.5 * d, ease: 'power1.in', stagger: { each: 0.08 * d, from: 'random' }, overwrite: true }
        : { scaleY: 0, duration: 0.3 * d, overwrite: true });
    };
    ['pointerenter', 'focus'].forEach((ev) => k.on(h, ev, () => melt(true)));
    ['pointerleave', 'blur'].forEach((ev) => k.on(h, ev, () => melt(false)));
    return () => k.destroy();
  },
};
