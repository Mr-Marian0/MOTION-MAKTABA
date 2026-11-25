/**Elastic Sidebar: drag it out; the edge bulges, then snaps and wobbles. */
import { kit, bars, clamp } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Elastic Sidebar',
  element: 'Sidebar',
  trigger: ['Drag', 'Click'],
  behavior: ['Draggable', 'Elastic', 'Snapping', 'Gesture-driven'],
  effect: ['Elastic-deformation', 'Bulging', 'Damped-oscillation'],
  purpose: ['Navigation', 'Affordance', 'Delight'],
  properties: ['Size', 'Shape', 'Path'],
  description: 'Drag the sidebar out from the left edge. Its edge bulges toward your pointer, then snaps open or shut and wobbles to a stop.',
  params: [
    tone('#a07a52', 'fill', '--sp-fill', 'Panel color'),
    { key: 'elasticity', label: 'Wobble', group: 'Motion', type: 'range', min: 0.1, max: 1, step: 0.05, default: 0.6, live: true },
    { key: 'bulge', label: 'Bulge', group: 'Shape', type: 'range', min: 0, max: 1.6, step: 0.1, default: 1, live: true },
    { key: 'threshold', label: 'Snap-open point', group: 'Behavior', type: 'range', min: 0.1, max: 0.9, step: 0.05, default: 0.4, live: true },
  ],
};

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-elastic">
        <div class="sp-elastic__page">
          <p class="sp-note sp-note--inline">Drag from the left edge → or tap the tab</p>
          ${bars(6)}
        </div>
        <svg class="sp-elastic__shape" aria-hidden="true"><path /></svg>
        <nav class="sp-elastic__panel" aria-label="Specimen sidebar">
          <b>Index</b>
          <ul>${['Work', 'Lab', 'Notes', 'Archive', 'About'].map((l) => `<li><a href="#">${l}</a></li>`).join('')}</ul>
        </nav>
        <button class="sp-elastic__tab" type="button" aria-expanded="false" aria-label="Open sidebar">≡</button>
      </div>`);

    const root = k.$('.sp-elastic');
    const path = k.$('.sp-elastic__shape path');
    const panel = k.$('.sp-elastic__panel');
    const tab = k.$('.sp-elastic__tab');
    const items = k.$$('.sp-elastic__panel li');

    const s = k.track({ w: 0, bulge: 0, py: 0 });
    let W = 200; // open width
    let H = 300;
    let isOpen = false;

    const render = () => {
      const { w, bulge, py } = s;
      // Straight top and bottom, curved right edge pulled toward the pointer.
      path.setAttribute('d', `M0 0 H${w} Q${w + bulge * 2} ${py} ${w} ${H} H0 Z`);
      panel.style.clipPath = `inset(0 ${Math.max(0, W - w)}px 0 0)`;
      panel.style.opacity = clamp(w / W, 0, 1);
      tab.style.transform = `translateX(${w}px)`;
    };
    const measure = () => {
      const r = root.getBoundingClientRect();
      W = Math.min(r.width * 0.45, 240);
      H = r.height;
      panel.style.width = `${W}px`;
      if (!gsap.isTweening(s)) {
        s.w = isOpen ? W : 0;
        s.py = H / 2;
      }
      render();
    };
    k.resize(root, measure);

    const settle = (open, kick = 0) => {
      isOpen = open;
      tab.setAttribute('aria-expanded', String(open));
      const period = 0.95 - Number(p.elasticity) * 0.7; // shorter period = more wobble
      gsap.killTweensOf(s);
      if (kick) s.bulge = kick;
      gsap.to(s, { w: open ? W : 0, duration: 1.1, ease: `elastic.out(1, ${period})`, onUpdate: render });
      gsap.to(s, { bulge: 0, duration: 1.3, ease: `elastic.out(1.2, ${period})`, onUpdate: render });
      if (open) gsap.fromTo(items, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out', stagger: 0.05, delay: 0.15 });
    };

    // ---- Dragging ----
    let drag = null;
    k.on(root, 'pointerdown', (e) => {
      const r = root.getBoundingClientRect();
      const x = e.clientX - r.left;
      // Only grab near the panel's edge (or the tab), so links stay clickable.
      if (isOpen ? Math.abs(x - s.w) > 44 : x > 52) return;
      drag = { x0: x, moved: false, left: r.left, top: r.top };
      root.setPointerCapture(e.pointerId);
      gsap.killTweensOf(s);
    });
    k.on(root, 'pointermove', (e) => {
      if (!drag) return;
      const x = clamp(e.clientX - drag.left, 0, W * 1.7);
      if (Math.abs(x - drag.x0) > 4) drag.moved = true;
      s.w = Math.min(x * 0.82, W);
      s.bulge = (x - s.w) * Number(p.bulge);
      s.py = clamp(e.clientY - drag.top, 0, H);
      render();
    });
    const release = () => {
      if (!drag) return;
      const tap = !drag.moved;
      drag = null;
      if (tap) settle(!isOpen, isOpen ? 0 : 40 * Number(p.bulge));
      else settle(s.w > W * Number(p.threshold));
    };
    k.on(root, 'pointerup', release);
    k.on(root, 'pointercancel', release);
    k.on(tab, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), settle(!isOpen, 40)));
    items.forEach((li) => k.on(li.firstElementChild, 'click', (e) => e.preventDefault()));

    return () => k.destroy();
  },
};
