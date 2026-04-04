import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText,
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
  CheckCircle,
  XCircle,
  Clock,
  FolderTree,
  ChevronRight,
  User,
} from 'lucide-react'
import { BulkUploadDialog } from '@/components/admin/BulkUploadDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import {
  useAdminResources,
  useAdminResourceCategories,
  useAdminResourceRegulatoryBodies,
  useAdminCreateResourceRegulatoryBody,
  useAdminUpdateResourceRegulatoryBody,
  useAdminDeleteResourceRegulatoryBody,
  useAdminGlossaryTerms,
  useAdminCreateResource,
  useAdminUpdateResource,
  useAdminDeleteResource,
  useAdminCreateGlossaryTerm,
  useAdminUpdateGlossaryTerm,
  useAdminDeleteGlossaryTerm,
  useAdminCreateResourceCategory,
  useAdminUpdateResourceCategory,
  useAdminDeleteResourceCategory,
  useAdminPendingResources,
  useAdminApproveResource,
  useAdminRejectResource,
  type AdminResource,
  type AdminResourceStatus,
  type AdminGlossaryTerm,
  type AdminResourceCategory,
  type AdminRegulatoryBody,
  type AdminResourceType,
  type CreateResourceDto,
  type CreateGlossaryTermDto,
} from '@/hooks/useAdmin'
import api from '@/lib/api'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { y: 14, opacity: 0 }, show: { y: 0, opacity: 1 } }

/* ── View config ────────────────────────────────────────────────────────── */
type ViewKey = 'resources' | 'glossary' | 'pending'

type MajorCategoryKey = 'general' | 'regulatory'

const MAJOR_CATEGORIES: Array<{ id: MajorCategoryKey; label: string }> = [
  { id: 'general', label: 'General' },
  { id: 'regulatory', label: 'Regulatory' },
]

const DEFAULT_REGULATORY_BODIES = [
  { id: 'cbn', name: 'CBN', fullName: 'Central Bank of Nigeria' },
  { id: 'sec', name: 'SEC', fullName: 'Securities & Exchange Commission' },
  { id: 'naicom', name: 'NAICOM', fullName: 'National Insurance Commission' },
  { id: 'ndic', name: 'NDIC', fullName: 'Nigeria Deposit Insurance Corporation' },
] as const

const DOCUMENT_TYPES = [
  { id: 'circulars-directives', label: 'Circulars & Directives' },
  { id: 'guidelines-frameworks', label: 'Guidelines & Frameworks' },
  { id: 'notices-press-releases', label: 'Notices & Press Releases' },
  { id: 'data-statistical-bulletins', label: 'Data & Statistical Bulletins' },
  { id: 'communiques', label: 'Communiques' },
] as const

const RESOURCE_TYPE_LABELS: Record<AdminResourceType, string> = {
  guide: 'Educational Guide',
  research: 'Research & Publication',
  standard: 'Standards & Governance',
  tool: 'Tools & Practical',
}

const PENDING_STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

const STATUS_STYLE: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  pending_review: 'bg-amber-50 text-amber-700',
  draft: 'bg-slate-100 text-slate-500',
  archived: 'bg-orange-50 text-orange-700',
}

type AdminStatusFilter = 'all' | AdminResourceStatus
type AdminTypeFilter = 'all' | AdminResourceType
type AdminPremiumFilter = 'all' | 'premium' | 'free'
type AdminRegulatoryFilter = 'all' | 'yes' | 'no'

/* ── Form types ─────────────────────────────────────────────────────────── */
interface ResourceForm {
  title: string
  majorCategory: MajorCategoryKey
  resourceType: AdminResourceType
  authorName: string
  authorType: 'individual' | 'organization'
  topic: string
  briefIntro: string
  categoryId: string
  regulatoryBodyId: string
  docTypeId: string
  customSubCategory: string
  customDocType: string
  coverImageUrl: string
  fileUrl: string
  status: AdminResourceStatus
  isPremium: boolean
}

const EMPTY_FORM: ResourceForm = {
  title: '', majorCategory: 'general', resourceType: 'guide', authorName: '', authorType: 'organization', topic: '', briefIntro: '',
  categoryId: '', regulatoryBodyId: '', docTypeId: '', customSubCategory: '', customDocType: '',
  coverImageUrl: '', fileUrl: '', status: 'draft', isPremium: false,
}

interface GlossaryForm { term: string; definition: string; status: 'draft' | 'published' }
const EMPTY_GLOSSARY_FORM: GlossaryForm = { term: '', definition: '', status: 'draft' }

interface RegulatoryBodyForm {
  name: string
  fullName: string
  description: string
  logoUrl: string
}

interface RegulatoryBodyFormErrors {
  name?: string
  fullName?: string
  logoUrl?: string
}

const EMPTY_REGULATORY_BODY_FORM: RegulatoryBodyForm = {
  name: '',
  fullName: '',
  description: '',
  logoUrl: '',
}

function getMainAction(
  activeView: ViewKey,
  openCreate: () => void,
  openCreateGlossary: () => void,
) {
  if (activeView === 'glossary') {
    return {
      onClick: openCreateGlossary,
      label: 'Add Term',
    }
  }
  return {
    onClick: openCreate,
    label: 'Upload Resource',
  }
}

