/**
 * PAGE TRANSITION — a paper-tear curtain between pages.
 *
 * Leaving:  two cream halves slide in from the edges and meet on a torn
 *           seam (the hero's tear, played in reverse), then we navigate.
 * Arriving: the next page starts closed and tears open.
 *
 * Opt in on any link with `data-transition` (optionally
 * `data-transition-label="MM-001 · Scroll Motion"` to print on the curtain).
 * A sessionStorage flag tells the next page to start closed; a tiny inline
 * script in each <head> adds `.is-arriving` before first paint so there is
 * no flash of the page before the curtain is built.
 */
import { tearLine, shiftLine, seamClipPaths } from '../components/tear-edge.js';

const KEY = 'mm:transition';
const PANEL_W = 54; // % of viewport, matches the hero

function cutSeam(curtain) {
  const seed = Math.floor(Math.random() * 1e9);
  const seam = tearLine({ center: 50, amplitude: 2.2, jag: 0.65, steps: 56, seed });
  const face = seamClipPaths(seam, PANEL_W);
  const coreL = seamClipPaths(shiftLine(seam, { direction: 1, seed: seed + 1 }), PANEL_W).left;
  const coreR = seamClipPaths(shiftLine(seam, { direction: -1, seed: seed + 2 }), PANEL_W).right;

  const [left, right] = curtain.querySelectorAll('.tear-curtain__panel');
  left.querySelector('.tear-curtain__face').style.clipPath = face.left;
  right.querySelector('.tear-curtain__face').style.clipPath = face.right;
  left.querySelector('.tear-curtain__core').style.clipPath = coreL;
  right.querySelector('.tear-curtain__core').style.clipPath = coreR;
}

function buildCurtain() {
  const curtain = document.createElement('div');
  curtain.className = 'tear-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = `
    <div class="tear-curtain__panel tear-curtain__panel--left">
      <div class="tear-curtain__core"></div>
      <div class="tear-curtain__face paper-cream"></div>
    </div>
    <div class="tear-curtain__panel tear-curtain__panel--right">
      <div class="tear-curtain__core"></div>
      <div class="tear-curtain__face paper-cream"></div>
    </div>
    <p class="tear-curtain__label folio" data-curtain-label></p>`;
  document.body.appendChild(curtain);
  cutSeam(curtain);
  return curtain;
}

export function initPageTransitions({ gsap, reducedMotion }) {
  const curtain = buildCurtain();
  const [left, right] = curtain.querySelectorAll('.tear-curtain__panel');
  const cores = curtain.querySelectorAll('.tear-curtain__core');
  const label = curtain.querySelector('[data-curtain-label]');

  const OPEN_L = { xPercent: -102, rotation: -1.5 };
  const OPEN_R = { xPercent: 102, rotation: 1.5 };
  const CLOSED = { xPercent: 0, rotation: 0 };

  const hide = () => gsap.set(curtain, { autoAlpha: 0 });
  const show = () => gsap.set(curtain, { autoAlpha: 1 });

  gsap.set(left, OPEN_L);
  gsap.set(right, OPEN_R);
  hide();

  /** Halves slide in and meet on the seam. */
  function close(text) {
    label.textContent = text;
    cutSeam(curtain);
    show();
    if (reducedMotion) {
      gsap.set([left, right], CLOSED);
      return gsap.fromTo(curtain, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }).then();
    }
    return gsap
      .timeline()
      .set(cores, { opacity: 1 })
      .set(label, { opacity: 0 })
      .to(left, { ...CLOSED, duration: 0.75, ease: 'power3.inOut' }, 0)
      .to(right, { ...CLOSED, duration: 0.75, ease: 'power3.inOut' }, 0.05)
      .set(cores, { opacity: 0 }) // seam shut: fibers hidden
      .fromTo(label, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, '-=0.3')
      .then();
  }

  /** Halves tear apart and leave. */
  function open() {
    if (reducedMotion) {
      gsap.set([left, right], { clearProps: 'all' });
      return gsap.to(curtain, { autoAlpha: 0, duration: 0.35 });
    }
    return gsap
      .timeline({ onComplete: hide })
      .to(label, { opacity: 0, y: -10, duration: 0.25, ease: 'power2.in' }, 0)
      .set(cores, { opacity: 1 }, 0.1)
      .to(left, { ...OPEN_L, duration: 0.95, ease: 'power3.inOut' }, 0.1)
      .to(right, { ...OPEN_R, duration: 0.95, ease: 'power3.inOut' }, 0.14);
  }

  // ---- Arriving from another page: start closed, tear open ----
  let arriving = null;
  try {
    arriving = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    /* storage blocked: no arrival animation */
  }
  if (arriving !== null) {
    gsap.set([left, right], CLOSED);
    label.textContent = arriving;
    show();
    document.documentElement.classList.remove('is-arriving');
    requestAnimationFrame(() => open());
  } else {
    document.documentElement.classList.remove('is-arriving');
  }

  // ---- Leaving: intercept opted-in links ----
  let busy = false;
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-transition]');
    if (!link || e.defaultPrevented || e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || link.target === '_blank') return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (url.pathname === window.location.pathname && url.hash) return; // in-page jump

    e.preventDefault();
    if (busy) return;
    busy = true;

    const text = link.dataset.transitionLabel || '';
    close(text).then(() => {
      try {
        sessionStorage.setItem(KEY, text);
      } catch {
        /* ignore */
      }
      window.location.href = url.href;
    });
  });

  // Back/forward cache restores the page mid-transition: reset it.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    busy = false;
    gsap.set(left, OPEN_L);
    gsap.set(right, OPEN_R);
    hide();
  });
}
