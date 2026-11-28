/** Trail Progress: an upload bar whose leading edge sheds sparks: as it advances, little particles stream off the tip and drift back and down, fading, more of them the faster it is moving. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Trail Progress',
  element: 'Progress bar',
  trigger: ['Click', 'Load', 'Keyboard'],
  behavior: ['Velocity-aware', 'Continuous', 'Randomized'],
  effect: ['Particle-trail', 'Scattering', 'Motion-trail'],
  purpose: ['Progress', 'Delight'],
  properties: ['Position', 'Opacity', 'Scale'],
  description: 'An upload bar like a fuse. As the fill moves, its glowing tip throws off sparks that fly backwards and fall, fading as they go, leaving a short trail of particles behind the front. The upload speeds up and slows down (as uploads do), and the spark trail thickens and thins with the speed. At 100% the tip gives a last burst and goes out.',
  params: [
    { key: 'time', label: 'Upload time', group: 'Behavior', type: 'range', min: 2, max: 15, step: 0.5, unit: 's', default: 6, live: true },
    { key: 'sparks', label: 'Sparks', group: 'Shape', type: 'range', min: 0.2, max: 2, step: 0.1, unit: '×', default: 1, live: true },
    tone('#f2701d', 'tone', '--sp-accent', 'Spark'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion, lite }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-trp">
        <div class="sp-df__card">
          <div class="sp-df__row"><b>Uploading 248 photos</b><small class="sp-trp__pct" aria-live="polite">0%</small></div>
          <div class="sp-trp__wrap"><div class="sp-df__track sp-trp__track" role="progressbar" aria-label="Upload" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="sp-df__fill sp-trp__fill"></i></div><i class="sp-trp__tip" aria-hidden="true"></i><span class="sp-trp__sparks" aria-hidden="true"></span></div>
          <button type="button" class="sp-df__btn">Upload again</button>
        </div>
      </div>`);
    const track = k.$('.sp-trp__track');
    const fill = k.$('.sp-trp__fill');
    const tip = k.$('.sp-trp__tip');
    const sparks = k.$('.sp-trp__sparks');
    const pct = k.$('.sp-trp__pct');
    let W = 200;
    k.resize(track, () => (W = track.offsetWidth));
    const spark = (x, burst = 1) => {
      const s = document.createElement('i');
      sparks.append(s);
      gsap.fromTo(s, { x, y: 0, scale: 1, autoAlpha: 1 }, { x: x - (10 + Math.random() * 30) * burst, y: (Math.random() - 0.3) * 18 * burst, scale: 0.2, autoAlpha: 0, duration: 0.5 + Math.random() * 0.4, ease: 'power2.out', onComplete: () => s.remove() });
    };
    let run, last = 0, owed = 0;
    const start = () => {
      run?.kill();
      sparks.innerHTML = '';
      const s = { v: 0 };
      last = 0;
      gsap.set(tip, { autoAlpha: 1 });
      // uneven speed: keyframes through a few random checkpoints
      const marks = [0, 18 + Math.random() * 10, 45 + Math.random() * 15, 70 + Math.random() * 10, 100];
      run = gsap.timeline({ onUpdate: () => {
        const x = (s.v / 100) * W;
        gsap.set(fill, { scaleX: s.v / 100 });
        gsap.set(tip, { x });
        pct.textContent = `${Math.round(s.v)}%`;
        track.setAttribute('aria-valuenow', Math.round(s.v));
        if (reducedMotion) return;
        // sparks per frame ∝ speed (fewer in lite mode)
        owed += (s.v - last) * 1.2 * p.sparks * (lite ? 0.4 : 1);
        last = s.v;
        while (owed >= 1) { owed -= 1; spark(x); }
      }, onComplete: () => { if (!reducedMotion) for (let i = 0; i < 10; i++) spark(W, 1.6); gsap.to(tip, { autoAlpha: 0, duration: 0.4 }); pct.textContent = 'Done'; } });
      marks.slice(1).forEach((m, i) => run.to(s, { v: m, duration: (p.time / 4) * (0.6 + Math.random() * 0.8), ease: 'sine.inOut' }));
      if (reducedMotion) run.progress(1);
    };
    k.inView(track, () => !run && start(), 0.5);
    k.on(k.$('.sp-df__btn'), 'click', start);
    return () => { run?.kill(); k.destroy(); };
  },
};
