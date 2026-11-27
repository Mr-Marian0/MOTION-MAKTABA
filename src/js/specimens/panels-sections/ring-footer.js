/** Ring Footer: "Back to top" punches a hole through the footer, so for a moment it is a ring; an arrow shoots up through the hole, then it closes. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ring Footer',
  element: 'Footer',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Event-driven', 'Sequential', 'Reversible'],
  effect: ['Topology-morphing', 'Launching', 'Expansion'],
  purpose: ['Navigation', 'Wayfinding', 'Delight'],
  properties: ['Shape', 'Clip & mask', 'Position'],
  description: 'A footer whose "Back to top" button changes its topology: a hole opens right through the footer, turning the solid band into a ring, an arrow shoots up through it as the page scrolls back to the top, and the hole seals shut. Hovering the button dents a small dimple first.',
  params: [
    { key: 'hole', label: 'Hole size', group: 'Shape', type: 'range', min: 1.5, max: 4, step: 0.25, unit: 'em', default: 2.6, live: true },
    { key: 'speed', label: 'Speed', group: 'Motion', type: 'range', min: 0.5, max: 2, step: 0.1, unit: '×', default: 1, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Footer'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-rng">
        <div class="sp-pn__page sp-rng__page"><span class="sp-pn__kick">Journal · page 4</span><b class="sp-pn__h">Notes on paper</b>${bars(9)}</div>
        <footer class="sp-rng__foot">
          <div class="sp-rng__band">
            <div class="sp-rng__col"><b>Maktaba</b><span>Motion, on paper.</span></div>
            <div class="sp-rng__col sp-rng__col--r"><span>About</span><span>Contact</span><span>© 2026</span></div>
          </div>
          <i class="sp-rng__rim"></i>
          <button type="button" class="sp-rng__top" aria-label="Back to top">↑</button>
        </footer>
      </div>`);
    const band = k.$('.sp-rng__band');
    const rim = k.$('.sp-rng__rim');
    const top = k.$('.sp-rng__top');
    const page = k.$('.sp-rng__page');
    const d = (t) => (reducedMotion ? 0 : t / p.speed);
    gsap.set(band, { '--r': '0em' });
    gsap.set(rim, { scale: 0, autoAlpha: 0 });
    gsap.set(page, { y: '-5em' });
    let tl;
    const hole = (r, dur, ease) => gsap.timeline()
      .to(band, { '--r': `${r}em`, duration: dur, ease }, 0)
      .to(rim, { scale: r / p.hole, autoAlpha: r ? 1 : 0, width: `${p.hole * 2}em`, height: `${p.hole * 2}em`, duration: dur, ease }, 0);

    k.on(top, 'pointerenter', () => !tl?.isActive() && hole(0.6, d(0.3), 'back.out(3)'));
    k.on(top, 'pointerleave', () => !tl?.isActive() && hole(0, d(0.3), 'power2.out'));
    k.on(top, 'click', () => {
      if (tl?.isActive()) return;
      tl = gsap.timeline()
        // The footer becomes a ring…
        .add(hole(p.hole, d(0.4), 'back.out(2)'))
        // …the arrow shoots up through it and the page scrolls home…
        .to(top, { y: '-14em', scale: 0.7, duration: d(0.5), ease: 'power3.in' })
        .to(page, { y: '1em', duration: d(0.7), ease: 'power3.out' }, '<0.2')
        // …and the hole seals.
        .add(hole(0, d(0.35), 'power2.in'), '<0.1')
        .set(top, { y: 0, scale: 0 })
        .to(top, { scale: 1, duration: d(0.4), ease: 'back.out(3)' })
        .to(page, { y: '-5em', duration: d(1.2), ease: 'power1.inOut' }, '+=0.8');
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
