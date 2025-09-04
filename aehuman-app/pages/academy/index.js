import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMemo, useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import topics from '../../lib/topics';
const { TOPIC_THEME, TOPIC_TAGS, TopicKey, getTagTheme, getTopicFromTags } = topics;

export default function Academy({ items }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const allTags = useMemo(
    () => Array.from(new Set(Object.values(TOPIC_TAGS).flat())),
    []
  );
  const tagsWithAll = useMemo(() => ['all', ...allTags], [allTags]);
  const [tagSizes, setTagSizes] = useState([]);


  useEffect(() => {
    // aspetta un paint: i bottoni devono esistere nel DOM
    requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll('.tag-bubble'));
      if (!els.length) return;
      const sizes = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });
      setTagSizes(sizes);
    });
  }, [tagsWithAll.length]);



  useEffect(() => {
    function update() {
      if (wrapRef.current) {
        const rect = wrapRef.current.getBoundingClientRect();
        setSize({ w: rect.width, h: rect.height });
      }
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const positions = useMemo(() => {
    const { w, h } = size;
    if (!w || !h) return [];

    const cx = w / 2;
    const cy = h / 2;
    const isMobile = w < 768;

    if (isMobile) {
    const GAP_X = 10;           // spazio orizzontale tra bubble
    const GAP_Y = 10;           // spazio verticale tra righe
    const MARGIN_SIDE = 12;     // margine laterale
    const cx = w / 2, cy = h / 2;

    // quanto staccare il “blocco righe” dal cervello
    const tagH = (tagSizes[0]?.h ?? 36);
    const gapY = Math.max(120, Math.floor(h * 0.42)); // aumenta se tocca il cervello

    // larghezze reali in ordine (fallback 90)
    const widths = tagsWithAll.map((_, i) => tagSizes[i]?.w ?? 90);

    // Pack su più righe entro MAX_W
    const MAX_W = Math.max(160, w - 2 * MARGIN_SIDE);
    const rows = [];
    let cur = [], curW = 0;

    widths.forEach((ww, i) => {
      const need = (cur.length ? GAP_X : 0) + ww;
      if (curW + need > MAX_W && cur.length) {
        rows.push(cur);
        cur = [{ i, ww }];
        curW = ww;
      } else {
        cur.push({ i, ww });
        curW += need;
      }
    });
    if (cur.length) rows.push(cur);

    // Dividi le righe metà sopra (vicine al cervello) e metà sotto
    const halfRows = Math.ceil(rows.length / 2);
    const topRows = rows.slice(0, halfRows);
    const botRows = rows.slice(halfRows);

    // Helper: posiziona una riga centrata e clampata ai lati
    const placeRow = (rowItems, y) => {
      const rowW = rowItems.reduce((s, it, k) => s + it.ww + (k ? GAP_X : 0), 0);
      let startX = cx - rowW / 2;
      // clamp ai margini
      startX = Math.min(Math.max(startX, MARGIN_SIDE), w - MARGIN_SIDE - rowW);

      const positions = [];
      let x = startX;
      rowItems.forEach((it) => {
        const centerX = x + it.ww / 2;
        positions.push([it.i, { left: centerX, top: y }]); // left centrato
        x += it.ww + GAP_X;
      });
      return positions;
    };

    // Costruisci posizioni (righe dalla più vicina al cervello verso l’esterno)
    const posByIndex = new Array(tagsWithAll.length);
    topRows.forEach((rowItems, idx) => {
      const y = cy - gapY - idx * (tagH + GAP_Y);
      placeRow(rowItems, y).forEach(([i, p]) => { posByIndex[i] = p; });
    });
    botRows.forEach((rowItems, idx) => {
      const y = cy + gapY + idx * (tagH + GAP_Y);
      placeRow(rowItems, y).forEach(([i, p]) => { posByIndex[i] = p; });
    });

    return posByIndex;
  }



    const radius = Math.min(w, h) / 2 + 63; // layout desktop originale
    const GAP = 25; // distanza costante tra le bubble
    const fallbackW = tagSizes[0]?.w ?? 90; // larghezza di fallback

    // larghezze reali + fallback
    const widths = tagsWithAll.map((_, i) => tagSizes[i]?.w ?? fallbackW);

    // somma di larghezze + gap (verrà scalata per entrare nella circonferenza)
    const totalLen = widths.reduce((s, ww) => s + ww, 0) + GAP * widths.length;
    const circumference = 2 * Math.PI * radius;
    const scale = circumference / totalLen; // i gap sono scalati insieme alle larghezze

    let cur = 0;
    return widths.map((ww) => {
      const centerLen = cur + (ww * scale) / 2;
      const angle = -Math.PI / 2 + centerLen / radius;
      const pos = {
        left: cx + radius * Math.cos(angle),
        top: cy + radius * Math.sin(angle),
      };
      cur += (ww + GAP) * scale;
      return pos;
    });

  }, [size, tagsWithAll, tagSizes]);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return items.filter((item) => {
      const matchQ =
        qn === '' ||
        item.title.toLowerCase().includes(qn) ||
        item.excerpt.toLowerCase().includes(qn);
      const matchTag = tag === 'all' || item.tags.includes(tag);
      return matchQ && matchTag;
    });
  }, [q, tag, items]);

  
  // Fallback tema per sicurezza (nel caso 'all' o tag strani)
  const FALLBACK_THEME =
    TOPIC_THEME[TopicKey.DEFAULT] ?? {
      gradient: 'linear-gradient(135deg,#6c43f3,#d066ff)',
      glow: '0 0 12px rgba(208,102,255,.5)',
      text: '#fff',
      accent: '#d066ff',
      accentSoft: 'rgba(208,102,255,.15)',
    };

  // Segui il puntatore per aggiornare il gradiente del claim
  useEffect(() => {
    const svg = document.getElementById('tagline-svg');
    const grad = document.getElementById('tagline1-glow');
    if (!svg || !grad) return;

    function handle(e) {
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      grad.setAttribute('cx', x.toFixed(1));
      grad.setAttribute('cy', y.toFixed(1));
    }

    svg.addEventListener('pointermove', handle);
    return () => svg.removeEventListener('pointermove', handle);
  }, []);


  return (
    <Layout title="Academy">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
      <h1 style={{ marginLeft: '8px' }}>Æ-HUMAN Academy</h1>

      <p
        id="academy-claim"
        className="ae-tagline"
        style={{ marginLeft: '8px', letterSpacing: '0.75em', textAlign: 'left' }}>
        <svg
          id="tagline-svg"
          viewBox="0 0 800 80"
          preserveAspectRatio="xMinYMin meet"
          style={{ width: '100%', height: '80px', overflow: 'visible' }}
        >
          <defs>
            <radialGradient
              id="tagline1-glow"
              gradientUnits="userSpaceOnUse"
              cx="400"
              cy="40"
              r="240"
            >
              <stop offset="0%" stopColor="#ffab35ff" stopOpacity="0.18" />
              <stop offset="35%" stopColor="#a56bff" stopOpacity="0.28" />
              <stop offset="65%" stopColor="#a56bff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="tagline1-base" x1="0" y1="0" x2="800" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
            </linearGradient>
            <filter id="tagline1-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <text
            className="logo-bottom-text"
            x="0"
            y="30"
            textAnchor="start"
            fontFamily="Inter,Segoe UI,Arial,sans-serif"
            fontWeight="700"
            fontSize="22"
            fill="none"
            stroke="url(#tagline1-base)"
            strokeWidth="0.6"
            strokeLinejoin="round"
          >{`È un muscolo, allenalo con la conoscenza.`}</text>
          <text
            className="logo-bottom-text"
            x="0"
            y="30"
            textAnchor="start"
            fontFamily="Inter,Segoe UI,Arial,sans-serif"
            fontWeight="700"
            fontSize="22"
            fill="none"
            stroke="url(#tagline1-glow)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.85"
            filter="url(#tagline1-soft)"
          >{`È un muscolo, allenalo con la conoscenza.`}</text>
          <text
            className="logo-bottom-text"
            x="0"
            y="60"
            textAnchor="start"
            fontFamily="Inter,Segoe UI,Arial,sans-serif"
            fontWeight="700"
            fontSize="22"
            fill="none"
            stroke="url(#tagline1-base)"
            strokeWidth="0.6"
            strokeLinejoin="round"
          >{`Vivi meglio, più a lungo.`}</text>
          <text
            className="logo-bottom-text"
            x="0"
            y="60"
            textAnchor="start"
            fontFamily="Inter,Segoe UI,Arial,sans-serif"
            fontWeight="700"
            fontSize="22"
            fill="none"
            stroke="url(#tagline1-glow)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.85"
            filter="url(#tagline1-soft)"
          >{`Vivi meglio, più a lungo.`}</text>
        </svg>
      </p>

      {/* Brain + tags */}
      <div
        ref={wrapRef}
        style={{ position: 'relative', margin: '6rem 0', height: '400px' }}
      >
        <model-viewer
          src="/3d/brain_holo.glb"
          alt="Æ-HUMAN brain"
          camera-controls
          auto-rotate
          rotation-per-second="20deg"
          interaction-prompt="none"
          exposure="1.0"
          shadow-intensity="0"
          style={{ width: '100%', height: '100%' }}
        />
        {tagsWithAll.map((t, i) => {
          const pos = positions[i] || { left: 0, top: 0 };
          const theme =
            t === 'all'
              ? TOPIC_THEME[TopicKey.DEFAULT]
              : topics.getTagTheme(t);
          return (
            <button
              key={t}
              onClick={() => setTag(t)}
              className="tag-bubble"
              style={{
                position: 'absolute',
                left: pos.left,
                top: pos.top,
                transform: 'translate(-50%, -50%)',
                borderRadius: '999px',
                border: '1px solid transparent',
                background: theme.gradient,
                boxShadow: theme.glow,
                color: theme.text,
                cursor: 'pointer',
                animationDelay: `${i * 0.2}s`,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
              aria-pressed={tag === t}
            >
              {t === 'all' ? 'Tutti' : t}
            </button>
          );
        })}
      </div>

      <p className="ae-tagline" style={{ marginTop: '1rem' }}>
        <svg
          viewBox="0 0 800 50"
          style={{ width: '100%', height: '50px', overflow: 'visible' }}
        >
          <defs>
            <radialGradient id="tagline2-glow" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#ffd735ff" stopOpacity="0.2" />
              <stop offset="35%" stopColor="#524cffff" stopOpacity="0.28" />
              <stop offset="65%" stopColor="#524cffff" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="tagline2-base" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
            </linearGradient>
            <filter id="tagline2-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <text
            className="logo-bottom-text tagline-small"
            x="50%"
            y="38"
            textAnchor="middle"
            fontFamily="Inter,Segoe UI,Arial,sans-serif"
            fontWeight="700"
            fontSize="18"
            fill="none"
            stroke="url(#tagline2-base)"
            strokeWidth="0.6"
            strokeLinejoin="round"
          >
            Solo contenuti basati su evidenze: articoli, ricerche, protocolli.
          </text>
          <text
            className="logo-bottom-text tagline-small"
            x="50%"
            y="38"
            textAnchor="middle"
            fontFamily="Inter,Segoe UI,Arial,sans-serif"
            fontWeight="700"
            fontSize="18"
            fill="none"
            stroke="url(#tagline2-glow)"
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.85"
            filter="url(#tagline2-soft)"
          >
            Solo contenuti basati su evidenze: articoli, ricerche, protocolli.
          </text>
        </svg>
      </p>

      {/* Search card */}
      <div className="glass" style={{ margin: '4rem 0', padding: '0.4rem' }}>
        <input
          placeholder="Cerca argomenti (es: sonno, microbiota, training)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{
            width: '100%',
            padding: '.9rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,.2)',
            background: 'rgba(255,255,255,.06)',
            color: '#fff',
            outline: 'none',
          }}
        />
      </div>

      {/* List */}
      <div className="articlesGrid">
        {filtered.map((a) => (
          <div key={a.slug} className="glass articleCard">
            <div className="cardContent">
              <div className="cardTop">
                <h3 className="cardTitle">{a.title}</h3>
                <p className="cardExcerpt">{a.excerpt}</p>
              </div>

              <div className="cardBottom">
                <div className="tagRow">
                  {a.tags.map((t) => {
                    const key = getTopicFromTags([t]);
                    const theme = getTagTheme(t) || FALLBACK_THEME;
                    return (
                      <span
                        key={t}
                        style={{
                          fontSize: '.72rem',
                          padding: '.2rem .5rem',
                          borderRadius: '999px',
                          background: theme.accentSoft,
                          border: `1px solid ${theme.accent || '#888'}`,
                          color: theme.text,
                        }}
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>

                <Link className="btn cardBtn" href={`/academy/${a.slug}`}>
                  Apri
                </Link>
              </div>
            </div>
          </div>


        ))}
      </div>

      {/* STILI */}
      <style jsx>{`
        .ae-tagline .logo-bottom-text {
          font-size: 28px;
          letter-spacing: 0;
          transition: letter-spacing 0.5s ease-in-out;
        }

        .ae-tagline .logo-bottom-text.tagline-small {
          font-size: 32px;
        }

        .ae-tagline:hover .logo-bottom-text {
          letter-spacing: 3px;
        }

        .articlesGrid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
          max-width: 1050px;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .articlesGrid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 767px) {
          .articlesGrid { grid-template-columns: 1fr; }
        }

        .articleCard {
          position: relative;
          overflow: hidden;
          padding: 1rem;
          height: 420px;           /* altezza fissa */
          border-radius: 12px;
        }

        .articleCard::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          pointer-events: none;
          background:
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1), transparent 60%),
            radial-gradient(circle at 70% 80%, rgba(255,255,255,0.07), transparent 60%);
          opacity: 0;
          transform: scale(1.05);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .articleCard:hover::before {
          opacity: 1;
          transform: scale(1);
        }

        .cardContent {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;            /* occupa tutta l’altezza della card */
        }

        .cardTop { 
          flex: 1 1 auto;          /* prende lo spazio disponibile sopra */
        }

        .cardTitle { margin: 0 0 .35rem 0; }

        .cardExcerpt {
          color: var(--muted);
          display: -webkit-box;
          -webkit-line-clamp: 12;   /* mostra al massimo 3 righe */
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        /* TAG sopra, BOTTONE in basso a destra, con spazio tra i due */
        .cardBottom {
          margin-top: auto; 
          display: flex;
          flex-direction: column;  /* due righe */
          gap: 1.8rem;              /* spazio tra tag e bottone */
        }

        .tagRow {
          display: flex;
          gap: .4rem;
          flex-wrap: wrap;
        }

        /* allinea il bottone a destra in basso */
        .cardBottom :global(.btn),
        .cardBtn {
          align-self: flex-end;
        }
      `}</style>


    </Layout>
  );
}

export async function getStaticProps() {
  const dir = path.join(process.cwd(), 'data', 'articles');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  const items = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data, content } = matter(raw);

    // Titolo: preferisci front-matter `title`, altrimenti prima riga di contenuto senza "#"
    let title = (typeof data.title === 'string' && data.title.trim().length)
      ? data.title.trim()
      : '';
    if (!title) {
      const firstNonEmpty = content
        .split('\n')
        .map(l => l.trim())
        .find(l => l.length > 0) || slug;
      title = firstNonEmpty.replace(/^#{1,6}\s*/, '');
    }

    // Corpo: togli l'eventuale heading iniziale e riga vuota successiva
    const contentLines = content.split('\n');
    let start = 0;
    if (contentLines[start]?.trim().startsWith('#')) start += 1;
    if (contentLines[start]?.trim() === '') start += 1;
    const body = contentLines.slice(start).join(' ');

    // Excerpt: usa front-matter `excerpt` se presente, altrimenti fallback
    const excerpt = (typeof data.excerpt === 'string' && data.excerpt.trim().length)
      ? data.excerpt.trim()
      : (body.split(' ').slice(0, 40).join(' ') + '…');

    return {
      slug,
      title,
      excerpt,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };

  });

  return {
    props: { items },
  };
}
