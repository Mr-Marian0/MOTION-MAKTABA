/** Ink Blob Loader: drops of ink orbit and melt into each other (an SVG goo filter). */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ink Blob Loader',
  element: 'Loader',
  trigger: ['Load'],
  behavior: ['Looping', 'Continuous', 'Load-dependent', 'Staggered'],
  effect: ['Metaball-morphing', 'Orbiting', 'Pulsating'],
  purpose: ['Progress', 'Delight', 'Branding'],
  properties: ['Position', 'Shape', 'Scale'],
  description: 'A loader made of ink drops that orbit a centre drop and melt into it as they pass, like metaballs, thanks to a blur-and-threshold "goo" filter. It loops for as long as something is loading.',
  params: [
    { key: 'count', label: 'Drops', group: 'Content', type: 'range', min: 2, max: 6, step: 1, default: 4 },
    { key: 'speed', label: 'Orbit time', group: 'Motion', type: 'range', min: 0.6, max: 4, step: 0.1, unit: 's', default: 1.8, live: true },
    { key: 'goo', label: 'Gooeyness', group: 'Shape', type: 'range', min: 2, max: 10, step: 0.5, default: 6 },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('goo');
    const n = Number(p.count);
    k.html(`
      <div class="sp sp-goo">
        <svg class="sp-goo__svg" viewBox="-60 -60 120 120" role="img" aria-label="Loading">
          <defs><filter id="${id}"><feGaussianBlur stdDeviation="${p.goo}"/><feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter></defs>
          <g filter="url(#${id})" class="sp-goo__ink">
            <circle class="sp-goo__core" r="14"/>
            ${Array.from({ length: n }, () => '<g class="sp-goo__arm"><circle class="sp-goo__drop" cx="38" r="9"/></g>').join('')}
          </g>
        </svg>
        <p class="sp-goo__label">Loading the archive…</p>
      </div>`);
    const arms = k.$$('.sp-goo__arm');
    const drops = k.$$('.sp-goo__drop');
    gsap.set(arms, { rotation: (i) => (360 / n) * i, svgOrigin: '0 0' });

    let spin = null;
    const start = () => {
      spin?.kill();
      if (reducedMotion) return;
      spin = gsap.timeline({ repeat: -1 })
        .to(arms, { rotation: '+=360', svgOrigin: '0 0', duration: Number(p.speed), ease: 'power1.inOut', stagger: { each: Number(p.speed) / n / 3 } }, 0)
        // Drops swing in to the core and out again, so they merge and split.
        .to(drops, {
          keyframes: [{ attr: { cx: 14 }, duration: Number(p.speed) / 2 }, { attr: { cx: 38 }, duration: Number(p.speed) / 2 }],
          ease: 'sine.inOut', stagger: { each: Number(p.speed) / n / 3 },
        }, 0);
      gsap.to(k.$('.sp-goo__core'), { attr: { r: 17 }, duration: Number(p.speed) / 2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    };
    start();

    return { destroy: () => (spin?.kill(), k.destroy()), update: start };
  },
};
