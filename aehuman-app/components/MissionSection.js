// components/MissionSection.js

/* Pills identiche a PaperOrbitaleLite (copiate 1:1) */
function Badge({ label }) {
  const s = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.06)',
    padding: '5px 11px',
    fontSize: 11.5,
    letterSpacing: 0.3,
    color: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(6px)',
    whiteSpace: 'nowrap',
  };
  const dot = {
    width: 6,
    height: 6,
    borderRadius: 999,
    background: 'rgba(16,185,129,0.9)',
    boxShadow: '0 0 8px 2px rgba(52,211,153,0.7)',
  };
  return (
    <span style={s}>
      <span style={dot} />
      {label}
    </span>
  );
}

/* Bullet neon “diamond” (coerente col mood Æ) */
function NeonBullet({ size = 14 }) {
  const c = 'rgba(16,185,129,0.95)';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.6))', flex: '0 0 auto', translate: '0 .12rem' }}
      aria-hidden="true"
    >
      <path d="M12 2L22 12L12 22L2 12Z" fill={c} />
      <circle cx="12" cy="12" r="3" fill="rgba(163,255,18,0.6)" />
    </svg>
  );
}

export default function MissionSection() {
  // Stessa larghezza e padding della sezione PaperOrbitaleLite
  const container = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    color: '#fff',
    paddingLeft: 'max(24px, env(safe-area-inset-left))',
    paddingRight: 'max(24px, env(safe-area-inset-right))',
  };
  const header = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
    flexWrap: 'wrap',
  };
  const title = { fontSize: '1.85rem', fontWeight: 600, letterSpacing: 0.2, lineHeight: 1.15 };
  const subtitle = {
    marginTop: 6,
    maxWidth: 700,
    fontSize: 13.5,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.75)',
  };
  const badges = {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  };
  const card = {
    position: 'relative',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    padding: 20,
    backdropFilter: 'blur(14px)',
    boxShadow: '0 16px 110px rgba(6,182,212,0.12)',
    overflow: 'hidden',
    minWidth: 0,
  };

  return (
    <section style={{ marginTop: '4rem' }}>
      <div style={container}>
        {/* Titolo FUORI dalla card + Mission in verde */}
        <div style={header}>
          <div style={{ minWidth: 0 }}>
            <h2 style={title}>
              La nostra <span style={{ color: 'rgb(16,185,129)' }}>Mission</span>
            </h2>
            <p style={subtitle}>
              Trasformiamo scienza in abitudini quotidiane: chiarezza, rigore e design al servizio della tua energia e longevità.
            </p>
          </div>
          {/* Pill identiche a PaperOrbitaleLite */}
          <div style={badges}>
            <Badge label="Evidence-Based" />
            <Badge label="Peer-Reviewed" />
            <Badge label="Clinically Aligned" />
          </div>
        </div>

        {/* Card */}
        <div style={card}>
          <p style={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, fontSize: 14.5, marginTop: 0 }}>
            Æ-HUMAN unisce scienza d’avanguardia e benessere olistico per offrirti
            prodotti e risorse educative trasparenti, efficaci e basate sull’evidenza.
            Lavoriamo su dimensioni fisiche, mentali ed emotive per promuovere autocura
            consapevole e decisioni informate attraverso biohack supportati dai dati.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 10 }}>
            {[
              'Formule e contenuti fondati su studi peer-reviewed e meta-analisi.',
              'Dosaggi, sicurezza e controindicazioni valutati con metodo.',
              'Design semplice → abitudini sostenibili nel quotidiano.',
              'Trasparenza su ingredienti, fonti e limiti: niente fumo, solo dati.',
            ].map((text, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'start', gap: 10 }}>
                <NeonBullet />
                <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65 }}>{text}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Badge label="PubMed" />
            <Badge label="Linee Guida" />
            <Badge label="Comitato Clinico" />
          </div>
        </div>
      </div>
    </section>
  );
}
