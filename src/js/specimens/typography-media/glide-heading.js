/** Glide Heading: the headline glides in like a paper plane: it sweeps in from the side on a long shallow descent, banking as it turns, and levels out onto the baseline; each word follows a slightly different line. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { words } from './_tm.js';

export const meta = {
  title: 'Glide Heading',
  element: 'Heading',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Staggered', 'Momentum-driven'],
  effect: ['Gliding', 'Curved-path-motion', 'Decelerating'],
  purpose: ['Storytelling', 'Delight', 'Branding'],
  properties: ['Position', 'Rotation', 'Opacity'],
  description: 'A travel headline that arrives on the air. When it comes into view each word glides in from the left like a paper plane on a long, shallow, curving descent: starting high and tilted, banking as it comes round, losing speed and levelling out to land on the baseline. The words fly one after another on slightly different paths. Click to send them round again.',
  params: [
    { key: 'text', label: 'Headline', group: 'Content', type: 'text', default: 'Fly north for winter' },
    { key: 'time', label: 'Glide time', group: 'Motion', type: 'range', min: 0.6, max: 2.5, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'bank', label: 'Bank', group: 'Motion', type: 'range', min: 0, max: 30, step: 1, unit: '°', default: 14, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Last word'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-gld">
        <h4 class="sp-tm__h sp-gld__h" tabindex="0" aria-label="${esc(p.text)}"><span aria-hidden="true">${words(p.text, 'sp-tm__w sp-gld__w')}</span></h4>
        <p class="sp-note">Click to fly it in again</p>
      </div>`);
    const h = k.$('.sp-gld__h');
    const ws = k.$$('.sp-gld__w');
    ws[ws.length - 1]?.classList.add('is-last');
    const fly = () => {
      if (reducedMotion) return gsap.set(ws, { x: 0, y: 0, rotation: 0, opacity: 1 });
      const E = parseFloat(getComputedStyle(h).fontSize) || 30; // px per em, read once per flight
      ws.forEach((w, i) => {
        // a path: far left and high, sweeping down in a curve; rotation banks into the turn then levels
        const s = { u: 0 };
        const dx = 14 + i * 2, dy = 3 + (i % 2) * 1.5;
        gsap.fromTo(s, { u: 0 }, { u: 1, duration: p.time, delay: i * 0.15, ease: 'power2.out', overwrite: true, onUpdate: () => {
          const u = s.u;
          gsap.set(w, { x: -dx * (1 - u) * E, y: (-dy * (1 - u) * (1 - u) + Math.sin(u * Math.PI) * 0.6) * E, rotation: -p.bank * Math.sin((1 - u) * Math.PI * 0.9), opacity: Math.min(1, u * 3) });
        } });
      });
    };
    gsap.set(ws, { opacity: 0 });
    k.inView(h, fly);
    k.on(h, 'click', fly);
    k.on(h, 'keydown', (e) => e.key === 'Enter' && fly());
    return () => k.destroy();
  },
};
