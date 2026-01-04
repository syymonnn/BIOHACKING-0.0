// data/habits/database.js
// Database abitudini per Protocol Builder
// Struttura pronta per import da CSV

export const CATEGORIES = {
  SLEEP: { id: 'sleep', label: 'Sleep', color: '#a239ca' },
  FOCUS: { id: 'focus', label: 'Focus', color: '#00ffd1' },
  COLD: { id: 'cold', label: 'Cold', color: '#a3ff12' },
  LONGEVITY: { id: 'longevity', label: 'Longevity', color: '#ffe869' },
  TRAINING: { id: 'training', label: 'Training', color: '#ff6b6b' },
  RESILIENCE: { id: 'resilience', label: 'Resilience', color: '#4ecdc4' },
  PSYCHE: { id: 'psyche', label: 'Psyche', color: '#a8e6cf' },
  ENERGY: { id: 'energy', label: 'Energy', color: '#ffd93d' }
};

export const TARGET_AUDIENCE = {
  HEALTHY_ADULTS: 'adulti-sani',
  ATHLETES: 'sportivi',
  ELDERLY: 'anziani',
  STRESSED: 'persone-stressate',
  STUDENTS: 'studenti'
};

export const EVIDENCE_LEVEL = {
  STRONG: 'forte',
  EMERGING: 'emergente'
};

export const HABIT_TYPE = {
  CORE: 'core',
  OPTIONAL: 'optional'
};

