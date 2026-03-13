import { cn } from '@/lib/utils'

interface SkeletonProps {
  readonly className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse rounded-md bg-slate-100', className)} />
  )
}

/** A full table skeleton — rows x cols shimmer blocks */
export function TableSkeleton({ rows = 8, cols = 5 }: Readonly<{ rows?: number; cols?: number }>) {
  return (
    <table className="w-full text-sm">
      <thead className="bg-slate-50">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }).map((_, c) => (
              <td key={c} className="px-4 py-3">
                <Skeleton className={cn('h-4', c === 0 ? 'w-40' : 'w-24')} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Card grid skeleton */
export function CardGridSkeleton({ count = 4 }: Readonly<{ count?: number }>) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
