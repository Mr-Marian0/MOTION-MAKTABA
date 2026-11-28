/** Wax Tip: the tooltip pours out above the term as a blob of hot, glowing wax that spreads and wobbles, then cools and sets into a solid tooltip, its words pressed in last. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { page, onHover } from './_ov.js';

export const meta = {
  title: 'Wax Tip',
  element: 'Tooltip',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Sequential', 'Time-driven'],
  effect: ['Solidification', 'Liquid-morphing', 'Wobbling'],
  purpose: ['Delight', 'Affordance', 'Hierarchy'],
  properties: ['Shape', 'Color', 'Radius', 'Scale'],
  description: 'A tooltip cast in wax. Hover the term and a blob of hot, glowing wax wells up above it and spreads out, its edges still soft and wobbling; then it cools, the glow fading to a solid colour as its shape firms into a crisp tooltip, and the words are pressed in last. Leaving melts it away.',
  params: [
    { key: 'cool', label: 'Cooling time', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Wax (cool)'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('wax');
    k.html(`
      <div class="sp sp-ov sp-wax">
        ${page('Glossary', 'Craft terms')}
        <span class="sp-ov__anchor sp-wax__term" tabindex="0" aria-describedby="${id}">sealing wax</span>
        <span class="sp-ov__tip sp-wax__tip" id="${id}" role="tooltip"><span class="sp-wax__words">Melted onto a fold to seal a letter.</span></span>
      </div>`);
    const term = k.$('.sp-wax__term');
    const tip = k.$('.sp-wax__tip');
    const words = k.$('.sp-wax__words');
    const cold = () => getComputedStyle(stage).getPropertyValue('--sp-accent').trim() || '#3e2c1f';
    gsap.set(tip, { autoAlpha: 0, transformOrigin: '50% 100%' });
    let tl;
    onHover(k, term, (on) => {
      tl?.kill();
      if (reducedMotion) return gsap.set([tip, words], { autoAlpha: on ? 1 : 0, backgroundColor: cold() });
      tl = on
        ? gsap.timeline()
            .set(words, { autoAlpha: 0, scale: 1.2 })
            // Hot and liquid: wells up glowing, spreads, wobbles
            .fromTo(tip, { autoAlpha: 1, scaleX: 0.15, scaleY: 0.3, backgroundColor: '#f2a541', borderRadius: '50%', boxShadow: '0 0 1.2em #f2a541' },
              { scaleX: 1.1, scaleY: 0.85, borderRadius: '45% 55% 40% 60% / 60% 50% 50% 40%', duration: 0.35, ease: 'power2.out' })
            .to(tip, { scaleX: 1, scaleY: 1, duration: 0.7, ease: 'elastic.out(1, 0.35)' })
            // Cooling: the glow fades to the set colour and the shape firms up
            .to(tip, { backgroundColor: cold(), boxShadow: '0 0 0em rgba(242,165,65,0)', borderRadius: '0.35em', duration: p.cool, ease: 'power1.in' }, '<0.1')
            .to(words, { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power3.in' }, '-=0.15')
        : gsap.timeline().to(tip, { scaleY: 0, scaleX: 1.2, borderRadius: '50%', backgroundColor: '#f2a541', autoAlpha: 0, duration: 0.35, ease: 'power2.in' });
    });
    return () => { tl?.kill(); k.destroy(); };
  },
};
