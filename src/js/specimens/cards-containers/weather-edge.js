/** Weather Edge: the widget's top edge is one SVG path that morphs between a sun dome, cloud bumps and a wind wave. */
import { kit, EASES } from '../_kit.js';
import { EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Weather Edge',
  element: 'Widget',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Selection-dependent', 'State-dependent', 'Auto-advancing', 'Pausable'],
  effect: ['Path-morphing', 'Morphing', 'Wave-deformation'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Path', 'Shape', 'Color'],
  description: 'A weather widget whose top edge is drawn by the weather: a smooth dome for sun, puffy bumps for clouds, a rolling wave for wind. Pick a day and the one path morphs, point by point, into the next shape.',
  params: [
    { key: 'speed', label: 'Morph time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.1, unit: 's', default: 0.8, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Elastic', live: true },
    { key: 'auto', label: 'Auto-advance', group: 'Behavior', type: 'toggle', default: true, live: true },
  ],
};

// The card in drawing units (1 = 0.1em): 200 × 170. The top edge runs x 10 → 190 as 6 curves.
const XS = [10, 40, 70, 100, 130, 160, 190];
const slope = (f, x, dir) => (dir > 0 ? (f(x + 0.5) - f(x)) / 0.5 : (f(x) - f(x - 0.5)) / 0.5);
/** The card outline for a top-edge function f(x). Every shape has the same commands, so the numbers tween. */
const outline = (f) => {
  const n = (v) => v.toFixed(1);
  let d = `M${n(10)} ${n(f(10))}`;
  for (let i = 0; i < 6; i++) {
    const [a, b] = [XS[i], XS[i + 1]];
    d += ` C${n(a + 10)} ${n(f(a) + slope(f, a, 1) * 10)} ${n(b - 10)} ${n(f(b) - slope(f, b, -1) * 10)} ${n(b)} ${n(f(b))}`;
  }
  return `${d} L190 152 C190 158 186 162 180 162 L20 162 C14 162 10 158 10 152 Z`;
};
const DAYS = [
  { day: 'Mon', label: 'Sunny', temp: 24, color: '#c9773a', d: outline((x) => 62 - 44 * (1 - ((x - 100) / 90) ** 2)) },
  { day: 'Tue', label: 'Cloudy', temp: 17, color: '#6f7d8c', d: outline((x) => 62 - 28 * Math.abs(Math.sin((Math.PI * (x - 10)) / 60))) },
  { day: 'Wed', label: 'Windy', temp: 14, color: '#2f4a6b', d: outline((x) => 50 + 11 * Math.sin((Math.PI * (x - 10)) / 45)) },
];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-wx">
        <div class="sp-wx__wrap">
          <div class="sp-wx__tabs" role="tablist" aria-label="Day">
            ${DAYS.map((w, i) => `<button type="button" role="tab" class="sp-wx__tab" aria-selected="${!i}">${w.day}</button>`).join('')}
          </div>
          <div class="sp-wx__card">
            <svg viewBox="0 0 200 170" aria-hidden="true"><path class="sp-wx__path" d="${DAYS[0].d}" fill="${DAYS[0].color}" /></svg>
            <div class="sp-wx__body" aria-live="polite"><b class="sp-wx__temp"></b><span class="sp-wx__label"></span></div>
          </div>
        </div>
      </div>`);
    const wrap = k.$('.sp-wx__wrap');
    const path = k.$('.sp-wx__path');
    const body = k.$('.sp-wx__body');
    const tabs = k.$$('.sp-wx__tab');
    k.fit(wrap, 0.88);
    const d = (t) => (reducedMotion ? 0 : t);
    let i = 0;
    let hold = false;
    let timer;
    const text = () => {
      k.$('.sp-wx__temp').textContent = `${DAYS[i].temp}°`;
      k.$('.sp-wx__label').textContent = `${DAYS[i].day} · ${DAYS[i].label}`;
    };
    text();

    const schedule = () => {
      timer?.kill();
      if (p.auto && !hold && !reducedMotion) timer = gsap.delayedCall(2.6, () => show((i + 1) % DAYS.length));
    };
    const show = (next) => {
      if (next === i) return;
      i = next;
      tabs.forEach((t, j) => t.setAttribute('aria-selected', String(j === i)));
      const T = d(p.speed);
      gsap.to(path, { attr: { d: DAYS[i].d, fill: DAYS[i].color }, duration: T, ease: EASES[p.ease] || 'power3.out', overwrite: true });
      gsap.timeline()
        .to(body, { y: '0.6em', opacity: 0, duration: T * 0.3, ease: 'power2.in' })
        .add(text)
        .to(body, { y: 0, opacity: 1, duration: T * 0.5, ease: 'back.out(2)' });
      schedule();
    };
    schedule();

    tabs.forEach((t, j) => k.on(t, 'click', () => show(j)));
    k.on(k.$('.sp-wx__tabs'), 'keydown', (e) => {
      const dir = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!dir) return;
      e.preventDefault();
      show((i + dir + DAYS.length) % DAYS.length);
      tabs[i].focus();
    });
    const pause = (on) => () => { hold = on; on ? timer?.kill() : schedule(); };
    k.on(wrap, 'pointerenter', pause(true));
    k.on(wrap, 'pointerleave', pause(false));

    return { destroy: () => { timer?.kill(); k.destroy(); }, update: (key) => key === 'auto' && schedule() };
  },
};
