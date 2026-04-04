import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, CheckCircle, X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DownloadEmailModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly resourceTitle: string
  readonly onSubmit?: (email: string) => Promise<void> | void
}

export function DownloadEmailModal({ open, onClose, resourceTitle, onSubmit }: DownloadEmailModalProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const emailIsValid = (value: string) => /\S+@\S+\.\S+/.test(value)

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) return
    if (!emailIsValid(email.trim())) {
      setError('Enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      if (onSubmit) {
        await onSubmit(email.trim())
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      setSubmitted(true)
    } catch {
      setError('Unable to complete download. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setSubmitted(false)
    setError('')
    onClose()
  }

  if (!open) return null

  return (
    <>
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[#D52B1E]" />
              <h3 className="font-bold text-slate-800 text-lg">Download Resource</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-4"
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#000000] mb-2">Thank You!</h4>
                  <p className="text-sm text-[#737692]">
                    You will receive the document in your email shortly.
                  </p>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="mt-4 border-[#D52B1E] text-[#D52B1E] hover:bg-[#FFEFEF]"
                  >
                    Close
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="text-sm text-[#737692] mb-1">
                    Enter your email to receive the full document:
                  </p>
                  <p className="text-sm font-medium text-[#000000] mb-4 line-clamp-2">
                    "{resourceTitle}"
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737692]" />
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          if (error) setError('')
                        }}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-600">{error}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="w-full h-12 bg-[#D52B1E] hover:bg-[#B82318] text-white"
                    >
                      {isSubmitting ? 'Sending...' : 'Submit'}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}