function renderAdminResourcesSection(args: {
  activeView: ViewKey
  isLoading: boolean
  filteredGlossary: AdminGlossaryTerm[]
  openMenu: string | null
  setOpenMenu: (id: string | null) => void
  openEditGlossary: (g: AdminGlossaryTerm) => void
  handleDeleteGlossary: (id: string) => Promise<void>
  toggleGlossaryPublish: (g: AdminGlossaryTerm) => Promise<void>
  deleteGlossaryPending: boolean
  pendingData: import('@/hooks/useAdmin').PendingResourceSubmission[]
  pendingLoading: boolean
  approveResource: (id: string) => Promise<unknown>
  openRejectModal: (id: string) => void
  approvePending: boolean
  items: AdminResource[]
  openEdit: (r: AdminResource) => void
  handleDeleteResource: (id: string) => Promise<void>
  togglePublish: (r: AdminResource) => Promise<void>
  deleteResourcePending: boolean
}) {
  if (args.isLoading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Loading…</span>
      </div>
    )
  }

  if (args.activeView === 'glossary') {
    return (
      <GlossaryTable entries={args.filteredGlossary} openMenu={args.openMenu} setOpenMenu={args.setOpenMenu}
        onEdit={args.openEditGlossary} onDelete={args.handleDeleteGlossary} onTogglePublish={args.toggleGlossaryPublish}
        deleting={args.deleteGlossaryPending} />
    )
  }

  if (args.activeView === 'pending') {
    return (
      <PendingTable
        items={args.pendingData}
        loading={args.pendingLoading}
        onApprove={id => args.approveResource(id)}
        onReject={args.openRejectModal}
        approving={args.approvePending}
      />
    )
  }

  return (
    <ResourceTable items={args.items} openMenu={args.openMenu} setOpenMenu={args.setOpenMenu}
      onEdit={args.openEdit} onDelete={args.handleDeleteResource} onTogglePublish={args.togglePublish}
      deleting={args.deleteResourcePending} />
  )
}

function buildAdminResourceDto(args: {
  form: ResourceForm
  coverImageUrl: string
  fileUrl: string
  categoryId?: string
  tags: string[]
}): CreateResourceDto {
  const { form, coverImageUrl, fileUrl, categoryId, tags } = args
  const autoSlug = form.title
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .slice(0, 80)

  return {
    title: form.title.trim(),
    slug: autoSlug || undefined,
    description: form.briefIntro || undefined,
    bodyHtml: form.briefIntro ? `<p>${form.briefIntro}</p>` : undefined,
    resourceType: form.resourceType,
    thumbnailUrl: coverImageUrl || undefined,
    attachmentUrl: fileUrl || undefined,
    language: 'en',
    status: form.status,
    publishedYear: new Date().getFullYear(),
    isDownloadable: !!fileUrl,
    isPremium: form.isPremium,
    isFeatured: false,
    ...(form.authorName && { authorName: form.authorName }),
    ...(form.authorName && { publisher: form.authorName }),
    ...(categoryId && { categoryId }),
    ...(form.majorCategory === 'regulatory' && form.regulatoryBodyId
      ? { regulatoryBodyId: form.regulatoryBodyId }
      : {}),
    ...(form.status === 'published'
      ? { publishedAt: new Date().toISOString() }
      : {}),
    ...(tags.length > 0 && { tags }),
  }
}

