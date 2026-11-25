/**
 * SMOOTH SCROLL — Lenis, driven by GSAP's ticker so that Lenis and
 * ScrollTrigger always read the same scroll position on the same frame.
 */
import Lenis from 'lenis';

export function initSmoothScroll({ gsap, ScrollTrigger }) {
  const lenis = new Lenis({
    lerp: 0.09,          // lower = floatier
    wheelMultiplier: 0.9,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
