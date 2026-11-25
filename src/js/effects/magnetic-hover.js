/**
 * EFFECT — magnetic-hover
 * A target is pulled toward the cursor when it comes within `radius`.
 * Its inner label moves further than its body (depth), and optional
 * crosshair lines track the cursor like printer's registration marks.
 *
 * Use anywhere:
 *   <button data-effect="magnetic-hover" data-effect-options='{"strength":0.4,"radius":160}'>Hi</button>
 * Inside a demo: [data-magnet] = target, [data-magnet-inner] = label,
 * [data-magnet-x] / [data-magnet-y] = crosshair lines.
 */
export const demo = () => `
  <div class="fx-magnet">
    <span class="fx-magnet__ring" aria-hidden="true"></span>
    <span class="fx-magnet__x" data-magnet-x aria-hidden="true"></span>
    <span class="fx-magnet__y" data-magnet-y aria-hidden="true"></span>
    <span class="fx-magnet__btn" data-magnet><span data-magnet-inner>Pull</span></span>
  </div>`;

export default {
  name: 'magnetic-hover',

  init(el, options, { gsap, reducedMotion }) {
    const target = el.querySelector('[data-magnet]') || el;
    const inner = el.querySelector('[data-magnet-inner]');
    const lineX = el.querySelector('[data-magnet-x]');
    const lineY = el.querySelector('[data-magnet-y]');
    if (reducedMotion) return;

    const host = el.closest('[data-effect-host]') || el;
    const strength = options.strength ?? 0.45;
    const radius = options.radius ?? 180;

    const q = (node, prop, duration = 0.5) =>
      node ? gsap.quickTo(node, prop, { duration, ease: 'power3.out' }) : () => {};
    const tx = q(target, 'x');
    const ty = q(target, 'y');
    const ix = q(inner, 'x', 0.6);
    const iy = q(inner, 'y', 0.6);
    const ly = q(lineX, 'y', 0.2); // horizontal line moves vertically
    const lx = q(lineY, 'x', 0.2); // vertical line moves horizontally

    const move = (e) => {
      // Crosshair, in the coordinates of the lines' container.
      if (lineX && lineY) {
        const box = lineX.offsetParent.getBoundingClientRect();
        ly(e.clientY - box.top);
        lx(e.clientX - box.left);
        el.classList.add('is-tracking');
      }

      // Target's resting center (offsetLeft ignores transforms).
      const parent = target.offsetParent;
      if (!parent) return;
      const pb = parent.getBoundingClientRect();
      const cx = pb.left + target.offsetLeft + target.offsetWidth / 2;
      const cy = pb.top + target.offsetTop + target.offsetHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      if (Math.hypot(dx, dy) < radius) {
        tx(dx * strength);
        ty(dy * strength);
        ix(dx * strength * 0.5);
        iy(dy * strength * 0.5);
      } else {
        tx(0); ty(0); ix(0); iy(0);
      }
    };

    const leave = () => {
      tx(0); ty(0); ix(0); iy(0);
      el.classList.remove('is-tracking');
    };

    host.addEventListener('pointermove', move);
    host.addEventListener('pointerleave', leave);

    return () => {
      host.removeEventListener('pointermove', move);
      host.removeEventListener('pointerleave', leave);
      gsap.killTweensOf([target, inner, lineX, lineY].filter(Boolean));
    };
  },
};
