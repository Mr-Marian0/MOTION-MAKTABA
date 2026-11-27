/** Walker Footer: a little paper figure strolls along the footer's top edge to whichever link you point at, legs and arms swinging, and stops under it with a nod. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Walker Footer',
  element: 'Footer',
  trigger: ['Hover', 'Focus', 'Click'],
  behavior: ['Hover-dependent', 'Following', 'Position-aware', 'Interruptible'],
  effect: ['Walking', 'Swinging', 'Bobbing'],
  purpose: ['Wayfinding', 'Delight', 'Branding'],
  properties: ['Position', 'Rotation'],
  description: 'A footer with a tiny paper figure standing on its top edge. Point at (or tab to) a link and the figure turns and walks over to it at a steady pace, legs and arms swinging and body bobbing with each step, then stops beneath it and nods. Change your mind halfway and it turns around.',
  params: [
    { key: 'speed', label: 'Walking speed', group: 'Motion', type: 'range', min: 4, max: 20, step: 1, unit: 'em/s', default: 9, live: true },
    { key: 'stride', label: 'Stride', group: 'Motion', type: 'range', min: 10, max: 45, step: 5, unit: '°', default: 30, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Figure'),
  ],
};

const LINKS = ['Shop', 'Journal', 'About', 'Stockists', 'Contact'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-wlk">
        <div class="sp-pn__page"><span class="sp-pn__kick">Studio</span><b class="sp-pn__h">See you around</b>${bars(4)}</div>
        <footer class="sp-wlk__foot">
          <div class="sp-wlk__walker" aria-hidden="true"><i class="sp-wlk__head"></i><i class="sp-wlk__body"></i><i class="sp-wlk__arm sp-wlk__arm--a"></i><i class="sp-wlk__arm sp-wlk__arm--b"></i><i class="sp-wlk__leg sp-wlk__leg--a"></i><i class="sp-wlk__leg sp-wlk__leg--b"></i></div>
          <nav class="sp-wlk__links">${LINKS.map((t) => `<a href="#" class="sp-wlk__link">${t}</a>`).join('')}</nav>
        </footer>
      </div>`);
    const foot = k.$('.sp-wlk__foot');
    const walker = k.$('.sp-wlk__walker');
    const [la, lb] = k.$$('.sp-wlk__leg');
    const [aa, ab] = k.$$('.sp-wlk__arm');
    const links = k.$$('.sp-wlk__link');
    k.on(k.$('.sp-wlk__links'), 'click', (e) => e.preventDefault());

    // One stride cycle: legs and arms swing opposite each other, the body bobs twice.
    const cycle = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: 'sine.inOut', duration: 0.25 } })
      .to([la, ab], { rotation: () => p.stride })
      .to([lb, aa], { rotation: () => -p.stride }, 0)
      .to(walker, { y: -2 }, 0)
      .to([la, ab], { rotation: () => -p.stride })
      .to([lb, aa], { rotation: () => p.stride }, '<')
      .to(walker, { y: 0 }, '<');
    let walk;

    const goTo = (link) => {
      const fr = foot.getBoundingClientRect();
      const lr = link.getBoundingClientRect();
      const x = lr.left + lr.width / 2 - fr.left;
      const from = gsap.getProperty(walker, 'x');
      const em = parseFloat(getComputedStyle(foot).fontSize);
      walk?.kill();
      gsap.set(walker, { scaleX: x < from ? -1 : 1 });
      if (reducedMotion) return gsap.set(walker, { x });
      cycle.invalidate().play();
      walk = gsap.timeline()
        .to(walker, { x, duration: Math.abs(x - from) / (p.speed * em), ease: 'none' })
        .add(() => { cycle.pause(); gsap.to([la, lb, aa, ab], { rotation: 0, duration: 0.15 }); gsap.to(walker, { y: 0, duration: 0.15 }); })
        .to(k.$('.sp-wlk__head'), { keyframes: { y: [2, 0] }, duration: 0.3 });
    };
    links.forEach((l) => {
      k.on(l, 'pointerenter', () => goTo(l));
      k.on(l, 'focus', () => goTo(l));
    });
    // Start under the first link (offsetLeft is already measured from the footer).
    k.resize(foot, () => !walk && gsap.set(walker, { x: links[0].offsetLeft + links[0].offsetWidth / 2 }));

    return () => { cycle.kill(); walk?.kill(); k.destroy(); };
  },
};
