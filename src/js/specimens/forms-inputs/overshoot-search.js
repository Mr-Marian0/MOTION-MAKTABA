/** Overshoot Search: the collapsed search button springs open into a full bar, shooting past its full width and snapping back; the suggestions then drop in, each overshooting its spot. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

const SUGGEST = ['Weekend in Porto', 'Cabins with a sauna', 'Dog-friendly stays'];

export const meta = {
  title: 'Overshoot Search',
  element: 'Search bar',
  trigger: ['Click', 'Keyboard', 'Focus'],
  behavior: ['Toggle-dependent', 'Elastic', 'Staggered'],
  effect: ['Overshoot-motion', 'Expansion', 'Springing'],
  purpose: ['Affordance', 'Delight', 'Continuity'],
  properties: ['Scale', 'Position', 'Opacity'],
  description: 'A travel search that starts as a round magnifier button. Press it and the bar springs out to the right, overshooting its full length and snapping back like a released spring, the input fading in as it lands. Below it three suggestions drop into place one after another, each one overshooting and settling. Esc or the ✕ springs it shut.',
  params: [
    { key: 'over', label: 'Overshoot', group: 'Motion', type: 'range', min: 1, max: 4, step: 0.1, unit: '', default: 2.2, live: true },
    { key: 'time', label: 'Spring time', group: 'Motion', type: 'range', min: 0.3, max: 1.4, step: 0.05, unit: 's', default: 0.7, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Bar'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('ovs');
    k.html(`
      <div class="sp sp-fi sp-ovs">
        <div class="sp-fi__wrap">
          <div class="sp-ovs__bar" role="search">
            <i class="sp-ovs__shell" aria-hidden="true"></i>
            <button type="button" class="sp-ovs__go" aria-label="Open search" aria-expanded="false" aria-controls="${id}">⌕</button>
            <input class="sp-fi__input sp-ovs__input" id="${id}" type="search" placeholder="Where to?" aria-label="Where to?" tabindex="-1" />
            <button type="button" class="sp-ovs__x" aria-label="Close search" tabindex="-1">✕</button>
          </div>
          <ul class="sp-ovs__list">${SUGGEST.map((s) => `<li><button type="button" class="sp-ovs__s" tabindex="-1">${esc(s)}</button></li>`).join('')}</ul>
        </div>
      </div>`);
    const shell = k.$('.sp-ovs__shell');
    const go = k.$('.sp-ovs__go');
    const input = k.$('.sp-ovs__input');
    const x = k.$('.sp-ovs__x');
    const items = k.$$('.sp-ovs__s');
    // The shell is the bar's background seen through a rounded window --v px wide: a circle (the button) when
    // shut, the full bar when open. It is 15% wider than the bar, so the window can overshoot past full length.
    let BW = 300, GW = 40, open = false, tl;
    const width = () => (open ? BW : GW);
    k.resize(k.$('.sp-ovs__bar'), () => {
      BW = k.$('.sp-ovs__bar').offsetWidth;
      GW = go.offsetWidth;
      if (!tl?.isActive()) gsap.set(shell, { '--v': `${width()}px` });
    });
    // Input and ✕ fade with opacity only (not autoAlpha): they must be focusable the moment the bar opens
    gsap.set([input, x], { opacity: 0 });
    gsap.set(items, { autoAlpha: 0 });
    const set = (on) => {
      open = on;
      go.setAttribute('aria-expanded', String(on));
      [input, x, ...items].forEach((el) => (el.tabIndex = on ? 0 : -1));
      tl?.kill();
      const t = p.time;
      tl = on
        ? gsap.timeline()
            .fromTo(shell, { '--v': `${GW}px` }, { '--v': `${BW}px`, duration: t, ease: `back.out(${p.over})` })
            .to([input, x], { opacity: 1, duration: 0.2 }, t * 0.4)
            .fromTo(items, { autoAlpha: 0, y: '-1.2em' }, { autoAlpha: 1, y: 0, duration: t * 0.8, ease: `back.out(${p.over * 1.2})`, stagger: 0.08 }, t * 0.5)
        : gsap.timeline()
            .to(items, { autoAlpha: 0, y: '-0.6em', duration: 0.15, stagger: { each: 0.04, from: 'end' } })
            .to([input, x], { opacity: 0, duration: 0.12 }, 0)
            .to(shell, { '--v': `${GW}px`, duration: t * 0.6, ease: 'back.in(1.6)' }, 0.1);
      if (reducedMotion) tl.progress(1);
      (on ? input : go).focus();
    };
    k.on(go, 'click', () => set(!open));
    k.on(x, 'click', () => set(false));
    k.on(k.$('.sp-ovs__bar'), 'keydown', (e) => e.key === 'Escape' && open && set(false));
    items.forEach((b) => k.on(b, 'click', () => { input.value = b.textContent; input.focus(); }));
    return () => k.destroy();
  },
};
