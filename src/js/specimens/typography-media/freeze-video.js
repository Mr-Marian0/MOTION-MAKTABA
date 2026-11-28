/** Freeze Video: pausing freezes the frame for real: frost creeps in from the corners of the player and the picture goes cold and still; press play and the ice cracks and melts away as it moves again. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Freeze Video',
  element: 'Video',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'State-dependent', 'Reversible'],
  effect: ['Freezing', 'Crystallization', 'Melting'],
  purpose: ['Feedback', 'Delight', 'Affordance'],
  properties: ['Clip & mask', 'Color', 'Opacity'],
  description: 'A video player where pause means freeze. While playing, the scene drifts gently. Press pause (or Space) and frost grows in from all four corners, the picture turning cold and blue-grey as the motion stops dead. Press play and the frost melts back to the corners, the colour warms up and the scene starts moving again.',
  params: [
    { key: 'time', label: 'Freeze time', group: 'Motion', type: 'range', min: 0.4, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    tone('#cfe0ea', 'tone', '--sp-accent', 'Frost'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-frz">
        <div class="sp-tm__video sp-frz__video" tabindex="0" aria-label="Video: The coast road">
          <div class="sp-frz__scene">${photo(1, 'sp-frz__img')}</div>
          <i class="sp-frz__frost" aria-hidden="true"></i>
          <div class="sp-tm__bar"><button type="button" class="sp-tm__play" aria-label="Pause">❚❚</button><span class="sp-tm__track"><i class="sp-tm__fill"></i></span><small>0:41</small></div>
        </div>
      </div>`);
    const video = k.$('.sp-frz__video');
    const scene = k.$('.sp-frz__scene');
    const frost = k.$('.sp-frz__frost');
    const play = k.$('.sp-tm__play');
    const fill = k.$('.sp-tm__fill');
    let playing = true;
    // "Playback": a slow drift of the scene and the progress bar, killed while frozen
    const motion = gsap.timeline({ repeat: -1, yoyo: true, paused: reducedMotion })
      .to(scene, { x: '-1.2em', scale: 1.08, duration: 6, ease: 'sine.inOut' }, 0)
      .fromTo(fill, { scaleX: 0.2 }, { scaleX: 0.8, duration: 6, ease: 'none' }, 0);
    gsap.set(frost, { '--f': 0 });
    const set = (on) => {
      playing = on;
      play.textContent = on ? '❚❚' : '▶';
      play.setAttribute('aria-label', on ? 'Pause' : 'Play');
      const d = reducedMotion ? 0 : p.time;
      if (on) { if (!reducedMotion) motion.play(); }
      else motion.pause();
      gsap.to(frost, { '--f': on ? 0 : 1, duration: on ? d * 0.7 : d, ease: on ? 'power2.in' : 'power2.out', overwrite: true });
      gsap.to(scene, { filter: on ? 'saturate(1) brightness(1)' : 'saturate(0.35) brightness(1.08) hue-rotate(-10deg)', duration: d * 0.8, overwrite: 'auto' });
    };
    k.on(play, 'click', () => set(!playing));
    k.on(video, 'keydown', (e) => e.key === ' ' && e.target === video && (e.preventDefault(), set(!playing)));
    return () => { motion.kill(); k.destroy(); };
  },
};
