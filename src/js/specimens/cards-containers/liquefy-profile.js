/** Liquefy Profile: "Next" turns the profile card to liquid: it slumps into a sloshing puddle with a splash, then rises back up solid as the next person. */
import { kit, uid, labelsOf } from '../_kit.js';
import { tone, TONES } from '../_params.js';

export const meta = {
  title: 'Liquefy Profile',
  element: 'Profile card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Gravity-driven', 'Elastic', 'Looping'],
  effect: ['Liquefaction', 'Metaball-morphing', 'Swaying', 'Rising'],
  purpose: ['Continuity', 'Delight', 'Storytelling'],
  properties: ['Shape', 'Scale', 'Radius', 'Opacity'],
  description: 'A team card that changes people by turning to liquid. Press Next: the card loses its shape, slumps into a wide puddle that sloshes side to side and throws up a couple of droplets, then the puddle rises back up into a solid card showing the next person.',
  params: [
    { key: 'names', label: 'People', group: 'Content', type: 'text', default: 'Ana Reyes, Bo Lindqvist, Chidi Okafor, Mei Tanaka' },
    { key: 'slump', label: 'Puddle height', group: 'Shape', type: 'range', min: 0.1, max: 0.5, step: 0.05, unit: '×', default: 0.22, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.5, max: 2, step: 0.1, unit: '×', default: 1, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Liquid'),
  ],
};

const ROLES = ['Motion designer', 'Sound designer', 'Front-end dev', 'Illustrator', 'Producer'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('lqf');
    const names = labelsOf(p.names, ['Ana Reyes', 'Bo Lindqvist']);
    k.html(`
      <div class="sp sp-cc sp-lqf">
        <svg class="sp-lqf__defs" aria-hidden="true"><filter id="${id}" x="-20%" y="-60%" width="140%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter></svg>
        <div class="sp-lqf__wrap">
          <div class="sp-lqf__goo"><i class="sp-lqf__body"></i><i class="sp-lqf__drop"></i><i class="sp-lqf__drop"></i></div>
          <div class="sp-lqf__content" aria-live="polite">
            <i class="sp-cc__avatar"></i>
            <b class="sp-cc__title"></b>
            <span class="sp-cc__kick"></span>
          </div>
        </div>
        <button type="button" class="sp-cc__btn sp-lqf__btn">Next</button>
      </div>`);
    const wrap = k.$('.sp-lqf__wrap');
    const goo = k.$('.sp-lqf__goo');
    const body = k.$('.sp-lqf__body');
    const drops = k.$$('.sp-lqf__drop');
    const content = k.$('.sp-lqf__content');
    const blur = k.$('feGaussianBlur');
    const btn = k.$('.sp-lqf__btn');
    k.fit(wrap, 0.8);
    k.resize(wrap, () => blur.setAttribute('stdDeviation', (parseFloat(getComputedStyle(wrap).fontSize) * 0.7).toFixed(1)));
    gsap.set(body, { transformOrigin: '50% 100%' });
    gsap.set(drops, { autoAlpha: 0 });
    let i = 0;
    let tl;
    const fill = () => {
      const n = names[i % names.length];
      const av = k.$('.sp-lqf__content .sp-cc__avatar');
      av.textContent = n.split(' ').map((w) => w[0]).join('').slice(0, 2);
      av.style.background = TONES[(i + 1) % TONES.length].value;
      k.$('.sp-lqf__content .sp-cc__title').textContent = n;
      k.$('.sp-lqf__content .sp-cc__kick').textContent = ROLES[i % ROLES.length];
    };
    fill();

    k.on(btn, 'click', () => {
      if (tl?.isActive()) return;
      if (reducedMotion) return (i += 1), fill();
      const t = (v) => v * p.time;
      const liquid = (on) => {
        goo.classList.toggle('is-liquid', on);
        goo.style.filter = on ? `url(#${id}) drop-shadow(0.25em 0.25em 0 var(--color-ink))` : '';
      };
      liquid(true);
      tl = gsap.timeline({ onComplete: () => liquid(false) })
        .to(content, { autoAlpha: 0, y: '1em', duration: t(0.25) })
        // Lose shape and slump into a puddle
        .to(body, { scaleY: p.slump, scaleX: 1.35, borderRadius: '45% 55% 10% 10% / 70% 70% 10% 10%', duration: t(0.6), ease: 'power2.in' }, '<0.05')
        // Splash: droplets jump out and fall back in
        .fromTo(drops, { autoAlpha: 1, x: 0, y: 0 }, { keyframes: { y: ['-4.5em', '0em'], easeEach: 'sine.inOut' }, x: (j) => `${j ? 5 : -5}em`, duration: t(0.6), ease: 'none' }, '>-0.05')
        .to(drops, { autoAlpha: 0, duration: 0.05 })
        // Slosh side to side, smaller each time
        .to(body, { keyframes: { skewX: [14, -10, 6, -3, 0] }, duration: t(0.9), ease: 'none' }, '<-0.5')
        .add(() => { i += 1; fill(); })
        // Rise back up as a solid card
        .to(body, { scaleY: 1.08, scaleX: 0.95, borderRadius: '0.6em', duration: t(0.45), ease: 'power2.out' })
        .to(body, { scaleY: 1, scaleX: 1, duration: t(0.6), ease: 'elastic.out(1, 0.45)' })
        .to(content, { autoAlpha: 1, y: 0, duration: t(0.3), ease: 'back.out(2)' }, '<');
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
