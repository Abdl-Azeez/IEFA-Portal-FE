import { motion } from 'framer-motion'
import {
  Search,
  MessageSquare,
  Users,
  Calendar,
  Heart,
  Eye,
  Bookmark,
  Filter,
  X,
  Share2,
  Flag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  communityService,
  apiSortToUiSort,
  getCommunityGroupMemberCount,
  type DiscussionAPI,
  type CommunityGroupAPI,
  type CommunityEventAPI,
  type CommunityCategoryAPI,
  type GroupJoinRequestAPI,
} from "@/lib/communityService";
import type {
  Attachment,
  CommunityCategory,
  DiscussionPost,
  DetailedDiscussionPost,
  UserProfile,
  FilterOptions,
} from "@/types/community";
import DiscussionDetailPage from "@/components/community/DiscussionDetailPage";
import StartDiscussionModal from "@/components/community/StartDiscussionModal";
import PosterProfilePopup from "@/components/community/PosterProfilePopup";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Dialog } from "@/components/ui/dialog";


const CATEGORY_PALETTE = [
  "bg-[#D52B1E]", "bg-blue-600", "bg-green-600", "bg-orange-600",
  "bg-purple-600", "bg-yellow-600", "bg-indigo-600", "bg-teal-600",
];
function getCategoryColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return CATEGORY_PALETTE[h % CATEGORY_PALETTE.length];
}

/* -- API â†’ UI mapping helpers ---------------------------------------------- */
function apiDiscussionToPost(
  d: DiscussionAPI,
  _apiCategories: CommunityCategoryAPI[],
): DiscussionPost {
  const catName = d.category?.name ?? "General Discussion";
  const authorName =
    [d.author?.firstName, d.author?.lastName].filter(Boolean).join(" ") ||
    d.author?.username ||
    d.author?.email ||
    "Unknown";
  const replies =
    d.interactions?.filter((i) => i.type === "comment").length ?? 0;
  const totalLikes = d.interactions?.filter((i) => i.type === "like").length ?? 0;
  const hasLiked = d.hasLiked ?? false;
  return {
    id: d.id,
    title: d.title,
    description: d.content ?? "",
    category: catName as CommunityCategory,
    poster: authorName,
    posterAvatar: d.author?.profilePhotoUrl ?? undefined,
    posterId: d.author?.id ?? "",
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
    replies,
    views: d.viewCount ?? 0,
    // Keep likes as a neutral baseline; UI adds +1 only when local liked state is active.
    likes: Math.max(totalLikes - (hasLiked ? 1 : 0), 0),
    shares: 0,
    isAnswered: false,
    isPinned: d.isPinned ?? false,
    isSaved: d.hasBookmarked ?? d.isBookmarked ?? false,
    isReported: !!(d.flaggedAt || d.flagged),
    tags: undefined,
  };
}
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }
  }
}

