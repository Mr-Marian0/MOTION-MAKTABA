/**
 * EFFECT — scroll-reveal
 * Items drift in from alternating sides, align as the element crosses the
 * middle of the viewport, then drift apart again, all scrubbed to scroll.
 *
 * Use anywhere:
 *   <div data-effect="scroll-reveal" data-effect-options='{"spread":60}'>
 *     <span data-reveal-item>…</span> …   (falls back to direct children)
 *     <span data-reveal-readout></span>    (optional: prints progress %)
 *   </div>
 */
const WORDS = ['Pin', 'Scrub', 'Parallax', 'Stagger', 'Snap'];

export const demo = () => `
  <div class="fx-strips">
    ${WORDS.map(
      (w, i) =>
        `<span class="fx-strips__bar tear-edge--right tear-v${(i % 3) + 1}" data-reveal-item><i>0${i + 1}</i>${w}</span>`
    ).join('')}
    <span class="fx-strips__readout" data-reveal-readout>000</span>
  </div>`;

export default {
  name: 'scroll-reveal',

  init(el, options, { gsap, reducedMotion }) {
    const found = [...el.querySelectorAll('[data-reveal-item]')];
    const items = found.length ? found : [...el.children];
    const readout = el.querySelector('[data-reveal-readout]');
    if (reducedMotion || !items.length) return;

    const spread = options.spread ?? 70; // % of each item's width
    const side = (i) => (i % 2 ? 1 : -1);

    // One scrubbed timeline across the element's whole trip through the
    // viewport: 0–0.5 gather, 0.5–1 scatter.
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5,
        onUpdate: (self) => {
          if (readout) readout.textContent = String(Math.round(self.progress * 100)).padStart(3, '0');
        },
      },
    });

    tl.fromTo(
      items,
      { xPercent: (i) => side(i) * spread, rotation: (i) => side(i) * 4, opacity: 0.25 },
      { xPercent: 0, rotation: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
    ).to(items, {
      xPercent: (i) => -side(i) * spread * 0.45,
      rotation: (i) => -side(i) * 2,
      duration: 0.5,
      stagger: 0.05,
      ease: 'power2.in',
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  },
};
