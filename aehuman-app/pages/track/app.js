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
              <div className="title-group">
                <h1>Health Dashboard</h1>
                <span className="user-badge">Professional</span>
              </div>
              <p className="user-email">{user.email}</p>
            </div>
            <div className="header-right">
              <button 
                className="icon-btn settings-btn" 
                onClick={() => router.push('/track/settings')}
                title="Settings"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          background: radial-gradient(circle at 20% 50%, rgba(0, 255, 209, 0.03) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(163, 255, 18, 0.02) 0%, transparent 50%);
          z-index: -1;
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

        .title-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .header-left h1 {
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          margin: 0;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--txt);
        }

        .user-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.875rem;
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.12), rgba(163, 255, 18, 0.08));
          border: 1px solid rgba(0, 255, 209, 0.25);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--neon-1);
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
