import { motion } from 'framer-motion'
import { useState } from 'react'
import { Mic, Plus, Search, MoreVertical, Edit, Trash2, Play, Video, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const SHOWS = [
  {
    id: '1',
    title: 'Islamic Finance Unpacked',
    host: 'Dr. Khalid Mansour',
    episodes: 42,
    subscribers: 8400,
    status: 'active',
    cover: 'https://picsum.photos/seed/pod1/80/80',
    episodesData: [
      { id: 'e1', title: 'The Basics of Sukuk Explained', duration: '38 min', date: 'Mar 8, 2026', views: 4200 },
      { id: 'e2', title: 'Shariah-Compliant Equity Investing', duration: '44 min', date: 'Mar 1, 2026', views: 3700 },
      { id: 'e3', title: 'Islamic Microfinance in Practice', duration: '31 min', date: 'Feb 22, 2026', views: 2900 },
    ],
  },
  {
    id: '2',
    title: 'The Fintech Wave',
    host: 'Nadia Rahman',
    episodes: 28,
    subscribers: 6100,
    status: 'active',
    cover: 'https://picsum.photos/seed/pod2/80/80',
    episodesData: [
      { id: 'e4', title: 'Crypto & Halal Finance: Where Do They Meet?', duration: '52 min', date: 'Mar 10, 2026', views: 5100 },
      { id: 'e5', title: 'Digital Wallets for Muslim Travelers', duration: '29 min', date: 'Mar 3, 2026', views: 3200 },
    ],
  },
  {
    id: '3',
    title: 'Takaful Talks',
    host: 'Omar Farouq',
    episodes: 19,
    subscribers: 3200,
    status: 'active',
    cover: 'https://picsum.photos/seed/pod3/80/80',
    episodesData: [
      { id: 'e6', title: 'Family Takaful vs Conventional Insurance', duration: '41 min', date: 'Feb 28, 2026', views: 2100 },
    ],
  },
  {
    id: '4',
    title: 'ESG & Islamic Investing',
    host: 'Sara Al-Qurashi',
    episodes: 14,
    subscribers: 2400,
    status: 'paused',
    cover: 'https://picsum.photos/seed/pod4/80/80',
    episodesData: [],
  },
]

const STATS = [
  { label: 'Total Shows', value: '18', color: '#8b5cf6' },
  { label: 'Episodes', value: '214', color: '#D52B1E' },
  { label: 'Total Plays', value: '1.2M', color: '#10b981' },
  { label: 'Subscribers', value: '24,800', color: '#3b82f6' },
]

export default function AdminPodcasts() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = SHOWS.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Podcast Management</h1>
          <p className="text-slate-500 text-sm">Manage shows and episodes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New Show
          </Button>
          <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
            <Video className="h-3.5 w-3.5" /> Upload Episode
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
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

        {filtered.map((show) => (
          <motion.div key={show.id} variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Show row */}
            <div className="flex items-center gap-4 p-4">
              <img src={show.cover} alt={show.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 truncate">{show.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${show.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {show.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">Host: {show.host}</p>
                <div className="flex gap-4 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Mic className="h-3 w-3" />{show.episodes} episodes</span>
                  <span>{show.subscribers.toLocaleString()} subscribers</span>
                </div>
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
                      <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit Show</button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Plus className="h-3.5 w-3.5 text-green-600" /> Add Episode</button>
                      <hr className="my-1 border-gray-100" />
                      <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Episodes */}
            {expanded === show.id && (
              <div className="border-t border-gray-100 bg-slate-50">
                {show.episodesData.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-6">No episodes yet</p>
                ) : (
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
                      {show.episodesData.map((ep) => (
                        <tr key={ep.id} className="hover:bg-white transition-colors">
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2">
                              <Play className="h-3.5 w-3.5 text-[#D52B1E]" />
                              <span className="text-slate-700 font-medium line-clamp-1">{ep.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs hidden sm:table-cell">{ep.duration}</td>
                          <td className="px-4 py-2.5 text-slate-400 text-xs hidden md:table-cell">{ep.date}</td>
                          <td className="px-4 py-2.5 text-slate-500 text-xs hidden md:table-cell">{ep.views.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-colors"><Edit className="h-3.5 w-3.5" /></button>
                              <button className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="px-5 py-3 border-t border-gray-100">
                  <button className="text-xs text-[#D52B1E] hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add new episode to this show
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}
