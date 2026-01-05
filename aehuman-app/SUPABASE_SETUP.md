# Configurazione Autenticazione Supabase

## Setup Rapido

### 1. Crea un progetto Supabase
1. Vai su [supabase.com](https://supabase.com)
2. Crea un nuovo progetto
3. Copia l'URL del progetto e la chiave Anon

### 2. Configura le variabili d'ambiente
Crea un file `.env.local` nella cartella `aehuman-app`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Configura Email Authentication in Supabase
1. Nel dashboard Supabase, vai su **Authentication > Providers**
2. Abilita **Email** provider
3. In **Authentication > URL Configuration**, imposta:
   - Site URL: `http://localhost:3000` (dev) o il tuo dominio (prod)
   - Redirect URLs: Aggiungi:
     - `http://localhost:3000/track/auth` (dev)
     - Il tuo dominio + `/track/auth` (prod)
   - Abilita **"Enable email confirmations"** se vuoi richiedere conferma email

### 4. Configura Email Templates (Opzionale)
1. Vai su **Authentication > Email Templates**
2. Personalizza il template "Magic Link" con il branding Æ-HUMAN

## Funzionalità

### Magic Link Authentication
- ✅ Nessuna password richiesta
- ✅ Link sicuro via email
- ✅ Sessione persistente
- ✅ Logout sicuro

### Fallback Mode
Se le variabili d'ambiente non sono configurate, il sistema usa un'autenticazione locale (localStorage) per sviluppo.

## Struttura Files

```
lib/
  ├── supabaseClient.js    # Client Supabase
  └── auth.js              # Funzioni di autenticazione

pages/track/
  ├── auth.js              # Pagina di login
  └── app.js               # Dashboard protetta
```

## Testing

### Modalità Dev (senza Supabase)
L'app funziona anche senza configurare Supabase, usando localStorage per l'autenticazione.

### Con Supabase
1. Inserisci la tua email
2. Controlla l'inbox
3. Clicca sul magic link
4. Verrai reindirizzato all'app

## Security Notes

- Le chiavi Anon sono sicure da usare nel frontend
- Supabase gestisce automaticamente la sicurezza delle sessioni
- I token JWT sono salvati in modo sicuro dal client Supabase
- Logout rimuove completamente la sessione

## Prossimi Passi

- [ ] Configurare Row Level Security (RLS) per i database
- [ ] Aggiungere tabelle per utenti e dati tracking
- [ ] Implementare OAuth (Google, GitHub, etc.)
- [ ] Email personalizzate con branding Æ-HUMAN
