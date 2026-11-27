/** Blob Hop: the profile card squats, hops and goes blobby in the air, swaps to the next person at the top, and lands bouncing on the same spot. */
import { kit, labelsOf } from '../_kit.js';
import { tone, TONES } from '../_params.js';

export const meta = {
  title: 'Blob Hop',
  element: 'Profile card',
  trigger: ['Click', 'Keyboard', 'Hover'],
  behavior: ['Auto-advancing', 'Sequential', 'Elastic', 'Looping', 'Pausable'],
  effect: ['Blob-morphing', 'Jumping', 'Bouncing', 'Squashing', 'Stretching', 'Anticipation-motion'],
  purpose: ['Delight', 'Continuity'],
  properties: ['Shape', 'Radius', 'Position', 'Scale'],
  description: 'A team card that hops to the next person. It squats, leaps and goes soft and blobby in mid-air, where it swaps to the next profile, then lands on the same spot with a squash and a little bounce.',
  params: [
    { key: 'names', label: 'People', group: 'Content', type: 'text', default: 'Ana Reyes, Bo Lindqvist, Chidi Okafor, Mei Tanaka' },
    { key: 'height', label: 'Jump height', group: 'Motion', type: 'range', min: 1, max: 6, step: 0.5, unit: 'em', default: 3, live: true },
    { key: 'blob', label: 'Blobbiness', group: 'Shape', type: 'range', min: 0, max: 1, step: 0.1, unit: '', default: 1, live: true },
    { key: 'auto', label: 'Auto-hop', group: 'Behavior', type: 'toggle', default: true, live: true },
    tone('#b3412e', 'tone', '--sp-accent', 'Card tint'),
  ],
};

const ROLES = ['Motion designer', 'Illustrator', 'Front-end dev', 'Producer', 'Sound designer', 'Writer', 'Researcher'];
// Corner radii as 8 percentages (4 horizontal / 4 vertical), so GSAP can tween between any two.
const BASE = [8, 8, 8, 8, 7, 7, 7, 7];
const BLOB = [[48, 52, 40, 60, 55, 45, 58, 42], [60, 40, 55, 45, 42, 58, 46, 54]];
const SQUASH = [30, 30, 12, 12, 42, 42, 8, 8];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const names = labelsOf(p.names, ['Ana Reyes', 'Bo Lindqvist', 'Mei Tanaka']);
    k.html(`
      <div class="sp sp-blob">
        <div class="sp-blob__wrap">
          <button type="button" class="sp-blob__card" aria-label="Next person">
            <span class="sp-blob__content">
              <i class="sp-blob__avatar"></i>
              <b class="sp-blob__name" aria-live="polite"></b>
              <small class="sp-blob__role"></small>
              <span class="sp-blob__stats"></span>
            </span>
          </button>
          <i class="sp-blob__shadow"></i>
        </div>
        <p class="sp-note">Click the card</p>
      </div>`);
    const wrap = k.$('.sp-blob__wrap');
    const card = k.$('.sp-blob__card');
    const content = k.$('.sp-blob__content');
    const shadow = k.$('.sp-blob__shadow');
    k.fit(wrap, 0.8);
    const d = (t) => (reducedMotion ? 0 : t);
    // A shape between the plain card and a blob, by how blobby the setting says.
    const radius = (to) => {
      const r = BASE.map((b, i) => b + (to[i] - b) * p.blob);
      return `${r.slice(0, 4).map((v) => `${v}%`).join(' ')} / ${r.slice(4).map((v) => `${v}%`).join(' ')}`;
    };
    let i = 0;
    let busy = false;
    let hold = false;
    let timer;

    const fill = () => {
      const name = names[i];
      k.$('.sp-blob__avatar').textContent = name.split(' ').map((w) => w[0]).join('').slice(0, 2);
      k.$('.sp-blob__avatar').style.background = TONES[(i + 1) % TONES.length].value;
      k.$('.sp-blob__name').textContent = name;
      k.$('.sp-blob__role').textContent = ROLES[i % ROLES.length];
      k.$('.sp-blob__stats').innerHTML = `<span><b>${12 + i * 7}</b> projects</span><span>since <b>${2019 + (i % 5)}</b></span>`;
    };
    fill();
    gsap.set(card, { borderRadius: radius(BASE), transformOrigin: '50% 100%' });

    const schedule = () => {
      timer?.kill();
      if (p.auto && !hold && !reducedMotion) timer = gsap.delayedCall(2.8, hop);
    };

    function hop() {
      if (busy) return;
      busy = true;
      timer?.kill();
      if (reducedMotion) {
        i = (i + 1) % names.length;
        fill();
        busy = false;
        return;
      }
      const up = `${-p.height}em`;
      gsap.timeline({ onComplete: () => { busy = false; schedule(); } })
        // Anticipation: squat down
        .to(card, { scaleX: 1.12, scaleY: 0.84, borderRadius: radius(SQUASH), duration: 0.18, ease: 'power2.out' })
        .to(shadow, { scaleX: 1.12, duration: 0.18 }, '<')
        // Leap: stretch and go blobby
        .to(card, { y: up, scaleX: 0.9, scaleY: 1.1, borderRadius: radius(BLOB[0]), duration: 0.32, ease: 'power2.out' })
        .to(shadow, { scale: 0.5, opacity: 0.25, duration: 0.32, ease: 'power2.out' }, '<')
        .to(content, { scale: 0.6, opacity: 0, duration: 0.14 }, '<0.08')
        // Top of the hop: swap to the next person while the blob wobbles
        .add(() => { i = (i + 1) % names.length; fill(); })
        .to(card, { scaleX: 1.05, scaleY: 0.97, borderRadius: radius(BLOB[1]), duration: 0.16, ease: 'sine.inOut' })
        .to(content, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, '<')
        // Fall back to the same spot
        .to(card, { y: 0, scaleX: 0.94, scaleY: 1.08, borderRadius: radius(BLOB[0]), duration: 0.26, ease: 'power2.in' })
        .to(shadow, { scale: 1, opacity: 0.5, duration: 0.26, ease: 'power2.in' }, '<')
        // Land: squash, a small bounce, then settle back into a card
        .to(card, { scaleX: 1.18, scaleY: 0.8, borderRadius: radius(SQUASH), duration: 0.1, ease: 'power2.out' })
        .to(card, { y: `${-p.height * 0.18}em`, scaleX: 0.97, scaleY: 1.04, duration: 0.18, ease: 'power2.out' })
        .to(card, { y: 0, duration: 0.16, ease: 'power2.in' })
        .to(card, { scaleX: 1, scaleY: 1, borderRadius: radius(BASE), duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    }
    schedule();

    k.on(card, 'click', hop);
    const pause = (on) => () => { hold = on; on ? timer?.kill() : schedule(); };
    k.on(wrap, 'pointerenter', pause(true));
    k.on(wrap, 'pointerleave', pause(false));

    return {
      destroy: () => { timer?.kill(); k.destroy(); },
      update: (key) => {
        if (key === 'auto') schedule();
        if (key === 'blob' && !busy) gsap.set(card, { borderRadius: radius(BASE) });
      },
    };
  },
};
