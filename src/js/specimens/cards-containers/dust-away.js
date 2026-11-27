/** Dust Away: "Remove" turns the profile card to dust that the wind carries off, grain by grain; "Undo" blows it back together. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from './_pieces.js';

export const meta = {
  title: 'Dust Away',
  element: 'Profile card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Staggered', 'Randomized', 'Reversible', 'Direction-aware'],
  effect: ['Disintegration', 'Dispersion', 'Drifting', 'Reassembly'],
  purpose: ['Feedback', 'Storytelling', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Opacity', 'Scale'],
  description: 'Remove someone and their card turns to dust: starting from the side the wind comes from, it breaks into grains that drift, tumble and fade away. Undo gathers every grain back into place.',
  params: [
    { key: 'wind', label: 'Wind', group: 'Behavior', type: 'choice', options: ['From left', 'From right', 'Upward'], default: 'From left' },
    { key: 'grain', label: 'Grain', group: 'Shape', type: 'range', min: 6, max: 14, step: 1, unit: '', default: 10 },
    { key: 'time', label: 'Sweep time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.2, unit: 's', default: 1.4 },
    tone('#4f6b4a'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-dust">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-dust__card">
            <i class="sp-cc__avatar">CO</i>
            <b class="sp-cc__title">Chidi Okafor</b>
            <span class="sp-cc__kick">Front-end dev · Lagos</span>
            <span class="sp-cc__text">Friends since 2021 · 14 shared boards</span>
          </article>
          <div class="sp-cc__pieces"></div>
          <span class="sp-dust__gone">Removed</span>
        </div>
        <button type="button" class="sp-cc__btn sp-dust__btn" aria-live="polite">Remove</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-dust__card');
    const host = k.$('.sp-cc__pieces');
    const gone = k.$('.sp-dust__gone');
    const btn = k.$('.sp-dust__btn');
    k.fit(wrap, 0.8);
    gsap.set(gone, { autoAlpha: 0 });
    let tl;
    let removed = false;

    const build = () => {
      const g = Math.round(p.grain);
      const bits = pieces(host, card.outerHTML, grid(g, Math.round(g * 0.75)));
      const t = gsap.timeline({ paused: true }).set(card, { autoAlpha: 0 });
      const dir = { 'From left': [1, -0.4], 'From right': [-1, -0.4], Upward: [0.15, -1] }[p.wind];
      bits.forEach(({ el, c: [cx, cy] }) => {
        // Grains go in the order the wind reaches them, with a little scatter
        const order = p.wind === 'From left' ? cx : p.wind === 'From right' ? 100 - cx : 100 - cy;
        const at = (order / 100) * p.time * 0.7 + Math.random() * p.time * 0.3;
        const far = 4 + Math.random() * 6;
        t.to(el, {
          x: `${dir[0] * far + (Math.random() - 0.5) * 2}em`,
          y: `${dir[1] * far + (Math.random() - 0.5) * 3}em`,
          rotation: (Math.random() - 0.5) * 240,
          scale: 0.2 + Math.random() * 0.4,
          autoAlpha: 0,
          duration: 0.9 + Math.random() * 0.6,
          ease: 'power1.in',
        }, at);
      });
      return t.to(gone, { autoAlpha: 1, duration: 0.4 }, '-=0.5');
    };

    k.on(btn, 'click', () => {
      removed = !removed;
      btn.textContent = removed ? 'Undo' : 'Remove';
      if (removed) {
        tl?.kill();
        tl = build().play();
      } else {
        tl.eventCallback('onReverseComplete', () => (host.innerHTML = '')).timeScale(2).reverse();
      }
      if (reducedMotion) tl.progress(removed ? 1 : 0);
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
