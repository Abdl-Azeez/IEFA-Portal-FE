import { motion } from 'framer-motion'
import { X, Paperclip, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useEffect, useRef, useState } from 'react'
import { toast } from '@/hooks/use-toast'
import type { Attachment } from '@/types/community'
import api from '@/lib/api'
import { useUserSearch, useMe, type UserSearchResult } from '@/hooks/useAuth'

interface UploadingAttachment extends Attachment {
  uploadStatus: 'uploading' | 'uploaded' | 'error'
}

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
  categories?: Array<{ id: string; name: string }>
  groups?: Array<{ id: string; name: string }>
  categoriesLoading?: boolean
  groupsLoading?: boolean
  onSubmit: (data: {
    title: string
    content: string
    categoryId: string
    groupId?: string
    attachments: Attachment[]
    attachmentUrls: string[]
    mentions: string[]
  }) => void | Promise<void>
}

export default function StartDiscussionModal({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  groups = [],
  categoriesLoading = false,
  groupsLoading = false,
}: StartDiscussionModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [groupId, setGroupId] = useState<string>('')
  const [attachments, setAttachments] = useState<UploadingAttachment[]>([])
  const [mentions, setMentions] = useState<string[]>([])
  const [selectedFont, setSelectedFont] = useState('normal')
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState(-1)
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0)
  const [debouncedMentionQuery, setDebouncedMentionQuery] = useState<string>('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const mentionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data: mentionResults = [], isLoading: mentionLoading } = useUserSearch(debouncedMentionQuery)
  const { data: currentUser } = useMe()

  // Debounce: update the query that triggers the API call 300 ms after typing stops
  useEffect(() => {
    if (mentionDebounceRef.current) clearTimeout(mentionDebounceRef.current)
    if (mentionQuery !== null && mentionQuery.length >= 1) {
      mentionDebounceRef.current = setTimeout(() => setDebouncedMentionQuery(mentionQuery), 300)
    } else {
      setDebouncedMentionQuery('')
    }
    return () => {
      if (mentionDebounceRef.current) clearTimeout(mentionDebounceRef.current)
    }
  }, [mentionQuery])

  // Close dropdown whenever the modal itself is closed
  useEffect(() => {
    if (!isOpen) {
      setMentionQuery(null)
      setMentionStart(-1)
      setDebouncedMentionQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id)
    }
  }, [categories, categoryId])

  const closeMention = () => {
    setMentionQuery(null)
    setMentionStart(-1)
    setDebouncedMentionQuery('')
    if (mentionDebounceRef.current) clearTimeout(mentionDebounceRef.current)
  }

  if (!isOpen) return null

  const showMentionDropdown = mentionQuery !== null && mentionQuery.length >= 1

  const insertMention = (user: UserSearchResult) => {
    if (!user.username) return
    
    // Prevent tagging oneself
    if (currentUser && user.id === currentUser.id) {
      toast({
        title: "Cannot tag yourself",
        description: "You cannot mention your own username in a discussion.",
        variant: "destructive",
      })
      return
    }
    
    const before = content.slice(0, mentionStart)
    const after = content.slice(mentionStart + 1 + (mentionQuery?.length ?? 0))
    const tag = `@${user.username} `
    setContent(before + tag + after)
    setMentions(prev => Array.from(new Set([...prev, user.id])))
    closeMention()
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)
    const cursor = e.target.selectionStart ?? val.length
    const textBeforeCursor = val.slice(0, cursor)
    const match = textBeforeCursor.match(/@(\S*)$/)
    if (match) {
      setMentionQuery(match[1])
      setMentionStart(cursor - match[0].length)
      setMentionSelectedIndex(0)
    } else {
      closeMention()
    }
  }

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentionDropdown || !mentionResults.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setMentionSelectedIndex(i => Math.min(i + 1, mentionResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setMentionSelectedIndex(i => Math.max(i - 1, 0))
    } else if ((e.key === 'Enter' || e.key === 'Tab') && mentionResults[mentionSelectedIndex]?.username) {
      e.preventDefault()
      insertMention(mentionResults[mentionSelectedIndex])
    } else if (e.key === 'Escape') {
      closeMention()
    }
  }

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return
    // Convert to array BEFORE resetting the input — resetting clears the live FileList
    const fileArray = Array.from(files)
    // Reset input so the same file can be re-selected after an error
    e.currentTarget.value = ''

    fileArray.forEach(async (file) => {
      const id = `file-${Date.now()}-${Math.random()}`
      const attachment: UploadingAttachment = {
        id,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        size: file.size,
        url: '',
        uploadStatus: 'uploading',
      }
      setAttachments(prev => [...prev, attachment])

      try {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post('/file-upload/test', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        const uploadedUrl: string =
          response.data?.url ??
          response.data?.fileUrl ??
          response.data?.data?.url ??
          response.data?.data?.fileUrl ??
          ''
        setAttachments(prev =>
          prev.map(a =>
            a.id === id
              ? { ...a, url: uploadedUrl, uploadStatus: uploadedUrl ? 'uploaded' : 'error' }
              : a
          )
        )
      } catch {
        setAttachments(prev =>
          prev.map(a => a.id === id ? { ...a, uploadStatus: 'error' } : a)
        )
      }
    })
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id))
  }

  const isUploading = attachments.some(a => a.uploadStatus === 'uploading')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim() || !categoryId) {
      toast({
        title: "Incomplete form",
        description: "Please fill in all required fields: title, content, and category.",
        variant: "destructive",
      })
      return
    }

    if (!agreedToGuidelines) {
      toast({
        title: "Guidelines required",
        description: "Please agree to the community guidelines before posting.",
        variant: "destructive",
      })
      return
    }

    if (isUploading) {
      toast({
        title: "Files uploading",
        description: "Please wait for all files to finish uploading before publishing.",
        variant: "default",
      })
      return
    }

    const failedUploads = attachments.filter(a => a.uploadStatus === 'error')
    if (failedUploads.length > 0) {
      toast({
        title: "Upload failed",
        description: `${failedUploads.length} file(s) failed to upload. Please remove them and try again.`,
        variant: "destructive",
      })
      return
    }

    await onSubmit({
      title,
      content,
      categoryId,
      groupId: groupId || undefined,
      attachments,
      attachmentUrls: attachments.filter(a => a.uploadStatus === 'uploaded').map(a => a.url),
      mentions
    })

    // Reset form
    setTitle('')
    setContent('')
    setCategoryId(categories[0]?.id ?? '')
    setGroupId('')
    setAttachments([])
    setMentions([])
    setAgreedToGuidelines(false)
    closeMention()
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
        className="w-full max-w-2xl"
      >
        <Card className="bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <CardHeader className="pb-4 border-b z-20 bg-white shadow-sm flex-shrink-0">
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

          <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto">
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
                <Select
                  variant="student"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="p-3 h-auto"
                  disabled={categoriesLoading || categories.length === 0}
                >
                  {categoriesLoading && <option value="">Loading categories...</option>}
                  {!categoriesLoading && categories.length === 0 && (
                    <option value="">No categories available</option>
                  )}
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
                {(categoriesLoading || categories.length === 0) && (
                  <p className="text-xs text-[#737692] mt-1">
                    {categoriesLoading ? 'Fetching categories...' : 'No category options loaded yet.'}
                  </p>
                )}
              </div>

              {/* Group Selection (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">
                  Group (Optional)
                </label>
                <Select
                  variant="student"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                  className="p-3 h-auto"
                  disabled={groupsLoading}
                >
                  <option value="">No specific group</option>
                  {groupsLoading && <option value="" disabled>Loading groups...</option>}
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </Select>
                {groupsLoading && (
                  <p className="text-xs text-[#737692] mt-1">Fetching groups...</p>
                )}
              </div>

              {/* Content Input */}
              <div className="relative">
                <label className="block text-sm font-semibold text-[#000000] mb-2">
                  Write-up / Subject *
                </label>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  onKeyDown={handleContentKeyDown}
                  placeholder="Share your thoughts, questions, or insights here. Type @username to mention a user"
                  maxLength={5000}
                  required
                  className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D52B1E] resize-vertical min-h-[200px] bg-background text-foreground placeholder:text-muted-foreground ${
                    selectedFont === 'bold' ? 'font-bold' :
                    selectedFont === 'italic' ? 'italic' :
                    selectedFont === 'monospace' ? 'font-mono' : ''
                  }`}
                />
                {/* @mention dropdown */}
                {showMentionDropdown && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-0.5 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {mentionLoading && (
                      <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-[#737692]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching users…
                      </div>
                    )}
                    {!mentionLoading && mentionResults.length === 0 && (
                      <div className="px-3 py-2.5 text-sm text-[#737692]">
                        No users found for &ldquo;{mentionQuery}&rdquo;
                      </div>
                    )}
                    {!mentionLoading && mentionResults.length > 0 && (
                      <div className="px-3 py-2 text-xs text-[#737692] border-b border-gray-100">
                        {mentionResults.length} result{mentionResults.length === 1 ? '' : 's'} found. Use arrows to navigate and Enter to select.
                      </div>
                    )}
                    <ul className="max-h-60 overflow-y-auto">
                      {mentionResults.map((user, idx) => {
                        const isCurrentUser = currentUser && user.id === currentUser.id
                        return (
                          <li key={user.id}>
                            <button
                              type="button"
                              disabled={!user.username || isCurrentUser}
                              onMouseDown={(e) => { e.preventDefault(); insertMention(user) }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                                isCurrentUser 
                                  ? 'bg-gray-50 opacity-60 cursor-not-allowed' 
                                  : idx === mentionSelectedIndex ? 'bg-red-50' : 'hover:bg-gray-50'
                              }`}
                            >
                            <div className="h-7 w-7 rounded-full bg-[#D52B1E] flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {user.profilePhotoUrl ? (
                                <img src={user.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xs text-white font-semibold">
                                  {(user.firstName?.[0] ?? user.username?.[0] ?? '?').toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              {(user.firstName || user.lastName) && (
                                <p className="text-sm font-medium text-[#000000] truncate leading-tight">
                                  {[user.firstName, user.lastName].filter(Boolean).join(' ')}
                                </p>
                              )}
                              <p className="text-xs text-[#737692] truncate">
                                {user.username ? `@${user.username}` : 'No username available'}
                                {isCurrentUser && <span className="text-xs text-[#737692] ml-1">(you)</span>}
                              </p>
                            </div>
                          </button>
                        </li>
                      )
                      })}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-[#737692] mt-1">{content.length}/5000 characters</p>
              </div>

              {/* Rich Text Tools */}
              <div className="flex gap-2 flex-wrap">
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-2">Font Style</label>
                  <Select
                    variant="student"
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="p-2 h-auto"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="italic">Italic</option>
                    <option value="monospace">Code</option>
                  </Select>
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-semibold text-[#000000] mb-2">
                  File Attachments
                </label>
                <label className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 transition-all ${
                  attachments.length >= 5
                    ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    : 'border-gray-200 cursor-pointer hover:border-[#D52B1E] hover:bg-red-50'
                }`}>
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
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {attachments.map(att => (
                      <div key={att.id} className={`flex items-center justify-between p-2.5 rounded-lg ${
                        att.uploadStatus === 'error' ? 'bg-red-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 min-w-0">
                          {att.uploadStatus === 'uploading' && (
                            <Loader2 className="h-4 w-4 text-[#D52B1E] animate-spin flex-shrink-0" />
                          )}
                          {att.uploadStatus === 'uploaded' && (
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                          {att.uploadStatus === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          )}
                          <span className="text-sm text-[#000000] truncate">
                            {att.type === 'image' ? '🖼️' : '📎'} {att.name}
                          </span>
                          {att.uploadStatus === 'uploading' && (
                            <span className="text-xs text-[#737692] flex-shrink-0">Uploading...</span>
                          )}
                          {att.uploadStatus === 'error' && (
                            <span className="text-xs text-red-600 flex-shrink-0">Upload failed</span>
                          )}
                        </div>
                        <button type="button" onClick={() => handleRemoveAttachment(att.id)} className="text-gray-400 hover:text-red-600 transition-colors ml-2 flex-shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  disabled={!title.trim() || !content.trim() || !agreedToGuidelines || isUploading}
                  className="flex-1 bg-[#D52B1E] hover:bg-[#B8241B] text-white disabled:opacity-50"
                >
                  {isUploading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading files...
                    </span>
                  ) : 'Publish Discussion'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  )
}
