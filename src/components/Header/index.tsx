import { useRouter } from 'next/router';
import Link from 'next/link';

import styles from './header.module.scss';

export default function Header() {
  const router = useRouter();

  return (
    <header className={styles.container}>
      <Link href="/">
        <img src="/images/logo.svg" alt="logo" />
      </Link>
    </header>
  );
}
