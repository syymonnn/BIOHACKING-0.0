import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import Layout from '../../components/Layout';

export default function Article({ title, content }) {
  return (
    <Layout>
      <article>
        <h1>{title}</h1>
        <div
          className="glass"
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ padding: '2rem', marginTop: '1rem', lineHeight: 1.8 }}
        />
      </article>
    </Layout>
  );
}

export async function getStaticPaths() {
  const articlesDir = path.join(process.cwd(), 'data', 'articles');
  const filenames = fs
    .readdirSync(articlesDir)
    .filter((file) => file.endsWith('.md'));
  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace(/\.md$/, '') },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'data', 'articles', `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const lines = fileContents.split('\n');
  const title = lines[0] || slug;
  const markdownBody = lines.slice(2).join('\n');
  const content = marked.parse(markdownBody);

  return {
    props: {
      title,
      content,
    },
  };
}