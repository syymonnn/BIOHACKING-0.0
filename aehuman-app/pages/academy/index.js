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
  
  // x% orizzontale della linea rispetto al wrapper del cervello (0..100)
  const [lineXPercent, setLineXPercent] = useState(50);
  
  // ⬇️ Linea neon dinamica
  const MAX_LINE = 600;
  const [lineHeight, setLineHeight] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef(null);
  const lineBlockRef = useRef(null);
  const searchCardRef = useRef(null);

  const allTags = useMemo(
    () => Array.from(new Set(Object.values(TOPIC_TAGS).flat())),
    []
  );

  const tagsWithAll = useMemo(() => ['all', ...allTags], [allTags]);
  const [tagSizes, setTagSizes] = useState([]);

  // Step narrativi minimal e ispirational
  const narrativeSteps = useMemo(() => [
    {
      id: 1,
      threshold: 0.15,
      side: 'left',
      text: 'Biohacking è applicare metodo scientifico alla quotidianità',
    },
    {
      id: 2,
      threshold: 0.35,
      side: 'right', 
      text: 'Ogni dato diventa un’abitudine, ogni abitudine diventa longevità',
    },
    {
      id: 3,
      threshold: 0.55,
      side: 'left',
      text: 'Dati e ricerca si trasformano in energia, chiarezza, benessere.',
    },
    {
      id: 4,
      threshold: 0.75,
      side: 'right',
      text: 'Seleziona l’argomento che ti interessa, esplora, integra: l’Academy è il tuo strumento',
    }
  ], []);

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

  // helper per layout fibo opzionale
  function fibonacciSphere(N) {
    const GA = Math.PI * (3 - Math.sqrt(5));
    const pts = [];
    for (let i = 0; i < N; i++) {
      const k = i + 0.5;
      const y = 1 - (2 * k) / N;
      const r = Math.sqrt(1 - y * y);
      const phi = i * GA;
      const x = Math.cos(phi) * r;
      const z = Math.sin(phi) * r;
      pts.push({ x, y, z });
    }
    return pts;
  }

  const positions = useMemo(() => {
    const { w, h } = size;
    if (!w || !h) return [];

    const cx = w / 2;
    const cy = h / 2;
    const isMobile = w < 768;

    if (isMobile) {
      const GAP_X = 10; // spazio orizzontale tra bubble
      const GAP_Y = 10; // spazio verticale tra righe
      const MARGIN_SIDE = 12; // margine laterale

      // quanto staccare il "blocco righe" dal cervello
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

        const positionsRow = [];
        let x = startX;
        rowItems.forEach((it) => {
          const centerX = x + it.ww / 2;
          positionsRow.push([it.i, { left: centerX, top: y }]); // left centrato
          x += it.ww + GAP_X;
        });
        return positionsRow;
      };

      // Costruisci posizioni (righe dalla più vicina al cervello verso l'esterno)
      const posByIndex = new Array(tagsWithAll.length);

      topRows.forEach((rowItems, idx) => {
        const y = cy - gapY - idx * (tagH + GAP_Y);
        placeRow(rowItems, y).forEach(([i, p]) => {
          posByIndex[i] = p;
        });
      });

      botRows.forEach((rowItems, idx) => {
        const y = cy + gapY + idx * (tagH + GAP_Y);
        placeRow(rowItems, y).forEach(([i, p]) => {
          posByIndex[i] = p;
        });
      });

      return posByIndex;
    }

    // ✅ DESKTOP: scegli il layout
    const mode = 'circle'; // 'circle' (consigliato) oppure 'fibo'
    const N = tagsWithAll.length;

    // raggio dell'anello attorno al cervello
    const R = Math.min(w, h) * 0.65; // regola a gusto
    const START = -Math.PI / 2; // partenza dall'alto

    if (mode === 'circle') {
      // Centri equidistanti su cerchio
      return Array.from({ length: N }, (_, i) => {
        const ang = START + (2 * Math.PI * i) / N;
        return {
          left: cx + R * Math.cos(ang),
          top: cy + R * Math.sin(ang),
        };
      });
    }

    // ---- mode === 'fibo' ----
    const pts = fibonacciSphere(N);
    pts.sort((a, b) => Math.atan2(a.z, a.x) - Math.atan2(b.z, b.x));

    const band = 0.55;
    return pts.map((p) => {
      const x = p.x;
      const y = p.y * (1 - band);
      return {
        left: cx + R * x,
        top: cy + R * y,
      };
    });
  }, [size, tagsWithAll, tagSizes]);

  const ready = useMemo(
    () => Array.isArray(positions) && positions.length > 0,
    [positions]
  );

  useEffect(() => {
    if (!ready) return;

    let id;
    function tick() {
      id = requestAnimationFrame(tick);
    }

    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [ready]);

  // Calcola l'allineamento orizzontale della linea (centro della bolla più bassa)
  useEffect(() => {
    if (!wrapRef.current) return;

    const container = wrapRef.current;

    const refresh = () => {
      const bubbles = Array.from(container.querySelectorAll('.tag-bubble'));
      if (!bubbles.length) return;

      let bottomMost = null;
      let maxBottom = -Infinity;
      const cRect = container.getBoundingClientRect();

      bubbles.forEach((el) => {
        const r = el.getBoundingClientRect();
        const bottom = r.bottom - cRect.top; // coord relative al container
        if (bottom > maxBottom) {
          maxBottom = bottom;
          bottomMost = r;
        }
      });

      if (bottomMost) {
        const centerX = bottomMost.left - cRect.left + bottomMost.width / 2;
        const pct = cRect.width > 0 ? (centerX / cRect.width) * 100 : 50;
        setLineXPercent(Math.max(0, Math.min(100, pct)));
      }
    };

    refresh();

    // ricalcola dopo fine animazione e su resize
    const onResize = () => refresh();
    window.addEventListener('resize', onResize);

    const bubbles = Array.from(container.querySelectorAll('.tag-bubble'));
    const onAnimEnd = () => refresh();
    bubbles.forEach((b) => b.addEventListener('animationend', onAnimEnd));

    const t1 = setTimeout(refresh, 400);
    const t2 = setTimeout(refresh, 900);

    return () => {
      window.removeEventListener('resize', onResize);
      bubbles.forEach((b) => b.removeEventListener('animationend', onAnimEnd));
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [positions, tagSizes, ready]);

  // ⬇️ LOOP di sincronizzazione migliorato: più sensibile e fluido
  useEffect(() => {
    const apply = () => {
      if (!lineBlockRef.current) {
        rafRef.current = requestAnimationFrame(apply);
        return;
      }

      const blockRect = lineBlockRef.current.getBoundingClientRect();
      const lineTopPx = blockRect.top; // top della linea in viewport
      const viewportBottom = window.innerHeight;

      // spazio visibile dal top della linea fino al fondo della viewport
      const visibleRoom = Math.max(0, viewportBottom - lineTopPx - 8);

      // Calcolo scroll più preciso e sensibile
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      
      const viewportHeight = window.innerHeight;
      const maxScrollY = documentHeight - viewportHeight;
      
      // Percentuale di scroll più sensibile con easing
      let scrollPercent = maxScrollY > 0 ? Math.min(1, Math.max(0, scrollY / maxScrollY)) : 0;
      
      // Applica easing per movimento più fluido
      scrollPercent = easeOutCubic(scrollPercent);
      
      setScrollProgress(scrollPercent);

      // Calcola l'altezza desiderata della linea - più sensibile al movimento
      const desiredHeight = scrollPercent * MAX_LINE;
      
      // altezza massima permessa in questo frame
      const allowedMax = Math.min(MAX_LINE, visibleRoom);

      // Smoothing per transizioni più fluide
      const smoothedHeight = lerp(lineHeight, Math.max(0, Math.min(allowedMax, desiredHeight)), 0.08);
      
      setLineHeight(smoothedHeight);

      rafRef.current = requestAnimationFrame(apply);
    };

    rafRef.current = requestAnimationFrame(apply);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [lineHeight]);

  // Funzioni di easing e interpolazione
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // ⬇️ Gestione scroll events più responsive
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Il calcolo principale avviene nel rAF loop sopra
          ticking = false;
        });
        ticking = true;
      }
    };

    const onResize = () => {
      // Trigger per ricalcolo immediato
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

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
  const FALLBACK_THEME = TOPIC_THEME[TopicKey.DEFAULT] ?? {
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
        style={{
          marginLeft: '8px',
          letterSpacing: '0.75em',
          textAlign: 'left'
        }}
      >
        <svg
          id="tagline-svg"
          viewBox="0 0 800 80"
          preserveAspectRatio="xMinYMin meet"
          style={{
            width: '100%',
            height: '80px',
            overflow: 'visible'
          }}
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
            <filter
              id="tagline1-soft"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
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
          >
            È un muscolo, allenalo con la conoscenza.
          </text>
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
          >
            È un muscolo, allenalo con la conoscenza.
          </text>
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
          >
            Vivi meglio, più a lungo.
          </text>
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
          >
            Vivi meglio, più a lungo.
          </text>
        </svg>
      </p>

      {/* Brain + tags */}
      <div
        ref={wrapRef}
        style={{
          position: 'relative',
          marginTop: '8rem ',
          margin: '6rem 0',
          height: '400px',
          overflow: 'visible',
        }}
      >
        <model-viewer
          src="/3d/brain_holo.glb"
          alt="Æ-HUMAN brain"
          camera-controls
          auto-rotate
          auto-rotate-delay="0"
          progress-bar="none"
          rotation-per-second="20deg"
          interaction-prompt="none"
          exposure="0.1"
          shadow-intensity="0"
          style={{
            width: '100%',
            height: '100%',
            '--progress-bar-height': 0,
            position: 'relative',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />

        {tagsWithAll.map((t, i) => {
          const pos = positions[i] || { left: 0, top: 0 };
          const delay = i * 0.1;
          const theme = t === 'all'
            ? TOPIC_THEME[TopicKey.DEFAULT]
            : topics.getTagTheme(t);

          return (
            <button
              key={t}
              onClick={() => setTag(t)}
              className="tag-bubble"
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                '--x': `${pos.left}px`,
                '--y': `${pos.top}px`,
                transform: 'translate(-50%, -50%)',
                borderRadius: '999px',
                border: '1px solid transparent',
                background: theme.gradient,
                boxShadow: theme.glow,
                color: theme.text,
                cursor: 'pointer',
                animation: ready
                  ? `tagEnter 0.8s cubic-bezier(.22,1,.36,1) ${delay}s forwards`
                  : 'none',
                opacity: ready ? 1 : 0,
                whiteSpace: 'nowrap',
                userSelect: 'none',
                zIndex: 1,
              }}
              aria-pressed={tag === t}
            >
              {t === 'all' ? 'Tutti' : t}
            </button>
          );
        })}
      </div>

      {/* Contenitore NARRATIVO: Linea centrale + Step + Search card */}
      <div
        ref={lineBlockRef}
        style={{
          position: 'relative',
          margin: '4rem 0',
          minHeight: '800px',
          overflow: 'visible',
        }}
      >
        {/* Linea neon centrale che si allunga con scroll */}
        <div
          className="central-narrative-line"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: `${lineHeight}px`,
            background: 'linear-gradient(180deg, #00d9ff 0%, #0099cc 50%, #006699 100%)',
            boxShadow: `
              0 0 4px #00d9ff,
              0 0 12px rgba(0, 217, 255, 0.4),
              0 0 24px rgba(0, 217, 255, 0.2)
            `,
            borderRadius: '1px',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* Step narrativi minimal */}
        {narrativeSteps.map((step) => {
          const shouldShow = scrollProgress >= step.threshold;
          const stepProgress = Math.min(1, Math.max(0, (scrollProgress - step.threshold) / 0.05));
          const stepY = step.threshold * MAX_LINE + 60;
          
          return (
            <div
              key={step.id}
              className={`narrative-step narrative-step-${step.side}`}
              style={{
                position: 'absolute',
                top: `${stepY}px`,
                [step.side]: '5%',
                maxWidth: '300px',
                opacity: shouldShow ? stepProgress : 0,
                transform: `translateY(-50%) translateX(${shouldShow ? '0' : (step.side === 'left' ? '-20px' : '20px')})`,
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                zIndex: 2,
                pointerEvents: shouldShow ? 'auto' : 'none',
              }}
            >
              {/* Linea orizzontale sottile che collega alla linea centrale */}
              <div
                className="horizontal-connector"
                style={{
                  position: 'absolute',
                  top: '50%',
                  [step.side === 'left' ? 'right' : 'left']: '-5%',
                  width: '5%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #00d9ff)',
                  transform: 'translateY(-50%)',
                  opacity: stepProgress,
                  boxShadow: '0 0 4px rgba(0, 217, 255, 0.6)',
                }}
              />
              
              {/* Box glassmorphism monocromo */}
              <div
                className="narrative-glass-box"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: `
                    0 8px 32px rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(255, 255, 255, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1)
                  `,
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: '400',
                  lineHeight: '1.5',
                  letterSpacing: '0.01em',
                  textAlign: step.side === 'left' ? 'left' : 'right',
                }}
              >
                {step.text}
              </div>
            </div>
          );
        })}

        {/* Search card alla fine del percorso */}
        <div
          ref={searchCardRef}
          className="search-card-container"
          style={{
            position: 'absolute',
            top: `${MAX_LINE + 80}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '600px',
            opacity: scrollProgress >= 0.9 ? 1 : 0.2,
            transition: 'opacity 0.6s ease',
          }}
        >
          <div 
            className="final-search-card" 
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(0, 217, 255, 0.2)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: `
                0 12px 48px rgba(0, 0, 0, 0.15),
                0 0 0 1px rgba(255, 255, 255, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 0 20px rgba(0, 217, 255, 0.1)
              `,
            }}
          >
            <h3 style={{ 
              margin: '0 0 1.5rem 0',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '1.3rem',
              fontWeight: '500',
              letterSpacing: '0.02em'
            }}>
              Inizia la tua esplorazione
            </h3>
            
            <input
              placeholder="Cerca argomenti (es: sonno, microbiota, training)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={{
                width: '100%',
                padding: '1.2rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'rgba(255, 255, 255, 0.9)',
                outline: 'none',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0, 217, 255, 0.5)';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 217, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      <p className="ae-tagline" style={{ marginTop: '1rem' }}>
        <svg
          viewBox="0 0 800 50"
          style={{
            width: '100%',
            height: '50px',
            overflow: 'visible'
          }}
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
            <filter
              id="tagline2-soft"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
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

        /* Animazione sottile per la linea centrale neon */
        .central-narrative-line {
          animation: centralLineGlow 4s ease-in-out infinite alternate;
        }

        @keyframes centralLineGlow {
          0% {
            opacity: 0.8;
            filter: brightness(1);
          }
          100% {
            opacity: 1;
            filter: brightness(1.2);
          }
        }

        /* Stili per i box glassmorphism */
        .narrative-step {
          will-change: transform, opacity;
        }

        .narrative-glass-box {
          position: relative;
          transition: all 0.3s ease;
        }

        .narrative-glass-box:hover {
          transform: translateY(-2px);
          boxShadow: 
            0 12px 40px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            0 0 16px rgba(0, 217, 255, 0.1);
        }

        /* Animazione per le linee orizzontali di connessione */
        .horizontal-connector {
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .narrative-step-left .horizontal-connector {
          background: linear-gradient(90deg, #00d9ff, transparent);
        }

        .narrative-step-right .horizontal-connector {
          background: linear-gradient(270deg, #00d9ff, transparent);
        }

        /* Stili per la search card finale */
        .final-search-card {
          transition: all 0.4s ease;
          position: relative;
        }

        .final-search-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.1), transparent, rgba(255, 255, 255, 0.05));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask-composite: xor;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .final-search-card:hover::before {
          opacity: 1;
        }

        .final-search-card:hover {
          transform: translateY(-4px);
          boxShadow: 
            0 16px 56px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.15),
            0 0 32px rgba(0, 217, 255, 0.15);
        }

        /* Layout responsivo migliorato */
        @media (max-width: 768px) {
          .narrative-step {
            left: 10px !important;
            right: 10px !important;
            max-width: none !important;
          }

          .narrative-step-right {
            left: 10px !important;
            text-align: left !important;
          }

          .narrative-glass-box {
            font-size: 0.9rem !important;
            padding: 1.2rem !important;
            text-align: left !important;
          }

          .horizontal-connector {
            display: none;
          }

          .central-narrative-line {
            left: 30px !important;
            transform: none !important;
          }
        }

        .articlesGrid {
          display: grid;
          gap: 1rem;
          margin-top: 3rem;
          max-width: 1050px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (min-width: 768px) {
          .articlesGrid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 767px) {
          .articlesGrid {
            grid-template-columns: 1fr;
          }
        }

        .articleCard {
          position: relative;
          overflow: hidden;
          padding: 1rem;
          height: 420px;
          border-radius: 12px;
        }

        .articleCard::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          pointer-events: none;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1), transparent 60%),
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
          height: 100%;
        }

        .cardTop {
          flex: 1 1 auto;
        }

        .cardTitle {
          margin: 0 0 .35rem 0;
        }

        .cardExcerpt {
          color: var(--muted);
          display: -webkit-box;
          -webkit-line-clamp: 12;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        .cardBottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
        }

        .tagRow {
          display: flex;
          gap: .4rem;
          flex-wrap: wrap;
        }

        .cardBottom :global(.btn),
        .cardBtn {
          align-self: flex-end;
        }

        /* Animazione per l'entrata delle bolle tags */
        @keyframes tagEnter {
          from {
            transform: translate(-50%, -50%) scale(0.92);
            left: 50%;
            top: 50%;
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            left: var(--x);
            top: var(--y);
            opacity: 1;
          }
        }

        /* Micro-animazioni per interattività */
        .tag-bubble {
          transition: all 0.2s ease;
        }

        .tag-bubble:hover {
          transform: translate(-50%, -50%) scale(1.05);
          filter: brightness(1.1);
        }

        .tag-bubble:active {
          transform: translate(-50%, -50%) scale(0.98);
        }

        /* Debug scroll (nascosto in produzione) */
        .scroll-debug {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          padding: 8px;
          border-radius: 4px;
          font-size: 12px;
          z-index: 10000;
          display: none;
        }
      `}</style>

      {/* Debug info (opzionale) */}
      <div className="scroll-debug">
        Progress: {(scrollProgress * 100).toFixed(1)}% | Line: {lineHeight.toFixed(0)}px
      </div>
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

    // Titolo: preferisci front-matter title, altrimenti prima riga di contenuto senza "#"
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

    // Excerpt: usa front-matter excerpt se presente, altrimenti fallback
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

  return { props: { items } };
}