/** Hop Paragraph: a read-along paragraph: a little marker hops from word to word in time with reading, each hop an arc that lands on the word and lights it; press play to follow along, or click any word to hop there. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { words } from './_tm.js';

const TEXT = 'The fox paused at the edge of the frozen pond, listened for the crack of ice, then trotted across in the blue light before dawn.';

export const meta = {
  title: 'Hop Paragraph',
  element: 'Paragraph',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Time-driven', 'Position-aware'],
  effect: ['Hopping', 'Parabolic-motion', 'Squashing'],
  purpose: ['Focus', 'Orientation', 'Storytelling'],
  properties: ['Position', 'Scale', 'Color'],
  description: 'A read-along paragraph for early readers. Press play and a small ball hops along the text, one arc per word, landing on top of each word just as it lights up, squashing a little on every landing; at the end of a line it takes a longer hop down to the start of the next. Click any word to make the ball hop straight to it.',
  params: [
    { key: 'pace', label: 'Time per word', group: 'Motion', type: 'range', min: 0.15, max: 0.8, step: 0.05, unit: 's', default: 0.35, live: true },
    { key: 'height', label: 'Hop height', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ball'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-hpp">
        <div class="sp-hpp__page"><p class="sp-tm__p sp-hpp__p">${words(TEXT, 'sp-tm__w sp-hpp__w')}</p><i class="sp-hpp__ball" aria-hidden="true"></i></div>
        <button type="button" class="sp-tm__btn" aria-pressed="false">▶ Read along</button>
      </div>`);
    const page = k.$('.sp-hpp__page');
    const ws = k.$$('.sp-hpp__w');
    const ball = k.$('.sp-hpp__ball');
    const go = k.$('.sp-tm__btn');
    ws.forEach((w) => { w.tabIndex = 0; w.setAttribute('role', 'button'); });
    // A word's landing spot (centre of its top edge), read once per hop
    const spot = (w) => [w.offsetLeft + w.offsetWidth / 2, w.offsetTop];
    let at = -1, timer;
    const E = () => parseFloat(getComputedStyle(page).fontSize) || 14;
    const hop = (i) => {
      const w = ws[i];
      const [x1, y1] = spot(w);
      const [x0, y0] = at >= 0 ? spot(ws[at]) : [x1, y1 - 20];
      at = i;
      ws.forEach((x, j) => x.classList.toggle('is-on', j === i));
      if (reducedMotion) return gsap.set(ball, { x: x1, y: y1, autoAlpha: 1 });
      const H = E() * p.height * (y1 !== y0 ? 1.6 : 1);
      const s = { u: 0 };
      gsap.timeline()
        .set(ball, { autoAlpha: 1, scaleX: 1, scaleY: 1 })
        .to(s, { u: 1, duration: p.pace * (y1 !== y0 ? 1.4 : 0.85), ease: 'none', onUpdate: () => gsap.set(ball, { x: x0 + (x1 - x0) * s.u, y: y0 + (y1 - y0) * s.u - 4 * H * s.u * (1 - s.u) }) })
        .to(ball, { scaleX: 1.4, scaleY: 0.65, duration: 0.06, transformOrigin: '50% 100%' })
        .to(ball, { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'back.out(3)' });
    };
    const stop = () => { timer?.kill(); go.setAttribute('aria-pressed', 'false'); go.textContent = '▶ Read along'; };
    const next = () => {
      if (at >= ws.length - 1) return stop();
      hop(at + 1);
      timer = gsap.delayedCall(p.pace, next);
    };
    k.on(go, 'click', () => {
      if (go.getAttribute('aria-pressed') === 'true') return stop();
      go.setAttribute('aria-pressed', 'true');
      go.textContent = '❚❚ Pause';
      if (at >= ws.length - 1) at = -1;
      next();
    });
    ws.forEach((w, i) => {
      k.on(w, 'click', () => { stop(); hop(i); });
      k.on(w, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), stop(), hop(i)));
    });
    gsap.set(ball, { autoAlpha: 0 });
    return () => { timer?.kill(); k.destroy(); };
  },
};
