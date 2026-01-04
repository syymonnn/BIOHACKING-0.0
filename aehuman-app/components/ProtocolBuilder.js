// components/ProtocolBuilder.js
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CATEGORIES, 
  TARGET_AUDIENCE, 
  EVIDENCE_LEVEL,
  HABIT_TYPE,
  filterHabits,
  getHabitById
} from '../data/habits/database';

export default function ProtocolBuilder({ onProtocolChange }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAudience, setSelectedAudience] = useState([]);
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [expandedHabit, setExpandedHabit] = useState(null);

  // Filtra abitudini quando cambiano i filtri
  useEffect(() => {
    const habits = filterHabits({
      categories: selectedCategories,
      audiences: selectedAudience,
      evidenceLevels: selectedEvidence
    });
    setFilteredHabits(habits);
  }, [selectedCategories, selectedAudience, selectedEvidence]);

  // Notifica parent component quando cambia il protocollo
  useEffect(() => {
    if (onProtocolChange) {
      onProtocolChange(selectedHabits);
    }
  }, [selectedHabits, onProtocolChange]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleAudience = (audience) => {
    setSelectedAudience(prev =>
      prev.includes(audience)
        ? prev.filter(a => a !== audience)
        : [...prev, audience]
    );
  };

  const toggleEvidence = (level) => {
    setSelectedEvidence(prev =>
      prev.includes(level)
        ? prev.filter(e => e !== level)
        : [...prev, level]
    );
  };

  const toggleHabitSelection = (habitId) => {
    setSelectedHabits(prev =>
      prev.includes(habitId)
        ? prev.filter(h => h !== habitId)
        : [...prev, habitId]
    );
  };

  const coreHabits = filteredHabits.filter(h => h.type === HABIT_TYPE.CORE);
  const optionalHabits = filteredHabits.filter(h => h.type === HABIT_TYPE.OPTIONAL);

  return (
    <div className="protocol-builder">
      {/* Filtri */}
      <div className="filters-section">
        <h3>Filtra Abitudini</h3>
        
        {/* Categorie */}
        <div className="filter-group">
          <label className="filter-label">Macro-Aree</label>
          <div className="toggle-grid">
            {Object.values(CATEGORIES).map(cat => (
              <button
                key={cat.id}
                className={`toggle-btn ${selectedCategories.includes(cat.id) ? 'active' : ''}`}
                onClick={() => toggleCategory(cat.id)}
                style={{
                  '--category-color': cat.color
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Audience */}
        <div className="filter-group">
          <label className="filter-label">Categoria Target</label>
          <div className="toggle-grid">
            <button
              className={`toggle-btn ${selectedAudience.includes(TARGET_AUDIENCE.HEALTHY_ADULTS) ? 'active' : ''}`}
              onClick={() => toggleAudience(TARGET_AUDIENCE.HEALTHY_ADULTS)}
            >
              Adulti Sani
            </button>
            <button
              className={`toggle-btn ${selectedAudience.includes(TARGET_AUDIENCE.ATHLETES) ? 'active' : ''}`}
              onClick={() => toggleAudience(TARGET_AUDIENCE.ATHLETES)}
            >
              Sportivi
            </button>
            <button
              className={`toggle-btn ${selectedAudience.includes(TARGET_AUDIENCE.ELDERLY) ? 'active' : ''}`}
              onClick={() => toggleAudience(TARGET_AUDIENCE.ELDERLY)}
            >
              Anziani
            </button>
            <button
              className={`toggle-btn ${selectedAudience.includes(TARGET_AUDIENCE.STRESSED) ? 'active' : ''}`}
              onClick={() => toggleAudience(TARGET_AUDIENCE.STRESSED)}
            >
              Persone Stressate
            </button>
            <button
              className={`toggle-btn ${selectedAudience.includes(TARGET_AUDIENCE.STUDENTS) ? 'active' : ''}`}
              onClick={() => toggleAudience(TARGET_AUDIENCE.STUDENTS)}
            >
              Studenti
            </button>
          </div>
        </div>

        {/* Evidenza Scientifica */}
        <div className="filter-group">
          <label className="filter-label">Evidenza Scientifica</label>
          <div className="toggle-grid">
            <button
              className={`toggle-btn ${selectedEvidence.includes(EVIDENCE_LEVEL.STRONG) ? 'active' : ''}`}
              onClick={() => toggleEvidence(EVIDENCE_LEVEL.STRONG)}
            >
              Forte
            </button>
            <button
              className={`toggle-btn ${selectedEvidence.includes(EVIDENCE_LEVEL.EMERGING) ? 'active' : ''}`}
              onClick={() => toggleEvidence(EVIDENCE_LEVEL.EMERGING)}
            >
              Emergente
            </button>
          </div>
        </div>
      </div>

      {/* Risultati */}
      <div className="habits-results">
        {/* Core Habits */}
        <div className="habits-section">
          <h4 className="section-title">
            Core Habits <span className="count">({coreHabits.length})</span>
          </h4>
          <div className="habits-grid">
            {coreHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isSelected={selectedHabits.includes(habit.id)}
                isExpanded={expandedHabit === habit.id}
                onToggleSelect={() => toggleHabitSelection(habit.id)}
                onToggleExpand={() => setExpandedHabit(
                  expandedHabit === habit.id ? null : habit.id
                )}
              />
            ))}
          </div>
        </div>

        {/* Optional Habits */}
        <div className="habits-section">
          <h4 className="section-title">
            Optional Habits <span className="count">({optionalHabits.length})</span>
          </h4>
          <div className="habits-grid">
            {optionalHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isSelected={selectedHabits.includes(habit.id)}
                isExpanded={expandedHabit === habit.id}
                onToggleSelect={() => toggleHabitSelection(habit.id)}
                onToggleExpand={() => setExpandedHabit(
                  expandedHabit === habit.id ? null : habit.id
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .protocol-builder {
          width: 100%;
        }

        .filters-section {
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .filters-section h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .filter-group {
          margin-bottom: 1.5rem;
        }

        .filter-group:last-child {
          margin-bottom: 0;
        }

        .filter-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.75rem;
        }

        .toggle-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .toggle-btn {
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-1);
          color: var(--txt);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .toggle-btn.active {
          background: var(--category-color, var(--neon-1));
          border-color: var(--category-color, var(--neon-1));
          color: var(--bg0);
          font-weight: 600;
        }

        .habits-results {
          margin-top: 2rem;
        }

        .habits-section {
          margin-bottom: 3rem;
        }

        .section-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .count {
          font-size: 0.875rem;
          color: var(--muted);
          font-weight: 400;
        }

        .habits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .filters-section {
            padding: 1.5rem;
          }

          .habits-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function HabitCard({ habit, isSelected, isExpanded, onToggleSelect, onToggleExpand }) {
  const category = Object.values(CATEGORIES).find(c => c.id === habit.category);

  return (
    <motion.div
      className={`habit-card ${isSelected ? 'selected' : ''}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="habit-header">
        <div className="habit-category-badge" style={{ background: category?.color }}>
          {category?.label}
        </div>
        <button
          className={`select-btn ${isSelected ? 'selected' : ''}`}
          onClick={onToggleSelect}
        >
          {isSelected ? '✓' : '+'}
        </button>
      </div>

      <h5 className="habit-title">{habit.title}</h5>
      <p className="habit-description">{habit.description}</p>

      <div className="habit-meta">
        <span className={`evidence-badge ${habit.evidenceLevel}`}>
          {habit.evidenceLevel === EVIDENCE_LEVEL.STRONG ? '✓ Forte' : '◐ Emergente'}
        </span>
        <span className="type-badge">{habit.type === HABIT_TYPE.CORE ? 'Core' : 'Optional'}</span>
      </div>

      <button className="expand-btn" onClick={onToggleExpand}>
        {isExpanded ? 'Chiudi dettagli ▲' : 'Vedi dettagli ▼'}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="habit-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="details-content">
              <h6>Metriche suggerite:</h6>
              <ul>
                {habit.metrics.map((metric, i) => (
                  <li key={i}>{metric}</li>
                ))}
              </ul>

              <h6>Fonti:</h6>
              <ul>
                {habit.sources.map((source, i) => (
                  <li key={i}>{source}</li>
                ))}
              </ul>

              {habit.articleSlug && (
                <a href={`/academy/${habit.articleSlug}?from=track`} className="article-link">
                  📖 Leggi l'articolo completo →
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .habit-card {
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .habit-card:hover {
          background: var(--glass-b);
          box-shadow: var(--shadow-1);
        }

        .habit-card.selected {
          border-color: var(--neon-1);
          box-shadow: 0 0 20px rgba(0, 255, 209, 0.2);
        }

        .habit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .habit-category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--bg0);
        }

        .select-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          color: var(--txt);
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .select-btn:hover {
          border-color: var(--neon-1);
          background: rgba(0, 255, 209, 0.1);
        }

        .select-btn.selected {
          background: var(--neon-1);
          border-color: var(--neon-1);
          color: var(--bg0);
        }

        .habit-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }

        .habit-description {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .habit-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .evidence-badge,
        .type-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .evidence-badge.forte {
          background: rgba(163, 255, 18, 0.2);
          color: var(--neon-2);
        }

        .evidence-badge.emergente {
          background: rgba(255, 232, 105, 0.2);
          color: var(--neon-3);
        }

        .type-badge {
          background: rgba(255, 255, 255, 0.1);
          color: var(--muted);
        }

        .expand-btn {
          width: 100%;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-1);
          color: var(--txt);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .expand-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .habit-details {
          margin-top: 1rem;
          overflow: hidden;
        }

        .details-content {
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .details-content h6 {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          margin-top: 1rem;
        }

        .details-content h6:first-child {
          margin-top: 0;
        }

        .details-content ul {
          margin: 0;
          padding-left: 1.5rem;
        }

        .details-content li {
          font-size: 0.875rem;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 0.25rem;
        }

        .article-link {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: rgba(0, 255, 209, 0.1);
          border: 1px solid rgba(0, 255, 209, 0.3);
          border-radius: var(--radius-1);
          color: var(--neon-1);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .article-link:hover {
          background: rgba(0, 255, 209, 0.2);
          transform: translateX(4px);
        }
      `}</style>
    </motion.div>
  );
}
