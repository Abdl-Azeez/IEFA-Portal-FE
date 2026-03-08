import { motion } from 'framer-motion'
import { X, Calendar, FileText, Eye, MessageSquare, Heart, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UserProfile } from '@/types/community'

interface PosterProfilePopupProps {
  user: UserProfile
  isOpen: boolean
  onClose: () => void
}

export default function PosterProfilePopup({ user, isOpen, onClose }: PosterProfilePopupProps) {
  if (!isOpen) return null

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
        className="w-full max-w-md"
      >
        <Card className="bg-white shadow-xl">
          <CardContent className="p-6">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>

            {/* Profile Content */}
            <div className="space-y-6">
              {/* Display Picture & Name */}
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#D52B1E] to-[#6F1610] flex items-center justify-center text-5xl mb-4 shadow-lg">
                  {user.displayPicture}
                </div>
                <h2 className="text-2xl font-bold text-[#000000]">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="text-sm text-[#737692]">{user.title}</p>
                  {user.isVerified && (
                    <div title="Verified">
                      <Award className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-[#737692] justify-center">
                <Calendar className="h-4 w-4" />
                <span>Joined {user.joinedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-sm text-[#737692] text-center italic">
                  "{user.bio}"
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-[#D52B1E]" />
                    <span className="text-lg font-bold text-[#000000]">{user.totalPosts}</span>
                  </div>
                  <p className="text-xs text-[#737692]">Posts</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Eye className="h-4 w-4 text-[#D52B1E]" />
                    <span className="text-lg font-bold text-[#000000]">{user.totalViews.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-[#737692]">Views</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-[#D52B1E]" />
                    <span className="text-lg font-bold text-[#000000]">{user.totalReplies}</span>
                  </div>
                  <p className="text-xs text-[#737692]">Replies</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Heart className="h-4 w-4 text-[#D52B1E]" />
                    <span className="text-lg font-bold text-[#000000]">{user.totalLikes}</span>
                  </div>
                  <p className="text-xs text-[#737692]">Likes</p>
                </div>
              </div>

              {/* Rating */}
              {user.rating !== undefined && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(user.rating!) ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-[#737692] mt-1">{user.rating?.toFixed(1)} / 5.0</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1 border-gray-200">
                  View Profile
                </Button>
                <Button className="flex-1 bg-[#D52B1E] hover:bg-[#B8241B] text-white">
                  Message
                </Button>
              </div>

              {user.isModerator && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-blue-700">Community Moderator</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
