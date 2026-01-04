// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import Layout from '../components/Layout';
import PaperOrbitaleLite from '../components/PaperOrbitaleLite';
import HeroScientificField from '../components/HeroScientificField';
import MissionSection from '../components/MissionSection';
import ArticleCard from '../components/ArticleCard';
import { useEffect, useRef, useState } from 'react';

export default function Home({ articles }) {
  const scrollerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const autoScrollRef = useRef(null);

  // Auto-scroll lento
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const autoScroll = () => {
      if (!isDragging && scroller) {
        scroller.scrollLeft += 1; // Velocità aumentata per renderlo visibile
        
        // Loop infinito: quando arriva alla fine, torna all'inizio
        if (scroller.scrollLeft >= scroller.scrollWidth - scroller.clientWidth - 5) {
          scroller.scrollLeft = 0;
        }
      }
    };

    autoScrollRef.current = setInterval(autoScroll, 20); // Intervallo più frequente
    
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isDragging]);

  // Drag handlers ottimizzati
  const handleMouseDown = (e) => {
    if (!scrollerRef.current) return;
    const scroller = scrollerRef.current;
    
    setIsDragging(true);
    startXRef.current = e.pageX - scroller.offsetLeft;
    scrollLeftRef.current = scroller.scrollLeft;
    scroller.style.cursor = 'grabbing';
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    if (scrollerRef.current) {
      scrollerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollerRef.current) {
      scrollerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollerRef.current) return;
    e.preventDefault();
    
    const scroller = scrollerRef.current;
    const x = e.pageX - scroller.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    scroller.scrollLeft = scrollLeftRef.current - walk;
  };

  // Controlli frecce
  const scroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    
    const scrollAmount = 400; // Larghezza circa di una card
    scroller.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <Layout>
      {/* HERO SCIENTIFICO */}
      <HeroScientificField />

      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Elevate Your Human Potential
        </h1>
        <p style={{ maxWidth: '650px', fontSize: '1.1rem', lineHeight: 1.6 }}>
          La nostra vision è aiutarti a ottimizzare salute, energia e longevità attraverso il biohacking supportato dalla scienza. Vogliamo demistificare i processi dell’invecchiamento e offrirti strumenti e conoscenze per vivere la vita che desideri.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link className="btn" href="/academy">Scopri l’Academy</Link>
        </div>
      </section>

      {/* Mission come componente separato */}
      <MissionSection />

      {/* Sezione “Paper Orbitale” */}
      <PaperOrbitaleLite />

      {/* Academy Preview Section */}
      <section style={{ marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h2>Academy Highlights</h2>
          <p>Immergiti nel nostro hub di conoscenza con ricerche, tecniche e strumenti per longevità e wellness.</p>
        </div>

        {/* Slider Orizzontale Full Width - Edge to Edge */}
        <div 
          className="articles-slider"
          ref={scrollerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {articles.map((article) => (
            <div key={article.slug} className="slider-item">
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
        
        <style jsx>{`
          .articles-slider {
            display: flex;
            gap: 2rem;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
            padding: 2rem 2rem;
            margin: 2rem 0;
            cursor: grab;
            user-select: none;
            -webkit-overflow-scrolling: touch;
            /* Nasconde completamente la scrollbar */
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE e Edge */
            width: 100vw;
            margin-left: calc(-50vw + 50%);
          }

          /* Nasconde scrollbar per Chrome, Safari e Opera */
          .articles-slider::-webkit-scrollbar {
            display: none;
          }

          .slider-item {
            /* Calcolo: (100vw - 4rem di gap tra 3 card - 4rem di padding) / 3 */
            flex: 0 0 calc((100vw - 8rem) / 3);
            min-width: calc((100vw - 8rem) / 3);
          }

          @media (max-width: 1024px) {
            .slider-item {
              /* Su tablet: 2 articoli per volta */
              flex: 0 0 calc((100vw - 6rem) / 2);
              min-width: calc((100vw - 6rem) / 2);
            }
          }

          @media (max-width: 768px) {
            .articles-slider {
              padding: 2rem 1rem;
            }
            .slider-item {
              /* Su mobile: 1 articolo per volta */
              flex: 0 0 calc(100vw - 4rem);
              min-width: calc(100vw - 4rem);
            }
          }
        `}</style>
      </section>

      {/* Marketplace Preview Section */}
      <section style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <h2>HUMAE Products Marketplace</h2>
        <p>Il nostro super drink e gli altri prodotti biohacking stanno arrivando! Resta sintonizzato: il marketplace sarà presto online.</p>
        <div style={{ marginTop: '2rem' }}>
          <Link className="btn" href="/products">Coming Soon</Link>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const dir = path.join(process.cwd(), 'data', 'articles');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  // Carica tutti gli articoli per lo slider (non solo 2)
  const articles = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data, content } = matter(raw);

    const title = data.title ? String(data.title) : slug;
    const excerpt = data.excerpt
      ? String(data.excerpt)
      : content.split(' ').slice(0, 40).join(' ') + '…';
    const tags = Array.isArray(data.tags) ? data.tags : [];

    return { slug, title, excerpt, tags };

  });

  return { props: { articles } };
}
