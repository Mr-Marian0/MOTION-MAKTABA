/** Pixel Toast: the toast builds itself out of pixels that blink in at random, and when it goes it dissolves the same way, pixel by pixel, like an old screen fade. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Pixel Toast',
  element: 'Toast',
  trigger: ['Click', 'Keyboard', 'Idle', 'Hover'],
  behavior: ['Event-driven', 'Randomized', 'Temporary', 'Pausable'],
  effect: ['Pixel-dissolving', 'Shape-assembly'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Clip & mask', 'Opacity'],
  description: 'A toast with a retro screen dissolve. It appears as a scatter of square pixels blinking on in random order until the message is whole, and leaves the same way, pixel by pixel, in a fresh random order. It dismisses itself after a few seconds; hovering or focusing it holds it in place.',
  params: [
    { key: 'pixel', label: 'Pixel size', group: 'Shape', type: 'range', min: 0.5, max: 1.5, step: 0.25, unit: 'em', default: 0.75 },
    { key: 'time', label: 'Dissolve time', group: 'Motion', type: 'range', min: 0.2, max: 1.6, step: 0.1, unit: 's', default: 0.6, live: true },
    { key: 'life', label: 'Auto-dismiss after', group: 'Behavior', type: 'range', min: 0, max: 8, step: 0.5, unit: 's', default: 3, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const toast = '<div class="sp-ov__toast sp-pxt__toast"><i></i><span>Saved to your library</span></div>';
    k.html(scene('sp-pxt', `<div class="sp-pxt__hold" role="status" tabindex="-1">${toast}<div class="sp-cc__pieces"></div></div>`, { label: 'Save', scrim: false, title: 'Library' }));
    const hold = k.$('.sp-pxt__hold');
    const real = k.$('.sp-pxt__hold > .sp-pxt__toast');
    const host = k.$('.sp-cc__pieces');
    // The hold is 16em × 3em: square pixels of the chosen size
    const [cols, rows] = [Math.round(16 / p.pixel), Math.max(2, Math.round(3 / p.pixel))];
    gsap.set(hold, { autoAlpha: 0 });
    let timer, held = false;
    const arm = () => { timer?.kill(); if (p.life && !held) timer = gsap.delayedCall(p.life, () => ui.open && ui.set(false)); };
    // Each pixel is one cell of a copy of the toast, switched on or off at a random moment (no fades: pixels are on or off)
    const blink = (on) => {
      const px = pieces(host, toast, grid(cols, rows)).map((b) => b.el);
      gsap.set(px, { autoAlpha: on ? 0 : 1 });
      return gsap.timeline({ onComplete: () => (host.innerHTML = '') })
        .set(real, { autoAlpha: 0 })
        .to(px, { autoAlpha: on ? 1 : 0, duration: 0.001, stagger: { amount: p.time, from: 'random' } })
        .set(real, { autoAlpha: on ? 1 : 0 });
    };
    const ui = toggle(k, gsap, { reducedMotion }, (open) => {
      timer?.kill();
      if (open) arm();
      if (reducedMotion) return gsap.timeline().set(hold, { autoAlpha: open ? 1 : 0 }).set(real, { autoAlpha: 1 });
      if (open) gsap.set(hold, { autoAlpha: 1 });
      const tl = blink(open);
      if (!open) tl.set(hold, { autoAlpha: 0 });
      return tl;
    }, ['Save', 'Dismiss']);
    // Extra: hover or focus holds the toast; leaving restarts the countdown
    const hold_ = (on) => { held = on; if (on) timer?.kill(); else if (ui.open) arm(); };
    k.on(hold, 'pointerenter', () => hold_(true));
    k.on(hold, 'pointerleave', () => hold_(false));
    k.on(hold, 'focusin', () => hold_(true));
    k.on(hold, 'focusout', () => hold_(false));
    return () => { timer?.kill(); k.destroy(); };
  },
};
