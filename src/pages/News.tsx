import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import {
  Clock,
  Search,
  Eye,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  User,
  Shield,
  Loader2,
  Rss,
  Star,
  X,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useNews, useNewsTags, useNewsItem, type NewsItem } from '@/hooks/useNews'

/* --- Animation variants -------------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
}

/* --- Static featured stories (editorial API not ready) ------------------- */
interface FeaturedStory {
  id: string
  title: string
  excerpt: string
  category: string
  image: string
  date: string
  readTime: number
  tag: string
}

const FEATURED_STORIES: FeaturedStory[] = [
  {
    id: 'feat-1',
    title: 'The $4 Trillion Shift: Islamic Finance Is Reshaping Global Capital Markets',
    excerpt:
      'As assets under management cross a historic milestone, global portfolio managers, sovereign wealth funds, and development banks are reassessing the role of Shariah-compliant finance in diversified portfolios.',
    category: 'Deep Dive',
    image: 'https://picsum.photos/seed/iefa-f1/800/450',
    date: 'March 10, 2026',
    readTime: 8,
    tag: 'Cover Story',
  },
  {
    id: 'feat-2',
    title: "AAOIFI Releases Updated Shariah Standards for Tokenised Assets and Digital Sukuk",
    excerpt:
      'Landmark guidance on digital sukuk and asset tokenisation sets new benchmarks across jurisdictions and signals regulatory convergence.',
    category: 'Regulation',
    image: 'https://picsum.photos/seed/iefa-f2/400/300',
    date: 'March 9, 2026',
    readTime: 6,
    tag: 'Policy',
  },
  {
    id: 'feat-3',
    title: 'ESG Sukuk: How Islamic Finance Is Leading the Green Bond Evolution',
    excerpt:
      'Record Q1 inflows reveal deep institutional appetite for Shariah-aligned sustainability instruments as ESG mandates go mainstream.',
    category: 'Sustainability',
    image: 'https://picsum.photos/seed/iefa-f3/400/300',
    date: 'March 8, 2026',
    readTime: 5,
    tag: 'ESG',
  },
]

/* --- Static live / external RSS feed ------------------------------------- */
interface ExternalNewsItem {
  id: string
  source: string
  sourceColor: string
  headline: string
  summary: string
  publishedAt: string
  category: string
}

const LIVE_FEED: ExternalNewsItem[] = [
  {
    id: 'ext-1',
    source: 'Reuters',
    sourceColor: '#e85a0e',
    headline: 'Saudi Arabia targets record $15bn sukuk pipeline for 2026',
    summary:
      'The Kingdom capitalises on easing yields and sustained demand from GCC and Southeast Asian sovereign wealth funds.',
    publishedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    category: 'Sukuk',
  },
  {
    id: 'ext-2',
    source: 'Bloomberg',
    sourceColor: '#1a56db',
    headline: "Malaysia's Bank Negara unveils revised Islamic liquidity framework for Q3",
    summary:
      'Updated HQLA definitions for Islamic banks align with Basel IV, effective Q3 2026 across all licensed institutions.',
    publishedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    category: 'Regulation',
  },
  {
    id: 'ext-3',
    source: 'IFN',
    sourceColor: '#059669',
    headline: 'Green sukuk volumes surpass $12bn in Q1 2026, up 40% year-on-year',
    summary:
      'European institutional ESG mandates and SDG alignment fuel record sustainable Islamic bond issuance globally.',
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    category: 'ESG',
  },
  {
    id: 'ext-4',
    source: 'Zawya',
    sourceColor: '#7c3aed',
    headline: 'UAE opens dedicated Shariah-compliant fintech regulatory sandbox',
    summary:
      'CBUAE invites applications for its Islamic fintech accelerator through H1 2026, targeting digital takaful and murabaha platforms.',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    category: 'Fintech',
  },
  {
    id: 'ext-5',
    source: 'Arab News',
    sourceColor: '#dc2626',
    headline: 'Takaful gross contributions reach $36bn as GCC penetration climbs above 3%',
    summary:
      'Islamic insurance sector posts its strongest decade-high growth with Saudi Arabia and UAE leading new corporate adoption.',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: 'Takaful',
  },
  {
    id: 'ext-6',
    source: 'S&P Global',
    sourceColor: '#0369a1',
    headline: "Pakistan's Islamic banking assets cross 25% of total sector",
    summary:
      'With state-bank conversions underway, the sector sets its sights on a 50% share of total banking assets by 2030.',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: 'Banking',
  },
]

