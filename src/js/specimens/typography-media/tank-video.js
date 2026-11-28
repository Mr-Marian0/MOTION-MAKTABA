/** Tank Video: the player's volume control is a little water tank: drag it or use the arrow keys and the water level rises or falls, its surface sloshing and settling, and muting drains it with a gurgle of bubbles. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Tank Video',
  element: 'Video',
  trigger: ['Drag', 'Keyboard', 'Click'],
  behavior: ['Draggable', 'Physics-driven', 'State-dependent'],
  effect: ['Water-motion', 'Damped-oscillation', 'Rising'],
  purpose: ['Feedback', 'Affordance', 'Delight'],
  properties: ['Path', 'Position'],
  description: 'A video player whose volume control is a small glass tank of water in the corner. Drag up and down on it (or press ↑/↓) and the water level follows, the surface tipping and sloshing from the movement and settling flat when you stop. The speaker icon mutes: the tank drains with a few bubbles; unmute and it refills to where it was.',
  params: [
    { key: 'slosh', label: 'Slosh', group: 'Motion', type: 'range', min: 0, max: 20, step: 1, unit: '', default: 8, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-tnk">
        <div class="sp-tm__video sp-tnk__video">
          ${photo(1, 'sp-tnk__img')}
          <div class="sp-tm__bar"><button type="button" class="sp-tm__play" aria-label="Play">▶</button><span class="sp-tm__track"><i class="sp-tm__fill" style="transform:scaleX(.35)"></i></span>
            <button type="button" class="sp-tnk__mute" aria-label="Mute" aria-pressed="false">🔈</button>
            <span class="sp-tnk__tank" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60"><svg viewBox="0 0 20 40" preserveAspectRatio="none" aria-hidden="true"><path /></svg><span class="sp-tnk__bubbles" aria-hidden="true"></span></span>
          </div>
        </div>
      </div>`);
    const tank = k.$('.sp-tnk__tank');
    const path = k.$('.sp-tnk__tank path');
    const mute = k.$('.sp-tnk__mute');
    const bubbles = k.$('.sp-tnk__bubbles');
    const s = k.track({ level: 0.6, tilt: 0, ph: 0 });
    let vol = 0.6;
    const draw = () => {
      const top = 40 - s.level * 38;
      path.setAttribute('d', `M0 40 L${Array.from({ length: 9 }, (_, i) => `${i * 2.5} ${(top + (i / 8 - 0.5) * s.tilt + Math.sin(i * 1.2 - s.ph) * Math.abs(s.tilt) * 0.15).toFixed(2)}`).join(' L')} L20 40 Z`);
      tank.setAttribute('aria-valuenow', Math.round(s.level * 100));
    };
    draw();
    // Move the level; the surface tilts by how fast it moved and sloshes back to flat
    const set = (v, d = 0.35) => {
      const from = s.level;
      vol = Math.min(1, Math.max(0, v));
      if (reducedMotion) { s.level = vol; return draw(); }
      gsap.to(s, { level: vol, duration: d, ease: 'power2.out', onUpdate: draw, overwrite: 'auto' });
      gsap.fromTo(s, { tilt: Math.max(-1, Math.min(1, (vol - from) * 6)) * p.slosh }, { tilt: 0, duration: 1.6, ease: 'elastic.out(1, 0.25)', onUpdate: draw });
      gsap.to(s, { ph: `+=${Math.PI * 4}`, duration: 1.6, ease: 'none' });
    };
    let box;
    k.on(tank, 'pointerdown', (e) => { tank.setPointerCapture(e.pointerId); box = tank.getBoundingClientRect(); set(1 - (e.clientY - box.top) / box.height, 0.15); });
    k.on(tank, 'pointermove', (e) => box && set(1 - (e.clientY - box.top) / box.height, 0.15));
    k.on(tank, 'pointerup', () => (box = null));
    k.on(tank, 'keydown', (e) => { const d = { ArrowUp: 0.1, ArrowDown: -0.1, ArrowRight: 0.1, ArrowLeft: -0.1 }[e.key]; if (d) e.preventDefault(), set(vol + d); });
    let saved = 0.6;
    k.on(mute, 'click', () => {
      const muted = mute.getAttribute('aria-pressed') !== 'true';
      mute.setAttribute('aria-pressed', String(muted));
      mute.textContent = muted ? '🔇' : '🔈';
      mute.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
      if (muted) {
        saved = vol || 0.6;
        set(0, 0.8);
        if (!reducedMotion) for (let i = 0; i < 5; i++) {
          const b = document.createElement('i');
          bubbles.append(b);
          gsap.fromTo(b, { x: (Math.random() - 0.5) * 8, y: 0, scale: 0.5, autoAlpha: 1 }, { y: -16 - Math.random() * 10, scale: 1, autoAlpha: 0, duration: 0.6, delay: i * 0.1, ease: 'power1.out', onComplete: () => b.remove() });
        }
      } else set(saved, 0.8);
    });
    return () => k.destroy();
  },
};
