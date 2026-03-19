import api from "./api";

/* ── API response types ─────────────────────────────────────────────────── */

export interface CommunityCategoryAPI {
  id: string;
  name: string;
}

export interface DiscussionAuthorAPI {
  id: string;
  name: string;
  avatar?: string;
}

export interface DiscussionAPI {
  id: string;
  title: string;
  /** Full content of the discussion */
  content?: string;
  /** Short description / excerpt (some APIs use this) */
  description?: string;
  author?: DiscussionAuthorAPI;
  /** Flat author fields (alternate API shape) */
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  repliesCount?: number;
  viewsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  categoryId?: string;
  category?: CommunityCategoryAPI;
  groupId?: string;
  isAnswered?: boolean;
  isPinned?: boolean;
  isBookmarked?: boolean;
  tags?: string[];
  status?: string;
  flagged?: boolean;
  /** Comment/like interactions — returned by getDiscussionById */
  interactions?: DiscussionInteractionAPI[];
}

export interface CommunityGroupAPI {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  members?: number;
  isPrivate?: boolean;
  createdAt?: string;
  /** Current discussion topic */
  topic?: string;
  /** Formatted next session string */
  nextSession?: string;
  /** Whether the current user is a member */
  isMember?: boolean;
}

export interface CommunityEventAPI {
  id: string;
  title: string;
  description?: string;
  date?: string;
  startDate?: string;
  time?: string;
  startTime?: string;
  location?: string;
  type?: string;
  attendeeCount?: number;
  attendees?: number;
  isRegistered?: boolean;
}

export interface DiscussionInteractionAPI {
  id: string;
  type: "like" | "comment";
  content?: string;
}

/* ── DTO types (sent to backend) ────────────────────────────────────────── */

export interface CreateDiscussionDto {
  title: string;
  content: string;
  categoryId?: string;
  groupId?: string;
  tags?: string[];
}

export type UpdateDiscussionDto = Partial<{
  title: string;
  content: string;
  isPinned: boolean;
  isAnswered: boolean;
  status: string;
}>;

export interface CreateInteractionDto {
  type: "like" | "comment";
  content?: string;
}

/* ── Service functions ──────────────────────────────────────────────────── */

export const communityService = {
  /* -- Categories -- */
  getCategories: () =>
    api
      .get<CommunityCategoryAPI[]>("/community/categories")
      .then((r) => r.data),

  createCategory: (data: { name: string }) =>
    api
      .post<CommunityCategoryAPI>("/community/categories", data)
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

  /* -- Groups -- */
  getGroups: () =>
    api.get<CommunityGroupAPI[]>("/community/groups").then((r) => r.data),

  getGroupById: (id: string) =>
    api.get<CommunityGroupAPI>(`/community/groups/${id}`).then((r) => r.data),

  createGroup: (data: {
    name: string;
    description?: string;
    isPrivate?: boolean;
  }) =>
    api.post<CommunityGroupAPI>("/community/groups", data).then((r) => r.data),

  updateGroup: (
    id: string,
    data: Partial<{ name: string; description: string; isPrivate: boolean }>,
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

  /* -- Events -- */
  getEvents: () =>
    api.get<CommunityEventAPI[]>("/community/events").then((r) => r.data),

  getEventById: (id: string) =>
    api
      .get<CommunityEventAPI>(`/community/events/${id}`)
      .then((r) => r.data),

  createEvent: (data: Partial<CommunityEventAPI>) =>
    api
      .post<CommunityEventAPI>("/community/events", data)
      .then((r) => r.data),

  updateEvent: (id: string, data: Partial<CommunityEventAPI>) =>
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
