/** Hum Note: switch on dictation and the note's ruled lines start to hum like plucked strings, each one vibrating in a standing wave with still nodes and swinging loops, while the words appear; switch off and they fall still. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

const SPOKEN = 'Remember to water the ferns and call the framer about the oak moulding'.split(' ');

export const meta = {
  title: 'Hum Note',
  element: 'Textarea',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Periodic', 'Event-driven'],
  effect: ['Standing-wave', 'Vibrating', 'Resonance-motion'],
  purpose: ['Feedback', 'Progress', 'Delight'],
  properties: ['Path'],
  description: 'A note with a dictation button. Turn dictation on and the ruled lines of the page vibrate like strings: each line holds a standing wave, fixed at its ends and at a few nodes in between, with the loops between them swinging up and down in place rather than travelling. Different lines ring at different harmonics, and the louder the (simulated) voice, the bigger the loops. Words appear as they are "heard". Turn it off and the lines settle flat.',
  params: [
    { key: 'amp', label: 'Loudness', group: 'Motion', type: 'range', min: 1, max: 8, step: 0.5, unit: '', default: 4, live: true },
    { key: 'lines', label: 'Ruled lines', group: 'Shape', type: 'range', min: 2, max: 6, step: 1, unit: '', default: 4 },
    tone('#b3412e', 'tone', '--sp-accent', 'Strings'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('hum');
    const L = Math.round(p.lines);
    k.html(`
      <div class="sp sp-fi sp-hum">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Voice note</label>
          <div class="sp-hum__page">
            <svg viewBox="0 0 200 ${L * 20}" preserveAspectRatio="none" aria-hidden="true">${'<path />'.repeat(L)}</svg>
            <textarea class="sp-fi__area sp-hum__area" id="${id}" placeholder="Press Dictate and speak…"></textarea>
          </div>
          <button type="button" class="sp-fi__btn sp-hum__go" aria-pressed="false">● Dictate</button>
        </div>
      </div>`);
    const paths = k.$$('.sp-hum__page path');
    const area = k.$('textarea');
    const go = k.$('.sp-hum__go');
    // Line j vibrates in harmonic n_j: y = A · sin(n π x / 200) · cos(ω t)  (nodes stay put, loops swing in place)
    const harm = Array.from({ length: L }, (_, j) => 2 + (j % 3));
    const s = { t: 0, vol: 0 };
    const draw = () => paths.forEach((pa, j) => {
      const base = 12 + j * 20;
      const A = p.amp * s.vol * (1 - j * 0.12);
      const c = Math.cos(s.t * (8 + harm[j] * 3));
      pa.setAttribute('d', `M${Array.from({ length: 41 }, (_, i) => { const x = i * 5; return `${x} ${(base + A * Math.sin((harm[j] * Math.PI * x) / 200) * c).toFixed(2)}`; }).join(' L')}`);
    });
    draw();
    let on = false, word = 0, wordTimer, running = false;
    const tick = (time, ms) => {
      s.t += ms / 1000;
      // the "voice" level wanders, so the loops swell and shrink like speech
      const target = on ? 0.55 + 0.45 * Math.abs(Math.sin(s.t * 2.3) * Math.sin(s.t * 0.7 + 1)) : 0;
      s.vol += (target - s.vol) * Math.min(1, ms / 120);
      draw();
      if (!on && s.vol < 0.01) { s.vol = 0; draw(); gsap.ticker.remove(tick); running = false; }
    };
    const speak = () => {
      area.value += `${area.value && !area.value.endsWith(' ') ? ' ' : ''}${SPOKEN[word % SPOKEN.length]}`;
      word += 1;
      wordTimer = gsap.delayedCall(0.35 + Math.random() * 0.3, speak);
    };
    k.on(go, 'click', () => {
      on = !on;
      go.setAttribute('aria-pressed', String(on));
      go.textContent = on ? '■ Stop' : '● Dictate';
      wordTimer?.kill();
      if (on) speak();
      if (!reducedMotion && !running) running = true, gsap.ticker.add(tick);
    });
    return () => { wordTimer?.kill(); gsap.ticker.remove(tick); k.destroy(); };
  },
};
