/** Eject Drawer: "Eject" kicks a tray drawer out of its slot like a disc tray: a click, a sharp spring out, and the file on it bounces with the jolt. Press again to push it home. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Eject Drawer',
  element: 'Drawer',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Spring-driven', 'Event-driven', 'Reversible'],
  effect: ['Ejecting', 'Springing', 'Bouncing', 'Recoiling'],
  purpose: ['Feedback', 'Delight', 'Affordance'],
  properties: ['Position', 'Rotation', 'Shadow'],
  description: 'A downloads tray built into the page like a disc tray. Press Eject: a latch clicks, the tray is kicked out of its slot on a spring and overshoots, and the file lying on it hops with the jolt before settling. Press again and it slides back in with a soft clunk.',
  params: [
    { key: 'kick', label: 'Kick', group: 'Motion', type: 'range', min: 1, max: 4, step: 0.25, unit: '', default: 2.5, live: true },
    { key: 'reach', label: 'Tray depth', group: 'Size', type: 'range', min: 6, max: 14, step: 1, unit: 'em', default: 10 },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Tray'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-ejc">
        <div class="sp-pn__page"><span class="sp-pn__kick">Library</span><b class="sp-pn__h">Downloads</b>${bars(3)}</div>
        <div class="sp-ejc__unit">
          <div class="sp-ejc__well"><div class="sp-ejc__tray" style="height:${p.reach}em" inert><i class="sp-ejc__file"><b>PDF</b><span>Folding guide</span></i></div></div>
          <div class="sp-ejc__face"><i class="sp-ejc__slot"></i><i class="sp-ejc__led"></i><button type="button" class="sp-ejc__btn" aria-expanded="false">⏏ Eject</button></div>
        </div>
      </div>`);
    const tray = k.$('.sp-ejc__tray');
    const file = k.$('.sp-ejc__file');
    const led = k.$('.sp-ejc__led');
    const btn = k.$('.sp-ejc__btn');
    gsap.set(tray, { yPercent: -101 }); // inside the slot, above the well's clipped top
    let tl;

    k.on(btn, 'click', () => {
      const out = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(out));
      btn.textContent = out ? '⏏ Close' : '⏏ Eject';
      tray.inert = !out;
      tl?.kill();
      if (reducedMotion) return gsap.set(tray, { yPercent: out ? 0 : -101 });
      tl = gsap.timeline();
      if (out) {
        tl.to(led, { backgroundColor: '#f2a541', duration: 0.05, repeat: 3, yoyo: true })
          // Latch click, then the spring kicks the tray out past its stop and back
          .to(btn, { y: 2, duration: 0.06, yoyo: true, repeat: 1 }, '<')
          .to(tray, { yPercent: 0, duration: 0.55, ease: `back.out(${p.kick})` })
          .to(file, { keyframes: { y: ['-1.4em', '0em', '-0.3em', '0em'], rotation: [-6, 3, -1, 0] }, duration: 0.6, ease: 'power1.out' }, '<0.08');
      } else {
        tl.to(tray, { yPercent: -101, duration: 0.5, ease: 'power3.in' })
          .to(k.$('.sp-ejc__unit'), { keyframes: { y: [1, -1, 0] }, duration: 0.15 });
      }
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
