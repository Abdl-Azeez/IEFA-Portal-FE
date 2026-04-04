import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
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
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useQueryClient } from "@tanstack/react-query";
import {
  useNews,
  useNewsTags,
  useNewsItem,
  useFeaturedNews,
  useExternalNews,
  type NewsItem,
  type ExternalNewsArticle,
} from "@/hooks/useNews";

/* --- Animation variants -------------------------------------------------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
}

/* --- Helpers for external news ------------------------------------------- */
function getExternalTitle(item: ExternalNewsArticle): string {
  return item.title ?? 'Untitled'
}
function getExternalSource(item: ExternalNewsArticle): string {
  if (!item.source) return 'External'
  if (typeof item.source === 'string') return item.source
  return item.source._ ?? 'External'
}
function getExternalKey(item: ExternalNewsArticle, idx: number): string {
  const g = item.guid
  if (typeof g === 'string') return g
  if (g?._) return g._
  return `ext-${idx}`
}

const EXT_QUERY_KEY = "iefa_ext_news_query";
const DEFAULT_EXT_QUERY = "Islamic finance";

function getStoredExtQuery(): string {
  try {
    return localStorage.getItem(EXT_QUERY_KEY) || DEFAULT_EXT_QUERY;
  } catch {
    return DEFAULT_EXT_QUERY;
  }
}

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
        )
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
function FeaturedSection({
  onOpen,
}: Readonly<{ onOpen: (id: string) => void }>) {
  const { data: featured, isLoading } = useFeaturedNews();
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationMs, setRotationMs] = useState(() =>
    globalThis.window?.matchMedia('(min-width: 768px)').matches ? 6500 : 4500,
  );

  const featuredItems = featured ?? [];

  useEffect(() => {
    if (globalThis.window === undefined) return;
    const media = globalThis.window.matchMedia('(min-width: 768px)');
    const updateRotation = () => setRotationMs(media.matches ? 6500 : 4500);
    updateRotation();
    media.addEventListener('change', updateRotation);
    return () => media.removeEventListener('change', updateRotation);
  }, []);

  useEffect(() => {
    if (activeIndex < featuredItems.length) return;
    setActiveIndex(0);
  }, [activeIndex, featuredItems.length]);

  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const timer = globalThis.window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredItems.length);
    }, rotationMs);
    return () => globalThis.window.clearInterval(timer);
  }, [featuredItems.length, rotationMs]);

  if (isLoading) {
    return (
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-[#D52B1E]" />
          <h2 className="text-xl font-bold text-[#000000]">Featured This Week</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 animate-pulse">
          <div className="md:col-span-2 rounded-2xl bg-gray-200 h-[420px]" />
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-gray-200 flex-1 min-h-[180px]" />
            <div className="rounded-2xl bg-gray-200 flex-1 min-h-[180px]" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (featuredItems.length === 0) return null;

  const main = featuredItems[activeIndex];
  const previousMain = featuredItems[(activeIndex - 1 + featuredItems.length) % featuredItems.length];
  const side = featuredItems
    .map((_, idx) => featuredItems[(activeIndex + idx + 1) % featuredItems.length])
    .filter((story, idx, arr) => arr.findIndex((s) => s.id === story.id) === idx)
    .slice(0, 2);

  return (
    <motion.div variants={itemVariants} className="space-y-4">
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

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative h-80 md:h-[420px]">
          {featuredItems.length > 1 && previousMain.coverImageUrl && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <img
                src={previousMain.coverImageUrl}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover opacity-20 scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/35" />
            </div>
          )}
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={main.id}
              className="absolute inset-0 group rounded-2xl overflow-hidden bg-gray-900 cursor-pointer"
              initial={{ opacity: 0.35, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.35, scale: 1.015 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onOpen(main.id)}
            >
              {main.coverImageUrl ? (
                <img
                  src={main.coverImageUrl}
                  alt={main.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-55 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#D52B1E]/40 to-slate-900">
                  <BookOpen className="h-20 w-20 text-white/20" />
                </div>
              )}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0.35 }}
                animate={{ opacity: [0.35, 0.52, 0.35] }}
                transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                style={{ background: 'radial-gradient(circle at 20% 25%, rgba(255,255,255,0.22), transparent 45%)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-3">
                  {main.tags?.[0] && (
                    <span className="bg-[#D52B1E] text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      {main.tags[0].name}
                    </span>
                  )}
                  {main.tags?.[1] && <span className="text-white/55 text-xs">{main.tags[1].name}</span>}
                </div>
                <h3 className="text-white font-bold text-xl md:text-2xl leading-snug mb-2">{main.title}</h3>
                {main.excerpt && <p className="text-white/65 text-sm leading-relaxed line-clamp-2 mb-4">{main.excerpt}</p>}
                <div className="flex items-center gap-3 text-white/45 text-xs">
                  {main.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {fmtDate(main.publishedAt)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {main.viewCount.toLocaleString()} views
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {featuredItems.length > 1 && (
            <div className="absolute left-4 bottom-4 z-10 flex items-center gap-1.5 rounded-full bg-black/35 backdrop-blur px-2.5 py-1.5">
              {featuredItems.map((story, idx) => (
                <button
                  key={story.id}
                  aria-label={`Show featured story ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all ${idx === activeIndex ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {side.map((story, idx) => (
            <motion.div
              key={story.id}
              className="relative group rounded-2xl overflow-hidden flex-1 bg-gray-900 min-h-[180px] cursor-pointer"
              initial={{ opacity: 0, x: 24, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => onOpen(story.id)}
            >
              {story.coverImageUrl ? (
                <img
                  src={story.coverImageUrl}
                  alt={story.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-45 transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#D52B1E]/30 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {story.tags?.[0] && (
                  <span className="inline-block mb-2 text-xs font-semibold text-[#ff8080] bg-[#D52B1E]/15 px-2 py-0.5 rounded-full">
                    {story.tags[0].name}
                  </span>
                )}
                <h4 className="text-white font-bold text-sm leading-snug line-clamp-2 mb-1">{story.title}</h4>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  {story.publishedAt && <span>{fmtDate(story.publishedAt)}</span>}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {story.viewCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* --- Live Feed Strip ------------------------------------------------------- */
function LiveFeedStrip({
  onOpen,
}: Readonly<{ onOpen: (item: ExternalNewsArticle) => void }>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [query] = useState(() => getStoredExtQuery());
  const { data: externalNews, isLoading } = useExternalNews(query);

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      {/* Label row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <h2 className="text-xl font-bold text-[#000000]">
            Live Market Intelligence
          </h2>
        </div>
        <Badge className="bg-green-50 text-green-700 border-green-200 text-xs font-semibold">
          External Sources
        </Badge>
        <div className="hidden md:flex flex-1 h-px bg-gray-100" />
        <div className="flex items-center gap-1.5 text-xs text-[#737692]">
          <Rss className="h-3 w-3" />
          Google News · RSS Feed
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
          <span>IEFA Official — verified &amp; curated below</span>
        </div>
      </div>

      {/* Horizontal scroll strip */}
      {isLoading && (
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 h-48 rounded-2xl bg-gray-900 animate-pulse opacity-40"
            />
          ))}
        </div>
      )}

      {!isLoading && (!externalNews || externalNews.length === 0) && (
        <div className="flex items-center gap-2 text-sm text-[#737692] py-4">
          <Rss className="h-4 w-4" />
          <span>No live feeds available right now. Check back soon.</span>
        </div>
      )}

      {!isLoading && externalNews && externalNews.length > 0 && (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {externalNews.map((item, idx) => (
            <LiveFeedCard
              key={getExternalKey(item, idx)}
              item={item}
              onOpen={onOpen}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LiveFeedCard({
  item,
  onOpen,
}: Readonly<{
  item: ExternalNewsArticle;
  onOpen: (item: ExternalNewsArticle) => void;
}>) {
  const title = getExternalTitle(item);
  const source = getExternalSource(item);
  const link = item.link;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="flex-shrink-0 w-72 bg-gradient-to-br from-gray-900 to-slate-900 rounded-2xl p-4 border border-white/6 shadow-xl group select-text cursor-pointer"
      onClick={() => onOpen(item)}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
            Live
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-md text-white bg-white/15 truncate max-w-[120px]">
          {source}
        </span>
      </div>

      <div className="h-px bg-white/8 mb-3" />

      {/* Headline */}
      <h4 className="text-white font-semibold text-sm leading-snug line-clamp-3 mb-2 group-hover:text-green-300 transition-colors">
        {title}
      </h4>

      {/* Summary */}
      {item.description && (
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3">
          {item.description}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        {item.pubDate ? (
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {relativeTime(item.pubDate)}
          </span>
        ) : (
          <span />
        )}
        {link && (
          <span className="text-[11px] text-green-500 flex items-center gap-1">
            Read <ArrowRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* --- External Article Overlay ---------------------------------------------- */
function ExternalArticleOverlay({
  item,
  onClose,
}: Readonly<{ item: ExternalNewsArticle; onClose: () => void }>) {
  const title = getExternalTitle(item);
  const source = getExternalSource(item);
  const link = item.link;

  // Known domains that block iframe embedding (Google News redirects, major publishers, etc.)
  const NON_EMBEDDABLE = [
    "news.google.com",
    "reuters.com",
    "bloomberg.com",
    "wsj.com",
    "ft.com",
  ];
  const isNonEmbeddable = !link || NON_EMBEDDABLE.some((d) => link.includes(d));

  const [iframeBlocked, setIframeBlocked] = useState(isNonEmbeddable);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Detect if iframe was blocked after load (best-effort; true cross-origin errors are silent)
  useEffect(() => {
    if (isNonEmbeddable) return;
    const timer = setTimeout(() => {
      try {
        const iw = iframeRef.current?.contentWindow;
        if (!iw) setIframeBlocked(true);
      } catch {
        setIframeBlocked(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [link, isNonEmbeddable]);

  return createPortal(
    <motion.div
      key="ext-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        key="ext-panel"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen bg-white mx-auto max-w-4xl my-0 md:my-8 md:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-5 py-3 gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-[#737692] hover:text-[#000000] transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to News
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              {source}
            </span>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#737692] hover:text-[#000000] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
                Open original
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Article metadata */}
        <div className="px-6 md:px-8 py-5 border-b border-gray-100 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-[#000000] leading-snug mb-3">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#737692]">
            {item.pubDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {fmtDate(item.pubDate, true)}
              </span>
            )}
            <span className="flex items-center gap-1 font-semibold text-green-700">
              <Rss className="h-3.5 w-3.5" />
              External Source — unverified by IEFA
            </span>
          </div>
          {item.description && (
            <p className="mt-3 text-sm text-[#444] leading-relaxed border-l-4 border-green-400 pl-4 bg-green-50/50 py-2 rounded-r-xl">
              {item.description}
            </p>
          )}
        </div>

        {/* Iframe content area */}
        <div
          className="flex-1 relative overflow-hidden"
          style={{ minHeight: "400px" }}
        >
          {iframeBlocked ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 p-8 text-center">
              <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-[#000000] mb-1">
                  Article blocked by publisher
                </p>
                <p className="text-sm text-[#737692]">
                  This publisher does not allow their content to be embedded.
                </p>
              </div>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#D52B1E] hover:bg-[#B8241B] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                  Read full article
                </a>
              )}
            </div>
          ) : link ? (
            <>
              <iframe
                ref={iframeRef}
                src={link}
                title={title}
                className="w-full h-full border-0"
                style={{ minHeight: "500px" }}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                onError={() => setIframeBlocked(true)}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-amber-50/95 border-t border-amber-200 px-4 py-2 flex items-center justify-between gap-3">
                <span className="text-xs text-amber-700 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Content not displaying?
                </span>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-800 font-semibold flex items-center gap-1 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3" /> Open in new tab
                </a>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#737692]">
              <Rss className="h-10 w-10 opacity-30" />
              <p>No link available for this article</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body,
  );
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
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<'' | 'draft' | 'published'>('published')
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'nonFeatured'>('all')
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC')
  const [perPage, setPerPage] = useState(9)
  const [publishedYearFrom, setPublishedYearFrom] = useState('')
  const [publishedYearTo, setPublishedYearTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [openArticleId, setOpenArticleId] = useState<string | null>(null)
  const [openExtArticle, setOpenExtArticle] =
    useState<ExternalNewsArticle | null>(null);
  const queryClient = useQueryClient();

  const closeArticle = () => {
    setOpenArticleId(null);
    queryClient.invalidateQueries({ queryKey: ["news"] });
  };

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

  const yearFromNum = Number.parseInt(publishedYearFrom, 10)
  const yearToNum = Number.parseInt(publishedYearTo, 10)
  const yearFrom = Number.isFinite(yearFromNum) ? yearFromNum : undefined
  const yearTo = Number.isFinite(yearToNum) ? yearToNum : undefined

  const { data: newsData, isLoading } = useNews({
    page,
    perPage,
    search: search || undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    status: statusFilter || undefined,
    order,
    isFeatured:
      featuredFilter === 'all'
        ? undefined
        : featuredFilter === 'featured',
    publishedYearFrom: yearFrom,
    publishedYearTo: yearTo,
  })

  const { data: tags } = useNewsTags()

  const pageCount = newsData?.meta.pageCount ?? 1
  const items = newsData?.data ?? []

  function handleTagClick(tagName: string) {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((tag) => tag !== tagName)
        : [...prev, tagName],
    )
    setPage(1)
  }

  function clearFilters() {
    setSelectedTags([])
    setStatusFilter('published')
    setFeaturedFilter('all')
    setOrder('DESC')
    setPerPage(9)
    setPublishedYearFrom('')
    setPublishedYearTo('')
    setPage(1)
  }

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = []

    if (search.trim()) {
      chips.push({
        key: 'search',
        label: `Search: ${search.trim()}`,
        onRemove: () => {
          setSearchInput('')
          setSearch('')
          setPage(1)
        },
      })
    }

    selectedTags.forEach((tag) => {
      chips.push({
        key: `tag-${tag}`,
        label: `Tag: ${tag}`,
        onRemove: () => {
          setSelectedTags((prev) => prev.filter((t) => t !== tag))
          setPage(1)
        },
      })
    })

    if (statusFilter && statusFilter !== 'published') {
      chips.push({
        key: 'status',
        label: `Status: ${statusFilter}`,
        onRemove: () => {
          setStatusFilter('published')
          setPage(1)
        },
      })
    }

    if (featuredFilter !== 'all') {
      chips.push({
        key: 'featured',
        label:
          featuredFilter === 'featured'
            ? 'Featured only'
            : 'Not featured',
        onRemove: () => {
          setFeaturedFilter('all')
          setPage(1)
        },
      })
    }

    if (order !== 'DESC') {
      chips.push({
        key: 'order',
        label: 'Sort: ASC',
        onRemove: () => {
          setOrder('DESC')
          setPage(1)
        },
      })
    }

    if (perPage !== 9) {
      chips.push({
        key: 'perPage',
        label: `Per page: ${perPage}`,
        onRemove: () => {
          setPerPage(9)
          setPage(1)
        },
      })
    }

    if (publishedYearFrom.trim()) {
      chips.push({
        key: 'yearFrom',
        label: `From: ${publishedYearFrom.trim()}`,
        onRemove: () => {
          setPublishedYearFrom('')
          setPage(1)
        },
      })
    }

    if (publishedYearTo.trim()) {
      chips.push({
        key: 'yearTo',
        label: `To: ${publishedYearTo.trim()}`,
        onRemove: () => {
          setPublishedYearTo('')
          setPage(1)
        },
      })
    }

    return chips
  }, [
    featuredFilter,
    order,
    perPage,
    publishedYearFrom,
    publishedYearTo,
    search,
    selectedTags,
    statusFilter,
  ])

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
              IEFA official intelligence plus live global market feeds — all in
              one place
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
      <FeaturedSection onOpen={setOpenArticleId} />

      {/* Live Market Intelligence */}
      <LiveFeedStrip onOpen={setOpenExtArticle} />

      {/* IEFA Official News */}
      <motion.div variants={itemVariants} className="space-y-5">
        {/* Section header */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 rounded-full bg-[#D52B1E]" />
            <h2 className="text-xl font-bold text-[#000000]">
              IEFA Official News
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#D52B1E] bg-[#D52B1E]/8 px-2.5 py-1 rounded-full font-semibold">
            <Shield className="h-3 w-3" />
            Verified &amp; Curated
          </div>
          <div className="hidden md:flex flex-1 h-px bg-gray-100" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className="h-8 rounded-full border-gray-200 text-[#737692] hover:text-[#D52B1E] hover:border-[#D52B1E]"
          >
            {showAdvancedFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {newsData && (
            <span className="text-sm text-[#737692]">
              {newsData.meta.itemCount.toLocaleString()} articles
            </span>
          )}
        </div>

        {/* API filters */}
        <AnimatePresence initial={false}>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[#000000]">Filter Articles</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-[#737692] hover:text-[#D52B1E]"
                  >
                    Reset Filters
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="text-xs text-[#737692]">
                    Status
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value as '' | 'draft' | 'published')
                        setPage(1)
                      }}
                      className="mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#000000] bg-white"
                    >
                      <option value="">All</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </label>

                  <label className="text-xs text-[#737692]">
                    Featured
                    <select
                      value={featuredFilter}
                      onChange={(e) => {
                        setFeaturedFilter(e.target.value as 'all' | 'featured' | 'nonFeatured')
                        setPage(1)
                      }}
                      className="mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#000000] bg-white"
                    >
                      <option value="all">All</option>
                      <option value="featured">Featured only</option>
                      <option value="nonFeatured">Not featured</option>
                    </select>
                  </label>

                  <label className="text-xs text-[#737692]">
                    Sort Order
                    <select
                      value={order}
                      onChange={(e) => {
                        setOrder(e.target.value as 'ASC' | 'DESC')
                        setPage(1)
                      }}
                      className="mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#000000] bg-white"
                    >
                      <option value="DESC">Newest first (DESC)</option>
                      <option value="ASC">Oldest first (ASC)</option>
                    </select>
                  </label>

                  <label className="text-xs text-[#737692]">
                    Published Year From
                    <Input
                      type="number"
                      min={1900}
                      max={2100}
                      value={publishedYearFrom}
                      onChange={(e) => {
                        setPublishedYearFrom(e.target.value)
                        setPage(1)
                      }}
                      placeholder="e.g. 2024"
                      className="mt-1 h-10 rounded-xl border-gray-200"
                    />
                  </label>

                  <label className="text-xs text-[#737692]">
                    Published Year To
                    <Input
                      type="number"
                      min={1900}
                      max={2100}
                      value={publishedYearTo}
                      onChange={(e) => {
                        setPublishedYearTo(e.target.value)
                        setPage(1)
                      }}
                      placeholder="e.g. 2026"
                      className="mt-1 h-10 rounded-xl border-gray-200"
                    />
                  </label>

                  <label className="text-xs text-[#737692]">
                    Per Page
                    <select
                      value={perPage}
                      onChange={(e) => {
                        setPerPage(Number(e.target.value))
                        setPage(1)
                      }}
                      className="mt-1 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm text-[#000000] bg-white"
                    >
                      <option value={9}>9</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </select>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag filters */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedTags([]);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                selectedTags.length > 0
                  ? "bg-white text-[#737692] border-gray-200 hover:border-[#D52B1E] hover:text-[#D52B1E]"
                  : "bg-[#D52B1E] text-white border-[#D52B1E]"
              }`}
            >
              All
            </button>
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagClick(tag.name)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedTags.includes(tag.name)
                    ? "bg-[#D52B1E] text-white border-[#D52B1E]"
                    : "bg-white text-[#737692] border-gray-200 hover:border-[#D52B1E] hover:text-[#D52B1E]"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Active filters summary */}
        {activeFilterChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <span className="text-xs font-semibold text-[#737692]">Active filters:</span>
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1 rounded-full border border-[#D52B1E]/25 bg-[#D52B1E]/8 px-2.5 py-1 text-xs text-[#D52B1E] hover:bg-[#D52B1E]/14"
                title={`Remove ${chip.label}`}
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-[#737692] hover:text-[#D52B1E]"
            >
              Clear all
            </button>
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
            );
          }
          if (items.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-24 text-[#737692]">
                <BookOpen className="h-12 w-12 mb-4 opacity-30" />
                <p className="text-lg font-medium">No news articles found</p>
                <p className="text-sm mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            );
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
          );
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
            onClose={closeArticle}
          />
        )}
        {openExtArticle && (
          <ExternalArticleOverlay
            key={getExternalKey(openExtArticle, 0)}
            item={openExtArticle}
            onClose={() => setOpenExtArticle(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
