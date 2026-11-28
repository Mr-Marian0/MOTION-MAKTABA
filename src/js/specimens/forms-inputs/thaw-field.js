/** Thaw Field: a locked field sits under a skin of ice. "Edit" thaws it: the ice melts down from the top in a wavy line and drips away, and the field is yours; "Lock" freezes it over again from the edges. */
import { kit, uid } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Thaw Field',
  element: 'Text field',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Toggle-dependent', 'State-dependent', 'Reversible'],
  effect: ['Phase-change', 'Melting', 'Freezing'],
  purpose: ['Affordance', 'Feedback', 'Storytelling'],
  properties: ['Clip & mask', 'Opacity', 'Position'],
  description: 'A saved IBAN that is frozen until you mean to change it. The field is covered by frosted ice; press "Edit" and the ice melts from the top down, its lower edge wavering as it shrinks, a few drops running off the bottom, until the field is clear and focused. "Lock" freezes it over again: frost creeps in from the four edges and the field goes read-only.',
  params: [
    { key: 'time', label: 'Melt time', group: 'Motion', type: 'range', min: 0.4, max: 2.5, step: 0.1, unit: 's', default: 1.2, live: true },
    { key: 'drops', label: 'Drops', group: 'Shape', type: 'range', min: 0, max: 8, step: 1, unit: '', default: 4 },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Water'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    const id = uid('thw');
    const n = Math.round(p.drops);
    k.html(`
      <div class="sp sp-fi sp-thw">
        <div class="sp-fi__wrap">
          <label class="sp-fi__label" for="${id}">Payout account</label>
          <div class="sp-fi__box sp-thw__box">
            <input class="sp-fi__input" id="${id}" value="GB29 NWBK 6016 1331 9268 19" readonly />
            <i class="sp-thw__ice" aria-hidden="true"></i>
            ${Array.from({ length: n }, (_, i) => `<i class="sp-thw__drop" style="left:${12 + (i * 76) / Math.max(1, n - 1)}%" aria-hidden="true"></i>`).join('')}
          </div>
          <button type="button" class="sp-fi__btn sp-thw__go" aria-controls="${id}" aria-pressed="false">Edit</button>
        </div>
      </div>`);
    const input = k.$('.sp-fi__input');
    const ice = k.$('.sp-thw__ice');
    const drops = k.$$('.sp-thw__drop');
    const go = k.$('.sp-thw__go');
    // The ice is clipped to [top edge .. a wavy bottom edge at `level`]; `frost` closes it in from the sides when refreezing
    const s = k.track({ level: 1, ph: 0, frost: 0 });
    const draw = () => {
      const f = s.frost * 50;
      const edge = Array.from({ length: 13 }, (_, i) => {
        const x = (i / 12) * 100;
        const y = s.level * 100 + (s.level > 0 && s.level < 1 ? Math.sin(i * 1.3 + s.ph) * 6 : 0);
        return `${x.toFixed(1)}% ${Math.min(100, Math.max(0, y)).toFixed(1)}%`;
      }).reverse();
      ice.style.clipPath = s.frost > 0 ? `inset(${f}% ${f}% ${f}% ${f}% round 0.4em)` : `polygon(0 0, 100% 0, ${edge.join(', ')})`;
    };
    draw();
    gsap.set(drops, { autoAlpha: 0 });
    let tl;
    k.on(go, 'click', () => {
      const thaw = go.getAttribute('aria-pressed') !== 'true';
      go.setAttribute('aria-pressed', String(thaw));
      go.textContent = thaw ? 'Lock' : 'Edit';
      input.readOnly = !thaw;
      tl?.kill();
      const t = p.time;
      tl = thaw
        ? gsap.timeline({ onUpdate: draw })
            .set(s, { frost: 0 })
            .fromTo(s, { level: 1, ph: 0 }, { level: 0, ph: 9, duration: t, ease: 'power1.in' })
            .fromTo(drops, { autoAlpha: 1, y: 0, scaleY: 1 }, { y: '1.8em', scaleY: 1.6, autoAlpha: 0, duration: 0.6, ease: 'power2.in', stagger: { each: t * 0.12, from: 'random' } }, t * 0.5)
        : gsap.timeline({ onUpdate: draw })
            .set(s, { level: 1 })
            .fromTo(s, { frost: 0.5 }, { frost: 0, duration: t * 0.8, ease: 'power2.out' });
      if (reducedMotion) tl.progress(1);
      if (thaw) input.focus(), input.select();
    });
    return () => k.destroy();
  },
};
