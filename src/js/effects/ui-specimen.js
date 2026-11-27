/**
 * EFFECT — ui-specimen
 * A tiny paper mock-up of one family of interface parts, pinned to a kraft
 * plate. Each `kind` has its own markup (demo) and its own looping timeline
 * (BUILDERS). Loops only while on screen; hovering the host speeds it up.
 *
 * Kinds: navigation · controls · cards · panels · overlays · forms · media · data
 *
 * Use anywhere:
 *   <div data-effect="ui-specimen" data-effect-options='{"kind":"forms"}'>
 *     …markup from demo({ effectOptions: { kind: 'forms' } })…
 *   </div>
 *
 * Adding a kind: add an entry to MARKUP and to BUILDERS, style it in
 * src/styles/effects/ui-specimen.css.
 */

const lines = (n, cls = '') => Array.from({ length: n }, () => `<i class="${cls}"></i>`).join('');

const MARKUP = {
  navigation: () => `
    <div class="fx-nav">
      <div class="fx-nav__bar">
        <span class="fx-nav__logo">MM</span>
        <span class="fx-nav__tabs"><i>Index</i><i>Work</i><i>Lab</i><i>Info</i><b data-ui="ink"></b></span>
        <span class="fx-nav__burger" data-ui="burger"><i></i><i></i><i></i></span>
        <span class="fx-nav__menu" data-ui="menu"><i>Archive</i><i>Drawers</i><i>Contact</i></span>
      </div>
      <p class="fx-nav__crumbs">Home / Library / <b data-ui="crumb">Index</b></p>
      <div class="fx-nav__content">${lines(4)}</div>
      <div class="fx-nav__pages"><i>1</i><i>2</i><i>3</i><i>4</i><b data-ui="page"></b></div>
    </div>`,

  controls: () => `
    <div class="fx-ctl">
      <span class="fx-ctl__btn" data-ui="btn">Submit</span>
      <span class="fx-ctl__icon">♥</span>
      <span class="fx-ctl__toggle" data-ui="toggle"><b data-ui="knob"></b></span>
      <span class="fx-ctl__check"><svg viewBox="0 0 16 16"><path data-ui="tick" d="M3 8.5l3.2 3L13 4.5" /></svg></span>
      <span class="fx-ctl__radios"><i></i><i></i><i></i><b data-ui="dot"></b></span>
      <span class="fx-ctl__slider"><b data-ui="fill"></b><i data-ui="thumb"></i></span>
      <span class="fx-ctl__fab" data-ui="fab">+</span>
    </div>`,

  cards: () => `
    <div class="fx-stack">
      <div class="fx-stack__card" data-ui="card"><b>Pro</b><strong>$24</strong>${lines(3)}</div>
      <div class="fx-stack__card" data-ui="card"><span class="fx-stack__avatar"></span>${lines(2)}</div>
      <div class="fx-stack__card" data-ui="card"><span class="fx-stack__img"></span>${lines(2)}<em>Add</em></div>
    </div>`,

  panels: () => {
    const row = (n) => `
      <div class="fx-pan__row">
        <span class="fx-pan__head">Section ${n}<em data-ui="sign">+</em></span>
        <div class="fx-pan__body" data-ui="body"><div>${lines(2)}</div></div>
      </div>`;
    return `
      <div class="fx-pan">
        <div class="fx-pan__hero">${lines(2)}</div>
        <div class="fx-pan__acc">${row('01')}${row('02')}${row('03')}</div>
        <div class="fx-pan__foot">${lines(3)}</div>
        <div class="fx-pan__drawer" data-ui="drawer"><b>Drawer</b>${lines(4)}</div>
      </div>`;
  },

  overlays: () => `
    <div class="fx-ov">
      <div class="fx-ov__page">${lines(5)}</div>
      <span class="fx-ov__target"></span>
      <span class="fx-ov__tip" data-ui="tip">Tooltip</span>
      <div class="fx-ov__dim" data-ui="dim"></div>
      <div class="fx-ov__modal" data-ui="modal">
        <b>Discard this draft?</b>${lines(2)}
        <span><em>Cancel</em><em>Discard</em></span>
      </div>
      <div class="fx-ov__toast" data-ui="toast">✓ Saved to archive</div>
      <div class="fx-ov__sheet" data-ui="sheet"><span></span>${lines(2)}</div>
    </div>`,

  forms: () => `
    <div class="fx-form">
      <label class="fx-form__field">
        <small>Name</small>
        <span class="fx-form__input"><span class="fx-form__typed" data-ui="typed">Motion Maktaba</span><i class="fx-form__caret"></i></span>
      </label>
      <span class="fx-form__search"><svg viewBox="0 0 16 16"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L14 14" /></svg><span class="fx-form__typed" data-ui="query">paper tear</span></span>
      <div class="fx-form__selectwrap">
        <span class="fx-form__select">Category <em data-ui="chev">▾</em></span>
        <span class="fx-form__list" data-ui="list"><i>Kraft</i><i data-ui="opt">Cream</i><i>Ink</i></span>
      </div>
      <span class="fx-form__date"><b>Nov</b> 24</span>
      <span class="fx-form__upload"><span>upload.png</span><b data-ui="upbar"></b></span>
    </div>`,

  media: () => `
    <div class="fx-med">
      <div class="fx-med__text">
        <i class="fx-med__h" data-ui="line"></i>
        <i class="fx-med__h fx-med__h--short" data-ui="line"></i>
        <i class="fx-med__p" data-ui="line"></i>
        <i class="fx-med__p" data-ui="line"></i>
        <i class="fx-med__p fx-med__p--short" data-ui="line"></i>
        <span class="fx-med__by"><i class="fx-med__avatar" data-ui="avatar"></i><i class="fx-med__p" data-ui="line"></i></span>
      </div>
      <div class="fx-med__img" data-ui="img">
        <svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice"><circle cx="72" cy="20" r="8" /><path d="M0 70 L30 34 L50 52 L66 40 L100 70 Z" /></svg>
        <span class="fx-med__play" data-ui="play">▶</span>
      </div>
      <div class="fx-med__gallery">${lines(4).replaceAll('<i', '<i data-ui="thumb"')}</div>
    </div>`,

  data: () => `
    <div class="fx-data">
      <div class="fx-data__chart">${lines(6).replaceAll('<i', '<i data-ui="bar"')}</div>
      <div class="fx-data__side">
        <span class="fx-data__badge">Inbox <b data-ui="badge">3</b></span>
        <span class="fx-data__progress"><b data-ui="progress"></b></span>
        <span class="fx-data__loader"></span>
        <span class="fx-data__skel"><i></i><i></i></span>
      </div>
      <div class="fx-data__table">${lines(9)}</div>
      <span class="fx-data__note" data-ui="note">● New report filed</span>
    </div>`,
};

