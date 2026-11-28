/** Drift Lightbox: a slideshow lightbox where each photo slowly drifts and zooms across the frame (a pan-and-zoom), then cross-fades into the next drifting a different way. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Drift Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard', 'Idle'],
  behavior: ['Auto-advancing', 'Time-driven', 'Looping', 'Randomized'],
  effect: ['Drifting', 'Scaling', 'Dissolving'],
  purpose: ['Storytelling', 'Decoration', 'Focus'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A slideshow lightbox that never stands still. Each photo drifts slowly across the frame while zooming in a little, like a camera pan, then dissolves into the next one, which drifts off in a different direction. Clicking the photo skips ahead.',
  params: [
    { key: 'hold', label: 'Time per photo', group: 'Behavior', type: 'range', min: 2, max: 10, step: 0.5, unit: 's', default: 4 },
    { key: 'drift', label: 'Drift', group: 'Motion', type: 'range', min: 2, max: 15, step: 1, unit: '%', default: 8 },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

const HUES = [0, 35, 190, 290];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-dft', `<button type="button" class="sp-ov__light sp-dft__light" aria-label="Next photo">${HUES.map((h) => `<i class="sp-ov__photo sp-dft__img" style="filter:hue-rotate(${h}deg)"></i>`).join('')}</button>`, { label: 'Slideshow', title: 'Trip album', kick: 'Photos' }));
    const light = k.$('.sp-dft__light');
    const imgs = k.$$('.sp-dft__img');
    gsap.set(light, { autoAlpha: 0 });
    gsap.set(imgs, { autoAlpha: 0 });
    let i = 0;
    let show;
    // One photo: fade in, drift and zoom for `hold` seconds in a random direction, fade out into the next.
    const play = () => {
      show?.kill();
      const img = imgs[i % imgs.length];
      const a = Math.random() * Math.PI * 2;
      const [dx, dy] = [Math.cos(a) * p.drift, Math.sin(a) * p.drift];
      gsap.set(img, { zIndex: ++i });
      if (reducedMotion) return gsap.set(imgs, { autoAlpha: (j) => +(j === (i - 1) % imgs.length) });
      show = gsap.timeline({ onComplete: play })
        .fromTo(img, { autoAlpha: 0, xPercent: -dx / 2, yPercent: -dy / 2, scale: 1.12 }, { autoAlpha: 1, duration: 0.8 })
        .to(img, { xPercent: dx / 2, yPercent: dy / 2, scale: 1.22, duration: p.hold, ease: 'none' }, 0)
        .to(img, { autoAlpha: 0, duration: 0.8 }, p.hold - 0.4);
    };
    k.on(light, 'click', play);
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (!open) show?.kill();
      else play();
      return gsap.timeline().to(light, { autoAlpha: open ? 1 : 0, scale: open ? 1 : 0.95, duration: 0.35 });
    }, ['Slideshow', 'Close']);
    return () => { show?.kill(); k.destroy(); };
  },
};
