import type { LucideIcon } from 'lucide-react'
import { FileX2 } from 'lucide-react'

interface EmptyStateProps {
  readonly icon?: LucideIcon
  readonly title?: string
  readonly description?: string
}

export function EmptyState({
  icon: Icon = FileX2,
  title = 'Nothing here yet',
  description = 'Try adjusting your search or filters.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
    </div>
  )
}