export default function Community() {
  const [selectedTab, setSelectedTab] = useState("discussions");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: "latest",
    timeRange: "all",
  });
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [reportedPosts, setReportedPosts] = useState<string[]>([]);
  const [showStartDiscussionModal, setShowStartDiscussionModal] =
    useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [selectedPost, setSelectedPost] =
    useState<DetailedDiscussionPost | null>(null);
  const [showPosterProfile, setShowPosterProfile] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<UserProfile | null>(
    null,
  );
  const { isModerator, user } = useAuth();

  // state to track hover card
  const [hoverProfile, setHoverProfile] = useState<{
    post: DiscussionPost;
    pos: "top" | "bottom";
    x: number;
    y: number;
  } | null>(null);

  const handleProfileHover = (
    post: DiscussionPost,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cardHeight = 200; // approximate height of card
    const spaceBelow = window.innerHeight - rect.bottom;
    const pos = spaceBelow < cardHeight ? "top" : "bottom";
    const x = rect.left;
    const y = pos === "bottom" ? rect.bottom : rect.top;
    setHoverProfile({ post, pos, x, y });
  };

  const clearProfileHover = () => {
    setHoverProfile(null);
  };

  // Scroll to top on page load and when viewing discussion details
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedPost]);

  /* -- API state -- */
  const [apiCategories, setApiCategories] = useState<CommunityCategoryAPI[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroupAPI[]>([]);
  const [events, setEvents] = useState<CommunityEventAPI[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  /** Maps discussionId â†’ likeInteractionId (so we can delete the like later) */
  const likeInteractionIds = useRef<Map<string, string>>(new Map());
  /** Incremented on back-navigation to trigger a discussions re-fetch */
  const [discussionRefreshKey, setDiscussionRefreshKey] = useState(0);
  /** Like state passed into the detail page */
  const [initialLikeForDetail, setInitialLikeForDetail] = useState(false);
  const [initialLikeIdForDetail, setInitialLikeIdForDetail] = useState<
    string | undefined
  >(undefined);
  /** Bookmarked discussions for Bookmarks tab */
  const [bookmarkedDiscussions, setBookmarkedDiscussions] = useState<DiscussionPost[]>([]);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  /** Flagged discussions for Flagged tab (moderators only) — derived from discussionPosts */
  const [flaggedDiscussions, setFlaggedDiscussions] = useState<DiscussionPost[]>([]);
  const [flaggedLoading, setFlaggedLoading] = useState(false);
  /** Moderator join-request management in Groups tab */
  const [joinRequestsById, setJoinRequestsById] = useState<Record<string, GroupJoinRequestAPI[]>>({});
  const [expandedRequestGroupId, setExpandedRequestGroupId] = useState<string | null>(null);
  const [joinRequestsLoadingGroupId, setJoinRequestsLoadingGroupId] = useState<string | null>(null);
  /** Moderator-only: show only flagged posts */
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  /* -- Load community categories (needed to map categoryId â†’ name) -- */
  useEffect(() => {
    setCategoriesLoading(true);
    communityService
      .getCategories()
      .then(setApiCategories)
      .catch((err) => console.error("Failed to load community categories:", err))
      .finally(() => setCategoriesLoading(false));
  }, []);

  /* -- Load discussions (re-fetches when filters change) -- */
  useEffect(() => {
    setDiscussionsLoading(true);
    const apiSort = filters.sortBy
      ? apiSortToUiSort(filters.sortBy as "latest" | "earliest" | "mostPopular" | "unanswered")
      : "latest";
    const catId = filters.category
      ? apiCategories.find((c) => c.name === filters.category)?.id
      : undefined;
    communityService
      .getDiscussions({
        categoryId: catId,
        sortBy: apiSort,
        timeRange: filters.timeRange as "day" | "week" | "month" | "all" | undefined,
        search: searchQuery || undefined,
        showBookmarkedOnly: filters.savedOnly,
      })
      .then((data) => {
        setLikedPosts(data.filter((d) => d.hasLiked).map((d) => d.id));
        setSavedPosts(
          data
            .filter((d) => d.hasBookmarked ?? d.isBookmarked)
            .map((d) => d.id),
        );
        setDiscussionPosts(data.map((d) => apiDiscussionToPost(d, apiCategories)));
        setApiError(null);
      })
      .catch((err) => {
        console.error("Failed to load discussions:", err);
        setApiError("Failed to load discussions.");
      })
      .finally(() => setDiscussionsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery, apiCategories, discussionRefreshKey]);

  /* -- Load groups when tab is selected -- */
  useEffect(() => {
    if (selectedTab !== "study-groups") return;
    setGroupsLoading(true);
    communityService
      .getGroups()
      .then(setGroups)
      .catch((err) => console.error("Failed to load groups:", err))
      .finally(() => setGroupsLoading(false));
  }, [selectedTab]);

  // Ensure groups are available in discussion modal for optional group selection.
  useEffect(() => {
    if (!showStartDiscussionModal || groups.length > 0) return;
    setGroupsLoading(true);
    communityService
      .getGroups()
      .then(setGroups)
      .catch((err) =>
        console.error("Failed to load groups for discussion modal:", err),
      )
      .finally(() => setGroupsLoading(false));
  }, [showStartDiscussionModal, groups.length]);

  /* -- Load bookmarked discussions when tab is selected -- */
  useEffect(() => {
    if (selectedTab !== "bookmarks") return;
    setBookmarksLoading(true);
    communityService
      .getBookmarkedDiscussions()
      .then((data) => setBookmarkedDiscussions(data.map((d) => apiDiscussionToPost(d, apiCategories))))
      .catch((err) => console.error("Failed to load bookmarks:", err))
      .finally(() => setBookmarksLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  /* -- Load flagged discussions when moderator opens flagged tab -- */
  useEffect(() => {
    if (selectedTab !== "flagged" || !isModerator) return;
    setFlaggedLoading(true);
    communityService
      .getDiscussions()
      .then((data) => {
        const mapped = data.map((d) => apiDiscussionToPost(d, apiCategories));
        setFlaggedDiscussions(mapped.filter((p) => p.isReported));
      })
      .catch((err) => console.error("Failed to load flagged discussions:", err))
      .finally(() => setFlaggedLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, isModerator]);

  /* -- Load events when tab is selected -- */
  useEffect(() => {
    if (selectedTab !== "events") return;
    setEventsLoading(true);
    communityService
      .getEvents()
      .then(setEvents)
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setEventsLoading(false));
  }, [selectedTab]);

  const mentors = [
    {
      name: "Dr. Salman Al-Farsi",
      role: "Senior Portfolio Manager",
      organization: "ESG",
      image: "ðŸ‘¨â€ðŸ’¼",
      available: true,
      expertise: ["Shari'ah Audit", "Career Advice"],
    },
    {
      name: "Dr. Fatima Al-Farruq",
      role: "Senior Portfolio Manager",
      organization: "ESG",
      image: "ðŸ‘©â€ðŸ’¼",
      available: true,
      expertise: ["Career Advice"],
    },
    {
      name: "Dr. Ali Badar",
      role: "Senior Portfolio Manager",
      organization: "ESG",
      image: "ðŸ‘¨â€ðŸ’¼",
      available: true,
      expertise: ["Shari'ah Audit", "Career Advice"],
    },
  ];

  // Filter and sort discussions
  const filteredDiscussions = useMemo(() => {
    let filtered = discussionPosts;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.poster.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter((post) => post.category === filters.category);
    }

    // Answered/Unanswered filter
    if (filters.sortBy === "unanswered") {
      filtered = filtered.filter((post) => !post.isAnswered);
    }

    // Saved posts filter
    if (filters.savedOnly) {
      filtered = filtered.filter((post) => savedPosts.includes(post.id));
    }

    // Time range filter
    const now = new Date();
    if (filters.timeRange && filters.timeRange !== "all") {
      filtered = filtered.filter((post) => {
        const postTime = new Date(post.createdAt);
        const hoursAgo =
          (now.getTime() - postTime.getTime()) / (1000 * 60 * 60);

        switch (filters.timeRange) {
          case "day":
            return hoursAgo < 24;
          case "week":
            return hoursAgo < 168; // 7 days
          case "month":
            return hoursAgo < 720; // 30 days
          default:
            return true;
        }
      });
    }

    if (filters.sortBy === "latest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (filters.sortBy === "earliest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (filters.sortBy === "mostPopular") {
      filtered.sort(
        (a, b) =>
          b.views +
          b.likes +
          b.replies * 2 -
          (a.views + a.likes + a.replies * 2),
      );
    }

    // After sorting by chosen criterion, ensure pinned posts bubble to top
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

    // Moderator: show only flagged posts when filter is active
    if (showFlaggedOnly) {
      filtered = filtered.filter((post) => post.isReported);
    }

    return filtered;
  }, [discussionPosts, searchQuery, filters, savedPosts, showFlaggedOnly]);

  const joinedGroupsForModal = useMemo(
    () => groups.filter((g) => g.isMember),
    [groups],
  );

  // Format time for posts
  const formatTime = (date: Date) => {
    const now = new Date();
    const hoursAgo = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (hoursAgo === 0) {
      const minutesAgo = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );
      return `${minutesAgo}m ago`;
    } else if (hoursAgo < 24) {
      return `${hoursAgo}h ago`;
    } else if (hoursAgo < 168) {
      const daysAgo = Math.floor(hoursAgo / 24);
      return `${daysAgo}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format join date for profile hover card
  const formatJoinDate = (date: Date) =>
    date.toLocaleString("default", { month: "long", year: "numeric" });

  const toggleSavePost = useCallback(async (postId: string) => {
    try {
      const isNowSaved = await communityService.toggleBookmark(postId);
      setSavedPosts((prev) =>
        isNowSaved
          ? [...prev, postId]
          : prev.filter((id) => id !== postId),
      );
      setDiscussionPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isSaved: isNowSaved } : p)),
      );
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      // Optimistic local fallback
      setSavedPosts((prev) =>
        prev.includes(postId)
          ? prev.filter((id) => id !== postId)
          : [...prev, postId],
      );
    }
  }, []);

  const toggleLikePost = useCallback(async (postId: string) => {
    const alreadyLiked = likedPosts.includes(postId);
    if (alreadyLiked) {
      const interactionId = likeInteractionIds.current.get(postId);
      if (interactionId) {
        try {
          await communityService.deleteInteraction(interactionId);
          likeInteractionIds.current.delete(postId);
        } catch (err) {
          console.error("Failed to unlike:", err);
          return;
        }
      }
      setLikedPosts((prev) => prev.filter((id) => id !== postId));
    } else {
      try {
        const interaction = await communityService.createInteraction(postId, {
          type: "like",
        });
        likeInteractionIds.current.set(postId, interaction.id);
        setLikedPosts((prev) => [...prev, postId]);
      } catch (err) {
        console.error("Failed to like:", err);
      }
    }
  }, [likedPosts]);

  const handleShare = async (post: DiscussionPost) => {
    const url = `${window.location.origin}/community/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReport = async (postId: string) => {
    if (reportedPosts.includes(postId)) {
      toast({ title: "Already Reported", description: "You've already reported this post." });
      return;
    }
    try {
      await communityService.reportDiscussion(postId);
      setReportedPosts((prev) => [...prev, postId]);
      setDiscussionPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isReported: true } : p)),
      );
      setBookmarkedDiscussions((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isReported: true } : p)),
      );
      toast.success("Post reported. Thank you for helping keep the community safe.");
    } catch (err) {
      console.error("Failed to report post:", err);
      toast.error("Could not submit report. Please try again.");
    }
  };

  const handlePostClick = async (post: DiscussionPost) => {
    let fullContent = post.description;
    let repliesList: import("@/types/community").Reply[] = [];
    let initialIsLiked = false;
    let initialLikeInteractionId: string | undefined;
    let full: import("@/lib/communityService").DiscussionAPI | undefined;
    try {
      full = await communityService.getDiscussionById(post.id);
      fullContent = full.content ?? post.description;
      const interactions = full.interactions ?? [];
      const myLike = interactions.find(
        (i) => i.type === "like" && i.user?.id === user?.id,
      );
      initialIsLiked = !!myLike;
      initialLikeInteractionId = myLike?.id;
      repliesList = interactions
        .filter((i) => i.type === "comment")
        .map((i) => ({
          id: i.id,
          postId: post.id,
          userId: i.user?.id ?? "",
          userName:
            [i.user?.firstName, i.user?.lastName].filter(Boolean).join(" ") ||
            "Member",
          userAvatar: i.user?.profilePhotoUrl ?? "👤",
          userTitle: i.user?.role ?? "Member",
          content: i.content ?? "",
          createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
          updatedAt: new Date(),
          likes: 0,
        }));
    } catch {
      // fall back to list-level data
    }

    const freshLikeCount = (full?.interactions ?? []).filter((i) => i.type === "like").length;
    const freshReplyCount = (full?.interactions ?? []).filter((i) => i.type === "comment").length;
    setInitialLikeForDetail(initialIsLiked);
    setInitialLikeIdForDetail(initialLikeInteractionId);

    const stats = full?.authorStats;
    const posterProfile: UserProfile = {
      id: full?.author?.id ?? post.posterId,
      name: [full?.author?.firstName, full?.author?.lastName].filter(Boolean).join(" ") || post.poster,
      title: full?.author?.role ?? "Member",
      displayPicture: full?.author?.profilePhotoUrl || post.posterAvatar || "",
      bio: "",
      joinedDate: full?.author?.createdAt ? new Date(full.author.createdAt) : new Date(),
      totalPosts: stats?.posts ?? 0,
      totalViews: stats?.views ?? full?.viewCount ?? post.views,
      totalReplies: stats?.replies ?? freshReplyCount,
      totalLikes: stats?.likes ?? freshLikeCount,
      isVerified: full?.author?.isVerified ?? false,
      isModerator: full?.author?.isModerator ?? false,
      rating: 4.5,
    };

    const detailedPost: DetailedDiscussionPost = {
      ...post,
      content: fullContent,
      isSaved: full?.hasBookmarked ?? full?.isBookmarked ?? post.isSaved,
      isReported: full ? !!(full.flaggedAt || full.flagged) : post.isReported,
      likes: freshLikeCount,
      replies: freshReplyCount,
      views: full?.viewCount ?? post.views,
      posterDetails: posterProfile,
      attachments: (full?.attachments ?? []).map((url, idx) => ({
        id: `attachment-${idx}`,
        type: /\.(png|jpe?g|gif|webp|svg)$/i.test(url) ? 'image' : 'file',
        url,
        name: url.split('/').pop() ?? `attachment-${idx + 1}`,
        size: 0,
      })),
      repliesList,
      mentions: [],
    };

    setSelectedPost(detailedPost);
  };
  const handlePosterProfileClick = (
    post: DiscussionPost,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();

    const posterProfile: UserProfile = {
      id: post.posterId,
      name: post.poster,
      title: "Islamic Finance Professional",
      displayPicture: post.posterAvatar || "",
      bio: "",
      joinedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      totalPosts: 0,
      totalViews: 0,
      totalReplies: post.replies,
      totalLikes: post.likes,
      isVerified: false,
      isModerator: false,
      rating: 4.5,
    };

    setSelectedPoster(posterProfile);
    setShowPosterProfile(true);
  };

  const handlePinPost = useCallback(async (postId: string) => {
    const post = discussionPosts.find((p) => p.id === postId);
    if (!post) return;
    try {
      await communityService.updateDiscussion(postId, { isPinned: !post.isPinned });
      setDiscussionPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p)),
      );
    } catch (err) {
      console.error("Failed to pin/unpin post:", err);
    }
  }, [discussionPosts]);

  const handleDeletePost = useCallback((postId: string) => {
    setConfirmDialog({
      message: "Are you sure you want to delete this post? This cannot be undone.",
      onConfirm: async () => {
        try {
          await communityService.deleteDiscussion(postId);
          setDiscussionPosts((prev) => prev.filter((p) => p.id !== postId));
        } catch (err) {
          console.error("Failed to delete post:", err);
          toast.error("Failed to delete post.");
        }
      },
    });
  }, []);

  const handleCreateDiscussion = useCallback(
    async (data: {
      title: string;
      content: string;
      categoryId: string;
      groupId?: string;
      attachments: Attachment[];
      attachmentUrls: string[];
      mentions: string[];
    }) => {
      try {
        const created = await communityService.createDiscussion({
          title: data.title,
          content: data.content,
          categoryId: data.categoryId,
          groupId: data.groupId,
          attachments: data.attachmentUrls.filter((u) => u.trim()),
        });
        setDiscussionPosts((prev) => [
          apiDiscussionToPost(created, apiCategories),
          ...prev,
        ]);
        setShowStartDiscussionModal(false);
      } catch (err) {
        console.error("Failed to create discussion:", err);
        toast.error("Failed to create discussion. Please try again.");
      }
    },
    [apiCategories],
  );

  const handleFlagToggle = useCallback(async (postId: string, currentlyFlagged: boolean) => {
    try {
      if (currentlyFlagged) {
        await communityService.unflagDiscussion(postId);
      } else {
        await communityService.flagDiscussion(postId);
      }
      setDiscussionPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isReported: !currentlyFlagged } : p)),
      );
      setBookmarkedDiscussions((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, isReported: !currentlyFlagged } : p)),
      );
      setFlaggedDiscussions((prev) =>
        {
          if (currentlyFlagged) {
            return prev.filter((p) => p.id !== postId);
          }
          const existing = prev.find((p) => p.id === postId);
          if (existing) {
            return prev.map((p) => (p.id === postId ? { ...p, isReported: true } : p));
          }
          const fromBookmarked = bookmarkedDiscussions.find((p) => p.id === postId);
          const fromDiscussions = discussionPosts.find((p) => p.id === postId);
          const sourcePost = fromBookmarked ?? fromDiscussions;
          return sourcePost ? [{ ...sourcePost, isReported: true }, ...prev] : prev;
        },
      );
      // Also update selectedPost if open in detail view
    } catch (err) {
      console.error("Failed to flag/unflag discussion:", err);
    }
  }, [bookmarkedDiscussions, discussionPosts]);

  const handleToggleJoinRequests = useCallback(async (group: CommunityGroupAPI) => {
    if (expandedRequestGroupId === group.id) {
      setExpandedRequestGroupId(null);
      return;
    }
    setExpandedRequestGroupId(group.id);
    if (joinRequestsById[group.id]) return; // already loaded
    setJoinRequestsLoadingGroupId(group.id);
    try {
      const requests = await communityService.getJoinRequests(group.id);
      setJoinRequestsById((prev) => ({ ...prev, [group.id]: requests }));
    } catch (err) {
      console.error("Failed to load join requests:", err);
    } finally {
      setJoinRequestsLoadingGroupId(null);
    }
  }, [expandedRequestGroupId, joinRequestsById]);

  const handleApproveRequest = useCallback(async (groupId: string, requestId: string) => {
    try {
      await communityService.approveJoinRequest(requestId);
      setJoinRequestsById((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] ?? []).map((r) =>
          r.id === requestId ? { ...r, status: 'approved' as const } : r,
        ),
      }));
    } catch (err) {
      console.error("Failed to approve join request:", err);
    }
  }, []);

  const handleRejectRequest = useCallback(async (groupId: string, requestId: string) => {
    try {
      await communityService.rejectJoinRequest(requestId);
      setJoinRequestsById((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] ?? []).map((r) =>
          r.id === requestId ? { ...r, status: 'rejected' as const } : r,
        ),
      }));
    } catch (err) {
      console.error("Failed to reject join request:", err);
    }
  }, []);

  // Show detail page if post is selected
  const handleBack = useCallback(() => {
    setSelectedPost(null);
    setDiscussionRefreshKey((k) => k + 1);
  }, []);

  if (selectedPost) {
    return (
      <DiscussionDetailPage
        post={selectedPost}
        onBack={handleBack}
        isModerator={isModerator}
        currentUserId={user?.id}
        initialIsLiked={initialLikeForDetail}
        initialLikeInteractionId={initialLikeIdForDetail}
        initialIsFlagged={!!selectedPost.isReported}
        onPin={handlePinPost}
        onDelete={handleDeletePost}
        onReport={handleReport}
        onFlagToggle={isModerator ? handleFlagToggle : undefined}
      />
    );
  }

  // Hover profile card overlay
  const renderHoverCard = () => {
    if (!hoverProfile) return null;
    const { post, pos, x, y } = hoverProfile;
    const style: React.CSSProperties = {
      position: "fixed",
      left: x,
      transform: "translateX(-50%)",
      zIndex: 1000,
    };
    if (pos === "bottom") {
      style.top = y + 8;
    } else {
      style.bottom = window.innerHeight - y + 8;
    }
    return (
      <div
        style={style}
        className="w-64 bg-white rounded-lg shadow-lg p-4"
        onMouseEnter={() => {}}
        onMouseLeave={clearProfileHover}
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-2xl mb-2 overflow-hidden">
            {post.posterAvatar?.startsWith("http")
              ? <img src={post.posterAvatar} alt={post.poster} className="h-full w-full object-cover rounded-full" />
              : <span>{post.posterAvatar || "👤"}</span>}
          </div>
          <h3 className="font-semibold text-[#000000]">{post.poster}</h3>
          <p className="text-xs text-[#737692]">Islamic Finance Professional</p>
          <p className="text-xs text-[#737692]">
            Joined{" "}
            {formatJoinDate(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#737692]">
            <div className="flex flex-col items-center">
              <span className="font-semibold">25</span>
              <span>Posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">85</span>
              <span>Replies</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">1.2k</span>
              <span>Views</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold">340</span>
              <span>Likes</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      {renderHoverCard()}
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
            Community
          </h1>
          <p className="text-[#737692] mt-2">
            Engage with fellow learners, instructor and professional. Ask
            questions, share insights, and grow together within IEFA's learning
            community.
          </p>
        </motion.div>

        {/* Search and Action Button */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-4 flex-col sm:flex-row"
        >
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={
                selectedTab === "mentorship"
                  ? "Search discussions, topics or members"
                  : "Search discussions, topics or members"
              }
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedTab === "discussions" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border-gray-200"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
                <Button
                  onClick={() => setShowStartDiscussionModal(true)}
                  className="bg-[#D52B1E] hover:bg-[#B8241B] text-white"
                >
                  Start a Discussion
                </Button>
              </>
            )}
            {selectedTab === "mentorship" && (
              <Button className="bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                Mentorship
              </Button>
            )}
          </div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs
          defaultValue="discussions"
          className="w-full"
          onValueChange={setSelectedTab}
        >
          <TabsList className="bg-transparent h-auto p-0 mb-6 gap-2 border-b-0 w-full justify-start overflow-x-auto scrollbar-hide -mx-2 px-2 flex-nowrap md:flex-wrap md:overflow-visible md:px-0">
            <TabsTrigger
              value="discussions"
              className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
            >
              Discussions
            </TabsTrigger>
            <TabsTrigger
              value="study-groups"
              className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
            >
              Groups
            </TabsTrigger>
            <TabsTrigger
              value="mentorship"
              className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
            >
              Mentorship
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0"
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="bookmarks"
              className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-[#D52B1E] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-[#D52B1E] shrink-0 flex items-center gap-1.5"
            >
              <Bookmark className="h-3.5 w-3.5" />
              Saved
            </TabsTrigger>
            {isModerator && (
              <TabsTrigger
                value="flagged"
                className="bg-white px-6 py-2 text-sm font-medium data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-full text-[#000000] border border-gray-200 data-[state=active]:border-orange-500 shrink-0 flex items-center gap-1.5"
              >
                <Flag className="h-3.5 w-3.5" />
                Flagged
              </TabsTrigger>
            )}
          </TabsList>

          {/* Discussions Tab */}
          <TabsContent value="discussions" className="mt-6 space-y-6">
            {/* Filter Panel - Creative Design */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-6"
              >
                <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-[#D52B1E]/20 shadow-xl">
                  <CardHeader className="pb-4 bg-gradient-to-r from-[#D52B1E]/5 to-transparent border-b-2 border-[#D52B1E]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#D52B1E] to-[#B8241B] flex items-center justify-center">
                          <Filter className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-[#000000]">
                            Advanced Filters
                          </CardTitle>
                          <p className="text-xs text-[#737692]">
                            Customize your search
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-8">
                    {/* Category Filter - Grid Style */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-gradient-to-b from-[#D52B1E] to-orange-500 rounded-full"></div>
                        <h4 className="font-bold text-[#000000] text-sm uppercase tracking-wider">
                          Category
                        </h4>
                        <span className="text-xs font-semibold text-[#D52B1E] bg-red-50 px-2 py-1 rounded-full">
                          {filters.category ? "1 Selected" : "All"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              category: undefined,
                            }))
                          }
                          className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                            !filters.category
                              ? "bg-gradient-to-r from-[#D52B1E] to-[#B8241B] text-white shadow-lg shadow-red-200"
                              : "bg-gray-100 text-[#000000] hover:bg-gray-200"
                          }`}
                        >
                          All
                        </motion.button>
                        {apiCategories.map((cat) => cat.name).map((category) => (
                          <motion.button
                            key={category}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setFilters((prev) => ({ ...prev, category }))
                            }
                            className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                              filters.category === category
                                ? "bg-gradient-to-r from-[#D52B1E] to-[#B8241B] text-white shadow-lg shadow-red-200"
                                : "bg-gray-100 text-[#000000] hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            {category}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-gray-200 via-[#D52B1E]/20 to-gray-200"></div>

                    {/* Sort By Filter - Modern Radio Style */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-full"></div>
                        <h4 className="font-bold text-[#000000] text-sm uppercase tracking-wider">
                          Sort By
                        </h4>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full capitalize">
                          {filters.sortBy === "latest"
                            ? "Latest"
                            : filters.sortBy === "earliest"
                              ? "Earliest"
                              : filters.sortBy === "mostPopular"
                                ? "Popular"
                                : "Unanswered"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {[
                          {
                            value: "latest",
                            label: "Latest First",
                            icon: "â±ï¸",
                          },
                          {
                            value: "earliest",
                            label: "Oldest First",
                            icon: "ðŸ“œ",
                          },
                          {
                            value: "mostPopular",
                            label: "Most Popular",
                            icon: "ðŸ”¥",
                          },
                          {
                            value: "unanswered",
                            label: "Unanswered",
                            icon: "â“",
                          },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ x: 4 }}
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                sortBy: option.value as any,
                              }))
                            }
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                              filters.sortBy === option.value
                                ? "bg-blue-50 border-2 border-blue-400 text-[#000000]"
                                : "bg-gray-50 border border-gray-200 text-[#737692] hover:bg-gray-100"
                            }`}
                          >
                            <span className="text-lg">{option.icon}</span>
                            <span>{option.label}</span>
                            {filters.sortBy === option.value && (
                              <div className="ml-auto h-5 w-5 rounded-full bg-blue-400 flex items-center justify-center">
                                <span className="text-white text-xs">âœ“</span>
                              </div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-gray-200 via-[#D52B1E]/20 to-gray-200"></div>

                    {/* Time Range Filter - Horizontal Pills */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-6 w-1 bg-gradient-to-b from-green-500 to-green-400 rounded-full"></div>
                        <h4 className="font-bold text-[#000000] text-sm uppercase tracking-wider">
                          Time Range
                        </h4>
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full capitalize">
                          {filters.timeRange === "day"
                            ? "Day"
                            : filters.timeRange === "week"
                              ? "Week"
                              : filters.timeRange === "month"
                                ? "Month"
                                : "All Time"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: "day", label: "ðŸ“… Last Day" },
                          { value: "week", label: "ðŸ“† Last Week" },
                          { value: "month", label: "ðŸ“Š Last Month" },
                          { value: "all", label: "ðŸŒ All Time" },
                        ].map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 0 }}
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                timeRange: option.value as any,
                              }))
                            }
                            className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                              filters.timeRange === option.value
                                ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-200"
                                : "bg-gray-100 text-[#737692] hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            {option.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-gray-200 via-[#D52B1E]/20 to-gray-200"></div>

                    {/* Saved Posts Filter - Toggle Switch Style */}
                    <motion.div
                      whileHover={{ x: 2 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white text-lg">
                          ðŸ’¾
                        </div>
                        <div>
                          <p className="font-semibold text-[#000000]">
                            Saved Posts
                          </p>
                          <p className="text-xs text-[#737692]">
                            Show only bookmarked
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.savedOnly || false}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              savedOnly: e.target.checked,
                            }))
                          }
                          className="sr-only peer"
                        />
                        <div
                          className={`w-11 h-6 rounded-full peer transition-all ${
                            filters.savedOnly ? "bg-purple-500" : "bg-gray-300"
                          } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
                        ></div>
                      </label>
                    </motion.div>

                    {/* Flagged Posts Filter - Moderators only */}
                    {isModerator && (
                      <motion.div
                        whileHover={{ x: 2 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-orange-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white">
                            <Flag className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#000000]">Flagged Posts</p>
                            <p className="text-xs text-[#737692]">Show only flagged</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showFlaggedOnly}
                            onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div
                            className={`w-11 h-6 rounded-full peer transition-all ${
                              showFlaggedOnly ? "bg-orange-500" : "bg-gray-300"
                            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}
                          ></div>
                        </label>
                      </motion.div>
                    )}

                    {/* Clear Filters Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setFilters({ sortBy: "latest", timeRange: "all" });
                        setShowFlaggedOnly(false);
                      }}
                      className="w-full py-3 rounded-lg font-semibold text-sm border-2 border-gray-300 text-[#737692] hover:border-[#D52B1E] hover:text-[#D52B1E] transition-all bg-gray-50 hover:bg-red-50"
                    >
                      ↺ Reset Filters
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* API error */}
            {apiError && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                {apiError}
              </div>
            )}

            {/* Results Count */}
            <motion.div
              variants={itemVariants}
              className="text-sm text-[#737692]"
            >
              Showing {filteredDiscussions.length} of {discussionPosts.length}{" "}
              discussions
            </motion.div>

            {/* Discussions List */}
            <div className="space-y-4">
              {discussionsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border p-6 animate-pulse space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-5 bg-gray-100 rounded-full w-24" />
                    </div>
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                    <div className="flex gap-3 pt-2 border-t">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div className="h-3 bg-gray-100 rounded w-20 mt-2.5" />
                    </div>
                  </div>
                ))
              ) : filteredDiscussions.length > 0 ? (
                filteredDiscussions.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      onClick={() => handlePostClick(post)}
                      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-[#D52B1E]"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-3">
                          {/* Header with Category and Status */}
                          <div className="flex flex-wrap items-center gap-2 justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold text-[#000000]">
                                {post.title}
                              </h3>
                              <Badge
                                className={`${getCategoryColor(post.category)} text-white hover:${getCategoryColor(post.category)}`}
                              >
                                {post.category}
                              </Badge>
                              {post.isAnswered && (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Answered
                                </Badge>
                              )}
                              {post.isPinned && (
                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  Pinned
                                </Badge>
                              )}
                              {isModerator && post.isReported && (
                                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 flex items-center gap-1">
                                  <Flag className="h-3 w-3" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            {isModerator && (
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePinPost(post.id);
                                  }}
                                  className="text-sm text-[#737692] hover:text-[#D52B1E]"
                                >
                                  {post.isPinned ? "Unpin" : "Pin"}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePost(post.id);
                                  }}
                                  className="text-sm text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-[#737692]">
                            {post.description}
                          </p>

                          {/* Poster Info and Metrics */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t">
                            {/* Poster Section */}
                            <div
                              className="flex items-center gap-3 relative"
                              onMouseEnter={(e) => handleProfileHover(post, e)}
                              onMouseLeave={clearProfileHover}
                            >
                              <button
                                onClick={(e) =>
                                  handlePosterProfileClick(post, e)
                                }
                                className="flex-shrink-0 hover:opacity-80 transition-opacity"
                              >
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-lg shadow-sm cursor-pointer overflow-hidden">
                                  {post.posterAvatar?.startsWith("http")
                                    ? <img src={post.posterAvatar} alt={post.poster} className="h-full w-full object-cover rounded-full" />
                                    : <span>{post.posterAvatar || "👤"}</span>}
                                </div>
                              </button>

                              <div className="min-w-0">
                                <button
                                  onClick={(e) =>
                                    handlePosterProfileClick(post, e)
                                  }
                                  className="text-sm font-semibold text-[#000000] hover:text-[#D52B1E] transition-colors"
                                >
                                  {post.poster}
                                </button>
                                <p className="text-xs text-[#737692]">
                                  {formatTime(post.createdAt)}
                                </p>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex items-center gap-4 text-[#737692] flex-wrap justify-end sm:justify-start">
                              <div className="flex items-center gap-1 text-sm">
                                <Eye className="h-4 w-4" />
                                <span>{post.views}</span>
                              </div>
                              <div
                                className="flex items-center gap-1 text-sm cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleLikePost(post.id);
                                }}
                              >
                                <Heart
                                  className={`h-4 w-4 ${likedPosts.includes(post.id) ? "fill-current text-red-500" : ""}`}
                                />
                                <span>
                                  {post.likes +
                                    (likedPosts.includes(post.id) ? 1 : 0)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <MessageSquare className="h-4 w-4" />
                                <span>{post.replies}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShare(post);
                                }}
                                className="flex items-center gap-1 text-sm hover:text-[#D52B1E]"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                              {post.shares > 0 && (
                                <div className="flex items-center gap-1 text-sm">
                                  <span>ðŸ”—</span>
                                  <span>{post.shares}</span>
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isModerator) {
                                    handleFlagToggle(post.id, !!post.isReported);
                                  } else if (!post.isReported) {
                                    handleReport(post.id);
                                  }
                                }}
                                disabled={!isModerator && !!post.isReported}
                                title={isModerator
                                  ? (post.isReported ? 'Unflag this post' : 'Flag this post')
                                  : (post.isReported ? 'Already reported' : 'Report this post')}
                                className={`p-1 rounded transition-colors ${
                                  post.isReported
                                    ? 'text-orange-600'
                                    : 'text-[#737692] hover:text-red-600'
                                } ${!isModerator && post.isReported ? 'cursor-default' : ''}`}
                              >
                                <Flag className={`h-4 w-4 ${post.isReported ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSavePost(post.id);
                                }}
                                title={post.isSaved ? 'Remove bookmark' : 'Save post'}
                                className={`p-1 rounded transition-colors ${
                                  post.isSaved
                                    ? 'text-[#D52B1E]'
                                    : 'text-[#737692] hover:text-[#D52B1E]'
                                }`}
                              >
                                <Bookmark
                                  className={`h-4 w-4 ${post.isSaved ? 'fill-current' : ''}`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <p className="text-[#737692]">
                      No discussions found matching your criteria.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#000000]">Saved Posts</h2>
                <p className="text-sm text-[#737692] mt-0.5">Discussions you&apos;ve bookmarked for later</p>
              </div>
              {!bookmarksLoading && (
                <span className="text-xs font-semibold bg-red-50 text-[#D52B1E] px-3 py-1 rounded-full border border-[#D52B1E]/20">
                  {bookmarkedDiscussions.length} saved
                </span>
              )}
            </div>
            {bookmarksLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-6 animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              ))
            ) : bookmarkedDiscussions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-[#000000]">No saved posts yet</p>
                  <p className="text-sm text-[#737692] mt-1">Bookmark discussions to find them here quickly.</p>
                </CardContent>
              </Card>
            ) : (
              bookmarkedDiscussions.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <Card
                    onClick={() => handlePostClick(post)}
                    className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-[#D52B1E]"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#000000]">{post.title}</h3>
                          <Badge className={`${getCategoryColor(post.category)} text-white hover:${getCategoryColor(post.category)}`}>
                            {post.category}
                          </Badge>
                          {post.isPinned && (
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pinned</Badge>
                          )}
                          {isModerator && post.isReported && (
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              Flagged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#737692] line-clamp-2">{post.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-sm shadow-sm overflow-hidden">
                              {post.posterAvatar?.startsWith('http')
                                ? <img src={post.posterAvatar} alt={post.poster} className="h-full w-full object-cover rounded-full" />
                                : <span>{post.posterAvatar || '👤'}</span>}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#000000]">{post.poster}</p>
                              <p className="text-xs text-[#737692]">{formatTime(post.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-[#737692]">
                            <div className="flex items-center gap-1 text-sm"><Eye className="h-4 w-4" /><span>{post.views}</span></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikePost(post.id);
                              }}
                              className="flex items-center gap-1 text-sm hover:text-red-600 transition-colors"
                              title={likedPosts.includes(post.id) ? "Unlike" : "Like"}
                            >
                              <Heart className={`h-4 w-4 ${likedPosts.includes(post.id) ? "fill-current text-red-500" : ""}`} />
                              <span>{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                            </button>
                            <div className="flex items-center gap-1 text-sm"><MessageSquare className="h-4 w-4" /><span>{post.replies}</span></div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isModerator) {
                                  handleFlagToggle(post.id, !!post.isReported);
                                } else if (!post.isReported) {
                                  handleReport(post.id);
                                }
                              }}
                              disabled={!isModerator && !!post.isReported}
                              title={isModerator
                                ? (post.isReported ? 'Unflag this post' : 'Flag this post')
                                : (post.isReported ? 'Already reported' : 'Report this post')}
                              className={`p-1 rounded transition-colors ${
                                post.isReported
                                  ? 'text-orange-600'
                                  : 'text-[#737692] hover:text-red-600'
                              } ${!isModerator && post.isReported ? 'cursor-default' : ''}`}
                            >
                              <Flag className={`h-4 w-4 ${post.isReported ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleSavePost(post.id); setBookmarkedDiscussions((prev) => prev.filter((p) => p.id !== post.id)); }}
                              className="p-1 rounded text-[#D52B1E] hover:text-red-700 transition-colors"
                              title="Remove bookmark"
                            >
                              <Bookmark className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Flagged Tab — moderators only */}
          {isModerator && (
            <TabsContent value="flagged" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#000000]">Flagged Posts</h2>
                  <p className="text-sm text-[#737692] mt-0.5">Discussions reported or flagged for review</p>
                </div>
                {!flaggedLoading && (
                  <span className="text-xs font-semibold bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                    {flaggedDiscussions.length} flagged
                  </span>
                )}
              </div>
              {flaggedLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-6 animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                  </div>
                ))
              ) : flaggedDiscussions.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Flag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-[#000000]">No flagged posts</p>
                    <p className="text-sm text-[#737692] mt-1">Flagged discussions will appear here for review.</p>
                  </CardContent>
                </Card>
              ) : (
                flaggedDiscussions.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                  >
                    <Card
                      onClick={() => handlePostClick(post)}
                      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-orange-400"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#000000]">{post.title}</h3>
                            <Badge className={`${getCategoryColor(post.category)} text-white hover:${getCategoryColor(post.category)}`}>
                              {post.category}
                            </Badge>
                            <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              Flagged
                            </Badge>
                            {post.isPinned && (
                              <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pinned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-[#737692] line-clamp-2">{post.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-sm shadow-sm overflow-hidden">
                                {post.posterAvatar?.startsWith('http')
                                  ? <img src={post.posterAvatar} alt={post.poster} className="h-full w-full object-cover rounded-full" />
                                  : <span>{post.posterAvatar || '👤'}</span>}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-[#000000]">{post.poster}</p>
                                <p className="text-xs text-[#737692]">{formatTime(post.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-[#737692]">
                              <div className="flex items-center gap-1 text-sm"><Eye className="h-4 w-4" /><span>{post.views}</span></div>
                              <div className="flex items-center gap-1 text-sm"><Heart className="h-4 w-4" /><span>{post.likes}</span></div>
                              <div className="flex items-center gap-1 text-sm"><MessageSquare className="h-4 w-4" /><span>{post.replies}</span></div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFlagToggle(post.id, true);
                                  setFlaggedDiscussions((prev) => prev.filter((p) => p.id !== post.id));
                                }}
                                className="p-1 rounded text-orange-600 hover:text-orange-800 transition-colors"
                                title="Unflag this post"
                              >
                                <Flag className="h-4 w-4 fill-current" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>
          )}

          {/* Study Groups Tab */}
          <TabsContent value="study-groups" className="mt-6">
            {groupsLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border p-5 animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-9 bg-gray-100 rounded-lg mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {groups.map((group, index) => (
                  <motion.div
                    key={group.id ?? index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-[#000000] mb-2">
                              {group.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-sm text-[#737692]">
                              <Users className="h-4 w-4" />
                              <span>{getCommunityGroupMemberCount(group)} members</span>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Active
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {group.description && (
                            <div>
                              <p className="text-sm text-[#737692] mb-1">About</p>
                              <p className="font-medium text-[#000000] text-sm">{group.description}</p>
                            </div>
                          )}
                          {group.topic && (
                            <div>
                              <p className="text-sm text-[#737692] mb-1">Current Topic</p>
                              <p className="font-medium text-[#000000]">{group.topic}</p>
                            </div>
                          )}
                          {group.nextSession && (
                            <div>
                              <p className="text-sm text-[#737692] mb-1">Next Session</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#D52B1E]" />
                                <p className="font-medium text-[#000000]">{group.nextSession}</p>
                              </div>
                            </div>
                          )}
                          <Button
                            className="w-full bg-[#D52B1E] hover:bg-[#B8241B] text-white"
                            onClick={async () => {
                              try {
                                if (group.isMember) {
                                  await communityService.leaveGroup(group.id);
                                  setGroups((prev) =>
                                    prev.map((g) =>
                                      g.id === group.id
                                        ? {
                                            ...g,
                                            isMember: false,
                                            memberCount: Math.max(
                                              0,
                                              getCommunityGroupMemberCount(g) - 1,
                                            ),
                                          }
                                        : g,
                                    ),
                                  );
                                } else if (group.isPrivate) {
                                  await communityService.requestJoinGroup(group.id);
                                  toast.success('Join request sent! The group moderator will review your request.');
                                } else {
                                  await communityService.joinGroup(group.id);
                                  setGroups((prev) =>
                                    prev.map((g) =>
                                      g.id === group.id
                                        ? {
                                            ...g,
                                            isMember: true,
                                            memberCount:
                                              getCommunityGroupMemberCount(g) + 1,
                                          }
                                        : g,
                                    ),
                                  );
                                }
                              } catch (err) {
                                console.error("Failed to join/leave group:", err);
                              }
                            }}
                          >
                            {group.isMember ? 'Leave Group' : group.isPrivate ? 'Request to Join' : 'Join Group'}
                          </Button>
                          {isModerator && group.isPrivate && (
                            <Button
                              variant="outline"
                              className="w-full flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={() => handleToggleJoinRequests(group)}
                            >
                              <Users className="h-4 w-4" />
                              {expandedRequestGroupId === group.id ? 'Hide Requests' : 'Join Requests'}
                              {joinRequestsById[group.id]?.filter((r) => r.status === 'pending').length
                                ? ` (${joinRequestsById[group.id].filter((r) => r.status === 'pending').length})`
                                : ''}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Moderator: expandable join requests panel */}
                    {isModerator && expandedRequestGroupId === group.id && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
                        <h4 className="font-semibold text-amber-800 text-sm">Pending Join Requests</h4>
                        {joinRequestsLoadingGroupId === group.id ? (
                          <p className="text-sm text-amber-700">Loading…</p>
                        ) : (joinRequestsById[group.id] ?? []).filter((r) => r.status === 'pending').length === 0 ? (
                          <p className="text-sm text-amber-700">No pending requests.</p>
                        ) : (
                          (joinRequestsById[group.id] ?? [])
                            .filter((r) => r.status === 'pending')
                            .map((req) => {
                              const name = [req.user?.firstName, req.user?.lastName].filter(Boolean).join(' ') || 'Member';
                              return (
                                <div key={req.id} className="flex items-center justify-between gap-3 bg-white rounded-lg p-3 shadow-sm">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                                      {req.user?.profilePhotoUrl
                                        ? <img src={req.user.profilePhotoUrl} alt={name} className="h-full w-full object-cover" />
                                        : name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-[#000000] text-sm truncate">{name}</p>
                                      <p className="text-xs text-[#737692]">{new Date(req.createdAt).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                                      onClick={() => handleApproveRequest(group.id, req.id)}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-red-300 text-red-600 hover:bg-red-50 text-xs px-3"
                                      onClick={() => handleRejectRequest(group.id, req.id)}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
                {groups.length === 0 && !groupsLoading && (
                  <div className="col-span-2 text-center py-12 text-[#737692]">
                    No groups available yet.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Mentorship Tab */}
          <TabsContent value="mentorship" className="mt-6">
            <div className="grid gap-6 md:grid-cols-4">
              {/* Filter Sidebar */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-[#000000] text-lg">
                      Find a Mentor
                    </CardTitle>
                    <p className="text-sm text-[#737692]">
                      Connect with a experienced professionals and instructors
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Expertise Filter */}
                    <div>
                      <h4 className="font-semibold text-[#000000] mb-3">
                        Expertise
                      </h4>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Filter by Name"
                          className="pl-10 text-sm"
                        />
                      </div>
                    </div>

                    {/* Availability Filter */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[#000000]">
                          Availability
                        </h4>
                        <span className="text-xs text-[#737692]">
                          12 replies
                        </span>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-[#000000]">
                            Takaful
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-[#000000]">Sukuk</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-[#000000]">
                            Shari'ah Audit
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Role Filter */}
                    <div>
                      <h4 className="font-semibold text-[#000000] mb-3">
                        Role (Instructor, Professional)
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-[#000000]">
                            Impact Guidance
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-[#000000]">
                            Career Advice
                          </span>
                        </label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mentors Grid */}
              <div className="md:col-span-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mentors.map((mentor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all h-full">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-4xl">
                            {mentor.image}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#000000]">
                              {mentor.name}
                            </h4>
                            <p className="text-sm text-[#737692]">
                              {mentor.role}
                            </p>
                            <p className="text-xs text-[#737692]">
                              {mentor.organization}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-[#737692]">
                              Available for Mentorship
                            </span>
                          </div>
                          <Button disabled className="w-full bg-[#D52B1E] opacity-60 cursor-not-allowed text-white text-sm">
                            Coming Soon
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6">
            <div className="space-y-4">
              {eventsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-5 w-48 bg-slate-200 rounded" />
                            <div className="h-5 w-20 bg-slate-200 rounded-full" />
                          </div>
                          <div className="h-4 w-56 bg-slate-100 rounded" />
                          <div className="h-4 w-40 bg-slate-100 rounded" />
                        </div>
                        <div className="h-9 w-24 bg-slate-200 rounded-lg" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : events.length === 0 ? (
                <p className="text-center text-[#737692] py-8">No events found.</p>
              ) : (
                events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-[#000000]">
                                {event.title}
                              </h3>
                              {event.type && (
                                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                  {event.type}
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-2">
                              {(event.date ?? event.startDate) && (
                                <div className="flex items-center gap-2 text-sm text-[#737692]">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {event.date ?? event.startDate}
                                    {(event.time ?? event.startTime) &&
                                      ` \u2022 ${event.time ?? event.startTime}`}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-sm text-[#737692]">
                                {event.location && <span>{"\uD83D\uDCCD"} {event.location}</span>}
                                {(event.attendeeCount ?? event.attendees) != null && (
                                  <span>\u2022 {event.attendeeCount ?? event.attendees} registered</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            className={
                              event.isRegistered
                                ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                                : "bg-[#D52B1E] hover:bg-[#B8241B] text-white"
                            }
                            onClick={async () => {
                              try {
                                if (event.isRegistered) {
                                  await communityService.unregisterFromEvent(event.id);
                                } else {
                                  await communityService.registerForEvent(event.id);
                                }
                                setEvents((prev) =>
                                  prev.map((e) =>
                                    e.id === event.id
                                      ? {
                                          ...e,
                                          isRegistered: !e.isRegistered,
                                          attendeeCount:
                                            (e.attendeeCount ?? e.attendees ?? 0) +
                                            (e.isRegistered ? -1 : 1),
                                        }
                                      : e
                                  )
                                );
                              } catch {
                                // ignore registration error
                              }
                            }}
                          >
                            {event.isRegistered ? "Unregister" : "Register"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Start Discussion Modal */}
        <StartDiscussionModal
          isOpen={showStartDiscussionModal}
          onClose={() => setShowStartDiscussionModal(false)}
          categories={apiCategories.map((c) => ({ id: c.id, name: c.name }))}
          groups={joinedGroupsForModal.map((g) => ({ id: g.id, name: g.name }))}
          categoriesLoading={categoriesLoading}
          groupsLoading={groupsLoading}
          onSubmit={handleCreateDiscussion}
        />

        {/* Poster Profile Popup */}
        {selectedPoster && (
          <PosterProfilePopup
            user={selectedPoster}
            isOpen={showPosterProfile}
            onClose={() => {
              setShowPosterProfile(false);
              setSelectedPoster(null);
            }}
          />
        )}

        {/* Confirm Dialog */}
        {confirmDialog && (
          <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)} title="Confirm Action" maxWidth="max-w-sm">
            <p className="text-sm text-slate-600 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
              >
                Confirm
              </Button>
            </div>
          </Dialog>
        )}
      </motion.div>
    </>
  );
}
