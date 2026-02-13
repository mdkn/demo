import { writeFileSync } from 'fs'
import { join } from 'path'
import type { Email } from '../src/types/email'

// T009: Name and email generators
const firstNames = [
  'Alice', 'Bob', 'Carlos', 'Diana', 'Elena', 'Fatima', 'George', 'Hannah',
  'Imran', 'Julia', 'Kenji', 'Lucia', 'Mohammed', 'Nina', 'Oliver', 'Priya',
  'Qing', 'Raj', 'Sofia', 'Taro', 'Uma', 'Viktor', 'Wei', 'Yuki', 'Zara',
  'Ahmed', 'Bridget', 'Chen', 'Dmitri', 'Esther', 'Felix', 'Grace', 'Hugo',
  'Isabella', 'Jin', 'Kira', 'Liam', 'Maria', 'Nico', 'Olivia', 'Paulo',
]

const lastNames = [
  'Smith', 'Johnson', 'Chen', 'Garcia', 'Martinez', 'Rodriguez', 'Lee', 'Kim',
  'Patel', 'Singh', 'Kumar', 'Ahmed', 'Ali', 'Hassan', 'Ibrahim', 'Mohammed',
  'Anderson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Thomas', 'White',
  'Jackson', 'Harris', 'Martin', 'Thompson', 'Young', 'Allen', 'King', 'Wright',
  'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter',
]

const emailDomains = [
  'gmail.com',
  'outlook.com',
  'yahoo.com',
  'company.com',
  'techcorp.com',
  'business.net',
  'enterprise.org',
  'startup.io',
]

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateName(): { firstName: string; lastName: string; fullName: string } {
  const firstName = randomElement(firstNames)
  const lastName = randomElement(lastNames)
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  }
}

function generateEmail(name: { firstName: string; lastName: string }): string {
  const domain = randomElement(emailDomains)
  const username = `${name.firstName.toLowerCase()}.${name.lastName.toLowerCase()}`
  return `${username}@${domain}`
}

// T010: Subject line templates (work, personal, newsletters, notifications)
const subjectTemplates = {
  work: [
    'Q4 Project Update Meeting',
    'Re: Design Review Feedback',
    'Action Required: Approve Budget Proposal',
    'Weekly Team Sync - Agenda',
    'FW: Client Requirements Document',
    'Sprint Planning for Next Week',
    'Code Review Request: PR #',
    'Meeting Notes: Strategy Session',
    'Quarterly Performance Review',
    'New Feature Deployment Schedule',
  ],
  personal: [
    'Dinner plans this weekend?',
    'Photos from the trip!',
    'Happy Birthday! 🎉',
    'Book recommendation',
    'Did you see this article?',
    'Coffee catch-up soon?',
    'Thanks for your help!',
    'Weekend hiking plans',
    'Movie night invitation',
    'Recipe you asked for',
  ],
  newsletters: [
    'Your Weekly Design Inspiration',
    'Tech News Roundup - January Edition',
    'New Features: Product Updates',
    'Monthly Newsletter: Industry Insights',
    'Top Articles This Week',
    'Special Offer: Limited Time Only',
    'Community Highlights & Events',
    'Tutorial: Advanced JavaScript Patterns',
    'Best Practices in Modern Development',
    'Trends Report: 2026 Predictions',
  ],
  notifications: [
    'Your order has been shipped',
    'Password reset requested',
    'New comment on your post',
    'Security alert: New login detected',
    'Reminder: Meeting in 30 minutes',
    'Your subscription is expiring soon',
    'Invoice available for download',
    'System maintenance scheduled',
    'New follower notification',
    'Payment confirmation received',
  ],
}

function generateSubject(): string {
  const categories = Object.keys(subjectTemplates) as Array<keyof typeof subjectTemplates>
  const category = randomElement(categories)
  const template = randomElement(subjectTemplates[category])

  // Add some variation to work subjects
  if (category === 'work' && template.includes('#')) {
    return template.replace('#', String(Math.floor(Math.random() * 999) + 1))
  }

  return template
}

// T011: Date distribution logic (last 30 days)
function generateDate(): string {
  const now = new Date()
  const daysAgo = Math.floor(Math.random() * 30)
  const hoursAgo = Math.floor(Math.random() * 24)
  const minutesAgo = Math.floor(Math.random() * 60)

  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(date.getHours() - hoursAgo)
  date.setMinutes(date.getMinutes() - minutesAgo)

  return date.toISOString()
}

// T012: Preview text generator (2-5 paragraphs)
const loremSentences = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
  'Nisi ut aliquip ex ea commodo consequat.',
  'Quis autem vel eum iure reprehenderit qui in ea voluptate.',
  'At vero eos et accusamus et iusto odio dignissimos ducimus.',
  'Et harum quidem rerum facilis est et expedita distinctio.',
  'Nam libero tempore, cum soluta nobis est eligendi optio.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum.',
  'Itaque earum rerum hic tenetur a sapiente delectus.',
]

function generateParagraph(): string {
  const sentenceCount = Math.floor(Math.random() * 3) + 3 // 3-5 sentences
  const sentences: string[] = []
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(randomElement(loremSentences))
  }
  return sentences.join(' ')
}

function generatePreviewText(): string {
  const paragraphCount = Math.floor(Math.random() * 4) + 2 // 2-5 paragraphs
  const paragraphs: string[] = []
  for (let i = 0; i < paragraphCount; i++) {
    paragraphs.push(generateParagraph())
  }
  return paragraphs.join('\n\n')
}

// T013: Read/unread ratio logic (70/30 split)
function generateIsRead(): boolean {
  return Math.random() < 0.7 // 70% chance of being read
}

// T014: Generate and save 500 emails to JSON file
function generateEmails(count: number): Email[] {
  const emails: Email[] = []

  for (let i = 0; i < count; i++) {
    const name = generateName()
    const email: Email = {
      id: `email-${String(i + 1).padStart(3, '0')}`,
      senderName: name.fullName,
      senderEmail: generateEmail(name),
      subject: generateSubject(),
      date: generateDate(),
      previewText: generatePreviewText(),
      isRead: generateIsRead(),
    }
    emails.push(email)
  }

  // Sort by date (newest first)
  emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return emails
}

// Main execution
const emails = generateEmails(500)
const outputPath = join(process.cwd(), 'src', 'data', 'emails.json')

writeFileSync(outputPath, JSON.stringify(emails, null, 2), 'utf-8')

console.log(`✅ Generated ${emails.length} emails`)
console.log(`📁 Saved to: ${outputPath}`)
console.log(`📊 Stats:`)
console.log(`   - Read: ${emails.filter(e => e.isRead).length} (${Math.round(emails.filter(e => e.isRead).length / emails.length * 100)}%)`)
console.log(`   - Unread: ${emails.filter(e => !e.isRead).length} (${Math.round(emails.filter(e => !e.isRead).length / emails.length * 100)}%)`)
