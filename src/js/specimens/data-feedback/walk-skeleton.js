/** Walk Skeleton: instead of a sweeping shimmer, a soft spotlight wanders over the loading skeleton on a random walk, brightening whichever placeholder it drifts across, until the content fades in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Walk Skeleton',
  element: 'Skeleton',
  trigger: ['Load', 'Idle', 'Click'],
  behavior: ['Randomized', 'Load-dependent', 'Continuous'],
  effect: ['Random-walk', 'Shimmering', 'Drifting'],
  purpose: ['Progress', 'Delight'],
  properties: ['Position', 'Opacity', 'Color'],
  description: 'A news-feed placeholder with a wandering glow. While the posts load, a soft circle of light drifts around the grey skeleton in a random walk: every half second or so it takes a small step in a random direction (bouncing back from the edges), so the highlight meanders over the blocks instead of sweeping in rigid lines. When the data arrives the real posts fade in through the skeleton. "Reload" starts over.',
  params: [
    { key: 'step', label: 'Step size', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: 'em', default: 2, live: true },
    { key: 'pace', label: 'Step time', group: 'Motion', type: 'range', min: 0.2, max: 1.5, step: 0.05, unit: 's', default: 0.5, live: true },
    { key: 'load', label: 'Load time', group: 'Behavior', type: 'range', min: 1, max: 8, step: 0.5, unit: 's', default: 3.5, live: true },
    tone('#c9a227', 'tone', '--sp-accent', 'Glow'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const post = (n, t) => `<article><i class="sp-wks__ava" style="background:${n}"></i><div><b>${t[0]}</b><small>${t[1]}</small></div></article>`;
    k.html(`
      <div class="sp sp-df sp-wks">
        <div class="sp-df__card sp-wks__card" aria-busy="true" aria-label="Feed">
          <div class="sp-wks__real">${post('#b3412e', ['Kiln opening Saturday', '24 new pieces out of the firing'])}${post('#2f4a6b', ['Glaze test results', 'Celadon finally behaved'])}</div>
          <div class="sp-wks__skel" aria-hidden="true"><i class="sp-wks__glow"></i>${'<article><i class="sp-wks__ava"></i><div><span class="sp-df__bone" style="width:70%"></span><span class="sp-df__bone" style="width:45%"></span></div></article>'.repeat(2)}</div>
        </div>
        <button type="button" class="sp-df__btn sp-df__btn--ghost">Reload</button>
      </div>`);
    const card = k.$('.sp-wks__card');
    const skel = k.$('.sp-wks__skel');
    const glow = k.$('.sp-wks__glow');
    let W = 200, H = 100, E = 14, walk, done;
    k.resize(skel, () => { W = skel.offsetWidth; H = skel.offsetHeight; E = parseFloat(getComputedStyle(skel).fontSize) || 14; });
    const pos = { x: 60, y: 30 };
    const stepOnce = () => {
      // a random direction; if it would leave the box, reflect it back in
      const a = Math.random() * Math.PI * 2, d = p.step * E;
      pos.x += Math.cos(a) * d; pos.y += Math.sin(a) * d;
      if (pos.x < 0 || pos.x > W) pos.x = Math.max(0, Math.min(W, pos.x < 0 ? -pos.x : 2 * W - pos.x));
      if (pos.y < 0 || pos.y > H) pos.y = Math.max(0, Math.min(H, pos.y < 0 ? -pos.y : 2 * H - pos.y));
      walk = gsap.to(glow, { x: pos.x, y: pos.y, duration: p.pace, ease: 'sine.inOut', onComplete: stepOnce });
    };
    const load = () => {
      walk?.kill(); done?.kill();
      card.setAttribute('aria-busy', 'true');
      gsap.set(skel, { autoAlpha: 1 });
      gsap.set(glow, { autoAlpha: reducedMotion ? 0 : 1, x: pos.x, y: pos.y });
      if (!reducedMotion) stepOnce();
      done = gsap.delayedCall(p.load, () => { walk?.kill(); card.setAttribute('aria-busy', 'false'); gsap.to(skel, { autoAlpha: 0, duration: reducedMotion ? 0 : 0.6 }); });
    };
    load();
    k.on(k.$('.sp-df__btn'), 'click', load);
    return () => { walk?.kill(); done?.kill(); k.destroy(); };
  },
};
