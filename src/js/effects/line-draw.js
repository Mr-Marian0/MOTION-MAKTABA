/**
 * EFFECT — line-draw
 * SVG strokes draw themselves like ink.
 *
 * Options
 *   mode: 'view'   draw once when scrolled into view (default)
 *         'scroll' scrub the drawing to scroll position
 *   redrawOnHover: true → hovering the host redraws it
 *   duration: seconds per stroke (view mode)
 *
 * Use anywhere:
 *   <svg data-effect="line-draw" data-effect-options='{"mode":"scroll"}' viewBox="…">
 *     <path d="…"/>
 *   </svg>
 */
export const demo = () => `
  <svg class="fx-line" viewBox="0 0 320 160" aria-hidden="true">
    <path d="M22 112 C 36 50, 66 42, 68 98 C 69 128, 92 62, 108 62 C 124 62, 114 118, 134 110 C 158 98, 150 52, 174 56 C 198 60, 180 118, 208 106 C 238 92, 228 44, 258 52 C 282 58, 270 108, 300 96"/>
    <path class="fx-line__accent" d="M30 136 C 110 126, 210 130, 296 120"/>
    <path class="fx-line__accent" d="M236 18 C 262 20, 284 30, 292 52 M280 44 L292 54 L298 40"/>
  </svg>`;

export default {
  name: 'line-draw',

  init(el, options, { gsap, reducedMotion }) {
    const paths = [...el.querySelectorAll('path, circle, ellipse, line, polyline')];
    if (reducedMotion || !paths.length) return;

    // Hide every stroke by offsetting its dash by its own length.
    const lengths = paths.map((p) => p.getTotalLength());
    paths.forEach((p, i) => {
      p.style.strokeDasharray = `${lengths[i]} ${lengths[i]}`;
      p.style.strokeDashoffset = lengths[i];
    });

    const duration = options.duration ?? 1.4;
    const cleanups = [];

    const draw = () =>
      gsap.fromTo(
        paths,
        { strokeDashoffset: (i) => lengths[i] },
        { strokeDashoffset: 0, duration, ease: 'power2.inOut', stagger: duration * 0.35, overwrite: true }
      );

    if (options.mode === 'scroll') {
      const tween = gsap.to(paths, {
        strokeDashoffset: 0,
        ease: 'none',
        stagger: 0.2,
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 35%', scrub: 0.6 },
      });
      cleanups.push(() => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    } else {
      const holder = gsap.to({}, { duration: 0, scrollTrigger: { trigger: el, start: 'top 82%', once: true, onEnter: draw } });
      cleanups.push(() => holder.scrollTrigger?.kill());
    }

    if (options.redrawOnHover) {
      const host = el.closest('[data-effect-host]') || el;
      host.addEventListener('pointerenter', draw);
      cleanups.push(() => host.removeEventListener('pointerenter', draw));
    }

    return () => {
      cleanups.forEach((fn) => fn());
      gsap.killTweensOf(paths);
    };
  },
};
