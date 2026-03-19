import { motion } from 'framer-motion'
import { ArrowLeft, Heart, Share2, Bookmark, Flag, MessageSquare, Eye, ThumbsUp, Clock, Pin, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState, useRef } from 'react'
import type { DetailedDiscussionPost, Reply } from '@/types/community'
import PosterProfilePopup from './PosterProfilePopup'
import { communityService } from '@/lib/communityService'

interface DiscussionDetailPageProps {
  post: DetailedDiscussionPost
  onBack: () => void
  isModerator?: boolean
  currentUserId?: string
  initialIsLiked?: boolean
  initialLikeInteractionId?: string
  onPin?: (postId: string) => void
  onDelete?: (postId: string) => void
}

const categoryColors: Record<string, string> = {
  'Markets & Investing': 'bg-[#D52B1E]',
  'Savings': 'bg-blue-600',
  'Zakat': 'bg-green-600',
  'Every day islamic finance': 'bg-orange-600',
  'General Discussion': 'bg-purple-600',
  'Q&A': 'bg-yellow-600',
  'Resources': 'bg-indigo-600'
}

export default function DiscussionDetailPage({
  post,
  onBack,
  isModerator = false,
  currentUserId,
  initialIsLiked = false,
  initialLikeInteractionId,
  onPin,
  onDelete
}: DiscussionDetailPageProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isSaved, setIsSaved] = useState(post.isSaved ?? false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [showPosterProfile, setShowPosterProfile] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replies, setReplies] = useState<Reply[]>(post.repliesList || [])
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const likeInteractionId = useRef<string | null>(initialLikeInteractionId ?? null)

  const handleLike = async () => {
    const nowLiked = !isLiked
    setIsLiked(nowLiked)
    setLikeCount(prev => nowLiked ? prev + 1 : prev - 1)
    try {
      if (nowLiked) {
        const interaction = await communityService.createInteraction(post.id, { type: 'like' })
        likeInteractionId.current = interaction.id
      } else if (likeInteractionId.current) {
        await communityService.deleteInteraction(likeInteractionId.current)
        likeInteractionId.current = null
      }
    } catch {
      // revert on error
      setIsLiked(!nowLiked)
      setLikeCount(prev => nowLiked ? prev - 1 : prev + 1)
    }
  }

  const handleSave = async () => {
    const nowSaved = !isSaved
    setIsSaved(nowSaved)
    try {
      await communityService.toggleBookmark(post.id)
    } catch {
      setIsSaved(!nowSaved)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/community/${post.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: url
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  const handleAddReply = async () => {
    if (!replyText.trim() || isSubmittingReply) return
    setIsSubmittingReply(true)
    try {
      await communityService.createInteraction(post.id, {
        type: 'comment',
        content: replyText,
      })
      setReplyText('')
      // Re-fetch to get real-time reply state (catches concurrent replies too)
      const fresh = await communityService.getDiscussionById(post.id)
      const freshReplies = fresh.interactions
        .filter((i) => i.type === 'comment')
        .map((i) => ({
          id: i.id,
          postId: post.id,
          userId: i.user?.id ?? '',
          userName:
            [i.user?.firstName, i.user?.lastName].filter(Boolean).join(' ') ||
            'Member',
          userAvatar: i.user?.profilePhotoUrl ?? '👤',
          userTitle: i.user?.role ?? 'Member',
          content: i.content ?? '',
          createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
          updatedAt: new Date(),
          likes: 0,
          isAuthor: i.user?.id === currentUserId,
        }))
      setReplies(freshReplies)
    } catch {
      // silent fail — keep text so user can retry
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const hoursAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (hoursAgo === 0) {
      const minutesAgo = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${minutesAgo}m ago`
    } else if (hoursAgo < 24) {
      return `${hoursAgo}h ago`
    } else if (hoursAgo < 168) {
      const daysAgo = Math.floor(hoursAgo / 24)
      return `${daysAgo}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Back Button */}
      <motion.button
        onClick={onBack}
        className="flex items-center gap-2 text-[#D52B1E] hover:text-[#B8241B] font-medium transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Discussions
      </motion.button>

      {/* Main Post Card */}
      <Card className="border-0 shadow-lg">
        {/* Header with Category and Moderation Tools */}
        <CardHeader className="pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h1 className="text-3xl font-bold text-[#000000]">{post.title}</h1>
                {post.isPinned && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
              </div>
              <Badge className={`${categoryColors[post.category]} text-white hover:${categoryColors[post.category]}`}>
                {post.category}
              </Badge>
            </div>
            
            {/* Moderation Tools */}
            {isModerator && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onPin?.(post.id)}
                  className="flex items-center gap-2"
                >
                  <Pin className="h-4 w-4" />
                  {post.isPinned ? 'Unpin' : 'Pin'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete?.(post.id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        {/* Post Metrics and Poster Info */}
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            {/* Poster Section */}
            <div className="flex items-start gap-4 pb-6 border-b">
              <button
                onClick={() => setShowPosterProfile(true)}
                className="flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-3xl shadow-md cursor-pointer overflow-hidden">
                  {post.posterDetails.displayPicture?.startsWith('http')
                    ? <img src={post.posterDetails.displayPicture} alt={post.poster} className="h-full w-full object-cover" />
                    : <span>{post.posterDetails.displayPicture || '👤'}</span>}
                </div>
              </button>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setShowPosterProfile(true)}
                  className="text-lg font-semibold text-[#000000] hover:text-[#D52B1E] transition-colors"
                >
                  {post.poster}
                </button>
                <p className="text-sm text-[#737692]">{post.posterDetails.title}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#737692]">
                  <span>📅 {post.createdAt.toLocaleDateString()}</span>
                  <span>⏱️ {formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-[#000000] whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-[#000000]">Attachments</h3>
                <div className="grid grid-cols-1 gap-4">
                  {post.attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      className="relative bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {attachment.type === 'image' ? (
                        <img src={attachment.url} alt={attachment.name} className="w-full h-auto max-h-96 object-cover" />
                      ) : (
                        <div className="p-4 flex items-center gap-2">
                          <span>📎</span>
                          <span className="text-sm text-[#737692]">{attachment.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post Metrics */}
            <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-[#000000]">{post.views}</p>
                <p className="text-xs text-[#737692] flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" />
                  Views
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#000000]">{post.replies}</p>
                <p className="text-xs text-[#737692] flex items-center justify-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Replies
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#000000]">{likeCount}</p>
                <p className="text-xs text-[#737692] flex items-center justify-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  Likes
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#000000]">{post.shares}</p>
                <p className="text-xs text-[#737692] flex items-center justify-center gap-1">
                  <Share2 className="h-3 w-3" />
                  Shares
                </p>
              </div>
              {post.lastReply && (
                <div className="text-center">
                  <p className="text-xs text-[#737692] flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3" />
                  </p>
                  <p className="text-xs text-[#737692]">Last reply {formatDate(post.lastReply.createdAt)}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button
                variant={isLiked ? 'default' : 'outline'}
                onClick={handleLike}
                className={`flex items-center gap-2 ${isLiked ? 'bg-red-100 text-[#D52B1E] hover:bg-red-200' : 'border-gray-200'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                Like
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2 border-gray-200"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant={isSaved ? 'default' : 'outline'}
                onClick={handleSave}
                className={`flex items-center gap-2 ${isSaved ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'border-gray-200'}`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-gray-200 text-orange-600 hover:text-orange-700"
              >
                <Flag className="h-4 w-4" />
                Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-[#000000]">
          Replies ({replies.length})
        </h2>

        {/* Reply Input Box */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply here... (You can use @username to mention others)"
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-[#000000] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D52B1E] resize-none"
                rows={4}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddReply}
                  disabled={!replyText.trim() || isSubmittingReply}
                  className="bg-[#D52B1E] hover:bg-[#B8241B] text-white disabled:opacity-50"
                >
                  {isSubmittingReply ? 'Posting…' : 'Post Reply'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies List */}
        <div className="space-y-4">
          {replies.length > 0 ? (
            replies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                        {reply.userAvatar?.startsWith('http')
                          ? <img src={reply.userAvatar} alt={reply.userName} className="h-full w-full object-cover" />
                          : <span>{reply.userAvatar || '👤'}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#000000]">{reply.userName}</span>
                          <span className="text-xs text-[#737692]">{reply.userTitle}</span>
                          {reply.isAuthor && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs hover:bg-blue-100">
                              Author
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-[#737692] mb-3">{formatDate(reply.createdAt)}</p>
                        <p className="text-[#000000] whitespace-pre-wrap">{reply.content}</p>
                        <div className="flex gap-4 mt-3 text-xs text-[#737692]">
                          <button className="hover:text-[#D52B1E] transition-colors flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            Like ({reply.likes})
                          </button>
                          <button className="hover:text-[#D52B1E] transition-colors">Reply</button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-[#737692]">No replies yet. Be the first to respond!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Poster Profile Popup */}
      <PosterProfilePopup
        user={post.posterDetails}
        isOpen={showPosterProfile}
        onClose={() => setShowPosterProfile(false)}
      />
    </motion.div>
  )
}
