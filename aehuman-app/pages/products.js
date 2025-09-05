// pages/products.js
import Head from 'next/head';
import Layout from '../components/Layout';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useCart, currency } from '../lib/useCart';
import Link from 'next/link';



// ====== Æ Macrocategorie (emoji + colore) ======
const CATEGORIES = {
  sleep:       { label: 'Sleep',       color: '#7A3EFF' },
  cold:        { label: 'Cold',         color: '#20E3B2' },
  longevity:   { label: 'Longevity',   color: '#1DA1F2' },
  performance: { label: 'Performance', color: '#FFD400' },
  brain:       { label: 'Brain',        color: '#00E1FF' },
  resilience:  { label: 'Resilience',   color: '#FF7A00' },
};

// ====== Catalogo demo (id obbligatorio) ======
const PRODUCTS = [
  {
    id: 'P-SDRINK-001',
    sku: 'AE-SD-001',
    title: 'Æ Super Drink – Daily Focus',
    price: 29.00,
    category: 'performance',
    badges: ['no sugar', 'vegan', 'lab-graded'],
    image: '/images/products/P-SDRINK-001.jpg',
    excerpt: 'Energia pulita e chiara: elettroliti + L-teanina + B-complex.',
    description: `
Bevanda funzionale pensata per la prima ora dopo il risveglio.
• Elettroliti bilanciati (Na/K/Mg)
• L-teanina 200 mg (sinergia con caffeina)
• Complesso B (B1-B6-B12) per metabolismo energetico
• Zero zuccheri aggiunti, gusto citrus-ginger.
`,
    details: {
      ingredients: [
        'L-teanina (200 mg)',
        'Elettroliti: sodio, potassio, magnesio',
        'Vitamine B1, B6, B12',
        'Aroma naturale zenzero/agrumi',
      ],
      howto: '1 stick in 350-500 ml d’acqua, al mattino.',
    },
  },
  {
    id: 'P-MG-GLY-003',
    sku: 'AE-MG-003',
    title: 'Magnesio Glicinato – Sleep',
    price: 21.00,
    category: 'sleep',
    badges: ['chelated', 'gentle'],
    image: '/images/products/P-MG-GLY-003.jpg',
    excerpt: 'Forma chelata ad alta tollerabilità per rilassamento serale.',
    description: `
Supporto del sonno senza sedazione diurna.
• Magnesio glicinato 200 mg / porzione
• Zero eccipienti inutili
• Capsule vegetali
`,
    details: {
      ingredients: [
        'Magnesio (da glicinato), 200 mg',
        'Capsula vegetale, riso micro-pulverizzato',
      ],
      howto: '1–2 cps 30–60 min prima di dormire.',
    },
  },
  {
    id: 'P-ICE-TUB-002',
    sku: 'AE-COLD-002',
    title: 'Cold Tub – Foldable',
    price: 119.00,
    category: 'cold',
    badges: ['portable', 'insulated'],
    image: '/images/products/P-ICE-TUB-002.jpg',
    excerpt: 'Vasca pieghevole isolata per esposizione al freddo.',
    description: `
Allenamento allo stress “antico” con logistica moderna.
• Montaggio < 2 min, valvola di scarico
• Isolamento multistrato
• Cappuccio anti-detrito
`,
    details: {
      ingredients: ['PVC rinforzato, strati isolanti, valvola scarico'],
      howto: '3–8 minuti a 8–12°C, 2–4x/settimana (progressivo).',
    },
  },
  {
    id: 'P-OMEGA-005',
    sku: 'AE-LONG-005',
    title: 'Omega-3 Concentrate – Longevity',
    price: 34.00,
    category: 'longevity',
    badges: ['IFOS', 'triple-tested'],
    image: '/images/products/P-OMEGA-005.jpg',
    excerpt: 'EPA+DHA ad alta purezza per marcatori cardiometabolici.',
    description: `
Trigliceridi naturali, anti-retrogusto.
• 2 cps = 1000 mg EPA + 750 mg DHA
• Certificazione purezza metalli pesanti
`,
    details: {
      ingredients: ['Olio di pesce TG, tocoferoli, capsula gelatina'],
      howto: '2 cps con il pasto principale.',
    },
  },
  {
    id: 'P-NEUROKIT-001',
    sku: 'AE-BRAIN-001',
    title: 'Neuro Kit – Focus & Plasticity',
    price: 39.00,
    category: 'brain',
    badges: ['stack', 'nootropics-safe'],
    image: '',
    excerpt: 'Colina + bacopa titolata + B12 metilata per memoria/attenzione.',
    description: `
Protocollo conservativo, daily-safe.
• Citicolina 250 mg
• Bacopa 300 mg (55% bacosidi)
• B12 metilata 1000 µg / sett.
`,
    details: {
      ingredients: ['Citicolina, Bacopa monnieri 55%, Vit. B12'],
      howto: '1 cps mattina (citicolina), 1 cps sera (bacopa).',
    },
  },
  {
    id: 'P-HRDZ-RES-001',
    sku: 'AE-RES-001',
    title: 'Resilience Band – HRV Breath',
    price: 24.00,
    category: 'resilience',
    badges: ['gear', 'breathwork'],
    image: '/images/products/P-HRDZ-RES-001.jpg',
    excerpt: 'Fascia addominale per biofeedback respiratorio e HRV training.',
    description: `
Allenamento anti-stress a 6-bpm (resonance breathing).
• Feedback cinestetico per ritmo costante
• Tessuto elasticizzato, lavabile
`,
    details: {
      ingredients: ['Tessuto elastico, chiusura in velcro morbido'],
      howto: '5–10 minuti/die, 4–6 sec inspiro + 4–6 sec espiro.',
    },
  },
];



