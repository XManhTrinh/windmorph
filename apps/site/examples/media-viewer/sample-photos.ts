import type { MediaViewerItem } from '@windmorph/react-pro';

/** A stand-in photo (an inline SVG), so the examples work without a network or uploads. */
function photo(width: number, height: number, sky: string, hill: string, sun: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${sky}"/><circle cx="${width * 0.75}" cy="${height * 0.25}" r="${Math.min(width, height) * 0.1}" fill="${sun}"/><path d="M0 ${height * 0.75} L${width * 0.3} ${height * 0.45} L${width * 0.55} ${height * 0.7} L${width * 0.75} ${height * 0.5} L${width} ${height * 0.8} L${width} ${height} L0 ${height} Z" fill="${hill}"/></svg>`,
  )}`;
}

/** Four photos of different shapes, with and without captions. */
export const SAMPLE_PHOTOS: MediaViewerItem[] = [
  {
    key: 'harbour',
    src: photo(1600, 1200, '#9cc9e8', '#3f6a50', '#ffe7a3'),
    width: 1600,
    height: 1200,
    alt: 'Boats in the harbour at sunrise',
    caption: 'The old harbour at sunrise, before the boats went out.',
  },
  {
    key: 'market',
    src: photo(1200, 1600, '#f7d9b5', '#8a5a44', '#fff4d6'),
    width: 1200,
    height: 1600,
    alt: 'A market street with lanterns',
  },
  {
    key: 'family',
    src: photo(1600, 900, '#c9b8e8', '#4b4f7a', '#ffd1dc'),
    width: 1600,
    height: 900,
    alt: 'The whole family around the table',
    caption:
      'New Year at Gran’s: three generations, two kitchens and far too much cheesecake. We stayed up past midnight for the fireworks, then walked home along the river.',
  },
  {
    key: 'pho',
    src: photo(1200, 1200, '#f2c6a0', '#7a3e2b', '#fffbe6'),
    width: 1200,
    height: 1200,
    alt: 'A bowl of phở',
    caption: 'The best phở in Leeds.',
  },
];
