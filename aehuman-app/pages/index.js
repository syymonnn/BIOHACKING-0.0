// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import matter from 'gray-matter';
import Layout from '../components/Layout';
import PaperOrbitaleLite from '../components/PaperOrbitaleLite';
import HeroScientificField from '../components/HeroScientificField';
import MissionSection from '../components/MissionSection'; // ⟵ NEW
import ArticleCard from '../components/ArticleCard';

export default function Home({ articles }) {
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
        <h2>Academy Highlights</h2>
        <p>Immergiti nel nostro hub di conoscenza con ricerche, tecniche e strumenti per longevità e wellness.</p>
        <div className="articlesGrid">

          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        
        <style jsx>{`
          .articlesGrid {
            display: grid;
            gap: 1rem;
            margin-top: 2rem;
            max-width: 1050px;
            margin-left: auto;
            margin-right: auto;
          }
          @media (min-width: 768px) {
            .articlesGrid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 767px) {
            .articlesGrid { grid-template-columns: 1fr; }
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

  const articles = files.slice(0, 2).map((file) => {
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
