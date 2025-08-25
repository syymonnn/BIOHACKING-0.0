// pages/index.js
import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Layout from '../components/Layout';
import PaperOrbitaleLite from '../components/PaperOrbitaleLite';
import HeroScientificField from '../components/HeroScientificField';
import MissionSection from '../components/MissionSection'; // ⟵ NEW

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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          {articles.map((article) => (
            <div key={article.slug} className="glass">
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <Link className="btn" href={`/academy/${article.slug}`}>Leggi di più</Link>
            </div>
          ))}
        </div>
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
  const articlesDir = path.join(process.cwd(), 'data', 'articles');
  const filenames = fs.readdirSync(articlesDir).filter((file) => file.endsWith('.md'));

  const articles = filenames.slice(0, 2).map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    const fileContents = fs.readFileSync(path.join(articlesDir, filename), 'utf8');
    const lines = fileContents.split('\n');
    const title = lines[0] || slug;
    const body = lines.slice(2).join(' ');
    const excerpt = body.split(' ').slice(0, 40).join(' ') + '…';
    return { slug, title, excerpt };
  });

  return { props: { articles } };
}
