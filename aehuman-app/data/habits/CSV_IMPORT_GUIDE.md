# Import CSV Abitudini

## Struttura CSV Richiesta

Il file CSV deve avere le seguenti colonne:

```csv
id,title,description,category,targetAudience,evidenceLevel,type,metrics,sources,articleSlug
```

### Campi:

- **id**: Identificativo unico (es: `sleep-001`, `cold-002`)
- **title**: Titolo dell'abitudine
- **description**: Descrizione dettagliata
- **category**: Una tra: `sleep`, `focus`, `cold`, `longevity`, `training`, `resilience`, `psyche`, `energy`
- **targetAudience**: Lista separata da `;` tra: `adulti-sani`, `sportivi`, `anziani`, `persone-stressate`, `studenti`
- **evidenceLevel**: `forte` o `emergente`
- **type**: `core` o `optional`
- **metrics**: Lista di metriche separate da `;` (es: `Minuti;Temperatura`)
- **sources**: Lista di fonti separate da `;`
- **articleSlug**: Slug dell'articolo correlato (opzionale, lasciare vuoto se non presente)

## Esempio CSV:

```csv
id,title,description,category,targetAudience,evidenceLevel,type,metrics,sources,articleSlug
sleep-001,"Esposizione alla luce solare mattutina","Esporsi alla luce naturale entro 30-60 minuti dal risveglio per 10-30 minuti.",sleep,"adulti-sani;sportivi;studenti",forte,core,"Minuti di esposizione;Orario","Huberman Lab - Sleep Toolkit;Walker, M. (2017). Why We Sleep",sleep-brain-cleansing
cold-001,"Doccia fredda mattutina","2-3 minuti di esposizione a acqua fredda (10-15°C) al mattino.",cold,"adulti-sani;sportivi",forte,core,"Durata (minuti);Temperatura (°C)","Huberman Lab - Cold Exposure;European Journal of Applied Physiology (2007)",cold-exposure-evolution
```

## Script di Conversione

Salva il tuo CSV in `/data/habits/habits.csv` e usa questo script:

```javascript
// scripts/import-habits-csv.js
const fs = require('fs');
const path = require('path');

// Leggi CSV
const csvPath = path.join(__dirname, '../data/habits/habits.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n');
const headers = lines[0].split(',').map(h => h.trim());

const habits = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;

  // Parse CSV line (gestisce virgole dentro le virgolette)
  const values = [];
  let currentValue = '';
  let insideQuotes = false;

  for (let char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());

  // Crea oggetto abitudine
  const habit = {
    id: values[0],
    title: values[1],
    description: values[2],
    category: values[3],
    targetAudience: values[4].split(';').map(a => a.trim()),
    evidenceLevel: values[5],
    type: values[6],
    metrics: values[7].split(';').map(m => m.trim()),
    sources: values[8].split(';').map(s => s.trim()),
    articleSlug: values[9] || null
  };

  habits.push(habit);
}

// Genera file database.js
const output = `// data/habits/database.js
// AUTO-GENERATED FROM CSV

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

export const HABITS_DATABASE = ${JSON.stringify(habits, null, 2)};

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
`;

// Scrivi file
const outputPath = path.join(__dirname, '../data/habits/database.js');
fs.writeFileSync(outputPath, output, 'utf-8');

console.log('✅ Database abitudini generato con successo!');
console.log(`📊 ${habits.length} abitudini importate`);
```

## Come Usare:

1. Salva il tuo CSV in `/data/habits/habits.csv`
2. Crea lo script in `/scripts/import-habits-csv.js`
3. Esegui: `node scripts/import-habits-csv.js`
4. Il database verrà automaticamente aggiornato!

## Note:

- Il database attuale contiene già esempi di abitudini funzionanti
- Puoi aggiungere nuove abitudini manualmente o via CSV
- Le categorie e i colori sono predefiniti nel sistema
