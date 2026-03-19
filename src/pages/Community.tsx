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
  type DiscussionAPI,
  type CommunityGroupAPI,
  type CommunityEventAPI,
  type CommunityCategoryAPI,
} from "@/lib/communityService";
import type {
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

const CATEGORIES: CommunityCategory[] = [
  "Markets & Investing",
  "Savings",
  "Zakat",
  "Every day islamic finance",
  "General Discussion",
  "Q&A",
  "Resources",
];

const categoryColors: Record<CommunityCategory, string> = {
  "Markets & Investing": "bg-[#D52B1E]",
  Savings: "bg-blue-600",
  Zakat: "bg-green-600",
  "Every day islamic finance": "bg-orange-600",
  "General Discussion": "bg-purple-600",
  "Q&A": "bg-yellow-600",
  Resources: "bg-indigo-600",
};

/* -- API â†’ UI mapping helpers ---------------------------------------------- */
function apiDiscussionToPost(
  d: DiscussionAPI,
  apiCategories: CommunityCategoryAPI[],
): DiscussionPost {
  const catName =
    d.category?.name ??
    apiCategories.find((c) => c.id === d.categoryId)?.name ??
    "General Discussion";
  return {
    id: d.id,
    title: d.title,
    description: d.description ?? d.content ?? "",
    category: catName as CommunityCategory,
    poster:
      d.author?.name ?? d.authorName ?? "Unknown",
    posterAvatar: d.author?.avatar ?? d.authorAvatar ?? "ðŸ‘¤",
    posterId: d.author?.id ?? d.authorId ?? "",
    createdAt: new Date(d.createdAt),
    updatedAt: new Date(d.updatedAt),
    replies: d.repliesCount ?? 0,
    views: d.viewsCount ?? 0,
    likes: d.likesCount ?? 0,
    shares: d.sharesCount ?? 0,
    isAnswered: d.isAnswered ?? false,
    isPinned: d.isPinned ?? false,
    isSaved: d.isBookmarked ?? false,
    tags: d.tags,
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
  const [selectedPost, setSelectedPost] =
    useState<DetailedDiscussionPost | null>(null);
  const [showPosterProfile, setShowPosterProfile] = useState(false);
  const [selectedPoster, setSelectedPoster] = useState<UserProfile | null>(
    null,
  );
  const { isModerator } = useAuth();

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
  const [discussionPosts, setDiscussionPosts] = useState<DiscussionPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroupAPI[]>([]);
  const [events, setEvents] = useState<CommunityEventAPI[]>([]);
  const [discussionsLoading, setDiscussionsLoading] = useState(true);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  /** Maps discussionId â†’ likeInteractionId (so we can delete the like later) */
  const likeInteractionIds = useRef<Map<string, string>>(new Map());

  /* -- Load community categories (needed to map categoryId â†’ name) -- */
  useEffect(() => {
    communityService
      .getCategories()
      .then(setApiCategories)
      .catch((err) => console.error("Failed to load community categories:", err));
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
        setDiscussionPosts(data.map((d) => apiDiscussionToPost(d, apiCategories)));
        setApiError(null);
      })
      .catch((err) => {
        console.error("Failed to load discussions:", err);
        setApiError("Failed to load discussions.");
      })
      .finally(() => setDiscussionsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery, apiCategories]);

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

    return filtered;
  }, [discussionPosts, searchQuery, filters, savedPosts]);

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
      alert("Link copied to clipboard!");
    }
  };

  const handleReport = (postId: string) => {
    if (reportedPosts.includes(postId)) {
      alert("You've already reported this post.");
      return;
    }
    setReportedPosts((prev) => [...prev, postId]);
    // stub for backend call
    alert("Thank you. The post has been reported to moderators.");
  };

  const handlePostClick = async (post: DiscussionPost) => {
    let fullContent = post.description;
    let repliesList: import("@/types/community").Reply[] = [];
    try {
      const full = await communityService.getDiscussionById(post.id);
      fullContent = full.content ?? full.description ?? post.description;
      const interactions = full.interactions ?? [];
      repliesList = interactions
        .filter((i) => i.type === "comment")
        .map((i) => ({
          id: i.id,
          postId: post.id,
          userId: "",
          userName: "Member",
          userAvatar: "👤",
          userTitle: "Member",
          content: i.content ?? "",
          createdAt: new Date(),
          updatedAt: new Date(),
          likes: 0,
        }));
    } catch {
      // fall back to list-level data
    }

    const posterProfile: UserProfile = {
      id: post.posterId,
      name: post.poster,
      title: "Islamic Finance Professional",
      displayPicture: post.posterAvatar || "👤",
      bio: "Passionate about Islamic finance education",
      joinedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      totalPosts: 25,
      totalViews: 1200,
      totalReplies: 85,
      totalLikes: 340,
      isVerified: false,
      isModerator: false,
      rating: 4.5,
    };

    const detailedPost: DetailedDiscussionPost = {
      ...post,
      content: fullContent,
      posterDetails: posterProfile,
      attachments: [],
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
      displayPicture: post.posterAvatar || "ðŸ‘¤",
      bio: "Passionate about Islamic finance education",
      joinedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      totalPosts: 25,
      totalViews: 1200,
      totalReplies: 85,
      totalLikes: 340,
      isVerified: Math.random() > 0.5,
      isModerator: Math.random() > 0.8,
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

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await communityService.deleteDiscussion(postId);
      setDiscussionPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Failed to delete post.");
    }
  }, []);

  const handleCreateDiscussion = useCallback(
    async (data: any) => {
      const catId = apiCategories.find((c) => c.name === data.category)?.id;
      try {
        const created = await communityService.createDiscussion({
          title: data.title,
          content: data.content,
          categoryId: catId,
          tags: data.tags,
        });
        setDiscussionPosts((prev) => [
          apiDiscussionToPost(created, apiCategories),
          ...prev,
        ]);
        setShowStartDiscussionModal(false);
      } catch (err) {
        console.error("Failed to create discussion:", err);
        alert("Failed to create discussion. Please try again.");
      }
    },
    [apiCategories],
  );

  // Show detail page if post is selected
  if (selectedPost) {
    return (
      <DiscussionDetailPage
        post={selectedPost}
        onBack={() => setSelectedPost(null)}
        isModerator={isModerator}
        onPin={handlePinPost}
        onDelete={handleDeletePost}
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
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-2xl mb-2">
            {post.posterAvatar}
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
                        {CATEGORIES.map((category) => (
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

                    {/* Clear Filters Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        setFilters({ sortBy: "latest", timeRange: "all" })
                      }
                      className="w-full py-3 rounded-lg font-semibold text-sm border-2 border-gray-300 text-[#737692] hover:border-[#D52B1E] hover:text-[#D52B1E] transition-all bg-gray-50 hover:bg-red-50"
                    >
                      â†º Reset Filters
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
                                className={`${categoryColors[post.category]} text-white hover:${categoryColors[post.category]}`}
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
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-lg shadow-sm cursor-pointer">
                                  {post.posterAvatar}
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
                                  handleReport(post.id);
                                }}
                                className={`p-1 rounded transition-colors ${reportedPosts.includes(post.id) ? "text-red-600" : "text-[#737692] hover:text-red-600"}`}
                              >
                                <Flag className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSavePost(post.id);
                                }}
                                className={`p-1 rounded transition-colors ${
                                  savedPosts.includes(post.id)
                                    ? "text-[#D52B1E]"
                                    : "text-[#737692] hover:text-[#D52B1E]"
                                }`}
                              >
                                <Bookmark
                                  className={`h-4 w-4 ${savedPosts.includes(post.id) ? "fill-current" : ""}`}
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
                              <span>{group.memberCount ?? group.members ?? 0} members</span>
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
                                        ? { ...g, isMember: false, memberCount: (g.memberCount ?? 0) - 1 }
                                        : g,
                                    ),
                                  );
                                } else {
                                  await communityService.joinGroup(group.id);
                                  setGroups((prev) =>
                                    prev.map((g) =>
                                      g.id === group.id
                                        ? { ...g, isMember: true, memberCount: (g.memberCount ?? 0) + 1 }
                                        : g,
                                    ),
                                  );
                                }
                              } catch (err) {
                                console.error("Failed to join/leave group:", err);
                              }
                            }}
                          >
                            {group.isMember ? "Leave Group" : "Join Group"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
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
      </motion.div>
    </>
  );
}
