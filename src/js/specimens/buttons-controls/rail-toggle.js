/** Rail Toggle: a heavy block slides along a rail, leaning into the move; its status light turns from red to green on arrival. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

const LEDS = [
  { label: 'Signal green', value: '#3fae4a' },
  { label: 'Amber', value: '#e0a43a' },
  { label: 'Sky', value: '#5aa0e0' },
  { label: 'Bone', value: '#fafaf7' },
];

export const meta = {
  title: 'Rail Toggle',
  element: 'Toggle',
  trigger: ['Hover', 'Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Inertial'],
  effect: ['Sliding', 'Shearing', 'Follow-through', 'Pulsating'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Position', 'Color', 'Shadow'],
  description: 'A block on a rail with a status light. Clicking slides the block to the other end: it leans back as it starts, tips forward as it stops, and the light hops to its other corner, turning from red to green with a blink. The OFF and ON labels swap sides.',
  params: [
    { key: 'labels', label: 'Labels', group: 'Content', type: 'text', default: 'Off, On' },
    { key: 'led', label: 'On light', group: 'Appearance', type: 'swatch', options: LEDS, default: '#3fae4a', css: '--sp-led' },
    { key: 'lean', label: 'Lean', group: 'Motion', type: 'range', min: 0, max: 16, step: 1, unit: '°', default: 8, live: true },
    { key: 'speed', label: 'Slide time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.6, live: true },
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const [off, on = 'On'] = labelsOf(p.labels, ['Off', 'On']);
    k.html(`
      <div class="sp sp-rail">
        <button type="button" role="switch" aria-checked="false" class="sp-rail__btn" aria-label="${esc(on)}">
          <span class="sp-rail__lbl sp-rail__lbl--off" aria-hidden="true">${esc(off)}</span>
          <span class="sp-rail__lbl sp-rail__lbl--on" aria-hidden="true">${esc(on)}</span>
          <i class="sp-rail__block"><i class="sp-rail__led"></i></i>
          <i class="sp-rail__rail"></i>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-rail__btn');
    const block = k.$('.sp-rail__block');
    const led = k.$('.sp-rail__led');
    let isOn = false;
    const end = () => (isOn ? btn.clientWidth - block.offsetWidth : 0);

    k.on(btn, 'pointerenter', () => !reducedMotion && gsap.to(block, { x: end() + (isOn ? -6 : 6), duration: 0.3, ease: 'power2.out', overwrite: 'auto' }));
    k.on(btn, 'pointerleave', () => !reducedMotion && gsap.to(block, { x: end(), duration: 0.4, ease: 'back.out(2)', overwrite: 'auto' }));
    k.on(btn, 'click', () => {
      isOn = !isOn;
      btn.setAttribute('aria-checked', String(isOn));
      if (reducedMotion) return gsap.set(block, { x: end() });
      const t = Number(p.speed);
      const dir = isOn ? 1 : -1;
      const lean = Number(p.lean);
      led.style.transitionDelay = `${t * 0.8}s`;
      gsap.killTweensOf(block);
      gsap.timeline()
        .to(block, { skewX: dir * lean, duration: 0.15, ease: 'power2.out' }) // leans back: the base starts first
        .to(block, { x: end(), duration: t, ease: 'power3.inOut' }, '<0.05')
        .to(block, { skewX: -dir * lean * 0.7, duration: 0.12, ease: 'power2.out' }, '-=0.12') // top keeps going
        .to(block, { skewX: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)' })
        .fromTo(led, { opacity: 0.2 }, { opacity: 1, duration: 0.08, repeat: 3, yoyo: true, ease: 'none' }, '<');
    });

    return () => k.destroy();
  },
};
