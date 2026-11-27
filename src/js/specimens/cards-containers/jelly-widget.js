/** Jelly Widget: a widget with a soft body. Its outline is eight points on springs: drag it and the far side lags and wobbles; let go and it jiggles back into shape. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Jelly Widget',
  element: 'Widget',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Physics-driven', 'Spring-driven', 'Elastic', 'Self-centering'],
  effect: ['Soft-body-deformation', 'Wobbling', 'Spring-motion', 'Follow-through'],
  purpose: ['Delight', 'Feedback', 'Affordance'],
  properties: ['Shape', 'Path', 'Position'],
  description: 'A habit widget with a soft body. Its outline is held by eight points on springs: drag it and the points nearest your finger follow first while the far side lags, stretches and catches up. Let go and it jiggles back to its spot. A click pokes it.',
  params: [
    { key: 'stiff', label: 'Stiffness', group: 'Motion', type: 'range', min: 0.02, max: 0.2, step: 0.01, unit: '', default: 0.07, live: true },
    { key: 'damp', label: 'Damping', group: 'Motion', type: 'range', min: 0.04, max: 0.3, step: 0.01, unit: '', default: 0.1, live: true },
    { key: 'reach', label: 'Max drag', group: 'Behavior', type: 'range', min: 2, max: 8, step: 0.5, unit: 'em', default: 5, live: true },
    tone('#4f6b4a'),
  ],
};

const [HW, HH] = [70, 45]; // half size in SVG units (10 per em)
const REST = [[0, -HH], [HW, -HH], [HW, 0], [HW, HH], [0, HH], [-HW, HH], [-HW, 0], [-HW, -HH]];

/** A rounded outline through the 8 points: straight edges, quadratic curves at the corners (odd points). */
function path(P) {
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let c = 1; c < 8; c += 2) {
    const [a, b] = [lerp(P[c], P[c - 1], 0.3), lerp(P[c], P[(c + 1) % 8], 0.3)];
    d += ` L${a[0]} ${a[1]} Q${P[c][0]} ${P[c][1]} ${b[0]} ${b[1]} L${P[(c + 1) % 8][0]} ${P[(c + 1) % 8][1]}`;
  }
  return `${d} Z`;
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-jly">
        <div class="sp-jly__wrap" tabindex="0" role="img" aria-label="Habit widget: drag it or use arrow keys to jiggle it">
          <svg class="sp-jly__svg" viewBox="-100 -80 200 160" aria-hidden="true"><path class="sp-jly__shadow" /><path class="sp-jly__skin" /></svg>
          <div class="sp-jly__body">
            <span class="sp-cc__kick">Daily sketch</span>
            <b class="sp-cc__big">12<small> day streak</small></b>
            <span class="sp-jly__dots">${Array.from({ length: 7 }, (_, i) => `<i class="${i < 5 ? 'is-on' : ''}"></i>`).join('')}</span>
          </div>
        </div>
        <p class="sp-note">Drag it · poke it</p>
      </div>`);
    const wrap = k.$('.sp-jly__wrap');
    const [shadow, skin] = k.$$('.sp-jly__svg path');
    const body = k.$('.sp-jly__body');
    k.fit(wrap, 0.8);
    const pos = REST.map((r) => [...r]);
    const vel = REST.map(() => [0, 0]);
    let off = [0, 0]; // where the widget is being pulled to
    let grab = [0, 0]; // the rest point nearest the finger
    let running = false;

    const render = () => {
      const d = path(pos);
      skin.setAttribute('d', d);
      shadow.setAttribute('d', d);
      const cx = pos.reduce((a, q) => a + q[0], 0) / 8;
      const cy = pos.reduce((a, q) => a + q[1], 0) / 8;
      const tilt = Math.atan2(pos[1][1] - pos[7][1], pos[1][0] - pos[7][0]);
      gsap.set(body, { x: `${cx / 10}em`, y: `${cy / 10}em`, rotation: (tilt * 180) / Math.PI, skewX: ((pos[0][0] - pos[4][0]) / HH) * 12 });
    };
    // Each point is pulled toward its rest spot plus the drag, harder the closer it is to where you grabbed.
    const step = () => {
      let energy = 0;
      pos.forEach((q, i) => {
        const near = 1 - Math.hypot(REST[i][0] - grab[0], REST[i][1] - grab[1]) / 170;
        const kk = p.stiff * (0.5 + near * 1.3);
        for (const a of [0, 1]) {
          vel[i][a] += (REST[i][a] + off[a] - q[a]) * kk - vel[i][a] * p.damp;
          q[a] += vel[i][a];
          energy += Math.abs(vel[i][a]) + Math.abs(REST[i][a] + off[a] - q[a]) * 0.05;
        }
      });
      render();
      if (energy < 0.05 && !drag) stop();
    };
    const go = () => !running && !reducedMotion && ((running = true), gsap.ticker.add(step));
    const stop = () => ((running = false), gsap.ticker.remove(step));
    render();

    const local = (e) => {
      const r = wrap.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 200 - 100, ((e.clientY - r.top) / r.height) * 160 - 80];
    };
    let drag = null;
    k.on(wrap, 'pointerdown', (e) => {
      wrap.setPointerCapture(e.pointerId);
      const [x, y] = local(e);
      grab = [x, y];
      drag = { x, y, moved: false };
      go();
    });
    k.on(wrap, 'pointermove', (e) => {
      if (!drag) return;
      const [x, y] = local(e);
      const lim = p.reach * 10;
      off = [Math.max(-lim, Math.min(lim, x - drag.x)), Math.max(-lim, Math.min(lim, y - drag.y))];
      if (Math.hypot(...off) > 3) drag.moved = true;
    });
    const drop = () => {
      if (!drag) return;
      // A click with no drag pokes the nearest points inward
      if (!drag.moved) pos.forEach((q, i) => {
        const near = Math.max(0, 1 - Math.hypot(REST[i][0] - grab[0], REST[i][1] - grab[1]) / 90);
        vel[i][0] -= (REST[i][0] / 10) * near * 1.2;
        vel[i][1] -= (REST[i][1] / 10) * near * 1.2;
      });
      drag = null;
      off = [0, 0];
      go();
    };
    k.on(wrap, 'pointerup', drop);
    k.on(wrap, 'pointercancel', drop);
    k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the element
    k.on(wrap, 'keydown', (e) => {
      const v = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      if (!v) return;
      e.preventDefault();
      grab = [-v[0] * HW, -v[1] * HH];
      vel.forEach((q, i) => ((q[0] += v[0] * (i % 2 ? 4 : 7)), (q[1] += v[1] * (i % 2 ? 4 : 7))));
      go();
    });

    return () => { stop(); k.destroy(); };
  },
};
