/** Helix Reveal: the letters of a word start wound round an invisible spiral, turning in 3D like a strand of DNA; the helix unwinds as it slows, and the letters settle side by side into the flat word. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { letters } from './_tm.js';

export const meta = {
  title: 'Helix Reveal',
  element: 'Text reveal',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Sequential', 'Reversible'],
  effect: ['Helical-motion', 'Spiraling', 'Revolving'],
  purpose: ['Storytelling', 'Delight', 'Branding'],
  properties: ['Position', 'Rotation', 'Opacity', 'Scale'],
  description: 'A word that unwinds out of a helix. When it comes into view the letters are strung on a spinning spiral: each one circles the vertical axis, near letters large and dark, far ones small and faint, the whole strand turning. As it slows the spiral relaxes, the radius shrinking to nothing, and the letters slide into a straight line as the finished word. Click to wind it up and play again.',
  params: [
    { key: 'text', label: 'Word', group: 'Content', type: 'text', default: 'Genome' },
    { key: 'turns', label: 'Turns', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: '', default: 2, live: true },
    { key: 'time', label: 'Unwind time', group: 'Motion', type: 'range', min: 0.8, max: 4, step: 0.1, unit: 's', default: 2, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Strand'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-hlr">
        <h4 class="sp-tm__h sp-hlr__h" tabindex="0" aria-label="${esc(p.text)}">${letters(p.text, 'sp-tm__c sp-hlr__c')}</h4>
        <p class="sp-note">Click to wind it up again</p>
      </div>`);
    const h = k.$('.sp-hlr__h');
    const cs = k.$$('.sp-hlr__c');
    const n = cs.length;
    // Letter i sits on a helix around the word's centre: angle a_i = phase + i·step, radius R (in em), height along y
    const s = k.track({ ph: 0, R: 0, wind: 0 });
    let offs = [], E = 30;
    k.resize(h, () => { E = parseFloat(getComputedStyle(h).fontSize) || 30; const mid = h.offsetWidth / 2; offs = cs.map((c) => c.offsetLeft + c.offsetWidth / 2 - mid); });
    const draw = () => cs.forEach((c, i) => {
      const a = s.ph + (i / n) * Math.PI * 2 * s.wind;
      const z = Math.cos(a);
      const x = -offs[i] * s.wind + Math.sin(a) * s.R * E;
      gsap.set(c, { x, y: ((i / (n - 1 || 1)) - 0.5) * s.wind * 1.4 * E, scale: 1 + z * 0.25 * s.wind, opacity: 0.35 + 0.65 * ((z + 1) / 2) * s.wind + (1 - s.wind) * 0.65, zIndex: Math.round(z * 10) + 10 });
    });
    let tl;
    const play = () => {
      tl?.kill();
      if (reducedMotion) { Object.assign(s, { R: 0, wind: 0 }); return draw(); }
      tl = gsap.timeline({ onUpdate: draw })
        .set(s, { ph: 0, R: 1.6, wind: 1 })
        .to(s, { ph: Math.PI * 2 * p.turns, duration: p.time, ease: 'power2.out' }, 0)
        .to(s, { R: 0, wind: 0, duration: p.time * 0.75, ease: 'power2.inOut' }, p.time * 0.3);
    };
    gsap.set(cs, { opacity: 0 });
    k.inView(h, play);
    k.on(h, 'click', play);
    k.on(h, 'keydown', (e) => e.key === 'Enter' && play());
    return () => k.destroy();
  },
};
