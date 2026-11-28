/** Dent Field: the field's outline is soft: pressing it pushes a dent in right where you clicked, and every keystroke taps a little dent at the end of the text; each springs back out. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Dent Field',
  element: 'Text field',
  trigger: ['Click', 'Keyboard', 'Focus'],
  behavior: ['Position-aware', 'Elastic', 'Reactive'],
  effect: ['Deformation', 'Surface-deformation', 'Elastic-deformation', 'Damped-oscillation'],
  purpose: ['Feedback', 'Affordance', 'Delight'],
  properties: ['Shape', 'Path', 'Border'],
  description: 'A name field with a soft outline. Press anywhere on it and the frame dents in under your finger (top and bottom edges pinch towards each other) then springs back out with a wobble. Each key you type taps a smaller dent at the end of the text, so the box seems to react to the writing.',
  params: [
    { key: 'depth', label: 'Dent depth', group: 'Motion', type: 'range', min: 2, max: 14, step: 1, unit: '', default: 8, live: true },
    { key: 'spread', label: 'Dent width', group: 'Shape', type: 'range', min: 4, max: 20, step: 1, unit: '%', default: 9, live: true },
    { key: 'typeDent', label: 'Dent on typing', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Focus'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('dent');
    k.html(`
      <div class="sp sp-fi sp-dnt">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Full name</label>
          <div class="sp-dnt__box">
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path class="sp-dnt__shadow" /><path class="sp-dnt__edge" /></svg>
            <input class="sp-fi__input sp-dnt__input" id="${id}" autocomplete="off" placeholder="Ada Lovelace" />
          </div>
          <p class="sp-note">Press the field · type</p>
        </div>
      </div>`);
    const box = k.$('.sp-dnt__box');
    const input = k.$('.sp-dnt__input');
    const [shadow, edge] = k.$$('.sp-dnt__box path');
    // One dent at a time: centre x (0..100), depth now. The edges are sampled at 41 points.
    const s = k.track({ x: 50, depth: 0 });
    const xs = Array.from({ length: 41 }, (_, i) => i * 2.5);
    const draw = () => {
      const bump = (x) => s.depth * Math.exp(-(((x - s.x) / p.spread) ** 2));
      const top = xs.map((x) => `${x} ${(1.5 + bump(x)).toFixed(2)}`);
      const bot = xs.map((x) => `${x} ${(38.5 - bump(x) * 0.6).toFixed(2)}`).reverse();
      const d = `M${top.join(' L')} L${bot.join(' L')} Z`;
      edge.setAttribute('d', d);
      shadow.setAttribute('d', d);
    };
    draw();
    const dent = (x, depth) => {
      if (reducedMotion) return;
      s.x = x;
      gsap.timeline({ onUpdate: draw })
        .to(s, { depth, duration: 0.08, ease: 'power2.out', overwrite: true })
        .to(s, { depth: 0, duration: 0.9, ease: 'elastic.out(1.2, 0.3)' });
    };
    let W = 1;
    k.resize(box, () => (W = box.offsetWidth));
    k.on(box, 'pointerdown', (e) => dent(((e.clientX - box.getBoundingClientRect().left) / W) * 100, p.depth));
    // Typing: a small tap where the text ends (roughly 0.6em per character of the 1.2em display face)
    k.on(input, 'input', () => p.typeDent && dent(Math.min(92, 5 + input.value.length * 3.1), p.depth * 0.4));
    return () => k.destroy();
  },
};
