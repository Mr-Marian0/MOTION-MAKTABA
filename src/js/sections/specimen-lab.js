/**
 * SPECIMEN LAB — the inside of a library drawer.
 *
 *   <section data-section="specimen-lab" data-category="navigation"></section>
 *
 * Reads src/js/specimens/<category>/index.js (the list of design ids), then
 * each design's <id>.js (`meta` + `mount`) and <id>.css, and builds:
 *   1. Classifier: filter chips walked in order
 *        UI Element → Interaction → Motion Effect (+ Behavior, Purpose)
 *      with live counts, a readable "path", and a searchable index of every
 *      term in the taxonomy (terms with no specimen yet are shown as unfiled).
 *   2. Grid: every specimen is live and playable right in its card.
 *      Clicking any tag on a card filters by it.
 *   3. Workbench: opens a specimen big, with controls for its properties
 *      (appearance, size, layout, motion…), Randomize and Reset, plus the
 *      code panel (JavaScript source + AI prompt, see lab-code.js).
 *      Tweaks stay on the card after closing.
 *   An empty drawer shows how to add its first design.
 *
 * Filters are mirrored in the URL (?element=Navbar&trigger=Hover), so the
 * catalog can link straight to a filtered view.
 */
import { AXES, ELEMENTS, PROPERTIES, EFFECT_GROUPS, withFamilies } from '../../data/taxonomy.js';
import { cards as drawers } from '../../data/cards.js';
import { codePanel, codePanelHTML } from './lab-code.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const pad = (n) => String(n).padStart(2, '0');
const UNIT_CSS = { px: 'px', '°': 'deg' };
const SPECIMENS = new URL('../specimens/', import.meta.url);

const valuesOf = (spec, key) => (key === 'element' ? spec.elements : spec[key] || []);
/** What a design is filed under: its own tags, plus their parent families for effects ('Squashing' → also 'Deformation'). */
const filedUnder = (spec, key) => (key === 'effect' ? withFamilies(valuesOf(spec, key)) : valuesOf(spec, key));
const defaultsOf = (spec) => Object.fromEntries(spec.params.map((p) => [p.key, p.default]));

/** Load a drawer: its index.js list, then every design module (a broken one doesn't stop the rest). */
async function loadDrawer(cat) {
  const base = new URL(`${cat}/`, SPECIMENS);
  let index;
  try {
    index = await import(new URL('index.js', base).href);
  } catch (err) {
    if (!(err instanceof TypeError)) console.warn(`[lab] ${cat}/index.js has an error`, err);
    return { specimens: [], broken: [] };
  }
  const ids = [...new Set(index.default || [])];
  const loaded = await Promise.allSettled(ids.map((id) => import(new URL(`${id}.js`, base).href)));
  const specimens = [];
  const broken = [];
  loaded.forEach((r, i) => {
    const id = ids[i];
    const meta = r.status === 'fulfilled' ? r.value.meta : null;
    if (!meta || typeof r.value.default?.mount !== 'function') {
      console.warn(`[lab] design "${id}" could not load: needs \`export const meta\` and \`export default { mount }\`.`, r.reason || '');
      broken.push(id);
      return;
    }
    specimens.push({
      trigger: [], behavior: [], effect: [], purpose: [], properties: [], params: [], description: '',
      ...meta,
      // One motion can suit several UI elements: `element` may be a name or a list of names.
      elements: [meta.element].flat().filter(Boolean),
      element: [meta.element].flat().filter(Boolean).join(' / '),
      id,
      no: `No. ${pad(i + 1)}`, // position in index.js = the N in >Element>N
      mod: r.value.default,
      files: {
        js: new URL(`${id}.js`, base).href,
        css: new URL(`${id}.css`, base).href,
        jsPath: `src/js/specimens/${cat}/${id}.js`,
        cssPath: `src/js/specimens/${cat}/${id}.css`,
      },
    });
  });
  return { specimens, broken };
}

/** Warn (console only) about terms that aren't in the taxonomy, so typos are easy to spot. */
function checkTerms(spec, cat) {
  const known = Object.fromEntries(AXES.map((a) => [a.key, a.all]));
  known.element = ELEMENTS[cat];
  known.properties = PROPERTIES;
  Object.entries(known).forEach(([key, all]) => {
    if (!all) return;
    const bad = valuesOf(spec, key).filter((t) => !all.includes(t));
    if (bad.length) console.warn(`[lab] ${spec.id}: ${key} ${bad.map((t) => `"${t}"`).join(', ')} not in src/data/taxonomy.js (check the spelling, or add the term there).`);
  });
}