// ====== UI helpers ======
function Chip({ children }) {
  return (
    <span className="chip">
      {children}
      <style jsx>{`
        .chip {
          padding: .25rem .6rem; border-radius: 999px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          backdrop-filter: blur(6px); font-size: .75rem
        }
      `}</style>
    </span>
  );
}

// ====== Modal Prodotto ======
function Modal({ open, onClose, product, onAdd }) {
  const firstBtnRef = useRef(null);
  const [showImg, setShowImg] = useState(false);

  // chiusura ESC anche per la lightbox
  useEffect(() => {
    if (!showImg) return;
    const onKey = (e) => e.key === 'Escape' && setShowImg(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showImg]);


  // ESC + focus trap basica
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.activeElement;
    firstBtnRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open || !product) return null;
  const cat = CATEGORIES[product.category];

  return (
    <div className="overlay" onClick={onClose} aria-modal="true" role="dialog" aria-label={product.title}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <header className="headerGrid">
          <div className="metaLeft">
            <h3>{product.title}</h3>
            <p className="cat"><span className="dot" /> {cat.label}</p>
            <p className="sku"></p>
          </div>

          {product.image && (
            <div className="imgRight" aria-hidden style={{ backgroundImage: `url(${product.image})` }} />
          )}

          <button className="close" onClick={onClose} aria-label="Chiudi">✕</button>
        </header>



        <div className="body">
          <p className="desc">{product.description.trim()}</p>
          {product.details?.ingredients?.length ? (
            <div className="grid2">
              <div>
                <h4>Ingredienti / Materiali</h4>
                <ul>{product.details.ingredients.map((x, i) => <li key={i}>{x}</li>)}</ul>
              </div>
              <div>
                <h4>Come si usa</h4>
                <p>{product.details.howto}</p>
              </div>
            </div>
          ) : null}
        </div>

        <footer>
          <div className="price">€ {currency(product.price)}</div>
          <button
            ref={firstBtnRef}
            className="cta"
            onClick={() => onAdd(product)}
          >
            Aggiungi al carrello
          </button>
        </footer>
      </div>

      <style jsx>{`
        .headerGrid{
          display:grid;
          grid-template-columns: 1fr min(34vw, 360px);
          gap:16px;
          align-items:start;
          padding:18px 18px 0 18px;
          position:relative;
        }
        .metaLeft h3{ margin:.2rem 0 .25rem; font-weight:700 }
        .cat{ opacity:.9; display:flex; align-items:center; gap:.5rem }
        .sku{ opacity:.6; font-size:.85rem }

        .imgRight{
          height: min(46vh, 360px);
          border-radius:18px;
          overflow:hidden;
          border:2px solid;
          background-position:center;
          background-size:cover;
          background-repeat:no-repeat;
        }

        /* bottone chiudi resta in alto a destra */
        .close{
          position:absolute; right:18px; top:12px;
          border:1px solid rgba(255,255,255,.12); background:transparent;
          color:#fff; border-radius:12px; padding:.4rem .6rem; cursor:pointer; opacity:.8
        }
        .close:hover{ opacity:1; background:rgba(255,255,255,.06) }

        /* responsive: sotto i 820px l’immagine va sotto */
        @media (max-width:820px){
          .headerGrid{
            grid-template-columns: 1fr;
            gap:12px;
            padding:18px 18px 0 18px;
          }
          .imgRight{
            order:3;
            height: 42vh;
          }
        }

        .overlay {
          position: fixed; inset: 0; background: rgba(8,8,12,.55);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          animation: fadeIn .18s ease-out;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .sheet {
          width: min(880px,92vw); max-height: 86vh; overflow: auto; border-radius: 20px;
          background: linear-gradient(180deg, rgba(20,20,28,.9), rgba(10,10,14,.85));
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 10px 60px rgba(0,0,0,.45);
          transform: translateY(6px); animation: pop .18s ease-out forwards;
        }
        @keyframes pop { to{ transform: translateY(0) } }
        header { display:flex; gap:16px; align-items:center; padding:18px 18px 0 18px }
        .thumb{
          position:relative;
          width:84px;height:84px;border-radius:16px;flex:0 0 84px;
          overflow:hidden;
          background:
            radial-gradient(120px 60px at -10% 0, rgba(255,255,255,.08), transparent 60%),
            linear-gradient(135deg, var(--accent, #00E1FF) 0%, rgba(255,255,255,.06) 45%, rgba(255,255,255,.02) 100%);
          border:1px solid rgba(255,255,255,.08);
        }
        .thumb-img{
          position:absolute; inset:0; background-position:center; background-size:cover; background-repeat:no-repeat;
          filter: saturate(1.05); /* leggero boost */
        }

        .meta h3 { margin:.2rem 0 .25rem; font-weight:700 }
        .cat { opacity:.9; display:flex; align-items:center; gap:.5rem }
        .dot {
          width:8px; height:8px; border-radius:50%;
          background:${CATEGORIES[product.category]?.color || '#8cf'};
          box-shadow:0 0 14px ${CATEGORIES[product.category]?.color || '#8cf'};
          display:inline-block
        }
        .sku { opacity:.6; font-size:.85rem }
        .close {
          margin-left:auto; border:1px solid rgba(255,255,255,.12); background:transparent;
          color:#fff; border-radius:12px; padding:.4rem .6rem; cursor:pointer; opacity:.8
        }
        .close:hover { opacity:1; background:rgba(255,255,255,.06) }
        .body { padding:14px 18px 4px }
        .desc { white-space:pre-line; opacity:.95; line-height:1.5 }
        .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:12px }
        .grid2 h4 { margin:.25rem 0 .25rem }
        .grid2 ul { margin:.25rem 0; padding-left:1.1rem }
        footer {
          display:flex; align-items:center; justify-content:space-between; gap:16px;
          padding:14px 18px 18px; border-top:1px solid rgba(255,255,255,.06)
        }
        .price { font-size:1.1rem; font-weight:700; letter-spacing:.2px }
        .cta {
          padding:.7rem 1rem; border-radius:14px; border:1px solid rgba(255,255,255,.12);
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          cursor:pointer; transition: transform .15s ease, box-shadow .15s ease;
        }
        .cta:hover{ transform: translateY(-1px); box-shadow:0 6px 30px rgba(0,225,255,.25) }
        @media (max-width:800px){ .grid2{ grid-template-columns:1fr } }
      `}</style>
      <style jsx>{`
        :global(.sheet .thumb){ --accent: ${CATEGORIES[product.category]?.color || '#00E1FF'} }
      `}</style>
    </div>
  );
}

