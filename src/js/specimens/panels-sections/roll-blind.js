/** Roll Blind: a top drawer that closes by wrapping itself around a roller, like a window blind; the roller fattens with every turn. Pull the cord to unroll it. */
import { kit, bars } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Roll Blind',
  element: 'Drawer',
  trigger: ['Click', 'Drag', 'Keyboard'],
  behavior: ['Toggle-dependent', 'Draggable', 'Reversible', 'Snapping'],
  effect: ['Wrapping', 'Unwrapping', 'Rolling'],
  purpose: ['Hierarchy', 'Delight', 'Affordance'],
  properties: ['Clip & mask', 'Position', 'Size'],
  description: 'A notice drawer hanging from the top of the page like a window blind. Close it and the sheet wraps itself around a roller as it rises, the roller fattening with each turn; pull the cord (or drag it) and it unrolls back down.',
  params: [
    { key: 'time', label: 'Roll time', group: 'Motion', type: 'range', min: 0.4, max: 2, step: 0.1, unit: 's', default: 0.9, live: true },
    { key: 'fat', label: 'Roller growth', group: 'Shape', type: 'range', min: 0, max: 1.5, step: 0.1, unit: '×', default: 0.8, live: true },
    tone('#2f4a6b', 'tone', '--sp-accent', 'Blind'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-pn sp-rbl">
        <div class="sp-pn__page sp-rbl__page"><span class="sp-pn__kick">Shop</span><b class="sp-pn__h">Winter paper</b>${bars(6)}</div>
        <div class="sp-rbl__blind">
          <div class="sp-rbl__sheet"><div class="sp-rbl__content">
            <span class="sp-pn__kick">Notice</span><b class="sp-rbl__title">Studio closed 24–26 Dec</b>
            <span class="sp-rbl__text">Orders placed now ship on the 27th. Happy holidays!</span>
          </div></div>
          <i class="sp-rbl__roller"></i>
          <button type="button" class="sp-rbl__cord" aria-expanded="true" aria-label="Roll the notice up"><i></i></button>
        </div>
      </div>`);
    const blind = k.$('.sp-rbl__blind');
    const sheet = k.$('.sp-rbl__sheet');
    const content = k.$('.sp-rbl__content');
    const roller = k.$('.sp-rbl__roller');
    const cord = k.$('.sp-rbl__cord');
    const s = k.track({ up: 0 }); // 0 = down, 1 = wrapped up

    // The sheet's visible length shrinks while its content moves up into the roller, which sits on
    // the sheet's lower edge and thickens as more paper wraps round it.
    let H = 0; // blind height in px, measured on resize (never per frame)
    const draw = () => {
      const shown = (1 - s.up) * 100;
      sheet.style.clipPath = `inset(0 0 ${100 - shown}% 0)`;
      gsap.set(content, { y: -s.up * H * 0.92 });
      gsap.set(roller, { y: (1 - s.up) * H - H, scaleY: 1 + s.up * p.fat });
      gsap.set(cord, { y: (1 - s.up) * H - H });
      sheet.style.backgroundPositionY = `${-s.up * H}px`;
    };
    const set = (up) => {
      cord.setAttribute('aria-expanded', String(!up));
      cord.setAttribute('aria-label', up ? 'Pull the notice down' : 'Roll the notice up');
      gsap.to(s, { up: up ? 1 : 0, duration: reducedMotion ? 0 : p.time, ease: up ? 'power2.inOut' : 'bounce.out', onUpdate: draw, overwrite: true });
    };
    k.resize(blind, () => ((H = blind.offsetHeight), draw()));

    // Drag the cord to roll by hand; it snaps to whichever end is nearer.
    let drag = null;
    let moved = false;
    k.on(cord, 'pointerdown', (e) => {
      cord.setPointerCapture(e.pointerId);
      drag = { y: e.clientY, up: s.up };
      moved = false;
      gsap.killTweensOf(s);
    });
    k.on(cord, 'pointermove', (e) => {
      if (!drag) return;
      if (Math.abs(e.clientY - drag.y) > 4) moved = true;
      s.up = Math.min(1, Math.max(0, drag.up - (e.clientY - drag.y) / (H || 1)));
      draw();
    });
    const drop = () => {
      if (!drag) return;
      drag = null;
      if (moved) set(s.up > 0.5);
    };
    k.on(cord, 'pointerup', drop);
    k.on(window, 'pointerup', drop);
    k.on(cord, 'click', () => !moved && set(s.up < 0.5));

    return () => k.destroy();
  },
};
