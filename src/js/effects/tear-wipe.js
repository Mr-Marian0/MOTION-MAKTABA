/**
 * EFFECT — tear-wipe
 * A sheet of kraft with torn leading and trailing edges sweeps across,
 * swapping the page underneath as it passes. Loops while on screen and
 * pauses when it's out of view. Hovering the host speeds it up.
 *
 * Use anywhere:
 *   <div data-effect="tear-wipe" data-effect-options='{"pause":1.2}'>
 *     <div data-wipe-page>A</div> <div data-wipe-page>B</div>
 *     <div data-wipe-sheet>…</div>
 *   </div>
 */
export const demo = () => `
  <div class="fx-wipe">
    <div class="fx-wipe__page" data-wipe-page><span>01</span><small>Page</small></div>
    <div class="fx-wipe__page fx-wipe__page--alt" data-wipe-page><span>02</span><small>Page</small></div>
    <div class="fx-wipe__sheet" data-wipe-sheet>
      <div class="fx-wipe__edge tear-edge--left tear-v1">
        <div class="fx-wipe__paper paper-kraft tear-edge--right tear-v3"></div>
      </div>
    </div>
  </div>`;

export default {
  name: 'tear-wipe',

  init(el, options, { gsap, ScrollTrigger, reducedMotion }) {
    const pages = [...el.querySelectorAll('[data-wipe-page]')];
    const sheet = el.querySelector('[data-wipe-sheet]');
    if (!sheet || pages.length < 2) return;

    let current = 0;
    gsap.set(pages, { autoAlpha: (i) => (i === current ? 1 : 0) });
    gsap.set(sheet, { xPercent: 100 });
    if (reducedMotion) return;

    const swap = () => {
      current = (current + 1) % pages.length;
      gsap.set(pages, { autoAlpha: (i) => (i === current ? 1 : 0) });
    };

    // Sweep in → swap the page while covered → sweep out. Repeat.
    const tl = gsap
      .timeline({ repeat: -1, repeatDelay: options.pause ?? 1.1, paused: true })
      .fromTo(sheet, { xPercent: 100, rotation: 3 }, { xPercent: 0, rotation: 0, duration: 0.7, ease: 'power3.in' })
      .call(swap)
      .to(sheet, { xPercent: -100, rotation: -3, duration: 0.85, ease: 'power3.out' });

    // Only run while visible.
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
    });

    const host = el.closest('[data-effect-host]') || el;
    const fast = () => gsap.to(tl, { timeScale: 1.9, duration: 0.4 });
    const slow = () => gsap.to(tl, { timeScale: 1, duration: 0.6 });
    host.addEventListener('pointerenter', fast);
    host.addEventListener('pointerleave', slow);

    return () => {
      host.removeEventListener('pointerenter', fast);
      host.removeEventListener('pointerleave', slow);
      st.kill();
      tl.kill();
    };
  },
};
