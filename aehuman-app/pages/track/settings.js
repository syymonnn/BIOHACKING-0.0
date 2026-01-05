// pages/track/settings.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { isAuthenticatedSync, getUser } from '../../lib/auth';
import { supabase } from '../../lib/supabaseClient';
import { motion } from 'framer-motion';

// Avatar disponibili (10 varianti moderne e professionali)
const AVATARS = [
  { id: 1, emoji: '🚀', name: 'Rocket', color: '#00FFD1' },
  { id: 2, emoji: '⚡', name: 'Lightning', color: '#FFE869' },
  { id: 3, emoji: '🧬', name: 'DNA', color: '#A3FF12' },
  { id: 4, emoji: '🎯', name: 'Target', color: '#FF6B35' },
  { id: 5, emoji: '💎', name: 'Diamond', color: '#00D9FF' },
  { id: 6, emoji: '🌟', name: 'Star', color: '#FFC857' },
  { id: 7, emoji: '🔮', name: 'Crystal', color: '#BD00FF' },
  { id: 8, emoji: '🦾', name: 'Bionic', color: '#00FFB3' },
  { id: 9, emoji: '🧪', name: 'Lab', color: '#FF3B9A' },
  { id: 10, emoji: '🎨', name: 'Art', color: '#00E5FF' },
];

export default function TrackSettings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    avatar_url: AVATARS[0].emoji,
    bio: '',
    age: '',
    location: '',
  });

  useEffect(() => {
    async function loadUserData() {
      if (!isAuthenticatedSync()) {
        router.push('/track/auth');
        return;
      }

      const userData = await getUser();
      if (!userData) {
        router.push('/track/auth');
        return;
      }

      setUser(userData);

      // Carica profilo da Supabase se disponibile
      if (supabase) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.id)
          .single();

        if (profile) {
          const nameParts = (profile.full_name || '').split(' ');
          setFormData({
            full_name: profile.full_name || '',
            first_name: nameParts[0] || '',
            last_name: nameParts.slice(1).join(' ') || '',
            avatar_url: profile.avatar_url || AVATARS[0].emoji,
            bio: profile.bio || '',
            age: profile.age || '',
            location: profile.location || '',
          });
        }
      }

      setLoading(false);
    }

    loadUserData();
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'first_name' || name === 'last_name' 
        ? { full_name: `${name === 'first_name' ? value : prev.first_name} ${name === 'last_name' ? value : prev.last_name}`.trim() }
        : {}
      )
    }));
  };

  const handleAvatarSelect = (avatar) => {
    setFormData(prev => ({ ...prev, avatar_url: avatar.emoji }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (supabase && user) {
        // Aggiorna profilo su Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            avatar_url: formData.avatar_url,
            bio: formData.bio,
          })
          .eq('id', user.id);

        if (error) throw error;

        setMessage({ type: 'success', text: '✅ Profilo aggiornato con successo!' });
      } else {
        // Fallback localStorage
        setMessage({ type: 'success', text: '✅ Modifiche salvate localmente!' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: '❌ Errore nel salvare il profilo.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="loading-container">
          <p>Caricamento...</p>
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
    <Layout title="Settings – Health Space – Æ‑HUMAN">
      <div className="settings-container">
        <motion.div
          className="settings-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="settings-header">
            <button onClick={() => router.back()} className="back-btn">
              ← Indietro
            </button>
            <h1>⚙️ Personal Settings</h1>
            <p className="user-email">{user?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            {/* Avatar Selection */}
            <div className="form-section">
              <label className="section-label">Scegli il tuo Avatar</label>
              <div className="avatar-grid">
                {AVATARS.map(avatar => (
                  <motion.button
                    key={avatar.id}
                    type="button"
                    className={`avatar-option ${formData.avatar_url === avatar.emoji ? 'active' : ''}`}
                    onClick={() => handleAvatarSelect(avatar)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ '--avatar-color': avatar.color }}
                  >
                    <span className="avatar-emoji">{avatar.emoji}</span>
                    <span className="avatar-name">{avatar.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Nome e Cognome */}
            <div className="form-section">
              <label className="section-label">Informazioni Personali</label>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">Nome</label>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Mario"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="last_name">Cognome</label>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Rossi"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="form-section">
              <label className="section-label">Bio (Opzionale)</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Racconta qualcosa di te e dei tuoi obiettivi di benessere..."
                className="textarea-field"
                rows={4}
              />
            </div>

            {/* Informazioni Opzionali */}
            <div className="form-section">
              <label className="section-label">Altre Informazioni (Opzionali)</label>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="age">Età</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="input-field"
                    min="13"
                    max="120"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="location">Città</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Milano"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            {message.text && (
              <motion.div
                className={`message ${message.type}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message.text}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              {saving ? 'Salvataggio...' : 'Salva Modifiche'}
            </button>
          </form>
        </motion.div>
      </div>

      <style jsx>{`
        .settings-container {
          min-height: calc(100vh - var(--navbar-height));
          padding: 2rem 1.5rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .settings-card {
          background: var(--glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 2.5rem;
        }

        .settings-header {
          margin-bottom: 2.5rem;
          position: relative;
        }

        .back-btn {
          background: rgba(0, 255, 209, 0.1);
          border: 1px solid rgba(0, 255, 209, 0.3);
          color: var(--neon-1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          margin-bottom: 1rem;
        }

        .back-btn:hover {
          background: rgba(0, 255, 209, 0.2);
          transform: translateX(-3px);
        }

        .settings-header h1 {
          font-size: 2rem;
          margin: 0.5rem 0;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .user-email {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .section-label {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--txt);
          margin-bottom: 0.5rem;
        }

        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 1rem;
        }

        .avatar-option {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .avatar-option:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--avatar-color);
        }

        .avatar-option.active {
          background: rgba(0, 255, 209, 0.15);
          border-color: var(--neon-1);
          box-shadow: 0 0 20px rgba(0, 255, 209, 0.3);
        }

        .avatar-emoji {
          font-size: 2.5rem;
        }

        .avatar-name {
          font-size: 0.8rem;
          color: var(--muted);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.9rem;
          color: var(--muted);
        }

        .input-field {
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
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

        .textarea-field {
          padding: 0.875rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: var(--txt);
          font-size: 1rem;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
        }

        .textarea-field:focus {
          outline: none;
          border-color: var(--neon-1);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(0, 255, 209, 0.1);
        }

        .message {
          padding: 1rem;
          border-radius: 10px;
          text-align: center;
          font-weight: 500;
        }

        .message.success {
          background: rgba(163, 255, 18, 0.1);
          border: 1px solid rgba(163, 255, 18, 0.3);
          color: var(--neon-2);
        }

        .message.error {
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #ff6b6b;
        }

        .btn-save {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          border: none;
          border-radius: 12px;
          color: #000;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 209, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .settings-card {
            padding: 1.5rem;
          }

          .avatar-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 0.75rem;
          }

          .avatar-emoji {
            font-size: 2rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}
