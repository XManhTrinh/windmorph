/** A 1600×1200 stand-in photo (an inline SVG), so the examples work without picking a file. */
export const SAMPLE_PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200" viewBox="0 0 1600 1200"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc9e8"/><stop offset="1" stop-color="#f7d9b5"/></linearGradient></defs><rect width="1600" height="1200" fill="url(#sky)"/><circle cx="1240" cy="300" r="120" fill="#ffe7a3"/><path d="M0 900 L420 520 L760 860 L1080 600 L1600 980 L1600 1200 L0 1200 Z" fill="#5f8a6a"/><path d="M0 1010 L520 820 L980 1000 L1600 860 L1600 1200 L0 1200 Z" fill="#3f6a50"/><circle cx="800" cy="560" r="150" fill="#f1c7a2"/><rect x="620" y="740" width="360" height="460" rx="180" fill="#2f4858"/></svg>',
)}`;

/** A 1000×1500 portrait stand-in (an inline SVG), for frames taller than the photo is wide. */
export const SAMPLE_PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500" viewBox="0 0 1000 1500"><rect width="1000" height="1500" fill="#dfe7fd"/><circle cx="760" cy="260" r="90" fill="#ffffff"/><path d="M0 1050 L300 700 L560 980 L780 760 L1000 1000 L1000 1500 L0 1500 Z" fill="#7b6d8d"/><circle cx="500" cy="760" r="140" fill="#f1c7a2"/><rect x="330" y="920" width="340" height="580" rx="170" fill="#2f4858"/></svg>',
)}`;
