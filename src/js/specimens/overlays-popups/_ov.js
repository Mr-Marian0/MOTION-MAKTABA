/**
 * Shared scaffolding for the Overlays & Popups designs: a mini page with an overlay on it and a
 * button that opens and closes it. Styles: _overlay.css.
 *
 *   k.html(scene('sp-x', `<div class="sp-ov__card sp-ov__modal">…</div>`, { label: 'Open' }));
 *   const ui = toggle(k, gsap, ctx, (open) => gsap.timeline()…, ['Open', 'Close']);
 */
import { bars } from '../_kit.js';

export const page = (title = 'Workspace', kick = 'Studio') =>
  `<div class="sp-ov__page"><span class="sp-ov__kick">${kick}</span><b class="sp-ov__h">${title}</b>${bars(6)}</div>`;

/** fn(true) on pointer enter or focus, fn(false) on leave or blur: tooltips show for mouse and keyboard alike. */
export const onHover = (k, el, fn) =>
  [['pointerenter', true], ['pointerleave', false], ['focus', true], ['blur', false]].forEach(([ev, on]) => k.on(el, ev, () => fn(on)));

/** The mini page, an optional dimming scrim, the overlay markup and the open button. */
export const scene = (cls, overlay, { title, kick, label = 'Open', scrim = true, at = 'corner', extra = '' } = {}) => `
  <div class="sp sp-ov ${cls}">
    ${page(title, kick)}
    ${extra}
    ${scrim ? '<i class="sp-ov__scrim"></i>' : ''}
    ${overlay}
    <button type="button" class="sp-ov__btn sp-ov__open sp-ov__open--${at}" aria-expanded="false">${label}</button>
  </div>`;

/**
 * Wire the open button. run(open) builds the open or close animation and returns its timeline.
 * A new click kills the running one; Esc and a click on the scrim close; reduced motion jumps to the end.
 * labels = [label while closed, label while open]. Returns { set(open), open }.
 */
export function toggle(k, gsap, { reducedMotion }, run, labels = ['Open', 'Close']) {
  const btn = k.$('.sp-ov__open');
  const scrim = k.$('.sp-ov__scrim');
  const ui = { open: false, set };
  let tl;
  function set(on) {
    ui.open = on;
    btn.setAttribute('aria-expanded', String(on));
    btn.textContent = labels[on ? 1 : 0];
    tl?.kill();
    if (scrim) gsap.to(scrim, { autoAlpha: on ? 1 : 0, duration: reducedMotion ? 0 : 0.35, overwrite: true });
    tl = run(on);
    if (reducedMotion) tl?.progress(1);
  }
  if (scrim) {
    gsap.set(scrim, { autoAlpha: 0 });
    k.on(scrim, 'click', () => ui.open && set(false));
  }
  k.on(btn, 'click', () => set(!ui.open));
  k.on(k.$('.sp-ov'), 'keydown', (e) => {
    if (e.key === 'Escape' && ui.open) e.stopPropagation(), set(false), btn.focus();
  });
  return ui;
}
