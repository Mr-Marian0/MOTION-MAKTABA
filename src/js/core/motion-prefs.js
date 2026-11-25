/**
 * MOTION PREFERENCES — one place to ask "should things move?".
 */
const query = window.matchMedia('(prefers-reduced-motion: reduce)');

export const prefersReducedMotion = () => query.matches;

/** Call `callback(isReduced)` whenever the OS setting changes. */
export function onMotionPrefChange(callback) {
  const handler = (e) => callback(e.matches);
  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}
