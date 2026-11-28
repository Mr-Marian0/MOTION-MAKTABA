/** Glitch Notifications: an error notification arrives as a corrupted signal: it flickers in torn into horizontal slices that jump sideways in hard steps, then snaps clean; retrying makes it glitch again. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Glitch Notifications',
  element: 'Notifications',
  trigger: ['Click', 'Keyboard', 'State change'],
  behavior: ['Event-driven', 'Randomized', 'Conditional'],
  effect: ['Glitching', 'Jittering', 'RGB-splitting'],
  purpose: ['Feedback', 'Focus'],
  properties: ['Clip & mask', 'Position', 'Color'],
  description: 'A sync-error notification that looks like a bad signal. When the error comes in (press "Sync"), the notification flickers into existence torn into horizontal bands: for a fraction of a second random bands jump sideways in hard, dropped-frame steps and a red and cyan fringe flashes, then it snaps into a clean card. "Retry" fails again and glitches the card in place; the third retry succeeds and the card turns calm green.',
  params: [
    { key: 'tear', label: 'Tear', group: 'Motion', type: 'range', min: 0.2, max: 2, step: 0.1, unit: 'em', default: 0.8, live: true },
    { key: 'frames', label: 'Glitch frames', group: 'Motion', type: 'range', min: 3, max: 14, step: 1, unit: '', default: 7, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Error'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-df sp-gln">
        <div class="sp-gln__slot" aria-live="assertive">
          <div class="sp-df__note sp-gln__card" hidden><i class="sp-df__dot"></i><div><b>Sync failed</b><small>Couldn't reach the server.</small></div><button type="button" class="sp-df__btn sp-gln__retry">Retry</button></div>
        </div>
        <button type="button" class="sp-df__btn sp-df__btn--ghost sp-gln__sync">Sync</button>
      </div>`);
    const card = k.$('.sp-gln__card');
    const title = k.$('.sp-gln__card b');
    const sub = k.$('.sp-gln__card small');
    const retry = k.$('.sp-gln__retry');
    let tries = 0;
    const glitch = () => {
      if (reducedMotion) return;
      const n = Math.round(p.frames);
      const tl = gsap.timeline();
      for (let f = 0; f < n; f++) {
        const top = Math.random() * 75, h = 8 + Math.random() * 30;
        const amt = p.tear * (1 - f / n);
        tl.set(card, {
          x: `${(Math.random() - 0.5) * 2 * amt}em`,
          clipPath: Math.random() < 0.65 ? `inset(${top}% -4% ${Math.max(0, 100 - top - h)}% -4%)` : 'inset(-10% -10% -10% -10%)',
          boxShadow: `${(Math.random() - 0.5) * 6}px 0 0 #ff2a4d, ${(Math.random() - 0.5) * 6}px 0 0 #18e0ff`,
          opacity: Math.random() < 0.2 ? 0.3 : 1,
        }, f * 0.045);
      }
      tl.set(card, { x: 0, clipPath: 'inset(-10% -10% -10% -10%)', boxShadow: 'none', opacity: 1 }, n * 0.045);
    };
    k.on(k.$('.sp-gln__sync'), 'click', () => {
      tries = 0;
      card.hidden = false;
      card.classList.remove('is-ok');
      title.textContent = 'Sync failed';
      sub.textContent = "Couldn't reach the server.";
      retry.hidden = false;
      glitch();
    });
    k.on(retry, 'click', () => {
      tries += 1;
      if (tries < 3) { sub.textContent = `Still can't connect (attempt ${tries + 1}).`; return glitch(); }
      card.classList.add('is-ok');
      title.textContent = 'Synced';
      sub.textContent = 'All 248 photos are up to date.';
      retry.hidden = true;
      k.$('.sp-gln__sync').focus();
      if (!reducedMotion) gsap.fromTo(card, { scale: 0.96 }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    });
    return () => k.destroy();
  },
};
