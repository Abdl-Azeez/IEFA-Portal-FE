import { motion } from 'framer-motion'
import { useState } from 'react'
import { FileText, Plus, Search, MoreVertical, Edit, Trash2, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const REPORTS = [
  { id: '1', title: 'Global Islamic Finance Report 2026', author: 'IEFA Research', category: 'Annual Report', pages: 84, downloads: 3200, status: 'published', date: 'Mar 1, 2026' },
  { id: '2', title: 'Sukuk Market Outlook Q1 2026', author: 'Dr. Khalid Mansour', category: 'Market Analysis', pages: 32, downloads: 2100, status: 'published', date: 'Feb 28, 2026' },
  { id: '3', title: 'Green & Sustainable Sukuk Review 2025', author: 'Sara Al-Qurashi', category: 'ESG Report', pages: 48, downloads: 1800, status: 'published', date: 'Jan 20, 2026' },
  { id: '4', title: 'Islamic Fintech Landscape 2026', author: 'IEFA Research', category: 'Sector Report', pages: 0, downloads: 0, status: 'draft', date: 'Mar 12, 2026' },
  { id: '5', title: 'Takaful Industry Report: GCC Focus', author: 'Omar Farouq', category: 'Regional Report', pages: 56, downloads: 940, status: 'published', date: 'Dec 15, 2025' },
  { id: '6', title: 'Digital Assets & Waqf Tokenisation', author: 'Nadia Rahman', category: 'Policy Paper', pages: 28, downloads: 0, status: 'review', date: 'Mar 11, 2026' },
]

const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  review: 'bg-yellow-50 text-yellow-700',
}

export default function AdminResearch() {
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = REPORTS.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.author.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Research & Reports</h1>
          <p className="text-slate-500 text-sm">Manage research publications and reports</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Upload Report
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: '124', color: '#D52B1E' },
          { label: 'Published', value: '106', color: '#10b981' },
          { label: 'Drafts', value: '12', color: '#6b7280' },
          { label: 'Total Downloads', value: '84K', color: '#3b82f6' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search reports…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Report</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Author</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Category</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Downloads</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#D52B1E] shrink-0" /><p className="font-medium text-slate-800 line-clamp-1">{r.title}</p></div></td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{r.author}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{r.category}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell"><span className="flex items-center gap-1"><Download className="h-3 w-3" />{r.downloads > 0 ? r.downloads.toLocaleString() : '—'}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status] ?? ''}`}>{r.status}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{r.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === r.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Eye className="h-3.5 w-3.5 text-green-600" /> View</button>
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
