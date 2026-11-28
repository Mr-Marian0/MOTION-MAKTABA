/** Helix Note: when you stop typing, the note autosaves, and the "Saving" indicator is a turning double helix of dots that unwinds into a tick once it is stored. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Helix Note',
  element: 'Textarea',
  trigger: ['Keyboard', 'Idle'],
  behavior: ['Event-driven', 'Time-driven', 'State-dependent'],
  effect: ['Helical-motion', 'Spinning', 'Convergence'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A notes box with a living autosave badge. A moment after you stop typing it starts saving, and the badge becomes a short double helix of dots turning on its axis, pairs passing in front of and behind each other. When the save lands, the strands pull together into a line and the badge reads "Saved" with a tick. The helix only turns while saving.',
  params: [
    { key: 'pairs', label: 'Dot pairs', group: 'Shape', type: 'range', min: 4, max: 12, step: 1, unit: '', default: 7 },
    { key: 'save', label: 'Save time', group: 'Behavior', type: 'range', min: 0.5, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'wait', label: 'Save after idle', group: 'Behavior', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Strand'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('hlx');
    const n = Math.round(p.pairs);
    k.html(`
      <div class="sp sp-fi sp-hlx">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Meeting notes</label>
          <textarea class="sp-fi__area" id="${id}">Decide on paper stock. Ask about the print run.</textarea>
          <div class="sp-hlx__badge" aria-live="polite"><span class="sp-hlx__dna" aria-hidden="true">${'<i></i><i></i>'.repeat(n)}</span><b>Saved</b></div>
        </div>
      </div>`);
    const area = k.$('textarea');
    const dots = k.$$('.sp-hlx__dna i');
    const label = k.$('.sp-hlx__badge b');
    // Pair j: two dots opposite each other on a turning circle, offset in phase along the strand
    const s = k.track({ ph: 0, r: 0 });
    // Spacing is in ems of the badge, converted to px once per resize (never per frame)
    let E = 11;
    k.resize(k.$('.sp-hlx__dna'), () => { E = parseFloat(getComputedStyle(k.$('.sp-hlx__dna')).fontSize) || 11; draw(); });
    const draw = () => dots.forEach((d, i) => {
      const j = i >> 1;
      const a = s.ph + j * 0.9 + (i & 1 ? Math.PI : 0);
      const z = Math.cos(a);
      gsap.set(d, { x: j * 0.62 * E, y: Math.sin(a) * 0.48 * s.r * E, scale: 0.6 + 0.4 * ((z + 1) / 2) * s.r + 0.4 * (1 - s.r), opacity: 0.35 + 0.65 * ((z + 1) / 2) * s.r + 0.65 * (1 - s.r) });
    });
    draw();
    let timer, spin, tl;
    const save = () => {
      label.textContent = 'Saving…';
      if (reducedMotion) { gsap.delayedCall(p.save, () => (label.textContent = 'Saved ✓')); return; }
      spin = gsap.to(s, { ph: `+=${Math.PI * 2}`, duration: 1.1, ease: 'none', repeat: -1, onUpdate: draw });
      tl = gsap.timeline({ onUpdate: draw })
        .to(s, { r: 1, duration: 0.35, ease: 'power2.out' })
        .to(s, { r: 0, duration: 0.4, ease: 'power2.in' }, p.save)
        .call(() => { spin.kill(); label.textContent = 'Saved ✓'; draw(); });
    };
    k.on(area, 'input', () => {
      timer?.kill(); spin?.kill(); tl?.kill();
      s.r = 0; draw();
      label.textContent = 'Edited';
      timer = gsap.delayedCall(p.wait, save);
    });
    return () => { spin?.kill(); k.destroy(); };
  },
};
