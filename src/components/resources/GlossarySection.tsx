import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { GlossaryTerm } from '@/types/resources'

/* Sample glossary data – replace with API data when ready */
const GLOSSARY_DATA: GlossaryTerm[] = [
  { id: '1', term: 'Murabaha', definition: 'A cost-plus financing structure where the seller discloses the cost and profit margin to the buyer. The bank purchases the asset and sells it to the customer at a pre-agreed profit margin, payable in installments.' },
  { id: '2', term: 'Sukuk', definition: 'Islamic financial certificates, similar to bonds in conventional finance, that comply with Shariah law. Sukuk represent proportional ownership in an underlying asset and provide returns through profit-sharing rather than interest.' },
  { id: '3', term: 'Ijarah', definition: 'An Islamic leasing arrangement where the lessor (bank) purchases and leases an asset to the lessee for a specific period at an agreed rental fee. Ownership remains with the lessor during the lease period.' },
  { id: '4', term: 'Takaful', definition: 'Islamic insurance based on the principle of mutual cooperation. Participants contribute to a pool of funds, which is used to support members in times of need. The concept is rooted in shared responsibility and solidarity.' },
  { id: '5', term: 'Musharakah', definition: 'A joint venture or partnership in Islamic finance where all partners contribute capital and share profits and losses according to pre-agreed ratios. It represents equity participation in a business.' },
  { id: '6', term: 'Mudarabah', definition: 'A profit-sharing partnership where one party provides capital (Rabb al-Mal) and the other provides management expertise (Mudarib). Profits are shared based on a pre-agreed ratio, while losses are borne by the capital provider.' },
  { id: '7', term: 'Riba', definition: 'The Arabic term for interest or usury, which is prohibited in Islamic finance. Riba refers to any unjustified increase in capital, whether in loans or sales transactions, beyond the principal amount.' },
  { id: '8', term: 'Gharar', definition: 'Excessive uncertainty or ambiguity in contractual terms and conditions. Islamic finance prohibits transactions involving gharar to ensure fairness and transparency between contracting parties.' },
  { id: '9', term: 'Shariah', definition: 'Islamic law derived from the Quran and Sunnah (teachings of Prophet Muhammad). In finance, Shariah compliance ensures that transactions adhere to ethical and legal principles of Islam.' },
  { id: '10', term: 'Wakala', definition: 'An agency contract where one party (principal) appoints another (agent) to perform a specific task on their behalf. Commonly used in Islamic banking for investment management.' },
  { id: '11', term: 'Istisna', definition: 'A manufacturing or construction contract where the buyer orders an item to be manufactured or built according to agreed specifications, price, and delivery date. Payment can be made in advance, in installments, or upon delivery.' },
  { id: '12', term: 'Salam', definition: 'A forward sale contract where payment is made in advance for goods to be delivered at a future date. The price, quantity, quality, and date of delivery must be specified at the time of the contract.' },
  { id: '13', term: 'Qard Hasan', definition: 'A benevolent or interest-free loan in Islamic finance. The borrower is only required to repay the principal amount, though they may voluntarily pay more as a gesture of gratitude.' },
  { id: '14', term: 'Zakat', definition: 'An obligatory form of charity in Islam, calculated as 2.5% of a Muslim\'s total savings and wealth above a minimum threshold (nisab). It is one of the five pillars of Islam and serves as a means of wealth redistribution.' },
  { id: '15', term: 'Waqf', definition: 'An Islamic endowment of property or assets for charitable purposes. Once designated as waqf, the asset cannot be sold, inherited, or donated, and its benefits are directed to the specified beneficiaries or cause.' },
  { id: '16', term: 'Halal', definition: 'Permissible or lawful under Islamic law. In finance, halal investments and transactions are those that comply with Shariah principles, avoiding prohibited activities such as interest, gambling, and unethical industries.' },
  { id: '17', term: 'Haram', definition: 'Forbidden or unlawful under Islamic law. In finance, haram activities include charging or paying interest (riba), gambling (maysir), and investing in prohibited industries such as alcohol, tobacco, or weaponry.' },
  { id: '18', term: 'Maysir', definition: 'Gambling or speculation that is prohibited in Islamic finance. Transactions that involve excessive uncertainty or speculation, where one party gains at the expense of another through chance, are considered maysir.' },
  { id: '19', term: 'Fatwa', definition: 'A formal ruling or interpretation on Islamic law issued by a qualified Islamic scholar or Shariah board. In Islamic finance, fatwas provide guidance on whether specific products or transactions comply with Shariah principles.' },
  { id: '20', term: 'AAOIFI', definition: 'The Accounting and Auditing Organization for Islamic Financial Institutions. An international body that sets Shariah standards, accounting, auditing, and governance standards for the Islamic finance industry.' },
].map((term) => ({ ...term, status: 'published' as const, createdAt: '' }))

interface GlossarySectionProps {
  readonly terms?: GlossaryTerm[]
}

export function GlossarySection({ terms }: GlossarySectionProps) {
  const [search, setSearch] = useState('')
  const glossaryData = terms && terms.length > 0 ? terms : GLOSSARY_DATA

  const filteredTerms = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return glossaryData
    return glossaryData.filter(
      t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    )
  }, [search, glossaryData])

  // Group terms by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>()
    for (const term of filteredTerms) {
      const letter = term.term[0].toUpperCase()
      const existing = map.get(letter)
      if (existing) {
        existing.push(term)
      } else {
        map.set(letter, [term])
      }
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredTerms])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const availableLetters = new Set(grouped.map(([letter]) => letter))

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737692]" />
        <Input
          placeholder="Search terms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Alphabet bar */}
      <div className="flex flex-wrap gap-1.5">
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => {
              if (!availableLetters.has(letter)) return
              document.getElementById(`glossary-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
              availableLetters.has(letter)
                ? 'bg-[#D52B1E]/10 text-[#D52B1E] hover:bg-[#D52B1E] hover:text-white cursor-pointer'
                : 'bg-gray-50 text-gray-300 cursor-default'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Terms */}
      {grouped.length === 0 ? (
        <div className="py-12 text-center text-[#737692]">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No terms found matching "{search}"</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([letter, terms]) => (
            <div key={letter} id={`glossary-${letter}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-[#D52B1E] text-white flex items-center justify-center font-bold text-lg">
                  {letter}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="space-y-3">
                {terms.map((term, i) => (
                  <motion.div
                    key={term.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-semibold text-[#000000] text-base mb-1">{term.term}</h4>
                    <p className="text-sm text-[#737692] leading-relaxed">{term.definition}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
