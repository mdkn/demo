// T060-T069: Email preview panel component
import type { Email } from '../types/email'

interface EmailPreviewProps {
  email: Email
  className?: string
}

export default function EmailPreview({ email, className = '' }: EmailPreviewProps) {
  return (
    // T061-T062: Preview panel container with flex-1 and scrollable
    // T069: Styling with padding and border-left (panel is on the right)
    <div className={`overflow-auto border-l border-gray-300 bg-white p-6 ${className}`}>
      {/* T063: Sender name display (large, prominent) */}
      <h2 className="text-2xl font-bold text-gray-900">{email.senderName}</h2>

      {/* T064: Sender email display (smaller, gray) */}
      <p className="mt-1 text-sm text-gray-600">{email.senderEmail}</p>

      {/* T065: Subject line (bold, text-xl) */}
      <h3 className="mt-4 text-xl font-bold text-gray-800">{email.subject}</h3>

      {/* T066: Date/time display */}
      <p className="mt-2 text-sm text-gray-500">
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

      {/* T067: Read/unread badge */}
      <div className="mt-3">
        <span
          className={`
            inline-block
            rounded-full
            px-3
            py-1
            text-xs
            font-semibold
            ${
              email.isRead
                ? 'bg-gray-200 text-gray-700'
                : 'bg-blue-100 text-blue-700'
            }
          `}
        >
          {email.isRead ? '✓ Read' : '● Unread'}
        </span>
      </div>

      {/* Divider */}
      <hr className="my-6 border-gray-200" />

      {/* T068: Preview text display with whitespace preservation */}
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        {email.previewText}
      </div>
    </div>
  )
}
