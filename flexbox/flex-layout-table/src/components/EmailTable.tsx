// T049-T056: Email table component
import type { Email } from '../types/email'
import EmailTableHeader from './EmailTableHeader'
import EmailRow from './EmailRow'

interface EmailTableProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (emailId: string) => void
  className?: string
}

export default function EmailTable({
  emails,
  selectedEmailId,
  onSelectEmail,
  className = '',
}: EmailTableProps) {
  return (
    // T050: Table container with overflow-auto
    // T056: Conditional className based on preview visibility
    <div className={`overflow-auto ${className}`}>
      {/* T051: Table element with full width */}
      <table className="w-full">
        {/* T052: Integrate EmailTableHeader */}
        <EmailTableHeader />

        {/* T053: Map emails to EmailRow components */}
        <tbody>
          {emails.map((email) => (
            <EmailRow
              key={email.id}
              email={email}
              // T054: Pass selection state to EmailRow
              isSelected={selectedEmailId === email.id}
              // T055: Handle row click events
              onClick={() => onSelectEmail(email.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
