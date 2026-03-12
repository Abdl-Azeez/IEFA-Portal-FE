import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { adminLogin } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Both fields are required'); return }
    setLoading(true)
    try {
      await adminLogin(email, password)
      navigate('/admin')
    } catch {
      setError('Invalid credentials. Use admin@iefa.org / Admin@2026!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #D52B1E 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="h-16 w-16 rounded-2xl bg-[#D52B1E] flex items-center justify-center shadow-lg mb-4"
            >
              <ShieldCheck className="h-8 w-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-1">IEFA Management System</p>
          </div>

          {/* Hint box */}
          <div className="mb-6 bg-[#D52B1E]/10 border border-[#D52B1E]/25 rounded-xl p-3.5">
            <p className="text-xs text-slate-300 font-medium mb-1">Demo Admin Credentials</p>
            <p className="text-xs text-slate-400">
              Email: <span className="text-white font-mono">admin@iefa.org</span>
            </p>
            <p className="text-xs text-slate-400">
              Password: <span className="text-white font-mono">Admin@2026!</span>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-3 text-red-400 text-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="admin@iefa.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/8 border-white/15 text-white placeholder:text-slate-500 focus:border-[#D52B1E]/60 focus:ring-[#D52B1E]/20 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/8 border-white/15 text-white placeholder:text-slate-500 focus:border-[#D52B1E]/60 focus:ring-[#D52B1E]/20 rounded-xl h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#D52B1E] hover:bg-[#B8241B] text-white font-semibold rounded-xl mt-2 transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="block h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  {'Signing in…'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Sign In to Admin
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Not an admin?{' '}
            <a href="/login" className="text-slate-300 hover:text-white transition-colors underline">
              Go to User Portal
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
