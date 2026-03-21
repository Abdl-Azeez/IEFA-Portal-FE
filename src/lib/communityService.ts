import api from "./api";

/* ── API response types ─────────────────────────────────────────────────── */

export interface CommunityCategoryAPI {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionAuthorAPI {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  country: string | null;
  profilePhotoUrl: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isModerator: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionInteractionAPI {
  id: string;
  user: DiscussionAuthorAPI;
  type: "like" | "comment";
  content: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionGroupAPI {
  id: string;
  name: string;
  description?: string;
}

export interface DiscussionAPI {
  id: string;
  title: string;
  content: string;
  category: CommunityCategoryAPI | null;
  group: DiscussionGroupAPI | null;
  author: DiscussionAuthorAPI;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  interactions: DiscussionInteractionAPI[];
  attachments?: string[];
  taggedUsers?: DiscussionAuthorAPI[];
  createdAt: string;
  updatedAt: string;
  /** Populated only on detail view */
  isBookmarked?: boolean;
  status?: string;
  flagged?: boolean;
  /** ISO timestamp set by API when flagged; null/undefined when not flagged */
  flaggedAt?: string | null;
}

export interface GroupJoinRequestAPI {
  id: string;
  user: DiscussionAuthorAPI;
  group: CommunityGroupAPI;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CommunityGroupAPI {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  memberCount?: number;
  members?:
    | number
    | Array<{
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        country?: string;
        profilePhotoUrl?: string | null;
        role?: string;
        isVerified?: boolean;
        isActive?: boolean;
        isModerator?: boolean;
        lastLoginAt?: string;
        createdAt?: string;
        updatedAt?: string;
      }>;
  isPrivate?: boolean;
  createdAt?: string;
  topic?: string;
  nextSession?: string;
  isMember?: boolean;
}

export function getCommunityGroupMemberCount(group: CommunityGroupAPI): number {
  if (typeof group.memberCount === "number") {
    return group.memberCount;
  }

  if (Array.isArray(group.members)) {
    return group.members.length;
  }

  if (typeof group.members === "number") {
    return group.members;
  }

  return 0;
}

export interface CommunityEventAPI {
  id: string;
  title: string;
  description?: string;
  date?: string;
  endTime?: string;
  startDate?: string;
  time?: string;
  startTime?: string;
  location?: string;
  type?: string;
  capacity?: number;
  isVirtual?: boolean;
  virtualLink?: string;
  attendeeCount?: number;
  attendees?: number;
  isRegistered?: boolean;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  type?: string;
  capacity?: number;
  isVirtual?: boolean;
  virtualLink?: string;
}

export type UpdateEventDto = Partial<CreateEventDto>;

/* ── DTO types (sent to backend) ────────────────────────────────────────── */

export interface CreateDiscussionDto {
  title: string;
  content: string;
  categoryId?: string;
  groupId?: string;
  tags?: string[];
  attachments?: string[];
  taggedUserIds?: string[];
}

export type UpdateDiscussionDto = Partial<{
  title: string;
  content: string;
  isPinned: boolean;
  isAnswered: boolean;
  flagged: boolean;
  status: string;
}>;

export interface CreateInteractionDto {
  type: "like" | "comment";
  content?: string;
}

export interface CreateCommunityCategoryDto {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
}

export type UpdateCommunityCategoryDto = Partial<CreateCommunityCategoryDto>;

export interface CreateCommunityGroupDto {
  name: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  isPrivate?: boolean;
}

export type UpdateCommunityGroupDto = Partial<CreateCommunityGroupDto>;

/* ── Service functions ──────────────────────────────────────────────────── */

export const communityService = {
  /* -- Categories -- */
  getCategories: () =>
    api
      .get<CommunityCategoryAPI[]>("/community/categories")
      .then((r) => r.data),

  createCategory: (data: CreateCommunityCategoryDto) =>
    api
      .post<CommunityCategoryAPI>("/community/categories", data)
      .then((r) => r.data),

  updateCategory: (id: string, data: UpdateCommunityCategoryDto) =>
    api
      .patch<CommunityCategoryAPI>(`/community/categories/${id}`, data)
      .then((r) => r.data),

  /* -- Discussions -- */
  getDiscussions: (params?: {
    categoryId?: string;
    groupId?: string;
    sortBy?: "latest" | "oldest" | "popular" | "unanswered";
    timeRange?: "day" | "week" | "month" | "all";
    search?: string;
    showBookmarkedOnly?: boolean;
  }) =>
    api
      .get<DiscussionAPI[]>("/community/discussions", { params })
      .then((r) => r.data),

  getDiscussionById: (id: string) =>
    api
      .get<DiscussionAPI>(`/community/discussions/${id}`)
      .then((r) => r.data),

  createDiscussion: (data: CreateDiscussionDto) =>
    api
      .post<DiscussionAPI>("/community/discussions", data)
      .then((r) => r.data),

  updateDiscussion: (id: string, data: UpdateDiscussionDto) =>
    api
      .patch<DiscussionAPI>(`/community/discussions/${id}`, data)
      .then((r) => r.data),

  deleteDiscussion: (id: string) =>
    api.delete(`/community/discussions/${id}`),

  createInteraction: (discussionId: string, data: CreateInteractionDto) =>
    api
      .post<DiscussionInteractionAPI>(
        `/community/discussions/${discussionId}/interactions`,
        data,
      )
      .then((r) => r.data),

  deleteInteraction: (interactionId: string) =>
    api.delete(`/community/discussions/interactions/${interactionId}`),

  toggleBookmark: (discussionId: string) =>
    api
      .post<boolean>(`/community/discussions/${discussionId}/bookmark`)
      .then((r) => r.data),

  getBookmarkedDiscussions: (params?: {
    categoryId?: string;
    groupId?: string;
    sortBy?: 'latest' | 'oldest' | 'popular' | 'unanswered';
    timeRange?: 'day' | 'week' | 'month' | 'all';
    search?: string;
  }) =>
    api
      .get<DiscussionAPI[]>('/community/discussions/bookmarks', { params })
      .then((r) => r.data),

  flagDiscussion: (discussionId: string) =>
    api
      .post<DiscussionAPI>(`/community/discussions/${discussionId}/flag`)
      .then((r) => r.data),

  reportDiscussion: async (discussionId: string, _reason?: string) => {
    return communityService.flagDiscussion(discussionId);
  },

  /* -- Groups -- */
  getGroups: () =>
    api.get<CommunityGroupAPI[]>("/community/groups").then((r) => r.data),

  getGroupById: (id: string) =>
    api.get<CommunityGroupAPI>(`/community/groups/${id}`).then((r) => r.data),

  createGroup: (data: CreateCommunityGroupDto) =>
    api.post<CommunityGroupAPI>("/community/groups", data).then((r) => r.data),

  updateGroup: (
    id: string,
    data: UpdateCommunityGroupDto,
  ) =>
    api
      .patch<CommunityGroupAPI>(`/community/groups/${id}`, data)
      .then((r) => r.data),

  deleteGroup: (id: string) => api.delete(`/community/groups/${id}`),

  joinGroup: (id: string) =>
    api
      .post<CommunityGroupAPI>(`/community/groups/${id}/join`)
      .then((r) => r.data),

  leaveGroup: (id: string) =>
    api
      .post<CommunityGroupAPI>(`/community/groups/${id}/leave`)
      .then((r) => r.data),

  getGroupMembers: (id: string) =>
    api
      .get<DiscussionAuthorAPI[]>(`/community/groups/${id}/members`)
      .then((r) => r.data),

  requestJoinGroup: (id: string) =>
    api
      .post<GroupJoinRequestAPI>(`/community/groups/${id}/request-join`)
      .then((r) => r.data),

  getJoinRequests: (groupId: string) =>
    api
      .get<GroupJoinRequestAPI[]>(`/community/groups/${groupId}/requests`)
      .then((r) => r.data),

  approveJoinRequest: (requestId: string) =>
    api.post(`/community/groups/requests/${requestId}/approve`).then((r) => r.data),

  rejectJoinRequest: (requestId: string) =>
    api.post(`/community/groups/requests/${requestId}/reject`).then((r) => r.data),

  /* -- Events -- */
  getEvents: () =>
    api.get<CommunityEventAPI[]>("/community/events").then((r) => r.data),

  getEventById: (id: string) =>
    api
      .get<CommunityEventAPI>(`/community/events/${id}`)
      .then((r) => r.data),

  createEvent: (data: CreateEventDto) =>
    api
      .post<CommunityEventAPI>("/community/events", data)
      .then((r) => r.data),

  updateEvent: (id: string, data: UpdateEventDto) =>
    api
      .patch<CommunityEventAPI>(`/community/events/${id}`, data)
      .then((r) => r.data),

  deleteEvent: (id: string) => api.delete(`/community/events/${id}`),

  registerForEvent: (id: string) =>
    api
      .post<CommunityEventAPI>(`/community/events/${id}/register`)
      .then((r) => r.data),

  unregisterFromEvent: (id: string) =>
    api
      .post<CommunityEventAPI>(`/community/events/${id}/unregister`)
      .then((r) => r.data),
};

/* ── Mapping helpers ────────────────────────────────────────────────────── */

/** Map API sort value to UI sortBy value */
export function apiSortToUiSort(
  uiSort: "latest" | "earliest" | "mostPopular" | "unanswered",
): "latest" | "oldest" | "popular" | "unanswered" {
  switch (uiSort) {
    case "earliest":
      return "oldest";
    case "mostPopular":
      return "popular";
    default:
      return uiSort;
  }
}
