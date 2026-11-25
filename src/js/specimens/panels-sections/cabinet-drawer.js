/** Cabinet Drawer: pull the drawer out of a paper cabinet; it rubber-bands at the end and snaps open or shut. */
import { kit, esc, labelsOf, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Cabinet Drawer',
  element: 'Drawer',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Snapping', 'Elastic', 'Boundary-aware', 'Toggle-dependent'],
  effect: ['Sliding', 'Stretching', 'Overshoot-motion', 'Rising'],
  purpose: ['Affordance', 'Storytelling', 'Delight'],
  properties: ['Position', 'Size', 'Order'],
  description: 'A drawer in a paper cabinet. Drag the handle down to pull it out; past the end it resists like a rubber band, and on release it snaps open or shut. Index cards pop up inside once it opens.',
  params: [
    { key: 'cards', label: 'Index cards', group: 'Content', type: 'text', default: 'A–F, G–L, M–R, S–Z' },
    { key: 'rubber', label: 'Rubber band', group: 'Behavior', type: 'range', min: 0, max: 1, step: 0.05, default: 0.35, live: true },
    { key: 'snap', label: 'Snap point', group: 'Behavior', type: 'range', min: 20, max: 80, step: 5, unit: '%', default: 40, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Cabinet color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const cards = labelsOf(p.cards, ['A–M', 'N–Z']).slice(0, 5);
    k.html(`
      <div class="sp sp-cab">
        <div class="sp-cab__box">
          <div class="sp-cab__tray sp-cab__drawer">${cards.map((c) => `<span class="sp-cab__card">${esc(c)}</span>`).join('')}</div>
          <i class="sp-cab__front" aria-hidden="true"></i>
          <div class="sp-cab__face sp-cab__drawer"><button type="button" class="sp-cab__handle" aria-expanded="false" aria-label="Open drawer"></button><small>Index</small></div>
        </div>
        <p class="sp-note">Drag the handle down · or click it</p>
      </div>`);
    const drawer = k.$$('.sp-cab__drawer'); // tray + face move together; the cabinet front hides the tray
    const tray = k.$('.sp-cab__tray');
    const handle = k.$('.sp-cab__handle');
    const cardEls = k.$$('.sp-cab__card');
    const box = k.$('.sp-cab__box');
    const max = () => box.offsetHeight - tray.offsetTop; // fully open = the tray's top reaches the cabinet's bottom edge
    let y = 0;
    let open = false;
    gsap.set(cardEls, { yPercent: 60 });

    const settle = (o) => {
      open = o;
      y = o ? max() : 0;
      handle.setAttribute('aria-expanded', String(o));
      handle.setAttribute('aria-label', o ? 'Close drawer' : 'Open drawer');
      const t = reducedMotion ? 0 : 0.7;
      // Opening overshoots a little (springy); closing must not, or the tray would poke out of the cabinet's top.
      gsap.to(drawer, { y, duration: t, ease: o ? 'back.out(1.6)' : 'power3.out' });
      gsap.to(cardEls, { yPercent: o ? 0 : 60, duration: t * 0.8, ease: 'back.out(2.5)', stagger: o ? 0.06 : 0, delay: o ? t * 0.3 : 0 });
    };

    let start = null;
    let moved = false;
    k.on(handle, 'pointerdown', (e) => {
      start = e.clientY - y;
      moved = false;
      handle.setPointerCapture(e.pointerId);
    });
    k.on(handle, 'pointermove', (e) => {
      if (start === null) return;
      let next = e.clientY - start;
      if (Math.abs(next - y) > 3) moved = true;
      const m = max();
      // Rubber band past the open end; the closed end is a hard stop (a drawer can't go further in).
      if (next > m) next = m + (next - m) * p.rubber;
      if (next < 0) next = 0;
      gsap.set(drawer, { y: next });
      handle.dataset.y = next;
    });
    const release = () => {
      if (start === null) return;
      start = null;
      if (!moved) return settle(!open);
      settle(Number(handle.dataset.y) > (max() * p.snap) / 100);
    };
    k.on(handle, 'pointerup', release);
    k.on(handle, 'pointercancel', release);
    k.on(handle, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), settle(!open)));

    return () => k.destroy();
  },
};
