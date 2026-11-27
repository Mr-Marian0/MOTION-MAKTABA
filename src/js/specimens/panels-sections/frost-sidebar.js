/** Frost Sidebar: "Pause" freezes the live notifications sidebar: frost grows in from its edges, crystals branch across, and the incoming feed slows to a stop. "Thaw" brings it back. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';
import { seeded } from '../cards-containers/_shape.js';

export const meta = {
  title: 'Frost Sidebar',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Auto-playing', 'Pausable', 'Resumable'],
  effect: ['Freezing', 'Crystallization', 'Decelerating'],
  purpose: ['Feedback', 'Storytelling'],
  properties: ['Color', 'Clip & mask', 'Path', 'Opacity'],
  description: 'A sidebar where notifications keep sliding in. Pause them and the panel freezes over: frost grows in from its edges, ice crystals branch across it, and the stream of new notes slows down and stops. Thaw and the frost recedes as the feed picks up speed again.',
  params: [
    { key: 'time', label: 'Freeze time', group: 'Motion', type: 'range', min: 0.6, max: 4, step: 0.2, unit: 's', default: 1.8, live: true },
    { key: 'every', label: 'New item every', group: 'Behavior', type: 'range', min: 0.6, max: 3, step: 0.2, unit: 's', default: 1.4 },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sidebar'),
  ],
};

const MSGS = ['Mei liked your sketch', 'New comment on “Folds”', 'Bo started following you', 'Export ready', 'Ana shared a board', 'Weekly digest is out'];

/** Branching ice from (x, y) heading at angle a, in 0–100 units. */
function crystal(r, x, y, a) {
  let d = '';
  const arm = (px, py, ang, len, depth) => {
    const [ex, ey] = [px + Math.cos(ang) * len, py + Math.sin(ang) * len];
    d += `M${px.toFixed(1)} ${py.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
    if (depth > 1) return;
    [0.35, 0.65].forEach((t, i) => arm(px + (ex - px) * t, py + (ey - py) * t, ang + (i ? 1 : -1) * (0.8 + r() * 0.3), len * 0.4, depth + 1));
  };
  arm(x, y, a, 22 + r() * 12, 0);
  return d;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const r = seeded(5);
    const ice = [[0, 5, 0.6], [100, 20, 2.6], [0, 60, -0.3], [100, 85, -2.6], [50, 100, -1.5]].map(([x, y, a]) => crystal(r, x, y, a));
    k.html(`
      <div class="sp sp-pn sp-frs">
        <div class="sp-pn__page sp-frs__page"><span class="sp-pn__kick">Home</span><b class="sp-pn__h">Today</b>${bars(6)}</div>
        <aside class="sp-frs__side">
          <span class="sp-pn__kick">Notifications</span>
          <div class="sp-frs__feed" aria-live="off"></div>
          <i class="sp-frs__frost"></i>
          <svg class="sp-frs__ice" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${ice.map((d) => `<path d="${d}" pathLength="1" />`).join('')}</svg>
        </aside>
        <button type="button" class="sp-pn__btn sp-frs__btn" aria-pressed="false">Pause</button>
      </div>`);
    const side = k.$('.sp-frs__side');
    const feed = k.$('.sp-frs__feed');
    const paths = k.$$('.sp-frs__ice path');
    const btn = k.$('.sp-frs__btn');
    gsap.set(side, { '--f': 0 });
    gsap.set(paths, { strokeDasharray: '1 2', strokeDashoffset: 1 });
    let n = 0;

    // The live feed: a new note slides in at the top, the oldest drops off. Freezing slows this to a stop.
    const add = () => {
      const el = document.createElement('div');
      el.className = 'sp-frs__note';
      el.innerHTML = `<i></i>${MSGS[n++ % MSGS.length]}`;
      feed.prepend(el);
      gsap.from(el, { height: 0, autoAlpha: 0, x: '2em', duration: 0.5, ease: 'back.out(1.6)' });
      [...feed.children].slice(4).forEach((old) => old.remove());
    };
    for (let i = 0; i < 3; i++) add();
    const live = gsap.timeline({ repeat: -1 }).add(add, p.every);
    if (reducedMotion) live.pause();

    k.on(btn, 'click', () => {
      const frozen = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(frozen));
      btn.textContent = frozen ? 'Thaw' : 'Pause';
      const t = reducedMotion ? 0 : p.time;
      gsap.to(side, { '--f': frozen ? 1 : 0, duration: t, ease: frozen ? 'power1.out' : 'power2.in' });
      gsap.to(paths, { strokeDashoffset: frozen ? 0 : 1, duration: t * 0.8, stagger: t * 0.05, delay: frozen ? t * 0.15 : 0 });
      // The feed's clock slows to a halt (no new notes), or speeds back up.
      if (!reducedMotion) gsap.to(live, { timeScale: frozen ? 0 : 1, duration: frozen ? t : 0.6, ease: 'power2.out', delay: frozen ? 0 : t * 0.5 });
      if (frozen && !reducedMotion) gsap.fromTo(side, { x: 0 }, { keyframes: { x: [-2, 2, -1, 0] }, duration: 0.3, delay: t, ease: 'none' });
    });

    return () => { live.kill(); k.destroy(); };
  },
};
