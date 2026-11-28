/** Puzzle Lightbox: the photo opens as scattered tiles that fly in and reassemble into the picture, a little out of order; closing breaks it apart again. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Puzzle Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Randomized', 'Staggered', 'Reversible'],
  effect: ['Reassembly', 'Convergence', 'Spinning', 'Scattering'],
  purpose: ['Delight', 'Focus', 'Storytelling'],
  properties: ['Clip & mask', 'Position', 'Rotation'],
  description: 'A lightbox that pieces its photo together. Open it and the picture arrives as a scatter of tiles that spin in from all sides and click into place in a random order until the image is whole; close it and the tiles fly apart again.',
  params: [
    { key: 'cols', label: 'Tiles across', group: 'Shape', type: 'range', min: 3, max: 8, step: 1, unit: '', default: 5 },
    { key: 'time', label: 'Assembly time', group: 'Motion', type: 'range', min: 0.6, max: 2.5, step: 0.1, unit: 's', default: 1.3, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-pzl', `<div class="sp-ov__light sp-pzl__light" role="dialog" aria-label="Photo"><i class="sp-ov__photo sp-pzl__img sp-pzl__whole"></i><div class="sp-cc__pieces"></div></div>`, { label: 'View photo', title: 'Trip album', kick: 'Photos' }));
    const light = k.$('.sp-pzl__light');
    const host = k.$('.sp-cc__pieces');
    const whole = k.$('.sp-pzl__whole');
    const c = Math.round(p.cols);
    const tiles = pieces(host, '<i class="sp-ov__photo sp-pzl__img"></i>', grid(c, Math.round(c * 0.65))).map((b) => b.el);
    gsap.set([light, whole], { autoAlpha: 0 });
    // Once assembled, one whole photo stands in for the tiles: separate tiles always show hairline seams
    const settle = (done) => { gsap.set(whole, { autoAlpha: done ? 1 : 0 }); gsap.set(host, { autoAlpha: done ? 0 : 1 }); };
    const scatter = () => ({ x: () => `${(Math.random() - 0.5) * 30}em`, y: () => `${(Math.random() - 0.5) * 20}em`, rotation: () => (Math.random() - 0.5) * 360, autoAlpha: 0 });

    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline({ onComplete: () => settle(true) })
          .set(light, { autoAlpha: 1 })
          .call(settle, [false])
          .fromTo(tiles, scatter(), { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: p.time * 0.55, ease: 'back.out(1.4)', stagger: { each: (p.time * 0.45) / tiles.length, from: 'random' } })
      : gsap.timeline()
          .call(settle, [false])
          .to(tiles, { ...scatter(), duration: 0.6, ease: 'power2.in', stagger: { each: 0.01, from: 'random' } })
          .set(light, { autoAlpha: 0 }),
    ['View photo', 'Close']);
    return () => k.destroy();
  },
};
