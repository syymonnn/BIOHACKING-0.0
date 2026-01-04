// pages/products.js - COMING SOON PAGE
import Layout from '../components/Layout';

export default function ComingSoon() {
  return (
    <Layout title="Products - Coming Soon">
      <div className="coming-soon-wrapper">
        <h1 className="coming-soon-title">
          COMING <span className="text-stroke">SOON</span>
        </h1>
        <p className="coming-soon-subtitle">
          // by Æ-HUMAN for YOU
        </p>
      </div>

      <style jsx>{`
        .coming-soon-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }

        .coming-soon-title {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: clamp(2.5rem, 8vw, 5rem);
          color: #fff;
          text-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
          margin: 0;
          letter-spacing: -1px;
        }

        .text-stroke {
          color: transparent;
          -webkit-text-stroke: 1px rgba(189, 0, 255, 0.8);
          filter: drop-shadow(0 0 8px rgba(189, 0, 255, 0.5));
        }

        .coming-soon-subtitle {
          color: rgba(200, 230, 255, 0.7);
          font-size: 1.1rem;
          margin: 0;
          letter-spacing: 1px;
          font-family: 'Courier New', monospace;
        }
      `}</style>
    </Layout>
  );
}

// ================================================================================
// MARKETPLACE COMPLETO - CODICE SALVATO IN products.backup.js
// Per riabilitare il marketplace, sostituire questo file con products.backup.js
