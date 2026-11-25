/** Timer Toast: toasts slide in from the corner and stack; a timer line sweeps down; hover pauses; swipe or ✕ dismisses. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Timed Toast Stack',
  element: 'Toast',
  trigger: ['Click', 'Hover', 'Swipe'],
  behavior: ['Transient', 'Time-driven', 'Queue-based', 'Pausable', 'Swipe-controlled'],
  effect: ['Sliding', 'Sweeping', 'Rising', 'Contracting'],
  purpose: ['Feedback', 'Progress'],
  properties: ['Position', 'Scale', 'Size', 'Opacity'],
  description: 'Toasts slide in from the bottom corner and stack, older ones shrinking behind. A line sweeps down each toast\'s lifetime; hovering pauses every timer. Swipe a toast right (or press ✕) to dismiss it early.',
  params: [
    { key: 'life', label: 'Toast life', group: 'Behavior', type: 'range', min: 2, max: 10, step: 0.5, unit: 's', default: 4, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Timer color'),
  ],
};

const MSGS = ['Design saved to Navigation', 'Link copied', 'Drawer renamed', 'Settings reset', 'Exported 3 files'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-toast">
        <button type="button" class="sp-toast__make">Save something</button>
        <ol class="sp-toast__stack" aria-live="polite"></ol>
      </div>`);
    const stack = k.$('.sp-toast__stack');
    const d = (t) => (reducedMotion ? 0 : t);
    const em = () => parseFloat(getComputedStyle(stack).fontSize);
    let n = 0;
    let paused = false;

    const layout = () => [...stack.children].forEach((li, i) =>
      gsap.to(li, { y: -i * em() * 0.8, scale: 1 - i * 0.06, opacity: i > 2 ? 0 : 1, zIndex: 10 - i, duration: d(0.4), ease: 'power3.out' }));
    const dismiss = (li, dir = 1) => {
      if (li.dataset.gone) return;
      li.dataset.gone = '1';
      li.timer.kill();
      gsap.to(li, { x: dir * 320, opacity: 0, duration: d(0.35), ease: 'power2.in', onComplete: () => (li.remove(), layout()) });
    };

    k.on(k.$('.sp-toast__make'), 'click', () => {
      const li = document.createElement('li');
      li.className = 'sp-toast__item';
      li.innerHTML = `<span>✓ ${esc(MSGS[n++ % MSGS.length])}</span><button type="button" class="sp-toast__x" aria-label="Dismiss">✕</button><i class="sp-toast__timer"></i>`;
      stack.prepend(li);
      gsap.from(li, { y: 60, opacity: 0, duration: d(0.45), ease: 'back.out(1.6)' });
      li.timer = gsap.fromTo(li.querySelector('.sp-toast__timer'), { scaleX: 1 }, { scaleX: 0, duration: Number(p.life), ease: 'none', paused, onComplete: () => dismiss(li) });
      k.on(li.querySelector('.sp-toast__x'), 'click', () => dismiss(li));
      // Swipe right to dismiss.
      let x0 = null;
      k.on(li, 'pointerdown', (e) => { if (e.target.closest('button')) return; x0 = e.clientX; li.setPointerCapture(e.pointerId); });
      k.on(li, 'pointermove', (e) => x0 !== null && gsap.set(li, { x: Math.max(0, e.clientX - x0) }));
      k.on(li, 'pointerup', (e) => {
        if (x0 === null) return;
        const dx = e.clientX - x0;
        x0 = null;
        if (dx > li.offsetWidth * 0.35) dismiss(li);
        else gsap.to(li, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
      layout();
    });
    const pause = (on) => {
      paused = on;
      [...stack.children].forEach((li) => li.timer?.paused(on));
    };
    k.on(stack, 'pointerenter', () => pause(true));
    k.on(stack, 'pointerleave', () => pause(false));
    k.on(stack, 'focusin', () => pause(true));
    k.on(stack, 'focusout', (e) => !stack.contains(e.relatedTarget) && pause(false));

    return () => ([...stack.children].forEach((li) => li.timer?.kill()), k.destroy());
  },
};
