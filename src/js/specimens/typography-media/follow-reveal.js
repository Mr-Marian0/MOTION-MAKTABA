/** Follow Reveal: each line slides in and stops sharply, but its letters do not all stop at once: they carry on a little past their places, the last letters furthest, and settle back a beat later. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { letters } from './_tm.js';

export const meta = {
  title: 'Follow Reveal',
  element: 'Text reveal',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Staggered', 'Hierarchical'],
  effect: ['Follow-through', 'Overshoot-motion', 'Sliding'],
  purpose: ['Storytelling', 'Hierarchy', 'Delight'],
  properties: ['Position', 'Rotation'],
  description: 'A two-line heading that arrives like a train braking. Each line slides in from the left and its front stops dead, but the letters behind keep travelling a little: they bunch up past their places, the ones at the back carrying furthest and leaning forward, then ease back into even spacing a moment later. The second line follows the first. Click to replay.',
  params: [
    { key: 'text', label: 'Lines (separate with /)', group: 'Content', type: 'text', default: 'Arriving / on platform 4' },
    { key: 'carry', label: 'Carry-on', group: 'Motion', type: 'range', min: 0.1, max: 1, step: 0.05, unit: 'em', default: 0.45, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Second line'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const lines = String(p.text).split('/').map((s) => s.trim()).filter(Boolean);
    k.html(`
      <div class="sp sp-tm sp-fol2">
        <h4 class="sp-tm__h sp-fol2__h" tabindex="0" aria-label="${esc(lines.join(' '))}">${lines.map((l) => `<span class="sp-fol2__line">${letters(l, 'sp-tm__c sp-fol2__c')}</span>`).join('')}</h4>
        <p class="sp-note">Click to replay</p>
      </div>`);
    const h = k.$('.sp-fol2__h');
    const ls = k.$$('.sp-fol2__line');
    let tl;
    const play = () => {
      tl?.kill();
      if (reducedMotion) return gsap.set(k.$$('.sp-fol2__c'), { x: 0, rotation: 0, opacity: 1 });
      tl = gsap.timeline();
      ls.forEach((line, li) => {
        const cs = [...line.children];
        const n = cs.length;
        const at = li * 0.45;
        // the line arrives as one (fast, hard stop) ...
        tl.fromTo(cs, { x: '-6em', opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'expo.out' }, at);
        // ... then the letters carry on: the further back in the line, the further past and the later they settle
        cs.forEach((c, i) => {
          const back = 1 - i / Math.max(1, n - 1);
          tl.to(c, { x: `${p.carry * back}em`, rotation: 8 * back, duration: 0.12, ease: 'power1.out' }, at + 0.3)
            .to(c, { x: 0, rotation: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' }, at + 0.42 + back * 0.12);
        });
      });
    };
    gsap.set(k.$$('.sp-fol2__c'), { opacity: 0, transformOrigin: '50% 100%' });
    k.inView(h, play);
    k.on(h, 'click', play);
    k.on(h, 'keydown', (e) => e.key === 'Enter' && play());
    return () => k.destroy();
  },
};
