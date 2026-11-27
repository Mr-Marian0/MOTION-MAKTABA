/**
 * LAB CODE PANEL: two view-only tabs under the workbench stage, each copyable.
 *   JavaScript  the design's <id>.js, with the current settings on top.
 *   AI prompt   a paste-ready prompt to rebuild the design in plain JS + GSAP.
 * Used by specimen-lab.js: const panel = codePanel(el); panel.show(spec, params); panel.refresh();
 */
const ROOT = new URL('../specimens/', import.meta.url);
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const cache = new Map();
const source = (url) => {
  if (!cache.has(url)) cache.set(url, fetch(url).then((r) => (r.ok ? r.text() : '')).catch(() => ''));
  return cache.get(url);
};
/** CSS text with sibling `@import url('x.css');` lines inlined (designs may build on another design's CSS). */
const cssOf = async (url) => {
  const css = await source(url);
  const parts = await Promise.all(
    css.split(/(@import url\(['"]?[^'")]+['"]?\);?)/).map((p) => {
      const m = p.match(/@import url\(['"]?([^'")]+)/);
      return m ? source(new URL(m[1], url).href) : p;
    })
  );
  return parts.join('');
};

const valueText = (p, v) => (p.type === 'toggle' ? (v ? 'on' : 'off') : `${v}${p.unit || ''}`);

function settingsBlock(spec, v) {
  const rows = spec.params.map((p) => `   ${p.key}: ${JSON.stringify(v[p.key])},`.padEnd(44) + ` // ${p.label}`);
  return `/* Workbench settings (pass as \`params\` to mount):\n${rows.join('\n').replaceAll('*/', '* /')}\n*/\n\n`;
}

function prompt(spec, v, src) {
  const terms = [['Element', spec.elements], ['Trigger', spec.trigger], ['Behavior', spec.behavior], ['Effect', spec.effect], ['Purpose', spec.purpose]]
    .map(([k, l]) => `${k}: ${l?.length ? l.join(', ') : 'none'}`)
    .join(' · ');
  return `# Build "${spec.title}" (${spec.element}) in plain JavaScript + GSAP 3

${spec.description}${spec.notes ? ` ${spec.notes}` : ''}
${terms}

## Settings (use as defaults, expose as options)
${spec.params.map((p) => `- ${p.label} (\`${p.key}\`): ${valueText(p, v[p.key])}`).join('\n')}

## Rules
- Vanilla JS ES module + CSS. GSAP from a CDN. No other libraries.
- Replace the lab helpers (kit, k.on, k.$, bars, labelsOf) with plain code.
- Keep em sizing; give the root its own font-size. Keyboard accessible, respect prefers-reduced-motion, clean up listeners/tweens.

## Reference: ${spec.id}.js
\`\`\`js
${src.js.trim()}
\`\`\`

## Reference: ${spec.id}.css
\`\`\`css
${src.css.trim()}
\`\`\`
`;
}

/* Tiny syntax painter (display only) */
const RE = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|(`(?:\\[\s\S]|[^\\`])*`|'(?:\\.|[^\\'\n])*'|"(?:\\.|[^\\"\n])*")|\b(import|from|export|default|const|let|function|return|if|else|for|of|new|async|await|true|false|null|this)\b|(\b\d+(?:\.\d+)?\b)/g;
const NAMES = ['com', 'str', 'key', 'num'];
function paint(src, md) {
  if (md) return esc(src).replace(/^(#+ .*)$/gm, '<span class="tk-head">$1</span>').replace(/^```.*$/gm, '<span class="tk-com">$&</span>');
  let out = '';
  let last = 0;
  src.replace(RE, (m, ...g) => {
    const at = g[4];
    out += esc(src.slice(last, at)) + `<span class="tk-${NAMES[g.slice(0, 4).findIndex((x) => x !== undefined)]}">${esc(m)}</span>`;
    last = at + m.length;
    return m;
  });
  return out + esc(src.slice(last));
}

export const codePanelHTML = `
  <section class="bench-code" data-code aria-label="Code for this design">
    <div class="bench-code__bar">
      <div class="bench-code__tabs" role="tablist" aria-label="Code view">
        <button type="button" role="tab" id="bc-tab-js" aria-controls="bc-panel" aria-selected="true" data-tab="js">JavaScript</button>
        <button type="button" role="tab" id="bc-tab-ai" aria-controls="bc-panel" aria-selected="false" tabindex="-1" data-tab="ai">AI prompt</button>
      </div>
      <button type="button" class="bench-code__copy" data-copy>Copy</button>
    </div>
    <pre class="bench-code__pre" id="bc-panel" role="tabpanel" aria-labelledby="bc-tab-js" tabindex="0"><code data-out></code></pre>
  </section>`;

export function codePanel(root) {
  const out = root.querySelector('[data-out]');
  const pre = root.querySelector('pre');
  const copyBtn = root.querySelector('[data-copy]');
  let tab = 'js';
  let spec = null;
  let params = null;
  let text = '';
  let token = 0;
  let timer;

  const render = async () => {
    const mine = ++token;
    const js = await source(spec.files.js);
    const v = params[spec.id];
    text = tab === 'js' ? settingsBlock(spec, v) + js : prompt(spec, v, { js, css: await cssOf(spec.files.css) });
    if (mine !== token) return;
    out.innerHTML = paint(text, tab === 'ai');
    out.dataset.lang = tab === 'ai' ? 'md' : 'js';
  };
  const select = (t) => {
    tab = t;
    root.querySelectorAll('[role="tab"]').forEach((b) => {
      const on = b.dataset.tab === t;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    pre.setAttribute('aria-labelledby', `bc-tab-${t}`);
    pre.scrollTop = 0;
    render();
  };

  root.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b?.dataset.tab) select(b.dataset.tab);
    else if (b?.dataset.copy !== undefined) copy();
  });
  root.addEventListener('keydown', (e) => {
    if (!e.target.closest('[role="tab"]') || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const next = tab === 'js' ? 'ai' : 'js';
    select(next);
    root.querySelector(`[data-tab="${next}"]`).focus();
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const r = document.createRange();
      r.selectNodeContents(out);
      getSelection().removeAllRanges();
      getSelection().addRange(r);
      document.execCommand('copy');
      getSelection().removeAllRanges();
    }
    copyBtn.textContent = 'Copied ✓';
    copyBtn.classList.add('is-done');
    setTimeout(() => (copyBtn.textContent = 'Copy', copyBtn.classList.remove('is-done')), 1600);
  }

  return {
    show(next, all) {
      spec = next;
      params = all;
      pre.scrollTop = 0;
      render();
    },
    refresh() {
      if (!spec) return;
      clearTimeout(timer);
      timer = setTimeout(render, 120);
    },
  };
}
