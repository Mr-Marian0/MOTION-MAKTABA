/** Ticket Punch: topology changes on a ticket: one piece, then a piece with a hole, then two pieces. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Ticket Punch',
  element: 'Content card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'State-dependent', 'Event-driven', 'Reversible'],
  effect: ['Topology-morphing', 'Expansion', 'Splitting', 'Falling', 'Shaking'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Shape', 'Clip & mask', 'Position', 'Rotation'],
  description: 'An event ticket that changes its topology. Punch it: a hole opens in the stub and the punched-out disc falls. Tear it: the stub shakes along the perforation and comes away as a second piece. Then it mends for the next guest.',
  params: [
    { key: 'hole', label: 'Hole size', group: 'Shape', type: 'range', min: 0.6, max: 1.6, step: 0.1, unit: 'em', default: 1.1, live: true },
    { key: 'speed', label: 'Speed', group: 'Motion', type: 'range', min: 0.5, max: 2, step: 0.1, unit: '×', default: 1, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Stub color'),
  ],
};

const STEPS = ['Punch', 'Tear', 'Mend'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tkt">
        <div class="sp-tkt__wrap">
          <div class="sp-tkt__ticket">
            <article class="sp-tkt__main">
              <small>Maktaba Live</small>
              <b>Paper Motion Night</b>
              <span>Sat 12 Dec · 8 PM</span>
              <span>Row F · Seat 14</span>
              <i class="sp-tkt__stamp" aria-hidden="true">Punched</i>
            </article>
            <div class="sp-tkt__stub"><span>Admit one</span><small>No. 0042</small></div>
            <i class="sp-tkt__ring" aria-hidden="true"></i>
          </div>
          <i class="sp-tkt__chad" aria-hidden="true"></i>
        </div>
        <button type="button" class="sp-tkt__btn" aria-live="polite">Punch</button>
      </div>`);
    const wrap = k.$('.sp-tkt__wrap');
    const stub = k.$('.sp-tkt__stub');
    const ring = k.$('.sp-tkt__ring');
    const chad = k.$('.sp-tkt__chad');
    const stamp = k.$('.sp-tkt__stamp');
    const main = k.$('.sp-tkt__main');
    const btn = k.$('.sp-tkt__btn');
    k.fit(wrap, 0.9);
    const d = (t) => (reducedMotion ? 0 : t / p.speed);
    gsap.set(stub, { '--r': '0em' });
    gsap.set([ring, chad, stamp], { autoAlpha: 0 });
    let step = 0;
    let tl;

    const punch = () => gsap.timeline()
      // The punch presses in, and a hole opens: one piece becomes a piece with a hole
      .to(stub, { scale: 0.96, duration: d(0.08) })
      .to(stub, { scale: 1, duration: d(0.3), ease: 'back.out(3)' })
      .to(stub, { '--r': `${p.hole}em`, duration: d(0.35), ease: 'back.out(2)' }, '<')
      .fromTo(ring, { autoAlpha: 1, scale: 0 }, { scale: 1, width: `${p.hole * 2}em`, height: `${p.hole * 2}em`, duration: d(0.35), ease: 'back.out(2)' }, '<')
      // The punched-out disc drops away
      .fromTo(chad, { autoAlpha: 1, x: 0, y: 0, rotation: 0, width: `${p.hole * 2}em`, height: `${p.hole * 2}em` },
        { y: '7em', x: '1.5em', rotation: 200, duration: d(0.7), ease: 'power2.in' }, '<0.1')
      .to(chad, { autoAlpha: 0, duration: d(0.15) }, '>-0.15')
      .fromTo(stamp, { autoAlpha: 0, scale: 1.8, rotation: -24 }, { autoAlpha: 1, scale: 1, rotation: -12, duration: d(0.3), ease: 'power3.in' }, '<-0.4')
      .to(main, { keyframes: { y: [2, -1, 0] }, duration: d(0.2) });

    const tear = () => gsap.timeline()
      // It strains along the perforation, then comes away as a second piece
      .to(stub, { keyframes: { rotation: [0, 3, -2, 4, -1] }, transformOrigin: '0% 0%', duration: d(0.35), ease: 'none' })
      .to(stub, { x: '1.6em', y: '0.4em', rotation: 14, duration: d(0.25), ease: 'power2.out' })
      .to(ring, { x: '1.6em', y: '0.4em', autoAlpha: 0, duration: d(0.15) }, '<')
      .to(main, { x: '-0.6em', rotation: -2, duration: d(0.25), ease: 'power2.out' }, '<')
      .to(stub, { y: '8em', rotation: 50, duration: d(0.6), ease: 'power2.in' })
      .to(stub, { autoAlpha: 0, duration: d(0.15) }, '>-0.15')
      .to(main, { x: 0, rotation: 0, duration: d(0.6), ease: 'elastic.out(1, 0.5)' }, '<-0.3');

    const mend = () => gsap.timeline()
      .to(stamp, { autoAlpha: 0, duration: d(0.2) })
      .set(stub, { x: 0, y: '-3em', rotation: 0, '--r': '0em' })
      .set(ring, { x: 0, y: 0, autoAlpha: 0, scale: 0 })
      .to(stub, { y: 0, autoAlpha: 1, duration: d(0.5), ease: 'bounce.out' });

    const next = () => {
      if (tl?.isActive()) return;
      tl = [punch, tear, mend][step]();
      step = (step + 1) % 3;
      btn.textContent = STEPS[step];
    };
    k.on(btn, 'click', next);

    return () => { tl?.kill(); k.destroy(); };
  },
};
