/**Paper Fold Dropdown: the submenu unfolds strip by strip. */
import { kit } from '../_kit.js';

/** About this design: drives its card, the filters and the workbench controls. */
export const meta = {
  title: 'Paper Fold Dropdown',
  element: 'Dropdown',
  trigger: ['Hover', 'Click'],
  behavior: ['Hover-dependent', 'Cascading'],
  effect: ['Unfolding', 'Folding'],
  purpose: ['Hierarchy', 'Navigation'],
  properties: ['Rotation', 'Depth (z)', 'Opacity'],
  description: 'The submenu unfolds strip by strip, like a folded paper map dropping open. It folds back up when you leave.',
  params: [
    { key: 'trigger', label: 'Opens on', group: 'Behavior', type: 'choice', options: ['Hover', 'Click'], default: 'Hover' },
    { key: 'angle', label: 'Fold angle', group: 'Motion', type: 'range', min: 10, max: 120, step: 5, unit: '°', default: 90, live: true },
    { key: 'stagger', label: 'Stagger', group: 'Motion', type: 'range', min: 0, max: 0.2, step: 0.01, unit: 's', default: 0.07, live: true },
    { key: 'depth', label: 'Perspective', group: 'Appearance', type: 'range', min: 150, max: 1400, step: 50, unit: 'px', default: 500, css: '--sp-persp' },
  ],
};

export default {
  mount(stage, p, { gsap }) {
    const k = kit(stage, gsap);
    const onHover = p.trigger !== 'Click';
    k.html(`
      <div class="sp sp-fold">
        <nav class="sp-bar" aria-label="Specimen navigation">
          <span class="sp-logo">MM</span>
          <ul class="sp-fold__nav">
            <li><a href="#">Work</a></li>
            <li class="sp-fold__has">
              <button class="sp-fold__trigger" type="button" aria-expanded="false">Archive <em aria-hidden="true">▾</em></button>
              <ul class="sp-fold__menu">
                ${['Letters', 'Maps', 'Receipts', 'Stamps', 'Photographs'].map((l) => `<li><a href="#">${l}</a></li>`).join('')}
              </ul>
            </li>
            <li><a href="#">About</a></li>
          </ul>
        </nav>
        <p class="sp-note">${onHover ? 'Hover' : 'Click'} “Archive”</p>
      </div>`);

    const has = k.$('.sp-fold__has');
    const trigger = k.$('.sp-fold__trigger');
    const chev = trigger.querySelector('em');
    const menu = k.$('.sp-fold__menu');
    const strips = k.$$('.sp-fold__menu li');
    gsap.set(strips, { rotationX: -Number(p.angle), autoAlpha: 0 });
    let open = false;
    let timer;

    const set = (state) => {
      clearTimeout(timer);
      if (state === open) return;
      open = state;
      trigger.setAttribute('aria-expanded', String(open));
      const each = Number(p.stagger);
      gsap.killTweensOf([strips, chev]);
      gsap.to(chev, { rotation: open ? 180 : 0, duration: 0.4, ease: 'expo.out' });
      if (open) {
        menu.style.visibility = 'visible';
        gsap.fromTo(
          strips,
          { rotationX: -Number(p.angle), autoAlpha: 0 },
          { rotationX: 0, autoAlpha: 1, duration: 0.55, ease: 'back.out(1.6)', stagger: each }
        );
      } else {
        gsap.to(strips, {
          rotationX: -Number(p.angle) * 0.8,
          autoAlpha: 0,
          duration: 0.3,
          ease: 'power2.in',
          stagger: { each: each * 0.6, from: 'end' },
          onComplete: () => !open && (menu.style.visibility = 'hidden'),
        });
      }
    };

    if (onHover) {
      k.on(has, 'pointerenter', () => set(true));
      k.on(has, 'pointerleave', () => (timer = setTimeout(() => set(false), 120)));
      k.on(trigger, 'click', () => set(!open)); // touch + keyboard
    } else {
      k.on(trigger, 'click', () => set(!open));
      k.on(stage, 'pointerdown', (e) => !has.contains(e.target) && set(false));
    }
    k.on(has, 'focusout', (e) => !has.contains(e.relatedTarget) && set(false));
    k.on(stage, 'keydown', (e) => e.key === 'Escape' && set(false));
    stage.querySelectorAll('a').forEach((a) => k.on(a, 'click', (e) => e.preventDefault()));

    return () => (clearTimeout(timer), k.destroy());
  },
};
