import wallpaper1 from './assets/wallpapers/wallpaper1.jpeg';
import wallpaper4 from './assets/wallpapers/wallpaper4.jpeg';
import wallpaper5 from './assets/wallpapers/wallpaper5.jpg';

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
  { id: 'memory', name: 'Moment', color: '#c889e7' },
];

export const BACKGROUND_PRESETS = [
  {
    id: 'wallpaper4',
    name: 'Wallpaper 4',
    description: 'Alternate wallpaper selection.',
    preview: 'linear-gradient(135deg, #ab4841, #d8eefb)',
    wallpaper: `url(${wallpaper4})`,
    style: {
      backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.14)), url(${wallpaper4})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep woodland light and layered green distance.',
    preview: 'linear-gradient(135deg, #2f5c45, #8db08d)',
    wallpaper: `url(${wallpaper1})`,
    style: {
      backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.14)), url(${wallpaper1})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  },
  {
    id: 'wallpaper5',
    name: 'Wallpaper 5',
    description: 'Alternate wallpaper selection.',
    preview: 'linear-gradient(135deg, #d66fa3, #f5c2dd)',
    wallpaper: `url(${wallpaper5})`,
    style: {
      backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.14)), url(${wallpaper5})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  },
];

export const THEMES = [
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
    name: 'Canopy',
    description: 'A fresh green editorial palette with warm natural light.',
    preview: 'linear-gradient(135deg, #e8f1df, #6f9b62)',
    vars: {
      '--app-bg': 'linear-gradient(180deg, #eef5e6 0%, #dfead5 46%, #cfdfc2 100%)',
      '--app-bg-secondary': 'rgba(239, 247, 232, 0.72)',
      '--surface': 'rgba(252, 255, 248, 0.78)',
      '--surface-strong': 'rgba(255, 255, 251, 0.92)',
      '--surface-soft': 'rgba(245, 251, 240, 0.62)',
      '--border': 'rgba(86, 116, 73, 0.16)',
      '--text': '#1f2a1b',
      '--muted': '#64725d',
      '--accent': '#6b9a57',
      '--accent-strong': '#4f7940',
      '--accent-soft': 'rgba(107, 154, 87, 0.14)',
      '--shadow': '0 30px 80px rgba(64, 93, 53, 0.16)',
      '--band-top': 'rgba(255, 255, 255, 0.8)',
      '--band-bottom': 'rgba(238, 245, 230, 0.98)',
      '--grid-line': 'rgba(92, 122, 82, 0.13)',
      '--grid-strong': 'rgba(92, 122, 82, 0.22)',
      '--memory-surface': 'rgba(255, 255, 255, 0.9)',
      '--range-surface': 'rgba(250, 253, 246, 0.88)',
      '--detail-surface': 'rgba(250, 254, 246, 0.92)',
      '--display-font': '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
      '--body-font': '"Avenir Next", "Segoe UI", sans-serif',
    },
  },
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
