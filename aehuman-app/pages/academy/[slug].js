// pages/academy/[slug].js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import Layout from "../../components/Layout";
import { useEffect, useState, useRef } from "react";
import { TOPIC_THEME, TopicKey, getTopicFromTags } from "../../lib/topics";

// --- Marked: heading IDs + anchor link
function slugify(str = "") {
  return str.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}
const renderer = new marked.Renderer();
renderer.heading = (text, level) => {
  const id = slugify(text);
  return `<h${level} id="${id}"><a class="anchor" href="#${id}" aria-label="${text}"></a>${text}</h${level}>`;
};
marked.setOptions({ renderer, gfm: true });

export default function Article({ title, html, tags, date, readingTime, hero }) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const articleRef = useRef(null);
  const heroRef = useRef(null);
  
  const topic = getTopicFromTags(tags) || TopicKey.DEFAULT;
  let theme = TOPIC_THEME[topic];
  if (!theme) {
    theme = TOPIC_THEME[TopicKey.DEFAULT];
  }

  // Enhanced reading progress with smooth animation
  useEffect(() => {
    const onScroll = () => {
      const art = document.getElementById("article-body");
      if (!art) return;
      const total = art.scrollHeight - window.innerHeight;
      const current = Math.min(Math.max(window.scrollY - art.offsetTop + 80, 0), total);
      const newProgress = total > 0 ? (current / total) * 100 : 0;
      
      // Smooth progress transition
      setProgress(prev => {
        const diff = newProgress - prev;
        return prev + diff * 0.1;
      });
    };
    
    onScroll();
    const handleScroll = () => {
      requestAnimationFrame(onScroll);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Enhanced visibility animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (articleRef.current) {
        const rect = articleRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    const article = articleRef.current;
    if (article) {
      article.addEventListener('mousemove', handleMouseMove);
      return () => article.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);


  // Effetto typewriter per il titolo (aggiungi questo useEffect)
  useEffect(() => {
    const title = document.querySelector('header h1');
    if (title) {
      const originalText = title.textContent;
      title.textContent = '';
      
      let index = 0;
      const typeInterval = setInterval(() => {
        title.textContent = originalText.slice(0, index + 1);
        index++;
        
        if (index >= originalText.length) {
          clearInterval(typeInterval);
          // Rimuovi il cursore dopo la digitazione
          setTimeout(() => {
            title.style.borderRight = 'none';
          }, 1000);
        }
      }, 80);
      
      return () => clearInterval(typeInterval);
    }
  }, [title]);


  // Parallax effect for hero
  useEffect(() => {
    if (!heroRef.current) return;
    
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * 0.5;
      heroRef.current.style.transform = `translateY(${parallax}px) scale(${1 + scrolled * 0.0005})`;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hero]);

  
// Enhanced section grouping with intersection observer - VERSIONE CORRETTA
useEffect(() => {
  const root = document.querySelector("#article-body > div");
  if (!root) return;
  
  // CONTROLLA SE LE SEZIONI SONO GIÀ STATE CREATE (evita duplicati)
  if (root.querySelector('.sectionCard')) {
    return; // Esci se le card esistono già
  }
  
  const nodes = Array.from(root.childNodes);
  const fragment = document.createDocumentFragment();
  let buffer = [];
  let sectionIndex = 0;

  nodes.forEach((node) => {
    if (node.nodeType === 1 && node.tagName === "H2") {
      if (buffer.length) {
        const wrap = document.createElement("div");
        wrap.className = "sectionCard glass-enhanced";
        wrap.setAttribute('data-section', sectionIndex++);
        
        // ANIMAZIONE PIÙ VELOCE - riduci il delay
        wrap.style.setProperty('--animation-delay', `${sectionIndex * 50}ms`); // Cambiato da 150ms a 50ms
        
        buffer.forEach((n) => wrap.appendChild(n));
        fragment.appendChild(wrap);
      }
      buffer = [node];
    } else {
      buffer.push(node);
    }
  });
  
  if (buffer.length) {
    const wrap = document.createElement("div");
    wrap.className = "sectionCard glass-enhanced";
    wrap.setAttribute('data-section', sectionIndex);
    wrap.style.setProperty('--animation-delay', `${sectionIndex * 50}ms`); // Cambiato da 150ms a 50ms
    buffer.forEach((n) => wrap.appendChild(n));
    fragment.appendChild(wrap);
  }

  root.innerHTML = "";
  root.appendChild(fragment);

  // Animazione wave per i titoli delle sezioni
  document.querySelectorAll('.sectionCard h2').forEach(heading => {
    const text = heading.textContent;
    heading.innerHTML = text.split('').map((char, i) => 
      char === ' ' ? ' ' : `<span style="animation-delay: ${i * 0.05}s">${char}</span>`
    ).join('');
  });

  // INTERSECTION OBSERVER PIÙ REATTIVO
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
      }
    });
  }, { 
    threshold: 0.05,  // Cambiato da 0.1 a 0.05 (trigger prima)
    rootMargin: '50px 0px -50px 0px'  // Cambiato per trigger ancora prima
  });

  document.querySelectorAll('.sectionCard').forEach(section => {
    observer.observe(section);
  });

  return () => observer.disconnect();
}, [html]);

  return (
    <Layout title={title}>
      <style jsx>{`
        .readingProgress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          z-index: 1000;
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }

        .readingProgress::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, 
            rgba(0, 255, 157, 0.8) 0%, 
            rgba(0, 255, 255, 0.6) 50%, 
            rgba(157, 0, 255, 0.4) 100%
          );
          filter: blur(1px);
        }

        .articleWrap {
          position: relative;
          min-height: 100vh;
          opacity: ${isVisible ? 1 : 0};
          transform: ${isVisible ? 'translateY(0)' : 'translateY(20px)'};
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .articleWrap::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
            circle at ${mousePosition.x}% ${mousePosition.y}%,
            rgba(0, 255, 157, 0.03) 0%,
            rgba(0, 255, 255, 0.02) 40%,
            rgba(157, 0, 255, 0.01) 80%,
            transparent 100%
          );
          pointer-events: none;
          z-index: 1;
          transition: background 0.3s ease;
        }

        .heroWrap {
          position: relative;
          height: 55vh;
          overflow: hidden;
          border-radius: 0 0 2rem 2rem;
          margin-bottom: 1rem;
        }

        .heroImg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.7) contrast(1.1) saturate(1.2);
          transition: all 0.5s ease;
        }

        .heroWrap:hover .heroImg {
          transform: scale(1.05);
          filter: brightness(0.8) contrast(1.2) saturate(1.3);
        }

        .heroGradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 255, 157, 0.1) 0%,
            rgba(0, 255, 255, 0.05) 50%,
            rgba(157, 0, 255, 0.1) 100%
          );
          backdrop-filter: blur(1px);
        }

        .heroGradient::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 70%,
            rgba(255, 255, 255, 0.1) 100%
          );
        }

        header {
          position: relative;
          z-index: 2;
          padding: 2rem;
          text-align: center;
        }

        header h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 300;
          letter-spacing: -0.02em;
          background: linear-gradient(
            135deg,
            #7a7a7a 0%,
            #6a6a6a 50%,
            #7a7a7a 100%
          );
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 1.5rem;
          animation: titleReveal 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
        }

        @keyframes titleReveal {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .metaRow {
          display: flex;
          justify-content: center;
          gap: 0.8rem;
          margin-bottom: 1.5rem;
          color: #666;
          font-weight: 500;
          letter-spacing: 0.5px;
          animation: metaReveal 1s cubic-bezier(0.4, 0, 0.2, 1) 0.5s both;
        }

        @keyframes metaReveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .tagRow {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.8rem;
          animation: tagsReveal 1s cubic-bezier(0.4, 0, 0.2, 1) 0.7s both;
        }

        @keyframes tagsReveal {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardSlideIn {
          0% {
            opacity: 0;
            transform: translateY(80px) scale(0.8) rotateX(10deg);
          }
          60% {
            opacity: 0.8;
            transform: translateY(-10px) scale(1.02) rotateX(-2deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }

        .tagPill {
          position: relative;
          padding: 0.5rem 1.2rem;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          color: #333;
          border-radius: 2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .tagPill::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0, 255, 157, 0.1) 0%,
            rgba(0, 255, 255, 0.05) 50%,
            rgba(157, 0, 255, 0.1) 100%
          );
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .tagPill:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 10px 25px rgba(0, 255, 157, 0.1),
            0 0 0 1px rgba(0, 255, 157, 0.2);
          color: #111;
        }

        .tagPill:hover::before {
          opacity: 1;
        }

        #article-body {
          position: relative;
          z-index: 2;
          padding: 0 1.5rem;
          max-width: 700px;
          margin: 0 auto;
        }

        .prose {
          color: #333;
          line-height: 1.7;
          font-size: 1.1rem;
        }

        :global(.sectionCard) {
          position: relative;
          margin-bottom: 2.5rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(15px);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          opacity: 0;
          transform: translateY(40px) scale(0.95);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transition-delay: var(--animation-delay, 0ms);
        }

        :global(.sectionCard.section-visible) {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        :global(.sectionCard::before) {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          background: linear-gradient(
            135deg,
            rgba(0, 255, 157, 0.05) 0%,
            rgba(0, 255, 255, 0.03) 50%,
            rgba(157, 0, 255, 0.05) 100%
          );
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        :global(.sectionCard:hover::before) {
          opacity: 1;
        }

        :global(.sectionCard:hover) {
          transform: translateY(-8px) scale(1.03);
          box-shadow: 
            0 25px 70px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(0, 255, 157, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.7);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)
        }

        :global(.sectionCard h2) {
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 1.8rem;
          font-weight: 600;
          color: #222;
          position: relative;
        }

        :global(.sectionCard h2::after) {
          content: '';
          position: absolute;
          bottom: -0.5rem;
          left: 0;
          width: 3rem;
          height: 2px;
          background: linear-gradient(90deg, #00ff9d, #00ffff);
          border-radius: 1px;
        }

        :global(.sectionCard p) {
          margin-bottom: 1.2rem;
          color: #444;
        }

        :global(.anchor) {
          opacity: 0;
          margin-right: 0.5rem;
          color: #00ff9d;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        :global(.sectionCard h2:hover .anchor) {
          opacity: 1;
          transform: scale(1.1);
        }

        @media (max-width: 768px) {
          .heroWrap {
            height: 40vh;
            border-radius: 0 0 1rem 1rem;
          }

          header {
            padding: 1.5rem;
          }

          header h1 {
            font-size: 2.5rem;
          }

          #article-body {
            padding: 0 1rem;
          }

          :global(.sectionCard) {
            position: relative;
            margin-bottom: 2.5rem;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(15px);
            border-radius: 1.5rem;
            border: 1px solid rgba(255, 255, 255, 0.3);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.06),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
            
            /* ANIMAZIONE PIÙ FLUIDA E REATTIVA */
            opacity: 0;
            transform: translateY(60px) scale(0.9);
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Easing più fluido */
            transition-delay: var(--animation-delay, 0ms);
            
            /* Migliora la performance delle animazioni */
            will-change: transform, opacity;
            backface-visibility: hidden;
          }

          :global(.sectionCard.section-visible) {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div
        aria-hidden
        className="readingProgress"
        style={{
          transform: `scaleX(${progress / 100})`,
          background: theme.gradient || 'linear-gradient(90deg, #00ff9d, #00ffff, #9d00ff)',
          boxShadow: theme.glow || '0 0 20px rgba(0, 255, 157, 0.5)',
        }}
      />
      
      <article className="articleWrap" ref={articleRef}>
        {/* HERO IMAGE */}
        {hero ? (
          <div className="heroWrap">
            <img 
              ref={heroRef}
              src={hero} 
              alt="" 
              className="heroImg"
              loading="eager"
            />
            <div className="heroGradient" />            
          </div>
        ) : null}

        <header>
          <h1>{title}</h1>
          <div className="metaRow">
            {date ? <time dateTime={date}>{formatDate(date)}</time> : null}
            {readingTime ? <span>• {readingTime}</span> : null}
          </div>
          {tags?.length ? (
            <div className="tagRow">
              {tags.map((t, index) => (
                <a
                  key={t}
                  href={`/academy?tag=${encodeURIComponent(t)}`}
                  className="tagPill"
                  aria-label={`Tag ${t}`}
                  style={{
                    animationDelay: `${900 + index * 100}ms`
                  }}
                >
                  {t}
                </a>
              ))}
            </div>
          ) : null}
        </header>

        {/* BODY */}
        <div id="article-body" className="prose">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </article>
    </Layout>
  );
}

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

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "2-digit" });
  } catch {
    return iso;
  }
}