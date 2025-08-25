import Link from 'next/link';
import styles from '../styles/Header.module.css';

export default function Header() {
  return (
    <header className={`navbar ${styles.header}`}>
      <div className={styles.logo}>
        <Link href="/"><span>Æ‑HUMAN</span></Link>
      </div>
      <nav className={styles.navLinks}>
        <Link href="/products">HUMAE</Link>
        <Link href="/products">PRODUCTS</Link>
        <Link href="/academy">ACADEMY</Link>
      </nav>
    </header>
  );
}
