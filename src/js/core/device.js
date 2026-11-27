/**
 * DEVICE — decides "lite mode" for phones, tablets and low-power machines.
 *
 * Lite mode keeps the motion but spends less CPU on chrome around it:
 *   - native scrolling instead of Lenis (Lenis runs a frame loop forever, and
 *     touch devices scroll natively anyway)
 *   - the library drawers keep fewer designs live at once
 * It adds `is-lite` to <html> so CSS can trim heavy extras too.
 *
 * Detected automatically; override with ?lite=1 or ?lite=0 (remembered on this device).
 */
const KEY = 'mm:lite';
const store = {
  get() { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(KEY, v); } catch { /* private mode */ } },
};

const asked = new URLSearchParams(location.search).get('lite');
if (asked === '1' || asked === '0') store.set(asked);
const forced = store.get();

const detected =
  matchMedia('(pointer: coarse)').matches ||
  (navigator.hardwareConcurrency || 8) <= 4 ||
  (navigator.deviceMemory || 8) <= 4 ||
  navigator.connection?.saveData === true;

export const lite = forced === '1' ? true : forced === '0' ? false : detected;

document.documentElement.classList.toggle('is-lite', lite);
