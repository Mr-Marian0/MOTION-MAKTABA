/** Arch Toggle: the knob climbs over an arched track to the other end, painting the track behind it. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Arch Toggle',
  element: 'Toggle',
  trigger: ['Hover', 'Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Snap-to-path'],
  effect: ['Path-following', 'Curved-path-motion', 'Squashing'],
  purpose: ['Feedback', 'Affordance', 'Delight'],
  properties: ['Position', 'Path', 'Color'],
  description: 'A switch shaped like an arch. The knob climbs over the top to the other end and the track fills with color behind it; the label under the arch swaps. Hovering nudges the knob a little way up the slope.',
  params: [
    { key: 'labels', label: 'Labels', group: 'Content', type: 'text', default: 'off, on' },
    { key: 'curve', label: 'Arch height', group: 'Shape', type: 'range', min: 0.3, max: 1, step: 0.05, default: 0.75, live: true },
    { key: 'speed', label: 'Climb time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    tone('#4f6b4a', 'on', '--sp-on', 'On color'),
    tone('#111111', 'tone', '--sp-accent', 'Track color'),
  ],
};

const arch = (c) => `M16 70 C30 ${70 - c * 90} 90 ${70 - c * 90} 104 70`;
const ENDS = [0.07, 0.93]; // knob stops, as fractions of the path length

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const [off, on = 'on'] = labelsOf(p.labels, ['off', 'on']);
    k.html(`
      <div class="sp sp-arch">
        <button type="button" role="switch" aria-checked="false" class="sp-arch__btn" aria-label="${esc(on)}">
          <svg viewBox="0 0 120 80" aria-hidden="true">
            <path class="sp-arch__track"/><path class="sp-arch__fill"/><circle class="sp-arch__knob" r="7.5"/>
          </svg>
          <span class="sp-arch__lbl" aria-hidden="true"><span>${esc(off)}</span><span>${esc(on)}</span></span>
        </button>
        <p class="sp-note">Hover · click</p>
      </div>`);
    const btn = k.$('.sp-arch__btn');
    const track = k.$('.sp-arch__track');
    const fill = k.$('.sp-arch__fill');
    const knob = k.$('.sp-arch__knob');
    const [lOff, lOn] = k.$$('.sp-arch__lbl span');
    const st = k.track({ q: ENDS[0] });
    let isOn = false;
    let len = 0;
    const d = (t) => (reducedMotion ? 0 : t);

    const place = () => {
      const pt = track.getPointAtLength(st.q * len);
      gsap.set(knob, { attr: { cx: pt.x, cy: pt.y } });
      gsap.set(fill, { strokeDashoffset: len * (1 - st.q), opacity: (st.q - ENDS[0]) / (ENDS[1] - ENDS[0]) });
    };
    const shape = () => {
      track.setAttribute('d', arch(Number(p.curve)));
      fill.setAttribute('d', arch(Number(p.curve)));
      len = track.getTotalLength();
      gsap.set(fill, { strokeDasharray: len });
      place();
    };
    const go = (q, t, ease = 'power2.out') => gsap.to(st, { q, duration: d(t), ease, onUpdate: place, overwrite: true });
    shape();
    gsap.set(lOn, { opacity: 0, y: '0.5em' });

    k.on(btn, 'pointerenter', () => go(ENDS[+isOn] + (isOn ? -0.05 : 0.05), 0.4));
    k.on(btn, 'pointerleave', () => go(ENDS[+isOn], 0.5, 'elastic.out(1, 0.5)'));
    k.on(btn, 'click', () => {
      isOn = !isOn;
      btn.setAttribute('aria-checked', String(isOn));
      const t = Number(p.speed);
      go(ENDS[+isOn], t, 'power2.inOut').eventCallback('onComplete', () => {
        if (!reducedMotion) gsap.fromTo(knob, { attr: { r: 9 } }, { attr: { r: 7.5 }, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
      gsap.to(isOn ? lOff : lOn, { opacity: 0, y: '-0.5em', duration: d(0.25) });
      gsap.fromTo(isOn ? lOn : lOff, { opacity: 0, y: '0.5em' }, { opacity: 1, y: 0, duration: d(0.35), delay: d(t * 0.6), ease: 'back.out(2)' });
    });

    return { destroy: () => k.destroy(), update: (key) => key === 'curve' && shape() };
  },
};
