/**
 * EFFECT — letter-scatter
 * Text is split into letters. They assemble when scrolled into view,
 * scatter like loose type when the host is hovered, and spring back into
 * place on leave.
 *
 * Use anywhere:
 *   <p data-effect="letter-scatter" data-effect-options='{"range":1.2}'>Hello</p>
 * The "host" (what listens for hover) is the closest [data-effect-host],
 * else the element itself.
 */
export const demo = () => `<p class="fx-scatter" data-scatter-text>Maktaba</p>`;

export default {
  name: 'letter-scatter',

  init(el, options, { gsap, reducedMotion }) {
    const target = el.querySelector('[data-scatter-text]') || el;
    const text = target.textContent.trim();

    // Split into letters, keeping the word readable for screen readers.
    target.setAttribute('aria-label', text);
    target.innerHTML = [...text]
      .map((c) => `<span class="fx-scatter__char" aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`)
      .join('');
    const chars = [...target.children];
    if (reducedMotion) return;

    const host = el.closest('[data-effect-host]') || el;
    const range = options.range ?? 1;
    const r = gsap.utils.random;

    // Entrance: letters fall into place the first time they're seen.
    const intro = gsap.from(chars, {
      x: () => r(-120, 120) * range,
      y: () => r(-70, 70) * range,
      rotation: () => r(-90, 90),
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: { each: 0.03, from: 'random' },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });

    const scatter = () =>
      gsap.to(chars, {
        x: () => r(-80, 80) * range,
        y: () => r(-45, 45) * range,
        rotation: () => r(-70, 70),
        scale: () => r(0.75, 1.3),
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: { each: 0.02, from: 'random' },
        overwrite: true,
      });

    const gather = () =>
      gsap.to(chars, {
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: 'elastic.out(1, 0.55)',
        stagger: { each: 0.025, from: 'center' },
        overwrite: true,
      });

    host.addEventListener('pointerenter', scatter);
    host.addEventListener('pointerleave', gather);

    return () => {
      host.removeEventListener('pointerenter', scatter);
      host.removeEventListener('pointerleave', gather);
      intro.scrollTrigger?.kill();
      gsap.killTweensOf(chars);
    };
  },
};
