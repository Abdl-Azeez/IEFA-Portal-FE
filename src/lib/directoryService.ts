import api from "./api";

/* ── API response types ─────────────────────────────────────────────────── */

export interface DirectoryCategoryAPI {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent: DirectoryCategoryAPI | null;
  sortOrder: number;
  isFinancial: boolean;
}

export interface DirectoryListingAPI {
  id: string;
  name: string;
  slug: string;
  category: DirectoryCategoryAPI;
  listingType: string;
  tagline: string | null;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  websiteUrl: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  yearFounded: number | null;
  employeeRange: string | null;
  shariahCertified: boolean;
  certifyingBody: string | null;
  aumUsdMillions: number | null;
  socialLinks: Record<string, string> | null;
  services: string[] | null;
  tags: string[] | null;
  isVerified: boolean;
  isFeatured: boolean;
  isClaimed: boolean;
  viewCount: number;
  status: string;
  isFinancial: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/* ── DTO types (sent to backend) ────────────────────────────────────────── */

export interface CreateDirectoryListingDto {
  name: string;
  slug?: string;
  description: string;
  isFinancial: boolean;
  listingType?: string;
  tagline?: string;
  country: string;
  city?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  yearFounded?: number | null;
  services?: string[];
  tags?: string[];
  websiteUrl?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  bannerUrl?: string;
  socialLinks?: Record<string, string>;
  shariahCertified?: boolean;
  certifyingBody?: string;
  aumUsdMillions?: number | null;
  employeeRange?: string;
  /** Single category ID from /api/v1/directory/categories */
  categoryId?: string;
  status?: string;
}

export interface ContributeDirectoryListingDto {
  name: string;
  slug?: string;
  categoryId: string;
  listingType: string;
  tagline?: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  country: string;
  city?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  yearFounded?: number;
  employeeRange?: string;
  shariahCertified?: boolean;
  certifyingBody?: string;
  aumUsdMillions?: number;
  socialLinks?: Record<string, string>;
  services?: string[];
  tags?: string[];
  isFinancial: boolean;
  status?: "draft";
}

export type UpdateDirectoryListingDto = Partial<CreateDirectoryListingDto>;

/* ── Query params for listing search/filter ─────────────────────────────── */

export interface DirectoryListingsParams {
  /** Full-text search across name, tagline, description, tags */
  search?: string;
  /** Filter by Category ID */
  categoryId?: string;
  /** Filter by financial status */
  isFinancial?: boolean;
  /** Filter by listing type: institution | fund | professional | regulator | consultancy | fintech | ngo */
  listingType?: string;
  /** Filter by single country */
  country?: string;
  /** Filter by city */
  city?: string;
  /** Filter by tags (comma-separated) */
  tags?: string;
  /** Filter by shariah certified status */
  shariahCertified?: boolean;
  /** Filter by multiple countries (comma-separated) */
  countries?: string;
  /** Filter by multiple services (comma-separated) */
  services?: string;
  /** Year founded from (inclusive) */
  yearFoundedFrom?: number;
  /** Year founded to (inclusive) */
  yearFoundedTo?: number;
}

export interface CreateDirectoryCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  parentId?: string;
  sortOrder?: number;
  isFinancial?: boolean;
}

/* ── Service functions ──────────────────────────────────────────────────── */

export const directoryService = {
  /* -- Listings -- */
  getListings: (params?: DirectoryListingsParams) =>
    api
      .get<DirectoryListingAPI[]>("/directory/listings", { params })
      .then((r) => r.data),

  getListingById: (id: string) =>
    api
      .get<DirectoryListingAPI>(`/directory/listings/${id}`)
      .then((r) => r.data),

  createListing: (data: CreateDirectoryListingDto) =>
    api
      .post<DirectoryListingAPI>("/directory/listings", data)
      .then((r) => r.data),

  contributeListing: (data: ContributeDirectoryListingDto) =>
    api
      .post<DirectoryListingAPI>("/directory/listings/contribute", data)
      .then((r) => r.data),

  updateListing: (id: string, data: UpdateDirectoryListingDto) =>
    api
      .patch<DirectoryListingAPI>(`/directory/listings/${id}`, data)
      .then((r) => r.data),

  deleteListing: (id: string) => api.delete(`/directory/listings/${id}`),

  /* -- Categories -- */
  getCategories: () =>
    api
      .get<DirectoryCategoryAPI[]>("/directory/categories")
      .then((r) => r.data),

  createCategory: (data: CreateDirectoryCategoryDto) =>
    api
      .post<DirectoryCategoryAPI>("/directory/categories", data)
      .then((r) => r.data),

  updateCategory: (id: string, data: Partial<CreateDirectoryCategoryDto>) =>
    api
      .patch<DirectoryCategoryAPI>(`/directory/categories/${id}`, data)
      .then((r) => r.data),

  deleteCategory: (id: string) => api.delete(`/directory/categories/${id}`),
};

/* ── Mapping helpers ────────────────────────────────────────────────────── */

/** Extract category name(s) from an API listing's single category field. */
export function resolveCategoryNames(
  category: DirectoryCategoryAPI | null | undefined,
): string[] {
  if (!category) return [];
  return [category.name];
}
