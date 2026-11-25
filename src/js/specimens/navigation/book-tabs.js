/** Book Tabs: Folder Tabs (paper-tabs) as a portrait book. Swipe, drag, click a tab or use arrows to turn pages. */
import { kit, esc, labelsOf, bars, clamp } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Book Tabs',
  element: 'Tabs',
  trigger: ['Swipe', 'Drag', 'Click', 'Keyboard'],
  behavior: ['Swipe-controlled', 'Reversible', 'Direction-aware', 'Sequential'],
  effect: ['Axial-rotation', 'Folding'],
  purpose: ['Navigation', 'Continuity', 'Storytelling'],
  properties: ['Rotation', 'Depth (z)', 'Order'],
  description: 'Tabs on a portrait book. Swipe left to turn the page, right to turn it back; clicking a tab leafs through every page in between.',
  params: [
    { key: 'labels', label: 'Tabs', group: 'Content', type: 'text', default: 'Intro, Maps, Notes, End' },
    { key: 'speed', label: 'Turn time', group: 'Motion', type: 'range', min: 0.3, max: 1.5, step: 0.05, unit: 's', default: 0.7, live: true },
    { key: 'swipe', label: 'Swipe distance', group: 'Behavior', type: 'range', min: 10, max: 60, step: 5, unit: '%', default: 25, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Cover color'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const labels = labelsOf(p.labels, ['Intro', 'Maps', 'Notes', 'End']).slice(0, 5);
    k.html(`
      <div class="sp sp-tabs sp-book" data-layout="Portrait">
        <div class="sp-tabs__list" role="tablist" aria-label="Book chapters">
          ${labels.map((l, i) => `<button role="tab" type="button" aria-selected="${!i}" tabindex="${i ? -1 : 0}">${esc(l)}</button>`).join('')}
        </div>
        <div class="sp-tabs__deck">
          ${labels.map((l, i) => `
            <section class="sp-tabs__sheet" role="tabpanel" aria-label="${esc(l)}" style="z-index:${labels.length - i}">
              <b>${esc(l)}</b><small>Page ${i + 1} of ${labels.length}</small>${bars(5)}
            </section>`).join('')}
        </div>
        <p class="sp-note">Swipe ← → or click a tab</p>
      </div>`);

    const tabs = k.$$('[role="tab"]');
    const pages = k.$$('.sp-tabs__sheet');
    const deck = k.$('.sp-tabs__deck');
    let at = 0;
    const dur = () => (reducedMotion ? 0 : Number(p.speed));

    // Turned pages lie at -180° (hidden by backface) and get out of the way.
    const turn = (page, done, d = dur(), delay = 0) =>
      gsap.to(page, {
        rotationY: done ? -180 : 0, duration: d, delay, ease: 'power2.inOut', overwrite: true,
        onStart: () => gsap.set(page, { visibility: 'visible' }),
        onComplete: () => done && gsap.set(page, { visibility: 'hidden' }),
      });

    const go = (i) => {
      i = clamp(i, 0, pages.length - 1);
      const step = Math.sign(i - at);
      // Leaf through every page in between, one after another.
      for (let j = at, n = 0; j !== i; j += step, n++) turn(pages[step > 0 ? j : j - 1], step > 0, dur(), n * dur() * 0.18);
      tabs[at].setAttribute('aria-selected', 'false');
      tabs[at].tabIndex = -1;
      tabs[i].setAttribute('aria-selected', 'true');
      tabs[i].tabIndex = 0;
      at = i;
    };

    tabs.forEach((t, i) => k.on(t, 'click', () => go(i)));
    k.on(k.$('[role="tablist"]'), 'keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      go(at + step);
      tabs[at].focus();
    });

    // Drag / swipe: the page follows the finger, then finishes or falls back.
    let x0 = null;
    let page = null;
    let fwd = true;
    k.on(deck, 'pointerdown', (e) => {
      x0 = e.clientX;
      page = null;
      deck.setPointerCapture(e.pointerId);
    });
    k.on(deck, 'pointermove', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      if (!page && Math.abs(dx) > 6) {
        fwd = dx < 0;
        page = fwd ? pages[at] : pages[at - 1];
        if (!page || (fwd && at === pages.length - 1)) return (x0 = null), (page = null);
        gsap.set(page, { visibility: 'visible' });
      }
      if (!page) return;
      const t = clamp(Math.abs(dx) / (deck.offsetWidth * 1.5), 0, 1); // soft: the page lifts, it doesn't snap edge-on
      gsap.set(page, { rotationY: fwd ? -180 * t : -180 * (1 - t) });
    });
    const release = (e) => {
      if (x0 === null) return;
      const far = Math.abs(e.clientX - x0) > (deck.offsetWidth * p.swipe) / 100;
      x0 = null;
      if (!page) return;
      if (far) go(at + (fwd ? 1 : -1));
      else turn(page, !fwd, dur() * 0.6);
      page = null;
    };
    k.on(deck, 'pointerup', release);
    k.on(deck, 'pointercancel', release);

    return () => k.destroy();
  },
};
