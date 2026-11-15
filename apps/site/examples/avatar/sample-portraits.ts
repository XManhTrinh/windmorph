/** A stand-in portrait (an inline SVG): a head and shoulders, so the examples need no uploads. */
function portrait(ground: string, skin: string, hair: string, top: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 96 96"><rect width="96" height="96" fill="${ground}"/><path d="M14 96c0-21 15-33 34-33s34 12 34 33Z" fill="${top}"/><circle cx="48" cy="40" r="17" fill="${skin}"/><path d="M30 40c0-12 8-20 18-20s18 8 18 20c-5-7-11-10-18-10s-13 3-18 10Z" fill="${hair}"/></svg>`,
  )}`;
}

/** Portraits for the avatar examples, by first name. */
export const PORTRAITS = {
  sam: portrait('#c9d6e8', '#e8b796', '#3b2f2f', '#2f4858'),
  nora: portrait('#d9c2f0', '#f1c7a2', '#1f1b2e', '#8a5cc7'),
  omar: portrait('#e6ded3', '#c68e6b', '#2b211c', '#3f6a50'),
  priya: portrait('#2f4858', '#d9a57e', '#5a2f22', '#f2e6d0'),
  mateo: portrait('#f7d9b5', '#e0ac85', '#6b4a2f', '#b5503c'),
  yuki: portrait('#1f2a44', '#f1c7a2', '#101014', '#e7b93c'),
};
