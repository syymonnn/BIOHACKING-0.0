// topics.js — identico nelle export; migliora automaticamente SOLO le .tag-bubble

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
  [TopicKey.LONGEVITY]: ['longevity'],
  [TopicKey.PERFORMANCE]: ['performance', 'energy'],
  [TopicKey.SLEEP]: ['sleep'],
  [TopicKey.BRAIN]: ['brain', 'psyche'],
  [TopicKey.RESILIENCE]: ['resilience'],
  [TopicKey.NUTRITION]: ['nutrition']
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

/* ============================================================
   ENHANCER SOLO PER LE CARD .tag-bubble (cervello 3D)
   - nessun impatto sul resto della UI
   - idempotente e senza dipendenze esterne
   ============================================================ */

function _norm(s) {
  return String(s || '').normalize('NFKD').replace(/\s+/g, ' ').trim().toLowerCase();
}
function _themeFromEl(el) {
  // priorità a data-tag/topic, fallback al testo (gestisce "Tutti")
  const raw =
    el.getAttribute('data-tag') ||
    el.getAttribute('data-topic') ||
    el.textContent ||
    '';
  const tag = _norm(raw) === 'ALL' ? TopicKey.DEFAULT : _norm(raw);
  return TOPIC_THEME[tag] || getTagTheme(tag);
}

function _buildBubbleStyles(theme) {
  // estetica rivista: glass overlay, doppia cornice soft, glow pulito
  return {
    background:
      `${theme.gradient}, linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.08))`,
    backgroundBlendMode: 'overlay, normal',
    border: '1px solid #333',

    boxShadow: `${theme.glow}, 0 12px 28px rgba(0,0,0,.35), 0 0 0 1px ${theme.accentSoft}`,
    color: theme.text,
    WebkitBackdropFilter: 'blur(14px) saturate(140%)',
    backdropFilter: 'blur(14px) saturate(140%)',
    fontWeight: '800',
    letterSpacing: '.2px',
    textShadow: '0 1px 0 rgba(0,0,0,.25)',
    padding: '10px 18px', // un filo più generoso
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '999px',
    transition: 'transform .22s cubic-bezier(.2,.7,.2,1), box-shadow .22s ease, background .22s ease',
    willChange: 'transform',
    outline: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer'
  };
}

function _ensureShine(el, theme) {
  if (el.querySelector(':scope > .ae-shine')) return;
  const shine = document.createElement('span');
  shine.className = 'ae-shine';
  Object.assign(shine.style, {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    background:
      'radial-gradient(140% 120% at 12% 8%, rgba(255,255,255,.35) 0%, rgba(255,255,255,0) 60%),' +
      'linear-gradient(180deg, rgba(255,255,255,.18), rgba(255,255,255,.06))',
    mixBlendMode: 'screen'
  });
  el.appendChild(shine);
}
function _ensureBadge(el, theme) {
  // invece di icona, aggiunge solo un overlay invisibile che intensifica i colori
  if (el.querySelector(':scope > .ae-badge-boost')) return;
  const boost = document.createElement('span');
  boost.className = 'ae-badge-boost';
  Object.assign(boost.style, {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background:
      'radial-gradient(80% 80% at 50% 50%, rgba(255,255,255,.08), transparent 70%)',
    mixBlendMode: 'overlay',
    pointerEvents: 'none'
  });
  el.appendChild(boost);
}

function _wireInteractions(el, theme, baseBoxShadow) {
  if (el.__aeWired) return;
  el.__aeWired = true;

  el.addEventListener('mousedown', () => {
    el.style.transform = 'translate(-50%, -50%) scale(.985)';
  });
  el.addEventListener('mouseup', () => {
    el.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(-50%, -50%) scale(1)';
  });
  el.addEventListener('focus', () => {
    el.style.boxShadow = `${theme.glow}, ${theme.ring}`;
  });
  el.addEventListener('blur', () => {
    el.style.boxShadow = baseBoxShadow;
  });
  // hover solo se niente touch
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      el.style.transform = 'translate(-50%, -50%) scale(1.02)';
    }
  });
  el.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') {
      el.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  });
}

function _upgradeOneTagBubble(el) {
  if (!el || el.__aeUpgraded) return;
  el.__aeUpgraded = true;

  const theme = _themeFromEl(el);
  const styles = _buildBubbleStyles(theme);

  // Manteniamo left/top/transform di posizionamento già impostati dal tuo render.
  const keep = {
    position: el.style.position || 'absolute',
    left: el.style.left,
    top: el.style.top,
    transform: el.style.transform || 'translate(-50%, -50%)'
  };

  // Applica nuovi stili
  Object.assign(el.style, styles, keep);

  // Layer extra (non influiscono sul layout)
  _ensureShine(el, theme);
  _ensureBadge(el, theme);

  _wireInteractions(el, theme, styles.boxShadow);
}

function _upgradeAllTagBubbles() {
  const els = Array.from(document.querySelectorAll('.tag-bubble'));
  els.forEach(_upgradeOneTagBubble);
}

// auto-run: appena il DOM è pronto (Next monta i bottoni subito dopo il paint)
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _upgradeAllTagBubbles);
  } else {
    // piccolo rAF per lasciare a React/Next il tempo di impostare gli inline style base
    requestAnimationFrame(_upgradeAllTagBubbles);
  }
  // osserva aggiunte dinamiche (navigazioni client-side)
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes && m.addedNodes.forEach((n) => {
        if (n.nodeType === 1 && n.matches && n.matches('.tag-bubble')) _upgradeOneTagBubble(n);
        if (n.nodeType === 1 && n.querySelectorAll) {
          n.querySelectorAll('.tag-bubble').forEach(_upgradeOneTagBubble);
        }
      });
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}
