/** Pond Cover: hover the article card and its cover picture starts to flow like water; click to stir it harder. It settles still when you leave. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Pond Cover',
  element: 'Content card',
  trigger: ['Hover', 'Click', 'Focus'],
  behavior: ['Hover-dependent', 'Continuous', 'Procedural', 'Interruptible'],
  effect: ['Fluid-deformation', 'Water-motion', 'Swirl-motion'],
  purpose: ['Delight', 'Affordance', 'Decoration'],
  properties: ['Shape', 'Clip & mask'],
  description: 'An article card whose cover picture turns to water. Hover it and the scene starts to flow and swirl, warping slowly like a reflection on a pond; click to stir it up, then it calms back down. Leave and the picture settles perfectly still.',
  params: [
    { key: 'flow', label: 'Flow', group: 'Motion', type: 'range', min: 4, max: 40, step: 2, unit: 'px', default: 16, live: true },
    { key: 'speed', label: 'Speed', group: 'Motion', type: 'range', min: 0.3, max: 3, step: 0.1, unit: '×', default: 1, live: true },
    { key: 'swirl', label: 'Ripple size', group: 'Shape', type: 'range', min: 0.005, max: 0.04, step: 0.005, unit: '', default: 0.015, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('pond');
    k.html(`
      <div class="sp sp-cc sp-pond">
        <svg class="sp-pond__defs" aria-hidden="true"><filter id="${id}" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="2" seed="8" />
          <feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="B" />
        </filter></svg>
        <a class="sp-cc__card sp-pond__card" href="#" aria-label="Read: Still Water, Moving Light">
          <span class="sp-cc__img sp-pond__cover"><i class="sp-pond__scene"></i></span>
          <span class="sp-cc__kick">Essay · 6 min</span>
          <b class="sp-cc__title">Still Water, Moving Light</b>
          <span class="sp-cc__text">Notes from a week of sketching the same pond at dawn.</span>
        </a>
      </div>`);
    const card = k.$('.sp-pond__card');
    const scene = k.$('.sp-pond__scene');
    const turb = k.$('feTurbulence');
    const map = k.$('feDisplacementMap');
    k.fit(card, 0.86);
    const s = k.track({ amt: 0, f: 0 });
    let flow;

    const draw = () => {
      map.setAttribute('scale', s.amt.toFixed(2));
      const f = p.swirl * (1 + 0.35 * Math.sin(s.f));
      turb.setAttribute('baseFrequency', `${f.toFixed(4)} ${(f * 1.6).toFixed(4)}`);
      scene.style.filter = s.amt > 0.2 ? `url(#${id})` : '';
    };
    // The noise keeps changing while there is flow, which reads as moving water.
    const start = () => {
      if (reducedMotion) return;
      flow ??= gsap.to(s, { f: `+=${Math.PI * 2}`, duration: 6, ease: 'none', repeat: -1, onUpdate: draw });
      flow.timeScale(p.speed);
      gsap.to(s, { amt: p.flow, duration: 0.8, ease: 'power2.out', onUpdate: draw, overwrite: 'auto' });
    };
    const stop = () => gsap.to(s, { amt: 0, duration: 1.2, ease: 'power2.inOut', onUpdate: draw, overwrite: 'auto', onComplete: () => (flow?.kill(), (flow = null)) });

    k.on(card, 'pointerenter', start);
    k.on(card, 'focus', start);
    k.on(card, 'pointerleave', stop);
    k.on(card, 'blur', stop);
    k.on(card, 'click', (e) => {
      e.preventDefault();
      if (reducedMotion) return;
      start();
      gsap.timeline()
        .to(s, { amt: p.flow * 2.6, duration: 0.25, ease: 'power2.out', onUpdate: draw, overwrite: 'auto' })
        .to(s, { amt: p.flow, duration: 1.4, ease: 'elastic.out(1, 0.4)', onUpdate: draw });
      flow.timeScale(p.speed * 3);
      gsap.to(flow, { timeScale: p.speed, duration: 1.6, ease: 'power2.out' });
    });

    return () => { flow?.kill(); k.destroy(); };
  },
};
