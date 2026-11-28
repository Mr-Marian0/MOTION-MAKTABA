/** Ghost Popover: one popover serves a row of icons; as you move between them it glides over, leaving fading ghost copies of itself along the way like an afterimage. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { page } from './_ov.js';

export const meta = {
  title: 'Ghost Popover',
  element: 'Popover',
  trigger: ['Hover', 'Focus'],
  behavior: ['Hover-dependent', 'Following', 'Interruptible', 'Position-aware'],
  effect: ['Ghosting', 'Afterimage-motion', 'Sliding'],
  purpose: ['Continuity', 'Wayfinding', 'Delight'],
  properties: ['Position', 'Opacity'],
  description: 'One shared popover for a row of app icons. Move from icon to icon and the popover glides over to the new one with its text swapped, leaving a trail of fading ghost copies of itself behind, like an afterimage, so your eye can follow where it went.',
  params: [
    { key: 'ghosts', label: 'Ghosts', group: 'Shape', type: 'range', min: 2, max: 10, step: 1, unit: '', default: 5, live: true },
    { key: 'time', label: 'Glide time', group: 'Motion', type: 'range', min: 0.2, max: 1, step: 0.05, unit: 's', default: 0.4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Icons'),
  ],
};

const APPS = [['✎', 'Sketch', 'Freehand drawing'], ['▦', 'Boards', 'Collect and arrange'], ['✉', 'Inbox', '3 unread messages'], ['☁', 'Sync', 'Up to date']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-ov sp-gst">
        ${page('Apps', 'Launcher')}
        <div class="sp-gst__row">
          <div class="sp-gst__ghosts" aria-hidden="true"></div>
          <div class="sp-ov__card sp-gst__pop" role="tooltip"><b class="sp-gst__name"></b><span class="sp-ov__text sp-gst__desc"></span></div>
          ${APPS.map(([g, n]) => `<button type="button" class="sp-gst__icon" aria-label="${n}">${g}</button>`).join('')}
        </div>
      </div>`);
    const pop = k.$('.sp-gst__pop');
    const ghosts = k.$('.sp-gst__ghosts');
    const icons = k.$$('.sp-gst__icon');
    let cur = -1;
    let move;
    gsap.set(pop, { autoAlpha: 0 });
    const xOf = (i) => icons[i].offsetLeft + icons[i].offsetWidth / 2;
    const fill = (i) => ([pop.querySelector('.sp-gst__name').textContent, pop.querySelector('.sp-gst__desc').textContent] = [APPS[i][1], APPS[i][2]]);
    const go = (i) => {
      if (i === cur) return;
      const first = cur < 0;
      cur = i;
      move?.kill();
      if (first || reducedMotion) {
        fill(i);
        return gsap.to(pop, { x: xOf(i), autoAlpha: 1, y: 0, duration: reducedMotion ? 0 : 0.25 });
      }
      const to = xOf(i);
      // Ghosts: copies left behind along the path, each fading from the moment it is dropped
      const n = Math.round(p.ghosts);
      move = gsap.timeline().to(pop, { x: to, duration: p.time, ease: 'power3.inOut' });
      for (let g = 1; g <= n; g++) {
        move.call(() => {
          const ghost = pop.cloneNode(true);
          ghost.removeAttribute('role');
          ghost.classList.add('sp-gst__ghost');
          ghosts.append(ghost);
          gsap.fromTo(ghost, { x: gsap.getProperty(pop, 'x'), autoAlpha: 0.45 }, { autoAlpha: 0, duration: 0.5, ease: 'power1.out', onComplete: () => ghost.remove() });
        }, null, (g / (n + 1)) * p.time);
      }
      move.call(() => fill(i), null, p.time * 0.5);
    };
    icons.forEach((b, i) => {
      k.on(b, 'pointerenter', () => go(i));
      k.on(b, 'focus', () => go(i));
    });
    return () => { move?.kill(); k.destroy(); };
  },
};
