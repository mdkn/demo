// EmailTableHeader component with SCSS Modules
import styles from './EmailTableHeader.module.scss'

export default function EmailTableHeader() {
  return (
    <thead className={styles.tableHeader}>
      <tr className={styles.headerRow}>
        <th className={styles.headerCell}>Sender</th>
        <th className={styles.headerCell}>Subject</th>
        <th className={styles.headerCell}>Date</th>
        <th className={styles.headerCell}>Status</th>
      </tr>
    </thead>
  )
}
