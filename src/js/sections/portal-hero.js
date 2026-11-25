/**
 * SECTION 1 — PORTAL HERO
 *
 * The visitor scrolls through a 250vh runway while the stage stays pinned
 * (CSS sticky). One scrubbed GSAP timeline, normalized to a 0 → 1
 * duration, maps scroll progress to the "tearing open the cover" story:
 *
 *   0.00–0.10  strain   seam trembles, tape stretches
 *   0.08–0.14  snap     tape rips in two and falls away
 *   0.10–0.60  tear     kraft panels rip apart, carrying the wordmark
 *   0.10–0.80  reveal   archive image settles from 1.25× to 1×
 *   0.30–1.00  mood     duotone wash rises, veil deepens, meta turns white
 *   0.45–0.70  quote    a random quote + Explore rise into the center
 *   0.85–1.00  handoff  "Scroll to tear" becomes "Enter the library"
 */
import { tearLine, shiftLine, seamClipPaths } from '../components/tear-edge.js';

/** One is picked at random per visit: [quote, author]. */
const QUOTES = [
  ["AI won't replace humans, but humans who use AI will replace those who don't.", 'Sam Altman'],
  ["If you don't have an AI strategy, you're going to die in the world that's coming.", 'Devin Wenig'],
  ['No company is going to survive in the future without understanding AI.', 'David Gasparyan'],
  ['AI is about amplifying human potential, not replacing it.', 'Fei-Fei Li'],
  ['Artificial intelligence is the new electricity.', 'Andrew Ng'],
  ['The question of whether a computer can think is no more interesting than the question of whether a submarine can swim.', 'Edsger W. Dijkstra'],
];