/** An empty drawer: how to add its first design. */
function renderEmpty(el, cat, drawer, broken) {
  const folder = `src/js/specimens/${cat}/`;
  el.innerHTML = `
    <div class="lab-empty-drawer">
      <div class="lab-empty-drawer__sheet paper-cream">
        <i class="tape lab-empty-drawer__tape" aria-hidden="true"></i>
        <p class="folio">Drawer empty</p>
        <h2 class="lab-empty-drawer__title">Nothing filed in <em>${esc(drawer.title)}</em> yet.</h2>
        <p class="lab-empty-drawer__lede">Designs appear here, live and tweakable, as soon as you add them. Each design is just two files.</p>
        ${broken.length ? `<p class="lab-empty-drawer__warn">Listed but couldn't load: ${broken.map(esc).join(', ')}. The browser console says why.</p>` : ''}
        <ol class="lab-steps">
          <li><b>Copy</b> <code>src/js/specimens/_template.js</code> and <code>_template.css</code> into <code>${folder}</code>, renamed to your design's id, e.g. <code>my-design.js</code> + <code>my-design.css</code>.</li>
          <li><b>List it</b> by adding <code>'my-design'</code> to the end of <code>${folder}index.js</code>.</li>
          <li><b>Fill in</b> its <code>meta</code> (title, element, trigger, effect…) and <code>mount</code>, then refresh this page.</li>
        </ol>
        <p class="lab-empty-drawer__lede" style="max-width:none;margin-top:1.6rem">Or describe it to Claude Code: the rules are in <code>DESIGN-GUIDE.md</code>.</p>
      </div>
    </div>`;
}

/** Load the shared design styles + each design's own CSS, in the components layer. */
function loadStyles(specimens) {
  const urls = [new URL('_shared.css', SPECIMENS).href, ...specimens.map((s) => s.files.css)];
  const style = document.createElement('style');
  style.dataset.labStyles = '';
  style.textContent = urls.map((u) => `@import url("${u}") layer(components);`).join('\n');
  // Resolves once the imports have loaded, so designs measure themselves with their styles on.
  const ready = new Promise((res) => {
    style.onload = style.onerror = res;
    setTimeout(res, 3000);
  });
  document.head.append(style);
  return { ready, unload: () => style.remove() };
}

export default {
  name: 'specimen-lab',

  async init(el, ctx) {
    const { gsap, reducedMotion, lenis, ScrollTrigger } = ctx;
    const cat = el.dataset.category;
    const drawer = drawers.find((c) => c.category === cat) || { title: cat };

    const { specimens, broken } = await loadDrawer(cat);
    if (!specimens.length) {
      renderEmpty(el, cat, drawer, broken);
      return;
    }
    specimens.forEach((s) => checkTerms(s, cat));
    const styles = loadStyles(specimens);
    await styles.ready;

    let Flip = null;
    if (!reducedMotion) {
      try {
        ({ Flip } = await import('gsap/Flip'));
        gsap.registerPlugin(Flip);
      } catch {
        /* filtering still works, just without the shuffle */
      }
    }

    const byId = Object.fromEntries(specimens.map((s) => [s.id, s]));
    const params = Object.fromEntries(specimens.map((s) => [s.id, defaultsOf(s)]));
    const cards = {}; // id → mounted instance in its card
    const offs = [];
    const on = (t, type, fn, o) => (t.addEventListener(type, fn, o), offs.push(() => t.removeEventListener(type, fn, o)));

    // ---- Which terms each axis offers ----
    const termsFor = (axis) => {
      if (axis.key === 'element') return ELEMENTS[cat] || [...new Set(specimens.flatMap((s) => s.elements))];
      const used = new Set(specimens.flatMap((s) => filedUnder(s, axis.key)));
      const ordered = (axis.all || []).filter((t) => used.has(t));
      return [...ordered, ...[...used].filter((t) => !ordered.includes(t))];
    };
    const filters = Object.fromEntries(AXES.map((a) => [a.key, null]));
    const query = new URLSearchParams(location.search);
    AXES.forEach((a) => {
      const v = query.get(a.key);
      if (v && termsFor(a).includes(v)) filters[a.key] = v;
    });
    const matches = (spec, except) =>
      AXES.every((a) => a.key === except || !filters[a.key] || filedUnder(spec, a.key).includes(filters[a.key]));

    // ---- Markup ----
    const tagRow = (spec, key, label) => {
      const list = valuesOf(spec, key);
      return `<div><dt>${label}</dt><dd>${
        list.length
          ? list.map((t) => `<button type="button" class="spec__tag spec__tag--${key}" data-axis="${key}" data-term="${esc(t)}">${esc(t)}</button>`).join('')
          : `<em>none</em>`
      }</dd></div>`;
    };
    // Card header: the main motion effects lead; the UI elements it suits sit on the right.
    const headLinks = (list, key) =>
      list.map((t) => `<button type="button" class="spec__el spec__el--${key}" data-axis="${key}" data-term="${esc(t)}">${esc(t)}</button>`).join(' / ');
    const cardHTML = (s) => `
      <li class="spec" data-id="${s.id}">
        <article class="spec__card" aria-labelledby="spec-${s.id}">
          <header class="spec__head folio">
            <span>${esc(s.no)} · ${headLinks(s.effect.slice(0, 2), 'effect') || 'no motion effect'}</span>
            <span>${headLinks(s.elements, 'element')}</span>
          </header>
          <div class="spec__stage lab-stage" data-stage></div>
          <div class="spec__body">
            <h3 class="spec__title" id="spec-${s.id}">${esc(s.title)}</h3>
            <p class="spec__desc">${esc(s.description)}</p>
            <dl class="spec__tags">
              ${tagRow(s, 'effect', 'Effect')}
              ${tagRow(s, 'trigger', 'Trigger')}
              ${tagRow(s, 'behavior', 'Behavior')}
            </dl>
            <button type="button" class="spec__open" data-open="${s.id}">Tweak on the workbench <i aria-hidden="true">→</i></button>
          </div>
        </article>
      </li>`;
    const indexTerm = (a, t) => (termsFor(a).includes(t)
      ? `<button type="button" class="lab-index__term is-filed" data-axis="${a.key}" data-term="${esc(t)}">${esc(t)}</button>`
      : `<span class="lab-index__term" title="Nothing filed under this yet">${esc(t)}</span>`);
    const axisHTML = (a) => `
      <fieldset class="lab-axis lab-axis--${a.key}" data-axis-box="${a.key}">
        <legend>
          <span class="lab-axis__step">${a.step}</span>
          <span class="lab-axis__label">${a.label}</span>
          <small>${a.hint}</small>
        </legend>
        <div class="lab-chips" data-chips="${a.key}"></div>
        ${a.all ? `
          <details class="lab-index">
            <summary>Browse all ${a.all.length} ${a.label.toLowerCase()} terms</summary>
            <input type="search" class="lab-index__search" placeholder="Search ${a.label.toLowerCase()}…" data-search="${a.key}" aria-label="Search ${a.label} terms" />
            <div class="lab-index__list ${a.key === 'effect' ? 'lab-index__list--grouped' : ''}" data-index="${a.key}">
              ${a.key === 'effect'
                ? EFFECT_GROUPS.map((g) => `
                    <div class="lab-index__group" data-group>
                      <h4 class="lab-index__group-name">${esc(g.parent)}</h4>
                      <div class="lab-index__group-terms">${g.terms.map((t) => indexTerm(a, t)).join('')}</div>
                    </div>`).join('')
                : a.all.map((t) => indexTerm(a, t)).join('')}
            </div>
          </details>` : ''}
      </fieldset>`;

    el.innerHTML = `
      <div class="lab">
        <aside class="lab__filters" aria-label="Classify the specimens" data-lenis-prevent>
          <p class="lab__kicker folio">Classify the drawer</p>
          <ol class="lab-path" data-path aria-live="polite"></ol>
          ${AXES.map(axisHTML).join('')}
          <aside class="lab-rule">
            <b>House rule</b>
            Behavior and motion effect can be combined, but not every behavior needs a motion effect, and not every
            motion effect needs a behavior.
          </aside>
          <button type="button" class="lab-reset" data-reset>Clear all filters</button>
        </aside>

        <div class="lab__main">
          <div class="lab__bar">
            <p class="folio" data-count></p>
            <p class="lab__hint">Every specimen is live: play with it right here, or open it on the workbench to change it.</p>
          </div>
          <ul class="lab__grid" data-grid>${specimens.map(cardHTML).join('')}</ul>
          <div class="lab__empty" data-empty hidden>
            <p class="lab__empty-title">Nothing filed here yet.</p>
            <p>No specimen matches this combination. Loosen a filter, or note it down as one to build.</p>
            <button type="button" class="sp-btn" data-reset>Clear all filters</button>
          </div>
        </div>
      </div>

      <div class="bench" data-bench hidden role="dialog" aria-modal="true" aria-labelledby="bench-title">
        <div class="bench__backdrop" data-close></div>
        <div class="bench__sheet paper-cream tear-edge--top tear-v3" data-lenis-prevent>
          <header class="bench__head">
            <p class="folio" data-bench-code></p>
            <h2 class="bench__title" id="bench-title"></h2>
            <button type="button" class="bench__close" data-close aria-label="Close the workbench">✕</button>
          </header>
          <div class="bench__body">
            <div class="bench__left">
              <div class="bench__stage lab-stage" data-bench-stage></div>
              <p class="bench__path" data-bench-path></p>
              ${codePanelHTML}
            </div>
            <form class="bench__controls" data-controls></form>
          </div>
        </div>
      </div>`;

    const $ = (s) => el.querySelector(s);
    const grid = $('[data-grid]');
    const bench = $('[data-bench]');
    const sheet = $('.bench__sheet');
    const benchStage = $('[data-bench-stage]');
    const controls = $('[data-controls]');
    const code = codePanel($('[data-code]'));

    // ---- Mounting specimens ----
    const applyCss = (stage, spec) =>
      spec.params.forEach((p) => p.css && stage.style.setProperty(p.css, `${params[spec.id][p.key]}${UNIT_CSS[p.unit] || ''}`));
    const mountInto = async (stage, spec) => {
      applyCss(stage, spec);
      const out = spec.mod.mount(stage, params[spec.id], ctx);
      return typeof out === 'function' ? { destroy: out } : out;
    };
    const mountCard = async (id) => {
      cards[id]?.destroy();
      const stage = grid.querySelector(`[data-id="${id}"] [data-stage]`);
      try {
        cards[id] = await mountInto(stage, byId[id]);
      } catch (err) {
        console.warn(`[lab] specimen "${id}" failed to mount`, err);
        stage.innerHTML = `<p class="sp-note">This specimen is still in the press.</p>`;
      }
    };
    // Mount each card's specimen the first time it nears the viewport.
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          mountCard(e.target.dataset.id);
        }),
      { rootMargin: '300px 0px' }
    );
    grid.querySelectorAll('.spec').forEach((li) => io.observe(li));

    // ---- Classifier ----
    const renderChips = () => {
      AXES.forEach((a) => {
        const box = el.querySelector(`[data-chips="${a.key}"]`);
        box.innerHTML = termsFor(a)
          .map((t) => {
            const total = specimens.filter((s) => filedUnder(s, a.key).includes(t)).length;
            const n = specimens.filter((s) => matches(s, a.key) && filedUnder(s, a.key).includes(t)).length;
            const on = filters[a.key] === t;
            return `<button type="button" class="lab-chip" data-axis="${a.key}" data-term="${esc(t)}" aria-pressed="${on}"
                      ${!n && !on ? 'data-dim' : ''} ${!total ? 'disabled' : ''}>${esc(t)}<sup>${total ? n : 'soon'}</sup></button>`;
          })
          .join('');
      });
    };
    const renderPath = (changed) => {
      const step = (a) => `<li class="lab-path__step ${filters[a.key] ? 'is-set' : ''}" data-step="${a.key}">
          <small>${a.label}</small><b>${esc(filters[a.key] || 'Any')}</b></li>`;
      const core = AXES.slice(0, 3).map(step).join('<li class="lab-path__arrow" aria-hidden="true">→</li>');
      const extra = AXES.slice(3).filter((a) => filters[a.key]).map(step).join('');
      $('[data-path]').innerHTML = core + extra;
      if (changed && !reducedMotion) {
        const b = el.querySelector(`[data-step="${changed}"] b`);
        b && gsap.from(b, { yPercent: 80, opacity: 0, duration: 0.5, ease: 'expo.out' });
      }
    };
    const syncURL = () => {
      const q = new URLSearchParams();
      AXES.forEach((a) => filters[a.key] && q.set(a.key, filters[a.key]));
      const s = q.toString();
      history.replaceState(history.state, '', s ? `?${s}${location.hash}` : location.pathname + location.hash);
    };

    let flipTween = null;
    const apply = (changed) => {
      const items = [...grid.children];
      flipTween?.progress(1); // finish any running shuffle before measuring again
      const state = Flip && changed !== undefined && !reducedMotion ? Flip.getState(items) : null;
      // Hold the grid's height while the cards shuffle, so the page doesn't
      // shrink, jump up and let moving cards slide over the header.
      if (state) grid.style.minHeight = `${grid.offsetHeight}px`;
      let shown = 0;
      items.forEach((li) => {
        const ok = matches(byId[li.dataset.id]);
        li.hidden = !ok;
        if (ok) shown++;
      });
      $('[data-empty]').hidden = shown > 0;
      $('[data-count]').textContent = `${pad(shown)} of ${pad(specimens.length)} specimens`;
      renderChips();
      renderPath(changed);
      syncURL();
      if (state) {
        // Position only: tweening width/height made cards visibly stretch
        // (bottom edge growing, then snapping back) as they changed rows.
        // Each card takes its final size at once and just slides into place.
        const done = () => {
          grid.style.minHeight = '';
          flipTween = null;
          ScrollTrigger.refresh();
        };
        const moved = [];
        const entered = [];
        items.forEach((li) => {
          if (li.hidden) return;
          const prev = state.getElementState(li);
          if (!prev || !prev.isVisible) return entered.push(li);
          const r = li.getBoundingClientRect();
          const dx = prev.left - r.left;
          const dy = prev.top - r.top;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) moved.push({ li, dx, dy });
        });
        flipTween = gsap.timeline({ onComplete: done });
        moved.forEach(({ li, dx, dy }) =>
          flipTween.fromTo(li, { x: dx, y: dy }, { x: 0, y: 0, duration: 0.7, ease: 'expo.out', clearProps: 'transform' }, 0)
        );
        if (entered.length)
          flipTween.fromTo(
            entered,
            { opacity: 0, y: 60, rotation: () => gsap.utils.random(-5, 5) },
            { opacity: 1, y: 0, rotation: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, clearProps: 'transform,opacity' },
            0
          );
      } else {
        grid.style.minHeight = '';
        ScrollTrigger.refresh();
      }
    };

    const setFilter = (key, term) => {
      filters[key] = filters[key] === term ? null : term;
      apply(key);
    };

    on(el, 'click', (e) => {
      const t = e.target.closest('[data-axis][data-term]');
      if (t && !t.disabled) {
        setFilter(t.dataset.axis, t.dataset.term);
        if (t.closest('.spec')) $('.lab__filters').scrollIntoView?.({ block: 'nearest' });
        return;
      }
      if (e.target.closest('[data-reset]')) {
        AXES.forEach((a) => (filters[a.key] = null));
        apply(null);
        // Back to the top of the drawer's content.
        const target = el.closest('.library-content') || el;
        if (lenis) lenis.scrollTo(target, { duration: reducedMotion ? 0 : 1.1 });
        else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        return;
      }
      const open = e.target.closest('[data-open]');
      if (open) openBench(open.dataset.open, open);
    });
    on(el, 'input', (e) => {
      const box = e.target.closest('[data-search]');
      if (!box) return;
      const q = box.value.trim().toLowerCase();
      const list = el.querySelector(`[data-index="${box.dataset.search}"]`);
      list.querySelectorAll('.lab-index__term').forEach((t) => {
        t.hidden = q && !t.textContent.toLowerCase().includes(q);
      });
      // Hide a family heading once none of its terms match.
      list.querySelectorAll('[data-group]').forEach((g) => {
        g.hidden = !g.querySelector('.lab-index__term:not([hidden])');
      });
    });

    // ---- Workbench ----
    let current = null; // spec on the bench
    let benchInst = null;
    let opener = null;
    let remountTimer;
    const variantOf = {}; // id → variant name picked on the workbench

    const fmt = (p, v) => `${Number.isInteger(p.step) || p.step >= 1 ? v : Number(v).toFixed(2)}${p.unit || ''}`;
    const control = (p, v) => {
      switch (p.type) {
        case 'range':
          return `<label class="ctl ctl--range"><span class="ctl__label">${esc(p.label)}<output>${fmt(p, v)}</output></span>
                    <input type="range" data-key="${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${v}" /></label>`;
        case 'swatch':
          return `<div class="ctl ctl--swatch"><span class="ctl__label" id="lbl-${p.key}">${esc(p.label)}</span>
                    <div class="ctl__options" role="radiogroup" aria-labelledby="lbl-${p.key}">
                      ${p.options.map((o) => `<button type="button" role="radio" data-key="${p.key}" data-value="${o.value}" aria-checked="${o.value === v}" aria-label="${esc(o.label)}" title="${esc(o.label)}" style="--c:${o.value}"></button>`).join('')}
                    </div></div>`;
        case 'choice':
          return `<div class="ctl ctl--choice"><span class="ctl__label" id="lbl-${p.key}">${esc(p.label)}</span>
                    <div class="ctl__options" role="radiogroup" aria-labelledby="lbl-${p.key}">
                      ${p.options.map((o) => `<button type="button" role="radio" data-key="${p.key}" data-value="${esc(o)}" aria-checked="${o === v}">${esc(o)}</button>`).join('')}
                    </div></div>`;
        case 'toggle':
          return `<button type="button" class="ctl ctl--toggle" role="switch" data-key="${p.key}" aria-checked="${Boolean(v)}">
                    <span class="ctl__label">${esc(p.label)}</span><i aria-hidden="true"></i></button>`;
        case 'text':
          return `<label class="ctl ctl--text"><span class="ctl__label">${esc(p.label)} <small>comma separated</small></span>
                    <input type="text" data-key="${p.key}" value="${esc(v)}" spellcheck="false" /></label>`;
        default:
          return '';
      }
    };
    const metaRow = (label, list) =>
      `<div><dt>${label}</dt><dd>${list.length ? list.map(esc).join(' · ') : '<em>none</em>'}</dd></div>`;
    const renderControls = () => {
      const spec = current;
      const groups = [...new Set(spec.params.map((p) => p.group))];
      const names = Object.keys(spec.variants || {});
      controls.innerHTML = `
        <div class="bench__tools">
          <button type="button" class="sp-btn" data-random>⚄ Randomize</button>
          <button type="button" class="sp-btn sp-btn--ghost" data-defaults>↺ Reset</button>
        </div>
        ${names.length ? `
          <div class="ctl ctl--choice"><span class="ctl__label" id="lbl-variant">Variant</span>
            <div class="ctl__options" role="radiogroup" aria-labelledby="lbl-variant">
              ${['Default', ...names].map((n) => `<button type="button" role="radio" data-variant="${esc(n)}" aria-checked="${n === (variantOf[spec.id] || 'Default')}">${esc(n)}</button>`).join('')}
            </div></div>` : ''}
        ${groups.map((g) => `
          <fieldset class="ctl-group">
            <legend class="folio">${esc(g)}</legend>
            ${spec.params.filter((p) => p.group === g).map((p) => control(p, params[spec.id][p.key])).join('')}
          </fieldset>`).join('')}
        <dl class="bench__meta">
          ${metaRow('Element properties', spec.properties)}
          ${metaRow('Behavior', spec.behavior)}
          ${metaRow('Motion effect', spec.effect)}
          ${metaRow('Purpose', spec.purpose)}
        </dl>`;
    };

    const remountBench = async () => {
      benchInst?.destroy();
      benchInst = null;
      benchInst = await mountInto(benchStage, current);
    };
    const set = (key, value, { quiet = false } = {}) => {
      const spec = current;
      const def = spec.params.find((p) => p.key === key);
      if (!def) return;
      params[spec.id][key] = value;
      code.refresh();
      if (def.css) applyCss(benchStage, spec);
      else if (def.live) benchInst?.update?.(key);
      else if (!quiet) {
        clearTimeout(remountTimer);
        remountTimer = setTimeout(remountBench, def.type === 'range' || def.type === 'text' ? 160 : 0);
      }
    };

    on(controls, 'submit', (e) => e.preventDefault());
    on(controls, 'input', (e) => {
      const key = e.target.dataset.key;
      if (!key) return;
      const def = current.params.find((p) => p.key === key);
      const v = def.type === 'range' ? Number(e.target.value) : e.target.value;
      if (def.type === 'range') e.target.parentElement.querySelector('output').textContent = fmt(def, v);
      set(key, v);
    });
    on(controls, 'click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.dataset.random !== undefined) return randomize();
      const variant = b.dataset.variant ?? (b.dataset.defaults !== undefined ? 'Default' : null);
      if (variant) {
        // A variant = the defaults + its own saved settings (meta.variants).
        variantOf[current.id] = variant;
        Object.assign(params[current.id], defaultsOf(current), current.variants?.[variant]);
        code.refresh();
        renderControls();
        applyCss(benchStage, current);
        return remountBench();
      }
      const key = b.dataset.key;
      if (!key) return;
      const def = current.params.find((p) => p.key === key);
      if (def.type === 'toggle') {
        const v = b.getAttribute('aria-checked') !== 'true';
        b.setAttribute('aria-checked', String(v));
        set(key, v);
      } else {
        b.parentElement.querySelectorAll('[role="radio"]').forEach((o) => o.setAttribute('aria-checked', String(o === b)));
        set(key, b.dataset.value);
      }
    });

    const randomize = () => {
      const r = gsap.utils.random;
      current.params.forEach((p) => {
        const P = params[current.id];
        if (p.type === 'range') P[p.key] = Number((Math.round(r(p.min, p.max) / p.step) * p.step).toFixed(2));
        else if (p.type === 'swatch') P[p.key] = p.options[Math.floor(r(0, p.options.length - 0.01))].value;
        else if (p.type === 'choice') P[p.key] = p.options[Math.floor(r(0, p.options.length - 0.01))];
        else if (p.type === 'toggle') P[p.key] = Math.random() > 0.35;
      });
      code.refresh();
      renderControls();
      applyCss(benchStage, current);
      remountBench();
      if (!reducedMotion) gsap.from(controls.querySelectorAll('.ctl'), { x: 8, opacity: 0.3, duration: 0.4, stagger: 0.02, ease: 'power2.out' });
    };

    const openBench = async (id, from) => {
      current = byId[id];
      opener = from;
      $('[data-bench-code]').textContent = `${current.no} · ${current.effect[0] || current.element} · Workbench`;
      $('.bench__title').textContent = current.title;
      $('[data-bench-path]').innerHTML = `
        <span>${current.effect.length ? current.effect.map(esc).join(' · ') : 'no motion effect'}</span> →
        <span>${current.trigger.map(esc).join(' / ')}</span> → <span>${esc(current.element)}</span>`;
      renderControls();
      code.show(current, params);
      bench.hidden = false;
      document.documentElement.classList.add('is-bench-open');
      lenis?.stop();
      await remountBench();
      el.querySelector('.bench__close').focus();
      if (!reducedMotion) {
        gsap.fromTo('.bench__backdrop', { opacity: 0 }, { opacity: 1, duration: 0.4 });
        gsap.fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' });
      }
    };
    const closeBench = () => {
      if (bench.hidden) return;
      const finish = () => {
        benchInst?.destroy();
        benchInst = null;
        bench.hidden = true;
        document.documentElement.classList.remove('is-bench-open');
        lenis?.start();
        mountCard(current.id); // carry the tweaks back onto the card
        opener?.focus();
      };
      if (reducedMotion) return finish();
      gsap.to('.bench__backdrop', { opacity: 0, duration: 0.35 });
      gsap.to(sheet, { yPercent: 100, duration: 0.5, ease: 'power3.in', onComplete: finish });
    };
    on(bench, 'click', (e) => e.target.closest('[data-close]') && closeBench());
    on(document, 'keydown', (e) => {
      if (bench.hidden) return;
      if (e.key === 'Escape') closeBench();
      if (e.key === 'Tab') {
        // Keep focus inside the workbench.
        const f = [...sheet.querySelectorAll('button:not([tabindex="-1"]), input, textarea, a[href], [tabindex="0"]')].filter((x) => x.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) (e.preventDefault(), f.at(-1).focus());
        else if (!e.shiftKey && document.activeElement === f.at(-1)) (e.preventDefault(), f[0].focus());
      }
    });

    apply(); // first render (no animation)

    // Rise-in for the grid on arrival.
    if (!reducedMotion) {
      gsap.from(grid.querySelectorAll('.spec:not([hidden])'), {
        y: 70,
        opacity: 0,
        rotation: () => gsap.utils.random(-3, 3),
        duration: 1,
        ease: 'expo.out',
        stagger: 0.06,
        delay: 0.3,
        clearProps: 'transform,opacity',
      });
    }

    return () => {
      io.disconnect();
      offs.forEach((off) => off());
      Object.values(cards).forEach((c) => c?.destroy());
      benchInst?.destroy();
      styles.unload();
    };
  },
};
