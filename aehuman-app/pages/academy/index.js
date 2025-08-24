import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function Academy({ articles }) {
  return (
    <Layout>
      <h1>Æ‑HUMAN Academy</h1>
      <p>
        Welcome to the Academy — your gateway to evidence‑based biohacking,
        wellness, and longevity. Here you will find articles, research
        summaries, and insights curated from scientific studies and leading
        experts.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
        }}
      >
        {articles.map((article) => (
          <div key={article.slug} className="glass">
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
            <Link className="btn" href={`/academy/${article.slug}`}>
              Read Article
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const articlesDir = path.join(process.cwd(), 'data', 'articles');
  const filenames = fs
    .readdirSync(articlesDir)
    .filter((file) => file.endsWith('.md'));

  const articles = filenames.map((filename) => {
    const slug = filename.replace(/\.md$/, '');
    const fileContents = fs.readFileSync(path.join(articlesDir, filename), 'utf8');
    const lines = fileContents.split('\n');
    const title = lines[0] || slug;
    const body = lines.slice(2).join(' ');
    const excerpt = body.split(' ').slice(0, 60).join(' ') + '…';
    return { slug, title, excerpt };
  });

  return {
    props: {
      articles,
    },
  };
}