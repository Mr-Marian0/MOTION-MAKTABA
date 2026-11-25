/** Stacked Notifications: the bell rings, notes drop onto a stack, the stack fans out on hover, ✕ slides one away. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Notification Stack',
  element: 'Notifications',
  trigger: ['Click', 'Hover', 'Focus'],
  behavior: ['Event-driven', 'Queue-based', 'Hover-dependent', 'Hierarchical'],
  effect: ['Dropping', 'Wiggle', 'Expansion', 'Sliding'],
  purpose: ['Feedback', 'Hierarchy', 'Focus'],
  properties: ['Position', 'Scale', 'Order', 'Opacity'],
  description: 'A notification tray. Each new note makes the bell ring and drops onto a neat stack where only the newest is fully shown. Hover or tab into the stack and it fans out into a readable list; ✕ slides a note away and the rest close the gap.',
  params: [
    { key: 'peek', label: 'Stack peek', group: 'Layout', type: 'range', min: 0.3, max: 1.5, step: 0.1, unit: 'em', default: 0.7, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Accent'),
  ],
};

const NOTES = ['Ana commented on Folder Tabs', 'Your print order shipped', 'Bo shared the Kraft drawer', 'New design in Navigation', 'Weekly digest is ready'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-notes">
        <button type="button" class="sp-notes__bell" aria-label="Send a notification"><span aria-hidden="true">🔔︎</span></button>
        <ul class="sp-notes__stack" aria-live="polite" aria-label="Notifications"></ul>
        <p class="sp-note">Ring the bell · hover the stack</p>
      </div>`);
    const bell = k.$('.sp-notes__bell');
    const stack = k.$('.sp-notes__stack');
    const d = (t) => (reducedMotion ? 0 : t);
    const em = () => parseFloat(getComputedStyle(stack).fontSize);
    let open = false;
    let n = 0;

    // Newest first. Closed: tucked under the top note, peeking out and shrinking. Open: a list.
    const layout = () => {
      let top = 0; // open: each note sits below the previous one (notes can differ in height)
      [...stack.children].forEach((li, i) => {
        gsap.to(li, open
          ? { y: top, scale: 1, opacity: 1, duration: d(0.45), ease: 'back.out(1.4)' }
          : { y: i * p.peek * em(), scale: 1 - i * 0.05, opacity: i > 2 ? 0 : 1, duration: d(0.45), ease: 'power3.out' });
        top += li.offsetHeight + 0.5 * em();
        li.style.zIndex = 10 - i;
      });
    };

    k.on(bell, 'click', () => {
      const li = document.createElement('li');
      li.className = 'sp-notes__item';
      li.innerHTML = `<span>${esc(NOTES[n++ % NOTES.length])}</span><button type="button" class="sp-notes__x" aria-label="Dismiss">✕</button>`;
      stack.prepend(li);
      if (stack.children.length > 5) stack.lastElementChild.remove();
      k.on(li.querySelector('.sp-notes__x'), 'click', () =>
        gsap.to(li, { x: '110%', opacity: 0, duration: d(0.35), ease: 'power2.in', onComplete: () => (li.remove(), layout()) }));
      gsap.from(li, { y: -40, opacity: 0, duration: d(0.5), ease: 'bounce.out' });
      layout();
      if (!reducedMotion) gsap.fromTo(bell.firstChild, { rotation: 0 }, { keyframes: { rotation: [22, -18, 12, -6, 0] }, duration: 0.7, transformOrigin: '50% 0%' });
    });
    const fan = (o) => ((open = o), layout());
    k.on(stack, 'pointerenter', () => fan(true));
    k.on(stack, 'pointerleave', () => fan(false));
    k.on(stack, 'focusin', () => fan(true));
    k.on(stack, 'focusout', (e) => !stack.contains(e.relatedTarget) && fan(false));
    bell.click(); // start with one note

    return { destroy: () => k.destroy(), update: layout };
  },
};
