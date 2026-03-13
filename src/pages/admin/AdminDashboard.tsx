import { motion } from 'framer-motion'
import {
  Users,
  Newspaper,
  Mic,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Award,
  UserCheck,
  Database,
  FileText,
  Loader2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import {
  useAdminUsers,
  useAdminNews,
  useAdminShows,
  useAdminResearchReports,
  useAdminDatasets,
} from '@/hooks/useAdmin'

/* ── helpers ── */
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
}
const item = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  color,
  isLoading,
}: Readonly<{
  label: string
  value: string
  sub: string
  icon: React.ElementType
  trend: number
  color: string
  isLoading?: boolean
}>) {
  const up = trend >= 0
  return (
    <motion.div
      variants={item}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {Math.abs(trend)}%
        </span>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 mb-1">
          <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
        </div>
      ) : (
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      )}
      <p className="text-sm font-medium text-slate-600 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </motion.div>
  )
}

/* ── Charts data ─────────────────────────────────────────────────────────── */
const MONTHLY_DATA = [
  { month: 'Sep', users: 820, views: 92000, downloads: 1400 },
  { month: 'Oct', users: 940, views: 114000, downloads: 1800 },
  { month: 'Nov', users: 1080, views: 132000, downloads: 2100 },
  { month: 'Dec', users: 920, views: 108000, downloads: 1600 },
  { month: 'Jan', users: 1340, views: 156000, downloads: 2800 },
  { month: 'Feb', users: 1580, views: 182000, downloads: 3200 },
  { month: 'Mar', users: 1740, views: 204000, downloads: 3700 },
]

/* ── Activity feed ─────────────────────────────────────────────────────────  */
const ACTIVITY = [
  { icon: UserCheck, color: '#3b82f6', text: 'New user registered: Fatima Al-Hassan', time: '2m ago' },
  { icon: Newspaper, color: '#D52B1E', text: 'Article published: "Sukuk Market Outlook 2026"', time: '18m ago' },
  { icon: GraduationCap, color: '#10b981', text: 'Course enrolled: Islamic Finance Fundamentals (×12)', time: '34m ago' },
  { icon: Award, color: '#f97316', text: '3 certificates issued for Shariah Compliance course', time: '1h ago' },
  { icon: MessageSquare, color: '#8b5cf6', text: 'New discussion started in Community', time: '2h ago' },
  { icon: Mic, color: '#8b5cf6', text: 'New podcast episode uploaded: "The Fintech Wave"', time: '3h ago' },
  { icon: DollarSign, color: '#f59e0b', text: 'Payment received: $299 - Premium subscription', time: '4h ago' },
  { icon: BookOpen, color: '#06b6d4', text: 'New educator approved: Dr. Khalid Mansour', time: '5h ago' },
]

/* ── Top content ────────────────────────────────────────────────────────── */
const TOP_ARTICLES = [
  { title: 'The $4 Trillion Shift in Islamic Finance', views: 48200, growth: 12 },
  { title: 'AAOIFI Shariah Standards for Digital Assets', views: 36100, growth: 8 },
  { title: 'ESG Sukuk: Leading the Green Bond Revolution', views: 29400, growth: 22 },
  { title: 'Islamic Fintech: Disruption or Disrupted?', views: 21800, growth: -4 },
  { title: 'Takaful Market Report 2026', views: 18600, growth: 15 },
]

/* ── Main component ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({ perPage: 1 })
  const { data: newsData, isLoading: newsLoading } = useAdminNews({ perPage: 1 })
  const { data: showsData, isLoading: showsLoading } = useAdminShows({ perPage: 1 })
  const { data: researchData, isLoading: researchLoading } = useAdminResearchReports({ perPage: 1 })
  const { data: datasetsData, isLoading: datasetsLoading } = useAdminDatasets({ perPage: 1 })

  const stats = [
    { label: 'Total Users', value: usersData?.meta?.itemCount?.toLocaleString() ?? '—', sub: 'Registered accounts', icon: Users, trend: 12.4, color: '#3b82f6', isLoading: usersLoading },
    { label: 'News Articles', value: newsData?.meta?.itemCount?.toLocaleString() ?? '—', sub: 'Total articles in system', icon: Newspaper, trend: 8.1, color: '#D52B1E', isLoading: newsLoading },
    { label: 'Podcast Shows', value: showsData?.meta?.itemCount?.toLocaleString() ?? '—', sub: 'Video podcast shows', icon: Mic, trend: 5.3, color: '#8b5cf6', isLoading: showsLoading },
    { label: 'Research Reports', value: researchData?.meta?.itemCount?.toLocaleString() ?? '—', sub: 'Total reports', icon: FileText, trend: 11.2, color: '#10b981', isLoading: researchLoading },
    { label: 'Datasets', value: datasetsData?.meta?.itemCount?.toLocaleString() ?? '—', sub: 'Available datasets', icon: Database, trend: 7.8, color: '#06b6d4', isLoading: datasetsLoading },
    { label: 'Active Courses', value: '63', sub: '1,240 enrolled this month', icon: GraduationCap, trend: 19.7, color: '#10b981' },
    { label: 'Content Views', value: '2.1M', sub: 'Past 30 days', icon: Eye, trend: -3.2, color: '#06b6d4' },
    { label: 'Certificates Issued', value: '892', sub: 'This quarter', icon: Award, trend: 31.2, color: '#f97316' },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page title */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Overview of all system activity · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts + activity row */}
      <div className="grid md:grid-cols-3 gap-5">
        {/* Charts row */}
        <motion.div
          variants={item}
          className="md:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-slate-700">User Growth & Content Views</h3>
            <span className="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">Last 7 months</span>
          </div>
          <p className="text-sm text-slate-400 mb-4">Monthly new registrations and page views</p>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="users" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="views" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="users" type="monotone" dataKey="users" name="New Users" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line yAxisId="views" type="monotone" dataKey="views" name="Views" stroke="#D52B1E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Downloads bar chart */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-slate-700 mb-1">Monthly Downloads</h3>
          <p className="text-sm text-slate-400 mb-4">Research report &amp; dataset downloads</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }} />
              <Bar dataKey="downloads" name="Downloads" fill="#D52B1E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User breakdown */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-slate-700 mb-1">User Breakdown</h3>
          <p className="text-sm text-slate-400 mb-4">By account type</p>
          <div className="space-y-3">
            {[
              { label: 'Free Learners', count: 8240, pct: 64, color: '#3b82f6' },
              { label: 'Premium Members', count: 2890, pct: 23, color: '#D52B1E' },
              { label: 'IF Professionals', count: 1380, pct: 11, color: '#10b981' },
              { label: 'Educators', count: 337, pct: 2, color: '#f59e0b' },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{row.label}</span>
                  <span className="text-slate-400">{row.count.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: row.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity + top articles */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Recent activity */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Recent Activity</h3>
            <button className="text-xs text-[#D52B1E] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {ACTIVITY.map((a) => (
              <div key={a.text} className="flex items-start gap-3">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${a.color}18` }}
                >
                  <a.icon className="h-3.5 w-3.5" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{a.text}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top articles */}
        <motion.div
          variants={item}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-700">Top Articles (30 days)</h3>
            <button className="text-xs text-[#D52B1E] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {TOP_ARTICLES.map((a, i) => (
              <div key={a.title} className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-200 w-6 text-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 line-clamp-1">{a.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {a.views.toLocaleString()} views
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        a.growth >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                      }`}
                    >
                      {a.growth >= 0 ? '+' : ''}{a.growth}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
