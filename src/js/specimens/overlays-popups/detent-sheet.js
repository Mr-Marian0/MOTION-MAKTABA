/** Detent Sheet: a bottom sheet that snaps to peek / half / full; fling it by speed; the page behind sinks back. */
import { kit, bars, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Three-stop Bottom Sheet',
  element: 'Bottom sheet',
  trigger: ['Drag', 'Swipe', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Snap-to-position', 'Velocity-aware', 'Elastic', 'Boundary-aware'],
  effect: ['Sliding', 'Spring-motion', 'Overshoot-motion', 'Contracting'],
  purpose: ['Focus', 'Hierarchy', 'Continuity'],
  properties: ['Position', 'Scale', 'Radius'],
  description: 'A phone-style bottom sheet with three stops: peek, half and full. Drag the handle and let go; it snaps to the nearest stop, or follows a quick flick. Past the top it stretches like a rubber band, and the page behind sinks back as the sheet rises. Click the handle (or press arrows) to step.',
  params: [
    { key: 'rubber', label: 'Rubber band', group: 'Behavior', type: 'range', min: 0, max: 0.6, step: 0.05, default: 0.25, live: true },
    { key: 'flick', label: 'Flick speed', group: 'Behavior', type: 'range', min: 0.2, max: 2, step: 0.1, default: 0.6, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Handle color'),
  ],
};

const STOPS = ['Peek', 'Half', 'Full'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-sheet">
        <div class="sp-sheet__phone">
          <div class="sp-sheet__page"><b>Route to the bindery</b>${bars(6)}</div>
          <section class="sp-sheet__panel" aria-label="Details">
            <button type="button" class="sp-sheet__handle" aria-label="Sheet: Peek. Click or use arrows to resize"><i></i></button>
            <h4>Bindery, 12 min</h4>${bars(8)}
          </section>
        </div>
      </div>`);
    const phone = k.$('.sp-sheet__phone');
    const page = k.$('.sp-sheet__page');
    const panel = k.$('.sp-sheet__panel');
    const handle = k.$('.sp-sheet__handle');
    // y offsets of the panel for each stop (its top edge measured from the phone's top).
    const ys = () => {
      const H = phone.clientHeight;
      return [H * 0.78, H * 0.45, H * 0.08];
    };
    let stop = 0;
    let y = 0;
    const sink = (yy) => {
      const [peek, , full] = ys();
      const t = clamp((peek - yy) / (peek - full), 0, 1);
      gsap.set(page, { scale: 1 - t * 0.08, opacity: 1 - t * 0.4, borderRadius: `${t * 1.2}em` });
    };
    const snap = (i) => {
      stop = clamp(i, 0, 2);
      y = ys()[stop];
      handle.setAttribute('aria-label', `Sheet: ${STOPS[stop]}. Click or use arrows to resize`);
      gsap.to(panel, { y, duration: reducedMotion ? 0 : 0.55, ease: 'back.out(1.2)', onUpdate: () => sink(gsap.getProperty(panel, 'y')) });
    };
    k.resize(phone, () => (gsap.set(panel, { y: ys()[stop] }), (y = ys()[stop]), sink(y)));

    let start = null;
    let moved = false;
    let last = { y: 0, t: 0, v: 0 };
    k.on(handle, 'pointerdown', (e) => {
      start = e.clientY - y;
      moved = false;
      last = { y: e.clientY, t: performance.now(), v: 0 };
      handle.setPointerCapture(e.pointerId);
    });
    k.on(handle, 'pointermove', (e) => {
      if (start === null) return;
      const now = performance.now();
      last = { y: e.clientY, t: now, v: (e.clientY - last.y) / Math.max(1, now - last.t) };
      let next = e.clientY - start;
      if (Math.abs(next - y) > 3) moved = true;
      const [peek, , full] = ys();
      if (next < full) next = full - (full - next) * p.rubber; // rubber band past the top
      next = Math.min(next, peek + 30);
      gsap.set(panel, { y: next });
      sink(next);
      handle.dataset.y = next;
    });
    k.on(handle, 'pointerup', () => {
      if (start === null) return;
      start = null;
      if (!moved) return snap((stop + 1) % 3);
      if (Math.abs(last.v) > p.flick) return snap(stop + (last.v < 0 ? 1 : -1)); // a flick moves one stop
      const cur = Number(handle.dataset.y);
      const d = ys().map((s) => Math.abs(s - cur));
      snap(d.indexOf(Math.min(...d)));
    });
    k.on(handle, 'click', (e) => e.detail === 0 && snap((stop + 1) % 3)); // keyboard Enter/Space (pointer clicks are handled on pointerup)
    k.on(handle, 'keydown', (e) => {
      const step = { ArrowUp: 1, ArrowDown: -1 }[e.key];
      if (step) e.preventDefault(), snap(stop + step);
    });

    return () => k.destroy();
  },
};
