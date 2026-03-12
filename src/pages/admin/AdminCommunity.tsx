import { motion } from 'framer-motion'
import { useState } from 'react'
import { MessageSquare, Search, MoreVertical, Trash2, Eye, CheckCircle, XCircle, Flag, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const DISCUSSIONS = [
  { id: '1', title: 'Is Crypto Halal? A serious discussion', author: 'Fatima Al-Hassan', replies: 42, views: 1240, status: 'active', flagged: false, date: 'Mar 12, 2026' },
  { id: '2', title: 'Best resources to learn Islamic Finance from scratch?', author: 'Yusuf Okonkwo', replies: 29, views: 890, status: 'active', flagged: false, date: 'Mar 10, 2026' },
  { id: '3', title: 'Offshore Sukuk structuring experiences', author: 'Khalid Mansour', replies: 14, views: 540, status: 'active', flagged: false, date: 'Mar 8, 2026' },
  { id: '4', title: '[SPAM] Buy cheap forex signals!', author: 'unknown_user', replies: 2, views: 30, status: 'hidden', flagged: true, date: 'Mar 11, 2026' },
  { id: '5', title: 'Takaful vs conventional insurance — personal experience', author: 'Aisha Bello', replies: 18, views: 620, status: 'active', flagged: false, date: 'Mar 6, 2026' },
  { id: '6', title: 'Are interest-free mortgages available in the UK?', author: 'Omar Farouq', replies: 35, views: 1080, status: 'active', flagged: false, date: 'Mar 3, 2026' },
]

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  hidden: 'bg-red-50 text-red-700',
}

export default function AdminCommunity() {
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = DISCUSSIONS.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Community Management</h1>
          <p className="text-slate-500 text-sm">Moderate discussions, posts and member interactions</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Discussions', value: '1,420', color: '#8b5cf6', icon: MessageSquare },
          { label: 'Active Members', value: '5,612', color: '#3b82f6', icon: Users },
          { label: 'Flagged Posts', value: '7', color: '#ef4444', icon: Flag },
          { label: 'Posts Today', value: '34', color: '#10b981', icon: CheckCircle },
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

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search discussions…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
            <Flag className="h-3.5 w-3.5" /> Flagged (7)
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
              {filtered.map((d) => (
                <tr key={d.id} className={`hover:bg-slate-50/50 ${d.flagged ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {d.flagged && <Flag className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                      <p className="font-medium text-slate-800 line-clamp-1">{d.title}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{d.author}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{d.replies}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{d.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{d.date}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[d.status] ?? ''}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === d.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Eye className="h-3.5 w-3.5 text-blue-600" /> View</button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><CheckCircle className="h-3.5 w-3.5 text-green-600" /> Approve</button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><XCircle className="h-3.5 w-3.5 text-yellow-600" /> Hide</button>
                          <hr className="my-1 border-gray-100" />
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
