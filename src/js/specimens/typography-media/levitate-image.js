/** Levitate Image: a product shot that hovers above the page: it floats with a slow rise and fall over its own soft shadow; point at it and it lifts higher, tilting toward you, the shadow spreading and fading. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Levitate Image',
  element: 'Image',
  trigger: ['Idle', 'Hover', 'Cursor move'],
  behavior: ['Floating', 'Cursor-following', 'Periodic'],
  effect: ['Levitation', 'Hovering', 'Bobbing'],
  purpose: ['Delight', 'Focus', 'Branding'],
  properties: ['Position', 'Rotation', 'Shadow'],
  description: 'A shop image where the product, a ceramic mug, floats in the air above its shadow. At rest it rises and sinks slowly while the shadow below grows sharper and softer in step. Point at it and it lifts higher and tilts a little toward the pointer, as if drawn to you, the shadow spreading wide and pale; leave and it settles back into its float.',
  params: [
    { key: 'lift', label: 'Lift', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    { key: 'tilt', label: 'Tilt', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '°', default: 10, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Mug'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-lvi">
        <div class="sp-lvi__stage" role="img" aria-label="Glazed ceramic mug">
          <i class="sp-lvi__shadow"></i>
          <div class="sp-lvi__obj"><i class="sp-lvi__mug"></i><i class="sp-lvi__handle"></i></div>
        </div>
        <small class="sp-tm__kick">Stoneware mug · £24</small>
      </div>`);
    const st = k.$('.sp-lvi__stage');
    const obj = k.$('.sp-lvi__obj');
    const shadow = k.$('.sp-lvi__shadow');
    gsap.set(obj, { transformPerspective: 600 });
    // the idle float; shadow tracks it (higher = wider and fainter)
    const float = reducedMotion ? null : gsap.timeline({ repeat: -1, yoyo: true })
      .to(obj, { y: `-${p.lift}em`, duration: 1.8, ease: 'sine.inOut' }, 0)
      .to(shadow, { scale: 0.8, opacity: 0.25, duration: 1.8, ease: 'sine.inOut' }, 0);
    const rx = gsap.quickTo(obj, 'rotationX', { duration: 0.4 });
    const ry = gsap.quickTo(obj, 'rotationY', { duration: 0.4 });
    let box;
    k.on(st, 'pointerenter', () => {
      box = st.getBoundingClientRect();
      if (reducedMotion) return;
      float.pause();
      gsap.to(obj, { y: `-${p.lift * 2.2}em`, duration: 0.5, ease: 'back.out(2)', overwrite: 'auto' });
      gsap.to(shadow, { scale: 1.25, opacity: 0.15, duration: 0.5, overwrite: 'auto' });
    });
    k.on(st, 'pointermove', (e) => {
      if (!box || reducedMotion) return;
      rx(-((e.clientY - box.top) / box.height - 0.5) * p.tilt * 2);
      ry(((e.clientX - box.left) / box.width - 0.5) * p.tilt * 2);
    });
    k.on(st, 'pointerleave', () => {
      box = null;
      if (reducedMotion) return;
      rx(0); ry(0);
      gsap.to(obj, { y: 0, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto', onComplete: () => float.restart() });
      gsap.to(shadow, { scale: 1, opacity: 0.4, duration: 0.6, overwrite: 'auto' });
    });
    return () => { float?.kill(); k.destroy(); };
  },
};
