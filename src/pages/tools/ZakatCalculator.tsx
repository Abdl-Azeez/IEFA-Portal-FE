import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, ChevronRight, Info, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
}

// Nisab threshold (approximate, in USD – should come from live gold price in production)
const NISAB_USD = 5950 // ~85g gold at ~$70/g

interface AssetField {
  id: string
  label: string
  description: string
  value: string
}

const INITIAL_ASSETS: AssetField[] = [
  { id: 'cash', label: 'Cash & Bank Savings', description: 'Total cash in hand and bank accounts', value: '' },
  { id: 'gold', label: 'Gold & Silver (USD value)', description: 'Current market value of gold and silver owned', value: '' },
  { id: 'investments', label: 'Investments & Stocks', description: 'Current market value of halal investments and shares', value: '' },
  { id: 'businessAssets', label: 'Business Assets', description: 'Trading stock, receivables, and liquid business assets', value: '' },
  { id: 'rentalIncome', label: 'Rental Income Savings', description: 'Saved rental income not yet spent', value: '' },
  { id: 'other', label: 'Other Liquid Assets', description: 'Any other zakatable assets (e.g. pension, crypto)', value: '' },
]

const INITIAL_DEDUCTIONS: AssetField[] = [
  { id: 'debts', label: 'Outstanding Debts', description: 'Debts and loans due within the year', value: '' },
  { id: 'expenses', label: 'Immediate Expenses', description: 'Bills and expenses due within 30 days', value: '' },
]

export default function ZakatCalculator() {
  const [assets, setAssets] = useState<AssetField[]>(INITIAL_ASSETS)
  const [deductions, setDeductions] = useState<AssetField[]>(INITIAL_DEDUCTIONS)
  const [calculated, setCalculated] = useState(false)

  const updateField = (
    list: AssetField[],
    setList: (v: AssetField[]) => void,
    id: string,
    value: string,
  ) => {
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) return
    setList(list.map((f) => (f.id === id ? { ...f, value } : f)))
    setCalculated(false)
  }

  const totalAssets = assets.reduce((s, f) => s + (parseFloat(f.value) || 0), 0)
  const totalDeductions = deductions.reduce((s, f) => s + (parseFloat(f.value) || 0), 0)
  const netWorth = Math.max(0, totalAssets - totalDeductions)
  const isAboveNisab = netWorth >= NISAB_USD
  const zakatDue = isAboveNisab ? netWorth * 0.025 : 0

  const reset = () => {
    setAssets(INITIAL_ASSETS)
    setDeductions(INITIAL_DEDUCTIONS)
    setCalculated(false)
  }

  return (
    <motion.div
      className="space-y-6 max-w-3xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <Calculator className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#000000]">Zakat Calculator</h1>
            <p className="text-sm text-[#737692]">Calculate your annual Zakat obligation accurately</p>
          </div>
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div variants={itemVariants}>
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <strong>How it works:</strong> Zakat is 2.5% of your total net zakatable wealth if it exceeds the Nisab threshold (approx. ${NISAB_USD.toLocaleString()} USD — equivalent to 85g of gold) and has been held for one lunar year.
          </div>
        </div>
      </motion.div>

      {/* Assets */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#000000]">Zakatable Assets</CardTitle>
            <CardDescription className="text-[#737692]">Enter the current value of each asset in USD</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assets.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-[#000000] mb-0.5">{field.label}</label>
                <p className="text-xs text-[#737692] mb-1">{field.description}</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(e) => updateField(assets, setAssets, field.id, e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 h-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 text-[#000000]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Deductions */}
      <motion.div variants={itemVariants}>
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-[#000000]">Deductions</CardTitle>
            <CardDescription className="text-[#737692]">Subtract debts and immediate financial obligations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {deductions.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-[#000000] mb-0.5">{field.label}</label>
                <p className="text-xs text-[#737692] mb-1">{field.description}</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(e) => updateField(deductions, setDeductions, field.id, e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-4 h-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 text-[#000000]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <button
          onClick={() => setCalculated(true)}
          className="flex-1 flex items-center justify-center gap-2 h-11 bg-[#D52B1E] hover:bg-[#B8241B] text-white font-semibold rounded-xl transition-colors text-sm"
        >
          <Calculator className="h-4 w-4" />
          Calculate Zakat
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 px-4 h-11 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          <RefreshCw className="h-4 w-4" />
          Reset
        </button>
      </motion.div>

      {/* Results */}
      {calculated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`border-2 ${isAboveNisab ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50'}`}>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-[#737692] mb-1">Total Assets</p>
                  <p className="text-lg font-bold text-[#000000]">${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-[#737692] mb-1">Deductions</p>
                  <p className="text-lg font-bold text-red-600">−${totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-[#737692] mb-1">Net Wealth</p>
                  <p className="text-lg font-bold text-[#000000]">${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className={`rounded-xl p-5 text-center ${isAboveNisab ? 'bg-emerald-600' : 'bg-gray-400'}`}>
                <p className="text-white/80 text-sm mb-1">
                  {isAboveNisab
                    ? `Your net wealth exceeds the Nisab (${NISAB_USD.toLocaleString()} USD)`
                    : `Your net wealth is below the Nisab threshold — no Zakat is due.`}
                </p>
                {isAboveNisab && (
                  <>
                    <p className="text-white text-3xl font-bold">
                      ${zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-white/70 text-xs mt-1">Zakat Due (2.5%)</p>
                  </>
                )}
              </div>

              <p className="text-xs text-[#737692] text-center">
                This is an estimate. Consult a qualified Islamic scholar or financial advisor for precise Zakat rulings applicable to your situation.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Learn more */}
      <motion.div variants={itemVariants}>
        <a
          href="/resources?tab=educational"
          className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#D52B1E]/30 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-sm font-semibold text-[#000000]">Learn more about Zakat</p>
            <p className="text-xs text-[#737692]">Browse educational resources on Zakat rules and calculations</p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#D52B1E] group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </motion.div>
  )
}
