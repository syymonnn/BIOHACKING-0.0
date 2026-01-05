// pages/track/app.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import ProtocolBuilder from '../../components/ProtocolBuilder';
import HabitCoach from '../../components/HabitCoach';
import { isAuthenticatedSync, getUser, logout } from '../../lib/auth';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

export default function TrackApp() {
  const [user, setUser] = useState(null);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [activeView, setActiveView] = useState('coach'); // 'coach' or 'builder'
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      // Verifica autenticazione
      if (!isAuthenticatedSync()) {
        router.push('/track/auth');
        return;
      }

      // Carica dati utente
      const userData = await getUser();
      if (!userData) {
        router.push('/track/auth');
        return;
      }

      setUser(userData);
      setLoading(false);

      // Carica abitudini salvate
      const savedHabits = localStorage.getItem('aehuman_selected_habits');
      if (savedHabits) {
        try {
          setSelectedHabits(JSON.parse(savedHabits));
        } catch (e) {
          console.error('Error loading habits:', e);
        }
      }
    }

    loadUser();
  }, [router]);

  const handleProtocolChange = (newHabits) => {
    setSelectedHabits(newHabits);
    localStorage.setItem('aehuman_selected_habits', JSON.stringify(newHabits));
  };

  const handleLogout = async () => {
    await logout();
    router.push('/track');
  };

  if (loading || !user) {
    return (
      <Layout title="Loading...">
        <div className="loading-container">
          <p>Loading...</p>
        </div>
        <style jsx>{`
          .loading-container {
            min-height: calc(100vh - var(--navbar-height));
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </Layout>
    );
  }

  return (
    <Layout title="Health Space – Track – Æ‑HUMAN">
      <div className="track-app">
        {/* App Header */}
        <div className="app-header">
          <div className="header-content">
            <div className="header-left">
              <h1>Your Health Space</h1>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="header-right">
              <button 
                className="user-settings-btn" 
                onClick={() => router.push('/track/settings')}
                title="Personal Settings"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          <button
            className={`toggle-option ${activeView === 'coach' ? 'active' : ''}`}
            onClick={() => setActiveView('coach')}
          >
            🏋️ Habit Coach
          </button>
          <button
            className={`toggle-option ${activeView === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveView('builder')}
          >
            🧬 Protocol Builder
          </button>
        </div>

        {/* Content */}
        <div className="app-content">
          {activeView === 'coach' ? (
            <motion.div
              key="coach"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-intro">
                <h2>Habit Coach</h2>
                <p>
                  Traccia le tue abitudini quotidiane, mantieni lo streak e ricevi
                  insight settimanali e mensili.
                </p>
              </div>
              <HabitCoach selectedHabitsIds={selectedHabits} />
            </motion.div>
          ) : (
            <motion.div
              key="builder"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="section-intro">
                <h2>Protocol Builder</h2>
                <p>
                  Filtra e seleziona le abitudini che vuoi tracciare. Usa i toggle
                  per trovare abitudini allineate ai tuoi obiettivi.
                </p>
              </div>
              <ProtocolBuilder onProtocolChange={handleProtocolChange} />
            </motion.div>
          )}
        </div>

        {/* Info Card */}
        {selectedHabits.length === 0 && activeView === 'coach' && (
          <motion.div
            className="info-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3>👋 Benvenuto!</h3>
            <p>
              Per iniziare, vai su <strong>Protocol Builder</strong> e seleziona
              le abitudini che vuoi tracciare. Potrai poi monitorarle
              quotidianamente qui nel <strong>Habit Coach</strong>.
            </p>
            <button
              className="primary-btn"
              onClick={() => setActiveView('builder')}
            >
              Vai al Protocol Builder →
            </button>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .track-app {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          min-height: calc(100vh - var(--navbar-height));
          position: relative;
        }

        .track-app::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/images/heart1.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          opacity: 0.12;
          z-index: -1;
        }

        .app-header {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-left h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .user-email {
          color: var(--muted);
          font-size: 0.9rem;
          margin: 0;
        }

        .user-settings-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: rgba(0, 255, 209, 0.1);
          border: 1px solid rgba(0, 255, 209, 0.3);
          border-radius: var(--radius-1);
          color: var(--neon-1);
          cursor: pointer;
          transition: all 0.3s ease;
          height: 44px;
          width: 44px;
        }

        .user-settings-btn:hover {
          background: rgba(0, 255, 209, 0.2);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 255, 209, 0.3);
        }

        .user-settings-btn svg {
          transition: transform 0.3s ease;
        }

        .user-settings-btn:hover svg {
          transform: scale(1.1);
        }

        .logout-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-1);
          color: var(--txt);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
          height: 44px;
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 82, 82, 0.5);
          color: #ff5252;
        }

        .view-toggle {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 0.5rem;
        }

        .toggle-option {
          flex: 1;
          padding: 1rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: var(--radius-1);
          color: var(--txt);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .toggle-option.active {
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          color: var(--bg0);
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0, 255, 209, 0.3);
        }

        .app-content {
          margin-bottom: 3rem;
        }

        .section-intro {
          margin-bottom: 2.5rem;
        }

        .section-intro h2 {
          font-size: 2rem;
          margin: 0 0 0.75rem 0;
        }

        .section-intro p {
          color: var(--muted);
          font-size: 1.125rem;
          line-height: 1.6;
          margin: 0;
          max-width: 800px;
        }

        .info-card {
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.1), rgba(163, 255, 18, 0.1));
          border: 1px solid rgba(0, 255, 209, 0.3);
          border-radius: var(--radius-2);
          padding: 2.5rem;
          text-align: center;
          max-width: 600px;
          margin: 3rem auto;
        }

        .info-card h3 {
          font-size: 1.5rem;
          margin: 0 0 1rem 0;
        }

        .info-card p {
          color: var(--muted);
          line-height: 1.7;
          margin: 0 0 1.5rem 0;
        }

        .primary-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          color: var(--bg0);
          border: none;
          border-radius: var(--radius-1);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 255, 209, 0.25);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 255, 209, 0.4);
        }

        @media (max-width: 768px) {
          .track-app {
            padding: 1.5rem 1rem;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .logout-btn {
            width: 100%;
          }

          .view-toggle {
            flex-direction: column;
            gap: 0.5rem;
          }

          .section-intro h2 {
            font-size: 1.5rem;
          }

          .info-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </Layout>
  );
}
