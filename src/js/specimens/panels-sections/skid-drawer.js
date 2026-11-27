/** Skid Drawer: the side drawer comes in too fast, skids to a stop with its corner dug in (leaving skid marks), and rocks back level. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Skid Drawer',
  element: 'Drawer',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Momentum-driven', 'Friction-responsive', 'Reversible'],
  effect: ['Skidding', 'Sliding', 'Wobbling', 'Motion-smear'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A cart drawer that arrives in a hurry. It shoots in from the right, brakes hard with its leading corner dug in and tilted, leaving a pair of skid marks that fade, then rocks back level. Closing it pulls away just as fast.',
  params: [
    { key: 'speed', label: 'Speed', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.3, live: true },
    { key: 'tilt', label: 'Skid tilt', group: 'Motion', type: 'range', min: 0, max: 10, step: 1, unit: '°', default: 5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Drawer'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-skd">
        <div class="sp-pn__page"><span class="sp-pn__kick">Shop</span><b class="sp-pn__h">Fast paper</b>${bars(6)}</div>
        <i class="sp-skd__marks"><i></i><i></i></i>
        <aside class="sp-skd__drawer" inert>
          <span class="sp-pn__kick">Cart · 2</span>
          <b class="sp-skd__title">Ready to go</b>
          ${bars(3)}
          <span class="sp-pn__btn sp-skd__go">Checkout</span>
        </aside>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-skd__btn" aria-expanded="false">Cart</button>
      </div>`);
    const drawer = k.$('.sp-skd__drawer');
    const marks = k.$('.sp-skd__marks');
    const btn = k.$('.sp-skd__btn');
    gsap.set(drawer, { xPercent: 120, transformOrigin: '0% 100%' });
    gsap.set(marks, { autoAlpha: 0 });
    let tl;

    k.on(btn, 'click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      drawer.inert = !open;
      tl?.kill();
      if (reducedMotion) return gsap.set(drawer, { xPercent: open ? 0 : 120, rotation: 0 });
      tl = gsap.timeline();
      if (open) {
        tl.fromTo(drawer, { xPercent: 120, rotation: 0, skewX: -8 }, { xPercent: -6, skewX: 0, rotation: -p.tilt, duration: p.speed, ease: 'power2.out' })
          // Braking: the dug-in corner leaves marks behind it
          .fromTo(marks, { autoAlpha: 0.9, scaleX: 0 }, { scaleX: 1, duration: p.speed * 1.2, ease: 'power3.out' }, '<0.05')
          .to(drawer, { xPercent: 0, duration: p.speed * 1.4, ease: 'power3.out' }, '<0.1')
          .to(drawer, { rotation: p.tilt * 0.35, duration: 0.25, ease: 'power2.out' }, `<${p.speed * 0.6}`)
          .to(drawer, { rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
          .to(marks, { autoAlpha: 0, duration: 1 }, '<');
      } else {
        tl.to(drawer, { rotation: p.tilt * 0.4, duration: 0.12 }).to(drawer, { xPercent: 120, rotation: 0, skewX: 8, duration: p.speed, ease: 'power3.in' });
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
