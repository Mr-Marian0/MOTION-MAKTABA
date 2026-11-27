/** Bounce Bars: a slider made of bars. Bars the thumb passes light up with a hop, bars near it swell, and the thumb bounces when dropped. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

const LIT = [
  { label: 'Signal green', value: '#3fae4a' },
  { label: 'Amber', value: '#e0a43a' },
  { label: 'Stamp red', value: '#b3412e' },
  { label: 'Sky', value: '#5aa0e0' },
];

export const meta = {
  title: 'Bounce Bars',
  element: 'Slider',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Clamped', 'Proximity-aware', 'Staggered', 'Discrete'],
  effect: ['Bouncing', 'Hopping', 'Expansion', 'Rebounding'],
  purpose: ['Feedback', 'Progress', 'Delight'],
  properties: ['Scale', 'Position', 'Color'],
  description: 'A volume-style slider made of bars. Each bar the thumb passes changes color with a little hop, bars near the thumb swell into a wave while you drag, and the thumb bounces when you let go.',
  params: [
    { key: 'count', label: 'Bars', group: 'Layout', type: 'range', min: 12, max: 40, step: 1, default: 28 },
    { key: 'lift', label: 'Swell', group: 'Motion', type: 'range', min: 0, max: 1.5, step: 0.05, unit: '×', default: 0.7, live: true },
    { key: 'lit', label: 'Lit color', group: 'Appearance', type: 'swatch', options: LIT, default: '#3fae4a', css: '--sp-lit' },
    { key: 'value', label: 'Start value', group: 'Content', type: 'range', min: 0, max: 100, step: 1, default: 18 },
    tone('#111111', 'tone', '--sp-accent', 'Bars'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const N = Number(p.count);
    k.html(`
      <div class="sp sp-bars">
        <div class="sp-bars__rail">
          ${'<span class="sp-bars__bar"><i class="sp-bars__ink"></i></span>'.repeat(N)}
          <div class="sp-bars__thumb" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100"></div>
        </div>
        <p class="sp-note">Drag the handle · or use arrow keys</p>
      </div>`);
    const rail = k.$('.sp-bars__rail');
    const bars = k.$$('.sp-bars__bar');
    const inks = k.$$('.sp-bars__ink');
    const thumb = k.$('.sp-bars__thumb');
    const s = k.track({ v: Number(p.value), lift: 0 });
    const litCount = (v) => clamp(Math.ceil((v / 100) * N - 0.5), 0, N);
    let lit = litCount(s.v);

    const draw = () => {
      thumb.style.left = `${s.v}%`;
      thumb.setAttribute('aria-valuenow', Math.round(s.v));
      const now = litCount(s.v);
      if (now !== lit) {
        // Bars crossed since the last frame hop, in the order the thumb passed them.
        const [a, b] = now > lit ? [lit, now] : [now, lit];
        const crossed = inks.slice(a, b);
        if (now < lit) crossed.reverse();
        if (!reducedMotion) gsap.fromTo(crossed, { y: '-0.45em' }, { y: 0, duration: 0.5, ease: 'bounce.out', stagger: 0.03, overwrite: true });
        lit = now;
      }
      bars.forEach((bar, i) => {
        bar.classList.toggle('is-lit', i < lit);
        const d = (((i + 0.5) / N) * 100 - s.v) / 9;
        gsap.set(bar, { scaleY: 1 + s.lift * Math.exp(-d * d) });
      });
    };
    draw();

    let dragging = false;
    const move = (e) => {
      const r = rail.getBoundingClientRect();
      s.v = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
      draw();
    };
    const release = () => {
      if (!dragging) return;
      dragging = false;
      const t = reducedMotion ? 0 : 1;
      gsap.to(s, { lift: 0, duration: 0.6 * t, ease: 'elastic.out(1, 0.4)', onUpdate: draw });
      gsap.to(thumb, { y: 0, duration: 0.7 * t, ease: 'bounce.out' });
    };
    k.on(rail, 'pointerdown', (e) => {
      rail.setPointerCapture(e.pointerId);
      dragging = true;
      const t = reducedMotion ? 0 : 1;
      gsap.to(s, { lift: Number(p.lift), duration: 0.25 * t, onUpdate: draw });
      gsap.to(thumb, { y: '-0.6em', duration: 0.2 * t, ease: 'power2.out' }); // picked up
      move(e);
    });
    k.on(rail, 'pointermove', (e) => dragging && move(e));
    k.on(rail, 'pointerup', release);
    k.on(rail, 'pointercancel', release);
    k.on(thumb, 'keydown', (e) => {
      const step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[e.key];
      if (!step) return;
      e.preventDefault();
      s.v = clamp(s.v + step, 0, 100);
      draw();
      if (!reducedMotion) gsap.fromTo(thumb, { y: '-0.4em' }, { y: 0, duration: 0.5, ease: 'bounce.out' });
    });

    return () => k.destroy();
  },
};
