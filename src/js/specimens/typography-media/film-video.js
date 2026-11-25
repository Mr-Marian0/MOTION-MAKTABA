/** Film Player: a little animated film with a play/pause icon that morphs and a scrubber that drags through time. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Paper Film Player',
  element: 'Video',
  trigger: ['Click', 'Drag', 'Keyboard'],
  behavior: ['Pausable', 'Resumable', 'Time-driven', 'Draggable'],
  effect: ['Morphing', 'Sliding', 'Bobbing'],
  purpose: ['Storytelling', 'Feedback', 'Affordance'],
  properties: ['Shape', 'Position', 'Path'],
  description: 'A video player for a tiny paper film: a boat crosses the sea under a setting sun. Play turns into pause by morphing its shape, and the scrubber lets you drag back and forth through the film.',
  params: [
    { key: 'length', label: 'Film length', group: 'Motion', type: 'range', min: 3, max: 12, step: 1, unit: 's', default: 6 },
    tone('#b3412e', 'tone', '--sp-accent', 'Sun color'),
  ],
};

// Same number of points in both shapes, so GSAP can morph one into the other.
const PLAY = 'M8 5 L8 19 L13 15.5 L13 8.5 Z M13 8.5 L13 15.5 L19 12 L19 12 Z';
const PAUSE = 'M7 5 L7 19 L10.5 19 L10.5 5 Z M13.5 5 L13.5 19 L17 19 L17 5 Z';

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('film');
    k.html(`
      <div class="sp sp-film">
        <figure class="sp-film__player">
          <svg class="sp-film__screen" viewBox="0 0 200 100" role="img" aria-label="A boat crossing the sea at sunset">
            <rect width="200" height="100" fill="#f3e3c6"/>
            <circle class="sp-film__sun" cx="40" cy="30" r="14" style="fill: var(--sp-accent)"/>
            <g class="sp-film__boat"><path d="M-14 70 H14 L9 78 H-9 Z" fill="#3e2c1f"/><path d="M0 70 V48 L13 66 Z" fill="#fcf8f0" stroke="#3e2c1f"/></g>
            <path class="sp-film__sea" d="M-20 76 Q-10 72 0 76 T20 76 T40 76 T60 76 T80 76 T100 76 T120 76 T140 76 T160 76 T180 76 T200 76 T220 76 V100 H-20Z" fill="#2f4a6b"/>
          </svg>
          <figcaption class="sp-film__bar">
            <button type="button" class="sp-film__play" aria-label="Play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${PLAY}"/></svg></button>
            <input class="sp-film__seek" id="${id}" type="range" min="0" max="1000" value="0" aria-label="Seek" />
            <output class="sp-film__time" for="${id}">0.0s</output>
          </figcaption>
        </figure>
      </div>`);
    const btn = k.$('.sp-film__play');
    const icon = k.$('.sp-film__play path');
    const seek = k.$('.sp-film__seek');
    const time = k.$('.sp-film__time');
    const len = Number(p.length);

    const film = gsap.timeline({
      paused: true,
      onUpdate: () => {
        seek.value = Math.round(film.progress() * 1000);
        time.textContent = `${film.time().toFixed(1)}s`;
      },
      onComplete: () => setPlaying(false),
    })
      .fromTo(k.$('.sp-film__sun'), { attr: { cy: 30 } }, { attr: { cy: 82 }, duration: len, ease: 'none' }, 0)
      .fromTo(k.$('.sp-film__boat'), { x: -20, y: 0 }, { x: 220, duration: len, ease: 'none' }, 0)
      .fromTo(k.$('.sp-film__sea'), { x: 0 }, { x: -40, duration: len, ease: 'none' }, 0)
      .to(k.$('.sp-film__boat'), { y: -3, rotation: 4, duration: 0.5, yoyo: true, repeat: Math.floor(len * 2) - 1, ease: 'sine.inOut' }, 0);

    const setPlaying = (on) => {
      btn.setAttribute('aria-label', on ? 'Pause' : 'Play');
      gsap.to(icon, { attr: { d: on ? PAUSE : PLAY }, duration: reducedMotion ? 0 : 0.3, ease: 'power2.inOut' });
    };
    k.on(btn, 'click', () => {
      const on = film.paused() || film.progress() === 1;
      if (film.progress() === 1) film.restart();
      film.paused(!on);
      setPlaying(on);
    });
    k.on(seek, 'input', () => {
      film.pause();
      setPlaying(false);
      film.progress(seek.value / 1000);
    });

    return () => (film.kill(), k.destroy());
  },
};
