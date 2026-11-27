/** Lit Edge: a gradient button whose border carries a traveling light; hover speeds it up and adds a spotlight, click flashes the whole rim. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

const GLOWS = [
  { label: 'Tape', value: '#e8dcc0' },
  { label: 'Bone', value: '#fafaf7' },
  { label: 'Kraft core', value: '#d9c09a' },
  { label: 'Stamp red', value: '#e0674f' },
  { label: 'Sage', value: '#9fc196' },
  { label: 'Sky', value: '#8fb3dc' },
];

export const meta = {
  title: 'Lit Edge',
  element: 'Primary button',
  trigger: ['Load', 'Hover', 'Cursor move', 'Click'],
  behavior: ['Looping', 'Continuous', 'Hover-dependent', 'Pointer-tracking'],
  effect: ['Circling', 'Shimmering', 'Pulsating'],
  purpose: ['Affordance', 'Decoration', 'Feedback'],
  properties: ['Color', 'Border', 'Shadow'],
  description: 'A gradient button with a light running around its border and a soft glow behind it. Hovering speeds the light up and adds a spotlight that follows the cursor; clicking flashes the whole rim.',
  params: [
    { key: 'label', label: 'Label', group: 'Content', type: 'text', default: 'Get started' },
    { key: 'glow', label: 'Light color', group: 'Appearance', type: 'swatch', options: GLOWS, default: '#e8dcc0', css: '--sp-glow' },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Body color'),
    { key: 'edge', label: 'Border width', group: 'Shape', type: 'range', min: 1, max: 5, step: 0.5, unit: 'px', default: 2, css: '--sp-edge' },
    { key: 'lap', label: 'Lap time', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3.5, live: true },
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const text = labelsOf(p.label, ['Get started'])[0];
    k.html(`
      <div class="sp sp-lit">
        <button type="button" class="sp-lit__btn">
          <i class="sp-lit__glow"></i>
          <span class="sp-lit__body">${esc(text)}</span>
          <i class="sp-lit__ring"></i>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-lit__btn');
    const light = k.track({ a: 45, flash: 0 });
    const paint = () => {
      btn.style.setProperty('--a', `${light.a}deg`);
      btn.style.setProperty('--flash', light.flash);
    };
    paint();
    let orbit;
    const start = () => {
      orbit?.kill();
      if (reducedMotion) return;
      orbit = gsap.to(light, { a: '+=360', duration: Number(p.lap), ease: 'none', repeat: -1, onUpdate: paint });
    };
    start();

    k.on(btn, 'pointerenter', () => orbit && gsap.to(orbit, { timeScale: 3, duration: 0.5 }));
    k.on(btn, 'pointerleave', () => orbit && gsap.to(orbit, { timeScale: 1, duration: 0.8 }));
    k.on(btn, 'pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', `${e.clientX - r.left}px`);
      btn.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
    k.on(btn, 'click', () => {
      if (reducedMotion) return;
      gsap.fromTo(light, { flash: 1 }, { flash: 0, duration: 0.9, ease: 'power2.out', onUpdate: paint });
      gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
    });

    return { destroy: () => (orbit?.kill(), k.destroy()), update: (key) => key === 'lap' && start() };
  },
};
