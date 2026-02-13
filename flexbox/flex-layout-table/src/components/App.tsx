// App component with SCSS Modules
import { useState, useMemo } from 'react'
import type { Email } from '../types/email'
import Header from './Header'
import Footer from './Footer'
import EmailTable from './EmailTable'
import EmailPreview from './EmailPreview'
import styles from './App.module.scss'
// Import emails data
import emailsData from '../data/emails.json'

export default function App() {
  // T028: Load emails data
  const emails = emailsData as Email[]

  // T057: State for selected email
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)

  // T029: Calculate email statistics
  const stats = useMemo(() => {
    const total = emails.length
    const unread = emails.filter((email) => !email.isRead).length
    return { total, unread }
  }, [emails])

  // T073: Get selected email data for preview
  const selectedEmail = useMemo(
    () => emails.find((email) => email.id === selectedEmailId) || null,
    [emails, selectedEmailId]
  )

  return (
    <div className={styles.app}>
      <Header stats={stats} />

      <main className={styles.main}>
        <EmailTable
          emails={emails}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
          isPreviewOpen={!!selectedEmail}
        />

        {selectedEmail && <EmailPreview email={selectedEmail} />}
      </main>

      <Footer />
    </div>
  )
}
