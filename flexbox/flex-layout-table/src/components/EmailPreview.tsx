// EmailPreview component with SCSS Modules
import type { Email } from '../types/email'
import styles from './EmailPreview.module.scss'

interface EmailPreviewProps {
  email: Email
}

export default function EmailPreview({ email }: EmailPreviewProps) {
  return (
    <div className={styles.previewContainer}>
      <h2 className={styles.senderName}>{email.senderName}</h2>
      <p className={styles.senderEmail}>{email.senderEmail}</p>

      <h3 className={styles.subject}>{email.subject}</h3>

      <p className={styles.date}>
        {new Date(email.date).toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })}
      </p>

      <div className={styles.badgeContainer}>
        <span
          className={`${styles.badge} ${email.isRead ? styles.read : styles.unread}`}
        >
          {email.isRead ? '✓ Read' : '● Unread'}
        </span>
      </div>

      <hr className={styles.divider} />

      <div className={styles.previewText}>{email.previewText}</div>
    </div>
  )
}
