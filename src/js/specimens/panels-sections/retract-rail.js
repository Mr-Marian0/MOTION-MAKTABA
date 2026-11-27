/** Retract Rail: collapsing the sidebar reels it into a housing at the edge like a tape measure: a fast whip, a clack and a recoil. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Retract Rail',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Self-collapsing', 'Elastic', 'Reversible'],
  effect: ['Retracting', 'Recoiling', 'Extending'],
  purpose: ['Focus', 'Feedback', 'Delight'],
  properties: ['Size', 'Position', 'Rotation'],
  description: 'A sidebar wound like a measuring tape. Collapse it and it reels back into a small housing on the edge with a fast whip, the labels blurring past, then the housing clacks and recoils. Click the housing to pull the rail back out.',
  params: [
    { key: 'whip', label: 'Retract time', group: 'Motion', type: 'range', min: 0.15, max: 1, step: 0.05, unit: 's', default: 0.35, live: true },
    { key: 'kick', label: 'Recoil', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.1, unit: '', default: 0.6, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Tape'),
  ],
};

const ITEMS = ['Inbox', 'Drafts', 'Sent', 'Archive', 'Trash'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-rtr">
        <div class="sp-pn__page sp-rtr__page"><span class="sp-pn__kick">Mail</span><b class="sp-pn__h">Inbox</b>${bars(6)}</div>
        <nav class="sp-rtr__rail" aria-label="Folders">${ITEMS.map((t, i) => `<a href="#" class="sp-rtr__item"><small>${i + 1}</small>${t}</a>`).join('')}</nav>
        <button type="button" class="sp-rtr__housing" aria-expanded="true" aria-label="Collapse sidebar"><i></i></button>
      </div>`);
    const rail = k.$('.sp-rtr__rail');
    const page = k.$('.sp-rtr__page');
    const housing = k.$('.sp-rtr__housing');
    const items = k.$$('.sp-rtr__item');
    let open = true;
    let tl;
    k.on(rail, 'click', (e) => e.preventDefault());

    k.on(housing, 'click', () => {
      open = !open;
      housing.setAttribute('aria-expanded', String(open));
      housing.setAttribute('aria-label', open ? 'Collapse sidebar' : 'Expand sidebar');
      rail.inert = !open;
      tl?.kill();
      if (reducedMotion) return gsap.set(rail, { scaleX: open ? 1 : 0 }), gsap.set(page, { left: open ? '11em' : '2em' });
      tl = gsap.timeline();
      if (!open) {
        tl.to(items, { x: '-1.5em', skewX: 20, duration: p.whip * 0.6, ease: 'power2.in', stagger: { each: p.whip * 0.08, from: 'end' } }, 0)
          .to(rail, { scaleX: 0, duration: p.whip, ease: 'power4.in' }, 0)
          .to(page, { left: '2em', duration: p.whip * 1.4, ease: 'power3.inOut' }, 0)
          // Clack: the housing jolts and the page recoils a little
          .to(housing, { keyframes: { x: [-6, 3, -1, 0].map((n) => n * p.kick), rotation: [-14, 8, -3, 0].map((n) => n * p.kick) }, duration: 0.4, ease: 'none' })
          .to(page, { keyframes: { x: [-4, 2, 0].map((n) => n * p.kick) }, duration: 0.3, ease: 'none' }, '<');
      } else {
        tl.set(items, { x: 0, skewX: 0 })
          .to(rail, { scaleX: 1, duration: 0.6, ease: 'power3.out' })
          .to(page, { left: '11em', duration: 0.6, ease: 'power3.out' }, 0)
          .from(items, { x: '-1em', autoAlpha: 0, duration: 0.3, stagger: 0.05 }, 0.25);
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
