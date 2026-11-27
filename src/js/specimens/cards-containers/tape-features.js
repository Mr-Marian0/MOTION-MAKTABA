/** Tape Features: the plan's feature list is a measuring tape. Pull the tab to read it; let go and the tape whips back into its housing and the card recoils. */
import { kit, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Tape Features',
  element: 'Pricing card',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Self-collapsing', 'Elastic', 'Constrained', 'Temporary'],
  effect: ['Retracting', 'Extending', 'Recoiling'],
  purpose: ['Hierarchy', 'Delight', 'Affordance'],
  properties: ['Size', 'Position', 'Rotation'],
  description: 'A pricing card whose feature list is a measuring tape. Pull the tab down to read as much as you like; let go and the tape whips back into its housing, the tab clacks home and the card recoils. Clicking the tab runs the tape out, holds it a few seconds, then reels it in.',
  params: [
    { key: 'hold', label: 'Hold after click', group: 'Behavior', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3, live: true },
    { key: 'whip', label: 'Retract time', group: 'Motion', type: 'range', min: 0.15, max: 1, step: 0.05, unit: 's', default: 0.35, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Tape'),
  ],
};

const PERKS = ['Unlimited boards', '200 GB storage', 'Version history', 'Custom domains', 'Team spaces', 'Priority help'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-tape">
        <div class="sp-cc__wrap sp-tape__wrap">
          <article class="sp-cc__card sp-tape__card">
            <span class="sp-cc__kick">Pro plan</span>
            <div><b class="sp-cc__big">$18</b><span class="sp-cc__text"> / month</span></div>
            <span class="sp-cc__text">Everything a small studio needs.</span>
            <i class="sp-tape__housing"></i>
          </article>
          <div class="sp-tape__slot"><ol class="sp-tape__strip">${PERKS.map((t, i) => `<li><small>${i + 1}</small>${t}</li>`).join('')}</ol></div>
          <button type="button" class="sp-tape__tab" aria-expanded="false" aria-label="Pull out the feature list">Features</button>
        </div>
      </div>`);
    const wrap = k.$('.sp-tape__wrap');
    const card = k.$('.sp-tape__card');
    const slot = k.$('.sp-tape__slot');
    const strip = k.$('.sp-tape__strip');
    const tab = k.$('.sp-tape__tab');
    k.fit(wrap, 0.9);
    const em = () => parseFloat(getComputedStyle(slot).fontSize);
    const full = () => strip.offsetHeight / em();
    const s = k.track({ h: 0 });
    // Slot and tab hang from the card's foot; the wrap reserves the room the open tape needs,
    // so fitting to the stage doesn't zoom while it runs out.
    const foot = `${card.offsetHeight / em()}em`;
    slot.style.top = foot;
    tab.style.top = foot;
    wrap.style.paddingBottom = `${full() + 2}em`;
    const draw = () => {
      slot.style.height = `${s.h}em`;
      gsap.set(tab, { y: s.h * em() }); // px: an em here would resolve against the tab's smaller font
    };
    draw();
    let hold;

    const retract = () => {
      hold?.kill();
      tab.setAttribute('aria-expanded', 'false');
      if (reducedMotion) return (s.h = 0), draw();
      gsap.timeline()
        .to(s, { h: 0, duration: p.whip, ease: 'power4.in', onUpdate: draw })
        // The tab slams home and the whole card recoils
        .to(card, { keyframes: { y: ['-0.5em', '0.15em', 0], rotation: [-1.5, 1, 0] }, duration: 0.45, ease: 'power2.out' })
        .to(tab, { keyframes: { scaleY: [0.8, 1.1, 1] }, duration: 0.3 }, '<');
    };
    const extend = (to, dur) => gsap.to(s, { h: to, duration: reducedMotion ? 0 : dur, ease: 'power2.out', onUpdate: draw, overwrite: true });

    let drag = null;
    k.on(tab, 'pointerdown', (e) => {
      tab.setPointerCapture(e.pointerId);
      hold?.kill();
      gsap.killTweensOf(s);
      drag = { y: e.clientY, h: s.h, moved: false };
      dragged = false;
    });
    k.on(tab, 'pointermove', (e) => {
      if (!drag) return;
      const scale = wrap.getBoundingClientRect().height / wrap.offsetHeight || 1;
      const dy = (e.clientY - drag.y) / scale / em();
      if (Math.abs(dy) > 0.3) drag.moved = true;
      s.h = clamp(drag.h + dy, 0, full());
      tab.setAttribute('aria-expanded', String(s.h > 0));
      draw();
    });
    let dragged = false;
    const drop = () => {
      if (!drag) return;
      dragged = drag.moved;
      drag = null;
      if (dragged) retract();
    };
    k.on(tab, 'pointerup', drop);
    k.on(tab, 'pointercancel', drop);
    k.on(window, 'pointerup', drop); // ends the drag even if the release never reaches the element
    // A click (mouse, keyboard or assistive tech) that wasn't the end of a drag: run the tape out, hold it, reel it in.
    k.on(tab, 'click', () => {
      if (dragged) return (dragged = false);
      if (s.h > 0) return retract();
      tab.setAttribute('aria-expanded', 'true');
      extend(full(), 0.6);
      hold = gsap.delayedCall(p.hold + 0.6, retract);
    });

    return () => { hold?.kill(); k.destroy(); };
  },
};
