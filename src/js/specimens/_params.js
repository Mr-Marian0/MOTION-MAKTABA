/**
 * PARAM PRESETS: ready-made workbench controls you can drop into any
 * design's `meta.params` list.
 *
 *   import { tone, EASE_CHOICES } from '../_params.js';
 *   params: [ tone('#a07a52'), { key: 'ease', …, options: EASE_CHOICES } ]
 *
 * Control types (every control needs key, label, group, type, default):
 *   'range'   min, max, step, unit ('px' | 's' | '°' | '×' | …)
 *   'swatch'  options: [{ label, value }]
 *   'choice'  options: ['A', 'B']
 *   'toggle'  true / false
 *   'text'    comma-separated list (e.g. link labels)
 * How the change reaches the design:
 *   css: '--var'  written onto the stage as a CSS custom property (instant)
 *   live: true    the design reads params.<key> on the fly (+ optional update(key))
 *   neither       the design re-mounts with the new value
 * Groups are the Element Properties: Appearance, Size, Shape, Layout,
 * Motion, Behavior, Content (any name works; groups appear in first-use order).
 */

export const TONES = [
  { label: 'Ink', value: '#111111' },
  { label: 'Kraft', value: '#a07a52' },
  { label: 'Umber', value: '#3e2c1f' },
  { label: 'Stamp red', value: '#b3412e' },
  { label: 'Ledger green', value: '#4f6b4a' },
  { label: 'Carbon blue', value: '#2f4a6b' },
];

/** A color swatch control. Written to the stage as a CSS variable (default --sp-accent). */
export const tone = (def = '#111111', key = 'tone', css = '--sp-accent', label = 'Accent') => ({
  key, label, group: 'Appearance', type: 'swatch', options: TONES, default: def, css,
});

/** Names for the `ease` choice; map them to GSAP eases with EASES from _kit.js. */
export const EASE_CHOICES = ['Expo', 'Smooth', 'Back', 'Elastic', 'Bounce', 'Linear'];
