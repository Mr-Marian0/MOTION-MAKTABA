/**
 * Shared bits for the Type & Media designs: split text into word / letter spans, painted photos and
 * avatar faces (pure CSS, no image files), a video frame. Styles: _media.css.
 */
import { esc } from '../_kit.js';

/** Letters as spans (spaces kept as non-breaking spans), with the whole text as the accessible name. */
export const letters = (text, cls = 'sp-tm__c') =>
  [...String(text)].map((c) => `<span class="${cls}" aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');

/** Words as spans separated by real spaces (so lines still wrap). */
export const words = (text, cls = 'sp-tm__w') =>
  String(text).split(/\s+/).filter(Boolean).map((w) => `<span class="${cls}">${esc(w)}</span>`).join(' ');

/** Three painted "photos": [sky top, sky bottom, sun, near hill, far hill]. */
export const PHOTOS = [
  ['#f4dcb5', '#e6b083', '#b3412e', '#3e2c1f', '#7a5236'],
  ['#cfe0ea', '#8fb3c9', '#f2a541', '#2f4a6b', '#4f6b8a'],
  ['#dfe6cf', '#b5c79a', '#f4efe6', '#3e5a2f', '#6b8a4f'],
  ['#2a1f3d', '#5b3f8c', '#f4dcb5', '#120d1c', '#3a2a55'],
];
export const photoVars = (i) => {
  const [a, b, s, h, f] = PHOTOS[i % PHOTOS.length];
  return `--sky1:${a};--sky2:${b};--sun:${s};--hill:${h};--far:${f}`;
};
/** A painted photo element. */
export const photo = (i, cls = '') => `<i class="sp-tm__photo ${cls}" style="${photoVars(i)}"></i>`;

/** Avatar faces: [skin, hair, shirt]. */
export const FACES = [['#e6b083', '#3e2c1f', '#2f4a6b'], ['#c98d5f', '#111111', '#b3412e'], ['#f1c7a0', '#b5651d', '#3e7d5a'], ['#8d5a3b', '#2a1f3d', '#c9a227'], ['#f4d6bd', '#6b6f73', '#5b3f8c']];
export const NAMES = ['Ada Okafor', 'Ben Ito', 'Cleo Marsh', 'Dev Rao', 'Eva Lind'];
export const face = (i, cls = '') => {
  const [skin, hair, shirt] = FACES[i % FACES.length];
  return `<i class="sp-tm__ava ${cls}" role="img" aria-label="${NAMES[i % NAMES.length]}" style="--skin:${skin};--hair:${hair};--shirt:${shirt}"></i>`;
};
