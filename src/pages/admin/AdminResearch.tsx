import { motion } from 'framer-motion'
import { useState } from 'react'
import { FileText, Plus, Search, MoreVertical, Edit, Trash2, Eye, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  useAdminResearchReports,
  useAdminReportCategories,
  useAdminCreateResearch,
  useAdminUpdateResearch,
  useAdminDeleteResearch,
  type ResearchReport,
  type CreateResearchDto,
} from '@/hooks/useAdmin'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  review: 'bg-yellow-50 text-yellow-700',
  archived: 'bg-gray-100 text-gray-400',
}

type StatusFilter = 'all' | 'published' | 'draft' | 'review' | 'archived'

const REPORT_TYPES = ['whitepaper', 'case_study', 'market_report', 'academic_paper', 'policy_brief', 'annual_report'] as const
const EMPTY_FORM: CreateResearchDto = { title: '', categoryId: '', abstract: '', reportType: 'whitepaper', pdfUrl: '', coverImageUrl: '', status: 'draft', isDownloadable: false, isPremium: false, isFeatured: false }

export default function AdminResearch() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ResearchReport | null>(null)
  const [form, setForm] = useState<CreateResearchDto>(EMPTY_FORM)

  function openCreate() { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true) }

  function openEdit(r: ResearchReport) {
    setEditItem(r)
    setForm({
      title: r.title,
      categoryId: r.category?.id ?? '',
      abstract: r.abstract ?? '',
      reportType: r.reportType,
      pdfUrl: r.pdfUrl ?? '',
      coverImageUrl: r.coverImageUrl ?? '',
      status: r.status,
      isDownloadable: r.isDownloadable,
      isPremium: r.isPremium,
      isFeatured: r.isFeatured,
      tags: r.tags ?? [],
    })
    setOpenMenu(null)
    setModalOpen(true)
  }

  function closeModal() { setModalOpen(false); setEditItem(null); setForm(EMPTY_FORM) }

  const { data, isLoading } = useAdminResearchReports({
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    categoryId,
    perPage: 20,
  })
  const { data: categories } = useAdminReportCategories()
  const createMutation = useAdminCreateResearch()
  const updateMutation = useAdminUpdateResearch()
  const deleteMutation = useAdminDeleteResearch()

  const reports = data?.data ?? []
  const meta = data?.meta

  const publishedCount = reports.filter((r) => r.status === 'published').length
  const draftCount = reports.filter((r) => r.status === 'draft').length
  const totalDownloads = reports.reduce((sum, r) => sum + (r.downloadCount ?? 0), 0)
  const btnLabel = editItem ? 'Save Changes' : 'Upload Report'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Research &amp; Reports</h1>
          <p className="text-slate-500 text-sm">Manage research publications and reports</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> Upload Report
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: meta?.itemCount ?? '—', color: '#D52B1E' },
          { label: 'Published', value: publishedCount, color: '#10b981' },
          { label: 'Drafts', value: draftCount, color: '#6b7280' },
          { label: 'Total Downloads', value: totalDownloads > 0 ? totalDownloads.toLocaleString() : '—', color: '#3b82f6' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search reports…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(['all', 'published', 'draft', 'review', 'archived'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${statusFilter === s ? 'bg-[#D52B1E] text-white border-[#D52B1E]' : 'border-gray-200 hover:border-[#D52B1E]'}`}
              >
                {s}
              </button>
            ))}
            {categories && categories.length > 0 && (
              <select
                value={categoryId ?? ''}
                onChange={(e) => setCategoryId(e.target.value || undefined)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-slate-600 bg-white focus:outline-none focus:border-[#D52B1E]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#D52B1E]" />
            </div>
          )}
          {!isLoading && reports.length === 0 && (
            <p className="text-center text-sm text-slate-400 py-16">No reports found</p>
          )}
          {!isLoading && reports.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Report</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Type</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Downloads</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Views</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r: ResearchReport) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#D52B1E] shrink-0" />
                        <p className="font-medium text-slate-800 line-clamp-1">{r.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{r.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell capitalize">{r.reportType.replaceAll('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />{r.downloadCount > 0 ? r.downloadCount.toLocaleString() : '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{r.viewCount > 0 ? r.viewCount.toLocaleString() : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status] ?? ''}`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                      {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenu === r.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                            <button onClick={() => openEdit(r)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                            {r.status !== 'published' && (
                              <button
                                onClick={() => { updateMutation.mutate({ id: r.id, dto: { status: 'published' } as any }); setOpenMenu(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Eye className="h-3.5 w-3.5 text-green-600" /> Publish
                              </button>
                            )}
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => { deleteMutation.mutate(r.id); setOpenMenu(null) }}
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
      <Dialog open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Report' : 'Upload Report'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="res-title" className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-500">*</span></label>
            <Input id="res-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Report title" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="res-abstract" className="block text-xs font-medium text-slate-600 mb-1">Abstract</label>
            <textarea
              id="res-abstract"
              value={form.abstract ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, abstract: e.target.value }))}
              placeholder="Brief description of the report…"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-category" className="block text-xs font-medium text-slate-600 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                id="res-category"
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:border-[#D52B1E] bg-white"
              >
                <option value="">Select category</option>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="res-type" className="block text-xs font-medium text-slate-600 mb-1">Report Type</label>
              <select
                id="res-type"
                value={form.reportType ?? 'whitepaper'}
                onChange={(e) => setForm((f) => ({ ...f, reportType: e.target.value as CreateResearchDto['reportType'] }))}
                className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:border-[#D52B1E] bg-white capitalize"
              >
                {REPORT_TYPES.map((t) => <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-pdf" className="block text-xs font-medium text-slate-600 mb-1">PDF URL</label>
              <Input id="res-pdf" value={form.pdfUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, pdfUrl: e.target.value }))} placeholder="https://…" className="h-9 text-sm" />
            </div>
            <div>
              <p className="block text-xs font-medium text-slate-600 mb-1">Cover Image</p>
              <ImageUpload
                id="res-cover"
                value={form.coverImageUrl ?? ''}
                onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                id="res-status"
                value={form.status ?? 'draft'}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CreateResearchDto['status'] }))}
                className="w-full h-9 text-sm border border-gray-200 rounded-lg px-3 focus:outline-none focus:border-[#D52B1E] bg-white"
              >
                {['draft', 'review', 'published', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="res-tags" className="block text-xs font-medium text-slate-600 mb-1">Tags (comma-separated)</label>
              <Input
                id="res-tags"
                value={(form.tags ?? []).join(', ')}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                placeholder="finance, ESG"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {(
              [
                { key: 'isDownloadable', label: 'Downloadable' },
                { key: 'isPremium', label: 'Premium' },
                { key: 'isFeatured', label: 'Featured' },
              ] as { key: keyof CreateResearchDto; label: string }[]
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
              disabled={!form.title.trim() || !form.categoryId || createMutation.isPending || updateMutation.isPending}
              onClick={() => {
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
