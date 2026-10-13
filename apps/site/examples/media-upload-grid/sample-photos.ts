const photo = (sky: string, hill: string, sun: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="${sky}"/><circle cx="300" cy="80" r="36" fill="${sun}"/><path d="M0 230 L110 140 L200 210 L280 150 L400 240 L400 300 L0 300 Z" fill="${hill}"/></svg>`,
  )}`;

/** Stand-in photos (inline SVGs), so the examples work without picking files. */
export const SAMPLE_PHOTOS = [
  { url: photo('#9cc9e8', '#5f8a6a', '#ffe7a3'), alt: 'Hills under a blue sky' },
  { url: photo('#f7d9b5', '#a0522d', '#fff4d6'), alt: 'Red rocks at dawn' },
  { url: photo('#2f4858', '#86bbd8', '#f6ae2d'), alt: 'Lake at dusk' },
  { url: photo('#dfe7fd', '#7b6d8d', '#ffffff'), alt: 'Mountains in the mist' },
];
