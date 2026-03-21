import { motion, AnimatePresence } from 'framer-motion'
import { Fragment, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquare, Search, MoreVertical, Trash2, Eye, CheckCircle, XCircle, Flag, Users, Calendar, Plus, Edit2, Tag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { communityService, getCommunityGroupMemberCount, type CreateEventDto, type DiscussionAPI, type CommunityGroupAPI, type CommunityEventAPI, type CommunityCategoryAPI, type GroupJoinRequestAPI } from '@/lib/communityService'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const normalizeTime = (value: string) => {
  if (!value) return undefined
  return /^\d{2}:\d{2}:\d{2}$/.test(value) ? value : `${value}:00`
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  hidden: 'bg-red-50 text-red-700',
}

type ActiveTab = 'discussions' | 'groups' | 'events' | 'categories'

type GroupMemberPreview = {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
}

const parseGroupMembers = (group: CommunityGroupAPI): GroupMemberPreview[] => {
  if (!Array.isArray(group.members)) return []
  return group.members.map((m) => ({
    id: m.id,
    name: [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email || 'Member',
    email: m.email ?? '—',
    role: m.role ?? 'member',
    avatarUrl: m.profilePhotoUrl ?? null,
  }))
}

/* ── Event form modal ─────────────────────────────────────────────────────── */
function EventFormModal({
  event,
  onClose,
  onSaved,
}: {
  event?: CommunityEventAPI
  onClose: () => void
  onSaved: (e: CommunityEventAPI) => void
}) {
  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [date, setDate] = useState(event?.date ?? event?.startDate ?? '')
  const [startTime, setStartTime] = useState(event?.startTime ?? event?.time ?? '')
  const [endTime, setEndTime] = useState(event?.endTime ?? '')
  const [location, setLocation] = useState(event?.location ?? '')
  const [type, setType] = useState(event?.type ?? '')
  const [capacity, setCapacity] = useState(event?.capacity ?? 0)
  const [isVirtual, setIsVirtual] = useState(Boolean(event?.isVirtual))
  const [virtualLink, setVirtualLink] = useState(event?.virtualLink ?? '')
  const [virtualLinkError, setVirtualLinkError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setErr('Title is required'); return }
    if (isVirtual && !virtualLink.trim()) {
      setVirtualLinkError('Virtual Link is required when Virtual event is enabled.')
      return
    }
    setSaving(true)
    setErr(null)
    setVirtualLinkError(null)
    try {
      const payload: CreateEventDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        date: date || undefined,
        startTime: normalizeTime(startTime),
        endTime: normalizeTime(endTime),
        location: location.trim() || undefined,
        type: type.trim() || undefined,
        capacity,
        isVirtual,
        virtualLink: isVirtual ? (virtualLink.trim() || undefined) : undefined,
      }
      let saved: CommunityEventAPI
      if (event) {
        saved = await communityService.updateEvent(event.id, payload)
      } else {
        saved = await communityService.createEvent(payload)
      }
      onSaved(saved)
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{event ? 'Edit Event' : 'Create Event'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="h-9 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
              placeholder="Event description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Start Time</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">End Time</label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Capacity</label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value || 0))} className="h-9 text-sm" min={0} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Online / City" className="h-9 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isVirtual}
              onChange={(e) => {
                const checked = e.target.checked
                setIsVirtual(checked)
                if (!checked) setVirtualLinkError(null)
              }}
              className="rounded border-slate-300"
            />
            Virtual event
          </label>
          {isVirtual && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Virtual Link</label>
              <Input
                value={virtualLink}
                onChange={(e) => {
                  const value = e.target.value
                  setVirtualLink(value)
                  if (value.trim()) setVirtualLinkError(null)
                }}
                placeholder="https://..."
                className={`h-9 text-sm ${virtualLinkError ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
              />
              {virtualLinkError && <p className="text-xs text-red-500 mt-1">{virtualLinkError}</p>}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Webinar, Meetup" className="h-9 text-sm" />
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-lg">Cancel</Button>
            <Button type="submit" size="sm" disabled={saving} className="rounded-lg bg-[#D52B1E] hover:bg-[#B8241B] text-white gap-1">
              {saving ? 'Saving…' : event ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body,
  )
}

/* ── Category form modal ──────────────────────────────────────────────────── */
function CommCategoryFormModal({
  cat,
  onClose,
  onSaved,
}: {
  cat?: CommunityCategoryAPI
  onClose: () => void
  onSaved: (c: CommunityCategoryAPI) => void
}) {
  const [name, setName] = useState(cat?.name ?? '')
  const [slug, setSlug] = useState(cat?.slug ?? '')
  const [description, setDescription] = useState(cat?.description ?? '')
  const [icon, setIcon] = useState(cat?.icon ?? '')
  const [sortOrder, setSortOrder] = useState(cat?.sortOrder ?? 0)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!cat) setSlug(slugify(name))
  }, [name, cat])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = name.trim()
    const cleanSlug = slug.trim()
    if (!cleanName) { setErr('Name is required'); return }
    if (!cleanSlug) { setErr('Slug is required'); return }
    setSaving(true)
    setErr(null)
    try {
      const payload = {
        name: cleanName,
        slug: cleanSlug,
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        sortOrder,
      }
      const saved = cat
        ? await communityService.updateCategory(cat.id, payload)
        : await communityService.createCategory(payload)
      onSaved(saved)
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{cat ? 'Edit Category' : 'Add Category'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Category Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Islamic Finance" className="h-9 text-sm" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Slug *</label>
            <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="e.g. markets-investing" className="h-9 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
              placeholder="Category description" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Icon</label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. chart-line" className="h-9 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sort Order</label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value || 0))} className="h-9 text-sm" />
            </div>
          </div>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-lg">Cancel</Button>
            <Button type="submit" size="sm" disabled={saving} className="rounded-lg bg-[#D52B1E] hover:bg-[#B8241B] text-white">
              {saving ? 'Saving…' : cat ? 'Save Changes' : 'Save'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body,
  )
}

/* ── Group form modal ─────────────────────────────────────────────────────── */
function GroupFormModal({
  group,
  onClose,
  onSaved,
}: {
  group?: CommunityGroupAPI
  onClose: () => void
  onSaved: (g: CommunityGroupAPI) => void
}) {
  const [name, setName] = useState(group?.name ?? '')
  const [slug, setSlug] = useState(group?.slug ?? '')
  const [description, setDescription] = useState(group?.description ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(group?.coverImageUrl ?? '')
  const [isPrivate, setIsPrivate] = useState(Boolean(group?.isPrivate))
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!group) setSlug(slugify(name))
  }, [name, group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanName = name.trim()
    const cleanSlug = slug.trim()
    if (!cleanName) { setErr('Name is required'); return }
    if (!cleanSlug) { setErr('Slug is required'); return }

    setSaving(true)
    setErr(null)
    try {
      const payload = {
        name: cleanName,
        slug: cleanSlug,
        description: description.trim() || undefined,
        coverImageUrl: coverImageUrl.trim() || undefined,
        isPrivate,
      }
      const saved = group
        ? await communityService.updateGroup(group.id, payload)
        : await communityService.createGroup(payload)
      onSaved(saved)
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">{group ? 'Edit Group' : 'Create Group'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Group Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CIFP Study Group" className="h-9 text-sm" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Slug *</label>
            <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="e.g. cifp-study-group" className="h-9 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none h-20 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D52B1E]/30"
              placeholder="Group description" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cover Image URL</label>
            <Input value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="https://..." className="h-9 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="rounded border-slate-300"
            />
            Private group
          </label>
          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="rounded-lg">Cancel</Button>
            <Button type="submit" size="sm" disabled={saving} className="rounded-lg bg-[#D52B1E] hover:bg-[#B8241B] text-white">
              {saving ? 'Saving…' : group ? 'Save Changes' : 'Create Group'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body,
  )
}

export default function AdminCommunity() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('discussions')
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null)

  // ── Discussions ─────────────────────────────────────────────────────────
  const [discussions, setDiscussions] = useState<DiscussionAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [flaggedOnly, setFlaggedOnly] = useState(false)

  // ── Groups ───────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<CommunityGroupAPI[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [groupsError, setGroupsError] = useState<string | null>(null)
  const [groupSearch, setGroupSearch] = useState('')
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null)
  const [membersLoadingGroupId, setMembersLoadingGroupId] = useState<string | null>(null)
  const [groupMembersById, setGroupMembersById] = useState<Record<string, GroupMemberPreview[]>>({})
  const [joinRequestsById, setJoinRequestsById] = useState<Record<string, GroupJoinRequestAPI[]>>({})
  const [joinRequestsLoadingGroupId, setJoinRequestsLoadingGroupId] = useState<string | null>(null)
  const [expandedRequestGroupId, setExpandedRequestGroupId] = useState<string | null>(null)

  // ── Events ───────────────────────────────────────────────────────────────
  const [events, setEvents] = useState<CommunityEventAPI[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsError, setEventsError] = useState<string | null>(null)
  const [eventSearch, setEventSearch] = useState('')
  const [eventModal, setEventModal] = useState<
    | { type: 'create' }
    | { type: 'edit'; event: CommunityEventAPI }
    | null
  >(null)

  // ── Categories ───────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<CommunityCategoryAPI[]>([])
  const [catsLoading, setCatsLoading] = useState(false)
  const [catsError, setCatsError] = useState<string | null>(null)
  const [catModal, setCatModal] = useState<
    | { type: 'create' }
    | { type: 'edit'; category: CommunityCategoryAPI }
    | null
  >(null)
  const [groupModal, setGroupModal] = useState<
    | { type: 'create' }
    | { type: 'edit'; group: CommunityGroupAPI }
    | null
  >(null)

  // ── Fetch functions ──────────────────────────────────────────────────────
  const fetchDiscussions = useCallback(async () => {
    setLoading(true)
    setApiError(null)
    try {
      const data = await communityService.getDiscussions()
      setDiscussions(data)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true)
    setGroupsError(null)
    try {
      const data = await communityService.getGroups()
      setGroups(data)
    } catch (err: unknown) {
      setGroupsError(err instanceof Error ? err.message : 'Failed to load groups')
    } finally {
      setGroupsLoading(false)
    }
  }, [])

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true)
    setEventsError(null)
    try {
      const data = await communityService.getEvents()
      setEvents(data)
    } catch (err: unknown) {
      setEventsError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setEventsLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setCatsLoading(true)
    setCatsError(null)
    try {
      const data = await communityService.getCategories()
      setCategories(data)
    } catch (err: unknown) {
      setCatsError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setCatsLoading(false)
    }
  }, [])

  useEffect(() => { fetchDiscussions() }, [fetchDiscussions])

  useEffect(() => {
    if (activeTab === 'groups' && groups.length === 0 && !groupsLoading) fetchGroups()
    if (activeTab === 'events' && events.length === 0 && !eventsLoading) fetchEvents()
    if (activeTab === 'categories' && categories.length === 0 && !catsLoading) fetchCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const handleDeleteDiscussion = async (id: string) => {
    setOpenMenu(null)
    try {
      await communityService.deleteDiscussion(id)
      setDiscussions((prev) => prev.filter((d) => d.id !== id))
    } catch {
      // ignore
    }
  }

  const handleFlagDiscussion = async (id: string, currentlyFlagged: boolean) => {
    setOpenMenu(null)
    try {
      if (currentlyFlagged) {
        // Unflag via PATCH
        const updated = await communityService.updateDiscussion(id, { flagged: false })
        setDiscussions((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated, flagged: false, flaggedAt: null } : d)))
      } else {
        const updated = await communityService.flagDiscussion(id)
        setDiscussions((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated, flagged: true, flaggedAt: updated.flaggedAt ?? new Date().toISOString() } : d)))
      }
    } catch {
      // ignore
    }
  }

  const handleStatusChange = async (id: string, status: 'active' | 'hidden') => {
    setOpenMenu(null)
    try {
      const updated = await communityService.updateDiscussion(id, { status })
      setDiscussions((prev) => prev.map((d) => (d.id === id ? { ...d, ...updated } : d)))
    } catch {
      // ignore
    }
  }

  const handleDeleteGroup = async (id: string) => {
    try {
      await communityService.deleteGroup(id)
      setGroups((prev) => prev.filter((g) => g.id !== id))
    } catch {
      // ignore
    }
  }

  const handleToggleGroupMembers = useCallback(async (group: CommunityGroupAPI) => {
    if (expandedGroupId === group.id) {
      setExpandedGroupId(null)
      return
    }

    setExpandedGroupId(group.id)

    if (groupMembersById[group.id]) return

    const inlineMembers = parseGroupMembers(group)
    if (inlineMembers.length > 0) {
      setGroupMembersById((prev) => ({ ...prev, [group.id]: inlineMembers }))
      return
    }

    setMembersLoadingGroupId(group.id)
    try {
      const detailed = await communityService.getGroupById(group.id)
      const parsed = parseGroupMembers(detailed)
      setGroupMembersById((prev) => ({ ...prev, [group.id]: parsed }))
    } catch {
      setGroupMembersById((prev) => ({ ...prev, [group.id]: [] }))
    } finally {
      setMembersLoadingGroupId(null)
    }
  }, [expandedGroupId, groupMembersById])

  const handleToggleJoinRequests = useCallback(async (group: CommunityGroupAPI) => {
    if (expandedRequestGroupId === group.id) {
      setExpandedRequestGroupId(null)
      return
    }
    setExpandedRequestGroupId(group.id)
    if (joinRequestsById[group.id]) return
    setJoinRequestsLoadingGroupId(group.id)
    try {
      const requests = await communityService.getJoinRequests(group.id)
      setJoinRequestsById((prev) => ({ ...prev, [group.id]: requests }))
    } catch {
      setJoinRequestsById((prev) => ({ ...prev, [group.id]: [] }))
    } finally {
      setJoinRequestsLoadingGroupId(null)
    }
  }, [expandedRequestGroupId, joinRequestsById])

  const handleApproveRequest = async (groupId: string, requestId: string) => {
    try {
      await communityService.approveJoinRequest(requestId)
      setJoinRequestsById((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] ?? []).filter((r) => r.id !== requestId),
      }))
    } catch {
      // ignore
    }
  }

  const handleRejectRequest = async (groupId: string, requestId: string) => {
    try {
      await communityService.rejectJoinRequest(requestId)
      setJoinRequestsById((prev) => ({
        ...prev,
        [groupId]: (prev[groupId] ?? []).filter((r) => r.id !== requestId),
      }))
    } catch {
      // ignore
    }
  }

  const handleDeleteEvent = async (id: string) => {
    try {
      await communityService.deleteEvent(id)
      setEvents((prev) => prev.filter((e) => e.id !== id))
    } catch {
      // ignore
    }
  }

  const filtered = discussions.filter(
    (d) =>
      (d.title.toLowerCase().includes(search.toLowerCase()) ||
        (
        typeof d.author === 'string'
          ? d.author
          : [d.author?.firstName, d.author?.lastName].filter(Boolean).join(' ')
      ).toLowerCase().includes(search.toLowerCase())) &&
      (!flaggedOnly || !!(d.flagged || d.flaggedAt)),
  )
  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(groupSearch.toLowerCase()))
  const filteredEvents = events.filter((e) => e.title.toLowerCase().includes(eventSearch.toLowerCase()))

  const flaggedCount = discussions.filter((d) => !!(d.flagged || d.flaggedAt)).length

  const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'categories', label: 'Categories', icon: Tag },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Community Management</h1>
          <p className="text-slate-500 text-sm">Moderate discussions, posts and member interactions</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Discussions', value: discussions.length.toLocaleString(), color: '#8b5cf6', icon: MessageSquare },
          { label: 'Total Groups', value: groups.length.toLocaleString(), color: '#3b82f6', icon: Users },
          { label: 'Flagged Posts', value: flaggedCount.toString(), color: '#ef4444', icon: Flag },
          { label: 'Total Events', value: events.length.toLocaleString(), color: '#10b981', icon: Calendar },
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

      {/* Tab bar */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex gap-1 p-2 border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-[#D52B1E] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Discussions tab ─────────────────────────────────────────────── */}
        {activeTab === 'discussions' && (
          <>
            <div className="flex items-center gap-3 p-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search discussions…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlaggedOnly((prev) => !prev)}
                className={`rounded-lg gap-1.5 text-red-600 border-red-200 hover:bg-red-50 ${flaggedOnly ? 'bg-red-50' : ''}`}
              >
                <Flag className="h-3.5 w-3.5" /> Flagged ({flaggedCount})
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Discussion</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Author</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Replies</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Views</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 w-48 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-8 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-12 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3"><div className="h-5 w-14 bg-slate-200 rounded-full" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-7 bg-slate-100 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : apiError ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-red-500 text-sm">{apiError}</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-6 text-center text-slate-400 text-sm">No discussions found.</td></tr>
                  ) : (
                    filtered.map((d) => (
                      <tr key={d.id} className={`hover:bg-slate-50/50 ${(d.flagged || d.flaggedAt) ? 'bg-red-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {(d.flagged || d.flaggedAt) && <Flag className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                            <p className="font-medium text-slate-800 line-clamp-1">{d.title}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">
                          {typeof d.author === 'string'
                            ? d.author
                            : [d.author?.firstName, d.author?.lastName].filter(Boolean).join(' ') || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                          {d.interactions?.filter((i) => i.type === 'comment').length ?? 0}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{(d.viewCount ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ''}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[d.status ?? 'active'] ?? ''}`}>{d.status ?? 'active'}</span></td>
                        <td className="px-4 py-3 text-right">
                          <div className="relative inline-block">
                            <button onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {openMenu === d.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Eye className="h-3.5 w-3.5 text-blue-600" /> View</button>
                                <button onClick={() => handleStatusChange(d.id, 'active')} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> Approve</button>
                                <button onClick={() => handleStatusChange(d.id, 'hidden')} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><XCircle className="h-3.5 w-3.5 text-yellow-600" /> Hide</button>
                                <button onClick={() => handleFlagDiscussion(d.id, !!d.flagged)} className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 ${d.flagged ? 'text-slate-700' : 'text-orange-600'}`}><Flag className="h-3.5 w-3.5" /> {d.flagged ? 'Unflag' : 'Flag'}</button>
                                <hr className="my-1 border-gray-100" />
                                <button onClick={() => handleDeleteDiscussion(d.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Groups tab ──────────────────────────────────────────────────── */}
        {activeTab === 'groups' && (
          <>
            <div className="flex items-center gap-3 p-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search groups…" value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
              </div>
              <Button size="sm" onClick={() => setGroupModal({ type: 'create' })} className="rounded-lg bg-[#D52B1E] hover:bg-[#B8241B] text-white gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Group
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Description</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Members</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Type</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 w-36 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-48 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-12 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-7 bg-slate-100 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : groupsError ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-red-500 text-sm">{groupsError}</td></tr>
                  ) : filteredGroups.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">No groups found.</td></tr>
                  ) : (
                    filteredGroups.map((g) => {
                      const isExpanded = expandedGroupId === g.id
                      const members = groupMembersById[g.id] ?? []
                      const isLoadingMembers = membersLoadingGroupId === g.id
                      const isRequestsExpanded = expandedRequestGroupId === g.id
                      const joinRequests = joinRequestsById[g.id] ?? []
                      const isLoadingRequests = joinRequestsLoadingGroupId === g.id

                      return (
                        <Fragment key={g.id}>
                          <tr className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-medium text-slate-800">{g.name}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell line-clamp-1">{g.description ?? '—'}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{getCommunityGroupMemberCount(g)}</td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${g.isPrivate ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                                {g.isPrivate ? 'Private' : 'Public'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {g.isPrivate && (
                                  <button
                                    onClick={() => handleToggleJoinRequests(g)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${isRequestsExpanded ? 'border-amber-400 text-amber-700 bg-amber-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                  >
                                    Requests
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleGroupMembers(g)}
                                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${isExpanded ? 'border-[#D52B1E] text-[#D52B1E] bg-red-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                  {isExpanded ? 'Hide Members' : 'Members'}
                                </button>
                                <button
                                  onClick={() => setGroupModal({ type: 'edit', group: g })}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                onClick={() => setConfirmDialog({ message: `Delete group "${g.name}"? This cannot be undone.`, onConfirm: () => handleDeleteGroup(g.id) })}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isRequestsExpanded && (
                            <tr>
                              <td colSpan={5} className="px-4 pb-4">
                                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3">
                                  <p className="text-xs font-semibold text-amber-800 mb-2 uppercase tracking-wide">Pending Join Requests</p>
                                  {isLoadingRequests ? (
                                    <p className="text-xs text-slate-500">Loading requests...</p>
                                  ) : joinRequests.length === 0 ? (
                                    <p className="text-xs text-slate-500">No pending join requests.</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {joinRequests.filter((r) => r.status === 'pending').map((req) => {
                                        const name = [req.user?.firstName, req.user?.lastName].filter(Boolean).join(' ') || req.user?.email || 'User'
                                        return (
                                          <div key={req.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-white p-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-semibold text-slate-600 overflow-hidden flex-shrink-0">
                                              {req.user?.profilePhotoUrl
                                                ? <img src={req.user.profilePhotoUrl} alt={name} className="h-full w-full object-cover" />
                                                : name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="text-xs font-medium text-slate-800 truncate">{name}</p>
                                              <p className="text-[11px] text-slate-500 truncate">{req.user?.email ?? '—'}</p>
                                            </div>
                                            <p className="text-[10px] text-slate-400 hidden sm:block">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}</p>
                                            <div className="flex gap-1 flex-shrink-0">
                                              <button
                                                onClick={() => handleApproveRequest(g.id, req.id)}
                                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                              >
                                                <CheckCircle className="h-3 w-3" /> Approve
                                              </button>
                                              <button
                                                onClick={() => handleRejectRequest(g.id, req.id)}
                                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                              >
                                                <XCircle className="h-3 w-3" /> Reject
                                              </button>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="px-4 pb-4">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                                  <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Group Members</p>
                                  {isLoadingMembers ? (
                                    <p className="text-xs text-slate-500">Loading members...</p>
                                  ) : members.length === 0 ? (
                                    <p className="text-xs text-slate-500">No member details available for this group.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {members.map((m) => (
                                        <div key={m.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-semibold text-slate-600 overflow-hidden">
                                            {m.avatarUrl ? (
                                              <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                                            ) : (
                                              m.name.slice(0, 2).toUpperCase()
                                            )}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-medium text-slate-800 truncate">{m.name}</p>
                                            <p className="text-[11px] text-slate-500 truncate">{m.email}</p>
                                          </div>
                                          <span className="ml-auto text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{m.role}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Events tab ──────────────────────────────────────────────────── */}
        {activeTab === 'events' && (
          <>
            <div className="flex items-center gap-3 p-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="Search events…" value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
              </div>
              <Button size="sm" onClick={() => setEventModal({ type: 'create' })} className="rounded-lg bg-[#D52B1E] hover:bg-[#B8241B] text-white gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Event
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Location</th>
                    <th className="px-4 py-3 text-left hidden lg:table-cell">Type</th>
                    <th className="px-4 py-3 text-left hidden md:table-cell">Attendees</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {eventsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 w-40 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3 hidden sm:table-cell"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-28 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 w-16 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 w-10 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3 text-right"><div className="h-7 w-14 bg-slate-100 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : eventsError ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-red-500 text-sm">{eventsError}</td></tr>
                  ) : filteredEvents.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-400 text-sm">No events found.</td></tr>
                  ) : (
                    filteredEvents.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-medium text-slate-800 line-clamp-1">{e.title}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                          {(e.date ?? e.startDate) ? new Date(e.date ?? e.startDate ?? '').toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{e.location ?? '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {e.type && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize">{e.type}</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{e.attendeeCount ?? e.attendees ?? 0}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEventModal({ type: 'edit', event: e })}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setConfirmDialog({ message: `Delete event "${e.title}"? This cannot be undone.`, onConfirm: () => handleDeleteEvent(e.id) })}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Categories tab ──────────────────────────────────────────────── */}
        {activeTab === 'categories' && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">{categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</p>
              <Button size="sm" onClick={() => setCatModal({ type: 'create' })} className="rounded-lg bg-[#D52B1E] hover:bg-[#B8241B] text-white gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Category
              </Button>
            </div>
            {catsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : catsError ? (
              <p className="text-sm text-red-500 text-center py-4">{catsError}</p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No categories yet. Add one above.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 bg-slate-50 border border-gray-100 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="h-3.5 w-3.5 text-[#D52B1E] shrink-0" />
                      <span className="text-sm font-medium text-slate-700 truncate">{c.name}</span>
                    </div>
                    <button
                      onClick={() => setCatModal({ type: 'edit', category: c })}
                      className="p-1 rounded hover:bg-slate-200 text-slate-500"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Event modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {eventModal && (
          <EventFormModal
            event={eventModal.type === 'edit' ? eventModal.event : undefined}
            onClose={() => setEventModal(null)}
            onSaved={(saved) => {
              if (eventModal.type === 'edit') {
                setEvents((prev) => prev.map((e) => (e.id === saved.id ? saved : e)))
              } else {
                setEvents((prev) => [saved, ...prev])
              }
              setEventModal(null)
            }}
          />
        )}
        {catModal && (
          <CommCategoryFormModal
            cat={catModal.type === 'edit' ? catModal.category : undefined}
            onClose={() => setCatModal(null)}
            onSaved={(saved) => {
              if (catModal.type === 'edit') {
                setCategories((prev) => prev.map((c) => (c.id === saved.id ? saved : c)))
              } else {
                setCategories((prev) => [saved, ...prev])
              }
              setCatModal(null)
            }}
          />
        )}
        {groupModal && (
          <GroupFormModal
            group={groupModal.type === 'edit' ? groupModal.group : undefined}
            onClose={() => setGroupModal(null)}
            onSaved={(saved) => {
              if (groupModal.type === 'edit') {
                setGroups((prev) => prev.map((g) => (g.id === saved.id ? saved : g)))
              } else {
                setGroups((prev) => [saved, ...prev])
              }
              setGroupModal(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)} title="Confirm Action" maxWidth="max-w-sm">
          <p className="text-sm text-slate-600 mb-6">{confirmDialog.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
            >
              Delete
            </Button>
          </div>
        </Dialog>
      )}
    </motion.div>
  )
}
