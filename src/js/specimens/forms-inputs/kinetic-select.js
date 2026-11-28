/** Kinetic Select: the options hang from a balanced mobile; picking one hangs a weight on it, so the beam tips towards it and swings slowly to a new balance, each option swaying on its thread. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

const ITEMS = ['Ash', 'Oak', 'Walnut', 'Maple'];
const POS = [-1.5, -0.5, 0.5, 1.5]; // where each hangs along the beam (beam half-length = 2)

export const meta = {
  title: 'Kinetic Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Physics-driven', 'State-dependent', 'Oscillating'],
  effect: ['Kinetic-sculpture-motion', 'Pendulum-motion', 'Damped-oscillation'],
  purpose: ['Delight', 'Feedback', 'Storytelling'],
  properties: ['Rotation'],
  description: 'A wood-finish picker built as a hanging mobile. The four options hang on threads from one beam balanced on a central wire. Choose one and it gains a weight: the beam tips towards it and swings back and forth to its new balance, and every option sways on its thread as the beam moves, the motion slowly dying away. Hovering an option gives it a little push.',
  params: [
    { key: 'tip', label: 'Tip per weight', group: 'Motion', type: 'range', min: 2, max: 20, step: 1, unit: '°', default: 8, live: true },
    { key: 'swing', label: 'Swing', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: '', default: 0.35, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Wood'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('kin');
    k.html(`
      <div class="sp sp-fi sp-kin">
        <div class="sp-kin__mobile">
          <i class="sp-kin__wire" aria-hidden="true"></i>
          <div class="sp-kin__beam">
            <ul class="sp-kin__list" role="listbox" aria-label="Wood finish">${ITEMS.map((t, i) => `<li class="sp-kin__hang" role="none" style="left:${(POS[i] + 2) * 25}%"><i aria-hidden="true"></i><span class="sp-fi__opt sp-kin__opt" role="option" aria-selected="false" tabindex="${i ? -1 : 0}" data-i="${i}">${t}</span></li>`).join('')}</ul>
          </div>
        </div>
        <small class="sp-fi__msg sp-kin__msg" id="${id}" aria-live="polite">Nothing chosen yet</small>
      </div>`);
    const beam = k.$('.sp-kin__beam');
    const hangs = k.$$('.sp-kin__hang');
    const opts = k.$$('.sp-kin__opt');
    const msg = k.$('.sp-kin__msg');
    gsap.set(hangs, { transformOrigin: '50% 0%' });
    let pick = -1;
    // Torque balance: the beam's resting angle is proportional to where the weight hangs
    const settle = () => {
      const target = pick < 0 ? 0 : POS[pick] * p.tip;
      if (reducedMotion) return gsap.set(beam, { rotation: target });
      gsap.to(beam, { rotation: target, duration: 2.6, ease: `elastic.out(1, ${p.swing})`, overwrite: true });
      // The threads lag the beam: a swing the other way, dying out
      gsap.fromTo(hangs, { rotation: (i) => -target * 0.8 + (i - 1.5) * 2 }, { rotation: 0, duration: 3, ease: `elastic.out(1, ${p.swing * 0.8})`, stagger: 0.05, overwrite: true });
    };
    const choose = (i) => {
      pick = i;
      opts.forEach((o, j) => { o.setAttribute('aria-selected', String(j === i)); o.tabIndex = j === i ? 0 : -1; });
      hangs.forEach((h, j) => h.classList.toggle('is-heavy', j === i));
      msg.textContent = `${ITEMS[i]} finish`;
      settle();
    };
    opts.forEach((o, i) => {
      k.on(o, 'click', () => choose(i));
      k.on(o, 'keydown', (e) => {
        const to = { ArrowRight: i + 1, ArrowLeft: i - 1 }[e.key];
        if (e.key === 'Enter' || e.key === ' ') e.preventDefault(), choose(i);
        else if (to !== undefined && opts[to]) e.preventDefault(), opts.forEach((x) => (x.tabIndex = x === opts[to] ? 0 : -1)), opts[to].focus();
      });
      // Extra: hovering nudges that option on its thread
      k.on(o, 'pointerenter', () => !reducedMotion && gsap.fromTo(hangs[i], { rotation: 9 }, { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.25)', overwrite: true }));
    });
    return () => k.destroy();
  },
};
