import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Coins, Search, CheckCircle2, XCircle, AlertCircle, ChevronRight, Info, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
}

type CryptoStatus = 'compliant' | 'non-compliant' | 'debated'

interface CryptoAsset {
  symbol: string
  name: string
  category: string
  status: CryptoStatus
  notes: string
  scholars: string
}

const SAMPLE_CRYPTO: CryptoAsset[] = [
  {
    symbol: 'BTC', name: 'Bitcoin', category: 'Cryptocurrency', status: 'debated',
    notes: 'Majority of scholars consider Bitcoin permissible as a medium of exchange, but opinions differ on its speculative nature (gharar). Not backed by real assets.',
    scholars: 'Debated — Mufti Taqi Usmani: caution; some AAOIFI scholars: permissible',
  },
  {
    symbol: 'ETH', name: 'Ethereum', category: 'Smart Contract Platform', status: 'debated',
    notes: 'Utility value as a smart contract platform is recognized. Staking rewards require Shariah review — some consider them akin to interest (riba).',
    scholars: 'Debated — utility permissible; staking income contested',
  },
  {
    symbol: 'HBAR', name: 'Hedera Hashgraph', category: 'Enterprise Blockchain', status: 'compliant',
    notes: 'Enterprise-grade distributed ledger with clear utility. Governance Council of major companies. Generally considered Shariah-permissible for its utility use-case.',
    scholars: 'Generally permissible — Ziyaad Mahomed (HSBC Amanah)',
  },
  {
    symbol: 'XRP', name: 'XRP (Ripple)', category: 'Payments', status: 'compliant',
    notes: 'Designed for cross-border payments and remittances. No mining, low energy use. Considered Shariah-compatible by several scholars given its utility.',
    scholars: 'Generally permissible — used in Islamic fintech infrastructure',
  },
  {
    symbol: 'USDT', name: 'Tether (USDT)', category: 'Stablecoin', status: 'debated',
    notes: 'Fiat-backed stablecoin. Some scholars consider stablecoins as electronic money (permissible); others raise concerns around reserve transparency and interest earned on holdings.',
    scholars: 'Debated — Shariah review required per jurisdiction',
  },
  {
    symbol: 'SHIB', name: 'Shiba Inu', category: 'Meme Token', status: 'non-compliant',
    notes: 'Meme coin with no underlying utility or real asset backing. Considered highly speculative (maysir/gharar). No productive economic activity.',
    scholars: 'Generally non-permissible — excessive speculation (maysir)',
  },
  {
    symbol: 'DOGE', name: 'Dogecoin', category: 'Meme Token', status: 'non-compliant',
    notes: 'Originally a joke cryptocurrency — highly speculative with no intrinsic value or utility. Fails Shariah screens on gharar (uncertainty) and maysir (gambling).',
    scholars: 'Non-permissible — no economic substance',
  },
  {
    symbol: 'GOLD-T', name: 'PAX Gold (PAXG)', category: 'Gold-Backed Token', status: 'compliant',
    notes: 'Each PAXG token represents one fine troy ounce of gold stored in Brink\'s vaults. Asset-backed, tangible value. Generally considered Shariah-compliant.',
    scholars: 'Permissible — gold is a recognized Islamic store of value',
  },
]

const STATUS_CONFIG: Record<CryptoStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  compliant: { label: 'Generally Permissible', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  debated: { label: 'Scholarly Debate', icon: AlertCircle, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'non-compliant': { label: 'Not Permissible', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
}

export default function HalalCryptoScreening() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | CryptoStatus>('all')

  const results = useMemo(() => {
    const q = query.toLowerCase()
    return SAMPLE_CRYPTO.filter((c) => {
      const matchesQuery = !q || c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      const matchesFilter = filter === 'all' || c.status === filter
      return matchesQuery && matchesFilter
    })
  }, [query, filter])

  const counts = {
    all: SAMPLE_CRYPTO.length,
    compliant: SAMPLE_CRYPTO.filter((c) => c.status === 'compliant').length,
    debated: SAMPLE_CRYPTO.filter((c) => c.status === 'debated').length,
    'non-compliant': SAMPLE_CRYPTO.filter((c) => c.status === 'non-compliant').length,
  }

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <Coins className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#000000]">Halal Crypto Screening</h1>
              <span className="text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                Beta
              </span>
            </div>
            <p className="text-sm text-[#737692]">Shariah rulings and scholar opinions on digital assets</p>
          </div>
        </div>
      </motion.div>

      {/* Coming soon notice */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-900">
          <Clock className="h-4 w-4 shrink-0 mt-0.5 text-purple-600" />
          <div>
            <strong>Live data integration coming soon.</strong> This tool currently shows a curated reference of common digital assets and known scholarly opinions. Real-time market data, token metrics, and automated Shariah screening are under development.
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <div>
            Cryptocurrency rulings in Islamic finance are <strong>actively evolving</strong>. Scholar opinions vary significantly. Always consult a qualified Islamic scholar or certified Shariah advisor before investing in digital assets.
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {[
          { label: 'Generally Permissible', count: counts.compliant, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
          { label: 'Scholarly Debate', count: counts.debated, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Not Permissible', count: counts['non-compliant'], color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-3 text-center ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-[#737692] mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by symbol, name or category…"
            className="pl-9 h-10 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'compliant', 'debated', 'non-compliant'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                filter === f ? 'bg-[#D52B1E] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
              <span className="ml-1.5 opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <motion.div variants={itemVariants} className="space-y-3">
        {results.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Search className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">No assets found</p>
            <p className="text-xs text-gray-400">Try a different symbol or name</p>
          </div>
        ) : (
          results.map((asset, idx) => {
            const cfg = STATUS_CONFIG[asset.status]
            const StatusIcon = cfg.icon
            return (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#000000] text-base">{asset.symbol}</span>
                      <span className="text-sm text-[#737692]">{asset.name}</span>
                      <span className="text-[10px] font-medium bg-white/70 border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                        {asset.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#737692] mb-1.5">{asset.notes}</p>
                    <p className="text-[11px] text-purple-700 font-medium">
                      📚 {asset.scholars}
                    </p>
                  </div>
                  <div className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {cfg.label}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </motion.div>

      {/* Learn more */}
      <motion.div variants={itemVariants}>
        <a
          href="/resources?tab=tools-practical"
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#D52B1E]/30 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-sm font-semibold text-[#000000]">Halal Crypto Screener Resource</p>
            <p className="text-xs text-[#737692]">View the full Halal Crypto Screener tool in Resources</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#D52B1E] group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </motion.div>
  )
}
