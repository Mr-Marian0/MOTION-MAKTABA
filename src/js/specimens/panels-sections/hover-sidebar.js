/** Hover Sidebar: a tool palette that hovers just off the page like a hovercraft, holding its height with small corrections over a soft shadow; point at it and it lifts higher, ready. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Hover Sidebar',
  element: 'Sidebar panel',
  trigger: ['Hover', 'Focus', 'Idle'],
  behavior: ['Floating', 'Hover-dependent', 'Self-correcting', 'Continuous'],
  effect: ['Hovering', 'Levitation', 'Vibrating'],
  purpose: ['Affordance', 'Hierarchy', 'Delight'],
  properties: ['Position', 'Shadow', 'Rotation'],
  description: 'A floating tool palette that hovers just above the page like a hovercraft. At rest it holds its height with small, quick corrections (a slight tilt, a tiny dip) over a soft shadow that breathes with it. Point at it and it lifts higher and steadies, ready for use; move away and it sinks back to a low hover.',
  params: [
    { key: 'lift', label: 'Hover height', group: 'Motion', type: 'range', min: 0.3, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    { key: 'jitter', label: 'Corrections', group: 'Motion', type: 'range', min: 0, max: 1, step: 0.1, unit: '', default: 0.5, live: true },
    tone('#3e2c1f', 'tone', '--sp-accent', 'Palette'),
  ],
};

const TOOLS = ['✎', '▭', '◯', 'T', '⌫'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-hvr">
        <div class="sp-pn__page sp-hvr__page"><span class="sp-pn__kick">Canvas</span><b class="sp-pn__h">Sketch 14</b>${bars(5)}</div>
        <i class="sp-hvr__shadow"></i>
        <nav class="sp-hvr__palette" aria-label="Tools">${TOOLS.map((t, i) => `<button type="button" class="sp-hvr__tool" aria-pressed="${!i}">${t}</button>`).join('')}</nav>
      </div>`);
    const pal = k.$('.sp-hvr__palette');
    const shadow = k.$('.sp-hvr__shadow');
    const tools = k.$$('.sp-hvr__tool');
    const em = () => parseFloat(getComputedStyle(pal).fontSize);
    let high = false;
    let idle;

    // Holding height: small, irregular corrections, never quite still.
    const hover = () => {
      idle?.kill();
      if (reducedMotion) return gsap.set(pal, { y: -p.lift * em() });
      const base = -(high ? p.lift * 2.2 : p.lift) * em();
      const j = high ? p.jitter * 0.3 : p.jitter;
      idle = gsap.timeline({ repeat: -1 });
      [0.3, -0.25, 0.15, -0.35, 0.2].forEach((d) => {
        idle.to(pal, { y: base + d * em() * j * 1.5, rotation: d * 2 * j, duration: 0.45 + Math.abs(d), ease: 'sine.inOut' })
          .to(shadow, { scaleX: 1 - (base / em()) * 0.08 + d * 0.05, autoAlpha: 0.9 + (base / em()) * 0.15, duration: 0.45 + Math.abs(d), ease: 'sine.inOut' }, '<');
      });
    };
    const lift = (on) => {
      high = on;
      gsap.to(pal, { y: -(on ? p.lift * 2.2 : p.lift) * em(), rotation: 0, duration: reducedMotion ? 0 : 0.5, ease: 'back.out(2)', onComplete: hover });
    };
    hover();
    k.on(pal, 'pointerenter', () => lift(true));
    k.on(pal, 'pointerleave', () => lift(false));
    k.on(pal, 'focusin', () => lift(true));
    k.on(pal, 'focusout', () => lift(false));
    tools.forEach((t) => k.on(t, 'click', () => tools.forEach((o) => o.setAttribute('aria-pressed', String(o === t)))));

    return { destroy: () => { idle?.kill(); k.destroy(); }, update: () => hover() };
  },
};
