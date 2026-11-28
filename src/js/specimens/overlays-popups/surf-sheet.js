/** Surf Sheet: the bottom sheet's top edge is a water surface: when it surges up, waves roll along that edge and calm down; drag the sheet and the surface ripples with your speed. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Surf Sheet',
  element: 'Bottom sheet',
  trigger: ['Click', 'Drag', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Velocity-aware', 'Draggable', 'Elastic'],
  effect: ['Surface-wave', 'Traveling-wave', 'Damped-oscillation'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Path', 'Shape', 'Position'],
  description: 'A bottom sheet with a liquid top edge. When it surges up, waves roll along its surface from one side to the other and calm down as it settles. Grab the handle and drag: the faster you move it, the bigger the waves running across the surface; let go and they die away.',
  params: [
    { key: 'height', label: 'Wave height', group: 'Shape', type: 'range', min: 0.5, max: 4, step: 0.25, unit: '', default: 2, live: true },
    { key: 'speed', label: 'Wave speed', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: '×', default: 1.5, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-srf', `
      <div class="sp-srf__sheet" role="dialog" aria-label="Water log">
        <svg class="sp-srf__svg" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
        <div class="sp-srf__body"><i class="sp-srf__grip"></i><span class="sp-ov__kick">Water today</span><b class="sp-ov__title">1.6 of 2 litres</b></div>
      </div>`, { label: 'Log water', title: 'Health' }));
    const sheet = k.$('.sp-srf__sheet');
    const path = k.$('.sp-srf__svg path');
    const grip = k.$('.sp-srf__grip');
    const s = k.track({ amp: 0, ph: 0 });
    gsap.set(sheet, { yPercent: 105 });
    // A travelling wave along the top edge: y = 10 + A·sin(kx − φ), φ advancing while there is any amplitude.
    const draw = () => path.setAttribute('d', `M0 20 L${Array.from({ length: 41 }, (_, i) => `${i * 2.5} ${(10 + Math.sin(i * 0.45 - s.ph) * s.amp).toFixed(2)}`).join(' L')} L100 20 Z`);
    draw();
    let roll = null;
    const rolling = () => {
      if (roll || reducedMotion) return;
      roll = gsap.to(s, { ph: '+=6.283', duration: 1, ease: 'none', repeat: -1, onUpdate: draw });
      roll.timeScale(p.speed);
    };
    const calm = (from, d = 1.6) => {
      rolling();
      gsap.fromTo(s, { amp: from }, { amp: 0, duration: d, ease: 'power2.out', overwrite: 'auto', onUpdate: draw, onComplete: () => (roll?.kill(), (roll = null)) });
    };
    toggle(k, gsap, { reducedMotion }, (open) => {
      if (open) calm(p.height * 2.5);
      return gsap.timeline().to(sheet, { yPercent: open ? 0 : 105, duration: 0.6, ease: open ? 'power3.out' : 'power2.in' });
    }, ['Log water', 'Close']);
    // Dragging: the surface's wave height follows how fast the sheet is moved
    let drag = null;
    k.on(grip, 'pointerdown', (e) => { grip.setPointerCapture(e.pointerId); drag = { y: e.clientY, last: e.clientY, h: sheet.offsetHeight }; rolling(); });
    k.on(grip, 'pointermove', (e) => {
      if (!drag) return;
      const v = Math.abs(e.clientY - drag.last);
      drag.last = e.clientY;
      gsap.set(sheet, { yPercent: clamp(((e.clientY - drag.y) / drag.h) * 100, -10, 60) });
      gsap.to(s, { amp: clamp(v * 0.4 * p.height, 0, p.height * 3), duration: 0.2, overwrite: 'auto', onUpdate: draw });
    });
    k.on(window, 'pointerup', () => {
      if (!drag) return;
      drag = null;
      gsap.to(sheet, { yPercent: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      calm(Math.max(s.amp, p.height));
    });
    return { destroy: () => { roll?.kill(); k.destroy(); }, update: (key) => key === 'speed' && roll?.timeScale(p.speed) };
  },
};
