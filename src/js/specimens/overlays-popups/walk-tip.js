/** Walk Tip: the toolbar's tooltip walks. It stands on little legs above the tool you last pointed at; point at another tool and it strolls along the bar to it, label swapping on arrival. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Walk Tip',
  element: 'Tooltip',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Following', 'Position-aware', 'Interruptible'],
  effect: ['Locomotion', 'Walking', 'Bobbing'],
  purpose: ['Wayfinding', 'Delight', 'Affordance'],
  properties: ['Position', 'Rotation'],
  description: 'A toolbar whose tooltip gets around on foot. It stands on two little legs above the tool you last pointed at; point at another one and it walks along the bar to it, legs stepping and body bobbing, and its label changes when it arrives.',
  params: [
    { key: 'speed', label: 'Walking speed', group: 'Motion', type: 'range', min: 4, max: 30, step: 1, unit: 'em/s', default: 12, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Legs'),
  ],
};

const TOOLS = [['✎', 'Pencil'], ['▭', 'Frame'], ['◯', 'Shape'], ['T', 'Text'], ['⌫', 'Erase']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-wkt">
        ${page('Sketch 14', 'Canvas')}
        <div class="sp-wkt__bar">
          <div class="sp-wkt__walker" aria-hidden="true"><span class="sp-ov__tip sp-wkt__tip">Pencil</span><i class="sp-wkt__leg"></i><i class="sp-wkt__leg"></i></div>
          ${TOOLS.map(([g, n]) => `<button type="button" class="sp-wkt__tool" aria-label="${n}">${g}</button>`).join('')}
        </div>
      </div>`);
    const walker = k.$('.sp-wkt__walker');
    const tip = k.$('.sp-wkt__tip');
    const legs = k.$$('.sp-wkt__leg');
    const tools = k.$$('.sp-wkt__tool');
    const centre = (b) => b.offsetLeft + b.offsetWidth / 2;
    k.resize(walker.parentElement, () => gsap.set(walker, { x: centre(tools[cur]) }));
    let cur = 0;
    let walk;
    const step = gsap.timeline({ repeat: -1, paused: true, defaults: { duration: 0.14, ease: 'sine.inOut' } })
      .to(legs[0], { rotation: 25 }).to(legs[1], { rotation: -25 }, 0).to(tip, { y: -2 }, 0)
      .to(legs[0], { rotation: -25 }).to(legs[1], { rotation: 25 }, '<').to(tip, { y: 0 }, '<');

    tools.forEach((b, i) => {
      const go = () => {
        if (i === cur) return;
        cur = i;
        walk?.kill();
        const x = centre(b);
        const em = parseFloat(getComputedStyle(walker).fontSize);
        const dist = Math.abs(x - gsap.getProperty(walker, 'x'));
        if (reducedMotion) return gsap.set(walker, { x }), (tip.textContent = TOOLS[i][1]);
        step.play();
        walk = gsap.timeline()
          .to(walker, { x, duration: dist / (p.speed * em), ease: 'none' })
          .add(() => { step.pause(); gsap.to([...legs, tip], { rotation: 0, y: 0, duration: 0.1 }); tip.textContent = TOOLS[i][1]; })
          .fromTo(tip, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' });
      };
      k.on(b, 'pointerenter', go);
      k.on(b, 'focus', go);
    });
    return () => { step.kill(); walk?.kill(); k.destroy(); };
  },
};
