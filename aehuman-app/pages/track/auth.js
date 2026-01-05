// pages/track/auth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { login, isAuthenticatedSync } from '../../lib/auth';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

export default function TrackAuth() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Redirect se già autenticato
  useEffect(() => {
    if (isAuthenticatedSync()) {
      router.push('/track/app');
    }
  }, [router]);

  // Gestisci il callback di Supabase dopo il click sul magic link
  useEffect(() => {
    if (!supabase) return;

    // Controlla se c'è un hash fragment nella URL (da magic link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (accessToken) {
      // L'utente ha cliccato sul magic link
      // Supabase gestisce automaticamente la sessione
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Salva in localStorage per sincronizzare
          const authData = {
            email: session.user.email,
            loggedIn: true,
            timestamp: Date.now()
          };
          localStorage.setItem('aehuman_auth', JSON.stringify(authData));
          
          // Pulisci l'URL e redirect all'app
          window.history.replaceState({}, document.title, '/track/app');
          router.push('/track/app');
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }

    // Listener normale per altri casi
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const authData = {
          email: session.user.email,
          loggedIn: true,
          timestamp: Date.now()
        };
        localStorage.setItem('aehuman_auth', JSON.stringify(authData));
        router.push('/track/app');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await login(email);
      
      if (result.needsConfirmation) {
        // Supabase magic link inviato
        setSuccess(true);
        setLoading(false);
      } else {
        // Fallback mode (dev) - redirect diretto
        setTimeout(() => {
          router.push('/track/app');
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Errore durante il login');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout title="Controlla la tua email – Track – Æ‑HUMAN">
        <div className="auth-container">
          <motion.div
            className="auth-card success-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="success-icon">✉️</div>
            <h1>Controlla la tua email</h1>
            <p>Ti abbiamo inviato un <strong>magic link</strong> a:</p>
            <p className="email-display">{email}</p>
            <p className="instruction">
              Clicca sul link nell'email per accedere al tuo Health Space.
            </p>
            <button 
              onClick={() => setSuccess(false)}
              className="btn-back"
            >
              ← Torna al login
            </button>
          </motion.div>

          <style jsx>{`
            .auth-container {
              min-height: calc(100vh - var(--navbar-height));
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem 1.5rem;
            }

            .success-card {
              text-align: center;
              padding: 3rem;
            }

            .success-icon {
              font-size: 4rem;
              margin-bottom: 1.5rem;
              animation: bounce 1s ease-in-out infinite;
            }

            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }

            .success-card h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
              background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .email-display {
              font-size: 1.25rem;
              color: var(--neon-1);
              font-weight: 600;
              margin: 1rem 0;
            }

            .instruction {
              color: var(--muted);
              line-height: 1.6;
              margin: 1.5rem 0;
            }

            .btn-back {
              margin-top: 2rem;
              padding: 0.875rem 2rem;
              background: rgba(0, 255, 209, 0.1);
              border: 1px solid var(--neon-1);
              border-radius: 12px;
              color: var(--neon-1);
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .btn-back:hover {
              background: rgba(0, 255, 209, 0.2);
              transform: translateY(-2px);
            }
          `}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Login – Track – Æ‑HUMAN">
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-header">
            <h1>Welcome to Your Health Space</h1>
            <p>Accedi con la tua email per continuare</p>
            <p className="auth-hint">
              💡 Nuovo o di ritorno? Inserisci la tua email e riceverai un link di accesso sicuro.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="input-field"
              />
            </div>

            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Accesso...' : 'Accedi →'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="disclaimer-small">
              {supabase 
                ? '🔐 Autenticazione sicura tramite Magic Link. Nessuna password richiesta.'
                : '⚠️ Modalità sviluppo: login diretto senza verifica email.'
              }
            </p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .auth-container {
          min-height: calc(100vh - var(--navbar-height));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }

        .auth-card {
          background: var(--glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 3rem;
          max-width: 480px;
          width: 100%;
          box-shadow: var(--shadow-1);
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-header h1 {
          font-size: 2rem;
          margin-bottom: 0.75rem;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-header p {
          color: var(--muted);
          font-size: 1rem;
        }

        .auth-hint {
          font-size: 0.9rem;
          color: rgba(0, 255, 209, 0.9);
          background: rgba(0, 255, 209, 0.08);
          padding: 0.875rem 1rem;
          border-radius: 10px;
          border-left: 3px solid var(--neon-1);
          margin-top: 1rem;
          line-height: 1.5;
        }

        .auth-form {
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--txt);
          font-weight: 500;
        }

        .input-field {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-1);
          color: var(--txt);
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-field:focus {
          outline: none;
          border-color: var(--neon-1);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.1);
        }

        .input-field:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-field::placeholder {
          color: rgba(207, 216, 220, 0.4);
        }

        .error-message {
          background: rgba(255, 82, 82, 0.1);
          border: 1px solid rgba(255, 82, 82, 0.3);
          color: #ff5252;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-1);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .btn-submit {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          color: var(--bg0);
          border: none;
          border-radius: var(--radius-1);
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(0, 255, 209, 0.25);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0, 255, 209, 0.4);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-footer {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .disclaimer-small {
          color: var(--muted);
          font-size: 0.875rem;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 768px) {
          .auth-card {
            padding: 2rem 1.5rem;
          }

          .auth-header h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </Layout>
  );
}
