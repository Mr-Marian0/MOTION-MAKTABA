/** Pinch Timer: a focus-timer widget. Start it and the card pinches in at the waist into an hourglass, and sand runs through the neck. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { poly, shapeHTML } from './_shape.js';

export const meta = {
  title: 'Pinch Timer',
  element: 'Widget',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Time-driven', 'Pausable', 'Resumable', 'Elastic', 'State-dependent'],
  effect: ['Pinching', 'Accumulation', 'Spinning'],
  purpose: ['Progress', 'Feedback', 'Delight'],
  properties: ['Shape', 'Clip & mask', 'Size', 'Rotation'],
  description: 'A focus-timer widget. Press Start and the card pinches in at the waist into an hourglass, then sand runs through the neck until the top is empty. At zero it turns over and relaxes back into a card. Pause holds the sand mid-fall.',
  params: [
    { key: 'secs', label: 'Timer', group: 'Behavior', type: 'range', min: 3, max: 30, step: 1, unit: 's', default: 8 },
    { key: 'pinch', label: 'Pinch', group: 'Shape', type: 'range', min: 15, max: 45, step: 1, unit: '%', default: 40, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Sand'),
  ],
};

/** A rounded card outline whose sides are pulled in around the middle by `w` percent. */
function outline(w) {
  const side = (x0, dir) => Array.from({ length: 15 }, (_, i) => {
    const y = 6 + (i / 14) * 88;
    return [x0 + dir * w * Math.exp(-(((y - 50) / 17) ** 2)), y];
  });
  const arc = (cx, cy, a0) => Array.from({ length: 4 }, (_, j) => {
    const a = ((a0 + j * 30) * Math.PI) / 180;
    return [cx + Math.cos(a) * 6, cy + Math.sin(a) * 6];
  });
  return [...arc(6, 6, 180), ...arc(94, 6, 270), ...side(100, -1), ...arc(94, 94, 0), ...arc(6, 94, 90), ...side(0, 1).reverse()];
}

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-pin">
        <div class="sp-pin__glass">
          ${shapeHTML('sp-pin__card', '<i class="sp-pin__top"></i><i class="sp-pin__stream"></i><i class="sp-pin__bottom"></i>')}
        </div>
        <b class="sp-cc__price sp-pin__time" aria-live="off"></b>
        <button type="button" class="sp-cc__btn sp-pin__btn">Start</button>
      </div>`);
    const glass = k.$('.sp-pin__glass');
    const layers = k.$$('.sp-shape__edge, .sp-shape__face');
    const top = k.$('.sp-pin__top');
    const bottom = k.$('.sp-pin__bottom');
    const stream = k.$('.sp-pin__stream');
    const time = k.$('.sp-pin__time');
    const btn = k.$('.sp-pin__btn');
    k.fit(glass, 0.6);
    const s = k.track({ w: 0, left: 1 });
    let run;

    const draw = () => {
      layers.forEach((el) => (el.style.clipPath = poly(outline(s.w))));
      top.style.height = `${s.left * 40}%`;
      bottom.style.height = `${(1 - s.left) * 40}%`;
      const secs = Math.ceil(s.left * p.secs);
      time.textContent = `0:${String(secs).padStart(2, '0')}`;
    };
    draw();
    const pinch = (w, dur = 0.9) => gsap.to(s, { w, duration: reducedMotion ? 0 : dur, ease: 'elastic.out(1, 0.45)', onUpdate: draw });

    const finish = () => {
      btn.textContent = 'Start';
      gsap.set(stream, { autoAlpha: 0 });
      gsap.timeline()
        .to(glass, { rotation: 180, duration: reducedMotion ? 0 : 0.6, ease: 'back.inOut(1.6)' })
        .add(() => { gsap.set(glass, { rotation: 0 }); s.left = 1; draw(); })
        .add(pinch(0, 1.1));
      run = null;
    };

    k.on(btn, 'click', () => {
      if (!run) {
        // Start: pinch into an hourglass, then let the sand run
        btn.textContent = 'Pause';
        pinch(p.pinch);
        gsap.set(stream, { autoAlpha: 1 });
        run = gsap.to(s, { left: 0, duration: p.secs, ease: 'none', delay: reducedMotion ? 0 : 0.5, onUpdate: draw, onComplete: finish });
      } else if (run.paused()) {
        btn.textContent = 'Pause';
        gsap.set(stream, { autoAlpha: 1 });
        run.resume();
      } else {
        btn.textContent = 'Resume';
        gsap.set(stream, { autoAlpha: 0 });
        run.pause();
      }
    });
    gsap.set(stream, { autoAlpha: 0 });

    return {
      destroy: () => { run?.kill(); k.destroy(); },
      update: (key) => key === 'pinch' && run && pinch(p.pinch, 0.5),
    };
  },
};
