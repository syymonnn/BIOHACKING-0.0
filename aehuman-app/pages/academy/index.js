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
      const sizes = els.map(el => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });
      setTagSizes(sizes);
    });
  }, [tagsWithAll.length]);


    const tagSizeRef = useRef({ w: 96, h: 36 }); // fallback

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.tag-bubble'));
    if (!els.length) return;
    const w = Math.max(
      64,
      Math.round(
        els.reduce((s, el) => s + el.getBoundingClientRect().width, 0) / els.length
      )
    );
    const h = Math.max(
      28,
      Math.round(
        els.reduce((s, el) => s + el.getBoundingClientRect().height, 0) / els.length
      )
    );
    tagSizeRef.current = { w, h };
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



    const radius = Math.min(w, h) / 2 + 55; // layout desktop originale

    return tagsWithAll.map((_, i) => {
      const angle = (i / tagsWithAll.length) * Math.PI * 2;
      return {
        left: cx + radius * Math.cos(angle),
        top: cy + radius * Math.sin(angle),
      };
    });
  }, [size, tagsWithAll]);

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

  // ===== BACKGROUND LETTERE: init su ogni card =====
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll('.articleCard'));
    const cleanups = [];

    const lettersSet = ['S','L','E','P','Æ','A','H','N','T','C','F','M','R','D'];

    cards.forEach((card) => {
      const bg = card.querySelector('.backgroundArticle');
      if (!bg) return;

      // pulizia e dimensioni
      bg.innerHTML = '';
      const r0 = card.getBoundingClientRect();
      const W = Math.max(200, Math.floor(r0.width));
      const H = Math.max(160, Math.floor(r0.height));

      const densityAt = (x, y) => {
        const cx = W / 2, cy = H / 2;
        const maxD = Math.hypot(cx, cy);
        const d = Math.hypot(x - cx, y - cy);
        return 1 - d / maxD;
      };

      // lettere generate lazy: prima hover
      let letters = [];
      let cardRect = null;
      const NUM = 20;
      const RADIUS = 50;
      const RADIUS_SQ = RADIUS * RADIUS;

      const initLetters = () => {
        if (letters.length) return;
        bg.innerHTML = '';
        cardRect = card.getBoundingClientRect();
        const W = Math.max(200, Math.floor(cardRect.width));
        const H = Math.max(160, Math.floor(cardRect.height));

        for (let i = 0; i < NUM; i++) {
          const el = document.createElement('div');
          el.className = 'letter';
          const x = Math.random() * (W - 20);
          const y = Math.random() * (H - 20);
          const dens = densityAt(x, y);

          if (dens > 0.6) { el.classList.add('center-dense'); el.style.opacity = '0.65'; }
          else if (dens > 0.3) { el.classList.add('medium-zone'); el.style.opacity = '0.55'; }
          else { el.classList.add('outer-sparse'); el.style.opacity = '0.77'; }

          el.textContent = lettersSet[Math.floor(Math.random() * lettersSet.length)];
          el.style.left = x + 'px';
          el.style.top = y + 'px';
          el.style.animationDelay = (Math.random() * 8) + 's';
          bg.appendChild(el);

          const lr = el.getBoundingClientRect();
          letters.push({
            el,
            x: lr.left - cardRect.left + lr.width / 2,
            y: lr.top - cardRect.top + lr.height / 2,
            active: false,
          });
        }
      };

      let raf = null;
      const mouse = { x: 0, y: 0 };
      const updateLetters = () => {
        raf = null;
        letters.forEach((l) => {
          const dx = mouse.x - l.x;
          const dy = mouse.y - l.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < RADIUS_SQ) {
            const k = 1 - Math.sqrt(dist2) / RADIUS;
            if (!l.active) l.active = true;
            l.el.style.color = `rgba(173, 216, 230, ${0.25 + k * 0.55})`;
            l.el.style.textShadow = `0 0 ${Math.round(k * 14)}px rgba(173, 216, 230, ${0.2 + k * 0.6})`;
            l.el.style.transform = 'scale(1.1)';
          } else if (l.active) {
            l.active = false;
            l.el.style.color = '';
            l.el.style.textShadow = '';
            l.el.style.transform = '';
          }
        });
      };

      const onMove = (e) => {
        if (!letters.length) initLetters();
        mouse.x = e.clientX - cardRect.left;
        mouse.y = e.clientY - cardRect.top;
        if (!raf) raf = requestAnimationFrame(updateLetters);
      };
      const onLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        letters.forEach(({ el }) => {
          el.style.color = '';
          el.style.textShadow = '';
          el.style.transform = '';
        });
      };

      card.addEventListener('mouseenter', initLetters);
      card.addEventListener('mousemove', onMove, { passive: true });
      card.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('mouseenter', initLetters);
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
        bg.innerHTML = '';
        letters = [];
        if (raf) cancelAnimationFrame(raf);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [filtered.length]);

  return (
    <Layout title="Academy">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
      <h1 style={{ marginLeft: '8px' }}>Æ-HUMAN Academy</h1>

      <p id="academy-claim" className="ae-tagline" style={{ marginLeft: '8px' }}>
        <span>È un muscolo, allenalo con la conoscenza.</span>
        <br />
        <span style={{ display: 'inline-block', marginTop: '12px' }}>
          Vivi meglio, più a lungo.
        </span>
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
        Solo contenuti basati su evidenze: articoli, ricerche, protocolli.
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
            <div className="backgroundArticle" />

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

        .articleCard :global(.backgroundArticle) {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          overflow: hidden;
          background: transparent; /* nessuno sfondo */
          pointer-events: none;    /* non blocca i click */
          min-height: 180px;
        }

        .articleCard {
          position: relative;
          overflow: hidden;
          padding: 1rem;
          height: 420px;           /* altezza fissa */
          border-radius: 12px;
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



      {/* Stili GLOBAL per elementi creati via DOM */}
      <style jsx global>{`
        .backgroundArticle .letter {
          position: absolute;
          font-family: 'Courier New', monospace;
          color: rgba(160, 200, 255, 0.18); /* molto trasparenti */
          font-weight: 300;
          transition: all 0.25s ease;
          user-select: none;
          will-change: transform, color, text-shadow;
        }
        .backgroundArticle .center-dense {
          font-size: 14px;
          animation: ae-gentle-pulse 4s infinite ease-in-out;
        }
        .backgroundArticle .medium-zone {
          font-size: 12px;
          animation: ae-slow-drift 8s infinite ease-in-out;
        }
        .backgroundArticle .outer-sparse {
          font-size: 10px;
          animation: ae-fade-glow 6s infinite ease-in-out;
        }
        @keyframes ae-gentle-pulse {
          0%, 100% { opacity: 0.18; }
          50% { opacity: 0.28; }
        }
        @keyframes ae-slow-drift {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes ae-fade-glow {
          0%, 100% { opacity: 0.06; text-shadow: none; }
          50% { opacity: 0.12; text-shadow: 0 0 4px rgba(100, 149, 237, 0.25); }
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
