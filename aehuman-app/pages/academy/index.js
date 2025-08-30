import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMemo, useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { TOPIC_THEME, getTopicFromTags } from '../../lib/topics';

export default function Academy({ items, allTags }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const tagsWithAll = useMemo(() => ['all', ...allTags], [allTags]);

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
      const maxRadius = Math.min(cx, cy) - 40; // evita overflow lato/sopra/sotto
      const gap = 80; // piu spazio rispetto al cervello
      const margin = Math.PI / 58; // evita tag vicini al centro
      const half = Math.ceil(tagsWithAll.length / 2);
      return tagsWithAll.map((_, i) => {
        const isTop = i < half;
        const arcIndex = isTop ? i : i - half;
        const arcCount = isTop ? half : tagsWithAll.length - half;
        const angleStart = isTop ? Math.PI + margin : margin;
        const angleEnd = isTop ? 2 * Math.PI - margin : Math.PI - margin;
        const angleStep = (angleEnd - angleStart) / (arcCount + 1);
        const requiredRadius = 100 / (2 * Math.sin(angleStep / 2)); // evita sovrapposizioni
        const radius = Math.min(maxRadius, requiredRadius);
        const angle = angleStart + (arcIndex + 1) * angleStep;
        const yCenter = isTop ? cy - gap : cy + gap;
        return {
          left: cx + radius * Math.cos(angle),
          top: yCenter + radius * Math.sin(angle),
        };
      });
    }

    const radius = Math.min(w, h) / 2 + 50; // layout desktop originale

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
    TOPIC_THEME?.DEFAULT ?? {
      gradient: 'linear-gradient(135deg,#6c43f3,#d066ff)',
      glow: '0 0 12px rgba(208,102,255,.5)',
      text: '#fff',
      accent: '#d066ff',
      accentSoft: 'rgba(208,102,255,.15)',
    };

  return (
    <Layout title="Academy">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
      <h1>Æ-HUMAN Academy</h1>


      <p id="academy-claim" className="ae-tagline">
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
          const key = t === 'all' ? 'default' : getTopicFromTags([t]);
          const theme = TOPIC_THEME[key] || FALLBACK_THEME;
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
                padding: '.45rem .8rem',
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
      <div className="glass" style={{ margin: '1rem 0', padding: '0.5rem' }}>
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
          <div key={a.slug} className="glass" style={{ padding: '1rem' }}>
            <h3 style={{ marginBottom: '.4rem' }}>{a.title}</h3>
            <p style={{ color: 'var(--muted)' }}>{a.excerpt}</p>
            <div
              style={{
                display: 'flex',
                gap: '.4rem',
                flexWrap: 'wrap',
                margin: '.4rem 0 .8rem',
              }}
            >
              {a.tags.map((t) => {
                const key = getTopicFromTags([t]);
                const theme = TOPIC_THEME[key] || FALLBACK_THEME;
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
            <Link className="btn" href={`/academy/${a.slug}`}>
              Apri
            </Link>
          </div>
        ))}
      </div>
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
          .articlesGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 767px) {
          .articlesGrid {
            grid-template-columns: 1fr;
          }
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
    const lines = content.split('\n');
    const title = (lines[0] || slug).trim();
    const body = lines.slice(2).join(' ');
    const excerpt = body.split(' ').slice(0, 40).join(' ') + '…';
    return {
      slug,
      title,
      excerpt,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  });

  const allTags = Array.from(
    new Set(items.flatMap((i) => i.tags).filter(Boolean))
  ).sort();

  return {
    props: { items, allTags },
  };
}
