/** Drop Tags: press Enter and the word you typed becomes a tag that free-falls out of the field into the tray below, tumbling as it drops and landing in its place; click a tag and it falls out of the bottom. */
import { kit, uid, esc } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Drop Tags',
  element: 'Text field',
  trigger: ['Keyboard', 'Click'],
  behavior: ['Event-driven', 'Gravity-driven', 'Randomized'],
  effect: ['Free-fall', 'Tumbling', 'Dropping'],
  purpose: ['Feedback', 'Continuity', 'Delight'],
  properties: ['Position', 'Rotation', 'Layout'],
  description: 'A tag input with a tray underneath. Type a word and press Enter (or comma): it leaves the field as a tag and free-falls into the tray, speeding up as it drops, tumbling slightly, landing in the next free spot with a little bounce. Click a tag, or Backspace in an empty field, and it falls out through the bottom of the tray.',
  params: [
    { key: 'tumble', label: 'Tumble', group: 'Motion', type: 'range', min: 0, max: 90, step: 5, unit: '°', default: 30, live: true },
    { key: 'time', label: 'Fall time', group: 'Motion', type: 'range', min: 0.3, max: 1.2, step: 0.05, unit: 's', default: 0.55, live: true },
    tone('#3e7d5a', 'tone', '--sp-accent', 'Tag'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('tag');
    k.html(`
      <div class="sp sp-fi sp-tag">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Tags</label>
          <div class="sp-fi__box"><input class="sp-fi__input" id="${id}" placeholder="Add a tag, press Enter" autocomplete="off" value="watercolour" /></div>
          <ul class="sp-tag__tray" aria-label="Tags" aria-live="polite"><li><button type="button" class="sp-fi__chip sp-tag__t">sketch ✕</button></li><li><button type="button" class="sp-fi__chip sp-tag__t">ink ✕</button></li></ul>
        </div>
      </div>`);
    const input = k.$('.sp-fi__input');
    const tray = k.$('.sp-tag__tray');
    const box = k.$('.sp-fi__box');
    const fallOut = (li) => {
      if (reducedMotion) return li.remove();
      li.style.pointerEvents = 'none';
      gsap.to(li.firstElementChild, { y: '6em', rotation: (Math.random() - 0.5) * 2 * p.tumble * 2, autoAlpha: 0, duration: p.time, ease: 'power2.in', onComplete: () => li.remove() });
    };
    k.on(tray, 'click', (e) => {
      const t = e.target.closest('.sp-tag__t');
      if (t) fallOut(t.parentElement), input.focus();
    });
    const add = () => {
      const v = input.value.trim().replace(/,$/, '');
      if (!v) return;
      input.value = '';
      if (tray.children.length >= 6) fallOut(tray.firstElementChild);
      tray.insertAdjacentHTML('beforeend', `<li><button type="button" class="sp-fi__chip sp-tag__t">${esc(v)} ✕</button></li>`);
      const tag = tray.lastElementChild.firstElementChild;
      if (reducedMotion) return;
      // It starts where the text was (inside the field) and falls to its slot: gravity = power2.in, then a bounce
      const a = box.getBoundingClientRect();
      const b = tag.getBoundingClientRect();
      gsap.timeline()
        .fromTo(tag, { x: a.left - b.left + 14, y: a.top - b.top + 8, rotation: 0 }, { x: 0, y: 0, rotation: (Math.random() - 0.5) * 2 * p.tumble, duration: p.time, ease: 'power2.in' })
        .to(tag, { rotation: 0, keyframes: { y: ['-0.35em', 0] }, duration: 0.35, ease: 'power1.out' });
    };
    k.on(input, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ',') e.preventDefault(), add();
      else if (e.key === 'Backspace' && !input.value && tray.lastElementChild) fallOut(tray.lastElementChild);
    });
    return () => k.destroy();
  },
};
