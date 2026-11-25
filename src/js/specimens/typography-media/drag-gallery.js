/** Drag Gallery: throw the strip of prints; it glides on with inertia, the prints lean with the speed, then it snaps to a frame. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Contact Strip',
  element: 'Gallery',
  trigger: ['Drag', 'Swipe', 'Keyboard'],
  behavior: ['Draggable', 'Inertial', 'Velocity-aware', 'Snapping', 'Horizontal-scrolling'],
  effect: ['Sliding', 'Distortion', 'Decelerating'],
  purpose: ['Storytelling', 'Delight'],
  properties: ['Position', 'Shape'],
  description: 'A strip of contact prints. Drag and let go: it keeps gliding with inertia, the prints skew in the direction of travel as if dragged through air, then it eases to a stop on the nearest frame. Arrow keys step one frame.',
  params: [
    { key: 'skew', label: 'Speed skew', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '°', default: 10, live: true },
    { key: 'snap', label: 'Snap to frames', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Print tint'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const N = 8;
    k.html(`
      <div class="sp sp-strip">
        <div class="sp-strip__view" tabindex="0" role="region" aria-label="Contact strip, use arrow keys">
          <div class="sp-strip__track">${Array.from({ length: N }, (_, i) => `<figure class="sp-strip__frame" style="--i:${i}"><span></span><figcaption>${String(i + 1).padStart(2, '0')}</figcaption></figure>`).join('')}</div>
        </div>
        <p class="sp-note">Drag and throw · or arrow keys</p>
      </div>`);
    const view = k.$('.sp-strip__view');
    const track = k.$('.sp-strip__track');
    const frames = k.$$('.sp-strip__frame');
    const s = k.track({ x: 0 });
    let last = 0;
    const step = () => frames[1].offsetLeft - frames[0].offsetLeft;
    const min = () => Math.min(0, view.clientWidth - track.scrollWidth);
    const render = () => {
      const v = s.x - last;
      last = s.x;
      gsap.set(track, { x: s.x });
      gsap.to(frames, { skewX: clamp(-v * 0.6, -p.skew, p.skew), duration: 0.3, overwrite: true });
    };
    const glideTo = (x, d = 0.9) => {
      let to = clamp(x, min(), 0);
      if (p.snap) to = clamp(Math.round(to / step()) * step(), min(), 0);
      gsap.to(s, { x: to, duration: reducedMotion ? 0 : d, ease: 'power3.out', onUpdate: render, onComplete: () => gsap.to(frames, { skewX: 0, duration: 0.4 }) });
    };

    let start = null;
    let vel = 0;
    let prev = 0;
    k.on(view, 'pointerdown', (e) => {
      gsap.killTweensOf(s);
      start = e.clientX - s.x;
      prev = e.clientX;
      vel = 0;
      view.setPointerCapture(e.pointerId);
    });
    k.on(view, 'pointermove', (e) => {
      if (start === null) return;
      vel = e.clientX - prev;
      prev = e.clientX;
      s.x = clamp(e.clientX - start, min() - 60, 60); // a little give past the ends
      render();
    });
    const release = () => {
      if (start === null) return;
      start = null;
      glideTo(s.x + vel * 12); // throw: carry on in the direction of travel
    };
    k.on(view, 'pointerup', release);
    k.on(view, 'pointercancel', release);
    k.on(view, 'keydown', (e) => {
      const dir = { ArrowRight: -1, ArrowLeft: 1 }[e.key];
      if (dir) e.preventDefault(), glideTo(s.x + dir * step(), 0.5);
    });

    return () => k.destroy();
  },
};
