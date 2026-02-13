// T027-T033: Main App component with vertical flexbox layout
import { useState, useMemo } from 'react'
import type { Email } from '../types/email'
import Header from './Header'
import Footer from './Footer'
import EmailTable from './EmailTable'
import EmailPreview from './EmailPreview'
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
    // T030: Main layout structure - vertical flexbox with h-screen
    <div className="flex h-screen flex-col">
      {/* T031: Header with email stats */}
      <Header stats={stats} />

      {/* T032: Main content area - flex-1 with overflow-hidden */}
      {/* T070: Update to support horizontal flexbox */}
      <main className="flex flex-1 overflow-hidden">
        {/* T058-T059: EmailTable on the LEFT with conditional width */}
        <EmailTable
          emails={emails}
          selectedEmailId={selectedEmailId}
          onSelectEmail={setSelectedEmailId}
          className={selectedEmail ? 'flex-1' : 'w-full'}
        />

        {/* T071: Conditional rendering for EmailPreview on the RIGHT */}
        {/* T072: 50/50 split layout using flex-1 on both containers */}
        {selectedEmail && (
          <EmailPreview email={selectedEmail} className="flex-1" />
        )}
      </main>

      {/* T033: Footer */}
      <Footer />
    </div>
  )
}
