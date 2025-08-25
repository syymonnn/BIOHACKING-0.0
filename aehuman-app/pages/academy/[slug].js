// pages/academy/[slug].js
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import Layout from "../../components/Layout";
import { useEffect, useState } from "react";

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

  // Reading progress
  useEffect(() => {
    const onScroll = () => {
      const art = document.getElementById("article-body");
      if (!art) return;
      const total = art.scrollHeight - window.innerHeight;
      const current = Math.min(Math.max(window.scrollY - art.offsetTop + 80, 0), total);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Raggruppa: ogni H2 apre una card di sezione
  useEffect(() => {
    const root = document.querySelector("#article-body > div");
    if (!root) return;
    const nodes = Array.from(root.childNodes);
    const wrapper = document.createElement("div");
    wrapper.className = "sections";
    root.parentNode.replaceChild(wrapper, root);

    let section = document.createElement("section");
    section.className = "sectionCard glass";
    wrapper.appendChild(section);

    nodes.forEach((node) => {
      if (node.nodeType === 1 && node.tagName === "H2") {
        section = document.createElement("section");
        section.className = "sectionCard glass";
        wrapper.appendChild(section);
        section.appendChild(node);
      } else {
        section.appendChild(node);
      }
    });
  }, [html]);

  return (
    <Layout title={title}>
      <div aria-hidden className="readingProgress" style={{ transform: `scaleX(${progress / 100})` }} />

      <article className="articleWrap">
        {/* HERO + OVERLAY (title + meta + tag) */}
        {hero ? (
          <div className="heroWrap">
            <img src={hero} alt="" className="heroImg" />
            <div className="heroGradient" />
            <div className="heroOverlay glass">
              <h1 className="articleTitle">{title}</h1>
              <div className="metaRow">
                {date ? <time dateTime={date}>{formatDate(date)}</time> : null}
                {readingTime ? <span>• {readingTime}</span> : null}
              </div>
              {tags?.length ? (
                <div className="tagRow">
                  {tags.map((t) => (
                    <a
                      key={t}
                      href={`/academy?tag=${encodeURIComponent(t)}`}
                      className="tagPill"
                      aria-label={`Tag ${t}`}
                    >
                      {t}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          // Fallback se non c'è hero
          <header className="articleHeader glass">
            <div className="headTexts">
              <h1 className="articleTitle">{title}</h1>
              <div className="metaRow">
                {date ? <time dateTime={date}>{formatDate(date)}</time> : null}
                {readingTime ? <span>• {readingTime}</span> : null}
              </div>
            </div>
            {tags?.length ? (
              <div className="tagRow">
                {tags.map((t) => (
                  <a key={t} href={`/academy?tag=${encodeURIComponent(t)}`} className="tagPill">
                    {t}
                  </a>
                ))}
              </div>
            ) : null}
          </header>
        )}

        {/* BODY */}
        <div id="article-body" className="prose glass">
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
