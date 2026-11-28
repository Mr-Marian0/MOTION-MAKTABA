/** Glitch Search: a search that finds nothing glitches: the bar tears into sideways-jumping slices with red and cyan channels pulling apart for a moment, then snaps back with the "no results" message. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

const DATA = ['Typewriter', 'Tape deck', 'Turntable', 'Telephone', 'Television'];

export const meta = {
  title: 'Glitch Search',
  element: 'Search bar',
  trigger: ['Keyboard', 'Click'],
  behavior: ['Conditional', 'Randomized', 'Event-driven'],
  effect: ['Glitching', 'RGB-splitting', 'Jittering'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Color'],
  description: 'A retro-tech search where a dead end looks like a bad signal. Search for something that is not there and, for half a second, the bar glitches: horizontal slices of it jump left and right in hard, dropped-frame steps while its red and cyan colour channels split apart, then everything snaps back clean and "No signal for …" appears. Searches that match just list their results.',
  params: [
    { key: 'tear', label: 'Tear', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    { key: 'frames', label: 'Glitch frames', group: 'Motion', type: 'range', min: 3, max: 14, step: 1, unit: '', default: 8, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Alert'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('gls');
    k.html(`
      <div class="sp sp-fi sp-gli">
        <div class="sp-fi__wrap">
          <form class="sp-gli__stack" role="search">
            <div class="sp-gli__layer sp-gli__layer--r" aria-hidden="true"></div>
            <div class="sp-gli__layer sp-gli__layer--c" aria-hidden="true"></div>
            <div class="sp-fi__box sp-gli__bar"><i class="sp-fi__icon" aria-hidden="true">⌕</i><input class="sp-fi__input" id="${id}" type="search" value="Walkman" aria-label="Search the archive" /><button class="sp-fi__btn">Go</button></div>
          </form>
          <ul class="sp-gli__results" aria-live="polite"></ul>
        </div>
      </div>`);
    const form = k.$('form');
    const bar = k.$('.sp-gli__bar');
    const layers = k.$$('.sp-gli__layer');
    const input = k.$('input');
    const out = k.$('.sp-gli__results');
    const glitch = () => {
      const tl = gsap.timeline();
      const n = Math.round(p.frames);
      // each frame: the bar is clipped to a random band and shifted; the colour layers jump apart
      for (let f = 0; f < n; f++) {
        const top = Math.random() * 70, h = 10 + Math.random() * 30;
        const amt = p.tear * (1 - f / n);
        tl.set(bar, { x: `${(Math.random() - 0.5) * 2 * amt}em`, clipPath: Math.random() < 0.6 ? `inset(${top}% -5% ${Math.max(0, 100 - top - h)}% -5%)` : 'inset(-10% -10% -10% -10%)' }, f * 0.05)
          .set(layers, { autoAlpha: 0.8, x: (i) => `${(i ? 1 : -1) * amt * (0.4 + Math.random() * 0.6)}em` }, f * 0.05);
      }
      return tl.set(bar, { x: 0, clipPath: 'inset(-10% -10% -10% -10%)' }, n * 0.05).set(layers, { autoAlpha: 0, x: 0 }, n * 0.05);
    };
    gsap.set(layers, { autoAlpha: 0 });
    k.on(form, 'submit', (e) => {
      e.preventDefault();
      const q = input.value.trim();
      if (!q) return;
      const hits = DATA.filter((d) => d.toLowerCase().includes(q.toLowerCase()));
      const show = () => (out.innerHTML = hits.length ? hits.map((h) => `<li>${h}</li>`).join('') : `<li class="sp-gli__none">No signal for “${q.replace(/[<&]/g, '')}”</li>`);
      if (hits.length || reducedMotion) return show();
      out.innerHTML = '';
      glitch().call(show);
    });
    return () => k.destroy();
  },
};
