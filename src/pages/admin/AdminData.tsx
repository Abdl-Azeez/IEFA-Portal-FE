import { motion } from 'framer-motion'
import { useMemo, useState, useEffect } from 'react'
import {
  Database, Plus, Search, MoreVertical, Edit, Trash2, TrendingUp,
  BarChart2, Loader2, Download, Lock, Settings, X, Check,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { TableSkeleton, CardGridSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { exportToCsv } from '@/lib/utils'
import {
  useAdminDatasets,
  useAdminDataCategories,
  useAdminCreateDataCategory,
  useAdminUpdateDataCategory,
  useAdminDeleteDataCategory,
  useAdminCreateDataset,
  useAdminUpdateDataset,
  useAdminDeleteDataset,
  type Dataset,
  type DataCategory,
  type CreateDatasetDto,
} from '@/hooks/useAdmin'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

/* ── Constants ───────────────────────────────────────────────────────────── */
const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  live: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  archived: 'bg-gray-100 text-gray-400',
}

const GEOGRAPHIES = ['Nigeria', 'Africa', 'Global'] as const
type Geography = (typeof GEOGRAPHIES)[number]

const VISUALIZATION_TYPES = [
  'KPI card', 'Line chart', 'Bar chart', 'Stacked bar', 'Pie chart',
  'Gauge', 'Map', 'Bubble chart', 'Heat map', 'Ranking table',
  'Trend line', 'Leaderboard', 'Area chart', 'Timeline chart', 'Table',
] as const

const SOURCE_TYPES = ['Regulatory', 'Research', 'Paid database', 'API', 'Reports'] as const

const DEFAULT_SECTIONS = [
  { name: 'Market Overview', sortOrder: 1 },
  { name: 'Islamic Banking', sortOrder: 2 },
  { name: 'Sukuk Market', sortOrder: 3 },
  { name: 'Takaful (Insurance)', sortOrder: 4 },
  { name: 'Islamic Micro-Finance', sortOrder: 5 },
  { name: 'Islamic Capital Market', sortOrder: 6 },
  { name: 'Halal Economy', sortOrder: 7 },
  { name: 'Research & Insights', sortOrder: 8 },
]

const GEO_STYLES: Record<Geography, { bg: string; text: string; flag: string }> = {
  Nigeria: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', flag: '🇳🇬' },
  Africa: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', flag: '🌍' },
  Global: { bg: 'bg-violet-50 border-violet-200', text: 'text-violet-700', flag: '🌐' },
}

const EMPTY_FORM: CreateDatasetDto = {
  title: '',
  categoryId: '',
  description: '',
  source: '',
  sourceUrl: '',
  fileUrl: '',
  format: '',
  frequency: undefined,
  status: 'draft',
  isDownloadable: false,
  isPremium: false,
  geography: '',
  tags: [],
}

export default function AdminData() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [geoFilter, setGeoFilter] = useState<string>('')
  const [premiumFilter, setPremiumFilter] = useState<string>('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // Sort
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Section management — auto-open when no categories exist yet
  const [sectionsOpen, setSectionsOpen] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [editingSection, setEditingSection] = useState<DataCategory | null>(null)
  const [editSectionName, setEditSectionName] = useState('')
  const [seedingDefaults, setSeedingDefaults] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Dataset | null>(null)
  const [form, setForm] = useState<CreateDatasetDto>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  function openCreate() { setEditItem(null); setForm(EMPTY_FORM); setFormErrors({}); setModalOpen(true) }

  function openEdit(d: Dataset) {
    setEditItem(d)
    setForm({
      title: d.title,
      categoryId: d.category?.id ?? '',
      description: d.description ?? '',
      source: d.source ?? '',
      sourceUrl: d.sourceUrl ?? '',
      fileUrl: d.fileUrl ?? '',
      format: d.format ?? '',
      frequency: d.frequency,
      status: d.status,
      isDownloadable: d.isDownloadable,
      isPremium: d.isPremium,
      geography: d.geography ?? '',
      tags: d.tags ?? [],
    })
    setOpenMenu(null)
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditItem(null); setForm(EMPTY_FORM); setFormErrors({}) }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Metric name is required'
    if (!form.categoryId) errs.categoryId = 'Section is required'
    if (!form.geography) errs.geography = 'Geography is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const { data, isLoading } = useAdminDatasets({
    search: search || undefined,
    categoryId,
    isPremium: premiumFilter === 'true' ? true : premiumFilter === 'false' ? false : undefined,
    perPage: 50,
  })
  const { data: categories } = useAdminDataCategories()
  const createMutation = useAdminCreateDataset()
  const updateMutation = useAdminUpdateDataset()
  const deleteMutation = useAdminDeleteDataset()
  const createCatMutation = useAdminCreateDataCategory()
  const updateCatMutation = useAdminUpdateDataCategory()
  const deleteCatMutation = useAdminDeleteDataCategory()

  // Auto-open the sections panel on first load if there are no sections yet
  useEffect(() => {
    if (categories !== undefined && categories.length === 0) {
      setSectionsOpen(true)
    }
  }, [categories])

  async function seedDefaultSections() {
    const existing = new Set((categories ?? []).map((c) => c.name.toLowerCase()))
    const toCreate = DEFAULT_SECTIONS.filter((s) => !existing.has(s.name.toLowerCase()))
    if (toCreate.length === 0) return
    setSeedingDefaults(true)
    for (const s of toCreate) {
      await createCatMutation.mutateAsync(s).catch(() => null)
    }
    setSeedingDefaults(false)
  }

  const datasets = data?.data ?? []
  const meta = data?.meta

  // Client-side filtering & sorting
  const filteredDatasets = useMemo(() => {
    let result = [...datasets]
    if (geoFilter) {
      result = result.filter((d) => d.geography === geoFilter)
    }
    if (sortField) {
      result.sort((a, b) => {
        let valA = '', valB = ''
        if (sortField === 'title') { valA = a.title; valB = b.title }
        else if (sortField === 'geography') { valA = a.geography ?? ''; valB = b.geography ?? '' }
        else if (sortField === 'status') { valA = a.status; valB = b.status }
        else if (sortField === 'premium') { valA = String(a.isPremium); valB = String(b.isPremium) }
        else if (sortField === 'category') { valA = a.category?.name ?? ''; valB = b.category?.name ?? '' }
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
      })
    }
    return result
  }, [datasets, geoFilter, sortField, sortDir])

  const activeCount = datasets.filter((d) => d.status === 'published').length
  const premiumCount = datasets.filter((d) => d.isPremium).length
  const freeCount = datasets.filter((d) => !d.isPremium).length
  const btnLabel = editItem ? 'Save Changes' : 'Add Metric'
  const SortIcon = sortDir === 'asc' ? ChevronUp : ChevronDown

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Management</h1>
          <p className="text-slate-500 text-sm">Manage Islamic finance market data metrics and datasets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => exportToCsv('data-metrics', filteredDatasets.map((d) => ({
            id: d.id,
            metric: d.title,
            section: d.category?.name ?? '',
            geography: d.geography ?? '',
            source: d.source ?? '',
            sourceType: d.format ?? '',
            premium: d.isPremium ? 'Paid' : 'Free',
            status: d.status,
            updatedAt: d.updatedAt,
          })))}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Add Metric
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      {isLoading ? <CardGridSkeleton count={4} /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Metrics', value: meta?.itemCount ?? '—', color: '#10b981', icon: Database },
            { label: 'Published', value: activeCount, color: '#3b82f6', icon: BarChart2 },
            { label: 'Free', value: freeCount, color: '#059669', icon: TrendingUp },
            { label: 'Premium', value: premiumCount, color: '#f59e0b', icon: Lock },
          ].map((s) => (
            <motion.div key={s.label} variants={item} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}18` }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Section Management Panel */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setSectionsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Manage Sections</span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{(categories ?? []).length}</span>
            {(categories ?? []).length === 0 && (
              <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">No sections — click to set up</span>
            )}
          </div>
          {sectionsOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>
        {sectionsOpen && (
          <div className="border-t border-gray-100 p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <p className="text-[11px] text-slate-400">Sections group metrics on the public data page. You must create sections before you can add metrics.</p>
              {DEFAULT_SECTIONS.some((s) => !(categories ?? []).some((c) => c.name.toLowerCase() === s.name.toLowerCase())) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 h-7 text-xs rounded-lg gap-1.5 border-[#D52B1E] text-[#D52B1E] hover:bg-red-50"
                  disabled={seedingDefaults}
                  onClick={seedDefaultSections}
                >
                  {seedingDefaults ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                  Load Default Sections
                </Button>
              )}
            </div>
            {/* Add new section */}
            <div className="flex gap-2">
              <Input
                placeholder="New section name…"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="h-8 text-sm flex-1 max-w-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSectionName.trim()) {
                    createCatMutation.mutate({ name: newSectionName.trim() }, { onSuccess: () => setNewSectionName('') })
                  }
                }}
              />
              <Button
                size="sm"
                className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg h-8 text-xs gap-1"
                disabled={!newSectionName.trim() || createCatMutation.isPending}
                onClick={() => createCatMutation.mutate({ name: newSectionName.trim() }, { onSuccess: () => setNewSectionName('') })}
              >
                {createCatMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Plus className="h-3 w-3" /> Add</>}
              </Button>
            </div>
            {/* List existing sections */}
            {(categories ?? []).length === 0 && (
              <p className="text-xs text-slate-400 italic">No sections yet. Add one above.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(categories ?? []).map((cat) => (
                <div key={cat.id} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 group">
                  {editingSection?.id === cat.id ? (
                    <>
                      <Input
                        value={editSectionName}
                        onChange={(e) => setEditSectionName(e.target.value)}
                        className="h-7 text-xs flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editSectionName.trim()) {
                            updateCatMutation.mutate({ id: cat.id, dto: { name: editSectionName.trim() } }, { onSuccess: () => setEditingSection(null) })
                          }
                          if (e.key === 'Escape') setEditingSection(null)
                        }}
                      />
                      <button
                        onClick={() => updateCatMutation.mutate({ id: cat.id, dto: { name: editSectionName.trim() } }, { onSuccess: () => setEditingSection(null) })}
                        className="p-1 rounded hover:bg-green-100 text-green-600"
                        disabled={!editSectionName.trim()}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditingSection(null)} className="p-1 rounded hover:bg-slate-200 text-slate-400">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-slate-700 flex-1 truncate">{cat.name}</span>
                      <button
                        onClick={() => { setEditingSection(cat); setEditSectionName(cat.name) }}
                        className="p-1 rounded hover:bg-slate-200 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete section "${cat.name}"?`)) deleteCatMutation.mutate(cat.id) }}
                        className="p-1 rounded hover:bg-red-100 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search metrics…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
          {categories && categories.length > 0 && (
            <Select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value || undefined)}
              className="h-auto py-1.5 w-auto text-xs text-slate-600"
            >
              <option value="">All Sections</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          )}
          <Select
            value={geoFilter}
            onChange={(e) => setGeoFilter(e.target.value)}
            className="h-auto py-1.5 w-auto text-xs text-slate-600"
          >
            <option value="">All Geographies</option>
            {GEOGRAPHIES.map((g) => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value)}
            className="h-auto py-1.5 w-auto text-xs text-slate-600"
          >
            <option value="">All Access</option>
            <option value="false">Free</option>
            <option value="true">Premium</option>
          </Select>
          <span className="ml-auto text-[11px] text-gray-400">{filteredDatasets.length} rows</span>
        </div>

        <div className="overflow-x-auto">
          {isLoading && <TableSkeleton rows={8} cols={8} />}
          {!isLoading && filteredDatasets.length === 0 && (
            <EmptyState icon={Database} title="No metrics found" description="Add your first data metric to get started." />
          )}
          {!isLoading && filteredDatasets.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left w-10">#</th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('title')}>
                    <span className="inline-flex items-center gap-1">
                      Metric {sortField === 'title' && <SortIcon className="w-3 h-3" />}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700 select-none hidden md:table-cell" onClick={() => handleSort('category')}>
                    <span className="inline-flex items-center gap-1">
                      Section {sortField === 'category' && <SortIcon className="w-3 h-3" />}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('geography')}>
                    <span className="inline-flex items-center gap-1">
                      Geography {sortField === 'geography' && <SortIcon className="w-3 h-3" />}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Source</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Visualization</th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('status')}>
                    <span className="inline-flex items-center gap-1">
                      Status {sortField === 'status' && <SortIcon className="w-3 h-3" />}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:text-slate-700 select-none" onClick={() => handleSort('premium')}>
                    <span className="inline-flex items-center gap-1">
                      Access {sortField === 'premium' && <SortIcon className="w-3 h-3" />}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDatasets.map((d: Dataset, idx: number) => {
                  const geo = d.geography && GEO_STYLES[d.geography as Geography]
                  return (
                    <tr key={d.id} className={`hover:bg-slate-50/50 ${d.isPremium ? 'bg-amber-50/20' : ''}`}>
                      <td className="px-4 py-3 text-xs text-gray-400 tabular-nums">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800 line-clamp-1">{d.title}</p>
                          {d.isPremium && (
                            <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded-full shrink-0">
                              <Lock className="w-2 h-2" /> Pro
                            </span>
                          )}
                        </div>
                        {d.description && <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{d.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell">{d.category?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {geo ? (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${geo.bg} ${geo.text}`}>
                            {geo.flag} {d.geography}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {d.source ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md border ${
                            d.source === 'Regulatory' ? 'bg-green-50 text-green-700 border-green-200'
                            : d.source === 'Paid database' || d.source === 'API' ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : d.source === 'Research' ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}>
                            {d.source}
                          </span>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">{d.format || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[d.status] ?? ''}`}>{d.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {d.isPremium ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === d.id && (
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                              <button onClick={() => openEdit(d)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => { deleteMutation.mutate(d.id); setOpenMenu(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Metric' : 'Add Metric'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          {/* Metric Name */}
          <div>
            <label htmlFor="ds-title" className="block text-xs font-medium text-slate-600 mb-1">Metric Name <span className="text-red-500">*</span></label>
            <Input id="ds-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Total Islamic Finance Assets" className="h-9 text-sm" />
            {formErrors.title && <p className="text-xs text-red-500 mt-0.5">{formErrors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="ds-desc" className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              id="ds-desc"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the metric"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>

          {/* Section + Geography */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ds-category" className="block text-xs font-medium text-slate-600 mb-1">Section <span className="text-red-500">*</span></label>
              <Select
                id="ds-category"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Select section</option>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              {formErrors.categoryId && <p className="text-xs text-red-500 mt-0.5">{formErrors.categoryId}</p>}
            </div>
            <div>
              <label htmlFor="ds-geo" className="block text-xs font-medium text-slate-600 mb-1">Geography <span className="text-red-500">*</span></label>
              <Select
                id="ds-geo"
                value={form.geography ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, geography: e.target.value }))}
              >
                <option value="">Select geography</option>
                {GEOGRAPHIES.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
              {formErrors.geography && <p className="text-xs text-red-500 mt-0.5">{formErrors.geography}</p>}
            </div>
          </div>

          {/* Source Type + Source URL */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ds-source" className="block text-xs font-medium text-slate-600 mb-1">Source Type</label>
              <Select
                id="ds-source"
                value={form.source ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
              >
                <option value="">Select source type</option>
                {SOURCE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div>
              <label htmlFor="ds-source-url" className="block text-xs font-medium text-slate-600 mb-1">Source URL</label>
              <Input id="ds-source-url" value={form.sourceUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} placeholder="https://…" className="h-9 text-sm" />
            </div>
          </div>

          {/* Visualization Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ds-viz" className="block text-xs font-medium text-slate-600 mb-1">Visualization Type</label>
              <Select
                id="ds-viz"
                value={form.format ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))}
              >
                <option value="">Select type</option>
                {VISUALIZATION_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
              </Select>
            </div>
            <div>
              <label htmlFor="ds-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <Select
                id="ds-status"
                value={form.status ?? 'draft'}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CreateDatasetDto['status'] }))}
              >
                {['draft', 'published', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>

          {/* Data Document Upload */}
          <div>
            <p className="block text-xs font-medium text-slate-600 mb-1">Data Document</p>
            <p className="text-[10px] text-slate-400 mb-2">Upload the dataset file (CSV, XLSX, JSON) that contains the metric data. This will be used for visualization.</p>
            <ImageUpload
              id="ds-file"
              mode="document"
              accept=".csv,.xlsx,.xls,.json,.zip,.pdf"
              label="Click to upload data document"
              value={form.fileUrl ?? ''}
              onChange={(url) => setForm((f) => ({ ...f, fileUrl: url }))}
            />
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.isPremium}
                onChange={(e) => setForm((f) => ({ ...f, isPremium: e.target.checked }))}
                className="accent-[#D52B1E]"
              />
              Premium (Paid)
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.isDownloadable}
                onChange={(e) => setForm((f) => ({ ...f, isDownloadable: e.target.checked }))}
                className="accent-[#D52B1E]"
              />
              Downloadable
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={closeModal}>Cancel</Button>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                if (!validate()) return
                if (editItem) {
                  updateMutation.mutate({ id: editItem.id, dto: form }, { onSuccess: closeModal })
                } else {
                  createMutation.mutate(form, { onSuccess: closeModal })
                }
              }}
            >
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : btnLabel}
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}
