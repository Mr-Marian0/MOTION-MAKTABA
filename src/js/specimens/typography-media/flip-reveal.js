/** Flip Reveal: the letters tumble into the word like gymnasts: each one jumps up, somersaults a full turn in the air and lands on its feet in place, one after another along the line. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { letters } from './_tm.js';

export const meta = {
  title: 'Flip Reveal',
  element: 'Text reveal',
  trigger: ['In view', 'Click', 'Hover'],
  behavior: ['Scroll-triggered', 'Staggered', 'Sequential'],
  effect: ['Somersaulting', 'Jumping', 'Squashing'],
  purpose: ['Delight', 'Storytelling', 'Branding'],
  properties: ['Rotation', 'Position', 'Scale'],
  description: 'A word that arrives with a tumbling routine. As it comes into view the letters appear one by one: each springs up from below the line, turns a full forward somersault in mid-air, and lands upright in its place with a small squash, the next letter already in the air. Hover a single letter and it does one flip on its own. Click to replay the whole routine.',
  params: [
    { key: 'text', label: 'Word', group: 'Content', type: 'text', default: 'Acrobatic' },
    { key: 'jump', label: 'Jump', group: 'Motion', type: 'range', min: 0.5, max: 3, step: 0.1, unit: 'em', default: 1.4, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Ink'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-flp">
        <h4 class="sp-tm__h sp-flp__h" tabindex="0" aria-label="${esc(p.text)}">${letters(p.text, 'sp-tm__c sp-flp__c')}</h4>
        <p class="sp-note">Click to replay · hover a letter</p>
      </div>`);
    const h = k.$('.sp-flp__h');
    const cs = k.$$('.sp-flp__c');
    gsap.set(cs, { transformOrigin: '50% 60%' });
    const flip = (c, at = 0, tl = gsap.timeline()) => tl
      .fromTo(c, { y: 0, rotation: 0, scaleY: 1 }, { keyframes: [
        { y: `-${p.jump}em`, rotation: 180, duration: 0.25, ease: 'power2.out' },
        { y: 0, rotation: 360, duration: 0.25, ease: 'power2.in' },
        { scaleY: 0.78, scaleX: 1.15, duration: 0.06 },
        { scaleY: 1, scaleX: 1, duration: 0.25, ease: 'back.out(3)' },
      ] }, at)
      .set(c, { rotation: 0 });
    let tl;
    const play = () => {
      tl?.kill();
      if (reducedMotion) return gsap.set(cs, { opacity: 1, y: 0, rotation: 0 });
      tl = gsap.timeline();
      cs.forEach((c, i) => { tl.set(c, { opacity: 1 }, i * 0.08); flip(c, i * 0.08, tl); });
    };
    gsap.set(cs, { opacity: 0 });
    k.inView(h, play);
    k.on(h, 'click', play);
    k.on(h, 'keydown', (e) => e.key === 'Enter' && play());
    cs.forEach((c) => k.on(c, 'pointerenter', () => !reducedMotion && !tl?.isActive() && !gsap.isTweening(c) && flip(c)));
    return () => k.destroy();
  },
};
