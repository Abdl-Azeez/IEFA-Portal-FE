import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Calendar, Eye, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DownloadEmailModal } from '@/components/resources/DownloadEmailModal'
import type { ResourceItem } from '@/types/resources'

interface ResourcePreviewPageProps {
  readonly resource: ResourceItem
  readonly onBack: () => void
}

export function ResourcePreviewPage({ resource, onBack }: ResourcePreviewPageProps) {
  const [downloadOpen, setDownloadOpen] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-[#737692] hover:text-[#000000]"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Resource Header Card – Book-cover layout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Cover Image (left side, like a book cover) */}
          <div className="relative md:w-72 lg:w-80 shrink-0 h-56 md:h-auto bg-gradient-to-br from-[#D52B1E]/10 via-[#D52B1E]/5 to-gray-50">
            {resource.coverImageUrl ? (
              <img
                src={resource.coverImageUrl}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[14rem]">
                <div className="w-16 h-16 rounded-full bg-white/80 shadow-sm flex items-center justify-center">
                  <User className="h-8 w-8 text-[#D52B1E]/60" />
                </div>
              </div>
            )}
          </div>

          {/* Abstract / Details (right side) */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#D52B1E] text-white">{resource.topic ?? 'Resource'}</Badge>
              {resource.category && (
                <Badge variant="outline" className="border-[#D52B1E]/20 text-[#D52B1E]">
                  {resource.category.name}
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold text-[#000000] leading-snug">{resource.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#737692]">
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {resource.authorName ?? 'Unknown author'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(resource.publishedAt ?? resource.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {resource.viewCount} views
              </span>
              <span className="flex items-center gap-1.5">
                <Download className="h-4 w-4" />
                {resource.downloadCount} downloads
              </span>
            </div>

            <p className="text-[#737692] leading-relaxed">{resource.briefIntro ?? 'No summary available.'}</p>

            <Button
              onClick={() => setDownloadOpen(true)}
              className="bg-[#D52B1E] hover:bg-[#B82318] text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Full Document
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-[#000000] mb-4 pb-3 border-b border-gray-100">
          Preview
        </h2>
        {resource.previewUrl ? (
          <div className="space-y-3">
            <iframe
              title="Resource preview"
              src={resource.previewUrl}
              className="w-full h-[480px] rounded-xl border border-gray-100"
            />
            <a
              href={resource.previewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-[#D52B1E] hover:text-[#B82318]"
            >
              Open preview in a new tab
            </a>
          </div>
        ) : (
          <div className="py-12 text-center text-[#737692]">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Preview content is not available for this resource.</p>
            <p className="text-xs mt-1">Click the download button to receive the full document.</p>
          </div>
        )}
      </div>

      <DownloadEmailModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        resourceTitle={resource.title}
      />
    </motion.div>
  )
}
