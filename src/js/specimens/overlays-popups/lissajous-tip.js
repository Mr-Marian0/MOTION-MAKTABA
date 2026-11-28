/** Lissajous Tip: a firefly of light traces a looping Lissajous figure around the help icon to draw the eye; hover or focus and it dives into the icon and the tooltip opens. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { page, onHover } from './_ov.js';

export const meta = {
  title: 'Lissajous Tip',
  element: 'Tooltip',
  trigger: ['Idle', 'Hover', 'Focus'],
  behavior: ['Continuous', 'Hover-dependent', 'Periodic', 'Attracted'],
  effect: ['Lissajous-motion', 'Orbiting', 'Convergence'],
  purpose: ['Affordance', 'Focus', 'Delight'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A help icon with a firefly. While nobody looks, a glowing dot loops around the icon on a Lissajous figure (two sine waves at a 3:2 ratio), its pattern slowly turning. Hover or focus the icon and the firefly dives into it as the tooltip opens; leave and it flies out again.',
  params: [
    { key: 'ratio', label: 'Pattern', group: 'Shape', type: 'choice', options: ['3:2', '5:4', '1:2', '3:4'], default: '3:2', live: true },
    { key: 'size', label: 'Size', group: 'Shape', type: 'range', min: 1.5, max: 5, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'speed', label: 'Speed', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: '×', default: 0.6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Firefly'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('lsj');
    k.html(`
      <div class="sp sp-ov sp-lsj">
        ${page('Export settings', 'Files')}
        <button type="button" class="sp-lsj__icon" aria-describedby="${id}">?</button>
        <i class="sp-lsj__fly"></i>
        <span class="sp-ov__tip sp-lsj__tip" id="${id}" role="tooltip">Bleed adds 3 mm past the trim line.</span>
      </div>`);
    const fly = k.$('.sp-lsj__fly');
    const tip = k.$('.sp-lsj__tip');
    const s = k.track({ t: 0, r: 1 }); // r: how far out the firefly is (1 = on its figure, 0 = in the icon)
    gsap.set(tip, { autoAlpha: 0, y: '0.5em' });
    const draw = () => {
      const [a, b] = p.ratio.split(':').map(Number);
      gsap.set(fly, { x: `${Math.sin(a * s.t + s.t * 0.05) * p.size * s.r}em`, y: `${Math.sin(b * s.t) * p.size * 0.7 * s.r}em`, scale: 0.4 + s.r * 0.6 });
    };
    const loop = reducedMotion ? null : gsap.to(s, { t: `+=${Math.PI * 2}`, duration: 6, ease: 'none', repeat: -1, onUpdate: draw });
    loop?.timeScale(p.speed);
    draw();
    onHover(k, k.$('.sp-lsj__icon'), (on) => {
      gsap.to(s, { r: on ? 0 : 1, duration: reducedMotion ? 0 : 0.5, ease: on ? 'power3.in' : 'power2.out', onUpdate: draw, overwrite: 'auto' });
      gsap.to(tip, { autoAlpha: on ? 1 : 0, y: on ? 0 : '0.5em', duration: reducedMotion ? 0 : 0.3, delay: on && !reducedMotion ? 0.35 : 0, overwrite: 'auto' });
    });
    return { destroy: () => { loop?.kill(); k.destroy(); }, update: (key) => (key === 'speed' ? loop?.timeScale(p.speed) : draw()) };
  },
};
