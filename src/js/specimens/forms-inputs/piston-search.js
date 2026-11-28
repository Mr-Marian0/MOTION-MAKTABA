/** Piston Search: hit search and a little engine at the end of the bar starts up: three pistons pump in firing order while the search runs, then cough to a stop when the results are in. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Piston Search',
  element: 'Search bar',
  trigger: ['Keyboard', 'Click'],
  behavior: ['Event-driven', 'Sequential', 'Periodic'],
  effect: ['Piston-motion', 'Reciprocating', 'Vibrating'],
  purpose: ['Progress', 'Feedback', 'Delight'],
  properties: ['Position', 'Scale'],
  description: 'A parts-catalogue search with an engine for a loading indicator. Press Enter or the go button and three tiny pistons at the end of the bar start pumping in a 1-3-2 firing order, the bar trembling slightly with each stroke, for as long as the search takes. When the results arrive they give one last stroke, settle to a stop and the count appears.',
  params: [
    { key: 'rpm', label: 'Stroke time', group: 'Motion', type: 'range', min: 0.1, max: 0.6, step: 0.02, unit: 's', default: 0.24, live: true },
    { key: 'search', label: 'Search time', group: 'Behavior', type: 'range', min: 0.5, max: 4, step: 0.1, unit: 's', default: 1.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Engine'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('pis');
    k.html(`
      <div class="sp sp-fi sp-pis">
        <div class="sp-fi__wrap">
          <form class="sp-fi__box sp-pis__bar" role="search">
            <input class="sp-fi__input" id="${id}" type="search" value="m6 hex bolt" aria-label="Search parts" />
            <button class="sp-pis__go" aria-label="Search"><span class="sp-pis__block" aria-hidden="true">${'<i class="sp-pis__cyl"><b></b></i>'.repeat(3)}</span></button>
          </form>
          <small class="sp-fi__msg" aria-live="polite"></small>
        </div>
      </div>`);
    const bar = k.$('.sp-pis__bar');
    const input = k.$('.sp-fi__input');
    const heads = k.$$('.sp-pis__cyl b');
    const msg = k.$('.sp-fi__msg');
    let engine, busy = false;
    k.on(bar, 'submit', (e) => {
      e.preventDefault();
      if (busy || !input.value.trim()) return;
      busy = true;
      msg.textContent = 'Searching…';
      const q = input.value.trim();
      const done = () => { busy = false; msg.textContent = `${23 + (q.length % 17)} parts match “${q}”`; };
      if (reducedMotion) return gsap.delayedCall(p.search, done);
      // Firing order 1-3-2: each piston's stroke is offset by a third of a cycle
      const order = [0, 2, 1];
      engine = gsap.timeline({ repeat: -1 });
      heads.forEach((h, i) => engine.fromTo(h, { y: 0 }, { y: '-0.55em', duration: p.rpm / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, (order.indexOf(i) * p.rpm) / 3));
      engine.fromTo(bar, { x: 0 }, { x: 0.6, duration: p.rpm / 6, yoyo: true, repeat: 5, ease: 'none' }, 0);
      gsap.delayedCall(p.search, () => {
        engine.repeat(0);
        engine.eventCallback('onComplete', () => { gsap.to(heads, { y: 0, duration: 0.3, ease: 'bounce.out' }); done(); });
      });
    });
    return () => { engine?.kill(); k.destroy(); };
  },
};