// Database abitudini - Esempio struttura
// NOTA: Sostituisci con dati dal CSV
export const HABITS_DATABASE = [
  // SLEEP
  {
    id: 'sleep-001',
    title: 'Esposizione alla luce solare mattutina',
    description: 'Esporsi alla luce naturale entro 30-60 minuti dal risveglio per 10-30 minuti. Favorisce il ritmo circadiano e la produzione di cortisolo mattutino.',
    category: CATEGORIES.SLEEP.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ATHLETES, TARGET_AUDIENCE.STUDENTS],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Minuti di esposizione', 'Orario'],
    sources: [
      'Huberman Lab - Sleep Toolkit',
      'Walker, M. (2017). Why We Sleep',
      'Xie et al., Science, 2013'
    ],
    articleSlug: 'Sleep: Brain Cleansing, Longevity and Performance'
  },
  {
    id: 'sleep-002',
    title: 'Routine pre-sonno consistente',
    description: 'Stabilire una routine di 30-60 minuti prima di dormire (stesso orario ogni sera). Include riduzione luce blu, temperatura fresca (18-19°C), niente schermi.',
    category: CATEGORIES.SLEEP.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.STRESSED, TARGET_AUDIENCE.ELDERLY],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Orario inizio routine', 'Temperatura camera'],
    sources: [
      'Walker, M. (2017). Why We Sleep',
      'Sleep Foundation - Sleep Hygiene',
      'AASM/SRS Consensus, 2015'
    ],
    articleSlug: 'Sleep: Brain Cleansing, Longevity and Performance'
  },
  {
    id: 'sleep-003',
    title: 'Magnesio pre-sonno',
    description: '200-400mg di magnesio glicinato/treonato 1-2 ore prima di dormire. Favorisce rilassamento muscolare e qualità del sonno.',
    category: CATEGORIES.SLEEP.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ATHLETES],
    evidenceLevel: EVIDENCE_LEVEL.EMERGING,
    type: HABIT_TYPE.OPTIONAL,
    metrics: ['Dosaggio (mg)', 'Orario assunzione'],
    sources: [
      'Journal of Research in Medical Sciences (2012)',
      'Examine.com - Magnesium'
    ],
    articleSlug: 'Sleep: Brain Cleansing, Longevity and Performance'
  },

  // COLD
  {
    id: 'cold-001',
    title: 'Doccia fredda mattutina',
    description: '2-3 minuti di esposizione a acqua fredda (10-15°C) al mattino. Aumenta dopamina, noradrenalina e metabolismo.',
    category: CATEGORIES.COLD.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ATHLETES],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Durata (minuti)', 'Temperatura (°C)'],
    sources: [
      'Huberman Lab - Cold Exposure',
      'European Journal of Applied Physiology (2007)',
      'Janský et al., Eur J Appl Physiol, 1996'
    ],
    articleSlug: 'Cold Exposure: Evolution, Body Chemistry and Mental Resilience'
  },
  {
    id: 'cold-002',
    title: 'Ice bath post-allenamento',
    description: '10-15 minuti in acqua fredda (10-15°C) dopo allenamento intenso. Riduce infiammazione e migliora recupero.',
    category: CATEGORIES.COLD.id,
    targetAudience: [TARGET_AUDIENCE.ATHLETES],
    evidenceLevel: EVIDENCE_LEVEL.EMERGING,
    type: HABIT_TYPE.OPTIONAL,
    metrics: ['Durata (minuti)', 'Temperatura (°C)', 'Post quale allenamento'],
    sources: [
      'Sports Medicine (2016)',
      'Journal of Strength and Conditioning Research',
      'Kox et al., PNAS, 2014'
    ],
    articleSlug: 'Cold Exposure: Evolution, Body Chemistry and Mental Resilience'
  },

  // FOCUS
  {
    id: 'focus-001',
    title: 'Blocco focus 90 minuti',
    description: 'Sessione di lavoro profondo di 90 minuti senza distrazioni. Allineato ai ritmi ultradiani del cervello.',
    category: CATEGORIES.FOCUS.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.STUDENTS],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Numero blocchi completati', 'Ora inizio'],
    sources: [
      'Newport, C. - Deep Work',
      'Huberman Lab - Focus Toolkit'
    ],
    articleSlug: 'biohacking-basics'
  },
  {
    id: 'focus-002',
    title: 'Caffè strategico',
    description: '100-200mg caffeina 90-120 minuti dopo il risveglio. Evita crash di adenosina e mantiene energia stabile.',
    category: CATEGORIES.FOCUS.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.STUDENTS],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.OPTIONAL,
    metrics: ['Dosaggio (mg)', 'Orario'],
    sources: [
      'Huberman Lab - Caffeine Timing',
      'Journal of Clinical Sleep Medicine'
    ],
    articleSlug: 'perfect-breakfast'
  },

  // LONGEVITY
  {
    id: 'longevity-001',
    title: 'Digiuno intermittente 16:8',
    description: 'Finestra alimentare di 8 ore, digiuno di 16 ore. Attiva autofagia e mitofagia.',
    category: CATEGORIES.LONGEVITY.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ATHLETES],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Ora inizio digiuno', 'Ora fine digiuno'],
    sources: [
      'Cell Metabolism (2018)',
      'Sinclair, D. - Lifespan'
    ],
    articleSlug: 'biohacking-basics'
  },
  {
    id: 'longevity-002',
    title: 'Zone 2 cardio',
    description: '150-180 minuti/settimana di cardio a bassa intensità (Zone 2). Migliora funzione mitocondriale e longevità.',
    category: CATEGORIES.LONGEVITY.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ELDERLY],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Minuti totali settimana', 'Frequenza cardiaca media'],
    sources: [
      'Attia, P. - Outlive',
      'Journal of Applied Physiology',
      'Pedersen, Nat Rev Endocrinol, 2019'
    ],
    articleSlug: 'exercise-longevity'
  },

  // TRAINING
  {
    id: 'training-001',
    title: 'Resistance training 3x/settimana',
    description: 'Allenamento di forza progressivo 3 volte a settimana. Preserva massa muscolare e densità ossea.',
    category: CATEGORIES.TRAINING.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ATHLETES, TARGET_AUDIENCE.ELDERLY],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Sessioni/settimana', 'Carico totale (kg)'],
    sources: [
      'ACSM Guidelines',
      'Schoenfeld, B. - Science and Development of Muscle Hypertrophy',
      'Pedersen, Nat Rev Endocrinol, 2019'
    ],
    articleSlug: 'exercise-longevity'
  },

  // RESILIENCE
  {
    id: 'resilience-001',
    title: 'Respirazione controllata',
    description: '5-10 minuti di respirazione diaframmatica o box breathing. Attiva sistema parasimpatico e riduce stress.',
    category: CATEGORIES.RESILIENCE.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.STRESSED, TARGET_AUDIENCE.ATHLETES],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Minuti pratica', 'Tecnica usata'],
    sources: [
      'Huberman Lab - Breathwork',
      'Frontiers in Psychology (2018)',
      'Kox et al., PNAS, 2014'
    ],
    articleSlug: 'Cold Exposure: Evolution, Body Chemistry and Mental Resilience'
  },

  // PSYCHE
  {
    id: 'psyche-001',
    title: 'Meditazione quotidiana',
    description: '10-20 minuti di meditazione mindfulness al giorno. Riduce ansia e migliora focus.',
    category: CATEGORIES.PSYCHE.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.STRESSED, TARGET_AUDIENCE.STUDENTS],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.OPTIONAL,
    metrics: ['Minuti pratica', 'Orario'],
    sources: [
      'Journal of Cognitive Enhancement',
      'Headspace Research'
    ],
    articleSlug: 'biohacking-basics'
  },

  // ENERGY
  {
    id: 'energy-001',
    title: 'Colazione proteica',
    description: '30-40g proteine entro 90 minuti dal risveglio. Stabilizza glicemia e fornisce energia sostenibile.',
    category: CATEGORIES.ENERGY.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ATHLETES, TARGET_AUDIENCE.STUDENTS],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Grammi proteine', 'Orario'],
    sources: [
      'Huberman Lab - Nutrition',
      'American Journal of Clinical Nutrition',
      'O\'Neal et al., Nutrients, 2020',
      'Jakubowicz et al., Obesity, 2013'
    ],
    articleSlug: 'perfect-breakfast'
  },
  {
    id: 'energy-002',
    title: 'Limitare zuccheri aggiunti',
    description: 'Ridurre zuccheri aggiunti a <25g/giorno (donne) o <36g/giorno (uomini). Previene picchi glicemici e brain fog.',
    category: CATEGORIES.ENERGY.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.STRESSED, TARGET_AUDIENCE.STUDENTS],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['Grammi zuccheri giornalieri'],
    sources: [
      'AHA Guidelines',
      'WHO - Sugar intake'
    ],
    articleSlug: 'sugar-fat-effects'
  },

  // LONGEVITY - Aggiunte
  {
    id: 'longevity-003',
    title: 'Ridurre grassi saturi',
    description: 'Limitare grassi saturi a <10% delle calorie totali. Sostituire con grassi insaturi (olio EVO, pesce, noci).',
    category: CATEGORIES.LONGEVITY.id,
    targetAudience: [TARGET_AUDIENCE.HEALTHY_ADULTS, TARGET_AUDIENCE.ELDERLY],
    evidenceLevel: EVIDENCE_LEVEL.STRONG,
    type: HABIT_TYPE.CORE,
    metrics: ['% calorie da saturi', 'Fonte principale grassi'],
    sources: [
      'AHA Scientific Statement',
      'Mediterranean Diet studies'
    ],
    articleSlug: 'sugar-fat-effects'
  }
];

