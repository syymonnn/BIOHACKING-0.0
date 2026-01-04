// components/HabitCoach.js
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getHabitById } from '../data/habits/database';

const STORAGE_KEY = 'aehuman_habit_tracking';

export default function HabitCoach({ selectedHabitsIds }) {
  const [trackingData, setTrackingData] = useState({});
  const [todayChecks, setTodayChecks] = useState({});
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    consistencyScore: 0
  });
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showMonthlyRecap, setShowMonthlyRecap] = useState(false);

  // Carica dati dal localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTrackingData(data);
        calculateStats(data);
      } catch (e) {
        console.error('Error loading tracking data:', e);
      }
    }
  }, []);

  // Inizializza checklist giornaliera
  useEffect(() => {
    const today = getToday();
    const checks = {};
    
    selectedHabitsIds.forEach(habitId => {
      checks[habitId] = trackingData[habitId]?.[today] || false;
    });
    
    setTodayChecks(checks);
  }, [selectedHabitsIds, trackingData]);

  // Salva dati
  const saveTrackingData = (newData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setTrackingData(newData);
    calculateStats(newData);
  };

  // Toggle habit check
  const toggleHabitCheck = (habitId) => {
    const today = getToday();
    const newData = { ...trackingData };
    
    if (!newData[habitId]) {
      newData[habitId] = {};
    }
    
    newData[habitId][today] = !newData[habitId][today];
    
    setTodayChecks(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }));
    
    saveTrackingData(newData);
  };

  // Calcola statistiche
  const calculateStats = (data) => {
    const allHabits = Object.keys(data);
    if (allHabits.length === 0) {
      setStats({
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        consistencyScore: 0
      });
      return;
    }

    // Raccogli tutte le date
    const allDates = new Set();
    allHabits.forEach(habitId => {
      Object.keys(data[habitId]).forEach(date => {
        if (data[habitId][date]) allDates.add(date);
      });
    });

    const sortedDates = Array.from(allDates).sort();
    const totalDays = sortedDates.length;

    // Calcola streak corrente
    let currentStreak = 0;
    const today = getToday();
    let checkDate = today;
    
    while (true) {
      let dayComplete = true;
      
      for (const habitId of allHabits) {
        if (!data[habitId]?.[checkDate]) {
          dayComplete = false;
          break;
        }
      }
      
      if (!dayComplete) break;
      currentStreak++;
      checkDate = getPreviousDay(checkDate);
    }

    // Calcola consistency score (percentuale giorni completati negli ultimi 30 giorni)
    const last30Days = getLast30Days();
    let completedDays = 0;
    
    last30Days.forEach(date => {
      let dayComplete = true;
      for (const habitId of allHabits) {
        if (!data[habitId]?.[date]) {
          dayComplete = false;
          break;
        }
      }
      if (dayComplete) completedDays++;
    });
    
    const consistencyScore = Math.round((completedDays / 30) * 100);

    setStats({
      currentStreak,
      longestStreak: currentStreak, // Semplificato per MVP
      totalDays,
      consistencyScore
    });
  };

  const selectedHabits = selectedHabitsIds.map(id => getHabitById(id)).filter(Boolean);
  const completedToday = Object.values(todayChecks).filter(Boolean).length;
  const totalToday = selectedHabits.length;
  const progressPercent = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

  return (
    <div className="habit-coach">
      {/* Header Stats */}
      <div className="coach-header">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.consistencyScore}%</div>
            <div className="stat-label">Consistency</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalDays}</div>
            <div className="stat-label">Total Days</div>
          </div>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="daily-progress">
        <div className="progress-header">
          <h4>Oggi: {completedToday}/{totalToday} Abitudini</h4>
          <span className="progress-percent">{Math.round(progressPercent)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Daily Checklist */}
      <div className="daily-checklist">
        <h4>Checklist Giornaliera</h4>
        
        {selectedHabits.length === 0 ? (
          <div className="empty-state">
            <p>Nessuna abitudine selezionata.</p>
            <p className="hint">Usa il Protocol Builder per aggiungere abitudini da tracciare.</p>
          </div>
        ) : (
          <div className="checklist-items">
            {selectedHabits.map(habit => (
              <ChecklistItem
                key={habit.id}
                habit={habit}
                isChecked={todayChecks[habit.id] || false}
                onToggle={() => toggleHabitCheck(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Review Buttons */}
      <div className="review-buttons">
        <button
          className="review-btn"
          onClick={() => setShowWeeklyReview(true)}
        >
          📅 Weekly Review
        </button>
        <button
          className="review-btn"
          onClick={() => setShowMonthlyRecap(true)}
        >
          🎯 Monthly Recap
        </button>
      </div>

      {/* Weekly Review Modal */}
      <AnimatePresence>
        {showWeeklyReview && (
          <ReviewModal
            title="Weekly Review"
            onClose={() => setShowWeeklyReview(false)}
          >
            <WeeklyReview
              trackingData={trackingData}
              selectedHabitsIds={selectedHabitsIds}
            />
          </ReviewModal>
        )}
      </AnimatePresence>

      {/* Monthly Recap Modal */}
      <AnimatePresence>
        {showMonthlyRecap && (
          <ReviewModal
            title="Monthly Recap"
            onClose={() => setShowMonthlyRecap(false)}
          >
            <MonthlyRecap
              trackingData={trackingData}
              selectedHabitsIds={selectedHabitsIds}
              stats={stats}
            />
          </ReviewModal>
        )}
      </AnimatePresence>

      <style jsx>{`
        .habit-coach {
          width: 100%;
        }

        .coach-header {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          font-size: 2rem;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 0.25rem;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--muted);
        }

        .daily-progress {
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .progress-header h4 {
          margin: 0;
          font-size: 1.125rem;
        }

        .progress-percent {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--neon-1);
        }

        .progress-bar {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--neon-1), var(--neon-2));
          border-radius: 6px;
        }

        .daily-checklist {
          background: var(--glass);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-2);
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .daily-checklist h4 {
          margin: 0 0 1.5rem 0;
          font-size: 1.125rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }

        .empty-state p {
          margin: 0.5rem 0;
        }

        .hint {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .checklist-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .review-buttons {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .review-btn {
          padding: 1rem;
          background: var(--glass);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-1);
          color: var(--txt);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .review-btn:hover {
          background: var(--glass-b);
          border-color: var(--neon-1);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .coach-header {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

function ChecklistItem({ habit, isChecked, onToggle }) {
  return (
    <motion.div
      className={`checklist-item ${isChecked ? 'checked' : ''}`}
      whileTap={{ scale: 0.98 }}
    >
      <button
        className="check-box"
        onClick={onToggle}
      >
        {isChecked && <span className="check-icon">✓</span>}
      </button>
      <div className="item-content">
        <h5 className="item-title">{habit.title}</h5>
        {habit.metrics && habit.metrics.length > 0 && (
          <p className="item-metrics">📊 {habit.metrics.join(' • ')}</p>
        )}
      </div>

      <style jsx>{`
        .checklist-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .checklist-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .checklist-item.checked {
          background: rgba(0, 255, 209, 0.05);
          border-color: rgba(0, 255, 209, 0.3);
        }

        .check-box {
          width: 28px;
          height: 28px;
          min-width: 28px;
          border-radius: 8px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 2px;
        }

        .checklist-item.checked .check-box {
          background: var(--neon-1);
          border-color: var(--neon-1);
        }

        .check-icon {
          color: var(--bg0);
          font-weight: 700;
          font-size: 1rem;
        }

        .item-content {
          flex: 1;
        }

        .item-title {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          font-weight: 500;
          line-height: 1.4;
        }

        .item-metrics {
          margin: 0;
          font-size: 0.875rem;
          color: var(--muted);
          line-height: 1.4;
        }
      `}</style>
    </motion.div>
  );
}

function ReviewModal({ title, children, onClose }) {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 2rem;
          }

          .modal-content {
            background: var(--bg0);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: var(--radius-2);
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .modal-header h3 {
            margin: 0;
            font-size: 1.75rem;
          }

          .close-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.1);
            color: var(--txt);
            font-size: 2rem;
            line-height: 1;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
          }

          .modal-body {
            padding: 2rem;
          }

          @media (max-width: 768px) {
            .modal-overlay {
              padding: 1rem;
            }

            .modal-header {
              padding: 1.5rem;
            }

            .modal-body {
              padding: 1.5rem;
            }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}

function WeeklyReview({ trackingData, selectedHabitsIds }) {
  const last7Days = getLast7Days();
  const habits = selectedHabitsIds.map(id => getHabitById(id)).filter(Boolean);

  const completionByDay = last7Days.map(date => {
    const completed = selectedHabitsIds.filter(habitId => 
      trackingData[habitId]?.[date]
    ).length;
    return {
      date,
      completed,
      total: selectedHabitsIds.length,
      percent: selectedHabitsIds.length > 0 
        ? Math.round((completed / selectedHabitsIds.length) * 100) 
        : 0
    };
  });

  const avgCompletion = Math.round(
    completionByDay.reduce((sum, day) => sum + day.percent, 0) / 7
  );

  return (
    <div className="weekly-review">
      <div className="review-summary">
        <h4>Completamento Medio: {avgCompletion}%</h4>
        <p>Ultima settimana ({formatDate(last7Days[0])} - {formatDate(last7Days[6])})</p>
      </div>

      <div className="daily-bars">
        {completionByDay.map(day => (
          <div key={day.date} className="day-bar">
            <div className="day-label">{getDayName(day.date)}</div>
            <div className="bar-container">
              <div
                className="bar-fill"
                style={{ width: `${day.percent}%` }}
              />
            </div>
            <div className="day-value">{day.completed}/{day.total}</div>
          </div>
        ))}
      </div>

      <div className="insights">
        <h5>💡 Insights</h5>
        {avgCompletion >= 80 ? (
          <p>Ottimo lavoro! Stai mantenendo una consistenza eccellente.</p>
        ) : avgCompletion >= 60 ? (
          <p>Buon progresso. Cerca di mantenere la routine anche nei giorni più difficili.</p>
        ) : (
          <p>Questa settimana è stata impegnativa. Ricorda: la consistenza batte l'intensità.</p>
        )}
      </div>

      <style jsx>{`
        .weekly-review {
          color: var(--txt);
        }

        .review-summary {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .review-summary h4 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .review-summary p {
          color: var(--muted);
          margin: 0;
        }

        .daily-bars {
          margin-bottom: 2rem;
        }

        .day-bar {
          display: grid;
          grid-template-columns: 60px 1fr 60px;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .day-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--muted);
        }

        .bar-container {
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--neon-1), var(--neon-2));
          border-radius: 8px;
          transition: width 0.5s ease;
        }

        .day-value {
          font-size: 0.875rem;
          font-weight: 600;
          text-align: right;
        }

        .insights {
          background: rgba(163, 255, 18, 0.05);
          border: 1px solid rgba(163, 255, 18, 0.2);
          border-radius: var(--radius-1);
          padding: 1.5rem;
        }

        .insights h5 {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
        }

        .insights p {
          margin: 0;
          line-height: 1.6;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}

function MonthlyRecap({ trackingData, selectedHabitsIds, stats }) {
  const thisMonth = getCurrentMonth();
  const habits = selectedHabitsIds.map(id => getHabitById(id)).filter(Boolean);

  return (
    <div className="monthly-recap">
      <div className="recap-hero">
        <h4>Il tuo mese in numeri 🎯</h4>
        <p className="month-name">{thisMonth}</p>
      </div>

      <div className="recap-stats">
        <div className="recap-stat">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{stats.currentStreak}</div>
          <div className="stat-label">Streak Massimo</div>
        </div>

        <div className="recap-stat">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.consistencyScore}%</div>
          <div className="stat-label">Consistency Score</div>
        </div>

        <div className="recap-stat">
          <div className="stat-icon">✓</div>
          <div className="stat-value">{stats.totalDays}</div>
          <div className="stat-label">Giorni Attivi</div>
        </div>
      </div>

      <div className="habits-summary">
        <h5>Abitudini Tracciate</h5>
        <div className="habits-list">
          {habits.map(habit => (
            <div key={habit.id} className="habit-item">
              <span className="habit-name">{habit.title}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="motivation">
        <h5>🌟 Continua così!</h5>
        <p>
          {stats.consistencyScore >= 80 
            ? "Stai costruendo abitudini solide. La costanza è la chiave del cambiamento a lungo termine."
            : "Ogni giorno è una nuova opportunità. Le piccole azioni ripetute creano grandi risultati."}
        </p>
      </div>

      <style jsx>{`
        .monthly-recap {
          color: var(--txt);
        }

        .recap-hero {
          text-align: center;
          margin-bottom: 3rem;
        }

        .recap-hero h4 {
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
        }

        .month-name {
          font-size: 1.125rem;
          color: var(--muted);
          margin: 0;
        }

        .recap-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .recap-stat {
          text-align: center;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-1);
        }

        .recap-stat .stat-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .recap-stat .stat-value {
          font-size: 2rem;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--neon-1), var(--neon-2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .recap-stat .stat-label {
          font-size: 0.875rem;
          color: var(--muted);
        }

        .habits-summary {
          margin-bottom: 2rem;
        }

        .habits-summary h5 {
          font-size: 1.125rem;
          margin: 0 0 1rem 0;
        }

        .habits-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .habit-item {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-1);
        }

        .habit-name {
          font-size: 0.9rem;
        }

        .motivation {
          background: linear-gradient(135deg, rgba(0, 255, 209, 0.1), rgba(163, 255, 18, 0.1));
          border: 1px solid rgba(0, 255, 209, 0.3);
          border-radius: var(--radius-1);
          padding: 1.5rem;
        }

        .motivation h5 {
          margin: 0 0 0.75rem 0;
          font-size: 1.125rem;
        }

        .motivation p {
          margin: 0;
          line-height: 1.6;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}

// Utility functions
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getPreviousDay(dateString) {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function getDayName(dateString) {
  const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

function getCurrentMonth() {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  const now = new Date();
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}
