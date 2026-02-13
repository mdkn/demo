// T006: Email interface with all required fields
export interface Email {
  id: string
  senderName: string
  senderEmail: string
  subject: string
  date: string // ISO 8601 date string
  previewText: string // 2-5 paragraphs
  isRead: boolean
}

// T007: EmailStats interface for header counts
export interface EmailStats {
  total: number
  unread: number
}

// T008: SortField and SortDirection types for P2 features
export type SortField = 'date' | 'sender' | 'subject'
export type SortDirection = 'asc' | 'desc'
