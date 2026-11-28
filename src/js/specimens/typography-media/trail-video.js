/** Trail Video: scrubbing the timeline leaves a trail: preview frames pop up above the playhead as you drag and hang there for a moment, fading out behind it like footprints of where you have been. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo, PHOTOS } from './_tm.js';

export const meta = {
  title: 'Trail Video',
  element: 'Video',
  trigger: ['Drag', 'Keyboard'],
  behavior: ['Draggable', 'Trailing', 'Velocity-aware'],
  effect: ['Motion-trail', 'Afterimage-motion', 'Particle-trail'],
  purpose: ['Navigation', 'Orientation', 'Feedback'],
  properties: ['Position', 'Opacity', 'Scale'],
  description: 'A video scrubber that remembers your path. Drag the playhead (or use ←/→) and a small preview frame of that moment appears above it; as you keep moving, each preview is left behind where it was made and fades and sinks away, so a quick scrub leaves a long trail of fading frames and a slow one a short trail. The main picture jumps to the frame under the playhead.',
  params: [
    { key: 'life', label: 'Trail life', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 's', default: 0.8, live: true },
    { key: 'gap', label: 'Frame gap', group: 'Shape', type: 'range', min: 2, max: 20, step: 1, unit: '%', default: 6, live: true },
    tone('#f2a541', 'tone', '--sp-accent', 'Playhead'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-trv">
        <div class="sp-tm__video sp-trv__video">
          <div class="sp-trv__pic">${photo(0, 'sp-trv__img')}</div>
          <div class="sp-tm__bar"><span class="sp-tm__track sp-trv__track" role="slider" tabindex="0" aria-label="Position" aria-valuemin="0" aria-valuemax="100" aria-valuenow="10"><i class="sp-tm__fill"></i><i class="sp-trv__head"></i><span class="sp-trv__trail" aria-hidden="true"></span></span><small class="sp-trv__time">0:06</small></div>
        </div>
      </div>`);
    const pic = k.$('.sp-trv__pic');
    const track = k.$('.sp-trv__track');
    const fill = k.$('.sp-tm__fill');
    const head = k.$('.sp-trv__head');
    const trail = k.$('.sp-trv__trail');
    const time = k.$('.sp-trv__time');
    let W = 200, u = 0.1, lastDrop = -1, shown = -1;
    const frameAt = (v) => Math.min(PHOTOS.length - 1, Math.floor(v * PHOTOS.length));
    const set = (v) => {
      u = Math.min(1, Math.max(0, v));
      gsap.set(fill, { scaleX: u });
      gsap.set(head, { x: u * W });
      track.setAttribute('aria-valuenow', Math.round(u * 100));
      const secs = Math.round(u * 60);
      time.textContent = `0:${String(secs).padStart(2, '0')}`;
      const f = frameAt(u);
      if (f !== shown) { shown = f; pic.innerHTML = photo(f, 'sp-trv__img'); }
      // leave a preview behind every `gap` of travel
      if (!reducedMotion && Math.abs(u - lastDrop) * 100 >= p.gap) {
        lastDrop = u;
        const prev = document.createElement('i');
        prev.className = 'sp-tm__frame sp-trv__prev';
        prev.innerHTML = photo(f, 'sp-trv__img');
        trail.append(prev);
        gsap.fromTo(prev, { x: u * W, y: 0, scale: 0.6, autoAlpha: 1 }, { scale: 1, duration: 0.15, ease: 'back.out(2)' });
        gsap.to(prev, { autoAlpha: 0, y: '0.8em', scale: 0.7, duration: p.life, delay: 0.15, ease: 'power1.in', onComplete: () => prev.remove() });
      }
    };
    k.resize(track, () => { W = track.offsetWidth; set(u); });
    let box;
    k.on(track, 'pointerdown', (e) => { track.setPointerCapture(e.pointerId); box = track.getBoundingClientRect(); set((e.clientX - box.left) / box.width); });
    k.on(track, 'pointermove', (e) => box && set((e.clientX - box.left) / box.width));
    k.on(track, 'pointerup', () => (box = null));
    k.on(track, 'keydown', (e) => { const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[e.key]; if (d) e.preventDefault(), set(u + d); });
    return () => k.destroy();
  },
};
