/** Converge Field: type a valid promo code and specks scattered across the card stream in from every side, converging on the end of the field where they settle into a tick. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Converge Field',
  element: 'Text field',
  trigger: ['Keyboard'],
  behavior: ['Conditional', 'Randomized', 'Attracted'],
  effect: ['Convergence', 'Attraction-motion', 'Shape-assembly'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A promo-code field that rewards a right answer. Faint specks drift on the card. Type a valid code (try SPRING25) and they all stream towards the end of the field from wherever they are, accelerating as they come, and land in formation as a tick, while the field says how much you save. Change the code and the tick breaks up and the specks drift off again.',
  params: [
    { key: 'specks', label: 'Specks', group: 'Shape', type: 'range', min: 8, max: 40, step: 1, unit: '', default: 22 },
    { key: 'time', label: 'Converge time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 1, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Valid'),
  ],
};

const CODES = { SPRING25: '25% off', FREESHIP: 'free delivery', HELLO10: '10% off' };

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('cnv');
    const n = Math.round(p.specks);
    k.html(`
      <div class="sp sp-fi sp-cnv">
        <div class="sp-cnv__field" aria-hidden="true">${'<i></i>'.repeat(n)}</div>
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Promo code</label>
          <div class="sp-fi__box sp-cnv__box"><input class="sp-fi__input" id="${id}" autocomplete="off" placeholder="Try SPRING25" aria-describedby="${id}-m" /><span class="sp-cnv__target"></span></div>
          <small class="sp-fi__msg" id="${id}-m" aria-live="polite"></small>
        </div>
      </div>`);
    const root = k.$('.sp-cnv');
    const specks = k.$$('.sp-cnv__field i');
    const input = k.$('input');
    const target = k.$('.sp-cnv__target');
    const msg = k.$('.sp-fi__msg');
    // Tick shape: points along a ✓, in px relative to the target spot (measured with the layout, once per action)
    const tickPts = (s) => specks.map((_, i) => {
      const u = i / (n - 1);
      return u < 0.35 ? [(-1 + u / 0.35 * 0.8) * s, (u / 0.35) * 0.8 * s] : [(-0.2 + ((u - 0.35) / 0.65) * 1.4) * s, (0.8 - ((u - 0.35) / 0.65) * 1.9) * s];
    });
    let W = 1, H = 1, ok = false;
    const home = specks.map(() => [Math.random(), Math.random()]);
    const scatter = (d = 1.2) => specks.forEach((s, i) => gsap.to(s, { x: home[i][0] * W, y: home[i][1] * H, scale: 1, opacity: 0.35, duration: reducedMotion ? 0 : d, ease: 'power2.out', overwrite: true }));
    // Specks are placed once the card has a size (and again if it changes, unless they are forming the tick)
    k.resize(root, () => { W = root.offsetWidth; H = root.offsetHeight; if (!ok) scatter(0); });
    k.on(input, 'input', () => {
      const deal = CODES[input.value.trim().toUpperCase()];
      if (Boolean(deal) === ok) return;
      ok = Boolean(deal);
      msg.textContent = ok ? `Code applied: ${deal}.` : '';
      input.setAttribute('aria-invalid', String(!ok && Boolean(input.value)));
      if (!ok) return scatter();
      const r = root.getBoundingClientRect();
      const t = target.getBoundingClientRect();
      const [cx, cy] = [t.left - r.left + t.width / 2, t.top - r.top + t.height / 2];
      const pts = tickPts(Math.min(W, H) * 0.035);
      specks.forEach((s, i) => gsap.to(s, { x: cx + pts[i][0], y: cy + pts[i][1], opacity: 1, scale: 1.2, duration: reducedMotion ? 0 : p.time * (0.7 + Math.random() * 0.3), delay: reducedMotion ? 0 : Math.random() * 0.15, ease: 'power3.in', overwrite: true }));
    });
    return () => k.destroy();
  },
};
