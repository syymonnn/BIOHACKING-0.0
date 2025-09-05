// pages/checkout.js
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useCart, currency } from '../lib/useCart';
import { useMemo, useState } from 'react';

export default function CheckoutPage() {
  const { items, totalQty, subtotal, clear } = useCart();
  const delivery = useMemo(() => subtotal >= 60 ? 0 : 4.90, [subtotal]);
  const tax = useMemo(() => +(subtotal * 0.1).toFixed(2), [subtotal]);
  const total = useMemo(() => subtotal + delivery + tax, [subtotal, delivery, tax]);

  const [form, setForm] = useState({
    name: '', email: '', address: '', city: '', zip: '', country: 'IT'
  });
  const [placed, setPlaced] = useState(false);

  const disabled = !form.name || !form.email || !form.address || !form.city || !form.zip || items.length === 0;

  function placeOrder(e){
    e.preventDefault();
    if(disabled) return;
    // TODO: integra Stripe qui. Per ora: simuliamo.
    setPlaced(true);
    clear();
  }

  if (placed) {
    return (
      <Layout title="Ordine completato">
        <main className="wrap center">
          <h1>Grazie! ✨</h1>
          <p>Il tuo ordine è stato registrato. Riceverai una conferma via email.</p>
          <Link className="cta" href="/products">Torna al Marketplace</Link>
        </main>
        <style jsx>{`.wrap{max-width:760px;margin:0 auto;padding:40px 18px 80px}.center{text-align:center}.cta{display:inline-block;margin-top:14px;border:1px solid rgba(255,255,255,.12);padding:.6rem .8rem;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.03))}`}</style>
      </Layout>
    );
  }

  return (
    <Layout title="Checkout">
      <Head><meta name="robots" content="noindex" /></Head>
      <main className="wrap">
        <h1>Checkout</h1>
        {items.length === 0 ? (
          <div className="empty">Carrello vuoto. <Link href="/products">Torna ai prodotti</Link></div>
        ) : (
          <div className="grid">
            <form className="form" onSubmit={placeOrder}>
              <h2>Dati spedizione</h2>
              <div className="row2">
                <label>Nome e Cognome<input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required /></label>
                <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required /></label>
              </div>
              <label>Indirizzo<input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} required /></label>
              <div className="row3">
                <label>Città<input value={form.city} onChange={e=>setForm({...form, city:e.target.value})} required /></label>
                <label>CAP<input value={form.zip} onChange={e=>setForm({...form, zip:e.target.value})} required /></label>
                <label>Paese<select value={form.country} onChange={e=>setForm({...form, country:e.target.value})}><option value="IT">Italia</option><option value="EU">UE</option></select></label>
              </div>

              <h2>Pagamento</h2>
              <p className="muted">Demo: nessun pagamento reale. (Stripe in step successivo)</p>

              <button className="cta" disabled={disabled}>Completa ordine</button>
              <Link className="ghost" href="/cart">Torna al carrello</Link>
            </form>

            <aside className="summary">
              <h2>Riepilogo</h2>
              <ul className="items">
                {items.map(i=>(
                  <li key={i.id}><span>{i.title} × {i.qty}</span><strong>€ {currency(i.price*i.qty)}</strong></li>
                ))}
              </ul>
              <ul className="totals">
                <li><span>Subtotale</span><strong>€ {currency(subtotal)}</strong></li>
                <li><span>Spedizione</span><strong>{delivery===0?'Gratis':`€ ${currency(delivery)}`}</strong></li>
                <li><span>Imposte (stima)</span><strong>€ {currency(tax)}</strong></li>
              </ul>
              <div className="total"><span>Totale</span><strong>€ {currency(total)}</strong></div>
            </aside>
          </div>
        )}
      </main>

      <style jsx>{`
        .wrap{max-width:1000px;margin:0 auto;padding:24px 18px 60px}
        h1{margin:0 0 14px}
        .grid{display:grid;grid-template-columns:2fr 1fr;gap:16px}
        .form{
          border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:1rem;
          background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
        }
        .form h2{margin:.25rem 0 .6rem;font-size:1.1rem}
        label{display:flex;flex-direction:column;gap:.35rem;margin-bottom:.6rem}
        input,select{
          border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);
          color:inherit;border-radius:12px;padding:.6rem .7rem;outline:none
        }
        .row2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}
        .muted{opacity:.7;margin:.2rem 0 .8rem}
        .cta,.ghost{display:block;text-align:center;border-radius:12px;padding:.6rem .8rem;border:1px solid rgba(255,255,255,.12)}
        .cta{background:linear-gradient(180deg,rgba(255,255,255,.1),rgba(255,255,255,.03));margin-bottom:.5rem}
        .ghost{background:transparent}
        .summary{
          border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:1rem;height:fit-content;
          background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));
          position:sticky;top:12px
        }
        .items,.totals{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.35rem}
        .items li,.totals li{display:flex;justify-content:space-between}
        .total{display:flex;justify-content:space-between;margin-top:.7rem;font-size:1.1rem;font-weight:700}
        @media (max-width:900px){.grid{grid-template-columns:1fr}}
      `}</style>
    </Layout>
  );
}
