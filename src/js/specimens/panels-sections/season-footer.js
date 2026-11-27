/** Season Footer: the footer band changes state of matter: ice (a jagged, glinting edge), water (a rolling wave) and steam (puffs rising away). Click the state to move to the next. */
import { kit, bars } from '../_kit.js';

export const meta = {
  title: 'Season Footer',
  element: 'Footer',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Sequential', 'Looping', 'Cyclic'],
  effect: ['Phase-change', 'Melting', 'Path-morphing', 'Rising'],
  purpose: ['Decoration', 'Branding', 'Delight'],
  properties: ['Path', 'Color', 'Opacity', 'Shape'],
  description: 'A footer that goes through the states of matter. As ice its top edge is jagged and glints; melt it and the edge softens into a rolling wave of water; heat it again and the band thins and drifts up as puffs of steam; one more click and it freezes back. The edge morphs point by point between states.',
  params: [
    { key: 'time', label: 'Change time', group: 'Motion', type: 'range', min: 0.4, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    { key: 'wave', label: 'Wave height', group: 'Shape', type: 'range', min: 1, max: 8, step: 0.5, unit: '', default: 4, live: true },
  ],
};

const STATES = [
  { name: 'Ice', next: 'Melt', fill: '#cfe6f0', ink: '#1d3b4a' },
  { name: 'Water', next: 'Boil', fill: '#3c6e8f', ink: '#fafaf7' },
  { name: 'Steam', next: 'Freeze', fill: '#d8dde0', ink: '#3e4448' },
];
const N = 24;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-ssn">
        <div class="sp-pn__page"><span class="sp-pn__kick">Almanac</span><b class="sp-pn__h">States of matter</b>${bars(3)}</div>
        <footer class="sp-ssn__foot">
          <svg class="sp-ssn__svg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path /></svg>
          <div class="sp-ssn__puffs" aria-hidden="true">${'<i></i>'.repeat(8)}</div>
          <div class="sp-ssn__row"><b class="sp-ssn__state" aria-live="polite">Ice</b><span>Studio · Almanac · © 2026</span>
          <button type="button" class="sp-pn__btn sp-ssn__btn">Melt</button></div>
        </footer>
      </div>`);
    const foot = k.$('.sp-ssn__foot');
    const path = k.$('.sp-ssn__svg path');
    const puffs = k.$$('.sp-ssn__puffs i');
    const btn = k.$('.sp-ssn__btn');
    const label = k.$('.sp-ssn__state');
    // Edge shapes per state, same number of points so they morph into each other:
    // ice = sharp zig-zag, water = a sine wave (its phase rolls), steam = a low, soft line.
    const s = k.track({ ice: 1, water: 0, steam: 0, phase: 0 });
    const draw = () => {
      const pts = Array.from({ length: N + 1 }, (_, i) => {
        const x = (i / N) * 100;
        const ice = 8 + (i % 2 ? 6 : 0) + ((i * 7) % 5);
        const water = 12 + Math.sin(i / 2.2 + s.phase) * p.wave;
        const steam = 30 + Math.sin(i / 1.3 + s.phase * 0.5) * 1.2;
        return `${x.toFixed(1)} ${(ice * s.ice + water * s.water + steam * s.steam).toFixed(2)}`;
      });
      path.setAttribute('d', `M0 40 L${pts.join(' L')} L100 40 Z`);
    };
    draw();
    let i = 0;
    let roll;
    let rise;

    const go = () => {
      i = (i + 1) % STATES.length;
      const st = STATES[i];
      const t = reducedMotion ? 0 : p.time;
      label.textContent = st.name;
      btn.textContent = st.next;
      gsap.to(s, { ice: +(i === 0), water: +(i === 1), steam: +(i === 2), duration: t, ease: 'power2.inOut', onUpdate: draw });
      gsap.to(foot, { '--fill': st.fill, color: st.ink, duration: t });
      // Water keeps rolling, steam keeps rising; each stops when its state ends.
      roll?.kill();
      rise?.kill();
      gsap.set(puffs, { autoAlpha: 0 });
      if (reducedMotion) return;
      if (i !== 0) roll = gsap.to(s, { phase: `+=${Math.PI * 2}`, duration: i === 1 ? 3 : 6, ease: 'none', repeat: -1, onUpdate: draw });
      if (i === 2) {
        rise = gsap.timeline({ repeat: -1 });
        puffs.forEach((pf, j) => rise.fromTo(pf, { y: 0, x: 0, scale: 0.4, autoAlpha: 0.8 }, { y: '-9em', x: `${(j % 2 ? 1 : -1) * 1.5}em`, scale: 1.6, autoAlpha: 0, duration: 2.4, ease: 'power1.out' }, j * 0.3));
      }
      if (i === 0) gsap.fromTo(foot, { '--glint': -20 }, { '--glint': 120, duration: 1, ease: 'power2.inOut', delay: t * 0.6 });
    };
    k.on(btn, 'click', go);

    return () => { roll?.kill(); rise?.kill(); k.destroy(); };
  },
};
