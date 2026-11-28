/** Turbine Modal: an upload modal driven by a turbine: the blades spool up, run at speed while the files go up, and spool down to a stop when the upload is done. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Turbine Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard', 'State change'],
  behavior: ['Load-dependent', 'Time-driven', 'State-dependent'],
  effect: ['Turbine-motion', 'Accelerating', 'Decelerating', 'Spinning'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Rotation', 'Size'],
  description: 'An upload modal powered by a little turbine. It spools up when the upload starts, its blades blurring as they reach speed, keeps running while the progress bar fills, then spools down and coasts to a stop as the modal reports that everything is uploaded.',
  params: [
    { key: 'time', label: 'Upload time', group: 'Behavior', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3 },
    { key: 'speed', label: 'Top speed', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: 'rev/s', default: 4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Blades'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-tbn', `
      <div class="sp-ov__card sp-ov__modal sp-tbn__modal" role="dialog" aria-label="Uploading">
        <div class="sp-tbn__row"><span class="sp-tbn__fan" aria-hidden="true">${'<i></i>'.repeat(8)}<b></b></span>
        <span><span class="sp-ov__kick sp-tbn__state" aria-live="polite">Uploading</span><b class="sp-ov__title">3 sketches</b></span></div>
        <i class="sp-tbn__bar"><i></i></i>
      </div>`, { label: 'Upload', title: 'Sketchbook' }));
    const modal = k.$('.sp-tbn__modal');
    const fan = k.$('.sp-tbn__fan');
    const fill = k.$('.sp-tbn__bar i');
    const state = k.$('.sp-tbn__state');
    gsap.set(modal, { autoAlpha: 0 });
    const spin = k.track(gsap.to(fan, { rotation: 360, duration: 1, ease: 'none', repeat: -1, paused: true }));
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (!open) {
        spin.pause();
        return gsap.timeline().to(modal, { autoAlpha: 0, scale: 0.95, duration: 0.25 });
      }
      state.textContent = 'Uploading';
      spin.timeScale(0.001).play();
      return gsap.timeline()
        .fromTo(modal, { autoAlpha: 0, scale: 0.95 }, { autoAlpha: 1, scale: 1, duration: 0.3 })
        // Spool up, run, spool down
        .to(spin, { timeScale: p.speed, duration: 1, ease: 'power2.in' })
        .fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: p.time, ease: 'power1.inOut' }, 0.3)
        .add(() => (state.textContent = 'All uploaded'))
        .to(spin, { timeScale: 0.001, duration: 1.6, ease: 'power3.out', onComplete: () => spin.pause() });
    }, ['Upload', 'Close']);
    return () => { spin.kill(); k.destroy(); };
  },
};
