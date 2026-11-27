/** Liquid Drawer: closing the side drawer turns it to liquid: it slumps into a puddle at the foot of the page, sloshes, and drains away. Opening pours it back up solid. */
import { kit, uid, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Liquid Drawer',
  element: 'Drawer',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Gravity-driven', 'Reversible', 'Elastic'],
  effect: ['Liquefaction', 'Solidification', 'Swaying', 'Metaball-morphing'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Shape', 'Scale', 'Radius', 'Opacity'],
  description: 'A settings drawer that melts out of the way. Close it and it loses its shape: it slumps down the side of the page into a puddle, sloshes back and forth, and drains off the bottom. Open it and the liquid rises back up and sets into a solid drawer.',
  params: [
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.5, max: 2, step: 0.1, unit: '×', default: 1, live: true },
    { key: 'slosh', label: 'Slosh', group: 'Motion', type: 'range', min: 0, max: 20, step: 2, unit: '°', default: 12, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Drawer'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('lqd');
    k.html(`
      <div class="sp sp-pn sp-lqd">
        <svg class="sp-lqd__defs" aria-hidden="true"><filter id="${id}" x="-30%" y="-20%" width="160%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter></svg>
        <div class="sp-pn__page"><span class="sp-pn__kick">Editor</span><b class="sp-pn__h">Untitled</b>${bars(6)}</div>
        <div class="sp-lqd__goo"><i class="sp-lqd__body"></i></div>
        <div class="sp-lqd__content"><span class="sp-pn__kick">Settings</span><label><input type="checkbox" checked tabindex="-1"> Autosave</label><label><input type="checkbox" tabindex="-1"> Dark ink</label><label><input type="checkbox" checked tabindex="-1"> Grid</label></div>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-lqd__btn" aria-expanded="true">Close settings</button>
      </div>`);
    const goo = k.$('.sp-lqd__goo');
    const body = k.$('.sp-lqd__body');
    const content = k.$('.sp-lqd__content');
    const btn = k.$('.sp-lqd__btn');
    const liquid = (on) => (goo.style.filter = on ? `url(#${id})` : '');
    gsap.set(body, { transformOrigin: '50% 100%' });
    let tl;

    k.on(btn, 'click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close settings' : 'Settings';
      content.inert = !open;
      tl?.kill();
      if (reducedMotion) return gsap.set([body, content], { autoAlpha: open ? 1 : 0 });
      const t = (v) => v * p.time;
      liquid(true);
      tl = gsap.timeline({ onComplete: () => open && liquid(false) });
      if (!open) {
        tl.to(content, { autoAlpha: 0, y: '1em', duration: t(0.2) })
          .to(body, { scaleY: 0.12, scaleX: 1.5, borderRadius: '50% 50% 0 0 / 100% 100% 0 0', duration: t(0.6), ease: 'power2.in' }, '<')
          .to(body, { keyframes: { skewX: [p.slosh, -p.slosh * 0.7, p.slosh * 0.4, 0] }, duration: t(0.8), ease: 'none' })
          .to(body, { y: '3em', duration: t(0.4), ease: 'power2.in' });
      } else {
        tl.fromTo(body, { y: '3em', scaleY: 0.12, scaleX: 1.5 }, { y: 0, duration: t(0.3), ease: 'power2.out' })
          .to(body, { scaleY: 1.06, scaleX: 0.96, borderRadius: '0.6em 0 0 0.6em', duration: t(0.45), ease: 'power2.out' })
          .to(body, { scaleY: 1, scaleX: 1, duration: t(0.6), ease: 'elastic.out(1, 0.4)' })
          .to(content, { autoAlpha: 1, y: 0, duration: t(0.3) }, '<');
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
