/**Assembling Masthead: the bar builds itself when it comes into view. */
import { kit, EASES } from '../_kit.js';
import { EASE_CHOICES } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Assembling Masthead',
  element: 'Navbar',
  trigger: ['Load', 'In view'],
  behavior: ['Staggered', 'Sequential', 'Time-driven'],
  effect: ['Rising', 'Dropping', 'Shape-assembly', 'Overshoot-motion'],
  purpose: ['Storytelling', 'Branding'],
  properties: ['Position', 'Opacity', 'Scale', 'Clip & mask'],
  description: 'On load, the bar puts itself together: the paper strip spreads out, the letters drop in, the links rise, and a stamp lands last.',
  params: [
    { key: 'order', label: 'Letter order', group: 'Motion', type: 'choice', options: ['Left → right', 'Center out', 'Random'], default: 'Left → right', live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Bounce', live: true },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0, max: 0.2, step: 0.01, unit: 's', default: 0.06, live: true },
    { key: 'stamp', label: 'Stamp lands', group: 'Content', type: 'toggle', default: true, live: true },
  ],
};

const FROM = { 'Left → right': 'start', 'Center out': 'center', Random: 'random' };

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-load">
        <header class="sp-load__bar">
          <i class="sp-load__paper paper-kraft tear-edge--bottom tear-v1" aria-hidden="true"></i>
          <span class="sp-load__logo" aria-label="Maktaba">${[...'Maktaba'].map((c) => `<b aria-hidden="true">${c}</b>`).join('')}</span>
          <nav class="sp-load__nav">${['Work', 'Lab', 'Index'].map((l) => `<a href="#"><span>${l}</span></a>`).join('')}</nav>
          <span class="sp-load__stamp stamp" aria-hidden="true">Vol.<br />01</span>
        </header>
        <button class="sp-load__replay sp-btn" type="button">↻ Replay</button>
      </div>`);

    const paper = k.$('.sp-load__paper');
    const letters = k.$$('.sp-load__logo b');
    const links = k.$$('.sp-load__nav span');
    const stamp = k.$('.sp-load__stamp');
    let tl;

    const play = () => {
      tl?.kill();
      const ease = EASES[p.ease] || EASES.Bounce;
      const each = Number(p.stagger);
      tl = gsap
        .timeline()
        .fromTo(paper, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: 'expo.inOut' })
        .fromTo(
          letters,
          { yPercent: -160, opacity: 0, rotation: () => gsap.utils.random(-25, 25) },
          { yPercent: 0, opacity: 1, rotation: 0, duration: 0.9, ease, stagger: { each, from: FROM[p.order] || 'start' } },
          '-=0.35'
        )
        .fromTo(links, { yPercent: 120 }, { yPercent: 0, duration: 0.7, ease: 'expo.out', stagger: each * 1.5 }, '-=0.6');
      if (p.stamp) {
        tl.fromTo(
          stamp,
          { scale: 2.4, rotation: -40, autoAlpha: 0 },
          { scale: 1, rotation: -12, autoAlpha: 1, duration: 0.45, ease: 'back.out(3)' },
          '-=0.2'
        );
      } else {
        gsap.set(stamp, { autoAlpha: 0 });
      }
    };

    k.on(k.$('.sp-load__replay'), 'click', play);
    links.forEach((s) => k.on(s.parentElement, 'click', (e) => e.preventDefault()));
    k.inView(stage, play, 0.6); // "load" = the moment it's actually seen

    return { destroy: () => k.destroy(), update: play };
  },
};
