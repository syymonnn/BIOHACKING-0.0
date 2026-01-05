import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMemo, useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import topics from '../../lib/topics';

const { TOPIC_THEME, TopicKey, getTagTheme, getTopicFromTags } = topics;

// --- CONFIGURAZIONE COLORI & TEMA ---
const THEME = {
    cyan: '#00f0ff',
    purple: '#bd00ff',
    darkBg: '#020408',
    glassBg: 'rgba(10, 15, 30, 0.4)',
    glassBorder: 'rgba(0, 240, 255, 0.15)'
};

export default function Academy({ items }) {
  const [q, setQ] = useState('');
  const [selectedTags, setSelectedTags] = useState(new Set());
  const wrapRef = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [tagSizes, setTagSizes] = useState([]);

  const allTags = useMemo(
    () => Array.from(new Set(Object.values(topics.TOPIC_TAGS).flat())),
    []
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      const els = Array.from(document.querySelectorAll('.tag-bubble-btn'));
      if (!els.length) return;
      const sizes = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { w: r.width, h: r.height };
      });
      setTagSizes(sizes);
    });
  }, [allTags.length]);

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
    const N = allTags.length;

    if (isMobile) {
        // Layout mobile semplificato: due colonne sotto il cervello
        const cols = 2;
        const rows = Math.ceil(N / cols);
        const cellW = w / cols;
        const cellH = 60; // Altezza stimata riga
        const startY = h * 0.65; // Inizia sotto il cervello

        return allTags.map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                left: (cellW * col) + cellW / 2,
                top: startY + (row * cellH)
            };
        });
    }

    // DESKTOP: Cerchio perfetto attorno al centro
    // Aumentiamo leggermente il raggio orizzontale per compensare la forma della schermo
    const R_base = Math.min(w, h) * 0.35; 
    const Rx = R_base * 1.3; 
    const Ry = R_base * 1.0;

    return Array.from({ length: N }, (_, i) => {
      // Partiamo da -PI/2 (in alto) e distribuiamo equamente
      const ang = -Math.PI / 2 + (2 * Math.PI * i) / N;
      return {
        left: cx + Rx * Math.cos(ang),
        top: cy + Ry * Math.sin(ang),
      };
    });
  }, [size, allTags]);

  const ready = useMemo(() => Array.isArray(positions) && positions.length > 0, [positions]);

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return items.filter((item) => {
      const matchQ =
        qn === '' ||
        item.title.toLowerCase().includes(qn) ||
        item.excerpt.toLowerCase().includes(qn);
      const matchTag = selectedTags.size === 0 || item.tags.some(t => selectedTags.has(t));
      return matchQ && matchTag;
    });
  }, [q, selectedTags, items]);

  const toggleTag = (t) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(t)) newSet.delete(t);
      else newSet.add(t);
      return newSet;
    });
  };

  // Fallback tema per le card
  const FALLBACK_THEME = { accent: THEME.cyan };

  return (
    <Layout title="Academy - Interface">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />

      {/* SFONDO GLOBALE AVANZATO */}
      <div className="academy-bg-layer" />

      {/* HEADER */}
      <div className="academy-header">
        <h1 className="neon-title">Æ-HUMAN <span className="text-stroke">ACADEMY</span></h1>
        <div className="subtitle-container">
             <p className="neon-subtitle">
                Protocolli basati su evidenze per l'ottimizzazione umana.
             </p>
             <div className="scan-line"></div>
        </div>
      </div>

      {/* AREA 3D CENTRALIZZATA (HUD) */}
      <div className="hud-wrapper-outer">
          {/* Glow centrale dietro il cervello per il focus */}
          <div className="central-core-glow"></div>
          
          <div className="hud-container" ref={wrapRef}>
            
            {/* CONNESSIONI SVG (Cyber-conduits) */}
            <svg className="hud-connections" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {/* Filtro glow per le linee */}
                    <filter id="line-glow">
                        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                     {/* Gradiente per le linee */}
                    <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{stopColor: THEME.purple, stopOpacity: 0.1}} />
                        <stop offset="50%" style={{stopColor: THEME.cyan, stopOpacity: 0.6}} />
                        <stop offset="100%" style={{stopColor: THEME.cyan, stopOpacity: 1}} />
                    </linearGradient>
                </defs>

                {/* Anelli centrali rotanti */}
                <g className="rotating-rings-group">
                    <circle cx="50%" cy="50%" r="18%" className="static-ring" />
                    <circle cx="50%" cy="50%" r="20%" className="pulsing-ring" />
                    <circle cx="50%" cy="50%" r="22%" className="rotating-dashed-ring" />
                </g>

                {/* Linee di connessione ai tag */}
                {ready && positions.map((pos, i) => {
                    const isMobile = size.w < 768;
                    // Su mobile nascondiamo le linee perché il layout cambia drasticamente
                    if(isMobile && pos.top > size.h * 0.6) return null;

                    return (
                    <line 
                        key={`line-${i}`}
                        x1="50%" 
                        y1="50%" 
                        x2={pos.left} 
                        y2={pos.top} 
                        className="connector-line"
                        filter="url(#line-glow)"
                    />
                )})}
            </svg>

            {/* 3D MODEL - Centrato perfettamente */}
            <div className="model-wrapper">
                <model-viewer
                src="/3d/brain_holo.glb"
                alt="Æ-HUMAN brain"
                camera-controls={false}
                auto-rotate
                rotation-per-second="10deg" // Rotazione più lenta ed elegante
                interaction-prompt="none"
                shadow-intensity="0"
                exposure="0.7" // Leggermente più luminoso
                orientation="0deg 0deg 45deg"
                className="brain-model-viewer"
                />
            </div>

            {/* TAGS FLUTTUANTI (Glassmorphism Pills) */}
            <div className={`tags-container ${size.w < 768 ? 'mobile-layout' : ''}`}>
            {allTags.map((t, i) => {
                const pos = positions[i] || { left: 0, top: 0 };
                const isSelected = selectedTags.has(t);
                const isMobile = size.w < 768;
                
                return (
                    <button
                        key={t}
                        onClick={() => toggleTag(t)}
                        className={`tag-glass-btn ${isSelected ? 'active' : ''}`}
                        style={!isMobile ? {
                            left: pos.left,
                            top: pos.top,
                            opacity: ready ? 1 : 0,
                            transitionDelay: `${i * 0.03}s` 
                        } : {
                            opacity: 1
                        }}
                    >
                        <span className="data-point"></span>
                        {t}
                    </button>
                );
            })}
            </div>
          </div>
      </div>

      {/* GRIGLIA ARTICOLI (Refined Holographic Cards) */}
      <div className="articles-section">
        <div className="section-header">
            <h2 className="section-title">Database Protocolli <span className="highlight">//{filtered.length} Rilevati</span></h2>
        </div>
        <div className="articles-grid">
            {filtered.map((a) => {
                 const mainTag = a.tags[0];
                 const theme = getTagTheme(mainTag) || FALLBACK_THEME;
                 const accentColor = theme.accent || THEME.cyan;

                 return (
                    <div key={a.slug} className="holo-card" style={{'--accent': accentColor}}>
                        <div className="holo-card-glass"></div>
                        <div className="holo-card-content">
                            <div className="card-header">
                                <h3 className="card-title">{a.title}</h3>
                                <div className="card-status-light" style={{background: accentColor}}></div>
                            </div>
                            
                            <p className="card-excerpt">{a.excerpt}</p>
                            
                            {/* Abstract Data Visualization */}
                            <div className="data-stream-viz">
                                <div className="stream-line"></div>
                                <div className="stream-particles">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="mini-tags">
                                    {a.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="mini-tag">{tag}</span>
                                    ))}
                                </div>
                                <Link className="holo-action-btn" href={`/academy/${a.slug}`}>
                                    ACCEDI <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                 );
            })}
        </div>
      </div>


      {/* --- CSS STYLES --- */}
      <style jsx global>{`
        :root {
            --cyan: ${THEME.cyan};
            --purple: ${THEME.purple};
            --dark-bg: ${THEME.darkBg};
        }

        /* SFONDO MULTI-LAYER */
        .academy-bg-layer {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: url('/images/sfondo_academy2.jpg');
            background-size: cover;
            background-position: center top;
            background-repeat: no-repeat;
            background-attachment: fixed;
            z-index: -2;
        }
        .academy-bg-layer::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: radial-gradient(circle at 50% 30%, rgba(10, 20, 40, 0.7) 0%, rgba(2, 4, 8, 0.85) 70%);
            z-index: 1;
        }
        .academy-grid-layer {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: 
                linear-gradient(rgba(0, 255, 0, 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 0, 0.08) 1px, transparent 1px);
            background-size: 50px 50px;
            mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
            z-index: -1;
            pointer-events: none;
        }

        /* HEADER TIPOGRAFIA */
        .academy-header {
            position: relative; z-index: 10; textAlign: center; paddingTop: 8rem;
            margin-bottom: 0.5rem;
        }
        .neon-title {
            font-family: 'Inter', sans-serif; font-weight: 800;
            font-size: clamp(2.5rem, 5vw, 4rem);
            color: #fff;
            text-shadow: 0 0 25px rgba(0, 240, 255, 0.5);
            margin: 0; letter-spacing: -1px;
        }
        .neon-title .text-stroke {
            color: rgba(0, 174, 239, 0.9);
            font-weight: 900;
            text-shadow: 0 0 8px rgba(0, 174, 239, 0.4), 0 0 15px rgba(0, 174, 239, 0.2);
            letter-spacing: 2px;
        }
        .subtitle-container {
            position: relative; display: inline-block;
        }
        .neon-subtitle {
            color: rgba(200, 230, 255, 0.7); font-size: 1.1rem;
            margin-top: 10px; letter-spacing: 1px;
            font-family: 'Courier New', monospace; /* Font tecnico */
        }
        .scan-line {
            position: absolute; bottom: -10px; left: 0; width: 100%; height: 2px;
            background: linear-gradient(90deg, transparent, var(--cyan), transparent);
            opacity: 0.5;
            animation: scanMove 3s ease-in-out infinite;
        }
        @keyframes scanMove { 0%, 100% { transform: scaleX(0.5); opacity: 0.2; } 50% { transform: scaleX(1); opacity: 0.7; } }


        /* --- HUD CONTAINER & CENTRATURA --- */
        .hud-wrapper-outer {
            position: relative;
            width: 100%;
            /* Usiamo flex per centrare il contenuto interno */
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 1rem 0;
        }
        
        .central-core-glow {
            position: absolute;
            top: 50%; left: 50%;
            width: 400px; height: 400px;
            transform: translate(-50%, -50%);
            background: radial-gradient(circle, rgba(189, 0, 255, 0.2) 0%, rgba(0, 240, 255, 0.1) 40%, transparent 70%);
            filter: blur(50px);
            z-index: 0;
            pointer-events: none;
        }

        .hud-container {
            position: relative;
            width: 100%;
            max-width: 1000px; /* Conteniamo la larghezza massima su desktop */
            height: 600px; /* Altezza fissa per garantire lo spazio */
            perspective: 1000px;
        }

        /* 3D Model Viewer Styling */
        .model-wrapper {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 480px; /* Dimensione fissa per centraggio perfetto */
            height: 480px;
            z-index: 5;
            /* Aggiunge un bagliore CSS che emana dal canvas del modello */
            filter: drop-shadow(0 0 30px rgba(120, 50, 255, 0.3));
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .brain-model-viewer {
            width: 100%; height: 100%;
            --poster-color: transparent;
            background-color: transparent;
        }
        .brain-model-viewer::part(default-progress-bar) {
            display: none;
        }

        /* SVG CONNECTIONS (Circuiti) */
        .hud-connections {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            z-index: 1; pointer-events: none;
        }
        .connector-line {
            stroke: url(#line-grad);
            stroke-width: 1px;
            stroke-dasharray: 2 4; /* Tratteggio più fine */
            opacity: 0.6;
        }
        
        /* Anelli centrali */
        .rotating-rings-group { opacity: 0.4; }
        .static-ring {
            fill: none; stroke: var(--purple); stroke-width: 0.5px;
        }
        .pulsing-ring {
            fill: none; stroke: var(--cyan); stroke-width: 1px;
            animation: pulseRing 4s ease-in-out infinite alternate;
        }
        .rotating-dashed-ring {
            fill: none; stroke: var(--cyan); stroke-width: 1px; stroke-dasharray: 10 30;
            transform-origin: center;
            animation: spinRing 60s linear infinite;
        }
        @keyframes pulseRing { 0% { r: 20%; opacity: 0.3; } 100% { r: 21%; opacity: 0.7; } }
        @keyframes spinRing { to { transform: rotate(360deg); } }


        /* --- TAGS (Glass Pills) --- */
        .tags-container {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        .tags-container.mobile-layout {
            position: relative;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.6rem;
            padding: 0 1rem 0.5rem;
            margin-top: 0;
            justify-items: center;
        }
        
        .tag-glass-btn {
            position: absolute;
            transform: translate(-50%, -50%);
            /* Glassmorphism background */
            background: rgba(5, 10, 25, 0.3);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 240, 255, 0.1);
            border-top-color: rgba(0, 240, 255, 0.3); /* Luce dall'alto */

            color: rgba(200, 240, 255, 0.8);
            padding: 10px 20px;
            border-radius: 30px;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            font-weight: 500;
            letter-spacing: 0.5px;
            cursor: pointer;
            z-index: 10;
            display: flex; align-items: center; gap: 10px;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .data-point {
            width: 8px; height: 8px;
            background: var(--cyan);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--cyan);
            position: relative;
        }
        /* Piccola animazione "respiro" sul punto dati */
        .data-point::after {
            content: ''; position: absolute; top:-50%; left:-50%; width: 200%; height: 200%;
            border-radius: 50%; border: 1px solid var(--cyan); opacity: 0;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }

        .tag-glass-btn:hover {
            background: rgba(0, 240, 255, 0.15);
            border-color: var(--cyan);
            color: #fff;
            transform: translate(-50%, -50%) scale(1.05) translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 240, 255, 0.2);
        }

        .tag-glass-btn.active {
            background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(189, 0, 255, 0.2));
            border-color: var(--cyan);
            color: #fff;
            box-shadow: 0 0 30px rgba(0, 240, 255, 0.4);
        }
        .tag-glass-btn.active .data-point {
            background: #fff; box-shadow: 0 0 10px #fff, 0 0 20px var(--cyan);
        }


        /* --- ARTICLES GRID & CARDS --- */
        .articles-section {
            max-width: 1200px; margin: 4rem auto; padding: 2rem; position: relative; z-index: 5;
        }
        .section-header {
            margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;
        }
        .section-title {
            font-family: 'Courier New', monospace; color: #fff; font-size: 1.2rem; margin: 0;
        }
        .section-title .highlight { color: var(--cyan); }

        .articles-grid {
            display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2rem;
        }

        /* HOLO CARD REFINED */
        .holo-card {
            position: relative; height: 360px;
            border-radius: 16px; overflow: hidden;
            transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
            /* Variabile CSS locale per il colore di accento */
            --accent: var(--cyan); 
        }
        
        /* Lo strato di vetro separato per gestire meglio il backdrop-filter */
        .holo-card-glass {
            position: absolute; inset: 0;
            background: rgba(10, 15, 30, 0.5);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-top-color: rgba(255, 255, 255, 0.15);
            border-radius: inherit;
            z-index: 1;
            transition: all 0.5s ease;
        }

        .holo-card:hover { transform: translateY(-8px); }
        .holo-card:hover .holo-card-glass {
            background: rgba(20, 25, 45, 0.6);
            border-color: rgba(255,255,255,0.1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.2);
        }
        /* Bagliore colorato al bordo inferiore su hover */
        .holo-card::after {
            content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
            background: var(--accent); opacity: 0; transition: opacity 0.5s ease;
            box-shadow: 0 0 20px var(--accent); z-index: 2;
        }
        .holo-card:hover::after { opacity: 1; }

        .holo-card-content {
            position: relative; z-index: 2; padding: 2rem; height: 100%;
            display: flex; flex-direction: column;
        }

        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .card-title { color: #fff; font-size: 1.35rem; margin: 0; line-height: 1.2; font-weight: 700; }
        .card-status-light {
            width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 10px var(--accent);
            flex-shrink: 0; margin-top: 6px;
        }

        .card-excerpt {
            color: rgba(220, 230, 255, 0.7); font-size: 0.95rem; line-height: 1.6;
            flex-grow: 1; margin-bottom: 1.5rem;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        /* Data Stream Viz (Decorazione) */
        .data-stream-viz {
            position: relative; height: 20px; margin-bottom: 1.5rem; overflow: hidden; opacity: 0.5;
        }
        .stream-line {
            position: absolute; top: 50%; width: 100%; height: 1px; background: rgba(255,255,255,0.1);
        }
        .stream-particles span {
            position: absolute; top: 50%; width: 4px; height: 4px; background: var(--accent);
            border-radius: 50%; transform: translateY(-50%);
            animation: moveData 3s linear infinite;
        }
        .stream-particles span:nth-child(2) { left: 30%; animation-delay: 0.5s; }
        .stream-particles span:nth-child(3) { left: 60%; animation-delay: 1s; }
        @keyframes moveData { from { left: -10%; opacity: 0; } 50% { opacity: 1; } to { left: 110%; opacity: 0; } }


        .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .mini-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .mini-tag {
            font-size: 0.75rem; color: rgba(255,255,255,0.6);
            background: rgba(255,255,255,0.05); padding: 4px 10px; border-radius: 12px;
            font-family: 'Courier New', monospace;
        }

        .holo-action-btn {
            display: flex; align-items: center; gap: 8px;
            color: var(--accent); text-decoration: none; font-weight: 700; font-size: 0.9rem;
            padding: 8px 16px; border-radius: 20px;
            background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
            transition: all 0.3s ease;
        }
        .holo-action-btn:hover {
            background: var(--accent); color: #000; border-color: var(--accent);
            box-shadow: 0 0 20px var(--accent);
        }


        @media (max-width: 768px) {
            /* Sfondo specifico per mobile */
            .academy-bg-layer {
                background-image: url('/sfondo_academy_mobile2.jpg');
                background-position: center top;
            }

            /* Nascondi griglia su mobile */
            .academy-grid-layer {
                display: none;
            }

            /* Header mobile */
            .academy-header {
                padding-top: 3rem;
                margin-bottom: 1.5rem;
            }
            .neon-title {
                font-size: clamp(1.8rem, 8vw, 2.5rem);
            }
            .neon-subtitle {
                font-size: 0.85rem;
            }

            /* HUD mobile - layout verticale */
            .hud-wrapper-outer {
                margin: 1rem 0 1rem;
            }
            .hud-container { 
                height: auto;
                min-height: auto;
                padding-bottom: 0.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            /* Cervello più piccolo e centrato */
            .model-wrapper { 
                position: relative !important;
                top: auto !important;
                left: auto !important;
                transform: none !important;
                width: 180px; 
                height: 180px;
                margin: 0 auto 1rem;
            }

            /* Nascondi elementi grafici complessi su mobile */
            .hud-connections,
            .central-core-glow {
                display: none;
            }

            /* Tag mobile - griglia 2 colonne */
            .tag-glass-btn {
                position: relative !important;
                transform: none !important;
                left: auto !important;
                top: auto !important;
                margin: 0 !important;
                width: 100%;
                max-width: 100%;
                padding: 8px 12px;
                font-size: 0.8rem;
                justify-content: center;
            }
            .tag-glass-btn .data-point {
                width: 6px;
                height: 6px;
            }

            /* Articles section mobile */
            .articles-section {
                padding: 1rem;
                margin: 2rem 0;
            }
            .section-title {
                font-size: 1rem;
            }
            .articles-grid { 
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }

            /* Card mobile */
            .holo-card {
                height: auto;
                min-height: 380px;
            }
            .holo-card-content {
                padding: 1.5rem;
            }
            .card-title {
                font-size: 1.2rem;
            }
            .card-excerpt {
                font-size: 0.9rem;
            }
            .card-footer {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            .mini-tags {
                width: 100%;
            }
            .mini-tags {
                flex-wrap: wrap;
                width: 100%;
            }
            .mini-tag {
                font-size: 0.7rem;
                padding: 3px 8px;
            }
            .holo-action-btn {
                font-size: 0.85rem;
                padding: 6px 12px;
                width: 100%;
                justify-content: center;
            }
        }
      `}</style>
    </Layout>
  );
}

// getStaticProps rimane invariato (assicurati di includerlo nel tuo file finale)
export async function getStaticProps() {
    const dir = path.join(process.cwd(), 'data', 'articles');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  
    const items = files.map((file) => {
      const slug = file.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const { data, content } = matter(raw);
  
      let title = (typeof data.title === 'string' && data.title.trim().length)
        ? data.title.trim()
        : '';
  
      if (!title) {
        const firstNonEmpty = content.split('\n').map(l => l.trim()).find(l => l.length > 0) || slug;
        title = firstNonEmpty.replace(/^#{1,6}\s*/, '');
      }
  
      const contentLines = content.split('\n');
      let start = 0;
      if (contentLines[start]?.trim().startsWith('#')) start += 1;
      if (contentLines[start]?.trim() === '') start += 1;
      const body = contentLines.slice(start).join(' ');
  
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