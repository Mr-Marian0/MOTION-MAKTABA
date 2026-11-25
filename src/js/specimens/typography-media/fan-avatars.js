/** Fan Avatars: a stacked avatar group fans out on hover; the online dot breathes; a click bounces the face. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Avatar Fan',
  element: 'Avatar',
  trigger: ['Hover', 'Focus', 'Click'],
  behavior: ['Hover-dependent', 'Staggered', 'Looping', 'Reactive'],
  effect: ['Divergence', 'Convergence', 'Breathing', 'Bouncing'],
  purpose: ['Hierarchy', 'Delight', 'Feedback'],
  properties: ['Position', 'Scale', 'Spacing'],
  description: 'An overlapping avatar group, the way collaborators are shown on a file. Hover or tab in and the faces fan apart so each can be read; the green dot on whoever is online breathes softly. Click a face to wave.',
  params: [
    { key: 'names', label: 'People', group: 'Content', type: 'text', default: 'Ana Reyes, Bo Lim, Cy Ortiz, Dee Moss, Eli Park' },
    { key: 'spread', label: 'Fan spread', group: 'Layout', type: 'range', min: 0.2, max: 2, step: 0.1, unit: '×', default: 1, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Face color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const names = labelsOf(p.names, ['Ana Reyes', 'Bo Lim', 'Cy Ortiz']).slice(0, 6);
    k.html(`
      <div class="sp sp-avs">
        <ul class="sp-avs__group" aria-label="Editing now">
          ${names.map((n, i) => `<li class="sp-avs__item" style="--i:${i}"><button type="button" class="sp-avs__face" aria-label="${esc(n)}">${esc(n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2))}</button>${i === 0 ? '<i class="sp-avs__dot" aria-hidden="true"></i>' : ''}</li>`).join('')}
        </ul>
        <p class="sp-note">Hover the group · click a face</p>
      </div>`);
    const group = k.$('.sp-avs__group');
    const items = k.$$('.sp-avs__item');
    const d = (t) => (reducedMotion ? 0 : t);
    const em = () => parseFloat(getComputedStyle(group).fontSize);

    if (!reducedMotion) gsap.to(k.$('.sp-avs__dot'), { scale: 1.35, opacity: 0.6, duration: 0.9, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    const fan = (open) => {
      const mid = (items.length - 1) / 2;
      // Resting: 1.6em apart, so the 3.6em faces overlap. Fanned: 4em × spread, on a slight arc.
      items.forEach((it, i) => gsap.to(it, {
        x: (i - mid) * em() * (open ? 4 * p.spread : 1.6),
        y: open ? Math.abs(i - mid) * 0.4 * em() : 0,
        duration: d(0.5), ease: open ? 'back.out(1.8)' : 'power3.out', delay: open ? Math.abs(i - mid) * 0.03 : 0,
      }));
    };
    fan(false);
    k.on(group, 'pointerenter', () => fan(true));
    k.on(group, 'pointerleave', () => fan(false));
    k.on(group, 'focusin', () => fan(true));
    k.on(group, 'focusout', (e) => !group.contains(e.relatedTarget) && fan(false));
    k.$$('.sp-avs__face').forEach((f) =>
      k.on(f, 'click', () => gsap.fromTo(f, { y: 0 }, { keyframes: { y: [-14, 0, -6, 0], rotation: [-8, 6, -3, 0] }, duration: d(0.7) })));

    return () => k.destroy();
  },
};
