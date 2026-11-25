/** Read More: the clipped text grows to full height, the fade mask lifts and the button flips its label. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Read More',
  element: 'Expandable panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Self-resizing', 'Reversible'],
  effect: ['Expansion', 'Contracting', 'Dissolving'],
  purpose: ['Focus', 'Hierarchy'],
  properties: ['Size', 'Opacity'],
  description: 'A long note that starts clipped under a soft fade. "Read more" grows it smoothly to its full height and lifts the fade; "Show less" folds it back.',
  params: [
    { key: 'lines', label: 'Lines shown', group: 'Layout', type: 'range', min: 2, max: 6, step: 1, default: 3 },
    { key: 'speed', label: 'Duration', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.6, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Link color'),
  ],
};

const TEXT = 'Every sheet in the archive starts as pulp: cotton rag beaten for hours, lifted on a mould, pressed and hung to dry. The deckle edge you see is not a flaw but a signature of the mould. Watermarks are wires sewn into the screen, thinning the paper where they sit. Hold a sheet to the window and the maker steps forward.';

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('more');
    k.html(`
      <div class="sp sp-more">
        <article class="sp-more__card">
          <h4>On paper</h4>
          <div class="sp-more__clip" id="${id}"><p>${TEXT}</p></div>
          <button type="button" class="sp-more__btn" aria-expanded="false" aria-controls="${id}">Read more <i aria-hidden="true">↓</i></button>
        </article>
      </div>`);
    const clip = k.$('.sp-more__clip');
    const btn = k.$('.sp-more__btn');
    const closed = () => parseFloat(getComputedStyle(clip).lineHeight) * p.lines;
    gsap.set(clip, { height: closed() });

    k.on(btn, 'click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.firstChild.textContent = open ? 'Show less ' : 'Read more ';
      const t = reducedMotion ? 0 : Number(p.speed);
      clip.classList.toggle('is-open', open);
      gsap.to(clip, { height: open ? clip.scrollHeight : closed(), duration: t, ease: 'power3.inOut' });
      gsap.to(btn.lastChild, { rotation: open ? 180 : 0, duration: t, ease: 'back.out(2)' });
    });

    return () => k.destroy();
  },
};
