/** Jelly Popover: the popover pops open like a jelly set down on a plate: it wobbles side to side and squishes, the wobbles dying away, and wobbles again when you poke it. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { scene, toggle } from './_ov.js';

export const meta = {
  title: 'Jelly Popover',
  element: 'Popover',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Toggle-dependent', 'Elastic', 'Reactive'],
  effect: ['Wobbling', 'Squashing', 'Damped-oscillation'],
  purpose: ['Delight', 'Feedback'],
  properties: ['Shape', 'Scale', 'Rotation'],
  description: 'A popover made of jelly. It pops up out of the button and wobbles like a jelly set down on a plate: its top sways side to side, leaning and squishing, each wobble smaller than the last until it stands still. Point at it and it wobbles again.',
  params: [
    { key: 'lean', label: 'Wobble', group: 'Motion', type: 'range', min: 2, max: 20, step: 1, unit: '°', default: 10, live: true },
    { key: 'damp', label: 'Settle', group: 'Motion', type: 'range', min: 0.1, max: 0.6, step: 0.05, unit: '', default: 0.22, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Jelly'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(scene('sp-jly2', `<div class="sp-ov__card sp-ov__pop sp-jly2__pop" role="dialog" aria-label="Reactions"><span class="sp-ov__kick">React</span><span class="sp-jly2__emo">${['♥', '★', '☺', '✿'].map((e) => `<i>${e}</i>`).join('')}</span></div>`, { label: 'React', scrim: false, at: 'bottom', title: 'Comment' }));
    const pop = k.$('.sp-jly2__pop');
    gsap.set(pop, { autoAlpha: 0, transformOrigin: '50% 100%' });
    // A jelly wobble: lean (skew) side to side about its base, squishing as it leans, dying away.
    const wobble = (amp) => gsap.timeline()
      .to(pop, { skewX: amp, scaleY: 0.92, scaleX: 1.05, duration: 0.12, ease: 'power2.out' })
      .to(pop, { skewX: 0, scaleY: 1, scaleX: 1, duration: 1.4, ease: `elastic.out(1, ${p.damp})` });
    k.on(pop, 'pointerenter', () => !reducedMotion && wobble(p.lean * 0.6));
    toggle(k, gsap, { reducedMotion }, (open) => open
      ? gsap.timeline().fromTo(pop, { autoAlpha: 1, scaleY: 0.2, scaleX: 0.6 }, { scaleY: 1.12, scaleX: 0.95, duration: 0.2, ease: 'power2.out' }).add(wobble(p.lean))
      : gsap.timeline().to(pop, { scaleY: 0.2, scaleX: 1.2, autoAlpha: 0, duration: 0.25, ease: 'power2.in' }),
    ['React', 'Close']);
    return () => k.destroy();
  },
};
