/** Curve Upload: each file you add flies to the cloud along a swooping Bézier curve, its thumbnail turning to follow the path, and lands in the cloud with a puff; the dashed curve fades behind it. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pickFiles } from './_fi.js';

export const meta = {
  title: 'Curve Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Randomized', 'Sequential'],
  effect: ['Bezier-path-motion', 'Curved-path-motion', 'Contracting'],
  purpose: ['Progress', 'Feedback', 'Continuity'],
  properties: ['Path', 'Position', 'Rotation', 'Scale'],
  description: 'An upload that shows files flying off to the cloud. Each file you add launches from the drop zone along a curved Bézier route (a different swoop every time, drawn as a faint dashed trail), the file icon turning to face the way it is going and shrinking with distance. It lands inside the cloud with a little puff and the cloud\'s count goes up.',
  params: [
    { key: 'time', label: 'Flight time', group: 'Motion', type: 'range', min: 0.5, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    { key: 'swoop', label: 'Swoop', group: 'Shape', type: 'range', min: 0, max: 1.5, step: 0.1, unit: '', default: 0.8, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sky'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-crv">
        <div class="sp-crv__sky">
          <svg class="sp-crv__trails" aria-hidden="true"></svg>
          <div class="sp-crv__cloud"><b aria-live="polite">0</b><small>in the cloud</small></div>
          <div class="sp-fi__drop sp-crv__zone" role="button" tabindex="0" aria-label="Upload a file"><b>Upload</b><small>click or drop</small></div>
        </div>
      </div>`);
    const sky = k.$('.sp-crv__sky');
    const trails = k.$('.sp-crv__trails');
    const cloud = k.$('.sp-crv__cloud');
    const count = k.$('.sp-crv__cloud b');
    const zone = k.$('.sp-crv__zone');
    let n = 0;
    const fly = ([name]) => {
      const done = () => { n += 1; count.textContent = n; };
      if (reducedMotion) return done();
      // Start and end in the sky's own pixels, measured once per flight
      const [W, H] = [sky.offsetWidth, sky.offsetHeight];
      trails.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const a = [zone.offsetLeft + zone.offsetWidth / 2, zone.offsetTop + 4];
      const b = [cloud.offsetLeft + cloud.offsetWidth / 2, cloud.offsetTop + cloud.offsetHeight / 2];
      const side = Math.random() < 0.5 ? -1 : 1;
      const c1 = [a[0] + side * W * 0.45 * p.swoop, a[1] - H * 0.2];
      const c2 = [b[0] - side * W * 0.5 * p.swoop, b[1] + H * 0.35];
      const trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      trail.setAttribute('d', `M${a} C${c1} ${c2} ${b}`);
      trails.append(trail);
      const len = trail.getTotalLength();
      const f = document.createElement('i');
      f.className = 'sp-crv__file';
      f.textContent = name.split('.').pop();
      sky.append(f);
      const s = { t: 0 };
      gsap.timeline({ onComplete: () => { f.remove(); trail.remove(); } })
        .set(trail, { strokeDasharray: `4 6`, strokeDashoffset: 0, autoAlpha: 0.6 })
        .to(s, { t: 1, duration: p.time, ease: 'power1.inOut', onUpdate: () => {
          const pt = trail.getPointAtLength(s.t * len);
          const ah = trail.getPointAtLength(Math.min(len, s.t * len + 1));
          const ang = (Math.atan2(ah.y - pt.y, ah.x - pt.x) * 180) / Math.PI + 90;
          gsap.set(f, { x: pt.x, y: pt.y, rotation: ang, scale: 1 - s.t * 0.5 });
        } })
        .call(done)
        .to(f, { scale: 0, autoAlpha: 0, duration: 0.2 })
        .fromTo(cloud, { scale: 1 }, { keyframes: { scale: [1.12, 1] }, duration: 0.35 }, '<')
        .to(trail, { autoAlpha: 0, duration: 0.4 }, '<');
    };
    pickFiles(k, zone, fly, (on) => zone.classList.toggle('is-over', on));
    return () => k.destroy();
  },
};
