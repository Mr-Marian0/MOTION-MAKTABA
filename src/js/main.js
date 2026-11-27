/**
 * ENTRY — boot the shared core, then auto-mount whatever the page contains.
 * Nothing here is section-specific: new sections and effects plug in through
 * the registry (see core/registry.js).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { prefersReducedMotion, onMotionPrefChange } from './core/motion-prefs.js';
import { lite } from './core/device.js';
import { initSmoothScroll } from './core/smooth-scroll.js';
import { initPageTransitions } from './core/page-transition.js';
import { mountSections, mountEffects } from './core/registry.js';

gsap.registerPlugin(ScrollTrigger);

async function boot() {
  const reducedMotion = prefersReducedMotion();
  // Phones and low-power machines scroll natively (see core/device.js).
  const lenis = reducedMotion || lite ? null : initSmoothScroll({ gsap, ScrollTrigger });

  const ctx = { gsap, ScrollTrigger, lenis, reducedMotion, lite };

  // First, so an arriving page tears open right away.
  initPageTransitions(ctx);

  // Sections may render markup containing effects, so effects mount second.
  await mountSections(ctx);
  await mountEffects(ctx);
  ScrollTrigger.refresh();

  // Web fonts change text metrics; re-measure once they're ready.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());

  // If the OS motion setting changes mid-visit, rebuild cleanly.
  onMotionPrefChange(() => window.location.reload());
}

boot();
