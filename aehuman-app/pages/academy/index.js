import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { useMemo, useState } from 'react';

export default function Academy({ items, allTags }) {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');

  const filtered = useMemo(() => {
    const qn = q.trim().toLowerCase();
    return items.filter(item => {
      const matchQ = qn === '' || (item.title.toLowerCase().includes(qn) || item.excerpt.toLowerCase().includes(qn));
      const matchTag = tag === 'all' || item.tags.includes(tag);
      return matchQ && matchTag;
    });
  }, [q, tag, items]);

  return (
    <Layout title="Academy">
      <h1>Æ‑HUMAN Academy</h1>
      <p style={{color:'var(--muted)'}}>Solo contenuti basati su evidenze: articoli, ricerche, protocolli.</p>

      {/* Controls */}
      <div className="glass" style={{display:'grid', gap:'.8rem', margin:'1rem 0'}}>
        <input
          placeholder="Cerca argomenti (es: sonno, microbiota, training)…"
          value={q}
          onChange={e=>setQ(e.target.value)}
          style={{
            padding:'.9rem 1rem', borderRadius:'12px', border:'1px solid rgba(255,255,255,.2)',
            background:'rgba(255,255,255,.06)', color:'#fff', outline:'none'
          }}
        />
        <div style={{display:'flex', gap:'.6rem', flexWrap:'wrap'}}>
          <button className="btn" onClick={()=>setTag('all')}>Tutti</button>
          {allTags.map(t => (
            <button key={t} className="btn" onClick={()=>setTag(t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
        gap:'1rem', marginTop:'1rem'
      }}>
        {filtered.map(a=>(
          <div key={a.slug} className="glass">
            <h3 style={{marginBottom:'.4rem'}}>{a.title}</h3>
            <p style={{color:'var(--muted)'}}>{a.excerpt}</p>
            <div style={{display:'flex', gap:'.4rem', flexWrap:'wrap', margin:'.4rem 0 .8rem'}}>
              {a.tags.map(t => (
                <span key={t} style={{
                  fontSize:'.72rem', padding:'.2rem .5rem', borderRadius:'999px',
                  background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.18)'
                }}>{t}</span>
              ))}
            </div>
            <Link className="btn" href={`/academy/${a.slug}`}>Apri</Link>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export async function getStaticProps() {
  const dir = path.join(process.cwd(), 'data', 'articles');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

  const items = files.map(file => {
    const slug = file.replace(/\.md$/, '');
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    const { data, content } = matter(raw);
    const title = (content.split('\n')[0] || slug).trim();
    const body = content.split('\n').slice(2).join(' ');
    const excerpt = body.split(' ').slice(0, 40).join(' ') + '…';
    return {
      slug,
      title,
      excerpt,
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  });

  const tagSet = new Set();
  items.forEach(i => i.tags.forEach(t => tagSet.add(t)));
  const allTags = Array.from(tagSet);

  return { props: { items, allTags } };
}
