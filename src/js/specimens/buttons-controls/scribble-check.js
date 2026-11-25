/** Scribble Check: the box squashes, a hand-drawn tick draws itself and the task gets struck through. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Scribble Check',
  element: 'Checkbox',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Path-following', 'Squashing', 'Sweeping'],
  purpose: ['Feedback', 'Progress'],
  properties: ['Path', 'Scale', 'Opacity'],
  description: 'A to-do list. Checking a box squashes it, draws a pen tick inside, then sweeps a line through the task. Unchecking erases both in reverse.',
  params: [
    { key: 'labels', label: 'Tasks', group: 'Content', type: 'text', default: 'Sketch the idea, Cut the paper, Glue it down' },
    { key: 'speed', label: 'Pen speed', group: 'Motion', type: 'range', min: 0.15, max: 1, step: 0.05, unit: 's', default: 0.35, live: true },
    { key: 'strike', label: 'Strike through', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const tasks = labelsOf(p.labels, ['Sketch the idea']).slice(0, 5);
    k.html(`
      <div class="sp sp-check">
        <ul>${tasks.map((t) => `
          <li><label>
            <input type="checkbox" />
            <span class="sp-check__box"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13c2 1.5 3.5 3.5 5 6 3-7 7-11.5 12-15"/></svg></span>
            <span class="sp-check__text">${esc(t)}<i></i></span>
          </label></li>`).join('')}
        </ul>
        <p class="sp-note">Tick the tasks</p>
      </div>`);

    k.$$('label').forEach((row) => {
      const input = row.querySelector('input');
      const path = row.querySelector('path');
      const box = row.querySelector('.sp-check__box');
      const line = row.querySelector('i');
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.set(line, { scaleX: 0 });
      k.on(input, 'change', () => {
        const t = reducedMotion ? 0 : Number(p.speed);
        const on = input.checked;
        gsap.killTweensOf([path, line, box]);
        if (on) {
          gsap.timeline()
            .to(box, { scaleY: 0.8, scaleX: 1.1, duration: t * 0.3, yoyo: true, repeat: 1 })
            .to(path, { strokeDashoffset: 0, duration: t, ease: 'power2.out' })
            .to(line, { scaleX: p.strike ? 1 : 0, duration: t, ease: 'power2.inOut' });
        } else {
          gsap.timeline()
            .to(line, { scaleX: 0, duration: t * 0.6, ease: 'power2.in' })
            .to(path, { strokeDashoffset: len, duration: t * 0.6, ease: 'power2.in' });
        }
      });
    });

    return () => k.destroy();
  },
};
