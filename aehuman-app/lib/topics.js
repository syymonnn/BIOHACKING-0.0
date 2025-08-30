export const TopicKey = {
  SLEEP: 'sleep',
  COLD: 'cold',
  LONGEVITY: 'longevity',
  PERFORMANCE: 'performance',
  BRAIN: 'brain',
  RESILIENCE: 'resilience',
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
    gradient: 'linear-gradient(135deg,#00ffd1,#a3ff12)'
  },
  [TopicKey.LONGEVITY]: {
    accent: '#ffe869',
    accentSoft: 'rgba(255,232,105,.15)',
    glow: '0 0 12px rgba(255,232,105,.5)',
    text: '#fffceb',
    ring: '0 0 0 3px rgba(255,232,105,.3)',
    gradient: 'linear-gradient(135deg,#ffe869,#ffb703)'
  },
  [TopicKey.PERFORMANCE]: {
    accent: '#a3ff12',
    accentSoft: 'rgba(163,255,18,.15)',
    glow: '0 0 12px rgba(163,255,18,.5)',
    text: '#faffeb',
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
  [TopicKey.DEFAULT]: {
    accent: '#00ffd1',
    accentSoft: 'rgba(0,255,209,.15)',
    glow: '0 0 12px rgba(0,255,209,.5)',
    text: '#e8fffa',
    ring: '0 0 0 3px rgba(0,255,209,.3)',
    gradient: 'linear-gradient(135deg,#00ffd1,#a3ff12)'
  }
};

export function getTopicFromTags(tags = []) {
  const normalized = tags.map(t => String(t).toLowerCase());
  if (normalized.includes('sleep')) return TopicKey.SLEEP;
  if (normalized.includes('cold')) return TopicKey.COLD;
  if (normalized.includes('brain')) return TopicKey.BRAIN;
  if (normalized.includes('longevity')) return TopicKey.LONGEVITY;
  if (normalized.includes('performance')) return TopicKey.PERFORMANCE;
  if (normalized.includes('resilience')) return TopicKey.RESILIENCE;
  return TopicKey.DEFAULT;
}