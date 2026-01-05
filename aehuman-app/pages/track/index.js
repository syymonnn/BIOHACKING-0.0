// pages/track/index.js
import Layout from '../../components/Layout';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TrackLanding() {
  return (
    <Layout title="Track – Æ‑HUMAN">
      <div className="track-landing">
        {/* Hero Section */}
        <section className="track-hero">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content"
          >
            <h1 className="hero-title">
              Your <span className="neon-text">Health Space</span>
            </h1>
            <p className="hero-subtitle">
              Costruisci protocolli di benessere basati sulla scienza.<br />
              Traccia abitudini. Migliora ogni giorno.
            </p>
            
            <Link href="/track/auth">
              <motion.div
                className="cta-card"
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="cta-content">
                  <div className="cta-icon">🚀</div>
                  <h3 className="cta-title">Visit your Health Space</h3>
                  <p className="cta-description">Inizia il tuo percorso di ottimizzazione</p>
                  <div className="cta-arrow">→</div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="track-features">
          <div className="features-grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Protocol Builder</h3>
              <p>Costruisci <strong className="highlight">protocolli personalizzati</strong> con abitudini <strong className="highlight">core</strong> e <strong className="highlight">secondari</strong> basate su <strong className="highlight">evidenza scientifica</strong>.</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 16L12 11L15 14L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 8H21V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Habit Tracking</h3>
              <p>Traccia le tue <strong className="highlight">abitudini quotidiane</strong>, visualizza <strong className="highlight">streak</strong> e <strong className="highlight">consistency score</strong> in <strong className="highlight">tempo reale</strong>.</p>
            </motion.div>

            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="feature-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 20V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4.93 4.93L6.34 6.34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17.66 17.66L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Insight & Reviews</h3>
              <p>Ricevi <strong className="highlight">insight settimanali</strong> automatici e <strong className="highlight">monthly recap</strong> per monitorare i tuoi <strong className="highlight">progressi</strong>.</p>
            </motion.div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="track-disclaimer">
          <p className="disclaimer-text">
            ⚠️ <strong>Disclaimer:</strong> I contenuti sono educativi sul benessere e non sostituiscono un parere medico professionale.
          </p>
        </section>
      </div>

      <style jsx>{`
        .track-landing {
          min-height: calc(100vh - var(--navbar-height));
          padding: 2rem 1.5rem;
          position: relative;
        }

        .track-landing::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/healthspace1.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.15;
          z-index: -1;
        }

        .track-hero {
          max-width: 900px;
          margin: 0 auto 3rem;
          text-align: center;
          padding: 4rem 0 2rem;
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .neon-text {
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--muted);
          margin-bottom: 3.5rem;
          line-height: 1.6;
        }

        .cta-card {
          position: relative;
          background: rgba(15, 15, 35, 0.85);
          backdrop-filter: blur(20px);
          border: 2px solid var(--neon-1);
          border-radius: 25px;
          padding: 3rem 4rem;
          cursor: pointer;
          max-width: 600px;
          margin: 0 auto;
          overflow: hidden;
          box-shadow: 
            0 0 60px rgba(0, 255, 209, 0.4),
            0 0 100px rgba(163, 255, 18, 0.2),
            inset 0 0 60px rgba(0, 255, 209, 0.1),
            0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .cta-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .cta-icon {
          font-size: 3rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin: 0;
        }

        .cta-description {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-weight: 300;
        }

        .cta-arrow {
          font-size: 2.5rem;
          color: var(--neon-1);
          font-weight: bold;
          margin-top: 0.5rem;
          animation: slideRight 1.5s ease-in-out infinite;
        }

        @keyframes slideRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }

        .cta-card:hover {
          border-color: var(--neon-2);
          box-shadow: 
            0 0 80px rgba(0, 255, 209, 0.6),
            0 0 120px rgba(163, 255, 18, 0.4),
            inset 0 0 80px rgba(0, 255, 209, 0.2),
            0 25px 80px rgba(0, 0, 0, 0.6);
        }

        .cta-primary:hover {
          box-shadow: 0 15px 60px rgba(0, 255, 209, 0.6),
                      0 0 100px rgba(163, 255, 18, 0.4),
                      inset 0 0 20px rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .cta-primary:active {
          transform: translateY(0);
        }

        .track-features {
          max-width: 1200px;
          margin: 0 auto 4rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2.5rem;
        }

        .feature-card {
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.03), rgba(163, 255, 18, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 255, 209, 0.2);
          border-radius: var(--radius-2);
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at top center, rgba(0, 255, 209, 0.1), transparent 70%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-card:hover {
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.08), rgba(163, 255, 18, 0.08));
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 60px rgba(0, 255, 209, 0.3),
                      0 0 40px rgba(163, 255, 18, 0.2);
          border-color: rgba(0, 255, 209, 0.4);
        }

        .feature-icon {
          margin: 0 0 1.5rem 0;
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.1), rgba(163, 255, 18, 0.1));
          border: 2px solid rgba(0, 255, 209, 0.3);
          border-radius: 20px;
          color: var(--neon-1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover .feature-icon {
          transform: translateY(-5px) scale(1.05);
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.2), rgba(163, 255, 18, 0.2));
          border-color: var(--neon-1);
          box-shadow: 0 10px 30px rgba(0, 255, 209, 0.4),
                      0 0 50px rgba(163, 255, 18, 0.3);
        }

        .feature-card h3 {
          font-size: 1.75rem;
          margin: 0 0 1rem 0;
          color: var(--txt);
          font-weight: 700;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          transition: all 0.3s ease;
        }

        .feature-card p {
          color: var(--muted);
          line-height: 1.7;
          font-size: 1.05rem;
          margin: 0;
        }

        .feature-card .highlight {
          font-weight: 700;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .track-disclaimer {
          max-width: 800px;
          margin: 4rem auto 2rem;
          padding: 1.5rem;
          background: rgba(255, 232, 105, 0.1);
          border: 1px solid rgba(255, 232, 105, 0.3);
          border-radius: var(--radius-1);
        }

        .disclaimer-text {
          color: var(--neon-3);
          text-align: center;
          margin: 0;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .track-landing {
            padding: 1.25rem;
          }

          .track-hero {
            padding: 2rem 0 1rem;
            margin-bottom: 2rem;
          }

          .hero-title {
            font-size: 2.25rem;
            margin-bottom: 1.25rem;
          }

          .hero-subtitle {
            font-size: 1.05rem;
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .cta-card {
            padding: 2rem 1.75rem;
            border-radius: 20px;
            border-width: 2px;
            box-shadow: 
              0 0 50px rgba(0, 255, 209, 0.35),
              0 0 80px rgba(163, 255, 18, 0.2),
              inset 0 0 50px rgba(0, 255, 209, 0.1),
              0 18px 50px rgba(0, 0, 0, 0.45);
          }

          .cta-content {
            gap: 0.85rem;
          }

          .cta-icon {
            font-size: 2.5rem;
          }

          .cta-title {
            font-size: 1.5rem;
            letter-spacing: 1px;
          }

          .cta-description {
            font-size: 0.95rem;
            opacity: 0.95;
          }

          .cta-arrow {
            font-size: 1.8rem;
            margin-top: 0.35rem;
          }

          .track-features {
            margin-bottom: 2.5rem;
          }

          .features-grid {
            gap: 1.15rem;
            grid-template-columns: 1fr;
          }

          .feature-card {
            padding: 1.5rem 1.35rem;
            border-radius: 16px;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            text-align: left;
            gap: 1.25rem;
          }

          .feature-card::before {
            background: radial-gradient(circle at left center, rgba(0, 255, 209, 0.1), transparent 65%);
          }

          .feature-icon {
            font-size: 2.5rem;
            margin-bottom: 0;
            flex-shrink: 0;
            filter: drop-shadow(0 4px 10px rgba(0, 255, 209, 0.3));
          }

          .feature-card:hover .feature-icon {
            transform: scale(1.12) rotate(3deg);
          }

          .feature-card h3 {
            font-size: 1.3rem;
            margin-bottom: 0.65rem;
            line-height: 1.35;
          }

          .feature-card p {
            font-size: 0.925rem;
            line-height: 1.6;
          }

          .track-disclaimer {
            margin: 2.5rem auto 2rem;
            padding: 1.25rem;
          }

          .disclaimer-text {
            font-size: 0.9rem;
            line-height: 1.55;
          }
        }
      `}</style>
    </Layout>
  );
}
