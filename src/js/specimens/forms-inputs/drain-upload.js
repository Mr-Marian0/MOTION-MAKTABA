/** Drain Upload: cancelling an upload sends the file down the plughole: it is caught in a whirlpool and spirals in towards the drain at the centre of the zone, turning faster and shrinking as it goes. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

export const meta = {
  title: 'Drain Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Cancellable', 'Attracted'],
  effect: ['Vortex-motion', 'Spiraling', 'Contracting'],
  purpose: ['Feedback', 'Delight'],
  properties: ['Position', 'Rotation', 'Scale', 'Opacity'],
  description: 'An upload you can flush. Files being uploaded sit in the zone with a progress bar; press ✕ on one and the zone swirls: the file is pulled into a whirlpool round the drain in the middle, circling faster and faster on a tightening spiral while it shrinks, and disappears down the plughole. The water lines around the drain spin with it.',
  params: [
    { key: 'turns', label: 'Turns', group: 'Motion', type: 'range', min: 1, max: 5, step: 0.5, unit: '', default: 2.5, live: true },
    { key: 'time', label: 'Drain time', group: 'Motion', type: 'range', min: 0.6, max: 2.5, step: 0.1, unit: 's', default: 1.3, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-drn">
        <div class="sp-drn__basin">
          <i class="sp-drn__swirl" aria-hidden="true"></i><i class="sp-drn__hole" aria-hidden="true"></i>
          <div class="sp-drn__files" aria-live="polite"></div>
          <div class="sp-fi__drop sp-drn__zone" role="button" tabindex="0" aria-label="Upload a file"><b>+ Add file</b></div>
        </div>
      </div>`);
    const basin = k.$('.sp-drn__basin');
    const files = k.$('.sp-drn__files');
    const swirl = k.$('.sp-drn__swirl');
    const zone = k.$('.sp-drn__zone');
    const add = (file) => {
      if (files.children.length >= 2) files.firstElementChild.remove();
      files.insertAdjacentHTML('beforeend', fileChip(file, 'sp-drn__chip'));
      const chip = files.lastElementChild;
      chip.insertAdjacentHTML('beforeend', '<i class="sp-drn__bar" aria-hidden="true"></i>');
      const prog = gsap.fromTo(chip.querySelector('.sp-drn__bar'), { scaleX: 0 }, { scaleX: 1, duration: reducedMotion ? 0 : 5, ease: 'none' });
      k.on(chip.querySelector('.sp-fi__x'), 'click', () => {
        prog.kill();
        if (reducedMotion) return chip.remove(), zone.focus();
        // Spiral in: angle grows (faster near the end), radius shrinks to 0, all about the drain at the basin centre
        const bx = basin.getBoundingClientRect();
        const cr = chip.getBoundingClientRect();
        const [dx, dy] = [cr.left + cr.width / 2 - (bx.left + bx.width / 2), cr.top + cr.height / 2 - (bx.top + bx.height / 2)];
        const r0 = Math.hypot(dx, dy), a0 = Math.atan2(dy, dx);
        const s = { u: 0 };
        chip.style.pointerEvents = 'none';
        zone.focus();
        gsap.to(swirl, { rotation: `+=${360 * p.turns}`, duration: p.time, ease: 'power2.in' });
        gsap.to(s, { u: 1, duration: p.time, ease: 'power1.in', onUpdate: () => {
          const a = a0 + s.u * s.u * p.turns * Math.PI * 2;
          const r = r0 * (1 - s.u);
          gsap.set(chip, { x: Math.cos(a) * r - dx, y: Math.sin(a) * r - dy, rotation: s.u * p.turns * 360, scale: 1 - s.u * 0.9, opacity: 1 - s.u * s.u });
        }, onComplete: () => chip.remove() });
      });
    };
    pickFiles(k, zone, add, (on) => zone.classList.toggle('is-over', on));
    add(['tour-video.mov', '48 MB']);
    return () => k.destroy();
  },
};
