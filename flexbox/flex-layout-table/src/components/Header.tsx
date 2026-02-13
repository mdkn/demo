// Header component with SCSS Modules
import type { EmailStats } from '../types/email'
import styles from './Header.module.scss'

interface HeaderProps {
  stats: EmailStats
}

export default function Header({ stats }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>Email Viewer Demo</h1>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.label}>Total:</span>
            <span className={`${styles.badge} ${styles.total}`}>
              {stats.total}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.label}>Unread:</span>
            <span className={`${styles.badge} ${styles.unread}`}>
              {stats.unread}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
