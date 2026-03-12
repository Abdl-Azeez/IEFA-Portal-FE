import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Users,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Trash2,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const USERS = [
  { id: '1', name: 'Fatima Al-Hassan', email: 'fatima@example.com', role: 'Premium', country: 'UAE', joined: 'Jan 12, 2026', status: 'active', courses: 4 },
  { id: '2', name: 'Khalid Mansour', email: 'khalid@example.com', role: 'Educator', country: 'Saudi Arabia', joined: 'Nov 5, 2025', status: 'active', courses: 0 },
  { id: '3', name: 'Aisha Bello', email: 'aisha@example.com', role: 'Free', country: 'Nigeria', joined: 'Feb 20, 2026', status: 'active', courses: 2 },
  { id: '4', name: 'Mohammed Idris', email: 'midris@example.com', role: 'Premium', country: 'Malaysia', joined: 'Dec 1, 2025', status: 'suspended', courses: 7 },
  { id: '5', name: 'Sara Al-Qurashi', email: 'sara@example.com', role: 'IF Professional', country: 'Kuwait', joined: 'Mar 1, 2026', status: 'active', courses: 1 },
  { id: '6', name: 'Yusuf Okonkwo', email: 'yusuf@example.com', role: 'Free', country: 'UK', joined: 'Oct 18, 2025', status: 'pending', courses: 0 },
  { id: '7', name: 'Nadia Rahman', email: 'nadia@example.com', role: 'Premium', country: 'Bangladesh', joined: 'Jan 28, 2026', status: 'active', courses: 5 },
  { id: '8', name: 'Omar Farouq', email: 'omar@example.com', role: 'Educator', country: 'Egypt', joined: 'Sep 10, 2025', status: 'active', courses: 0 },
]

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  suspended: 'bg-red-50 text-red-700',
  pending: 'bg-yellow-50 text-yellow-700',
}

const ROLE_COLORS: Record<string, string> = {
  Premium: 'bg-[#D52B1E]/10 text-[#D52B1E]',
  Educator: 'bg-blue-50 text-blue-700',
  Free: 'bg-gray-100 text-gray-600',
  'IF Professional': 'bg-purple-50 text-purple-700',
}

const STATS = [
  { label: 'Total Users', value: '12,847', icon: Users, color: '#3b82f6' },
  { label: 'Active', value: '11,204', icon: UserCheck, color: '#10b981' },
  { label: 'Suspended', value: '143', icon: UserX, color: '#ef4444' },
  { label: 'Educators', value: '337', icon: Shield, color: '#8b5cf6' },
]

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filtered = USERS.filter(
    (u) =>
      (roleFilter === 'All' || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm">Manage all registered users and their roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Invite User
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            variants={item}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
          >
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

      {/* Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm rounded-lg border-gray-200"
            />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            {['All', 'Free', 'Premium', 'Educator', 'IF Professional'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                  roleFilter === r
                    ? 'bg-[#D52B1E] text-white border-[#D52B1E]'
                    : 'border-gray-200 hover:border-[#D52B1E] hover:text-[#D52B1E]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Country</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Joined</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Courses</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#D52B1E]/10 flex items-center justify-center text-xs font-bold text-[#D52B1E] shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell text-xs">{u.country}</td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell text-xs">{u.joined}</td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell text-xs">{u.courses}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[u.status] ?? ''}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenu === u.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-10 py-1 text-sm">
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                            <UserCheck className="h-3.5 w-3.5 text-green-600" /> Activate
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                            <UserX className="h-3.5 w-3.5 text-yellow-600" /> Suspend
                          </button>
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700">
                            <Mail className="h-3.5 w-3.5 text-blue-600" /> Send Email
                          </button>
                          <hr className="my-1 border-gray-100" />
                          <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600">
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-slate-500">
          <span>Showing {filtered.length} of 12,847 users</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronLeft className="h-4 w-4" /></Button>
            {[1, 2, 3, '…', 128].map((p) => (
              <button key={p} className={`h-7 w-7 rounded-lg text-xs transition-colors ${p === 1 ? 'bg-[#D52B1E] text-white' : 'hover:bg-slate-100'}`}>{p}</button>
            ))}
            <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
