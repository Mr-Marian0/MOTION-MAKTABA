/** Push Panel: a side panel slides in, the page shifts and dims, and the panel's sections unfold in turn. */
import { kit, esc, labelsOf, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Push Panel',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Reversible', 'Staggered', 'Coordinated'],
  effect: ['Sliding', 'Unfolding', 'Rising'],
  purpose: ['Focus', 'Hierarchy', 'Continuity'],
  properties: ['Position', 'Opacity', 'Rotation'],
  description: 'A filter panel that slides in from the left and pushes the page aside, which dims. Its sections unfold one after another like folded paper. Esc or the button closes it.',
  params: [
    { key: 'sections', label: 'Sections', group: 'Content', type: 'text', default: 'Paper, Ink, Binding' },
    { key: 'width', label: 'Panel width', group: 'Layout', type: 'range', min: 30, max: 60, step: 5, unit: '%', default: 42, live: true },
    { key: 'push', label: 'Push the page', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Panel color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const secs = labelsOf(p.sections, ['Paper']).slice(0, 4);
    k.html(`
      <div class="sp sp-push">
        <aside class="sp-push__panel" aria-label="Filters" inert>
          <button type="button" class="sp-push__btn sp-push__close">✕ Close</button>
          ${secs.map((s) => `<section class="sp-push__sec"><b>${esc(s)}</b>${bars(2)}</section>`).join('')}
        </aside>
        <div class="sp-push__page">
          <button type="button" class="sp-push__btn sp-push__open" aria-expanded="false">☰ Filters</button>
          <h4>Catalogue</h4>${bars(6)}
        </div>
      </div>`);
    const panel = k.$('.sp-push__panel');
    const page = k.$('.sp-push__page');
    const btn = k.$('.sp-push__open');
    const secEls = k.$$('.sp-push__sec');
    let open = false;
    gsap.set(panel, { xPercent: -100 });
    gsap.set(secEls, { rotationX: -90, opacity: 0, transformOrigin: 'top center', transformPerspective: 400 });

    const toggle = () => {
      open = !open;
      const t = reducedMotion ? 0 : 0.6;
      btn.setAttribute('aria-expanded', String(open));
      panel.inert = !open;
      gsap.set(panel, { width: `${p.width}%` });
      gsap.to(panel, { xPercent: open ? 0 : -100, duration: t, ease: 'expo.inOut' });
      gsap.to(page, { x: open && p.push ? panel.offsetWidth : 0, opacity: open ? 0.45 : 1, duration: t, ease: 'expo.inOut' });
      gsap.to(secEls, open
        ? { rotationX: 0, opacity: 1, duration: t, ease: 'back.out(1.4)', stagger: 0.1, delay: t * 0.5 }
        : { rotationX: -90, opacity: 0, duration: t * 0.4, stagger: { each: 0.05, from: 'end' } });
    };
    k.on(btn, 'click', toggle);
    k.on(k.$('.sp-push__close'), 'click', () => (toggle(), btn.focus()));
    k.on(stage, 'keydown', (e) => open && e.key === 'Escape' && (e.stopPropagation(), toggle(), btn.focus()));

    return () => k.destroy();
  },
};
