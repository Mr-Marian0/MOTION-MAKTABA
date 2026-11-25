/**Folder Tabs: the new sheet slides in from the side you moved toward. */
import { kit, esc, labelsOf, bars } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Folder Tabs',
  element: 'Tabs',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Direction-aware', 'State-dependent'],
  effect: ['Sliding', 'Rotating'],
  purpose: ['Hierarchy', 'Continuity'],
  properties: ['Position', 'Rotation', 'Depth (z)'],
  description: 'Folder tabs on a stack of sheets. The new sheet slides in from the side of the tab you picked, so you can tell which way you moved.',
  params: [
    { key: 'labels', label: 'Tabs', group: 'Content', type: 'text', default: 'Notes, Sketches, Letters, Maps' },
    { key: 'aware', label: 'Direction-aware', group: 'Behavior', type: 'toggle', default: true, live: true },
    { key: 'tilt', label: 'Sheet tilt', group: 'Motion', type: 'range', min: 0, max: 10, step: 0.5, unit: '°', default: 3, live: true },
    { key: 'layout', label: 'Layout', group: 'Layout', type: 'choice', options: ['Landscape', 'Portrait'], default: 'Landscape' },
    tone('#a07a52', 'tone', '--sp-accent', 'Folder color'),
  ],
  variants: { Portrait: { layout: 'Portrait' } },
};

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Notes', 'Sketches', 'Letters', 'Maps']).slice(0, 5);
    k.html(`
      <div class="sp sp-tabs" data-layout="${esc(p.layout)}">
        <div class="sp-tabs__list" role="tablist" aria-label="Specimen tabs">
          ${labels.map((l, i) => `<button role="tab" type="button" aria-selected="${!i}" tabindex="${i ? -1 : 0}">${esc(l)}</button>`).join('')}
        </div>
        <div class="sp-tabs__deck">
          ${labels.map((l, i) => `
            <section class="sp-tabs__sheet" role="tabpanel" aria-label="${esc(l)}">
              <b>${esc(l)}</b><small>Sheet ${String(i + 1).padStart(2, '0')}</small>${bars(4)}
            </section>`).join('')}
        </div>
      </div>`);

    const tabs = k.$$('[role="tab"]');
    const sheets = k.$$('.sp-tabs__sheet');
    let at = 0;

    // Resting stack: the active sheet on top, the others peeking out behind it.
    const rest = (i) => ({
      x: 0,
      y: i === at ? 0 : 6 + Math.abs(i - at) * 3,
      rotation: i === at ? 0 : (i % 2 ? 1 : -1) * Number(p.tilt) * 0.6,
      zIndex: i === at ? 10 : 5 - Math.abs(i - at),
      autoAlpha: 1,
    });
    sheets.forEach((s, i) => gsap.set(s, rest(i)));

    const select = (i) => {
      if (i === at) return;
      const dir = p.aware ? Math.sign(i - at) : 1;
      const out = sheets[at];
      const inc = sheets[i];
      tabs[at].setAttribute('aria-selected', 'false');
      tabs[at].tabIndex = -1;
      tabs[i].setAttribute('aria-selected', 'true');
      tabs[i].tabIndex = 0;
      at = i;
      const tilt = Number(p.tilt);
      gsap.killTweensOf(sheets);
      gsap.set(inc, { zIndex: 11 });
      gsap.fromTo(inc, { x: `${dir * 55}%`, rotation: dir * tilt, autoAlpha: 0 }, { x: 0, y: 0, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' });
      gsap
        .timeline()
        .to(out, { x: `${-dir * 30}%`, rotation: -dir * tilt * 1.5, autoAlpha: 0, duration: 0.45, ease: 'power3.in' })
        .add(() => sheets.forEach((s, j) => j !== at && gsap.set(s, rest(j))))
        .set(inc, { zIndex: 10 });
    };

    tabs.forEach((t, i) => k.on(t, 'click', () => select(i)));
    k.on(k.$('[role="tablist"]'), 'keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      const i = (at + step + tabs.length) % tabs.length;
      select(i);
      tabs[i].focus();
    });

    return { destroy: () => k.destroy(), update: () => sheets.forEach((s, j) => j !== at && gsap.set(s, rest(j))) };
  },
};