// Funzioni di filtro
export function getHabitsByCategory(categoryId) {
  return HABITS_DATABASE.filter(h => h.category === categoryId);
}

export function getHabitsByAudience(audience) {
  return HABITS_DATABASE.filter(h => h.targetAudience.includes(audience));
}

export function getHabitsByEvidence(level) {
  return HABITS_DATABASE.filter(h => h.evidenceLevel === level);
}

export function getHabitsByType(type) {
  return HABITS_DATABASE.filter(h => h.type === type);
}

export function filterHabits({ categories, audiences, evidenceLevels, types }) {
  let filtered = [...HABITS_DATABASE];

  if (categories && categories.length > 0) {
    filtered = filtered.filter(h => categories.includes(h.category));
  }

  if (audiences && audiences.length > 0) {
    filtered = filtered.filter(h => 
      h.targetAudience.some(a => audiences.includes(a))
    );
  }

  if (evidenceLevels && evidenceLevels.length > 0) {
    filtered = filtered.filter(h => evidenceLevels.includes(h.evidenceLevel));
  }

  if (types && types.length > 0) {
    filtered = filtered.filter(h => types.includes(h.type));
  }

  return filtered;
}

export function getHabitById(id) {
  return HABITS_DATABASE.find(h => h.id === id);
}
