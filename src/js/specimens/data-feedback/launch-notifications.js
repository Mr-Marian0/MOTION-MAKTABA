/** Launch Notifications: sending a message launches its "Sent" notification: the new card rumbles on the launch pad at the bottom of the list, then blasts off upward, accelerating, and slots in at the top of the feed. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const MSGS = ['Proofs sent to Mira', 'Invoice INV-305 sent', 'Reminder sent to class', 'Quote sent to Ben'];

export const meta = {
  title: 'Launch Notifications',
  element: 'Notifications',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential', 'Momentum-driven'],
  effect: ['Launching', 'Accelerating', 'Particle-trail'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'An activity feed where outgoing messages launch into place. Press "Send" and a "Sent" notification appears on a pad below the feed: it shudders for a moment, then lifts off, slowly at first and then faster and faster, trailing a few puffs, and shoots up past the older items to dock at the top of the feed, which shuffles down to make room.',
  params: [
    { key: 'time', label: 'Climb time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sent'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-lnn">
        <div class="sp-lnn__panel">
          <ul class="sp-lnn__feed" aria-live="polite"><li class="sp-df__note"><i class="sp-df__dot"></i><span>Weekly report ready</span></li><li class="sp-df__note"><i class="sp-df__dot"></i><span>Ada liked your post</span></li></ul>
          <div class="sp-lnn__pad" aria-hidden="true"></div>
          <button type="button" class="sp-df__btn">Send</button>
        </div>
      </div>`);
    const feed = k.$('.sp-lnn__feed');
    const pad = k.$('.sp-lnn__pad');
    let n = 0, busy = false;
    const puff = (x, y) => {
      const s = document.createElement('i');
      s.className = 'sp-lnn__puff';
      pad.append(s);
      gsap.fromTo(s, { x, y, scale: 0.4, autoAlpha: 0.7 }, { y: y + 14, x: x + (Math.random() - 0.5) * 20, scale: 1.6, autoAlpha: 0, duration: 0.7, ease: 'power2.out', onComplete: () => s.remove() });
    };
    k.on(k.$('.sp-df__btn'), 'click', () => {
      if (busy) return;
      const text = MSGS[n++ % MSGS.length];
      const html = `<li class="sp-df__note sp-lnn__new"><i class="sp-df__dot"></i><span>${text}</span><small>now</small></li>`;
      if (reducedMotion) return feed.insertAdjacentHTML('afterbegin', html);
      busy = true;
      // FLIP: put the card in the feed (top), measure; draw it at the pad, then fly it up into its slot
      const before = new Map([...feed.children].map((c) => [c, c.getBoundingClientRect().top]));
      feed.insertAdjacentHTML('afterbegin', html);
      const card = feed.firstElementChild;
      const slot = card.getBoundingClientRect();
      const from = pad.getBoundingClientRect();
      const dy = from.top - slot.top;
      [...feed.children].slice(1).forEach((c) => gsap.fromTo(c, { y: before.get(c) - c.getBoundingClientRect().top }, { y: 0, duration: 0.35, delay: 0.35, ease: 'power2.out' }));
      gsap.timeline({ onComplete: () => (busy = false) })
        .set(card, { y: dy, zIndex: 3 })
        .to(card, { keyframes: { x: [-2, 2, -1.5, 1.5, 0] }, duration: 0.3, ease: 'none' })
        // smoke is left at the card's tail: its real (eased) position, converted into the pad's coordinates
        .to(card, { y: 0, duration: p.time, ease: 'expo.in', onUpdate: () => { if (Math.random() < 0.5) puff(from.width / 2 - 20 + Math.random() * 40, gsap.getProperty(card, 'y') - dy + slot.height - 6); } })
        .to(card, { keyframes: { scaleY: [0.92, 1] }, duration: 0.2, transformOrigin: '50% 0%' })
        .set(card, { zIndex: 'auto' });
      if (feed.children.length > 4) feed.lastElementChild.remove();
    });
    return () => k.destroy();
  },
};