// ====== Card Prodotto ======
function Card({ p, onOpen }) {
  const cat = CATEGORIES[p.category];
  return (
    <button className="card" onClick={() => onOpen(p)} aria-label={`Apri ${p.title}`}>
      <div className="img" aria-hidden />
      <div className="head">
        <span className="cat"><i className="dot" /> {cat.emoji} {cat.label}</span>
        <strong className="price">€ {currency(p.price)}</strong>
      </div>
      <h3 className="title">{p.title}</h3>
      <p className="excerpt">{p.excerpt}</p>
      <div className="badges">{p.badges?.map((b, i) => <Chip key={i}>{b}</Chip>)}</div>

      <style jsx>{`
        .card {
          text-align:left; display:flex; flex-direction:column; gap:.55rem; padding:.9rem; border-radius:18px;
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border:1px solid rgba(255,255,255,.09); cursor:pointer;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
        }
        .card:hover { transform: translateY(-4px); box-shadow:0 14px 60px rgba(0,0,0,.35), 0 0 30px ${cat.color}33; border-color:${cat.color}66; }
        .img {
          height:150px; border-radius:14px; border:1px solid rgba(255,255,255,.08); margin-bottom:.4rem;
          background: ${p.image ? `url(${p.image}) center/cover` :
            `radial-gradient(120px 60px at -10% 0, rgba(255,255,255,.08), transparent 60%),
             linear-gradient(135deg, ${cat.color}, rgba(255,255,255,.06) 45%, rgba(255,255,255,.02) 100%)`};
          animation: pulse 2s ease-in-out infinite alternate;
        }
        @keyframes pulse{ from{ filter:saturate(1)} to{ filter:saturate(1.3)} }
        .head { display:flex; align-items:center; justify-content:space-between }
        .cat { opacity:.9; display:flex; align-items:center; gap:.4rem; font-size:.9rem }
        .dot { width:8px; height:8px; border-radius:50%; background:${cat.color}; box-shadow:0 0 14px ${cat.color}; display:inline-block }
        .price { font-size:1.05rem }
        .title { margin:.1rem 0 .05rem; font-size:1.05rem }
        .excerpt { opacity:.9; font-size:.95rem }
        .badges { display:flex; gap:.4rem; flex-wrap:wrap; margin-top:.15rem }
      `}</style>
    </button>
  );
}

