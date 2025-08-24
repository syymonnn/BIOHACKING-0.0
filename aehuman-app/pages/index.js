import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home({ articles }) {
  return (
    <Layout>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <img
          src="/images/hero.png"
          alt="Futuristic background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: -1,
          }}
        />
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Elevate Your Human Potential
        </h1>
        <p style={{ maxWidth: '650px', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Our vision is to empower every individual to optimize their health,
          energy, and longevity through science‑backed biohacking. We believe in
          demystifying the processes of aging and providing tools and knowledge
          so you can live the life you imagine【616081394139150†L117-L120】.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link className="btn" href="/academy">
            Explore the Academy
          </Link>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ marginTop: '4rem' }}>
        <div className="glass">
          <h2>Our Mission</h2>
          <p>
            Æ‑HUMAN blends cutting‑edge science with holistic wellbeing to bring
            you products and educational resources that are transparent, evidence‑based,
            and effective. We attend not only to the physical but also to the
            intellectual, emotional, and spiritual dimensions of each individual【616081394139150†L124-L131】. 
            Through our academy and product line, we support informed decision‑making and
            self‑care by sharing interventions and biohacks that are backed by
            data and scientific research【228063024036399†L52-L63】.
          </p>
        </div>
      </section>

      {/* Academy Preview Section */}
      <section style={{ marginTop: '4rem' }}>
        <h2>Academy Highlights</h2>
        <p>
          Dive into our knowledge base where we share the latest research,
          techniques, and tools from the world of longevity and wellness.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          {articles.map((article) => (
            <div key={article.slug} className="glass">
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <Link className="btn" href={`/academy/${article.slug}`}>
                Read More
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace Preview Section */}
      <section style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <h2>HUMAE Products Marketplace</h2>
        <p>
          Our super drink and advanced biohacking tools are coming soon! Stay
          tuned as we build a marketplace for curated products designed to
          enhance your wellbeing.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link className="btn" href="/products">
            Coming Soon
          </Link>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const articlesDir = path.join(process.cwd(), 'data', 'articles');
  const filenames = fs
    .readdirSync(articlesDir)
    .filter((file) => file.endsWith('.md'));

  const articles = filenames.slice(0, 2).map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    const fileContents = fs.readFileSync(path.join(articlesDir, filename), 'utf8');
    const lines = fileContents.split('\n');
    const title = lines[0] || slug;
    const body = lines.slice(2).join(' ');
    const excerpt = body.split(' ').slice(0, 40).join(' ') + '…';
    return { slug, title, excerpt };
  });

  return {
    props: {
      articles,
    },
  };
}