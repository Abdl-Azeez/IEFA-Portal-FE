import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Shield,
  Wrench,
  BookA,
  Library,
  Calculator,
  Lock,
  TrendingUp,
  Bitcoin,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { ResourcePreviewPage } from '@/components/resources/ResourcePreviewPage'
import { DownloadEmailModal } from '@/components/resources/DownloadEmailModal'
import { ResourceFilterBar } from '@/components/resources/ResourceFilterBar'
import { GlossarySection } from '@/components/resources/GlossarySection'
import {
  useResources,
  useResourceCategories,
  useGlossaryTerms,
  useTrackResourceDownload,
} from '@/hooks/useResources'
import {
  SECTION_TO_RESOURCE_TYPE,
  type ResourceItem,
  type ResourceSection,
} from '@/types/resources'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45 } },
}

const TABS: {
  value: ResourceSection
  label: string
  icon: React.ElementType
  description: string
}[] = [
  {
    value: 'educational-guides',
    label: 'Educational Guides',
    icon: BookOpen,
    description: 'Introductory and explanatory materials on the fundamentals of Islamic finance.',
  },
  {
    value: 'research-publications',
    label: 'Research & Publications',
    icon: FileText,
    description: 'In-depth academic and industry materials for research, policy analysis, and professional development.',
  },
  {
    value: 'standards-governance',
    label: 'Standards & Governance',
    icon: Shield,
    description: 'Regulatory frameworks and Shariah standards guiding Islamic financial institutions.',
  },
  {
    value: 'tools-practical',
    label: 'Tools & Practical Resources',
    icon: Wrench,
    description: 'Practical tools and reference materials for real-world financial planning.',
  },
  {
    value: 'glossary',
    label: 'Glossary',
    icon: BookA,
    description: 'Definitions of key terms and concepts in Islamic finance.',
  },
]

const PAGE_SIZE = 9