/* --- Helpers --------------------------------------------------------------- */
function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins}m ago`
  const hr = Math.floor(mins / 60)
  if (hr < 24) return `${hr}h ago`
  return `${Math.floor(hr / 24)}d ago`
}

function fmtDate(iso: string | null, long = false): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: long ? 'long' : 'short',
    day: 'numeric',
  })
}

/* --- Pager ----------------------------------------------------------------- */
interface PagerProps {
  page: number
  pageCount: number
  onPage: (p: number) => void
}
type PageEntry = { kind: 'page'; value: number } | { kind: 'gap'; id: string }

function Pager({ page, pageCount, onPage }: Readonly<PagerProps>) {
  const entries: PageEntry[] = []
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) entries.push({ kind: 'page', value: i })
  } else {
    entries.push({ kind: 'page', value: 1 })
    if (page > 3) entries.push({ kind: 'gap', id: 'gap-start' })
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++)
      entries.push({ kind: 'page', value: i })
    if (page < pageCount - 2) entries.push({ kind: 'gap', id: 'gap-end' })
    entries.push({ kind: 'page', value: pageCount })
  }
  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="h-8 w-8"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {entries.map((entry) =>
        entry.kind === 'gap' ? (
          <span key={entry.id} className="px-2 text-[#737692] select-none">
            \u2026
          </span>
        ) : (
          <Button
            key={entry.value}
            variant={entry.value === page ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onPage(entry.value)}
            className={`h-8 w-8 ${
              entry.value === page ? 'bg-[#D52B1E] hover:bg-[#B8241B] text-white' : ''
            }`}
          >
            {entry.value}
          </Button>
        ),
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onPage(page + 1)}
        disabled={page === pageCount}
        className="h-8 w-8"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

/* --- Featured This Week ---------------------------------------------------- */
function FeaturedSection() {
  const [main, ...side] = FEATURED_STORIES

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Label row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-[#D52B1E]" />
          <h2 className="text-xl font-bold text-[#000000]">Featured This Week</h2>
        </div>
        <span className="text-sm text-[#737692]">Most impactful stories of the week</span>
        <div className="hidden md:flex flex-1 h-px bg-gray-100" />
        <Badge className="bg-[#D52B1E]/10 text-[#D52B1E] border-0 text-xs font-semibold">
          <Star className="h-3 w-3 mr-1" />
          Editorial Pick
        </Badge>
      </div>

      {/* Magazine layout */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Main story */}
        <div className="md:col-span-2 relative group rounded-2xl overflow-hidden h-80 md:h-[420px] bg-gray-900">
          <img
            src={main.image}
            alt={main.title}
            className="absolute inset-0 w-full h-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#D52B1E] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                {main.tag}
              </span>
              <span className="text-white/55 text-xs">{main.category}</span>
            </div>
            <h3 className="text-white font-bold text-xl md:text-2xl leading-snug mb-2">
              {main.title}
            </h3>
            <p className="text-white/65 text-sm leading-relaxed line-clamp-2 mb-4">
              {main.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/45 text-xs">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {main.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {main.readTime} min read
                </span>
              </div>
              <span className="flex items-center gap-1.5 text-white/70 text-xs bg-white/10 rounded-full px-3 py-1">
                Coming soon
              </span>
            </div>
          </div>
        </div>

        {/* Side stories */}
        <div className="flex flex-col gap-4">
          {side.map((story) => (
            <div
              key={story.id}
              className="relative group rounded-2xl overflow-hidden flex-1 bg-gray-900 min-h-[180px]"
            >
              <img
                src={story.image}
                alt={story.title}
                className="absolute inset-0 w-full h-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="inline-block mb-2 text-xs font-semibold text-[#ff8080] bg-[#D52B1E]/15 px-2 py-0.5 rounded-full">
                  {story.tag}
                </span>
                <h4 className="text-white font-bold text-sm leading-snug line-clamp-2 mb-1">
                  {story.title}
                </h4>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <span>{story.date}</span>
                  <span>·</span>
                  <span>{story.readTime} min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* --- Live Feed Strip ------------------------------------------------------- */
function LiveFeedStrip() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Label row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <h2 className="text-xl font-bold text-[#000000]">Live Market Intelligence</h2>
        </div>
        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs font-semibold">
          External Sources
        </Badge>
        <div className="hidden md:flex flex-1 h-px bg-gray-100" />
        <div className="flex items-center gap-1.5 text-xs text-[#737692]">
          <Rss className="h-3 w-3" />
          Reuters · Bloomberg · IFN · Zawya · Arab News · S&P
        </div>
      </div>

      {/* Design key */}
      <div className="flex items-center gap-4 text-xs text-[#737692]">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>Live external feed — unverified by IEFA</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
          <Shield className="h-3 w-3 text-[#D52B1E]" />
          <span>IEFA Official — verified & curated below</span>
        </div>
      </div>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {LIVE_FEED.map((item) => (
          <LiveFeedCard key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  )
}

function LiveFeedCard({ item }: Readonly<{ item: ExternalNewsItem }>) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 w-72 bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl p-4 border border-white/6 shadow-xl cursor-default group select-text"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live</span>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-md text-white"
          style={{ backgroundColor: item.sourceColor }}
        >
          {item.source}
        </span>
      </div>

      <div className="h-px bg-white/8 mb-3" />

      {/* Headline */}
      <h4 className="text-white font-semibold text-sm leading-snug line-clamp-3 mb-2 group-hover:text-green-300 transition-colors">
        {item.headline}
      </h4>

      {/* Summary */}
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
        {item.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium text-white/80"
          style={{ backgroundColor: `${item.sourceColor}28` }}
        >
          {item.category}
        </span>
        <span className="text-[11px] text-gray-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {relativeTime(item.publishedAt)}
        </span>
      </div>
    </motion.div>
  )
}

/* --- IEFA Official Card ---------------------------------------------------- */
function OfficialCard({ item, onOpen }: Readonly<{ item: NewsItem; onOpen: () => void }>) {
  const authorName = item.author
    ? `${item.author.firstName} ${item.author.lastName}`
    : 'IEFA Editorial'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="h-full cursor-pointer group"
      onClick={onOpen}
    >
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Cover */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#D52B1E]/8 to-[#D52B1E]/3 shrink-0">
          {item.coverImageUrl ? (
            <img
              src={item.coverImageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-14 w-14 text-[#D52B1E]/20" />
            </div>
          )}
          {/* IEFA Official badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#D52B1E] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md">
            <Shield className="h-3 w-3" />
            IEFA Official
          </div>
          {item.tags?.[0] && (
            <span className="absolute top-3 right-3 bg-black/45 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
              {item.tags[0].name}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-[#737692] mb-2">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {fmtDate(item.publishedAt)}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <Eye className="h-3 w-3" />
              {item.viewCount.toLocaleString()}
            </span>
          </div>

          {/* Title */}
          <h4 className="font-bold text-[#000000] text-sm leading-snug line-clamp-2 mb-2 group-hover:text-[#D52B1E] transition-colors">
            {item.title}
          </h4>

          {/* Excerpt */}
          {item.excerpt && (
            <p className="text-xs text-[#737692] line-clamp-3 flex-1">{item.excerpt}</p>
          )}

          {/* Additional tags */}
          {item.tags && item.tags.length > 1 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(1, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs text-[#737692] border border-gray-200 rounded-full px-2 py-0.5"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2 text-xs text-[#737692]">
              <div className="h-6 w-6 rounded-full bg-[#D52B1E]/10 flex items-center justify-center">
                <User className="h-3 w-3 text-[#D52B1E]" />
              </div>
              <span className="truncate max-w-[110px]">{authorName}</span>
            </div>
            <span className="text-xs text-[#D52B1E] font-semibold flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
              Read more <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* --- Skeleton -------------------------------------------------------------- */
const SKEL_IDS = ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'] as const

function NewsCardSkeleton() {
  return (
    <div className="rounded-2xl border bg-white overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  )
}

/* --- Article Detail Overlay ----------------------------------------------- */
function ArticleDetail({ id, onClose }: Readonly<{ id: string; onClose: () => void }>) {
  const { data: article, isLoading, error } = useNewsItem(id)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const authorName = article?.author
    ? `${article.author.firstName} ${article.author.lastName}`
    : 'IEFA Editorial'

  const readTime = article?.content
    ? Math.max(1, Math.ceil(article.content.replaceAll(/<[^>]*>/g, '').split(' ').length / 200))
    : 0

  return createPortal(
    <motion.div
      key="article-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        key="article-panel"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen bg-white mx-auto max-w-3xl my-0 md:my-8 md:rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-5 py-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-[#737692] hover:text-[#000000] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to News
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#D52B1E] bg-[#D52B1E]/8 px-3 py-1.5 rounded-full font-semibold">
              <Shield className="h-3 w-3" />
              IEFA Official
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-[#D52B1E]" />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-[#737692]">
            <BookOpen className="h-10 w-10 mb-3 opacity-30" />
            <p className="font-medium">Could not load this article</p>
            <p className="text-sm mt-1">Please try again later</p>
          </div>
        )}

        {/* Content */}
        {article && (
          <>
            {article.coverImageUrl && (
              <div className="h-64 md:h-80 bg-gray-100 overflow-hidden">
                <img
                  src={article.coverImageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="px-6 md:px-10 py-8">
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-xs bg-[#D52B1E]/10 text-[#D52B1E] px-3 py-1 rounded-full font-medium"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-[#000000] leading-tight mb-5">
                {article.title}
              </h1>

              {/* Author + meta */}
              <div className="flex flex-wrap items-center gap-4 pb-5 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-[#D52B1E]/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-[#D52B1E]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#000000]">{authorName}</p>
                    <p className="text-xs text-[#737692]">IEFA Team</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#737692] ml-auto">
                  {article.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {fmtDate(article.publishedAt, true)}
                    </span>
                  )}
                  {readTime > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {readTime} min read
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {article.viewCount.toLocaleString()} views
                  </span>
                </div>
              </div>

              {/* Lead / excerpt */}
              {article.excerpt && (
                <p className="text-base text-[#444] leading-relaxed mb-6 font-medium border-l-4 border-[#D52B1E] pl-4 bg-[#D52B1E]/4 py-3 rounded-r-xl">
                  {article.excerpt}
                </p>
              )}

              {/* Body */}
              <div
                className="text-[#333] leading-relaxed text-sm [&>p]:mb-4 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-2 [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body,
  )
}

/* --- Main Page ------------------------------------------------------------- */
export function News() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [page, setPage] = useState(1)
  const [openArticleId, setOpenArticleId] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: newsData, isLoading } = useNews({
    page,
    perPage: 9,
    search: search || undefined,
    tags: selectedTag ? [selectedTag] : undefined,
    status: 'published',
  })

  const { data: tags } = useNewsTags()

  const pageCount = newsData?.meta.pageCount ?? 1
  const items = newsData?.data ?? []

  function handleTagClick(tagName: string) {
    setSelectedTag((prev) => (prev === tagName ? '' : tagName))
    setPage(1)
  }

  function handlePage(p: number) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <motion.div
      className="space-y-10"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page header */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
              News &amp; Insights
            </h1>
            <p className="mt-1.5 text-[#737692]">
              IEFA official intelligence plus live global market feeds — all in one place
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737692]" />
            <Input
              placeholder="Search IEFA news\u2026"
              className="pl-10 h-10 text-sm rounded-xl bg-white border-gray-200"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
        </div>
      </motion.div>

      {/* Featured This Week */}
      <FeaturedSection />

      {/* Live Market Intelligence */}
      <LiveFeedStrip />

      {/* IEFA Official News */}
      <motion.div variants={itemVariants} className="space-y-5">
        {/* Section header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-[#D52B1E]" />
            <h2 className="text-xl font-bold text-[#000000]">IEFA Official News</h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#D52B1E] bg-[#D52B1E]/8 px-2.5 py-1 rounded-full font-semibold">
            <Shield className="h-3 w-3" />
            Verified &amp; Curated
          </div>
          <div className="hidden md:flex flex-1 h-px bg-gray-100" />
          {newsData && (
            <span className="text-sm text-[#737692]">
              {newsData.meta.itemCount.toLocaleString()} articles
            </span>
          )}
        </div>

        {/* Tag filters */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedTag('')
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedTag
                  ? 'bg-white text-[#737692] border-gray-200 hover:border-[#D52B1E] hover:text-[#D52B1E]'
                  : 'bg-[#D52B1E] text-white border-[#D52B1E]'
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTag === tag.name
                    ? 'bg-[#D52B1E] text-white border-[#D52B1E]'
                    : 'bg-white text-[#737692] border-gray-200 hover:border-[#D52B1E] hover:text-[#D52B1E]'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {(() => {
          if (isLoading) {
            return (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {SKEL_IDS.map((id) => (
                  <NewsCardSkeleton key={id} />
                ))}
              </div>
            )
          }
          if (items.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-24 text-[#737692]">
                <BookOpen className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">No news articles found</p>
                <p className="text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )
          }
          return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <OfficialCard
                  key={item.id}
                  item={item}
                  onOpen={() => setOpenArticleId(item.id)}
                />
              ))}
            </div>
          )
        })()}

        {/* Pagination */}
        {!isLoading && pageCount > 1 && (
          <Pager page={page} pageCount={pageCount} onPage={handlePage} />
        )}
      </motion.div>

      {/* Article detail overlay */}
      <AnimatePresence>
        {openArticleId && (
          <ArticleDetail
            key={openArticleId}
            id={openArticleId}
            onClose={() => setOpenArticleId(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
