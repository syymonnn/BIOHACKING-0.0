// pages/cart.js
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useCart, currency } from '../lib/useCart';
import { useMemo } from 'react';
import { useRouter } from 'next/router';


export default function CartPage() {
  const { items, setQty, remove, totalQty, subtotal } = useCart();
  const router = useRouter();

  const delivery = useMemo(() => subtotal >= 60 ? 0 : 4.90, [subtotal]);
  const tax = useMemo(() => +(subtotal * 0.1).toFixed(2), [subtotal]); // es. 10% fittizio
  const total = useMemo(() => subtotal + delivery + tax, [subtotal, delivery, tax]);

  return (
    <Layout title="Carrello">
      <Head><meta name="robots" content="noindex" /></Head>
      <main className="wrap">
        <h1>Carrello</h1>

        {items.length === 0 ? (
          <div className="empty">
            Il carrello è vuoto. <Link href="/products">Vai al Marketplace</Link>
          </div>
        ) : (
          <div className="grid">
            <section className="list">
              {items.map(item => (
                <article key={item.id} className="row">
                  <div className="title">
                    <strong>{item.title}</strong>
                    <div className="muted">ID: {item.id}</div>
                  </div>
                  <div className="qty">
                    <button onClick={() => setQty(item.id, item.qty - 1)} aria-label="Diminuisci">−</button>
                    <input
                      value={item.qty}
                      onChange={e => setQty(item.id, Number(e.target.value)||1)}
                      inputMode="numeric"
                      aria-label="Quantità"
                    />
                    <button onClick={() => setQty(item.id, item.qty + 1)} aria-label="Aumenta">+</button>
                  </div>
                  <div className="price">€ {currency(item.price * item.qty)}</div>
                  <button className="remove" onClick={() => remove(item.id)} aria-label="Rimuovi">✕</button>
                </article>
              ))}
            </section>

            <aside className="summary">
              <h2>Riepilogo</h2>
              <ul>
                <li><span>Articoli</span><strong>{totalQty}</strong></li>
                <li><span>Subtotale</span><strong>€ {currency(subtotal)}</strong></li>
                <li><span>Spedizione</span><strong>{delivery === 0 ? 'Gratis' : `€ ${currency(delivery)}`}</strong></li>
                <li><span>Imposte (stima)</span><strong>€ {currency(tax)}</strong></li>
              </ul>
              <div className="total"><span>Totale</span><strong>€ {currency(total)}</strong></div>

              <div className="actions">
                <button className="btnPrimary" onClick={() => router.push('/checkout')}>
                    Procedi al checkout
                </button>
                <button className="btnSecondary" onClick={() => router.push('/products')}>
                    Continua lo shopping
                </button>
              </div>

            </aside>
          </div>
        )}
      </main>

      <style jsx>{`
        .wrap{max-width:1000px;margin:0 auto;padding:24px 18px 60px}
        h1{margin:0 0 14px}
        .empty{opacity:.85}
        .grid{display:grid;grid-template-columns:2fr 1fr;gap:16px}
        .list{display:flex;flex-direction:column;gap:10px}
        .row{
          display:grid;grid-template-columns:1fr auto auto auto;gap:10px;align-items:center;
          border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:.8rem;
          background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
        }
        .title .muted{opacity:.65;font-size:.9rem}
        .qty{display:flex;gap:6px;align-items:center}
        .qty button{
          border:1px solid rgba(255,255,255,.12);background:transparent;border-radius:10px;padding:.25rem .45rem;
        }
        .qty input{
          width:48px;text-align:center;border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.03);border-radius:10px;padding:.35rem;
          color:inherit
        }
        .actions {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        }

        .btnPrimary {
        width: 100%;
        font-weight: 600;
        border-radius: 14px;
        padding: 0.7rem 1rem;
        background: linear-gradient(135deg, #00e1ff, #7a3eff);
        color: #fff;
        border: none;
        cursor: pointer;
        box-shadow: 0 0 15px rgba(0, 225, 255, 0.4);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btnPrimary:hover {
        transform: translateY(-2px);
        box-shadow: 0 0 25px rgba(0, 225, 255, 0.7);
        }

        .btnSecondary {
        width: 100%;
        font-weight: 500;
        border-radius: 14px;
        padding: 0.7rem 1rem;
        background: transparent;
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #fff;
        cursor: pointer;
        transition: background 0.15s ease, transform 0.15s ease;
        }
        .btnSecondary:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateY(-1px);
        }


        .price{font-weight:700}
        .remove{
          margin-left:auto;border:1px solid rgba(255,255,255,.12);background:transparent;border-radius:10px;padding:.3rem .5rem
        }
        .summary{
          border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:1rem;
          background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
          position:sticky;top:12px;height:fit-content;
        }
        .summary h2{margin:.1rem 0 .6rem;font-size:1.1rem}
        .summary ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:.35rem}
        .summary li{display:flex;justify-content:space-between;opacity:.95}
        .total{display:flex;justify-content:space-between;margin:.6rem 0 1rem;font-size:1.1rem;font-weight:700}
        .cta,.ghost{
          display:block;text-align:center;border-radius:12px;padding:.6rem .8rem;border:1px solid rgba(255,255,255,.12)
        }
        .cta{background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.03));margin-bottom:.5rem}
        .ghost{background:transparent}
        @media (max-width:900px){.grid{grid-template-columns:1fr}}
      `}</style>
    </Layout>
  );
}
