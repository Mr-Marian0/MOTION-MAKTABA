/**
 * LAB SANDBOX — a per-design copy of gsap that remembers everything the design starts.
 *
 * The lab mounts a design when its card nears the screen and tears it down when it
 * leaves, so designs come and go all the time. A design's own cleanup doesn't always
 * reach every animation it made (a timeline started in a click handler, a delayedCall
 * scheduled from an onComplete…); left behind, those keep running on detached elements
 * and some reschedule themselves forever. Each design therefore gets its own gsap:
 * the same API, but every tween, timeline, delayedCall and ticker listener it creates is
 * recorded, and kill() stops them all. After kill(), anything the design still tries to
 * start is stopped on the spot, which also breaks self-rescheduling loops.
 *
 *   const box = sandbox(gsap);
 *   mod.mount(stage, params, { ...ctx, gsap: box.gsap });
 *   …later: box.kill();
 */
export function sandbox(gsap) {
  const made = new Set();
  const ticks = new Set();
  let dead = false;

  // Finished tweens are forgotten now and then, so a design that tweens on every
  // pointer move doesn't grow this list forever. Timelines are kept: they get replayed.
  const prune = () => made.forEach((a) => !a.getChildren && a.progress() === 1 && made.delete(a));
  const keep = (a) => {
    if (dead) a.kill();
    else if (made.add(a).size > 300) prune();
    return a;
  };

  const g = Object.create(gsap); // everything else (utils, getProperty, killTweensOf…) passes through
  ['to', 'from', 'fromTo', 'timeline', 'delayedCall'].forEach((m) => (g[m] = (...args) => keep(gsap[m](...args))));
  g.quickTo = (...args) => {
    const fn = gsap.quickTo(...args);
    keep(fn.tween);
    return fn;
  };
  g.ticker = Object.create(gsap.ticker);
  g.ticker.add = (fn, ...rest) => {
    if (!dead) ticks.add(fn), gsap.ticker.add(fn, ...rest);
    return fn;
  };
  g.ticker.remove = (fn) => (ticks.delete(fn), gsap.ticker.remove(fn));

  return {
    gsap: g,
    kill() {
      dead = true;
      made.forEach((a) => a.kill());
      made.clear();
      ticks.forEach((fn) => gsap.ticker.remove(fn));
      ticks.clear();
    },
  };
}
