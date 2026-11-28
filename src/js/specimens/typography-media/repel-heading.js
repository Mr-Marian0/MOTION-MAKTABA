/** Repel Heading: the letters are like charged particles that keep away from the pointer: as it moves through the headline they scatter out of its path, pushed harder the closer it comes, and drift back into the word behind it. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { letters } from './_tm.js';

export const meta = {
  title: 'Repel Heading',
  element: 'Heading',
  trigger: ['Cursor move', 'Hover'],
  behavior: ['Repelled', 'Proximity-aware', 'Elastic'],
  effect: ['Repulsion-motion', 'Scattering', 'Spring-motion'],
  purpose: ['Delight', 'Branding'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A headline that will not let you touch it. Run the pointer (or a finger) through the letters and they shy away from it like charged particles: each is pushed directly away from the pointer, harder and further the closer it is, turning slightly and shrinking as it flees, so the pointer carves a gap through the word. Behind it the letters drift back into place.',
  params: [
    { key: 'text', label: 'Headline', group: 'Content', type: 'text', default: 'Personal space' },
    { key: 'push', label: 'Push', group: 'Motion', type: 'range', min: 0.3, max: 3, step: 0.1, unit: 'em', default: 1.4, live: true },
    { key: 'reach', label: 'Reach', group: 'Shape', type: 'range', min: 1, max: 6, step: 0.25, unit: 'em', default: 2.5, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-rep">
        <h4 class="sp-tm__h sp-rep__h" aria-label="${esc(p.text)}">${letters(p.text, 'sp-tm__c sp-rep__c')}</h4>
        <p class="sp-note">Move the pointer through the letters</p>
      </div>`);
    const h = k.$('.sp-rep__h');
    const cs = k.$$('.sp-rep__c');
    let C = [], E = 40;
    k.resize(h, () => { E = parseFloat(getComputedStyle(h).fontSize) || 40; C = cs.map((c) => [c.offsetLeft + c.offsetWidth / 2, c.offsetTop + c.offsetHeight / 2]); });
    const mv = cs.map((c) => ['x', 'y', 'rotation', 'scaleX', 'scaleY'].map((prop) => gsap.quickTo(c, prop, { duration: 0.5, ease: 'power3.out' })));
    let box;
    k.on(h, 'pointerenter', () => (box = h.getBoundingClientRect()));
    k.on(h, 'pointermove', (e) => {
      if (!box || reducedMotion) return;
      const [px, py] = [e.clientX - box.left, e.clientY - box.top];
      cs.forEach((c, i) => {
        const dx = C[i][0] - px, dy = C[i][1] - py, d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - d / (p.reach * E * 0.5));
        const push = f * f * p.push * E * 0.5;
        mv[i][0]((dx / d) * push); mv[i][1]((dy / d) * push); mv[i][2]((dx / d) * f * 25); mv[i][3](1 - f * 0.3); mv[i][4](1 - f * 0.3);
      });
    });
    k.on(h, 'pointerleave', () => {
      box = null;
      gsap.to(cs, { x: 0, y: 0, rotation: 0, scale: 1, duration: 0.9, ease: 'elastic.out(1, 0.45)', stagger: 0.015, overwrite: true });
    });
    return () => k.destroy();
  },
};
