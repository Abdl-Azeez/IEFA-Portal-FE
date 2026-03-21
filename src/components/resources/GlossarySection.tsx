import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { GlossaryTerm } from '@/types/resources'

interface GlossarySectionProps {
  readonly terms?: GlossaryTerm[]
}

export function GlossarySection({ terms }: GlossarySectionProps) {
  const [search, setSearch] = useState('')
  const glossaryData = terms ?? []

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
          <p className="text-sm">
            {search ? `No terms found matching "${search}"` : 'No glossary terms available.'}
          </p>
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
