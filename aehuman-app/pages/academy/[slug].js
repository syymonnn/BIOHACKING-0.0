// pages/academy/[slug].js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import Layout from "../../components/Layout";
import Link from 'next/link';
import { useEffect, useState } from "react";
import Head from "next/head";

// --- CONFIGURAZIONE TEMA "DEEP SPACE ACADEMY" ---
const THEME = {
    bg: '#050505',           // Nero profondo
    paperBg: 'rgba(15, 15, 15, 0.85)', // Carta scura semitrasparente
    border: 'rgba(255, 255, 255, 0.1)', // Bordi sottili
    textMain: '#ececec',     // Bianco quasi puro per leggibilità
    textMuted: '#9ca3af',    // Grigio freddo per metadati
    accent: '#d4af37',       // Oro Accademico
    accentGlow: 'rgba(212, 175, 55, 0.15)', // Alone dorato
    codeBg: '#111111',       // Sfondo blocchi codice
    fontSerif: '"Playfair Display", Georgia, serif',
    fontSans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    fontMono: '"JetBrains Mono", monospace'
};

// --- MARKED RENDERER SETUP ---
// Configuriamo il renderer fuori dal componente per performance
const renderer = new marked.Renderer();

renderer.heading = (text, level) => {
    const slug = text.toLowerCase().replace(/[^\w]+/g, '-');
    // Aggiungiamo un link ancorato visibile all'hover per ogni titolo
    return `
      <h${level} id="${slug}" class="academic-heading level-${level}">
        <a href="#${slug}" class="anchor-link" aria-label="Link to this section">#</a>
        <span class="heading-text">${text}</span>
      </h${level}>
    `;
};

renderer.paragraph = (text) => {
    // Allineamento a sinistra per accessibilità (evita i "fiumi" del giustificato)
    return `<p class="academic-p">${text}</p>`;
};

renderer.blockquote = (quote) => {
    return `<blockquote class="academic-quote">${quote}</blockquote>`;
};

renderer.image = (href, title, text) => {
    return `
      <figure class="academic-figure">
        <img src="${href}" alt="${text}" title="${title || ''}" loading="lazy" />
        ${title ? `<figcaption>${title}</figcaption>` : ''}
      </figure>
    `;
};

marked.setOptions({ renderer, gfm: true });

