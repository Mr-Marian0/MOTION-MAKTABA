/** Print Rebuild: a product card rebuilt layer by layer from the bottom, like a 3D printer: the nozzle sweeps each row back and forth, then the layer lines smooth away. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';

export const meta = {
  title: 'Print Rebuild',
  element: 'Product card',
  trigger: ['In view', 'Click'],
  behavior: ['Sequential', 'Alternating', 'Scroll-triggered', 'Time-driven'],
  effect: ['Reconstructing', 'Scanning', 'Rising'],
  purpose: ['Storytelling', 'Progress', 'Delight'],
  properties: ['Clip & mask', 'Position', 'Opacity'],
  description: 'A product card that rebuilds itself like a 3D print. A nozzle sweeps back and forth, laying the card down one row at a time from the bottom over a dashed plan; when it reaches the top the layer lines smooth away and the shadow drops in.',
  params: [
    { key: 'rows', label: 'Layers', group: 'Shape', type: 'range', min: 6, max: 24, step: 1, unit: '', default: 14, live: true },
    { key: 'rate', label: 'Layers per second', group: 'Motion', type: 'range', min: 2, max: 20, step: 1, unit: '', default: 7, live: true },
    tone('#4f6b4a'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-prn">
        <div class="sp-cc__wrap">
          <i class="sp-prn__plan"></i>
          <article class="sp-cc__card sp-prn__card">
            <i class="sp-cc__img sp-prn__img"><i></i></i>
            <b class="sp-cc__title">Ridge Vase</b>
            <span class="sp-cc__text">Printed to order · plant fibre</span>
            <div class="sp-cc__row"><b class="sp-cc__price">$36</b><span class="sp-cc__btn">Add</span></div>
            <i class="sp-prn__lines"></i>
          </article>
          <i class="sp-prn__head"><i></i></i>
        </div>
        <button type="button" class="sp-cc__btn sp-cc__btn--ghost sp-prn__btn">Reprint</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-prn__card');
    const head = k.$('.sp-prn__head');
    const lines = k.$('.sp-prn__lines');
    k.fit(wrap, 0.8);
    const job = k.track({ v: 0 });
    let tl;

    const draw = () => {
      const n = Math.round(p.rows);
      const h = 100 / n;
      const r = Math.min(Math.floor(job.v), n - 1);
      const f = Math.min(job.v - r, 1);
      const yb = 100 - r * h;
      const yt = yb - h;
      const ltr = r % 2 === 0;
      const xh = ltr ? f * 100 : 100 - f * 100;
      const pts = ltr
        ? [[0, yt], [xh, yt], [xh, yb], [100, yb], [100, 100], [0, 100]]
        : [[xh, yt], [100, yt], [100, 100], [0, 100], [0, yb], [xh, yb]];
      card.style.clipPath = `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(',')})`;
      head.style.left = `${xh}%`;
      head.style.top = `${yt}%`;
    };

    const print = () => {
      tl?.kill();
      const n = Math.round(p.rows);
      job.v = 0;
      gsap.set(card, { boxShadow: 'none' });
      gsap.set([lines, head], { autoAlpha: 1 });
      draw();
      if (reducedMotion) job.v = n;
      tl = gsap.timeline()
        .to(job, { v: n, duration: reducedMotion ? 0 : n / p.rate, ease: 'none', onUpdate: draw })
        .add(() => (card.style.clipPath = ''))
        .to(head, { autoAlpha: 0, y: '-2em', duration: 0.4 })
        .to(lines, { autoAlpha: 0, duration: 0.6 }, '<')
        .set(head, { y: 0 })
        .to(card, { boxShadow: '0.25em 0.25em 0 #111', duration: 0.3, clearProps: 'boxShadow' }, '<0.3');
    };

    k.inView(wrap, () => !tl?.isActive() && job.v === 0 && print());
    k.on(k.$('.sp-prn__btn'), 'click', print);
    gsap.set(head, { autoAlpha: 0 });
    card.style.clipPath = 'inset(100% 0 0 0)';

    return () => { tl?.kill(); k.destroy(); };
  },
};
