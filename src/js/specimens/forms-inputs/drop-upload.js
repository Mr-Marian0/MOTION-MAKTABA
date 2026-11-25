/** Drop Upload: the zone breathes when a file hovers; files drop in, fill a progress ring that turns into a tick; removed ones crumple away. */
import { kit, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Paper Tray Upload',
  element: 'File upload',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Drag-and-drop', 'Hover-dependent', 'Load-dependent', 'Queue-based'],
  effect: ['Dropping', 'Sweeping', 'Crumpling', 'Pulsating'],
  purpose: ['Feedback', 'Progress', 'Affordance'],
  properties: ['Scale', 'Path', 'Rotation'],
  description: 'A paper tray for files. Dragging a file over makes it breathe. Each file drops in as a slip with a progress ring that fills and turns into a tick. Removing one crumples it away. "Try a sample" works without a real file.',
  params: [
    { key: 'speed', label: 'Upload time', group: 'Motion', type: 'range', min: 0.5, max: 4, step: 0.25, unit: 's', default: 1.5, live: true },
    tone('#4f6b4a', 'tone', '--sp-accent', 'Ring color'),
  ],
};

const SAMPLES = ['cover.png', 'notes.pdf', 'sketch.jpg', 'letter.txt'];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-up">
        <label class="sp-up__zone">
          <input class="sp-up__input" type="file" multiple />
          <b>Drop files here</b><small>or click to choose</small>
        </label>
        <button type="button" class="sp-up__sample">Try a sample</button>
        <ul class="sp-up__list" aria-live="polite"></ul>
      </div>`);
    const zone = k.$('.sp-up__zone');
    const list = k.$('.sp-up__list');
    const d = (t) => (reducedMotion ? 0 : t);
    let breathe = null;
    let n = 0;

    const add = (name) => {
      const li = document.createElement('li');
      li.className = 'sp-up__file';
      li.innerHTML = `<svg class="sp-up__ring" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" pathLength="100"/><path d="M7.5 12.5l3 3 6-6.5" pathLength="100"/></svg>
        <span>${esc(name)}</span><button type="button" class="sp-up__x" aria-label="Remove ${esc(name)}">✕</button>`;
      list.prepend(li);
      if (list.children.length > 4) list.lastElementChild.remove();
      const [ring, check] = li.querySelectorAll('circle, path');
      gsap.set([ring, check], { strokeDasharray: 100, strokeDashoffset: 100 });
      gsap.timeline()
        .from(li, { y: -40, rotation: gsap.utils.random(-8, 8), opacity: 0, duration: d(0.5), ease: 'bounce.out' })
        .to(ring, { strokeDashoffset: 0, duration: d(Number(p.speed)), ease: 'power1.inOut' })
        .to(check, { strokeDashoffset: 0, duration: d(0.3), ease: 'power2.out' })
        .add(() => li.classList.add('is-done'));
      k.on(li.querySelector('.sp-up__x'), 'click', () =>
        gsap.to(li, { scale: 0.2, rotation: 120, opacity: 0, filter: 'blur(1px)', duration: d(0.4), ease: 'power2.in', onComplete: () => li.remove() }));
    };

    const hover = (on) => {
      zone.classList.toggle('is-over', on);
      breathe?.kill();
      breathe = on && !reducedMotion ? gsap.to(zone, { scale: 1.04, yoyo: true, repeat: -1, duration: 0.5, ease: 'sine.inOut' }) : null;
      if (!on) gsap.to(zone, { scale: 1, duration: 0.2 });
    };
    k.on(zone, 'dragenter', (e) => (e.preventDefault(), hover(true)));
    k.on(zone, 'dragover', (e) => e.preventDefault());
    k.on(zone, 'dragleave', (e) => !zone.contains(e.relatedTarget) && hover(false));
    k.on(zone, 'drop', (e) => {
      e.preventDefault();
      hover(false);
      [...e.dataTransfer.files].forEach((f) => add(f.name));
    });
    k.on(k.$('.sp-up__input'), 'change', (e) => [...e.target.files].forEach((f) => add(f.name)));
    k.on(k.$('.sp-up__sample'), 'click', () => add(SAMPLES[n++ % SAMPLES.length]));

    return () => (breathe?.kill(), k.destroy());
  },
};
