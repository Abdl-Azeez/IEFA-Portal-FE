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
  Edit,
  Trash2,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Dialog } from '@/components/ui/dialog'
import { TableSkeleton, CardGridSkeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { exportToCsv } from '@/lib/utils'
import {
  useAdminUsers,
  useAdminVerifyUser,
  useAdminDeactivateUser,
  useAdminDeleteUser,
  useAdminUpdateUser,
  type AdminUser,
} from '@/hooks/useAdmin'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { y: 16, opacity: 0 }, show: { y: 0, opacity: 1 } }

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-red-50 text-red-700',
  unverified: 'bg-yellow-50 text-yellow-700',
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-[#D52B1E]/10 text-[#D52B1E]',
  moderator: 'bg-purple-50 text-purple-700',
  educator: 'bg-blue-50 text-blue-700',
  student: 'bg-gray-100 text-gray-600',
  // legacy fallbacks
  staff: 'bg-purple-50 text-purple-700',
  instructor: 'bg-blue-50 text-blue-700',
}

const ROLE_FILTERS = ['All', 'student', 'educator', 'moderator', 'admin'] as const
type RoleFilter = (typeof ROLE_FILTERS)[number]

function userStatus(u: AdminUser) {
  if (!u.isActive) return 'inactive'
  if (!u.isVerified) return 'unverified'
  return 'active'
}

export default function AdminUsers() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('All')
  const [page, setPage] = useState(1)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', country: '', role: 'student' as AdminUser['role'] })

  function openEditUser(u: AdminUser) {
    setEditUser(u)
    setEditForm({ firstName: u.firstName, lastName: u.lastName, phone: u.phone ?? '', country: u.country ?? '', role: u.role })
    setOpenMenu(null)
    setEditModalOpen(true)
  }

  function closeEditModal() { setEditModalOpen(false); setEditUser(null); setEditForm({ firstName: '', lastName: '', phone: '', country: '', role: 'student' }) }

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    role: roleFilter === 'All' ? undefined : (roleFilter as AdminUser['role']),
    page,
    perPage: 15,
  })
  const verifyMutation = useAdminVerifyUser()
  const deactivateMutation = useAdminDeactivateUser()
  const deleteMutation = useAdminDeleteUser()
  const updateMutation = useAdminUpdateUser()

  const users = data?.data ?? []
  const meta = data?.meta

  const totalPages = meta?.pageCount ?? 1
  function buildPageNumbers(): (number | string)[] {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
    if (page <= 3) return [1, 2, 3, '…', totalPages]
    if (page >= totalPages - 2) return [1, '…', totalPages - 2, totalPages - 1, totalPages]
    return [1, '…', page, '…', totalPages]
  }
  const pageNumbers = buildPageNumbers()

  const activeCount = users.filter((u) => u.isActive).length
  const inactiveCount = users.filter((u) => !u.isActive).length
  const instructorCount = users.filter((u) => u.role === 'instructor').length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm">Manage all registered users and their roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 rounded-lg" onClick={() => exportToCsv('users', users.map((u) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, country: u.country ?? '', isVerified: u.isVerified, isActive: u.isActive, joined: u.createdAt })))}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg gap-1.5">
            <Mail className="h-3.5 w-3.5" /> Invite User
          </Button>
        </div>
      </motion.div>

      {/* Stat cards */}
      {isLoading ? <CardGridSkeleton count={4} /> : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: meta?.itemCount ?? '—', icon: Users, color: '#3b82f6' },
          { label: 'Active', value: activeCount, icon: UserCheck, color: '#10b981' },
          { label: 'Inactive', value: inactiveCount, icon: UserX, color: '#ef4444' },
          { label: 'Instructors', value: instructorCount, icon: Shield, color: '#8b5cf6' },
        ].map((s) => (
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
      )}

      {/* Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-9 text-sm rounded-lg border-gray-200"
            />
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Filter className="h-4 w-4" />
            {ROLE_FILTERS.map((r) => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1) }}
                className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${
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
          {isLoading && <TableSkeleton rows={8} cols={6} />}
          {!isLoading && users.length === 0 && (
            <EmptyState icon={Users} title="No users found" description="Try adjusting your search or role filter." />
          )}
          {!isLoading && users.length > 0 && (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Country</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => {
                  const status = userStatus(u)
                  const fullName = `${u.firstName} ${u.lastName}`.trim() || u.email
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#D52B1E]/10 flex items-center justify-center text-xs font-bold text-[#D52B1E] shrink-0">
                            {fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{fullName}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell text-xs">{u.country ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-400 hidden md:table-cell text-xs">
                        {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[status] ?? ''}`}>
                          {status}
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
                              <button
                                onClick={() => openEditUser(u)}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <Edit className="h-3.5 w-3.5 text-blue-600" /> Edit
                              </button>
                              {!u.isVerified && (
                                <button
                                  onClick={() => { verifyMutation.mutate(u.id); setOpenMenu(null) }}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                                >
                                  <UserCheck className="h-3.5 w-3.5 text-green-600" /> Verify
                                </button>
                              )}
                              <button
                                onClick={() => { deactivateMutation.mutate(u.id); setOpenMenu(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                              >
                                <UserX className="h-3.5 w-3.5 text-yellow-600" /> Deactivate
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button
                                onClick={() => { deleteMutation.mutate(u.id); setOpenMenu(null) }}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.pageCount > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-xs text-slate-500">
            <span>
              Showing {(meta.page - 1) * meta.perPage + 1}–{Math.min(meta.page * meta.perPage, meta.itemCount)} of {meta.itemCount} users
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!meta.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((p) => {
                const cls = p === page
                  ? 'bg-[#D52B1E] text-white'
                  : 'hover:bg-slate-100'
                const isEllipsis = p === '…'
                return (
                  <button
                    key={String(p)}
                    onClick={() => typeof p === 'number' && setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs transition-colors ${isEllipsis ? 'cursor-default' : cls}`}
                  >
                    {p}
                  </button>
                )
              })}
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onClose={closeEditModal} title="Edit User">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="user-fname" className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
              <Input id="user-fname" value={editForm.firstName} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="First name" className="h-9 text-sm" />
            </div>
            <div>
              <label htmlFor="user-lname" className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
              <Input id="user-lname" value={editForm.lastName} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Last name" className="h-9 text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="user-phone" className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
            <Input id="user-phone" value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="user-country" className="block text-xs font-medium text-slate-600 mb-1">Country</label>
            <Input id="user-country" value={editForm.country} onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))} placeholder="Nigeria" className="h-9 text-sm" />
          </div>
          <div>
            <label htmlFor="user-role" className="block text-xs font-medium text-slate-600 mb-1">Role</label>
            <Select
              id="user-role"
              value={editForm.role}
              onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as AdminUser['role'] }))}
            >
              <option value="student">Student</option>
              <option value="educator">Educator</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" className="rounded-lg" onClick={closeEditModal}>Cancel</Button>
            <Button
              size="sm"
              className="bg-[#D52B1E] hover:bg-[#B8241B] rounded-lg"
              disabled={updateMutation.isPending}
              onClick={() => {
                if (!editUser) return
                updateMutation.mutate({ id: editUser.id, dto: editForm }, { onSuccess: closeEditModal })
              }}
            >
              {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Dialog>
    </motion.div>
  )
}
