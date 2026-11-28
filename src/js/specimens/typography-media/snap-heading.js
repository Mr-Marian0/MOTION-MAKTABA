/** Snap Heading: each word of the headline is held on a stretched elastic: hover a word and it is pulled out of line toward the pointer; let go and it snaps back with a crack and a quick shiver. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';
import { words } from './_tm.js';

export const meta = {
  title: 'Snap Heading',
  element: 'Heading',
  trigger: ['Hover', 'Cursor move', 'Click'],
  behavior: ['Cursor-following', 'Elastic', 'Hover-dependent'],
  effect: ['Snapping', 'Stretching', 'Vibrating'],
  purpose: ['Delight', 'Branding'],
  properties: ['Position', 'Scale', 'Rotation'],
  description: 'A three-word headline in which every word is on a rubber band. Move the pointer over a word and it is drawn out of the line toward the pointer, stretching a little in that direction the further it goes. Move off (or click) and it snaps back into place hard, overshooting and shivering for a moment before it is still.',
  params: [
    { key: 'text', label: 'Headline', group: 'Content', type: 'text', default: 'Pull. Stretch. Snap.' },
    { key: 'pull', label: 'Pull', group: 'Motion', type: 'range', min: 0.1, max: 0.8, step: 0.05, unit: '', default: 0.4, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Pulled word'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-snp">
        <h4 class="sp-tm__h sp-snp__h" aria-label="${esc(p.text)}"><span aria-hidden="true">${words(p.text, 'sp-tm__w sp-snp__w')}</span></h4>
        <p class="sp-note">Drag the pointer across a word</p>
      </div>`);
    const ws = k.$$('.sp-snp__w');
    ws.forEach((w) => {
      let box = null;
      const snap = () => {
        box = null;
        w.classList.remove('is-pulled');
        if (reducedMotion) return;
        gsap.to(w, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1.4, 0.18)', overwrite: true });
      };
      k.on(w, 'pointerenter', () => { box = w.getBoundingClientRect(); w.classList.add('is-pulled'); });
      k.on(w, 'pointermove', (e) => {
        if (!box || reducedMotion) return;
        const dx = (e.clientX - (box.left + box.width / 2)) * p.pull;
        const dy = (e.clientY - (box.top + box.height / 2)) * p.pull;
        gsap.to(w, { x: dx, y: dy, scaleX: 1 + Math.abs(dx) / 200, scaleY: 1 + Math.abs(dy) / 200, rotation: dx * 0.05, duration: 0.2, ease: 'power2.out', overwrite: true });
      });
      k.on(w, 'pointerleave', snap);
      k.on(w, 'click', snap);
    });
    return () => k.destroy();
  },
};
