/**
 * DESIGN TEMPLATE: copy this file and _template.css into a drawer folder.
 *
 *   1. Copy   _template.js  → <drawer>/<your-id>.js
 *             _template.css → <drawer>/<your-id>.css
 *      (<your-id> is lowercase-with-dashes, e.g. "press-button")
 *   2. Add 'your-id' to the END of <drawer>/index.js
 *   3. Fill in `meta` below and write `mount`. Refresh the page.
 *
 * The lab reads `meta` for the card, the filters and the workbench controls.
 * Classification terms must be spelled exactly as in src/data/taxonomy.js
 * (the browser console warns you about any typo).
 * Optional `variants: { Name: { key: value } }` = preset chips on the workbench.
 * Full rules (variant vs. new card, shorthand): DESIGN-GUIDE.md
 */
// Paths assume this file sits in a drawer folder (e.g. specimens/buttons-controls/).
import { kit, esc, labelsOf, EASES } from '../_kit.js';
import { tone, EASE_CHOICES } from '../_params.js';

export const meta = {
  title: 'Press Button', // card title
  element: 'Primary button', // ONE UI element (taxonomy ELEMENTS for this drawer)
  trigger: ['Hover', 'Click'], // what sets it off (TRIGGERS)
  behavior: ['Reactive'], // how it is placed / reacts (BEHAVIORS); may be []
  effect: ['Squashing', 'Bouncing'], // what the movement looks like (EFFECTS); may be []
  purpose: ['Feedback', 'Affordance'], // why it moves (PURPOSES)
  properties: ['Scale', 'Shadow'], // which element properties change (PROPERTIES)
  description: 'A paper button that lifts when you hover it and squashes flat when pressed, then bounces back.',
  notes: '', // optional: extra hints for the AI prompt (feel, timing, edge cases)

  // Workbench controls. See _params.js for every control type.
  params: [
    { key: 'label', label: 'Label', group: 'Content', type: 'text', default: 'Send it' },
    tone('#111111'), // → CSS var --sp-accent on the stage
    { key: 'lift', label: 'Hover lift', group: 'Motion', type: 'range', min: 0, max: 12, step: 1, unit: 'px', default: 5, live: true },
    { key: 'ease', label: 'Ease', group: 'Motion', type: 'choice', options: EASE_CHOICES, default: 'Elastic', live: true },
  ],
};

export default {
  /**
   * Build the design inside `stage` (an empty, position:relative box).
   * `p` holds the current control values and is updated live by the
   * workbench, so read p.<key> inside your handlers, not once at the top.
   */
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap); // helpers: k.$, k.$$, k.html, k.on, k.resize, k.inView, k.destroy
    const text = labelsOf(p.label, ['Send it'])[0];

    k.html(`
      <div class="sp sp-tpl">
        <button type="button" class="sp-tpl__btn"><span>${esc(text)}</span></button>
        <p class="sp-note">Hover · press</p>
      </div>`);

    const btn = k.$('.sp-tpl__btn');
    const ease = () => EASES[p.ease] || 'expo.out';

    k.on(btn, 'pointerenter', () => gsap.to(btn, { y: -Number(p.lift), duration: 0.4, ease: ease() }));
    k.on(btn, 'pointerleave', () => gsap.to(btn, { y: 0, scaleY: 1, duration: 0.5, ease: ease() }));
    k.on(btn, 'pointerdown', () => gsap.to(btn, { y: 0, scaleY: 0.86, duration: 0.12, ease: 'power2.out' }));
    k.on(btn, 'pointerup', () => {
      if (reducedMotion) return gsap.set(btn, { scaleY: 1 });
      gsap.to(btn, { y: -Number(p.lift), scaleY: 1, duration: 0.7, ease: ease() });
    });

    // Return a cleanup function, or { destroy, update(key) } to react to `live` params.
    return () => k.destroy();
  },
};
