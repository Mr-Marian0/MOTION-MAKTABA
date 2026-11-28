/** Ratchet Date: step the delivery date with a ratchet wheel: each click forward turns the toothed wheel one notch with a snap while the pawl drops into the next tooth; going back, the pawl lifts and the wheel creeps back slowly. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const meta = {
  title: 'Ratchet Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard', 'Long-press'],
  behavior: ['Discrete', 'Direction-aware', 'Snapping'],
  effect: ['Ratcheting', 'Mechanical-rotation', 'Snapping'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Rotation', 'Position'],
  description: 'A delivery-date stepper driven by a ratchet. Each "later" click advances the toothed wheel one tooth in a quick snap; the spring pawl rides up the tooth and clicks down behind it, and the date steps a day forward. "Earlier" has to lift the pawl first, then the wheel creeps back a tooth slowly. Hold a button to keep ratcheting; ↑/↓ work too.',
  params: [
    { key: 'teeth', label: 'Teeth', group: 'Shape', type: 'range', min: 8, max: 24, step: 1, unit: '', default: 14 },
    { key: 'snap', label: 'Snap time', group: 'Motion', type: 'range', min: 0.05, max: 0.4, step: 0.01, unit: 's', default: 0.12, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Brass'),
  ],
};

/** A ratchet wheel: n asymmetric teeth (steep on one side, sloped on the other). */
const wheel = (n) => {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 0.85) / n) * Math.PI * 2;
    pts.push([Math.cos(a) * 36, Math.sin(a) * 36], [Math.cos(b) * 46, Math.sin(b) * 46], [Math.cos(b) * 36, Math.sin(b) * 36]);
  }
  return `M${pts.map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L')} Z`;
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const n = Math.round(p.teeth);
    k.html(`
      <div class="sp sp-fi sp-rat">
        <div class="sp-rat__body">
          <svg class="sp-rat__mech" viewBox="-60 -60 120 120" aria-hidden="true">
            <g class="sp-rat__wheel"><path d="${wheel(n)}" /><circle r="10" /></g>
            <path class="sp-rat__pawl" d="M30 -54 L58 -54 L58 -48 L40 -46 Z" />
            <circle class="sp-rat__pin" cx="56" cy="-51" r="3" />
          </svg>
          <div class="sp-rat__side">
            <span class="sp-fi__label">Deliver on</span>
            <output class="sp-rat__date" aria-live="polite"></output>
            <div class="sp-rat__btns"><button type="button" class="sp-fi__btn sp-fi__btn--ghost" data-step="-1">− Earlier</button><button type="button" class="sp-fi__btn" data-step="1">Later +</button></div>
          </div>
        </div>
      </div>`);
    const wheelG = k.$('.sp-rat__wheel');
    const pawl = k.$('.sp-rat__pawl');
    const out = k.$('.sp-rat__date');
    gsap.set(wheelG, { svgOrigin: '0 0' });
    gsap.set(pawl, { svgOrigin: '56 -51' });
    const date = new Date(2026, 10, 30);
    const min = new Date(2026, 10, 28);
    const show = () => (out.value = `${DAYS[date.getDay()]} ${date.getDate()} ${MON[date.getMonth()]}`);
    show();
    let angle = 0;
    const step = (dir) => {
      const next = new Date(date);
      next.setDate(date.getDate() + dir);
      if (next < min) {
        // Extra: the wheel can't go before the earliest date: it jams against the pawl with a shudder
        if (!reducedMotion) gsap.fromTo(wheelG, { rotation: angle }, { keyframes: { rotation: [angle - 3, angle + 1, angle] }, duration: 0.25 });
        return;
      }
      date.setTime(next.getTime());
      show();
      angle += (dir * 360) / n;
      if (reducedMotion) return gsap.set(wheelG, { rotation: angle });
      const tl = gsap.timeline();
      if (dir > 0) {
        // forward: a quick snap; the pawl rides up the slope and clicks down
        tl.to(wheelG, { rotation: angle, duration: p.snap, ease: 'power3.in' })
          .to(pawl, { rotation: -14, duration: p.snap * 0.8, ease: 'power1.out' }, 0)
          .to(pawl, { rotation: 0, duration: 0.12, ease: 'bounce.out' });
      } else {
        // back: lift the pawl, creep the wheel back, drop the pawl
        tl.to(pawl, { rotation: -22, duration: 0.12 })
          .to(wheelG, { rotation: angle, duration: p.snap * 3, ease: 'power1.inOut' })
          .to(pawl, { rotation: 0, duration: 0.12, ease: 'bounce.out' });
      }
    };
    // Hold to repeat: first step at once, then every 0.18 s after a short wait
    let hold;
    k.$$('[data-step]').forEach((b) => {
      const dir = Number(b.dataset.step);
      k.on(b, 'pointerdown', () => { hold?.kill(); hold = gsap.delayedCall(0.45, function rep() { step(dir); hold = gsap.delayedCall(0.18, rep); }); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => k.on(b, ev, () => hold?.kill()));
      k.on(b, 'click', () => step(dir));
      k.on(b, 'keydown', (e) => { const d = { ArrowUp: 1, ArrowDown: -1 }[e.key]; if (d) e.preventDefault(), step(d); });
    });
    return () => { hold?.kill(); k.destroy(); };
  },
};
