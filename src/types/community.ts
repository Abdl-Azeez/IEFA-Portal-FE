// Community Categories
export type CommunityCategory = 
  | 'Markets & Investing'
  | 'Savings'
  | 'Zakat'
  | 'Every day islamic finance'
  | 'General Discussion'
  | 'Q&A'
  | 'Resources'

// User Profile Type
export interface UserProfile {
  id: string
  name: string
  title: string // e.g., "Shariah Auditor"
  displayPicture: string
  bio?: string
  joinedDate: Date
  totalPosts: number
  totalViews: number
  totalReplies: number
  totalLikes: number
  isVerified?: boolean
  isModerator?: boolean
  rating?: number
}

// Reply/Comment Type
export interface Reply {
  id: string
  postId: string
  userId: string
  userName: string
  userAvatar: string
  userTitle: string
  content: string
  createdAt: Date
  updatedAt: Date
  likes: number
  isAuthor?: boolean
  attachments?: Attachment[]
}

// Attachment Type
export interface Attachment {
  id: string
  type: 'image' | 'file'
  url: string
  name: string
  size: number
}

// Discussion Post Type (Enhanced)
export interface DiscussionPost {
  id: string
  title: string
  description: string
  category: CommunityCategory
  poster: string
  posterAvatar?: string
  posterId: string
  createdAt: Date
  updatedAt: Date
  replies: number
  views: number
  likes: number
  shares: number
  isSaved?: boolean
  isAnswered?: boolean
  tags?: string[]
  isPinned?: boolean
  isReported?: boolean
}

// Detailed Discussion Post Type
export interface DetailedDiscussionPost extends DiscussionPost {
  content: string // Full post content/write-up
  posterDetails: UserProfile
  attachments?: Attachment[]
  repliesList?: Reply[]
  lastReply?: {
    userId: string
    userName: string
    userAvatar: string
    createdAt: Date
  }
  mentions?: string[] // Mentioned user IDs
}

// Study Group Type
export interface StudyGroup {
  id: string
  name: string
  members: number
  topic: string
  nextSession: string
  category: CommunityCategory
  image?: string
  isActive: boolean
}

// Event Type
export interface CommunityEvent {
  id: string
  title: string
  date: string
  time: string
  type: 'Conference' | 'Workshop' | 'Webinar' | 'Meetup'
  location: string
  attendees: number
  category: CommunityCategory
  description?: string
  isRegistered?: boolean
}

// Mentor Type
export interface Mentor {
  id: string
  name: string
  role: string
  organization: string
  image: string
  available: boolean
  expertise: string[]
  bio?: string
  rating?: number
}

// Search Result Type
export interface SearchResult {
  type: 'discussion' | 'member' | 'event'
  id: string
  title: string
  description?: string
  category?: CommunityCategory
  timestamp?: Date
}

// Filter Options
export interface FilterOptions {
  category?: CommunityCategory
  sortBy?: 'latest' | 'earliest' | 'mostPopular' | 'unanswered'
  timeRange?: 'day' | 'week' | 'month' | 'all'
  savedOnly?: boolean
}

// Modal Type for Start Discussion
export interface CreatePostData {
  title: string
  content: string
  category: CommunityCategory
  attachments: Attachment[]
  mentions: string[] // User IDs or usernames
}
