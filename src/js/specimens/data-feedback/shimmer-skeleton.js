/** Shimmer Skeleton: grey blocks shimmer in sync while loading, then crossfade into the real card piece by piece. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Shimmer to Content',
  element: 'Skeleton',
  trigger: ['Load', 'Click'],
  behavior: ['Load-dependent', 'Synchronized', 'Staggered', 'Looping'],
  effect: ['Shimmering', 'Sweeping', 'Dissolving'],
  purpose: ['Progress', 'Continuity'],
  properties: ['Opacity', 'Color'],
  description: 'A loading placeholder in the exact shape of the card to come. One shimmer sweeps across every block in sync. When the data "arrives", each block crossfades into its real content one after another. Reload to see it again.',
  params: [
    { key: 'wait', label: 'Load time', group: 'Behavior', type: 'range', min: 0.5, max: 5, step: 0.25, unit: 's', default: 2, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Photo color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-skel">
        <article class="sp-skel__card" aria-busy="true">
          <div class="sp-skel__slot sp-skel__slot--img"><i class="sp-skel__bone"></i><span class="sp-skel__real sp-skel__photo"></span></div>
          <div class="sp-skel__slot"><i class="sp-skel__bone"></i><b class="sp-skel__real">Bookbinding 101</b></div>
          <div class="sp-skel__slot"><i class="sp-skel__bone"></i><span class="sp-skel__real">Sew a pamphlet in ten minutes.</span></div>
          <div class="sp-skel__slot sp-skel__slot--short"><i class="sp-skel__bone"></i><small class="sp-skel__real">6 min read</small></div>
        </article>
        <button type="button" class="sp-skel__reload">↻ Reload</button>
      </div>`);
    const card = k.$('.sp-skel__card');
    const bones = k.$$('.sp-skel__bone');
    const reals = k.$$('.sp-skel__real');
    let timer;

    const load = () => {
      clearTimeout(timer);
      card.setAttribute('aria-busy', 'true');
      gsap.killTweensOf([...bones, ...reals]);
      gsap.set(bones, { opacity: 1 });
      gsap.set(reals, { opacity: 0, y: 6 });
      timer = setTimeout(() => {
        card.setAttribute('aria-busy', 'false');
        const t = reducedMotion ? 0 : 0.5;
        bones.forEach((b, i) => {
          gsap.to(b, { opacity: 0, duration: t, delay: i * 0.12 });
          gsap.to(reals[i], { opacity: 1, y: 0, duration: t, delay: i * 0.12 + 0.1, ease: 'power2.out' });
        });
      }, p.wait * 1000);
    };
    load();
    k.on(k.$('.sp-skel__reload'), 'click', load);

    return () => (clearTimeout(timer), k.destroy());
  },
};
