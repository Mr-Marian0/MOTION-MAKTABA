/** Arrow Toggle: an arrow-shaped knob slides across a barrel track and turns to point back the way it came. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Arrow Toggle',
  element: 'Toggle',
  trigger: ['Hover', 'Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Direction-aware', 'Reversible'],
  effect: ['Sliding', 'Shape-shifting', 'Stretching'],
  purpose: ['Feedback', 'Affordance', 'Wayfinding'],
  properties: ['Position', 'Shape', 'Clip & mask', 'Color'],
  description: 'A barrel-shaped switch whose knob is an arrow pointing where it will go next. Clicking slides it across, stretching on the way, and its point moves to the other side as color fills the track. Hovering makes the arrow nudge in its direction.',
  params: [
    { key: 'label', label: 'Name (screen readers)', group: 'Content', type: 'text', default: 'Autoplay' },
    { key: 'speed', label: 'Slide time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#4f6b4a', 'on', '--sp-on', 'On color'),
    tone('#111111', 'tone', '--sp-accent', 'Track color'),
  ],
};

// Same six points in both, so the shape morphs: the right tip flattens while the left middle pushes out.
const RIGHT = 'polygon(0% 0%, 72% 0%, 100% 50%, 72% 100%, 0% 100%, 0% 50%)';
const LEFT = 'polygon(28% 0%, 100% 0%, 100% 50%, 100% 100%, 28% 100%, 0% 50%)';

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-arrow">
        <button type="button" role="switch" aria-checked="false" class="sp-arrow__btn" aria-label="${esc(p.label)}">
          <span class="sp-arrow__track"><i class="sp-arrow__fill"></i><i class="sp-arrow__knob"><i class="sp-arrow__tip"></i></i></span>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-arrow__btn');
    const track = k.$('.sp-arrow__track');
    const fill = k.$('.sp-arrow__fill');
    const knob = k.$('.sp-arrow__knob');
    const tip = k.$('.sp-arrow__tip');
    let on = false;
    let hover = false;
    let nudge;
    gsap.set(tip, { clipPath: RIGHT });
    gsap.set(fill, { scaleX: 0 });

    const point = () => {
      nudge?.kill();
      if (!hover || reducedMotion) return gsap.to(tip, { x: 0, duration: 0.3 });
      nudge = gsap.to(tip, { x: on ? -4 : 4, duration: 0.35, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    };
    k.on(btn, 'pointerenter', () => ((hover = true), point()));
    k.on(btn, 'pointerleave', () => ((hover = false), point()));
    k.on(btn, 'click', () => {
      on = !on;
      btn.setAttribute('aria-checked', String(on));
      const x = on ? track.clientWidth - knob.offsetWidth - knob.offsetLeft * 2 : 0;
      const t = reducedMotion ? 0 : Number(p.speed);
      nudge?.kill();
      gsap.set(tip, { x: 0 });
      gsap.timeline({ onComplete: point })
        .to(knob, { x, duration: t, ease: 'power3.inOut' })
        .to(knob, { keyframes: { scaleX: [1, 1.25, 0.92, 1], scaleY: [1, 0.85, 1.05, 1] }, transformOrigin: on ? '100% 50%' : '0% 50%', duration: t * 1.3, ease: 'none' }, 0)
        .to(fill, { scaleX: on ? 1 : 0, duration: t, ease: 'power3.inOut' }, 0)
        .to(tip, { clipPath: on ? LEFT : RIGHT, duration: t * 0.5, ease: 'power2.inOut' }, t * 0.5);
    });

    return () => (nudge?.kill(), k.destroy());
  },
};