/* One looping timeline per kind. `q('name')` returns every [data-ui="name"]. */
const BUILDERS = {
  navigation(tl, q, gsap) {
    const [ink] = q('ink');
    const [page] = q('page');
    const [crumb] = q('crumb');
    const [burger] = q('burger');
    const [menu] = q('menu');
    const names = ['Index', 'Work', 'Lab', 'Info'];
    const bars = [...burger.children];
    gsap.set(menu, { autoAlpha: 0, scaleY: 0.4 });

    [1, 2, 3, 0].forEach((k, i) => {
      tl.to([ink, page], { xPercent: 100 * k, duration: 0.55 }, i ? '+=0.5' : 0).call(
        () => (crumb.textContent = names[k]),
        null,
        '<0.15'
      );
    });
    tl.to(bars[0], { y: 5, rotation: 45, duration: 0.4 }, '+=0.3')
      .to(bars[1], { scaleX: 0, duration: 0.3 }, '<')
      .to(bars[2], { y: -5, rotation: -45, duration: 0.4 }, '<')
      .fromTo(menu, { autoAlpha: 0, scaleY: 0.4 }, { autoAlpha: 1, scaleY: 1, duration: 0.45 }, '<')
      .fromTo(menu.children, { x: -8, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.06 }, '<0.1')
      .to(bars, { y: 0, rotation: 0, scaleX: 1, duration: 0.4 }, '+=1')
      .to(menu, { autoAlpha: 0, scaleY: 0.4, duration: 0.3, ease: 'power2.in' }, '<');
  },

  controls(tl, q) {
    const [btn] = q('btn');
    const [toggle] = q('toggle');
    const [knob] = q('knob');
    const [tick] = q('tick');
    const [dot] = q('dot');
    const [fill] = q('fill');
    const [thumb] = q('thumb');
    const [fab] = q('fab');
    const off = 'rgba(17, 17, 17, 0.18)';

    tl.to(btn, { scale: 0.88, duration: 0.12, ease: 'power2.in' })
      .to(btn, { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.4)' })
      .to(knob, { xPercent: 100, duration: 0.45 }, '-=0.4')
      .to(toggle, { backgroundColor: '#111', duration: 0.3 }, '<')
      .fromTo(tick, { strokeDashoffset: 20 }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, '+=0.1')
      .to(dot, { xPercent: 100, duration: 0.4 }, '+=0.15')
      .to(dot, { xPercent: 200, duration: 0.4 }, '+=0.3')
      .fromTo(fill, { scaleX: 0.2 }, { scaleX: 0.85, duration: 1, ease: 'power2.inOut' }, '+=0.1')
      .fromTo(thumb, { left: '20%' }, { left: '85%', duration: 1, ease: 'power2.inOut' }, '<')
      .to(fab, { rotation: 135, scale: 1.12, duration: 0.55, ease: 'back.out(2)' }, '-=0.3')
      // …and back, so the loop is seamless
      .to(knob, { xPercent: 0, duration: 0.45 }, '+=1')
      .to(toggle, { backgroundColor: off, duration: 0.3 }, '<')
      .to(tick, { strokeDashoffset: 20, duration: 0.3 }, '<')
      .to(dot, { xPercent: 0, duration: 0.45 }, '<')
      .to(fill, { scaleX: 0.2, duration: 0.8, ease: 'power2.inOut' }, '<')
      .to(thumb, { left: '20%', duration: 0.8, ease: 'power2.inOut' }, '<')
      .to(fab, { rotation: 0, scale: 1, duration: 0.5 }, '<');
  },

  cards(tl, q) {
    const cards = q('card'); // back → front
    const rest = { xPercent: 0, y: 0, rotation: (i) => [-6, 4, 0][i] };

    tl.fromTo(
      cards,
      rest,
      {
        xPercent: (i) => [-62, 62, 0][i],
        y: (i) => [14, 14, 0][i],
        rotation: (i) => [-10, 10, 0][i],
        duration: 0.9,
        stagger: 0.05,
      }
    )
      .to(cards[2], { y: -16, scale: 1.07, duration: 0.5 }, '+=0.4')
      .to(cards[2], { y: 0, scale: 1, duration: 0.5 }, '+=0.7')
      .to(cards, { ...rest, duration: 0.8, ease: 'power3.inOut' }, '+=0.3');
  },

  panels(tl, q, gsap) {
    const bodies = q('body');
    const signs = q('sign');
    const [drawer] = q('drawer');
    gsap.set(bodies, { height: 0 });
    gsap.set(drawer, { xPercent: -110, autoAlpha: 1 });

    bodies.forEach((body, i) => {
      tl.to(body, { height: 'auto', duration: 0.55, ease: 'power3.out' }, i ? '+=0.6' : 0).to(
        signs[i],
        { rotation: 45, duration: 0.4 },
        '<'
      );
      if (i) {
        tl.to(bodies[i - 1], { height: 0, duration: 0.45, ease: 'power3.inOut' }, '<').to(
          signs[i - 1],
          { rotation: 0, duration: 0.4 },
          '<'
        );
      }
    });
    tl.to(bodies.at(-1), { height: 0, duration: 0.45, ease: 'power3.inOut' }, '+=0.6')
      .to(signs.at(-1), { rotation: 0, duration: 0.4 }, '<')
      .to(drawer, { xPercent: 0, duration: 0.7 }, '+=0.1')
      .to(drawer, { xPercent: -110, duration: 0.55, ease: 'power3.in' }, '+=1.1');
  },

  overlays(tl, q, gsap) {
    const [tip] = q('tip');
    const [dim] = q('dim');
    const [modal] = q('modal');
    const [toast] = q('toast');
    const [sheet] = q('sheet');
    gsap.set([tip, dim, modal, toast], { autoAlpha: 0 });
    gsap.set(sheet, { yPercent: 115, autoAlpha: 1 });

    tl.fromTo(tip, { autoAlpha: 0, y: 6, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' })
      .to(tip, { autoAlpha: 0, duration: 0.25 }, '+=0.9')
      .to(dim, { autoAlpha: 1, duration: 0.35, ease: 'power1.out' }, '+=0.2')
      .fromTo(
        modal,
        { autoAlpha: 0, scale: 0.85, y: 12 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.6)' },
        '<0.05'
      )
      .to(modal, { autoAlpha: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' }, '+=1.1')
      .to(dim, { autoAlpha: 0, duration: 0.3 }, '<')
      .fromTo(toast, { autoAlpha: 0, yPercent: 120 }, { autoAlpha: 1, yPercent: 0, duration: 0.5 }, '+=0.1')
      .to(toast, { autoAlpha: 0, yPercent: 120, duration: 0.35, ease: 'power2.in' }, '+=1')
      .to(sheet, { yPercent: 0, duration: 0.6 }, '+=0.1')
      .to(sheet, { yPercent: 115, duration: 0.45, ease: 'power3.in' }, '+=1');
  },

  forms(tl, q, gsap) {
    const [typed] = q('typed');
    const [query] = q('query');
    const [chev] = q('chev');
    const [list] = q('list');
    const [opt] = q('opt');
    const [up] = q('upbar');
    gsap.set(list, { autoAlpha: 0, scaleY: 0.6 });

    tl.fromTo(typed, { width: 0 }, { width: () => typed.scrollWidth, duration: 1.1, ease: 'steps(14)' })
      .fromTo(query, { width: 0 }, { width: () => query.scrollWidth, duration: 0.7, ease: 'steps(10)' }, '+=0.2')
      .to(chev, { rotation: 180, duration: 0.35 }, '+=0.3')
      .to(list, { autoAlpha: 1, scaleY: 1, duration: 0.4 }, '<')
      .fromTo(
        opt,
        { backgroundColor: 'rgba(160, 122, 82, 0)' },
        { backgroundColor: 'rgba(160, 122, 82, 0.4)', duration: 0.25 },
        '+=0.3'
      )
      .to(list, { autoAlpha: 0, scaleY: 0.6, duration: 0.3, ease: 'power2.in' }, '+=0.4')
      .to(chev, { rotation: 0, duration: 0.3 }, '<')
      .fromTo(up, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.inOut' }, '+=0.1')
      .to([typed, query], { width: 0, duration: 0.4, ease: 'steps(6)' }, '+=1')
      .to(up, { scaleX: 0, duration: 0.3 }, '<');
  },

  media(tl, q) {
    const textLines = q('line');
    const [img] = q('img');
    const [play] = q('play');
    const [avatar] = q('avatar');
    const thumbs = q('thumb');

    tl.set([...textLines, img, avatar], { autoAlpha: 1 }, 0)
      .fromTo(textLines, { scaleX: 0 }, { scaleX: 1, duration: 0.7, stagger: 0.09 }, 0)
      .fromTo(
        img,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'expo.inOut' },
        0.15
      )
      .fromTo(play, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.2')
      .fromTo(avatar, { scale: 0 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, '<')
      .fromTo(thumbs, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.07 }, '<')
      .to([...textLines, img, play, avatar, ...thumbs], { autoAlpha: 0, duration: 0.4, ease: 'power1.in' }, '+=1.6');
  },

  data(tl, q, gsap) {
    const bars = q('bar');
    const [progress] = q('progress');
    const [badge] = q('badge');
    const [note] = q('note');
    const H = [0.45, 0.7, 0.35, 0.9, 0.6, 0.8];
    gsap.set(note, { autoAlpha: 0 });

    tl.fromTo(bars, { scaleY: 0.05 }, { scaleY: (i) => H[i % H.length], duration: 0.9, stagger: 0.07 })
      .fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0.2)
      .call(() => (badge.textContent = '3'), null, 0)
      .call(() => (badge.textContent = '4'), null, 1.3)
      .fromTo(badge, { scale: 1 }, { scale: 1.4, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' }, 1.3)
      .fromTo(note, { autoAlpha: 0, xPercent: 110 }, { autoAlpha: 1, xPercent: 0, duration: 0.55 }, '+=0.1')
      .to(note, { autoAlpha: 0, xPercent: 110, duration: 0.4, ease: 'power2.in' }, '+=1.2')
      .to(bars, { scaleY: 0.05, duration: 0.5, stagger: 0.04, ease: 'power2.in' }, '<')
      .to(progress, { scaleX: 0, duration: 0.4 }, '<');
  },
};

export const demo = (card = {}) => {
  const kind = card.effectOptions?.kind;
  const body = MARKUP[kind]?.() ?? '';
  return `
    <div class="fx-ui fx-ui--${kind}">
      <div class="fx-ui__screen">
        <div class="fx-ui__chrome"><i></i><i></i><i></i><span>${kind}.html</span></div>
        <div class="fx-ui__body">${body}</div>
      </div>
    </div>`;
};

export default {
  name: 'ui-specimen',

  init(el, options, { gsap, ScrollTrigger, reducedMotion, lite }) {
    const build = BUILDERS[options.kind];
    if (!build || reducedMotion) return;

    const q = (name) => [...el.querySelectorAll(`[data-ui="${name}"]`)];
    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: options.pause ?? 0.6,
      paused: true,
      defaults: { duration: 0.6, ease: 'expo.out' },
    });
    build(tl, q, gsap);

    // Only run while well in view (not the moment one edge peeks in), so at most one or two
    // demos play at a time; on lite devices only the one near the middle of the screen.
    const st = ScrollTrigger.create({
      trigger: el,
      start: lite ? 'top 70%' : 'top 85%',
      end: lite ? 'bottom 30%' : 'bottom 15%',
      onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
    });

    const host = el.closest('[data-effect-host]') || el;
    const fast = () => gsap.to(tl, { timeScale: 1.8, duration: 0.4 });
    const slow = () => gsap.to(tl, { timeScale: 1, duration: 0.6 });
    host.addEventListener('pointerenter', fast);
    host.addEventListener('pointerleave', slow);

    return () => {
      host.removeEventListener('pointerenter', fast);
      host.removeEventListener('pointerleave', slow);
      st.kill();
      tl.kill();
    };
  },
};
