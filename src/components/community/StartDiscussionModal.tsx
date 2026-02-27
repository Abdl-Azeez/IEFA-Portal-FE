import { motion } from 'framer-motion'
import { X, Paperclip, AtSign, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import type { CommunityCategory, Attachment } from '@/types/community'

const CATEGORIES: CommunityCategory[] = [
  'Markets & Investing',
  'Savings',
  'Zakat',
  'Every day islamic finance',
  'General Discussion',
  'Q&A',
  'Resources'
]

const COMMUNITY_GUIDELINES = [
  'Be respectful and constructive in your discussions',
  'Avoid spam, harassment, or abusive language',
  'Do not share personal information of others',
  'Keep discussions relevant to Islamic Finance',
  'Fact-check before sharing information',
  'No promotion of unlicensed financial products',
  'Respect others\' opinions and beliefs',
  'Report inappropriate content to moderators'
]

interface StartDiscussionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    content: string
    category: CommunityCategory
    attachments: Attachment[]
    mentions: string[]
  }) => void
}

export default function StartDiscussionModal({ isOpen, onClose, onSubmit }: StartDiscussionModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<CommunityCategory>('General Discussion')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [selectedFont, setSelectedFont] = useState('normal')
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false)

  if (!isOpen) return null

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      Array.from(files).forEach(file => {
        const attachment: Attachment = {
          id: `file-${Date.now()}-${Math.random()}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file)
        }
        setAttachments(prev => [...prev, attachment])
      })
    }
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (!agreedToGuidelines) {
      alert('Please agree to community guidelines')
      return
    }

    onSubmit({
      title,
      content,
      category,
      attachments,
      mentions
    })

    // Reset form
    setTitle('')
    setContent('')
    setCategory('General Discussion')
    setAttachments([])
    setMentions([])
    setAgreedToGuidelines(false)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card className="bg-white shadow-xl">
          {/* Header */}
          <CardHeader className="pb-4 border-b sticky top-0 bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Start a Discussion</CardTitle>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="p-6 space-y-6">
              {/* Community Guidelines Alert */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Community Guidelines</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  {COMMUNITY_GUIDELINES.map((guideline, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex-shrink-0">•</span>
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Guidelines Agreement */}
              <label className="flex items-start gap-3 cursor-pointer bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={agreedToGuidelines}
                  onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                  required
                />
                <span className="text-sm text-[#000000]">
                  I agree to follow the community guidelines and understand that violating them may result in post removal or account restrictions.
                </span>
              </label>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">
                  Discussion Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a clear and descriptive title..."
                  maxLength={100}
                  required
                  className="border-gray-200"
                />
                <p className="text-xs text-[#737692] mt-1">{title.length}/100 characters</p>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] text-[#000000] bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">
                  Write-up / Subject *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts, questions, or insights here. You can mention other users with @username"
                  maxLength={5000}
                  required
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] resize-vertical min-h-[200px] text-[#000000] placeholder-gray-400 ${
                    selectedFont === 'bold' ? 'font-bold' :
                    selectedFont === 'italic' ? 'italic' :
                    selectedFont === 'monospace' ? 'font-mono' : ''
                  }`}
                />
                <p className="text-xs text-[#737692] mt-1">{content.length}/5000 characters</p>
              </div>

              {/* Rich Text Tools */}
              <div className="flex gap-2 flex-wrap">
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Font Style</label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] text-sm bg-white text-[#000000]"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="italic">Italic</option>
                    <option value="monospace">Code</option>
                  </select>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">
                  Attachments
                </label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg p-6 cursor-pointer hover:border-[#D52B1E] hover:bg-red-50 transition-all">
                  <Paperclip className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-[#737692]">Click to attach images or files (max 5 files)</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileAttach}
                    className="hidden"
                    disabled={attachments.length >= 5}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>

                {/* Attached Files List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-[#000000]">
                          {att.type === 'image' ? '🖼️' : '📎'} {att.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mentions Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2 items-start">
                  <AtSign className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Tag Others</p>
                    <p className="text-xs text-blue-800">Use @username to mention someone. They'll receive an email and notification.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || !agreedToGuidelines}
                  className="flex-1 bg-[#D52B1E] hover:bg-[#B8241B] text-white disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publish Discussion
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
