/** Rocket Footer: the footer's back-to-top rocket fires up: it rumbles, its flame grows and it's propelled up off the page trailing exhaust as the page scrolls home. A fresh one drops back onto the pad. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Rocket Footer',
  element: 'Footer',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Event-driven', 'Sequential', 'Physics-driven'],
  effect: ['Propelling', 'Accelerating', 'Vibrating', 'Particle-trail'],
  purpose: ['Navigation', 'Delight', 'Branding'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A footer whose "back to top" is a little rocket on a launch pad. Hover and its flame flickers; click and it rumbles, the flame roars, and it is propelled straight up off the page, speeding up and puffing exhaust, while the page scrolls back to the top. A new rocket drops onto the pad.',
  params: [
    { key: 'thrust', label: 'Thrust time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    { key: 'rumble', label: 'Rumble', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.1, unit: '', default: 0.6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Rocket'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-rkt">
        <div class="sp-pn__page sp-rkt__page"><span class="sp-pn__kick">Long read · end</span><b class="sp-pn__h">Thanks for reading</b>${bars(10)}</div>
        <footer class="sp-rkt__foot"><span>Maktaba · © 2026</span><span class="sp-rkt__pad"></span><span>Privacy · Terms</span></footer>
        <div class="sp-rkt__puffs" aria-hidden="true"></div>
        <button type="button" class="sp-rkt__rocket" aria-label="Back to top">
          <i class="sp-rkt__flame"></i><i class="sp-rkt__body"></i>
        </button>
      </div>`);
    const rocket = k.$('.sp-rkt__rocket');
    const flame = k.$('.sp-rkt__flame');
    const puffs = k.$('.sp-rkt__puffs');
    const page = k.$('.sp-rkt__page');
    gsap.set(flame, { scaleY: 0.2, transformOrigin: '50% 0%' });
    gsap.set(page, { y: '-6em' });
    let tl;

    const puff = (delay) => {
      const el = document.createElement('i');
      puffs.append(el);
      gsap.fromTo(el, { y: 0, scale: 0.4, autoAlpha: 0.8 }, { y: '2em', x: `${(Math.random() - 0.5) * 3}em`, scale: 2, autoAlpha: 0, duration: 0.9, delay, ease: 'power1.out', onComplete: () => el.remove() });
    };
    k.on(rocket, 'pointerenter', () => !tl?.isActive() && gsap.to(flame, { scaleY: 0.5, duration: 0.2, repeat: 3, yoyo: true }));
    k.on(rocket, 'click', () => {
      if (tl?.isActive()) return;
      if (reducedMotion) return gsap.set(page, { y: '1em' });
      const rumble = Array.from({ length: 8 }, (_, i) => (i % 2 ? 1 : -1) * 2 * p.rumble);
      tl = gsap.timeline()
        // Ignition: rumble, flame grows
        .to(rocket, { keyframes: { x: [...rumble, 0] }, duration: 0.45, ease: 'none' })
        .to(flame, { scaleY: 1.4, duration: 0.45, ease: 'power2.in' }, '<')
        .add(() => [0, 0.1, 0.2, 0.3].forEach(puff), '<0.2')
        // Lift-off: propelled up, faster and faster, puffing exhaust
        .to(rocket, { y: '-26em', duration: p.thrust, ease: 'power3.in' })
        .add(() => [0, 0.12, 0.24].forEach(puff), '<')
        .to(page, { y: '1em', duration: p.thrust * 1.2, ease: 'power3.inOut' }, '<0.15')
        // A fresh rocket drops back onto the pad
        .set(rocket, { y: '-10em' })
        .set(flame, { scaleY: 0.2 })
        .to(rocket, { y: 0, duration: 0.6, ease: 'bounce.out' }, '+=0.3')
        .to(page, { y: '-6em', duration: 1.2, ease: 'power1.inOut' }, '+=0.8');
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
