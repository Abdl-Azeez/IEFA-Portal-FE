import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  BookOpen, UserCheck, Video, Award, CreditCard, Plus, Search,
  Edit, Trash2, Eye, CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

type Tab = 'courses' | 'educators' | 'videos' | 'programmes' | 'certificates' | 'payments'

/* ── Static data ─────────────────────────────────────────────────────────── */
const COURSES = [
  { id: '1', title: 'Islamic Finance Fundamentals', educator: 'Dr. Khalid Mansour', enrolled: 1240, status: 'active', price: '$99', rating: 4.8, date: 'Jan 2026' },
  { id: '2', title: 'Shariah-Compliant Investment Strategies', educator: 'Sara Al-Qurashi', enrolled: 890, status: 'active', price: '$149', rating: 4.7, date: 'Feb 2026' },
  { id: '3', title: 'Takaful and Islamic Insurance', educator: 'Omar Farouq', enrolled: 560, status: 'active', price: '$79', rating: 4.6, date: 'Nov 2025' },
  { id: '4', title: 'Sukuk Structuring & Issuance', educator: 'Dr. Khalid Mansour', enrolled: 0, status: 'draft', price: '$199', rating: 0, date: 'Mar 2026' },
  { id: '5', title: 'ESG and Islamic Finance Integration', educator: 'Nadia Rahman', enrolled: 320, status: 'active', price: '$129', rating: 4.5, date: 'Dec 2025' },
]

const EDUCATORS = [
  { id: '1', name: 'Dr. Khalid Mansour', email: 'khalid@iefa.org', courses: 3, students: 2320, status: 'approved', joined: 'Nov 2025' },
  { id: '2', name: 'Sara Al-Qurashi', email: 'sara@iefa.org', courses: 2, students: 1210, status: 'approved', joined: 'Jan 2026' },
  { id: '3', name: 'Omar Farouq', email: 'omar@iefa.org', courses: 1, students: 560, status: 'approved', joined: 'Sep 2025' },
  { id: '4', name: 'Nadia Rahman', email: 'nadia@iefa.org', courses: 1, students: 320, status: 'approved', joined: 'Dec 2025' },
  { id: '5', name: 'Mohammed Idris', email: 'midris@iefa.org', courses: 0, students: 0, status: 'pending', joined: 'Mar 2026' },
]

const VIDEOS = [
  { id: '1', title: 'Introduction to Islamic Finance', course: 'IF Fundamentals', duration: '18:24', views: 4200, status: 'published' },
  { id: '2', title: 'Principles of Murabaha', course: 'IF Fundamentals', duration: '22:10', views: 3800, status: 'published' },
  { id: '3', title: 'Sukuk vs Bonds: Key Differences', course: 'Sukuk Structuring', duration: '31:00', views: 0, status: 'processing' },
  { id: '4', title: 'Takaful Models Explained', course: 'Takaful', duration: '26:45', views: 2100, status: 'published' },
  { id: '5', title: 'ESG Screening Under Shariah', course: 'ESG & Islamic Finance', duration: '19:38', views: 1600, status: 'published' },
]

const PROGRAMMES = [
  { id: '1', title: 'Certified Islamic Finance Professional (CIFP)', courses: 5, enrolled: 340, duration: '6 months', price: '$599' },
  { id: '2', title: 'Islamic Capital Markets Diploma', courses: 3, enrolled: 180, duration: '4 months', price: '$449' },
  { id: '3', title: 'Takaful Specialist Programme', courses: 2, enrolled: 90, duration: '3 months', price: '$299' },
]

const CERTIFICATES = [
  { id: '1', user: 'Fatima Al-Hassan', programme: 'CIFP', issued: 'Mar 10, 2026', status: 'issued' },
  { id: '2', user: 'Yusuf Okonkwo', programme: 'Islamic Capital Markets', issued: 'Mar 8, 2026', status: 'issued' },
  { id: '3', user: 'Aisha Bello', programme: 'Takaful Specialist', issued: 'Mar 5, 2026', status: 'issued' },
  { id: '4', user: 'Mohammed Idris', programme: 'CIFP', issued: '—', status: 'pending' },
  { id: '5', user: 'Sara Khalid', programme: 'Islamic Capital Markets', issued: 'Feb 28, 2026', status: 'issued' },
]

const PAYMENTS = [
  { id: 'TXN001', user: 'Fatima Al-Hassan', item: 'CIFP Programme', amount: '$599', date: 'Mar 10, 2026', status: 'completed' },
  { id: 'TXN002', user: 'Yusuf Okonkwo', item: 'IF Fundamentals (Course)', amount: '$99', date: 'Mar 9, 2026', status: 'completed' },
  { id: 'TXN003', user: 'Aisha Bello', item: 'Takaful Programme', amount: '$299', date: 'Mar 8, 2026', status: 'completed' },
  { id: 'TXN004', user: 'Mohammed Idris', item: 'Premium Subscription', amount: '$49/mo', date: 'Mar 5, 2026', status: 'refunded' },
  { id: 'TXN005', user: 'Omar Al-Sayed', item: 'Sukuk Structuring (Course)', amount: '$199', date: 'Mar 3, 2026', status: 'pending' },
]

