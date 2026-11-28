/** Cast Upload: upload progress is molten metal poured into a mould: the glowing liquid runs along the bar as the file uploads, then cools and sets solid into a steel bar with a glint once it is done. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

export const meta = {
  title: 'Cast Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Sequential', 'State-dependent'],
  effect: ['Solidification', 'Liquefaction', 'Shimmering'],
  purpose: ['Progress', 'Feedback', 'Storytelling'],
  properties: ['Position', 'Color', 'Clip & mask'],
  description: 'An upload whose progress bar is a mould for molten metal. While the file goes up, glowing orange liquid runs along the bar. When it reaches the end the metal cools: the glow dies down through red to cold steel grey, a highlight sweeps across the now-solid bar and the file is marked done.',
  params: [
    { key: 'pour', label: 'Upload time', group: 'Motion', type: 'range', min: 0.8, max: 5, step: 0.2, unit: 's', default: 2.2, live: true },
    { key: 'cool', label: 'Cooling time', group: 'Motion', type: 'range', min: 0.3, max: 2.5, step: 0.1, unit: 's', default: 1.1, live: true },
    tone('#f2701d', 'tone', '--sp-accent', 'Melt'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-cst">
        <div class="sp-fi__wrap">
          <div class="sp-fi__drop sp-cst__zone" role="button" tabindex="0" aria-label="Upload a file"><b>Upload a file</b><small>click, or drop one here</small></div>
          <div class="sp-cst__job" hidden>
            <div class="sp-cst__chip"></div>
            <div class="sp-cst__mould" role="progressbar" aria-label="Upload progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="sp-cst__metal"></i><i class="sp-cst__glint"></i></div>
            <small class="sp-fi__msg sp-cst__msg" aria-live="polite"></small>
          </div>
        </div>
      </div>`);
    const zone = k.$('.sp-cst__zone');
    const job = k.$('.sp-cst__job');
    const chip = k.$('.sp-cst__chip');
    const mould = k.$('.sp-cst__mould');
    const metal = k.$('.sp-cst__metal');
    const glint = k.$('.sp-cst__glint');
    const msg = k.$('.sp-cst__msg');
    let tl;
    const start = (file) => {
      tl?.kill();
      job.hidden = false;
      chip.innerHTML = fileChip(file);
      k.on(chip.querySelector('.sp-fi__x'), 'click', () => { tl?.kill(); job.hidden = true; zone.focus(); });
      msg.textContent = 'Pouring…';
      const prog = { v: 0 };
      // The metal is a full-width bar slid in from the left (xPercent −100 → 0): its right edge is the pour front
      tl = gsap.timeline()
        .set(metal, { xPercent: -100, backgroundColor: getComputedStyle(job).getPropertyValue('--sp-accent').trim() || '#f2701d', boxShadow: '0 0 0.8em #f2a541' })
        .set(glint, { xPercent: -120, autoAlpha: 0 })
        .to(prog, { v: 100, duration: p.pour, ease: 'power1.inOut', onUpdate: () => {
          gsap.set(metal, { xPercent: prog.v - 100 });
          mould.setAttribute('aria-valuenow', Math.round(prog.v));
        } })
        .add(() => (msg.textContent = 'Setting…'))
        .to(metal, { keyframes: { backgroundColor: ['#c2391d', '#6d6f73', '#8c9196'] }, boxShadow: '0 0 0 transparent', duration: p.cool, ease: 'power1.out' })
        .to(glint, { xPercent: 420, autoAlpha: 1, duration: 0.6, ease: 'power2.inOut' })
        .add(() => (msg.textContent = 'Uploaded and set.'));
      if (reducedMotion) tl.progress(1);
    };
    pickFiles(k, zone, start, (on) => zone.classList.toggle('is-over', on));
    return () => k.destroy();
  },
};
