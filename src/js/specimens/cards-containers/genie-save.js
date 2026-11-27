/** Genie Save: "Save for later" pours the product card into the Saved dock: it tapers to a narrow neck toward the dock, bottom first, and slips inside. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from './_pieces.js';

export const meta = {
  title: 'Genie Save',
  element: 'Product card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Reversible', 'Sequential', 'Docked', 'Toggle-dependent'],
  effect: ['Tapering', 'Curved-path-motion', 'Bouncing'],
  purpose: ['Feedback', 'Continuity', 'Wayfinding'],
  properties: ['Scale', 'Position', 'Clip & mask', 'Shape'],
  description: 'Save a product and the card pours itself into the Saved dock: the bottom tapers first into a narrow neck that bends toward the dock, then the rest follows it in. The dock bounces and counts up. "Bring back" plays it out again.',
  params: [
    { key: 'neck', label: 'Neck width', group: 'Shape', type: 'range', min: 0.03, max: 0.4, step: 0.01, unit: '×', default: 0.08, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    { key: 'bands', label: 'Smoothness', group: 'Shape', type: 'range', min: 8, max: 30, step: 1, unit: '', default: 18 },
    tone('#4f6b4a'),
  ],
};

const GAP = 2.6; // em from the card's foot down to the dock
const DOCK_X = 4.5; // em right of the card's centre

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-gen">
        <div class="sp-cc__wrap sp-gen__wrap">
          <article class="sp-cc__card sp-gen__card">
            <i class="sp-cc__img"></i>
            <b class="sp-cc__title">Field Notebook</b>
            <span class="sp-cc__text">Dot grid · 96 pages · linen</span>
            <div class="sp-cc__row"><b class="sp-cc__price">$18</b><span class="sp-cc__btn sp-cc__btn--ghost">Details</span></div>
          </article>
          <div class="sp-cc__pieces"></div>
          <span class="sp-gen__dock">Saved <b aria-live="polite">0</b></span>
        </div>
        <button type="button" class="sp-cc__btn sp-gen__btn" aria-pressed="false">Save for later</button>
      </div>`);
    const wrap = k.$('.sp-gen__wrap');
    const card = k.$('.sp-gen__card');
    const host = k.$('.sp-cc__pieces');
    const dock = k.$('.sp-gen__dock');
    const count = k.$('.sp-gen__dock b');
    const btn = k.$('.sp-gen__btn');
    k.fit(wrap, 0.86);
    const s = k.track({ t: 0 });
    let bands = [];
    let saved = 0;
    let tw;

    let H = 0; // card height in em, measured once per save (not every frame)
    const draw = () => {
      const n = bands.length;
      const f = bands.map((_, i) => clamp(s.t * 1.8 - (1 - (i + 0.5) / n) * 0.8, 0, 1)); // bottom bands go first
      const drop = clamp((s.t - 0.25) / 0.75, 0, 1) ** 2 * (GAP + H * 0.4 + 1);
      // Stack the squeezed bands upward from the (falling) foot, so there are no gaps between them
      let foot = H + drop;
      for (let i = n - 1; i >= 0; i--) {
        const h = (H / n) * (1 - 0.6 * f[i]);
        const centre = foot - h / 2;
        foot -= h;
        gsap.set(bands[i].el, {
          y: `${centre - ((i + 0.5) / n) * H}em`,
          x: `${DOCK_X * f[i]}em`,
          scaleX: 1 - (1 - p.neck) * f[i],
          scaleY: 1 - 0.6 * f[i],
          autoAlpha: centre > H + GAP ? 0 : 1, // inside the dock
        });
      }
    };

    k.on(btn, 'click', () => {
      const save = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(save));
      btn.textContent = save ? 'Bring back' : 'Save for later';
      tw?.kill();
      H = card.offsetHeight / parseFloat(getComputedStyle(card).fontSize);
      if (save && !bands.length) {
        bands = pieces(host, card.outerHTML, grid(1, Math.round(p.bands)));
        gsap.set(card, { autoAlpha: 0 });
      }
      tw = gsap.to(s, {
        t: save ? 1 : 0,
        duration: reducedMotion ? 0 : p.time,
        ease: save ? 'power2.in' : 'power2.out',
        onUpdate: draw,
        onComplete: () => {
          if (save) {
            count.textContent = ++saved;
            gsap.fromTo(dock, { scale: 1.25 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
          } else {
            gsap.set(card, { autoAlpha: 1 });
            host.innerHTML = '';
            bands = [];
            count.textContent = --saved;
          }
        },
      });
    });

    return () => { tw?.kill(); k.destroy(); };
  },
};
