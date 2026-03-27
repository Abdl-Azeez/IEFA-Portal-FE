export type ResourceSection =
  | 'educational-guides'
  | 'research-publications'
  | 'standards-governance'
  | 'tools-practical'
  | 'glossary'

/** Maps API resourceType enum → UI tab section */
export type ResourceType = 'guide' | 'research' | 'standard' | 'tool'

export const RESOURCE_TYPE_TO_SECTION: Record<ResourceType, ResourceSection> = {
  guide: 'educational-guides',
  research: 'research-publications',
  standard: 'standards-governance',
  tool: 'tools-practical',
}

export const SECTION_TO_RESOURCE_TYPE: Partial<Record<ResourceSection, ResourceType>> = {
  'educational-guides': 'guide',
  'research-publications': 'research',
  'standards-governance': 'standard',
  'tools-practical': 'tool',
}

export interface ResourceCategory {
  id: string
  name: string
  slug: string
  parentId?: string | null
  parent?: ResourceCategory | null
  children?: ResourceCategory[]
}

/** API Resource response shape */
export interface ResourceItem {
  id: string
  title: string
  resourceType: ResourceType
  authorName: string | null
  authorType: 'individual' | 'organization' | null
  topic: string | null
  briefIntro: string | null
  coverImageUrl: string | null
  fileUrl: string | null
  previewUrl: string | null
  categoryId: string | null
  category: ResourceCategory | null
  isPremium: boolean
  isFeatured: boolean
  status: 'draft' | 'published' | 'archived'
  tags: string[]
  viewCount: number
  downloadCount: number
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface GlossaryTerm {
  id: string
  term: string
  definition: string
  letter?: string
  status: 'draft' | 'published'
  relatedTerms?: string[]
  createdAt: string
}

export interface ResourceFilters {
  page?: number
  perPage?: number
  search?: string
  status?: 'draft' | 'published' | 'archived'
  resourceType?: ResourceType
  categoryId?: string
  isPremium?: boolean
  order?: 'ASC' | 'DESC'
}

export interface GlossaryFilters {
  search?: string
  letter?: string
  status?: 'draft' | 'published'
}

export interface CreateResourceDto {
  title: string
  resourceType: ResourceType
  authorName?: string
  authorType?: 'individual' | 'organization'
  topic?: string
  briefIntro?: string
  coverImageUrl?: string
  fileUrl?: string
  previewUrl?: string
  categoryId?: string
  isPremium?: boolean
  isFeatured?: boolean
  status?: 'draft' | 'published' | 'archived'
  tags?: string[]
}

export interface CreateGlossaryTermDto {
  term: string
  definition: string
  letter?: string
  status?: 'draft' | 'published'
  relatedTerms?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    itemCount: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface SubmitUserResourceDto {
  title: string
  briefIntro?: string
  categoryId: string
  subCategoryId?: string
  resourceType?: ResourceType
  /** Free-text sub-category name when user selects "Other" on General resources */
  suggestedSubCategoryName?: string
  /** Free-text document type name when user selects "Other" on Regulatory resources */
  suggestedDocTypeName?: string
  fileUrl: string
  coverImageUrl?: string
  authorName?: string
}

export interface UserResourceSubmission {
  id: string
  title: string
  briefIntro: string | null
  fileUrl: string
  coverImageUrl: string | null
  authorName: string | null
  categoryId: string
  category: ResourceCategory | null
  subCategoryId: string | null
  subCategory: ResourceCategory | null
  status: 'pending' | 'approved' | 'rejected'
  submittedBy?: string
  createdAt: string
}
