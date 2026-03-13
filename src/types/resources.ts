export type ResourceSection =
  | 'educational-guides'
  | 'research-publications'
  | 'standards-governance'
  | 'tools-practical'
  | 'glossary'

export interface ResourceItem {
  id: string
  displayImage: string | null
  authorName: string
  authorType: 'individual' | 'organization'
  title: string
  topic: string
  category: string
  briefIntro: string
  datePublished: string
  previewHtml: string | null
  previewUrl: string | null
  downloadUrl: string | null
  viewCount: number
  downloadCount: number
  section: ResourceSection
  tags: string[]
  createdAt: string
}

export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  relatedTerms?: string[]
}

export interface ResourceFilters {
  page?: number
  perPage?: number
  search?: string
  section?: ResourceSection
  category?: string
  authorName?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: 'date' | 'views' | 'downloads'
  order?: 'ASC' | 'DESC'
}
