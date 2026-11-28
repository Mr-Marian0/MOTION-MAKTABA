/** Unfold Reveal: the lines of a heading arrive folded flat like strips of paper and unfold one after another, each swinging down from its top edge into place as it comes into view. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Unfold Reveal',
  element: 'Text reveal',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Staggered', 'Sequential'],
  effect: ['Unfolding', 'Axial-rotation', 'Overshoot-motion'],
  purpose: ['Storytelling', 'Hierarchy', 'Delight'],
  properties: ['Rotation', 'Opacity'],
  description: 'A three-line statement that unfolds into view. Each line starts folded back on its top edge, edge-on and invisible; when the block comes into view the first line swings down into place, overshooting a touch, then the second, then the third, like a folded paper banner opening section by section. The replay button folds them up and does it again.',
  params: [
    { key: 'text', label: 'Lines (separate with /)', group: 'Content', type: 'text', default: 'Made slowly / in small runs / by hand' },
    { key: 'time', label: 'Unfold time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Accent line'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const lines = String(p.text).split('/').map((s) => s.trim()).filter(Boolean);
    k.html(`
      <div class="sp sp-tm sp-unf">
        <h4 class="sp-tm__h sp-unf__h" aria-label="${esc(lines.join(' '))}">${lines.map((l) => `<span class="sp-unf__line" aria-hidden="true">${esc(l)}</span>`).join('')}</h4>
        <button type="button" class="sp-tm__btn sp-tm__btn--ghost sp-unf__again">Replay</button>
      </div>`);
    const ls = k.$$('.sp-unf__line');
    gsap.set(ls, { transformOrigin: '50% 0%', transformPerspective: 600 });
    let tl;
    const play = () => {
      tl?.kill();
      if (reducedMotion) return gsap.set(ls, { rotationX: 0, opacity: 1 });
      tl = gsap.timeline()
        .set(ls, { rotationX: -95, opacity: 0 })
        .to(ls, { rotationX: 0, opacity: 1, duration: p.time, ease: 'back.out(1.6)', stagger: p.time * 0.45 });
    };
    gsap.set(ls, { rotationX: -95, opacity: 0 });
    k.inView(k.$('.sp-unf__h'), play);
    k.on(k.$('.sp-unf__again'), 'click', play);
    return () => k.destroy();
  },
};
