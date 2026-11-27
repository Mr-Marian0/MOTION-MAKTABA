/** Goo Merge: two cards behave like metaballs: brought close, a gooey bridge forms and they melt into one; pulled apart, they stretch, snap and leave a drip. */
import { kit, uid, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Goo Merge',
  element: 'Card stack',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Proximity-aware', 'Snapping', 'Reversible', 'Toggle-dependent'],
  effect: ['Metaball-morphing', 'Merging', 'Splitting', 'Elastic-deformation', 'Dropping'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Shape', 'Position', 'Layout'],
  description: 'Two cards that act like drops of liquid. Drag one toward the other: a gooey bridge reaches across and they melt into one card. Pull them apart (or press Split) and the goo stretches, snaps and leaves a drip.',
  params: [
    { key: 'goo', label: 'Gooeyness', group: 'Shape', type: 'range', min: 0.3, max: 1.2, step: 0.1, unit: 'em', default: 0.7, live: true },
    { key: 'speed', label: 'Merge time', group: 'Motion', type: 'range', min: 0.4, max: 1.6, step: 0.1, unit: 's', default: 0.9, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Goo color'),
  ],
};

const GAP = 5.5; // em from the center to each card

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('goo');
    k.html(`
      <div class="sp sp-goo">
        <svg class="sp-goo__defs" aria-hidden="true"><filter id="${id}">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" />
        </filter></svg>
        <div class="sp-goo__wrap">
          <div class="sp-goo__blobs" style="filter: url(#${id}) drop-shadow(0.25em 0.25em 0 var(--color-ink))">
            <i class="sp-goo__blob sp-goo__blob--a"></i><i class="sp-goo__blob sp-goo__blob--b"></i><i class="sp-goo__drip"></i>
          </div>
          <div class="sp-goo__card sp-goo__card--a"><small>Notes</small><b>12</b>${bars(2)}</div>
          <div class="sp-goo__card sp-goo__card--b" tabindex="0" aria-label="Drag toward Notes to merge"><small>Tasks</small><b>5</b>${bars(2)}</div>
          <div class="sp-goo__card sp-goo__card--m" aria-hidden="true"><small>Workspace</small><b>17</b><span>Notes + Tasks</span></div>
        </div>
        <button type="button" class="sp-goo__btn">Merge</button>
      </div>`);
    const blur = k.$('feGaussianBlur');
    const [blobA, blobB, drip] = k.$$('.sp-goo__blobs i');
    const [cardA, cardB, cardM] = k.$$('.sp-goo__card');
    const btn = k.$('.sp-goo__btn');
    const wrap = k.$('.sp-goo__wrap');
    k.fit(wrap, 0.9);
    const d = (t) => (reducedMotion ? 0 : t);
    const em = () => parseFloat(getComputedStyle(wrap).fontSize);
    // The blur that makes the goo is in pixels, so keep it in step with the design's size.
    const setGoo = () => blur.setAttribute('stdDeviation', (p.goo * em()).toFixed(1));
    k.resize(wrap, setGoo);
    const A = [blobA, cardA];
    const B = [blobB, cardB];
    gsap.set(A, { x: `${-GAP}em` });
    gsap.set(B, { x: `${GAP}em` });
    gsap.set(cardM, { autoAlpha: 0 });
    gsap.set(drip, { autoAlpha: 0 });
    let merged = false;
    let tl;

    const merge = () => {
      merged = true;
      btn.textContent = 'Split';
      cardB.setAttribute('aria-label', 'Merged. Press Split to pull apart');
      tl?.kill();
      tl = gsap.timeline()
        .to([cardA, cardB], { autoAlpha: 0, duration: d(0.2) }, 0)
        .to(A, { x: 0, duration: d(p.speed), ease: 'power3.inOut' }, 0)
        .to(B, { x: 0, duration: d(p.speed), ease: 'power3.inOut' }, 0)
        // Once one, the blob swells a little and wobbles like a settling drop
        .to([blobA, blobB], { scaleX: 1.3, scaleY: 1.08, duration: d(0.3), ease: 'power2.out' }, d(p.speed * 0.8))
        .to([blobA, blobB], { scaleX: 1.22, scaleY: 1.04, duration: d(0.6), ease: 'elastic.out(1, 0.4)' })
        .to(cardM, { autoAlpha: 1, scale: 1, duration: d(0.35), ease: 'back.out(2)' }, '<');
    };

    const split = () => {
      merged = false;
      btn.textContent = 'Merge';
      cardB.setAttribute('aria-label', 'Drag toward Notes to merge');
      tl?.kill();
      tl = gsap.timeline()
        .to(cardM, { autoAlpha: 0, scale: 0.9, duration: d(0.2) }, 0)
        .to([blobA, blobB], { scaleX: 1, scaleY: 1, duration: d(0.3) }, 0)
        // The drip is left behind in the middle as the bridge snaps, then falls
        .set(drip, { autoAlpha: 1, x: 0, y: 0, scale: 1 }, 0)
        .to(A, { x: `${-GAP}em`, duration: d(p.speed * 1.3), ease: 'elastic.out(1, 0.55)' }, 0.1)
        .to(B, { x: `${GAP}em`, duration: d(p.speed * 1.3), ease: 'elastic.out(1, 0.55)' }, 0.1)
        .to(drip, { y: '6em', scale: 0.4, duration: d(0.7), ease: 'power2.in' }, d(0.35))
        .to(drip, { autoAlpha: 0, duration: d(0.2) }, '>-0.2')
        .to([cardA, cardB], { autoAlpha: 1, duration: d(0.3) }, d(0.5));
    };

    k.on(btn, 'click', () => (merged ? split() : merge()));

    // Drag Tasks toward Notes: the goo bridges as they near; let go close enough and they merge.
    let start = null;
    k.on(cardB, 'pointerdown', (e) => {
      if (merged) return;
      tl?.kill();
      start = { x: e.clientX, from: Number(gsap.getProperty(cardB, 'x')) };
      cardB.setPointerCapture(e.pointerId);
    });
    k.on(cardB, 'pointermove', (e) => {
      if (!start) return;
      const s = Number(wrap.style.scale) || 1;
      const x = Math.min(GAP * em() * 1.2, Math.max(-GAP * em() * 0.2, start.from + (e.clientX - start.x) / s));
      gsap.set(B, { x });
      // The text fades as the cards close in, so the two never print over each other.
      gsap.set([cardA, cardB], { opacity: Math.min(1, Math.max(0, (x / (GAP * em()) - 0.35) * 2.5)) });
    });
    const release = () => {
      if (!start) return;
      start = null;
      if (Number(gsap.getProperty(cardB, 'x')) < GAP * em() * 0.45) merge();
      else {
        gsap.to(B, { x: `${GAP}em`, duration: d(0.9), ease: 'elastic.out(1, 0.45)' });
        gsap.to([cardA, cardB], { opacity: 1, duration: d(0.3) });
      }
    };
    k.on(cardB, 'pointerup', release);
    k.on(cardB, 'pointercancel', release);
    k.on(cardB, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowLeft') e.preventDefault(), merged || merge();
    });

    return { destroy: () => { tl?.kill(); k.destroy(); }, update: (key) => key === 'goo' && setGoo() };
  },
};
