export const TIMELINE_LANES = [
  {
    id: 'home',
    label: 'Home',
    description: 'Places you called home and the chapters attached to them.',
    color: '#7cc7d8',
  },
  {
    id: 'education',
    label: 'Education',
    description: 'School, study, and any learning era worth remembering.',
    color: '#f4b282',
  },
  {
    id: 'employment',
    label: 'Employment',
    description: 'Jobs, side-projects, and the work that shaped you.',
    color: '#84a8dc',
  },
  {
    id: 'relationships',
    label: 'Relationships',
    description: 'People and periods that changed your life.',
    color: '#ee8f9d',
  },
];

export const DEFAULT_CATEGORIES = [
  { id: 'birth', name: 'Birth', color: '#62cde6' },
  { id: 'death', name: 'Death', color: '#6c5d56' },
  { id: 'travel', name: 'Travel', color: '#76d4ae' },
  { id: 'event', name: 'Event', color: '#f3b75f' },
  { id: 'memory', name: 'Memory', color: '#c889e7' },
];

const svgToDataUri = (markup) => `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;

const atlasPattern = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420">
    <g fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="1.25">
      <path d="M22 88c46-52 111-70 181-52s129 8 195-41" />
      <path d="M-12 148c47-52 115-67 189-48s131 13 205-34" />
      <path d="M18 204c54-46 119-60 191-42s137 15 210-26" />
      <path d="M-18 260c54-46 125-59 199-39s139 12 213-27" />
      <path d="M12 316c54-44 127-53 201-30s145 15 219-24" />
      <path d="M-24 372c56-41 130-50 205-27s148 18 223-16" />
    </g>
  </svg>
`);

const bloomPattern = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 520">
    <g fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.2">
      <circle cx="120" cy="120" r="54" />
      <circle cx="120" cy="120" r="92" />
      <circle cx="376" cy="170" r="70" />
      <circle cx="376" cy="170" r="118" />
      <circle cx="250" cy="370" r="84" />
      <circle cx="250" cy="370" r="136" />
    </g>
  </svg>
`);

const starfieldPattern = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360">
    <g fill="rgba(255,255,255,0.18)">
      <circle cx="42" cy="58" r="2" />
      <circle cx="168" cy="90" r="2.2" />
      <circle cx="292" cy="66" r="1.8" />
      <circle cx="92" cy="188" r="1.8" />
      <circle cx="250" cy="212" r="2" />
      <circle cx="320" cy="276" r="2" />
      <circle cx="142" cy="298" r="1.8" />
    </g>
    <g stroke="rgba(255,255,255,0.16)" stroke-width="1">
      <path d="M44 50v16M36 58h16" />
      <path d="M168 82v16M160 90h16" />
      <path d="M292 58v16M284 66h16" />
      <path d="M92 180v16M84 188h16" />
      <path d="M250 204v16M242 212h16" />
      <path d="M320 268v16M312 276h16" />
      <path d="M142 290v16M134 298h16" />
    </g>
  </svg>
`);

export const BACKGROUND_PRESETS = [
  {
    id: 'atlas',
    name: 'Atlas Veil',
    description: 'Warm contour lines floating across soft paper light.',
    preview: 'linear-gradient(135deg, #ecdcc1, #b67643)',
    style: {
      backgroundImage: `radial-gradient(circle at 15% 20%, rgba(255,255,255,0.48), transparent 28%), radial-gradient(circle at 85% 0%, rgba(217,156,82,0.34), transparent 32%), ${atlasPattern}`,
      backgroundSize: 'auto, auto, 380px 380px',
      backgroundPosition: 'center, center, center',
      backgroundRepeat: 'no-repeat, no-repeat, repeat',
    },
  },
  {
    id: 'bloom',
    name: 'Paper Bloom',
    description: 'Concentric rings and soft floral shadows for a gentler mood.',
    preview: 'linear-gradient(135deg, #f0e9d6, #7fb3a8)',
    style: {
      backgroundImage: `radial-gradient(circle at 80% 18%, rgba(120,190,170,0.34), transparent 30%), radial-gradient(circle at 12% 88%, rgba(255,255,255,0.42), transparent 34%), ${bloomPattern}`,
      backgroundSize: 'auto, auto, 420px 420px',
      backgroundPosition: 'center, center, center',
      backgroundRepeat: 'no-repeat, no-repeat, repeat',
    },
  },
  {
    id: 'starglass',
    name: 'Starglass',
    description: 'A clean nocturne with faint constellations and brass haze.',
    preview: 'linear-gradient(135deg, #18273a, #bd8a5a)',
    style: {
      backgroundImage: `radial-gradient(circle at 18% 22%, rgba(224,173,115,0.24), transparent 24%), radial-gradient(circle at 78% 6%, rgba(255,255,255,0.12), transparent 26%), ${starfieldPattern}`,
      backgroundSize: 'auto, auto, 340px 340px',
      backgroundPosition: 'center, center, center',
      backgroundRepeat: 'no-repeat, no-repeat, repeat',
    },
  },
];

