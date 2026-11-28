/** Cloth Upload: the drop zone is covered by a cloth; bring a file near (hover, focus or drag over) and the cloth is whisked off from one corner, its hem fluttering as it goes; leave and it drapes back down. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

export const meta = {
  title: 'Cloth Upload',
  element: 'File upload',
  trigger: ['Hover', 'Focus', 'Drag', 'Click'],
  behavior: ['Hover-dependent', 'Reversible', 'Physics-driven'],
  effect: ['Cloth-motion', 'Wave-deformation', 'Falling'],
  purpose: ['Affordance', 'Delight', 'Storytelling'],
  properties: ['Path', 'Position'],
  description: 'A drop zone kept under a cloth, like a covered table. Point at it, tab to it or drag a file over it and the cloth is pulled away up and off, the left corner leading and the rest following behind it, the loose hem rippling as it travels. Move away and the cloth falls back over the zone, the hem settling last. Chosen files are listed under it.',
  params: [
    { key: 'time', label: 'Pull time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'flutter', label: 'Flutter', group: 'Motion', type: 'range', min: 0, max: 14, step: 1, unit: '', default: 7, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Cloth'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-clo">
        <div class="sp-fi__wrap">
          <div class="sp-clo__table">
            <div class="sp-fi__drop sp-clo__zone" role="button" tabindex="0" aria-label="Add a file"><b>Drop files here</b><small>or click to choose</small></div>
            <svg class="sp-clo__cloth" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
          </div>
          <div class="sp-clo__list" aria-live="polite"></div>
        </div>
      </div>`);
    const table = k.$('.sp-clo__table');
    const zone = k.$('.sp-clo__zone');
    const path = k.$('.sp-clo__cloth path');
    const list = k.$('.sp-clo__list');
    const N = 16;
    // s.lift 0 = draped, 1 = gone; column i lifts on its own schedule (left corner first); the hem flutters in between
    const s = k.track({ lift: 0, ph: 0 });
    const col = (i) => Math.min(1, Math.max(0, s.lift * 1.7 - (i / N) * 0.7));
    const draw = () => {
      const top = [], bot = [];
      for (let i = 0; i <= N; i++) {
        const l = col(i);
        const x = (i / N) * 100;
        const ty = -l * 320; // far enough to clear the top of the card
        const flap = Math.sin(i * 0.9 + s.ph) * p.flutter * 4 * l * (1 - l);
        top.push(`${x} ${ty.toFixed(2)}`);
        bot.push(`${x} ${(ty + 104 - 30 * l + flap).toFixed(2)}`);
      }
      path.setAttribute('d', `M${top.join(' L')} L${bot.reverse().join(' L')} Z`);
    };
    draw();
    const set = (off) => gsap.to(s, { lift: off ? 1 : 0, ph: `+=${off ? 6 : -6}`, duration: reducedMotion ? 0 : p.time * (off ? 1 : 1.3), ease: off ? 'power2.in' : 'power2.out', overwrite: true, onUpdate: draw });
    let near = 0;
    const nearBy = (d) => { near = Math.max(0, near + d); set(near > 0); };
    k.on(table, 'pointerenter', () => nearBy(1));
    k.on(table, 'pointerleave', () => nearBy(-1));
    k.on(zone, 'focus', () => nearBy(1));
    k.on(zone, 'blur', () => nearBy(-1));
    pickFiles(k, zone, (file) => {
      if (list.children.length >= 2) list.lastElementChild.remove();
      list.insertAdjacentHTML('afterbegin', fileChip(file));
      const chip = list.firstElementChild;
      k.on(chip.querySelector('.sp-fi__x'), 'click', () => chip.remove());
      if (!reducedMotion) gsap.from(chip, { y: '-0.6em', autoAlpha: 0, duration: 0.3 });
    }, (on) => on && set(true));
    return () => k.destroy();
  },
};
