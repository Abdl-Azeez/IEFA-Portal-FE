import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Newspaper,
  Plus,
  Search,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Tag,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const ARTICLES = [
  { id: '1', title: 'The $4 Trillion Shift: Islamic Finance Is Reshaping Global Capital Markets', author: 'Dr. Khalid Mansour', status: 'published', views: 48200, tags: ['Market', 'Sukuk'], date: 'Mar 10, 2026' },
  { id: '2', title: "AAOIFI's New Shariah Standards for Tokenised Assets", author: 'Sara Al-Qurashi', status: 'published', views: 36100, tags: ['Regulation', 'Policy'], date: 'Mar 9, 2026' },
  { id: '3', title: 'ESG Sukuk: How Islamic Finance Is Leading the Green Bond Evolution', author: 'Admin', status: 'published', views: 29400, tags: ['ESG', 'Sustainability'], date: 'Mar 8, 2026' },
  { id: '4', title: 'Islamic Fintech: Disruption or Disrupted?', author: 'Nadia Rahman', status: 'draft', views: 0, tags: ['Fintech'], date: 'Mar 11, 2026' },
  { id: '5', title: 'Takaful Market Report: Q1 2026 Analysis', author: 'Omar Farouq', status: 'published', views: 18600, tags: ['Takaful', 'Insurance'], date: 'Mar 5, 2026' },
  { id: '6', title: 'Pakistan Islamic Banking Crosses 25% Market Share', author: 'Admin', status: 'draft', views: 0, tags: ['Banking'], date: 'Mar 12, 2026' },
  { id: '7', title: 'Malaysia Leads Global Sukuk Issuance in 2026', author: 'Fatima Al-Hassan', status: 'published', views: 12300, tags: ['Sukuk', 'Malaysia'], date: 'Mar 3, 2026' },
  { id: '8', title: 'Waqf-Based Microfinance Models Gaining Regional Traction', author: 'Dr. Khalid Mansour', status: 'review', views: 0, tags: ['Microfinance', 'Waqf'], date: 'Mar 11, 2026' },
]

const STATUS_STYLES: Record<string, { cls: string; icon: React.ElementType }> = {
  published: { cls: 'bg-green-50 text-green-700', icon: CheckCircle },
  draft: { cls: 'bg-slate-100 text-slate-600', icon: FileText },
  review: { cls: 'bg-yellow-50 text-yellow-700', icon: Clock },
}

const STATS = [
  { label: 'Total Articles', value: '348', icon: Newspaper, color: '#D52B1E' },
  { label: 'Published', value: '302', icon: CheckCircle, color: '#10b981' },
  { label: 'Drafts', value: '31', icon: FileText, color: '#6b7280' },
  { label: 'Total Views', value: '2.1M', icon: Eye, color: '#3b82f6' },
]

export default function AdminNews() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = ARTICLES.filter(
    (a) =>
      (statusFilter === 'All' || a.status === statusFilter.toLowerCase()) &&
      a.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">News Management</h1>
          <p className="text-slate-500 text-sm">Create, edit and publish news articles</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New Article
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
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

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search articles…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg border-gray-200" />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="h-4 w-4 text-slate-400" />
            {['All', 'Published', 'Draft', 'Review'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${statusFilter === s ? 'bg-[#D52B1E] text-white border-[#D52B1E]' : 'border-gray-200 hover:border-[#D52B1E]'}`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Article</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Author</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Tags</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Views</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((a) => {
                const { cls, icon: StatusIcon } = STATUS_STYLES[a.status] ?? { cls: '', icon: FileText }
                return (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <p className="font-medium text-slate-800 text-sm line-clamp-1">{a.title}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{a.author}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-1">
                        {a.tags.slice(0, 2).map((t) => (
                          <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Tag className="h-2.5 w-2.5" />{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{a.views > 0 ? a.views.toLocaleString() : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit capitalize ${cls}`}>
                        <StatusIcon className="h-3 w-3" />{a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{a.date}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {openMenu === a.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                            {a.status !== 'published' && (
                              <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Send className="h-3.5 w-3.5 text-green-600" /> Publish</button>
                            )}
                            <hr className="my-1 border-gray-100" />
                            <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-slate-500">
          <span>Showing {filtered.length} of 348 articles</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
            {[1, 2, 3, '…', 36].map((p) => (
              <button key={p} className={`h-7 w-7 rounded-lg text-xs ${p === 1 ? 'bg-[#D52B1E] text-white' : 'hover:bg-slate-100'}`}>{p}</button>
            ))}
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
