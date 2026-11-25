/** Press & Send: lifts on hover, squashes on press, then the label slides out for a "sent" stamp. */
import { kit, esc, labelsOf, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Press & Send',
  element: 'Primary button',
  trigger: ['Hover', 'Click'],
  behavior: ['Hover-dependent', 'State-dependent', 'Event-driven'],
  effect: ['Squashing', 'Bouncing', 'Sliding'],
  purpose: ['Feedback', 'Affordance'],
  properties: ['Scale', 'Position', 'Shadow'],
  description: 'A paper button that lifts on hover and squashes flat when pressed. On release the label slides away and a "sent" stamp slides in.',
  params: [
    { key: 'labels', label: 'Labels', group: 'Content', type: 'text', default: 'Send it, Sent ✓' },
    { key: 'lift', label: 'Hover lift', group: 'Motion', type: 'range', min: 0, max: 12, step: 1, unit: 'px', default: 5, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Elastic', live: true },
    tone('#111111'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const [a, b = 'Done'] = labelsOf(p.labels, ['Send it', 'Sent ✓']);
    k.html(`
      <div class="sp sp-press">
        <button type="button" class="sp-press__btn"><span>${esc(a)}</span><span aria-hidden="true">${esc(b)}</span></button>
        <p class="sp-note">Hover · press</p>
      </div>`);

    const btn = k.$('button');
    const [one, two] = k.$$('button span');
    const ease = () => EASES[p.ease] || 'expo.out';
    const d = (t) => (reducedMotion ? 0 : t);
    gsap.set(two, { yPercent: 250 });
    let busy = false;

    k.on(btn, 'pointerenter', () => gsap.to(btn, { y: -p.lift, duration: d(0.4), ease: ease() }));
    k.on(btn, 'pointerleave', () => gsap.to(btn, { y: 0, scaleY: 1, duration: d(0.5), ease: ease() }));
    k.on(btn, 'pointerdown', () => gsap.to(btn, { y: 0, scaleY: 0.84, scaleX: 1.06, duration: d(0.12) }));
    k.on(btn, 'pointerup', () => gsap.to(btn, { y: -p.lift, scale: 1, duration: d(0.7), ease: ease() }));
    k.on(btn, 'click', () => {
      if (busy) return;
      busy = true;
      gsap.timeline({ onComplete: () => (busy = false) })
        .to(one, { yPercent: -250, duration: d(0.35), ease: 'power3.in' })
        .to(two, { yPercent: 0, duration: d(0.5), ease: 'back.out(2)' }, '<0.15')
        .to(two, { yPercent: 250, duration: d(0.3), ease: 'power3.in' }, '+=1.1')
        .to(one, { yPercent: 0, duration: d(0.5), ease: 'back.out(2)' }, '<0.1');
      btn.setAttribute('aria-label', b);
      setTimeout(() => btn.removeAttribute('aria-label'), 2000);
    });

    return () => k.destroy();
  },
};
