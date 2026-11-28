/** Shimmer Note: ask for a suggested reply and the box shows shimmering placeholder lines, a band of light sweeping across them while the reply is being written, then the text types itself in. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

const REPLY = 'Thanks for sending the proofs. The colours look right; could we nudge the margins in by 2 mm before we print?';

export const meta = {
  title: 'Shimmer Note',
  element: 'Textarea',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential', 'Load-dependent'],
  effect: ['Shimmering', 'Scanning', 'Sweeping'],
  purpose: ['Progress', 'Feedback'],
  properties: ['Color', 'Opacity'],
  description: 'A reply box with a "Suggest a reply" helper. Press it and the box fills with placeholder lines of different lengths while a soft band of light sweeps over them again and again, the familiar shimmer of something loading. When the suggestion is ready the lines fade and the reply types itself into the box, ready to edit.',
  params: [
    { key: 'wait', label: 'Thinking time', group: 'Behavior', type: 'range', min: 0.5, max: 4, step: 0.1, unit: 's', default: 1.6, live: true },
    { key: 'sweep', label: 'Sweep time', group: 'Motion', type: 'range', min: 0.5, max: 2.5, step: 0.1, unit: 's', default: 1.1, live: true },
    tone('#5b3f8c', 'tone', '--sp-accent', 'Shimmer'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('shm');
    k.html(`
      <div class="sp sp-fi sp-shm">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Reply</label>
          <div class="sp-shm__box">
            <textarea class="sp-fi__area sp-shm__area" id="${id}" placeholder="Write a reply…"></textarea>
            <div class="sp-shm__skeleton" aria-hidden="true"><i style="width:92%"></i><i style="width:78%"></i><i style="width:85%"></i><i style="width:46%"></i></div>
          </div>
          <button type="button" class="sp-fi__btn sp-shm__go">✦ Suggest a reply</button>
          <small class="sp-fi__msg" aria-live="polite"></small>
        </div>
      </div>`);
    const area = k.$('textarea');
    const skel = k.$('.sp-shm__skeleton');
    const go = k.$('.sp-shm__go');
    const msg = k.$('.sp-fi__msg');
    gsap.set(skel, { autoAlpha: 0 });
    let sweep, tl;
    k.on(go, 'click', () => {
      tl?.kill(); sweep?.kill();
      go.disabled = true;
      area.value = '';
      msg.textContent = 'Writing a suggestion…';
      const finish = () => { go.disabled = false; msg.textContent = 'Suggestion ready. Edit it as you like.'; area.focus(); };
      if (reducedMotion) { area.value = REPLY; return finish(); }
      // The shimmer: a light band (a background position held in --x) swept across the lines on repeat
      sweep = gsap.fromTo(skel, { '--x': '-60%' }, { '--x': '160%', duration: p.sweep, ease: 'power1.inOut', repeat: -1 });
      const typed = { n: 0 };
      tl = gsap.timeline({ onComplete: () => { sweep.kill(); finish(); } })
        .to(skel, { autoAlpha: 1, duration: 0.2 })
        .to(skel, { autoAlpha: 0, duration: 0.25 }, `+=${p.wait}`)
        .to(typed, { n: REPLY.length, duration: REPLY.length * 0.018, ease: 'none', onUpdate: () => (area.value = REPLY.slice(0, Math.round(typed.n))) });
    });
    return () => { sweep?.kill(); k.destroy(); };
  },
};
