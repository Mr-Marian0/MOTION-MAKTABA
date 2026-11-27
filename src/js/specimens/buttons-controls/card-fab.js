/** Card FAB: a card of actions bounces up out of the button; closing folds its rows away like a paper fan. */
import { kit, esc, labelsOf, fabToggle } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Card FAB',
  element: 'FAB',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Activation-dependent', 'Staggered', 'Reversible'],
  effect: ['Bouncing', 'Overshoot-motion', 'Folding', 'Expansion'],
  purpose: ['Hierarchy', 'Affordance'],
  properties: ['Scale', 'Rotation', 'Size'],
  description: 'A card of actions pops up out of the button with a bounce, its rows settling in one after another. Closing folds the rows down one by one, like folding a paper strip, and the card tucks back into the button.',
  params: [
    { key: 'labels', label: 'Actions', group: 'Content', type: 'text', default: 'Draft, Share, Archive, Delete' },
    { key: 'bounce', label: 'Bounce', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, default: 0.5, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const acts = labelsOf(p.labels, ['Draft', 'Share']).slice(0, 6);
    k.html(`
      <div class="sp sp-fabx sp-card">
        <div class="sp-fabx__hub">
          <div class="sp-card__panel">${acts.map((a) => `<button type="button" class="sp-card__row">${esc(a)}</button>`).join('')}</div>
        </div>
        <button type="button" class="sp-fabx__main" aria-expanded="false" aria-label="Actions"><i aria-hidden="true">+</i></button>
        <p class="sp-note">Click the button</p>
      </div>`);
    const panel = k.$('.sp-card__panel');
    const rows = k.$$('.sp-card__row');
    gsap.set(panel, { scale: 0, autoAlpha: 0, transformOrigin: '0% 100%' });

    fabToggle(k, gsap, k.$('.sp-fabx__main'), rows, (open) =>
      open
        ? (gsap.set(rows, { clearProps: 'height,transform,opacity,visibility' }), gsap.timeline())
          .fromTo(panel, { scale: 0, autoAlpha: 1 }, { scale: 1, duration: 0.8, ease: `elastic.out(1, ${1.1 - Number(p.bounce)})` })
          .from(rows, { y: '0.8em', autoAlpha: 0, duration: 0.4, stagger: 0.06, ease: 'back.out(2)' }, 0.1)
        // Fold: from the top, each row tips flat toward the button while its height collapses.
        : gsap.timeline()
          .to(rows, { rotationX: 90, height: 0, autoAlpha: 0.4, transformOrigin: '50% 100%', duration: 0.22, stagger: 0.08, ease: 'power2.in' })
          .to(panel, { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'back.in(2)' }, '-=0.05'), reducedMotion);

    return () => k.destroy();
  },
};
