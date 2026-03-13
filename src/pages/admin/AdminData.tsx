import { motion } from 'framer-motion'
import { useState } from 'react'
import { Database, Plus, Search, MoreVertical, Edit, Trash2, TrendingUp, BarChart2, RefreshCw, Loader2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { TableSkeleton, CardGridSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { exportToCsv } from '@/lib/utils'
import {
  useAdminDatasets,
  useAdminDataCategories,
  useAdminCreateDataset,
  useAdminUpdateDataset,
  useAdminDeleteDataset,
  type Dataset,
  type CreateDatasetDto,
} from '@/hooks/useAdmin'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  live: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  archived: 'bg-gray-100 text-gray-400',
}

const FREQUENCIES = ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'one_time'] as const

const EMPTY_FORM: CreateDatasetDto = { title: '', categoryId: '', description: '', source: '', sourceUrl: '', fileUrl: '', format: '', frequency: undefined, status: 'draft', isDownloadable: false, isPremium: false }

export default function AdminData() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

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
    })
    setOpenMenu(null)
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditItem(null); setForm(EMPTY_FORM); setFormErrors({}) }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = 'Title is required'
    if (!form.categoryId) errs.categoryId = 'Category is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const { data, isLoading } = useAdminDatasets({
    search: search || undefined,
    categoryId,
    perPage: 20,
  })
  const { data: categories } = useAdminDataCategories()
  const createMutation = useAdminCreateDataset()
  const updateMutation = useAdminUpdateDataset()
  const deleteMutation = useAdminDeleteDataset()

  const datasets = data?.data ?? []
  const meta = data?.meta

  const activeCount = datasets.filter((d) => d.status === 'published').length
  const btnLabel = editItem ? 'Save Changes' : 'Add Dataset'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Management</h1>
          <p className="text-slate-500 text-sm">Manage market data, datasets and feeds</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={() => exportToCsv('datasets', datasets.map((d) => ({ id: d.id, title: d.title, category: d.category?.name ?? '', source: d.source ?? '', format: d.format ?? '', status: d.status, downloads: d.downloadCount, updatedAt: d.updatedAt })))}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" /> Add Dataset
          </Button>
        </div>
      </motion.div>

      {isLoading ? <CardGridSkeleton count={4} /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Datasets', value: meta?.itemCount ?? '—', color: '#10b981', icon: Database },
            { label: 'Published', value: activeCount, color: '#3b82f6', icon: BarChart2 },
            { label: 'Downloadable', value: datasets.filter((d) => d.isDownloadable).length, color: '#D52B1E', icon: TrendingUp },
            { label: 'Premium', value: datasets.filter((d) => d.isPremium).length, color: '#f59e0b', icon: RefreshCw },
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

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search datasets…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
          {categories && categories.length > 0 && (
            <Select
              value={categoryId ?? ''}
              onChange={(e) => setCategoryId(e.target.value || undefined)}
              className="h-auto py-1.5 w-auto text-xs text-slate-600"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          )}
        </div>

        <div className="overflow-x-auto">
          {isLoading && <TableSkeleton rows={8} cols={7} />}
          {!isLoading && datasets.length === 0 && (
            <EmptyState icon={Database} title="No datasets found" description="Add your first dataset to get started." />
          )}
          {!isLoading && datasets.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Dataset</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Source</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Downloads</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Last Updated</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {datasets.map((d: Dataset) => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-blue-500 shrink-0" />
                        <p className="font-medium text-slate-800 line-clamp-1">{d.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{d.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{d.source ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell">{d.downloadCount > 0 ? d.downloadCount.toLocaleString() : '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                      {new Date(d.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[d.status] ?? ''}`}>{d.status}</span>
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Dataset' : 'Add Dataset'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="ds-title" className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-500">*</span></label>
            <Input id="ds-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Dataset title" className="h-9 text-sm" />
            {formErrors.title && <p className="text-xs text-red-500 mt-0.5">{formErrors.title}</p>}
          </div>
          <div>
            <label htmlFor="ds-desc" className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              id="ds-desc"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What does this dataset contain?"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ds-category" className="block text-xs font-medium text-slate-600 mb-1">Category <span className="text-red-500">*</span></label>
              <Select
                id="ds-category"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              >
                <option value="">Select category</option>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              {formErrors.categoryId && <p className="text-xs text-red-500 mt-0.5">{formErrors.categoryId}</p>}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ds-source" className="block text-xs font-medium text-slate-600 mb-1">Source</label>
              <Input id="ds-source" value={form.source ?? ''} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} placeholder="e.g. World Bank" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="ds-source-url" className="block text-xs font-medium text-slate-600 mb-1">Source URL</label>
              <Input id="ds-source-url" value={form.sourceUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} placeholder="https://…" className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ds-file" className="block text-xs font-medium text-slate-600 mb-1">File URL</label>
              <Input id="ds-file" value={form.fileUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))} placeholder="https://…" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="ds-format" className="block text-xs font-medium text-slate-600 mb-1">Format</label>
              <Input id="ds-format" value={form.format ?? ''} onChange={(e) => setForm((f) => ({ ...f, format: e.target.value }))} placeholder="e.g. CSV, XLSX" className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="ds-freq" className="block text-xs font-medium text-slate-600 mb-1">Update Frequency</label>
            <Select
              id="ds-freq"
              value={form.frequency ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as CreateDatasetDto['frequency'] || undefined }))}
            >
              <option value="">None</option>
              {FREQUENCIES.map((fr) => <option key={fr} value={fr}>{fr.replaceAll('_', ' ')}</option>)}
            </Select>
          </div>
          <div className="flex items-center gap-6">
            {(
              [
                { key: 'isDownloadable', label: 'Downloadable' },
                { key: 'isPremium', label: 'Premium' },
              ] as { key: keyof CreateDatasetDto; label: string }[]
            ).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.checked }))}
                  className="accent-[#D52B1E]"
                />
                {label}
              </label>
            ))}
          </div>
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
