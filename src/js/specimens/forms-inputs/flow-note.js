/** Flow Note: every key you type releases a few motes behind the note that ride an invisible flow field, curling along its currents in streams before they fade; the field drifts slowly over time. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Flow Note',
  element: 'Textarea',
  trigger: ['Keyboard', 'Focus'],
  behavior: ['Procedural', 'Reactive', 'Generative'],
  effect: ['Flow-field-motion', 'Particle-trail', 'Swirl-motion'],
  purpose: ['Delight', 'Feedback', 'Branding'],
  properties: ['Position', 'Opacity'],
  description: 'A writing box with a living background. Each keystroke lets a few motes loose from the edge of the box, and they travel along an invisible flow field (a direction at every point, made from smooth noise that slowly changes), so they sweep and curl together in streams, leaving faint trails, until they fade out. When you stop typing the motes die away and nothing is drawn.',
  params: [
    { key: 'motes', label: 'Motes per key', group: 'Shape', type: 'range', min: 1, max: 10, step: 1, unit: '', default: 4, live: true },
    { key: 'curl', label: 'Curl', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: '', default: 2, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Motes'),
  ],
};

/** Smooth 2D value noise. */
const noise = (() => {
  const T = Array.from({ length: 512 }, () => Math.random());
  const h = (x, y) => T[(x + y * 57) & 511];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h(xi, yi) * (1 - u) + h(xi + 1, yi) * u;
    const b = h(xi, yi + 1) * (1 - u) + h(xi + 1, yi + 1) * u;
    return a * (1 - v) + b * v;
  };
})();

export default {
  mount(stage, p, { gsap, reducedMotion, lite }) {
    const k = kit(stage, gsap);
    const id = uid('flw');
    k.html(`
      <div class="sp sp-fi sp-flw">
        <canvas class="sp-flw__sky" aria-hidden="true"></canvas>
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Morning pages</label>
          <textarea class="sp-fi__area sp-flw__area" id="${id}" placeholder="Write anything; watch it drift…"></textarea>
        </div>
      </div>`);
    const root = k.$('.sp-flw');
    const cv = k.$('canvas');
    const ctx = cv.getContext('2d');
    const area = k.$('textarea');
    let W = 1, H = 1, box = [0, 0, 1, 1], colour = '#5b3f8c';
    k.resize(root, () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = root.offsetWidth; H = root.offsetHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      box = [area.offsetLeft + area.parentElement.offsetLeft, area.offsetTop + area.parentElement.offsetTop, area.offsetWidth, area.offsetHeight];
      colour = getComputedStyle(root).getPropertyValue('--sp-accent').trim() || colour;
    });
    const motes = [];
    let t = 0, running = false;
    const cap = lite ? 60 : 160;
    const tick = (time, ms) => {
      const dt = Math.min(0.05, ms / 1000);
      t += dt * 0.15;
      // fade the previous frame instead of clearing it: that is what leaves the trails
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = colour;
      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        const a = noise(m.x * 0.012, m.y * 0.012 + t) * Math.PI * 2 * p.curl;
        m.x += Math.cos(a) * 60 * dt;
        m.y += Math.sin(a) * 60 * dt;
        m.life -= dt;
        if (m.life <= 0 || m.x < -5 || m.y < -5 || m.x > W + 5 || m.y > H + 5) { motes.splice(i, 1); continue; }
        ctx.globalAlpha = Math.min(1, m.life);
        ctx.fillRect(m.x, m.y, 2, 2);
      }
      ctx.globalAlpha = 1;
      if (!motes.length) { ctx.clearRect(0, 0, W, H); gsap.ticker.remove(tick); running = false; }
    };
    k.on(area, 'input', () => {
      if (reducedMotion) return;
      const [bx, by, bw, bh] = box;
      for (let i = 0; i < p.motes && motes.length < cap; i++) {
        // released from a random point on the box's edge
        const s = Math.random() * 2 * (bw + bh);
        const [x, y] = s < bw ? [bx + s, by] : s < bw + bh ? [bx + bw, by + s - bw] : s < 2 * bw + bh ? [bx + 2 * bw + bh - s, by + bh] : [bx, by + 2 * (bw + bh) - s];
        motes.push({ x, y, life: 1.5 + Math.random() * 1.5 });
      }
      if (!running) running = true, gsap.ticker.add(tick);
    });
    return () => { gsap.ticker.remove(tick); k.destroy(); };
  },
};
