/** Dust Sidebar: closing the activity sidebar turns it to dust that blows off the edge of the page, grain by grain; opening gathers it back. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';

export const meta = {
  title: 'Dust Sidebar',
  element: 'Sidebar panel',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Staggered', 'Randomized', 'Reversible'],
  effect: ['Disintegration', 'Dispersion', 'Drifting'],
  purpose: ['Feedback', 'Delight', 'Storytelling'],
  properties: ['Clip & mask', 'Position', 'Opacity', 'Scale'],
  description: 'An activity sidebar that blows away. Close it and, starting from the side nearest the page, it breaks into grains of dust that drift up and off the edge in a soft wind. Open it and the grains blow back in and settle into the panel again.',
  params: [
    { key: 'grain', label: 'Grain', group: 'Shape', type: 'range', min: 4, max: 12, step: 1, unit: '', default: 8 },
    { key: 'time', label: 'Sweep time', group: 'Motion', type: 'range', min: 0.6, max: 3, step: 0.2, unit: 's', default: 1.4, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Sidebar'),
  ],
};

const FEED = ['Mei commented', 'Bo shared a board', 'Export finished', 'Ana joined'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const panel = `<div class="sp-dst__panel"><span class="sp-pn__kick">Activity</span>${FEED.map((f, i) => `<span class="sp-dst__row"><i></i>${f}<small>${(i + 1) * 4}m</small></span>`).join('')}</div>`;
    k.html(`
      <div class="sp sp-pn sp-dst">
        <div class="sp-pn__page sp-dst__page"><span class="sp-pn__kick">Board</span><b class="sp-pn__h">Moodboard</b>${bars(6)}</div>
        <aside class="sp-dst__side">${panel}<div class="sp-cc__pieces"></div></aside>
        <button type="button" class="sp-pn__btn sp-dst__btn" aria-expanded="true">Hide activity</button>
      </div>`);
    const side = k.$('.sp-dst__side');
    const real = k.$('.sp-dst__side > .sp-dst__panel');
    const host = k.$('.sp-cc__pieces');
    const btn = k.$('.sp-dst__btn');
    let tl;

    k.on(btn, 'click', () => {
      const show = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(show));
      btn.textContent = show ? 'Hide activity' : 'Show activity';
      side.inert = !show;
      if (show) {
        tl?.eventCallback('onReverseComplete', () => { gsap.set(real, { autoAlpha: 1 }); host.innerHTML = ''; }).timeScale(1.8).reverse();
        if (reducedMotion) tl?.progress(0);
        return;
      }
      tl?.kill();
      const g = Math.round(p.grain);
      const bits = pieces(host, panel, grid(g, Math.round(g * 1.6)));
      tl = gsap.timeline().set(real, { autoAlpha: 0 });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const at = (cx / 100) * p.time * 0.6 + Math.random() * p.time * 0.3;
        tl.to(el, {
          x: `${4 + Math.random() * 8}em`,
          y: `${-2 - Math.random() * 5 + (cy - 50) * 0.02}em`,
          rotation: (Math.random() - 0.5) * 200,
          scale: 0.25 + Math.random() * 0.4,
          autoAlpha: 0,
          duration: 0.8 + Math.random() * 0.6,
          ease: 'power1.in',
        }, at);
      });
      if (reducedMotion) tl.progress(1);
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
