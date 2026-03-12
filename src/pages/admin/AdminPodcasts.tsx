import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mic, Plus, Search, MoreVertical, Edit, Trash2, Play, Video, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/ui/image-upload'
import {
  useAdminShows,
  useAdminShowEpisodes,
  useAdminCreateShow,
  useAdminUpdateShow,
  useAdminDeleteShow,
  useAdminCreateEpisode,
  useAdminUpdateEpisode,
  useAdminDeleteEpisode,
  type PodcastShow,
  type PodcastEpisode,
  type CreateShowDto,
  type CreateEpisodeDto,
} from '@/hooks/useAdmin'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

interface EpisodesPanelProps {
  readonly showId: string
  readonly onDeleteEpisode: (id: string) => void
  readonly onEditEpisode: (ep: PodcastEpisode) => void
}

function EpisodesPanel({ showId, onDeleteEpisode, onEditEpisode }: EpisodesPanelProps) {
  const { data: episodes, isLoading } = useAdminShowEpisodes(showId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-[#D52B1E]" />
      </div>
    )
  }

  const list = Array.isArray(episodes) ? episodes : []

  if (list.length === 0) {
    return <p className="text-center text-sm text-slate-400 py-6">No episodes yet</p>
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-slate-500 text-xs uppercase tracking-wide">
        <tr>
          <th className="px-5 py-2.5 text-left">Episode</th>
          <th className="px-4 py-2.5 text-left hidden sm:table-cell">Duration</th>
          <th className="px-4 py-2.5 text-left hidden md:table-cell">Date</th>
          <th className="px-4 py-2.5 text-left hidden md:table-cell">Views</th>
          <th className="px-4 py-2.5 text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {list.map((ep: PodcastEpisode) => (
          <tr key={ep.id} className="hover:bg-white transition-colors">
            <td className="px-5 py-2.5">
              <div className="flex items-center gap-2">
                <Play className="h-3.5 w-3.5 text-[#D52B1E]" />
                <span className="text-slate-700 font-medium line-clamp-1">{ep.title}</span>
              </div>
            </td>
            <td className="px-4 py-2.5 text-slate-500 text-xs hidden sm:table-cell">
              {ep.durationSeconds ? `${Math.floor(ep.durationSeconds / 60)} min` : '—'}
            </td>
            <td className="px-4 py-2.5 text-slate-400 text-xs hidden md:table-cell">
              {ep.publishedAt ? new Date(ep.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
            </td>
            <td className="px-4 py-2.5 text-slate-500 text-xs hidden md:table-cell">{ep.viewCount > 0 ? ep.viewCount.toLocaleString() : '—'}</td>
            <td className="px-4 py-2.5 text-right">
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => onEditEpisode(ep)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                <button onClick={() => onDeleteEpisode(ep.id)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const EMPTY_SHOW: CreateShowDto = { title: '', slug: '', description: '', coverImageUrl: '', language: '', category: '' }
const EMPTY_EPISODE: CreateEpisodeDto = { title: '', description: '', audioUrl: '', videoUrl: '', durationSeconds: undefined, episodeNumber: undefined, season: undefined, isPublished: false }

export default function AdminPodcasts() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // Show modal
  const [showModalOpen, setShowModalOpen] = useState(false)
  const [showForm, setShowForm] = useState<CreateShowDto>(EMPTY_SHOW)
  const [editShowId, setEditShowId] = useState<string | null>(null)

  // Episode modal
  const [epModalOpen, setEpModalOpen] = useState(false)
  const [epForm, setEpForm] = useState<CreateEpisodeDto>(EMPTY_EPISODE)
  const [editEpId, setEditEpId] = useState<string | null>(null)
  const [epShowId, setEpShowId] = useState<string>('')

  const { data, isLoading } = useAdminShows({ search: search || undefined, perPage: 20 })
  const createShowMutation = useAdminCreateShow()
  const updateShowMutation = useAdminUpdateShow()
  const deleteShowMutation = useAdminDeleteShow()
  const createEpMutation = useAdminCreateEpisode()
  const updateEpMutation = useAdminUpdateEpisode()
  const deleteEpisodeMutation = useAdminDeleteEpisode()

  const shows = data?.data ?? []
  const meta = data?.meta

  // Show modal handlers
  function openCreateShow() { setEditShowId(null); setShowForm(EMPTY_SHOW); setShowModalOpen(true) }

  function openEditShow(show: PodcastShow) {
    setEditShowId(show.id)
    setShowForm({ title: show.title, slug: show.slug, description: show.description ?? '', coverImageUrl: show.coverImageUrl ?? '', language: show.language ?? '', category: show.category ?? '' })
    setOpenMenu(null)
    setShowModalOpen(true)
  }

  function closeShowModal() { setShowModalOpen(false); setEditShowId(null); setShowForm(EMPTY_SHOW) }

  // Episode modal handlers
  function openCreateEp(showId: string) {
    setEditEpId(null)
    setEpShowId(showId)
    setEpForm(EMPTY_EPISODE)
    setOpenMenu(null)
    setEpModalOpen(true)
  }

  function openEditEp(ep: PodcastEpisode) {
    setEditEpId(ep.id)
    setEpShowId(ep.show?.id ?? '')
    setEpForm({ title: ep.title, description: ep.description ?? '', audioUrl: ep.audioUrl ?? '', videoUrl: ep.videoUrl ?? '', durationSeconds: ep.durationSeconds, episodeNumber: ep.episodeNumber, season: ep.season, isPublished: ep.isPublished })
    setEpModalOpen(true)
  }

  function closeEpModal() { setEpModalOpen(false); setEditEpId(null); setEpForm(EMPTY_EPISODE) }

  const showBtnLabel = editShowId ? 'Save Changes' : 'Create Show'
  const epBtnLabel = editEpId ? 'Save Changes' : 'Create Episode'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Podcast Management</h1>
          <p className="text-slate-500 text-sm">Manage shows and episodes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5" onClick={openCreateShow}>
            <Plus className="h-3.5 w-3.5" /> New Show
          </Button>
          <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5" onClick={() => { if (shows.length > 0) openCreateEp(shows[0].id) }}>
            <Video className="h-3.5 w-3.5" /> Upload Episode
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Shows', value: meta?.itemCount ?? '—', color: '#8b5cf6' },
          { label: 'Episodes', value: shows.reduce((s, _) => s, 0), color: '#D52B1E' },
          { label: 'Active Shows', value: shows.filter((s: PodcastShow) => s.isActive).length, color: '#10b981' },
          { label: 'Inactive Shows', value: shows.filter((s: PodcastShow) => !s.isActive).length, color: '#3b82f6' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search shows…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#D52B1E]" />
          </div>
        )}
        {!isLoading && shows.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-16">No shows found</p>
        )}
        {!isLoading && shows.length > 0 && shows.map((show: PodcastShow) => (
            <motion.div key={show.id} variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Show row */}
              <div className="flex items-center gap-4 p-4">
                {show.coverImageUrl ? (
                  <img src={show.coverImageUrl} alt={show.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Mic className="h-6 w-6 text-slate-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 truncate">{show.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${show.isActive ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                      {show.isActive ? 'active' : 'inactive'}
                    </span>
                  </div>
                  {show.category && <p className="text-sm text-slate-500 mt-0.5">{show.category}</p>}
                  {show.language && (
                    <div className="flex gap-4 mt-1 text-xs text-slate-400">
                      <span>{show.language}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1 text-xs" onClick={() => setExpanded(expanded === show.id ? null : show.id)}>
                    Episodes {expanded === show.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                  <div className="relative">
                    <button onClick={() => setOpenMenu(openMenu === show.id ? null : show.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenu === show.id && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                        <button onClick={() => openEditShow(show)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit Show</button>
                        <button onClick={() => openCreateEp(show.id)} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Plus className="h-3.5 w-3.5 text-green-600" /> Add Episode</button>
                        <hr className="my-1 border-gray-100" />
                        <button onClick={() => { deleteShowMutation.mutate(show.id); setOpenMenu(null) }} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Episodes panel */}
              {expanded === show.id && (
                <div className="border-t border-gray-100 bg-slate-50">
                  <EpisodesPanel
                    showId={show.id}
                    onDeleteEpisode={(id) => deleteEpisodeMutation.mutate(id)}
                    onEditEpisode={openEditEp}
                  />
                  <div className="px-5 py-3 border-t border-gray-100">
                    <button onClick={() => openCreateEp(show.id)} className="text-xs text-[#D52B1E] hover:underline flex items-center gap-1">
                      <Plus className="h-3 w-3" /> Add new episode to this show
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        }
      </motion.div>

      {/* ── Show Modal ─────────────────────────────────────────────────── */}
      <Dialog open={showModalOpen} onClose={closeShowModal} title={editShowId ? 'Edit Show' : 'New Show'}>
        <div className="space-y-4">
          <div>
            <label htmlFor="show-title" className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-500">*</span></label>
            <Input id="show-title" value={showForm.title} onChange={(e) => setShowForm((f) => ({ ...f, title: e.target.value }))} placeholder="Show title" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="show-slug" className="block text-xs font-medium text-slate-600 mb-1">Slug <span className="text-red-500">*</span></label>
            <Input id="show-slug" value={showForm.slug} onChange={(e) => setShowForm((f) => ({ ...f, slug: e.target.value }))} placeholder="my-show-slug" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="show-desc" className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              id="show-desc"
              value={showForm.description ?? ''}
              onChange={(e) => setShowForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="About this show…"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="show-lang" className="block text-xs font-medium text-slate-600 mb-1">Language</label>
              <Input id="show-lang" value={showForm.language ?? ''} onChange={(e) => setShowForm((f) => ({ ...f, language: e.target.value }))} placeholder="English" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="show-cat" className="block text-xs font-medium text-slate-600 mb-1">Category</label>
              <Input id="show-cat" value={showForm.category ?? ''} onChange={(e) => setShowForm((f) => ({ ...f, category: e.target.value }))} placeholder="Finance" className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <p className="block text-xs font-medium text-slate-600 mb-1">Cover Image</p>
            <ImageUpload
              id="show-cover"
              value={showForm.coverImageUrl ?? ''}
              onChange={(url) => setShowForm((f) => ({ ...f, coverImageUrl: url }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={closeShowModal}>Cancel</Button>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg"
              disabled={!showForm.title.trim() || !showForm.slug.trim() || createShowMutation.isPending || updateShowMutation.isPending}
              onClick={() => {
                if (editShowId) {
                  updateShowMutation.mutate({ id: editShowId, dto: showForm }, { onSuccess: closeShowModal })
                } else {
                  createShowMutation.mutate(showForm, { onSuccess: closeShowModal })
                }
              }}
            >
              {(createShowMutation.isPending || updateShowMutation.isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : showBtnLabel}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* ── Episode Modal ───────────────────────────────────────────────── */}
      <Dialog open={epModalOpen} onClose={closeEpModal} title={editEpId ? 'Edit Episode' : 'New Episode'}>
        <div className="space-y-4">
          <div>
            <label htmlFor="ep-title" className="block text-xs font-medium text-slate-600 mb-1">Title <span className="text-red-500">*</span></label>
            <Input id="ep-title" value={epForm.title} onChange={(e) => setEpForm((f) => ({ ...f, title: e.target.value }))} placeholder="Episode title" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="ep-video" className="block text-xs font-medium text-slate-600 mb-1">
              YouTube Video URL
            </label>
            <Input id="ep-video" value={epForm.videoUrl ?? ''} onChange={(e) => setEpForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://youtu.be/… or https://www.youtube.com/watch?v=…" className="h-9 text-sm" />
          </div>
          <div>
            <p className="block text-xs font-medium text-slate-600 mb-1">Thumbnail Image</p>
            <ImageUpload
              id="ep-audio"
              value={epForm.audioUrl ?? ''}
              onChange={(url) => setEpForm((f) => ({ ...f, audioUrl: url }))}
              previewHeight="h-28"
            />
          </div>
          <div>
            <label htmlFor="ep-desc" className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              id="ep-desc"
              value={epForm.description ?? ''}
              onChange={(e) => setEpForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Episode summary…"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:border-[#D52B1E] resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="ep-dur" className="block text-xs font-medium text-slate-600 mb-1">Duration (sec)</label>
              <Input
                id="ep-dur"
                type="number"
                min={0}
                value={epForm.durationSeconds ?? ''}
                onChange={(e) => setEpForm((f) => ({ ...f, durationSeconds: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="3600"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label htmlFor="ep-num" className="block text-xs font-medium text-slate-600 mb-1">Episode #</label>
              <Input
                id="ep-num"
                type="number"
                min={1}
                value={epForm.episodeNumber ?? ''}
                onChange={(e) => setEpForm((f) => ({ ...f, episodeNumber: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="1"
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label htmlFor="ep-season" className="block text-xs font-medium text-slate-600 mb-1">Season</label>
              <Input
                id="ep-season"
                type="number"
                min={1}
                value={epForm.season ?? ''}
                onChange={(e) => setEpForm((f) => ({ ...f, season: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="1"
                className="h-9 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={!!epForm.isPublished}
              onChange={(e) => setEpForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="accent-[#D52B1E]"
            />
            <span>Published</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={closeEpModal}>Cancel</Button>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg"
              disabled={!epForm.title.trim() || createEpMutation.isPending || updateEpMutation.isPending}
              onClick={() => {
                if (editEpId) {
                  updateEpMutation.mutate({ id: editEpId, dto: epForm }, { onSuccess: closeEpModal })
                } else {
                  createEpMutation.mutate({ showId: epShowId, dto: epForm }, { onSuccess: closeEpModal })
                }
              }}
            >
              {(createEpMutation.isPending || updateEpMutation.isPending) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : epBtnLabel}
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}

