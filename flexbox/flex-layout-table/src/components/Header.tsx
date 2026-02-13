// T019-T024: Header component with email stats
import type { EmailStats } from '../types/email'

interface HeaderProps {
  stats: EmailStats
}

export default function Header({ stats }: HeaderProps) {
  return (
    <header className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md">
      <div className="flex items-center justify-between px-6 py-4">
        {/* T021: App title */}
        <h1 className="text-2xl font-bold">Email Viewer Demo</h1>

        {/* T022-T023: Email counts */}
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Total:</span>
            <span className="rounded-full bg-white/20 px-3 py-1 font-bold">
              {stats.total}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Unread:</span>
            <span className="rounded-full bg-yellow-400 px-3 py-1 font-bold text-blue-900">
              {stats.unread}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
