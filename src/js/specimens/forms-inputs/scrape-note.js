/** Scrape Note: clearing the note drags a scraper blade across it, and the writing comes away behind the blade in curls of shavings. You can also grab the blade and scrape by hand. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Scrape Note',
  element: 'Textarea',
  trigger: ['Click', 'Keyboard', 'Drag'],
  behavior: ['Event-driven', 'Draggable', 'Position-aware'],
  effect: ['Scraping', 'Sweeping', 'Scattering'],
  purpose: ['Feedback', 'Affordance', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Rotation'],
  description: 'A scratchpad with a paint scraper for a clear button. Press "Scrape clean" and a blade slides across the note from left to right; everything it has passed is gone, and little curls of shavings spring off its edge. Or drag the blade yourself: the text vanishes only as far as you have scraped, and letting go part way snaps it back. Arrow keys move the blade too.',
  params: [
    { key: 'time', label: 'Scrape time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    { key: 'curls', label: 'Shavings', group: 'Shape', type: 'range', min: 0, max: 12, step: 1, unit: '', default: 6, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Blade'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('scr');
    k.html(`
      <div class="sp sp-fi sp-scr">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Scratchpad</label>
          <div class="sp-scr__pad">
            <textarea class="sp-fi__area sp-scr__area" id="${id}">Call the printer about the proofs. Order more kraft paper. Ask Noor for the new logo files.</textarea>
            <div class="sp-scr__blade" role="slider" tabindex="0" aria-label="Scraper" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>
          </div>
          <button type="button" class="sp-fi__btn sp-scr__go">Scrape clean</button>
        </div>
      </div>`);
    const pad = k.$('.sp-scr__pad');
    const area = k.$('.sp-scr__area');
    const blade = k.$('.sp-scr__blade');
    let W = 1;
    k.resize(pad, () => { W = pad.offsetWidth; draw(); });
    // s.at (0..1): how far the blade has gone; the area is clipped away left of it
    const s = k.track({ at: 0 });
    function draw() {
      gsap.set(blade, { x: s.at * W });
      area.style.clipPath = `inset(-4px -4px -4px ${(s.at * 100).toFixed(2)}%)`;
      blade.setAttribute('aria-valuenow', Math.round(s.at * 100));
    }
    const curl = () => {
      if (reducedMotion || !p.curls) return;
      const c = document.createElement('i');
      c.className = 'sp-scr__curl';
      pad.append(c);
      gsap.fromTo(c, { x: s.at * W, y: `${1 + Math.random() * 5}em`, rotation: 0, scale: 0.4 }, { x: `+=${10 + Math.random() * 30}`, y: `-=${20 + Math.random() * 30}`, rotation: (Math.random() - 0.5) * 720, scale: 1, autoAlpha: 0, duration: 0.7, ease: 'power2.out', onComplete: () => c.remove() });
    };
    // After a full pass the note is empty and the blade goes home (the clip resets)
    const finish = () => { area.value = ''; gsap.to(s, { at: 0, duration: reducedMotion ? 0 : 0.3, onUpdate: draw }); area.focus(); };
    const scrape = () => {
      let last = 0;
      gsap.to(s, { at: 1, duration: reducedMotion ? 0 : p.time, ease: 'power1.inOut', overwrite: true, onUpdate: () => {
        draw();
        if (s.at - last > 1 / (p.curls + 1)) last = s.at, curl();
      }, onComplete: finish });
    };
    k.on(k.$('.sp-scr__go'), 'click', scrape);
    // Drag by hand: the blade follows the pointer; past 90% it finishes the job, else it springs back
    let box = null;
    k.on(blade, 'pointerdown', (e) => { blade.setPointerCapture(e.pointerId); box = pad.getBoundingClientRect(); });
    k.on(blade, 'pointermove', (e) => {
      if (!box) return;
      const v = Math.min(1, Math.max(0, (e.clientX - box.left) / W));
      if (v - s.at > 0.08) curl();
      s.at = v;
      draw();
    });
    const drop = () => {
      if (!box) return;
      box = null;
      s.at > 0.9 ? scrape() : gsap.to(s, { at: 0, duration: reducedMotion ? 0 : 0.4, ease: 'back.out(2)', onUpdate: draw });
    };
    k.on(blade, 'pointerup', drop);
    k.on(blade, 'pointercancel', drop);
    k.on(blade, 'keydown', (e) => {
      const d = { ArrowRight: 0.1, ArrowLeft: -0.1 }[e.key];
      if (!d) return;
      e.preventDefault();
      s.at = Math.min(1, Math.max(0, s.at + d));
      if (d > 0) curl();
      draw();
      if (s.at >= 1) finish();
    });
    return () => k.destroy();
  },
};