// ====== Pagina ======
export default function ProductsPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('featured');
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState('');
  const { items, add, totalQty, subtotal, clear } = useCart();

  // Hydrate da query string + deep-link modal
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(location.search);
    const q = p.get('q') || '';
    const c = p.get('cat') || 'all';
    const s = p.get('sort') || 'featured';
    setQuery(q); setCat(c); setSort(s);

    const pid = p.get('p');
    if (pid) {
      const prod = PRODUCTS.find(x => x.id === pid);
      if (prod) setOpen(prod);
    }
  }, []);

  // Sync filtri in query string
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const u = new URL(location.href);
    u.searchParams.set('q', query);
    u.searchParams.set('cat', cat);
    u.searchParams.set('sort', sort);
    if (open?.id) u.searchParams.set('p', open.id); else u.searchParams.delete('p');
    history.replaceState(null, '', u);
  }, [query, cat, sort, open]);

  const products = useMemo(() => {
    let list = PRODUCTS.slice();
    if (cat !== 'all') list = list.filter(p => p.category === cat);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        (p.title?.toLowerCase().includes(q)) ||
        (p.excerpt?.toLowerCase().includes(q)) ||
        (p.description?.toLowerCase().includes(q)) ||
        (p.badges || []).some(b => b.toLowerCase().includes(q))
      );
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'az') list.sort((a, b) => a.title.localeCompare(b.title));
    // featured = ordine originale
    return list;
  }, [query, cat, sort]);

  const openProduct = useCallback((p) => setOpen(p), []);
  const closeProduct = useCallback(() => setOpen(null), []);

  const addToCart = useCallback((p) => {
    add(p);
    setToast('Aggiunto al carrello ✓');
    setTimeout(() => setToast(''), 1400);
  }, [add]);

  // SEO schema.org
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const productsSchema = PRODUCTS.map(p => ({
      '@type': 'Product',
      name: p.title,
      sku: p.sku,
      productID: p.id,
      category: CATEGORIES[p.category]?.label,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'EUR',
        price: p.price.toFixed(2),
        availability: 'https://schema.org/InStock'
      }
    }));
    const ld = { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: productsSchema };
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.text = JSON.stringify(ld);
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // conteggio per filtri
  const countByCat = useMemo(() => {
    const m = {};
    for (const key of Object.keys(CATEGORIES)) m[key] = 0;
    for (const p of PRODUCTS) m[p.category] = (m[p.category] || 0) + 1;
    return m;
  }, []);

  return (
    <Layout title="Marketplace">
      <Head><meta name="robots" content="index,follow" /></Head>

      <main className="wrap">
        <section className="hero">
          <h1>Marketplace Æ</h1>
          <p className="lead">
            Prodotti, integratori e gear selezionati per <strong>longevità</strong> e <strong>performance</strong>.
            Ogni scelta è supportata da scienza, design e semplicità d’uso.
          </p>
        </section>

        {/* TOOLBAR */}
        <section className="toolbar" aria-label="Filtri prodotti">
          <div className="filters">
            <button className={`pill ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>
              Tutte <span className="count">{PRODUCTS.length}</span>
            </button>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <button key={k} className={`pill ${cat === k ? 'on' : ''}`} onClick={() => setCat(k)}>
                <span className="dot" style={{ background: v.color, boxShadow: `0 0 10px ${v.color}` }} />
                {v.emoji} {v.label} <span className="count">{countByCat[k] || 0}</span>
              </button>
            ))}
          </div>
          <div className="rhs">
            <input
              className="search"
              placeholder="Cerca (es. magnesio, omega, cold...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Cerca prodotti"
            />
            <select className="sort" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordina">
              <option value="featured">In evidenza</option>
              <option value="az">A → Z</option>
              <option value="price-asc">Prezzo: basso ↗︎</option>
              <option value="price-desc">Prezzo: alto ↘︎</option>
            </select>
          </div>
        </section>

        {/* GRID */}
        <section className="grid">
          {products.map(p => (
            <Card key={p.id} p={p} onOpen={openProduct} />
          ))}
          {!products.length && (
            <div className="empty">Nessun prodotto trovato. Prova a cambiare filtro o ricerca.</div>
          )}
        </section>

        {/* FLOATING CART */}
        <Link
          href="/cart"
          className={`cartfab ${totalQty ? 'hasItems' : ''}`}
          aria-label="Apri carrello"
          title={`Carrello: ${totalQty} • € ${currency(subtotal)}`}
        >
          <span className="cartInner">
            <span className="cartIcon" aria-hidden>🛒</span>
            {totalQty > 0 && <span className="cartBadge">{totalQty}</span>}
          </span>
          <span className="cartSubtotal">€ {currency(subtotal)}</span>
        </Link>


        {toast && <div className="toast">{toast}</div>}
      </main>

      <Modal open={!!open} onClose={closeProduct} product={open} onAdd={addToCart} />

      <style jsx>{`
        .wrap { padding:24px 18px 60px; max-width:1100px; margin:0 auto }
        .hero h1 { font-size:2rem; margin:0 0 .25rem }
        .lead { opacity:.9; max-width:820px }
        .toolbar {
          display:flex; align-items:center; justify-content:space-between; gap:16px;
          margin:20px 0 12px; flex-wrap:wrap
        }
        .filters { display:flex; gap:.5rem; flex-wrap:wrap }
        .pill {
          border:1px solid rgba(255,255,255,.12);
          background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02));
          border-radius:999px; padding:.45rem .7rem; cursor:pointer; opacity:.9; display:flex; gap:.45rem; align-items:center;
        }
        .pill.on { border-color:rgba(255,255,255,.38); box-shadow: inset 0 0 0 1px rgba(255,255,255,.06) }
        .dot { width:10px; height:10px; border-radius:50%; display:inline-block }
        .count { font-size:.8rem; opacity:.8; padding:.05rem .4rem; border:1px solid rgba(255,255,255,.12); border-radius:999px }
        .rhs { display:flex; gap:.5rem; align-items:center }
        .search, .sort {
          border:1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.03);
          color:inherit; border-radius:12px; padding:.55rem .7rem; outline:none;
        }
        .search { min-width:260px }
        .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:8px }
        .empty { opacity:.7; padding:30px 12px }

         .cartfab{
          position: absolute;
          right: 0px; bottom: 18px;
          display: inline-flex; align-items: center; gap: .6rem;
          text-decoration: none; color: inherit;

          border-radius: 16px;
          padding: .55rem .7rem;
          border: 1px solid rgba(255,255,255,.12);
          background:
            radial-gradient(120px 60px at -10% 0, rgba(255,255,255,.08), transparent 60%),
            linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.03));

          backdrop-filter: blur(8px) saturate(120%);
          box-shadow:
            0 10px 30px rgba(0,0,0,.40),
            0 0 0 1px rgba(255,255,255,.06) inset;

          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
          z-index: 60;
          }
          .cartfab:hover{
            transform: translateY(-2px);
            box-shadow:
              0 18px 50px rgba(0,0,0,.45),
              0 0 22px rgba(0,225,255,.22);
            border-color: rgba(255,255,255,.22);
          }

          .cartInner{
            position: relative;
            display: inline-flex; align-items:center; justify-content:center;
            width: 40px; height: 40px; border-radius: 12px;
            border: 1px solid rgba(255,255,255,.12);
            background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.02));
            box-shadow: inset 0 0 0 1px rgba(255,255,255,.05);
          }

          .cartIcon{ font-size: 1.05rem; line-height: 1; }

          .cartBadge{
            position: absolute; top: -6px; right: -6px;
            min-width: 20px; height: 20px; padding: 0 .35rem;
            display: inline-flex; align-items:center; justify-content:center;
            font-size: .8rem; font-weight: 700;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,.18);
            background: #00E1FF;
            color: #001014;
            box-shadow: 0 0 14px #00E1FF99;
            animation: popIn .2s ease-out;
          }

          .cartSubtotal{
            overflow: hidden;
            max-width: 0;
            opacity: 0;
            white-space: nowrap;
            border: 1px solid rgba(255,255,255,.12);
            background: rgba(255,255,255,.05);
            padding: .4rem .55rem;
            border-radius: 10px;
            transition: max-width .25s ease, opacity .18s ease;
          }
          .cartfab:hover .cartSubtotal{
            max-width: 160px; /* mostra il subtotale all'hover */
            opacity: 1;
          }

          /* glow leggero quando ci sono articoli */
          .cartfab.hasItems{
            box-shadow:
              0 10px 30px rgba(0,0,0,.40),
              0 0 22px rgba(0,225,255,.18);
          }

        @keyframes popIn { from{ transform: scale(.8); opacity: .2 } to{ transform: scale(1); opacity: 1 } }

        /* responsivo: su schermi piccoli mantieni compatto */
        @media (max-width: 520px){
          .cartSubtotal{ display: none; }
        }
        @keyframes toast { from{ transform:translate(-50%, 6px); opacity:0 } to{ transform:translate(-50%, 0); opacity:1 } }
        @keyframes fade { to{ opacity:0 } }

        @media (max-width:980px) { .grid { grid-template-columns:repeat(2,1fr) } }
        @media (max-width:640px) { .grid { grid-template-columns:1fr } .search{ min-width:0; width:100% } }
      `}</style>
    </Layout>
  );
}
