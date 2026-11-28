/** Dust Image: delete a photo and it disintegrates: it crumbles into fine grains from one side to the other, the grains blowing away on the wind; restore brings it back grain by grain. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Dust Image',
  element: 'Image',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Disintegration', 'Dispersion', 'Drifting'],
  purpose: ['Feedback', 'Delight', 'Storytelling'],
  properties: ['Clip & mask', 'Position', 'Opacity'],
  description: 'An image card with a delete button that turns the picture to dust. The photo breaks into a fine grid of grains that come loose in a sweep from left to right and blow away up and to the right, thinning to nothing, leaving an empty frame. "Restore" plays it backwards: the grains drift in and settle into the picture.',
  params: [
    { key: 'grain', label: 'Grain', group: 'Shape', type: 'range', min: 8, max: 26, step: 1, unit: '', default: 16 },
    { key: 'wind', label: 'Wind', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: 'em', default: 4, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.1, unit: 's', default: 1.6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Delete'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const cols = Math.round(p.grain);
    k.html(`
      <div class="sp sp-tm sp-dst">
        <figure class="sp-dst__fig">
          <div class="sp-tm__frame sp-dst__frame" role="img" aria-label="Harbour at noon">${photo(1, 'sp-dst__img')}<div class="sp-cc__pieces"></div></div>
          <figcaption><span>harbour-noon.jpg</span><button type="button" class="sp-tm__btn sp-dst__go" aria-pressed="false">Delete</button></figcaption>
        </figure>
      </div>`);
    const img = k.$('.sp-dst__img');
    const frame = k.$('.sp-dst__frame');
    const host = k.$('.sp-cc__pieces');
    const go = k.$('.sp-dst__go');
    let gone = false, tl;
    k.on(go, 'click', () => {
      gone = !gone;
      go.setAttribute('aria-pressed', String(gone));
      go.textContent = gone ? 'Restore' : 'Delete';
      frame.setAttribute('aria-label', gone ? 'Deleted image' : 'Harbour at noon');
      tl?.kill();
      if (reducedMotion) return gsap.set(img, { autoAlpha: gone ? 0 : 1 });
      const bits = pieces(host, photo(1, 'sp-dst__img'), grid(cols, Math.round(cols * 0.6)));
      const scatter = ({ el, c: [cx] }) => ({ x: `${p.wind * (0.5 + Math.random())}em`, y: `${-p.wind * 0.6 * Math.random()}em`, rotation: (Math.random() - 0.5) * 90, scale: 0.3, autoAlpha: 0 });
      gsap.set(img, { autoAlpha: 0 });
      tl = gsap.timeline({ onComplete: () => { host.innerHTML = ''; gsap.set(img, { autoAlpha: gone ? 0 : 1 }); } });
      // the sweep: a grain's delay follows its x position (left first), with a little randomness
      bits.forEach((b) => {
        const at = (b.c[0] / 100) * p.time * 0.5 + Math.random() * 0.15;
        if (gone) tl.to(b.el, { ...scatter(b), duration: p.time * 0.6, ease: 'power2.in' }, at);
        else tl.from(b.el, { ...scatter(b), duration: p.time * 0.6, ease: 'power2.out' }, p.time * 0.5 - at + 0.15);
      });
    });
    return () => k.destroy();
  },
};
