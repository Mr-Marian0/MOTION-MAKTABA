/** Inflate Chart: the bars of a column chart are balloons: on load (and on refresh) each one inflates up to its value, bulging round at the top, overshooting a little and settling with a wobble. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const DATA = [['Mon', 42], ['Tue', 68], ['Wed', 55], ['Thu', 90], ['Fri', 74], ['Sat', 36]];

export const meta = {
  title: 'Inflate Chart',
  element: 'Charts',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Staggered', 'Elastic'],
  effect: ['Inflation', 'Bulging', 'Overshoot-motion'],
  purpose: ['Feedback', 'Delight', 'Hierarchy'],
  properties: ['Scale', 'Radius', 'Size'],
  description: 'A weekly visits chart whose columns are blown up like balloons. When it comes into view each bar inflates from the baseline one after another: it swells upward with a fat, rounded top, overshoots its value a little and wobbles back, its tip getting rounder while it is full of air. "New week" deflates them all and inflates the new numbers. Each bar shows its value.',
  params: [
    { key: 'time', label: 'Inflate time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.05, unit: 's', default: 0.8, live: true },
    { key: 'wobble', label: 'Wobble', group: 'Motion', type: 'range', min: 0.2, max: 0.8, step: 0.05, unit: '', default: 0.4, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Bars'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-inf">
        <div class="sp-df__card">
          <div class="sp-df__row"><span class="sp-df__kick">Visits this week</span><button type="button" class="sp-df__btn sp-df__btn--ghost">New week</button></div>
          <div class="sp-inf__plot" role="img" aria-label="Visits per day">${DATA.map(([d]) => `<div class="sp-inf__col"><span class="sp-inf__bar"><b>0</b></span><small>${d}</small></div>`).join('')}</div>
        </div>
      </div>`);
    const plot = k.$('.sp-inf__plot');
    const bars = k.$$('.sp-inf__bar');
    const vals = k.$$('.sp-inf__bar b');
    gsap.set(bars, { transformOrigin: '50% 100%', scaleY: 0 });
    let data = DATA.map(([, v]) => v);
    const inflate = () => {
      plot.setAttribute('aria-label', `Visits per day: ${DATA.map(([d], i) => `${d} ${data[i]}`).join(', ')}`);
      bars.forEach((b, i) => {
        b.style.setProperty('--h', `${data[i]}%`);
        vals[i].textContent = data[i];
        if (reducedMotion) return gsap.set(b, { scaleY: 1, borderRadius: '0.5em 0.5em 0.2em 0.2em' });
        gsap.timeline({ delay: i * p.time * 0.12 })
          .fromTo(b, { scaleY: 0, scaleX: 0.7, borderRadius: '50% 50% 0.2em 0.2em / 30% 30% 0.2em 0.2em' }, { scaleY: 1, scaleX: 1.12, duration: p.time * 0.7, ease: 'power2.out' })
          .to(b, { scaleX: 1, borderRadius: '0.5em 0.5em 0.2em 0.2em', duration: p.time, ease: `elastic.out(1.2, ${p.wobble})` });
      });
    };
    k.inView(plot, inflate, 0.5);
    k.on(k.$('.sp-df__btn'), 'click', () => {
      data = data.map(() => 20 + Math.round(Math.random() * 78));
      if (reducedMotion) return inflate();
      gsap.to(bars, { scaleY: 0, scaleX: 0.8, duration: 0.3, ease: 'power2.in', stagger: 0.03, onComplete: inflate });
    });
    return () => k.destroy();
  },
};
