import { useEffect, useRef } from 'react';
import Link from 'next/link';
import topics from '../lib/topics';

const { TOPIC_THEME, TopicKey, getTagTheme } = topics;
const FALLBACK_THEME = TOPIC_THEME[TopicKey.DEFAULT];

export default function ArticleCard({ article }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const bg = card.querySelector('.backgroundArticle');
    if (!bg) return;

    bg.innerHTML = '';
    const r0 = card.getBoundingClientRect();
    const W = Math.max(200, Math.floor(r0.width));
    const H = Math.max(160, Math.floor(r0.height));

    const densityAt = (x, y) => {
      const cx = W / 2, cy = H / 2;
      const maxD = Math.hypot(cx, cy);
      const d = Math.hypot(x - cx, y - cy);
      return 1 - d / maxD;
    };

    const lettersSet = ['S', 'L', 'E', 'P', '\u00c6', 'A', 'H', 'N', 'T', 'C', 'F', 'M', 'R', 'D'];
    const NUM = 80;
    for (let i = 0; i < NUM; i++) {
      const el = document.createElement('div');
      el.className = 'letter';
      const x = Math.random() * (W - 20);
      const y = Math.random() * (H - 20);
      const dens = densityAt(x, y);
      if (dens > 0.6) { el.classList.add('center-dense'); el.style.opacity = '0.65'; }
      else if (dens > 0.3) { el.classList.add('medium-zone'); el.style.opacity = '0.55'; }
      else { el.classList.add('outer-sparse'); el.style.opacity = '0.77'; }
      el.textContent = lettersSet[Math.floor(Math.random() * lettersSet.length)];
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.animationDelay = (Math.random() * 8) + 's';
      bg.appendChild(el);
    }

    const onMove = (e) => {
      const r = card.getBoundingClientRect();
      const mx = e.clientX - r.left;
      const my = e.clientY - r.top;
      const letters = bg.querySelectorAll('.letter');
      letters.forEach((el) => {
        const lr = el.getBoundingClientRect();
        const lx = lr.left - r.left + lr.width / 2;
        const ly = lr.top - r.top + lr.height / 2;
        const d = Math.hypot(mx - lx, my - ly);
        if (d < 50) {
          const k = 1 - d / 50;
          el.style.color = `rgba(173, 216, 230, ${0.25 + k * 0.55})`;
          el.style.textShadow = `0 0 ${Math.round(k * 14)}px rgba(173, 216, 230, ${0.2 + k * 0.6})`;
          el.style.transform = 'scale(1.1)';
        } else {
          el.style.color = '';
          el.style.textShadow = '';
          el.style.transform = '';
        }
      });
    };

    const onLeave = () => {
      bg.querySelectorAll('.letter').forEach((el) => {
        el.style.color = '';
        el.style.textShadow = '';
        el.style.transform = '';
      });
    };

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mousemove', onMove);
      card.removeEventListener('mouseleave', onLeave);
      bg.innerHTML = '';
    };
  }, []);

  return (
    <div ref={cardRef} className="glass articleCard">
      <div className="backgroundArticle" />
      <div className="cardContent">
        <div className="cardTop">
          <h3 className="cardTitle">{article.title}</h3>
          <p className="cardExcerpt">{article.excerpt}</p>
        </div>
        <div className="cardBottom">
          <div className="tagRow">
            {(article.tags || []).map((t) => {
              const theme = getTagTheme(t) || FALLBACK_THEME;
              return (
                <span
                  key={t}
                  style={{
                    fontSize: '.72rem',
                    padding: '.2rem .5rem',
                    borderRadius: '999px',
                    background: theme.accentSoft,
                    border: `1px solid ${theme.accent || '#888'}`,
                    color: theme.text,
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
          <Link className="btn cardBtn" href={`/academy/${article.slug}`}>Apri</Link>
        </div>
      </div>
      <style jsx>{`
        .articleCard {
          position: relative;
          overflow: hidden;
          padding: 1rem;
          height: 420px;
          border-radius: 12px;
        }
        .backgroundArticle {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          overflow: hidden;
          background: transparent;
          pointer-events: none;
          min-height: 180px;
        }
        .cardContent {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
        }
        .cardTop { flex: 1 1 auto; }
        .cardTitle { margin: 0 0 .35rem 0; }
        .cardExcerpt {
          color: var(--muted);
          display: -webkit-box;
          -webkit-line-clamp: 12;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }
        .cardBottom {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
        }
        .tagRow {
          display: flex;
          gap: .4rem;
          flex-wrap: wrap;
        }
        .cardBottom :global(.btn),
        .cardBtn { align-self: flex-end; }
      `}</style>
      <style jsx global>{`
        .backgroundArticle .letter {
          position: absolute;
          font-family: 'Courier New', monospace;
          color: rgba(160, 200, 255, 0.18);
          font-weight: 300;
          transition: all 0.25s ease;
          user-select: none;
          will-change: transform, color, text-shadow;
        }
        .backgroundArticle .center-dense {
          font-size: 14px;
          animation: ae-gentle-pulse 4s infinite ease-in-out;
        }
        .backgroundArticle .medium-zone {
          font-size: 12px;
          animation: ae-slow-drift 8s infinite ease-in-out;
        }
        .backgroundArticle .outer-sparse {
          font-size: 10px;
          animation: ae-fade-glow 6s infinite ease-in-out;
        }
        @keyframes ae-gentle-pulse {
          0%,100% { opacity: 0.18; }
          50% { opacity: 0.28; }
        }
        @keyframes ae-slow-drift {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes ae-fade-glow {
          0%,100% { opacity: 0.06; text-shadow: none; }
          50% { opacity: 0.12; text-shadow: 0 0 4px rgba(100,149,237,0.25); }
        }
      `}</style>
    </div>
  );
}