export default {
  name: 'portal-hero',
  _gsapCtx: null,

  init(el, { gsap, reducedMotion, lenis }) {
    const q = (s) => el.querySelector(s);
    const qa = (s) => [...el.querySelectorAll(s)];

    // Random quote; Explore glides to section 2.
    const [text, by] = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    q('[data-hero="quote-text"]').textContent = `“${text}”`;
    q('[data-hero="quote-by"]').textContent = by;
    this._onExplore = (e) => {
      const target = document.querySelector('#catalog');
      if (!target) return;
      e.preventDefault();
      if (lenis && !reducedMotion) lenis.scrollTo(target, { duration: 1.6 });
      else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    };
    this._explore = q('[data-hero="explore"]');
    this._explore.addEventListener('click', this._onExplore);

    const panelL = q('[data-hero-panel="left"]');
    const panelR = q('[data-hero-panel="right"]');

    // ------------------------------------------------------------------
    // Cut the interlocking tear. A new seed per visit means every visitor
    // rips a slightly different cover.
    // ------------------------------------------------------------------
    const panelWidth = parseFloat(getComputedStyle(el).getPropertyValue('--panel-w')) || 54;
    const seed = Math.floor(Math.random() * 1e9);
    const seam = tearLine({ center: 50, amplitude: 2.2, jag: 0.65, steps: 56, seed });

    // Face = the kraft surface, cut exactly on the seam.
    const face = seamClipPaths(seam, panelWidth);
    panelL.querySelector('[data-hero="face"]').style.clipPath = face.left;
    panelR.querySelector('[data-hero="face"]').style.clipPath = face.right;

    // Core = the pale fiber layer, cut a little *past* the seam so a thin,
    // uneven strip shows along each torn edge once the halves separate.
    const coreL = seamClipPaths(shiftLine(seam, { direction: 1, seed: seed + 1 }), panelWidth).left;
    const coreR = seamClipPaths(shiftLine(seam, { direction: -1, seed: seed + 2 }), panelWidth).right;
    panelL.querySelector('[data-hero="core"]').style.clipPath = coreL;
    panelR.querySelector('[data-hero="core"]').style.clipPath = coreR;

    // Reduced motion: CSS already shows the hero open. Nothing to animate.
    if (reducedMotion) return;

    const bone = getComputedStyle(document.documentElement).getPropertyValue('--color-bone').trim() || '#fafaf7';

    this._gsapCtx = gsap.context(() => {
      const media = q('[data-hero="media"]');
      const duotone = q('[data-hero="duotone"]');
      const veil = q('[data-hero="veil"]');
      const cores = qa('[data-hero="core"]');
      const tape = q('[data-hero="tape"]');
      const tapeL = q('[data-hero="tape-l"]');
      const tapeR = q('[data-hero="tape-r"]');
      const kicker = q('[data-hero="kicker"]');
      const halfL = q('[data-hero-half="left"]');
      const halfR = q('[data-hero-half="right"]');
      const metas = qa('[data-hero="meta"]');
      const cueA = q('[data-hero="cue-a"]');
      const cueB = q('[data-hero="cue-b"]');

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom', // the full runway
          scrub: 0.6,           // a little lag = paper weight
          invalidateOnRefresh: true,
        },
      });

      // Lock the timeline length to exactly 1 so positions read as progress.
      tl.set({}, {}, 1);

      // -- 0.00–0.10 STRAIN ------------------------------------------------
      // Panels pull apart a few pixels and spring back, twice: the paper
      // resisting before it gives.
      tl.to(panelL, { x: -7, duration: 0.025, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);
      tl.to(panelR, { x: 7, duration: 0.025, ease: 'sine.inOut', yoyo: true, repeat: 3 }, 0);
      // Tape stretches thin across the seam.
      tl.to(tape, { scaleX: 1.1, scaleY: 0.9, duration: 0.08, ease: 'power2.in' }, 0);

      // -- 0.08–0.14 SNAP --------------------------------------------------
      // Swap the whole strip for two ripped halves, then flick them away.
      tl.set(tape, { autoAlpha: 0 }, 0.08);
      tl.set([tapeL, tapeR], { opacity: 1 }, 0.08);
      tl.to(tapeL, { x: -60, y: 240, rotation: -42, duration: 0.07, ease: 'power2.in' }, 0.08);
      tl.to(tapeR, { x: 70, y: 280, rotation: 48, duration: 0.07, ease: 'power2.in' }, 0.08);
      tl.to([tapeL, tapeR], { opacity: 0, duration: 0.02 }, 0.13);

      // -- 0.10–0.60 TEAR --------------------------------------------------
      // The fiber core appears the moment the halves part.
      tl.to(cores, { opacity: 1, duration: 0.02 }, 0.1);
      // Panels rip outward. Rotation + skew sell "ripping", not "sliding".
      tl.to(panelL, { xPercent: -100, rotation: -1.5, skewY: 0.6, duration: 0.5, ease: 'power3.inOut' }, 0.1);
      tl.to(panelR, { xPercent: 100, rotation: 1.5, skewY: -0.6, duration: 0.5, ease: 'power3.inOut' }, 0.1);
      // Wordmark halves ride with their panels (measured, so resize-safe).
      tl.to(halfL, { x: () => -panelL.offsetWidth, rotation: -2, duration: 0.5, ease: 'power3.inOut' }, 0.1);
      tl.to(halfR, { x: () => panelR.offsetWidth, rotation: 2, duration: 0.5, ease: 'power3.inOut' }, 0.1);
      // "MY" lifts off first, like a loose label.
      tl.to(kicker, { yPercent: -160, opacity: 0, duration: 0.14, ease: 'power2.in' }, 0.1);

      // -- 0.10–0.80 REVEAL ------------------------------------------------
      tl.fromTo(media, { scale: 1.25 }, { scale: 1, duration: 0.7, ease: 'power2.out' }, 0.1);

      // -- 0.30–1.00 MOOD --------------------------------------------------
      tl.to(duotone, { opacity: 0.65, duration: 0.5 }, 0.3);
      tl.to(veil, { opacity: 1, duration: 0.7 }, 0.3);
      // Meta flips ink → bone as it lands on the dark image.
      tl.to(metas, { color: bone, duration: 0.12 }, 0.3);

      // -- 0.45–0.70 QUOTE -------------------------------------------------
      // autoAlpha keeps the button unfocusable while the cover still hides it.
      tl.fromTo(q('[data-hero="quote"]'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.45);

      // -- 0.85–1.00 HANDOFF -----------------------------------------------
      tl.to(cueA, { opacity: 0, yPercent: -60, duration: 0.05 }, 0.85);
      tl.fromTo(cueB, { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.07 }, 0.88);
    }, el);
  },

  destroy() {
    this._explore?.removeEventListener('click', this._onExplore);
    this._gsapCtx?.revert();
    this._gsapCtx = null;
  },
};
