/** Scan Modal: an ID-check modal that is read in by a scanning beam: the light sweeps down the card, the details appear line by line behind it, and a stamp lands when it reaches the bottom. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Scan Modal',
  element: 'Modal',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Scanning', 'Shimmering'],
  purpose: ['Feedback', 'Progress', 'Storytelling'],
  properties: ['Clip & mask', 'Position', 'Opacity'],
  description: 'A verification modal that is scanned into view. The empty frame appears, then a glowing beam sweeps down it and the ID details are revealed just behind the beam, line by line. When the beam reaches the bottom it fades and a "Verified" stamp thumps down. "Scan again" runs the sweep once more, and hovering the photo flickers the beam across it.',
  params: [
    { key: 'time', label: 'Scan time', group: 'Motion', type: 'range', min: 0.4, max: 3, step: 0.1, unit: 's', default: 1.4, live: true },
    { key: 'passes', label: 'Passes', group: 'Motion', type: 'range', min: 1, max: 3, step: 1, unit: '', default: 1, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Beam'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-scn', `
      <div class="sp-ov__card sp-ov__modal sp-scn__modal" role="dialog" aria-label="Identity check">
        <div class="sp-scn__doc">
          <i class="sp-ov__photo sp-scn__face"></i>
          <dl><dt>Name</dt><dd>Amara Okafor</dd><dt>ID</dt><dd>MK-2048-77</dd><dt>Expires</dt><dd>04 / 2031</dd></dl>
          <b class="sp-scn__stamp">Verified</b>
          <i class="sp-scn__beam"></i>
        </div>
        <div class="sp-ov__actions"><button type="button" class="sp-ov__btn sp-ov__btn--ghost sp-scn__again">Scan again</button></div>
      </div>`, { label: 'Verify ID', title: 'Account', kick: 'Settings' }));
    const modal = k.$('.sp-scn__modal');
    const doc = k.$('.sp-scn__doc');
    const beam = k.$('.sp-scn__beam');
    const stamp = k.$('.sp-scn__stamp');
    gsap.set(modal, { autoAlpha: 0 });
    gsap.set(beam, { autoAlpha: 0 });
    gsap.set(stamp, { autoAlpha: 0 });
    // The beam's position and the reveal edge are one variable (--y, 0..100%), so they can't drift apart.
    const scan = () => {
      const tl = gsap.timeline()
        .set(stamp, { autoAlpha: 0 })
        .set(beam, { autoAlpha: 1 })
        .fromTo(doc, { '--y': '0%' }, { '--y': '100%', duration: p.time, ease: 'none' });
      for (let i = 1; i < p.passes; i++) tl.to(doc, { '--y': '0%', duration: p.time * 0.5, ease: 'power1.inOut' }).to(doc, { '--y': '100%', duration: p.time * 0.5, ease: 'power1.inOut' });
      return tl
        .to(beam, { autoAlpha: 0, duration: 0.25 })
        .fromTo(stamp, { autoAlpha: 1, scale: 2.4, rotation: -24 }, { scale: 1, rotation: -12, duration: 0.3, ease: 'power4.in' }, '-=0.1')
        .fromTo(modal, { x: 0 }, { keyframes: [{ x: '0.15em' }, { x: '-0.1em' }, { x: 0 }], duration: 0.18 });
    };
    let run;
    toggle(k, gsap, { reducedMotion }, (open) => {
      run?.kill();
      if (!open) return gsap.timeline().to(modal, { autoAlpha: 0, y: '0.6em', duration: 0.25 });
      gsap.set(doc, { '--y': '0%' });
      return gsap.timeline().fromTo(modal, { autoAlpha: 0, y: '0.6em' }, { autoAlpha: 1, y: 0, duration: 0.3 }).add(scan());
    }, ['Verify ID', 'Close']);
    k.on(k.$('.sp-scn__again'), 'click', () => {
      run?.kill();
      run = scan();
      if (reducedMotion) run.progress(1);
    });
    // Extra: hovering the photo flickers a thin line across it
    const face = k.$('.sp-scn__face');
    k.on(face, 'pointerenter', () => !reducedMotion && gsap.fromTo(face, { '--f': '0%' }, { '--f': '100%', duration: 0.5, ease: 'steps(10)', overwrite: true }));
    return () => k.destroy();
  },
};
