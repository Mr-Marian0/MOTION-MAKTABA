/** Cast Widget: a stats widget cast like metal: molten liquid pours into the empty mould, sloshes, then goes still, cools from glowing orange to solid and the numbers are stamped in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Cast Widget',
  element: 'Widget',
  trigger: ['Click', 'In view', 'Keyboard'],
  behavior: ['Sequential', 'Scroll-triggered', 'Time-driven', 'Event-driven'],
  effect: ['Solidification', 'Liquid-morphing', 'Damped-oscillation', 'Shimmering'],
  purpose: ['Storytelling', 'Progress', 'Delight'],
  properties: ['Shape', 'Path', 'Color', 'Shadow'],
  description: 'A level-up widget cast like metal. Molten liquid pours into an empty mould and rises, its surface sloshing; then the surface goes still, the glow cools from orange to solid colour, a sheen runs across, and the level and points are stamped into the hardened face. Recast melts it down and pours again.',
  params: [
    { key: 'pour', label: 'Pour time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.2, unit: 's', default: 1.4, live: true },
    { key: 'cool', label: 'Cooling time', group: 'Motion', type: 'range', min: 0.4, max: 3, step: 0.2, unit: 's', default: 1.2, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Metal'),
  ],
};

const HOT = [242, 140, 40];
const rgb = (hex) => (hex.trim().match(/[0-9a-f]{2}/gi) || ['3e', '2c', '1f']).map((h) => parseInt(h, 16));

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-cst">
        <div class="sp-cst__mould">
          <i class="sp-cst__stream"></i>
          <svg class="sp-cst__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="sp-cst__metal" /></svg>
          <i class="sp-cst__sheen"></i>
          <div class="sp-cst__stamp" aria-live="polite"><span class="sp-cc__kick">Level</span><b>7</b><span>2,340 XP</span></div>
        </div>
        <button type="button" class="sp-cc__btn sp-cst__btn">Cast</button>
      </div>`);
    const mould = k.$('.sp-cst__mould');
    const metal = k.$('.sp-cst__metal');
    const stream = k.$('.sp-cst__stream');
    const sheen = k.$('.sp-cst__sheen');
    const stamp = k.$('.sp-cst__stamp');
    const btn = k.$('.sp-cst__btn');
    k.fit(mould, 0.7);
    const s = k.track({ level: 0, wave: 0, phase: 0, heat: 1 });
    let tl;

    let cold = rgb('#3e2c1f');
    const draw = () => {
      const c = HOT.map((h, i) => Math.round(cold[i] + (h - cold[i]) * s.heat));
      const top = 100 - s.level * 100;
      const pts = Array.from({ length: 21 }, (_, i) => {
        const x = i * 5;
        return `${x} ${(top + Math.sin(x / 9 + s.phase) * s.wave * 6 + Math.sin(x / 4 - s.phase * 1.7) * s.wave * 2).toFixed(2)}`;
      });
      metal.setAttribute('d', s.level ? `M0 100 L${pts.join(' L')} L100 100 Z` : '');
      metal.style.fill = `rgb(${c.join(',')})`;
      mould.style.setProperty('--glow', s.heat * Math.min(s.level * 3, 1));
    };
    draw();
    gsap.set([stamp, sheen, stream], { autoAlpha: 0 });

    const cast = () => {
      tl?.kill();
      cold = rgb(getComputedStyle(stage).getPropertyValue('--sp-accent')); // once per cast, not every frame
      Object.assign(s, { level: 0, wave: 0, phase: 0, heat: 1 });
      draw();
      gsap.set(stamp, { autoAlpha: 0 });
      btn.disabled = true;
      tl = gsap.timeline({ onUpdate: draw, onComplete: () => { btn.disabled = false; btn.textContent = 'Recast'; } })
        // Pour: the stream runs and the level rises, sloshing
        .fromTo(stream, { autoAlpha: 1, scaleY: 0 }, { scaleY: 1, duration: 0.25, ease: 'power2.in' })
        .to(s, { level: 1, duration: p.pour, ease: 'power1.inOut' })
        .to(s, { wave: 1, duration: p.pour * 0.4 }, '<')
        .to(s, { phase: 14, duration: p.pour + p.cool, ease: 'none' }, '<')
        .to(stream, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.2 }, `<${p.pour - 0.1}`)
        // Settle and cool: the surface goes still, the glow fades to solid colour
        .to(s, { wave: 0, duration: p.cool * 0.8, ease: 'power2.out' }, '<')
        .to(s, { heat: 0, duration: p.cool, ease: 'power1.in' }, '<0.1')
        .fromTo(sheen, { autoAlpha: 1, xPercent: -120 }, { xPercent: 320, duration: 0.7, ease: 'power2.inOut' })
        // Stamp
        .fromTo(stamp, { autoAlpha: 0, scale: 1.4 }, { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'power3.in' }, '<0.2')
        .to(mould, { keyframes: { y: [2, -1, 0] }, duration: 0.2 });
      if (reducedMotion) tl.progress(1);
    };

    k.inView(mould, () => !tl && cast());
    k.on(btn, 'click', cast);

    return () => { tl?.kill(); k.destroy(); };
  },
};
