import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { TrendingUp, ChevronUp, Play, Clock, BookOpen, ChevronRight, Calculator, Coins, Wrench, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useExternalNews, type ExternalNewsArticle } from '@/hooks/useNews'
import { toast } from '@/hooks/use-toast'
import { useAcademyDashboard } from '@/hooks/useAcademy'
import { Progress, getProgressGradient } from '@/components/ui/progress'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const
    }
  }
}

// Circular Progress Component with Gradient (full circle)
interface CircularProgressProps {
  percentage: number
  label: string
  centerText: string
  id: string
}

function CircularProgress({ percentage, label, centerText, id }: CircularProgressProps) {
  const radius = 70
  const strokeWidth = 12
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <div className="relative w-32 h-32 sm:w-44 sm:h-44">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
          <defs>
            <linearGradient id={`progressGradient-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D52B1E" />
              <stop offset="100%" stopColor="#6F1610" />
            </linearGradient>
          </defs>
          {/* Progress circle - full circle with gradient */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            stroke={`url(#progressGradient-${id})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            className="text-sm font-medium text-[#000000] text-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {centerText}
          </motion.span>
        </div>
      </div>
      <p className="mt-1 text-sm text-[#737692]">{label}</p>
    </motion.div>
  )
}

// Course Suggestions Data
const courseSuggestions = [
  {
    title: 'Introduction to Islamic Finance',
    duration: '2h 30m',
    lessons: 12,
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&h=200&fit=crop',
    progress: 0,
  },
  {
    title: 'Sukuk Investment Strategies',
    duration: '3h 15m',
    lessons: 18,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    progress: 45,
  },
  {
    title: 'Risk Management in Halal Investing',
    duration: '1h 45m',
    lessons: 8,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    progress: 80,
  },
]

// Stock Data
const stockData = {
  topGainers: [
    { symbol: 'DANGOTE', company: 'Dangote Cement Ltd', price1: '1,7888.29', price2: '1,7888.29', trend: 'up' as const },
    { symbol: 'BUA', company: 'Bua Cement Ltd', price1: '1,7888.29', price2: '1,7888.29', trend: 'up' as const },
    { symbol: 'MTNN', company: 'MTN Nigeria comm', price1: '1,7888.29', price2: '1,7888.29', trend: 'up' as const },
  ],
  topLosers: [
    { symbol: 'NESTLE', company: 'Nestle Nigeria Plc', price1: '1,2500.00', price2: '1,2350.00', trend: 'down' as const },
    { symbol: 'GUINNESS', company: 'Guinness Nigeria Plc', price1: '890.50', price2: '875.20', trend: 'down' as const },
    { symbol: 'UNILEVER', company: 'Unilever Nigeria Plc', price1: '450.00', price2: '435.80', trend: 'down' as const },
  ],
  mostActive: [
    { symbol: 'GTCO', company: 'Guaranty Trust Holding', price1: '45.50', price2: '46.20', trend: 'up' as const },
    { symbol: 'ZENITH', company: 'Zenith Bank Plc', price1: '38.90', price2: '39.10', trend: 'up' as const },
    { symbol: 'ACCESS', company: 'Access Holdings Plc', price1: '22.30', price2: '22.00', trend: 'down' as const },
  ],
}

interface DashboardNewsItem {
  id: string
  title: string
  content: string
  image: string
  link?: string
  source: string
  publishedAt?: string
}

const DASHBOARD_NEWS_QUERY = 'Islamic finance OR sukuk OR takaful'

function hashString(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function getExternalSourceLabel(article: ExternalNewsArticle): string {
  if (!article.source) return 'Global Feed'
  if (typeof article.source === 'string') return article.source
  return article.source._ || 'Global Feed'
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function summarizeExternalNews(article: ExternalNewsArticle): string {
  const text = stripHtml(article.description ?? '')
  if (!text) return 'Fresh market intelligence from the live external news feed.'
  return text.length > 150 ? `${text.slice(0, 147).trim()}...` : text
}

function buildNewsPalette(seed: number) {
  const palettes = [
    ['#7A1C12', '#D52B1E', '#F4A261', '#FCE7D7'],
    ['#123C69', '#2A6F97', '#61A5C2', '#EAF4F4'],
    ['#113A2D', '#2D6A4F', '#74C69D', '#E9F7EF'],
    ['#3D1F47', '#7B2CBF', '#C77DFF', '#F3E8FF'],
    ['#5A2A0C', '#BC6C25', '#DDA15E', '#FEFAE0'],
  ] as const
  return palettes[seed % palettes.length]
}

function getKeywordCluster(title: string): string[] {
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3)

  return words.slice(0, 3).map((word) => word.toUpperCase())
}

function createDashboardNewsImage(article: ExternalNewsArticle, index: number): string {
  const title = article.title ?? 'Islamic Finance'
  const source = getExternalSourceLabel(article)
  const seed = hashString(`${title}-${source}-${index}`)
  const [base, accent, glow, paper] = buildNewsPalette(seed)
  const keywordCluster = getKeywordCluster(title)
  const angle = seed % 360
  const circleX = 70 + (seed % 220)
  const circleY = 60 + ((seed >> 3) % 120)
  const squareX = 220 + ((seed >> 5) % 100)
  const squareY = 20 + ((seed >> 7) % 100)
  const lines = [title.slice(0, 26), title.slice(26, 58)].filter(Boolean)
  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${base}" />
          <stop offset="55%" stop-color="${accent}" />
          <stop offset="100%" stop-color="${glow}" />
        </linearGradient>
        <radialGradient id="halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${paper}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${paper}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)" />
      <g opacity="0.16">
        <circle cx="${circleX}" cy="${circleY}" r="190" fill="url(#halo)" />
        <rect x="${squareX}" y="${squareY}" width="280" height="280" rx="48" fill="${paper}" transform="rotate(${angle} 360 160)" />
        <path d="M-40 510 C 140 400, 320 580, 520 470 S 820 420, 860 520 L 860 640 L -40 640 Z" fill="${paper}" />
      </g>
      <g opacity="0.18" stroke="${paper}" stroke-width="2" fill="none">
        <path d="M80 110 H300" />
        <path d="M80 142 H270" />
        <path d="M80 174 H240" />
        <path d="M510 96 H700" />
        <path d="M510 128 H670" />
      </g>
      <rect x="54" y="50" width="148" height="34" rx="17" fill="rgba(255,255,255,0.18)" />
      <text x="128" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="16" fill="#FFFFFF" letter-spacing="2">LIVE FEED</text>
      <text x="54" y="406" font-family="Georgia, serif" font-size="18" fill="${paper}" opacity="0.92">${source.slice(0, 28).replace(/&/g, '&amp;')}</text>
      ${keywordCluster
        .map(
          (word, wordIndex) => `<text x="54" y="${460 + wordIndex * 32}" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF" opacity="0.92">${word.replace(/&/g, '&amp;')}</text>`,
        )
        .join('')}
      <text x="54" y="250" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#FFFFFF">${lines[0]?.replace(/&/g, '&amp;') ?? ''}</text>
      <text x="54" y="294" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#FFFFFF">${lines[1]?.replace(/&/g, '&amp;') ?? ''}</text>
      <circle cx="694" cy="468" r="56" fill="rgba(255,255,255,0.16)" />
      <path d="M670 468 h48 M694 444 v48" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.85" />
    </svg>
  `

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`
}

function mapExternalArticleToDashboardNews(
  article: ExternalNewsArticle,
  index: number,
): DashboardNewsItem {
  const source = getExternalSourceLabel(article)
  const id = article.link || article.title || `external-${index}`

  return {
    id,
    title: article.title ?? 'Untitled external news',
    content: summarizeExternalNews(article),
    image: createDashboardNewsImage(article, index),
    link: article.link,
    source,
    publishedAt: article.pubDate,
  }
}

// Stock Table Component
interface StockTableProps {
  data: { symbol: string; company: string; price1: string; price2: string; trend: 'up' | 'down' }[]
}

function StockTable({ data }: StockTableProps) {
  return (
    <div>
      {data.map((stock, index) => (
        <motion.div
          key={stock.symbol}
          className={`py-3 sm:py-4 ${index !== data.length - 1 ? 'border-b border-gray-200' : ''}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + index * 0.1 }}
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#000000] truncate">{stock.symbol}</p>
              <p className="text-xs text-[#D52B1E] truncate">{stock.company}</p>
            </div>
            <div className="flex items-center gap-1 justify-center">
              <span className="text-xs sm:text-sm font-medium text-[#000000]">{stock.price1}</span>
              <ChevronUp className={`h-3 w-3 sm:h-4 sm:w-4 ${stock.trend === 'up' ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
            </div>
            <div className="flex items-center gap-1 justify-center">
              <span className="text-xs sm:text-sm font-medium text-[#000000]">{stock.price2}</span>
              <ChevronUp className={`h-3 w-3 sm:h-4 sm:w-4 ${stock.trend === 'up' ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// News Card Component
interface NewsCardProps {
  news: DashboardNewsItem
}

function NewsCard({ news }: NewsCardProps) {
  return (
    <div className="flex flex-col h-full w-full flex-shrink-0">
      <div className="rounded-xl overflow-hidden mb-4 aspect-[4/3] shadow-[0_18px_50px_-24px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2 mb-2 text-[11px] uppercase tracking-[0.18em] text-[#D52B1E] font-semibold">
        <span>{news.source}</span>
        {news.publishedAt && <span className="text-[#737692] tracking-normal normal-case">{new Date(news.publishedAt).toLocaleDateString()}</span>}
      </div>
      <h3 className="text-base font-semibold text-[#000000] mb-2 leading-tight">
        {news.title}
      </h3>
      <p className="text-sm text-[#737692] mb-3 line-clamp-4">
        {news.content}
      </p>
      {news.link ? (
        <a
          href={news.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline underline-offset-2 text-left hover:text-primary/80 transition-colors"
        >
          Read More
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="text-sm font-medium text-primary/70">Live update</span>
      )}
    </div>
  )
}

function progressColor(pct: number): string {
  if (pct >= 75) return '#16a34a'
  if (pct >= 50) return '#84cc16'
  if (pct >= 25) return '#f59e0b'
  return '#D52B1E'
}

export function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { data: externalNews = [], isLoading: externalNewsLoading } = useExternalNews(DASHBOARD_NEWS_QUERY)
  const { data: academyDashboard } = useAcademyDashboard()

  const combinedProgress = useMemo(() => {
    const enrollments = academyDashboard?.enrollments ?? []
    if (enrollments.length === 0) return 0
    const total = enrollments.reduce((sum, e) => sum + (e.progress ?? 0), 0)
    return Math.round(total / enrollments.length)
  }, [academyDashboard])
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const userDisplayName = useMemo(() => {
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
    if (fullName) return fullName
    if (user?.email) return user.email.split('@')[0]
    return 'there'
  }, [user?.email, user?.firstName, user?.lastName])

  const liveNews = useMemo(
    () => externalNews.slice(0, 6).map(mapExternalArticleToDashboardNews),
    [externalNews],
  )

  const requireAuth = (feature: string) => {
    if (isAuthenticated) return true
    toast({
      title: 'Login required',
      description: `Please login to ${feature}.`,
    })
    navigate('/login', { state: { from: `${location.pathname}${location.search}` } })
    return false
  }

  const infiniteNews = useMemo(() => {
    if (liveNews.length === 0) return []
    if (liveNews.length === 1) return [...liveNews, ...liveNews]
    return [...liveNews, ...liveNews]
  }, [liveNews])

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-slide news every 5 seconds
  useEffect(() => {
    if (liveNews.length <= 1) return undefined

    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [liveNews.length]);

  useEffect(() => {
    setCurrentNewsIndex(0)
    setIsTransitioning(true)
  }, [liveNews.length])

  // Reset to beginning when reaching the end of the duplicated section
  useEffect(() => {
    if (liveNews.length > 0 && currentNewsIndex >= liveNews.length) {
      // Wait for transition to complete
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentNewsIndex(0);
        // Re-enable transition after reset
        setTimeout(() => setIsTransitioning(true), 50);
      }, 600); // Match transition duration
    }
  }, [currentNewsIndex, liveNews.length]);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
            Hello, <span className="text-primary">{userDisplayName}!</span>
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#737692]">
            Track your learning progress and see assets and trends
          </p>
        </div>
      </motion.div>

      {/* Main Top Section - Two Columns */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Left Column - Stock Table & Progress Bars */}
        <div className="space-y-6">
          {/* Stock Table with Tabs */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-transparent shadow-none border-0">
              <CardContent className="p-0">
                <Tabs defaultValue="topGainers" className="w-full">
                  <TabsList className="bg-transparent h-auto p-0 mb-6 gap-0 flex-wrap">
                    <TabsTrigger
                      value="topGainers"
                      className="bg-transparent px-0 mr-4 sm:mr-8 pb-2 text-xs sm:text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent"
                    >
                      Top Gainers
                    </TabsTrigger>
                    <TabsTrigger
                      value="topLosers"
                      className="bg-transparent px-0 mr-4 sm:mr-8 pb-2 text-xs sm:text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent"
                    >
                      Top Losers
                    </TabsTrigger>
                    <TabsTrigger
                      value="mostActive"
                      className="bg-transparent px-0 pb-2 text-xs sm:text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:text-[#D52B1E] data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#D52B1E] rounded-none text-[#737692] hover:bg-transparent"
                    >
                      Most Active
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="topGainers" className="mt-0">
                    <StockTable data={stockData.topGainers} />
                  </TabsContent>
                  <TabsContent value="topLosers" className="mt-0">
                    <StockTable data={stockData.topLosers} />
                  </TabsContent>
                  <TabsContent value="mostActive" className="mt-0">
                    <StockTable data={stockData.mostActive} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Bars Section */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 py-4 sm:py-6">
              {/* Circular combined progress */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <CircularProgress
                  percentage={combinedProgress}
                  label="Current Learning Progress"
                  centerText={`${combinedProgress}% Done`}
                  id="learning"
                />
              </div>

              {/* Per-course breakdown */}
              <div className="flex-1 min-w-0 w-full space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#737692]">Top Courses</p>
                  {(academyDashboard?.enrollments?.length ?? 0) > 3 && (
                    <button
                      type="button"
                      onClick={() => navigate('/academy')}
                      className="text-xs font-medium text-[#D52B1E] hover:underline shrink-0"
                    >
                      View all {academyDashboard?.enrollments?.length} →
                    </button>
                  )}
                </div>
                {academyDashboard?.enrollments && academyDashboard.enrollments.length > 0 ? (
                  [...academyDashboard.enrollments]
                    .sort((a, b) => b.progress - a.progress)
                    .slice(0, 3)
                    .map((enrollment) => (
                      <div key={enrollment.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium text-[#000000] line-clamp-1 flex-1 min-w-0">{enrollment.title}</p>
                          <span className="text-xs font-bold shrink-0" style={{ color: progressColor(enrollment.progress) }}>
                            {enrollment.progress}%
                          </span>
                        </div>
                        <Progress
                          value={enrollment.progress}
                          className="h-1.5 bg-gray-100"
                          indicatorStyle={getProgressGradient(enrollment.progress)}
                        />
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-[#737692] py-2">No enrolled courses yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - News Slider */}
        <motion.div variants={itemVariants} className="overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D52B1E]">
                Live News Wire
              </p>
              <h2 className="text-lg font-semibold text-[#000000]">
                External Islamic finance headlines
              </h2>
            </div>
          </div>

          {externalNewsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="space-y-4 animate-pulse">
                  <div className="aspect-[4/3] rounded-xl bg-gray-200" />
                  <div className="h-3 w-24 rounded bg-gray-100" />
                  <div className="h-5 w-full rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-100" />
                  <div className="h-4 w-2/3 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : infiniteNews.length > 0 ? (
            <motion.div
              className="flex gap-4 sm:gap-6"
              animate={{
                x: isMobile
                  ? `calc(-${currentNewsIndex * 100}% - ${currentNewsIndex * 16}px)`
                  : `calc(-${currentNewsIndex * 50}% - ${currentNewsIndex * 12}px)`,
              }}
              transition={
                isTransitioning
                  ? { duration: 0.6, ease: "easeInOut" }
                  : { duration: 0 }
              }
            >
              {infiniteNews.map((news, index) => (
                <div
                  key={`${news.id}-${index}`}
                  className="w-full sm:w-[calc(50%-12px)] flex-shrink-0"
                >
                  <NewsCard news={news} />
                </div>
              ))}
            </motion.div>
          ) : (
            <Card className="border-0 bg-[#FFF6F5] shadow-none">
              <CardContent className="p-6">
                <p className="text-sm text-[#737692]">
                  Live external news is currently unavailable. The dashboard will resume showing fresh headlines as soon as the feed responds.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Bottom Section - Course Suggestions & Stats */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Course Suggestions */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="overflow-hidden bg-white shadow-sm border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-[#000000]">
                  Course Suggestions
                </CardTitle>
                <motion.button
                  className="text-sm text-[#D52B1E] font-medium flex items-center gap-1 hover:underline"
                  whileHover={{ x: 3 }}
                  onClick={() => {
                    if (!requireAuth('view courses')) return
                    navigate('/academy')
                  }}
                >
                  See All <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Help me choose section */}
                <div className="bg-gradient-to-r from-[#D52B1E]/10 to-[#6F1610]/10 rounded-xl p-6 border border-[#D52B1E]/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#000000] mb-2">
                        Help me choose
                      </h3>
                      <p className="text-sm text-[#737692] mb-3 leading-relaxed">
                        Answer a few questions about your experience, goals, and
                        interests to find your next step
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#737692] mb-4">
                        <Clock className="h-3 w-3" />
                        <span>Takes 2 minutes</span>
                      </div>
                      <motion.button
                        className="px-4 py-2 bg-[#D52B1E] text-white text-sm font-medium rounded-lg hover:bg-[#B8241B] transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (!requireAuth('start the questionnaire')) return
                          navigate('/questionnaire')
                        }}
                      >
                        Start now
                      </motion.button>
                    </div>
                    <div className="ml-4 text-[#D52B1E]/30">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Best selling courses */}
                <div>
                  <h3 className="text-base font-semibold text-[#000000] mb-4">
                    Best Selling Courses
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {courseSuggestions.map((course, index) => (
                      <motion.div
                        key={course.title}
                        className="group cursor-pointer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ y: -5 }}
                        onClick={() => {
                          if (!requireAuth('open learning courses')) return
                          navigate('/academy')
                        }}
                      >
                        <div className="relative rounded-xl overflow-hidden aspect-video mb-3">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.div
                              className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center"
                              whileHover={{ scale: 1.1 }}
                            >
                              <Play className="h-5 w-5 text-[#D52B1E] ml-1" />
                            </motion.div>
                          </div>
                          {course.progress > 0 && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                              <motion.div
                                className="h-full bg-[#D52B1E]"
                                initial={{ width: 0 }}
                                animate={{ width: `${course.progress}%` }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                              />
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-medium text-[#000000] line-clamp-2 mb-2">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-[#737692]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.lessons} lessons
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FFEFEF]">
                  <div>
                    <p className="text-xs text-[#737692]">Portfolio Value</p>
                    <p className="text-lg font-bold text-[#000000]">$124,500</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+12.5%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#FFEFEF]">
                  <div>
                    <p className="text-xs text-[#737692]">This Month Returns</p>
                    <p className="text-lg font-bold text-[#000000]">$3,250</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">+8.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* IEFA Tools Section */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden bg-white shadow-sm border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center">
                  <Wrench className="h-4 w-4 text-[#D52B1E]" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-[#000000]">
                    IEFA Tools
                  </CardTitle>
                  <p className="text-xs text-[#737692] mt-0.5">
                    Islamic finance calculators and screeners
                  </p>
                </div>
              </div>
              <motion.button
                className="text-sm text-[#D52B1E] font-medium flex items-center gap-1 hover:underline"
                whileHover={{ x: 3 }}
                onClick={() => {
                  if (!requireAuth('open IEFA tools')) return
                  navigate('/tools/zakat')
                }}
              >
                Open Tools <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Zakat Calculator',
                  description: 'Calculate your annual Zakat accurately based on gold, savings, livestock and trade goods.',
                  icon: Calculator,
                  href: '/tools/zakat',
                  color: 'from-emerald-50 to-teal-50',
                  iconColor: 'text-emerald-600',
                  iconBg: 'bg-emerald-100',
                },
                {
                  title: 'Halal Stock Screening',
                  description: 'Screen stocks for Shariah compliance using AAOIFI and other recognized standards.',
                  icon: TrendingUp,
                  href: '/tools/halal-stocks',
                  color: 'from-blue-50 to-indigo-50',
                  iconColor: 'text-blue-600',
                  iconBg: 'bg-blue-100',
                },
                {
                  title: 'Halal Crypto Screening',
                  description: 'Identify Shariah-screened digital assets and halal DeFi protocols.',
                  icon: Coins,
                  href: '/tools/halal-crypto',
                  color: 'from-purple-50 to-violet-50',
                  iconColor: 'text-purple-600',
                  iconBg: 'bg-purple-100',
                },
              ].map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`group cursor-pointer rounded-2xl bg-gradient-to-br ${tool.color} p-5 border border-transparent hover:border-[#D52B1E]/20 transition-all duration-200`}
                  onClick={() => {
                    if (!requireAuth('open IEFA tools')) return
                    navigate(tool.href)
                  }}
                >
                  <div className={`w-10 h-10 rounded-xl ${tool.iconBg} flex items-center justify-center mb-3`}>
                    <tool.icon className={`h-5 w-5 ${tool.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-[#000000] mb-1.5">{tool.title}</h3>
                  <p className="text-xs text-[#737692] leading-relaxed mb-3 line-clamp-3">{tool.description}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D52B1E] group-hover:underline">
                    Open tool <ChevronRight className="h-3 w-3" />
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
