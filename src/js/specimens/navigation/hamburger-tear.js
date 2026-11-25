/**Torn Sheet Menu: lines fold into an X, a torn sheet drops in. */
import { kit } from '../_kit.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Torn Sheet Menu',
  element: 'Hamburger menu',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Staggered'],
  effect: ['Morphing', 'Unfolding', 'Dropping'],
  purpose: ['Navigation', 'Feedback'],
  properties: ['Shape', 'Rotation', 'Position'],
  description: 'Three lines fold into an X while a torn sheet of paper drops in with the menu. The links fall into place one after another.',
  params: [
    { key: 'paper', label: 'Paper', group: 'Appearance', type: 'choice', options: ['Kraft', 'Ink', 'Cream'], default: 'Kraft' },
    { key: 'side', label: 'Comes from', group: 'Layout', type: 'choice', options: ['Top', 'Right'], default: 'Top' },
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.2, max: 1.6, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0, max: 0.25, step: 0.01, unit: 's', default: 0.06, live: true },
  ],
};

const PAPER = { Kraft: 'paper-kraft', Ink: 'paper-ink', Cream: 'paper-cream' };

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const fromTop = p.side !== 'Right';
    k.html(`
      <div class="sp sp-ham sp-ham--${fromTop ? 'top' : 'right'}">
        <header class="sp-bar">
          <span class="sp-logo">MM</span>
          <button class="sp-ham__btn" type="button" aria-expanded="false" aria-label="Open menu">
            <i></i><i></i><i></i>
          </button>
        </header>
        <div class="sp-ham__menu ${PAPER[p.paper] || PAPER.Kraft} ${fromTop ? 'tear-edge--bottom' : 'tear-edge--left'} tear-v2">
          <ul>${['Index', 'Work', 'Lab', 'Archive', 'Contact'].map((l) => `<li><a href="#">${l}</a></li>`).join('')}</ul>
        </div>
        <p class="sp-note">Press the menu button (or Esc to close)</p>
      </div>`);

    const btn = k.$('.sp-ham__btn');
    const lines = [...btn.children];
    const menu = k.$('.sp-ham__menu');
    const items = k.$$('.sp-ham__menu li');
    const hide = fromTop ? { yPercent: -150 } : { xPercent: 110 };
    gsap.set(menu, { ...hide, autoAlpha: 1 });
    let open = false;
    let tl;

    const toggle = (state = !open) => {
      if (state === open) return;
      open = state;
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      const d = Number(p.speed);
      tl?.kill();
      tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      if (open) {
        tl.to(lines[0], { y: 7, rotation: 45, duration: d * 0.5 }, 0)
          .to(lines[1], { scaleX: 0, opacity: 0, duration: d * 0.3 }, 0)
          .to(lines[2], { y: -7, rotation: -45, duration: d * 0.5 }, 0)
          .to(menu, { xPercent: 0, yPercent: 0, duration: d }, 0)
          .fromTo(
            items,
            fromTop ? { y: -24, opacity: 0, rotation: -4 } : { x: 30, opacity: 0, rotation: 3 },
            { x: 0, y: 0, opacity: 1, rotation: 0, duration: d * 0.8, ease: 'back.out(1.7)', stagger: Number(p.stagger) },
            d * 0.25
          );
      } else {
        tl.to(lines, { y: 0, rotation: 0, scaleX: 1, opacity: 1, duration: d * 0.5 }, 0)
          .to(items, { opacity: 0, duration: d * 0.25, stagger: { each: Number(p.stagger) * 0.5, from: 'end' } }, 0)
          .to(menu, { ...hide, duration: d * 0.6, ease: 'power3.in' }, d * 0.1);
      }
    };

    k.on(btn, 'click', () => toggle());
    k.on(stage, 'keydown', (e) => e.key === 'Escape' && toggle(false));
    items.forEach((li) => k.on(li.firstElementChild, 'click', (e) => (e.preventDefault(), toggle(false))));

    return () => k.destroy();
  },
};
