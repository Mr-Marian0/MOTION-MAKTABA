/** Fold Notifications: dismissing a notification folds it away like a paper slip: it creases across the middle, the bottom half swings up under the top, the folded slip shrinks to a line, and the ones below close the gap. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

const NOTES = [['Ada commented on your print', '2 min'], ['Order #1044 has shipped', '1 h'], ['Your plate is ready to collect', '3 h'], ['New follower: Ben Ito', 'Yesterday']];

export const meta = {
  title: 'Fold Notifications',
  element: 'Notifications',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Event-driven', 'Sequential', 'Hierarchical'],
  effect: ['Folding', 'Contracting', 'Sliding'],
  purpose: ['Feedback', 'Continuity'],
  properties: ['Rotation', 'Size', 'Position'],
  description: 'A notification list where each dismissed item is folded away. Press ✕ and the notification creases along its middle: its lower half swings up and under the top half like a slip of paper folded in two, darkening as it turns, then the folded strip shrinks to nothing and the items below slide up to close the gap. "Clear all" folds them one after another.',
  params: [
    { key: 'time', label: 'Fold time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.05, unit: 's', default: 0.5, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Dot'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const item = ([t, when]) => `<li class="sp-fdn__item"><div class="sp-df__note sp-fdn__top"><i class="sp-df__dot"></i><span>${t}</span><small>${when}</small><button type="button" class="sp-fdn__x" aria-label="Dismiss: ${t}">✕</button></div><div class="sp-fdn__bot" aria-hidden="true"></div></li>`;
    k.html(`
      <div class="sp sp-df sp-fdn">
        <div class="sp-fdn__panel">
          <div class="sp-df__row"><span class="sp-df__kick">Notifications</span><button type="button" class="sp-df__btn sp-df__btn--ghost">Clear all</button></div>
          <ul class="sp-fdn__list" aria-live="polite">${NOTES.map(item).join('')}</ul>
          <p class="sp-fdn__empty" hidden>You're all caught up.</p>
        </div>
      </div>`);
    const list = k.$('.sp-fdn__list');
    const empty = k.$('.sp-fdn__empty');
    // The note itself shows its top half on top; a "bottom half" layer (same look) folds up behind a crease
    const fold = (li) => new Promise((done) => {
      const finish = () => { li.remove(); if (!list.children.length) empty.hidden = false; done(); };
      if (reducedMotion) return finish();
      const note = li.querySelector('.sp-fdn__top');
      const bot = li.querySelector('.sp-fdn__bot');
      bot.innerHTML = note.outerHTML;
      bot.inert = true;
      gsap.set(bot, { autoAlpha: 1, transformOrigin: '50% 50%', transformPerspective: 500 });
      gsap.timeline({ onComplete: finish })
        .set(note, { clipPath: 'inset(0 0 50% 0)' })
        .to(bot, { rotationX: 178, filter: 'brightness(0.6)', duration: p.time, ease: 'power2.inOut' })
        .to(li, { height: 0, marginBottom: 0, opacity: 0, duration: p.time * 0.5, ease: 'power2.in' }, `-=${p.time * 0.15}`);
    });
    k.on(list, 'click', (e) => { const x = e.target.closest('.sp-fdn__x'); if (x) { const next = x.closest('li').nextElementSibling?.querySelector('.sp-fdn__x'); fold(x.closest('li')).then(() => next?.focus()); } });
    k.on(k.$('.sp-df__btn'), 'click', async () => { for (const li of [...list.children]) await fold(li); });
    return () => k.destroy();
  },
};
