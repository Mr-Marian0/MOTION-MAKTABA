/** Burn Reveal: the message is hidden under a sheet of paper that catches fire from one corner: a ragged, glowing burn edge spreads across it, eating the paper away to reveal the words underneath. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Burn Reveal',
  element: 'Text reveal',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Randomized', 'Sequential'],
  effect: ['Fire-motion', 'Dissolving', 'Expansion'],
  purpose: ['Storytelling', 'Delight'],
  properties: ['Clip & mask', 'Path', 'Color'],
  description: 'A launch message under a sheet of paper. When it comes into view (or on click) the paper catches in its bottom-left corner and burns: a ragged hole spreads outward, its edge glowing orange and wavering as it grows, the charred rim darkening behind the flame, until the whole sheet has burned away and the message stands in the clear. Click again to lay a new sheet.',
  params: [
    { key: 'text', label: 'Message', group: 'Content', type: 'text', default: 'Now open in Lisbon' },
    { key: 'time', label: 'Burn time', group: 'Motion', type: 'range', min: 0.8, max: 4, step: 0.1, unit: 's', default: 2, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Message'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-brv">
        <div class="sp-brv__box" tabindex="0" role="button" aria-label="${esc(p.text)} (click to burn again)">
          <h4 class="sp-tm__h sp-brv__h" aria-hidden="true">${esc(p.text)}</h4>
          <i class="sp-brv__paper" aria-hidden="true"></i>
          <svg class="sp-brv__edge" aria-hidden="true"><polyline class="sp-brv__char" /><polyline class="sp-brv__flame" /></svg>
        </div>
      </div>`);
    const box = k.$('.sp-brv__box');
    const paper = k.$('.sp-brv__paper');
    const svg = k.$('.sp-brv__edge');
    const [char, flame] = k.$$('.sp-brv__edge polyline');
    let W = 300, H = 120;
    k.resize(box, () => { W = box.offsetWidth; H = box.offsetHeight; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); });
    // The hole: a ragged blob around the bottom-left corner. Its radius grows; each of N rays has its own wobble.
    const N = 48;
    const seed = Array.from({ length: N }, () => Math.random());
    const s = { r: 0, t: 0 };
    const draw = () => {
      const R = s.r * Math.hypot(W, H) * 1.1;
      const pts = Array.from({ length: N + 1 }, (_, i) => {
        const a = (-Math.PI / 2) * (i / N); // from straight up to straight right, around the corner (0, H)
        const wob = 1 + (seed[i % N] - 0.5) * 0.35 + Math.sin(i * 1.7 + s.t * 9) * 0.06;
        return [Math.cos(a) * R * wob, H + Math.sin(a) * R * wob];
      });
      const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
      // the paper is everything outside the hole: outer rectangle + hole, even-odd
      paper.style.clipPath = `path(evenodd, 'M0 0 H${W} V${H} H0 Z M0 ${H} L${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')} Z')`;
      flame.setAttribute('points', poly);
      char.setAttribute('points', poly);
    };
    let tl;
    const burn = () => {
      tl?.kill();
      if (reducedMotion) { gsap.set([paper, svg], { autoAlpha: 0 }); return; }
      gsap.set([paper, svg], { autoAlpha: 1 });
      seed.forEach((_, i) => (seed[i] = Math.random()));
      tl = gsap.timeline({ onUpdate: draw })
        .fromTo(s, { r: 0, t: 0 }, { r: 1, t: p.time, duration: p.time, ease: 'power1.in' })
        .to(svg, { autoAlpha: 0, duration: 0.3 }, '-=0.25')
        .set(paper, { autoAlpha: 0 }); // the ragged edge may leave a scrap in the far corner
    };
    gsap.set(paper, { autoAlpha: 1 });
    k.inView(box, () => !tl && burn());
    k.on(box, 'click', burn);
    k.on(box, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), burn()));
    return () => k.destroy();
  },
};
