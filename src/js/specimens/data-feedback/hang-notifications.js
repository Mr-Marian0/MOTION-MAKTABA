/** Hang Notifications: an announcement banner hangs on two cords: it drops in and swings, and the little tag hanging off its corner swings after it (secondary motion), settling a beat later than the banner. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Hang Notifications',
  element: 'Notifications',
  trigger: ['In view', 'Click', 'Hover'],
  behavior: ['Hierarchical', 'Physics-driven', 'Event-driven'],
  effect: ['Secondary-motion', 'Swinging', 'Dropping'],
  purpose: ['Focus', 'Feedback', 'Delight'],
  properties: ['Rotation', 'Position'],
  description: 'A "scheduled maintenance" announcement hung from two cords at the top of the page. It drops in, catches on its cords and swings to rest. A small "Sat 2am" tag dangling from its corner is not stiffly attached: it is jerked the other way, then swings on as a separate pendulum and settles only after the banner has. Hover the banner to give it a nudge; ✕ lets it fall away.',
  params: [
    { key: 'swing', label: 'Swing', group: 'Motion', type: 'range', min: 2, max: 20, step: 1, unit: '°', default: 9, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Banner'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-hng">
        <div class="sp-hng__rig">
          <div class="sp-hng__banner" role="status"><i class="sp-hng__cord" aria-hidden="true"></i><i class="sp-hng__cord" aria-hidden="true"></i>
            <b>Scheduled maintenance</b><span>The shop will be offline for an hour.</span>
            <button type="button" class="sp-hng__x" aria-label="Dismiss">✕</button>
            <span class="sp-hng__tag"><i aria-hidden="true"></i><small>Sat 2am</small></span>
          </div>
        </div>
        <button type="button" class="sp-df__btn sp-df__btn--ghost sp-hng__again" hidden>Show again</button>
      </div>`);
    const banner = k.$('.sp-hng__banner');
    const tag = k.$('.sp-hng__tag');
    const again = k.$('.sp-hng__again');
    gsap.set(banner, { transformOrigin: '50% -2.5em' });
    gsap.set(tag, { transformOrigin: '50% 0%' });
    // the banner's swing, and the tag's: opposite kick, slower and longer to die out (secondary motion)
    const kick = (amt) => {
      if (reducedMotion) return;
      gsap.fromTo(banner, { rotation: amt }, { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.3)', overwrite: 'auto' });
      gsap.fromTo(tag, { rotation: -amt * 2.4 }, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.15)', delay: 0.06, overwrite: 'auto' });
    };
    const drop = () => {
      again.hidden = true;
      gsap.set(banner, { autoAlpha: 1, rotation: 0 });
      if (reducedMotion) return gsap.set(banner, { y: 0 });
      gsap.fromTo(banner, { y: '-8em' }, { y: 0, duration: 0.5, ease: 'power2.in', onComplete: () => kick(p.swing) });
    };
    gsap.set(banner, { autoAlpha: 0 });
    k.inView(banner.parentElement, () => gsap.getProperty(banner, 'autoAlpha') === 0 && again.hidden && drop(), 0.3);
    k.on(banner, 'pointerenter', () => kick(p.swing * 0.4));
    k.on(k.$('.sp-hng__x'), 'click', () => {
      const end = () => { gsap.set(banner, { autoAlpha: 0 }); again.hidden = false; again.focus(); };
      if (reducedMotion) return end();
      gsap.timeline({ onComplete: end }).to(banner, { rotation: -14, duration: 0.25, ease: 'power2.in' }).to(banner, { y: '10em', rotation: 25, autoAlpha: 0, duration: 0.5, ease: 'power2.in' });
    });
    k.on(again, 'click', drop);
    return () => k.destroy();
  },
};
