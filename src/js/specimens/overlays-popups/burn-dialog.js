/** Burn Dialog: "Burn after reading": confirming sets the dialog alight from the bottom: a ragged, flickering burn line eats up through the paper with a glowing edge, and embers float away. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Burn Dialog',
  element: 'Dialog',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Procedural', 'Randomized'],
  effect: ['Fire-motion', 'Disintegration', 'Rising'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Clip & mask', 'Color', 'Opacity'],
  description: 'A "burn after reading" dialog. Press Burn and the paper catches from the bottom edge: a ragged, flickering burn line climbs up through it, the edge glowing orange and charring, while embers drift up and fade, until nothing is left. The same burn line is regenerated every frame, so it never looks the same twice.',
  params: [
    { key: 'time', label: 'Burn time', group: 'Motion', type: 'range', min: 0.8, max: 4, step: 0.2, unit: 's', default: 2, live: true },
    { key: 'ragged', label: 'Raggedness', group: 'Shape', type: 'range', min: 1, max: 12, step: 1, unit: '%', default: 6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Seal'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-brn', `
      <div class="sp-brn__hold" role="dialog" aria-label="Secret note">
        <div class="sp-ov__card sp-brn__paper"><span class="sp-ov__kick">For your eyes only</span><b class="sp-ov__title">The surprise is Friday</b><span class="sp-ov__text">Don’t tell Mei. This note burns after reading.</span><span class="sp-ov__actions"><button type="button" class="sp-ov__btn sp-brn__burn">Burn</button></span></div>
        <svg class="sp-brn__glow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline /></svg>
        <div class="sp-brn__embers" aria-hidden="true"></div>
      </div>`, { label: 'Open note', title: 'Messages' }));
    const hold = k.$('.sp-brn__hold');
    const paper = k.$('.sp-brn__paper');
    const glow = k.$('.sp-brn__glow polyline');
    const embers = k.$('.sp-brn__embers');
    const s = k.track({ level: 0, t: 0 }); // level 0 = whole, 1 = burnt away
    gsap.set(hold, { autoAlpha: 0 });
    // The burn line: height rises with level, ragged by layered sines that shift with time (flicker)
    const edge = () => Array.from({ length: 26 }, (_, i) => {
      const x = i * 4;
      const n = Math.sin(x * 0.35 + s.t * 9) + Math.sin(x * 0.9 - s.t * 13) * 0.6 + Math.sin(x * 2.1 + s.t * 5) * 0.3;
      return [x, 100 - s.level * 112 + n * p.ragged];
    });
    const draw = () => {
      const e = edge();
      paper.style.clipPath = `polygon(0 0, 100% 0, ${e.slice().reverse().map(([x, y]) => `${x}% ${y.toFixed(1)}%`).join(', ')})`;
      glow.setAttribute('points', e.map(([x, y]) => `${x},${y.toFixed(1)}`).join(' '));
      if (Math.random() < 0.3 && s.level > 0 && s.level < 1) {
        const [x, y] = e[Math.floor(Math.random() * e.length)];
        const em = document.createElement('i');
        em.style.left = `${x}%`;
        em.style.top = `${y}%`;
        embers.append(em);
        gsap.to(em, { y: '-4em', x: `${(Math.random() - 0.5) * 2}em`, autoAlpha: 0, duration: 1 + Math.random(), ease: 'power1.out', onComplete: () => em.remove() });
      }
    };
    const ui = toggle(k, gsap, { reducedMotion }, (open) => {
      s.level = 0;
      paper.style.clipPath = '';
      glow.setAttribute('points', '');
      return gsap.timeline().to(hold, { autoAlpha: open ? 1 : 0, scale: open ? 1 : 0.96, duration: 0.3 });
    }, ['Open note', 'Close']);
    k.on(k.$('.sp-brn__burn'), 'click', () => {
      if (reducedMotion) return ui.set(false);
      gsap.timeline()
        .to(s, { level: 1, t: p.time, duration: p.time, ease: 'power1.in', onUpdate: draw })
        .add(() => ui.set(false), '+=0.3');
    });
    return () => k.destroy();
  },
};