export default function Article({ title, html, tags, date, readingTime, hero }) {
    const [progress, setProgress] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Gestione Scroll Progress & Mounting
    useEffect(() => {
        setMounted(true);
        const onScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const currentProgress = (window.scrollY / totalHeight) * 100;
                setProgress(Math.min(100, Math.max(0, currentProgress)));
            }
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const formattedDate = date ? new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
    }) : 'Undated Protocol';

    return (
        <Layout title={title}>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />
            </Head>

            {/* BACKGROUND ELEMENTS */}
            <div className="bg-void" />
            <div className="bg-grid-lines" />
            <div className="ambient-glow" />

            {/* PROGRESS BAR (Clinical Style) */}
            <div className="progress-container" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
                <div className="progress-bar" style={{ transform: `scaleX(${progress / 100})` }} />
            </div>

            <div className={`page-wrapper ${mounted ? 'fade-in' : ''}`}>
                
                {/* NAVIGAZIONE DI RITORNO */}
                <nav className="top-nav">
                    <Link href="/academy" className="back-link group">
                        <span className="arrow">←</span> 
                        <span className="link-text">ARCHIVE INDEX</span>
                    </Link>
                    <div className="doc-id">DOC_REF: {date ? new Date(date).getTime().toString().slice(-6) : '000000'}</div>
                </nav>

                {/* MAIN CONTENT PAPER */}
                <main className="research-paper-container">
                    <article className="research-paper">
                        
                        {/* HEADER ACCADEMICO */}
                        <header className="paper-header">
                            <div className="meta-grid">
                                <div className="meta-item">
                                    <span className="label">PUBLISHED</span>
                                    <time dateTime={date} className="value">{formattedDate}</time>
                                </div>
                                <div className="meta-item">
                                    <span className="label">READING TIME</span>
                                    <span className="value">{readingTime || '5 min'} read</span>
                                </div>
                                <div className="meta-item">
                                    <span className="label">CATEGORY</span>
                                    <span className="value accent">{tags?.[0] || 'Research'}</span>
                                </div>
                            </div>

                            <h1 className="paper-title">{title}</h1>

                            {tags?.length > 0 && (
                                <div className="keywords-row">
                                    <span className="label">KEYWORDS:</span>
                                    <div className="tags-list">
                                        {tags.map(t => <span key={t} className="keyword">#{t}</span>)}
                                    </div>
                                </div>
                            )}
                        </header>

                        {/* HERO IMAGE */}
                        {hero && (
                            <figure className="hero-figure">
                                <div className="hero-img-wrapper">
                                    <img src={hero} alt={`Cover for ${title}`} className="hero-img" />
                                </div>
                                <figcaption className="figure-caption">Fig 1.0 — Visual representation of the subject matter.</figcaption>
                            </figure>
                        )}

                        <div className="separator-line" />

                        {/* CONTENUTO PRINCIPALE */}
                        <div 
                            className="paper-content"
                            dangerouslySetInnerHTML={{ __html: html }} 
                        />

                        {/* FOOTER ARTICOLO */}
                        <footer className="paper-footer">
                            <div className="end-mark">■</div>
                            <div className="citation-note">
                                Æ-HUMAN ACADEMY — Knowledge Repository<br/>
                                <span style={{ opacity: 0.5 }}>End of Protocol</span>
                            </div>
                        </footer>

                    </article>
                </main>
            </div>

            <style jsx global>{`
                /* --- VARIABILI CSS --- */
                :root {
                    --bg: ${THEME.bg};
                    --paper-bg: ${THEME.paperBg};
                    --border: ${THEME.border};
                    --text: ${THEME.textMain};
                    --muted: ${THEME.textMuted};
                    --accent: ${THEME.accent};
                    --accent-glow: ${THEME.accentGlow};
                    --code-bg: ${THEME.codeBg};
                    --font-serif: ${THEME.fontSerif};
                    --font-sans: ${THEME.fontSans};
                    --font-mono: ${THEME.fontMono};
                }

                /* --- RESET & GLOBAL --- */
                html { scroll-behavior: smooth; }
                ::selection { background: var(--accent); color: #000; }
                
                /* Sfondo Fisso */
                .bg-void {
                    position: fixed; inset: 0; z-index: -3;
                    background-color: var(--bg);
                }
                .bg-grid-lines {
                    position: fixed; inset: 0; z-index: -2;
                    background-image: linear-gradient(var(--border) 1px, transparent 1px),
                                      linear-gradient(90deg, var(--border) 1px, transparent 1px);
                    background-size: 40px 40px;
                    opacity: 0.15;
                    mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
                }
                .ambient-glow {
                    position: fixed; top: -20%; left: 50%; transform: translateX(-50%);
                    width: 80vw; height: 50vh;
                    background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
                    z-index: -1; pointer-events: none;
                }

                /* --- PROGRESS BAR --- */
                .progress-container {
                    position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 999;
                    background: rgba(255,255,255,0.02);
                }
                .progress-bar {
                    height: 100%; background: var(--accent);
                    transform-origin: left; transition: transform 0.15s ease-out;
                    box-shadow: 0 0 10px var(--accent);
                }

                /* --- LAYOUT & ANIMAZIONI --- */
                .page-wrapper {
                    opacity: 0; transform: translateY(15px);
                    transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 1, 0.3, 1);
                }
                .page-wrapper.fade-in { opacity: 1; transform: translateY(0); }

                /* --- NAVIGAZIONE --- */
                .top-nav {
                    max-width: 900px; margin: 0 auto; padding: 2rem;
                    display: flex; justify-content: space-between; align-items: center;
                    font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted);
                }
                .back-link {
                    text-decoration: none; color: var(--muted); display: flex; align-items: center; gap: 8px;
                    transition: color 0.3s;
                }
                .back-link:hover { color: var(--accent); }
                .arrow { transition: transform 0.3s; }
                .back-link:hover .arrow { transform: translateX(-3px); }

                /* --- RESEARCH PAPER CONTAINER --- */
                .research-paper-container {
                    padding: 0 1rem 8rem 1rem;
                    display: flex; justify-content: center;
                }

                .research-paper {
                    width: 100%; max-width: 800px;
                    background: var(--paper-bg);
                    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                    border: 1px solid var(--border);
                    padding: 4rem 5rem;
                    box-shadow: 0 20px 80px rgba(0,0,0,0.6);
                    position: relative;
                }
                /* Bordo superiore dorato */
                .research-paper::before {
                    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
                    background: linear-gradient(90deg, transparent, var(--accent), transparent);
                    opacity: 0.5;
                }

                @media (max-width: 768px) {
                    .research-paper { padding: 2.5rem 1.5rem; border: none; background: transparent; box-shadow: none; backdrop-filter: none; }
                    .top-nav { padding: 1.5rem 1rem; }
                }

                /* --- HEADER --- */
                .paper-header { margin-bottom: 3rem; }
                
                .meta-grid {
                    display: grid; grid-template-columns: repeat(3, 1fr);
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 1.5rem; margin-bottom: 2rem;
                    gap: 1rem;
                }
                .meta-item { display: flex; flex-direction: column; gap: 4px; }
                .label {
                    font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 1px;
                    color: var(--muted); text-transform: uppercase;
                }
                .value {
                    font-family: var(--font-sans); font-size: 0.9rem; color: var(--text); font-weight: 500;
                }
                .value.accent { color: var(--accent); }

                .paper-title {
                    font-family: var(--font-serif);
                    font-size: clamp(2.5rem, 5vw, 4rem);
                    line-height: 1.1; font-weight: 400; font-style: italic;
                    color: #fff; margin: 0 0 1.5rem 0;
                }

                .keywords-row {
                    display: flex; gap: 1rem; align-items: baseline; font-family: var(--font-mono); font-size: 0.75rem;
                }
                .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
                .keyword { color: var(--muted); transition: color 0.2s; }
                .keyword:hover { color: var(--accent); cursor: default; }

                /* --- HERO IMAGE --- */
                .hero-figure { margin: 2rem -2rem 3rem; }
                .hero-img-wrapper {
                    border: 1px solid var(--border); overflow: hidden;
                    position: relative;
                }
                .hero-img {
                    width: 100%; height: auto; display: block;
                    filter: saturate(0.8) contrast(1.1);
                    transition: transform 0.7s ease;
                }
                .hero-img:hover { transform: scale(1.02); }
                .figure-caption {
                    font-family: var(--font-mono); font-size: 0.7rem; color: var(--muted);
                    margin-top: 0.8rem; text-align: center;
                }

                .separator-line {
                    width: 100%; height: 1px; background: var(--border); margin: 3rem 0;
                    position: relative; overflow: hidden;
                }
                .separator-line::after {
                    content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: translateX(-100%); animation: shimmer 3s infinite;
                }
                @keyframes shimmer { 100% { transform: translateX(100%); } }

                /* --- TYPOGRAPHY CONTENT --- */
                .paper-content {
                    font-family: var(--font-sans); color: var(--text);
                    font-size: 1.125rem; line-height: 1.75; font-weight: 300;
                }
                /* Mobile font size adjustment */
                @media (max-width: 768px) { .paper-content { font-size: 1.05rem; } }

                /* Headings */
                .academic-heading {
                    font-family: var(--font-serif); font-weight: 400; color: #fff;
                    margin-top: 3rem; margin-bottom: 1.25rem; position: relative; scroll-margin-top: 100px;
                }
                .anchor-link {
                    position: absolute; left: -1.5rem; opacity: 0; color: var(--accent);
                    text-decoration: none; font-family: var(--font-mono); font-size: 1rem;
                    transition: opacity 0.2s;
                }
                .academic-heading:hover .anchor-link { opacity: 0.7; }
                
                .level-2 { font-size: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
                .level-3 { font-size: 1.5rem; font-style: italic; }

                /* Paragraphs & Lists - NO JUSTIFY per accessibilità */
                .academic-p { margin-bottom: 1.5rem; text-align: left; }
                
                .paper-content ul, .paper-content ol {
                    margin-bottom: 1.5rem; padding-left: 1.5rem; color: var(--text);
                }
                .paper-content li { margin-bottom: 0.5rem; padding-left: 0.5rem; }
                .paper-content li::marker { color: var(--accent); }

                /* Blockquotes */
                .academic-quote {
                    position: relative;
                    margin: 2.5rem 0; padding: 1rem 2rem;
                    font-family: var(--font-serif); font-style: italic; font-size: 1.35rem;
                    color: var(--accent); border-left: 2px solid var(--accent);
                    background: linear-gradient(90deg, var(--accent-glow) 0%, transparent 100%);
                }

                /* Links */
                .paper-content a {
                    color: var(--text); text-decoration: none;
                    border-bottom: 1px solid var(--accent);
                    transition: all 0.2s;
                }
                .paper-content a:hover {
                    background: var(--accent); color: #000; box-shadow: 0 0 10px var(--accent-glow);
                }

                /* Code Blocks */
                .paper-content pre {
                    background: var(--code-bg); border: 1px solid var(--border);
                    border-radius: 4px; padding: 1.5rem; overflow-x: auto;
                    font-family: var(--font-mono); font-size: 0.85rem; margin: 2rem 0;
                }
                .paper-content code {
                    font-family: var(--font-mono); background: rgba(255,255,255,0.1);
                    padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em;
                }
                .paper-content pre code { background: transparent; padding: 0; }

                /* Images in content */
                .academic-figure { margin: 2.5rem 0; text-align: center; }
                .academic-figure img {
                    max-width: 100%; height: auto; border-radius: 2px;
                    border: 1px solid var(--border);
                }
                .academic-figure figcaption {
                    font-family: var(--font-mono); font-size: 0.75rem; color: var(--muted); margin-top: 0.5rem;
                }

                /* --- FOOTER --- */
                .paper-footer {
                    margin-top: 5rem; padding-top: 3rem; border-top: 1px solid var(--border);
                    text-align: center; color: var(--muted);
                }
                .end-mark { color: var(--accent); margin-bottom: 1.5rem; font-size: 0.8rem; letter-spacing: 3px; }
                .citation-note {
                    font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 1px;
                    text-transform: uppercase; line-height: 1.6;
                }
            `}</style>
        </Layout>
    );
}

// getStaticPaths e getStaticProps
export async function getStaticPaths() {
    const dir = path.join(process.cwd(), "data", "articles");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
    const paths = files.map((f) => ({ params: { slug: f.replace(/\.md$/, "") } }));
    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const fullPath = path.join(process.cwd(), "data", "articles", `${params.slug}.md`);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);
    const html = marked.parse(content);
    return {
        props: {
            title: data.title || params.slug,
            tags: data.tags || [],
            date: data.date || null,
            readingTime: data.readingTime || null,
            hero: data.hero || null,
            html,
        },
    };
}