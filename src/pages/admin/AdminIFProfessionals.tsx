import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Briefcase,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import { TableSkeleton, CardGridSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  useAdminIFProfessionals,
  useAdminCreateIFProfessional,
  useAdminUpdateIFProfessional,
  useAdminDeleteIFProfessional,
  type IFProfessional,
  type CareerLevel,
  type CreateIFProfessionalDto,
} from '@/hooks/useAdmin'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const LEVEL_LABELS: Record<CareerLevel, string> = {
  early_career: 'Early Career',
  mid_career: 'Mid Career',
  senior: 'Senior',
}

const LEVEL_COLORS: Record<CareerLevel, string> = {
  early_career: 'bg-blue-50 text-blue-700',
  mid_career: 'bg-purple-50 text-purple-700',
  senior: 'bg-amber-50 text-amber-700',
}

type LevelFilter = 'All' | CareerLevel

const CAREER_LEVELS: CareerLevel[] = ['early_career', 'mid_career', 'senior']

const EMPTY_FORM: CreateIFProfessionalDto = {
  name: '',
  title: '',
  location: '',
  focus: '',
  bio: '',
  level: 'early_career',
  profileImageUrl: '',
  linkedInUrl: '',
  email: '',
  isPublished: false,
}

export default function AdminIFProfessionals() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('All')
  const [page, setPage] = useState(1)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<IFProfessional | null>(null)
  const [form, setForm] = useState<CreateIFProfessionalDto>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  function openCreate() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setModalOpen(true)
  }

  function openEdit(p: IFProfessional) {
    setEditItem(p)
    setForm({
      name: p.name,
      title: p.title ?? '',
      location: p.location ?? '',
      focus: p.focus ?? '',
      bio: p.bio ?? '',
      level: p.level ?? 'early_career',
      profileImageUrl: p.profileImageUrl ?? '',
      linkedInUrl: p.linkedInUrl ?? '',
      email: p.email ?? '',
      isPublished: p.isPublished,
    })
    setOpenMenu(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditItem(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const { data, isLoading } = useAdminIFProfessionals({
    search: search || undefined,
    level: levelFilter === 'All' ? undefined : levelFilter,
    page,
    perPage: 15,
  })
  const createMutation = useAdminCreateIFProfessional()
  const updateMutation = useAdminUpdateIFProfessional()
  const deleteMutation = useAdminDeleteIFProfessional()

  const professionals = data?.data ?? []
  const meta = data?.meta

  const publishedCount = professionals.filter((p) => p.isPublished).length
  const draftCount = professionals.filter((p) => !p.isPublished).length
  const seniorCount = professionals.filter((p) => p.level === 'senior').length

  const totalPages = meta?.pageCount ?? 1
  function buildPageNumbers(): (number | string)[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '…', totalPages]
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page, '…', totalPages]
  }
  const pageNumbers = buildPageNumbers()
  const btnLabel = editItem ? 'Save Changes' : 'Add Professional'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">IF Professionals</h1>
          <p className="text-slate-500 text-sm">Manage Islamic Finance professional profiles</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> Add Professional
        </Button>
      </motion.div>

      {isLoading ? <CardGridSkeleton count={4} /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Profiles', value: meta?.itemCount ?? '—', icon: Briefcase, color: '#D52B1E' },
            { label: 'Published', value: publishedCount, icon: Eye, color: '#10b981' },
            { label: 'Drafts', value: draftCount, icon: EyeOff, color: '#6b7280' },
            { label: 'Senior Level', value: seniorCount, icon: MapPin, color: '#f59e0b' },
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
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search professionals…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-9 text-sm rounded-lg border-gray-200"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            {(['All', ...CAREER_LEVELS] as LevelFilter[]).map((l) => (
              <button
                key={l}
                onClick={() => { setLevelFilter(l); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${levelFilter === l ? 'bg-[#D52B1E] text-white border-[#D52B1E]' : 'border-gray-200 hover:border-[#D52B1E]'}`}
              >
                {l === 'All' ? 'All' : LEVEL_LABELS[l as CareerLevel]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading && <TableSkeleton rows={8} cols={6} />}
          {!isLoading && professionals.length === 0 && (
            <EmptyState icon={Briefcase} title="No professionals found" description="Add your first IF professional profile to get started." />
          )}
          {!isLoading && professionals.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Profile</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Focus Area</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Level</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {professionals.map((p: IFProfessional) => {
                  const levelCls = p.level ? LEVEL_COLORS[p.level] : 'bg-gray-100 text-gray-500'
                  const levelLabel = p.level ? LEVEL_LABELS[p.level] : '—'
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.profileImageUrl ? (
                            <img src={p.profileImageUrl} alt={p.name} className="h-9 w-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-[#D52B1E]/10 flex items-center justify-center shrink-0">
                              <span className="text-[#D52B1E] text-xs font-bold">{p.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{p.name}</p>
                            {p.title && <p className="text-xs text-slate-400">{p.title}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                        {p.location ? (
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell max-w-[160px]">
                        <span className="line-clamp-1">{p.focus ?? '—'}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${levelCls}`}>{levelLabel}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.isPublished ? (
                          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit bg-green-50 text-green-700">
                            <Eye className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit bg-slate-100 text-slate-600">
                            <EyeOff className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === p.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                              <button onClick={() => openEdit(p)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                                <Edit className="h-3.5 w-3.5 text-blue-600" /> Edit
                              </button>
                              <button
                                onClick={() => { updateMutation.mutate({ id: p.id, dto: { isPublished: !p.isPublished } }); setOpenMenu(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                {p.isPublished ? <EyeOff className="h-3.5 w-3.5 text-slate-500" /> : <Eye className="h-3.5 w-3.5 text-green-600" />}
                                {p.isPublished ? 'Unpublish' : 'Publish'}
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => { deleteMutation.mutate(p.id); setOpenMenu(null) }}
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

        {meta && meta.pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-slate-500">
            <span>
              Showing {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.itemCount)} of {meta.itemCount} professionals
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!meta.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((p) => {
                const cls = p === page ? 'bg-[#D52B1E] text-white' : 'hover:bg-slate-100'
                const isEllipsis = p === '…'
                return (
                  <button
                    key={String(p)}
                    onClick={() => typeof p === 'number' && setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs ${isEllipsis ? 'cursor-default' : cls}`}
                  >
                    {p}
                  </button>
                )
              })}
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Create / Edit Modal */}
      <Dialog open={modalOpen} onClose={closeModal} title={editItem ? 'Edit Professional' : 'Add Professional'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label htmlFor="prof-name" className="block text-xs font-medium text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
              <Input id="prof-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" className="h-9 text-sm" />
              {formErrors.name && <p className="text-xs text-red-500 mt-0.5">{formErrors.name}</p>}
            </div>
            <div>
              <label htmlFor="prof-title" className="block text-xs font-medium text-slate-600 mb-1">Job Title</label>
              <Input id="prof-title" value={form.title ?? ''} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Investment Analyst" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="prof-location" className="block text-xs font-medium text-slate-600 mb-1">Location</label>
              <Input id="prof-location" value={form.location ?? ''} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Kuala Lumpur, Malaysia" className="h-9 text-sm" />
            </div>
          </div>

          <div>
            <label htmlFor="prof-focus" className="block text-xs font-medium text-slate-600 mb-1">Focus Area</label>
            <Input id="prof-focus" value={form.focus ?? ''} onChange={(e) => setForm((f) => ({ ...f, focus: e.target.value }))} placeholder="e.g. Islamic Capital Markets" className="h-9 text-sm" />
          </div>

          <div>
            <label htmlFor="prof-bio" className="block text-xs font-medium text-slate-600 mb-1">Bio</label>
            <textarea
              id="prof-bio"
              value={form.bio ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="Professional biography…"
              rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>

          <div>
            <p className="block text-xs font-medium text-slate-600 mb-1">Profile Image</p>
            <ImageUpload
              id="prof-image"
              value={form.profileImageUrl ?? ''}
              onChange={(url) => setForm((f) => ({ ...f, profileImageUrl: url }))}
              previewHeight="h-28"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="prof-level" className="block text-xs font-medium text-slate-600 mb-1">Career Level</label>
              <Select
                id="prof-level"
                value={form.level ?? 'early_career'}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as CareerLevel }))}
              >
                {CAREER_LEVELS.map((l) => (
                  <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="prof-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <Select
                id="prof-status"
                value={form.isPublished ? 'published' : 'draft'}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.value === 'published' }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="prof-email" className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <Input id="prof-email" type="email" value={form.email ?? ''} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="contact@example.com" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="prof-linkedin" className="block text-xs font-medium text-slate-600 mb-1">LinkedIn URL</label>
              <Input id="prof-linkedin" value={form.linkedInUrl ?? ''} onChange={(e) => setForm((f) => ({ ...f, linkedInUrl: e.target.value }))} placeholder="https://linkedin.com/in/…" className="h-9 text-sm" />
            </div>
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
