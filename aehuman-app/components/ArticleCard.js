import Link from 'next/link';
import topics from '../lib/topics';

const { TOPIC_THEME, TopicKey, getTagTheme } = topics;
const FALLBACK_THEME = TOPIC_THEME[TopicKey.DEFAULT];
const THEME_CYAN = '#00f0ff';

export default function ArticleCard({ article }) {
  const mainTag = article.tags && article.tags[0];
  const theme = getTagTheme(mainTag) || FALLBACK_THEME;
  const accentColor = theme.accent || THEME_CYAN;

  return (
    <div className="holo-card" style={{'--accent': accentColor}}>
      <div className="holo-card-glass"></div>
      <div className="holo-card-content">
        <div className="card-header">
          <h3 className="card-title">{article.title}</h3>
          <div className="card-status-light" style={{background: accentColor}}></div>
        </div>
        
        <p className="card-excerpt">{article.excerpt}</p>
        
        {/* Abstract Data Visualization */}
        <div className="data-stream-viz">
          <div className="stream-line"></div>
          <div className="stream-particles">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div className="card-footer">
          <div className="mini-tags">
            {(article.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="mini-tag">{tag}</span>
            ))}
          </div>
          <Link className="holo-action-btn" href={`/academy/${article.slug}`}>
            ACCEDI <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .holo-card {
          position: relative;
          height: 360px;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        
        .holo-card-glass {
          position: absolute;
          inset: 0;
          background: rgba(10, 15, 30, 0.5);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-top-color: rgba(255, 255, 255, 0.15);
          border-radius: inherit;
          z-index: 1;
          transition: all 0.5s ease;
        }

        .holo-card:hover {
          transform: translateY(-8px);
        }
        
        .holo-card:hover .holo-card-glass {
          background: rgba(20, 25, 45, 0.6);
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.2);
        }
        
        .holo-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent);
          opacity: 0;
          transition: opacity 0.5s ease;
          box-shadow: 0 0 20px var(--accent);
          z-index: 2;
        }
        
        .holo-card:hover::after {
          opacity: 1;
        }

        .holo-card-content {
          position: relative;
          z-index: 2;
          padding: 2rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .card-title {
          color: #fff;
          font-size: 1.35rem;
          margin: 0;
          line-height: 1.2;
          font-weight: 700;
        }
        
        .card-status-light {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          box-shadow: 0 0 10px var(--accent);
          flex-shrink: 0;
          margin-top: 6px;
        }

        .card-excerpt {
          color: rgba(220, 230, 255, 0.7);
          font-size: 0.95rem;
          line-height: 1.6;
          flex-grow: 1;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .data-stream-viz {
          position: relative;
          height: 20px;
          margin-bottom: 1.5rem;
          overflow: hidden;
          opacity: 0.5;
        }
        
        .stream-line {
          position: absolute;
          top: 50%;
          width: 100%;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }
        
        .stream-particles span {
          position: absolute;
          top: 50%;
          width: 4px;
          height: 4px;
          background: var(--accent);
          border-radius: 50%;
          transform: translateY(-50%);
          animation: moveData 3s linear infinite;
        }
        
        .stream-particles span:nth-child(2) {
          left: 30%;
          animation-delay: 0.5s;
        }
        
        .stream-particles span:nth-child(3) {
          left: 60%;
          animation-delay: 1s;
        }
        
        @keyframes moveData {
          from {
            left: -10%;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          to {
            left: 110%;
            opacity: 0;
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }
        
        .mini-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .mini-tag {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.6);
          background: rgba(255,255,255,0.05);
          padding: 4px 10px;
          border-radius: 12px;
          font-family: 'Courier New', monospace;
        }

        .holo-action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.3s ease;
        }
        
        .holo-action-btn:hover {
          background: var(--accent);
          color: #000;
          border-color: var(--accent);
          box-shadow: 0 0 20px var(--accent);
        }

        @media (max-width: 768px) {
          .holo-card {
            height: auto;
            min-height: 380px;
          }
          
          .holo-card-content {
            padding: 1.5rem;
          }
          
          .card-title {
            font-size: 1.2rem;
          }
          
          .card-excerpt {
            font-size: 0.9rem;
            -webkit-line-clamp: 2;
          }
          
          .card-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .mini-tags {
            width: 100%;
          }
          
          .mini-tag {
            font-size: 0.7rem;
            padding: 3px 8px;
          }
          
          .holo-action-btn {
            font-size: 0.85rem;
            padding: 6px 12px;
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