/* ── Status helpers ─────────────────────────────── */
const statusCls: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  draft: 'bg-slate-100 text-slate-500',
  published: 'bg-green-50 text-green-700',
  processing: 'bg-yellow-50 text-yellow-700',
  approved: 'bg-green-50 text-green-700',
  pending: 'bg-yellow-50 text-yellow-700',
  issued: 'bg-green-50 text-green-700',
  completed: 'bg-green-50 text-green-700',
  refunded: 'bg-red-50 text-red-700',
}

/* ── Tab icon map ─────────────────────────────────── */
const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'educators', label: 'Educators', icon: UserCheck },
  { id: 'videos', label: 'Course Videos', icon: Video },
  { id: 'programmes', label: 'Programmes', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'payments', label: 'Payments', icon: CreditCard },
]

export default function AdminLearning() {
  const [tab, setTab] = useState<Tab>('courses')
  const [search, setSearch] = useState('')

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Learning Management</h1>
          <p className="text-slate-500 text-sm">Manage courses, educators, videos, programmes & more</p>
        </div>
        <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add New
        </Button>
      </motion.div>

      {/* LMS Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Courses', value: '63', color: '#10b981' },
          { label: 'Educators', value: '14', color: '#3b82f6' },
          { label: 'Videos', value: '312', color: '#8b5cf6' },
          { label: 'Programmes', value: '8', color: '#f59e0b' },
          { label: 'Certificates', value: '892', color: '#ec4899' },
          { label: 'Revenue', value: '$184K', color: '#D52B1E' },
        ].map((s) => (
          <motion.div key={s.label} variants={item} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tab nav */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSearch('') }}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-[#D52B1E] text-[#D52B1E] bg-[#D52B1E]/4'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder={`Search ${tab}…`} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-lg" />
          </div>
        </div>

        {/* Tab content */}
        <div className="overflow-x-auto">
          {tab === 'courses' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Course</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Educator</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Enrolled</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Price</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Rating</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {COURSES.filter((c) => c.title.toLowerCase().includes(search.toLowerCase())).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-xs"><p className="line-clamp-1">{c.title}</p></td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{c.educator}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden sm:table-cell">{c.enrolled.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden lg:table-cell font-semibold">{c.price}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden lg:table-cell">{c.rating > 0 ? `⭐ ${c.rating}` : '—'}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusCls[c.status] ?? ''}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></button><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'educators' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Educator</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Courses</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Students</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {EDUCATORS.filter((e) => e.name.toLowerCase().includes(search.toLowerCase())).map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">{e.name.charAt(0)}</div><div><p className="font-medium text-slate-800">{e.name}</p><p className="text-xs text-slate-400">{e.email}</p></div></div></td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden md:table-cell">{e.courses}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden md:table-cell">{e.students.toLocaleString()}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden lg:table-cell">{e.joined}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusCls[e.status] ?? ''}`}>{e.status}</span></td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-green-600"><CheckCircle className="h-3.5 w-3.5" /></button><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'videos' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Video</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Course</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Duration</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Views</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {VIDEOS.filter((v) => v.title.toLowerCase().includes(search.toLowerCase())).map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800"><div className="flex items-center gap-2"><Video className="h-4 w-4 text-[#D52B1E]" /><p className="line-clamp-1">{v.title}</p></div></td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{v.course}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{v.duration}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell"><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{v.views > 0 ? v.views.toLocaleString() : '—'}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusCls[v.status] ?? ''}`}>{v.status}</span></td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></button><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'programmes' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Programme</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Courses</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Enrolled</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Duration</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Price</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PROGRAMMES.filter((p) => p.title.toLowerCase().includes(search.toLowerCase())).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800"><p className="line-clamp-1">{p.title}</p></td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden sm:table-cell">{p.courses} courses</td>
                    <td className="px-4 py-3 text-slate-600 text-xs hidden md:table-cell">{p.enrolled}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{p.duration}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700 text-xs hidden lg:table-cell">{p.price}</td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Edit className="h-3.5 w-3.5" /></button><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'certificates' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Recipient</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Programme</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Issued Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {CERTIFICATES.filter((c) => c.user.toLowerCase().includes(search.toLowerCase())).map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.user}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden md:table-cell">{c.programme}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{c.issued}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusCls[c.status] ?? ''}`}>{c.status}</span></td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1"><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-green-600"><Award className="h-3.5 w-3.5" /></button><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Eye className="h-3.5 w-3.5" /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'payments' && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">Transaction</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">User</th>
                  <th className="px-4 py-3 text-left hidden lg:table-cell">Item</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">Amount</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PAYMENTS.filter((p) => p.user.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800 hidden md:table-cell">{p.user}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs hidden lg:table-cell line-clamp-1 max-w-[160px]">{p.item}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 hidden sm:table-cell">{p.amount}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{p.date}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusCls[p.status] ?? ''}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-right"><button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600"><Eye className="h-3.5 w-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
