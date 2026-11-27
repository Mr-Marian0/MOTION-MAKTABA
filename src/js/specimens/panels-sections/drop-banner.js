/** Drop Banner: the "What's new" tab drops its panel down from the top of the page with real weight: it falls, hits the end of its fold, bounces and settles, pushing the page down. */
import { kit, bars, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Drop Banner',
  element: 'Expandable panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Coordinated', 'Reversible'],
  effect: ['Dropping', 'Bouncing', 'Rising'],
  purpose: ['Hierarchy', 'Feedback', 'Delight'],
  properties: ['Size', 'Position'],
  description: 'A "What\'s new" tab pinned to the top of the page. Click it and the panel drops open with weight: it falls, hits the end of its travel, bounces a couple of times and settles, pushing the page content down with it. Click again and it is lifted back up into the tab.',
  params: [
    { key: 'ease', label: 'Landing', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Bounce', live: true },
    { key: 'time', label: 'Drop time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Banner'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-drp">
        <div class="sp-drp__panel" inert>
          <div class="sp-drp__inner"><span class="sp-pn__kick">What’s new · v2.4</span><b class="sp-drp__title">Boards can now be folded</b><span class="sp-drp__text">Fold any board into a booklet and share it as one link.</span></div>
        </div>
        <button type="button" class="sp-drp__tab" aria-expanded="false">What’s new ▾</button>
        <div class="sp-pn__page sp-drp__page"><span class="sp-pn__kick">Workspace</span><b class="sp-pn__h">Boards</b>${bars(6)}</div>
      </div>`);
    const panel = k.$('.sp-drp__panel');
    const tab = k.$('.sp-drp__tab');
    const page = k.$('.sp-drp__page');
    const inner = k.$('.sp-drp__inner');
    gsap.set(panel, { height: 0 });

    k.on(tab, 'click', () => {
      const open = tab.getAttribute('aria-expanded') !== 'true';
      tab.setAttribute('aria-expanded', String(open));
      tab.textContent = open ? 'Close ▴' : 'What’s new ▾';
      panel.inert = !open;
      const h = inner.offsetHeight;
      const t = reducedMotion ? 0 : p.time;
      const ease = open ? EASES[p.ease] || 'bounce.out' : 'power3.inOut';
      gsap.to(panel, { height: open ? h : 0, duration: t, ease, overwrite: true });
      gsap.to([tab, page], { y: open ? h : 0, duration: t, ease, overwrite: true });
    });

    return () => k.destroy();
  },
};
