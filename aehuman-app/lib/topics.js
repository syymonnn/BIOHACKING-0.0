export const TopicKey = {  
  SLEEP: 'sleep',
  COLD: 'cold',
  LONGEVITY: 'longevity',
  PERFORMANCE: 'performance',
  BRAIN: 'brain',
  RESILIENCE: 'resilience',
  NUTRITION: 'nutrition',
  DEFAULT: 'default'
};

export const TOPIC_THEME = {
  [TopicKey.SLEEP]: {
    accent: '#4ea8de',
    accentSoft: 'rgba(78,168,222,.15)',
    glow: '0 0 12px rgba(78,168,222,.5)',
    text: '#dcefff',
    ring: '0 0 0 3px rgba(78,168,222,.3)',
    gradient: 'linear-gradient(135deg,#4ea8de,#a8dadc)'
  },
  [TopicKey.COLD]: {
    accent: '#00ffd1',
    accentSoft: 'rgba(0,255,209,.15)',
    glow: '0 0 12px rgba(0,255,209,.5)',
    text: '#e8fffa',
    ring: '0 0 0 3px rgba(0,255,209,.3)',
    gradient: 'linear-gradient(135deg, #ff6b35 0%, #7fb069 50%, #0d1b2a 100%)'
  },
  [TopicKey.LONGEVITY]: {
    accent: '#ffe869',
    accentSoft: 'rgba(255,232,105,.15)',
    glow: '0 0 12px rgba(255,232,105,.5)',
    text: '#b7af86ff',
    ring: '0 0 0 3px rgba(255,232,105,.3)',
    gradient: 'linear-gradient(135deg,#ffe869,#ffb703)'
  },
  [TopicKey.PERFORMANCE]: {
    accent: '#51ff12ff',
    accentSoft: 'rgba(163,255,18,.15)',
    glow: '0 0 12px rgba(163,255,18,.5)',
    text: '#f5ffebff',
    ring: '0 0 0 3px rgba(163,255,18,.3)',
    gradient: 'linear-gradient(135deg,#a3ff12,#00ffd1)'
  },
  [TopicKey.BRAIN]: {
    accent: '#a239ca',
    accentSoft: 'rgba(162,57,202,.15)',
    glow: '0 0 12px rgba(162,57,202,.5)',
    text: '#f7e6ff',
    ring: '0 0 0 3px rgba(162,57,202,.3)',
    gradient: 'linear-gradient(135deg,#a239ca,#00ffd1)'
  },
  [TopicKey.RESILIENCE]: {
    accent: '#ff6d00',
    accentSoft: 'rgba(255,109,0,.15)',
    glow: '0 0 12px rgba(255,109,0,.5)',
    text: '#fff8f0',
    ring: '0 0 0 3px rgba(255,109,0,.3)',
    gradient: 'linear-gradient(135deg,#ff6d00,#ffe869)'
  },
  [TopicKey.NUTRITION]: {
    accent: '#4F60DE',
    accentSoft: 'rgba(138,201,38,.15)',
    glow: '0 0 12px rgba(138,201,38,.5)',
    text: '#f4ffe8',
    ring: '0 0 0 3px rgba(138,201,38,.3)',
    gradient: 'linear-gradient(135deg,#4F60DE,#ffe869)'
  },
  [TopicKey.DEFAULT]: {
    accent: '#00ffd1',
    accentSoft: 'rgba(0,255,209,.15)',
    glow: '0 0 12px rgba(0,255,209,.5)',
    text: '#e8fffa',
    ring: '0 0 0 3px rgba(0,255,209,.3)',
    gradient: 'linear-gradient(135deg,#00ffd1,#a3ff12)'
  }
};

export const TOPIC_TAGS = {
  [TopicKey.COLD]: ['cold'],
  [TopicKey.LONGEVITY]: ['longevity', 'biohacking', 'science', 'self-tracking'],
  [TopicKey.PERFORMANCE]: ['performance', 'energy'],
  [TopicKey.SLEEP]: ['sleep'],
  [TopicKey.BRAIN]: ['brain'],
  [TopicKey.RESILIENCE]: ['resilience'],
  [TopicKey.NUTRITION]: ['nutrition', 'breakfast', 'dinner', 'food', 'lunch']
};

// Build reverse lookup allowing tags to belong to multiple categories
const TAG_TOPIC_MAP = Object.entries(TOPIC_TAGS).reduce((acc, [topic, tagList]) => {
  tagList.forEach(tag => {
    const key = tag.toLowerCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(topic);
  });
  return acc;
}, {});

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const int = parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = c => c.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getTagTheme(tag) {
  const topics = TAG_TOPIC_MAP[tag?.toLowerCase()] || [];
  if (!topics.length) return TOPIC_THEME[TopicKey.DEFAULT];
  if (topics.length === 1) return TOPIC_THEME[topics[0]];

  const rgbs = topics.map(t => hexToRgb(TOPIC_THEME[t].accent));
  const avg = rgbs.reduce(
    (acc, c) => ({ r: acc.r + c.r, g: acc.g + c.g, b: acc.b + c.b }),
    { r: 0, g: 0, b: 0 }
  );
  avg.r = Math.round(avg.r / rgbs.length);
  avg.g = Math.round(avg.g / rgbs.length);
  avg.b = Math.round(avg.b / rgbs.length);
  const accent = rgbToHex(avg);
  const gradientColors = topics.map(t => TOPIC_THEME[t].accent).join(',');
  return {
    accent,
    accentSoft: `rgba(${avg.r},${avg.g},${avg.b},.15)`,
    glow: `0 0 12px rgba(${avg.r},${avg.g},${avg.b},.5)`,
    text: TOPIC_THEME[topics[0]].text,
    ring: `0 0 0 3px rgba(${avg.r},${avg.g},${avg.b},.3)`,
    gradient: `linear-gradient(135deg,${gradientColors})`,
  };
}

export function getTopicFromTags(tags = []) {
  const normalized = tags.map(t => String(t).toLowerCase());
  for (const tag of normalized) {
    const topics = TAG_TOPIC_MAP[tag];
    if (topics && topics.length) {
      // Use the first mapped topic as the primary one
      return topics[0];
    }
  }
  return TopicKey.DEFAULT;
}

const topics = { TopicKey, TOPIC_THEME, TOPIC_TAGS, getTagTheme, getTopicFromTags };
export default topics;
