// EmailTable component with SCSS Modules
import type { Email } from '../types/email'
import EmailTableHeader from './EmailTableHeader'
import EmailRow from './EmailRow'
import styles from './EmailTable.module.scss'

interface EmailTableProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (emailId: string) => void
  isPreviewOpen: boolean
}

const EmailTable = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  isPreviewOpen,
}: EmailTableProps) => {
  return (
    <div
      className={`${styles.tableContainer} ${!isPreviewOpen ? styles.fullWidth : ''}`}
    >
      <table className={styles.table}>
        <EmailTableHeader />
        <tbody>
          {emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              isSelected={selectedEmailId === email.id}
              onClick={() => onSelectEmail(email.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EmailTable