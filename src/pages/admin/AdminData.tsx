import { motion } from 'framer-motion'
import { useState } from 'react'
import { Database, Plus, Search, MoreVertical, Edit, Trash2, TrendingUp, BarChart2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const DATASETS = [
  { id: '1', name: 'Global Sukuk Issuance Data', category: 'Sukuk', source: 'IEFA Research', records: '12,400', lastUpdated: 'Mar 12, 2026', status: 'live', freq: 'Daily' },
  { id: '2', name: 'Islamic Banking Assets by Country', category: 'Banking', source: 'IIFA / World Bank', records: '840', lastUpdated: 'Mar 1, 2026', status: 'live', freq: 'Monthly' },
  { id: '3', name: 'Takaful Contributions & GWP 2025', category: 'Takaful', source: 'IAIS', records: '320', lastUpdated: 'Jan 20, 2026', status: 'live', freq: 'Quarterly' },
  { id: '4', name: 'ESG Sukuk Tracker', category: 'ESG', source: 'Bloomberg / IEFA', records: '2,100', lastUpdated: 'Mar 10, 2026', status: 'live', freq: 'Weekly' },
  { id: '5', name: 'IFI Market Capitalisation Index', category: 'Market', source: 'IEFA', records: '560', lastUpdated: 'Mar 8, 2026', status: 'draft', freq: 'Daily' },
  { id: '6', name: 'Waqf Asset Registry (Pilot)', category: 'Waqf', source: 'CIBAFI', records: '0', lastUpdated: '—', status: 'draft', freq: 'Static' },
]

const STATUS_STYLES: Record<string, string> = {
  live: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
}

export default function AdminData() {
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = DATASETS.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Management</h1>
          <p className="text-slate-500 text-sm">Manage market data, datasets and feeds</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Dataset
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Datasets', value: '38', color: '#10b981', icon: Database },
          { label: 'Total Records', value: '2.4M', color: '#3b82f6', icon: BarChart2 },
          { label: 'Live Feeds', value: '12', color: '#D52B1E', icon: TrendingUp },
          { label: 'Last Sync', value: '2m ago', color: '#f59e0b', icon: RefreshCw },
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
            <Input placeholder="Search datasets…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Dataset</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Source</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Records</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Frequency</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Last Updated</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Database className="h-4 w-4 text-blue-500 shrink-0" /><p className="font-medium text-slate-800 line-clamp-1">{d.name}</p></div></td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{d.category}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{d.source}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell">{d.records}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{d.freq}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{d.lastUpdated}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[d.status] ?? ''}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setOpenMenu(openMenu === d.id ? null : d.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === d.id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><RefreshCw className="h-3.5 w-3.5 text-green-600" /> Sync Now</button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"><Edit className="h-3.5 w-3.5 text-blue-600" /> Edit</button>
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
