/** Free-fall Sidebar: closing the sidebar lets go of its items: one after another they come unpinned and free-fall off the bottom, tumbling, before the empty panel slides away. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Free-fall Sidebar',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Sequential', 'Randomized'],
  effect: ['Free-fall', 'Tumbling', 'Sliding', 'Dropping'],
  purpose: ['Feedback', 'Delight', 'Storytelling'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A sidebar menu whose items are pinned on. Close it and the items come unpinned from the bottom up: each tips on its last pin, then free-falls off the bottom of the page, tumbling and speeding up; then the empty panel slides away. Opening drops the items back onto their pins.',
  params: [
    { key: 'gravity', label: 'Fall distance', group: 'Motion', type: 'range', min: 10, max: 40, step: 2, unit: 'em', default: 26, live: true },
    { key: 'tumble', label: 'Tumble', group: 'Motion', type: 'range', min: 0, max: 180, step: 15, unit: '°', default: 75, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Sidebar'),
  ],
};

const ITEMS = ['Recipes', 'Pantry', 'Shopping', 'Planner', 'Favourites'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-ffl">
        <div class="sp-pn__page sp-ffl__page"><span class="sp-pn__kick">Kitchen</span><b class="sp-pn__h">This week</b>${bars(6)}</div>
        <nav class="sp-ffl__side" aria-label="Menu">${ITEMS.map((t) => `<a href="#" class="sp-ffl__item"><i class="sp-ffl__pin"></i>${t}</a>`).join('')}</nav>
        <button type="button" class="sp-pn__btn sp-pn__corner" aria-expanded="true">Close menu</button>
      </div>`);
    const side = k.$('.sp-ffl__side');
    const items = k.$$('.sp-ffl__item');
    const page = k.$('.sp-ffl__page');
    const btn = k.$('.sp-pn__corner');
    k.on(side, 'click', (e) => e.preventDefault());
    let tl;

    k.on(btn, 'click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close menu' : 'Open menu';
      side.inert = !open;
      tl?.kill();
      tl = gsap.timeline();
      if (!open) {
        // Bottom item first: tip on the right-hand pin, then let go
        items.slice().reverse().forEach((it, i) => {
          const dir = Math.random() < 0.5 ? -1 : 1;
          tl.to(it, { rotation: dir * 8, transformOrigin: dir < 0 ? '100% 0%' : '0% 0%', duration: 0.18, ease: 'power2.out' }, i * 0.12)
            .to(it, { y: `${p.gravity}em`, rotation: dir * p.tumble, x: `${dir * 1.5}em`, duration: 0.8, ease: 'power2.in' }, '>');
        });
        tl.to(side, { xPercent: -100, duration: 0.4, ease: 'power3.in' }, '-=0.3')
          .to(page, { left: '2em', duration: 0.5, ease: 'power3.inOut' }, '<');
      } else {
        tl.set(items, { y: '-6em', x: 0, rotation: 0, autoAlpha: 0 })
          .to(side, { xPercent: 0, duration: 0.45, ease: 'power3.out' })
          .to(page, { left: '12em', duration: 0.45, ease: 'power3.out' }, '<')
          .to(items, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'bounce.out', stagger: 0.07 }, '-=0.15');
      }
      if (reducedMotion) tl.progress(1);
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
