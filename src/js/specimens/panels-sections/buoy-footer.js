/** Buoy Footer: the footer's social links are buoys bobbing on a gently rolling waterline; each rides the swell as it passes. Pointing at one ducks it under and pops it back up. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Buoy Footer',
  element: 'Footer',
  trigger: ['Idle', 'Hover', 'Focus'],
  behavior: ['Continuous', 'Coordinated', 'Hover-dependent', 'Periodic'],
  effect: ['Bobbing', 'Traveling-wave', 'Swaying', 'Springing'],
  purpose: ['Decoration', 'Branding', 'Affordance'],
  properties: ['Position', 'Rotation', 'Path'],
  description: 'A footer whose top edge is a slow rolling waterline, with the social links floating on it as little buoys. Each buoy bobs and tilts as the swell passes under it, so they rise and fall in a travelling ripple. Point at one and it ducks under, then pops back up with a splash of bounce.',
  params: [
    { key: 'swell', label: 'Swell', group: 'Shape', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    { key: 'speed', label: 'Wave speed', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: '×', default: 0.6, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sea'),
  ],
};

const BUOYS = ['IG', 'YT', 'RSS', '@', 'GH'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-buo">
        <div class="sp-pn__page"><span class="sp-pn__kick">Harbour notes</span>${bars(4)}</div>
        <footer class="sp-buo__foot">
          <svg class="sp-buo__sea" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
          <div class="sp-buo__buoys">${BUOYS.map((b) => `<a href="#" class="sp-buo__buoy" aria-label="${b}"><span>${b}</span></a>`).join('')}</div>
          <p class="sp-buo__fine">© 2026 Harbour Paper Co.</p>
        </footer>
      </div>`);
    const path = k.$('.sp-buo__sea path');
    const buoys = k.$$('.sp-buo__buoy');
    const wrap = k.$('.sp-buo__buoys');
    k.on(wrap, 'click', (e) => e.preventDefault());
    const s = k.track({ phase: 0 });
    // Waterline height (in em above its rest line) at x (0–1) for the current phase.
    const wave = (x) => Math.sin(x * Math.PI * 3 - s.phase) * p.swell;
    // One em in the SVG's y units; measured on resize only, never per frame (no forced layout in the loop).
    let unit = 1;
    const measure = () => {
      unit = (parseFloat(getComputedStyle(wrap).fontSize) / (path.ownerSVGElement.getBoundingClientRect().height || 1)) * 20;
      draw();
    };
    const draw = () => {
      const pts = Array.from({ length: 31 }, (_, i) => `${(i / 30) * 100} ${(8 - wave(i / 30) * unit).toFixed(2)}`);
      path.setAttribute('d', `M0 20 L${pts.join(' L')} L100 20 Z`);
      buoys.forEach((b, i) => {
        const x = (i + 0.5) / buoys.length;
        gsap.set(b, { y: `${-wave(x)}em`, rotation: Math.cos(x * Math.PI * 3 - s.phase) * 10 });
      });
    };
    k.resize(wrap, measure);
    const roll = reducedMotion ? null : gsap.to(s, { phase: `+=${Math.PI * 2}`, duration: 4, ease: 'none', repeat: -1, onUpdate: draw });
    roll?.timeScale(p.speed);

    buoys.forEach((b) => {
      const span = b.querySelector('span');
      const duck = () => !reducedMotion && gsap.timeline().to(span, { y: '1.2em', duration: 0.15, ease: 'power2.in' }).to(span, { y: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.35)' });
      k.on(b, 'pointerenter', duck);
      k.on(b, 'focus', duck);
    });

    return { destroy: () => { roll?.kill(); k.destroy(); }, update: (key) => key === 'speed' ? roll?.timeScale(p.speed) : draw() };
  },
};