export default function Resources() {
  const [activeTab, setActiveTab] = useState<ResourceSection>('educational-guides')
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null)
  const [downloadResource, setDownloadResource] = useState<ResourceItem | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'views' | 'downloads'>('date')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [searchParams] = useSearchParams()

  const currentResourceType = SECTION_TO_RESOURCE_TYPE[activeTab]

  const { data: categoriesData } = useResourceCategories()
  const { data: tabResourcesData, isLoading: resourcesLoading } = useResources(
    currentResourceType
      ? {
          page: 1,
          perPage: 100,
          status: 'published',
          resourceType: currentResourceType,
          search: search || undefined,
          categoryId: selectedCategory || undefined,
          order: 'DESC',
        }
      : { perPage: 1 }
  )
  const { data: allResourcesData } = useResources({ page: 1, perPage: 100, status: 'published', order: 'DESC' })
  const { data: glossaryData, isLoading: glossaryLoading } = useGlossaryTerms({ status: 'published' })
  const trackDownload = useTrackResourceDownload()

  useEffect(() => {
    const tab = searchParams.get('tab') as ResourceSection | null
    const validTabs: ResourceSection[] = [
      'educational-guides',
      'research-publications',
      'standards-governance',
      'tools-practical',
      'glossary',
    ]
    if (tab && validTabs.includes(tab)) setActiveTab(tab)
  }, [searchParams])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    setSearch('')
    setSelectedCategory('')
    setSortBy('date')
    setVisibleCount(PAGE_SIZE)
  }, [activeTab])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [search, sortBy, selectedCategory])

  const sectionCounts = useMemo(() => {
    const counts: Record<ResourceSection, number> = {
      'educational-guides': 0,
      'research-publications': 0,
      'standards-governance': 0,
      'tools-practical': 0,
      glossary: glossaryData?.length ?? 0,
    }
    for (const item of allResourcesData?.data ?? []) {
      const section = item.resourceType === 'guide'
        ? 'educational-guides'
        : item.resourceType === 'research'
          ? 'research-publications'
          : item.resourceType === 'standard'
            ? 'standards-governance'
            : 'tools-practical'
      counts[section] += 1
    }
    return counts
  }, [allResourcesData?.data, glossaryData?.length])

  const currentResources = useMemo(() => {
    const items = [...(tabResourcesData?.data ?? [])]
    items.sort((a, b) => {
      if (sortBy === 'views') return b.viewCount - a.viewCount
      if (sortBy === 'downloads') return b.downloadCount - a.downloadCount
      return new Date(b.publishedAt ?? b.createdAt).getTime() - new Date(a.publishedAt ?? a.createdAt).getTime()
    })
    return items
  }, [tabResourcesData?.data, sortBy])

  const currentCategories = useMemo(() => {
    const idSet = new Set((tabResourcesData?.data ?? []).map((r) => r.categoryId).filter(Boolean) as string[])
    return (categoriesData ?? [])
      .filter((c) => idSet.has(c.id))
      .map((c) => c.name)
      .sort((a, b) => a.localeCompare(b))
  }, [categoriesData, tabResourcesData?.data])

  if (previewResource) {
    return <ResourcePreviewPage resource={previewResource} onBack={() => setPreviewResource(null)} />
  }

  const isLoading = activeTab === 'glossary' ? glossaryLoading : resourcesLoading

  return (
    <>
      <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-[#1c0505] to-gray-900 p-8 md:p-12 min-h-[220px] flex items-center">
            <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-[#D52B1E]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-[#D52B1E]/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8 w-full">
              <div className="flex-1 space-y-4">
                <span className="inline-flex items-center gap-1.5 bg-[#D52B1E]/20 text-[#D52B1E] text-xs font-bold px-3 py-1.5 rounded-full border border-[#D52B1E]/30 tracking-widest uppercase">
                  <Library className="h-3 w-3" /> IEFA Resources
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  Your gateway to <span className="text-[#D52B1E]">Islamic Finance</span> knowledge
                </h1>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl">
                  Curated guides, research publications, articles, and practical tools designed to help you learn about Islamic finance.
                </p>
              </div>

              <div className="flex md:flex-col gap-3 shrink-0">
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-white">5</p>
                  <p className="text-xs text-gray-500">Sections</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-center">
                  <p className="text-2xl font-bold text-[#D52B1E]">{glossaryData?.length ?? 0}</p>
                  <p className="text-xs text-gray-500">Glossary Terms</p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute right-8 bottom-4 opacity-5 text-white select-none hidden md:block">
              <Library className="h-52 w-52" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ResourceSection)}>
            <TabsList className="flex flex-nowrap overflow-x-auto scrollbar-hide w-full justify-start bg-transparent border-0 rounded-none p-0 h-auto shadow-none">
              {TABS.map((tab, idx) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="group relative flex items-center gap-1.5 bg-gray-100 data-[state=active]:bg-[#D52B1E] text-gray-600 data-[state=active]:text-white pl-6 pr-10 py-3 text-sm font-medium rounded-none shadow-none transition-colors duration-200 border-0 shrink-0 whitespace-nowrap"
                  style={{
                    marginLeft: idx === 0 ? 0 : -18,
                    clipPath:
                      idx === 0
                        ? 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%)'
                        : 'polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 18px 50%)',
                    zIndex: TABS.length - idx,
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <tab.icon className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="hidden sm:inline shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/15 group-data-[state=active]:bg-white/20 tabular-nums">
                      {sectionCounts[tab.value]}
                    </span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {TABS.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab.value}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gradient-to-r from-[#D52B1E]/5 via-[#D52B1E]/3 to-transparent rounded-xl p-4 mb-6 border-l-4 border-[#D52B1E]">
                      <p className="text-sm text-[#737692]">{tab.description}</p>
                    </div>

                    {tab.value === 'glossary' ? (
                      <GlossarySection terms={glossaryData ?? []} />
                    ) : (
                      <>
                        {tab.value === 'tools-practical' && (
                          <div className="mb-8 space-y-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-gray-800">Calculators &amp; Screeners</span>
                              <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-semibold border border-amber-200">Coming Soon</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white/70 p-6 flex flex-col items-center text-center gap-3 hover:border-[#D52B1E]/40 transition-colors">
                                <div className="h-14 w-14 rounded-2xl bg-[#D52B1E]/10 flex items-center justify-center">
                                  <Calculator className="h-7 w-7 text-[#D52B1E]" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">Zakat Calculator</h3>
                                  <p className="text-xs text-[#737692] leading-relaxed">Calculate your Zakat obligation accurately across asset categories.</p>
                                </div>
                                <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed border border-gray-200">
                                  <Lock className="h-3.5 w-3.5" /> Coming Soon
                                </button>
                              </div>
                              <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white/70 p-6 flex flex-col items-center text-center gap-3 hover:border-[#D52B1E]/40 transition-colors">
                                <div className="h-14 w-14 rounded-2xl bg-[#D52B1E]/10 flex items-center justify-center">
                                  <TrendingUp className="h-7 w-7 text-[#D52B1E]" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">Halal Stock Screener</h3>
                                  <p className="text-xs text-[#737692] leading-relaxed">Screen stocks for Shariah compliance based on business activity and ratios.</p>
                                </div>
                                <button disabled className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed border border-gray-200">
                                  <Lock className="h-3.5 w-3.5" /> Coming Soon
                                </button>
                              </div>
                              <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-white/70 p-6 flex flex-col items-center text-center gap-3 hover:border-[#D52B1E]/40 transition-colors">
                                <div className="h-14 w-14 rounded-2xl bg-[#D52B1E]/10 flex items-center justify-center">
                                  <Bitcoin className="h-7 w-7 text-[#D52B1E]" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800 mb-1">Halal Crypto Screener</h3>
                                  <p className="text-xs text-[#737692] leading-relaxed">Filter cryptocurrencies against Shariah compliance criteria.</p>
                                </div>
                                <a
                                  href="/tools/halal-crypto"
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D52B1E] text-white text-sm font-medium hover:bg-[#B82318] transition-colors border border-[#D52B1E]"
                                >
                                  Launch Screener
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        <ResourceFilterBar
                          search={search}
                          onSearchChange={setSearch}
                          sortBy={sortBy}
                          onSortChange={setSortBy}
                          selectedCategory={selectedCategory}
                          onCategoryChange={setSelectedCategory}
                          categories={currentCategories}
                        />

                        <div className="mt-6">
                          {isLoading ? (
                            <div className="py-16 text-center">
                              <p className="text-[#737692] text-sm">Loading resources...</p>
                            </div>
                          ) : currentResources.length === 0 ? (
                            <div className="py-16 text-center">
                              <tab.icon className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                              <p className="text-[#737692] text-sm">No resources found.</p>
                              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {currentResources.slice(0, visibleCount).map((resource, idx) => (
                                  <ResourceCard
                                    key={resource.id}
                                    resource={resource}
                                    index={idx}
                                    onPreview={setPreviewResource}
                                    onDownload={(resourceToDownload) => {
                                      trackDownload.mutate(resourceToDownload.id)
                                      setDownloadResource(resourceToDownload)
                                    }}
                                  />
                                ))}
                              </div>
                              {visibleCount < currentResources.length && (
                                <div className="mt-8 flex flex-col items-center gap-2">
                                  <button
                                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                                    className="px-8 py-2.5 rounded-full border-2 border-[#D52B1E] text-[#D52B1E] text-sm font-semibold hover:bg-[#FFEFEF] transition-colors"
                                  >
                                    Load More
                                  </button>
                                  <p className="text-xs text-gray-400">
                                    Showing {Math.min(visibleCount, currentResources.length)} of {currentResources.length}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </motion.div>

      <DownloadEmailModal
        open={!!downloadResource}
        onClose={() => setDownloadResource(null)}
        resourceTitle={downloadResource?.title ?? ''}
      />
    </>
  )
}
