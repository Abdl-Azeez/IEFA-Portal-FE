import { Skeleton } from '@/components/ui/skeleton'

/**
 * A generic page-shaped skeleton rendered behind the GuestOverlay
 * for unauthenticated visitors. It closely mimics the visual rhythm
 * of real content pages without making any API calls, so removing
 * the overlay in devtools only reveals empty placeholders.
 */
export function GuestPageSkeleton() {
  return (
    <div className="w-full min-h-screen bg-white select-none p-6 space-y-8">
      {/* Page title + action bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl flex-shrink-0" />
      </div>

      {/* Filter / search bar */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-hidden">
        {[80, 100, 72, 120, 88, 96, 64].map((w, i) => (
          <div
            key={i}
            className="h-8 rounded-full flex-shrink-0 animate-pulse bg-slate-100"
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden bg-white space-y-3 p-5">
            <div className="flex gap-3 items-start">
              <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/6" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
