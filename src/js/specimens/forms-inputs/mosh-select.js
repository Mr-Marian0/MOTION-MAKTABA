/** Mosh Select: switching the theme datamoshes the preview: blocks of the old look hang on and smear across the new one, sliding and stuttering like a corrupted video, before they drop out and the new theme is clean. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, grid } from '../cards-containers/_pieces.js';
import { options, listKeys, pickOpt } from './_fi.js';

const THEMES = [['Dawn', '#f4dcb5', '#e6b083', '#b3412e'], ['Fjord', '#cfe0ea', '#6f97b3', '#2f4a6b'], ['Moss', '#dfe6cf', '#8ea36b', '#3e5a2f'], ['Neon', '#2a1f3d', '#7b3fbf', '#ff3d8b']];

export const meta = {
  title: 'Mosh Select',
  element: 'Select',
  trigger: ['Click', 'Keyboard'],
  behavior: ['State-dependent', 'Randomized', 'Direction-aware'],
  effect: ['Datamoshing', 'Motion-smear', 'Glitching'],
  purpose: ['Delight', 'Continuity', 'Branding'],
  properties: ['Clip & mask', 'Position', 'Opacity'],
  description: 'A theme picker with a live preview that changes like broken video. Choose a theme and the new look appears in the preview, but blocks of the old one cling on top: they slide in the direction of the change in jerky, dropped-frame steps, some stretching as they smear, and drop out one by one at random until only the new theme is left.',
  params: [
    { key: 'blocks', label: 'Blocks across', group: 'Shape', type: 'range', min: 4, max: 12, step: 1, unit: '', default: 7 },
    { key: 'smear', label: 'Smear', group: 'Motion', type: 'range', min: 0.5, max: 6, step: 0.5, unit: 'em', default: 2.5, live: true },
    { key: 'time', label: 'Time', group: 'Motion', type: 'range', min: 0.3, max: 1.6, step: 0.1, unit: 's', default: 0.8, live: true },
    tone('#111111', 'tone', '--sp-accent', 'Ink'),
  ],
};

const look = ([name, a, b, c]) => `<div class="sp-msh__look" style="--a:${a};--b:${b};--c:${c}"><i></i><i></i><i></i><b>${name}</b></div>`;

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('msh');
    const cols = Math.round(p.blocks);
    k.html(`
      <div class="sp sp-fi sp-msh">
        <div class="sp-fi__wrap">
          <div class="sp-msh__preview"><div class="sp-msh__now">${look(THEMES[0])}</div><div class="sp-cc__pieces"></div></div>
          <span class="sp-fi__label" id="${id}">Theme</span>
          <ul class="sp-fi__list sp-msh__list" role="listbox" aria-labelledby="${id}">${options(THEMES.map((t) => t[0]), 0)}</ul>
        </div>
      </div>`);
    const now = k.$('.sp-msh__now');
    const host = k.$('.sp-cc__pieces');
    const list = k.$('.sp-msh__list');
    let at = 0, mosh;
    listKeys(k, list, (li, i) => {
      pickOpt(list, li);
      if (i === at) return;
      const dir = i > at ? 1 : -1;
      const old = THEMES[at];
      at = i;
      now.innerHTML = look(THEMES[i]);
      mosh?.kill();
      if (reducedMotion) return (host.innerHTML = '');
      const bits = pieces(host, look(old), grid(cols, Math.max(2, Math.round(cols * 0.5))));
      mosh = gsap.timeline({ onComplete: () => (host.innerHTML = '') });
      bits.forEach(({ el, c: [cx, cy] }) => {
        const life = p.time * (0.25 + Math.random() * 0.75);
        gsap.set(el, { transformOrigin: `${cx}% ${cy}%` });
        mosh.to(el, { x: `${dir * p.smear * (0.3 + Math.random())}em`, scaleX: 1 + Math.random() * 0.7, duration: life, ease: `steps(${3 + Math.floor(Math.random() * 4)})` }, 0)
          .set(el, { autoAlpha: 0 }, life);
      });
    });
    return () => { mosh?.kill(); k.destroy(); };
  },
};
