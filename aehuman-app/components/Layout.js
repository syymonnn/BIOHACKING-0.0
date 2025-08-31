// components/Layout.js
import Head from 'next/head';
import Header from './Header';

export default function Layout({ children, title = 'Æ‑HUMAN' }) {
  const fullTitle = `${title} | Biohacking • Wellness • Longevity`;
  const description = 'Æ‑HUMAN — biohacking moderno con rigore scientifico. Academy, prodotti e super drink per energia e longevità.';

  return (
    <>
      <Head>
        {/* Titolo + SEO base */}
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index,follow" />

        {/* Viewport “giusto” su iOS con notch / Dynamic Island */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />


        {/* Colore UI browser */}
        <meta name="theme-color" content="#0b0b0f" />

        {/* PWA-capable: Android/Chrome */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* iOS standalone (ancora utile su Safari iOS) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Æ-HUMAN" />

        {/* Icons + manifest (evita 404 di /favicon.ico) */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <Header />

      {/* Safe-area padding + container responsive */}
      <main className="pageWrap">
        {children}
      </main>
    </>
  );
}
