/** Lanyard Avatar: a conference badge with the avatar hanging on a rope lanyard: drag the badge and the rope bends and follows; let go and it swings back under the clip, the rope rippling as it settles. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { face, NAMES } from './_tm.js';

export const meta = {
  title: 'Lanyard Avatar',
  element: 'Avatar',
  trigger: ['Drag', 'Keyboard', 'Hover'],
  behavior: ['Draggable', 'Physics-driven', 'Gravity-driven'],
  effect: ['Rope-motion', 'Pendulum-motion', 'Damped-oscillation'],
  purpose: ['Delight', 'Storytelling', 'Branding'],
  properties: ['Path', 'Position', 'Rotation'],
  description: 'A speaker badge on a lanyard. The badge (with the avatar and name) hangs from a clip on a rope made of linked segments. Grab it and drag: the rope follows, segment pulling segment, sagging and bending; release and the badge swings back under the clip like a pendulum, the rope rippling until everything hangs still. ←/→ give it a push.',
  params: [
    { key: 'links', label: 'Rope links', group: 'Shape', type: 'range', min: 4, max: 16, step: 1, unit: '', default: 10 },
    { key: 'gravity', label: 'Gravity', group: 'Motion', type: 'range', min: 200, max: 2000, step: 50, unit: '', default: 900, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Lanyard'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const L = Math.round(p.links);
    k.html(`
      <div class="sp sp-tm sp-lan">
        <svg class="sp-lan__rope" aria-hidden="true"><polyline /></svg>
        <i class="sp-lan__clip" aria-hidden="true"></i>
        <div class="sp-lan__badge" tabindex="0" role="img" aria-label="Speaker badge: ${NAMES[1]} (drag, or ← → to swing)">${face(1, 'sp-lan__face')}<b>${NAMES[1]}</b><small>Speaker</small></div>
      </div>`);
    const root = k.$('.sp-lan');
    const svg = k.$('.sp-lan__rope');
    const line = k.$('.sp-lan__rope polyline');
    const badge = k.$('.sp-lan__badge');
    // Verlet rope: points from the clip (pinned) to the badge (the last point, which the badge follows)
    let W = 300, H = 280, anchor = [150, 20], seg = 12;
    const pts = [];
    const reset = () => {
      W = root.offsetWidth; H = root.offsetHeight;
      anchor = [W / 2, H * 0.08];
      seg = (H * 0.34) / L;
      svg.setAttribute('width', W); svg.setAttribute('height', H);
      pts.length = 0;
      for (let i = 0; i <= L; i++) pts.push({ x: anchor[0], y: anchor[1] + i * seg, px: anchor[0], py: anchor[1] + i * seg });
    };
    let held = null, running = false, still = 0;
    const draw = () => {
      line.setAttribute('points', pts.map((q) => `${q.x.toFixed(1)},${q.y.toFixed(1)}`).join(' '));
      const end = pts[L], prev = pts[L - 1];
      gsap.set(badge, { x: end.x - W / 2, y: end.y - anchor[1] - L * seg, rotation: (Math.atan2(end.x - prev.x, end.y - prev.y) * -180) / Math.PI * 0.7 });
    };
    const tick = (t, ms) => {
      const dt = Math.min(0.033, ms / 1000);
      let motion = 0;
      pts.forEach((q, i) => {
        if (i === 0) return;
        if (i === L && held) { q.px = q.x; q.py = q.y; q.x = held[0]; q.y = held[1]; return; }
        const vx = (q.x - q.px) * 0.985, vy = (q.y - q.py) * 0.985;
        q.px = q.x; q.py = q.y;
        q.x += vx; q.y += vy + p.gravity * dt * dt;
        motion += Math.abs(vx) + Math.abs(vy);
      });
      for (let it = 0; it < 6; it++) for (let i = 0; i < L; i++) {
        const a = pts[i], b = pts[i + 1];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, diff = (d - seg) / d;
        if (i === 0) { b.x -= dx * diff; b.y -= dy * diff; }
        else if (i + 1 === L && held) { a.x += dx * diff; a.y += dy * diff; }
        else { a.x += dx * diff * 0.5; a.y += dy * diff * 0.5; b.x -= dx * diff * 0.5; b.y -= dy * diff * 0.5; }
      }
      pts[0].x = anchor[0]; pts[0].y = anchor[1];
      draw();
      // sleep when it has settled (and isn't held)
      still = !held && motion < 0.05 * L ? still + 1 : 0;
      if (still > 20) { gsap.ticker.remove(tick); running = false; }
    };
    const wake = () => { if (!running && !reducedMotion) running = true, still = 0, gsap.ticker.add(tick); };
    k.resize(root, () => { reset(); draw(); });
    let box;
    k.on(badge, 'pointerdown', (e) => { badge.setPointerCapture(e.pointerId); box = root.getBoundingClientRect(); held = [e.clientX - box.left, e.clientY - box.top]; wake(); });
    k.on(badge, 'pointermove', (e) => box && (held = [e.clientX - box.left, e.clientY - box.top]));
    const drop = () => { box = null; held = null; };
    k.on(badge, 'pointerup', drop);
    k.on(badge, 'pointercancel', drop);
    k.on(badge, 'keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (!d) return; e.preventDefault(); pts[L].px -= d * 14; pts[L - 1].px -= d * 8; wake(); });
    // Extra: hovering gives the badge a tiny nudge
    k.on(badge, 'pointerenter', () => { if (!held) { pts[L].px -= 3; wake(); } });
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
