import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  FileText,
  Shield,
  Wrench,
  BookA,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Calendar,
  MoreVertical,
  Library,
  Upload,
  Loader2,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import {
  useAdminResources,
  useAdminResourceCategories,
  useAdminGlossaryTerms,
  useAdminCreateResource,
  useAdminUpdateResource,
  useAdminDeleteResource,
  useAdminCreateGlossaryTerm,
  useAdminUpdateGlossaryTerm,
  useAdminDeleteGlossaryTerm,
  type AdminResource,
  type AdminGlossaryTerm,
  type AdminResourceType,
  type CreateResourceDto,
  type CreateGlossaryTermDto,
} from '@/hooks/useAdmin'
import api from '@/lib/api'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1 } }

/* ── Section config ─────────────────────────────────────────────────────── */
type SectionKey = 'educational' | 'research' | 'standards' | 'tools' | 'glossary'

interface SectionConfig {
  key: SectionKey
  label: string
  icon: React.ElementType
  description: string
}

const SECTIONS: SectionConfig[] = [
  { key: 'educational', label: 'Educational Guides',          icon: BookOpen, description: 'Introductory and explanatory guides on Islamic finance fundamentals.' },
  { key: 'research',    label: 'Research & Publications',     icon: FileText, description: 'Academic and industry research, whitepapers, case studies and journal articles.' },
  { key: 'standards',   label: 'Standards & Governance',      icon: Shield,   description: 'Shariah standards, regulatory frameworks, policy documents and compliance manuals.' },
  { key: 'tools',       label: 'Tools & Practical Resources', icon: Wrench,   description: 'Financial planning templates, contract templates and downloadable worksheets.' },
]

const SECTION_TO_TYPE: Record<Exclude<SectionKey, 'glossary'>, AdminResourceType> = {
  educational: 'guide',
  research: 'research',
  standards: 'standard',
  tools: 'tool',
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  archived: 'bg-orange-50 text-orange-700',
}

/* ── Form types ─────────────────────────────────────────────────────────── */
interface ResourceForm {
  title: string
  authorName: string
  authorType: 'individual' | 'organization'
  topic: string
  briefIntro: string
  categoryId: string
  coverImageUrl: string
  fileUrl: string
  status: 'draft' | 'published' | 'archived'
  isPremium: boolean
}

const EMPTY_FORM: ResourceForm = {
  title: '', authorName: '', authorType: 'organization', topic: '', briefIntro: '',
  categoryId: '', coverImageUrl: '', fileUrl: '', status: 'draft', isPremium: false,
}

interface GlossaryForm { term: string; definition: string; status: 'draft' | 'published' }
const EMPTY_GLOSSARY_FORM: GlossaryForm = { term: '', definition: '', status: 'draft' }

