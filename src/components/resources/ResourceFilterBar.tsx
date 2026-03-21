import { useState } from 'react'
import { Search, SlidersHorizontal, X, Calendar, Tag } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const SORT_LABELS: Record<string, string> = {
  date: 'Date',
  views: 'Most Viewed',
  downloads: 'Most Downloaded',
}

interface ResourceFilterBarProps {
  readonly search: string
  readonly onSearchChange: (value: string) => void
  readonly sortBy: 'date' | 'views' | 'downloads'
  readonly onSortChange: (value: 'date' | 'views' | 'downloads') => void
  readonly selectedCategory: string
  readonly onCategoryChange: (value: string) => void
  readonly categories: Array<{ id: string; name: string }>
}

export function ResourceFilterBar({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  selectedCategory,
  onCategoryChange,
  categories,
}: ResourceFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <div className="space-y-3">
      {/* Search + Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#737692]" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters
            ? 'bg-[#D52B1E] hover:bg-[#B82318] text-white h-12'
            : 'border-gray-200 text-[#737692] hover:border-[#D52B1E] hover:text-[#D52B1E] h-12'
          }
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
          {/* Sort By */}
          <div>
            <p className="text-xs font-semibold text-[#737692] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" />
              Sort By
            </p>
            <div className="flex flex-wrap gap-2">
              {(['date', 'views', 'downloads'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => onSortChange(option)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === option
                      ? 'bg-[#D52B1E] text-white'
                      : 'bg-gray-50 text-[#737692] hover:bg-[#FFEFEF] hover:text-[#D52B1E]'
                  }`}
                >
                  {SORT_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#737692] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onCategoryChange('')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory
                      ? 'bg-gray-50 text-[#737692] hover:bg-[#FFEFEF] hover:text-[#D52B1E]'
                      : 'bg-[#D52B1E] text-white'
                  }`}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#D52B1E] text-white'
                        : 'bg-gray-50 text-[#737692] hover:bg-[#FFEFEF] hover:text-[#D52B1E]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(selectedCategory || search) && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
              <span className="text-xs text-[#737692]">Active:</span>
              {search && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Search className="h-2.5 w-2.5" />
                  "{search}"
                  <button onClick={() => onSearchChange('')}><X className="h-2.5 w-2.5" /></button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="outline" className="gap-1 text-xs border-[#D52B1E]/20 text-[#D52B1E]">
                  {categories.find((cat) => cat.id === selectedCategory)?.name ?? selectedCategory}
                  <button onClick={() => onCategoryChange('')}><X className="h-2.5 w-2.5" /></button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
