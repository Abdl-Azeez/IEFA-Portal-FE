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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1 } }

/* ── Section config ─────────────────────────────────────────────────────── */
type SectionKey = 'educational' | 'research' | 'standards' | 'tools' | 'glossary'

interface Section {
  key: SectionKey
  label: string
  icon: React.ElementType
  description: string
  categories: string[]
  sampleItems: ResourceEntry[]
}

interface ResourceEntry {
  id: string
  title: string
  author: string
  category: string
  topic: string
  date: string
  status: 'published' | 'draft'
  views: number
  downloads: number
}

interface GlossaryEntry {
  id: string
  term: string
  definition: string
  status: 'published' | 'draft'
}

/* ── Sample / placeholder data ──────────────────────────────────────────── */
const SECTIONS: Section[] = [
  {
    key: 'educational',
    label: 'Educational Guides',
    icon: BookOpen,
    description: 'Introductory and explanatory guides on Islamic finance fundamentals.',
    categories: ['Introduction', 'Banking', 'Investment', 'Fixed Income'],
    sampleItems: [
      { id: 'e1', title: 'What is Islamic Finance?', author: 'IEFA Academy', category: 'Introduction', topic: 'Fundamentals', date: 'Mar 5, 2026', status: 'published', views: 1240, downloads: 856 },
      { id: 'e2', title: 'Islamic Banking Basics', author: 'Dr. Ahmed Hassan', category: 'Banking', topic: 'Banking', date: 'Feb 20, 2026', status: 'published', views: 980, downloads: 620 },
      { id: 'e3', title: 'Halal Investing Guide', author: 'Halal Wealth Advisory', category: 'Investment', topic: 'Investing', date: 'Feb 10, 2026', status: 'draft', views: 0, downloads: 0 },
    ],
  },
  {
    key: 'research',
    label: 'Research & Publications',
    icon: FileText,
    description: 'Academic and industry research, whitepapers, case studies and journal articles.',
    categories: ['Industry Reports', 'White Papers', 'Academic Journals', 'Case Studies', 'Conference Papers'],
    sampleItems: [
      { id: 'r1', title: 'Global Islamic Finance Industry Report 2026', author: 'IEFA Research Institute', category: 'Industry Reports', topic: 'Industry Report', date: 'Mar 1, 2026', status: 'published', views: 2100, downloads: 1450 },
      { id: 'r2', title: 'Fintech and Islamic Finance', author: 'Prof. Fatima Al-Rashid', category: 'White Papers', topic: 'White Paper', date: 'Feb 15, 2026', status: 'published', views: 1560, downloads: 890 },
      { id: 'r3', title: 'Al Rajhi Bank Digital Transformation', author: 'Cambridge IF Institute', category: 'Case Studies', topic: 'Case Study', date: 'Jan 30, 2026', status: 'draft', views: 0, downloads: 0 },
    ],
  },
  {
    key: 'standards',
    label: 'Standards & Governance',
    icon: Shield,
    description: 'Shariah standards, regulatory frameworks, policy documents and compliance manuals.',
    categories: ['Shariah Standards', 'Regulatory Frameworks', 'Policy Documents', 'Compliance Manuals'],
    sampleItems: [
      { id: 's1', title: 'AAOIFI Shariah Standards 2026', author: 'AAOIFI', category: 'Shariah Standards', topic: 'Standards', date: 'Mar 8, 2026', status: 'published', views: 3200, downloads: 2100 },
      { id: 's2', title: 'Regulatory Framework for Islamic Digital Banks', author: 'IFSB', category: 'Regulatory Frameworks', topic: 'Regulatory', date: 'Feb 25, 2026', status: 'published', views: 1800, downloads: 1050 },
      { id: 's3', title: 'Policy Document on Shariah Governance', author: 'Malaysian Central Bank', category: 'Policy Documents', topic: 'Policy', date: 'Feb 5, 2026', status: 'draft', views: 0, downloads: 0 },
    ],
  },
  {
    key: 'tools',
    label: 'Tools & Practical Resources',
    icon: Wrench,
    description: 'Financial planning templates, contract templates and downloadable worksheets.',
    categories: ['Financial Planning Templates', 'Contract Templates', 'Downloadable Guides', 'Worksheets'],
    sampleItems: [
      { id: 't1', title: 'Islamic Financial Planning Template Kit', author: 'IEFA Tools Team', category: 'Financial Planning Templates', topic: 'Template', date: 'Mar 10, 2026', status: 'published', views: 1650, downloads: 1200 },
      { id: 't2', title: 'Islamic Finance Contract Templates Collection', author: 'Shariah Contracts Hub', category: 'Contract Templates', topic: 'Template', date: 'Mar 3, 2026', status: 'published', views: 1300, downloads: 980 },
      { id: 't3', title: 'Due Diligence Worksheet', author: 'Dr. Sarah Khan', category: 'Worksheets', topic: 'Worksheet', date: 'Feb 18, 2026', status: 'draft', views: 0, downloads: 0 },
    ],
  },
]

