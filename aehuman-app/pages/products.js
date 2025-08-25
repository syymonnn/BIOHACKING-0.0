import Layout from '../components/Layout';

export default function Products() {
  return (
    <Layout title="Products">
      <section className="glass" style={{marginTop:'1rem'}}>
        <h1>Products</h1>
        <p style={{color:'var(--muted)'}}>Marketplace in arrivo: super drink, supplementi e gear selezionati.</p>
        <p style={{opacity:.7}}>Iscriviti alla newsletter (prossimo step) per l’early access.</p>
      </section>
    </Layout>
  );
}
