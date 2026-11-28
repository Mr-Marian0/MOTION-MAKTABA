/** Datamosh Lightbox: stepping to the next photo moshes it in like broken video: blocks of the old frame keep sliding along the direction of travel, smeared over the new one, until they drop out. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Datamosh Lightbox',
  element: 'Lightbox',
  trigger: ['Click', 'Keyboard', 'Swipe'],
  behavior: ['Toggle-dependent', 'Direction-aware', 'Randomized'],
  effect: ['Datamoshing', 'Motion-smear', 'Sliding'],
  purpose: ['Continuity', 'Delight', 'Navigation'],
  properties: ['Clip & mask', 'Position', 'Scale', 'Opacity'],
  description: 'A photo lightbox with a compression glitch for a transition. Step to the next or previous photo and the old frame breaks into blocks that keep sliding the way you moved, stretching and stuttering over the new photo like a video whose keyframe went missing, then drop out one by one until the new picture is clean. Arrows, the arrow keys and a swipe all step.',
  params: [
    { key: 'drift', label: 'Smear', group: 'Motion', type: 'range', min: 0.5, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'blocks', label: 'Blocks across', group: 'Shape', type: 'range', min: 4, max: 14, step: 1, unit: '', default: 8 },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun'),
  ],
};

const SHOTS = [['Dusk', 0], ['Lagoon', 150], ['Moss', 75], ['Violet hour', 250]];
const frame = (i) => `<i class="sp-ov__photo sp-dmo__img" style="filter:hue-rotate(${SHOTS[i][1]}deg)"></i>`;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-dmo', `
      <div class="sp-ov__light sp-dmo__light" role="dialog" aria-label="Photos" tabindex="-1">
        <div class="sp-dmo__now">${frame(0)}</div>
        <div class="sp-cc__pieces"></div>
        <b class="sp-dmo__cap" aria-live="polite">${SHOTS[0][0]}</b>
        <button type="button" class="sp-ov__btn sp-dmo__nav sp-dmo__nav--prev" aria-label="Previous photo">‹</button>
        <button type="button" class="sp-ov__btn sp-dmo__nav sp-dmo__nav--next" aria-label="Next photo">›</button>
      </div>`, { label: 'Open album', title: 'Summer', kick: 'Photos' }));
    const light = k.$('.sp-dmo__light');
    const now = k.$('.sp-dmo__now');
    const host = k.$('.sp-cc__pieces');
    const cap = k.$('.sp-dmo__cap');
    const cols = Math.round(p.blocks);
    gsap.set(light, { autoAlpha: 0 });
    let at = 0, mosh;
    const go = (dir) => {
      const old = at;
      at = (at + dir + SHOTS.length) % SHOTS.length;
      now.innerHTML = frame(at);
      cap.textContent = SHOTS[at][0];
      mosh?.kill();
      if (reducedMotion) return (host.innerHTML = '');
      // The old frame as blocks: each keeps moving in the step's direction in jerky jumps (steps = dropped
      // frames), stretched along the way, and vanishes at a random moment.
      const bits = pieces(host, frame(old), grid(cols, Math.max(2, Math.round(cols * 0.6))));
      mosh = gsap.timeline({ onComplete: () => (host.innerHTML = '') });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const r = Math.random();
        const life = p.time * (0.3 + r * 0.7);
        gsap.set(el, { transformOrigin: `${cx}% ${cy}%` });
        mosh
          .to(el, { x: `${dir * p.drift * (0.3 + Math.random())}em`, y: `${(Math.random() - 0.5) * 0.4}em`, scaleX: 1 + Math.random() * 0.8, duration: life, ease: `steps(${3 + Math.floor(r * 4)})` }, 0)
          .set(el, { autoAlpha: 0 }, life);
      });
    };
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline().fromTo(light, { autoAlpha: 1, scale: 0.92 }, { scale: 1, duration: 0.35, ease: 'power3.out' })
      : gsap.timeline().to(light, { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: 'power2.in' }), ['Open album', 'Close']);
    k.on(k.$('.sp-dmo__nav--prev'), 'click', () => go(-1));
    k.on(k.$('.sp-dmo__nav--next'), 'click', () => go(1));
    k.on(k.$('.sp-ov'), 'keydown', (e) => {
      const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (d && light.style.visibility !== 'hidden') e.preventDefault(), go(d);
    });
    // Swipe: a horizontal drag of 30px or more steps the way it went (left swipe = next)
    let x0 = null;
    k.on(light, 'pointerdown', (e) => (x0 = e.clientX));
    k.on(light, 'pointerup', (e) => {
      if (x0 !== null && Math.abs(e.clientX - x0) > 30) go(e.clientX < x0 ? 1 : -1);
      x0 = null;
    });
    return () => { mosh?.kill(); k.destroy(); };
  },
};
