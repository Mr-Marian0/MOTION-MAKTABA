/** Walker Upload: a little courier picks up each file you add and walks it across to the folder, legs swinging and body bobbing, drops it in, and walks back for the next one. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pickFiles } from './_fi.js';

export const meta = {
  title: 'Walker Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Queue-based', 'Sequential', 'Autonomous'],
  effect: ['Locomotion', 'Walking', 'Bobbing'],
  purpose: ['Progress', 'Storytelling', 'Delight'],
  properties: ['Position', 'Rotation'],
  description: 'An upload where the progress is a walk. Add files and a small courier picks the first one up, holds it overhead and walks it from the drop zone across to the folder, legs scissoring and body bobbing with each step; the file drops in, the folder\'s count goes up and the courier walks back for the next one. Files added meanwhile wait in a queue.',
  params: [
    { key: 'pace', label: 'Step time', group: 'Motion', type: 'range', min: 0.12, max: 0.5, step: 0.02, unit: 's', default: 0.24, live: true },
    { key: 'stride', label: 'Stride', group: 'Motion', type: 'range', min: 10, max: 45, step: 5, unit: '°', default: 28, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Courier'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-wlk">
        <div class="sp-fi__wrap">
          <div class="sp-wlk__row">
            <div class="sp-fi__drop sp-wlk__zone" role="button" tabindex="0" aria-label="Add a file"><b>Add</b><small>click or drop</small></div>
            <div class="sp-wlk__folder"><i aria-hidden="true"></i><b aria-live="polite">0 files</b></div>
          </div>
          <div class="sp-wlk__floor">
            <div class="sp-wlk__man" aria-hidden="true">
              <span class="sp-wlk__parcel"></span>
              <svg viewBox="0 0 20 40"><circle cx="10" cy="6" r="4.5"/><path class="sp-wlk__arms" d="M3 4 L10 14 L17 4"/><path d="M10 11 V25"/><path class="sp-wlk__leg" d="M10 25 V38"/><path class="sp-wlk__leg" d="M10 25 V38"/></svg>
            </div>
          </div>
          <small class="sp-fi__msg" aria-live="polite"></small>
        </div>
      </div>`);
    const zone = k.$('.sp-wlk__zone');
    const floor = k.$('.sp-wlk__floor');
    const man = k.$('.sp-wlk__man');
    const svg = k.$('.sp-wlk__man svg');
    const parcel = k.$('.sp-wlk__parcel');
    const legs = k.$$('.sp-wlk__leg');
    const count = k.$('.sp-wlk__folder b');
    const msg = k.$('.sp-fi__msg');
    gsap.set(legs, { transformOrigin: '10px 25px' });
    gsap.set(parcel, { autoAlpha: 0 });
    let W = 0, n = 0, busy = false;
    const queue = [];
    k.resize(floor, () => (W = floor.offsetWidth - man.offsetWidth));
    // Walking: legs scissor (yoyo), the body bobs twice per stride; both run only while walking
    let gait;
    const walk = (on) => {
      gait?.kill();
      gsap.set(legs, { rotation: 0 });
      if (!on) return;
      gait = gsap.timeline({ repeat: -1 })
        .fromTo(legs, { rotation: (i) => (i ? -1 : 1) * p.stride }, { rotation: (i) => (i ? 1 : -1) * p.stride, duration: p.pace, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
        .fromTo(svg, { y: 0 }, { y: -2, duration: p.pace / 2, ease: 'sine.out', yoyo: true, repeat: 3 }, 0);
    };
    const next = () => {
      if (busy || !queue.length) return;
      busy = true;
      const [name] = queue.shift();
      msg.textContent = `Carrying ${name}…`;
      parcel.textContent = name.split('.').pop();
      const dist = W;
      const t = reducedMotion ? 0 : (dist / 40) * p.pace;
      gsap.timeline({ onComplete: () => { busy = false; next(); } })
        .set(parcel, { autoAlpha: 1, y: 0 })
        .call(() => walk(!reducedMotion))
        .set(svg, { scaleX: 1 })
        .to(man, { x: dist, duration: t, ease: 'none' })
        .call(() => walk(false))
        .to(parcel, { y: 14, autoAlpha: 0, duration: reducedMotion ? 0 : 0.25, ease: 'power2.in' })
        .call(() => { n += 1; count.textContent = `${n} file${n > 1 ? 's' : ''}`; msg.textContent = `${name} is in the folder.`; })
        .set(svg, { scaleX: -1 })
        .call(() => walk(!reducedMotion))
        .to(man, { x: 0, duration: t * 0.8, ease: 'none' })
        .call(() => walk(false))
        .set(svg, { scaleX: 1 });
    };
    pickFiles(k, zone, (f) => { queue.push(f); msg.textContent = queue.length > 1 || busy ? `${f[0]} is waiting.` : ''; next(); }, (on) => zone.classList.toggle('is-over', on));
    return () => { gait?.kill(); k.destroy(); };
  },
};
