/** Drop Reveal: the words of a line fall into place from above, one after another, each landing with a little squash and bounce, as the text comes into view. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { words } from './_tm.js';

export const meta = {
  title: 'Drop Reveal',
  element: 'Text reveal',
  trigger: ['In view', 'Click'],
  behavior: ['Scroll-triggered', 'Staggered', 'Gravity-driven'],
  effect: ['Dropping', 'Squashing', 'Rebounding'],
  purpose: ['Storytelling', 'Delight', 'Hierarchy'],
  properties: ['Position', 'Scale'],
  description: 'A quote that is dropped into place word by word. When it comes into view each word falls from above the line, accelerating like a dropped object, lands on the baseline with a squash, bounces once and settles, the next word a beat behind. The key word is dropped last and heaviest. The replay button sends them back up.',
  params: [
    { key: 'text', label: 'Text', group: 'Content', type: 'text', default: 'Good things take a little longer.' },
    { key: 'height', label: 'Drop height', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Key word'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-drp">
        <p class="sp-drp__q" aria-label="${esc(p.text)}"><span aria-hidden="true">${words(p.text, 'sp-tm__w sp-drp__w')}</span></p>
        <button type="button" class="sp-tm__btn sp-tm__btn--ghost">Replay</button>
      </div>`);
    const ws = k.$$('.sp-drp__w');
    ws[ws.length - 1]?.classList.add('is-key');
    gsap.set(ws, { transformOrigin: '50% 100%' });
    let tl;
    const play = () => {
      tl?.kill();
      if (reducedMotion) return gsap.set(ws, { y: 0, opacity: 1, scaleY: 1 });
      tl = gsap.timeline();
      ws.forEach((w, i) => {
        const at = i * 0.12;
        tl.fromTo(w, { y: `-${p.height}em`, opacity: 0, scaleY: 1.15 }, { y: 0, opacity: 1, scaleY: 1, duration: 0.4, ease: 'power2.in' }, at)
          .to(w, { keyframes: { scaleY: [0.75, 1.08, 1], scaleX: [1.12, 0.97, 1], y: [0, '-0.25em', 0] }, duration: 0.4, ease: 'none' }, at + 0.4);
      });
    };
    gsap.set(ws, { opacity: 0 });
    k.inView(k.$('.sp-drp__q'), play);
    k.on(k.$('.sp-tm__btn'), 'click', play);
    return () => k.destroy();
  },
};
