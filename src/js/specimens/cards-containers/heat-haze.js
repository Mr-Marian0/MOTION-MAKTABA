/** Heat Haze: switching plans sends a wave of rising heat haze through the pricing card: the content is displaced by moving noise, swaps at the peak, and clears. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Heat Haze',
  element: 'Pricing card',
  trigger: ['Click', 'Hover', 'Keyboard'],
  behavior: ['Toggle-dependent', 'State-dependent', 'Hover-dependent', 'Continuous'],
  effect: ['Displacement', 'Distortion', 'Shimmering'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Shape', 'Typography', 'Blur'],
  description: 'A pricing card with a Monthly / Yearly switch. Switching sends a wave of heat haze through it: drifting noise pushes every pixel of the price and features aside, the new values swap in at the hottest moment, and the air clears. Hovering keeps a faint shimmer going.',
  params: [
    { key: 'heat', label: 'Heat', group: 'Motion', type: 'range', min: 4, max: 40, step: 2, unit: 'px', default: 22, live: true },
    { key: 'time', label: 'Wave time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    { key: 'shimmer', label: 'Hover shimmer', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#b3412e'),
  ],
};

const PLANS = {
  Monthly: { price: '$14', per: '/ month', note: 'Cancel any time', perks: ['5 projects', '20 GB storage', 'Email help'] },
  Yearly: { price: '$140', per: '/ year', note: 'Two months free', perks: ['Unlimited projects', '200 GB storage', 'Priority help'] },
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('haze');
    k.html(`
      <div class="sp sp-cc sp-hz">
        <svg class="sp-hz__defs" aria-hidden="true"><filter id="${id}" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.015 0.06" numOctaves="2" seed="4" result="n" />
          <feOffset in="n" dy="0" result="m" />
          <feDisplacementMap in="SourceGraphic" in2="m" scale="0" xChannelSelector="R" yChannelSelector="G" />
        </filter></svg>
        <article class="sp-cc__card sp-hz__card">
          <div class="sp-hz__switch" role="radiogroup" aria-label="Billing">
            ${Object.keys(PLANS).map((n, i) => `<button type="button" role="radio" aria-checked="${!i}">${n}</button>`).join('')}
          </div>
          <div class="sp-hz__body" aria-live="polite">
            <span class="sp-cc__kick">Studio plan</span>
            <div><b class="sp-cc__big sp-hz__price"></b><span class="sp-cc__text sp-hz__per"></span></div>
            <span class="sp-hz__note"></span>
            <ul class="sp-hz__perks"></ul>
          </div>
          <span class="sp-cc__btn sp-hz__go">Choose plan</span>
        </article>
      </div>`);
    const card = k.$('.sp-hz__card');
    const body = k.$('.sp-hz__body');
    const map = k.$('feDisplacementMap');
    const shift = k.$('feOffset');
    const tabs = k.$$('.sp-hz__switch button');
    k.fit(card, 0.86);
    const s = k.track({ heat: 0, rise: 0 });
    let wave;
    let drift;

    const fill = (name) => {
      const plan = PLANS[name];
      k.$('.sp-hz__price').textContent = plan.price;
      k.$('.sp-hz__per').textContent = ` ${plan.per}`;
      k.$('.sp-hz__note').textContent = plan.note;
      k.$('.sp-hz__perks').innerHTML = plan.perks.map((t) => `<li>${t}</li>`).join('');
    };
    fill('Monthly');
    // Only filter while there is heat: an idle filter still costs a repaint.
    const draw = () => {
      map.setAttribute('scale', s.heat.toFixed(2));
      shift.setAttribute('dy', (-s.rise).toFixed(1));
      body.style.filter = s.heat > 0.2 ? `url(#${id})` : '';
    };
    // The noise drifts up and back within the filter's 20% margin, so no empty edge ever reaches the card.
    const rising = () => {
      if (drift || reducedMotion) return;
      drift = gsap.to(s, { rise: 28, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1, onUpdate: draw });
    };
    const calm = () => s.heat < 0.2 && (drift?.kill(), (drift = null));

    k.on(card, 'pointerenter', () => {
      if (!p.shimmer || reducedMotion || wave?.isActive()) return;
      rising();
      gsap.to(s, { heat: 3, duration: 0.5, onUpdate: draw });
    });
    k.on(card, 'pointerleave', () => !wave?.isActive() && gsap.to(s, { heat: 0, duration: 0.5, onUpdate: draw, onComplete: calm }));

    tabs.forEach((t) => k.on(t, 'click', () => {
      if (t.getAttribute('aria-checked') === 'true') return;
      tabs.forEach((b) => b.setAttribute('aria-checked', String(b === t)));
      if (reducedMotion) return fill(t.textContent);
      wave?.kill();
      rising();
      const rest = card.matches(':hover') && p.shimmer ? 3 : 0;
      wave = gsap.timeline({ onComplete: calm })
        .to(s, { heat: p.heat, duration: p.time * 0.45, ease: 'power2.in', onUpdate: draw })
        .add(() => fill(t.textContent))
        .to(s, { heat: rest, duration: p.time * 0.55, ease: 'power2.out', onUpdate: draw });
    }));

    return () => { wave?.kill(); drift?.kill(); k.destroy(); };
  },
};
