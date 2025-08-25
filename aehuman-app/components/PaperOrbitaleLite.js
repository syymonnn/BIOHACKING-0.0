// components/PaperOrbitaleLite.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PARTICLES = 36;

function ParticleField() {
  const wrap = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  };
  return (
    <div aria-hidden style={wrap}>
      {Array.from({ length: PARTICLES }).map((_, i) => {
        const size = 2 + (i % 5);
        const radius = 60 + ((i * 7) % 220);
        const duration = 16 + ((i % 8) * 3);
        return (
          <div key={i} style={{ position: 'absolute', left: '50%', top: '50%' }}>
            <div
              style={{
                transformOrigin: 'left',
                animation: `spin ${duration}s linear infinite`,
                transform: `rotate(${i * (360 / PARTICLES)}deg)`,
              }}
            >
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.7)',
                  boxShadow: '0 0 12px 2px rgba(120,255,220,0.6)',
                  transform: `translateX(${radius}px)`,
                }}
              />
            </div>
            {/* keyframes una sola volta va bene; qui resta locale al componente */}
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        );
      })}
    </div>
  );
}

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

export default function PaperOrbitaleLite() {
  const [mounted, setMounted] = useState(false);

  // 🔧 NEW: breakpoint reattivo e SSR-safe
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => setIsDesktop(e.matches);
    setIsDesktop(mql.matches);
    // Safari/Chromium
    mql.addEventListener ? mql.addEventListener('change', onChange) : mql.addListener(onChange);
    return () => {
      mql.removeEventListener ? mql.removeEventListener('change', onChange) : mql.removeListener(onChange);
    };
  }, []);

  const [hoverIdx, setHoverIdx] = useState(null);

  // layout
  const section = { marginTop: '4rem' };
  const container = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px',
    color: '#fff',
    // safe-areas
    paddingLeft: 'max(24px, env(safe-area-inset-left))',
    paddingRight: 'max(24px, env(safe-area-inset-right))',
  };

  // Header
  const header = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
    flexWrap: isDesktop ? 'nowrap' : 'wrap', // 👈 su mobile va a capo
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
    overflowX: isDesktop ? 'visible' : 'auto', // 👈 se non ci stanno, scroll orizzontale
    WebkitOverflowScrolling: 'touch',
  };

  // Grid responsiva
  const grid = {
    display: 'grid',
    gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', // 👈 stack su mobile
    gap: isDesktop ? 20 : 16,
    alignItems: 'stretch',
  };

  // card
  const card = {
    position: 'relative',
    borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.08)',
    padding: 20,
    backdropFilter: 'blur(14px)',
    boxShadow: '0 16px 110px rgba(6,182,212,0.12)',
    overflow: 'hidden',
    minWidth: 0, // 👈 evita overflow su mobile
  };

  const glow = {
    position: 'absolute',
    inset: -1,
    borderRadius: 14,
    pointerEvents: 'none',
    background: mounted
      ? 'radial-gradient(140px 120px at 50% 50%, rgba(16,185,129,0.16), transparent 60%)'
      : 'transparent',
  };

  const meta = { marginBottom: 8, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontSize: 10.5, letterSpacing: 1.6 };
  const docTitle = { marginBottom: 4, fontSize: 17, fontWeight: 600 };
  const docSub = { fontSize: 11.5, color: 'rgba(255,255,255,0.6)' };
  const hr = { border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '14px 0' };
  const liTitle = { fontSize: 13.5, fontWeight: 600, marginBottom: 3 };
  const liText = { fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 };

  const noteBase = { marginTop: 4, fontSize: 12.5, color: 'rgba(16,185,129,0.9)' };

  const copyWrap = { display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 };
  const copyTitle = { fontSize: 19, fontWeight: 600 };
  const copyText = { color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontSize: 14.5 };
  const callout = {
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    padding: 14,
    backdropFilter: 'blur(6px)',
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.6,
    fontSize: 13.5,
  };
  const small = { display: 'flex', gap: 8, flexWrap: 'wrap', color: 'rgba(255,255,255,0.6)', fontSize: 12 };

  return (
    <section style={section}>
      <div style={container}>
        {/* Header */}
        <div style={header}>
          <div style={{ minWidth: 0 }}>
            <h2 style={title}>
              Ogni parola, <span style={{ color: 'rgb(16,185,129)' }}>verificata</span>.
            </h2>
            <p style={subtitle}>
              Fiducia costruita sulla scienza: PubMed, riviste peer‑reviewed, linee guida cliniche e pareri specialistici.
            </p>
          </div>
          <div style={badges}>
            <Badge label="Evidence‑Based" />
            <Badge label="Peer‑Reviewed" />
            <Badge label="Clinically Aligned" />
          </div>
        </div>

        {/* Grid */}
        <motion.div>
          <motion.div style={grid}>
            {/* Card “paper” */}
            <div>
              <motion.div
                style={card}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5 }}
              >
                <ParticleField />
                <div style={glow} />

                <div>
                  <div style={meta}>Fonte primaria</div>
                  <div style={docTitle}>Database PubMed & Journal Clubs</div>
                  <div style={docSub}>DOI: 10.XXXX/ae-human-methodology • Clinical Guidelines</div>
                </div>

                <hr style={hr} />

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
                  {[
                    {
                      t: 'Selezione delle fonti',
                      d: 'Usiamo solo studi affidabili: revisioni, ricerche cliniche e meta‑analisi pubblicate su banche dati riconosciute.',
                      n: 'Nota: priorità a studi peer‑reviewed e aggiornati.',
                    },
                    {
                      t: 'Controllo medico‑scientifico',
                      d: 'Ogni informazione viene rivista da professionisti per garantirne la correttezza rispetto alle linee guida attuali.',
                      n: 'Nota: revisione da parte di specialisti clinici.',
                    },
                    {
                      t: 'Traduzione chiara',
                      d: 'Dalla ricerca al quotidiano: rendiamo semplici e comprensibili i dati scientifici, così chiunque può usarli nella vita di tutti i giorni.',
                      n: 'Nota: linguaggio chiaro, senza termini tecnici complessi.',
                    },
                  ].map((item, idx) => (
                    <li
                      key={idx}
                      onMouseEnter={() => setHoverIdx(idx)}
                      onMouseLeave={() => setHoverIdx(null)}
                      style={{ cursor: 'default' }}
                    >
                      <div style={liTitle}>{item.t}</div>
                      <p style={liText}>{item.d}</p>

                      <motion.div
                        initial={false}
                        animate={hoverIdx === idx ? { opacity: 1, y: 0, height: 'auto' } : { opacity: 0, y: -6, height: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={noteBase}>{item.n}</div>
                      </motion.div>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Badge label="PubMed" />
                  <Badge label="Linee Guida" />
                  <Badge label="Comitato Clinico" />
                </div>
              </motion.div>
            </div>

            {/* Copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5 }}
                style={copyWrap}
              >
                <h3 style={copyTitle}>La nostra promessa scientifica</h3>
                <p style={copyText}>
                  Ogni contenuto Æ‑HUMAN è basato su fonti verificabili. Non condividiamo opinioni, ma dati dimostrati.
                  Il nostro compito è selezionare e tradurre la ricerca in abitudini concrete, utili e sicure.
                </p>
                <div style={callout}>
                  Trasparenza totale: ogni articolo riporta le fonti, il livello di affidabilità e la data dell’ultima
                  revisione. La fiducia nasce dal metodo.
                </div>
                <div style={small}>
                  <span>Fonti PubMed</span>
                  <span>•</span>
                  <span>Linee guida cliniche</span>
                  <span>•</span>
                  <span>Validazione medica</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
