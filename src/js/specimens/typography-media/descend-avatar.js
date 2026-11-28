/** Descend Avatar: a new member's avatar floats down to their profile under a little parachute, swaying side to side as it descends, touches down on its ring, and the canopy collapses away. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { face, NAMES } from './_tm.js';

export const meta = {
  title: 'Descend Avatar',
  element: 'Avatar',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Gravity-driven', 'Sequential'],
  effect: ['Descending', 'Swaying', 'Contracting'],
  purpose: ['Delight', 'Storytelling', 'Feedback'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A "welcome to the team" card where the newcomer drops in. Their avatar descends from above the card hanging under a small parachute, drifting down slowly and swaying gently from side to side like a pendulum; it settles exactly onto the dashed ring waiting for it, the canopy folds up and floats away, and their name fades in. "Welcome another" brings the next person down.',
  params: [
    { key: 'time', label: 'Descent time', group: 'Motion', type: 'range', min: 1, max: 4, step: 0.1, unit: 's', default: 2.2, live: true },
    { key: 'sway', label: 'Sway', group: 'Motion', type: 'range', min: 0, max: 25, step: 1, unit: '°', default: 12, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Canopy'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-dsc">
        <div class="sp-dsc__card">
          <span class="sp-tm__kick">New on the team</span>
          <div class="sp-dsc__spot"><i class="sp-dsc__ring" aria-hidden="true"></i><div class="sp-dsc__rig"><i class="sp-dsc__chute" aria-hidden="true"></i><span class="sp-dsc__ava"></span></div></div>
          <b class="sp-dsc__name" aria-live="polite"></b>
          <button type="button" class="sp-tm__btn sp-tm__btn--ghost">Welcome another</button>
        </div>
      </div>`);
    const rig = k.$('.sp-dsc__rig');
    const chute = k.$('.sp-dsc__chute');
    const ava = k.$('.sp-dsc__ava');
    const name = k.$('.sp-dsc__name');
    gsap.set(rig, { transformOrigin: '50% 0%' });
    let who = 0, tl;
    const land = () => {
      tl?.kill();
      ava.innerHTML = face(who);
      name.textContent = '';
      const done = () => (name.textContent = `Say hi to ${NAMES[who].split(' ')[0]}!`);
      if (reducedMotion) { gsap.set(rig, { y: 0, rotation: 0 }); gsap.set(chute, { autoAlpha: 0 }); return done(); }
      const t = p.time;
      tl = gsap.timeline()
        .set(chute, { autoAlpha: 1, scaleY: 1, y: 0, x: 0, rotation: 0 })
        .fromTo(rig, { y: '-9em' }, { y: 0, duration: t, ease: 'power1.out' }, 0)
        // the sway: a pendulum that dies down as it lands
        .fromTo(rig, { rotation: p.sway }, { keyframes: { rotation: [-p.sway * 0.8, p.sway * 0.55, -p.sway * 0.3, p.sway * 0.1, 0] }, duration: t, ease: 'sine.inOut' }, 0)
        .to(chute, { scaleY: 0.2, y: '0.8em', duration: 0.3, ease: 'power2.in' })
        .to(chute, { x: '3em', y: '-1em', rotation: 40, autoAlpha: 0, duration: 0.7, ease: 'power1.out' })
        .call(done, null, '<0.1');
      who = (who + 1) % NAMES.length;
    };
    k.inView(k.$('.sp-dsc__card'), () => !tl && land());
    k.on(k.$('.sp-tm__btn'), 'click', land);
    return () => k.destroy();
  },
};
