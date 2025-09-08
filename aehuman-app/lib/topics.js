// topics.js — con stati visivi per selezionato/non selezionato

export const TopicKey = {  
  SLEEP: 'sleep',
  COLD: 'cold',
  LONGEVITY: 'longevity',
  PERFORMANCE: 'performance',
  BRAIN: 'brain',
  RESILIENCE: 'resilience',
  NUTRITION: 'nutrition',
  SPORT: 'sport',
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
  [TopicKey.SPORT]: {
    accent: '#e91e63',
    accentSoft: 'rgba(233,30,99,.15)',
    glow: '0 0 12px rgba(233,30,99,.5)',
    text: '#ffedf2',
    ring: '0 0 0 3px rgba(233,30,99,.3)',
    gradient: 'linear-gradient(135deg,#e91e63,#ff5722)'
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
  [TopicKey.NUTRITION]: ['nutrition'],
  [TopicKey.SPORT]: ['sport', 'training', 'fitness']
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
      return topics[0];
    }
  }
  return TopicKey.DEFAULT;
}

const topics = { TopicKey, TOPIC_THEME, TOPIC_TAGS, getTagTheme, getTopicFromTags };
export default topics;

/* ============================================================
   ENHANCER CON STATI SELEZIONATO/NON SELEZIONATO
   ============================================================ */

// Stili per stato NON selezionato (grigio, bordo tratteggiato)
const UNSELECTED_STYLE = {
  background: 'rgba(120, 120, 120, 0.15)',
  border: '2px dashed rgba(140, 140, 140, 0.6)',
  color: 'rgba(200, 200, 200, 0.8)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)'
};

function _norm(s) {
  return String(s || '').normalize('NFKD').replace(/\s+/g, ' ').trim().toLowerCase();
}

function _themeFromEl(el) {
  const raw =
    el.getAttribute('data-tag') ||
    el.getAttribute('data-topic') ||
    el.textContent ||
    '';
  const tag = _norm(raw) === 'tutti' || _norm(raw) === 'all' ? TopicKey.DEFAULT : _norm(raw);
  return TOPIC_THEME[tag] || getTagTheme(tag);
}

function _buildBubbleStyles(theme, isSelected = false) {
  if (!isSelected) {
    // Stato non selezionato: grigio con bordo tratteggiato
    return {
      ...UNSELECTED_STYLE,
      fontWeight: '600',
      letterSpacing: '.1px',
      textShadow: '0 1px 0 rgba(0,0,0,.1)',
      padding: '10px 18px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      borderRadius: '999px',
      transition: 'all .3s cubic-bezier(.2,.7,.2,1)',
      willChange: 'transform',
      outline: 'none',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      cursor: 'pointer'
    };
  }
  
  // Stato selezionato: colori del tema
  return {
    background:
      `${theme.gradient}, linear-gradient(180deg, rgba(255,255,255,.16), rgba(255,255,255,.08))`,
    backgroundBlendMode: 'overlay, normal',
    border: '2px solid rgba(255,255,255,0.3)',
    boxShadow: `${theme.glow}, 0 12px 28px rgba(0,0,0,.35), 0 0 0 1px ${theme.accentSoft}`,
    color: theme.text,
    WebkitBackdropFilter: 'blur(14px) saturate(140%)',
    backdropFilter: 'blur(14px) saturate(140%)',
    fontWeight: '800',
    letterSpacing: '.2px',
    textShadow: '0 1px 0 rgba(0,0,0,.25)',
    padding: '10px 18px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '999px',
    transition: 'all .3s cubic-bezier(.2,.7,.2,1)',
    willChange: 'transform',
    outline: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    cursor: 'pointer'
  };
}

function _ensureShine(el, theme, isSelected) {
  // Rimuovi shine esistente
  const existingShine = el.querySelector(':scope > .ae-shine');
  if (existingShine) existingShine.remove();
  
  // Aggiungi shine solo se selezionato
  if (!isSelected) return;
  
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

function _ensureBadge(el, theme, isSelected) {
  // Rimuovi badge esistente
  const existingBadge = el.querySelector(':scope > .ae-badge-boost');
  if (existingBadge) existingBadge.remove();
  
  // Aggiungi badge solo se selezionato
  if (!isSelected) return;
  
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

function _wireInteractions(el, theme, baseBoxShadow, isSelected) {
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
  
  if (isSelected) {
    el.addEventListener('focus', () => {
      el.style.boxShadow = `${theme.glow}, ${theme.ring}`;
    });
    el.addEventListener('blur', () => {
      el.style.boxShadow = baseBoxShadow;
    });
  } else {
    el.addEventListener('focus', () => {
      el.style.boxShadow = '0 0 0 3px rgba(140, 140, 140, 0.4)';
    });
    el.addEventListener('blur', () => {
      el.style.boxShadow = baseBoxShadow;
    });
  }
  
  // hover solo se niente touch
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      el.style.transform = 'translate(-50%, -50%) scale(1.05)';
      if (!isSelected) {
        // Leggero accenno di colore al hover per i non selezionati
        el.style.borderColor = 'rgba(180, 180, 180, 0.8)';
        el.style.color = 'rgba(220, 220, 220, 0.9)';
      }
    }
  });
  el.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') {
      el.style.transform = 'translate(-50%, -50%) scale(1)';
      if (!isSelected) {
        // Torna al colore originale
        el.style.borderColor = 'rgba(140, 140, 140, 0.6)';
        el.style.color = 'rgba(200, 200, 200, 0.8)';
      }
    }
  });
}

function _upgradeOneTagBubble(el) {
  if (!el || el.__aeUpgraded) return;
  el.__aeUpgraded = true;

  const theme = _themeFromEl(el);
  const isSelected = el.getAttribute('data-selected') === 'true' || el.getAttribute('aria-pressed') === 'true';
  const styles = _buildBubbleStyles(theme, isSelected);

  // Mantieni posizionamento
  const keep = {
    position: el.style.position || 'absolute',
    left: el.style.left,
    top: el.style.top,
    transform: el.style.transform || 'translate(-50%, -50%)'
  };

  // Applica stili
  Object.assign(el.style, styles, keep);

  // Layer extra solo se selezionato
  _ensureShine(el, theme, isSelected);
  _ensureBadge(el, theme, isSelected);

  _wireInteractions(el, theme, styles.boxShadow, isSelected);
}

function _upgradeAllTagBubbles() {
  const els = Array.from(document.querySelectorAll('.tag-bubble'));
  els.forEach(_upgradeOneTagBubble);
}

// Observer per modifiche allo stato data-selected
function _observeSelectionChanges() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'data-selected' || mutation.attributeName === 'aria-pressed')) {
        const el = mutation.target;
        if (el.classList.contains('tag-bubble')) {
          // Reset flag per forzare re-upgrade
          el.__aeUpgraded = false;
          _upgradeOneTagBubble(el);
        }
      }
    });
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-selected', 'aria-pressed'],
    subtree: true
  });
}

// Auto-run: appena il DOM è pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      _upgradeAllTagBubbles();
      _observeSelectionChanges();
    });
  } else {
    requestAnimationFrame(() => {
      _upgradeAllTagBubbles();
      _observeSelectionChanges();
    });
  }
  
  // Observer per nuovi elementi
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