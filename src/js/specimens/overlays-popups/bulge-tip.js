/** Bulge Tip: hover the underlined term and the tooltip swells out of the underline like a bubble pushing through paper, its walls bulging before they firm up. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Bulge Tip',
  element: 'Tooltip',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Elastic', 'Anchored'],
  effect: ['Bulging', 'Inflation', 'Springing'],
  purpose: ['Affordance', 'Hierarchy', 'Delight'],
  properties: ['Shape', 'Radius', 'Scale'],
  description: 'A glossary tooltip that bulges out of the text. Hover or focus the dotted term and a rounded swelling rises from its underline, sides bulging outward like a bubble about to burst, then firms into a crisp tooltip with its definition. Leave and it sinks back into the line.',
  params: [
    { key: 'bulge', label: 'Bulge', group: 'Shape', type: 'range', min: 0.05, max: 0.4, step: 0.05, unit: '×', default: 0.2, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.1, unit: 's', default: 0.6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Underline'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('bgt');
    k.html(`
      <div class="sp sp-ov sp-bgt">
        ${page('Glossary', 'Paper words')}
        <span class="sp-ov__anchor sp-bgt__term" tabindex="0" aria-describedby="${id}">deckle edge</span>
        <span class="sp-ov__tip sp-bgt__tip" id="${id}" role="tooltip">The rough, feathered edge of handmade paper.</span>
      </div>`);
    const term = k.$('.sp-bgt__term');
    const tip = k.$('.sp-bgt__tip');
    gsap.set(tip, { autoAlpha: 0, scale: 0, transformOrigin: '50% 100%' });
    let tl;
    const show = (on) => {
      tl?.kill();
      const t = reducedMotion ? 0 : p.time;
      const b = 1 + p.bulge;
      tl = on
        ? gsap.timeline()
            .set(tip, { autoAlpha: 1, borderRadius: '50% 50% 45% 45% / 70% 70% 30% 30%' })
            // Swelling up out of the line: wider than it should be, sides bulged…
            .fromTo(tip, { scaleX: 0.3, scaleY: 0 }, { scaleX: b, scaleY: 0.9, duration: t * 0.45, ease: 'power2.out' })
            // …then it firms up into the tooltip shape
            .to(tip, { scaleX: 1, scaleY: 1, borderRadius: '0.35em', duration: t, ease: 'elastic.out(1, 0.45)' })
        : gsap.timeline().to(tip, { scaleX: b, scaleY: 0, borderRadius: '50%', autoAlpha: 0, duration: t * 0.4, ease: 'power2.in' });
    };
    [['pointerenter', true], ['pointerleave', false], ['focus', true], ['blur', false]].forEach(([ev, on]) => k.on(term, ev, () => show(on)));
    return () => { tl?.kill(); k.destroy(); };
  },
};
