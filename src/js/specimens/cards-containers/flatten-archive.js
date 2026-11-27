/** Flatten Archive: "Archive" drops a roller onto the event card and rolls it down, pressing the card flat into a thin sheet that slides into the archive. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Flatten Archive',
  element: 'Content card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Reversible', 'Synchronized', 'Event-driven'],
  effect: ['Flattening', 'Rolling', 'Sliding', 'Springing'],
  purpose: ['Feedback', 'Storytelling', 'Continuity'],
  properties: ['Scale', 'Position', 'Rotation'],
  description: 'Archive an event and a roller drops onto the top of its card and rolls down, pressing it flatter and wider as it goes until it is a thin sheet. The sheet slides off into the archive tray. Restore pulls it back and it springs up to full height.',
  params: [
    { key: 'time', label: 'Roll time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    { key: 'spread', label: 'Spread', group: 'Shape', type: 'range', min: 0, max: 0.2, step: 0.02, unit: '×', default: 0.08, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Roller'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-flt">
        <div class="sp-cc__wrap sp-flt__wrap">
          <article class="sp-cc__card sp-flt__card">
            <span class="sp-cc__kick">Sat 14 Dec · 7 PM</span>
            <b class="sp-cc__title">Letterpress Night</b>
            <span class="sp-cc__text">Set your own type and print a poster to take home.</span>
            <div class="sp-cc__row"><span class="sp-cc__text">24 going</span><span class="sp-cc__btn sp-cc__btn--ghost">RSVP</span></div>
          </article>
          <i class="sp-flt__roller"></i>
          <span class="sp-flt__tray">Archive</span>
        </div>
        <button type="button" class="sp-cc__btn sp-flt__btn" aria-pressed="false">Archive</button>
      </div>`);
    const wrap = k.$('.sp-flt__wrap');
    const card = k.$('.sp-flt__card');
    const roller = k.$('.sp-flt__roller');
    const btn = k.$('.sp-flt__btn');
    k.fit(wrap, 0.75);
    const d = (t) => (reducedMotion ? 0 : t);
    gsap.set(card, { transformOrigin: '50% 100%' });
    gsap.set(roller, { autoAlpha: 0 });
    let tl;

    k.on(btn, 'click', () => {
      const flat = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(flat));
      btn.textContent = flat ? 'Restore' : 'Archive';
      tl?.kill();
      const H = card.offsetHeight / parseFloat(getComputedStyle(card).fontSize);
      const squash = 0.05;
      tl = gsap.timeline();
      if (flat) {
        tl.fromTo(roller, { autoAlpha: 1, y: '-4em' }, { y: 0, duration: d(0.35), ease: 'bounce.out' })
          // Roll down: the card's top edge stays under the roller as it is pressed flat
          .to(card, { scaleY: squash, scaleX: 1 + p.spread, duration: d(p.time), ease: 'power1.inOut' })
          .to(roller, { y: `${H * (1 - squash)}em`, backgroundPosition: `0em ${H}em`, duration: d(p.time), ease: 'power1.inOut' }, '<')
          .to(roller, { y: '-4em', autoAlpha: 0, duration: d(0.35), ease: 'power2.in' })
          .to(card, { x: '9em', autoAlpha: 0, duration: d(0.45), ease: 'power2.in' }, '<');
      } else {
        tl.set(roller, { autoAlpha: 0 })
          .fromTo(card, { x: '9em', autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: d(0.4), ease: 'power2.out' })
          .to(card, { scaleY: 1, scaleX: 1, duration: d(0.8), ease: 'elastic.out(1, 0.4)' });
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
