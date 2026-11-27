/** Crumple Note: "Discard" scrunches the note card into a paper ball and tosses it into the bin; a fresh note slides in. */
import { kit } from '../_kit.js';
import { tone } from '../_params.js';
import { pieces, shards, crumpled } from './_pieces.js';

export const meta = {
  title: 'Crumple Note',
  element: 'Content card',
  trigger: ['Click', 'Keyboard'],
  behavior: ['Sequential', 'Randomized', 'Gravity-driven', 'Event-driven'],
  effect: ['Crumpling', 'Projectile-motion', 'Tumbling', 'Bouncing'],
  purpose: ['Feedback', 'Delight', 'Continuity'],
  properties: ['Clip & mask', 'Rotation', 'Scale', 'Position', 'Color'],
  description: 'A note card you can throw away like real paper. "Discard" scrunches it from the edges into a creased ball, which is tossed in an arc into the bin; the bin bounces and a fresh note slides into its place.',
  params: [
    { key: 'creases', label: 'Creases', group: 'Shape', type: 'range', min: 2, max: 6, step: 1, unit: '', default: 4, live: true },
    { key: 'crush', label: 'Crush time', group: 'Motion', type: 'range', min: 0.2, max: 1.2, step: 0.1, unit: 's', default: 0.55, live: true },
    tone('#a07a52', 'tone', '--sp-accent', 'Note'),
  ],
};

const NOTES = [['Shopping', 'Paper, glue, string, two pencils'], ['Ideas', 'A card that folds itself into a crane'], ['Call', 'Bo about the print run, after 4'], ['Draft', 'Opening line for Friday’s talk']];

export default {
  mount(stage, p, { gsap, reducedMotion }) {
    const k = kit(stage, gsap);
    k.html(`
      <div class="sp sp-cc sp-crm">
        <div class="sp-cc__wrap">
          <article class="sp-cc__card sp-crm__card">
            <span class="sp-cc__kick"></span>
            <b class="sp-cc__title"></b>
            <span class="sp-cc__text sp-crm__lines"></span>
          </article>
          <div class="sp-cc__pieces"></div>
          <i class="sp-crm__bin"><i class="sp-crm__lid"></i></i>
        </div>
        <button type="button" class="sp-cc__btn sp-crm__btn">Discard</button>
      </div>`);
    const wrap = k.$('.sp-cc__wrap');
    const card = k.$('.sp-crm__card');
    const host = k.$('.sp-cc__pieces');
    const bin = k.$('.sp-crm__bin');
    const lid = k.$('.sp-crm__lid');
    const btn = k.$('.sp-crm__btn');
    k.fit(wrap, 0.66);
    let n = 0;
    let tl;
    const fill = () => {
      const [kick, text] = NOTES[n % NOTES.length];
      card.children[0].textContent = `Note ${n + 1} · ${kick}`;
      card.children[1].textContent = text;
    };
    fill();

    k.on(btn, 'click', () => {
      if (tl?.isActive()) return;
      const g = Math.round(p.creases);
      const bits = pieces(host, card.outerHTML, shards(g, g, n + 4, 0.7));
      gsap.set(card, { autoAlpha: 0 });
      gsap.set(host, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1 });
      n += 1;
      const els = bits.map((b) => b.el);
      tl = gsap.timeline({ onComplete: () => (host.innerHTML = '') });
      // Scrunch: the outside folds in first, the middle last
      bits.forEach((b) => {
        const far = Math.hypot(b.c[0] - 50, b.c[1] - 50) / 70;
        tl.to(b.el, { ...crumpled(b), duration: p.crush, ease: 'power3.in' }, (1 - far) * p.crush * 0.4);
      });
      tl.to(els, { scale: 0.3, duration: 0.12, ease: 'power2.in' })
        // Toss it in an arc into the bin
        .to(host, { x: '10.5em', rotation: 400, scale: 0.55, duration: 0.7, ease: 'power1.in' })
        .to(host, { keyframes: { y: ['-5em', '-5.6em', '4em'], easeEach: 'sine.inOut' }, duration: 0.7, ease: 'power2.in' }, '<')
        .to(host, { autoAlpha: 0, duration: 0.05 })
        .to(lid, { keyframes: { rotation: [-35, 10, 0] }, duration: 0.4 }, '<')
        .to(bin, { keyframes: { scaleY: [0.85, 1.06, 1], scaleX: [1.1, 0.96, 1] }, duration: 0.4 }, '<')
        // A fresh note slides in
        .add(fill)
        .fromTo(card, { autoAlpha: 0, y: '-2.5em', rotation: -4 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.6, ease: 'back.out(2)' });
      if (reducedMotion) tl.progress(1);
    });

    return () => { tl?.kill(); k.destroy(); };
  },
};
