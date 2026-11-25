/**Magnetic Links: links lean toward a nearby cursor and spring back. */
import { kit, esc, labelsOf } from '../_kit.js';
import { tone } from '../_params.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Magnetic Links',
  element: 'Navbar',
  trigger: ['Cursor move', 'Hover'],
  behavior: ['Magnetic', 'Proximity-aware', 'Spring-driven'],
  effect: ['Attraction-motion', 'Spring-motion'],
  purpose: ['Affordance', 'Delight'],
  properties: ['Position', 'Scale'],
  description: 'Links lean toward the cursor once it comes close, then spring back when it leaves. The label moves less than its button, which gives a little depth.',
  params: [
    { key: 'labels', label: 'Links', group: 'Content', type: 'text', default: 'Work, Lab, Notes, About' },
    tone('#111111'),
    { key: 'strength', label: 'Pull strength', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.05, default: 0.45, live: true },
    { key: 'radius', label: 'Field radius', group: 'Size', type: 'range', min: 40, max: 260, step: 10, unit: 'px', default: 40, live: true },
    { key: 'spring', label: 'Spring', group: 'Motion', type: 'choice', options: ['Elastic', 'Smooth', 'Snappy'], default: 'Elastic', live: true },
  ],
};

const SPRINGS = { Elastic: 'elastic.out(1, 0.35)', Smooth: 'power3.out', Snappy: 'power4.out' };

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Work', 'Lab', 'Notes', 'About']);
    k.html(`
      <div class="sp sp-mag">
        <nav class="sp-bar" aria-label="Specimen navigation">
          <span class="sp-logo">MM</span>
          <ul class="sp-mag__list">
            ${labels.map((l) => `<li><a href="#" class="sp-mag__link"><span>${esc(l)}</span></a></li>`).join('')}
          </ul>
        </nav>
        <p class="sp-note">Bring the cursor close to a link</p>
      </div>`);

    const links = k.$$('.sp-mag__link');
    let movers = [];
    const build = () => {
      const ease = SPRINGS[p.spring] || SPRINGS.Elastic;
      const dur = p.spring === 'Elastic' ? 0.9 : 0.45;
      movers = links.map((a) => ({
        a,
        x: gsap.quickTo(a, 'x', { duration: dur, ease }),
        y: gsap.quickTo(a, 'y', { duration: dur, ease }),
        ix: gsap.quickTo(a.firstElementChild, 'x', { duration: dur, ease }),
        iy: gsap.quickTo(a.firstElementChild, 'y', { duration: dur, ease }),
      }));
    };
    build();

    k.on(stage, 'pointermove', (e) => {
      const r = Number(p.radius);
      const s = Number(p.strength);
      movers.forEach((m) => {
        const b = m.a.getBoundingClientRect();
        // Measure from the link's resting centre, not where it's been pulled to.
        const cx = b.left + b.width / 2 - gsap.getProperty(m.a, 'x');
        const cy = b.top + b.height / 2 - gsap.getProperty(m.a, 'y');
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const near = Math.hypot(dx, dy) < r;
        m.a.classList.toggle('is-near', near);
        m.x(near ? dx * s : 0);
        m.y(near ? dy * s : 0);
        m.ix(near ? dx * s * 0.35 : 0);
        m.iy(near ? dy * s * 0.35 : 0);
      });
    });
    k.on(stage, 'pointerleave', () =>
      movers.forEach((m) => {
        m.a.classList.remove('is-near');
        m.x(0); m.y(0); m.ix(0); m.iy(0);
      })
    );
    links.forEach((a) => k.on(a, 'click', (e) => e.preventDefault()));

    return {
      destroy: () => k.destroy(),
      update(key) {
        if (key === 'spring') build();
      },
    };
  },
};
