import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Clock,
  Heart,
  Plus,
  List,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from "@/components/ui/button";import { Input } from '@/components/ui/input'
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

const episodes = [
  {
    id: 1,
    title: "Building a career in frontier investment markets",
    duration: "32:18",
    guest: "Investment strategist, Lagos",
    tag: "Career",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnail: "https://picsum.photos/640/360?random=1",
    likes: 45,
    views: 1200,
    uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    title: "Macro volatility: How professionals stay anchored",
    duration: "27:05",
    guest: "Portfolio manager, Abuja",
    tag: "Macro",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnail: "https://picsum.photos/640/360?random=2",
    likes: 32,
    views: 890,
    uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 3,
    title: "Practical steps for better investment committees",
    duration: "24:11",
    guest: "IF professional, London",
    tag: "Governance",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail: "https://picsum.photos/640/360?random=3",
    likes: 28,
    views: 650,
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

const archiveEpisodes = [
  {
    id: 101,
    title: "Season 1 wrap: Lessons from frontier markets",
    duration: "29:04",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnail: "https://picsum.photos/640/360?random=4",
    likes: 67,
    views: 1500,
    guest: "Panel Discussion",
    tag: "Summary",
    uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 102,
    title: "Investor stories from Lagos, Abuja and beyond",
    duration: "34:18",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail: "https://picsum.photos/640/360?random=5",
    likes: 89,
    views: 2100,
    guest: "Multiple Speakers",
    tag: "Stories",
    uploadDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 103,
    title: "From analyst to CIO: A 15‑year journey",
    duration: "41:52",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail: "https://picsum.photos/640/360?random=6",
    likes: 124,
    views: 3200,
    guest: "John Smith",
    tag: "Career",
    uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 104,
    title: "Sukuk market deep dive",
    duration: "38:22",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnail: "https://picsum.photos/640/360?random=7",
    likes: 56,
    views: 1100,
    guest: "Dr. Ahmed",
    tag: "Finance",
    uploadDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: 105,
    title: "ESG and Islamic finance alignment",
    duration: "31:15",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnail: "https://picsum.photos/640/360?random=8",
    likes: 78,
    views: 1800,
    guest: "Prof. Fatima",
    tag: "Sustainability",
    uploadDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
];

export default function Podcast() {
  const [activeId, setActiveId] = useState<number | null>(
    episodes[0]?.id ?? null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [likedVideos, setLikedVideos] = useState<number[]>([]);
  const [playlists, setPlaylists] = useState<
    { id: number; name: string; videos: number[] }[]
  >([{ id: 1, name: "My Favorites", videos: [] }]);

  const [showAddToPlaylist, setShowAddToPlaylist] = useState<number | null>(
    null,
  );
  const [currentPlaylist, setCurrentPlaylist] = useState<number | null>(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6;
  const videoRef = useRef<HTMLVideoElement>(null);

  const allEpisodes = [...episodes, ...archiveEpisodes];
  const activeEpisode =
    allEpisodes.find((e) => e.id === activeId) ?? allEpisodes[0];

  // Pagination
  const totalPages = Math.ceil(allEpisodes.length / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const paginatedEpisodes = allEpisodes.slice(
    startIndex,
    startIndex + videosPerPage,
  );

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleLike = (videoId: number) => {
    setLikedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId],
    );
  };

  const createPlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist = {
        id: Date.now(),
        name: newPlaylistName.trim(),
        videos: [],
      };
      setPlaylists((prev) => [...prev, newPlaylist]);
      setNewPlaylistName("");
      setShowPlaylistModal(false);
    }
  };

  const addToPlaylist = (playlistId: number, videoId: number) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? {
              ...p,
              videos: p.videos.includes(videoId)
                ? p.videos
                : [...p.videos, videoId],
            }
          : p,
      ),
    );
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 10,
        duration,
      );
    }
  };

  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        videoRef.current.currentTime - 10,
        0,
      );
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatUploadDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    if (diffInDays < 30)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    if (diffInMonths < 12)
      return `${diffInMonths} month${diffInMonths > 1 ? "s" : ""} ago`;
    return `${diffInYears} year${diffInYears > 1 ? "s" : ""} ago`;
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
          Podcast
        </h1>
        <p className="mt-2 text-[#737692]">
          Conversations with investors, operators, and policymakers across the
          IEFA community. Listen to career journeys, market debriefs, and
          behind-the-scenes stories.
        </p>
      </motion.div>

      {/* Video Player */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[#D52B1E]/5 via-[#D52B1E]/10 to-[#D52B1E]/5 border-[#D52B1E]/20 overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-[#D52B1E]" />
              <CardTitle className="text-[#000000]">Now Playing</CardTitle>
            </div>
            <CardDescription className="text-[#737692]">
              IEFA Studio · Video conversations that move portfolios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Video Element */}
              <div className="relative bg-black rounded-lg overflow-hidden max-h-96">
                <video
                  ref={videoRef}
                  src={activeEpisode.videoUrl}
                  poster={activeEpisode.thumbnail}
                  className="w-full h-full object-cover max-h-96"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      onClick={skipBackward}
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      onClick={togglePlay}
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={skipForward}
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>

                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-white/80 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-white" />
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-[#000000] text-lg">
                    {activeEpisode.title}
                  </h3>
                  <p className="text-sm text-[#737692]">
                    Guest: {activeEpisode.guest}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-[#D52B1E]/20">
                      {activeEpisode.tag}
                    </Badge>
                    <span className="text-sm text-[#737692] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activeEpisode.duration}
                    </span>
                    <span className="text-sm text-[#737692]">
                      {activeEpisode.views} views
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLike(activeEpisode.id)}
                    className={`flex items-center gap-2 ${likedVideos.includes(activeEpisode.id) ? "text-red-500 border-red-500" : ""}`}
                  >
                    <Heart
                      className={`h-4 w-4 ${likedVideos.includes(activeEpisode.id) ? "fill-current" : ""}`}
                    />
                    {activeEpisode.likes +
                      (likedVideos.includes(activeEpisode.id) ? 1 : 0)}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddToPlaylist(activeEpisode.id)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add to Playlist
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Video Library */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[#000000]">Video Library</CardTitle>
            <CardDescription className="text-[#737692]">
              Browse all IEFA Studio videos. Click to play.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedEpisodes.map((episode, index) => {
                const isActive = activeEpisode.id === episode.id;
                return (
                  <motion.div
                    key={episode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    onClick={() => setActiveId(episode.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      isActive
                        ? "border-[#D52B1E] shadow-lg"
                        : "border-gray-200 hover:border-[#D52B1E]/50"
                    }`}
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      <img
                        src={episode.thumbnail}
                        alt={episode.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/640x360/cccccc/666666?text=Video+Thumbnail";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      {isActive && (
                        <div className="absolute top-2 right-2 bg-[#D52B1E] text-white px-2 py-1 rounded text-xs">
                          Playing
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-[#000000] mb-1 line-clamp-2">
                        {episode.title}
                      </h4>
                      <p className="text-sm text-[#737692] mb-2">
                        {episode.guest}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {episode.tag}
                          </Badge>
                          <span className="text-xs text-[#737692] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {episode.duration}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddToPlaylist(episode.id);
                            }}
                            className="p-1 text-gray-400 hover:text-[#D52B1E]"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(episode.id);
                            }}
                            className={`p-1 ${likedVideos.includes(episode.id) ? "text-red-500" : "text-gray-400"}`}
                          >
                            <Heart
                              className={`h-4 w-4 ${likedVideos.includes(episode.id) ? "fill-current" : ""}`}
                            />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-[#737692]">
                        <span>{formatUploadDate(episode.uploadDate)}</span>
                        <div className="flex items-center gap-2">
                          <span>
                            {episode.likes +
                              (likedVideos.includes(episode.id) ? 1 : 0)}{" "}
                            likes
                          </span>
                          <span>{episode.views} views</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-[#D52B1E] hover:bg-[#B8241B]"
                          : ""
                      }
                    >
                      {page}
                    </Button>
                  ),
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* My Playlists */}
      <motion.div variants={itemVariants}>
        <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#000000]">My Playlists</CardTitle>
                <CardDescription className="text-[#737692]">
                  Create and manage your video collections
                </CardDescription>
              </div>
              <Button
                onClick={() => setShowPlaylistModal(true)}
                className="bg-[#D52B1E] hover:bg-[#B8241B] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Playlist
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <motion.div
                  key={playlist.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                      <List className="h-5 w-5 text-[#D52B1E]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-[#000000]">
                        {playlist.name}
                      </h4>
                      <p className="text-sm text-[#737692]">
                        {playlist.videos.length} videos
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPlaylist(playlist.id)}
                    className="text-[#D52B1E]"
                  >
                    View
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-[#000000]">Add to Playlist</CardTitle>
              <CardDescription className="text-[#737692]">
                Choose a playlist to add this video to
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {playlists.map((playlist) => (
                <Button
                  key={playlist.id}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    addToPlaylist(playlist.id, showAddToPlaylist);
                    setShowAddToPlaylist(null);
                  }}
                >
                  <List className="h-4 w-4 mr-2" />
                  {playlist.name}
                </Button>
              ))}
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowAddToPlaylist(null);
                    setShowPlaylistModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Playlist
                </Button>
              </div>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowAddToPlaylist(null)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Playlist Creation Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-[#000000]">Create New Playlist</CardTitle>
              <CardDescription className="text-[#737692]">
                Give your playlist a name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
              />
              <div className="flex gap-2">
                <Button onClick={createPlaylist} className="bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowPlaylistModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Playlist View */}
      {currentPlaylist && (
        <motion.div variants={itemVariants}>
          <Card className="transition-all duration-300 hover:shadow-xl border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[#000000]">
                  {playlists.find((p) => p.id === currentPlaylist)?.name}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPlaylist(null)}
                >
                  Close
                </Button>
              </div>
              <CardDescription className="text-[#737692]">
                Videos in this playlist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playlists
                  .find((p) => p.id === currentPlaylist)
                  ?.videos.map((videoId) => {
                    const video = allEpisodes.find((v) => v.id === videoId);
                    if (!video) return null;
                    return (
                      <motion.div
                        key={videoId}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setActiveId(videoId)}
                      >
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-[#000000]">
                            {video.title}
                          </h4>
                          <p className="text-sm text-[#737692]">
                            {video.duration}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(videoId);
                          }}
                          className={`p-1 ${likedVideos.includes(videoId) ? "text-red-500" : "text-gray-400"}`}
                        >
                          <Heart
                            className={`h-4 w-4 ${likedVideos.includes(videoId) ? "fill-current" : ""}`}
                          />
                        </Button>
                      </motion.div>
                    );
                  })}
                {playlists.find((p) => p.id === currentPlaylist)?.videos
                  .length === 0 && (
                  <p className="text-[#737692] text-center py-8">
                    No videos in this playlist yet. Add some from the library
                    above!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
