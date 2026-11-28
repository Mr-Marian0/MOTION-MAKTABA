/** Retract Upload: chosen files pay out under the drop zone like tape from a tape measure; removing one reels it back in, and "Clear" retracts the whole tape with a snap. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { fileChip, pickFiles } from './_fi.js';

export const meta = {
  title: 'Retract Upload',
  element: 'File upload',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Sequential', 'Reversible'],
  effect: ['Retracting', 'Extending', 'Recoiling'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Position', 'Scale', 'Clip & mask'],
  description: 'An upload zone with a tape-measure feel. Each file you add pays out from under the zone on a strip of tape, pushing the earlier ones down. Remove a file and it is reeled back up into the zone; "Clear" retracts the whole tape at once, faster and faster, and the zone jolts as it snaps home.',
  params: [
    { key: 'time', label: 'Reel time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.45, live: true },
    { key: 'snap', label: 'Snap', group: 'Motion', type: 'range', min: 0, max: 10, step: 1, unit: '°', default: 4, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Tape'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-fi sp-rtu">
        <div class="sp-fi__wrap">
          <div class="sp-fi__drop sp-rtu__zone" role="button" tabindex="0" aria-label="Add a file"><b>Add files</b><small>click, or drop one here</small></div>
          <div class="sp-rtu__well"><div class="sp-rtu__tape" aria-live="polite"></div></div>
          <button type="button" class="sp-fi__btn sp-fi__btn--ghost sp-rtu__clear" hidden>Clear</button>
        </div>
      </div>`);
    const zone = k.$('.sp-rtu__zone');
    const tape = k.$('.sp-rtu__tape');
    const clear = k.$('.sp-rtu__clear');
    const d = (t) => (reducedMotion ? 0 : t);
    const jolt = () => !reducedMotion && gsap.fromTo(zone, { rotation: 0 }, { keyframes: { rotation: [-p.snap, p.snap * 0.5, 0], y: ['-0.15em', '0.05em', 0] }, duration: 0.35, ease: 'none' });
    const sync = () => (clear.hidden = !tape.children.length);
    // Reel one chip back up into the zone: it slides up under the zone's edge and is gone
    const reel = (chip, delay = 0, time = p.time) =>
      gsap.to(chip, { yPercent: -130, scaleY: 0.6, duration: d(time), delay: d(delay), ease: 'power3.in', onComplete: () => { chip.remove(); sync(); } });
    const add = (file) => {
      if (tape.children.length >= 3) reel(tape.lastElementChild, 0, 0.2);
      tape.insertAdjacentHTML('afterbegin', fileChip(file, 'sp-rtu__chip'));
      const chip = tape.firstElementChild;
      k.on(chip.querySelector('.sp-fi__x'), 'click', () => { reel(chip); jolt(); zone.focus(); });
      sync();
      // Paying out: the new strip slides down out of the zone; the strips below are pushed along
      gsap.fromTo(chip, { yPercent: -120 }, { yPercent: 0, duration: d(p.time), ease: 'back.out(1.4)' });
      const below = [...tape.children].slice(1);
      if (below.length) gsap.fromTo(below, { y: '-3.1em' }, { y: 0, duration: d(p.time), ease: 'back.out(1.4)' });
    };
    pickFiles(k, zone, add, (on) => zone.classList.toggle('is-over', on));
    k.on(clear, 'click', () => {
      // All at once, bottom first, each faster than the last, then the snap
      const chips = [...tape.children].reverse();
      chips.forEach((c, i) => reel(c, i * p.time * 0.25, p.time * (0.8 - i * 0.15)));
      gsap.delayedCall(d(chips.length * p.time * 0.25 + p.time * 0.5), jolt);
      zone.focus();
    });
    return () => k.destroy();
  },
};
