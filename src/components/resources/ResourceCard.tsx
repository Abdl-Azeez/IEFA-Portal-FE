import { motion } from 'framer-motion'
import { Eye, Download, Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ResourceItem } from '@/types/resources'

interface ResourceCardProps {
  readonly resource: ResourceItem
  readonly onPreview: (resource: ResourceItem) => void
  readonly onDownload: (resource: ResourceItem) => void
  readonly index?: number
}

export function ResourceCard({ resource, onPreview, onDownload, index = 0 }: ResourceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Cover Image */}
      <div className="relative h-44 bg-gradient-to-br from-[#D52B1E]/10 via-[#D52B1E]/5 to-gray-50 overflow-hidden">
        {resource.displayImage ? (
          <img
            src={resource.displayImage}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/80 shadow-sm flex items-center justify-center">
              <User className="h-8 w-8 text-[#D52B1E]/60" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-[#D52B1E] text-white text-xs shadow-md">
            {resource.topic}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-[#D52B1E]/10 flex items-center justify-center">
            <User className="h-3 w-3 text-[#D52B1E]" />
          </div>
          <span className="text-xs font-medium text-[#737692]">{resource.authorName}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#000000] text-sm leading-snug mb-1 line-clamp-2 group-hover:text-[#D52B1E] transition-colors">
          {resource.title}
        </h3>

        {/* Brief Intro */}
        <p className="text-xs text-[#737692] line-clamp-2 mb-3 flex-1">
          {resource.briefIntro}
        </p>

        {/* Date & Stats */}
        <div className="flex items-center justify-between text-xs text-[#737692] mb-3 border-t border-gray-50 pt-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {resource.datePublished}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {resource.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {resource.downloadCount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(resource)}
            className="flex-1 text-xs border-[#D52B1E]/30 text-[#D52B1E] hover:bg-[#FFEFEF]"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={() => onDownload(resource)}
            className="flex-1 text-xs bg-[#D52B1E] hover:bg-[#B82318] text-white"
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
