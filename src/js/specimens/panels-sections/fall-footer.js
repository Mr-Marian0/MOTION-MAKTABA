/** Fall Footer: when the footer comes into view its link tiles fall from above, picking up speed, and land in a heap that settles into rows. "Shake" knocks them loose to fall again. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Fall Footer',
  element: 'Footer',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Gravity-driven', 'Randomized', 'Staggered'],
  effect: ['Falling', 'Bouncing', 'Accumulation', 'Tumbling'],
  purpose: ['Delight', 'Navigation', 'Branding'],
  properties: ['Position', 'Rotation', 'Layout'],
  description: 'A footer whose links are paper tiles that fall into place. As it scrolls into view the tiles drop from above in a random order, speeding up as they fall, landing with a small bounce and a tilt that straightens out as they settle into rows. "Shake" knocks them all up to fall again.',
  params: [
    { key: 'height', label: 'Drop height', group: 'Motion', type: 'range', min: 4, max: 20, step: 1, unit: 'em', default: 12, live: true },
    { key: 'spread', label: 'Stagger', group: 'Motion', type: 'range', min: 0.02, max: 0.2, step: 0.01, unit: 's', default: 0.07, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Footer'),
  ],
};

const LINKS = ['Shop', 'Journal', 'About', 'Stockists', 'Shipping', 'Returns', 'Careers', 'Press', 'Contact', 'Privacy'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-fal">
        <div class="sp-pn__page"><span class="sp-pn__kick">End of page</span>${bars(4)}</div>
        <footer class="sp-fal__foot">
          <div class="sp-fal__tiles">${LINKS.map((t) => `<a href="#" class="sp-fal__tile">${t}</a>`).join('')}</div>
          <button type="button" class="sp-pn__btn sp-pn__btn--ghost sp-fal__btn">Shake</button>
        </footer>
      </div>`);
    const tiles = k.$$('.sp-fal__tile');
    k.on(k.$('.sp-fal__tiles'), 'click', (e) => e.preventDefault());
    let tl;
    const fall = () => {
      tl?.kill();
      if (reducedMotion) return gsap.set(tiles, { y: 0, rotation: 0, autoAlpha: 1 });
      const order = gsap.utils.shuffle(tiles.slice());
      tl = gsap.timeline();
      order.forEach((tile, i) => {
        const tilt = (Math.random() - 0.5) * 30;
        tl.fromTo(tile, { y: `${-p.height - Math.random() * 4}em`, rotation: tilt * 2, autoAlpha: 1 }, { y: 0, rotation: tilt, duration: 0.55, ease: 'power2.in' }, i * p.spread)
          .to(tile, { keyframes: { y: ['-0.6em', '0em'] }, rotation: 0, duration: 0.45, ease: 'power1.out' });
      });
    };
    gsap.set(tiles, { autoAlpha: 0 });
    k.inView(stage, () => !tl && fall(), 0.5);
    k.on(k.$('.sp-fal__btn'), 'click', () => {
      tl?.kill();
      // Knocked up and out of the frame, then they fall back in
      tl = gsap.timeline().to(tiles, { y: `${-p.height}em`, rotation: () => (Math.random() - 0.5) * 60, duration: 0.3, ease: 'power2.out', stagger: 0.01 }).add(fall);
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
