/**Hide-on-scroll Bar: hides scrolling down, returns scrolling up. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Hide-on-scroll Bar',
  element: 'Navbar',
  trigger: ['Scroll'],
  behavior: ['Sticky', 'Direction-aware', 'Scroll-hidden', 'Scroll-linked'],
  effect: ['Sliding', 'Retracting', 'Compression'],
  purpose: ['Focus', 'Progress', 'Navigation'],
  properties: ['Position', 'Size', 'Spacing'],
  description: 'A sticky bar that gets out of the way while you read down the page and comes back as soon as you scroll up. It can shrink and show reading progress.',
  params: [
    { key: 'hide', label: 'Hide on scroll down', group: 'Behavior', type: 'toggle', default: true, live: true },
    { key: 'shrink', label: 'Shrink after top', group: 'Size', type: 'toggle', default: true, live: true },
    { key: 'progress', label: 'Reading progress line', group: 'Appearance', type: 'toggle', default: true, live: true },
    { key: 'threshold', label: 'Scroll distance before reacting', group: 'Behavior', type: 'range', min: 0, max: 120, step: 5, unit: 'px', default: 20, live: true },
    tone('#a07a52'),
  ],
};

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const chapter = (n) => `<h4 class="sp-scrollnav__h">Chapter ${n}</h4>${bars(7)}`;
    k.html(`
      <div class="sp sp-scrollnav">
        <div class="sp-scrollnav__view" data-lenis-prevent tabindex="0" aria-label="Scrollable sample page">
          <header class="sp-scrollnav__bar">
            <span class="sp-logo">MM</span>
            <nav><a href="#">Work</a><a href="#">Lab</a><a href="#">About</a></nav>
            <i class="sp-scrollnav__progress" aria-hidden="true"></i>
          </header>
          <div class="sp-scrollnav__page">
            <p class="sp-note sp-note--inline">Scroll inside this page ↓ then back up ↑</p>
            ${[1, 2, 3, 4, 5].map(chapter).join('')}
          </div>
        </div>
      </div>`);

    const view = k.$('.sp-scrollnav__view');
    const bar = k.$('.sp-scrollnav__bar');
    const line = k.$('.sp-scrollnav__progress');
    let last = 0;
    let travel = 0; // distance scrolled in the current direction
    let hidden = false;

    const setHidden = (h) => {
      if (h === hidden) return;
      hidden = h;
      gsap.to(bar, { yPercent: h ? -105 : 0, duration: 0.5, ease: h ? 'power3.in' : 'expo.out' });
    };

    const onScroll = () => {
      const y = view.scrollTop;
      const dy = y - last;
      last = y;
      if (Math.sign(dy) !== Math.sign(travel)) travel = 0;
      travel += dy;

      if (!p.hide || y < 10) setHidden(false);
      else if (travel > Number(p.threshold)) setHidden(true);
      else if (travel < -Number(p.threshold)) setHidden(false);

      bar.classList.toggle('is-compact', Boolean(p.shrink) && y > 30);
      const max = view.scrollHeight - view.clientHeight || 1;
      gsap.set(line, { scaleX: y / max, autoAlpha: p.progress ? 1 : 0 });
    };
    k.on(view, 'scroll', onScroll, { passive: true });
    stage.querySelectorAll('a').forEach((a) => k.on(a, 'click', (e) => e.preventDefault()));
    onScroll();

    return { destroy: () => k.destroy(), update: onScroll };
  },
};
