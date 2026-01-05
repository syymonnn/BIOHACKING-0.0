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
          <div className="header-top">
            <div className="header-left">
              <h1>Your Health Space</h1>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="header-right">
              <button 
                className="icon-btn settings-btn" 
                onClick={() => router.push('/track/settings')}
                title="Personal Settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="btn-secondary logout-btn" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Sign Out</span>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Habit Tracking</span>
          </button>
          <button
            className={`toggle-option ${activeView === 'builder' ? 'active' : ''}`}
            onClick={() => setActiveView('builder')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Protocol Builder</span>
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
                <div className="intro-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18457 2.99721 7.13633 4.39828 5.49707C5.79935 3.85782 7.69279 2.71538 9.79619 2.24015C11.8996 1.76491 14.1003 1.98232 16.07 2.86" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="intro-text">
                  <h2>Daily Habit Tracking</h2>
                  <p>Monitor your habits, maintain streaks, and receive weekly insights</p>
                </div>
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
                <div className="intro-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 18V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="intro-text">
                  <h2>Build Your Protocol</h2>
                  <p>Filter and select habits aligned with your health goals</p>
                </div>
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
            <div className="info-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 16V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>Get Started</h3>
            <p>
              Begin by building your protocol. Select the habits you want to track
              and start your wellness journey today.
            </p>
            <button
              className="primary-btn"
              onClick={() => setActiveView('builder')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Build Protocol</span>
            </button>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .track-app {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
          min-height: 100vh;
          position: relative;
        }

        .track-app::before {
          content: '';
          position: absolute;
          top: 0;
          left: -50%;
          right: -50%;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(0, 255, 209, 0.03) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(163, 255, 18, 0.02) 0%, transparent 50%);
          z-index: -1;
          pointer-events: none;
        }

        .app-header {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .header-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
        }

        .header-left h1 {
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          margin: 0 0 0.5rem 0;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--txt);
        }

        .user-email {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          margin: 0;
          font-weight: 400;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 44px;
          width: 44px;
        }

        .icon-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          color: var(--txt);
          transform: translateY(-1px);
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 44px;
        }

        .btn-secondary:hover {
          background: rgba(255, 82, 82, 0.1);
          border-color: rgba(255, 82, 82, 0.3);
          color: #ff5252;
        }

        .btn-secondary svg {
          transition: transform 0.3s ease;
        }

        .btn-secondary:hover svg {
          transform: translateX(2px);
        }

        .view-toggle {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.5rem;
          will-change: transform;
        }

        .toggle-option {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          padding: 0.875rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .toggle-option svg {
          transition: transform 0.3s ease;
        }

        .toggle-option:hover {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
        }

        .toggle-option:hover svg {
          transform: scale(1.1);
        }

        .toggle-option.active {
          background: rgba(0, 255, 209, 0.12);
          color: var(--neon-1);
          border: 1px solid rgba(0, 255, 209, 0.25);
        }

        .toggle-option.active svg {
          filter: drop-shadow(0 0 8px rgba(0, 255, 209, 0.5));
        }

        .app-content {
          margin-bottom: 3rem;
        }

        .section-intro {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          margin-bottom: 2.5rem;
          padding: 1.75rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          will-change: transform;
        }

        .intro-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.15), rgba(163, 255, 18, 0.1));
          border: 1px solid rgba(0, 255, 209, 0.25);
          border-radius: 12px;
          color: var(--neon-1);
        }

        .intro-text {
          flex: 1;
        }

        .section-intro h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.01em;
          color: var(--txt);
        }

        .section-intro p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9375rem;
          line-height: 1.5;
          margin: 0;
        }

        .info-card {
          max-width: 600px;
          margin: 3rem auto;
          padding: 2.5rem;
          background: rgba(0, 0, 0, 0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          text-align: center;
          will-change: transform;
        }

        .info-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.12), rgba(163, 255, 18, 0.08));
          border: 1px solid rgba(0, 255, 209, 0.2);
          border-radius: 50%;
          color: var(--neon-1);
        }

        .info-card h3 {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: var(--txt);
        }

        .info-card p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 2rem 0;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          border: none;
          border-radius: 10px;
          color: #000;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(0, 255, 209, 0.25);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 209, 0.4);
        }

        .primary-btn svg {
          transition: transform 0.3s ease;
        }

        .primary-btn:hover svg {
          transform: translateX(3px);
        }

        @media (max-width: 768px) {
          .track-app {
            padding: 1.5rem 1rem;
          }

          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }

          .header-right {
            width: 100%;
          }

          .btn-secondary {
            flex: 1;
          }

          .view-toggle {
            flex-direction: column;
            gap: 0.5rem;
          }

          .section-intro {
            flex-direction: column;
            padding: 1.5rem;
          }

          .section-intro h2 {
            font-size: 1.25rem;
          }

          .info-card {
            padding: 2rem 1.5rem;
          }

          .info-icon {
            width: 64px;
            height: 64px;
          }

          .info-card h3 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  );
}
