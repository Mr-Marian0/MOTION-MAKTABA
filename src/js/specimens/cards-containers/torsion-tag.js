/** Torsion Tag: a price tag pinned at the top. Drag sideways to wring it: the bottom turns most, the pinned top hardly at all. Let go and it untwists in a long damped wobble. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from './_pieces.js';

export const meta = {
  title: 'Torsion Tag',
  element: 'Content card',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Anchored', 'Elastic', 'Physics-driven', 'Interruptible'],
  effect: ['Torsional-deformation', 'Damped-oscillation', 'Oscillatory-rotation'],
  purpose: ['Delight', 'Affordance'],
  properties: ['Rotation', 'Clip & mask'],
  description: 'A sale tag hanging from a pin. Drag sideways to wring it: the twist grows from the pinned top to the free bottom, showing the plain kraft back as it turns. Let go and it untwists and overshoots back and forth, slower each time, until it hangs still. Click for a quick spin.',
  params: [
    { key: 'max', label: 'Max twist', group: 'Shape', type: 'range', min: 90, max: 720, step: 30, unit: '°', default: 360, live: true },
    { key: 'damp', label: 'Damping', group: 'Motion', type: 'range', min: 0.05, max: 0.6, step: 0.05, unit: '', default: 0.15, live: true },
    { key: 'bands', label: 'Bands', group: 'Shape', type: 'range', min: 6, max: 30, step: 1, unit: '', default: 18 },
    tone('#b3412e'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const faces = `
      <div class="sp-tor__faces">
        <article class="sp-cc__card sp-tor__front">
          <i class="sp-tor__hole"></i>
          <span class="sp-cc__kick">Winter sale</span>
          <b class="sp-cc__big">−40%</b>
          <span class="sp-cc__text">Wool scarves, all colours</span>
          <span class="sp-cc__price">$27 <s>$45</s></span>
        </article>
        <article class="sp-cc__card sp-tor__back"><i class="sp-tor__hole"></i><i class="sp-tor__code"></i><span class="sp-cc__kick">SKU 20-4471</span></article>
      </div>`;
    k.html(`
      <div class="sp sp-cc sp-tor">
        <div class="sp-cc__wrap sp-tor__wrap" tabindex="0" role="img" aria-label="Sale tag: drag, click or use arrow keys to twist it">
          <i class="sp-tor__string"></i>
          <span class="sp-tor__size">${faces}</span>
          <span class="sp-cc__pieces"></span>
          <i class="sp-tor__pin"></i>
        </div>
        <p class="sp-note">Drag sideways to wring</p>
      </div>`);
    const wrap = k.$('.sp-tor__wrap');
    const bands = pieces(k.$('.sp-cc__pieces'), faces, grid(1, Math.round(p.bands))).map((b) => b.el);
    k.fit(wrap, 0.66); // extra room: the pin and string sit above the wrap's box
    const s = k.track({ twist: 0 });
    gsap.set(bands, { transformPerspective: 900 });

    // The twist grows from nothing at the pin to the full amount at the free end.
    const draw = () => bands.forEach((el, i) => {
      const a = s.twist * ((i + 0.5) / bands.length) ** 1.15;
      gsap.set(el, { rotationY: a });
      const m = ((a % 360) + 360) % 360;
      el.classList.toggle('is-back', m > 90 && m < 270);
    });
    draw();
    const release = (from) => gsap.fromTo(s, { twist: from ?? s.twist }, {
      twist: 0, duration: reducedMotion ? 0 : 3.2, ease: `elastic.out(1, ${p.damp})`, onUpdate: draw, overwrite: true,
    });

    let drag = null;
    let moved = false;
    k.on(wrap, 'pointerdown', (e) => {
      wrap.setPointerCapture(e.pointerId);
      gsap.killTweensOf(s);
      drag = { x: e.clientX, t: s.twist };
      moved = false;
    });
    k.on(wrap, 'pointermove', (e) => {
      if (!drag) return;
      const px = wrap.getBoundingClientRect().width;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) moved = true;
      s.twist = clamp(drag.t + (dx / px) * p.max, -p.max, p.max);
      draw();
    });
    const drop = () => {
      if (!drag) return;
      drag = null;
      moved ? release() : release(p.max * 0.6);
    };
    k.on(wrap, 'pointerup', drop);
    k.on(wrap, 'pointercancel', drop);
    k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the element
    k.on(wrap, 'keydown', (e) => {
      const dir = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
      if (dir) e.preventDefault(), release(dir * p.max * 0.6);
    });

    return () => k.destroy();
  },
};