const INITIAL_GLOSSARY: GlossaryEntry[] = [
  { id: 'g1', term: 'Murabaha', definition: 'A cost-plus financing structure where the seller discloses cost and profit margin to the buyer.', status: 'published' },
  { id: 'g2', term: 'Sukuk', definition: 'Islamic financial certificates representing proportional ownership in an underlying asset.', status: 'published' },
  { id: 'g3', term: 'Ijarah', definition: 'An Islamic leasing arrangement where the lessor purchases and leases an asset to the lessee.', status: 'published' },
  { id: 'g4', term: 'Takaful', definition: 'Islamic insurance based on mutual cooperation and shared responsibility.', status: 'draft' },
]

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
}

/* ── Empty form ─────────────────────────────────────────────────────────── */
interface ResourceForm {
  title: string
  author: string
  category: string
  topic: string
  briefIntro: string
  displayImage: string
  fileUrl: string
  status: 'published' | 'draft'
}

const EMPTY_FORM: ResourceForm = {
  title: '', author: '', category: '', topic: '', briefIntro: '',
  displayImage: '', fileUrl: '', status: 'draft',
}

interface GlossaryForm { term: string; definition: string; status: 'published' | 'draft' }
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

  // Keep URL in sync when tab changes
  const handleSetSection = (key: SectionKey) => {
    setActiveSection(key)
    navigate(`?tab=${key}`, { replace: true })
  }
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  /* Resource modal */
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ResourceForm>(EMPTY_FORM)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  /* Local data store keyed by section */
  const [sectionData, setSectionData] = useState<Record<SectionKey, ResourceEntry[]>>({
    educational: SECTIONS[0].sampleItems,
    research: SECTIONS[1].sampleItems,
    standards: SECTIONS[2].sampleItems,
    tools: SECTIONS[3].sampleItems,
    glossary: [],
  })

  /* Glossary modal */
  const [glossaryModalOpen, setGlossaryModalOpen] = useState(false)
  const [editGlossaryId, setEditGlossaryId] = useState<string | null>(null)
  const [glossaryForm, setGlossaryForm] = useState<GlossaryForm>(EMPTY_GLOSSARY_FORM)
  const [glossaryData, setGlossaryData] = useState<GlossaryEntry[]>(INITIAL_GLOSSARY)

  const section = SECTIONS.find(s => s.key === activeSection)
  const items = (sectionData[activeSection] ?? []).filter(r =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.author.toLowerCase().includes(search.toLowerCase())
  )

  /* ── Resource CRUD ────────────────────────────────────────────────────── */
  function openCreate() {
    setEditId(null)
    setForm({ ...EMPTY_FORM, category: section?.categories[0] ?? '' })
    setCoverImageFile(null)
    setDocumentFile(null)
    setModalOpen(true)
  }

  function openEdit(r: ResourceEntry) {
    setEditId(r.id)
    setForm({ title: r.title, author: r.author, category: r.category, topic: r.topic, briefIntro: '', displayImage: '', fileUrl: '', status: r.status })
    setCoverImageFile(null)
    setDocumentFile(null)
    setOpenMenu(null)
    setModalOpen(true)
  }

  function saveResource() {
    if (!form.title.trim()) return
    setSectionData(prev => {
      const current = prev[activeSection]
      if (editId) {
        return { ...prev, [activeSection]: current.map(r => r.id === editId ? { ...r, title: form.title, author: form.author, category: form.category, topic: form.topic, status: form.status } : r) }
      }
      const newEntry: ResourceEntry = {
        id: `new-${Date.now()}`, title: form.title, author: form.author,
        category: form.category, topic: form.topic,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: form.status, views: 0, downloads: 0,
      }
      return { ...prev, [activeSection]: [newEntry, ...current] }
    })
    setModalOpen(false)
  }

  function deleteResource(id: string) {
    setSectionData(prev => ({ ...prev, [activeSection]: prev[activeSection].filter(r => r.id !== id) }))
    setOpenMenu(null)
  }

  function togglePublish(id: string) {
    setSectionData(prev => ({
      ...prev,
      [activeSection]: prev[activeSection].map(r => r.id === id ? { ...r, status: r.status === 'published' ? 'draft' : 'published' } : r),
    }))
    setOpenMenu(null)
  }

  /* ── Glossary CRUD ────────────────────────────────────────────────────── */
  const filteredGlossary = glossaryData.filter(g =>
    !search || g.term.toLowerCase().includes(search.toLowerCase())
  )

  function openCreateGlossary() { setEditGlossaryId(null); setGlossaryForm(EMPTY_GLOSSARY_FORM); setGlossaryModalOpen(true) }
  function openEditGlossary(g: GlossaryEntry) { setEditGlossaryId(g.id); setGlossaryForm({ term: g.term, definition: g.definition, status: g.status }); setOpenMenu(null); setGlossaryModalOpen(true) }

  function saveGlossary() {
    if (!glossaryForm.term.trim()) return
    if (editGlossaryId) {
      setGlossaryData(prev => prev.map(g => g.id === editGlossaryId ? { ...g, ...glossaryForm } : g))
    } else {
      setGlossaryData(prev => [{ id: `g-${Date.now()}`, ...glossaryForm }, ...prev])
    }
    setGlossaryModalOpen(false)
  }

  function deleteGlossary(id: string) { setGlossaryData(prev => prev.filter(g => g.id !== id)); setOpenMenu(null) }

  /* ── Total stats ──────────────────────────────────────────────────────── */
  const totalItems = Object.values(sectionData).reduce((s, arr) => s + arr.length, 0) + glossaryData.length
  const totalPublished = Object.values(sectionData).reduce((s, arr) => s + arr.filter(r => r.status === 'published').length, 0) + glossaryData.filter(g => g.status === 'published').length
  const totalDownloads = Object.values(sectionData).reduce((s, arr) => s + arr.reduce((d, r) => d + r.downloads, 0), 0)

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
        <Button
          size="sm"
          className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5"
          onClick={activeSection === 'glossary' ? openCreateGlossary : openCreate}
        >
          <Plus className="h-3.5 w-3.5" />
          {activeSection === 'glossary' ? 'Add Term' : 'Upload Resource'}
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: totalItems, color: '#D52B1E' },
          { label: 'Published', value: totalPublished, color: '#10b981' },
          { label: 'Drafts', value: totalItems - totalPublished, color: '#6b7280' },
          { label: 'Total Downloads', value: totalDownloads.toLocaleString(), color: '#3b82f6' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Section Tabs */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {[...SECTIONS, { key: 'glossary' as SectionKey, label: 'Glossary', icon: BookA, description: '', categories: [], sampleItems: [] }].map(s => (
            <button
              key={s.key}
              onClick={() => { handleSetSection(s.key); setSearch('') }}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSection === s.key
                  ? 'border-[#D52B1E] text-[#D52B1E] bg-[#FFEFEF]/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <s.icon className="h-4 w-4" />
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={activeSection === 'glossary' ? 'Search terms…' : 'Search resources…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg"
            />
          </div>
        </div>

        {/* Table */}
        {activeSection === 'glossary' ? (
          <GlossaryTable
            entries={filteredGlossary}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            onEdit={openEditGlossary}
            onDelete={deleteGlossary}
            onTogglePublish={(id) => { setGlossaryData(prev => prev.map(g => g.id === id ? { ...g, status: g.status === 'published' ? 'draft' : 'published' } : g)); setOpenMenu(null) }}
          />
        ) : (
          <ResourceTable
            items={items}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            onEdit={openEdit}
            onDelete={deleteResource}
            onTogglePublish={togglePublish}
          />
        )}
      </motion.div>

      {/* Resource Upload / Edit Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Resource' : 'Upload Resource'} maxWidth="max-w-xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="res-title" className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-500">*</span></label>
            <Input id="res-title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Resource title" className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-author" className="block text-xs font-medium text-slate-600 mb-1">Author / Source</label>
              <Input id="res-author" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author or organisation" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="res-topic" className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
              <Input id="res-topic" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Fundamentals" className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-category" className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <Select
                id="res-category"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {(section?.categories ?? []).map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label htmlFor="res-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <Select
                id="res-status"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as 'published' | 'draft' }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </div>
          </div>
          <div>
            <label htmlFor="res-intro" className="block text-xs font-medium text-slate-600 mb-1">Brief Introduction</label>
            <textarea
              id="res-intro"
              value={form.briefIntro}
              onChange={e => setForm(f => ({ ...f, briefIntro: e.target.value }))}
              placeholder="Short description shown on the resource card…"
              rows={3}
              className="w-full bg-white text-gray-900 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#D52B1E]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <Upload className="h-3 w-3 inline mr-1" />Cover Image
              </label>
              <label className="flex items-center gap-2 cursor-pointer w-full h-9 text-sm border border-gray-200 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                <input type="file" accept="image/*" className="sr-only" onChange={e => setCoverImageFile(e.target.files?.[0] ?? null)} />
                <Upload className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate text-gray-500">{coverImageFile ? coverImageFile.name : 'Choose image…'}</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <Upload className="h-3 w-3 inline mr-1" />Document / PDF
              </label>
              <label className="flex items-center gap-2 cursor-pointer w-full h-9 text-sm border border-gray-200 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={e => setDocumentFile(e.target.files?.[0] ?? null)} />
                <Upload className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate text-gray-500">{documentFile ? documentFile.name : 'Choose file…'}</span>
              </label>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
            <strong>Note:</strong> Resource APIs are under development. Changes are stored locally and will not persist on refresh.
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg" disabled={!form.title.trim()} onClick={saveResource}>
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
            <textarea
              id="gl-def"
              value={glossaryForm.definition}
              onChange={e => setGlossaryForm(f => ({ ...f, definition: e.target.value }))}
              placeholder="Clear definition of the term…"
              rows={4}
              className="w-full bg-white text-gray-900 text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#D52B1E]"
            />
          </div>
          <div>
            <label htmlFor="gl-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <Select
              id="gl-status"
              value={glossaryForm.status}
              onChange={e => setGlossaryForm(f => ({ ...f, status: e.target.value as 'published' | 'draft' }))}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
            <strong>Note:</strong> Glossary APIs are under development. Changes are stored locally.
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setGlossaryModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg" disabled={!glossaryForm.term.trim()} onClick={saveGlossary}>
              {editGlossaryId ? 'Save Changes' : 'Add Term'}
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}

/* ── Resource Table sub-component ───────────────────────────────────────── */
interface ResourceTableProps {
  readonly items: ResourceEntry[]
  readonly openMenu: string | null
  readonly setOpenMenu: (id: string | null) => void
  readonly onEdit: (r: ResourceEntry) => void
  readonly onDelete: (id: string) => void
  readonly onTogglePublish: (id: string) => void
}

function ResourceTable({ items, openMenu, setOpenMenu, onEdit, onDelete, onTogglePublish }: ResourceTableProps) {
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
                </div>
                <p className="text-xs text-slate-400 mt-0.5 ml-6">{r.topic}</p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Badge variant="outline" className="text-xs border-gray-200 text-slate-500">{r.category}</Badge>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{r.author}</td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{r.views > 0 ? r.views.toLocaleString() : '—'}</span>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                <span className="flex items-center gap-1"><Download className="h-3 w-3" />{r.downloads > 0 ? r.downloads.toLocaleString() : '—'}</span>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[r.status]}`}>{r.status}</span>
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{r.date}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === r.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                      <button onClick={() => onEdit(r)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                      <button onClick={() => onTogglePublish(r.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                        <Eye className="h-3.5 w-3.5 text-green-600" /> {r.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => onDelete(r.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
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
  readonly entries: GlossaryEntry[]
  readonly openMenu: string | null
  readonly setOpenMenu: (id: string | null) => void
  readonly onEdit: (g: GlossaryEntry) => void
  readonly onDelete: (id: string) => void
  readonly onTogglePublish: (id: string) => void
}

function GlossaryTable({ entries, openMenu, setOpenMenu, onEdit, onDelete, onTogglePublish }: GlossaryTableProps) {
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
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[g.status]}`}>{g.status}</span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="relative inline-block">
                  <button onClick={() => setOpenMenu(openMenu === g.id ? null : g.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === g.id && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                      <button onClick={() => onEdit(g)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                      <button onClick={() => onTogglePublish(g.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                        <Eye className="h-3.5 w-3.5 text-green-600" /> {g.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => onDelete(g.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
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
