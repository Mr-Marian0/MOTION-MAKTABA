/** Wiggle Tip: a "New!" tooltip pinned to a fresh feature gives a quick wiggle every few seconds to catch the eye, and stops for good once you have hovered it. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { page, onHover } from './_ov.js';

export const meta = {
  title: 'Wiggle Tip',
  element: 'Tooltip',
  trigger: ['Idle', 'Hover', 'Focus'],
  behavior: ['Intermittent', 'Conditional', 'Hover-dependent', 'Persistent'],
  effect: ['Wiggle', 'Swaying', 'Expansion'],
  purpose: ['Affordance', 'Focus', 'Hierarchy'],
  properties: ['Rotation', 'Scale'],
  description: 'A "New!" tooltip pinned beside a freshly launched button. Every few seconds it gives a quick wiggle (a few fast tilts either way about its tail) to catch the eye. Hover or focus the button and the tip opens out into a short explanation; after that it stays calm for good.',
  params: [
    { key: 'every', label: 'Wiggle every', group: 'Behavior', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3, live: true },
    { key: 'angle', label: 'Wiggle', group: 'Motion', type: 'range', min: 4, max: 25, step: 1, unit: '°', default: 12, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Badge'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('wgl');
    k.html(`
      <div class="sp sp-ov sp-wgl">
        ${page('Toolbar', 'Editor')}
        <button type="button" class="sp-ov__btn sp-wgl__btn" aria-describedby="${id}">Auto-layout</button>
        <span class="sp-ov__tip sp-wgl__tip" id="${id}" role="tooltip"><b class="sp-wgl__new">New!</b><span class="sp-wgl__more">Tidies sketches into a grid.</span></span>
      </div>`);
    const tip = k.$('.sp-wgl__tip');
    const more = k.$('.sp-wgl__more');
    gsap.set(more, { width: 0, autoAlpha: 0 });
    let seen = false;
    let loop;
    const start = () => {
      loop?.kill();
      if (reducedMotion || seen) return;
      const a = p.angle;
      loop = gsap.timeline({ repeat: -1, repeatDelay: p.every, delay: 1 })
        .to(tip, { keyframes: { rotation: [a, -a, a * 0.7, -a * 0.5, 0], scale: [1.08, 1.08, 1.04, 1.02, 1] }, duration: 0.6, ease: 'none' });
    };
    start();
    onHover(k, k.$('.sp-wgl__btn'), (on) => {
      if (on) seen = true, loop?.kill(), gsap.set(tip, { rotation: 0, scale: 1 });
      gsap.to(more, { width: on ? 'auto' : 0, autoAlpha: on ? 1 : 0, marginLeft: on ? '0.5em' : 0, duration: reducedMotion ? 0 : 0.35, ease: 'power2.out' });
    });
    return { destroy: () => { loop?.kill(); k.destroy(); }, update: start };
  },
};
