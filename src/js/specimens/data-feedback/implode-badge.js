/** Implode Badge: "Mark all as read" makes the unread badge implode: it cracks into shards that are sucked inward to its centre and vanish with a small flash, the opposite of a pop. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, radial } from '../cards-containers/_pieces.js';

export const meta = {
  title: 'Implode Badge',
  element: 'Badges',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Attracted', 'Reversible'],
  effect: ['Imploding', 'Contracting', 'Shattering'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Scale', 'Rotation'],
  description: 'An inbox tab with an unread-count badge. Press "Mark all read" and the badge implodes: it cracks into wedge-shaped shards which, instead of flying apart, are pulled inward to the centre, spinning and shrinking as they converge, and vanish in a tiny flash. New mail ("Simulate mail") grows the badge back with a pop.',
  params: [
    { key: 'shards', label: 'Shards', group: 'Shape', type: 'range', min: 4, max: 14, step: 1, unit: '', default: 8 },
    { key: 'time', label: 'Implode time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Badge'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    let n = 12;
    const badge = (v) => `<b class="sp-df__badge sp-imp__b">${v}</b>`;
    k.html(`
      <div class="sp sp-df sp-imp">
        <div class="sp-df__card">
          <div class="sp-imp__tab"><span>Inbox</span><span class="sp-imp__slot">${badge(n)}<span class="sp-cc__pieces"></span><i class="sp-imp__flash"></i></span></div>
          <p class="sp-imp__msg" aria-live="polite">12 unread messages</p>
          <div class="sp-df__row"><button type="button" class="sp-df__btn">Mark all read</button><button type="button" class="sp-df__btn sp-df__btn--ghost">Simulate mail</button></div>
        </div>
      </div>`);
    const slot = k.$('.sp-imp__slot');
    const real = () => slot.querySelector('.sp-imp__b');
    const host = k.$('.sp-cc__pieces');
    const flash = k.$('.sp-imp__flash');
    const msg = k.$('.sp-imp__msg');
    const [readBtn, mailBtn] = k.$$('.sp-df__btn');
    gsap.set(flash, { scale: 0, autoAlpha: 0 });
    k.on(readBtn, 'click', () => {
      if (!n) return;
      n = 0;
      msg.textContent = 'All caught up';
      const b = real();
      if (reducedMotion) return gsap.set(b, { autoAlpha: 0 });
      const bits = pieces(host, badge(b.textContent), radial(50, 50, Math.round(p.shards), 1, Math.ceil(Math.random() * 99)));
      gsap.set(b, { autoAlpha: 0 });
      // each shard first nudges outward (the crack), then is pulled in past the centre, spinning and shrinking
      gsap.timeline({ onComplete: () => (host.innerHTML = '') })
        .to(bits.map((x) => x.el), { xPercent: (i) => (bits[i].c[0] - 50) * 0.15, yPercent: (i) => (bits[i].c[1] - 50) * 0.15, duration: p.time * 0.2, ease: 'power2.out' })
        .to(bits.map((x) => x.el), { xPercent: (i) => (50 - bits[i].c[0]) * 0.9, yPercent: (i) => (50 - bits[i].c[1]) * 0.9, scale: 0, rotation: () => (Math.random() < 0.5 ? -1 : 1) * 200, duration: p.time * 0.8, ease: 'power3.in' })
        .fromTo(flash, { scale: 0, autoAlpha: 1 }, { scale: 1.6, autoAlpha: 0, duration: 0.3, ease: 'power2.out' }, '-=0.05');
    });
    k.on(mailBtn, 'click', () => {
      n += 1 + Math.floor(Math.random() * 3);
      msg.textContent = `${n} unread message${n > 1 ? 's' : ''}`;
      const b = real();
      b.textContent = n;
      gsap.fromTo(b, { autoAlpha: 1, scale: 0.3 }, { scale: 1, duration: reducedMotion ? 0 : 0.45, ease: 'back.out(3)' });
    });
    return () => k.destroy();
  },
};
