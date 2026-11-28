/** Carriage Paragraph: a paragraph typed out on a typewriter: the carriage shuffles left a notch with every letter and, at the end of each line, slams back to the right with a ding before the next line starts. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const LINES = ['Dear Mira,', 'The proofs arrived this morning', 'and the colour is exactly right.', 'Print the full run on Monday.'];

export const meta = {
  title: 'Carriage Paragraph',
  element: 'Paragraph',
  trigger: ['In view', 'Click'],
  behavior: ['Sequential', 'Time-driven', 'Periodic'],
  effect: ['Reciprocating', 'Sliding', 'Recoiling'],
  purpose: ['Storytelling', 'Delight'],
  properties: ['Position', 'Typography'],
  description: 'A letter that types itself the old way. The page sits in a typewriter carriage: with every character the carriage steps a notch to the left so the type lands at the same spot, and at the end of each line it slams all the way back to the right, overshooting and recoiling, with a small "ding" mark, and the page feeds up a line. Click to type it again.',
  params: [
    { key: 'pace', label: 'Time per letter', group: 'Motion', type: 'range', min: 0.02, max: 0.12, step: 0.005, unit: 's', default: 0.045, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ding'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-car">
        <div class="sp-car__machine" tabindex="0" role="button" aria-label="Type the letter again">
          <div class="sp-car__carriage"><div class="sp-car__page" aria-live="off">${LINES.map(() => '<div class="sp-car__line"></div>').join('')}</div></div>
          <i class="sp-car__guide" aria-hidden="true"></i><b class="sp-car__ding" aria-hidden="true">ding!</b>
        </div>
      </div>`);
    const machine = k.$('.sp-car__machine');
    const carriage = k.$('.sp-car__carriage');
    const page = k.$('.sp-car__page');
    const lines = k.$$('.sp-car__line');
    const ding = k.$('.sp-car__ding');
    machine.setAttribute('aria-description', LINES.join(' '));
    // one character's width and one line's height, measured once (monospace)
    let CW = 8, LH = 18;
    k.resize(machine, () => { const cs = getComputedStyle(lines[0]); CW = parseFloat(cs.fontSize) * 0.6; LH = parseFloat(cs.lineHeight) || 18; });
    gsap.set(ding, { autoAlpha: 0 });
    let tl;
    const type = () => {
      tl?.kill();
      lines.forEach((l) => (l.textContent = ''));
      if (reducedMotion) { lines.forEach((l, i) => (l.textContent = LINES[i])); return gsap.set([carriage, page], { x: 0, y: 0 }); }
      tl = gsap.timeline().set(carriage, { x: 0 }).set(page, { y: 0 });
      LINES.forEach((text, li) => {
        [...text].forEach((ch, ci) => tl.call(() => (lines[li].textContent += ch)).to(carriage, { x: -(ci + 1) * CW, duration: p.pace * 0.6, ease: 'steps(1)' }, `+=${p.pace * 0.4}`));
        if (li === LINES.length - 1) return;
        // carriage return: slam right (overshoot + recoil), ding, line feed
        tl.to(ding, { autoAlpha: 1, y: '-0.4em', duration: 0.1 })
          .to(carriage, { x: CW * 0.6, duration: 0.22, ease: 'power3.in' }, '<')
          .to(carriage, { x: 0, duration: 0.25, ease: 'elastic.out(1.2, 0.4)' })
          .to(page, { y: -(li + 1) * LH, duration: 0.2, ease: 'power2.out' }, '<')
          .to(ding, { autoAlpha: 0, y: 0, duration: 0.25 }, '<0.1');
      });
    };
    k.inView(machine, () => !tl && type());
    k.on(machine, 'click', type);
    k.on(machine, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), type()));
    return () => k.destroy();
  },
};
