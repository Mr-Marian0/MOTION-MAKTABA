/** Pour Accordion: opening a section pours its answer in like molten wax: the panel fills with a sloshing glowing liquid that goes still and sets, then the text is pressed in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Pour Accordion',
  element: 'Accordion',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Selection-dependent', 'Sequential', 'Time-driven'],
  effect: ['Solidification', 'Liquid-morphing', 'Damped-oscillation'],
  purpose: ['Storytelling', 'Delight', 'Hierarchy'],
  properties: ['Shape', 'Path', 'Color', 'Size'],
  description: 'An accordion whose answers are cast. Open a section and a stream of glowing wax pours into the empty panel, its surface sloshing as it rises; the surface goes still, the glow cools to a solid colour, and the answer is pressed into it. Closing drains it.',
  params: [
    { key: 'pour', label: 'Pour time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    { key: 'cool', label: 'Cooling time', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Wax'),
  ],
};

const QA = [
  ['What is a cast panel?', 'A section whose content sets in place, so it feels made rather than shown.'],
  ['Does it work without motion?', 'Yes: with reduced motion the answer simply appears.'],
  ['Can I change the colour?', 'Pick any swatch: the wax cools to that colour.'],
];
const HOT = [242, 160, 60];
const rgb = (hex) => (hex.trim().match(/[0-9a-f]{2}/gi) || ['a0', '7a', '52']).map((h) => parseInt(h, 16));

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-pou">
        <div class="sp-pou__list">
          ${QA.map(([q, a]) => `
            <section class="sp-pou__item">
              <button type="button" class="sp-pou__q" aria-expanded="false">${q}<i>+</i></button>
              <div class="sp-pou__a"><i class="sp-pou__stream"></i><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path /></svg><p>${a}</p></div>
            </section>`).join('')}
        </div>
      </div>`);
    const qs = k.$$('.sp-pou__q');
    const as = k.$$('.sp-pou__a');
    const state = as.map(() => k.track({ level: 0, wave: 0, phase: 0, heat: 1 }));
    const tls = [];

    let cold = rgb('#a07a52'); // the set colour, read once per pour (not every frame)
    const draw = (i) => {
      const s = state[i];
      const c = HOT.map((h, j) => Math.round(cold[j] + (h - cold[j]) * s.heat));
      const top = 100 - s.level * 100;
      const pts = Array.from({ length: 21 }, (_, j) => `${j * 5} ${(top + Math.sin(j / 2 + s.phase) * s.wave * 8).toFixed(1)}`);
      const path = as[i].querySelector('path');
      path.setAttribute('d', s.level ? `M0 100 L${pts.join(' L')} L100 100 Z` : '');
      path.style.fill = `rgb(${c.join(',')})`;
    };

    const set = (i, open) => {
      qs[i].setAttribute('aria-expanded', String(open));
      gsap.to(qs[i].querySelector('i'), { rotation: open ? 45 : 0, duration: 0.3 });
      tls[i]?.kill();
      const s = state[i];
      const text = as[i].querySelector('p');
      const stream = as[i].querySelector('.sp-pou__stream');
      const full = as[i].scrollHeight;
      cold = rgb(getComputedStyle(stage).getPropertyValue('--sp-accent'));
      const up = () => draw(i);
      if (!open) {
        tls[i] = gsap.timeline().to(as[i], { height: 0, duration: 0.35, ease: 'power3.in' }).add(() => { Object.assign(s, { level: 0, heat: 1 }); up(); });
        return;
      }
      if (reducedMotion) {
        Object.assign(s, { level: 1, wave: 0, heat: 0 });
        up();
        gsap.set(as[i], { height: full });
        return gsap.set(text, { autoAlpha: 1 });
      }
      gsap.set(text, { autoAlpha: 0 });
      Object.assign(s, { level: 0, wave: 0, phase: 0, heat: 1 });
      tls[i] = gsap.timeline({ onUpdate: up })
        // The empty mould opens, then the stream pours and the level rises, sloshing…
        .to(as[i], { height: full, duration: 0.3, ease: 'power2.out' })
        .fromTo(stream, { scaleY: 0, autoAlpha: 1 }, { scaleY: 1, duration: 0.15 })
        .to(s, { level: 1, duration: p.pour, ease: 'power1.inOut' })
        .to(s, { wave: 1, duration: p.pour * 0.4 }, '<')
        .to(s, { phase: 12, duration: p.pour + p.cool, ease: 'none' }, '<')
        .to(stream, { autoAlpha: 0, duration: 0.15 }, `<${p.pour - 0.1}`)
        // …then goes still and cools, and the answer is pressed in.
        .to(s, { wave: 0, duration: p.cool * 0.7, ease: 'power2.out' }, '<')
        .to(s, { heat: 0, duration: p.cool, ease: 'power1.in' }, '<')
        .fromTo(text, { autoAlpha: 0, scale: 1.15 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'power3.in' }, '-=0.2');
    };
    qs.forEach((q, i) => k.on(q, 'click', () => {
      const open = q.getAttribute('aria-expanded') !== 'true';
      qs.forEach((other, j) => j !== i && other.getAttribute('aria-expanded') === 'true' && set(j, false));
      set(i, open);
    }));
    gsap.set(as, { height: 0 });

    return () => { tls.forEach((t) => t?.kill()); k.destroy(); };
  },
};
