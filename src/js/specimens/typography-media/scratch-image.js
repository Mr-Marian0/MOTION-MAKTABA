/** Scratch Image: a mystery photo under a silver scratch-off coat: drag across it (or press "Scratch") and the coating scrapes away where you go, flakes curling off, until enough is cleared and the rest falls away. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { photo } from './_tm.js';

export const meta = {
  title: 'Scratch Image',
  element: 'Image',
  trigger: ['Drag', 'Click', 'Keyboard'],
  behavior: ['Draggable', 'Position-aware', 'Conditional'],
  effect: ['Scraping', 'Scattering', 'Dissolving'],
  purpose: ['Delight', 'Storytelling', 'Affordance'],
  properties: ['Clip & mask', 'Opacity'],
  description: 'A "this week\'s print" reveal on a scratch card. The picture is hidden under a silver coat; drag across it and the coat scrapes off along your path, little flakes flicking away from the edge of the scratch. Once about half is cleared, the rest of the coating crumbles away on its own. Keyboard users can press "Scratch for me". "Recoat" starts again.',
  params: [
    { key: 'brush', label: 'Scraper', group: 'Shape', type: 'range', min: 0.8, max: 3, step: 0.1, unit: 'em', default: 1.6, live: true },
    { key: 'reveal', label: 'Clears at', group: 'Behavior', type: 'range', min: 20, max: 80, step: 5, unit: '%', default: 50, live: true },
    tone('#9aa0a6', 'tone', '--sp-accent', 'Coat'),
  ],
};

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-tm sp-scx">
        <div class="sp-tm__frame sp-scx__card" role="img" aria-label="Scratch card hiding this week's print">${photo(2, 'sp-scx__img')}<canvas class="sp-scx__coat" aria-hidden="true"></canvas><span class="sp-scx__flakes" aria-hidden="true"></span></div>
        <div class="sp-scx__bar"><button type="button" class="sp-tm__btn">Scratch for me</button><button type="button" class="sp-tm__btn sp-tm__btn--ghost">Recoat</button></div>
      </div>`);
    const card = k.$('.sp-scx__card');
    const cv = k.$('canvas');
    const ctx = cv.getContext('2d', { willReadFrequently: true }); // we sample it after every stroke
    const flakes = k.$('.sp-scx__flakes');
    const [auto, recoat] = k.$$('.sp-scx__bar button');
    let W = 1, H = 1, E = 14, cleared = false, coatColour = '#9aa0a6';
    const coat = () => {
      cleared = false;
      gsap.set(cv, { autoAlpha: 1 });
      ctx.globalCompositeOperation = 'source-over';
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, coatColour); g.addColorStop(0.5, '#e4e7ea'); g.addColorStop(1, coatColour);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#5b6066';
      ctx.font = `${E}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText('SCRATCH HERE', W / 2, H / 2 + E / 3);
      card.setAttribute('aria-label', "Scratch card hiding this week's print");
    };
    k.resize(card, () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      W = card.clientWidth; H = card.clientHeight;
      E = parseFloat(getComputedStyle(card).fontSize) || 14;
      coatColour = getComputedStyle(card).getPropertyValue('--sp-accent').trim() || coatColour;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      coat();
    });
    // How much is cleared: sampled on a coarse grid, only when a stroke ends (not per move)
    const clearedShare = () => {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, n = 0;
      for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] < 20) clear++; }
      return clear / n;
    };
    const finish = () => {
      if (cleared) return;
      cleared = true;
      card.setAttribute('aria-label', "This week's print: fern valley");
      gsap.to(cv, { autoAlpha: 0, duration: reducedMotion ? 0 : 0.6 });
    };
    const flake = (x, y) => {
      if (reducedMotion || Math.random() > 0.35) return;
      const f = document.createElement('i');
      flakes.append(f);
      gsap.fromTo(f, { x, y, rotation: 0 }, { x: x + (Math.random() - 0.5) * 40, y: y - 10 - Math.random() * 20, rotation: (Math.random() - 0.5) * 400, autoAlpha: 0, duration: 0.6, ease: 'power2.out', onComplete: () => f.remove() });
    };
    let last = null, box;
    const scrape = (x, y) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineWidth = p.brush * E;
      ctx.beginPath();
      ctx.moveTo(...(last || [x, y]));
      ctx.lineTo(x, y);
      ctx.stroke();
      last = [x, y];
      flake(x, y);
    };
    k.on(card, 'pointerdown', (e) => { if (cleared) return; card.setPointerCapture(e.pointerId); box = card.getBoundingClientRect(); last = null; scrape(e.clientX - box.left, e.clientY - box.top); });
    k.on(card, 'pointermove', (e) => box && scrape(e.clientX - box.left, e.clientY - box.top));
    const end = () => { if (!box) return; box = null; if (clearedShare() * 100 >= p.reveal) finish(); };
    k.on(card, 'pointerup', end);
    k.on(card, 'pointercancel', end);
    k.on(auto, 'click', () => {
      if (cleared) return;
      if (reducedMotion) return finish();
      // a zig-zag pass across the card
      const s = { u: 0 };
      last = null;
      gsap.to(s, { u: 1, duration: 1.4, ease: 'none', onUpdate: () => scrape(s.u * W, H * (0.5 + 0.38 * Math.sin(s.u * Math.PI * 7))), onComplete: finish });
    });
    k.on(recoat, 'click', coat);
    return () => k.destroy();
  },
};
