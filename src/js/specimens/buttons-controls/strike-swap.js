/** Strike Swap: an underline draws on hover; on click it rises and sweeps through the label, erasing it and writing the next. */
import { kit, esc, labelsOf, clickSignal } from '../_kit.js';
import { tone, signal } from '../_params.js';

const LINE_TONES = [
  { label: 'Bone', value: '#fafaf7' },
  { label: 'Tape', value: '#e8dcc0' },
  { label: 'Kraft', value: '#a07a52' },
  { label: 'Stamp red', value: '#b3412e' },
  { label: 'Ledger green', value: '#4f6b4a' },
  { label: 'Carbon blue', value: '#2f4a6b' },
];

export const meta = {
  title: 'Strike Swap',
  element: 'Primary button',
  trigger: ['Hover', 'Click', 'Keyboard'],
  behavior: ['Hover-dependent', 'Sequential', 'State-dependent'],
  effect: ['Sweeping', 'Scraping', 'Extending', 'Retracting'],
  purpose: ['Feedback', 'Continuity'],
  properties: ['Clip & mask', 'Scale', 'Position'],
  description: 'Hovering draws a line under the label. Clicking lifts it to strike through the text: the line sweeps across erasing the old label, then pulls away revealing the new one.',
  params: [
    { key: 'labels', label: 'Labels', group: 'Content', type: 'text', default: 'Erase me, Rewritten, Once more' },
    { key: 'thick', label: 'Line weight', group: 'Appearance', type: 'range', min: 0.06, max: 0.4, step: 0.02, unit: 'em', default: 0.14, css: '--sp-thick' },
    { key: 'lineTone', label: 'Line color', group: 'Appearance', type: 'swatch', options: LINE_TONES, default: '#fafaf7', css: '--sp-line' },
    { key: 'speed', label: 'Sweep time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.45, live: true },
    signal('Bounce'),
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Erase me', 'Rewritten']);
    const longest = labels.reduce((a, b) => (b.length > a.length ? b : a));
    k.html(`
      <div class="sp sp-press sp-strike">
        <button type="button" class="sp-press__btn sp-strike__btn" aria-label="${esc(labels[0])}">
          <span class="sp-strike__text" aria-hidden="true">
            <span class="sp-strike__sizer">${esc(longest)}</span>
            <span class="sp-strike__lbl">${esc(labels[0])}</span>
            <span class="sp-strike__lbl">${esc(labels[1 % labels.length])}</span>
            <i class="sp-strike__line"></i>
          </span>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-strike__btn');
    const line = k.$('.sp-strike__line');
    let [cur, next] = k.$$('.sp-strike__lbl');
    let i = 0;
    let hover = false;
    let busy = false;
    const UNDER = '0.75em';
    const HIDDEN = 'inset(0% 100% 0% 0%)';
    gsap.set(line, { scaleX: 0, y: UNDER, transformOrigin: '0% 50%' });
    gsap.set(next, { clipPath: HIDDEN });
    const underline = (on) => !busy && gsap.to(line, { scaleX: on ? 1 : 0, duration: reducedMotion ? 0 : 0.35, ease: 'power3.out' });

    k.on(btn, 'pointerenter', () => ((hover = true), underline(true)));
    k.on(btn, 'pointerleave', () => ((hover = false), underline(false)));
    k.on(btn, 'click', () => {
      clickSignal(gsap, btn, p.signal, reducedMotion);
      if (busy) return;
      busy = true;
      i++;
      btn.setAttribute('aria-label', labels[i % labels.length]);
      const t = reducedMotion ? 0 : Number(p.speed);
      const ease = 'power2.inOut';
      gsap.timeline({
        onComplete: () => {
          [cur, next] = [next, cur];
          next.textContent = labels[(i + 1) % labels.length];
          gsap.set(next, { clipPath: HIDDEN });
          gsap.set(line, { y: UNDER, scaleX: 0, transformOrigin: '0% 50%' });
          busy = false;
          if (hover) underline(true);
        },
      })
        .to(line, { scaleX: 0, duration: t * 0.3, ease: 'power2.in', overwrite: true })
        .set(line, { y: 0 })
        // The line's leading edge erases the old label…
        .to(line, { scaleX: 1, duration: t, ease })
        .fromTo(cur, { clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 100%)', duration: t, ease }, '<')
        // …and its trailing edge writes the new one.
        .set(line, { transformOrigin: '100% 50%' })
        .to(line, { scaleX: 0, duration: t, ease })
        .to(next, { clipPath: 'inset(0% 0% 0% 0%)', duration: t, ease }, '<');
    });

    return () => k.destroy();
  },
};
