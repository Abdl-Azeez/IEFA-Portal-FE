import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from 'react'
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
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Mic2,
  Loader2,
  Globe,
  Rss,
  Headphones,
  Check,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  usePodcastShows,
  usePodcastEpisodes,
  usePlaylists,
  useCreatePlaylist,
  useDeletePlaylist,
  useAddEpisodeToPlaylist,
  useRemoveEpisodeFromPlaylist,
} from '@/hooks/usePodcasts'
import type { PodcastShow, PodcastEpisode, Playlist } from '@/hooks/usePodcasts'

/* --- Animation variants -------------------------------------------------- */
const fade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}
const slideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const cardIn = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
}

/* --- Helpers --------------------------------------------------------------- */
function getThumb(ep: PodcastEpisode): string {
  return (
    ep.thumbnailUrl ??
    ep.coverImageUrl ??
    (ep as any).thumbnail ??
    `https://picsum.photos/seed/${ep.id}/640/360`
  )
}

function formatTime(t: number): string {
  if (!isFinite(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* --- ShowCard -------------------------------------------------------------- */
function ShowCard({
  show,
  active,
  onClick,
}: {
  show: PodcastShow
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex-shrink-0 w-44 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 shadow-md ${
        active
          ? 'ring-[3px] ring-[#D52B1E] ring-offset-2 shadow-[#D52B1E]/30 shadow-lg'
          : 'hover:shadow-lg'
      }`}
    >
      <div className="aspect-square bg-gray-200 relative">
        <img
          src={show.coverImageUrl ?? `https://picsum.photos/seed/${show.id}/300/300`}
          alt={show.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = `https://picsum.photos/seed/${show.id}/300/300`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {active && (
          <div className="absolute top-2.5 right-2.5 bg-[#D52B1E] rounded-full p-1.5 shadow-lg">
            <div className="flex gap-0.5 items-end h-3">
              <div className="w-0.5 bg-white rounded-full animate-bounce" style={{ height: '40%', animationDelay: '0ms' }} />
              <div className="w-0.5 bg-white rounded-full animate-bounce" style={{ height: '100%', animationDelay: '150ms' }} />
              <div className="w-0.5 bg-white rounded-full animate-bounce" style={{ height: '60%', animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
        <p className="text-white font-semibold text-sm leading-tight line-clamp-2">{show.title}</p>
        {show.category && (
          <p className="text-white/65 text-xs mt-0.5 truncate">{show.category}</p>
        )}
      </div>
    </motion.button>
  )
}

/* --- EpisodeCard ----------------------------------------------------------- */
function EpisodeCard({
  episode,
  active,
  onPlay,
  onLike,
  liked,
  onAddToPlaylist,
}: {
  episode: PodcastEpisode
  active: boolean
  onPlay: () => void
  onLike: () => void
  liked: boolean
  onAddToPlaylist: () => void
}) {
  const thumb = getThumb(episode)
  return (
    <motion.div
      variants={cardIn}
      className={`rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group bg-white ${
        active
          ? 'border-[#D52B1E] shadow-lg shadow-[#D52B1E]/15'
          : 'border-gray-100 hover:border-[#D52B1E]/35 hover:shadow-md'
      }`}
      onClick={onPlay}
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative overflow-hidden">
        <img
          src={thumb}
          alt={episode.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = `https://picsum.photos/seed/${episode.id}/640/360`
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3.5 border border-white/40">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>
        {active && (
          <div className="absolute top-2 left-2 bg-[#D52B1E] text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            Now Playing
          </div>
        )}
        {(episode as any).duration && (
          <div className="absolute bottom-2 right-2 bg-black/65 text-white text-xs px-2 py-0.5 rounded-md font-medium">
            {(episode as any).duration}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <h4 className="font-semibold text-[#000000] text-sm leading-snug line-clamp-2 mb-1.5">
          {episode.title}
        </h4>
        {(episode as any).guest && (
          <p className="text-xs text-[#737692] mb-2 flex items-center gap-1">
            <Mic2 className="h-3 w-3 flex-shrink-0" />
            {(episode as any).guest}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {(episode as any).tag && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 border-[#D52B1E]/30 text-[#D52B1E]"
              >
                {(episode as any).tag}
              </Badge>
            )}
            {(episode as any).views && (
              <span className="text-xs text-[#737692]">
                {(episode as any).views.toLocaleString()} views
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAddToPlaylist()
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-[#D52B1E] hover:bg-red-50 transition-colors"
              title="Add to playlist"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onLike()
              }}
              className={`p-1.5 rounded-lg transition-colors ${
                liked
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
              title="Like"
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* --- Pager ---------------------------------------------------------------- */
function Pager({
  page,
  total,
  onChange,
}: {
  page: number
  total: number
  onChange: (p: number) => void
}) {
  if (total <= 1) return null
  const pages: (number | '...')[] = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(total - 1, page + 1); i++) pages.push(i)
    if (page < total - 2) pages.push('...')
    pages.push(total)
  }
  return (
    <div className="flex items-center justify-center gap-1 pt-5">
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 rounded-lg"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="text-gray-400 text-sm px-0.5">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            className={`h-8 w-8 rounded-lg text-xs font-medium ${
              p === page ? 'bg-[#D52B1E] hover:bg-[#B8241B] border-[#D52B1E] text-white' : ''
            }`}
            onClick={() => onChange(p as number)}
          >
            {p}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-2.5 rounded-lg"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

/* --- Main Podcast Component ----------------------------------------------- */
export default function Podcast() {
  /* Data */
  const { data: showsResponse, isLoading: showsLoading } = usePodcastShows()
  const shows: PodcastShow[] = (showsResponse as any)?.data ?? []

  const [activeShowId, setActiveShowId] = useState<string | null>(null)
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All')

  // Derive unique categories from shows for the filter tabs
  const showCategories = ['All', ...Array.from(new Set(shows.map(s => s.category).filter(Boolean) as string[]))]
  const filteredShows = activeCategoryFilter === 'All' ? shows : shows.filter(s => s.category === activeCategoryFilter)

  const { data: episodesData, isLoading: epsLoading } = usePodcastEpisodes(
    activeShowId ?? undefined,
  )
  const episodes: PodcastEpisode[] = Array.isArray(episodesData)
    ? episodesData
    : (episodesData as any)?.data ?? []

  /* Playlist API */
  const { data: apiPlaylists = [], isLoading: playlistsLoading } = usePlaylists()
  const playlists = apiPlaylists as Playlist[]
  const createPlaylistMutation = useCreatePlaylist()
  const deletePlaylistMutation = useDeletePlaylist()
  const addEpisodeMutation = useAddEpisodeToPlaylist()
  const removeEpisodeMutation = useRemoveEpisodeFromPlaylist()

  /* Player state */
  const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  /* UI state */
  const [likedEpisodes, setLikedEpisodes] = useState<string[]>([])
  const [addToPlaylistEpisode, setAddToPlaylistEpisode] = useState<PodcastEpisode | null>(null)
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [expandedPlaylist, setExpandedPlaylist] = useState<string | null>(null)
  const showsScrollRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  const EPS_PER_PAGE = 6;
  const PL_PER_PAGE = 5;
  const [epPage, setEpPage] = useState(1);
  const [playlistPage, setPlaylistPage] = useState(1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  /* Reset episode when show changes */
  useEffect(() => {
    setActiveEpisode(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setEpPage(1);
  }, [activeShowId])

  /* Auto-select first episode when episode list loads */
  useEffect(() => {
    if (episodes.length > 0 && !activeEpisode) {
      setActiveEpisode(episodes[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodes.length, activeShowId])

  /* Video controls */
  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) videoRef.current.pause()
    else videoRef.current.play()
    setIsPlaying(!isPlaying)
  }

  const skipBy = (secs: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.currentTime + secs, duration),
    )
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) setCurrentTime(videoRef.current.currentTime)
  }
  const handleLoaded = () => {
    if (videoRef.current) setDuration(videoRef.current.duration)
  }
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value)
    if (videoRef.current) videoRef.current.currentTime = t
    setCurrentTime(t)
  }
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    setMuted(v === 0)
    if (videoRef.current) videoRef.current.volume = v
  }
  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    if (videoRef.current) videoRef.current.volume = next ? 0 : volume
  }

  /* Likes */
  const toggleLike = (id: string) => {
    setLikedEpisodes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  /* Playlists */
  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return
    createPlaylistMutation.mutate(
      { name: newPlaylistName.trim() },
      {
        onSuccess: () => {
          setNewPlaylistName('')
          setShowCreatePlaylist(false)
        },
      },
    )
  }

  const scrollShows = (dir: 'left' | 'right') => {
    showsScrollRef.current?.scrollBy({
      left: dir === 'right' ? 220 : -220,
      behavior: 'smooth',
    })
  }

  const activeShow = shows.find((s) => s.id === activeShowId) ?? null

  return (
    <motion.div
      className="space-y-8 pb-10"
      initial="hidden"
      animate="visible"
      variants={fade}
    >
      {/* HERO */}
      <motion.div
        variants={slideUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-[#1c0505] to-gray-900 p-8 md:p-12 min-h-[220px] flex items-center"
      >
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#D52B1E]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#D52B1E]/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 bg-[#D52B1E]/20 text-[#D52B1E] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D52B1E]/30 mb-4 tracking-widest uppercase">
            <Mic2 className="h-3 w-3" /> IEFA Podcast Studio
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
            Stories that move <span className="text-[#D52B1E]">portfolios</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
            Conversations with investors, operators, and policymakers across the
            IEFA community — career journeys, market debriefs, and
            behind-the-scenes stories.
          </p>
          <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4 text-gray-600" />
              {shows.length} Shows
            </span>
            <span className="h-1 w-1 bg-gray-700 rounded-full" />
            <span className="flex items-center gap-1.5">
              <Mic2 className="h-4 w-4 text-gray-600" />
              New episodes weekly
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute right-8 bottom-4 opacity-5 text-white select-none hidden md:block">
          <Headphones className="h-52 w-52" />
        </div>
      </motion.div>

      {/* SHOWS SHELF */}
      <motion.div variants={slideUp}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#000000]">Shows</h2>
            <p className="text-sm text-[#737692] mt-0.5">
              Pick a show to browse its episodes
            </p>
          </div>
          {shows.length > 3 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => scrollShows("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => scrollShows("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Category filter tabs */}
        {!showsLoading && showCategories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {showCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategoryFilter(cat)
                  // Only deselect the active show if it won't appear in the new filter
                  if (cat !== 'All' && activeShowId) {
                    const activeShow = shows.find((s) => s.id === activeShowId)
                    if (activeShow && activeShow.category !== cat) {
                      setActiveShowId(null)
                    }
                  }
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                  activeCategoryFilter === cat
                    ? 'bg-[#D52B1E] border-[#D52B1E] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#D52B1E]/40 hover:text-[#D52B1E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {showsLoading ? (
          <div className="flex items-center justify-center h-44">
            <Loader2 className="h-6 w-6 animate-spin text-[#D52B1E] mr-2" />
            <span className="text-[#737692]">Loading shows…</span>
          </div>
        ) : shows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-44 bg-gray-50 rounded-2xl text-[#737692]">
            <Mic2 className="h-10 w-10 mb-2 opacity-25" />
            <p className="font-medium">No shows available yet</p>
          </div>
        ) : filteredShows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-44 bg-gray-50 rounded-2xl text-[#737692]">
            <Mic2 className="h-10 w-10 mb-2 opacity-25" />
            <p className="font-medium">No shows in this category</p>
          </div>
        ) : (
          <div
            ref={showsScrollRef}
            className="flex gap-4 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredShows.map((show) => (
              <ShowCard
                key={show.id}
                show={show}
                active={activeShowId === show.id}
                onClick={() =>
                  setActiveShowId(activeShowId === show.id ? null : show.id)
                }
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* EMPTY STATE */}
      <AnimatePresence>
        {!activeShow && !showsLoading && filteredShows.length > 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-[#737692]"
          >
            <div className="bg-gray-50 border border-gray-100 rounded-full p-7 mb-4 shadow-inner">
              <Headphones className="h-12 w-12 opacity-30" />
            </div>
            <p className="font-semibold text-base">Select a show above</p>
            <p className="text-sm mt-1">
              Choose a show to start exploring its episodes
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACTIVE SHOW DETAIL */}
      <AnimatePresence>
        {activeShow && (
          <motion.div
            key={activeShow.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Show banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0">
                <img
                  src={
                    activeShow.coverImageUrl ??
                    `https://picsum.photos/seed/${activeShow.id}/800/400`
                  }
                  alt=""
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://picsum.photos/seed/${activeShow.id}/800/400`;
                  }}
                />
                <div className="absolute inset-0 backdrop-blur-2xl bg-black/65" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row gap-5 p-6 md:p-8">
                <img
                  src={
                    activeShow.coverImageUrl ??
                    `https://picsum.photos/seed/${activeShow.id}/200/200`
                  }
                  alt={activeShow.title}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-xl object-cover shadow-2xl flex-shrink-0 border-2 border-white/10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://picsum.photos/seed/${activeShow.id}/200/200`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    <Badge className="bg-[#D52B1E]/25 text-[#ff6b6b] border-[#D52B1E]/40 text-xs font-semibold">
                      {activeShow.category}
                    </Badge>
                    <Badge className="bg-white/10 text-white/75 border-white/20 text-xs">
                      {activeShow.language?.toUpperCase()}
                    </Badge>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1.5">
                    {activeShow.title}
                  </h2>
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-4">
                    {activeShow.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {activeShow.spotifyUrl && (
                      <a
                        href={activeShow.spotifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-green-300 hover:text-green-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Headphones className="h-3 w-3" />
                        Spotify
                      </a>
                    )}
                    {activeShow.appleUrl && (
                      <a
                        href={activeShow.appleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Headphones className="h-3 w-3" />
                        Apple Podcasts
                      </a>
                    )}
                    {activeShow.rssFeedUrl && (
                      <a
                        href={activeShow.rssFeedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-orange-300 hover:text-orange-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <Rss className="h-3 w-3" />
                        RSS Feed
                      </a>
                    )}
                    {!activeShow.spotifyUrl &&
                      !activeShow.appleUrl &&
                      !activeShow.rssFeedUrl && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 bg-white/10 px-3 py-1.5 rounded-full">
                          <Globe className="h-3 w-3" />
                          IEFA Exclusive
                        </span>
                      )}
                    <button
                      onClick={() => setActiveShowId(null)}
                      className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors ml-auto"
                    >
                      <X className="h-3 w-3" />
                      Close show
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video player */}
            <AnimatePresence>
              {activeEpisode && (
                <motion.div
                  ref={playerRef}
                  key={activeEpisode.id + "-player"}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl overflow-hidden bg-gray-950 shadow-2xl border border-white/5"
                >
                  <div className="relative bg-black" style={{ maxHeight: 480 }}>
                    <video
                      ref={videoRef}
                      src={(activeEpisode as any).videoUrl}
                      poster={getThumb(activeEpisode)}
                      className="w-full object-contain"
                      style={{ maxHeight: 480 }}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoaded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onEnded={() => setIsPlaying(false)}
                    />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-16 pb-4 px-4">
                      <div className="mb-2.5">
                        <input
                          type="range"
                          min={0}
                          max={duration || 0}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1 appearance-none bg-white/25 rounded-full cursor-pointer accent-[#D52B1E]"
                        />
                        <div className="flex justify-between text-[11px] text-white/55 mt-1">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => skipBy(-10)}
                          className="text-white/65 hover:text-white transition-colors"
                          title="Rewind 10s"
                        >
                          <SkipBack className="h-5 w-5" />
                        </button>
                        <button
                          onClick={togglePlay}
                          className="bg-[#D52B1E] hover:bg-[#c0241a] text-white rounded-full p-2.5 transition-colors shadow-lg"
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 fill-white" />
                          )}
                        </button>
                        <button
                          onClick={() => skipBy(10)}
                          className="text-white/65 hover:text-white transition-colors"
                          title="Forward 10s"
                        >
                          <SkipForward className="h-5 w-5" />
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={toggleMute}
                          className="text-white/65 hover:text-white transition-colors"
                        >
                          {muted ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={muted ? 0 : volume}
                          onChange={handleVolume}
                          className="w-20 h-1 appearance-none bg-white/25 rounded-full cursor-pointer accent-[#D52B1E]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-base leading-snug">
                        {activeEpisode.title}
                      </h3>
                      {(activeEpisode as any).guest && (
                        <p className="text-gray-400 text-sm mt-0.5 flex items-center gap-1">
                          <Mic2 className="h-3.5 w-3.5 flex-shrink-0" />
                          {(activeEpisode as any).guest}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {(activeEpisode as any).tag && (
                          <Badge className="bg-[#D52B1E]/20 text-[#ff7070] border-[#D52B1E]/30 text-xs">
                            {(activeEpisode as any).tag}
                          </Badge>
                        )}
                        {(activeEpisode as any).duration && (
                          <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {(activeEpisode as any).duration}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                      <button
                        onClick={() => toggleLike(activeEpisode.id)}
                        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${
                          likedEpisodes.includes(activeEpisode.id)
                            ? "border-red-500 text-red-400 bg-red-500/10"
                            : "border-white/20 text-white/55 hover:border-red-500/50 hover:text-red-400"
                        }`}
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${likedEpisodes.includes(activeEpisode.id) ? "fill-current" : ""}`}
                        />
                        {(activeEpisode as any).likes !== undefined
                          ? (activeEpisode as any).likes +
                            (likedEpisodes.includes(activeEpisode.id) ? 1 : 0)
                          : "Like"}
                      </button>
                      <button
                        onClick={() => setAddToPlaylistEpisode(activeEpisode)}
                        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-white/20 text-white/55 hover:border-[#D52B1E]/50 hover:text-[#D52B1E] transition-all"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Save
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Episodes grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#000000]">
                  Episodes
                  {episodes.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-[#737692]">
                      ({episodes.length})
                    </span>
                  )}
                </h3>
              </div>

              {epsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-[#D52B1E] mr-2" />
                  <span className="text-[#737692]">Loading episodes…</span>
                </div>
              ) : episodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl text-[#737692]">
                  <Mic2 className="h-10 w-10 mb-2 opacity-25" />
                  <p className="font-medium">No episodes for this show yet</p>
                </div>
              ) : (
                <>
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  >
                    {episodes
                      .slice((epPage - 1) * EPS_PER_PAGE, epPage * EPS_PER_PAGE)
                      .map((ep) => (
                        <EpisodeCard
                          key={ep.id}
                          episode={ep}
                          active={activeEpisode?.id === ep.id}
                          onPlay={() => {
                            setActiveEpisode(ep);
                            setTimeout(
                              () =>
                                playerRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                }),
                              100,
                            );
                          }}
                          onLike={() => toggleLike(ep.id)}
                          liked={likedEpisodes.includes(ep.id)}
                          onAddToPlaylist={() => setAddToPlaylistEpisode(ep)}
                        />
                      ))}
                  </motion.div>
                  <Pager
                    page={epPage}
                    total={Math.ceil(episodes.length / EPS_PER_PAGE)}
                    onChange={setEpPage}
                  />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MY PLAYLISTS */}
      <motion.div variants={slideUp}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-[#000000]">My Playlists</h2>
            <p className="text-sm text-[#737692] mt-0.5">
              Build and manage your episode collections
            </p>
          </div>
          <Button
            onClick={() => setShowCreatePlaylist(true)}
            className="bg-[#D52B1E] hover:bg-[#B8241B] text-white rounded-xl shadow-md"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Playlist
          </Button>
        </div>

        {playlistsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-[#D52B1E] mr-2" />
            <span className="text-[#737692]">Loading playlists…</span>
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-14 bg-gray-50 rounded-2xl text-[#737692] border border-dashed border-gray-200">
            <div className="bg-white rounded-full p-4 shadow-sm mb-3 border border-gray-100">
              <List className="h-8 w-8 opacity-25" />
            </div>
            <p className="font-semibold">No playlists yet</p>
            <p className="text-sm mt-1 text-center max-w-xs">
              Create a playlist to organise and revisit your favourite episodes
            </p>
            <Button
              onClick={() => setShowCreatePlaylist(true)}
              variant="outline"
              className="mt-4 rounded-xl border-[#D52B1E]/30 text-[#D52B1E] hover:bg-[#D52B1E]/5"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Create my first playlist
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {playlists
                .slice(
                  (playlistPage - 1) * PL_PER_PAGE,
                  playlistPage * PL_PER_PAGE,
                )
                .map((playlist) => (
                  <motion.div
                    key={playlist.id}
                    variants={cardIn}
                    layout
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer select-none"
                      onClick={() =>
                        setExpandedPlaylist(
                          expandedPlaylist === playlist.id ? null : playlist.id,
                        )
                      }
                    >
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#D52B1E]/15 to-[#D52B1E]/5 flex items-center justify-center flex-shrink-0 border border-[#D52B1E]/10">
                        <List className="h-5 w-5 text-[#D52B1E]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#000000] truncate">
                          {playlist.name}
                        </h4>
                        <p className="text-sm text-[#737692]">
                          {playlist.episodes?.length ?? 0}{" "}
                          {(playlist.episodes?.length ?? 0) === 1
                            ? "episode"
                            : "episodes"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePlaylistMutation.mutate(playlist.id);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete playlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight
                          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                            expandedPlaylist === playlist.id ? "rotate-90" : ""
                          }`}
                        />
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {expandedPlaylist === playlist.id && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden border-t border-gray-100"
                        >
                          <div className="p-4 space-y-1.5 max-h-72 overflow-y-auto">
                            {(playlist.episodes ?? []).length === 0 ? (
                              <p className="text-sm text-[#737692] text-center py-5">
                                No episodes yet — add some from the shows above!
                              </p>
                            ) : (
                              (playlist.episodes ?? []).map((ep) => (
                                <motion.div
                                  key={ep.id}
                                  layout
                                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <img
                                    src={getThumb(ep)}
                                    alt={ep.title}
                                    className="w-14 h-10 object-cover rounded-lg flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        `https://picsum.photos/seed/${ep.id}/120/80`;
                                    }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#000000] truncate">
                                      {ep.title}
                                    </p>
                                    {(ep as any).duration && (
                                      <p className="text-xs text-[#737692] flex items-center gap-1 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {(ep as any).duration}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      removeEpisodeMutation.mutate({
                                        playlistId: playlist.id,
                                        episodeId: ep.id,
                                      })
                                    }
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Remove from playlist"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </motion.div>
            <Pager
              page={playlistPage}
              total={Math.ceil(playlists.length / PL_PER_PAGE)}
              onChange={(p) => {
                setPlaylistPage(p);
                setExpandedPlaylist(null);
              }}
            />
          </>
        )}
      </motion.div>

      {/* ADD TO PLAYLIST MODAL */}
      {createPortal(
        <AnimatePresence>
          {addToPlaylistEpisode && (
            <motion.div
              key="add-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setAddToPlaylistEpisode(null)}
            >
              <motion.div
                key="add-modal"
                initial={{ scale: 0.88, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 16 }}
                transition={{ duration: 0.22 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#000000]">
                        Add to Playlist
                      </h3>
                      <p className="text-xs text-[#737692] mt-0.5 line-clamp-1">
                        {addToPlaylistEpisode.title}
                      </p>
                    </div>
                    <button
                      onClick={() => setAddToPlaylistEpisode(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-3 space-y-1 max-h-56 overflow-y-auto">
                  {playlists.length === 0 ? (
                    <p className="text-sm text-[#737692] text-center py-5">
                      No playlists yet
                    </p>
                  ) : (
                    playlists.map((pl) => {
                      const isIn = (pl.episodes ?? []).some(
                        (e) => e.id === addToPlaylistEpisode.id,
                      );
                      return (
                        <button
                          key={pl.id}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                          onClick={() => {
                            if (!isIn)
                              addEpisodeMutation.mutate({
                                playlistId: pl.id,
                                episodeId: addToPlaylistEpisode.id,
                              });
                            setAddToPlaylistEpisode(null);
                          }}
                        >
                          <div
                            className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isIn ? "bg-[#D52B1E]/10" : "bg-gray-100"
                            }`}
                          >
                            {isIn ? (
                              <Check className="h-4 w-4 text-[#D52B1E]" />
                            ) : (
                              <List className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                          <span className="flex-1 text-sm font-medium text-[#000000]">
                            {pl.name}
                          </span>
                          {isIn && (
                            <span className="text-xs text-[#D52B1E] font-medium">
                              Added
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>

                <div className="p-3 border-t border-gray-100">
                  <button
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#D52B1E]/5 transition-colors text-left"
                    onClick={() => {
                      setAddToPlaylistEpisode(null);
                      setShowCreatePlaylist(true);
                    }}
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center flex-shrink-0">
                      <Plus className="h-4 w-4 text-[#D52B1E]" />
                    </div>
                    <span className="text-sm font-semibold text-[#D52B1E]">
                      Create new playlist
                    </span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* CREATE PLAYLIST MODAL */}
      {createPortal(
        <AnimatePresence>
          {showCreatePlaylist && (
            <motion.div
              key="create-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreatePlaylist(false)}
            >
              <motion.div
                key="create-modal"
                initial={{ scale: 0.88, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.88, opacity: 0, y: 16 }}
                transition={{ duration: 0.22 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-[#000000]">New Playlist</h3>
                  <button
                    onClick={() => {
                      setShowCreatePlaylist(false);
                      setNewPlaylistName("");
                    }}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-5 space-y-4">
                  <Input
                    placeholder="e.g. Morning Finance Briefing"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleCreatePlaylist()
                    }
                    autoFocus
                    className="rounded-xl"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleCreatePlaylist}
                      disabled={
                        !newPlaylistName.trim() ||
                        createPlaylistMutation.isPending
                      }
                      className="flex-1 bg-[#D52B1E] hover:bg-[#B8241B] text-white rounded-xl"
                    >
                      {createPlaylistMutation.isPending && (
                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                      )}
                      Create Playlist
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreatePlaylist(false);
                        setNewPlaylistName("");
                      }}
                      className="rounded-xl"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.div>
  );
}
