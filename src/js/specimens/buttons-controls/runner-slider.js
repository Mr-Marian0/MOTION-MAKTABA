/** Runner Slider: a stick figure is the thumb. Drag and it runs along the dashed path, leaving a solid trail behind. */
import { kit, clamp, slider } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Runner Slider',
  element: 'Slider',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Clamped', 'Direction-aware', 'Velocity-aware'],
  effect: ['Running', 'Bobbing', 'Swinging'],
  purpose: ['Feedback', 'Progress', 'Delight', 'Storytelling'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A stick figure stands on a dashed path. Drag and it runs: its legs and arms swing in step with the distance covered, it leans forward and turns to face the way it is going, and the path behind it turns solid. Drop it at the finish and it cheers.',
  params: [
    { key: 'stride', label: 'Stride length', group: 'Motion', type: 'range', min: 0.5, max: 2.5, step: 0.1, unit: '×', default: 1, live: true },
    { key: 'lean', label: 'Lean', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '°', default: 10, live: true },
    { key: 'value', label: 'Start value', group: 'Content', type: 'range', min: 0, max: 100, step: 1, default: 10 },
    tone('#111111'),
  ],
};

// Figure faces right; hips at (20,34), knees at (20,44), shoulders at (20,17), feet on y = 54.
const LEG = '<g class="sp-run__thigh"><line x1="20" y1="34" x2="20" y2="44"/><g class="sp-run__shin"><line x1="20" y1="44" x2="20" y2="54"/></g></g>';
const ARM = '<line class="sp-run__arm" x1="20" y1="17" x2="20" y2="30"/>';

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-run">
        <div class="sp-run__rail">
          <i class="sp-run__path"></i><i class="sp-run__trail"></i>
          <div class="sp-run__man" role="slider" tabindex="0" aria-label="Progress" aria-valuemin="0" aria-valuemax="100">
            <svg viewBox="0 0 40 56" aria-hidden="true"><g class="sp-run__body">
              ${ARM}${LEG}<line x1="20" y1="13" x2="20" y2="34"/><circle cx="20" cy="8" r="5"/>${LEG}${ARM}
            </g></svg>
          </div>
        </div>
        <p class="sp-note">Drag the runner · or use arrow keys</p>
      </div>`);
    const rail = k.$('.sp-run__rail');
    const trail = k.$('.sp-run__trail');
    const man = k.$('.sp-run__man');
    const body = k.$('.sp-run__body');
    const thighs = k.$$('.sp-run__thigh');
    const shins = k.$$('.sp-run__shin');
    const arms = k.$$('.sp-run__arm');
    const s = k.track({ v: Number(p.value), phi: 0, amp: 0, cheer: 0 });
    let face = 1;
    let rest;
    const rot = (el, a, x, y) => el.setAttribute('transform', `rotate(${a.toFixed(1)} ${x} ${y})`);

    const pose = () => {
      const { phi, amp, cheer } = s;
      [0, Math.PI].forEach((off, i) => {
        const q = phi + off;
        rot(thighs[i], -Math.sin(q) * 35 * amp, 20, 34);
        rot(shins[i], Math.max(0, Math.cos(q)) * 55 * amp, 20, 44);
        // Arms swing against the legs, or go up to cheer.
        const swing = Math.sin(q) * 40 * amp;
        rot(arms[i], swing + ((i ? 150 : -150) - swing) * cheer, 20, 17);
      });
      body.setAttribute('transform', `translate(0 ${(-Math.abs(Math.sin(phi)) * 2.5 * amp).toFixed(2)}) rotate(${(Number(p.lean) * amp).toFixed(1)} 20 54)`);
    };
    const place = () => {
      man.style.left = `${s.v}%`;
      trail.style.width = `${s.v}%`;
      man.setAttribute('aria-valuenow', Math.round(s.v));
    };
    place();
    pose();

    const run = (v) => {
      const dx = ((v - s.v) / 100) * rail.offsetWidth;
      s.v = v;
      place();
      if (reducedMotion || !dx) return;
      if (Math.sign(dx) !== face) gsap.set(man, { scaleX: (face = Math.sign(dx)) });
      s.phi += Math.abs(dx) / (7 * Number(p.stride));
      gsap.to(s, { amp: 1, cheer: 0, duration: 0.12, overwrite: 'auto', onUpdate: pose });
      pose();
      rest?.kill();
      rest = gsap.delayedCall(0.14, () => gsap.to(s, { amp: 0, duration: 0.3, ease: 'power2.out', onUpdate: pose }));
    };
    const glide = k.track({ v: 0 });

    slider(k, rail, man, {
      move: run,
      end: () => s.v >= 99.5 && !reducedMotion && gsap.to(s, { cheer: 1, duration: 0.3, delay: 0.3, yoyo: true, repeat: 3, repeatDelay: 0.2, ease: 'back.out(2)', onUpdate: pose }),
      key: (d) => {
        glide.v = s.v;
        gsap.to(glide, { v: clamp(s.v + d * 5, 0, 100), duration: reducedMotion ? 0 : 0.35, overwrite: true, onUpdate: () => run(glide.v) });
      },
    });

    return () => (rest?.kill(), k.destroy());
  },
};
