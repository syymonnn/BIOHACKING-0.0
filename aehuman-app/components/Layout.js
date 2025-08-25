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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Colore UI browser */}
        <meta name="theme-color" content="#0b0b0f" />

        {/* iOS status bar scura e immersive */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <Header />

      {/* Safe-area padding + container responsive */}
      <main className="pageWrap">
        {children}
      </main>
    </>
  );
}
