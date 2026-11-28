/** Ellipse Date: the months ride an elliptical carousel above the calendar: step or drag and they travel round the ellipse, the front one large and in focus, the far side small and faint; the days below follow the front month. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { MONTHS, days, dayKeys, pickDay } from './_fi.js';

export const meta = {
  title: 'Ellipse Date',
  element: 'Date picker',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Cyclic', 'Draggable', 'Snapping'],
  effect: ['Elliptical-motion', 'Revolving', 'Scaling'],
  purpose: ['Navigation', 'Orientation', 'Delight'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A date picker whose month chooser is a carousel on an ellipse. The twelve months sit around a tilted oval: the one in front is big and dark, the ones behind shrink and fade. Press the arrows, use ←/→ on the carousel, or drag it sideways and every month travels round the ellipse to bring the next one to the front, snapping into place; the day grid below swaps to that month.',
  params: [
    { key: 'tilt', label: 'Ellipse height', group: 'Shape', type: 'range', min: 0.2, max: 1.6, step: 0.1, unit: 'em', default: 0.9, live: true },
    { key: 'time', label: 'Turn time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Pick'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-elp">
        <div class="sp-fi__cal sp-elp__cal">
          <div class="sp-elp__ring" role="slider" tabindex="0" aria-label="Month" aria-valuemin="1" aria-valuemax="12">
            <button type="button" class="sp-fi__nav sp-elp__nav" data-step="-1" aria-label="Previous month">‹</button>
            ${MONTHS.map((m) => `<b class="sp-elp__m">${m.slice(0, 3)}</b>`).join('')}
            <button type="button" class="sp-fi__nav sp-elp__nav" data-step="1" aria-label="Next month">›</button>
          </div>
          <div class="sp-elp__days"></div>
        </div>
      </div>`);
    const cal = k.$('.sp-elp__cal');
    const ring = k.$('.sp-elp__ring');
    const ms = k.$$('.sp-elp__m');
    const daysBox = k.$('.sp-elp__days');
    k.fit(cal);
    // Ring radius and em size are measured on resize only; place() runs every frame of a turn and reads nothing
    let R = 80, E = 14;
    k.resize(ring, () => { R = ring.offsetWidth * 0.5; E = parseFloat(getComputedStyle(ring).fontSize) || 14; place(); });
    // s.a is the carousel angle in "months"; month i sits at angle (i - a) × 30°, 0° = front
    const s = k.track({ a: 10 });
    function place() {
      const b = E * p.tilt;
      ms.forEach((m, i) => {
        const th = ((i - s.a) / 12) * Math.PI * 2;
        const z = Math.cos(th); // 1 front, −1 back
        // The back half sits higher, smaller and fades out completely, so only the near arc is readable
        const vis = Math.max(0, (z + 0.3) / 1.3) ** 1.6;
        gsap.set(m, { x: Math.sin(th) * R, y: z * b, scale: 0.5 + 0.5 * ((z + 1) / 2), opacity: vis, visibility: vis > 0.01 ? 'visible' : 'hidden', zIndex: Math.round(z * 10) + 10 });
      });
    }
    const front = () => ((Math.round(s.a) % 12) + 12) % 12;
    const render = () => {
      const m = front();
      daysBox.innerHTML = days(2026, m, { picked: m === 10 ? 18 : 0 });
      ring.setAttribute('aria-valuenow', m + 1);
      ring.setAttribute('aria-valuetext', `${MONTHS[m]} 2026`);
    };
    const turn = (to) => gsap.to(s, { a: to, duration: reducedMotion ? 0 : p.time, ease: 'back.out(1.4)', onUpdate: place, onComplete: render, overwrite: true });
    place();
    render();
    k.$$('.sp-elp__nav').forEach((b) => k.on(b, 'click', (e) => { e.stopPropagation(); turn(Math.round(s.a) + Number(b.dataset.step)); }));
    k.on(ring, 'keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (d && e.target === ring) e.preventDefault(), turn(Math.round(s.a) + d);
    });
    // Drag: the carousel follows the pointer, then snaps to the nearest month
    let x0 = null, a0 = 0;
    k.on(ring, 'pointerdown', (e) => { if (e.target.closest('button')) return; ring.setPointerCapture(e.pointerId); x0 = e.clientX; a0 = s.a; gsap.killTweensOf(s); });
    k.on(ring, 'pointermove', (e) => { if (x0 === null) return; s.a = a0 - (e.clientX - x0) / (R * 0.5); place(); });
    const drop = () => { if (x0 === null) return; x0 = null; turn(Math.round(s.a)); };
    k.on(ring, 'pointerup', drop);
    k.on(ring, 'pointercancel', drop);
    dayKeys(k, daysBox, (b) => pickDay(daysBox, b));
    return () => k.destroy();
  },
};