function deriveResourceTagsAndCategory(form: ResourceForm) {
  const tags: string[] = [`major:${form.majorCategory}`]
  const isGeneralCustomSub = form.majorCategory === 'general' && form.categoryId === '__custom__'
  const isRegCustomDoc = form.majorCategory === 'regulatory' && form.docTypeId === '__custom__'

  if (form.majorCategory === 'regulatory') {
    if (form.regulatoryBodyId) tags.push(`reg-body:${form.regulatoryBodyId}`)
    if (isRegCustomDoc && form.customDocType.trim()) {
      tags.push(`doc-type-custom:${form.customDocType.trim()}`)
    } else if (form.docTypeId) {
      tags.push(`doc-type:${form.docTypeId}`)
    }
  }

  if (isGeneralCustomSub && form.customSubCategory.trim()) {
    tags.push(`general-sub-custom:${form.customSubCategory.trim()}`)
  }

  const categoryId = form.majorCategory === 'general' && !isGeneralCustomSub
    ? (form.categoryId || undefined)
    : undefined

  return { tags, categoryId }
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function AdminResources() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const viewFromUrl = (params.get('tab') ?? 'resources') as ViewKey
  const categoryFromUrl = params.get('category') ?? 'all'
  const validViews: ViewKey[] = ['resources', 'glossary', 'pending']

  const [activeView, setActiveView] = useState<ViewKey>(
    validViews.includes(viewFromUrl) ? viewFromUrl : 'resources'
  )
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categoryFromUrl)
  const [search, setSearch] = useState('')
  const [orderFilter, setOrderFilter] = useState<'ASC' | 'DESC'>('DESC')
  const [statusFilter, setStatusFilter] = useState<AdminStatusFilter>('all')
  const [resourceTypeFilter, setResourceTypeFilter] = useState<AdminTypeFilter>('all')
  const [premiumFilter, setPremiumFilter] = useState<AdminPremiumFilter>('all')
  const [regulatoryFilter, setRegulatoryFilter] = useState<AdminRegulatoryFilter>('all')
  const [resourceTypesCsv, setResourceTypesCsv] = useState('')
  const [languagesCsv, setLanguagesCsv] = useState('')
  const [publishedYearFrom, setPublishedYearFrom] = useState('')
  const [publishedYearTo, setPublishedYearTo] = useState('')
  const [regulatoryBodyFilterId, setRegulatoryBodyFilterId] = useState('')

  const updateRoute = (nextView: ViewKey, nextCategoryId = activeCategoryId) => {
    const nextParams = new URLSearchParams()
    nextParams.set('tab', nextView)
    if (nextCategoryId !== 'all') nextParams.set('category', nextCategoryId)
    navigate(`?${nextParams.toString()}`, { replace: true })
  }

  const handleSetView = (key: ViewKey) => {
    setActiveView(key)
    updateRoute(key)
    setSearch('')
    setOpenMenu(null)
  }

  const handleSetCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId)
    updateRoute(activeView, categoryId)
    setSearch('')
    setOpenMenu(null)
  }

  /* ── API hooks ──────────────────────────────────────────────────────── */
  const numericYearFrom = publishedYearFrom.trim() ? Number(publishedYearFrom) : undefined
  const numericYearTo = publishedYearTo.trim() ? Number(publishedYearTo) : undefined

  let isPremiumQuery: boolean | undefined
  if (premiumFilter === 'premium') isPremiumQuery = true
  else if (premiumFilter === 'free') isPremiumQuery = false

  let isRegulatoryQuery: boolean | undefined
  if (activeCategoryId === 'regulatory' || regulatoryFilter === 'yes') isRegulatoryQuery = true
  else if (activeCategoryId === 'general' || regulatoryFilter === 'no') isRegulatoryQuery = false

  const resourceListParams = useMemo(() => {
    const base: Record<string, unknown> = {
      page: 1,
      perPage: 100,
      order: orderFilter,
    }
    if (search.trim()) base.search = search.trim()
    if (statusFilter !== 'all') base.status = statusFilter
    if (resourceTypeFilter !== 'all') base.resourceType = resourceTypeFilter
    if (resourceTypesCsv.trim()) base.resourceTypes = resourceTypesCsv.trim()
    if (languagesCsv.trim()) base.languages = languagesCsv.trim()
    if (Number.isFinite(numericYearFrom)) base.publishedYearFrom = numericYearFrom
    if (Number.isFinite(numericYearTo)) base.publishedYearTo = numericYearTo
    if (regulatoryBodyFilterId) base.regulatoryBodyId = regulatoryBodyFilterId
    if (typeof isPremiumQuery === 'boolean') base.isPremium = isPremiumQuery
    if (typeof isRegulatoryQuery === 'boolean') base.isRegulatory = isRegulatoryQuery

    const isSpecificCategory =
      activeCategoryId !== 'all' && activeCategoryId !== 'general' && activeCategoryId !== 'regulatory'
    if (isSpecificCategory) base.categoryId = activeCategoryId

    return base
  }, [
    activeCategoryId,
    search,
    orderFilter,
    statusFilter,
    resourceTypeFilter,
    resourceTypesCsv,
    languagesCsv,
    numericYearFrom,
    numericYearTo,
    regulatoryBodyFilterId,
    isPremiumQuery,
    isRegulatoryQuery,
  ])

  const { data: resourcesData, isLoading: resourcesLoading } = useAdminResources(resourceListParams)
  const { data: glossaryData, isLoading: glossaryLoading } = useAdminGlossaryTerms(
    activeView === 'glossary' ? {} : { letter: 'A' }
  )
  const { data: categories } = useAdminResourceCategories()
  const { data: regulatoryBodiesData = [] } = useAdminResourceRegulatoryBodies()

  const regulatoryBodies = useMemo(
    () =>
      regulatoryBodiesData.length > 0
        ? regulatoryBodiesData.map((body) => ({
            id: body.id,
            name: body.name,
            fullName: body.fullName ?? body.name,
            description: body.description,
            logoUrl: body.logoUrl,
          }))
        : DEFAULT_REGULATORY_BODIES.map((body) => ({ ...body })),
    [regulatoryBodiesData],
  )

  const { data: allResStats }   = useAdminResources({ perPage: 1 })
  const { data: allGlossStats } = useAdminGlossaryTerms()

  const createResource  = useAdminCreateResource()
  const updateResource  = useAdminUpdateResource()
  const deleteResource  = useAdminDeleteResource()
  const createGlossTerm = useAdminCreateGlossaryTerm()
  const updateGlossTerm = useAdminUpdateGlossaryTerm()
  const deleteGlossTerm = useAdminDeleteGlossaryTerm()

  /* ── Category CRUD hooks ────────────────────────────────────────────── */
  const createCategory = useAdminCreateResourceCategory()
  const updateCategory = useAdminUpdateResourceCategory()
  const deleteCategory = useAdminDeleteResourceCategory()

  /* ── Pending submissions hooks ──────────────────────────────────────── */
  const { data: pendingData, isLoading: pendingLoading } = useAdminPendingResources()
  const approveResource = useAdminApproveResource()
  const rejectResource  = useAdminRejectResource()
  const createRegulatoryBody = useAdminCreateResourceRegulatoryBody()
  const updateRegulatoryBody = useAdminUpdateResourceRegulatoryBody()
  const deleteRegulatoryBody = useAdminDeleteResourceRegulatoryBody()

  /* ── Local UI state ─────────────────────────────────────────────────── */
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

  const [bulkUploadResourcesOpen, setBulkUploadResourcesOpen] = useState(false)
  const [bulkUploadGlossaryOpen, setBulkUploadGlossaryOpen]   = useState(false)

  /* ── Category form state ────────────────────────────────────────────── */
  const [catModalOpen, setCatModalOpen]   = useState(false)
  const [editCatId, setEditCatId]         = useState<string | null>(null)
  const [catName, setCatName]             = useState('')
  const [catParentId, setCatParentId]     = useState('')         // '' = top-level

  const [regBodyModalOpen, setRegBodyModalOpen] = useState(false)
  const [editRegBodyId, setEditRegBodyId] = useState<string | null>(null)
  const [regBodyForm, setRegBodyForm] = useState<RegulatoryBodyForm>(EMPTY_REGULATORY_BODY_FORM)
  const [regBodyErrors, setRegBodyErrors] = useState<RegulatoryBodyFormErrors>({})

  /* ── Derived lists ──────────────────────────────────────────────────── */
  const lc = search.toLowerCase()
  const childCategories = useMemo(
    () => (categories ?? []).filter(c => !!c.parentId).sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )
  const categoryTabs = useMemo(
    () => (categories ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  )
  const isKnownCategoryId = useMemo(
    () => new Set(categoryTabs.map(c => c.id)),
    [categoryTabs],
  )
  const activeSubCategoryId = isKnownCategoryId.has(activeCategoryId) ? activeCategoryId : ''
  const activeCategoryChildren = useMemo(
    () => childCategories.filter(c => c.parentId === activeSubCategoryId),
    [childCategories, activeSubCategoryId],
  )
  const items = (resourcesData?.data ?? [])
    .filter(r => {
      if (activeCategoryId === 'all') return true
      if (activeCategoryId === 'general') return true
      if (activeCategoryId === 'regulatory') return true
      if (isKnownCategoryId.has(activeCategoryId)) {
        return r.categoryId === activeCategoryId || r.category?.id === activeCategoryId || r.category?.parentId === activeCategoryId
      }
      return true
    })
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
    const tags = r.tags ?? []
    const majorTag = tags.find(t => t.startsWith('major:'))
    const majorCategory: MajorCategoryKey = majorTag === 'major:regulatory' ? 'regulatory' : 'general'
    const regulatoryBodyId = tags.find(t => t.startsWith('reg-body:'))?.replace('reg-body:', '') ?? ''
    const docTypeId = tags.find(t => t.startsWith('doc-type:'))?.replace('doc-type:', '') ?? ''
    const customDocType = tags.find(t => t.startsWith('doc-type-custom:'))?.replace('doc-type-custom:', '') ?? ''
    const customSubCategory = tags.find(t => t.startsWith('general-sub-custom:'))?.replace('general-sub-custom:', '') ?? ''

    setEditId(r.id)
    setForm({
      title: r.title,
      majorCategory,
      resourceType: r.resourceType,
      authorName: r.authorName ?? '',
      authorType: r.authorType ?? 'organization',
      topic: r.topic ?? '',
      briefIntro: r.briefIntro ?? '',
      categoryId: r.categoryId ?? '',
      regulatoryBodyId,
      docTypeId: customDocType ? '__custom__' : docTypeId,
      customSubCategory,
      customDocType,
      coverImageUrl: r.coverImageUrl ?? '',
      fileUrl: r.fileUrl ?? '',
      status: r.status,
      isPremium: r.isPremium,
    })
    setCoverImageFile(null); setDocumentFile(null); setOpenMenu(null); setModalOpen(true)
  }

  async function saveResource() {
    if (!form.title.trim()) return
    try {
      setUploading(true)
      let coverImageUrl = form.coverImageUrl
      let fileUrl = form.fileUrl
      if (coverImageFile) coverImageUrl = await uploadFile(coverImageFile)
      if (documentFile)   fileUrl       = await uploadFile(documentFile)

      const { tags, categoryId } = deriveResourceTagsAndCategory(form)

      const dto = buildAdminResourceDto({
        form,
        coverImageUrl,
        fileUrl,
        categoryId,
        tags,
      })
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

  /* ── Category CRUD ──────────────────────────────────────────────────── */
  function openCreateCategory(parentId = '') {
    setEditCatId(null); setCatName(''); setCatParentId(parentId); setCatModalOpen(true)
  }

  function openEditCategory(cat: AdminResourceCategory) {
    setEditCatId(cat.id)
    setCatName(cat.name)
    setCatParentId(cat.parentId ?? '')
    setCatModalOpen(true)
  }

  async function saveCategory() {
    if (!catName.trim()) return
    const dto = { name: catName.trim(), ...(catParentId ? { parentId: catParentId } : {}) }
    if (editCatId) {
      await updateCategory.mutateAsync({ id: editCatId, dto })
    } else {
      await createCategory.mutateAsync(dto)
    }
    setCatModalOpen(false)
  }

  async function handleDeleteCategory(id: string) {
    await deleteCategory.mutateAsync(id)
  }

  function openCreateRegulatoryBodyModal() {
    setEditRegBodyId(null)
    setRegBodyErrors({})
    setRegBodyForm(EMPTY_REGULATORY_BODY_FORM)
    setRegBodyModalOpen(true)
  }

  function openEditRegulatoryBodyModal(body: AdminRegulatoryBody) {
    setEditRegBodyId(body.id)
    setRegBodyErrors({})
    setRegBodyForm({
      name: body.name ?? '',
      fullName: body.fullName ?? '',
      description: body.description ?? '',
      logoUrl: body.logoUrl ?? '',
    })
    setRegBodyModalOpen(true)
  }

  function validateRegulatoryBodyForm(formData: RegulatoryBodyForm): RegulatoryBodyFormErrors {
    const errors: RegulatoryBodyFormErrors = {}
    const name = formData.name.trim()
    const fullName = formData.fullName.trim()
    const logoUrl = formData.logoUrl.trim()

    if (!name) {
      errors.name = 'Short name is required.'
    } else if (name.length > 20) {
      errors.name = 'Short name must be 20 characters or less.'
    }

    if (!fullName) {
      errors.fullName = 'Full name is required.'
    }

    if (logoUrl) {
      try {
        const parsed = new URL(logoUrl)
        if (!(parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
          errors.logoUrl = 'Logo URL must start with http:// or https://.'
        }
      } catch {
        errors.logoUrl = 'Enter a valid URL.'
      }
    }

    return errors
  }

  async function saveRegulatoryBody() {
    const errors = validateRegulatoryBodyForm(regBodyForm)
    setRegBodyErrors(errors)
    if (Object.keys(errors).length > 0) return

    const dto = {
      name: regBodyForm.name.trim(),
      fullName: regBodyForm.fullName.trim(),
      description: regBodyForm.description.trim() || undefined,
      logoUrl: regBodyForm.logoUrl.trim() || undefined,
    }

    if (editRegBodyId) {
      await updateRegulatoryBody.mutateAsync({ id: editRegBodyId, dto })
    } else {
      await createRegulatoryBody.mutateAsync(dto)
    }

    setRegBodyModalOpen(false)
    setEditRegBodyId(null)
    setRegBodyForm(EMPTY_REGULATORY_BODY_FORM)
    setRegBodyErrors({})
  }

  async function handleDeleteRegulatoryBody(id: string) {
    const confirmed = globalThis.confirm('Delete this regulatory body? This action cannot be undone.')
    if (!confirmed) return
    await deleteRegulatoryBody.mutateAsync(id)
    setOpenMenu(null)
  }

  /* ── Reject reason state ───────────────────────────────────────────── */
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId]   = useState<string | null>(null)
  const [rejectReason, setRejectReason]       = useState('')

  function openRejectModal(id: string) {
    setRejectTargetId(id); setRejectReason(''); setRejectModalOpen(true)
  }
  async function confirmReject() {
    if (!rejectTargetId) return
    await rejectResource.mutateAsync({ id: rejectTargetId, reason: rejectReason || undefined })
    setRejectModalOpen(false); setRejectTargetId(null); setRejectReason('')
  }

  const isSaving        = uploading || createResource.isPending || updateResource.isPending
  const isGlossarySaving = createGlossTerm.isPending || updateGlossTerm.isPending
  let isCurrentLoading = resourcesLoading
  if (activeView === 'glossary') isCurrentLoading = glossaryLoading
  else if (activeView === 'pending') isCurrentLoading = pendingLoading
  let coverImageDisplayName = coverImageFile?.name ?? 'Choose image\u2026'
  if (!coverImageFile && form.coverImageUrl) coverImageDisplayName = 'Replace image\u2026'
  let documentDisplayName = documentFile?.name ?? 'Choose file\u2026'
  if (!documentFile && form.fileUrl) documentDisplayName = 'Replace file\u2026'

  const mainAction = getMainAction(activeView, openCreate, openCreateGlossary)

  const sectionContent = renderAdminResourcesSection({
    activeView,
    isLoading: isCurrentLoading,
    filteredGlossary,
    openMenu,
    setOpenMenu,
    openEditGlossary,
    handleDeleteGlossary,
    toggleGlossaryPublish,
    deleteGlossaryPending: deleteGlossTerm.isPending,
    pendingData: pendingData ?? [],
    pendingLoading,
    approveResource: id => approveResource.mutateAsync(id),
    openRejectModal,
    approvePending: approveResource.isPending,
    items,
    openEdit,
    handleDeleteResource,
    togglePublish,
    deleteResourcePending: deleteResource.isPending,
  })

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
            <p className="text-slate-500 text-sm">Manage resources by category, maintain glossary terms, and review pending submissions.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeView === 'resources' && (
            <Button size="sm" variant="outline" className="rounded-lg gap-1.5 border-[#D52B1E] text-[#D52B1E] hover:bg-[#FFEFEF]"
              onClick={() => setBulkUploadResourcesOpen(true)}>
              <Upload className="h-3.5 w-3.5" /> Bulk Upload
            </Button>
          )}
          {activeView === 'glossary' && (
            <Button size="sm" variant="outline" className="rounded-lg gap-1.5 border-[#D52B1E] text-[#D52B1E] hover:bg-[#FFEFEF]"
              onClick={() => setBulkUploadGlossaryOpen(true)}>
              <Upload className="h-3.5 w-3.5" /> Bulk Upload
            </Button>
          )}
          {(activeView !== 'pending') && (
            <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5"
              onClick={mainAction.onClick}>
              <Plus className="h-3.5 w-3.5" />
              {mainAction.label}
            </Button>
          )}
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

      {/* Main Content Card */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-hide">
          {[
            { key: 'resources' as ViewKey, label: 'Resources', icon: Library },
            { key: 'glossary' as ViewKey, label: 'Glossary', icon: BookA },
            { key: 'pending' as ViewKey, label: 'Pending', icon: Clock },
          ].map(s => (
            <button key={s.key} onClick={() => handleSetView(s.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeView === s.key
                  ? 'border-[#D52B1E] text-[#D52B1E] bg-[#FFEFEF]/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <s.icon className="h-4 w-4" />{s.label}
              {s.key === 'pending' && (pendingData?.length ?? 0) > 0 && (
                <span className="ml-1 text-xs bg-amber-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {pendingData!.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeView === 'resources' && (
          <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleSetCategory('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategoryId === 'all'
                    ? 'bg-[#D52B1E] text-white'
                    : 'bg-white text-slate-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                All Resources
              </button>
              {MAJOR_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleSetCategory(category.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    activeCategoryId === category.id
                      ? 'bg-[#D52B1E] text-white'
                      : 'bg-white text-slate-600 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            {(activeCategoryId === 'general' || isKnownCategoryId.has(activeCategoryId)) && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 uppercase tracking-wide">General sub-categories</span>
                {categoryTabs.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSetCategory(c.id)}
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 transition-colors ${
                      activeCategoryId === c.id
                        ? 'border-[#D52B1E] bg-[#FFEFEF] text-[#D52B1E]'
                        : 'border-gray-200 bg-white text-slate-600 hover:border-gray-300'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {activeCategoryId === 'regulatory' && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 uppercase tracking-wide">Regulatory bodies</span>
                {regulatoryBodies.map(body => (
                  <span key={body.id} className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-slate-500">
                    {body.name}
                  </span>
                ))}
              </div>
            )}

            {activeSubCategoryId && activeCategoryChildren.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 uppercase tracking-wide">Sub-categories</span>
                {activeCategoryChildren.map(sub => (
                  <span key={sub.id} className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-slate-500">
                    {sub.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 border-b border-gray-50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={activeView === 'glossary' ? 'Search terms…' : 'Search resources…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg"
            />
          </div>
          {activeView === 'resources' && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
              <Select value={orderFilter} onChange={e => setOrderFilter(e.target.value as 'ASC' | 'DESC')}>
                <option value="DESC">Order: DESC</option>
                <option value="ASC">Order: ASC</option>
              </Select>
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value as AdminStatusFilter)}>
                <option value="all">Status: All</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
              <Select value={resourceTypeFilter} onChange={e => setResourceTypeFilter(e.target.value as AdminTypeFilter)}>
                <option value="all">Type: All</option>
                <option value="guide">Guide</option>
                <option value="research">Research</option>
                <option value="standard">Standard</option>
                <option value="tool">Tool</option>
              </Select>
              <Select value={premiumFilter} onChange={e => setPremiumFilter(e.target.value as AdminPremiumFilter)}>
                <option value="all">Premium: All</option>
                <option value="premium">Premium</option>
                <option value="free">Free</option>
              </Select>
              <Select value={regulatoryFilter} onChange={e => setRegulatoryFilter(e.target.value as AdminRegulatoryFilter)}>
                <option value="all">Regulatory: All</option>
                <option value="yes">Regulatory: Yes</option>
                <option value="no">Regulatory: No</option>
              </Select>
              <Select value={regulatoryBodyFilterId} onChange={e => setRegulatoryBodyFilterId(e.target.value)}>
                <option value="">Regulatory body: All</option>
                {regulatoryBodies.map(body => (
                  <option key={body.id} value={body.id}>{body.name}</option>
                ))}
              </Select>
              <Input
                value={resourceTypesCsv}
                onChange={e => setResourceTypesCsv(e.target.value)}
                placeholder="resourceTypes CSV: guide,research"
              />
              <Input
                value={languagesCsv}
                onChange={e => setLanguagesCsv(e.target.value)}
                placeholder="languages CSV: english,arabic"
              />
              <Input
                value={publishedYearFrom}
                onChange={e => setPublishedYearFrom(e.target.value)}
                placeholder="publishedYearFrom"
              />
              <Input
                value={publishedYearTo}
                onChange={e => setPublishedYearTo(e.target.value)}
                placeholder="publishedYearTo"
              />
            </div>
          )}
        </div>

        {sectionContent}
      </motion.div>

      {/* Category Management */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Category Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">Create and manage resource categories and sub-categories.</p>
          </div>
          <Button
            size="sm"
            onClick={() => openCreateCategory()}
            className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-xl gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Add Category
          </Button>
        </div>

        <CategoriesPanel
          categories={categories ?? []}
          regulatoryBodies={regulatoryBodies}
          onCreateRegulatoryBody={openCreateRegulatoryBodyModal}
          onEditRegulatoryBody={openEditRegulatoryBodyModal}
          onDeleteRegulatoryBody={handleDeleteRegulatoryBody}
          creatingRegulatoryBody={createRegulatoryBody.isPending}
          updatingRegulatoryBody={updateRegulatoryBody.isPending}
          deletingRegulatoryBody={deleteRegulatoryBody.isPending}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          onEdit={openEditCategory}
          onDelete={handleDeleteCategory}
          onCreateSub={openCreateCategory}
          deleting={deleteCategory.isPending}
        />
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
              <label htmlFor="res-major" className="block text-xs font-medium text-slate-600 mb-1">Major Category</label>
              <Select
                id="res-major"
                value={form.majorCategory}
                onChange={e => setForm(f => ({
                  ...f,
                  majorCategory: e.target.value as MajorCategoryKey,
                  categoryId: '',
                  customSubCategory: '',
                  regulatoryBodyId: '',
                  docTypeId: '',
                  customDocType: '',
                }))}
              >
                <option value="general">General</option>
                <option value="regulatory">Regulatory</option>
              </Select>
            </div>
            <div>
              <label htmlFor="res-rtype" className="block text-xs font-medium text-slate-600 mb-1">Resource Type</label>
              <Select id="res-rtype" value={form.resourceType} onChange={e => setForm(f => ({ ...f, resourceType: e.target.value as AdminResourceType }))}>
                {Object.entries(RESOURCE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </div>
          </div>

          {form.majorCategory === 'general' && (
            <div>
              <label htmlFor="res-category" className="block text-xs font-medium text-slate-600 mb-1">General Sub-category</label>
              <Select id="res-category" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, customSubCategory: '' }))}>
                <option value="">— Select sub-category —</option>
                {categoryTabs.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="__custom__">Other / Not listed…</option>
              </Select>
              {form.categoryId === '__custom__' && (
                <Input
                  value={form.customSubCategory}
                  onChange={e => setForm(f => ({ ...f, customSubCategory: e.target.value }))}
                  placeholder="Enter custom sub-category…"
                  className="h-9 text-sm mt-2"
                />
              )}
            </div>
          )}

          {form.majorCategory === 'regulatory' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="res-reg-body" className="block text-xs font-medium text-slate-600 mb-1">Regulatory Body</label>
                <Select id="res-reg-body" value={form.regulatoryBodyId} onChange={e => setForm(f => ({ ...f, regulatoryBodyId: e.target.value }))}>
                  <option value="">— Select body —</option>
                  {regulatoryBodies.map(b => (
                    <option key={b.id} value={b.id}>{b.name} — {b.fullName}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label htmlFor="res-doc-type" className="block text-xs font-medium text-slate-600 mb-1">Document Type</label>
                <Select id="res-doc-type" value={form.docTypeId} onChange={e => setForm(f => ({ ...f, docTypeId: e.target.value, customDocType: '' }))}>
                  <option value="">— Select doc type —</option>
                  {DOCUMENT_TYPES.map(dt => (
                    <option key={dt.id} value={dt.id}>{dt.label}</option>
                  ))}
                  <option value="__custom__">Other / Not listed…</option>
                </Select>
                {form.docTypeId === '__custom__' && (
                  <Input
                    value={form.customDocType}
                    onChange={e => setForm(f => ({ ...f, customDocType: e.target.value }))}
                    placeholder="Enter custom document type…"
                    className="h-9 text-sm mt-2"
                  />
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="res-topic" className="block text-xs font-medium text-slate-600 mb-1">Topic</label>
            <Input id="res-topic" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Fundamentals" className="h-9 text-sm" />
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
                <span className="truncate text-gray-500">{coverImageDisplayName}</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1"><Upload className="h-3 w-3 inline mr-1" />Document / PDF</label>
              <label className="flex items-center gap-2 cursor-pointer w-full h-9 text-sm border border-gray-200 rounded-lg px-3 hover:bg-gray-50 transition-colors">
                <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={e => setDocumentFile(e.target.files?.[0] ?? null)} />
                <Upload className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <span className="truncate text-gray-500">{documentDisplayName}</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="res-status" className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <Select id="res-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ResourceForm['status'] }))}>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
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

      {/* Category Modal */}
      <Dialog open={catModalOpen} onClose={() => setCatModalOpen(false)} title={editCatId ? 'Edit Category' : 'Add Category'} maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label htmlFor="cat-name" className="block text-xs font-medium text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
            <Input id="cat-name" value={catName} onChange={e => setCatName(e.target.value)} placeholder="e.g. Regulatory" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="cat-parent" className="block text-xs font-medium text-slate-600 mb-1">Parent Category (leave blank for top-level)</label>
            <Select id="cat-parent" value={catParentId} onChange={e => setCatParentId(e.target.value)}>
              <option value="">— Top-level category —</option>
              {(categories ?? []).filter(c => !c.parentId).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setCatModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg" disabled={!catName.trim()} onClick={saveCategory}>
              {editCatId ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Regulatory Body Modal */}
      <Dialog
        open={regBodyModalOpen}
        onClose={() => {
          setRegBodyModalOpen(false)
          setEditRegBodyId(null)
        }}
        title={editRegBodyId ? 'Edit Regulatory Body' : 'Add Regulatory Body'}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="rb-name" className="block text-xs font-medium text-slate-600 mb-1">Short Name <span className="text-red-500">*</span></label>
            <Input
              id="rb-name"
              value={regBodyForm.name}
              onChange={e => {
                const value = e.target.value
                setRegBodyForm(f => ({ ...f, name: value }))
                if (regBodyErrors.name) {
                  setRegBodyErrors(prev => ({ ...prev, name: undefined }))
                }
              }}
              placeholder="e.g. CBN"
              className="h-9 text-sm"
            />
            {regBodyErrors.name && <p className="mt-1 text-xs text-red-600">{regBodyErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="rb-full-name" className="block text-xs font-medium text-slate-600 mb-1">Full Name <span className="text-red-500">*</span></label>
            <Input
              id="rb-full-name"
              value={regBodyForm.fullName}
              onChange={e => {
                const value = e.target.value
                setRegBodyForm(f => ({ ...f, fullName: value }))
                if (regBodyErrors.fullName) {
                  setRegBodyErrors(prev => ({ ...prev, fullName: undefined }))
                }
              }}
              placeholder="e.g. Central Bank of Nigeria"
              className="h-9 text-sm"
            />
            {regBodyErrors.fullName && <p className="mt-1 text-xs text-red-600">{regBodyErrors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="rb-description" className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              id="rb-description"
              value={regBodyForm.description}
              onChange={e => setRegBodyForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Optional notes about this regulatory body..."
              rows={3}
              className="w-full bg-background text-foreground text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none placeholder:text-muted-foreground focus:outline-none focus:border-[#D52B1E]"
            />
          </div>

          <div>
            <label htmlFor="rb-logo-url" className="block text-xs font-medium text-slate-600 mb-1">Logo URL</label>
            <Input
              id="rb-logo-url"
              value={regBodyForm.logoUrl}
              onChange={e => {
                const value = e.target.value
                setRegBodyForm(f => ({ ...f, logoUrl: value }))
                if (regBodyErrors.logoUrl) {
                  setRegBodyErrors(prev => ({ ...prev, logoUrl: undefined }))
                }
              }}
              placeholder="https://example.com/logo.png"
              className="h-9 text-sm"
            />
            {regBodyErrors.logoUrl && <p className="mt-1 text-xs text-red-600">{regBodyErrors.logoUrl}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                setRegBodyModalOpen(false)
                setEditRegBodyId(null)
              }}
              disabled={createRegulatoryBody.isPending || updateRegulatoryBody.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5"
              onClick={saveRegulatoryBody}
              disabled={createRegulatoryBody.isPending || updateRegulatoryBody.isPending}
            >
              {(createRegulatoryBody.isPending || updateRegulatoryBody.isPending) && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editRegBodyId ? 'Save Changes' : 'Create Body'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reject Reason Modal */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Submission" maxWidth="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Optionally provide a reason for rejection. This may be shown to the submitter.</p>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Reason for rejection (optional)..."
            rows={3}
            className="w-full bg-background text-foreground text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-[#D52B1E]"
          />
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-lg gap-1.5" onClick={confirmReject} disabled={rejectResource.isPending}>
              {rejectResource.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Reject
            </Button>
          </div>
        </div>
      </Dialog>
      {/* Resources Bulk Upload Dialog */}
      <BulkUploadDialog
        open={bulkUploadResourcesOpen}
        onClose={() => setBulkUploadResourcesOpen(false)}
        title="Resources"
        templateEndpoint="/resources/bulk-upload/template"
        uploadEndpoint="/resources/bulk-upload"
        invalidateKeys={['admin', 'resources']}
        templateFilename="resources-template.csv"
      />

      {/* Glossary Bulk Upload Dialog */}
      <BulkUploadDialog
        open={bulkUploadGlossaryOpen}
        onClose={() => setBulkUploadGlossaryOpen(false)}
        title="Glossary Terms"
        templateEndpoint="/resources/glossary/bulk-upload/template"
        uploadEndpoint="/resources/glossary/bulk-upload"
        invalidateKeys={['admin', 'resources', 'glossary']}
        templateFilename="glossary-terms-template.csv"
      />
    </motion.div>
  )
}

/* ── Categories Panel sub-component ────────────────────────────────────── */
interface CategoriesPanelProps {
  readonly categories: AdminResourceCategory[]
  readonly regulatoryBodies: Array<{ id: string; name: string; fullName?: string; description?: string; logoUrl?: string }>
  readonly onCreateRegulatoryBody: () => void
  readonly onEditRegulatoryBody: (body: AdminRegulatoryBody) => void
  readonly onDeleteRegulatoryBody: (id: string) => Promise<void>
  readonly creatingRegulatoryBody: boolean
  readonly updatingRegulatoryBody: boolean
  readonly deletingRegulatoryBody: boolean
  readonly openMenu: string | null
  readonly setOpenMenu: (id: string | null) => void
  readonly onEdit: (cat: AdminResourceCategory) => void
  readonly onDelete: (id: string) => Promise<void>
  readonly onCreateSub: (parentId: string) => void
  readonly deleting: boolean
}

function CategoriesPanel({
  categories,
  regulatoryBodies,
  onCreateRegulatoryBody,
  onEditRegulatoryBody,
  onDeleteRegulatoryBody,
  creatingRegulatoryBody,
  updatingRegulatoryBody,
  deletingRegulatoryBody,
  openMenu,
  setOpenMenu,
  onEdit,
  onDelete,
  onCreateSub,
  deleting,
}: CategoriesPanelProps) {
  const generalSubCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="p-4 space-y-4">
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-red-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-[#D52B1E]" />
            <span className="font-semibold text-slate-800 text-sm">General</span>
            <span className="text-[11px] font-medium text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
              Group
            </span>
            <span className="text-xs text-slate-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
              {generalSubCategories.length} sub-categor{generalSubCategories.length === 1 ? 'y' : 'ies'}
            </span>
          </div>
          <button
            onClick={() => onCreateSub('')}
            className="flex items-center gap-1 text-xs text-[#D52B1E] font-medium hover:underline"
          >
            <Plus className="h-3 w-3" /> Add General Sub-category
          </button>
        </div>

        {generalSubCategories.length === 0 ? (
          <div className="px-4 py-3 text-xs text-slate-400 italic">No general sub-categories yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {generalSubCategories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  {cat.name}
                </div>
                <div className="relative">
                  <button onClick={() => setOpenMenu(openMenu === cat.id ? null : cat.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openMenu === cat.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                      <button onClick={() => onEdit(cat)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                        <Edit className="h-3.5 w-3.5 text-blue-600" /> Edit
                      </button>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => onDelete(cat.id)} disabled={deleting} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <FolderTree className="h-4 w-4 text-[#D52B1E]" />
            <span className="font-semibold text-slate-800 text-sm">Regulatory</span>
            <span className="text-[11px] font-medium text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">Group</span>
            <span className="text-xs text-slate-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">API-managed</span>
            <span className="text-xs text-slate-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{regulatoryBodies.length} bodies</span>
            <span className="text-xs text-slate-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{DOCUMENT_TYPES.length} doc types</span>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Regulatory bodies are loaded from API; document types remain frontend-defined.</p>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs border-[#D52B1E] text-[#D52B1E] hover:bg-[#FFEFEF]"
              onClick={onCreateRegulatoryBody}
              disabled={creatingRegulatoryBody}
            >
              {creatingRegulatoryBody ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
              Add Body
            </Button>
          </div>
        </div>
        <div className="px-4 py-3 space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Bodies</p>
            <div className="space-y-2">
              {regulatoryBodies.map(body => (
                <div key={body.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
                  <div className="min-w-0">
                    <p className="text-slate-700 text-sm truncate">{body.name}{body.fullName ? ` - ${body.fullName}` : ''}</p>
                    {body.description && (
                      <p className="text-[11px] text-slate-400 truncate">{body.description}</p>
                    )}
                  </div>
                  <div className="relative shrink-0">
                    <button
                      onClick={() => setOpenMenu(openMenu === `rb-${body.id}` ? null : `rb-${body.id}`)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenu === `rb-${body.id}` && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                        <button
                          onClick={() => onEditRegulatoryBody(body as AdminRegulatoryBody)}
                          disabled={updatingRegulatoryBody || deletingRegulatoryBody}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700 disabled:opacity-50"
                        >
                          <Edit className="h-3.5 w-3.5 text-blue-600" /> Edit
                        </button>
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={() => onDeleteRegulatoryBody(body.id)}
                          disabled={deletingRegulatoryBody || creatingRegulatoryBody || updatingRegulatoryBody}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Document Types</p>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_TYPES.map(dt => (
                <span key={dt.id} className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-slate-600">
                  {dt.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Pending Submissions sub-component ──────────────────────────────────── */
interface PendingTableProps {
  readonly items: import('@/hooks/useAdmin').PendingResourceSubmission[]
  readonly loading: boolean
  readonly onApprove: (id: string) => Promise<unknown>
  readonly onReject: (id: string) => void
  readonly approving: boolean
}

function PendingTable({ items, loading, onApprove, onReject, approving }: PendingTableProps) {
  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" /><span className="text-sm">Loading pending submissions…</span>
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-300" />
        <p className="text-sm font-medium text-slate-600">No pending submissions</p>
        <p className="text-xs mt-1">All user-submitted resources have been reviewed.</p>
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
            <th className="px-4 py-3 text-left hidden sm:table-cell">Submitted By</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {items.map(sub => (
            <tr key={sub.id} className="hover:bg-slate-50/50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#D52B1E] shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 line-clamp-1">{sub.title}</p>
                    {sub.briefIntro && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{sub.briefIntro}</p>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex flex-col gap-0.5">
                  {sub.category && (
                    <Badge variant="outline" className="text-xs border-gray-200 text-slate-500 w-fit">
                      {sub.category.name}
                    </Badge>
                  )}
                  {sub.subCategory && (
                    <Badge variant="outline" className="text-xs border-gray-100 text-slate-400 w-fit">
                      {sub.subCategory.name}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  {sub.submitter
                    ? `${sub.submitter.firstName} ${sub.submitter.lastName}`
                    : sub.authorName ?? '—'}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${PENDING_STATUS_STYLE[sub.status] ?? ''}`}>
                  {sub.status}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(sub.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                {sub.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onApprove(sub.id)}
                      disabled={approving}
                      title="Approve"
                      className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onReject(sub.id)}
                      title="Reject"
                      className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    {sub.fileUrl && (
                      <a
                        href={sub.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View file"
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
                {sub.status !== 'pending' && (
                  <span className="text-xs text-slate-400 italic">Reviewed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── Resource Table sub-component ───────────────────────────────────────── */
interface ResourceTableProps {
  readonly items: AdminResource[]
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
            <th className="px-4 py-3 text-left hidden md:table-cell">Type</th>
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
                <Badge variant="outline" className="text-xs border-gray-200 text-slate-500">
                  {RESOURCE_TYPE_LABELS[r.resourceType]}
                </Badge>
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
