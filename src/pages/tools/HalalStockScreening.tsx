import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Search, CheckCircle2, XCircle, AlertCircle, ChevronRight, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
}

type ComplianceStatus = 'compliant' | 'non-compliant' | 'watchlist'

interface Stock {
  symbol: string
  company: string
  sector: string
  country: string
  status: ComplianceStatus
  debtRatio: number    // debt / total assets %
  revenueScreen: number // non-halal revenue %
  notes: string
  standard: string
}

const SAMPLE_STOCKS: Stock[] = [
  { symbol: 'MSFT', company: 'Microsoft Corporation', sector: 'Technology', country: 'USA', status: 'compliant', debtRatio: 18, revenueScreen: 0.2, notes: 'Passes AAOIFI screening. Minimal interest-based income.', standard: 'AAOIFI' },
  { symbol: 'AAPL', company: 'Apple Inc.', sector: 'Technology', country: 'USA', status: 'compliant', debtRatio: 22, revenueScreen: 0.5, notes: 'Passes MSCI Islamic index criteria. Low haram revenue exposure.', standard: 'MSCI' },
  { symbol: 'DANGCEM', company: 'Dangote Cement Plc', sector: 'Materials', country: 'Nigeria', status: 'compliant', debtRatio: 12, revenueScreen: 0, notes: 'NGX-listed. No prohibited business activities. Low leverage.', standard: 'AAOIFI' },
  { symbol: 'JAIZ', company: 'Jaiz Bank Plc', sector: 'Islamic Banking', country: 'Nigeria', status: 'compliant', debtRatio: 8, revenueScreen: 0, notes: 'Fully Shariah-compliant Nigerian non-interest bank.', standard: 'CBN/AAOIFI' },
  { symbol: 'GOOGL', company: 'Alphabet Inc.', sector: 'Technology', country: 'USA', status: 'watchlist', debtRatio: 6, revenueScreen: 3.2, notes: 'Generally compliant but advertising revenue requires review for non-halal content.', standard: 'MSCI' },
  { symbol: 'TSLA', company: 'Tesla Inc.', sector: 'Automotive', country: 'USA', status: 'compliant', debtRatio: 16, revenueScreen: 0.1, notes: 'Passes standard screens. EV-focused, minimal haram revenue.', standard: 'AAOIFI' },
  { symbol: 'BAC', company: 'Bank of America', sector: 'Finance', country: 'USA', status: 'non-compliant', debtRatio: 89, revenueScreen: 95, notes: 'Conventional bank with interest-based operations. Fails Shariah screening.', standard: 'AAOIFI' },
  { symbol: 'MO', company: 'Altria Group (Tobacco)', sector: 'Consumer Goods', country: 'USA', status: 'non-compliant', debtRatio: 72, revenueScreen: 100, notes: 'Tobacco producer — haram under all Shariah standards.', standard: 'AAOIFI' },
  { symbol: 'AMZN', company: 'Amazon.com Inc.', sector: 'E-Commerce', country: 'USA', status: 'watchlist', debtRatio: 35, revenueScreen: 4.1, notes: 'E-commerce core is generally compliant; AWS and media segments require review.', standard: 'MSCI' },
  { symbol: 'NESTLE', company: 'Nestlé Nigeria Plc', sector: 'Consumer Goods', country: 'Nigeria', status: 'compliant', debtRatio: 20, revenueScreen: 0.8, notes: 'Food & beverages. Predominantly halal-certified products. Low debt.', standard: 'CBN/AAOIFI' },
]

const STATUS_CONFIG: Record<ComplianceStatus, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  compliant: { label: 'Shariah Compliant', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  watchlist: { label: 'Watchlist', icon: AlertCircle, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  'non-compliant': { label: 'Non-Compliant', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
}

export default function HalalStockScreening() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | ComplianceStatus>('all')

  const results = useMemo(() => {
    const q = query.toLowerCase()
    return SAMPLE_STOCKS.filter((s) => {
      const matchesQuery = !q || s.symbol.toLowerCase().includes(q) || s.company.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q) || s.country.toLowerCase().includes(q)
      const matchesFilter = filter === 'all' || s.status === filter
      return matchesQuery && matchesFilter
    })
  }, [query, filter])

  const counts = {
    all: SAMPLE_STOCKS.length,
    compliant: SAMPLE_STOCKS.filter((s) => s.status === 'compliant').length,
    watchlist: SAMPLE_STOCKS.filter((s) => s.status === 'watchlist').length,
    'non-compliant': SAMPLE_STOCKS.filter((s) => s.status === 'non-compliant').length,
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
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#000000]">Halal Stock Screening</h1>
            <p className="text-sm text-[#737692]">Check equity Shariah-compliance using AAOIFI, MSCI and CBN standards</p>
          </div>
        </div>
      </motion.div>

      {/* Info */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
          <div>
            Screening applies <strong>AAOIFI Standard 21</strong> (business activity &amp; financial ratio tests): debt ≤ 33% of total assets, non-permissible revenue ≤ 5%. Data shown is illustrative — always verify with a certified Shariah advisor before investing.
          </div>
        </div>
      </motion.div>

      {/* Search + Filter */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ticker, company, sector or country…"
            className="pl-9 h-10 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'compliant', 'watchlist', 'non-compliant'] as const).map((f) => (
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
            <p className="text-sm font-medium text-gray-600">No stocks found</p>
            <p className="text-xs text-gray-400">Try a different ticker or company name</p>
          </div>
        ) : (
          results.map((stock, idx) => {
            const cfg = STATUS_CONFIG[stock.status]
            const StatusIcon = cfg.icon
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-[#000000] text-base">{stock.symbol}</span>
                      <span className="text-sm text-[#737692] truncate">{stock.company}</span>
                      <span className="text-[10px] font-medium bg-white/70 border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">
                        {stock.country}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[#737692] mb-2">
                      <span>Sector: <strong className="text-[#000000]">{stock.sector}</strong></span>
                      <span>Debt Ratio: <strong className={stock.debtRatio > 33 ? 'text-red-600' : 'text-emerald-600'}>{stock.debtRatio}%</strong></span>
                      <span>Non-halal Revenue: <strong className={stock.revenueScreen > 5 ? 'text-red-600' : 'text-emerald-600'}>{stock.revenueScreen}%</strong></span>
                      <span>Standard: <strong className="text-[#000000]">{stock.standard}</strong></span>
                    </div>
                    <p className="text-xs text-[#737692]">{stock.notes}</p>
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

      {/* Disclaimer + learn more */}
      <motion.div variants={itemVariants} className="space-y-3">
        <p className="text-xs text-[#737692] text-center">
          Screening results are indicative and based on sample data. Consult a qualified Shariah advisor before making investment decisions.
        </p>
        <a
          href="/resources?tab=standards"
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#D52B1E]/30 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-sm font-semibold text-[#000000]">Browse Shariah Standards & Governance</p>
            <p className="text-xs text-[#737692]">AAOIFI, IFSB and other regulatory framework documents</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#D52B1E] group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </motion.div>
  )
}
