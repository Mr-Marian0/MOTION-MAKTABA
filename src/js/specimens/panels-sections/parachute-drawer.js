/** Parachute Drawer: a message drawer descends onto the page under a little parachute, swaying gently; on landing the canopy collapses and slides off. "Send up" re-inflates it and it lifts away. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Parachute Drawer',
  element: 'Drawer',
  trigger: ['Click', 'Load', 'Keyboard'],
  behavior: ['Sequential', 'Gravity-driven', 'Oscillating', 'Reversible'],
  effect: ['Descending', 'Swaying', 'Deflation', 'Rising'],
  purpose: ['Delight', 'Storytelling', 'Focus'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A message drawer that arrives by parachute. It descends slowly from above the page, swaying side to side under its canopy, and touches down in its place; the canopy then collapses and slides off to the side. "Send up" re-inflates it and the drawer lifts away again.',
  params: [
    { key: 'time', label: 'Descent time', group: 'Motion', type: 'range', min: 1, max: 5, step: 0.25, unit: 's', default: 2.5, live: true },
    { key: 'sway', label: 'Sway', group: 'Motion', type: 'range', min: 0, max: 14, step: 1, unit: '°', default: 7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Canopy'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-pch2">
        <div class="sp-pn__page"><span class="sp-pn__kick">Inbox</span>${bars(8)}</div>
        <div class="sp-pch2__rig">
          <div class="sp-pch2__chute"><i class="sp-pch2__canopy"></i><i class="sp-pch2__lines"></i></div>
          <div class="sp-pn__sheet sp-pch2__box"><span class="sp-pn__kick">Delivered</span><b>Your proofs are here</b><span class="sp-pch2__text">12 pages · ready to review</span></div>
        </div>
        <button type="button" class="sp-pn__btn sp-pn__corner sp-pch2__btn">Send up</button>
      </div>`);
    const rig = k.$('.sp-pch2__rig');
    const chute = k.$('.sp-pch2__chute');
    const btn = k.$('.sp-pch2__btn');
    let landed = false;
    let tl;

    const descend = () => {
      landed = true;
      btn.textContent = 'Send up';
      tl?.kill();
      tl = gsap.timeline()
        .set(chute, { scaleY: 1, x: 0, rotation: 0, autoAlpha: 1 })
        .fromTo(rig, { y: '-22em' }, { y: 0, duration: p.time, ease: 'power1.out' })
        .fromTo(rig, { rotation: 0 }, { keyframes: { rotation: [p.sway, -p.sway, p.sway * 0.6, -p.sway * 0.3, 0] }, duration: p.time, ease: 'sine.inOut' }, '<')
        // Touch down: a little squash, then the canopy deflates and slides off
        .to(rig, { scaleY: 0.96, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: '50% 100%' })
        .to(chute, { scaleY: 0.25, rotation: 25, x: '5em', autoAlpha: 0, duration: 0.8, ease: 'power2.in' });
      if (reducedMotion) tl.progress(1);
    };
    const ascend = () => {
      landed = false;
      btn.textContent = 'Drop again';
      tl?.kill();
      tl = gsap.timeline()
        .to(chute, { scaleY: 1, rotation: 0, x: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)' })
        .to(rig, { y: '-22em', duration: 1.2, ease: 'power2.in' });
      if (reducedMotion) tl.progress(1);
    };
    gsap.set(chute, { transformOrigin: '50% 100%' });
    gsap.set(rig, { y: '-22em' });
    k.inView(stage, () => !tl && descend(), 0.5);
    k.on(btn, 'click', () => (landed ? ascend() : descend()));

    return () => { tl?.kill(); k.destroy(); };
  },
};
