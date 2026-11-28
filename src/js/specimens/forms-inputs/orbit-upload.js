/** Orbit Upload: while a file uploads, a little satellite circles its icon, painting the progress ring as it goes, one lap for the whole upload; when the ring closes it docks on the icon as a tick. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pickFiles } from './_fi.js';

export const meta = {
  title: 'Orbit Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Sequential', 'State-dependent'],
  effect: ['Circling', 'Circular-motion', 'Contracting'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Rotation', 'Path', 'Scale'],
  description: 'An avatar upload whose progress is an orbit. Choose a picture and a small satellite sets off round it, the progress ring drawing itself behind the satellite as the upload goes (fast at first, slowing near the end, like real uploads). When the lap closes, the satellite spirals in and becomes the green tick on the picture.',
  params: [
    { key: 'time', label: 'Upload time', group: 'Motion', type: 'range', min: 0.8, max: 5, step: 0.2, unit: 's', default: 2.4, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Done'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-orb">
        <div class="sp-orb__row">
          <div class="sp-orb__pic" role="progressbar" aria-label="Upload progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
            <svg viewBox="0 0 100 100" aria-hidden="true"><circle class="sp-orb__track" cx="50" cy="50" r="44" /><circle class="sp-orb__ring" cx="50" cy="50" r="44" pathLength="1" /></svg>
            <i class="sp-orb__face"></i>
            <span class="sp-orb__arm" aria-hidden="true"><i class="sp-orb__sat"></i></span>
            <b class="sp-orb__tick" aria-hidden="true">✓</b>
          </div>
          <div class="sp-orb__side">
            <div class="sp-fi__drop sp-orb__zone" role="button" tabindex="0" aria-label="Choose a profile picture"><b>New photo</b><small>click or drop</small></div>
            <small class="sp-fi__msg" aria-live="polite"></small>
          </div>
        </div>
      </div>`);
    const pic = k.$('.sp-orb__pic');
    const ring = k.$('.sp-orb__ring');
    const arm = k.$('.sp-orb__arm');
    const sat = k.$('.sp-orb__sat');
    const tick = k.$('.sp-orb__tick');
    const msg = k.$('.sp-fi__msg');
    gsap.set(ring, { strokeDasharray: 1, strokeDashoffset: 1, rotation: -90, transformOrigin: '50% 50%' });
    gsap.set(tick, { scale: 0 });
    gsap.set([arm, sat], { autoAlpha: 0 });
    let tl;
    const upload = ([name]) => {
      tl?.kill();
      msg.textContent = `Uploading ${name}…`;
      const prog = { v: 0 };
      tl = gsap.timeline()
        .set(tick, { scale: 0 })
        .set([arm, sat], { autoAlpha: 1, rotation: 0, scale: 1 })
        .set(sat, { x: 0 })
        // the satellite's arm turns with the progress; the ring's drawn length follows the same value
        .to(prog, { v: 1, duration: p.time, ease: 'power2.out', onUpdate: () => {
          gsap.set(arm, { rotation: prog.v * 360 });
          gsap.set(ring, { strokeDashoffset: 1 - prog.v });
          pic.setAttribute('aria-valuenow', Math.round(prog.v * 100));
        } })
        // spiral in: keep turning while the arm shortens to nothing
        .to(arm, { rotation: '+=180', duration: 0.45, ease: 'power2.in' })
        .to(sat, { x: '-2.8em', scale: 0.4, duration: 0.45, ease: 'power2.in' }, '<')
        .set([arm, sat], { autoAlpha: 0 })
        .to(tick, { scale: 1, duration: 0.4, ease: 'back.out(3)' })
        .call(() => (msg.textContent = 'Profile picture updated.'));
      if (reducedMotion) tl.progress(1);
    };
    pickFiles(k, k.$('.sp-orb__zone'), upload, (on) => k.$('.sp-orb__zone').classList.toggle('is-over', on));
    return () => k.destroy();
  },
};
