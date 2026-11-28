/**
 * Shared scaffolding for the Forms & Inputs designs: calendar markup, keyboard-friendly day grids
 * and option lists, and a sample-file picker for the upload zones. Styles: _form.css.
 */
import { esc } from '../_kit.js';

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Day buttons for one month (Monday first), blanks before day 1. disabled(d) greys out a day. */
export function days(year, month, { picked = 0, disabled = () => false } = {}) {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const n = new Date(year, month + 1, 0).getDate();
  return `<span class="sp-fi__dow" aria-hidden="true">${'MTWTFSS'.split('').map((d) => `<i>${d}</i>`).join('')}</span>
    <div class="sp-fi__days">${'<i></i>'.repeat(lead)}${Array.from({ length: n }, (_, i) => {
      const d = i + 1;
      return `<button type="button" class="sp-fi__day" data-day="${d}" aria-label="${d} ${MONTHS[month]}" aria-pressed="${d === picked}"${disabled(d) ? ' disabled' : ''} tabindex="${d === (picked || 1) ? 0 : -1}">${d}</button>`;
    }).join('')}</div>`;
}

/** Month header with previous / next buttons. */
export const monthBar = (year, month) => `
  <div class="sp-fi__bar">
    <button type="button" class="sp-fi__nav" data-step="-1" aria-label="Previous month">‹</button>
    <b class="sp-fi__month" aria-live="polite">${MONTHS[month]} ${year}</b>
    <button type="button" class="sp-fi__nav" data-step="1" aria-label="Next month">›</button>
  </div>`;

/** Arrow keys move between day buttons inside host (±1 day, ±1 week); clicks call fn(button, day). Re-reads the grid each time, so it survives re-renders. */
export function dayKeys(k, host, fn) {
  k.on(host, 'click', (e) => {
    const b = e.target.closest('.sp-fi__day');
    if (b && !b.disabled) fn(b, Number(b.dataset.day));
  });
  k.on(host, 'keydown', (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    const b = e.target.closest('.sp-fi__day');
    if (!step || !b) return;
    e.preventDefault();
    const all = [...host.querySelectorAll('.sp-fi__day')];
    const next = all[Math.min(all.length - 1, Math.max(0, all.indexOf(b) + step))];
    all.forEach((x) => (x.tabIndex = x === next ? 0 : -1));
    next.focus();
  });
}

/** Mark one day as picked (aria-pressed + roving tabindex). */
export function pickDay(host, b) {
  host.querySelectorAll('.sp-fi__day').forEach((x) => {
    x.setAttribute('aria-pressed', String(x === b));
    x.tabIndex = x === b ? 0 : -1;
  });
}

/** Options markup for a listbox. */
export const options = (items, at = -1) =>
  items.map((t, i) => `<li class="sp-fi__opt" role="option" aria-selected="${i === at}" tabindex="${i === Math.max(0, at) ? 0 : -1}" data-i="${i}">${esc(t)}</li>`).join('');

/** Listbox behaviour: arrows / Home / End move focus, Enter, Space or click picks: fn(li, index). */
export function listKeys(k, list, fn) {
  const opts = () => [...list.querySelectorAll('.sp-fi__opt')];
  k.on(list, 'click', (e) => {
    const li = e.target.closest('.sp-fi__opt');
    if (li) fn(li, Number(li.dataset.i));
  });
  k.on(list, 'keydown', (e) => {
    const all = opts();
    const i = all.indexOf(document.activeElement);
    const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key];
    if (to !== undefined) {
      e.preventDefault();
      const li = all[Math.min(all.length - 1, Math.max(0, to))];
      all.forEach((x) => (x.tabIndex = x === li ? 0 : -1));
      li.focus();
    } else if ((e.key === 'Enter' || e.key === ' ') && i >= 0) {
      e.preventDefault();
      fn(all[i], i);
    }
  });
}

/** Mark one option as selected. */
export function pickOpt(list, li) {
  list.querySelectorAll('.sp-fi__opt').forEach((x) => {
    x.setAttribute('aria-selected', String(x === li));
    x.tabIndex = x === li ? 0 : -1;
  });
}

export const SAMPLE_FILES = [['holiday.jpg', '2.4 MB'], ['brief.pdf', '820 KB'], ['logo.svg', '14 KB'], ['notes.txt', '3 KB'], ['budget.xlsx', '96 KB']];

/** A file chip: icon, name, size and a remove button. */
export const fileChip = ([name, size], cls = '') => `
  <div class="sp-fi__file ${cls}"><i class="sp-fi__ficon" aria-hidden="true">${esc(name.split('.').pop())}</i>
    <span class="sp-fi__fname">${esc(name)}<small>${esc(size)}</small></span>
    <button type="button" class="sp-fi__x" aria-label="Remove ${esc(name)}">✕</button></div>`;

/**
 * Upload zone: a click, Enter or Space "chooses" the next sample file (no OS dialog inside a demo card);
 * a real file dropped on it is used by name. fn([name, size]) gets each one. over(on) runs during a drag.
 */
export function pickFiles(k, zone, fn, over) {
  let n = 0;
  const next = () => SAMPLE_FILES[n++ % SAMPLE_FILES.length];
  const kb = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
  k.on(zone, 'click', () => fn(next()));
  k.on(zone, 'keydown', (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), fn(next())));
  k.on(zone, 'dragover', (e) => { e.preventDefault(); over?.(true); });
  k.on(zone, 'dragleave', () => over?.(false));
  k.on(zone, 'drop', (e) => {
    e.preventDefault();
    over?.(false);
    const f = e.dataTransfer?.files?.[0];
    fn(f ? [f.name, kb(f.size)] : next());
  });
}
