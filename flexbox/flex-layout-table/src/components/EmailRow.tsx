// T039-T048: Email row component
import type { Email } from '../types/email'
import { formatDate } from '../utils/formatDate'

interface EmailRowProps {
  email: Email
  isSelected: boolean
  onClick: () => void
}

export default function EmailRow({ email, isSelected, onClick }: EmailRowProps) {
  return (
    // T040: Table row with 4 columns
    // T046: Style read vs unread (font-weight)
    // T047: Hover state
    // T048: onClick handler
    <tr
      onClick={onClick}
      className={`
        cursor-pointer
        border-b border-gray-200
        transition-colors
        hover:bg-gray-100
        ${isSelected ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''}
        ${!email.isRead ? 'font-semibold' : 'font-normal'}
      `}
    >
      {/* T041: Sender name/email cell */}
      <td className="px-4 py-3">
        <div className="max-w-xs truncate">
          <div className={!email.isRead ? 'font-semibold' : ''}>{email.senderName}</div>
          <div className="text-sm text-gray-500">{email.senderEmail}</div>
        </div>
      </td>

      {/* T042: Subject cell with text truncation */}
      <td className="px-4 py-3">
        <div className="max-w-md truncate">{email.subject}</div>
      </td>

      {/* T044: Date cell using formatDate utility */}
      <td className="px-4 py-3 text-sm text-gray-600">
        <div className="w-20">{formatDate(email.date)}</div>
      </td>

      {/* T045: Read/unread status indicator */}
      <td className="px-4 py-3">
        <span
          className={`
            inline-block
            rounded-full
            px-2
            py-1
            text-xs
            font-medium
            ${
              email.isRead
                ? 'bg-gray-200 text-gray-700'
                : 'bg-blue-100 text-blue-800'
            }
          `}
        >
          {email.isRead ? 'Read' : 'Unread'}
        </span>
      </td>
    </tr>
  )
}
