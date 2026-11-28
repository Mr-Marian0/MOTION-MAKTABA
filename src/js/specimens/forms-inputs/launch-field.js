/** Launch Field: subscribe with a good address and it launches: the field counts down 3-2-1, the address lifts off as a rocket pill on a trail of smoke, accelerating out of the top, and the field resets with a thank-you. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Launch Field',
  element: 'Text field',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Conditional', 'Sequential', 'Event-driven'],
  effect: ['Launching', 'Accelerating', 'Motion-trail'],
  purpose: ['Feedback', 'Delight', 'Storytelling'],
  properties: ['Position', 'Scale', 'Opacity'],
  description: 'A newsletter field with a launch pad. Enter a valid address and press Subscribe (or Enter): a 3-2-1 counts down on the button, the field gives a rumble, and the address lifts out of it as a little rocket that rises slowly, then faster and faster, trailing smoke, until it is gone off the top. A bad address just rumbles and says what is missing.',
  params: [
    { key: 'count', label: 'Countdown', group: 'Behavior', type: 'toggle', default: true, live: true },
    { key: 'time', label: 'Climb time', group: 'Motion', type: 'range', min: 0.5, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Flame'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('lch');
    k.html(`
      <div class="sp sp-fi sp-lch">
        <form class="sp-fi__wrap sp-lch__form" novalidate>
          <label class="sp-fi__label" for="${id}">Get the monthly letter</label>
          <div class="sp-fi__box sp-lch__box">
            <input class="sp-fi__input" id="${id}" type="email" value="ada@studio.co" autocomplete="off" aria-describedby="${id}-m" />
            <button class="sp-fi__btn sp-lch__go">Subscribe</button>
            <span class="sp-lch__sky" aria-hidden="true"></span>
          </div>
          <small class="sp-fi__msg" id="${id}-m" aria-live="polite"></small>
        </form>
      </div>`);
    const form = k.$('.sp-lch__form');
    const box = k.$('.sp-lch__box');
    const input = k.$('.sp-fi__input');
    const go = k.$('.sp-lch__go');
    const sky = k.$('.sp-lch__sky');
    const msg = k.$('.sp-fi__msg');
    const rumble = () => !reducedMotion && gsap.fromTo(box, { x: 0 }, { keyframes: { x: [-2, 2, -2, 1, 0], y: [1, -1, 1, 0, 0] }, duration: 0.3, ease: 'none' });
    let busy = false;
    k.on(form, 'submit', (e) => {
      e.preventDefault();
      if (busy) return;
      const v = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
        msg.textContent = v.includes('@') ? 'That address needs a domain, like .com.' : 'That address is missing an @.';
        return rumble();
      }
      msg.textContent = '';
      if (reducedMotion) return (input.value = '', msg.textContent = `Subscribed ${v}. See you next month!`);
      busy = true;
      let puffs = -1; // declared before the timeline: fromTo renders (and calls onUpdate) as it is built
      const rocket = document.createElement('b');
      rocket.className = 'sp-lch__rocket';
      rocket.innerHTML = `${esc(v)}<i></i>`;
      const tl = gsap.timeline({ onComplete: () => { rocket.remove(); go.textContent = 'Subscribe'; busy = false; msg.textContent = 'You’re on the list. See you next month!'; } });
      if (p.count) ['3', '2', '1'].forEach((n, i) => tl.call(() => (go.textContent = n), null, i * 0.35).add(rumble, i * 0.35));
      tl.call(() => { input.value = ''; sky.append(rocket); go.textContent = '🚀'; })
        // slow off the pad, then ever faster (expo.in), with smoke puffs left behind
        .fromTo(rocket, { y: 0 }, { y: '-14em', duration: p.time, ease: 'expo.in', onUpdate() {
          // a smoke puff every eighth of the climb, left where the rocket was
          const step = Math.floor(this.progress() * 8);
          if (step <= puffs) return;
          puffs = step;
          const puff = document.createElement('i');
          puff.className = 'sp-lch__puff';
          sky.append(puff);
          gsap.fromTo(puff, { y: gsap.getProperty(rocket, 'y') }, { scale: 2.5, autoAlpha: 0, x: (Math.random() - 0.5) * 20, duration: 0.8, ease: 'power2.out', onComplete: () => puff.remove() });
        } })
        .to(rocket, { autoAlpha: 0, duration: 0.2 }, '-=0.2');
    });
    return () => k.destroy();
  },
};
