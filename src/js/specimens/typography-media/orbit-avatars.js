/** Orbit Avatars: a team lead's avatar with their collaborators circling it like moons; hover the group and the moons slow and spread out so you can read them; pick one and it swaps into the centre. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { face, NAMES } from './_tm.js';

export const meta = {
  title: 'Orbit Avatars',
  element: 'Avatar',
  trigger: ['Idle', 'Hover', 'Click', 'Keyboard'],
  behavior: ['Orbiting', 'Hover-dependent', 'Continuous'],
  effect: ['Circling', 'Revolving', 'Decelerating'],
  purpose: ['Hierarchy', 'Delight', 'Navigation'],
  properties: ['Position', 'Rotation', 'Scale'],
  description: 'A project-team widget with the lead in the middle and four collaborators circling round them on a ring, each staying upright as it goes. Point at the group (or tab into it) and the orbit slows almost to a stop and the ring widens so each face is easy to pick; choose one and they swap places, the old lead joining the orbit.',
  params: [
    { key: 'period', label: 'Orbit time', group: 'Motion', type: 'range', min: 4, max: 20, step: 1, unit: 's', default: 10, live: true },
    { key: 'radius', label: 'Ring size', group: 'Shape', type: 'range', min: 3, max: 6, step: 0.25, unit: 'em', default: 4.25, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Ring'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    let order = [0, 1, 2, 3, 4]; // order[0] is the lead
    k.html(`
      <div class="sp sp-tm sp-orv">
        <div class="sp-orv__sys" role="group" aria-label="Project team">
          <i class="sp-orv__ring" aria-hidden="true"></i>
          ${order.map((i) => `<button type="button" class="sp-orv__m" data-who="${i}" aria-label="${NAMES[i]}">${face(i)}</button>`).join('')}
        </div>
        <small class="sp-orv__lead" aria-live="polite">Lead: ${NAMES[0]}</small>
      </div>`);
    const sys = k.$('.sp-orv__sys');
    const ring = k.$('.sp-orv__ring');
    const lead = k.$('.sp-orv__lead');
    const btns = k.$$('.sp-orv__m');
    const E = () => parseFloat(getComputedStyle(sys).fontSize) || 14;
    // s.a: orbit angle; s.r: ring radius in em (widens on hover). Moons are placed from these each frame.
    const s = k.track({ a: 0, r: p.radius });
    let em = 14;
    const place = () => {
      const moons = order.slice(1);
      moons.forEach((who, j) => {
        const ang = s.a + (j / moons.length) * Math.PI * 2;
        gsap.set(btns[who], { x: Math.cos(ang) * s.r * em, y: Math.sin(ang) * s.r * em * 0.82, scale: 0.75, zIndex: 1 });
      });
      gsap.set(btns[order[0]], { x: 0, y: 0, scale: 1.25, zIndex: 2 });
      gsap.set(ring, { scaleX: s.r / p.radius, scaleY: s.r / p.radius });
    };
    k.resize(sys, () => { em = E(); place(); });
    const spin = reducedMotion ? null : gsap.to(s, { a: `+=${Math.PI * 2}`, duration: p.period, ease: 'none', repeat: -1, onUpdate: place });
    const calm = (on) => {
      if (reducedMotion) return;
      gsap.to(spin, { timeScale: on ? 0.08 : 1, duration: 0.6, overwrite: true });
      gsap.to(s, { r: on ? p.radius * 1.15 : p.radius, duration: 0.6, ease: 'power2.out', onUpdate: () => spin.paused() && place(), overwrite: 'auto' });
    };
    ['pointerenter', 'focusin'].forEach((ev) => k.on(sys, ev, () => calm(true)));
    k.on(sys, 'pointerleave', () => !sys.contains(document.activeElement) && calm(false));
    k.on(sys, 'focusout', (e) => !sys.contains(e.relatedTarget) && calm(false));
    btns.forEach((b) => k.on(b, 'click', () => {
      const who = Number(b.dataset.who);
      if (who === order[0]) return;
      order = [who, ...order.filter((x) => x !== who)];
      lead.textContent = `Lead: ${NAMES[who]}`;
      if (reducedMotion) return place();
      // a quick swap: both fly to their new spots, then the orbit carries on
      gsap.fromTo(b, { scale: 0.75 }, { scale: 1.25, duration: 0.35, ease: 'back.out(2)' });
      place();
    }));
    if (reducedMotion) place();
    return () => { spin?.kill(); k.destroy(); };
  },
};
