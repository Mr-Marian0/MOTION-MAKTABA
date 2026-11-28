/** Run Icon: a "running" status icon with a real stride: the little runner's legs and arms swing in a running cycle, body bobbing, the ground streaming past; pause and it stops mid-stride and stands. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Run Icon',
  element: 'Icon',
  trigger: ['Click', 'Keyboard', 'Load'],
  behavior: ['Toggle-dependent', 'Looping', 'State-dependent'],
  effect: ['Running', 'Locomotion', 'Bobbing'],
  purpose: ['Progress', 'Feedback', 'Delight'],
  properties: ['Rotation', 'Position'],
  description: 'A job-status icon that shows a task "running" with an actual runner. While the job runs, the figure\'s legs and arms swing through a running cycle in opposition, the body bobbing twice per stride and leaning forward, while dashes of ground stream backwards beneath. Press the icon to pause: the runner slows, straightens and stands; press again to set off.',
  params: [
    { key: 'pace', label: 'Stride time', group: 'Motion', type: 'range', min: 0.25, max: 1, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Runner'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-run">
        <button type="button" class="sp-tm__icon sp-run__tile" aria-pressed="true" aria-label="Export job running (press to pause)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <g class="sp-run__body"><circle cx="13" cy="4.5" r="2"/><path d="M12.5 7 L11 13"/>
              <path class="sp-run__arm1" d="M12.2 8.5 L9.5 11"/><path class="sp-run__arm2" d="M12.2 8.5 L15 10.5"/>
              <path class="sp-run__leg1" d="M11 13 L9.5 18"/><path class="sp-run__leg2" d="M11 13 L13.5 18"/></g>
            <path class="sp-run__ground" d="M2 21 H22" />
          </svg>
        </button>
        <small class="sp-run__msg" aria-live="polite">Export running</small>
      </div>`);
    const tile = k.$('.sp-run__tile');
    const body = k.$('.sp-run__body');
    const [a1, a2, l1, l2] = ['.sp-run__arm1', '.sp-run__arm2', '.sp-run__leg1', '.sp-run__leg2'].map((s) => k.$(s));
    const ground = k.$('.sp-run__ground');
    const msg = k.$('.sp-run__msg');
    gsap.set([a1, a2], { svgOrigin: '12.2 8.5' });
    gsap.set([l1, l2], { svgOrigin: '11 13' });
    // The cycle: limbs swing in opposition (yoyo), body bobs twice per stride, ground dashes stream back
    const cycle = gsap.timeline({ repeat: -1, paused: true })
      .fromTo([l1, a2], { rotation: 35 }, { rotation: -35, duration: p.pace / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
      .fromTo([l2, a1], { rotation: -35 }, { rotation: 35, duration: p.pace / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
      .fromTo(body, { y: 0 }, { y: -1, duration: p.pace / 4, ease: 'sine.out', yoyo: true, repeat: 3 }, 0)
      .fromTo(ground, { strokeDashoffset: 0 }, { strokeDashoffset: 8, duration: p.pace, ease: 'none' }, 0);
    gsap.set(ground, { strokeDasharray: '4 4' });
    let on = true;
    const set = (run) => {
      on = run;
      tile.setAttribute('aria-pressed', String(run));
      tile.setAttribute('aria-label', `Export job ${run ? 'running' : 'paused'} (press to ${run ? 'pause' : 'resume'})`);
      msg.textContent = run ? 'Export running' : 'Paused';
      if (reducedMotion) return;
      if (run) { gsap.to(body, { rotation: 8, svgOrigin: '11 13', duration: 0.3 }); cycle.timeScale(1).play(); }
      else { cycle.pause(); gsap.to([a1, a2, l1, l2], { rotation: 0, duration: 0.3, ease: 'power2.out' }); gsap.to(body, { rotation: 0, y: 0, svgOrigin: '11 13', duration: 0.3 }); }
    };
    set(true);
    k.on(tile, 'click', () => set(!on));
    return () => { cycle.kill(); k.destroy(); };
  },
};