/* ── Component ──────────────────────────────────────────────────────────── */
export default function AdminResources() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabFromUrl = (new URLSearchParams(location.search).get('tab') ?? 'educational') as SectionKey
  const validKeys: SectionKey[] = ['educational', 'research', 'standards', 'tools', 'glossary']
  const [activeSection, setActiveSection] = useState<SectionKey>(
    validKeys.includes(tabFromUrl) ? tabFromUrl : 'educational'
  )

  const handleSetSection = (key: SectionKey) => {
    setActiveSection(key)
    navigate(`?tab=${key}`, { replace: true })
    setSearch('')
    setOpenMenu(null)
  }

  const currentType = activeSection !== 'glossary'
    ? SECTION_TO_TYPE[activeSection as Exclude<SectionKey, 'glossary'>]
    : undefined

  /* ── API hooks ──────────────────────────────────────────────────────── */
  const { data: resourcesData, isLoading: resourcesLoading } = useAdminResources(
    currentType ? { resourceType: currentType, perPage: 100 } : { perPage: 1 }
  )
  const { data: glossaryData, isLoading: glossaryLoading } = useAdminGlossaryTerms(
    activeSection === 'glossary' ? {} : { letter: 'A' }
  )
  const { data: categories } = useAdminResourceCategories()

  const { data: allResStats }   = useAdminResources({ perPage: 1 })
  const { data: allGlossStats } = useAdminGlossaryTerms()

  const createResource  = useAdminCreateResource()
  const updateResource  = useAdminUpdateResource()
  const deleteResource  = useAdminDeleteResource()
  const createGlossTerm = useAdminCreateGlossaryTerm()
  const updateGlossTerm = useAdminUpdateGlossaryTerm()
  const deleteGlossTerm = useAdminDeleteGlossaryTerm()

  /* ── Local UI state ─────────────────────────────────────────────────── */
  const [search, setSearch]     = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const [modalOpen, setModalOpen]           = useState(false)
  const [editId, setEditId]                 = useState<string | null>(null)
  const [form, setForm]                     = useState<ResourceForm>(EMPTY_FORM)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile]     = useState<File | null>(null)
  const [uploading, setUploading]           = useState(false)

  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false)
  const [editGlossaryId, setEditGlossaryId]        = useState<string | null>(null)
  const [glossaryForm, setGlossaryForm]             = useState<GlossaryForm>(EMPTY_GLOSSARY_FORM)

  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [bulkPreview, setBulkPreview]       = useState<{ term: string; definition: string; status: 'draft' | 'published' }[]>([])
  const [bulkError, setBulkError]           = useState<string | null>(null)
  const [bulkImporting, setBulkImporting]   = useState(false)

  /* ── Derived lists ──────────────────────────────────────────────────── */
  const lc = search.toLowerCase()
  const items = (resourcesData?.data ?? []).filter(r =>
    !search || r.title.toLowerCase().includes(lc) || (r.authorName ?? '').toLowerCase().includes(lc)
  )
  const filteredGlossary = (glossaryData ?? []).filter(g =>
    !search || g.term.toLowerCase().includes(lc)
  )

  /* ── Header stats ───────────────────────────────────────────────────── */
  const totalContent = (allResStats?.meta?.itemCount ?? 0) + (allGlossStats?.length ?? 0)
  const tabPublished = items.filter(r => r.status === 'published').length
  const tabDrafts    = items.filter(r => r.status === 'draft').length
  const tabDownloads = items.reduce((s, r) => s + r.downloadCount, 0)

  /* ── File upload helper ─────────────────────────────────────────────── */
  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post<{ url: string }>('/file-upload/test', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.url
  }

  /* ── Resource CRUD ──────────────────────────────────────────────────── */
  function openCreate() {
    setEditId(null); setForm({ ...EMPTY_FORM }); setCoverImageFile(null); setDocumentFile(null); setModalOpen(true)
  }

  function openEdit(r: AdminResource) {
    setEditId(r.id)
    setForm({
      title: r.title,
      authorName: r.authorName ?? '',
      authorType: r.authorType ?? 'organization',
      topic: r.topic ?? '',
      briefIntro: r.briefIntro ?? '',
      categoryId: r.categoryId ?? '',
      coverImageUrl: r.coverImageUrl ?? '',
      fileUrl: r.fileUrl ?? '',
      status: r.status,
      isPremium: r.isPremium,
    })
    setCoverImageFile(null); setDocumentFile(null); setOpenMenu(null); setModalOpen(true)
  }

  async function saveResource() {
    if (!form.title.trim() || !currentType) return
    try {
      setUploading(true)
      let coverImageUrl = form.coverImageUrl
      let fileUrl = form.fileUrl
      if (coverImageFile) coverImageUrl = await uploadFile(coverImageFile)
      if (documentFile)   fileUrl       = await uploadFile(documentFile)

      const dto: CreateResourceDto = {
        title: form.title.trim(),
        resourceType: currentType,
        status: form.status,
        isPremium: form.isPremium,
        ...(form.authorName && { authorName: form.authorName }),
        ...(form.authorType && { authorType: form.authorType }),
        ...(form.topic      && { topic: form.topic }),
        ...(form.briefIntro && { briefIntro: form.briefIntro }),
        ...(form.categoryId && { categoryId: form.categoryId }),
        ...(coverImageUrl   && { coverImageUrl }),
        ...(fileUrl         && { fileUrl }),
      }
      if (editId) {
        await updateResource.mutateAsync({ id: editId, dto })
      } else {
        await createResource.mutateAsync(dto)
      }
      setModalOpen(false)
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteResource(id: string) {
    await deleteResource.mutateAsync(id); setOpenMenu(null)
  }

  async function togglePublish(r: AdminResource) {
    const newStatus: 'draft' | 'published' = r.status === 'published' ? 'draft' : 'published'
    await updateResource.mutateAsync({ id: r.id, dto: { status: newStatus } }); setOpenMenu(null)
  }

  /* ── Glossary CRUD ──────────────────────────────────────────────────── */
  function openCreateGlossary() {
    setEditGlossaryId(null); setGlossaryForm(EMPTY_GLOSSARY_FORM); setGlossaryModalOpen(true)
  }

  function openEditGlossary(g: AdminGlossaryTerm) {
    setEditGlossaryId(g.id)
    setGlossaryForm({ term: g.term, definition: g.definition, status: g.status })
    setOpenMenu(null); setGlossaryModalOpen(true)
  }

  async function saveGlossary() {
    if (!glossaryForm.term.trim()) return
    const dto: CreateGlossaryTermDto = {
      term: glossaryForm.term.trim(),
      definition: glossaryForm.definition.trim(),
      status: glossaryForm.status,
    }
    if (editGlossaryId) {
      await updateGlossTerm.mutateAsync({ id: editGlossaryId, dto })
    } else {
      await createGlossTerm.mutateAsync(dto)
    }
    setGlossaryModalOpen(false)
  }

  async function handleDeleteGlossary(id: string) {
    await deleteGlossTerm.mutateAsync(id); setOpenMenu(null)
  }

  async function toggleGlossaryPublish(g: AdminGlossaryTerm) {
    const newStatus: 'draft' | 'published' = g.status === 'published' ? 'draft' : 'published'
    await updateGlossTerm.mutateAsync({ id: g.id, dto: { status: newStatus } }); setOpenMenu(null)
  }

  /* ── Bulk CSV import ────────────────────────────────────────────────── */
  function handleBulkFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBulkError(null); setBulkPreview([])
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      if (!text) { setBulkError('Could not read file.'); return }
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) { setBulkError('File must have a header row and at least one data row.'); return }
      const header = lines[0]
      const delim = header.includes('\t') ? '\t' : header.includes(';') ? ';' : ','
      const cols = header.split(delim).map(c => c.replace(/^"|"$/g, '').trim().toLowerCase())
      const termIdx   = cols.findIndex(c => ['term', 'word', 'title'].includes(c))
      const defIdx    = cols.findIndex(c => ['definition', 'description', 'meaning', 'desc'].includes(c))
      const statusIdx = cols.findIndex(c => c === 'status')
      if (termIdx === -1 || defIdx === -1) {
        setBulkError(`Could not find 'term' and 'definition' columns. Found: ${cols.join(', ')}`)
        return
      }
      const parsed: { term: string; definition: string; status: 'draft' | 'published' }[] = []
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(delim).map(c => c.replace(/^"|"$/g, '').trim())
        const term = row[termIdx]; const definition = row[defIdx]
        if (!term || !definition) continue
        const rawStatus = (row[statusIdx] ?? '').toLowerCase()
        parsed.push({ term, definition, status: rawStatus === 'published' ? 'published' : 'draft' })
      }
      if (parsed.length === 0) { setBulkError('No valid rows found in the file.'); return }
      setBulkPreview(parsed)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function confirmBulkImport() {
    setBulkImporting(true)
    try {
      for (const row of bulkPreview) {
        await createGlossTerm.mutateAsync({ term: row.term, definition: row.definition, status: row.status })
      }
      setBulkPreview([]); setBulkImportOpen(false); setBulkError(null)
    } finally {
      setBulkImporting(false)
    }
  }

  const isSaving        = uploading || createResource.isPending || updateResource.isPending
  const isGlossarySaving = createGlossTerm.isPending || updateGlossTerm.isPending
  const isCurrentLoading = activeSection === 'glossary' ? glossaryLoading : resourcesLoading

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D52B1E]/10 flex items-center justify-center">
            <Library className="h-5 w-5 text-[#D52B1E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Resources Management</h1>
            <p className="text-slate-500 text-sm">Manage all resource sections — guides, publications, standards, tools & glossary</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeSection === 'glossary' && (
            <Button size="sm" variant="outline" className="rounded-lg gap-1.5 border-[#D52B1E] text-[#D52B1E] hover:bg-[#FFEFEF]"
              onClick={() => { setBulkImportOpen(true); setBulkPreview([]); setBulkError(null) }}>
              <Upload className="h-3.5 w-3.5" /> Bulk Import
            </Button>
          )}
          <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5"
            onClick={activeSection === 'glossary' ? openCreateGlossary : openCreate}>
            <Plus className="h-3.5 w-3.5" />
            {activeSection === 'glossary' ? 'Add Term' : 'Upload Resource'}
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Content',   value: totalContent,                color: '#D52B1E' },
          { label: 'Published',       value: tabPublished,                color: '#10b981' },
          { label: 'Drafts',          value: tabDrafts,                   color: '#6b7280' },
          { label: 'Downloads (tab)', value: tabDownloads.toLocaleString(), color: '#3b82f6' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Section Tabs + Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {[...SECTIONS, { key: 'glossary' as SectionKey, label: 'Glossary', icon: BookA, description: '' }].map(s => (
            <button key={s.key} onClick={() => handleSetSection(s.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === s.key
                  ? 'border-[#D52B1E] text-[#D52B1E] bg-[#FFEFEF]/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <s.icon className="h-4 w-4" />{s.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder={activeSection === 'glossary' ? 'Search terms\u2026' : 'Search resources\u2026'}
              value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
        </div>

        {isCurrentLoading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Loading\u2026</span>
          </div>
        ) : activeSection === 'glossary' ? (
          <GlossaryTable entries={filteredGlossary} openMenu={openMenu} setOpenMenu={setOpenMenu}
            onEdit={openEditGlossary} onDelete={handleDeleteGlossary} onTogglePublish={toggleGlossaryPublish}
            deleting={deleteGlossTerm.isPending} />
        ) : (
          <ResourceTable items={items} categories={categories ?? []} openMenu={openMenu} setOpenMenu={setOpenMenu}
            onEdit={openEdit} onDelete={handleDeleteResource} onTogglePublish={togglePublish}
            deleting={deleteResource.isPending} />
        )}
      </motion.div>

      {/* Resource Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Resource' : 'Upload Resource'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="res-title" className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-500">*</span></label>
            <Input id="res-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Resource title" className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-author" className="block text-xs font-medium text-slate-600 mb-1">Author / Source</label>
              <Input id="res-author" value={form.authorName} onChange={e => setForm(f => ({ ...f, authorName: e.target.value }))} placeholder="Author or organisation" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="res-atype" className="block text-xs font-medium text-slate-600 mb-1">Author Type</label>
              <Select id="res-atype" value={form.authorType} onChange={e => setForm(f => ({ ...f, authorType: e.target.value as 'individual' | 'organization' }))}>
                <option value="organization">Organisation</option>
                <option value="individual">Individual</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-topic" className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
              <Input id="res-topic" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Fundamentals" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="res-category" className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <Select id="res-category" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}>
                <option value="">— Select category —</option>
                {(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="res-intro" className="block text-xs font-medium text-slate-600 mb-1">Brief Introduction</label>
            <textarea id="res-intro" value={form.briefIntro} onChange={e => setForm(f => ({ ...f, briefIntro: e.target.value }))}
              placeholder="Short description shown on the resource card\u2026" rows={3}
              className="w-full bg-background text-foreground text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none placeholder:text-muted-foreground focus:outline-none focus:border-[#D52B1E]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1"><Upload className="h-3 w-3 inline mr-1" />Cover Image</label>
              <label className="flex items-center gap-2 cursor-pointer w-full h-9 text-sm border border-gray-200 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                <input type="file" accept="image/*" className="sr-only" onChange={e => setCoverImageFile(e.target.files?.[0] ?? null)} />
                <Upload className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate text-gray-500">{coverImageFile ? coverImageFile.name : form.coverImageUrl ? 'Replace image\u2026' : 'Choose image\u2026'}</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1"><Upload className="h-3 w-3 inline mr-1" />Document / PDF</label>
              <label className="flex items-center gap-2 cursor-pointer w-full h-9 text-sm border border-gray-200 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={e => setDocumentFile(e.target.files?.[0] ?? null)} />
                <Upload className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate text-gray-500">{documentFile ? documentFile.name : form.fileUrl ? 'Replace file\u2026' : 'Choose file\u2026'}</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <Select id="res-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ResourceForm['status'] }))}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 accent-[#D52B1E]" />
                <Lock className="h-3.5 w-3.5 text-amber-500" /> Premium content
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setModalOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" disabled={!form.title.trim() || isSaving} onClick={saveResource}>
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editId ? 'Save Changes' : 'Upload Resource'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Glossary Modal */}
      <Dialog open={glossaryModalOpen} onClose={() => setGlossaryModalOpen(false)} title={editGlossaryId ? 'Edit Term' : 'Add Glossary Term'} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div>
            <label htmlFor="gl-term" className="block text-xs font-medium text-slate-600 mb-1">Term <span className="text-red-500">*</span></label>
            <Input id="gl-term" value={glossaryForm.term} onChange={e => setGlossaryForm(f => ({ ...f, term: e.target.value }))} placeholder="e.g. Murabaha" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="gl-def" className="block text-xs font-medium text-slate-600 mb-1">Definition</label>
            <textarea id="gl-def" value={glossaryForm.definition} onChange={e => setGlossaryForm(f => ({ ...f, definition: e.target.value }))}
              placeholder="Clear definition of the term\u2026" rows={4}
              className="w-full bg-background text-foreground text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none placeholder:text-muted-foreground focus:outline-none focus:border-[#D52B1E]" />
          </div>
          <div>
            <label htmlFor="gl-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <Select id="gl-status" value={glossaryForm.status} onChange={e => setGlossaryForm(f => ({ ...f, status: e.target.value as 'published' | 'draft' }))}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setGlossaryModalOpen(false)} disabled={isGlossarySaving}>Cancel</Button>
            <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" disabled={!glossaryForm.term.trim() || isGlossarySaving} onClick={saveGlossary}>
              {isGlossarySaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editGlossaryId ? 'Save Changes' : 'Add Term'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Bulk Import Modal */}
      <Dialog open={bulkImportOpen} onClose={() => { setBulkImportOpen(false); setBulkPreview([]); setBulkError(null) }} title="Bulk Import Glossary Terms" maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800">
            <strong>Accepted formats:</strong> CSV or Excel (exported as CSV). Header must include <strong>term</strong> and <strong>definition</strong> columns. Optional <strong>status</strong> column. Delimiters: comma, semicolon, or tab.
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Choose CSV / Excel file</label>
            <label className="flex items-center gap-3 cursor-pointer w-full h-24 border-2 border-dashed border-gray-200 rounded-xl px-4 hover:bg-gray-50 transition-colors">
              <input type="file" accept=".csv,.tsv,.txt,.xls,.xlsx" className="sr-only" onChange={handleBulkFile} />
              <Upload className="h-6 w-6 text-gray-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-700">Click to select file</p>
                <p className="text-xs text-gray-400 mt-0.5">CSV, TSV or Excel (.csv / .xls / .xlsx)</p>
              </div>
            </label>
          </div>
          {bulkError && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <strong>Error:</strong> {bulkError}
            </div>
          )}
          {bulkPreview.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Preview \u2014 {bulkPreview.length} term{bulkPreview.length !== 1 ? 's' : ''} found</p>
              <div className="rounded-xl border border-gray-100 overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-left">Term</th>
                      <th className="px-3 py-2 text-left">Definition</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bulkPreview.map((g, i) => (
                      <tr key={`${g.term}-${i}`} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 font-semibold text-slate-800">{g.term}</td>
                        <td className="px-3 py-2 text-slate-500 max-w-xs"><p className="line-clamp-2">{g.definition}</p></td>
                        <td className="px-3 py-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[g.status] ?? ''}`}>{g.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => { setBulkImportOpen(false); setBulkPreview([]); setBulkError(null) }} disabled={bulkImporting}>Cancel</Button>
            <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" disabled={bulkPreview.length === 0 || bulkImporting} onClick={confirmBulkImport}>
              {bulkImporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Import {bulkPreview.length > 0 ? `${bulkPreview.length} Terms` : 'Terms'}
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}

/* ── Resource Table sub-component ───────────────────────────────────────── */
interface ResourceTableProps {
  readonly items: AdminResource[]
  readonly categories: { id: string; name: string }[]
  readonly openMenu: string | null
  readonly setOpenMenu: (id: string | null) => void
  readonly onEdit: (r: AdminResource) => void
  readonly onDelete: (id: string) => Promise<void>
  readonly onTogglePublish: (r: AdminResource) => Promise<void>
  readonly deleting: boolean
}

function ResourceTable({ items, openMenu, setOpenMenu, onEdit, onDelete, onTogglePublish, deleting }: ResourceTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No resources found.</p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Resource</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Author</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Views</th>
            <th className="px-4 py-3 text-left hidden sm:table-cell">Downloads</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map(r => (
            <tr key={r.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#D52B1E] shrink-0" />
                  <p className="font-medium text-slate-800 line-clamp-1">{r.title}</p>
                  {r.isPremium && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                </div>
                {r.topic && <p className="text-xs text-slate-400 mt-0.5 ml-6">{r.topic}</p>}
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                {r.category
                  ? <Badge variant="outline" className="text-xs border-gray-200 text-slate-500">{r.category.name}</Badge>
                  : <span className="text-xs text-slate-300">\u2014</span>}
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{r.authorName ?? '\u2014'}</td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{r.viewCount.toLocaleString()}</span>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                <span className="flex items-center gap-1"><Download className="h-3 w-3" />{r.downloadCount.toLocaleString()}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[r.status] ?? ''}`}>{r.status}</span>
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(r.publishedAt ?? r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === r.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                      <button onClick={() => onEdit(r)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                      <button onClick={() => onTogglePublish(r)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                        <Eye className="h-3.5 w-3.5 text-green-600" /> {r.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => onDelete(r.id)} disabled={deleting} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50">
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
    </div>
  )
}

/* ── Glossary Table sub-component ───────────────────────────────────────── */
interface GlossaryTableProps {
  readonly entries: AdminGlossaryTerm[]
  readonly openMenu: string | null
  readonly setOpenMenu: (id: string | null) => void
  readonly onEdit: (g: AdminGlossaryTerm) => void
  readonly onDelete: (id: string) => Promise<void>
  readonly onTogglePublish: (g: AdminGlossaryTerm) => Promise<void>
  readonly deleting: boolean
}

function GlossaryTable({ entries, openMenu, setOpenMenu, onEdit, onDelete, onTogglePublish, deleting }: GlossaryTableProps) {
  if (entries.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <BookA className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No glossary terms found.</p>
      </div>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th className="px-4 py-3 text-left">Term</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Definition</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {entries.map(g => (
            <tr key={g.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3 font-semibold text-slate-800">{g.term}</td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell max-w-xs">
                <p className="line-clamp-2">{g.definition}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[g.status] ?? ''}`}>{g.status}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button onClick={() => setOpenMenu(openMenu === g.id ? null : g.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === g.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                      <button onClick={() => onEdit(g)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                      <button onClick={() => onTogglePublish(g)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                        <Eye className="h-3.5 w-3.5 text-green-600" /> {g.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => onDelete(g.id)} disabled={deleting} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50">
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
    </div>
  )
}
