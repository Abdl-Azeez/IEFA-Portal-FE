import { motion } from 'framer-motion'
import { useState } from 'react'
import { FolderOpen, Plus, Search, MoreVertical, Edit, Trash2, Eye, Building, MapPin, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const ENTRIES = [
  { id: '1', name: 'Dubai Islamic Bank', type: 'Bank', country: 'UAE', city: 'Dubai', website: 'dib.ae', status: 'active' },
  { id: '2', name: 'Maybank Islamic', type: 'Bank', country: 'Malaysia', city: 'Kuala Lumpur', website: 'maybank.com', status: 'active' },
  { id: '3', name: 'Al Rajhi Bank', type: 'Bank', country: 'Saudi Arabia', city: 'Riyadh', website: 'alrajhibank.com.sa', status: 'active' },
  { id: '4', name: 'Amundi Islamic Fund', type: 'Fund', country: 'France', city: 'Paris', website: 'amundi.com', status: 'active' },
  { id: '5', name: 'CIMB Islamic', type: 'Bank', country: 'Malaysia', city: 'Kuala Lumpur', website: 'cimb.com', status: 'active' },
  { id: '6', name: 'Noor Bank', type: 'Bank', country: 'UAE', city: 'Dubai', website: 'noorbank.com', status: 'inactive' },
  { id: '7', name: 'IFAAS Consulting', type: 'Consultancy', country: 'UK', city: 'London', website: 'ifaas.com', status: 'active' },
  { id: '8', name: 'Gulf Islamic Investments', type: 'Investment Firm', country: 'UAE', city: 'Dubai', website: 'giig.ae', status: 'active' },
]

export default function AdminDirectory() {
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = ENTRIES.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.type.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Directory Management</h1>
          <p className="text-slate-500 text-sm">Manage the Islamic Finance institution directory</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Entry
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Entries', value: '1,284', color: '#D52B1E', icon: FolderOpen },
          { label: 'Banks', value: '648', color: '#3b82f6', icon: Building },
          { label: 'Countries', value: '54', color: '#10b981', icon: MapPin },
          { label: 'Pending Review', value: '12', color: '#f59e0b', icon: Eye },
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
            <Input placeholder="Search directory…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Institution</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Type</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Country</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">Website</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-[#D52B1E]/10 flex items-center justify-center text-[10px] font-bold text-[#D52B1E]">{e.name.charAt(0)}</div><span className="font-medium text-slate-800">{e.name}</span></div></td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{e.type}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell"><MapPin className="h-3 w-3 inline-block mr-1" />{e.city}, {e.country}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell"><span className="flex items-center gap-1"><Globe className="h-3 w-3" />{e.website}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{e.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button onClick={() => setOpenMenu(openMenu === e.id ? null : e.id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === e.id && (
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