export const THEMES = [
  {
    id: 'heirloom',
    name: 'Heirloom',
    description: 'Archival paper, brass accents, and a gallery-like warmth.',
    preview: 'linear-gradient(135deg, #f6efe1, #c48b4c)',
    vars: {
      '--app-bg': 'linear-gradient(180deg, #f7f1e5 0%, #efe2cb 46%, #e6d2b4 100%)',
      '--app-bg-secondary': 'rgba(255, 244, 225, 0.68)',
      '--surface': 'rgba(255, 252, 245, 0.78)',
      '--surface-strong': 'rgba(255, 252, 245, 0.92)',
      '--surface-soft': 'rgba(255, 249, 240, 0.62)',
      '--border': 'rgba(129, 91, 54, 0.18)',
      '--text': '#261c16',
      '--muted': '#71655d',
      '--accent': '#b86a2f',
      '--accent-strong': '#8f4a18',
      '--accent-soft': 'rgba(184, 106, 47, 0.12)',
      '--shadow': '0 30px 80px rgba(86, 46, 10, 0.14)',
      '--band-top': 'rgba(255, 255, 255, 0.74)',
      '--band-bottom': 'rgba(246, 239, 227, 0.98)',
      '--grid-line': 'rgba(102, 76, 57, 0.14)',
      '--grid-strong': 'rgba(102, 76, 57, 0.24)',
      '--memory-surface': 'rgba(255, 255, 255, 0.88)',
      '--range-surface': 'rgba(255, 255, 255, 0.84)',
      '--detail-surface': 'rgba(255, 251, 243, 0.92)',
      '--display-font': '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
      '--body-font': '"Avenir Next", "Segoe UI", sans-serif',
    },
  },
  {
    id: 'harbor',
    name: 'Harbor',
    description: 'Salt-air blues and a clean modern editorial finish.',
    preview: 'linear-gradient(135deg, #eef6f7, #338e9a)',
    vars: {
      '--app-bg': 'linear-gradient(180deg, #eff7f8 0%, #d9edf0 44%, #c6dde5 100%)',
      '--app-bg-secondary': 'rgba(237, 248, 250, 0.7)',
      '--surface': 'rgba(252, 255, 255, 0.78)',
      '--surface-strong': 'rgba(255, 255, 255, 0.92)',
      '--surface-soft': 'rgba(248, 253, 255, 0.64)',
      '--border': 'rgba(44, 93, 106, 0.18)',
      '--text': '#18252c',
      '--muted': '#58717c',
      '--accent': '#2d8594',
      '--accent-strong': '#22606b',
      '--accent-soft': 'rgba(45, 133, 148, 0.14)',
      '--shadow': '0 30px 80px rgba(17, 59, 78, 0.16)',
      '--band-top': 'rgba(255, 255, 255, 0.78)',
      '--band-bottom': 'rgba(237, 245, 247, 0.98)',
      '--grid-line': 'rgba(52, 108, 123, 0.15)',
      '--grid-strong': 'rgba(52, 108, 123, 0.24)',
      '--memory-surface': 'rgba(255, 255, 255, 0.9)',
      '--range-surface': 'rgba(255, 255, 255, 0.86)',
      '--detail-surface': 'rgba(247, 252, 253, 0.92)',
      '--display-font': '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
      '--body-font': '"Avenir Next", "Segoe UI", sans-serif',
    },
  },
  {
    id: 'studiogold',
    name: 'Studio Gold',
    description: 'A cinematic dark slate grounded by warm metallic highlights.',
    preview: 'linear-gradient(135deg, #202733, #bb8b59)',
    vars: {
      '--app-bg': 'linear-gradient(180deg, #1d2430 0%, #283241 50%, #2d3d4f 100%)',
      '--app-bg-secondary': 'rgba(18, 26, 36, 0.76)',
      '--surface': 'rgba(26, 34, 45, 0.72)',
      '--surface-strong': 'rgba(32, 42, 55, 0.92)',
      '--surface-soft': 'rgba(28, 37, 49, 0.58)',
      '--border': 'rgba(223, 191, 156, 0.14)',
      '--text': '#f6f0e6',
      '--muted': '#bfbaa8',
      '--accent': '#cb8a4b',
      '--accent-strong': '#e5aa6c',
      '--accent-soft': 'rgba(203, 138, 75, 0.16)',
      '--shadow': '0 35px 90px rgba(0, 0, 0, 0.32)',
      '--band-top': 'rgba(29, 37, 48, 0.9)',
      '--band-bottom': 'rgba(26, 33, 44, 0.96)',
      '--grid-line': 'rgba(255, 244, 229, 0.08)',
      '--grid-strong': 'rgba(255, 244, 229, 0.16)',
      '--memory-surface': 'rgba(35, 44, 57, 0.94)',
      '--range-surface': 'rgba(37, 46, 59, 0.88)',
      '--detail-surface': 'rgba(27, 35, 46, 0.92)',
      '--display-font': '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
      '--body-font': '"Avenir Next", "Segoe UI", sans-serif',
    },
  },
];

export function createInitialData() {
  return {
    birthDate: '',
    profileName: '',
    profilePhotoDataUrl: '',
    themeId: THEMES[0].id,
    backgroundId: BACKGROUND_PRESETS[0].id,
    zoom: 1,
    categories: DEFAULT_CATEGORIES.map((category) => ({ ...category })),
    memories: [],
    ranges: TIMELINE_LANES.reduce((collection, lane) => {
      collection[lane.id] = [];
      return collection;
    }, {}),
  };
}

export function getLaneColor(laneId) {
  return TIMELINE_LANES.find((lane) => lane.id === laneId)?.color ?? '#8fb4c8';
}
