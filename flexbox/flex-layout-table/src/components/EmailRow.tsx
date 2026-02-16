// EmailRow component with SCSS Modules
import type { Email } from '../types/email'
import { formatDate } from '../utils/formatDate'
import styles from './EmailRow.module.scss'

interface EmailRowProps {
  email: Email
  isSelected: boolean
  onClick: () => void
}

const EmailRow = ({ email, isSelected, onClick }: EmailRowProps) => {
  const rowClasses = `
    ${styles.row}
    ${isSelected ? styles.selected : ''}
    ${!email.isRead ? styles.unread : ''}
  `.trim()

  return (
    <tr onClick={onClick} className={rowClasses}>
      <td className={styles.senderCell}>
        <div className={styles.senderName}>{email.senderName}</div>
        <div className={styles.senderEmail}>{email.senderEmail}</div>
      </td>

      <td className={styles.subjectCell}>
        <div className={styles.subjectText}>{email.subject}</div>
      </td>

      <td className={styles.dateCell}>{formatDate(email.date)}</td>

      <td className={styles.statusCell}>
        <span className={email.isRead ? styles.badgeRead : styles.badgeUnread}>
          {email.isRead ? 'Read' : 'Unread'}
        </span>
      </td>
    </tr>
  )
}

export default EmailRow