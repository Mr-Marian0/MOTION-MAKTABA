/** Extend Paragraph: "Read more" extends the excerpt one line at a time, each new line sliding down into place like a drawer pulled out a notch; "Read less" retracts it the same way. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

const TEXT = 'Every print in the shop starts as a plate cut by hand in the back room. We ink it with a roller, lay the paper on, and pull it through the old press twice, once for colour and once for the line. No two come out quite the same: the pressure drifts, the ink thins, the paper takes it differently on a damp day. We number each one and keep the plate until the edition is done.';

export const meta = {
  title: 'Extend Paragraph',
  element: 'Paragraph',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Sequential', 'Reversible'],
  effect: ['Extending', 'Retracting', 'Sliding'],
  purpose: ['Hierarchy', 'Continuity'],
  properties: ['Clip & mask', 'Position'],
  description: 'An article excerpt shown three lines deep. Press "Read more" and the text extends line by line, in quick notches: each new line is uncovered and slides down into place a beat after the one before, until the whole paragraph is out. "Read less" retracts it notch by notch back to three lines.',
  params: [
    { key: 'step', label: 'Time per line', group: 'Motion', type: 'range', min: 0.03, max: 0.3, step: 0.01, unit: 's', default: 0.09, live: true },
    { key: 'shown', label: 'Lines shown', group: 'Shape', type: 'range', min: 1, max: 5, step: 1, unit: '', default: 3, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Link'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('xtp');
    k.html(`
      <div class="sp sp-tm sp-xtp">
        <article class="sp-xtp__card">
          <span class="sp-tm__kick">About the press</span>
          <div class="sp-xtp__clip" id="${id}"><p class="sp-tm__p sp-xtp__p">${TEXT}</p></div>
          <button type="button" class="sp-xtp__more" aria-expanded="false" aria-controls="${id}">Read more ↓</button>
        </article>
      </div>`);
    const clip = k.$('.sp-xtp__clip');
    const para = k.$('.sp-xtp__p');
    const more = k.$('.sp-xtp__more');
    // Line height is measured on resize; the clip shows `lines` whole lines
    let LH = 20, total = 8, lines = p.shown;
    const show = (n) => gsap.set(clip, { height: n * LH });
    k.resize(para, () => {
      LH = parseFloat(getComputedStyle(para).lineHeight) || 20;
      total = Math.round(para.offsetHeight / LH);
      show(lines);
    });
    let tl;
    k.on(more, 'click', () => {
      const open = more.getAttribute('aria-expanded') !== 'true';
      more.setAttribute('aria-expanded', String(open));
      more.textContent = open ? 'Read less ↑' : 'Read more ↓';
      tl?.kill();
      const to = open ? total : Math.round(p.shown);
      if (reducedMotion) return show((lines = to));
      // One notch per line: the clip grows by a line, and the paragraph's last visible line slides in
      tl = gsap.timeline();
      const dir = Math.sign(to - lines);
      for (let n = lines + dir; dir && n !== to + dir; n += dir) {
        tl.call(() => { lines = n; show(n); })
          .fromTo(para, { y: dir > 0 ? -LH * 0.35 : LH * 0.25 }, { y: 0, duration: p.step * 1.6, ease: 'back.out(2)' }, '<')
          .to({}, { duration: p.step });
      }
    });
    return () => k.destroy();
  },
};
